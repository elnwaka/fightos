/* ============================================
   FIGHTOS — Core Application Logic
   Auth, Navigation, Fight Date, HRV, Logs
   ============================================ */

// ===== STATE =====
let currentUser = null;
let editingBlock = null;

// ===== BENCHMARK CONSTANTS =====
const BENCH_LEVEL_THRESHOLDS = [
  { max: 40,  label: 'Anfänger',       color: '#555' },
  { max: 65,  label: 'Fortgeschritten', color: 'var(--blue)' },
  { max: 85,  label: 'Gut',            color: 'var(--gold)' },
  { max: 101, label: 'Elite',          color: 'var(--green)' }
];

// Elite = oberes Quartil Nationalkader (Smith et al. PMC3863921, Haugen et al. 2020)
// Cooper: England int'l Ø VO₂max 63.8 → Ø 3360m, Top 70.0 → 3634m
// CMJ: Nationalkader Kampfsport Ø 39.6cm (Haugen, n=989), Top ~50cm
// Deadlift: Boxing Science 2.0x erfahren, Judo CAN 2.5x Nationalkader
const PULLUP_TIERS   = [[60, 25], [75, 20], [90, 16], [Infinity, 12]];
const CMJ_TIERS      = [[60, 50], [75, 45], [90, 40], [Infinity, 36]];
const PUNCH_TIERS    = [[60, 75], [75, 68], [90, 60], [Infinity, 52]];
const COOPER_TIERS   = [[60, 3700], [75, 3500], [90, 3300], [Infinity, 3100]];

function scaleByWeight(bw, tiers) {
  for (const [maxW, val] of tiers) { if (bw <= maxW) return val; }
  return tiers[tiers.length - 1][1];
}

function getBenchLevel(pct) {
  for (const t of BENCH_LEVEL_THRESHOLDS) { if (pct < t.max) return t; }
  return BENCH_LEVEL_THRESHOLDS[BENCH_LEVEL_THRESHOLDS.length - 1];
}

function getUserAge() {
  const users = JSON.parse(localStorage.getItem('fos_users') || '{}');
  const u = users[currentUser];
  const birthYear = u && u.birthYear ? parseInt(u.birthYear) : null;
  if (!birthYear) return null;
  return new Date().getFullYear() - birthYear;
}

// ===== AUTH =====
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (tab === 'login' ? i === 0 : i === 1));
  });
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('auth-msg').textContent = '';
}

function doRegister() {
  const user = document.getElementById('reg-user').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const msg = document.getElementById('auth-msg');
  if (!user || !pass) { msg.className = 'auth-msg error'; msg.textContent = 'Alle Felder ausfüllen!'; return; }
  if (pass.length < 3) { msg.className = 'auth-msg error'; msg.textContent = 'Passwort zu kurz!'; return; }
  const users = JSON.parse(localStorage.getItem('fos_users') || '{}');
  if (users[user]) { msg.className = 'auth-msg error'; msg.textContent = 'Name bereits vergeben!'; return; }
  users[user] = { pass, onboardingDone: false, created: new Date().toISOString() };
  localStorage.setItem('fos_users', JSON.stringify(users));
  // Init user data
  const data = { fights: [], log: [], hrv: [], fightDate: '', weekPlan: {} };
  localStorage.setItem('fos_data_' + user, JSON.stringify(data));
  msg.className = 'auth-msg success'; msg.textContent = 'Account erstellt! Logge dich ein.';
  switchAuthTab('login');
}

function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const msg = document.getElementById('auth-msg');
  if (!user || !pass) { msg.className = 'auth-msg error'; msg.textContent = 'Alle Felder ausfüllen!'; return; }
  const users = JSON.parse(localStorage.getItem('fos_users') || '{}');
  if (!users[user] || users[user].pass !== pass) { msg.className = 'auth-msg error'; msg.textContent = 'Falsche Daten!'; return; }
  currentUser = user;
  localStorage.setItem('fos_current', user);
  // Migration: existing users with weight but no onboardingDone flag
  if (users[user].weight && !users[user].onboardingDone) {
    users[user].onboardingDone = true;
    users[user].nickname = users[user].nickname || user;
    users[user].experienceLevel = users[user].experienceLevel || 'fortgeschritten';
    users[user].boxingYears = users[user].boxingYears || 1;
    users[user].height = users[user].height || 175;
    users[user].goal = users[user].goal || 'fitness';
    users[user].fitnessLevel = users[user].fitnessLevel || 'mittel';
    localStorage.setItem('fos_users', JSON.stringify(users));
  }
  if (!users[user].onboardingDone) {
    showOnboarding();
    return;
  }
  enterApp();
}

function doLogout() {
  currentUser = null;
  localStorage.removeItem('fos_current');
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
}

// ===== ONBOARDING WIZARD =====
let obCurrentStep = 0;
const obData = {};

const OB_STEPS = [
  {
    title: 'WER BIST DU?',
    sub: 'Dein Name im Ring und ein paar Basics.',
    render() {
      const yOpts = Array.from({length:43}, (_,i) => {
        const y = 2012 - i;
        return `<option value="${y}" ${y===2000?'selected':''}>${y}</option>`;
      }).join('');
      return `<div class="form-group">
        <label class="form-label">SPITZNAME</label>
        <input class="form-input" id="ob-nickname" placeholder="Wie sollen wir dich nennen?" value="${obData.nickname||''}">
      </div>
      <div class="form-group">
        <label class="form-label">GEBURTSJAHR</label>
        <select class="form-select" id="ob-birthyear">
          <option value="">— Wählen —</option>${yOpts}
        </select>
      </div>`;
    },
    validate() {
      const n = document.getElementById('ob-nickname').value.trim();
      const y = document.getElementById('ob-birthyear').value;
      if (!n) return 'Gib einen Namen ein.';
      if (!y) return 'Wähle dein Geburtsjahr.';
      obData.nickname = n;
      obData.birthYear = y;
      return null;
    }
  },
  {
    title: 'DEIN KÖRPER',
    sub: 'Gewicht und Größe — damit sich alles an dich anpasst.',
    render() {
      const wOpts = [50,55,60,65,70,75,80,85,90,95,100].map(w =>
        `<option value="${w}" ${(obData.weight||75)==w?'selected':''}>${w} kg</option>`
      ).join('') + `<option value="100+" ${obData.weight==='100+'?'selected':''}>100+ kg</option>`;
      return `<div class="ob-form-row">
        <div class="form-group">
          <label class="form-label">GEWICHTSKLASSE</label>
          <select class="form-select" id="ob-weight">${wOpts}</select>
        </div>
        <div class="form-group">
          <label class="form-label">GRÖSSE (CM)</label>
          <input class="form-input" id="ob-height" type="number" placeholder="175" value="${obData.height||''}" min="140" max="220">
        </div>
      </div>`;
    },
    validate() {
      const w = document.getElementById('ob-weight').value;
      const h = document.getElementById('ob-height').value;
      if (!h || h < 140 || h > 220) return 'Gib eine gültige Größe ein (140–220 cm).';
      obData.weight = w;
      obData.height = parseInt(h);
      return null;
    }
  },
  {
    title: 'DEIN LEVEL',
    sub: 'Wo stehst du gerade im Boxen?',
    render() {
      const opts = [
        { val:'anfaenger', icon:'🥊', label:'ANFÄNGER', desc:'Noch kein Wettkampf, lerne die Grundlagen' },
        { val:'fortgeschritten', icon:'💪', label:'FORTGESCHRITTEN', desc:'Regelmäßiges Training, erste Sparring-Erfahrung' },
        { val:'wettkampf', icon:'🏆', label:'WETTKÄMPFER', desc:'Aktiver Wettkampf-Boxer mit Kampferfahrung' }
      ];
      return `<div class="ob-options">${opts.map(o =>
        `<div class="ob-option ${obData.experienceLevel===o.val?'selected':''}" data-val="${o.val}" onclick="obSelectOption(this,'experienceLevel')">
          <div class="ob-option-icon">${o.icon}</div>
          <div class="ob-option-text">
            <div class="ob-option-label">${o.label}</div>
            <div class="ob-option-desc">${o.desc}</div>
          </div>
        </div>`).join('')}
      </div>
      <div class="form-group" style="margin-top:14px;">
        <label class="form-label">JAHRE BOXERFAHRUNG</label>
        <input class="form-input" id="ob-years" type="number" placeholder="z.B. 2" value="${obData.boxingYears||''}" min="0" max="40">
      </div>`;
    },
    validate() {
      if (!obData.experienceLevel) return 'Wähle dein Level.';
      obData.boxingYears = parseInt(document.getElementById('ob-years').value) || 0;
      return null;
    }
  },
  {
    title: 'DEIN ZEITPLAN',
    sub: 'Wann arbeitest du, wann trainierst du?',
    render() {
      return `<div class="ob-form-row">
        <div class="form-group">
          <label class="form-label">ARBEITSZEIT VON</label>
          <input class="form-input" id="ob-work-start" type="time" value="${obData.workStart||'08:00'}">
        </div>
        <div class="form-group">
          <label class="form-label">ARBEITSZEIT BIS</label>
          <input class="form-input" id="ob-work-end" type="time" value="${obData.workEnd||'17:00'}">
        </div>
      </div>
      <div class="form-group" style="margin-top:4px;">
        <label class="form-label">BOXTRAINING (UHRZEIT)</label>
        <input class="form-input" id="ob-training" type="time" value="${obData.trainingTime||'18:00'}">
        <div style="font-size:12px;color:#444;margin-top:4px;">Tagesgenau anpassbar unter Mein Account.</div>
      </div>`;
    },
    validate() {
      obData.workStart = document.getElementById('ob-work-start').value || '08:00';
      obData.workEnd = document.getElementById('ob-work-end').value || '17:00';
      obData.trainingTime = document.getElementById('ob-training').value || '18:00';
      return null;
    }
  },
  {
    title: 'DEIN ZIEL',
    sub: 'Was willst du mit FightOS erreichen?',
    render() {
      const opts = [
        { val:'erster-kampf', icon:'🎯', label:'ERSTER KAMPF', desc:'Ich will meinen ersten Wettkampf bestreiten' },
        { val:'wettkampf-vorbereitung', icon:'⚔️', label:'KAMPFVORBEREITUNG', desc:'Ich habe einen Kampf geplant und bereite mich vor' },
        { val:'gewicht-wechsel', icon:'⚖️', label:'GEWICHTSKLASSE WECHSELN', desc:'Ich will eine Klasse runter oder rauf' },
        { val:'fitness', icon:'💥', label:'BOXER-FITNESS', desc:'Fit wie ein Boxer, kein Wettkampf geplant' }
      ];
      return `<div class="ob-options">${opts.map(o =>
        `<div class="ob-option ${obData.goal===o.val?'selected':''}" data-val="${o.val}" onclick="obSelectOption(this,'goal')">
          <div class="ob-option-icon">${o.icon}</div>
          <div class="ob-option-text">
            <div class="ob-option-label">${o.label}</div>
            <div class="ob-option-desc">${o.desc}</div>
          </div>
        </div>`).join('')}
      </div>`;
    },
    validate() {
      if (!obData.goal) return 'Wähle dein Ziel.';
      return null;
    }
  },
  {
    title: 'KAMPFDATUM',
    sub: 'Hast du schon einen Kampf geplant? Falls nicht, überspringe diesen Schritt.',
    render() {
      return `<div class="form-group">
        <label class="form-label">KAMPFDATUM (OPTIONAL)</label>
        <input class="form-input" id="ob-fightdate" type="date" value="${obData.fightDate||''}">
        <div style="font-size:12px;color:#444;margin-top:4px;">Wenn gesetzt, passt sich dein Wochenplan automatisch an die Kampfvorbereitung an.</div>
      </div>`;
    },
    validate() {
      obData.fightDate = document.getElementById('ob-fightdate').value || '';
      return null;
    }
  },
  {
    title: 'AKTUELLE FITNESS',
    sub: 'Ehrliche Selbsteinschätzung — hilft uns, realistische Ziele zu setzen.',
    render() {
      const opts = [
        { val:'schlecht', icon:'😤', label:'EINSTEIGER', desc:'Wenig Grundfitness, fange gerade erst an' },
        { val:'mittel', icon:'👊', label:'SOLIDE BASIS', desc:'Regelmäßig aktiv, kann 3 Runden durchboxen' },
        { val:'gut', icon:'🔥', label:'FIT', desc:'Gute Ausdauer und Kraft, trainiere mehrmals die Woche' },
        { val:'sehr-gut', icon:'⚡', label:'TOP-FORM', desc:'Wettkampfbereit, hohe Belastbarkeit' }
      ];
      return `<div class="ob-options">${opts.map(o =>
        `<div class="ob-option ${obData.fitnessLevel===o.val?'selected':''}" data-val="${o.val}" onclick="obSelectOption(this,'fitnessLevel')">
          <div class="ob-option-icon">${o.icon}</div>
          <div class="ob-option-text">
            <div class="ob-option-label">${o.label}</div>
            <div class="ob-option-desc">${o.desc}</div>
          </div>
        </div>`).join('')}
      </div>`;
    },
    validate() {
      if (!obData.fitnessLevel) return 'Wähle dein aktuelles Fitness-Level.';
      return null;
    }
  }
];

function showOnboarding() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('onboarding-screen').classList.add('active');
  obCurrentStep = 0;
  obRenderStep();
}

function obRenderStep() {
  const step = OB_STEPS[obCurrentStep];
  const total = OB_STEPS.length;
  document.getElementById('ob-progress-fill').style.width = ((obCurrentStep + 1) / total * 100) + '%';
  document.getElementById('ob-step-label').textContent = `SCHRITT ${obCurrentStep + 1} / ${total}`;
  document.getElementById('ob-msg').textContent = '';

  // Back button visibility
  document.getElementById('ob-back').style.display = obCurrentStep === 0 ? 'none' : '';

  // Next button text
  const nextBtn = document.getElementById('ob-next');
  if (obCurrentStep === total - 1) {
    nextBtn.textContent = 'LOSLEGEN';
  } else if (obCurrentStep === 5) { // fight date step
    nextBtn.textContent = obData.fightDate ? 'WEITER' : 'ÜBERSPRINGEN';
  } else {
    nextBtn.textContent = 'WEITER';
  }

  const container = document.getElementById('ob-steps');
  container.innerHTML = `<div class="ob-step active" id="ob-current-step">
    <div class="ob-title">${step.title}</div>
    <div class="ob-sub">${step.sub}</div>
    ${step.render()}
  </div>`;

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById('ob-current-step');
      if (el) el.classList.add('fade-in');
    });
  });

  // Focus first input
  setTimeout(() => {
    const firstInput = container.querySelector('input:not([type=date]):not([type=time]),select');
    if (firstInput && firstInput.type !== 'time') firstInput.focus();
  }, 100);
}

function obSelectOption(el, key) {
  el.parentElement.querySelectorAll('.ob-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  obData[key] = el.dataset.val;
  // Update fight date step skip button
  if (obCurrentStep === 5) {
    document.getElementById('ob-next').textContent = obData.fightDate ? 'WEITER' : 'ÜBERSPRINGEN';
  }
}

function obNext() {
  const step = OB_STEPS[obCurrentStep];
  const err = step.validate();
  if (err) {
    document.getElementById('ob-msg').textContent = err;
    return;
  }

  if (obCurrentStep < OB_STEPS.length - 1) {
    // Animate out
    const currentEl = document.getElementById('ob-current-step');
    if (currentEl) {
      currentEl.style.opacity = '0';
      currentEl.style.transform = 'translateY(-20px)';
    }
    setTimeout(() => {
      obCurrentStep++;
      obRenderStep();
    }, 250);
  } else {
    obComplete();
  }
}

function obPrev() {
  if (obCurrentStep > 0) {
    const currentEl = document.getElementById('ob-current-step');
    if (currentEl) {
      currentEl.style.opacity = '0';
      currentEl.style.transform = 'translateY(20px)';
    }
    setTimeout(() => {
      obCurrentStep--;
      obRenderStep();
    }, 250);
  }
}

function obComplete() {
  const users = JSON.parse(localStorage.getItem('fos_users') || '{}');
  if (!users[currentUser]) return;

  // Write all collected data
  users[currentUser].nickname = obData.nickname;
  users[currentUser].birthYear = obData.birthYear;
  users[currentUser].weight = obData.weight;
  users[currentUser].height = obData.height;
  users[currentUser].experienceLevel = obData.experienceLevel;
  users[currentUser].boxingYears = obData.boxingYears || 0;
  users[currentUser].workStart = obData.workStart;
  users[currentUser].workEnd = obData.workEnd;
  users[currentUser].trainingTime = obData.trainingTime;
  users[currentUser].goal = obData.goal;
  users[currentUser].fitnessLevel = obData.fitnessLevel;
  users[currentUser].onboardingDone = true;
  users[currentUser].weekSchedule = getDefaultWeekSchedule(obData.trainingTime);

  localStorage.setItem('fos_users', JSON.stringify(users));

  // Set fight date if provided
  const data = getData();
  if (data) {
    if (obData.fightDate) data.fightDate = obData.fightDate;
    data.weekPlan = generateSmartWeekPlan();
    saveData(data);
  }

  // Hide onboarding, enter app
  document.getElementById('onboarding-screen').classList.remove('active');
  enterApp();
}

// Display name: Alter Ego > Nickname > Username
function getDisplayName() {
  const data = getData();
  if (data && data.alterEgo && data.alterEgo.name) return data.alterEgo.name;
  const s = getUserSchedule();
  return s.nickname || currentUser;
}

function enterApp() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  document.getElementById('user-pill').textContent = getDisplayName();
  // Cleanup old completed blocks (keep only current week)
  const data = getData();
  if (data && data.completedBlocks) {
    const weekId = getWeekId();
    const cleaned = {};
    for (const [k, v] of Object.entries(data.completedBlocks)) {
      if (k.endsWith(weekId)) cleaned[k] = v;
    }
    data.completedBlocks = cleaned;
    saveData(data);
  }
  // Init pages content
  if (typeof renderAllPages === 'function') renderAllPages();
  renderDashboard();
  renderLogEntries();
}

// NOTE: Auto-login + event listeners are in index.html init script
// (runs AFTER all JS files are loaded)

// ===== DATA HELPERS =====
function getData() {
  if (!currentUser) return null;
  const raw = localStorage.getItem('fos_data_' + currentUser);
  if (raw) return JSON.parse(raw);
  const data = { fights: [], log: [], hrv: [], fightDate: '', weekPlan: getDefaultWeekPlan() };
  localStorage.setItem('fos_data_' + currentUser, JSON.stringify(data));
  return data;
}

