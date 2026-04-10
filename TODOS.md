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

## Email generator sub-routes — empty-state UX (ISSUE-004 from /qa)
**What:** `/email-generator/brief`, `/templates`, `/generate`, `/customize` silently `navigate("/email-generator")` when there's no workflow state. Replace with a friendly empty state CTA that explains "Pick a use case first" and links to the picker, OR set `<meta name="robots" content="noindex">` so search engines don't index 4 duplicates of the picker.
**Why:** Deep links from email campaigns or shared URLs dump users on the picker with no explanation. Also bad for SEO — Google sees four URLs that all render identical content.
**Effort:** S (human: ~30min / CC: ~10min)
**Priority:** P2
**Found by:** /qa on 2026-04-10, deferred from this run.

## react-router-dom v7 future flags (ISSUE-006 from /qa)
**What:** Add `v7_startTransition: true` and `v7_relativeSplatPath: true` to the `BrowserRouter` future-flags object in `EmailGeneratorApp.tsx` to silence deprecation warnings and prepare for v7.
**Why:** Two console warnings on every email generator page load. Mechanical fix.
**Effort:** XS (CC: ~5min)
**Priority:** P3

## Pick one source of truth for /email-generator meta tags (ISSUE-005 from /qa)
**What:** `BaseLayout.astro` sets `<title>` from props server-side; `UseCasePickerPage.tsx` then overwrites it client-side via `<Helmet>`. There's a brief flicker where the title swaps after hydration. Either delete `<Helmet>` from the React page (since each Astro sub-route already passes its own title to BaseLayout) or stop setting the title in BaseLayout for these routes.
**Why:** Cleaner code, no flicker, less duplication.
**Effort:** XS (CC: ~10min)
**Priority:** P3

## Add automated tests (ISSUE-007 from /qa)
**What:** Bootstrap vitest + @testing-library/react. First test should be a smoke test that mounts `<EmailGeneratorApp initialPath="/email-generator" />` and asserts the H1 renders without throwing — exactly the bug fixed in `ade5103`. Then a thin Playwright suite for 5 critical routes (`/`, `/email-generator`, `/pricing`, `/contact`, `/library`).
**Why:** Without tests, ISSUE-001 (a critical production crash) shipped silently. The exact test that would have caught it is one assertion. CI minutes are cheap; broken headline features are not.
**Effort:** S (human: ~4hr / CC: ~30min including CI)
**Priority:** P1
