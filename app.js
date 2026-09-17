"use strict";

/**
 * Pixel Desk Clock v5.1
 * Scope: JavaScript initialization regression fix only.
 * HTML/CSS/design are intentionally unchanged from v5.
 */

const CONFIG = Object.freeze({
  swipeThreshold: 35,
  wheelCooldown: 450
});

const DIGITS = Object.freeze({
  "0":["11111","10001","10001","10001","10001","10001","11111"],
  "1":["00100","01100","00100","00100","00100","00100","01110"],
  "2":["11111","00001","00001","11111","10000","10000","11111"],
  "3":["11111","00001","00001","01111","00001","00001","11111"],
  "4":["10001","10001","10001","11111","00001","00001","00001"],
  "5":["11111","10000","10000","11111","00001","00001","11111"],
  "6":["11111","10000","10000","11111","10001","10001","11111"],
  "7":["11111","00001","00010","00100","01000","01000","01000"],
  "8":["11111","10001","10001","11111","10001","10001","11111"],
  "9":["11111","10001","10001","11111","00001","00001","11111"]
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

function createDigit(char) {
  const pattern = DIGITS[char];
  if (!pattern) throw new Error(`Unsupported clock digit: ${char}`);

  const digit = document.createElement("span");
  digit.className = "pixel-digit";

  for (const bit of pattern.join("")) {
    const pixel = document.createElement("i");
    pixel.className = bit === "1" ? "pixel on" : "pixel";
    digit.appendChild(pixel);
  }
  return digit;
}

function createColon() {
  const colon = document.createElement("span");
  colon.className = "pixel-colon";
  colon.append(document.createElement("i"), document.createElement("i"));
  return colon;
}

function renderClock(value) {
  if (state.lastTime === value) return;

  const fragment = document.createDocumentFragment();
  for (const char of value) {
    fragment.appendChild(char === ":" ? createColon() : createDigit(char));
  }

  elements.clock.replaceChildren(fragment);
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