function saveData(data) {
  if (!currentUser) return;
  localStorage.setItem('fos_data_' + currentUser, JSON.stringify(data));
}

// ===== NAVIGATION =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.nav-hub').forEach(h => h.classList.remove('active'));
  document.querySelectorAll('.nav-drop-item').forEach(d => d.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  let navPage = pageId;
  if (pageId === 'saeulen-detail') navPage = 'saeulen';
  if (pageId === 'uebung-detail') navPage = 'uebungen';
  if (pageId === 'supplement-detail') navPage = 'supplements';
  // Highlight direct nav button
  const btn = document.querySelector(`.nav-btn[data-page="${navPage}"]`);
  if (btn) btn.classList.add('active');
  // Highlight dropdown item + parent hub
  const dropItem = document.querySelector(`.nav-drop-item[data-page="${navPage}"]`);
  if (dropItem) {
    dropItem.classList.add('active');
    const hub = dropItem.closest('.nav-hub');
    if (hub) hub.classList.add('active');
  }
  // Highlight topbar icon buttons
  document.querySelectorAll('.topbar-icon-btn').forEach(b => b.classList.remove('active'));
  if (navPage === 'log') {
    const logBtn = document.querySelector('.topbar-icon-btn[title="Trainingslog"]');
    if (logBtn) logBtn.classList.add('active');
  }
  // Special render for certain pages
  if (pageId === 'wochenplan') renderWeekPlan();
  if (pageId === 'dashboard') renderDashboard();
  if (pageId === 'tests') renderTestsPage();
  if (pageId === 'account') renderAccountPage();
  window.scrollTo(0, 0);
}

// ===== FIGHT DATE SYSTEM =====
function updateFightDate() {
  const data = getData();
  if (!data) return;
  const dateVal = document.getElementById('fight-date-input').value;
  // Reject dates more than 365 days in the future
  if (dateVal) {
    const diff = Math.ceil((new Date(dateVal + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000);
    if (diff > 365) {
      alert('Kampfdatum darf max. 365 Tage in der Zukunft liegen.');
      return;
    }
  }
  data.fightDate = dateVal;
  saveData(data); // Save first so generateSmartWeekPlan reads the new date
  data.weekPlan = generateSmartWeekPlan();
  saveData(data);
  renderFightCountdown();
  renderDashStats();
  renderHinweise();
  renderWeekPlan();
}

function clearFightDate() {
  const data = getData();
  if (!data) return;
  data.fightDate = '';
  document.getElementById('fight-date-input').value = '';
  saveData(data);
  data.weekPlan = generateSmartWeekPlan();
  saveData(data);
  renderFightCountdown();
  renderDashStats();
  renderHinweise();
  renderWeekPlan();
}

// Amateur Boxing: Kein wochenlanges Taper — nur kurze Anpassung vor Kampf
function getFightPhase(daysUntil) {
  if (daysUntil <= 0) return { name: 'RECOVERY', label: 'Regeneration', cls: 'phase-aufbau', color: 'var(--green)' };
  if (daysUntil <= 2) return { name: 'KAMPFTAG', label: 'Kampf-Modus', cls: 'phase-kampf', color: 'var(--red)' };
  if (daysUntil <= 3) return { name: 'SCHÄRFEN', label: 'Schärfen', cls: 'phase-taper', color: 'var(--blue)' };
  // Everything else = normal training with smart load management
  return { name: 'TRAINING', label: 'Normales Training', cls: 'phase-aufbau', color: 'var(--green)' };
}

function renderFightCountdown() {
  const data = getData();
  if (!data) return;
  const display = document.getElementById('fight-countdown-display');
  const input = document.getElementById('fight-date-input');
  if (data.fightDate) input.value = data.fightDate;

  if (!data.fightDate) {
    display.innerHTML = `
      <div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;letter-spacing:2px;">KEIN KAMPF GEPLANT</div>
      <div class="phase-badge phase-aufbau" style="margin-top:12px;">NORMALES TRAINING</div>
      <div style="font-size:12px;color:#666;margin-top:12px;">Kein Kampf geplant \u2014 trage ein Datum ein und dein kompletter Plan passt sich automatisch an.</div>`;
    return;
  }

  const fightDay = new Date(data.fightDate + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.ceil((fightDay - today) / 86400000);
  const phase = getFightPhase(diff);

  if (diff < -2) {
    display.innerHTML = `
      <div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;">Letzter Kampf: ${formatDate(data.fightDate)}</div>
      <div class="phase-badge phase-aufbau" style="margin-top:12px;">NORMALES TRAINING</div>
      <div style="font-size:12px;color:#666;margin-top:12px;">Trage den nächsten Kampf ein wenn er feststeht.</div>`;
  } else if (diff < 0) {
    display.innerHTML = `
      <div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;">Kampf war am ${formatDate(data.fightDate)}</div>
      <div class="phase-badge phase-aufbau" style="margin-top:12px;">RECOVERY</div>
      <div style="font-size:12px;color:#666;margin-top:12px;">24–48h leichte Regeneration, dann zurück ins Training.</div>`;
  } else if (diff === 0) {
    display.innerHTML = `
      <div class="fight-countdown-num" style="color:var(--red);">HEUTE</div>
      <div class="fight-countdown-label">KAMPFTAG</div>
      <div class="phase-badge phase-kampf" style="margin-top:12px;">FIGHT DAY</div>`;
  } else if (diff === 1) {
    display.innerHTML = `
      <div class="fight-countdown-num" style="color:var(--gold);">MORGEN</div>
      <div class="fight-countdown-label">KAMPF · ${formatDate(data.fightDate)}</div>
      <div class="phase-badge phase-taper" style="margin-top:12px;">NUR LEICHT HEUTE</div>`;
  } else {
    display.innerHTML = `
      <div class="fight-countdown-num">${diff}</div>
      <div class="fight-countdown-label">TAGE BIS ZUM KAMPF · ${formatDate(data.fightDate)}</div>
      <div class="phase-badge ${phase.cls}" style="margin-top:12px;">${phase.name}</div>
      ${diff <= 4 ? '<div style="font-size:12px;color:#888;margin-top:8px;">Schärfungsphase: Training leicht anpassen, kein neues hartes Sparring mehr.</div>' : '<div style="font-size:12px;color:#666;margin-top:8px;">Normales Training. Erst 3–4 Tage vor Kampf leicht anpassen.</div>'}`;
  }
}

// ===== DASHBOARD STATS — MEASURABLE PERFORMANCE PROFILE =====

// 3 radar axes — only real, testable performance dimensions
const RADAR_AXES = [
  { key:'kraft',       label:'MAXIMALKRAFT',  color:'var(--red)',   hex:'#e8000d' },
  { key:'explosiv',    label:'EXPLOSIVITÄT',  color:'var(--gold)',  hex:'#f5c518' },
  { key:'ausdauer',    label:'AUSDAUER',      color:'var(--blue)',  hex:'#2979ff' },
  { key:'koerper',     label:'KÖRPER',        color:'var(--green)', hex:'#4caf50' }
];

function calcProfileScores(data) {
  const b = data.benchmarks || {};
  const s = getUserSchedule();
  const bw = parseFloat(s.weight) || 75;
  const age = getUserAge() || 25;
  const bfTarget = age < 25 ? 8 : age <= 35 ? 10 : 12;

  function pct(val, target) {
    return val ? Math.min(100, (val / target) * 100) : null;
  }
  function inversePct(val, target) {
    if (!val) return null;
    const upper = 25;
    return Math.min(100, Math.max(0, ((upper - val) / (upper - target)) * 100));
  }
  function avg(tests) {
    const filled = tests.filter(t => t !== null);
    return filled.length ? Math.round(filled.reduce((a, v) => a + v, 0) / filled.length) : null;
  }

  const kraft = avg([
    pct(b.deadlift, bw * 2.5),
    pct(b.pullups, scaleByWeight(bw, PULLUP_TIERS))
  ]);

  const explosiv = avg([
    pct(b.cmj, scaleByWeight(bw, CMJ_TIERS)),
    pct(b.punch_freq, scaleByWeight(bw, PUNCH_TIERS))
  ]);

  const ausdauer = avg([
    pct(b.cooper, scaleByWeight(bw, COOPER_TIERS))
  ]);

  const koerper = avg([
    inversePct(b.bodyfat, bfTarget)
  ]);

  return { kraft, explosiv, ausdauer, koerper };
}

function renderDashStats() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('dash-stats');

  // Set player name (Alter Ego > Nickname > Username)
  const nameEl = document.getElementById('rpg-player-name');
  if (nameEl) nameEl.textContent = getDisplayName().toUpperCase();

  // Subtitle
  const fights = data.fights || [];
  const wins = fights.filter(f => f.result === 'S').length;
  const losses = fights.filter(f => f.result === 'N').length;
  const totalLog = (data.log || []).length;
  let weeks = 0;
  if (data.log && data.log.length) {
    const first = new Date(data.log[data.log.length - 1].date);
    weeks = Math.max(1, Math.round((Date.now() - first) / (7 * 86400000)));
  }
  const subEl = document.getElementById('rpg-subtitle');
  if (subEl) {
    let phase = 'AUFBAU';
    if (data.fightDate) {
      const diff = Math.ceil((new Date(data.fightDate + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000);
      phase = getFightPhase(diff).label.toUpperCase();
    }
    subEl.textContent = `${wins}S / ${losses}N  ·  ${totalLog} EINHEITEN  ·  WOCHE ${weeks}  ·  ${phase}`;
  }

  // Calculate scores from real benchmarks
  const scores = calcProfileScores(data);
  const filled = Object.values(scores).filter(v => v !== null);
  const overall = filled.length ? Math.round(filled.reduce((a, b) => a + b, 0) / filled.length) : null;

  el.innerHTML = `
    <div class="rpg-stat-grid">
      ${RADAR_AXES.map(a => {
        const val = scores[a.key];
        const hasVal = val !== null;
        return `<div class="rpg-stat">
          <div class="rpg-stat-info">
            <div class="rpg-stat-top">
              <span class="rpg-stat-label">${a.label}</span>
              <span class="rpg-stat-value" style="color:${hasVal ? a.color : '#333'};">${hasVal ? val : '—'}</span>
            </div>
            <div class="rpg-stat-bar">
              <div class="rpg-stat-fill" style="width:${hasVal ? val : 0}%;background:${a.color};"></div>
            </div>
          </div>
        </div>`;
      }).join('')}
      <div class="rpg-stat" style="margin-top:6px;padding-top:10px;border-top:1px solid #1e1e1e;">
        <div class="rpg-stat-info">
          <div class="rpg-stat-top">
            <span class="rpg-stat-label">GESAMT</span>
            <span class="rpg-stat-value" style="color:var(--gold);font-size:24px;">${overall !== null ? overall : '—'}<span style="font-size:12px;color:#444;"> / 100</span></span>
          </div>
          <div class="rpg-stat-bar">
            <div class="rpg-stat-fill" style="width:${overall || 0}%;background:linear-gradient(90deg,var(--red),var(--gold));"></div>
          </div>
        </div>
      </div>
    </div>`;

  renderRadarChart(scores);
}

function renderRadarChart(canvasOrScores, scoresArg) {
  let canvas, scores;
  if (canvasOrScores instanceof HTMLCanvasElement) {
    canvas = canvasOrScores;
    scores = scoresArg;
  } else {
    canvas = document.getElementById('rpg-radar');
    scores = canvasOrScores;
  }
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(cx, cy) - 40;
  const n = RADAR_AXES.length;
  const keys = RADAR_AXES.map(a => a.key);

  ctx.clearRect(0, 0, w, h);

  // Grid rings with % labels
  [25, 50, 75, 100].forEach((pct, ri) => {
    const rr = (r / 4) * (ri + 1);
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = ri === 3 ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.04)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // % label on first axis
    ctx.fillStyle = '#333';
    ctx.font = '9px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(pct + '%', cx + 4, cy - rr + 3);
  });

  // Axis lines + labels
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.stroke();

    const lx = cx + Math.cos(angle) * (r + 24);
    const ly = cy + Math.sin(angle) * (r + 24);
    ctx.save();
    ctx.font = '600 9px "Space Mono", monospace';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(RADAR_AXES[i].label, lx, ly);
    ctx.restore();
  }

  // Check if all scores are null — show empty state message
  const allNull = keys.every(k => scores[k] === null || scores[k] === undefined);
  if (allNull) {
    ctx.save();
    ctx.font = '14px "Space Mono", monospace';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Trage Benchmarks ein', cx, cy);
    ctx.restore();
    return;
  }

  // Data polygon
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const idx = i % n;
    const angle = (Math.PI * 2 / n) * idx - Math.PI / 2;
    const val = (scores[keys[idx]] || 0) / 100;
    const x = cx + Math.cos(angle) * r * val;
    const y = cy + Math.sin(angle) * r * val;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(232,0,13,.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,0,13,.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data points
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    const raw = scores[keys[i]];
    const val = (raw || 0) / 100;
    const x = cx + Math.cos(angle) * r * val;
    const y = cy + Math.sin(angle) * r * val;
    ctx.beginPath();
    ctx.arc(x, y, raw !== null ? 4 : 3, 0, Math.PI * 2);
    ctx.fillStyle = raw !== null ? RADAR_AXES[i].hex : '#333';
    ctx.fill();
    if (raw !== null) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); }
  }

}

// ===== HRV =====
function logHRV() {
  const val = parseInt(document.getElementById('hrv-input').value);
  if (!val || isNaN(val) || val < 1 || val > 200) {
    if (val !== undefined && val !== null && !isNaN(val) && (val < 1 || val > 200)) {
      alert('HRV-Wert muss zwischen 1 und 200 liegen.');
    }
    return;
  }
  const data = getData();
  if (!data) return;
  if (!data.hrv) data.hrv = [];
  data.hrv.unshift({ date: new Date().toISOString().split('T')[0], value: val });
  if (data.hrv.length > 90) data.hrv.pop();
  saveData(data);
  document.getElementById('hrv-input').value = '';
  renderHRV();
}

function renderHRV() {
  const data = getData();
  if (!data || !data.hrv || !data.hrv.length) {
    document.getElementById('hrv-display').innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#444;padding:8px 0;">Noch keine HRV-Daten. Trage morgens deinen RMSSD-Wert ein \u2014 die meisten Pulsuhren zeigen ihn an.</div>';
    return;
  }
  const recent = data.hrv.slice(0, 7);
  const avg7 = Math.round(recent.reduce((s, h) => s + h.value, 0) / recent.length);
  const today = data.hrv[0].value;
  const pctDiff = ((today - avg7) / avg7 * 100).toFixed(1);
  let status, color, advice;
  if (pctDiff >= 5) { status = 'GRÜN'; color = 'var(--green)'; advice = 'Volles Training, kann steigern. Perfekt für intensives S&C oder hartes Sparring.'; }
  else if (pctDiff <= -5) { status = 'ROT'; color = 'var(--red)'; advice = 'Intensität reduzieren! Zone 2 statt Kraft. Bei 3 roten Tagen → komplette Ruhe.'; }
  else { status = 'GELB'; color = 'var(--gold)'; advice = 'Training wie geplant. Beobachte den Trend.'; }

  document.getElementById('hrv-display').innerHTML = `
    <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;">
      <div style="text-align:center;">
        <div style="width:48px;height:48px;border-radius:50%;background:${color};margin:0 auto 8px;box-shadow:0 0 20px ${color}40;"></div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${color};">${status}</div>
      </div>
      <div style="flex:1;min-width:200px;">
        <div style="display:flex;gap:24px;margin-bottom:8px;">
          <div><span style="font-family:'Space Mono',monospace;font-size:11px;color:var(--grey);">HEUTE</span><br><span style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--white);">${today}</span></div>
          <div><span style="font-family:'Space Mono',monospace;font-size:11px;color:var(--grey);">7-TAGE Ø</span><br><span style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--white);">${avg7}</span></div>
          <div><span style="font-family:'Space Mono',monospace;font-size:11px;color:var(--grey);">DIFFERENZ</span><br><span style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:${color};">${pctDiff > 0 ? '+' : ''}${pctDiff}%</span></div>
        </div>
        <div style="font-size:12px;color:#888;">${advice}</div>
      </div>
    </div>`;

  renderHRVTrend(data);
}

function renderHRVTrend(data) {
  const container = document.getElementById('hrv-display');
  if (!container) return;
  const oldCanvas = document.getElementById('hrv-trend-canvas');
  if (oldCanvas) oldCanvas.remove();
  const oldLabel = document.getElementById('hrv-trend-label');
  if (oldLabel) oldLabel.remove();

  const entries = data.hrv || [];
  if (entries.length < 3) return;

  // Sort by date ascending and take last 30
  const sorted = entries.slice().sort((a, b) => a.date.localeCompare(b.date));
  const last30 = sorted.slice(-30);
  const values = last30.map(e => e.value);

  // Determine trend: compare avg of last chunk vs first chunk
  const halfLen = Math.max(1, Math.floor(values.length / 2));
  const chunkSize = Math.min(7, halfLen);
  const avgFirst = values.slice(0, chunkSize).reduce((s, v) => s + v, 0) / chunkSize;
  const avgLast = values.slice(-chunkSize).reduce((s, v) => s + v, 0) / chunkSize;
  const trendDiff = avgLast - avgFirst;
  let lineColor;
  if (trendDiff > 2) lineColor = 'var(--green)';
  else if (trendDiff < -2) lineColor = 'var(--red)';
  else lineColor = 'var(--gold)';

  // Compute 7-day moving average
  const ma7 = [];
  for (let i = 0; i < values.length; i++) {
    const win = values.slice(Math.max(0, i - 6), i + 1);
    ma7.push(win.reduce((s, v) => s + v, 0) / win.length);
  }

  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'hrv-trend-canvas';
  canvas.style.width = '100%';
  canvas.style.height = '80px';
  canvas.style.display = 'block';
  canvas.style.marginTop = '12px';
  canvas.height = 160;
  container.appendChild(canvas);

  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * 2);
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  const w = rect.width;
  const h = 80;

  const allVals = values.concat(ma7);
  const minV = Math.min(...allVals) - 2;
  const maxV = Math.max(...allVals) + 2;
  const range = maxV - minV || 1;
  const pad = 4;

  function xPos(i) { return pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2); }
  function yPos(v) { return pad + (1 - (v - minV) / range) * (h - pad * 2); }

  // Resolve CSS variable for canvas drawing
  function resolveColor(c) {
    if (!c.startsWith('var(')) return c;
    return getComputedStyle(document.documentElement).getPropertyValue(c.slice(4, -1).trim()).trim() || '#888';
  }
  const resolved = resolveColor(lineColor);

  // X-axis tick marks
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < values.length; i++) {
    ctx.beginPath();
    ctx.moveTo(xPos(i), h - pad);
    ctx.lineTo(xPos(i), h - pad + 3);
    ctx.stroke();
  }

  // 7-day moving average line (semi-transparent)
  ctx.strokeStyle = resolved;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < ma7.length; i++) {
    if (i === 0) ctx.moveTo(xPos(i), yPos(ma7[i]));
    else ctx.lineTo(xPos(i), yPos(ma7[i]));
  }
  ctx.stroke();

  // Main HRV value line
  ctx.globalAlpha = 1;
  ctx.strokeStyle = resolved;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < values.length; i++) {
    if (i === 0) ctx.moveTo(xPos(i), yPos(values[i]));
    else ctx.lineTo(xPos(i), yPos(values[i]));
  }
  ctx.stroke();

  // Dot on the most recent value
  ctx.beginPath();
  ctx.arc(xPos(values.length - 1), yPos(values[values.length - 1]), 3, 0, Math.PI * 2);
  ctx.fillStyle = resolved;
  ctx.fill();

  // Trend text label below the chart
  const change30 = values[values.length - 1] - values[0];
  const sign = change30 >= 0 ? '+' : '';
  const lblColor = change30 > 0 ? 'var(--green)' : change30 < 0 ? 'var(--red)' : 'var(--gold)';
  const label = document.createElement('div');
  label.id = 'hrv-trend-label';
  label.style.cssText = 'font-family:"Space Mono",monospace;font-size:11px;margin-top:6px;';
  label.innerHTML = '<span style="color:' + lblColor + ';">Trend: ' + sign + change30.toFixed(1) + ' RMSSD (30 Tage)</span> <span style="color:var(--grey);margin-left:8px;">7-Tage \u00D8 = transparent</span>';
  container.appendChild(label);
}

