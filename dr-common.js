    const part1 = "8818384063:";
    const part2 = "AAEEqTup6sgED-gYB_1tm";
    const part3 = "cQKcXwi-UDE3lQ";
    const BOT_TOKEN = part1 + part2 + part3;
    const CHAT_ID = "606061445";

    function sendTelegramNotification(text) {
      if (localStorage.getItem('is_sultan') === 'true') return;
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=HTML`).catch(() => {});
    }

const AGE=n=>{let a=n.getFullYear()-2003;if(n<new Date(n.getFullYear(),2,4))a--;return a};
const tg=t=>{try{sendTelegramNotification(t)}catch(e){}};
const NAV=p=>`<a href="index.html" class="back">← На главную</a><nav>${[['dr.html','🎂 Поздравление'],['dr-play.html','🎮 Игры и планы'],['dr-story.html','📖 Наша история']].map(([h,t])=>`<a href="${h}" class="${h==p?'on':''}">${t}</a>`).join('')}</nav>`;
// конфетти + плавающие шарики и сердечки
const fx=document.createElement('canvas');fx.id='fx';document.body.appendChild(fx);const X=fx.getContext('2d');let W,H,ps=[];
const rs=()=>{W=fx.width=innerWidth;H=fx.height=innerHeight};rs();addEventListener('resize',rs);
const CL=['#ff6b9d','#ffd166','#7bed9f','#74b9ff','#a29bfe','#ff9f43'],EM=window.AMB||['🎈','💖','✨','🎀','💗'];
const fl=[...Array(16)].map(()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,v:.3+Math.random()*.6,e:EM[Math.floor(Math.random()*5)],s:14+Math.random()*16,p:Math.random()*6}));
window.confetti=(x=W/2,y=H/3,n=90)=>{for(let i=0;i<n;i++){const a=Math.random()*6.28,v=3+Math.random()*7;ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-5,c:CL[i%6],s:4+Math.random()*5,r:Math.random()*6,l:130+Math.random()*60})}};
(function loop(t=0){X.clearRect(0,0,W,H);X.globalAlpha=.3;fl.forEach(f=>{f.y-=f.v;f.x+=Math.sin(t/900+f.p)*.4;if(f.y<-30){f.y=H+30;f.x=Math.random()*W}X.font=f.s+'px serif';X.fillText(f.e,f.x,f.y)});X.globalAlpha=1;
 ps=ps.filter(p=>p.l-->0);ps.forEach(p=>{p.vy+=.18;p.x+=p.vx;p.y+=p.vy;p.vx*=.99;p.r+=.2;X.fillStyle=p.c;X.globalAlpha=Math.min(1,p.l/40);X.save();X.translate(p.x,p.y);X.rotate(p.r);X.fillRect(-p.s/2,-p.s/3,p.s,p.s/1.6);X.restore()});X.globalAlpha=1;requestAnimationFrame(loop)})();
document.addEventListener('click',e=>{if(e.target.closest('a'))return;});
