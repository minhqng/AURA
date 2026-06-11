# Chrome Web Store Disclosure Draft

## Single Purpose

AURA improves browsing accessibility for blind and low-vision users through visual controls, reading aids, and opt-in AI image assistance.

## Permission Justification

- `storage`: save accessibility preferences, per-site overrides, AI cache, and local user-provided Gemini key metadata.
- `activeTab`: apply settings and AI actions to the current tab after user opens the popup.
- `tts`: read generated image descriptions aloud.
- `<all_urls>`: apply accessibility controls across sites visited by the user.
- `https://generativelanguage.googleapis.com/*`: send opt-in image requests to Gemini.

## User Data Use

AURA does not collect analytics and does not run a project backend. When AI is enabled and the user consents, AURA may send visible public image bytes to Gemini for image assistance. It does not intentionally send page text, forms, passwords, cookies, or hidden/private-network images.

## User Controls

- AI off by default.
- Consent checkbox required.
- Clear AI cache.
- Clear local API key.
- Reset site settings.
- Reset all settings.

## Limited Use Statement

Data transfer is limited to providing user-requested accessibility assistance. AURA does not sell data, use data for advertising, or use data for unrelated profiling.

## Unresolved Questions

- Hosted privacy policy URL still required before publication.