// ===== HINWEISE (merged tips + reminders) =====
function renderHinweise() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('dash-hinweise');
  if (!el) return;

  const items = []; // {text, color, priority}

  // --- Kampfphasen-Tipps ---
  if (data.fightDate) {
    const diff = Math.ceil((new Date(data.fightDate + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000);
    if (diff < -2) {
      items.push({ text:'Kampf vorbei — zurück zum normalen Training.', color:'var(--green)', priority:1 });
    } else if (diff < 0) {
      items.push({ text:'Recovery-Phase: Leichte Bewegung, viel Protein, 9+ Stunden Schlaf.', color:'var(--green)', priority:2 });
    } else if (diff === 0) {
      items.push({ text:'KAMPFTAG! PAPE Warm-up 45 Min. vor Ring. Rote Beete Shot 2–3h vorher. Box-Breathing 4-4-4-4.', color:'var(--red)', priority:5 });
    } else if (diff === 1) {
      items.push({ text:'Morgen Kampf — heute NUR leicht! Shadow Boxing + Visualisierung. Equipment packen.', color:'var(--red)', priority:5 });
    } else if (diff <= 3) {
      items.push({ text:`Kampf in ${diff} Tagen — Schärfungsphase. Kein neues Sparring, Gameplan-Pratzen schleifen.`, color:'var(--gold)', priority:4 });
    } else if (diff <= 7) {
      items.push({ text:`Kampf in ${diff} Tagen — normales Training. Hartes Sparring bis 3 Tage vor Kampf OK.`, color:'var(--blue)', priority:2 });
    } else {
      items.push({ text:`Kampf in ${diff} Tagen — volle Intensität. Kraft + Sparring + Kondition pushen.`, color:'var(--blue)', priority:1 });
    }
  }

  // --- Benchmark-Erinnerungen ---
  const today = new Date(); today.setHours(0,0,0,0);
  const benchmarks = data.benchmarks || {};
  const history = data.benchmarkHistory || {};
  const BENCH_DATA = {};
  getBenchmarks().forEach(b => { BENCH_DATA[b.id] = { name: b.name, weeks: b.interval }; });

  let neverCount = 0;
  for (const [id, cfg] of Object.entries(BENCH_DATA)) {
    const hist = history[id];
    if (!hist || !hist.length) {
      if (!benchmarks[id]) neverCount++;
    } else {
      const daysSince = Math.floor((today - new Date(hist[hist.length - 1].date)) / 86400000);
      const dueIn = cfg.weeks * 7 - daysSince;
      if (dueIn <= 0) {
        items.push({ text:`${cfg.name} — letzter Test vor ${daysSince} Tagen. Neuer Test fällig.`, color:'var(--red)', priority:2 });
      } else if (dueIn <= 7) {
        items.push({ text:`${cfg.name} — nächster Test in ${dueIn} Tagen.`, color:'var(--gold)', priority:0 });
      }
    }
  }
  if (neverCount > 0) {
    items.push({ text:`${neverCount} Tests noch nie durchgeführt — gehe zur Test-Seite.`, color:'var(--blue)', priority:1 });
  }

  // --- HRV Erinnerung ---
  const hrv = data.hrv || [];
  if (hrv.length > 0) {
    const daysSinceHRV = Math.floor((today - new Date(hrv[0].date)) / 86400000);
    if (daysSinceHRV >= 3) {
      items.push({ text:`HRV seit ${daysSinceHRV} Tagen nicht eingetragen.`, color:'var(--gold)', priority:1 });
    }
  }

  // --- Training-Pause ---
  const log = data.log || [];
  if (log.length > 0) {
    const daysSinceLog = Math.floor((today - new Date(log[0].date)) / 86400000);
    if (daysSinceLog >= 4) {
      items.push({ text:`Letzte Einheit vor ${daysSinceLog} Tagen — alles OK?`, color:'var(--gold)', priority:0 });
    }
  }

  items.sort((a, b) => b.priority - a.priority);

  // --- Getting Started guide for new users ---
  const gsUsers = JSON.parse(localStorage.getItem('fos_users') || '{}');
  const gsHasWeight = !!(gsUsers[currentUser] && gsUsers[currentUser].weight);
  const gsHasLog = data.log && data.log.length > 0;
  const gsHasBench = data.benchmarks && Object.values(data.benchmarks).some(v => v > 0);
  const gsHasHRV = data.hrv && data.hrv.length > 0;
  const completedSteps = [gsHasWeight, gsHasBench, gsHasLog, gsHasHRV].filter(Boolean).length;

  let gettingStartedHtml = '';
  if (completedSteps < 4) {
    const gsPct = Math.round((completedSteps / 4) * 100);
    const gsSteps = [
      { done: gsHasWeight, text: 'Trage dein Körpergewicht ein', action: "showPage('account')" },
      { done: gsHasBench, text: 'Mache deinen ersten Leistungstest', action: "showPage('tests')" },
      { done: gsHasLog, text: 'Logge deine erste Trainingseinheit', action: "showPage('wochenplan')" },
      { done: gsHasHRV, text: 'Trage deine HRV ein', action: "document.getElementById('hrv-input').scrollIntoView({behavior:'smooth'});document.getElementById('hrv-input').focus();" }
    ];
    let gsStepsHtml = '';
    for (const st of gsSteps) {
      const clickAttr = st.done ? '' : st.action;
      const rowStyle = st.done ? 'opacity:.5;' : 'cursor:pointer;';
      const circleColor = st.done ? 'var(--green)' : 'rgba(255,255,255,.2)';
      const checkMark = st.done ? '&#10003;' : '';
      const textColor = st.done ? 'var(--green)' : 'var(--white)';
      const strikeStyle = st.done ? 'text-decoration:line-through;' : '';
      gsStepsHtml += '<div onclick="' + clickAttr + '" style="display:flex;align-items:center;gap:10px;padding:6px 0;' + rowStyle + '">'
        + '<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;border:1.5px solid ' + circleColor + ';font-size:10px;color:var(--green);flex-shrink:0;">' + checkMark + '</span>'
        + '<span style="font-family:\'Space Mono\',monospace;font-size:12px;color:' + textColor + ';line-height:1.4;' + strikeStyle + '">' + st.text + '</span>'
        + '</div>';
    }
    gettingStartedHtml = `
      <div style="margin-bottom:16px;padding:14px 16px;border-radius:6px;background:rgba(255,255,255,.03);border:1px solid rgba(245,197,24,.15);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--gold);letter-spacing:1px;">DEIN ERSTER SCHRITT</span>
          <span style="font-family:'Space Mono',monospace;font-size:11px;color:var(--gold);">${completedSteps}/4 erledigt</span>
        </div>
        <div style="width:100%;height:4px;background:rgba(255,255,255,.06);border-radius:2px;margin-bottom:12px;">
          <div style="width:${gsPct}%;height:100%;background:var(--gold);border-radius:2px;transition:width .3s;"></div>
        </div>
        ${gsStepsHtml}
      </div>`;
  }

  if (!items.length && !gettingStartedHtml) { el.innerHTML = ''; return; }

  el.innerHTML = `
    <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--white);margin-bottom:10px;">HINWEISE</div>
    ${gettingStartedHtml}
    ${items.slice(0, 5).map(r => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:6px;padding:7px 12px;border-left:3px solid ${r.color};border-radius:0 4px 4px 0;background:rgba(255,255,255,.015);">
      <span style="font-size:12px;color:${r.color};line-height:1.4;">${r.text}</span>
    </div>`).join('')}`;
}

// ===== SÄULEN PROGRESS =====
// ===== OBJECTIVE BENCHMARKS (replaces subjective % sliders) =====
function getBenchmarks() {
  const s = getUserSchedule();
  const bw = s.weight || 75;
  const age = getUserAge() || 25;
  const bfTarget = age < 25 ? 7 : age <= 35 ? 9 : 11;
  return [
    // LEISTUNGSTESTS — fließen ins Radar
    { id:'deadlift', name:'Deadlift 1RM', unit:'kg', target:Math.round(bw * 2.5), color:'var(--red)', cluster:'Maximalkraft',
      how:'Trap Bar oder Langhantel · 1RM-Test mit Aufwärmprotokoll',
      howSteps:[
        {t:'Aufwärmen', d:'10 Min. leichtes Cardio + dynamisches Stretching (Hüftkreise, Beinpendel, Katzenbuckel).'},
        {t:'Aufwärmsätze', d:'2×10 mit leerem Bar → 1×5 bei 50% → 1×3 bei 70% → 1×2 bei 80% → 1×1 bei 90%. Zwischen den Sätzen 2-3 Min. Pause.'},
        {t:'1RM-Versuche', d:'Steigere in 2,5-5 kg Schritten. Max. 3 Versuche. 3-5 Min. Pause zwischen Versuchen.'},
        {t:'Ausführung', d:'Trap Bar: neutraler Griff, Hüfte auf Kniehöhe, Brust raus, Rücken gerade. Hebe explosiv. Konventionell: schulterbreiter Stand, Mixed Grip erlaubt.'},
        {t:'Gültig wenn', d:'Volle Hüftstreckung oben, kontrolliertes Ablassen. Kein Abprallen, kein Hitching (Hochziehen am Oberschenkel). Partner sollte zuschauen.'}
      ], interval:10 },
    { id:'pullups', name:'Klimmzüge (max)', unit:'Wdh.', target:scaleByWeight(bw, PULLUP_TIERS), color:'var(--red)', cluster:'Maximalkraft',
      how:'Saubere Wdh. bis Versagen · Kinn über Stange',
      howSteps:[
        {t:'Startposition', d:'Schulterbreiter Obergriff (Handflächen weg). Arme komplett gestreckt, Füße vom Boden, kein Schwung.'},
        {t:'Aufwärmen', d:'2-3 leichte Sätze à 3-5 Wdh. mit 2 Min. Pause. Dann 3 Min. Pause vor dem Testversuch.'},
        {t:'Ausführung', d:'Ziehe dich hoch bis Kinn ÜBER die Stange kommt. Lass dich kontrolliert herunter bis Arme VOLL gestreckt. Kein Kipping, kein Schwingen.'},
        {t:'Zählung', d:'Nur saubere Wdh. zählen. Sobald du die Stange nicht mehr erreichst oder die Form bricht → Stopp. Partner zählt laut mit.'},
        {t:'Tipp', d:'Kreide an den Händen verhindert Abrutschen. Teste immer zur gleichen Tageszeit und ausgeruht (nicht nach dem Training).'}
      ], interval:6 },
    { id:'cmj', name:'CMJ Sprunghöhe', unit:'cm', target:scaleByWeight(bw, CMJ_TIERS), color:'var(--gold)', cluster:'Explosivität',
      how:'Counter Movement Jump · MyJump App oder Kreidemarkierung',
      howSteps:[
        {t:'Methode A — MyJump App', d:'Smartphone am Boden aufstellen, App starten. Springe barfuß auf hartem Boden. Die App berechnet die Flugzeit → Sprunghöhe. 3 Versuche, bester zählt.'},
        {t:'Methode B — Kreide/Wand', d:'Stelle dich seitlich an eine Wand. Arm hoch strecken → Markierung 1. Dann aus dem Stand springen und am höchsten Punkt markieren → Markierung 2. Differenz = Sprunghöhe.'},
        {t:'Ausführung', d:'Stehe aufrecht, Füße schulterbreit. Gehe schnell in die Hocke (Knie ~90°), schwinge die Arme nach vorne-oben und springe MAXIMAL. Lande auf beiden Füßen.'},
        {t:'Regeln', d:'Kein Anlauf, kein Zwischenschritt. Die Gegenbewegung (Counter Movement) ist erlaubt und gewollt — das unterscheidet den CMJ vom Squat Jump.'},
        {t:'Tipp', d:'3-5 Min. dynamisches Aufwärmen + 2-3 Probesprünge bei 80%. Dann 3 maximale Versuche mit je 2 Min. Pause. Bester Wert zählt.'}
      ], interval:8 },
    { id:'punch_freq', name:'Schlagfrequenz 10s', unit:'Schläge', target:scaleByWeight(bw, PUNCH_TIERS), color:'var(--gold)', cluster:'Explosivität',
      how:'Gerade Führhand am Sandsack · 10 Sekunden maximal',
      howSteps:[
        {t:'Aufbau', d:'Schwerer Sandsack (min. 30 kg). Partner mit Stoppuhr steht seitlich und zählt. Bandagen + Boxhandschuhe (14-16 oz) tragen.'},
        {t:'Aufwärmen', d:'3 Runden Schattenboxen + 2 Min. lockeres Sandsackschlagen. Dann 2 Min. Pause.'},
        {t:'Ausführung', d:'Boxstellung einnehmen. Auf "LOS" schlägst du NUR gerade Führhand (Jab) so schnell wie möglich auf den Sandsack. Volle Streckung bei jedem Schlag.'},
        {t:'Zählung', d:'Partner zählt JEDEN Kontakt mit dem Sandsack. Nach exakt 10 Sekunden → "STOPP". Nur Schläge mit voller Armstreckung zählen.'},
        {t:'Protokoll', d:'3 Versuche mit je 3 Min. Pause. Bester Wert zählt. Alternativ: Beide Hände abwechselnd (dann im Profil vermerken).'}
      ], interval:6 },
    { id:'cooper', name:'Cooper-Test 12 Min.', unit:'m', target:scaleByWeight(bw, COOPER_TIERS), color:'var(--blue)', cluster:'Ausdauer',
      how:'400m-Bahn · 12 Minuten maximale Distanz',
      howSteps:[
        {t:'Vorbereitung', d:'400m-Tartanbahn (oder GPS-Uhr auf flacher Strecke). Laufschuhe, leichte Kleidung. Nicht direkt nach einer Mahlzeit testen.'},
        {t:'Aufwärmen', d:'10 Min. lockeres Einlaufen + 4-5 Steigerungsläufe über 80m. Dann 3 Min. Pause.'},
        {t:'Ausführung', d:'Auf "START" läufst du 12 Minuten so weit wie möglich. Gleichmäßiges Tempo ist der Schlüssel — starte NICHT zu schnell! Die letzten 2 Min. kannst du anziehen.'},
        {t:'Pacing-Strategie', d:'Für 3500m brauchst du ~3:26 min/km. Laufe die ersten 3 Runden (1200m) in ~4:08. Steigere dann. Zähle jede 400m-Runde mit.'},
        {t:'Messung', d:'Nach 12 Min. pfeift der Partner. Bleib stehen wo du bist. Miss die zurückgelegte Distanz auf 10m genau (Markierungen auf der Bahn nutzen). VO₂max ≈ (Distanz − 504) ÷ 44.7.'}
      ], interval:8 },
    // KÖRPERMESSUNGEN
    { id:'bodyfat', name:'Körperfettanteil', unit:'%', target:bfTarget, color:'var(--green)', cluster:'Körper', inverse:true,
      how:'Caliper 7-Falten, Navy-Methode oder DEXA',
      howSteps:[
        {t:'Methode A — Caliper (genaueste tragbare)', d:'7-Punkt-Messung: Brust, Achsel, Trizeps, Subscapular, Bauch, Hüfte, Oberschenkel. Jede Falte 3× messen, Median nehmen. Immer rechte Seite.'},
        {t:'Caliper-Technik', d:'Falte mit Daumen + Zeigefinger greifen (2cm vom Messpunkt). Caliper 1cm unterhalb ansetzen. 2 Sek. warten, dann ablesen. In Jackson-Pollock-Formel eingeben.'},
        {t:'Methode B — Navy-Methode (einfachste)', d:'Miss mit Maßband: Bauchumfang (Nabel), Halsumfang (schmalste Stelle). Formel: 86.010 × log10(Bauch − Hals) − 70.041 × log10(Größe) + 36.76.'},
        {t:'Methode C — DEXA-Scan (Goldstandard)', d:'Termin bei Sportmediziner oder Uni-Institut. Kosten: ca. 50-100€. Dauert 10 Min. Gibt dir exakte Fett-, Muskel- und Knochenmasse.'},
        {t:'Wichtig', d:'Immer morgens nüchtern messen, gleiche Bedingungen. Caliper-Werte sind ~1.5% niedriger als DEXA. Wähle EINE Methode und bleibe dabei für Vergleichbarkeit.'}
      ], interval:4 }
  ];
}

function renderSaeulenProgress() {
  const data = getData();
  if (!data) return;
  if (!data.benchmarks) data.benchmarks = {};
  if (!data.benchmarkHistory) data.benchmarkHistory = {};
  const el = document.getElementById('saeulen-progress');
  const BENCHMARKS = getBenchmarks();

  const clusters = ['Maximalkraft', 'Explosivität', 'Ausdauer', 'Körper'];
  const clusterColors = { Maximalkraft:'var(--red)', 'Explosivität':'var(--gold)', Ausdauer:'var(--blue)', 'Körper':'var(--green)' };

  el.innerHTML = clusters.map(c => {
    const items = BENCHMARKS.filter(b => b.cluster === c);
    return `
      <div style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:${clusterColors[c]};">${c.toUpperCase()}</span>
        </div>
        <div class="bench-grid">
          ${items.map(b => {
            const val = data.benchmarks[b.id] || 0;
            const hist = data.benchmarkHistory[b.id] || [];
            let pct;
            if (val === 0) {
              pct = 0;
            } else if (b.inverse) {
              const upper = b.id === 'rhr' ? 90 : b.id === 'bodyfat' ? 25 : 100;
              pct = Math.min(100, Math.max(0, ((upper - val) / (upper - b.target)) * 100));
            } else {
              pct = Math.min(100, (val / b.target) * 100);
            }
            // Trend: compare current to first recorded value
            let trendHTML = '';
            if (hist.length >= 2) {
              const first = hist[0].value;
              const diff = val - first;
              const better = b.inverse ? diff < 0 : diff > 0;
              const arrow = better ? '↑' : diff === 0 ? '→' : '↓';
              const color = better ? 'var(--green)' : diff === 0 ? '#555' : 'var(--red)';
              const absDiff = Math.abs(diff);
              const unit = b.unit;
              trendHTML = `<div style="font-family:'Space Mono',monospace;font-size:11px;color:${color};margin-top:4px;">${arrow} ${b.inverse && diff < 0 ? '-' : '+'}${absDiff % 1 === 0 ? absDiff : absDiff.toFixed(1)} ${unit} seit ${formatDate(hist[0].date)} (${hist.length} Tests)</div>`;
            } else if (hist.length === 1) {
              trendHTML = `<div style="font-family:'Space Mono',monospace;font-size:11px;color:#333;margin-top:4px;">Erster Test: ${formatDate(hist[0].date)}</div>`;
            }
            // Mini sparkline SVG
            let sparkHTML = '';
            if (hist.length >= 3) {
              const vals = hist.map(h => h.value);
              const min = Math.min(...vals);
              const max = Math.max(...vals);
              const range = max - min || 1;
              const w = 100, h2 = 24;
              const pts = vals.map((v, i) => {
                const x = (i / (vals.length - 1)) * w;
                const y = b.inverse
                  ? (v - min) / range * (h2 - 4) + 2
                  : h2 - ((v - min) / range * (h2 - 4)) - 2;
                return `${x},${y}`;
              }).join(' ');
              sparkHTML = `<svg width="${w}" height="${h2}" style="margin-top:4px;"><polyline points="${pts}" fill="none" stroke="${b.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            }
            return `<div class="bench-card" style="--bc:${b.color}">
              <div class="bench-name"><span class="tt">${b.name}<span class="tt-text">${getBenchTooltip(b)}</span></span></div>
              <div style="font-family:'Space Mono',monospace;font-size:11px;color:#444;margin:-4px 0 8px 0;">${b.how}</div>
              <div style="display:flex;align-items:baseline;gap:8px;">
                <div class="bench-current">${val || '—'}</div>
                <div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;">${b.unit}</div>
                <div style="margin-left:auto;font-size:11px;font-family:'Space Mono',monospace;color:${getBenchLevel(pct).color};font-weight:700;">${getBenchLevel(pct).label} · ${Math.round(pct)}%</div>
              </div>
              <div class="bench-bar"><div class="bench-fill" style="width:${pct}%;background:${b.color};"></div></div>
              <div style="font-family:'Space Mono',monospace;font-size:11px;color:#333;margin-top:2px;">Elite-Ziel: ${b.target} ${b.unit}</div>
              ${sparkHTML}
              ${trendHTML}
              <input class="bench-input" type="number" step="any" placeholder="${b.target}" value="${val||''}"
                onchange="updateBenchmark('${b.id}', this.value)">
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

function getBenchTooltip(b) {
  const bw = getUserSchedule().weight || 75;
  const age = getUserAge() || 25;
  const tips = {
    deadlift: `1RM Trap Bar oder Langhantel. Korreliert mit Schlagkraft (r=0.72–0.80). Nationalkader: 2.5× KG (${bw}kg = ${Math.round(bw*2.5)}kg). Alle 10 Wo. testen.`,
    pullups: `Saubere Klimmzüge bis Versagen. Für ${bw}kg Nationalkader: ${scaleByWeight(bw, PULLUP_TIERS)} Wdh. Wichtiger als Bankdrücken für Clinch + Schlagkraft.`,
    cmj: `Counter Movement Jump — MyJump App oder Kreidemarkierung. Für ${bw}kg Nationalkader: ${scaleByWeight(bw, CMJ_TIERS)}cm. Korreliert direkt mit Schlagkraft.`,
    punch_freq: `Gerade Führhand am Sandsack, 10 Sek. Für ${bw}kg Nationalkader: ${scaleByWeight(bw, PUNCH_TIERS)} Schläge. Video zur Kontrolle.`,
    cooper: `400m-Bahn, 12 Min. max. Für ${bw}kg Nationalkader: ${scaleByWeight(bw, COOPER_TIERS)}m. VO₂max ≈ (Meter − 504) / 44.7 → Ziel: 60+ ml/kg/min.`,
    bodyfat: `Caliper (7 Falten), Navy-Methode oder DEXA. Für Alter ${age} Nationalkader: ${age < 25 ? 7 : age <= 35 ? 9 : 11}%. Wettkampf: 6–8%.`
  };
  return tips[b.id] || '';
}

function toggleHowTo(btn) {
  const panel = btn.closest('.test-card').querySelector('.how-panel');
  const isOpen = panel.classList.contains('open');
  // Close all other open panels first
  document.querySelectorAll('.how-panel.open').forEach(p => {
    p.classList.remove('open');
    p.style.maxHeight = '0';
    const b = p.closest('.test-card').querySelector('.how-toggle');
    if (b) { b.textContent = 'WIE MESSEN? ▾'; b.classList.remove('active'); }
  });
  if (!isOpen) {
    panel.classList.add('open');
    panel.style.maxHeight = panel.scrollHeight + 'px';
    btn.textContent = 'SCHLIESSEN ▴';
    btn.classList.add('active');
  }
}

// ===== PROGRESSIVE DISCLOSURE =====
function togglePD(el) {
  const section = el.closest('.pd-section');
  if (!section) return;
  section.classList.toggle('open');
}

// Auto-wrap numbered section headers into collapsible blocks
// Works on any page with [id^=prefix] section headers
function applyPD(pageId, prefix, openFirst) {
  const page = document.getElementById(pageId);
  if (!page) return;
  const headers = [...page.querySelectorAll('[id^="' + prefix + '"]')];
  if (!headers.length) return;
  const headerSet = new Set(headers);

  headers.forEach(function(header, i) {
    var section = document.createElement('div');
    section.className = 'pd-section' + ((openFirst && i === 0) ? ' open' : '');

    // Build head from existing header text
    var titleText = header.textContent.trim();
    var head = document.createElement('div');
    head.className = 'pd-head';
    head.setAttribute('onclick', 'togglePD(this)');
    head.innerHTML = '<div class="pd-head-left"><div class="pd-title">' + titleText + '</div></div><div class="pd-arrow">▾</div>';

    // Build body — collect all siblings until next section header
    var body = document.createElement('div');
    body.className = 'pd-body';
    var inner = document.createElement('div');
    inner.className = 'pd-inner';

    var next = header.nextElementSibling;
    while (next && !headerSet.has(next)) {
      var toMove = next;
      next = next.nextElementSibling;
      inner.appendChild(toMove);
    }

    body.appendChild(inner);
    section.appendChild(head);
    section.appendChild(body);
    header.parentNode.insertBefore(section, header);
    header.remove();
  });
}

function updateBenchmark(id, val) {
  const data = getData();
  if (!data) return;
  if (!data.benchmarks) data.benchmarks = {};
  if (!data.benchmarkHistory) data.benchmarkHistory = {};
  const numVal = parseFloat(val) || 0;

  // Input validation — reject negative and unreasonably high values
  if (numVal < 0) return;
  const benchLimits = { deadlift: 500, pullups: 50, cmj: 100, punch_freq: 150, cooper: 5000, bodyfat: 40 };
  const benchMins = { bodyfat: 3 };
  if (benchLimits[id] !== undefined && numVal > benchLimits[id]) return;
  if (benchMins[id] !== undefined && numVal > 0 && numVal < benchMins[id]) return;

  const oldVal = data.benchmarks[id] || 0;
  data.benchmarks[id] = numVal;
  // Track history — only log if value actually changed
  if (numVal !== oldVal && numVal > 0) {
    if (!data.benchmarkHistory[id]) data.benchmarkHistory[id] = [];
    data.benchmarkHistory[id].push({ date: new Date().toISOString().split('T')[0], value: numVal });
    // Keep last 50 entries per benchmark
    if (data.benchmarkHistory[id].length > 50) data.benchmarkHistory[id] = data.benchmarkHistory[id].slice(-50);
  }
  saveData(data);
  // Re-render dashboard stats + radar so changes reflect immediately
  renderDashStats();
  renderRadarChart(calcProfileScores(data));
  renderTestsPage();
}

// ===== FIGHT LOG =====
function openFightModal() {
  document.getElementById('fight-modal').classList.add('active');
  document.getElementById('fight-log-date').value = new Date().toISOString().split('T')[0];
}
function closeFightModal() { document.getElementById('fight-modal').classList.remove('active'); }

function addFightLog() {
  const data = getData();
  if (!data) return;
  if (!data.fights) data.fights = [];
  data.fights.unshift({
    date: document.getElementById('fight-log-date').value,
    opponent: document.getElementById('fight-log-opponent').value || 'Unbekannt',
    result: document.getElementById('fight-log-result').value,
    method: document.getElementById('fight-log-method').value,
    style: document.getElementById('fight-log-style').value,
    type: document.getElementById('fight-log-type').value,
    good: document.getElementById('fight-log-good').value,
    improve: document.getElementById('fight-log-improve').value
  });
  saveData(data);
  closeFightModal();
  renderFightLog();
  renderDashStats();
}

function renderFightLog() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('fight-log-list');
  if (!data.fights || !data.fights.length) { el.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#444;padding:8px 0;">Noch keine K\u00e4mpfe eingetragen. Nutze \u201c+ Kampf\u201d um deinen ersten Kampf zu dokumentieren.</div>'; return; }
  el.innerHTML = data.fights.map((f, i) => {
    const color = f.result === 'S' ? 'var(--green)' : f.result === 'N' ? 'var(--red)' : 'var(--gold)';
    const label = f.result === 'S' ? 'SIEG' : f.result === 'N' ? 'NIEDERLAGE' : 'UNENTSCHIEDEN';
    const meta = [label, f.method, f.style, f.type].filter(Boolean).join(' · ');
    return `<div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid #151515;">
      <div style="min-width:40px;text-align:center;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:${color};">${label.charAt(0)}</div>
        <div style="font-family:'Space Mono',monospace;font-size:11px;color:#444;">${formatDate(f.date)}</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;color:var(--white);">vs. ${f.opponent}</div>
        <div style="font-size:11px;color:#666;">${meta}</div>
        ${f.good ? `<div style="font-size:11px;color:var(--green);margin-top:4px;">✓ ${f.good}</div>` : ''}
        ${f.improve ? `<div style="font-size:11px;color:var(--gold);margin-top:2px;">↑ ${f.improve}</div>` : ''}
      </div>
      <button class="delete-btn" onclick="deleteFight(${i})">×</button>
    </div>`;
  }).join('');
}

function deleteFight(i) {
  const data = getData();
  if (!data) return;
  data.fights.splice(i, 1);
  saveData(data);
  renderFightLog();
  renderDashStats();
}

// ===== TRAINING LOG =====
function addLogEntry() {
  const data = getData();
  if (!data) return;
  if (!data.log) data.log = [];
  const rawWeight = document.getElementById('log-weight').value;
  let weightVal = parseFloat(rawWeight) || null;
  // Validate weight if provided
  if (weightVal !== null && (weightVal < 30 || weightVal > 200)) {
    alert('Gewicht muss zwischen 30 und 200 kg liegen.');
    return;
  }
  const entry = {
    date: document.getElementById('log-date').value,
    type: document.getElementById('log-type').value,
    duration: parseInt(document.getElementById('log-duration').value) || 0,
    rpe: parseInt(document.getElementById('log-rpe').value) || 0,
    weight: weightVal,
    notes: document.getElementById('log-notes').value
  };
  if (!entry.date || !entry.duration) return;
  data.log.unshift(entry);
  saveData(data);
  document.getElementById('log-duration').value = '';
  document.getElementById('log-rpe').value = '';
  document.getElementById('log-weight').value = '';
  document.getElementById('log-notes').value = '';
  renderLogEntries();
  renderDashStats();
  renderRecentLog();
}

const TYPE_COLORS = { kraft: 'var(--blue)', boxen: 'var(--red)', sparring: 'var(--red)', cardio: 'var(--green)', pratzen: 'var(--orange)', technik: 'var(--gold)', mobility: 'var(--purple)' };
const TYPE_LABELS = { kraft: 'Kraft / S&C', boxen: 'Boxen', sparring: 'Sparring', cardio: 'Cardio', pratzen: 'Pratzen', technik: 'Technik', mobility: 'Mobility' };

function renderLogEntries() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('log-entries');
  if (!el) return;
  if (!data.log || !data.log.length) { el.innerHTML = '<div style="font-size:12px;color:#444;">Noch keine Einträge.</div>'; return; }
  el.innerHTML = data.log.slice(0, 50).map((e, i) => {
    const d = new Date(e.date);
    const day = d.getDate();
    const month = d.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
    const color = TYPE_COLORS[e.type] || 'var(--grey)';
    return `<div class="log-entry-card">
      <div><div class="log-entry-date">${day}</div><div class="log-entry-month">${month}</div></div>
      <div class="log-entry-body">
        <div class="log-entry-type" style="color:${color};">${TYPE_LABELS[e.type] || e.type}</div>
        <div style="font-size:13px;color:var(--white);">${e.duration} Min. · RPE ${e.rpe}${e.weight ? ' · ' + e.weight + ' kg' : ''}</div>
        ${e.notes ? `<div class="log-entry-notes">${e.notes}</div>` : ''}
      </div>
      <button class="delete-btn" onclick="deleteLog(${i})">×</button>
    </div>`;
  }).join('');
}

function deleteLog(i) {
  const data = getData();
  if (!data) return;
  data.log.splice(i, 1);
  saveData(data);
  renderLogEntries();
  renderDashStats();
  renderRecentLog();
}

function renderRecentLog() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('recent-log');
  if (!el) return;
  if (!data.log || !data.log.length) { el.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#444;padding:8px 0;">Noch keine Trainingseinheiten. <span style="color:var(--red);cursor:pointer;" onclick="showPage(\'log\')">Erste Session loggen \u2192</span></div>'; return; }
  el.innerHTML = data.log.slice(0, 5).map(e => {
    const color = TYPE_COLORS[e.type] || 'var(--grey)';
    return `<div style="display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid #151515;">
      <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
      <div style="flex:1;font-size:13px;color:var(--light);">${TYPE_LABELS[e.type] || e.type} · ${e.duration} Min.</div>
      <div style="font-family:'Space Mono',monospace;font-size:12px;color:#444;">${formatDate(e.date)}</div>
    </div>`;
  }).join('');
}

// ===== WOCHENPLAN =====
function getDefaultWeekPlan() {
  return generateSmartWeekPlan();
}

function generateSmartWeekPlan() {
  const s = getUserSchedule();
  const ws = s.weekSchedule;
  const data = getData();
  const plan = {};

  // Calculate fight phase for each day of the current week
  const today = new Date(); today.setHours(0,0,0,0);
  const todayDow = (today.getDay() + 6) % 7; // 0=Mo … 6=So
  const fightPhasePerDay = {};
  const fightDaysPerDay = {};

  if (data && data.fightDate) {
    const fightDay = new Date(data.fightDate + 'T00:00:00');
    DAY_NAMES.forEach((day, di) => {
      const dayDate = new Date(today);
      dayDate.setDate(dayDate.getDate() + (di - todayDow));
      const diff = Math.ceil((fightDay - dayDate) / 86400000);
      fightDaysPerDay[day] = diff;
      // Recovery nur 1–2 Tage nach Kampf, danach normales Training
      if (diff >= -2 && diff < 0) fightPhasePerDay[day] = 'recovery';
      else if (diff === 0) fightPhasePerDay[day] = 'kampftag';
      else if (diff <= 2 && diff > 0) fightPhasePerDay[day] = 'kampfmodus';
      else if (diff <= 4 && diff > 0) fightPhasePerDay[day] = 'schaerfen';
      else fightPhasePerDay[day] = 'training';
    });
  }

  // Nacken 2-3x/Woche auf Boxtage verteilen
  const nackenDays = [];
  const boxingDayIndices = [];
  DAY_NAMES.forEach((day, di) => {
    const d = ws[day] || { time: null, type: 'frei' };
    if (['boxen', 'pa', 'pratzen', 'technik'].includes(d.type)) boxingDayIndices.push(di);
  });
  if (boxingDayIndices.length > 0) {
    const step = Math.max(1, Math.floor(boxingDayIndices.length / 3));
    for (let i = 0; i < boxingDayIndices.length && nackenDays.length < 3; i += step) {
      nackenDays.push(boxingDayIndices[i]);
    }
  }

  // S&C rotation: alternate between sessions A, B, C across free days
  const scSessions = [
    { title: 'S&C A: Trap Bar DL + Hip Thrust + Pull-Ups', exercises: [{id:'trap-bar-deadlift',label:'Trap Bar DL'},{id:'hip-thrust',label:'Hip Thrust'},{id:'pull-ups',label:'Pull-Ups'}] },
    { title: 'S&C B: Power Clean + Bankdrücken + Jump Squat', exercises: [{id:'power-clean',label:'Power Clean'},{id:'bench-press',label:'Bankdrücken'},{id:'jump-squat',label:'Jump Squat'}] },
    { title: 'S&C C: Landmine Press + Med Ball + Pallof Press', exercises: [{id:'landmine-press',label:'Landmine Press'},{id:'med-ball-rotation',label:'Med Ball Rotation'},{id:'pallof-press',label:'Pallof Press'}] }
  ];
  let scIdx = 0;

  const TYPE_LABEL_MAP = {
    pa: 'Partnerarbeit', pratzen: 'Pratzenarbeit', sparring: 'Sparring',
    technik: 'Techniktraining', boxen: 'Boxtraining', cardio: 'Cardio'
  };

  DAY_NAMES.forEach((day, di) => {
    const d = ws[day] || { time: null, type: 'frei' };
    const nextDay = ws[DAY_NAMES[(di + 1) % 7]] || { time: null, type: 'frei' };
    const blocks = [];
    const isWeekend = (day === 'sa' || day === 'so');
    const morningTime = timeBefore(s.workStart, 1, 15);
    const isBoxingDay = ['boxen', 'pa', 'pratzen', 'technik'].includes(d.type);
    const isSparringDay = d.type === 'sparring';
    const isFreeDay = d.type === 'frei';
    const nextIsSparring = nextDay.type === 'sparring';
    const hasNacken = nackenDays.includes(di);
    const lunchTime = timeAdd(s.workStart, 4, 30);
    const trainingLabel = TYPE_LABEL_MAP[d.type] || d.type;
    const phase = fightPhasePerDay[day] || 'training';

    // =============================================
    // KAMPFTAG — Fight day (alles relativ zur Kampfzeit)
    // =============================================
    if (phase === 'kampftag') {
      const fightTime = d.time || '18:00';
      blocks.push({ time: timeBefore(fightTime, 4, 0), title: 'Letzte große Mahlzeit (KH-Loading)', type: 'meta' });
      blocks.push({ time: timeBefore(fightTime, 1, 0), title: 'PAPE Warm-Up: Squats 3×3 → 10 Min. Ruhe → Jump Squats', type: 'strength',
        exercises: [{id:'jump-squat',label:'Jump Squats'}] });
      blocks.push({ time: timeBefore(fightTime, 0, 20), title: 'Shadow Boxing + Pratzen + Box-Breathing', type: 'boxing',
        exercises: [{id:'shadow-boxing',label:'Shadow Boxing'}] });
      blocks.push({ time: fightTime, title: '🥊 KAMPF', type: 'fight' });
      blocks.push({ time: timeAdd(fightTime, 1, 0), title: 'Post-Kampf: Protein + KH + Elektrolyte', type: 'recovery' });

    // =============================================
    // KAMPF-MODUS — 1–2 Tage vor Kampf
    // =============================================
    } else if (phase === 'kampfmodus') {
      blocks.push({ time: isWeekend ? '08:00' : morningTime, title: 'IMT — 30 Atemzüge (leicht)', type: 'meta',
        exercises: [{id:'imt',label:'IMT'}] });
      blocks.push({ time: isWeekend ? '08:15' : timeAdd(morningTime, 0, 10), title: 'Leichte Mobility 15 Min.', type: 'recovery',
        exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'shoulder-dislocates',label:'Shoulder Dislocates'}] });
      if (!isWeekend) {
        blocks.push({ time: s.workStart, title: 'Arbeit', type: 'meta' });
        blocks.push({ time: s.workEnd, title: 'Feierabend', type: 'meta' });
      }
      blocks.push({ time: isWeekend ? '11:00' : timeAdd(s.workEnd, 0, 30), title: 'Leichtes Shadow Boxing 2 Runden — Gameplan visualisieren', type: 'boxing',
        exercises: [{id:'shadow-boxing',label:'Shadow Boxing'}] });
      blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 1, 0), title: 'Spaziergang 20 Min. (Kopf frei)', type: 'cardio' });
      blocks.push({ time: '21:00', title: 'Visualisierung 10 Min. + Box-Breathing + früh schlafen', type: 'recovery' });

    // =============================================
    // SCHÄRFEN — 3–4 Tage vor Kampf
    // =============================================
    } else if (phase === 'schaerfen') {
      blocks.push({ time: isWeekend ? '08:00' : morningTime, title: 'IMT — 30 Atemzüge', type: 'meta',
        exercises: [{id:'imt',label:'IMT'}] });

      if (isSparringDay) {
        // Schärfen + Sparring-Tag: nur leichtes taktisches Sparring
        blocks.push({ time: isWeekend ? '08:15' : timeAdd(morningTime, 0, 10), title: 'Mobility 10 Min.', type: 'recovery',
          exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'thoracic-rotation',label:'Thoracic Rotation'}] });
        if (!isWeekend) {
          blocks.push({ time: s.workStart, title: 'Arbeit', type: 'meta' });
          blocks.push({ time: s.workEnd, title: 'Feierabend', type: 'meta' });
        }
        blocks.push({ time: timeBefore(d.time, 1, 0), title: 'Pre-Training Snack', type: 'meta' });
        blocks.push({ time: d.time, title: 'Leichtes taktisches Sparring (−30% Volumen)', type: 'boxing' });
        blocks.push({ time: timeAdd(d.time, 1, 30), title: 'Post-Training Essen', type: 'meta' });
      } else if (isBoxingDay) {
        // Schärfen + Boxtag: kurze explosive Reize
        blocks.push({ time: isWeekend ? '08:15' : timeAdd(morningTime, 0, 10), title: 'Explosive Reize: 3×3 Jump Squats', type: 'strength',
          exercises: [{id:'jump-squat',label:'Jump Squat'},{id:'explosive-pushup',label:'Explosive Pushup'}] });
        if (hasNacken) {
          blocks.push({ time: isWeekend ? '08:35' : timeAdd(morningTime, 0, 25), title: 'Nacken Isometrics 8 Min.', type: 'strength',
            exercises: [{id:'iso-nacken',label:'Iso Nacken'}] });
        }
        if (!isWeekend) {
          blocks.push({ time: s.workStart, title: 'Arbeit', type: 'meta' });
          blocks.push({ time: timeAdd(lunchTime, 0, 25), title: 'BET Stroop 15 Min. (leicht)', type: 'meta' });
          blocks.push({ time: s.workEnd, title: 'Feierabend', type: 'meta' });
        }
        blocks.push({ time: timeBefore(d.time, 1, 0), title: 'Pre-Training Snack', type: 'meta' });
        blocks.push({ time: d.time, title: trainingLabel + ' (Intensität hoch, Volumen −30%)', type: 'boxing' });
        blocks.push({ time: timeAdd(d.time, 1, 30), title: 'Post-Training Essen', type: 'meta' });
      } else {
        // Schärfen + freier Tag: leicht, kurze explosive Reize
        blocks.push({ time: isWeekend ? '08:15' : timeAdd(morningTime, 0, 10), title: 'Kurze explosive Reize: Jump Squats 3×3 + Sprünge', type: 'strength',
          exercises: [{id:'jump-squat',label:'Jump Squat'},{id:'lateral-bounds',label:'Lateral Bounds'}] });
        if (!isWeekend) {
          blocks.push({ time: s.workStart, title: 'Arbeit', type: 'meta' });
          blocks.push({ time: s.workEnd, title: 'Feierabend', type: 'meta' });
        }
        blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 0, 30), title: 'Leichtes Zone 2 Cardio 20–30 Min.', type: 'cardio',
          exercises: [{id:'zone2',label:'Zone 2'}] });
      }
      blocks.push({ time: isWeekend ? '17:00' : timeAdd(s.workEnd, 1, 30), title: 'Mobility / Foam Rolling 15 Min.', type: 'recovery',
        exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'ankle-mobility',label:'Ankle Mobility'}] });

    // =============================================
    // RECOVERY — Nach dem Kampf
    // =============================================
    } else if (phase === 'recovery') {
      blocks.push({ time: isWeekend ? '09:00' : morningTime, title: 'IMT — 30 Atemzüge (leicht)', type: 'meta',
        exercises: [{id:'imt',label:'IMT'}] });
      blocks.push({ time: isWeekend ? '09:15' : timeAdd(morningTime, 0, 10), title: 'Sanfte Mobility 15 Min.', type: 'recovery',
        exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'shoulder-dislocates',label:'Shoulder Dislocates'},{id:'thoracic-rotation',label:'Thoracic Rotation'}] });
      if (!isWeekend) {
        blocks.push({ time: s.workStart, title: 'Arbeit', type: 'meta' });
        blocks.push({ time: s.workEnd, title: 'Feierabend', type: 'meta' });
      }
      blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 0, 30), title: 'Leichtes Zone 2 Cardio 20 Min. (Regeneration fördern)', type: 'cardio',
        exercises: [{id:'zone2',label:'Zone 2'}] });
      blocks.push({ time: isWeekend ? '16:00' : timeAdd(s.workEnd, 1, 30), title: 'Extended Mobility + Foam Rolling 20 Min.', type: 'recovery' });
      blocks.push({ time: '21:00', title: 'Extra Protein + früh schlafen', type: 'meta' });

    // =============================================
    // NORMALES TRAINING — 5+ Tage vor Kampf
    // =============================================
    } else {
      if (isSparringDay) {
        blocks.push({ time: isWeekend ? timeBefore(d.time, 2, 0) : morningTime, title: 'IMT — 30 Atemzüge', type: 'meta',
          exercises: [{id:'imt',label:'IMT'}] });
        blocks.push({ time: isWeekend ? timeBefore(d.time, 1, 45) : timeAdd(morningTime, 0, 10), title: 'Leichte Mobility 10 Min. (CNS schonen)', type: 'recovery',
          exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'thoracic-rotation',label:'Thoracic Rotation'}] });
        if (!isWeekend) {
          blocks.push({ time: timeBefore(s.workStart, 0, 15), title: 'Zur Arbeit (Fahrrad = Zone 2)', type: 'cardio',
            exercises: [{id:'zone2',label:'Zone 2'}] });
          blocks.push({ time: s.workStart, title: 'Arbeit', type: 'meta' });
          blocks.push({ time: s.workEnd, title: 'Feierabend', type: 'meta' });
        }
        blocks.push({ time: timeBefore(d.time, 1, 0), title: 'Pre-Training Snack (extra Carbs)', type: 'meta' });
        blocks.push({ time: d.time, title: 'Sparring', type: 'boxing' });
        blocks.push({ time: timeAdd(d.time, 1, 30), title: 'Post-Sparring Essen (extra Protein)', type: 'recovery' });
        blocks.push({ time: timeAdd(d.time, 2, 30), title: 'Erweiterte Mobility + Foam Rolling 20 Min.', type: 'recovery',
          exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'ankle-mobility',label:'Ankle Mobility'}] });

      } else if (isBoxingDay) {
        blocks.push({ time: morningTime, title: 'IMT — 30 Atemzüge', type: 'meta',
          exercises: [{id:'imt',label:'IMT'}] });
        const nackenEx = hasNacken ? [{id:'iso-nacken',label:'Iso Nacken'},{id:'nacken-flexion',label:'Nacken Flexion'}] : [];
        const scTitle = hasNacken ? 'Overcoming Isometrics + Nacken (~20 Min.)' : 'Overcoming Isometrics (~15 Min.)';
        blocks.push({ time: timeAdd(morningTime, 0, 10), title: scTitle, type: 'strength',
          exercises: [{id:'overcoming-iso',label:'Overcoming Iso'}, ...nackenEx] });
        if (!isWeekend) {
          blocks.push({ time: timeBefore(s.workStart, 0, 15), title: 'Zur Arbeit (Fahrrad = Zone 2)', type: 'cardio',
            exercises: [{id:'zone2',label:'Zone 2'}] });
          blocks.push({ time: s.workStart, title: 'Arbeit', type: 'meta' });
          blocks.push({ time: timeAdd(lunchTime, 0, 25), title: 'BET Stroop 20 Min. + IMT', type: 'meta',
            exercises: [{id:'imt',label:'IMT'}] });
          blocks.push({ time: s.workEnd, title: 'Feierabend', type: 'meta' });
        }
        blocks.push({ time: timeBefore(d.time, 1, 0), title: 'Pre-Training Snack', type: 'meta' });
        blocks.push({ time: d.time, title: trainingLabel, type: 'boxing' });
        blocks.push({ time: timeAdd(d.time, 1, 30), title: 'Post-Training Essen', type: 'meta' });
        blocks.push({ time: timeAdd(d.time, 2, 30), title: 'Mobility / Foam Rolling 10 Min.', type: 'recovery',
          exercises: [{id:'hip-cars',label:'Hip CARs'}] });

      } else if (isFreeDay) {
        blocks.push({ time: isWeekend ? '08:00' : morningTime, title: 'IMT — 30 Atemzüge', type: 'meta',
          exercises: [{id:'imt',label:'IMT'}] });

        if (nextIsSparring) {
          blocks.push({ time: isWeekend ? '08:15' : timeAdd(morningTime, 0, 10), title: 'Leichte Mobility 15 Min. (morgen Sparring!)', type: 'recovery',
            exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'shoulder-dislocates',label:'Shoulder Dislocates'},{id:'ankle-mobility',label:'Ankle Mobility'}] });
          if (!isWeekend) {
            blocks.push({ time: timeBefore(s.workStart, 0, 15), title: 'Zur Arbeit (Fahrrad = Zone 2)', type: 'cardio',
              exercises: [{id:'zone2',label:'Zone 2'}] });
            blocks.push({ time: s.workStart, title: 'Arbeit', type: 'meta' });
            blocks.push({ time: s.workEnd, title: 'Feierabend', type: 'meta' });
          }
          blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 0, 30), title: 'Zone 2 Spaziergang 30 Min.', type: 'cardio',
            exercises: [{id:'zone2',label:'Zone 2'}] });
        } else {
          // Normaler freier Tag: schweres S&C
          const sc = scSessions[scIdx % scSessions.length];
          scIdx++;
          const scTime = isWeekend ? '08:15' : timeAdd(morningTime, 0, 10);
          blocks.push({ time: scTime, title: sc.title, type: 'strength', exercises: sc.exercises });
          blocks.push({ time: timeAdd(scTime, 0, 40), title: 'BFR Finisher: Curls + Trizep', type: 'strength',
            exercises: [{id:'bfr',label:'BFR'}] });
          if (hasNacken) {
            blocks.push({ time: timeAdd(scTime, 0, 50), title: 'Nackentraining 10 Min.', type: 'strength',
              exercises: [{id:'iso-nacken',label:'Iso Nacken'},{id:'nacken-flexion',label:'Nacken Flexion'}] });
          }
          if (!isWeekend) {
            blocks.push({ time: timeBefore(s.workStart, 0, 15), title: 'Zur Arbeit (Fahrrad = Zone 2)', type: 'cardio',
              exercises: [{id:'zone2',label:'Zone 2'}] });
            blocks.push({ time: s.workStart, title: 'Arbeit', type: 'meta' });
            blocks.push({ time: timeAdd(lunchTime, 0, 25), title: 'BET Stroop 20 Min. + IMT', type: 'meta',
              exercises: [{id:'imt',label:'IMT'}] });
            blocks.push({ time: s.workEnd, title: 'Feierabend', type: 'meta' });
          }
          blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 0, 30), title: 'Zone 2 Cardio 30–45 Min.', type: 'cardio',
            exercises: [{id:'zone2',label:'Zone 2'}] });
        }

        if (isWeekend) {
          blocks.push({ time: '11:00', title: 'Meal Prep', type: 'meta' });
        }
        blocks.push({ time: isWeekend ? '17:00' : timeAdd(s.workEnd, 1, 30), title: 'Mobility / Foam Rolling 15 Min.', type: 'recovery',
          exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'thoracic-rotation',label:'Thoracic Rotation'}] });
      }
    }

    blocks.sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });

    plan[day] = blocks;
  });

  return plan;
}

