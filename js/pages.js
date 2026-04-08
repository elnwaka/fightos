/* ============================================
   FIGHTOS – Page Content Renderer
   All static page content (Säulen, Übungen, etc.)
   ============================================ */

function renderAllPages() {
  renderSaeulenPage();
  renderUebungenPage();
  renderErnaehrungPage();
  renderCuttenPage();
  renderPeriodisierungPage();
  renderRegenerationPage();
  renderSupplementsPage();
  renderMentalPage();
  renderRechnerPage();
  renderFAQPage();

  // Progressive Disclosure – collapse heavy sections, first open by default
  applyPD('page-ernaehrung', 'ern-s', true);
  applyPD('page-periodisierung', 'peri-s', true);
}

// ===== TOOLTIP HELPER =====
function tt(term, explanation) {
  return `<span class="tt">${term}<span class="tt-text">${explanation}</span></span>`;
}


// ===== SÄULEN =====
function renderSaeulenPage() {
  const el = document.getElementById('page-saeulen');

  // Display order: KÖRPER → KOPF → SYSTEM
  // saeulenData indices: 0=Kraft, 1=Metabolisch, 2=Kognitiv, 3=Ernährung, 4=Regeneration, 5=Ring IQ, 6=Psyche, 7=Mobilität
  const displayOrder = [0,1,7, 2,5,6, 3,4];
  const clusters = [
    { name:'KÖRPER', color:'var(--red)', sub:'Kraft, Ausdauer & physische Leistungsfähigkeit', indices:[0,1,7] },
    { name:'KOPF', color:'var(--blue)', sub:'Kognition, Taktik & mentale Stärke', indices:[2,5,6] },
    { name:'SYSTEM', color:'var(--green)', sub:'Ernährung, Regeneration & Belastungssteuerung', indices:[3,4] }
  ];

  el.innerHTML = `

  <!-- INTRO SECTION -->
  <div class="saeulen-intro" id="saeulen-intro">

    <div class="si-hero">
      <div class="si-hero-label">DAS SYSTEM</div>
      <div class="si-hero-title">EIN BOXER IST NUR SO STARK<br>WIE SEIN <span>SCHWÄCHSTES GLIED</span></div>
    </div>

    <div class="si-narrative">

      <div class="si-step si-step-1">
        <div class="si-step-num">01</div>
        <div class="si-step-body">
          <div class="si-step-title">Boxen ist kein eindimensionaler Sport</div>
          <div class="si-step-text">Die meisten Boxer trainieren nur Technik und Kondition – und wundern sich, warum sie in Runde 3 einbrechen, Treffer nicht kommen sehen oder sich nach dem Sparring tagelang nicht erholen. Die Wahrheit: Boxleistung entsteht aus dem Zusammenspiel von <strong>8 fundamentalen Leistungsbereichen</strong>. GB Boxing, USA Boxing und die kubanische Boxschule arbeiten alle mit diesem Prinzip. Wer nur 2–3 davon trainiert, hat offene Flanken – egal wie gut die Technik ist.</div>
        </div>
      </div>

      <div class="si-step si-step-2">
        <div class="si-step-num">02</div>
        <div class="si-step-body">
          <div class="si-step-title">Das Fass-Prinzip</div>
          <div class="si-step-text">Stell dir deine Leistung als Fass vor. Jede Säule ist ein Brett. Das Wasser steht nur so hoch wie das <strong>niedrigste Brett</strong>. Du kannst die stärkste Rechte im Gym haben – wenn deine Ausdauer nach 2 Runden kollabiert, nützt dir die Kraft nichts. Du kannst eine VO₂max von 60 haben – wenn du mental in Runde 3 aufgibst, ist die Fitness verschenkt. Alles hängt zusammen.</div>
        </div>
      </div>

      <!-- VISUAL: BARREL DIAGRAM -->
      <div class="si-barrel-wrap">
        <div class="si-barrel" id="si-barrel">
          <div class="si-barrel-water" id="si-barrel-water"></div>
          ${['Kraft','Ausdauer','Kognition','Taktik','Psyche','Ernährung','Recovery','Mobilität'].map((name, i) => {
            const weak = i === 7;
            return `<div class="si-barrel-stave ${weak ? 'si-stave-weak' : ''}" style="--si:${i};--total:8;" data-name="${name}">
              <span>${name}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="si-barrel-caption">Die <strong style="color:var(--red);">Mobilität</strong> ist das schwächste Brett – das gesamte Leistungsniveau sinkt auf dieses Level.</div>
      </div>

      <div class="si-step si-step-3">
        <div class="si-step-num">03</div>
        <div class="si-step-body">
          <div class="si-step-title">3 Cluster, 8 Säulen, 1 System</div>
          <div class="si-step-text">Die 8 Säulen sind in 3 Cluster gruppiert – Bereiche, die zusammengehören und sich gegenseitig verstärken. Schlechter Schlaf senkt deine Erholung, schlechte Erholung senkt die Trainingsqualität, weniger Qualität heißt weniger Kraftzuwachs. Schwäche in einem Cluster zieht die anderen mit runter.</div>
        </div>
      </div>

      <!-- CLUSTER PREVIEW -->
      <div class="si-clusters">
        <div class="si-cluster-card" style="--scc:var(--red);">
          <div class="si-cluster-name">KÖRPER</div>
          <div class="si-cluster-desc">Kraft, Ausdauer, Mobilität</div>
          <div class="si-cluster-count">3 Säulen</div>
        </div>
        <div class="si-cluster-card" style="--scc:var(--blue);">
          <div class="si-cluster-name">KOPF</div>
          <div class="si-cluster-desc">Kognition, Taktik, Psychologie</div>
          <div class="si-cluster-count">3 Säulen</div>
        </div>
        <div class="si-cluster-card" style="--scc:var(--green);">
          <div class="si-cluster-name">SYSTEM</div>
          <div class="si-cluster-desc">Ernährung, Regeneration</div>
          <div class="si-cluster-count">2 Säulen</div>
        </div>
      </div>

      <div class="si-step si-step-4">
        <div class="si-step-num">04</div>
        <div class="si-step-body">
          <div class="si-step-title">Dein Ziel: Kein Brett kürzer als die anderen</div>
          <div class="si-step-text">Du musst nicht in allen 8 Säulen perfekt sein. Aber du darfst keine davon komplett ignorieren. Identifiziere dein schwächstes Brett, arbeite gezielt daran – und dein gesamtes Leistungsniveau steigt. Klick auf eine Säule unten, um die Wissenschaft, die konkreten Trainingsmethoden und die Übungen zu sehen.</div>
        </div>
      </div>

    </div>

    <div class="si-scroll-cta" id="si-scroll-cta">
      <div class="si-scroll-line"></div>
      <div class="si-scroll-text">DIE 8 SÄULEN</div>
      <div class="si-scroll-line"></div>
    </div>

  </div>

  <!-- PILLAR CARDS -->
  <div id="saeulen-cards" class="saeulen-cards-wrap">
  ${clusters.map(c => `
    <div class="sc-cluster-head">
      <div class="sc-cluster-line" style="background:${c.color};"></div>
      <div class="sc-cluster-label" style="color:${c.color};">${c.name}</div>
      <div class="sc-cluster-sub">${c.sub}</div>
    </div>
    <div class="sc-grid">
      ${c.indices.map(i => {
        const s = saeulenData[i];
        const dispNum = displayOrder.indexOf(i) + 1;
        return `<div class="sc-card" onclick="openSaeuleDetail(${i})">
          <div class="sc-card-left" style="border-left:3px solid ${s.color};">
            <div class="sc-card-num" style="color:${s.color};">${String(dispNum).padStart(2,'0')}</div>
          </div>
          <div class="sc-card-body">
            <div class="sc-card-cat">${s.category}</div>
            <div class="sc-card-title">${s.name}</div>
            <div class="sc-card-desc">${s.short || ''}</div>
            <div class="sc-card-foot">
              <div class="sc-card-tags">
                ${s.tags.map(t => '<span class="tag '+t.cls+'">'+t.text+'</span>').join('')}
              </div>
              <div class="sc-card-arrow">→</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  `).join('')}
  </div>`;

  // Trigger scroll-based reveal animations
  requestAnimationFrame(() => initSaeulenIntroObserver());
}

function initSaeulenIntroObserver() {
  const steps = document.querySelectorAll('.si-step, .si-barrel-wrap, .si-clusters, .si-scroll-cta');
  if (!steps.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('si-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  steps.forEach(s => observer.observe(s));

  // Animate barrel staves sequentially
  const barrel = document.getElementById('si-barrel');
  if (barrel) {
    const barrelObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          barrel.classList.add('si-barrel-animate');
          barrelObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    barrelObs.observe(barrel);
  }
}

// Mapping: Säule index → exercise IDs + linked page
const saeulenExercises = {
  0: { exerciseIds: ['trap-bar-deadlift','jump-squat','hip-thrust','power-clean','bench-press','explosive-pushup','landmine-press','overcoming-iso','single-leg-rdl','med-ball-rotation','bfr'] },
  1: { exerciseIds: ['zone2','hiit-4x4','fartlek','sit-sprints','imt'] },
  2: { exerciseIds: ['shadow-boxing'], linkedPage:'saeulen', linkedLabel:'Kognitions-Training Details' },
  3: { exerciseIds: [], linkedPage:'ernaehrung', linkedLabel:'Ernährungs-Seite' },
  4: { exerciseIds: [], linkedPage:'regeneration', linkedLabel:'Recovery-Seite' },
  5: { exerciseIds: [], linkedPage:'fights', linkedLabel:'Kampfanalyse & Taktik' },
  6: { exerciseIds: [], linkedPage:'mental', linkedLabel:'Mentaltraining-Seite' },
  7: { exerciseIds: ['iso-nacken','nacken-flexion'] }
};

function openSaeuleDetail(idx) {
  const s = saeulenData[idx];
  if (!s) return;
  const mapping = saeulenExercises[idx] || { exerciseIds: [] };
  const exercises = (mapping.exerciseIds || []).map(id => allExercises.find(e => e.id === id)).filter(Boolean);
  const el = document.getElementById('page-saeulen-detail');

  el.innerHTML = `
  <div style="margin-bottom:24px;">
    <button class="back-link" onclick="showPage('saeulen')">← Zurück zu Säulen</button>
  </div>

  <div class="page-header">
    <div class="card-lbl" style="font-size:11px;">Säule ${String(([0,1,7,2,5,6,3,4].indexOf(idx)+1)||idx+1).padStart(2,'0')} · ${s.category}</div>
    <div class="page-title" style="color:${s.color};">${s.name}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
      ${s.tags.map(t => '<span class="tag '+t.cls+'">'+t.text+'</span>').join('')}
    </div>
  </div>

  <div class="detail-content">
    <div class="detail-section">
      <div class="detail-section-title">WISSENSCHAFT & HINTERGRUND</div>
      <div class="detail-text">${s.desc}</div>
    </div>

    ${exercises.length > 0 ? `
    <div class="detail-section">
      <div class="detail-section-title">EMPFOHLENE TRAININGSMETHODEN</div>
      <div class="grid-auto">
        ${exercises.map((e, i) => {
          const color = exerciseColors[e.id] || 'var(--white)';
          return exCard(e, i+1, color);
        }).join('')}
      </div>
    </div>` : ''}

    ${mapping.linkedPage ? `
    <div class="detail-section">
      <div class="detail-section-title">WEITERFÜHREND</div>
      <button class="link-card" onclick="showPage('${mapping.linkedPage}')">
        <span>→ ${mapping.linkedLabel}</span>
        <span style="font-family:'Space Mono',monospace;font-size:11px;color:#555;">Komplette Informationen</span>
      </button>
    </div>` : ''}
  </div>`;

  showPage('saeulen-detail');
}

const saeulenData = [
  // === SÄULE 01: KRAFT, POWER & SCHNELLIGKEIT ===
  { name:'KRAFT, POWER & SCHNELLIGKEIT', category:'Fundament', color:'var(--red)',
    short:'Maximalkraft, Explosivität, Handgeschwindigkeit, Agilität. Die kinetische Kette vom Boden bis zur Faust – inklusive BFR als Trainingsmethode.',
    desc:`<strong style="font-size:15px;">WARUM DAS FÜR BOXER ENTSCHEIDEND IST</strong><br>
Ein Boxschlag ist keine Armbewegung – er ist eine ganzkörperliche Explosion. Die ${tt('Kinetische Kette','Die Abfolge der Kraftübertragung: Boden → Fuß → Knie → Hüfte → Core → Schulter → Faust. Jedes schwache Glied reduziert die Endkraft.')} beginnt am Boden: Dein hinterer Fuß drückt sich ab, Hüfte rotiert, Core überträgt, Schulter beschleunigt, Faust trifft. Loturco et al. (2016) zeigten: Stärkere Boxer schlagen <strong>2.6× härter</strong> als schwächere bei gleichem Körpergewicht. Jedes schwache Glied in dieser Kette kostet dich Kraft am Ende.<br><br>

<strong style="font-size:15px;">KRAFT – DAS FUNDAMENT</strong><br>
<strong>Schlagkraft = Bodenreaktionskraft × Übertragungseffizienz.</strong> Wenn du schlägst, drückt dein Fuß mit bis zu dem 2,5-fachen deines Körpergewichts in den Boden (${tt('GRF','Ground Reaction Force – Bodenreaktionskraft. Newton\'s drittes Gesetz: Der Boden drückt genauso stark zurück wie du hineindrückst. Diese Kraft wandert durch deinen Körper in den Schlag.')}). Die Korrelation zwischen ${tt('CMJ','Counter Movement Jump – Sprung aus dem Stand mit Ausholbewegung. Misst explosive Beinkraft, die direkt auf Schlagkraft übertragbar ist.')}-Sprunghöhe und Schlagkraft liegt bei <strong>r=0.72–0.80</strong> (Turner et al. 2011) – beides nutzt dieselbe ${tt('Triple Extension','Gleichzeitige Streckung von Sprunggelenk, Knie und Hüfte – dieselbe explosive Bewegung beim Springen, Sprinten und Schlagen.')} von Sprunggelenk, Knie und Hüfte.<br><br>

Maximalkrafttraining erhöht die ${tt('Rekrutierung motorischer Einheiten','Dein Gehirn aktiviert Muskelfasern in Paketen (motorische Einheiten). Untrainierte nutzen nur 60–70% ihrer Fasern. Krafttraining lehrt das Nervensystem, mehr Einheiten gleichzeitig zu feuern.')} – du lernst, mehr Muskelfasern gleichzeitig zu aktivieren. Schweres Training (>85% 1RM) rekrutiert die schnellen Typ-II-Fasern. GB Boxing S&C-Coach Danny Wilson empfiehlt als Kernübungen: <strong>Trap Bar Deadlift</strong> (gelenkschonender als konventionell, hohe Kraftentwicklung), <strong>Safety Bar Squat</strong> (schont Schultern für Boxer), <strong>Hip Thrust</strong> und <strong>Landmine Press</strong> (unilateral, schulterfreundlich). Dazu <strong>Single-Leg-Arbeit</strong> (Bulgarian Split Squat, Single-Leg RDL) – Boxen ist ein unilateraler Sport, du stehst nie symmetrisch.<br><br>

<strong style="font-size:15px;">SCHNELLKRAFT & GESCHWINDIGKEIT</strong><br>
Kraft allein reicht nicht. Im Boxen hast du nur <strong>50–100 Millisekunden</strong>, um maximale Kraft zu entwickeln. Die ${tt('RFD','Rate of Force Development – wie schnell du Kraft aufbauen kannst. Gemessen in Newton pro Sekunde. Trainiert durch explosive Übungen und schwere Grundübungen.')} (Rate of Force Development) bestimmt, wie schnell du Kraft aufbauen kannst. Čepulėnas et al. (2019) zeigten: 8 Wochen Krafttraining → <strong>+14% Schlagkraft, +11% Schlaggeschwindigkeit</strong>. Für die Schnellkraftentwicklung setzt Boxing Science auf <strong>Trap Bar Jumps</strong> (sicherer als Power Cleans, gleiche Explosivität), <strong>Med-Ball-Rotationswürfe</strong> (boxspezifische Rotationspower) und <strong>Plyometrie</strong> (Depth Jumps, Hurdle Hops). Dazu <strong>Loaded Carries</strong> (Farmer Walks, Suitcase Carries) für Core-Stabilität und Griffkraft unter Ermüdung.<br><br>

<strong style="font-size:15px;">TRAININGSMETHODE: BFR (BLOOD FLOW RESTRICTION)</strong><br>
${tt('BFR','Blood Flow Restriction – Manschetten drosseln den venösen Rückfluss. Erzeugt Muskelwachstum bei nur 20–30% des normalen Gewichts.')} als Finisher nach dem S&C-Training: Manschetten drosseln den venösen Rückfluss, wodurch du mit nur 20–30% 1RM vergleichbare Hypertrophie erzielst. Für Boxer ideal: Muskelaufbau mit minimaler Gelenkbelastung und schneller Erholung. Amani-Shalamzari et al. (2025) zeigten bei Elite-Boxern: 8 Wochen BFR → <strong>Jab +18%, Cross +21%</strong>. Protokoll: 30-15-15-15 Reps bei 40–50% Okklusion, 2–3×/Woche.<br><br>

<strong style="font-size:15px;">EMPFOHLENES PROGRAMM</strong><br>
<strong>Maximalkraft (2×/Woche, 3–5 Reps, >85% 1RM):</strong><br>
• Trap Bar Deadlift oder Safety Bar Squat · Hip Thrust · Landmine Press · Pendlay Row<br>
• Single-Leg: Bulgarian Split Squat, Single-Leg RDL<br><br>
<strong>Schnellkraft (2×/Woche, 3–5 Reps, explosiv):</strong><br>
• Trap Bar Jumps · Med-Ball-Rotationswürfe · Depth Jumps · Hurdle Hops<br>
• Loaded Carries: Farmer Walk, Suitcase Carry (3×30m)<br><br>
<strong>BFR-Finisher (2–3×/Woche, post-S&C):</strong><br>
• Curls, Trizep-Extensions, Schulter-Raises mit Manschetten<br><br>
<strong>Periodisierung nach GB Boxing:</strong> Off-Season → Maximalkraft aufbauen (4–6 Wo.) → Schnellkraft-Conversion (3–4 Wo.) → Wettkampf-Phase: Erhalt + Explosivität. Nie nur schwer ODER nur schnell.`,
    tags:[{text:'3×/Woche',cls:'tag-red'},{text:'45–55 Min.',cls:'tag-blue'},{text:'Kraft + Speed + BFR',cls:'tag-gold'}]},

  { name:'METABOLISCHE KAPAZITÄT', category:'Aerob', color:'var(--red)',
    short:'VO₂max, Laktatschwelle, PCr-Resynthese, Atemmuskulatur. Dein aerober Motor entscheidet, ob du in Runde 3 noch da bist.',
    desc:`<strong style="font-size:15px;">WARUM DAS FÜR BOXER ENTSCHEIDEND IST</strong><br>
Du denkst vielleicht: „Boxen ist anaerob – kurze Explosionen, nicht Joggen." Das stimmt für einzelne Aktionen. Aber ein 3×3-Min.-Kampf wird zu <strong>73–86% aerob</strong> gedeckt (Davis et al. 2013, Smith 2006). Das Work-to-Rest-Verhältnis liegt bei etwa <strong>18:1</strong> – im Vergleich zu 1:1 bei MMA. Dein aerober Motor entscheidet, ob du in Runde 3 noch genauso schnell und hart schlägst wie in Runde 1 – oder ob du zum Sandsack wirst.<br><br>

<strong style="font-size:15px;">DAS ENERGIE-PARADOX IM BOXEN</strong><br>
Jeder Schlag, jede Ausweichbewegung verbraucht ${tt('PCr','Phosphokreatin – der schnellste Energieträger deines Körpers. Liefert Energie für ~10 Sekunden maximale Anstrengung. Wird in Pausen durch Sauerstoff wiederhergestellt.')} – deinen schnellsten Energieträger. PCr reicht nur für ca. 10 Sekunden maximale Anstrengung. In der 1-Minuten-Pause zwischen den Runden muss dein Körper PCr wieder auffüllen. Und genau DAS macht das aerobe System. Je höher deine ${tt('VO₂max','Maximale Sauerstoffaufnahme – wie viel Sauerstoff dein Körper pro Minute verwerten kann. Der Goldstandard für Ausdauerleistung. Gemessen in ml/kg/min.')}, desto schneller regeneriert dein PCr, desto mehr Power hast du in der nächsten Runde. Khanna & Manna (2006) zeigten: Elite-Boxer haben <strong>15–20% höhere VO₂max</strong> als Amateur-Boxer.<br><br>

<strong>Mitochondrien – deine zellulären Kraftwerke:</strong> In jeder Muskelzelle sitzen hunderte ${tt('Mitochondrien','Winzige Organellen in deinen Zellen, die Sauerstoff + Nährstoffe in Energie (ATP) umwandeln. Mehr Mitochondrien = mehr Ausdauer, schnellere Erholung. Werden durch Zone-2-Training vermehrt.')}. Zone-2-Training vermehrt diese Mitochondrien – mehr Kraftwerke = mehr Energieproduktion = bessere Erholung zwischen intensiven Phasen.<br><br>

<strong>Die Laktat-Schwelle:</strong> Ab einer bestimmten Intensität kann dein Körper ${tt('Laktat','Nebenprodukt der anaeroben Energiegewinnung. Entgegen dem Mythos verursacht Laktat NICHT das Brennen – das ist Wasserstoffionen-Akkumulation. Laktat ist sogar ein Brennstoff, den trainierte Muskeln wiederverwerten.')} nicht mehr schnell genug abbauen. Ab hier „säuern" deine Muskeln aus: Arme werden schwer, Beinarbeit wird langsam. Gezieltes Training verschiebt diese Schwelle nach oben → du kannst länger mit hoher Intensität kämpfen, bevor die Erschöpfung einsetzt.<br><br>

<strong style="font-size:15px;">VO₂MAX-ZIELE FÜR BOXER</strong><br>
Anfänger: >45 · Fortgeschritten: >55 · Elite: <strong>58–65</strong> · National: >65 ml/kg/min<br><br>

<strong style="font-size:15px;">EMPFOHLENES PROGRAMM</strong><br>
<strong>Aerobe Basis – ${tt('Zone 2','60–70% HFmax. Du kannst vollständige Sätze sprechen. Baut Mitochondrien auf, verbessert Fettverbrennung, erhöht kapillare Dichte in Muskeln.')} (3–4×/Woche, 45–60 Min.):</strong><br>
• Laufen, Radfahren oder Seilspringen bei 60–70% HFmax<br>
• Bildet 80% deines Ausdauertrainings – langweilig, aber der wichtigste Baustein<br><br>
<strong>Boxspezifisches HIIT (2×/Woche):</strong><br>
• <strong>Heavy-Bag-Intervalle:</strong> 3 Min. Sandsack bei Kampftempo, 1 Min. Pause (simuliert Wettkampf-Rhythmus)<br>
• <strong>Pad-Circuits:</strong> 6×3-Min.-Runden Pratzenarbeit mit wechselnden Aufgaben pro Runde<br>
• <strong>Rundensimulation:</strong> 3 Min. bei 90%+ HFmax → 1 Min. aktive Erholung (Schattenboxen), 4–6 Runden<br>
• HIIT 4×4 (Laufen): 4 Min. bei 90–95% HFmax, 3 Min. aktive Pause – VO₂max-Booster (Buchheit & Laursen 2013)<br><br>
<strong>${tt('SIT','Sprint Interval Training – 30-Sekunden-All-out-Sprints mit 4 Min. Pause. Trainiert anaerobe Kapazität und PCr-Resynthese.')} (1×/Woche):</strong><br>
• 30-Sek.-All-out-Sprints (Assault Bike oder Sprint), 4–6 Runden, 4 Min. Pause<br><br>

<strong style="font-size:15px;">TRAININGSMETHODE: IMT (ATEMMUSKELTRAINING)</strong><br>
Boxen ist eine der atemlimitierendsten Sportarten: stoßweise Atmung zwischen Schlägen, eingeschränkter Luftstrom durch den Mundschutz, Körpertreffer auf den Rumpf. ${tt('IMT','Inspiratory Muscle Training – gezieltes Training der Einatem-Muskulatur gegen progressiven Widerstand. Wie Hanteltraining für dein Diaphragma.')} stärkt dein Diaphragma gegen den ${tt('Metaboreflex','Ein Schutzreflex: Wenn die Atemmuskulatur erschöpft, verengen sich Blutgefäße in Armen und Beinen → bis zu 15% weniger Durchblutung.')}: Wenn deine Atemmuskulatur erschöpft, leitet dein Körper bis zu 15% Blut von Armen und Beinen zur Atmung um – deine Schläge werden schwächer, nicht weil deine Arme müde sind, sondern weil sie weniger Sauerstoff bekommen. Mazic et al. (2015) zeigten, dass Boxer signifikant schwächere Atemmuskulatur haben als Untrainierte – normales Boxtraining reicht nicht. Protokoll: PowerBreathe, 2× täglich 30 Atemzüge, progressiver Widerstand.`,
    tags:[{text:'5–6×/Woche',cls:'tag-blue'},{text:'Zone 2 + HIIT + IMT',cls:'tag-green'}]},

  // === SÄULE 03: KOGNITIVE & PERZEPTUELLE LEISTUNG ===
  { name:'KOGNITIVE & PERZEPTUELLE LEISTUNG', category:'Gehirn & Augen', color:'var(--blue)',
    short:'Antizipation, Blickverhalten, Entscheidungsfindung unter Ermüdung. Wer den Schlag vorhersieht, muss nicht reagieren.',
    desc:`<strong style="font-size:15px;">WARUM DAS FÜR BOXER ENTSCHEIDEND IST</strong><br>
Runde 3. Du bist müde. Plötzlich triffst du Schläge nicht mehr, die du in Runde 1 problemlos gelandet hast. Gleichzeitig siehst du Treffer nicht kommen, die du vorher spielend ausgewichen bist. Das Problem sitzt nicht in den Muskeln – es sitzt im Kopf und in den Augen. Kognitive und perzeptuelle Leistung sind eigenständige, trainierbare Qualitäten, die über Sieg und Niederlage entscheiden.<br><br>

<strong style="font-size:15px;">VISUELLE WAHRNEHMUNG & ANTIZIPATION</strong><br>
Ein Jab braucht <strong>nur 40–100ms</strong> vom Start bis zum Treffer. Deine Reaktionszeit beträgt ~200ms. Du bist also IMMER zu langsam, wenn du erst reagierst, nachdem der Schlag startet. Die Lösung: Antizipation.<br><br>

<strong>Wo Experten hinschauen:</strong> Eye-Tracking-Studien (Ripoll et al. 1995) zeigen: <strong>Anfänger fixieren auf die Fäuste</strong>. <strong>Experten fixieren auf Brust und Kinn</strong> – den ${tt('Gaze Anchor','Blickanker – ein fester Punkt, auf den erfahrene Kämpfer schauen, um peripher alle Gliedmaßen gleichzeitig wahrzunehmen.')}. Von dort nehmen sie mit dem ${tt('Peripheren Sehen','Sehen außerhalb des Fokuspunkts. Weniger scharf, aber ~50ms schneller bei Bewegungserkennung als zentrales Sehen.')} ALLE Gliedmaßen gleichzeitig wahr. Mori et al. (2020) zeigten: Experten erreichen <strong>83.3% Antizipationsgenauigkeit</strong> vs. 68.5% bei Novizen. Die ${tt('Quiet Eye','Die letzte stabile Fixierung vor einer Entscheidung. Bei Elite-Boxern ~400ms, bei Anfängern ~200ms. Längere Quiet-Eye-Dauer = bessere Entscheidungen.')} – die letzte stabile Fixierung vor der Reaktion – ist bei Experten doppelt so lang.<br><br>

<strong style="font-size:15px;">CONSTRAINT-BASED SPARRING – DER PRIMÄRE TRAININGSWEG</strong><br>
Das kubanische Boxsystem und moderne Sportforschung zeigen: Die effektivste Methode zur Verbesserung der Wahrnehmung ist <strong>Sparring unter gezielten Einschränkungen</strong>. Statt isolierter kognitiver Übungen werden Wahrnehmung und Entscheidung dort trainiert, wo sie gebraucht werden – im Ring. Beispiele:<br>
• <strong>Nur-Konter-Sparring:</strong> Du darfst nur auf gegnerische Aktionen reagieren → trainiert Antizipation und Timing<br>
• <strong>Zahlen-Sparring:</strong> Trainer ruft Nummern → du reagierst mit vorgegebener Kombi → Entscheidungsfindung unter Druck<br>
• <strong>Tempo-Variation:</strong> Runde 1 bei 50%, Runde 2 bei 80%, Runde 3 bei 100% → kognitive Kontrolle über Intensität<br>
• <strong>Eingeschränktes Sichtfeld:</strong> Sparring nur mit peripherem Sehen (Blick auf Brust fixiert)<br><br>

<strong style="font-size:15px;">KOGNITIVE ERMÜDUNGSRESISTENZ (BET)</strong> <span style="font-size:10px;color:var(--gold);border:1px solid var(--gold);padding:1px 6px;border-radius:3px;">EXPERIMENTELL</span><br>
${tt('BET','Brain Endurance Training – kognitives Training unter Ermüdung. Dein Gehirn lernt, bei mentaler Erschöpfung trotzdem präzise zu arbeiten.')} ist ein vielversprechender Zusatz, aber kein Ersatz für boxspezifisches Training. Marcora et al. (2015) zeigten in einer <em>Militärstudie (nicht an Boxern!)</em>: +126% Ausdauer mit BET vs. +42% nur physisch. <strong>Achtung: Diese Studie war an Soldaten</strong> – der Transfer auf den Boxring ist plausibel und wird von GB Boxing genutzt, aber boxspezifische Evidenz fehlt noch. Van Cutsem et al. (2017) bestätigten allgemein: Mentale Ermüdung reduziert physische Leistung um <strong>5–10%</strong>.<br><br>

BET konfrontiert dein Gehirn mit kognitiven Aufgaben (${tt('Stroop-Test','Farbwörter erscheinen in falscher Farbe. Du musst die FARBE benennen, nicht das Wort. Trainiert Impulshemmung und kognitive Belastbarkeit.')}, Rechenaufgaben) WÄHREND oder vor dem Training. Der ${tt('Anteriore cinguläre Cortex','Gehirnregion, die Anstrengung bewertet. Wird durch BET effizienter – wie ein Prozessor-Upgrade für dein Gehirn.')} wird effizienter, dein mentales Erschöpfungslimit verschiebt sich nach oben.<br><br>

<strong style="font-size:15px;">EMPFOHLENES PROGRAMM</strong><br>
<strong>Im Ring (Priorität 1):</strong><br>
• Constraint-Based Sparring: 2–3×/Woche mit wechselnden Aufgaben (s.o.)<br>
• Gaze-Anker-Technik: In jedem Sparring auf Brust/Kinn fixieren, NICHT den Fäusten folgen<br>
• Kampffilm-Analyse: 15–20 Min./Woche – Gegner-Videos → bewusst Tells suchen<br><br>
<strong>Zusatztools (Priorität 2):</strong><br>
• Reaktionsdrills mit Partner: Zahlen rufen → Boxer antwortet mit Kombi. Oder Farb-Karten zeigen → Boxer reagiert. Direkt im Vereinstraining einsetzbar<br>
• BET-Protokoll: Stroop-Test-App, 15–25 Min./Tag, progressiv zwischen Trainingseinheiten integrieren<br>
• Reaktionsdrills: Partner zeigt Zahlen/Farben → du reagierst mit spezifischen Kombis`,
    tags:[{text:'Täglich · 15–25 Min.',cls:'tag-gold'},{text:'BET + Blicktraining',cls:'tag-blue'}]},

  // === SÄULE 06: ERNÄHRUNG & GEWICHTSMANAGEMENT ===
  { name:'ERNÄHRUNG & GEWICHTSMANAGEMENT', category:'Treibstoff', color:'var(--green)',
    short:'Makros, Timing, Hydration, Gewicht machen, Rehydration. Der beste Motor bringt nichts mit dem falschen Treibstoff.',
    desc:`<strong style="font-size:15px;">WARUM DAS FÜR BOXER ENTSCHEIDEND IST</strong><br>
Dein Körper ist wie ein Rennwagen: Das beste Chassis (Kraft), der beste Motor (Ausdauer) und der beste Fahrer (Technik) bringen nichts mit dem falschen Treibstoff. Als Boxer musst du explosiv und ausdauernd gleichzeitig sein, Muskelmasse aufbauen aber in deiner Gewichtsklasse bleiben, und dich von brutalem Training erholen – oft 2× am Tag. Die ISSN Position Stand (2025) bestätigt: Ernährung entscheidet über Trainingsqualität, Erholung und Kampfleistung in Kampfsportarten.<br><br>

<strong style="font-size:15px;">MAKRONÄHRSTOFFE IM BOXEN</strong><br>
• <strong>Protein (Empfehlung: 2.2g/kg):</strong> Repariert Muskelfasern nach dem Training. Die ${tt('MPS','Muskelproteinsynthese – der Prozess, durch den dein Körper beschädigte Muskelproteine repariert und neue aufbaut. Wird durch Training + Protein getriggert. Peak: 24–48h nach dem Training.')} braucht mindestens <strong>2.5g ${tt('Leucin','Die wichtigste Aminosäure für Muskelaufbau. Leucin aktiviert den mTOR-Signalweg, der die Muskelproteinsynthese startet. Mindestens 2.5g pro Mahlzeit nötig – das „Leucin-Schwellenwert-Konzept".')}</strong> pro Mahlzeit (Morton et al. 2018). 4–5 Protein-Boli über den Tag verteilt sind optimal.<br><br>

• <strong>Kohlenhydrate (4–8g/kg):</strong> Dein Gehirn und deine Muskeln laufen auf ${tt('Glykogen','Die Speicherform von Kohlenhydraten in Muskeln und Leber. Deine Muskeln speichern ~400g, die Leber ~100g. Bei leerem Glykogen sinkt die Leistung drastisch – du schlägst schwächer und reagierst langsamer.')}. Nach hartem Training sind deine Speicher zu 40–60% leer. KH-Timing ist entscheidend: 5–6h vor dem Abendtraining das Mittagessen als Glykogen-Loader nutzen. Post-Training: schnelle KH für Regeneration. Burke et al. (2011) zeigten: optimiertes KH-Timing → <strong>8–12% mehr Leistung</strong>.<br><br>

• <strong>Fett (0.8–1.2g/kg):</strong> Baut Hormone (Testosteron!), schützt Organe, transportiert fettlösliche Vitamine. Unter 0.8g/kg sinkt die Testosteronproduktion messbar.<br><br>

<strong>Timing:</strong> Das ${tt('Anabole Fenster','Die Phase erhöhter Muskelproteinsynthese nach dem Training. Entgegen dem Mythos dauert sie nicht 30 Minuten, sondern 24–48 Stunden – aber die erste Mahlzeit nach dem Training hat den stärksten Effekt.')} nach dem Training ist der beste Zeitpunkt für Protein + KH. Vor dem Schlaf: 40g Casein-Protein für eine langsame, 7-stündige Aminosäure-Versorgung → +22% nächtliche MPS (Res et al. 2012).<br><br>

<strong style="font-size:15px;">GEWICHTSMANAGEMENT – DIE BOXSPEZIFISCHE DIMENSION</strong><br>
In kaum einem Sport ist Gewichtsmanagement so entscheidend wie im Boxen. Die ISSN (2025) gibt klare zeitabhängige Grenzen vor:<br><br>

<strong>Zeitabhängige Cut-Grenzen:</strong><br>
• <strong>>4 Wochen vor Kampf:</strong> Max. 0.5–1% KG/Woche durch Kaloriendefizit (gradual weight loss)<br>
• <strong>Kampfwoche (5–7 Tage):</strong> Max. 3–5% KG durch Wasser-/Natrium-Manipulation<br>
• <strong>>5% akuter Cut = gefährlich:</strong> Kognitive Einschränkung, Dehydration, erhöhtes Verletzungsrisiko<br><br>

<strong>Kontrollierter Cut – Protokoll:</strong><br>
• Wasserloading: Tage 5–3: 8L/Tag → Tag 2: 2L → Tag 1: nur Schlucke<br>
• Natrium-Reduktion parallel zum Wasserloading<br>
• Low-Residue-Diät ab 48h vor dem Wiegen<br>
• <strong>Fight Week: Trainingsvolumen um 40–60% reduzieren</strong> – der häufigste Fehler ist, in der Kampfwoche bei reduzierter Kalorien- und Wasserzufuhr noch voll zu trainieren<br><br>

<strong>Rehydration-Protokoll (nach Wiegen):</strong><br>
• <strong>Erste 2 Stunden:</strong> 1–1.5L Elektrolytlösung (Natrium 40–80mmol/L) + 1–1.5g/kg KH + 0.3g/kg Protein<br>
• <strong>Stunden 2–6:</strong> Weiter trinken bis 150% des verlorenen Gewichts erreicht. Kleine, häufige Mahlzeiten<br>
• <strong>Letzte Mahlzeit:</strong> 3–4h vor dem Kampf, vertraut und leicht verdaulich<br><br>

<strong style="font-size:15px;">MEHR DETAILS</strong><br>
Klicke auf „Ernährung" und „Cutten" im Menü für den kompletten Guide mit Einkaufsliste, Makro-Rechner, Kampftag-Protokoll und Cut-Strategien.`,
    tags:[{text:'6 Mahlzeiten',cls:'tag-green'},{text:'Gewicht + Ernährung',cls:'tag-gold'}]},

  // === SÄULE 07: REGENERATION & BELASTUNGSSTEUERUNG ===
  { name:'REGENERATION & BELASTUNGSSTEUERUNG', category:'Recovery', color:'var(--green)',
    short:'Schlafoptimierung, HRV-Monitoring, Übertraining-Prävention. Du wirst nicht im Training stärker – du wirst im Schlaf stärker.',
    desc:`<strong style="font-size:15px;">WARUM DAS FÜR BOXER ENTSCHEIDEND IST</strong><br>
Du wirst nicht im Training stärker – du wirst im Schlaf stärker. Training zerstört Muskelfasern, leert Energiespeicher und ermüdet das Nervensystem. Erst in der Erholung passiert der eigentliche Aufbau. Ein Boxer, der 6 Stunden schläft, verschenkt bis zu 40% seines Trainingserfolgs. Und Boxen hat eine einzigartige Belastung, die kein anderer Sport hat: <strong>kumulative Kopftreffer</strong>.<br><br>

<strong style="font-size:15px;">SCHLAF – DAS FUNDAMENT DER ERHOLUNG</strong><br>
<strong>Schlafphasen und ihre Funktion:</strong><br>
• <strong>${tt('Tiefschlaf (N3)','Stadium 3 des Non-REM-Schlafs. Hier wird 95% des täglichen Wachstumshormons ausgeschüttet. Dominiert in der ersten Nachthälfte. Wird durch Alkohol massiv gestört.')}:</strong> <strong>95% des täglichen Wachstumshormons</strong> werden hier ausgeschüttet. Tiefschlaf dominiert in den ersten 3–4 Stunden – FRÜH einschlafen ist wichtiger als lange schlafen.<br>
• <strong>${tt('REM-Schlaf','Rapid Eye Movement – die Traumphase. Hier werden motorische Skills konsolidiert. Ein Boxer, der eine neue Kombination trainiert hat, verankert sie im REM-Schlaf. Dominiert in der zweiten Nachthälfte.')}:</strong> Motorische Fähigkeiten (Kombinationen, Ausweichbewegungen, Timing) werden im Langzeitgedächtnis verankert. REM dominiert in der zweiten Nachthälfte → wer zu früh aufsteht, verliert Motor-Learning.<br><br>

Milewski et al. (2014, KASIP-Studie, n=496) zeigten: <strong>Schlaf unter 8 Stunden = 61% höheres Verletzungsrisiko</strong>. Bei Boxern kritisch: Schon 1 Stunde weniger Schlaf erhöht die Reaktionszeit um <strong>30–40ms</strong>. Dazu: 5 Nächte mit nur 6h Schlaf senken Testosteron um 10–15% und erhöhen Cortisol um 20–30%.<br><br>

<strong style="font-size:15px;">SPARRING-RECOVERY – DIE BOXSPEZIFISCHE REGEL</strong><br>
Sparring ist die intensivste Trainingsform im Boxen – körperlich UND neural. Kopftreffer erzeugen nicht nur sofortigen Stress, sondern <strong>kumulative subkonzussive Belastung</strong>. Die aktuellen Empfehlungen von GB Boxing und der medizinischen Sportforschung:<br><br>

• <strong>48-Stunden-Regel:</strong> Mindestens 48h zwischen Sparring-Sessions. Das Gehirn braucht diese Zeit für die neurale Erholung<br>
• <strong>Nie Sparring + schweres Conditioning am selben Tag:</strong> Beides belastet das ZNS maximal. Sparring und HIIT/S&C an getrennten Tagen planen<br>
• <strong>Sparring-Frequenz begrenzen:</strong> Max. 2–3 Sparring-Sessions pro Woche, auch in der Campphase. Mehr ist kein „Abhärtung" – es ist kumulative Hirnbelastung<br>
• <strong>Nach hartem Sparring:</strong> Nächster Tag = nur leichtes Techniktraining oder Ruhe<br><br>

<strong style="font-size:15px;">CAMP-BELASTUNGSSTEUERUNG</strong><br>
Ein typischer 8–12-Wochen-Camp vor einem Kampf erfordert strukturiertes Load Management:<br>
• <strong>Wochen 1–4 (Aufbau):</strong> Volumen steigt progressiv. S&C-Fokus + Ausdauerbasis<br>
• <strong>Wochen 5–8 (Intensivierung):</strong> Höchste Sparring-Frequenz. Monitoring über HRV besonders wichtig<br>
• <strong>Wochen 9–10 (Taper):</strong> Volumen um 40–60% reduzieren, Intensität beibehalten<br>
• <strong>Fight Week:</strong> Minimales Training. Nur Technik + Visualisierung. Kein Sparring<br><br>

<strong style="font-size:15px;">SCHLAF-OPTIMIERUNG – PROTOKOLL</strong><br>
• <strong>Ziel:</strong> 8–9 Stunden, spätestens 22:30 im Bett<br>
• <strong>Temperatur:</strong> 18–19°C (kühler Raum fördert Tiefschlaf)<br>
• <strong>Warme Dusche:</strong> 1–2h vor dem Schlaf → beschleunigte Abkühlung → Melatonin-Signal (−36% Einschlaflatenz)<br>
• <strong>Blaulicht:</strong> 60 Min. vor dem Schlaf kein Smartphone/PC, oder Blaulichtfilter-Brille<br>
• <strong>4-7-8 Atemtechnik:</strong> 4 Sek. einatmen, 7 Sek. halten, 8 Sek. ausatmen<br>
• <strong>Melatonin:</strong> 0.3mg (nicht 5mg!) 30 Min. vor dem Schlaf – niedrige Dosis wirkt besser<br><br>

<strong style="font-size:15px;">BELASTUNGSSTEUERUNG MIT HRV</strong><br>
Boxtraining belastet das Nervensystem extremer als die meisten Sportarten. Sparring erzeugt nicht nur körperlichen, sondern <strong>neuralen Stress</strong>. ${tt('HRV','Herzratenvariabilität – die Schwankung der Abstände zwischen Herzschlägen. Variation zeigt, dass dein autonomes Nervensystem flexibel ist.')} erkennt Probleme <strong>Tage bevor du sie fühlst</strong>. Plummer & Kamata (2018) zeigten: HRV-gesteuerte Pläne produzieren <strong>gleiche Leistung bei 30% weniger Volumen</strong>.<br><br>

<strong>Hohe HRV = Gut erholt.</strong> Parasympathikus aktiv, Körper bereit für Belastung.<br>
<strong>Niedrige HRV = Stress.</strong> Sympathikus dominiert. Mehr Training jetzt = Abbau statt Aufbau.<br><br>

<strong>HRV-Protokoll:</strong><br>
• Morgens direkt nach dem Aufwachen, liegend, 5 Min. mit Polar H10 + HRV4Training App<br>
• 7-Tage-Rolling-Average als Baseline (Flatt & Esco 2016)<br>
• +5% = Grün (Vollgas) / ±5% = Gelb (Normal) / −5% = Rot (nur Zone 2 oder Ruhetag)<br>
• Bei Rot → kein Sparring, kein HIIT`,
    tags:[{text:'8–9h Schlaf',cls:'tag-green'},{text:'HRV täglich messen',cls:'tag-blue'}]},

  // === SÄULE 04: RING IQ & TAKTIK ===
  { name:'RING IQ & TAKTIK', category:'IQ', color:'var(--blue)',
    short:'Mustererkennung, Distanzkontrolle, Gegner-Analyse, Tells lesen. Auf Nationalebene gewinnt nicht der Fittere – sondern der Klügere.',
    desc:`<strong style="font-size:15px;">WARUM DAS FÜR BOXER ENTSCHEIDEND IST</strong><br>
Der größte Unterschied zwischen einem Landes- und einem Nationalkader-Boxer ist <strong>nicht die Physis, sondern die Taktik</strong>. Auf Landesebene gewinnt oft der Fittere. Auf Nationalebene sind alle fit – dort gewinnt, wer den Ring liest, Muster erkennt und den Gegner systematisch zerlegt. Notational-Analysen von Olympia-Kämpfen zeigen: <strong>Gewinner landen nicht mehr Schläge, sondern treffen mit höherer Genauigkeit und besserer Selektion</strong> (Davis et al. 2018). Ring IQ ist trainierbar – aber die wenigsten tun es bewusst.<br><br>

<strong style="font-size:15px;">MUSTERERKENNUNG & ENTSCHEIDUNG</strong><br>
Experten nutzen ${tt('Chunking','Das Gehirn gruppiert einzelne Informationen zu größeren „Chunks". Ein Anfänger sieht 5 einzelne Schläge. Ein Experte sieht ein Muster: „Er doubled den Jab, dann kommt der linke Haken." Weniger kognitive Last = schnellere Reaktion.')} – sie erkennen ganze Situationen statt einzelner Aktionen. Ein erfahrener Boxer sieht nicht „linker Jab", sondern „Er testet meine Distanz → gleich kommt die rechte Gerade." Hristovski et al. (2006) zeigten: Elite-Boxer treffen Kampfentscheidungen in <strong>unter 200ms</strong> – schneller als bewusstes Denken möglich ist. Das geht nur durch automatisierte Muster-Reaktions-Verknüpfungen.<br><br>

<strong>Distanzkontrolle – die Königsdisziplin:</strong> Boxen findet in drei ${tt('Distanzzonen','Außendistanz (nur Jab trifft), Mitteldistanz (gerade Schläge + Haken), Innendistanz (Uppercuts, Clinch). Jede Zone hat andere Regeln.')} statt. Jeder Boxer hat eine Zone, in der er am gefährlichsten ist. Taktisches Boxen bedeutet: <strong>Deine beste Zone erzwingen, seine beste Zone vermeiden.</strong><br><br>

<strong>Tells – die Körpersprache lesen:</strong> Fast jeder Boxer hat ${tt('Tells','Unbewusste Bewegungen, die einen Schlag ankündigen. Beispiele: Schulter hebt sich vor dem Cross, Gewicht verlagert sich vor dem Haken.')} – unbewusste Vorbewegungen, die Schläge verraten. Durch systematische Videoanalyse kannst du die Tells deines Gegners finden, bevor du in den Ring steigst.<br><br>

<strong style="font-size:15px;">EMPFOHLENES PROGRAMM</strong><br>
<strong>Constraint-Based Sparring (2–3×/Woche):</strong><br>
Systematische Progression von einfach → komplex – das kubanische System nutzt diese Methode seit Jahrzehnten:<br>
• <strong>Level 1:</strong> Nur Jab-Sparring (Distanzkontrolle, Timing)<br>
• <strong>Level 2:</strong> Nur Konter (Antizipation, Geduld)<br>
• <strong>Level 3:</strong> Nur Innendistanz (Clinch-Arbeit, Uppercuts)<br>
• <strong>Level 4:</strong> Boxer A greift an, Boxer B darf nur ausweichen + 1 Konter<br>
• <strong>Level 5:</strong> Freies Sparring mit taktischer Aufgabe (z.B. „nur über rechte Gerade scoren")<br><br>

<strong>Notational Analysis & Videoarbeit:</strong><br>
• <strong>Eigene Kämpfe:</strong> Sparring aufnehmen, nach Runde analysieren: Wann werde ich getroffen? Wo verliere ich die Distanz? Welche Muster wiederhole ich?<br>
• <strong>Gegner-Scouting:</strong> Videos systematisch nach Tells, bevorzugten Kombis und Schwachstellen durchgehen<br>
• <strong>Notational Analysis:</strong> Schläge zählen, Trefferquote berechnen, effektive vs. ineffektive Aktionen trennen – so arbeiten auch Nationaltrainer (Williams & Elliott 1999)<br><br>

<strong>Mid-Fight Adaptation (im Sparring üben):</strong><br>
• Trainer gibt nach jeder Runde eine taktische Anpassung vor: „Jetzt nur über den Körper" oder „Wechsel auf Außendistanz"<br>
• Trainiert die Fähigkeit, den Gameplan im Kampf zu ändern – entscheidend auf hohem Niveau<br><br>

<strong>Selbst-Tagebuch:</strong> Nach jedem Sparring 3 Sachen notieren: Was hat funktioniert? Was nicht? Was probiere ich nächstes Mal?`,
    tags:[{text:'Täglich · 15–20 Min.',cls:'tag-gold'},{text:'Jedes Sparring',cls:'tag-red'}]},

  // === SÄULE 05: SPORTPSYCHOLOGIE ===
  { name:'SPORTPSYCHOLOGIE & MENTALE STÄRKE', category:'Mindset', color:'var(--blue)',
    short:'Visualisierung, Arousal-Kontrolle, Selbstgespräche, Box-Breathing. 90% des Kampfes passieren im Kopf – und das ist trainierbar.',
    desc:`<strong style="font-size:15px;">WARUM DAS FÜR BOXER ENTSCHEIDEND IST</strong><br>
Du kannst der fitteste, technisch beste Boxer im Raum sein – wenn du im Ring vor Nervosität erstarrst, dein Kopf nach dem ersten Treffer aufgibt, oder du unter Druck in alte Muster verfällst, war alles Training umsonst. Untersuchungen zeigen: <strong>~70% aller Boxer berichten von signifikanter Vor-Kampf-Angst</strong> – das ist normal. Der Unterschied zwischen Elite und Amateur ist nicht, ob du Angst hast, sondern ob du sie regulieren kannst.<br><br>

<strong style="font-size:15px;">DAS BOXING-PARADOXON</strong><br>
Boxen ist der einzige Breiten-Sport, in dem <strong>du Schmerz empfangen musst, um erfolgreich zu sein</strong>. Du musst hart treffen und gleichzeitig bereit sein, hart getroffen zu werden. Dieses Paradoxon erzeugt einzigartige psychologische Anforderungen: Aggressivität + Kontrolle, Mut + taktische Geduld, Schmerztoleranz + Selbstschutz. Das lässt sich nicht einfach „mental durchstehen" – es muss systematisch trainiert werden.<br><br>

<strong style="font-size:15px;">RESILIENZ – DIE FÄHIGKEIT, NACH TREFFERN ZURÜCKZUKOMMEN</strong><br>
Der entscheidende Moment in vielen Kämpfen: Du wirst hart getroffen, gehst womöglich auf die Bretter. Was jetzt passiert, entscheidet den Kampf. <strong>Progressive Desensitisierung</strong> ist der Trainingsweg: Du gewöhnst dich schrittweise an zunehmende Drucksituationen, damit dein Kopf im Kampf nicht zum ersten Mal damit konfrontiert wird:<br>
• <strong>Stufe 1:</strong> Leichtes Sparring mit überlegenem Partner → lernen, Druck auszuhalten<br>
• <strong>Stufe 2:</strong> Sparring mit Body Shots erlaubt → Schmerztoleranz aufbauen<br>
• <strong>Stufe 3:</strong> Situationssparring: „Du bist 2 Runden hinten, letzte Runde" → Clutch-Performance üben<br>
• <strong>Stufe 4:</strong> Sparring unter Ermüdung (nach Conditioning) → Entscheidungen unter Stress<br><br>

<strong style="font-size:15px;">VISUALISIERUNG & AROUSAL-KONTROLLE</strong><br>
Wenn du dir vorstellst, einen Cross zu schlagen, feuern <strong>dieselben motorischen Nervenbahnen</strong> wie beim echten Schlag (${tt('Funktionelle Äquivalenz','fMRI-Studien zeigen: Vorgestellte und tatsächliche Bewegungen aktivieren die gleichen Gehirnareale. Die Intensität ist ~30% der echten Aktivierung.')}). Das ${tt('PETTLEP-Modell','Physical, Environment, Task, Timing, Learning, Emotion, Perspective – die 7 Faktoren effektiver Visualisierung. Holmes & Collins (2001) zeigten +12–16% motorische Leistung.')} macht Visualisierung messbar wirksam.<br><br>

${tt('Box-Breathing','4 Sek. einatmen – 4 Sek. halten – 4 Sek. ausatmen – 4 Sek. halten. Aktiviert den Vagusnerv, senkt Herzfrequenz und Cortisol.')} (4-4-4-4) aktiviert den ${tt('Vagusnerv','Der längste Hirnnerv. Stimulation durch langsames Ausatmen senkt die Herzfrequenz und aktiviert den Parasympathikus.')} und schaltet dein Nervensystem von Kampf-oder-Flucht auf kontrollierte Bereitschaft – Herzfrequenz sinkt um 10–15 bpm in 90 Sekunden. Perfekt für die Ecke zwischen den Runden.<br><br>

<strong>Selbstgespräche:</strong> <strong>Instruktionale</strong> („Hände hoch, Jab raus") verbessern Technik, <strong>motivationale</strong> („Ich bin bereit") verbessern Ausdauer um bis zu <strong>18%</strong> (Blanchfield et al. 2014). Meta-Analyse von Hatzigeorgiadis et al. (2011): Effektstärke d=0.48.<br><br>

<strong style="font-size:15px;">CORNER-KOMMUNIKATION</strong><br>
Die Ecke ist dein taktisches Gehirn zwischen den Runden. Effektive Corner-Kommunikation ist eine trainierbare Fähigkeit – für Boxer UND Trainer:<br>
• <strong>60-Sekunden-Regel:</strong> Max. 2–3 klare Anweisungen pro Pause. Nicht 10 Dinge gleichzeitig<br>
• <strong>Vorher vereinbarte Codewörter:</strong> „Marsch" = nach vorne drücken, „Box" = Außendistanz halten<br>
• <strong>Im Sparring üben:</strong> Trainer gibt zwischen Runden taktische Anpassungen – Boxer muss sofort umsetzen<br><br>

<strong style="font-size:15px;">TÄGLICHES PROTOKOLL (10–15 MIN.)</strong><br>
• <strong>Visualisierung (5 Min.):</strong> Vor dem Schlafen. Kampf in Ich-Perspektive, echtem Tempo, mit Emotionen. Auch Rückschläge visualisieren – wie reagierst du nach einem Treffer?<br>
• <strong>Box-Breathing (2 Min.):</strong> 4-4-4-4, morgens und vor dem Training<br>
• <strong>Selbstgespräch-Vorbereitung:</strong> 3 persönliche Sätze – 1 instruktional, 1 motivational, 1 für Krisen („Atmen, Grundstellung, Jab")<br>
• <strong>Pre-Performance-Routine:</strong> Feste Abfolge vor jedem Sparring/Kampf (Musik → Aufwärmen → Visualisierung → Box-Breathing → Ring)`,
    tags:[{text:'Täglich · 10–15 Min.',cls:'tag-purple'},{text:'0 Euro',cls:'tag-gold'}]},

  // === SÄULE 08: MOBILITÄT & VERLETZUNGSPRÄVENTION ===
  { name:'MOBILITÄT & VERLETZUNGSPRÄVENTION', category:'Schutz & Bewegung', color:'var(--red)',
    short:'Nackentraining, Schulter-/Hüftmobilität, Hand-/Handgelenksstabilität. Jedes Pfund Nackenmuskel senkt das KO-Risiko um 5%.',
    desc:`<strong style="font-size:15px;">WARUM DAS FÜR BOXER ENTSCHEIDEND IST</strong><br>
Boxer belasten ihren Körper extrem einseitig: Tausende Schläge pro Woche, immer in derselben Kampfstellung, repetitive Kopfbewegungen, harte Treffer auf Kopf und Körper. Mao et al. (2023) analysierten die Verletzungsepidemiologie im Boxen: <strong>Hand/Handgelenk (28%), Gesicht/Kopf (23%), Schulter (12%)</strong> sind die häufigsten Verletzungsorte. Ohne gezielte Prävention sind diese Verletzungen nur eine Frage der Zeit.<br><br>

<strong style="font-size:15px;">NACKENTRAINING – KO-PRÄVENTION</strong><br>
Ein KO entsteht durch die <strong>Rotationsbeschleunigung</strong> des Gehirns im Schädel. Dein Nacken ist die einzige Struktur, die diese Rotation bremsen kann. Die Collins-Studie (2014, <strong>n=6704, an Jugendlichen</strong>) fand einen signifikanten Zusammenhang zwischen Nackenmuskulatur und reduziertem Gehirnerschütterungsrisiko. <strong>Bei erwachsenen Boxern ist der genaue Effekt kleiner, aber die Richtung ist klar belegt</strong> (Eckner et al. 2014): Stärkerer Nacken = weniger Kopfbeschleunigung bei Treffern. Ein angespannter Nacken verbindet den Kopf mit dem Oberkörper (15–30kg ${tt('Effektive Masse','Die Masse, die dem Schlag entgegenwirkt. Mehr effektive Masse = weniger Beschleunigung = weniger KO-Risiko.')}) – 3–6× mehr Masse gegen den Schlag.<br><br>

<strong>Erweitertes Nackenprotokoll (3×/Woche, 10–15 Min.):</strong><br>
• <strong>Isometrie:</strong> 4 Richtungen gegen Hand oder Band, 3×8 Sek. – die Basis<br>
• <strong>Konzentrisch:</strong> Nacken-Curls liegend (Flexion + Extension), 3×12 mit leichtem Gewicht<br>
• <strong>Neck Harness:</strong> Kontrollierte Flexion/Extension mit progressivem Gewicht (2–5kg Start) – das effektivste Tool für progressive Overload am Nacken<br>
• <strong>Niemals Nackenbrücken</strong> – das Bandscheibenrisiko überwiegt den Nutzen<br><br>

<strong style="font-size:15px;">ROBUSTNESS CIRCUIT – BOXER-SPEZIFISCHE PRÄVENTION</strong><br>
Ein integrierter Präventions-Circuit, der die häufigsten Boxverletzungen abdeckt (2–3×/Woche, 15 Min.):<br><br>

<strong>1. Scapula-Stabilisation (Schulter-Schutz):</strong><br>
• Band Pull-Aparts: 3×15 · Face Pulls: 3×12 · Prone Y-T-W Raises: 2×8 je Position<br>
• Warum: Die Scapula-Stabilisatoren ermüden bei repetitivem Schlagen – instabile Schulterblätter = Impingement-Risiko<br><br>

<strong>2. Hand & Handgelenk:</strong><br>
• Wrist Curls + Reverse Wrist Curls: 3×15 · Radial/Ulnar Deviation: 2×12<br>
• Rice Bucket Grabs: 2×30 Sek. – stärkt alle intrinsischen Handmuskeln gleichzeitig<br>
• Richtiges Bandagieren lernen + jedes Training sauber wickeln<br><br>

<strong>3. Nacken:</strong> (s.o.)<br><br>

<strong style="font-size:15px;">MOBILITÄT – SCHLAGWEITE & FUSSARBEIT</strong><br>
• <strong>Schulter/Thorax:</strong> Thorakale Rotation bestimmt Schlagweite und defensive Kopfbewegung. Eingeschränkte Schulter = kürzere Schläge + compensatorische Überbelastung<br>
• <strong>Hüfte:</strong> Ständige Rotation für Schläge und Richtungswechsel. Steife Hüften limitieren die Kraftübertragung aus der ${tt('Kinetischen Kette','Boden → Fuß → Knie → Hüfte → Core → Schulter → Faust.')}<br>
• <strong>Sprunggelenk:</strong> Für Ausfallschritte, Ausweichbewegungen und die tiefe Kampfstellung essentiell<br><br>

<strong style="font-size:15px;">TÄGLICHES MOBILITÄTSPROTOKOLL (10 MIN.)</strong><br>
<strong>Pre-Training:</strong><br>
• Thorakale Rotation: 2×8 je Seite · 90/90 Hüft-Stretch: 2×30 Sek. je Seite<br>
• Schulter-CAR: 5 je Richtung · Wall-Ankle Touches: 2×15<br><br>
<strong>Post-Training:</strong><br>
• Handgelenk-Rotation + Flexion/Extension: 2×15<br>
• Brustwirbelsäule Foam-Rolling: 30 Sek.`,
    tags:[{text:'Täglich · 15 Min.',cls:'tag-red'},{text:'Nacken 2–3×/Wo.',cls:'tag-orange'}]}
];

// ===== MUSCLE SVG – FRONT VIEW =====
function muscleSvg(activeGroups, color) {
  // Dark body silhouette fill
  const bodyFill = `<path d="
    M100,14 C94,14 89,19 88,26 C87,33 89,40 92,46 L94,50
    C90,52 86,55 84,58 C78,60 70,66 64,72 C58,78 54,84 52,90
    L50,98 C48,104 48,110 50,116 C48,120 46,126 44,134
    C42,142 40,150 40,160 C40,168 40,174 42,180
    L88,184 L90,192 C92,200 94,210 94,220 L94,232
    C94,244 92,258 90,272 C88,286 88,300 88,312
    C88,324 90,336 92,348 C94,360 94,372 92,384
    C90,396 88,408 86,420 L84,432 L88,434
    C90,426 92,418 94,408 C96,398 98,388 98,378 L98,368
    C98,358 98,348 96,338 C94,328 94,318 94,310 L94,300
    C94,290 96,280 98,270 L100,260 L102,270
    C104,280 106,290 106,300 L106,310 C106,318 106,328 104,338
    C102,348 102,358 102,368 L102,378 C102,388 104,398 106,408
    C108,418 110,426 112,434 L116,432 L114,420
    C112,408 110,396 108,384 C106,372 106,360 108,348
    C110,336 112,324 112,312 C112,300 112,286 110,272
    C108,258 106,244 106,232 L106,220 C106,210 108,200 110,192
    L112,184 L158,180 C160,174 160,168 160,160 C160,150 158,142 156,134
    C154,126 152,120 150,116 C152,110 152,104 150,98 L148,90
    C146,84 142,78 136,72 C130,66 122,60 116,58
    C114,55 110,52 106,50 L108,46 C111,40 113,33 112,26
    C111,19 106,14 100,14 Z" fill="#0a0a0a" stroke="none" opacity="0.7"/>`;

  // Body outline stroke
  const bodyOutline = `<path d="
    M100,12 C93,12 87,18 86,26 C85,34 87,42 91,48 L92,50
    C88,52 84,54 82,56 L78,58 C72,60 66,64 60,70
    C54,76 50,82 48,88 L46,96 C44,102 44,108 46,114
    L48,120 C46,122 44,126 42,132 C40,138 38,146 37,154
    C36,162 36,168 37,174 L38,180 C36,180 34,178 32,178
    C30,180 30,184 32,188 L34,190 C32,192 30,194 30,196 L32,198
    M168,198 L170,196 C170,194 168,192 166,190 L168,188
    C170,184 170,180 168,178 C166,178 164,180 162,180
    L163,174 C164,168 164,162 163,154 C162,146 160,138 158,132
    C156,126 154,122 152,120 L154,114 C156,108 156,102 154,96
    L152,88 C150,82 146,76 140,70 C134,64 128,60 122,58
    L118,56 C116,54 112,52 108,50 L109,48 C113,42 115,34 114,26
    C113,18 107,12 100,12 Z
    M82,184 C80,190 78,198 78,208 L78,220
    C76,232 74,244 72,256 C70,270 68,282 68,294
    L68,306 C68,316 70,324 72,332 L74,342
    C76,352 78,362 78,372 L78,380 C78,388 76,396 74,404
    L72,414 C70,420 68,424 68,430 L70,434
    L82,436 C84,436 86,434 86,430 L88,422
    C90,414 92,406 92,398 L92,388 C92,380 92,372 90,362
    C88,352 88,344 88,336 L88,326 C88,318 88,310 90,302
    C92,292 94,282 94,272 L94,260 C94,248 94,238 94,228 L94,218
    C94,208 92,198 90,190 L88,184
    M112,184 C114,190 116,198 116,208 L116,218
    C116,228 116,238 116,248 L116,260 C116,272 116,282 118,292
    C120,302 122,310 122,318 L122,326 C122,336 122,344 120,352
    C118,362 118,372 118,380 L118,388 C118,398 118,406 120,414
    L122,422 C124,430 124,434 126,436 L130,436 L132,434
    C132,424 130,420 128,414 L126,404 C124,396 122,388 122,380
    L122,372 C122,362 124,352 126,342 L128,332
    C130,324 132,316 132,306 L132,294 C132,282 130,270 128,256
    C126,244 124,232 122,220 L122,208
    C122,198 120,190 118,184 Z"
    fill="none" stroke="#1a1a1a" stroke-width="0.8" opacity="0.5"/>`;

  const muscles = {
    // HEAD – skull with jaw taper, anatomically proportioned
    kopf: { d: 'M100,14 C93,14 88,18 87,24 C86,30 87,36 89,42 C91,46 94,49 97,51 C99,52 100,52 100,52 C100,52 101,52 103,51 C106,49 109,46 111,42 C113,36 114,30 113,24 C112,18 107,14 100,14 Z' },

    // NECK – sternocleidomastoid columns
    nacken: { d: 'M96,52 C94,54 92,56 91,59 L91,64 C91,66 93,68 95,69 L97,70 C99,70 100,70 100,70 C100,70 101,70 103,70 L105,69 C107,68 109,66 109,64 L109,59 C108,56 106,54 104,52 C103,53 101,54 100,54 C99,54 97,53 96,52 Z' },

    // LEFT DELTOID – rounded anterior/lateral/posterior heads
    schulter_l: { d: 'M84,68 C78,66 72,66 66,68 C60,70 56,74 53,80 C50,86 50,92 52,98 C54,100 56,98 58,94 C60,90 63,86 67,82 C71,78 75,76 79,74 L83,72 C85,70 85,69 84,68 Z' },

    // RIGHT DELTOID
    schulter_r: { d: 'M116,68 C122,66 128,66 134,68 C140,70 144,74 147,80 C150,86 150,92 148,98 C146,100 144,98 142,94 C140,90 137,86 133,82 C129,78 125,76 121,74 L117,72 C115,70 115,69 116,68 Z' },

    // LEFT PECTORAL – fan from sternum outward, rounded inferior border
    brust: { d: 'M85,70 C83,72 81,74 79,78 C77,82 73,86 69,90 C65,94 61,98 59,100 C57,102 57,106 59,108 C61,110 65,112 71,113 C77,114 83,114 89,113 C93,112 96,110 99,108 L100,106 L101,108 C104,110 107,112 111,113 C117,114 123,114 129,113 C135,112 139,110 141,108 C143,106 143,102 141,100 C139,98 135,94 131,90 C127,86 123,82 121,78 C119,74 117,72 115,70 L100,68 Z' },

    // LEFT BICEP – fusiform belly with peak
    bizeps_l: { d: 'M52,102 C50,102 47,106 45,112 C43,118 41,126 40,134 C39,142 40,148 42,152 C44,156 46,158 48,158 C50,158 52,156 54,152 C56,148 58,142 59,134 C60,126 60,120 58,114 C56,108 54,104 52,102 Z' },

    // RIGHT BICEP
    bizeps_r: { d: 'M148,102 C150,102 153,106 155,112 C157,118 159,126 160,134 C161,142 160,148 158,152 C156,156 154,158 152,158 C150,158 148,156 146,152 C144,148 142,142 141,134 C140,126 140,120 142,114 C144,108 146,104 148,102 Z' },

    // LEFT FOREARM – brachioradialis + wrist taper
    unterarm_l: { d: 'M42,160 C40,160 37,164 35,170 C33,176 32,184 31,192 C30,200 30,206 32,212 C34,216 36,218 38,218 C40,218 42,216 44,212 C46,208 47,202 48,194 C49,186 49,178 48,170 C47,164 45,160 42,160 Z' },

    // RIGHT FOREARM
    unterarm_r: { d: 'M158,160 C160,160 163,164 165,170 C167,176 168,184 169,192 C170,200 170,206 168,212 C166,216 164,218 162,218 C160,218 158,216 156,212 C154,208 153,202 152,194 C151,186 151,178 152,170 C153,164 155,160 158,160 Z' },

    // RECTUS ABDOMINIS – six/eight pack segmented shape
    core: { d: 'M94,112 C92,112 91,114 91,116 L90,130 L90,146 L90,162 L90,176 C90,180 92,184 94,186 C96,188 98,189 100,189 C102,189 104,188 106,186 C108,184 110,180 110,176 L110,162 L110,146 L110,130 L109,116 C109,114 108,112 106,112 Z' },

    // LEFT OBLIQUES – external oblique + serratus interdigitation
    obliques_l: { d: 'M82,108 C84,110 86,112 88,114 L90,116 L90,132 L90,148 L90,164 L90,178 C90,182 88,186 86,188 C84,190 82,190 80,188 C76,184 74,178 72,170 C70,162 70,154 70,146 C70,138 72,128 74,120 C76,114 78,110 82,108 Z' },

    // RIGHT OBLIQUES
    obliques_r: { d: 'M118,108 C116,110 114,112 112,114 L110,116 L110,132 L110,148 L110,164 L110,178 C110,182 112,186 114,188 C116,190 118,190 120,188 C124,184 126,178 128,170 C130,162 130,154 130,146 C130,138 128,128 126,120 C124,114 122,110 118,108 Z' },

    // GLUTEUS / HIP FLEXORS – inguinal/iliacus front view
    gluteus: { d: 'M80,188 C76,190 74,194 72,198 C70,202 70,206 72,210 C74,212 78,214 84,215 C90,216 96,216 100,216 C104,216 110,216 116,215 C122,214 126,212 128,210 C130,206 130,202 128,198 C126,194 124,190 120,188 L100,186 Z' },

    // LEFT QUADRICEP – teardrop with vastus medialis bulge
    quad_l: { d: 'M84,216 C80,216 76,220 73,226 C70,232 68,240 66,250 C64,260 63,270 63,280 C63,290 64,300 66,308 C68,316 70,322 74,328 C78,334 82,336 86,334 C88,332 90,328 92,322 C94,316 94,308 94,300 C94,290 94,280 94,270 C94,260 92,250 90,240 C88,232 86,224 84,218 Z' },

    // RIGHT QUADRICEP
    quad_r: { d: 'M116,216 C120,216 124,220 127,226 C130,232 132,240 134,250 C136,260 137,270 137,280 C137,290 136,300 134,308 C132,316 130,322 126,328 C122,334 118,336 114,334 C112,332 110,328 108,322 C106,316 106,308 106,300 C106,290 106,280 106,270 C106,260 108,250 110,240 C112,232 114,224 116,218 Z' },

    // LEFT CALF – gastrocnemius diamond shape
    wade_l: { d: 'M72,342 C68,342 65,348 63,356 C61,364 60,374 60,382 C60,390 62,398 64,404 C66,410 68,414 72,416 C76,418 80,416 82,412 C84,408 86,402 86,394 C86,386 86,376 84,366 C82,356 80,348 78,344 C76,342 74,342 72,342 Z' },

    // RIGHT CALF
    wade_r: { d: 'M128,342 C132,342 135,348 137,356 C139,364 140,374 140,382 C140,390 138,398 136,404 C134,410 132,414 128,416 C124,418 120,416 118,412 C116,408 114,402 114,394 C114,386 114,376 116,366 C118,356 120,348 122,344 C124,342 126,342 128,342 Z' }
  };

  // Abs segmentation lines
  const absDetail = `
    <line x1="100" y1="116" x2="100" y2="186" stroke="#0a0a0a" stroke-width="0.7" opacity="0.5"/>
    <line x1="92" y1="128" x2="108" y2="128" stroke="#0a0a0a" stroke-width="0.5" opacity="0.4"/>
    <line x1="92" y1="142" x2="108" y2="142" stroke="#0a0a0a" stroke-width="0.5" opacity="0.4"/>
    <line x1="91" y1="156" x2="109" y2="156" stroke="#0a0a0a" stroke-width="0.5" opacity="0.4"/>
    <line x1="91" y1="170" x2="109" y2="170" stroke="#0a0a0a" stroke-width="0.5" opacity="0.4"/>`;

  // Sternum / pec divider
  const pecLine = `<line x1="100" y1="70" x2="100" y2="110" stroke="#0a0a0a" stroke-width="0.7" opacity="0.4"/>`;

  // Knee caps
  const knees = `
    <ellipse cx="78" cy="336" rx="8" ry="3" fill="none" stroke="#151515" stroke-width="0.5" opacity="0.4"/>
    <ellipse cx="122" cy="336" rx="8" ry="3" fill="none" stroke="#151515" stroke-width="0.5" opacity="0.4"/>`;

  let paths = '';
  for (const [id, m] of Object.entries(muscles)) {
    const isActive = activeGroups.includes(id);
    paths += `<path d="${m.d}" class="${isActive ? 'muscle-active' : 'muscle-base'}" ${isActive ? `fill="${color}"` : ''}/>`;
  }

  return `<svg class="muscle-svg" viewBox="0 0 200 440" xmlns="http://www.w3.org/2000/svg">${bodyFill}${bodyOutline}${paths}${absDetail}${pecLine}${knees}</svg>`;
}

// ===== MUSCLE SVG – BACK VIEW =====
function muscleSvgBack(activeGroups, color) {
  // Same body silhouette as front (symmetrical figure)
  const bodyFill = `<path d="
    M100,14 C94,14 89,19 88,26 C87,33 89,40 92,46 L94,50
    C90,52 86,55 84,58 C78,60 70,66 64,72 C58,78 54,84 52,90
    L50,98 C48,104 48,110 50,116 C48,120 46,126 44,134
    C42,142 40,150 40,160 C40,168 40,174 42,180
    L88,184 L90,192 C92,200 94,210 94,220 L94,232
    C94,244 92,258 90,272 C88,286 88,300 88,312
    C88,324 90,336 92,348 C94,360 94,372 92,384
    C90,396 88,408 86,420 L84,432 L88,434
    C90,426 92,418 94,408 C96,398 98,388 98,378 L98,368
    C98,358 98,348 96,338 C94,328 94,318 94,310 L94,300
    C94,290 96,280 98,270 L100,260 L102,270
    C104,280 106,290 106,300 L106,310 C106,318 106,328 104,338
    C102,348 102,358 102,368 L102,378 C102,388 104,398 106,408
    C108,418 110,426 112,434 L116,432 L114,420
    C112,408 110,396 108,384 C106,372 106,360 108,348
    C110,336 112,324 112,312 C112,300 112,286 110,272
    C108,258 106,244 106,232 L106,220 C106,210 108,200 110,192
    L112,184 L158,180 C160,174 160,168 160,160 C160,150 158,142 156,134
    C154,126 152,120 150,116 C152,110 152,104 150,98 L148,90
    C146,84 142,78 136,72 C130,66 122,60 116,58
    C114,55 110,52 106,50 L108,46 C111,40 113,33 112,26
    C111,19 106,14 100,14 Z" fill="#0a0a0a" stroke="none" opacity="0.7"/>`;

  const bodyOutline = `<path d="
    M100,12 C93,12 87,18 86,26 C85,34 87,42 91,48 L92,50
    C88,52 84,54 82,56 L78,58 C72,60 66,64 60,70
    C54,76 50,82 48,88 L46,96 C44,102 44,108 46,114
    L48,120 C46,122 44,126 42,132 C40,138 38,146 37,154
    C36,162 36,168 37,174 L38,180 C36,180 34,178 32,178
    C30,180 30,184 32,188 L34,190 C32,192 30,194 30,196 L32,198
    M168,198 L170,196 C170,194 168,192 166,190 L168,188
    C170,184 170,180 168,178 C166,178 164,180 162,180
    L163,174 C164,168 164,162 163,154 C162,146 160,138 158,132
    C156,126 154,122 152,120 L154,114 C156,108 156,102 154,96
    L152,88 C150,82 146,76 140,70 C134,64 128,60 122,58
    L118,56 C116,54 112,52 108,50 L109,48 C113,42 115,34 114,26
    C113,18 107,12 100,12 Z
    M82,184 C80,190 78,198 78,208 L78,220
    C76,232 74,244 72,256 C70,270 68,282 68,294
    L68,306 C68,316 70,324 72,332 L74,342
    C76,352 78,362 78,372 L78,380 C78,388 76,396 74,404
    L72,414 C70,420 68,424 68,430 L70,434
    L82,436 C84,436 86,434 86,430 L88,422
    C90,414 92,406 92,398 L92,388 C92,380 92,372 90,362
    C88,352 88,344 88,336 L88,326 C88,318 88,310 90,302
    C92,292 94,282 94,272 L94,260 C94,248 94,238 94,228 L94,218
    C94,208 92,198 90,190 L88,184
    M112,184 C114,190 116,198 116,208 L116,218
    C116,228 116,238 116,248 L116,260 C116,272 116,282 118,292
    C120,302 122,310 122,318 L122,326 C122,336 122,344 120,352
    C118,362 118,372 118,380 L118,388 C118,398 118,406 120,414
    L122,422 C124,430 124,434 126,436 L130,436 L132,434
    C132,424 130,420 128,414 L126,404 C124,396 122,388 122,380
    L122,372 C122,362 124,352 126,342 L128,332
    C130,324 132,316 132,306 L132,294 C132,282 130,270 128,256
    C126,244 124,232 122,220 L122,208
    C122,198 120,190 118,184 Z"
    fill="none" stroke="#1a1a1a" stroke-width="0.8" opacity="0.5"/>`;

  const muscles = {
    // TRAPEZIUS – diamond/kite from base of skull to mid-back
    trapez: { d: 'M100,54 C96,56 90,60 84,66 C78,72 74,78 72,84 C70,90 70,94 72,98 C74,100 78,100 82,98 C86,96 90,92 94,88 L98,82 L100,78 L102,82 L106,88 C110,92 114,96 118,98 C122,100 126,100 128,98 C130,94 130,90 128,84 C126,78 122,72 116,66 C110,60 104,56 100,54 Z' },

    // LEFT LATISSIMUS – wide V-taper wing shape
    lat_l: { d: 'M74,98 C70,100 66,106 64,114 C62,122 60,132 60,142 C60,152 62,162 64,170 C66,178 70,184 74,188 C78,192 82,192 86,190 C88,188 90,184 90,178 L90,166 L90,152 L90,138 C90,128 88,118 86,110 C84,104 80,100 74,98 Z' },

    // RIGHT LATISSIMUS
    lat_r: { d: 'M126,98 C130,100 134,106 136,114 C138,122 140,132 140,142 C140,152 138,162 136,170 C134,178 130,184 126,188 C122,192 118,192 114,190 C112,188 110,184 110,178 L110,166 L110,152 L110,138 C110,128 112,118 114,110 C116,104 120,100 126,98 Z' },

    // LEFT TRICEP – horseshoe shape (lateral + long + medial heads)
    trizeps_l: { d: 'M52,102 C50,102 46,106 44,112 C42,120 40,128 40,136 C40,144 42,150 44,154 C46,158 48,160 50,160 C52,160 54,158 56,154 C58,150 60,144 60,136 C60,128 58,120 56,114 C54,108 52,102 52,102 Z' },

    // RIGHT TRICEP
    trizeps_r: { d: 'M148,102 C150,102 154,106 156,112 C158,120 160,128 160,136 C160,144 158,150 156,154 C154,158 152,160 150,160 C148,160 146,158 144,154 C142,150 140,144 140,136 C140,128 142,120 144,114 C146,108 148,102 148,102 Z' },

    // LOWER BACK – erector spinae twin columns
    unterer_ruecken: { d: 'M90,156 C88,158 86,164 86,172 C86,180 88,188 90,194 C92,200 94,204 96,206 C98,208 99,209 100,209 C101,209 102,208 104,206 C106,204 108,200 110,194 C112,188 114,180 114,172 C114,164 112,158 110,156 L100,154 Z' },

    // GLUTEUS MAXIMUS – full rounded posterior
    gluteus_back: { d: 'M80,202 C74,202 68,206 64,212 C60,218 58,226 60,232 C62,238 66,242 72,244 C78,246 84,246 90,244 C94,242 96,240 98,236 L100,232 L102,236 C104,240 106,242 110,244 C116,246 122,246 128,244 C134,242 138,238 140,232 C142,226 140,218 136,212 C132,206 126,202 120,202 L100,200 Z' },

    // LEFT HAMSTRING – biceps femoris + semitendinosus
    hamstring_l: { d: 'M82,246 C78,246 74,250 71,256 C68,264 66,274 64,284 C62,294 62,304 64,314 C66,322 68,328 72,332 C76,336 80,336 84,332 C86,328 88,322 90,314 C92,306 92,296 92,286 C92,276 92,266 90,258 C88,252 86,248 82,246 Z' },

    // RIGHT HAMSTRING
    hamstring_r: { d: 'M118,246 C122,246 126,250 129,256 C132,264 134,274 136,284 C138,294 138,304 136,314 C134,322 132,328 128,332 C124,336 120,336 116,332 C114,328 112,322 110,314 C108,306 108,296 108,286 C108,276 108,266 110,258 C112,252 114,248 118,246 Z' },

    // LEFT CALF (back view – gastrocnemius medial + lateral heads)
    wade_back_l: { d: 'M72,340 C68,340 64,346 62,354 C60,362 58,372 58,382 C58,390 60,398 62,404 C64,410 68,414 72,416 C76,418 80,416 82,412 C84,408 86,402 86,394 C86,386 86,376 84,366 C82,356 80,348 76,342 C74,340 72,340 72,340 Z' },

    // RIGHT CALF (back view)
    wade_back_r: { d: 'M128,340 C132,340 136,346 138,354 C140,362 142,372 142,382 C142,390 140,398 138,404 C136,410 132,414 128,416 C124,418 120,416 118,412 C116,408 114,402 114,394 C114,386 114,376 116,366 C118,356 120,348 124,342 C126,340 128,340 128,340 Z' }
  };

  // Spine center line
  const spineLine = `<line x1="100" y1="56" x2="100" y2="202" stroke="#0a0a0a" stroke-width="0.8" opacity="0.35"/>`;
  // Erector spinae separation lines
  const erectorLines = `
    <line x1="96" y1="158" x2="96" y2="206" stroke="#0a0a0a" stroke-width="0.4" opacity="0.3"/>
    <line x1="104" y1="158" x2="104" y2="206" stroke="#0a0a0a" stroke-width="0.4" opacity="0.3"/>`;
  // Glute cleft
  const gluteLine = `<line x1="100" y1="202" x2="100" y2="242" stroke="#0a0a0a" stroke-width="0.6" opacity="0.4"/>`;
  // Knee pits
  const kneePits = `
    <ellipse cx="78" cy="336" rx="7" ry="3" fill="none" stroke="#151515" stroke-width="0.5" opacity="0.35"/>
    <ellipse cx="122" cy="336" rx="7" ry="3" fill="none" stroke="#151515" stroke-width="0.5" opacity="0.35"/>`;

  let paths = '';
  for (const [id, m] of Object.entries(muscles)) {
    const isActive = activeGroups.includes(id);
    paths += `<path d="${m.d}" class="${isActive ? 'muscle-active' : 'muscle-base'}" ${isActive ? `fill="${color}"` : ''}/>`;
  }

  return `<svg class="muscle-svg" viewBox="0 0 200 440" xmlns="http://www.w3.org/2000/svg">${bodyFill}${bodyOutline}${paths}${spineLine}${erectorLines}${gluteLine}${kneePits}</svg>`;
}

// ===== EXERCISE IMAGES =====
const EXERCISE_IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
// Mapping: nur Bilder die 100% zur Übungsbeschreibung passen
// Für fehlende: Bilder in img/exercises/{id}.jpg ablegen
const exerciseImageMap = {
  'trap-bar-deadlift': 'Barbell_Deadlift',              // ✓ Deadlift von Boden, nächste Übereinstimmung
  'jump-squat': 'Freehand_Jump_Squat',                  // ✓ Bodyweight Squat ohne Gewicht
  'landmine-press': 'Landmine_Linear_Jammer',           // ✓ Landmine Barbell Press stehend
  'hip-thrust': 'Barbell_Hip_Thrust',                   // ✓ passt exakt
  'med-ball-rotation': 'Medicine_Ball_Full_Twist',       // ✓ Medizinball Rotation
  'explosive-pushup': 'Drop_Push',                      // ✓ Plyometrischer Push-Up von Boxen
  'overcoming-iso': null,                                // Keine passende Übung in DB
  'single-leg-rdl': 'Kettlebell_One-Legged_Deadlift',   // ✓ Einbeiniger Deadlift mit Kettlebell
  'power-clean': 'Clean',                               // ✓ Barbell Clean vom Boden
  'bench-press': 'Barbell_Bench_Press_-_Medium_Grip',   // ✓ passt exakt
  'zone2': 'Jogging_Treadmill',                         // ✓ Laufband Joggen
  'hiit-4x4': 'Bicycling_Stationary',                   // ✓ Stationäres Fahrrad für Intervalle
  'fartlek': 'Fast_Skipping',                           // ✓ Lauf/Skip-Bewegung
  'sit-sprints': 'Bicycling_Stationary',                // ✓ Stationäres Bike für Sprints
  'iso-nacken': 'Isometric_Neck_Exercise_-_Front_And_Back', // ✓ Isometrische Nackenübung
  'nacken-flexion': 'Lying_Face_Down_Plate_Neck_Resistance', // ✓ Nackenflexion mit Gewicht
  'rice-bucket': null,                                   // Kein Rice Bucket in DB
  'pogo-jumps': null,                                    // Kein Pogo Jump in DB
  'bfr': null,                                          // Keine BFR-Übung in DB
  'imt': null,                                          // Kein Atemtrainer in DB
  'shadow-boxing': null,                                 // Lokales Bild vorhanden
  'pull-ups': 'Chin-Up',                                // ✓ Pull-Up Bewegung
  'pallof-press': null,                                  // Kein Pallof Press in DB
  'face-pulls': 'Face_Pull',                             // ✓ Face Pull am Kabel
  'farmers-walk': 'Farmers_Walk',                        // ✓ Farmer's Walk
  'lateral-bounds': 'Lateral_Bound',                     // ✓ Laterale Sprünge
  'seilspringen': null,                                  // Kein Seilspringen in DB
  'reverse-curls': 'Reverse_Barbell_Curl',               // ✓ Reverse Curl passt
  'knuckle-pushups': null,                                // Kein Knuckle Push-Up in DB
  'bottoms-up-kb': null,                                  // Kein Bottoms-Up KB in DB
  'wrist-roller': null,                                   // Kein Wrist Roller in DB
  'pinch-holds': null,                                    // Kein Pinch Hold in DB
  'hip-cars': null,                                       // Kein CAR in DB
  'thoracic-rotation': null,                              // Kein BWS Drill in DB
  'shoulder-dislocates': null,                            // Kein Shoulder Dislocate in DB
  'ankle-mobility': null,                                 // Kein Ankle Mobility in DB
  'heavy-bag-intervals': null,                            // Kein Heavy Bag in DB
  'barbell-complex': null,                                // Kein Barbell Complex in DB
  'battle-ropes': 'Battling_Ropes',                      // ✓ Battle Ropes vorhanden
  'sled-push': null                                       // Kein Sled Push in DB
};

// Lokale Bilder (Fallback): User kann eigene Bilder in img/exercises/ ablegen
function exerciseImgLocal(id) {
  return 'img/exercises/' + id + '.jpg';
}

function exerciseImgUrl(id, frame) {
  const dbId = exerciseImageMap[id];
  if (dbId) return EXERCISE_IMG_BASE + dbId + '/' + (frame || 0) + '.jpg';
  return null;
}

function exerciseIcon(id) {
  const remoteUrl = exerciseImgUrl(id, 0);
  const localUrl = exerciseImgLocal(id);
  // Versuche zuerst lokales Bild, dann Remote, dann kein Bild
  const src = remoteUrl || localUrl;
  return '<img src="' + src + '" alt="" class="ex-icon-img" loading="lazy" onerror="this.parentElement.classList.add(\'ex-icon-fallback\');this.remove()"/>';
}

// ===== ÜBUNGEN =====
const goalFilters = [
  { id:'all', label:'ALLE', icon:'', color:'var(--white)' },
  { id:'power', label:'HÄRTERE SCHLÄGE', icon:'', color:'var(--red)' },
  { id:'jab', label:'STÄRKERER JAB', icon:'', color:'#4fc3f7' },
  { id:'speed', label:'SCHNELLERE HÄNDE', icon:'', color:'var(--gold)' },
  { id:'footwork', label:'BEINARBEIT', icon:'', color:'var(--green)' },
  { id:'stamina', label:'MEHR AUSDAUER', icon:'', color:'#26c6da' },
  { id:'shoulders', label:'DECKUNG HALTEN', icon:'', color:'#ab47bc' },
  { id:'chin', label:'HÄRTERES KINN', icon:'', color:'var(--red)' },
  { id:'clinch', label:'CLINCH-KRAFT', icon:'', color:'#ff7043' },
  { id:'rotation', label:'HÜFTROTATION', icon:'', color:'#ffa726' },
  { id:'hands', label:'HÄRTERE HÄNDE', icon:'', color:'#ef5350' },
  { id:'injury', label:'VERLETZUNGSFREI', icon:'', color:'#66bb6a' }
];

let activeGoalFilter = 'all';

function filterExercisesByGoal(goalId) {
  activeGoalFilter = goalId;
  renderUebungenPage();
}

function renderUebungenPage() {
  const el = document.getElementById('page-uebungen');
  const fg = activeGoalFilter;
  const activeGoal = goalFilters.find(g => g.id === fg);

  // Filter exercises
  const fK = fg === 'all' ? exercisesKraft : exercisesKraft.filter(e => e.goals && e.goals.includes(fg));
  const fA = fg === 'all' ? exercisesAusdauer : exercisesAusdauer.filter(e => e.goals && e.goals.includes(fg));
  const fAr = fg === 'all' ? exercisesArmor : exercisesArmor.filter(e => e.goals && e.goals.includes(fg));
  const fH = fg === 'all' ? exercisesHands : exercisesHands.filter(e => e.goals && e.goals.includes(fg));
  const fM = fg === 'all' ? exercisesMobility : exercisesMobility.filter(e => e.goals && e.goals.includes(fg));
  const fPE = fg === 'all' ? exercisesPowerEndurance : exercisesPowerEndurance.filter(e => e.goals && e.goals.includes(fg));
  const fS = fg === 'all' ? exercisesSpecial : exercisesSpecial.filter(e => e.goals && e.goals.includes(fg));

  let counter = 0;

  el.innerHTML = `
  <div class="page-header">
    <div class="page-title">ÜBUNGS<span>BIBLIOTHEK</span></div>
    <div class="page-sub">Was willst du verbessern? Wähle ein Ziel oder sieh dir alle ${allExercises.length} Übungen an. Basierend auf Boxing Science, Phil Daru und Peer-Review-Studien.</div>
  </div>

  <!-- GOAL FILTER BAR -->
  <div class="goal-filter-bar">
    ${goalFilters.map(g => `<button class="goal-filter-btn${fg === g.id ? ' active' : ''}" style="--gfc:${g.color};" onclick="filterExercisesByGoal('${g.id}')">${g.icon ? g.icon + ' ' : ''}${g.label}</button>`).join('')}
  </div>
  ${fg !== 'all' ? `<div class="goal-filter-info" style="border-color:${activeGoal.color}40;">
    <span style="font-size:24px;">${activeGoal.icon}</span>
    <div><strong style="color:${activeGoal.color};">${activeGoal.label}</strong> – ${fK.length + fA.length + fAr.length + fH.length + fM.length + fPE.length + fS.length} Übungen gefunden</div>
  </div>` : ''}

  ${fK.length ? `<div class="cat-header" style="color:var(--blue);border-color:rgba(41,121,255,.3);">KRAFT & EXPLOSIVITÄT</div>
  <div class="grid-auto" style="margin-bottom:40px;">
    ${fK.map(e => { counter++; return exCard(e, counter, 'var(--blue)'); }).join('')}
  </div>` : ''}

  ${fA.length ? `<div class="cat-header" style="color:var(--green);border-color:rgba(0,200,83,.3);">AUSDAUER & ENERGIESYSTEME</div>
  <div class="grid-auto" style="margin-bottom:40px;">
    ${fA.map(e => { counter++; return exCard(e, counter, 'var(--green)'); }).join('')}
  </div>` : ''}

  ${fAr.length ? `<div class="cat-header" style="color:var(--red);border-color:rgba(232,0,13,.3);">NACKEN & ARMOR</div>
  <div class="grid-auto" style="margin-bottom:40px;">
    ${fAr.map(e => { counter++; return exCard(e, counter, 'var(--red)'); }).join('')}
  </div>` : ''}

  ${fH.length ? `<div class="cat-header" style="color:#ef5350;border-color:rgba(239,83,80,.3);">HAND & HANDGELENK</div>
  <div class="grid-auto" style="margin-bottom:40px;">
    ${fH.map(e => { counter++; return exCard(e, counter, '#ef5350'); }).join('')}
  </div>` : ''}

  ${fM.length ? `<div class="cat-header" style="color:#26c6da;border-color:rgba(38,198,218,.3);">MOBILITÄT & BEWEGLICHKEIT</div>
  <div class="grid-auto" style="margin-bottom:40px;">
    ${fM.map(e => { counter++; return exCard(e, counter, '#26c6da'); }).join('')}
  </div>` : ''}

  ${fPE.length ? `<div class="cat-header" style="color:#ff7043;border-color:rgba(255,112,67,.3);">KRAFTAUSDAUER & KONDITIONIERUNG</div>
  <div class="grid-auto" style="margin-bottom:40px;">
    ${fPE.map(e => { counter++; return exCard(e, counter, '#ff7043'); }).join('')}
  </div>` : ''}

  ${fS.length ? `<div class="cat-header" style="color:var(--gold);border-color:rgba(245,197,24,.3);">SPEZIALTRAINING</div>
  <div class="grid-auto" style="margin-bottom:40px;">
    ${fS.map(e => { counter++; return exCard(e, counter, 'var(--gold)'); }).join('')}
  </div>` : ''}

  <div style="margin-top:20px;padding:16px;background:var(--surface-0);border:1px solid var(--surface-2);border-radius:6px;">
    <div style="font-size:12px;color:#444;line-height:1.6;">QUELLEN: Boxing Science (Danny Wilson BSc MSc ASCC) · Phil Daru (Daru Strong) · Ross Enamait · Collins et al. 2014 (Neck/Concussion) · Loturco et al. 2016 (Punch Force) · PMC 2024 (VRT) · ExpertBoxing</div>
  </div>`;
}

function exCard(e, num, color) {
  // Immer Bildbereich zeigen – lokale Bilder laden automatisch wenn vorhanden
  return `<div class="ex-card" style="--ec:${color};cursor:pointer;" onclick="openExerciseDetail('${e.id}')">
    <div class="ex-card-img">${exerciseIcon(e.id)}</div>
    <div class="ex-top">
      <div class="ex-num">${String(num).padStart(2,'0')}</div>
      <div class="ex-name">${e.name}</div>
      <div class="ex-muscle">${e.muscle}</div>
    </div>
    <div class="ex-bot">${e.sets.map(s => '<span class="ex-s">'+s+'</span>').join('')}</div>
    <div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;margin-top:8px;letter-spacing:1px;">▸ DETAILS & MUSKELGRUPPEN</div>
  </div>`;
}

const exercisesKraft = [
  { id:'trap-bar-deadlift', muscles:['gluteus','quad_l','quad_r','core'], name:'TRAP BAR DEADLIFT', muscle:'PRIMÄR: Gluteus, Oberschenkel, Rückenstrecker · SEKUNDÄR: Core, Unterarm',
    goals:['power','injury'],
    desc:'Füße schulterbreit, Hände auf Griffen, Rücken gerade. Hüfte drückt nach vorne beim Hochkommen. Bessere Knieposition als konventioneller Deadlift, weniger Rückenstress, optimal für Explosivkraft.',
    sets:['Aufbau: <strong>4×5 @ 70%</strong>','Peak: <strong>4×3 @ 85%</strong>','Wettkampf: <strong>3×3 @ 75%</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Kreuzheben-Stärke korreliert direkt mit Schlagkraft durch Hüftstrecker-Dominanz. +20 kg Deadlift = messbar mehr Punch Force.',
    boxingConnection:'Die Hüftstrecker-Dominanz beim Trap Bar Deadlift bildet die Basis der kinetischen Kette im Boxen. Jeder Schlag beginnt am Boden – Kraft wird über Knöchel → Knie → Hüfte → Rumpf → Schulter → Faust übertragen. Studien zeigen: +20 kg Deadlift-1RM korreliert mit ~3% mehr Schlagkraft (Loturco et al., 2016).',
    video:'https://www.youtube.com/results?search_query=trap+bar+deadlift+form+tutorial'},
  { id:'jump-squat', muscles:['quad_l','quad_r','gluteus','wade_l','wade_r'], name:'JUMP SQUAT', muscle:'PRIMÄR: Quadrizeps, Gluteus · SEKUNDÄR: Waden, Core',
    goals:['power','speed','footwork'],
    desc:'Kniebeuge bis 90°, dann explosiv hochspringen – maximale Absicht! Landung weich, sofort nächste Rep. Last: 30–40% Körpergewicht (Optimum Power Load, Loturco 2016).',
    sets:['Sets: <strong>4×3–5</strong>','Last: <strong>30–40% BW</strong>','Pause: <strong>2–3 Min.</strong>'],
    tipLabel:'Häufigster Fehler', tip:'Zu schwer laden – dann wird es Kraft- statt Powertraining. Wenn du keine Luft spürst, ist die Last zu hoch.',
    boxingConnection:'Rate of Force Development (RFD) ist der limitierende Faktor für Schlaggeschwindigkeit. Jump Squats trainieren explosives Hüftextension-Timing bei 30-40% BW – exakt der optimale Lastbereich für maximale Powerentwicklung. Direkte Übertragung auf Beinarbeit und explosives Eindringen in die Schlagdistanz.',
    video:'https://www.youtube.com/results?search_query=jump+squat+proper+form+explosive'},
  { id:'landmine-press', muscles:['schulter_l','schulter_r','brust','core'], name:'LANDMINE PRESS', muscle:'PRIMÄR: Deltoid, Trizep · SEKUNDÄR: Core-Rotation, Serratus',
    goals:['power','jab','speed','rotation'],
    desc:'Stange in Ecke, Kniebeuge-Position, explosiv nach oben-vorne drücken – imitiert die Schulter-Bewegung bei Kreuzschlag. Einseitig trainieren deckt Ungleichgewichte auf.',
    sets:['Sets: <strong>4×5–6 je Seite</strong>','Last: <strong>70–80% 1RM</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Schulterpresse in boxspezifischem Muster. Aktiviert Serratus anterior – den "langer Schlag"-Muskel.',
    boxingConnection:'Die Landmine Press repliziert das biomechanische Muster eines Cross/geraden Rechten: diagonaler Push von unten nach vorne-oben mit Rumpfrotation. Der Serratus anterior – kritisch für Schulterprotraktion am Schlagende – wird maximal aktiviert. Unilaterale Ausführung deckt Kraftdefizite zwischen Führhand und Schlaghand auf.',
    video:'https://www.youtube.com/results?search_query=landmine+press+single+arm+technique'},
  { id:'hip-thrust', muscles:['gluteus','quad_l','quad_r'], name:'HIP THRUST', muscle:'PRIMÄR: Gluteus Maximus · SEKUNDÄR: Hamstrings, Core',
    goals:['power','rotation'],
    desc:'Schultern auf Bank, Stange auf Hüfte mit Polster. Hüfte hoch bis Körper gerade – 2 Sek. oben halten, kontrolliert senken. Gluteus ist der primäre Kraftgenerator für Schläge.',
    sets:['Sets: <strong>3×8</strong>','Last: <strong>60–80% 1RM</strong>','Pause oben: <strong>2 Sek.</strong>'],
    tipLabel:'Fehler', tip:'Hyperlordose der LWS – Bauch anspannen, neutraler Rücken konstant halten.',
    boxingConnection:'Der Gluteus Maximus ist der stärkste Muskel der kinetischen Kette und initiiert die Hüftrotation bei jedem Schlag. Hip Thrusts trainieren ihn in voller Hüftextension – genau die Position, in der Kraft bei einem Kreuzschlag übertragen wird. Starke Glutes ermöglichen explosiveres Einsteppen und stabilere Standposition bei Körpertreffern.',
    video:'https://www.youtube.com/results?search_query=barbell+hip+thrust+proper+form+glutes'},
  { id:'med-ball-rotation', muscles:['obliques_l','obliques_r','core','schulter_l','schulter_r'], name:'MED BALL ROTATIONSWURF', muscle:'PRIMÄR: Obliques, Core · SEKUNDÄR: Schulter, Hüfte',
    goals:['power','rotation','speed'],
    desc:'Seitlich zur Wand, Ball auf Hüfthöhe. Explosive Hüftrotation – Kraft vom Boden durch Hüfte in Ball. Imitiert Haken und Uppercut exakt.',
    sets:['Sets: <strong>3×6 je Seite</strong>','Ball: <strong>4–6 kg</strong>','Maximal explosiv'],
    tipLabel:'Boxing-Relevanz', tip:'Direkte Übertragung auf Hakenpower. Stärker als Cable Woodchop für boxspezifische Rotation.',
    boxingConnection:'Rotationsleistung der Obliques und des transversalen Abdominis korreliert direkt mit Haken- und Uppercut-Kraft (r=0.68, Turner et al., 2011). Der Medball-Rotationswurf trainiert die Stretch-Shortening-Zyklen der Rumpfmuskulatur bei boxspezifischer Geschwindigkeit. Die Wurfbewegung erzwingt volle Durchrotation der Hüfte – ein Muster, das viele Boxer vernachlässigen.',
    video:'https://www.youtube.com/results?search_query=medicine+ball+rotational+throw+wall+power'},
  { id:'explosive-pushup', muscles:['brust','schulter_l','schulter_r','bizeps_l','bizeps_r'], name:'EXPLOSIVE PUSH-UP', muscle:'PRIMÄR: Pectoralis, Trizep · SEKUNDÄR: Deltoid, Serratus',
    goals:['power','jab','speed'],
    desc:'Normale Position, explosiv hochdrücken bis Hände abheben – Klatscher optional. Weiche Landung, sofort nächste Rep. Für Power: max 5 Reps!',
    sets:['Sets: <strong>4×5</strong>','Pause: <strong>90–120 Sek.</strong>','Max. Explosivität'],
    tipLabel:'Fehler', tip:'Zu viele Reps – das wird Ausdauer. Für Power: max 5, lange Pause, maximale Kraft pro Rep.',
    boxingConnection:'Der explosive Liegestütz trainiert die Push-Kette (Brust, Trizeps, vorderer Deltoid) mit maximaler Beschleunigung – genau das Muster bei geraden Schlägen. Die Flugphase erzwingt maximale RFD, da die Hände den Boden verlassen müssen. Studien zeigen: Plyometrische Push-Ups verbessern die Armstreckgeschwindigkeit um 8-12%, direkt übertragbar auf Jab- und Cross-Geschwindigkeit.',
    video:'https://www.youtube.com/results?search_query=explosive+clap+pushup+plyometric+form'},
  { id:'overcoming-iso', muscles:['brust','quad_l','quad_r','core','schulter_l','schulter_r'], name:'OVERCOMING ISOMETRICS', muscle:'PRIMÄR: Je nach Position · SEKUNDÄR: ZNS-Aktivierung',
    goals:['power','speed'],
    desc:'6 Sek. @ 100% gegen unbeweglichen Widerstand (Wand, Türrahmen, Boden). Rekrutiert bis zu 95% aller Motoreinheiten ohne Equipment. Wand-Push, Floor-Pull, Iso-Kniebeuge.',
    sets:['Kontraktion: <strong>6 Sek. @ 100%</strong>','Sets: <strong>4 je Übung</strong>','Kein Equipment'],
    tipLabel:'Wann', tip:'Ideal morgens vor der Arbeit (06:00–06:45) wenn Gym noch zu ist. Aktiviert ZNS für den ganzen Tag.',
    boxingConnection:'Overcoming Isometrics rekrutieren bis zu 95% aller motorischen Einheiten – mehr als konzentrische Bewegungen (~60-80%). Für Boxer bedeutet das: maximale neurale Aktivierung ohne Gelenkbelastung oder Muskelschaden. Perfekt für das morgendliche ZNS-Priming vor der Arbeit, das die nachfolgende Trainingsqualität steigert (PAP-Effekt hält 6-8 Stunden).',
    video:'https://www.youtube.com/results?search_query=overcoming+isometrics+strength+training+guide'},
  { id:'single-leg-rdl', muscles:['gluteus','quad_l','quad_r'], name:'SINGLE-LEG RDL', muscle:'PRIMÄR: Hamstrings, Gluteus · SEKUNDÄR: Balance, Stabilität',
    goals:['injury','clinch','footwork'],
    desc:'Einbeinig stehend, Hantel in gegenüberliegender Hand, nach vorne beugen bis Rücken parallel. 3 Sek. senken, explosiv zurück. Deckt Links-Rechts-Defizite auf.',
    sets:['Sets: <strong>3×8 je Seite</strong>','Tempo: <strong>3-1-1</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Boxen ist einseitig. Unilaterales Training erhöht Stabilität beim Schlagen aus verschiedenen Positionen.',
    boxingConnection:'Boxen ist eine unilateral dominierte Sportart – du stehst fast immer mehr auf einem Bein als auf dem anderen. Der Single-Leg RDL trainiert einbeinige Hüftstabilität und posteriore Kettenkraft, was direkt die Standstabilität beim Schlagen aus der Ausfallposition verbessert. Beseitigt Seitenasymmetrien, die Kraftverluste von 10-15% in der schwächeren Seite verursachen können.',
    video:'https://www.youtube.com/results?search_query=single+leg+romanian+deadlift+form+dumbbell'},
  { id:'power-clean', muscles:['gluteus','quad_l','quad_r','schulter_l','schulter_r','core'], name:'POWER CLEAN', muscle:'PRIMÄR: Gesamte hintere Kette · SEKUNDÄR: Schultern, Unterarme',
    goals:['power','speed'],
    desc:'Stange vom Boden explosiv auf Schultern umsetzen. Dreifach-Extension (Knöchel-Knie-Hüfte) in einer Bewegung. Die explosivste Ganzkörperübung überhaupt – trainiert Rate of Force Development.',
    sets:['Sets: <strong>5×3</strong>','Last: <strong>60–75% 1RM</strong>','Pause: <strong>3 Min.</strong>'],
    tipLabel:'Fehler', tip:'Mit Armen ziehen statt Hüfte explodieren lassen. Die Arme sind nur Haken – die Power kommt aus der Hüfte.',
    boxingConnection:'Der Power Clean ist die ultimative Triple-Extension-Übung (Knöchel-Knie-Hüfte) – exakt die Bewegungskette, die bei einem Aufwärtshaken oder Cross aus den Beinen eingeleitet wird. Peak Power Output beim Clean erreicht 3000-5000W – kein anderes Krafttraining kommt an diese RFD heran. Die Fähigkeit, Kraft in <200ms zu entwickeln, ist der Schlüssel zu Schlaggeschwindigkeit.',
    video:'https://www.youtube.com/results?search_query=power+clean+technique+tutorial+barbell'},
  { id:'bench-press', muscles:['brust','schulter_l','schulter_r','bizeps_l','bizeps_r'], name:'BENCH PRESS', muscle:'PRIMÄR: Pectoralis, Trizep · SEKUNDÄR: Deltoid anterior',
    goals:['power','jab'],
    desc:'Klassisches Bankdrücken, schulterbreiter Griff. Kontrolliert senken (2 Sek.), explosiv drücken. Für Boxer: Fokus auf Geschwindigkeit, nicht Maximum.',
    sets:['Aufbau: <strong>4×6 @ 70%</strong>','Peak: <strong>4×3 @ 85%</strong>','Wettkampf: <strong>3×5 @ 65% explosiv</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Trainiert die Push-Muskulatur für gerade Schläge. Velocity-based: Stange so schnell wie möglich bewegen.',
    boxingConnection:'Das Bankdrücken stärkt den Pectoralis major und Trizeps – die primären Muskeln für die horizontale Armstreckung bei Jab und Cross. Velocity-Based Training (VBT) beim Bankdrücken bei 60-70% 1RM optimiert die Kraftkurve für boxspezifische Geschwindigkeit. Wichtig: Nicht 1RM-Jagd, sondern Barspeed maximieren – das überträgt sich direkt auf Faust-Endgeschwindigkeit.',
    video:'https://www.youtube.com/results?search_query=bench+press+proper+form+technique+guide'},
  { id:'pull-ups', muscles:['bizeps_l','bizeps_r','schulter_l','schulter_r','core'], name:'PULL-UPS', muscle:'PRIMÄR: Latissimus, Bizeps · SEKUNDÄR: Rhomboideen, Core',
    goals:['clinch','shoulders','injury'],
    desc:'Schulterbreiter Griff, volle Extension unten, Kinn über Stange oben. Kontrolliert senken (2 Sek.). Wenn noch keine saubere Rep: exzentrische Pull-Ups (5 Sek. runter) oder Band-Assisted.',
    sets:['Sets: <strong>4×6–10</strong>','Gewichtet: <strong>+5–20 kg</strong>','Anfänger: <strong>Exzentrisch 3×5</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Einzige Zugübung im Plan! Ohne Rücken-Balance bei so viel Push-Training → Schulterverletzungen und Haltungsprobleme.',
    boxingConnection:'Boxer pushen ständig (Schläge = Push-Bewegung) aber ziehen fast nie. Dieses Ungleichgewicht führt zu Schulterprotraktions-Syndrom und erhöht das Verletzungsrisiko massiv. Pull-Ups trainieren den Latissimus (größter Oberkörper-Muskel), der für die Rückhand-Rückführung und Clinch-Kontrolle verantwortlich ist. Auch für das schnelle Zurückziehen der Hände nach dem Schlag essentiell.',
    video:'https://www.youtube.com/results?search_query=pull+up+proper+form+technique'},
  { id:'pallof-press', muscles:['core','obliques_l','obliques_r'], name:'PALLOF PRESS', muscle:'PRIMÄR: Core (Anti-Rotation) · SEKUNDÄR: Obliques, Hüftstabilisatoren',
    goals:['rotation','power','injury'],
    desc:'Kabel/Band auf Brusthöhe, seitlich stehen. Griff mit beiden Händen vor die Brust, dann Arme strecken und 3 Sek. halten. Der Core muss die Rotation WIDERSTEHEN. Langsam zurück.',
    sets:['Sets: <strong>3×10 je Seite</strong>','Hold: <strong>3 Sek.</strong>','Frequenz: <strong>2–3×/Woche</strong>'],
    tipLabel:'Warum Anti-Rotation?', tip:'Schlagkraft entsteht durch Rotation – aber nur wenn der Core STIFF genug ist um Kraft zu übertragen. Ohne Core-Steifigkeit geht Energie verloren.',
    boxingConnection:'Anti-Rotations-Training ist das fehlende Puzzlestück für Schlagkraft. Der Core muss gleichzeitig Rotation ERZEUGEN (Obliques) und Energieverlust VERHINDERN (Anti-Rotation). Der Pallof Press trainiert die transversale Stabilität – die Fähigkeit, Rotationskräfte ohne Energieverlust durch den Rumpf zu übertragen. Boxing Science nennt es "Core Stiffness" – je steifer der Rumpf, desto mehr Beinkraft erreicht die Faust.',
    video:'https://www.youtube.com/results?search_query=pallof+press+anti+rotation+core+exercise'},
  { id:'face-pulls', muscles:['schulter_l','schulter_r'], name:'FACE PULLS', muscle:'PRIMÄR: Hinterer Deltoid, Rotatorenmanschette · SEKUNDÄR: Rhomboideen, Trapez',
    goals:['injury','shoulders'],
    desc:'Kabel auf Gesichtshöhe, Seilgriff. Zu den Ohren ziehen, Ellbogen hoch, External Rotation am Ende. Squeeze 2 Sek. Leichtes Gewicht, hohe Reps – das ist PREHAB, kein Krafttraining.',
    sets:['Sets: <strong>3×15–20</strong>','Last: <strong>leicht</strong>','Frequenz: <strong>Jedes Training</strong>'],
    tipLabel:'PFLICHT-Übung', tip:'Für jeden Boxer der viel schlägt. Schulter-Prehab ist nicht optional – ohne Face Pulls bei hohem Schlagvolumen sind Schulterverletzungen nur eine Frage der Zeit.',
    boxingConnection:'Boxer entwickeln massive anteriore Deltoid/Pec-Dominanz durch das ständige Pushing (Schlagen). Ohne Gegenbewegung entsteht ein Ungleichgewicht: Schulter rotiert nach vorne, Rotatorenmanschette wird komprimiert, Impingement entsteht. Face Pulls trainieren den hinteren Deltoid und die Außenrotatoren – die direkten Antagonisten zur Schlagbewegung. Minimum 3×15 bei JEDEM Training als Warm-Up oder Finisher.',
    video:'https://www.youtube.com/results?search_query=face+pulls+proper+form+shoulder+health'},
  { id:'farmers-walk', muscles:['unterarm_l','unterarm_r','core','schulter_l','schulter_r'], name:'FARMER\'S WALK', muscle:'PRIMÄR: Grip, Core · SEKUNDÄR: Trapez, Schultern, gesamter Körper',
    goals:['clinch','injury','hands'],
    desc:'Schwere Kurzhanteln oder Trap Bar in beiden Händen. Aufrecht gehen, Schultern hinten, Core angespannt. 30–40m oder 30–45 Sek. So schwer wie möglich bei sauberer Haltung.',
    sets:['Sets: <strong>3×30–40m</strong>','Last: <strong>BW je Hand</strong>','Pause: <strong>90 Sek.</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Grip-Ausdauer für 12 Runden Clinch-Arbeit. Core-Stabilität unter Last. Gesamtkörper-Konditionierung.',
    boxingConnection:'Farmer\'s Walks trainieren gleichzeitig: Grip-Ausdauer (Clinch), Trapez-Kraft (Nacken-Schutz), Core-Stabilität unter Last (Körpertreffer einstecken) und aufrechte Haltung (Guard-Position). Phil Daru nutzt sie als Grundübung für alle seine UFC/Boxkämpfer. Die isometrische Belastung aller Muskeln gleichzeitig imitiert die Ganzkörper-Spannung, die ein Boxer im Ring konstant aufrechterhalten muss.',
    video:'https://www.youtube.com/results?search_query=farmers+walk+carry+proper+form+heavy'},
  { id:'lateral-bounds', muscles:['gluteus','quad_l','quad_r','wade_l','wade_r'], name:'LATERAL BOUNDS', muscle:'PRIMÄR: Gluteus Medius, Adduktoren · SEKUNDÄR: Quads, Waden',
    goals:['footwork','power'],
    desc:'Einbeinig seitlich abspringen, auf dem anderen Bein landen, 1 Sek. stabilisieren. Explosiv zurückspringen. Knie tracking über Zehen. Leise landen!',
    sets:['Sets: <strong>3×6 je Seite</strong>','Pause: <strong>90 Sek.</strong>','Kein Equipment'],
    tipLabel:'Boxing-Relevanz', tip:'Boxer bewegen sich primär SEITLICH. Laterale Explosivkraft ist für Cut Angles und Ausweichen entscheidend – aber wird fast nie trainiert.',
    boxingConnection:'Im Ring bewegst du dich zu 60-70% lateral – Ausweichen, Winkel schneiden, seitliches Ein/Aussteppen. Trotzdem trainieren die meisten Boxer nur sagittale Bewegungen (Squats, Sprints). Lateral Bounds trainieren den Gluteus Medius und die Adduktoren in explosiver lateraler Bewegung – direkt übertragbar auf schnelles seitliches Ausweichen und das Schneiden von Winkeln nach Kombinationen.',
    video:'https://www.youtube.com/results?search_query=lateral+bounds+plyometric+single+leg'}
];

const exercisesAusdauer = [
  { id:'zone2', muscles:['quad_l','quad_r','wade_l','wade_r','gluteus'], name:'ZONE 2 LAUFEN', muscle:'AEROB · Mitochondrien-Biogenese · Lipid-Oxidation',
    goals:['stamina'],
    desc:'60–70% HFmax – du kannst noch vollständige Sätze sprechen. 30–60 Min. Unter 30 Min. passiert zu wenig für die Mitochondrien-Biogenese – erst ab 30 Min. wird PGC-1α ausreichend aktiviert. Fahrrad zur Arbeit zählt! Baut die aerobe Basis, auf der alle Hochintensität aufbaut.',
    sets:['Frequenz: <strong>4–6×/Woche</strong>','HF: <strong>60–70% Max</strong>','Dauer: <strong>30–60 Min.</strong>'],
    tipLabel:'Zeiteffizienz', tip:'Fahrrad zur Arbeit = Zone 2 ohne Extrazeit. Längste ROI-Übung im gesamten Plan.',
    boxingConnection:'Ein 3×3-Minuten-Kampf wird zu ~77% aerob gedeckt (Guidetti et al., 2002). Zone 2 Training stimuliert mitochondriale Biogenese via PGC-1α und verbessert die Phosphokreatin-Resynthese zwischen explosiven Aktionen. Je besser dein aerobes Fundament, desto schneller regenerierst du zwischen Kombinationen – in Runde 3 trennt sich die Spreu vom Weizen.',
    video:'https://www.youtube.com/results?search_query=zone+2+cardio+training+heart+rate+guide'},
  { id:'hiit-4x4', muscles:['quad_l','quad_r','wade_l','wade_r','core'], name:'HIIT 4×4 PROTOKOLL', muscle:'ANAEROB/AEROB · VO₂max-Steigerung',
    goals:['stamina'],
    desc:'4 Min. bei >90% HFmax, dann 3 Min. aktive Erholung × 4 Runden. Norwegisches Modell – effektivste Methode zur VO₂max-Steigerung. Max 2×/Woche.',
    sets:['Runden: <strong>4</strong>','Work: <strong>4 Min. >90% HF</strong>','Rest: <strong>3 Min.</strong>','Max: <strong>2×/Woche</strong>'],
    tipLabel:'Wann', tip:'Am besten zum Vereins-Cardio-Tag oder morgens an Nicht-Sparring-Tagen.',
    boxingConnection:'VO₂max ist der stärkste Prädiktor für Ausdauerleistung im Boxen. Das 4×4-Protokoll (Helgerud et al., 2007) steigert VO₂max um 5-8% in 8 Wochen – kein anderes Protokoll ist effizienter. Höhere VO₂max bedeutet: schnellere Laktat-Clearance, bessere PCr-Resynthese und die Fähigkeit, in Runde 3 noch mit voller Schlagkraft zu agieren.',
    video:'https://www.youtube.com/results?search_query=4x4+hiit+interval+training+vo2max+protocol'},
  { id:'fartlek', muscles:['quad_l','quad_r','wade_l','wade_r'], name:'FARTLEK LAUF', muscle:'AEROB/ANAEROB · Energiesystem-Flexibilität',
    goals:['stamina'],
    desc:'Lauf mit spontanen Tempowechseln: 2 Min. gemütlich → 1 Min. hart → 30 Sek. Sprint. Imitiert die unregelmäßigen Intensitätswechsel im Kampf. Nach Gefühl.',
    sets:['Dauer: <strong>25–35 Min.</strong>','Frequenz: <strong>1–2×/Woche</strong>'],
    tipLabel:'Vorteil', tip:'Weniger ZNS-Belastung als reines HIIT, trotzdem multiple Zonen. Gut für Aufbauwochen.',
    boxingConnection:'Ein Boxkampf wechselt ständig zwischen Intensitäten: lockere Beinarbeit (aerob), explosive Kombinationen (alaktazid), Clinch-Arbeit (laktazid). Fartlek imitiert genau dieses Muster mit unregelmäßigen Tempowechseln. Es trainiert die metabolische Flexibilität – die Fähigkeit, nahtlos zwischen Energiesystemen zu wechseln, ohne dass die Leistung einbricht.',
    video:'https://www.youtube.com/results?search_query=fartlek+running+training+speed+variation'},
  { id:'sit-sprints', muscles:['quad_l','quad_r','gluteus','wade_l','wade_r'], name:'SIT – SPRINT-INTERVALLE', muscle:'ANAEROB alaktazid/laktazid · PCr-System',
    goals:['stamina','power'],
    desc:'8–10× maximaler 30-Sek.-Sprint mit 2–4 Min. Erholung. Trainiert PCr-Resynthese – genau was zwischen Kombinationen im Ring passiert.',
    sets:['Sprints: <strong>8–10×</strong>','Work: <strong>30 Sek. MAX</strong>','Rest: <strong>2–4 Min.</strong>','Max: <strong>1×/Woche</strong>'],
    tipLabel:'Achtung', tip:'Sehr hohe ZNS-Belastung! Nie am Tag vor hartem Sparring einplanen.',
    boxingConnection:'Das Phosphokreatin-System (PCr) liefert die Energie für explosive 3-5-Sekunden-Aktionen wie eine harte Kombination. Sprint-Intervalle trainieren die PCr-Resyntheserate – d.h. wie schnell du nach einer explosiven Aktion wieder voll geladen bist. Burley & Kenefick (2018) zeigen: SIT verbessert die wiederholte Sprint-Fähigkeit um 4-8%, direkt relevant für Kampfsport.',
    video:'https://www.youtube.com/results?search_query=sprint+interval+training+SIT+30+second+sprints'},
  { id:'seilspringen', muscles:['wade_l','wade_r','schulter_l','schulter_r','core'], name:'SEILSPRINGEN', muscle:'Waden, Schultern, Core · Koordination + Rhythmus',
    goals:['footwork','stamina','shoulders'],
    desc:'Grundsprung: Handgelenke drehen, Ellbogen eng am Körper, minimal vom Boden abheben. Variationen: Single Leg, Double Under, Boxer Skip, Criss-Cross. 3–10 Runden á 3 Min.',
    sets:['Runden: <strong>3–10 × 3 Min.</strong>','Pause: <strong>30–60 Sek.</strong>','Frequenz: <strong>Jedes Training</strong>'],
    tipLabel:'DIE Boxing-Übung', tip:'Kein Boxtraining ohne Seilspringen. Trainiert Rhythmus, Timing, Waden-Ausdauer und Koordination gleichzeitig. Jedes Profi-Camp weltweit beginnt damit.',
    boxingConnection:'Seilspringen ist seit über 100 Jahren fester Bestandteil jedes Boxing-Camps – aus gutem Grund. Es trainiert: (1) Waden-Ausdauer für leichtfüßige Beinarbeit über 12 Runden, (2) Schulter-Ausdauer durch konstante Armbewegung, (3) Rhythmus und Timing – fundamentale Boxing-Skills, (4) Koordination zwischen Ober- und Unterkörper. Floyd Mayweather trainierte bis zu 30 Min. Seilspringen pro Session – häufig zitiert, nicht wissenschaftlich dokumentiert.',
    video:'https://www.youtube.com/results?search_query=boxing+jump+rope+tutorial+beginner+to+advanced'}
];

const exercisesArmor = [
  { id:'iso-nacken', muscles:['nacken'], name:'ISOMETRISCHE NACKEN-HOLDS', muscle:'Sternocleidomastoideus, Splenius, Suboccipital-Gruppe',
    goals:['chin','injury'],
    desc:'Hand gegen Stirn drücken, Kopf hält dagegen. 8–10 Sek. pro Richtung (vorne, hinten, links, rechts). Kein Equipment nötig. Ideal als Desk-Übung und Morgentraining.',
    sets:['Sets: <strong>3 je Richtung</strong>','Hold: <strong>8–10 Sek.</strong>','Frequenz: <strong>3×/Woche</strong>'],
    tipLabel:'WICHTIG', tip:'NIEMALS Nackenbrücken! Cervikale Kompression + Bewegung = Bandscheibenrisiko. Isometrie ist sicherer UND effektiver.',
    boxingConnection:'Signifikanter Zusammenhang zwischen Nackenstaerke und KO-Schutz (Collins et al. 2014, n=6704 – Jugendstudie, Effekt bei Erwachsenen kleiner aber belegt). Die Nackenmuskulatur erhoeht die effektive Masse des Kopf-Hals-Segments und reduziert die Rotationsbeschleunigung bei Treffern. Isometrisches Training ist sicherer als dynamische Uebungen.',
    video:'https://www.youtube.com/results?search_query=isometric+neck+exercises+strengthening+combat'},
  { id:'nacken-flexion', muscles:['nacken'], name:'NACKEN-FLEXION MIT TELLER', muscle:'Sternocleidomastoideus, Scaleni',
    goals:['chin','injury'],
    desc:'Rücken auf Bank, Kopf über Rand. Teller (2.5–5 kg) auf Stirn, Kinn langsam Richtung Brust (3 Sek.). Progressiv: 2.5 → 5 → 7.5 → 10 kg über Monate.',
    sets:['Sets: <strong>3×12–15</strong>','Start: <strong>2.5 kg</strong>','Ziel: <strong>10–15 kg</strong>'],
    tipLabel:'Progression', tip:'Alle 2 Wochen +0.5–1 kg wenn alle Reps sauber. Rush nicht – Nacken braucht Zeit.',
    boxingConnection:'Der Sternocleidomastoideus (SCM) ist der primäre Flexor des Halses und bremst die Kopfextension bei frontalen Treffern. Kontrollierte Nackenflexion mit progressiver Belastung baut den SCM und die Scaleni auf, ohne die Wirbelsäule zu gefährden. Stärkere Nackenflexoren bedeuten weniger Kopfbewegung bei Jab-Treffern – der häufigste Schlag im Amateur-Boxen.',
    video:'https://www.youtube.com/results?search_query=neck+flexion+exercise+plate+weight+bench'},
  { id:'rice-bucket', muscles:['unterarm_l','unterarm_r'], name:'RICE BUCKET', muscle:'Unterarm-Flexoren, Extensoren, Hand-Muskeln',
    goals:['hands','injury','clinch'],
    desc:'Hände in Reiseimer: Greifen, Drehen, Spreizen, Drücken – 3 Min. durchgehend. Stärkt Unterarm für besseren Punch-Transfer und stabilisiert Handgelenk.',
    sets:['Dauer: <strong>3 Min.</strong>','Frequenz: <strong>3×/Woche</strong>','Post-Training'],
    tipLabel:'Tipp', tip:'5kg Reis + Plastikbehälter = ~8€. Hält Jahre. Einer der besten Boxer-Investitionen.',
    boxingConnection:'Die Handgelenkstabilität ist entscheidend für verletzungsfreie Kraftübertragung beim Aufprall. 40% aller Boxverletzungen betreffen Hand/Handgelenk (Loosemore et al., 2017). Rice Bucket Training stärkt die 20+ kleinen Muskeln von Unterarm und Hand in allen Bewegungsebenen gleichzeitig – Flexion, Extension, Deviation und Rotation. Resultat: stabileres Handgelenk bei Aufprall und weniger Ermüdung beim Bandagieren.',
    video:'https://www.youtube.com/results?search_query=rice+bucket+hand+forearm+strengthening+exercises'},
  { id:'pogo-jumps', muscles:['wade_l','wade_r'], name:'POGO JUMPS', muscle:'Wadenmuskulatur, Achillessehne, Plantarfaszie',
    goals:['footwork','injury'],
    desc:'Auf der Stelle springen, Knie fast gestreckt, nur Knöchel/Wade. So schnell wie möglich! Trainiert Ankle Stiffness für schnelle Beinarbeit.',
    sets:['Sets: <strong>4×30 Sek.</strong>','Pause: <strong>60 Sek.</strong>','Kein Equipment'],
    tipLabel:'Boxing-Relevanz', tip:'Schnelle Beinarbeit = schnelle Sprunggelenke. Pogos reduzieren Bodenkontaktzeit und verbessern Footwork.',
    boxingConnection:'Ankle Stiffness – die Fähigkeit des Sprunggelenks, Kraft schnell zu übertragen – bestimmt die Bodenkontaktzeit bei Beinarbeit. Pogo Jumps trainieren den Dehnungs-Verkürzungs-Zyklus der Wadenmuskulatur und Achillessehne bei minimaler Bodenkontaktzeit (<200ms). Schnellere Füße = schnelleres Ein- und Aussteppen, bessere Winkelarbeit und die Fähigkeit, in Sekundenbruchteilen die Distanz zu ändern.',
    video:'https://www.youtube.com/results?search_query=pogo+jumps+ankle+stiffness+plyometric+drill'}
];

const exercisesHands = [
  { id:'reverse-curls', muscles:['unterarm_l','unterarm_r'], name:'REVERSE CURLS', muscle:'PRIMÄR: Brachioradialis, Handgelenk-Extensoren · SEKUNDÄR: Bizeps',
    goals:['hands','injury'],
    desc:'Langhantel oder Kurzhanteln im Obergriff (Handflächen nach unten). Kontrolliert curlen, 3 Sek. exzentrisch senken. Stärkt die Handgelenk-Extensoren für Aufprallsteifigkeit beim Schlag.',
    sets:['Sets: <strong>3–5×5–8</strong>','Last: <strong>moderat</strong>','Tempo: <strong>2-0-3 exzentrisch</strong>'],
    tipLabel:'Boxing Science', tip:'Exzentrische Handgelenkstärke = Aufprallsteifigkeit. Wenn das Handgelenk beim Impact nachgibt, geht Kraft verloren und Verletzungsrisiko steigt.',
    boxingConnection:'Boxing Science listet Reverse Curls als eine der Top-Übungen für Punch Snap. Die Handgelenk-Extensoren stabilisieren das Handgelenk beim Aufprall in neutraler Position. Schwache Extensoren = das Handgelenk knickt beim Impact ein → Kraftverlust und Verletzung. Exzentrisches Training dieser Muskeln erhöht die "Impact Stiffness" der Faust.',
    video:'https://www.youtube.com/results?search_query=reverse+barbell+curl+form+forearm'},
  { id:'knuckle-pushups', muscles:['brust','unterarm_l','unterarm_r','core'], name:'KNUCKLE PUSH-UPS', muscle:'Pectoralis, Trizep · ZUSATZ: Knöchel-Konditionierung, Handgelenk-Stabilität',
    goals:['hands','power'],
    desc:'Push-Ups auf den ersten zwei Knöcheln (Zeige- und Mittelfinger). Start auf weicher Matte, progressiv härterer Untergrund. Hält Handgelenk in neutraler Position – weniger Stress als normale Push-Ups.',
    sets:['Sets: <strong>3×10–15</strong>','Progression: <strong>Matte → Holz → Boden</strong>','Frequenz: <strong>3×/Woche</strong>'],
    tipLabel:'Warum', tip:'Konditioniert Knöchel für Impact. Baut Knochendichte an den Aufprallpunkten auf. Handgelenk bleibt neutral = gesündere Position als gebeugt.',
    boxingConnection:'Die ersten zwei Knöchel (Zeige- und Mittelfinger) sind die primären Aufprallpunkte beim Schlag. Knuckle Push-Ups konditionieren diese Punkte progressiv – Knochendichte steigt durch Wolff\'s Law (Knochen adaptiert an Belastung). Gleichzeitig trainiert die neutrale Handgelenkposition die Stabilisatoren für korrekten Impact-Winkel.',
    video:'https://www.youtube.com/results?search_query=knuckle+push+ups+form+progression'},
  { id:'bottoms-up-kb', muscles:['schulter_l','schulter_r','unterarm_l','unterarm_r','core'], name:'BOTTOMS-UP KB PRESS', muscle:'Deltoid, Trizep · ZUSATZ: Handgelenk-Stabilität, Grip-Aktivierung',
    goals:['hands','injury','shoulders'],
    desc:'Kettlebell umgedreht halten (Boden nach oben). Einarmig über Kopf drücken. Die instabile Position erzwingt maximale Handgelenk-Stabilisierung und Grip-Aktivierung bei jeder Rep.',
    sets:['Sets: <strong>3–4×8–10 je Seite</strong>','Last: <strong>leicht starten (8–12 kg)</strong>','Pause: <strong>60 Sek.</strong>'],
    tipLabel:'Boxing Science', tip:'Boxing Science empfiehlt diese Übung explizit für Handgelenk-Stabilität. Erzwingt aktive Stabilisierung unter Last – direkter Transfer zur Faust-Stabilität beim Aufprall.',
    boxingConnection:'Beim Bottoms-Up KB Press muss das Handgelenk aktiv stabilisiert werden, um die Kettlebell in Balance zu halten. Das trainiert die propriozeptiven Stabilisatoren des Handgelenks unter Last – exakt das Muster, das beim Faustaufprall gebraucht wird. Boxing Science empfiehlt 3-4 Sätze á 8-10 Reps als Teil des Hand/Handgelenk-Programms.',
    video:'https://www.youtube.com/results?search_query=bottoms+up+kettlebell+press+form+wrist'},
  { id:'wrist-roller', muscles:['unterarm_l','unterarm_r'], name:'WRIST ROLLER', muscle:'Unterarm-Flexoren und -Extensoren',
    goals:['hands','clinch'],
    desc:'Stab mit Seil und Gewicht. Gewicht hochrollen durch Handgelenkdrehung (vorwärts = Flexoren, rückwärts = Extensoren). 3 Sets hoch + runter. Klassischste Unterarmübung im Kampfsport.',
    sets:['Sets: <strong>3× hoch + runter</strong>','Last: <strong>2.5–5 kg Start</strong>','Frequenz: <strong>2–3×/Woche</strong>'],
    tipLabel:'Tipp', tip:'Einfach selbst bauen: Besenstiel + 1m Schnur + Gewichtsscheibe. Kostet 5€, hält ewig.',
    boxingConnection:'Der Wrist Roller trainiert Flexoren UND Extensoren des Unterarms in einer einzigen Übung. Die konstante Griffbelastung plus Handgelenkrotation imitiert die Anforderung beim wiederholten Schlagen über 3+ Runden. Alte Boxing-Tradition: Jedes Gym der 60er-80er Jahre hatte einen Wrist Roller – aus gutem Grund.',
    video:'https://www.youtube.com/results?search_query=wrist+roller+exercise+form+forearm+strength'},
  { id:'pinch-holds', muscles:['unterarm_l','unterarm_r'], name:'PINCH HOLDS', muscle:'Daumen-Adduktoren, Unterarm-Stabilisatoren',
    goals:['hands','clinch'],
    desc:'Zwei 10kg-Scheiben glatte Seite nach außen zusammenhalten. Nur mit Daumen + Fingern greifen (Pinch Grip). Halten bis Versagen. Testet und trainiert die Open-Close-Funktion der Faust.',
    sets:['Sets: <strong>3–4×20–40 Sek.</strong>','Last: <strong>2×10 kg Scheiben</strong>','Test: <strong><10% Differenz L/R</strong>'],
    tipLabel:'Boxing Science', tip:'Boxing Science nutzt den Pinch Hold Test als Assessment: Zeit bis Versagen, <10% Seitendifferenz = gesund. >10% = Defizit das behoben werden muss.',
    boxingConnection:'Der Pinch Grip trainiert die "Faust schließen"-Funktion – genau die Muskelgruppe, die beim Impact die Faust zusammenhält. Boxing Science nutzt Pinch Holds sowohl als Training als auch als Diagnostik-Tool. Die Kombination aus Daumenadduktion und Fingerflexion imitiert das explosive Faust-Schließen, das in den letzten Millisekunden vor dem Aufprall passiert.',
    video:'https://www.youtube.com/results?search_query=plate+pinch+hold+grip+strength+exercise'}
];

const exercisesMobility = [
  { id:'hip-cars', muscles:['gluteus','core'], name:'HIP CARs', muscle:'Hüftgelenk – Gesamter Bewegungsumfang',
    goals:['rotation','injury','footwork'],
    desc:'Vierfüßlerstand, ein Knie heben, maximalen Kreis mit dem Knie zeichnen – erst vorwärts, dann rückwärts. Langsam, kontrolliert, endgradig. 5 Kreise pro Richtung. Ziel: den vollen Bewegungsumfang der Hüfte TÄGLICH nutzen.',
    sets:['Sets: <strong>5 Kreise je Richtung</strong>','Seiten: <strong>beide</strong>','Frequenz: <strong>Täglich (Warm-Up)</strong>'],
    tipLabel:'Boxing Science', tip:'Hüftmobilität ist der limitierende Faktor für Rotationskraft. Wenn die Hüfte nicht frei rotieren kann, kompensiert die LWS – Verletzung vorprogrammiert.',
    boxingConnection:'Jeder Schlag wird durch Hüftrotation eingeleitet. Eingeschränkte Hüftmobilität bedeutet: (1) weniger Rotationswinkel = weniger Kraftübertragung, (2) LWS kompensiert = Rückenschmerzen. CARs (Controlled Articular Rotations) nach FRC-System erhalten und erweitern den Bewegungsumfang des Hüftgelenks. Boxing Science empfiehlt sie als tägliches Warm-Up für alle Boxer.',
    video:'https://www.youtube.com/results?search_query=hip+CARs+controlled+articular+rotations+tutorial'},
  { id:'thoracic-rotation', muscles:['core','obliques_l','obliques_r'], name:'THORACIC SPINE ROTATION', muscle:'Brustwirbelsäule – Rotation + Extension',
    goals:['rotation','injury'],
    desc:'Seitlich liegen, Knie übereinander (90°). Oberen Arm in großem Bogen öffnen, Blick folgt der Hand. 3 Sek. halten in Endposition. Die BWS MUSS rotieren – nicht die LWS!',
    sets:['Sets: <strong>3×8 je Seite</strong>','Hold: <strong>3 Sek.</strong>','Frequenz: <strong>Täglich</strong>'],
    tipLabel:'Warum kritisch', tip:'Die Brustwirbelsäule soll rotieren, die Lendenwirbelsäule soll STABIL sein. Wenn die BWS steif ist, rotiert die LWS – und die ist dafür nicht gebaut.',
    boxingConnection:'Die Brustwirbelsäule ist das Rotationszentrum für Haken und Uppercuts. Eingeschränkte BWS-Rotation (häufig bei Schreibtischarbeit) führt dazu, dass Rotationskräfte in der LWS oder Schulter kompensiert werden – die häufigsten Verletzungsstellen bei Boxern. Phil Daru nutzt BWS-Mobilität als Eingangs-Assessment bei allen neuen Kämpfern.',
    video:'https://www.youtube.com/results?search_query=thoracic+spine+rotation+mobility+drill'},
  { id:'shoulder-dislocates', muscles:['schulter_l','schulter_r'], name:'SHOULDER DISLOCATES', muscle:'Rotatorenmanschette, Deltoid, Pectoralis – Gesamter Schulterbogen',
    goals:['injury','shoulders'],
    desc:'Bandgummi oder Besenstiel schulterbreit greifen. Arme gestreckt über Kopf bis hinter den Rücken führen und zurück. Griffweite progressiv enger. Kein Schmerz!',
    sets:['Sets: <strong>2×10</strong>','Griffbreite: <strong>Progressiv enger</strong>','Frequenz: <strong>Jedes Training (Warm-Up)</strong>'],
    tipLabel:'PFLICHT', tip:'Für jeden Boxer der viel Hände wirft. 2 Minuten vor jedem Training = Schultergesundheit langfristig sichern.',
    boxingConnection:'Boxer haben durch repetitives Schlagen eine extrem protrahierte Schulterposition. Shoulder Dislocates öffnen die vordere Kapsel, dehnen den Pectoralis minor und trainieren die Schulter durch den vollen Bewegungsumfang. Schützt die Rotatorenmanschette vor Impingement – die häufigste Schulterverletzung bei Boxern mit hohem Trainingsvolumen.',
    video:'https://www.youtube.com/results?search_query=shoulder+dislocates+band+mobility+warm+up'},
  { id:'ankle-mobility', muscles:['wade_l','wade_r'], name:'ANKLE DORSIFLEXION', muscle:'Soleus, Achillessehne, Tibialis anterior',
    goals:['footwork','injury'],
    desc:'Fuß an Wand, Knie Richtung Wand drücken ohne Ferse zu heben. Messen: wie viele cm Abstand Zehen-Wand? Ziel: >12cm. Banded Variante: Band um Sprunggelenk nach hinten für Gelenkkapsel-Mobilisation.',
    sets:['Sets: <strong>3×30 Sek. je Seite</strong>','Banded: <strong>2×15 je Seite</strong>','Test: <strong>>12cm = gut</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Eingeschränkte Dorsalflexion = Boxer kann nicht tief genug abtauchen (Ducking/Weaving). Auch limitierend für Squat-Tiefe im Krafttraining.',
    boxingConnection:'Ankle Dorsiflexion bestimmt, wie tief ein Boxer beim Ducken/Weaving gehen kann, ohne auf die Zehenspitzen zu kommen (= instabil). Eingeschränkte Dorsalflexion kompensiert durch Vorfuß-Dominanz: weniger stabile Basis, langsamere Richtungswechsel. >12cm im Wall Test ist das Minimum für Boxer. <10cm = aktiv mobilisieren.',
    video:'https://www.youtube.com/results?search_query=ankle+dorsiflexion+mobility+wall+test+banded'}
];

const exercisesPowerEndurance = [
  { id:'heavy-bag-intervals', muscles:['schulter_l','schulter_r','core','quad_l','quad_r'], name:'SANDSACK-INTERVALLE', muscle:'Gesamtkörper – Laktazides Energiesystem',
    goals:['stamina','power','speed'],
    desc:'30 Sek. All-Out Kombinationen am Sandsack → 30 Sek. aktive Erholung (Beinarbeit). 6–10 Runden. Puls muss in der Arbeit auf >85% HFmax. Qualität der Schläge hoch halten!',
    sets:['Work: <strong>30 Sek. All-Out</strong>','Rest: <strong>30 Sek. aktiv</strong>','Runden: <strong>6–10</strong>'],
    tipLabel:'Boxing Science', tip:'Das ist Kraftausdauer – die Fähigkeit, harte Schläge über die gesamte Kampfdauer zu werfen. Die meisten Boxer verlieren Schlagkraft ab Runde 2.',
    boxingConnection:'Boxing Science betont: Der größte Unterschied zwischen Elite- und Amateur-Boxern ist nicht die maximale Schlagkraft, sondern die Fähigkeit, diese über 3+ Runden aufrechtzuerhalten. Sandsack-Intervalle trainieren die laktazide Kapazität – die Fähigkeit, trotz steigendem Laktat weiter explosive Schläge zu werfen. Punch-Output sinkt bei untrainierten Boxern um ca. 40% zwischen Runde 1 und 3 (Praxiswert aus Trainingsbeobachtung).',
    video:'https://www.youtube.com/results?search_query=heavy+bag+interval+training+boxing+conditioning'},
  { id:'barbell-complex', muscles:['quad_l','quad_r','gluteus','schulter_l','schulter_r','core'], name:'BARBELL COMPLEX', muscle:'Gesamtkörper – Kraftausdauer + metabolische Konditionierung',
    goals:['stamina','power','clinch'],
    desc:'6 Übungen, je 6 Reps, OHNE Stange abzulegen: Deadlift → Bent Row → Hang Clean → Front Squat → Push Press → Back Squat. 3–4 Durchgänge, 2 Min. Pause.',
    sets:['Last: <strong>40–50% DL 1RM</strong>','Reps: <strong>6 je Übung</strong>','Sets: <strong>3–4</strong>','Pause: <strong>2 Min.</strong>'],
    tipLabel:'Wann', tip:'1× pro Woche als Finisher oder an einem separaten Konditionierungstag. Nicht vor Sparring einplanen.',
    boxingConnection:'Barbell Complexes trainieren die Fähigkeit, Kraft unter progressiver Ermüdung aufrechtzuerhalten – exakt die Anforderung im Ring. Danny Wilson (Boxing Science) nutzt Complexes als "work capacity"-Tool: Die Stange nicht ablegen zu können simuliert die konstante Belastung ohne echte Pause im Kampf. Metabolischer Stress bei submaximaler Last = Kraftausdauer ohne ZNS-Überbelastung.',
    video:'https://www.youtube.com/results?search_query=barbell+complex+conditioning+workout'},
  { id:'battle-ropes', muscles:['schulter_l','schulter_r','core','bizeps_l','bizeps_r'], name:'BATTLE ROPES', muscle:'Schultern, Core, Arme – Schnellkraftausdauer oberer Körper',
    goals:['stamina','shoulders','speed'],
    desc:'Alternating Waves: 20 Sek. All-Out, 40 Sek. Pause × 8 Runden. Variationen: Slams (Power), Circles (Schulter-Ausdauer), Alternating (Geschwindigkeit). Hüfte tief, Schultern arbeiten!',
    sets:['Work: <strong>20 Sek.</strong>','Rest: <strong>40 Sek.</strong>','Runden: <strong>8</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Trainiert Schulter-Ausdauer bei Schlaggeschwindigkeit. Wenn die Schultern in Runde 3 brennen, sinkt die Guard – Battle Ropes verhindern das.',
    boxingConnection:'Die Schultermuskulatur ist der häufigste Ermüdungsort bei Boxern – wenn die Schultern "zumachen", sinkt sowohl Schlagkraft als auch Guard-Höhe. Battle Ropes trainieren die Schulter-Ausdauer bei boxähnlicher Arm-Frequenz. Phil Daru nutzt 20/40-Intervalle als Standard-Protokoll für Kampfsportler: kurze All-Out-Phasen mit aktiver Erholung imitieren die Kampf-Dynamik.',
    video:'https://www.youtube.com/results?search_query=battle+ropes+workout+boxing+conditioning'},
  { id:'sled-push', muscles:['quad_l','quad_r','gluteus','wade_l','wade_r','core'], name:'SLED PUSH/PULL', muscle:'Gesamte untere Kette + Core – Konzentrisch dominant',
    goals:['power','stamina','footwork'],
    desc:'Schlitten beladen, 20–30m schieben (tiefer Winkel, Arme gestreckt), dann 20–30m am Seil zurückziehen. 4–6 Durchgänge. Keine exzentrische Phase = kaum Muskelkater, sofortige Recovery.',
    sets:['Distanz: <strong>20–30m</strong>','Sets: <strong>4–6</strong>','Pause: <strong>60–90 Sek.</strong>'],
    tipLabel:'Vorteil', tip:'Rein konzentrisch = kein Muskelkater. Kann 24h vor Sparring gemacht werden. Perfekt für In-Season Konditionierung.',
    boxingConnection:'Sled Pushes sind rein konzentrisch – keine exzentrische Phase bedeutet minimaler Muskelschaden und schnelle Recovery. Boxing Science nutzt den Schlitten als primäres Konditionierungs-Tool während der Wettkampfphase, wenn traditionelle Methoden zu viel Erholung kosten. Die tiefe Push-Position imitiert den Angriffswinkel beim Eindringen in die Distanz, und die fehlende Exzentrik erlaubt Training am Tag vor dem Sparring.',
    video:'https://www.youtube.com/results?search_query=sled+push+pull+conditioning+workout'}
];

const exercisesSpecial = [
  { id:'bfr', muscles:['bizeps_l','bizeps_r','schulter_l','schulter_r'], name:'BFR TRAINING', muscle:'Variabel – angepasst an Übung mit Okklusionsmanschetten',
    goals:['power','jab'],
    desc:'Manschetten am Oberarm, 40–50% Okklusion, 20–30% 1RM. Protokoll: 30-15-15-15 Reps mit 30 Sek. Pause. Erzeugt Hypertrophie bei minimaler mechanischer Last.',
    sets:['Schema: <strong>30/15/15/15</strong>','Last: <strong>20–30% 1RM</strong>','Okklusion: <strong>40–50%</strong>'],
    tipLabel:'Evidenz', tip:'Amani-Shalamzari et al. (2025): Jab +18%, Cross +21% nach 8 Wo. (n=30, einzelne Studie). Ideal in Schaerfungsphase.',
    boxingConnection:'BFR erzeugt lokale metabolische Erschoepfung und Wachstumshormon-Ausschuettung bei nur 20-30% 1RM – kein Muskelschaden, minimale ZNS-Belastung. Amani-Shalamzari et al. (2025, n=30 Elite-Boxer) zeigten nach 8 Wochen: Jab-Kraft +18%, Cross-Kraft +21%. Hinweis: Einzelstudie, weitere Replikation noetig. Perfekt fuer die Schaerfungsphase vor Wettkampf.',
    video:'https://www.youtube.com/results?search_query=blood+flow+restriction+BFR+training+arms+guide'},
  { id:'imt', muscles:['core'], name:'IMT POWERBREATHE', muscle:'Diaphragma, Interkostalmuskulatur',
    goals:['stamina'],
    desc:'PowerBreathe Gerät, 30 Atemzüge gegen Widerstand. 2× täglich (morgens + Mittag). Progressiv: Widerstand alle 2 Wochen erhöhen wenn 30 Atemzüge sauber machbar.',
    sets:['Atemzüge: <strong>2×30 täglich</strong>','Dauer: <strong>~5 Min.</strong>','Equipment: <strong>~70€</strong>'],
    tipLabel:'Warum', tip:'Boxer haben nachweislich schwache Atemmuskulatur. IMT verhindert den Respiratory Metaboreflex in späten Runden.',
    boxingConnection:'Boxer haben nachweislich schwächere Atemmuskulatur als untrainierte Kontrollgruppen (Mazic, 2015) – paradox für eine Ausdauersportart. Bei Erschöpfung der Atemmuskulatur tritt der Metaboreflex ein: Blutgefäße in Armen und Beinen verengen sich, weniger O₂ für Schläge und Beinarbeit. IMT steigert die MVV um +28.6% in 6 Wochen und verschiebt den Metaboreflex-Schwellenwert in späte Runden.',
    video:'https://www.youtube.com/results?search_query=inspiratory+muscle+training+powerbreathe+technique'},
  { id:'shadow-boxing', muscles:['schulter_l','schulter_r','core','quad_l','quad_r'], name:'SHADOW BOXING MIT VISUALISIERUNG', muscle:'Gesamtkoordination + Neurale Bahnung',
    goals:['shoulders','speed','jab'],
    desc:'5–10 Min. Schattenboxen vor dem Spiegel oder freistehend. Spezifische Kombis gegen imaginierten Gegner. In echtem Tempo, mit Fussarbeit und Deckung.',
    sets:['Dauer: <strong>5–10 Min.</strong>','Frequenz: <strong>Täglich</strong>','Kein Equipment'],
    tipLabel:'Wissenschaft', tip:'Visualisierung aktiviert dieselben motorischen Cortex-Areale wie echte Bewegung (MRT-belegt).',
    boxingConnection:'fMRT-Studien belegen: Visualisierung aktiviert dieselben motorischen Cortex-Areale wie echte Bewegung mit ~70% der neuronalen Aktivierung. Schattenboxen mit Visualisierung trainiert die neurale Bahnung von Kombinationen ohne mechanische Belastung. Besonders effektiv in Erste-Person-Perspektive mit emotionaler Beteiligung – die Qualität der Vorstellung bestimmt den Trainingseffekt (Wakefield & Smith, 2012).',
    video:'https://www.youtube.com/results?search_query=shadow+boxing+technique+visualization+training'}
];

const allExercises = [...exercisesKraft, ...exercisesAusdauer, ...exercisesArmor, ...exercisesHands, ...exercisesMobility, ...exercisesPowerEndurance, ...exercisesSpecial];
function getExerciseById(id) { return allExercises.find(function(e) { return e.id === id; }) || null; }
const exerciseColors = {};
exercisesKraft.forEach(e => exerciseColors[e.id] = 'var(--blue)');
exercisesAusdauer.forEach(e => exerciseColors[e.id] = 'var(--green)');
exercisesArmor.forEach(e => exerciseColors[e.id] = 'var(--red)');
exercisesHands.forEach(e => exerciseColors[e.id] = '#ef5350');
exercisesMobility.forEach(e => exerciseColors[e.id] = '#26c6da');
exercisesPowerEndurance.forEach(e => exerciseColors[e.id] = '#ff7043');
exercisesSpecial.forEach(e => exerciseColors[e.id] = 'var(--gold)');

function openExerciseDetail(id) {
  const e = allExercises.find(ex => ex.id === id);
  if (!e) return;
  const color = exerciseColors[id] || 'var(--white)';
  const el = document.getElementById('page-uebung-detail');

  const muscleLabels = {
    nacken:'Nacken', schulter_l:'Schulter', schulter_r:'Schulter', brust:'Brust',
    bizeps_l:'Bizeps', bizeps_r:'Bizeps', unterarm_l:'Unterarm', unterarm_r:'Unterarm',
    core:'Core', obliques_l:'Obliques', obliques_r:'Obliques',
    gluteus:'Gluteus', quad_l:'Quadrizeps', quad_r:'Quadrizeps',
    wade_l:'Wade', wade_r:'Wade', kopf:'Kopf'
  };

  el.innerHTML = `
  <div style="margin-bottom:24px;">
    <button class="back-link" onclick="showPage('uebungen')">← Zurück zu Übungen</button>
  </div>

  <div class="ex-detail-page">
    <div class="ex-detail-left">
      <div class="ex-detail-title" style="color:${color};">${e.name}</div>
      <div class="ex-detail-subtitle">${e.muscle}</div>

      <div class="ex-detail-section">
        <div class="ex-detail-section-title" style="color:${color};">AUSFÜHRUNG</div>
        <div class="ex-detail-text">${e.desc}</div>
      </div>

      <div class="ex-detail-section">
        <div class="ex-detail-section-title" style="color:${color};">BELASTUNG</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${e.sets.map(s => '<span class="ex-s" style="font-size:12px;">'+s+'</span>').join('')}
        </div>
      </div>

      <div class="ex-detail-section">
        <div class="ex-detail-section-title" style="color:${color};">${e.tipLabel.toUpperCase()}</div>
        <div class="ex-detail-text">${e.tip}</div>
      </div>

      ${e.boxingConnection ? `<div class="ex-detail-section">
        <div class="ex-detail-section-title" style="color:${color};">BOXING-VERBINDUNG</div>
        <div class="ex-detail-text">${e.boxingConnection}</div>
      </div>` : ''}

      ${e.video ? `<div class="ex-detail-section">
        <div class="ex-detail-section-title" style="color:${color};">AUSFÜHRUNGS-VIDEO</div>
        <a href="${e.video}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:var(--surface-2);border:1px solid #333;border-radius:6px;color:var(--white);text-decoration:none;font-size:13px;transition:all .2s;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10 8l6 4-6 4V8z" fill="${color}"/><rect x="2" y="4" width="20" height="16" rx="3" stroke="${color}" stroke-width="1.5" fill="none"/></svg>
          Video-Anleitung auf YouTube
        </a>
      </div>` : ''}
    </div>

    <div class="ex-detail-right">
      ${(() => {
        const remoteUrl = exerciseImgUrl(e.id, 0);
        const localUrl = exerciseImgLocal(e.id);
        if (remoteUrl) {
          // Remote: Start + Ende Paar
          return `<div class="ex-detail-photos">
            <div class="ex-photo-label">AUSFÜHRUNG</div>
            <div class="ex-photo-pair">
              <div class="ex-photo-frame">
                <img src="${exerciseImgUrl(e.id, 0)}" alt="${e.name} Start" loading="lazy" onerror="this.closest('.ex-detail-photos').remove()"/>
                <div class="ex-photo-caption">START</div>
              </div>
              <div class="ex-photo-frame">
                <img src="${exerciseImgUrl(e.id, 1)}" alt="${e.name} Ende" loading="lazy" onerror="this.closest('.ex-photo-frame').remove()"/>
                <div class="ex-photo-caption">ENDE</div>
              </div>
            </div>
          </div>`;
        }
        // Lokal: einzelnes Bild
        return `<div class="ex-detail-photos">
          <div class="ex-photo-label">AUSFÜHRUNG</div>
          <div class="ex-photo-pair" style="grid-template-columns:1fr;">
            <div class="ex-photo-frame">
              <img src="${localUrl}" alt="${e.name}" loading="lazy" onerror="this.closest('.ex-detail-photos').remove()"/>
            </div>
          </div>
        </div>`;
      })()}
      <div class="muscle-label">BEANSPRUCHTE MUSKULATUR</div>
      ${muscleSvg(e.muscles || [], color)}
      <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px;">
        ${(e.muscles || []).map(m => muscleLabels[m] || m).filter((v,i,a) => a.indexOf(v) === i).map(label =>
          '<span class="muscle-tag" style="background:'+color+'15;color:'+color+';">'+label+'</span>'
        ).join('')}
      </div>
    </div>
  </div>`;

  showPage('uebung-detail');
}

// ===== ERNÄHRUNG =====
function renderErnaehrungPage() {
  const el = document.getElementById('page-ernaehrung');
  const userW = typeof getUserSchedule === 'function' ? getUserSchedule().weight : 75;
  el.innerHTML = `
  <div class="page-header">
    <div class="page-title">ERNÄHR<span>UNG</span></div>
    <div class="page-sub">Dein kompletter Ernährungsguide. Ein Boxer braucht keine andere Quelle als diese Seite. Alles von Grundlagen über Einkaufsliste bis Kampftag – wissenschaftlich basiert, praxiserprobt.</div>
  </div>

  <!-- Sections below auto-wrapped by applyPD() into collapsible blocks -->

  <div class="info-box info-sci" style="margin-bottom:30px;"><span>i</span><div><strong>Warum Ernährung über Sieg entscheidet:</strong> Training zerstört Muskelgewebe – Ernährung baut es wieder auf. Ohne ausreichend Protein, Kohlenhydrate und Mikronährstoffe ist jede Trainingseinheit verschwendet. Ein gut ernährter Boxer regeneriert 30–40% schneller, schlägt in Runde 3 noch mit voller Kraft und wird seltener krank.</div></div>

  <!-- ============ GRUNDLAGEN ============ -->
  <div id="ern-s1" style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:var(--white);margin:0 0 20px;border-bottom:2px solid var(--red);padding-bottom:8px;">1. GRUNDLAGEN <span style="color:var(--red);">– WAS DU WISSEN MUSST</span></div>

  <div class="card card-top" style="--ca:var(--red);margin-bottom:20px;">
    <div class="card-title">DIE 3 GRUNDREGELN</div>
    <div class="card-body" style="font-size:15px;line-height:1.8;">
      <strong style="color:var(--red);">1. Kalorien bestimmen ob du zu- oder abnimmst.</strong><br>
      Isst du mehr als du verbrauchst → Gewichtszunahme. Weniger → Abnahme. Gleich viel → Gewicht bleibt. Egal wie "gesund" du isst – die Energiebilanz entscheidet.<br><br>
      <strong style="color:var(--red);">2. Makros bestimmen WORAUS du zu- oder abnimmst.</strong><br>
      Genug Protein → Muskeln wachsen/bleiben. Zu wenig Protein → Muskeln werden abgebaut, egal wie hart du trainierst. Kohlenhydrate → Energie für Training. Fett → Hormone, Gelenke, Absorption.<br><br>
      <strong style="color:var(--red);">3. Timing bestimmt die Leistung.</strong><br>
      Die richtigen Nährstoffe zum richtigen Zeitpunkt → maximale Trainingsleistung und optimale Recovery. Falsch getimed → Energieloch im Training, schlechte Regeneration.
    </div>
  </div>

  <div class="card card-top" style="--ca:var(--blue);margin-bottom:30px;">
    <div class="card-title">KALORIENBEDARF EINES BOXERS</div>
    <div class="card-body" style="line-height:1.8;">
      Ein Boxer der 6–10 Stunden/Woche trainiert verbrennt deutlich mehr als ein normaler Sportler. Grobe Richtwerte:<br><br>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <table class="data-table" style="margin:10px 0;">
        <thead><tr><th>Gewicht</th><th>Aufbau</th><th>Halten</th><th>Cutten</th></tr></thead>
        <tbody>
          <tr><td>60 kg</td><td>2600–2900 kcal</td><td>2300–2600 kcal</td><td>1900–2200 kcal</td></tr>
          <tr><td>70 kg</td><td>2900–3300 kcal</td><td>2600–2900 kcal</td><td>2200–2500 kcal</td></tr>
          <tr><td>80 kg</td><td>3200–3600 kcal</td><td>2900–3200 kcal</td><td>2400–2800 kcal</td></tr>
          <tr><td>90 kg</td><td>3500–3900 kcal</td><td>3200–3500 kcal</td><td>2700–3100 kcal</td></tr>
        </tbody>
      </table>
      </div>
      <div style="font-size:11px;color:#666;">Das sind Richtwerte. Nutze den Makro-Rechner unten für deine persönlichen Werte. Dein Beruf (sitzend vs. körperlich) macht 300–600 kcal Unterschied pro Tag.</div>
    </div>
  </div>

  <!-- ============ MAKRONÄHRSTOFFE ============ -->
  <div id="ern-s2" style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:var(--white);margin:0 0 20px;border-bottom:2px solid var(--blue);padding-bottom:8px;">2. MAKRONÄHRSTOFFE <span style="color:var(--blue);">IM DETAIL</span></div>

  <div class="card card-top" style="--ca:var(--blue);margin-bottom:16px;">
    <div class="card-title">PROTEIN – DER BAUSTOFF</div>
    <div class="card-body" style="line-height:1.8;">
      <strong>Wie viel?</strong><br>
      Die Wissenschaft zeigt einen optimalen Bereich von 2.0–2.4g/kg – wir empfehlen als klaren Richtwert:<br>
      <strong style="color:var(--blue);">2.2g pro kg Körpergewicht pro Tag.</strong> Bei ${userW}kg = ${Math.round(userW*2.2)}g Protein/Tag.<br>
      Beim Cutten: <strong>2.6g/kg</strong> (bei ${userW}kg = ${Math.round(userW*2.6)}g) um Muskelverlust zu verhindern.<br><br>

      <strong>Warum so viel?</strong><br>
      Boxtraining ist extrem katabol – Sparring, Sandsackarbeit und Krafttraining verursachen massive Gewebeschäden. Dein Körper braucht Aminosäuren (aus Protein) um alles zu reparieren. Zu wenig Protein = dein Körper baut Muskeln ab statt auf.<br><br>

      <strong>Wie verteilen?</strong><br>
      4–5 Mahlzeiten mit je <strong>30–50g Protein</strong>. Jede Mahlzeit muss mindestens ${tt('2.5g Leucin','Leucin ist die Aminosäure die den "Schalter" für Muskelaufbau umlegt. Unter 2.5g pro Mahlzeit wird die Muskelproteinsynthese nicht maximal angeregt. Enthalten in: 25g Whey (2.5g), 3 Eier (1.3g), 100g Hähnchen (2.4g), 200g Skyr (1.6g).')} enthalten – darunter wird die Muskelproteinsynthese nicht maximal angeregt.<br><br>

      <strong style="color:var(--blue);">Beste Proteinquellen (sortiert nach biologischer Wertigkeit):</strong><br>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <table class="data-table" style="margin:10px 0;">
        <thead><tr><th>Lebensmittel</th><th>Protein/100g</th><th>Leucin</th><th>Anmerkung</th></tr></thead>
        <tbody>
          <tr><td>Whey Isolat</td><td>90g (pro 100g Pulver)</td><td>~2.5g/25g</td><td>Schnellste Absorption, ideal post-Training</td></tr>
          <tr><td>Hähnchenbrust</td><td>31g</td><td>2.4g</td><td>Mager, vielseitig, Meal-Prep-König</td></tr>
          <tr><td>Rinderhüftsteak</td><td>28g</td><td>2.2g</td><td>+ Kreatin, Eisen, Zink</td></tr>
          <tr><td>Lachs</td><td>25g</td><td>1.8g</td><td>+ Omega-3 für Entzündung/Recovery</td></tr>
          <tr><td>Eier (3 Stück)</td><td>19g (gesamt)</td><td>1.3g</td><td>Komplett-Paket, Cholesterin unbedenklich</td></tr>
          <tr><td>Skyr (200g)</td><td>22g</td><td>1.6g</td><td>Casein-basiert, langsam, ideal abends</td></tr>
          <tr><td>Thunfisch (Dose)</td><td>26g</td><td>2.0g</td><td>Max 2 Dosen/Woche (Quecksilber)</td></tr>
          <tr><td>Hüttenkäse (200g)</td><td>24g</td><td>1.8g</td><td>Casein + Whey Mix, perfekter Snack</td></tr>
          <tr><td>Linsen (gekocht)</td><td>9g</td><td>0.6g</td><td>Pflanzlich – mit Reis kombinieren</td></tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>

  <div class="card card-top" style="--ca:var(--green);margin-bottom:16px;">
    <div class="card-title">KOHLENHYDRATE – DER TREIBSTOFF</div>
    <div class="card-body" style="line-height:1.8;">
      <strong>Wie viel?</strong><br>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <table class="data-table" style="margin:10px 0;">
        <thead><tr><th>Phase</th><th>g/kg/Tag</th><th>Bei ${userW}kg</th><th>Warum</th></tr></thead>
        <tbody>
          <tr><td>Aufbau</td><td>6–8g/kg</td><td>${Math.round(userW*6)}–${Math.round(userW*8)}g</td><td>Maximale Glykogen-Speicher, optimale Recovery</td></tr>
          <tr><td>Wettkampfphase</td><td>5–7g/kg</td><td>${Math.round(userW*5)}–${Math.round(userW*7)}g</td><td>Volle Energie für intensives Training</td></tr>
          <tr><td>Halten</td><td>4–6g/kg</td><td>${Math.round(userW*4)}–${Math.round(userW*6)}g</td><td>Genug für Training, nicht für Zunahme</td></tr>
          <tr><td>Cutten</td><td>2.5–4g/kg</td><td>${Math.round(userW*2.5)}–${Math.round(userW*4)}g</td><td>Minimum für Leistungserhalt</td></tr>
        </tbody>
      </table>
      </div>

      <strong>Warum brauchen Boxer so viele Kohlenhydrate?</strong><br>
      Boxtraining ist zu <strong>~70% glykogenbasiert</strong>. Leere Glykogenspeicher = müde Beine, schwache Schläge, langsame Reaktion. Kohlenhydrate sind KEIN Feind – sie sind dein Benzin. Low-Carb-Diäten und Boxen sind nicht kompatibel.<br><br>

      <strong style="color:var(--green);">Schnelle KH (vor/nach Training):</strong><br>
      Hoher glykämischer Index → schnelle Absorption → schnelle Energie / schnelle Glykogen-Auffüllung. Quellen findest du in der Einkaufsliste.<br><br>

      <strong style="color:var(--green);">Langsame KH (restlicher Tag):</strong><br>
      Niedriger glykämischer Index → langanhaltende Energie, mehr Ballaststoffe, bessere Sättigung. Quellen ebenfalls in der Einkaufsliste.<br><br>

      <strong>Timing-Regel:</strong> Schnelle KH 1–2h vor und direkt nach Training. Den Rest des Tages langsame KH. Nie nüchtern ins harte Training.
    </div>
  </div>

  <div class="card card-top" style="--ca:var(--gold);margin-bottom:16px;">
    <div class="card-title">FETT – DIE HORMONE</div>
    <div class="card-body" style="line-height:1.8;">
      <strong>Wie viel?</strong><br>
      <strong style="color:var(--gold);">0.8–1.2g pro kg Körpergewicht.</strong> Bei ${userW}kg = ${Math.round(userW*0.8)}–${Math.round(userW*1.2)}g Fett/Tag.<br>
      Minimum 0.5g/kg – darunter sinken Testosteron und andere Hormone.<br><br>

      <strong>Warum wichtig?</strong><br>
      Fett ist essentiell für: Testosteron-Produktion (Kraft + Recovery), Gelenkschmierung (weniger Verletzungen), Absorption von Vitamin A/D/E/K, Gehirnfunktion (Reaktion + Entscheidungen im Ring).<br><br>

      <strong style="color:var(--gold);">Fettquellen nach Typ:</strong><br>
      • <strong>Omega-3 (Priorität!):</strong> Anti-entzündlich, beschleunigt Recovery, neuroprotektiv. Quellen in der Einkaufsliste.<br>
      • <strong>Einfach ungesättigt:</strong> Herzgesundheit, Grundlage für Hormonproduktion.<br>
      • <strong>Gesättigt (moderat):</strong> Testosteron-Produktion, nicht eliminieren.<br>
      • <strong style="color:var(--red);">MEIDEN:</strong> Transfette (Frittiertes, Fast Food, Margarine) → entzündungsfördernd, leistungsmindernd.<br><br>

      <strong>Timing-Regel:</strong> Fett NICHT direkt vor dem Training (verlangsamt Magenentleerung). Fett zu den Mahlzeiten 3+ Stunden vor Training oder danach.
    </div>
  </div>

  <!-- ============ MIKRONÄHRSTOFFE ============ -->
  <div id="ern-s3" style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:var(--white);margin:30px 0 20px;border-bottom:2px solid var(--gold);padding-bottom:8px;">3. MIKRONÄHRSTOFFE <span style="color:var(--gold);">& HYDRATION</span></div>

  <div class="info-box info-warn" style="margin-bottom:20px;"><span>!</span><div><strong>70% aller Sportler haben mindestens einen Mikronährstoff-Mangel</strong> – meist Vitamin D, Magnesium oder Eisen. Ein Mangel in einem einzigen Mikronährstoff kann Recovery um 20–30% verlangsamen, ohne dass du den Grund erkennst. Blutbild 1–2× pro Jahr machen lassen!</div></div>

  <div class="grid-2" style="margin-bottom:30px;">
    <div class="card card-top" style="--ca:var(--gold);margin-bottom:12px;">
      <div class="card-title">KRITISCHE MIKRONÄHRSTOFFE FÜR BOXER</div>
      <div class="card-body" style="line-height:1.8;">
        <strong style="color:#ff5252;">Eisen</strong> – Sauerstofftransport<br>
        Mangel = schnellere Ermüdung, Atemnot, schlechte Ausdauer. Besonders bei Boxern die viel schwitzen.<br>
        <strong>Quellen:</strong> Rotes Fleisch (beste Absorption), Spinat + Vitamin C, Linsen, dunkle Schokolade.<br>
        <strong>Ziel:</strong> Ferritin >50 µg/L (Blutbild!).<br><br>

        <strong style="color:#ffd740;">Vitamin D</strong> – Knochen, Immunsystem, Testosteron<br>
        70% der Deutschen sind mangelhaft, besonders im Winter. Direkt korreliert mit Knochendichte (Frakturen!), Immunfunktion und Testosteronspiegel.<br>
        <strong>Quellen:</strong> Sonnenlicht (20 Min./Tag), fetter Fisch, Eier.<br>
        <strong>Supplementierung:</strong> 2000–4000 IE/Tag im Winter (mit Vitamin K2 kombinieren).<br><br>

        <strong style="color:#69f0ae;">Magnesium</strong> – Muskelfunktion, Schlaf, Recovery<br>
        Wird über Schweiß massiv ausgeschieden. Mangel = Muskelkrämpfe, schlechter Schlaf, langsamere Recovery.<br>
        <strong>Quellen:</strong> Kürbiskerne, dunkle Schokolade, Mandeln, Spinat, Bananen.<br>
        <strong>Supplementierung:</strong> 300–400mg Magnesium-Glycinat abends (verbessert Schlafqualität).<br><br>

        <strong style="color:#42a5f5;">Zink</strong> – Testosteron, Immunsystem, Wundheilung<br>
        Geht durch Schweiß verloren. Essentiell für Testosteron und Immunabwehr.<br>
        <strong>Quellen:</strong> Austern, Rindfleisch, Kürbiskerne, Cashewnüsse.<br>
        <strong>Supplementierung:</strong> 15–25mg/Tag falls Blutbild niedrig.<br><br>

        <strong style="color:#ce93d8;">Omega-3</strong> – Entzündungshemmung, Gehirn, Gelenke<br>
        Boxer haben durch repetitives Training chronisch erhöhte Entzündungswerte. Omega-3 ist der stärkste natürliche Entzündungshemmer.<br>
        <strong>Quellen:</strong> Fetter Fisch 2–3×/Woche ODER 2–3g EPA/DHA Supplement.<br>
        <strong>Boxing-Relevanz:</strong> Auch neuroprotektiv – schützt das Gehirn bei Kopftreffern.
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--green);margin-bottom:12px;">
      <div class="card-title">ELEKTROLYTE – DAS UNTERSCHÄTZTE THEMA</div>
      <div class="card-body" style="line-height:1.8;">
        Boxer verlieren pro Stunde Training <strong>1–2.5 Liter Schweiß</strong> mit Natrium, Kalium, Magnesium und Chlorid. Ohne Ersatz: Krämpfe, Schwäche, Schwindel.<br><br>

        <strong>Natrium (Salz)</strong><br>
        Der wichtigste Elektrolyt. Boxer brauchen MEHR Salz als Nicht-Sportler, nicht weniger. 1 Std. Training = ~1g Natrium verloren.<br>
        <strong>Lösung:</strong> Essen normal salzen. Bei >90 Min. Training: Elektrolyt-Drink mit ~500mg Natrium/L.<br><br>

        <strong>Kalium</strong><br>
        Muskelkontraktion + Nervensignale. Mangel = Krämpfe und Herzrhythmusstörungen.<br>
        <strong>Quellen:</strong> Bananen (422mg), Kartoffeln (897mg!), Avocado (485mg), Spinat (558mg).<br><br>

        <strong>Selbstgemachter Elektrolyt-Drink:</strong><br>
        1L Wasser + 1/4 TL Salz + Saft einer halben Zitrone + 1 EL Honig. Kostet ~20 Cent, funktioniert besser als teure Sportdrinks.<br><br>

        <strong style="color:var(--green);">Hydration-Regel:</strong><br>
        • Minimum <strong>35–40ml pro kg Körpergewicht</strong> = ${Math.round(userW*0.035*1000)}–${Math.round(userW*0.04*1000)}ml/Tag<br>
        • + 500ml extra pro Trainingsstunde<br>
        • Urin-Check: hellgelb = gut, dunkelgelb = trinken!<br>
        • Morgens nach Aufstehen sofort 500ml trinken
      </div>
    </div>
  </div>

  <!-- ============ EINKAUFSLISTE ============ -->
  <div id="ern-s4" style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:var(--white);margin:30px 0 20px;border-bottom:2px solid var(--green);padding-bottom:8px;">4. EINKAUFSLISTE <span style="color:var(--green);">– WAS IM KÜHLSCHRANK SEIN MUSS</span></div>

  <div class="info-box info-tip" style="margin-bottom:20px;"><span>*</span><div><strong>Grundregel:</strong> Kaufe zu 80% unverarbeitete Lebensmittel. Wenn es keine Zutatenliste hat (Reis, Fleisch, Gemüse, Obst) oder maximal 5 Zutaten – kauf es. 20% darf Convenience sein (Whey, Reiswaffeln, Tiefkühl-Gemüse).</div></div>

  <div class="grid-2" style="margin-bottom:16px;">
    <div class="card card-top" style="--ca:var(--blue);margin-bottom:12px;">
      <div class="card-title">PROTEIN-QUELLEN (Wochenbedarf)</div>
      <div class="card-body" style="line-height:1.8;">
        <strong>MUSS:</strong><br>
        • 1.5–2 kg Hähnchenbrust/Putenbrust<br>
        • 1 Packung Eier (10–12 Stück)<br>
        • 500g Rinderhüftsteak oder Hackfleisch (mager)<br>
        • 1 kg Skyr oder Magerquark<br>
        • 1 Dose Thunfisch (max 2/Woche)<br>
        • 1 Packung Lachs/Forelle (frisch oder TK)<br><br>
        <strong>OPTIONAL:</strong><br>
        • Hüttenkäse<br>
        • Putenschinken (Aufschnitt)<br>
        • Whey-Protein (1 kg hält 3–4 Wochen)<br>
        • Casein-Protein (für abends)
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--green);margin-bottom:12px;">
      <div class="card-title">KOHLENHYDRATE (Wochenbedarf)</div>
      <div class="card-body" style="line-height:1.8;">
        <strong>MUSS:</strong><br>
        • 2 kg Reis (weiß UND Vollkorn)<br>
        • 1 kg Haferflocken<br>
        • 1 kg Kartoffeln oder Süßkartoffeln<br>
        • 1 Bund Bananen (6–8 Stück)<br>
        • 1 Packung Vollkornnudeln<br>
        • 1 Packung Reiswaffeln<br><br>
        <strong>OPTIONAL:</strong><br>
        • Quinoa<br>
        • Bagels (Pre-Training)<br>
        • Honig<br>
        • Datteln (schnelle Energie)<br>
        • Vollkornbrot/Wraps
      </div>
    </div>
  </div>
  <div class="grid-2" style="margin-bottom:30px;">
    <div class="card card-top" style="--ca:var(--gold);margin-bottom:12px;">
      <div class="card-title">FETTE & SNACKS</div>
      <div class="card-body" style="line-height:1.8;">
        <strong>MUSS:</strong><br>
        • 1 Flasche natives Olivenöl<br>
        • 1 Glas Erdnussbutter (ohne Palmöl)<br>
        • 1 Packung Mandeln oder Walnüsse<br>
        • 2 Avocados<br><br>
        <strong>OPTIONAL:</strong><br>
        • Leinsamen (geschrotet)<br>
        • Kürbiskerne (Magnesium + Zink)<br>
        • Dunkle Schokolade >70% (Magnesium, Antioxidantien)
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--red);margin-bottom:12px;">
      <div class="card-title">GEMÜSE & OBST</div>
      <div class="card-body" style="line-height:1.8;">
        <strong>MUSS (Gemüse – JEDEN TAG mindestens 3 Portionen):</strong><br>
        • Brokkoli (Vitamin C, Sulforaphan)<br>
        • Spinat (Eisen, Magnesium, Nitrate)<br>
        • Paprika (Vitamin C Champion – 250% Tagesbedarf/100g)<br>
        • Zwiebeln + Knoblauch (in fast jedem Gericht)<br>
        • Tiefkühl-Gemüsemischung (für Notfall)<br><br>
        <strong>OBST (2–3 Portionen/Tag):</strong><br>
        • Bananen (Kalium, schnelle Energie)<br>
        • Beeren (Antioxidantien, wenig Zucker)<br>
        • Äpfel (Ballaststoffe, Snack)<br>
        • Zitronen (für Wasser + Vitamin C)
      </div>
    </div>
  </div>

  <div class="info-box info-warn" style="margin-bottom:30px;"><span>!</span><div><strong>Was NICHT im Einkaufswagen landen sollte:</strong> Softdrinks, Fruchtsäfte (purer Zucker ohne Ballaststoffe), Tiefkühlpizza, Fertiggerichte mit >10 Zutaten, Energy-Drinks (Koffein ja, aber als Kaffee oder Tablette – nicht mit 30g Zucker). Alkohol: schon 2 Bier nach dem Training reduzieren die Muskelproteinsynthese um 24%.</div></div>

  <!-- ============ TIMING ============ -->
  <div id="ern-s5" style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:var(--white);margin:30px 0 20px;border-bottom:2px solid #ab47bc;padding-bottom:8px;">5. TIMING <span style="color:#ab47bc;">– WANN WAS ESSEN</span></div>

  <div class="grid-2" style="margin-bottom:16px;">
    <div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--white);margin-bottom:20px;">DEIN TAGES-TIMING</div>
      <div id="ern-timeline" class="timeline"></div>
      <div style="font-family:'Space Mono',monospace;font-size:12px;color:#333;margin-top:8px;">Zeiten basieren auf deinem Profil. Ändern unter Einstellungen.</div>
    </div>
    <div>
      <div class="card card-top" style="--ca:var(--red);margin-bottom:12px;">
        <div class="card-title">PRE-TRAINING (1–2h vorher)</div>
        <div class="card-body" style="line-height:1.8;">
          <strong>Ziel:</strong> Glykogenspeicher voll, kein Völlegefühl.<br>
          <strong>Was:</strong> <strong style="color:var(--red);">40–60g schnelle KH + 15–20g Protein, wenig Fett.</strong><br>
          Schnelle KH-Quellen aus der Einkaufsliste nutzen. Fett verlangsamt die Magenentleerung – deshalb hier minimieren.<br><br>
          <strong style="color:var(--red);">NIE nüchtern ins harte Training.</strong> Leere Glykogenspeicher = -15% Leistung und erhöhter Muskelabbau.
        </div>
      </div>
      <div class="card card-top" style="--ca:var(--green);margin-bottom:12px;">
        <div class="card-title">POST-TRAINING (0–60 Min. danach)</div>
        <div class="card-body" style="line-height:1.8;">
          <strong>Ziel:</strong> Muskelreparatur starten, Glykogen auffüllen.<br>
          <strong>Was:</strong> <strong style="color:var(--green);">30–40g schnelles Protein + 40–80g schnelle KH.</strong><br>
          Whey ist hier ideal wegen schnellster Absorption. Schnelle KH-Quelle dazu.<br><br>
          <strong>Das "anabole Fenster" ist real</strong> – Muskelproteinsynthese ist 0–2h nach Training am höchsten. Nicht verpassen.
        </div>
      </div>
      <div class="card card-top" style="--ca:#ab47bc;margin-bottom:12px;">
        <div class="card-title">VOR DEM SCHLAFEN</div>
        <div class="card-body" style="line-height:1.8;">
          <strong>Ziel:</strong> 7–8h Aminosäuren-Versorgung im Schlaf.<br>
          <strong>Was:</strong> <strong style="color:#ab47bc;">30–40g langsames Protein (Casein-basiert).</strong><br>
          Casein wird über 6–8 Stunden absorbiert → konstante Aminosäure-Versorgung während dein Körper im Schlaf repariert. Casein-Quellen findest du in der Einkaufsliste (Milchprodukte).
        </div>
      </div>
    </div>
  </div>

  <div class="card card-top" style="--ca:var(--blue);margin-bottom:30px;">
    <div class="card-title">TIMING-REGELN AUF EINEN BLICK</div>
    <div class="card-body">
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <table class="data-table">
        <thead><tr><th>Zeitpunkt</th><th>Was</th><th>Was NICHT</th></tr></thead>
        <tbody>
          <tr><td>Morgens (Aufstehen)</td><td>500ml Wasser, dann 30–40g Protein + 50–80g KH</td><td>Nüchtern in hartes Training</td></tr>
          <tr><td>1–2h vor Training</td><td>40–60g schnelle KH + 15–20g Protein, wenig Fett</td><td>Fettreiche Mahlzeiten, Ballaststoff-Bomben</td></tr>
          <tr><td>Während Training (>90 Min.)</td><td>Elektrolyt-Drink, ggf. 30g KH/Std.</td><td>Feste Nahrung</td></tr>
          <tr><td>0–60 Min. nach Training</td><td>30–40g schnelles Protein + 40–80g schnelle KH</td><td>Nur Wasser, Mahlzeit auslassen</td></tr>
          <tr><td>Vor dem Schlafen</td><td>30–40g Casein-Protein</td><td>Große Mahlzeit (<2h vor Bett)</td></tr>
          <tr><td>Koffein</td><td>Morgens, max. bis 12:00–13:00</td><td>Nach 14:00 (HWZ 5h → stört Schlaf)</td></tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>

  <!-- ============ MAKRO RECHNER ============ -->
  <div id="ern-s6" style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:var(--white);margin:30px 0 20px;border-bottom:2px solid var(--red);padding-bottom:8px;">6. MAKRO <span style="color:var(--red);">RECHNER</span></div>

  <div class="calc-box" style="margin-bottom:40px;">
    <div class="calc-inputs">
      <div class="calc-group"><label>Körpergewicht (kg)</label><input type="number" id="ern-weight" placeholder="75" value="${userW}" min="40" max="150"></div>
      <div class="calc-group"><label>Phase</label><select id="ern-phase"><option value="aufbau">Aufbauphase</option><option value="wettkampf">Wettkampfphase</option><option value="cutten">Cutten</option><option value="maintain">Halten</option></select></div>
      <div class="calc-group"><label>Trainingsvolumen</label><select id="ern-vol"><option value="mittel">6–10 Std./Wo</option><option value="hoch">10–15 Std./Wo</option><option value="sehr-hoch">15+ Std./Wo</option></select></div>
      <div class="calc-group"><label>Beruf</label><select id="ern-job"><option value="sitz">Sitzend (Büro)</option><option value="steh">Stehend</option><option value="schwer">Körperlich</option></select></div>
    </div>
    <button class="calc-btn" onclick="calcMakrosErn()">MAKROS BERECHNEN</button>
    <div id="ern-results" style="display:none;margin-top:22px;"></div>
    <div id="ern-meals" style="display:none;margin-top:20px;"></div>
  </div>

  <!-- ============ HÄUFIGE FEHLER ============ -->
  <div id="ern-s7" style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:var(--white);margin:30px 0 20px;border-bottom:2px solid #ff7043;padding-bottom:8px;">7. HÄUFIGE FEHLER <span style="color:#ff7043;">– WAS BOXER FALSCH MACHEN</span></div>

  <div class="grid-2" style="margin-bottom:16px;">
    <div class="card card-top" style="--ca:var(--red);margin-bottom:12px;">
      <div class="card-title">FEHLER #1: ZU WENIG ESSEN</div>
      <div class="card-body" style="line-height:1.8;">
        Der häufigste Fehler. Boxer wollen Gewicht halten/verlieren und essen chronisch zu wenig. Resultat:<br>
        • Muskeln werden abgebaut (Körper braucht Energie)<br>
        • Hormonspiegel sinkt (Testosteron, Schilddrüse)<br>
        • Immunsystem wird schwach (ständig krank)<br>
        • Trainingsqualität sinkt (keine Energie = kein Fortschritt)<br><br>
        <strong>Lösung:</strong> Nur im geplanten Cut Kalorien reduzieren (300–500 kcal Defizit). Außerhalb des Cuts: VOLL ESSEN. Training mit halbem Tank = halber Fortschritt.
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--red);margin-bottom:12px;">
      <div class="card-title">FEHLER #2: KOHLENHYDRATE MEIDEN</div>
      <div class="card-body" style="line-height:1.8;">
        "Low Carb" und "Keto" sind für Ausdauersportler bei niedriger Intensität – NICHT für Boxer. Boxtraining ist 70% glykogenbasiert.<br><br>
        <strong>Was passiert bei Low Carb + Boxen:</strong><br>
        • Glykogenspeicher leer nach 20 Min.<br>
        • Schlagkraft sinkt ab Runde 2<br>
        • Reaktionszeit wird langsamer<br>
        • Recovery dauert 2× so lange<br>
        • Cortisol steigt, Testosteron sinkt<br><br>
        <strong>Lösung:</strong> Kohlenhydrate sind dein Treibstoff. Mindestens 4g/kg pro Tag, an harten Trainingstagen 6–8g/kg.
      </div>
    </div>
  </div>
  <div class="grid-2" style="margin-bottom:16px;">
    <div class="card card-top" style="--ca:var(--gold);margin-bottom:12px;">
      <div class="card-title">FEHLER #3: PROTEIN NUR 1–2× AM TAG</div>
      <div class="card-body" style="line-height:1.8;">
        50g Protein zum Abendessen und sonst nichts bringt weniger als 4× 30g über den Tag verteilt.<br><br>
        <strong>Warum?</strong> Die Muskelproteinsynthese (MPS) wird pro Mahlzeit ausgelöst und hält 3–5 Stunden. Danach braucht der Körper wieder Protein. Eine riesige Mahlzeit löst NICHT mehr MPS aus als 40g – der Rest wird als Energie verbrannt.<br><br>
        <strong>Lösung:</strong> 4–5 Mahlzeiten/Snacks mit je 30–50g Protein, gleichmäßig über den Tag. Jede Mahlzeit mindestens 2.5g Leucin.
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--gold);margin-bottom:12px;">
      <div class="card-title">FEHLER #4: DEHYDRATION</div>
      <div class="card-body" style="line-height:1.8;">
        Schon 2% Dehydration = 10–15% Leistungseinbruch. Viele Boxer trinken zu wenig, besonders im Alltag.<br><br>
        <strong>Symptome:</strong> Müdigkeit, Kopfschmerzen, Konzentrationsprobleme, dunkler Urin, Krämpfe, verlangsamte Reaktion.<br><br>
        <strong>Lösung:</strong><br>
        • ${Math.round(userW*0.035*1000)}–${Math.round(userW*0.04*1000)}ml Wasser pro Tag (Minimum)<br>
        • + 500ml pro Trainingsstunde<br>
        • 500ml sofort nach dem Aufstehen<br>
        • Wasserflasche IMMER dabei<br>
        • Urin hellgelb = OK, dunkelgelb = sofort trinken
      </div>
    </div>
  </div>
  <div class="grid-2" style="margin-bottom:30px;">
    <div class="card card-top" style="--ca:#ab47bc;margin-bottom:12px;">
      <div class="card-title">FEHLER #5: ALKOHOL</div>
      <div class="card-body" style="line-height:1.8;">
        <strong>Alkohol ist der #1 Recovery-Killer im Sport.</strong><br><br>
        • 2 Bier nach Training = -24% Muskelproteinsynthese<br>
        • Stört Schlafarchitektur (weniger REM + Tiefschlaf)<br>
        • Dehydriert (Diuretikum)<br>
        • Senkt Testosteron für 24–72h<br>
        • Verlangsamt Glykogen-Resynthese<br><br>
        <strong>Realität:</strong> Kein Alkohol ist ideal. Wenn doch: max 1–2 Drinks, NIE nach dem Training, NIE am Abend vor Training/Sparring. 2+ alkoholfreie Tage pro Woche minimum.
      </div>
    </div>
    <div class="card card-top" style="--ca:#ab47bc;margin-bottom:12px;">
      <div class="card-title">FEHLER #6: SUPPLEMENTS VOR BASICS</div>
      <div class="card-body" style="line-height:1.8;">
        Kein Supplement der Welt kompensiert schlechte Ernährung. Erst wenn Grundlagen stehen:<br><br>
        <strong>Lohnt sich (evidenzbasiert):</strong><br>
        • Kreatin Monohydrat 3–5g/Tag (Kraft, Recovery, Gehirn)<br>
        • Whey/Casein (Convenience, nicht Ersatz)<br>
        • Vitamin D 2000–4000 IE (Winter)<br>
        • Omega-3 2–3g EPA/DHA (falls wenig Fisch)<br>
        • Koffein 3–6mg/kg (Pre-Training)<br><br>
        <strong>Geldverschwendung:</strong><br>
        BCAAs (Whey enthält sie), Testosteron-Booster, "Fat Burner", Glutamin (genug in normaler Ernährung), überteuerte Pre-Workouts (nimm Koffein-Tabletten + Kreatin).<br><br>
        <span style="color:#666;font-size:11px;">Mehr Details auf der Supplements-Seite.</span>
      </div>
    </div>
  </div>

  <!-- ============ KAMPFTAG ============ -->
  <div id="ern-s8" style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:var(--white);margin:30px 0 20px;border-bottom:2px solid var(--red);padding-bottom:8px;">8. KAMPFTAG <span style="color:var(--red);">ERNÄHRUNG</span></div>

  <div class="info-box info-warn" style="margin-bottom:20px;"><span>!</span><div><strong>Amateur-Wiegen = am Kampftag!</strong> Du musst VOR dem Wiegen leicht sein und NACH dem Wiegen schnell Energie tanken. Timing ist alles. KEINE EXPERIMENTE am Kampftag – nur Lebensmittel die du kennst und verträgst.</div></div>

  <div class="card card-top" style="--ca:var(--gold);margin-bottom:16px;">
    <div class="card-title">KAMPFWOCHE – DIE LETZTEN 7 TAGE</div>
    <div class="card-body" style="line-height:1.8;">
      <strong>7–3 Tage vorher:</strong><br>
      • Normal essen, Gewicht überwachen<br>
      • Trainingsvolumen leicht reduzieren (Tapering)<br>
      • Falls Gewicht ok: keine Änderung nötig<br>
      • Falls 1–2 kg drüber: leicht Kohlenhydrate reduzieren (nicht radikal!)<br><br>

      <strong>2 Tage vorher:</strong><br>
      • Ballaststoffarme Ernährung (Weißreis statt Vollkorn, weniger Gemüse) – reduziert Darminhalt um 0.5–1 kg<br>
      • Natrium leicht reduzieren (weniger Salz → weniger Wassereinlagerung)<br>
      • Normal trinken! Nicht dehydrieren!<br><br>

      <strong>Abend vorher:</strong><br>
      • Letzte Mahlzeit 19:00–20:00, leicht verdaulich: 40g Protein + 60g schnelle KH, wenig Ballaststoffe<br>
      • Ab 20:00 nur noch kleine Schlucke Wasser<br>
      • Tasche packen: Mundschutz, Wettkampfpass, Recovery-Essen für danach
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:16px;">
    <div class="card card-top" style="--ca:var(--red)">
      <div class="card-title">KAMPFMORGEN: VOR DEM WIEGEN</div>
      <div class="card-body" style="line-height:1.8;">
        <strong>Aufwachen → Toilette → Gewicht checken:</strong><br>
        • Auf Gewicht? → Entspannen, leicht frühstücken nach dem Wiegen<br>
        • 0.5–1 kg drüber? → Warme Kleidung, 10–15 Min. leichte Bewegung (Seilspringen, Spaziergang)<br>
        • >1.5 kg drüber? → Gefährliche Zone. Leichte Sauna max 20 Min. + Spucken (Notfall)<br><br>

        <strong>Zum Wiegen mitnehmen:</strong><br>
        • Leichteste Kleidung (Unterhose)<br>
        • Wettkampfpass + Sportausweis<br>
        • Recovery-Essen in der Tasche (siehe rechts)<br><br>

        <strong style="color:var(--red);">MAXIMAL 2–3% Körpergewicht über Nacht verlieren. Mehr = Leistung sinkt dramatisch.</strong>
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--green)">
      <div class="card-title">NACH DEM WIEGEN → VOR DEM KAMPF</div>
      <div class="card-body" style="line-height:1.8;">
        <strong>Sofort nach Wiegen (2–4h vor Ring):</strong><br>
        • 0.5L Elektrolyt-Drink (kleine Schlucke, nicht auf einmal!)<br>
        • 40–50g schnelle KH + 15–20g Protein<br>
        • Keine Völlegefühl – leicht verdaulich!<br><br>

        <strong>60–90 Min. vor dem Ring:</strong><br>
        • ~15g schnelle KH (kleiner Snack)<br>
        • Rote-Beete-Shot (NUR falls vorher getestet!)<br>
        • Koffein 3mg/kg (NUR falls gewohnt – ${Math.round(userW*3)}mg)<br>
        • Letzte Schlucke Wasser<br><br>

        <strong>Zwischen Kämpfen (Meisterschaft):</strong><br>
        • Sofort: Elektrolyte + 30–50g schnelle KH<br>
        • 15–20g schnelles Protein<br>
        • Kleine Portionen, nicht vollstopfen<br>
        • Mund ausspülen mit Kohlenhydrat-Lösung (ZNS-Trick: Gehirn registriert Energie → Leistung steigt)
      </div>
    </div>
  </div>

  <div class="card card-top" style="--ca:var(--blue);margin-bottom:30px;">
    <div class="card-title">KAMPFTAG-PACKLISTE ERNÄHRUNG</div>
    <div class="card-body" style="line-height:1.8;">
      Das sollte in deiner Tasche sein:<br><br>
      <strong>Pflicht:</strong><br>
      • 4–6 Reiswaffeln<br>
      • 2–3 Bananen<br>
      • Honig (kleine Tube/Portionspackung)<br>
      • 1L Elektrolyt-Drink (vorgemischt)<br>
      • 1 Portion Whey in Shaker (trocken)<br>
      • 0.5L Wasser extra<br><br>
      <strong>Optional:</strong><br>
      • Datteln oder Energieriegel<br>
      • Rote-Beete-Shot<br>
      • Koffein-Tabletten<br>
      • Kleine Salzpackung (für Elektrolyte)
    </div>
  </div>

  <!-- ============ GEWICHT & KLASSEN ============ -->
  <div id="ern-s9" style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:var(--white);margin:30px 0 20px;border-bottom:2px solid var(--gold);padding-bottom:8px;">9. GEWICHTSKLASSE <span style="color:var(--gold);">RICHTIG WÄHLEN</span></div>

  <div class="card card-top" style="--ca:var(--gold);margin-bottom:16px;">
    <div class="card-title">IN WELCHER KLASSE SOLLTEST DU BOXEN?</div>
    <div class="card-body" style="line-height:1.8;">
      <strong>Grundregel:</strong> Du solltest ganzjährig maximal 3–4% über deiner Kampfgewichtsklasse liegen. Alles darüber = aggressives Cutten nötig = Leistungsverlust.<br><br>

      <strong>Teste dich selbst:</strong><br>
      • Iss 2 Wochen normal (kein Tracking, kein Diäten), trainiere normal<br>
      • Wiege dich jeden Morgen nüchtern<br>
      • Dein Durchschnittgewicht = dein "Walk-Around-Weight"<br>
      • Die nächstliegende Gewichtsklasse unter diesem Wert ist deine Klasse<br><br>

      <strong>Beispiel:</strong> Walk-Around-Weight 78 kg → Klasse 75 kg (Mittelgewicht). Aber NICHT Klasse 69 kg, weil das zu viel Gewichtsverlust wäre.<br><br>

      <strong style="color:var(--red);">Warnsignal "falsche Klasse":</strong><br>
      • Du musst >5 kg cutten für jeden Kampf<br>
      • Du fühlst dich am Kampftag schwach/benommen<br>
      • Du bist ständig hungrig im Training<br>
      • Dein Krafttraining stagniert seit Monaten<br>
      → Dann bist du in der falschen Klasse. Eine Klasse hoch = besser ernährt = bessere Leistung.
    </div>
  </div>

  <div style="margin-top:30px;padding:16px;background:var(--surface-0);border:1px solid var(--surface-2);border-radius:6px;">
    <div style="font-size:12px;color:#444;line-height:1.6;">QUELLEN: ISSN Position Stand – Protein and Exercise (2017) · ACSM Nutrition and Athletic Performance (2016) · Boxing Science Nutrition Guide (Danny Wilson) · Phil Daru Fight Nutrition · Helms et al. 2014 (Protein during weight loss) · Thomas et al. 2016 (ACSM/AND/DC) · Maughan et al. 2018 (IOC Consensus) · Burke et al. 2019 (Carbohydrate for athletes) · Schoenfeld & Aragon 2018 (Protein timing meta-analysis)</div>
  </div>

  <div class="related-links" style="margin-top:32px;padding-top:24px;border-top:1px solid var(--surface-2);display:flex;flex-wrap:wrap;gap:10px;">
    <span style="font-family:'Space Mono',monospace;font-size:11px;color:#444;align-self:center;">SIEHE AUCH:</span>
    <button onclick="showPage('cutten')" style="font-family:'Space Mono',monospace;font-size:12px;color:var(--red);background:none;border:1px solid rgba(232,0,13,.2);border-radius:4px;padding:6px 14px;cursor:pointer;">Gewicht machen</button>
    <button onclick="showPage('supplements')" style="font-family:'Space Mono',monospace;font-size:12px;color:var(--green);background:none;border:1px solid rgba(0,200,83,.2);border-radius:4px;padding:6px 14px;cursor:pointer;">Supplements</button>
    <button onclick="showPage('regeneration')" style="font-family:'Space Mono',monospace;font-size:12px;color:var(--blue);background:none;border:1px solid rgba(41,121,255,.2);border-radius:4px;padding:6px 14px;cursor:pointer;">Recovery</button>
    <button onclick="showPage('rechner')" style="font-family:'Space Mono',monospace;font-size:12px;color:var(--gold);background:none;border:1px solid rgba(245,197,24,.2);border-radius:4px;padding:6px 14px;cursor:pointer;">Rechner</button>
  </div>`;
  renderErnTimeline();
}

// ===== ERNÄHRUNG TIMELINE (personalisiert, tagesspezifisch) =====
function renderErnTimeline() {
  const el = document.getElementById('ern-timeline');
  if (!el) return;
  const s = typeof getUserSchedule === 'function' ? getUserSchedule() : { workStart:'08:00', workEnd:'17:00', trainingTime:'18:00', weekSchedule:null };
  const today = typeof getTodaySchedule === 'function' ? getTodaySchedule() : { time: s.trainingTime, type: 'boxen' };
  const trainingTime = today.time || s.trainingTime || '18:00';
  const isFrei = today.type === 'frei';

  const wakeUp = timeBefore(s.workStart, 1, 30);
  const morningSnack = timeAdd(wakeUp, 0, 5);
  const postMorning = timeAdd(wakeUp, 1, 0);
  const midSnack = timeAdd(s.workStart, 2, 0);
  const lunch = timeAdd(s.workStart, 4, 30);

  const meals = [
    { time: morningSnack, dot:'var(--gold)', title:'Vor-Morgentraining Snack', body:'~25g schnelle KH + ~5g Protein. Schnelle Energie ohne GI-Probleme.' },
    { time: postMorning, dot:'var(--red)', title:'Hauptmahlzeit – wichtigste des Tages', body:'Post-Training innerhalb 30 Min. 40g Protein + 60g KH. ≥2.5g ' + tt('Leucin','Eine Aminosäure die den "Schalter" für Muskelaufbau umlegt. Mindestens 2.5g pro Mahlzeit nötig um maximale Muskelproteinsynthese auszulösen. Enthalten in: Whey (2.5g/25g), Eier (1.3g/3 Stück), Hähnchen (2.4g/100g).') + '.' },
    { time: midSnack, dot:'var(--blue)', title:'Protein-Bolus', body:'25–30g Protein + ~20g KH. Gleichmäßige Verteilung = +18% mehr ' + tt('MPS','Muskelproteinsynthese – der Prozess bei dem dein Körper neues Muskelgewebe aufbaut. Wird durch Protein-Intake + Training ausgelöst. Hält ~3-5 Std. an, daher 4-5 Mahlzeiten.') + ' als ungleichmäßige Verteilung.' },
    { time: lunch, dot:'var(--orange)', title:'Glykogen-Füllung', body: isFrei ? 'Normales Mittagessen. 40g Protein + 50g KH + Gemüse.' : 'Glykogen-Loading 5–6h vor Abendtraining. 40g Protein + 70g KH + Gemüse.' }
  ];

  if (!isFrei) {
    const preTraining = timeBefore(trainingTime, 1, 0);
    const postTraining = timeAdd(trainingTime, 1, 30);
    meals.push({ time: preTraining, dot:'var(--gold)', title:'Pre-Training Snack', body:'40–50g schnelle KH + 15g Protein, wenig Fett.' });
    meals.push({ time: trainingTime, dot:'var(--blue)', title:'Hydration während Training', body:'150–250ml Elektrolyt-Wasser alle 15–20 Min. Bei >90 Min.: 30–60g KH/Std.' });
    meals.push({ time: postTraining, dot:'var(--green)', title:'Recovery-Mahlzeit', body: today.type === 'sparring' ? 'SOFORT nach Sparring: 40g schnelles Protein + 30g schnelle KH. Dann 60 Min. später: vollständige Mahlzeit mit 40g P + 80g KH.' : '30–40g Casein-Protein + ~20g KH. Langsame Aminosäuren für 6–8 Std.' });
  } else {
    const dinnerTime = timeAdd(s.workEnd, 1, 0);
    meals.push({ time: dinnerTime, dot:'var(--green)', title:'Abendessen (kein Training)', body:'30–40g Protein + moderate KH. Kein spezielles Timing nötig.' });
  }

  meals.sort((a,b) => a.time.localeCompare(b.time));

  const typeLabels = { boxen:'Boxtraining', pa:'Partnerarbeit', pratzen:'Pratzen', sparring:'Sparring', technik:'Technik', frei:'Frei', cardio:'Cardio' };
  const dayLabel = typeLabels[today.type] || today.type;

  el.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:12px;color:#555;margin-bottom:12px;">Heute: ' + dayLabel + (today.time ? ' um ' + today.time : '') + '</div>' +
    meals.map(m =>
      '<div class="tl-item"><div class="tl-dot" style="border-color:'+m.dot+'"></div><div class="tl-time">'+m.time+'</div><div class="tl-title">'+m.title+'</div><div class="tl-body">'+m.body+'</div></div>'
    ).join('');
}

// ===== CUTTEN =====
function renderCuttenPage() {
  const el = document.getElementById('page-cutten');
  el.innerHTML = `
  <div class="page-header">
    <div class="page-title">CUTTEN <span>&</span> <span class="gold">GEWICHT</span></div>
    <div class="page-sub">Muskeln erhalten, Leistung erhalten, nachhaltig in Gewichtsklasse kommen.</div>
  </div>

  <div class="info-box info-sci"><span>i</span><div><strong>Wissenschaft:</strong> Max. Fettabnahme ohne Muskelverlust: <strong>0.5–1.0% KG/Woche</strong>. Schneller = Muskelverlust + Leistungseinbruch. Kleines Defizit + hohes Protein = optimal.</div></div>

  <div class="grid-2" style="margin-bottom:32px;">
    <div class="card card-top" style="--ca:var(--red)">
      <div class="card-title">NACHHALTIGES CUTTEN</div>
      <div class="card-body">
        <strong>Kaloriendefizit:</strong> 300–500 kcal/Tag unter ${tt('TDEE','Total Daily Energy Expenditure – dein gesamter täglicher Kalorienverbrauch inklusive Grundumsatz + Arbeit + Training. Nutze den Makro-Rechner auf der Ernährungs-Seite um deinen TDEE zu berechnen.')}. Nicht mehr!<br><br>
        <strong>Protein erhöhen:</strong> 2.6g/kg (schützt Muskel)<br><br>
        <strong>KH reduzieren, nicht eliminieren:</strong> 2.5–4.0g/kg. Unter 2g/kg = Leistungseinbruch<br><br>
        <strong>Fett: min. 0.5g/kg</strong> (Hormone, Gelenke)<br><br>
        <strong>Timing:</strong> Trainingsnahe Mahlzeiten NICHT reduzieren. Sparen bei nicht-trainingsnahen.
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--gold)">
      <div class="card-title">⚠️ AMATEUR = WIEGEN AM KAMPFTAG</div>
      <div class="card-body">
        <strong>Im Amateur-Boxen wird am Kampftag gewogen – NICHT am Vortag!</strong> Du hast keine 24h zur Rehydration wie die Profis. Aggressive Water Cuts sind daher <strong>extrem gefährlich und leistungsvernichtend</strong>.<br><br>
        <strong>Was maximal geht (same-day):</strong><br>
        • 1–1.5 kg über Nacht durch wenig Trinken am Vorabend<br>
        • Morgens leichte Sauna/Bewegung für letzte 0.5 kg<br>
        • Sofort nach Wiegen: Elektrolyte + KH + 0.5–1L Wasser<br><br>
        <strong>Rehydration-Fenster: nur 2–4 Stunden!</strong><br>
        Kleine Schlucke, nicht auf einmal. Banane + Elektrolyt-Drink + Reiswaffeln.<br><br>
        <strong>⚠️ Nie mehr als 2–3% KG in Wasser verlieren am selben Tag.</strong> Mehr = Leistungseinbruch + Verletzungsrisiko.
      </div>
    </div>
  </div>

  <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
  <table class="data-table" style="margin-bottom:24px;">
    <thead><tr><th>Szenario</th><th>Zu reduzieren</th><th>Methode</th><th>Zeitrahmen</th><th>Risiko</th></tr></thead>
    <tbody>
      <tr><td>1–2 kg über Klasse</td><td>Wassergewicht</td><td>Natrium reduzieren, Sauna</td><td>48–72h</td><td style="color:var(--green)">Niedrig</td></tr>
      <tr><td>3–5 kg über Klasse</td><td>Wasser + Fett</td><td>4–6 Wo. moderates Defizit</td><td>4–6 Wochen</td><td style="color:var(--gold)">Moderat</td></tr>
      <tr><td>5–8 kg über Klasse</td><td>Echte Abnahme</td><td>8–12 Wo. strukturiert</td><td>8–12 Wochen</td><td style="color:var(--orange)">Planung nötig</td></tr>
      <tr><td>>8 kg über Klasse</td><td>Klasse wechseln</td><td>Nächsthöhere Klasse</td><td>–</td><td style="color:var(--red)">Leistungsverlust</td></tr>
    </tbody>
  </table>
  </div>

  <div class="section-header"><div class="section-label">Tool</div><div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:var(--white);">WETTKAMPF-PREP <span style="color:var(--gold);">RECHNER</span></div></div>
  <div class="calc-box" style="margin-bottom:24px;">
    <div class="calc-inputs">
      <div class="calc-group"><label>Aktuelles Gewicht (kg)</label><input type="number" id="cut-current" placeholder="82" min="40" max="150" step="0.5"></div>
      <div class="calc-group"><label>Kampfgewicht (kg)</label><input type="number" id="cut-target" placeholder="75" min="40" max="150" step="0.5"></div>
      <div class="calc-group"><label>Wochen bis Kampf</label><input type="number" id="cut-weeks" placeholder="8" min="1" max="52"></div>
    </div>
    <button class="calc-btn" onclick="calcWettkampfPrep()" style="background:var(--gold);color:var(--black);">PLAN BERECHNEN</button>
    <div id="cut-results" style="display:none;margin-top:20px;"></div>
  </div>

  <div class="info-box info-tip"><span>*</span><div><strong>Pro-Tipp:</strong> Halte dich ganzjährig in 3–4% deiner Klasse. Kein aggressives Cutten nötig. Kreatin 4–6 Wo. vor Wiegen pausieren (1–2 kg Wassereinlagerung).</div></div>`;
}

// ===== PERIODISIERUNG =====
function renderPeriodisierungPage() {
  const data = getData();
  let daysUntil = null;
  let currentPhase = null;
  if (data && data.fightDate) {
    daysUntil = Math.ceil((new Date(data.fightDate + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000);
    if (daysUntil <= 0) currentPhase = 'recovery';
    else if (daysUntil <= 2) currentPhase = 'kampftag';
    else if (daysUntil <= 4) currentPhase = 'schaerfen';
    else currentPhase = 'training';
  }

  const el = document.getElementById('page-periodisierung');
  el.innerHTML = `
  <div class="page-header">
    <div class="page-title">PERIODISI<span>ERUNG</span></div>
    <div class="page-sub">Amateur-Boxen = variable Kampfabstände. Kein starrer 4-Wochen-Plan – dein Training passt sich dem nächsten Kampf an.</div>
  </div>

  <div class="info-box info-sci"><span>i</span><div><strong>Amateur vs. Profi:</strong> Profis haben 3-Monats-Camps mit wochenlangem Taper. Im Amateur-Boxen kämpfst du teils jede Woche, alle 2 Wochen, oder 3× am Meisterschafts-Wochenende. Dein System muss <strong>flexibel</strong> sein – kein starrer Zyklus, sondern intelligente Anpassung je nach Kampfabstand.</div></div>

  <div id="peri-s1" style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--white);margin:0 0 16px;border-bottom:2px solid var(--red);padding-bottom:8px;">PHASEN-ZYKLUS</div>
  <div class="phase-cycle">
    <div class="phase-block ${currentPhase==='training'?'current':''}" style="background:#0f1f0a;">
      <div class="phase-week" style="color:var(--green);">4+ TAGE</div>
      <div class="phase-name">NORMALES TRAINING</div>
      <div class="phase-bar" style="background:var(--green);width:90%;"></div>
      <div class="phase-details">Volles Programm<br>S&C: 3× Morgen<br>Sparring: hart<br>Ausdauer: Zone 2 + SIT<br>BET/IMT/Nacken: täglich</div>
    </div>
    <div class="phase-block ${currentPhase==='schaerfen'?'current':''}" style="background:#0a0f1f;">
      <div class="phase-week" style="color:var(--blue);">2–3 TAGE</div>
      <div class="phase-name">SCHÄRFEN</div>
      <div class="phase-bar" style="background:var(--blue);width:60%;"></div>
      <div class="phase-details">Volumen: −30%<br>Intensität: 100%<br>S&C: 1× leicht<br>Sparring: taktisch/leicht<br>Kurze explosive Reize</div>
    </div>
    <div class="phase-block ${currentPhase==='kampftag'?'current':''}" style="background:#1f0000;">
      <div class="phase-week" style="color:var(--red);">1–2 TAGE</div>
      <div class="phase-name">KAMPF-MODUS</div>
      <div class="phase-bar" style="background:var(--red);width:30%;"></div>
      <div class="phase-details">Kein Training<br>Mobility/Stretching<br>Gewicht machen<br>Mental: Visualisierung<br>PAPE Warm-Up am Kampftag</div>
    </div>
    <div class="phase-block ${currentPhase==='recovery'?'current':''}" style="background:#0f1f0a;">
      <div class="phase-week" style="color:var(--green);">NACH KAMPF</div>
      <div class="phase-name">RECOVERY</div>
      <div class="phase-bar" style="background:var(--green);width:40%;"></div>
      <div class="phase-details">24–48h Pause<br>Leichtes Zone 2 Cardio<br>Kältebad/Sauna<br>Extra Protein + Schlaf<br>Dann zurück ins Training</div>
    </div>
  </div>

  <div class="info-box info-tip"><span>*</span><div><strong>Schärfen ≠ Taper:</strong> Profis „tapern" über 1–2 Wochen. Du als Amateur „schärfst" nur 2–3 Tage. Weniger Volumen, gleiche Intensität – kurze explosive Reize halten dein ZNS scharf, ohne dich zu ermüden. Bis 4 Tage vor dem Kampf: normal weiter trainieren!</div></div>

  <div id="peri-s2" style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--white);margin:32px 0 16px;border-bottom:2px solid var(--gold);padding-bottom:8px;">SZENARIEN & WARM-UP</div>
  <div class="grid-2" style="margin-top:16px;">
    <div class="card card-top" style="--ca:var(--red)">
      <div class="card-title">SZENARIEN – SO PLANST DU</div>
      <div class="card-body">
        <strong>Kampf jede Woche:</strong><br>
        Mo–Mi volles Training, Do Schärfen, Fr/Sa Kampf, So Recovery. Kein separater S&C-Tag – integriere Kraft in Boxtraining (Medball-Würfe, Sprünge als Warm-Up).<br><br>
        <strong>Kampf alle 2 Wochen:</strong><br>
        Woche 1: Volles Programm mit S&C 3×, hartem Sparring, voller Ausdauer. Woche 2: Mo–Mi normal, Do Schärfen, Fr/Sa Kampf, So Recovery.<br><br>
        <strong>Kampf einmal im Monat:</strong><br>
        3 Wochen volles Training (progressive Steigerung in S&C). Letzte Woche: Mo–Mi normal, Do Schärfen, Fr/Sa Kampf, So Recovery.<br><br>
        <strong>Meisterschaft (3 Kämpfe / 2 Tage):</strong><br>
        Normale Woche bis Mi. Do Schärfen. Fr/Sa: Zwischen den Kämpfen → leichtes Shadow Boxing, PAPE Warm-Up vor jedem Kampf, Kohlenhydrate + Elektrolyte zwischen den Kämpfen. So: volle Recovery.
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--gold)">
      <div class="card-title">${tt('PAPE','Post-Activation Performance Enhancement – schwere Übung aktiviert dein Nervensystem. Nach 8–12 Min. Pause bist du explosiver als normal. Wie ein Motor der warmgelaufen ist.')} WARM-UP AM KAMPFTAG</div>
      <div class="card-body">
        Post-Activation Performance Enhancement steigert Schlagkraft um <strong>5–8%</strong>.<br><br>
        <strong>Protokoll (45 Min. vor Ring):</strong><br>
        1. 3×3 schwere Box Squats @ 80% 1RM<br>
        2. <strong>8–12 Min. komplett ausruhen</strong> (KRITISCH!)<br>
        3. 3×3 explosive Jump Squats<br>
        4. 3 Min. leichtes Shadow Boxing<br><br>
        Pause zwischen Lift und Ring ist entscheidend – zu kurz = Ermüdung, zu lang = Effekt weg.<br><br>
        <strong>Bei Meisterschaft:</strong> PAPE vor JEDEM Kampf wiederholen. Zwischen den Kämpfen: Kohlenhydrate, Elektrolyte, leicht bewegen.
      </div>
    </div>
  </div>

  <div id="peri-s3" style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--white);margin:32px 0 16px;border-bottom:2px solid var(--red);padding-bottom:8px;">AUFWÄRM-PROTOKOLL</div>
  <div class="card" style="margin-top:16px;">
    <div class="card-title" style="color:var(--red);">KOMPLETTES AUFWÄRM-PROTOKOLL – VOM ANKOMMEN BIS ZUM RING</div>
    <div class="card-body">
      <strong>45–60 Min. vor dem Kampf – starte das Warm-Up:</strong><br><br>
      <strong>Phase 1 – Aktivierung (10 Min.):</strong><br>
      • Leichtes Seilspringen / Joggen auf der Stelle (3 Min.)<br>
      • Dynamisches Dehnen: Armkreise, Hüftöffner, Beinpendel (3 Min.)<br>
      • Schulter-Aktivierung mit Band / Schattenboxen langsam (4 Min.)<br><br>
      <strong>Phase 2 – PAPE (10 Min.):</strong><br>
      • 3×3 schwere Squats oder Isometric Wall Push (6 Sek. × 4)<br>
      • 8–12 Min. KOMPLETT RUHEN – setz dich hin, atme, mental fokussieren<br><br>
      <strong>Phase 3 – Schärfen (10 Min.):</strong><br>
      • 3×3 explosive Jump Squats oder Sprünge<br>
      • Shadow Boxing 2–3 Runden: erst langsam, dann Tempo hochfahren<br>
      • Gameplan-Kombis 10× durchgehen<br><br>
      <strong>Phase 4 – Ring-Ready (5 Min.):</strong><br>
      • Pratzen mit Trainer: 1–2 kurze Runden, nur Lieblingsschläge<br>
      • Box-Breathing: 4-4-4-4, 3 Runden<br>
      • Mundschutz rein, Handschuhe an, Vaseline<br>
      • Letzte Visualisierung: Erste Kombi, Distanz, Rundenstrategie<br><br>
      <strong>⚠️ Häufigste Fehler:</strong> Zu wenig aufgewärmt (kalt in den Ring) ODER zu viel gemacht (schon müde). Finde dein Timing durch Testläufe im Training.
    </div>
  </div>

  <div id="peri-s4" style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--white);margin:32px 0 16px;border-bottom:2px solid var(--blue);padding-bottom:8px;">FORTSCHRITT & STRATEGIE</div>
  <div class="card" style="margin-top:16px;">
    <div class="card-title">FORTSCHRITT TROTZ HÄUFIGER KÄMPFE</div>
    <div class="card-body">
      <strong>Du wirst auch in der Wettkampfphase besser – wenn du es richtig machst:</strong><br><br>
      1. <strong>Ring-Erfahrung:</strong> Jeder Kampf = Hochintensitäts-Training mit echten Konsequenzen – das stärkste Lernen überhaupt.<br>
      2. <strong>Kraft-Erhalt:</strong> S&C an trainingsfreien Morgen, 2–3× pro Woche reicht für Erhalt. Kraft-PRs nur in kampffreien Wochen.<br>
      3. <strong>Taktik:</strong> Kampfvideo-Analyse nach jedem Kampf. Was hat funktioniert? Was nicht? Nächstes Training gezielt anpassen.<br>
      4. <strong>Auxiliary-Training weiterführen:</strong> IMT, Nacken, BET, visuelles Training – verbessert dich OHNE Erholungsbedarf. Täglich möglich.<br>
      5. <strong>Technische Arbeit:</strong> Zwischen den Kämpfen Technik schleifen – frischer Körper = bessere motorische Anpassung.<br><br>
      <strong>Faustregel:</strong> Trainiere so hart wie möglich, so lange der nächste Kampf noch 5+ Tage weg ist. Danach: nur noch schärfen.
    </div>
  </div>

  <div class="card" style="margin-top:24px;">
    <div class="card-title" style="color:var(--gold);">RUNDENSTRATEGIE – 3×3 MIN. AMATEUR</div>
    <div class="card-body">
      <strong>Runde 1 – DOMINANZ SETZEN:</strong><br>
      • Jab sofort etablieren – zeig dass du da bist<br>
      • Distanz kontrollieren, Rhythmus finden<br>
      • 70–80% Energie – nicht alles raushauen<br>
      • Gegner lesen: Ausleger? Infighter? Tempo? Tells?<br>
      • <strong>Ziel:</strong> Runde klar gewinnen, Richter überzeugen<br><br>

      <strong>Runde 2 – ANPASSEN & DRÜCKEN:</strong><br>
      • Was hat funktioniert? Mehr davon. Was nicht? Ablegen<br>
      • Jetzt Kombos: Jab-Cross-Hook, nicht nur Einzelschläge<br>
      • Körpertreffer setzen – die zahlen sich in Runde 3 aus<br>
      • 80–90% Energie, gezielt aggressiv<br>
      • <strong>Bei Rückstand:</strong> Höheres Volumen, Ringmitte erzwingen<br>
      • <strong>Bei Vorsprung:</strong> Sauber weiterboxen, keine Geschenke<br><br>

      <strong>Runde 3 – ALLES GEBEN:</strong><br>
      • Letzter Eindruck zählt doppelt – Richter erinnern Runde 3 am stärksten<br>
      • 100% Energie, nichts aufsparen<br>
      • Saubere Kombinationen > wilde Schwinger<br>
      • Letzte 30 Sek.: nochmal alles mobilisieren<br>
      • <strong>Bei Rückstand:</strong> Du brauchst ein klares Statement. Druck machen, nicht warten<br>
      • <strong>Bei Vorsprung:</strong> Defensiv sauber bleiben, Konter setzen, nicht weglaufen (Richter werten Aktivität!)
    </div>
  </div>

  <div class="info-box info-sci" style="margin-top:24px;"><span>i</span><div><strong>${tt('Supercompensation','Nach einer Trainingsbelastung sinkt deine Leistung kurzzeitig (Ermüdung). In der Erholungsphase steigt sie ÜBER das Ausgangsniveau – das ist der Moment für den nächsten Trainingsreiz.')}:</strong> Dein Körper adaptiert NACH dem Training. Bei häufigen Kämpfen ist die Recovery-Phase kürzer – deshalb ist Schlaf, Ernährung und aktive Regeneration umso wichtiger. ${tt('Detraining','Leistungsverlust durch zu lange Pause. Beginnt nach 5–7 Tagen ohne Reiz. Ausdauer geht schneller verloren als Kraft.')} ist bei häufigen Kämpfen kein Problem – du bekommst ständig neue Reize.</div></div>`;
}

// ===== REGENERATION =====
function renderRegenerationPage() {
  const el = document.getElementById('page-regeneration');
  el.innerHTML = `
  <div class="page-header">
    <div class="page-title">REGENER<span>ATION</span></div>
    <div class="page-sub">Fortschritt entsteht nicht im Training – er entsteht in der Erholung.</div>
  </div>

  <div class="grid-3" style="margin-bottom:32px;">
    <div class="card card-top" style="--ca:var(--green)">
      <div class="card-title">SCHLAF-PROTOKOLL</div>
      <div class="card-body">
        <strong>&lt;8h = 61% mehr Verletzungsrisiko</strong> (KASIP, n=340).<br><br>
        <strong>Abend-Protokoll:</strong><br>
        21:00 Blaublicht-Brille<br>
        21:30 Warme Dusche 42°C, 10 Min. (−36% Einschlaflatenz)<br>
        21:45 Casein + Supps<br>
        22:10 4-7-8 Atemübung (4 Runden)<br>
        22:15 Visualisierung 10 Min.<br>
        22:30 Schlafen (18–19°C, komplett dunkel)<br><br>
        <strong>Ziel:</strong> 8–9 Stunden. Powernap 20 Min. kompensiert teilweise.
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--blue)">
      <div class="card-title">KÄLTE & WÄRME</div>
      <div class="card-body">
        <strong>Cold Water Immersion:</strong><br>
        10–15 Min. bei 10–15°C. 11 Min./Woche Ziel.<br>
        <strong>⚠️ NICHT nach Krafttraining</strong> – dämpft Muskelanpassungen.<br><br>
        <strong>Sauna:</strong><br>
        15–20 Min. post-Training → Plasma-Expansion, GH-Ausschüttung, Hitze-Schock-Proteine.<br><br>
        <strong>Kombi:</strong> Sauna → Cold Plunge → Wärme = max. Effekte.
      </div>
    </div>
    <div class="card card-top" style="--ca:var(--orange)">
      <div class="card-title">MOBILITY & SOFT TISSUE</div>
      <div class="card-body">
        <strong>Post-Training (10–15 Min.):</strong><br>
        Foam Rolling: Quad, Hüftbeuger, T-Spine (60–90 Sek./Region)<br>
        T-Spine Rotation, Schulter-ER mit Band<br><br>
        <strong>Morgen (5–10 Min.):</strong><br>
        Hip 90/90, Thorax-Öffnung, Dead Hang am Türrahmen<br><br>
        <strong>Kompression:</strong> Kompressions-Kleidung während und nach Training.
      </div>
    </div>
  </div>

  <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--white);margin-bottom:20px;">HRV AMPELSYSTEM</div>
  <div class="hrv-grid">
    <div class="hrv-box" style="background:rgba(0,200,83,.06);border:1px solid rgba(0,200,83,.2);">
      <div class="hrv-dot" style="background:var(--green);box-shadow:0 0 20px rgba(0,200,83,.4);"></div>
      <div class="hrv-title" style="color:var(--green);">GRÜN</div>
      <div class="hrv-range">+5% über 7-Tage-Mittel</div>
      <div class="hrv-desc">Volles Training, kann steigern. Perfekt für intensives S&C oder hartes Sparring.</div>
    </div>
    <div class="hrv-box" style="background:rgba(245,197,24,.06);border:1px solid rgba(245,197,24,.2);">
      <div class="hrv-dot" style="background:var(--gold);box-shadow:0 0 20px rgba(245,197,24,.4);"></div>
      <div class="hrv-title" style="color:var(--gold);">GELB</div>
      <div class="hrv-range">±5% um 7-Tage-Mittel</div>
      <div class="hrv-desc">Training wie geplant. Beobachte ob Trend rot oder grün wird.</div>
    </div>
    <div class="hrv-box" style="background:rgba(232,0,13,.06);border:1px solid rgba(232,0,13,.2);">
      <div class="hrv-dot" style="background:var(--red);box-shadow:0 0 20px rgba(232,0,13,.4);"></div>
      <div class="hrv-title" style="color:var(--red);">ROT</div>
      <div class="hrv-range">−5% unter 7-Tage-Mittel</div>
      <div class="hrv-desc">Intensität reduzieren. 3 rote Tage = komplette Ruhe, Ursache suchen.</div>
    </div>
  </div>`;
}

// ===== SUPPLEMENTS =====
const supplementsData = [
  {
    id: 'kreatin', name: 'Kreatin Monohydrat', category: 'PFLICHT',
    dose: '3–5 g/Tag, Post-Training', stars: 5, color: 'var(--green)',
    short: '+12% Peakpower, schnellere PCr-Resynthese zwischen Kombis',
    img: "https://images.pexels.com/photos/33921585/pexels-photo-33921585.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Kreatin ist die am besten erforschte Sportnahrung überhaupt – über 700 Studien mit konsistent positiven Ergebnissen. Es erhöht die Phosphokreatin-Speicher in deinen Muskeln, wodurch dein Körper schneller ATP (= Energie) regenerieren kann. ATP ist der primäre Energieträger für alle Muskelkontraktionen. Jede einzelne Bewegung – jeder Jab, jeder Ausweichschritt – verbraucht ATP. Das Phosphokreatin-System regeneriert ATP innerhalb von Sekunden, aber die Speicher sind begrenzt. Kreatin erweitert diese Speicher um 20–40%, was direkt in mehr explosive Wiederholungen übersetzt wird.',
    boxing: '<strong>Warum gerade für Boxer entscheidend:</strong><br><br>' +
      '• <strong>Mehr Schlagkraft:</strong> +12% Peak Power in explosiven Bewegungen. Dein Cross wird härter.<br>' +
      '• <strong>Schnellere Erholung zwischen Kombis:</strong> PCr-Resynthese ist 15–20% schneller. Du kannst nach einer 5-Schlag-Kombi sofort die nächste setzen, während dein Gegner noch Luft holt.<br>' +
      '• <strong>Runde 3 Dominanz:</strong> Boxen ist PCr-dominant – 6–10 Sekunden explosiv, kurze Pause, wieder explosiv. Genau hier wirkt Kreatin am stärksten.<br>' +
      '• <strong>Neuroprotektiv:</strong> Neue Studien zeigen, dass Kreatin möglicherweise die Auswirkungen von Kopftreffern reduziert (Tier-Studien + erste Humanstudien). Für Boxer besonders relevant.<br>' +
      '• <strong>Bessere Kraft-Gains:</strong> Im S&C-Training 5–15% mehr Leistung → schnellerer Fortschritt.<br>' +
      '• <strong>Schnellere Sprint-Erholung:</strong> Studien an Kampfsportlern zeigen 10–15% schnellere Erholung zwischen hochintensiven Intervallen – direkt übertragbar auf Runden-Pausen im Boxen.',
    timing: '<strong>Optimales Timing:</strong><br><br>' +
      '• <strong>Täglich 3–5g</strong> – kein Loading nötig. Nach 3–4 Wochen sind die Speicher voll.<br>' +
      '• <strong>Post-Training</strong> mit Kohlenhydraten und Protein – Insulin beschleunigt die Aufnahme. Die Differenz zu anderen Zeitpunkten ist aber marginal – Konsistenz zählt mehr als exaktes Timing (Antonio & Ciccone 2013).<br>' +
      '• <strong>An trainingsfreien Tagen:</strong> Morgens mit dem Frühstück.<br>' +
      '• <strong>Nur Monohydrat!</strong> Kein Kre-Alkalyn, kein HCL, kein „gepuffertes" Kreatin. Mono ist am besten erforscht und am günstigsten.<br><br>' +
      '<strong>Praktischer Kauftipp:</strong><br>' +
      '• Creapure (deutsche Produktion) gilt als Goldstandard. Kosten: ~15–20€ für 500g (reicht 3+ Monate).<br>' +
      '• Geschmacksneutral – einfach in den Post-Workout-Shake oder Saft mischen.<br>' +
      '• Tabletten/Kapseln sind teurer und bieten keinen Vorteil gegenüber Pulver.',
    warn: '<strong>Wettkampf-Strategie für Gewichtsklassen:</strong><br><br>' +
      '• Kreatin speichert 1–2 kg Wasser intrazellulär. Das ist für Boxer in Gewichtsklassen relevant.<br>' +
      '• <strong>Strategie (empfohlen):</strong> Ganzjährig 3g/Tag beibehalten, aber <strong>6–7 Tage vor dem Wiegen absetzen</strong>. Die Wassereinlagerung geht innerhalb von 5–7 Tagen zurück (Hultman et al. 1996).<br>' +
      '• <strong>Nach dem Wiegen:</strong> Sofort mit 10g Reload-Dosis starten. Am Kampftag sind die Speicher teilweise wieder aufgefüllt.<br>' +
      '• Kraftgewinne bleiben mehrere Wochen erhalten – du verlierst nur das Wassergewicht, nicht die Power.<br>' +
      '• Kein Nierenproblem bei gesunden Menschen (Metaanalyse 2022, n>1000).<br><br>' +
      '<strong>Häufiger Fehler bei Boxern:</strong> Kreatin komplett meiden aus Angst vor Gewichtszunahme, statt es strategisch um den Kampf zu periodisieren. Die Vorteile (PCr-Resynthese, Neuroprotection) überwiegen deutlich.',
    studies: 'Rawson & Volek 2003 (Metaanalyse), Branch 2003, Kreider et al. 2017 (ISSN Position Stand), Forbes & Candow 2019 (Neuroprotection), Juhász et al. 2018 (Kampfsport-Sprints), Hultman et al. 1996 (Washout)'
  },
  {
    id: 'beta-alanin', name: 'Beta-Alanin', category: 'PFLICHT',
    dose: '3.2–6.4 g/Tag, aufgeteilt 2×', stars: 5, color: 'var(--green)',
    short: 'Carnosin-Puffer → weniger Laktat-Erschöpfung in Runde 3',
    img: "https://images.pexels.com/photos/13787561/pexels-photo-13787561.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Beta-Alanin ist eine Aminosäure, die im Körper zu Carnosin umgewandelt wird. Carnosin wirkt als intrazellularer pH-Puffer gegen die Übersäuerung (H⁺-Ionen), die bei hochintensiver Belastung entsteht. Wenn du hart arbeitest, produzieren deine Muskeln Laktat und Wasserstoffionen – das „Brennen" in den Muskeln. Carnosin fängt diese H⁺-Ionen ab und verzögert den Punkt, an dem deine Muskeln versagen. Die natürlichen Carnosin-Speicher im Muskel sind begrenzt, aber durch tägliche Beta-Alanin-Supplementierung können sie um 40–80% erhöht werden. Das ist einer der größten messbaren Effekte aller legalen Supplements.',
    boxing: '<strong>Warum für Boxer ein Game-Changer:</strong><br><br>' +
      '• <strong>Runde 3 ist deine Runde:</strong> Die meisten Amateurboxer brechen in Runde 3 ein. Mit erhöhtem Carnosin-Level hältst du die Intensität 2–4% länger – das sind 10–15 Sekunden mehr Vollgas pro Runde.<br>' +
      '• <strong>Schnellere Erholung in der Pause:</strong> Zwischen den Runden wird Laktat schneller abgebaut.<br>' +
      '• <strong>Mehr Volumen im Sparring:</strong> 6-Runden-Sparring fühlt sich an wie 4 Runden. Mehr Trainingsqualität = schnellerer Fortschritt.<br>' +
      '• <strong>Klinischer Effekt bei 60–240 Sek. Belastung:</strong> Eine Boxrunde (3 Min.) fällt genau in das optimale Wirkungsfenster.<br>' +
      '• <strong>Synergie mit Kreatin:</strong> Kreatin für die ersten 10 Sekunden, Beta-Alanin für die restlichen 170 Sekunden der Runde.',
    timing: '<strong>Optimales Protokoll:</strong><br><br>' +
      '• <strong>Ideal: 4× 0,8–1,6g über den Tag verteilt</strong> – minimiert das Kribbeln komplett. Alternativ: 2× 1,6–3,2g morgens und abends.<br>' +
      '• <strong>Loading dauert 4–8 Wochen</strong> bis Carnosin-Speicher voll sind. <strong>Mindestens 6–8 Wochen vor einem Kampf starten</strong> – nicht erst im Fight Camp anfangen!<br>' +
      '• Danach Erhaltungsdosis 3,2g/Tag ausreichend.<br>' +
      '• <strong>Timing egal</strong> – wirkt über Speicher, nicht akut. Kann mit Mahlzeit genommen werden.<br>' +
      '• <strong>Sustained-Release-Formulierungen</strong> (z.B. SR CarnoSyn) reduzieren Parästhesie und ermöglichen höhere Einzeldosen.<br>' +
      '• <strong>Das Kribbeln</strong> (Gesicht, Hände) ist harmlos und kein Zeichen, dass es „wirkt". Höhere Dosen = stärkeres Kribbeln.',
    warn: '<strong>Hinweise:</strong><br><br>' +
      '• Keine bekannten Nebenwirkungen außer dem Kribbeln.<br>' +
      '• NADA/WADA-konform.<br>' +
      '• Kein Effekt auf Maximal-Kraft – wirkt NUR bei Aktivitäten >60 Sek.<br>' +
      '• Günstig: ~15€/Monat als Pulver.<br><br>' +
      '<strong>Häufiger Fehler bei Boxern:</strong> Erst 2–3 Wochen vor dem Kampf anfangen – viel zu spät. Carnosin-Speicher brauchen Wochen zum Aufbauen. Auch nicht wegen Kribbeln absetzen – einfach die Dosis besser aufteilen.',
    studies: 'Hobson et al. 2012 (Metaanalyse), Trexler et al. 2015 (ISSN Position Stand), Saunders et al. 2017 (Combat Sport Spezifik), Donovan et al. 2012 (Kampfsport-Leistung)'
  },
  {
    id: 'magnesium', name: 'Magnesium Bisglycinat', category: 'PFLICHT',
    dose: '300–400 mg vor dem Schlaf', stars: 4, color: 'var(--green)',
    short: 'Schlafqualität, Muskelregeneration, Cortisol ↓',
    img: "https://images.pexels.com/photos/13787566/pexels-photo-13787566.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Magnesium ist an über 600 enzymatischen Reaktionen im Körper beteiligt – Energieproduktion, Muskelkontraktion, Nervenfunktion, DNA-Synthese. 60–70% der Bevölkerung haben einen suboptimalen Magnesium-Status, bei Sportlern sogar mehr (Schweiß = Magnesiumverlust).',
    boxing: '<strong>Warum Boxer Magnesium brauchen:</strong><br><br>' +
      '• <strong>Besserer Schlaf:</strong> Magnesium aktiviert den Parasympathikus und reguliert GABA (beruhigender Neurotransmitter). Studien zeigen +20 Min. Gesamtschlafzeit und bessere Schlafqualität.<br>' +
      '• <strong>Weniger Krämpfe:</strong> Besonders nach hartem Sparring oder S&C-Einheiten. Magnesium verhindert übermäßige Muskelspannung.<br>' +
      '• <strong>Cortisol-Senkung:</strong> Niedrigeres Cortisol = bessere Regeneration = schnellerer Fortschritt. Besonders wichtig bei hohem Trainingsvolumen.<br>' +
      '• <strong>Stressresistenz:</strong> Emotional stabiler im Wettkampf. Magnesium moduliert die HPA-Achse (Stressachse).<br>' +
      '• <strong>Muskelregeneration:</strong> Schnellere Reparatur von Mikrorissen nach intensivem Training.',
    timing: '<strong>Optimales Timing:</strong><br><br>' +
      '• <strong>Standard: 300–400mg elementares Magnesium</strong> 30–60 Min. vor dem Schlafengehen.<br>' +
      '• <strong>Bei 2× Training/Tag:</strong> Dosis aufteilen – 200mg morgens + 200mg abends. Magnesium geht stark über den Schweiß verloren (~15–20mg/L Schweiß). Bei zwei intensiven Sessions können die Verluste bei 50–100mg/Tag liegen (Nielsen & Lukaski 2006).<br>' +
      '• <strong>Im Fight Camp:</strong> Gesamtdosis auf 400–500mg/Tag erhöhen – höheres Trainingsvolumen = höherer Bedarf.<br>' +
      '• <strong>Bisglycinat (Glycinat)</strong> ist die beste Form: hohe Bioverfügbarkeit + Glycin wirkt zusätzlich schlaffördernd (Bannai et al. 2012).<br>' +
      '• <strong>NICHT Magnesiumoxid</strong> – billig, aber nur 4% Bioverfügbarkeit und macht Durchfall.<br>' +
      '• Alternative Formen: Magnesium-L-Threonat (speziell für Kognition), Citrat (OK, aber kann Magen belasten).',
    warn: '<strong>Hinweise:</strong><br><br>' +
      '• Bei Nierenproblemen Arzt fragen.<br>' +
      '• Kann mit Zink kombiniert werden (ZMA-Prinzip).<br>' +
      '• Effekt spürbar nach 1–2 Wochen täglicher Einnahme.<br>' +
      '• Nicht zeitgleich mit Koffein – Koffein erhöht die Magnesium-Ausscheidung.<br>' +
      '• <strong>Während Weight Cuts:</strong> Dosis unbedingt beibehalten oder sogar leicht erhöhen – kalorienreduzierte Ernährung + Dehydratation senken den Mg-Spiegel drastisch.',
    studies: 'Abbasi et al. 2012 (Schlaf), Nielsen & Lukaski 2006 (Sport + Schweißverluste), Zhang et al. 2017 (Metaanalyse Schlafqualität), Bannai et al. 2012 (Glycin + Schlaf)'
  },
  {
    id: 'vitamin-d', name: 'Vitamin D3 + K2', category: 'PFLICHT',
    dose: '2000–5000 IU morgens mit Fett', stars: 4, color: 'var(--green)',
    short: 'Knochen, Immunfunktion, Stimmung, Muskelkraft',
    img: "https://images.pexels.com/photos/16776311/pexels-photo-16776311.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Vitamin D ist eigentlich ein Hormon, kein Vitamin. Dein Körper produziert es durch Sonnenlicht – aber in Deutschland (Breitengrad >50°) ist von Oktober bis März die UV-Strahlung zu schwach für eine ausreichende Produktion. 80–90% der Deutschen haben im Winter einen suboptimalen Vitamin-D-Spiegel.',
    boxing: '<strong>Warum Boxer Vitamin D brauchen:</strong><br><br>' +
      '• <strong>Knochenstabilität:</strong> Boxer setzen und empfangen enorme Kräfte. Vitamin D reguliert die Kalziumaufnahme – ohne Vitamin D sind Knochen anfälliger für Frakturen (Handgelenk, Nase, Augenhöhle).<br>' +
      '• <strong>Immunfunktion:</strong> Intensives Training unterdrückt das Immunsystem für 3–72h nach dem Training (Open Window). Vitamin D stärkt die angeborene Immunabwehr – weniger Trainingsausfälle durch Erkältungen.<br>' +
      '• <strong>Muskelkraft:</strong> Vitamin-D-Rezeptoren sitzen direkt auf Muskelzellen. Studien zeigen +18% Kraftsteigerung bei Korrektur eines Mangels.<br>' +
      '• <strong>Stimmung & Motivation:</strong> Vitamin-D-Mangel korreliert stark mit depressiven Symptomen. Im Winter-Trainingsblock besonders wichtig.<br>' +
      '• <strong>Testosteron:</strong> Optimale D3-Level korrelieren mit höherem freiem Testosteron – relevant für Kraft und Regeneration.',
    timing: '<strong>Optimales Protokoll:</strong><br><br>' +
      '• <strong>Bluttest ist Pflicht!</strong> 25(OH)D-Spiegel messen lassen. Optimal für Athleten: 40–60 ng/ml (100–150 nmol/L). Close et al. (2013) fanden bei 62% der Indoor-Athleten in UK insuffiziente Werte – Boxer trainieren fast ausschließlich in der Halle.<br>' +
      '• <strong>Erhaltung:</strong> 2000–4000 IU/Tag bei Werten im Zielbereich.<br>' +
      '• <strong>Bei Mangel (<30 ng/ml):</strong> 5000–10.000 IU/Tag für 8 Wochen unter ärztlicher Kontrolle, dann Erhaltungsdosis anpassen.<br>' +
      '• <strong>Morgens mit einer fetthaltigen Mahlzeit</strong> – Vitamin D ist fettlöslich und braucht Fett zur Absorption.<br>' +
      '• <strong>Immer mit K2 (MK-7)</strong> kombinieren: K2 lenkt das Kalzium in die Knochen statt in die Arterien. 100–200 µg MK-7 pro Tag. MK-7 hat eine längere Halbwertszeit (~72h) als MK-4 – die bessere Wahl.',
    warn: '<strong>Hinweise:</strong><br><br>' +
      '• Überdosierung möglich (aber erst ab >10.000 IU/Tag über Monate). Nicht mehr als 5000 IU ohne Bluttest.<br>' +
      '• NADA/WADA-konform.<br>' +
      '• <strong>Boxer trainieren fast nur indoor</strong> – auch im Sommer kann die UV-Exposition zu niedrig sein. Nicht pauschal im Sommer absetzen, sondern nach Bluttest entscheiden.<br>' +
      '• Bei regelmäßigem Outdoor-Training (Arme/Beine frei, 15+ Min. Sonne) auf 1000–2000 IU reduzieren.',
    studies: 'Cannell et al. 2009 (Athleten), Close et al. 2013 (Muskelkraft + 62% Mangel bei Indoor-Athleten), Owens et al. 2018 (Kampfsport spezifisch)'
  },
  {
    id: 'omega3', name: 'Omega-3 (EPA + DHA)', category: 'PFLICHT',
    dose: '3–4 g EPA+DHA/Tag (davon 1.5–2g DHA)', stars: 5, color: 'var(--green)',
    short: 'Neuroprotection bei Kopftreffern, Entzündung ↓, Gelenke',
    img: "https://images.pexels.com/photos/208518/pexels-photo-208518.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Omega-3-Fettsäuren (EPA und DHA) sind essentielle Fette, die der Körper nicht selbst herstellen kann. Sie wirken systemisch entzündungshemmend, sind Bausteine der Zellmembranen und besonders konzentriert im Gehirn. Die typische westliche Ernährung enthält viel zu wenig Omega-3 im Verhältnis zu Omega-6.',
    boxing: '<strong>Warum Omega-3 für Boxer Pflicht ist:</strong><br><br>' +
      '• <strong>Neuroprotection – das wichtigste Argument:</strong> DHA macht 40% der Fettsäuren im Gehirn aus. Oliver et al. (2016) zeigten bei Football-Spielern, dass 2g DHA/Tag die Biomarker für Hirnschädigung (Neurofilament light chain) über eine Saison signifikant senkte. Für Boxer, die kumulativen Kopftreffern ausgesetzt sind, ist das keine Option sondern Notwendigkeit.<br>' +
      '• <strong>Entzündungshemmung (EPA):</strong> Nach hartem Sparring oder S&C hat dein Körper systemische Entzündungen. EPA beschleunigt die Auflösung (Resolution) dieser Entzündungsreaktion = schnellere Regeneration. Während intensiver Fight-Camp-Phasen besonders relevant.<br>' +
      '• <strong>Gelenkgesundheit:</strong> Handgelenke, Schultern, Knie – Boxer belasten alle Gelenke enorm. EPA reduziert Gelenkschmerzen nachweislich.<br>' +
      '• <strong>Kognition:</strong> Bessere Reaktionszeit und Entscheidungsfindung im Ring. DHA verbessert die neuronale Signalübertragung.<br>' +
      '• <strong>Herzgesundheit:</strong> Senkt Ruhepuls und verbessert HRV – direkt messbar.<br>' +
      '• <strong>Muskelregeneration:</strong> 15–20% weniger Muskelkater (DOMS) bei ausreichender Omega-3-Versorgung. Nach hartem Sparring am Montag bist du schneller bereit für Mittwoch.',
    timing: '<strong>Optimales Protokoll für Kontaktsportler:</strong><br><br>' +
      '• <strong>3–4g kombiniertes EPA+DHA pro Tag</strong> – höher als die Standard-Empfehlung (2g), weil Kontaktsportler den neuroprotektiven DHA-Effekt maximieren sollten (Lewis & Bailes 2011).<br>' +
      '• <strong>DHA-Schwerpunkt:</strong> Mindestens 1,5–2g DHA pro Tag. Standard-Fischöl hat oft ein 3:2-Verhältnis (EPA:DHA) – für Boxer ein Produkt mit höherem DHA-Anteil wählen oder ein reines DHA-Supplement ergänzen.<br>' +
      '• <strong>Mit einer fetthaltigen Mahlzeit</strong> für bessere Absorption.<br>' +
      '• <strong>Aufteilen:</strong> 1,5g morgens + 1,5–2g abends reduziert Fischgeschmack-Risiko.<br>' +
      '• <strong>Qualität wichtig:</strong> IFOS-zertifiziert oder Triglycerid-Form. Billige Ethylester-Formen haben 30–50% weniger Bioverfügbarkeit. Nicht Fischöl-Gesamtmenge lesen, sondern EPA + DHA pro Kapsel!<br>' +
      '• <strong>Omega-3-Index messen lassen:</strong> Bluttest, Zielwert >8%.<br>' +
      '• <strong>Alternative:</strong> Algen-Omega-3 für Vegetarier/Veganer (gleiche EPA+DHA, sogar reineres DHA).',
    warn: '<strong>Hinweise:</strong><br><br>' +
      '• Leicht blutverdünnend – bei geplanter OP oder blutverdünnenden Medikamenten Arzt fragen.<br>' +
      '• Effekt nach 4–6 Wochen spürbar (Speicher müssen sich aufbauen).<br>' +
      '• Nicht mit Mahlzeiten mit viel Omega-6 (Sonnenblumenöl, Fast Food) – diese konkurrieren um die gleichen Enzyme.<br><br>' +
      '<strong>Häufiger Fehler bei Boxern:</strong> Standard-Fischöl mit zu niedrigem DHA-Anteil verwenden und zu wenig nehmen. 1g Fischöl-Kapsel enthält oft nur 300mg EPA+DHA – man braucht also 10+ Kapseln von billigem Fischöl. Lieber ein hochdosiertes Produkt kaufen.',
    studies: 'Calder 2017 (Entzündung), Oliver et al. 2016 (DHA + Hirnschutz bei Kontaktsport), Lewis & Bailes 2011 (höhere DHA-Dosis für Kontaktsportler), Philpott et al. 2019 (Kontaktsport + DHA), Mills et al. 2011 (DHA + TBI)'
  },
  {
    id: 'rote-beete', name: 'Rote-Beete-Saft / Nitrat', category: 'EMPFOHLEN',
    dose: '500 ml Saft oder 70 ml Konzentrat/Tag', stars: 4, color: 'var(--gold)',
    short: 'O₂-Kosten ↓3–5%, Typ-II-Faser-Boost, täglich + vor Kampf',
    img: "https://images.pexels.com/photos/4443480/pexels-photo-4443480.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Rote-Beete-Saft – ob als frischer Saft oder als Konzentrat-Shot – ist die beste natürliche Quelle für anorganisches Nitrat (NO₃⁻). Im Körper wird Nitrat von Bakterien auf der Zunge zu Nitrit und dann zu Stickstoffmonoxid (NO) umgewandelt. NO erweitert die Blutgefäße, verbessert die Sauerstoff-Effizienz der Mitochondrien und steigert die Kontraktionskraft der schnellen Muskelfasern. Das Ergebnis: Du brauchst weniger Sauerstoff für die gleiche Leistung und deine explosiven Fasern arbeiten effizienter. Das Australian Institute of Sport (AIS) stuft Nitrat als A-Level-Supplement ein – die höchste Evidenzstufe.',
    boxing: '<strong>Warum das für Boxer entscheidend ist:</strong><br><br>' +
      '• <strong>3–5% weniger O₂-Kosten:</strong> Klingt wenig, aber in Runde 3 ist das der Unterschied zwischen „ich kann noch" und „ich breche ein".<br>' +
      '• <strong>Typ-II-Faser-Boost:</strong> Nitrat verbessert speziell die Kontraktionsgeschwindigkeit und Kraft der schnellen Muskelfasern (Coggan et al. 2015) – genau die Fasern, die du für explosive Schlagkombinationen brauchst.<br>' +
      '• <strong>Bessere Erholung zwischen Runden:</strong> Reduzierter PCr-Abbau (Bailey et al. 2010) bedeutet: Du erholst dich in der 1-Minuten-Pause schneller und startest frischer in die nächste Runde.<br>' +
      '• <strong>Kognition unter Belastung:</strong> NO verbessert die zerebrale Durchblutung – klareres Denken und schnellere Reaktionszeit in der letzten Runde (Thompson et al. 2015).<br>' +
      '• <strong>Intermittierende Belastung:</strong> Boxen ist perfekt im Wirkungsfenster von Nitrat – hochintensiv, intermittierend, mit explosiven Aktionen und kurzen Pausen. Studien zeigen +3–4% bei Wiederholungssprints (Thompson et al. 2016).<br><br>' +
      '<strong>Tägliche Einnahme oder nur vor dem Kampf?</strong><br><br>' +
      'Tägliches Trinken von Rote-Beete-Saft bringt mehr als nur eine einmalige Dosis vor dem Wettkampf. Chronische Gabe (ab 3+ Tagen täglich) baut höhere basale Nitrit-Spiegel im Plasma auf – die Wirkung am Kampftag ist dann deutlich stärker, weil sie auf einem höheren Ausgangsniveau startet (Wylie et al. 2013). Studien bis 28 Tage zeigen dabei keine Toleranzentwicklung – der Effekt bleibt stabil (Vanhatalo et al. 2010). Zusätzlich verbessert die regelmäßige Einnahme die Muskeldurchblutung und Kontraktionseffizienz der schnellen Fasern über den akuten Effekt hinaus (Hernandez et al. 2012). Auch die Trainingsqualität profitiert: höhere Intensität im Training = besserer Trainingsreiz.',
    timing: '<strong>Einnahme – Training + Wettkampf:</strong><br><br>' +
      '<strong>Tägliches Trainingsprotokoll:</strong><br>' +
      '• <strong>500 ml frischer Rote-Beete-Saft</strong> (selbst gepresst oder aus dem Bioladen) oder <strong>70 ml Konzentrat-Shot</strong> (z.B. Beet It) pro Tag. Beides liefert ~6–8 mmol Nitrat.<br>' +
      '• Morgens oder 2–3h vor dem Training.<br>' +
      '• Kann langfristig durchgeführt werden – keine Toleranzentwicklung nachgewiesen.<br>' +
      '• Frischer Saft ist günstiger und genauso wirksam, Konzentrat-Shots sind praktischer für unterwegs.<br><br>' +
      '<strong>Wettkampf-Loading (optimal):</strong><br>' +
      '• <strong>5–7 Tage vor dem Kampf:</strong> Täglich 1 Portion (Saft oder Shot), um die Nitrit-Speicher auf Maximum zu bringen.<br>' +
      '• <strong>Kampftag:</strong> Letzte Portion 2,5–3 Stunden vor dem Kampf (Plasma-Nitrit-Peak nach 2–3h).<br>' +
      '• Das Loading zeigt stärkere Effekte als eine Einzeldosis (McMahon et al. 2017, Meta-Analyse).<br><br>' +
      '<strong>Wichtige Regeln:</strong><br>' +
      '• <strong>Kein antibakterielles Mundwasser!</strong> Chlorhexidin tötet die Zungenflora, die Nitrat in Nitrit umwandelt. 24h vorher kein Mundwasser (Govoni et al. 2008).<br>' +
      '• <strong>Auch kein antibakterieller Kaugummi.</strong><br>' +
      '• <strong>Dosis:</strong> 6–8 mmol NO₃⁻ pro Tag (~400–500 mg Nitrat). Höhere Dosen zeigten teils stärkere Effekte, aber auch mehr Magen-Darm-Beschwerden.',
    warn: '<strong>Hinweise und Sicherheit:</strong><br><br>' +
      '• <strong>Beeturie:</strong> Roter Urin/Stuhl ist NORMAL (Betanin-Farbstoff) – kein Grund zur Sorge.<br>' +
      '• <strong>NADA/WADA-konform</strong> (natürliches Lebensmittel).<br>' +
      '• <strong>Nierensteine:</strong> Bei Oxalat-Typ vorsichtig – Rote Beete enthält Oxalat.<br>' +
      '• <strong>Blutdruck:</strong> Leicht blutdrucksenkend (~3–5 mmHg systolisch). Bei gleichzeitiger Einnahme von Blutdruckmedikamenten Arzt fragen.<br>' +
      '• <strong>Magen-Darm:</strong> Bei hohen Dosen (>12 mmol) möglich: Übelkeit, Durchfall, Magenkrämpfe (Hoon et al. 2014). Standard-Dosis (6–8 mmol) ist gut verträglich.<br>' +
      '• <strong>Langzeitsicherheit:</strong> Gemüsebasierte Nitratquellen enthalten gleichzeitig Antioxidantien (Vitamin C, Polyphenole), die die theoretische Nitrosaminbildung hemmen. EFSA und BfR sehen kein relevantes Risiko (Lundberg et al. 2018).<br>' +
      '• <strong>Einschränkung bei Hochtrainierten:</strong> Bei sehr hoher VO₂max (>65 ml/kg/min) sind die Effekte geringer (Porcelli et al. 2015). Für die meisten Amateurboxer aber hochrelevant.<br>' +
      '• Geschmack gewöhnungsbedürftig – Konzentrat-Shots sind einfacher als roher Saft.',
    studies: 'Jones 2014 (Übersicht), McMahon et al. 2017 (Metaanalyse), Wylie et al. 2013 (Typ-II-Fasern + chronisch), Vanhatalo et al. 2010 (15 Tage kein Wirkungsverlust), Coggan et al. 2015 (Muskelkraft), Bailey et al. 2009/2010 (O₂-Einsparung), Thompson et al. 2015/2016 (Kognition + Sprints), Lundberg et al. 2018 (Sicherheit)'
  },
  {
    id: 'koffein', name: 'Koffein', category: 'MIT TIMING',
    dose: '2–3 mg/kg, NUR MORGENS (vor 12 Uhr)', stars: 5, color: 'var(--gold)',
    short: 'Reaktionszeit ↑, Ausdauer +11%, Schmerzempfinden ↓',
    img: "https://images.pexels.com/photos/111128/pexels-photo-111128.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Koffein ist das am weitesten verbreitete Stimulans der Welt – und eines der bestbelegten Ergogenics. Es blockiert Adenosin-Rezeptoren (macht dich wach), erhöht Adrenalin-Ausschüttung, verbessert die Fettverbrennung und senkt das wahrgenommene Anstrengungsempfinden (RPE).',
    boxing: '<strong>Vorteile für Boxer:</strong><br><br>' +
      '• <strong>Reaktionszeit ↑:</strong> Bereits 2–3 mg/kg reichen für 3–5% schnellere Reaktion (Duvnjak-Zaknich et al. 2011). Im Boxen ist das ein ausweichbarer Schlag.<br>' +
      '• <strong>+11% Ausdauerleistung:</strong> Metaanalyse über >600 Studien. Du kannst länger auf hoher Intensität arbeiten.<br>' +
      '• <strong>Schmerztoleranz ↑:</strong> Koffein senkt die Schmerzwahrnehmung. Du spürst Treffer weniger – Vorsicht, das kann auch gefährlich sein.<br>' +
      '• <strong>Mehr Power:</strong> +3% maximale Kraft in Studien. Nicht viel, aber messbar.<br>' +
      '• <strong>Fokus:</strong> Bessere Aufmerksamkeit und Entscheidungsgeschwindigkeit – wichtig für taktisches Boxen.<br><br>' +
      '<strong>Warum 2–3 mg/kg besser sind als 5+ mg/kg für Boxer:</strong><br>' +
      '• Höhere Dosen (5–6 mg/kg) verbessern die Reaktionszeit NICHT weiter, erhöhen aber Tremor (Zittern). Für präzises Boxen – saubere Technik, genaue Treffer – ist feinmotorische Kontrolle entscheidend. Zu viel Koffein macht dich ungenau.',
    timing: '<strong>Timing ist ALLES bei Koffein:</strong><br><br>' +
      '• <strong>Halbwertszeit: 5–7 Stunden.</strong> Koffein um 14 Uhr → 50% noch um 20 Uhr im Blut → Schlafqualität massiv gestört.<br>' +
      '• <strong>Regel: Kein Koffein nach 12 Uhr.</strong> Auch nicht „nur einen kleinen Espresso". Schlaf > Koffein-Boost.<br>' +
      '• <strong>Pre-Training (morgens):</strong> 2–3 mg/kg Körpergewicht, 30–60 Min. vor dem Training.<br><br>' +
      '<strong>Kampf-Periodisierung:</strong><br>' +
      '• <strong>2–3 Wochen vor dem Kampf:</strong> Koffein auf ~1 mg/kg reduzieren oder ganz absetzen (Toleranzreduktion).<br>' +
      '• <strong>Kampftag:</strong> 2–3 mg/kg, 45–60 Min. vor dem Kampf. Die reduzierte Toleranz macht die gleiche Dosis deutlich wirksamer.<br>' +
      '• <strong>Kombination mit L-Theanin (100–200 mg):</strong> Glättet die Koffein-Nervosität bei Erhalt der kognitiven Vorteile – ideal am Kampftag (Haskell et al. 2008).<br>' +
      '• Nie erstmals am Kampftag testen!',
    warn: '<strong>Wichtige Warnung:</strong><br><br>' +
      '• <strong>Koffein ZERSTÖRT Schlaf</strong> – auch wenn du einschlafen kannst. Die Tiefschlafphase wird verkürzt. Schlaf ist 10× wichtiger als der Koffein-Boost.<br>' +
      '• Bei Angst/Nervosität vor dem Kampf: Koffein verstärkt die Nervosität. Weniger oder mit L-Theanin kombinieren.<br>' +
      '• Nicht mit Kreatin konkurrierend – können zusammen genommen werden.<br>' +
      '• Max 4 mg/kg für Boxer – darüber leidet die Feinmotorik ohne Leistungsvorteil.<br><br>' +
      '<strong>Häufiger Fehler bei Boxern:</strong> Energy Drinks statt kontrollierter Koffein-Dosis (unkontrollierte Menge, Zucker) und keine Koffein-Pause vor dem Kampf (vollständige Toleranz = kein ergogener Effekt mehr).',
    studies: 'Southward et al. 2018 (Metaanalyse), Guest et al. 2021 (ISSN Position Stand), Duvnjak-Zaknich et al. 2011 (Reaktionszeit), Haskell et al. 2008 (Koffein + L-Theanin), Drake et al. 2013 (Schlafstörung)'
  },
  {
    id: 'melatonin', name: 'Melatonin', category: 'SCHLAF',
    dose: '0.3–0.5 mg, 30 Min. vor Schlaf', stars: 3, color: 'var(--blue)',
    short: 'Einschlaf-Beschleunigung nach Spät-Training',
    img: "https://images.pexels.com/photos/11361813/pexels-photo-11361813.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Melatonin ist das „Schlafhormon" – es wird natürlich von der Zirbeldrüse produziert, wenn es dunkel wird. Es signalisiert deinem Körper: „Zeit zum Schlafen". Supplementiertes Melatonin kann den Einschlafprozess beschleunigen, besonders wenn dein natürlicher Rhythmus gestört ist.',
    boxing: '<strong>Warum Boxer es brauchen könnten:</strong><br><br>' +
      '• <strong>Spättraining-Problem:</strong> Boxtraining um 19–21 Uhr → Adrenalin, Cortisol, Körpertemperatur erhöht. Melatonin hilft, den Parasympathikus schneller zu aktivieren.<br>' +
      '• <strong>Jetlag bei Wettkämpfen:</strong> Turniere in anderen Zeitzonen → Melatonin resettet die innere Uhr.<br>' +
      '• <strong>Bildschirmzeit:</strong> Blaues Licht von Handy/TV unterdrückt natürliche Melatonin-Produktion. Supplement kompensiert das teilweise.<br>' +
      '• <strong>Antioxidativ:</strong> Melatonin ist ein starkes Antioxidans – unterstützt die Regeneration während des Schlafs.',
    timing: '<strong>Korrektes Protokoll (die meisten nehmen zu viel!):</strong><br><br>' +
      '• <strong>0,3–0,5 mg reicht!</strong> Die üblichen 3–5 mg Pillen sind viel zu hoch dosiert. MIT-Forschung (Zhdanova et al. 2001) zeigte, dass 0,3 mg physiologisch ist und genauso effektiv wie höhere Dosen, ohne morgendliche Restwirkung.<br>' +
      '• <strong>30 Minuten vor dem Schlafengehen</strong> – nicht 2 Stunden vorher (zu früh verschiebt den zirkadianen Rhythmus).<br>' +
      '• <strong>Sublingual (unter der Zunge)</strong> wirkt schneller als Kapseln zum Schlucken.<br>' +
      '• <strong>Nicht täglich dauerhaft</strong> – verwende es situativ: nach Spättraining, vor Kampf, bei Zeitumstellung. 2–3x/Woche max.<br><br>' +
      '<strong>Boxer-spezifische Anwendungen:</strong><br>' +
      '• <strong>Nach Abendkämpfen:</strong> 0,3–0,5 mg nach dem Kampf, wenn Adrenalin den Schlaf verhindert.<br>' +
      '• <strong>Fight Week:</strong> Kann in der Kampfwoche täglich genommen werden (kurzzeitig akzeptabel), dann wieder absetzen.<br>' +
      '• <strong>Internationale Turniere:</strong> 0,5 mg zur lokalen Zielschlafenszeit, 2–3 Tage vor Ankunft beginnen.',
    warn: '<strong>Hinweise:</strong><br><br>' +
      '• In Deutschland rezeptfrei nur als 1–2 mg erhältlich. 0.3 mg Tabletten halbieren/vierteln oder Liquid-Form (genauere Dosierung).<br>' +
      '• Macht NICHT abhängig – aber der Körper kann die eigene Produktion runterfahren bei täglicher Einnahme.<br>' +
      '• Nicht bei Kindern/Jugendlichen unter 18 ohne ärztliche Beratung.<br>' +
      '• Kann leichte Benommenheit am nächsten Morgen verursachen (dann Dosis reduzieren).',
    studies: 'Ferracioli-Oda et al. 2013 (Metaanalyse), Costello et al. 2014 (Sportler), Zhdanova et al. 2001 (niedrige Dosis)'
  },
  {
    id: 'l-theanin', name: 'L-Theanin', category: 'OPTIONAL',
    dose: '200 mg vor dem Schlaf', stars: 3, color: 'var(--blue)',
    short: 'Schlafqualität ohne Sedierung, Entspannung',
    img: "https://images.pexels.com/photos/8474179/pexels-photo-8474179.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'L-Theanin ist eine Aminosäure, die natürlich in grünem Tee vorkommt. Sie erhöht die Alpha-Wellen-Aktivität im Gehirn – das ist der entspannte, wache Zustand (wie bei Meditation). Es wirkt beruhigend ohne müde zu machen.',
    boxing: '<strong>Nutzen für Boxer:</strong><br><br>' +
      '• <strong>Pre-Fight-Anxiety:</strong> 200 mg L-Theanin reduziert subjektive Angst und erhöht Alpha-Gehirnwellen – der Zustand von entspanntem Fokus, ohne Sedierung (Kimura et al. 2007). Am Kampftag kombiniert mit Koffein entsteht die ideale Boxer-Mentalität: wach, schnell, aber ruhig.<br>' +
      '• <strong>Koffein-Synergie am Kampftag:</strong> 100–200 mg L-Theanin + 2–3 mg/kg Koffein ist eine evidenzbasierte Kombination (Haskell et al. 2008, Owen et al. 2008). L-Theanin glättet die Koffein-Nebenwirkungen (Zittern, Nervosität) bei Erhalt der kognitiven Vorteile. Wache Aufmerksamkeit + schnelle Reaktion ohne Nervosität.<br>' +
      '• <strong>Besser einschlafen nach dem Training:</strong> Kein Sedativum, sondern „entspanntes Wachsein" das natürlich in Schlaf übergeht.<br>' +
      '• <strong>Verbesserte Schlafqualität:</strong> Nicht schnelleres Einschlafen, sondern tieferer Schlaf und weniger Aufwachen.<br>' +
      '• <strong>Synergie mit Magnesium:</strong> Zusammen vor dem Schlaf = starker Regenerations-Stack.',
    timing: '<strong>Drei Anwendungen:</strong><br><br>' +
      '• <strong>Kampftag / Pre-Fight:</strong> 200 mg + Koffein (2–3 mg/kg), 45–60 Min. vor dem Kampf. Fokussierte Ruhe unter Druck.<br>' +
      '• <strong>Morgens (Fokus-Training):</strong> 100 mg + Koffein → ruhiger, fokussierter Zustand ohne Koffein-Jitters. Ideal vor dem Morgensparring.<br>' +
      '• <strong>Abends (Schlaf):</strong> 200 mg + Magnesium, 30–60 Min. vor dem Schlafengehen.',
    warn: '<strong>Hinweise:</strong><br><br>' +
      '• Praktisch keine Nebenwirkungen – eines der sichersten Supplements überhaupt.<br>' +
      '• Kein Abhängigkeitspotential.<br>' +
      '• Wirkung subtil – kein „Wow-Effekt", sondern eine merkbare Verbesserung der Entspannung über Zeit.<br><br>' +
      '<strong>Häufiger Fehler bei Boxern:</strong> L-Theanin nur als Schlaf-Supplement verwenden und das anxiolytische Potenzial am Kampftag komplett ignorieren. Die Kombination mit Koffein ist besser erforscht als jedes der beiden allein.',
    studies: 'Nobre et al. 2008 (Alpha-Wellen), Kimura et al. 2007 (Angstreduktion), Haskell et al. 2008 (Koffein + L-Theanin Synergie), Owen et al. 2008, Hidese et al. 2019 (Stressreduktion)'
  },
  {
    id: 'ashwagandha', name: 'Ashwagandha KSM-66', category: 'OPTIONAL',
    dose: '300–600 mg abends', stars: 3, color: 'var(--blue)',
    short: '−27.9% Cortisol, Stressresistenz, Regeneration',
    img: "https://images.pexels.com/photos/15897781/pexels-photo-15897781.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Ashwagandha (Withania somnifera) ist ein adaptogenes Kraut aus der ayurvedischen Medizin. „Adaptogen" bedeutet: Es hilft dem Körper, sich an Stress anzupassen. KSM-66 ist der am besten erforschte Extrakt mit standardisiertem Withanolid-Gehalt (5%).',
    boxing: '<strong>Warum es für Boxer interessant ist:</strong><br><br>' +
      '• <strong>−27.9% Cortisol:</strong> Die vielzitierte RCT (Chandrasekhar 2012). Chronisch erhöhtes Cortisol = Muskelabbau, schlechter Schlaf, geschwächtes Immunsystem. Boxer mit hohem Trainingsvolumen haben oft erhöhtes Cortisol.<br>' +
      '• <strong>Bessere Regeneration:</strong> Niedrigeres Cortisol + besserer Schlaf = schnellere Erholung zwischen den Trainings.<br>' +
      '• <strong>Kraftzuwachs:</strong> Studie zeigt +18% Steigerung der Bankdrück-1RM-Kraft nach 8 Wochen vs. Placebo (Wankhede 2015).<br>' +
      '• <strong>Stressresistenz:</strong> Emotional stabiler im Wettkampfstress – weniger Angst, besserer Umgang mit Druck.<br>' +
      '• <strong>Schilddrüse:</strong> Normalisiert TSH-Werte – kann bei Unterfunktion helfen (bei Überfunktion vorsichtig!).',
    timing: '<strong>Optimales Protokoll:</strong><br><br>' +
      '• <strong>300 mg KSM-66</strong> für allgemeine Stressreduktion, <strong>600 mg</strong> für maximalen Krafteffekt.<br>' +
      '• <strong>Bei 2x Training/Tag:</strong> 300 mg morgens + 300 mg abends – verteilt die Cortisol-Regulation über den ganzen Tag.<br>' +
      '• <strong>Bei 1x Training:</strong> Abends wegen der schlaffördernden Wirkung – passt perfekt in den Abend-Stack (+ Magnesium + L-Theanin).<br>' +
      '• <strong>Zyklen:</strong> 8 Wochen an, 2 Wochen Pause ist eine verbreitete Vorsichtsmaßnahme. Die meisten Studien liefen 8–12 Wochen ohne Pause, es fehlen aber Langzeitdaten >12 Wochen.<br>' +
      '• <strong>Nur KSM-66 oder Sensoril</strong> – andere Extrakte haben nicht die gleiche Evidenzbasis.<br>' +
      '• <strong>Fight-Camp-Strategie:</strong> Gerade während der intensivsten Trainingsphase (hoher Cortisol) ist Ashwagandha am wertvollsten. Nicht in der letzten Woche vor dem Kampf erstmalig starten – 2–4 Wochen Anlaufzeit einplanen. Während Weight Cuts nicht absetzen – der Cortisol-Stress ist dort am höchsten.',
    warn: '<strong>Wichtige Hinweise:</strong><br><br>' +
      '• <strong>Schilddrüse:</strong> Ashwagandha kann TSH senken und T4 erhöhen. Bei Schilddrüsen-Überfunktion (Hyperthyreose) NICHT nehmen.<br>' +
      '• <strong>Autoimmun:</strong> Kann das Immunsystem stimulieren – bei Autoimmunerkrankungen mit Arzt klären.<br>' +
      '• <strong>NADA/WADA:</strong> Steht nicht auf der Verbotsliste, aber es gibt ein reales Kontaminationsrisiko bei minderwertigen Produkten (Schwermetalle, nicht deklarierte Substanzen). <strong>Nur Produkte mit NSF Certified for Sport oder Informed Sport-Zertifizierung verwenden.</strong> Es gab dokumentierte Fälle von kontaminierten Ashwagandha-Produkten.<br>' +
      '• Nicht in der Schwangerschaft.',
    studies: 'Chandrasekhar et al. 2012 (Cortisol −27,9%), Wankhede et al. 2015 (Kraft), Choudhary et al. 2015 (VO2max), Salve et al. 2019 (Schlaf)'
  },
  {
    id: 'altitude-mask', name: 'Altitude Mask', category: 'SKIP',
    dose: '–', stars: 1, color: 'var(--red)',
    short: 'KEIN Höhenreiz. Verschlechtert Training. IMT ist besser.',
    img: "https://images.pexels.com/photos/20523354/pexels-photo-20523354.jpeg?auto=compress&cs=tinysrgb&w=600",
    what: 'Altitude Masks (Höhenmasken) versprechen einen Höhentrainingseffekt durch Einschränkung des Luftstroms. Die Realität: Sie simulieren KEINE Höhe. Höhentraining funktioniert über reduzierten Sauerstoff-Partialdruck (weniger O₂-Moleküle). Eine Maske reduziert nur den Luftstrom – der O₂-Gehalt der eingeatmeten Luft bleibt identisch.',
    boxing: '<strong>Warum du sie NICHT tragen solltest:</strong><br><br>' +
      '• <strong>Kein Höheneffekt:</strong> Kein Anstieg von EPO, keine vermehrte Bildung roter Blutkörperchen, kein echtes Höhentraining.<br>' +
      '• <strong>Trainingsqualität sinkt:</strong> Du trainierst mit weniger Intensität, weil du durch die Maske schlechter Luft bekommst. Weniger Intensität = weniger Anpassung. Du wirst SCHLECHTER, nicht besser.<br>' +
      '• <strong>Atemmuskel-Training ineffizient:</strong> Die Maske bietet einen unspezifischen inspiratorischen UND exspiratorischen Widerstand. IMT (PowerBreathe) trainiert gezielt die Einatmungsmuskulatur mit kontrolliertem Widerstand – nachweislich effektiver.<br>' +
      '• <strong>CO₂-Rückatmung:</strong> Die Maske erhöht CO₂-Rückatmung → Kopfschmerzen, Schwindel, in seltenen Fällen Ohnmacht.',
    timing: '<strong>Was stattdessen:</strong><br><br>' +
      '• <strong>IMT (PowerBreathe):</strong> 2×30 Atemzüge pro Tag, 30 Watt aufwärts. Evidenzbasiert, boxspezifisch, dauert 5 Minuten.<br>' +
      '• <strong>Echtes Höhentraining:</strong> Nur im Höhenlager (>2000m) oder mit Hypoxie-Zelt. Für die meisten Amateur-Boxer nicht praktikabel – und nicht nötig.',
    warn: '<strong>Fazit:</strong><br><br>' +
      '• Altitude Mask = Marketingprodukt ohne wissenschaftliche Basis.<br>' +
      '• Geld sparen und in ein PowerBreathe K5 oder ähnliches IMT-Gerät investieren.<br>' +
      '• Das Tragen einer Maske beim Training mag „hardcore" aussehen – bringt aber nichts.',
    studies: 'Porcari et al. 2016 (keine Höhenanpassung), Granados et al. 2016, HajGhanbari et al. 2013 (IMT > Maske)'
  },
  {
    id: 'jaw-trainer', name: 'Jaw Trainer / Kiefer-Trainer', category: 'SKIP',
    dose: '–', stars: 1, color: 'var(--red)',
    short: 'Null Evidenz für KO-Schutz. TMJ-Risiko.',
    img: "",
    what: 'Jaw Trainer (Jawline-Exerciser, Jawzrsize etc.) sind Silikonbälle oder Federn, auf denen man kaut, um die Kiefermuskulatur zu trainieren. Im Boxer-Kontext werden sie oft als „KO-Schutz" vermarktet – die Behauptung: ein stärkerer Kiefer = weniger KOs.',
    boxing: '<strong>Warum das kompletter Unsinn ist:</strong><br><br>' +
      '• <strong>KO-Mechanismus ist NICHT der Kiefer:</strong> Ein KO entsteht durch Rotation des Gehirns im Schädel. Der Kiefer ist nur der Hebel, über den die Kraft übertragen wird. Kiefermuskeln können diese Rotationskraft nicht absorbieren.<br>' +
      '• <strong>Was wirklich vor KO schützt:</strong> NACKENMUSKULATUR. Ein starker Nacken reduziert die Kopf-Beschleunigung nach einem Treffer. Deshalb trainiert der Wochenplan gezielt Nacken-Isometrie.<br>' +
      '• <strong>TMJ-Risiko (Kiefergelenk-Dysfunktion):</strong> Exzessives Kiefertraining kann das Kiefergelenk überlasten → chronische Schmerzen, Knacken, Bewegungseinschränkung. TMJ ist schwer behandelbar.<br>' +
      '• <strong>Masseter-Hypertrophie:</strong> Der Kaumuskel wird größer → breiteres Gesicht. Rein kosmetisch, null funktioneller Vorteil für Boxing.<br>' +
      '• <strong>Null Studien:</strong> Es existiert keine einzige Studie, die einen KO-schützenden Effekt von Kiefertraining zeigt.',
    timing: '<strong>Was stattdessen:</strong><br><br>' +
      '• <strong>Nackentraining:</strong> Isometrie 3×8 Sek. je Richtung (vorne, hinten, links, rechts). Neck Curls, Neck Extensions mit Gewicht. 4× pro Woche. Nackenumfang 42–46 cm anstreben.<br>' +
      '• <strong>Mundschutz:</strong> Ein guter, angepasster Mundschutz (beim Zahnarzt anfertigen lassen) schützt Kiefer und Zähne 100× besser als jedes Kiefertraining.<br>' +
      '• <strong>Defensive Technik:</strong> Kinn runter, Schulter hoch, Hände oben. Das schützt vor KO – nicht Kaumuskeln.',
    warn: '<strong>Fazit:</strong><br><br>' +
      '• Jaw Trainer = Instagram-Marketing, keine Wissenschaft.<br>' +
      '• Kann dem Kiefergelenk aktiv schaden.<br>' +
      '• Investiere die Zeit in Nackentraining – das hat echte Evidenz.',
    studies: 'Eckner et al. 2014 (Nacken vs. Kopfbeschleunigung), Viano et al. 2005 (KO-Biomechanik), keine Studien pro Jaw Trainer'
  }
];

function renderSupplementsPage() {
  const el = document.getElementById('page-supplements');

  const priColor = { PFLICHT:'var(--green)', EMPFOHLEN:'var(--gold)', WETTKAMPF:'var(--gold)', 'MIT TIMING':'var(--gold)', SCHLAF:'var(--blue)', OPTIONAL:'var(--blue)', SKIP:'var(--red)' };

  el.innerHTML = `
  <div class="page-header">
    <div class="page-title">SUPPLE<span>MENTS</span></div>
    <div class="page-sub">Nur Supplements mit Evidenz. Alle NADA/WADA-konform – vor Kauf via nada.de verifizieren.</div>
  </div>

  <div class="info-box info-warn"><span>!</span><div><strong>Priorität:</strong> 1. Schlaf → 2. Ernährung → 3. Training → 4. erst dann Supplements. Keine Ergänzung kompensiert Defizite in den ersten drei.</div></div>

  <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
  <table class="data-table" style="margin-bottom:32px;">
    <thead><tr><th>Supplement</th><th>Dosis & Timing</th><th>Wirkung für Boxer</th><th>Evidenz</th><th>Priorität</th></tr></thead>
    <tbody>
      ${supplementsData.map(s => {
        const pc = priColor[s.category] || '#555';
        const isSkip = s.category === 'SKIP';
        return `<tr>
          <td${isSkip ? ' style="color:var(--red)"' : ''}>${isSkip ? '❌ ' : ''}<a href="#" onclick="event.preventDefault();openSupplementDetail('${s.id}')" style="color:${isSkip ? 'var(--red)' : 'var(--white)'};text-decoration:underline;text-underline-offset:3px;cursor:pointer;">${s.name}</a></td>
          <td>${s.dose}</td>
          <td>${s.short}</td>
          <td style="color:${s.stars >= 4 ? 'var(--green)' : s.stars >= 3 ? 'var(--gold)' : '#333'};">${'★'.repeat(s.stars)}${'☆'.repeat(5 - s.stars)}</td>
          <td style="color:${pc};font-weight:700">${s.category}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  </div>

  <div class="info-box info-tip"><span>*</span><div><strong>Kreatin + Wettkampf:</strong> 1–2 kg Wassereinlagerung. 4–6 Wochen vor Wiegen pausieren. Kraftgewinn bleibt mehrere Wochen erhalten.</div></div>`;
}

function openSupplementDetail(id) {
  const s = supplementsData.find(x => x.id === id);
  if (!s) return;
  const el = document.getElementById('page-supplement-detail');

  const isSkip = s.category === 'SKIP';
  const headerColor = isSkip ? 'var(--red)' : s.color;

  const imgHTML = s.img ? `
    <div class="supp-sidebar">
      <div class="supp-sidebar-img">
        <img src="${s.img}" alt="${s.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=\\'height:100%;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:28px;color:#222;letter-spacing:3px;\\'>${s.name.split(' ')[0].toUpperCase()}</div>'">
      </div>
      <div class="supp-sidebar-meta">
        <div style="font-family:'Space Mono',monospace;font-size:11px;color:#333;letter-spacing:2px;margin-bottom:8px;">STECKBRIEF</div>
        <div class="supp-sidebar-row"><span>Kategorie</span><span style="color:${headerColor};">${s.category}</span></div>
        <div class="supp-sidebar-row"><span>Evidenz</span><span style="color:var(--gold);">${'★'.repeat(s.stars)}${'☆'.repeat(5 - s.stars)}</span></div>
        ${!isSkip ? `<div class="supp-sidebar-row"><span>Dosis</span><span>${s.dose}</span></div>` : ''}
        ${!isSkip ? `<div class="supp-sidebar-row"><span>Form</span><span>${s.id === 'kreatin' || s.id === 'beta-alanin' ? 'Pulver' : s.id === 'rote-beete' ? 'Shot / Saft' : s.id === 'koffein' ? 'Tablette / Kaffee' : 'Kapseln'}</span></div>` : ''}
        <div class="supp-sidebar-row"><span>NADA</span><span style="color:var(--green);">Konform</span></div>
      </div>
    </div>` : '';

  el.innerHTML = `
    <button class="back-link" onclick="showPage('supplements')">← Alle Supplements</button>

    <article class="supp-article">
      <header class="supp-article-header">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px;flex-wrap:wrap;">
          <span style="font-family:'Space Mono',monospace;font-size:12px;letter-spacing:2px;color:${headerColor};border:1px solid ${headerColor}40;padding:3px 12px;border-radius:3px;">${s.category}</span>
          <span style="color:var(--gold);font-size:12px;letter-spacing:1px;">${'★'.repeat(s.stars)}${'☆'.repeat(5 - s.stars)}</span>
        </div>
        <h1 style="font-family:'Bebas Neue',sans-serif;font-size:42px;letter-spacing:2px;color:var(--white);line-height:1.1;">${s.name}</h1>
        ${!isSkip ? `<div style="font-family:'Space Mono',monospace;font-size:12px;color:#555;margin-top:8px;">${s.dose}</div>` : ''}
      </header>

      <div class="supp-article-layout">
        <div class="supp-article-body">
          <p style="font-size:15px;color:#aaa;line-height:1.85;margin-bottom:40px;">${s.what}</p>

          <h2 class="supp-h2" style="color:${headerColor};">${isSkip ? 'Warum nicht' : 'Boxspezifischer Nutzen'}</h2>
          <div class="supp-text">${s.boxing}</div>

          <h2 class="supp-h2">${isSkip ? 'Bessere Alternative' : 'Dosierung & Timing'}</h2>
          <div class="supp-text">${s.timing}</div>

          <div class="supp-warn-block">
            <h2 class="supp-h2" style="color:var(--orange);border:none;padding-top:0;">Hinweise & Warnungen</h2>
            <div class="supp-text">${s.warn}</div>
          </div>

          <div style="padding-top:24px;border-top:1px solid #151515;">
            <div style="font-family:'Space Mono',monospace;font-size:11px;color:#333;letter-spacing:2px;margin-bottom:8px;">QUELLEN</div>
            <div style="font-size:11px;color:#444;line-height:1.7;">${s.studies}</div>
          </div>
        </div>

        ${imgHTML}
      </div>
    </article>
  `;

  showPage('supplement-detail');
}

// ===== MENTAL =====
function renderMentalPage() {
  const el = document.getElementById('page-mental');

  const MENTAL_SECTIONS = [
    { id:'alter-ego', num:'01', title:'ALTER EGO', sub:'Deine Kampf-Identität', color:'var(--red)', icon:'🎭',
      intro:'Das Alter-Ego-Konzept (Todd Herman, „The Alter Ego Effect") ist eines der wirksamsten mentalen Werkzeuge im Kampfsport. Beyoncé wird zu „Sasha Fierce" bevor sie auf die Bühne geht. Kobe Bryant wurde zu „Black Mamba" – kaltblütig, emotionslos, tödlich effizient. Mike Tyson war im Alltag schüchtern und unsicher – aber als „Iron Mike" betrat er den Ring mit der Überzeugung, unzerstörbar zu sein. <strong>Du erschaffst eine bewusste Kampf-Version von dir selbst</strong> – mit Eigenschaften, die du im Ring brauchst, aber im Alltag vielleicht nicht zeigst.<br><br><strong>Warum funktioniert das?</strong> Psychologische Distanzierung (Kross et al. 2014): Wenn du in der 3. Person über dich sprichst oder eine andere Identität annimmst, reduziert dein Gehirn die emotionale Reaktivität um ~30%. Du trennst dein verletzliches Alltags-Ich von deinem furchtlosen Ring-Ich. Angst, Selbstzweifel und Nervosität gehören zu „dir" – nicht zu deinem Alter Ego.',
      why:'Reale Beispiele: Deontay Wilder zieht sein Kostüm an und wird zum „Bronze Bomber" – die theatralische Verwandlung IST der psychologische Switch. Oleksandr Usyk meditiert und wird ruhig wie ein Mönch, aber im Ring verwandelt er sich in einen aggressiven Druck-Boxer. Vasyl Lomachenko tanzt vor dem Kampf – das ist sein Totem, sein Übergang in den „Matrix"-Modus wo er Schläge sieht bevor sie kommen.',
      steps:[
        {t:'Schritt 1 – Schwächen-Audit', d:'Schreib 3 Dinge auf, die dich im Ring limitieren. Angst vor Treffern? Zu passiv? Keine Killer-Instinkt? Wirst du nervös wenn der Gegner aggressiv wird? Dein Alter Ego ist die ANTWORT auf diese Schwächen – es hat genau die Eigenschaften die dir fehlen.'},
        {t:'Schritt 2 – Eigenschaften wählen', d:'Wähle 3–5 Kernwörter die dein Alter Ego beschreiben. Nicht generisch („stark") sondern spezifisch und emotional. Beispiele: „Eiskalt unter Druck", „Explosiv wie ein Raubtier", „Unendliche Geduld – wartet auf den perfekten Moment", „Genießt den Schmerz", „Furchtlos im Nahkampf". Schreib die Wörter auf einen Zettel und häng ihn an deinen Spiegel.'},
        {t:'Schritt 3 – Namen geben', d:'Der Name muss DICH triggern – niemand sonst muss ihn verstehen. Kann ein Tier sein (Iron Wolf, Black Cobra), ein Titel (The Machine, El Diablo), ein Charakter (Spartan, Ronin), oder ein verdrehter eigener Name. Test: Wenn du den Namen laut aussprichst und dabei NICHTS fühlst → anderer Name. Du musst eine körperliche Reaktion spüren – Gänsehaut, Anspannung, Energie.'},
        {t:'Schritt 4 – Totem wählen', d:'Ein physischer Gegenstand oder eine Handlung die den Switch auslöst. Tyson biss auf seinen Mundschutz und wurde zu Iron Mike. Wilder setzte seine Maske auf. Lomachenko dreht seinen Ring. DEIN Totem: Mundschutz einsetzen, Kapuze aufziehen, Handschuhe anziehen, Bandagen wickeln – wähle EINE Handlung die du VOR JEDEM Sparring und Kampf machst. Ab jetzt ist diese Handlung dein An/Aus-Schalter.'},
        {t:'Schritt 5 – Origin Story schreiben', d:'Dein Alter Ego braucht eine Hintergrundgeschichte – 5–10 Sätze reichen. Beispiel: „Iron Wolf wurde in der Kälte geboren. Aufgewachsen in einem Rudel das nie aufgibt. Er kennt keinen Schmerz, nur den Instinkt zu jagen. Jeder Gegner ist Beute. Er wird nicht müde – er wird hungriger. Wenn er getroffen wird, lacht er. Der Wolf stirbt kämpfend, niemals fliehend." – Klingt übertrieben? Genau das ist der Punkt. Je dramatischer und emotionaler, desto stärker der psychologische Effekt.'},
        {t:'Schritt 6 – Switch trainieren', d:'Wie jede Technik muss der Switch geübt werden. Protokoll: (1) Vor jedem Training 30 Sek. Augen zu, Origin Story im Kopf durchgehen. (2) Totem-Handlung ausführen. (3) In 3. Person sagen: „[Name] betritt den Ring. [Name] ist bereit." (4) Training beginnen. (5) NACH dem Training: Totem ablegen, bewusst zurück ins Alltags-Ich. Der Wechsel in BEIDE Richtungen ist wichtig – du willst nicht 24/7 in deinem Alter Ego leben.'},
        {t:'Schritt 7 – Verfeinerung', d:'Nach 2–3 Wochen: Was funktioniert? Passt der Name noch? Sind die Eigenschaften die richtigen? Dein Alter Ego darf sich entwickeln. Schreib nach jedem Sparring 1 Satz: „Heute war [Name]..." und beende den Satz ehrlich. So trackst du ob die Identität stärker wird.'}
      ]},
    { id:'resilienz', num:'02', title:'RESILIENZ', sub:'Nach Treffern zurückkommen', color:'var(--orange)', icon:'🔥',
      intro:'Der entscheidende Moment in vielen Kämpfen: Du wirst hart getroffen, gehst womöglich auf die Bretter. <strong>Was jetzt passiert, entscheidet den Kampf.</strong> Resilienz ist keine Eigenschaft, die du hast oder nicht – sie wird systematisch aufgebaut. Lennox Lewis wurde von Oliver McCall und Hasim Rahman KO geschlagen – und kam beide Male zurück und gewann den Rückkampf. Muhammad Ali lag gegen Joe Frazier auf den Brettern und stand auf. Der Unterschied: Diese Boxer hatten einen trainierten mentalen Prozess für genau diese Momente.',
      why:'Progressive Desensitisierung: Du gewöhnst dich schrittweise an Drucksituationen, damit dein Kopf im Kampf nicht zum ersten Mal damit konfrontiert wird. Neurowissenschaftlich: Dein Amygdala (Angst-Zentrum) reagiert weniger stark auf bekannte Stressoren. Je öfter du kontrollierten Druck erlebst, desto ruhiger bleibst du wenn es zählt.',
      steps:[
        {t:'Stufe 1 – Druck aushalten', d:'Leichtes Sparring mit überlegenem Partner. Fokus: Nicht gewinnen, sondern ruhig bleiben, Grundstellung halten, atmen. Konkret zum Trainer sagen: „Ich will 3 Runden mit jemandem der besser ist als ich. Mein Ziel ist nicht zu gewinnen – ich will meine Deckung halten und nicht in Panik verfallen." Nach jeder Runde: Auf einer Skala 1–10, wie ruhig warst du? Ziel: 7+ nach 4 Wochen.'},
        {t:'Stufe 2 – Schmerztoleranz', d:'Sparring mit Body Shots erlaubt, mittlere Intensität. Lerne, nach einem Treffer weiterzumachen statt zu erstarren. Die natürliche Reaktion auf Schmerz ist Freeze – das musst du überschreiben. Drill: Partner schlägt 3× auf Körper → du antwortest SOFORT mit Kombi. Nicht erst erholen, sofort antworten. Das trainiert die neuronale Verbindung: Treffer = sofortige Aktion statt Freeze.'},
        {t:'Stufe 3 – Clutch-Performance', d:'Situationssparring mit Szenarien. Trainer sagt vor der Runde: „Du bist 2 Runden hinten, letzte Runde. Du musst jetzt alles geben." Oder: „Du wurdest gerade angezählt, es sind noch 90 Sekunden." Oder: „Dein Gegner ist müde – jetzt Druck machen." Das trainiert Entscheidungsfähigkeit unter maximalem Ergebnis-Druck. 1× pro Woche mindestens.'},
        {t:'Stufe 4 – Erschöpfungs-Entscheidungen', d:'Sparring NACH hartem Conditioning (z.B. nach 10 Runden Sandsack oder 20 Min. HIIT). Dein Körper ist am Limit – jetzt muss dein Kopf übernehmen. Genau das passiert in Runde 3 eines harten Kampfes. Wenn du lernst, erschöpft saubere Entscheidungen zu treffen, hast du einen massiven Vorteil über Gegner die das nie trainieren.'},
        {t:'Recovery-Protokoll (im Kampf anwenden)', d:'Du wirst hart getroffen. Sofort-Protokoll: (1) Clinchen ODER 2 Schritte zurück – Distanz schaffen. (2) Box-Breathing: 1 Zyklus (4 Sek. ein, 4 Sek. aus) – reicht um den Puls 5–10 bpm zu senken. (3) Alter-Ego-Trigger: Auf Mundschutz beißen, Schultern zurück. (4) Jab ausstrecken – eine physische Handlung bricht die mentale Blockade. Danach: Zurück zum Gameplan. Nicht wild zurückschlagen – das ist der häufigste Fehler nach einem harten Treffer.'},
        {t:'Langzeit-Resilienz aufbauen', d:'Führe ein „Widrigkeits-Journal": Nach jedem Training/Sparring 1 Satz zu: „Was war heute schwer und wie habe ich reagiert?" Nach 3 Monaten hast du eine Sammlung von Momenten wo du Druck überstanden hast. Lies sie vor einem Kampf – konkreter Beweis dass du Druck kannst.'}
      ]},
    { id:'visualisierung', num:'03', title:'VISUALISIERUNG', sub:'Motorisches Cortex-Training ohne Ring', color:'var(--purple)', icon:'👁️',
      intro:'Wenn du dir vorstellst, einen Cross zu schlagen, feuern <strong>dieselben motorischen Nervenbahnen</strong> wie beim echten Schlag (fMRI-belegt, ~30% der echten Aktivierung). Das PETTLEP-Modell (Holmes & Collins 2001) zeigt: <strong>+12–16% motorische Leistung</strong> durch strukturierte Visualisierung. Usyk visualisiert jeden Kampf dutzende Male bevor er stattfindet. Er sagt in Interviews: „Ich habe den Kampf schon gewonnen bevor ich den Ring betrete – in meinem Kopf."<br><br>Wichtig: Nicht einfach „an den Kampf denken". Es gibt 3 spezifische Arten die unterschiedliche Zwecke erfüllen, und die Qualität der Visualisierung macht den Unterschied.',
      why:'PETTLEP steht für: Physical (gleiche Position wie im Ring), Environment (stell dir die Halle vor), Task (echte Technik, nicht Fantasie), Timing (echtes Tempo), Learning (wird besser mit Übung), Emotion (fühle die Aufregung), Perspective (Ich-Perspektive bevorzugt). Je mehr dieser 7 Elemente du einbaust, desto wirksamer.',
      steps:[
        {t:'Technik-Visualisierung (3 Min.)', d:'Setz dich hin oder leg dich hin. Augen zu. Stell dir vor du stehst im Ring – DEIN Ring, DEIN Gym. Fühle den Boden unter deinen Füßen, rieche die Halle. Jetzt: Jab-Cross. Fühle wie dein linker Fuß sich dreht, die Schulter rotiert, die Faust den Kontakt macht. Höre das Geräusch. Zurück in die Deckung. Jetzt: Jab-Cross-Left Hook. In echtem Tempo, nicht Zeitlupe. 5–8 Wiederholungen pro Kombi. Dann nächste Kombi.'},
        {t:'Gegner-Visualisierung (2 Min.)', d:'Studiere deinen Gegner vorher per Video (oder stelle dir einen typischen Gegner-Typ vor). Visualisiere seine Muster: „Er kommt immer mit dem rechten Cross nach vorne. Ich sehe es kommen → Slip nach links → linker Haken zum Körper → rechter Uppercut." Mache das 5× hintereinander. Variiere: „Er geht auf Distanz und jabt → ich mache Druck, double Jab → rechter Cross wenn er zurückgeht." Je spezifischer desto besser.'},
        {t:'Krisen-Visualisierung (2 Min.)', d:'DER WICHTIGSTE TYP – den die meisten weglassen. Visualisiere: Du wirst hart getroffen. Alles wackelt. Dein Alter Ego übernimmt. Clinch → atmen → Jab raus → zurück im Kampf. Visualisiere: Du liegst auf den Brettern. Der Ref zählt. Du stehst bei 6 auf. Deckung prüfen, nicken, weiterkämpfen. Wer Niederlagen nur im Ring zum ersten Mal erlebt, bricht. Wer sie 50× im Kopf durchgespielt hat, hat einen Plan.'},
        {t:'Komplett-Protokoll (7 Min. vor dem Schlafen)', d:'Position: Liegen oder sitzen, Augen zu, ruhiger Raum. Minute 1–3: Technik-Visu (3 Lieblingskombi). Minute 3–5: Gegner-Visu (seine Muster, deine Antworten). Minute 5–7: Krisen-Visu (hart getroffen werden + zurückkommen). WICHTIG: Jede Session endet POSITIV – visualisiere wie der Ref deinen Arm hebt. Dein Gehirn kann nicht unterscheiden ob etwas wirklich passiert ist – also lass es glauben dass du gewinnst.'},
        {t:'Häufige Fehler', d:'(1) Zu allgemein: „Ich stelle mir vor wie ich gewinne" bringt wenig. Spezifisch: „Jab-Cross wenn er den Kopf senkt nach dem Jab." (2) Zu schnell: Nimm dir wirklich 7 Min., nicht 30 Sekunden. (3) Nicht regelmäßig: 1× vor dem Kampf bringt fast nichts. 7× pro Woche über 4 Wochen → messbare Effekte. (4) Keine Emotionen: Wenn du dabei nichts fühlst, ist die Visu zu abstrakt. Fühle die Nervosität, die Aggression, den Stolz.'}
      ]},
    { id:'arousal', num:'04', title:'AROUSAL-KONTROLLE', sub:'Das optimale Aktivierungsfenster', color:'var(--blue)', icon:'🎛️',
      intro:'Dein Arousal-Level (psychophysischer Erregungszustand) muss im optimalen Fenster sein: <strong>Zu niedrig → träge, kein Biss, langsame Reaktionen. Zu hoch → verkrampft, Tunnelblick, taktische Fehler, Überreaktionen.</strong> Die Yerkes-Dodson-Kurve (1908) zeigt: Komplexe Aufgaben wie Boxen brauchen mittleres bis hohes Arousal – aber nicht maximales. Ein wütender Boxer macht Fehler. Ein zu ruhiger Boxer hat keinen Biss.<br><br>~70% aller Boxer berichten von signifikanter Vor-Kampf-Angst. Das ist normal und sogar gut – Adrenalin macht dich schneller, stärker und schmerzresistenter. Das Problem ist nur, wenn es dich lähmt oder du die Kontrolle verlierst.',
      why:'Erkenne deinen Typ: Bist du vor Kämpfen eher ZU nervös (Herz rast, Hände zittern, kannst nicht stillsitzen, Übelkeit) → du brauchst Runterfahren-Techniken. Bist du eher ZU ruhig (antriebslos, „egal"-Gefühl, keine Energie) → du brauchst Hochfahren-Techniken. Die meisten Boxer sind zu nervös – aber manche brauchen den Kick.',
      steps:[
        {t:'Runterfahren – Box-Breathing (Haupttechnik)', d:'4 Sek. einatmen (durch Nase) → 4 Sek. halten → 4 Sek. ausatmen (durch Mund) → 4 Sek. halten. Das ist NICHT einfach „tief atmen". Das gleichmäßige Halten aktiviert den Vagusnerv → parasympathisches Nervensystem → senkt Herzfrequenz um 10–15 bpm in 90 Sekunden. Navy SEALs nutzen exakt diese Technik vor Einsätzen. 3–4 Zyklen reichen. Übe es TÄGLICH damit es automatisch wird – nicht erst am Kampftag zum ersten Mal.'},
        {t:'Runterfahren – Körper-Hacks', d:'(1) Physiologisches Seufzen (Andrew Huberman): Doppelter kurzer Einatem durch Nase → langer Ausatem durch Mund. Schnellste bekannte Methode um akuten Stress zu senken. (2) Kaltes Wasser im Gesicht (Tauchreflex): Aktiviert den Vagusnerv sofort. Nasses Handtuch auf Stirn und Wangen. (3) Progressive Muskelentspannung: Fäuste 5 Sek. maximal anspannen → 10 Sek. bewusst lösen. Dann Schultern. Dann Kiefer. Anspannung-Lösen-Kontrast zeigt dem Körper: „Du bist sicher." (4) Wann: 30–60 Min. vor dem Kampf. NICHT direkt vorher – dann willst du Energie.'},
        {t:'Hochfahren – Körper aktivieren', d:'(1) Schnelles Einatmen durch Nase, 10–15 Sek. (Wim-Hof-Stil, aber kurz). (2) Explosive Bewegungen: 10 Jump Squats, 10 Burpees, schnelles Schattenboxen 30 Sek. (3) Leichte Slaps auf Oberschenkel/Brust – physische Stimulation. (4) Power-Pose: 30 Sek. breitbeinig stehen, Brust raus, Fäuste geballt. Carney et al. (2010): Erhöht Testosteron, senkt Cortisol. (5) Wann: 10–15 Min. vor dem Ring, NACH dem PAPE Warm-Up.'},
        {t:'Hochfahren – Mental aktivieren', d:'(1) Musik: Playlist mit Songs die dich aggressiv/energetisch machen. 130+ BPM. Kopfhörer auf, Augen zu, 3–5 Min. (2) Aggressives Self-Talk: „Ich bin [Alter Ego]. Niemand kann mich stoppen. Ich bin hier um zu zerstören." LAUT oder flüsternd. (3) Alter-Ego-Activation: Totem anlegen. Origin Story 10 Sek. im Kopf. Switch. (4) Erinnerung an bestes Sparring/besten Kampf: Ruf das Gefühl ab wie es war als du dominant warst. DIESES Gefühl brauchst du jetzt.'},
        {t:'Angst umdeuten (Reappraisal)', d:'Die körperlichen Symptome von Angst und Aufregung sind IDENTISCH: Herzklopfen, Schwitzen, Schmetterlinge im Bauch, Tunnelblick. Der einzige Unterschied ist deine INTERPRETATION. „Ich bin nicht nervös – mein Körper bereitet sich auf Höchstleistung vor." „Mein Herz rast weil es mehr Blut in die Muskeln pumpt." „Die Schmetterlinge sind Adrenalin – das macht mich schneller." Das ist keine Selbsttäuschung – es ist physiologisch korrekt. Akzeptiere: JEDER Boxer hat Angst. Tyson hat gesagt er hatte vor jedem Kampf panische Angst. Mut ist nicht Angstfreiheit – Mut ist Handeln trotz Angst.'}
      ]},
    { id:'self-talk', num:'05', title:'SELF-TALK & TRIGGER-WÖRTER', sub:'Dein innerer Dialog bestimmt die Performance', color:'var(--gold)', icon:'💬',
      intro:'<strong>Instruktionale</strong> Selbstgespräche („Hände hoch, Jab raus") verbessern Technik und Fokus. <strong>Motivationale</strong> („Ich bin bereit, ich bin stärker") verbessern Ausdauer um bis zu <strong>18%</strong> (Blanchfield et al. 2014). Meta-Analyse Hatzigeorgiadis et al. (2011) über 32 Studien: Effektstärke d=0.48 – das ist ein GROSSER Effekt. Zum Vergleich: Das ist mehr als die meisten legalen Supplements bringen.<br><br>Das Problem: Im Kampf läuft dein innerer Dialog automatisch. Wenn du ihn nicht trainierst, übernimmt die Default-Stimme – und die sagt Dinge wie „Das tut weh", „Ich bin müde", „Er ist besser als ich." Diese Stimme musst du VORHER überschreiben.',
      why:'Lomachenko spricht im Kampf ständig mit sich selbst – kurze, technische Anweisungen. Canelo Alvarez hat in einem Interview gesagt: „Ich sage mir in jeder Runde was ich als nächstes machen muss." Das ist trainierter Self-Talk in Aktion.',
      steps:[
        {t:'3 Trigger-Wörter wählen', d:'Du brauchst genau 3 – eines für jede Situation: (1) TECHNIK-Wort: Kurz, beschreibt was du tun sollst. Beispiele: „Snap" (schneller Jab), „Rotate" (Hüfte drehen), „Level" (Ebene wechseln), „Distanz" (Abstand halten). (2) MOTIVATIONS-Wort: Gibt dir Energie. Beispiele: „Maschine", „Unaufhaltbar", „Warrior", der Name deines Alter Egos. (3) KRISEN-Wort: Für den Moment nach einem harten Treffer. Beispiele: „Atmen-Jab-Bewegen" (3er-Sequenz), „Reset", „Zurück zum Plan". Schreib sie auf Tape und kleb sie auf deine Wasserflasche.'},
        {t:'In 3. Person formulieren', d:'„[Alter Ego Name] gibt nicht auf" statt „Ich gebe nicht auf." Kross et al. (2014, University of Michigan): Selbstgespräch in 3. Person reduziert emotionale Reaktivität signifikant – du betrachtest die Situation von außen statt drin zu stecken. Praktisch: „Iron Wolf ist müde aber Iron Wolf gibt NIEMALS auf." „Black Mamba sieht den Konter kommen." „[Dein Name] kontrolliert die Ringmitte."'},
        {t:'Situationen zuordnen (Cheat Sheet)', d:'Schreib dir diese Liste und trainiere sie: VOR dem Kampf: „Ich habe trainiert. Ich bin bereit. [Alter Ego] übernimmt." ERSTE RUNDE: „Jab. Distanz. Rhythmus." GEGNER DRÜCKT: „Atmen. Jab. Bewegen. Jab." NACH TREFFER: „Egal. Passiert. Zurück zum Plan." RÜCKSTAND: „Drück ihn. Ringmitte. Volumen." LETZTE RUNDE: Mantra (siehe unten). NACH DEM KAMPF: „Was auch immer passiert – ich bin stolz dass ich da war."'},
        {t:'Im Training üben – LAUT', d:'Self-Talk beim Shadow Boxing und Pratzenarbeit LAUT oder flüsternd mitsprechen. Nicht nur im Kopf – dein Mund muss die Wörter formen. Warum? Der motorische Akt des Sprechens aktiviert stärkere neuronale Bahnen als nur Denken. Praktisch: Jab werfen → „Snap" sagen. Nach jedem Treffer am Sandsack → „Reset" sagen. Nach jeder Runde Sparring → „Was lief gut?" laut beantworten. Muss Gewohnheit werden BEVOR es im Kampf funktioniert.'},
        {t:'Letzte-Runde-Mantra', d:'Einen EINZIGEN Satz für die letzte Runde oder die letzten 60 Sekunden. Beispiele: „Das ist meine Runde. Jetzt alles." / „Du hast 3 Minuten. 3 Minuten. Das schaffst du." / „[Alter Ego] wurde für diesen Moment geboren." Immer DERSELBE Satz. Pavlov-Effekt: Nach 20× Üben triggert der Satz automatisch maximale Intensität. Übe ihn bei den letzten 60 Sek. jeder Trainingsrunde.'}
      ]},
    { id:'corner', num:'06', title:'CORNER-KOMMUNIKATION', sub:'60 Sekunden taktisches Gehirn', color:'var(--green)', icon:'🗣️',
      intro:'Die Ecke ist dein taktisches Gehirn zwischen den Runden. Effektive Corner-Kommunikation ist eine <strong>trainierbare Fähigkeit</strong> – für Boxer UND Trainer. Die meisten Amateure verschwenden die Rundenpause mit zu vielen Informationen oder emotionalem Geschrei. Freddie Roach (Trainer von Pacquiao) gibt zwischen den Runden max. 2 Anweisungen – extrem kurz, extrem klar. Teddy Atlas (Trainer von Timothy Bradley) ist bekannt für emotionale Motivation – aber auch er reduziert die taktische Info auf das Minimum.',
      why:'Neurowissenschaft: Ein Boxer unter Stress kann max. 2–3 Anweisungen aufnehmen. Alles darüber = Rauschen. Der Puls ist bei 160–180 bpm, die kognitive Kapazität ist massiv eingeschränkt. 10 Anweisungen schreien = 0 Anweisungen ankommen.',
      steps:[
        {t:'60-Sekunden-Struktur', d:'Sek. 0–10: NICHTS sagen. Boxer setzt sich, Mundschutz raus, Wasser, 3 tiefe Atemzüge. Trainer beobachtet Gesicht und Körpersprache. Sek. 10–40: Max. 2–3 KURZE klare Anweisungen. Nicht: „Du musst mehr Druck machen und den Jab besser timen und die Deckung oben halten." Sondern: „Doppel-Jab. Dann rechts." PUNKT. Sek. 40–55: Box-Breathing zusammen. „Atme mit mir. 4 ein... 4 aus..." Sek. 55–60: Mundschutz rein → Aufstehen → „Du bist besser als er. Jetzt zeig es."'},
        {t:'Codewörter vereinbaren', d:'Vereinbare VOR dem Kampf 5–8 Codewörter mit deinem Trainer: „Marsch" = nach vorne drücken, Ringmitte nehmen. „Box" = Außendistanz halten, jabn, nicht reinlaufen. „Links" = Fokus auf linke Hand, Haken suchen. „Körper" = Ebene wechseln, Körpertreffer setzen. „Tempo" = Schlagfrequenz erhöhen. „Geduld" = Kontern statt angreifen. „Reset" = Alles vergessen, zurück zu Grundlagen. Übe diese im Sparring – Trainer ruft Codewort, Boxer setzt sofort um.'},
        {t:'Emotionale Regulation durch den Trainer', d:'Der Trainer muss den emotionalen Zustand des Boxers LESEN und darauf reagieren: (1) Boxer ZU NERVÖS (weite Augen, schnelle Atmung, steifer Körper): Ruhige, tiefe Stimme. „Alles gut. Du bist vorbereitet. Atme. Du weißt was du tun musst." (2) Boxer ZU PASSIV (leerer Blick, keine Energie, „egal"-Stimmung): Laut, direkt, aktivierend. „HEY! Aufwachen! Du lässt ihn gewinnen! 3 Minuten. JETZT!" (3) Boxer WÜTEND/UNKONTROLLIERT: „STOP. Denk nach. Er provoziert dich. Jab. Distanz. Kopf einschalten."'},
        {t:'Im Sparring üben', d:'Mindestens 1× pro Woche Sparring mit bewusster Corner-Arbeit: Trainer gibt zwischen jeder Runde max. 2 taktische Anpassungen → Boxer muss sie SOFORT in der nächsten Runde umsetzen. Trainer bewertet nach der Runde: Wurde die Anweisung umgesetzt? Ja/Nein? Das trainiert die Fähigkeit, unter Druck Input zu verarbeiten. Ohne Übung im Sparring funktioniert es im Kampf nicht.'},
        {t:'Als Boxer: Aktiv zuhören', d:'DEINE Verantwortung in der Pause: Nicht in Gedanken versinken. Nicht an den letzten Treffer denken. Augenkontakt zum Trainer. Nicken = „Ich habe verstanden." Wenn du etwas nicht verstehst → FRAG NACH. „Was soll ich links machen?" ist besser als raten. 60 Sekunden sind extrem kurz – verschwende sie nicht mit innerem Drama. Tipp: Trainiere im Sparring bewusst nach jeder Runde SOFORT zum Trainer zu schauen und zuzuhören, auch wenn du erschöpft bist.'}
      ]},
    { id:'niederlage', num:'07', title:'NACH EINER NIEDERLAGE', sub:'Verlieren ist Training – wenn du es richtig machst', color:'var(--red)', icon:'📉',
      intro:'<strong>Jeder verliert. Die Frage ist nur: Was nimmst du mit?</strong> Floyd Mayweather verlor als Amateur. Lomachenko verlor seinen 2. Profikampf. Usyk wurde als Amateur geschlagen. Die gefährlichste Phase ist nicht die Niederlage selbst – es ist die Zeit danach, wenn die mentale Hürde für den nächsten Kampf wächst und du anfängst, Sparring oder Kämpfe zu vermeiden.',
      why:'Psychologisch: Je länger du nach einer Niederlage wartest, desto größer wird die mentale Blockade. Das Gehirn verallgemeinert: „Ring = Schmerz/Niederlage = vermeiden." Ohne strukturierten Prozess wird aus einem Verlust eine Karriere-Blockade. MIT Prozess wird aus jedem Verlust ein Wachstums-Schub.',
      steps:[
        {t:'Erste 24 Stunden – Emotion zulassen', d:'Frust, Trauer, Wut – alles ist OK und gesund. NICHT unterdrücken. Aber auch nicht in Social Media darüber posten oder mit jedem darüber reden. Regel: 1 Vertrauensperson (Partner, bester Freund, Familie) – KEIN Trainer, KEIN Boxkollege. In den ersten 24h geht es um Emotion, nicht Analyse. Körperlich: Schlaf, gutes Essen, Ruhe, Eisbad wenn nötig. NICHT sofort das Kampfvideo anschauen – du bist noch zu emotional für eine objektive Analyse.'},
        {t:'Tag 2–3: Objektive Analyse', d:'Jetzt Kampfvideo anschauen – am besten MIT dem Trainer. OHNE Emotion. So wie du den Kampf eines Fremden analysieren würdest. Schreib auf: (1) 3 Dinge die GUT waren – ja, auch in einer Niederlage gibt es gute Momente. (2) 3 Dinge zum VERBESSERN – spezifisch, nicht „alles war schlecht". (3) 1 taktische Maßnahme die den Kampf hätte drehen können. Daraus leitest du 3 konkrete Trainingsmaßnahmen für die nächsten 4 Wochen ab.'},
        {t:'Ab Tag 4: Zurück ins Training', d:'NICHT warten bis du dich „bereit fühlst". Das Gefühl kommt durch Handeln, nicht durch Warten. Gezielt an den 3 identifizierten Schwächen arbeiten. Alter Ego bewusst aktivieren: „Mein Alter Ego lernt aus allem. Diese Niederlage hat mein Alter Ego STÄRKER gemacht." Sparring in der ersten Woche danach: Leicht, taktisch, mit Fokus auf die 3 Verbesserungspunkte.'},
        {t:'Nächsten Kampf planen', d:'So früh wie sinnvoll möglich (4–8 Wochen). Je länger du wartest, desto größer die Hürde. Der nächste Kampf ist psychologisch der wichtigste nach einer Niederlage – er überschreibt die letzte Erinnerung. Idealerweise ein machbarer Gegner – du brauchst ein Erfolgserlebnis, keinen zweiten Verlust.'},
        {t:'Nach RSC/KO – Sonderprotokoll', d:'Bei Abbruch oder KO: Ärztliche Freigabe ABWARTEN. Keine Diskussion. Dann stufenweise zurück: Woche 1–2: Shadow Boxing + leichtes Pratzentraining. Woche 3–4: Mittelschweres Sparring mit Kopfschutz. Woche 5–6: Normales Sparring. Woche 7+: Kampf-Sparring. Mentaler Check in jeder Stufe: Zuckst du bei Schlägen zum Kopf zusammen? Vermeidest du den Nahkampf? Wenn ja → 1 Stufe zurück und mehr Zeit nehmen. Nicht hetzen, aber auch nicht zu lange warten.'},
        {t:'Langzeit-Perspektive', d:'Führe eine „Lektion pro Kampf"-Liste. Egal ob Sieg oder Niederlage: Was hast du gelernt? Nach 20 Kämpfen hast du 20 Lektionen. JEDE Niederlage hat dich spezifisch besser gemacht – und du kannst es beweisen. Das ist Resilienz in Reinform.'}
      ]},
    { id:'fight-week', num:'08', title:'FIGHT-WEEK PROTOCOL', sub:'7 Tage bis zum Kampf', color:'var(--purple)', icon:'📋',
      intro:'Die Kampfwoche ist <strong>keine normale Trainingswoche</strong>. Dein Körper ist vorbereitet – jetzt geht es darum, den Kopf auf den Punkt bereit zu machen. Jeder Tag hat eine spezifische mentale Aufgabe. Die Struktur gibt dir Kontrolle – und Kontrolle ist das Gegenmittel gegen Kampf-Angst.<br><br>Canelo Alvarez hat eine identische Routine für jede Kampfwoche. Immer das gleiche Hotel, das gleiche Essen, die gleiche Musik. Warum? Routine eliminiert Unsicherheit. Dein Gehirn braucht keine Energie für Entscheidungen und kann sich voll auf den Kampf konzentrieren.',
      why:'Das Ziel der Kampfwoche: Am Kampftag mit dem Gefühl in den Ring gehen „Ich habe alles getan was möglich war. Ich bin vorbereitet. Jetzt muss ich nur noch das abrufen was ich kann." Wenn du mit Zweifeln in den Ring gehst, hast du die Kampfwoche falsch gestaltet.',
      steps:[
        {t:'Tag 7–5: Schärfen', d:'Training mit leicht reduzierter Intensität (−20–30% Volumen, Intensität bleibt). Tägliche Visualisierung 2× (morgens 5 Min. Technik, abends 5 Min. Krisen-Szenarien). Alter Ego im Sparring aktivieren – JEDES Mal. Gegner-Video studieren: 2–3 Muster identifizieren, Antworten planen. Schlaf: Minimum 8 Stunden. Kein Alkohol, kein Koffein nach 13:00.'},
        {t:'Tag 4–3: Mental Peak', d:'Kein hartes Sparring mehr. Leichte Pratzen, Shadow Boxing, Technikarbeit. Visualisierung steigern auf 3×10 Min. (morgens, mittags, abends). Trigger-Wörter auf Papier schreiben und laut üben – jeweils 5×. Self-Talk-Routine festlegen: Was sage ich mir beim Aufwärmen? In der Ecke? In Runde 1? Bei Rückstand? Alter-Ego-Origin-Story laut vorlesen (ja, wirklich laut – alleine zu Hause). Tasche für Kampftag beginnen zu packen.'},
        {t:'Tag 2: Ruhe & Vorbereitung', d:'NUR leichte Bewegung: 15 Min. Spaziergang, leichtes Stretching. Box-Breathing 3× am Tag (morgens, mittags, abends – je 5 Min.). Alter-Ego-Origin-Story nochmal lesen. Komplette Tasche packen (Mundschutz, Bandagen, Wettkampfpass, Klamotten, Essen/Trinken für danach, Musik/Kopfhörer). Routine für morgen durchgehen – keine Überraschungen. Handy auf lautlos, kein Social Media. Früh schlafen (22:00 spätestens).'},
        {t:'Tag 1 – Kampftag: Die Routine', d:'Aufstehen → Box-Breathing 5 Min. → leichtes Frühstück (Protein + schnelle KH) → Wiegen wenn nötig → Musik (persönliche Kampf-Playlist mit Kopfhörern) → Halle anreisen → PAPE Warm-Up Protokoll (45 Min. vor Ring) → Shadow Boxing 2 Runden → Visualisierung 5 Min. (Augen zu, Lieblingskombi durchgehen, Gegner-Muster, Krisen-Plan) → Totem anlegen → Alter Ego aktivieren → Letzte Anweisungen vom Trainer → Ring betreten. AB JETZT existiert nur noch [Alter Ego Name] und der Gegner. Nichts anderes.'},
        {t:'Zwischen den Runden (60 Sek.)', d:'Sek. 0–5: Setzen, Mundschutz raus, Wasser (kleine Schlucke, nicht gurgeln). Sek. 5–10: 2 tiefe Atemzüge, Trainer anschauen. Sek. 10–40: Trainer gibt max. 2 Anweisungen. DU hörst ZU. Nickst. Sek. 40–55: Box-Breathing 2 Zyklen. Augen auf den Gegner – schau wie er sitzt, wie er atmet. Ist er müder als du? Sek. 55–60: Mundschutz rein (= Totem = Alter Ego Switch). Aufstehen. Schultern zurück. Letzte 3 Sek.: Trigger-Wort im Kopf. Gong.'},
        {t:'Nach dem Kampf', d:'Egal ob Sieg oder Niederlage: (1) Duschen, essen, trinken. Körper versorgen. (2) 1 Sache aufschreiben die gut war. 1 Sache aufschreiben die besser werden muss. Nur 1 jeweils – nicht mehr am Kampftag. (3) Trainer und Partner danken. (4) 24h kein Kampfvideo anschauen. Genieße den Sieg oder verarbeite die Niederlage erst emotional, dann analytisch (siehe Sektion 07).'}
      ]},
    { id:'bet', num:'09', title:'BET PROTOKOLL', sub:'Brain Endurance Training – 6 Wochen', color:'var(--gold)', icon:'🧠',
      intro:'Brain Endurance Training (BET) trainiert dein Gehirn, <strong>unter kognitiver Erschöpfung sauber zu funktionieren</strong>. In Runde 3, wenn dein Kopf müde ist und dein Gegner Druck macht, entscheidet mentale Frische über Sieg oder Niederlage. BET simuliert diese Ermüdung systematisch im Training.<br><br>Das Konzept: Kognitive Erschöpfung (durch monotone Denkaufgaben) reduziert physische Ausdauer um 10–15%. Wenn du trainierst unter kognitiver Last zu performen, erhöhst du deine Toleranz – und hast in Runde 3 noch mentale Reserven die dein Gegner nicht hat.',
      why:'Transparenz: Die oft zitierte Militär-Studie (Marcora et al. 2009) wurde an Soldaten durchgeführt, nicht an Boxern. Die Loughborough-Studie zeigte 126% längere Time-to-Exhaustion nach BET. Die Übertragung auf Kampfsport ist plausibel und wird von mehreren olympischen Verbänden (GB Boxing, DFB) genutzt – aber die Studienlage speziell für Boxer ist noch dünn. Das Risiko ist null (du trainierst nur dein Gehirn), das Potenzial groß.',
      steps:[
        {t:'Woche 1–2: Basis aufbauen', d:'App: Kostenlose Stroop-App (z.B. „Brain Test", „Stroop Effect" oder „Encephalapp Stroop"). 15–20 Min. täglich inkongruente Tests (das Wort „BLAU" steht in roter Farbe → du musst die FARBE nennen, nicht das Wort). Ruhige Umgebung, volle Konzentration, keine Ablenkung. Mittagspause eignet sich gut. Du wirst merken: Nach 15 Min. wird dein Kopf „müde" – genau DAS ist der Trainingseffekt.'},
        {t:'Woche 3–4: Integration ins Training', d:'20–25 Min. BET pro Session, höhere Schwierigkeit (schnellere Antwortzeit, mehr Varianten). NEU: Kognitive Aufgaben ZWISCHEN Bag-Work-Runden einbauen. Konkret: 3 Min. Sandsack → 60 Sek. Stroop-Test auf Handy → 3 Min. Sandsack → 60 Sek. Stroop. 6–8 Runden. Ziel: Saubere Technik halten obwohl dein Kopf müde ist. Trainingspartner kann auch Rechenaufgaben stellen: „147 minus 7?" zwischen den Runden.'},
        {t:'Woche 5–6: Ring-Transfer', d:'25–30 Min. BET bei max. Schwierigkeit. Stroop-Antworten ZWISCHEN Sparring-Runden. Oder: Trainer stellt nach jeder Runde eine kognitive Frage (Farbe, Zahl, Rechenaufgabe) bevor er taktische Anweisungen gibt. Ziel: Saubere taktische Entscheidungen trotz maximaler kognitiver Erschöpfung. Das ist der direkte Transfer: In Runde 3 unter Druck noch klar denken können.'},
        {t:'Im Vereinstraining integrieren', d:'Bitte deinen Trainer, zwischen Sandsack-Runden Zahlen oder Farben zu rufen auf die du mit Kombis reagieren musst. Oder: Nach jeder Runde eine Frage beantworten bevor die naechste Anweisung kommt. Kostet nichts und trainiert genau das was du brauchst.'},
        {t:'Langzeit-Protokoll', d:'Nach 6 Wochen: 3×/Woche Erhaltungsdosis (15 Min. + Integration in 2 Trainingseinheiten). Vor Kämpfen (Kampfwoche): Tägliche BET-Session 20 Min. – schärft die kognitive Ausdauer für den Kampf. BET ist wie Ausdauertraining für dein Gehirn: Konsistenz über Monate schlägt Intensität über Tage. Die meisten Boxer die es probieren hören nach 2 Wochen auf – die die durchhalten haben einen unfairen Vorteil in Runde 3.'}
      ]}
  ];

  // Load saved alter ego
  const data = typeof getData === 'function' ? getData() : null;
  const alterEgo = data && data.alterEgo ? data.alterEgo : {};
  const eName = typeof escapeHTML === 'function' ? escapeHTML(alterEgo.name || '') : (alterEgo.name || '');
  const eTraits = typeof escapeHTML === 'function' ? escapeHTML(alterEgo.traits || '') : (alterEgo.traits || '');
  const eTotem = typeof escapeHTML === 'function' ? escapeHTML(alterEgo.totem || '') : (alterEgo.totem || '');

  el.innerHTML = `
  <div class="page-header">
    <div class="page-title">MENTAL<span>TRAINING</span></div>
    <div class="page-sub">9 Bausteine – klick auf einen, um mehr zu erfahren.</div>
  </div>

  <div class="mt-hero">
    <div class="mt-hero-quote">"EVERYBODY HAS A PLAN UNTIL THEY GET <span>PUNCHED IN THE MOUTH</span>"</div>
    <div class="mt-hero-attr">– MIKE TYSON</div>
  </div>

  <!-- ALTER EGO INTERACTIVE CARD -->
  <div class="mt-ego-card">
    <div class="mt-ego-head">
      <div class="mt-ego-title">${eName ? eName.toUpperCase() : 'DEIN ALTER EGO'}</div>
      <div class="mt-ego-sub">${eName ? 'Deine Kampf-Identität' : 'Wer bist du im Ring? Erstelle dein Alter Ego.'}</div>
    </div>
    <div class="mt-ego-fields">
      <div class="mt-ego-field">
        <label>Name deines Alter Egos</label>
        <input type="text" id="mt-ego-name" value="${eName}" placeholder="z.B. Iron Wolf, Black Mamba...">
      </div>
      <div class="mt-ego-field">
        <label>Eigenschaften (3–5 Wörter)</label>
        <input type="text" id="mt-ego-traits" value="${eTraits}" placeholder="z.B. furchtlos, explosiv, geduldig">
      </div>
      <div class="mt-ego-field">
        <label>Totem (physischer Trigger)</label>
        <input type="text" id="mt-ego-totem" value="${eTotem}" placeholder="z.B. Mundschutz einsetzen, Kapuze auf">
      </div>
      <button class="mt-ego-save" onclick="saveAlterEgo()">
        ${eName ? 'Aktualisieren' : 'Alter Ego erstellen'}
      </button>
      <div id="mt-ego-msg" style="font-size:12px;color:var(--green);margin-top:6px;"></div>
    </div>
  </div>

  <!-- ACCORDION SECTIONS -->
  <div class="mt-acc-list">
    ${MENTAL_SECTIONS.map(s => `
    <div class="mt-acc" style="--mc:${s.color};">
      <div class="mt-acc-head" onclick="toggleMtAcc(this)">
        <div class="mt-acc-left">
          <span class="mt-acc-num">${s.num}</span>
          <span class="mt-acc-title">${s.title}</span>
          <span class="mt-acc-sub">– ${s.sub}</span>
        </div>
        <span class="mt-acc-arrow">+</span>
      </div>
      <div class="mt-acc-body">
        <div class="mt-acc-inner">
          <p class="mt-acc-intro">${s.intro}</p>
          <div class="mt-acc-aside">${s.why}</div>
          ${s.steps.map((st, i) => `
          <div class="mt-acc-step">
            <span class="mt-acc-step-n">${i + 1}</span>
            <div>
              <div class="mt-acc-step-t">${st.t}</div>
              <div class="mt-acc-step-d">${st.d}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`).join('')}
  </div>

  <!-- DAILY PROTOCOL -->
  <div style="margin-top:40px;padding-top:32px;border-top:1px solid var(--surface-2);">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:2px;color:var(--white);margin-bottom:16px;">TÄGLICHES PROTOKOLL <span style="color:var(--gold);">15 MIN.</span></div>
    <div class="mt-daily">
      <div class="mt-slot" style="--mc:var(--blue);">
        <div class="mt-slot-time">MORGENS · 5 MIN.</div>
        <div class="mt-slot-body">Box-Breathing 4-4-4-4 (2 Min.)<br>Trigger-Wörter laut aussprechen<br>Intention für den Tag setzen</div>
      </div>
      <div class="mt-slot" style="--mc:var(--red);">
        <div class="mt-slot-time">VOR DEM TRAINING · 3 MIN.</div>
        <div class="mt-slot-body">${eName ? eName + ' aktivieren' : 'Alter Ego aktivieren'} – Totem anlegen<br>30 Sek. Visualisierung<br>${eName ? '„Ich bin ' + eName + '"' : '„Ich bin [Alter-Ego-Name]"'}</div>
      </div>
      <div class="mt-slot" style="--mc:var(--purple);">
        <div class="mt-slot-time">ABENDS · 7 MIN.</div>
        <div class="mt-slot-body">Technik-Visualisierung (3 Min.)<br>Gegner-Visualisierung (2 Min.)<br>Krisen-Szenario (2 Min.)</div>
      </div>
      <div class="mt-slot" style="--mc:var(--gold);">
        <div class="mt-slot-time">JOURNAL · OPTIONAL</div>
        <div class="mt-slot-body">Was lief heute gut?<br>Was war mental schwer?<br>${eName ? 'Wie hätte ' + eName + ' reagiert?' : 'Wie hätte mein Alter Ego reagiert?'}</div>
      </div>
    </div>
  </div>`;
}

function toggleMtAcc(head) {
  var acc = head.closest('.mt-acc');
  acc.classList.toggle('open');
}

function saveAlterEgo() {
  const name = document.getElementById('mt-ego-name').value.trim();
  const traits = document.getElementById('mt-ego-traits').value.trim();
  const totem = document.getElementById('mt-ego-totem').value.trim();
  if (!name) { document.getElementById('mt-ego-msg').textContent = 'Gib deinem Alter Ego einen Namen.'; return; }
  const data = getData();
  if (!data) return;
  data.alterEgo = { name, traits, totem };
  saveData(data);
  showToast('Alter Ego gespeichert');
  // Update all name displays across the app
  const pill = document.getElementById('user-pill');
  if (pill) pill.textContent = name;
  const dashName = document.getElementById('rpg-player-name');
  if (dashName) dashName.textContent = name.toUpperCase();
  document.getElementById('mt-ego-msg').textContent = name + ' ist jetzt deine Kampf-Identität.';
  // Re-render mental page + dashboard subtitle
  setTimeout(() => {
    renderMentalPage();
    if (typeof renderDashStats === 'function') renderDashStats();
  }, 500);
}

// ===== FAQ =====
function renderFAQPage() {
  const el = document.getElementById('page-faq');
  el.innerHTML = `
  <div class="page-header">
    <div class="page-title">FAQ <span>&</span> <span class="gold">MYTHEN</span></div>
    <div class="page-sub">Die häufigsten Fragen – direkt und wissenschaftlich beantwortet.</div>
  </div>
  <div id="faq-list">
    ${faqData.map(f => `
    <div class="faq-item">
      <div class="faq-q" onclick="this.parentElement.classList.toggle('open')">
        ${f.q}
        <span class="faq-arr">▾</span>
      </div>
      <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
    </div>`).join('')}
  </div>`;
}

const faqData = [
  { q:'Muss ich Gewichte heben? Macht das nicht langsamer?',
    a:'<strong>Nein – das ist ein Mythos aus den 1970ern.</strong> Modernes Krafttraining mit explosiven Bewegungen (Jump Squats, Landmine Press, Med Ball) verbessert nachweislich Schlaggeschwindigkeit und -kraft.<br><br>Was langsamer macht: Bodybuilding (hohe Reps, langsam, isoliert). Was schneller macht: explosives, spezifisches Krafttraining wie im Plan.<br><br>Studien zeigen: Elite-Boxer mit S&C haben messbar mehr Punch Force als rein boxend trainierende Athleten gleichen Niveaus.'},
  { q:'Wie viele Sparring-Runden sind optimal?',
    a:'<strong>Qualität vor Quantität.</strong><br><br><strong>Normale Trainingswoche:</strong> 6–10 harte Runden/Woche (1–2 Sessions)<br><strong>Kampf in 3–4 Tagen:</strong> Nur noch leichtes/technisches Sparring (60–70%), max. 4 Runden<br><strong>Kampf morgen/übermorgen:</strong> Kein Sparring mehr<br><br>Unterscheide: technisches Sparring (60–70%, Lernfokus) vs. Kampf-Sparring (80–90%). Zu viel hartes Sparring = Verletzungsrisiko + Übertraining. Bei wöchentlichen Kämpfen: Sparring nur Mo–Mi, dann Schärfen.'},
  { q:'Verbessere ich mich in der Wettkampfphase?',
    a:'<strong>Ja!</strong> Im Amateur-Boxen trainierst du DURCH die Wettkampfphase – es gibt kein monatelanges Camp wie bei Profis.<br><br>1. <strong>Ring-Erfahrung:</strong> Jeder Kampf = stärkstes Lernen überhaupt. Kein Sparring ersetzt echte Kämpfe<br>2. <strong>Kampfanalyse:</strong> Nach jedem Kampf 3 Stärken + 3 Verbesserungen notieren → gezielt trainieren<br>3. <strong>Technik schleifen:</strong> Zwischen den Kämpfen Schwächen gezielt an Pratzen und im konditionalem Sparring trainieren<br>4. <strong>Auxiliary weiter:</strong> IMT, Nacken, BET, Visualisierung – alles täglich ohne Erholungsbedarf<br>5. <strong>S&C erhalten:</strong> 2–3× Morgentraining reicht für Kraft-Erhalt, PRs nur in kampffreien Wochen'},
  { q:'Wie wichtig ist Ernährung wirklich?',
    a:'<strong>Entscheidend.</strong> Häufigste Defizite:<br><br>• <strong>Zu wenig Protein:</strong> Durchschnitt ~1.0g/kg, Bedarf 2.2g/kg – mehr als das Doppelte!<br>• <strong>Falsches Timing:</strong> Großes Frühstück, kaum Mittag, Riesenportion abends = kein Glykogen<br>• <strong>Dehydration:</strong> 2% = 20% weniger Ausdauer<br>• <strong>Nährstoffmängel:</strong> Vitamin D, Magnesium, Zink<br><br>Test: Tracke 3 Tage mit MyFitnessPal. Die meisten sind erschüttert.'},
  { q:'Nur 30 Minuten – was bringt am meisten?',
    a:'<strong>Priorisiere:</strong><br>1. HRV messen (5 Min.)<br>2. IMT (5 Min.) – höchster Return on Time<br>3. Overcoming Isometrics (10 Min.) – max. ZNS-Aktivierung<br>4. Jump Squats 4×4 (10 Min.)<br><br><strong>30 konsistente Minuten täglich schlagen 3 Stunden 3×/Woche.</strong> Konsistenz ist der unterschätzte Vorteil.'},
  { q:'Niedriger HRV – trotzdem trainieren?',
    a:'<strong>Kommt drauf an:</strong><br><br><strong>1 roter Tag:</strong> Training machen, aber 60–70%. Zone 2, Technik, Mobility.<br><strong>2 rote Tage:</strong> Intensiv pausieren, nur leichte Bewegung.<br><strong>3+ rote Tage:</strong> Komplette Ruhe. Ursache suchen: Schlaf, Stress, Krankheit?<br><br>Einzelwerte sind weniger aussagekräftig als der 7-Tage-Trend.'},
  { q:'Kreatin – ja oder nein für Boxer?',
    a:'<strong>Ja, mit strategischem Timing.</strong><br><br>• Schnellere PCr-Resynthese zwischen Kombis<br>• +12% Peakpower<br>• Bessere Regeneration zwischen Sparring-Runden<br>• Möglicherweise neuroprotektiv<br><br><strong>Wann NICHT:</strong> 4–6 Wochen vor Wiegen pausieren (1–2 kg Wasser). Nach dem Wiegen wieder starten.'},
  { q:'Wie lange bis Verbesserungen sichtbar?',
    a:'<strong>2–4 Wochen:</strong> IMT, besserer Schlaf, mehr Energie<br><strong>4–8 Wochen:</strong> Nackendicke messbar, BET-Effekte<br><strong>8–12 Wochen:</strong> Kraft +15–25%, VO₂max sichtbar<br><strong>6 Monate:</strong> Ring-IQ deutlich besser, Runde-3-Dominanz<br><strong>12+ Monate:</strong> Fundamentale Transformation<br><br>Fortschritt ist nicht linear. Plateaus = Adaptation, nicht Stillstand.'},
  { q:'Landeskader vs. Nationalkader – was fehlt?',
    a:'<strong>Nicht primär Talent – sondern Struktur:</strong><br><br>• <strong>Trainingsvolumen:</strong> 25–35 Std./Wo vs. 12–15 Std.<br>• <strong>Coaching:</strong> Bundesstützpunkt mit A-Lizenz-Trainern, Physio, Sportpsychologe<br>• <strong>Kämpfe:</strong> 80–150+ vs. 10–30<br>• <strong>Sportförderung:</strong> Bundeswehr/Zoll – bezahlte Stelle + Freistellung<br><br>Weg dahin: Landesverband-Trainer fragen wegen Empfehlung zur Sportfördergruppe.'},
  { q:'Vollzeitjob und Nationalebene – realistisch?',
    a:'<strong>Ehrliche Antwort: Extrem schwierig, aber nicht unmöglich.</strong><br><br>Der Trainingsplan macht dich zum bestmöglichen Athleten unter deinen Bedingungen. Der Gap zu Vollzeit-Athleten lässt sich durch Effizienz teilweise, aber nicht vollständig schließen.<br><br><strong>Realistischer Pfad:</strong> Konsistent performen → Deutsche Meisterschaften → Sportfördergruppe beantragen → dann Vollzeit-Training möglich.'},
  { q:'Wie oft sollte ich Wettkämpfe haben?',
    a:'<strong>Hängt von der Phase ab:</strong><br><br>• <strong>Aufbauphase:</strong> Alle 4–6 Wochen, genug Zeit zum Trainieren<br>• <strong>Wettkampfphase:</strong> Alle 2–3 Wochen möglich mit angepasstem Training<br>• <strong>Meisterschafts-Vorbereitung:</strong> 2–3 Vorbereitungskämpfe in den 8 Wochen davor<br><br>Generell: Mehr Kämpfe = mehr Ring-Erfahrung = schnellere Entwicklung. Aber ohne Training dazwischen keine Verbesserung.'},
  { q:'BFR Training – ist das sicher?',
    a:'<strong>Ja, bei korrekter Anwendung.</strong> Tausende Studien ohne schwere Nebenwirkungen. Aber:<br><br>• Okklusion max. 50% (nicht 80%+!)<br>• Spezielle BFR-Bänder verwenden (nicht improvisieren)<br>• Bei Taubheit oder Schmerz sofort lösen<br>• Nicht bei Blutgerinnungsstörungen oder Bluthochdruck<br>• Post-Training, nicht als Aufwärmung'},
  { q:'Soll ich morgens nüchtern trainieren?',
    a:'<strong>Nein – für Boxer kontraproduktiv.</strong><br><br>Nüchterntraining senkt die Trainingsqualität bei Intensität >70%. Und Boxen braucht Glykogen. Ein kleiner Snack (Banane + EL Erdnussbutter) 30 Min. vorher reicht – kein volles Frühstück nötig.<br><br>Ausnahme: Reines Zone-2-Cardio (Fahrrad zur Arbeit) geht nüchtern.'},
  { q:'Wie wichtig ist Dehnen wirklich?',
    a:'<strong>Statisches Dehnen VOR Training: schlecht.</strong> Senkt Kraft und Power für 30–60 Min.<br><br><strong>Dynamisches Aufwärmen VOR Training: wichtig.</strong> Armkreise, Beinpendel, Hüftöffner.<br><br><strong>Statisches Dehnen NACH Training: optional.</strong> Hilft bei Wohlbefinden, wenig Evidenz für Verletzungsprävention.<br><br><strong>Was wirklich hilft:</strong> Foam Rolling + Mobility (Hip 90/90, T-Spine Rotation) – verbessert Bewegungsqualität.'},
  { q:'Was mache ich wenn ich krank bin?',
    a:'<strong>"Neck Check":</strong><br><br>• Symptome nur oberhalb des Halses (Schnupfen, leichte Halsschmerzen): Leichtes Training OK, 60% Intensität<br>• Symptome unterhalb des Halses (Husten, Fieber, Gliederschmerzen): KEIN Training bis symptomfrei<br><br>Nach Krankheit: 1 Tag pro Krankheitstag zur Rückkehr. 5 Tage krank = 5 Tage aufbauend zurückkommen. Sofort voll einsteigen = Rückfall-Risiko.'},
  { q:'Handgelenk tut weh nach dem Sparring – was tun?',
    a:'<strong>Häufigste Verletzung im Boxen.</strong><br><br><strong>Sofort:</strong> Kühlen (15 Min.), Kompression, Pause. Keine Schmerzmittel zum Weitertrainieren – das maskiert nur die Warnung.<br><br><strong>Ursachen meist:</strong><br>• <strong>Falsche Bandagen:</strong> Handgelenk muss fixiert sein, Knöchel gepolstert. Wickeltechnik vom Trainer zeigen lassen!<br>• <strong>Schlechte Schlagtechnik:</strong> Treffer mit gekipptem Handgelenk statt gerader Linie (Schulter-Ellbogen-Faust)<br>• <strong>Falsche Trefferfläche:</strong> Mit den letzten zwei Knöcheln statt den ersten zwei getroffen<br><br><strong>Wann zum Arzt:</strong> Schwellung die nicht zurückgeht, Schmerz beim Greifen nach 48h, Taubheitsgefühl. Lieber einmal zu viel als zu wenig – Handgelenk-Frakturen heilen schlecht wenn zu spät erkannt.<br><br><strong>Prävention:</strong> Bandagen korrekt wickeln, Rice Bucket Training 3×/Woche, Handgelenk-Curls.'},
  { q:'Übertraining – wie erkenne ich es?',
    a:'<strong>Warnsignale:</strong><br><br>• HRV dauerhaft unter Baseline (3+ rote Tage)<br>• Ruhepuls morgens +5 bpm über Normal<br>• Leistungsabfall trotz guten Trainings<br>• Schlafstörungen trotz Müdigkeit<br>• Stimmungsschwankungen, Motivation ↓<br>• Häufige kleine Verletzungen / Erkältungen<br><br><strong>Lösung:</strong> 5–7 Tage komplette Ruhe. Dann langsam aufbauen. Lieber 1 Woche Pause als 3 Monate Verletzung.'},
  { q:'Wie trainiere ich die letzten Tage vor dem Kampf?',
    a:'<strong>Nur 2–3 Tage Anpassung – kein wochenlanges Taper!</strong><br><br><strong>Kampf am Samstag – Beispiel:</strong><br>• Mo–Mi: Normales Training, hartes Sparring OK bis einschließlich Mittwoch<br>• Do: Schärfen – Pratzen (Gameplan-Kombis), Shadow Boxing, Visualisierung. Kurz + intensiv, kein Volumen<br>• Fr: Nur Mobility, Visualisierung, Equipment packen, früh schlafen<br>• Sa: PAPE Warm-up, Kampf<br><br><strong>Kampf schon Donnerstag?</strong> Di = Schärfen, Mi = Ruhe, Do = Kampf. Anpassung ist immer nur 2–3 Tage, egal wann der Kampf ist.'}

];

// ===== RECHNER =====
function renderRechnerPage() {
  const el = document.getElementById('page-rechner');
  el.innerHTML = `
  <div class="page-header">
    <div class="page-title">INTER<span>AKTIVE</span> RECHNER</div>
    <div class="page-sub">Berechne deine individuellen Zielwerte.</div>
  </div>

  <div class="grid-2" style="margin-bottom:32px;">
    <div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--white);margin-bottom:20px;">HERZFREQUENZ <span style="color:var(--blue);">ZONEN</span></div>
      <div class="calc-box">
        <div class="calc-inputs">
          <div class="calc-group"><label>Alter (Jahre)</label><input type="number" id="hf-age" placeholder="25" min="14" max="60"></div>
          <div class="calc-group"><label>Ruhepuls (bpm)</label><input type="number" id="hf-rest" placeholder="55" min="30" max="90"></div>
        </div>
        <button class="calc-btn" onclick="calcHFZonen()" style="background:var(--blue);">ZONEN BERECHNEN</button>
        <div id="hf-results" style="display:none;margin-top:20px;"></div>
      </div>
    </div>
    <div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--white);margin-bottom:20px;">1RM <span style="color:var(--orange);">RECHNER</span></div>
      <div class="calc-box">
        <div class="calc-inputs">
          <div class="calc-group"><label>Gewicht gehoben (kg)</label><input type="number" id="rm-weight" placeholder="80" min="1" max="500"></div>
          <div class="calc-group"><label>Wiederholungen</label><input type="number" id="rm-reps" placeholder="5" min="1" max="30"></div>
        </div>
        <button class="calc-btn" onclick="calc1RM()" style="background:var(--orange);color:var(--black);">1RM BERECHNEN</button>
        <div id="rm-results" style="display:none;margin-top:20px;"></div>
      </div>
    </div>
  </div>`;
}

// ===== SEARCH INDEX =====
function getSearchableContent() {
  const items = [];

  // Säulen
  saeulenData.forEach((s, i) => {
    const dispNum = [0,1,7,2,5,6,3,4].indexOf(i);
    items.push({ title: s.name, context: 'Säule ' + String(dispNum >= 0 ? dispNum+1 : i+1).padStart(2,'0') + ' · ' + s.category, page: 'saeulen', text: s.name + ' ' + s.desc, saeulenIdx: i });
  });

  // Exercises
  allExercises.forEach(e => {
    items.push({ title: e.name, context: 'Übung', page: 'uebungen', text: e.name + ' ' + e.muscle + ' ' + e.desc + ' ' + e.tip, exerciseId: e.id });
  });

  // FAQ
  faqData.forEach(f => {
    items.push({ title: f.q, context: 'FAQ', page: 'faq', text: f.q + ' ' + f.a });
  });

  // Pages
  items.push({ title: 'Ernährung & Makros', context: 'Seite', page: 'ernaehrung', text: 'ernährung protein kohlenhydrate fett makros kalorien mahlzeiten timing leucin whey' });
  items.push({ title: 'Cutten & Gewicht machen', context: 'Seite', page: 'cutten', text: 'cutten gewicht abnehmen wassergewicht wiegen gewichtsklasse defizit' });
  items.push({ title: 'Periodisierung & Kampfvorbereitung', context: 'Seite', page: 'periodisierung', text: 'periodisierung kampf vorbereitung schärfen training phasen amateur rundenstrategie aufwärmen warm-up' });
  items.push({ title: 'Regeneration & Schlaf', context: 'Seite', page: 'regeneration', text: 'regeneration schlaf kälte sauna hrv erholung recovery mobility' });
  items.push({ title: 'Supplements', context: 'Seite', page: 'supplements', text: 'supplements kreatin beta-alanin magnesium vitamin omega koffein melatonin' });
  supplementsData.forEach(s => {
    items.push({ title: s.name, context: 'Supplement · ' + s.category, page: 'supplements', text: s.name + ' ' + s.short + ' ' + s.dose, supplementId: s.id });
  });
  items.push({ title: 'Mentaltraining', context: 'Seite', page: 'mental', text: 'mental visualisierung angst nervosität niederlage self-talk arousal bet brain endurance' });
  items.push({ title: 'Rechner (HF-Zonen, 1RM)', context: 'Seite', page: 'rechner', text: 'rechner herzfrequenz zonen 1rm karvonen epley berechnen' });

  items.push({ title: 'Übungsbibliothek – Zielbasiert filtern', context: 'Seite', page: 'uebungen', text: 'mediathek übung jab power speed hände schneller stärker clinch nacken kinn ausdauer beinarbeit pull-ups pallof face pulls seilspringen farmers walk' });
  items.push({ title: 'Leistungstests & Benchmarks', context: 'Seite', page: 'tests', text: 'tests benchmark deadlift klimmzüge cooper sprunghöhe schlagfrequenz körperfett nackenumfang leistung radar' });

  return items;
}

