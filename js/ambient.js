"use strict";
// Quiet ambient events, driven by the existing clock loop. No timers/storage.
const AMBIENT = (() => {
  const world=document.querySelector('#world'),meteor=document.querySelector('.sky-meteor');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const candidates=[...document.querySelectorAll('.mid-building .win.on:not(:nth-child(3n+1))')].filter(e=>parseFloat(e.closest('.building').style.getPropertyValue('--x'))<50);
  const windows=candidates.filter((_,i)=>i%Math.max(1,Math.ceil(candidates.length/12))===0).slice(0,12);
  windows.forEach(e=>e.classList.add('ambient-window'));
  const dimmed=new Set();
  const birds=document.querySelector('.sky-birds'),flights=new Set();
  let birdContext='';
  const birdsAllowed=()=>allowed()&&['morning','lateMorning','day'].includes(world.getAttribute('data-time-scene'))&&['sunny','cloudy'].includes(world.getAttribute('data-weather'));
  function cancelBirds(){for(const flight of flights)flight.cancel();flights.clear();if(birds.firstChild)birds.replaceChildren();}
  function flyBirds(){
    if(!birdsAllowed()||flights.size||typeof birds.animate!=='function')return;
    const count=world.getAttribute('data-weather')==='cloudy'?3:3+Math.floor(Math.random()*3);
    function startFlight(bird,index,phase=0){
      if(!birdsAllowed()||!bird.isConnected)return;
      const reverse=Math.random()<.2,width=world.clientWidth,duration=45000+Math.random()*20000;
      const height=world.clientHeight,origin=world.getBoundingClientRect().top;
      const clock=document.querySelector('#pixelClock').getBoundingClientRect();
      // Separate upper/lower lanes, leaving room for the bird's bob and drift.
      const bands=[[Math.max(12,height*.04),clock.top-origin-24],[clock.bottom-origin+24,height*.55]].filter(([min,max])=>max>min);
      if(!bands.length){bird.remove();return;}
      const bandIndex=index%bands.length,[min,max]=bands[bandIndex];
      const lanes=Math.ceil((count-bandIndex)/bands.length),lane=Math.floor(index/bands.length);
      bird.style.top=(min+(max-min)*(lane+.2+Math.random()*.6)/lanes)+'px';
      bird.style.setProperty('--flap-time',(650+Math.random()*350)+'ms');
      const bob=2+Math.random()*4,drift=(Math.random()-.5)*18;
      const flight=bird.animate(Array.from({length:9},(_,step)=>({transform:`translate(${reverse?width+20-(width+40)*step/8:-20+(width+40)*step/8}px,${drift*step/8+(step%2?bob:-bob)}px)`})),{duration,easing:'linear'});
      flight.currentTime=phase*duration;
      flights.add(flight);
      flight.finished.then(()=>{
        if(!flights.delete(flight))return;
        if(birdsAllowed()&&bird.isConnected)startFlight(bird,index);
        else bird.remove();
      },()=>{});
    }
    for(let i=0;i<count;i++){
      const bird=document.createElement('i'),sprite=document.createElement('span');
      bird.className='sky-bird';bird.append(sprite);
      sprite.style.animationDelay=(-Math.random())+'s';
      birds.append(bird);
      // Spread the first flights across the sky; recycle each bird without a waiting timer.
      startFlight(bird,i,(i+.5)/count);
    }
  }
  let animation=null,paused=document.hidden,lastTime=null,nextMeteor=0,nextWindow=0,lastWindow=null;
  const night=()=>['night','deepNight'].includes(world.getAttribute('data-time-scene'));
  const allowed=()=>!paused&&!document.hidden&&!reduced.matches;
  const meteorAllowed=()=>allowed()&&night()&&world.getAttribute('data-weather')==='sunny';
  const meteorDelay=()=> (1+Math.random())*3600000;
  const windowDelay=()=> (4+Math.random()*3)*60000;
  function schedule(now){nextMeteor=now+meteorDelay();nextWindow=now+windowDelay();}
  function cancelMeteor(){if(animation){animation.cancel();animation=null;}}
  function shoot(){
    if(!meteorAllowed()||animation||typeof meteor.animate!=='function')return false;
    meteor.style.left=(23+Math.random()*18)+'%';
    meteor.style.top=(3+Math.random()*6)+'%';
    const dx=125+Math.random()*50,dy=dx*(.32+Math.random()*.16);
    meteor.style.setProperty('--meteor-angle',Math.atan2(dy,dx)*180/Math.PI+'deg');
    const shot=meteor.animate([{transform:'translate(0,0)',opacity:0},{transform:`translate(${dx*.18}px,${dy*.18}px)`,opacity:.6,offset:.18},{transform:`translate(${dx*.72}px,${dy*.72}px)`,opacity:.4,offset:.72},{transform:`translate(${dx}px,${dy}px)`,opacity:0}],{duration:1300+Math.random()*300,easing:'linear'});
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
    const context=world.getAttribute('data-time-scene')+':'+world.getAttribute('data-weather');
    if(context!==birdContext){birdContext=context;cancelBirds();}
    if(!birdsAllowed())cancelBirds();
    else flyBirds();
    document.querySelector('#previewMeteor').disabled=!meteorAllowed();
    document.querySelector('#previewWindows').disabled=!allowed()||!night();
    document.querySelector('#previewBirds').disabled=!birdsAllowed();
    if(!meteorAllowed())cancelMeteor();
    if(!night()||reduced.matches){for(const e of dimmed)e.classList.remove('ambient-window-dim');dimmed.clear();}
    if(!allowed())return;
    if(time>=nextMeteor){shoot();nextMeteor=time+meteorDelay();}
    if(time>=nextWindow){changeWindow();nextWindow=time+windowDelay();}
  }
  function pause(value){paused=value;if(value){cancelMeteor();cancelBirds();}lastTime=null;}
  document.querySelector('#previewMeteor').addEventListener('click',()=>{if(shoot())nextMeteor=Date.now()+meteorDelay();});
  document.querySelector('#previewWindows').addEventListener('click',()=>{if(changeWindow())nextWindow=Date.now()+windowDelay();});
  document.querySelector('#previewBirds').addEventListener('click',()=>{cancelBirds();flyBirds();});
  reduced.addEventListener('change',()=>sync(new Date()));
  window.addEventListener('resize',cancelBirds);
  return Object.freeze({sync,pause});
})();
