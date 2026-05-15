#!/usr/bin/env node
/**
 * Reddit monitor — polls target subreddits for threads where DigiStorms
 * could add a genuinely useful answer.
 *
 * Run:    node scripts/reddit-monitor/poll.mjs
 * Output: data/reddit/candidates-YYYY-MM-DD.json  (top threads, scored)
 *
 * No auth needed — uses Reddit's public .json endpoints with a descriptive
 * User-Agent and a gentle rate limit. Config lives in keywords.json.
 *
 * The daily scheduled task (digistorms-reddit-monitor) runs this first,
 * then reads the candidates file to draft comment suggestions + post ideas.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const CFG = JSON.parse(readFileSync(join(__dirname, "keywords.json"), "utf8"));

const UA = "digistorms-reddit-monitor/1.0 (daily SaaS thread monitor)";
const TODAY = new Date().toISOString().split("T")[0];
const NOW = Date.now();
const OUT_DIR = join(ROOT, "data", "reddit");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function redditGet(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.status === 429) {
        await sleep(6000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) {
        console.warn(`  ! ${url} failed: ${e.message}`);
        return null;
      }
      await sleep(2500);
    }
  }
  return null;
}

const allKeywords = Object.values(CFG.keyword_clusters).flat();

function clustersFor(text) {
  const t = text.toLowerCase();
  const hit = [];
  for (const [cluster, words] of Object.entries(CFG.keyword_clusters)) {
    if (words.some((w) => t.includes(w.toLowerCase()))) hit.push(cluster);
  }
  return hit;
}

const exclusions = CFG.exclusion_keywords ?? [];

function scoreThread(t) {
  const title = (t.title || "").toLowerCase();
  const body = (t.selftext || "").toLowerCase();
  const s = CFG.scoring;

  const titleKw = allKeywords.filter((k) => title.includes(k.toLowerCase())).length;
  const bodyKw = allKeywords.filter((k) => body.includes(k.toLowerCase())).length;

  // Gate 1: the topic must appear in the TITLE. Body-only keyword mentions
  // are usually tangential and flood the digest with off-topic threads.
  if (titleKw === 0) return { score: 0, gated: true, gatedReason: "no topic keyword in title" };

  // Gate 2: an exclusion term in the TITLE = off-domain (ecommerce email or
  // cold outreach). DigiStorms is SaaS lifecycle only — drop these.
  const exclTitle = exclusions.filter((x) => title.includes(x.toLowerCase()));
  if (exclTitle.length > 0) {
    return { score: 0, gated: true, gatedReason: `excluded ("${exclTitle[0]}" in title)` };
  }

  // Gate 3: multiple exclusion terms in the body = off-domain even if the
  // title looked on-topic.
  const exclBody = exclusions.filter((x) => body.includes(x.toLowerCase()));
  if (exclBody.length >= s.exclusion_body_drop_threshold) {
    return { score: 0, gated: true, gatedReason: `excluded (${exclBody.length} off-domain terms in body)` };
  }

  const text = `${title} ${body}`;
  const intentHits = CFG.high_intent_signals.filter((sig) => text.includes(sig.toLowerCase())).length;
  const isQuestion =
    title.includes("?") ||
    /^(how|what|which|why|anyone|looking|recommend|is there|should i|best|does anyone|can i)/.test(title);

  const ageHours = (NOW - t.created_utc * 1000) / 3600000;
  let recency = 0;
  if (ageHours <= 24) recency = s.recency_bonus_24h;
  else if (ageHours <= 48) recency = s.recency_bonus_48h;

  const saturation = t.num_comments > s.saturation_comment_threshold ? s.saturation_penalty : 0;
  // A single off-domain term in the body — keep, but penalise.
  const exclusionPenalty = exclBody.length === 1 ? s.exclusion_body_penalty : 0;

  const score =
    titleKw * s.keyword_weight + // title keyword match — the strong signal
    bodyKw * 1 + // body keyword match — minor boost
    intentHits * s.intent_weight +
    (isQuestion ? s.question_bonus : 0) +
    recency -
    saturation -
    exclusionPenalty;

  return { score, titleKw, bodyKw, intentHits, isQuestion, ageHours, exclBody: exclBody.length };
}

async function fetchSubNew(sub) {
  const data = await redditGet(`https://www.reddit.com/r/${sub}/new.json?limit=100`);
  return data?.data?.children?.map((c) => c.data) ?? [];
}

async function fetchSearch(sub, query) {
  const q = encodeURIComponent(query);
  const data = await redditGet(
    `https://www.reddit.com/r/${sub}/search.json?q=${q}&restrict_sr=1&sort=new&t=week&limit=25`,
  );
  return data?.data?.children?.map((c) => c.data) ?? [];
}

async function main() {
  const subs = [...CFG.subreddits.tier1, ...CFG.subreddits.tier2];
  const seen = new Map();

  console.log(`Reddit monitor — ${TODAY}`);
  console.log(`Polling ${subs.length} subreddits...\n`);

  // 1. Newest threads per subreddit
  for (const sub of subs) {
    process.stdout.write(`  r/${sub}/new ... `);
    const threads = await fetchSubNew(sub);
    console.log(`${threads.length} threads`);
    for (const t of threads) seen.set(t.id, t);
    await sleep(1200);
  }

  // 2. Keyword search across tier-1 subs (catches relevant threads beyond newest 100)
  for (const sub of CFG.subreddits.tier1) {
    for (const q of CFG.search_clusters) {
      process.stdout.write(`  search r/${sub} "${q}" ... `);
      const threads = await fetchSearch(sub, q);
      console.log(`${threads.length} hits`);
      for (const t of threads) if (!seen.has(t.id)) seen.set(t.id, t);
      await sleep(1200);
    }
  }

  // 3. Score, filter, rank
  const s = CFG.scoring;
  const scored = [];
  for (const t of seen.values()) {
    if (!t.title) continue;
    if (t.over_18) continue;
    if (t.author === "[deleted]") continue;
    const meta = scoreThread(t);
    if (meta.gated) continue; // topic keyword not in title
    if (meta.ageHours > s.max_age_hours) continue;
    if (meta.score < s.min_score) continue;
    scored.push({
      id: t.id,
      subreddit: `r/${t.subreddit}`,
      title: t.title,
      selftext: (t.selftext || "").slice(0, 1500),
      url: `https://www.reddit.com${t.permalink}`,
      json_url: `https://www.reddit.com${t.permalink}.json`,
      author: `u/${t.author}`,
      age_hours: Math.round(meta.ageHours * 10) / 10,
      num_comments: t.num_comments,
      upvotes: t.score,
      clusters: clustersFor(`${t.title} ${t.selftext || ""}`),
      fit_score: meta.score,
      is_question: meta.isQuestion,
    });
  }

  scored.sort((a, b) => b.fit_score - a.fit_score);
  const top = scored.slice(0, s.max_candidates);

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, `candidates-${TODAY}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        subreddits_polled: subs,
        threads_seen: seen.size,
        threads_passed_filter: scored.length,
        candidates: top,
      },
      null,
      2,
    ),
  );

  console.log(`\n  ${seen.size} threads seen → ${scored.length} passed filter → top ${top.length} saved`);
  console.log(`  → ${outPath}`);
  if (top.length > 0) {
    console.log(`\n  Top 5 preview:`);
    for (const t of top.slice(0, 5)) {
      console.log(`    [${t.fit_score}] ${t.subreddit} — ${t.title.slice(0, 70)}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
