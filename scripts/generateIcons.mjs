// Generates the PWA PNG icons (no image deps) — the FitTrack chevron mark:
// a dark chevron on a lime tile.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const ACCENT = [0xc6, 0xf4, 0x32]; // lime tile
const INK = [0x0a, 0x0a, 0x0a]; // dark chevron

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function px(set, x, y, w, color, a = 255) {
  const i = y * (w * 4 + 1) + 1 + x * 4;
  set[i] = color[0];
  set[i + 1] = color[1];
  set[i + 2] = color[2];
  set[i + 3] = a;
}

function makePng(size, { maskable = false } = {}) {
  const w = size;
  const raw = Buffer.alloc((w * 4 + 1) * w, 0);
  // Lime tile background.
  for (let y = 0; y < w; y++) {
    for (let x = 0; x < w; x++) {
      px(raw, x, y, w, ACCENT, 255);
    }
  }

  // Dark chevron: two thick round-capped strokes forming a "^", matching logo.svg
  // (apex at 50,22; arms to 14,76 and 86,76 in a 100×100 box).
  const pad = maskable ? w * 0.2 : w * 0.1;
  const s = (w - 2 * pad) / 100; // scale from the 100-unit design box
  const ox = pad;
  const oy = pad;
  const apex = { x: ox + 50 * s, y: oy + 22 * s };
  const left = { x: ox + 14 * s, y: oy + 76 * s };
  const right = { x: ox + 86 * s, y: oy + 76 * s };
  const half = (11 * s) / 2; // stroke half-width

  const distToSeg = (px2, py2, a, b) => {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const wx = px2 - a.x;
    const wy = py2 - a.y;
    let t = (wx * vx + wy * vy) / (vx * vx + vy * vy);
    t = Math.max(0, Math.min(1, t));
    const dx = a.x + t * vx - px2;
    const dy = a.y + t * vy - py2;
    return Math.hypot(dx, dy);
  };

  for (let y = 0; y < w; y++) {
    for (let x = 0; x < w; x++) {
      const onChevron =
        distToSeg(x, y, left, apex) <= half || distToSeg(x, y, apex, right) <= half;
      if (onChevron) px(raw, x, y, w, INK, 255);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(w, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

const outDir = new URL('../public/', import.meta.url);
mkdirSync(outDir, { recursive: true });
writeFileSync(new URL('pwa-192x192.png', outDir), makePng(192));
writeFileSync(new URL('pwa-512x512.png', outDir), makePng(512));
writeFileSync(new URL('pwa-maskable-512x512.png', outDir), makePng(512, { maskable: true }));
writeFileSync(new URL('apple-touch-icon.png', outDir), makePng(180));
console.log('icons written');
