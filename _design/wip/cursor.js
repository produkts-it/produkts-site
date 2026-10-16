function pkCursor(){
  var d=document,w=window;
  if(!w.matchMedia||!w.matchMedia('(hover: hover) and (pointer: fine)').matches)return null;
  if(!w.PointerEvent||d.getElementById('pk-cursor'))return null;
  var still=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st=d.createElement('style');st.id='pk-cursor-css';
  st.textContent='#pk-cursor{position:fixed;left:0;top:0;width:28px;height:28px;border:1px solid rgba(232,228,223,.75);border-radius:50%;pointer-events:none;z-index:2147483647;opacity:0;transition:opacity .3s ease,border-color .3s,background-color .3s;will-change:transform,width,height;box-sizing:border-box}'
   +'#pk-cursor.lock{border-color:#D98A4E;background-color:rgba(217,138,78,.06)}#pk-cursor.lens{border-color:rgba(232,228,223,.35)}'
   +'@media (hover:none),(pointer:coarse){#pk-cursor{display:none!important}}';
  d.head.appendChild(st);
  var c=d.createElement('div');c.id='pk-cursor';c.setAttribute('aria-hidden','true');d.body.appendChild(c);
var org=d.createElement('div');org.setAttribute('aria-hidden','true');org.style.cssText='position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;visibility:hidden';d.body.appendChild(org);
  var SEL='a,button,select,input,textarea,label,summary,[role="button"]',BSEL='h1,h2,h3,.kicker,.kw,[data-blur],span[style*="text-transform: uppercase"],span[style*="text-transform:uppercase"]';
  var PAD=7,EXT=8,MIN=46,EASE='cubic-bezier(.2,.7,.2,1)';
  var mx=-100,my=-100,x=-100,y=-100,W=28,H=28,R=14,lock=null,mode='',raf,visible=false;
  var blurred=null,blurAnim=null,muted=null;
  var k=still?1:0.16,ks=still?1:0.2;
  function blurOn(el){
    if(blurAnim){blurAnim.cancel();}
    blurAnim=el.animate([{filter:'blur(0px)',opacity:1},{filter:'blur(2.4px)',opacity:.85}],{duration:220,easing:EASE,fill:'forwards'});
  }
  function blurOff(el,instant){
    if(!el)return;
    var a=blurAnim;blurAnim=null;
    if(instant){if(a)a.cancel();return;}
    var cur=a?getComputedStyle(el).filter:'blur(2.4px)';
    var out=el.animate([{filter:cur==='none'?'blur(0px)':cur,opacity:getComputedStyle(el).opacity},{filter:'blur(0px)',opacity:1}],{duration:260,easing:EASE});
    if(a)a.cancel();
    out.onfinish=function(){out.cancel()};
  }
  function setBlur(el,instant){
    if(el===blurred)return;
    if(blurred)blurOff(blurred,instant);
    blurred=el;
    if(el)blurOn(el);
  }
  function hide(){visible=false;c.style.opacity='0';lock=null;setBlur(null,true);}
  function radiusOf(el,h){var r=parseFloat(getComputedStyle(el).borderTopLeftRadius)||0;return Math.min(r+PAD,h/2)}
  function move(e){
    if(e.pointerType!=='mouse'){hide();return;}
    mx=e.clientX;my=e.clientY;
    if(!visible){visible=true;x=mx;y=my;c.style.opacity='1';}
    var t=e.target&&e.target.closest?e.target.closest(SEL):null;
    var bl=!t&&e.target&&e.target.closest?e.target.closest(BSEL):null;
    if(muted&&bl!==muted)muted=null;
    if(bl&&bl===muted)bl=null;
    lock=t;setBlur(still?null:bl);
    var m=t?'lock':bl?'lens':'';
    if(m!==mode){mode=m;c.className=m;}
  }
  function down(e){
    if(e.pointerType!=='mouse'){hide();return;}
    if(blurred){muted=blurred;setBlur(null,false);if(mode==='lens'){mode='';c.className='';}}
  }
  function loop(){
    var tx,ty,tw,th,tr;
    if(lock&&lock.isConnected){
      /* Il cerchio avvolge l'elemento con almeno PAD di margine su ogni lato e non entra mai dentro:
dal lato dove sta il mouse il margine cresce un po' (fino a PAD+EXT), così la forma segue il mouse */
var r=lock.getBoundingClientRect(),cxe=r.left+r.width/2,cye=r.top+r.height/2;
var fx=Math.max(-1,Math.min(1,(mx-cxe)/(r.width/2+PAD))),fy=Math.max(-1,Math.min(1,(my-cye)/(r.height/2+PAD)));
var L=r.left-PAD-Math.max(0,-fx)*EXT,Rt=r.right+PAD+Math.max(0,fx)*EXT,T=r.top-PAD-Math.max(0,-fy)*EXT*.6,B=r.bottom+PAD+Math.max(0,fy)*EXT*.6;
tw=Rt-L;th=B-T;
if(tw<MIN){L-=(MIN-tw)/2;tw=MIN}
if(th<MIN){T-=(MIN-th)/2;th=MIN}
tr=(tw===MIN&&th===MIN)?MIN/2:radiusOf(lock,th);
tx=L+tw/2;ty=T+th/2;
    }else{tx=mx;ty=my;var s=mode==='lens'?72:28;tw=th=s;tr=s/2;}
    x+=(tx-x)*k;y+=(ty-y)*k;W+=(tw-W)*ks;H+=(th-H)*ks;R+=(tr-R)*ks;
    c.style.width=W.toFixed(1)+'px';c.style.height=H.toFixed(1)+'px';c.style.borderRadius=R.toFixed(1)+'px';
    /* Origine reale degli elementi fixed: con scrollbar-gutter su entrambi i lati non coincide con quella del mouse */
var o=org.getBoundingClientRect();
c.style.transform='translate3d('+(x-W/2-o.left).toFixed(2)+'px,'+(y-H/2-o.top).toFixed(2)+'px,0)';
    raf=requestAnimationFrame(loop);
  }
  d.addEventListener('pointermove',move,{passive:true});
  d.addEventListener('pointerdown',down,{passive:true});
  d.addEventListener('touchstart',hide,{passive:true});
  d.documentElement.addEventListener('mouseleave',hide);
  w.addEventListener('blur',hide);
  raf=requestAnimationFrame(loop);
  return function(){cancelAnimationFrame(raf);d.removeEventListener('pointermove',move);d.removeEventListener('pointerdown',down);d.removeEventListener('touchstart',hide);d.documentElement.removeEventListener('mouseleave',hide);w.removeEventListener('blur',hide);setBlur(null,true);c.remove();org.remove();st.remove();};
}
