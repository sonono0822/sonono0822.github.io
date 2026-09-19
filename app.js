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
  elements.greeting.innerHTML = "Good night,<br><span><svg class=\"greeting-pixels\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 73 7\" width=\"73\" height=\"7\" role=\"img\" aria-label=\"Take it slow.\" focusable=\"false\" shape-rendering=\"crispEdges\"><path fill=\"currentColor\" d=\"M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM2 1h1v1h-1zM2 2h1v1h-1zM2 3h1v1h-1zM2 4h1v1h-1zM2 5h1v1h-1zM2 6h1v1h-1zM7 2h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM10 3h1v1h-1zM7 4h1v1h-1zM8 4h1v1h-1zM9 4h1v1h-1zM10 4h1v1h-1zM6 5h1v1h-1zM10 5h1v1h-1zM7 6h1v1h-1zM8 6h1v1h-1zM9 6h1v1h-1zM10 6h1v1h-1zM12 0h1v1h-1zM12 1h1v1h-1zM12 2h1v1h-1zM15 2h1v1h-1zM12 3h1v1h-1zM14 3h1v1h-1zM12 4h1v1h-1zM13 4h1v1h-1zM12 5h1v1h-1zM14 5h1v1h-1zM12 6h1v1h-1zM15 6h1v1h-1zM19 2h1v1h-1zM20 2h1v1h-1zM21 2h1v1h-1zM18 3h1v1h-1zM22 3h1v1h-1zM18 4h1v1h-1zM19 4h1v1h-1zM20 4h1v1h-1zM21 4h1v1h-1zM22 4h1v1h-1zM18 5h1v1h-1zM19 6h1v1h-1zM20 6h1v1h-1zM21 6h1v1h-1zM30 0h1v1h-1zM29 2h1v1h-1zM30 2h1v1h-1zM30 3h1v1h-1zM30 4h1v1h-1zM30 5h1v1h-1zM29 6h1v1h-1zM30 6h1v1h-1zM31 6h1v1h-1zM36 0h1v1h-1zM36 1h1v1h-1zM35 2h1v1h-1zM36 2h1v1h-1zM37 2h1v1h-1zM36 3h1v1h-1zM36 4h1v1h-1zM36 5h1v1h-1zM37 6h1v1h-1zM38 6h1v1h-1zM45 2h1v1h-1zM46 2h1v1h-1zM47 2h1v1h-1zM48 2h1v1h-1zM44 3h1v1h-1zM45 4h1v1h-1zM46 4h1v1h-1zM47 4h1v1h-1zM48 5h1v1h-1zM44 6h1v1h-1zM45 6h1v1h-1zM46 6h1v1h-1zM47 6h1v1h-1zM51 0h1v1h-1zM52 0h1v1h-1zM52 1h1v1h-1zM52 2h1v1h-1zM52 3h1v1h-1zM52 4h1v1h-1zM52 5h1v1h-1zM51 6h1v1h-1zM52 6h1v1h-1zM53 6h1v1h-1zM57 2h1v1h-1zM58 2h1v1h-1zM59 2h1v1h-1zM56 3h1v1h-1zM60 3h1v1h-1zM56 4h1v1h-1zM60 4h1v1h-1zM56 5h1v1h-1zM60 5h1v1h-1zM57 6h1v1h-1zM58 6h1v1h-1zM59 6h1v1h-1zM62 2h1v1h-1zM66 2h1v1h-1zM62 3h1v1h-1zM66 3h1v1h-1zM62 4h1v1h-1zM64 4h1v1h-1zM66 4h1v1h-1zM62 5h1v1h-1zM64 5h1v1h-1zM66 5h1v1h-1zM63 6h1v1h-1zM65 6h1v1h-1zM70 5h1v1h-1zM71 5h1v1h-1zM70 6h1v1h-1zM71 6h1v1h-1z\"/></svg></span>";
  elements.bubble.textContent = "ねむい... Zzz";
}

// Calendar glyphs are separate from the large clock: narrow, readable 5x7 strokes.
const CALENDAR_GLYPHS = Object.freeze({
  "0":["01110","10001","10011","10101","11001","10001","01110"],
  "1":["00100","01100","00100","00100","00100","00100","01110"],
  "2":["01110","10001","00001","00010","00100","01000","11111"],
  "3":["11110","00001","00001","01110","00001","00001","11110"],
  "4":["00010","00110","01010","10010","11111","00010","00010"],
  "5":["11111","10000","10000","11110","00001","00001","11110"],
  "6":["01110","10000","10000","11110","10001","10001","01110"],
  "7":["11111","00001","00010","00100","01000","01000","01000"],
  "8":["01110","10001","10001","01110","10001","10001","01110"],
  "9":["01110","10001","10001","01111","00001","00001","01110"],
  ".":["00000","00000","00000","00000","00000","00110","00110"],
  "S":["01111","10000","10000","01110","00001","00001","11110"],
  "U":["10001","10001","10001","10001","10001","10001","01110"],
  "N":["10001","11001","11001","10101","10011","10011","10001"],
  "M":["10001","11011","10101","10101","10001","10001","10001"],
  "O":["01110","10001","10001","10001","10001","10001","01110"],
  "T":["11111","00100","00100","00100","00100","00100","00100"],
  "E":["11111","10000","10000","11110","10000","10000","11111"],
  "W":["10001","10001","10001","10101","10101","11011","10001"],
  "D":["11110","10001","10001","10001","10001","10001","11110"],
  "H":["10001","10001","10001","11111","10001","10001","10001"],
  "F":["11111","10000","10000","11110","10000","10000","10000"],
  "R":["11110","10001","10001","11110","10100","10010","10001"],
  "I":["01110","00100","00100","00100","00100","00100","01110"],
  "A":["01110","10001","10001","11111","10001","10001","10001"]
});

function calendarText(value) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns,"svg");
  svg.setAttribute("viewBox",`0 0 ${value.length * 6 - 1} 7`);
  svg.setAttribute("class","calendar-pixels");
  svg.setAttribute("role","img");
  svg.setAttribute("aria-label",value);
  svg.setAttribute("focusable","false");
  svg.setAttribute("shape-rendering","crispEdges");
  let data = "";
  [...value].forEach((char,index) => {
    const rows = CALENDAR_GLYPHS[char];
    if (!rows) throw new Error(`Unsupported calendar glyph: ${char}`);
    rows.forEach((row,y) => {
      for(let x=0;x<5;x++) if(row[x]==="1") data+=`M${index*6+x} ${y}h1v1h-1z`;
    });
  });
  const path = document.createElementNS(ns,"path");
  path.setAttribute("d",data);
  svg.appendChild(path);
  return svg;
}


function renderCalendar() {
  const year = state.view.getFullYear();
  const monthIndex = state.view.getMonth();
  const today = new Date();

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, monthIndex, 0).getDate();

  elements.month.replaceChildren(calendarText(
    `${year}.${String(monthIndex + 1).padStart(2, "0")}`));
  document.querySelectorAll(".week span").forEach((day, index) => {
    day.replaceChildren(calendarText(["SUN","MON","TUE","WED","THU","FRI","SAT"][index]));
  });

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
    cell.appendChild(calendarText(String(dayNumber)));

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
