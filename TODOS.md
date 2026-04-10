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

## Completed

### QA pass + email generator tab layout — v0.1.0.0 (2026-04-10)

The 2026-04-10 /qa audit found 8 issues. A follow-up redesign then rebuilt
the email generator landing page as a tab layout (Activation open by default,
all 38 use cases discoverable in one click).

| ID | Severity | Summary |
|---|---|---|
| 001 | Critical | `/email-generator` blank → HelmetProvider added, then Helmet removed entirely so Astro is the single source of truth for meta tags |
| 002 | High | Dead Typekit kit + CSP entries removed (CSP error on every page of the site) |
| 003 | Medium | Mobile homepage horizontal overflow (Grammarly logo constraint) |
| 004 | Medium | Email generator sub-route empty-state UX (no more silent redirects + `noindex` on 4 sub-routes) |
| 005 | Low | Removed redundant `<Helmet>` from UseCasePickerPage |
| 006 | Low | react-router v7 future flags |
| 007 | P1 tech debt | vitest + @testing-library/react bootstrap, 12 regression specs, wired into CI |
| 008 | Low | `VITE_APP_BASE_URL` → `PUBLIC_APP_BASE_URL` (dev-mode hydration) |
| Redesign | Feature | Tab layout on `/email-generator` — all 6 categories visible, Activation open by default, one click to switch |

**Completed:** v0.1.0.0 (2026-04-10)

Full QA report: `.gstack/qa-reports/qa-report-digistorms-ai-2026-04-10.md`

## Tech debt (follow-ups discovered during v0.1.0.0 ship review)

These are real but out of scope for the current PR. Grouped by severity.

### `useStateRestoration` ships console.log statements to production
**What:** `src/hooks/useStateRestoration.ts` has 8 `console.log` calls that run on every email generator page mount. Some dump full brief data (companyName, productName, senderName) which is PII.
**Why:** Pollutes user devtools, leaks PII, obscures real errors in bug reports.
**Fix:** Wrap in `if (import.meta.env.DEV)` or replace with a `debug` namespace that ships disabled.
**Effort:** XS (CC: ~10min)
**Priority:** P2

### Dead imports in TestimonialSection
**What:** `src/components/homepage/TestimonialSection.tsx:2-3` imports `drewPriceImage` and `grammarlyLogo` but the JSX uses raw string paths from `/images/`. Dead imports cause vite to bundle unused assets.
**Fix:** Delete the imports, or switch to the imported hashed URLs (cache-busting).
**Effort:** XS (CC: ~5min)
**Priority:** P3

### `initialPath` prop on EmailGeneratorApp is dead
**What:** `src/components/react/EmailGeneratorApp.tsx` accepts `initialPath` from all 5 Astro pages but never uses it. BrowserRouter reads `window.location` directly.
**Fix:** Delete the prop and remove from the 5 Astro callers, OR wire it through to MemoryRouter when provided.
**Effort:** XS (CC: ~15min)
**Priority:** P3

### Email generator history/badge undo bug
**What:** `CustomizePage.tsx` history-init and badge-init effects interact such that undo from the first edit reverts to pre-badge content, hiding the DigiStorms badge without the user ever seeing it applied.
**Fix:** Reorder effects so badge init runs before history init, or include post-badge content in the initial history entry.
**Effort:** S (CC: ~30min)
**Priority:** P1 (user-visible bug on the customize page)

### Tab keyboard navigation incomplete
**What:** `UseCasePickerPage.tsx` tablist has correct ARIA roles but no arrow-key navigation. Screen reader users get 6 focus stops instead of 1 with arrow-key movement (WAI-ARIA tabs pattern).
**Fix:** Add `onKeyDown` handler to intercept ArrowLeft/Right/Home/End. Set `tabIndex={isActive ? 0 : -1}`.
**Effort:** S (CC: ~20min)
**Priority:** P2 (accessibility)

### `dompurify` is in dependencies but unused; CSP still has `'unsafe-inline'`
**What:** `dompurify` is imported in package.json but nothing in `src/` uses it. Meanwhile `vercel.json` CSP has `'unsafe-inline'` on both `script-src` and `style-src`, which allows any inline script. Half of ISSUE-002's cleanup was Typekit removal; the `'unsafe-inline'` half is still open.
**Fix:** Either drop dompurify, or use it to sanitize anywhere user-supplied content renders. Separately, switch CSP to nonce-based or hashed inline scripts via Astro's integration.
**Effort:** M (CC: ~1hr)
**Priority:** P2 (security hardening)
