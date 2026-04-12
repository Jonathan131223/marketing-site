# DigiStorms SEO Action Plan

**Generated:** April 12, 2026
**Current Score:** 75/100
**Target Score:** 88/100

---

## Critical (Fix Immediately)

### 1. Fix bare domain 307 → 301 redirect
**Impact:** Link equity leaking on every inbound link to `digistorms.ai`
**Effort:** 10 minutes
**File:** `vercel.json`

`digistorms.ai` returns a 307 (temporary) redirect to `www.digistorms.ai`. This tells search engines the redirect is not permanent, so link equity from the bare domain is not fully transferred. Change to 301 in Vercel's redirect configuration.

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "digistorms.ai" }],
      "destination": "https://www.digistorms.ai/$1",
      "permanent": true
    }
  ]
}
```

---

### 2. Fix nested BreadcrumbList schema bug (6 library pages)
**Impact:** Breadcrumbs silently discarded by Google on 1,000+ library pages
**Effort:** 30 minutes
**Files:**
- `src/pages/library/email/[slug].astro`
- `src/pages/library/brand/[slug].astro`
- `src/pages/library/tag/[slug].astro`
- `src/pages/library/usecase/[slug].astro`
- `src/pages/library/brands.astro`
- `src/pages/library/usecases.astro`

In each file, split the single `jsonLd` object into an array. Remove `@context` from the nested BreadcrumbList and make it a separate top-level object:

```js
// BEFORE (broken)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: pageTitle,
  description: pageDesc,
  url: pageUrl,
  breadcrumb: {
    "@context": "https://schema.org",   // invalid
    "@type": "BreadcrumbList",
    itemListElement: [...]
  }
};

// AFTER (correct)
const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: pageTitle,
  description: pageDesc,
  url: pageUrl,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [...]
};

// Pass as array
jsonLd={[collectionJsonLd, breadcrumbJsonLd]}
```

---

### 3. Fix broken library tag page(s)
**Impact:** 404 errors in sitemap, wasted crawl budget, broken user experience
**Effort:** 1-2 hours (investigate + fix)

`/library/tag/welcome-email` returns a 404 page. Investigate:
- Is the tag missing from the content collection?
- Are other tag pages also broken?
- Is there a mismatch between tags in `emails.json` and generated tag pages?

Run: check all tag URLs in the sitemap against live responses to find the full scope.

---

### 4. Fix BlogPosting ISO 8601 dates
**Impact:** Google Rich Results validation warnings
**Effort:** 5 minutes
**File:** `src/pages/blog/[slug].astro`

```js
// BEFORE
datePublished: date,
dateModified: date,

