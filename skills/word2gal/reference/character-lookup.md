# 角色形象网查与深度分析（内部）

> 网查通行长相后出图。先分析、1～2 张对照，再出图。禁止年龄/体型/神态低级错画。

## 原则

**先查、先比、先卡死设定，再画。** 无检索/无年龄核对禁止凭记忆乱画（无联网见回退）。

## 禁止的低级错误（出图前必须自检）

| 错误 | 典型表现 | 防呆 |
|------|----------|------|
| 小孩画成大人 | 小学生/幼年角色出成高挑成人脸、丰满体型 | 锁定 `ageBand` + prompt 年龄词 |
| 大人画成小孩 | 成熟角色出成幼齿圆脸、过大眼睛、矮小比例 | 同上；负提示加 `chibi, loli, shota, child face` 等 |
| 串脸 | A 角色长成 B | 对照后写「不可变特征清单」 |
| 文设冲突 | 文写「短发黑瞳」却生成长金发 | 文内线索优先覆盖冲突的网查细节，并注明 |
| 神态不符 | 文写冷淡寡言却生成开朗甜笑基准脸 | `demeanor` 写入角色卡并进 prompt |

## 步骤（每个主要角色，不可跳步）

### 1. 从文章蒸馏「人物设定要点」（先于网查）

结合 `extraction.md` 的 `appearanceClues` / `personalityClues`，先写出内部分析摘要（不必给用户看长文）：

| 要点 | 必须回答 |
|------|----------|
| `ageBand` | `child` / `teen` / `young_adult` / `adult` / `elder`（文中年级、称呼、身份优先） |
| `bodyType` | 娇小 / 匀称 / 高挑 / 壮实等（有则写，无则「未写」） |
| `faceShape` | 圆润幼齿 / 清秀 / 凌厉等线索 |
| `hair` / `eyes` / `outfit` | 文中明确描写优先 |
| `demeanor` | 冷淡、温柔、别扭害羞、强势等**基准神态**（影响 neutral 脸） |
| `signature` | 标志物：耳机、蝴蝶结、乐器、疤等 |
| `eraSchool` | 是否学生、制服年代感 |

**年龄判定优先级：** 文中明确年龄/学段 > 作品通行设定 > 称呼习惯（「老师」「前辈」）> 外貌形容词。有冲突时在 `referenceNote` 写清取舍。

### 2. 构造查询并执行检索

优先顺序：

1. `作品名 + 角色名 + 立绘/官方图/设定`（若能判断作品）  
2. `角色名 + 外貌关键词`（发色、发型、服装）  
3. 若判定为 OC：不搜「同名动漫角色」硬凑；改为「按文内描写生成」，`lookup=fallback`

使用当前环境可用的联网能力：

- **收集 1～2 张通行形象**（官方立绘、设定图、高共识同人向参考均可；禁止零对照瞎画；版权：仅作参考，不原样塞进成品）  
- 记录可访问的参考图 URL 或下载到本地临时路径，供对照与 `reference_image`

### 3. 对照分析（强制，1～2 张）

对收集到的 1～2 张参考对照，写出：

**不可变特征清单（出图必须保住）：**

- 年龄观感 / 头身比例倾向  
- 发型结构（长短、分缝、刘海、绑法）与发色  
- 瞳色与眼型（圆/细长等）  
- 常服或标志性配饰  
- 体型与肩宽观感  

**可变 / 忽略项：**

- 画风粗细、光影、姿势、同人滤镜色偏  
- 明显 OOC 或幼化/巨化二创（**丢弃**，勿当通行设定）

若两张矛盾：优先官方/设定集；再与文内描写核对。选定 **1 张主参考**（有第二张则作辅参考核年龄/发型）。

### 4. 写入角色卡

见 `character-card.md`，必须含：

