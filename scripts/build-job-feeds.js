#!/usr/bin/env node
/**
 * Builds the active-jobs exports and syncs job URLs in sitemap.xml.
 *   node scripts/build-job-feeds.js
 *
 * Source of truth: JobPosting JSON-LD in careers/<slug>/index.html.
 * Output: /jobs.json (JSON), /jobs.xml (RSS 2.0) - ACTIVE jobs only.
 * sitemap.xml: active job URLs are added if missing; expired job URLs are
 * removed. lastmod values are left to scripts/generate-sitemap.js (git dates).
 */
const fs = require('fs');
const path = require('path');
const { root, SITE, discoverJobs } = require('./lib/jobs');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (html) => html.replace(/<\/(p|li|h3)>/g, '. ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();

const jobs = discoverJobs();
const active = jobs.filter((j) => !j.expired);
const expired = jobs.filter((j) => j.expired);

const items = active.map(({ posting: p, url }) => ({
  id: p.identifier && p.identifier.value,
  title: p.title,
  url,
  applyUrl: `${SITE}/apply/?role=${encodeURIComponent(p.title)}`,
  datePosted: p.datePosted,
  validThrough: p.validThrough || null,
  employmentType: p.employmentType,
  company: p.hiringOrganization.name,
  locations: [].concat(p.jobLocation).map((l) => l.address),
  salary: p.baseSalary ? p.baseSalary : null,
  incentiveCompensation: p.incentiveCompensation || null,
  description: plain(p.description),
}));

fs.writeFileSync(path.join(root, 'jobs.json'), JSON.stringify({
  source: `${SITE}/careers/`, organization: 'Silver Fox Dynamics', jobs: items,
}, null, 2) + '\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Silver Fox Dynamics - Open Jobs</title>
    <link>${SITE}/careers/</link>
    <description>Currently open positions at Silver Fox Dynamics.</description>
${items.map((i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(i.url)}</link>
      <guid isPermaLink="true">${esc(i.url)}</guid>
      <pubDate>${new Date(i.datePosted).toUTCString()}</pubDate>
      <description>${esc(i.description)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(root, 'jobs.xml'), rss);

// sitemap sync
const sp = path.join(root, 'sitemap.xml');
let xml = fs.readFileSync(sp, 'utf8');
for (const j of expired) {
  xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${j.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>`), '');
}
for (const j of active) {
  if (xml.includes(`<loc>${j.url}</loc>`)) continue;
  const d = j.posting.datePosted;
  xml = xml.replace('</urlset>', `  <url>\n    <loc>${j.url}</loc>\n    <lastmod>${d}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`);
}
fs.writeFileSync(sp, xml);

console.log(`Active: ${active.map((j) => j.slug).join(', ') || 'none'}`);
if (expired.length) {
  console.warn(`EXPIRED (removed from feeds/sitemap): ${expired.map((j) => j.slug).join(', ')}`);
  console.warn('Next: remove them from careers/index.html (card + ItemList), delete the folder or add a 410 in vercel.json, then run notify-indexing.js --deleted <url>.');
}
