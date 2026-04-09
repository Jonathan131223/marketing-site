# Design System — DigiStorms

## Product Context
- **What this is:** AI onboarding agent that generates behavior-based email sequences for SaaS products
- **Who it's for:** Indie hackers, solo SaaS founders, small teams (50-500 monthly signups)
- **Space/industry:** SaaS lifecycle / onboarding tools. Competitor: Pulsent (enterprise, sales-led)
- **Project type:** Marketing site (Astro SSG + React islands) + SaaS app

## Aesthetic Direction
- **Direction:** Clean Professional with Editorial Accents
- **Decoration level:** Intentional — subtle background alternation, no patterns, no blobs, no decorative elements
- **Mood:** Trustworthy, sharp, warm but not playful. The Instrument Serif headings give editorial authority without trying too hard. The cream backgrounds add warmth without being cute.
- **Reference sites:** pulsent.ai (warm gradients, product mockups in every section, polished feel)

## Typography
- **Display/Hero:** Instrument Serif — editorial authority, unusual for SaaS (deliberate risk). 52px, letter-spacing -0.02em, line-height 1.1
- **Section Headings:** Instrument Serif — 38px, letter-spacing -0.01em, line-height 1.15
- **Body:** Instrument Sans — clean, readable, already loaded. 16px, line-height 1.6
- **Subheadline:** Instrument Sans — 18px, line-height 1.6
- **UI Labels/Stats:** Instrument Sans — 13px, font-weight 600, uppercase, letter-spacing 0.08em
- **Card Titles:** Instrument Sans — 20px, font-weight 600
- **Captions/Muted:** Instrument Sans — 14px
- **Code:** JetBrains Mono (for docs/technical content only)
- **Loading:** Google Fonts — `Instrument+Sans:wght@400;500;600;700` + `Instrument+Serif:ital@0;1`

