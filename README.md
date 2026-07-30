# Word2Gal

[English](./README.en.md) | 简体中文

> *通过自然语言驱动的视觉小说生成 Skill —— 把一篇同人文章变成可在浏览器里点着玩的 HTML Galgame。*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skill](https://img.shields.io/badge/Agent-Skill-green.svg)](skills/word2gal/SKILL.md)
[![HTML5](https://img.shields.io/badge/Output-HTML5-orange.svg)](skills/word2gal/templates/)

**不是填表工具，是「文章 → 可玩 HTML」的完整 Agent 工作流。**

提供标准 `SKILL.md` + 播放器模板 + Bake 脚本，配合 Cursor、Claude Code、Trae、Codex、Kimi Code 等支持 Agent Skills 的工具使用，自动完成抽取、立绘、拟声与打包。

[快速开始](#快速开始) · [它能做什么](#它能做什么) · [成品效果](#成品效果) · [项目结构](#项目结构)

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

适用于同人网页视觉小说、短篇 gal 化、快速试玩原型等场景。

---

## 成品效果

打开生成的 HTML 后，大致会看到：

| 能力 | 实际效果 |
|------|----------|
| 游玩界面 | 近全屏舞台：场景背景 + 角色半身立绘 + 对白框，点击 / 空格推进 |
| 立绘 | 优先真透明 PNG；失败再绿幕抠图；残底不上架 |
| 表情差分 | 按文章成色裁剪 3～5 个（如 smile / soft_shy / surprise），不是固定五件套硬套 |
| 文本 | 对白 / 旁白 / 内心独白尽量用**原文**，只按节奏切开；交付前覆盖自检 |
| 拟声 | 笑、叹等人口技 + 文中有据的脚步 / 敲门等轻环境音；不对白全文 TTS |
| BGM | 伤感冷基调 → `sad`；恋爱甜向 → `love`（伤感优先） |
| UI 主题 | 随 `mood` 切换：日常暖 / 虐心 / 悬疑 / 燃 / 搞笑 |
| 分支 | 文中写明的二选一可做成选项；深层多结局建议拆章 |

素材失败时回退默认占位图 / 静音，但仍保证 **HTML 可玩**。

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

### 安装

1. 下载本项目  
2. 将 **`skills/word2gal/`** 整个目录复制（或软链）到当前 Agent 的 skills 目录，文件夹名保持 `word2gal`  
3. （推荐）进入 `skills/word2gal/scripts`，执行 `npm install`  
4. 重启 / 重载 Agent  

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

---

## Skill 里有什么

| 类别 | 内容 |
|------|------|
| **工作流** | 抽取 → 成色 / 拟声清单 → 人物网查 → 剧本校验 → 生图 / 短音 → Bake |
| **播放器模板** | `player-basic.html` / `player-advanced.html`（原生 HTML/CSS/JS） |
| **UI 主题** | 5 套 mood CSS：warm_daily / bittersweet / tense / hotblood / comedy |
| **风格包** | `daily-heal` 立绘提示 + 默认占位图 |
| **BGM** | `music/sad.mp3`、`music/love.mp3` |
| **脚本** | validate / cut-sprite / check-alpha / bake-story |

---

## 工作流（Agent 侧）

1. **抽取**：角色、场景、节拍（对白 / 旁白）、文中分支  
2. **成色与清单**：定 `mood`；表情差分；vocal / foley；判定 BGM  
3. **人物深度分析**：多图对照，锁定年龄段与神态后再出图  
4. **编译剧本 JSON** → `validate-script.mjs`  
5. **生成资源**：立绘（真透明优先）、场景、短音  
6. **Bake**：写入模板，输出可玩 HTML  

高级用户也可在项目根目录手动调用：

```bash
node skills/word2gal/scripts/validate-script.mjs <script.json>
node skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>
node skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>
node skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```

---

## BGM 规则

| 键名 | 文件 | 何时使用 |
|------|------|----------|
| `sad` | `music/sad.mp3` | 伤感、伤心、悲伤、难过、虐心离别等，或 `mood=bittersweet` |
| `love` | `music/love.mp3` | 恋爱、暗恋、告白、心动等甜向，且未落入伤感主基调 |

**优先级：伤感 > 恋爱。** 细节见 [`skills/word2gal/reference/bgm.md`](skills/word2gal/reference/bgm.md)。

> 内置音乐仅作演示素材；对外分发请自行确认版权。

---

## 项目结构

```text
word2gal/
├── README.md / README.en.md
├── LICENSE
└── skills/word2gal/
    ├── SKILL.md                 # Skill 入口（验收标准与工作流）
    ├── reference/               # 抽取、角色、情绪拟声、BGM、Bake 等规范
    ├── scripts/                 # validate / cut-sprite / check-alpha / bake
    ├── templates/               # 播放器 HTML + mood 主题 CSS
    ├── style-packs/daily-heal/  # 立绘风格提示与默认占位
    └── music/                   # 内置 BGM（sad / love）
```

---

## 设计原则

- **只写自然语言**，不填表  
- **原文保真**：禁止压缩润色对白 / 旁白；只可按节奏切开  
- **立绘真透明优先**：绿幕抠图是回退；残底不上架  
- **拟声跟人走**：口技必须是人声；禁止用咚哐冒充笑 / 叹  
- **不对白全文 TTS**

完整约束见 [`skills/word2gal/SKILL.md`](skills/word2gal/SKILL.md)。

---

## 技术栈

- **成品**：HTML5 + CSS3 + 原生 JavaScript（无框架依赖）  
- **工具链**：Node.js（校验、抠图、Bake）  
- **兼容性**：现代浏览器（Chrome、Firefox、Safari、Edge）

---

## 兼容说明

- **需要**：能加载 `SKILL.md`；能跑终端（Node）；最好能联网与生图  
- **不保证**：不支持 Skills、无法跑本地脚本、无文件工具的 Agent  

---

## 开源协议

本项目采用 [MIT License](LICENSE)。

---

**如果对你有帮助，欢迎 Star ⭐**
