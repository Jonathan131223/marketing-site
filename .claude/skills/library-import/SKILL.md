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

Use the Gmail MCP tools (`mcp__cdd89778-*__search_threads` + `get_thread`) — they're already configured in this environment.

1. Query: `from:{sender}` (if `sender` is a bare domain, use `from:@{sender}`). Paginate `search_threads` until exhausted.
2. For each thread, call `get_thread` to fetch messages with full HTML bodies.
3. Drop messages not actually from the target sender (threads may contain replies/forwards).
4. Sort messages ascending by internal `date`.
5. If `limit=N` was passed, keep the first N.
6. For each message, extract `subject`, `from` (display name + address), internal `date`, and the `text/html` part. Save to:
   - `.cache/library-import/{brand-slug}/{YYYYMMDD-HHMMSS}-{short-msg-id}.html` — raw HTML body
   - `.cache/library-import/{brand-slug}/manifest.json` — array of `{slug, subject, sender, date, bodyFile, plainTextPreview}` where `slug` is placeholder-computed (brand-slug + date + a temporary tag suffix — it will be finalized after Phase C, but needs to exist for Phase B). Preview = first ~1,500 chars of HTML-stripped text.

⚠ The cache dir is gitignored; never commit it.

### Slug pre-assignment note

The final slug is `{primary-tag}-from-{brand}-{MMDDYYYY}` where `primary-tag` is the first tag assigned in Phase C. So Phase B can't render to the final filename yet. Workaround: Phase B renders from the manifest's placeholder slug; then `write-data.mjs` recomputes the final slug from the chosen tags, and a final step renames/copies the PNGs to their final slug names.

Simpler workflow that avoids renames: run Phase C (categorization) BEFORE Phase B (screenshots). That way the manifest already has final slugs when rendering happens. Prefer this order.

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
