# 样例跑通（对照四条验收标准）

## 用户输入

见 `examples/minimal-input.md`（自然语言文章：角色、场景、对话、二选一）。

## Agent 应按新工作流产出

1. **抽取**：角色小悠/阿凛；场景旧音乐室黄昏；对话链；二选一分支  
2. **成色**：`warm_daily`（带一点心事）→ 差分如 `neutral/surprise/smile`；拟声如文中惊讶 → `gasp`  
3. **网查**：若可检索同人/通行形象则 `lookup=web`；否则按文内「马尾/话少校服」`fallback` 并告知  
4. **剧本 + 校验** → Bake → `output/playable/` 或新目录  

## 现有可玩样例

`output/playable/` 与 `output/hailin-taki/<作品名>.html` 为已 bake 的测试案例。  
HTML **以作品名命名**（如 `熊猫与初夏的风.html`），不要用 `index.html`。  
**正式跑 Skill 时**须走完整：抽取 → 成色 → 网查 → 生成 → bake，不能只复制旧 assets 假装完成验收。

## 验收口述模板（交付用户时）

- 识别到的角色/场景/分支：…  
- 形象来源：角色A=网查…；角色B=文内回退…  
- 情绪成色与差分：…  
- 拟声列表与依据：…  
- 默认占位：…  
