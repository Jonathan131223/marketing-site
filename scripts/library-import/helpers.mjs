import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const ROOT = join(__dirname, "..", "..");
export const SRC_DATA = join(ROOT, "src/data/library");
export const PUBLIC_DATA = join(ROOT, "public/data/library");
export const SCREENSHOTS_DIR = join(ROOT, "public/email-screenshots");
export const LOGOS_DIR = join(ROOT, "public/logos");
export const CACHE_DIR = join(ROOT, ".cache/library-import");

export function toSlug(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateId() {
  const secs = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
  return secs + randomBytes(8).toString("hex");
}

export function formatSetDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toString().replace(/GMT[+-]\d+.*$/, "GMT+0000 (Coordinated Universal Time)");
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatBrandDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function formatMMDDYYYY(d) {
  const date = d instanceof Date ? d : new Date(d);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  return `${mm}${dd}${yyyy}`;
}

export function computeDuration(startDate, endDate) {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (days < 14) return `About ${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) {
    const weeks = Math.round(days / 7);
    return `About ${weeks} week${weeks === 1 ? "" : "s"}`;
  }
  const months = Math.round(days / 30);
  if (months < 12) return `About ${months} months`;
  const years = Math.floor(months / 12);
  const remMonths = months - years * 12;
  if (remMonths === 0) return `About ${years} year${years === 1 ? "" : "s"}`;
  return `About ${years} year${years === 1 ? "" : "s"} and ${remMonths} months`;
}

export function computeAvgDelay(datesAsc) {
  if (datesAsc.length < 2) return "—";
  const ms = [];
  for (let i = 1; i < datesAsc.length; i++) {
    ms.push(new Date(datesAsc[i]) - new Date(datesAsc[i - 1]));
  }
  const avgMs = ms.reduce((a, b) => a + b, 0) / ms.length;
  const days = Math.max(1, Math.round(avgMs / (1000 * 60 * 60 * 24)));
  return `~${days} days`;
}

export function toEmailSlug({ primaryTag, brandSlug, date }) {
  return `${primaryTag}-from-${brandSlug}-${formatMMDDYYYY(date)}`;
}

export function htmlToText(html, maxChars = 1500) {
  let text = String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length > maxChars) text = text.slice(0, maxChars) + "…";
  return text;
}

export function loadLibraryData() {
  const emails = JSON.parse(readFileSync(join(SRC_DATA, "emails.json"), "utf8"));
  const brands = JSON.parse(readFileSync(join(SRC_DATA, "brands.json"), "utf8"));
  const tags = JSON.parse(readFileSync(join(SRC_DATA, "tags.json"), "utf8"));
  const usecases = JSON.parse(readFileSync(join(SRC_DATA, "usecases.json"), "utf8"));
  return { emails, brands, tags, usecases };
}

export function writeLibraryData({ emails, brands, usecases }) {
  for (const base of [SRC_DATA, PUBLIC_DATA]) {
    if (emails) writeFileSync(join(base, "emails.json"), JSON.stringify(emails, null, 2) + "\n");
    if (brands) writeFileSync(join(base, "brands.json"), JSON.stringify(brands, null, 2) + "\n");
    if (usecases) writeFileSync(join(base, "usecases.json"), JSON.stringify(usecases, null, 2) + "\n");
  }
}

export function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function validTaxonomy({ useCases, tags }) {
  return {
    useCaseSlugs: new Set(useCases.map((u) => u.slug)),
    tagSlugs: new Set(tags.map((t) => t.slug)),
  };
}

export async function fetchFavicon(domain) {
  const candidates = [
    `https://${domain}/apple-touch-icon.png`,
    `https://${domain}/apple-touch-icon-precomposed.png`,
    `https://${domain}/favicon.png`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("image") || url.endsWith(".png")) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 100) return buf;
        }
      }
    } catch {}
  }
  return null;
}

export function parseArgs(argv) {
  const args = {};
  for (const a of argv.slice(2)) {
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      args[k] = v === undefined ? true : v;
    }
  }
  return args;
}
