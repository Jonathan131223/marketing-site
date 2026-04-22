#!/usr/bin/env node
/**
 * Download every Webflow-CDN-hosted library asset to local `public/` paths,
 * then (with --rewrite) swap the JSON references over to the local paths.
 *
 * Phase 1 (default): download brand logos and email thumbnails from
 *   cdn.prod.website-files.com / website-files.com / webflow.com into
 *   `public/logos/{brand-slug}.{ext}` and `public/email-screenshots/{slug}.{ext}`.
 *   Idempotent: skips files that already exist non-empty.
 *
 * Phase 2 (--rewrite): rewrites brands.json / emails.json in both
 *   `src/data/library/` and `public/data/library/` so Webflow URLs become local
 *   `/logos/...` and `/email-screenshots/...` paths. Only rewrites entries whose
 *   local file exists on disk.
 *
 * Usage:
 *   node scripts/library-import/download-webflow-assets.mjs --dry-run
 *   node scripts/library-import/download-webflow-assets.mjs
 *   node scripts/library-import/download-webflow-assets.mjs --force
 *   node scripts/library-import/download-webflow-assets.mjs --type=logos
 *   node scripts/library-import/download-webflow-assets.mjs --type=thumbs
 *   node scripts/library-import/download-webflow-assets.mjs --rewrite
 */

import { writeFileSync, existsSync, statSync, readFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import {
  CACHE_DIR,
  SCREENSHOTS_DIR,
  LOGOS_DIR,
  SRC_DATA,
  PUBLIC_DATA,
  ensureDir,
  parseArgs,
  loadLibraryData,
} from "./helpers.mjs";

const WEBFLOW_HOST_RE = /(?:cdn\.prod\.website-files\.com|website-files\.com|webflow\.com|uploads-ssl\.webflow\.com|assets\.website-files\.com)/i;
const CONCURRENCY = 8;
const MAX_RETRIES = 3;

const args = parseArgs(process.argv);
const typeFilter = args.type || null; // "logos" | "thumbs" | null
const dryRun = !!args["dry-run"];
const force = !!args.force;

if (typeFilter && !["logos", "thumbs"].includes(typeFilter)) {
  console.error(`error: --type must be "logos" or "thumbs"`);
  process.exit(1);
}

function isWebflowUrl(u) {
  return typeof u === "string" && /^https?:\/\//i.test(u) && WEBFLOW_HOST_RE.test(u);
}

function extFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const decoded = decodeURIComponent(pathname);
    const name = basename(decoded);
    // Walk from the end: if name ends with ".svg.png", prefer ".png"; if ".jpeg", normalize to ".jpg".
    const m = name.match(/\.([a-z0-9]{2,5})$/i);
    if (!m) return ".png";
    const ext = m[1].toLowerCase();
    if (ext === "jpeg") return ".jpg";
    return "." + ext;
  } catch {
    return ".png";
  }
}

function buildJobs({ emails, brands }) {
  const jobs = [];
  if (!typeFilter || typeFilter === "logos") {
    for (const b of brands) {
      if (!isWebflowUrl(b.logo)) continue;
      const ext = extFromUrl(b.logo);
      jobs.push({
        type: "logo",
        slug: b.slug,
        url: b.logo,
        localPath: join(LOGOS_DIR, `${b.slug}${ext}`),
        webPath: `/logos/${b.slug}${ext}`,
      });
    }
  }
  if (!typeFilter || typeFilter === "thumbs") {
    for (const e of emails) {
      if (!isWebflowUrl(e.thumb)) continue;
      const ext = extFromUrl(e.thumb);
      jobs.push({
        type: "thumb",
        slug: e.slug,
        url: e.thumb,
        localPath: join(SCREENSHOTS_DIR, `${e.slug}${ext}`),
        webPath: `/email-screenshots/${e.slug}${ext}`,
      });
    }
  }
  return jobs;
}

function fileExistsNonEmpty(p) {
  try {
    return statSync(p).size > 0;
  } catch {
    return false;
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadOne(job) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(job.url, { redirect: "follow" });
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
          await sleep(500 * 2 ** (attempt - 1));
          continue;
        }
        return { ok: false, job, error: `HTTP ${res.status}` };
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 10) {
        return { ok: false, job, error: `suspiciously small (${buf.length} bytes)` };
      }
      writeFileSync(job.localPath, buf);
      return { ok: true, job, bytes: buf.length };
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await sleep(500 * 2 ** (attempt - 1));
        continue;
      }
      return { ok: false, job, error: err.message || String(err) };
    }
  }
  return { ok: false, job, error: "exhausted retries" };
}

async function runPool(items, worker, size) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]);
    }
  }
  const workers = Array.from({ length: Math.min(size, items.length) }, run);
  await Promise.all(workers);
  return results;
}

function webflowUrlToLocalPath(url, type) {
  // Find the matching job's webPath by rebuilding from slug is not possible here;
  // callers pass the already-computed webPath. This helper exists only as a guard.
  return url;
}

