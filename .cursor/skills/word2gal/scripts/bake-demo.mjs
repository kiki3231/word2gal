/**
 * Bake a playable demo folder with relative assets (Windows-friendly).
 * Usage: node .cursor/skills/word2gal/scripts/bake-demo.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(skillRoot, "../../..");
const demoAssets = path.join(skillRoot, "assets", "demo");
const outDir = path.join(repoRoot, "output", "playable");
const outAssets = path.join(outDir, "assets");

fs.mkdirSync(outAssets, { recursive: true });
fs.mkdirSync(path.join(outAssets, "sfx"), { recursive: true });

function copy(src, dest) {
  fs.copyFileSync(src, dest);
}

const files = {
  "you_neutral.png": "you_neutral_cut.png",
  "you_surprise.png": "you_surprise_cut.png",
  "rin_neutral.png": "rin_neutral_cut.png",
  "bg_music_room.png": "bg_music_room.png",
};

for (const [outName, srcName] of Object.entries(files)) {
  copy(path.join(demoAssets, srcName), path.join(outAssets, outName));
}

for (const name of ["gasp", "surprised", "soft_affirm", "sigh", "soft_laugh", "angry_huff"]) {
  copy(path.join(demoAssets, "sfx", name + ".wav"), path.join(outAssets, "sfx", name + ".wav"));
}

const script = JSON.parse(
  fs.readFileSync(path.join(skillRoot, "scripts", "fixtures", "valid-script.json"), "utf8")
);

const assets = {
  speakerToId: { 小悠: "you", 阿凛: "rin" },
  chars: {
    default: "assets/you_neutral.png",
    you_neutral: "assets/you_neutral.png",
    you_surprise: "assets/you_surprise.png",
    rin_neutral: "assets/rin_neutral.png",
  },
  bgs: {
    default: "assets/bg_music_room.png",
    music_room: "assets/bg_music_room.png",
  },
  sfx: {
    gasp: "assets/sfx/gasp.wav",
    surprised: "assets/sfx/surprised.wav",
    soft_affirm: "assets/sfx/soft_affirm.wav",
    sigh: "assets/sfx/sigh.wav",
    soft_laugh: "assets/sfx/soft_laugh.wav",
    angry_huff: "assets/sfx/angry_huff.wav",
  },
};

let html = fs.readFileSync(path.join(skillRoot, "templates", "player-basic.html"), "utf8");
html = html.replace("__SCRIPT_JSON__", JSON.stringify(script));
html = html.replace("__ASSETS_JSON__", JSON.stringify(assets));
fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");

fs.writeFileSync(
  path.join(skillRoot, "scripts", "fixtures", "demo-embed.json"),
  JSON.stringify({ script, assets }, null, 2),
  "utf8"
);

console.log("Wrote", path.join(outDir, "index.html"));
