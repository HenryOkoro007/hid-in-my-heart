/* Service worker: makes the app work offline.
   Bump CACHE_VERSION on every release. A new version waits until the person taps "Update now"
   in the app (never a silent swap); then old caches are deleted. Only this site's own files are cached. */
var CACHE_VERSION = "hid-v6";
var CORE = [
  "./",
  "./index.html",
  "./app.js",
  "./core.js",
  "./external.js",
  "./manifest.json",
  "./about.html",
  "./privacy.html",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./fonts/newsreader-latin.woff2",
  "./fonts/instrument-sans-latin.woff2"
];
/* One file per Bible book. Keep in step with HID_TEXT_BOOKS in app.js (tests/sw.test.js checks this). */
var TEXT = [
  "./data/text/1-corinthians.json",
  "./data/text/1-john.json",
  "./data/text/1-peter.json",
  "./data/text/1-thessalonians.json",
  "./data/text/1-timothy.json",
  "./data/text/2-corinthians.json",
  "./data/text/2-peter.json",
  "./data/text/2-timothy.json",
  "./data/text/acts.json",
  "./data/text/colossians.json",
  "./data/text/daniel.json",
  "./data/text/ephesians.json",
  "./data/text/exodus.json",
  "./data/text/galatians.json",
  "./data/text/hebrews.json",
  "./data/text/isaiah.json",
  "./data/text/james.json",
  "./data/text/jeremiah.json",
  "./data/text/john.json",
  "./data/text/joshua.json",
  "./data/text/lamentations.json",
  "./data/text/luke.json",
  "./data/text/mark.json",
  "./data/text/matthew.json",
  "./data/text/philippians.json",
  "./data/text/proverbs.json",
  "./data/text/psalm.json",
  "./data/text/revelation.json",
  "./data/text/romans.json",
  "./data/text/titus.json"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE_VERSION).then(function (c) { return c.addAll(CORE.concat(TEXT)); }));
});

/* Sent by the app when the person taps "Update now". */
self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   /* other sites are never touched or cached */

  /* Pages come from this version's cache too, so a page and its scripts always match.
     New versions arrive through the update prompt, not by mixing old and new files. */
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(function (m) {
        return m || fetch(req).catch(function () { return caches.match("./index.html"); });
      })
    );
    return;
  }

  /* Everything else (scripts, Bible text, fonts, icons): cache first, then network. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); }); }
        return res;
      });
    })
  );
});
