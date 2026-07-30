# 角色卡（内部约定）

> 由 Agent 从「文章抽取 + 多图对照网查」得到。用户不填写本文件格式。

## 字段

| 字段 | 说明 |
|------|------|
| `id` | 稳定英文/拼音 id |
| `displayName` | 对白显示名 |
| `stylePack` | 默认 `daily-heal` |
| `lookup` | `web` / `fallback` / `offline` |
| `referenceNote` | 网查结论：对照了几张图、年龄取舍、或回退原因 |
| `referenceImage` | 可选，主参考图本地路径 |
| `ageBand` | **必填**：`child` / `teen` / `young_adult` / `adult` / `elder` |
| `demeanor` | 基准神态（冷淡、温柔、别扭等），影响 neutral 脸 |
| `hair` / `eyes` / `outfit` / `vibe` | 短参数（检索要点或文内描写蒸馏） |
| `invariants` | 不可变特征短列表（发型结构、标志物、年龄观感等） |
| `expressions` | **本篇**情绪差分子集（见 `emotion-and-sfx.md`），含 `neutral` |
| `voiceProfile` | 拟声音色档：`bright_soft` / `calm_low` / `cheerful` / `dark_low` |

## 流程要点

1. 先 `extraction.md` 得到外貌/性格/学段线索  
2. 再 `character-lookup.md`：**多图对照 + 年龄锁** → 填完整角色卡  
3. `expressions` 来自本篇成色裁剪，不是永远固定五件套  
4. 出图前确认 `ageBand` 与 `invariants` 已写入，并进入 prompt  

## 示例

- 网查成功：高中角色、对照 3 张通行图 → `lookup=web`，`ageBand=teen`，`hair=...`，`referenceNote=对照官方立绘与两张高共识图，锁定双马尾与学年观感`  
- OC 回退：文内「小学生、短发」→ `lookup=fallback`，`ageBand=child`，短参数仅来自文章  

## 规则

- 禁止把网页长文或整段人设散文直接丢进文生图  
- 同一 `id` 全剧共用基准形象；表情差分只改表情，不改身份特征与年龄体型  
- **禁止**在角色卡里省略 `ageBand`（省略极易出现小孩↔大人画错）
