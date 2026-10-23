/* Хэллоуин-атмосфера: призрак, паутина, паук, лицо из тьмы, летающие анимированные существа */
(function(){
  if(window.__spooky)return;window.__spooky=1;
  const N='https://fonts.gstatic.com/s/e/notoemoji/latest/';
  const em=(c,s)=>`<img src="${N}${c}/512.gif" width="${s}" height="${s}" alt="" draggable="false" onerror="this.outerHTML='<span style=\\'font-size:${s*.8}px\\'>'+String.fromCodePoint(0x${c})+'</span>'">`;
  const css=document.createElement('style');
  css.textContent=`
  .sp-web{position:fixed;top:0;width:220px;height:220px;z-index:8400;pointer-events:none;opacity:.5}
  .sp-web.l{left:0}.sp-web.r{right:0;transform:scaleX(-1)}
  .sp-thread{position:fixed;top:0;left:160px;width:1.5px;background:#d8d8e8;z-index:8401;pointer-events:none;height:50px;animation:spDrop 6s ease-in-out infinite}
  .sp-thread div{position:absolute;left:50%;bottom:-26px;transform:translateX(-50%)}
  @keyframes spDrop{50%{height:170px}}
  .sp-ghost{position:fixed;left:6px;bottom:6px;width:100px;z-index:8600;cursor:pointer;animation:spFloat 3.2s ease-in-out infinite;filter:drop-shadow(0 0 16px rgba(255,255,255,.6))}
  @keyframes spFloat{50%{transform:translateY(-14px)}}
  .sp-ghost .arm{transform-origin:24px 60px;animation:spWave 1s ease-in-out infinite}
  @keyframes spWave{50%{transform:rotate(-40deg)}}
  .sp-ghost .eye{animation:spBlink 4s infinite;transform-box:fill-box;transform-origin:center}
  @keyframes spBlink{94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}
  .sp-say{position:fixed;left:112px;bottom:90px;background:#fff;color:#222;padding:8px 14px;border-radius:16px;font:700 15px Nunito,sans-serif;z-index:8601;display:none;max-width:60vw}
  .sp-face{position:fixed;bottom:0;right:4vw;width:min(62vw,360px);z-index:8500;pointer-events:none;opacity:0;mix-blend-mode:screen;transform:translateY(100%)}
  .sp-face img{width:100%;display:block;filter:contrast(1.5) brightness(1.5)}
  .sp-face.go{animation:spFace 6.5s ease-in-out}
  @keyframes spFace{0%{opacity:0;transform:translateY(100%)}30%{opacity:.85;transform:translateY(8%)}34%{opacity:.2}38%{opacity:.9}65%{opacity:.9;transform:translateY(-2%) scale(1.04)}100%{opacity:0;transform:translateY(60%)}}
  .sp-fly{position:fixed;left:0;z-index:8300;cursor:pointer;animation:spFly var(--d,9s) linear forwards;will-change:transform}
  @keyframes spFly{from{transform:translate(-15vw,0)}50%{transform:translate(55vw,var(--y,-50px))}to{transform:translate(115vw,calc(var(--y,-50px)*-.5))}}
  .sp-flash{position:fixed;inset:0;background:#cfd8ff;opacity:0;z-index:8700;pointer-events:none}
  .sp-flash.go{animation:spFl .6s}
  @keyframes spFl{8%{opacity:.3}20%{opacity:0}35%{opacity:.2}100%{opacity:0}}`;
  document.head.appendChild(css);
  const web='<svg class="sp-web %s" viewBox="0 0 200 200" fill="none" stroke="#e8e8f0" stroke-width="1"><path d="M0 0H200M0 0L190 70M0 0L150 150M0 0L70 190M0 0V200"/><path d="M40 0Q30 30 0 40M80 0Q60 60 0 80M120 0Q90 90 0 120M160 0Q120 120 0 160"/></svg>';
  const box=document.createElement('div');
  box.innerHTML=web.replace('%s','l')+web.replace('%s','r')+
  `<div class="sp-thread"><div>${em('1f577',44)}</div></div>
   <div class="sp-face" id="spFace"><img src="ghost_face.png" alt=""></div><div class="sp-flash" id="spFlash"></div>
   <div class="sp-say" id="spSay"></div>
   <svg class="sp-ghost" id="spGhost" viewBox="0 0 100 110"><path d="M20 100V45C20 15 80 15 80 45V100L70 92L60 100L50 92L40 100L30 92Z" fill="#fff"/><g class="arm"><path d="M24 60Q6 52 8 36" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"/></g><path d="M76 62Q90 70 90 80" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"/><ellipse class="eye" cx="40" cy="45" rx="5" ry="7" fill="#222"/><ellipse class="eye" cx="60" cy="45" rx="5" ry="7" fill="#222"/><ellipse cx="50" cy="64" rx="6" ry="8" fill="#222"/></svg>`;
  document.body.appendChild(box);
  const $=id=>document.getElementById(id),say=$('spSay');
  const words=['Бу! 👻 С Хэллоуином!','Я не страшный, я милый 🥺','Ты сегодня очаровательна 🎃','Угости конфеткой 🍬','Тссс… за тобой кто-то смотрит 👀'];
  $('spGhost').onclick=()=>{say.textContent=words[Math.floor(Math.random()*words.length)];say.style.display='block';setTimeout(()=>say.style.display='none',2400)};
  const run=(el,c)=>{el.classList.remove(c);void el.offsetWidth;el.classList.add(c)};
  const codes=['1f987','1f47b','1f383','1f480','1f9db','1f9d9','1f9df','1f987'];
  function fly(){const c=codes[Math.floor(Math.random()*codes.length)],e=document.createElement('div');e.className='sp-fly';
    e.style.top=(8+Math.random()*55)+'vh';e.style.setProperty('--y',(Math.random()*160-80)+'px');e.style.setProperty('--d',(7+Math.random()*5)+'s');
    e.innerHTML=em(c,64);e.onclick=()=>{e.style.transition='.4s';e.style.opacity=0;e.style.scale='2';setTimeout(()=>e.remove(),400)};
    document.body.appendChild(e);setTimeout(()=>e.remove(),12500)}
  setTimeout(fly,1500);setInterval(fly,6500);
  setTimeout(()=>run($('spFace'),'go'),4000);setInterval(()=>run($('spFace'),'go'),28000);
  setInterval(()=>run($('spFlash'),'go'),21000);
})();
