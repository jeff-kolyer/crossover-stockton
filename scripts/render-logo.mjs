import { writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});

function chunk(type, data) {
  const name = Buffer.from(type);
  let crc = 0xffffffff;
  for (const b of Buffer.concat([name, data])) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  name.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 8 + data.length);
  return out;
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + u * dx), py - (ay + u * dy));
}

const rays = [
  [18, 3.5, 18, 7.5],
  [18, 28.5, 18, 32.5],
  [3.5, 18, 7.5, 18],
  [28.5, 18, 32.5, 18],
  [8, 8, 10.6, 10.6],
  [28, 8, 25.4, 10.6],
  [8, 28, 10.6, 25.4],
  [28, 28, 25.4, 25.4]
];

function png(size) {
  const pixels = Buffer.alloc(size * (1 + size * 4));
  const ink = [27, 29, 27, 255];
  const gold = [212, 160, 23, 255];
  const halfStroke = 1.45;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = (x + 0.5) * 36 / size;
      const sy = (y + 0.5) * 36 / size;
      let rgba = null;
      if (Math.hypot(sx - 18, sy - 18) <= 6.8) {
        rgba = gold;
      } else {
        for (const [ax, ay, bx, by] of rays) {
          if (distToSegment(sx, sy, ax, ay, bx, by) <= halfStroke) {
            rgba = ink;
            break;
          }
        }
      }
      if (rgba) {
        const offset = y * (1 + size * 4) + 1 + x * 4;
        for (let i = 0; i < 4; i++) pixels[offset + i] = rgba[i];
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}

for (const size of [32, 192, 512]) {
  await writeFile(`public/assets/crossover-mark-${size}.png`, png(size));
}
const favicon = png(32);
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico[6] = 32;
ico[7] = 32;
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(favicon.length, 14);
ico.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([ico, favicon]));
