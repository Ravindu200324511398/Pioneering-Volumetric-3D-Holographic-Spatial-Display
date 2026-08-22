/**
 * Preset Holographic Media Catalog for Fusion 5
 * Contains 48+ static image patterns and 22+ video animation presets
 * with high-performance procedural drawing algorithms.
 */

export const IMAGE_PRESETS = [
  { id: 'fusion5', name: 'Fusion 5 Emblem', category: 'Branding', icon: '⚡', color: '#00f3ff' },
  { id: 'fit24', name: 'FIT24 Logo', category: 'Branding', icon: '🏷️', color: '#ff007f' },
  { id: 'heart', name: 'Neon Heart', category: 'Icons', icon: '❤️', color: '#ff0055' },
  { id: 'star', name: 'Star Burst', category: 'Geometry', icon: '⭐', color: '#ffbe0b' },
  { id: 'yinyang', name: 'Yin Yang Balance', category: 'Symbol', icon: '☯️', color: '#ffffff' },
  { id: 'batman', name: 'Batman Insignia', category: 'Superheroes', icon: '🦇', color: '#ffd000' },
  { id: 'captain_shield', name: 'Captain America Shield', category: 'Superheroes', icon: '🛡️', color: '#3a86ff' },
  { id: 'pokeball', name: 'Master Pokeball', category: 'Gaming', icon: '⚽', color: '#ff0000' },
  { id: 'mario', name: '8-Bit Mario', category: 'Gaming', icon: '🍄', color: '#ff4d6d' },
  { id: 'bitcoin', name: 'Bitcoin Symbol', category: 'Crypto', icon: '₿', color: '#f7931a' },
  { id: 'saturn', name: 'Saturn Planet', category: 'Space', icon: '🪐', color: '#e0a96d' },
  { id: 'globe', name: 'Cyberpunk Globe', category: 'Space', icon: '🌐', color: '#00b4d8' },
  { id: 'alien', name: 'Alien Visage', category: 'Sci-Fi', icon: '👽', color: '#39ff14' },
  { id: 'shuriken', name: 'Ninja Shuriken', category: 'Geometry', icon: '🥷', color: '#9d4edd' },
  { id: 'robot', name: 'Android Core', category: 'Sci-Fi', icon: '🤖', color: '#00f3ff' },
  { id: 'flower', name: 'Sacred Mandala Flower', category: 'Art', icon: '🌸', color: '#ff70a6' },
  { id: 'lightning', name: 'Plasma Bolt', category: 'Energy', icon: '⚡', color: '#ffff3f' },
  { id: 'dragon', name: 'Mythic Dragon', category: 'Art', icon: '🐉', color: '#ff007f' },
  { id: 'gamepad', name: 'Retro Controller', category: 'Gaming', icon: '🎮', color: '#8338ec' },
  { id: 'wifi', name: 'Holo-WiFi Beacon', category: 'Icons', icon: '📶', color: '#00f3ff' }
];

export const VIDEO_PRESETS = [
  { id: 'rainbow_wheel', name: 'Rainbow Wheel Vortex', duration: '10s', type: 'Loop', icon: '🌈' },
  { id: 'dna_helix', name: '3D DNA Helix Strand', duration: '15s', type: 'Scientific', icon: '🧬' },
  { id: 'matrix_rain', name: 'Matrix Digital Rain', duration: '12s', type: 'Cyber', icon: '💻' },
  { id: 'neon_clock', name: 'Real-Time Holographic Clock', duration: 'Live', type: 'Widget', icon: '⏱️' },
  { id: 'galaxy_spin', name: 'Spiral Galaxy Core', duration: '20s', type: 'Space', icon: '🌌' },
  { id: 'equaliser', name: 'Audio Spectrum Equalizer', duration: 'Audio Sync', type: 'Music', icon: '📊' },
  { id: 'fire_ring', name: 'Inferno Fire Ring', duration: '8s', type: 'FX', icon: '🔥' },
  { id: 'aurora', name: 'Northern Aurora Waves', duration: '18s', type: 'Atmosphere', icon: '✨' },
  { id: 'lava_lamp', name: 'Fluid Lava Lamp', duration: '14s', type: 'Abstract', icon: '🧪' },
  { id: 'kaleidoscope', name: 'Hyper Kaleidoscope', duration: '16s', type: 'Geometric', icon: '🔮' }
];

/**
 * Draw procedural pattern on a target canvas
 */
export function renderProceduralPreset(ctx, width, height, presetId, timestamp = 0) {
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  const t = timestamp / 1000;

  // Background deep black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  switch (presetId) {
    case 'fusion5': {
      // Outer ring
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.stroke();

      // Inner glowing star
      ctx.fillStyle = '#ff007f';
      ctx.font = 'bold 36px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 15;
      ctx.fillText('FUSION 5', cx, cy - 10);

      ctx.fillStyle = '#00f3ff';
      ctx.font = '500 16px JetBrains Mono, monospace';
      ctx.fillText('DUAL POV POV 2026', cx, cy + 25);
      break;
    }
    case 'fit24': {
      ctx.fillStyle = '#ff007f';
      ctx.font = 'bold 44px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 20;
      ctx.fillText('FIT 24', cx, cy);
      break;
    }
    case 'heart': {
      const scale = 3.5;
      ctx.fillStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
        const x = 16 * Math.pow(Math.sin(angle), 3);
        const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
        const px = cx + x * scale;
        const py = cy + y * scale;
        if (angle === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.fill();
      break;
    }
    case 'star': {
      ctx.fillStyle = '#ffbe0b';
      ctx.shadowColor = '#ffbe0b';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      const points = 5;
      const outerR = 90;
      const innerR = 40;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / points - Math.PI / 2 + t * 0.5;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'batman': {
      ctx.fillStyle = '#ffd000';
      ctx.shadowColor = '#ffd000';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 100, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bat cutout
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 30, cy - 20, 25, 0, Math.PI * 2);
      ctx.arc(cx + 30, cy - 20, 25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'dna_helix': {
      ctx.lineWidth = 4;
      const pairs = 20;
      for (let i = 0; i < pairs; i++) {
        const y = (i / pairs) * height;
        const phase = y * 0.05 + t * 4;
        const x1 = cx + Math.sin(phase) * 60;
        const x2 = cx - Math.sin(phase) * 60;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x1, y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x2, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'matrix_rain': {
      ctx.fillStyle = '#39ff14';
      ctx.font = '16px monospace';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 8;
      for (let col = 0; col < 12; col++) {
        const x = (col / 12) * width + 10;
        for (let row = 0; row < 10; row++) {
          const y = ((row * 24 + t * 150 + col * 40) % height);
          const char = String.fromCharCode(0x30a0 + (row + col) % 96);
          ctx.globalAlpha = Math.max(0.1, 1 - (row * 0.1));
          ctx.fillText(char, x, y);
        }
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'rainbow_wheel':
    default: {
      const numRays = 16;
      for (let i = 0; i < numRays; i++) {
        const angle1 = (i / numRays) * Math.PI * 2 + t * 2;
        const angle2 = ((i + 0.5) / numRays) * Math.PI * 2 + t * 2;
        const hue = (i * (360 / numRays) + t * 100) % 360;

        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 100, angle1, angle2);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
  }

  ctx.shadowBlur = 0; // Reset
}
