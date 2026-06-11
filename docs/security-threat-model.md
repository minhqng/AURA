# Security Threat Model

## Scope

AURA is a browser extension with popup, content scripts, and MV3 background worker. Primary protected assets: user browsing context, image bytes sent to Gemini, local settings, local Gemini API key.

## Threats and Controls

| Threat | Risk | Current control |
| --- | --- | --- |
| Hidden/private image exfiltration | Page inserts hidden intranet image and AI sends bytes | Content visibility/public filter plus background private URL guard |
| Redirect to private URL | Public URL redirects to local resource | Background fetch uses `redirect: "error"` |
| API key leak | Key committed or packaged | `src/config.js` gitignored and package script excludes it; popup key stored locally |
| Overbroad host access | Store/user trust concern | Permission audit, privacy disclosure, no telemetry |
| Model hallucination | Incorrect assistive description | README and docs label AI as assistive hint; structured result keeps cautions |
| Sensitive inference | Model identifies people/protected traits | Prompt forbids identity/protected trait inference |
| Cache persistence | Generated descriptions remain after use | User can clear AI cache and local API key |

## Data Flow

1. User enables AI and consent.
2. Content identifies visible public image or selected image.
3. Background validates URL, size, rate limit, and cache.
4. Background sends image bytes to Gemini.
5. Result returns to content/popup and may be spoken by TTS.

## Residual Risks

- `<all_urls>` remains broad.
- Live Gemini behavior needs manual quality review.
- Local API key is protected by browser extension storage, not hardware-backed secrets.

## Unresolved Questions

- Whether future release requires backend proxy or user-owned API key only.
