---
type: research-report
topic: aura-sota-2026-readiness
created: 2026-06-11 21:40 Asia/Saigon
repo: D:\MyProfile\Documents\AURA
---

# Research Report: AURA SOTA 2026 Readiness

## Executive Summary

Verdict: AURA does **not** meet SOTA 2026 yet. It is a solid research-demo / MVP+ browser extension after recent fixes, but not a production-grade, state-of-the-art assistive accessibility product.

Strong parts: MV3 service worker, modular content runtime, opt-in AI consent, public URL guard, rate limit/cache, Vietnamese TTS path, visual accessibility controls, docs, and basic tests.

Main gaps: no real browser/screen-reader validation, broad host permissions, weak release/privacy model for Gemini API key, limited AI capability (single-sentence captions only), no automated accessibility/e2e coverage, and no Store-ready compliance evidence.

## Research Methodology

- Sources consulted: 8 official primary sources.
- Date: 2026-06-11.
- Key terms: WCAG 2.2, Chrome Manifest V3, Chrome extension permissions, Chrome Web Store Limited Use, Gemini image understanding, extension remote hosted code, ARIA APG.
- Local review: README, manifest, content scripts, popup, background, tests, validation docs.

## Evaluation Criteria

| Area | 2026 bar | Current repo | Readiness |
| --- | --- | --- | --- |
| Accessibility | WCAG 2.2-informed, keyboard/screen-reader validated | Visual controls and focus aid exist; no real AT validation | Partial |
| Extension platform | MV3, least privilege, no remote code | MV3 module service worker; broad host scope remains | Partial |
| Privacy/security | Explicit data use, limited permissions, safe transfers | Consent + URL guard; API key/distribution unresolved | Partial |
| AI assistive layer | Multimodal, controllable, explainable, robust | Caption-only, no OCR/VQA/follow-up, no quality eval | Weak |
| Quality pipeline | Unit + e2e + browser + a11y tests in CI | Node syntax/tests only; no CI workflow | Weak |
| Release readiness | Store assets, hosted privacy, package, manual validation | Docs exist; validation says manual checks not run | Weak |

## Key Findings

### 1. Accessibility Baseline

WCAG 2.2 is the right current baseline. W3C says WCAG 2.2 covers accessibility for blindness/low vision and recommends using the most current WCAG version for future applicability. It adds focus, target size, and authentication-related criteria beyond WCAG 2.1.

Repo strengths:

- `src/content/aura-engine.js` implements contrast modes, typography, focus outline, reduced motion, and reading guide.
- `src/popup/popup.html` uses semantic controls: buttons, fieldset, labels, status region.
- `README.md` and docs clearly position AI as assistive hints.

Gaps:

- No automated a11y testing for popup.
- No keyboard-only walkthrough evidence.
- No screen-reader pass. `docs/validation-report.md` says screen reader check not run.
- Global CSS injection can damage site layout/contrast in unpredictable ways.
- AI overwrites `alt` directly; no user-visible provenance or review path on page.

### 2. Extension Platform

Repo meets core MV3 structure:

- `manifest.json` uses `manifest_version: 3`.
- Background is a module service worker.
- Code is bundled locally; no remote executable script loading observed.

Relevant official baseline:

- Chrome MV3 replaces background pages with service workers.
- Chrome docs recommend optional permissions where feasible and note host permissions/content script matches can trigger warnings.
- Chrome Web Store disallows remotely hosted executable code in extensions.

Gaps:

- `content_scripts.matches` and `host_permissions` are both `<all_urls>`. This is probably defensible for an accessibility overlay, but not SOTA unless paired with runtime permission minimization, clear onboarding, and Store evidence.
- `activeTab` and `tabs` are both declared; exact need should be re-audited.
- No CI, no release packaging script, no extension load/e2e automation.

### 3. Privacy and Security

Strong improvements now present:

- AI disabled by default.
- Consent required before AI enablement.
- `src/content/aura-ai.js` filters visible public images.
- `src/background/safe-url.js` rejects non-web, localhost, local, private, and private IPv6 targets.
- `src/background/background.js` blocks image redirects during fetch.
- AI cache/rate-limit state is bounded in local storage.

Remaining blockers:

