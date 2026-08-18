# DigiStorms Keyword Bank — content autopilot source of truth (no Ahrefs)

Created 2026-06-16 from a final Ahrefs harvest (matching/related terms + competitor keyword gaps)
**before the paid Ahrefs plan was cancelled.** There is no Ahrefs MCP anymore — do **not** try to call it.

> **Restructured 2026-07-27 after a GSC review.** The bank had 64 pending rows averaging
> **117 searches/month**. Total addressable volume of the entire remaining 8-month plan was
> ~7,500/mo — so even ranking #1 on every row could not move the number. It was also badly
> cannibalized: 8 separate survey/feedback rows (on top of two already-published posts on that
> topic), 10 drip-campaign rows, and #48/#49 were the same keyword written twice.
>
> Meanwhile the 8 rows shipped Jun 18 → Jul 27 produced **~5 clicks between them**, while five
> posts from Mar–May carried 80% of all blog clicks. The difference was volume: the winners
> target 500–1,000+/mo head terms, the bank targeted 40–150/mo tails.
>
> The 64 rows below are consolidated into **11 targets**. Everything cut was not deleted — it was
> folded into the cluster that owns it, either as a section of a new pillar or as expansion scope
> for the refresh of an existing post.

## Hard rules (added 2026-07-27)

1. **Minimum 300/mo volume** for a standalone new article. A cluster of tails counts if their
   combined volume clears 300 *and* they share one search intent — a 40/mo keyword does not earn
   its own URL.
2. **Check for cannibalization before queueing.** If an existing post in `src/content/blog/`
   already targets the same intent, the row is a **refresh** of that post, not a new article.
   Two posts splitting one intent rank worse than one post owning it.
3. **No new article ships while a refresh row is pending.** Refreshes beat new posts right now:
   26,987 clickable impressions are stranded on pages 2–4, which is demand already earned but
   uncollectable. See `scripts/gsc/baseline-2026-07-27-reset.md`.
4. **Cadence is 1/week (Mondays).** Dropped from 2/week on 2026-07-27 — publishing faster into a
   thin queue was adding pages, not traffic.

## How the autopilot uses this file

1. Pick the **first `[ ]` row in priority order**. Rows marked **REFRESH** rewrite an existing
   post; rows marked **NEW** create one; rows marked **COMPARE** create a `/compare/` page.
2. Use the stored `vol` / `KD` as the metrics (no live re-check). Put them in the commit message
   + Slack note.
3. Confirm the row's library tags each have ≥ 8 matching emails in `src/data/library/emails.json`
   (`jq`); rows marked **[thin]** have < 8 — use fewer examples.
4. On a REFRESH row, **set the `updated:` frontmatter field to today's date.** That drives
   schema.org `dateModified`; without it Google cannot tell the post changed and the refresh is
   wasted.
5. After shipping, mark the row `[x]` with date + URL.
6. **Replenish:** when pending rows drop below ~4, Slack-alert Jonathan. Do NOT silently run dry.

Runway: at **1 article/week**, 11 targets ≈ **11 weeks**.
Legend: `Q` = was in old calendar queue · `[thin]` = < 8 library examples ·
`gap` = sourced from competitor keyword-gap export · `folds:` = old row numbers absorbed.

---

## Priority queue

> **Ordering is by distance-to-page-1 on the page's *actual* head query**, measured with
> `node scripts/gsc/query.mjs keywords days=90 page=/blog/<slug>` — not by the page's total
> impressions. Total impressions are spread across dozens of tail terms; what converts is one
> strong term crossing onto page 1. A term at pos 11.7 is a far shorter move than one at 22.2,
> even if the second page has more impressions overall.

