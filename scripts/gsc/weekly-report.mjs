#!/usr/bin/env node
/*
 * Weekly GSC performance report — pulls current data, compares to the pre-ship
 * baseline + monthly targets + previous week's snapshot, and emails a warm,
 * readable HTML report via Resend. Runs unattended in GitHub Actions (see
 * .github/workflows/gsc-weekly.yml).
 *
 * Auth (via env vars on GitHub):
 *   GSC_CLIENT_ID / GSC_CLIENT_SECRET / GSC_REFRESH_TOKEN
 *
 * Email (via env vars):
 *   RESEND_API_KEY — same key the contact form uses
 *   REPORT_TO      — recipient (default: jonathan@digistorms.ai)
 *   REPORT_FROM    — sender (default: DigiStorms SEO <noreply@digistorms.com>)
 *
 * Local runs:
 *   node scripts/gsc/weekly-report.mjs --local --dry-run    # prints, no email
 *   node scripts/gsc/weekly-report.mjs --local              # pulls + emails
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
    const secret = JSON.parse(readFileSync(join(homedir(), '.gsc-client-secret.json'), 'utf8'));
    const installed = secret.installed || secret.web;
    client_id     = installed.client_id;
    client_secret = installed.client_secret;
    refresh_token = JSON.parse(readFileSync(join(homedir(), '.gsc-token.json'), 'utf8')).refresh_token;
  } else {
    client_id     = process.env.GSC_CLIENT_ID;
    client_secret = process.env.GSC_CLIENT_SECRET;
    refresh_token = process.env.GSC_REFRESH_TOKEN;
    if (!client_id || !client_secret || !refresh_token) {
      console.error('✗ Missing GSC_CLIENT_ID, GSC_CLIENT_SECRET, or GSC_REFRESH_TOKEN. Use --local for the cached token.');
      process.exit(2);
    }
  }

  const oauth2 = new google.auth.OAuth2(client_id, client_secret);
  oauth2.setCredentials({ refresh_token });
  return oauth2;
}

// ── GSC helpers ──────────────────────────────────────────────────────────────
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

// ── Formatting ───────────────────────────────────────────────────────────────
const fmt = {
  pct: (x) => (x * 100).toFixed(2) + '%',
  pos: (p) => p === undefined ? '—' : p.toFixed(1),
  num: (n) => n.toLocaleString('en-US'),
  signed: (n) => (n > 0 ? '+' : '') + n,
  signedPct: (curr, prior) => {
    if (!prior) return '—';
    const d = ((curr - prior) / prior) * 100;
    return (d >= 0 ? '+' : '') + d.toFixed(0) + '%';
  },
  arrow: (curr, prior) => curr > prior ? '↑' : curr < prior ? '↓' : '→',
};

// Status vs target: on-track / behind / way-behind. Lower-is-better metric
// (position) is inverted.
function statusVsTarget(current, target, lowerIsBetter = false) {
  if (!target) return { label: 'no target', emoji: '—', color: '#94A3B8' };
  const ratio = lowerIsBetter ? target / current : current / target;
  if (ratio >= 0.9) return { label: 'on track', emoji: '✅', color: '#16A34A' };
  if (ratio >= 0.5) return { label: 'behind',  emoji: '⚠️', color: '#D97706' };
  return                     { label: 'way behind', emoji: '🔴', color: '#DC2626' };
}

function projectMonthly(weekClicks, weekImp) {
  // Rough monthly projection from a 7-day window
  return { clicks: Math.round(weekClicks * (30 / 7)), impressions: Math.round(weekImp * (30 / 7)) };
}

// Filter out bot/LLM junk queries + brand queries we already own.
function isNoiseQuery(q) {
  return /acme\s*analytics|acmeanalytics\.(com|io)/i.test(q)
    || /^[\s\-"']+/.test(q)
    || /digistorms?/i.test(q);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const auth = buildOAuthClient();
  const sc = google.searchconsole({ version: 'v1', auth });

  const curr = dateRange(7, 0);
  const prev = dateRange(7, 7);
  const wk2  = dateRange(14, 0);

  async function windowSummary(r) {
    const rows = await query(sc, { startDate: r.startDate, endDate: r.endDate, dimensions: [], rowLimit: 1 });
    return rows[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  }

  const [currSummary, prevSummary, wk2Summary] = await Promise.all([
    windowSummary(curr), windowSummary(prev), windowSummary(wk2),
  ]);

  const [pages, keywords] = await Promise.all([
    query(sc, { startDate: curr.startDate, endDate: curr.endDate, dimensions: ['page'],  rowLimit: 100 }),
    query(sc, { startDate: curr.startDate, endDate: curr.endDate, dimensions: ['query'], rowLimit: 200 }),
  ]);

  const baselinePath = join(__dirname, 'baseline.json');
  const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : null;

  const targetsPath = join(__dirname, 'targets.json');
  const targets = existsSync(targetsPath) ? JSON.parse(readFileSync(targetsPath, 'utf8')) : null;

  // ── Compute target status ──────────────────────────────────────────────────
  const shipDate = baseline?._meta?.changeEvent?.date || targets?._baseline_date;
  const daysSinceShip = shipDate
    ? Math.floor((Date.now() - new Date(shipDate + 'T00:00:00Z').getTime()) / 86400000)
    : 0;

  // Pick the nearest future milestone — extended to support 6mo + 12mo strategic goals
  const milestones = targets?.milestones || {};
  const activeMilestoneKey =
    daysSinceShip < 28  ? 'week4'  :
    daysSinceShip < 56  ? 'week8'  :
    daysSinceShip < 84  ? 'week12' :
    daysSinceShip < 168 ? 'week24' :
                          'week52';
  const activeMilestone = milestones[activeMilestoneKey];

  // Monthly projection from this week's data
  const proj = projectMonthly(currSummary.clicks, currSummary.impressions);

  // Blog-only CTR for this week (excludes homepage + library to isolate what we optimized)
  const blogPages = pages.filter((r) => /\/blog\//.test(r.keys[0]));
  const blogClicks = blogPages.reduce((s, r) => s + r.clicks, 0);
  const blogImp    = blogPages.reduce((s, r) => s + r.impressions, 0);
  const blogCTR    = blogImp > 0 ? blogClicks / blogImp : 0;

  const targetStatus = activeMilestone ? {
    clicks:       statusVsTarget(proj.clicks,       activeMilestone.clicks_per_month),
    impressions:  statusVsTarget(proj.impressions,  activeMilestone.impressions_per_month),
    blogCtr:      statusVsTarget(blogCTR,           activeMilestone.blog_ctr),
    position:     statusVsTarget(currSummary.position, activeMilestone.position, true),
  } : null;

  // ── CTR movers (7-day vs 90-day pre-ship) ──────────────────────────────────
  const basePageMap = new Map((baseline?.pages || []).map((p) => [p.page, p]));
  const movers = pages
    .map((r) => {
      const base = basePageMap.get(r.keys[0]);
      if (!base) return null;
      return {
        page: r.keys[0],
        shortPath: r.keys[0].replace(/^https?:\/\/[^/]+/, ''),
        currImpressions: r.impressions,
        currCTR: r.ctr,
        baseCTR: base.ctr,
        ctrDeltaPP: (r.ctr - base.ctr) * 100,
      };
    })
    .filter(Boolean)
    .filter((m) => m.currImpressions >= 30); // noise floor

  const ctrWinners = [...movers].sort((a, b) => b.ctrDeltaPP - a.ctrDeltaPP).slice(0, 5);
  const ctrLosers  = [...movers]
    .filter((m) => m.ctrDeltaPP < -0.05 && m.currImpressions >= 100) // only flag real losers
    .sort((a, b) => a.ctrDeltaPP - b.ctrDeltaPP)
    .slice(0, 3);

  // ── Striking-distance tracker ──────────────────────────────────────────────
  // Updated 2026-05-08 — covers existing pages + new autopilot priority targets.
  const trackedQueries = [
    // Existing post anchors
    'webinar email examples',
    'webinar follow up subject lines',
    'webinar follow up email examples',
    'product launch email subject lines',
    'product launch email',
    'product release email',
    'dunning best practices',
    'saas welcome email',
    'saas onboarding email sequence',
    'saas email templates',
    // The 3 new posts shipped 2026-05-06
    'b2b lead nurturing email examples',
    're engagement email',
    're-engagement email examples',
    'transactional email vs marketing email',
    // Top autopilot calendar targets
    'customer retention email',
    'customer retention examples',
    'welcome email template',
    'upsell email examples',
    'customer activation',
    'activation email',
    'lifecycle email marketing examples',
    'transactional email examples',
    'product announcement email',
    'feedback request email',
    'free trial email',
    'subscription cancellation email',
  ];
  const kwMap = new Map(keywords.map((r) => [r.keys[0], r]));
  const striking = trackedQueries.map((q) => {
    const row = kwMap.get(q);
    return {
      query: q,
      position: row?.position,
      impressions: row?.impressions || 0,
      clicks: row?.clicks || 0,
    };
  });

  // ── Top 10 current queries (excluding noise) ───────────────────────────────
  const topQueries = keywords.filter((r) => !isNoiseQuery(r.keys[0])).slice(0, 10);

  // ── Zero-click striking-distance (for recommendations) ─────────────────────
  const zeroClickers = keywords
    .filter((r) => r.clicks === 0 && r.impressions >= 30 && r.position >= 4 && r.position <= 15)
    .filter((r) => !isNoiseQuery(r.keys[0]));

  // ── Build report content ───────────────────────────────────────────────────
  const tldr = buildTLDR({ currSummary, prevSummary, blogCTR, ctrWinners, targetStatus, daysSinceShip });
  const actions = buildActions({ currSummary, prevSummary, blogCTR, daysSinceShip, zeroClickers, striking });

  const ctx = {
    date: new Date().toISOString().slice(0, 10),
    currWindow: curr,
    prevWindow: prev,
    wk2Window: wk2,
    currSummary, prevSummary, wk2Summary,
    baseline, targets, activeMilestone, activeMilestoneKey, daysSinceShip,
    blogCTR, blogClicks, blogImp, projectedMonthly: proj,
    targetStatus,
    ctrWinners, ctrLosers, striking, topQueries, zeroClickers,
    tldr, actions,
  };

  const html = renderHTML(ctx);
  const text = renderText(ctx);
  const subject = buildSubject(ctx);

  if (DRY_RUN) {
    console.log('=== SUBJECT ===\n' + subject + '\n');
    console.log('=== TEXT ===\n' + text);
  } else {
    await sendEmail({ subject, html, text });
  }

  // Rolling snapshot (for the workflow artifact)
  const lastRunPath = join(__dirname, 'last-run.json');
  writeFileSync(lastRunPath, JSON.stringify({
    capturedAt: new Date().toISOString(),
    window: curr,
    summary: currSummary,
    blogCTR,
    keywords: keywords.slice(0, 100).map((r) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    pages: pages.map((r) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
  }, null, 2));
}

// ── TL;DR + actions ──────────────────────────────────────────────────────────
function buildTLDR({ currSummary, prevSummary, blogCTR, ctrWinners, targetStatus, daysSinceShip }) {
  const ctrMovedUp = prevSummary.clicks > 5 && currSummary.ctr > prevSummary.ctr * 1.15;
  const ctrMovedDown = prevSummary.clicks > 5 && currSummary.ctr < prevSummary.ctr * 0.85;
  const onTrackMetrics = targetStatus ? Object.values(targetStatus).filter((s) => s.label === 'on track').length : 0;
  const totalMetrics = targetStatus ? Object.keys(targetStatus).length : 0;

  if (daysSinceShip < 7) {
    return `Too early to see the full title-rewrite impact in the data. Early signals: blog CTR ${fmt.pct(blogCTR)}, ${ctrWinners.length} posts already showing CTR lift.`;
  }

  if (ctrMovedUp && onTrackMetrics >= totalMetrics - 1) {
    return `Good week. CTR up ${((currSummary.ctr - prevSummary.ctr) * 100).toFixed(2)}pp week-over-week. ${onTrackMetrics}/${totalMetrics} targets on track. Keep shipping.`;
  }
  if (ctrMovedDown) {
    return `CTR dipped ${Math.abs((currSummary.ctr - prevSummary.ctr) * 100).toFixed(2)}pp week-over-week. Worth a look — see "needs a second look" below.`;
  }
  return `Steady week. ${currSummary.clicks} clicks, CTR ${fmt.pct(currSummary.ctr)}. ${onTrackMetrics}/${totalMetrics} targets on track.`;
}

function buildActions({ currSummary, prevSummary, blogCTR, daysSinceShip, zeroClickers, striking }) {
  const actions = [];

  // Early days — no action
  if (daysSinceShip < 14) {
    actions.push({ tone: 'chill', text: 'Nothing urgent this week. Title rewrites are still propagating (typically 2–4 weeks). Let it cook.' });
    return actions;
  }

  // CTR regressed
  if (prevSummary.clicks > 10 && currSummary.ctr < prevSummary.ctr * 0.7) {
    actions.push({ tone: 'flag', text: `CTR dropped ~${Math.round((1 - currSummary.ctr / prevSummary.ctr) * 100)}% WoW. Run \`npm run gsc pages\` and look for a high-impression / low-CTR page that regressed.` });
  }

  // New posts stagnant — check striking-distance progress
  const strikingStill = striking.filter((s) => s.position && s.position > 15);
  if (daysSinceShip >= 21 && strikingStill.length >= 4) {
    actions.push({ tone: 'flag', text: `${strikingStill.length} striking-distance queries still at pos 15+. Time to add internal links from pillar posts to the new subject-line pages to help them climb.` });
  }

  // Zero-click opportunities (next title rewrites)
  if (zeroClickers.length >= 3 && daysSinceShip >= 14) {
    actions.push({
      tone: 'opportunity',
      text: `${zeroClickers.length} queries have 30+ impressions and zero clicks at pos 4–15. Top target: "${zeroClickers[0].keys[0]}" (${zeroClickers[0].impressions} imp, pos ${zeroClickers[0].position.toFixed(1)}). Next title-rewrite candidate.`,
    });
  }

  // Big CTR win to celebrate
  if (currSummary.clicks >= prevSummary.clicks * 1.5 && currSummary.clicks >= 30) {
    actions.push({ tone: 'win', text: `Clicks up ${Math.round(((currSummary.clicks / prevSummary.clicks) - 1) * 100)}% WoW. Whatever you changed recently is working — keep going.` });
  }

  if (actions.length === 0) {
    actions.push({ tone: 'chill', text: 'Steady state. No urgent action this week — keep publishing and let the data accumulate.' });
  }
  return actions;
}

// ── Subject line ─────────────────────────────────────────────────────────────
function buildSubject({ currSummary, prevSummary, blogCTR }) {
  const ctrDelta = (currSummary.ctr - prevSummary.ctr) * 100;
  const emoji = ctrDelta > 0.1 ? '📈' : ctrDelta < -0.1 ? '📉' : '📊';
  const ctrTrend = ctrDelta > 0 ? `CTR +${ctrDelta.toFixed(2)}pp` : ctrDelta < 0 ? `CTR ${ctrDelta.toFixed(2)}pp` : 'CTR flat';
  return `GSC weekly ${emoji} ${currSummary.clicks} clicks · ${ctrTrend}`;
}

// ── HTML renderer (email-safe, inline styles) ────────────────────────────────
function renderHTML(ctx) {
  const { currWindow, prevWindow, currSummary, prevSummary, blogCTR,
    projectedMonthly, activeMilestone, activeMilestoneKey, targetStatus,
    ctrWinners, ctrLosers, striking, topQueries, tldr, actions, date } = ctx;

  const css = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0F172A; line-height: 1.55; margin: 0; padding: 0; background: #F8F6F2; }
    .wrap { max-width: 640px; margin: 0 auto; padding: 24px; background: #FFFFFF; }
    h1 { font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: normal; color: #0F172A; letter-spacing: -0.02em; margin: 0 0 4px; }
    h2 { font-family: Georgia, serif; font-size: 19px; font-weight: normal; color: #0F172A; margin: 32px 0 12px; letter-spacing: -0.01em; }
    p  { margin: 0 0 12px; color: #334155; }
    .meta { color: #94A3B8; font-size: 13px; margin-bottom: 24px; }
    .tldr { background: #EFF6FF; border-left: 3px solid #2563EB; padding: 14px 18px; border-radius: 6px; margin-bottom: 28px; color: #1E3A8A; font-size: 15px; }
    table { width: 100%; border-collapse: collapse; margin: 4px 0 8px; font-size: 14px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #E2E8F0; }
    th { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    .path { font-family: 'SF Mono', Menlo, monospace; font-size: 13px; color: #475569; }
    .delta-up   { color: #16A34A; font-weight: 600; }
    .delta-down { color: #DC2626; font-weight: 600; }
    .delta-flat { color: #94A3B8; }
    .action { padding: 12px 16px; border-radius: 8px; margin-bottom: 10px; font-size: 14px; }
    .action.win         { background: #DCFCE7; color: #166534; }
    .action.opportunity { background: #FEF3C7; color: #92400E; }
    .action.flag        { background: #FEE2E2; color: #991B1B; }
    .action.chill       { background: #F1F5F9; color: #475569; }
    .target-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
    .target-row:last-child { border-bottom: none; }
    .note { color: #64748B; font-size: 13px; font-style: italic; margin-top: 4px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px; }
    a { color: #2563EB; text-decoration: none; }
  `;

  const deltaClass = (curr, prior) => curr > prior ? 'delta-up' : curr < prior ? 'delta-down' : 'delta-flat';
  const deltaStr = (curr, prior, fmtFn = fmt.num) => {
    const d = curr - prior;
    if (d === 0) return '—';
    return `${fmt.signed(Math.round(d))} (${fmt.signedPct(curr, prior)})`;
  };

  let body = '';

  // Greeting + TL;DR
  body += `<h1>Hey Jonathan 👋</h1>`;
  body += `<div class="meta">GSC weekly report · ${date} · ${currWindow.startDate} → ${currWindow.endDate}</div>`;
  body += `<div class="tldr">${escapeHtml(tldr)}</div>`;

  // Your week at a glance
  body += `<h2>📊 Your week at a glance</h2>`;
  body += `<table>
    <thead><tr><th></th><th class="num">This week</th><th class="num">Last week</th><th class="num">Δ</th></tr></thead>
    <tbody>
      <tr><td>Clicks</td><td class="num">${currSummary.clicks}</td><td class="num">${prevSummary.clicks}</td><td class="num ${deltaClass(currSummary.clicks, prevSummary.clicks)}">${deltaStr(currSummary.clicks, prevSummary.clicks)}</td></tr>
      <tr><td>Impressions</td><td class="num">${fmt.num(currSummary.impressions)}</td><td class="num">${fmt.num(prevSummary.impressions)}</td><td class="num ${deltaClass(currSummary.impressions, prevSummary.impressions)}">${deltaStr(currSummary.impressions, prevSummary.impressions)}</td></tr>
      <tr><td>CTR</td><td class="num">${fmt.pct(currSummary.ctr)}</td><td class="num">${fmt.pct(prevSummary.ctr)}</td><td class="num ${deltaClass(currSummary.ctr, prevSummary.ctr)}">${((currSummary.ctr - prevSummary.ctr) * 100).toFixed(2)}pp</td></tr>
      <tr><td>Avg position</td><td class="num">${fmt.pos(currSummary.position)}</td><td class="num">${fmt.pos(prevSummary.position)}</td><td class="num ${deltaClass(prevSummary.position, currSummary.position)}">${(currSummary.position - prevSummary.position).toFixed(1)}</td></tr>
      <tr><td>Blog-only CTR</td><td class="num">${fmt.pct(blogCTR)}</td><td class="num" colspan="2">${ctx.blogClicks} clicks on ${fmt.num(ctx.blogImp)} impressions</td></tr>
    </tbody>
  </table>`;

  // Targets section
  if (targetStatus && activeMilestone) {
    body += `<h2>🎯 Progress vs ${escapeHtml(activeMilestoneKey)} target (${escapeHtml(activeMilestone.label)})</h2>`;
    body += `<div>`;
    body += targetRow('Clicks / month',      `${projectedMonthly.clicks} projected`,   `${activeMilestone.clicks_per_month} target`,   targetStatus.clicks);
    body += targetRow('Impressions / month', `${fmt.num(projectedMonthly.impressions)} projected`, `${fmt.num(activeMilestone.impressions_per_month)} target`, targetStatus.impressions);
    body += targetRow('Blog CTR',            fmt.pct(blogCTR),                         fmt.pct(activeMilestone.blog_ctr),              targetStatus.blogCtr);
    body += targetRow('Avg position',        fmt.pos(currSummary.position),            `≤ ${activeMilestone.position.toFixed(1)} target`, targetStatus.position);
    body += `</div>`;
    body += `<div class="note">"Projected" = this week's rate extrapolated to 30 days. Directional, not precise.</div>`;
  }

  // CTR winners
  if (ctrWinners.length > 0) {
    body += `<h2>🚀 Posts where the new titles are landing</h2>`;
    body += `<p>CTR lift on posts with meaningful impressions, vs the pre-ship 90-day average:</p>`;
    body += `<table>
      <thead><tr><th>Page</th><th class="num">Impressions</th><th class="num">CTR now</th><th class="num">Before</th><th class="num">Δ</th></tr></thead>
      <tbody>
        ${ctrWinners.map((m) => `<tr>
          <td class="path">${escapeHtml(m.shortPath)}</td>
          <td class="num">${m.currImpressions}</td>
          <td class="num">${fmt.pct(m.currCTR)}</td>
          <td class="num">${fmt.pct(m.baseCTR)}</td>
          <td class="num ${m.ctrDeltaPP > 0 ? 'delta-up' : 'delta-down'}">${m.ctrDeltaPP > 0 ? '+' : ''}${m.ctrDeltaPP.toFixed(2)}pp</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  }

  // CTR losers (only if real)
  if (ctrLosers.length > 0) {
    body += `<h2>👀 Posts that need a second look</h2>`;
    body += `<p>Pages where the 7-day CTR dropped meaningfully vs baseline. Small windows on low-impression pages are noisy — only showing pages with 100+ impressions this week.</p>`;
    body += `<table>
      <thead><tr><th>Page</th><th class="num">Impressions</th><th class="num">CTR now</th><th class="num">Before</th><th class="num">Δ</th></tr></thead>
      <tbody>
        ${ctrLosers.map((m) => `<tr>
          <td class="path">${escapeHtml(m.shortPath)}</td>
          <td class="num">${m.currImpressions}</td>
          <td class="num">${fmt.pct(m.currCTR)}</td>
          <td class="num">${fmt.pct(m.baseCTR)}</td>
          <td class="num delta-down">${m.ctrDeltaPP.toFixed(2)}pp</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  }

  // Striking-distance
  body += `<h2>🔍 Queries we're chasing</h2>`;
  body += `<p>The 6 queries the April 20 content push targeted:</p>`;
  body += `<table>
    <thead><tr><th>Query</th><th class="num">Position</th><th class="num">Impressions</th><th class="num">Clicks</th></tr></thead>
    <tbody>
      ${striking.map((s) => `<tr>
        <td>${escapeHtml(s.query)}</td>
        <td class="num">${s.position ? fmt.pos(s.position) : '—'}</td>
        <td class="num">${s.impressions}</td>
        <td class="num">${s.clicks}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;

  // Top 10
  if (topQueries.length > 0) {
    body += `<h2>🏆 Top 10 queries this week</h2>`;
    body += `<table>
      <thead><tr><th>Query</th><th class="num">Clicks</th><th class="num">Imp</th><th class="num">CTR</th><th class="num">Pos</th></tr></thead>
      <tbody>
        ${topQueries.map((r) => `<tr>
          <td>${escapeHtml(r.keys[0])}</td>
          <td class="num">${r.clicks}</td>
          <td class="num">${r.impressions}</td>
          <td class="num">${fmt.pct(r.ctr)}</td>
          <td class="num">${fmt.pos(r.position)}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
    body += `<div class="note">Filtered out "acme analytics" bot queries + brand queries we already own.</div>`;
  }

  // This week's focus
  body += `<h2>📌 This week's focus</h2>`;
  actions.forEach((a) => {
    body += `<div class="action ${a.tone}">${escapeHtml(a.text)}</div>`;
  });

  // Footer
  body += `<div class="footer">
    Day ${ctx.daysSinceShip} after the April 20 title rewrites shipped. Next report: next Monday.<br>
    Re-pull this data locally anytime with <code>npm run gsc &lt;command&gt;</code>.
  </div>`;

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GSC weekly</title><style>${css}</style></head><body><div class="wrap">${body}</div></body></html>`;
}

function targetRow(label, current, target, status) {
  return `<div class="target-row">
    <span>${status.emoji} <strong>${label}</strong> — ${current}</span>
    <span style="color: ${status.color}">${target} · ${status.label}</span>
  </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ── Text fallback for email clients that block HTML ──────────────────────────
function renderText(ctx) {
  const { currWindow, currSummary, prevSummary, blogCTR, tldr, actions,
    projectedMonthly, activeMilestone, targetStatus, ctrWinners, striking, date } = ctx;
  const lines = [];
  lines.push(`Hey Jonathan,`);
  lines.push('');
  lines.push(tldr);
  lines.push('');
  lines.push(`--- Your week (${currWindow.startDate} → ${currWindow.endDate}) ---`);
  lines.push(`  Clicks:       ${currSummary.clicks}     (was ${prevSummary.clicks})`);
  lines.push(`  Impressions:  ${fmt.num(currSummary.impressions)} (was ${fmt.num(prevSummary.impressions)})`);
  lines.push(`  CTR:          ${fmt.pct(currSummary.ctr)}   (was ${fmt.pct(prevSummary.ctr)})`);
  lines.push(`  Avg position: ${fmt.pos(currSummary.position)}   (was ${fmt.pos(prevSummary.position)})`);
  lines.push(`  Blog-only CTR: ${fmt.pct(blogCTR)}`);
  lines.push('');
  if (targetStatus && activeMilestone) {
    lines.push(`--- Progress vs ${activeMilestone.label} targets ---`);
    lines.push(`  Clicks/mo:      ${projectedMonthly.clicks} projected → target ${activeMilestone.clicks_per_month} — ${targetStatus.clicks.emoji} ${targetStatus.clicks.label}`);
    lines.push(`  Impressions/mo: ${fmt.num(projectedMonthly.impressions)} projected → target ${fmt.num(activeMilestone.impressions_per_month)} — ${targetStatus.impressions.emoji} ${targetStatus.impressions.label}`);
    lines.push(`  Blog CTR:       ${fmt.pct(blogCTR)} → target ${fmt.pct(activeMilestone.blog_ctr)} — ${targetStatus.blogCtr.emoji} ${targetStatus.blogCtr.label}`);
    lines.push(`  Position:       ${fmt.pos(currSummary.position)} → target ≤ ${activeMilestone.position.toFixed(1)} — ${targetStatus.position.emoji} ${targetStatus.position.label}`);
    lines.push('');
  }
  if (ctrWinners.length) {
    lines.push(`--- Posts where the new titles are landing ---`);
    ctrWinners.forEach((m) => {
      lines.push(`  ${m.shortPath}  ${fmt.pct(m.baseCTR)} → ${fmt.pct(m.currCTR)}  (${m.ctrDeltaPP > 0 ? '+' : ''}${m.ctrDeltaPP.toFixed(2)}pp)`);
    });
    lines.push('');
  }
  lines.push(`--- Queries we're chasing ---`);
  striking.forEach((s) => {
    lines.push(`  ${s.query}  pos ${s.position ? fmt.pos(s.position) : '—'}  ${s.impressions} imp  ${s.clicks} clicks`);
  });
  lines.push('');
  lines.push(`--- This week's focus ---`);
  actions.forEach((a) => lines.push(`  → ${a.text}`));
  lines.push('');
  lines.push(`Day ${ctx.daysSinceShip} after the April 20 title rewrites shipped. Next report: next Monday.`);
  return lines.join('\n');
}

// ── Email send ───────────────────────────────────────────────────────────────
async function sendEmail({ subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.error('✗ RESEND_API_KEY missing — skipping email.'); return; }
  const to   = process.env.REPORT_TO   || 'jonathan@digistorms.ai';
  const from = process.env.REPORT_FROM || 'DigiStorms SEO <noreply@digistorms.com>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Resend API ${res.status}: ${err.slice(0, 300)}`);
  }
  const { id } = await res.json();
  console.error(`\n✓ Sent to ${to} (Resend id: ${id})`);
}

main().catch((e) => { console.error('\n✗ Error:', e.message); process.exit(1); });
