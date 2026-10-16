/* produkts.it — script comune della bozza. Generato da _design/bozza/build.py (non modificare bozza/assets/site.js a mano). */
(function(){
var d=document,w=window,h=d.documentElement;
var still=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Intro del logo: la classe html.intro la decide lo script in <head> (solo ingresso e ricarica) */
function intro(){
  if(!h.classList.contains('intro'))return;
  var l=d.createElement('div');l.className='loader';l.setAttribute('aria-hidden','true');
  l.innerHTML=__LOADER_SVG__;
  d.body.appendChild(l);
  var done=false;
  function end(){if(done)return;done=true;l.classList.add('out');h.classList.remove('intro');
    setTimeout(function(){l.remove()},1100)}
  setTimeout(end,3000);
  l.addEventListener('click',end);
  w.addEventListener('keydown',end,{once:true});
}

/* Cursore custom (stesso di _design/wip/cursor.js) */
__CURSOR__

/* Orologio con timecode: ora locale di Altamura (Europe/Rome), frame a 24 fps, come nella pagina WIP. Va nell'intestazione di ogni pagina. */
function clock(){
  /* Anche le pagine con due stati (galleria: accesso e foto) hanno un'intestazione per stato: orologio in tutte */
  d.querySelectorAll('header').forEach(function(hh){clockIn(hh.querySelector(':scope > div')||hh)});
}
function clockIn(hd){
  var el=d.createElement('div');el.className='pk-clock';el.title='Ora locale ad Altamura';
  el.innerHTML='<i aria-hidden="true"></i><span>Altamura</span><span class="t" aria-label="Ora locale ad Altamura">--:--:--:--</span>';
  var mb=hd.querySelector('.mb');
  if(mb)hd.insertBefore(el,mb);else hd.appendChild(el);
  hd.classList.add('pk-hdr');
  var t=el.querySelector('.t'),fmt=null;
  try{fmt=new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})}catch(e){}
  function p(n){return (n<10?'0':'')+n}
  function tick(){
    var now=new Date(),hh,mm,ss;
    if(fmt&&fmt.formatToParts){fmt.formatToParts(now).forEach(function(x){if(x.type==='hour')hh=x.value;else if(x.type==='minute')mm=x.value;else if(x.type==='second')ss=x.value})}
    else{hh=p(now.getHours());mm=p(now.getMinutes());ss=p(now.getSeconds())}
    t.textContent=hh+':'+mm+':'+ss+':'+(still?'00':p(Math.floor(now.getMilliseconds()/(1000/24))));
  }
  tick();setInterval(tick,still?1000:1000/24);
}

