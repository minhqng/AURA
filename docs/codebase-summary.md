# Codebase Summary

## Type

Chrome/Edge Manifest V3 extension. Vanilla HTML/CSS/JavaScript. No build step.

## Runtime Parts

- Popup: user controls and consent.
- Content scripts: apply accessibility settings on web pages.
- Background service worker: Gemini image description, TTS, AI cache, rate limit, public URL guard.
- Storage: `chrome.storage.sync` for preferences, `chrome.storage.local` for AI cache/rate windows.

## Key Files

- `manifest.json`: permissions, content script order, popup, service worker.
- `src/content/aura-defaults.js`: canonical settings normalization for content runtime.
- `src/content/aura-engine.js`: contrast, typography, focus, reduced motion, reading guide.
- `src/content/aura-ai.js`: image detection and description requests.
- `src/content/cs_ui.js`: storage/message bootstrap.
- `src/background/background.js`: Gemini API and TTS handlers.
- `src/background/safe-url.js`: rejects non-web, local, and private-network image URLs.
- `src/popup/popup.js`: popup storage and tab messaging.

## Test Surface

- `scripts/check-extension.mjs`: manifest and syntax checks.
- `tests/manifest.test.mjs`: manifest contract.
- `tests/settings.test.mjs`: settings normalization and AI consent.
- `tests/safe-url.test.mjs`: public image URL guard.

## Known Constraints

- `src/config.js` is local-only and ignored by git.
- AI descriptions require a valid Gemini API key.
- Broad host access remains because page controls run on arbitrary websites.
