'use strict';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const apps=window.SAKO_APPS||[];
const locale=window.SakoLocale;
let currentLocale='fr',currentFilter='all';
const t=(key,values={})=>locale.text(currentLocale,key,values);
const dialog=$('#product-dialog'),dialogContent=$('#dialog-content');
const menuButton=$('.menu-toggle'),mobileNav=$('#mobile-nav');
let lastFocused=null,currentGallery=[],zoomIndex=0,zoomView=null;

function selectedApp(id){const base=apps.find(x=>x.id===id);return base?locale.app(currentLocale,base):null;}
function fallbackMessage(app){return t('product.fallback',{language:t('language.'+app.screenshotLanguage)});}
function noteFor(app){const key=app.id==='MesureTerrain'?'terrain':app.id==='Mondova'?'mondova':['MindMapAI','SuiviHabitudes'].includes(app.id)?'ai':null;return key?t('product.note.'+key):null;}
function renderApps(filter=currentFilter){
  currentFilter=filter;
  const chosen=apps.filter(a=>filter==='all'||a.category===filter).map(a=>locale.app(currentLocale,a));
  $('#apps-grid').innerHTML=chosen.map(a=>`<button class="app-card" data-app="${escapeHTML(a.id)}" style="--accent:${a.accent}" aria-label="${escapeHTML(t('apps.discover',{name:a.name}))}"><span class="card-top"><img class="app-icon" src="${a.icon}" alt="" width="192" height="192" loading="lazy"><span class="app-arrow" aria-hidden="true">↗</span></span><h3><bdi>${escapeHTML(a.name)}</bdi></h3><span class="card-subtitle">${escapeHTML(a.subtitle)}</span><span class="card-description">${escapeHTML(a.description)}</span><span class="card-preview" aria-hidden="true"><span class="mini-phone main"><img src="${a.screens[0]}" alt="" width="600" height="1304" loading="lazy"></span><span class="mini-phone secondary"><img src="${a.screens[1]}" alt="" width="600" height="1304" loading="lazy"></span></span>${!a.interfaceLocalized?`<span class="preview-language" title="${escapeHTML(fallbackMessage(a))}">${escapeHTML(t('language.'+a.screenshotLanguage))}</span>`:''}<span class="card-number" aria-hidden="true">${String(apps.findIndex(x=>x.id===a.id)+1).padStart(2,'0')} / 08</span></button>`).join('');
  $('.filter-count').textContent=t('apps.count',{count:chosen.length});
}
$$('.filter').forEach(button=>button.addEventListener('click',()=>{
  $$('.filter').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  renderApps(button.dataset.filter);
}));

