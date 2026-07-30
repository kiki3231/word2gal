/**
 * Sprite background removal (fallback only).
 * Prefer true-transparent sprite generation first.
 * Use greenscreen + this script only when the model returned a solid/fake plate.
 *
 * Green plate leftovers:
 *   node cut-sprite.mjs --mode green <in.png> <out.png>
 *
 * Light plate (edge flood + clear enclosed bg islands + despill):
 *   node cut-sprite.mjs --mode flood <in.png> <out.png>
 *   node cut-sprite.mjs --mode flood --dir <folder>
 *
 * Default mode: green
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");

function isGreenScreen(r, g, b) {
  return g > 90 && g >= r + 35 && g >= b + 35 && g > (r + b) * 0.55;
}

function dist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function chroma(r, g, b) {
  return Math.max(r, g, b) - Math.min(r, g, b);
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

function sampleBorderBg(data, w, h) {
  const idx = (x, y) => (w * y + x) << 2;
  const lumas = [];
  const push = (x, y) => {
    const i = idx(x, y);
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    lumas.push({ r, g, b, L: (r + g + b) / 3 });
  };
  for (let x = 0; x < w; x += Math.max(1, (w / 64) | 0)) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y += Math.max(1, (h / 64) | 0)) {
    push(0, y);
    push(w - 1, y);
  }
  lumas.sort((a, b) => b.L - a.L);
  const top = lumas.slice(0, Math.max(8, (lumas.length * 0.35) | 0));
  return [
    Math.round(top.reduce((s, c) => s + c.r, 0) / top.length),
    Math.round(top.reduce((s, c) => s + c.g, 0) / top.length),
    Math.round(top.reduce((s, c) => s + c.b, 0) / top.length),
  ];
}

function isBgLike(r, g, b, bg, tol) {
  // 只认「接近采样底板色」；禁止用高亮低彩度误伤白衣/皮肤高光
  return dist(r, g, b, bg[0], bg[1], bg[2]) <= tol;
}

function floodFromSeeds(data, w, h, bg, tol, seeds) {
  const idx = (x, y) => (w * y + x) << 2;
  const visited = new Uint8Array(w * h);
  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);
  let qh = 0;
  let qt = 0;
  let cleared = 0;
  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const vi = y * w + x;
    if (visited[vi]) return;
    const i = idx(x, y);
    if (data[i + 3] < 8) {
      visited[vi] = 1;
      return;
    }
    if (!isBgLike(data[i], data[i + 1], data[i + 2], bg, tol)) return;
    visited[vi] = 1;
    qx[qt] = x;
    qy[qt] = y;
    qt++;
  };
  for (const [x, y] of seeds) tryPush(x, y);
  while (qh < qt) {
    const x = qx[qh];
    const y = qy[qh];
    qh++;
    data[idx(x, y) + 3] = 0;
    cleared++;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }
  return cleared;
}

/** 仅清除头发缝里接近纯白的小封闭岛 */
function clearPureWhiteHoles(data, w, h, bg) {
  const idx = (x, y) => (w * y + x) << 2;
  const seen = new Uint8Array(w * h);
  const maxHole = 900;
  const bgL = (bg[0] + bg[1] + bg[2]) / 3;
  let cleared = 0;
  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);

  const isPurePlate = (r, g, b) => {
    const L = (r + g + b) / 3;
    return L >= bgL - 10 && chroma(r, g, b) <= 6 && dist(r, g, b, bg[0], bg[1], bg[2]) <= 18;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const vi0 = y * w + x;
      if (seen[vi0]) continue;
      const i0 = idx(x, y);
      if (data[i0 + 3] < 8) {
        seen[vi0] = 1;
        continue;
      }
      if (!isPurePlate(data[i0], data[i0 + 1], data[i0 + 2])) continue;

      let qh = 0;
      let qt = 0;
      qx[qt] = x;
      qy[qt] = y;
      qt++;
      seen[vi0] = 1;
      const comp = [];
      let touchesBorder = false;

      while (qh < qt) {
        const cx = qx[qh];
        const cy = qy[qh];
        qh++;
        comp.push(cx, cy);
        if (cx === 0 || cy === 0 || cx === w - 1 || cy === h - 1) touchesBorder = true;
        for (const [nx, ny] of [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ]) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const vi = ny * w + nx;
          if (seen[vi]) continue;
          const i = idx(nx, ny);
          if (data[i + 3] < 8) {
            seen[vi] = 1;
            continue;
          }
          if (!isPurePlate(data[i], data[i + 1], data[i + 2])) continue;
          seen[vi] = 1;
          qx[qt] = nx;
          qy[qt] = ny;
          qt++;
        }
      }

      const area = comp.length / 2;
      if (!touchesBorder && area > 0 && area <= maxHole) {
        for (let k = 0; k < comp.length; k += 2) {
          data[idx(comp[k], comp[k + 1]) + 3] = 0;
          cleared++;
        }
      }
    }
  }
  return cleared;
}

