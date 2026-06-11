# Code Standards

## Principles

- KISS: direct browser APIs, no framework until needed.
- DRY: one settings schema per runtime boundary.
- YAGNI: no backend, no analytics, no build pipeline for now.

## JavaScript

- Keep code files under 200 lines where practical.
- Content scripts are classic scripts loaded in manifest order.
- Background is MV3 module service worker.
- Register message listeners synchronously.
- Use explicit message names prefixed with `AURA_`.

## Privacy

- Never read or commit `src/config.js`.
- Never log API keys.
- Do not upload image/page data unless AI consent is enabled.
- Store only settings, origin-scoped overrides, and bounded AI cache.

## Testing

- Run `npm run check`.
- Run `npm test`.
- Manual test Chrome/Edge extension load before release.

## File Naming

- Use kebab-case for new files.
- Plan/report files stay under `plans/`.
- Evergreen docs stay under `docs/`.
