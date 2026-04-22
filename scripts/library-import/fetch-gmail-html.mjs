#!/usr/bin/env node
/*
 * Fetch a brand's marketing emails from Gmail and cache the authentic text/html
 * body for each, ready for the render-screenshots.mjs step of /library-import.
 *
 * Why direct Gmail API? The Gmail MCP strips HTML and only surfaces plaintext,
 * which forces a reconstruction pipeline that yields inauthentic screenshots.
 * users.messages.get(format='FULL') returns the structured payload.parts tree
 * with each MIME part's body base64url-encoded — no MIME parser needed.
 *
 * First run:
 *   node scripts/library-import/fetch-gmail-html.mjs --brand=wispr-flow --sender=hello@mail.wispr.ai
 *   → opens a browser for OAuth consent; caches the refresh token at
 *     ~/.gmail-token.json so later runs are non-interactive.
 *
 * Later runs:
 *   node scripts/library-import/fetch-gmail-html.mjs --brand=<slug> --sender=<addr-or-domain> [--limit=N]
 *
 * Output:
 *   .cache/library-import/{brand-slug}/{msgId}.html   — one authentic body per email
 *   .cache/library-import/{brand-slug}/manifest.json  — array of
 *     {slug, subject, sender, date, bodyFile, plainTextPreview}.
 *     `slug` is a placeholder ({brand}-{YYYYMMDD}-{msgId-short}); Phase C of the
 *     /library-import workflow replaces it with the final `{primary-tag}-from-
 *     {brand}-{MMDDYYYY}` once categorization is done. `bodyFile` is stable and
 *     does not change across renames, so render-screenshots.mjs still finds
 *     the HTML after the slug rename.
 *
 * Env vars (optional):
 *   GMAIL_CLIENT_SECRET  path to the downloaded OAuth client secret JSON
 *                        (default: ~/.gmail-client-secret.json)
 *   GMAIL_TOKEN          path to cache the refresh token
 *                        (default: ~/.gmail-token.json)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { exec } from "node:child_process";
import { google } from "googleapis";
import { CACHE_DIR, ensureDir, htmlToText, parseArgs } from "./helpers.mjs";

const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const CLIENT_SECRET_PATH =
  process.env.GMAIL_CLIENT_SECRET || join(homedir(), ".gmail-client-secret.json");
const TOKEN_PATH = process.env.GMAIL_TOKEN || join(homedir(), ".gmail-token.json");

const args = parseArgs(process.argv);
if (!args.brand) {
  console.error("error: --brand=<slug> is required");
  process.exit(1);
}
if (!args.sender) {
  console.error("error: --sender=<addr-or-domain> is required");
  process.exit(1);
}
const brandSlug = args.brand;
const sender = args.sender;
const limit = args.limit ? parseInt(args.limit, 10) : null;
const dryRun = Boolean(args["dry-run"]);

// ── Auth (mirrors scripts/gsc/query.mjs, differs only in SCOPE + token path) ──
async function getAuthedClient() {
  if (!existsSync(CLIENT_SECRET_PATH)) {
    console.error(`\n✗ Client secret not found at ${CLIENT_SECRET_PATH}\n`);
    console.error("One-time Gmail OAuth setup (~3 minutes):");
    console.error("  1. Open https://console.cloud.google.com/apis/credentials");
    console.error("  2. Create OAuth 2.0 Client ID → Application type: Desktop app");
    console.error(`  3. Download the JSON and save it to ${CLIENT_SECRET_PATH}`);
    console.error("  4. Enable the Gmail API in the same project:");
    console.error("     https://console.cloud.google.com/apis/library/gmail.googleapis.com");
    console.error("  5. Re-run this command.\n");
    process.exit(2);
  }

  const secret = JSON.parse(readFileSync(CLIENT_SECRET_PATH, "utf8"));
  const installed = secret.installed || secret.web;
  if (!installed) {
    console.error(
      `✗ Unrecognized client_secret shape at ${CLIENT_SECRET_PATH}. Expected .installed or .web property.`,
    );
    process.exit(2);
  }
  const { client_id, client_secret } = installed;

  if (existsSync(TOKEN_PATH)) {
    const oauth2 = new google.auth.OAuth2(client_id, client_secret);
    oauth2.setCredentials(JSON.parse(readFileSync(TOKEN_PATH, "utf8")));
    return oauth2;
  }

  return await loopbackConsent(client_id, client_secret);
}

function loopbackConsent(client_id, client_secret) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      const redirectUri = `http://localhost:${port}`;
      const client = new google.auth.OAuth2(client_id, client_secret, redirectUri);
      const authUrl = client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [SCOPE],
      });

      server.on("request", async (req, res) => {
        try {
          const url = new URL(req.url, redirectUri);
          const code = url.searchParams.get("code");
          const err = url.searchParams.get("error");
          if (err) {
            res.writeHead(400, { "content-type": "text/html" });
            res.end(`<h1>OAuth error: ${err}</h1>`);
            server.close();
            return reject(new Error(`OAuth: ${err}`));
          }
          if (!code) {
            res.writeHead(404);
            res.end();
            return;
          }

          res.writeHead(200, { "content-type": "text/html" });
          res.end(`<!doctype html><meta charset="utf-8"><title>Gmail authorized</title>
<style>body{font:16px -apple-system,system-ui,sans-serif;max-width:520px;margin:10vh auto;padding:2rem;color:#0F172A}h1{font-family:Georgia,serif;font-size:28px}p{color:#475569;line-height:1.6}</style>
<h1>✓ DigiStorms Gmail authorized</h1>
<p>You can close this tab — the terminal has the token now.</p>`);
          server.close();

          const { tokens } = await client.getToken(code);
          client.setCredentials(tokens);
          writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), { mode: 0o600 });
          console.error(`\n✓ Token cached at ${TOKEN_PATH}\n`);
          resolve(client);
        } catch (e) {
          reject(e);
        }
      });

      console.error("\n👉 A browser tab will open to authorize Gmail access.");
      console.error("   If it doesn't, open this URL manually:\n");
      console.error("   " + authUrl + "\n");
      console.error(`   (Waiting for approval on ${redirectUri} …)\n`);

      const opener =
        process.platform === "darwin" ? "open" : process.platform === "win32" ? 'start ""' : "xdg-open";
      exec(`${opener} "${authUrl}"`, () => {});

      setTimeout(() => {
        if (server.listening) {
          server.close();
          reject(new Error("OAuth flow timed out after 5 minutes — re-run the command."));
        }
      }, 300_000);
    });
  });
}

// ── Gmail payload helpers ────────────────────────────────────────────────────
function findPart(part, mimeType) {
  if (part.mimeType === mimeType && part.body?.data) return part.body.data;
  for (const p of part.parts || []) {
    const found = findPart(p, mimeType);
    if (found) return found;
  }
  return null;
}

function decodeBase64Url(data) {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function getHeader(headers, name) {
  const h = (headers || []).find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : null;
}

// Parse the `From` header: either "Display Name <addr@host>" or "addr@host".
function parseFromHeader(raw) {
  if (!raw) return { name: null, address: null };
  const m = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || null, address: m[2].trim().toLowerCase() };
  return { name: null, address: raw.trim().toLowerCase() };
}

// Matches messages that actually came from the sender we asked about
// (skips replies/forwards that end up in the same thread).
function matchesSender(fromAddress, senderArg) {
  if (!fromAddress) return false;
  const addr = fromAddress.toLowerCase();
  const target = senderArg.toLowerCase();
  if (target.includes("@")) return addr === target;
  // Bare domain: match any address ending in @{domain} or .{domain}
  return addr.endsWith(`@${target}`) || addr.endsWith(`.${target}`);
}

function gmailQueryFor(senderArg) {
  return senderArg.includes("@") ? `from:${senderArg}` : `from:@${senderArg}`;
}

function formatYYYYMMDD(d) {
  const date = new Date(d);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const auth = await getAuthedClient();
  const gmail = google.gmail({ version: "v1", auth });
  const query = gmailQueryFor(sender);

  console.error(`\n🔍 Gmail query: ${query}`);

  // 1. Paginate threads.list exhaustively.
  const threadIds = [];
  let pageToken = undefined;
  do {
    const { data } = await gmail.users.threads.list({
      userId: "me",
      q: query,
      maxResults: 100,
      pageToken,
    });
    (data.threads || []).forEach((t) => threadIds.push(t.id));
    pageToken = data.nextPageToken;
  } while (pageToken);
  console.error(`  threads matched: ${threadIds.length}`);

  // 2. For each thread, get all messages with full payload, then filter by sender.
  const messages = [];
  for (const tid of threadIds) {
    const { data } = await gmail.users.threads.get({
      userId: "me",
      id: tid,
      format: "full",
    });
    for (const msg of data.messages || []) {
      const from = parseFromHeader(getHeader(msg.payload?.headers, "From"));
      if (!matchesSender(from.address, sender)) continue;
      messages.push({ ...msg, _fromName: from.name, _fromAddress: from.address });
    }
  }
  console.error(`  messages from sender: ${messages.length}`);

  // 3. Sort ascending by internalDate (ms epoch) and apply --limit.
  messages.sort((a, b) => Number(a.internalDate) - Number(b.internalDate));
  const selected = limit ? messages.slice(0, limit) : messages;
  console.error(`  selected: ${selected.length}${limit ? ` (--limit=${limit})` : ""}\n`);

  if (dryRun) {
    console.error("[dry-run] would write the following to cache:");
    for (const m of selected) {
      const subject = getHeader(m.payload?.headers, "Subject") || "(no subject)";
      const date = new Date(Number(m.internalDate)).toISOString();
      console.error(`  ${date}  ${m.id}  ${subject}`);
    }
    return;
  }

  // 4. Write HTML bodies + manifest.
  const brandDir = join(CACHE_DIR, brandSlug);
  ensureDir(brandDir);

  const manifest = [];
  let htmlCount = 0;
  let plainFallbackCount = 0;

  for (const m of selected) {
    const subject = getHeader(m.payload?.headers, "Subject") || "(no subject)";
    const internalMs = Number(m.internalDate);
    const iso = new Date(internalMs).toISOString();

    let bodyHtml = null;
    const htmlB64 = findPart(m.payload, "text/html");
    if (htmlB64) {
      bodyHtml = decodeBase64Url(htmlB64);
      htmlCount++;
    } else {
      const plainB64 = findPart(m.payload, "text/plain");
      if (plainB64) {
        const text = decodeBase64Url(plainB64);
        bodyHtml = `<pre style="white-space:pre-wrap;font-family:-apple-system,sans-serif;padding:16px">${text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre>`;
        plainFallbackCount++;
        console.warn(`  ⚠ ${m.id} (${subject}) has no text/html — falling back to text/plain`);
      } else {
        console.warn(`  ⚠ ${m.id} (${subject}) has no text/html OR text/plain — skipping`);
        continue;
      }
    }

    const bodyFile = `${m.id}.html`;
    writeFileSync(join(brandDir, bodyFile), bodyHtml);

    const shortId = m.id.slice(-6);
    const placeholderSlug = `${brandSlug}-${formatYYYYMMDD(internalMs)}-${shortId}`;

    manifest.push({
      slug: placeholderSlug,
      subject,
      sender: m._fromName || m._fromAddress,
      date: iso,
      bodyFile,
      plainTextPreview: htmlToText(bodyHtml),
    });
  }

  writeFileSync(join(brandDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  console.error(`\n✓ Wrote ${manifest.length} HTML bodies + manifest.json to ${brandDir}`);
  console.error(`    ${htmlCount} from text/html, ${plainFallbackCount} fell back to text/plain`);
  console.error(`\nNext:`);
  console.error(`  1. Review the manifest + HTML bodies, categorize each email.`);
  console.error(`  2. Replace placeholder slugs in manifest.json with final`);
  console.error(`     {primary-tag}-from-{brand}-{MMDDYYYY} slugs (bodyFile stays the same).`);
  console.error(`  3. npm run lib:render -- --brand=${brandSlug}`);
}

main().catch((e) => {
  console.error("\n✗ Error:", e?.response?.data || e.message || e);
  if (e?.response?.data?.error?.code === 401 || e?.message?.includes("invalid_grant")) {
    console.error(`\nToken may be stale — delete ${TOKEN_PATH} and re-run to re-consent.`);
  }
  process.exit(1);
});
