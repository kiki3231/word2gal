# 样例跑通（基于 minimal-input）

## 用户输入

见 `examples/minimal-input.md`（自然语言剧情 + 二选一分支）。

## Agent 内部产物摘要（用户不手写）

### 剧本

- meta.title：音乐室匿名信；stylePack：daily-heal  
- 节点：scene → narration → 小悠 dialogue(surprise) → 阿凛 dialogue(neutral) → choice → 两个 ending  
- 校验：`node scripts/validate-script.mjs scripts/fixtures/valid-script.json` → OK  

### 角色卡

| id | displayName | hair / vibe | voiceProfile |
|----|-------------|-------------|--------------|
| you | 小悠 | black long ponytail / energetic | cheerful |
| rin | 阿凛 | short dark / calm | calm_low |

### 成品

- 模板：`templates/player-basic.html`  
- 演示打包：仓库根目录 `output/demo-music-room.html`（默认 SVG 立绘/背景；短音为空则静音）  

## 验收步骤

1. 双击或用浏览器打开 `output/demo-music-room.html`  
2. 点击/空格推进对白，看到立绘与对话框  
3. 在选项处分别走「当场拆开」「带回家晚上再拆」  
4. 试存档/读档  
5. 缺专用立绘时仍显示 default，不白屏  
