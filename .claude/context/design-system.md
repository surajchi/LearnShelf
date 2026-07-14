# LearnShelf Design System

The single source of truth for visual design. Every CSS rule references a token
defined here. Never hardcode a color, radius, or spacing value in a component —
add or reuse a token instead.

Inspiration: Microsoft Learn, GitHub Docs, roadmap.sh, Linux Foundation, MDN.
Character: clean, minimal, generous whitespace, rounded cards, soft shadows,
professional typography. **No** glassmorphism, neon, or gratuitous gradients.

All tokens are implemented as CSS custom properties on `:root` in `css/main.css`,
with dark-mode overrides under `[data-theme="dark"]`.

---

## 1. Color

Semantic tokens (what a color *means*) are preferred over raw values so dark mode
is a single override layer.

### Brand / accent
| Token | Light | Purpose |
|---|---|---|
| `--color-accent` | `#0969da` | Primary blue (links, buttons, active state) |
| `--color-accent-hover` | `#0550ae` | Hover/darker accent |
| `--color-accent-soft` | `#ddf4ff` | Tinted accent background (badges, highlights) |
| `--color-roadmap` | `#f2b705` | Yellow roadmap accent (progress, highlights) |

### Surfaces & text (light)
| Token | Value | Purpose |
|---|---|---|
| `--color-bg` | `#ffffff` | Page background |
| `--color-surface` | `#ffffff` | Card background |
| `--color-surface-alt` | `#f6f8fa` | Subtle raised/inset background |
| `--color-border` | `#d0d7de` | Card + divider borders |
| `--color-text` | `#1f2328` | Primary text |
| `--color-text-muted` | `#656d76` | Secondary text, metadata |
| `--color-text-subtle` | `#8c959f` | Tertiary text, placeholders |

### Feedback
| Token | Value | Purpose |
|---|---|---|
| `--color-success` | `#1a7f37` | Completed state |
| `--color-warning` | `#9a6700` | Caution |
| `--color-danger` | `#cf222e` | Errors / destructive |

### Difficulty badges
| Token | Value |
|---|---|
| `--color-beginner` | `#1a7f37` |
| `--color-intermediate` | `#9a6700` |
| `--color-advanced` | `#cf222e` |

### Dark mode overrides (`[data-theme="dark"]`)
| Token | Dark value |
|---|---|
| `--color-bg` | `#0d1117` |
| `--color-surface` | `#161b22` |
| `--color-surface-alt` | `#21262d` |
| `--color-border` | `#30363d` |
| `--color-text` | `#e6edf3` |
| `--color-text-muted` | `#9198a1` |
| `--color-text-subtle` | `#6e7681` |
| `--color-accent` | `#4493f8` |
| `--color-accent-hover` | `#6cb0ff` |
| `--color-accent-soft` | `#0c2d6b` |

Contrast target: body text ≥ 7:1 (AAA), UI text ≥ 4.5:1 (AA) in both themes.

---

## 2. Typography

System font stack — zero network requests, native feel, fast first paint.

```
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
--font-mono: "SF Mono", "Cascadia Code", "Consolas", "Liberation Mono", monospace;
```

Type scale (1.25 ratio, 16px base):
| Token | Size | Use |
|---|---|---|
| `--text-xs` | 0.75rem (12px) | Badges, fine print |
| `--text-sm` | 0.875rem (14px) | Metadata, secondary |
| `--text-base` | 1rem (16px) | Body |
| `--text-lg` | 1.25rem (20px) | Card titles |
| `--text-xl` | 1.5rem (24px) | Section headings |
| `--text-2xl` | 2rem (32px) | Page headings |
| `--text-3xl` | 2.5rem (40px) | Hero title |

| Token | Value |
|---|---|
| `--leading-tight` | 1.25 |
| `--leading-normal` | 1.5 |
| `--leading-relaxed` | 1.7 (reading content) |
| `--weight-normal` | 400 |
| `--weight-medium` | 500 |
| `--weight-semibold` | 600 |
| `--weight-bold` | 700 |

Reading measure for chapter content: `--measure: 70ch` (max line length).

---

## 3. Spacing

4px base scale — use tokens for all margin/padding/gap.
| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |

Layout: `--container-max: 1120px`, `--container-pad: var(--space-5)`.

---

## 4. Radii, shadows, borders

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Badges, inputs |
| `--radius-md` | 10px | Buttons |
| `--radius-lg` | 14px | Cards |
| `--radius-full` | 999px | Pills, avatars |

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(31,35,40,.06)` |
| `--shadow-md` | `0 3px 8px rgba(31,35,40,.10)` |
| `--shadow-lg` | `0 8px 24px rgba(31,35,40,.14)` |
| `--border-width` | 1px |

Dark mode softens shadows (use `rgba(1,4,9,.4)` family).

---

## 5. Motion

Subtle only. Respect `prefers-reduced-motion`.
| Token | Value |
|---|---|
| `--transition-fast` | 120ms ease |
| `--transition-base` | 180ms ease |
| `--ease-out` | cubic-bezier(.2,.8,.2,1) |

Card hover: translateY(-2px) + shadow-md. Nothing flashy.

---

## 6. Breakpoints

Mobile-first. Min-width queries.
| Token / name | Value |
|---|---|
| `--bp-sm` | 480px |
| `--bp-md` | 768px |
| `--bp-lg` | 1024px |

Course grid: 1 col < 480px, 2 cols ≥ 480px, 3 cols ≥ 1024px.

---

## 7. Z-index scale

| Token | Value |
|---|---|
| `--z-base` | 0 |
| `--z-sticky` | 100 (sticky header) |
| `--z-overlay` | 200 |
| `--z-modal` | 300 |

---

## 8. Component tokens (composed from primitives)

Defined for reuse in `components.css`:
- **Card**: `--color-surface` bg, `--border-width solid --color-border`, `--radius-lg`, `--shadow-sm`, hover → `--shadow-md`.
- **Button (primary)**: `--color-accent` bg, white text, `--radius-md`.
- **Button (ghost)**: transparent bg, `--color-border`, `--color-text`.
- **Badge**: `--color-surface-alt` bg, `--text-xs`, `--radius-full`, `--color-text-muted`.
- **Progress bar**: track `--color-surface-alt`, fill `--color-accent` (or `--color-roadmap`), `--radius-full`, height 6px.
