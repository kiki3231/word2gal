# 情绪成色与拟声（内部）

> 验收标准第 3、4 条：按文章核心情绪做差分；拟声严格跟文章设定。

## A. 核心情绪成色

读完全文后，只选 **1 个主成色**（可附 1 个辅成色）：

| 成色 id | 含义 | 常见差分倾向 |
|---------|------|----------------|
| `warm_daily` | 日常、治愈、甜 | neutral, smile, soft_shy, surprise |
| `bittersweet` | 虐心、离别、隐痛 | neutral, sad, smile, cry |
| `tense` | 悬疑、不安 | neutral, surprise, tense, angry |
| `hotblood` | 燃、对峙 | neutral, angry, smile, surprise |
| `comedy` | 轻松搞笑 | smile, surprise, angry, laugh |

若文章混杂：以**结局与高潮情绪**为准。

将成色写入剧本 `meta.mood`（字符串，与 `stylePack` 并列；校验器若尚未强制该字段，仍应写入供打包摘要使用）。

**界面主题：** `meta.mood` 同时决定游玩 UI 主题，见 `reference/ui-themes.md`（自动注入对应 `templates/themes/*.css`）。

## B. 本篇表情差分清单

1. 从成色表取「常见差分倾向」为候选  
2. **再按文章实际出现的情绪**裁剪：文中没哭就不要强行做 `cry` 立绘（除非成色强依赖）  
3. 最终 `expressions` 控制在 **3～5 个**，且**必须包含** `neutral`  
4. 每个 `dialogue.emotion` 只能取自该清单  

映射到风格包时，未知 emotion 回退 `neutral`。

## C. 拟声短音（非 TTS）

### 允许的音类

只做短反应/拟声，例如：

| voiceTag | 何时用（必须文中有依据） |
|----------|---------------------------|
| `soft_laugh` / `laugh` | 笑、调侃、破涕为笑 |
| `cry_sniff` / `sob` | 哭、哽咽 |
| `angry_huff` | 生气、啐声 |
| `surprised` / `gasp` | 震惊、倒吸气 |
| `sigh` | 叹气 |
| `soft_affirm` | 轻声应和（文中有「嗯」等） |

### 严格规则

1. **无依据不挂音**：文章没笑就不要 `laugh`  
2. **不对白念词**：禁止把台词做成语音  
3. **少而准**：全篇常用 2～6 个标签即可；按角色气质选音色（少女轻笑 vs 低沉冷哼）  
4. 剧本里 `voiceTag` 必须 ⊆ 本篇拟声清单  

## D. 写入下游

- 角色卡：`expressions` = 本篇清单（可角色共用同一情绪包）  
- 剧本：每句 dialogue 的 emotion/voiceTag 来自清单  
- 交付摘要：用自然语言说明「成色=…；差分=…；拟声=…」
