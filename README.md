# Word2Gal

[English](./README.en.md) | 简体中文

> 通过自然语言驱动的简易视觉小说生成 **Agent Skill** —— 把一篇同人文章变成可在浏览器里游玩的 HTML Galgame。

仓库：[github.com/kiki3231/word2gal](https://github.com/kiki3231/word2gal)

适用于 **任何支持 Agent Skills 的工具**（例如 Cursor、Claude Code、Trae、Codex、Kimi Code 等）：把本仓库的 `skills/word2gal/` 安装到该工具的 skills 目录即可。

---

## 这是什么

**Word2Gal** 是一份标准 Agent Skill（目录内含 `SKILL.md` + 脚本与规范）。你只需要提供一篇自然语言文章（含角色、场景、对话），Agent 会自动：

1. 抽取角色 / 场景 / 对白与旁白（尽量**保留原文**，不擅自摘要改写）
2. 联网对照角色通行形象，生成立绘与情绪差分
3. 按文章挂人口技与轻环境短音，并按基调选择 BGM
4. 打包成单页可玩 HTML（近全屏游玩区）

你**不需要**填写 JSON、标记语法或资源路径。

---

## 实现效果（成品长什么样）

| 能力 | 效果 |
|------|------|
| 可玩 HTML | 输出 `output/<短目录>/《作品名》.html`，浏览器打开即可点推进 |
| 立绘 + 场景 | 角色半身立绘（真透明优先）叠在场景背景上 |
| 表情差分 | 按文章情绪成色裁剪 3～5 个表情（非固定五件套硬套） |
| 原文进戏 | 对白 / 旁白 / 内心独白按节奏切开，交付前覆盖自检 |
| 拟声 | 笑、叹等人口技 + 文中有据的脚步 / 敲门等轻环境音 |
| BGM | 伤感冷基调 → `sad`；恋爱甜向 → `love`（伤感优先） |
| UI 主题 | 按 `mood` 自动注入（日常暖 / 虐心 / 悬疑 / 燃 / 搞笑） |
| 分支 | 文中明确的二选一可做成选项；深层多结局建议拆章 |

素材失败时会回退到默认占位图 / 静音，但仍保证 HTML **可玩**。

---

## 快速开始

### 1. 环境要求

- 任意支持 **Agent Skills**（能加载 `SKILL.md`）的 Agent / IDE
- 本机可运行 Node.js（Bake / 抠图 / 校验脚本需要）
- 建议可联网（角色形象多图对照）；生图能力取决于你使用的 Agent

### 2. 安装 Skill

```bash
git clone https://github.com/kiki3231/word2gal.git
```

将仓库中的 **`skills/word2gal/`** 整个目录复制（或软链）到当前工具的 skills 目录，目录名保持 `word2gal`：

| 工具 | 项目级安装路径（常见） |
|------|------------------------|
| Cursor | `<项目>/.cursor/skills/word2gal/` |
| Claude Code | `<项目>/.claude/skills/word2gal/` 或 `~/.claude/skills/word2gal/` |
| Trae / Codex / Kimi Code / 其它 | 按其文档的 Agent Skills 目录；放入同名 `word2gal/` 文件夹 |

也可以直接把本仓库当作工作区打开，再按上表把 `skills/word2gal` 链到工具所需路径。

### 3. 安装脚本依赖（可选但推荐）

```bash
cd skills/word2gal/scripts
npm install
```

### 4. 开始生成

在 Agent 对话中说明，并贴上文章，例如：

```text
用 Word2Gal 把下面文章做成可玩的视觉小说 HTML：

（在此粘贴你的文章）
```

也可以说「做个 galgame / 同人网页视觉小说」等。Agent 识别 Skill 后会按工作流执行。

---

## 使用教程

### 输入建议

- **甜区篇幅**：约 800～2500 字；软上限约 5000 字 / 次
- **主角**：2～3 人最稳；单次 ≤4 人需立绘
- **场景**：1～3 个；单次 ≤5 个
- 写清谁在说话、地点氛围、情绪与动作（笑、叹、敲门等）
- 更长内容请**拆章**分次生成，并尽量复用已有立绘

### Agent 会做什么（工作流）

1. **抽取**：角色、场景、节拍（对白 / 旁白）、文中分支
2. **成色与清单**：定主 `mood`；列出表情差分与拟声（vocal / foley）；判定 BGM
3. **人物深度分析**：网查多图对照，锁定年龄段与神态后再出图
4. **编译剧本 JSON** → `validate-script.mjs` 校验
5. **生成资源**：立绘（真透明优先，失败再绿幕抠图）、场景、短音
6. **Bake**：写入播放器模板，输出可玩 HTML

### 常用命令（在仓库根目录）

```bash
node skills/word2gal/scripts/validate-script.mjs <script.json>
node skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>
node skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>
node skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```

若 Skill 已安装到其它路径，把前缀改成该安装目录下的 `scripts/` 即可。

### 输出位置

```text
output/<短目录>/《作品名》.html
output/<短目录>/assets/
```

`output/` 默认不入库。

---

## BGM 规则（摘要）

| 键名 | 文件 | 何时使用 |
|------|------|----------|
| `sad` | `music/sad.mp3` | 伤感、伤心、悲伤、难过、虐心离别等冷基调，或 `mood=bittersweet` |
| `love` | `music/love.mp3` | 恋爱、暗恋、告白、心动等甜向，且未落入伤感主基调 |

**优先级：伤感 > 恋爱。** 细节见 [`skills/word2gal/reference/bgm.md`](skills/word2gal/reference/bgm.md)。

> 内置音乐仅作演示素材；对外分发请自行确认版权。

---

## 项目结构

```text
skills/word2gal/
├── SKILL.md                 # Skill 入口（验收标准与工作流）
├── reference/               # 抽取、角色、情绪拟声、BGM、Bake 等规范
├── scripts/                 # validate / cut-sprite / check-alpha / bake
├── templates/               # 播放器 HTML + mood 主题 CSS
├── style-packs/daily-heal/  # 立绘风格提示与默认占位
└── music/                   # 内置 BGM（sad / love）
```

---

## 设计原则（摘要）

- **用户只写自然语言**，不填表
- **原文保真**：禁止压缩润色对白 / 旁白；只可按节奏切开
- **立绘真透明优先**：绿幕抠图是回退；残底不上架
- **拟声跟人走**：口技必须是人声；禁止用咚哐冒充笑 / 叹
- **不对白全文 TTS**

完整约束见 [`skills/word2gal/SKILL.md`](skills/word2gal/SKILL.md)。

---

## 兼容说明

- **需要**：能发现并加载 `SKILL.md`；能执行终端命令（Node）；最好能联网与生图  
- **不保证**：不支持 Skills、无法跑本地脚本、无文件读写能力的 Agent

---

## 许可

本项目以 [MIT License](./LICENSE) 开源。

---

## 贡献与反馈

欢迎 Issue / PR。若你有更好的风格包、主题或 BGM 曲库想法，也欢迎讨论。
