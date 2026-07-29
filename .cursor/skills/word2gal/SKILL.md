---
name: word2gal
description: >-
  将用户自然语言文章（含角色、场景、对话）提取为可玩 HTML 视觉小说：
  网查角色通行长相生成立绘与情绪差分，并按文章设定挂拟声短音。
  在用户提到 Word2Gal、同人网页视觉小说、用文字生成 galgame/视觉小说 HTML 时使用。
---

# Word2Gal

面向同人创作者的 Cursor Skill：用户只交**一篇自然语言文章**，你产出可直接游玩的 HTML 视觉小说。

## 验收标准（必须全部满足）

1. **抽取成戏**：从文章准确提取角色、场景、对话（及文中写明的分支），做成可玩 HTML。  
2. **立绘跟脸**：按文中人物去**网上查通行长相/设定**，再生成符合该长相的立绘；禁止仅凭臆造乱画。  
3. **情绪差分**：先判断文章**核心情绪成色**，再为本篇制作若干常用表情差分（子集来自成色，不是无脑固定五件套硬套）。  
4. **拟声短音**：只要笑声/哭声/生气等拟声反应音；**严格按文章出现的情绪与动作**选用，禁止全文 TTS，禁止塞无关音效。

用户侧全程自然语言；禁止要求用户填写 JSON、标记语法或资源路径。

## 硬约束

- 不对白全文 TTS；仅文章驱动的拟声 `voiceTag`
- 立绘：先检索参考形象，再风格包生成；无检索结果才回退文内描写，并必须口头告知用户
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
- 网查形象：`reference/character-lookup.md`
- 情绪成色与拟声：`reference/emotion-and-sfx.md`
- 界面主题：`reference/ui-themes.md`（按 mood 自动选）
- 角色卡：`reference/character-card.md`
- 剧本结构：`reference/script-schema.md`
- 打包：`reference/assets-and-bake.md`
- 风格包：`style-packs/daily-heal/prompt.md`
- 模板：`templates/player-basic.html`（加强演出：`player-advanced.html`）
- 示例：`examples/minimal-input.md`、`examples/sample-run.md`

## 工作流（按序执行，不可跳步）

### 1. 接收文章并抽取关键信息

按 `reference/extraction.md`，从用户文章中抽出：

- 角色列表（名字、关系、外貌/性格线索）
- 场景列表（地点、时间氛围）
- 对话与旁白顺序
- 文中明确的选项/多结局（没有则单线）

含糊处用**自然语言**追问 1～2 句；用户不补则给安全默认，并在交付摘要中说明假设。

可用自然语言向用户复述一份「将做成游戏的大纲」再继续（用户若说直接做则跳过确认）。

### 2. 判定核心情绪成色 + 本篇差分/拟声清单

按 `reference/emotion-and-sfx.md`：

- 定 1 个主成色（如日常暖、虐心、悬疑、燃向等）
- 列出本篇需要的 `expressions` 子集（通常 3～5 个）
- 列出本篇需要的拟声标签（只来自文中笑/哭/怒/惊等，无则可不挂音）

### 3. 网查角色长相 → 角色卡

对每个主要角色，按 `reference/character-lookup.md`：

1. 用可用的联网/搜索能力查该角色（或同人设定）的**通行形象**  
2. 选定 1 张最符合的参考描述/参考图  
3. 写入角色卡短参数 + `referenceNote`（查到了什么）  
4. 查不到：用文章内描写蒸馏参数，标记 `lookup=fallback`，交付时必须告知  

禁止跳过检索直接自由发挥（除非环境明确无联网，则全员 fallback 并说明）。

### 4. 编译内部剧本 JSON

按 `reference/script-schema.md` 生成节点。  
`dialogue.emotion` / `voiceTag` **只能**来自第 2 步清单；文中无对应情绪则 `neutral` 或静音。

```bash
node .cursor/skills/word2gal/scripts/validate-script.mjs <script.json>
```

不通过则先修好。

### 5. 生成立绘差分 / 背景 / 拟声

- 立绘：风格包 prompt + **参考形象约束** + 本篇 expressions；同一角色保持一致  
- **抠图（强制）**：对带浅灰底的立绘运行  
  `node .cursor/skills/word2gal/scripts/cut-sprite.mjs --dir <立绘目录>`  
  必须使用**边缘洪水填充**抠底；**禁止**对整图做「凡是浅灰就透明」的全局色键（会导致脸/衣服穿模）。  
- 背景：按抽取的场景生成或选用，贴合文章氛围  
- 拟声：只为清单内标签生成/选用短音  
- 播放器字体：使用模板内 Noto Sans SC + antialiased，勿改回不覆盖中文的西文字体  

失败重试 ≤2 → `style-packs/.../defaults/` 或静音。

### 6. Bake 成品

复制 `templates/player-basic.html`（用户要加强演出则用 advanced），替换：

- `__SCRIPT_JSON__` / `__ASSETS_JSON__`
- `__THEME_ID__` / `__THEME_CSS__`（按 `meta.mood` 读入 `templates/themes/`，见 `ui-themes.md`）

推荐命令：

```bash
node .cursor/skills/word2gal/scripts/cut-sprite.mjs --dir <assetsDir>
node .cursor/skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```

输出到用户指定路径，或 `output/<title>/index.html`（近全屏游玩区）。

### 7. 交付前自检（对照验收标准）

- [ ] 文章中的主要角色、场景、对话都进了可玩流程  
- [ ] 每个主角说明了形象来源：网查参考 / 文内回退  
- [ ] 表情差分集合能对应文章情绪成色  
- [ ] 拟声仅来自文章设定，无全文 TTS  
- [ ] 校验通过；缺资源有回退；浏览器可玩  
- [ ] 用自然语言摘要告知：成色、差分列表、声音列表、哪些用了默认占位  

## 模式二

同一剧本填入 `templates/player-advanced.html`。文件缺失则用 basic 并说明。
