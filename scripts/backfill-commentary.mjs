#!/usr/bin/env node
/**
 * Backfill missing "Why this works" commentary on library email entries.
 *
 * Generates one tactical, interpretive 1-2 sentence commentary per email
 * using Claude Haiku 4.5. Distinct from the existing structural `summary`
 * field — `commentary` is the lifecycle-expert "why this email works + what
 * pattern to lift" angle.
 *
 * Usage:
 *   node scripts/backfill-commentary.mjs              # process all missing
 *   node scripts/backfill-commentary.mjs --dry-run    # preview (no API calls saved)
 *   node scripts/backfill-commentary.mjs --limit=10   # cap to first 10 missing
 *   node scripts/backfill-commentary.mjs --brand=stripe   # filter by brand slug
 *
 * Env:
 *   ANTHROPIC_API_KEY   required (will exit with instructions if missing)
 *
 * Writes to BOTH:
 *   - src/data/library/emails.json       (build-time import for [slug].astro)
 *   - public/data/library/emails.json    (runtime fetch for React LibraryPage)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_PATH = join(ROOT, "src/data/library/emails.json");
const PUBLIC_PATH = join(ROOT, "public/data/library/emails.json");
const BRANDS_PATH = join(ROOT, "public/data/library/brands.json");
const TAGS_PATH = join(ROOT, "public/data/library/tags.json");
const USECASES_PATH = join(ROOT, "public/data/library/usecases.json");

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1];
const brandFilter = process.argv.find((a) => a.startsWith("--brand="))?.split("=")[1];
const limit = limitArg ? parseInt(limitArg, 10) : Infinity;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(`
✗ ANTHROPIC_API_KEY environment variable is not set.

To run this script:
  1. Get an API key from https://console.anthropic.com/settings/keys
  2. Run:  export ANTHROPIC_API_KEY=sk-ant-...
  3. Re-run:  node scripts/backfill-commentary.mjs

Or for a single run:
  ANTHROPIC_API_KEY=sk-ant-... node scripts/backfill-commentary.mjs
`);
  process.exit(2);
}

const client = new Anthropic();
const MODEL = "claude-haiku-4-5-20251001";

// ── Load data ────────────────────────────────────────────────────────────────

const emails = JSON.parse(readFileSync(SRC_PATH, "utf8"));
const brands = JSON.parse(readFileSync(BRANDS_PATH, "utf8"));
const tags = JSON.parse(readFileSync(TAGS_PATH, "utf8"));
const usecases = JSON.parse(readFileSync(USECASES_PATH, "utf8"));

const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b]));
const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t]));
const usecaseMap = Object.fromEntries(usecases.map((u) => [u.slug, u]));

// ── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a SaaS lifecycle marketing expert writing one-paragraph commentary on real SaaS emails.

You are commenting from the perspective of an experienced lifecycle marketer who has seen 1,000+ SaaS emails. Your tone is direct, founder-to-founder, scrappy. No corporate fluff. Outcomes before features. Strong verbs.

For each email, write a 2-sentence commentary in this exact structure:

**Why this works.** [Sentence 1: identify ONE specific element of the email — a subject line angle, a structural choice, a copy decision, a timing pattern, a personalization signal — and explain why that element triggers the desired user behavior]. The pattern here is [generalizable principle in quotes]; you can lift it for any [specific email use case category] where you want users to [concrete action].

Hard rules:
- 2 sentences total. No more.
- Start with the literal text "**Why this works.**" (markdown bold + period + space).
- Sentence 1 must name a SPECIFIC element of the email (not "this email is well-designed" — instead "the subject line names the missing action, not the feature").
- Sentence 2 must name the pattern in quotes and a concrete next-action verb.
- Never use the phrases "this email", "this campaign", or "leverages". Never use em dashes (—); use plain dashes (-) or commas instead.
- Never invent details about the email content beyond what's given. Comment on the structure/category/pattern, not on copy text you can't see.
- Output ONLY the commentary string. No preamble, no quotes around the output, no explanation.

Example output for a Stripe webinar invite:
**Why this works.** Stripe leads with the speaker's name and title before the topic, so readers decide whether to register based on who is teaching, not what is being taught. The pattern here is "credibility before content"; you can lift it for any webinar or expert-led email where the speaker is more interesting than the abstract.`;

function buildUserMessage(email) {
  const brand = brandMap[email.brand];
  const brandName = brand?.name ?? email.brand;
  const uc = usecaseMap[email.useCase];
  const ucName = uc?.name ?? email.useCase;
  const tagNames = (email.tags || [])
    .slice(0, 5)
    .map((slug) => tagMap[slug]?.name ?? slug.replace(/-/g, " "))
    .join(", ");

  return `Email metadata:
- Brand: ${brandName}
- Subject line: ${email.subject}
- Use case category: ${ucName}
- Tags: ${tagNames || "(none)"}
- Sender: ${email.sender || "(brand default)"}
- Existing structural summary: ${email.summary || "(none)"}

Write the 2-sentence "Why this works" commentary for this email.`;
}

// ── Generate ─────────────────────────────────────────────────────────────────

async function generateCommentary(email) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildUserMessage(email) }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  return { text, usage: response.usage };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const targets = emails.filter((e) => {
  if (e.commentary) return false;
  if (brandFilter && e.brand !== brandFilter) return false;
  return true;
});

const work = targets.slice(0, limit);
console.log(`Found ${targets.length} emails missing commentary; processing ${work.length}.`);
if (dryRun) console.log("(dry run — will hit API once for preview, no save)\n");

let totalIn = 0;
let totalOut = 0;
let totalCacheRead = 0;
let totalCacheWrite = 0;
let processed = 0;
let failed = 0;
const startedAt = Date.now();

for (let i = 0; i < work.length; i++) {
  const email = work[i];
  try {
    const { text, usage } = await generateCommentary(email);
    email.commentary = text;
    processed++;
    totalIn += usage.input_tokens || 0;
    totalOut += usage.output_tokens || 0;
    totalCacheRead += usage.cache_read_input_tokens || 0;
    totalCacheWrite += usage.cache_creation_input_tokens || 0;

    if (dryRun) {
      console.log(`── ${email.slug} ──`);
      console.log(`Brand: ${brandMap[email.brand]?.name ?? email.brand}`);
      console.log(`Subject: ${email.subject}`);
      console.log(text);
      console.log();
      break; // one preview is enough on dry-run
    }

    if (i % 25 === 0 || i === work.length - 1) {
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
      console.log(
        `[${i + 1}/${work.length}] ${email.slug.slice(0, 60)} ` +
          `(${elapsed}s, ${totalIn} in / ${totalCacheRead} cached / ${totalOut} out)`,
      );
    }
  } catch (err) {
    failed++;
    console.error(`✗ ${email.slug}: ${err.message}`);
    if (failed > 5) {
      console.error("More than 5 consecutive failures — aborting.");
      break;
    }
  }
}

if (!dryRun && processed > 0) {
  const json = JSON.stringify(emails, null, 2) + "\n";
  writeFileSync(SRC_PATH, json);
  writeFileSync(PUBLIC_PATH, json);
  console.log(`\n✓ Wrote ${processed} new commentaries to:`);
  console.log(`    ${SRC_PATH}`);
  console.log(`    ${PUBLIC_PATH}`);
}

console.log(`
Summary:
  Processed:        ${processed}
  Failed:           ${failed}
  Input tokens:     ${totalIn}
  Output tokens:    ${totalOut}
  Cache read:       ${totalCacheRead}
  Cache write:      ${totalCacheWrite}
`);
