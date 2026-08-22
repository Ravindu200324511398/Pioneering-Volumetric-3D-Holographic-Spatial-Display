/**
 * Polar Converter Engine for Fusion 5 POV Hologram Fan
 * Converts standard rectangular images into 60 angular rows x 100 radial LED points
 * and exports raw RGB565 little-endian binary buffers (12,000 bytes per fan).
 */

export const POLAR_ROWS = 60; // 360 degrees / 6 deg step
export const NUM_LEDS = 100;  // 100 APA102 LEDs per blade

/**
 * Convert 24-bit RGB (r, g, b) into 16-bit RGB565 integer
 */
export function rgbToRgb565(r, g, b) {
  const r5 = (r >> 3) & 0x1f;
  const g6 = (g >> 2) & 0x3f;
  const b5 = (b >> 3) & 0x1f;
  return (r5 << 11) | (g6 << 5) | b5;
}

/**
 * Convert HTML Image / Canvas to RGB565 binary buffers for Fan 1 and Fan 2
 * @param {HTMLCanvasElement} sourceCanvas 
 * @param {Object} options Geometry options { distanceCm, overlapCm, angleOffset1, angleOffset2, isDualMode }
 */
export function processImageToPolarBinaries(sourceCanvas, options = {}) {
  const {
    distanceCm = 31,
    overlapCm = 13,
    angleOffset1 = 0,
    angleOffset2 = 0,
    isDualMode = true
  } = options;

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const ctx = sourceCanvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Buffer size: 60 rows * 100 LEDs * 2 bytes = 12,000 bytes
  const buffer1 = new Uint8Array(POLAR_ROWS * NUM_LEDS * 2);
  const buffer2 = new Uint8Array(POLAR_ROWS * NUM_LEDS * 2);

  // Sampling helper
  function getPixel(x, y) {
    const ix = Math.floor(Math.max(0, Math.min(width - 1, x)));
    const iy = Math.floor(Math.max(0, Math.min(height - 1, y)));
    const index = (iy * width + ix) * 4;
    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      a: data[index + 3]
    };
  }

  // Calculate fan centers in normalized image space [0, 1]
  // In dual 2x1 mode with overlap:
  // Fan 1 (Top) center at (width / 2, y1)
  // Fan 2 (Bottom) center at (width / 2, y2)
  const totalSpan = distanceCm + 2 * (15); // Approximate blade radius ~15cm
  const center1Y = height * (15 / totalSpan);
  const center2Y = height * ((15 + distanceCm) / totalSpan);
  const centerX = width / 2;
  const maxRadiusPx = Math.min(width, height) / 2;

  // Process Fan 1
  for (let r = 0; r < POLAR_ROWS; r++) {
    const angleDeg = (r * (360 / POLAR_ROWS)) + angleOffset1;
    const rad = (angleDeg * Math.PI) / 180;

    for (let led = 0; led < NUM_LEDS; led++) {
      const radius = (led / NUM_LEDS) * maxRadiusPx;
      const px = centerX + radius * Math.cos(rad);
      const py = center1Y + radius * Math.sin(rad);

      const color = getPixel(px, py);
      const rgb565 = rgbToRgb565(color.r, color.g, color.b);

      const byteIdx = (r * NUM_LEDS + led) * 2;
      // Little-endian
      buffer1[byteIdx] = rgb565 & 0xff;
      buffer1[byteIdx + 1] = (rgb565 >> 8) & 0xff;
    }
  }

  // Process Fan 2 (if dual mode)
  if (isDualMode) {
    for (let r = 0; r < POLAR_ROWS; r++) {
      const angleDeg = (r * (360 / POLAR_ROWS)) + angleOffset2;
      const rad = (angleDeg * Math.PI) / 180;

      for (let led = 0; led < NUM_LEDS; led++) {
        const radius = (led / NUM_LEDS) * maxRadiusPx;
        const px = centerX + radius * Math.cos(rad);
        const py = center2Y + radius * Math.sin(rad);

        const color = getPixel(px, py);
        const rgb565 = rgbToRgb565(color.r, color.g, color.b);

        const byteIdx = (r * NUM_LEDS + led) * 2;
        buffer2[byteIdx] = rgb565 & 0xff;
        buffer2[byteIdx + 1] = (rgb565 >> 8) & 0xff;
      }
    }
  }

  return {
    fan1Bin: buffer1,
    fan2Bin: buffer2,
    sizeBytes: buffer1.byteLength
  };
}

/**
 * Generate binary file download trigger in browser
 */
export function downloadBinaryFile(uint8Array, filename) {
  const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
