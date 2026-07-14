/* ==========================================================================
   LearnShelf — storage.js
   The single source of truth for user state. Everything the app remembers
   about *you* (not the content) lives in localStorage and is read/written
   only through this module. Content lives in Git; state lives here.

   Exposes a global `Storage` object (no build step, no modules).

   Keys are namespaced under "learnshelf:". A chapter is identified by its
   `chapterId` — the string `"<courseSlug>/<file>"`, e.g. "linux/introduction.html".
   ========================================================================== */
(function (window) {
  "use strict";

  var NS = "learnshelf:";
  var KEYS = {
    theme: NS + "theme",             // "light" | "dark"
    favorites: NS + "favorites",     // [chapterId]
    completed: NS + "completed",     // [chapterId]
    recent: NS + "recent",           // [{ id, at }] most-recent-first
    scroll: NS + "scroll",           // { [chapterId]: ratio 0..1 }
    lastRead: NS + "lastRead"        // { [chapterId]: timestamp }
  };

  var RECENT_LIMIT = 12;

  /* ---- low-level JSON helpers (fail-safe) ------------------------------- */

  // Is localStorage usable? (file://, privacy mode, and quota can all fail.)
  function available() {
    try {
      var k = NS + "__test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  var OK = available();

  function readJSON(key, fallback) {
    if (!OK) return fallback;
    try {
      var raw = window.localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    if (!OK) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Toggle a value inside an array; returns the new membership (true = present).
  function toggleInArray(key, value) {
    var arr = readJSON(key, []);
    var i = arr.indexOf(value);
    if (i === -1) {
      arr.push(value);
      writeJSON(key, arr);
      return true;
    }
    arr.splice(i, 1);
    writeJSON(key, arr);
    return false;
  }

  /* ---- theme ------------------------------------------------------------ */

  function getTheme() {
    // The inline <head> script already applied a theme; mirror that choice.
    var saved = OK ? window.localStorage.getItem(KEYS.theme) : null;
    if (saved === "light" || saved === "dark") return saved;
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (OK) {
      try { window.localStorage.setItem(KEYS.theme, theme); } catch (e) {}
    }
    return theme;
  }

  function toggleTheme() {
    return setTheme(getTheme() === "dark" ? "light" : "dark");
  }

  /* ---- favorites -------------------------------------------------------- */

  function getFavorites() { return readJSON(KEYS.favorites, []); }
  function isFavorite(id) { return getFavorites().indexOf(id) !== -1; }
  function toggleFavorite(id) { return toggleInArray(KEYS.favorites, id); }

  /* ---- completed -------------------------------------------------------- */

  function getCompleted() { return readJSON(KEYS.completed, []); }
  function isCompleted(id) { return getCompleted().indexOf(id) !== -1; }
  function toggleCompleted(id) { return toggleInArray(KEYS.completed, id); }

  function setCompleted(id, done) {
    var arr = getCompleted();
    var has = arr.indexOf(id) !== -1;
    if (done && !has) { arr.push(id); writeJSON(KEYS.completed, arr); }
    if (!done && has) { arr.splice(arr.indexOf(id), 1); writeJSON(KEYS.completed, arr); }
    return !!done;
  }

  // How many of a course's chapters are complete → { done, total, ratio }.
  function courseProgress(courseSlug, chapterFiles) {
    var done = 0;
    var completed = getCompleted();
    for (var i = 0; i < chapterFiles.length; i++) {
      if (completed.indexOf(courseSlug + "/" + chapterFiles[i]) !== -1) done++;
    }
    var total = chapterFiles.length;
    return { done: done, total: total, ratio: total ? done / total : 0 };
  }

  /* ---- recently read / last read --------------------------------------- */

  // Record a visit: pushes to the front of the recent list, stamps lastRead.
  function recordRead(id, timestamp) {
    var at = timestamp || nowSafe();
    var recent = readJSON(KEYS.recent, []).filter(function (e) { return e.id !== id; });
    recent.unshift({ id: id, at: at });
    if (recent.length > RECENT_LIMIT) recent = recent.slice(0, RECENT_LIMIT);
    writeJSON(KEYS.recent, recent);

    var last = readJSON(KEYS.lastRead, {});
    last[id] = at;
    writeJSON(KEYS.lastRead, last);
  }

  function getRecent() { return readJSON(KEYS.recent, []); }
  function getLastRead(id) { return readJSON(KEYS.lastRead, {})[id] || null; }

  /* ---- scroll position -------------------------------------------------- */

  function saveScroll(id, ratio) {
    var all = readJSON(KEYS.scroll, {});
    all[id] = Math.max(0, Math.min(1, ratio));
    writeJSON(KEYS.scroll, all);
  }

  function getScroll(id) {
    var r = readJSON(KEYS.scroll, {})[id];
    return typeof r === "number" ? r : 0;
  }

  /* ---- misc ------------------------------------------------------------- */

  // Date.now() without assuming it's mockable; safe fallback if blocked.
  function nowSafe() {
    try { return Date.now(); } catch (e) { return 0; }
  }

  function clearAll() {
    if (!OK) return;
    Object.keys(KEYS).forEach(function (k) {
      try { window.localStorage.removeItem(KEYS[k]); } catch (e) {}
    });
  }

  /* ---- public API ------------------------------------------------------- */

  window.Storage = {
    available: OK,
    KEYS: KEYS,

    getTheme: getTheme,
    setTheme: setTheme,
    toggleTheme: toggleTheme,

    getFavorites: getFavorites,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,

    getCompleted: getCompleted,
    isCompleted: isCompleted,
    toggleCompleted: toggleCompleted,
    setCompleted: setCompleted,
    courseProgress: courseProgress,

    recordRead: recordRead,
    getRecent: getRecent,
    getLastRead: getLastRead,

    saveScroll: saveScroll,
    getScroll: getScroll,

    clearAll: clearAll
  };
})(window);
