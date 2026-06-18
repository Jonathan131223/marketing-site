# DigiStorms Keyword Bank — content autopilot source of truth (no Ahrefs)

Created 2026-06-16 from a final Ahrefs harvest (matching/related terms + competitor keyword gaps)
**before the paid Ahrefs plan was cancelled.** This file replaces the autopilot's old live
Ahrefs keyword discovery + verification. There is no Ahrefs MCP anymore — do **not** try to call it.

## How the autopilot uses this file
1. Pick the **first `[ ]` (pending) row in priority order** that isn't already covered by a post in
   `src/content/blog/` (check slug + frontmatter `description`).
2. Use the **stored `vol` / `KD` here as the metrics** (no live re-check). Put them in the commit
   message + Slack note as before.
3. Confirm the row's library tags each have ≥ 8 matching emails in `src/data/library/emails.json`
   (`jq`); rows marked **[thin]** have < 8 — run with fewer examples or pick the next row.
4. After shipping, mark the row `[x]` with date + URL.
5. **Replenish:** when pending rows drop below ~12, Slack-alert Jonathan:
   *"⚠️ Keyword bank low (N left). Refill via a one-day Ahrefs reactivation or manual research."*
   Do NOT silently run dry.

Runway: at **2 articles/week (~8.7/mo)**, 72 keywords ≈ **8 months**.
Legend: `Q` = was in old calendar queue · `R` = refresh/retarget of an existing post ·
`[thin]` = < 8 library examples · `gap` = sourced from competitor keyword-gap export.

