# Compliance record

Last reviewed: 28 October 2026 (app v14, service worker cache `hid-v5`, storage schema 2).

This file records what the app sends, stores, caches and ships, so the privacy page can be checked against the code. Update it in the same change as any code that alters one of these lists. `npm test` checks most of it automatically (see `tests/site.test.js`).

Jurisdiction: Nigeria Data Protection Act 2023 (NDPA), with the EU GDPR as the stricter baseline. This is an engineering record, not legal advice; a data-protection professional should review it and the privacy page before launch.

## Hosting

| Item | Value |
|---|---|
| Host | GitHub Pages (GitHub, Inc.), static files only |
| Visitor logs | GitHub logs each visitor's IP address "for security purposes" ([GitHub docs: data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#data-collection)). We cannot see or disable these logs. |
| Log retention | Not published by GitHub. Disclosed as unknown on the privacy page. |
| Host analytics | None. GitHub Pages offers no visitor analytics, and none are added. |
| HTTPS | GitHub Pages "Enforce HTTPS" must stay ticked (Settings → Pages). `*.github.io` is on the browser HSTS preload list. |
| Response headers | GitHub Pages cannot set custom headers, so CSP and referrer policy are set with `<meta>` tags in every page. `frame-ancestors` cannot be set this way. |

## Network requests

The built app makes requests to its own origin only.

| Request | When | Data sent |
|---|---|---|
| Own origin: pages, `app.js`, `core.js`, `external.js`, `data/text/*.json`, fonts, icons, manifest | Load and service-worker install | Standard request (IP, User-Agent) to the host |
| `www.biblegateway.com/passage/?search=<reference>&version=<NIV, NLT or NKJV>` | Only when the person clicks a link and confirms the "leaving the app" notice | Reference and version in the URL; `rel="noopener noreferrer"` and `no-referrer` policy, so no referrer |
| `ko-fi.com/...` (about page) | Only on click and confirm | Same as above |
| `docs.github.com` (privacy page) | Only on click and confirm | Same as above |
| Browser speech service (Google, Microsoft or Apple, chosen by the browser) | Only while Recite mode is listening, after the person presses Start and grants the microphone | Microphone audio, sent by the browser itself, not by app code. Disclosed on the privacy page. |

Content-Security-Policy on every page: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; manifest-src 'self'; media-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'` (index also allows `worker-src 'self'`). `'unsafe-inline'` remains for styles only (inline `<style>` blocks and a few `style` attributes); no inline scripts exist.

No cookies, analytics, ads, crash reporting, session replay, push notifications, accounts, embeds or third-party scripts or fonts.

## Dependencies

None. There is no build step and no runtime or development dependency: `package.json` exists only to run `node --test`. There is nothing for `npm audit` to check. Fonts and icons are files in this repo.

| Asset | Source | License |
|---|---|---|
| `fonts/newsreader-latin.woff2` (variable, weights 400–500) | Newsreader, Google Fonts latin subset, v26 | SIL OFL 1.1, `fonts/OFL-Newsreader.txt` |
| `fonts/instrument-sans-latin.woff2` (variable, weights 400–600) | Instrument Sans, Google Fonts latin subset, v4 | SIL OFL 1.1, `fonts/OFL-InstrumentSans.txt` |

## Data stored on the device

All in `localStorage` under the `kjv-verses-` prefix. Nothing is in IndexedDB, cookies or sessionStorage. Nothing leaves the device.

| Key | Contents |
|---|---|
| `kjv-verses-v1` | Per passage id: `level` (1–3 self-rating), `last` (time last practised), `interval` (days until due), `best`, `best_ASV`, `best_BBE` (best recall %) |
| `kjv-verses-favs` | List of favorite passage ids |
| `kjv-verses-days` | `{"YYYY-MM-DD": 1 opened or 2 practised}` |
| `kjv-verses-theme`, `-textsize`, `-ver`, `-last`, `-view` | Preferences |
| `kjv-verses-schema` | Storage schema version (currently 2) |
| `kjv-verses-backup` | Copy of the data as it was before a schema migration, written once per migration |

No names, emails, device identifiers or free text. `navigator.storage.persist()` is requested after the first rating or check.

Data controls (Consistency → Your data): **Export my data** (JSON with `app`, `schemaVersion`, `exportedAt`, `data`), **Import data** (rejects bad JSON, wrong app, missing, fractional or newer version, unknown value shapes; upgrades older files; asks before replacing), **Clear all data** (asks first). An in-app note warns that clearing browser data or changing browser or device loses progress.

Migrations live in `core.js` and are tested in `tests/core.test.js`. Schema 1 → 2 removes the old pasted-text store (`kjv-verses-custom`) and the `MINE` version, and adds review intervals; all ratings, scores, favorites and days are kept.

## Cached assets (service worker)

`sw.js` precaches the 15 app files and 30 Bible text files listed in it, caches only same-origin responses, and never caches other sites. Caches are versioned (`CACHE_VERSION`); a new version waits until the person taps "Update now", then old caches are deleted. Pages are served from the same cache version as their scripts.

## Bible text

| Translation | Status | Source of the bundled text | Notes |
|---|---|---|---|
| KJV (1769 Oxford) | Public domain in most countries | Checked word for word against [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases) `formats/csv/KJV.csv` (public domain). | **UK:** the KJV is under perpetual Crown letters patent in the UK, administered by Cambridge University Press. Short quotations for personal study are generally tolerated, but confirm before a UK release. |
| ASV (1901) | Public domain | Checked against scrollmapper `ASV.csv`. | |
| BBE (1949/1964) | Generally treated as public domain; it was published in the UK by Cambridge University Press | Checked against scrollmapper `BBE.csv`. | **Verify the BBE's copyright status before a UK or EU release.** |

406 verses in each translation (157 passages) are stored in `data/text/<book>.json`, one file per book. Superscriptions ("A Psalm of David"), colophons and acrostic letters ("NUN") are removed; there are no headings, notes or publisher formatting. A spelling variant (KJV "Judæa") is kept as printed.

NIV, NLT and NKJV are not bundled, fetched, cached, displayed or used in exercises. They appear only as outbound BibleGateway links. The former "My own text" paste feature was removed in v14 so the app cannot hold user-pasted copyrighted text.

## Open gaps

- Contact email on the privacy page is still `YOUR-EMAIL@example.com`.
- Ko-fi link on the about page is still `ko-fi.com/YOUR-NAME`.
- The privacy page does not name the person or organisation responsible for the app (the data controller).
- Recite mode sends audio to a browser speech service. Disclosed, but it is a third party; consider whether to keep it.
- GitHub does not publish its Pages log retention period.
- BBE (UK/EU) and KJV (UK) rights need checking before a UK or EU release.
- No NDPC registration assessment has been made.
- `CACHE_VERSION` must be bumped by hand on each release.
