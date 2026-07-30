# Word2Gal 内部剧本 JSON Schema

Agent 在 Skill 工作流中生成的剧本结构；**用户不手写此 JSON**。校验：`scripts/validate-script.mjs`。

## 顶层结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `meta` | object | 剧本元信息 |
| `nodes` | array | 有序节点列表（运行时按 `id` 跳转，非数组下标） |

## `meta`

| 字段 | 类型 | 必填 |
|------|------|------|
| `title` | string | 是 |
| `stylePack` | string | 是（风格包 id，如 `daily-heal`） |
| `mood` | string | 强烈建议（文章核心情绪成色，见 `emotion-and-sfx.md`） |

## `nodes[]` 公共字段

| 字段 | 类型 | 必填 |
|------|------|------|
| `id` | string | 是，**全剧唯一**（稳定 nodeId） |
| `type` | string | 是，见下表 |

### 节点类型 `type`

| type | 用途 |
|------|------|
| `scene` | 场景切换 |
| `narration` | 旁白 |
| `dialogue` | 角色对白 |
| `choice` | 分支选项 |
| `ending` | 结局 |

## 各类型附加字段

### `scene`

| 字段 | 类型 | 必填 |
|------|------|------|
| `background` | string | 建议填写（背景资源 id） |

### `narration`

| 字段 | 类型 | 必填 |
|------|------|------|
| `text` | string | 是 |

### `dialogue`

| 字段 | 类型 | 必填 |
|------|------|------|
| `speaker` | string | 是（显示名或角色 id） |
| `text` | string | 是 |
| `emotion` | string | 是，枚举见下 |
| `voiceTag` | string | 否（短反应音标签，如 `gasp`） |

**`emotion` 枚举（本篇实际只用成色裁剪后的子集）：**

`neutral` | `smile` | `laugh` | `surprise` | `sad` | `cry` | `angry` | `tense` | `soft_shy`

校验器允许以上全集；Agent 不得使用未出现在本篇差分清单中的值。

### `choice`

| 字段 | 类型 | 必填 |
|------|------|------|
| `options` | array | 是，至少一项 |

`options[]` 每项：

| 字段 | 类型 | 必填 |
|------|------|------|
| `label` | string | 是（选项文案） |
| `goto` | string | 是（目标节点的 `id`） |

### `ending`

| 字段 | 类型 | 必填 |
|------|------|------|
| `text` | string | 是 |

## 图结构约束

1. 每个节点的 `id` 非空且在 `nodes` 内**唯一**。
2. 所有 `choice.options[].goto` 必须指向**已存在**的节点 `id`。
3. `dialogue.emotion` 必须为上述枚举之一，且应属于本篇情绪差分清单。

## 校验命令

```bash
node skills/word2gal/scripts/validate-script.mjs path/to/script.json
```

成功时打印 `OK`，退出码 `0`；失败时打印错误列表（每行一条），退出码 `1`。

## 示例（最小形状）

```json
{
  "meta": { "title": "示例", "stylePack": "daily-heal", "mood": "warm_daily" },
  "nodes": [
    { "id": "n1", "type": "dialogue", "speaker": "角色", "text": "你好。", "emotion": "neutral" },
    { "id": "end", "type": "ending", "text": "完" }
  ]
}
```

完整字段以本文件上文与 `validate-script.mjs` 为准。
