#!/usr/bin/env node
/*
 * Local site audit — reproduces the Ahrefs Site Audit issue list WITHOUT Ahrefs.
 *
 * Crawls the built static site in dist/ (run `npm run build` first) and reports
 * SEO/technical issues grouped by severity — the same categories the old Ahrefs
 * biweekly tech-health audit pulled via site-audit-issues. The Ahrefs plan was
 * cancelled 2026-06-16; there is no MCP. Uses lightweight string parsing (no
 * jsdom) so it stays fast and low-memory across ~1,200+ pages.
 *
 * Usage:
 *   node scripts/site-audit/crawl.mjs                  # audit dist/, print report + write last-audit.json
 *   node scripts/site-audit/crawl.mjs --json           # machine JSON to stdout only
 *   node scripts/site-audit/crawl.mjs --dist <dir>     # custom build dir (default: dist)
 *   node scripts/site-audit/crawl.mjs --out <path>     # results JSON (default: scripts/site-audit/last-audit.json)
 *
 * Exit code: 0 always (report-only). The JSON `errors` count is the gate signal.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../../', import.meta.url))); // digi-marketing/
const SITE_HOST = 'www.digistorms.ai';

// ── flags ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const JSON_ONLY = argv.includes('--json');
const DIST = resolve(ROOT, flag('dist', 'dist'));
const OUT = resolve(ROOT, flag('out', 'scripts/site-audit/last-audit.json'));

// thresholds — tuned to Ahrefs' effective behaviour so the report stays actionable.
// The rendered <title> carries a "| DigiStorms" brand suffix, so 70 (not the 60-char
// frontmatter target the autopilot enforces) is the right "too long" line for the
// rendered tag. Length checks only fire on indexable pages.
const TITLE_MAX = 70, TITLE_MIN = 15;
const META_MAX = 200, META_MIN = 50;
const PAGE_MAX_BYTES = 2 * 1024 * 1024; // Googlebot 2 MB crawl limit

if (!existsSync(DIST)) {
  console.error(`✗ Build dir not found: ${DIST}\n  Run \`npm run build\` first.`);
  process.exit(2);
}

// ── tiny HTML helpers (no DOM) ───────────────────────────────────────────────
const decode = (s) => (s || '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#x27;/gi, "'").replace(/&nbsp;/g, ' ');
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[2] ?? m[3] ?? '') : null;
};
const stripTags = (s) => decode(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
const matchAll = (str, re) => [...str.matchAll(re)];

// ── walk dist for html + collect every emitted file path ─────────────────────
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const fileRoutes = new Set(allFiles.map((f) => '/' + f.slice(DIST.length + 1).split('\\').join('/')));

function routeForFile(file) {
  let r = '/' + file.slice(DIST.length + 1).split('\\').join('/');
  r = r.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return r === '' ? '/' : r;
}
const pageRoutes = new Map();
for (const f of htmlFiles) pageRoutes.set(routeForFile(f), f);

function normalizeHref(href) {
  if (!href) return null;
  href = decode(href.trim());
  if (/^(mailto:|tel:|javascript:|#|data:)/i.test(href)) return null;
  let url;
  try { url = new URL(href, `https://${SITE_HOST}/`); } catch { return null; }
  if (url.hostname !== SITE_HOST) return { external: true, protocol: url.protocol };
  let path = decodeURIComponent(url.pathname);
  const hadTrailingSlash = path.length > 1 && path.endsWith('/');
  if (path.length > 1) path = path.replace(/\/$/, '');
  return { external: false, path, hadTrailingSlash };
}

// ── issue accumulator ────────────────────────────────────────────────────────
const issues = {};
function add(name, severity, route) {
  if (!issues[name]) issues[name] = { severity, urls: new Set() };
  issues[name].urls.add(route);
}
const inbound = new Map();
const noindexRoutes = new Set();
let totalPages = 0;

// ── pass 1: parse every page ─────────────────────────────────────────────────
for (const file of htmlFiles) {
  const route = routeForFile(file);
  totalPages++;
  const bytes = statSync(file).size;
  const html = readFileSync(file, 'utf8');

  // robots / indexability
  let indexable = true;
  for (const m of matchAll(html, /<meta\b[^>]*>/gi)) {
    if ((attr(m[0], 'name') || '').toLowerCase() === 'robots') {
      if ((attr(m[0], 'content') || '').toLowerCase().includes('noindex')) indexable = false;
    }
  }
  if (!indexable) noindexRoutes.add(route);

  if (bytes > PAGE_MAX_BYTES) add('Page size exceeds 2 MB crawl limit', 'Error', route);

  // title
  const titles = matchAll(html, /<title[^>]*>([\s\S]*?)<\/title>/gi);
  const title = titles.length ? stripTags(titles[0][1]) : '';
  if (!title) add('Title tag missing or empty', indexable ? 'Error' : 'Notice', route);
  else if (indexable && title.length > TITLE_MAX) add('Title too long', 'Warning', route);
  else if (indexable && title.length < TITLE_MIN) add('Title too short', 'Warning', route);
  if (titles.length > 1) add('Multiple title tags', 'Warning', route);

  // meta description
  const descs = [];
  for (const m of matchAll(html, /<meta\b[^>]*>/gi)) {
    if ((attr(m[0], 'name') || '').toLowerCase() === 'description') descs.push((attr(m[0], 'content') || '').trim());
  }
  if (!descs.length || !descs[0]) { if (indexable) add('Meta description missing or empty', 'Warning', route); }
  else if (indexable && descs[0].length > META_MAX) add('Meta description too long', 'Notice', route);
  else if (indexable && descs[0].length < META_MIN) add('Meta description too short', 'Notice', route);
  if (descs.length > 1) add('Multiple meta description tags', 'Warning', route);

  // H1
  const h1s = matchAll(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map((m) => stripTags(m[1])).filter(Boolean);
  if (h1s.length === 0) add('H1 tag missing or empty', indexable ? 'Warning' : 'Notice', route);
  else if (h1s.length > 1) add('Multiple H1 tags', 'Notice', route);

  // canonical
  let canonical = null;
  for (const m of matchAll(html, /<link\b[^>]*>/gi)) {
    if ((attr(m[0], 'rel') || '').toLowerCase() === 'canonical') canonical = attr(m[0], 'href');
  }
  if (!canonical) { if (indexable) add('Canonical missing', 'Warning', route); }
  else {
    const c = normalizeHref(canonical);
    if (c && !c.external) {
      if (c.hadTrailingSlash && c.path !== '/') add('Canonical points to redirect (trailing slash)', 'Error', route);
      else if (!pageRoutes.has(c.path) && !fileRoutes.has(c.path)) add('Canonical points to missing page', 'Error', route);
    } else if (c && c.external && c.protocol === 'http:') {
      add('Canonical uses http (not https)', 'Warning', route);
    }
  }

  // links — broken internal + mixed content + inbound graph
  for (const m of matchAll(html, /<a\b[^>]*\shref\s*=\s*("[^"]*"|'[^']*')[^>]*>/gi)) {
    const t = normalizeHref(attr(m[0], 'href'));
    if (!t) continue;
    if (t.external) { if (t.protocol === 'http:') add('Internal page links to http resource (mixed content)', 'Warning', route); continue; }
    if (pageRoutes.has(t.path)) inbound.set(t.path, (inbound.get(t.path) || 0) + 1);
    else if (fileRoutes.has(t.path) || fileRoutes.has(t.path + '/index.html')) { /* asset ok */ }
    else add('Broken internal link (target not found)', 'Error', route);
  }

  // images — missing alt + broken internal src + mixed content
  for (const m of matchAll(html, /<img\b[^>]*>/gi)) {
    const altVal = attr(m[0], 'alt');
    const role = attr(m[0], 'role');
    if ((altVal === null || altVal.trim() === '') && role !== 'presentation') add('Image missing alt text', 'Warning', route);
    const s = normalizeHref(attr(m[0], 'src'));
    if (!s) continue;
    if (s.external) { if (s.protocol === 'http:') add('Image loaded over http (mixed content)', 'Warning', route); continue; }
    if (extname(s.path) && !fileRoutes.has(s.path)) add('Broken image (file not found)', 'Error', route);
  }

  // JSON-LD structured-data validity
  for (const m of matchAll(html, /<script\b[^>]*type\s*=\s*("application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[2]);
      const node = Array.isArray(data) ? data[0] : data;
      if (node && typeof node === 'object' && !node['@context'] && !node['@graph']) add('Structured data missing @context', 'Notice', route);
    } catch { add('Structured data JSON parse error', 'Notice', route); }
  }
}

