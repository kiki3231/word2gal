# 资源命名与打包（Bake）

> 内部约定。用户只提供自然语言文章。

## 资源 key


| 类型  | assets 路径              | 示例                                   |
| --- | ---------------------- | ------------------------------------ |
| 立绘  | `chars.{id}_{emotion}` | `you_surprise`                       |
| 背景  | `bgs.{sceneKey}`       | `music_room`                         |
| 拟声  | `sfx.{voiceTag}`       | `soft_laugh`                         |
| BGM | `bgm.{key}`            | `sad` / `happy` / `love`（见 `bgm.md`） |


另需：`speakerToId`、`chars.default`、`bgs.default`。有 BGM 时另需 `meta.bgm` + 对应 `bgm.sad`、`bgm.happy` 或 `bgm.love`。

### `speaker-map.json`（推荐必写）

路径：`assets/speaker-map.json`，形状 `{ "显示名": "立绘id", ... }`。  
也可用 `meta.speakerMap`（同形）。Bake **不写死**特定角色名；缺映射时仅做通用推断（id 全等 / 唯一模糊 / 单角色兜底），其余 **warn** 并可能无立绘。  
首次 Bake 若文件不存在且已推断出映射，会写出该文件供复核。

## 生成顺序

1. 已完成抽取、成色、网查角色卡
2. 为本篇 `expressions` 生成**全身**差分立绘——真透明优先（见 `style-packs/daily-heal/prompt.md`）；**自动确认连出**
3. 实心底/假透明时：绿幕 `#00FF00` 重出 + `cut-sprite.mjs --mode green` → `*_cut.png`（浅灰白底才用 `--mode flood`）
4. `check-sprite-alpha.mjs <assetsDir>`（仅拦全不透明底板）+ **目视**无残底
5. 本篇拟声清单（见 `emotion-and-sfx.md`）
6. 场景背景按文章与成色生成
7. 按 `bgm.md` 设 `meta.bgm`；Bake 从 `music/<key>.mp3` 复制到 `assets/bgm/`
8. 失败 ≤2 → defaults / 静音

```bash
node skills/word2gal/scripts/validate-coverage.mjs <source.txt> <script.json>
node skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>
node skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>
node skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```



## Bake

1. `validate-script.mjs` + `validate-coverage.mjs` 通过
2. 读取 `templates/player-basic.html`；**仅**替换 `__SCRIPT_JSON__` / `__ASSETS_JSON__` / `__THEME_ID__` / `__THEME_CSS__`
3. 有 `meta.bgm`：`music/<key>.mp3` → `assets/bgm/<key>.mp3` + 写入 `assets.bgm`
4. 舞台为左右全身立绘（`#sprite-left` / `#sprite-right`）；禁止立绘叠底 blend
5. 输出 `output/<短目录>/<作品名>.html` + `assets/`（作品名=`meta.title`，勿用 `index.html`）
6. `speaker-map.json`（或 `meta.speakerMap`）覆盖全部 `dialogue.speaker`



## 交付条件

- 未要求用户填格式；主角注明 lookup；原文覆盖通过（`extraction.md`）
- 差分 ⊆ 成色；拟声 ⊆ 文章（vocal+foley）；无全文 TTS / 咚哐顶替口技
- 立绘真透明或绿幕抠净；`check-sprite-alpha` 通过；目视无残底
- 主题与 mood 一致；有据 BGM；校验通过；可玩（左右全身同框正常）；摘要说明回退