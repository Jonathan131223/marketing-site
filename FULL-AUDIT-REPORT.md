# DigiStorms SEO Audit Report

**Site:** https://www.digistorms.ai
**Audit date:** April 12, 2026
**Business type:** B2B SaaS (AI onboarding agent)
**Tech stack:** Astro 5 SSG + React islands, Tailwind CSS, Vercel
**Pages crawled:** ~1,100 (27 static + 1,033 library + 10 blog)

---

## Overall SEO Health Score: 75 / 100

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 22% | 78 | 17.2 |
| Content Quality | 23% | 72 | 16.6 |
| On-Page SEO | 20% | 80 | 16.0 |
| Schema / Structured Data | 10% | 62 | 6.2 |
| Performance (CWV) | 10% | 85 | 8.5 |
| AI Search Readiness (GEO) | 10% | 67 | 6.7 |
| Images | 5% | 70 | 3.5 |
| **Total** | **100%** | | **74.7** |

---

## Executive Summary

### Top 5 Critical Issues

1. **Bare domain uses 307 (temporary) redirect** — `digistorms.ai` → `www.digistorms.ai` returns a 307 instead of 301. This leaks link equity on every inbound link to the bare domain.
2. **Nested BreadcrumbList bug on 6+ library pages** — BreadcrumbList is embedded as a property of CollectionPage/Article with a nested `@context`, causing Google to silently discard all library breadcrumbs.
3. **Broken library tag page** — `/library/tag/welcome-email` returns 404 (likely other tag pages too). This is both a user experience and crawl budget issue.
4. **BlogPosting dates not ISO 8601 compliant** — Bare date strings (`"2026-03-23"`) instead of `"2026-03-23T00:00:00Z"`. Google flags these in Rich Results validation.
5. **Homepage has duplicate H1 tags** — Two H1 elements dilute AI entity extraction signals.

### Top 5 Quick Wins

1. **Fix 307 → 301 redirect** in Vercel config (10 minutes, high impact)
2. **Fix nested BreadcrumbList** — split into array of two schema objects (30 minutes, 6 files)
3. **Add ISO 8601 `T00:00:00Z` suffix** to BlogPosting dates (5 minutes, 1 file)
4. **Add OAI-SearchBot** to robots.txt (2 minutes)
5. **Add WebApplication schema** to `/email-generator` (15 minutes)

---

## 1. Technical SEO (Score: 78/100)

### Crawlability — STRONG

| Check | Status | Detail |
|-------|--------|--------|
| robots.txt | PASS | All bots allowed, AI crawlers explicitly listed |
| Sitemap | PASS | Index with 2 sub-sitemaps, priority/frequency configured per page type |
| Sitemap in robots.txt | PASS | `Sitemap: https://www.digistorms.ai/sitemap.xml` |
| HTTP → HTTPS | PASS | Proper redirect |
| Meta robots | PASS | noindex on 404, legal pages, email-generator sub-routes |
| Canonical tags | PASS | Present on all pages, consistent absolute URLs |

### Indexability Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| 307 bare domain redirect | CRITICAL | `digistorms.ai` → 307 → `www.digistorms.ai`. Must be 301. |
| Broken tag page(s) | CRITICAL | `/library/tag/welcome-email` returns 404. May affect other tag URLs. |
| Trailing slash inconsistency | MEDIUM | `/email-generator/` (with slash) in canonical vs `/email-generator` on other pages. Pick one. |
| No IndexNow | LOW | Not implemented. Optional but useful for fast re-indexing on Bing. |

### Security Headers — EXCELLENT

| Header | Value |
|--------|-------|
| HSTS | `max-age=63072000; includeSubDomains; preload` (2 years) |
| CSP | Comprehensive policy with self, inline, fonts.googleapis |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |

### Mobile & Rendering

| Check | Status |
|-------|--------|
| Viewport meta | PASS |
| SSG (no JS required for content) | PASS — Astro pre-renders everything |
| React hydration | Partial — islands with `client:load` / `client:visible` |
| Font rendering | Non-blocking with preload + async swap |

---

## 2. Content Quality (Score: 72/100)

### E-E-A-T Assessment

