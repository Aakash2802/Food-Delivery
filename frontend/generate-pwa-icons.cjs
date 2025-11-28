const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F97316;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#grad)"/>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="336" font-weight="bold" fill="white" text-anchor="middle">F</text>
</svg>`;

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  const publicDir = path.join(__dirname, 'public');

  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);

    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated: ${name} (${size}x${size})`);
  }

  console.log('\n🎉 All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
