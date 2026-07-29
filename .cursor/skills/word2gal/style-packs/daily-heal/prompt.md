# Style Pack: daily-heal（日常治愈）

面向同人短篇的日系半身立绘。Agent 出图时**必须**套用本节，不得自由发挥长描述。

## 正提示（固定骨架）

```
anime style, visual novel character portrait, bust shot half body,
clean lineart, soft lighting, gentle colors, transparent background,
looking at viewer, consistent character design,
{hair}, {eyes} eyes, wearing {outfit}, {vibe} expression mood: {emotion}
```

将 `{hair}` `{eyes}` `{outfit}` `{vibe}` `{emotion}` 替换为角色卡短参数。

## 负提示（固定）

```
extra faces, extra limbs, extra hands, deformed hands, text, subtitle,
watermark, logo, realistic photo, 3d render, low quality, blurry,
full body crowded background, speech bubble
```

## 表情差分

对同一角色卡，只替换 `emotion` 对应词：

| emotion | 提示词追加 |
|---------|------------|
| neutral | calm neutral face |
| smile | soft smile |
| surprise | surprised open eyes |
| sad | sad downturned eyes |
| angry | mild frown angry |

保持 hair/eyes/outfit/vibe 不变；有参考图/种子则复用。

## UI / 节奏（本包）

- 对话框：圆角浅色底、深色字
- 文本节奏：中等打字速度
- 默认转场：简单淡入

## 失败回退

重试 ≤2 次仍不合格 → 使用 `defaults/` 下占位图，剧情照常可玩。
