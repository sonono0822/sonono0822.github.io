# Background / Time-of-Day Specification

## Time-of-Day System

Use six background periods:

1. Morning
2. Late morning
3. Daytime
4. Evening
5. Night
6. Late night

The basic system is implemented, but visual refinement should continue.

## Improvement Areas

Examples:

- sky
- distant scenery
- city details
- building lights
- street lights
- river/reflections
- stars
- moon
- indoor lighting

Do not change unrelated clock/calendar UI during background work.

## Fade-In

Background fade-in was tested previously and rejected.

Current status: **Not adopted**

Do not reintroduce it unless the project direction explicitly changes.

## Window

The window is assumed to be closed.

Avoid effects that imply:

- an open window
- wind entering the room
- curtains or indoor objects moving strongly from outdoor wind

## Bridge

The bridge is optional.

It is lower priority than the overall balance of:

- city
- river
- tower
- surrounding scenery

Do not treat the bridge as mandatory.

## Expected Code Mapping

- CSS: `background.css`
- JS: `background.js`

If actual repository filenames differ, use `FILE_MAP.md`.
