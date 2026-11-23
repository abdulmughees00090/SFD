#!/usr/bin/env node
/**
 * Notify search engines about job URL changes. Dry-run unless --send is given.
 *
 *   node scripts/notify-indexing.js                       # active jobs + /careers/ (dry run)
 *   node scripts/notify-indexing.js --send                # submit updated URLs
 *   node scripts/notify-indexing.js --send --deleted https://silverfoxdynamics.com/careers/<slug>/
 *
 * IndexNow (Bing, Yandex, etc.): key is public by design; file <key>.txt in site root.
 *   Override with env INDEXNOW_KEY.
 * Google Indexing API (optional, never commit credentials):
 *   env GOOGLE_SERVICE_ACCOUNT_JSON = path to the service-account JSON file, or the JSON itself.
 *   The service account email must be an Owner of the property in Search Console.
 *   Google officially supports this API for JobPosting/BroadcastEvent pages only.
 * Deleted URLs must already return 404/410 before sending --deleted.
 */
const fs = require('fs');
const crypto = require('crypto');
const { SITE, discoverJobs } = require('./lib/jobs');

const args = process.argv.slice(2);
const send = args.includes('--send');
const deleted = [];
args.forEach((a, i) => { if (a === '--deleted') deleted.push(args[i + 1]); });
const updated = [`${SITE}/careers/`, ...discoverJobs().filter((j) => !j.expired).map((j) => j.url)];
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '0541c4696391b15380c4d55bf668d656';

async function indexNow(urls) {
  const body = { host: new URL(SITE).host, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: urls };
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body),
  });
  console.log(`IndexNow: HTTP ${r.status} (${urls.length} URLs)`);
}

const b64u = (b) => Buffer.from(b).toString('base64url');
async function googleToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64u(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  }));
  const sig = crypto.createSign('RSA-SHA256').update(`${head}.${claim}`).sign(sa.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('Google token error: ' + JSON.stringify(j));
  return j.access_token;
}

async function googleIndexing(list) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) { console.log('Google Indexing API: skipped (GOOGLE_SERVICE_ACCOUNT_JSON not set).'); return; }
  const sa = JSON.parse(raw.trim().startsWith('{') ? raw : fs.readFileSync(raw, 'utf8'));
  const token = await googleToken(sa);
  for (const { url, type } of list) {
    const r = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url, type }),
    });
    console.log(`Google ${type} ${url}: HTTP ${r.status}`);
  }
}

(async () => {
  console.log('URL_UPDATED:', updated.join('\n  '));
  if (deleted.length) console.log('URL_DELETED:', deleted.join('\n  '));
  if (!send) { console.log('\nDry run. Re-run with --send to submit.'); return; }
  await indexNow([...updated, ...deleted]);
  await googleIndexing([
    ...updated.filter((u) => u !== `${SITE}/careers/`).map((url) => ({ url, type: 'URL_UPDATED' })),
    ...deleted.map((url) => ({ url, type: 'URL_DELETED' })),
  ]);
})().catch((e) => { console.error(e.message); process.exit(1); });
