# Design Guidelines

## Product Feel

AURA is an assistive tool, not a marketing page. UI should be quiet, compact, predictable, and keyboard-first.

## Popup

- Use semantic controls: radio, checkbox, range, select, button.
- Keep status in `role="status"` with `aria-live`.
- Keep focus visible at all times.
- Avoid dead buttons and placeholder links.
- Keep labels short and concrete.

## Accessibility

- Popup itself must remain usable at large text sizes.
- Every control must have visible text label.
- Do not rely on color alone for state.
- Avoid destructive page CSS as default.

## Visual Style

- Use neutral base colors and one restrained accent.
- Radius max 8px for panels/buttons.
- No decorative blobs, gradients, or nested cards.

## AI UX

- AI disabled by default.
- Consent before upload.
- Generated image descriptions are assistive hints.
- Error messages should be clear and recoverable.
