# 游玩界面主题（内部）

> 根据文章 `meta.mood`（核心情绪成色）自动选择播放器 UI 主题。用户不选手动填主题 id。

## 成色 → 主题

| meta.mood | 主题文件 | 观感 |
|-----------|----------|------|
| `warm_daily` | `themes/warm_daily.css` | 暮光木色、暖金对话框（日常治愈） |
| `bittersweet` | `themes/bittersweet.css` | 冷青灰、细线框（虐心隐痛） |
| `tense` | `themes/tense.css` | 暗蓝黑、锐利边（悬疑不安） |
| `hotblood` | `themes/hotblood.css` | 深红黑、强对比（燃向） |
| `comedy` | `themes/comedy.css` | 明亮奶油、圆角活泼（轻松搞笑） |

未识别 mood → 默认 `warm_daily`。

## Bake 注入

1. 读 `script.meta.mood` → 选定主题 id  
2. 将 `templates/themes/<id>.css` 全文替换进播放器占位符 `__THEME_CSS__`  
3. 将 `<html>` 的 `data-theme="__THEME_ID__"` 换成该 id  
4. 交付摘要用自然语言说明：「界面主题=…（因文章成色…）」

## 规则

- 主题只改 CSS 变量与少量装饰，**不改**播放器 JS 逻辑  
- 禁止让用户选择「填 CSS」；若用户口语说「要虐心风界面」可映射到 mood/theme，但仍用自然语言确认即可  
