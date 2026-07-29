/**
 * Edge flood-fill background removal for character sprites.
 * Only removes background connected to image edges — never punches holes in the body.
 *
 * Usage:
 *   node cut-sprite.mjs <input.png> <output.png>
 *   node cut-sprite.mjs --dir <folder>
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function dist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function floodCut(inputPath, outputPath, tolerance = 48) {
  const raw = fs.readFileSync(inputPath);
  const png = PNG.sync.read(raw);
  const { width: w, height: h, data } = png;

  const idx = (x, y) => (w * y + x) << 2;
  const get = (x, y) => {
    const i = idx(x, y);
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };

  const samples = [
    get(2, 2),
    get(w - 3, 2),
    get(2, h - 3),
    get(w - 3, h - 3),
  ];
  const bg = [
    Math.round(samples.reduce((s, c) => s + c[0], 0) / 4),
    Math.round(samples.reduce((s, c) => s + c[1], 0) / 4),
    Math.round(samples.reduce((s, c) => s + c[2], 0) / 4),
  ];

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
    if (dist(data[i], data[i + 1], data[i + 2], bg[0], bg[1], bg[2]) > tolerance) return;
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

  // Soften edge: if a pixel is opaque but majority of neighbors are transparent bg-like, keep as is
  // (optional feather skipped for solidity)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(png));
  console.log(`flood-cut OK: ${path.basename(outputPath)}`);
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
