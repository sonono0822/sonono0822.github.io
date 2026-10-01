# Character / Dialogue Specification

## Dialogue Conditions

Dialogue branching uses only:

**Time of day × Weekday / Weekend-Holiday**

Do not connect dialogue to:

- weather
- season

Japanese public holidays belong to the weekend/holiday group.

## Time Groups

- Morning
- Late morning
- Daytime
- Evening
- Night
- Late night

Each group has:

- Weekday
- Weekend / Holiday

## Candidate Count

Aim for roughly 4–6 dialogue lines per group.

## Content Direction

Weekdays may include work-oriented wording.

Weekends and Japanese public holidays should avoid assuming the user is working.

Dialogue should not contain weather-specific or season-specific wording.

## Logic

The dialogue logic is considered implemented.

If only wording is being changed, do not modify:

- random selection
- time checks
- weekday/holiday checks
- update timing

Only modify the dialogue definitions unless a logic defect is confirmed.

## Expected Code Mapping

- CSS: `dialogue.css`
- JS: `dialogue.js`

If actual repository filenames differ, use `FILE_MAP.md`.
