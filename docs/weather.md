# Weather Specification

## Supported Weather

Current weather states:

- Clear
- Cloudy
- Rain
- Snow

Snow is intended for winter use.

## Rain / Snow Intensity

Current scope uses one intensity level only.

Possible future enhancement:

- Light
- Normal

Do not implement intensity levels in the current scope unless explicitly requested.

## Visual Effects

Rain and snow effects must remain suitable for long-duration display.

If load is too high, it is acceptable to reduce:

- particle count
- update frequency
- animation frequency
- redraw frequency

Prefer lower power use when the visible quality difference is small.

## Expected Code Mapping

- CSS: `weather.css`
- JS: `weather.js`

If actual repository filenames differ, use `FILE_MAP.md`.
