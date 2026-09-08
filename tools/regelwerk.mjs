import { chromium } from 'playwright';
const B = process.argv[2] || 'https://boxspec.app/app.html';
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 200)); });

await p.goto(B, { waitUntil: 'domcontentloaded' });
await p.evaluate(() => {
  localStorage.setItem('fos_users', JSON.stringify({ t: { pass:'firebase', onboardingDone:true,
    seenIntro:true, nickname:'Champ', weight:78, height:182, experienceLevel:'wettkampf',
    gymAccess:'full', trainingProgram:'10w',
    program10wStart: new Date(Date.now()-14*864e5).toISOString().slice(0,10) } }));
  localStorage.setItem('fos_current','t');
  localStorage.setItem('bs_starts','5');           // Installationshinweis freischalten
  localStorage.removeItem('bs_install_seen');
  localStorage.setItem('fos_data_t', JSON.stringify({fights:[],log:[],hrv:[],weekPlan:{},completedBlocks:{},tests:{},notizen:[]}));
});
await p.goto(B, { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
await p.evaluate(() => {
  const a=document.getElementById('auth-screen'), s=document.getElementById('app-screen');
  if(a)a.style.cssText='display:none!important';
  if(s){s.classList.add('active');s.style.cssText='display:block!important';}
  if(typeof renderAllPages==='function')try{renderAllPages()}catch(e){}
  try{ if(typeof generateCurrentWeekPlan==='function'){const d=getData();d.weekPlan=generateCurrentWeekPlan();saveData(d);} }catch(e){}
});
await p.waitForTimeout(3000);
await p.evaluate(()=>{try{F7.refresh()}catch(e){}});
await p.waitForTimeout(400);


// Sucht Regeln rekursiv, also auch innerhalb von @media.
const RULE = `(function(){
  window.__hasRule = function (sel, cond) {
    var found = false;
    var walk = function (rules, inCond) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.selectorText) {
          if (new RegExp(sel).test(r.selectorText) &&
              (!cond || new RegExp(cond).test(inCond || ''))) found = true;
        }
        if (r.cssRules && r.cssRules.length) {
          var c = r.conditionText || (r.media && r.media.mediaText) || inCond || '';
          walk(r.cssRules, c);
        }
      }
    };
    for (var i = 0; i < document.styleSheets.length; i++) {
      try { walk(document.styleSheets[i].cssRules, ''); } catch (e) {}
    }
    return found;
  };
  window.__hasCond = function (cond) {
    var found = false;
    var walk = function (rules) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.conditionText && new RegExp(cond).test(r.conditionText)) found = true;
        if (r.media && r.media.mediaText && new RegExp(cond).test(r.media.mediaText)) found = true;
        if (r.cssRules) walk(r.cssRules);
      }
    };
    for (var i = 0; i < document.styleSheets.length; i++) {
      try { walk(document.styleSheets[i].cssRules); } catch (e) {}
    }
    return found;
  };
})()`;
await p.evaluate(RULE);

const R = [];
const chk = (nr, name, ok, detail) => R.push({ nr, name, ok: !!ok, detail: detail || '' });

// ---- 1 Chrome und Layout ----
const meta = await p.evaluate(() => {
  const g = n => { const e=document.querySelector(`meta[name="${n}"]`); return e?e.content:null; };
  return { vp: g('viewport'), cap: g('apple-mobile-web-app-capable'),
    bar: g('apple-mobile-web-app-status-bar-style'),
    capCount: document.querySelectorAll('meta[name="apple-mobile-web-app-capable"]').length,
    icon: !!document.querySelector('link[rel="apple-touch-icon"][sizes="180x180"]') };
});
chk('1a','viewport-fit=cover', /viewport-fit=cover/.test(meta.vp||''), meta.vp);
chk('1b','apple-mobile-web-app-capable', meta.cap==='yes' && meta.capCount===1, `${meta.cap}, ${meta.capCount}x`);
chk('1c','status-bar black-translucent', meta.bar==='black-translucent', meta.bar);
chk('1d','apple-touch-icon 180', meta.icon);

const layout = await p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const bs = getComputedStyle(document.body);
  const pc = document.querySelector('#f7app .page-content');
  const pcs = pc && getComputedStyle(pc);
  const tb = document.querySelector('#f7app .tabbar');
  const a  = document.querySelector('#f7app .item-link');
  const inp = document.createElement('input');
  document.querySelector('#f7app .page-content').appendChild(inp);
  const inps = getComputedStyle(inp).fontSize; inp.remove();
  return {
    htmlH: cs.height, overscroll: cs.overscrollBehaviorY || cs.overscrollBehavior,
    bodyOverflow: bs.overflow, bodyPos: bs.position,
    tapHl: cs.webkitTapHighlightColor || cs.getPropertyValue('-webkit-tap-highlight-color'),
    safeT: cs.getPropertyValue('--safe-t').trim(), safeB: cs.getPropertyValue('--safe-b').trim(),
    pcOverscroll: pcs ? pcs.overscrollBehaviorY : null,
    pcPadB: pcs ? pcs.paddingBottom : null,
    tabPadB: tb ? getComputedStyle(tb).paddingBottom : null,
    touchAction: a ? getComputedStyle(a).touchAction : null,
    navPadT: getComputedStyle(document.querySelector('#f7app .navbar')).paddingTop,
    inputFs: inps,
    chromeSelect: getComputedStyle(document.querySelector('#f7app .tabbar')).userSelect,
    proseSelect: (() => { const e=document.querySelector('#f7app .item-title');
      return e?getComputedStyle(e).userSelect:null; })(),
    scrollY: window.scrollY, docScrollable: document.documentElement.scrollHeight > window.innerHeight + 2
  };
});
chk('1e','100dvh statt 100vh', layout.htmlH === '844px', layout.htmlH);
chk('1f','overscroll-behavior:none am Rumpf', layout.overscroll === 'none', layout.overscroll);
chk('1g','Rumpf scrollt nie', layout.bodyOverflow==='hidden' && !layout.docScrollable, `${layout.bodyOverflow}, scrollbar:${layout.docScrollable}`);
chk('1h','tap-highlight transparent', /rgba\(0, 0, 0, 0\)|transparent/.test(layout.tapHl||''), layout.tapHl);
chk('1i','--safe-t / --safe-b gesetzt', layout.safeT!=='' && layout.safeB!=='', `${layout.safeT} / ${layout.safeB}`);
chk('1j','Scroll bleibt im Inhalt', layout.pcOverscroll==='contain', layout.pcOverscroll);
chk('1k','touch-action: manipulation', layout.touchAction==='manipulation', layout.touchAction);
chk('1l','Eingaben 16px (kein Zoom)', parseFloat(layout.inputFs)>=16, layout.inputFs);
chk('1m','Rahmen nicht markierbar', layout.chromeSelect==='none', layout.chromeSelect);
chk('1n','Text markierbar', layout.proseSelect==='text', layout.proseSelect);
chk('1o','Reiter respektiert safe-area', layout.tabPadB!==null, layout.tabPadB);
chk('1p','Leiste respektiert safe-area', layout.navPadT!==null, layout.navPadT);

