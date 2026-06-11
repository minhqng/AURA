---
phase: 1
title: Foundation Hardening
status: completed
priority: P1
effort: 1-2d
dependencies: []
---

# Phase 1: Foundation Hardening

## Context Links

- Research: `plans/reports/260611-2040-aura-sota-2026-research-brief.md`
- Current manifest: `manifest.json`
- Active content script: `src/content/cs_ui.js`
- Inactive AI scanner: `src/content-scripts/content-script.js`
- Background worker: `src/background/background.js`
- Popup logic: `src/popup/popup.js`

## Overview

Make the current extension structurally correct before adding features. Unify duplicated scripts, tighten config boundaries, define safe storage/message contracts, and add basic test/build tooling.

## Key Insights

- `manifest.json` registers only `src/content/cs_ui.js`; AI scanner is currently inactive.
- `engine.css` contains richer accessibility rules but is loaded only by popup HTML.
- `src/config.js` is gitignored and likely sensitive; do not read or commit it.
- Broad permissions are a product risk; document or reduce them before AI upload flows.

## Requirements

- Functional: extension still supports current contrast toggle and font scale after cleanup.
- Functional: single documented content-script entrypoint owns accessibility engine and AI scanner activation.
- Functional: config model supports a replaceable AI model/endpoint without hardcoding every choice in code.
- Non-functional: no syntax/runtime errors; no API key committed; no behavior hidden behind dead files.
- Non-functional: keep code simple; no framework unless needed for tests.

## Architecture

Use a small MV3 architecture:

```text
popup UI -> chrome.storage.sync/local -> content script applies page controls
popup UI -> runtime message -> background worker handles AI/TTS privileged tasks
content script -> runtime message -> background worker only after user-enabled AI
```

Storage contract should use one canonical object, e.g. `auraSettings`, while writing legacy keys only during migration if needed.

## Related Code Files

- Modify: `manifest.json`
- Modify: `src/content/cs_ui.js`
- Modify: `src/background/background.js`
- Modify: `src/popup/popup.js`
- Modify: `src/config.example.js`
- Review/delete or merge: `src/content-scripts/content-script.js`
- Review/delete or merge: `src/popup/content/content.js`
- Create if tooling accepted: `package.json`, `tests/`, `scripts/`

## Implementation Steps

1. Inventory active vs dead files and decide merge/delete path for duplicate content scripts.
2. Define canonical settings schema: contrast mode, typography, reading aids, AI consent, per-site overrides.
3. Update popup/content/background messages to named constants or documented string literals.
4. Move reusable accessibility CSS into the active content path, or inject it from one source of truth.
5. Add syntax/static test tooling with minimal npm footprint.
6. Add a Chrome extension load smoke check if Playwright/Chrome is available.
7. Run compile/static checks after each modified code file group.

## Todo List

- [x] Confirm active files and dead files.
- [x] Consolidate content script responsibilities.
- [x] Normalize settings schema and migration behavior.
- [x] Update config example to current model strategy.
- [x] Add minimal test commands.
- [x] Verify extension structure with automated checks.

## Success Criteria

- [x] Existing contrast/font controls are migrated to new settings engine.
- [x] AI scanner path is registered intentionally through active content runtime.
- [x] No sensitive config committed.
- [x] Static/syntax check command exists and passes.
- [x] README setup updated after structural changes.

## Risk Assessment

Risk: merging scripts may change behavior on arbitrary pages. Mitigation: add rollback-safe feature flags and test on static fixtures first.

Risk: reducing permissions may break content script or AI image fetch. Mitigation: document exact permission need and prefer optional host permissions where feasible.

## Security Considerations

- Never expose API key in committed files.
- Do not upload image/page data unless user has explicitly enabled AI.
- Prefer `chrome.storage.local` for sensitive/local-only choices; use `sync` only for harmless preferences.
- Keep MV3 listeners registered synchronously.

## Next Steps

After this phase passes, Phase 2 can safely build a richer accessibility engine on the consolidated content path.
