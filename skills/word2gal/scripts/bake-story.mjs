/**
 * Bake a playable folder with theme + assets.
 * Usage:
 *   node bake-story.mjs <script.json> <assetsDir> <outDir>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");

const THEMES = new Set([
  "warm_daily",
  "bittersweet",
  "tense",
  "hotblood",
  "comedy",
]);

const EMOTION_SUFFIXES = [
  "neutral",
  "smile",
  "laugh",
  "surprise",
  "sad",
  "cry",
  "angry",
  "tense",
  "soft_shy",
];

function resolveTheme(mood) {
  const m = String(mood || "warm_daily").trim();
  return THEMES.has(m) ? m : "warm_daily";
}

/** Windows-safe filename from work title */
function titleToFilename(title) {
  const raw = String(title || "未命名作品").trim() || "未命名作品";
  const cleaned = raw
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .slice(0, 80);
  return (cleaned || "未命名作品") + ".html";
}

function parseArgs(argv) {
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    // 兼容旧调用；advanced 已移除，一律忽略
    if (a === "--template") {
      i++;
      continue;
    }
    if (a.startsWith("--template=")) continue;
    positional.push(a);
  }
  return { positional };
}

/** Collect base char ids from keys like `umi_neutral` / `umi_smile`. */
export function collectCharIds(chars) {
  const ids = new Set();
  for (const key of Object.keys(chars || {})) {
    if (key === "default") continue;
    let base = key;
    for (const emo of EMOTION_SUFFIXES) {
      const suffix = "_" + emo;
      if (key.endsWith(suffix)) {
        base = key.slice(0, -suffix.length);
        break;
      }
    }
    if (base) ids.add(base);
  }
  return [...ids];
}

function normalizeToken(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-·•．.]+/g, "");
}

/**
 * Build speakerToId via generic inference (no hardcoded character names).
 * Priority: assets/speaker-map.json → meta.speakerMap → exact id match →
 * unique fuzzy match on id/display tokens. Unmapped speakers are warned.
 */
export function buildSpeakerToId(script, chars, fileMap) {
  const speakerToId = {};
  const fromFile =
    fileMap && typeof fileMap === "object" && !Array.isArray(fileMap)
      ? fileMap
      : {};
  Object.assign(speakerToId, fromFile);

  const metaMap =
    script.meta &&
    script.meta.speakerMap &&
    typeof script.meta.speakerMap === "object" &&
    !Array.isArray(script.meta.speakerMap)
      ? script.meta.speakerMap
      : {};
  for (const [k, v] of Object.entries(metaMap)) {
    if (speakerToId[k]) continue;
    if (typeof v === "string" && v.trim()) speakerToId[k] = v.trim();
  }

  const charIds = collectCharIds(chars);
  const idByNorm = new Map();
  for (const id of charIds) {
    idByNorm.set(normalizeToken(id), id);
  }

  const speakers = new Set();
  for (const n of script.nodes || []) {
    if (n && n.type === "dialogue" && n.speaker) speakers.add(String(n.speaker));
  }

  const warnings = [];
  for (const sp of speakers) {
    if (speakerToId[sp]) continue;

    if (charIds.includes(sp)) {
      speakerToId[sp] = sp;
      continue;
    }

    const norm = normalizeToken(sp);
    if (idByNorm.has(norm)) {
      speakerToId[sp] = idByNorm.get(norm);
      continue;
    }

    const fuzzy = charIds.filter((id) => {
      const nid = normalizeToken(id);
      return nid.includes(norm) || norm.includes(nid);
    });
    if (fuzzy.length === 1) {
      speakerToId[sp] = fuzzy[0];
      continue;
    }

    if (charIds.length === 1) {
      speakerToId[sp] = charIds[0];
      continue;
    }

    warnings.push(
      `speaker "${sp}" 未映射到立绘 id（请写 assets/speaker-map.json 或 meta.speakerMap）`,
    );
  }

  return { speakerToId, warnings };
}