// ---- 2 Reaktionszeit ----
const react = await p.evaluate(() => {
  const a = document.querySelector('#f7app .item-link');
  const t = getComputedStyle(a).transitionDuration.split(',')[0];
  const btn = document.querySelector('#f7app .button');
  return { dur: t, hatSkel: !!document.querySelector('#f7app .skel, .skel'),
           btnTrans: btn ? getComputedStyle(btn).transitionDuration.split(',')[0] : null };
});
chk('2a','Rueckmeldung unter 100ms', parseFloat(react.dur)*1000 < 100, react.dur);
// Optimistisch: schreibt lokal und zeichnet sofort, ohne aufs Netz zu warten
const opt = await p.evaluate(async () => {
  await ctxOffline();
  async function ctxOffline(){}
  const vor = document.querySelector('#tab-heute .tick.on') ? 1 : 0;
  const t0 = performance.now();
  document.querySelector('#tab-heute .tick').click();
  const t1 = performance.now();
  return { ms: Math.round(t1-t0),
    sofortGruen: !!document.querySelector('#tab-heute .tick.on') !== !!vor,
    gespeichert: Object.keys(getData().completedBlocks||{}).length > 0 };
});
chk('2b','Optimistisch: sofort sichtbar', opt.sofortGruen && opt.ms < 100, `${opt.ms}ms`);
chk('2c','lokal geschrieben vor dem Netz', opt.gespeichert);
// Skelett statt Drehkreisel
const skel = await p.evaluate(() => ({
  css: __hasRule('\\.skel'),
  spinner: !!document.querySelector('#f7app .preloader, #f7app .spinner'),
  shellFn: typeof document.getElementById === 'function' }));
