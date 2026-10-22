/* Огонёк и Капелька — общий движок. Данные этапа: window.STAGE = {id, levels:[...]} */
(()=>{
const T=32,C=25,VW=800,VH=480,S=window.STAGE,LV=S.levels,$=id=>document.getElementById(id);
const cv=$('c'),g=cv.getContext('2d'),statusEl=$('status'),myId=Math.random().toString(36).slice(2,8);
const COL={a:'#ff6b81',b:'#ffd166',c:'#7bed9f',d:'#a29bfe'},CH='abcd';
let client=null,topic='',isHost=false,local=false,play=0,startLv=0,wait=0;
let grid,R=15,lv=0,P=[],hearts=new Set(),tot=0,got=0,score=0,t=0,rst=0,win=0,banner=0;
let act={a:0,b:0,c:0,d:0},lev={},crum={},movers=[],portals={},K={l:0,r:0,u:0},K2={l:0,r:0,u:0};
let cam=0,plat=0,gr=0,camInit=0,lastIn=0,lastState=0,lastSend=0,kLast='';
const stars=[...Array(50)].map(()=>[Math.random()*VW,Math.random()*VH,Math.random()*6]);
const lp=()=>isHost||local?0:1, now=()=>performance.now();

/* ---------- сеть ---------- */
const pub=o=>{if(client&&!local){o.from=myId;client.publish(topic,JSON.stringify(o));}};
function initNet(){
  if(typeof mqtt==='undefined'){statusEl.textContent='Сеть недоступна. Можно играть на одном экране.';return;}
  client=mqtt.connect('wss://broker.hivemq.com:8884/mqtt',{reconnectPeriod:2000});
  client.on('connect',()=>{statusEl.textContent='Подключено! Создай комнату или введи код.';$('btn-host').disabled=$('btn-join').disabled=false;
    const r=new URLSearchParams(location.search).get('r');if(r)$('room-input').value=r;});
  client.on('error',e=>statusEl.textContent='Ошибка сети: '+e);
  client.on('message',(_,m)=>{let d;try{d=JSON.parse(m.toString())}catch(e){return}
    if(d.from===myId)return;
    if(d.type==='join'&&isHost){if(!play){startLv=+$('lv-sel').value;load(startLv)}lastIn=now();pub({type:'start',lv});}
    if(d.type==='start'&&!isHost){load(d.lv);lastState=now();}
    if(d.type==='i'&&isHost){P[1]&&(P[1].ik=d.k);lastIn=now();}
    if(d.type==='restart'&&isHost)load(lv);
    if(d.type==='end'&&!isHost)finish(d.score);
    if(d.type==='s'&&!isHost&&P.length){applyState(d);}
  });
}
function applyState(d){
  lastState=now();if(d.lv!==lv)load(d.lv);
  d.p.forEach((q,i)=>{const p=P[i];p.x=q[0];p.y=q[1];p.f=q[2];p.on=q[3];if(!p.init||Math.hypot(p.x-p.rx,p.y-p.ry)>90){p.rx=p.x;p.ry=p.y;p.init=1}});
  hearts=new Set(d.h);got=d.g;act=d.act;lev=d.lev;rst=d.rst;crum={};d.cr.forEach(([k,s])=>crum[k]={s});
  d.mv.forEach((q,i)=>{if(movers[i]){movers[i].x=q[0];movers[i].y=q[1]}});
}
window.createRoom=()=>{isHost=true;const code=String(1000+Math.floor(Math.random()*9000));topic=`rau_fw2_${S.id}_${code}`;client.subscribe(topic);
  const link=location.origin+location.pathname+'?r='+code;
  statusEl.innerHTML=`Код комнаты: <b>${code}</b><br>Ожидание второго игрока...<br><button class="b2" style="margin-top:8px;padding:6px 12px;font-size:13px" onclick="navigator.clipboard.writeText('${link}')">Скопировать ссылку</button>`;
  $('btn-host').disabled=true;};
window.joinRoom=()=>{const code=$('room-input').value.trim();if(code.length!=4)return alert('Введите 4-значный код комнаты!');
  isHost=false;topic=`rau_fw2_${S.id}_${code}`;client.subscribe(topic);statusEl.textContent='Подключение к комнате...';setTimeout(()=>pub({type:'join'}),300);};
window.playLocal=()=>{local=true;isHost=true;load(+$('lv-sel').value);};

/* ---------- уровень ---------- */
function parse(L){
  if(L.map)return L.map.map(r=>r.padEnd(C,'#').slice(0,C));
  const rows=[];for(let y=0;y<15;y++)rows.push(y==0||y==14?'#'.repeat(C):('#'+(L.m[y]||'')).padEnd(24,'.').slice(0,24)+'#');return rows;
}
function load(i){
  lv=i;const L=LV[i];grid=parse(L).map(r=>[...r]);R=grid.length;
  (L.gt||[]).forEach(([x,c])=>{for(let y=1;y<R-1;y++)if(grid[y][x]=='.')grid[y][x]=c});
  hearts=new Set();P=[];got=0;rst=0;win=0;banner=240;act={a:0,b:0,c:0,d:0};lev={};crum={};portals={};camInit=0;gr=0;
  grid.forEach((r,y)=>r.forEach((c,x)=>{
    if(c=='1'||c=='2'){P[c-1]={x:x*T+6,y:y*T+6,rx:x*T+6,ry:y*T+6,vx:0,vy:0,on:0,f:1,ik:{l:0,r:0,u:0},tp:0,il:'',rm:null};r[x]='.'}
    else if(c=='h'){hearts.add(y*C+x);r[x]='.'}
    else if(c=='P'||c=='Q')(portals[c]=portals[c]||[]).push([x,y]);
  }));
  movers=(L.movers||[]).map(m=>({t:m.t||'patrol',per:m.per||240,ch:m.ch,dx:m.dx||0,dy:m.dy||0,x0:m.x*T,y0:m.y*T,x:m.x*T,y:m.y*T,w:m.w*T,h:12,p:0,mx:0,my:0}));
  tot=hearts.size;play=1;wait=0;lastIn=lastState=now();$('lobby').style.display='none';
  const p=P[lp()];plat=p.y+26;cam=camTarget();
}
const sol=(x,y)=>{if(x<0||x>=C||y<0)return 1;if(y>=R)return 0;const c=grid[y][x];
  return c=='#'||(c=='~'&&!(crum[y*C+x]&&crum[y*C+x].s==2))||('ABCD'.includes(c)&&!act[c.toLowerCase()])};
const hitT=(x,y,w,h)=>{for(let ty=Math.floor(y/T);ty<=Math.floor((y+h-.01)/T);ty++)for(let tx=Math.floor(x/T);tx<=Math.floor((x+w-.01)/T);tx++)if(sol(tx,ty))return[tx,ty];return 0};
const hitM=(x,y,w,h)=>movers.find(m=>x<m.x+m.w&&x+w>m.x&&y<m.y+m.h&&y+h>m.y);
const at=(p,f)=>{for(let ty=Math.floor(p.y/T);ty<=Math.floor((p.y+25)/T);ty++)for(let tx=Math.floor((p.x+2)/T);tx<=Math.floor((p.x+18)/T);tx++)if(f(grid[ty]?.[tx],tx,ty))return 1};

function phys(p,k){
  const w=20,h=26;p.vx=(k.r-k.l)*3.4;if(p.vx)p.f=p.vx>0?1:-1;
  if(k.u&&p.on)p.vy=-11.4;p.vy=Math.min(p.vy+.58,13);
  p.x+=p.vx;let c=hitT(p.x,p.y,w,h);if(c)p.x=p.vx>0?c[0]*T-w-.01:(c[0]+1)*T;
  let m=hitM(p.x,p.y,w,h);if(m)p.x=p.x+w/2<m.x+m.w/2?m.x-w-.01:m.x+m.w;
  const ob=p.y+h;p.y+=p.vy;p.on=0;p.rm=null;
  c=hitT(p.x,p.y,w,h);
  if(c){if(p.vy>0){p.y=c[1]*T-h-.01;p.on=1}else p.y=(c[1]+1)*T;p.vy=0}
  m=hitM(p.x,p.y,w,h);
  if(m){if(p.vy>=0&&ob<=m.y+6){p.y=m.y-h-.01;p.on=1;p.rm=m;p.vy=0}else if(p.vy<0){p.y=m.y+m.h;p.vy=0}}
  if(!p.on&&p.vy>=0){const ty=Math.floor((p.y+h)/T);
    for(let tx=Math.floor(p.x/T);tx<=Math.floor((p.x+w-.01)/T);tx++)if(grid[ty]?.[tx]=='='&&ob<=ty*T+1){p.y=ty*T-h-.01;p.on=1;p.vy=0;break}}
}
const die=()=>{if(!rst)rst=50};

function step(){
  t++;if(!isHost){send();return}
  if(!local&&now()-lastIn>5000){wait=1;return}wait=0;
  P[0].ik=K;if(local)P[1].ik=K2;
  const pl={};P.forEach(p=>at(p,c=>{if(c&&'abcd'.includes(c))pl[c]=1}));
  CH.split('').forEach(c=>act[c]=(pl[c]||lev[c])?1:0);
  // движущиеся платформы + перенос пассажиров
  const riders=P.map(p=>p.rm?movers.indexOf(p.rm):-1);
  movers.forEach(m=>{const ox=m.x,oy=m.y;
    if(m.t=='patrol'){const s=.5-.5*Math.cos(2*Math.PI*t/m.per);m.x=m.x0+m.dx*T*s;m.y=m.y0+m.dy*T*s}
    else{m.p=Math.max(0,Math.min(1,m.p+(act[m.ch]?1:-1)/m.per));m.x=m.x0+m.dx*T*m.p;m.y=m.y0+m.dy*T*m.p}
    m.mx=m.x-ox;m.my=m.y-oy});
  P.forEach((p,i)=>{if(riders[i]>=0){p.x+=movers[riders[i]].mx;p.y+=movers[riders[i]].my}});
  // шатающиеся плитки
  for(const k in crum){const c=crum[k];c.t++;if(c.s==1&&c.t>35){c.s=2;c.t=0}else if(c.s==2&&c.t>200)delete crum[k]}
  P.forEach(p=>{phys(p,p.ik);p.rx=p.x;p.ry=p.y;
    if(p.on){const ty=Math.floor((p.y+27)/T);for(let tx=Math.floor(p.x/T);tx<=Math.floor((p.x+19)/T);tx++)
      if(grid[ty]?.[tx]=='~'&&!crum[ty*C+tx])crum[ty*C+tx]={s:1,t:0}}
    if(p.tp>0)p.tp--;
    const cx=Math.floor((p.x+10)/T),cy=Math.floor((p.y+13)/T),c=grid[cy]?.[cx];
    if('pqrs'.includes(c||'-')){if(p.il!=cx+','+cy){const k=CH['pqrs'.indexOf(c)];lev[k]=lev[k]?0:1;p.il=cx+','+cy}}else p.il='';
    if((c=='P'||c=='Q')&&!p.tp&&portals[c].length==2){const d=portals[c].find(q=>q[0]!=cx||q[1]!=cy);p.x=d[0]*T+6;p.y=d[1]*T+6;p.vy=0;p.tp=60;p.rx=p.x;p.ry=p.y}
  });
  P.forEach((p,i)=>{
    if(!rst&&(at(p,c=>c==(i?'F':'W')||c=='G'||c=='^')||p.y>R*T+60))die();
    at(p,(c,x,y)=>{const k=y*C+x;if(hearts.has(k)){hearts.delete(k);got++}});
  });
  if(rst&&--rst==0)return load(lv);
  const d=i=>at(P[i],c=>c==(i?'w':'f'));
  if(d(0)&&d(1)){if(++win>25){score+=got;if(lv+1<LV.length){load(lv+1);pub({type:'start',lv});}else{pub({type:'end',score});finish(score);}}}else win=0;
  if(!local&&t%3==0)pub({type:'s',lv,p:P.map(p=>[+p.x.toFixed(1),+p.y.toFixed(1),p.f,p.on?1:0]),h:[...hearts],g:got,act,lev,rst,
    cr:Object.entries(crum).map(([k,v])=>[+k,v.s]),mv:movers.map(m=>[+m.x.toFixed(1),+m.y.toFixed(1)])});
  if(banner>0)banner--;
}
function send(){
  if(banner>0)banner--;if(!play||local||!client)return;
  const s=JSON.stringify(K);if(s!==kLast||now()-lastSend>400){kLast=s;lastSend=now();pub({type:'i',k:K})}
  wait=now()-lastState>5000;
}
function finish(sc){play=0;$('lobby').style.display='flex';
  statusEl.innerHTML=`<h1>Этап пройден! 🎉</h1><p>Собрано сердечек: ${sc} ♥</p><a href="game.html">К выбору этапов</a>`;}

/* ---------- камера: только по вертикали, по уровню платформы ---------- */
function camTarget(){const max=Math.max(0,R*T-VH);return Math.min(max,Math.max(0,plat-VH*.62))}
function camUpdate(){
  const p=P[lp()];if(!p)return;const max=Math.max(0,R*T-VH);
  if(p.on){if(++gr>8&&Math.abs(p.ry+26-plat)>6)plat=p.ry+26}else gr=0;   // прыжок не двигает камеру
  cam+=(camTarget()-cam)*.07;
  const sy=p.ry-cam;if(sy<30)cam=p.ry-30;if(sy+26>VH-20)cam=p.ry+6-VH+20;   // страховка при падении
  cam=Math.min(max,Math.max(0,cam));
}

/* ---------- ввод ---------- */
const km={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',KeyA:'l',KeyD:'r',KeyW:'u',Space:'u'};
const setK=(e,v)=>{if(e.code=='KeyR'&&v&&play)return restart();const k=km[e.code];if(!k)return;e.preventDefault();
  (local&&e.code.startsWith('Arrow')?K2:K)[k]=v};
window.onkeydown=e=>setK(e,1);window.onkeyup=e=>setK(e,0);window.onblur=()=>{K.l=K.r=K.u=K2.l=K2.r=K2.u=0};
window.restart=()=>{if(isHost||local)load(lv);else pub({type:'restart'})};
const mvz=$('mv');
const mvSet=e=>{const r=mvz.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;K.l=x<.5?1:0;K.r=x>=.5?1:0};
mvz.onpointerdown=e=>{e.preventDefault();mvz.setPointerCapture(e.pointerId);mvSet(e)};
mvz.onpointermove=e=>{if(e.buttons)mvSet(e)};mvz.onpointerup=mvz.onpointercancel=()=>{K.l=K.r=0};
const jp=$('jp');jp.onpointerdown=e=>{e.preventDefault();jp.setPointerCapture(e.pointerId);K.u=1};jp.onpointerup=jp.onpointercancel=()=>{K.u=0};

/* ---------- рисование ---------- */
const wave=(px,py,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(px,py+T);g.lineTo(px,py+6);for(let i=0;i<=T;i+=4)g.lineTo(px+i,py+6+Math.sin(t/9+(px+i)/9)*2);g.lineTo(px+T,py+T);g.fill()};
function drawWorld(){
  const y0=Math.max(0,Math.floor(cam/T)-1),y1=Math.min(R-1,Math.ceil((cam+VH)/T)+1);
  for(let y=y0;y<=y1;y++)for(let x=0;x<C;x++){
    const c=grid[y][x],px=x*T,py=y*T;
    if(c=='#'){g.fillStyle='#3a2b55';g.fillRect(px,py,T,T);if(grid[y-1]?.[x]!='#'){g.fillStyle='#6b52a0';g.fillRect(px,py,T,5)}}
    else if(c=='W')wave(px,py,'#4cc9f0');else if(c=='F')wave(px,py,'#ff7a45');else if(c=='G')wave(px,py,'#7bed9f');
    else if(c=='='){g.fillStyle='#8a6fd1';g.fillRect(px,py,T,6)}
    else if(c=='~'){const k=crum[y*C+x];if(k&&k.s==2)continue;const sh=k?Math.sin(t*2)*2:0;
      g.fillStyle=k?'#a0603f':'#8a5a3c';g.fillRect(px+sh,py,T,T-4);g.fillStyle='#c98a5b';g.fillRect(px+sh,py,T,5);g.strokeStyle='#5a3825';g.strokeRect(px+sh+2,py+8,T-4,T-14)}
    else if(c=='^'){g.fillStyle='#dfe6e9';for(let i=0;i<3;i++){g.beginPath();g.moveTo(px+i*10.6,py+T);g.lineTo(px+i*10.6+5.3,py+10);g.lineTo(px+i*10.6+10.6,py+T);g.fill()}}
    else if('ABCD'.includes(c)){const o=act[c.toLowerCase()];g.fillStyle=COL[c.toLowerCase()];g.globalAlpha=o?.18:.95;g.fillRect(px+4,py,6,T);g.fillRect(px+22,py,6,T);g.fillRect(px+4,py+13,24,6);g.globalAlpha=1}
    else if('abcd'.includes(c)){g.fillStyle=COL[c];g.fillRect(px+4,py+T-(act[c]?4:8),24,act[c]?4:8)}
    else if('pqrs'.includes(c)){const k=CH['pqrs'.indexOf(c)],on=lev[k];g.fillStyle='#57606f';g.fillRect(px+8,py+T-6,16,6);
      g.strokeStyle=COL[k];g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(px+16,py+T-6);g.lineTo(px+16+(on?10:-10),py+T-22);g.stroke();g.lineCap='butt'}
    else if(c=='P'||c=='Q'){g.strokeStyle=c=='P'?'#c56cf0':'#18dcff';g.lineWidth=3;for(let i=0;i<3;i++){g.beginPath();g.ellipse(px+16,py+16,6+i*4+Math.sin(t/8+i)*1.5,11+i*2,0,0,7);g.stroke()}}
    else if(c=='f'||c=='w'){const col=c=='f'?'#ff7a45':'#4cc9f0';g.fillStyle=col+'44';g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.roundRect(px+3,py-T+4,T-6,2*T-4,[14,14,2,2]);g.fill();g.stroke()}
  }
  g.fillStyle='#8f7bd6';movers.forEach(m=>{g.beginPath();g.roundRect(m.x,m.y,m.w,m.h+2,4);g.fill()});
  g.font='bold 22px sans-serif';g.textAlign='center';g.fillStyle='#ff6b81';
  hearts.forEach(k=>g.fillText('♥',(k%C)*T+16,Math.floor(k/C)*T+24+Math.sin(t/12+k)*3));
  P.forEach((p,i)=>{if(!isHost){p.rx+=(p.x-p.rx)*.5;p.ry+=(p.y-p.ry)*.5}
    const x=p.rx+10,y=p.ry+15;g.fillStyle=i?'#4cc9f0':'#ff7a45';g.beginPath();
    if(i){g.moveTo(x,y-17);g.bezierCurveTo(x+16,y-2,x+12,y+13,x,y+13);g.bezierCurveTo(x-12,y+13,x-16,y-2,x,y-17)}
    else{g.arc(x,y+2,12,0,7);g.moveTo(x-10,y-2);g.quadraticCurveTo(x-9,y-13,x,y-19+Math.sin(t/5)*2);g.quadraticCurveTo(x+9,y-13,x+10,y-2)}
    g.fill();g.fillStyle='#fff';[-4.5,4.5].forEach(d=>{g.beginPath();g.arc(x+d,y+1,3.3,0,7);g.fill()});
    g.fillStyle='#1b1530';[-4.5,4.5].forEach(d=>{g.beginPath();g.arc(x+d+p.f*1.2,y+1.5,1.7,0,7);g.fill()})});
}
function draw(){
  const bg=g.createLinearGradient(0,0,0,VH);bg.addColorStop(0,'#1d1638');bg.addColorStop(1,'#2d1b45');g.fillStyle=bg;g.fillRect(0,0,VW,VH);
  g.fillStyle='#fff';stars.forEach(s=>{g.globalAlpha=.25+.25*Math.sin(t/30+s[2]);g.fillRect(s[0],s[1],2,2)});g.globalAlpha=1;
  if(!grid||!P.length)return;
  if(play&&!wait)camUpdate();
  g.save();g.translate(0,-Math.round(cam));drawWorld();g.restore();
  const q=P[1-lp()];if(q){const sy=q.ry-cam;g.fillStyle=lp()?'#ff7a45':'#4cc9f0';g.textAlign='center';g.font='700 20px sans-serif';
    if(sy<-10)g.fillText('▲',q.rx+10,22);else if(sy>VH)g.fillText('▼',q.rx+10,VH-8)}
  g.textAlign='left';g.font='700 16px Fredoka,sans-serif';g.fillStyle='#ffffffaa';g.fillText(`Этап ${S.id} · ${lv+1}/${LV.length}  ♥ ${got}/${tot}`,12,22);
  if(banner>0){g.globalAlpha=Math.min(1,banner/40);g.textAlign='center';g.fillStyle='#fff';g.font='700 28px Fredoka,sans-serif';g.fillText(LV[lv].n,400,65);
    g.font='500 16px Fredoka,sans-serif';g.fillStyle='#e6d9f2';g.fillText(LV[lv].s,400,92);g.globalAlpha=1}
  if(rst||wait){g.fillStyle='rgba(18,15,29,.7)';g.fillRect(0,0,VW,VH);g.fillStyle='#fff';g.textAlign='center';g.font='700 30px Fredoka,sans-serif';
    g.fillText(wait?'Нет связи с напарником…':'Чужая стихия! Ещё раз',400,250)}
}
let last=0,acc=0;
function loop(n){requestAnimationFrame(loop);acc+=Math.min(n-last,100);last=n;while(acc>=16.667){acc-=16.667;if(play)step()}draw()}
window.__dbg={get:()=>({P,grid,cam,plat,act,lev,crum,movers,rst,lv,got,hearts:[...hearts]}),load,step,K,K2,setLocal:()=>{local=true;isHost=true}};
const sel=$('lv-sel');LV.forEach((L,i)=>sel.add(new Option(L.n,i)));
initNet();requestAnimationFrame(loop);
})();
