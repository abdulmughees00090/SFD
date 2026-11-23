#!/usr/bin/env node
/**
 * Adds/refreshes <lastmod> in sitemap.xml using the date each page file was
 * last committed in git. Keeps the existing URL list, order, changefreq and
 * priority exactly as they are. No dependencies.
 *
 * Usage (from the repo root, after committing page changes):
 *   node scripts/generate-sitemap.js
 *
 * lastmod is only as honest as your commits: if a commit touches every page
 * for a non-content reason (e.g. a sitewide style change), those pages' dates
 * will move too. Run it only when real content changed.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const sitemapPath = path.join(root, 'sitemap.xml');
let xml = fs.readFileSync(sitemapPath, 'utf8');

function fileForUrl(loc) {
  const p = new URL(loc).pathname;
  const rel = p === '/' ? 'index.html' : p.replace(/^\//, '') + (p.endsWith('/') ? 'index.html' : '.html');
  return path.join(root, rel);
}

function lastCommitDate(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8' }).trim();
    return out || null;
  } catch (_) {
    return null;
  }
}

let updated = 0;
let missing = [];
xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
  const loc = (inner.match(/<loc>([^<]+)<\/loc>/) || [])[1];
  if (!loc) return block;
  const file = fileForUrl(loc);
  if (!fs.existsSync(file)) { missing.push(loc); return block; }
  const date = lastCommitDate(file);
  if (!date) { missing.push(loc + ' (no git history)'); return block; }
  let next = inner.replace(/\s*<lastmod>[^<]*<\/lastmod>/g, '');
  next = next.replace(/(<loc>[^<]+<\/loc>)/, `$1\n    <lastmod>${date}</lastmod>`);
  updated++;
  return `<url>${next}</url>`;
});

fs.writeFileSync(sitemapPath, xml);
console.log(`lastmod written for ${updated} URLs.`);
if (missing.length) console.warn('Skipped:', missing);
