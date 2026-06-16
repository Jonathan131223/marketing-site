# DigiStorms SEO baseline — 2026-06-16 (final Ahrefs snapshot before cancellation)

This is the last data captured from the paid Ahrefs plan (Lite) before cancelling it.
Kept as a point-in-time reference. After this date there is **no Ahrefs MCP/API** — these
numbers can't be re-pulled programmatically. Track ongoing changes via Google Search Console
(free) + free Ahrefs Webmaster Tools (web UI) + the Notion Backlink Engine.

## Authority / organic (digistorms.ai, US, subdomains)
- **Domain Rating: 2.5** (Ahrefs rank #40,039,643)
- Organic keywords (top 100): **6** · in top 3: **0**
- Organic traffic: **~9 visits/mo** · traffic value: **~$8.83/mo**
- Paid: 0 keywords / 0 traffic
- Reality check: organic is effectively zero → **backlinks + authority are the #1 priority**,
  not more content volume. (Matches memory: /library 1,190 URLs → 0 organic clicks.)

## Site Audit (Ahrefs project 8773874, crawl 2026-06-15)
- **Health score: 100/100** · 2,539 internal URLs · 5 with errors · 12 with warnings · 1,238 notices
- Actionable issues (URLs actually affected):
  | Issue | Severity | URLs |
  |---|---|---|
  | Canonical points to redirect | Error | 4 |
  | Orphan page (no incoming internal links) | Error | 1 (indexable) |
  | Title too long | Warning | 2 |
  | H1 missing or empty | Notice | 4 (non-indexable utility pages) |
  | Structured data — Google rich-results validation error | Notice | 10 |
  | Noindex page / Noindex follow page | Warning/Notice | 2 each (likely intentional) |
  | Page & SERP titles don't match | Notice | 4 |
- Everything else = 0 affected URLs. The new local crawler (scripts/site-audit/crawl.mjs) should
  reproduce this list and keep it at/near zero.

## Ahrefs subscription at cancellation time
- Plan: **Lite, billed monthly** (~$99/mo) · usage 2026-06-16: ~21k/100k units this cycle · resets 2026-06-26.
- Free Ahrefs Webmaster Tools (AWT) remains available for digistorms.ai (web UI only — no API) for
  occasional DR/backlink checks.

## Competitor authority (for context)
| Domain | DR |
|---|---:|
| customer.io | 81 |
| encharge.io | 75 |
| loops.so | 74 |
| userlist.com | 68 |
| **digistorms.ai** | **2.5** |