// AFTER
datePublished: date ? `${date}T00:00:00Z` : undefined,
dateModified: date ? `${date}T00:00:00Z` : undefined,
```

---

### 5. Fix duplicate H1 on homepage
**Impact:** Dilutes AI entity extraction — two H1s confuse what the page is "about"
**Effort:** 10 minutes
**File:** Homepage component (likely `src/components/react/HomepageIsland.tsx` or `src/pages/index.astro`)

Keep "AI Onboarding Agent for SaaS" as the single H1. Demote "Turn free users into paying customers, on autopilot" to H2 or a `<p>` tagline.

---

## High (Fix Within 1 Week)

### 6. Add OAI-SearchBot to robots.txt
**Impact:** OpenAI's dedicated search crawler not explicitly allowed
**Effort:** 2 minutes
**File:** `public/robots.txt`

```
User-agent: OAI-SearchBot
Allow: /
```

---

### 7. Add WebApplication schema to /email-generator
**Impact:** Primary conversion tool has zero structured data
**Effort:** 15 minutes
**File:** `src/pages/email-generator/index.astro`

```js
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "DigiStorms Free Lifecycle Email Generator",
  url: "https://www.digistorms.ai/email-generator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Generate professional SaaS lifecycle emails in minutes.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock"
  }
};
```

---

### 8. Fix Organization logo in schema
**Impact:** Google Organization knowledge panel requires square logo
**Effort:** 15 minutes
**Files:** `src/pages/index.astro`, potentially add a square logo to `public/`

Replace the 1200x630 OG banner with a dedicated square logo asset (min 112x112px, ideally 512x512px).

```js
logo: {
  "@type": "ImageObject",
  url: "https://www.digistorms.ai/logo-square.png",
  width: 512,
  height: 512,
},
```

---

### 9. Add missing meta descriptions to comparison pages
**Impact:** AI systems use meta descriptions as canonical one-sentence summary
**Effort:** 30 minutes
**Files:** `src/components/astro/ComparisonPage.astro` or individual compare pages

Each compare page needs a unique ~150-char meta description. Example:
> "Compare DigiStorms vs Customer.io for SaaS onboarding emails. See features, pricing, and why behavior-based beats time-based email sequences."

---

### 10. Fix trailing slash inconsistency
**Impact:** Mixed canonicals can split ranking signals
**Effort:** 15 minutes
**File:** `astro.config.mjs` or `vercel.json`

Decide: trailing slash or no trailing slash. Apply consistently. The email-generator canonical shows `/email-generator/` while other pages omit the trailing slash. Astro's `trailingSlash` config option controls this.

---

## Medium (Fix Within 1 Month)

### 11. Add benchmark statistics to "examples" blog articles
**Impact:** Transforms qualitative guides into AI-citable sources
**Effort:** 1 day per article (5-7 articles)

Each "X examples" article currently lists examples without data. Add a "By the numbers" section near the top with 2-3 sourced statistics. Cross-reference the DigiStorms benchmarks study:

> "According to DigiStorms' analysis of 1,051 SaaS lifecycle emails, welcome emails appear in 89% of onboarding sequences — the most common email type by far."

Priority articles:
1. `saas-welcome-email` (28 examples, highest traffic potential)
2. `webinar-emails` (20 examples)
3. `upgrade-emails` (13 examples)

---

### 12. Add FAQ section + schema to pricing page
**Impact:** Highest commercial-intent page has no structured Q&A for AI extraction
**Effort:** 2-3 hours

Add 5-6 FAQ items with FAQPage schema:
- "What happens when I exceed my signup limit?"
- "Can I change plans at any time?"
- "Is there a free trial?"
- "What email types are included?"
- "How does behavior-based differ from time-based?"

Note: FAQPage schema no longer generates Google rich results for commercial sites (since Aug 2023), but it benefits AI search (Perplexity, ChatGPT, Bing Copilot).

---

### 13. Expand author bio in blog articles
**Impact:** Strengthens E-E-A-T for all 10 blog articles
**Effort:** 30 minutes

Current bio: "Founder of DigiStorms"

Recommended: "Jonathan Bernard has consulted with SaaS growth teams on lifecycle email strategy for over five years. He founded DigiStorms after analyzing 1,051 real lifecycle emails from 38 B2B SaaS companies."

Update in the author bio component and the BlogPosting author schema.

---

### 14. Add ContactPage schema to /contact
**Impact:** Completeness, minor authority signal
**Effort:** 15 minutes
**File:** `src/pages/contact.astro`

```js
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact DigiStorms",
  url: "https://www.digistorms.ai/contact",
  mainEntity: {
    "@type": "Organization",
    name: "DigiStorms",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: "https://www.digistorms.ai/contact"
    }
  }
};
```

---

### 15. Add BreadcrumbList to blog index
**Impact:** Supports sitelinks in search results
**Effort:** 10 minutes
**File:** `src/pages/blog/index.astro`

```js
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.digistorms.ai" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.digistorms.ai/blog" }
  ]
};
```

---

### 16. Add `availability` to pricing Offer objects
**Impact:** Improves eligibility for price-related rich results
**Effort:** 10 minutes
**File:** `src/pages/pricing.astro`

Add `"availability": "https://schema.org/InStock"` to each Offer object.

---

### 17. Add HTML data tables to benchmarks article
**Impact:** Makes benchmark data directly extractable by AI parsers
**Effort:** 4-6 hours
**File:** `src/content/blog/saas-email-benchmarks.md`

Render email type distribution, subject line length, lifecycle stage coverage as proper `<table>` HTML with `<thead>` and `<th>` — not only as chart images. AI crawlers extract tables reliably; they cannot interpret chart images.

---

### 18. Verify llms.txt is deployed
**Impact:** Direct signal to AI systems about site structure
**Effort:** 5 minutes

`/public/llms.txt` exists in the codebase (9.2KB). Verify it's accessible at `https://www.digistorms.ai/llms.txt`. If not, check Vercel build output.

---

## Low (Backlog)

### 19. Remove or fix BlogPosting wordCount
**Effort:** 10 minutes

Currently computed as `readTime * 250` which is an approximation. Either remove it or compute from actual content word count at build time.

---

### 20. Add `sameAs` to SoftwareApplication schema
**Effort:** 5 minutes

Connect the software entity to social profiles (same as Organization schema).

---

### 21. Publish benchmarks data on Reddit + LinkedIn
**Effort:** 3-4 hours (content creation)

Post a summary of the SaaS email benchmarks on r/SaaS, r/EmailMarketing, r/indiehackers. Reddit threads are heavily cited by Perplexity and ChatGPT. This builds the external authority signals DigiStorms currently lacks.

---

### 22. Create a YouTube presence
**Effort:** Ongoing

YouTube has the highest correlation (~0.737) with AI citation among all brand mention signals. Even a single video walking through the benchmarks findings would create a citability bridge.

---

### 23. Implement IndexNow
**Effort:** 1-2 hours

Submit URLs to Bing/Yandex immediately when content changes. Useful for the blog and library pages.

---

### 24. Audit image alt text across library pages
**Effort:** 2-3 hours

Ensure all email screenshot images have descriptive alt text with brand name and email type. Example: `alt="Slack welcome email example showing product onboarding tips"`.

---

## Projected Score After Fixes

| Priority | Items | Score Impact |
|----------|-------|-------------|
| Critical (#1-5) | 5 fixes | +5 points → 80 |
| High (#6-10) | 5 fixes | +3 points → 83 |
| Medium (#11-18) | 8 fixes | +5 points → 88 |
| Low (#19-24) | 6 fixes | +2 points → 90 |

**Estimated final score: 88-90 / 100** after completing Critical + High + Medium items.