// ── pass 2: orphan pages ──────────────────────────────────────────────────────
for (const [route] of pageRoutes) {
  if (route === '/' || noindexRoutes.has(route)) continue;
  if (!(inbound.get(route) > 0)) add('Orphan page (no incoming internal links)', 'Warning', route);
}

// ── robots.txt + sitemap sanity ──────────────────────────────────────────────
if (!existsSync(join(DIST, 'robots.txt'))) add('robots.txt missing', 'Warning', '/robots.txt');
if (!['sitemap.xml', 'sitemap-static.xml', 'sitemap-index.xml'].some((s) => existsSync(join(DIST, s)))) {
  add('Sitemap missing', 'Warning', '/sitemap.xml');
}

// ── tally ────────────────────────────────────────────────────────────────────
const bySeverity = { Error: 0, Warning: 0, Notice: 0 };
const urlsWithError = new Set();
const list = Object.entries(issues)
  .map(([name, { severity, urls }]) => {
    bySeverity[severity] += urls.size;
    if (severity === 'Error') for (const u of urls) urlsWithError.add(u);
    return { name, severity, count: urls.size, examples: [...urls].slice(0, 8) };
  })
  .sort((a, b) => ({ Error: 0, Warning: 1, Notice: 2 }[a.severity] - { Error: 0, Warning: 1, Notice: 2 }[b.severity]) || b.count - a.count);

const healthScore = totalPages ? Math.round(100 * (1 - urlsWithError.size / totalPages)) : 100;
const result = { ranAt: new Date().toISOString(), dist: DIST, totalPages, healthScore, urlsWithErrors: urlsWithError.size, counts: bySeverity, issues: list };
writeFileSync(OUT, JSON.stringify(result, null, 2));

if (JSON_ONLY) { process.stdout.write(JSON.stringify(result, null, 2) + '\n'); process.exit(0); }

const ICON = { Error: '🔴', Warning: '🟡', Notice: '🔵' };
console.log(`\n=== DigiStorms local site audit — ${result.ranAt.slice(0, 10)} ===`);
console.log(`dist: ${DIST}`);
console.log(`Pages crawled: ${totalPages}`);
console.log(`Health score: ${healthScore}/100  (URLs with errors: ${urlsWithError.size})`);
console.log(`Errors: ${bySeverity.Error}  Warnings: ${bySeverity.Warning}  Notices: ${bySeverity.Notice}\n`);
if (!list.length) console.log('✓ No issues found.');
else for (const it of list) {
  console.log(`${ICON[it.severity]} [${it.severity}] ${it.name} — ${it.count} URL(s)`);
  for (const u of it.examples) console.log(`      ${u}`);
  if (it.count > it.examples.length) console.log(`      … +${it.count - it.examples.length} more`);
}
console.log(`\nResults written to ${OUT}`);
process.exit(0);
