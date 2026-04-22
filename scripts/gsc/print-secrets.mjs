#!/usr/bin/env node
/*
 * Prints the exact values to paste into GitHub Actions secrets so the weekly
 * GSC report workflow can authenticate. Reads from the local OAuth files that
 * already authorized `npm run gsc`.
 *
 * Usage:  node scripts/gsc/print-secrets.mjs
 *
 * Output is written to stderr so you can pipe it without polluting a clipboard.
 * Redirect to /dev/null if you prefer to copy directly from the terminal.
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const secret = JSON.parse(readFileSync(join(homedir(), '.gsc-client-secret.json'), 'utf8'));
const token  = JSON.parse(readFileSync(join(homedir(), '.gsc-token.json'), 'utf8'));
const installed = secret.installed || secret.web;

if (!token.refresh_token) {
  console.error('✗ No refresh_token in ~/.gsc-token.json — delete it and re-run `npm run gsc summary` to re-consent.');
  process.exit(2);
}

console.log(`# Paste these into GitHub → Settings → Secrets and variables → Actions → New repository secret:

GSC_CLIENT_ID=${installed.client_id}
GSC_CLIENT_SECRET=${installed.client_secret}
GSC_REFRESH_TOKEN=${token.refresh_token}

# RESEND_API_KEY — set this in Vercel already; copy the same value.
# See Vercel → your project → Settings → Environment Variables → RESEND_API_KEY
`);