- Gemini API key model is not production-ready. A public Chrome extension cannot safely ship a shared API key in `src/config.js`; if omitted, AI feature does not work by default.
- No explicit user data deletion UX beyond cache clear.
- Privacy policy is local markdown, not a hosted Store-ready URL.
- No data processing story for third-party image transfer to Gemini beyond consent text.
- No CSP/security review document.

### 4. AI Assistive Layer

Gemini image understanding can support image captioning, visual Q&A, image classification, and object detection. The repo uses only a narrow captioning path:

- One prompt.
- One generated sentence.
- Inline image bytes.
- Vietnamese output.
- First generated description can be read through Chrome TTS.

This is useful, but not SOTA 2026. Missing:

- OCR for text in images.
- Visual question answering.
- Object/region exploration.
- Structured JSON output for consistency.
- Safety settings / blocked-reason handling.
- Quality evaluation set for Vietnamese captions.
- User-controlled per-image selection/cancel/retry.
- Confidence/provenance label.
- On-device or user-key fallback for privacy-sensitive users.

### 5. Testing and Evidence

Current automated checks:

- `npm run check`: manifest-linked files + JS syntax.
- `npm test`: 9 Node tests for manifest, settings, URL guard.

Not enough for SOTA:

- No Playwright/Puppeteer extension e2e.
- No axe-core popup audit.
- No Chrome/Edge load-unpacked automation.
- No Gemini live integration test with fixture images.
- No NVDA/JAWS/VoiceOver checklist.
- No CI workflow in `.github`.

## SOTA Scorecard

| Category | Score | Notes |
| --- | ---: | --- |
| Product concept | 7/10 | Clear assistive extension scope |
| Accessibility implementation | 5.5/10 | Useful controls, insufficient validation |
| AI capability | 4/10 | Caption-only; no multimodal interaction depth |
| Security/privacy | 6/10 | Good recent fixes; key/permission model unresolved |
| Code architecture | 6.5/10 | Modular, small files, simple; limited error states |
| Testing/release | 3/10 | Basic tests only |
| Overall | 5.5/10 | MVP+, not SOTA |

## Recommendations

### P0: Required Before Claiming SOTA

1. Add extension e2e tests: load extension in Chromium, open fixture page, apply settings, verify DOM/CSS, run AI mock path.
2. Add accessibility test pipeline: axe-core on popup, keyboard tab-order assertions, manual NVDA checklist.
3. Fix production AI key strategy: user-provided key, secure backend, or supported platform auth. Document transfer/deletion.
4. Reduce permission blast radius: evaluate optional host permissions, activeTab-driven operation, or narrower host flow.
5. Add AI quality harness: fixture image corpus, Vietnamese caption rubric, regression snapshots.

### P1: Needed For 2026 Competitive Feature Set

1. Add per-image user selection UI instead of only batch scanning.
2. Add OCR / "read text in image" mode.
3. Add visual Q&A: user asks follow-up questions about selected image.
4. Add structured model output: caption, detected text, salient objects, uncertainty.
5. Add provenance: generated by AI, timestamp/cache state, retry/clear control.
6. Add policy-grade privacy page and Store disclosure draft.

### P2: Polish

1. Package script for Chrome Web Store zip.
2. CI workflow for `npm run check`, `npm test`, e2e.
3. i18n message catalog instead of hardcoded UI strings.
4. Performance guard for mutation observer and large pages.
5. Better docs for threat model and manual validation matrix.

## References

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Chrome Extensions: Declare permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Chrome Extensions: Migrate to service workers](https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers)
- [Chrome Extensions: Remote hosted code violations](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies)
- [Chrome Web Store Limited Use](https://developer.chrome.com/docs/webstore/program-policies/limited-use)
- [Gemini API image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)
- [Gemini API models](https://ai.google.dev/gemini-api/docs/models)

## Unresolved Questions

- Target claim: research demo, Chrome Web Store product, or thesis prototype?
- Target assistive tech: NVDA, JAWS, VoiceOver, TalkBack?
- AI deployment model: developer key, user key, or backend proxy?
- Is `<all_urls>` acceptable for the project sponsor/reviewer, or must permission be runtime-scoped?
