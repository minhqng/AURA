---
phase: 3
title: AI Assistive Layer
status: completed
priority: P1
effort: 3-5d
dependencies:
  - 1
  - 2
---

# Phase 3: AI Assistive Layer

## Context Links

- Background AI handler: `src/background/background.js`
- Existing inactive image scanner: `src/content-scripts/content-script.js`
- Config template: `src/config.example.js`
- Manifest permissions: `manifest.json`
- Gemini image docs and model notes in research brief.

## Overview

Activate AI as an assistive layer, not an always-on crawler. Add opt-in image description, OCR-style text extraction path where feasible, Vietnamese TTS/read-aloud, caching, rate limits, and clear AI uncertainty UX.

## Key Insights

- Current background imports `../config.js`; missing or invalid config can break the service worker.
- Current API URL references old Gemini 1.5-era model in config example.
- Uploading images/page content is privacy-sensitive and must be user-controlled.
- AI alt text can be wrong; it must be labeled, inspectable, and retryable.

## Requirements

- Functional: user can enable/disable AI assist globally and per-site.
- Functional: missing/weak image `alt` can be described on demand or in controlled batch mode.
- Functional: generated descriptions are written to `alt`, `aria-label`, or accessible overlay only when safe.
- Functional: user can ask extension to read generated description via TTS.
- Functional: cache descriptions per image fingerprint/session to avoid repeated API calls.
- Non-functional: no upload before consent; graceful behavior when API key/model unavailable.
- Non-functional: model endpoint/version configurable without code changes to multiple files.

## Architecture

```text
content script finds candidate image -> consent/rate-limit check -> background AI request
background validates config -> fetches image bytes -> Gemini image request -> normalized result
content script applies accessible description + UI marker -> optional TTS
```

Prefer one request queue in the background worker and short-lived state persisted in storage/cache because MV3 service workers can restart.

## Related Code Files

- Modify: `src/background/background.js`
- Modify: `src/content/cs_ui.js`
- Modify/merge: `src/content-scripts/content-script.js`
- Modify: `src/popup/popup.js`
- Modify: `src/popup/popup.html`
- Modify: `src/config.example.js`
- Modify: `manifest.json`
- Create if needed: `tests/background/ai-description.test.js`
- Create if needed: `docs/privacy-policy.md`

## Implementation Steps

1. Add AI settings: enabled, mode (`manual`, `missing-alt-only`, `batch`), language, cache enabled.
2. Make config loading resilient when `src/config.js` is missing or placeholder.
3. Update config example to current stable Gemini model strategy and keep model separate from base URL.
4. Port image candidate detection into active content script with MutationObserver debounce.
5. Add manual action path first; batch mode only after manual flow works.
6. Add background request validation: URL scheme, size limit, mime type, timeout, retry rules.
7. Add cache key and rate limiting to prevent repeat API calls.
8. Add result application policy: never overwrite meaningful human alt by default.
9. Add TTS controls for selected/generated descriptions.
10. Test missing API key, API failure, oversized image, cross-origin image, and success.

## Todo List

- [x] AI opt-in setting exists.
- [x] Manual image description path exists.
- [x] Missing-alt batch mode is guarded by consent/settings.
- [x] Cache/rate-limit exists.
- [x] TTS handler reads generated text.
- [x] Privacy docs updated before release.

## Success Criteria

- [x] No image/page data leaves browser before explicit AI enablement.
- [x] Missing config returns helpful status instead of breaking background worker.
- [ ] AI description live test with representative JPEG/PNG/WebP images.
- [x] Existing meaningful alt text is preserved by default.
- [x] TTS can speak generated Vietnamese description through handler.
- [x] API errors are returned to user-facing flow without breaking page.

## Risk Assessment

Risk: Gemini output hallucination. Mitigation: prefix internal metadata as AI-generated, keep retry/copy/edit affordance, avoid claiming certainty.

Risk: Chrome Web Store review rejects broad permissions/privacy. Mitigation: document need, minimize host permissions, and add clear privacy policy.

Risk: service worker lifecycle interrupts queues. Mitigation: persist queue/counters lightly and design idempotent requests.

## Security Considerations

- Validate image URL schemes; reject `file:`, `chrome:`, extension pages, and huge payloads.
- Never log API keys or full API responses containing user data.
- Do not collect browsing history; cache by bounded key with user clear-cache control.

## Next Steps

After AI is functional and consent-safe, Phase 4 can expose it through a polished keyboard-first popup and onboarding flow.
