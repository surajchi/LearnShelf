<h1 align="center">📚 LearnShelf</h1>

<p align="center">
  A personal, offline-friendly documentation platform for learning Computer Science
  from YouTube transcripts — no backend, no database, no build step. Just Git.
</p>

<p align="center">
  <em>Inspired by Microsoft Learn · GitHub Docs · roadmap.sh · MDN</em>
</p>

---

## What is this?

LearnShelf turns YouTube playlists into a clean, searchable documentation site.
The workflow is deliberately boring and durable:

```
YouTube video → transcript → Claude → HTML chapter → drop into a course folder
             → update course.json → git push → GitHub Pages updates automatically
```

There is no server, no CMS, and no login. Content lives in Git; your reading
state (dark mode, progress, favorites) lives in your browser's `localStorage`.

## Tech

Pure **HTML5 + CSS3 + vanilla JavaScript**. No frameworks, no npm, no bundler.
Everything is data-driven — the homepage, course pages, progress, and search all
render at runtime from JSON manifests.

## Project structure

```
LearnShelf/
├── index.html            # Single shell: home + course views (via ?course=)
├── src/
│   └── styles.css        # Tailwind v4 source (tokens, components, dark mode)
├── css/
│   └── main.css          # Compiled Tailwind output (committed; `npm run build:css`)
├── js/
│   ├── storage.js        # localStorage state (theme, progress, favorites…)
│   ├── search.js         # Instant client-side search
│   ├── ui.js             # Pure DOM render functions
│   └── app.js            # Orchestrator: fetch data, route, render
├── courses/
│   ├── courses.json      # Manifest — lists which course folders exist
│   └── <course>/
│       ├── course.json   # Course metadata + chapter list
│       └── *.html        # Chapter documents
├── assets/               # icons/, logos/
└── .claude/              # Architecture, design system, prompts (project spec)
```

## Running locally

Because the app fetches JSON, browsers block it over `file://`. Serve the folder
with any static server:

```bash
# Python 3 (built in on most systems)
python -m http.server 8000
# then open http://localhost:8000
```

The deployed site on GitHub Pages has no such restriction.

## Adding content

**New chapter in an existing course:**
1. Add `courses/<course>/<chapter>.html`.
2. Append an entry to that course's `course.json` `chapters[]`.
3. `git push`. Done — cards, progress, and search update automatically.

**New course:**
1. Create `courses/<course>/` with a `course.json` and at least one chapter.
2. Add the folder name to `courses/courses.json`.
3. `git push`.

## Deploy (GitHub Pages)

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch.**
3. Branch: `main`, folder: `/ (root)`. Save.
4. Open `https://<user>.github.io/<repo>/`.

A `.nojekyll` file is included so Pages serves every folder as-is.

## Roadmap

- **V1** — Homepage, search, course pages, reading progress, dark mode, favorites _(in progress)_
- **V2** — Bookmarks, notes, AI search, quiz, flashcards
- **V3** — PWA, offline cache, mind maps

## License

[MIT](LICENSE) © 2026 Suraj Chinkate
