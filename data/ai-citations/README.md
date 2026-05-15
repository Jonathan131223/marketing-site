# AI Citation Strategy — Working Files

This directory tracks the "get cited by ChatGPT" content motion. Plan lives at `~/.claude/plans/this-is-something-i-splendid-narwhal.md`.

## Status (as of 2026-05-14)

- ✅ **Phase 1 done** — 50 queries generated and prioritized
- ✅ **Phase 2 partially done** — 24 queries researched via Ahrefs SERP Overview (proxy for ChatGPT citations, since Brand Radar ChatGPT addon isn't in our subscription). 16 had indexed SERP data, 8 returned empty (= open territory).
- ✅ **Article prioritization done** — see `articles-to-write.md` for the top 10 ranked by beatability + ICP fit
- ⏭️ **Next:** draft Article #1 (Behavior-Based vs Time-Based Emails). After 4-week sprint, manual ChatGPT re-test for verification.

## Files

| File | Purpose |
|---|---|
| `queries.json` | 50 target queries the DigiStorms ICP would ask ChatGPT. Tagged by category + priority. |
| `citations.json` | Competitive landscape: top-10 ranking pages per query with DR, traffic, beatability scoring, and DigiStorms angle. Populated via Ahrefs SERP API (used as proxy for ChatGPT citations). |
| `articles-to-write.md` | The top 10 articles ranked by opportunity, with briefs. |
| `runs/YYYY-MM.json` | Monthly re-test snapshots. Created at the end of each month to track citation changes over time. |

## What was automated vs. what's manual

**Automated (already done):**
- Query generation (50 queries with priority + DigiStorms angle)
- Competitive SERP analysis (16 queries with full ranking data)
- Beatability scoring (easy / medium / hard per query)
- Article prioritization (top 10 picks with briefs)

**Manual (still you):**
- Drafting the actual articles (or supervising AI drafts)
- Reddit seeding (top-5 on 12 of 16 queries → important distribution motion)
- G2 listing creation (needed for "X alternatives" queries)
- Monthly ChatGPT re-test for verification (open chatgpt.com, paste the 10 winning queries, log citations to `runs/`)

## Why SERP-as-proxy?

Direct ChatGPT citation extraction was blocked by:
1. **No Brand Radar ChatGPT addon** in our Ahrefs Lite subscription
2. **No Chrome extension connected** for browser automation
3. **No ChatGPT API access** for direct queries

SERP top-10 is the best programmatic proxy: ChatGPT's web-search step uses Bing+Google ranking signals that strongly correlate with what we measured. For each top-10 article we publish, **manually re-query in ChatGPT before declaring it cited or not** — that's the ground truth.

## Manual Citation Extraction Workflow

**Time cost:** ~45 sec per query × 50 = ~40 min for a full pass.

**Setup:**
1. Open `chatgpt.com` in Chrome (logged in, web search on by default)
2. Open DevTools → Network tab (optional — easier to read citations from the rendered answer)
3. Open `citations.json` in a side window

**For each query in `queries.json`:**
1. Paste the query verbatim into ChatGPT
2. Wait for the full streamed answer with footnote citations
3. For each numbered citation [1], [2], [3] etc., copy the URL
4. Visit the cited URL briefly to grab: title, publish/updated date, root domain
5. Add an entry to `citations.json` using the schema below
6. Add a one-line `notes` field — what's beatable? (Stale? Thin? Low-DA?)

**Citation schema** (one entry per query):

```json
{
  "query": "best onboarding email tools for SaaS 2026",
  "query_id": 1,
  "captured_at": "2026-05-14",
  "chatgpt_model": "gpt-5",
  "web_search_triggered": true,
  "citations": [
    {
      "rank": 1,
      "url": "https://userpilot.com/blog/best-onboarding-email-software/",
      "domain": "userpilot.com",
      "title": "10 Best Customer Onboarding Email Software in 2024",
      "published": "2024-08-12",
      "last_updated": "2024-11-03"
    },
    {
      "rank": 2,
      "url": "https://customer.io/blog/...",
      "domain": "customer.io",
      "title": "...",
      "published": "...",
      "last_updated": "..."
    }
  ],
  "notes": "Userpilot ranks #1 with 2024 article — beatable on recency (write 2026 version). DigiStorms missing entirely. Customer.io's own blog is #2 (predictable)."
}
```

## Tips

- **Don't paraphrase queries.** Copy them verbatim from `queries.json` — small wording changes flip ChatGPT's web-search trigger.
- **Note when no citations appear.** Some queries answer from training data without web search. Mark `web_search_triggered: false` and skip — those are not citation targets, but flag them as "knowledge graph" wins to chase later.
- **Capture model version.** ChatGPT's citation behavior differs by model (gpt-4o vs gpt-5). Always log which one you used.
- **Run all 50 in one sitting.** ChatGPT caches and personalizes — a fresh session minimizes variance.

## What to do with the data

Once `citations.json` has 50 entries:

1. **Sort by beatability** — queries where the #1 cited article is >18 months old + thin = easy wins
2. **Cross-reference with `queries.json` priority** — P0 queries with beatable citations = first 10 articles to write
3. **Hand off to Phase 3** — pick 10, draft articles, ship to `/blog`

## Monthly Re-Test

End of each month: rerun the same 50 queries, save to `runs/YYYY-MM.json`. The `report.mjs` script (not built yet — Phase 2b) will diff month-over-month and surface:
- Queries where DigiStorms newly appears
- Queries where competitors dropped
- Queries where ranking changed
