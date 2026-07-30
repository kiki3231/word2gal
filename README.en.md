# Word2Gal

[简体中文](./README.md) | English

> A Cursor Agent Skill that turns natural-language stories into playable HTML visual novels.

Repo: [github.com/kiki3231/word2gal](https://github.com/kiki3231/word2gal)

---

## What it is

**Word2Gal** is a Cursor Agent Skill for fanfic / doujin creators. You provide a natural-language story (characters, scenes, dialogue). The agent will:

1. Extract cast, scenes, dialogue and narration (**verbatim** where possible — no silent summarizing)
2. Look up reference looks online, then generate sprites and emotion variants
3. Attach short vocal / light foley SFX from the text, plus mood-based BGM
4. Bake a playable single-page HTML visual novel

You do **not** fill JSON, markup DSL, or asset paths.

---

## What you get

| Feature | Result |
|---------|--------|
| Playable HTML | `output/<slug>/<Title>.html` — open in a browser and click to advance |
| Sprites + backgrounds | Half-body sprites (true-alpha preferred) over scene art |
| Emotion variants | 3–5 expressions chosen from story mood (not a fixed five-pack) |
| Faithful text | Dialogue / narration split by pacing only; coverage self-check before delivery |
| SFX | Human vocalizations (laugh, sigh, …) plus evidence-based light foley (footsteps, knock, …) |
| BGM | Melancholy / cold tone → `sad`; romance → `love` (sad wins on conflict) |
| UI themes | Auto-injected from `mood` (warm daily / bittersweet / tense / hotblood / comedy) |
| Branches | Explicit in-text choices supported; deep multi-ending trees should be split by chapter |

If assets fail, defaults / silence are used so the HTML stays **playable**.

---

## Quick start

### Requirements

- [Cursor](https://cursor.com) with Agent Skills
- Node.js locally (for bake / cut / validate scripts)
- Network recommended (character reference lookup)

### Install the skill

**Option A — clone this repo**

```bash
git clone https://github.com/kiki3231/word2gal.git
cd word2gal
```

Open the folder as a Cursor workspace. The skill lives at:

```text
.cursor/skills/word2gal/
```

**Option B — copy into an existing project**

Copy `.cursor/skills/word2gal/` into your project’s `.cursor/skills/`, then open that project in Cursor.

### Install script dependencies (recommended)

```bash
cd .cursor/skills/word2gal/scripts
npm install
```

### Generate a game

In a Cursor Agent chat:

```text
Use Word2Gal to turn the following story into a playable visual novel HTML:

(paste your story here)
```

Phrases like “make a galgame / web visual novel from this text” also trigger the skill.

---

## Usage guide

### Input tips

- **Sweet spot**: ~800–2500 Chinese characters (or comparable story length); soft cap ~5000 / run
- **Leads**: 2–3 is ideal; ≤4 sprites per run
- **Scenes**: 1–3 ideal; ≤5 per run
- Make speakers, place/mood, and actions (laugh, sigh, knock, …) clear
- For longer works, **split by chapter** and reuse sprites when possible

### Agent workflow

1. **Extract** characters, scenes, beats, explicit branches  
2. **Mood + lists** for expressions, SFX (vocal / foley), and BGM  
3. **Character deep-dive** with multi-image web references and age/demeanor locks  
4. **Compile script JSON** → `validate-script.mjs`  
5. **Generate assets** (true-alpha sprites first; greenscreen cut as fallback)  
6. **Bake** into the player template → playable HTML  

### Useful commands

```bash
node .cursor/skills/word2gal/scripts/validate-script.mjs <script.json>
node .cursor/skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>
node .cursor/skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>
node .cursor/skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```

### Output

```text
output/<slug>/<Title>.html
output/<slug>/assets/
```

`output/` is gitignored.

---

## BGM (summary)

| Key | File | When |
|-----|------|------|
| `sad` | `music/sad.mp3` | Melancholy / sadness / bittersweet parting, or `mood=bittersweet` |
| `love` | `music/love.mp3` | Romance / crush / confession — when not primarily sad |

**Priority: sad > love.** See [`.cursor/skills/word2gal/reference/bgm.md`](.cursor/skills/word2gal/reference/bgm.md).

> Bundled tracks are demo assets; clear copyright before redistribution.

---

## Repository layout

```text
.cursor/skills/word2gal/
├── SKILL.md
├── reference/
├── scripts/
├── templates/
├── style-packs/daily-heal/
└── music/
docs/plans/
```

---

## Design principles

- Natural language only for users  
- Verbatim dialogue / narration (split only)  
- True-transparent sprites first; dirty plates never ship  
- Vocals must sound human — no impact SFX faking laughs/sighs  
- No full-line TTS  

Full rules: [`.cursor/skills/word2gal/SKILL.md`](.cursor/skills/word2gal/SKILL.md).

---

## License

[MIT License](./LICENSE).

---

## Contributing

Issues and PRs welcome — style packs, themes, and BGM library ideas included.
