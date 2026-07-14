/* ==========================================================================
   LearnShelf — reader.js
   Enhances a chapter page. Include it on any chapter HTML together with
   storage.js:

     <script src="../../js/storage.js" defer></script>
     <script src="../../js/reader.js" defer></script>

   It figures out which chapter this is from the URL, records the visit,
   restores scroll position, and shows a small self-styled toolbar with
   Favorite / Mark-complete controls. It is intentionally self-contained (its
   own CSS) so it works even on chapters that don't use the site stylesheet.
   ========================================================================== */
(function (window, document) {
  "use strict";

  var Storage = window.Storage;
  if (!Storage) return; // storage.js must load first

  /* ---- identify this chapter from the path ------------------------------
     .../courses/<slug>/<file>.html  ->  id = "<slug>/<file>.html"           */
  function chapterId() {
    var parts = window.location.pathname.split("/").filter(Boolean);
    var i = parts.lastIndexOf("courses");
    if (i === -1 || parts.length < i + 3) return null;
    return decodeURIComponent(parts[i + 1]) + "/" + decodeURIComponent(parts[i + 2]);
  }

  var id = chapterId();
  if (!id) return;

  /* ---- scroll position -------------------------------------------------- */

  function maxScroll() {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  function restoreScroll() {
    var ratio = Storage.getScroll(id);
    if (ratio > 0.02) {
      // Wait for layout/fonts so scrollHeight is final.
      window.requestAnimationFrame(function () {
        window.scrollTo(0, ratio * maxScroll());
      });
    }
  }

  var saveTimer = null;
  function onScroll() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      Storage.saveScroll(id, window.scrollY / maxScroll());
    }, 200);
  }

  /* ---- toolbar (self-styled) -------------------------------------------- */

  function injectStyles() {
    var css =
      "#ls-reader-bar{position:fixed;right:16px;bottom:16px;z-index:2147483000;" +
      "display:flex;gap:8px;padding:8px;border-radius:12px;" +
      "background:rgba(22,27,34,.94);box-shadow:0 8px 24px rgba(0,0,0,.35);" +
      "font:14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}" +
      "#ls-reader-bar button{display:inline-flex;align-items:center;gap:6px;" +
      "cursor:pointer;border:1px solid rgba(255,255,255,.18);background:transparent;" +
      "color:#e6edf3;padding:8px 12px;border-radius:8px;transition:background .12s;}" +
      "#ls-reader-bar button:hover{background:rgba(255,255,255,.10);}" +
      "#ls-reader-bar button[aria-pressed='true']{color:#f2b705;border-color:#f2b705;}" +
      "#ls-reader-bar button.ls-done[aria-pressed='true']{color:#3fb950;border-color:#3fb950;}" +
      "@media print{#ls-reader-bar{display:none!important;}}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildBar() {
    injectStyles();

    var bar = document.createElement("div");
    bar.id = "ls-reader-bar";

    var fav = document.createElement("button");
    fav.type = "button";
    fav.setAttribute("aria-pressed", Storage.isFavorite(id) ? "true" : "false");
    fav.innerHTML = "★ <span>Favorite</span>";
    fav.addEventListener("click", function () {
      fav.setAttribute("aria-pressed", Storage.toggleFavorite(id) ? "true" : "false");
    });

    var done = document.createElement("button");
    done.type = "button";
    done.className = "ls-done";
    var syncDone = function (v) {
      done.setAttribute("aria-pressed", v ? "true" : "false");
      done.innerHTML = (v ? "✓ <span>Completed</span>" : "○ <span>Mark complete</span>");
    };
    syncDone(Storage.isCompleted(id));
    done.addEventListener("click", function () {
      var v = Storage.toggleCompleted(id);
      syncDone(v);
    });

    bar.appendChild(fav);
    bar.appendChild(done);
    document.body.appendChild(bar);
  }

  /* ---- boot ------------------------------------------------------------- */

  function boot() {
    Storage.recordRead(id);
    restoreScroll();
    buildBar();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window, document);
