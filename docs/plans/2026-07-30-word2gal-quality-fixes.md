# Word2Gal 质量三项改进 实施计划

> **给 Claude：** 必须使用 `superpowers:executing-plans` 或 `superpowers:subagent-driven-development` 子技能，按任务逐项执行本计划。Steps 使用 checkbox（`- [ ]`）跟踪。

**目标：** 把立绘「真透明优先」、拟声「口技+轻环境音」、剧本「原文保真+覆盖自检」写进 Word2Gal Skill，并与抠图/校验脚本对齐。

**架构方案：** 不改播放器核心 JS；更新 `SKILL.md` 与 reference/风格包；新增轻量立绘 alpha 抽检脚本；`cut-sprite` 明确为回退路径。拟声与原文覆盖以文档硬约束 + 交付自检为主。

**技术栈：** Markdown Skill 文档、Node.js（`pngjs`，与现有 `cut-sprite.mjs` 一致）

**设计依据：** @docs/plans/2026-07-30-word2gal-quality-fixes-design.md  
**Skill 入口：** @.cursor/skills/word2gal/SKILL.md

## 全局约束

- 不对白全文 TTS；禁止改播放器核心 JS（只替换占位符）
- 生图一律自动确认
- Windows：只写带扩展名文件
- 用户未要求前不 git commit（计划中的 commit 步骤仅在用户明确要求提交时执行）

## 文件职责地图

| 文件 | 职责 |
|------|------|
| `.cursor/skills/word2gal/SKILL.md` | 验收标准、硬约束、工作流第 5/7 步 |
| `.cursor/skills/word2gal/style-packs/daily-heal/prompt.md` | 立绘生图默认/回退提示 |
| `.cursor/skills/word2gal/reference/assets-and-bake.md` | Bake 前资源顺序与自检 |
| `.cursor/skills/word2gal/reference/emotion-and-sfx.md` | vocal/foley 清单与生成模板 |
| `.cursor/skills/word2gal/reference/extraction.md` | 原文保真与覆盖自检步骤 |
| `.cursor/skills/word2gal/scripts/cut-sprite.mjs` | 注释与用法：回退专用 |
| `.cursor/skills/word2gal/scripts/check-sprite-alpha.mjs` | 新建：抽检 PNG 是否含透明像素 |
| `.cursor/skills/word2gal/scripts/check-sprite-alpha.test.mjs` | 新建：alpha 抽检单测 |

---

### 任务 1：立绘 alpha 抽检脚本（TDD）

**涉及文件：**
- 新建：`.cursor/skills/word2gal/scripts/check-sprite-alpha.mjs`
- 新建：`.cursor/skills/word2gal/scripts/check-sprite-alpha.test.mjs`
- 新建（测试夹具，可在测试里用 pngjs 内存写临时文件）：测试临时目录即可，勿提交无扩展名文件

**接口：**
- Consumes：无
- Produces：
  - `hasTransparency(pngBuffer: Buffer): boolean`（或内部函数）
  - CLI：`node check-sprite-alpha.mjs <file.png|dir>` → 全不透明则 exit 1；有透明像素则 exit 0；打印不合格文件路径

- [ ] **Step 1：写失败测试**

创建 `.cursor/skills/word2gal/scripts/check-sprite-alpha.test.mjs`：

```js
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
```

- [ ] **Step 2：运行测试，确认先失败**

```bash
node .cursor/skills/word2gal/scripts/check-sprite-alpha.test.mjs
```

预期：**FAIL**（模块不存在或未导出）

- [ ] **Step 3：最小实现**

创建 `.cursor/skills/word2gal/scripts/check-sprite-alpha.mjs`：

