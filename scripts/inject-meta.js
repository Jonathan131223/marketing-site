#!/usr/bin/env node
/**
 * Post-build meta injection script
 *
 * Generates static HTML files for every library route with the correct
 * <title>, <meta>, canonical, Open Graph, Twitter Card, and JSON-LD tags
 * already present in the HTML — no JavaScript execution required.
 *
 * Vercel serves static files before falling through to the catch-all
 * rewrite, so crawlers and LLMs that do not execute JS will still read
 * complete, accurate metadata.
 *
 * Usage:  node scripts/inject-meta.js
 * (runs automatically as part of the "build:seo" npm script)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const DIST      = join(ROOT, "dist");
const DATA      = join(ROOT, "public/data/library");
const BASE_URL  = "https://digistorms.ai";
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png`;

// ── Load data ─────────────────────────────────────────────────────────────────

const emails   = JSON.parse(readFileSync(join(DATA, "emails.json"),   "utf8"));
const brands   = JSON.parse(readFileSync(join(DATA, "brands.json"),   "utf8"));
const tags     = JSON.parse(readFileSync(join(DATA, "tags.json"),     "utf8"));
const usecases = JSON.parse(readFileSync(join(DATA, "usecases.json"), "utf8"));

const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b]));

// ── Helpers ───────────────────────────────────────────────────────────────────

function truncateAtWord(text, limit) {
  if (!text || text.length <= limit) return text ?? "";
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function esc(str) {
  return (str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildHead({ title, description, canonical, ogType = "website", ogImage, jsonLd }) {
  const desc = esc(truncateAtWord(description, 155));
  const t    = esc(title);
  const img  = esc(ogImage || DEFAULT_OG_IMAGE);
  const can  = esc(canonical);

  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${desc}" />`,
    `<link rel="canonical" href="${can}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${can}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : "",
  ].filter(Boolean).join("\n    ");
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── Read dist/index.html template ─────────────────────────────────────────────

const template = readFileSync(join(DIST, "index.html"), "utf8");

// ── Inject & write ────────────────────────────────────────────────────────────

let count = 0;

function writeRoute(urlPath, headMeta) {
  // Replace default title and description, then inject all tags before </head>
  let html = template
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/<meta name="description"[^>]*\/?>/, "")
    .replace("</head>", `    ${headMeta}\n  </head>`);

  const fsPath = join(DIST, ...urlPath.split("/").filter(Boolean), "index.html");
  mkdirSync(dirname(fsPath), { recursive: true });
  writeFileSync(fsPath, html);
  count++;
}

// ── Library hub ───────────────────────────────────────────────────────────────

writeRoute("/library", buildHead({
  title: "Email Library – B2B SaaS Lifecycle Emails | DigiStorms",
  description: "Browse 1,000+ lifecycle emails from the best B2B SaaS companies. Filter by brand, tag, or use case. The largest B2B SaaS email library.",
  canonical: `${BASE_URL}/library`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Email Library – B2B SaaS Lifecycle Emails",
    description: "Browse 1,000+ lifecycle emails from the best B2B SaaS companies.",
    url: `${BASE_URL}/library`,
  },
}));

// ── Index pages ───────────────────────────────────────────────────────────────

writeRoute("/library/brands", buildHead({
  title: "All Brands — B2B SaaS Email Library | DigiStorms",
  description: `Explore lifecycle email sequences from ${brands.length}+ top B2B SaaS companies. Browse onboarding, engagement, expansion, and retention emails by brand.`,
  canonical: `${BASE_URL}/library/brands`,
  jsonLd: breadcrumbSchema([
    { name: "Library", url: `${BASE_URL}/library` },
    { name: "Brands",  url: `${BASE_URL}/library/brands` },
  ]),
}));

writeRoute("/library/tags", buildHead({
  title: "All Tags — B2B SaaS Email Library | DigiStorms",
  description: `Browse lifecycle emails by tag — welcome, upgrade, trial expiring, NPS, win-back, feature nudge, and ${tags.length - 10}+ more email types from top B2B SaaS companies.`,
  canonical: `${BASE_URL}/library/tags`,
  jsonLd: breadcrumbSchema([
    { name: "Library", url: `${BASE_URL}/library` },
    { name: "Tags",    url: `${BASE_URL}/library/tags` },
  ]),
}));

writeRoute("/library/usecases", buildHead({
  title: "All Use Cases — B2B SaaS Email Library | DigiStorms",
  description: "Explore lifecycle email use cases from top B2B SaaS companies — onboarding, education, expansion, milestone celebrations, win-back, feedback, and more.",
  canonical: `${BASE_URL}/library/usecases`,
  jsonLd: breadcrumbSchema([
    { name: "Library",   url: `${BASE_URL}/library` },
    { name: "Use Cases", url: `${BASE_URL}/library/usecases` },
  ]),
}));

// ── Brand detail pages ────────────────────────────────────────────────────────

brands.forEach((brand) => {
  const desc = brand.metaDesc || `Browse all ${brand.name} lifecycle emails in the DigiStorms library.`;
  writeRoute(`/library/brand/${brand.slug}`, buildHead({
    title: `${brand.name} Emails — B2B SaaS Library | DigiStorms`,
    description: desc,
    canonical: `${BASE_URL}/library/brand/${brand.slug}`,
    ogImage: brand.logo || DEFAULT_OG_IMAGE,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${brand.name} Emails`,
      description: truncateAtWord(desc, 155),
      url: `${BASE_URL}/library/brand/${brand.slug}`,
      breadcrumb: breadcrumbSchema([
        { name: "Library", url: `${BASE_URL}/library` },
        { name: "Brands",  url: `${BASE_URL}/library/brands` },
        { name: brand.name, url: `${BASE_URL}/library/brand/${brand.slug}` },
      ]),
    },
  }));
});

// ── Tag detail pages ──────────────────────────────────────────────────────────

tags.forEach((tag) => {
  const emailsForTag = emails.filter((e) => e.tags.includes(tag.slug));
  const desc = tag.summary ||
    `Browse ${emailsForTag.length} ${tag.name} emails from top B2B SaaS companies in the DigiStorms library.`;
  writeRoute(`/library/tag/${tag.slug}`, buildHead({
    title: `${tag.name} Emails — B2B SaaS Library | DigiStorms`,
    description: desc,
    canonical: `${BASE_URL}/library/tag/${tag.slug}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${tag.name} Emails`,
      description: truncateAtWord(desc, 155),
      url: `${BASE_URL}/library/tag/${tag.slug}`,
      breadcrumb: breadcrumbSchema([
        { name: "Library", url: `${BASE_URL}/library` },
        { name: "Tags",    url: `${BASE_URL}/library/tags` },
        { name: tag.name,  url: `${BASE_URL}/library/tag/${tag.slug}` },
      ]),
    },
  }));
});

// ── Use case detail pages ─────────────────────────────────────────────────────

usecases.forEach((uc) => {
  const emailsForUC = emails.filter((e) => e.useCase === uc.slug);
  const desc = uc.description ||
    `Browse ${emailsForUC.length} ${uc.name} emails from top B2B SaaS companies.`;
  writeRoute(`/library/usecase/${uc.slug}`, buildHead({
    title: `${uc.name} Emails — B2B SaaS Library | DigiStorms`,
    description: desc,
    canonical: `${BASE_URL}/library/usecase/${uc.slug}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${uc.name} Emails`,
      description: truncateAtWord(desc, 155),
      url: `${BASE_URL}/library/usecase/${uc.slug}`,
      breadcrumb: breadcrumbSchema([
        { name: "Library",   url: `${BASE_URL}/library` },
        { name: "Use Cases", url: `${BASE_URL}/library/usecases` },
        { name: uc.name,     url: `${BASE_URL}/library/usecase/${uc.slug}` },
      ]),
    },
  }));
});

// ── Email detail pages ────────────────────────────────────────────────────────

emails.forEach((email) => {
  const brand = brandMap[email.brand];
  const brandName = brand?.name ?? email.brand;
  const rawDesc = email.summary || `${email.subject} — a lifecycle email from ${brandName}.`;
  const desc = truncateAtWord(rawDesc, 155);

  let datePublished;
  if (email.setDate) {
    try { datePublished = new Date(email.setDate).toISOString().split("T")[0]; } catch {}
  }

  writeRoute(`/library/email/${email.slug}`, buildHead({
    title: `${email.subject} — ${brandName} | DigiStorms Library`,
    description: desc,
    canonical: `${BASE_URL}/library/email/${email.slug}`,
    ogType: "article",
    ogImage: email.thumb || DEFAULT_OG_IMAGE,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: email.subject,
      description: desc,
      ...(email.thumb ? { image: email.thumb } : {}),
      url: `${BASE_URL}/library/email/${email.slug}`,
      ...(datePublished ? { datePublished } : {}),
      author: { "@type": "Organization", name: brandName },
      publisher: { "@type": "Organization", name: "DigiStorms", url: BASE_URL },
      breadcrumb: breadcrumbSchema([
        { name: "Library",     url: `${BASE_URL}/library` },
        { name: brandName,     url: `${BASE_URL}/library/brand/${email.brand}` },
        { name: email.subject, url: `${BASE_URL}/library/email/${email.slug}` },
      ]),
    },
  }));
});

console.log(`✓ inject-meta: wrote ${count} pre-rendered HTML files to dist/`);
console.log(`  Library hub + index pages : 4`);
console.log(`  Brand pages               : ${brands.length}`);
console.log(`  Tag pages                 : ${tags.length}`);
console.log(`  Use case pages            : ${usecases.length}`);
console.log(`  Email pages               : ${emails.length}`);
