/* ============================================
   FIGHTOS – Calculators
   Makros, HF-Zonen, Wettkampf-Prep, 1RM
   ============================================ */

// ===== INPUT VALIDATION =====
function validateCalcInput(value, min, max, fieldName) {
  var num = parseFloat(value);
  if (isNaN(num)) return fieldName + ': Bitte eine Zahl eingeben.';
  if (num < min) return fieldName + ': Minimum ' + min + '.';
  if (num > max) return fieldName + ': Maximum ' + max + '.';
  return null;
}

function showCalcError(targetId, message) {
  var el = document.getElementById(targetId);
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:12px;color:var(--red);padding:10px 0;">' + message + '</div>';
}

// ===== MAKRO RECHNER (Ernährung page) =====
function calcMakrosErn() {
  var wErr = validateCalcInput(document.getElementById('ern-weight')?.value, 30, 200, 'Gewicht');
  if (wErr) { showCalcError('ern-results', wErr); return; }
  const w = parseFloat(document.getElementById('ern-weight')?.value) || 75;
  const phase = document.getElementById('ern-phase')?.value || 'aufbau';
  const vol = document.getElementById('ern-vol')?.value || 'mittel';
  const job = document.getElementById('ern-job')?.value || 'sitz';

  const proteinG = { aufbau: 2.2, wettkampf: 2.2, cutten: 2.6, maintain: 2.0 }[phase];
  const khG = { aufbau: 5.5, wettkampf: 4.5, cutten: 3.0, maintain: 4.0 }[phase];
  const fatG = { aufbau: 1.1, wettkampf: 1.0, cutten: 0.8, maintain: 1.0 }[phase];
  const volMult = { mittel: 1.0, hoch: 1.1, 'sehr-hoch': 1.2 }[vol];
  const jobMult = { sitz: 1.0, steh: 1.05, schwer: 1.12 }[job];

  const p = Math.round(w * proteinG * volMult);
  const k = Math.round(w * khG * volMult * jobMult);
  const f = Math.round(w * fatG);
  const kcal = Math.round(p * 4 + k * 4 + f * 9);
  const perMeal = Math.round(p / 5);

  const phaseLabel = { aufbau: 'Aufbauphase', wettkampf: 'Wettkampfphase', cutten: 'Cuttingphase', maintain: 'Erhaltung' }[phase];

  const el = document.getElementById('ern-results');
  el.style.display = 'grid';
  el.className = 'calc-results';
  el.innerHTML = `
    <div class="calc-result-card"><div class="calc-result-val">${kcal}</div><div class="calc-result-unit">kcal/Tag</div><div class="calc-result-desc">Gesamtenergie</div></div>
    <div class="calc-result-card"><div class="calc-result-val protein">${p}g</div><div class="calc-result-unit">Protein</div><div class="calc-result-desc">${proteinG}g/kg · ${perMeal}g/Mahlzeit</div></div>
    <div class="calc-result-card"><div class="calc-result-val carbs">${k}g</div><div class="calc-result-unit">Kohlenhydrate</div><div class="calc-result-desc">${khG}g/kg</div></div>
    <div class="calc-result-card"><div class="calc-result-val fat">${f}g</div><div class="calc-result-unit">Fett</div><div class="calc-result-desc">${fatG}g/kg</div></div>
    <div class="calc-save-row"><button class="calc-btn" style="background:var(--green);padding:10px 24px;" onclick="saveNutritionPlan()">ALS MEIN PLAN SPEICHERN</button><div id="ern-save-confirm" style="display:none;font-family:'Space Mono',monospace;font-size:11px;color:var(--green);margin-top:8px;"></div></div>`;

  const s = typeof getUserSchedule === 'function' ? getUserSchedule() : { workStart:'08:00', workEnd:'17:00', trainingTime:'18:00' };
  const today = typeof getTodaySchedule === 'function' ? getTodaySchedule() : { time: s.trainingTime, type: 'boxen' };
  const tTime = today.time || s.trainingTime || '18:00';
  const wk = timeBefore(s.workStart, 1, 30);
  const mealTimes = {
    pre: timeAdd(wk, 0, 5),
    post: timeAdd(wk, 1, 0),
    snack: timeAdd(s.workStart, 2, 0),
    lunch: timeAdd(s.workStart, 4, 30),
    preTrain: timeBefore(tTime, 1, 0),
    recovery: timeAdd(tTime, 1, 30)
  };

  const meals = document.getElementById('ern-meals');
  meals.style.display = 'block';
  meals.innerHTML = `
    <div class="calc-meal-wrap">
      <div class="calc-meal-title">MAHLZEITEN-AUFTEILUNG · ${phaseLabel}</div>
      <div class="calc-meal-list">
        <div class="calc-meal-row"><span class="calc-meal-time">${mealTimes.pre} Vor-Training</span><span class="calc-meal-p">${Math.round(p*0.08)}g P</span><span class="calc-meal-k">${Math.round(k*0.1)}g KH</span></div>
        <div class="calc-meal-row"><span class="calc-meal-time">${mealTimes.post} Hauptmahlzeit</span><span class="calc-meal-p">${Math.round(p*0.22)}g P</span><span class="calc-meal-k">${Math.round(k*0.2)}g KH</span></div>
        <div class="calc-meal-row"><span class="calc-meal-time">${mealTimes.snack} Protein-Bolus</span><span class="calc-meal-p">${Math.round(p*0.15)}g P</span><span class="calc-meal-k">${Math.round(k*0.1)}g KH</span></div>
        <div class="calc-meal-row"><span class="calc-meal-time">${mealTimes.lunch} Mittagessen</span><span class="calc-meal-p">${Math.round(p*0.22)}g P</span><span class="calc-meal-k">${Math.round(k*0.3)}g KH</span></div>
        <div class="calc-meal-row"><span class="calc-meal-time">${mealTimes.preTrain} Pre-Training</span><span class="calc-meal-p">${Math.round(p*0.12)}g P</span><span class="calc-meal-k">${Math.round(k*0.18)}g KH</span></div>
        <div class="calc-meal-row"><span class="calc-meal-time">${mealTimes.recovery} Recovery</span><span class="calc-meal-p">${Math.round(p*0.21)}g P (Casein)</span><span class="calc-meal-k">${Math.round(k*0.12)}g KH</span></div>
      </div>
    </div>`;
}

