import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import vm from "node:vm";

function loadContentDefaults() {
  const context = { window: {} };
  const source = readFileSync(join(process.cwd(), "src/content/aura-defaults.js"), "utf8");
  vm.runInNewContext(source, context);
  return context.window.AuraDefaults;
}

function loadPopupSettings() {
  const context = { window: {} };
  const source = readFileSync(join(process.cwd(), "src/popup/popup-settings.js"), "utf8");
  vm.runInNewContext(source, context);
  return context.window.AuraPopupSettings;
}

test("content settings normalize unsafe values", () => {
  const { normalizeSettings } = loadContentDefaults();
  const settings = normalizeSettings({
    contrastMode: "unknown",
    fontScale: 99,
    lineHeight: 0,
    letterSpacing: 10,
    ai: { enabled: true, mode: "bad" },
  });
  assert.equal(settings.contrastMode, "none");
  assert.equal(settings.fontScale, 2);
  assert.equal(settings.lineHeight, 1.1);
  assert.equal(settings.letterSpacing, 4);
  assert.equal(settings.ai.mode, "manual");
});

test("popup settings require AI consent before enablement", () => {
  const { normalize } = loadPopupSettings();
  assert.equal(normalize({ ai: { enabled: true, consent: false } }).ai.enabled, false);
  assert.equal(normalize({ ai: { enabled: true, consent: true } }).ai.enabled, true);
});

test("site overrides can update global AI settings without changing global visuals", () => {
  const { normalize, withGlobalAi } = loadPopupSettings();
  const global = normalize({
    fontScale: 1.5,
    ai: { enabled: false, consent: false, mode: "manual" },
  });
  const siteEdit = normalize({
    fontScale: 1.1,
    ai: { enabled: true, consent: true, mode: "batch" },
  });
  const updated = withGlobalAi(global, siteEdit);
  assert.equal(updated.fontScale, 1.5);
  assert.equal(updated.ai.enabled, true);
  assert.equal(updated.ai.consent, true);
  assert.equal(updated.ai.mode, "batch");
});

test("legacy contrast migration preserves old inverted behavior", () => {
  const { fromStorage } = loadContentDefaults();
  const settings = fromStorage({
    isContrastOn: true,
    userConfig: { contrastMode: "high", fontSize: 1.2 },
  });
  assert.equal(settings.contrastMode, "inverted");
  assert.equal(settings.fontScale, 1.2);
});
