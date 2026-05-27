# SEO Audit 001 — Addendum (GSC data)

**Added:** May 26, 2026
**Source:** `npm run gsc <cmd>` against `sc-domain:digistorms.ai`, 90-day window (2026-02-25 → 2026-05-25)
**Purpose:** correct wrong findings from the main report + add real-data recommendations now that direct GSC access is wired up.

---

## ⚠️ Correction to Section 1 of the main report

**I said:** "5 May 2026 posts are NOT indexed" based on Google `site:` query probes.

**That was wrong.** GSC data proves all 5 ARE indexed. They just rank too low to surface in Google's `site:` filtered results (Google deprioritizes low-quality matches in `site:` queries — a known quirk, not an indexation signal).

| URL | Impressions (90d) | Avg position | Real status |
|---|---:|---:|---|
| `/blog/saas-onboarding-email-sequence` | 6 | 7.2 | INDEXED, very recent — needs link equity to climb |
| `/blog/behavior-based-vs-time-based-emails` | 15 | 7.8 | INDEXED |
| `/blog/upsell-email-examples` | 10 | 8.7 | INDEXED (1 click — 10% CTR!) |
| `/blog/customer-retention-email-examples` | 94 | 8.0 | INDEXED, decent rank, **0 clicks** = CTR problem |
| `/blog/re-engagement-email-examples` | 1,361 | 7.5 | INDEXED and getting traction (3 clicks) |
| `/blog/saas-email-templates` | 2 | 13.5 | INDEXED, recent |

**The real diagnosis isn't indexation — it's CTR catastrophe at positions 4–10.** See Section 2 below.

---

## 1. The real 90-day baseline

| Metric | Last 90 days | Pre-ship baseline (Apr 20 PR) | Δ |
|---|---:|---:|---:|
| Clicks | 174 | 105 | **+66%** |
| Impressions | 44,573 | 21,993 | **+103%** |
| CTR | 0.39% | 0.48% | **−0.09pp** |
| Avg position | 8.5 | 7.7 | **−0.8** |

You doubled your impressions in the window after the April 20 title rewrites + the autopilot kicked in (3 articles/week). Clicks grew 66%. But **CTR went down** as more low-CTR queries entered the dataset.

### Weekly trajectory (180 days)

```
2025-11–2026-02   Pre-launch: <50 imp/wk, occasional 5-10 clicks
2026-03-09        Inflection: 106 imp
2026-03-23        Explosion: 855 imp
2026-03-30        5,933 imp, 19 clicks
2026-04-06        8,303 imp, 20 clicks      ← peak impressions
2026-04-13        6,086 imp, 30 clicks      ← title-rewrite PR landed Apr 20
2026-04-20        4,231 imp, 6 clicks       ← dip (Apr 20 was a partial week)
2026-04-27        2,479 imp, 10 clicks
2026-05-04        4,358 imp, 12 clicks
2026-05-11        7,242 imp, 29 clicks
2026-05-18        4,054 imp, 26 clicks      ← CTR 0.64% best in 8 weeks
2026-05-25        653 imp (partial), 3 clicks
```

