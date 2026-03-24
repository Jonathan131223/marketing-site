/**
 * Converts all PNG files under public/blog/ to WebP (quality 85).
 * Original PNG files are kept as fallbacks.
 * Run with: node scripts/convert-to-webp.mjs
 */

import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_PUBLIC_DIR = path.join(__dirname, "..", "public", "blog");

async function findPngs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const pngs = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pngs.push(...(await findPngs(full)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      pngs.push(full);
    }
  }
  return pngs;
}

async function main() {
  const pngs = await findPngs(BLOG_PUBLIC_DIR);
  console.log(`Found ${pngs.length} PNG files. Converting...`);

  let converted = 0;
  let skipped = 0;

  for (const pngPath of pngs) {
    const webpPath = pngPath.replace(/\.png$/i, ".webp");
    try {
      const webpStat = await stat(webpPath).catch(() => null);
      if (webpStat) {
        skipped++;
        continue;
      }
      await sharp(pngPath).webp({ quality: 85 }).toFile(webpPath);
      converted++;
      console.log(`  ✓ ${path.relative(BLOG_PUBLIC_DIR, webpPath)}`);
    } catch (err) {
      console.error(`  ✗ ${pngPath}: ${err.message}`);
    }
  }

  console.log(`\nDone. Converted: ${converted}, Skipped (already exist): ${skipped}`);
}

main().catch(console.error);
