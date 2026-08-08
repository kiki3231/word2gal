# Style Pack: daily-heal

日系**大腿以上**立绘壳（左右舞台位，膝上约中段裁切）。出图时套用；**形象内容**必须来自网查参考或文内回退短参数，不得自由换脸。

**自动确认：** 本包相关文生图一律自动执行并确认，禁止逐张打断用户。  
抠图 / alpha 检查命令与上架条件：见 `reference/assets-and-bake.md`。

## 立绘背景策略（绿幕默认，防白边）

**默认路径：** 真透明优先 → 不合格则绿幕 `#00FF00` 重出 → `cut-sprite.mjs --mode green` → alpha 检查 + 目视无白/绿毛边。  
**OC / 路人：** 有本篇原作立绘 → 作 `reference_image` 画风锚；无原作/全员 fallback → 用 `defaults/anchors/`（女主/男主/路人）。同篇画风 0 差异。  
**上架条件：** 游戏中立绘后必须直接透出场景；残绿/白边/灰底/棋盘格 → 禁止 Bake，重做。

## 正提示骨架

### 默认（优先）

```
anime style, visual novel character sprite,
thighs-up framing, mid-thigh crop, head to mid-thigh visible,
upper body and thighs in frame, no feet, no shoes visible,
clean lineart, soft lighting,
isolated character on empty plain backdrop, no scenery, no floor,
looking at viewer, consistent character design,
matching reference appearance closely,
{age_phrase}, {hair}, {eyes} eyes, wearing {outfit}, {vibe},
demeanor: {demeanor}, expression: {emotion_phrase}, pose: {pose_phrase}
```

`{age_phrase}` / `{demeanor}` 来自角色卡 `ageBand`、`demeanor`（见 `reference/character-lookup.md`）。  
`{emotion_phrase}` / `{pose_phrase}` 见下文表情与姿态表；**文中有更具体动作时用文驱姿态覆盖默认 `{pose_phrase}`**。

**硬性要求：**

1. 正提示强调无场景底板，**禁止**写 checkerboard / checkered pattern / alpha preview  
2. **禁止**白底、灰底、棋盘格、地面阴影板、场景背景  
3. 人物本体实心不透；取景为**大腿以上**（头～大腿中段）；禁止从头到脚全身，禁止只到腰/胸的 bust  
4. 每张差分须含与 emotion 匹配的**姿态/手势**，禁止全篇同一站姿只换脸  
5. 生图后跑 alpha 检查；合格可直接整理为 `*_cut.png`，**跳过**绿幕抠图  
6. **年龄与神态必须锁死**：小孩↔大人颠倒 → 作废重画  

若有参考图：优先 reference 约束，再叠加短参数与年龄/神态锁。

### 绿幕回退

当默认路径产出实心底、灰白底或棋盘格假透明时，改用以下正提示重生成：

```
anime style, visual novel character sprite,
thighs-up framing, mid-thigh crop, head to mid-thigh visible,
upper body and thighs in frame, no feet, no shoes visible,
clean lineart, soft lighting,
solid pure chroma key green background #00FF00,
flat even green screen behind character, no gradient on background,
looking at viewer, consistent character design,
matching reference appearance closely,
{age_phrase}, {hair}, {eyes} eyes, wearing {outfit}, {vibe},
demeanor: {demeanor}, expression: {emotion_phrase}, pose: {pose_phrase}
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
full body head to toe, feet visible, shoes visible, standing on floor,
bust shot, chest-up only, cropped at waist, close-up portrait,
same idle standing pose for every emotion, face-swap only,
checkerboard, checkered pattern, alpha preview,
white background, gray background, black background, gradient background,
shadow under feet, floor shadow plate, studio backdrop, scenery,
crowded background, speech bubble, translucent body
```

按 `ageBand` 再追加对应负提示（见 `character-lookup.md` 年龄表）。

### 绿幕回退

同默认负提示，另加：`transparent background`。

## 表情与姿态短语（按本篇清单选用）

| emotion | emotion_phrase | pose_phrase（默认；文有动作则覆盖） |
|---------|----------------|-------------------------------------|
| neutral | calm neutral face | relaxed arms at sides, composed posture |
| smile | soft smile | one hand lightly near chest or soft open gesture |
| laugh | bright laughing face | hand near mouth or light cheerful gesture |
| surprise | surprised open eyes | hands raised near chest, startled lean |
| sad | sad downturned eyes | arms loosely held, shoulders slightly down |
| cry | tearful crying face | wiping tears or hands clasped near face |
| angry | mild frown angry, pout | clenched fists at sides or tightly held |
| tense | uneasy tense expression | arms crossed or hands gripping own sleeve |
| soft_shy | shy soft blush | hand covering mouth or fingers near lips, bashful |

未列出的 emotion → 回退 neutral（脸+姿态）。  
**文驱覆盖示例：** 文写「嘟嘴握拳」→ angry 用 `pouting, both fists clenched`；文写「捂嘴娇羞」→ soft_shy 用 `covering mouth with one hand, heavy blush`。

## 抠图（回退时必做）

见 `assets-and-bake.md`。默认路径若已是干净透明 PNG → 跳过抠图，命名 `*_cut.png`。

## UI 提示

本包偏日常暖光；若 `meta.mood` 为 bittersweet/tense，背景与色调应随之偏冷/偏暗（仍用同一立绘规范）。  
播放器舞台按大腿以上立绘取景（见 `templates/player-basic.html`）。

## 失败回退

重试 ≤2 → `defaults/`，剧情可玩。
