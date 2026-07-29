/**
 * Bake a playable folder with theme + assets.
 * Usage:
 *   node bake-story.mjs <script.json> <assetsDir> <outDir>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");

const THEMES = new Set([
  "warm_daily",
  "bittersweet",
  "tense",
  "hotblood",
  "comedy",
]);

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

function bake(scriptPath, assetsDir, outDir) {
  const script = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
  const themeId = resolveTheme(script.meta && script.meta.mood);
  const workTitle = (script.meta && script.meta.title) || "未命名作品";
  const htmlName = titleToFilename(workTitle);
  const themeCss = fs.readFileSync(
    path.join(skillRoot, "templates", "themes", themeId + ".css"),
    "utf8",
  );

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
    const first = Object.keys(chars)[0];
    if (first) chars.default = chars[first];
  }

  // speaker map heuristic from script
  const speakerToId = {};
  for (const n of script.nodes || []) {
    if (n.type === "dialogue" && n.speaker) {
      const sp = n.speaker;
      if (!speakerToId[sp]) {
        // match char keys prefix
        const hit = Object.keys(chars).find((k) => k.startsWith("umiri") && sp.includes("海"))
          || Object.keys(chars).find((k) => k.startsWith("taki") && sp.includes("立"));
        // fallback: leave for caller; common CN names
        if (sp === "海铃") speakerToId[sp] = "umiri";
        else if (sp === "立希") speakerToId[sp] = "taki";
      }
    }
  }
  if (!speakerToId["海铃"] && chars.umiri_neutral) speakerToId["海铃"] = "umiri";
  if (!speakerToId["立希"] && chars.taki_neutral) speakerToId["立希"] = "taki";

  const assets = { speakerToId, chars, bgs, sfx };

  let html = fs.readFileSync(path.join(skillRoot, "templates", "player-basic.html"), "utf8");
  if (html.includes("__THEME_ID__")) {
    html = html.replace("__THEME_ID__", themeId);
  }
  if (!html.includes("__THEME_CSS__")) {
    throw new Error("player template missing __THEME_CSS__ placeholder");
  }
  html = html.replace("__THEME_CSS__", "\n" + themeCss + "\n    ");
  html = html.replace("__SCRIPT_JSON__", JSON.stringify(script));
  html = html.replace("__ASSETS_JSON__", JSON.stringify(assets));
  if (html.includes("__THEME_CSS__") || html.includes("__SCRIPT_JSON__")) {
    throw new Error("bake left unresolved placeholders");
  }

  fs.mkdirSync(outDir, { recursive: true });
  // 清理旧版 index.html，避免和作品名文件并存混淆
  const legacy = path.join(outDir, "index.html");
  if (fs.existsSync(legacy)) fs.unlinkSync(legacy);
  const outFile = path.join(outDir, htmlName);
  fs.writeFileSync(outFile, html, "utf8");
  console.log(`baked ${outFile} theme=${themeId} title=${workTitle}`);
}

const [scriptPath, assetsDir, outDir] = process.argv.slice(2);
if (!scriptPath || !assetsDir || !outDir) {
  console.error("Usage: node bake-story.mjs <script.json> <assetsDir> <outDir>");
  process.exit(1);
}
bake(scriptPath, assetsDir, outDir);
