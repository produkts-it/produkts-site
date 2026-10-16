/* produkts.it — script comune della bozza. Generato da _design/bozza/build.py (non modificare bozza/assets/site.js a mano). */
(function(){
var d=document,w=window,h=d.documentElement;
var still=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Intro del logo: la classe html.intro la decide lo script in <head> (solo ingresso e ricarica) */
function intro(){
  if(!h.classList.contains('intro'))return;
  var l=d.createElement('div');l.className='loader';l.setAttribute('aria-hidden','true');
  l.innerHTML="<svg viewBox=\"0 0 450 251.5\" role=\"presentation\">\n<rect class=\"g d0\" pathLength=\"1\" x=\"75\" y=\"1.5\" width=\"300\" height=\"128.57\"/>\n<line class=\"g d1\" pathLength=\"1\" x1=\"75\" y1=\"44.36\" x2=\"375\" y2=\"44.36\"/><line class=\"g d2\" pathLength=\"1\" x1=\"75\" y1=\"87.21\" x2=\"375\" y2=\"87.21\"/><line class=\"g d3\" pathLength=\"1\" x1=\"175\" y1=\"1.5\" x2=\"175\" y2=\"130.07\"/><line class=\"g d4\" pathLength=\"1\" x1=\"275\" y1=\"1.5\" x2=\"275\" y2=\"130.07\"/>\n<line class=\"c\" pathLength=\"1\" x1=\"75\" y1=\"1.5\" x2=\"75\" y2=\"36.5\"/><line class=\"c\" pathLength=\"1\" x1=\"75\" y1=\"1.5\" x2=\"110\" y2=\"1.5\"/><line class=\"c\" pathLength=\"1\" x1=\"375\" y1=\"1.5\" x2=\"375\" y2=\"36.5\"/><line class=\"c\" pathLength=\"1\" x1=\"375\" y1=\"1.5\" x2=\"340\" y2=\"1.5\"/><line class=\"c\" pathLength=\"1\" x1=\"75\" y1=\"130.07\" x2=\"75\" y2=\"95.07\"/><line class=\"c\" pathLength=\"1\" x1=\"75\" y1=\"130.07\" x2=\"110\" y2=\"130.07\"/><line class=\"c\" pathLength=\"1\" x1=\"375\" y1=\"130.07\" x2=\"375\" y2=\"95.07\"/><line class=\"c\" pathLength=\"1\" x1=\"375\" y1=\"130.07\" x2=\"340\" y2=\"130.07\"/>\n<path class=\"ring\" d=\"M224.64,50.29c8.55,0,15.5,6.95,15.5,15.5s-6.95,15.5-15.5,15.5-15.5-6.95-15.5-15.5,6.95-15.5,15.5-15.5M224.64,48.29c-9.67,0-17.5,7.840-17.5,17.5s7.83,17.5,17.5,17.5,17.5-7.84,17.5-17.5-7.83-17.5-17.5-17.5h0Z\"/>\n<circle class=\"dot\" cx=\"224.64\" cy=\"65.79\" r=\"10\"/>\n<g class=\"word\"><path class=\"w\" d=\"M0,251.5l.78-2.34h2.35c1.5,0,2.62-.36,3.37-1.07.75-.72,1.48-2.18,2.2-4.4l17.3-53.16c.91-2.74,1.11-4.59.59-5.57-.52-.98-1.96-1.47-4.3-1.47h-2.05l.68-2.35,13.58-.29-2.54,11.04-1.56.1c2.21-4.04,4.87-7.09,7.96-9.14,3.09-2.05,6.24-3.08,9.43-3.08,3.97,0,7.1,1.37,9.38,4.1,2.28,2.74,3.42,6.45,3.42,11.14,0,3.78-.72,7.48-2.15,11.09-1.43,3.62-3.37,6.89-5.81,9.82-2.44,2.93-5.18,5.26-8.21,6.99-3.03,1.72-6.11,2.59-9.23,2.59-4.3,0-7.27-1.59-8.89-4.79-1.63-3.19-2.08-7.17-1.37-11.92l.98,3.62-10.26,31.37c-.72,2.21-.95,3.66-.68,4.35.26.69,1.11,1.03,2.54,1.03h3.32l-.68,2.34H0ZM34.2,222.97c2.28,0,4.56-.85,6.84-2.54,2.28-1.69,4.35-3.96,6.21-6.79,1.86-2.83,3.34-6.01,4.45-9.53,1.11-3.52,1.66-7.1,1.66-10.75s-.62-6.22-1.86-8.11c-1.24-1.89-3.06-2.83-5.47-2.83-2.02,0-4.07.68-6.16,2.05-2.09,1.37-4.01,3.22-5.77,5.57s-3.13,5.02-4.1,8.01l-1.47,4.49c-1.24,3.71-1.84,7.12-1.81,10.21.03,3.09.67,5.57,1.91,7.43,1.24,1.86,3.09,2.79,5.57,2.79Z\"/><path class=\"w\" d=\"M66.16,224.14l10.95-33.62c.91-2.67,1.11-4.51.59-5.52-.52-1.01-1.95-1.51-4.3-1.51h-2.05l.78-2.35,13.39-.29-4.49,17.3-.49-.78c2.61-5.86,5.33-10.26,8.16-13.19,2.83-2.93,5.85-4.4,9.04-4.4,2.21,0,4.04.62,5.47,1.86,1.43,1.24,2.18,2.8,2.25,4.69.06,1.3-.28,2.36-1.03,3.18-.75.82-1.78,1.22-3.08,1.22-1.04,0-1.94-.31-2.69-.93-.75-.62-1.29-1.74-1.61-3.37-.19-.91-.54-1.61-1.03-2.1-.49-.49-1.12-.73-1.91-.73-2.28,0-4.79,2.05-7.52,6.16-2.74,4.1-5.24,9.64-7.52,16.61l-5.86,17.78h-7.04Z\"/><path class=\"w\" d=\"M121.95,225.51c-3.65,0-6.64-.75-8.99-2.25-2.34-1.5-4.07-3.48-5.18-5.96-1.11-2.47-1.66-5.18-1.66-8.11,0-3.39.68-6.81,2.05-10.26,1.37-3.45,3.29-6.63,5.77-9.53,2.48-2.9,5.39-5.23,8.75-6.99,3.35-1.76,7.02-2.64,10.99-2.64,3.71,0,6.73.75,9.04,2.25,2.31,1.5,4.01,3.47,5.08,5.91,1.07,2.44,1.61,5.1,1.61,7.96,0,3.39-.67,6.81-2,10.26-1.34,3.45-3.24,6.65-5.72,9.58-2.48,2.93-5.37,5.29-8.7,7.08-3.32,1.79-7,2.69-11.04,2.69ZM121.47,223.36c2.54,0,4.89-.72,7.04-2.15,2.15-1.43,4.09-3.31,5.81-5.62,1.72-2.31,3.19-4.85,4.4-7.62,1.2-2.77,2.13-5.5,2.79-8.21.65-2.7.98-5.16.98-7.38,0-2.87-.63-5.33-1.91-7.38-1.27-2.05-3.44-3.08-6.5-3.08-2.54,0-4.89.72-7.04,2.15-2.15,1.43-4.09,3.31-5.81,5.62-1.73,2.31-3.19,4.85-4.4,7.62-1.21,2.77-2.13,5.52-2.78,8.26-.65,2.74-.98,5.18-.98,7.33,0,2.8.63,5.24,1.91,7.33,1.27,2.09,3.44,3.13,6.5,3.13Z\"/><path class=\"w\" d=\"M167.88,225.51c-3.97,0-7.05-1.21-9.23-3.61-2.18-2.41-3.27-5.77-3.27-10.07,0-3.91.81-7.77,2.44-11.58,1.63-3.81,3.79-7.26,6.5-10.36,2.7-3.09,5.72-5.55,9.04-7.38,3.32-1.82,6.68-2.74,10.07-2.74s5.91.98,7.57,2.93c1.66,1.95,2.49,4.82,2.49,8.6l-1.17.39,8.99-27.56c.91-2.74,1.09-4.59.54-5.57-.56-.98-1.97-1.47-4.25-1.47h-2.64l.68-2.35,15.83-.29-19.94,61.37c-1.37,4.3-1.07,6.45.88,6.45,1.04,0,2.26-.63,3.66-1.9,1.4-1.27,2.62-2.85,3.66-4.74l1.76,1.17c-1.7,2.87-3.55,5.03-5.57,6.5-2.02,1.46-4.17,2.2-6.45,2.2-1.37,0-2.49-.29-3.37-.88-.88-.59-1.47-1.45-1.76-2.59-.29-1.14-.34-2.56-.15-4.25.19-1.69.68-3.68,1.47-5.96l.68.59c-2.09,4.17-4.74,7.39-7.96,9.67-3.22,2.28-6.73,3.42-10.51,3.42ZM169.35,222.77c2.35,0,4.72-.81,7.13-2.44,2.41-1.63,4.66-3.86,6.74-6.69,2.08-2.83,3.84-6.11,5.28-9.82.91-2.41,1.61-4.76,2.1-7.04.49-2.28.73-4.27.73-5.96,0-2.74-.59-4.85-1.76-6.35-1.17-1.5-2.87-2.25-5.08-2.25-1.96,0-3.96.59-6.01,1.76-2.05,1.17-4.01,2.78-5.86,4.84-1.86,2.05-3.53,4.38-5.03,6.99-1.5,2.61-2.69,5.36-3.57,8.26-.88,2.9-1.39,5.78-1.51,8.65-.19,6.71,2.08,10.07,6.84,10.07Z\"/><path class=\"w\" d=\"M220.16,225.51c-3.97,0-6.56-1.27-7.77-3.81-1.21-2.54-.96-6.19.73-10.94l7.33-20.23c.98-2.67,1.2-4.51.68-5.52-.52-1.01-1.99-1.51-4.4-1.51h-2.54l.68-2.35,15.63-.29-11.14,32.74c-.98,2.93-1.19,5.24-.63,6.94.55,1.7,1.77,2.54,3.66,2.54,1.5,0,3.14-.49,4.93-1.47,1.79-.98,3.55-2.28,5.28-3.91,1.72-1.63,3.29-3.45,4.69-5.47,1.4-2.02,2.49-4.1,3.27-6.25l8.89-24.82h6.45l-11.63,34.69c-1.37,4.3-1.11,6.45.78,6.45,1.11,0,2.36-.65,3.76-1.95,1.4-1.3,2.59-2.87,3.57-4.69l1.76,1.17c-3.32,5.8-7.23,8.7-11.73,8.7-2.74,0-4.46-1.07-5.18-3.22-.72-2.15-.39-5.21.98-9.19l.49.59c-2.74,3.97-5.65,6.94-8.75,8.89-3.09,1.95-6.37,2.93-9.82,2.93Z\"/><path class=\"w\" d=\"M260.91,224.14l19.64-60.1c.85-2.54.91-4.33.19-5.38-.72-1.04-2.31-1.56-4.79-1.56h-1.86l.68-2.35,15.73-.29-22.57,69.68h-7.04ZM274.4,197.75v-1.37c1.95,0,3.65-.19,5.08-.59,1.43-.39,2.85-1.09,4.25-2.1,1.4-1.01,2.95-2.43,4.64-4.25l3.62-3.81c2.15-2.28,3.88-3.83,5.18-4.64,1.3-.81,2.67-1.22,4.1-1.22,1.76,0,3.18.55,4.25,1.66,1.07,1.11,1.61,2.57,1.61,4.4,0,1.63-.41,2.93-1.22,3.91-.82.98-1.87,1.47-3.18,1.47-1.04,0-1.87-.32-2.49-.98-.62-.65-.93-1.56-.93-2.74,0-1.5-.1-2.51-.29-3.03-.19-.52-.55-.78-1.07-.78s-1.11.23-1.76.68c-.65.46-1.53,1.24-2.64,2.35l-4.01,4.2c-1.76,1.89-3.34,3.32-4.74,4.3-1.4.98-2.88,1.65-4.45,2-1.56.36-3.55.54-5.96.54ZM293.26,225.51c-2.54,0-4.33-.95-5.37-2.83-1.04-1.89-1.56-5.21-1.56-9.97v-3.22c0-2.93-.31-5.24-.93-6.94-.62-1.69-1.68-2.9-3.18-3.62-1.5-.72-3.52-1.07-6.06-1.07l.19-1.47c4.3,0,7.65.39,10.07,1.17,2.41.78,4.1,2.15,5.08,4.1.98,1.95,1.47,4.66,1.47,8.11v2.93c0,3.78.2,6.32.59,7.62.39,1.3,1.17,1.95,2.34,1.95,2.02,0,4.4-2.12,7.13-6.35l1.66,1.17c-3.06,5.6-6.88,8.4-11.43,8.4Z\"/><path class=\"w\" d=\"M318.47,225.51c-2.74,0-4.41-1.04-5.03-3.13-.62-2.08-.31-5.08.93-8.99l14.27-43.68h6.94l-15.15,46.42c-1.3,4.1-.82,6.16,1.47,6.16,1.17,0,2.46-.59,3.86-1.76,1.4-1.17,2.65-2.7,3.76-4.59l1.76,1.17c-1.56,2.61-3.49,4.66-5.77,6.16-2.28,1.5-4.63,2.25-7.04,2.25ZM317.3,183.49l.78-2.35h7.82l-.88,2.35h-7.72ZM328.73,183.49l.98-2.35h10.46l-.78,2.35h-10.65Z\"/><path class=\"w\" d=\"M351.11,225.51c-2.41,0-4.61-.46-6.6-1.37-1.99-.91-3.55-2.15-4.69-3.71-1.14-1.56-1.71-3.32-1.71-5.28,0-1.63.41-2.93,1.22-3.91.81-.98,1.91-1.47,3.27-1.47,1.5,0,2.57.54,3.22,1.61.65,1.07.65,2.36,0,3.86l-.59,1.37c-.72,1.7-.51,3.24.63,4.64,1.14,1.4,2.88,2.1,5.23,2.1,2.54,0,4.71-.83,6.5-2.49,1.79-1.66,2.69-3.7,2.69-6.11,0-2.74-1.24-5.41-3.71-8.01l-3.62-3.81c-2.87-3.06-4.3-6.65-4.3-10.75,0-3.71,1.27-6.71,3.81-8.99,2.54-2.28,5.86-3.42,9.97-3.42,3.26,0,5.91.68,7.96,2.05,2.05,1.37,3.08,3.09,3.08,5.18,0,1.3-.39,2.38-1.17,3.22-.78.85-1.79,1.27-3.03,1.27-1.04,0-1.89-.33-2.54-.98-.65-.65-.98-1.5-.98-2.54v-1.76c0-2.87-1.37-4.3-4.1-4.3-2.15,0-3.93.68-5.33,2.05-1.4,1.37-2.1,3.13-2.1,5.28,0,2.8,1.11,5.37,3.32,7.72l3.71,3.91c2.08,2.15,3.55,4.06,4.4,5.72.85,1.66,1.27,3.37,1.27,5.13,0,2.48-.72,4.77-2.15,6.89-1.43,2.12-3.36,3.79-5.77,5.03-2.41,1.24-5.05,1.86-7.92,1.86Z\"/><path class=\"wi\" d=\"M381.97,224.35c-1.03,0-1.98-.18-2.85-.55-.87-.37-1.64-.87-2.29-1.53s-1.16-1.41-1.52-2.29c-.36-.87-.55-1.82-.55-2.83s.18-1.96.55-2.83.87-1.63,1.52-2.28c.65-.65,1.41-1.15,2.29-1.51.87-.36,1.82-.55,2.85-.55s1.96.18,2.82.55c.87.37,1.62.87,2.27,1.51.64.65,1.15,1.4,1.51,2.28.37.87.55,1.82.55,2.83s-.18,1.96-.55,2.83c-.36.87-.87,1.64-1.51,2.29-.65.65-1.4,1.16-2.27,1.53-.87.36-1.81.55-2.82.55ZM381.97,223.47c.89,0,1.7-.16,2.45-.48s1.4-.77,1.96-1.34c.55-.57.99-1.24,1.3-2s.47-1.59.47-2.49-.16-1.71-.47-2.47-.75-1.43-1.3-2c-.55-.57-1.21-1.02-1.96-1.34s-1.57-.48-2.45-.48-1.71.16-2.47.47-1.42.76-1.98,1.33c-.56.57-1,1.24-1.31,2-.31.76-.47,1.59-.47,2.49s.16,1.73.47,2.5c.31.77.75,1.44,1.31,2.01.56.57,1.22,1.02,1.98,1.33s1.59.47,2.47.47ZM382.06,220.91c-.72,0-1.35-.16-1.92-.47s-1-.74-1.31-1.29-.47-1.17-.47-1.88.17-1.39.5-1.96c.33-.58.78-1.04,1.36-1.38.57-.34,1.22-.51,1.94-.51.26,0,.52.03.78.08.26.05.53.13.8.23.16.05.27.09.33.11.06.02.12.03.16.03.16,0,.25-.1.29-.31h.43l-.02,1.19.02,1.29h-.53c-.13-.64-.36-1.13-.69-1.49-.33-.35-.73-.53-1.2-.53-.64,0-1.15.29-1.53.86-.38.57-.58,1.32-.58,2.25s.18,1.72.55,2.26c.36.54.87.81,1.53.81.48,0,.92-.15,1.32-.45s.68-.69.85-1.17l.59.18c-.22.68-.61,1.21-1.17,1.58-.56.38-1.23.57-2.01.57Z\"/><path class=\"wi\" d=\"M392.83,224.43v-2.25l1.56-.2c2.15-.26,3.71-.63,4.69-1.12.98-.49,1.61-1.38,1.91-2.69.29-1.3.44-3.26.44-5.86v-20.62c0-2.93-.59-4.98-1.76-6.16-1.17-1.17-3.22-1.76-6.16-1.76h-.68v-2.25c3.26,0,6.07-.08,8.45-.24,2.38-.16,4.71-.47,6.99-.93v31.95c0,2.61.15,4.56.44,5.86.29,1.3.94,2.2,1.96,2.69,1.01.49,2.56.86,4.64,1.12l1.56.2v2.25l-12.02-.29-12.02.29ZM403,170c-1.7,0-3.03-.59-4.01-1.76-.98-1.17-1.47-2.57-1.47-4.2s.49-3.11,1.47-4.25c.98-1.14,2.31-1.71,4.01-1.71,1.89,0,3.27.57,4.15,1.71.88,1.14,1.32,2.56,1.32,4.25s-.44,3.03-1.32,4.2c-.88,1.17-2.27,1.76-4.15,1.76Z\"/><path class=\"wi\" d=\"M438.76,225.21c-3.52,0-6.19-1.06-8.01-3.18-1.83-2.12-2.74-5.16-2.74-9.14v-28.93h-7.23v-2.44l2.64-.2c2.54-.2,4.54-1.24,6.01-3.13,1.47-1.89,2.43-4.72,2.88-8.5h2.54v43.58c0,2.8.5,4.94,1.51,6.4,1.01,1.47,2.49,2.2,4.45,2.2,1.5,0,2.78-.47,3.86-1.42,1.07-.94,2.13-2.46,3.18-4.54l2.15,1.07c-.33.85-.75,1.68-1.27,2.49-.52.82-1.11,1.58-1.76,2.3-2.09,2.28-4.82,3.42-8.21,3.42ZM434.27,183.97v-2.44h13.1v2.44h-13.1Z\"/></g>\n</svg><span class=\"skip\"><span class=\"c\">Clicca per saltare l'animazione</span><span class=\"t\">Tocca per saltare l'animazione</span></span>";
  d.body.appendChild(l);
  var done=false;
  function end(){if(done)return;done=true;l.classList.add('out');h.classList.remove('intro');
    setTimeout(function(){l.remove()},1100)}
  setTimeout(end,3000);
  l.addEventListener('click',end);
  w.addEventListener('keydown',end,{once:true});
}

/* Cursore custom (stesso di _design/wip/cursor.js) */
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
  var SEL='a,button,select,input,textarea,label,summary,[role="button"]',BSEL='h1,h2,h3,.kicker,.kw,[data-blur],span[style*="text-transform: uppercase"],span[style*="text-transform:uppercase"]';
  var PAD=7,MIN=46,EASE='cubic-bezier(.2,.7,.2,1)';
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
      var r=lock.getBoundingClientRect(),cxe=r.left+r.width/2,cye=r.top+r.height/2;
      if(r.width+PAD*2>MIN||r.height+PAD*2>MIN){tw=Math.max(r.width+PAD*2,MIN);th=Math.max(r.height+PAD*2,MIN);tr=radiusOf(lock,th);}
      else{tw=th=MIN;tr=MIN/2;}
      tx=cxe+(mx-cxe)*0.08;ty=cye+(my-cye)*0.08;
    }else{tx=mx;ty=my;var s=mode==='lens'?72:28;tw=th=s;tr=s/2;}
    x+=(tx-x)*k;y+=(ty-y)*k;W+=(tw-W)*ks;H+=(th-H)*ks;R+=(tr-R)*ks;
    c.style.width=W.toFixed(1)+'px';c.style.height=H.toFixed(1)+'px';c.style.borderRadius=R.toFixed(1)+'px';
    c.style.transform='translate3d('+(x-W/2).toFixed(2)+'px,'+(y-H/2).toFixed(2)+'px,0)';
    raf=requestAnimationFrame(loop);
  }
  d.addEventListener('pointermove',move,{passive:true});
  d.addEventListener('pointerdown',down,{passive:true});
  d.addEventListener('touchstart',hide,{passive:true});
  d.documentElement.addEventListener('mouseleave',hide);
  w.addEventListener('blur',hide);
  raf=requestAnimationFrame(loop);
  return function(){cancelAnimationFrame(raf);d.removeEventListener('pointermove',move);d.removeEventListener('pointerdown',down);d.removeEventListener('touchstart',hide);d.documentElement.removeEventListener('mouseleave',hide);w.removeEventListener('blur',hide);setBlur(null,true);c.remove();st.remove();};
}

/* Menu a schermo intero */
var ITEMS=[
  ['01','Home','./','home','[ Showreel ]'],
  ['02','Lavori','lavori.html','lavori','[ Fotogramma da un lavoro ]'],
  ['03','Chi sono','chi-sono.html','chisono','[ Ritratto sul set ]'],
  ['04','Recensioni','recensioni.html','recensioni','[ Una frase da una recensione ]'],
  ['05','Contatti','contatti.html','contatti','[ Dietro le quinte ]']
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
  v.finished.finally(function(){h.classList.remove('vt-local')});
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
menu();
acts();
})();
