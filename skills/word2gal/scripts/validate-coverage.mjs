#!/usr/bin/env node
/**
 * 原文覆盖校验：剧本 nodes[].text 须能在用户原文中定位（归一化后子串）。
 * Usage:
 *   node validate-coverage.mjs <source.txt> <script.json>
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/** 去掉空白差异，便于切开后的匹配 */
export function normalizeText(s) {
  return String(s || "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u200b\uFEFF]/g, "")
    .replace(/\s+/g, "");
}

/**
 * @param {string} sourceRaw
 * @param {unknown} script
 * @returns {{ ok: boolean, checked: number, missing: { id: string, type: string, preview: string }[] }}
 */
export function validateCoverage(sourceRaw, script) {
  const missing = [];
  if (!script || typeof script !== "object" || Array.isArray(script)) {
    return { ok: false, checked: 0, missing: [{ id: "root", type: "meta", preview: "script 无效" }] };
  }
  const nodes = /** @type {{ nodes?: unknown }} */ (script).nodes;
  if (!Array.isArray(nodes)) {
    return { ok: false, checked: 0, missing: [{ id: "nodes", type: "meta", preview: "nodes 非数组" }] };
  }

  const hay = normalizeText(sourceRaw);
  let checked = 0;

  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const n = /** @type {Record<string, unknown>} */ (node);
    if (n.type !== "dialogue" && n.type !== "narration" && n.type !== "ending") {
      continue;
    }
    if (typeof n.text !== "string" || !n.text.trim()) continue;
    // 过短碎片（如单字「…」）跳过，避免误报
    const needle = normalizeText(n.text);
    if (needle.length < 2) continue;
    checked += 1;
    if (!hay.includes(needle)) {
      missing.push({
        id: typeof n.id === "string" ? n.id : "(no-id)",
        type: String(n.type),
        preview: String(n.text).slice(0, 48),
      });
    }
  }

  return { ok: missing.length === 0, checked, missing };
}

export function validateCoverageFiles(sourcePath, scriptPath) {
  let sourceRaw;
  let scriptRaw;
  try {
    sourceRaw = readFileSync(sourcePath, "utf8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, checked: 0, missing: [{ id: "source", type: "io", preview: message }] };
  }
  try {
    scriptRaw = readFileSync(scriptPath, "utf8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, checked: 0, missing: [{ id: "script", type: "io", preview: message }] };
  }
  let script;
  try {
    script = JSON.parse(scriptRaw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      checked: 0,
      missing: [{ id: "script", type: "json", preview: message }],
    };
  }
  return validateCoverage(sourceRaw, script);
}

function main() {
  const sourcePath = process.argv[2];
  const scriptPath = process.argv[3];
  if (!sourcePath || !scriptPath) {
    console.error("用法: node validate-coverage.mjs <source.txt> <script.json>");
    process.exit(1);
  }
  const result = validateCoverageFiles(sourcePath, scriptPath);
  if (!result.ok) {
    console.error(`FAIL: 原文覆盖 ${result.missing.length} 处未命中（已检 ${result.checked}）`);
    for (const m of result.missing) {
      console.error(`  [${m.type}] ${m.id}: ${m.preview}`);
    }
    process.exit(1);
  }
  console.log(`OK: coverage ${result.checked} texts matched source`);
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(path.resolve(entry)).href) {
  main();
}
