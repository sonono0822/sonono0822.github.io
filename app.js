"use strict";

/** Pixel Desk Clock — connected pixel clock renderer, v5.8.0. */

const CONFIG = Object.freeze({
  swipeThreshold: 35,
  wheelCooldown: 450
});

// Clock and calendar share the same 5x7 digit patterns below.
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
  lastDate: "",
  touchY: null,
  sceneMode: "auto",
  activeScene: null,
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

// Keep six paths alive; only changed digits receive a new path value.
let clockDigitPaths = null;
let previousClockDigits = "";
function clockDigitData(char) {
  return CALENDAR_GLYPHS[char].map((row, y) => {
    let data = "";
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "1") data += `M${x} ${y}h1v1h-1z`;
    }
    return data;
  }).join("");
}
function renderClock(value) {
  if (state.lastTime === value) return;
  const ns = "http://www.w3.org/2000/svg";
  if (!clockDigitPaths) {
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 33.55 7");
    svg.setAttribute("class", "clock-face");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("shape-rendering", "crispEdges");
    clockDigitPaths = [0, 6, 14, 20, 27.5, 30.8].map((x, index) => {
      const path = document.createElementNS(ns, "path");
      path.setAttribute("transform", index < 4
        ? `translate(${x} 0)` : `translate(${x} 3.15) scale(.55)`);
      svg.appendChild(path);
      return path;
    });
    const colon = document.createElementNS(ns, "path");
    colon.setAttribute("d", "M12 2h1v1h-1zM12 4h1v1h-1z");
    svg.appendChild(colon);
    elements.clock.replaceChildren(svg);
  }
  const digits = value.replaceAll(":", "");
  [...digits].forEach((char, index) => {
    if (char !== previousClockDigits[index]) {
      clockDigitPaths[index].setAttribute("d", clockDigitData(char));
    }
  });
  previousClockDigits = digits;
  elements.clock.setAttribute("aria-label", `現在時刻 ${value}`);
  state.lastTime = value;
}


function updateClockAndDate() {
  const now = new Date();
  if (typeof SEASONS !== "undefined") SEASONS.sync(now);
  const weekdays = ["日","月","火","水","木","金","土"];
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  const ss = String(now.getSeconds()).padStart(2, "0");
  renderClock(`${hh}:${mm}:${ss}`);
  const dateText = `${now.getFullYear()}年 ${now.getMonth()+1}月 ${now.getDate()}日（${weekdays[now.getDay()]}）`;
  if (state.lastDate !== dateText) {
    elements.date.textContent = dateText;
    // Refresh today's marker at midnight, preserving the browsed month.
    if (state.lastDate !== "") renderCalendar();
    state.lastDate = dateText;
  }
}

/**
 * Keep the shared night-scene geometry; time palettes provide its colors.
 */
