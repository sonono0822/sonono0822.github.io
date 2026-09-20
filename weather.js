"use strict";
// Fictional local weather. One saved seed, no network or additional timer.
const WEATHER = (() => {
  const storageKey = "pixelDeskClock.weatherSeed.v1";
  let seed = 1729;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw !== null && /^\d+$/.test(raw) && Number.isSafeInteger(Number(raw)) && Number(raw) <= 4294967295) seed = Number(raw);
    else { seed = Math.floor(Math.random() * 4294967296); localStorage.setItem(storageKey,String(seed)); }
  } catch (_) { /* Deterministic fallback also survives reload without storage. */ seed = 1729; }
  const world = document.querySelector('#world');
  const labels = {sunny:'晴れ',cloudy:'曇り',rain:'雨',snow:'雪'};
  let mode = 'auto', current = '', cachedBlock = null, days = [];
  function sequence(block) {
    let random = (seed ^ Math.imul(block, 2654435761)) >>> 0;
    const next = () => {random = (Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296;};
    // Ten days contain 5 sunny, 3 cloudy and 2 wet days. Different end/start
    // weather prevents runs crossing blocks; reject runs over two days within.
    for(let attempt=0;attempt<64;attempt++) {
      const middle=['sunny','sunny','sunny','sunny','cloudy','cloudy','rain','rain'];
      for(let i=middle.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[middle[i],middle[j]]=[middle[j],middle[i]];}
      const result=['sunny',...middle,'cloudy'];
      if(!result.some((v,i)=>i>1&&v===result[i-1]&&v===result[i-2])) return result;
    }
    return ['sunny','cloudy','sunny','rain','sunny','sunny','cloudy','sunny','rain','cloudy'];
  }
  function at(date, season) {
    const day=Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000);
    const block=Math.floor(day/10);
    if(block!==cachedBlock){cachedBlock=block;days=sequence(block);}
    const value=days[((day%10)+10)%10];
    return value==='rain'&&season==='winter'?'snow':value;
  }
  function sync(date=new Date()) {
    const season=document.documentElement.getAttribute('data-season');
    const value=mode==='auto'?at(date,season):mode==='rain'&&season==='winter'?'snow':mode;
    if(value!==current){current=value;world.setAttribute('data-weather',value);document.querySelector('#weatherStatus').textContent=labels[value];}
    return current;
  }
  function select(value) {
    if(!['auto','sunny','cloudy','rain'].includes(value))return;
    mode=value;sync();
    document.querySelectorAll('[data-weather-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute('data-weather-preview')===mode)));
    // The existing scene updater owns all palette writes and timer scheduling.
    if(typeof syncScene==='function')syncScene(true);
  }
  function palette(name,value) {
    if(current==='sunny'||!current)return value;
    const wet=current==='rain'||current==='snow';
    if(['sky-top','sky-mid','sky-low','horizon','cloud','cloud-light'].includes(name)) {
      const rgb=value.match(/[\d.]+/g).map(Number);
      const gray=rgb[0]*.3+rgb[1]*.59+rgb[2]*.11;
      const amount=wet?.55:.35, light=wet?.94:.98;
      return `rgb(${rgb.map(c=>Math.round((c+(gray-c)*amount)*light)).join(',')})`;
    }
    if(name==='sun-opacity'||name==='moon-opacity')return String(Number(value)*(wet?0:.18));
    if(name==='stars')return String(Number(value)*(wet?.08:.25));
    if(name==='cloud-opacity')return String(Math.min(1,Number(value)+(wet?.24:.15)));
    return value;
  }
  document.querySelectorAll('[data-weather-preview]').forEach(b=>b.addEventListener('click',()=>select(b.getAttribute('data-weather-preview'))));
  // Initialize without calling app.js before its state has been initialized.
  sync();
  document.querySelector('[data-weather-preview="auto"]').setAttribute('aria-pressed','true');
  return Object.freeze({sync,select,at,palette});
})();
