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
2. 仅为**本篇 expressions** 生成差分立绘（参考形象约束 + 风格包；浅灰实心底便于抠图）  
3. **抠图**：`node scripts/cut-sprite.mjs --dir <dir>`（边缘洪水填充）。禁止全局浅灰色键。自检：立绘身体/脸不得半透、不得噪点穿帮  
4. 仅为**本篇拟声清单**生成/选用短音  
5. 场景背景按文章场景与成色生成  
6. 失败 ≤2 次 → defaults / 静音  

## Bake

1. `validate-script.mjs` 通过  
2. 复制 `templates/player-basic.html`（或 advanced）——模板已含实心立绘层与 Noto Sans SC 抗锯齿正文  
3. **仅**替换 `__SCRIPT_JSON__`、`__ASSETS_JSON__`（立绘路径指向 `*_cut.png`）  
4. 禁止改播放器逻辑；禁止给 `#sprite` 加会叠底的 blend/透明度  
5. 输出 `output/<title>/index.html` + 可选 `assets/`  

## 自检清单

- [ ] 未要求用户填格式  
- [ ] 主角均注明 lookup 来源  
- [ ] 差分 ⊆ 成色裁剪清单；拟声 ⊆ 文章依据  
- [ ] 无全文 TTS  
- [ ] 立绘无穿模（脸/衣服不透出背景课桌）  
- [ ] 对白字体清晰流畅（中文字体已加载）  
- [ ] 校验通过；可玩；摘要已用自然语言说明回退项  
