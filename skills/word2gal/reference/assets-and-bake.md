# 资源命名与打包（Bake）

> 内部约定。用户只提供自然语言文章。

## 资源 key

| 类型 | assets 路径 | 示例 |
|------|-------------|------|
| 立绘 | `chars.{id}_{emotion}` | `you_surprise` |
| 背景 | `bgs.{sceneKey}` | `music_room` |
| 拟声 | `sfx.{voiceTag}` | `soft_laugh` |
| BGM | `bgm.{key}` | `sad` / `love`（见 `bgm.md`） |

另需：`speakerToId`、`chars.default`、`bgs.default`。有 BGM 时另需 `meta.bgm` + 对应 `bgm.sad` 或 `bgm.love`。

## 生成顺序（对照验收标准）

1. 已完成抽取、成色、网查角色卡  
2. 仅为**本篇 expressions** 生成差分立绘——**真透明优先**（风格包默认路径，见 `style-packs/daily-heal/prompt.md`）；**一律自动确认、连续出图**  
3. **（必要时）抠图回退**：仅当模型返回实心底/假透明时，绿幕 `#00FF00` 重出 + `cut-sprite.mjs --mode green` → `*_cut.png`（浅灰白底才用 `--mode flood`）。勿高容差洪水抠穿白衣/皮肤  
4. **alpha 抽检**：`check-sprite-alpha.mjs <assetsDir>` 通过——**仅**拦全不透明底板（无透明像素即 fail）；脚本通过 ≠ 无残底  
5. **目视 QA**：绿/灰 fringe、画进人物的棋盘格仍须 Agent 看图；残底不上架  
6. 仅为**本篇拟声清单**生成/选用短音（vocal 口技 + 有据 foley，见 `emotion-and-sfx.md`）  
7. 场景背景按文章场景与成色生成（场景图可有完整画面；同样自动确认）  
8. 按 `bgm.md` 设 `meta.bgm`（`sad` / `love`）；Bake 时从 `music/<key>.mp3` 复制到 `assets/bgm/`  
9. 失败 ≤2 次 → defaults / 静音  

推荐命令：

```bash
node skills/word2gal/scripts/cut-sprite.mjs --mode green --dir <assetsDir>   # 仅回退需要时
node skills/word2gal/scripts/check-sprite-alpha.mjs <assetsDir>
node skills/word2gal/scripts/bake-story.mjs <script.json> <assetsDir> <outDir>
```

## Bake

1. `validate-script.mjs` 通过  
2. 复制 `templates/player-basic.html`（或 advanced）——模板已含实心立绘层与 Noto Sans SC 抗锯齿正文  
3. **仅**替换 `__SCRIPT_JSON__`、`__ASSETS_JSON__`、`__THEME_ID__` / `__THEME_CSS__`（立绘路径指向真透明或抠净后的 `*_cut.png`）  
4. 若 `meta.bgm` 为 `sad` / `love`：复制 `music/<key>.mp3` → `assets/bgm/<key>.mp3` 并写入 `assets.bgm`  
5. 禁止给 `#sprite` 加会叠底的 blend/透明度  
6. 输出 `output/<短目录>/<作品名>.html` + `assets/`（作品名 = `meta.title`，勿用 `index.html`）  

## 自检清单

- [ ] 未要求用户填格式  
- [ ] 主角均注明 lookup 来源  
- [ ] 差分 ⊆ 成色裁剪清单；拟声 ⊆ 文章依据（vocal + foley）  
- [ ] 无全文 TTS；口技为人声，无咚哐顶替  
- [ ] 立绘真透明（或绿幕回退抠净）；`check-sprite-alpha` 通过（仅证非全不透明底板）  
- [ ] Agent 目视无残底：游戏中无棋盘格/灰白/绿幕 fringe（脚本通过 ≠ 已抠净）  
- [ ] 原文覆盖自检通过（见 `extraction.md`）  
- [ ] 对白字体清晰；游玩区近全屏  
- [ ] 界面主题与文章 mood 一致（摘要中说明）  
- [ ] 伤感/恋爱向作品有对应 BGM（`sad` / `love`，首次点击后循环）  
- [ ] 校验通过；可玩；摘要已用自然语言说明回退项  
