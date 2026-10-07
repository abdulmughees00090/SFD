const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(process.cwd(), 'images');

async function processImages() {
  const files = fs.readdirSync(imagesDir);
  console.log(`Processing ${files.length} image files in /images/...`);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

    const inputPath = path.join(imagesDir, file);
    const baseName = path.basename(file, ext);
    const fileBuffer = fs.readFileSync(inputPath);

    // 1. Hero images: web-prod, erp-prod, consult-prod, mob-app-prod, ecom-prod, aiml
    if (['web-prod', 'erp-prod', 'consult-prod', 'mob-app-prod', 'ecom-prod', 'aiml'].includes(baseName)) {
      const webpPath = path.join(imagesDir, `${baseName}.webp`);
      let webpBuf = await sharp(fileBuffer)
        .resize({ width: 560, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();

      if (webpBuf.length / 1024 > 80) {
        webpBuf = await sharp(fileBuffer)
          .resize({ width: 520, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 65 })
          .toBuffer();
      }
      fs.writeFileSync(webpPath, webpBuf);

      if (ext === '.png') {
        const pngBuf = await sharp(fileBuffer)
          .resize({ width: 520, fit: 'inside', withoutEnlargement: true })
          .png({ compressionLevel: 9, quality: 55, palette: true })
          .toBuffer();
        fs.writeFileSync(inputPath, pngBuf);
      }
      console.log(`Hero image ${file}: PNG ${(fs.statSync(inputPath).size / 1024).toFixed(1)} KB, WebP ${(fs.statSync(webpPath).size / 1024).toFixed(1)} KB (target <= 80 KB)`);
    }

    // 2. Header logos: logo-light, logo1
    else if (['logo-light', 'logo1'].includes(baseName)) {
      const webpPath = path.join(imagesDir, `${baseName}.webp`);
      const webpBuf = await sharp(fileBuffer)
        .resize({ width: 360, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      fs.writeFileSync(webpPath, webpBuf);

      const pngBuf = await sharp(fileBuffer)
        .resize({ width: 360, fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9, quality: 70 })
        .toBuffer();
      fs.writeFileSync(inputPath, pngBuf);

      console.log(`Header logo ${file}: PNG ${(fs.statSync(inputPath).size / 1024).toFixed(1)} KB, WebP ${(fs.statSync(webpPath).size / 1024).toFixed(1)} KB (target <= 40 KB)`);
    }

    // 3. Client & product logos: jfc-logo, safari-logo, donotpanic-logo, logo2, anydown-logo, eos-logo, rms-logo, accra-logo, nat-logo, sieyah-logo
    else if (['jfc-logo', 'safari-logo', 'donotpanic-logo', 'logo2', 'anydown-logo', 'eos-logo', 'rms-logo', 'accra-logo', 'nat-logo', 'sieyah-logo'].includes(baseName)) {
      const webpPath = path.join(imagesDir, `${baseName}.webp`);
      const webpBuf = await sharp(fileBuffer)
        .resize({ width: 280, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();
      fs.writeFileSync(webpPath, webpBuf);

      const pngBuf = await sharp(fileBuffer)
        .resize({ width: 280, fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9, quality: 65 })
        .toBuffer();
      fs.writeFileSync(inputPath, pngBuf);

      console.log(`Client/Product logo ${file}: PNG ${(fs.statSync(inputPath).size / 1024).toFixed(1)} KB, WebP ${(fs.statSync(webpPath).size / 1024).toFixed(1)} KB (target <= 30 KB)`);
    }

    // 4. Other images (ceo, marketing-mgr, hr-mgr, dg, app-dev, e-com-dev, erp-dev, web-dev, og-image)
    else {
      const webpPath = path.join(imagesDir, `${baseName}.webp`);
      if (ext === '.jpg' || ext === '.jpeg') {
        const jpgBuf = await sharp(fileBuffer)
          .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 75 })
          .toBuffer();
        fs.writeFileSync(inputPath, jpgBuf);
      } else if (ext === '.png') {
        const webpBuf = await sharp(fileBuffer)
          .resize({ width: 560, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();
        fs.writeFileSync(webpPath, webpBuf);

        const pngBuf = await sharp(fileBuffer)
          .resize({ width: 560, fit: 'inside', withoutEnlargement: true })
          .png({ compressionLevel: 9, quality: 65 })
          .toBuffer();
        fs.writeFileSync(inputPath, pngBuf);
      }

      console.log(`Image ${file}: ${(fs.statSync(inputPath).size / 1024).toFixed(1)} KB (target <= 150 KB)`);
    }
  }

  console.log('\nImage optimization finished successfully.');
}

processImages().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
