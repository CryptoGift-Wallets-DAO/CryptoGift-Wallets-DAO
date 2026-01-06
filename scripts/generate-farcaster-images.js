/**
 * Generate Farcaster Marketing Images
 *
 * Creates:
 * 1. Preview Image (1200x800) - For feed previews
 * 2. Hero Image (1200x630) - For app store banner
 * 3. OG Image (1200x630) - For social sharing
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Brand colors
const BRAND_BG = '#1a1a2e';
const BRAND_ACCENT = '#6366f1'; // Indigo accent

// Paths
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const LOGO_PATH = path.join(PUBLIC_DIR, 'farcaster-icon-1024.png');

// Text overlay as SVG (since sharp doesn't support text directly)
function createTextSVG(text, fontSize, color = '#ffffff') {
  return Buffer.from(`
    <svg width="1200" height="200">
      <text
        x="600"
        y="100"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${color}"
        text-anchor="middle"
        dominant-baseline="middle"
      >${text}</text>
    </svg>
  `);
}

async function generatePreviewImage() {
  console.log('📸 Generating Preview Image (1200x800)...');

  // Create background
  const background = await sharp({
    create: {
      width: 1200,
      height: 800,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 1 } // #1a1a2e
    }
  }).png().toBuffer();

  // Resize logo to fit nicely (400px)
  const logo = await sharp(LOGO_PATH)
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Title SVG
  const titleSVG = createTextSVG('CryptoGift DAO', 64);

  // Tagline SVG
  const taglineSVG = Buffer.from(`
    <svg width="1200" height="60">
      <text x="600" y="30" font-family="Arial, sans-serif" font-size="28" fill="#a5b4fc" text-anchor="middle" dominant-baseline="middle">Learn. Earn. Co-govern.</text>
    </svg>
  `);

  // Composite everything
  await sharp(background)
    .composite([
      { input: logo, top: 120, left: 400 },
      { input: titleSVG, top: 550, left: 0 },
      { input: taglineSVG, top: 650, left: 0 }
    ])
    .toFile(path.join(PUBLIC_DIR, 'farcaster-preview-1200x800.png'));

  console.log('✅ Preview Image created');
}

async function generateHeroImage() {
  console.log('🎨 Generating Hero Image (1200x630)...');

  // Create gradient-like background with solid color
  const background = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 1 }
    }
  }).png().toBuffer();

  // Resize logo (300px for hero)
  const logo = await sharp(LOGO_PATH)
    .resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Title
  const titleSVG = createTextSVG('CryptoGift DAO', 56);

  // Subtitle
  const subtitleSVG = Buffer.from(`
    <svg width="1200" height="50">
      <text x="600" y="25" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle">Complete tasks • Earn CGC tokens • Join the DAO</text>
    </svg>
  `);

  // Base network badge
  const badgeSVG = Buffer.from(`
    <svg width="200" height="40">
      <rect x="0" y="0" width="200" height="40" rx="20" fill="#3b82f6"/>
      <text x="100" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">🔵 Built on Base</text>
    </svg>
  `);

  await sharp(background)
    .composite([
      { input: logo, top: 100, left: 460 },
      { input: titleSVG, top: 400, left: 0 },
      { input: subtitleSVG, top: 500, left: 0 },
      { input: badgeSVG, top: 560, left: 500 }
    ])
    .toFile(path.join(PUBLIC_DIR, 'farcaster-hero-1200x630.png'));

  console.log('✅ Hero Image created');
}

async function generateOGImage() {
  console.log('🌐 Generating OG Image (1200x630)...');

  // Similar to hero but optimized for social sharing
  const background = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 1 }
    }
  }).png().toBuffer();

  // Larger logo for social (350px)
  const logo = await sharp(LOGO_PATH)
    .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Big title for social
  const titleSVG = createTextSVG('CryptoGift DAO', 72);

  // Call to action
  const ctaSVG = Buffer.from(`
    <svg width="1200" height="50">
      <text x="600" y="25" font-family="Arial, sans-serif" font-size="28" fill="#a5b4fc" text-anchor="middle">Earn CGC by completing tasks 🎯</text>
    </svg>
  `);

  await sharp(background)
    .composite([
      { input: logo, top: 80, left: 440 },
      { input: titleSVG, top: 420, left: 0 },
      { input: ctaSVG, top: 530, left: 0 }
    ])
    .toFile(path.join(PUBLIC_DIR, 'farcaster-og-1200x630.png'));

  console.log('✅ OG Image created');
}

async function main() {
  console.log('\n🚀 Generating Farcaster Marketing Images\n');
  console.log('Brand Background: ' + BRAND_BG);
  console.log('Logo Source: ' + LOGO_PATH);
  console.log('');

  // Verify logo exists
  if (!fs.existsSync(LOGO_PATH)) {
    console.error('❌ Logo not found at:', LOGO_PATH);
    process.exit(1);
  }

  try {
    await generatePreviewImage();
    await generateHeroImage();
    await generateOGImage();

    console.log('\n✨ All images generated successfully!\n');
    console.log('Output files:');
    console.log('  📸 public/farcaster-preview-1200x800.png (Preview Image)');
    console.log('  🎨 public/farcaster-hero-1200x630.png (Hero Image)');
    console.log('  🌐 public/farcaster-og-1200x630.png (OG/Social Image)');
    console.log('\n📝 Remember to add these to .vercelignore whitelist!');
  } catch (error) {
    console.error('❌ Error generating images:', error);
    process.exit(1);
  }
}

main();