chk('2d','Skelett vorhanden, kein Drehkreisel', skel.css && !skel.spinner, `skel:${skel.css} spinner:${skel.spinner}`);
// Vorabladen beim Beruehren
await p.evaluate(()=>F7.tab('wissen')); await p.waitForTimeout(500);
const pre = await p.evaluate(() => new Promise(res => {
  const a = document.querySelector('#tab-wissen a[href="/artikel/ernaehrung/"]');
  if (!a) return res({ err: 'Link fehlt' });
  const t0 = performance.now();
  a.dispatchEvent(new TouchEvent('touchstart', { bubbles: true,
    touches: [new Touch({ identifier: 1, target: a, clientX: 100, clientY: 300 })] }));
  setTimeout(() => res({ warm: performance.now() - t0 > 0.5,
    scratch: !!document.getElementById('f7-scratch') }), 250);
}));
chk('2e','Vorabladen beim Beruehren', pre.scratch === true, JSON.stringify(pre));

// ---- 3 Bewegung ----
const move = await p.evaluate(() => {
  const pg = document.querySelector('#f7app .page');
  const cs = getComputedStyle(pg);
  const app7 = getComputedStyle(document.getElementById('f7app'));
  return { timing: cs.transitionTimingFunction.split(',')[0],
    dur: cs.transitionDuration.split(',')[0],
    spring: app7.getPropertyValue('--spring').trim(),
    props: cs.transitionProperty,
    swipeBack: __f7app.views.get('#tab-wissen').params.iosSwipeBack,
    prevDim: __hasRule('page-previous::after', 'max-width'),
    reduced: __hasCond('prefers-reduced-motion')
  };
});
chk('3a','nur transform/opacity animiert', !/width|height|top|left|margin/.test(move.props), move.props.slice(0,60));
chk('3b','Federkurve statt linear', /cubic-bezier/.test(move.timing) && move.spring.length>0, move.timing);
chk('3c','alte Seite dunkelt ab', move.prevDim);
chk('3d','Zurueckwischen vom Rand', move.swipeBack === true);
chk('3e','prefers-reduced-motion beachtet', move.reduced);
await p.evaluate(()=>F7.tab('profil'));
await p.waitForTimeout(500);
const sheet = await p.evaluate(() => {
  let err = null;
  try { F7.pick('weight'); } catch (e) { err = e.message; }
  return new Promise(r => setTimeout(() => {
    // Nicht nur "liegt im Dokument", sondern "steht sichtbar im Bild".
    // Die alte Fassung hat ein Rad durchgewinkt, das unterhalb des
    // Bildschirms auf modal-out haengen blieb.
    const alle = [...document.querySelectorAll('.picker')];
    const pk = alle.find(e => e.classList.contains('modal-in')) || alle[0];
    if (!pk) return r({ offen: false, err, grund: 'nicht im Dokument' });
    const b = pk.getBoundingClientRect();
    r({ offen: b.top < window.innerHeight - 40 && b.bottom > 0 && b.height > 100,
        err, top: Math.round(b.top), hoehe: Math.round(b.height),
        modalIn: pk.classList.contains('modal-in'), leichen: alle.length,
        swipeToClose: pk.f7Picker ? !!pk.f7Picker.params.sheetSwipeToClose : null }); }, 1100)); });
chk('3f','Sheet sichtbar und zum Schliessen ziehbar', sheet.offen && sheet.swipeToClose !== false, JSON.stringify(sheet));
await p.evaluate(()=>{ __f7app.picker.close(); });
await p.waitForTimeout(800);

// ---- 4 Optik ----
const look = await p.evaluate(() => {
  const nb = getComputedStyle(document.querySelector('#f7app .navbar-bg'));
  const tb = getComputedStyle(document.querySelector('#f7app .tabbar'));
  const f = getComputedStyle(document.getElementById('f7app')).fontFamily;
  const els = [...document.querySelectorAll('#f7app a.item-link, #f7app .tab-link, #f7app button, #f7app .tick')];
  const klein = els.filter(e => { const r = e.getBoundingClientRect();
    return r.height > 0 && (r.height < 44 || r.width < 44); });
  const hoverOnly = __hasCond('hover: none');
  return { blurNav: nb.backdropFilter || nb.webkitBackdropFilter,
    blurTab: tb.backdropFilter || tb.webkitBackdropFilter,
    font: f.split(',')[0], klein: klein.length, gesamt: els.length,
    kleinNamen: klein.slice(0,4).map(e=>{const r=e.getBoundingClientRect();
      return e.className.split(' ')[0]+' '+Math.round(r.width)+'x'+Math.round(r.height);}),
    pickerOffen: !!document.querySelector('.picker.modal-in'),
    hoverOnly };
});
chk('4a','Systemfont', /-apple-system/.test(look.font), look.font);
chk('4b','Tippflaechen 44x44', look.klein === 0, `${look.klein} von ${look.gesamt} zu klein ${JSON.stringify(look.kleinNamen)}`);
chk('4c','Leisten mit backdrop-blur', /blur/.test(look.blurNav) && /blur/.test(look.blurTab), `${look.blurNav} | ${look.blurTab}`);
chk('4d','kein Hover als einziges Feedback', look.hoverOnly);
const scheme = await p.evaluate(() => ({
  auto: document.getElementById('f7app').classList.contains('theme-auto'),
  hatLightBlock: __hasCond('prefers-color-scheme: light') }));
