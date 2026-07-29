/**
 * Edge flood-fill background removal for character sprites.
 * Multi-pass + light-gray detection; crops to opaque bounds.
 *
 * Usage:
 *   node cut-sprite.mjs <input.png> <output.png>
 *   node cut-sprite.mjs --dir <folder>
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");

function dist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function isLightGrayish(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  // 亮且低饱和：典型 AI 浅灰底 / 白边
  return lum >= 165 && chroma <= 28;
}

function isBg(r, g, b, a, bg, tolerance) {
  if (a < 8) return true;
  if (dist(r, g, b, bg[0], bg[1], bg[2]) <= tolerance) return true;
  if (isLightGrayish(r, g, b) && dist(r, g, b, bg[0], bg[1], bg[2]) <= tolerance + 36) {
    return true;
  }
  return false;
}

function sampleBorderBg(data, w, h) {
  const idx = (x, y) => (w * y + x) << 2;
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const take = (x, y) => {
    const i = idx(x, y);
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n++;
  };
  for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 40))) {
    take(x, 0);
    take(x, h - 1);
  }
  for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 40))) {
    take(0, y);
    take(w - 1, y);
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

function floodOnce(data, w, h, bg, tolerance) {
  const idx = (x, y) => (w * y + x) << 2;
  const visited = new Uint8Array(w * h);
  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);
  let qh = 0;
  let qt = 0;

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const vi = y * w + x;
    if (visited[vi]) return;
    const i = idx(x, y);
    if (!isBg(data[i], data[i + 1], data[i + 2], data[i + 3], bg, tolerance)) return;
    visited[vi] = 1;
    qx[qt] = x;
    qy[qt] = y;
    qt++;
  };

  for (let x = 0; x < w; x++) {
    tryPush(x, 0);
    tryPush(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryPush(0, y);
    tryPush(w - 1, y);
  }

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (qh < qt) {
    const x = qx[qh];
    const y = qy[qh];
    qh++;
    const i = idx(x, y);
    data[i + 3] = 0;
    for (const [dx, dy] of dirs) tryPush(x + dx, y + dy);
  }
}

function despeckleBg(data, w, h, bg, tolerance) {
  const idx = (x, y) => (w * y + x) << 2;
  const copy = Buffer.from(data);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = idx(x, y);
      if (copy[i + 3] < 8) continue;
      if (!isBg(copy[i], copy[i + 1], copy[i + 2], copy[i + 3], bg, tolerance + 20)) continue;
      let trans = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const j = idx(x + dx, y + dy);
          if (copy[j + 3] < 8) trans++;
        }
      }
      // 周围多为已抠空，且自身像灰底 → 清掉毛边
      if (trans >= 5) data[i + 3] = 0;
    }
  }
}

function cropOpaque(png, pad = 8) {
  const { width: w, height: h, data } = png;
  const idx = (x, y) => (w * y + x) << 2;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[idx(x, y) + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return png;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const nw = maxX - minX + 1;
  const nh = maxY - minY + 1;
  const out = new PNG({ width: nw, height: nh });
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const si = idx(minX + x, minY + y);
      const di = (nw * y + x) << 2;
      out.data[di] = data[si];
      out.data[di + 1] = data[si + 1];
      out.data[di + 2] = data[si + 2];
      out.data[di + 3] = data[si + 3];
    }
  }
  return out;
}

function floodCut(inputPath, outputPath) {
  const raw = fs.readFileSync(inputPath);
  const png = PNG.sync.read(raw);
  const { width: w, height: h, data } = png;
  const bg = sampleBorderBg(data, w, h);

  // 多遍递增容差，把残留灰边啃干净，仍只从边缘连通
  for (const tol of [52, 68, 84, 98]) {
    floodOnce(data, w, h, bg, tol);
  }
  despeckleBg(data, w, h, bg, 72);

  const cropped = cropOpaque(png, 6);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(cropped));
  console.log(`flood-cut OK: ${path.basename(outputPath)} (bg≈${bg.join(",")})`);
}

const args = process.argv.slice(2);
if (args[0] === "--dir") {
  const dir = path.resolve(args[1] || ".");
  for (const name of fs.readdirSync(dir)) {
    if (!/\.png$/i.test(name) || /_cut\.png$/i.test(name)) continue;
    if (/^bg_/i.test(name)) continue;
    floodCut(path.join(dir, name), path.join(dir, name.replace(/\.png$/i, "_cut.png")));
  }
} else if (args.length >= 2) {
  floodCut(path.resolve(args[0]), path.resolve(args[1]));
} else {
  console.error("Usage: node cut-sprite.mjs <in.png> <out.png> | --dir <folder>");
  process.exit(1);
}
