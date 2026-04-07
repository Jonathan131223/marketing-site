#!/usr/bin/env node
/**
 * IndexNow URL submission script.
 *
 * Usage:
 *   node scripts/indexnow.js                          # submit all sitemap URLs
 *   node scripts/indexnow.js /blog/saas-welcome-email # submit specific path(s)
 *
 * Runs automatically as part of "postdeploy" or manually after publishing new content.
 */

const API_KEY = "9887074e51ea47b0b67d26d806866382";
const HOST = "www.digistorms.ai";
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;

async function submitUrls(urls) {
  const body = {
    host: HOST,
    key: API_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (res.ok || res.status === 202) {
    console.log(`✓ IndexNow: submitted ${urls.length} URL(s) — status ${res.status}`);
  } else {
    console.error(`✗ IndexNow: failed — status ${res.status} ${res.statusText}`);
    const text = await res.text().catch(() => "");
    if (text) console.error("  ", text.slice(0, 200));
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Submit specific paths
    const urls = args.map((p) => `https://${HOST}${p.startsWith("/") ? p : `/${p}`}`);
    await submitUrls(urls);
    return;
  }

  // Default: submit key pages from sitemap
  const keyUrls = [
    `https://${HOST}/`,
    `https://${HOST}/blog`,
    `https://${HOST}/blog/saas-email-benchmarks`,
    `https://${HOST}/blog/saas-welcome-email`,
    `https://${HOST}/blog/product-launch-email`,
    `https://${HOST}/blog/saas-newsletter`,
    `https://${HOST}/blog/webinar-email-sequence`,
    `https://${HOST}/blog/webinar-follow-up-email`,
    `https://${HOST}/blog/webinar-emails`,
    `https://${HOST}/blog/milestone-emails`,
    `https://${HOST}/blog/upgrade-emails`,
    `https://${HOST}/blog/dunning-emails`,
    `https://${HOST}/library`,
    `https://${HOST}/compare/digistorms-vs-customer-io`,
    `https://${HOST}/compare/digistorms-vs-encharge`,
    `https://${HOST}/compare/digistorms-vs-loops`,
    `https://${HOST}/compare/digistorms-vs-resend`,
    `https://${HOST}/compare/best-onboarding-email-tools`,
    `https://${HOST}/compare/customer-io-alternatives`,
    `https://${HOST}/pricing`,
    `https://${HOST}/about`,
    `https://${HOST}/roi-calculator`,
    `https://${HOST}/email-generator`,
  ];

  await submitUrls(keyUrls);
}

main().catch(console.error);
