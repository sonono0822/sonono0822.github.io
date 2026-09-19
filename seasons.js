"use strict";
// Three local calendar days per season; no external service or extra timer.
const SEASONS = (() => {
  const names = ["spring","summer","autumn","winter"];
  const key = "pixelDeskClock.seasonAnchor.v1";
  const dayNumber = date => Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()) / 86400000);
  const today = dayNumber(new Date());
  let anchor = today;
  try {
    const raw = localStorage.getItem(key);
    const saved = raw !== null && /^\d+$/.test(raw) ? Number(raw) : NaN;
    if (Number.isSafeInteger(saved) && saved >= 0 && saved <= today) anchor = saved;
    else localStorage.setItem(key,String(anchor));
  } catch (_) { /* Storage unavailable: keep the session's initial spring. */ }
  const root = document.documentElement;
  const palettes = [
    ["#354b40","#638265","#95a879","#c0bb86","#7c9266",1,1],
    ["#293f35","#466a4e","#6f925f","#9ca873","#527451",.15,1],
    ["#50443b","#a07850","#c69e64","#d6b779","#a9604e",0,1],
    ["#3a4542","#5e7063","#899484","#afb3a0","#6c7a6b",0,.12]
  ];
  const properties = ["--season-ink","--season-leaf","--season-highlight","--season-glint","--season-accent","--season-flowers","--season-extra-leaves"];
  const icons = [
    "M5 0h2v3h3v2h2v2H9v3H7v2H5V9H2V7H0V5h3V2h2z",
    "M8 0h4v4h-2v3H8v2H5v1H3v2H1V9h1V5h2V3h2V1h2z",
    "M5 0h2v3h2V2h2v4h1v2H9v2H7v2H5V9H2V7H0V4h3V2h2z",
    "M5 0h2v3h2V1h2v2H9v2h3v2H9v2h2v2H9V9H7v3H5V9H3v2H1V9h2V7H0V5h3V3H1V1h2v2h2z"
  ];
  document.querySelectorAll('.plant-foliage > g').forEach(group => {
    group.classList.add(group.children.length === 4 ? 'season-leaf' : 'season-flower');
  });
  const ns = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(ns,"svg");
  icon.setAttribute("class","season-decoration");
  icon.setAttribute("viewBox","0 0 12 12");
  icon.setAttribute("aria-hidden","true");
  icon.setAttribute("focusable","false");
  const shape = document.createElementNS(ns,"path");icon.appendChild(shape);
  document.querySelector('#calendarPanel').appendChild(icon);
  let mode = "auto", lastKey = "", lastSeason = "";
  function at(date) {
    const elapsed = Math.max(0,dayNumber(date)-anchor);
    const index = Math.floor(elapsed/3)%4;
    // Last six hours of day three gently prepare the plants for the next season.
    const fraction = date.getHours()+date.getMinutes()/60;
    const blend = elapsed%3 === 2 ? Math.max(0,(fraction-18)/6) : 0;
    return {index,blend};
  }
  function mix(a,b,t) {
    if (typeof a === "number") return String(a+(b-a)*t);
    const c=[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t));
    return `rgb(${c.join(',')})`;
  }
  function sync(date = new Date()) {
    const sample = mode === "auto" ? at(date) : {index:names.indexOf(mode),blend:0};
    const cache = `${mode}:${sample.index}:${Math.floor(sample.blend*360)}`;
    if(cache === lastKey) return;
    lastKey=cache;
    const {index,blend}=sample;
    properties.forEach((property,i)=>root.style.setProperty(property,mix(palettes[index][i],palettes[(index+1)%4][i],blend)));
    const name=names[index];
    if(lastSeason!==name){root.setAttribute('data-season',name);shape.setAttribute('d',icons[index]);lastSeason=name;}
  }
  function select(value) {
    if(value!=="auto"&&!names.includes(value))return;
    mode=value;lastKey="";sync();
    document.querySelectorAll('[data-season-preview]').forEach(button=>button.setAttribute('aria-pressed',String(button.getAttribute('data-season-preview')===mode)));
  }
  document.querySelectorAll('[data-season-preview]').forEach(button=>button.addEventListener('click',()=>select(button.getAttribute('data-season-preview'))));
  select("auto");
  return Object.freeze({sync,at,select});
})();
