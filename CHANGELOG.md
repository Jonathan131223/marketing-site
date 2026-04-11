# Changelog

All notable changes to DigiStorms marketing site will be documented in this file.

## [0.1.3.2] - 2026-04-11

### Fixed
- Lifecycle email generator no longer crashes during render for users who have stale `localStorage` state from prior releases. A schema version gate now runs at `EmailGeneratorApp` module load (before the store or any page mounts) and wipes all `digistorms_*` keys whenever the stored version does not match the current release. Pre-existing users whose accumulated brief data, selected email, or workflow state had an older shape were hitting a render-time error inside the error boundary. Now their state is automatically cleaned up on their next visit and the picker loads normally
- The "Clear cache and reload" recovery button in both the Astro loading fallback and the React error boundary actually clears the correct `localStorage` keys now. Prior versions matched `digistorms-` (hyphen) but the real keys use `digistorms_` (underscore), so the button ran successfully while silently clearing nothing, leaving users stuck in a reload loop. Also clears `sessionStorage` as a belt-and-suspenders measure
- Error boundary now exposes the error name, message, and first 8 stack frames behind a "Show error details" disclosure in production. Previously the error was only shown in development mode, making it impossible to debug user-reported crashes. The details are hidden by default so they do not dominate the recovery UI but available on one click

## [0.1.3.1] - 2026-04-11

### Fixed
- Lifecycle email generator no longer shows a blank white page when the JavaScript bundle is still loading, when a stale cache holds an old bundle hash, or when a browser extension breaks the page. Users now see a branded spinner with "Loading lifecycle email generator…" copy plus a collapsible "Stuck on this loading screen?" disclosure with a "Clear cache and reload" escape button. The recovery button works via vanilla JavaScript so it survives even complete React failures
- Users with JavaScript disabled now see a visible "This page needs JavaScript to work" message on the email generator instead of a blank page, via a `<noscript>` fallback
- Any unexpected crash during React hydration or first render on the email generator is now caught by an error boundary that renders a helpful error state with a "Clear cache and reload" button, instead of leaving the user stranded on a blank page

### Added
- `EmailGeneratorFallback.astro` — shared server-rendered loading fallback used by all 5 email generator routes (picker, brief, templates, generate, customize)
- `EmailGeneratorErrorBoundary.tsx` — React class boundary wrapping the entire email generator island, with localStorage-clearing recovery action

## [0.1.3.0] - 2026-04-11

### Added
- "See it in the wild" library section on blog articles with `libraryTags`. Up to 3 real email examples from the library surface below the article, matched on tag intersection, with brand logo, subject, and matching tag pill. Each article gets a "Browse all examples →" link to the primary tag page. Drives readers from the blog into the library, a key conversion surface. Rendered server-side so it ships in the SSG output with no layout shift
- Test scope `test/blog/` with 32 regression tests covering the four blog article invariants (TOC, progress bar, related articles, subject lines) plus 10 new coverage tests added during the pre-landing review (unscrollable-page NaN guard, missing heading IDs, missing nav.sticky, cleanup listener symmetry, initBlogArticle composite orchestrator, eight file-grep template invariants)
- `CLAUDE.md` section "Blog article invariants" documenting all 5 features that must render on every blog article. Future Claude sessions reading the project file see an explicit list with file references and regression-test pointers

### Changed
- Blog article pre-existing scroll handlers now cache `offsetTop` and `scrollHeight` at init time (reading them on every scroll event was forcing a layout reflow per scroll tick) and batch DOM writes through `requestAnimationFrame`. On long articles with 10+ H2s the scroll path went from 10+ forced layouts per tick to zero. The resize handler debounces via rAF too
- The reading progress bar now computes its vertical position from the navbar's actual rendered `getBoundingClientRect().bottom` instead of a hard-coded `top-14` (56px). The navbar is 68px tall, so the old offset placed the bar inside the navbar content. Positioning is re-applied on window resize so it stays flush when the navbar height changes at a breakpoint

### Fixed
- Restored the sticky table of contents on the left of every blog article (desktop only, `lg:block`). H2s only — H3s are filtered out by `filterTocHeadings()` so they don't flood the TOC with the 28+ brand-name sub-headings from the "examples" sections. Active section is tracked on scroll
- Restored the reading progress bar under the navbar. The empty `<div data-blog-progress>` fills from 0% to 100% as the article is scrolled
- Restored the "You might also be interested in..." related articles section at the bottom of every article, with same-series preference (email examples vs. guides)
- Restored the centered, non-bold, muted styling on "Subject line: ..." paragraphs in email example articles. The markdown is `**Subject line: Welcome to Miro!**`; the renderer now tags those paragraphs with `is-subject-line` so CSS can style them distinctly from body copy
- Related article cards now render an SVG placeholder when both `heroImage` and `thumbnail` are missing. Previously a card with no image rendered `<img src="">` which showed as a broken image (flagged by the user on the saas-email-benchmarks card)
- Progress bar regression test was asserting against a `data-progress-wrapper` attribute that did not exist in production markup — a refactor that wrapped the bar in another div would have silently passed the test while breaking production. The test now asserts against the real `parentElement` relationship the production code uses

