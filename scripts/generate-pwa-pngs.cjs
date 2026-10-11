const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function createIconPNG(size, paddingFactor = 0.2) {
  const png = new PNG({ width: size, height: size });
  const bg = [10, 10, 10, 255]; // #0A0A0A
  const fg = [255, 255, 255, 255]; // #FFFFFF

  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = bg[0];
      png.data[idx + 1] = bg[1];
      png.data[idx + 2] = bg[2];
      png.data[idx + 3] = bg[3];
    }
  }

  // Draw clean geometric M letter
  // Bounding box for M:
  const pad = Math.floor(size * paddingFactor);
  const left = pad;
  const right = size - pad;
  const top = pad;
  const bottom = size - pad;
  const stemWidth = Math.max(2, Math.floor(size * 0.08));
  const midX = Math.floor(size / 2);
  const midY = Math.floor(size * 0.58);

  const setPixel = (x, y) => {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = (size * y + x) << 2;
      png.data[idx] = fg[0];
      png.data[idx + 1] = fg[1];
      png.data[idx + 2] = fg[2];
      png.data[idx + 3] = fg[3];
    }
  };

  // Left vertical stem
  for (let y = top; y <= bottom; y++) {
    for (let w = 0; w < stemWidth; w++) {
      setPixel(left + w, y);
    }
  }

  // Right vertical stem
  for (let y = top; y <= bottom; y++) {
    for (let w = 0; w < stemWidth; w++) {
      setPixel(right - w, y);
    }
  }

  // Left diagonal (from (left + stemWidth, top) to (midX, midY))
  const leftDiagSteps = Math.max(1, midX - (left + stemWidth));
  for (let i = 0; i <= leftDiagSteps; i++) {
    const t = i / leftDiagSteps;
    const cx = Math.round(left + stemWidth + t * (midX - (left + stemWidth)));
    const cy = Math.round(top + t * (midY - top));
    for (let dy = -Math.floor(stemWidth / 2); dy <= Math.floor(stemWidth / 2); dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        setPixel(cx + dx, cy + dy);
      }
    }
  }

  // Right diagonal (from (midX, midY) to (right - stemWidth, top))
  const rightDiagSteps = Math.max(1, (right - stemWidth) - midX);
  for (let i = 0; i <= rightDiagSteps; i++) {
    const t = i / rightDiagSteps;
    const cx = Math.round(midX + t * ((right - stemWidth) - midX));
    const cy = Math.round(midY - t * (midY - top));
    for (let dy = -Math.floor(stemWidth / 2); dy <= Math.floor(stemWidth / 2); dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        setPixel(cx + dx, cy + dy);
      }
    }
  }

  return png;
}

const publicDir = path.resolve(__dirname, '../public');

// 192x192
const png192 = createIconPNG(192, 0.22);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), PNG.sync.write(png192));

// 512x512 standard
const png512 = createIconPNG(512, 0.22);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), PNG.sync.write(png512));

// 512x512 maskable (extra padding safe zone)
const pngMaskable = createIconPNG(512, 0.28);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), PNG.sync.write(pngMaskable));

// apple-touch-icon.png (180x180)
const pngApple = createIconPNG(180, 0.2);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), PNG.sync.write(pngApple));

console.log('PWA PNG icons generated successfully.');