## Color
- **Approach:** Restrained with warmth. Navy + cream. No orange/amber accent.
- **Primary:** #2563EB — main CTA, links, active states, section labels
- **Primary Hover:** #1D4ED8 — button hover, link hover
- **Primary Light:** #EFF6FF — surface/card backgrounds, subtle highlights
- **Background:** #FFFFFF — default page background
- **Background Warm:** #F8F6F2 — alternating section backgrounds (cream)
- **Text Heading:** #0F172A — headings, strong text
- **Text Body:** #475569 — paragraph text, descriptions
- **Text Muted:** #94A3B8 — captions, labels, secondary info
- **Border:** #E2E8F0 — card borders, dividers, input borders
- **Semantic:** success #10B981, warning #F59E0B, error #EF4444, info #3B82F6
- **Dark mode strategy:** Invert surfaces (background → #0F172A, warm → #1A1F2E), reduce primary saturation, keep semantic colors

### HSL Variables (for Tailwind/shadcn)
All colors MUST be defined as HSL in CSS custom properties (existing pattern in index.css):
- `--primary: 221 83% 53%` (#2563EB)
- `--primary-foreground: 210 40% 98%`
- `--background: 0 0% 100%`
- `--background-warm: 36 33% 96%` (#F8F6F2)
- `--foreground: 222 84% 5%` (#0F172A)
- `--muted-foreground: 215 16% 47%` (#475569)
- `--border: 214 32% 91%` (#E2E8F0)

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable (tighter than current, not cramped)
- **Section padding:** 48px vertical (down from ~80px)
- **Component gap:** 24px
- **Card padding:** 28-32px
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** Grid-disciplined
- **Max content width:** 1280px
- **Container padding:** 24px horizontal
- **Grid:** Single column hero (centered). 2-column for How It Works steps (alternating left/right). 3-column for benefit cards. Single column for FAQ, testimonial, CTA.
- **Border radius:** sm: 6px, md: 10px, lg: 14px, full: 9999px
- **Shadows:** sm: `0 1px 2px rgba(0,0,0,0.05)`, md: `0 4px 12px rgba(0,0,0,0.08)`, lg: `0 8px 24px rgba(0,0,0,0.1)`
- **Background alternation pattern:** strict white/cream alternation. white → cream → white → cream → white → cream → white → cream (footer). No borders between sections, the color change handles separation.

## Motion
- **Approach:** Minimal-functional
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms)
- **Implemented:** Accordion expand/collapse (200ms ease-out), button hover transitions (200ms), focus ring transitions (200ms)
- **Deferred to v2:** Scroll-triggered section fade-ins, before/after animation

## Homepage Section Order
1. **Hero** — centered. Category label, headline, subheadline, URL input + CTA, free note, "See an example" link, product screenshot
2. **How It Works** — 3 steps with product screenshots, cream background
3. **The Difference** — before/after comparison, white background
4. **Benefits** — 3 cards with product screenshots, cream background
5. **Drew Price Testimonial** — white background with top/bottom borders, "Built the email marketing program at [Grammarly logo]"
6. **FAQ** — all 8 questions, single column accordion, FAQPage schema
7. **Final CTA** — cream gradient, URL input repeat

## Anti-Patterns (never use)
- Purple/violet gradients
- Orange/amber accents (tested, rejected)
- 3-column icon grids with colored circles
- Centered everything with uniform spacing
- Generic stock-photo hero sections
- Stats bars with vanity numbers
- Email library links that distract from core CTA
- Social proof bars with logos that aren't real customers
- Left-aligned hero sections (tested, user prefers centered)

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-08 | Created design system | /design-consultation based on Pulsent competitive analysis |
| 2026-04-08 | Navy + cream palette, no orange | Orange felt like a warning color, cream adds warmth without a third accent |
| 2026-04-08 | Keep Instrument Sans/Serif | Already loaded, serif gives editorial authority unusual for SaaS |
| 2026-04-08 | Centered hero | Left-aligned felt unbalanced for a marketing homepage |
| 2026-04-08 | Drew Price after Benefits | Trust signal after product proof, before FAQ objection handling |
| 2026-04-08 | Strict white/cream alternation | No borders between sections. Color change handles separation. Drew Price on white between two cream sections. |
| 2026-04-08 | Remove stats bar | Numbers (1000+ emails, 38+ brands) aren't customer metrics, removed for honesty |
| 2026-04-08 | Remove comparison table | Redundant with Before/After section |
| 2026-04-08 | Single column FAQ | 8 questions, readability > compactness for SEO content |
| 2026-04-08 | "Built the email marketing program at" framing | Specific about Drew's expertise, honest about relationship |
| 2026-04-08 | "on autopilot" italic blue on own line | Visual hierarchy: benefit line 1, differentiator line 2. Instrument Serif italic shines here |
| 2026-04-08 | HTML illustrations instead of images | No image loading, responsive, uses CSS variables, maintainable, text crawlable |
| 2026-04-08 | Hero 3-card flow (Detect → Track → Engage) | Shows full product story: user signs up → milestones tracked → email sent |
| 2026-04-08 | Animated particle streams between hero cards | 6 streams (3 per gap) with wave curves. Shows data flowing through the system |
| 2026-04-08 | "Reacts to users in real time" over "Behavior-based" | More human, less jargon |
| 2026-04-08 | SVG stroke icons over emojis in Benefits | Premium feel, no AI slop |
| 2026-04-08 | Drew Price two-column attribution | Photo+name left, "Built email marketing at"+logo right. Breaks center-stack monotony |
| 2026-04-08 | "Free for your first 100 users" pricing | Lifetime cap, not monthly. Best customers upgrade fastest |
| 2026-04-08 | Footer tagline = headline | "Turn free users into paying customers, on autopilot." SEO visitors see value prop in footer |
| 2026-04-08 | Footer cream + mix-blend-mode:multiply on logo | Removes white background from logo on cream |
