import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const privacy = readFileSync(join(root, "docs/privacy-policy.md"), "utf8");

test("manifest keeps platform and permission contract tight", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background.type, "module");
  assert.ok(manifest.permissions.includes("activeTab"));
  assert.ok(manifest.permissions.includes("storage"));
  assert.ok(manifest.permissions.includes("tts"));
  assert.ok(!manifest.permissions.includes("tabs"));
  assert.ok(!manifest.permissions.includes("scripting"));
});

test("content script order preserves runtime dependencies", () => {
  assert.deepEqual(manifest.content_scripts[0].js, [
    "src/content/aura-defaults.js",
    "src/content/aura-engine.js",
    "src/content/aura-ai.js",
    "src/content/cs_ui.js",
  ]);
});

test("privacy docs disclose AI transfer, local key, and data deletion", () => {
  assert.match(privacy, /visible public image bytes/);
  assert.match(privacy, /Gemini API key/);
  assert.match(privacy, /Clear AI cache/i);
});