/** 清除被头发等围住的小块底板岛（保留函数供调试；主流程改用 clearPureWhiteHoles） */
function clearEnclosedBgIslands(data, w, h, bg, tol) {
  return clearPureWhiteHoles(data, w, h, bg);
}

/** 邻接透明的浅色毛边压透（严格：必须像底板，避免吃白衣） */
function despillHalo(data, w, h, bg, tol) {
  const idx = (x, y) => (w * y + x) << 2;
  const src = Buffer.from(data);
  let cleared = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = idx(x, y);
      if (src[i + 3] < 8) continue;
      let tN = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          if (src[idx(x + dx, y + dy) + 3] < 8) tN++;
        }
      }
      if (tN < 4) continue;
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];
      if (dist(r, g, b, bg[0], bg[1], bg[2]) <= tol) {
        data[i + 3] = 0;
        cleared++;
      }
    }
  }
  return cleared;
}

function isNearGreen(r, g, b) {
  return g > 70 && g >= r + 20 && g >= b + 20;
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
  const { width: w, height: h } = png;
  const idx = (x, y) => (w * y + x) << 2;
  // 邻接透明的近绿毛边压透（去绿边，避免发丝白/绿晕）
  let halo = 0;
  for (let pass = 0; pass < 2; pass++) {
    const src = Buffer.from(data);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = idx(x, y);
        if (src[i + 3] < 8) continue;
        let tN = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            if (src[idx(x + dx, y + dy) + 3] < 8) tN++;
          }
        }
        if (tN < 3) continue;
        const r = src[i];
        const g = src[i + 1];
        const b = src[i + 2];
        if (isGreenScreen(r, g, b) || (tN >= 4 && isNearGreen(r, g, b))) {
          data[i + 3] = 0;
          halo++;
        } else if (tN >= 5 && g > r + 15 && g > b + 15) {
          // 轻去溢绿：压低绿色通道再半透明
          data[i + 1] = Math.min(g, Math.max(r, b) + 8);
          data[i + 3] = Math.min(data[i + 3], 160);
        }
      }
    }
  }
  const out = cropOpaque(png, 4);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(out));
  console.log(`green-cut OK: ${path.basename(outputPath)} cleared=${cleared} halo=${halo}`);
}

function cutFloodClean(inputPath, outputPath) {
  const png = PNG.sync.read(fs.readFileSync(inputPath));
  const { width: w, height: h, data } = png;
  const bg = sampleBorderBg(data, w, h);
  const bgL = (bg[0] + bg[1] + bg[2]) / 3;
  // 近白底板必须低压容差，否则会沿着缝啃进皮肤高光/白衣
  const tol = bgL >= 240 ? 22 : bgL >= 200 ? 28 : 32;

  const seeds = [];
  for (let x = 0; x < w; x++) {
    seeds.push([x, 0], [x, h - 1]);
  }
  for (let y = 0; y < h; y++) {
    seeds.push([0, y], [w - 1, y]);
  }

  const edgeCleared = floodFromSeeds(data, w, h, bg, tol, seeds);
  // 第二遍：只清「几乎纯白、很小」的封闭岛（头发缝），不动白衣大色块
  const islandCleared = clearPureWhiteHoles(data, w, h, bg);
  const haloCleared = despillHalo(data, w, h, bg, tol);

  const out = cropOpaque(png, 4);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(out));
  console.log(
    `flood-cut OK: ${path.basename(outputPath)} bg=${bg.join(",")} tol=${tol} edge=${edgeCleared} island=${islandCleared} halo=${haloCleared}`,
  );
}

function runOne(mode, input, output) {
  if (mode === "green") cutGreen(input, output);
  else cutFloodClean(input, output);
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
    "Usage: node cut-sprite.mjs [--mode flood|green] <in.png> <out.png> | --dir <folder>",
  );
  process.exit(1);
}