// ===== ERNÄHRUNGS-PLAN SPEICHERN =====
function saveNutritionPlan() {
  var data = typeof getData === 'function' ? getData() : null;
  if (!data) return;
  var w = parseFloat(document.getElementById('ern-weight').value) || 75;
  var phase = document.getElementById('ern-phase').value || 'aufbau';
  var vol = document.getElementById('ern-vol').value || 'mittel';
  var job = document.getElementById('ern-job').value || 'sitz';
  var proteinG = { aufbau: 2.2, wettkampf: 2.2, cutten: 2.6, maintain: 2.0 }[phase];
  var khG = { aufbau: 5.5, wettkampf: 4.5, cutten: 3.0, maintain: 4.0 }[phase];
  var fatG = { aufbau: 1.1, wettkampf: 1.0, cutten: 0.8, maintain: 1.0 }[phase];
  var volMult = { mittel: 1.0, hoch: 1.1, 'sehr-hoch': 1.2 }[vol];
  var jobMult = { sitz: 1.0, steh: 1.05, schwer: 1.12 }[job];
  data.nutritionPlan = {
    savedAt: new Date().toISOString(),
    weight: w,
    phase: phase,
    kcal: Math.round(w * proteinG * volMult * 4 + w * khG * volMult * jobMult * 4 + w * fatG * 9),
    protein: Math.round(w * proteinG * volMult),
    carbs: Math.round(w * khG * volMult * jobMult),
    fat: Math.round(w * fatG)
  };
  if (typeof saveData === 'function') saveData(data);
  var el = document.getElementById('ern-save-confirm');
  if (el) { el.textContent = '\u2713 Plan gespeichert! Sichtbar auf dem Dashboard.'; el.style.display = 'block'; }
}

