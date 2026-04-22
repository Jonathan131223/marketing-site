---
name: library-import
description: Import a brand's marketing emails from Gmail into the DigiStorms library. Takes a brand name + sender email/domain, fetches every matching email, renders mobile-viewport screenshots with Playwright, categorizes each email holistically (order matters — first emails = onboarding, "we'll miss you" = win-back), writes a new brand page and N email pages to the library JSON, and commits + pushes to main for auto-deploy. Invoke when the user says "import {brand} emails", "add {brand} to the library", or runs `/library-import`.
---

# /library-import — Automated Gmail → Library Page pipeline

## Goal

One conversation, one brand imported. The user supplies a brand name and sender address; you produce new live library pages at `/library/brand/{slug}` and `/library/email/{slug}` × N.

## Required inputs

Parse from the user message:

- `brand` — display name (required). Derive `brand-slug` via kebab-case ("Wispr Flow" → `wispr-flow`).
- `sender` — required; either a full address (`team@wisprflow.ai`) or a bare domain (`wisprflow.ai`). Becomes the Gmail `from:` query.

Optional:

- `limit=N` — cap at first N emails (sorted ascending by date). Default: no cap.
- `dry-run` — skip git commit/push; still write JSON + screenshots locally.

If either required arg is missing, ask via `AskUserQuestion`. Do not invent defaults.

## Pre-flight checks

1. Load the current library data from `src/data/library/brands.json`. If `brand-slug` already exists → **abort** and tell the user. (Re-imports / append mode is a v2 feature.)
2. Load `src/data/library/usecases.json` and `tags.json`. Keep the allowed slug lists in working memory for strict-mode validation during categorization.

## Phase A — Fetch from Gmail

Run the dedicated fetch script — it authenticates to the Gmail API (not the MCP) and writes the authentic `text/html` body for each email to the cache:

```
node scripts/library-import/fetch-gmail-html.mjs --brand={brand-slug} --sender={addr-or-domain} [--limit=N]
```

Do NOT use the Gmail MCP tools for this — they only expose `plaintextBody`, which forces a reconstruction step that produces inauthentic screenshots. The direct API returns the structured `payload.parts` tree and we pull the real `text/html` part out of it.

**One-time OAuth bootstrap (first run only):** the script looks for `~/.gmail-client-secret.json`. If missing, it prints the setup instructions (create a Desktop-app OAuth client in Google Cloud Console, enable the Gmail API, download the JSON to that path). Subsequent runs reuse the cached refresh token at `~/.gmail-token.json`. This mirrors the GSC tooling in `scripts/gsc/query.mjs`.

What the script does:
1. `from:{sender}` query (bare domain → `from:@{sender}`), paginates threads exhaustively.
2. `threads.get(format='FULL')` for each; filters messages to those actually from `{sender}` (skips replies/forwards).
3. Sorts ascending by internal date, applies `--limit` if passed.
4. For each selected message: walks `payload.parts` recursively, decodes the base64url `text/html` body, writes `.cache/library-import/{brand-slug}/{msgId}.html`. Falls back to `text/plain` wrapped in a `<pre>` only if `text/html` is absent (rare — the script warns).
5. Emits `.cache/library-import/{brand-slug}/manifest.json` — array of `{slug, subject, sender, date, bodyFile, plainTextPreview}`. `slug` is a **placeholder** (`{brand-slug}-{YYYYMMDD}-{short-msg-id}`); it gets overwritten with the final `{primary-tag}-from-{brand}-{MMDDYYYY}` in Phase C. `bodyFile` is stable — do NOT rename the HTML file when you update the slug.

⚠ The cache dir is gitignored; never commit it.

### Slug pre-assignment note

The final slug depends on the primary tag chosen in categorization, so the manifest initially ships placeholders. Workflow: categorize first (Phase B), rewrite each manifest entry's `slug` field to the final form, then render (Phase C) so the PNGs land at the final filenames directly and no renames are needed.

## Phase B — Analyze & categorize

You (the agent) read the manifest and all plainTextPreview entries at once, in date-ascending order, and assign each email:

- Exactly ONE `useCase` from the 9 canonical slugs (see `src/data/library/usecases.json`).
- 2–3 `tags` from the existing tag taxonomy (see `src/data/library/tags.json`). The FIRST tag you list becomes the slug prefix, so pick the most-specific/most-distinctive tag first.
- An `summary` — one to two sentences, matching the tone and depth of existing summaries in `emails.json`. Describe what the email does and how, not just what it looks like.
- A `templateTitle` — short marketing name (e.g. "Welcome to Premium", "Trial ending in 3 days").

### Holistic reasoning signals

