# Development Roadmap

## Status

Date: 2026-06-11

| Phase | Status | Notes |
| --- | --- | --- |
| Foundation hardening | Complete | Manifest, scripts, config, tests added |
| Accessibility engine | Complete | Contrast, typography, focus, motion, reading guide |
| AI assistive layer | Complete | Opt-in Gemini image description, cache, rate limit, TTS |
| Popup UX and onboarding | Complete | Keyboard-first popup and AI consent |
| Validation release docs | In Progress | CI, static a11y/runtime tests, package script added; real browser and screen reader smoke pending |
| SOTA readiness hardening | In Progress | Permission audit, AI task modes, release evidence docs |

## Next Milestones

1. Manual Chrome/Edge smoke test on real pages.
2. Screen reader pass with NVDA, JAWS, or VoiceOver.
3. Decide Chrome Web Store publication scope and hosted privacy URL.
4. Evaluate optional host permissions or runtime site activation.
5. Evaluate local/on-device AI fallback when available.

## Risks To Track

- AI description quality.
- Broad host permission review.
- Page CSS conflicts on complex sites.
- User-owned Gemini key UX and support burden.
