# 资源命名与打包（Bake）

> 内部约定。用户只提供自然语言文章。

## 资源 key

| 类型 | assets 路径 | 示例 |
|------|-------------|------|
| 立绘 | `chars.{id}_{emotion}` | `you_surprise` |
| 背景 | `bgs.{sceneKey}` | `music_room` |
| 拟声 | `sfx.{voiceTag}` | `soft_laugh` |

另需：`speakerToId`、`chars.default`、`bgs.default`。

## 生成顺序（对照验收标准）

1. 已完成抽取、成色、网查角色卡  
2. 仅为**本篇 expressions** 生成差分立绘（**纯绿幕 #00FF00** + 风格包；勿依赖真透明 PNG）  
3. **抠图**：`node scripts/cut-sprite.mjs --mode green --dir <dir>`（只去绿）。禁止激进洪水/浅灰色键。自检：身体完整不镂空  
4. 仅为**本篇拟声清单**生成/选用短音  
5. 场景背景按文章场景与成色生成  
6. 失败 ≤2 次 → defaults / 静音  

## Bake

1. `validate-script.mjs` 通过  
2. 复制 `templates/player-basic.html`（或 advanced）——模板已含实心立绘层与 Noto Sans SC 抗锯齿正文  
3. **仅**替换 `__SCRIPT_JSON__`、`__ASSETS_JSON__`（立绘路径指向 `*_cut.png`）  
4. 禁止改播放器逻辑；禁止给 `#sprite` 加会叠底的 blend/透明度  
5. 输出 `output/<短目录>/<作品名>.html` + `assets/`（作品名 = `meta.title`，勿用 `index.html`）  

## 自检清单

- [ ] 未要求用户填格式  
- [ ] 主角均注明 lookup 来源  
- [ ] 差分 ⊆ 成色裁剪清单；拟声 ⊆ 文章依据  
- [ ] 无全文 TTS  
- [ ] 立绘无穿模、无明显灰底白边（已用强化洪水抠图）  
- [ ] 对白字体清晰；游玩区近全屏  
- [ ] 界面主题与文章 mood 一致（摘要中说明）  
- [ ] 校验通过；可玩；摘要已用自然语言说明回退项  
