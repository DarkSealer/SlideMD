import sharp from 'sharp';
import path from 'path';

// Generates favicon / PWA icons from the brand logo (public/logo.png).
// The logo is [icon][wordmark]; the icon is the left-most block of opaque pixels.
const publicDir = path.resolve('public');
const logoPath = path.join(publicDir, 'logo.png');
const BG = { r: 15, g: 23, b: 42, alpha: 1 }; // #0f172a, matches theme_color

async function extractIcon() {
  const { data, info } = await sharp(logoPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // A column is "empty" when it has no visible pixels. The first empty run after content ends the icon.
  const hasInk = (x) => {
    for (let y = 0; y < height; y++) if (data[(y * width + x) * 4 + 3] > 16) return true;
    return false;
  };
  let start = 0;
  while (start < width && !hasInk(start)) start++;
  let end = start;
  while (end < width && hasInk(end)) end++;

  const iconW = end - start;
  const cropped = await sharp(logoPath).extract({ left: start, top: 0, width: iconW, height }).toBuffer();
  return sharp(cropped).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 }).toBuffer();
}

async function square(icon, size, { padding = 0, background } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const resized = await sharp(icon)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png();
}

async function generate() {
  const icon = await extractIcon();

  const outputs = [
    ['pwa-512x512.png', 512, { padding: 0.04 }],
    ['pwa-192x192.png', 192, { padding: 0.04 }],
    ['apple-touch-icon.png', 180, { padding: 0.1, background: BG }],
    ['favicon.png', 64, { padding: 0.02 }],
    // Maskable icons need content inside the central 80% "safe zone"
    ['pwa-maskable-512x512.png', 512, { padding: 0.18, background: BG }],
  ];

  for (const [file, size, opts] of outputs) {
    await (await square(icon, size, opts)).toFile(path.join(publicDir, file));
    console.log(`Created public/${file}`);
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
