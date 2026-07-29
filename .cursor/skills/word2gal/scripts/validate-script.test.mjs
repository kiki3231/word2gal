import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const validatorPath = path.join(__dirname, "validate-script.mjs");
const validFixture = path.join(__dirname, "fixtures", "valid-script.json");
const invalidFixture = path.join(__dirname, "fixtures", "invalid-script.json");

function runValidator(jsonPath) {
  return spawnSync(process.execPath, [validatorPath, jsonPath], {
    encoding: "utf8",
  });
}

test("valid-script.json 校验通过（exit 0）", () => {
  const result = runValidator(validFixture);
  assert.equal(
    result.status,
    0,
    `expected exit 0, got ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
  );
  assert.match(result.stdout, /ok|valid/i);
});

test("invalid-script.json 校验失败（缺 id、重复 id、无效 goto、dialogue 无 emotion）", () => {
  const result = runValidator(invalidFixture);
  assert.notEqual(result.status, 0, "expected non-zero exit for invalid script");
  const combined = `${result.stdout}\n${result.stderr}`;
  assert.match(combined, /id|nodeId|emotion|goto/i);
});