function applyNightScene() {
  elements.world.className = "world night";
  elements.greeting.innerHTML = "Good night,<br><span><svg class=\"greeting-pixels\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 73 7\" width=\"73\" height=\"7\" role=\"img\" aria-label=\"Take it slow.\" focusable=\"false\" shape-rendering=\"crispEdges\"><path fill=\"currentColor\" d=\"M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM2 1h1v1h-1zM2 2h1v1h-1zM2 3h1v1h-1zM2 4h1v1h-1zM2 5h1v1h-1zM2 6h1v1h-1zM7 2h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM10 3h1v1h-1zM7 4h1v1h-1zM8 4h1v1h-1zM9 4h1v1h-1zM10 4h1v1h-1zM6 5h1v1h-1zM10 5h1v1h-1zM7 6h1v1h-1zM8 6h1v1h-1zM9 6h1v1h-1zM10 6h1v1h-1zM12 0h1v1h-1zM12 1h1v1h-1zM12 2h1v1h-1zM15 2h1v1h-1zM12 3h1v1h-1zM14 3h1v1h-1zM12 4h1v1h-1zM13 4h1v1h-1zM12 5h1v1h-1zM14 5h1v1h-1zM12 6h1v1h-1zM15 6h1v1h-1zM19 2h1v1h-1zM20 2h1v1h-1zM21 2h1v1h-1zM18 3h1v1h-1zM22 3h1v1h-1zM18 4h1v1h-1zM19 4h1v1h-1zM20 4h1v1h-1zM21 4h1v1h-1zM22 4h1v1h-1zM18 5h1v1h-1zM19 6h1v1h-1zM20 6h1v1h-1zM21 6h1v1h-1zM30 0h1v1h-1zM29 2h1v1h-1zM30 2h1v1h-1zM30 3h1v1h-1zM30 4h1v1h-1zM30 5h1v1h-1zM29 6h1v1h-1zM30 6h1v1h-1zM31 6h1v1h-1zM36 0h1v1h-1zM36 1h1v1h-1zM35 2h1v1h-1zM36 2h1v1h-1zM37 2h1v1h-1zM36 3h1v1h-1zM36 4h1v1h-1zM36 5h1v1h-1zM37 6h1v1h-1zM38 6h1v1h-1zM45 2h1v1h-1zM46 2h1v1h-1zM47 2h1v1h-1zM48 2h1v1h-1zM44 3h1v1h-1zM45 4h1v1h-1zM46 4h1v1h-1zM47 4h1v1h-1zM48 5h1v1h-1zM44 6h1v1h-1zM45 6h1v1h-1zM46 6h1v1h-1zM47 6h1v1h-1zM51 0h1v1h-1zM52 0h1v1h-1zM52 1h1v1h-1zM52 2h1v1h-1zM52 3h1v1h-1zM52 4h1v1h-1zM52 5h1v1h-1zM51 6h1v1h-1zM52 6h1v1h-1zM53 6h1v1h-1zM57 2h1v1h-1zM58 2h1v1h-1zM59 2h1v1h-1zM56 3h1v1h-1zM60 3h1v1h-1zM56 4h1v1h-1zM60 4h1v1h-1zM56 5h1v1h-1zM60 5h1v1h-1zM57 6h1v1h-1zM58 6h1v1h-1zM59 6h1v1h-1zM62 2h1v1h-1zM66 2h1v1h-1zM62 3h1v1h-1zM66 3h1v1h-1zM62 4h1v1h-1zM64 4h1v1h-1zM66 4h1v1h-1zM62 5h1v1h-1zM64 5h1v1h-1zM66 5h1v1h-1zM63 6h1v1h-1zM65 6h1v1h-1zM70 5h1v1h-1zM71 5h1v1h-1zM70 6h1v1h-1zM71 6h1v1h-1z\"/></svg></span>";
}

// Shared clock/calendar glyphs: narrow, readable 5x7 strokes.
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
  const weekCount = Math.ceil((firstWeekday + daysInMonth) / 7);
  elements.days.style.setProperty("--calendar-weeks", String(weekCount));

  elements.month.replaceChildren(calendarText(
    `${year}.${String(monthIndex + 1).padStart(2, "0")}`));
  document.querySelectorAll(".week span").forEach((day, index) => {
    day.replaceChildren(calendarText(["SUN","MON","TUE","WED","THU","FRI","SAT"][index]));
  });

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < weekCount * 7; index++) {
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
    } else if (cellDate.getDay() === 0 ||
      (typeof JAPAN_HOLIDAYS !== "undefined" && JAPAN_HOLIDAYS.has(cellDate))) {
      cell.classList.add("sun");
    } else if (cellDate.getDay() === 6) {
      cell.classList.add("sat");
    }

    if (cellDate.toDateString() === today.toDateString()) {
      cell.classList.add("today");
      cell.setAttribute("aria-current", "date");
      const ns = "http://www.w3.org/2000/svg";
      const frame = document.createElementNS(ns, "svg");
      frame.setAttribute("class", "today-frame");
      frame.setAttribute("viewBox", "0 0 100 100");
      frame.setAttribute("preserveAspectRatio", "none");
      frame.setAttribute("aria-hidden", "true");
      frame.setAttribute("focusable", "false");
      const outline = document.createElementNS(ns, "path");
      outline.setAttribute("d", "M14 3H86V8H92V14H97V86H92V92H86V97H14V92H8V86H3V14H8V8H14Z");
      outline.setAttribute("vector-effect", "non-scaling-stroke");
      frame.appendChild(outline);
      cell.appendChild(frame);
      const star = document.createElementNS(ns, "svg");
      star.setAttribute("class", "today-star");
      star.setAttribute("viewBox", "0 0 7 7");
      star.setAttribute("aria-hidden", "true");
      star.setAttribute("focusable", "false");
      const shape = document.createElementNS(ns, "path");
      shape.setAttribute("d", "M3 0H4V2H5V3H7V4H5V5H4V7H3V5H2V4H0V3H2V2H3Z");
      star.appendChild(shape);
      cell.appendChild(star);
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


const SCENE_COPY = Object.freeze({
  morning: ["Good morning,", "おはよう…"],
  lateMorning: ["Good morning,", "おはよう…"],
  day: ["Good afternoon,", "ひと休みしよう"],
  evening: ["Good evening,", "おつかれさま…"],
  night: ["Good night,", "ねむい... Zzz"],
  deepNight: ["Good night,", "ねむい... Zzz"]
});
function applyScene(scene) {
  if (!Object.prototype.hasOwnProperty.call(SCENE_COPY, scene)) return;
  applyNightScene();
  state.activeScene = scene;
  elements.world.setAttribute("data-time-scene", scene);
  elements.greeting.innerHTML = elements.greeting.innerHTML.replace("Good night,", SCENE_COPY[scene][0]);
  document.querySelectorAll("[data-scene]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.getAttribute("data-scene") === state.sceneMode));
  });
}