// ===== HF-ZONEN RECHNER =====
function calcHFZonen() {
  var ageErr = validateCalcInput(document.getElementById('hf-age')?.value, 10, 80, 'Alter');
  var restErr = validateCalcInput(document.getElementById('hf-rest')?.value, 30, 120, 'Ruhepuls');
  var err = ageErr || restErr;
  if (err) { showCalcError('hf-results', err); return; }
  const age = parseInt(document.getElementById('hf-age')?.value) || 25;
  const rest = parseInt(document.getElementById('hf-rest')?.value) || 55;
  const maxHF = 220 - age;

  function zone(pct) {
    return Math.round(rest + (maxHF - rest) * pct);
  }

  const zones = [
    { name: 'Zone 1 – Aktive Erholung', min: zone(.5), max: zone(.6), color: '#7eb4ff', desc: 'Mobility, Cool-down, leichter Spaziergang' },
    { name: 'Zone 2 – Aerobe Basis', min: zone(.6), max: zone(.7), color: '#6dffa7', desc: 'Fahrrad zur Arbeit, leichter Lauf – TÄGLICH' },
    { name: 'Zone 3 – Aerob intensiv', min: zone(.7), max: zone(.8), color: '#f5c518', desc: 'Mittleres Tempo, Fartlek-Mittelstrecke' },
    { name: 'Zone 4 – Laktatschwelle', min: zone(.8), max: zone(.9), color: '#ffb47a', desc: 'HIIT-Runden, intensives Sparring' },
    { name: 'Zone 5 – VO₂max', min: zone(.9), max: maxHF, color: '#ff7a80', desc: '30-Sek-Sprints, SIT – max. 1×/Woche' }
  ];

  const el = document.getElementById('hf-results');
  el.style.display = 'block';
  el.innerHTML = `
    <div class="calc-meta">Max HF: ${maxHF} bpm · Ruhepuls: ${rest} bpm · Methode: Karvonen</div>
    ${zones.map(z => `
      <div class="calc-zone-row" style="border-left:3px solid ${z.color};">
        <div class="calc-zone-bpm" style="color:${z.color};">${z.min}–${z.max} bpm</div>
        <div><div class="calc-zone-name">${z.name}</div><div class="calc-zone-desc">${z.desc}</div></div>
      </div>`).join('')}`;
}

// ===== WETTKAMPF-PREP RECHNER =====
function calcWettkampfPrep() {
  var curErr = validateCalcInput(document.getElementById('cut-current')?.value, 40, 200, 'Aktuelles Gewicht');
  var tgtErr = validateCalcInput(document.getElementById('cut-target')?.value, 40, 200, 'Zielgewicht');
  var wksErr = validateCalcInput(document.getElementById('cut-weeks')?.value, 1, 52, 'Wochen');
  var err = curErr || tgtErr || wksErr;
  if (err) { showCalcError('cut-results', err); return; }
  const cur = parseFloat(document.getElementById('cut-current')?.value) || 82;
  const tgt = parseFloat(document.getElementById('cut-target')?.value) || 75;
  const wks = parseInt(document.getElementById('cut-weeks')?.value) || 8;
  const diff = cur - tgt;
  const perWeek = diff / wks;

  const el = document.getElementById('cut-results');
  el.style.display = 'block';

  let status, color, plan;
  if (diff <= 0) {
    status = 'Du bist bereits in der Klasse!';
    color = 'var(--green)';
    plan = 'Gewicht halten, Fokus auf Leistung.';
  } else if (diff <= 2 && wks >= 1) {
    status = 'Wassergewicht reicht';
    color = 'var(--gold)';
    plan = `${diff.toFixed(1)} kg können als Wassergewicht in 48–72h reduziert werden. Natrium auf 500mg/Tag, leichte Sauna. Kein Cutten nötig.`;
  } else if (perWeek <= 0.8) {
    status = 'Nachhaltiges Cutten möglich';
    color = 'var(--green)';
    plan = `${perWeek.toFixed(2)} kg/Woche. Defizit: ~${Math.round(perWeek * 1100)} kcal/Tag. Protein auf 2.6g/kg. Keine Leistungseinbußen.`;
  } else if (perWeek <= 1.2) {
    status = 'Aggressives Cutten nötig';
    color = 'var(--gold)';
    plan = `${perWeek.toFixed(2)} kg/Woche ist grenzwertig. Gewichtsklasse überdenken oder früher beginnen. Leistungseinbußen möglich.`;
  } else {
    status = 'Gewichtsklasse zu niedrig!';
    color = 'var(--red)';
    plan = `${perWeek.toFixed(2)} kg/Woche ist nicht realistisch ohne massive Leistungseinbußen. <strong>Empfehle nächsthöhere Klasse.</strong>`;
  }

  el.innerHTML = `
    <div class="calc-cut-box" style="border-left:4px solid ${color};">
      <div class="calc-cut-status" style="color:${color};">${status}</div>
      <div class="calc-cut-plan">${plan}</div>
      <div class="calc-cut-stats">
        <div class="calc-cut-stat"><div class="calc-cut-stat-val">${diff.toFixed(1)}</div><div class="calc-cut-stat-label">kg zu reduzieren</div></div>
        <div class="calc-cut-stat"><div class="calc-cut-stat-val">${wks}</div><div class="calc-cut-stat-label">Wochen Zeit</div></div>
        <div class="calc-cut-stat"><div class="calc-cut-stat-val" style="color:${color};">${perWeek.toFixed(2)}</div><div class="calc-cut-stat-label">kg/Woche Ziel</div></div>
      </div>
    </div>`;
}

