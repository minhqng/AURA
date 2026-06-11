# Permission Audit

Date: 2026-06-11

## Manifest Permissions

| Permission | Status | Reason | Code path |
| --- | --- | --- | --- |
| `storage` | Required | Save global settings, per-site settings, AI cache, local API key metadata. | `src/popup/popup.js`, `src/background/background.js`, `src/content/cs_ui.js` |
| `activeTab` | Required | Let popup identify and message current active tab after user opens extension. | `src/popup/popup.js` |
| `tts` | Required | Read generated AI descriptions aloud after user action. | `src/background/background.js` |
| `tabs` | Removed | Current popup can operate through `activeTab` plus host access. | N/A |

## Host Permissions

| Host | Status | Reason |
| --- | --- | --- |
| `https://generativelanguage.googleapis.com/*` | Required when AI enabled | Calls Gemini API for opt-in image assistance. |
| `<all_urls>` | Retained with disclosure | Content accessibility controls must run on arbitrary pages user visits. Review-sensitive; documented in privacy policy. |

## Guardrails

- AI is off by default.
- Consent required before image transfer.
- Content scanner selects visible public images only.
- Background rejects non-web, local, and private-network image URLs.
- Release package excludes `src/config.js`.

## Unresolved Questions

- Store publication may require optional host permissions instead of install-time `<all_urls>`.