| Signal | Status | Detail |
|--------|--------|--------|
| **Experience** | GOOD | Jonathan's consulting background referenced in about/manifesto. Real brand email examples demonstrate hands-on expertise. |
| **Expertise** | GOOD | 10 in-depth articles with SaaS-specific tactical advice. Benchmarks article based on original research (1,051 emails analyzed). |
| **Authoritativeness** | NEEDS WORK | Single author, no external citations/mentions (no Wikipedia, no Reddit, thin LinkedIn). One testimonial (Drew Price, Grammarly). |
| **Trustworthiness** | GOOD | Consistent author attribution, security headers, privacy/terms pages, Calendly link for real contact. |

### Content Inventory

| Content Type | Count | Quality |
|-------------|-------|---------|
| Blog articles | 10 | Good depth, 8-12 min reads, real examples. Benchmarks article is standout original research. |
| Email library | 1,051 | Large dataset. Individual email pages may be thin (image + brief description). |
| Comparison pages | 6 | Good structure with FAQ schema. |
| Tool pages | 3 | Interactive (ROI calc, lifecycle score, email generator). Lack benchmark grounding. |
| Static pages | ~8 | Homepage, about, manifesto, pricing, contact, privacy, terms |

### Content Gaps

| Gap | Impact |
|-----|--------|
| Example articles lack statistics | HIGH — qualitative prose not citable by AI systems. Welcome email article has 28 examples but zero performance data (open rates, CTR). |
| No FAQ on pricing page | HIGH — highest commercial-intent page has no structured Q&A. |
| Author bio too brief | MEDIUM — "Founder of DigiStorms" only. Prior consulting experience not mentioned in article bios. |
| Tool pages lack benchmarks | MEDIUM — Lifecycle Score asks 6 questions but gives no baseline context. |
| Library email pages potentially thin | MEDIUM — 1,051 pages with minimal unique text per page. |

### Readability

Blog articles use conversational tone, short paragraphs (2-4 sentences), question-phrased H2 headings. Good for human readability. Paragraph length (40-100 words) is slightly below the ideal AI citability window (134-167 words).

---

## 3. On-Page SEO (Score: 80/100)

### Title Tags — GOOD

| Page | Title | Length |
|------|-------|--------|
| Homepage | DigiStorms - AI Onboarding Agent for SaaS | 43 chars |
| Blog index | Blog - SaaS Email Examples, Retention & Growth \| DigiStorms | 60 chars |
| Blog article | {title} \| DigiStorms | Variable |
| Pricing | Pricing \| DigiStorms | 20 chars |
| Library | Email Library – B2B SaaS Lifecycle Emails \| DigiStorms | 55 chars |

All under 60 chars, brand-suffixed. No issues detected.

### Meta Descriptions — MOSTLY GOOD

| Issue | Page |
|-------|------|
| Missing meta description | Compare pages (at least `/compare/digistorms-vs-customer-io`) |
| All others | Present, 120-155 chars, keyword-optimized |

### Heading Structure

| Page | H1 Count | Issue |
|------|----------|-------|
| Homepage | **2** | "AI Onboarding Agent for SaaS" + "Turn free users into paying customers, on autopilot" — must be 1 |
| Blog articles | 1 | Correct |
| Library pages | 1 | Correct |
| Pricing | 1 | Correct |

Blog articles use excellent question-phrased H2s for AI extraction:
- "What is a dunning email (and why it's your subscription safety net)?"
- "How do you communicate core product value in a welcome email?"
- "What user actions should trigger your welcome emails?"

### Internal Linking — STRONG

| Feature | Status |
|---------|--------|
| Global navigation | PASS — Navbar on all pages |
| Footer links | PASS — 20+ links across 5 sections (Library, Product, Resources, Compare, Company) |
| Blog TOC | PASS — Sticky H2-only table of contents on desktop |
| Blog related articles | PASS — 3 recommendations per article |
| Blog → Library bridge | PASS — "See it in the wild" section links to email library |
| Breadcrumbs | PASS — Visual + schema on blog and comparison pages |

---

## 4. Schema / Structured Data (Score: 62/100)

### Current Implementation

