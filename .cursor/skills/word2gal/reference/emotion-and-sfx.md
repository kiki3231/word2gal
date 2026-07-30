# 情绪成色与拟声（内部）

> 验收标准第 3、4 条：按文章核心情绪做差分；拟声严格跟文章设定。  
> 拟声含 **vocal（口技）** 与 **foley（有据轻环境音）** 两类；与 SKILL 验收第 4 条（口技 + 有据轻环境音）一致。

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

**背景音乐：** 若文章含爱情/恋爱等语义，另设 `meta.bgm`，见 `reference/bgm.md`（与 mood 独立）。

## B. 本篇表情差分清单

1. 从成色表取「常见差分倾向」为候选  
2. **再按文章实际出现的情绪**裁剪：文中没哭就不要强行做 `cry` 立绘（除非成色强依赖）  
3. 最终 `expressions` 控制在 **3～5 个**，且**必须包含** `neutral`  
4. 每个 `dialogue.emotion` 只能取自该清单  

映射到风格包时，未知 emotion 回退 `neutral`。

## C. 拟声短音（非 TTS）

允许 **vocal（口技）** 与 **foley（轻环境音）** 两类；均须文中有依据，禁止全文 TTS。

内部清单每项除 `voiceTag` 外，Agent 须标注 **`kind: "vocal" | "foley"`**（剧本 `voiceTag` 仍为 string，kind 仅用于生成与交付摘要）。

### vocal（口技）

文中有笑/叹/哭/惊等**必须挂** vocal；禁止用咚/哐/撞击顶替口技。

| voiceTag | 依据 |
|----------|------|
| `soft_laugh` / `laugh` | 笑 |
| `cry_sniff` / `sob` | 哭、哽咽 |
| `angry_huff` | 生气、啐 |
| `surprised` / `gasp` | 震惊、倒吸气 |
| `sigh` | 叹气 |
| `soft_affirm` | 「嗯」等轻应 |

### foley（轻环境音）

须有**原文动作/场面依据**；短、轻、不抢对白；无依据不挂。

| voiceTag | 依据 |
|----------|------|
| `footsteps` | 脚步 |
| `knock` | 敲门 |
| `door_open` / `door_close` | 门开合 |
| `cloth_rustle` | 衣料轻响 |

### 硬规则

1. 文写笑/叹 → 必须 **vocal**，禁止用咚/哐/撞击顶替  
2. foley 短、轻、不抢对白；无依据不挂  
3. 禁止无依据堆砌打击乐、轰鸣、UI 点击，把整篇做成机械咚哐  
4. 仍禁止对白 TTS  
5. **生成提示**（按 kind 选用模板，将 `{desc}` 换为具体听感描述）：  
   - **vocal**：`human vocalization, mouth sound only, short {desc}, no music, no percussion, no impact hit`  
   - **foley**：`soft short foley, {desc}, quiet, no music, no heavy explosion`  
6. **交付摘要**：每个 voiceTag 注明 **kind + 原文依据句**；口技听感像打击乐 → 重做或静音  

### 其它约定

- **少而准**：全篇 vocal 常用 2～6 个标签；foley 按场面需要，通常 0～3 个  
- 按角色气质选 vocal 音色（少女轻笑 vs 低沉冷哼）  
- 剧本里 `voiceTag` 必须 ⊆ 本篇拟声清单（vocal + foley 合并）  

## D. 写入下游

- 角色卡：`expressions` = 本篇清单（可角色共用同一情绪包）  
- 剧本：每句 dialogue 的 emotion/voiceTag 来自清单  
- 交付摘要：用自然语言说明「成色=…；差分=…；拟声(vocal)=…；拟声(foley)=…」（拟声项含 kind 与原文依据句）
