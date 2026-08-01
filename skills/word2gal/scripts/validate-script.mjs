#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const EMOTIONS = new Set([
  "neutral",
  "smile",
  "laugh",
  "surprise",
  "sad",
  "cry",
  "angry",
  "tense",
  "soft_shy",
]);
const NODE_TYPES = new Set([
  "scene",
  "narration",
  "dialogue",
  "choice",
  "ending",
]);

/**
 * @param {unknown} data
 * @returns {string[]}
 */
export function validateScript(data) {
  const errors = [];

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    errors.push("root: 必须是 JSON 对象");
    return errors;
  }

  const root = /** @type {Record<string, unknown>} */ (data);

  if (
    !root.meta ||
    typeof root.meta !== "object" ||
    Array.isArray(root.meta)
  ) {
    errors.push("meta: 缺少或类型无效");
  } else {
    const meta = /** @type {Record<string, unknown>} */ (root.meta);
    if (typeof meta.title !== "string" || meta.title.trim() === "") {
      errors.push("meta.title: 必填非空字符串");
    }
    if (typeof meta.stylePack !== "string" || meta.stylePack.trim() === "") {
      errors.push("meta.stylePack: 必填非空字符串");
    }
  }

  if (!Array.isArray(root.nodes)) {
    errors.push("nodes: 必须是数组");
    return errors;
  }

  const nodes = root.nodes;
  const ids = new Set();

  for (let i = 0; i < nodes.length; i++) {
    const prefix = `nodes[${i}]`;
    const node = nodes[i];

    if (node === null || typeof node !== "object" || Array.isArray(node)) {
      errors.push(`${prefix}: 必须是对象`);
      continue;
    }

    const n = /** @type {Record<string, unknown>} */ (node);

    if (typeof n.id !== "string" || n.id.trim() === "") {
      errors.push(`${prefix}: 缺少 nodeId（id 必填非空字符串）`);
    } else if (ids.has(n.id)) {
      errors.push(`${prefix}: nodeId "${n.id}" 重复`);
    } else {
      ids.add(n.id);
    }

    if (typeof n.type !== "string" || !NODE_TYPES.has(n.type)) {
      errors.push(
        `${prefix}: type 必须是 ${[...NODE_TYPES].join("|")} 之一`,
      );
      continue;
    }

    switch (n.type) {
      case "narration":
      case "ending":
        if (typeof n.text !== "string" || n.text.trim() === "") {
          errors.push(`${prefix}: text 必填非空字符串`);
        }
        break;
      case "dialogue":
        if (typeof n.speaker !== "string" || n.speaker.trim() === "") {
          errors.push(`${prefix}: speaker 必填非空字符串`);
        }
        if (typeof n.text !== "string" || n.text.trim() === "") {
          errors.push(`${prefix}: text 必填非空字符串`);
        }
        if (typeof n.emotion !== "string" || !EMOTIONS.has(n.emotion)) {
          errors.push(
            `${prefix}: emotion 必填，且为 ${[...EMOTIONS].join("|")} 之一`,
          );
        }
        if (
          n.voiceTag !== undefined &&
          (typeof n.voiceTag !== "string" || n.voiceTag.trim() === "")
        ) {
          errors.push(`${prefix}: voiceTag 若存在须为非空字符串`);
        }
        if (
          n.side !== undefined &&
          n.side !== "left" &&
          n.side !== "right"
        ) {
          errors.push(`${prefix}: side 若存在须为 left|right`);
        }
        break;
      case "choice": {
        if (!Array.isArray(n.options) || n.options.length === 0) {
          errors.push(`${prefix}: options 必须为非空数组`);
          break;
        }
        for (let j = 0; j < n.options.length; j++) {
          const opt = n.options[j];
          const optPrefix = `${prefix}.options[${j}]`;
          if (
            opt === null ||
            typeof opt !== "object" ||
            Array.isArray(opt)
          ) {
            errors.push(`${optPrefix}: 必须是对象`);
            continue;
          }
          const o = /** @type {Record<string, unknown>} */ (opt);
          if (typeof o.label !== "string" || o.label.trim() === "") {
            errors.push(`${optPrefix}: label 必填非空字符串`);
          }
          if (typeof o.goto !== "string" || o.goto.trim() === "") {
            errors.push(`${optPrefix}: goto 必填非空字符串`);
          }
        }
        break;
      }
      case "scene":
        break;
      default:
        break;
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node === null || typeof node !== "object" || Array.isArray(node)) {
      continue;
    }
    const n = /** @type {Record<string, unknown>} */ (node);
    if (n.type !== "choice" || !Array.isArray(n.options)) {
      continue;
    }
    const nodeId =
      typeof n.id === "string" && n.id.trim() !== "" ? n.id : `nodes[${i}]`;
    for (let j = 0; j < n.options.length; j++) {
      const opt = n.options[j];
      if (opt === null || typeof opt !== "object" || Array.isArray(opt)) {
        continue;
      }
      const goto = /** @type {Record<string, unknown>} */ (opt).goto;
      if (typeof goto === "string" && goto.trim() !== "" && !ids.has(goto)) {
        errors.push(
          `${nodeId}.options[${j}]: goto "${goto}" 指向不存在的节点`,
        );
      }
    }
  }

  return errors;
}

/**
 * @param {string} filePath
 * @returns {string[]}
 */
export function validateScriptFile(filePath) {
  let raw;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return [`无法读取文件: ${message}`];
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return [`JSON 解析失败: ${message}`];
  }

  return validateScript(data);
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("用法: node validate-script.mjs <script.json>");
    process.exit(1);
  }

  const errors = validateScriptFile(filePath);
  if (errors.length > 0) {
    for (const err of errors) {
      console.error(err);
    }
    process.exit(1);
  }

  console.log("OK: script valid");
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(path.resolve(entry)).href) {
  main();
}
