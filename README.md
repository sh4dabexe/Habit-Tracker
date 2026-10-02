# Habit Tracker

A minimal, light-theme, edge-focused Habit Tracker with checkpoints, streaks, and history. Built strictly with vanilla **HTML5**, **CSS3**, and **JavaScript (ES6+)**.

## Features

- **Daily Checkpoints System**: Break any habit down into discrete micro-actions (e.g. 10 pages, 20 pages, 30 pages) with independent completion states and dynamic progress percentages.
- **Minimal Edge Design Aesthetic**: Sharp rectangular containers, thin borders (`#D9D9D4`), generous whitespace, no gratuitous glassmorphism, gradients, or heavy shadows.
- **Daily Overview**: Real-time stats showing today's habits completed, total checkpoints ticked, and active streak.
- **Streak Calculation**: Dynamically calculated consecutive completed days backwards from current date.
- **Consistency Log (Past 7 Days)**: Clear log showing daily completion rates, progress bars, and status tags (`PERFECT`, `PARTIAL`, `INCOMPLETE`).
- **Weekly Performance Summary**: Total habits completed, weekly completion rate, best streak, and count of perfect days.
- **Categories**: Filter habits by `STUDY`, `HEALTH`, `WORK`, `PERSONAL`, or view `ALL`.
- **Daily Note**: Quick inline reflection bar for capturing daily insights.
- **Data Persistence**: Zero backend required; all data and notes persist reliably in browser `localStorage`. Includes JSON Export & Import backups.
- **Accessible & Responsive**: Fully keyboard navigable (`N` to create habit, `Esc` to close modal, `Space`/`Enter` on checkboxes), semantic HTML, responsive from 390px mobile screens to large desktop monitors.

## Getting Started

No build step or dependencies required. Simply open `index.html` in any modern web browser:

```bash
# Open directly in default browser on Windows
start index.html
```

Or serve via any static HTTP server:

```bash
npx serve .
# or
python -m http.server 3000
```

## Keyboard Shortcuts

- `N`: Open New Habit dialog
- `Esc`: Close open modal / dialog
- `Space` / `Enter`: Toggle checkpoint when focused
- `?`: Jump to shortcut guide

## Tech Stack

- **HTML5**: Semantic tags (`<header>`, `<main>`, `<section>`, `<dialog>`, `<article>`, `<button>`)
- **CSS3**: CSS Custom Properties (Design Tokens), Flexbox, CSS Grid
- **JavaScript**: Pure Vanilla JS, native `localStorage`, FileReader API for backups
