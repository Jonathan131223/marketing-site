## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Testing

Test framework: vitest 4 + @testing-library/react + jsdom. Run `npm test` (single
pass) or `npm run test:watch`. Test files live under `test/`.

**Test expectations:**
- 100% test coverage is the goal — tests make vibe coding safe
- When writing a new function or component, write a corresponding test
- When fixing a bug, write a regression test that would have caught it
- When adding error handling, write a test that triggers the error
- When adding a conditional (if/else, switch, ternary), write tests for BOTH paths
- Never commit code that makes existing tests fail

The first test suite was bootstrapped in v0.1.0.0 as part of the QA pass that
shipped the email generator tab layout. See `test/email-generator/EmailGeneratorApp.regression.test.tsx`
for the ISSUE-001 regression test — the exact assertion that would have caught
the blank-page bug that shipped to production before the test suite existed.

## Environment variables

Use the `PUBLIC_` prefix for any env var that must be readable from the client
bundle (e.g., `PUBLIC_APP_BASE_URL`). Astro only inlines `PUBLIC_*` variables into
both server AND client bundles. `VITE_*` is server-only and will cause a hydration
mismatch when components render differently on SSR vs client.

## Email generator sub-routes

`/email-generator/{brief,templates,generate,customize}` are flow-state pages that
only make sense after a user picks a use case on the picker. They emit
`<meta name="robots" content="noindex, follow">` with `canonical` pointing at
`/email-generator` to prevent soft-404 SEO penalties from title-vs-body mismatches
when users deep-link without state. If you add a new sub-route, include `noindex`
and `canonical` props on the `BaseLayout`.

## Blog article invariants

`src/pages/blog/[slug].astro` **must** render the following features on
every article page. They were accidentally dropped during the Astro SSG
migration and flagged by the user as a UX/SEO regression. Do NOT remove any of
them without explicit user approval:

1. **Sticky table of contents** on the left (desktop only, `lg:block`).
   Built from `headings` returned by `post.render()`, filtered through
   `filterTocHeadings()` to keep only `depth === 2`. **H2s only — never H3s.**
   H3s are used for brand-name sub-headings inside the "28 examples" sections
   and would flood the TOC with 28+ entries. Active section is tracked by
   `initTableOfContents()` in `src/scripts/blog-article.ts` (adds `is-active`
   class to the matching `[data-toc-link]` anchor on scroll).

2. **Reading progress bar** sitting **flush against the navbar's bottom edge**
   (not above it, not with a gap). Positioned at runtime by `initScrollProgress()`
   via `nav.sticky.getBoundingClientRect().bottom` — don't hard-code `top-14`
   or any px offset. The navbar's actual height has changed over time and
   hard-coded offsets leave the bar floating inside the navbar content. The
   empty `<div data-blog-progress>` is the target; its width fills from 0% →
   100% as the article is scrolled.

3. **"You might also be interested in..." related articles** at the bottom.
   Uses `relatedPostsFor(slug, meta)` which keeps readers in the same series
   (email examples vs. guides) when possible. **Every card must show a banner
   image** — fall back to the inline SVG placeholder when `heroImage` and
   `thumbnail` are both missing (otherwise the card looks broken, per user
   report on saas-email-benchmarks).

4. **"Subject line: ..." paragraphs styled centered, non-bold, muted.** The
   markdown is `**Subject line: Welcome to Miro!**` which renders as
   `<p><strong>...</strong></p>`. `styleSubjectLines()` tags these with
   `is-subject-line` and CSS in `[slug].astro` handles the rest.

5. **"See it in the wild" library email section** — after the author bio on
   articles with `libraryTags`. Surfaces up to 3 real email examples from
   `@/data/library/emails.json` whose tags intersect the article's
   `libraryTags`, plus a "Browse all examples →" link to
   `/library/tag/{primaryTag}`. This is a key conversion surface from blog
   to library. Render server-side (not via client-side fetch) to avoid layout
   shift and guarantee it ships in the SSG output.

All features are guarded by regression tests in
`test/blog/blog-article.test.ts`. If you edit `[slug].astro` or
`src/scripts/blog-article.ts`, run `npm test` and make sure those tests still
pass. If a test fails, restore the feature — do not delete the test.
