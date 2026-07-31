# daily-heal 默认占位资源

首版可用本目录 SVG 占位；出图失败时按下列 key 回退。后续可替换为 PNG。

## 约定文件名

| 文件 | 用途 |
|------|------|
| `char_default_neutral.svg` | 通用立绘回退 |
| `bg_default.svg` | 通用背景回退 |

Bake 时映射为 assets key：

- `chars.default` / `chars.default_neutral`
- `bgs.default`

短反应音无文件时：该句静音（不阻断）。

## 画风锚点（anchors/）

`lookup=fallback` 或无名路人、且本篇**无**已成功网查的原作立绘时，按角色类型选用内置锚作 `reference_image`（画风 0 差异）。画风来源：套号 2 — 偏冷光、赛璐璐清晰、发丝高光与眼神光锐利、商业 VN 立绘。

| 文件 | 用途 |
|------|------|
| `anchors/anchor_heroine.png` | 女主向 / 女性主角画风锚 |
| `anchors/anchor_hero.png` | 男主向 / 男性主角画风锚 |
| `anchors/anchor_npc.png` | 其它角色 / 无名路人画风锚 |

**优先级：** 本篇已有原作角色立绘 → 仍优先锚该原作立绘；仅当全员 fallback 或无原作时，才用上表内置锚。

绿幕抠图 + `check-sprite-alpha` 通过后上架；残底不上架。

## 可替换说明

生成合格立绘后，用 `char_{id}_{emotion}` 覆盖对应 key；本目录占位仅保底。
