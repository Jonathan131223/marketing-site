#!/usr/bin/env node
/**
 * IndexNow URL submission script.
 *
 * Usage:
 *   node scripts/indexnow.js                          # submit every URL in the generated sitemaps
 *   node scripts/indexnow.js /blog/saas-welcome-email # submit specific path(s)
 *
 * Reads the sitemaps produced by `scripts/generate-sitemap.js` (public/sitemap-*.xml),
 * so it submits the SAME set of URLs we ask search engines to index — currently the
 * full library + static pages, not a hand-maintained subset. Wired into `postbuild`
 * so every deploy pushes the current sitemap; also runnable manually after publishing.
 *
 * IndexNow notifies Bing, Yandex, Seznam, Naver, etc. (not Google — use GSC/sitemaps
 * for Google). Never exits non-zero: a submission failure must not break the deploy.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API_KEY = "9887074e51ea47b0b67d26d806866382";
const HOST = "www.digistorms.ai";
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;
const BATCH_SIZE = 10000; // IndexNow hard cap per request

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

/** Collect every <loc> from the generated child sitemaps (skips the index). */
function urlsFromSitemaps() {
  const files = readdirSync(PUBLIC_DIR).filter(
    (f) => /^sitemap-.*\.xml$/.test(f), // sitemap-static.xml, sitemap-library.xml — not the sitemap.xml index
  );
  const urls = new Set();
  for (const file of files) {
    const xml = readFileSync(join(PUBLIC_DIR, file), "utf8");
    for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
      urls.add(m[1]);
    }
  }
  return [...urls];
}

async function submitBatch(urls) {
  const body = {
    host: HOST,
    key: API_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });

    if (res.ok || res.status === 202) {
      console.log(`✓ IndexNow: submitted ${urls.length} URL(s) — status ${res.status}`);
    } else {
      console.error(`✗ IndexNow: failed — status ${res.status} ${res.statusText}`);
      const text = await res.text().catch(() => "");
      if (text) console.error("  ", text.slice(0, 200));
    }
  } catch (err) {
    console.error(`✗ IndexNow: request error — ${err.message}`);
  }
}

async function submitUrls(urls) {
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    await submitBatch(urls.slice(i, i + BATCH_SIZE));
  }
}

async function main() {
  const args = process.argv.slice(2);

  // `--auto` is the postbuild hook: only ping IndexNow on a real production
  // deploy. Skip CI builds and Vercel preview/dev builds so we don't announce
  // URLs from environments that aren't the canonical live site. Manual runs
  // (no flag) always submit — that's how we clear a backlog on demand.
  const auto = args.includes("--auto");
  const paths = args.filter((a) => a !== "--auto");
  if (auto && process.env.VERCEL_ENV !== "production") {
    console.log(
      `IndexNow: skipping auto-submit (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"}, not a production deploy).`,
    );
    return;
  }

  if (paths.length > 0) {
    // Submit specific paths
    const urls = paths.map((p) => `https://${HOST}${p.startsWith("/") ? p : `/${p}`}`);
    await submitUrls(urls);
    return;
  }

  // Default: submit every URL we publish in the sitemaps.
  const urls = urlsFromSitemaps();
  if (urls.length === 0) {
    console.error("✗ IndexNow: no sitemap URLs found — run `npm run sitemap` first.");
    return;
  }
  console.log(`IndexNow: found ${urls.length} sitemap URL(s) to submit.`);
  await submitUrls(urls);
}

main().catch((err) => console.error("✗ IndexNow:", err.message));
