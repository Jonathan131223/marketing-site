# OG card generation

17 brand-consistent Open Graph social-share images for digistorms.ai, rendered
deterministically from a manifest. No browser, no API keys, no AI image
generation — pure typography via satori (HTML/JSX → SVG) + sharp (SVG → WebP).

## Why this approach

These are editorial typography cards (cream/white background, Instrument Serif
headline, italic blue emphasis word, sans-serif subline, wordmark). For text-
heavy cards like this, deterministic HTML rendering beats AI generation on
every axis:

- **Perfect text rendering** (no AI hallucination of letter shapes)
- **Exact Instrument Serif font** (AI can only approximate)
- **Exact brand colors** (no AI drift)
- **Free** (no API calls, no quotas)
- **Reproducible** (re-running gives identical output — diffs cleanly)
- **Fast** (17 cards in ~3 seconds)

The original plan used nanobanana-mcp + Gemini; that scaffolding is preserved
in [`manifest.json`](manifest.json) (the `prompt` field is still useful if you
ever want to AI-generate a hero image or photographic asset for a different
use case).

## Files

- `manifest.json` — source of truth: 17 cards × `{ id, output, page_file, headline, italic_emphasis, subline, background, prompt }`. Edit headline/emphasis/subline here to change cards.
- `render.mjs` — satori + sharp renderer. Reads manifest, renders 1200×630 WebP per card to `public/og/<id>.webp`. Also accepts a single card id as CLI arg: `node render.mjs homepage`.
- `wire-og-images.mjs` — patches each Astro page in `card.page_file` to set `ogImage="https://www.digistorms.ai/og/<id>.webp"`. Idempotent. Recognizes `<PageLayout>`, `<BaseLayout>`, `<ComparisonPage>`, `<BestToolsPage>`, and the homepage's `DEFAULT_OG_IMAGE` constant.
- `_inbox/` — legacy folder for nanobanana PNG drops; left in place + `.gitignore`d in case you ever want to mix AI-generated cards alongside the rendered ones.

## Workflow

```bash
# Edit a headline, color, or whatever in manifest.json, then:
npm run og:render   # rebuild all 17 WebPs in public/og/
npm run og:wire     # patch every page's ogImage prop
# Or both at once:
npm run og:all
```

To re-render just one card while iterating:

```bash
node scripts/og-images/render.mjs pricing
```

## Layouts

Two templates in `render.mjs`:

- **Editorial** — single big headline, italic blue emphasis word, optional subline below, wordmark lower-left. Used for everything except the head-to-head compare pages. Headline font size auto-scales (96 / 84 / 72 / 64 px) based on length.
- **Compare split** — two columns "DigiStorms" | "<competitor>" with a subtle vertical rule and italic blue "vs" centered on the rule. Subline near the bottom. Used for `compare-customer-io`, `compare-encharge`, `compare-loops`, `compare-resend`.

The aggregator pages (`compare-best-tools`, `compare-customer-io-alternatives`)
use the editorial template since there's no single competitor to feature.

## Brand tokens (in `render.mjs`)

| Token | Value | Use |
|-------|-------|-----|
| `cream` | `#F8F6F2` | Default background (warm sections in DESIGN.md) |
| `white` | `#FFFFFF` | Library + about background (white sections) |
| `navy` | `#0F172A` | Headline + wordmark color |
| `blue` | `#2563EB` | Italic emphasis word |
| `body` | `#475569` | Subline |
| `rule` | `#CBD5E1` | Compare-split vertical divider |

Mirrors [DESIGN.md](../../DESIGN.md). If brand colors change, edit the `BRAND`
const at the top of `render.mjs` and re-run `npm run og:all`.

## Fonts

Loaded from `node_modules/@fontsource/{instrument-serif,instrument-sans}/files/*.woff`.
Both packages are pinned as devDependencies. Satori accepts WOFF (not WOFF2)
which is why we read the `.woff` extension specifically.

## Verifying

After `npm run og:all`, rebuild and spot-check:

```bash
npm run build
grep -l 'og/homepage.webp' dist/index.html
grep -l 'og/pricing.webp'  dist/pricing/index.html
```

Once deployed, validate OG cards render correctly on the major platforms via
[opengraph.xyz](https://www.opengraph.xyz/) (paste a digistorms.ai URL — it
shows previews for Facebook, LinkedIn, Twitter, Slack, Discord).
