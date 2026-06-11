# Deployment Guide

## Local Validation

```bash
npm run check
npm test
npm run package
```

Manual:

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Load unpacked from project root.
4. Open popup on an `https://` page.
5. Toggle each visual setting.
6. Enable AI consent only after entering a user-owned Gemini API key in the popup or using local `src/config.js` for development.

## Release Package

Before packaging:

- Confirm `src/config.js` is not tracked.
- Run `npm run package`.
- Confirm `dist/aura-extension.zip` exists.
- Confirm `dist/aura-extension.zip` does not contain `src/config.js`.
- Confirm docs and README match current behavior.
- Confirm broad permissions are documented.
- Confirm AI privacy policy exists.
- Zip project without `.git`, `node_modules`, local secrets.

## Chrome Web Store Notes

Expected review-sensitive areas:

- `<all_urls>` content script and host permission.
- Gemini API data transfer.
- `tts` permission.
- Privacy disclosure and limited use language.

## CI

`.github/workflows/quality.yml` runs syntax checks, Node tests, and package creation on push and pull request.

## Rollback

Disable extension from browser extension page. For repo rollback, use git revert rather than deleting unrelated files.
