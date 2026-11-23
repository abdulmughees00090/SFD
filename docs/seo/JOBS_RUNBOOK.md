# Jobs SEO runbook

Source of truth: JobPosting JSON-LD in `careers/<slug>/index.html`.

## Add a job
1. Copy an existing `careers/<slug>/` page; update every visible field and the JSON-LD together.
2. Add a card + ItemList entry in `careers/index.html` (no JobPosting there).
3. `node scripts/build-job-feeds.js && node scripts/validate-jobs.js`
4. Commit, then `node scripts/generate-sitemap.js` (git-based lastmod), commit, push.
5. After deploy: `node scripts/notify-indexing.js --send`

## Close / fill a job
1. Remove its card and ItemList entry from `careers/index.html` and other "Other open roles" lists.
2. Delete `careers/<slug>/` and add a 410 in `vercel.json` (or set `validThrough` in the past if keeping a clearly marked closed page).
3. `node scripts/build-job-feeds.js` (drops it from sitemap/jobs.json/jobs.xml), push.
4. After deploy returns 404/410: `node scripts/notify-indexing.js --send --deleted https://silverfoxdynamics.com/careers/<slug>/`

Jobs whose `validThrough` has passed are dropped from feeds/sitemap automatically on the next build; rebuild after each deadline (Junior APEX: 2026-12-01, Senior APEX: 2026-12-20).

## Credentials (never commit)
- IndexNow: public key file `f3dfe24845974c508e6a73ef5fe29997.txt` is already in the site root.
- Google Indexing API: create a service account in Google Cloud, enable "Web Search Indexing API", add its email as Owner in Search Console, then
  `$env:GOOGLE_SERVICE_ACCOUNT_JSON="C:\secure\sa.json"; node scripts/notify-indexing.js --send`