| # | Status | Keyword (target) | Vol | KD | Library tags | Ex | Working title |
|---:|---|---|---:|---:|---|---:|---|
| 1 | [x] | trial drop off `Q` | 80 | 12 | inactivity-nudge, trial-expiration-warning, trial-extension-offer | 10 | SaaS Trial Drop-Off Playbook: 10 Recovery Emails — 2026-06-18 https://www.digistorms.ai/blog/trial-drop-off-emails |
| 2 | [ ] | lifecycle email marketing examples `Q` | 150 | 3 | (mix: 2-3 per use case) | 20 | Lifecycle Email Marketing: 20 Examples by Stage |
| 3 | [ ] | transactional email examples `Q` | 150 | 8 | payment-receipt, email-verification, password-reset, payment-declined | 12 | Transactional Email Examples (12 from Real SaaS) |
| 4 | [ ] | product announcement email `Q` | 100 | 1 | new-feature-nudge, product-update, feature-update | 12 | Product Announcement Email Templates |
| 5 | [ ] | feedback request email `Q` | 150 | 0 | survey, nps-survey, qualitative-feedback | 12 | Feedback Request Email Templates |
| 6 | [ ] | nps email / email nps `Q` | 100 | 4 | nps-survey, survey | 8 | NPS Email Examples & Templates |
| 7 | [ ] | free trial email `Q` | 70 | 1 | trial-just-started, trial-expiration-warning, trial-extension-offer | 10 | Free Trial Email Sequence (Examples + Templates) |
| 8 | [ ] | subscription cancellation email `Q` | 40 | 1 | downgrade-receipt, re-engage-cancelled-users, payment-declined | 10 | Subscription Cancellation Email Examples |
| 9 | [ ] | win back email examples | 150 | 10 | re-engage-cancelled-users, inactivity-nudge | 10 | Win-Back Email Examples That Recover Churned Users |
| 10 | [ ] | saas onboarding checklist `gap` | 200 | 3 | setup-prompt, onboarding-checklist, trial-just-started | 8 | SaaS Onboarding Checklist (+ Email Examples) |
| 11 | [ ] | survey email examples | 150 | 1 | survey, nps-survey | 10 | Survey Email Examples & Templates |
| 12 | [ ] | drip campaign examples | 90 | 7 | content-engagement, feature-usage-nudge, product-education | 10 | Drip Campaign Examples for SaaS |
| 13 | [ ] | what is email automation (guide) | 300 | 2 | feature-usage-nudge, content-engagement | 8 | What Is Email Automation? A SaaS Guide |
| 14 | [ ] | email drip campaign (guide) | 700 | 20 | content-engagement, product-education | 10 | Email Drip Campaigns: The 2026 SaaS Guide |
| 15 | [ ] | welcome email to new customer `gap` | 150 | 13 | welcome-paid-users, welcome-free-users | 10 | Welcome Emails for New Customers (Real Examples) |
| 16 | [ ] | software upgrade notification email `gap` | 100 | 0 | product-update, new-feature-nudge | 8 | Software Update & Upgrade Notification Emails |
| 17 | [ ] | scheduled maintenance / status email `gap` | 70 | 0 | product-update, terms-of-use-update | 8 | Maintenance & Status Update Email Examples |
| 18 | [ ] | customer feedback email examples `gap` | 60 | 7 | survey, qualitative-feedback | 8 | Customer Feedback Email Examples |
| 19 | [ ] | drip campaign templates | 200 | 4 | content-engagement, product-education | 10 | Drip Campaign Templates (Copy-Paste) |
| 20 | [ ] | email sequence templates | 90 | 9 | trial-just-started, setup-prompt, feature-usage-nudge | 10 | Email Sequence Templates for SaaS |
| 21 | [ ] | trial expiration email examples | 60 | 8 | trial-expiration-warning, trial-expired-upgrade | 10 | Trial Expiration Email Examples |
| 22 | [ ] | survey invitation email | 60 | 5 | survey, nps-survey | 8 | Survey Invitation Email Examples & Templates |
| 23 | [ ] | how to ask for feedback in email | 150 | 1 | survey, qualitative-feedback | 8 | How to Ask for Feedback in an Email |
| 24 | [ ] | email automation workflows | 60 | 7 | feature-usage-nudge, usage-expansion | 8 | Email Automation Workflows for SaaS |
| 25 | [ ] | new feature announcement email examples | 70 | 2 | new-feature-nudge, product-update | 10 | New Feature Announcement Email Examples |
| 26 | [ ] | product update email examples | 90 | 5 | product-update, new-feature-nudge | 10 | Product Update Email Examples |
| 27 | [ ] | feature adoption email examples | 80 | 4 | feature-usage-nudge | 10 | Feature Adoption Email Examples |
| 28 | [ ] | win back email subject lines | 60 | 4 | re-engage-cancelled-users, inactivity-nudge | 8 | Win-Back Email Subject Lines That Work |
| 29 | [ ] | retention email marketing strategy | 150 | 3 | inactivity-nudge, feature-usage-nudge | 8 | Retention Email Marketing: Strategy + Examples |
| 30 | [ ] | survey reminder email | 100 | 0 | survey | 8 | Survey Reminder Email Examples |
| 31 | [ ] | customer feedback email template | 90 | 5 | survey, qualitative-feedback | 8 | Customer Feedback Email Templates |
| 32 | [ ] | email nurture sequence examples | 40 | 9 | content-engagement, product-education | 10 | Email Nurture Sequence Examples |
| 33 | [ ] | drip campaign best practices | 80 | 12 | content-engagement | 8 | Drip Campaign Best Practices |
| 34 | [ ] | email automation ideas | 150 | 3 | feature-usage-nudge, content-engagement | 10 | Email Automation Ideas for SaaS |
| 35 | [ ] | nps survey email | 100 | 3 | nps-survey, survey | 8 | NPS Survey Email Examples |
| 36 | [ ] | trial expired upgrade email | 40 | 6 | trial-expired-upgrade, upgrade-cta | 8 | Trial-Expired Upgrade Email Examples |
| 37 | [ ] | email marketing automation strategy | 150 | 18 | feature-usage-nudge, content-engagement | 8 | Email Marketing Automation Strategy for SaaS |
| 38 | [ ] | usage-based upgrade prompt emails | 90 | 6 | usage-expansion, upgrade-cta, quota-reached | 8 | Usage-Based Upgrade Prompt Emails |
| 39 | [ ] | integration prompt email examples | 70 | 5 | integration-prompt, feature-usage-nudge | 10 | Integration Prompt Email Examples |
| 40 | [ ] | product education email examples | 80 | 6 | product-education, content-engagement | 10 | Product Education Email Examples |
| 41 | [ ] | user engagement email examples | 90 | 8 | content-engagement, feature-usage-nudge | 10 | User Engagement Email Examples |
| 42 | [ ] | welcome email design | 100 | 7 | welcome-free-users, welcome-paid-users | 8 | Welcome Email Design: Examples + Principles |
| 43 | [ ] | re-engagement email subject lines | 70 | 1 | inactivity-nudge, re-engage-cancelled-users | 8 | Re-Engagement Email Subject Lines |
| 44 | [ ] | what is a welcome email (definition) | 70 | 13 | welcome-free-users | 8 | What Is a Welcome Email? Definition + Examples |
| 45 | [ ] | account setup email examples | 60 | 5 | setup-prompt, trial-just-started | 8 | Account Setup Email Examples |
| 46 | [ ] | email verification email examples | 80 | 6 | email-verification, account-created-confirmation | 8 | Email Verification Email Examples |
| 47 | [ ] | payment receipt email examples | 70 | 5 | payment-receipt, downgrade-receipt | 8 | Payment Receipt Email Examples |
| 48 | [ ] | best transactional email service (roundup) | 450 | 7 | (tool roundup) | 6 | Best Transactional Email Services (2026) |
| 49 | [ ] | transactional email services / providers (roundup) | 350 | 6 | (tool roundup) | 6 | Transactional Email Services Compared |
| 50 | [ ] | saas marketing automation `gap` | 250 | 2 | feature-usage-nudge, content-engagement | 8 | SaaS Marketing Automation: Examples + Tools |
| 51 | [ ] | trial reminder email examples | 50 | 8 | trial-expiration-warning, trial-just-started | 8 | Trial Reminder Email Examples |
| 52 | [ ] | free trial email examples | 60 | 0 | trial-just-started | 8 | Free Trial Email Examples |
| 53 | [ ] | feature launch email examples | 70 | 6 | new-feature-nudge, product-update | 10 | Feature Launch Email Examples |
| 54 | [ ] | changelog / release notes email examples | 50 | 4 | product-update | 8 | Changelog & Release Notes Email Examples |
| 55 | [ ] | expansion revenue email examples | 60 | 7 | usage-expansion, upgrade-cta | 8 | Expansion Revenue Email Examples |
| 56 | [ ] | customer satisfaction survey email | 80 | 6 | survey, nps-survey | 8 | Customer Satisfaction Survey Email Examples |
| 57 | [ ] | demo invitation email examples | 50 | 5 | demo-invite, onboarding-call-invite | 8 | Demo Invitation Email Examples |
| 58 | [ ] | event invitation email examples | 90 | 8 | irl-event, conference-invite | 10 | Event Invitation Email Examples (SaaS) |
| 59 | [ ] | case study email examples | 60 | 6 | case-study, content-engagement | 10 | Case Study Email Examples |
| 60 | [ ] | email course examples | 50 | 5 | product-education, course | 8 | Email Course Examples for SaaS |
| 61 | [ ] | welcome series email flow examples | 90 | 20 | welcome-paid-users, welcome-free-users, setup-prompt | 10 | Welcome Series Email Flow Examples |
| 62 | [ ] | saas customer onboarding checklist `gap` | 200 | 2 | setup-prompt, onboarding-checklist | 8 | SaaS Customer Onboarding Checklist + Emails |
| 63 | [ ] | onboarding saas tools (roundup) `gap` | 100 | 5 | (tool roundup) | 6 | Best SaaS User Onboarding Tools (2026) |
| 64 | [ ] | saas onboarding kpis `gap` | 150 | 5 | (metrics post) | 4 | SaaS Onboarding KPIs to Track |
| 65 | [ ] | customer segmentation saas `gap` | 200 | 6 | (concept + examples) | 6 | Customer Segmentation for SaaS Lifecycle Emails |
| 66 | [ ] | marketing automation kpis `gap` | 200 | 2 | (metrics post) | 4 | Marketing Automation KPIs That Matter |
| 67 | [ ] | password reset email examples [thin] | 60 | 5 | password-reset, login-from-new-device | 5 | Password Reset Email Examples |
| 68 | [ ] | payment failed / declined email examples [thin] | 50 | 6 | payment-declined, billing-reminder | 6 | Payment Failed / Declined Email Examples |
| 69 | [ ] | trial extension offer email [thin] | 40 | 5 | trial-extension-offer, trial-expiration-warning | 6 | Trial Extension Offer Email Examples |
| 70 | [ ] | quota reached / limit email examples [thin] | 40 | 4 | quota-reached, usage-summary, upgrade-cta | 6 | Quota / Usage-Limit Email Examples |
| 71 | [ ] | account confirmation email examples [thin] | 50 | 4 | account-created-confirmation, email-verification | 6 | Account Confirmation Email Examples |
| 72 | [ ] | year in review email examples [thin] | 40 | 5 | year-in-review, usage-summary | 6 | Year-in-Review Email Examples |

## Already covered (do NOT re-create — refresh-only candidates)
welcome email, onboarding email examples, onboarding email sequence templates, behavioral email
marketing, behavior-based vs time-based, customer activation, customer retention emails,
free-to-paid conversion, best time to send, upsell emails, **upgrade emails**, **milestone emails**,
**saas newsletter**, **webinar email sequence / follow-up**, re-engagement email examples,
b2b lead nurturing, dunning emails, product launch email, saas email templates/benchmarks,
transactional-email-vs-marketing-email. (See `src/content/blog/`.)

## Refill note
Buffer pool of additional harvested candidates (dozens more, all low-KD ICP) lives in
`data/competitors/competitor-keyword-gaps-2026-06-16.md` and the Reddit cluster config. When this
bank runs low, a single one-day Ahrefs reactivation (~$99, then cancel again) refills it for ~8
more months — far cheaper than the monthly subscription.
