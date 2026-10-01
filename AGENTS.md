# Pixel Desk Clock - AGENTS.md

## Purpose

Keep every Codex task small, safe, and token-efficient.

Read this file on every task.
Read `DEVELOPMENT_STATUS.md` for current project state.
Read only the detailed spec file(s) directly related to the current task.

---

## Core Rules

- One task = one theme.
- Make the smallest change necessary.
- Do not modify unrelated working functionality.
- Do not perform unrelated refactoring, cleanup, renaming, or feature additions.
- Preserve the current design direction and application structure.
- Prioritize regression prevention, stability, and long-term display performance.
- Do not reconsider already-decided specifications unless the current task requires it.

---

## Investigation

- Start with only the files directly related to the task.
- Expand to directly related files only when necessary.
- Do not scan the whole repository without a specific reason.
- Do not inspect Git history unless needed to identify a regression or restore known-good behavior.
- Do not repeatedly read files already understood unless their contents may have changed.

Use `FILE_MAP.md` to identify the expected feature-to-file relationship.

---

## Implementation

- Prefer existing code over new abstractions.
- Do not add features that were not requested.
- Do not rewrite working logic just to make it cleaner.
- Avoid unnecessary timers, redraws, particles, animations, and background processing.
- When visual quality differences are small, prefer the lighter implementation.

---

## Verification

- Verify the changed area and directly affected functionality.
- Full-project testing is unnecessary unless shared/core logic was changed.
- For visual tasks, verify the relevant visual state.
- For text-only or data-only changes, do not perform unnecessary browser/UI checks.

---

## Communication

Keep planning and completion reports short.

Normal completion report:

1. Changed files
2. What changed
3. Verification result

Do not output full files, large diffs, or unrelated improvement suggestions unless requested.

---

## Detailed Specs

Read only the relevant spec(s):

- Clock: `docs/clock.md`
- Calendar: `docs/calendar.md`
- Layout/UI: `docs/layout.md`
- Background/time of day: `docs/background.md`
- Weather: `docs/weather.md`
- Seasons: `docs/season.md`
- Character/dialogue: `docs/dialogue.md`
- Performance/power saving: `docs/performance.md`

---

## Status Updates

Update `DEVELOPMENT_STATUS.md` only when the actual project state meaningfully changes, such as:

- feature completion
- feature addition/removal
- scope change
- priority change
- major design decision
- significant known issue added/resolved

Do not update it for small visual tweaks, wording changes, tiny CSS adjustments, or routine bug fixes.