const DAY_NAMES = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'];
const DAY_LABELS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const TYPE_CLASS = { strength: 'strength', boxing: 'boxing', cardio: 'cardio', recovery: 'recovery', meta: 'meta', fight: 'fight', off: 'off' };

function renderWeekPlan() {
  const data = getData();
  if (!data) return;
  // Only regenerate if no saved plan exists or if fight date / schedule changed
  const s = getUserSchedule();
  const planKey = (data.fightDate || '') + '|' + JSON.stringify(s.weekSchedule);
  if (!data.weekPlan || data._weekPlanKey !== planKey) {
    data.weekPlan = generateSmartWeekPlan();
    data._weekPlanKey = planKey;
    saveData(data);
  }
  const plan = data.weekPlan;
  const el = document.getElementById('page-wochenplan');

  // Calculate fight phase per day for header badges
  const today = new Date(); today.setHours(0,0,0,0);
  const todayDow = (today.getDay() + 6) % 7;
  const dayPhases = {};
  if (data.fightDate) {
    const fightDay = new Date(data.fightDate + 'T00:00:00');
    DAY_NAMES.forEach((day, di) => {
      const dayDate = new Date(today);
      dayDate.setDate(dayDate.getDate() + (di - todayDow));
      const diff = Math.ceil((fightDay - dayDate) / 86400000);
      if (diff >= -2 && diff < 0) dayPhases[day] = { label: 'RECOVERY', color: 'var(--green)' };
      else if (diff === 0) dayPhases[day] = { label: 'KAMPFTAG', color: 'var(--red)' };
      else if (diff <= 2 && diff > 0) dayPhases[day] = { label: 'KAMPF-MODUS', color: 'var(--red)' };
      else if (diff <= 4 && diff > 0) dayPhases[day] = { label: 'SCHÄRFEN', color: 'var(--blue)' };
      else dayPhases[day] = { label: 'TRAINING', color: 'var(--green)' };
    });
  }

  // Overall phase display
  let phaseHTML = '';
  if (data.fightDate) {
    const diff = Math.ceil((new Date(data.fightDate + 'T00:00:00') - today) / 86400000);
    const phase = getFightPhase(diff);
    phaseHTML = `<div style="margin-bottom:20px;"><span class="phase-badge ${phase.cls}" style="font-size:16px;padding:6px 14px;">${phase.name}</span>
      <span style="font-family:'Space Mono',monospace;font-size:12px;color:#555;margin-left:12px;">${diff > 0 ? diff + ' Tage bis Kampf · ' + formatDate(data.fightDate) : 'Kampf vorbei'}</span></div>`;
  }

  function renderExerciseChips(exercises) {
    if (!exercises || !exercises.length) return '';
    return `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${exercises.map(ex =>
      `<span class="ex-chip" onclick="event.stopPropagation();if(typeof openExerciseDetail==='function')openExerciseDetail('${ex.id}')" title="→ ${ex.label} Details">${ex.label}</span>`
    ).join('')}</div>`;
  }

  el.innerHTML = `
    <div class="page-header">
      <div class="page-title">WOCHEN<span>PLAN</span></div>
      <div class="page-sub">Dein Trainingsplan passt sich automatisch dem Kampfdatum an. Klicke auf Übungen für Details.</div>
    </div>
    ${phaseHTML}
    ${!data.fightDate ? '<div class="info-box info-tip" style="margin-bottom:20px;"><span>💡</span><div>Trage auf dem Dashboard ein <strong>Kampfdatum</strong> ein — der Wochenplan passt sich automatisch an (Schärfen, Kampf-Modus, Recovery).</div></div>' : ''}
    <div class="week-grid">
      ${DAY_NAMES.map((day, di) => {
        const blocks = plan[day] || [];
        const dp = dayPhases[day];
        const isToday = di === todayDow;
        return `<div class="day-col${isToday ? ' day-today' : ''}">
          <div class="day-header">
            <div class="day-name">${DAY_LABELS[di]}${isToday ? ' <span style="font-size:11px;color:var(--gold);">HEUTE</span>' : ''}</div>
            ${dp ? `<div style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px;color:${dp.color};margin-top:2px;">${dp.label}</div>` : ''}
          </div>
          ${(s.weekSchedule[day] && s.weekSchedule[day].type === 'sparring' && blocks.some(b => b.type === 'strength')) ? '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:var(--orange);padding:4px 0;">\u26A0 Schweres S&C + Sparring am gleichen Tag \u2014 erh\u00F6htes Verletzungsrisiko</div>' : ''}
          <div class="day-blocks">
            ${blocks.map((b, bi) => {
              const logKey = day + '_' + bi + '_' + getWeekId();
              const done = isBlockLogged(logKey);
              return `<div class="day-block ${TYPE_CLASS[b.type] || 'meta'}${done ? ' block-done' : ''}" onclick="editBlock('${day}',${bi})" title="Klicke zum Bearbeiten">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="font-family:'Space Mono',monospace;font-size:11px;opacity:.7;">${b.time}</div>
                ${isToday || done ? `<button class="block-check-btn${done ? ' checked' : ''}" onclick="event.stopPropagation();toggleBlockDone('${day}',${bi},'${b.type}','${b.title.replace(/'/g,'\\&#39;')}')" title="${done ? 'Erledigt' : 'Als erledigt markieren'}">${done ? '✓' : '○'}</button>` : ''}
              </div>
              ${b.title}
              ${renderExerciseChips(b.exercises)}
            </div>`}).join('')}
          </div>
          <button class="add-block-btn" onclick="addBlock('${day}')">+ Block</button>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
      <button class="submit-btn" style="padding:8px 16px;font-size:12px;" onclick="regenerateWeekPlan()">NEU GENERIEREN</button>
      <span style="font-family:'Space Mono',monospace;font-size:12px;color:#555;">Erstellt den Plan basierend auf Trainingszeiten + Kampfdatum</span>
    </div>
    <div class="info-box info-tip"><span>💡</span><div>Der Plan wird automatisch neu generiert wenn du ein Kampfdatum einträgst oder änderst. Klicke auf die <strong>blauen Übungs-Tags</strong> um direkt zur Übung mit Details und Muskelgruppen zu navigieren.</div></div>`;
}

function regenerateWeekPlan() {
  if (!confirm('Plan neu generieren? Manuelle Änderungen werden überschrieben.')) return;
  const data = getData();
  if (!data) return;
  data.weekPlan = generateSmartWeekPlan();
  saveData(data);
  renderWeekPlan();
}

function editBlock(day, idx) {
  const data = getData();
  if (!data) return;
  const block = data.weekPlan[day][idx];
  if (!block) return;
  editingBlock = { day, idx };
  document.getElementById('block-edit-title').value = block.title;
  document.getElementById('block-edit-time').value = block.time;
  document.getElementById('block-edit-type').value = block.type;
  document.getElementById('block-modal').classList.add('active');
}

function addBlock(day) {
  const data = getData();
  if (!data) return;
  if (!data.weekPlan[day]) data.weekPlan[day] = [];
  const newBlock = { time: '12:00', title: 'Neuer Block', type: 'meta' };
  data.weekPlan[day].push(newBlock);
  saveData(data);
  editingBlock = { day, idx: data.weekPlan[day].length - 1 };
  document.getElementById('block-edit-title').value = newBlock.title;
  document.getElementById('block-edit-time').value = newBlock.time;
  document.getElementById('block-edit-type').value = newBlock.type;
  document.getElementById('block-modal').classList.add('active');
}

function saveBlock() {
  if (!editingBlock) return;
  const data = getData();
  if (!data) return;
  const existing = data.weekPlan[editingBlock.day][editingBlock.idx];
  data.weekPlan[editingBlock.day][editingBlock.idx] = {
    title: document.getElementById('block-edit-title').value,
    time: document.getElementById('block-edit-time').value,
    type: document.getElementById('block-edit-type').value,
    exercises: existing ? existing.exercises : undefined
  };
  saveData(data);
  closeBlockModal();
  renderWeekPlan();
}

function deleteBlock() {
  if (!editingBlock) return;
  const data = getData();
  if (!data) return;
  data.weekPlan[editingBlock.day].splice(editingBlock.idx, 1);
  saveData(data);
  closeBlockModal();
  renderWeekPlan();
}

function closeBlockModal() { document.getElementById('block-modal').classList.remove('active'); editingBlock = null; }

// Week ID for current week (ISO week start Monday)
function getWeekId() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d.toISOString().split('T')[0];
}

function isBlockLogged(logKey) {
  const data = getData();
  return data && data.completedBlocks && data.completedBlocks[logKey];
}

function toggleBlockDone(day, idx, type, title) {
  const data = getData();
  if (!data) return;
  if (!data.completedBlocks) data.completedBlocks = {};
  const logKey = day + '_' + idx + '_' + getWeekId();
  if (data.completedBlocks[logKey]) {
    // Undo
    delete data.completedBlocks[logKey];
    saveData(data);
  } else {
    // Mark done + auto-log training
    data.completedBlocks[logKey] = { date: new Date().toISOString(), type, title };
    // Auto-create training log entry
    if (!data.log) data.log = [];
    const block = data.weekPlan && data.weekPlan[day] ? data.weekPlan[day][idx] : null;
    const duration = estimateBlockDuration(type);
    data.log.unshift({
      date: new Date().toISOString().split('T')[0],
      type: mapBlockTypeToLogType(type),
      duration: duration,
      rpe: 0,
      weight: null,
      notes: title + ' (via Wochenplan)'
    });
    saveData(data);
  }
  renderWeekPlan();
}

function estimateBlockDuration(type) {
  const dur = { boxen: 90, sparring: 90, pratzen: 60, kraft: 45, sc: 45, cardio: 30, meta: 15, ernaehrung: 0 };
  return dur[type] || 30;
}

function mapBlockTypeToLogType(type) {
  const map = { boxen: 'boxen', sparring: 'sparring', pratzen: 'pratzen', kraft: 'kraft', sc: 'kraft', cardio: 'cardio', meta: 'mobility' };
  return map[type] || 'boxen';
}

// ===== SHARING =====
function sharePlan() {
  const data = getData();
  if (!data) return;
  const shareData = {
    user: currentUser,
    weekPlan: data.weekPlan,
    benchmarks: data.benchmarks,
    fights: data.fights
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
  const url = window.location.origin + window.location.pathname + '?share=' + encoded;
  document.getElementById('share-link').value = url;
  document.getElementById('share-modal').classList.add('active');
}

function copyShareLink() {
  const link = document.getElementById('share-link');
  link.select();
  navigator.clipboard.writeText(link.value);
  link.style.borderColor = 'var(--green)';
  setTimeout(() => link.style.borderColor = '#252525', 1500);
}

function shareWhatsApp() {
  const link = document.getElementById('share-link').value;
  window.open('https://wa.me/?text=' + encodeURIComponent('Check meinen FightOS Trainingsplan: ' + link), '_blank');
}

function closeShareModal() { document.getElementById('share-modal').classList.remove('active'); }

// ===== SETTINGS =====
function openSettingsModal() {
  const s = getUserSchedule();
  const users = JSON.parse(localStorage.getItem('fos_users') || '{}');
  const u = users[currentUser] || {};
  document.getElementById('settings-birthyear').value = u.birthYear || '';
  document.getElementById('settings-weight').value = s.weight;
  document.getElementById('settings-work-start').value = s.workStart;
  document.getElementById('settings-work-end').value = s.workEnd;

  const dayLabels = { mo:'Mo', di:'Di', mi:'Mi', do:'Do', fr:'Fr', sa:'Sa', so:'So' };
  const types = [
    { val:'boxen', label:'Boxen' },
    { val:'pa', label:'Partnerarbeit' },
    { val:'pratzen', label:'Pratzen' },
    { val:'sparring', label:'Sparring' },
    { val:'technik', label:'Technik' },
    { val:'cardio', label:'Nur Cardio' },
    { val:'frei', label:'Frei' }
  ];

  const container = document.getElementById('settings-week-rows');
  container.innerHTML = ['mo','di','mi','do','fr','sa','so'].map(day => {
    const d = s.weekSchedule[day] || { time: null, type: 'frei' };
    const isFrei = d.type === 'frei';
    return `<div style="display:flex;gap:6px;align-items:center;">
      <span style="font-family:'Bebas Neue',sans-serif;font-size:14px;color:var(--white);min-width:24px;">${dayLabels[day]}</span>
      <select id="sched-type-${day}" onchange="document.getElementById('sched-time-${day}').disabled=this.value==='frei'" style="flex:1;background:#141414;border:1px solid #252525;color:var(--white);padding:8px;font-family:'DM Sans';font-size:12px;border-radius:4px;">
        ${types.map(t => `<option value="${t.val}" ${d.type===t.val?'selected':''}>${t.label}</option>`).join('')}
      </select>
      <input id="sched-time-${day}" type="time" value="${d.time || '18:00'}" ${isFrei?'disabled':''} style="width:90px;background:#141414;border:1px solid #252525;color:var(--white);padding:8px;font-family:'DM Sans';font-size:12px;border-radius:4px;">
    </div>`;
  }).join('');

  document.getElementById('settings-modal').classList.add('active');
}

function closeSettingsModal() { document.getElementById('settings-modal').classList.remove('active'); }

function saveSettings() {
  const users = JSON.parse(localStorage.getItem('fos_users') || '{}');
  if (!users[currentUser]) return;
  users[currentUser].birthYear = document.getElementById('settings-birthyear').value;
  users[currentUser].weight = document.getElementById('settings-weight').value;
  users[currentUser].workStart = document.getElementById('settings-work-start').value;
  users[currentUser].workEnd = document.getElementById('settings-work-end').value;

  const ws = {};
  ['mo','di','mi','do','fr','sa','so'].forEach(day => {
    const type = document.getElementById('sched-type-' + day).value;
    const time = type === 'frei' ? null : document.getElementById('sched-time-' + day).value;
    ws[day] = { time, type };
  });
  users[currentUser].weekSchedule = ws;
  // Keep trainingTime for backward compat (use most common non-null time)
  const times = Object.values(ws).filter(d => d.time).map(d => d.time);
  users[currentUser].trainingTime = times[0] || '18:00';

  localStorage.setItem('fos_users', JSON.stringify(users));
  closeSettingsModal();

  // Regenerate week plan based on new schedule + fight date
  const data = getData();
  if (data) {
    data.weekPlan = generateSmartWeekPlan();
    saveData(data);
  }

  renderDashboard();
  renderWeekPlan();
  if (typeof renderErnTimeline === 'function') renderErnTimeline();
  if (typeof renderDashStats === 'function') renderDashStats();
}

// ===== USER SCHEDULE =====
function getDefaultWeekSchedule(defaultTime) {
  return {
    mo: { time: defaultTime, type: 'boxen' },
    di: { time: defaultTime, type: 'pratzen' },
    mi: { time: null, type: 'frei' },
    do: { time: defaultTime, type: 'boxen' },
    fr: { time: defaultTime, type: 'technik' },
    sa: { time: null, type: 'frei' },
    so: { time: '11:00', type: 'sparring' }
  };
}

function getUserSchedule() {
  const users = JSON.parse(localStorage.getItem('fos_users') || '{}');
  const u = users[currentUser];
  if (!u) return { workStart:'08:00', workEnd:'17:00', trainingTime:'18:00', weight:75, nickname:'Boxer', experienceLevel:'anfaenger', boxingYears:0, height:175, goal:'fitness', fitnessLevel:'mittel', weekSchedule: getDefaultWeekSchedule('18:00') };
  const ws = u.weekSchedule || getDefaultWeekSchedule(u.trainingTime || '18:00');
  return {
    workStart: u.workStart || '08:00',
    workEnd: u.workEnd || '17:00',
    trainingTime: u.trainingTime || '18:00',
    weight: parseInt(u.weight) || 75,
    nickname: u.nickname || currentUser,
    experienceLevel: u.experienceLevel || 'fortgeschritten',
    boxingYears: parseInt(u.boxingYears) || 0,
    height: parseInt(u.height) || 175,
    goal: u.goal || 'fitness',
    fitnessLevel: u.fitnessLevel || 'mittel',
    weekSchedule: ws
  };
}

function getTodaySchedule() {
  const s = getUserSchedule();
  const jsDay = new Date().getDay(); // 0=Sun
  const dayKey = ['so','mo','di','mi','do','fr','sa'][jsDay];
  const daySchedule = s.weekSchedule[dayKey] || { time: null, type: 'frei' };
  return { ...daySchedule, dayKey, workStart: s.workStart, workEnd: s.workEnd, weight: s.weight };
}

function timeAdd(timeStr, hours, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  let totalMin = h * 60 + m + (hours || 0) * 60 + (minutes || 0);
  if (totalMin < 0) totalMin += 1440;
  if (totalMin >= 1440) totalMin -= 1440;
  return String(Math.floor(totalMin / 60)).padStart(2,'0') + ':' + String(totalMin % 60).padStart(2,'0');
}

function timeBefore(timeStr, hours, minutes) {
  return timeAdd(timeStr, -(hours||0), -(minutes||0));
}

function renderDailyRoutine() {
  const el = document.getElementById('daily-routine');
  if (!el) return;
  el.innerHTML = buildDailyRoutineHTML();
}

function buildDailyRoutineHTML() {
  const today = getTodaySchedule();
  const s = getUserSchedule();
  const ws = s.weekSchedule;
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const isBoxingDay = ['boxen', 'pa', 'pratzen', 'technik'].includes(today.type);
  const isSparringDay = today.type === 'sparring';
  const isFreeDay = today.type === 'frei';
  const isWeekend = (today.dayKey === 'sa' || today.dayKey === 'so');

  // Determine tomorrow
  const todayIdx = DAY_NAMES.indexOf(today.dayKey);
  const tomorrowKey = DAY_NAMES[(todayIdx + 1) % 7];
  const tomorrow = ws[tomorrowKey] || { time: null, type: 'frei' };
  const tomorrowIsSparring = tomorrow.type === 'sparring';
  const tomorrowIsBoxing = ['boxen', 'pa', 'pratzen', 'technik'].includes(tomorrow.type);

  const TYPE_LABEL_MAP = {
    pa: 'Partnerarbeit', pratzen: 'Pratzenarbeit', sparring: 'Sparring',
    technik: 'Techniktraining', boxen: 'Boxtraining', cardio: 'Cardio', frei: 'Freier Tag'
  };
  const dayLabel = DAY_LABELS[todayIdx];
  const typeLabel = TYPE_LABEL_MAP[today.type] || today.type;

  const wakeUp = timeBefore(today.workStart, 1, 30);
  const wakeTime = isWeekend && isFreeDay ? '08:00' : (isWeekend && today.time ? timeBefore(today.time, 2, 30) : wakeUp);
  const lunchTime = timeAdd(today.workStart, 4, 30);

  const routine = [];

  // --- SMART WARNINGS ---
  const warnings = [];

  if (isSparringDay) {
    // === SPARRING TAG ===
    routine.push({ time: timeAdd(wakeTime, 0, 10), label: 'IMT — 30 Atemzüge', color: 'var(--red)' });
    routine.push({ time: timeAdd(wakeTime, 0, 20), label: 'Leichte Mobility 10 Min. (CNS schonen!)', color: 'var(--purple)' });
    if (!isWeekend) {
      routine.push({ time: timeBefore(today.workStart, 0, 15), label: 'Zur Arbeit (Fahrrad = Zone 2)', color: 'var(--green)' });
      routine.push({ time: today.workStart, label: 'Arbeit', color: '#555' });
      routine.push({ time: timeAdd(lunchTime, 0, 25), label: 'Optional: Leichtes BET Stroop 10 Min.', color: 'var(--gold)' });
      routine.push({ time: today.workEnd, label: 'Feierabend', color: '#555' });
    }
    routine.push({ time: timeBefore(today.time, 1, 0), label: 'Pre-Training Snack', color: 'var(--green)' });
    routine.push({ time: today.time, label: 'Sparring', color: 'var(--red)' });
    routine.push({ time: timeAdd(today.time, 1, 30), label: 'Post-Sparring Essen (extra Protein)', color: 'var(--green)' });
    routine.push({ time: timeAdd(today.time, 2, 30), label: 'Erweiterte Mobility + Foam Rolling 20 Min.', color: 'var(--purple)' });
    warnings.push('Sparring-Tag: Kein schweres S&C heute. CNS-Erholung priorisieren!');

  } else if (isBoxingDay) {
    // === BOXTAG ===
    routine.push({ time: timeAdd(wakeTime, 0, 10), label: 'IMT — 30 Atemzüge', color: 'var(--red)' });
    routine.push({ time: timeAdd(wakeTime, 0, 15), label: 'Leichte Isometrics + Nackentraining (~20 Min.)', color: 'var(--red)' });
    if (!isWeekend) {
      routine.push({ time: timeBefore(today.workStart, 0, 15), label: 'Zur Arbeit (Fahrrad = Zone 2)', color: 'var(--green)' });
      routine.push({ time: today.workStart, label: 'Arbeit', color: '#555' });
      routine.push({ time: timeAdd(lunchTime, 0, 25), label: 'BET Stroop-Training 20 Min. + IMT', color: 'var(--gold)' });
      routine.push({ time: today.workEnd, label: 'Feierabend', color: '#555' });
    }
    routine.push({ time: timeBefore(today.time, 1, 0), label: 'Pre-Training Snack', color: 'var(--green)' });
    routine.push({ time: today.time, label: typeLabel, color: 'var(--red)' });
    routine.push({ time: timeAdd(today.time, 1, 30), label: 'Post-Training Essen', color: 'var(--green)' });
    routine.push({ time: timeAdd(today.time, 2, 30), label: 'Mobility / Foam Rolling 10 Min.', color: 'var(--purple)' });

  } else if (isFreeDay) {
    // === FREIER TAG ===
    routine.push({ time: timeAdd(wakeTime, 0, 10), label: 'IMT — 30 Atemzüge', color: 'var(--red)' });

    if (tomorrowIsSparring) {
      // Tag vor Sparring: leicht halten!
      routine.push({ time: timeAdd(wakeTime, 0, 20), label: 'Leichte Mobility + Dehnen 15 Min. (morgen Sparring!)', color: 'var(--purple)' });
      if (!isWeekend) {
        routine.push({ time: timeBefore(today.workStart, 0, 15), label: 'Zur Arbeit (Fahrrad = Zone 2)', color: 'var(--green)' });
        routine.push({ time: today.workStart, label: 'Arbeit', color: '#555' });
        routine.push({ time: today.workEnd, label: 'Feierabend', color: '#555' });
      }
      routine.push({ time: isWeekend ? '14:00' : timeAdd(today.workEnd, 0, 30), label: 'Zone 2 Spaziergang 30 Min.', color: 'var(--green)' });
      warnings.push('Morgen Sparring! Kein schweres Training heute. Carbs laden, früh schlafen.');
    } else {
      // Normaler freier Tag: S&C erlaubt
      const scTime = timeAdd(wakeTime, 0, 20);
      routine.push({ time: scTime, label: 'S&C: Trap Bar DL + Jump Squats + Power Clean', color: 'var(--red)' });
      routine.push({ time: timeAdd(scTime, 0, 40), label: 'BFR Finisher (Arme / Beine)', color: 'var(--red)' });
      routine.push({ time: timeAdd(scTime, 0, 50), label: 'Nackentraining 10 Min.', color: 'var(--red)' });
      if (!isWeekend) {
        routine.push({ time: timeBefore(today.workStart, 0, 15), label: 'Zur Arbeit (Fahrrad = Zone 2)', color: 'var(--green)' });
        routine.push({ time: today.workStart, label: 'Arbeit', color: '#555' });
        routine.push({ time: timeAdd(lunchTime, 0, 25), label: 'BET Stroop-Training 20 Min. + IMT', color: 'var(--gold)' });
        routine.push({ time: today.workEnd, label: 'Feierabend', color: '#555' });
      }
      routine.push({ time: isWeekend ? '14:00' : timeAdd(today.workEnd, 0, 30), label: 'Zone 2 Cardio 30–45 Min. (Laufen / Rad)', color: 'var(--green)' });
      routine.push({ time: isWeekend ? '19:00' : timeAdd(today.workEnd, 2, 30), label: 'Mobility / Foam Rolling 15 Min.', color: 'var(--purple)' });
    }
  }

  // --- Sleep warning: estimate available sleep ---
  const lastBlock = routine.length ? routine[routine.length - 1] : null;
  if (lastBlock) {
    // Tomorrow's wake-up estimate
    const tomorrowWorkStart = tomorrow.workStart || today.workStart || '08:00';
    const tomorrowWake = tomorrow.type === 'frei' && [0,6].includes((todayIdx + 1) % 7)
      ? '08:00' : timeBefore(tomorrowWorkStart, 1, 30);
    const [lh, lm] = lastBlock.time.split(':').map(Number);
    const [wh, wm] = tomorrowWake.split(':').map(Number);
    // Add ~1h buffer after last training block for wind-down
    const sleepStart = (lh * 60 + lm) + 60;
    let wakeMin = wh * 60 + wm;
    if (wakeMin <= sleepStart) wakeMin += 1440;
    const sleepHours = (wakeMin - sleepStart) / 60;
    if (sleepHours < 7) {
      warnings.push(`Achtung: Nur ~${sleepHours.toFixed(1)}h Schlaf möglich zwischen letztem Block und morgen früh. Schlaf priorisieren!`);
    } else if (sleepHours < 8 && isSparringDay) {
      warnings.push(`Nach Sparring solltest du 9h+ schlafen. Aktuell nur ~${sleepHours.toFixed(1)}h möglich.`);
    }
  }

  // Tomorrow sparring warning (general)
  if (tomorrowIsSparring && !isFreeDay) {
    warnings.push('Morgen ist Sparring-Tag — heute CNS schonen und früh schlafen!');
  }

  // Sort by time
  routine.sort((a, b) => {
    const [ah, am] = a.time.split(':').map(Number);
    const [bh, bm] = b.time.split(':').map(Number);
    return (ah * 60 + am) - (bh * 60 + bm);
  });

  // Tomorrow note
  const tomorrowLabel = DAY_LABELS[(todayIdx + 1) % 7];
  const tomorrowTypeLabel = TYPE_LABEL_MAP[tomorrow.type] || tomorrow.type;
  let tomorrowNote = '';
  if (tomorrowIsSparring) {
    tomorrowNote = `<div style="margin-top:14px;padding:10px 14px;background:#1a1208;border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);">Morgen: Sparring \u2014 heute fr\u00fch schlafen!</div>`;
  } else if (tomorrowIsBoxing) {
    tomorrowNote = `<div style="margin-top:14px;padding:10px 14px;background:#0d1a0d;border:1px solid var(--green);border-radius:8px;font-size:12px;color:var(--green);">Morgen: ${tomorrowTypeLabel} (${tomorrowLabel}) um ${tomorrow.time || '?'}</div>`;
  } else if (tomorrow.type === 'frei') {
    tomorrowNote = `<div style="margin-top:14px;padding:10px 14px;background:#111;border:1px solid #333;border-radius:8px;font-size:12px;color:#666;">Morgen: Freier Tag (${tomorrowLabel})</div>`;
  }

  // Header with today's type
  const headerHTML = `<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px;">
    <span style="font-family:'Space Mono',monospace;font-size:11px;color:#555;">${dayLabel}</span>
    <span style="background:${isBoxingDay || isSparringDay ? 'var(--red)' : isFreeDay ? 'var(--green)' : 'var(--gold)'};color:#000;font-size:12px;font-weight:700;padding:3px 10px;border-radius:4px;text-transform:uppercase;">${typeLabel}${today.time ? ' \u00b7 ' + today.time : ''}</span>
  </div>`;

  // Warnings HTML
  const warningsHTML = warnings.length ? warnings.map(w =>
    `<div style="margin-bottom:6px;padding:8px 12px;background:#1a1208;border:1px solid var(--orange);border-radius:6px;font-size:11px;color:var(--orange);">⚠ ${w}</div>`
  ).join('') : '';

  return headerHTML + warningsHTML + routine.map(r => {
    const [rh, rm] = r.time.split(':').map(Number);
    const rMin = rh * 60 + rm;
    const isNow = Math.abs(currentMin - rMin) < 30;
    return `<div class="routine-item ${isNow ? 'routine-now' : ''}">
      <div class="routine-time" ${isNow ? 'style="color:var(--red);"' : ''}>${r.time}</div>
      <div class="routine-label">${isNow ? '<strong>' : ''}<span style="color:${r.color};margin-right:6px;">\u25cf</span> ${r.label}${isNow ? ' \u2190 JETZT</strong>' : ''}</div>
    </div>`;
  }).join('') + tomorrowNote +
  `<div style="margin-top:12px;font-family:'Space Mono',monospace;font-size:12px;color:#333;">Basierend auf deinem Tagesplan (${today.workStart}\u2013${today.workEnd})${today.time ? ' \u00b7 Training: ' + today.time : ''}</div>`;
}

// ===== SEARCH =====
function handleSearch(query) {
  const el = document.getElementById('search-results');
  if (!query || query.length < 2) { el.innerHTML = ''; return; }
  const q = query.toLowerCase();

  // Get searchable content from pages.js
  const items = typeof getSearchableContent === 'function' ? getSearchableContent() : [];
  const results = items.filter(item => {
    const text = (item.title + ' ' + (item.text || '')).toLowerCase();
    return text.includes(q);
  }).slice(0, 8);

  if (!results.length) {
    el.innerHTML = '<div class="search-item"><div class="search-item-title" style="color:#555;">Keine Ergebnisse</div></div>';
    return;
  }

  el.innerHTML = results.map(r => {
    let action;
    if (r.exerciseId) action = "openExerciseDetail('"+r.exerciseId+"')";
    else if (r.saeulenIdx !== undefined) action = "openSaeuleDetail("+r.saeulenIdx+")";
    else if (r.supplementId) action = "openSupplementDetail('"+r.supplementId+"')";
    else action = "showPage('"+r.page+"')";
    return `<div class="search-item" onmousedown="${action}">
      <div class="search-item-title">${highlightMatch(r.title, query)}</div>
      <div class="search-item-ctx">${r.context}</div>
    </div>`;
  }).join('');
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx) + '<span style="color:var(--red);font-weight:700;">' + text.slice(idx, idx + query.length) + '</span>' + text.slice(idx + query.length);
}

// ===== REMINDERS =====
function renderReminders() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('dash-reminders');
  if (!el) return;

  const reminders = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const benchmarks = data.benchmarks || {};
  const history = data.benchmarkHistory || {};
  const hrv = data.hrv || [];
  const log = data.log || [];

  // --- Benchmark-Test Erinnerungen (interval from getBenchmarks) ---
  const BENCH_INTERVALS = {};
  getBenchmarks().forEach(b => { BENCH_INTERVALS[b.id] = { name: b.name, weeks: b.interval }; });

  for (const [id, cfg] of Object.entries(BENCH_INTERVALS)) {
    const hist = history[id];
    if (!hist || !hist.length) {
      if (benchmarks[id]) continue; // Has a value but no history (legacy data)
      reminders.push({ priority: 1, color: 'var(--blue)', text: `${cfg.name} — noch nie getestet. Ersten Wert eintragen!` });
    } else {
      const lastDate = new Date(hist[hist.length - 1].date);
      const daysSince = Math.floor((today - lastDate) / 86400000);
      const dueIn = cfg.weeks * 7 - daysSince;
      if (dueIn <= 0) {
        reminders.push({ priority: 2, color: 'var(--red)', text: `${cfg.name} — letzter Test vor ${daysSince} Tagen. Zeit für einen neuen Test!` });
      } else if (dueIn <= 7) {
        reminders.push({ priority: 0, color: 'var(--gold)', text: `${cfg.name} — nächster Test in ${dueIn} Tagen fällig.` });
      }
    }
  }

  // --- HRV Erinnerung ---
  if (hrv.length === 0) {
    reminders.push({ priority: 1, color: 'var(--blue)', text: 'HRV — noch nie eingetragen. Morgens messen für bessere Trainingssteuerung.' });
  } else {
    const lastHRV = new Date(hrv[0].date);
    const daysSinceHRV = Math.floor((today - lastHRV) / 86400000);
    if (daysSinceHRV >= 3) {
      reminders.push({ priority: 2, color: 'var(--gold)', text: `HRV — seit ${daysSinceHRV} Tagen nicht eingetragen.` });
    }
  }

  // --- Training-Log Erinnerung ---
  if (log.length === 0) {
    reminders.push({ priority: 1, color: 'var(--blue)', text: 'Training-Log — noch keine Einheiten dokumentiert.' });
  } else {
    const lastLog = new Date(log[0].date);
    const daysSinceLog = Math.floor((today - lastLog) / 86400000);
    if (daysSinceLog >= 4) {
      reminders.push({ priority: 0, color: 'var(--gold)', text: `Letzte Trainingseinheit vor ${daysSinceLog} Tagen — alles OK?` });
    }
  }

  // --- Kampf-Erinnerungen ---
  if (data.fightDate) {
    const diff = Math.ceil((new Date(data.fightDate + 'T00:00:00') - today) / 86400000);
    if (diff === 5 || diff === 4) {
      reminders.push({ priority: 3, color: 'var(--red)', text: `Kampf in ${diff} Tagen — Gewicht checken! Letztes hartes Sparring sollte jetzt sein.` });
    }
    if (diff === 1) {
      reminders.push({ priority: 3, color: 'var(--red)', text: 'MORGEN KAMPF — Equipment packen, Carbs laden, früh schlafen.' });
    }
  }

  // --- Leere Benchmarks die nie getestet wurden ---
  const neverTested = Object.keys(BENCH_INTERVALS).filter(id => !benchmarks[id] && !(history[id] && history[id].length));
  if (neverTested.length >= 5) {
    // Replace individual "nie getestet" reminders with one summary
    const individual = reminders.filter(r => r.text.includes('nie getestet'));
    if (individual.length > 3) {
      individual.forEach(r => reminders.splice(reminders.indexOf(r), 1));
      reminders.push({ priority: 1, color: 'var(--blue)', text: `${neverTested.length} Benchmarks noch nie getestet — trage deine ersten Werte ein.` });
    }
  }

  // Sort by priority (highest first)
  reminders.sort((a, b) => b.priority - a.priority);

  if (!reminders.length) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = `
    <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--white);margin-bottom:12px;">ERINNERUNGEN</div>
    ${reminders.slice(0, 5).map(r => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;padding:8px 12px;background:rgba(255,255,255,.02);border-left:3px solid ${r.color};border-radius:0 4px 4px 0;">
      <span style="font-size:12px;color:${r.color};line-height:1.4;">${r.text}</span>
    </div>`).join('')}`;
}

// ===== RENDER DASHBOARD =====
function renderDashboard() {
  renderFightCountdown();
  renderDashStats();
  renderHRV();
  renderHinweise();
  renderBenchSummary();
  renderDailyCombined();
  renderFightLog();
  renderRecentLog();
}

// ===== DASHBOARD BENCH SUMMARY =====
function renderBenchSummary() {
  const el = document.getElementById('bench-summary');
  if (!el) return;
  const data = getData();
  if (!data) return;
  const b = data.benchmarks || {};
  const BENCH = getBenchmarks();
  const filled = BENCH.filter(x => b[x.id] && b[x.id] > 0).length;
  const scores = calcProfileScores(data);
  const vals = [scores.kraft, scores.explosiv, scores.ausdauer].filter(v => v !== null);
  const avg = vals.length ? Math.round(vals.reduce((a,v) => a+v, 0) / vals.length) : null;
  el.textContent = avg !== null
    ? `${filled}/${BENCH.length} Tests · Ø ${avg}% Elite-Level`
    : `${filled}/${BENCH.length} Tests eingetragen`;
}

// ===== ACCOUNT PAGE =====
function renderAccountPage() {
  const el = document.getElementById('page-account');
  if (!el) return;
  const users = JSON.parse(localStorage.getItem('fos_users') || '{}');
  const u = users[currentUser] || {};
  const data = getData();

  const yOpts = Array.from({length:43}, (_,i) => {
    const y = 2012 - i;
    return `<option value="${y}" ${u.birthYear==y?'selected':''}>${y}</option>`;
  }).join('');

  const wOpts = [50,55,60,65,70,75,80,85,90,95,100].map(w =>
    `<option value="${w}" ${parseInt(u.weight)===w?'selected':''}>${w} kg</option>`
  ).join('') + `<option value="100+" ${u.weight==='100+'?'selected':''}>100+ kg</option>`;

  const expOpts = [
    ['anfaenger','Anfänger'],['fortgeschritten','Fortgeschritten'],['wettkampf','Wettkämpfer']
  ].map(([v,l]) => `<option value="${v}" ${u.experienceLevel===v?'selected':''}>${l}</option>`).join('');

  const goalOpts = [
    ['erster-kampf','Erster Kampf'],['wettkampf-vorbereitung','Kampfvorbereitung'],
    ['gewicht-wechsel','Gewichtsklasse wechseln'],['fitness','Boxer-Fitness']
  ].map(([v,l]) => `<option value="${v}" ${u.goal===v?'selected':''}>${l}</option>`).join('');

  const fitOpts = [
    ['schlecht','Einsteiger'],['mittel','Solide Basis'],['gut','Fit'],['sehr-gut','Top-Form']
  ].map(([v,l]) => `<option value="${v}" ${u.fitnessLevel===v?'selected':''}>${l}</option>`).join('');

  const dayLabels = { mo:'Mo', di:'Di', mi:'Mi', do:'Do', fr:'Fr', sa:'Sa', so:'So' };
  const types = [
    { val:'boxen', label:'Boxen' },{ val:'pa', label:'Partnerarbeit' },
    { val:'pratzen', label:'Pratzen' },{ val:'sparring', label:'Sparring' },
    { val:'technik', label:'Technik' },{ val:'cardio', label:'Nur Cardio' },
    { val:'frei', label:'Frei' }
  ];
  const ws = u.weekSchedule || getDefaultWeekSchedule('18:00');

  el.innerHTML = `
    <div class="page-header">
      <div class="page-title">MEIN <span>ACCOUNT</span></div>
      <div class="page-sub">Alle Einstellungen an einem Ort. Änderungen passen das gesamte System an.</div>
    </div>
    <div class="account-wrap">
      <div class="account-section">
        <div class="account-section-title">PERSÖNLICHE DATEN</div>
        <div class="account-grid">
          <div class="form-group">
            <label class="form-label">Spitzname</label>
            <input class="form-input" id="acc-nickname" value="${u.nickname||currentUser}">
          </div>
          <div class="form-group">
            <label class="form-label">Geburtsjahr</label>
            <select class="form-select" id="acc-birthyear"><option value="">—</option>${yOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Gewichtsklasse</label>
            <select class="form-select" id="acc-weight">${wOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Größe (cm)</label>
            <input class="form-input" id="acc-height" type="number" value="${u.height||175}" min="140" max="220">
          </div>
        </div>
      </div>

      <div class="account-section">
        <div class="account-section-title">BOX-PROFIL</div>
        <div class="account-grid">
          <div class="form-group">
            <label class="form-label">Erfahrungs-Level</label>
            <select class="form-select" id="acc-experience">${expOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Jahre Boxerfahrung</label>
            <input class="form-input" id="acc-years" type="number" value="${u.boxingYears||0}" min="0" max="40">
          </div>
          <div class="form-group">
            <label class="form-label">Ziel</label>
            <select class="form-select" id="acc-goal">${goalOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Fitness-Level</label>
            <select class="form-select" id="acc-fitness">${fitOpts}</select>
          </div>
        </div>
      </div>

      <div class="account-section">
        <div class="account-section-title">ZEITPLAN</div>
        <div class="account-grid" style="margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label">Arbeitszeit von</label>
            <input class="form-input" id="acc-work-start" type="time" value="${u.workStart||'08:00'}">
          </div>
          <div class="form-group">
            <label class="form-label">Arbeitszeit bis</label>
            <input class="form-input" id="acc-work-end" type="time" value="${u.workEnd||'17:00'}">
          </div>
        </div>
        <label class="form-label" style="margin-bottom:8px;display:block;">Trainingszeiten pro Tag</label>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${['mo','di','mi','do','fr','sa','so'].map(day => {
            const d = ws[day] || { time: null, type: 'frei' };
            const isFrei = d.type === 'frei';
            return `<div style="display:flex;gap:6px;align-items:center;">
              <span style="font-family:'Bebas Neue',sans-serif;font-size:14px;color:var(--white);min-width:24px;">${dayLabels[day]}</span>
              <select id="acc-type-${day}" onchange="document.getElementById('acc-time-${day}').disabled=this.value==='frei'" class="form-select" style="flex:1;padding:8px;font-size:12px;">
                ${types.map(t => `<option value="${t.val}" ${d.type===t.val?'selected':''}>${t.label}</option>`).join('')}
              </select>
              <input id="acc-time-${day}" type="time" value="${d.time||'18:00'}" ${isFrei?'disabled':''} class="form-input" style="width:100px;padding:8px;font-size:12px;">
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="account-section">
        <div class="account-section-title">KAMPF</div>
        <div class="form-group">
          <label class="form-label">Nächster Kampf (optional)</label>
          <input class="form-input" id="acc-fightdate" type="date" value="${data?.fightDate||''}">
        </div>
      </div>

      <button class="btn btn-red" onclick="saveAccountPage()" style="margin-bottom:16px;">SPEICHERN</button>
      <div id="acc-msg" class="auth-msg" style="margin-bottom:24px;"></div>
    </div>`;
}

function saveAccountPage() {
  const users = JSON.parse(localStorage.getItem('fos_users') || '{}');
  if (!users[currentUser]) return;

  users[currentUser].nickname = document.getElementById('acc-nickname').value.trim() || currentUser;
  users[currentUser].birthYear = document.getElementById('acc-birthyear').value;
  users[currentUser].weight = document.getElementById('acc-weight').value;
  users[currentUser].height = parseInt(document.getElementById('acc-height').value) || 175;
  users[currentUser].experienceLevel = document.getElementById('acc-experience').value;
  users[currentUser].boxingYears = parseInt(document.getElementById('acc-years').value) || 0;
  users[currentUser].goal = document.getElementById('acc-goal').value;
  users[currentUser].fitnessLevel = document.getElementById('acc-fitness').value;
  users[currentUser].workStart = document.getElementById('acc-work-start').value;
  users[currentUser].workEnd = document.getElementById('acc-work-end').value;

  const ws = {};
  ['mo','di','mi','do','fr','sa','so'].forEach(day => {
    const type = document.getElementById('acc-type-' + day).value;
    const time = type === 'frei' ? null : document.getElementById('acc-time-' + day).value;
    ws[day] = { time, type };
  });
  users[currentUser].weekSchedule = ws;
  const times = Object.values(ws).filter(d => d.time).map(d => d.time);
  users[currentUser].trainingTime = times[0] || '18:00';

  localStorage.setItem('fos_users', JSON.stringify(users));

  // Update fight date + regenerate week plan
  const data = getData();
  if (data) {
    const newFight = document.getElementById('acc-fightdate').value || '';
    data.fightDate = newFight;
    data.weekPlan = generateSmartWeekPlan();
    saveData(data);
  }

  // Update UI
  document.getElementById('user-pill').textContent = getDisplayName();
  const msg = document.getElementById('acc-msg');
  msg.className = 'auth-msg success';
  msg.textContent = 'Gespeichert! Alle Werte wurden aktualisiert.';
  setTimeout(() => { msg.textContent = ''; }, 3000);

  // Re-render affected pages
  renderDashboard();
  if (typeof renderWeekPlan === 'function') renderWeekPlan();
  if (typeof renderErnTimeline === 'function') renderErnTimeline();
  if (typeof renderDashStats === 'function') renderDashStats();
}

// ===== TESTS PAGE =====
function renderTestsPage() {
  const el = document.getElementById('page-tests');
  if (!el) return;
  const data = getData();
  if (!data) return;
  if (!data.benchmarks) data.benchmarks = {};
  if (!data.benchmarkHistory) data.benchmarkHistory = {};

  const scores = calcProfileScores(data);
  const BENCHMARKS = getBenchmarks();
  const bw = getUserSchedule().weight || 75;

  // Overall score
  const filled = Object.values(scores).filter(v => v !== null);
  const overall = filled.length ? Math.round(filled.reduce((a, b) => a + b, 0) / filled.length) : null;
  const overallLevel = overall !== null ? getBenchLevel(overall) : null;

  // Weakest axis
  let weakest = null;
  if (filled.length >= 2) {
    let minVal = 999, minKey = '';
    RADAR_AXES.forEach(a => {
      if (scores[a.key] !== null && scores[a.key] < minVal) { minVal = scores[a.key]; minKey = a.label; }
    });
    weakest = { label: minKey, val: minVal };
  }

  // Cooper → VO2max estimate
  const cooperVal = data.benchmarks.cooper;
  const vo2max = cooperVal ? ((cooperVal - 504) / 44.7).toFixed(1) : null;

  // Hero section
  const heroHTML = `<div class="tests-hero">
    <div class="tests-radar-wrap">
      <canvas id="tests-radar" width="260" height="260"></canvas>
    </div>
    <div class="tests-overview">
      <div class="tests-overall">
        <div class="tests-overall-score">${overall !== null ? overall + '%' : '—'}</div>
        <div>
          <div class="tests-overall-label">${overallLevel ? overallLevel.label.toUpperCase() : 'KEINE DATEN'}</div>
          <div style="font-family:'Space Mono',monospace;font-size:11px;color:#444;margin-top:2px;">Gesamt · ${filled.length}/${RADAR_AXES.length} Achsen</div>
        </div>
      </div>
      ${RADAR_AXES.map(a => {
        const val = scores[a.key];
        const level = val !== null ? getBenchLevel(val) : null;
        return `<div class="tests-axis-row">
          <div class="tests-axis-dot" style="background:${a.hex};"></div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <span class="tests-axis-label">${a.label}</span>
              <span class="tests-axis-val" style="color:${val !== null ? a.hex : '#333'};">${val !== null ? val + '%' : '—'}</span>
            </div>
            <div class="tests-axis-bar"><div class="tests-axis-fill" style="width:${val||0}%;background:${a.hex};"></div></div>
          </div>
        </div>`;
      }).join('')}
      ${vo2max ? `<div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;margin-top:6px;padding-top:8px;border-top:1px solid #1a1a1a;">VO₂max (geschätzt): <strong style="color:var(--blue);">${vo2max} ml/kg/min</strong></div>` : ''}
      ${weakest ? `<div class="tests-weakest">Schwächstes Glied: <strong>${weakest.label} (${weakest.val}%)</strong> — das Fass-Prinzip: Dein Gesamtniveau wird von der schwächsten Säule begrenzt.</div>` : ''}
    </div>
  </div>`;

  // Cluster sections with test cards
  const clusters = ['Maximalkraft', 'Explosivität', 'Ausdauer', 'Körper'];
  const clusterColors = { Maximalkraft:'var(--red)', 'Explosivität':'var(--gold)', Ausdauer:'var(--blue)', 'Körper':'var(--green)' };
  const clusterHex = { Maximalkraft:'#e8000d', 'Explosivität':'#f5c518', Ausdauer:'#2979ff', 'Körper':'#4caf50' };

  const benchHTML = clusters.map(c => {
    const items = BENCHMARKS.filter(b => b.cluster === c);
    // Cluster avg
    const clusterPcts = items.map(b => {
      const val = data.benchmarks[b.id] || 0;
      if (val === 0) return null;
      if (b.inverse) {
        const upper = b.id === 'bodyfat' ? 25 : 100;
        return Math.min(100, Math.max(0, ((upper - val) / (upper - b.target)) * 100));
      }
      return Math.min(100, (val / b.target) * 100);
    }).filter(v => v !== null);
    const clusterAvg = clusterPcts.length ? Math.round(clusterPcts.reduce((a, v) => a + v, 0) / clusterPcts.length) : null;
    const clusterLevel = clusterAvg !== null ? getBenchLevel(clusterAvg) : null;

    return `<div class="tests-cluster">
      <div class="tests-cluster-header">
        <span class="tests-cluster-title" style="color:${clusterColors[c]};">${c.toUpperCase()}</span>
        ${clusterLevel ? `<span class="tests-cluster-avg" style="color:${clusterLevel.color};">${clusterLevel.label} · ${clusterAvg}%</span>` : '<span class="tests-cluster-avg" style="color:#333;">— Noch keine Tests</span>'}
      </div>
      ${items.map(b => {
        const val = data.benchmarks[b.id] || 0;
        const hist = data.benchmarkHistory[b.id] || [];
        let pct;
        if (val === 0) {
          pct = 0;
        } else if (b.inverse) {
          const upper = b.id === 'bodyfat' ? 25 : 100;
          pct = Math.min(100, Math.max(0, ((upper - val) / (upper - b.target)) * 100));
        } else {
          pct = Math.min(100, (val / b.target) * 100);
        }
        const level = val > 0 ? getBenchLevel(pct) : { label:'—', color:'#333' };

        // Trend
        let trendHTML = '';
        if (hist.length >= 2) {
          const first = hist[0].value;
          const diff = val - first;
          const better = b.inverse ? diff < 0 : diff > 0;
          const arrow = better ? '↑' : diff === 0 ? '→' : '↓';
          const tColor = better ? 'var(--green)' : diff === 0 ? '#555' : 'var(--red)';
          const absDiff = Math.abs(diff);
          trendHTML = `<span class="test-card-meta-item" style="color:${tColor};">${arrow} ${b.inverse && diff < 0 ? '-' : '+'}${absDiff % 1 === 0 ? absDiff : absDiff.toFixed(1)} ${b.unit}</span>`;
        }

        // Sparkline
        let sparkHTML = '';
        if (hist.length >= 3) {
          const vals = hist.map(h => h.value);
          const min = Math.min(...vals), max = Math.max(...vals);
          const range = max - min || 1;
          const w = 80, h2 = 20;
          const pts = vals.map((v, i) => {
            const x = (i / (vals.length - 1)) * w;
            const y = b.inverse
              ? (v - min) / range * (h2 - 4) + 2
              : h2 - ((v - min) / range * (h2 - 4)) - 2;
            return `${x},${y}`;
          }).join(' ');
          sparkHTML = `<svg width="${w}" height="${h2}" style="vertical-align:middle;"><polyline points="${pts}" fill="none" stroke="${b.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        }

        // Due for retest?
        let dueHTML = '';
        if (hist.length > 0) {
          const lastDate = new Date(hist[hist.length - 1].date);
          const weeksAgo = Math.floor((Date.now() - lastDate) / (7 * 86400000));
          if (weeksAgo >= b.interval) {
            dueHTML = `<span class="test-card-meta-item" style="color:var(--gold);">⏰ Retest fällig (${weeksAgo} Wo. her)</span>`;
          } else {
            dueHTML = `<span class="test-card-meta-item">Letzter: ${formatDate(hist[hist.length - 1].date)}</span>`;
          }
        }

        // How-to steps
        const stepsHTML = (b.howSteps || []).map((s, i) => `
          <div class="how-step" style="animation-delay:${i * 0.07}s;">
            <div class="how-step-num">${i + 1}</div>
            <div class="how-step-body">
              <div class="how-step-title">${s.t}</div>
              <div class="how-step-desc">${s.d}</div>
            </div>
          </div>`).join('');

        return `<div class="test-card">
          <div class="test-card-left">
            <div class="test-card-head">
              <span class="test-card-name"><span class="tt">${b.name}<span class="tt-text">${getBenchTooltip(b)}</span></span></span>
              <span class="test-card-level" style="color:${level.color};">${level.label}${pct > 0 ? ' · ' + Math.round(pct) + '%' : ''}</span>
            </div>
            <div class="test-card-how-row">
              <span class="test-card-how">${b.how}</span>
              ${b.howSteps ? `<button class="how-toggle" onclick="toggleHowTo(this)" aria-label="Messanleitung">WIE MESSEN? ▾</button>` : ''}
            </div>
            <div class="how-panel">${stepsHTML}</div>
            <div class="test-card-bar-wrap">
              <div class="test-card-bar"><div class="test-card-fill" style="width:${pct}%;background:${b.color};"></div></div>
              <span class="test-card-pct" style="color:${b.color};">${Math.round(pct)}%</span>
            </div>
            <div class="test-card-meta">
              <span class="test-card-meta-item">Ziel: ${b.target} ${b.unit}</span>
              ${trendHTML}
              ${dueHTML}
              ${sparkHTML}
            </div>
          </div>
          <div class="test-card-right">
            <div class="test-card-value" style="color:${val ? 'var(--white)' : '#222'};">${val || '—'}</div>
            <div class="test-card-unit">${b.unit}</div>
            <input class="test-card-input" type="number" step="any" placeholder="${b.target}" value="${val||''}"
              onchange="updateBenchmark('${b.id}', this.value)">
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="page-header">
      <div class="page-title">LEISTUNGS<span>TESTS</span></div>
      <div class="page-sub">Nationalkader-Benchmarks für ${bw} kg · Trage nur ein was du messen kannst</div>
    </div>
    <div class="tests-wrap">
      ${heroHTML}
      ${benchHTML}
    </div>
    <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:10px;">
      <span style="font-family:'Space Mono',monospace;font-size:11px;color:#444;align-self:center;">SIEHE AUCH:</span>
      <button onclick="showPage('periodisierung')" style="font-family:'Space Mono',monospace;font-size:12px;color:var(--red);background:none;border:1px solid rgba(232,0,13,.2);border-radius:4px;padding:6px 14px;cursor:pointer;">Periodisierung</button>
      <button onclick="showPage('rechner')" style="font-family:'Space Mono',monospace;font-size:12px;color:var(--gold);background:none;border:1px solid rgba(245,197,24,.2);border-radius:4px;padding:6px 14px;cursor:pointer;">Rechner</button>
    </div>`;

  setTimeout(() => {
    const canvas = document.getElementById('tests-radar');
    if (canvas) renderRadarChart(canvas, scores);
  }, 50);
}

// ===== DAILY COMBINED (Routine + Checklist) =====
function renderDailyCombined() {
  const el = document.getElementById('daily-combined');
  const scoreEl = document.getElementById('checklist-score');
  if (!el) return;

  // --- Checklist part ---
  const cl = getChecklist();
  const done = DAILY_ITEMS.filter(i => cl[i.id]).length;
  const total = DAILY_ITEMS.length;
  const pct = Math.round((done / total) * 100);
  if (scoreEl) scoreEl.innerHTML = `<span style="color:${pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)'};">${done}/${total}</span>`;

  // --- Routine part (call original logic) ---
  const routineHTML = buildDailyRoutineHTML();

  // --- Checklist items ---
  const checkHTML = `
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #1a1a1a;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--white);margin-bottom:10px;">TAGES-CHECKLIST</div>
      <div style="margin-bottom:10px;height:4px;background:#1a1a1a;border-radius:2px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)'};transition:width .3s;"></div>
      </div>
      ${DAILY_ITEMS.map(item => {
        const checked = cl[item.id];
        return `<div style="display:flex;align-items:center;gap:12px;padding:7px 0;border-bottom:1px solid #151515;cursor:pointer;${checked ? 'opacity:.5;' : ''}" onclick="toggleCheck('${item.id}')">
          <div style="width:20px;height:20px;border-radius:4px;border:2px solid ${checked ? 'var(--green)' : '#333'};background:${checked ? 'var(--green)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;color:var(--black);">${checked ? '✓' : ''}</div>
          <span style="font-size:12px;color:${checked ? '#555' : 'var(--light)'};">${item.label}</span>
        </div>`;
      }).join('')}
    </div>`;

  el.innerHTML = routineHTML + checkHTML;
}

// ===== DAILY CHECKLIST =====
const DAILY_ITEMS = [
  { id:'protein', label:'Protein-Ziel erreicht', always:true },
  { id:'schlaf', label:'8h Schlaf', always:true },
  { id:'training', label:'Training absolviert', always:true },
  { id:'wasser', label:'3L+ Wasser', always:true },
  { id:'mobility', label:'Mobility/Stretching', always:true }
];

function getChecklistKey() {
  return 'fos_checklist_' + currentUser + '_' + new Date().toISOString().split('T')[0];
}

function getChecklist() {
  const raw = localStorage.getItem(getChecklistKey());
  return raw ? JSON.parse(raw) : {};
}

function toggleCheck(id) {
  const cl = getChecklist();
  cl[id] = !cl[id];
  localStorage.setItem(getChecklistKey(), JSON.stringify(cl));
  renderDailyCombined();
}

function renderChecklist() {
  const el = document.getElementById('daily-checklist');
  const score = document.getElementById('checklist-score');
  if (!el) return;
  const cl = getChecklist();
  const done = DAILY_ITEMS.filter(i => cl[i.id]).length;
  const total = DAILY_ITEMS.length;
  const pct = Math.round((done / total) * 100);

  score.innerHTML = `<span style="color:${pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)'};">${done}/${total}</span> erledigt`;

  el.innerHTML = `
    <div style="margin-bottom:12px;height:4px;background:#1a1a1a;border-radius:2px;overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:${pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)'};transition:width .3s;"></div>
    </div>
    ${DAILY_ITEMS.map(item => {
      const checked = cl[item.id];
      return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #151515;cursor:pointer;${checked ? 'opacity:.5;' : ''}" onclick="toggleCheck('${item.id}')">
        <div style="width:22px;height:22px;border-radius:4px;border:2px solid ${checked ? 'var(--green)' : '#333'};background:${checked ? 'var(--green)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;color:var(--black);">${checked ? '✓' : ''}</div>
        <span style="font-size:13px;color:${checked ? '#555' : 'var(--light)'};">${item.label}</span>
      </div>`;
    }).join('')}
    <div style="margin-top:12px;font-family:'Space Mono',monospace;font-size:12px;color:#333;">Checklist resettet sich jeden Tag automatisch</div>`;
}

// ===== COLLAPSIBLE SECTIONS =====
function toggleSection(id) {
  const el = document.getElementById(id);
  const arrow = el.previousElementSibling.querySelector('.section-arrow');
  if (el.style.display === 'none') {
    el.style.display = '';
    if (arrow) arrow.textContent = '▾';
  } else {
    el.style.display = 'none';
    if (arrow) arrow.textContent = '▸';
  }
}

// ===== HELPERS =====
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
