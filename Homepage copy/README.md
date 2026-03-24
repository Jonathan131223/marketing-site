# Homepage — Self-Contained Snapshot

This folder contains every file needed to recreate the DigiStorms homepage identically in a fresh Cursor / Vite + React project.

---

## What's inside

```
Homepage/
├── index.html                        ← HTML shell (fonts, analytics tags)
├── package.json                      ← All dependencies
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── postcss.config.js
├── components.json                   ← shadcn/ui config
│
├── public/
│   ├── benefits/                     ← 3 benefit section images
│   ├── onboarding-pain/              ← 3 pain section card images
│   ├── images-testimonials/          ← 15 testimonial avatars / logos
│   └── lovable-uploads/              ← DigiStorms logo + 18 brand logos
│
└── src/
    ├── index.css                     ← Global styles, CSS variables, scroll animations
    ├── App.tsx                       ← Root app shell (providers + router)
    ├── pages/Index.tsx               ← Homepage route — assembles all sections
    │
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── LaunchBonusBanner.tsx
    │   ├── TestimonialMarqueeCard.tsx
    │   ├── homepage/                 ← All 8 homepage sections
    │   │   ├── HeroSection.tsx
    │   │   ├── OnboardingPainSection.tsx
    │   │   ├── BenefitsSection.tsx
    │   │   ├── TestimonialSection.tsx
    │   │   ├── BrandInspirationSection.tsx
    │   │   ├── ROISectionHomepage.tsx
    │   │   ├── FounderStorySection.tsx
    │   │   └── FAQSection.tsx
    │   ├── lifecycle/BriefWizard/WebsiteStep.tsx
    │   └── ui/                       ← accordion, button, input, label, select
    │
    ├── lib/utils.ts                  ← cn() helper
    ├── services/websiteAnalysis.ts
    ├── contexts/AuthContext.tsx
    ├── hooks/                        ← useAppStore, useOrganizationData, useLaunchBonus, use-toast
    ├── store/                        ← Full Redux-style store (actions, reducers, selectors…)
    └── utils/authIntent.ts
```

---

## Setup instructions

### 1. Copy files into your project

Drop the entire contents of this folder into the root of a new (or existing) Vite + React + TypeScript project, merging folders as needed.

### 2. Install dependencies

```bash
npm install
```

Key packages already declared in `package.json`:

| Package | Used for |
|---|---|
| `react`, `react-dom` | Core |
| `react-router-dom` | Routing (`<Link>`, `useNavigate`) |
| `@radix-ui/react-accordion` | FAQ accordion |
| `@radix-ui/react-select` | ROI calculator dropdowns |
| `@radix-ui/react-label`, `@radix-ui/react-slot` | UI primitives |
| `lucide-react` | Icons |
| `tailwindcss`, `tailwindcss-animate` | Styling |
| `class-variance-authority`, `clsx`, `tailwind-merge` | Utility |
| `mixpanel-browser` | Analytics (used in Index.tsx — safe to stub out) |
| `@supabase/supabase-js` | Auth (used in AuthContext — safe to stub out) |
| `@tanstack/react-query` | Data fetching |

### 3. Configure the `@` path alias

The project uses `@/` as an alias for `src/`. This is already set in `vite.config.ts` and `tsconfig.app.json`.

### 4. Environment variables

`AuthContext.tsx` and other files may reference `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

If you don't need auth, you can stub out `AuthContext` to return a no-op provider.

### 5. Run

```bash
npm run dev
```

The homepage is served at `http://localhost:8080/`.

---

## Homepage section order (Index.tsx)

1. `<Navbar>`
2. `<HeroSection>` — headline + website URL input
3. `<OnboardingPainSection>` — 3-card pain point grid
4. `<BenefitsSection>` — 3 alternating text/image rows
5. `<TestimonialSection>` — Drew Price quote + Grammarly logo
6. `<BrandInspirationSection>` — 3-row scrolling brand logo marquee
7. `<ROISectionHomepage>` — interactive ROI calculator
8. `<FounderStorySection>` — founder bio + testimonial marquee
9. `<FAQSection>` — 2-column accordion
10. Inline `<WebsiteStep>` CTA block
11. `<Footer>`
