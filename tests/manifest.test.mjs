import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

test("manifest uses MV3 and declares active content scripts", () => {
  assert.equal(manifest.manifest_version, 3);
  const scripts = manifest.content_scripts[0].js;
  assert.deepEqual(scripts, [
    "src/content/aura-defaults.js",
    "src/content/aura-engine.js",
    "src/content/aura-ai.js",
    "src/content/cs_ui.js",
  ]);
  scripts.forEach((script) => assert.ok(existsSync(join(root, script))));
});

test("manifest avoids unused scripting permission", () => {
  assert.ok(!manifest.permissions.includes("scripting"));
  assert.ok(manifest.permissions.includes("storage"));
  assert.ok(manifest.permissions.includes("tts"));
});
