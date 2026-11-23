#!/usr/bin/env node
/** QA: node scripts/validate-jobs.js  (exit 1 on any failure) */
const fs = require('fs');
const path = require('path');
const { root, SITE, discoverJobs, extractJsonLd } = require('./lib/jobs');

let fail = 0;
const ok = (c, msg) => { if (!c) { fail++; console.log('  FAIL', msg); } };
const careers = fs.readFileSync(path.join(root, 'careers/index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const feed = JSON.parse(fs.readFileSync(path.join(root, 'jobs.json'), 'utf8'));
const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');

ok(!/Disallow:\s*\/(careers|apply)?\/?\s*$/m.test(robots), 'robots.txt blocks careers');
ok(!extractJsonLd(careers).some((b) => JSON.stringify(b).includes('"JobPosting"')), 'careers listing must not contain JobPosting');

for (const j of discoverJobs()) {
  console.log(`${j.slug} ${j.expired ? '(EXPIRED)' : ''}`);
  const p = j.posting, h = j.html;
  const need = ['title', 'description', 'datePosted', 'employmentType', 'hiringOrganization', 'jobLocation'];
  need.forEach((k) => ok(p[k], `missing ${k}`));
  ok(p.validThrough || j.slug.includes('sales'), 'missing validThrough');
  ok(h.includes(`<link rel="canonical" href="${j.url}">`), 'canonical');
  ok(/<meta name="robots" content="index/.test(h), 'indexable');
  ok(new RegExp(`<h1[^>]*>\\s*${p.title.replace(/[()]/g, '\\$&')}\\s*</h1>`).test(h), 'h1 matches title');
  ok(h.includes('"BreadcrumbList"'), 'breadcrumb');
  ok(h.includes('href="/careers/'), 'link to careers');
  ok(/href="\/apply\/\?role=/.test(h), 'apply link');
  ok(careers.includes(`href="/careers/${j.slug}/"`), 'linked from careers');
  if (p.baseSalary) {
    const v = p.baseSalary.value;
    ok(h.includes(v.minValue.toLocaleString('en-US')) && h.includes(v.maxValue.toLocaleString('en-US')), 'salary visible on page');
  }
  if (p.validThrough) {
    const d = new Date(p.validThrough);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Karachi' });
    ok(h.includes(label), `deadline "${label}" visible`);
    ok(h.includes(`data-closing-date="${p.validThrough.slice(0, 10)}"`), 'data-closing-date matches');
  }
  ok(sitemap.includes(`<loc>${j.url}</loc>`) !== j.expired, j.expired ? 'expired job still in sitemap' : 'not in sitemap');
  ok(feed.jobs.some((x) => x.url === j.url) !== j.expired, 'feed state mismatch');
  if (j.expired) ok(!careers.includes(`href="/careers/${j.slug}/"`), 'expired job still linked as active on careers');
}
console.log(fail ? `\n${fail} failure(s)` : '\nAll checks passed');
process.exit(fail ? 1 : 0);
