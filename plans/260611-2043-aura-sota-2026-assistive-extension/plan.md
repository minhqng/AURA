---
title: AURA SOTA 2026 Assistive Extension
description: >-
  Implementation roadmap to evolve AURA from MVP Chrome MV3 extension into
  privacy-first AI assistive browsing layer.
status: in-progress
priority: P2
branch: main
tags:
  - chrome-extension
  - accessibility
  - ai
  - wcag-2-2
blockedBy: []
blocks: []
created: '2026-06-11T13:43:58.809Z'
createdBy: 'ck:plan'
source: skill
---

# AURA SOTA 2026 Assistive Extension

## Overview

AURA is currently an MVP Chrome MV3 extension with contrast, font scaling, and inactive AI image-description flow. This plan upgrades it into a SOTA 2026 assistive extension: WCAG 2.2-oriented, privacy-first, keyboard/screen-reader usable, AI-assisted, tested, and release-ready.

Assumptions: target is NCKH/demo plus publishable quality; no backend; no telemetry; keep vanilla JS unless test/build tooling is required; Gemini API is allowed only with explicit user consent. WCAG 3 remains research inspiration, not compliance target.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Foundation Hardening](./phase-01-foundation-hardening.md) | Completed |
| 2 | [Accessibility Engine](./phase-02-accessibility-engine.md) | Completed |
| 3 | [AI Assistive Layer](./phase-03-ai-assistive-layer.md) | Completed |
| 4 | [Popup UX and Onboarding](./phase-04-popup-ux-and-onboarding.md) | Completed |
| 5 | [Validation Release Docs](./phase-05-validation-release-docs.md) | In Progress |

## Dependencies

- Source research: [SOTA 2026 research brief](../reports/260611-2040-aura-sota-2026-research-brief.md)
- Standards/docs: WCAG 2.2, WAI ARIA APG, Chrome MV3, Chrome Web Store policy, Gemini image understanding.
- Internal phase chain: Phase 1 blocks all later implementation; Phase 5 validates final behavior.

## Scope Boundary

- In scope: extension hardening, accessibility controls, AI image/OCR/TTS assist, popup UX, docs/tests/release package.
- Out of scope: backend service, account system, analytics/telemetry, payments, full web crawler, automatic form filling, publishing to store without user approval.

## Success Criteria

- Extension loads cleanly in Chrome/Edge MV3 without console/runtime errors.
- AI image description works only after opt-in and has clear privacy disclosure.
- Visual accessibility settings are per-site capable and reversible.
- Popup can be operated by keyboard and screen readers.
- Test pipeline covers syntax/static checks, content script behavior, popup behavior, and extension load smoke.
- Docs explain architecture, privacy, setup, user guide, roadmap, changelog.

## Handoff

Recommended next gate after review: `/ck:plan validate D:\MyProfile\Documents\AURA\plans\260611-2043-aura-sota-2026-assistive-extension\plan.md`
