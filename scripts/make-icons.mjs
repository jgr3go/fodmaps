// Dependency-free PNG icon generator: teal rounded square with a white "leaf" mark.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x / size, y / size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}
// Rounded-square mask + a leaf: ellipse rotated 45deg, with a stem line.
function pixel(u, v) {
  const r = 0.18, cx = Math.min(Math.max(u, r), 1 - r), cy = Math.min(Math.max(v, r), 1 - r);
  const inSquare = Math.hypot(u - cx, v - cy) <= r;
  if (!inSquare) return [0, 0, 0, 0];
  const bg = [15 + 20 * v, 118 + 30 * (1 - v), 110 + 20 * u];
  const x = u - 0.5, y = v - 0.5;
  const a = (x + y) / Math.SQRT2, b = (y - x) / Math.SQRT2; // rotate 45deg
  const leaf = (a / 0.30) ** 2 + (b / 0.17) ** 2 <= 1;
  const stem = Math.abs(b) < 0.018 && a > -0.32 && a < 0.36;
  if (leaf || stem) return [255, 255, 255, 255];
  return [Math.round(bg[0]), Math.round(bg[1]), Math.round(bg[2]), 255];
}
for (const s of [192, 512]) writeFileSync(`public/icons/icon-${s}.png`, png(s, pixel));
writeFileSync('public/icons/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#0f766e"/><g transform="rotate(45 50 50)"><ellipse cx="50" cy="50" rx="30" ry="17" fill="#fff"/><rect x="18" y="48.5" width="68" height="3" fill="#fff"/></g></svg>`);
console.log('icons written');
