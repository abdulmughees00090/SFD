const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = 'f:/silver-fox-dynamics-website-AG';
const { chromium } = require(path.join(rootDir, 'node_modules/playwright'));

// Static HTTP server
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  let filePath = path.join(rootDir, reqUrl);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

const urls = [
  '/',
  '/services/',
  '/markets/pakistan/',
  '/resources/',
  '/products/'
];

async function run() {
  await new Promise((resolve) => server.listen(8081, resolve));
  console.log('Logo verification server running on http://localhost:8081');

  const browser = await chromium.launch();
  let failures = 0;

  for (const urlPath of urls) {
    for (const width of [1440, 375]) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width, height: width === 1440 ? 900 : 812 }
        });
        const page = await context.newPage();

        const targetUrl = `http://localhost:8081${urlPath}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle' });

        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.classList.add('dark-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('sfd_theme', 'dark');
          });
          await page.waitForTimeout(200);
        } else {
          await page.evaluate(() => {
            document.documentElement.classList.remove('dark-theme');
            document.body.classList.remove('dark-theme');
            localStorage.setItem('sfd_theme', 'light');
          });
          await page.waitForTimeout(200);
        }

        // Check logo visibility and dimensions
        const logoMetrics = await page.evaluate(() => {
          // Find visible header logo img element
          const logos = Array.from(document.querySelectorAll('header .header-logo, header img'));
          let visibleLogo = null;

          for (const logo of logos) {
            const rect = logo.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(logo);
            const parentWrap = logo.closest('.header-logo-light-wrap');

            let parentVisible = true;
            if (parentWrap) {
              const parentStyle = window.getComputedStyle(parentWrap);
              if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
                parentVisible = false;
              }
            }

            if (parentVisible && computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && rect.width > 0 && rect.height > 0) {
              visibleLogo = {
                src: logo.src,
                width: rect.width,
                height: rect.height
              };
              break;
            }
          }
          return visibleLogo;
        });

        if (logoMetrics && logoMetrics.width > 0 && logoMetrics.height > 0) {
          console.log(`✅ LOGO OK [${urlPath}] (${width}px, ${theme}): ${logoMetrics.width}x${logoMetrics.height}px -> ${path.basename(logoMetrics.src)}`);
        } else {
          console.error(`❌ LOGO FAILED [${urlPath}] (${width}px, ${theme}): No visible header logo with width > 0!`);
          failures++;
        }

        await context.close();
      }
    }
  }

  await browser.close();
  server.close();

  if (failures > 0) {
    console.error(`\n❌ HEADER LOGO VERIFICATION FAILED with ${failures} error(s).`);
    process.exit(1);
  } else {
    console.log(`\n========================================`);
    console.log(`✅ HEADER LOGO CHECK PASSED: Header logo is visible across all URLs, themes, and viewports.`);
    console.log(`========================================\n`);
  }
}

run().catch(err => {
  console.error('Error during header logo check:', err);
  server.close();
  process.exit(1);
});