function openDialog(content){lastFocused=document.activeElement;dialogContent.innerHTML=content;dialog.showModal();dialog.scrollTop=0;document.body.classList.add('modal-open');$('.dialog-close').focus();}
function openApp(id){
  const a=selectedApp(id);if(!a)return;
  currentGallery=a.screens;
  const languages=a.languages.map(l=>t('language.'+l)).join(' · '),note=noteFor(a);
  openDialog(`<article class="dialog-product" style="--accent:${a.accent}"><div class="dialog-header"><img class="app-icon" src="${a.icon}" alt="" width="192" height="192"><div><p class="eyebrow">${escapeHTML(t('category.'+a.category))}</p><h2 id="dialog-title"><bdi>${escapeHTML(a.name)}</bdi></h2></div></div><p class="dialog-headline">${escapeHTML(a.headline)}</p><p class="dialog-description">${escapeHTML(a.description)}</p><div class="feature-pills">${a.features.map(f=>`<span>${escapeHTML(f)}</span>`).join('')}</div><dl class="product-facts"><div><dt>${escapeHTML(t('product.devices'))}</dt><dd><bdi>${a.platforms.join(' & ')}</bdi></dd></div><div><dt>${escapeHTML(t('product.languages'))}</dt><dd>${escapeHTML(languages)}</dd></div></dl><div class="dialog-gallery">${a.screens.map((src,i)=>`<button class="gallery-phone" data-zoom="${i}" aria-label="${escapeHTML(t('product.zoom',{index:i+1,name:a.name}))}"><img src="${src}" alt="${escapeHTML(t('product.screenshot',{name:a.name,index:i+1}))}" width="600" height="1304"></button>`).join('')}</div><span class="gallery-caption">${escapeHTML(t('product.caption'))}</span>${!a.interfaceLocalized?`<p class="product-note screenshot-language-note">${escapeHTML(fallbackMessage(a))}</p>`:''}${note?`<p class="product-note">${escapeHTML(note)}</p>`:''}</article>`);
}
function openGame(){
  openDialog(`<article class="dialog-game"><img class="game-dialog-art" src="assets/hypernova-keyart.webp" alt="${escapeHTML(t('game.alt'))}" width="1800" height="617"><div class="game-dialog-body"><div class="game-dialog-title"><img src="assets/hypernova-icon.webp" alt="" width="256" height="256"><div><p class="eyebrow">${escapeHTML(t('game.dialogKicker'))}</p><h2 id="dialog-title"><bdi>Hypernova Strike</bdi></h2></div></div><p>${escapeHTML(t('game.description'))}</p><div class="game-mechanics"><div><span aria-hidden="true">⌖</span><h3>${escapeHTML(t('game.controlTitle'))}</h3><p>${escapeHTML(t('game.controlBody'))}</p></div><div><span aria-hidden="true">✦</span><h3>${escapeHTML(t('game.wavesTitle'))}</h3><p>${escapeHTML(t('game.wavesBody'))}</p></div><div><span aria-hidden="true">↗</span><h3>${escapeHTML(t('game.garageTitle'))}</h3><p>${escapeHTML(t('game.garageBody'))}</p></div></div><p class="game-dialog-footer">${escapeHTML(t('game.devices'))}</p><a class="contact-link" href="mailto:issaka_oumarou@yahoo.fr?subject=Hypernova%20Strike">${escapeHTML(t('game.contact'))} <span aria-hidden="true">↗</span></a></div></article>`);
}
document.addEventListener('click',event=>{
  const appButton=event.target.closest('[data-app]');if(appButton)openApp(appButton.dataset.app);
  if(event.target.closest('[data-game]'))openGame();
  const zoom=event.target.closest('[data-zoom]');if(zoom)openZoom(Number(zoom.dataset.zoom));
});
function closeZoom(){
  if(!zoomView)return;zoomView.remove();zoomView=null;dialogContent.inert=false;
  $('.dialog-close').setAttribute('aria-label',t('dialog.close'));
  const trigger=$(`[data-zoom="${zoomIndex}"]`,dialog);if(trigger)trigger.focus();
}
function openZoom(index){
  if(zoomView)return;zoomIndex=index;dialogContent.inert=true;
  zoomView=document.createElement('button');zoomView.className='zoomed-gallery';
  zoomView.setAttribute('aria-label',t('dialog.closeZoom'));
  zoomView.innerHTML=`<img src="${currentGallery[index]}" alt="${escapeHTML(t('product.zoomAlt',{index:index+1}))}">`;
  zoomView.addEventListener('click',closeZoom);dialog.append(zoomView);
  $('.dialog-close').setAttribute('aria-label',t('dialog.closeZoom'));zoomView.focus();
}
$('.dialog-close').addEventListener('click',()=>zoomView?closeZoom():dialog.close());
dialog.addEventListener('cancel',e=>{if(zoomView){e.preventDefault();closeZoom();}});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{if(zoomView){zoomView.remove();zoomView=null;}dialogContent.inert=false;document.body.classList.remove('modal-open');$('.dialog-close').setAttribute('aria-label',t('dialog.close'));if(lastFocused&&lastFocused.isConnected)lastFocused.focus();});

function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label',t('menu.open'));}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',t(open?'menu.close':'menu.open'));mobileNav.hidden=!open;});
$$('a',mobileNav).forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
window.addEventListener('resize',()=>{if(innerWidth>800)closeMenu();});

