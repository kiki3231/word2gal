---
name: word2gal
description: >-
  将用户自然语言文章（含角色、场景、对话）提取为可玩 HTML 视觉小说：
  网查角色通行长相与年龄神态后生成立绘与情绪差分，并按文章设定挂拟声短音。
  在用户提到 Word2Gal、同人网页视觉小说、用文字生成 galgame/视觉小说 HTML 时使用
  （适用于 Cursor / Claude Code / Trae / Codex / Kimi Code 等支持 Agent Skills 的工具）。
---

# Word2Gal

Agent Skill：用户交**一篇自然语言文章** → 可玩 HTML 视觉小说。用户侧全程自然语言，禁止要求填 JSON/标记/路径。

**按需打开单篇 `reference/*.md`，禁止无必要全文通读全部 reference。**

## 质量标准

1. **抽取成戏**：角色/场景/对话（及文中分支）→ 可玩 HTML；**原文不改写**，只可按节奏切开；须通过 `validate-coverage.mjs`（`extraction.md`）。
2. **立绘跟脸**：网查通行长相，**1～2 张对照**并锁年龄/神态后再生成；禁止臆造、小孩↔大人错画、**不串脸**；拆章须复用 `character-cards/`。
3. **情绪差分**：按文章核心情绪成色裁剪本篇 expressions（非固定五件套）。
4. **拟声短音**：文章驱动的 `voiceTag`（vocal 口技须人声 + 有据 foley）；规则见 `emotion-and-sfx.md`；禁止全文 TTS、禁止咚哐冒充口技。

## 硬约束

- 立绘：全身左右位；绿幕抠净细则见风格包 / `assets-and-bake.md`；残底不上架
- **路人/OC 画风锚**：有原作锚原作；无原作/全员 fallback → `style-packs/daily-heal/defaults/anchors/`；同篇画风 0 差异
- **不串脸**：`speaker-map.json` 或 `meta.speakerMap` 覆盖全部说话人；缺差分只回退同角色 `neutral`
- **双人舞台**：左右两位全身立绘；可用 `dialogue.side`；省略则自动分配；说话人高亮
- **生图一律自动确认**：进入制作后立绘/背景/差分全部自动执行，禁止逐张问用户
- BGM：优先级 `sad` > `happy` > `love`（判定见 `bgm.md`）
- 禁止改播放器核心 JS；只换 `__SCRIPT_JSON__` / `__ASSETS_JSON__`（及主题占位）
- 素材失败 → defaults，HTML 仍可玩；Windows 禁止无扩展名文件

## 单次容量软上限

瓶颈在抽取准确度与立绘成本；超限须说明并拆章，禁止默默硬塞。

| 项目 | 甜区 | 软上限 |
|------|------|--------|
| 正文 | 800～2500 字 | ≤5000 字/次 |
| 立绘主角 | 2～3 人 | ≤4 人/次 |
| 场景 | 1～3 | ≤5/次 |
| 差分/人 | 3～4 | ≤5/人 |
| 分支 | 0～1 二选一 | 避免深层多结局 |

低于约 400 字可做，须告知依据偏薄。

## 参考（按需单篇打开）

| 主题 | 路径 |
|------|------|
| 抽取 / 原文覆盖 | `reference/extraction.md` |
| 网查与年龄锁 | `reference/character-lookup.md` |
| 成色与拟声 | `reference/emotion-and-sfx.md` |
| BGM | `reference/bgm.md` |
| UI 主题 | `reference/ui-themes.md` |
| 角色卡 | `reference/character-card.md` |
| 剧本结构 | `reference/script-schema.md` |
| 打包 | `reference/assets-and-bake.md` |
| 风格包 | `style-packs/daily-heal/prompt.md` |
| 模板 | `templates/player-basic.html` |

## 工作流（按序，不可跳步）

### 1. 抽取

按 `extraction.md` 抽出角色/场景/对白顺序/文中选项。含糊追问 1～2 句；不补则安全默认并在摘要说明。  
**大纲复述默认跳过**；仅用户要求时再复述。

### 2. 成色 + 差分/拟声 + BGM

按 `emotion-and-sfx.md`：主成色 1 个 → `expressions` 子集（通常 3～5）→ 拟声清单（vocal/foley）。  
按 `bgm.md` 设 `meta.bgm`（`sad` > `happy` > `love`；否则可不设）。

### 3. 网查对照 → 角色卡

按 `character-card.md` / `character-lookup.md`（每个主要角色）：

1. **先读** `character-cards/<id>.json`：已有则复用 id/对照/invariants/ageBand，只更新本篇 `expressions`  
2. 无卡：蒸馏外貌/年龄学段/神态 → 联网检索 **1～2 张**对照 → 锁 `ageBand` / `demeanor` / `invariants`  
3. **立即落盘** `character-cards/<id>.json`（对照图进 `character-cards/refs/<id>/`）  
4. 查不到：文内描写 + `lookup=fallback`，交付告知  

无联网则全员 fallback 并说明。出图后核对年龄/串脸；不合格重画再 Bake。

### 4. 编译剧本 JSON

按 `script-schema.md`。`dialogue.emotion` / `voiceTag` 只能来自第 2 步清单。  
写好 `assets/speaker-map.json`（或 `meta.speakerMap`）。用户原文另存 `source.txt`。

```bash
node skills/word2gal/scripts/validate-script.mjs <script.json>
node skills/word2gal/scripts/validate-coverage.mjs <source.txt> <script.json>
```

### 5. 生成立绘/背景/拟声

- 风格包（全身立绘）+ 参考约束 + ageBand/demeanor；**自动确认连出**
- 绿幕/抠图/alpha 检查：见 `assets-and-bake.md` 与风格包 prompt
- 拟声：见 `emotion-and-sfx.md`；失败 ≤2 → defaults/静音

### 6. Bake

```bash
node skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```

仅替换占位符（主题见 `ui-themes.md`）。输出 `output/<短目录>/《作品名》.html`（作品名=`meta.title`，禁止一律 `index.html`）。

### 7. 交付确认

完成条件见 `assets-and-bake.md`「交付条件」。至少确认：覆盖校验通过、角色卡落盘无串脸、立绘抠净、speaker-map 全覆盖、成品可玩。
