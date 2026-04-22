# Library import pipeline

Automates adding a brand's email library from a Gmail inbox. Orchestrated by the `/library-import` slash command (see `.claude/skills/library-import/SKILL.md`); the scripts here are the mechanical pieces that command invokes.

## Scripts

- `helpers.mjs` — slug/date/ID utilities, library JSON load/write, favicon fetch
- `fetch-gmail-html.mjs` — OAuth2-authed Gmail API client: pulls the authentic `text/html` part of every message from `from:{sender}`, writes `.cache/library-import/{brand}/{msgId}.html` + `manifest.json`. Uses the `googleapis` SDK (already a devDependency); OAuth token cached at `~/.gmail-token.json`.
- `render-screenshots.mjs` — Playwright renderer: `.cache/library-import/{brand}/*.html` → `public/email-screenshots/{slug}.png` at 490×1014
- `write-data.mjs` — upserts brand + email entries into `brands.json`/`emails.json`/`usecases.json` across both `src/data/library/` and `public/data/library/` (they're kept in sync until Phase 3)

## Contracts

### Cache layout (produced by the skill, consumed by `render-screenshots.mjs`)

```
.cache/library-import/{brand-slug}/
  manifest.json         # array of {slug, bodyFile, subject, sender, date, plainTextPreview}
  20250715-ab12cd.html  # raw HTML bodies, one per email
  ...
```

### Payload contract (consumed by `write-data.mjs`)

```jsonc
{
  "brand": {
    "slug": "wispr-flow",
    "name": "Wispr Flow",
    "domain": "wisprflow.ai",        // optional; used for favicon fetch
    "sender": "team@wisprflow.ai",   // optional; fallback for domain
    "summary": "<p>...</p>",          // HTML, ~2 paragraphs
    "description": "",
    "metaDesc": "155 chars max"
  },
  "emails": [
    {
      "subject": "Welcome to Wispr",
      "sender": "Sarah from Wispr",
      "date": "2025-07-15T12:00:00Z",  // any Date-parseable string
      "useCase": "onboard-free-user",   // must exist in usecases.json
      "tags": ["welcome-free-users"],   // all must exist in tags.json
      "summary": "AI-written ~2 sentence description",
      "templateTitle": "Welcome to Wispr"
    }
  ]
}
```

Emails are sorted ascending by date before slug derivation and insertion. Slug pattern: `{tags[0]}-from-{brand-slug}-{MMDDYYYY}` (matches existing entries).

## Flags

Both scripts accept `--dry-run`. `render-screenshots.mjs` also accepts `--only=slug1,slug2` for targeted re-rendering.

## Invocation

```
node scripts/library-import/fetch-gmail-html.mjs --brand=wispr-flow --sender=hello@mail.wispr.ai
node scripts/library-import/render-screenshots.mjs --brand=wispr-flow
node scripts/library-import/write-data.mjs --payload=.cache/library-import/wispr-flow/payload.json
```

Convenience wrappers are registered as `npm run lib:fetch`, `npm run lib:render`, and `npm run lib:write`.