function applyLocale(language,persist=false){
  currentLocale=locale.normalize(language);
  if(dialog.open)dialog.close();
  document.documentElement.lang=currentLocale;document.documentElement.dir=currentLocale==='ar'?'rtl':'ltr';
  $$('[data-i18n]').forEach(el=>{el.innerHTML=t(el.dataset.i18n);});
  for(const [dataKey,attribute] of [['i18nAria','aria-label'],['i18nAlt','alt'],['i18nContent','content']]){
    const selector='[data-'+dataKey.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+']';
    $$(selector).forEach(el=>el.setAttribute(attribute,t(el.dataset[dataKey])));
  }
  document.title=t('meta.title');$('#site-language').value=currentLocale;
  closeMenu();renderApps();
  for(const id of ['Mondova','VegaGx','MindMapAI']){
    const button=$(`.hero-phone[data-app="${id}"]`),a=selectedApp(id);
    button.setAttribute('aria-label',t('apps.discover',{name:a.name}));$('img',button).src=a.screens[0];
  }
  $('#contact-slot').innerHTML=`<p class="contact-label">${escapeHTML(t('contact.prompt'))}</p><a class="contact-link" href="mailto:issaka_oumarou@yahoo.fr?subject=Contact%20SakoTech%20Global"><bdi>issaka_oumarou@yahoo.fr</bdi> <span aria-hidden="true">↗</span></a>`;
  if(persist){
    try{localStorage.setItem('sakotech.site.language',currentLocale);}catch{}
    try{const url=new URL(location.href);url.searchParams.set('lang',currentLocale);history.replaceState(null,'',url.href);}catch{}
  }
}
$('#site-language').addEventListener('change',e=>applyLocale(e.target.value,true));
let initialLanguage='fr';
try{initialLanguage=new URL(location.href).searchParams.get('lang')||localStorage.getItem('sakotech.site.language')||'fr';}catch{}
applyLocale(initialLanguage);
$('#year').textContent=new Date().getFullYear();
if('IntersectionObserver' in window){
  document.documentElement.classList.add('js-ready');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}},{threshold:.08});
  $$('.reveal').forEach(element=>observer.observe(element));
}

// A light, decorative starfield. No input capture and no external requests.
const canvas=$('#starfield');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const ctx=canvas.getContext('2d');
let particles=[],width=0,height=0,animation=0,active=false,lastTime=0;
function resizeStars(){cancelAnimationFrame(animation);lastTime=0;const ratio=Math.min(devicePixelRatio||1,2);width=canvas.clientWidth;height=canvas.clientHeight;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);particles=Array.from({length:55},()=>({x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.2+.2,s:Math.random()*.14+.04,a:Math.random()*.45+.15}));drawStars(0);}
function drawStars(time){ctx.clearRect(0,0,width,height);const step=lastTime?Math.min((time-lastTime)/16.67,3):1;lastTime=time;for(const p of particles){ctx.fillStyle=`rgba(155,211,243,${p.a})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();if(!motion.matches){p.x-=p.s*step;p.y+=p.s*.14*step;if(p.x<0)p.x=width;}}if(active&&!motion.matches)animation=requestAnimationFrame(drawStars);}
function setStarsActive(value){active=value;cancelAnimationFrame(animation);lastTime=0;if(active&&!motion.matches)animation=requestAnimationFrame(drawStars);else drawStars(0);}
if(ctx){resizeStars();window.addEventListener('resize',resizeStars);motion.addEventListener('change',()=>setStarsActive(active));if('IntersectionObserver' in window){new IntersectionObserver(entries=>setStarsActive(entries[0].isIntersecting),{rootMargin:'100px'}).observe(canvas);}else setStarsActive(true);document.addEventListener('visibilitychange',()=>{if(document.hidden)setStarsActive(false);else {const r=canvas.getBoundingClientRect();setStarsActive(r.bottom>0&&r.top<innerHeight);}});}
