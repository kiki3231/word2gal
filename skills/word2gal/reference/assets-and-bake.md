# 资源命名与打包（Bake）

> 内部约定。用户只提供自然语言文章。

## 资源 key

| 类型 | assets 路径 | 示例 |
|------|-------------|------|
| 立绘 | `chars.{id}_{emotion}` | `you_surprise` |
| 背景 | `bgs.{sceneKey}` | `music_room` |
| 拟声 | `sfx.{voiceTag}` | `soft_laugh` |
| BGM | `bgm.{key}` | `sad` / `happy` / `love`（见 `bgm.md`） |

另需：`speakerToId`、`chars.default`、`bgs.default`。有 BGM 时另需 `meta.bgm` + 对应 `bgm.sad`、`bgm.happy` 或 `bgm.love`。

### `speaker-map.json`（推荐必写）

路径：`assets/speaker-map.json`，形状 `{ "显示名": "立绘id", ... }`。  
也可用 `meta.speakerMap`（同形）。Bake **不再**写死演示角色名；缺映射时仅做通用推断（id 全等 / 唯一模糊 / 单角色兜底），其余 **warn** 并可能无立绘。  
首次 Bake 若文件不存在且已推断出映射，会写出该文件供复核。

## 生成顺序（对照验收标准）

1. 已完成抽取、成色、网查角色卡  
2. 仅为**本篇 expressions** 生成差分立绘——**真透明优先**（风格包默认路径，见 `style-packs/daily-heal/prompt.md`）；**一律自动确认、连续出图**  
3. **（必要时）抠图回退**：仅当模型返回实心底/假透明时，绿幕 `#00FF00` 重出 + `cut-sprite.mjs --mode green` → `*_cut.png`（浅灰白底才用 `--mode flood`）。勿高容差洪水抠穿白衣/皮肤  
4. **alpha 抽检**：`check-sprite-alpha.mjs <assetsDir>` 通过——**仅**拦全不透明底板（无透明像素即 fail）；脚本通过 ≠ 无残底  
5. **目视 QA**：绿/灰 fringe、画进人物的棋盘格仍须 Agent 看图；残底不上架  
6. 仅为**本篇拟声清单**生成/选用短音（vocal 口技 + 有据 foley，见 `emotion-and-sfx.md`）  
7. 场景背景按文章场景与成色生成（场景图可有完整画面；同样自动确认）  
8. 按 `bgm.md` 设 `meta.bgm`（`sad` / `happy` / `love`）；Bake 时从 `music/<key>.mp3` 复制到 `assets/bgm/`  
9. 失败 ≤2 次 → defaults / 静音  

```bash
# 原文覆盖 → 抠图回退（需要时）→ alpha 抽检 → Bake
node skills/word2gal/scripts/validate-coverage.mjs <source.txt> <script.json>
node skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>
node skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>
node skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
# 模式二（特效模板，与 basic 同舞台能力）：
node skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir> --template advanced
```

## Bake

1. `validate-script.mjs` + `validate-coverage.mjs` 通过  
2. 按 `--template basic|advanced`（默认 basic）读取模板；**仅**替换 `__SCRIPT_JSON__` / `__ASSETS_JSON__` / `__THEME_ID__` / `__THEME_CSS__`（立绘用真透明或 `*_cut.png`）  
3. 有 `meta.bgm`：`music/<key>.mp3` → `assets/bgm/<key>.mp3` + 写入 `assets.bgm`  
4. 舞台为左右双立绘（`#sprite-left` / `#sprite-right`）；禁止给立绘加叠底 blend；说话人高亮、非说话人半透明由播放器处理  
5. 输出 `output/<短目录>/<作品名>.html` + `assets/`（作品名=`meta.title`，勿用 `index.html`）  
6. 确保 `speaker-map.json`（或 `meta.speakerMap`）覆盖全部 `dialogue.speaker`  


## 自检清单

- [ ] 未要求用户填格式；主角注明 lookup；原文覆盖通过（`extraction.md`）  
- [ ] 差分 ⊆ 成色；拟声 ⊆ 文章（vocal+foley）；无全文 TTS / 咚哐顶替口技  
- [ ] 立绘真透明或绿幕抠净；`check-sprite-alpha` 通过；目视无残底（脚本通过 ≠ 已抠净）  
- [ ] 主题与 mood 一致；有据 BGM（`sad`/`happy`/`love`）；校验通过；可玩；摘要说明回退  

