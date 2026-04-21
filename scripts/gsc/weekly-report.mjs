#!/usr/bin/env node
/*
 * Weekly GSC performance report — pulls current data, diffs against the
 * pre-ship baseline + the previous week's snapshot, writes actionable
 * recommendations, and emails the markdown report via Resend.
 *
 * Designed to run unattended in GitHub Actions (see
 * .github/workflows/gsc-weekly.yml). All credentials come from env vars;
 * the only files touched are under scripts/gsc/.
 *
 * Auth: uses a long-lived OAuth refresh token (Google Desktop app).
 *   GSC_CLIENT_ID      — from the OAuth client JSON
 *   GSC_CLIENT_SECRET  — from the OAuth client JSON
 *   GSC_REFRESH_TOKEN  — from ~/.gsc-token.json (generated locally once)
 *
 * Email:
 *   RESEND_API_KEY     — same key the contact form uses
 *   REPORT_TO          — recipient (default: jonathan@digistorms.ai)
 *   REPORT_FROM        — sender    (default: noreply@digistorms.com)
 *
 * Local dry-run (prints report, no email):
 *   node scripts/gsc/weekly-report.mjs --dry-run
 *
 * Local test with email (uses local token, not env vars):
 *   node scripts/gsc/weekly-report.mjs --local
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');
const LOCAL   = process.argv.includes('--local');
const SITE    = process.env.GSC_SITE || 'sc-domain:digistorms.ai';

// ── Auth ─────────────────────────────────────────────────────────────────────
function buildOAuthClient() {
  let client_id, client_secret, refresh_token;

  if (LOCAL) {
    // Read from local files (same source the `npm run gsc` tool uses).
    const secretPath = join(homedir(), '.gsc-client-secret.json');
    const tokenPath  = join(homedir(), '.gsc-token.json');
    const secret = JSON.parse(readFileSync(secretPath, 'utf8'));
    const installed = secret.installed || secret.web;
    client_id = installed.client_id;
    client_secret = installed.client_secret;
    refresh_token = JSON.parse(readFileSync(tokenPath, 'utf8')).refresh_token;
  } else {
    client_id = process.env.GSC_CLIENT_ID;
    client_secret = process.env.GSC_CLIENT_SECRET;
    refresh_token = process.env.GSC_REFRESH_TOKEN;
    if (!client_id || !client_secret || !refresh_token) {
      console.error('✗ Missing GSC_CLIENT_ID, GSC_CLIENT_SECRET, or GSC_REFRESH_TOKEN. Use --local for the local token.');
      process.exit(2);
    }
  }

  const oauth2 = new google.auth.OAuth2(client_id, client_secret);
  oauth2.setCredentials({ refresh_token });
  return oauth2;
}

// ── GSC query helpers ────────────────────────────────────────────────────────
function dateRange(daysBack, offset = 0) {
  const end = new Date();
  end.setDate(end.getDate() - 2 - offset); // GSC 2-day lag
  const start = new Date(end);
  start.setDate(start.getDate() - daysBack + 1);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

async function query(sc, opts) {
  const { data } = await sc.searchanalytics.query({ siteUrl: SITE, requestBody: opts });
  return data.rows || [];
}

// ── Diff helpers ─────────────────────────────────────────────────────────────
function pct(x) { return (x * 100).toFixed(2) + '%'; }
function signedPct(current, prior) {
  if (!prior) return '—';
  const delta = ((current - prior) / prior) * 100;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(0)}%`;
}
function signedNum(current, prior) {
  const d = current - prior;
  return (d > 0 ? '+' : '') + d;
}

function formatSummaryDelta(label, current, prior) {
  return [
    `**${label}**`,
    `| Metric | Current | Prior | Δ |`,
    `|---|---:|---:|---:|`,
    `| Clicks       | ${current.clicks}       | ${prior?.clicks ?? '—'}       | ${prior ? signedNum(current.clicks, prior.clicks) + ' (' + signedPct(current.clicks, prior.clicks) + ')' : '—'} |`,
    `| Impressions  | ${current.impressions.toLocaleString()} | ${prior?.impressions?.toLocaleString() ?? '—'} | ${prior ? signedNum(current.impressions, prior.impressions) + ' (' + signedPct(current.impressions, prior.impressions) + ')' : '—'} |`,
    `| CTR          | ${pct(current.ctr)}     | ${prior ? pct(prior.ctr) : '—'}     | ${prior ? ((current.ctr - prior.ctr) * 100).toFixed(2) + 'pp' : '—'} |`,
    `| Avg position | ${current.position.toFixed(1)} | ${prior ? prior.position.toFixed(1) : '—'} | ${prior ? (current.position - prior.position).toFixed(1) : '—'} |`,
  ].join('\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const auth = buildOAuthClient();
  const sc = google.searchconsole({ version: 'v1', auth });

  // Pull three windows:
  //   - last 7 days (current)
  //   - the 7 days before that (prior week, for WoW comparison)
  //   - last 14 days (for "since-ship" comparison vs baseline)
  const curr = dateRange(7, 0);
  const prev = dateRange(7, 7);
  const wk2  = dateRange(14, 0);

  async function windowSummary(r) {
    const rows = await query(sc, { startDate: r.startDate, endDate: r.endDate, dimensions: [], rowLimit: 1 });
    return rows[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  }

  const [currSummary, prevSummary, wk2Summary] = await Promise.all([
    windowSummary(curr),
    windowSummary(prev),
    windowSummary(wk2),
  ]);

  // Pages + keywords for current window
  const [pages, keywords] = await Promise.all([
    query(sc, { startDate: curr.startDate, endDate: curr.endDate, dimensions: ['page'], rowLimit: 100 }),
    query(sc, { startDate: curr.startDate, endDate: curr.endDate, dimensions: ['query'], rowLimit: 200 }),
  ]);

  // Baseline (pre-ship, frozen)
  const baselinePath = join(__dirname, 'baseline.json');
  const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : null;

  // Last-week snapshot (rolling, overwritten each run after use)
  const lastRunPath = join(__dirname, 'last-run.json');
  const lastRun = existsSync(lastRunPath) ? JSON.parse(readFileSync(lastRunPath, 'utf8')) : null;

  // ── Report building ────────────────────────────────────────────────────────
  const now = new Date().toISOString().slice(0, 10);
  const shipDate = baseline?._meta?.changeEvent?.date || 'N/A';
  const daysSinceShip = baseline ? Math.floor((Date.now() - new Date(shipDate + 'T00:00:00Z').getTime()) / 86400000) : 0;

  const report = [];
  report.push(`# DigiStorms GSC weekly report — ${now}`);
  report.push('');
  report.push(`Days since title-rewrite ship (PR #43): **${daysSinceShip}**`);
  report.push('');
  report.push('---');
  report.push('');

  // Section 1: headline WoW
  report.push('## This week vs last week');
  report.push('');
  report.push(`Current window: \`${curr.startDate}\` → \`${curr.endDate}\``);
  report.push(`Prior window:   \`${prev.startDate}\` → \`${prev.endDate}\``);
  report.push('');
  report.push(formatSummaryDelta('7-day', currSummary, prevSummary));
  report.push('');

  // Section 2: 14-day vs 90-day pre-ship baseline
  if (baseline?.summary) {
    const avgPerDay = {
      clicks:      baseline.summary.clicks / 90,
      impressions: baseline.summary.impressions / 90,
      ctr:         baseline.summary.ctr,
      position:    baseline.summary.position,
    };
    const projected = {
      clicks:      Math.round(avgPerDay.clicks * 14),
      impressions: Math.round(avgPerDay.impressions * 14),
      ctr:         avgPerDay.ctr,
      position:    avgPerDay.position,
    };
    report.push('## 14-day window vs pre-ship 90-day baseline');
    report.push('');
    report.push(`Pre-ship window: \`${baseline._meta.startDate}\` → \`${baseline._meta.endDate}\` (90 days, normalized to 14)`);
    report.push('');
    report.push(formatSummaryDelta('14-day rolling', wk2Summary, projected));
    report.push('');
  }

  // Section 3: top movers (pages) — biggest gainers and losers vs baseline
  if (baseline?.pages?.length) {
    const basePageMap = new Map(baseline.pages.map((p) => [p.page, p]));
    const movers = pages
      .map((r) => {
        const page = r.keys[0];
        const base = basePageMap.get(page);
        if (!base) return null;
        const basePerDay = base.clicks / 90;
        const currPerDay = r.clicks / 7;
        const baseCTR = base.ctr, currCTR = r.ctr;
        return {
          page,
          currClicks: r.clicks,
          baseClicksProjected: Math.round(basePerDay * 7),
          ctrDelta: (currCTR - baseCTR) * 100, // pp
          baseCTR, currCTR,
          currPosition: r.position,
          basePosition: base.position,
          currImpressions: r.impressions,
        };
      })
      .filter(Boolean)
      .filter((m) => m.currImpressions >= 20); // noise floor

    const ctrWinners = [...movers].sort((a, b) => b.ctrDelta - a.ctrDelta).slice(0, 5);
    const ctrLosers  = [...movers].sort((a, b) => a.ctrDelta - b.ctrDelta).slice(0, 3);

    report.push('## Biggest CTR movers (7-day vs pre-ship average)');
    report.push('');
    report.push(`| Page | Impressions | CTR now | CTR before | Δ (pp) |`);
    report.push(`|---|---:|---:|---:|---:|`);
    ctrWinners.forEach((m) => {
      const shortPath = m.page.replace(/^https?:\/\/[^/]+/, '');
      report.push(`| \`${shortPath}\` | ${m.currImpressions} | ${pct(m.currCTR)} | ${pct(m.baseCTR)} | ${m.ctrDelta >= 0 ? '+' : ''}${m.ctrDelta.toFixed(2)} |`);
    });
    report.push('');

    if (ctrLosers.some((m) => m.ctrDelta < 0)) {
      report.push('### Regressions to investigate');
      report.push('');
      report.push(`| Page | Impressions | CTR now | CTR before | Δ (pp) |`);
      report.push(`|---|---:|---:|---:|---:|`);
      ctrLosers.filter((m) => m.ctrDelta < 0).forEach((m) => {
        const shortPath = m.page.replace(/^https?:\/\/[^/]+/, '');
        report.push(`| \`${shortPath}\` | ${m.currImpressions} | ${pct(m.currCTR)} | ${pct(m.baseCTR)} | ${m.ctrDelta.toFixed(2)} |`);
      });
      report.push('');
    }
  }

  // Section 4: striking-distance tracker — the 4 queries we planned fixes for
  const trackedQueries = [
    'webinar follow up subject lines',
    'webinar follow up email examples',
    'product launch email subject lines',
    'product launch message examples',
    'dunning best practices',
    'webinar email examples',
  ];
  const kwMap = new Map(keywords.map((r) => [r.keys[0], r]));
  const baseKwMap = new Map((baseline?.keywords || []).map((r) => [r.query, r]));

  report.push('## Striking-distance tracker (queries we wrote content for)');
  report.push('');
  report.push(`| Query | Now (pos) | Baseline (pos) | Imp | Clicks |`);
  report.push(`|---|---:|---:|---:|---:|`);
  trackedQueries.forEach((q) => {
    const curr = kwMap.get(q);
    const base = baseKwMap.get(q);
    const currPos = curr ? curr.position.toFixed(1) : '—';
    const basePos = base ? base.position.toFixed(1) : '—';
    const imp  = curr ? curr.impressions : 0;
    const clk  = curr ? curr.clicks : 0;
    report.push(`| ${q} | ${currPos} | ${basePos} | ${imp} | ${clk} |`);
  });
  report.push('');

  // Section 5: top 10 current keywords
  report.push('## Top 10 queries this week');
  report.push('');
  report.push(`| Query | Clicks | Imp | CTR | Pos |`);
  report.push(`|---|---:|---:|---:|---:|`);
  keywords.slice(0, 10).forEach((r) => {
    report.push(`| ${r.keys[0]} | ${r.clicks} | ${r.impressions} | ${pct(r.ctr)} | ${r.position.toFixed(1)} |`);
  });
  report.push('');

  // Section 6: auto-recommendations
  report.push('## Suggested actions this week');
  report.push('');
  const recs = generateRecommendations({
    currSummary, prevSummary, wk2Summary,
    baseline, pages, keywords, daysSinceShip,
  });
  recs.forEach((r) => report.push(`- **${r.priority}** — ${r.text}`));
  if (recs.length === 0) {
    report.push('_No urgent actions this week. Trends are within expected bounds — keep shipping._');
  }
  report.push('');
  report.push('---');
  report.push('');
  report.push(`_Generated by \`scripts/gsc/weekly-report.mjs\`. Pull raw data anytime with \`npm run gsc <command>\`._`);

  const body = report.join('\n');

  // ── Output / send ─────────────────────────────────────────────────────────
  if (DRY_RUN) {
    console.log(body);
  } else {
    await sendEmail(body, currSummary);
  }

  // Always update last-run snapshot for next WoW comparison
  writeFileSync(lastRunPath, JSON.stringify({
    capturedAt: new Date().toISOString(),
    window: curr,
    summary: currSummary,
    keywords: keywords.slice(0, 100).map((r) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    pages: pages.map((r) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
  }, null, 2));
  console.error(`\n✓ Snapshot saved to ${lastRunPath}`);
}

function generateRecommendations(ctx) {
  const recs = [];
  const { currSummary, prevSummary, baseline, daysSinceShip, keywords, pages } = ctx;

  // Rule 1: CTR dropped WoW
  if (prevSummary.clicks > 10 && currSummary.ctr < prevSummary.ctr * 0.7) {
    recs.push({ priority: 'HIGH', text: `CTR dropped ~${Math.round((1 - currSummary.ctr / prevSummary.ctr) * 100)}% WoW. Check for a snippet regression or a big new ranking at a low-CTR position. Run \`npm run gsc pages\` and look at the highest-impression / lowest-CTR row.` });
  }

  // Rule 2: Clicks stagnating despite title rewrites (> 14 days since ship)
  if (baseline && daysSinceShip >= 14) {
    const basePerDay = baseline.summary.clicks / 90;
    const currPerDay = currSummary.clicks / 7;
    if (currPerDay < basePerDay * 1.2) {
      recs.push({ priority: 'MEDIUM', text: `14+ days post-ship, daily clicks only ${(currPerDay / basePerDay).toFixed(2)}× baseline. Title rewrites haven't fully propagated yet or snippets aren't earning. Spot-check the rewritten posts in Google's SERP simulator.` });
    } else if (currPerDay >= basePerDay * 2) {
      recs.push({ priority: 'WIN', text: `Daily clicks now ${(currPerDay / basePerDay).toFixed(2)}× the pre-ship baseline. The title rewrites are working — consider replicating the pattern on library + comparison pages.` });
    }
  }

  // Rule 3: New posts indexed + ranking
  const subjectLinesQueries = keywords.filter((r) => /subject lines?/i.test(r.keys[0]));
  if (subjectLinesQueries.length > 0 && daysSinceShip >= 7) {
    const total = subjectLinesQueries.reduce((s, r) => s + r.impressions, 0);
    recs.push({ priority: 'INFO', text: `The two subject-line posts are picking up ${total} impressions on ${subjectLinesQueries.length} queries. Push internal links from /blog/webinar-email-sequence and /blog/product-launch-email to accelerate ranking.` });
  }

  // Rule 4: top striking-distance keyword with impressions but zero clicks.
  // Filter out bot/LLM pollution — "acme analytics" synthetic queries and
  // other patterns that game impressions without real intent.
  const isNoise = (q) =>
    /acme\s*analytics|acmeanalytics\.(com|io)/i.test(q)  // fake brand spam
    || /^[\s\-"']+/.test(q)                               // leading punctuation
    || /digistorms?/i.test(q);                             // brand queries we already own
  const zeroClickers = keywords
    .filter((r) => r.clicks === 0 && r.impressions >= 20 && r.position >= 4 && r.position <= 15)
    .filter((r) => !isNoise(r.keys[0]));
  if (zeroClickers.length >= 3) {
    recs.push({ priority: 'HIGH', text: `${zeroClickers.length} intent-driven queries have 20+ impressions and zero clicks at pos 4–15. Pick the top 2 and rewrite their title/description — highest-leverage CTR work. Top target: "${zeroClickers[0].keys[0]}" (${zeroClickers[0].impressions} imp, pos ${zeroClickers[0].position.toFixed(1)}).` });
  }

  return recs;
}

async function sendEmail(markdown, summary) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.error('✗ RESEND_API_KEY missing — skipping email.'); return; }
  const to   = process.env.REPORT_TO   || 'jonathan@digistorms.ai';
  const from = process.env.REPORT_FROM || 'DigiStorms SEO <noreply@digistorms.com>';

  const subject = `GSC weekly — ${summary.clicks} clicks · ${summary.impressions.toLocaleString()} imp · ${(summary.ctr * 100).toFixed(2)}% CTR`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, text: markdown }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Resend API ${res.status}: ${err.slice(0, 300)}`);
  }
  const { id } = await res.json();
  console.error(`\n✓ Sent to ${to} (Resend id: ${id})`);
}

main().catch((e) => { console.error('\n✗ Error:', e.message); process.exit(1); });
