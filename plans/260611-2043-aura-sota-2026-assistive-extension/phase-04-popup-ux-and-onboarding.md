---
phase: 4
title: Popup UX and Onboarding
status: completed
priority: P2
effort: 2-3d
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Popup UX and Onboarding

## Context Links

- Popup markup: `src/popup/popup.html`
- Popup styles: `src/popup/popup.css`
- Popup behavior: `src/popup/popup.js`
- Icons/assets: `icons/`, `figma/`
- WAI ARIA APG reference from research brief.

## Overview

Turn the popup from a basic settings panel into a keyboard/screen-reader-first control surface with clear status, grouped controls, per-site mode, AI consent, reset, and help.

## Key Insights

- Current popup has only two controls and nonfunctional settings/help buttons.
- UI is visually card-heavy and purple/blue dominant; accessibility tooling should feel utilitarian, dense, and predictable.
- Popup itself must be accessible; otherwise the product undercuts its own purpose.

## Requirements

- Functional: popup exposes visual, typography, reading, AI, and per-site controls.
- Functional: onboarding explains AI privacy before enabling AI.
- Functional: settings/help buttons either work or are removed.
- Functional: user can reset current site/global settings.
- Non-functional: full keyboard operation, visible focus, proper labels, no text overflow.
- Non-functional: no visible instructional clutter beyond necessary consent/help content.

## Architecture

Use plain HTML/CSS/JS with semantic controls:

```text
popup sections:
Status -> Visual -> Text -> Reading -> AI -> Site scope -> Help/Privacy
```

Avoid SPA complexity. Store UI state through the same canonical `auraSettings` contract from Phase 1.

## Related Code Files

- Modify: `src/popup/popup.html`
- Modify: `src/popup/popup.css`
- Modify: `src/popup/popup.js`
- Modify: `icons/` only if needed for status/action clarity
- Reference: `figma/index.html`, `figma/images/screenshot.png`
- Create if needed: `docs/user-guide.md`
- Create if needed: `tests/popup/popup-accessibility.test.js`

## Implementation Steps

1. Redesign information architecture around user tasks, not implementation details.
2. Replace nonfunctional settings/help actions with real views or remove them.
3. Add segmented controls for contrast mode and site/global scope.
4. Add sliders/steppers for typography controls with clamped values.
5. Add toggles for focus aid, reduced motion, reading guide, AI assist.
6. Add AI consent modal/view with privacy summary and link to full docs.
7. Add reset buttons for current site and all settings.
8. Ensure popup labels, `aria-live` statuses, and focus order are correct.
9. Verify layout at popup width and high text scaling.

## Todo List

- [x] Popup IA finalized.
- [x] All controls map to canonical settings.
- [x] AI consent UX complete.
- [x] Reset flows implemented.
- [x] Keyboard/focus CSS implemented.
- [x] Popup visual pass complete by static inspection.

## Success Criteria

- [x] Popup uses native controls for mouse-free operation.
- [x] Screen reader labels/status regions are present.
- [x] Popup has no dead buttons or placeholder links.
- [x] Text layout uses compact responsive rows at popup width.
- [x] AI cannot be enabled without consent acknowledgement.
- [x] Reset current site/global settings works in code path.

## Risk Assessment

Risk: too many controls overwhelm users. Mitigation: group by task, use defaults, expose advanced settings under a compact details section.

Risk: popup design prioritizes aesthetics over accessibility. Mitigation: test keyboard/focus/label behavior before visual polish.

## Security Considerations

- Consent copy must say what may be sent to Gemini.
- Do not display or store API key in popup.
- Help/privacy links should be local docs or extension pages, not external tracking URLs.

## Next Steps

After UX is complete, Phase 5 validates extension behavior, docs, and release readiness.