## [0.1.2.1] - 2026-04-11

### Changed
- New Stormi favicon — the blue smiling tornado mark replaces the older purple version across every tab and bookmark. Browser tabs, pinned-tab icons, and the apple-touch-icon on home-screen saves now all show the new brand mark

## [0.1.2.0] - 2026-04-11

### Changed
- Library page headings now match the homepage. Same Instrument Serif typography, same sizes (52px hero, 38px section), same letter-spacing, same text color. Each section gets a small blue eyebrow label ("EMAIL LIBRARY", "USE CASES", "BROWSE BY BRAND") and the cream/white background alternation matches the homepage rhythm. Previously the library used its own heading treatment with synthetic-bolded serif text and was visibly inconsistent with the rest of the site
- Blog post headings and body prose restyled to match the brand. Article titles are now slate-900 Instrument Serif (previously blue `#1D4ED8` with a wrong weight), in-body H2 and H3 are slate-900 Instrument Serif at 30px and 24px, blockquotes use the cream background with a primary-blue left border, and links are primary blue
- Pricing, About, Manifesto, Contact, Terms, Privacy, 404, ROI Calculator, Lifecycle Score, and all Compare pages now use the homepage heading system. Every H1 gets a category eyebrow ("PRICING", "ABOUT", "MANIFESTO", etc.) above the serif display heading
- Library sub-pages (brand, tag, use case, email detail, and the browse-by-\* index pages) align with the same heading scale
- Use-case tag backgrounds switched from lavender `#EDE9FE` with purple text to primary-light `#EFF6FF` with primary-blue text. Tag backgrounds in the tag/usecase/email pages match

### Fixed
- Removed synthetic bolding on every Instrument Serif heading site-wide. The font ships as a single weight (`Instrument+Serif:ital@0;1`) so `font-bold`/`font-semibold` classes were producing faux-bold that looked cheap against the homepage's correct rendering
- Eliminated every purple/violet usage from the live site. DESIGN.md explicitly lists purple/violet as an anti-pattern, but blog placeholders used `#7C3AED` fills, the blog post CTA used `bg-violet-50` and `bg-violet-600`, the blog-prose link color was `#7c3aed`, the manifesto and about CTA hover used `#6340c4`, the library use-case "onboard-free-user" display color was `#5B21B6`, and blog-prose blockquotes had a lavender background with a purple border. All replaced with primary blue (`#2563EB`) or cream (`#F8F6F2`) per DESIGN.md
- Headings that were previously rendered in primary blue (intended for CTAs and links, not body copy) now render in `#0F172A` slate-900. The blog index H1, blog post H1, and blog-prose H2/H3 were the worst offenders

## [0.1.1.0] - 2026-04-11

### Added
- Keyboard navigation for the email generator category tabs. Arrow Left / Arrow Right move between categories with wrap-around at both ends, Home jumps to Activation, End jumps to Content & PR. Only the active tab sits in the natural tab order so screen reader users traverse the tablist with one keystroke instead of six
- Automated smoke tests for the site-wide Navbar and Footer components
- Test-only guard verifying that the email generator state restoration never leaks customer-provided brief data (company name, product name, email HTML) to the production browser console
- Compile-time exhaustiveness check on the email generator category list that fails the build if a new category is added to the type without being added to the tab order, or if the list drifts into duplicates

### Fixed
- Undo on the first edit in the customize email step no longer removes the DigiStorms attribution badge. Two separate React effects used to race — badge insertion dispatched the post-badge content while history initialization captured the pre-badge content from the same render cycle, so the first undo reverted to a version the user never saw. Reworked into a single ordered effect that computes the post-badge content once and uses it for both operations
- Content regeneration (e.g., AI template tweaks, "Stormy" rewrites) that replaces the email body now correctly re-runs badge insertion instead of leaving regenerated content un-badged
- State restoration in the email generator no longer emits eight `console.log` calls on every page mount in production, some of which exposed full brief data (company name, product name, email HTML) to any browser extension hooking the console
- Hydration mismatch warning on every navbar render in dev mode caused by environment variable naming (`VITE_APP_BASE_URL` → `PUBLIC_APP_BASE_URL`)

### Changed
- Mobile menu smoke test now asserts the menu content actually appears after the hamburger click, instead of only that the click did not throw
- Email generator app's meta tag contract is documented once, clearly, in the React island docstring. Prior versions mislabeled the deleted `initialPath` prop as a "Chesterton's fence" (the metaphor was inverted)

### Removed
- Unused `dompurify` dependency and its `@types/dompurify` sibling (3 packages removed from `node_modules`)
- Dead `initialPath` prop from `EmailGeneratorApp` and its 5 Astro call sites (the prop was passed but never read — `BrowserRouter` uses `window.location` directly)
- Dead webp asset imports in the homepage testimonial section (Vite was bundling unused Drew Price and Grammarly webp files into the homepage bundle)

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
