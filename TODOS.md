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

## Tech debt (still open after v0.1.1.0)

Shipped in v0.1.1.0 from the previous tech debt list: `useStateRestoration` PII
(P2), `TestimonialSection` dead imports (P3), `initialPath` dead prop (P3),
`CustomizePage` badge/history undo (P1), tab keyboard navigation (P2),
`dompurify` drop (part of P2). See the v0.1.1.0 CHANGELOG entry for details.

Still open:

### CSP `'unsafe-inline'` hardening
**What:** `vercel.json` CSP has `'unsafe-inline'` on both `script-src` and `style-src`, which allows any inline script. Typekit removal shipped in v0.1.0.0 (ISSUE-002) closed half of this; the `'unsafe-inline'` half remains.
**Fix:** Switch CSP to nonce-based inline scripts via Astro's integration. Non-trivial because Astro's hydration scripts currently rely on `'unsafe-inline'`.
**Effort:** M (CC: ~1hr plus testing across all 1214 built pages)
**Priority:** P2 (security hardening)

### CustomizePage badge/history E2E regression test
**What:** The v0.1.1.0 fix for the "first undo strips the badge" bug has no end-to-end regression test. Unit testing CustomizePage requires mocking EmailEditor + Monaco + Radix which is impractical. A Playwright E2E test would catch any future regression.
**Fix:** Add a minimal Playwright suite targeting `/email-generator/customize` with a seeded `selectedEmail`, verify initial render, make an edit, undo, assert content still has `data-digistorms-badge`.
**Effort:** M (CC: ~1hr including Playwright bootstrap)
**Priority:** P2

### State restoration + history clear ordering contradiction
**What:** `CustomizePage` calls `history.clear()` on mount (line 58 "fresh session per Customize visit") but `useStateRestoration` restores `history.entries` from localStorage. Restoration runs after the clear, so restoration wins — meaning the mount-clear is dead code. The comment lies about its effect.
**Fix:** Decide: do we want history persisted across reloads or not? Pick one, then either delete the mount-clear OR remove history from `useStateRestoration`.
**Effort:** S (CC: ~20min, but needs product decision)
**Priority:** P3

### `useStateRestoration` setTimeout leak on fast unmount
**What:** All 4 email generator sub-pages use `onStateRestored: () => setTimeout(() => setIsRestoring(false), 100)`. If the user navigates away within 100ms, the timeout fires on an unmounted component. React 18 silences the warning but the pattern will surface in React 19 and fails E2E tests under fast teardown.
**Fix:** Use `requestAnimationFrame` or a useEffect-cleanup-aware ref flag.
**Effort:** XS (CC: ~10min per callsite)
**Priority:** P3

<!-- Demo video / GIF entry already tracked at the top of the file — removed duplicate. -->
