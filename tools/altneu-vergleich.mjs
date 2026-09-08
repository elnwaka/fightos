import { chromium } from 'playwright';
/* Vergleicht die alte gerenderte Seite mit der neuen Datenfassung.
   Nicht Bloecke gegen Bloecke, sondern Satz gegen Satz auf dem
   Bildschirm. Das ist die einzige Pruefung, die "es ist nichts
   verloren gegangen" wirklich belegt. */
const KEY  = process.argv[2] || 'ernaehrung';
const ELT  = { ernaehrung: ['training','ernaehrung'], periodisierung: ['training','periodisierung'],
               regeneration: ['training','regeneration'], mental: ['training','mental'],
               saeulen: ['profil','saeulen'] }[KEY];

const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true,
  colorScheme:'dark', reducedMotion:'no-preference',
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15' });
const p = await ctx.newPage();
await p.goto('http://localhost:8899/app.html',{waitUntil:'domcontentloaded'});
await p.evaluate(()=>{localStorage.setItem('fos_users',JSON.stringify({t:{pass:'firebase',onboardingDone:true,seenIntro:true,nickname:'C',weight:78,height:182,experienceLevel:'wettkampf',gymAccess:'full'}}));localStorage.setItem('fos_current','t');localStorage.setItem('bs_install_seen','1');localStorage.setItem('fos_data_t',JSON.stringify({fights:[],log:[],hrv:[],weekPlan:{},completedBlocks:{},tests:{},notizen:[],program10wStart:new Date(Date.now()-21*864e5).toISOString().slice(0,10)}));});
await p.goto('http://localhost:8899/app.html',{waitUntil:'load'});
await p.waitForTimeout(1200);
await p.evaluate(()=>{const a=document.getElementById('auth-screen'),s=document.getElementById('app-screen');
 if(a)a.style.cssText='display:none!important'; if(s){s.classList.add('active');s.style.cssText='display:block!important';}});
await p.waitForSelector('#f7-root .page-content',{timeout:15000});
await p.waitForTimeout(600);

// ---- ALT: die Desktop-Seite rendern und ihren Text nehmen ----
const alt = await p.evaluate(async ([par, sub]) => {
  await new Promise(r => { const sc=document.createElement('script'); sc.src='js/pages.js';
    sc.onload=r; sc.onerror=r; document.head.appendChild(sc); });
  // Nicht jede Seite rendert in den Container ihres Reiters: Mental
  // hat einen eigenen. Also erst rendern lassen, dann den Container
  // suchen, der wirklich gefuellt ist.
  /* Nicht jede Seite haengt am Reiter-Renderer: Mental hat einen
     eigenen und fuellt seinen eigenen Container. Erst den direkten
     Weg versuchen, dann den ueber den Reiter. */
  try {
    var direkt = window['render' + sub.charAt(0).toUpperCase() + sub.slice(1) + 'Page'];
    if (typeof direkt === 'function') direkt();
    if (par === 'training') { window._trainingSubTab = sub; renderTrainingPage(sub); }
    else { window._profilSubTab = sub; renderProfilPage(sub); }
  } catch (e) { /* der direkte Weg hat schon gefuellt */ }
  const el = (document.getElementById('page-' + sub) &&
              document.getElementById('page-' + sub).innerHTML.length > 500)
    ? document.getElementById('page-' + sub)
    : document.getElementById('page-' + par);
  // Die Klappen der alten Ansicht aufmachen, sonst zaehlt innerText
  // den verborgenen Teil nicht mit.
  el.querySelectorAll('[hidden]').forEach(x => x.hidden = false);
  el.querySelectorAll('.card-body').forEach(x => x.classList.add('expanded'));
  el.style.cssText = 'display:block;position:absolute;left:-9999px;top:0;width:390px';
  const t = el.innerText;
  el.style.cssText = '';
  return t;
}, ELT);

