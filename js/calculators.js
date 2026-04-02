/* ============================================
   FIGHTOS — Calculators
   Makros, HF-Zonen, Wettkampf-Prep, 1RM
   ============================================ */

// ===== MAKRO RECHNER (Ernährung page) =====
function calcMakrosErn() {
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
    <div class="calc-result-card"><div class="calc-result-val" style="color:#7eb4ff">${p}g</div><div class="calc-result-unit">Protein</div><div class="calc-result-desc">${proteinG}g/kg · ${perMeal}g/Mahlzeit</div></div>
    <div class="calc-result-card"><div class="calc-result-val" style="color:#6dffa7">${k}g</div><div class="calc-result-unit">Kohlenhydrate</div><div class="calc-result-desc">${khG}g/kg</div></div>
    <div class="calc-result-card"><div class="calc-result-val" style="color:#ffb47a">${f}g</div><div class="calc-result-unit">Fett</div><div class="calc-result-desc">${fatG}g/kg</div></div>`;

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
    <div style="background:#141414;border:1px solid #1e1e1e;border-radius:6px;padding:20px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;color:var(--white);margin-bottom:14px;">MAHLZEITEN-AUFTEILUNG · ${phaseLabel}</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;padding:8px;background:#1a1a1a;border-radius:4px;"><span style="color:var(--light)">${mealTimes.pre} Vor-Training</span><span style="color:#7eb4ff">${Math.round(p*0.08)}g P</span><span style="color:#6dffa7">${Math.round(k*0.1)}g KH</span></div>
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;padding:8px;background:#1a1a1a;border-radius:4px;"><span style="color:var(--light)">${mealTimes.post} Hauptmahlzeit</span><span style="color:#7eb4ff">${Math.round(p*0.22)}g P</span><span style="color:#6dffa7">${Math.round(k*0.2)}g KH</span></div>
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;padding:8px;background:#1a1a1a;border-radius:4px;"><span style="color:var(--light)">${mealTimes.snack} Protein-Bolus</span><span style="color:#7eb4ff">${Math.round(p*0.15)}g P</span><span style="color:#6dffa7">${Math.round(k*0.1)}g KH</span></div>
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;padding:8px;background:#1a1a1a;border-radius:4px;"><span style="color:var(--light)">${mealTimes.lunch} Mittagessen</span><span style="color:#7eb4ff">${Math.round(p*0.22)}g P</span><span style="color:#6dffa7">${Math.round(k*0.3)}g KH</span></div>
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;padding:8px;background:#1a1a1a;border-radius:4px;"><span style="color:var(--light)">${mealTimes.preTrain} Pre-Training</span><span style="color:#7eb4ff">${Math.round(p*0.12)}g P</span><span style="color:#6dffa7">${Math.round(k*0.18)}g KH</span></div>
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;padding:8px;background:#1a1a1a;border-radius:4px;"><span style="color:var(--light)">${mealTimes.recovery} Recovery</span><span style="color:#7eb4ff">${Math.round(p*0.21)}g P (Casein)</span><span style="color:#6dffa7">${Math.round(k*0.12)}g KH</span></div>
      </div>
    </div>`;
}

// ===== HF-ZONEN RECHNER =====
function calcHFZonen() {
  const age = parseInt(document.getElementById('hf-age')?.value) || 25;
  const rest = parseInt(document.getElementById('hf-rest')?.value) || 55;
  const maxHF = 220 - age;

  function zone(pct) {
    return Math.round(rest + (maxHF - rest) * pct);
  }

  const zones = [
    { name: 'Zone 1 — Aktive Erholung', min: zone(.5), max: zone(.6), color: '#7eb4ff', desc: 'Mobility, Cool-down, leichter Spaziergang' },
    { name: 'Zone 2 — Aerobe Basis', min: zone(.6), max: zone(.7), color: '#6dffa7', desc: 'Fahrrad zur Arbeit, leichter Lauf — TÄGLICH' },
    { name: 'Zone 3 — Aerob intensiv', min: zone(.7), max: zone(.8), color: '#f5c518', desc: 'Mittleres Tempo, Fartlek-Mittelstrecke' },
    { name: 'Zone 4 — Laktatschwelle', min: zone(.8), max: zone(.9), color: '#ffb47a', desc: 'HIIT-Runden, intensives Sparring' },
    { name: 'Zone 5 — VO₂max', min: zone(.9), max: maxHF, color: '#ff7a80', desc: '30-Sek-Sprints, SIT — max. 1×/Woche' }
  ];

  const el = document.getElementById('hf-results');
  el.style.display = 'block';
  el.innerHTML = `
    <div style="margin-bottom:12px;font-family:'Space Mono',monospace;font-size:12px;color:#555;">Max HF: ${maxHF} bpm · Ruhepuls: ${rest} bpm · Methode: Karvonen</div>
    ${zones.map(z => `
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:10px;background:#141414;border-radius:4px;margin-bottom:6px;border-left:3px solid ${z.color};">
        <div style="min-width:90px;font-size:12px;color:${z.color};font-weight:700;font-family:'Space Mono',monospace;">${z.min}–${z.max} bpm</div>
        <div><div style="font-size:12px;color:var(--white);font-weight:600;">${z.name}</div><div style="font-size:11px;color:#666;">${z.desc}</div></div>
      </div>`).join('')}`;
}

// ===== WETTKAMPF-PREP RECHNER =====
function calcWettkampfPrep() {
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
    <div style="background:#141414;border:1px solid #1e1e1e;border-radius:6px;padding:20px;border-left:4px solid ${color};">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${color};margin-bottom:8px;">${status}</div>
      <div style="font-size:13px;color:#aaa;line-height:1.8;">${plan}</div>
      <div style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit, minmax(100px, 1fr));gap:10px;">
        <div style="text-align:center;padding:12px;background:#1a1a1a;border-radius:4px;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--white);">${diff.toFixed(1)}</div>
          <div style="font-size:12px;color:#555;">kg zu reduzieren</div>
        </div>
        <div style="text-align:center;padding:12px;background:#1a1a1a;border-radius:4px;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--white);">${wks}</div>
          <div style="font-size:12px;color:#555;">Wochen Zeit</div>
        </div>
        <div style="text-align:center;padding:12px;background:#1a1a1a;border-radius:4px;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:${color};">${perWeek.toFixed(2)}</div>
          <div style="font-size:12px;color:#555;">kg/Woche Ziel</div>
        </div>
      </div>
    </div>`;
}

// ===== 1RM RECHNER =====
function calc1RM() {
  const weight = parseFloat(document.getElementById('rm-weight')?.value) || 80;
  const reps = parseInt(document.getElementById('rm-reps')?.value) || 5;

  // Epley formula
  const oneRM = Math.round(weight * (1 + reps / 30));

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
    <div style="margin-bottom:16px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;color:var(--white);">Geschätztes 1RM: <span style="color:var(--orange)">${oneRM} kg</span></div>
      <div style="font-family:'Space Mono',monospace;font-size:12px;color:#555;">Basierend auf ${weight} kg × ${reps} Reps (Epley-Formel)</div>
    </div>
    ${percentages.map(p => {
      const val = Math.round(oneRM * p.pct / 100);
      return `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:8px;background:#141414;border-radius:4px;margin-bottom:4px;border-left:3px solid ${p.color};">
        <div style="min-width:60px;font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--white);">${val} kg</div>
        <div style="flex:1;">
          <div style="font-family:'Space Mono',monospace;font-size:12px;color:${p.color};">${p.pct}%</div>
          <div style="font-size:11px;color:#666;">${p.label}</div>
        </div>
      </div>`;
    }).join('')}`;
}
