# Hid in my heart

A Bible memory verse trainer: a guided course and practice modes (read, fade, first letters, type, recite), with review reminders. Works offline as a PWA. Progress stays on the device.

Static site, no build step, no dependencies. Hosted on GitHub Pages.

## Files

- `index.html`: the app shell and styles
- `app.js`: the app; `core.js`: storage schema, migrations, export/import, review scheduling; `external.js`: the "leaving the app" notice
- `data/text/<book>.json`: KJV, ASV and BBE text, one file per book
- `sw.js`: service worker (offline cache and update prompt)
- `fonts/`: self-hosted fonts and their licenses
- `COMPLIANCE.md`: what the app sends, stores, caches and ships

## Tests

```
npm test
```

Runs `node --test` (Node 18+). Covers storage migrations, import validation, review intervals, the service-worker file list, the Bible text and privacy rules (no third-party URLs, CSP on every page).

## Releasing

1. Bump `APP_VERSION` in `app.js` and `CACHE_VERSION` in `sw.js`.
2. If you add a book to `data/text/`, add it to `HID_TEXT_BOOKS` in `app.js` and `TEXT` in `sw.js`.
3. If you change what is stored, bump `SCHEMA_VERSION` in `core.js`, add a migration and a test.
4. Run `npm test` and update `COMPLIANCE.md`.
