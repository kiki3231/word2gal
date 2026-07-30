/**
 * Sprite PNG transparency check for bake self-check.
 *
 *   node check-sprite-alpha.mjs <file.png|dir>
 *
 * Exit 0 when all checked PNGs have transparency (any alpha < 250).
 * Exit 1 and print fully-opaque paths when any fail.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");

const ALPHA_THRESHOLD = 250;

export function hasTransparency(pngBuffer) {
  const { data } = PNG.sync.read(pngBuffer);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < ALPHA_THRESHOLD) return true;
  }
  return false;
}

export function checkPaths(paths) {
  const bad = [];
  for (const filePath of paths) {
    const buf = fs.readFileSync(filePath);
    if (!hasTransparency(buf)) bad.push(filePath);
  }
  return bad;
}

function collectPngPaths(target) {
  const resolved = path.resolve(target);
  const stat = fs.statSync(resolved);

  if (stat.isFile()) {
    return [resolved];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  const names = fs.readdirSync(resolved).filter((name) => /\.png$/i.test(name));
  const cutNames = names.filter((name) => /_cut\.png$/i.test(name));
  const selected = cutNames.length > 0 ? cutNames : names;
  return selected.map((name) => path.join(resolved, name));
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node check-sprite-alpha.mjs <file.png|dir>");
    process.exit(1);
  }

  const paths = collectPngPaths(target);
  if (paths.length === 0) {
    console.error(`No PNG files to check: ${target}`);
    process.exit(1);
  }

  const bad = checkPaths(paths);
  if (bad.length > 0) {
    for (const filePath of bad) console.log(filePath);
    process.exit(1);
  }

  process.exit(0);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) main();
