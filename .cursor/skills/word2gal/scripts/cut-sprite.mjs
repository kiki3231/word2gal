/**
 * Sprite background removal.
 *
 * Preferred (precise): green-screen chroma
 *   node cut-sprite.mjs --mode green <in.png> <out.png>
 *   node cut-sprite.mjs --mode green --dir <folder>
 *
 * Fallback (conservative edge flood — only when image is light-gray plate):
 *   node cut-sprite.mjs --mode flood <in.png> <out.png>
 *
 * Default mode: green
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");

function isGreenScreen(r, g, b) {
  // 高绿、绿明显强于红蓝 —— 绿幕；人物衣服/皮肤通常不满足
  return g > 90 && g >= r + 35 && g >= b + 35 && g > (r + b) * 0.55;
}

function dist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function cropOpaque(png, pad = 4) {
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

function cutGreen(inputPath, outputPath) {
  const png = PNG.sync.read(fs.readFileSync(inputPath));
  const { data } = png;
  let cleared = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (isGreenScreen(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
      cleared++;
    }
  }
  // 边缘轻羽化：邻接绿幕的半透像素压透明，不伤实心身体
  const { width: w, height: h } = png;
  const idx = (x, y) => (w * y + x) << 2;
  const src = Buffer.from(data);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = idx(x, y);
      if (src[i + 3] < 8) continue;
      let greenN = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const j = idx(x + dx, y + dy);
          if (src[j + 3] < 8) greenN++;
        }
      }
      if (greenN >= 6 && isGreenScreen(src[i], src[i + 1], src[i + 2])) {
        data[i + 3] = 0;
      }
    }
  }
  const out = cropOpaque(png, 4);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(out));
  console.log(`green-cut OK: ${path.basename(outputPath)} cleared=${cleared}`);
}

function cutFloodConservative(inputPath, outputPath) {
  const png = PNG.sync.read(fs.readFileSync(inputPath));
  const { width: w, height: h, data } = png;
  const idx = (x, y) => (w * y + x) << 2;
  // 仅角落采样，低容差，单遍，禁止浅灰全局规则
  const samples = [
    [2, 2],
    [w - 3, 2],
    [2, h - 3],
    [w - 3, h - 3],
  ].map(([x, y]) => {
    const i = idx(x, y);
    return [data[i], data[i + 1], data[i + 2]];
  });
  const bg = [
    Math.round(samples.reduce((s, c) => s + c[0], 0) / 4),
    Math.round(samples.reduce((s, c) => s + c[1], 0) / 4),
    Math.round(samples.reduce((s, c) => s + c[2], 0) / 4),
  ];
  const tol = 30;
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
    if (dist(data[i], data[i + 1], data[i + 2], bg[0], bg[1], bg[2]) > tol) return;
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
  while (qh < qt) {
    const x = qx[qh];
    const y = qy[qh];
    qh++;
    data[idx(x, y) + 3] = 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }
  const out = cropOpaque(png, 4);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(out));
  console.log(`flood-cut(conservative) OK: ${path.basename(outputPath)}`);
}

function runOne(mode, input, output) {
  if (mode === "flood") cutFloodConservative(input, output);
  else cutGreen(input, output);
}

const args = process.argv.slice(2);
let mode = "green";
let rest = args;
if (args[0] === "--mode") {
  mode = args[1];
  rest = args.slice(2);
}
if (rest[0] === "--dir") {
  const dir = path.resolve(rest[1] || ".");
  for (const name of fs.readdirSync(dir)) {
    if (!/\.png$/i.test(name) || /_cut\.png$/i.test(name)) continue;
    if (/^bg_/i.test(name)) continue;
    runOne(mode, path.join(dir, name), path.join(dir, name.replace(/\.png$/i, "_cut.png")));
  }
} else if (rest.length >= 2) {
  runOne(mode, path.resolve(rest[0]), path.resolve(rest[1]));
} else {
  console.error(
    "Usage: node cut-sprite.mjs [--mode green|flood] <in.png> <out.png> | --dir <folder>",
  );
  process.exit(1);
}
