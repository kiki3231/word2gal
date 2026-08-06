# Style Pack: daily-heal

日系**全身**立绘壳（左右舞台位）。出图时套用；**形象内容**必须来自网查参考或文内回退短参数，不得自由换脸。

**自动确认：** 本包相关文生图一律自动执行并确认，禁止逐张打断用户。  
抠图 / alpha 抽检命令与上架门槛：见 `reference/assets-and-bake.md`。

## 立绘背景策略（绿幕默认，防白边）

**默认路径：** 真透明优先 → 不合格则绿幕 `#00FF00` 重出 → `cut-sprite.mjs --mode green` → alpha 抽检 + 目视无白/绿毛边。  
**OC / 路人：** 有本篇原作立绘 → 作 `reference_image` 画风锚；无原作/全员 fallback → 用 `defaults/anchors/`（女主/男主/路人）。同篇画风 0 差异。  
**上架门槛：** 游戏中立绘后必须直接透出场景；残绿/白边/灰底/棋盘格 → 禁止 Bake，重做。

## 正提示骨架

### 默认（优先）

```
anime style, visual novel full body character sprite,
full body standing, head to toe visible, feet included,
clean lineart, soft lighting,
isolated character on empty plain backdrop, no scenery, no floor,
looking at viewer, consistent character design,
matching reference appearance closely,
{age_phrase}, {hair}, {eyes} eyes, wearing {outfit}, {vibe},
demeanor: {demeanor}, expression: {emotion_phrase}
```

`{age_phrase}` / `{demeanor}` 来自角色卡 `ageBand`、`demeanor`（见 `reference/character-lookup.md`）。

**硬性要求：**

1. 正提示强调无场景底板，**禁止**写 checkerboard / checkered pattern / alpha preview  
2. **禁止**白底、灰底、棋盘格、地面阴影板、场景背景  
3. 人物本体实心不透；须全身（勿裁成半身 bust）  
4. 生图后跑 alpha 抽检；合格可直接整理为 `*_cut.png`，**跳过**绿幕抠图  
5. **年龄与神态必须锁死**：小孩↔大人颠倒 → 作废重画  

若有参考图：优先 reference 约束，再叠加短参数与年龄/神态锁。

### 绿幕回退

当默认路径产出实心底、灰白底或棋盘格假透明时，改用以下正提示重生成：

```
anime style, visual novel full body character sprite,
full body standing, head to toe visible, feet included,
clean lineart, soft lighting,
solid pure chroma key green background #00FF00,
flat even green screen behind character, no gradient on background,
looking at viewer, consistent character design,
matching reference appearance closely,
{age_phrase}, {hair}, {eyes} eyes, wearing {outfit}, {vibe},
demeanor: {demeanor}, expression: {emotion_phrase}
```

**回退时硬性要求：** 纯色绿幕 `#00FF00`；禁止 transparent/checkerboard 提示；出图后必须 `cut-sprite.mjs --mode green` + `check-sprite-alpha.mjs`；目视无残底。

## 负提示

### 默认（优先）

```
extra faces, extra limbs, extra hands, deformed hands, text, subtitle,
watermark, logo, realistic photo, 3d render, low quality, blurry,
wrong hair color, different person from reference,
wrong age, age mismatch, child as adult, adult as child,
chibi, loli, shota (unless ageBand is child),
bust shot, half body, cropped at waist, close-up portrait,
checkerboard, checkered pattern, alpha preview,
white background, gray background, black background, gradient background,
shadow under feet, floor shadow plate, studio backdrop, scenery,
crowded background, speech bubble, translucent body
```

按 `ageBand` 再追加对应负提示（见 `character-lookup.md` 年龄表）。

### 绿幕回退

同默认负提示，另加：`transparent background`。

## 表情短语（按本篇清单选用）

| emotion | emotion_phrase |
|---------|----------------|
| neutral | calm neutral face |
| smile | soft smile |
| laugh | bright laughing face |
| surprise | surprised open eyes |
| sad | sad downturned eyes |
| cry | tearful crying face |
| angry | mild frown angry |
| tense | uneasy tense expression |
| soft_shy | shy soft blush |

未列出的 emotion → 回退 neutral。

## 抠图（回退时必做）

见 `assets-and-bake.md`。默认路径若已是干净透明 PNG → 跳过抠图，命名 `*_cut.png`。

## UI 提示

本包偏日常暖光；若 `meta.mood` 为 bittersweet/tense，背景与色调应随之偏冷/偏暗（仍用同一立绘规范）。

## 失败回退

重试 ≤2 → `defaults/`，剧情可玩。
