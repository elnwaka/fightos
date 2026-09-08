import { chromium } from 'playwright';
/* Rendert eine Seite mit zwei Gewichten und vergleicht Textstueck fuer
   Textstueck. Was sich aendert, MUSS eine echte Pro-Kilo-Angabe sein.
   Aendert sich etwas anderes, steht dort eine feste Zahl, die
   faelschlich gerechnet wird. Das prueft nicht ob Text da ist,
   sondern ob er sich veraendern darf. */
const KEY = process.argv[2] || 'ernaehrung';
const b = await chromium.launch();

async function lauf(kg) {
  const ctx = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true,
    colorScheme:'dark', reducedMotion:'no-preference',
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15' });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8899/app.html',{waitUntil:'domcontentloaded'});
  await p.evaluate(w=>{localStorage.setItem('fos_users',JSON.stringify({t:{pass:'firebase',onboardingDone:true,seenIntro:true,nickname:'C',weight:w,height:182,experienceLevel:'wettkampf',gymAccess:'full'}}));localStorage.setItem('fos_current','t');localStorage.setItem('bs_install_seen','1');localStorage.setItem('fos_data_t',JSON.stringify({fights:[],log:[],hrv:[],weekPlan:{},completedBlocks:{},tests:{},notizen:[]}));}, kg);
  await p.goto('http://localhost:8899/app.html',{waitUntil:'load'}); await p.waitForTimeout(1200);
  await p.evaluate(()=>{const a=document.getElementById('auth-screen'),s=document.getElementById('app-screen');
   if(a)a.style.cssText='display:none!important'; if(s){s.classList.add('active');s.style.cssText='display:block!important';}});
  await p.waitForSelector('#f7-root .page-content',{timeout:15000}); await p.waitForTimeout(600);
  await p.evaluate(()=>F7.tab('wissen')); await p.waitForTimeout(400);
  await p.evaluate(k=>F7.open('/artikel/'+k+'/'), KEY); await p.waitForTimeout(1400);
  const teile=[];
  const hol = async () => p.evaluate(()=>[...document.querySelectorAll(
    '#tab-wissen .page-current .page-content .prose, #tab-wissen .page-current .item-title, ' +
    '#tab-wissen .page-current .item-after, #tab-wissen .page-current .bs-table td, ' +
    '#tab-wissen .page-current .bs-table th, #tab-wissen .page-current .bs-list li')]
    .map(e=>e.textContent.replace(/\s+/g,' ').trim()).filter(Boolean));
  teile.push(...await hol());
  const wege=await p.evaluate(()=>[...document.querySelectorAll('#tab-wissen .page-current a[href^="/kapitel/"]')].map(a=>a.getAttribute('href')));
  for (const w of wege){
    await p.evaluate(u=>F7.open(u), w); await p.waitForTimeout(700);
    teile.push(...await hol());
    await p.evaluate(()=>{__f7app.views.get('#tab-wissen').router.back();}); await p.waitForTimeout(500);
  }
  await ctx.close();
  return teile;
}
const A = await lauf(60), B2 = await lauf(95);
console.log(`60 kg: ${A.length} Textstuecke | 95 kg: ${B2.length}`);
if (A.length !== B2.length) console.log('ACHTUNG: unterschiedlich viele Stuecke, Vergleich unsicher');
const n = Math.min(A.length, B2.length);
const anders = [];
for (let i=0;i<n;i++) if (A[i] !== B2[i]) anders.push([A[i], B2[i]]);
console.log(`\nAendert sich mit dem Gewicht: ${anders.length} Stueck`);
anders.forEach(([a,c])=>console.log('  60kg: '+a.slice(0,70)+'\n  95kg: '+c.slice(0,70)+'\n'));
await b.close();