/* Menu a schermo intero */
var ITEMS=[
  ['01','Home','./','home','[ Showreel ]'],
  ['02','Lavori','lavori','lavori','[ Fotogramma da un lavoro ]'],
  ['03','Chi sono','chi-sono','chisono','[ Ritratto sul set ]'],
  ['04','Recensioni','recensioni','recensioni','[ Una frase da una recensione ]'],
  ['05','Contatti','contatti','contatti','[ Dietro le quinte ]']
];
var LOGO='<a href="./" style="color: #E8E4DF; text-decoration: none; font-family: \'Cormorant Garamond\', serif; font-style: italic; font-weight: 300; font-size: 30px">produkts<span style="font-style: normal; opacity: 0.5">.it</span></a>';
function menu(){
  var btn=d.querySelector('.mb');if(!btn)return;
  var cur=d.body.getAttribute('data-page')||'';
  var curItem=ITEMS.filter(function(it){return it[3]===cur})[0]||ITEMS[0];
  var mo=null,t=null,lastFocus=null;
  function links(){
    return ITEMS.map(function(it,i){
      var on=it[3]===cur;
      return '<a href="'+it[2]+'" class="ml" data-pv="'+it[4]+'" style="display: flex; align-items: baseline; gap: 24px; padding: 2px 0; color: #E8E4DF; text-decoration: none; animation-delay: '+(0.35+i*0.06).toFixed(2)+'s"'+(on?' aria-current="page"':'')+'>'
        +'<span style="font-size: 12px; color: #6E6A64; letter-spacing: 0.1em; width: 28px; flex: none">'+it[0]+'</span>'
        +'<span class="mt" style="font-family: \'Cormorant Garamond\', serif; font-style: italic; font-weight: 300; font-size: clamp(44px, 6.2vw, 92px); line-height: 1.06; color: '+(on?'#E8E4DF':'#B8B2AA')+'">'+it[1]+'</span>'
        +(on?'<span aria-hidden="true" style="width: 8px; height: 8px; border-radius: 50%; background: #B46428; align-self: center; flex: none"></span>':'')
        +'</a>';
    }).join('');
  }
  function open(){
    if(mo)return;
    lastFocus=d.activeElement;
    mo=d.createElement('div');mo.className='mo';
    mo.setAttribute('role','dialog');mo.setAttribute('aria-modal','true');mo.setAttribute('aria-label','Menu');
    mo.style.cssText='position: fixed; inset: 0; z-index: 80; background: #0B0B0B; display: flex; flex-direction: column; overflow-y: auto';
    mo.innerHTML='<div style="width: 100%; max-width: 1440px; margin: 0 auto; padding: 28px 56px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 24px">'+LOGO
      +'<button type="button" class="mx" aria-label="Chiudi il menu" style="height: 48px; padding: 0; background: transparent; border: 0; color: #E8E4DF; display: flex; align-items: center; gap: 14px; cursor: pointer; font-family: \'Space Grotesk\', sans-serif; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase">Chiudi<span aria-hidden="true" style="position: relative; width: 28px; height: 28px; display: block"><span class="x1" style="position: absolute; left: 0; top: 14px; width: 28px; height: 1px; background: #E8E4DF; transform: rotate(45deg)"></span><span class="x2" style="position: absolute; left: 0; top: 14px; width: 28px; height: 1px; background: #B46428; transform: rotate(-45deg)"></span></span></button></div>'
      +'<div style="flex: 1; width: 100%; max-width: 1440px; margin: 0 auto; padding: 24px 56px 40px; box-sizing: border-box; display: flex; flex-wrap: wrap; align-items: center; gap: 48px 96px">'
      +'<nav aria-label="Principale" style="flex: 999 1 520px; display: flex; flex-direction: column">'+links()+'</nav>'
      +'<div class="mfade" style="flex: 1 1 340px; max-width: 520px; display: flex; flex-direction: column; gap: 16px">'
      +'<div style="position: relative; aspect-ratio: 4 / 5; background: #161616; display: flex; align-items: flex-end; padding: 20px; box-sizing: border-box">'
      +'<span aria-hidden="true" style="position: absolute; top: 16px; left: 16px; width: 28px; height: 28px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>'
      +'<span aria-hidden="true" style="position: absolute; bottom: 16px; right: 16px; width: 28px; height: 28px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span>'
      +'<span class="pv" style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6E6A64">'+curItem[4]+'</span></div>'
      +'<span style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #9A948C">Frame the Future</span></div></div>'
      +'<div class="mfade" style="width: 100%; max-width: 1440px; margin: 0 auto; padding: 0 56px 32px; box-sizing: border-box">'
      +'<div style="border-top: 1px solid #1F1F1F; padding-top: 20px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px 32px; font-size: 13px; color: #9A948C">'
      +'<div style="display: flex; flex-wrap: wrap; gap: 8px 32px">'
      +'<a href="https://wa.me/393711444875?text=Ciao%20Karim%2C%20ti%20scrivo%20dal%20sito%20produkts.it%3A%20" target="_blank" rel="noopener" style="color: #E8E4DF; text-decoration: none; padding: 8px 0">WhatsApp</a>'
      +'<a href="mailto:info@produkts.it" style="color: #E8E4DF; text-decoration: none; padding: 8px 0">info@produkts.it</a>'
      +'<a href="https://www.instagram.com/produkts.it/" target="_blank" rel="noopener" style="color: #E8E4DF; text-decoration: none; padding: 8px 0">Instagram</a>'
      +'<a href="https://www.youtube.com/@produkts-it" target="_blank" rel="noopener" style="color: #E8E4DF; text-decoration: none; padding: 8px 0">YouTube</a>'
      +'</div><span style="padding: 8px 0">Altamura (BA) · Puglia</span></div></div>';
    d.body.appendChild(mo);
    h.classList.add('menu-open');
    btn.setAttribute('aria-expanded','true');
    var pv=mo.querySelector('.pv');
    mo.querySelectorAll('.ml').forEach(function(a){
      function show(){var nv=pv.cloneNode(false);nv.textContent=a.getAttribute('data-pv');pv.replaceWith(nv);pv=nv}
      a.addEventListener('mouseenter',show);a.addEventListener('focus',show);
    });
    mo.querySelector('.mx').addEventListener('click',close);
    mo.querySelector('.mx').focus();
  }
  function close(){
    if(!mo||mo.classList.contains('closing'))return;
    mo.classList.add('closing');
    var m=mo;clearTimeout(t);
    t=setTimeout(function(){m.remove();if(mo===m)mo=null;h.classList.remove('menu-open');btn.setAttribute('aria-expanded','false');if(lastFocus)lastFocus.focus()},still?0:600);
  }
  btn.addEventListener('click',function(){mo?close():open()});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&mo)close()});
}

/* Azioni dichiarate nell'HTML con data-act="nome:argomento"; le pagine registrano i gestori in PK.acts */
var PK=w.PK=w.PK||{acts:{}};
PK.still=still;
/* Cambio di stato animato con View Transition, senza muovere tutta la pagina */
PK.vt=function(fn){
  if(!d.startViewTransition||still){fn();return}
  h.classList.add('vt-local');
  var v=d.startViewTransition(fn);
  v.ready.catch(function(){});v.updateCallbackDone.catch(function(){});
  var done=function(){h.classList.remove('vt-local')};v.finished.then(done,done);
};
function acts(){
  d.addEventListener('click',function(e){
    var el=e.target.closest&&e.target.closest('[data-act]');if(!el)return;
    var s=el.getAttribute('data-act'),i=s.indexOf(':'),name=i<0?s:s.slice(0,i),arg=i<0?'':s.slice(i+1);
    var f=PK.acts[name];if(f){e.preventDefault();f(arg,el,e)}
  });
  d.addEventListener('change',function(e){
    var el=e.target.closest&&e.target.closest('[data-act-change]');if(!el)return;
    var f=PK.acts[el.getAttribute('data-act-change')];if(f)f(el.value,el,e);
  });
}

/* Carosello dei fotogrammi */
PK.acts.carPrev=function(a,el){var t=el.closest('section').querySelector('.car-track');t.scrollBy({left:-t.clientWidth-16,behavior:still?'auto':'smooth'})};
PK.acts.carNext=function(a,el){var t=el.closest('section').querySelector('.car-track');t.scrollBy({left:t.clientWidth+16,behavior:still?'auto':'smooth'})};

intro();
pkCursor();
clock();
menu();
acts();
})();
