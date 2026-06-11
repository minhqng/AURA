# Privacy Policy

Effective date: 2026-06-11

## Summary

AURA stores accessibility preferences locally through Chrome extension storage. AURA does not collect analytics and does not run a backend.

## Data Stored

- Global accessibility settings.
- Per-site origin overrides, for example `https://example.com`.
- AI cache entries for recently described images.
- Short rate-limit timestamps for AI requests.
- Optional Gemini API key supplied by the user, stored in local extension storage.

## AI Image Description

AI is disabled by default. When AI is off, AURA does not send images or page content to Gemini.

When user enables AI and accepts consent, AURA may fetch visible public image bytes from the current page and send them to Gemini API to generate a description. Hidden images, non-http URLs, and local/private-network image URLs are rejected before the background fetch. AURA does not intentionally send form values, cookies, passwords, or full page text.

## API Key

Gemini API key can be provided in the popup and is stored in local extension storage. Development can also use local `src/config.js`; this file is ignored by git, excluded from release packaging, and must not be committed.

## Permissions

- `storage`: save accessibility settings.
- `activeTab`: identify and message the current tab after user opens the popup.
- `tts`: read the first generated description from the popup describe action aloud.
- `<all_urls>`: apply accessibility controls and access images on pages the user visits.
- `https://generativelanguage.googleapis.com/*`: call Gemini API.

## User Control

User can:

- Disable AI.
- Clear AI cache.
- Clear local Gemini API key.
- Reset current site settings.
- Reset all settings.

## Unresolved Questions

- Final hosted privacy URL if publishing to Chrome Web Store.