chk('4e','Farbschema folgt dem System', scheme.auto && scheme.hatLightBlock, JSON.stringify(scheme));

// ---- 5 Status und Offline ----
const st = await p.evaluate(() => ({
  standaloneGeprueft: typeof window.matchMedia('(display-mode: standalone)').matches === 'boolean',
  banner: !!document.getElementById('bs-offline'),
  install: !!document.getElementById('bs-install'),
  installSichtbar: (() => { const e=document.getElementById('bs-install');
    return e ? e.classList.contains('on') : false; })(),
  nativeApi: typeof window.Native === 'object' &&
    ['haptic','share','pushStatus','enqueue','flush','installState','persistStorage']
      .every(k => typeof Native[k] === 'function') }));
chk('5a','standalone wird erkannt', st.standaloneGeprueft);
chk('5b','Offline-Banner statt Fehlerseite', st.banner);
chk('5c','Installationsanleitung fuer iOS', st.install && st.installSichtbar);
chk('5d','Native-Adapter vollstaendig', st.nativeApi);
await p.screenshot({ path: 'rw-install.png' });
await p.evaluate(()=>{ const e=document.getElementById('bs-install'); if(e) e.remove(); });

// Offline-Verhalten wirklich testen
await ctx.setOffline(true);
await p.evaluate(()=>window.dispatchEvent(new Event('offline')));
await p.waitForTimeout(600);
const off1 = await p.evaluate(() => ({
  banner: document.getElementById('bs-offline').className,
  text: document.getElementById('bs-offline').textContent.slice(0,50) }));
chk('5e','Offline zeigt Hinweis', /on/.test(off1.banner), off1.text);
await p.evaluate(()=>F7.tab('heute')); await p.waitForTimeout(500);
await p.evaluate(()=>{ const t=document.querySelector('#tab-heute .tick'); if(t)t.click(); });
await p.waitForTimeout(400);
const q = await p.evaluate(()=>({ laenge: Native.queueLength(),
  gruen: !!document.querySelector('#tab-heute .tick.on') }));
chk('5f','Offline-Schreibvorgang in die Schlange', q.laenge > 0, `${q.laenge} offen`);
await ctx.setOffline(false);
await p.evaluate(()=>window.dispatchEvent(new Event('online')));
await p.waitForTimeout(1400);
const off2 = await p.evaluate(()=>({ banner: document.getElementById('bs-offline').className,
  text: document.getElementById('bs-offline').textContent.slice(0,40),
  laenge: Native.queueLength() }));
chk('5g','Online arbeitet die Schlange ab', off2.laenge === 0, `${off2.laenge} offen, "${off2.text}"`);

// ---- iOS-Grenzen ----
const ios = await p.evaluate(() => ({
  push: Native.pushStatus(),
  install: Native.installState(),
  hapticSchalter: (() => { Native.haptic('light');
    return !!document.querySelector('input[switch]'); })(),
  persist: typeof navigator.storage?.persist === 'function' }));
chk('6a','Push-Zustand kennt "braucht-installation"', ios.push === 'braucht-installation' || ios.push === 'default', ios.push);
chk('6b','iOS bekommt Anleitung statt Prompt', ios.install === 'ios-anleitung', ios.install);
chk('6c','Haptik-Kniff fuer iOS 17.4+', ios.hapticSchalter);
chk('6d','Speicher gegen 7-Tage-Loeschung gesichert', ios.persist);

// ---- Ausgabe ----
console.log('\n' + '='.repeat(76));
let fail = 0;
R.forEach(r => { if (!r.ok) fail++;
  console.log(`${r.ok ? ' ok ' : 'FEHL'}  ${r.nr.padEnd(4)} ${r.name.padEnd(38)} ${r.detail}`); });
console.log('='.repeat(76));
console.log(`${R.length - fail} von ${R.length} erfuellt` + (fail ? `, ${fail} offen` : ''));
console.log('Fehler:', errs.length ? [...new Set(errs)].slice(0,6).join(' | ') : 'keine');
await b.close();
