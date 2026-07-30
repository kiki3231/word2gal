---
name: word2gal
description: >-
  将用户自然语言文章（含角色、场景、对话）提取为可玩 HTML 视觉小说：
  多图对照网查角色通行长相与年龄神态后生成立绘与情绪差分，并按文章设定挂拟声短音。
  在用户提到 Word2Gal、同人网页视觉小说、用文字生成 galgame/视觉小说 HTML 时使用。
---

# Word2Gal

面向同人创作者的 Cursor Skill：用户只交**一篇自然语言文章**，你产出可直接游玩的 HTML 视觉小说。

## 验收标准（必须全部满足）

1. **抽取成戏**：从文章准确提取角色、场景、对话（及文中写明的分支），做成可玩 HTML。  
2. **立绘跟脸**：按文中人物去**网上查通行长相/设定**，**多图对照并分析年龄与神态**后再生成立绘；禁止臆造乱画，禁止小孩↔大人等低级错画。  
3. **情绪差分**：先判断文章**核心情绪成色**，再为本篇制作若干常用表情差分（子集来自成色，不是无脑固定五件套硬套）。  
4. **拟声短音**：拟声以文章为依据；**口技**（笑/叹等）必须为人声；允许文中有据的轻环境音（脚步/敲门等）；禁止用打击/机械咚哐冒充口技；禁止全文 TTS。

用户侧全程自然语言；禁止要求用户填写 JSON、标记语法或资源路径。

## 硬约束

- 不对白全文 TTS；仅文章驱动的拟声 `voiceTag`（vocal 口技 + 有据 foley，见 `emotion-and-sfx.md`）
- **对白/旁白用原文**：禁止压缩、改写、润色文章；只可按节奏原样切开；交付前跑原文覆盖自检（见 `extraction.md`）
- 立绘：先检索并**多图对照**参考形象（锁定年龄段/发型/标志物/神态），再风格包生成；无检索结果才回退文内描写，并必须口头告知用户
- **立绘真透明优先**：风格包默认出真透明 PNG；绿幕 + `cut-sprite` 仅当模型返回实心底/假透明时回退；残底（绿/灰/棋盘格）不上架
- **生图一律自动确认**：用户提交文章并进入制作后，立绘/背景/所需差分的文生图**全部自动执行、自动确认**，禁止每张图都停下来让用户点确认或口头询问「要不要生成」；批量连出，出错按重试规则自行处理
- 禁止改写播放器核心 JS；只替换 `__SCRIPT_JSON__` / `__ASSETS_JSON__`
- 素材失败 → defaults，HTML 仍须可玩
- Windows：只写带常见扩展名的文件，禁止无扩展名文件

## 单次容量软上限（必须遵守）

单次生成的质量瓶颈主要来自：**模型上下文与抽取准确度** + **立绘/场景/拟声的生成成本**（角色数 × 表情数），不是播放器 HTML 本身。  
因此本 Skill **不追求单次无限加长**；更长内容用「拆章多次生成」扩容，并尽量复用已有角色立绘。

| 项目 | 甜区（优先） | 软上限（超过则必须处理） |
|------|--------------|--------------------------|
| 正文篇幅 | 800～2500 字 | **≤5000 字** / 次 |
| 需立绘主角 | 2～3 人 | **≤4 人** / 次 |
| 场景 | 1～3 个 | **≤5 个** / 次 |
| 表情差分 / 人 | 3～4 张 | **≤5 张** / 人 |
| 分支 | 0～1 个二选一 | 避免深层多结局树；多结局宜拆章 |

**超限时 Agent 必须：**

1. 用自然语言说明已超软上限及原因；  
2. 请用户拆成多章/多幕，或由你代拆为若干段后**分次**生成；  
3. **禁止**默默硬塞超长全文导致漏戏、错归属、乱立绘。  

低于约 400 字也可做，但需告知：戏与情绪依据可能偏薄。

## 参考文档（内部）

- 抽取：`reference/extraction.md`
- 网查与人物深度分析：`reference/character-lookup.md`（多图对照、年龄锁、神态）
- 情绪成色与拟声：`reference/emotion-and-sfx.md`
- 背景音乐：`reference/bgm.md`（恋爱向用 `music/love.mp3`）
- 界面主题：`reference/ui-themes.md`（按 mood 自动选）
- 角色卡：`reference/character-card.md`
- 剧本结构：`reference/script-schema.md`
- 打包：`reference/assets-and-bake.md`
- 风格包：`style-packs/daily-heal/prompt.md`
- 模板：`templates/player-basic.html`（加强演出：`player-advanced.html`）

## 工作流（按序执行，不可跳步）

### 1. 接收文章并抽取关键信息

按 `reference/extraction.md`，从用户文章中抽出：

- 角色列表（名字、关系、外貌/性格/年龄学段/神态线索）
- 场景列表（地点、时间氛围）
- 对话与旁白顺序
- 文中明确的选项/多结局（没有则单线）

含糊处用**自然语言**追问 1～2 句；用户不补则给安全默认，并在交付摘要中说明假设。

可用自然语言向用户复述一份「将做成游戏的大纲」再继续（用户若说直接做则跳过确认）。

### 2. 判定核心情绪成色 + 本篇差分/拟声清单

按 `reference/emotion-and-sfx.md`：

