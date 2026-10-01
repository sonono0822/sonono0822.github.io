# Performance / Power Saving Specification

## Priority

Pixel Desk Clock is intended for long-duration display.

Performance and power efficiency are quality requirements, not optional cleanup.

## Watch For

- unnecessary per-frame processing
- excessive timers
- high-frequency timers
- unnecessary DOM updates
- excessive particle counts
- unnecessary redraws
- background-tab processing
- memory growth
- device heat
- battery consumption

## Decision Rule

When the visual difference is small, prefer the lighter implementation.

It is acceptable to reduce visual effects when doing so meaningfully improves:

- CPU load
- GPU load
- battery consumption
- device temperature
- long-duration stability

## Animation

Keep always-running animation modest.

Do not add high-load visual effects for small cosmetic gains.

## Expected Code Mapping

- JS: `performance.js` if a dedicated module exists

Performance logic may also be distributed across feature files.
Do not create a new `performance.js` solely to satisfy this naming convention.