function bake(scriptPath, assetsDir, outDir) {
  const script = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
  const themeId = resolveTheme(script.meta && script.meta.mood);
  const workTitle = (script.meta && script.meta.title) || "未命名作品";
  const htmlName = titleToFilename(workTitle);
  const themeCss = fs.readFileSync(
    path.join(skillRoot, "templates", "themes", themeId + ".css"),
    "utf8",
  );

  const templateFile = "player-basic.html";
  const templatePath = path.join(skillRoot, "templates", templateFile);
  if (!fs.existsSync(templatePath)) {
    throw new Error("缺少模板: " + templateFile);
  }

  const rel = (name) => "assets/" + name;
  const chars = {};
  const sfx = {};
  const bgs = {};
  for (const name of fs.readdirSync(assetsDir)) {
    const lower = name.toLowerCase();
    if (lower.endsWith("_cut.png")) {
      const key = name.replace(/_cut\.png$/i, "");
      chars[key] = rel(name);
    } else if (lower.startsWith("bg_") && lower.endsWith(".png")) {
      const key = name.replace(/^bg_/i, "").replace(/\.png$/i, "");
      bgs[key] = rel(name);
      bgs.default = bgs.default || rel(name);
    }
  }
  const sfxDir = path.join(assetsDir, "sfx");
  if (fs.existsSync(sfxDir)) {
    for (const name of fs.readdirSync(sfxDir)) {
      if (!/\.wav$/i.test(name)) continue;
      sfx[name.replace(/\.wav$/i, "")] = "assets/sfx/" + name;
    }
  }
  if (!chars.default) {
    const prefer =
      Object.keys(chars).find((k) => k.endsWith("_neutral")) ||
      Object.keys(chars)[0];
    if (prefer) chars.default = chars[prefer];
  }

  let fileMap = null;
  const mapPath = path.join(assetsDir, "speaker-map.json");
  if (fs.existsSync(mapPath)) {
    fileMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  }
  const { speakerToId, warnings } = buildSpeakerToId(script, chars, fileMap);
  for (const w of warnings) console.warn("warn: " + w);

  // Persist inferred map so Agent/复盘可改
  if (!fs.existsSync(mapPath) && Object.keys(speakerToId).length) {
    fs.writeFileSync(mapPath, JSON.stringify(speakerToId, null, 2) + "\n", "utf8");
    console.log("wrote " + mapPath);
  }

  const bgm = {};
  const bgmKey = (script.meta && script.meta.bgm) || "";
  const bgmFiles = { love: "love.mp3", sad: "sad.mp3", happy: "happy.mp3" };
  const bgmFile = bgmFiles[bgmKey];
  if (bgmFile) {
    const musicSrc = path.join(skillRoot, "music", bgmFile);
    const bgmDir = path.join(assetsDir, "bgm");
    fs.mkdirSync(bgmDir, { recursive: true });
    const dest = path.join(bgmDir, bgmFile);
    if (fs.existsSync(musicSrc)) {
      fs.copyFileSync(musicSrc, dest);
      bgm[bgmKey] = "assets/bgm/" + bgmFile;
      bgm.default = bgm[bgmKey];
    } else {
      console.warn("warn: music/" + bgmFile + " missing, skip BGM");
    }
  }

  const assets = { speakerToId, chars, bgs, sfx, bgm };

  let html = fs.readFileSync(templatePath, "utf8");
  if (html.includes("__THEME_ID__")) {
    html = html.replace("__THEME_ID__", themeId);
  }
  if (html.includes("__THEME_CSS__")) {
    html = html.replace("__THEME_CSS__", "\n" + themeCss + "\n    ");
  } else {
    throw new Error("player template missing __THEME_CSS__ placeholder");
  }
  html = html.replace("__SCRIPT_JSON__", JSON.stringify(script));
  html = html.replace("__ASSETS_JSON__", JSON.stringify(assets));
  if (
    html.includes("__THEME_CSS__") ||
    html.includes("__SCRIPT_JSON__") ||
    html.includes("__ASSETS_JSON__")
  ) {
    throw new Error("bake left unresolved placeholders");
  }

  fs.mkdirSync(outDir, { recursive: true });
  const legacy = path.join(outDir, "index.html");
  if (fs.existsSync(legacy)) fs.unlinkSync(legacy);
  const outFile = path.join(outDir, htmlName);
  fs.writeFileSync(outFile, html, "utf8");
  console.log(`baked ${outFile} theme=${themeId} title=${workTitle}`);
}

function main() {
  const { positional } = parseArgs(process.argv.slice(2));
  const [scriptPath, assetsDir, outDir] = positional;
  if (!scriptPath || !assetsDir || !outDir) {
    console.error(
      "Usage: node bake-story.mjs <script.json> <assetsDir> <outDir>",
    );
    process.exit(1);
  }
  bake(scriptPath, assetsDir, outDir);
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(path.resolve(entry)).href) {
  main();
}
