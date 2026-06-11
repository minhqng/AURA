# Project Changelog

## 1.0.1 - 2026-06-11

### Added

- Canonical AURA settings schema.
- Multi-mode accessibility content engine.
- Reading guide, focus aid, reduced motion, typography controls.
- AI image description flow with consent, cache, rate limit, and TTS.
- Structured AI task modes for caption, OCR, objects, and image questions.
- Keyboard-first popup with per-site override and reset controls.
- Node check/test pipeline.
- Static popup accessibility and runtime contract tests.
- Release package script and CI workflow.
- Project docs for architecture, privacy, roadmap, deployment, standards.
- Permission audit, threat model, Store disclosure draft, release checklist.

### Changed

- Manifest content scripts now load modular content runtime files.
- Gemini config template now separates base URL and model.
- README now documents current SOTA implementation.
- Popup can store a user-provided Gemini API key locally instead of relying only on `src/config.js`.
- AI responses now preserve structured metadata and provenance on processed images.

### Removed

- Inactive duplicate content scripts that were not loaded by manifest.

### Fixed

- Missing `src/config.js` no longer breaks background service worker import.
- AI image scanner is now connected to the active content runtime.
- AI image scanner now skips hidden/off-screen images and private/local image URLs.
- Background now rejects non-web, local, and private-network image URLs before fetching.
- AI consent/settings changes now persist globally while editing per-site overrides.
- Popup describe action now reaches Chrome TTS by reading the first generated description.

### Security

- Removed unused `tabs` permission.
- Release package excludes local `src/config.js`.
