---
name: word2gal
description: >-
  将自然语言同人剧情生成可运行的单文件 HTML 视觉小说（对话框、立绘、选项、短反应音）。
  在用户提到 Word2Gal、同人网页视觉小说、用文字生成 galgame/视觉小说 HTML 时使用。
---

# Word2Gal

面向同人创作者的 Cursor Skill：用户只写自然语言，你产出可双击打开的 HTML 视觉小说。

## 硬约束

- 用户只提供自然语言；禁止要求用户填写 JSON/标记语法/资源路径
- 不对白全文 TTS；仅标签化短反应音
- 立绘必须走风格包参数卡；禁止自由长描述直出
- 禁止改写播放器核心 JS；只填充模板占位符 `__SCRIPT_JSON__` / `__ASSETS_JSON__`
- 素材失败 → 默认资源，HTML 仍须可玩
- Windows：只写入带常见扩展名的文件（`.html` `.md` `.json` `.svg` `.png` `.mjs` 等），禁止无扩展名文件

## 参考文档（内部）

- 剧本结构：`reference/script-schema.md`
- 角色卡：`reference/character-card.md`
- 打包与自检：`reference/assets-and-bake.md`
- 风格包：`style-packs/daily-heal/prompt.md`
- 模板：`templates/player-basic.html`（模式二：`templates/player-advanced.html`）
- 输入示例：`examples/minimal-input.md`

## 工作流（逐步执行）

### 1. 收集自然语言

确认剧情、角色、是否要分支/结局。含糊时用自然语言追问 1～2 句，或默认单线。

### 2. 编译内部剧本 JSON

按 `reference/script-schema.md` 生成节点（scene / narration / dialogue / choice / ending）。  
dialogue 必有 `emotion`；可选 `voiceTag`。  
然后运行：

```bash
node .cursor/skills/word2gal/scripts/validate-script.mjs <script.json>
```

不通过则先修好再继续。

### 3. 蒸馏角色卡并选用风格包

按 `reference/character-card.md` 从人设散文抽出短参数。  
默认风格包 `daily-heal`。

蒸馏示例：

- 「黑长马尾、说话很快的女生小悠」→ hair/vibe/voiceProfile 短参数，而不是整段散文进文生图。

### 4. 生成或回退立绘/短音

严格使用 `style-packs/<pack>/prompt.md`。  
失败重试 ≤2 → `style-packs/.../defaults/`。  
无音频能力则短音省略（静音）。

### 5. Bake 成品

复制 `templates/player-basic.html`，只替换两个占位符（见 `reference/assets-and-bake.md`），写出 `.html`。  
若用户要「加强演出」且存在 advanced 模板，则换该模板，剧本不变。

### 6. 自检清单

- [ ] 未要求用户填格式  
- [ ] 校验脚本通过  
- [ ] 缺资源有回退、不白屏  
- [ ] 浏览器可玩完分支  
- [ ] 用自然语言说明哪些素材用了默认占位  

## 模式二

用户要求加强演出时：同一剧本填入 `templates/player-advanced.html`。若文件缺失，先用 basic 并说明。