function rewriteJson() {
  const { emails, brands } = loadLibraryData();

  const logoByBrandSlug = new Map();
  for (const b of brands) {
    if (!isWebflowUrl(b.logo)) continue;
    const ext = extFromUrl(b.logo);
    const localPath = join(LOGOS_DIR, `${b.slug}${ext}`);
    if (fileExistsNonEmpty(localPath)) {
      logoByBrandSlug.set(b.slug, `/logos/${b.slug}${ext}`);
    }
  }
  const thumbByEmailSlug = new Map();
  for (const e of emails) {
    if (!isWebflowUrl(e.thumb)) continue;
    const ext = extFromUrl(e.thumb);
    const localPath = join(SCREENSHOTS_DIR, `${e.slug}${ext}`);
    if (fileExistsNonEmpty(localPath)) {
      thumbByEmailSlug.set(e.slug, `/email-screenshots/${e.slug}${ext}`);
    }
  }

  let brandsRewritten = 0;
  let brandsSkipped = 0;
  for (const b of brands) {
    if (!isWebflowUrl(b.logo)) continue;
    const local = logoByBrandSlug.get(b.slug);
    if (local) {
      b.logo = local;
      brandsRewritten++;
    } else {
      brandsSkipped++;
      console.warn(`  skip logo: ${b.slug} (local file missing)`);
    }
  }

  let emailsRewritten = 0;
  let emailsSkipped = 0;
  for (const e of emails) {
    if (!isWebflowUrl(e.thumb)) continue;
    const local = thumbByEmailSlug.get(e.slug);
    if (local) {
      e.thumb = local;
      emailsRewritten++;
    } else {
      emailsSkipped++;
      if (emailsSkipped <= 10) console.warn(`  skip thumb: ${e.slug} (local file missing)`);
    }
  }
  if (emailsSkipped > 10) console.warn(`  ... and ${emailsSkipped - 10} more skipped thumbs`);

  if (dryRun) {
    console.log(`[dry-run] would rewrite ${brandsRewritten} logos + ${emailsRewritten} thumbs`);
    console.log(`[dry-run] would skip ${brandsSkipped} logos + ${emailsSkipped} thumbs (missing files)`);
    return;
  }

  for (const base of [SRC_DATA, PUBLIC_DATA]) {
    writeFileSync(join(base, "brands.json"), JSON.stringify(brands, null, 2) + "\n");
    writeFileSync(join(base, "emails.json"), JSON.stringify(emails, null, 2) + "\n");
  }

  console.log(`rewrote ${brandsRewritten} brand logos + ${emailsRewritten} email thumbs`);
  console.log(`skipped ${brandsSkipped} logos + ${emailsSkipped} thumbs (local file missing — left as Webflow URL)`);
}

async function runDownload() {
  const { emails, brands } = loadLibraryData();
  const jobs = buildJobs({ emails, brands });

  console.log(`found ${jobs.length} Webflow-hosted assets (${jobs.filter((j) => j.type === "logo").length} logos, ${jobs.filter((j) => j.type === "thumb").length} thumbs)`);

  ensureDir(LOGOS_DIR);
  ensureDir(SCREENSHOTS_DIR);
  ensureDir(CACHE_DIR);

  const toDownload = [];
  let alreadyLocal = 0;
  for (const job of jobs) {
    if (!force && fileExistsNonEmpty(job.localPath)) {
      alreadyLocal++;
      continue;
    }
    toDownload.push(job);
  }
  console.log(`${alreadyLocal} already downloaded, ${toDownload.length} to fetch`);

  if (dryRun) {
    for (const j of toDownload.slice(0, 10)) {
      console.log(`[dry-run] ${j.type} ${j.slug} → ${j.localPath}`);
    }
    if (toDownload.length > 10) console.log(`[dry-run] ... and ${toDownload.length - 10} more`);
    return;
  }

  let done = 0;
  const total = toDownload.length;
  const results = await runPool(
    toDownload,
    async (job) => {
      const r = await downloadOne(job);
      done++;
      if (done % 25 === 0 || done === total) {
        process.stdout.write(`  progress: ${done}/${total}\n`);
      }
      return r;
    },
    CONCURRENCY
  );

  const succeeded = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalJobs: jobs.length,
      alreadyLocal,
      attempted: toDownload.length,
      succeeded: succeeded.length,
      failed: failed.length,
    },
    succeeded: succeeded.map((r) => ({ type: r.job.type, slug: r.job.slug, url: r.job.url, localPath: r.job.localPath, bytes: r.bytes })),
    failed: failed.map((r) => ({ type: r.job.type, slug: r.job.slug, url: r.job.url, error: r.error })),
  };
  writeFileSync(join(CACHE_DIR, "download-report.json"), JSON.stringify(report, null, 2) + "\n");

  console.log(`\n${succeeded.length} downloaded, ${alreadyLocal} skipped (already local), ${failed.length} failed`);
  if (failed.length) {
    console.log(`\nfailures:`);
    for (const r of failed) {
      console.log(`  [${r.job.type}] ${r.job.slug} — ${r.error}`);
      console.log(`    ${r.job.url}`);
    }
  }
  console.log(`\nreport: ${join(CACHE_DIR, "download-report.json")}`);
}

if (args.rewrite) {
  rewriteJson();
} else {
  await runDownload();
}
