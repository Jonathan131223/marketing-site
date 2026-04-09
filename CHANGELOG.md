# Changelog

All notable changes to DigiStorms marketing site will be documented in this file.

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
