/* ==========================================================================
   LearnShelf — search.js
   Instant, client-side search over courses and chapters. No index server, no
   fetch — it filters the data app.js already loaded. Matches on course name,
   chapter name, tags, and description, and filters as you type.

   Exposes a global `Search` object; app.js calls Search.init(state).
   ========================================================================== */
(function (window, document) {
  "use strict";

  var input = null;
  var data = { courses: [], chapterIndex: {} };
  var built = [];          // flat searchable records
  var DEBOUNCE_MS = 80;
  var timer = null;
  var bound = false;       // guard against double-binding the input listener

  var homeSectionIds = ["continue-section", "favorites-section", "courses-section"];

  /* ---- build the searchable set ---------------------------------------- */

  function build() {
    built = [];
    data.courses.forEach(function (course) {
      built.push({
        type: "course",
        course: course,
        haystack: [
          course.title, course.description, course.difficulty, course.slug
        ].join(" ").toLowerCase()
      });
      (course.chapters || []).forEach(function (ch) {
        built.push({
          type: "chapter",
          course: course,
          chapter: ch,
          href: "courses/" + (course.slug + "/" + ch.file).split("/").map(encodeURIComponent).join("/"),
          id: course.slug + "/" + ch.file,
          haystack: [
            ch.title, course.title, (ch.tags || []).join(" ")
          ].join(" ").toLowerCase()
        });
      });
    });
  }

  /* ---- query ------------------------------------------------------------ */

  function search(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return built.filter(function (rec) {
      return terms.every(function (t) { return rec.haystack.indexOf(t) !== -1; });
    });
  }

  /* ---- rendering -------------------------------------------------------- */

  // While showing results, hide the home sections. To restore them we re-run
  // App.route(), which re-renders home and hides genuinely-empty sections
  // (Continue/Favorites) correctly — rather than us guessing which were hidden.
  function hideHomeSections() {
    homeSectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add("is-hidden");
    });
  }

  function chapterResultCard(rec) {
    var html =
      '<article class="card card--interactive course-card">' +
        '<div class="card__body">' +
          '<div class="badge badge--tag">' + window.UI.esc(rec.course.icon || "📘") + " " +
            window.UI.esc(rec.course.title) + "</div>" +
          '<h3 class="course-card__title">' + window.UI.esc(rec.chapter.title) + "</h3>" +
          '<div class="course-card__meta">' + window.UI.tagBadges(rec.chapter.tags, 3) + "</div>" +
          '<div class="course-card__footer">' +
            '<a class="btn btn--primary" href="' + rec.href + '">Read →</a>' +
          "</div>" +
        "</div>" +
      "</article>";
    var node = window.UI.fromHTML(html);
    node.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener("click", function () { window.Storage.recordRead(rec.id); });
    });
    return node;
  }

  function render(query) {
    var section = document.getElementById("search-results-section");
    var grid = document.getElementById("search-results");
    var count = document.getElementById("search-results-count");
    if (!section || !grid) return;

    if (!query.trim()) {
      section.classList.add("is-hidden");
      if (window.App) window.App.route();   // restore home correctly
      return;
    }

    var results = search(query);
    window.UI.clear(grid);

    results.forEach(function (rec) {
      grid.appendChild(rec.type === "course"
        ? window.UI.courseCard(rec.course)
        : chapterResultCard(rec));
    });

    if (!results.length) {
      grid.appendChild(window.UI.emptyState("No results for “" + query + "”."));
    }
    if (count) count.textContent = results.length + (results.length === 1 ? " result" : " results");

    section.classList.remove("is-hidden");
    hideHomeSections();
  }

  /* ---- wiring ----------------------------------------------------------- */

  function onInput() {
    var q = input.value;
    clearTimeout(timer);
    timer = setTimeout(function () { render(q); }, DEBOUNCE_MS);
  }

  function init(appState) {
    data = appState;
    build();

    // renderHome() may call init() again on every home render — bind once.
    if (bound) return;

    input = document.getElementById("search-input");
    if (!input) return;

    input.addEventListener("input", onInput);
    // Esc clears the search.
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; render(""); }
    });
    bound = true;
  }

  window.Search = { init: init, search: search };
})(window, document);
