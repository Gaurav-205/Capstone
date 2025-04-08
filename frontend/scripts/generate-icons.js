const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_LOGO = path.join(__dirname, '../src/assets/logo.png');
const PUBLIC_DIR = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    // Generate favicon.ico (multi-size)
    await sharp(SOURCE_LOGO)
      .resize(16, 16)
      .toFile(path.join(PUBLIC_DIR, 'favicon-16.png'));
    await sharp(SOURCE_LOGO)
      .resize(32, 32)
      .toFile(path.join(PUBLIC_DIR, 'favicon-32.png'));
    await sharp(SOURCE_LOGO)
      .resize(48, 48)
      .toFile(path.join(PUBLIC_DIR, 'favicon-48.png'));

    // Generate PWA icons
    await sharp(SOURCE_LOGO)
      .resize(192, 192)
      .toFile(path.join(PUBLIC_DIR, 'logo192.png'));
    await sharp(SOURCE_LOGO)
      .resize(512, 512)
      .toFile(path.join(PUBLIC_DIR, 'logo512.png'));

    // Generate Open Graph image
    await sharp(SOURCE_LOGO)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(path.join(PUBLIC_DIR, 'og-image.png'));

    console.log('✅ Icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons(); 