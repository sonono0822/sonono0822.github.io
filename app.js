"use strict";

/** Pixel Desk Clock — connected pixel clock renderer, v5.8.0. */

const CONFIG = Object.freeze({
  swipeThreshold: 35,
  wheelCooldown: 450
});

// Seven-by-nine glyphs: connected strokes and stepped corners, no font dependency.
const DIGITS = Object.freeze({
  "0":["0111110","1111111","1100011","1100011","1100011","1100011","1100011","1111111","0111110"],
  "1":["0001100","0011100","0111100","0001100","0001100","0001100","0001100","0111110","0111110"],
  "2":["0111110","1111111","1100011","0000011","0001110","0011100","0110000","1111111","1111111"],
  "3":["0111110","1111111","0000011","0000011","0011110","0000011","0000011","1111111","0111110"],
  "4":["0000110","0001110","0011110","0110110","1100110","1111111","1111111","0000110","0000110"],
  "5":["1111111","1111111","1100000","1100000","1111110","0000011","0000011","1111111","0111110"],
  "6":["0011110","0111110","1100000","1100000","1111110","1100011","1100011","1111111","0111110"],
  "7":["1111111","1111111","0000011","0000110","0001100","0011000","0011000","0110000","0110000"],
  "8":["0111110","1100011","1100011","1111111","0111110","1100011","1100011","1111111","0111110"],
  "9":["0111110","1111111","1100011","1100011","0111111","0000011","0000011","0111110","0111100"]
});


const $ = (selector) => document.querySelector(selector);

const elements = {
  world: $("#world"),
  clock: $("#pixelClock"),
  date: $("#date"),
  greeting: $("#greeting"),
  bubble: $("#bubble"),
  month: $("#month"),
  days: $("#days"),
  panel: $("#calendarPanel"),
  prev: $("#prev"),
  next: $("#next"),
  today: $("#today")
};

const initialNow = new Date();
const state = {
  view: new Date(initialNow.getFullYear(), initialNow.getMonth(), 1),
  lastTime: "",
  touchY: null,
  lastWheel: 0
};

function assertRequiredElements() {
  const missing = Object.entries(elements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Required DOM elements are missing: ${missing.join(", ")}`);
  }
}

function renderClock(value) {
  if (state.lastTime === value) return;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 35 9");
  svg.setAttribute("class", "clock-face");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  // Run-length rectangles avoid seams between neighboring lit pixels.
  function block(x, y, width, height) {
    const rect = document.createElementNS(ns, "rect");
    for (const [name, number] of Object.entries({x,y,width,height})) {
      rect.setAttribute(name, String(number));
    }
    svg.appendChild(rect);
  }
  const positions = [0, 8, 16, 20, 28];
  [...value].forEach((char, index) => {
    if (char === ":") {
      block(positions[index], 2, 2, 2);
      block(positions[index], 6, 2, 2);
      return;
    }
    const pattern = DIGITS[char];
    if (!pattern) throw new Error(`Unsupported clock digit: ${char}`);
    pattern.forEach((row, y) => {
      let start = -1;
      for (let x = 0; x <= row.length; x++) {
        if (row[x] === "1" && start < 0) start = x;
        if (row[x] !== "1" && start >= 0) {
          block(positions[index] + start, y, x - start, 1);
          start = -1;
        }
      }
    });
  });
  elements.clock.replaceChildren(svg);
  elements.clock.setAttribute("aria-label", `現在時刻 ${value}`);
  state.lastTime = value;
}


function updateClockAndDate() {
  const now = new Date();
  const weekdays = ["日","月","火","水","木","金","土"];
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  renderClock(`${hh}:${mm}`);
  elements.date.textContent =
    `${now.getFullYear()}年 ${now.getMonth()+1}月 ${now.getDate()}日（${weekdays[now.getDay()]}）`;
}

/**
 * v5.1 deliberately fixes the scene to night.
 * Other time-of-day backgrounds remain in CSS untouched for later work.
 */
function applyNightScene() {
  elements.world.className = "world night";
  elements.greeting.innerHTML = "Good night,<br><span>ゆっくりすごそう。</span>";
  elements.bubble.textContent = "ねむい... Zzz";
}

function renderCalendar() {
  const year = state.view.getFullYear();
  const monthIndex = state.view.getMonth();
  const today = new Date();

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, monthIndex, 0).getDate();

  elements.month.textContent =
    `${year}.${String(monthIndex + 1).padStart(2, "0")}`;

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 42; index++) {
    let dayNumber;
    let actualMonth = monthIndex;
    let outsideCurrentMonth = false;

    if (index < firstWeekday) {
      dayNumber = daysInPreviousMonth - firstWeekday + index + 1;
      actualMonth -= 1;
      outsideCurrentMonth = true;
    } else if (index >= firstWeekday + daysInMonth) {
      dayNumber = index - firstWeekday - daysInMonth + 1;
      actualMonth += 1;
      outsideCurrentMonth = true;
    } else {
      dayNumber = index - firstWeekday + 1;
    }

    const cellDate = new Date(year, actualMonth, dayNumber);
    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.textContent = String(dayNumber);

    if (outsideCurrentMonth) {
      cell.classList.add("out");
    } else if (cellDate.getDay() === 0) {
      cell.classList.add("sun");
    } else if (cellDate.getDay() === 6) {
      cell.classList.add("sat");
    }

    if (cellDate.toDateString() === today.toDateString()) {
      cell.classList.add("today");
    }

    fragment.appendChild(cell);
  }

  elements.days.replaceChildren(fragment);
}

function moveMonth(delta) {
  state.view = new Date(
    state.view.getFullYear(),
    state.view.getMonth() + delta,
    1
  );
  renderCalendar();
}

function bindEvents() {
  elements.prev.addEventListener("click", () => moveMonth(-1));
  elements.next.addEventListener("click", () => moveMonth(1));

  elements.today.addEventListener("click", () => {
    const now = new Date();
    state.view = new Date(now.getFullYear(), now.getMonth(), 1);
    renderCalendar();
  });

  elements.panel.addEventListener("touchstart", (event) => {
    state.touchY = event.touches[0].clientY;
  }, { passive: true });

  elements.panel.addEventListener("touchend", (event) => {
    if (state.touchY === null) return;

    const deltaY = event.changedTouches[0].clientY - state.touchY;
    if (Math.abs(deltaY) > CONFIG.swipeThreshold) {
      moveMonth(deltaY < 0 ? 1 : -1);
    }
    state.touchY = null;
  }, { passive: true });

  elements.panel.addEventListener("wheel", (event) => {
    event.preventDefault();

    const now = Date.now();
    if (
      now - state.lastWheel > CONFIG.wheelCooldown &&
      Math.abs(event.deltaY) > 8
    ) {
      moveMonth(event.deltaY > 0 ? 1 : -1);
      state.lastWheel = now;
    }
  }, { passive: false });

  // Keep v5's existing development buttons harmless during the night-only phase.
  // AUTO / 朝 / 昼 / 夕 / 夜 all resolve to the same night scene in v5.1.
  document.querySelectorAll("[data-scene]").forEach((button) => {
    button.addEventListener("click", applyNightScene);
  });}

function init() {
  assertRequiredElements();
  applyNightScene();
  renderCalendar();
  updateClockAndDate();
  bindEvents();
  window.setInterval(updateClockAndDate, 1000);
}

try {
  init();
} catch (error) {
  console.error("[Pixel Desk Clock] Initialization failed:", error);
}