// ===== 1RM RECHNER =====
function calc1RM() {
  var wErr = validateCalcInput(document.getElementById('rm-weight')?.value, 1, 500, 'Gewicht');
  var rErr = validateCalcInput(document.getElementById('rm-reps')?.value, 1, 30, 'Wiederholungen');
  var err = wErr || rErr;
  if (err) { showCalcError('rm-results', err); return; }
  const weight = parseFloat(document.getElementById('rm-weight')?.value) || 80;
  const reps = parseInt(document.getElementById('rm-reps')?.value) || 5;

  // Epley formula
  const oneRM = Math.round(weight * (1 + reps / 30));
  var repWarning = reps > 10 ? '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:var(--gold);padding:8px 0;margin-bottom:8px;">⚠ Schätzung wird ungenauer über 10 Wiederholungen. Teste mit ≤5 Reps für präzisere Werte.</div>' : '';

  const percentages = [
    { pct: 100, label: '1RM (Max)', color: 'var(--red)' },
    { pct: 90, label: '90% · 3–4 Reps', color: 'var(--orange)' },
    { pct: 85, label: '85% · Peak Phase', color: 'var(--gold)' },
    { pct: 80, label: '80% · PAPE Squats', color: 'var(--gold)' },
    { pct: 75, label: '75% · Wettkampf-S&C', color: 'var(--blue)' },
    { pct: 70, label: '70% · Aufbauphase', color: 'var(--green)' },
    { pct: 60, label: '60% · Speed Work', color: 'var(--green)' },
    { pct: 30, label: '30% · BFR / Jump Squat', color: 'var(--purple)' }
  ];

  const el = document.getElementById('rm-results');
  el.style.display = 'block';
  el.innerHTML = `
    <div class="calc-rm-hero">
      <div class="calc-rm-title">Geschätztes 1RM: <span>${oneRM} kg</span></div>
      <div class="calc-rm-sub">Basierend auf ${weight} kg × ${reps} Reps (Epley-Formel)</div>
      ${repWarning}
    </div>
    ${percentages.map(p => {
      const val = Math.round(oneRM * p.pct / 100);
      return `<div class="calc-rm-row" style="border-left:3px solid ${p.color};">
        <div class="calc-rm-val">${val} kg</div>
        <div style="flex:1;">
          <div class="calc-rm-pct" style="color:${p.color};">${p.pct}%</div>
          <div class="calc-rm-label">${p.label}</div>
        </div>
      </div>`;
    }).join('')}`;
}