function sceneForTime(now) {
  const hour = now.getHours();
  if (hour >= 5 && hour < 9) return "morning";
  if (hour >= 9 && hour < 12) return "lateMorning";
  if (hour >= 12 && hour < 16) return "day";
  if (hour >= 16 && hour < 19) return "evening";
  if (hour >= 19 && hour < 23) return "night";
  return "deepNight";
}

// Palette values mirror scenes.css; CSS remains the manual-preview fallback.
const SCENE_PALETTES = {
  "night": {
    "sky-top": "#111a38",
    "sky-mid": "#293554",
    "sky-low": "#55506b",
    "horizon": "#8b6b7b",
    "far": "#545575",
    "far-alt": "#626080",
    "mid": "#343f5d",
    "mid-alt": "#41455f",
    "near": "#222c45",
    "roof": "#7d7890",
    "window": "#edbf88",
    "window-dim": "#9390ab",
    "window-opacity": ".9",
    "cloud": "#7d7fa3",
    "cloud-light": "#a29abb",
    "cloud-opacity": ".15",
    "panel-top": "#41435e",
    "panel-bottom": "#343851",
    "sill": "#756376",
    "lamp-opacity": "1",
    "stars": ".65",
    "sun-opacity": "0",
    "moon-opacity": "1",
    "sun-top": "59",
    "sun-left": "44",
    "sun-size": "5",
    "lantern-saturation": "1",
    "rest-window-factor": "1",
    "street-light-opacity": "1",
    "lantern-brightness": "1"
  },
  "morning": {
    "sky-top": "#668bbe",
    "sky-mid": "#a7a4cb",
    "sky-low": "#e4abb4",
    "horizon": "#ffd49c",
    "far": "#a49ab6",
    "far-alt": "#b3a0b8",
    "mid": "#737e9d",
    "mid-alt": "#8987a3",
    "near": "#515d7d",
    "roof": "#c0adb9",
    "window": "#ffd7aa",
    "window-dim": "#a6aec6",
    "window-opacity": ".28",
    "cloud": "#f5c1ba",
    "cloud-light": "#ffe0ba",
    "cloud-opacity": ".65",
    "panel-top": "#535975",
    "panel-bottom": "#454b67",
    "sill": "#b09a9d",
    "lamp-opacity": ".55",
    "stars": "0",
    "sun-opacity": "1",
    "moon-opacity": "0",
    "sun-top": "59",
    "sun-left": "44",
    "sun-size": "5",
    "lantern-saturation": ".8",
    "rest-window-factor": ".18",
    "street-light-opacity": ".35",
    "lantern-brightness": ".94"
  },
  "day": {
    "sky-top": "#367ed0",
    "sky-mid": "#589ee0",
    "sky-low": "#a2cdec",
    "horizon": "#f0e7cf",
    "far": "#99b4c9",
    "far-alt": "#abc2d2",
    "mid": "#6b89ab",
    "mid-alt": "#819bb7",
    "near": "#4a6386",
    "roof": "#bbcad4",
    "window": "#d9dfc9",
    "window-dim": "#91abc0",
    "window-opacity": ".08",
    "cloud": "#f8efdc",
    "cloud-light": "#fff8e7",
    "cloud-opacity": ".85",
    "panel-top": "#4b607c",
    "panel-bottom": "#3c506b",
    "sill": "#b4a9a9",
    "lamp-opacity": ".28",
    "stars": "0",
    "sun-opacity": "1",
    "moon-opacity": "0",
    "sun-top": "12",
    "sun-left": "51",
    "sun-size": "4",
    "lantern-saturation": ".65",
    "rest-window-factor": ".08",
    "street-light-opacity": ".12",
    "lantern-brightness": ".92"
  },
  "evening": {
    "sky-top": "#484569",
    "sky-mid": "#925d85",
    "sky-low": "#d77887",
    "horizon": "#ffb26e",
    "far": "#a47a94",
    "far-alt": "#b98499",
    "mid": "#655c7b",
    "mid-alt": "#7b607d",
    "near": "#3e405f",
    "roof": "#bd8d9d",
    "window": "#ffcb8c",
    "window-dim": "#b899b0",
    "window-opacity": ".75",
    "cloud": "#d893a7",
    "cloud-light": "#ffc299",
    "cloud-opacity": ".48",
    "panel-top": "#554962",
    "panel-bottom": "#443d58",
    "sill": "#ad828e",
    "lamp-opacity": ".9",
    "stars": ".18",
    "sun-opacity": "1",
    "moon-opacity": "0",
    "sun-top": "59",
    "sun-left": "44",
    "sun-size": "5",
    "lantern-saturation": "1",
    "rest-window-factor": ".6",
    "street-light-opacity": ".8",
    "lantern-brightness": ".98"
  },
  "deepNight": {
    "sky-top": "#10172e",
    "sky-mid": "#222d46",
    "sky-low": "#41425b",
    "horizon": "#675469",
    "far": "#444863",
    "far-alt": "#50536d",
    "mid": "#2d3650",
    "mid-alt": "#373c54",
    "near": "#202940",
    "roof": "#686780",
    "window": "#edbf88",
    "window-dim": "#9390ab",
    "window-opacity": ".6",
    "cloud": "#7d7fa3",
    "cloud-light": "#a29abb",
    "cloud-opacity": ".15",
    "panel-top": "#41435e",
    "panel-bottom": "#343851",
    "sill": "#675c70",
    "lamp-opacity": ".72",
    "stars": ".65",
    "sun-opacity": "0",
    "moon-opacity": "1",
    "sun-top": "59",
    "sun-left": "44",
    "sun-size": "5",
    "lantern-saturation": "1",
    "rest-window-factor": "0",
    "street-light-opacity": ".7",
    "lantern-brightness": ".96"
  },
  "lateMorning": {
    "sky-top": "#78b8e8",
    "sky-mid": "#a0d3ee",
    "sky-low": "#cce7ef",
    "horizon": "#f0e7cf",
    "far": "#99b4c9",
    "far-alt": "#abc2d2",
    "mid": "#6b89ab",
    "mid-alt": "#819bb7",
    "near": "#4a6386",
    "roof": "#bbcad4",
    "window": "#d9dfc9",
    "window-dim": "#91abc0",
    "window-opacity": ".08",
    "cloud": "#f8efdc",
    "cloud-light": "#fff8e7",
    "cloud-opacity": ".85",
    "panel-top": "#4b607c",
    "panel-bottom": "#3c506b",
    "sill": "#b4a9a9",
    "lamp-opacity": ".28",
    "stars": "0",
    "sun-opacity": "1",
    "moon-opacity": "0",
    "sun-top": "12",
    "sun-left": "51",
    "sun-size": "4",
    "lantern-saturation": ".65",
    "rest-window-factor": ".08",
    "street-light-opacity": ".12",
    "lantern-brightness": ".92"
  }
};
// Each transition blends for 15 minutes on either side of the boundary.
const SCENE_BOUNDARIES = [
  [300,"deepNight","morning"], [540,"morning","lateMorning"],
  [720,"lateMorning","day"],
  [960,"day","evening"], [1140,"evening","night"], [1380,"night","deepNight"]
];
let lastPaletteKey = "";
function blendForTime(now) {
  const minute = now.getHours()*60 + now.getMinutes() + now.getSeconds()/60;
  for (const [boundary,from,to] of SCENE_BOUNDARIES) {
    if (minute >= boundary-15 && minute <= boundary+15) {
      const t = (minute-boundary+15)/30;
      return {from,to,amount:t*t*(3-2*t)};
    }
  }
  const scene = sceneForTime(now);
  return {from:scene,to:scene,amount:0};
}
function mixPaletteValue(a,b,t) {
  if (a.startsWith("#")) {
    const rgb = [1,3,5].map(i => Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t));
    return "rgb("+rgb.join(",")+")";
  }
  return String(Number(a)*(1-t)+Number(b)*t);
}
function syncScene(force = false) {
  const now = new Date();
  const weather = typeof WEATHER !== "undefined" ? WEATHER.sync(now) : "sunny";
  const scene = state.sceneMode === "auto" ? sceneForTime(now) : state.sceneMode;
  if (scene !== state.activeScene) applyScene(scene);
  if (typeof DIALOGUE !== "undefined") DIALOGUE.sync(now, scene);
  if (typeof AMBIENT !== "undefined") AMBIENT.sync(now);
  const blend = state.sceneMode === "auto" ? blendForTime(now) : {from:scene,to:scene,amount:0};
  const key = weather + ":" + state.sceneMode + ":" + blend.from + ":" + blend.to + ":" +
    (blend.from === blend.to ? "fixed" : Math.floor(now.getTime()/10000));
  if (!force && key === lastPaletteKey) return;
  lastPaletteKey = key;
  for (const name of Object.keys(SCENE_PALETTES[blend.from])) {
    const value = mixPaletteValue(SCENE_PALETTES[blend.from][name],SCENE_PALETTES[blend.to][name],blend.amount);
    elements.world.style.setProperty("--"+name, typeof WEATHER !== "undefined" ? WEATHER.palette(name,value) : value);
  }
}

