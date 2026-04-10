# Changelog

All notable changes to DigiStorms marketing site will be documented in this file.

## [0.1.0.0] - 2026-04-10

### Added
- Tab layout on the lifecycle email generator landing page. All 6 categories (Activation, Engagement, Expansion, Churn Prevention, Community, Content & PR) are visible at once, Activation is selected by default, and clicking any category swaps its 5-8 use cases into the panel below. Replaces the old accordion that hid every use case behind a click
- Clear empty-state page on the 4 email generator sub-routes (`/brief`, `/templates`, `/generate`, `/customize`) when you land without picking a use case first. Shows a step-specific message and a single "Go to use case picker" button instead of silently redirecting
- First automated test suite for the marketing site: vitest 4 + @testing-library/react + jsdom, 12 specs covering tab switching, empty states, navigation, and env var resolution, wired into CI between lint and build

### Fixed
- `/email-generator` rendered completely blank in production due to a missing `HelmetProvider` wrapper around the React island, then superseded by removing `<Helmet>` entirely so Astro's `BaseLayout` is the single source of truth for meta tags
- Content Security Policy violation logged on every page of the site from a dead Typekit stylesheet reference that was already superseded by self-hosted `@fontsource/instrument-sans`
- Homepage scrolled sideways ~9 pixels on mobile because of an unconstrained Grammarly logo in the testimonial section
- `/email-generator/brief?useCase=<malformed>` no longer poisons the workflow store; URL params are validated against the canonical use case list before hitting state
- Dev-mode hydration mismatch warning on every page: renamed `VITE_APP_BASE_URL` to `PUBLIC_APP_BASE_URL` so Astro inlines the value into both server and client bundles
- `CustomizePage` history-clear effect now runs once on mount (the old dependency was `[location.pathname]` referencing the global `window.location`, which never changed under SPA routing)
- Dead/unreachable branch and stale `useEffect` dependencies in `TemplatesPage` and `CustomizePage` after the empty-state refactor
- `TemplatesPage` restoration delay was 200ms while the other 3 sub-pages used 100ms; aligned to 100ms

### Changed
- Email generator sub-routes (`/brief`, `/templates`, `/generate`, `/customize`) now emit `<meta name="robots" content="noindex, follow">` and canonical to `/email-generator`. These pages only make sense inside a flow; indexing them caused title-vs-body mismatches and soft 404 risk
- `EmptyStateRedirect` and `UseCasePickerPage` use DESIGN.md's Primary color (#2563EB) for the base tab and button states, with #1D4ED8 reserved for hover
- CI (`.github/workflows/ci.yml`) now runs `npm test` between lint and build

### Removed
- Dead Typekit preconnect/preload/noscript tags from `BaseLayout.astro`
- `use.typekit.net` from `script-src`, `style-src`, and `font-src` in the `vercel.json` CSP
- Redundant `<Helmet>` from `UseCasePickerPage` (Astro handles all meta tags)
- Fallback read of `VITE_APP_BASE_URL` in `src/config/appUrl.ts`

## [0.0.2.0] - 2026-04-09

### Added
- New homepage design with 9-section layout: Hero, How It Works, Before/After, Benefits, Drew Price Testimonial, FAQ, Final CTA
- HTML product illustrations (zero image dependencies): hero 3-card flow showing Detect/Track/Engage with animated particle streams
- Inline illustrations for How It Works steps (milestone detection, email sequence, behavior triggers)
- Inline illustrations for Benefits cards (user stall detection, funnel visualization, email editor)
- Design system (DESIGN.md): navy blue + warm cream palette, Instrument Sans/Serif typography, spacing scale, motion guidelines
- FinalCTASection component with URL input repeat
- HeroIllustration component with animated SVG particle streams and sequential glow pulse
- New Drew Price testimonial layout: two-column attribution with Grammarly logo
- TODOS.md with tracked follow-up items (example page, demo video)
- Avatar and Grammarly logo assets

### Changed
- Homepage headline: "Turn free users into paying customers, on autopilot" (italic blue treatment)
- Homepage subheadline: "DigiStorms is your AI onboarding agent. It tracks user behavior and sends the right emails at the right time."
- Pricing copy: "Free for your first 100 users" (lifetime cap, not monthly)
- Footer: cream background, tagline matches headline, logo uses mix-blend-mode
- FAQ: single column layout, all 8 questions preserved for SEO
- Benefits section: SVG stroke icons instead of emojis, new card titles
- Section backgrounds: strict white/cream alternation
- CSS: added --background-warm variable, bg-background-warm Tailwind utility

### Removed
- RebuildNoticeModal (product is ready for launch)
- Stats bar (1000+ emails, 38+ brands, 5 min)
- Social proof bar (replaced by Drew Price testimonial)
- ROI calculator from homepage (stays at /roi-calculator)
- Founder story from homepage (moved to /about)
- Testimonial marquee carousel from homepage (moved to /about)
- Email library link from final CTA (distracted from core action)
