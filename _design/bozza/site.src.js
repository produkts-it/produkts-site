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

/* Menu a schermo intero. Ultimo campo: il frame a destra (img, video con poster, frase da una recensione);
   senza frame resta la scritta segnaposto. */
var ITEMS=[
  ['01','Home','./','home','[ Showreel ]',{img:'img/menu/home.jpg',alt:'Locandina di Dynamis'}],
  ['02','Lavori','lavori','lavori','[ Fotogramma da un lavoro ]',{img:'img/menu/lavori.webp',alt:'Karim sul red carpet del VerticalMovie alla Casa del Cinema di Roma'}],
  ['03','Chi sono','chi-sono','chisono','[ Ritratto sul set ]',{video:'img/menu/chi-sono.mp4',img:'img/menu/chi-sono.jpg',alt:'Karim alla camera sul set'}],
  ['04','Recensioni','recensioni','recensioni','[ Una frase da una recensione ]',{frase:'Scatti straordinari che catturano emozioni uniche. Consigliato!',nome:'Pietro G.'}],
  ['05','Contatti','contatti','contatti','[ Dietro le quinte ]',{img:'img/menu/contatti.jpg',alt:'Karim dentro un armadio sul set di Dynamis'}]
];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function frameEl(it){
  var f=it[5],el=d.createElement('div');el.className='pvf';
  if(f&&f.frase){el.innerHTML='<blockquote><p>«'+esc(f.frase)+'»</p><footer>'+esc(f.nome)+'</footer></blockquote>'}
  else if(f&&f.video&&!still){el.innerHTML='<video muted loop playsinline autoplay preload="auto" poster="'+f.img+'" aria-label="'+esc(f.alt)+'"><source src="'+f.video+'" type="video/mp4"></video>';
    var v=el.firstChild;v.muted=true;var p=v.play&&v.play();if(p&&p.catch)p.catch(function(){})}
  else if(f&&f.img){el.innerHTML='<img src="'+f.img+'" alt="'+esc(f.alt)+'">'}
  else{el.style.cssText='display: flex; align-items: flex-end; padding: 20px';el.innerHTML='<span style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6E6A64">'+esc(it[4])+'</span>'}
  return el;
}
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
      +'<div class="pvbox" style="position: relative; aspect-ratio: 4 / 5; background: #161616; overflow: hidden">'
      +'<span class="pvf"></span>'
      +'<span aria-hidden="true" style="position: absolute; z-index: 1; top: 16px; left: 16px; width: 28px; height: 28px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>'
      +'<span aria-hidden="true" style="position: absolute; z-index: 1; bottom: 16px; right: 16px; width: 28px; height: 28px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span></div>'
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
    /* Precarica le immagini dei frame, così passando sulle voci compaiono subito */
    ITEMS.forEach(function(it){if(it[5]&&it[5].img)(new Image()).src=it[5].img});
    var pv=mo.querySelector('.pvf'),shown=null;
    function show(it){if(it===shown)return;shown=it;var nv=frameEl(it);pv.replaceWith(nv);pv=nv}
    show(curItem);
    mo.querySelectorAll('.ml').forEach(function(a,i){
      function on(){show(ITEMS[i])}
      a.addEventListener('mouseenter',on);a.addEventListener('focus',on);
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
  if(!d.startViewTransition||still||d.visibilityState==='hidden'){fn();return}
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

/* Moduli (Contatti, Recensioni): invio alle API di Cloudflare Pages con anti-spam Turnstile */
/* Chiave pubblica del widget Turnstile (pannello Cloudflare > Turnstile). Vuota = nessun widget (anteprima locale). */
PK.TURNSTILE_KEY='0x4AAAAAAFYX7kR7bEUJ9EOy';
var tsLoad=null;
PK.turnstile=function(box){
  if(!PK.TURNSTILE_KEY||!box)return function(){return ''};
  var id=null;
  tsLoad=tsLoad||new Promise(function(ok){w.pkTsReady=ok;var s=d.createElement('script');
    s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=pkTsReady';s.async=true;d.head.appendChild(s)});
  tsLoad.then(function(){id=w.turnstile.render(box,{sitekey:PK.TURNSTILE_KEY,theme:'dark',language:'it'})});
  return function(){return id!==null&&w.turnstile?w.turnstile.getResponse(id)||'':''};
};
PK.turnstileReset=function(box){if(w.turnstile&&box&&box.firstChild)try{w.turnstile.reset(box.firstChild)}catch(e){}};
/* POST JSON; restituisce {ok:true} oppure {errore:'...'} con un messaggio da mostrare */
PK.invia=function(url,dati){
  return fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(dati)})
    .then(function(r){return r.json().catch(function(){return {}}).then(function(j){
      if(r.ok&&j.ok)return {ok:true};
      if(r.status===404||r.status===405)return {errore:'Il modulo non è ancora attivo. Scrivimi su WhatsApp o a info@produkts.it.'};
      return {errore:j.errore||'Qualcosa non ha funzionato, riprova tra poco.'}})})
    .catch(function(){return {errore:'Connessione non riuscita, riprova tra poco.'}});
};

/* Campo "Dove": suggerimenti dai comuni italiani (elenco ISTAT in assets/comuni.json, caricato al primo uso).
   Si può sempre scrivere altro (una location, una città estera). */
var VICINI={BA:1,BT:1,MT:1,TA:1,BR:1,LE:1,FG:1};
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/['’`\-]/g,' ').replace(/\s+/g,' ').trim()}
PK.luoghi=function(input){
  if(!input)return;
  var box=input.parentNode,lista=null,dati=null,carica=null,sel=-1,trovati=[],uid='pk-luoghi-'+Math.random().toString(36).slice(2,7);
  box.classList.add('pk-ac');
  var ul=d.createElement('ul');ul.className='pk-ac-list';ul.id=uid;ul.setAttribute('role','listbox');ul.hidden=true;box.appendChild(ul);
  input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');
  input.setAttribute('aria-controls',uid);input.setAttribute('autocomplete','off');
  function prendi(){
    carica=carica||fetch('assets/comuni.json').then(function(r){return r.json()}).then(function(j){
      dati=j.map(function(c){return {n:c[0],p:c[1],cap:c[2],k:norm(c[0])}});}).catch(function(){dati=[]});
    return carica;
  }
  function chiudi(){ul.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');sel=-1}
  function scegli(i){var c=trovati[i];if(!c)return;input.value=c.n+' ('+c.p+')';chiudi()}
  function evidenzia(i){
    sel=i;[].forEach.call(ul.children,function(li,j){li.setAttribute('aria-selected',j===i)});
    if(i>=0){input.setAttribute('aria-activedescendant',uid+'-'+i);ul.children[i].scrollIntoView({block:'nearest'})}
  }
  function cerca(){
    var q=norm(input.value);
    if(q.length<2||!dati){chiudi();return}
    /* prima chi inizia con il testo, poi chi ha una parola che inizia così, poi chi lo contiene; a parità: Puglia e Matera, capoluoghi, ordine alfabetico */
    var res=[];
    for(var i=0;i<dati.length;i++){var c=dati[i],t=c.k.indexOf(q);if(t<0)continue;
      var liv=t===0?0:(c.k.charAt(t-1)===' '?1:2);res.push({c:c,s:liv*10+(VICINI[c.p]?0:2)+(c.cap?0:1)})}
    res.sort(function(a,b){return a.s-b.s||a.c.n.localeCompare(b.c.n,'it')});
    trovati=res.slice(0,7).map(function(r){return r.c});
    if(!trovati.length){chiudi();return}
    ul.innerHTML='';
    trovati.forEach(function(c,i){
      var li=d.createElement('li');li.id=uid+'-'+i;li.setAttribute('role','option');li.setAttribute('aria-selected','false');
      var nome=d.createElement('span');nome.textContent=c.n;var pr=d.createElement('span');pr.className='pk-ac-p';pr.textContent=c.p;
      li.appendChild(nome);li.appendChild(pr);
      li.addEventListener('mousedown',function(e){e.preventDefault();scegli(i)});
      ul.appendChild(li);
    });
    ul.hidden=false;input.setAttribute('aria-expanded','true');evidenzia(-1);
  }
  input.addEventListener('focus',function(){prendi().then(cerca)});
  input.addEventListener('input',function(){prendi().then(cerca)});
  input.addEventListener('blur',function(){setTimeout(chiudi,120)});
  input.addEventListener('keydown',function(e){
    if(ul.hidden)return;
    if(e.key==='ArrowDown'){e.preventDefault();evidenzia(Math.min(sel+1,trovati.length-1))}
    else if(e.key==='ArrowUp'){e.preventDefault();evidenzia(Math.max(sel-1,-1))}
    else if(e.key==='Enter'&&sel>=0){e.preventDefault();scegli(sel)}
    else if(e.key==='Escape'){chiudi()}
  });
};

/* Campo "Quando": calendario nello stile del sito al posto di quello del sistema.
   Il valore (AAAA-MM-GG) sta in input.dataset.iso; nel campo si legge la data in italiano. */
var MESI=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
var GIORNI=['lun','mar','mer','gio','ven','sab','dom'];
function iso(dt){return dt.getFullYear()+'-'+('0'+(dt.getMonth()+1)).slice(-2)+'-'+('0'+dt.getDate()).slice(-2)}
PK.calendario=function(input){
  if(!input)return;
  var box=input.parentNode,oggi=new Date();oggi.setHours(0,0,0,0);
  var vista=new Date(oggi.getFullYear(),oggi.getMonth(),1),fuoco=new Date(oggi),aperto=false;
  input.type='text';input.readOnly=true;input.setAttribute('inputmode','none');input.placeholder='Scegli una data';
  input.setAttribute('aria-haspopup','dialog');input.setAttribute('aria-expanded','false');
  box.classList.add('pk-ac');
  var pop=d.createElement('div');pop.className='pk-cal';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Scegli una data');pop.hidden=true;
  box.appendChild(pop);
  function mostra(){
    var y=vista.getFullYear(),m=vista.getMonth(),primo=(new Date(y,m,1).getDay()+6)%7,tot=new Date(y,m+1,0).getDate();
    var prima=new Date(y,m,1)<=new Date(oggi.getFullYear(),oggi.getMonth(),1);
    var h='<div class="pk-cal-top"><button type="button" class="pk-cal-nav" data-m="-1" aria-label="Mese precedente"'+(prima?' disabled':'')+'>‹</button>'
      +'<span class="pk-cal-mese" aria-live="polite">'+MESI[m]+' '+y+'</span><button type="button" class="pk-cal-nav" data-m="1" aria-label="Mese successivo">›</button></div>'
      +'<div class="pk-cal-grid" role="grid">'+GIORNI.map(function(g){return '<span class="pk-cal-g" aria-hidden="true">'+g+'</span>'}).join('');
    for(var i=0;i<primo;i++)h+='<span></span>';
    for(var g=1;g<=tot;g++){
      var dt=new Date(y,m,g),k=iso(dt),passato=dt<oggi;
      h+='<button type="button" class="pk-cal-d'+(k===input.dataset.iso?' on':'')+(k===iso(oggi)?' oggi':'')+'" data-d="'+k+'"'
        +(passato?' disabled':'')+' tabindex="'+(k===iso(fuoco)?0:-1)+'" aria-label="'+g+' '+MESI[m]+' '+y+'">'+g+'</button>';
    }
    h+='</div><div class="pk-cal-foot"><button type="button" class="pk-cal-x">Non lo so ancora</button></div>';
    pop.innerHTML=h;
  }
  function apri(){if(aperto)return;aperto=true;if(input.dataset.iso){var p=input.dataset.iso.split('-');fuoco=new Date(+p[0],p[1]-1,+p[2]);vista=new Date(fuoco.getFullYear(),fuoco.getMonth(),1)}
    mostra();pop.hidden=false;input.setAttribute('aria-expanded','true');var b=pop.querySelector('[tabindex="0"]');if(b&&!b.disabled)b.focus()}
  function chiudi(torna){if(!aperto)return;aperto=false;pop.hidden=true;input.setAttribute('aria-expanded','false');if(torna)input.focus()}
  function imposta(k){
    if(!k){delete input.dataset.iso;input.value='';chiudi(true);return}
    var p=k.split('-'),dt=new Date(+p[0],p[1]-1,+p[2]);
    input.dataset.iso=k;input.value=dt.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});chiudi(true);
  }
  function sposta(n){fuoco=new Date(fuoco.getFullYear(),fuoco.getMonth(),fuoco.getDate()+n);if(fuoco<oggi)fuoco=new Date(oggi);
    vista=new Date(fuoco.getFullYear(),fuoco.getMonth(),1);mostra();var b=pop.querySelector('[data-d="'+iso(fuoco)+'"]');if(b)b.focus()}
  input.addEventListener('click',function(){aperto?chiudi():apri()});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){e.preventDefault();apri()}});
  pop.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.m){vista=new Date(vista.getFullYear(),vista.getMonth()+(+b.dataset.m),1);fuoco=new Date(vista);if(fuoco<oggi)fuoco=new Date(oggi);mostra()}
    else if(b.dataset.d)imposta(b.dataset.d);
    else if(b.classList.contains('pk-cal-x'))imposta('');
  });
  pop.addEventListener('keydown',function(e){
    var mosse={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
    if(mosse[e.key]&&e.target.dataset.d){e.preventDefault();sposta(mosse[e.key])}
    else if(e.key==='PageUp'||e.key==='PageDown'){e.preventDefault();fuoco=new Date(fuoco.getFullYear(),fuoco.getMonth()+(e.key==='PageUp'?-1:1),1);sposta(0)}
    else if(e.key==='Escape'){e.preventDefault();chiudi(true)}
  });
  d.addEventListener('mousedown',function(e){if(aperto&&!box.contains(e.target))chiudi()});
  PK.calendario.azzera=function(){delete input.dataset.iso;input.value=''};
};

/* Carosello dei fotogrammi */
PK.acts.carPrev=function(a,el){var t=el.closest('section').querySelector('.car-track');t.scrollBy({left:-t.clientWidth-16,behavior:still?'auto':'smooth'})};
PK.acts.carNext=function(a,el){var t=el.closest('section').querySelector('.car-track');t.scrollBy({left:t.clientWidth+16,behavior:still?'auto':'smooth'})};

intro();
pkCursor();
clock();
menu();
acts();
})();
