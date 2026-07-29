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

## 可替换说明

生成合格立绘后，用 `char_{id}_{emotion}` 覆盖对应 key；本目录占位仅保底。