- **Position**: first emails after a signup are onboarding (free or paid). Steady weekly/monthly cadence after onboarding is usually `educate-engage`. A gap followed by a reactivation email is `win-back-churned-user`.
- **Content**: "Welcome", "get started", "free trial" → `onboard-free-user`; "Thanks for upgrading", "Welcome to Premium", explicit post-payment framing → `onboard-paid-user`; "we'll miss you", "it's been a while" → `win-back-churned-user`; "Introducing…", "New in X" → `announce-new-features`; webinar/course/ebook promos → `educate-engage`; "1 year anniversary", "you hit N milestone" → `celebrate-milestones`; NPS, survey, "Tell us how we're doing" → `request-feedback`; upgrade/expand/upsell → `expand-user`; receipts, password resets, billing notices → `transactional-email`.

### Strict taxonomy

Use ONLY slugs that exist in `usecases.json` and `tags.json`. If an email truly doesn't fit, force-fit to the closest existing slug AND add a line to the commit body like `⚠ {subject} — force-fit ({useCase} / [tags]) — possible mismatch` so the user can spot-check live. Never invent new slugs.

### Brand-level narrative

Write three fields for the new brand:
- `summary` — HTML with two `<p>` paragraphs. Describe the brand's email-marketing approach, cadence, and what's distinctive. Model on existing entries in `brands.json` (e.g. Adobe, Ahrefs entries).
- `description` — leave empty string (matches existing convention).
- `metaDesc` — 155 chars max, SEO-friendly.

## Phase C — Render screenshots

Update the manifest with final slugs and final filenames, then run:

```
npm run lib:render -- --brand={brand-slug}
```

Verify the output: `public/email-screenshots/*-from-{brand-slug}-*.png` should contain N PNGs at 490×1014.

If any rendered PNG looks obviously wrong (all-white, cut off), re-render just that slug via `--only={slug}`.

## Phase D — Write JSON

Build a payload file at `.cache/library-import/{brand-slug}/payload.json`:

```jsonc
{
  "brand": {
    "slug": "{brand-slug}",
    "name": "{Display Name}",
    "domain": "{domain}",      // for favicon fetch
    "sender": "{sender}",
    "summary": "<p>...</p><p>...</p>",
    "description": "",
    "metaDesc": "..."
  },
  "emails": [
    {
      "subject": "...",
      "sender": "Name from Brand",
      "date": "2025-07-15T12:00:00Z",
      "useCase": "onboard-free-user",
      "tags": ["welcome-free-users", "onboarding-checklist"],
      "summary": "...",
      "templateTitle": "..."
    }
  ]
}
```

Then:

```
npm run lib:write -- --payload=.cache/library-import/{brand-slug}/payload.json
```

The script writes to both `src/data/library/` and `public/data/library/`, fetches a favicon and stores it at `public/logos/{brand-slug}.{ext}`, and echoes a summary with canonical URLs.

## Phase E — Verify

Run in parallel (they're independent):

```
npm test
npm run build
```

Expectations:
- Tests pass (existing blog + email generator regression tests).
- Build exits 0.
- `dist/library/brand/{brand-slug}/index.html` exists.
- `dist/library/email/{email-slug}/index.html` exists for each email.
- `dist/sitemap-library.xml` includes the new URLs.

If either fails, investigate and fix before proceeding. Do NOT commit broken state.

## Phase F — Deploy (skip if `--dry-run`)

```
git add src/data/library/*.json public/data/library/*.json public/email-screenshots/*.png public/logos/*
git commit -m "feat(library): import {Brand Name} — {N} emails" -m "<details per email: subject → useCase + [tags]; any ⚠ force-fits>"
git push origin main
```

Vercel auto-deploys. Report the canonical URLs to the user:
- `https://www.digistorms.ai/library/brand/{brand-slug}`
- `https://www.digistorms.ai/library/email/{email-slug}` × N

## Guardrails

- **Never** invent taxonomy slugs. If the strict validation in `write-data.mjs` fails, fix the payload — don't edit `tags.json` / `usecases.json`.
- **Never** commit the `.cache/library-import/` contents.
- **Never** skip the test/build verification.
- If you see > 50 emails for one brand, pause and confirm with the user before committing (repo size grows ~150KB per PNG).
- If favicon fetch fails, proceed with empty `logo` — don't block the whole import on it. Note in commit body.

## Invocation example

```
/library-import brand="Wispr Flow" sender="team@wisprflow.ai" limit=5
```

Final status should read something like:
> Imported **5 emails** from Wispr Flow. Commit `abc1234` pushed to main; Vercel deploy in progress. Live at /library/brand/wispr-flow.
