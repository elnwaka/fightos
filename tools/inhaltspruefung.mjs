import { chromium } from 'playwright';
/* Prueft, dass JEDER Text aus den Daten irgendwo auf einem Bildschirm
   landet. Nicht "sind Bloecke da", sondern "ist der Inhalt sichtbar".
   Genau hier ist mir doc.intro durchgerutscht: 1400 Zeichen lagen in
   den Daten und wurden nie gezeichnet, weil mein Leser nur sections las. */
const KEY = process.argv[2] || 'periodisierung';
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
 colorScheme:'dark', reducedMotion:'no-preference',
 userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15'});
const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('https://boxspec.app/app.html',{waitUntil:'domcontentloaded'});
await p.evaluate(()=>{localStorage.setItem('fos_users',JSON.stringify({t:{pass:'firebase',onboardingDone:true,seenIntro:true,nickname:'C',weight:78,height:182,experienceLevel:'wettkampf',gymAccess:'full',trainingProgram:'10w',program10wStart:new Date(Date.now()-14*864e5).toISOString().slice(0,10)}}));localStorage.setItem('fos_current','t');localStorage.setItem('bs_install_seen','1');localStorage.setItem('fos_data_t',JSON.stringify({fights:[],log:[],hrv:[],weekPlan:{},completedBlocks:{},tests:{},notizen:[]}));});
await p.goto('https://boxspec.app/app.html',{waitUntil:'load'}); await p.waitForTimeout(1200);
await p.evaluate(()=>{const a=document.getElementById('auth-screen'),s=document.getElementById('app-screen');
 if(a)a.style.cssText='display:none!important'; if(s){s.classList.add('active');s.style.cssText='display:block!important';}});
await p.waitForSelector('#f7-root .page-content',{timeout:15000}); await p.waitForTimeout(600);
await p.evaluate(()=>F7.tab('wissen')); await p.waitForTimeout(400);
await p.evaluate(k=>F7.open('/artikel/'+k+'/'), KEY); await p.waitForTimeout(1400);

// Alles einsammeln, was auf den Bildschirmen steht
const gesehen = [];
gesehen.push(await p.evaluate(()=>document.querySelector('#tab-wissen .page-current .page-content').innerText));
const wege = await p.evaluate(()=>[...document.querySelectorAll('#tab-wissen .page-current a[href^="/kapitel/"]')].map(a=>a.getAttribute('href')));
for (const w of wege){
  await p.evaluate(u=>F7.open(u), w); await p.waitForTimeout(800);
  gesehen.push(await p.evaluate(()=>document.querySelector('#tab-wissen .page-current .page-content').innerText));
  await p.evaluate(()=>{__f7app.views.get('#tab-wissen').router.back();}); await p.waitForTimeout(550);
}
const sichtbar = gesehen.join(' ').replace(/\s+/g,' ');

// Was steht in den Daten?
const daten = await p.evaluate(k=>{
  const c = Content.get(k);
  const raus = [];
  const nimm = v => { if (typeof v === 'string' && v.trim()) raus.push(Content.plain(v)); };
  const geh = b => {
    if (!b || typeof b !== 'object') return;
    ['text','title','label','value','caption','alt','when','name','sub'].forEach(f => nimm(b[f]));
    (b.items||[]).forEach(i => typeof i === 'string' ? nimm(i) : geh(i));
    (b.details||[]).forEach(nimm);
    (b.legend||[]).forEach(geh); (b.conditioning||[]).forEach(geh);
    (b.head||[]).forEach(nimm); (b.rows||[]).forEach(r => (r||[]).forEach(nimm));
    (b.blocks||[]).forEach(geh);
  };
  nimm(c.sub);
  (c.intro||[]).forEach(geh);
  (c.sections||[]).forEach(s => { nimm(s.title); (s.blocks||[]).forEach(geh); });
  return raus;
}, KEY);

// Kleinschreibung, weil innerText die CSS-Versalien mitliefert:
// Etiketten stehen im Bild gross, in den Daten gemischt.
const norm = s => s.replace(/\s+/g,' ').replace(/[–—]/g,'-').trim().toLowerCase();
const S = norm(sichtbar);
const fehlt = daten.filter(t => {
  const n = norm(t);
  return n.length > 12 && S.indexOf(n) === -1;
});
console.log(`Seite ${KEY}: ${daten.length} Textstuecke in den Daten, ${gesehen.length} Bildschirme gelesen`);
console.log(`Sichtbarer Text: ${S.length} Zeichen`);
if (fehlt.length) {
  console.log(`\nNICHT SICHTBAR: ${fehlt.length} Stueck`);
  fehlt.slice(0,12).forEach(t=>console.log('  - '+t.slice(0,90)));
} else console.log('\nAlles aus den Daten steht auf einem Bildschirm.');
console.log('Fehler:', errs.length?[...new Set(errs)].join(' | '):'keine');
await b.close();
process.exit(fehlt.length ? 1 : 0);