- `lookup`: `web` | `fallback` | `offline`  
- `referenceNote`: 查到了什么、对照了几张、年龄取舍（一两句）  
- `ageBand` / `demeanor` / 短参数 `hair` / `eyes` / `outfit` / `vibe`  
- `invariants`: 不可变特征短列表（给自己出图用）  
- 可选 `referenceImage`（主参考本地路径）

**禁止**把网页长文塞进文生图 prompt；只蒸馏短参数 + 年龄词 + 神态词。

### 5. 出图（带年龄与神态锁）

**自动确认 / 全身立绘提示：** 见 `SKILL.md` 硬约束与 `style-packs/daily-heal/prompt.md`。

1. 有主参考图 → 以参考图约束为主，再叠加短参数与 `ageBand` 对应英文年龄提示  
2. 无参考图但有检索要点 → 短参数 + 年龄/神态锁 + 风格包  
3. 同一角色所有表情差分必须基于同一基准；**只改表情，不改年龄、发型结构、配饰**  
4. 均失败重试 ≤2 → defaults，并在摘要中点名该角色

年龄提示示例（写入正提示，按 `ageBand` 选一）：

| ageBand | 正提示关键词 | 负提示加强 |
|---------|--------------|------------|
| child | `child, elementary school age, age 8-12, small stature` | `adult face, tall woman, mature body` |
| teen | `teenage, high school student, age 15-18` | `toddler, elderly, overly mature glam` |
| young_adult | `young adult, early 20s` | `loli, chibi child face` |
| adult | `adult, mature face, mid-late 20s or older as setting` | `child, loli, shota, baby face` |
| elder | `elderly, aged face, gray hair if setting` | `teenager, child` |

神态：把 `demeanor` 写入 `{vibe}` 与 neutral 表情描述（如 `cool reserved neutral face`，而非默认甜笑）。

### 6. 出图后核对（未通过则重做该角色）

对照角色卡与主参考，快速检查：

- [ ] 年龄观感与 `ageBand` 一致（无小孩↔大人颠倒）  
- [ ] 发型/发色/瞳色/标志物与 `invariants` 一致  
- [ ] neutral 神态符合 `demeanor`  
- [ ] 与文内 `appearanceClues` 无硬冲突  

不通过：调整 prompt/换更清晰参考图后重生成，**禁止**带着明显错误进入 Bake。

## 一致性

- 同一角色所有表情差分必须基于同一基准立绘/同一套短参数 + 参考  
- 禁止每张表情重新「换脸」或偷偷改年龄体型

## 无联网 / 检索失败

```
lookup = offline 或 fallback
```

- 仅用文章线索蒸馏；`ageBand` 仍必须填（文中无线索则据身份合理默认，并在摘要说明）  
- **必须**在交付摘要用自然语言告诉用户：哪些角色未能网查、已按文内描写生成

## 路人 / OC / 原作不存在的人（画风 0 差异）

当角色无法网查到通行形象（同人 OC、无名男人/路人等）：

1. `lookup=fallback`，短参数仍写清年龄/发型/服装  
2. **styleAnchor**（`reference_image`）按优先级选定：  
   - **本篇已有至少 1 名网查成功的原作角色** → 仍优先锚该原作立绘（同篇画风 0 差异）  
   - **本篇无原作 / 全员 `lookup=fallback`** → 按角色类型用 `daily-heal` 内置锚：  
     - 女主向 / 女性主角 → `style-packs/daily-heal/defaults/anchors/anchor_heroine.png`  
     - 男主向 / 男性主角 → `style-packs/daily-heal/defaults/anchors/anchor_hero.png`  
     - 其它 / 无名路人 → `style-packs/daily-heal/defaults/anchors/anchor_npc.png`  
3. 出图：风格包绿幕骨架 + styleAnchor 参考 + OC 短参数；只改身份特征，不改线稿/瞳孔高光/上色体系  
4. 出图后与锚角色并排对照：画风分裂 → 重生；禁止写实风、厚涂异画风、Q 版混入全身戏
