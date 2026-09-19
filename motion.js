
"use strict";
// Keep decorative lifecycle handling independent of the clock and palette logic.
(() => {
  function pause(hidden) {
    document.documentElement.setAttribute("data-scene-paused", String(hidden));
  }
  document.addEventListener("visibilitychange", () => pause(document.hidden));
  window.addEventListener("pagehide", () => pause(true));
  window.addEventListener("pageshow", () => pause(document.hidden));
  pause(document.hidden);
})();
