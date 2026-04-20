#!/usr/bin/env node
/*
 * Wire generated OG images into Astro pages.
 *
 * Workflow:
 *   1. Generate cards via nanobanana (see README.md in this folder).
 *   2. Drop the PNGs into scripts/og-images/_inbox/ named <id>.png
 *      (matching the manifest.json `id` field).
 *   3. Run: npm run og:wire
 *
 * What this script does:
 *   - Reads scripts/og-images/manifest.json.
 *   - For each card with a matching _inbox/<id>.png, converts to WebP
 *     (1200x630, q=85) and writes to public/og/<id>.webp.
 *   - For each card whose target WebP exists, edits the page file to
 *     pass ogImage="/og/<id>.webp" to PageLayout / BaseLayout.
 *   - Skips (with warning) any card whose image is missing.
 *   - Idempotent — safe to re-run.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const MANIFEST = JSON.parse(readFileSync(join(__dirname, 'manifest.json'), 'utf8'));
const INBOX = join(__dirname, '_inbox');
const OUT = join(ROOT, 'public', 'og');
const SITE_URL = 'https://www.digistorms.ai';

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
if (!existsSync(INBOX)) mkdirSync(INBOX, { recursive: true });

const results = { converted: [], wired: [], skipped: [], errors: [] };

for (const card of MANIFEST.cards) {
  const id = card.id;
  const pageFile = join(ROOT, card.page_file);
  const webpOut = join(OUT, `${id}.webp`);
  const webpUrl = `${SITE_URL}/og/${id}.webp`;

  // 1) Convert from inbox PNG (if present and newer than existing WebP)
  const inboxCandidates = ['png', 'jpg', 'jpeg', 'webp']
    .map((ext) => join(INBOX, `${id}.${ext}`))
    .filter(existsSync);

  if (inboxCandidates.length > 0) {
    const src = inboxCandidates[0];
    const srcMtime = statSync(src).mtimeMs;
    const dstMtime = existsSync(webpOut) ? statSync(webpOut).mtimeMs : 0;
    if (srcMtime > dstMtime) {
      try {
        await sharp(src)
          .resize(1200, 630, { fit: 'cover', position: 'center' })
          .webp({ quality: 85 })
          .toFile(webpOut);
        results.converted.push(`${id}: ${src} -> public/og/${id}.webp`);
      } catch (e) {
        results.errors.push(`${id}: convert failed - ${e.message}`);
        continue;
      }
    }
  }

  // 2) Skip wiring if the WebP doesn't exist yet
  if (!existsSync(webpOut)) {
    results.skipped.push(`${id}: no image at public/og/${id}.webp (drop ${id}.png in _inbox/ and re-run)`);
    continue;
  }

  // 3) Wire ogImage into the page file
  if (!existsSync(pageFile)) {
    results.errors.push(`${id}: page file missing - ${card.page_file}`);
    continue;
  }

  const original = readFileSync(pageFile, 'utf8');
  const { source: wired, action } = wireOgImage(original, webpUrl, id);
  if (action === 'no-match') {
    results.errors.push(`${id}: no PageLayout/BaseLayout/ComparisonPage/DEFAULT_OG_IMAGE found in ${card.page_file} — manual wiring needed`);
  } else if (action === 'no-op') {
    results.wired.push(`${id}: already wired (no-op)`);
  } else {
    writeFileSync(pageFile, wired);
    results.wired.push(`${id}: wired into ${card.page_file} (${action})`);
  }
}

// ── Reporting ────────────────────────────────────────────────────────────────
console.log('\n=== OG image wiring report ===\n');
if (results.converted.length) {
  console.log(`✓ Converted (${results.converted.length}):`);
  results.converted.forEach((m) => console.log(`  ${m}`));
}
if (results.wired.length) {
  console.log(`\n✓ Wired (${results.wired.length}):`);
  results.wired.forEach((m) => console.log(`  ${m}`));
}
if (results.skipped.length) {
  console.log(`\n⚠ Skipped (${results.skipped.length}):`);
  results.skipped.forEach((m) => console.log(`  ${m}`));
}
if (results.errors.length) {
  console.log(`\n✗ Errors (${results.errors.length}):`);
  results.errors.forEach((m) => console.log(`  ${m}`));
  process.exit(1);
}

// ── Wiring logic ─────────────────────────────────────────────────────────────
/**
 * Inject or replace the ogImage prop in a layout invocation.
 *
 * Returns { source, action } where action is one of:
 *   - "constant"  — replaced DEFAULT_OG_IMAGE constant value
 *   - "replaced"  — replaced existing ogImage prop value
 *   - "inserted"  — inserted ogImage after layout opening tag
 *   - "no-op"     — already wired with the exact same URL
 *   - "no-match"  — no layout tag or constant found; manual wiring needed
 *
 * Recognized layouts: PageLayout, BaseLayout, ComparisonPage (compare/* pages
 * use a wrapper component that passes ogImage through to PageLayout).
 */
function wireOgImage(source, url, _id) {
  // Case A: DEFAULT_OG_IMAGE constant. Replace its value.
  const constantPattern = /const\s+DEFAULT_OG_IMAGE\s*=\s*[`'"][^`'"\n]*[`'"]\s*;?/;
  if (constantPattern.test(source)) {
    const next = source.replace(constantPattern, `const DEFAULT_OG_IMAGE = \`${url}\`;`);
    return { source: next, action: next === source ? 'no-op' : 'constant' };
  }

  // Case B: ogImage prop already present. Replace its value (handles "..." | '...' | {...}).
  const propPattern = /\bogImage\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]+\})/;
  if (propPattern.test(source)) {
    const next = source.replace(propPattern, `ogImage="${url}"`);
    return { source: next, action: next === source ? 'no-op' : 'replaced' };
  }

  // Case C: insert ogImage right after a layout opening tag.
  const tagPattern = /(<(?:PageLayout|BaseLayout|ComparisonPage|BestToolsPage)\b)/;
  const match = source.match(tagPattern);
  if (match) {
    const insertAt = match.index + match[1].length;
    const next = source.slice(0, insertAt) + `\n  ogImage="${url}"` + source.slice(insertAt);
    return { source: next, action: 'inserted' };
  }

  return { source, action: 'no-match' };
}
