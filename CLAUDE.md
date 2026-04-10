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