| # | Status | Type | Keyword (target) | Head query today | Vol | KD | Library tags | Working title |
|---:|---|---|---|---|---:|---:|---|---|
| A1 | [x] | REFRESH | product launch email + product launch message examples + new product launch email examples | **1,579 imp @ pos 11.7** (and 738 imp @ pos 6.2) | 1,000 | 5 | product-update, new-feature-nudge, feature-update | **Refresh `/blog/product-launch-email`** — the single highest-value target on the site. Already our best page (19,345 imp, 118 clicks, pos 9.0) and its head term is **one position off page 1** with 1,579 impressions earning 1 click. Absorb `new feature announcement`, `software upgrade notification`, `product update email examples`, `feature launch`. Old row #4 was already skipped as a duplicate of this post — fold it in properly this time. folds: 16, 25, 26, 53, 54 — **2026-08-18** https://www.digistorms.ai/blog/product-launch-email (before: `product launch email` 2,073 imp @ pos 11.3, 2 clicks; retitled to lead with the bare head term, added TL;DR + definition + 3 copy-paste templates + short-form launch-message and feature-announcement/upgrade-notification sections) |
| A2 | [ ] | REFRESH | webinar email sequence + webinar email template + post webinar email examples | **980 imp @ pos 13.2** | 400 | 8 | webinar-invitation, webinar-recording, follow-up | **Refresh `/blog/webinar-email-sequence`** — 11,335 imp total, one concentrated head term just off page 1. Note `webinar email template` sits at pos 35.0 on 114 imp — same page, so lift it in the same pass. Absorb `event invitation`, `demo invitation`. folds: 57, 58 |
| A3 | [ ] | REFRESH | welcome email template + welcome email + welcome emails | **326 imp @ pos 22.2** (page total 18,405 imp @ pos 19.7) | 500 | 9 | welcome-paid-users, welcome-free-users, trial-just-started | **Refresh `/blog/saas-welcome-email`** — biggest impression pool on the site but the head term is on page 3 and the page drifted from pos 6.0 in April, so this is a longer haul than A1/A2. Retarget hard to `welcome email template`; absorb `welcome email design`, `what is a welcome email`, `welcome series email flow`, `welcome email to new customer`. folds: 15, 42, 44, 61 |
| A4 | [ ] | REFRESH | webinar follow up email + post webinar email + best webinar follow up emails | 9 imp @ pos 13.0 (page total 6,812 imp @ pos 14.0) | 350 | 7 | webinar-recording, follow-up | **Refresh `/blog/webinar-follow-up-email`** — impressions are real but scattered across long-tail conference/event phrasings with no single head term, so expect a slower payoff than A1–A3. Had zero outbound internal links. Merge in `/blog/webinar-follow-up-subject-lines` if the two keep splitting the intent. |
| A12 | [ ] | REFRESH | survey email examples + how to ask for feedback in email + survey reminder/invitation | 3 imp total — **not yet ranking** | 690 | 3 | survey, nps-survey, qualitative-feedback | **Refresh `/blog/feedback-request-email`** into the cluster owner. Deliberately last: the post is too new to have earned any position to reclaim (3 impressions in 90 days), so there is nothing to lift yet — but the 8-row cannibalization still needs collapsing into it before it can rank. Absorb `nps survey email`, `customer satisfaction survey email`, `customer feedback email template/examples`. folds: 11, 18, 22, 23, 30, 31, 35, 56 |
| A5 | [ ] | NEW | email drip campaign + what is email automation + email automation ideas/workflows/strategy | 1,360 | 20 | content-engagement, product-education, feature-usage-nudge | **Email Drip Campaigns for SaaS: The Complete Guide** — highest-volume target in the bank. Pillar page; should become the hub the drip/automation cluster links into. folds: 13, 14, 24, 34, 37 |
| A6 | [ ] | COMPARE | best transactional email service + transactional email services/providers | 800 | 7 | payment-receipt, email-verification, password-reset | **`/compare/best-transactional-email-services`** — commercial intent, so it belongs in `/compare/` not `/blog/`. #48 and #49 were the same keyword written twice. folds: 48, 49 |
| A7 | [ ] | NEW | drip campaign templates + email sequence templates + drip campaign examples/best practices | 500 | 9 | content-engagement, product-education | **Drip Campaign Templates for SaaS (Copy-Paste)** — the template/example half of the A5 cluster; keep it distinct from A5's guide intent and cross-link both ways. folds: 12, 19, 20, 32, 33 |
| A8 | [ ] | NEW | saas onboarding checklist + saas customer onboarding checklist `gap` | 400 | 3 | setup-prompt, onboarding-checklist, trial-just-started | **SaaS Onboarding Checklist (+ Email Examples)** — the two old rows were the same keyword. Note `/blog/saas-onboarding-checklist` already 301s to the onboarding sequence post; reuse that slug rather than creating a second URL. folds: 10, 62 |
| A10 | [ ] | NEW | saas marketing automation `gap` + marketing automation kpis + saas onboarding kpis | 600 | 6 | feature-usage-nudge, usage-expansion, content-engagement | **SaaS Marketing Automation: Strategy, KPIs and Workflows** — the only genuinely uncovered strategy-level cluster left. folds: 50, 64, 66 |
| A11 | [ ] | NEW | win back email examples + win back subject lines + re-engagement subject lines | 280 | 10 | re-engage-cancelled-users, inactivity-nudge | **Win-Back Email Examples That Recover Churned Users** — under the 300 floor, but `/blog/re-engagement-email-examples` already ranks pos 7.5 and can absorb this as a refresh instead if volume doesn't verify. folds: 9, 28, 43 |

---

## Folded in, not lost

Every cut row lives on as scope inside the target that owns its intent:

