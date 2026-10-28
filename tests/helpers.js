/* A tiny in-memory stand-in for window.localStorage. */
function fakeStorage(init) {
  var m = new Map(Object.entries(init || {}));
  return {
    get length() { return m.size; },
    key: function (i) { return Array.from(m.keys())[i] ?? null; },
    getItem: function (k) { return m.has(k) ? m.get(k) : null; },
    setItem: function (k, v) { m.set(k, String(v)); },
    removeItem: function (k) { m.delete(k); },
    dump: function () { return Object.fromEntries(m); }
  };
}
module.exports = { fakeStorage: fakeStorage };
