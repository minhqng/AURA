# AURA

AURA is a Chrome/Edge Manifest V3 extension that improves web accessibility for blind and low-vision users. It provides visual adaptation, typography controls, reading aids, and opt-in AI image description in Vietnamese.

## Features

- Contrast modes: off, high contrast, inverted, grayscale.
- Text controls: font scale, line height, letter spacing, readable font.
- Reading aids: visible focus outline, reduced motion, reading guide.
- Per-site overrides for visual and reading settings.
- AI image assistance: opt-in Gemini flow for visible public images with caption, OCR, object, and question modes.
- Vietnamese TTS for generated descriptions from popup AI actions.

## Privacy

AI is disabled by default. AURA does not send page content or images to Gemini unless the user enables AI and accepts the consent checkbox in the popup. Private and local-network image URLs are rejected before fetch. See [privacy-policy.md](docs/privacy-policy.md).

## Setup

1. Clone repository.
2. Optional AI config:

```bash
cp src/config.example.js src/config.js
```

Edit `src/config.js` and set `GEMINI_API_KEY`, or enter a user-owned Gemini API key in the popup. Do not commit `src/config.js`.

3. Load extension:
   - Open `chrome://extensions/` or `edge://extensions/`
   - Enable Developer mode
   - Click Load unpacked
   - Select this `AURA` folder

## Development

No build step required. Source files are loaded directly by the browser extension.

```bash
npm run check
npm test
npm run package
```

`npm run check` validates manifest-linked files and JavaScript syntax. `npm test` runs Node built-in tests for settings, manifest, AI parsing, popup accessibility, runtime, and URL-safety contracts. `npm run package` creates `dist/aura-extension.zip`.

## Structure

```text
manifest.json
src/
  background/background.js       # Gemini, TTS, cache, rate limit
  background/ai-request-builder.js
  background/ai-response-parser.js
  background/safe-url.js         # Public image URL guard
  content/aura-defaults.js       # Settings schema and legacy migration
  content/aura-engine.js         # Page accessibility engine
  content/aura-ai.js             # Image candidate scanner
  content/cs_ui.js               # Content bootstrap and messages
  popup/popup.html               # Popup controls
  popup/popup.css
  popup/popup-settings.js
  popup/popup-actions.js
  popup/popup.js
docs/
tests/
scripts/check-extension.mjs
```

## Limitations

- AI descriptions can be wrong; treat them as assistive hints, not facts.
- Broad page access is required for page-level accessibility controls and image fetch. This is documented in privacy docs.
- Screen reader validation still requires manual testing on real browser pages.