| Page | Schema Types | Status |
|------|-------------|--------|
| `/` | WebSite, Organization, SoftwareApplication, FAQPage | PARTIAL — logo is OG image (1200x630), not square |
| `/blog/[slug]` | BlogPosting, BreadcrumbList | PARTIAL — dates not ISO 8601, wordCount inaccurate |
| `/blog` | Blog | PASS |
| `/pricing` | SoftwareApplication + Offers | PARTIAL — missing `availability` |
| `/library` | WebSite, CollectionPage | PASS |
| `/library/email/[slug]` | Article, BreadcrumbList | **FAIL — nested BreadcrumbList bug** |
| `/library/brand/[slug]` | CollectionPage, BreadcrumbList | **FAIL — nested BreadcrumbList bug** |
| `/library/tag/[slug]` | CollectionPage, BreadcrumbList | **FAIL — nested BreadcrumbList bug** |
| `/library/usecase/[slug]` | CollectionPage, BreadcrumbList | **FAIL — nested BreadcrumbList bug** |
| `/library/brands` | CollectionPage, BreadcrumbList | **FAIL — nested BreadcrumbList bug** |
| `/library/usecases` | CollectionPage, BreadcrumbList | **FAIL — nested BreadcrumbList bug** |
| `/roi-calculator` | WebApplication | PASS |
| `/lifecycle-score` | WebApplication | PASS |
| `/email-generator` | None | **MISSING** |
| `/compare/[slug]` | BreadcrumbList, FAQPage, SoftwareApplication x2 | PASS |
| `/about` | AboutPage, Organization | PASS |
| `/contact` | None | **MISSING** |

### Critical Schema Issues

**1. Nested BreadcrumbList Bug (6+ pages)**

