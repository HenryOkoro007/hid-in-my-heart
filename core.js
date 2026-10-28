/* Storage schema, migrations, export/import and review scheduling.
   Plain browser script (exposes window.HidCore) that also loads in Node for the tests in tests/. */
(function (root) {
  "use strict";

  var APP_ID = "hid-in-my-heart";
  var PREFIX = "kjv-verses-";
  var SCHEMA_KEY = "kjv-verses-schema";
  var BACKUP_KEY = "kjv-verses-backup";
  /* Version history:
     1  the original app (no schema key; had "My own text" in kjv-verses-custom)
     2  adds the schema key, review intervals, text size; removes pasted text */
  var SCHEMA_VERSION = 2;
  var VERSIONS = ["KJV", "ASV", "BBE"];
  var BASE_DAYS = { 1: 1, 2: 3, 3: 7 };
  var MAX_IMPORT_BYTES = 1024 * 1024;

  /* Every key the app stores, and what a valid value looks like. */
  var KEYS = {
    "kjv-verses-v1": isProgress,     // { passageId: { level, last, interval, best, best_ASV, best_BBE } }
    "kjv-verses-favs": isFavs,       // [ passageId ]
    "kjv-verses-days": isDays,       // { "YYYY-MM-DD": 1 opened | 2 practised }
    "kjv-verses-theme": function (v) { return v === "light" || v === "dark"; },
    "kjv-verses-ver": function (v) { return VERSIONS.indexOf(v) >= 0; },
    "kjv-verses-last": isId,
    "kjv-verses-view": function (v) { return ["course", "passages", "favs", "days"].indexOf(v) >= 0; },
    "kjv-verses-textsize": function (v) { return typeof v === "number" && v >= 0.8 && v <= 1.6; }
  };
  /* Keys saved as plain strings rather than JSON. */
  var RAW = { "kjv-verses-theme": 1, "kjv-verses-ver": 1, "kjv-verses-last": 1, "kjv-verses-view": 1 };

  function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function isId(v) { return typeof v === "string" && v.length > 0 && v.length <= 80; }
  function isNum(v, lo, hi) { return typeof v === "number" && isFinite(v) && v >= lo && v <= hi; }
  function isProgress(p) {
    if (!isObj(p)) return false;
    return Object.keys(p).every(function (id) {
      var s = p[id];
      if (!isId(id) || !isObj(s)) return false;
      return Object.keys(s).every(function (k) {
        var v = s[k];
        if (k === "level") return v === 1 || v === 2 || v === 3;
        if (k === "last") return isNum(v, 0, 8.64e15);
        if (k === "interval") return isNum(v, 1, 3650);
        if (k === "best" || /^best_(ASV|BBE)$/.test(k)) return isNum(v, 0, 100);
        return false;
      });
    });
  }
  function isFavs(v) { return Array.isArray(v) && v.length <= 2000 && v.every(isId); }
  function isDays(d) {
    return isObj(d) && Object.keys(d).every(function (k) { return /^\d{4}-\d{2}-\d{2}$/.test(k) && (d[k] === 1 || d[k] === 2); });
  }

  /* ---------- migrations: pure functions on a { key: parsedValue } map ---------- */
  var MIGRATIONS = {
    /* 1 -> 2: drop pasted text and anything tied to it, add review intervals. Nothing else is touched. */
    1: function (data) {
      delete data["kjv-verses-custom"];
      if (data["kjv-verses-ver"] === "MINE") delete data["kjv-verses-ver"];
      var p = data["kjv-verses-v1"];
      if (isObj(p)) {
        Object.keys(p).forEach(function (id) {
          var s = p[id];
          if (!isObj(s)) { delete p[id]; return; }
          delete s.best_MINE;
          if (s.level && !s.interval) s.interval = BASE_DAYS[s.level] || 1;
        });
      }
      return data;
    }
  };
  function migrate(data, from) {
    var v = from;
    while (v < SCHEMA_VERSION) {
      if (!MIGRATIONS[v]) throw new Error("No migration from schema " + v);
      data = MIGRATIONS[v](data);
      v++;
    }
    return data;
  }

  /* ---------- reading and writing a localStorage-like object ---------- */
  function ourKeys(storage) {
    var out = [];
    for (var i = 0; i < storage.length; i++) { var k = storage.key(i); if (k && k.indexOf(PREFIX) === 0) out.push(k); }
    return out;
  }
  function readAll(storage) {
    var data = {};
    ourKeys(storage).forEach(function (k) {
      if (k === SCHEMA_KEY || k === BACKUP_KEY) return;
      var raw = storage.getItem(k);
      if (RAW[k]) { data[k] = raw; return; }
      try { data[k] = JSON.parse(raw); } catch (e) { data[k] = raw; }
    });
    return data;
  }
  function writeAll(storage, data) {
    Object.keys(data).forEach(function (k) {
      if (!KEYS[k]) return;
      storage.setItem(k, RAW[k] ? String(data[k]) : JSON.stringify(data[k]));
    });
  }
  function storedVersion(storage) {
    var v = parseInt(storage.getItem(SCHEMA_KEY), 10);
    if (v > 0) return v;
    return ourKeys(storage).length ? 1 : SCHEMA_VERSION;   // old data without a schema key is version 1
  }

  /* Run on every start. Keeps a copy of the old data under BACKUP_KEY before changing anything,
     and only replaces keys after the whole migration has succeeded. */
  function migrateStorage(storage) {
    var from = storedVersion(storage);
    if (from > SCHEMA_VERSION) return { from: from, to: from, migrated: false, newer: true };
    if (from === SCHEMA_VERSION) { storage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION)); return { from: from, to: from, migrated: false }; }
    var before = readAll(storage);
    storage.setItem(BACKUP_KEY, JSON.stringify({ schemaVersion: from, savedAt: Date.now(), data: before }));
    var after = migrate(JSON.parse(JSON.stringify(before)), from);
    Object.keys(before).forEach(function (k) { if (!(k in after)) storage.removeItem(k); });
    writeAll(storage, after);
    storage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
    return { from: from, to: SCHEMA_VERSION, migrated: true };
  }

  /* ---------- export / import / clear ---------- */
  function exportData(storage, now) {
    var data = readAll(storage), out = {};
    Object.keys(KEYS).forEach(function (k) { if (k in data) out[k] = data[k]; });
    return { app: APP_ID, schemaVersion: SCHEMA_VERSION, exportedAt: new Date(now || Date.now()).toISOString(), data: out };
  }
  function parseImport(text) {
    if (typeof text !== "string" || !text.trim()) return { ok: false, error: "The file is empty." };
    if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: "The file is too large to be an export from this app." };
    var doc;
    try { doc = JSON.parse(text); } catch (e) { return { ok: false, error: "The file is not valid JSON." }; }
    if (!isObj(doc) || doc.app !== APP_ID) return { ok: false, error: "This file was not exported from Hid in my heart." };
    var v = doc.schemaVersion;
    if (typeof v !== "number" || Math.floor(v) !== v || v < 1) return { ok: false, error: "The file has no valid version number." };
    if (v > SCHEMA_VERSION) return { ok: false, error: "This file was made by a newer version of the app. Update the app and try again." };
    if (!isObj(doc.data)) return { ok: false, error: "The file has no data section." };
    var data;
    try { data = migrate(JSON.parse(JSON.stringify(doc.data)), v); } catch (e) { return { ok: false, error: "The file could not be upgraded to this version." }; }
    var clean = {};
    for (var k in data) {
      if (!Object.prototype.hasOwnProperty.call(data, k)) continue;
      if (!KEYS[k]) continue;                                   // ignore keys this version does not use
      if (!KEYS[k](data[k])) return { ok: false, error: "The file has an invalid value for " + k.replace(PREFIX, "") + "." };
      clean[k] = data[k];
    }
    return { ok: true, data: clean, fromVersion: v };
  }
  function clearAll(storage) {
    ourKeys(storage).forEach(function (k) { storage.removeItem(k); });
    storage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
  }
  function importData(storage, clean) {
    ourKeys(storage).forEach(function (k) { if (k !== BACKUP_KEY) storage.removeItem(k); });
    writeAll(storage, clean);
    storage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
  }

  /* ---------- review scheduling ----------
     Rating a passage sets how many days until it is due again. "Still shaky" resets to 1 day.
     "Getting there" and "Solid" grow the gap each time you rate it when it is due,
     so well-known passages come back less and less often (up to 30 and 180 days). */
  function nextInterval(prev, level, isDue) {
    var base = BASE_DAYS[level] || 1;
    prev = prev || 0;
    if (level === 1) return 1;
    if (!isDue) return Math.max(prev, base);                  // rating early does not grow the gap
    if (level === 2) return Math.min(30, Math.max(base, Math.round(prev * 1.5)));
    return Math.min(180, Math.max(base, Math.round(prev * 2.5)));
  }
  function intervalOf(s) { return s && s.level ? (s.interval || BASE_DAYS[s.level] || 1) : 0; }

  var api = {
    APP_ID: APP_ID, SCHEMA_VERSION: SCHEMA_VERSION, SCHEMA_KEY: SCHEMA_KEY, BACKUP_KEY: BACKUP_KEY, KEYS: Object.keys(KEYS),
    migrate: migrate, migrateStorage: migrateStorage, exportData: exportData, parseImport: parseImport,
    importData: importData, clearAll: clearAll, nextInterval: nextInterval, intervalOf: intervalOf
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.HidCore = api;
})(this);
