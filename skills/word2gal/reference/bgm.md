# 背景音乐（BGM）

内置曲目放在 `music/`。Bake 时按文章题材复制进作品 `assets/bgm/`。

## 曲库

| 文件 | 键名 | 触发（文章出现下列语义/基调时使用） |
|------|------|-------------------------------------|
| `sad.mp3` | `sad` | **冷/伤感基调**：伤感、伤心、悲伤、难过、悲痛、心酸、心痛、流泪主线、离别伤感、虐心、破碎、冷基调 等 |
| `love.mp3` | `love` | 爱情、恋爱、暗恋、喜欢（情感义）、告白、心动、恋人、亲吻、约会 等（且未落入上列伤感主基调） |

## 判定流程

1. 读完全文，先判**伤感/冷基调**：命中上表 `sad` 关键词，或主成色为 `bittersweet`（虐心、离别、隐痛）→ `meta.bgm = "sad"`  
2. 否则若命中恋爱语义/恋爱主线 → `meta.bgm = "love"`  
3. 用户明确说「加伤感 BGM」/「加恋爱 BGM」→ 分别设 `sad` / `love`  
4. 以上皆无：可不设 `meta.bgm`（无 BGM）  
5. **优先级**：伤感冷基调 **优于** 恋爱甜向。同文既有恋爱又主打伤心/离别/虐心时用 `sad`，不用 `love`

写入剧本：

```json
"meta": { "title": "...", "stylePack": "daily-heal", "mood": "bittersweet", "bgm": "sad" }
```

## Bake

- 若 `meta.bgm === "sad"`：将 `music/sad.mp3` 复制为 `assets/bgm/sad.mp3`，并设 `assets.bgm.sad` / `assets.bgm.default`  
- 若 `meta.bgm === "love"`：将 `music/love.mp3` 复制为 `assets/bgm/love.mp3`，并设 `assets.bgm.love` / `assets.bgm.default`  
- 播放器在用户首次点击后循环播放；音量低于拟声；BGM 随静音按钮一并开关

## 注意

- 仅作 Skill 内置素材；对外分发请自行确认音乐版权  
- 不要把 BGM 做成全文 TTS  
