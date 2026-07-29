# 角色卡（内部约定）

> 由 Agent 从用户**自然语言**蒸馏而来。用户不填写本文件格式。

## 字段

| 字段 | 说明 |
|------|------|
| `id` | 稳定英文/拼音 id，如 `you`、`rin` |
| `displayName` | 对白显示名，如「小悠」 |
| `stylePack` | 风格包 id，首版默认 `daily-heal` |
| `hair` | 短参数：发色+发型，如 `black long ponytail` |
| `eyes` | 短参数：瞳色，如 `amber` |
| `outfit` | 短参数：服装，如 `school uniform` |
| `vibe` | 短气质标签，如 `energetic` / `calm` |
| `expressions` | 默认：`neutral` `smile` `surprise` `sad` `angry` |
| `voiceProfile` | 音色预设档：`bright_soft` / `calm_low` / `cheerful`（非自由描述） |

## 蒸馏示例

- 用户：「黑长马尾、说话很快的女生小悠」→ `id=you`，`hair=black long ponytail`，`vibe=energetic`，`voiceProfile=cheerful`
- 用户：「话少的男生阿凛，校服，眼神淡」→ `id=rin`，`outfit=school uniform`，`vibe=calm`，`voiceProfile=calm_low`

## 规则

- 禁止把整段人设散文直接丢给文生图；只把上表短参数拼进风格包 prompt。
- 同一 `id` 全剧共用一张卡；表情差分只改表情词。
