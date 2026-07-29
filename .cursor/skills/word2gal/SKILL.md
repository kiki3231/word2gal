---
name: word2gal
description: >-
  将自然语言同人剧情生成可运行的单文件 HTML 视觉小说（对话框、立绘、选项、短反应音）。
  在用户提到 Word2Gal、同人网页视觉小说、用文字生成 galgame/视觉小说 HTML 时使用。
---

# Word2Gal

## 硬约束
- 用户只提供自然语言；禁止要求用户填写 JSON/标记语法/资源路径
- 不对白全文 TTS；仅标签化短反应音
- 立绘必须走风格包参数卡；禁止自由长描述直出
- 禁止改写播放器核心 JS；只填充模板占位符
- 素材失败 → 默认资源，HTML 仍须可玩

## 工作流（概要）
1. 收集/确认自然语言剧情与角色
2. 编译内部剧本 JSON（见 reference）
3. 蒸馏角色卡并选用风格包
4. 生成或回退立绘/短音
5. 填入 templates/player-basic.html 并写出成品
6. 自检清单

## 模式二
若用户要求加强演出，用同一剧本填 templates/player-advanced.html（若尚未存在则先用 basic 并说明）。
