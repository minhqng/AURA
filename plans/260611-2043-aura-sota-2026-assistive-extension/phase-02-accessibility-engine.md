---
phase: 2
title: Accessibility Engine
status: completed
priority: P1
effort: 2-3d
dependencies:
  - 1
---

# Phase 2: Accessibility Engine

## Context Links

- Active content script: `src/content/cs_ui.js`
- Existing CSS rules: `src/popup/engine.css`
- Popup controls: `src/popup/popup.html`, `src/popup/popup.js`, `src/popup/popup.css`
- WCAG baseline: WCAG 2.2 Perceivable/Operable criteria from research brief.

## Overview

Replace one-off invert/font behavior with a controlled accessibility engine: visual modes, typography, focus visibility, reduced motion, reading guide, and per-site reversible settings.

## Key Insights

- Current font scaling mutates `body.style.fontSize`; this can break layouts and miss shadow/SPA content.
- Current contrast is only invert + image reinvert, while `engine.css` has high/inverted/grayscale modes.
- SOTA claim needs measurable accessibility controls, not just visual filters.

## Requirements

- Functional: users can choose contrast mode: none, high contrast, invert, grayscale.
- Functional: users can adjust font scale, line height, letter spacing, and optionally readable font.
- Functional: focus aid and reading guide can be toggled.
- Functional: settings apply live and persist globally, with per-site override support.
- Non-functional: all effects must be reversible without page reload where possible.
- Non-functional: avoid destructive CSS that makes pages unusable by default.

## Architecture

Content script owns a single `applyAuraSettings(settings, siteKey)` path:

```text
settings merge order:
defaults -> global settings -> per-site override -> temporary popup command
```

The engine should inject one style element with stable data attributes on `document.documentElement`. Avoid setting inline styles across every element except when a focused aid requires a targeted overlay.

## Related Code Files

- Modify: `src/content/cs_ui.js`
- Modify: `src/popup/popup.html`
- Modify: `src/popup/popup.js`
- Modify: `src/popup/popup.css`
- Merge/move rules from: `src/popup/engine.css`
- Create if needed: `tests/fixtures/accessibility-page.html`
- Create if needed: `tests/content/accessibility-engine.test.js`

## Implementation Steps

1. Define default settings and validation/clamping for all accessibility controls.
2. Replace boolean contrast with multi-mode contrast setting.
3. Inject CSS via one style manager with deterministic IDs.
4. Add typography CSS variables and clamp ranges.
5. Add focus aid styles that meet visible focus intent without hiding native focus.
6. Add reduced-motion rule for animations/transitions only when enabled.
7. Add reading guide overlay with pointer-safe behavior.
8. Add per-site storage key based on origin.
9. Test each mode on simple fixture pages and common content patterns.

## Todo List

- [x] Settings schema supports visual, typography, focus, motion, reading guide.
- [x] CSS engine is centralized.
- [x] Per-site override implemented.
- [x] Reset restores stored settings.
- [x] Tests cover settings contracts and manifest wiring.

## Success Criteria

- [x] Every accessibility mode uses one deterministic style element.
- [x] Typography settings persist through storage.
- [x] Image/video color handling is covered in invert-mode CSS.
- [x] Keyboard focus is visibly enhanced when enabled.
- [x] Reduced motion disables non-essential animation styles.
- [x] Per-site override is separated from global AI settings.

## Risk Assessment

Risk: aggressive CSS can degrade pages. Mitigation: keep modes explicit and reversible, add safe defaults, and avoid `* { font-size: ... }` unless user opts into strong mode.

Risk: site-specific CSS fights extension styles. Mitigation: use root attributes and scoped selectors with minimal `!important`.

## Security Considerations

- Content script must not read page secrets or form values for visual features.
- Per-site keys should store origin and settings only, not page URL paths or content.

## Next Steps

After visual/reading controls stabilize, Phase 3 can add AI features behind consent using the same settings/message backbone.