// ---- NEU: alle Bildschirme der Datenfassung ----
await p.evaluate(()=>F7.tab('wissen'));
await p.waitForTimeout(500);
await p.evaluate(k=>F7.open('/artikel/'+k+'/'), KEY);
await p.waitForTimeout(1300);
const neuTeile = [];
neuTeile.push(await p.evaluate(()=>document.querySelector('#tab-wissen .page-current .page-content').innerText));
const wege = await p.evaluate(()=>[...document.querySelectorAll('#tab-wissen .page-current a[href^="/kapitel/"]')].map(a=>a.getAttribute('href')));
for (const w of wege) {
  await p.evaluate(u=>F7.open(u), w); await p.waitForTimeout(750);
  neuTeile.push(await p.evaluate(()=>document.querySelector('#tab-wissen .page-current .page-content').innerText));
  await p.evaluate(()=>{__f7app.views.get('#tab-wissen').router.back();}); await p.waitForTimeout(500);
}
const neu = neuTeile.join('\n');

/* Die Umstellung deutscht systematisch ein: "15-20 Min." wird zu
   "15 bis 20 Minuten", "Supps" zu "Supplements". Das ist eine
   Verbesserung, ein roher Wortvergleich meldet sie aber als Verlust.
   Zahlenbereiche und die haeufigsten Abkuerzungen werden deshalb auf
   eine Form gebracht. Was danach fehlt, fehlt wirklich. */
const norm = s => String(s).replace(/\s+/g,' ').replace(/[–—]/g,'-')
  .replace(/[„“”"']/g,'').toLowerCase()
  .replace(/(\d)\s*bis\s*(\d)/g, '$1-$2')
  .replace(/min\.?/g, 'minuten')
  .replace(/std\.?/g, 'stunden')
  .replace(/wdh\.?/g, 'wiederholungen')
  .replace(/supps/g, 'supplements')
  .replace(/blaublicht/g, 'blaulicht')
  .replace(/post-training/g, 'nach dem training')
  .replace(/\s*°\s*c/g, '°c');

/* Satzvergleich ist zu sproede: die alte Seite verkettet Ueberschrift
   und Liste anders, und aufgeloeste Tooltips stehen jetzt als eigene
   Karten. Verglichen wird deshalb auf Wortebene. Ein Wort das in der
   alten Seite steht und in der neuen fehlt ist ein echter Verlust,
   egal wie die Saetze umgebaut wurden. */
const woerter = s => {
  const m = norm(s).match(/[a-zäöüß0-9][a-zäöüß0-9.,/-]{4,}/g) || [];
  const z = {};
  m.forEach(w => { const k = w.replace(/[.,]+$/,''); if (k.length >= 5) z[k] = (z[k]||0)+1; });
  return z;
};
// Was nur zur alten Oberflaeche gehoert, nicht zum Inhalt
const CHROME = new Set(['uebungen','ernaehrung','recovery','tests','training','profil',
  'wissen','kaempfe','heute','abmelden','einstellungen','startseite']);

const A = woerter(alt), N = woerter(neu);
const fehlend = Object.keys(A).filter(w => !N[w] && !CHROME.has(w));
const knapp   = Object.keys(A).filter(w => N[w] && N[w] < A[w] - 1);

console.log(`Alt: ${norm(alt).length} Zeichen, ${Object.keys(A).length} verschiedene Woerter`);
console.log(`Neu: ${norm(neu).length} Zeichen, ${Object.keys(N).length} verschiedene Woerter`);
console.log(`
Woerter aus der alten Seite, die in der neuen fehlen: ${fehlend.length}`);
fehlend.slice(0,30).forEach(w => console.log('  - ' + w + '  (alt ' + A[w] + 'x)'));
if (knapp.length) {
  console.log(`
Deutlich seltener: ${knapp.length}`);
  knapp.slice(0,12).forEach(w => console.log('  - ' + w + '  alt ' + A[w] + 'x, neu ' + N[w] + 'x'));
}
await b.close();