| Cluster | Old rows | Now |
|---|---|---|
| Survey / feedback | 11, 18, 22, 23, 30, 31, 35, 56 | A4 (refresh `feedback-request-email`) |
| Drip / automation guide | 13, 14, 24, 34, 37 | A5 |
| Drip / automation templates | 12, 19, 20, 32, 33 | A7 |
| Transactional (commercial) | 48, 49 | A6 |
| Transactional (examples) | 46, 47, 67, 68, 71 | refresh `/blog/transactional-email-examples` |
| Welcome | 15, 42, 44, 61 | A1 |
| Product / feature updates | 16, 25, 26, 53, 54 | A1 (refresh `product-launch-email`) |
| Onboarding checklist | 10, 62 | A8 |
| Automation / onboarding KPIs | 50, 64, 66 | A10 |
| Win-back / re-engagement | 9, 28, 43 | A11 |
| Trial | 21, 36, 51, 52, 69 | refresh `/blog/free-trial-email` + `/blog/trial-drop-off-emails` |
| Events / webinars / demos | 57, 58, 59, 60 | A2, A3 |
| Retention / engagement | 27, 29, 38, 39, 40, 41, 55 | refresh `/blog/customer-retention-email-examples` |

**Dropped outright** (no intent worth a URL, all ≤ 70/mo and mostly `[thin]` on library examples):
17 scheduled maintenance · 45 account setup · 63 onboarding saas tools roundup · 65 customer
segmentation · 70 quota reached · 72 year in review. Revisit only if a keyword refill shows real
volume.

---

## Shipped

| # | Status | Keyword (target) | Vol | KD | Library tags | Ex | Title + URL |
|---:|---|---|---:|---:|---|---:|---|
| 1 | [x] | trial drop off `Q` | 80 | 12 | inactivity-nudge, trial-expiration-warning, trial-extension-offer | 10 | SaaS Trial Drop-Off Playbook: 10 Recovery Emails — 2026-06-18 https://www.digistorms.ai/blog/trial-drop-off-emails |
| 2 | [x] | lifecycle email marketing examples `Q` | 150 | 3 | (mix: 2-3 per use case) | 20 | Lifecycle Email Marketing: 20 Examples by Stage — 2026-07-06 https://www.digistorms.ai/blog/lifecycle-email-marketing-examples |
| 3 | [x] | transactional email examples `Q` | 150 | 8 | payment-receipt, email-verification, password-reset, payment-declined | 12 | Transactional Email Examples (12 from Real SaaS) — 2026-07-13 https://www.digistorms.ai/blog/transactional-email-examples |
| 4 | [x] | product announcement email `Q` | 100 | 1 | new-feature-nudge, product-update, feature-update | 12 | ~~Product Announcement Email Templates~~ — 2026-07-16 skipped: already covered by https://www.digistorms.ai/blog/product-launch-email (same 3 library tags; that post defines launch/release/announcement and covers the term 18×). Refresh-only. |
| 5 | [x] | feedback request email `Q` | 150 | 0 | survey, nps-survey, qualitative-feedback | 12 | 12 Feedback Request Email Examples (From Real SaaS) — 2026-07-16 https://www.digistorms.ai/blog/feedback-request-email |
| 6 | [x] | nps email / email nps `Q` | 100 | 4 | nps-survey, survey | 8 | 8 NPS Email Examples That Actually Get Answered — 2026-07-22 https://www.digistorms.ai/blog/nps-email-examples |
| 7 | [x] | free trial email `Q` | 70 | 1 | trial-just-started, trial-expiration-warning, trial-extension-offer | 10 | Free Trial Email Sequence (Examples + Templates) — 2026-07-24 https://www.digistorms.ai/blog/free-trial-email |
| 8 | [x] | subscription cancellation email `Q` | 40 | 1 | downgrade-receipt, re-engage-cancelled-users, payment-declined | 10 | Subscription Cancellation Email Examples (10 Real) — 2026-07-27 https://www.digistorms.ai/blog/subscription-cancellation-email (payment-declined swapped for re-engage-downgraded-users: the involuntary-churn angle is already covered by /blog/dunning-emails, linked instead) |

Existing coverage (do not duplicate — check before queueing): saas welcome email, onboarding email
examples, onboarding email sequence templates, behavioral email marketing, behavior-based vs
time-based, customer activation, customer retention emails, free-to-paid conversion, best time to
send, upsell emails, upgrade emails, milestone emails, saas newsletter, webinar email sequence /
follow-up, re-engagement email examples, b2b lead nurturing, dunning emails, product launch email,
saas email templates/benchmarks, transactional-email-vs-marketing-email, lifecycle email
marketing, transactional email examples, feedback request email, nps email, free trial email,
subscription cancellation email, trial drop-off. (See `src/content/blog/`.)

## Refill note

When this bank runs low, a single one-day Ahrefs reactivation (~$99, then cancel again) refills it
— far cheaper than the monthly subscription. **Harvest against the 300/mo floor this time.** The
buffer pool in `data/competitors/competitor-keyword-gaps-2026-06-16.md` is the same low-volume
harvest that produced this problem, so it is not a refill source on its own.
