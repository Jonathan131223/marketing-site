#!/usr/bin/env node
/*
 * Render every card in manifest.json as a 1200x630 WebP using satori (HTML/JSX
 * → SVG) + sharp (SVG → WebP).
 *
 * No browser, no API key. Perfect text rendering. Reproducible.
 *
 * Usage:
 *   node scripts/og-images/render.mjs            # render all cards
 *   node scripts/og-images/render.mjs homepage   # render one card by id
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const MANIFEST = JSON.parse(readFileSync(join(__dirname, 'manifest.json'), 'utf8'));
const OUT = join(ROOT, 'public', 'og');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 630;

// ── Fonts (satori accepts TTF/OTF/WOFF — not WOFF2) ──────────────────────────
const FONT_BASE = join(ROOT, 'node_modules', '@fontsource');
const fonts = [
  {
    name: 'Instrument Serif',
    data: readFileSync(`${FONT_BASE}/instrument-serif/files/instrument-serif-latin-400-normal.woff`),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Instrument Serif',
    data: readFileSync(`${FONT_BASE}/instrument-serif/files/instrument-serif-latin-400-italic.woff`),
    weight: 400,
    style: 'italic',
  },
  {
    name: 'Instrument Sans',
    data: readFileSync(`${FONT_BASE}/instrument-sans/files/instrument-sans-latin-400-normal.woff`),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Instrument Sans',
    data: readFileSync(`${FONT_BASE}/instrument-sans/files/instrument-sans-latin-600-normal.woff`),
    weight: 600,
    style: 'normal',
  },
];

// ── Brand tokens (mirrors DESIGN.md) ─────────────────────────────────────────
const BRAND = {
  cream: '#F8F6F2',
  white: '#FFFFFF',
  navy: '#0F172A',
  blue: '#2563EB',
  body: '#475569',
  rule: '#CBD5E1',
};

/**
 * Build a satori element tree for a card.
 *
 * Two layouts:
 *   - "compare": split DigiStorms | vs | <competitor>
 *   - "editorial" (default): centered headline with italic emphasis word
 *
 * Returns a plain object tree that satori consumes (no JSX/React needed).
 */
function buildElement(card) {
  if (card.id.startsWith('compare-') && /^DigiStorms vs /.test(card.headline)) {
    return compareLayout(card);
  }
  return editorialLayout(card);
}

function bgColor(card) {
  return card.background.includes('#F8F6F2') ? BRAND.cream : BRAND.white;
}

/**
 * Editorial layout — single big headline, italic emphasis word in primary blue,
 * muted subline below, wordmark lower-left.
 */
function editorialLayout(card) {
  const headline = card.headline;
  const emphasis = card.italic_emphasis || '';
  // Split headline into [before, emphasis, after] — first match only, case-sensitive.
  const idx = emphasis ? headline.indexOf(emphasis) : -1;
  const parts =
    idx === -1
      ? [{ text: headline, italic: false }]
      : [
          { text: headline.slice(0, idx), italic: false },
          { text: emphasis, italic: true },
          { text: headline.slice(idx + emphasis.length), italic: false },
        ];

  // Headline font size scales with length to keep within 2 lines comfortably.
  const len = headline.length;
  const headlineSize = len < 30 ? 96 : len < 40 ? 84 : len < 50 ? 72 : 64;

  return {
    type: 'div',
    props: {
      style: {
        width: W,
        height: H,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: bgColor(card),
        padding: '64px 96px',
        position: 'relative',
        fontFamily: '"Instrument Sans"',
      },
      children: [
        // Headline
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: '"Instrument Serif"',
              fontSize: headlineSize,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: BRAND.navy,
              textAlign: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: 1000,
            },
            children: parts.map((p) => ({
              type: 'span',
              props: {
                style: {
                  fontStyle: p.italic ? 'italic' : 'normal',
                  color: p.italic ? BRAND.blue : BRAND.navy,
                  // satori needs a single space between adjacent spans; bake
                  // the space into the text rather than relying on CSS gap.
                  whiteSpace: 'pre',
                },
                children: p.text,
              },
            })),
          },
        },
        // Subline
        card.subline && {
          type: 'div',
          props: {
            style: {
              marginTop: 32,
              fontSize: 22,
              color: BRAND.body,
              fontFamily: '"Instrument Sans"',
              fontWeight: 400,
              maxWidth: 900,
              textAlign: 'center',
            },
            children: card.subline,
          },
        },
        // Wordmark (lower-left, absolute)
        wordmark(),
      ].filter(Boolean),
    },
  };
}

