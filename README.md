# DigiStorms Marketing Site

Public marketing site for DigiStorms. All product CTAs (Sign up, Login, Generate, etc.) redirect to the **app** (`app.digistorms.ai` in production, configurable via `VITE_APP_BASE_URL`).

## Routes (marketing only)

- `/` — Homepage
- `/pricing` — Pricing
- `/manifesto` — Manifesto
- `/lifecycle-score` — Your Lifecycle Score
- `/roi-calculator` — ROI Calculator
- `/contact` — Contact
- `/privacy` — Privacy policy
- `/terms` — Terms of service

## Local development (localhost flows)

1. **Start the marketing site**:
   ```bash
   cd digi-marketing && npm install && npm run dev
   ```
   Marketing runs at **http://localhost:5173** by default. Sign up, Login, and all app CTAs go to **https://app.digistorms.ai** unless overridden.

2. **Optional: test with local app** — if you want CTAs to hit your local app instead:
   - Start the app: `cd digi-monorepo && npm run dev` (runs at http://localhost:8080).
   - In `digi-marketing`, create `.env.local` with: `VITE_APP_BASE_URL=http://localhost:8080`.
   - Restart the marketing dev server.

3. **Environment**  
   By default, “Sign up free”, “Login”, and all app CTAs point to **https://app.digistorms.ai**.  
   To test with the app running locally instead, create `.env.local` with:
   ```bash
   VITE_APP_BASE_URL=http://localhost:8080
   ```

## Production

- Set `VITE_APP_BASE_URL=https://app.digistorms.ai` (e.g. in Vercel env).
- Deploy marketing to `digistorms.ai`, app to `app.digistorms.ai`.

## Tech

- Vite + React + TypeScript + Tailwind
- No Supabase, no auth — marketing only redirects to the app for signup/login and product flows.