```js
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");

export function hasTransparency(buf) {
  const png = PNG.sync.read(buf);
  for (let i = 3; i < png.data.length; i += 4) {
    if (png.data[i] < 250) return true;
  }
  return false;
}

export function checkPaths(paths) {
  const bad = [];
  for (const p of paths) {
    if (!hasTransparency(fs.readFileSync(p))) bad.push(p);
  }
  return bad;
}

function collectPngs(target) {
  const st = fs.statSync(target);
  if (st.isDirectory()) {
    return fs
      .readdirSync(target)
      .filter((n) => /\.png$/i.test(n))
      .map((n) => path.join(target, n));
  }
  return [target];
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
// Windows: prefer:
const invoked = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("check-sprite-alpha.mjs");
if (invoked && process.argv[2]) {
  const files = collectPngs(process.argv[2]).filter((f) => /_cut\.png$/i.test(f) || !fs.statSync(process.argv[2]).isDirectory() || true);
  // Prefer checking *_cut.png when scanning a dir:
  const st = fs.statSync(process.argv[2]);
  const list = st.isDirectory()
    ? collectPngs(process.argv[2]).filter((f) => /_cut\.png$/i.test(f) || collectPngs(process.argv[2]).every((x) => !/_cut\.png$/i.test(x)) && true)
    : collectPngs(process.argv[2]);
  // Simpler rule for implementer:
  // - file: check that file
  // - dir: if any *_cut.png exist, only those; else all png
  let targets;
  if (st.isDirectory()) {
    const all = collectPngs(process.argv[2]);
    const cuts = all.filter((f) => /_cut\.png$/i.test(f));
    targets = cuts.length ? cuts : all;
  } else {
    targets = [process.argv[2]];
  }
  const bad = checkPaths(targets);
  if (bad.length) {
    console.error("No transparency detected:\n" + bad.join("\n"));
    process.exit(1);
  }
  console.log(`OK: ${targets.length} sprite(s) have transparency`);
}
```

实现时请把 CLI 分支写成清晰版本（避免上面注释里的冗余三元），逻辑固定为：

- 目录：优先只检 `*_cut.png`；若无 cut 则检全部 `.png`
- 单文件：检该文件
- 存在任一「几乎全不透明」（所有 alpha ≥ 250）→ exit 1

- [ ] **Step 4：再跑测试，确认通过**

```bash
node .cursor/skills/word2gal/scripts/check-sprite-alpha.test.mjs
node .cursor/skills/word2gal/scripts/check-sprite-alpha.mjs <某透明png>
```

预期：测试 **PASS**；CLI 对透明图 exit 0

- [ ] **Step 5：提交（仅当用户要求 commit 时）**

```bash
git add .cursor/skills/word2gal/scripts/check-sprite-alpha.mjs .cursor/skills/word2gal/scripts/check-sprite-alpha.test.mjs
git commit -m "feat(word2gal): add sprite alpha transparency check"
```

---

### 任务 2：风格包改为「真透明优先」

**涉及文件：**
- 修改：`.cursor/skills/word2gal/style-packs/daily-heal/prompt.md`（全文结构调整）

**接口：**
- Consumes：任务 1 的 `check-sprite-alpha.mjs`
- Produces：Agent 生图时两套提示骨架（default / greenscreen fallback）

- [ ] **Step 1：重写「为什么不用透明底」为「优先路径 + 回退」**

将原「强制绿幕」章节替换为等价内容（实现时写入文件，勿留 TBD）：

```markdown
## 立绘背景策略（真透明优先）

**默认路径（优先）：** 生成无场景底板的半身立绘，争取工具直接输出**真 alpha 透明 PNG**。  
正提示强调：isolated character, plain empty backdrop, no scenery；**禁止**写 checkerboard / checkered pattern / alpha preview。  
若工具支持透明输出且结果无棋盘格像素 → 可直接使用（或轻量整理后命名 `*_cut.png`），并跑 alpha 抽检。

**回退路径：** 若出现实心底、灰白底、或棋盘格假透明 → **不要**用脏图上架。改为：
1. 用绿幕正提示重生（`#00FF00`）
2. `node scripts/cut-sprite.mjs --mode green --dir <dir>`
3. 再跑 `node scripts/check-sprite-alpha.mjs <dir>`

**上架门槛：** 游戏中立绘后必须直接透出场景；残绿/灰白底板/棋盘格 → 禁止 Bake，重做。
```

- [ ] **Step 2：提供两套正提示骨架**

Default（优先）：

```
anime style, visual novel character portrait, bust shot half body,
clean lineart, soft lighting,
isolated character on empty plain backdrop, no scenery, no floor,
looking at viewer, consistent character design,
matching reference appearance closely,
{age_phrase}, {hair}, {eyes} eyes, wearing {outfit}, {vibe},
demeanor: {demeanor}, expression: {emotion_phrase}
```

Greenscreen fallback：保留现有绿幕骨架（`solid pure chroma key green background #00FF00`…）。

负提示：

- 默认路径：保留 `checkerboard, checkered pattern, alpha preview, scenery, floor shadow plate`；**不要**把 `transparent background` 当作必须负向（避免模型画假透明示意即可用「no checkerboard」表达）
- 绿幕回退：保留现有负提示中的 transparent/checkerboard 禁止项

- [ ] **Step 3：抠图章节改为「回退时必做」**

写明：默认透明合格可跳过抠图；回退绿幕后必做 green cut；flood 仅浅灰底急救；禁止对已干净透明图反复洪水。