function selectScene(mode) {
  if (mode !== "auto" && !Object.prototype.hasOwnProperty.call(SCENE_COPY, mode)) return;
  state.sceneMode = mode;
  syncScene(true);
  document.querySelectorAll("[data-scene]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.getAttribute("data-scene") === mode));
  });
}
function refreshDisplay() {
  updateClockAndDate();
  syncScene();
}

// One pending timer only; recalculate from wall time so delays do not accumulate.
let displayTimer = null;
function stopDisplayUpdates() {
  if (displayTimer !== null) window.clearTimeout(displayTimer);
  displayTimer = null;
}
function scheduleDisplayUpdate() {
  stopDisplayUpdates();
  if (document.hidden) return;
  displayTimer = window.setTimeout(() => {
    displayTimer = null;
    if (document.hidden) return;
    refreshDisplay();
    scheduleDisplayUpdate();
  }, 1000 - (Date.now() % 1000));
}
function resumeDisplayUpdates() {
  stopDisplayUpdates();
  if (document.hidden) return;
  refreshDisplay();
  syncScene(true);
  scheduleDisplayUpdate();
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

  document.querySelectorAll("[data-scene]").forEach((button) => {
    button.addEventListener("click", () => selectScene(button.getAttribute("data-scene")));
  });
}

function init() {
  assertRequiredElements();
  selectScene("auto");
  renderCalendar();
  updateClockAndDate();
  bindEvents();
  scheduleDisplayUpdate();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopDisplayUpdates();
    else resumeDisplayUpdates();
  });
  window.addEventListener("pagehide", stopDisplayUpdates);
  window.addEventListener("pageshow", resumeDisplayUpdates);
}

try {
  init();
} catch (error) {
  console.error("[Pixel Desk Clock] Initialization failed:", error);
}
