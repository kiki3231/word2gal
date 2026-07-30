# Word2Gal

English | [简体中文](./README.md)

> A natural-language-driven visual novel Skill — turn a fanfic / story draft into a playable HTML galgame in the browser.

Repo: [github.com/kiki3231/word2gal](https://github.com/kiki3231/word2gal)

---

## What it is

**Word2Gal** is a Cursor [Agent Skill](https://cursor.com). You provide one natural-language story (characters, scenes, dialogue), and the agent will:

1. Extract characters / scenes / dialogue & narration (**keep source wording**; no silent summarization)
2. Look up common character appearances online, then generate sprites and emotion variants
3. Attach short vocal / light foley cues from the text, and pick BGM by tone
4. Bake a single-page playable HTML (near-fullscreen stage)

You do **not** fill JSON, markup DSLs, or asset paths.

---

## What you get

| Capability | Result |
|------------|--------|
| Playable HTML | `output/<slug>/<Title>.html` — open in a browser and click to advance |
| Sprites + backgrounds | Bust portraits (true-alpha preferred) over scene art |
| Emotion variants | 3–5 expressions trimmed to the story mood (not a fixed five-pack) |
| Faithful script | Dialogue / narration / inner monologue split by pacing; coverage self-check before delivery |
| SFX | Human vocalizations (laugh, sigh, …) + evidence-based light foley (footsteps, knock, …) |
| BGM | Melancholy / cold tone → `sad`; sweet romance → `love` (`sad` wins if both) |
| UI themes | Injected from `mood` (warm daily / bittersweet / tense / hotblood / comedy) |
| Branches | Explicit either-or choices in the text; deep multi-ending trees should be split by chapter |

If assets fail, defaults / silence are used, but the HTML must still be **playable**.

---

## Quick start

### 1. Requirements

- [Cursor](https://cursor.com) with Agent Skills
- Local Node.js (bake / cut / validate scripts)
- Network recommended (multi-image character lookup)

### 2. Install the Skill

**Option A — use this repo**

```bash
git clone https://github.com/kiki3231/word2gal.git
cd word2gal
```

Open the folder as a Cursor workspace. The Skill lives at:

```text
.cursor/skills/word2gal/
```

**Option B — copy into an existing project**

Copy the whole `.cursor/skills/word2gal/` directory into your project's `.cursor/skills/`, then open that project in Cursor.

### 3. Install script dependencies (recommended)

Sprite cut / alpha check need `pngjs`:

```bash
cd .cursor/skills/word2gal/scripts
npm install
```

### 4. Generate

In a Cursor Agent chat, ask in natural language and paste your story, e.g.:

```text
Use Word2Gal to turn the following into a playable visual-novel HTML:

(paste your story here)
```

Phrases like “make a galgame / fanfic web VN” also trigger the Skill.

---

## How to use

### Input tips

- **Sweet spot**: ~800–2500 characters (CJK) / words of story length; soft cap ~5000 per run
- **Leads**: 2–3 characters is best; ≤4 sprite leads per run
- **Scenes**: 1–3; ≤5 per run
- Make speakers, places, mood, and actions (laugh, sigh, knock, …) clear
- Longer works: **split by chapter**, reuse existing sprites when possible

### Agent workflow

1. **Extract** characters, scenes, beats, in-text branches
2. **Mood & lists** — pick `mood`, expression set, vocal/foley tags, BGM
3. **Character deep-dive** — web multi-image check; lock age band & demeanor before drawing
4. **Compile script JSON** → `validate-script.mjs`
5. **Generate assets** — sprites (true alpha first, greenscreen cut as fallback), backgrounds, short SFX
6. **Bake** into the player template → playable HTML

### Useful commands

```bash
# Validate script
node .cursor/skills/word2gal/scripts/validate-script.mjs <script.json>

# Greenscreen cut (sprite fallback only)
node .cursor/skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>

# Alpha check (flags fully opaque plates; not a fringe-free proof)
node .cursor/skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>

# Bake
node .cursor/skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```

### Output layout

```text
output/<slug>/<Title>.html
output/<slug>/assets/   # sprites, backgrounds, sfx, bgm
```

`output/` is gitignored by default.

---

## BGM (summary)

| Key | File | When |
|-----|------|------|
| `sad` | `music/sad.mp3` | Melancholy / sad / heartbroken / bittersweet parting, or `mood=bittersweet` |
| `love` | `music/love.mp3` | Romance / crush / confession / heartbeat — and not mainly melancholy |

**Priority: `sad` > `love`.** Details: [`.cursor/skills/word2gal/reference/bgm.md`](.cursor/skills/word2gal/reference/bgm.md).

> Bundled tracks are demo assets; clear rights before redistributing.

---

## Layout

```text
.cursor/skills/word2gal/
├── SKILL.md                 # Skill entry (acceptance + workflow)
├── reference/               # Extraction, cast, emotion/SFX, BGM, bake
├── scripts/                 # validate / cut-sprite / check-alpha / bake
├── templates/               # Player HTML + mood CSS
├── style-packs/daily-heal/  # Sprite prompts + defaults
└── music/                   # Bundled BGM (sad / love)
```

---

## Design principles

- **Natural language only** for users — no forms
- **Faithful text** — no rewrite/compression of dialogue/narration; split by pacing only
- **True-alpha sprites first** — greenscreen cut is fallback; dirty plates must not ship
- **SFX follows the text** — vocals must sound human; no impact SFX posing as laughs/sighs
- **No full-dialogue TTS**

Full rules: [`.cursor/skills/word2gal/SKILL.md`](.cursor/skills/word2gal/SKILL.md).

---

## License

[MIT License](./LICENSE)

---

## Contributing

Issues and PRs welcome — style packs, themes, and BGM library ideas included.
