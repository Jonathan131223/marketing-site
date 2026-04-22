#!/usr/bin/env node
/**
 * Render marketing-email HTML to mobile-viewport PNG screenshots via Playwright.
 *
 * Reads `.cache/library-import/{brand-slug}/manifest.json` — an array of
 * {slug, bodyFile} entries — and writes `public/email-screenshots/{slug}.png`
 * for each, at 490×1014 to match existing local demo thumbnails.
 *
 * Usage:
 *   node scripts/library-import/render-screenshots.mjs --brand=wispr-flow
 *   node scripts/library-import/render-screenshots.mjs --brand=wispr-flow --dry-run
 *   node scripts/library-import/render-screenshots.mjs --brand=wispr-flow --only=slug-1,slug-2
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { CACHE_DIR, SCREENSHOTS_DIR, ensureDir, parseArgs } from "./helpers.mjs";

const VIEWPORT = { width: 840, height: 1200 };

const args = parseArgs(process.argv);
if (!args.brand) {
  console.error("error: --brand=<slug> is required");
  process.exit(1);
}
const brandDir = join(CACHE_DIR, args.brand);
if (!existsSync(brandDir)) {
  console.error(`error: cache dir does not exist: ${brandDir}`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(join(brandDir, "manifest.json"), "utf8"));
const onlySet = args.only ? new Set(args.only.split(",")) : null;

ensureDir(SCREENSHOTS_DIR);

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  let rendered = 0;
  let skipped = 0;
  for (const entry of manifest) {
    if (onlySet && !onlySet.has(entry.slug)) continue;
    const outPath = join(SCREENSHOTS_DIR, `${entry.slug}.png`);
    if (args["dry-run"]) {
      console.log(`[dry-run] would render ${entry.slug} → ${outPath}`);
      skipped++;
      continue;
    }
    const htmlPath = join(brandDir, entry.bodyFile);
    if (!existsSync(htmlPath)) {
      console.warn(`skip ${entry.slug}: body missing at ${htmlPath}`);
      skipped++;
      continue;
    }
    const html = readFileSync(htmlPath, "utf8");
    const wrapped = wrapEmailHtml(html);
    await page.setContent(wrapped, { waitUntil: "domcontentloaded", timeout: 30_000 });
    try {
      await page.waitForLoadState("networkidle", { timeout: 8_000 });
    } catch {}
    try {
      await page.evaluate(async () => {
        const imgs = Array.from(document.images);
        await Promise.all(
          imgs.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((res) => { img.onload = img.onerror = () => res(); }),
          ),
        );
      });
    } catch {}
    await page.screenshot({
      path: outPath,
      fullPage: true,
      type: "png",
    });
    console.log(`rendered ${entry.slug}`);
    rendered++;
  }
  console.log(`\ndone: ${rendered} rendered, ${skipped} skipped`);
} finally {
  await browser.close();
}

function wrapEmailHtml(html) {
  const hasDoctype = /^\s*<!doctype/i.test(html);
  const hasHtmlTag = /<html[\s>]/i.test(html);
  if (hasDoctype && hasHtmlTag) return html;
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=840, initial-scale=1">
<style>html,body{margin:0;padding:0;background:#fff;font-family:-apple-system,Segoe UI,Roboto,sans-serif}
img{max-width:100%;height:auto;display:block}</style>
</head><body>${html}</body></html>`;
}
