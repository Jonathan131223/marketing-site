#!/usr/bin/env node
/**
 * Generate responsive image variants for srcset.
 * Run: node scripts/generate-srcset.mjs
 */

import sharp from "sharp";
import { mkdirSync, existsSync } from "fs";
import { join, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");

const SIZES = [400, 600, 800]; // widths in px

const IMAGES = [
  // Onboarding pain cards (source: 800x800)
  "onboarding-pain/card-1-left.webp",
  "onboarding-pain/card-2-middle.webp",
  "onboarding-pain/card-3-right.webp",
  // Benefits (source: 900x450)
  "benefits/benefit-1-new.webp",
  "benefits/benefit-2-new.webp",
  "benefits/benefit-3-new.webp",
];

let count = 0;

for (const imgPath of IMAGES) {
  const src = join(PUBLIC, imgPath);
  if (!existsSync(src)) {
    console.warn(`⚠ skipping ${imgPath} (not found)`);
    continue;
  }

  const dir = dirname(src);
  const ext = extname(imgPath);
  const name = basename(imgPath, ext);

  for (const w of SIZES) {
    const outPath = join(dir, `${name}-${w}w${ext}`);
    if (existsSync(outPath)) continue; // skip if already generated
    await sharp(src)
      .resize(w, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);
    count++;
  }
}

console.log(`✓ generate-srcset: created ${count} image variants`);
