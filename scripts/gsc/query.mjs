#!/usr/bin/env node
/*
 * Google Search Console query tool — direct API, no MCP/Ahrefs.
 *
 * First run:
 *   node scripts/gsc/query.mjs summary
 *   → prints a URL; open it, approve, paste the code back on stdin
 *   → token is cached at ~/.gsc-token.json for all future runs
 *
 * Later runs (no prompts):
 *   node scripts/gsc/query.mjs summary       [days=90] [site=sc-domain:digistorms.ai]
 *   node scripts/gsc/query.mjs keywords      [days=90] [limit=100]
 *   node scripts/gsc/query.mjs pages         [days=90] [limit=50]
 *   node scripts/gsc/query.mjs ctr-position  [days=90]
 *   node scripts/gsc/query.mjs device        [days=90]
 *   node scripts/gsc/query.mjs country       [days=90]
 *   node scripts/gsc/query.mjs history       [days=90] [group=week|day]
 *   node scripts/gsc/query.mjs striking      [days=90]   # pos 4-20, sorted by impressions
 *   node scripts/gsc/query.mjs sites                     # list verified GSC properties
 *
 * Env vars (optional):
 *   GSC_CLIENT_SECRET  path to the downloaded OAuth client secret JSON
 *                      (default: ~/.gsc-client-secret.json)
 *   GSC_TOKEN          path to cache the refresh token
 *                      (default: ~/.gsc-token.json)
 *   GSC_SITE           default site URL (e.g., sc-domain:digistorms.ai
 *                      or https://www.digistorms.ai/). Domain-property
 *                      form is strongly recommended.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { exec } from 'node:child_process';
import { google } from 'googleapis';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const CLIENT_SECRET_PATH = process.env.GSC_CLIENT_SECRET || join(homedir(), '.gsc-client-secret.json');
const TOKEN_PATH         = process.env.GSC_TOKEN         || join(homedir(), '.gsc-token.json');
const DEFAULT_SITE       = process.env.GSC_SITE          || 'sc-domain:digistorms.ai';

// ── CLI parsing ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const cmd = argv[0];
const flags = Object.fromEntries(
  argv.slice(1).filter((a) => a.includes('=')).map((a) => a.split('=', 2)),
);
const days  = parseInt(flags.days  || '90', 10);
const limit = parseInt(flags.limit || '100', 10);
const group = flags.group || 'week';
const site  = flags.site  || DEFAULT_SITE;

if (!cmd || cmd === '--help' || cmd === '-h') {
  printHelp(); process.exit(0);
}

// ── Auth ─────────────────────────────────────────────────────────────────────
async function getAuthedClient() {
  if (!existsSync(CLIENT_SECRET_PATH)) {
    console.error(`\n✗ Client secret not found at ${CLIENT_SECRET_PATH}\n`);
    console.error('Set it up once (takes ~2 minutes):');
    console.error('  1. Open https://console.cloud.google.com/apis/credentials');
    console.error('  2. Create OAuth 2.0 Client ID → Application type: Desktop app');
    console.error('  3. Download the JSON and save it to ~/.gsc-client-secret.json');
    console.error('  4. Enable the Search Console API in the same project:');
    console.error('     https://console.cloud.google.com/apis/library/searchconsole.googleapis.com');
    console.error('  5. Re-run this command.\n');
    process.exit(2);
  }

  const secret = JSON.parse(readFileSync(CLIENT_SECRET_PATH, 'utf8'));
  const installed = secret.installed || secret.web;
  if (!installed) {
    console.error(`✗ Unrecognized client_secret shape at ${CLIENT_SECRET_PATH}. Expected .installed or .web property.`);
    process.exit(2);
  }
  const { client_id, client_secret } = installed;

  // If a cached token exists, use it straight away.
  if (existsSync(TOKEN_PATH)) {
    const oauth2 = new google.auth.OAuth2(client_id, client_secret);
    oauth2.setCredentials(JSON.parse(readFileSync(TOKEN_PATH, 'utf8')));
    return oauth2;
  }

  // First-time consent: spin up a loopback listener, open the browser, capture
  // the ?code= from the redirect, exchange for a token, cache it.
  return await loopbackConsent(client_id, client_secret);
}

function loopbackConsent(client_id, client_secret) {
  return new Promise((resolve, reject) => {
    // Start on an ephemeral port, derive redirectUri, then register handler.
    const server = createServer();

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const redirectUri = `http://localhost:${port}`;
      const client = new google.auth.OAuth2(client_id, client_secret, redirectUri);
      const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [SCOPE],
      });

      server.on('request', async (req, res) => {
        try {
          const url = new URL(req.url, redirectUri);
          const code = url.searchParams.get('code');
          const err  = url.searchParams.get('error');
          if (err) {
            res.writeHead(400, { 'content-type': 'text/html' });
            res.end(`<h1>OAuth error: ${err}</h1>`);
            server.close();
            return reject(new Error(`OAuth: ${err}`));
          }
          if (!code) { res.writeHead(404); res.end(); return; }

          res.writeHead(200, { 'content-type': 'text/html' });
          res.end(`<!doctype html><meta charset="utf-8"><title>GSC authorized</title>
<style>body{font:16px -apple-system,system-ui,sans-serif;max-width:520px;margin:10vh auto;padding:2rem;color:#0F172A}h1{font-family:Georgia,serif;font-size:28px}p{color:#475569;line-height:1.6}</style>
<h1>✓ DigiStorms GSC authorized</h1>
<p>You can close this tab — the terminal has the token now.</p>`);
          server.close();

          const { tokens } = await client.getToken(code);
          client.setCredentials(tokens);
          writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), { mode: 0o600 });
          console.error(`\n✓ Token cached at ${TOKEN_PATH}\n`);
          resolve(client);
        } catch (e) { reject(e); }
      });

      console.error('\n👉 A browser tab will open to authorize GSC access.');
      console.error("   If it doesn't, open this URL manually:\n");
      console.error('   ' + authUrl + '\n');
      console.error(`   (Waiting for approval on ${redirectUri} …)\n`);

      const opener = process.platform === 'darwin' ? 'open'
                   : process.platform === 'win32'  ? 'start ""'
                   :                                 'xdg-open';
      exec(`${opener} "${authUrl}"`, () => {});

      setTimeout(() => {
        if (server.listening) {
          server.close();
          reject(new Error('OAuth flow timed out after 5 minutes — re-run the command.'));
        }
      }, 300_000);
    });
  });
}

// ── Date helpers ─────────────────────────────────────────────────────────────
function dateRange(nDays) {
  const end = new Date();
  end.setDate(end.getDate() - 2); // GSC has ~2-day lag
  const start = new Date(end);
  start.setDate(start.getDate() - nDays + 1);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

// ── Commands ─────────────────────────────────────────────────────────────────
async function listSites(sc) {
  const { data } = await sc.sites.list();
  return data.siteEntry || [];
}

async function query(sc, opts) {
  const { startDate, endDate } = dateRange(opts.days || days);
  const body = {
    startDate, endDate,
    dimensions: opts.dimensions || [],
    rowLimit: opts.rowLimit || 1000,
    ...(opts.dimensionFilterGroups ? { dimensionFilterGroups: opts.dimensionFilterGroups } : {}),
    ...(opts.searchType ? { searchType: opts.searchType } : {}),
  };
  const { data } = await sc.searchanalytics.query({ siteUrl: site, requestBody: body });
  return data.rows || [];
}

function pct(x) { return (x * 100).toFixed(2) + '%'; }
function fmtPos(p) { return p === undefined ? '-' : p.toFixed(1); }

async function main() {
  const auth = await getAuthedClient();
  const sc = google.searchconsole({ version: 'v1', auth });

  if (cmd === 'sites') {
    const sites = await listSites(sc);
    console.log('\n=== Verified Search Console properties ===\n');
    sites.forEach((s) => console.log(`  ${s.permissionLevel.padEnd(20)}  ${s.siteUrl}`));
    return;
  }

  const { startDate, endDate } = dateRange(days);
  console.log(`\n=== GSC ${cmd} | ${site} | ${startDate} → ${endDate} ===\n`);

  if (cmd === 'summary') {
    const rows = await query(sc, { dimensions: [], rowLimit: 1 });
    if (!rows.length) { console.log('  (no data)'); return; }
    const r = rows[0];
    console.log(`  Clicks       ${r.clicks}`);
    console.log(`  Impressions  ${r.impressions}`);
    console.log(`  CTR          ${pct(r.ctr)}`);
    console.log(`  Avg position ${fmtPos(r.position)}`);
  }

  else if (cmd === 'keywords') {
    const rows = await query(sc, { dimensions: ['query'], rowLimit: limit });
    console.log(`  ${'QUERY'.padEnd(50)} ${'CLK'.padStart(5)} ${'IMP'.padStart(7)} ${'CTR'.padStart(7)} ${'POS'.padStart(5)}`);
    rows.forEach((r) => console.log(
      `  ${(r.keys[0] || '').slice(0, 50).padEnd(50)} ${String(r.clicks).padStart(5)} ${String(r.impressions).padStart(7)} ${pct(r.ctr).padStart(7)} ${fmtPos(r.position).padStart(5)}`
    ));
  }

  else if (cmd === 'pages') {
    const rows = await query(sc, { dimensions: ['page'], rowLimit: limit });
    console.log(`  ${'PAGE'.padEnd(70)} ${'CLK'.padStart(5)} ${'IMP'.padStart(7)} ${'CTR'.padStart(7)} ${'POS'.padStart(5)}`);
    rows.forEach((r) => console.log(
      `  ${(r.keys[0] || '').replace(/^https?:\/\/[^/]+/, '').slice(0, 70).padEnd(70)} ${String(r.clicks).padStart(5)} ${String(r.impressions).padStart(7)} ${pct(r.ctr).padStart(7)} ${fmtPos(r.position).padStart(5)}`
    ));
  }

  else if (cmd === 'striking') {
    // Keywords at position 4-20 with meaningful impressions — the "close-but-not-top" set.
    // These are the highest-leverage click-through wins.
    const rows = await query(sc, { dimensions: ['query'], rowLimit: 500 });
    const hits = rows
      .filter((r) => r.position >= 4 && r.position <= 20 && r.impressions >= 30)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 50);
    console.log(`  Striking-distance keywords (pos 4-20, impressions ≥ 30):\n`);
    console.log(`  ${'QUERY'.padEnd(50)} ${'CLK'.padStart(5)} ${'IMP'.padStart(7)} ${'CTR'.padStart(7)} ${'POS'.padStart(5)}`);
    hits.forEach((r) => console.log(
      `  ${(r.keys[0] || '').slice(0, 50).padEnd(50)} ${String(r.clicks).padStart(5)} ${String(r.impressions).padStart(7)} ${pct(r.ctr).padStart(7)} ${fmtPos(r.position).padStart(5)}`
    ));
  }

  else if (cmd === 'ctr-position') {
    // Bucket by integer position, show aggregate CTR — spot underperforming positions.
    const rows = await query(sc, { dimensions: ['query'], rowLimit: 5000 });
    const buckets = {};
    rows.forEach((r) => {
      const p = Math.max(1, Math.round(r.position));
      if (!buckets[p]) buckets[p] = { clicks: 0, impressions: 0, n: 0 };
      buckets[p].clicks += r.clicks;
      buckets[p].impressions += r.impressions;
      buckets[p].n += 1;
    });
    console.log(`  ${'POS'.padStart(4)} ${'KWS'.padStart(5)} ${'CLK'.padStart(6)} ${'IMP'.padStart(8)} ${'CTR'.padStart(7)}`);
    Object.keys(buckets).map(Number).sort((a, b) => a - b).slice(0, 30).forEach((p) => {
      const b = buckets[p];
      const ctr = b.impressions ? b.clicks / b.impressions : 0;
      console.log(`  ${String(p).padStart(4)} ${String(b.n).padStart(5)} ${String(b.clicks).padStart(6)} ${String(b.impressions).padStart(8)} ${pct(ctr).padStart(7)}`);
    });
  }

  else if (cmd === 'device') {
    const rows = await query(sc, { dimensions: ['device'], rowLimit: 10 });
    console.log(`  ${'DEVICE'.padEnd(10)} ${'CLK'.padStart(6)} ${'IMP'.padStart(8)} ${'CTR'.padStart(7)} ${'POS'.padStart(5)}`);
    rows.forEach((r) => console.log(
      `  ${(r.keys[0] || '').padEnd(10)} ${String(r.clicks).padStart(6)} ${String(r.impressions).padStart(8)} ${pct(r.ctr).padStart(7)} ${fmtPos(r.position).padStart(5)}`
    ));
  }

  else if (cmd === 'country') {
    const rows = await query(sc, { dimensions: ['country'], rowLimit: 20 });
    console.log(`  ${'COUNTRY'.padEnd(10)} ${'CLK'.padStart(6)} ${'IMP'.padStart(8)} ${'CTR'.padStart(7)} ${'POS'.padStart(5)}`);
    rows.forEach((r) => console.log(
      `  ${(r.keys[0] || '').padEnd(10)} ${String(r.clicks).padStart(6)} ${String(r.impressions).padStart(8)} ${pct(r.ctr).padStart(7)} ${fmtPos(r.position).padStart(5)}`
    ));
  }

  else if (cmd === 'history') {
    const rows = await query(sc, { dimensions: ['date'], rowLimit: days });
    // Optional grouping
    const weekly = {};
    rows.forEach((r) => {
      const d = r.keys[0];
      const key = group === 'week' ? weekStart(d) : d;
      if (!weekly[key]) weekly[key] = { clicks: 0, impressions: 0 };
      weekly[key].clicks += r.clicks;
      weekly[key].impressions += r.impressions;
    });
    console.log(`  ${'PERIOD'.padEnd(12)} ${'CLK'.padStart(6)} ${'IMP'.padStart(8)} ${'CTR'.padStart(7)}`);
    Object.keys(weekly).sort().forEach((k) => {
      const b = weekly[k];
      const ctr = b.impressions ? b.clicks / b.impressions : 0;
      console.log(`  ${k.padEnd(12)} ${String(b.clicks).padStart(6)} ${String(b.impressions).padStart(8)} ${pct(ctr).padStart(7)}`);
    });
  }

  else {
    console.error(`Unknown command: ${cmd}\n`);
    printHelp();
    process.exit(1);
  }
}

function weekStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const dow = d.getUTCDay(); // 0=Sun, 1=Mon
  d.setUTCDate(d.getUTCDate() - ((dow + 6) % 7)); // back to Monday
  return d.toISOString().slice(0, 10);
}

function printHelp() {
  console.log(`\nGSC query tool. Commands:\n`);
  console.log(`  summary         aggregate metrics over last [days=90]`);
  console.log(`  keywords        top queries (up to [limit=100])`);
  console.log(`  pages           top URLs (up to [limit=50])`);
  console.log(`  striking        pos 4–20 w/ ≥30 impressions (rank-lift targets)`);
  console.log(`  ctr-position    CTR bucketed by integer position`);
  console.log(`  device          clicks/imp by desktop/mobile/tablet`);
  console.log(`  country         clicks/imp by country (top 20)`);
  console.log(`  history         weekly (or daily) trend`);
  console.log(`  sites           list verified GSC properties\n`);
  console.log(`Flags:  days=N  limit=N  group=week|day  site=<siteUrl>\n`);
}

main().catch((e) => {
  console.error('\n✗ Error:', e?.response?.data || e.message || e);
  if (e?.response?.data?.error?.code === 401 || e?.message?.includes('invalid_grant')) {
    console.error(`\nToken may be stale — delete ${TOKEN_PATH} and re-run to re-consent.`);
  }
  process.exit(1);
});
