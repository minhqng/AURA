# Project Overview PDR

## Overview

AURA is a browser extension for web accessibility. Goal: help blind and low-vision users read, navigate, and understand visual web content with privacy-first AI assistance.

## Users

- Low-vision users needing contrast, text scaling, focus aid.
- Blind users needing image descriptions and TTS.
- Users sensitive to motion needing reduced animation.

## Requirements

- Visual settings apply live and are reversible.
- AI image description is opt-in only.
- Popup is keyboard operable and screen-reader labeled.
- No backend or telemetry.
- No committed API key.

## Non-Goals

- Account system.
- Analytics.
- Automatic form filling.
- Full WCAG conformance claim for third-party pages.

## Success Metrics

- Extension loads without runtime errors.
- `npm run check` and `npm test` pass.
- User can enable visual aids in under 30 seconds.
- AI never sends image data before consent.

## Unresolved Questions

- Final target: NCKH demo only or Chrome Web Store publication.
- Whether to add local/on-device AI fallback when Chrome Prompt API availability is stable.
