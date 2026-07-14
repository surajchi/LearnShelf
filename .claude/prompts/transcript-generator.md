# Transcript → LearnShelf Chapter — reusable prompt

Paste this whole file to Claude, then paste the YouTube transcript under it.
Claude returns ONE complete chapter `.html` file ready to drop into a course
folder.

---

## The prompt

> You are turning a YouTube video transcript into a single, beautiful,
> self-contained LearnShelf documentation chapter.
>
> **Output rules**
> - Return exactly one complete HTML file. No commentary before or after.
> - Use the chapter template below verbatim; fill only the marked slots.
> - Content must be original documentation, not a transcript dump: reorganize
>   into clear sections with headings, short paragraphs, lists, and code blocks.
> - Keep it accurate to the transcript. Do not invent commands or facts.
> - Use semantic HTML inside `<article class="reading">` — `<h2>`, `<h3>`,
>   `<p>`, `<ul>`, `<pre><code>`. No inline styles, no external assets.
> - Start with a one-paragraph intro, end with a short "Summary" list.
> - Keep the paths as written (`../../css/…`, `../../js/…`) — chapters live two
>   levels deep at `courses/<course>/<file>.html`.
>
> **After the file**, also give me the JSON entry to paste into the course's
> `course.json` `chapters[]` array (title, file, duration estimate, tags).

---

## Chapter HTML template

Fill the `⟨…⟩` slots. Leave everything else exactly as-is.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>⟨Chapter Title⟩ — LearnShelf</title>
  <meta name="description" content="⟨One-line summary.⟩" />
  <meta name="color-scheme" content="light dark" />

  <link rel="stylesheet" href="../../css/main.css" />
  <link rel="stylesheet" href="../../css/components.css" />

  <script>
    (function () {
      try {
        var t = localStorage.getItem("learnshelf:theme")
          || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", t);
      } catch (e) {}
    })();
  </script>
</head>

<body>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="brand" href="../../index.html" aria-label="LearnShelf home">
        <span class="brand__mark" aria-hidden="true">📚</span>
        <span class="brand__name">LearnShelf</span>
      </a>
    </div>
  </header>

  <main id="main" class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="../../index.html">Home</a>
      <span class="breadcrumb__sep" aria-hidden="true">/</span>
      <a href="../../index.html?course=⟨course-slug⟩">⟨Course Name⟩</a>
      <span class="breadcrumb__sep" aria-hidden="true">/</span>
      <span>⟨Chapter Title⟩</span>
    </nav>

    <article class="reading">
      <h1>⟨Chapter Title⟩</h1>

      ⟨CONTENT: intro paragraph, then sections with h2/h3, lists, and
       <pre><code>…</code></pre> blocks, ending with a "Summary" list.⟩
    </article>
  </main>

  <footer class="site-footer">
    <div class="container site-footer__inner">
      <span>📚 LearnShelf</span>
      <a href="../../index.html?course=⟨course-slug⟩">← Back to ⟨Course Name⟩</a>
    </div>
  </footer>

  <!-- Enables read tracking, scroll restore, favorite & mark-complete -->
  <script src="../../js/storage.js" defer></script>
  <script src="../../js/reader.js" defer></script>
</body>
</html>
```

---

## course.json entry template

```json
{
  "title": "⟨Chapter Title⟩",
  "file": "⟨file-name⟩.html",
  "duration": "⟨NN⟩ mins",
  "tags": ["⟨tag⟩", "⟨tag⟩"]
}
```

---

## After generating

1. Save the HTML as `courses/<course>/<file-name>.html`
   (lowercase, hyphens, no spaces).
2. Add the JSON entry to that course's `course.json` `chapters[]`.
3. New course only: add the slug to `courses/courses.json`.
4. `git add . && git commit -m "Add ⟨chapter⟩" && git push`.

Homepage, course page, progress, and search update automatically.
See `HOW-TO-ADD-CHAPTER.txt` for the short version.
