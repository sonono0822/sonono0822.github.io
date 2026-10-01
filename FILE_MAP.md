# Pixel Desk Clock - File Map

This file is the human-readable map between features, detailed specs, CSS, and JavaScript.

The names below are the **recommended canonical names**.
If the repository currently uses different names, do not rename files automatically just to match this document.
Instead, update this map with the actual names, or rename only as a separate explicit refactoring task.

| Feature | Detailed spec | Recommended CSS | Recommended JS |
|---|---|---|---|
| Clock | `docs/clock.md` | `clock.css` | `clock.js` |
| Calendar | `docs/calendar.md` | `calendar.css` | `calendar.js` |
| Main layout / UI | `docs/layout.md` | `layout.css` | `layout.js` |
| Background / time of day | `docs/background.md` | `background.css` | `background.js` |
| Weather | `docs/weather.md` | `weather.css` | `weather.js` |
| Seasons | `docs/season.md` | `season.css` | `season.js` |
| Character / dialogue | `docs/dialogue.md` | `dialogue.css` | `dialogue.js` |
| Performance / power saving | `docs/performance.md` | — | `performance.js` |

## Usage

When asking Codex to work on a feature, use the same feature name across the prompt, spec, CSS, and JS.

Example:

> Read `AGENTS.md`, `DEVELOPMENT_STATUS.md`, `FILE_MAP.md`, and `docs/weather.md`.
> Work only on weather.
> Focus on `weather.js` and `weather.css`.

If the actual repository uses another filename, replace the example names with the actual names from this map.

## Recommendation

Once the repository structure is stable, keep this table accurate.
That makes it possible to specify the target files without asking Codex to rediscover the architecture every time.