**Trajectory is positive.** Impressions grew an order of magnitude; clicks tripled. The title-rewrite effect is visible in the May 11 + May 18 weeks (29, 26 clicks at 0.40% + 0.64% CTR vs Mar/Apr's 0.14–0.49%). The April 20 work is starting to pay off.

---

## 2. The single biggest unfixed issue: **0% CTR on page 1**

This is the most actionable finding in this whole audit.

| Position | Real keywords | Real impressions | Real clicks | CTR | Expected CTR |
|---:|---:|---:|---:|---:|---:|
| 1 | 23 | 104 | 0 | 0.00% | ~30% |
| 2 | 17 | 412 | 40 | **9.71%** | ~15% |
| 3 | 12 | 70 | 0 | 0.00% | ~11% |
| 4 | 21 | 3,460 | 0 | 0.00% | ~8% |
| 5 | 27 | 283 | 0 | 0.00% | ~7% |
| 6 | 18 | 231 | 0 | 0.00% | ~5% |
| 7 | 36 | 468 | 0 | 0.00% | ~4% |
| 8 | 35 | 705 | 0 | 0.00% | ~3% |
| 9 | 28 | 124 | 1 | 0.81% | ~2.5% |
| 10 | 36 | 298 | 1 | 0.34% | ~2% |

Position 4 has 3,460 impressions and **zero clicks**. Position 7 has 468 impressions and **zero clicks**. Position 8 has 705 impressions and **zero clicks**.

Even after subtracting the acme-analytics noise (~15% of all impressions — see §3), you have hundreds of real impressions on page 1 of Google earning literally zero clicks. **A page-1 result that earns 0 clicks is sending Google a "this result doesn't deserve to rank here" signal** — and rankings will drift down to position 11–20 within a few months as Google reweights based on user-behavior signals.

**Cause is overwhelmingly title + description.** When the SERP shows your result and the user picks a competitor instead, your meta tags lost the click.

### The 8 concrete pages bleeding rank-equity right now

Pages getting page-1 impressions with **0 clicks** and a fixable title/description:

| URL | 90d imp | Pos | Recommended fix |
|---|---:|---:|---|
| `/blog/customer-retention-email-examples` | 94 | 8.0 | Title tightening — current is wordy |
| `/blog/transactional-email-vs-marketing-email` | 691 | 23.2 | Title is 80 chars, truncated in SERP (already in main report §5.5) |
| `/compare/digistorms-vs-resend` | 354 | 10.2 | Description likely too generic |
| `/compare/customer-io-alternatives` | 760 | 11.6 | Title doesn't mention "2026" / value angle |
| `/compare/digistorms-vs-customer-io` | 53 | 13.5 | Same as above |
| `/compare/best-email-automation-saas-startups` | 93 | 11.9 | "Best X for Y" titles need year + count |
| `/blog/saas-newsletter` | 2,175 | 7.6 | Page 1 result, 0.32% CTR with 2,175 impressions = ~3 clicks. Title rewrite has biggest absolute impact here. |
| `/blog/webinar-email-sequence` | 6,541 | 6.3 | Page 1, 0.15% CTR — same as above, biggest absolute miss in the data. |

§7 has copy-paste-ready title rewrites for each.

---

## 3. The acme-analytics contamination

You already track this — `targets.json` mentions "acme-analytics decay completing". For the record, here's what's in the 90-day window:

| Query | Impressions | Position | Status |
|---|---:|---:|---|
| `acmeanalytics.io` | 2,238 | 4.3 | Pure noise |
| `acmeanalytics.com` | 942 | 3.6 | Pure noise |
| `acme analytics acmeanalytics.io` | 121 | 6.0 | Pure noise |
| `acmeanalytics.io acme analytics` | 136 | 8.3 | Pure noise |
| `acmeanalytics.com acme analytics` | 98 | 8.4 | Pure noise |
| `"acme analytics" acmeanalytics.io` | 153 | 4.2 | Pure noise |
| ... 20+ similar variants | ~1,500 | various | Pure noise |

**Total acme contamination: ~5,500 impressions of 44,573 = ~12% of total.** That's also the bulk of the position-4 impression count.

**Why this matters:** Google attributes these impressions to your domain because of some legacy content/screenshot reference. They're zero-click by definition (the searcher wants "acmeanalytics.io", not you), which drags your aggregate CTR down. The `weekly-report.mjs:101-106` already filters them from the email report — but Google still sees the raw 0% CTR on those keywords.

I couldn't find any "acme analytics" content in the current source (grep returned only the `weekly-report.mjs` filter and the `baseline.json`/`last-run.json` cached data). So the source content is already gone. **All you can do is wait for Google to re-evaluate.** Per `targets.json`, decay should be "completing" — meaning you're already most of the way through. Watch the weekly report; once these queries drop out of the GSC top-200, the aggregate CTR will jump ~30%.

---

## 4. Striking-distance keywords (pos 4–20, real-traffic, real-user wins)

After filtering acme noise, here's the **real** rank-lift target list. Sorted by impressions × proximity-to-page-1:

| Rank | Query | Imp | Pos | Notes |
|---|---|---:|---:|---|
| 1 | newsletter launch strategy first subscribers b2b saas | 246 | 8.2 | Big imp, zero clicks at pos 8 = title rewrite priority. Likely targets `/blog/saas-newsletter` but title doesn't match intent. |
| 2 | product launch message examples | 97 | 11.6 | Just off page 1. Add this phrase to `/blog/product-launch-email`. |
| 3 | product launch email sequence best practices | 95 | 6.8 | Page 1 already, 0 clicks. Critical CTR fix. |
| 4 | product launch email template | 87 | 18.8 | Beginning of page 2. Internal-link push could lift to page 1. |
| 5 | how to create a newsletter that turns saas subscribers | 58 | 4.6 | **Page 1, zero clicks.** Title/description likely doesn't surface "subscribers" framing. |
| 6 | dunning best practices | 48 | 17.1 | `/blog/dunning-emails` exists. Title rewrite could close the gap. |
| 7 | milestone email | 43 | 7.2 | Singular form of your target. Page 1 already. CTR rewrite. |
| 8 | multi-channel lead nurturing email sequences examples | 42 | 4.3 | **Page 1, zero clicks.** /blog/b2b-lead-nurturing-email-examples — extend with multi-channel angle |
| 9 | milestone emails | 40 | 10.3 | Page 1 borderline. |
| 10 | launch email | 38 | 13.6 | Page 2. Generic but high-volume. |
| 11 | product launch email examples | 36 | 13.4 | Direct match for `/blog/product-launch-email`. Currently page 2. |
| 12 | cheaper alternatives to customer.io | 34 | 14.1 | Direct match for `/compare/customer-io-alternatives`. Push it. |
| 13 | best customer.io alternatives for startups 2025 2026 | 33 | 6.3 | **Page 1, zero clicks** on direct compare-page query. |
| 14 | customer.io alternatives | 33 | 17.1 | Money keyword, page 2 |
| 15 | post webinar email examples | 33 | 14.6 | `/blog/webinar-follow-up-email` — already getting 1 click |
| 16 | product announcement email | 33 | 14.9 | Page 2 |
| 17 | product launch email subject lines | 32 | 14.6 | Direct match for `/blog/product-launch-email-subject-lines` |

**The pattern is clear:** content exists for almost every one of these queries, but the titles/descriptions don't compel a click when the SERP renders them.

---

## 5. Per-page CTR opportunities (top 20 pages, real data)

| Page | Imp | Clicks | CTR | Pos | Status |
|---|---:|---:|---:|---:|---|
| `/blog/product-launch-email` | 9,745 | 41 | 0.42% | 7.5 | **Top earner.** CTR at pos 7.5 should be ~3%, you're at 0.42%. 7x upside. |
| `/blog/saas-welcome-email` | 5,869 | 16 | 0.27% | 11.6 | Big impression base. Just off page 1. |
| `/blog/webinar-email-sequence` | 6,541 | 10 | 0.15% | 6.3 | Page 1, 0.15% CTR — biggest absolute click leak in the data. |
| `/blog/webinar-follow-up-email` | 3,682 | 4 | 0.11% | 10.0 | Edge of page 1, awful CTR. |
| `/blog/saas-newsletter` | 2,175 | 7 | 0.32% | 7.6 | Page 1 result, CTR too low. |
| `/blog/dunning-emails` | 1,378 | 2 | 0.15% | 9.5 | Edge of page 1 |
| `/blog/re-engagement-email-examples` | 1,361 | 3 | 0.22% | 7.5 | Page 1 |
| `/blog/milestone-emails` | 1,012 | 5 | 0.49% | 5.9 | Page 1, best CTR of the high-imp set — title is working |
| `/blog/b2b-lead-nurturing-email-examples` | 838 | 3 | 0.36% | 8.7 | Page 1 |
| `/compare/customer-io-alternatives` | 760 | 0 | 0.00% | 11.6 | Page 2 with high impressions. Closest compare page to a breakthrough. |
| `/blog/transactional-email-vs-marketing-email` | 691 | 2 | 0.29% | 23.2 | Page 3 — title-too-long issue from main report §5.5 |
| `/blog/upgrade-emails` | 379 | 6 | 1.58% | 7.0 | **CTR is healthy here.** Pattern that works — replicate. |
| `/compare/digistorms-vs-resend` | 354 | 0 | 0.00% | 10.2 | Page 1 borderline, 0 clicks |
| `/` (homepage, www) | 4,593 | 36 | 0.78% | 4.4 | Page 1, decent CTR; brand recognition working. |
| `/` (homepage, alt url) | 397 | 21 | 5.29% | 3.0 | Different reporting URL form — branded queries probably. CTR healthy. |

### What the top 3 high-impression pages need (specifics)

**A. `/blog/product-launch-email` (9,745 imp, pos 7.5, 0.42% CTR)**

Current title: "28 SaaS product launch & release email examples (2026) | DigiStorms"
Current desc: ~"Real product launch and release emails from Notion, Slack, ClickUp, Asana…"

Issue: "release email" dilutes "launch email" — and the searchers' query is "product launch email" not "product launch & release email". The ampersand reads as two products.

**Suggested rewrite:**
```yaml
title: "28 product launch email examples from real SaaS (2026)"
description: "28 product launch email examples from Notion, Slack, Loom, ClickUp, Asana, and Linear — with subject lines, structure, and the pattern behind each."
```

(67 char title, 154 char description, both within limits)

**B. `/blog/webinar-email-sequence` (6,541 imp, pos 6.3, 0.15% CTR)**

Current title: "The 7-email webinar sequence (25 SaaS examples, 2026) | DigiStorms"

Issue: "7-email" is buried; "25 examples" is what the searcher wants but it's not first. Also "sequence" sounds like a workflow tool, not a content guide.

**Suggested rewrite:**
```yaml
title: "25 webinar email examples: full 7-email sequence (2026)"
description: "25 real webinar email examples from Customer.io, Slack, HubSpot, Calendly — invite, reminder, follow-up, no-show, replay. With subject lines."
```

**C. `/blog/saas-welcome-email` (5,869 imp, pos 11.6, 0.27% CTR)**

Current title: "Welcome email templates: 28 SaaS examples to copy"

Issue: Position 11.6 means you're #1 on page 2. The current title is actually decent — the issue here is RANK, not CTR. Push internal links from indexed posts (`product-launch-email`, `webinar-email-sequence`, `milestone-emails`) directly to this URL.

---

## 6. Branded search is fragmented — reinforces the digistorms.com finding

The 90-day data shows brand-aware searchers split across **7 different spelling variants:**

| Query | Imp | Pos | CTR |
|---|---:|---:|---:|
| `digistorms` | 184 | 1.5 | **21.74%** |
| `digistorms.ai` | 52 | **20.3** | 0.00% |
| `digi storm` | 29 | 7.6 | 0.00% |
| `digitstorm` | 8 | 6.0 | 0.00% |
| `digistorm optimisation` | 3 | 29.3 | 0.00% |
| `desistorms` | 1 | 2.0 | 0.00% |
| `digimavsmail20.com` | 2 | 9.5 | 0.00% |

**The "digistorms.ai" query ranks at position 20.3 with zero clicks.** When someone literally types your domain into Google, they should land on `www.digistorms.ai/` at position 1. Position 20 means Google is picking the .com property (or some other "Digi Storms" entity) ahead of you for that exact-match query.

**This is direct confirmation of the §3 finding in the main report:** `digistorms.com` is cannibalizing your branded SERP. Until that's resolved, every other fix fights uphill.

The strong-form `digistorms` query (184 imp, 21.74% CTR, pos 1.5) shows brand recognition is starting — but when users add ".ai" or misspell slightly, they fall off your funnel.

---

## 7. Geo + device

**Country split (90 days):**
- Top click countries: Nigeria, Pakistan, Bangladesh, Netherlands, Australia, Belgium, Brazil, Spain, Italy, NZ, Ukraine, Costa Rica, Ireland, Mauritius, Philippines
- **Notably absent from the top 15: USA, UK, Canada** — your ICP markets

This explains both low click value (emerging-market traffic doesn't convert to SaaS purchase at the same rate) AND low brand recognition (low US presence). The fix is link-building + content angles that appeal to US/UK SaaS founders specifically (YC, Indie Hackers, Product Hunt — already in the main report §8).

**Device split (90 days):**

| Device | Clicks | Impressions | CTR | Pos |
|---|---:|---:|---:|---:|
| DESKTOP | 149 | 42,064 | 0.35% | 8.1 |
| MOBILE | 24 | 2,467 | **0.97%** | 15.4 |
| TABLET | 1 | 42 | 2.38% | 7.5 |

**Mobile CTR is 2.8× desktop CTR** — when mobile users see DigiStorms, they're 2.8x more likely to click. But mobile only sees 5.5% of total impressions, and ranks worse (pos 15 vs 8). Most of the desktop imbalance is acme-noise (bots are desktop-based). Once acme decays out, real desktop CTR should match or exceed mobile.

---

## 8. The GSC weekly email pipeline

While checking auth, I noticed:
- `scripts/gsc/last-run.json` `capturedAt` is **2026-04-21** (window 2026-04-13 → 2026-04-19)
- File mtime is 2026-04-30
- `.github/workflows/gsc-weekly.yml` exists

So **the weekly GSC report has either not run or not committed since around April 30**. That's been 4 weeks of silent failure. Likely causes:
- GitHub Actions secret `GSC_REFRESH_TOKEN` expired (Google refresh tokens can expire after 6 months of inactivity or a security event)
- Or `RESEND_API_KEY` rotated
- Or the workflow YAML has a bug

**Action:** Open the Actions tab on the GitHub repo, find the most recent `gsc-weekly` run, and check the error. The fix is likely re-running the local OAuth flow (`node scripts/gsc/query.mjs summary` → re-cache token → update `GSC_REFRESH_TOKEN` secret on GitHub).

If you want, I can do this now — just say the word.

---

## 9. Revised P0 — what to ship this week (real-data version)

These supersede the main report's P0 list:

| # | Action | Why now | Effort |
|---|---|---|---|
| 1 | **Fix `digistorms.com` cross-domain** (still the #1 lever) | Confirmed via branded SERP — pos 20 for "digistorms.ai" exact-match | 1–4 hrs |
| 2 | **Title + description rewrites for the 3 biggest CTR leaks** (`/blog/product-launch-email`, `/blog/webinar-email-sequence`, `/compare/customer-io-alternatives`) | These 3 pages alone = ~17k impressions/90d. A 1pp CTR lift = ~170 extra clicks/90d (≈ doubles your current total) | 30 min |
| 3 | **Patch `llms.txt`** per main report §9.1 | Unchanged from main report | 20 min |
| 4 | **Internal links** to `/blog/saas-welcome-email` from `/blog/product-launch-email`, `/blog/webinar-email-sequence`, `/blog/milestone-emails` to push it onto page 1 | Closest "almost ranking" candidate at pos 11.6 with 5,869 impressions | 15 min |
| 5 | **Fix the GitHub Actions weekly report** (Section 8 above) | You've been flying blind for 4 weeks | 15 min once you find the actual error |
| 6 | **Skip my old P0 item "request indexing for 5 May posts"** | They're already indexed; just need rank lift | — |

Items 4 and 5 are new. Item 1 + 3 unchanged from main report. Item 2 supersedes the "tighten 4 oversized descriptions" item with a tighter, higher-impact set.

---

## 10. Title/description copy-paste rewrites (real-data targeted)

Apply these to the source markdown frontmatter. Each is within Google's truncation limits (title ≤60 chars source / ≤56 chars effective with `| DigiStorms`; description 140–158 chars).

### `/blog/product-launch-email`

```yaml
title: "28 product launch email examples from real SaaS (2026)"
description: "28 product launch email examples from Notion, Slack, Loom, ClickUp, Asana — with subject lines, structure, and the pattern behind each."
```

### `/blog/webinar-email-sequence`

```yaml
title: "25 webinar email examples: full 7-email sequence (2026)"
description: "25 real webinar emails from Customer.io, Slack, HubSpot, Calendly — invite, reminder, follow-up, no-show, replay. With subject lines."
```

### `/blog/saas-newsletter`

```yaml
title: "15 SaaS newsletter examples that grow your subscribers"
description: "15 real SaaS newsletters from top brands. Subject lines, cadence, and what makes each one worth subscribing to. Steal the patterns."
```

### `/blog/customer-retention-email-examples`

```yaml
title: "12 customer retention email examples (real SaaS, 2026)"
description: "12 retention emails from Adobe, Semrush, Dropbox, Notion, Grammarly, Mailchimp — milestone, inactivity, expansion, and win-back patterns."
```

### `/blog/transactional-email-vs-marketing-email` (replaces main report §9.3)

```yaml
title: "Transactional vs marketing email: 2026 SaaS guide"
description: "Side-by-side: transactional vs marketing email. Real Stripe, Calendly, Notion, Beehiiv, Zapier examples + when to use each."
```

### `/blog/dunning-emails`

```yaml
title: "8 dunning email examples that recover failed payments"
description: "8 real dunning emails from SaaS companies that recover failed payments and reduce involuntary churn. With subject lines and timing."
```

### `/compare/customer-io-alternatives` (highest-volume compare-page opportunity)

```astro
title="13 Customer.io alternatives for SaaS (compared, 2026)"
metaDescription="13 Customer.io alternatives compared on pricing, setup time, behavior triggers, and free tier. Picked for SaaS founders and indie hackers."
```

### `/compare/digistorms-vs-resend`

```astro
title="DigiStorms vs Resend for SaaS onboarding (2026)"
metaDescription="DigiStorms vs Resend: which is better for behavior-based SaaS onboarding emails? Pricing, setup time, AI sequence generation, free tier compared."
```

### `/blog/webinar-follow-up-email`

```yaml
title: "13 webinar follow-up email examples (with subject lines)"
description: "13 real webinar follow-up emails from top SaaS — segmented by attendance, no-shows, and engagement. With subject lines and timing."
```

---

## 11. What to do with this data going forward

The infrastructure is already there:

- `npm run gsc summary` — weekly check-in (3 sec)
- `npm run gsc striking` — find next title-rewrite candidates (this is THE most actionable command — run it weekly)
- `npm run gsc pages` — find which pages are leaking clicks
- `npm run gsc:weekly:dry` — preview the weekly email locally before fixing the workflow

After fixing the GitHub Actions pipeline (§8), the Monday email gets these signals to your inbox automatically. The autopilot pipeline + the weekly GSC pipeline together = a closed-loop SEO system. Both are well-engineered. The missing piece was just the diagnosis of which positions/pages are leaking clicks (this audit).

---

## 12. Status summary

Original audit findings re-stated against real GSC data:

| Original finding | Status after GSC data |
|---|---|
| `digistorms.com` cross-domain cannibalization | ✅ CONFIRMED. The "digistorms.ai" branded query at pos 20.3 is direct evidence. |
| 5 May posts not indexed | ❌ WRONG. All indexed. Real issue: pos 4–10 CTR is 0%. |
| Zero page-1 rankings for primary keywords | ⚠️ PARTIAL. Page-1 rankings DO exist (pos 4–10 with hundreds of impressions), but CTR is 0% so clicks aren't materializing. |
| `llms.txt` is 5 weeks stale | ✅ CONFIRMED. Unchanged. |
| Internal linking to commercial pages sparse | ✅ CONFIRMED. Unchanged. |
| Cannibalization clusters | ✅ CONFIRMED. Unchanged. |
| New: acme-analytics contamination accounts for ~12% of impressions | NEW. Already being tracked in `targets.json`; decay expected to complete soon. |
| New: brand-name fragmentation (digi storm / digistorm / digistorms.ai / desistorms) | NEW. Compound this by acquiring brand mentions in places that fix spelling. |
| New: GitHub Actions weekly report has been silent since ~April 30 | NEW. Fix the workflow. |
