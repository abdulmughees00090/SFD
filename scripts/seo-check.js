const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
let errorsCount = 0;

function error(file, msg) {
  console.error(`❌ [${file}]: ${msg}`);
  errorsCount++;
}

function scanHtmlFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.git', 'docs', 'scratch', 'scripts'].includes(file)) {
        scanHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const htmlFiles = scanHtmlFiles(rootDir);

console.log(`Starting SEO Automated Verification on ${htmlFiles.length} pages...\n`);

htmlFiles.forEach(filePath => {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');

  // 1. GA4 Check (except 404.html and apply/index.html)
  if (relPath !== '404.html' && relPath !== 'apply/index.html') {
    if (!content.includes('G-4GYKNH7Z9J')) {
      error(relPath, 'Missing GA4 tracking tag G-4GYKNH7Z9J');
    }
  }

  // 2. Canonical URL Check
  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!canonicalMatch) {
    error(relPath, 'Missing canonical URL link tag');
  } else {
    const canonicalUrl = canonicalMatch[1];
    const expectedPath = relPath === 'index.html' ? '' : relPath.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    const expectedCanonical = `https://silverfoxdynamics.com/${expectedPath}`;
    if (canonicalUrl !== expectedCanonical) {
      error(relPath, `Canonical URL "${canonicalUrl}" does not match expected "${expectedCanonical}"`);
    }
  }

  // 3. Img width and height check & <= 150 KB check
  const imgRegex = /<img\s+[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    const imgTag = imgMatch[0];
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
    const widthMatch = imgTag.match(/width=["']([^"']+)["']/i);
    const heightMatch = imgTag.match(/height=["']([^"']+)["']/i);

    if (!widthMatch || !heightMatch) {
      error(relPath, `<img> tag missing width or height: ${imgTag}`);
    }

    if (srcMatch) {
      const src = srcMatch[1];
      if (src.startsWith('/') && !src.startsWith('//')) {
        const localImgPath = path.join(rootDir, src.substring(1));
        if (!fs.existsSync(localImgPath)) {
          error(relPath, `Referenced image file does not exist: ${src}`);
        } else {
          const stats = fs.statSync(localImgPath);
          const sizeKb = stats.size / 1024;
          if (sizeKb > 150) {
            error(relPath, `Referenced image file ${src} is ${sizeKb.toFixed(1)} KB (> 150 KB limit)`);
          }
        }
      }
    }
  }

  // 4. Local href / src / og:image / schema URL check & anchor #id check
  const urlRegex = /(href|src|content|url|logo)["']:\s*["']?(\/[^"'\s>]+|https:\/\/silverfoxdynamics\.com\/[^"'\s>]+)/gi;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(content)) !== null) {
    let rawUrl = urlMatch[2];
    if (rawUrl.startsWith('https://silverfoxdynamics.com')) {
      rawUrl = rawUrl.replace('https://silverfoxdynamics.com', '');
    }
    if (!rawUrl.startsWith('/') || rawUrl.startsWith('//')) continue;

    const [urlWithQuery, hash] = rawUrl.split('#');
    const urlPath = urlWithQuery.split('?')[0];

    // Ignore assets like favicon, manifest, etc.
    if (urlPath.endsWith('.css') || urlPath.endsWith('.js') || urlPath.endsWith('.ico') || urlPath.endsWith('.json')) {
      const assetPath = path.join(rootDir, urlPath.substring(1));
      if (!fs.existsSync(assetPath)) {
        error(relPath, `Referenced asset file does not exist: ${urlPath}`);
      }
      continue;
    }

    // Check image file existence
    if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(urlPath)) {
      const imgDiskPath = path.join(rootDir, urlPath.substring(1));
      if (!fs.existsSync(imgDiskPath)) {
        error(relPath, `Referenced image file does not exist: ${urlPath}`);
      }
      continue;
    }

    // Check HTML target file existence
    let targetFilePath;
    if (urlPath === '/' || urlPath === '') {
      targetFilePath = path.join(rootDir, 'index.html');
    } else if (urlPath.endsWith('/')) {
      targetFilePath = path.join(rootDir, urlPath.substring(1), 'index.html');
    } else {
      targetFilePath = path.join(rootDir, urlPath.substring(1));
      if (!fs.existsSync(targetFilePath) && fs.existsSync(targetFilePath + '.html')) {
        targetFilePath = targetFilePath + '.html';
      }
    }

    if (!fs.existsSync(targetFilePath)) {
      error(relPath, `Referenced internal page link does not exist: ${urlPath}`);
    } else if (hash) {
      const targetContent = fs.readFileSync(targetFilePath, 'utf8');
      const idRegex = new RegExp(`id=["']${hash}["']`, 'i');
      if (!idRegex.test(targetContent)) {
        error(relPath, `Referenced anchor #${hash} does not exist on target page: ${urlPath || relPath}`);
      }
    }
  }

  // 5. FAQPage Schema vs Visible Text Check
  const faqSchemaMatches = content.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi) || [];
  faqSchemaMatches.forEach(scriptTag => {
    if (scriptTag.includes('"FAQPage"')) {
      const jsonText = scriptTag.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
      try {
        const schema = JSON.parse(jsonText);
        const mainEntity = schema.mainEntity || [];
        mainEntity.forEach(q => {
          const qName = q.name.trim();
          const aText = (q.acceptedAnswer && q.acceptedAnswer.text) ? q.acceptedAnswer.text.trim() : '';

          // Strip HTML tags and normalize whitespace for matching
          const cleanContent = content
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ');

          const cleanQ = qName.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
          const cleanA = aText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
          
          if (!cleanContent.includes(cleanQ)) {
            error(relPath, `FAQPage question "${qName}" is not visible on page`);
          }
          if (cleanA && !cleanContent.includes(cleanA)) {
            error(relPath, `FAQPage answer for "${qName}" is not visible on page`);
          }
        });
      } catch (e) {
        error(relPath, `Invalid JSON in FAQPage schema: ${e.message}`);
      }
    }
  });
});

console.log(`\n========================================`);
if (errorsCount === 0) {
  console.log(`✅ SEO CHECK PASSED: 0 errors across all ${htmlFiles.length} pages.`);
  process.exit(0);
} else {
  console.error(`❌ SEO CHECK FAILED: ${errorsCount} errors found.`);
  process.exit(1);
}