- [ ] **Step 4：人工核对**

打开该 md，确认不再出现「一律必须绿幕」的绝对表述（回退段落除外）。

- [ ] **Step 5：提交（仅当用户要求）**

```bash
git add .cursor/skills/word2gal/style-packs/daily-heal/prompt.md
git commit -m "docs(word2gal): prefer transparent sprites with greenscreen fallback"
```

---

### 任务 3：拟声文档 — vocal + foley

**涉及文件：**
- 修改：`.cursor/skills/word2gal/reference/emotion-and-sfx.md` 的 `## C. 拟声短音` 及之后

**接口：**
- Consumes：无 schema 变更；`voiceTag` 仍为 string
- Produces：Agent 内部清单字段约定 `kind: "vocal" | "foley"`

- [ ] **Step 1：重写 C 节为两类音**

替换/扩充为包含下表与规则（原文写入文件）：

**vocal（口技，文中有笑/叹/哭/惊等必须挂）：**

| voiceTag | 依据 |
|----------|------|
| `soft_laugh` / `laugh` | 笑 |
| `cry_sniff` / `sob` | 哭、哽咽 |
| `angry_huff` | 生气、啐 |
| `surprised` / `gasp` | 震惊、倒吸气 |
| `sigh` | 叹气 |
| `soft_affirm` | 「嗯」等轻应 |

**foley（轻环境音，须有原文动作/场面依据）：**

| voiceTag | 依据 |
|----------|------|
| `footsteps` | 脚步 |
| `knock` | 敲门 |
| `door_open` / `door_close` | 门开合 |
| `cloth_rustle` | 衣料轻响 |

**硬规则：**

1. 文写笑/叹 → 必须 `vocal`，禁止用咚/哐/撞击顶替  
2. foley 短、轻、不抢对白；无依据不挂  
3. 禁止无依据堆砌打击乐、轰鸣、UI 点击把整篇做成机械咚哐  
4. 仍禁止对白 TTS  
5. 生成提示：
   - vocal：`human vocalization, mouth sound only, short {desc}, no music, no percussion, no impact hit`
   - foley：`soft short foley, {desc}, quiet, no music, no heavy explosion`
6. 交付摘要：每个 voiceTag 注明 kind + 原文依据句；口技听感像打击乐 → 重做或静音

- [ ] **Step 2：更新 D 节交付摘要句**

改为：`成色=…；差分=…；拟声(vocal)=…；拟声(foley)=…`

- [ ] **Step 3：通读确认与 SKILL 验收第 4 条不冲突**

SKILL 第 4 条将在任务 5 同步放宽为「口技 + 有据轻环境音」。

- [ ] **Step 4：提交（仅当用户要求）**

```bash
git add .cursor/skills/word2gal/reference/emotion-and-sfx.md
git commit -m "docs(word2gal): split sfx into vocal and light foley"
```

---

### 任务 4：抽取文档 — 覆盖自检

**涉及文件：**
- 修改：`.cursor/skills/word2gal/reference/extraction.md`

- [ ] **Step 1：在「文本保真」下增加覆盖自检步骤**

追加：

```markdown
## 原文覆盖自检（交付前强制）

1. 从用户原文选取覆盖面足够的关键句：至少包含全部对白句，以及推动情节的旁白/内心独白句（短文可近乎全覆盖；长文按幕选取，但不得故意跳过对话）。
2. 对每一句，在剧本 `nodes[].text`（narration/dialogue）中查找是否为原文切片（允许作为更长 `text` 的子串，或完整等于切开后的一段）。
3. 任一关键句找不到 → 补节点或修正 `text` 后再 Bake；**禁止**用改写句「意思接近」蒙混。
4. 交付摘要必须写明：「原文未删减，仅按节奏切开；覆盖自检已通过」。
5. 触及软上限时：拆章分次生成，**禁止**用摘要浓缩规避。
```

- [ ] **Step 2：强化准确度规则第 2 条**

确保写明：`text` 必须能在原文中找到对应句子/段落（子串或整段切开）。

- [ ] **Step 3：提交（仅当用户要求）**

```bash
git add .cursor/skills/word2gal/reference/extraction.md
git commit -m "docs(word2gal): require source-text coverage self-check"
```

---

### 任务 5：对齐 SKILL.md + assets-and-bake + cut-sprite 注释

**涉及文件：**
- 修改：`.cursor/skills/word2gal/SKILL.md`
- 修改：`.cursor/skills/word2gal/reference/assets-and-bake.md`
- 修改：`.cursor/skills/word2gal/scripts/cut-sprite.mjs`（文件头注释 1–15 行，保持与行为一致）

