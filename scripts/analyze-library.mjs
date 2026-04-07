#!/usr/bin/env node
/**
 * Analyze the DigiStorms email library for the benchmark report.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "public/data/library");

const emails = JSON.parse(readFileSync(join(DATA, "emails.json"), "utf8"));
const brands = JSON.parse(readFileSync(join(DATA, "brands.json"), "utf8"));
const tags = JSON.parse(readFileSync(join(DATA, "tags.json"), "utf8"));
const usecases = JSON.parse(readFileSync(join(DATA, "usecases.json"), "utf8"));

const stopWords = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","it","its","this","that","your","you","we","our","are","was","be","has","have","had","will","can","do","did","not","no","so","as","if","up","out","all","new","get","how","more","just","been","one","also"]);

function topWords(texts, n = 20) {
  const freq = {};
  texts.forEach(t => {
    t.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).forEach(w => {
      if (w.length > 2 && !stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n);
}

// ── Overview
console.log("## Overview\n");
console.log(`- **Total emails analyzed:** ${emails.length}`);
console.log(`- **Brands represented:** ${brands.length}`);
console.log(`- **Email categories (tags):** ${tags.length}`);
console.log(`- **Lifecycle stages (use cases):** ${usecases.length}\n`);

// ── Use Case Distribution
console.log("## Lifecycle Stage Distribution\n");
console.log("| Lifecycle Stage | Emails | % of Total |");
console.log("|---|---:|---:|");
const ucCounts = {};
emails.forEach(e => { ucCounts[e.useCase] = (ucCounts[e.useCase] || 0) + 1; });
const ucSorted = Object.entries(ucCounts).sort((a, b) => b[1] - a[1]);
const ucNames = Object.fromEntries(usecases.map(u => [u.slug, u.name]));
ucSorted.forEach(([slug, count]) => {
  console.log(`| ${ucNames[slug] || slug} | ${count} | ${((count / emails.length) * 100).toFixed(1)}% |`);
});
console.log();

// ── Tag Distribution (Top 20)
console.log("## Email Type Distribution (Top 20)\n");
console.log("| Email Type | Count | % of Total |");
console.log("|---|---:|---:|");
const tagCounts = {};
emails.forEach(e => e.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
const tagSorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
const tagNames = Object.fromEntries(tags.map(t => [t.slug, t.name]));
tagSorted.forEach(([slug, count]) => {
  console.log(`| ${tagNames[slug] || slug.replace(/-/g, " ")} | ${count} | ${((count / emails.length) * 100).toFixed(1)}% |`);
});
console.log();

// ── Subject Line Analysis
console.log("## Subject Line Analysis\n");
const subjects = emails.map(e => e.subject).filter(Boolean);
const avgLen = (subjects.reduce((s, sub) => s + sub.length, 0) / subjects.length).toFixed(1);
const withNumbers = subjects.filter(s => /\d/.test(s));
const withQuestions = subjects.filter(s => /\?/.test(s));
const withEmoji = subjects.filter(s => /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(s));
const withPersonalization = subjects.filter(s => /\{|%|{{|\[name\]|\[first.?name\]/i.test(s));

console.log(`- **Average subject line length:** ${avgLen} characters`);
console.log(`- **Contain numbers:** ${withNumbers.length} (${((withNumbers.length / subjects.length) * 100).toFixed(1)}%)`);
console.log(`- **Contain questions:** ${withQuestions.length} (${((withQuestions.length / subjects.length) * 100).toFixed(1)}%)`);
console.log(`- **Contain emoji:** ${withEmoji.length} (${((withEmoji.length / subjects.length) * 100).toFixed(1)}%)`);
console.log(`- **Contain personalization tokens:** ${withPersonalization.length} (${((withPersonalization.length / subjects.length) * 100).toFixed(1)}%)\n`);

console.log("### Most Common Subject Line Words\n");
console.log("| Word | Frequency |");
console.log("|---|---:|");
topWords(subjects, 15).forEach(([word, count]) => console.log(`| ${word} | ${count} |`));
console.log();

console.log("### Subject Line Length Distribution\n");
const lenBuckets = { "1-20 chars": 0, "21-40 chars": 0, "41-60 chars": 0, "61-80 chars": 0, "81+ chars": 0 };
subjects.forEach(s => {
  const l = s.length;
  if (l <= 20) lenBuckets["1-20 chars"]++;
  else if (l <= 40) lenBuckets["21-40 chars"]++;
  else if (l <= 60) lenBuckets["41-60 chars"]++;
  else if (l <= 80) lenBuckets["61-80 chars"]++;
  else lenBuckets["81+ chars"]++;
});
console.log("| Length Range | Count | % |");
console.log("|---|---:|---:|");
Object.entries(lenBuckets).forEach(([range, count]) => {
  console.log(`| ${range} | ${count} | ${((count / subjects.length) * 100).toFixed(1)}% |`);
});
console.log();

// ── Brand Analysis
console.log("## Brand Analysis\n");
console.log("### Top 15 Brands by Email Count\n");
console.log("| Brand | Emails | Use Cases Covered |");
console.log("|---|---:|---:|");
const brandEmails = {};
const brandUCs = {};
emails.forEach(e => {
  brandEmails[e.brand] = (brandEmails[e.brand] || 0) + 1;
  if (!brandUCs[e.brand]) brandUCs[e.brand] = new Set();
  brandUCs[e.brand].add(e.useCase);
});
const brandNameMap = Object.fromEntries(brands.map(b => [b.slug, b.name]));
Object.entries(brandEmails)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([slug, count]) => {
    console.log(`| ${brandNameMap[slug] || slug} | ${count} | ${brandUCs[slug]?.size || 0}/9 |`);
  });
console.log();

// ── Cross-tabulation
console.log("## Most Common Email Types by Lifecycle Stage\n");
ucSorted.forEach(([ucSlug]) => {
  const ucEmails = emails.filter(e => e.useCase === ucSlug);
  const ucTagCounts = {};
  ucEmails.forEach(e => e.tags.forEach(t => { ucTagCounts[t] = (ucTagCounts[t] || 0) + 1; }));
  const top3 = Object.entries(ucTagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const top3Str = top3.map(([t, c]) => `${tagNames[t] || t.replace(/-/g, " ")} (${c})`).join(", ");
  console.log(`- **${ucNames[ucSlug] || ucSlug}**: ${top3Str}`);
});
console.log();

// ── Key Stats
console.log("## Key Statistics\n");
const topTag = tagSorted[0];
const topUC = ucSorted[0];
const topBrand = Object.entries(brandEmails).sort((a, b) => b[1] - a[1])[0];
const fullCoverageBrands = Object.entries(brandUCs).filter(([_, ucs]) => ucs.size >= 7).length;
console.log(`- Most common email type: **${tagNames[topTag[0]] || topTag[0]}** (${topTag[1]} emails, ${((topTag[1] / emails.length) * 100).toFixed(0)}%)`);
console.log(`- Largest lifecycle stage: **${ucNames[topUC[0]] || topUC[0]}** (${topUC[1]} emails, ${((topUC[1] / emails.length) * 100).toFixed(0)}%)`);
console.log(`- **${brandNameMap[topBrand[0]] || topBrand[0]}** has the most emails (${topBrand[1]})`);
console.log(`- **${fullCoverageBrands}/${brands.length} brands** cover 7+ of 9 lifecycle stages`);
console.log(`- Average subject line: **${avgLen} chars** — ${((withQuestions.length / subjects.length) * 100).toFixed(0)}% questions, ${((withEmoji.length / subjects.length) * 100).toFixed(0)}% emoji`);
console.log(`- **${((withNumbers.length / subjects.length) * 100).toFixed(0)}%** of subject lines contain numbers`);
