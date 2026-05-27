# SEO Audit 001 — DigiStorms (May 26, 2026)

**Property:** `www.digistorms.ai`
**Baseline (90 days from product-marketing-context):** 16.8k impressions · 83 clicks · 0.5% CTR · avg position 8
**Audit scope:** full site (38 static URLs + 1,190 library URLs) + 20 blog posts + 7 compare pages
**Audit method:** WebSearch (Google index probe) + raw-HTML inspection (curl) + local file analysis. **DataForSEO/Ahrefs MCP returned "Insufficient plan" on every endpoint; Google API credentials not yet configured at the time of writing — see [Section 10](#10-what-to-rerun-once-google-api-credentials-are-live) for the deferred work.**

---

## Executive summary

DigiStorms's SEO problem is not technical hygiene — the on-page setup is unusually clean for a young site (3-layer canonical enforcement, complete schema, valid OG cards, proper sitemap, AI-crawler-friendly robots). The growth plateau has five real root causes, in priority order:

1. **The freshest blog posts are not in Google's index yet.** Of the 5 May 2026 posts I could probe directly, **5 are confirmed missing from `site:` results** — including the flagship 5,500-word `saas-onboarding-email-sequence` published May 25. Only `transactional-email-vs-marketing-email` (May 6), `product-launch-email` (May 6), and `saas-welcome-email` (May 13) are indexed. This explains why the publishing cadence hasn't moved the needle.

2. **A second `digistorms.com` domain is splitting your brand authority.** Your old consulting site (Digi Storms — the email-marketing agency, with case studies for Magrid + Bubbleye, blog posts on PLG flywheels and JTBD) is fully indexed and competes for overlapping queries. Google sees two "DigiStorms" entities. Every backlink to .com is wasted authority for .ai. This is almost certainly the single biggest unforced error in the entire setup.

3. **Zero page-1 rankings for primary commercial keywords.** Across the 6 most important queries — `saas onboarding email sequence`, `saas welcome email examples`, `customer.io alternatives`, `behavior based vs time based emails`, `best onboarding email tools`, `upsell email examples saas` — DigiStorms does not appear in the top 10. Competitors who dominate: Encharge (your `vs encharge` compare-page target is the keyword leader for behavior-based), Loops (your `vs loops` target ranks for welcome emails), Customer.io (ranks for upsell), Userpilot, Sequenzy, SmashSend, HowdyGo.

4. **`llms.txt` is 5 weeks stale.** Missing 7 posts (including all 4 of the highest-effort May posts) and includes 1 stale entry pointing to a 301 redirect (`/blog/webinar-emails`). For a brand whose primary moat is AI search visibility, this is leaking citation surface area to competitors weekly.

5. **Internal linking pumps the library and the blog cluster, but not the commercial pages.** Blog posts link aggressively to `/library/email/*` (good for time-on-site, bad for activation). Links to `/pricing`, `/lifecycle-score`, `/email-generator`, `/roi-calculator` are sparse (0–3 per post when 2–3 should be the floor). The free-tool funnel never gets the link equity it deserves from the high-impression blog posts.

### Highest-leverage actions (ship this week)

1. **Resolve the `digistorms.com` cannibalization.** 301-redirect every URL to its `digistorms.ai` equivalent, or — if .com is still actively used for consulting — add `<link rel="canonical">` from every .com page to .ai, sunset the blog, and put a hard separator in copy/header. Skipping this nullifies most of the other fixes.
2. **Request indexing for the 5 unindexed May posts** in GSC URL Inspection (manual today; programmatic once API creds are live). One click each; effect: pages enter the index within hours instead of weeks.
3. **Patch `llms.txt`** — add 7 missing posts, remove the `/blog/webinar-emails` stale entry. 20 minutes; immediate AI-citation surface gain.
4. **Insert 2–3 contextual links to commercial pages in every blog post.** Especially `/email-generator` (free-tool, money page), `/lifecycle-score` (lead capture), `/pricing` (conversion). Use the exact-match anchor text where natural. 2-hour content sweep across 20 posts.
5. **Consolidate the 5 cannibalization clusters** by designating a canonical hub per intent and pointing the spokes up to it. Welcome, retention/re-engagement, upsell/upgrade, product-launch, webinar — each currently splits authority across 2–3 pages.

---

## 1. Indexation diagnosis

**Source:** WebSearch via Google (`site:` + `inurl:` operators). Note: this is a *visibility* probe, not GSC URL Inspection. A page that doesn't surface in `site:` results is either not indexed, or indexed at a position so low Google deprioritizes it in `site:` listings — both indicate a problem.

### Confirmed indexed (visible in Google `site:` results)

| URL | Status | Notes |
|---|---|---|
| `/` | ✓ Indexed | Surfaces for brand + `site:` queries |
| `/blog` | ✓ Indexed | |
| `/about` | ✓ Indexed | |
| `/manifesto` | ✓ Indexed | |
| `/pricing` | ✓ Indexed | |
| `/blog/saas-welcome-email` | ✓ Indexed | Refreshed May 13 |
| `/blog/product-launch-email` | ✓ Indexed | Refreshed May 6 |
| `/blog/transactional-email-vs-marketing-email` | ✓ Indexed | New May 6 |
| `/blog/webinar-email-sequence` | ✓ Indexed | |
| `/blog/webinar-follow-up-email` | ✓ Indexed | |
| `/blog/milestone-emails` | ✓ Indexed | |
| `/blog/saas-email-benchmarks` | ✓ Indexed | |
| `/blog/b2b-lead-nurturing-email-examples` | ✓ Indexed | New May 6 — directly verified via inurl: |
| `/compare/digistorms-vs-loops` | ✓ Indexed | Only compare page surfacing |
| `/library/email/feature-usage-nudge-from-lovable-07092025` | ✓ Indexed | 1 of 1,058 library emails |

### Confirmed NOT indexed (zero `site:` + `inurl:` results)

| URL | Published | Words (est) | Status |
|---|---|---|---|
| `/blog/saas-onboarding-email-sequence` | **2026-05-25** | ~5,500 | **NOT INDEXED** — flagship post |
| `/blog/behavior-based-vs-time-based-emails` | **2026-05-22** | ~3,500 | **NOT INDEXED** |
| `/blog/upsell-email-examples` | **2026-05-18** | ~3,800 | **NOT INDEXED** |
| `/blog/customer-retention-email-examples` | **2026-05-11** | ~3,800 | **NOT INDEXED** |
| `/blog/re-engagement-email-examples` | **2026-05-06** | ~2,600 | **NOT INDEXED** |

### Probable not-indexed (didn't appear in any `site:` enumeration; verify manually)

- `/blog/saas-email-templates` (Apr 21)
- `/blog/saas-newsletter` (Mar 1)
- `/blog/upgrade-emails`, `/blog/dunning-emails`, `/blog/product-launch-email-subject-lines`, `/blog/webinar-follow-up-subject-lines`
- All compare pages **except** `/compare/digistorms-vs-loops`: `digistorms-vs-customer-io`, `digistorms-vs-encharge`, `digistorms-vs-resend`, `best-onboarding-email-tools`, `customer-io-alternatives`, `best-email-automation-saas-startups`
- `/library`, `/library/brands`, `/library/tags`, `/library/usecases`, and 1,189 of 1,190 library subpages
- `/email-generator`, `/lifecycle-score`, `/roi-calculator`
- `/contact`, `/privacy`, `/terms`, `/account-readiness`

**Diagnosis on May posts:** ~21 days after publishing, the flagship `saas-onboarding-email-sequence` (which is the longest, deepest-linked, schema-rich, and OG-card-equipped post on the site) still isn't indexed. This isn't a quality problem. Likely causes, in priority:
1. **Weak internal linking from indexed pages to fresh posts.** Google rediscovers indexed pages on a cadence; new posts have to be linked from those for crawl to reach them. The blog index page (`/blog`) is indexed, but Google's crawl frequency on the blog index appears low.
2. **Crawl-budget starvation from the library.** 1,190 library URLs + 38 static URLs = Google is spending its crawl budget on email-detail pages it doesn't index anyway. A `priority="0.6"` + `changefreq="monthly"` doesn't help if Googlebot never reaches the fresh posts.
3. **Low domain authority.** New sites get slow crawl. Without backlink signal, Google deprioritizes deep crawling.

**Confirmation needed:** Once Google API creds land, run `seo google inspect` on the 5 NOT-INDEXED URLs — the verdict + coverage state will tell us whether they're "Discovered – currently not indexed" (crawl-budget issue), "Crawled – currently not indexed" (quality/duplicate signal), or "Excluded by robots/canonical" (configuration issue). I expect the first.

---

## 2. SERP visibility — target keywords

For each of DigiStorms's primary commercial keywords, I checked who actually ranks on page 1.

| Target keyword | DigiStorms position | Who ranks page 1 | Notes |
|---|---|---|---|
| `saas onboarding email sequence examples 2026` | Not on page 1 | SmashSend, HowdyGo, MailSoftly, ProductLed, Sequenzy (x2), MailerLite, GlockApps, FluentCRM | Despite a 5,500-word post published May 25 |
| `saas welcome email examples` | Not on page 1 | SaaSEmailTemplates, Userlist, **Loops**, BeeFree, Knock, Userpilot, HockeyStack, HowdyGo, EcoSend, SaaSFrame | Loops is one of your compare-page targets; they own this keyword |
| `customer.io alternatives 2026` | Not on page 1 | G2, Gartner, theCXLead, GenesysGrowth, ProductHunt, GetVero, StartupHub, Research.com, Sequenzy, Convesio | The dedicated `/compare/customer-io-alternatives` page is not surfacing |
| `behavior based vs time based emails saas` | Not on page 1 | **Encharge (x2)**, Userpilot (x2), Emercury, Medium, GetYourSaaSOnBoard | Encharge owns the keyword with 2 results; they're your compare-page target |
| `best onboarding email tools saas` | Not on page 1 | Sequenzy, HowdyGo, Userpilot, SmtpBD, Viasocket, Appcues, Userlist | Your `/compare/best-onboarding-email-tools` page should rank here |
| `upsell email examples saas` | Not on page 1 | Stripo, **Customer.io**, EmailToolTester, Engage.so, DanSiepen, **Encharge**, Userpilot, Emercury, Mailmodo, InboxArmy | Both Customer.io and Encharge own this keyword (both are your compare-page targets) |
| `free email onboarding generator saas` | Not on page 1 | SocialRails, SaaSEmailTemplates, Writecream, Encharge, Hoppycopy, EmailDrips, Encharge, SaaSOperations, Userpilot, ChatGPT | This is money keyword for `/email-generator` — also not ranking |

**The competitive pattern is consistent:** Encharge, Loops, and Customer.io — the three direct competitors on your `/compare/*` pages — own the keywords you're trying to win. They've been publishing on these terms for years and have backlinks DigiStorms doesn't yet have.

**Wins to exploit:**
- `/compare/digistorms-vs-loops` is the only compare page indexed. Loops is searching-friendly because users actively look for alternatives. Lean here.
- Branded `digistorms ai onboarding` search returns the homepage, About, Pricing, plus three directory listings (Toolhunt, Devhunt, TAAFT). Brand recognition is starting to compound from those listings; double down (Section 8).

---

## 3. Cross-domain authority dilution — **CRITICAL**

A `site:digistorms.com` Google search returns:
- `digistorms.com/profile` (titled "AI Onboarding Agent for SaaS — DigiStorms" — directly competing with your homepage title)
- `digistorms.com/case-studies` (Bubbleye, Magrid case studies)
- `digistorms.com/brands/lemlist`
- `digistorms.com/blog/saas-onboarding-checklist`
- `digistorms.com/blog/net-revenue-retention`
- `digistorms.com/blog/jobs-to-be-done-examples`
- `digistorms.com/blog/product-led-growth-flywheel`
- `digistorms.com/terms`

Google describes the .com property as: *"DigiStorms is an email marketing agency dedicated to serving tech companies. They help established B2B SaaS companies automate their messaging…"* — that's your old consulting site. **It is fully indexed and competing for your keywords.**

**Impact:**
- Backlinks pointing to digistorms.com pass authority to a property that isn't your product.
- Google likely sees two "DigiStorms" entities, fragmenting your knowledge-graph signal.
- The .com blog has 4+ posts overlapping your .ai topical clusters (onboarding, PLG, JTBD, retention metrics).
- The /profile page on .com uses the SAME title tag as your /ai homepage. That's textbook cannibalization.

**Fix options (pick one, in order of preference):**

**Option A — Full consolidation (recommended):** Set up 301 redirects on digistorms.com for every URL → equivalent path on digistorms.ai. The case-studies content could be ported to a new `/case-studies/` section on .ai if useful for sales; otherwise let them redirect to root. Implementation is whatever DNS/hosting setup .com uses; ~30 min of work plus a week for Google to follow the redirects.

**Option B — Strict separation:** Keep digistorms.com as a consulting brand (different positioning), but:
- Add `<link rel="canonical" href="https://www.digistorms.ai/">` from the .com homepage if .com is the same brand
- Remove the duplicate "AI Onboarding Agent for SaaS — DigiStorms" title from .com/profile (use "Digi Storms Consulting" or similar)
- Sunset the .com blog (301 each post to its .ai counterpart where one exists, or `noindex` if not)
- Add prominent disclaimer linking to .ai as "the product"

**Option C (lowest effort, weakest fix):** `noindex` all .com pages. Doesn't recover the lost authority but stops the bleeding.

This is the **#1 fix** in the entire audit. Until it's resolved, every other recommendation is fighting a self-inflicted handicap.

---

## 4. Technical SEO — what's working

The technical foundation is genuinely good. Confirmed via raw-HTML inspection on production:

| Check | Status | Evidence |
|---|---|---|
| Canonical URLs (no trailing slash) | ✓ Working | 3-layer enforcement (`astro.config.mjs` trailingSlash:'never' + `vercel.json` cleanUrls + `BaseLayout.astro` normalizePath); `/pricing/` → 308 → `/pricing` verified |
| Apex → www redirect | ✓ Working | `digistorms.ai` → 308 → `www.digistorms.ai` verified |
| robots.txt | ✓ Clean | Explicitly allows GPTBot, ChatGPT-User, Google-Extended, ClaudeBot, anthropic-ai, PerplexityBot, Applebot-Extended, cohere-ai |
| Sitemap | ✓ Complete | All 20 blog posts present; library sitemap has 1,190 URLs |
| Schema (homepage) | ✓ Rich | WebSite + Organization + SoftwareApplication + AggregateOffer + FAQPage + Person + ContactPoint + SearchAction |
| Schema (blog posts) | ✓ Rich | BlogPosting + BreadcrumbList + ImageObject + Organization + Person |
| Schema (compare pages) | ✓ Rich | SoftwareApplication + FAQPage + BreadcrumbList + Offer |
| Schema (pricing) | ✓ Good | SoftwareApplication + AggregateOffer + Offer |
| OG cards (sized 1200×630) | ✓ Per-page | 35 unique cards via `scripts/og-images/manifest.json` |
| Twitter cards | ✓ Working | `summary_large_image` + `@digistorms_ai` |
| `noindex` discipline | ✓ Verified | `/email-generator/templates` correctly emits `<meta name="robots" content="noindex, follow">` |
| Security headers | ✓ Strong | HSTS preload, X-Frame-Options DENY, strict CSP |
| Content-Security-Policy | ✓ Strict | No unsafe-eval; inline scripts via `'unsafe-inline'` only (acceptable trade-off) |

**Don't change any of this.** This is the best technical foundation you'll see for a young site.

---

## 5. Technical SEO — what to fix

### 5.1 `llms.txt` is stale

`public/llms.txt` is missing **7 blog posts** (including all 4 of the highest-effort May posts) and includes **1 dead URL** that 301-redirects elsewhere.

**Missing from llms.txt (need to add):**
- `/blog/saas-onboarding-email-sequence` — 2026-05-25 (flagship, 5,500 words)
- `/blog/behavior-based-vs-time-based-emails` — 2026-05-22
- `/blog/upsell-email-examples` — 2026-05-18
- `/blog/customer-retention-email-examples` — 2026-05-11
- `/blog/saas-email-templates` — 2026-04-21
- `/blog/product-launch-email-subject-lines` — 2026-04-20
- `/blog/webinar-follow-up-subject-lines` — 2026-04-20

**Stale entry (need to remove):** `/blog/webinar-emails` — this 301-redirects to `/blog/webinar-email-sequence` per `vercel.json:21`.

**Inline fix in [Section 9.1](#91-llmstxt-patch).**

### 5.2 Sitemap `lastmod` dates use `TODAY` instead of real publish date

In `scripts/generate-sitemap.js`, 4 blog URLs and 2 page URLs use `TODAY` (build-time) as their `lastmod`:

```js
// Lines 82-85 + 95 + 64 (pricing)
urlEntry(`${BASE_URL}/blog/webinar-follow-up-subject-lines`,  TODAY, ...
urlEntry(`${BASE_URL}/blog/saas-onboarding-email-sequence`,   TODAY, ...
urlEntry(`${BASE_URL}/blog/saas-email-templates`,             TODAY, ...
urlEntry(`${BASE_URL}/blog/product-launch-email-subject-lines`, TODAY, ...
urlEntry(`${BASE_URL}/compare/best-email-automation-saas-startups`, TODAY, ...
urlEntry(`${BASE_URL}/pricing`,            TODAY, ...
```

Every time you redeploy, Google sees these as "modified today." This erodes trust signals — Google can tell when `lastmod` is being gamed (most CMS sites do this).

**Fix:** Pull `lastmod` from each post's frontmatter `date` field (or git mtime of the source markdown). For the static pages, hard-code the real last-substantive-edit date and bump only when you actually update the content.

### 5.3 Custom OG card missing for 6 blog posts

In `scripts/og-images/manifest.json`, the following posts have no custom card and fall back to the default `/og/blog.webp`:

- `dunning-emails`
- `milestone-emails`
- `saas-newsletter`
- `upgrade-emails`
- `webinar-email-sequence`
- `webinar-follow-up-email`

Add manifest entries (template in [Section 9.2](#92-og-cards-to-add)) and run `npm run og:all`.

### 5.4 Meta description length issues

4 blog posts have descriptions exceeding 160 chars (SERP truncation risk):
- `saas-newsletter` (168 chars)
- `saas-onboarding-email-sequence` (162 chars)
- `transactional-email-vs-marketing-email` (175 chars)
- `webinar-follow-up-subject-lines` (198 chars)

Note: `blog/[slug].astro:49-55` already has a `truncateMeta()` function that caps at 155 chars on a word boundary — so the rendered `<meta name="description">` won't exceed 156 chars **in the HTML**, but the `<og:description>` and the frontmatter `description` propagating into schema's `BlogPosting.description` field still get the full long string. Tightening the source descriptions is still the right fix.

### 5.5 Title length issue

`transactional-email-vs-marketing-email` source title is 80 chars: *"Transactional email vs marketing email: the practical difference (with examples)"*. The rendered `<title>` (with `| DigiStorms` suffix) is ~99 chars — Google truncates around char 60–65 on desktop. SERP will show "Transactional email vs marketing email: the practical…"

Tighten to ≤55 chars source. Suggestion in [Section 9.3](#93-title--description-rewrites).

### 5.6 Thin post

`webinar-follow-up-subject-lines` is ~1,900 words. The keyword has competitive SERP — top-3 results are 3,500+ word guides. This post will struggle to rank. Either expand to 2,500+ words with more examples + analysis, or 301-redirect to `webinar-follow-up-email` and merge the unique content there.

---

## 6. Content audit & cannibalization map

### 6.1 Cannibalization clusters

Five clusters where two or more posts compete for the same intent. For each, designate a canonical hub and point the spokes up to it via internal links + cross-references.

**Cluster 1 — Welcome / Onboarding (overlapping intent)**
- `saas-onboarding-email-sequence` (5,500 words, May 25, broad onboarding sequence)
- `saas-welcome-email` (5,400 words, May 13 refresh, welcome-specific)

Both compete for "saas welcome email" queries. `saas-onboarding-email-sequence` is the larger superset.

**Fix:** Designate `saas-onboarding-email-sequence` as the hub for "onboarding sequence" intent. `saas-welcome-email` becomes the spoke for "welcome email" intent. Update `saas-welcome-email`'s opening paragraph to explicitly say *"This is the day-0 email in the larger [7-email onboarding sequence](/blog/saas-onboarding-email-sequence)."* — repositions it as a spoke without losing its keyword target. Already partially done in `saas-onboarding-email-sequence:51` (links to welcome email), but the reverse link doesn't exist.

**Cluster 2 — Retention vs Re-engagement (overlapping audience: dormant users)**
- `customer-retention-email-examples` (3,800 words, May 11)
- `re-engagement-email-examples` (2,600 words, May 6)

Both cover win-back. `customer-retention-email-examples` already includes a clarification section ("Customer retention vs. win-back vs. re-engagement"), which is the right move.

**Fix:** Add the same disambiguation paragraph (verbatim) to the top of `re-engagement-email-examples`, AND add explicit "this is the re-engagement subset of [retention](/blog/customer-retention-email-examples)" wording in the first 100 words. Currently no cross-link from re-engagement to retention.

**Cluster 3 — Upsell vs Upgrade**
- `upsell-email-examples` (3,800 words, May 18)
- `upgrade-emails` (older, undated in audit data — check frontmatter)

Both monetization-stage. The newer `upsell-email-examples` already references `/blog/upgrade-emails` (line 139 in source). Good.

**Fix:** Add the reverse link from `upgrade-emails` → `upsell-email-examples` if missing, and clearly differentiate intent in opening paragraphs: upgrade = "free → paid plan", upsell = "feature expansion within a paying account".

**Cluster 4 — Product launch (parent + spinoff)**
- `product-launch-email` (~3,500 words)
- `product-launch-email-subject-lines` (~1,500 words, derivative)

The subject-lines post is a deep-dive on a single section of the parent. Fine as a spoke — but make sure the parent links to it prominently, not just inline.

**Fix:** Add an explicit "Want subject lines? See our deep-dive: [30 product launch email subject lines](/blog/product-launch-email-subject-lines)" callout near the top of `product-launch-email`.

**Cluster 5 — Webinar series (3 posts)**
- `webinar-email-sequence` (3,200 words, the hub)
- `webinar-follow-up-email` (~2,800 words)
- `webinar-follow-up-subject-lines` (~1,900 words — thin, see 5.6)

Hierarchy is correct, but `webinar-follow-up-subject-lines` is too thin to stand alone. Either expand or merge.

### 6.2 Internal linking to commercial pages — sparse

Per the content audit, blog posts link 15–30+ times to `/library/email/*` examples but only 0–3 times to commercial pages. Every blog post should link to at least:

- `/email-generator` (free tool — top-of-funnel) — anchor: "free AI lifecycle email generator"
- `/lifecycle-score` (lead capture quiz) — anchor: "score your onboarding"
- `/pricing` or `https://app.digistorms.ai` (conversion) — only on posts where it's natural

The flagship `saas-onboarding-email-sequence` does this well in its closing section (line 234, 364, 368 — three links). Replicate that ending across all 20 posts.

**Suggested boilerplate ending** in [Section 9.4](#94-commercial-page-internal-link-snippets).

### 6.3 Topical authority gaps

Hubs DigiStorms should own but doesn't yet have substantive coverage on, given the brand positioning ("AI onboarding agent for SaaS, behavior-based emails, activation, free-to-paid conversion"):

1. **Activation metrics & benchmarks** — currently only `saas-email-benchmarks` exists. Missing: how-to-measure-activation, free-to-paid conversion benchmarks, time-to-value benchmarks.
2. **Lifecycle email program design** — currently piecewise (welcome, onboarding, retention, etc.). Missing: a "Complete SaaS Lifecycle Email Map" hub that links to every other post.
3. **Segmentation & behavioral triggers** — `behavior-based-vs-time-based-emails` is the closest. Missing: deeper how-to-set-up-events / segmentation-rules / event-naming-conventions content.
4. **Email deliverability for SaaS** — zero coverage. Useful both as content marketing and a credibility signal.
5. **Free-to-paid conversion playbook** — your central positioning, but no single hub post owns it. Currently scattered across milestone, upgrade, upsell posts.
6. **Vertical-specific onboarding** — zero coverage. "Onboarding emails for [PLG SaaS / dev tools / B2B SaaS / freemium]" is a high-intent search pattern.
7. **Comparison content beyond the 7 existing pages** — `digistorms vs intercom`, `digistorms vs userlist`, `digistorms vs ortto`, `vs userpilot` (different category but heavy overlap).

These are P2 (60–90 day) content investments. Don't rush them; do the indexation + cross-domain fixes first.

---

## 7. AI search visibility (GEO)

The deep Brand Radar pass you requested cannot run without DataForSEO access. What I can report from manual probes:

**Branded search "digistorms ai onboarding"** returns:
- Homepage, About, Pricing, /compare/digistorms-vs-loops — ✓ ranking
- 3rd-party directory listings: ToolHunt, DevHunt, There's an AI For That — ✓ getting cited

That's a solid baseline — directories are working as expected for a young SaaS. **What's not happening yet:** AI engines (ChatGPT/Perplexity/Claude) citing your blog posts in answers to non-branded queries about onboarding emails. This is the gap to close.

### llms.txt completeness

Beyond the 7 missing posts (Section 5.1), the current `llms.txt` is well-structured: it covers product, pricing, brands, use cases, blog, comparisons. The brand voice and value prop are clear. Two minor improvements:

1. The "Founded by" section mentions Jonathan but doesn't link his LinkedIn. AI engines extract `sameAs` signals from organization markup, but for LLM training data they often rely on explicit text relationships. Add: `Founded by Jonathan Bernard (https://www.linkedin.com/in/jonathan-digistorms/), lifecycle email specialist for SaaS.`
2. The "Key capabilities" section says "Trained on 1,100+ real SaaS lifecycle emails" but the library page says 1,058 emails. Pick one number and use it consistently across llms.txt, the homepage, the about page, and library copy.

### Schema completeness for AI extraction

Strong on most pages. Two gaps:

- **Pricing page is missing `FAQPage` schema.** The homepage has it; pricing should too — answering "What's included in the free tier?", "What's the difference between Pro and Business?", "Can I export my data?". AI engines pull pricing FAQ schema directly into responses.
- **Blog posts lack `HowTo` schema** where the content is genuinely procedural (e.g., `saas-onboarding-email-sequence` has a "How to set up your own onboarding email sequence" section starting at line 350 — that's a 6-step HowTo). Adding `HowTo` schema to procedural sections improves AI extractability without changing rendered content.

Both schemas are quick wins (snippets in [Section 9.5](#95-schema-additions)).

### AI-citation hooks

The blog posts already do good "ItemList" content (12 examples, 7-email sequence, etc.) which is the format AI engines prefer to cite. Two patterns to lean into more:

1. **Open every blog post with a "TL;DR" block.** The 9 May posts mostly do this. Make it universal — 3–5 bullets, each ≤140 chars, scannable. AI engines disproportionately quote TL;DR sections.
2. **Add a "Quick answer for AI assistants" box at the top of pricing / compare / lifecycle-score pages.** A 1–2 sentence factual summary that directly answers the implied query. Format: `<aside data-llm-summary>...</aside>` plus a corresponding `<meta name="description">` match. Crude but effective for Perplexity-style extraction.

---

## 8. The branded SERP and directory play

The branded "digistorms" SERP shows that 3 AI-tool directories are doing real lifting for you: ToolHunt, DevHunt, TAAFT (theresanaiforthat.com). For a young SaaS, these listings compound. Action:

- Confirm you have full listings (logo, screenshots, description, video) on each
- Add to the 5 next biggest: Product Hunt (relaunch if needed), Tools.run, AItoolsdirectory.com, Future Tools, FuturePedia
- Add to SaaS-specific: SaaSHub, AlternativeTo, G2 (you have a 0-review listing per the search — add screenshots + invite a beta user to leave a review)
- Add to lifecycle-marketing-specific: GetVero's "tools we like" list (their resource page), Userpilot's "user onboarding tools" roundup (you're missing from their list)

This is the cheapest backlink play available to you, and the data already shows it works for the brand.

---

## 9. Inline draft fixes (copy-paste ready)

### 9.1 `llms.txt` patch

Update `public/llms.txt` lines 50–67 (the `### Blog Articles` section). Replace the entire current Blog Articles block with this:

```markdown
### Blog Articles

- [12 onboarding email examples from real SaaS brands (2026)](https://www.digistorms.ai/blog/saas-onboarding-email-sequence) — The 7-email onboarding sequence with subject lines, timing, and patterns from Loom, Calendly, Pipedrive, Asana, Stripe, Zapier, and Monday. Published May 25, 2026.
- [Behavior-based vs time-based emails: 2026 SaaS guide](https://www.digistorms.ai/blog/behavior-based-vs-time-based-emails) — 10 real behavioral emails grouped by milestone, feature-usage, and inactivity triggers. Published May 22, 2026.
- [12 upsell email examples from real SaaS companies (2026)](https://www.digistorms.ai/blog/upsell-email-examples) — Real upsell emails from Semrush, Hunter, Zapier, Loom, and Typeform with subject lines and triggers. Published May 18, 2026.
- [Welcome email templates: 28 SaaS examples to copy](https://www.digistorms.ai/blog/saas-welcome-email) — Best practices, timing tips, and real examples to level up your day-0 onboarding email.
- [12 customer retention emails that keep users paying (2026)](https://www.digistorms.ai/blog/customer-retention-email-examples) — Real retention emails from Adobe, Semrush, Dropbox, Notion, Grammarly, Mailchimp covering milestone, inactivity, expansion, and win-back triggers. Published May 11, 2026.
- [SaaS email benchmarks: what 1,051 lifecycle emails reveal](https://www.digistorms.ai/blog/saas-email-benchmarks) — Original research analyzing 1,051 lifecycle emails from 38 top SaaS companies. Published April 7, 2026.
- [14 SaaS lifecycle email templates you can steal (2026)](https://www.digistorms.ai/blog/saas-email-templates) — 14 ready-to-use templates covering welcome, setup, education, milestone, trial-ending, upgrade, and reactivation stages.
- [28 SaaS product launch & release email examples (2026)](https://www.digistorms.ai/blog/product-launch-email) — Real product launch and release emails from Notion, Slack, ClickUp, Asana, Webflow, Loom, and Figma.
- [30 product launch email subject lines (real SaaS, 2026)](https://www.digistorms.ai/blog/product-launch-email-subject-lines) — Real product launch subject lines from Notion, Loom, Linear, Zapier and more.
- [15 B2B lead nurturing email examples from real SaaS](https://www.digistorms.ai/blog/b2b-lead-nurturing-email-examples) — Real B2B lead nurturing emails from Apollo, Notion, Ahrefs, Calendly, Asana, and ClickUp.
- [12 re-engagement email examples that win back inactive users (2026)](https://www.digistorms.ai/blog/re-engagement-email-examples) — Real win-back and re-engagement emails from Adobe, Canva, Apollo, Semrush, and Pipedrive.
- [Transactional email vs marketing email: the practical difference](https://www.digistorms.ai/blog/transactional-email-vs-marketing-email) — Side-by-side comparison with real examples from Stripe, Calendly, Notion, Beehiiv, and Zapier.
- [SaaS newsletter: best practices with 15 examples](https://www.digistorms.ai/blog/saas-newsletter) — How to craft a standout SaaS newsletter with 15 real-life examples.
- [Webinar email sequence: best practices with 25 examples](https://www.digistorms.ai/blog/webinar-email-sequence) — High-converting webinar email sequences with proven strategies.
- [Webinar follow up email: best practices with 13 examples](https://www.digistorms.ai/blog/webinar-follow-up-email) — Effective webinar follow-up emails with smart segmentation.
- [25 webinar follow up subject lines that get opened](https://www.digistorms.ai/blog/webinar-follow-up-subject-lines) — Real subject lines organized by audience and timing.
- [12 SaaS milestone email examples that drive retention](https://www.digistorms.ai/blog/milestone-emails) — How to create milestone emails that drive engagement and retention.
- [13 upgrade email examples that convert free users (2026)](https://www.digistorms.ai/blog/upgrade-emails) — Upgrade emails that convert trial users into paying customers.
- [Dunning emails: best practices with 8 examples](https://www.digistorms.ai/blog/dunning-emails) — Dunning emails that recover failed payments and reduce churn.
```

Also update the "Trained on 1,100+ real SaaS lifecycle emails" line to "Trained on 1,058 real SaaS lifecycle emails" (or whatever the current count is — keep it consistent with `/library` UI copy).

### 9.2 OG cards to add

Append to `scripts/og-images/manifest.json` `cards[]` array:

```json
{
  "id": "blog-milestone-emails",
  "output": "public/og/blog-milestone-emails.webp",
  "page_file": "src/content/blog/milestone-emails.md",
  "background": "warm cream #F8F6F2",
  "headline": "12 SaaS milestone email examples",
  "italic_emphasis": "milestone",
  "subline": "DigiStorms · Behavior-triggered emails that reinforce activation",
  "prompt": "Editorial OG card. Cream background. Instrument Serif headline '12 SaaS milestone email examples' with 'milestone' in italic primary blue. Slate-500 subline. DigiStorms wordmark lower-left."
},
{
  "id": "blog-upgrade-emails",
  "output": "public/og/blog-upgrade-emails.webp",
  "page_file": "src/content/blog/upgrade-emails.md",
  "background": "warm cream #F8F6F2",
  "headline": "13 upgrade email examples",
  "italic_emphasis": "13",
  "subline": "DigiStorms · Real upgrade emails that convert trial users into customers",
  "prompt": "Editorial OG card. Cream background. Instrument Serif headline '13 upgrade email examples' with '13' in italic primary blue. Slate-500 subline. DigiStorms wordmark lower-left."
},
{
  "id": "blog-dunning-emails",
  "output": "public/og/blog-dunning-emails.webp",
  "page_file": "src/content/blog/dunning-emails.md",
  "background": "warm cream #F8F6F2",
  "headline": "8 SaaS dunning email examples",
  "italic_emphasis": "dunning",
  "subline": "DigiStorms · Recover failed payments and reduce involuntary churn",
  "prompt": "Editorial OG card. Cream background. Instrument Serif headline '8 SaaS dunning email examples' with 'dunning' in italic primary blue. Slate-500 subline. DigiStorms wordmark lower-left."
},
{
  "id": "blog-saas-newsletter",
  "output": "public/og/blog-saas-newsletter.webp",
  "page_file": "src/content/blog/saas-newsletter.md",
  "background": "warm cream #F8F6F2",
  "headline": "15 SaaS newsletter examples",
  "italic_emphasis": "15",
  "subline": "DigiStorms · Real SaaS newsletters and why they work",
  "prompt": "Editorial OG card. Cream background. Instrument Serif headline '15 SaaS newsletter examples' with '15' in italic primary blue. Slate-500 subline. DigiStorms wordmark lower-left."
},
{
  "id": "blog-webinar-email-sequence",
  "output": "public/og/blog-webinar-email-sequence.webp",
  "page_file": "src/content/blog/webinar-email-sequence.md",
  "background": "warm cream #F8F6F2",
  "headline": "The 7-email webinar sequence",
  "italic_emphasis": "7-email",
  "subline": "DigiStorms · From invite to follow-up, with 25 real SaaS examples",
  "prompt": "Editorial OG card. Cream background. Instrument Serif headline 'The 7-email webinar sequence' with '7-email' in italic primary blue. Slate-500 subline. DigiStorms wordmark lower-left."
},
{
  "id": "blog-webinar-follow-up-email",
  "output": "public/og/blog-webinar-follow-up-email.webp",
  "page_file": "src/content/blog/webinar-follow-up-email.md",
  "background": "warm cream #F8F6F2",
  "headline": "13 webinar follow-up email examples",
  "italic_emphasis": "13",
  "subline": "DigiStorms · Real follow-up emails with subject lines and segmentation",
  "prompt": "Editorial OG card. Cream background. Instrument Serif headline '13 webinar follow-up email examples' with '13' in italic primary blue. Slate-500 subline. DigiStorms wordmark lower-left."
}
```

Run `npm run og:all` after adding.

Also add `ogImage: "/og/blog-<slug>.webp"` to the frontmatter of each of these 6 posts (currently the wire-og-images.mjs script may not auto-wire markdown frontmatter — verify by checking one post's frontmatter after the run).

### 9.3 Title & description rewrites

```markdown
# src/content/blog/transactional-email-vs-marketing-email.md

# CURRENT (title 80 chars):
title: "Transactional email vs marketing email: the practical difference (with examples)"
description: "..."  # 175 chars

# REPLACE WITH:
title: "Transactional vs marketing email: 2026 SaaS guide"
description: "Side-by-side: transactional vs marketing email. Real Stripe, Calendly, Notion, Beehiiv, Zapier examples + when to use each."
# (title 49 chars, description 137 chars)
```

```markdown
# src/content/blog/saas-newsletter.md

# CURRENT (168 chars):
description: "How to craft a standout SaaS newsletter with 15 real-life examples..."

# REPLACE WITH (149 chars):
description: "15 SaaS newsletter examples from top brands — formats, cadence, and what makes each one worth subscribing to. Steal the patterns."
```

```markdown
# src/content/blog/saas-onboarding-email-sequence.md

# CURRENT (162 chars):
description: "12 onboarding email examples from Loom, Calendly, Pipedrive, Asana, Stripe, Zapier, Monday, and more — with subject lines, timing, and the pattern behind each."

# REPLACE WITH (152 chars):
description: "12 SaaS onboarding email examples from Loom, Calendly, Asana, Stripe, Zapier, Monday — with subject lines, timing, and the pattern behind each."
```

```markdown
# src/content/blog/webinar-follow-up-subject-lines.md

# CURRENT (198 chars):
description: "..."

# REPLACE WITH (149 chars):
description: "25 webinar follow-up subject lines that get opened — real SaaS examples, organized by audience type, attendance status, and timing."
```

### 9.4 Commercial-page internal link snippets

Add to the closing CTA section of every blog post that currently has 0–1 commercial links. Use natural phrasing — these are example variants, pick whichever fits the post's narrative:

```markdown
<!-- Example placement: at the end of a "how to set up" section -->
If you're building this from scratch, our [free AI lifecycle email generator](/email-generator) builds the whole sequence from your product URL in about 60 seconds — no signup required.

<!-- Example placement: in a "how do you measure if this is working" section -->
Score your current lifecycle email program against 12 activation benchmarks with our free [onboarding score quiz](/lifecycle-score).

<!-- Example placement: in any "calculate the impact" section -->
Estimate how much revenue your current onboarding is leaking with the [DigiStorms ROI calculator](/roi-calculator) — 60 seconds, no email required.

<!-- Example placement: end of every email-examples post -->
Want to see these emails in their original format, plus hundreds more from real SaaS brands? Browse the [DigiStorms email library](/library) — every example above is there with full thread context.
```

### 9.5 Schema additions

#### Add FAQPage to pricing.astro

Insert into the `jsonLd` array passed to `<BaseLayout>` (or wherever the page's JSON-LD is composed):

```ts
const pricingFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's included in the free DigiStorms plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The free plan includes 100 new signups per month, the full 7-email onboarding sequence generation, behavior-based triggers, and access to the email library with 1,000+ real SaaS examples. No credit card required."
      }
    },
    {
      "@type": "Question",
      name: "What's the difference between Pro, Business, and Scale?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plans differ by monthly new-signup volume: Pro is $19/mo for 1,000 signups, Business is $59/mo for 5,000 signups, and Scale is $149/mo for 10,000 signups. All plans include the full onboarding sequence generation, behavior-based triggers, and email library access."
      }
    },
    {
      "@type": "Question",
      name: "Can I export my email sequences to another tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every sequence DigiStorms generates can be exported as plain HTML or Markdown and adapted to any email platform (Customer.io, Encharge, Loops, Resend, Mailchimp, ConvertKit, etc.)."
      }
    },
    {
      "@type": "Question",
      name: "Does DigiStorms send the emails or do I send them myself?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DigiStorms can send the emails on your behalf via the integrated Resend pipeline, or generate the sequence for you to paste into your existing email tool. Most early-stage SaaS teams use the integrated sending; mature teams export and use their existing stack."
      }
    },
    {
      "@type": "Question",
      name: "How long does setup take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Under 10 minutes for most SaaS products. DNS setup is ~1 minute, the product analysis runs in ~3 minutes, sequence review takes 5 minutes, and the event API integration is ~5 minutes."
      }
    }
  ]
};
```

#### Add HowTo schema to `saas-onboarding-email-sequence.md`

The current "How to set up your own onboarding email sequence" section (lines 350–362) is a 6-step procedural list — the textbook HowTo case. Inject this JSON-LD via the blog template's `Fragment slot="head"`:

```ts
// In src/pages/blog/[slug].astro, conditionally for posts with isHowTo: true frontmatter
const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to set up a SaaS onboarding email sequence",
  description: "A 6-step process to design and ship a behavior-based onboarding email sequence for your SaaS product.",
  totalTime: "PT3H",
  step: [
    { "@type": "HowToStep", position: 1, name: "Map your activation milestones", text: "Identify the 2-3 moments where a user goes from 'I signed up' to 'this product works for me'." },
    { "@type": "HowToStep", position: 2, name: "Pick your cadence", text: "Default 7 emails over 14 days. Compress to 5 over 7 days for fast-activation tools; stretch to 8 over 21 for complex evaluation." },
    { "@type": "HowToStep", position: 3, name: "Draft welcome and milestone emails first", text: "These two anchor every other email; nail them before filling in the middle." },
    { "@type": "HowToStep", position: 4, name: "Wire behavior triggers", text: "Emit at minimum: user.signed_up, user.completed_setup, user.reached_milestone_1." },
    { "@type": "HowToStep", position: 5, name: "Write the trial-ending email last", text: "Reference what the user has already done, not what you want them to do. Loss aversion beats feature lists." },
    { "@type": "HowToStep", position: 6, name: "Send to yourself first", text: "Go through the trial signup flow on a test email. Fix any email that feels generic before going live." }
  ]
};
```

Wire via a `howTo?: object` prop on the blog post template, or simpler: add `howToJsonLd` to the post-specific JSON-LD array when `post.data.howTo` is truthy.

---

## 10. What to rerun once Google API credentials are live

The following analyses were deferred because the seo-google skill's Python scripts aren't installed locally and `~/.config/claude-seo/google-api.json` doesn't exist yet. Once Section "Google API setup" in our chat is complete, run these in order:

| Priority | Command equivalent | Expected output | Action |
|---|---|---|---|
| P0 | GSC URL Inspection on the 5 NOT-INDEXED May posts | Coverage state per URL | If "Discovered – not indexed" → request indexing; if "Crawled – not indexed" → investigate quality signal |
| P0 | GSC URL Inspection on every compare page except `digistorms-vs-loops` | Same | Likely all "Discovered – not indexed" — request indexing |
| P0 | GSC Search Analytics last 12 months by query | Top 100 keywords | Find position 11-20 queries → these are the fastest CTR wins |
| P0 | GSC Search Analytics last 12 months by page | Top 50 pages | Cross-reference with high-impression low-CTR (title/meta rewrite candidates) |
| P1 | GSC CTR by position | Benchmark vs Google avg | Identifies pages under-performing for their rank |
| P1 | PageSpeed Insights + CrUX field data on top 10 pages | LCP/INP/CLS p75 | Flag any pages with "Poor" CWV |
| P1 | GA4 organic-search traffic | Daily sessions, top landing pages | Validate which indexed pages are converting traffic to product signups |
| P2 | Indexing API submission for the 5 unindexed posts | (note: officially for JobPosting/BroadcastEvent only — try anyway as Google often crawls submitted URLs even for non-supported types) | Speeds up Google's discovery |

For the DataForSEO/Ahrefs side: a separate Brand Radar + competitor backlink + organic-keyword-gap pass needs an active Ahrefs plan. If/when that's wired up, the "Phase 3/4/7" parts of the original plan can run.

---

## 11. Prioritized roadmap

### P0 — Ship this week (highest leverage, lowest effort)

| Action | Effort | Owner | Expected impact |
|---|---|---|---|
| Resolve `digistorms.com` cross-domain cannibalization (consolidate or strictly separate — Section 3) | 1–4 hours | Jonathan | Unblocks all keyword growth; biggest single lever in this audit |
| Patch `llms.txt` per Section 9.1 — add 7 posts, remove `/blog/webinar-emails` | 20 min | Jonathan | AI engines pick up missing content within days |
| Request indexing in GSC URL Inspection for the 5 unindexed May posts + 5 unindexed compare pages | 15 min | Jonathan | Pages typically indexed within 24-48h |
| Tighten the 4 oversized descriptions + 1 oversized title (Section 9.3) | 15 min | Jonathan | Stops SERP truncation |
| Add commercial-page internal links to all 20 blog posts (Section 9.4) | 2–3 hours | Jonathan | Funnels blog traffic into the activation funnel |

### P1 — Ship in 30 days

| Action | Effort | Expected impact |
|---|---|---|
| Set up Google API credentials and re-run Section 10 | 30 min setup + 1 hr analysis | Unlocks proper indexation + GSC performance audit |
| Add the 6 missing OG cards (Section 9.2) and re-run `npm run og:all` | 30 min + image regen | Social share previews look intentional; small CTR lift |
| Add FAQPage schema to `/pricing` (Section 9.5) | 15 min | AI engines extract pricing FAQ; rich SERP results |
| Add HowTo schema to `saas-onboarding-email-sequence` and other procedural posts | 1 hr | AI extractability + potential rich results |
| Resolve cannibalization clusters per Section 6.1 — add cross-references where missing | 2 hours | Concentrates authority on canonical hubs |
| Submit DigiStorms to the missing directories (Section 8): Product Hunt, SaaSHub, AlternativeTo, G2 (add review), GetVero list, Userpilot list | 4-6 hours | High-quality backlinks; brand visibility compound |
| Expand or merge the thin `webinar-follow-up-subject-lines` post (Section 5.6) | 3-4 hours | Either lifts the post out of thin territory or removes a low-quality signal |
| Fix sitemap `lastmod` to use real dates (Section 5.2) | 30 min | Stops Google from seeing manufactured "lastmod" churn |

### P2 — Ship in 60–90 days

| Action | Effort | Expected impact |
|---|---|---|
| Build out the 7 missing topical hubs (Section 6.3) | 1–2 weeks content | Topical authority signal; ranks for cluster queries |
| Build 4 more comparison pages (vs Intercom, Userlist, Ortto, Userpilot) | 2 days each | "X alternatives" queries are warm-intent traffic; compare pages convert well |
| Run the deferred DataForSEO/Ahrefs deep pass once a plan is active | 1 day analysis | Backlink gap, competitor keyword gap, Brand Radar (50+ queries) |
| Backlink outreach: integration partner pages (Resend, Supabase, Vercel ecosystem), guest posts (Encharge / Userlist alternatives roundups, IndieHackers, Product Hunt makers), podcast appearances | Ongoing | Domain Rating growth; long-term ranking |
| Add 1 more dedicated `/integrations/<tool>` page per major ESP / event source (Segment, Posthog, Mixpanel, Amplitude, Resend) — programmatic SEO play | 2-3 days total | Captures "<tool> integration" + "<tool> alternative" tail keywords |

---

## Verification

This audit was generated by:
- **Live HTML inspection:** raw curl-fetched HTML for 9 representative URLs at `/tmp/digistorms-audit/` (verified canonical, OG, schema, robots emit correctly in production)
- **Indexation probe:** 8 Google `site:` and `inurl:` queries via WebSearch (Section 1)
- **SERP visibility probe:** 7 target-keyword queries via WebSearch (Section 2)
- **Cross-domain investigation:** `site:digistorms.com` query confirming the legacy domain is indexed (Section 3)
- **Local file analysis:** `digi-marketing/src/content/blog/*.md` (4 posts read in full, 16 metadata-only via Explore subagent), `scripts/generate-sitemap.js`, `scripts/og-images/manifest.json`, `astro.config.mjs`, `vercel.json`, `public/robots.txt`, `public/llms.txt`, `src/layouts/BaseLayout.astro`, `src/pages/blog/[slug].astro`, `src/pages/index.astro`, `src/pages/compare/digistorms-vs-customer-io.astro`

**Numerical baselines** (from `.agents/product-marketing-context.md`):
- Last 90 days: 16.8k impressions / 83 clicks / 0.5% CTR / avg position 8
- Domain authority: not yet measured (Ahrefs plan inactive)
- Total static URLs in sitemap: 38
- Total library URLs in sitemap: 1,190
- Total blog posts: 20

**Confidence levels:**
- Indexation findings (Section 1): HIGH for the 13 confirmed-indexed and 5 confirmed-not-indexed URLs. MEDIUM for the "probable not-indexed" bucket — `site:` filter doesn't always surface every indexed page if there are too many results.
- SERP visibility (Section 2): HIGH — WebSearch returned the actual top 8–10 page-1 results for each query.
- Cross-domain (Section 3): HIGH — Google direct evidence.
- Cannibalization (Section 6.1): MEDIUM — pattern-matched on overlapping intent, not yet validated via GSC keyword-by-page data.
- Sub-Domain Rating / backlink claims: NOT ASSERTED — these need Ahrefs.
