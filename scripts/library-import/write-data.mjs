#!/usr/bin/env node
/**
 * Upsert a new brand + N email entries into the library JSON files.
 *
 * Reads a payload from a JSON file or stdin with shape:
 *   {
 *     "brand": { slug, name, summary, description, metaDesc, logoUrl? },
 *     "emails": [{ subject, sender, date, useCase, tags, summary, templateTitle, bodyFile? }]
 *   }
 *
 * Writes to both src/data/library/ and public/data/library/ for brands, emails,
 * and usecases. Fetches a logo favicon and writes it to public/logos/.
 * Validates taxonomy strictly — aborts if any useCase or tag is unknown.
 *
 * Usage:
 *   node scripts/library-import/write-data.mjs --payload=.cache/library-import/wispr-flow/payload.json
 *   node scripts/library-import/write-data.mjs --payload=- < payload.json     # stdin
 *   node scripts/library-import/write-data.mjs --payload=... --dry-run
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import {
  LOGOS_DIR, SCREENSHOTS_DIR,
  loadLibraryData, writeLibraryData, ensureDir,
  generateId, formatSetDate, formatBrandDate, formatMMDDYYYY,
  computeDuration, computeAvgDelay, toEmailSlug, validTaxonomy,
  fetchFavicon, parseArgs,
} from "./helpers.mjs";

const args = parseArgs(process.argv);
if (!args.payload) {
  console.error("error: --payload=<path|-> is required");
  process.exit(1);
}
const payloadRaw = args.payload === "-" ? readFileSync(0, "utf8") : readFileSync(args.payload, "utf8");
const payload = JSON.parse(payloadRaw);

if (!payload?.brand?.slug || !payload?.brand?.name) {
  console.error("error: payload.brand.slug and .name are required");
  process.exit(1);
}
if (!Array.isArray(payload.emails) || payload.emails.length === 0) {
  console.error("error: payload.emails must be a non-empty array");
  process.exit(1);
}

const { emails, brands, tags, usecases } = loadLibraryData();
const { useCaseSlugs, tagSlugs } = validTaxonomy({ useCases: usecases, tags });

if (brands.some((b) => b.slug === payload.brand.slug)) {
  console.error(`error: brand slug "${payload.brand.slug}" already exists in brands.json; aborting to avoid duplicate. Use a different slug or drop the existing entry first.`);
  process.exit(1);
}

const taxonomyErrors = [];
for (const [i, e] of payload.emails.entries()) {
  if (!useCaseSlugs.has(e.useCase)) {
    taxonomyErrors.push(`emails[${i}] "${e.subject}": unknown useCase "${e.useCase}"`);
  }
  if (!Array.isArray(e.tags) || e.tags.length === 0) {
    taxonomyErrors.push(`emails[${i}] "${e.subject}": tags must be a non-empty array`);
  } else {
    for (const t of e.tags) {
      if (!tagSlugs.has(t)) taxonomyErrors.push(`emails[${i}] "${e.subject}": unknown tag "${t}"`);
    }
  }
  if (!e.date || isNaN(new Date(e.date).getTime())) {
    taxonomyErrors.push(`emails[${i}] "${e.subject}": invalid date "${e.date}"`);
  }
  if (!e.subject) taxonomyErrors.push(`emails[${i}]: missing subject`);
}
if (taxonomyErrors.length) {
  console.error("taxonomy validation failed:");
  taxonomyErrors.forEach((x) => console.error("  -", x));
  process.exit(1);
}

const sortedEmails = [...payload.emails].sort((a, b) => new Date(a.date) - new Date(b.date));

const newEmails = [];
const existingSlugs = new Set(emails.map((e) => e.slug));
for (const e of sortedEmails) {
  const slug = toEmailSlug({
    primaryTag: e.tags[0],
    brandSlug: payload.brand.slug,
    date: e.date,
  });
  if (existingSlugs.has(slug)) {
    console.error(`error: derived slug "${slug}" already exists. Adjust tag order or the email date to disambiguate.`);
    process.exit(1);
  }
  existingSlugs.add(slug);
  newEmails.push({
    id: generateId(),
    slug,
    subject: e.subject,
    thumb: `/email-screenshots/${slug}.png`,
    templateTitle: e.templateTitle || e.subject,
    summary: e.summary || "",
    tags: e.tags,
    brand: payload.brand.slug,
    useCase: e.useCase,
    setDate: formatSetDate(e.date),
    sender: e.sender || payload.brand.name,
  });
}

const dates = newEmails.map((e) => new Date(e.setDate));
const dateStart = dates[0];
const dateEnd = dates[dates.length - 1];
const useCasesForBrand = [...new Set(newEmails.map((e) => e.useCase))];

let logoPath = "";
if (!args["dry-run"]) {
  ensureDir(LOGOS_DIR);
  const domain = payload.brand.domain || deriveDomainFromSender(payload.brand);
  if (domain) {
    const buf = await fetchFavicon(domain);
    if (buf) {
      const ext = sniffImageExt(buf) || "png";
      const out = join(LOGOS_DIR, `${payload.brand.slug}.${ext}`);
      writeFileSync(out, buf);
      logoPath = `/logos/${payload.brand.slug}.${ext}`;
      console.log(`logo: saved ${logoPath} (${buf.length} bytes from ${domain})`);
    } else {
      console.warn(`logo: could not fetch favicon for ${domain}`);
    }
  }
}

const newBrand = {
  slug: payload.brand.slug,
  name: payload.brand.name,
  logo: logoPath,
  emailCount: newEmails.length,
  useCases: useCasesForBrand,
  duration: computeDuration(dateStart, dateEnd),
  dateStart: formatBrandDate(dateStart),
  dateEnd: formatBrandDate(dateEnd),
  avgDelay: computeAvgDelay(dates),
  summary: payload.brand.summary || "",
  description: payload.brand.description || "",
  metaDesc: payload.brand.metaDesc || "",
};

const nextBrands = [...brands, newBrand].sort((a, b) => a.slug.localeCompare(b.slug));
const nextEmails = [...emails, ...newEmails];

const nextUsecases = usecases.map((uc) => {
  const matchingNew = newEmails.filter((e) => e.useCase === uc.slug).length;
  if (matchingNew === 0) return uc;
  const nextBrands = uc.brands?.includes(payload.brand.slug)
    ? uc.brands
    : [...(uc.brands || []), payload.brand.slug];
  return { ...uc, emailCount: (uc.emailCount || 0) + matchingNew, brands: nextBrands };
});

if (args["dry-run"]) {
  console.log("[dry-run] would write:");
  console.log(`  brands.json: +1 (${newBrand.slug})`);
  console.log(`  emails.json: +${newEmails.length}`);
  console.log(`  usecases.json: updated counts for ${useCasesForBrand.join(", ")}`);
  newEmails.forEach((e) => console.log(`    ${e.slug}  [${e.useCase}]  tags=${e.tags.join(",")}`));
  process.exit(0);
}

writeLibraryData({ emails: nextEmails, brands: nextBrands, usecases: nextUsecases });
console.log(`wrote: ${newEmails.length} emails, 1 brand (${newBrand.slug}), ${useCasesForBrand.length} usecases updated`);

const summary = {
  brand: newBrand,
  emails: newEmails,
  canonical: {
    brand: `/library/brand/${newBrand.slug}`,
    emails: newEmails.map((e) => `/library/email/${e.slug}`),
  },
};
console.log(JSON.stringify(summary, null, 2));

function deriveDomainFromSender(brand) {
  if (brand.domain) return brand.domain;
  if (brand.sender?.includes("@")) return brand.sender.split("@")[1];
  return null;
}

function sniffImageExt(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf[0] === 0x47 && buf[1] === 0x49) return "gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) return "webp";
  if (buf.slice(0, 5).toString() === "<?xml" || buf.slice(0, 4).toString().startsWith("<svg")) return "svg";
  return null;
}
