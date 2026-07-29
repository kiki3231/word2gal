# 角色卡（内部约定）

> 由 Agent 从「文章抽取 + 网查形象」得到。用户不填写本文件格式。

## 字段

| 字段 | 说明 |
|------|------|
| `id` | 稳定英文/拼音 id |
| `displayName` | 对白显示名 |
| `stylePack` | 默认 `daily-heal` |
| `lookup` | `web` / `fallback` / `offline` |
| `referenceNote` | 网查结论或回退原因（一句话） |
| `referenceImage` | 可选，本地参考图路径 |
| `hair` / `eyes` / `outfit` / `vibe` | 短参数（来自检索要点或文内描写） |
| `expressions` | **本篇**情绪差分子集（见 `emotion-and-sfx.md`），含 `neutral` |
| `voiceProfile` | 拟声音色档：`bright_soft` / `calm_low` / `cheerful` / `dark_low` |

## 流程要点

1. 先 `extraction.md` 得到 `appearanceClues` 与 `searchQuery`  
2. 再 `character-lookup.md` 网查 → 填 `lookup` + 短参数  
3. `expressions` 不来自「永远五件套」，而来自本篇成色裁剪结果  

## 示例

- 网查成功：某作品黑长直角色 → `lookup=web`，`hair=black long straight`，`referenceNote=参考通行同人/设定发色发型`  
- OC 回退：文内「马尾、校服」→ `lookup=fallback`，短参数仅来自文章  

## 规则

- 禁止把网页长文或整段人设散文直接丢进文生图  
- 同一 `id` 全剧共用基准形象；表情差分只改表情，不改身份特征  
