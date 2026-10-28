const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../core.js");
const { fakeStorage } = require("./helpers.js");

/* What a phone running the original app (schema 1) has in localStorage. */
function v1Storage() {
  return fakeStorage({
    "kjv-verses-v1": JSON.stringify({ "eph1-3": { level: 3, last: 1793000000000, best: 88, best_MINE: 70 }, "rom3-23": { level: 1, last: 1793100000000 }, "c:John 3:16–18": { best: 50, last: 1793100000000 } }),
    "kjv-verses-favs": JSON.stringify(["eph1-3"]),
    "kjv-verses-days": JSON.stringify({ "2026-10-26": 2, "2026-10-27": 1 }),
    "kjv-verses-custom": JSON.stringify({ "eph1-3": "pasted copyrighted text" }),
    "kjv-verses-ver": "MINE",
    "kjv-verses-theme": "dark",
    "kjv-verses-last": "eph1-3",
    "kjv-verses-view": "passages"
  });
}

test("migration 1 -> 2 keeps every rating, score, favorite and day", () => {
  const st = v1Storage();
  const r = core.migrateStorage(st);
  assert.deepEqual(r, { from: 1, to: 2, migrated: true });
  const p = JSON.parse(st.getItem("kjv-verses-v1"));
  assert.equal(p["eph1-3"].level, 3);
  assert.equal(p["eph1-3"].best, 88);
  assert.equal(p["eph1-3"].last, 1793000000000);
  assert.equal(p["eph1-3"].interval, 7);
  assert.equal(p["rom3-23"].interval, 1);
  assert.equal(p["c:John 3:16–18"].best, 50);
  assert.deepEqual(JSON.parse(st.getItem("kjv-verses-favs")), ["eph1-3"]);
  assert.deepEqual(JSON.parse(st.getItem("kjv-verses-days")), { "2026-10-26": 2, "2026-10-27": 1 });
  assert.equal(st.getItem("kjv-verses-theme"), "dark");
  assert.equal(st.getItem("kjv-verses-last"), "eph1-3");
  assert.equal(st.getItem(core.SCHEMA_KEY), "2");
});

test("migration 1 -> 2 removes pasted text and the paste version", () => {
  const st = v1Storage();
  core.migrateStorage(st);
  assert.equal(st.getItem("kjv-verses-custom"), null);
  assert.equal(st.getItem("kjv-verses-ver"), null);
  assert.equal(JSON.parse(st.getItem("kjv-verses-v1"))["eph1-3"].best_MINE, undefined);
});

test("migration keeps a backup of the old data", () => {
  const st = v1Storage();
  core.migrateStorage(st);
  const b = JSON.parse(st.getItem(core.BACKUP_KEY));
  assert.equal(b.schemaVersion, 1);
  assert.equal(b.data["kjv-verses-v1"]["eph1-3"].level, 3);
});

test("migration is idempotent and a fresh install starts at the current schema", () => {
  const st = v1Storage();
  core.migrateStorage(st);
  const once = st.dump();
  assert.equal(core.migrateStorage(st).migrated, false);
  assert.deepEqual(st.dump(), once);
  const fresh = fakeStorage();
  assert.equal(core.migrateStorage(fresh).migrated, false);
  assert.equal(fresh.getItem(core.SCHEMA_KEY), String(core.SCHEMA_VERSION));
});

test("data from a newer schema is left untouched", () => {
  const st = fakeStorage({ "kjv-verses-schema": "99", "kjv-verses-v1": "{\"x\":{\"level\":2}}" });
  const before = st.dump();
  assert.equal(core.migrateStorage(st).newer, true);
  assert.deepEqual(st.dump(), before);
});

test("export then import round-trips", () => {
  const st = v1Storage();
  core.migrateStorage(st);
  const doc = core.exportData(st, Date.UTC(2026, 9, 28));
  assert.equal(doc.app, "hid-in-my-heart");
  assert.equal(doc.schemaVersion, core.SCHEMA_VERSION);
  assert.equal(doc.exportedAt, "2026-10-28T00:00:00.000Z");
  assert.ok(!("kjv-verses-schema" in doc.data) && !("kjv-verses-backup" in doc.data));
  const text = JSON.stringify(doc);
  const res = core.parseImport(text);
  assert.equal(res.ok, true);
  const other = fakeStorage({ "kjv-verses-favs": "[\"zzz\"]" });
  core.importData(other, res.data);
  assert.deepEqual(core.exportData(other, Date.UTC(2026, 9, 28)), doc);
});

