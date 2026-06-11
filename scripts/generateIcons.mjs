// Generates the PWA PNG icons (no image deps) — a lime dumbbell on near-black.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x0a, 0x0a, 0x0a];
const ACCENT = [0xc6, 0xf4, 0x32];

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
  // filter byte 0 per row is already 0.
  const cx = w / 2;
  const cy = w / 2;
  const inset = maskable ? w * 0.18 : w * 0.06;

  for (let y = 0; y < w; y++) {
    for (let x = 0; x < w; x++) {
      px(raw, x, y, w, BG, 255);
    }
  }

  // Dumbbell: a horizontal bar + two end weights, centered, fitting inside inset.
  const half = w / 2 - inset;
  const barH = w * 0.10;
  const plateW = w * 0.12;
  const plateH = w * 0.36;
  const span = half * 0.92;

  for (let y = 0; y < w; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const inBar = Math.abs(dx) <= span && Math.abs(dy) <= barH / 2;
      const onLeftPlate =
        dx >= -span - plateW && dx <= -span + plateW && Math.abs(dy) <= plateH / 2;
      const onRightPlate =
        dx <= span + plateW && dx >= span - plateW && Math.abs(dy) <= plateH / 2;
      if (inBar || onLeftPlate || onRightPlate) px(raw, x, y, w, ACCENT, 255);
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
