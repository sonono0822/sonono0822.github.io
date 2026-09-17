
"use strict";
const CONFIG={scene:{morning:[5,9],day:[9,16],evening:[16,19]},swipeThreshold:35,wheelCooldown:450};
const DIGITS={
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
};
const $=s=>document.querySelector(s);
const els={world:$("#world"),clock:$("#pixelClock"),date:$("#date"),greeting:$("#greeting"),bubble:$("#bubble"),month:$("#month"),days:$("#days"),panel:$("#calendarPanel")};
const state={view:new Date(new Date().getFullYear(),new Date().getMonth(),1),forcedScene:"auto",lastTime:"",touchY:null,lastWheel:0};

function sceneAt(hour){if(hour>=5&&hour<9)return"morning";if(hour>=9&&hour<16)return"day";if(hour>=16&&hour<19)return"evening";return"night"}
function sceneCopy(scene){return{morning:["Good morning,","今日もゆっくり。","おはよう..."],day:["Good afternoon,","ひとやすみも大事。","のんびりいこう"],evening:["Good evening,","おつかれさま。","おつかれさま..."],night:["Good night,","ゆっくりすごそう。","ねむい... Zzz"]}[scene]}
function createDigit(char){const digit=document.createElement("span");digit.className="pixel-digit";DIGITS[char].join("").split("").forEach(bit=>{const p=document.createElement("i");p.className="pixel"+(bit==="1"?" on":"");digit.appendChild(p)});return digit}
function createColon(){const c=document.createElement("span");c.className="pixel-colon";c.append(document.createElement("i"),document.createElement("i"));return c}
function renderClock(value){if(state.lastTime===value)return;state.lastTime=value;els.clock.replaceChildren();[...value].forEach(ch=>els.clock.appendChild(ch===":"?createColon():createDigit(ch)))}
function updateNow(){
 const n=new Date(),week="日月火水木金土",value=String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0");
 renderClock(value);els.date.textContent=`${n.getFullYear()}年 ${n.getMonth()+1}月 ${n.getDate()}日（${week[n.getDay()]}）`;
 const scene=state.forcedScene==="auto"?sceneAt(n.getHours()):state.forcedScene,copy=sceneCopy(scene);
 els.world.className="world "+scene;els.greeting.innerHTML=`${copy[0]}<br><span>${copy[1]}</span>`;els.bubble.textContent=copy[2];
}
function renderCalendar(){
 const y=state.view.getFullYear(),m=state.view.getMonth(),today=new Date(),first=new Date(y,m,1).getDay(),count=new Date(y,m+1,0).getDate(),prevCount=new Date(y,m,0).getDate();
 els.month.textContent=`${y}.${String(m+1).padStart(2,"0")}`;const frag=document.createDocumentFragment();
 for(let i=0;i<42;i++){let num,am=m,out=false;if(i<first){num=prevCount-first+i+1;am--;out=true}else if(i>=first+count){num=i-first-count+1;am++;out=true}else num=i-first+1;
 const dt=new Date(y,am,num),cell=document.createElement("div");cell.className="day-cell";cell.textContent=num;
 if(out)cell.classList.add("out");else if(dt.getDay()===0)cell.classList.add("sun");else if(dt.getDay()===6)cell.classList.add("sat");
 if(dt.toDateString()===today.toDateString())cell.classList.add("today");frag.appendChild(cell)}els.days.replaceChildren(frag)
}
function moveMonth(delta){state.view=new Date(state.view.getFullYear(),state.view.getMonth()+delta,1);renderCalendar()}
function bindEvents(){
 $("#prev").addEventListener("click",()=>moveMonth(-1));$("#next").addEventListener("click",()=>moveMonth(1));
 $("#today").addEventListener("click",()=>{const n=new Date();state.view=new Date(n.getFullYear(),n.getMonth(),1);renderCalendar()});
 els.panel.addEventListener("touchstart",e=>state.touchY=e.touches[0].clientY,{passive:true});
 els.panel.addEventListener("touchend",e=>{if(state.touchY===null)return;const dy=e.changedTouches[0].clientY-state.touchY;if(Math.abs(dy)>CONFIG.swipeThreshold)moveMonth(dy<0?1:-1);state.touchY=null},{passive:true});
 els.panel.addEventListener("wheel",e=>{e.preventDefault();const now=Date.now();if(now-state.lastWheel>CONFIG.wheelCooldown&&Math.abs(e.deltaY)>8){moveMonth(e.deltaY>0?1:-1);state.lastWheel=now}},{passive:false});
 document.querySelectorAll("[data-scene]").forEach(btn=>btn.addEventListener("click",()=>{state.forcedScene=btn.dataset.scene;updateNow()}));
}
function init(){bindEvents();renderCalendar();updateNow();setInterval(updateNow,1000)}
init();
