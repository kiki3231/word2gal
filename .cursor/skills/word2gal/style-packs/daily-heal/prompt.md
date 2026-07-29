# Style Pack: daily-heal

日系半身立绘壳。出图时套用；**形象内容**必须来自网查参考或文内回退短参数，不得自由换脸。

## 正提示骨架

```
anime style, visual novel character portrait, bust shot half body,
clean lineart, soft lighting, solid light gray background (#d8d8d8),
looking at viewer, consistent character design,
matching reference appearance closely,
{hair}, {eyes} eyes, wearing {outfit}, {vibe}, expression: {emotion_phrase}
```

说明：使用**实心浅灰底**便于 `scripts/cut-sprite.mjs` 做边缘洪水抠图；不要生成半透明人物或噪点底。若有参考图：优先 reference 约束，再叠加短参数。

## 负提示

```
extra faces, extra limbs, extra hands, deformed hands, text, subtitle,
watermark, logo, realistic photo, 3d render, low quality, blurry,
wrong hair color, different person from reference,
full body crowded background, speech bubble
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