- 定 1 个主成色（如日常暖、虐心、悬疑、燃向等）
- 列出本篇需要的 `expressions` 子集（通常 3～5 个）
- 列出本篇拟声清单：文中笑/叹/哭等 → **vocal**；文中有据的脚步/敲门等 → **foley**（无则可不挂；见 `emotion-and-sfx.md`）

按 `reference/bgm.md`：

- 若文章含爱情/恋爱/暗恋/告白/心动等恋爱向语义 → `meta.bgm = "love"`（使用 `music/love.mp3`）
- 否则可不设 BGM

### 3. 深度分析人物 → 网查多图对照 → 角色卡

对每个主要角色，按 `reference/character-lookup.md`（本步宁可多花时间，不可草率出图）：

1. 从文章蒸馏外貌、**年龄/学段**、神态、标志物（见 `extraction.md` 的 `ageClues` 等）  
2. 联网检索该角色通行形象，**收集 2～4 张**参考并横向对照  
3. 写出不可变特征 + 锁定 `ageBand` / `demeanor`（严禁小孩画成大人、大人画成小孩）  
4. 选定主参考 + 辅参考，写入角色卡短参数、`invariants`、`referenceNote`  
5. 查不到：用文章内描写蒸馏，仍必须填 `ageBand`，标记 `lookup=fallback`，交付时告知  

禁止跳过检索与对照直接自由发挥（除非环境明确无联网，则全员 fallback 并说明）。  
出图后按文档核对清单检查；年龄/串脸不合格必须重画后再 Bake。

### 4. 编译内部剧本 JSON

按 `reference/script-schema.md` 生成节点。  
`dialogue.emotion` / `voiceTag` **只能**来自第 2 步清单；文中无对应情绪则 `neutral` 或静音。

```bash
node .cursor/skills/word2gal/scripts/validate-script.mjs <script.json>
```

不通过则先修好。

### 5. 生成立绘差分 / 背景 / 拟声

- 立绘：风格包 prompt + **参考形象约束** + **ageBand/demeanor 锁** + 本篇 expressions；同一角色保持一致  
- 出图前确认已完成第 3 步多图对照；出图后做年龄/发型/神态核对  
- **生图一律自动确认（强制）**：本步所有文生图（立绘差分、场景背景等）连续自动调用并确认，**不要**每张等待用户手动点确认，**不要**逐张问「生成吗」；工具若弹出确认，按自动通过处理。整批清单一次跑完，仅在整批失败回退时再在摘要里说明  
- **立绘透明路径（优先真透明）**：  
  1. 优先按风格包默认路径出**真透明** PNG（见 `style-packs/daily-heal/prompt.md`）  
  2. 不合格（实心底/假透明/棋盘格画进像素）→ 绿幕 `#00FF00` 重出 + `cut-sprite.mjs --mode green`（浅灰白底才用 `--mode flood`）  
  3. `check-sprite-alpha.mjs` 抽检（仅拦**全不透明底板**：无任何透明像素即 fail；脚本通过 ≠ 无残底）  
     - 绿/灰毛边、棋盘格画进人物等仍须 **Agent 目视 QA**；残底不上架  

  4. 拟声按 vocal/foley 清单生成（口技必须人声；foley 须有原文依据）  
- 背景图（场景）：按抽取的场景生成，可有完整画面（与立绘透明路径不同）  
- 播放器字体：使用模板内 Noto Sans SC + antialiased  

失败重试 ≤2 → `style-packs/.../defaults/` 或静音。

### 6. Bake 成品

复制 `templates/player-basic.html`（用户要加强演出则用 advanced），替换：

- `__SCRIPT_JSON__` / `__ASSETS_JSON__`
- `__THEME_ID__` / `__THEME_CSS__`（按 `meta.mood` 读入 `templates/themes/`，见 `ui-themes.md`）

推荐命令：

```bash
node .cursor/skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>   # 仅回退需要时
node .cursor/skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>
node .cursor/skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```
输出到用户指定路径，或 `output/<短目录>/《作品名》.html`（近全屏游玩区）。  
**HTML 文件名必须用作品名**（来自 `meta.title`，非法文件名字符剔除），禁止一律叫 `index.html`。

### 7. 交付前自检（对照验收标准）

- [ ] 文章中的主要角色、场景、对话都进了可玩流程  
- [ ] 每个主角说明了形象来源：网查参考（对照几张）/ 文内回退；年龄段与神态合理  
- [ ] 无小孩↔大人等明显错画；不可变特征与文设一致  
- [ ] 立绘真透明（或绿幕回退抠净）；`check-sprite-alpha` 通过（仅证非全不透明底板）  
- [ ] Agent 目视无残底：无绿边/灰边/棋盘格画进立绘（脚本通过 ≠ 已抠净）  
- [ ] 表情差分集合能对应文章情绪成色  
- [ ] 文中笑/叹等已挂 vocal；foley 均有原文依据；无口技被咚哐顶替；无全文 TTS  
- [ ] 原文覆盖自检通过；未删减浓缩（见 `extraction.md`）  
- [ ] 校验通过；缺资源有回退；浏览器可玩  
- [ ] 用自然语言摘要告知：成色、差分列表、声音列表（vocal/foley）、哪些用了默认占位  

## 模式二

同一剧本填入 `templates/player-advanced.html`。文件缺失则用 basic 并说明。
