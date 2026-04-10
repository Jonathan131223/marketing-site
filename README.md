# DigiStorms Marketing Site

Public marketing site for DigiStorms. All product CTAs (Sign up, Login, Generate, etc.) redirect to the **app** (`app.digistorms.ai` in production, configurable via `PUBLIC_APP_BASE_URL`).

## Routes

**Core pages**

- `/` — Homepage
- `/pricing` — Pricing
- `/manifesto` — Manifesto
- `/about` — About
- `/contact` — Contact
- `/privacy` — Privacy policy
- `/terms` — Terms of service

**Lead-gen tools**

- `/lifecycle-score` — Onboarding score quiz
- `/roi-calculator` — ROI calculator
- `/email-generator` — Lifecycle email generator (tab layout, 38 use cases across 6 categories)
- `/email-generator/brief` — Brief form (noindex, flow state)
- `/email-generator/templates` — Template gallery (noindex, flow state)
- `/email-generator/generate` — Generation loading (noindex, flow state)
- `/email-generator/customize` — Email editor (noindex, flow state)

**Library + blog + compare**

- `/library` — Email library index
- `/library/brands` — Browse by brand
- `/library/usecases` — Browse by use case
- `/library/tags` — Browse by tag
- `/blog` — Blog index
- `/compare/*` — Competitor comparison pages

## Local development

1. **Start the marketing site**:
   ```bash
   cd digi-marketing && npm install && npm run dev
   ```
   Marketing runs at **http://localhost:4321** by default (Astro's default). Sign up, Login, and all app CTAs go to **https://app.digistorms.ai** unless overridden.

2. **Optional: test with local app** — if you want CTAs to hit your local app instead:
   - Start the app: `cd digi-monorepo && npm run dev` (runs at http://localhost:8080).
   - In `digi-marketing`, create `.env.local` with: `PUBLIC_APP_BASE_URL=http://localhost:8080`.
   - Restart the marketing dev server.

3. **Environment**
   By default, "Sign up free", "Login", and all app CTAs point to **https://app.digistorms.ai**.
   To override, create `.env.local` with:
   ```bash
   PUBLIC_APP_BASE_URL=http://localhost:8080
   ```
   Must use the `PUBLIC_` prefix — Astro only inlines `PUBLIC_*` env vars into both server and client bundles. `VITE_*` is server-only and causes a hydration mismatch in the navbar.

## Testing

```bash
npm test           # vitest run (single pass)
npm run test:watch # vitest watch mode
```

Test files live under `test/`. See `TESTING.md` if present, or the existing specs in `test/email-generator/` and `test/config/` for conventions.

## Production

- Set `PUBLIC_APP_BASE_URL=https://app.digistorms.ai` in Vercel env.
- Deploy marketing to `digistorms.ai`, app to `app.digistorms.ai`.
- CI runs lint → tests → build on every push via `.github/workflows/ci.yml`.

## Tech

- **Framework:** Astro 5 SSG with React islands (`client:only="react"` for the email generator SPA)
- **Language:** TypeScript
- **Styles:** Tailwind CSS + shadcn-style component primitives
- **Tests:** vitest 4 + @testing-library/react + jsdom
- **Hosting:** Vercel
- **Fonts:** Instrument Sans + Instrument Serif via `@fontsource/*` (self-hosted, no Typekit/Google Fonts dependency on the critical path)
- No Supabase, no auth on the marketing site itself — it only redirects to the app for signup/login and product flows.
