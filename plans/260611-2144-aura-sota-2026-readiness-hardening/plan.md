---
title: "AURA SOTA 2026 Readiness Hardening"
description: "Upgrade AURA from MVP+ demo to production-grade SOTA-ready assistive extension."
status: in-progress
priority: P1
effort: 34h
branch: main
tags: [chrome-extension, accessibility, ai, privacy, release]
created: 2026-06-11
---

# AURA SOTA 2026 Readiness Hardening

## Overview

Research verdict: AURA is MVP+ at ~5.5/10 readiness, not SOTA 2026. This plan closes the main gaps: validation evidence, privacy/permission model, richer AI assistive flow, user-controlled accessibility UX, and release readiness.

## Source Context

- Research: [SOTA readiness report](../reports/260611-2140-aura-sota-2026-readiness-research.md)
- Current plan baseline: [MVP SOTA plan](../260611-2043-aura-sota-2026-assistive-extension/plan.md)
- Docs: [codebase summary](../../docs/codebase-summary.md), [architecture](../../docs/system-architecture.md), [PDR](../../docs/project-overview-pdr.md), [standards](../../docs/code-standards.md)

## Phases

| Phase | Name | Status | Progress |
| --- | --- | --- | --- |
| 1 | [Validation and Quality Pipeline](./phase-01-validation-and-quality-pipeline.md) | Completed | 90% |
| 2 | [Permission Privacy Release Model](./phase-02-permission-privacy-release-model.md) | Completed | 90% |
| 3 | [AI Assistive Capability Upgrade](./phase-03-ai-assistive-capability-upgrade.md) | Completed | 85% |
| 4 | [Popup Accessibility and User Control](./phase-04-popup-accessibility-and-user-control.md) | Completed | 85% |
| 5 | [Release Documentation and Evidence](./phase-05-release-documentation-and-evidence.md) | In Progress | 75% |

## Dependencies

- Phase 1 should land first so later changes have e2e/a11y coverage.
- Phase 2 must precede any public release or Store packaging.
- Phase 3 depends on final AI key strategy from Phase 2.
- Phase 4 depends on Phase 3 user-facing AI actions.
- Phase 5 consumes validation artifacts from all prior phases.

## Success Criteria

- Extension has automated Chrome extension e2e smoke tests and popup accessibility checks.
- AI transfer model is production-safe and documented.
- User can select, describe, ask, read, retry, and clear AI descriptions with visible provenance.
- Permission set is justified, minimized where feasible, and backed by privacy docs.
- Release package, Store disclosure draft, validation report, and manual AT checklist are complete.

## Implementation Summary

- Added static accessibility/runtime tests, AI parser tests, CI workflow, and package script.
- Removed unused `tabs` permission and documented permission/privacy model.
- Added user-provided local Gemini key support.
- Added structured AI modes: caption, OCR, objects, question.
- Added selected-image AI path, provenance metadata, retry-ready parser, and local private-data clearing.
- Added Store disclosure, permission audit, threat model, release checklist, and manual AT checklist.

## Unresolved Questions

- Target release: thesis demo only or Chrome Web Store publication?
- Target screen reader: NVDA, JAWS, VoiceOver, or all three?
- Hosted privacy policy URL if publishing.
