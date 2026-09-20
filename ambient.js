"use strict";
// Quiet ambient events, driven by the existing clock loop. No timers/storage.
const AMBIENT = (() => {
  const world=document.querySelector('#world'),meteor=document.querySelector('.sky-meteor');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const candidates=[...document.querySelectorAll('.mid-building .win.on:not(:nth-child(3n+1))')].filter(e=>parseFloat(e.closest('.building').style.getPropertyValue('--x'))<50);
  const windows=candidates.filter((_,i)=>i%Math.max(1,Math.ceil(candidates.length/12))===0).slice(0,12);
  windows.forEach(e=>e.classList.add('ambient-window'));
  const dimmed=new Set();
  let animation=null,paused=document.hidden,lastTime=null,nextMeteor=0,nextWindow=0,lastWindow=null;
  const night=()=>['night','deepNight'].includes(world.getAttribute('data-time-scene'));
  const allowed=()=>!paused&&!document.hidden&&!reduced.matches;
  const meteorAllowed=()=>allowed()&&night()&&world.getAttribute('data-weather')==='sunny';
  const meteorDelay=()=> (2+Math.random()*2)*3600000;
  const windowDelay=()=> (4+Math.random()*3)*60000;
  function schedule(now){nextMeteor=now+meteorDelay();nextWindow=now+windowDelay();}
  function cancelMeteor(){if(animation){animation.cancel();animation=null;}}
  function shoot(){
    if(!meteorAllowed()||animation||typeof meteor.animate!=='function')return false;
    meteor.style.left=(23+Math.random()*18)+'%';
    const shot=meteor.animate([{transform:'translate(0,0)',opacity:0},{transform:'translate(20px,8px)',opacity:.65,offset:.18},{transform:'translate(105px,42px)',opacity:.45,offset:.72},{transform:'translate(145px,58px)',opacity:0}],{duration:1500,easing:'linear'});
    animation=shot;shot.finished.then(()=>{if(animation===shot)animation=null;},()=>{});return true;
  }
  function changeWindow(){
    if(!allowed()||!night())return false;
    const pool=(dimmed.size>=4?windows.filter(e=>dimmed.has(e)):windows).filter(e=>e!==lastWindow);
    if(!pool.length)return false;
    const target=pool[Math.floor(Math.random()*pool.length)];
    if(dimmed.has(target)){dimmed.delete(target);target.classList.remove('ambient-window-dim');}
    else{dimmed.add(target);target.classList.add('ambient-window-dim');}
    lastWindow=target;return true;
  }
  function sync(now){
    const time=now.getTime();
    if(lastTime===null||time<lastTime||time-lastTime>60000)schedule(time);
    lastTime=time;
    document.querySelector('#previewMeteor').disabled=!meteorAllowed();
    document.querySelector('#previewWindows').disabled=!allowed()||!night();
    if(!meteorAllowed())cancelMeteor();
    if(!night()||reduced.matches){for(const e of dimmed)e.classList.remove('ambient-window-dim');dimmed.clear();}
    if(!allowed())return;
    if(time>=nextMeteor){shoot();nextMeteor=time+meteorDelay();}
    if(time>=nextWindow){changeWindow();nextWindow=time+windowDelay();}
  }
  function pause(value){paused=value;if(value)cancelMeteor();lastTime=null;}
  document.querySelector('#previewMeteor').addEventListener('click',()=>{if(shoot())nextMeteor=Date.now()+meteorDelay();});
  document.querySelector('#previewWindows').addEventListener('click',()=>{if(changeWindow())nextWindow=Date.now()+windowDelay();});
  reduced.addEventListener('change',()=>sync(new Date()));
  return Object.freeze({sync,pause});
})();
