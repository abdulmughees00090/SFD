'use strict';
// Shared helpers: discover job-detail pages under /careers/<slug>/ and read
// their JobPosting JSON-LD. The job page is the single source of truth.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const SITE = 'https://silverfoxdynamics.com';

function extractJsonLd(html) {
  const out = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try { out.push(JSON.parse(m[1])); } catch (e) { out.push({ __error: e.message }); }
  }
  return out;
}

function discoverJobs(now = new Date()) {
  const dir = path.join(root, 'careers');
  const jobs = [];
  for (const slug of fs.readdirSync(dir)) {
    const file = path.join(dir, slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const posting = extractJsonLd(html).find((b) => b['@type'] === 'JobPosting');
    if (!posting) continue;
    const validThrough = posting.validThrough ? new Date(posting.validThrough) : null;
    jobs.push({
      slug, file, html, posting,
      url: `${SITE}/careers/${slug}/`,
      expired: !!(validThrough && validThrough <= now),
    });
  }
  return jobs;
}

module.exports = { root, SITE, extractJsonLd, discoverJobs };