- [ ] **Step 1：改 SKILL 验收标准第 4 条与硬约束**

- 第 4 条改为：拟声以文章为依据；**口技**（笑/叹等）必须为人声；允许文中有据的轻环境音（脚步/敲门等）；禁止用打击/机械咚哐冒充口技；禁止全文 TTS。  
- 硬约束增加：立绘真透明优先；绿幕抠图仅回退；残底不上架。  
- 已有「对白/旁白用原文」保留，并指向覆盖自检。

- [ ] **Step 2：改工作流第 5 步生图/拟声说明**

替换「立绘生图用纯绿幕…必须 cut」为：

1. 优先按风格包默认路径出真透明  
2. 不合格 → 绿幕 + `cut-sprite --mode green`  
3. `check-sprite-alpha.mjs` 抽检  
4. 拟声按 vocal/foley 清单生成  

推荐命令块更新为：

```bash
node .cursor/skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>   # 仅回退需要时
node .cursor/skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>
node .cursor/skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```

- [ ] **Step 3：改第 7 步自检清单**

增加/改写勾选项：

- [ ] 立绘真透明（或绿幕回退抠净）；`check-sprite-alpha` 通过；无残底  
- [ ] 文中笑/叹等已挂 vocal；foley 均有原文依据；无口技被咚哐顶替  
- [ ] 原文覆盖自检通过；未删减浓缩  

- [ ] **Step 4：改 assets-and-bake.md 生成顺序**

顺序改为：透明优先生图 →（必要时）抠图 → alpha 抽检 → 拟声 vocal/foley → 背景 → BGM → Bake。自检清单同步。

- [ ] **Step 5：更新 cut-sprite.mjs 文件头**

明确：

```
 * Sprite background removal (fallback only).
 * Prefer true-transparent sprite generation first.
 * Use greenscreen + this script only when the model returned a solid/fake plate.
```

- [ ] **Step 6：通读三文件，消除「一律绿幕必抠」与新策略矛盾**

- [ ] **Step 7：提交（仅当用户要求）**

```bash
git add .cursor/skills/word2gal/SKILL.md .cursor/skills/word2gal/reference/assets-and-bake.md .cursor/skills/word2gal/scripts/cut-sprite.mjs
git commit -m "docs(word2gal): align skill workflow with transparent-first and sfx/fidelity rules"
```

---

### 任务 6：端到端核对（无新功能则只做文档/脚本验证）

**涉及文件：** 无新文件；验证既有产物

- [ ] **Step 1：跑 alpha 测试**

```bash
node .cursor/skills/word2gal/scripts/check-sprite-alpha.test.mjs
```

预期：PASS

- [ ] **Step 2：全文检索冲突措辞**

```bash
rg -n "一律|必须.*绿幕|禁止.*transparent|只要笑声" .cursor/skills/word2gal
```

预期：无未解释的「一律绿幕」；transparent 禁止仅出现在绿幕回退负提示语境；拟声不再写成「只要笑声…」而排除有据 foley。

- [ ] **Step 3：对照设计文档三条成功标准，勾选完成**

打开 @docs/plans/2026-07-30-word2gal-quality-fixes-design.md，确认任务 1–5 已覆盖立绘/拟声/剧本三点。

- [ ] **Step 4：向用户汇报变更文件列表与如何在下次生成中生效**

说明：下次走 Word2Gal 工作流即自动遵循；无需改用户文章格式。

---

## 验证方式

| 检查项 | 命令/方法 |
|--------|-----------|
| alpha 脚本 | `node .../check-sprite-alpha.test.mjs` |
| 文档一致性 | `rg` 冲突措辞 + 人工读 SKILL 第 5/7 步 |
| 设计覆盖 | 设计文档三条 ↔ 任务 2/3/4/5 |

## 风险与注意事项

- 文生图仍可能画棋盘格：文档必须把回退写清楚，避免 Agent 强行「禁止抠图」。  
- 不在本计划改 `validate-script.mjs` 的 voiceTag 枚举（保持开放字符串）。  
- 不预置 wav 素材库（用户已选现场按规则生成）。

## 规格覆盖自检（计划作者）

| 设计要求 | 任务 |
|----------|------|
| 真透明优先 + 绿幕回退 + 不上架残底 | 任务 1、2、5 |
| vocal + 有据 foley；禁止咚哐冒充口技 | 任务 3、5 |
| 原文保真 + 覆盖自检；禁摘要规避上限 | 任务 4、5 |
| 轻量脚本自检 | 任务 1 |
