#!/usr/bin/env node
/**
 * Compress email screenshots in `public/email-screenshots/`.
 *
 * Background: an Ahrefs audit flagged 101 screenshot PNGs as too large
 * (>1MB each, up to 3.6MB), with 1,064 files weighing ~457MB on disk.
 * Screenshots render at ~600–800px on library email pages, but source
 * PNGs are typically 1680px wide and 5,000–12,000px tall (full-length
 * newsletter scrolls). The wasted bytes live in resolution the user
 * never sees, plus PNG's lossless encoding on photo-like banner imagery.
 *
 * Strategy: two-tier per file.
 *  1. Resize width to MAX_WIDTH (1200, retina-safe for an 800px box).
 *  2. Re-encode as lossless PNG (palette=false). If under SIZE_TARGET,
 *     keep it.
 *  3. Otherwise, re-encode as palette PNG (256-color quantization).
 *     Lossy but visually fine for screenshots with mostly UI content;
 *     gradients in modern email designs may show light banding. This
 *     is the only way to get the longest newsletter PNGs under 1MB
 *     while keeping the `.png` extension (no `emails.json` migration).
 *  4. If neither pass beats the original, skip — never regress.
 *
 * Why we keep PNG: `public/data/library/emails.json` references each
 * screenshot via `thumb: "/email-screenshots/{slug}.png"`. Switching to
 * WebP/JPEG would require a data migration and a `<picture>` fallback.
 *
 * Run:
 *   node scripts/compress-email-screenshots.mjs
 *   node scripts/compress-email-screenshots.mjs --dry-run
 *   node scripts/compress-email-screenshots.mjs --file=<name>.png
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIR = join(ROOT, "public/email-screenshots");

const MAX_WIDTH = 1200;
const SIZE_TARGET = 900 * 1024;
const SKIP_BELOW_BYTES = 400 * 1024;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ONLY_FILE = args.find((a) => a.startsWith("--file="))?.slice("--file=".length);

function fmtBytes(n) {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / 1024 / 1024).toFixed(2)}MB`;
}

async function processOne(filePath) {
  const buf = await readFile(filePath);
  const origBytes = buf.length;
  const meta = await sharp(buf).metadata();
  const origWidth = meta.width ?? 0;

  // Already small enough and not over-wide — leave alone.
  if (origWidth <= MAX_WIDTH && origBytes <= SKIP_BELOW_BYTES) {
    return { status: "skip-small", origBytes, newBytes: origBytes, origWidth, mode: "-" };
  }

  const resizeIfNeeded = (p) =>
    origWidth > MAX_WIDTH ? p.resize({ width: MAX_WIDTH, withoutEnlargement: true }) : p;

  // Pass 1: lossless re-encode at capped width.
  const lossless = await resizeIfNeeded(sharp(buf))
    .png({ compressionLevel: 9, palette: false, effort: 7 })
    .toBuffer();

  let best = lossless;
  let mode = "lossless";

  // Pass 2: only quantize if lossless still busts the budget. Palette
  // mode loses gradient fidelity but is the only way to land the long
  // newsletter scrolls under 1MB while keeping the .png extension.
  if (lossless.length > SIZE_TARGET) {
    const palette = await resizeIfNeeded(sharp(buf))
      .png({ compressionLevel: 9, palette: true, quality: 85, effort: 7 })
      .toBuffer();
    if (palette.length < best.length) {
      best = palette;
      mode = "palette";
    }
  }

  // Never make a file bigger than it was.
  if (best.length >= origBytes) {
    return { status: "skip-no-gain", origBytes, newBytes: origBytes, origWidth, mode: "-" };
  }

  if (!DRY_RUN) {
    await writeFile(filePath, best);
  }
  return {
    status: DRY_RUN ? "would-rewrite" : "rewrite",
    origBytes,
    newBytes: best.length,
    origWidth,
    mode,
  };
}

async function main() {
  let entries;
  if (ONLY_FILE) {
    entries = [ONLY_FILE];
  } else {
    entries = (await readdir(DIR)).filter((f) => f.toLowerCase().endsWith(".png"));
  }

  console.log(
    `${DRY_RUN ? "[dry-run] " : ""}Processing ${entries.length} files in ${DIR}`,
  );
  console.log(
    `  MAX_WIDTH=${MAX_WIDTH}px  SIZE_TARGET=${fmtBytes(SIZE_TARGET)}  SKIP_BELOW=${fmtBytes(SKIP_BELOW_BYTES)}\n`,
  );

  let totalIn = 0,
    totalOut = 0;
  let rewritten = 0,
    skippedSmall = 0,
    skippedNoGain = 0,
    failed = 0,
    modeLossless = 0,
    modePalette = 0;

  let i = 0;
  for (const name of entries) {
    const filePath = join(DIR, name);
    try {
      const r = await processOne(filePath);
      totalIn += r.origBytes;
      totalOut += r.newBytes;
      if (r.status === "rewrite" || r.status === "would-rewrite") {
        rewritten++;
        if (r.mode === "lossless") modeLossless++;
        if (r.mode === "palette") modePalette++;
        if (r.origBytes - r.newBytes > 100 * 1024) {
          console.log(
            `  ${r.mode === "palette" ? "pal " : "lossl"} ${name}: ${fmtBytes(r.origBytes)} → ${fmtBytes(r.newBytes)} (-${fmtBytes(r.origBytes - r.newBytes)}, ${r.origWidth}px)`,
          );
        }
      } else if (r.status === "skip-small") skippedSmall++;
      else if (r.status === "skip-no-gain") skippedNoGain++;
    } catch (err) {
      failed++;
      console.error(`  ✗ ${name}: ${err.message}`);
    }
    i++;
    if (i % 100 === 0) console.log(`  …${i}/${entries.length}`);
  }

  console.log(`\nSummary:`);
  console.log(`  Rewritten:            ${rewritten}`);
  console.log(`     lossless:          ${modeLossless}`);
  console.log(`     palette quantized: ${modePalette}`);
  console.log(`  Skipped (small):      ${skippedSmall}`);
  console.log(`  Skipped (no gain):    ${skippedNoGain}`);
  console.log(`  Failed:               ${failed}`);
  console.log(`  Total bytes in:       ${fmtBytes(totalIn)}`);
  console.log(`  Total bytes out:      ${fmtBytes(totalOut)}`);
  if (totalIn > 0) {
    console.log(
      `  Saved:                ${fmtBytes(totalIn - totalOut)} (${((1 - totalOut / totalIn) * 100).toFixed(1)}%)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
