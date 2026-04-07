#!/usr/bin/env node
// Run: node scripts/generate-sitemap.js
// Generates public/sitemap.xml (index), public/sitemap-static.xml, public/sitemap-library.xml

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE_URL = "https://www.digistorms.ai";
const TODAY = new Date().toISOString().split("T")[0];

const emails   = JSON.parse(readFileSync(join(ROOT, "public/data/library/emails.json"), "utf8"));
const brands   = JSON.parse(readFileSync(join(ROOT, "public/data/library/brands.json"), "utf8"));
const tags     = JSON.parse(readFileSync(join(ROOT, "public/data/library/tags.json"), "utf8"));
const usecases = JSON.parse(readFileSync(join(ROOT, "public/data/library/usecases.json"), "utf8"));

// ── Derive lastmod dates from actual email data ──────────────────────────────

function toISODate(raw) {
  try { return new Date(raw).toISOString().split("T")[0]; } catch { return null; }
}

const brandLatestDate = {};
const tagLatestDate = {};
const usecaseLatestDate = {};

emails.forEach((e) => {
  const d = toISODate(e.setDate);
  if (!d) return;
  // Brand
  if (!brandLatestDate[e.brand] || d > brandLatestDate[e.brand])
    brandLatestDate[e.brand] = d;
  // Tags
  e.tags.forEach((t) => {
    if (!tagLatestDate[t] || d > tagLatestDate[t]) tagLatestDate[t] = d;
  });
  // Use case
  if (!usecaseLatestDate[e.useCase] || d > usecaseLatestDate[e.useCase])
    usecaseLatestDate[e.useCase] = d;
});

const globalLatest = Object.values(brandLatestDate)
  .reduce((a, b) => (a > b ? a : b), "2020-01-01");

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// ── sitemap-static.xml ────────────────────────────────────────────────────────
const staticEntries = [
  urlEntry(`${BASE_URL}/`,                   "2026-03-23", "monthly",  "1.0"),
  urlEntry(`${BASE_URL}/blog`,               "2026-03-23", "weekly",   "0.9"),
  urlEntry(`${BASE_URL}/manifesto`,          "2026-01-01", "yearly",   "0.5"),
  urlEntry(`${BASE_URL}/about`,              "2026-04-07", "monthly",  "0.6"),
  urlEntry(`${BASE_URL}/roi-calculator`,     "2026-01-01", "monthly",  "0.7"),
  urlEntry(`${BASE_URL}/email-generator`,    "2026-01-01", "monthly",  "0.7"),
  urlEntry(`${BASE_URL}/privacy`,            "2026-01-01", "yearly",   "0.3"),
  urlEntry(`${BASE_URL}/terms`,              "2026-01-01", "yearly",   "0.3"),
  urlEntry(`${BASE_URL}/lifecycle-score`,    "2026-01-01", "monthly",  "0.7"),
  urlEntry(`${BASE_URL}/contact`,            "2026-04-07", "monthly",  "0.6"),
  urlEntry(`${BASE_URL}/email-generator/templates`, "2026-01-01", "monthly", "0.7"),
  // Blog posts
  urlEntry(`${BASE_URL}/blog/saas-welcome-email`,        "2026-03-23", "monthly", "0.9"),
  urlEntry(`${BASE_URL}/blog/webinar-email-sequence`,    "2026-03-23", "monthly", "0.9"),
  urlEntry(`${BASE_URL}/blog/product-launch-email`,      "2026-03-15", "monthly", "0.9"),
  urlEntry(`${BASE_URL}/blog/saas-newsletter`,           "2026-03-01", "monthly", "0.9"),
  urlEntry(`${BASE_URL}/blog/webinar-follow-up-email`,   "2026-02-15", "monthly", "0.9"),
  urlEntry(`${BASE_URL}/blog/webinar-emails`,            "2026-02-01", "monthly", "0.9"),
  urlEntry(`${BASE_URL}/blog/milestone-emails`,          "2026-01-20", "monthly", "0.9"),
  urlEntry(`${BASE_URL}/blog/upgrade-emails`,            "2026-01-15", "monthly", "0.9"),
  urlEntry(`${BASE_URL}/blog/dunning-emails`,            "2025-03-28", "monthly", "0.9"),
  // Comparison pages
  urlEntry(`${BASE_URL}/compare/digistorms-vs-customer-io`, "2026-04-07", "monthly", "0.8"),
  urlEntry(`${BASE_URL}/compare/digistorms-vs-encharge`,    "2026-04-07", "monthly", "0.8"),
  urlEntry(`${BASE_URL}/compare/digistorms-vs-loops`,       "2026-04-07", "monthly", "0.8"),
  urlEntry(`${BASE_URL}/compare/digistorms-vs-resend`,      "2026-04-07", "monthly", "0.8"),
  urlEntry(`${BASE_URL}/compare/best-onboarding-email-tools`, "2026-04-07", "monthly", "0.8"),
  urlEntry(`${BASE_URL}/compare/customer-io-alternatives`,  "2026-04-07", "monthly", "0.8"),
  // Benchmark blog post
  urlEntry(`${BASE_URL}/blog/saas-email-benchmarks`,        "2026-04-07", "monthly", "0.9"),
];

