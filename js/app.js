/* ==========================================================================
   LearnShelf — app.js
   The orchestrator. Loads the course manifest and every course.json, merges in
   user state from Storage, and renders the right view for the current URL:
     - index.html            → homepage (all courses, continue, favorites)
     - index.html?course=x    → that course's chapter list
   UI rendering lives in ui.js; state lives in storage.js; search in search.js.
   This file wires them together and owns routing.
   ========================================================================== */
(function (window, document) {
  "use strict";

  var COURSES_ROOT = "courses/";
  var MANIFEST = COURSES_ROOT + "courses.json";

  // In-memory state for this page load.
  var state = {
    courses: [],        // [{ slug, ...course.json, progress }]
    chapterIndex: {}     // chapterId -> { course, chapter, index, href }
  };

  /* ---- data loading ----------------------------------------------------- */

  function fetchJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " → HTTP " + r.status);
      return r.json();
    });
  }

  // Load manifest, then every course.json in parallel. Bad courses are skipped
  // (logged) rather than breaking the whole page.
  function loadCourses() {
    return fetchJSON(MANIFEST).then(function (manifest) {
      var slugs = (manifest && manifest.courses) || [];
      return Promise.all(slugs.map(function (slug) {
        return fetchJSON(COURSES_ROOT + slug + "/course.json")
          .then(function (course) {
            course.slug = slug;
            normalizeCourse(course);
            return course;
          })
          .catch(function (err) {
            console.warn("[LearnShelf] Skipping course '" + slug + "':", err.message);
            return null;
          });
      }));
    }).then(function (list) {
      state.courses = list.filter(Boolean);
      indexChapters();
      computeProgress();
      return state.courses;
    });
  }

  /* ---- course normalization (nested-folder support) --------------------- */

  // Join a folder prefix and a file into one course-relative path.
  // "M prashant" + "V1.html" -> "M prashant/V1.html". Tolerates missing/extra
  // slashes and an empty folder (root-level chapter).
  function joinPath(folder, file) {
    folder = String(folder || "").replace(/^\/+|\/+$/g, "");
    file = String(file || "").replace(/^\/+/, "");
    return folder ? folder + "/" + file : file;
  }

  // Copy a chapter and resolve its `file` against an optional folder prefix.
  function resolveChapter(ch, folder) {
    var out = {};
    for (var k in ch) { if (ch.hasOwnProperty(k)) out[k] = ch[k]; }
    out.file = joinPath(folder, ch.file);
    return out;
  }

  // A course may declare chapters two ways, freely mixed:
  //   1. "chapters": [...]                      (flat, files at course root)
  //   2. "sections": [{ title, folder, chapters:[...] }, ...]  (nested folders)
  // We flatten both into course.chapters (used by indexing, progress, search,
  // counts) AND keep course.sections (grouped, for rendering the course page).
  // Chapter files inside a section are relative to that section's folder.
  function normalizeCourse(course) {
    var flat = [];
    var sections = [];

    var rootChapters = (course.chapters || []).map(function (ch) {
      return resolveChapter(ch, "");
    });
    if (rootChapters.length) {
      sections.push({ title: null, folder: "", chapters: rootChapters });
      flat = flat.concat(rootChapters);
    }

    (course.sections || []).forEach(function (sec) {
      var chs = (sec.chapters || []).map(function (ch) {
        return resolveChapter(ch, sec.folder);
      });
      if (!chs.length) return;
      sections.push({ title: sec.title || null, folder: sec.folder || "", chapters: chs });
      flat = flat.concat(chs);
    });

    course.chapters = flat;
    course.sections = sections;
  }

  function chapterId(slug, file) { return slug + "/" + file; }
  function chapterHref(slug, file) {
    // Encode each path segment so folders/files with spaces (e.g. "M prashant")
    // resolve correctly, without corrupting the "/" separators.
    var path = (slug + "/" + file).split("/").map(encodeURIComponent).join("/");
    return COURSES_ROOT + path;
  }

  function indexChapters() {
    state.chapterIndex = {};
    state.courses.forEach(function (course) {
      course.chapters.forEach(function (ch, i) {
        var id = chapterId(course.slug, ch.file);
        state.chapterIndex[id] = {
          course: course, chapter: ch, index: i,
          href: chapterHref(course.slug, ch.file), id: id
        };
      });
    });
  }

  function computeProgress() {
    state.courses.forEach(function (course) {
      var files = course.chapters.map(function (c) { return c.file; });
      course.progress = window.Storage.courseProgress(course.slug, files);
    });
  }

  /* ---- small format helpers -------------------------------------------- */

  function relativeTime(ts) {
    if (!ts) return "";
    var now = Date.now();
    var diff = Math.max(0, now - ts);
    var min = 60 * 1000, hr = 60 * min, day = 24 * hr;
    if (diff < hr) return Math.max(1, Math.round(diff / min)) + " min ago";
    if (diff < day) return Math.round(diff / hr) + " hr ago";
    if (diff < 30 * day) return Math.round(diff / day) + " days ago";
    return "a while ago";
  }

  /* ---- routing ---------------------------------------------------------- */

  function currentCourseSlug() {
    var params = new URLSearchParams(window.location.search);
    return params.get("course");
  }

  function route() {
    var slug = currentCourseSlug();
    if (slug) renderCoursePage(slug);
    else renderHome();
  }

  /* ---- homepage --------------------------------------------------------- */

  var homeSectionIds = [
    "continue-section", "favorites-section", "courses-section"
  ];

  function renderHome() {
    removeCourseView();
    document.querySelector(".hero").classList.remove("is-hidden");
    homeSectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("is-hidden");
    });

    renderAllCourses();
    renderContinue();
    renderFavorites();

    // Hand the search module its data set (chapters + courses).
    if (window.Search) window.Search.init(state);
  }

  function renderAllCourses() {
    var grid = document.getElementById("courses-grid");
    var count = document.getElementById("courses-count");
    grid.setAttribute("aria-busy", "false");
    window.UI.clear(grid);

    if (!state.courses.length) {
      grid.appendChild(window.UI.emptyState("No courses found. Add one in courses/courses.json."));
      return;
    }
    state.courses.forEach(function (course) {
      grid.appendChild(window.UI.courseCard(course));
    });
    if (count) count.textContent = state.courses.length + " courses";
  }

  // Continue learning: most recently read chapters that aren't completed yet.
  function renderContinue() {
    var section = document.getElementById("continue-section");
    var grid = document.getElementById("continue-grid");
    window.UI.clear(grid);

    var recent = window.Storage.getRecent();
    var cards = 0;
    recent.forEach(function (entry) {
      var ref = state.chapterIndex[entry.id];
      if (!ref) return;                                   // chapter removed
      if (window.Storage.isCompleted(entry.id)) return;   // already done
      grid.appendChild(continueCard(ref, entry.at));
      cards++;
    });

    section.classList.toggle("is-hidden", cards === 0);
  }

  function continueCard(ref, at) {
    var html =
      '<article class="card card--interactive course-card">' +
        '<div class="card__body">' +
          '<div class="course-card__meta">' +
            '<span class="course-card__icon" aria-hidden="true" style="width:40px;height:40px;font-size:1.4rem">' +
              window.UI.esc(ref.course.icon || "📘") + "</span>" +
            "<div>" +
              '<div class="badge badge--tag">' + window.UI.esc(ref.course.title) + "</div>" +
            "</div>" +
          "</div>" +
          '<h3 class="course-card__title">' + window.UI.esc(ref.chapter.title) + "</h3>" +
          '<span class="progress__label">Last read ' + window.UI.esc(relativeTime(at)) + "</span>" +
          '<div class="course-card__footer">' +
            '<a class="btn btn--primary" href="' + ref.href + '">Resume →</a>' +
          "</div>" +
        "</div>" +
      "</article>";
    var node = window.UI.fromHTML(html);
    attachReadTracking(node, ref.id);
    return node;
  }

  function renderFavorites() {
    var section = document.getElementById("favorites-section");
    var grid = document.getElementById("favorites-grid");
    window.UI.clear(grid);

    var favs = window.Storage.getFavorites();
    var cards = 0;
    favs.forEach(function (id) {
      var ref = state.chapterIndex[id];
      if (!ref) return;
      grid.appendChild(continueCard(ref, window.Storage.getLastRead(id)));
      cards++;
    });
    section.classList.toggle("is-hidden", cards === 0);
  }

  /* ---- course page ------------------------------------------------------ */

  function renderCoursePage(slug) {
    var course = state.courses.filter(function (c) { return c.slug === slug; })[0];

    document.querySelector(".hero").classList.add("is-hidden");
    homeSectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add("is-hidden");
    });
    var searchSection = document.getElementById("search-results-section");
    if (searchSection) searchSection.classList.add("is-hidden");

    var view = ensureCourseView();
    window.UI.clear(view);

    if (!course) {
      view.appendChild(window.UI.emptyState("Course “" + slug + "” not found."));
      view.appendChild(window.UI.fromHTML('<p class="empty-state"><a href="index.html">← Back to home</a></p>'));
      document.title = "Not found — LearnShelf";
      return;
    }

    document.title = course.title + " — LearnShelf";

    var p = course.progress;
    var pct = Math.round((p.ratio || 0) * 100);

    var header = window.UI.fromHTML(
      '<header>' +
        '<nav class="breadcrumb" aria-label="Breadcrumb">' +
          '<a href="index.html">Home</a>' +
          '<span class="breadcrumb__sep" aria-hidden="true">/</span>' +
          "<span>" + window.UI.esc(course.title) + "</span>" +
        "</nav>" +
        '<div class="course-card__top" style="margin-bottom:var(--space-4)">' +
          '<div class="course-card__icon" aria-hidden="true">' + window.UI.esc(course.icon || "📘") + "</div>" +
          "<div>" +
            '<h1 class="hero__title" style="font-size:var(--text-2xl);text-align:left;margin:0">' +
              window.UI.esc(course.title) + "</h1>" +
            '<div class="course-card__meta" style="margin-top:var(--space-2)">' +
              window.UI.difficultyBadge(course.difficulty) +
              '<span class="badge">' + course.chapters.length + " chapters</span>" +
              '<span class="badge">⏱ ' + window.UI.esc(window.UI.totalReadingTime(course.chapters)) + "</span>" +
              '<span class="badge">' + pct + "% complete</span>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<p style="color:var(--color-text-muted);max-width:var(--measure)">' +
          window.UI.esc(course.description) + "</p>" +
      "</header>"
    );
    view.appendChild(header);

    if (!course.chapters.length) {
      view.appendChild(window.UI.emptyState("No chapters yet — check back soon."));
      return;
    }

    var list = document.createElement("div");
    list.className = "grid";
    list.style.gridTemplateColumns = "1fr";
    list.setAttribute("role", "list");

    // Named sections render as collapsible accordions; root (untitled) chapters
    // render inline as before. A plain flat course looks exactly as it used to.
    course.sections.forEach(function (sec) {
      if (!sec.chapters.length) return;

      // Where this section's rows go: an accordion body if it has a title,
      // otherwise straight into the flat list.
      var target = list;
      if (sec.title) {
        var group = window.UI.chapterGroup(sec.title, sec.chapters.length);
        list.appendChild(group.group);
        target = group.body;
      }

      // Numbering restarts at 1 within each section.
      sec.chapters.forEach(function (ch, i) {
        var id = chapterId(course.slug, ch.file);
        var row = window.UI.chapterRow({
          course: course, chapter: ch, index: i, chapterId: id,
          href: chapterHref(course.slug, ch.file),
          isFavorite: window.Storage.isFavorite(id),
          isCompleted: window.Storage.isCompleted(id),
          lastReadLabel: relativeTime(window.Storage.getLastRead(id)),
          onFavorite: function () { return window.Storage.toggleFavorite(id); },
          onCompleted: function (done) { window.Storage.setCompleted(id, done); }
        });
        attachReadTracking(row, id);
        target.appendChild(row);
      });
    });
    view.appendChild(list);
  }

  /* ---- course view container management --------------------------------- */

  function ensureCourseView() {
    var view = document.getElementById("course-view");
    if (!view) {
      view = document.createElement("section");
      view.id = "course-view";
      view.className = "container section";
      document.getElementById("main").appendChild(view);
    }
    view.classList.remove("is-hidden");
    return view;
  }

  function removeCourseView() {
    var view = document.getElementById("course-view");
    if (view) view.remove();
  }

  /* ---- read tracking ---------------------------------------------------- */

  // When any link inside `node` that opens a chapter is clicked, stamp it as
  // read so "Continue learning" and "Last read" stay accurate.
  function attachReadTracking(node, id) {
    node.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener("click", function () {
        window.Storage.recordRead(id);
      });
    });
  }

  /* ---- theme toggle ----------------------------------------------------- */

  function wireThemeToggle() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var sync = function () {
      btn.setAttribute("aria-pressed", window.Storage.getTheme() === "dark" ? "true" : "false");
    };
    sync();
    btn.addEventListener("click", function () {
      window.Storage.toggleTheme();
      sync();
    });
  }

  /* ---- boot ------------------------------------------------------------- */

  function boot() {
    wireThemeToggle();
    loadCourses()
      .then(route)
      .catch(function (err) {
        console.error("[LearnShelf] Failed to load courses:", err);
        var grid = document.getElementById("courses-grid");
        if (grid) {
          window.UI.clear(grid);
          grid.appendChild(window.UI.emptyState(
            "Couldn't load courses. If you opened this file directly, run a local server: python -m http.server"
          ));
        }
      });

    // React to back/forward between home and course views.
    window.addEventListener("popstate", route);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Expose for search.js to trigger re-render / navigation if needed.
  window.App = { state: state, route: route, relativeTime: relativeTime };
})(window, document);
