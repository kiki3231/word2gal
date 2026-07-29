# 资源命名与打包（Bake）

> 内部约定。用户只提供自然语言；Agent 完成下列步骤后输出 HTML。

## 资源 key 命名

| 类型 | key 格式 | 示例 |
|------|----------|------|
| 立绘 | `char_{id}_{emotion}` → assets.chars | `you_surprise` |
| 背景 | `bg_{sceneId}` → assets.bgs | `music_room` |
| 短音 | `sfx_{voiceTag}` → assets.sfx | `surprised` |

另需：

- `assets.speakerToId`：显示名 → 角色 id
- `chars.default` / `bgs.default`：回退图（可用风格包 defaults）

## 推荐 voiceTag

`soft_affirm` `surprised` `gasp` `sigh` `soft_laugh` `angry_huff`

无音频能力或不达标 → 该 tag 不写入或播静音，**不阻断**。

## 生成与回退

1. 按 `style-packs/<pack>/prompt.md` + 角色卡出立绘/表情差分  
2. 失败重试 ≤2 → 使用 defaults  
3. 背景：风格包场景或默认 `bg_default`  
4. 短音：按标签生成或跳过  

## Bake 步骤

1. 用 `scripts/validate-script.mjs` 校验内部剧本 JSON  
2. 复制 `templates/player-basic.html`（模式二用 `player-advanced.html`）  
3. **仅**替换：
   - `__SCRIPT_JSON__` → 剧本 JSON 文本  
   - `__ASSETS_JSON__` → 资源 JSON（data URL 或相对路径字符串）  
4. **禁止**修改播放器逻辑 `<script>`（非两个 JSON 标签内的代码）  
5. 输出到用户指定路径，或 `output/<title>.html`  

## 自检清单

- [ ] 未要求用户填写 JSON / 路径 / 标记语法  
- [ ] `validate-script.mjs` 通过  
- [ ] 缺立绘/音时有 default 或静音，页面不白屏  
- [ ] Chrome/Edge 可打开并走完分支  
- [ ] 用自然语言摘要告知用户哪些素材用了默认占位  
