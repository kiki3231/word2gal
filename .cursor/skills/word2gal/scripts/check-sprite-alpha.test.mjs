import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { hasTransparency, checkPaths } from "./check-sprite-alpha.mjs";

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");

function writePng(file, { w, h, fill }) {
  const png = new PNG({ width: w, height: h });
  for (let i = 0; i < w * h; i++) {
    const o = i << 2;
    png.data[o] = fill[0];
    png.data[o + 1] = fill[1];
    png.data[o + 2] = fill[2];
    png.data[o + 3] = fill[3];
  }
  fs.writeFileSync(file, PNG.sync.write(png));
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "w2g-alpha-"));
const opaque = path.join(tmp, "opaque.png");
const clear = path.join(tmp, "clear.png");
writePng(opaque, { w: 4, h: 4, fill: [10, 20, 30, 255] });
writePng(clear, { w: 4, h: 4, fill: [10, 20, 30, 0] });

assert.equal(hasTransparency(fs.readFileSync(opaque)), false);
assert.equal(hasTransparency(fs.readFileSync(clear)), true);

const bad = checkPaths([opaque, clear]);
assert.deepEqual(bad, [opaque]);

console.log("check-sprite-alpha.test.mjs: PASS");