All library sub-pages embed BreadcrumbList as a property of CollectionPage/Article with a nested `@context`. Google silently discards these — breadcrumbs never appear in SERPs for the library (the site's largest page surface).

```js
// BROKEN — current implementation
const jsonLd = {
  "@type": "CollectionPage",
  breadcrumb: {
    "@context": "https://schema.org",  // invalid nested @context
    "@type": "BreadcrumbList",
    itemListElement: [...]
  }
};

// FIX — pass as array
const jsonLd = [collectionJsonLd, breadcrumbJsonLd];
```

**2. BlogPosting Date Format**

```js
// BROKEN
datePublished: "2026-03-23"

// FIX
datePublished: "2026-03-23T00:00:00Z"
```

**3. Organization Logo**

Currently uses the 1200x630 OG banner image. Google requires a square or near-square logo (min 112x112px) for Organization knowledge panel.

---

## 5. Performance / CWV (Score: 85/100)

### Architecture Advantages

| Factor | Assessment |
|--------|-----------|
| **TTFB** | Excellent — Astro SSG + Vercel CDN (cache HIT confirmed) |
| **FCP** | Excellent — Static HTML, no server-side rendering delay |
| **LCP** | Good — Font preload prevents FOIT, hero content in HTML |
| **INP** | Good — React islands with partial hydration (`client:visible` defers below-fold) |
| **CLS** | Good — Width/height on images, async font loading with fallback |

### Potential Concerns

| Area | Risk | Detail |
|------|------|--------|
| Library page | MEDIUM | 1,000+ email cards on `/library` may cause slow initial paint and poor INP |
| Font loading | LOW | 5 font weights loaded (Instrument Sans 400/500/600/700 + Kalam 400). Could subset. |
| React hydration | LOW | Interactive islands add JS but are deferred with `client:visible` |
| Image format | LOW | Blog images use `.webp` — good. Verify all library images are optimized. |

### Font Loading Strategy — GOOD

Non-blocking: preload + `onload` swap + noscript fallback. No FOIT risk.

### Resource Optimization

- Tailwind CSS: JIT with tree-shaking (purges unused)
- Code splitting: Automatic route-based via Astro
- Image optimization: Astro Image component with lazy loading + async decoding

---

## 6. AI Search Readiness / GEO (Score: 67/100)

### Dimension Scores

| Dimension | Score | Key Finding |
|-----------|-------|-------------|
| Technical Accessibility | 82/100 | AI crawlers explicitly allowed. SSG = all content visible. OAI-SearchBot missing. |
| Structural Readability | 78/100 | Question-phrased H2s, schema breadth, TOC. Duplicate H1 on homepage hurts. |
| Citability | 62/100 | Benchmarks article is excellent. "Examples" articles lack statistics. |
| Authority & Brand Signals | 58/100 | No Wikipedia, no Reddit, thin LinkedIn. Single testimonial. |
| Multi-Modal Content | 55/100 | No YouTube, no data tables in benchmarks, no video content. |

### Platform-Specific Readiness

| Platform | Score | Key Gap |
|----------|-------|---------|
| Google AI Overviews | 65/100 | Duplicate H1, content lacks direct-answer openers |
| ChatGPT (web search) | 60/100 | Benchmarks citable; example articles lack quantified claims |
| Perplexity | 72/100 | Best performer — question H2s, schema, static HTML |
| Bing Copilot | 55/100 | Weak entity recognition without Wikipedia/third-party mentions |

### robots.txt AI Crawler Status

| Crawler | Status |
|---------|--------|
| GPTBot | ALLOWED |
| ChatGPT-User | ALLOWED |
| Google-Extended | ALLOWED |
| ClaudeBot | ALLOWED |
| anthropic-ai | ALLOWED |
| PerplexityBot | ALLOWED |
| Applebot-Extended | ALLOWED |
| cohere-ai | ALLOWED |
| OAI-SearchBot | **MISSING** |

### llms.txt

Present in codebase (`/public/llms.txt`, 9.2KB) with comprehensive content: site description, feature list, pricing tiers, page index, blog summaries. Verify it is deployed and accessible at `https://www.digistorms.ai/llms.txt`.

---

## 7. Images (Score: 70/100)

### Implementation

| Feature | Status |
|---------|--------|
| Astro Image component | USED — automatic format optimization |
| Lazy loading | APPLIED — `loading="lazy"` on all images |
| Async decoding | APPLIED — `decoding="async"` |
| Width/height attributes | APPLIED — prevents CLS |
| WebP format | USED — blog images are `.webp` |

### Issues

| Issue | Severity |
|-------|----------|
| Alt text quality unknown | MEDIUM — image-heavy "examples" articles need descriptive alt text with brand names for AI discoverability |
| Default OG image for all pages | LOW — Single OG image used as fallback. Per-page OG images would improve social sharing. |
| Organization logo uses OG banner | HIGH — 1200x630 landscape used where 112x112+ square required |

---

## Sitemap Analysis

### Structure

```
sitemap.xml (index)
├── sitemap-static.xml   (27 pages — homepage, blog, tools, pricing, compare, legal)
└── sitemap-library.xml  (1,033 pages — emails, brands, tags, use cases)
```

### Priority Configuration

| Page Type | Priority | Frequency |
|-----------|----------|-----------|
| Homepage | 1.0 | weekly |
| Core pages (pricing, about, tools) | 0.9 | monthly |
| Blog index | 0.9 | weekly |
| Blog articles | 0.8 | monthly |
| Comparison pages | 0.8 | monthly |
| Library landing/listing | 0.7 | weekly |
| Library brand pages | 0.6 | monthly |
| Library use case pages | 0.6 | monthly |
| Library tag pages | 0.5 | monthly |
| Individual email pages | 0.4 | yearly |
| Legal pages | 0.2 | yearly |

### Sitemap Issues

| Issue | Severity |
|-------|----------|
| Email generator sub-routes excluded | CORRECT — filtered via `@astrojs/sitemap` config |
| Broken tag page URLs in sitemap | CRITICAL — if `/library/tag/welcome-email` 404s, sitemap contains dead URLs |
| lastmod dates | VERIFY — check if `lastmod` is included in generated sitemap |

---

## Methodology

This audit combined:
- **Source code analysis** of the Astro 5 SSG codebase (layouts, components, config, content)
- **Live site fetch** of homepage, key pages, robots.txt, sitemap, HTTP headers
- **Schema validation** against Schema.org specs and Google Rich Results requirements
- **GEO scoring** across 5 dimensions (technical accessibility, structural readability, citability, authority, multi-modal)
- **Performance assessment** from architecture analysis (PSI API quota unavailable)

Tools used: 6 parallel specialist subagents (Technical SEO, Content Quality, Schema Markup, Sitemap, AI Search Readiness, Performance)