/**
 * Compare layout — left half "DigiStorms", right half "<competitor>", with
 * a small italic blue "vs" sitting on the dividing rule.
 */
function compareLayout(card) {
  // Headline format: "DigiStorms vs Competitor"
  const m = card.headline.match(/^DigiStorms vs (.+)$/);
  const competitor = m ? m[1] : 'Tool';

  return {
    type: 'div',
    props: {
      style: {
        width: W,
        height: H,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bgColor(card),
        position: 'relative',
        fontFamily: '"Instrument Sans"',
      },
      children: [
        // Two-column split
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            },
            children: [
              // Left half
              {
                type: 'div',
                props: {
                  style: {
                    width: W / 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Instrument Serif"',
                    fontSize: 80,
                    color: BRAND.navy,
                    letterSpacing: '-0.02em',
                  },
                  children: 'DigiStorms',
                },
              },
              // Right half
              {
                type: 'div',
                props: {
                  style: {
                    width: W / 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Instrument Serif"',
                    fontSize: 80,
                    color: BRAND.navy,
                    letterSpacing: '-0.02em',
                  },
                  children: competitor,
                },
              },
              // Vertical rule
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    top: 80,
                    bottom: 120,
                    left: W / 2 - 0.5,
                    width: 1,
                    backgroundColor: BRAND.rule,
                  },
                },
              },
              // "vs" badge centered on the rule
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    top: H / 2 - 40,
                    left: W / 2 - 40,
                    width: 80,
                    height: 80,
                    backgroundColor: bgColor(card),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Instrument Serif"',
                    fontStyle: 'italic',
                    fontSize: 40,
                    color: BRAND.blue,
                  },
                  children: 'vs',
                },
              },
            ],
          },
        },
        // Subline (centered, near bottom)
        card.subline && {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: 56,
              fontSize: 22,
              color: BRAND.body,
              fontFamily: '"Instrument Sans"',
            },
            children: card.subline,
          },
        },
        wordmark(),
      ].filter(Boolean),
    },
  };
}

/**
 * Bottom-left wordmark — small "DigiStorms" in slate-900 sans-serif.
 */
function wordmark() {
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        bottom: 36,
        left: 56,
        fontFamily: '"Instrument Sans"',
        fontWeight: 600,
        fontSize: 20,
        color: BRAND.navy,
        letterSpacing: '-0.01em',
      },
      children: 'DigiStorms',
    },
  };
}

// ── Render loop ──────────────────────────────────────────────────────────────
const filterId = process.argv[2];
const cards = filterId ? MANIFEST.cards.filter((c) => c.id === filterId) : MANIFEST.cards;
if (cards.length === 0) {
  console.error(`No cards match id="${filterId}"`);
  process.exit(1);
}

console.log(`Rendering ${cards.length} card(s)...\n`);
let ok = 0;
let fail = 0;
for (const card of cards) {
  try {
    const el = buildElement(card);
    const svg = await satori(el, { width: W, height: H, fonts });
    const out = join(OUT, `${card.id}.webp`);
    await sharp(Buffer.from(svg))
      .resize(W, H)
      .webp({ quality: 90 })
      .toFile(out);
    console.log(`  ✓ ${card.id} → public/og/${card.id}.webp`);
    ok++;
  } catch (e) {
    console.error(`  ✗ ${card.id}: ${e.message}`);
    fail++;
  }
}

console.log(`\nDone. ${ok} succeeded, ${fail} failed.`);
process.exit(fail > 0 ? 1 : 0);
