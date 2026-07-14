/* ==========================================================================
   LearnShelf — ui.js
   Pure presentation. Functions here take plain data and return DOM nodes (or
   HTML strings). They do NOT fetch, route, or read localStorage directly —
   app.js passes in whatever state they need. Keeping render pure makes every
   view reusable (home cards, course page, search results).

   Exposes a global `UI` object.
   ========================================================================== */
(function (window, document) {
  "use strict";

  /* ---- helpers ---------------------------------------------------------- */

  // Escape untrusted text before putting it in innerHTML.
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Build an element from an HTML string (single root node).
  function fromHTML(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // "35 mins" | "1 hr" -> minutes as a number (best effort).
  function parseMinutes(duration) {
    if (!duration) return 0;
    var m = String(duration).match(/(\d+)\s*(h|hr|hour|m|min)?/i);
    if (!m) return 0;
    var n = parseInt(m[1], 10);
    var unit = (m[2] || "min").toLowerCase();
    return unit[0] === "h" ? n * 60 : n;
  }

  // Sum all chapter durations -> "1 hr 20 mins" style label.
  function totalReadingTime(chapters) {
    var total = (chapters || []).reduce(function (sum, c) {
      return sum + parseMinutes(c.duration);
    }, 0);
    if (!total) return "—";
    var h = Math.floor(total / 60);
    var m = total % 60;
    return (h ? h + " hr " : "") + (m ? m + " min" : (h ? "" : "0 min")).trim();
  }

  function difficultyClass(d) {
    var key = String(d || "").toLowerCase();
    if (key.indexOf("begin") === 0) return "beginner";
    if (key.indexOf("inter") === 0) return "intermediate";
    if (key.indexOf("adv") === 0) return "advanced";
    return "beginner";
  }

  /* ---- badges ----------------------------------------------------------- */

  function difficultyBadge(difficulty) {
    if (!difficulty) return "";
    var cls = difficultyClass(difficulty);
    return '<span class="badge badge--difficulty badge--' + cls + '">' +
      esc(difficulty) + "</span>";
  }

  function tagBadges(tags, limit) {
    if (!tags || !tags.length) return "";
    var shown = limit ? tags.slice(0, limit) : tags;
    return shown.map(function (t) {
      return '<span class="badge badge--tag">' + esc(t) + "</span>";
    }).join("");
  }

  /* ---- course card (homepage) ------------------------------------------ */

  /**
   * @param {Object} course  Course data with { slug, title, description, icon,
   *                          difficulty, chapters } plus computed { progress }.
   */
  function courseCard(course) {
    var count = (course.chapters || []).length;
    var p = course.progress || { done: 0, total: count, ratio: 0 };
    var pct = Math.round(p.ratio * 100);
    var fillClass = pct >= 100 ? " progress__fill--complete" : "";
    var href = "index.html?course=" + encodeURIComponent(course.slug);

    var progressHTML = count
      ? '<div class="progress">' +
          '<div class="progress__track">' +
            '<div class="progress__fill' + fillClass + '" style="width:' + pct + '%"></div>' +
          "</div>" +
          '<span class="progress__label">' + p.done + " / " + count + " chapters · " + pct + "%</span>" +
        "</div>"
      : '<span class="progress__label">No chapters yet</span>';

    var html =
      '<article class="card card--interactive course-card">' +
        '<div class="card__body">' +
          '<div class="course-card__top">' +
            '<div class="course-card__icon" aria-hidden="true">' + esc(course.icon || "📘") + "</div>" +
            "<div>" +
              '<h3 class="course-card__title">' + esc(course.title) + "</h3>" +
              '<div class="course-card__meta">' +
                difficultyBadge(course.difficulty) +
                '<span class="badge">' + count + (count === 1 ? " chapter" : " chapters") + "</span>" +
                '<span class="badge">⏱ ' + esc(totalReadingTime(course.chapters)) + "</span>" +
              "</div>" +
            "</div>" +
          "</div>" +
          '<p class="course-card__desc">' + esc(course.description) + "</p>" +
          progressHTML +
          '<div class="course-card__footer">' +
            '<a class="btn btn--primary" href="' + href + '">Open course</a>' +
          "</div>" +
        "</div>" +
      "</article>";

    var node = fromHTML(html);
    // Make the whole card clickable while keeping the button/link semantics.
    node.addEventListener("click", function (e) {
      if (e.target.closest("a")) return; // let real links work
      window.location.href = href;
    });
    return node;
  }

  /* ---- chapter row (course page) --------------------------------------- */

  /**
   * @param {Object} opts { course, chapter, index, chapterId, href,
   *                        isFavorite, isCompleted, lastReadLabel,
   *                        onFavorite, onCompleted }
   */
  function chapterRow(opts) {
    var ch = opts.chapter;
    var meta = [];
    if (ch.duration) meta.push("⏱ " + esc(ch.duration));
    if (opts.lastReadLabel) meta.push("Last read " + esc(opts.lastReadLabel));

    var html =
      '<article class="card chapter-card">' +
        '<div class="chapter-card__index">' + (opts.index + 1) + "</div>" +
        '<div class="chapter-card__main">' +
          '<a class="chapter-card__title" href="' + opts.href + '">' + esc(ch.title) + "</a>" +
          '<div class="chapter-card__meta">' +
            meta.join('<span aria-hidden="true">·</span>') +
            tagBadges(ch.tags, 3) +
          "</div>" +
        "</div>" +
        '<div class="chapter-card__actions">' +
          '<button class="icon-btn js-fav" type="button" aria-pressed="' + (opts.isFavorite ? "true" : "false") +
            '" aria-label="Toggle favorite" title="Favorite">★</button>' +
          '<a class="btn btn--ghost btn--sm" href="' + opts.href + '">Read</a>' +
          '<label class="check"><input type="checkbox" class="js-done"' + (opts.isCompleted ? " checked" : "") +
            ' /><span class="check__label">Done</span></label>' +
        "</div>" +
      "</article>";

    var node = fromHTML(html);

    node.querySelector(".js-fav").addEventListener("click", function (e) {
      var pressed = opts.onFavorite();
      e.currentTarget.setAttribute("aria-pressed", pressed ? "true" : "false");
    });
    node.querySelector(".js-done").addEventListener("change", function (e) {
      opts.onCompleted(e.currentTarget.checked);
    });

    return node;
  }

  /* ---- generic helpers exposed for app.js ------------------------------ */

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function emptyState(message) {
    return fromHTML('<p class="empty-state">' + esc(message) + "</p>");
  }

  /* ---- public API ------------------------------------------------------- */

  window.UI = {
    esc: esc,
    fromHTML: fromHTML,
    parseMinutes: parseMinutes,
    totalReadingTime: totalReadingTime,
    difficultyBadge: difficultyBadge,
    tagBadges: tagBadges,
    courseCard: courseCard,
    chapterRow: chapterRow,
    clear: clear,
    emptyState: emptyState
  };
})(window, document);
