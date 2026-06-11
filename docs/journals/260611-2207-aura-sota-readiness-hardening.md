---
type: journal
created: 2026-06-11
plan: plans/260611-2144-aura-sota-2026-readiness-hardening/plan.md
---

# AURA SOTA Readiness Hardening

## Context

Cooked the SOTA readiness hardening plan from the research report. Goal: close validation, privacy, AI capability, popup control, and release evidence gaps.

## What Happened

- Added CI workflow and package script.
- Added static popup accessibility tests, runtime contract tests, AI parser/request tests.
- Removed unused `tabs` permission.
- Added user-provided local Gemini key path.
- Added structured AI task modes: caption, OCR, objects, question.
- Added selected-image description path and provenance metadata.
- Added permission audit, threat model, Store disclosure, release checklist, manual AT checklist.

## Validation

- `npm run check`: pass.
- `npm test`: pass, 19 tests.
- `npm run package`: pass, creates `dist/aura-extension.zip`.
- `npm run ci`: pass.
- Package does not include `src/config.js`.

## Decisions

- Kept backend proxy out of scope.
- Chose user-owned local API key as production-safe static-extension path.
- Kept `<all_urls>` with disclosure and audit, because accessibility content scripts need broad page coverage.

## Next

- Run real Chrome/Edge load-unpacked smoke.
- Run screen-reader validation.
- Decide Store publication and hosted privacy URL.

## Unresolved Questions

- Which screen reader is official for final sign-off?
- Store candidate or thesis/demo package only?
