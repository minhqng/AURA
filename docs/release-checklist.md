# Release Checklist

## Automated

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run package`
- [ ] Confirm `dist/aura-extension.zip` exists
- [ ] Confirm `src/config.js` is not in package

## Manual Browser

- [ ] Load unpacked in Chrome
- [ ] Load unpacked in Edge
- [ ] Open popup on `https://example.com`
- [ ] Toggle contrast, typography, focus aid, reduced motion, reading guide
- [ ] Reset site settings
- [ ] Reset all settings

## Manual Accessibility

- [ ] Keyboard-only popup navigation
- [ ] Screen reader announces popup title, controls, status
- [ ] Focus indicator visible
- [ ] Popup text fits at max browser zoom and max font scale

## AI

- [ ] AI disabled by default
- [ ] Consent required before AI action
- [ ] User-provided Gemini key saved locally
- [ ] Caption task works on a visible public image
- [ ] OCR task returns detected text
- [ ] Objects task returns salient objects
- [ ] Question task answers user question
- [ ] Clear AI cache and API key works

## Store Docs

- [ ] Privacy policy hosted URL
- [ ] Store disclosure reviewed
- [ ] Permission audit reviewed
- [ ] Screenshots updated

## Unresolved Questions

- Final publication channel.