test("import accepts and upgrades a schema 1 file", () => {
  const res = core.parseImport(JSON.stringify({ app: "hid-in-my-heart", schemaVersion: 1, data: { "kjv-verses-v1": { a: { level: 2, last: 1 } }, "kjv-verses-custom": { a: "x" }, "kjv-verses-ver": "MINE" } }));
  assert.equal(res.ok, true);
  assert.deepEqual(res.data, { "kjv-verses-v1": { a: { level: 2, last: 1, interval: 3 } } });
});

test("import rejects malformed files with a reason", () => {
  const bad = [
    ["", /empty/],
    ["{not json", /not valid JSON/],
    ["[]", /not exported/],
    [JSON.stringify({ app: "other", schemaVersion: 2, data: {} }), /not exported/],
    [JSON.stringify({ app: "hid-in-my-heart", data: {} }), /version/],
    [JSON.stringify({ app: "hid-in-my-heart", schemaVersion: 1.5, data: {} }), /version/],
    [JSON.stringify({ app: "hid-in-my-heart", schemaVersion: 3, data: {} }), /newer version/],
    [JSON.stringify({ app: "hid-in-my-heart", schemaVersion: 2 }), /no data/],
    [JSON.stringify({ app: "hid-in-my-heart", schemaVersion: 2, data: { "kjv-verses-v1": { a: { level: 9 } } } }), /invalid value for v1/],
    [JSON.stringify({ app: "hid-in-my-heart", schemaVersion: 2, data: { "kjv-verses-v1": { a: { level: 1, email: "x@y.z" } } } }), /invalid value/],
    [JSON.stringify({ app: "hid-in-my-heart", schemaVersion: 2, data: { "kjv-verses-favs": [1, 2] } }), /invalid value for favs/],
    [JSON.stringify({ app: "hid-in-my-heart", schemaVersion: 2, data: { "kjv-verses-days": { "yesterday": 2 } } }), /invalid value for days/],
    [JSON.stringify({ app: "hid-in-my-heart", schemaVersion: 2, data: { "kjv-verses-ver": "NIV" } }), /invalid value for ver/],
    ["x".repeat(1024 * 1024 + 1), /too large/]
  ];
  for (const [text, re] of bad) {
    const r = core.parseImport(text);
    assert.equal(r.ok, false, text.slice(0, 60));
    assert.match(r.error, re);
  }
});

test("a rejected import changes nothing", () => {
  const st = v1Storage();
  core.migrateStorage(st);
  const before = st.dump();
  const r = core.parseImport("{oops");
  if (r.ok) core.importData(st, r.data);
  assert.deepEqual(st.dump(), before);
});

test("clearAll removes every app key, and only those", () => {
  const st = v1Storage();
  st.setItem("someone-else", "keep");
  core.migrateStorage(st);
  core.clearAll(st);
  assert.deepEqual(st.dump(), { "someone-else": "keep", "kjv-verses-schema": String(core.SCHEMA_VERSION) });
});

test("review intervals grow with recall and reset when shaky", () => {
  let gap = core.nextInterval(0, 3, true);
  assert.equal(gap, 7);
  gap = core.nextInterval(gap, 3, true); assert.equal(gap, 18);
  gap = core.nextInterval(gap, 3, true); assert.equal(gap, 45);
  gap = core.nextInterval(gap, 3, true); assert.equal(gap, 113);
  gap = core.nextInterval(gap, 3, true); assert.equal(gap, 180);
  assert.equal(core.nextInterval(45, 2, true), 30);
  assert.equal(core.nextInterval(4, 2, true), 6);
  assert.equal(core.nextInterval(45, 1, true), 1);
  assert.equal(core.nextInterval(18, 3, false), 18, "rating early does not grow the gap");
  assert.equal(core.intervalOf({ level: 2 }), 3);
  assert.equal(core.intervalOf({}), 0);
});