writeFileSync(
  join(ROOT, "public/sitemap-static.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${staticEntries.join("\n")}\n\n</urlset>\n`
);

// ── sitemap-library.xml ───────────────────────────────────────────────────────
const libraryEntries = [
  // Hub + index pages
  urlEntry(`${BASE_URL}/library`,           globalLatest, "weekly", "0.9"),
  urlEntry(`${BASE_URL}/library/brands`,    globalLatest, "weekly", "0.8"),
  urlEntry(`${BASE_URL}/library/tags`,      globalLatest, "weekly", "0.8"),
  urlEntry(`${BASE_URL}/library/usecases`,  globalLatest, "weekly", "0.8"),
  // Brand detail pages
  ...brands.map((b) => urlEntry(`${BASE_URL}/library/brand/${b.slug}`, brandLatestDate[b.slug] || globalLatest, "weekly", "0.7")),
  // Tag detail pages
  ...tags.map((t) => urlEntry(`${BASE_URL}/library/tag/${t.slug}`, tagLatestDate[t.slug] || globalLatest, "weekly", "0.7")),
  // Use case detail pages
  ...usecases.map((u) => urlEntry(`${BASE_URL}/library/usecase/${u.slug}`, usecaseLatestDate[u.slug] || globalLatest, "weekly", "0.7")),
  // Email detail pages (use email's own date when available)
  ...emails.map((e) => {
    let lastmod = TODAY;
    if (e.setDate) {
      try { lastmod = new Date(e.setDate).toISOString().split("T")[0]; } catch {}
    }
    return urlEntry(`${BASE_URL}/library/email/${e.slug}`, lastmod, "monthly", "0.6");
  }),
];

writeFileSync(
  join(ROOT, "public/sitemap-library.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${libraryEntries.join("\n")}\n\n</urlset>\n`
);

// ── sitemap.xml (index) ───────────────────────────────────────────────────────
writeFileSync(
  join(ROOT, "public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-static.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-library.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>
`
);

const totalLibrary = libraryEntries.length;
console.log(`✓ sitemap.xml          — sitemap index (2 child sitemaps)`);
console.log(`✓ sitemap-static.xml   — ${staticEntries.length} URLs`);
console.log(`✓ sitemap-library.xml  — ${totalLibrary} URLs`);
console.log(`    Hub + index pages  : 4`);
console.log(`    Brand pages        : ${brands.length}`);
console.log(`    Tag pages          : ${tags.length}`);
console.log(`    Use case pages     : ${usecases.length}`);
console.log(`    Email pages        : ${emails.length}`);
