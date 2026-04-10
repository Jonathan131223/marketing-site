# TODOS

## /example/{product} — "See an example" page
**What:** Dedicated page showing a pre-generated onboarding sequence for a real SaaS product (e.g., Notion, Calendly). Linked from the homepage hero section.
**Why:** Reduces friction. Visitors see DigiStorms output BEFORE entering their own URL. Highest-leverage conversion feature from CEO review.
**Context:** Accepted as scope expansion in /plan-ceo-review on 2026-04-08. The homepage hero will have a "See what DigiStorms generates for a real product" text link below the free note. This page is the destination for that link. Should be SEO-indexable and shareable. Generate the example using the actual DigiStorms engine, then hardcode the output as static content.
**Effort:** S (human: ~4hr / CC: ~30min)
**Priority:** P1 (ship within 1 week of homepage launch)
**Depends on:** Homepage redesign shipped, generation engine producing reliable output for the chosen example product.

## Demo video / GIF
**What:** 15-20 second screen recording showing the DigiStorms generation flow (paste URL, analysis, emails appear). Replaces static screenshots in How It Works section.
**Why:** More engaging and believable than static images. One asset replaces three screenshots.
**Context:** Proposed in CEO review, skipped because the product isn't ready for recording yet. Revisit when the generation engine is stable.
**Effort:** M (recording + optimization + embedding)
**Priority:** P2 (after product stabilizes)
**Depends on:** Generation engine working reliably.

## QA pass 2026-04-10 — all 8 issues shipped ✅

The 2026-04-10 /qa audit found 8 issues. All are fixed and on
`claude/elastic-hopper`. ISSUE-001/002/003 first, then 004/005/006/008 in
a batch, then 007 (test framework + regression test).

| ID | Severity | Commit | Summary |
|---|---|---|---|
| 001 | Critical | `ade5103` (then superseded by 005) | `/email-generator` blank → HelmetProvider added, then Helmet removed entirely |
| 002 | High | `65920de` | Dead Typekit kit + CSP entries removed (CSP error on every page) |
| 003 | Medium | `b47174f` | Mobile homepage horizontal overflow (Grammarly logo) |
| 004 | Medium | `7aebb0c` | Email generator sub-route empty-state UX (no more silent redirects) |
| 005 | Low | `7aebb0c` | Removed redundant `<Helmet>` from UseCasePickerPage |
| 006 | Low | `7aebb0c` | react-router v7 future flags |
| 008 | Low | `7aebb0c` | `VITE_APP_BASE_URL` → `PUBLIC_APP_BASE_URL` (dev-mode hydration) |
| 007 | P1 tech debt | `d190273` | vitest + @testing-library/react bootstrap, 3 regression tests, wired into CI |

Full report: `.gstack/qa-reports/qa-report-digistorms-ai-2026-04-10.md`
