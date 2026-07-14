```markdown
<h1 align="center">
  <img src="assets/icons/bookshelf.svg" alt="LearnShelf logo" width="48" height="48" />
  <br/>
  LearnShelf
</h1>

<p align="center">
  <a href="https://github.com/Surajchi/LearnShelf/deployments/activity_log?environment=github-pages">
    <img alt="GitHub Pages" src="https://img.shields.io/badge/GitHub%20Pages-live-brightgreen?style=flat-square&logo=github" />
  </a>
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" />
  </a>
  <img alt="Maintenance" src="https://img.shields.io/maintenance/yes/2026?style=flat-square" />
  <img alt="Made with love" src="https://img.shields.io/badge/made%20with-%E2%9D%A4-red?style=flat-square" />
</p>

<p align="center">
  <strong>A personal, offline-friendly documentation platform for learning Computer Science<br/>from YouTube transcripts — no backend, no database, no build step. Just Git.</strong>
</p>

<p align="center">
  <em>Inspired by Microsoft Learn · GitHub Docs · roadmap.sh · MDN</em>
</p>

<p align="center">
  <a href="https://surajchi.github.io/LearnShelf/">
    <img src="assets/demo.gif" alt="LearnShelf demo" width="720" style="max-width:100%; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
  </a>
</p>

---

## 📖 Table of Contents

- [What is LearnShelf?](#what-is-learnshelf)
- [Why LearnShelf?](#why-learnshelf)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Adding Content](#adding-content)
- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Roadmap](#roadmap)
- [License](#license)

---

## 📚 What is LearnShelf?

LearnShelf turns YouTube playlists into a clean, searchable documentation site.  
The workflow is deliberately boring and durable — no heavy frameworks, no CMS, no login walls:

```
YouTube video → transcript → Claude → HTML chapter → drop into a course folder  
             → update course.json → git push → GitHub Pages updates automatically
```

All course content lives in plain HTML files inside Git.  
Your reading state (dark mode, progress, favorites) is stored privately in your browser’s `localStorage`.  
Once loaded, the entire site works **offline** — perfect for learning on the go.

📌 **[Live Demo →](https://surajchi.github.io/LearnShelf/)**

---

## 🤔 Why LearnShelf?

| Traditional course sites | LearnShelf |
|--------------------------|------------|
| Need a backend & database | Zero backend – static JSON + HTML |
| Require authentication | No login – progress stored locally |
| Bloated JavaScript bundles | Vanilla JS, no npm, no build step |
| Hard to update content | Add a file → `git push` → live instantly |
| Locked into a platform | Own your content: Git is your CMS |

LearnShelf is built for **long-term ownership** and **minimal maintenance**.  
If GitHub Pages disappears tomorrow, your course material remains usable as flat files.

---

## ⚙️ How It Works

1. **Get a transcript** of a YouTube lecture (manual or automated).  
2. **Convert it into an HTML chapter** using a structured prompt in Claude (or any LLM).  
3. **Place the `.html` file** inside `courses/<course>/`.  
4. **Update `course.json`** to include the new chapter title, file name, and estimated reading time.  
5. **Push to Git** — the homepage, search index, progress tracking, and course cards all update automatically because everything is data‑driven from JSON manifests.  

No build step. No database migration. Just plain files.

---

## 🛠️ Tech Stack

- **Pure HTML5 + CSS3 + vanilla JavaScript** – no frameworks, no bundler  
- **JSON manifests** – drive home page, course pages, progress, and search  
- **localStorage** – stores user preferences (theme, reading progress, favorites)  
- **GitHub Pages** – free, fast, and serverless hosting  
- **`.nojekyll`** – ensures GitHub Pages serves all files as-is (no Jekyll processing)

---

## 📁 Project Structure

```
LearnShelf/
├── index.html                # Single shell: home + course views (via ?course=)
├── css/
│   ├── main.css              # Design tokens, layout, typography, dark mode
│   └── components.css        # Cards, buttons, badges, search, progress bars
├── js/
│   ├── storage.js            # localStorage state (theme, progress, favorites…)
│   ├── search.js             # Instant client‑side search
│   ├── ui.js                 # Pure DOM render functions
│   └── app.js                # Orchestrator: fetch data, route, render
├── courses/
│   ├── courses.json          # Manifest — lists which course folders exist
│   └── <course>/
│       ├── course.json       # Course metadata + chapter list
│       └── *.html            # Chapter documents
├── assets/                   # icons/, logos/, demo images
└── .claude/                  # Architecture, design system, prompts (project spec)
```

---

## 🚀 Getting Started

### Prerequisites

- Any modern web browser  
- Git (to push updates)  
- A static file server for local development (browsers block `fetch` over `file://`)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Surajchi/LearnShelf.git
cd LearnShelf

# Serve with Python 3 (built‑in on most systems)
python -m http.server 8000

# Now open http://localhost:8000
```

The live GitHub Pages site has no such restriction and can be accessed directly.

---

## ✍️ Adding Content

### New chapter in an existing course

1. Add `courses/<course>/<chapter>.html` — a self‑contained HTML document (no `<html>`/`<body>` tags needed, just the content).  
2. In `courses/<course>/course.json`, append an entry to the `chapters[]` array:

```json
{
  "id": "chapter-slug",
  "title": "Chapter Title",
  "file": "chapter-slug.html",
  "estReadMinutes": 12
}
```

3. Commit and push. The sidebar, progress, and search index update automatically.

### New course

1. Create a folder `courses/<new-course>/`.  
2. Add a `course.json` with metadata (`title`, `description`, `icon`, `chapters[]`).  
3. Place at least one chapter `.html` file inside.  
4. Add the folder name to `courses/courses.json`:

```json
["existing-course", "new-course"]
```

5. `git push`. Done.

---

## 🌐 Deploy to GitHub Pages

1. Push this repository to GitHub.  
2. Go to **Settings → Pages → Build and deployment**.  
3. Select **Source: Deploy from a branch**.  
4. Choose branch `main`, folder `/ (root)`. Click **Save**.  
5. Your site will be live at `https://<user>.github.io/<repo>/` within a minute.  

> A `.nojekyll` file is included so GitHub Pages serves every folder as raw static files — no Jekyll processing.

**Live instance:** [https://surajchi.github.io/LearnShelf/](https://surajchi.github.io/LearnShelf/)

---

## 🗺️ Roadmap

- **V1** – Homepage, search, course pages, reading progress, dark mode, favorites *(current)*  
- **V2** – Bookmarks, personal notes, AI‑powered semantic search, quizzes, flashcards  
- **V3** – Progressive Web App (PWA), full offline caching, mind‑map generation

Ideas and contributions are welcome — open an issue to discuss.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).  
© 2026 Suraj Chinkate

---

<p align="center">
  <sub>Built with ❤️ for lifelong learners. If you find this useful, give it a ⭐ on GitHub!</sub>
</p>
```