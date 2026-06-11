---
type: report
created: 2026-06-11
project: AURA
skills:
  - ck:brainstorm
  - ck:research
  - ck:project-organization
status: draft
---

# AURA SOTA 2026 Research Brief

## Summary

AURA is a small Chrome Manifest V3 extension for low-vision accessibility: high contrast, font scaling, and planned AI image description. Current product is not yet SOTA; it is an MVP with inactive AI image flow, broad permissions, no tests, no docs, no release/privacy package.

Recommended direction: make AURA a privacy-first assistive browsing layer, not just a visual filter. Baseline should target WCAG 2.2 AA workflows, Chrome MV3 best practice, user-controlled AI, and measurable accessibility improvements.

## Codebase Findings

| Area | Finding | Evidence |
| --- | --- | --- |
| Extension architecture | MV3 service worker + one content script | `manifest.json:2`, `manifest.json:11`, `manifest.json:23` |
| Active content script | Only `src/content/cs_ui.js` runs | `manifest.json:26` |
| AI image code | Background supports `GET_AI_DESCRIPTION`, but page scanner is not registered | `src/background/background.js:69`, `src/content-scripts/content-script.js:31` |
| Permission risk | Requests `<all_urls>` and broad API permissions | `manifest.json:6`, `manifest.json:7` |
| Styling split | `engine.css` has richer accessibility modes but is loaded only by popup HTML, not content script | `src/popup/popup.html:8`, `src/popup/engine.css:7` |
| Testing/docs | No `package.json`, no test runner, `docs/` only `.gitkeep` | local scout |

## Current SOTA Signals

- WCAG 2.2 is current stable W3C Recommendation; use it as compliance baseline, not WCAG 3.
- WCAG 3.0 is still draft; use as design inspiration only.
- Chrome MV3 requires service-worker-aware architecture; no durable globals, listeners should be registered synchronously.
- Chrome permission model favors least privilege and optional permissions.
- Chrome Web Store review expects privacy policy, limited use, permission disclosure.
- Gemini image input supports inline image data for smaller payloads and File API for larger/reused files.
- Gemini API current model list has Gemini 3 family; existing config still references `gemini-1.5-flash`, which is outdated for a 2026 SOTA target.
- Chrome Prompt API / Gemini Nano is relevant for local/on-device assistant flows, but availability and model download UX must be handled.

## Product Gap

AURA should not claim SOTA until these are solved:

1. Real AI image description flow active, controllable, rate-limited, and privacy-disclosed.
2. Accessibility engine unified: contrast modes, font scale, line height, letter spacing, focus aid, reduced motion, reading guide.
3. No destructive page styling by default; per-site settings and reset path required.
4. Keyboard/screen-reader-first popup UI.
5. Least-privilege permissions or explicit rationale for broad host access.
6. Test matrix: static syntax, extension load, popup interaction, content script behavior, accessibility checks.
7. Docs package: architecture, privacy, setup, usage, changelog, roadmap.

## Recommended Scope Options

### Option A: Stabilize MVP

Fix inactive AI, unify duplicated content scripts, reduce obvious bugs, write docs/tests. Fastest path to demo.

Best for: NCKH deadline, school demo, stable prototype.

### Option B: SOTA Assistive Extension

Add privacy-first AI alt text, OCR/read aloud, focus/navigation aid, per-site profiles, WCAG-driven audits, testing/release pipeline.

Best for: publishable project, competition, production-like research.

### Option C: AI Accessibility Research Platform

Add telemetry-free evaluation harness, before/after accessibility scoring, experiments across pages, model comparison, research report generation.

Best for: academic paper and measurable contribution.

## Recommended Path

Choose Option B, but deliver in phases:

1. Foundation hardening: manifest, scripts, config, permissions, docs, test harness.
2. Accessibility engine: visual modes, typography, focus/reading aids, per-site settings.
3. AI assistive layer: image alt text, OCR, TTS, user consent, caching, fallback model.
4. UX polish: popup redesign, onboarding, privacy page, help flow.
5. Validation: WCAG checklist, screen reader keyboard testing, browser compatibility, release package.

## Risks

- Broad `<all_urls>` plus AI upload creates privacy/review risk.
- Directly mutating all page font sizes can break layouts.
- AI-generated alt text may be wrong; must label as AI and allow correction/copy.
- Sending image URLs/content to API needs user consent and privacy policy.
- Current Gemini model config may become invalid/outdated.

## Sources

- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C WCAG 3.0 draft: https://www.w3.org/TR/wcag-3.0/
- WAI ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- Chrome MV3 service workers: https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers
- Chrome extension permissions: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions
- Chrome Web Store policies: https://developer.chrome.com/docs/webstore/program-policies
- Chrome Prompt API: https://developer.chrome.com/docs/ai/prompt-api
- Gemini image understanding: https://ai.google.dev/gemini-api/docs/image-understanding
- Gemini API models: https://ai.google.dev/gemini-api/docs/models
- Gemini API changelog: https://ai.google.dev/gemini-api/docs/changelog

## Unresolved Questions

1. Primary goal: NCKH demo, Chrome Web Store publish, competition, or research paper?
2. AI policy: allow sending page images to Gemini API, or require local/on-device first?
3. Target users: blind screen-reader users, low-vision users, dyslexia/cognitive accessibility, or all?
4. Deadline and acceptable scope for first implementation phase?
5. Should AURA keep pure vanilla JS or introduce build tooling and tests?
