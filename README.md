<div align="center">

# Word2Gal

[English](./README.en.md) | 简体中文

> *开源 Agent Skill：把一篇自然语言文章变成可在浏览器里点着玩的 HTML 视觉小说。*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skill](https://img.shields.io/badge/Agent-Skill-green.svg)](skills/word2gal/SKILL.md)
[![HTML5](https://img.shields.io/badge/Output-HTML5-orange.svg)](skills/word2gal/templates/)

**面向创作者与开发者的开源工具，不是一键消费级 App。**  
提供 `SKILL.md` + 播放器模板 + Bake 脚本；在 Cursor、Claude Code、Trae、Codex、Kimi Code 等支持 Agent Skills 的环境中，由 Agent 按工作流完成抽取、立绘、拟声与打包。成品质量取决于你选用的 Agent / 生图模型，本仓库不承诺「人人开箱即完美成片」。

[定位与承诺](#定位与承诺) · [前置条件](#前置条件) · [推荐模型](#推荐模型) · [快速开始](#快速开始) · [成品效果](#成品效果)

</div>

---

## 定位与承诺

| 我们是 | 我们不是 |
|--------|----------|
| 可安装的 **Agent Skill** + 校验 / Bake 工具链 | 独立客户端、云端 SaaS、或「粘贴文章即出片」的消费级产品 |
| 给会用 Agent 的作者 / 开发者做短篇同人 / 试玩原型 | 保证跨模型、跨工具、每次出片观感一致的商业成片流水线 |

**保证尽量做到：**

- 用户侧自然语言输入，不要求填 JSON / 标记语法  
- 在满足 [前置条件](#前置条件) 时，能跑通「抽取 → 校验 → Bake → 浏览器可玩 HTML」  
- 素材失败时回退占位图 / 静音，剧情 HTML 仍可打开推进  

**明确不保证：**

- 立绘像不像、是否串脸、抠图一次过 —— 取决于生图模型与 Agent 是否严格执行 Skill  
- 拟声口技一定生成成功（多数环境会静音回退，剧情仍可玩）  
- 任意长度长篇、深层多结局、复杂舞台演出  
- 不支持 Agent Skills、无法执行本地 Node 脚本、或完全无生图能力时的成品质量  

使用与分发时请自行遵守当地法律与平台规则；同人二次创作、生成内容的版权与公开传播风险由使用者自行承担。不宜内容（含 NSFW、涉及未成年人的不当描写等）请勿用于本 Skill。内置 BGM / 默认锚点图仅为仓库演示素材，**对外再分发成品前请自行确认授权**。

---

## 前置条件

上手前准备这些即可（**不用** Docker / Python 虚拟环境）：

| 需要 | 说明 |
|------|------|
| 支持 Agent Skills 的工具 | 如 Cursor、Claude Code、Trae、Codex、Kimi Code 等，能加载本仓库的 `skills/word2gal/` |
| **Node.js 18+**（含 npm） | 用于校验剧本、绿幕抠图、Bake 打包 |
| 一次 `npm install` | 仅安装抠图依赖 `pngjs`（见下方命令） |
| 能生图的 Agent / 模型 | 立绘与场景依赖文生图；没有则只能用默认占位，观感会差很多 |
| 能联网（推荐） | 网查角色通行形象；无网则按文内描写回退 |
| 现代浏览器 | 打开成品 HTML 游玩 |

**必装命令（只做一次）：**

```bash
cd skills/word2gal/scripts
npm install
```

会装上 [`pngjs`](https://www.npmjs.com/package/pngjs)，供 `cut-sprite.mjs` / `check-sprite-alpha.mjs` 使用。  
**不需要**再装其它包管理器全局工具；成品 HTML **无**前端 `npm` 依赖，浏览器直接打开即可。

内置 BGM（`music/sad.mp3` / `happy.mp3` / `love.mp3`）已随 Skill 自带。拟声短音若当前 Agent **没有**可靠生音频能力，会静音回退，剧情仍可玩。

---

## 推荐模型

选 **既能编排跑 Skill、又能文生图** 的模型（或「对话模型 + 同平台生图」一体方案）。立绘质量决定成品观感；纯文本、不能生图的组合不推荐作为主力。

| 类型 | 可直接选 |
|------|----------|
| 国际前沿 | **Gemini**（含 Imagen / Nano Banana 等生图）、**GPT** 系（含 GPT Image）、Claude + 环境内置生图工具（如 Cursor 生图） |
| 国产 / 国内常用 | **通义千问 + 通义万相**、**豆包 / 即梦**、**智谱 GLM + CogView / 清影系生图**、**文心一言 + 文心一格**、**混元**（腾讯混元生图）、**可图 Kolors**（可配合 Agent 工作流时） |

**怎么选：**

- 优先：对话稳 + 全身立绘清晰、少糊脸串脸  
- 有短音频/口技能力加分，没有也能玩（BGM 自带，拟声可静音）  
- 名称随厂商常改，以你 Agent 里 **实际能调到的生图能力** 为准  

---

## 它能做什么

输入一篇含角色、场景、对话的自然语言文章，Agent 按 Skill 跑通整条链路：

```text
用户文章（同人 / 短篇）
    ↓ 抽取角色 · 场景 · 对白旁白（原文保真）
    ↓ 网查形象 · 情绪差分 · 拟声 / BGM
    ↓ Bake 播放器模板
可玩 HTML（浏览器打开即可点推进）
```

**你不需要**填写 JSON、标记语法或资源路径。

适用于同人网页视觉小说、短篇 gal 化、快速试玩原型等场景。期待「零配置、稳定商用成片」请先看 [定位与承诺](#定位与承诺)。

---

## 成品效果

打开生成的 HTML 后，大致会看到：

<div align="center">

| 营地夜谈 | 天台闪回 |
|:---:|:---:|
| <img src="media/demo/demo-camp.png" alt="营地夜谈演示" width="420" /> | <img src="media/demo/demo-rooftop.png" alt="天台闪回演示" width="420" /> |

<img src="media/demo/demo-history.png" alt="历史记录面板" width="720" />

<sub>演示作《启明星》：场景立绘 · 说话人名牌 · 历史 / 自动 / 快进<br />
文章来源：[Bilibili 动态 / 专栏 opus](https://www.bilibili.com/opus/1100588492074778661)</sub>

</div>

| 能力 | 实际效果 |
|------|----------|
| 游玩界面 | 近全屏舞台：场景背景 + **左右双立绘**（说话人高亮）+ 对白框（含说话人名），点击 / 空格推进 |
| 自动 / 快进 | 工具栏「自动」：打字结束后约 1.2s 自动推进；「快进」按住（或按住 Ctrl）连跳，遇选项/结局停下 |
| 历史 | 工具栏「历史」半屏列表：【说话人】/【旁白】+ 已读正文 |
| 立绘 | 默认绿幕抠图上架；残底（绿/白边等）不上架；缺差分不串到其他角色；拆章复用 `character-cards/` |
| 表情差分 | 按文章成色裁剪 3～5 个（如 smile / soft_shy / surprise），不是固定五件套硬套 |
| 文本 | 对白 / 旁白 / 内心独白尽量用**原文**，只按节奏切开；交付前 `validate-coverage` |
| 拟声 | 笑、叹等人口技 + 文中有据的脚步 / 敲门等轻环境音；不对白全文 TTS |
| BGM | 伤感 → `sad`；欢快/搞笑 → `happy`；恋爱甜向 → `love`（优先级：`sad` > `happy` > `love`） |
| UI 主题 | 随 `mood` 切换：日常暖 / 虐心 / 悬疑 / 燃 / 搞笑 |
| 分支 | 文中写明的二选一可做成选项；深层多结局建议拆章 |

素材失败时回退默认占位图 / 静音，剧情 HTML **仍应可打开推进**（观感不保证）。

### 单次容量（软上限）

| 项目 | 甜区 | 软上限 |
|------|------|--------|
| 正文 | 800～2500 字 | ≤5000 字 / 次 |
| 需立绘主角 | 2～3 人 | ≤4 人 / 次 |
| 场景 | 1～3 个 | ≤5 个 / 次 |
| 表情 / 人 | 3～4 张 | ≤5 张 / 人 |

更长内容请**拆章**分次生成，并尽量复用已有立绘。

---

## 快速开始

确认已看过 [定位与承诺](#定位与承诺)、[前置条件](#前置条件) 与 [推荐模型](#推荐模型)，然后：

### 安装

1. 下载 / clone 本项目：https://github.com/kiki3231/word2gal  
2. 将 **`skills/word2gal/`** 复制（或软链）到 Agent 的 skills 目录，文件夹名保持 `word2gal`  
3. 安装脚本依赖（**必需**，否则抠图 / Bake 可能失败）：

```bash
cd skills/word2gal/scripts
npm install
```

4. 重启 / 重载 Agent，并选用带 **生图** 能力的模型  

| 工具 | 常见安装位置 |
|------|----------------|
| Cursor | `<项目>/.cursor/skills/word2gal/` |
| Claude Code | `<项目>/.claude/skills/word2gal/` 或 `~/.claude/skills/word2gal/` |
| Trae / Codex / Kimi Code / 其它 | 按其文档的 Agent Skills 目录 |

### 使用

在 Agent 对话中贴上文章，例如：

```text
用 Word2Gal 把下面文章做成可玩的视觉小说 HTML：

（在此粘贴你的文章）
```

也可以说「做个 galgame / 同人网页视觉小说」。Agent 识别 Skill 后会按工作流自动执行。

生成结果默认在：

```text
output/<短目录>/《作品名》.html
output/<短目录>/assets/
```

用浏览器打开 HTML 即可点着玩（首次点击后可能开始播 BGM）。

---

## Skill 里有什么

| 类别 | 内容 |
|------|------|
| **工作流** | 抽取 → 成色 / 拟声清单 → 人物网查 → 剧本校验 → 生图 / 短音 → Bake |
| **播放器模板** | `player-basic.html`（原生 HTML/CSS/JS） |
| **UI 主题** | 5 套 mood CSS：warm_daily / bittersweet / tense / hotblood / comedy |
| **风格包** | `daily-heal` 立绘提示 + 默认占位图 |
| **BGM** | `music/sad.mp3`、`happy.mp3`、`love.mp3` |
| **脚本** | validate-script / validate-coverage / cut-sprite / check-alpha / bake-story |

---

## 工作流（Agent 侧）

1. **抽取**：角色、场景、节拍（对白 / 旁白）、文中分支  
2. **成色与清单**：定 `mood`；表情差分；vocal / foley；判定 BGM  
3. **人物深度分析**：多图对照，锁定年龄段与神态后再出图  
4. **编译剧本 JSON** → `validate-script.mjs` + `validate-coverage.mjs`  
5. **生成资源**：立绘（默认绿幕抠图）、场景、短音；写 `speaker-map.json`  
6. **Bake**：写入 `player-basic.html`，输出可玩 HTML  

高级用户也可在项目根目录手动调用：

```bash
node skills/word2gal/scripts/validate-script.mjs <script.json>
node skills/word2gal/scripts/validate-coverage.mjs <source.txt> <script.json>
node skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>
node skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>
node skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```

---

## BGM 规则

| 键名 | 文件 | 何时使用 |
|------|------|----------|
| `sad` | `music/sad.mp3` | 伤感、伤心、悲伤、难过、虐心离别等，或 `mood=bittersweet` |
| `happy` | `music/happy.mp3` | 欢快、搞笑、轻松主线等，或 `mood=comedy`（且未落入伤感主基调） |
| `love` | `music/love.mp3` | 恋爱、暗恋、告白、心动等甜向，且未落入伤感 / 欢快主基调 |

**优先级：`sad` > `happy` > `love`。** 细节见 [`skills/word2gal/reference/bgm.md`](skills/word2gal/reference/bgm.md)。

> 内置音乐仅作演示素材；对外分发请自行确认版权。

---

## 项目结构

```text
word2gal/
├── README.md / README.en.md
├── LICENSE
├── media/demo/                  # README 演示截图
└── skills/word2gal/
    ├── SKILL.md                 # Skill 入口（质量标准与工作流）
    ├── reference/               # 抽取、角色、情绪拟声、BGM、Bake 等规范
    ├── scripts/                 # validate / cut-sprite / check-alpha / bake
    ├── templates/               # 播放器 HTML + mood 主题 CSS
    ├── style-packs/daily-heal/  # 立绘风格提示与默认占位
    └── music/                   # 内置 BGM（sad / happy / love）
```

---

## 设计原则

- **只写自然语言**，不填表  
- **原文保真**：禁止压缩润色对白 / 旁白；只可按节奏切开  
- **立绘绿幕抠图为准**：全身左右位；残底不上架；路人 / OC 跟同篇原作画风  
- **拟声跟人走**：口技必须是人声；禁止用咚哐冒充笑 / 叹  
- **不对白全文 TTS**
- **历史可回看**：【说话人】+ 正文  
- **自动 / 快进**：工具栏开关自动播放；按住快进或 Ctrl 连跳

完整约束见 [`skills/word2gal/SKILL.md`](skills/word2gal/SKILL.md)。

---

## 技术栈

- **成品**：HTML5 + CSS3 + 原生 JavaScript（无框架依赖）  
- **工具链**：Node.js（校验、抠图、Bake）  
- **兼容性**：现代浏览器（Chrome、Firefox、Safari、Edge）

---

## 开源协议

本项目采用 [MIT License](LICENSE)。软件按「原样」提供，不附带适销性或特定用途适用性等保证；详见许可证正文。使用边界与质量预期见 [定位与承诺](#定位与承诺)。

---

<div align="center">

**如果对你有帮助，欢迎 Star ⭐**

</div>
