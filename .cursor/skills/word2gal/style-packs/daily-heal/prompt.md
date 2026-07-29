# Style Pack: daily-heal

日系半身立绘壳。出图时套用；**形象内容**必须来自网查参考或文内回退短参数，不得自由换脸。

## 正提示骨架（默认：绿幕，避免事后抠穿人物）

```
anime style, visual novel character portrait, bust shot half body,
clean lineart, soft lighting,
solid pure chroma green background #00FF00,
looking at viewer, consistent character design,
matching reference appearance closely,
{hair}, {eyes} eyes, wearing {outfit}, {vibe}, expression: {emotion_phrase}
```

**硬性要求：**

1. 背景必须是**纯绿幕 `#00FF00`**（或极接近），人物与绿幕分离清晰  
2. **禁止**半透明人物、灰底板、白底方块、地面阴影板  
3. **不要**请求「transparent PNG」——当前生图管线往往给不出真 alpha；绿幕 + `cut-sprite.mjs --mode green` 更稳  
4. 生图后运行：`node scripts/cut-sprite.mjs --mode green --dir <dir>`  
5. **禁止**再对成品用激进洪水/浅灰色键（会把衣服脸抠穿）

若有参考图：优先 reference 约束，再叠加短参数。

## 负提示

```
extra faces, extra limbs, extra hands, deformed hands, text, subtitle,
watermark, logo, realistic photo, 3d render, low quality, blurry,
wrong hair color, different person from reference,
gray background, white background, checkerboard, shadow under feet,
full body crowded background, speech bubble, translucent body
```

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

## UI 提示

本包偏日常暖光；若 `meta.mood` 为 bittersweet/tense，背景与色调应随之偏冷/偏暗（仍用同一立绘规范）。

## 失败回退

重试 ≤2 → `defaults/`，剧情可玩。
