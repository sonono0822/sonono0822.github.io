
"use strict";
// Keep decorative lifecycle handling independent of the clock and palette logic.
(() => {
  let scenePaused = document.hidden;
  let syncStars = () => {};
  function pause(hidden) {
    scenePaused = hidden;
    document.documentElement.setAttribute("data-scene-paused", String(hidden));
    syncStars();
  }
  document.addEventListener("visibilitychange", () => pause(document.hidden));
  window.addEventListener("pagehide", () => pause(true));
  window.addEventListener("pageshow", () => pause(document.hidden));
  const stars = [...document.querySelectorAll(".sky-detail-stars i")];
  const world = document.querySelector("#world");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const active = new Map();
  const recent = [];
  function enabled() {
    return !reducedMotion.matches && ["evening", "night", "deepNight"].includes(world?.getAttribute("data-time-scene"));
  }
  function startStar() {
    if (scenePaused || !enabled()) return;
    const candidates = stars.filter(star => !active.has(star) && !recent.includes(star));
    if (!candidates.length) return;
    const star = candidates[Math.floor(Math.random() * candidates.length)];
    if (typeof star.animate !== "function") return;
    recent.push(star);
    if (recent.length > 3) recent.shift();
    // A quiet hold, a short soft peak, then a return to the base appearance.
    const animation = star.animate([
      {opacity:.28, backgroundColor:"#f9e5be", offset:0},
      {opacity:.28, backgroundColor:"#f9e5be", offset:.5},
      {opacity:.65, backgroundColor:"#fff9e8", offset:.68},
      {opacity:1, backgroundColor:"#fff9e8", offset:.78},
      {opacity:.28, backgroundColor:"#f9e5be", offset:.95},
      {opacity:.28, backgroundColor:"#f9e5be", offset:1}
    ], {duration:14000 + Math.random() * 12000, easing:"ease-in-out"});
    active.set(star, animation);
    animation.finished.then(() => {
      if (active.get(star) !== animation) return;
      active.delete(star);
      syncStars();
    }, () => {}); // Cancellation on daytime/reduced motion is expected.
  }
  syncStars = () => {
    if (!enabled()) {
      for (const animation of active.values()) animation.cancel();
      active.clear();
      return;
    }
    for (const animation of active.values()) {
      if (scenePaused) animation.pause();
      else if (animation.playState === "paused") animation.play();
    }
    if (!scenePaused) {
      for (let slots = 2 - active.size; slots > 0; slots--) startStar();
    }
  };
  reducedMotion.addEventListener("change", syncStars);
  new MutationObserver(syncStars).observe(world, {attributes:true, attributeFilter:["data-time-scene"]});
  pause(document.hidden);
})();
