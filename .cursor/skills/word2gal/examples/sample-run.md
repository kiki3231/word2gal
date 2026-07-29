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
- **可看版演示：** `output/playable/index.html`（立绘抠图 + 音乐室背景 + 短反应音；相对路径资源）  
- 重新打包：`node .cursor/skills/word2gal/scripts/bake-demo.mjs`  

## 验收步骤

1. 用浏览器打开 `output/playable/index.html`（不要只拷走 html 而丢掉 `assets/`）  
2. 点击/空格推进：应看到真实立绘、场景背景、对话框样式  
3. 小悠惊讶句可听到短反应音（需先点击一次解锁音频）  
4. 走完两个分支结局；试存读档 
