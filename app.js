
const $=s=>document.querySelector(s);
const world=$("#world"),days=$("#days"),month=$("#month"),panel=$("#calendarPanel");
let d=new Date(),view=new Date(d.getFullYear(),d.getMonth(),1),forced="auto";
const pad=n=>String(n).padStart(2,"0");
function period(h){return h>=5&&h<9?"morning":h>=9&&h<16?"day":h>=16&&h<19?"evening":"night"}
function tick(){
 const n=new Date(), w=["日","月","火","水","木","金","土"], p=forced==="auto"?period(n.getHours()):forced;
 $("#clock").textContent=`${pad(n.getHours())}:${pad(n.getMinutes())}`;
 $("#date").textContent=`${n.getFullYear()}年 ${n.getMonth()+1}月 ${n.getDate()}日（${w[n.getDay()]}）`;
 world.className="world "+p;
 const text={
  morning:["Good morning,","今日もゆっくり。","おはよう..."],
  day:["Good afternoon,","ひとやすみも大事。","のんびりいこう"],
  evening:["Good evening,","おつかれさま。","おつかれさま..."],
  night:["Good night,","ゆっくりすごそう。","ねむい... Zzz"]
 }[p];
 $("#greeting").innerHTML=text[0]+"<br><span>"+text[1]+"</span>";
 $("#bubble").textContent=text[2];
}
function render(){
 const y=view.getFullYear(),m=view.getMonth(),today=new Date(),first=new Date(y,m,1).getDay(),count=new Date(y,m+1,0).getDate(),prevCount=new Date(y,m,0).getDate();
 month.textContent=`${y}.${pad(m+1)}`; days.innerHTML="";
 for(let i=0;i<42;i++){
  let num,actualMonth=m,out=false;
  if(i<first){num=prevCount-first+i+1;actualMonth--;out=true}
  else if(i>=first+count){num=i-first-count+1;actualMonth++;out=true}
  else num=i-first+1;
  const dt=new Date(y,actualMonth,num),cell=document.createElement("div");
  cell.className="day-cell";cell.textContent=num;
  if(out)cell.classList.add("out"); else if(dt.getDay()===0)cell.classList.add("sun"); else if(dt.getDay()===6)cell.classList.add("sat");
  if(dt.toDateString()===today.toDateString())cell.classList.add("today");
  days.appendChild(cell);
 }
}
function move(n){view=new Date(view.getFullYear(),view.getMonth()+n,1);render()}
$("#prev").onclick=()=>move(-1);$("#next").onclick=()=>move(1);
$("#today").onclick=()=>{const n=new Date();view=new Date(n.getFullYear(),n.getMonth(),1);render()};
let startY=null,lastWheel=0;
panel.addEventListener("touchstart",e=>startY=e.touches[0].clientY,{passive:true});
panel.addEventListener("touchend",e=>{if(startY===null)return;const dy=e.changedTouches[0].clientY-startY;if(Math.abs(dy)>35)move(dy<0?1:-1);startY=null},{passive:true});
panel.addEventListener("wheel",e=>{e.preventDefault();const now=Date.now();if(now-lastWheel>450&&Math.abs(e.deltaY)>8){move(e.deltaY>0?1:-1);lastWheel=now}},{passive:false});
document.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>{forced=b.dataset.scene;tick()});
tick();render();setInterval(tick,1000);
