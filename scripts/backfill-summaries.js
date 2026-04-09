#!/usr/bin/env node
/**
 * Backfill missing email summaries in emails.json
 *
 * Generates summaries from existing metadata (subject, brand, tags, useCase)
 * for emails that have no summary field.
 *
 * Usage:
 *   node scripts/backfill-summaries.js              # write to emails.json
 *   node scripts/backfill-summaries.js --dry-run     # preview without writing
 *   node scripts/backfill-summaries.js --brand=fiverr # process single brand
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "public/data/library");

const dryRun = process.argv.includes("--dry-run");
const brandFilter = process.argv.find((a) => a.startsWith("--brand="))?.split("=")[1];

// ── Load data ────────────────────────────────────────────────────────────────

const emails = JSON.parse(readFileSync(join(DATA, "emails.json"), "utf8"));
const brands = JSON.parse(readFileSync(join(DATA, "brands.json"), "utf8"));
const tags = JSON.parse(readFileSync(join(DATA, "tags.json"), "utf8"));
const usecases = JSON.parse(readFileSync(join(DATA, "usecases.json"), "utf8"));

const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b]));
const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t]));
const usecaseMap = Object.fromEntries(usecases.map((u) => [u.slug, u]));

// ── Use case context sentences ───────────────────────────────────────────────
// First sentence extracted/adapted from each use case description, providing
// contextual closing text for the generated summary.

const useCaseContext = {
  "onboard-free-user":
    "Activation-focused sequences like this are designed to get trial and freemium users to their first 'aha moment' fast, reducing time-to-value and setting the stage for paid conversion.",
  "onboard-paid-user":
    "Welcome flows like this reinforce the purchase decision, guide users through key features, and ensure new paying customers achieve value quickly after their first payment.",
  "educate-engage":
    "Ongoing educational emails like this drive deeper product adoption by surfacing underused features, sharing best practices, and keeping users engaged throughout the lifecycle.",
  "win-back-churned-user":
    "Re-engagement sequences like this target cancelled or inactive users by combining emotional messaging, updated value propositions, and time-sensitive offers to bring them back.",
  "expand-user":
    "Revenue expansion emails like this target active users with upsell, cross-sell, and upgrade opportunities, triggered by usage patterns or plan limits to grow account value.",
  "announce-new-features":
    "Feature announcement emails like this keep users informed about new capabilities and improvements, driving re-engagement and reducing churn by demonstrating product momentum.",
  "celebrate-milestones":
    "Milestone celebration emails like this reinforce positive behavior and generate loyalty by recognizing significant usage achievements, product anniversaries, or personal accomplishments.",
  "request-feedback":
    "Feedback collection emails like this gather insights through NPS surveys, satisfaction requests, or qualitative questions that directly inform retention strategy and product decisions.",
  "transactional-email":
    "Transactional emails like this are triggered by specific user actions and carry the highest open rates of any email type, making them a critical touchpoint for building trust and reinforcing brand reliability.",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw) {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function buildSummary(email) {
  const brand = brandMap[email.brand];
  const brandName = brand?.name ?? email.brand;
  const uc = usecaseMap[email.useCase];
  const ucName = uc?.name ?? email.useCase;

  // Map tag slugs to readable names (up to 3)
  const tagNames = email.tags
    .slice(0, 3)
    .map((slug) => tagMap[slug]?.name ?? slug.replace(/-/g, " "))
    .join(", ");

  const date = formatDate(email.setDate);
  const context = useCaseContext[email.useCase] || "";

  const parts = [];

  // Opening: what this email is
  parts.push(
    `This ${ucName.toLowerCase()} email from ${brandName} uses the subject line "${email.subject}".`
  );

  // Middle: tags and date
  if (tagNames && date) {
    parts.push(
      `Tagged as ${tagNames}, it was sent on ${date} as part of ${brandName}'s lifecycle sequence.`
    );
  } else if (tagNames) {
    parts.push(
      `Tagged as ${tagNames}, it is part of ${brandName}'s lifecycle email sequence.`
    );
  }

  // Closing: use case context
  if (context) {
    parts.push(context);
  }

  return parts.join(" ");
}

// ── Main ─────────────────────────────────────────────────────────────────────

let updated = 0;
const byBrand = {};

for (const email of emails) {
  if (email.summary) continue;
  if (brandFilter && email.brand !== brandFilter) continue;

  const summary = buildSummary(email);
  email.summary = summary;
  updated++;

  byBrand[email.brand] = (byBrand[email.brand] || 0) + 1;

  if (dryRun) {
    console.log(`\n── ${email.slug} ──`);
    console.log(`   Brand: ${brandMap[email.brand]?.name ?? email.brand}`);
    console.log(`   Subject: ${email.subject}`);
    console.log(`   Summary (${summary.length} chars):`);
    console.log(`   ${summary}`);
  }
}

if (!dryRun && updated > 0) {
  writeFileSync(join(DATA, "emails.json"), JSON.stringify(emails, null, 2) + "\n");
}

console.log(`\n✓ ${updated} summaries ${dryRun ? "would be" : ""} generated`);
for (const [brand, count] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${brandMap[brand]?.name ?? brand}: ${count}`);
}
if (dryRun) console.log("\n(dry run — no files written)");
