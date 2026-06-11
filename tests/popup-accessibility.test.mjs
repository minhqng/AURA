import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const html = readFileSync(join(process.cwd(), "src/popup/popup.html"), "utf8");

test("popup exposes status and privacy disclosure landmarks", () => {
  assert.match(html, /<main class="app-shell">/);
  assert.match(html, /id="status-text"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /<details class="privacy-note">/);
});

test("popup controls have accessible grouping or labels", () => {
  for (const id of [
    "font-scale",
    "line-height",
    "letter-spacing",
    "readable-font",
    "focus-aid",
    "reduced-motion",
    "reading-guide",
    "ai-consent",
    "ai-enabled",
    "ai-mode",
    "ai-task",
    "ai-question",
    "ai-api-key",
    "site-override",
  ]) {
    assert.match(html, new RegExp(`<label[\\s\\S]*id="${id}"`), `${id} should be inside a label`);
  }
  assert.match(html, /<fieldset class="segmented"[\s\S]*<legend>/);
});

test("popup loads helper scripts before main popup runtime", () => {
  const scripts = Array.from(html.matchAll(/<script src="([^"]+)"/g)).map((match) => match[1]);
  assert.deepEqual(scripts, ["popup-settings.js", "popup-actions.js", "popup.js"]);
});
