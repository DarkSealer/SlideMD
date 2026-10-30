import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Standard SlideCraft icon (512x512)
const svgStandard = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Base Rounded Container -->
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#bgGrad)" />

  <!-- Inner Screen / Presentation Canvas -->
  <rect x="80" y="96" width="352" height="240" rx="28" fill="url(#screenGrad)" filter="url(#shadow)" stroke="#818cf8" stroke-width="4" stroke-opacity="0.5" />

  <!-- Slide Screen Elements: Header bar -->
  <rect x="116" y="136" width="130" height="18" rx="9" fill="#f8fafc" />
  <rect x="116" y="166" width="80" height="10" rx="5" fill="#94a3b8" />

  <!-- Mini Chart / Diagram inside slide -->
  <rect x="116" y="240" width="36" height="52" rx="6" fill="#6366f1" />
  <rect x="168" y="208" width="36" height="84" rx="6" fill="url(#barGrad)" />
  <rect x="220" y="224" width="36" height="68" rx="6" fill="#a855f7" />

  <!-- Markdown Symbol 'M' inside slide -->
  <path d="M340 180 L356 204 L372 180 M340 180 V216 M372 180 V216" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M388 198 L398 208 L408 198 M398 186 V208" stroke="#a855f7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Screen Stand / Projector Base -->
  <path d="M256 336 L256 390" stroke="#f8fafc" stroke-width="14" stroke-linecap="round" />
  <path d="M196 410 L256 390 L316 410" stroke="#f8fafc" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

// Maskable Icon with 15% safe zone margin
const svgMaskable = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3730a3" />
      <stop offset="40%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#7e22ce" />
    </linearGradient>
    <linearGradient id="screenGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="barGradMask" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable (safe from Android circular cropping) -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Content scaled within safe-zone (circle r=192 around center 256,256) -->
  <g transform="translate(46, 46) scale(0.82)">
    <!-- Inner Screen -->
    <rect x="80" y="96" width="352" height="240" rx="28" fill="url(#screenGradMask)" stroke="#818cf8" stroke-width="6" stroke-opacity="0.6" />

    <!-- Slide Screen Elements: Header bar -->
    <rect x="116" y="136" width="130" height="18" rx="9" fill="#f8fafc" />
    <rect x="116" y="166" width="80" height="10" rx="5" fill="#94a3b8" />

    <!-- Mini Chart / Diagram inside slide -->
    <rect x="116" y="240" width="36" height="52" rx="6" fill="#6366f1" />
    <rect x="168" y="208" width="36" height="84" rx="6" fill="url(#barGradMask)" />
    <rect x="220" y="224" width="36" height="68" rx="6" fill="#a855f7" />

    <!-- Markdown Symbol 'M' inside slide -->
    <path d="M340 180 L356 204 L372 180 M340 180 V216 M372 180 V216" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M388 198 L398 208 L408 198 M398 186 V208" stroke="#a855f7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Screen Stand / Projector Base -->
    <path d="M256 336 L256 390" stroke="#f8fafc" stroke-width="14" stroke-linecap="round" />
    <path d="M196 410 L256 390 L316 410" stroke="#f8fafc" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>
`;

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write public/icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgStandard.trim());
  console.log('Created public/icon.svg');

  // 2. Generate PNGs using Sharp
  const stdBuffer = Buffer.from(svgStandard);
  const maskBuffer = Buffer.from(svgMaskable);

  await sharp(stdBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created public/pwa-512x512.png');

  await sharp(stdBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created public/pwa-192x192.png');

  await sharp(stdBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created public/apple-touch-icon.png');

  await sharp(stdBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created public/favicon.png');

  await sharp(maskBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created public/pwa-maskable-512x512.png');

  console.log('All PWA icons successfully generated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
