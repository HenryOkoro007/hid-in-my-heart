/* Static checks on the shipped files: privacy, offline list and Bible text. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const shipped = ["index.html", "about.html", "privacy.html", "app.js", "core.js", "external.js", "sw.js", "manifest.json"];

test("no third-party requests: the only outside addresses are links people click", () => {
  const allowed = /^https:\/\/(www\.biblegateway\.com\/passage\/|ko-fi\.com\/|docs\.github\.com\/)/;
  for (const f of shipped) {
    const urls = read(f).match(/https?:\/\/[a-z0-9][^\s"'<>)]*/gi) || [];
    for (const u of urls) assert.match(u, allowed, `${f} references ${u}`);
  }
  for (const f of ["index.html", "about.html", "privacy.html"]) {
    const html = read(f);
    assert.doesNotMatch(html, /<script[^>]+src=["']https?:/i, f);
    assert.doesNotMatch(html, /<link[^>]+href=["']https?:/i, f);
    assert.doesNotMatch(html, /<iframe/i, f);
  }
});

test("every page has a strict CSP and no-referrer policy", () => {
  for (const f of ["index.html", "about.html", "privacy.html"]) {
    const html = read(f);
    const csp = (html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1];
    assert.ok(csp, `${f} has a CSP`);
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /connect-src 'self'/);
    assert.doesNotMatch(csp, /script-src[^;]*(unsafe-inline|https?:)/, `${f} scripts are self only`);
    assert.match(html, /<meta name="referrer" content="no-referrer">/, f);
    assert.doesNotMatch(html, /<script>/, `${f} has no inline script`);
  }
});

test("outbound links say they leave the app and send no referrer", () => {
  const links = (read("app.js") + read("about.html") + read("privacy.html")).match(/<a [^>]*target="_blank"[^>]*>/g) || [];
  assert.ok(links.length >= 2);
  for (const a of links) {
    assert.match(a, /rel="noopener noreferrer"/, a);
    assert.match(a, /data-leave="/, a);
  }
});

test("no cookies, trackers or network calls in the code", () => {
  for (const f of ["app.js", "core.js", "external.js"]) {
    assert.doesNotMatch(read(f), /document\.cookie|sendBeacon|XMLHttpRequest|WebSocket|gtag|analytics/i, f);
  }
  /* The only fetch is for the app's own Bible text files. */
  const fetches = read("app.js").match(/fetch\([^)]*\)/g);
  assert.deepEqual(fetches, ['fetch("data/text/" + b + ".json")']);
});

test("the service worker precaches every app file and every book", () => {
  const sw = read("sw.js");
  const books = JSON.parse(read("app.js").match(/var HID_TEXT_BOOKS = (\[[^\n]*\]);/)[1]);
  const listed = [...sw.matchAll(/"\.\/data\/text\/([^"]+)\.json"/g)].map((m) => m[1]);
  assert.deepEqual(listed.sort(), books.slice().sort());
  for (const m of sw.matchAll(/"\.\/([^"]*)"/g)) {
    if (m[1]) assert.ok(fs.existsSync(path.join(root, m[1])), `missing ${m[1]}`);
  }
  for (const s of read("index.html").matchAll(/(?:src|href)="([^"#:]+\.(?:js|woff2|json|png|svg))"/g)) {
    assert.match(sw, new RegExp('"\\./' + s[1].replace(/\./g, "\\.") + '"'), `${s[1]} not precached`);
  }
  assert.doesNotMatch(sw, /googleapis|gstatic/);
});

test("Bible text: only KJV, ASV and BBE, complete and clean", () => {
  const dir = path.join(root, "data/text");
  let units = 0;
  for (const f of fs.readdirSync(dir)) {
    const book = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const [id, t] of Object.entries(book)) {
      units++;
      assert.deepEqual(Object.keys(t).sort(), ["ASV", "BBE", "KJV"], id);
      const nums = t.KJV.map((v) => v[0]).join();
      for (const v of ["ASV", "BBE"]) assert.equal(t[v].map((x) => x[0]).join(), nums, `${id} ${v} verse numbers`);
      for (const v of Object.values(t)) for (const [, text] of v) {
        assert.ok(text.trim().length > 0, id);
        assert.doesNotMatch(text, /^-|\bNUN\b|\[|\]|<|Psalm of David/, `${id}: "${text}"`);
      }
    }
  }
  assert.equal(units, 157);
  const all = shipped.map(read).join("\n") + fs.readdirSync(dir).map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
  assert.doesNotMatch(all, /one and only Son|whoever believes in him shall not perish|everyone who believes in him will not perish/i);
});

test("the paste-your-own-text feature is gone", () => {
  for (const f of ["index.html", "about.html", "app.js"]) {
    assert.doesNotMatch(read(f), /kjv-verses-custom|My own text|paste/i, f);
  }
});
