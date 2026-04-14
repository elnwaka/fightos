/* ============================================
   FIGHTOS – Core Application Logic
   Auth, Navigation, Fight Date, HRV, Logs
   ============================================ */

// ===== MOBILE HELPER =====
function isMobile() { return window.innerWidth < 768; }

// ===== STATE =====
let currentUser = null;
let editingBlock = null;
var currentFightsTab = 'kaempfe';
var fightsListLimit = 20;
var activePrepId = null; // ID of prep being edited, null = overview

function animateValue(el, start, end, duration, suffix) {
  suffix = suffix || '';
  return new Promise(function(resolve) {
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (end - start) * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function safeParse(key, fallback) {
  var raw = localStorage.getItem(key);
  if (raw === null) return fallback !== undefined ? fallback : null;
  try { return JSON.parse(raw); }
  catch (e) {
    if (typeof showToast === 'function') showToast('Daten beschädigt – Standardwerte geladen', 'error', 4000);
    return fallback !== undefined ? fallback : null;
  }
}

function showToast(message, type, duration) {
  type = type || 'success';
  duration = duration || 2500;
  var container = document.getElementById('toast-container');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('out');
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

function showFieldError(inputEl, message) {
  if (!inputEl) return;
  inputEl.style.borderColor = 'var(--red)';
  inputEl.style.boxShadow = '0 0 0 3px rgba(232,0,13,.15)';
  showToast(message, 'error');
  setTimeout(function() {
    inputEl.style.borderColor = '';
    inputEl.style.boxShadow = '';
  }, 3000);
}

// Animated modal close
var _modalPreviousFocus = null;

function openModalFocus(modalEl) {
  if (!modalEl) return;
  _modalPreviousFocus = document.activeElement;
  setTimeout(function() {
    var first = modalEl.querySelector('input:not([type="hidden"]), textarea, select, button:not(.modal-close)');
    if (first) first.focus();
  }, 100);
}

function closeModal(modalEl) {
  if (!modalEl || !modalEl.classList.contains('active')) return;
  modalEl.classList.remove('active');
  modalEl.classList.add('closing');
  modalEl.removeAttribute('aria-modal');
  setTimeout(function() {
    modalEl.classList.remove('closing');
  }, 200);
  if (_modalPreviousFocus && typeof _modalPreviousFocus.focus === 'function') {
    setTimeout(function() { _modalPreviousFocus.focus(); _modalPreviousFocus = null; }, 220);
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(function(m) { closeModal(m); });
    document.querySelectorAll('.nav-hub.open').forEach(function(h) { h.classList.remove('open'); });
    var mm = document.getElementById('mobile-menu');
    if (mm && mm.classList.contains('open')) mm.classList.remove('open');
    return;
  }
  // Focus trap inside active modal
  if (e.key === 'Tab') {
    var activeModal = document.querySelector('.modal-overlay.active .modal');
    if (!activeModal) return;
    var focusable = activeModal.querySelectorAll('input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
});

// Backdrop click to close modals
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
    closeModal(e.target);
  }
});

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
  const users = safeParse('fos_users', {});
  const u = users[currentUser];
  const birthYear = u && u.birthYear ? parseInt(u.birthYear) : null;
  if (!birthYear) return null;
  return new Date().getFullYear() - birthYear;
}

// ===== AUTH =====
var APP_SALT = 'FightOS_v1_';

async function hashPassword(password, username) {
  var salted = APP_SALT + username.toLowerCase() + ':' + password;
  var encoded = new TextEncoder().encode(salted);
  var buffer = await crypto.subtle.digest('SHA-256', encoded);
  var arr = Array.from(new Uint8Array(buffer));
  return arr.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

function isHashed(pass) {
  return typeof pass === 'string' && pass.length === 64 && /^[0-9a-f]{64}$/.test(pass);
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (tab === 'login' ? i === 0 : i === 1));
  });
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('auth-msg').textContent = '';
}

async function doRegister() {
  const user = document.getElementById('reg-user').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const msg = document.getElementById('auth-msg');
  if (!user || !pass) { msg.className = 'auth-msg error'; msg.textContent = 'Alle Felder ausfüllen!'; return; }
  if (pass.length < 3) { msg.className = 'auth-msg error'; msg.textContent = 'Passwort zu kurz!'; return; }
  const users = safeParse('fos_users', {});
  if (users[user]) { msg.className = 'auth-msg error'; msg.textContent = 'Name bereits vergeben!'; return; }
  var hashed = await hashPassword(pass, user);
  users[user] = { pass: hashed, onboardingDone: false, created: new Date().toISOString() };
  localStorage.setItem('fos_users', JSON.stringify(users));
  const data = { fights: [], log: [], hrv: [], fightDate: '', upcomingFights: [], weekPlan: {} };
  localStorage.setItem('fos_data_' + user, JSON.stringify(data));
  msg.className = 'auth-msg success'; msg.textContent = 'Account erstellt! Logge dich ein.';
  switchAuthTab('login');
}

async function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const msg = document.getElementById('auth-msg');
  if (!user || !pass) { msg.className = 'auth-msg error'; msg.textContent = 'Alle Felder ausfüllen!'; return; }
  const users = safeParse('fos_users', {});
  if (!users[user]) { msg.className = 'auth-msg error'; msg.textContent = 'Falsche Daten!'; return; }
  var storedPass = users[user].pass;
  if (isHashed(storedPass)) {
    // Already hashed – compare hash
    var hashed = await hashPassword(pass, user);
    if (storedPass !== hashed) { msg.className = 'auth-msg error'; msg.textContent = 'Falsche Daten!'; return; }
  } else {
    // Legacy plaintext – compare then migrate
    if (storedPass !== pass) { msg.className = 'auth-msg error'; msg.textContent = 'Falsche Daten!'; return; }
    users[user].pass = await hashPassword(pass, user);
    localStorage.setItem('fos_users', JSON.stringify(users));
  }
  currentUser = user;
  localStorage.setItem('fos_current', user);
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
          <option value="">– Wählen –</option>${yOpts}
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
    sub: 'Gewicht und Größe – damit sich alles an dich anpasst.',
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
    sub: 'Ehrliche Selbsteinschätzung – hilft uns, realistische Ziele zu setzen.',
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
  const users = safeParse('fos_users', {});
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
    if (!data.upcomingFights) data.upcomingFights = [];
    if (obData.fightDate) {
      data.fightDate = obData.fightDate;
      data.upcomingFights = [{ date: obData.fightDate, label: '' }];
    }
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
  return currentUser || 'Boxer';
}

function enterApp() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  document.getElementById('user-pill').textContent = getDisplayName();
  // Prevent any input from stealing focus on load
  setTimeout(function() { document.activeElement && document.activeElement.blur(); }, 150);
  // Cleanup old completed blocks (keep current + last week) + build completion summary
  const data = getData();
  if (data && data.completedBlocks) {
    const weekId = getWeekId();
    const lastWeekId = getLastWeekId();
    // Build last-week completion summary BEFORE cleanup
    if (!data.lastWeekCompletion || data.lastWeekCompletion.weekId !== lastWeekId) {
      data.lastWeekCompletion = buildLastWeekCompletion(data, lastWeekId);
    }
    const cleaned = {};
    for (const [k, v] of Object.entries(data.completedBlocks)) {
      if (k.endsWith(weekId) || k.endsWith(lastWeekId)) cleaned[k] = v;
    }
    data.completedBlocks = cleaned;
    saveData(data);
  }
  // Init pages content
  if (typeof renderAllPages === 'function') renderAllPages();
  renderLogEntries();
  if (typeof updateQlogSaeulen === 'function') updateQlogSaeulen();

  // Show 8 Säulen intro on first visit
  var users = safeParse('fos_users', {});
  if (users[currentUser] && !users[currentUser].seenIntro) {
    showSaeulenIntro();
  } else {
    showPage(getPageFromHash());
  }
}

function showSaeulenIntro() {
  var el = document.getElementById('saeulen-intro');
  if (!el) { showPage(getPageFromHash()); return; }
  el.style.display = 'block';

  var scroller = document.getElementById('si-scroll');
  if (!scroller) return;

  var slides = document.querySelectorAll('.si-slide');
  var totalSlides = slides.length;

  // Alle Slides starten unsichtbar
  slides.forEach(function(s) {
    var children = s.querySelectorAll('.si-num,.si-title,.si-body,.si-why,.si-reason,.si-fade');
    children.forEach(function(c) {
      c.style.opacity = '0';
      c.style.transform = 'translateY(30px)';
      c.style.transition = 'opacity .7s ease, transform .7s ease';
    });
  });

  // Hero sofort animieren
  var heroFades = document.querySelectorAll('#si-0 .si-fade');
  heroFades.forEach(function(f, i) {
    setTimeout(function() {
      f.style.opacity = '1';
      f.style.transform = 'translateY(0)';
    }, 400 + i * 800);
  });

  // Fortschritts-Balken oben
  var progressBar = document.createElement('div');
  progressBar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:var(--red);z-index:10000;transition:width .3s ease;width:0%;';
  el.appendChild(progressBar);

  // Bounce-Pfeil unten
  var arrow = document.createElement('div');
  arrow.id = 'si-arrow';
  arrow.innerHTML = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke-linecap="round"><path d="M7 10l5 5 5-5" stroke="#fff" stroke-width="2.5"/></svg>';
  arrow.style.cssText = 'position:fixed;bottom:32px;left:50%;z-index:99999;cursor:pointer;padding:10px;border-radius:50%;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);opacity:0;';
  arrow.onclick = function() {
    var next = slides[1];
    if (next) next.scrollIntoView({ behavior: 'smooth' });
  };
  document.body.appendChild(arrow);
  // Nach 2s einblenden + bounce starten
  setTimeout(function() {
    arrow.style.transition = 'opacity .5s';
    arrow.style.opacity = '1';
    arrow.style.animation = 'siBounce 1.2s ease infinite';
  }, 2000);

  // Dot-Navigation rechts
  var dots = document.createElement('div');
  dots.style.cssText = 'position:fixed;right:20px;top:50%;transform:translateY(-50%);z-index:10000;display:flex;flex-direction:column;gap:8px;';
  var slideColors = ['#fff','#e8000d','#2979ff','#ab47bc','#4caf50','#ff6d00','#f5c518','#00bcd4','#8bc34a','#fff'];
  for (var di = 0; di < totalSlides; di++) {
    (function(i) {
      var dot = document.createElement('div');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:var(--surface-3);transition:all .3s;cursor:pointer;';
      dot.onclick = function() { slides[i].scrollIntoView({ behavior: 'smooth' }); };
      dot.setAttribute('data-si-dot', i);
      dots.appendChild(dot);
    })(di);
  }

  // IntersectionObserver – animiert Slides wenn sie sichtbar werden
  if (window.IntersectionObserver) {
    var animated = {};
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        var idx = Array.from(slides).indexOf(e.target);
        if (animated[idx]) return;
        animated[idx] = true;

        var children = e.target.querySelectorAll('.si-num,.si-title,.si-body,.si-why,.si-reason,.si-fade');
        children.forEach(function(c, ci) {
          setTimeout(function() {
            c.style.opacity = '1';
            c.style.transform = 'translateY(0)';
          }, ci * 200);
        });
      });
    }, { threshold: 0.3, root: scroller });
    slides.forEach(function(s) { obs.observe(s); });
  }

  document.body.appendChild(dots);

  // Aktuelle Slide tracken + UI updaten
  var currentDot = 0;
  function updateDots(idx) {
    if (idx === currentDot) return;
    currentDot = idx;
    dots.querySelectorAll('[data-si-dot]').forEach(function(d, i) {
      var color = slideColors[i] || '#555';
      if (i === idx) {
        d.style.background = color; d.style.width = '10px'; d.style.height = '10px'; d.style.boxShadow = '0 0 8px ' + color + '60';
      } else {
        d.style.background = 'var(--surface-3)'; d.style.width = '8px'; d.style.height = '8px'; d.style.boxShadow = 'none';
      }
    });
  }
  updateDots(0);

  // Scroll-Listener: Progress-Bar + Dots + Arrow ausblenden
  scroller.addEventListener('scroll', function() {
    var scrollTop = scroller.scrollTop;
    var scrollMax = scroller.scrollHeight - scroller.clientHeight;
    var pct = scrollMax > 0 ? Math.round(scrollTop / scrollMax * 100) : 0;
    progressBar.style.width = pct + '%';

    // Welche Slide ist aktiv?
    var activeIdx = 0;
    slides.forEach(function(s, i) {
      if (s.offsetTop <= scrollTop + scroller.clientHeight * 0.5) activeIdx = i;
    });
    updateDots(activeIdx);

    // Pfeil ausblenden nach erstem Scroll
    if (scrollTop > 50 && arrow.parentNode) {
      arrow.style.animation = 'none';
      arrow.style.opacity = '0';
      arrow.style.transition = 'opacity .3s';
      setTimeout(function() { if (arrow.parentNode) arrow.parentNode.removeChild(arrow); }, 300);
    }

    // Letzte Slide: Dots ausblenden
    if (activeIdx >= totalSlides - 1) {
      dots.style.opacity = '0';
    } else {
      dots.style.opacity = '1';
    }
  });
}

function closeIntro() {
  var el = document.getElementById('saeulen-intro');
  if (el) el.style.display = 'none';
  // Pfeil + Dots aufräumen
  var arrow = document.getElementById('si-arrow');
  if (arrow && arrow.parentNode) arrow.parentNode.removeChild(arrow);
  var dots = document.querySelectorAll('[data-si-dot]');
  if (dots.length && dots[0].parentNode && dots[0].parentNode.parentNode) {
    dots[0].parentNode.parentNode.removeChild(dots[0].parentNode);
  }
  var users = safeParse('fos_users', {});
  if (users[currentUser]) {
    users[currentUser].seenIntro = true;
    localStorage.setItem('fos_users', JSON.stringify(users));
  }
  showPage(getPageFromHash());
}

// NOTE: Auto-login + event listeners are in index.html init script
// (runs AFTER all JS files are loaded)

// ===== DATA HELPERS =====
function getData() {
  if (!currentUser) return null;
  var defaultData = { fights: [], log: [], hrv: [], fightDate: '', upcomingFights: [], weekPlan: getDefaultWeekPlan() };
  var parsed = safeParse('fos_data_' + currentUser, null);
  if (parsed) return parsed;
  var data = defaultData;
  localStorage.setItem('fos_data_' + currentUser, JSON.stringify(data));
  return data;
}

function saveData(data) {
  if (!currentUser) return;
  localStorage.setItem('fos_data_' + currentUser, JSON.stringify(data));
}

// ===== SCROLL REVEAL (Intersection Observer) =====
var _revealObserver = null;
function initRevealObserver() {
  if (_revealObserver || !window.IntersectionObserver) return;
  _revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        _revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
}

function applyRevealToPage() {
  if (!_revealObserver) initRevealObserver();
  if (!_revealObserver) return;
  // Apply to cards, stat bars, test cards etc.
  document.querySelectorAll('.page.active .card, .page.active .day-col, .page.active .tests-cluster, .page.active .dash-profil').forEach(function(el) {
    if (!el.classList.contains('reveal') && !el.classList.contains('visible')) {
      el.classList.add('reveal');
      _revealObserver.observe(el);
    }
  });
}

// ===== NAVIGATION + HASH ROUTING =====
var _skipHashUpdate = false;

function showPage(pageId) {
  // Clean up all pages first
  document.querySelectorAll('.page').forEach(function(p) {
    if (p.id !== 'page-' + pageId && p.classList.contains('active')) {
      p.classList.remove('active');
      p.classList.add('page-exit');
      setTimeout(function() { p.classList.remove('page-exit'); }, 150);
    } else if (p.id !== 'page-' + pageId) {
      p.classList.remove('active');
      p.classList.remove('page-exit');
    }
  });
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.nav-hub').forEach(h => h.classList.remove('active'));
  document.querySelectorAll('.nav-drop-item').forEach(d => d.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  let navPage = pageId;
  if (pageId === 'saeulen-detail') navPage = 'saeulen';
  if (pageId === 'uebung-detail') navPage = 'uebungen';
  if (pageId === 'supplement-detail') navPage = 'supplements';
  if (pageId === 'fight-detail') navPage = 'fights';
  if (pageId === 'block-detail') navPage = 'wochenplan';
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
  var heavyPages = ['dashboard', 'tests', 'fights', 'account'];
  if (heavyPages.indexOf(pageId) !== -1) {
    var target = document.getElementById('page-' + pageId);
    var inner = pageId === 'dashboard' ? document.getElementById('dash-app') : target;
    if (inner && !inner.querySelector('.skeleton')) {
      var skel = '<div style="padding:20px;">' +
        '<div class="skeleton skeleton-title"></div>' +
        '<div class="skeleton-row"><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div></div>' +
        '<div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text" style="width:60%;"></div>' +
        '</div>';
      inner.innerHTML = skel;
    }
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        if (pageId === 'dashboard') renderDashboard();
        else if (pageId === 'tests') renderTestsPage();
        else if (pageId === 'account') renderAccountPage();
        else if (pageId === 'fights') renderFightsPage();
      });
    });
  }
  if (pageId === 'wochenplan') renderWeekPlan();
  // Stop YouTube player when leaving fight-detail
  if (pageId !== 'fight-detail' && window._fightPlayer) {
    try { window._fightPlayer.pauseVideo(); } catch(e) {}
    try { window._fightPlayer.destroy(); } catch(e) {}
    window._fightPlayer = null;
  }
  window.scrollTo({ top: 0, behavior: window.scrollY > 200 ? 'smooth' : 'instant' });
  // Remove focus from any input to prevent blinking caret
  if (document.activeElement && document.activeElement.tagName !== 'BODY') {
    document.activeElement.blur();
  }
  // Bottom tab bar highlight
  document.querySelectorAll('.btab').forEach(function(b) { b.classList.remove('active'); });
  var btabPage = pageId;
  if (btabPage === 'dashboard') btabPage = 'dashboard';
  else if (['wochenplan','uebungen','log','periodisierung','uebung-detail','block-detail'].indexOf(btabPage) !== -1) btabPage = 'wochenplan';
  else if (['fights','fight-detail'].indexOf(btabPage) !== -1) btabPage = 'fights';
  else if (btabPage === 'tests') btabPage = 'tests';
  else btabPage = ''; // Keine der 4 Haupt-Tabs → keiner aktiv
  if (btabPage) {
    var activeTab = document.querySelector('.btab[data-page="' + btabPage + '"]');
    if (activeTab) activeTab.classList.add('active');
  }
  // Scroll reveal on new page
  setTimeout(applyRevealToPage, 100);
  // Update URL hash
  if (!_skipHashUpdate) {
    location.hash = pageId === 'dashboard' ? '' : pageId;
  }
}

function getPageFromHash() {
  var hash = location.hash.replace('#', '').replace(/^\//, '');
  if (!hash) return 'dashboard';
  var valid = ['dashboard','fights','fight-detail','wochenplan','block-detail','uebungen','uebung-detail','tests','log','periodisierung',
    'ernaehrung','cutten','supplements','supplement-detail','regeneration','saeulen','saeulen-detail','mental','rechner','faq','account'];
  return valid.indexOf(hash) !== -1 ? hash : 'dashboard';
}

window.addEventListener('hashchange', function() {
  if (!currentUser) return;
  _skipHashUpdate = true;
  showPage(getPageFromHash());
  _skipHashUpdate = false;
});

// ===== FIGHT DATE SYSTEM =====

// Sync data.fightDate to the nearest future date from upcomingFights
function syncPrimaryFightDate(data) {
  if (!data.upcomingFights) data.upcomingFights = [];
  // Remove past fights (more than 2 days ago) from upcomingFights
  const cutoff = new Date(); cutoff.setHours(0,0,0,0); cutoff.setDate(cutoff.getDate() - 2);
  data.upcomingFights = data.upcomingFights.filter(f => new Date(f.date + 'T00:00:00') >= cutoff);
  // Sort by date ascending
  data.upcomingFights.sort((a, b) => a.date.localeCompare(b.date));
  // Set primary to nearest
  if (data.upcomingFights.length > 0) {
    data.fightDate = data.upcomingFights[0].date;
  }
}

function updateFightDate() {
  const data = getData();
  if (!data) return;
  if (!data.upcomingFights) data.upcomingFights = [];
  const dateVal = document.getElementById('fight-date-input').value;
  // Reject dates more than 365 days in the future
  if (dateVal) {
    const diff = Math.ceil((new Date(dateVal + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000);
    if (diff > 365) {
      var inp = document.getElementById('fight-date-input');
      showFieldError(inp, 'Kampfdatum darf max. 365 Tage in der Zukunft liegen.');
      return;
    }
  }
  const oldPrimary = data.fightDate;
  data.fightDate = dateVal;
  // Also update or add in upcomingFights (replace first entry or add)
  if (dateVal) {
    const existing = data.upcomingFights.find(f => f.date === dateVal);
    if (!existing) {
      // If upcomingFights had a primary entry, replace it; otherwise add new
      const oldIdx = data.upcomingFights.findIndex(f => f.date === oldPrimary);
      if (oldIdx >= 0) {
        data.upcomingFights[oldIdx].date = dateVal;
      } else {
        data.upcomingFights.unshift({ date: dateVal, label: '' });
      }
    }
    syncPrimaryFightDate(data);
  } else {
    // Cleared the input – remove all upcoming fights
    data.upcomingFights = [];
    data.fightDate = '';
  }
  // Enforce max 5
  if (data.upcomingFights.length > 5) data.upcomingFights = data.upcomingFights.slice(0, 5);
  saveData(data); // Save first so generateSmartWeekPlan reads the new date
  data.weekPlan = generateSmartWeekPlan();
  saveData(data);
  showToast('Kampfdatum aktualisiert');
  renderFightCountdown();
  renderDashStats();
  renderHinweise();
  renderWeekPlan();
}

function addUpcomingFight() {
  const data = getData();
  if (!data) return;
  if (!data.upcomingFights) data.upcomingFights = [];
  if (data.upcomingFights.length >= 5) {
    showToast('Maximal 5 Kämpfe gleichzeitig möglich.', 'error');
    return;
  }
  const label = prompt('Bezeichnung (z.B. "Meisterschaft Tag 2"):', '') || '';
  const dateStr = prompt('Datum (YYYY-MM-DD):', '');
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    if (dateStr !== null) showToast('Ungültiges Datumsformat. Bitte YYYY-MM-DD verwenden.', 'error');
    return;
  }
  const diff = Math.ceil((new Date(dateStr + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff > 365) {
    showToast('Kampfdatum darf max. 365 Tage in der Zukunft liegen.', 'error');
    return;
  }
  // Avoid duplicate dates
  if (data.upcomingFights.find(f => f.date === dateStr)) {
    showToast('Dieses Datum ist bereits eingetragen.', 'error');
    return;
  }
  data.upcomingFights.push({ date: dateStr, label: label });
  syncPrimaryFightDate(data);
  // Enforce max 5
  if (data.upcomingFights.length > 5) data.upcomingFights = data.upcomingFights.slice(0, 5);
  saveData(data);
  data.weekPlan = generateSmartWeekPlan();
  saveData(data);
  renderFightCountdown();
  renderDashStats();
  renderHinweise();
  renderWeekPlan();
}

function removeUpcomingFight(dateStr) {
  if (!confirm('Diesen geplanten Kampf entfernen?')) return;
  const data = getData();
  if (!data) return;
  if (!data.upcomingFights) data.upcomingFights = [];
  data.upcomingFights = data.upcomingFights.filter(f => f.date !== dateStr);
  if (data.upcomingFights.length > 0) {
    syncPrimaryFightDate(data);
  } else {
    data.fightDate = '';
  }
  document.getElementById('fight-date-input').value = data.fightDate || '';
  saveData(data);
  data.weekPlan = generateSmartWeekPlan();
  saveData(data);
  renderFightCountdown();
  renderDashStats();
  renderHinweise();
  renderWeekPlan();
}

function clearFightDate() {
  if (!confirm('Kampfdatum löschen?')) return;
  const data = getData();
  if (!data) return;
  if (!data.upcomingFights) data.upcomingFights = [];
  if (data.upcomingFights.length > 1) {
    // Remove only the primary (first) fight, shift next to primary
    data.upcomingFights.shift();
    syncPrimaryFightDate(data);
    document.getElementById('fight-date-input').value = data.fightDate;
  } else {
    // Clear everything
    data.upcomingFights = [];
    data.fightDate = '';
    document.getElementById('fight-date-input').value = '';
  }
  saveData(data);
  data.weekPlan = generateSmartWeekPlan();
  saveData(data);
  renderFightCountdown();
  renderDashStats();
  renderHinweise();
  renderWeekPlan();
}

// Amateur Boxing: Kein wochenlanges Taper – nur kurze Anpassung vor Kampf
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
  if (!data.upcomingFights) data.upcomingFights = [];
  if (data.upcomingFights.length > 0) syncPrimaryFightDate(data);
  const display = document.getElementById('dash-countdown-hero');
  const input = document.getElementById('fight-date-input');
  if (input && data.fightDate) input.value = data.fightDate;

  const upcomingListHTML = buildUpcomingFightsHTML(data);
  const addBtnHTML = (data.upcomingFights.length < 5)
    ? '<div style="margin-top:10px;"><button onclick="addUpcomingFight()" style="background:none;border:1px dashed #888;color:#888;padding:4px 12px;border-radius:var(--radius-md);cursor:pointer;font-size:11px;font-family:\'Space Mono\',monospace;">+ Weiteren Kampf hinzuf\u00fcgen</button></div>'
    : '';

  if (!data.fightDate) {
    display.innerHTML = `
      <div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;letter-spacing:2px;">KEIN KAMPF GEPLANT</div>
      <div class="phase-badge phase-aufbau" style="margin-top:12px;">NORMALES TRAINING</div>
      <div style="font-size:12px;color:#666;margin-top:12px;">Kein Kampf geplant \u2014 trage ein Datum ein und dein kompletter Plan passt sich automatisch an.</div>` + addBtnHTML;
    return;
  }

  const fightDay = new Date(data.fightDate + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.ceil((fightDay - today) / 86400000);
  const phase = getFightPhase(diff);

  let mainHTML = '';
  if (diff < -2) {
    mainHTML = `
      <div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;">Letzter Kampf: ${formatDate(data.fightDate)}</div>
      <div class="phase-badge phase-aufbau" style="margin-top:12px;">NORMALES TRAINING</div>
      <div style="font-size:12px;color:#666;margin-top:12px;">Trage den nächsten Kampf ein wenn er feststeht.</div>`;
  } else if (diff < 0) {
    mainHTML = `
      <div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;">Kampf war am ${formatDate(data.fightDate)}</div>
      <div class="phase-badge phase-aufbau" style="margin-top:12px;">RECOVERY</div>
      <div style="font-size:12px;color:#666;margin-top:12px;">24–48h leichte Regeneration, dann zurück ins Training.</div>`;
  } else if (diff === 0) {
    mainHTML = `
      <div class="fight-countdown-num" style="color:var(--red);">HEUTE</div>
      <div class="fight-countdown-label">KAMPFTAG</div>
      <div class="phase-badge phase-kampf" style="margin-top:12px;">FIGHT DAY</div>`;
  } else if (diff === 1) {
    mainHTML = `
      <div class="fight-countdown-num" style="color:var(--gold);">MORGEN</div>
      <div class="fight-countdown-label">KAMPF · ${formatDate(data.fightDate)}</div>
      <div class="phase-badge phase-taper" style="margin-top:12px;">NUR LEICHT HEUTE</div>`;
  } else {
    mainHTML = `
      <div class="fight-countdown-num">${diff}</div>
      <div class="fight-countdown-label">TAGE BIS ZUM KAMPF · ${formatDate(data.fightDate)}</div>
      <div class="phase-badge ${phase.cls}" style="margin-top:12px;">${phase.name}</div>
      ${diff <= 4 ? '<div style="font-size:12px;color:#888;margin-top:8px;">Schärfungsphase: Training leicht anpassen, kein neues hartes Sparring mehr.</div>' : '<div style="font-size:12px;color:#666;margin-top:8px;">Normales Training. Erst 3–4 Tage vor Kampf leicht anpassen.</div>'}`;
  }

  display.innerHTML = mainHTML + upcomingListHTML + addBtnHTML;
}

function buildUpcomingFightsHTML(data) {
  if (!data.upcomingFights || data.upcomingFights.length <= 1) return '';
  const additional = data.upcomingFights.slice(1);
  if (additional.length === 0) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const rows = additional.map(function(f) {
    const d = Math.ceil((new Date(f.date + 'T00:00:00') - today) / 86400000);
    const daysLabel = d === 0 ? 'HEUTE' : d === 1 ? 'MORGEN' : d > 0 ? d + ' Tage' : 'vorbei';
    const labelStr = f.label ? (' \u00b7 ' + f.label) : '';
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">' +
      '<span style="font-family:\'Space Mono\',monospace;font-size:11px;color:#aaa;">' + formatDate(f.date) + labelStr + ' <span style="color:#888;">(' + daysLabel + ')</span></span>' +
      '<button onclick="removeUpcomingFight(\'' + f.date + '\')" style="background:none;border:none;color:#888;cursor:pointer;font-size:13px;padding:2px 6px;" title="Kampf entfernen">&times;</button>' +
    '</div>';
  }).join('');
  return '<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;">' +
    '<div style="font-family:\'Space Mono\',monospace;font-size:12px;color:#666;letter-spacing:1.5px;margin-bottom:6px;">WEITERE K\u00c4MPFE</div>' +
    rows +
  '</div>';
}

// ===== DASHBOARD STATS – MEASURABLE PERFORMANCE PROFILE =====

// 3 radar axes – only real, testable performance dimensions
// 8 SÄULEN = 8 RADAR-ACHSEN (das Fundament der App)
const RADAR_AXES = [
  { key:'kraft',    label:'KRAFT',        color:'var(--red)',    hex:'#e8000d', saeulenIdx:0 },
  { key:'metabol',  label:'AUSDAUER',     color:'var(--blue)',   hex:'#2979ff', saeulenIdx:1 },
  { key:'kognitiv', label:'KOGNITION',    color:'var(--purple)', hex:'#ab47bc', saeulenIdx:2 },
  { key:'ernaehr',  label:'ERNÄHRUNG',    color:'var(--green)',  hex:'#4caf50', saeulenIdx:3 },
  { key:'recovery', label:'REGENERATION', color:'var(--orange)', hex:'#ff6d00', saeulenIdx:4 },
  { key:'ringiQ',   label:'RING IQ',      color:'var(--gold)',   hex:'#f5c518', saeulenIdx:5 },
  { key:'psyche',   label:'MENTAL',       color:'#00bcd4',       hex:'#00bcd4', saeulenIdx:6 },
  { key:'mobil',    label:'MOBILITÄT',    color:'#8bc34a',       hex:'#8bc34a', saeulenIdx:7 }
];

function calcProfileScores(data) {
  const b = data.benchmarks || {};
  const s = getUserSchedule();
  const bw = parseFloat(s.weight) || 75;
  const age = getUserAge() || 25;
  const bfTarget = age < 25 ? 8 : age <= 35 ? 10 : 12;
  const log = data.log || [];
  const fights = data.fights || [];
  const hrv = data.hrv || [];
  const sr = data.saeulenRatings || {};

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
  function ratingPct(key) {
    return sr[key] ? Math.round(sr[key] * 20) : null; // 1-5 → 20-100%
  }

  // S1: KRAFT – Benchmarks (Deadlift, Klimmzüge, CMJ, Schlagfrequenz)
  const kraft = avg([
    pct(b.deadlift, bw * 2.5),
    pct(b.pullups, scaleByWeight(bw, PULLUP_TIERS)),
    pct(b.cmj, scaleByWeight(bw, CMJ_TIERS)),
    pct(b.punch_freq, scaleByWeight(bw, PUNCH_TIERS))
  ]);

  // S2: METABOLISCH – Cooper-Test + Selbsteinschätzung
  const metabol = avg([
    pct(b.cooper, scaleByWeight(bw, COOPER_TIERS)),
    ratingPct('metabol')
  ]);

  // S3: KOGNITION – Selbsteinschätzung (Reaktion, Antizipation, Entscheidung)
  const kognitiv = ratingPct('kognitiv');

  // S4: ERNÄHRUNG – Bodyfat + Selbsteinschätzung
  const ernaehr = avg([
    inversePct(b.bodyfat, bfTarget),
    ratingPct('ernaehr')
  ]);

  // S5: REGENERATION – HRV-Daten + Selbsteinschätzung
  var recoveryScore = null;
  if (hrv.length >= 7) {
    var recent = hrv.slice(0, 7);
    var avg7 = recent.reduce(function(s, h) { return s + h.value; }, 0) / recent.length;
    var greenDays = 0;
    recent.forEach(function(h) { if (h.value >= avg7 * 0.95) greenDays++; });
    recoveryScore = Math.round(greenDays / 7 * 100);
  }
  const recovery = avg([recoveryScore, ratingPct('recovery')]);

  // S6: RING IQ – Kampferfahrung + Selbsteinschätzung
  var fightIQ = null;
  if (fights.length >= 3) {
    var wins = fights.filter(function(f) { return f.result === 'S'; }).length;
    fightIQ = Math.round(wins / fights.length * 100);
  }
  const ringiQ = avg([fightIQ, ratingPct('ringiQ')]);

  // S7: PSYCHE – Selbsteinschätzung
  const psyche = ratingPct('psyche');

  // S8: MOBILITÄT – Selbsteinschätzung + Mobility-Training-Häufigkeit
  var mobilLog = null;
  var last30 = log.filter(function(e) {
    var d = new Date(e.date);
    return (Date.now() - d.getTime()) < 30 * 86400000;
  });
  if (last30.length >= 4) {
    var mobilCount = last30.filter(function(e) { return e.type === 'mobility'; }).length;
    // 8+ Mobility-Sessions im Monat = 100% (ca. 2x/Woche)
    mobilLog = Math.min(100, Math.round(mobilCount / 8 * 100));
  }
  const mobil = avg([mobilLog, ratingPct('mobil')]);

  return { kraft, metabol, kognitiv, ernaehr, recovery, ringiQ, psyche, mobil };
}

function renderDashStats() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('dash-stats');

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
  const subEl = null; // rpg-subtitle removed from dashboard
  if (subEl) {
    let phase = 'AUFBAU';
    if (data.fightDate) {
      const diff = Math.ceil((new Date(data.fightDate + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000);
      phase = getFightPhase(diff).label.toUpperCase();
    }
    subEl.textContent = `${wins}-${losses}  ·  ${phase}`;
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
              <span class="rpg-stat-value" style="color:${hasVal ? a.color : '#333'};">${hasVal ? val : '–'}</span>
            </div>
            <div class="rpg-stat-bar">
              <div class="rpg-stat-fill" style="width:${hasVal ? val : 0}%;background:${a.color};"></div>
            </div>
          </div>
        </div>`;
      }).join('')}
      <div class="rpg-stat" style="margin-top:6px;padding-top:10px;border-top:1px solid var(--surface-3);">
        <div class="rpg-stat-info">
          <div class="rpg-stat-top">
            <span class="rpg-stat-label">GESAMT</span>
            <span class="rpg-stat-value" style="color:var(--gold);font-size:24px;">${overall !== null ? overall : '–'}<span style="font-size:12px;color:#444;"> / 100</span></span>
          </div>
          <div class="rpg-stat-bar">
            <div class="rpg-stat-fill" style="width:${overall || 0}%;background:linear-gradient(90deg,var(--red),var(--gold));"></div>
          </div>
        </div>
      </div>
      ${(function() {
        var weakKey = null, weakVal = 999;
        RADAR_AXES.forEach(function(a) {
          if (scores[a.key] !== null && scores[a.key] < weakVal) { weakVal = scores[a.key]; weakKey = a.key; }
        });
        if (!weakKey || weakVal >= 70) return '';
        var weakAxis = RADAR_AXES.find(function(a) { return a.key === weakKey; });
        return '<div style="margin-top:8px;padding:8px 10px;background:' + weakAxis.hex + '11;border:1px solid ' + weakAxis.hex + '33;border-radius:var(--radius-sm);">' +
          '<div style="font-family:\'Space Mono\',monospace;font-size:9px;color:' + weakAxis.hex + ';letter-spacing:1px;">FOKUS: ' + weakAxis.label + ' (' + weakVal + '%)</div>' +
        '</div>';
      })()}
    </div>`;

  renderRadarChart(scores);
}

var _radarChart = null;
function getChartTheme() {
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return {
    label: isLight ? '#333' : '#777',
    tick: isLight ? '#999' : '#555',
    grid: isLight ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.06)',
    pointBorder: isLight ? '#333' : '#fff',
    backdrop: isLight ? 'transparent' : 'transparent'
  };
}

var _lastRadarScores = null;

function renderRadarChart(canvasOrScores, scoresArg) {
  var canvas, scores;
  if (canvasOrScores instanceof HTMLCanvasElement) {
    canvas = canvasOrScores;
    scores = scoresArg;
  } else {
    canvas = document.getElementById('rpg-radar');
    scores = canvasOrScores;
  }
  if (!canvas || typeof Chart === 'undefined') return;

  if (scores) _lastRadarScores = scores;
  else if (_lastRadarScores) scores = _lastRadarScores;
  else return;

  var keys = RADAR_AXES.map(function(a) { return a.key; });
  var labels = RADAR_AXES.map(function(a) { return a.label; });
  var values = keys.map(function(k) { return scores[k] || 0; });
  var colors = RADAR_AXES.map(function(a) { return a.hex; });
  var theme = getChartTheme();
  var isMob = window.innerWidth < 480;

  // Destroy old chart
  if (_radarChart) { _radarChart.destroy(); _radarChart = null; }

  // Radial gradient fill
  var ctx = canvas.getContext('2d');
  var cx = canvas.width / 2;
  var cy = canvas.height / 2;
  var r = Math.min(cx, cy) * 0.6;
  var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  gradient.addColorStop(0, 'rgba(232,0,13,.25)');
  gradient.addColorStop(1, 'rgba(232,0,13,.02)');

  // Ghost layer (last week's scores)
  var datasets = [{
    label: 'Aktuell',
    data: values,
    backgroundColor: gradient,
    borderColor: 'rgba(232,0,13,.7)',
    borderWidth: 2,
    pointBackgroundColor: colors,
    pointBorderColor: theme.pointBorder,
    pointBorderWidth: 1.5,
    pointRadius: 4,
    pointHoverRadius: 6
  }];

  // Add ghost dataset if weekly snapshot exists
  var data = typeof getData === 'function' ? getData() : null;
  if (data && data.weeklySnapshots && data.weeklySnapshots.length >= 1) {
    var snap = data.weeklySnapshots[0];
    if (snap.overallScore !== null && snap.overallScore !== undefined) {
      // Use snapshot scores or estimate from overall
      var ghostValues = keys.map(function() { return snap.overallScore || 0; });
      datasets.push({
        label: 'Letzte Woche',
        data: ghostValues,
        backgroundColor: 'transparent',
        borderColor: 'rgba(255,255,255,.12)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        pointHoverRadius: 3
      });
    }
  }

  _radarChart = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        duration: 1200,
        easing: 'easeOutQuart',
        delay: 500
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,.85)',
          titleFont: { family: "'Space Mono', monospace", size: 11 },
          bodyFont: { family: "'Bebas Neue', sans-serif", size: 18 },
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(ctx) { return ctx.dataset.label + ': ' + ctx.raw + '/100'; }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: theme.tick,
            font: { family: "'Space Mono', monospace", size: 9 },
            backdropColor: 'transparent'
          },
          grid: {
            color: 'rgba(255,255,255,.04)'
          },
          angleLines: {
            color: 'rgba(255,255,255,.08)'
          },
          pointLabels: {
            color: colors,
            font: { family: "'Space Mono', monospace", size: isMob ? 10 : 12, weight: '700' }
          }
        }
      }
    }
  });
}

// ===== HRV =====
function logHRV() {
  const val = parseInt(document.getElementById('hrv-input').value);
  if (!val || isNaN(val) || val < 1 || val > 200) {
    if (val !== undefined && val !== null && !isNaN(val) && (val < 1 || val > 200)) {
      var inp = document.getElementById('hrv-input');
      showFieldError(inp, 'HRV-Wert muss zwischen 1 und 200 liegen.');
    }
    return;
  }
  const data = getData();
  if (!data) return;
  if (!data.hrv) data.hrv = [];
  data.hrv.unshift({ date: new Date().toISOString().split('T')[0], value: val });
  if (data.hrv.length > 90) data.hrv.pop();
  saveData(data);
  showToast('HRV eingetragen');
  document.getElementById('hrv-input').value = '';
  document.getElementById('hrv-input').placeholder = '\u2713 ' + val;
  setTimeout(function() {
    var inp = document.getElementById('hrv-input');
    if (inp && inp.placeholder.indexOf('\u2713') === 0) inp.placeholder = 'RMSSD';
  }, 2000);
  renderHRV();
}

function renderHRV() {
  const data = getData();
  if (!data || !data.hrv || !data.hrv.length) {
    document.getElementById('hrv-display').innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#444;padding:8px 0;">Noch keine Daten. RMSSD findest du in deiner Pulsuhr-App (Garmin, Whoop, Polar). Hoher Wert = erholt, niedriger Wert = muede. Trage ihn morgens ein.</div>';
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
      items.push({ text:'Kampf vorbei – zurück zum normalen Training.', color:'var(--green)', priority:1 });
    } else if (diff < 0) {
      items.push({ text:'Recovery-Phase: Leichte Bewegung, viel Protein, 9+ Stunden Schlaf.', color:'var(--green)', priority:2 });
    } else if (diff === 0) {
      items.push({ text:'KAMPFTAG! PAPE Warm-up 45 Min. vor Ring. Rote Beete Shot 2–3h vorher. Box-Breathing 4-4-4-4.', color:'var(--red)', priority:5 });
    } else if (diff === 1) {
      items.push({ text:'Morgen Kampf – heute NUR leicht! Shadow Boxing + Visualisierung. Equipment packen.', color:'var(--red)', priority:5 });
    } else if (diff <= 3) {
      items.push({ text:`Kampf in ${diff} Tagen – Schärfungsphase. Kein neues Sparring, Gameplan-Pratzen schleifen.`, color:'var(--gold)', priority:4 });
    } else if (diff <= 7) {
      items.push({ text:`Kampf in ${diff} Tagen – normales Training. Hartes Sparring bis 3 Tage vor Kampf OK.`, color:'var(--blue)', priority:2 });
    } else {
      items.push({ text:`Kampf in ${diff} Tagen – volle Intensität. Kraft + Sparring + Kondition pushen.`, color:'var(--blue)', priority:1 });
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
        items.push({ text:`${cfg.name} – letzter Test vor ${daysSince} Tagen. Neuer Test fällig.`, color:'var(--red)', priority:2 });
      } else if (dueIn <= 7) {
        items.push({ text:`${cfg.name} – nächster Test in ${dueIn} Tagen.`, color:'var(--gold)', priority:0 });
      }
    }
  }
  if (neverCount > 0) {
    items.push({ text:`${neverCount} Tests noch nie durchgeführt – gehe zur Test-Seite.`, color:'var(--blue)', priority:1 });
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
      items.push({ text:`Letzte Einheit vor ${daysSinceLog} Tagen – alles OK?`, color:'var(--gold)', priority:0 });
    }
  }

  // --- Schwächste Säule ---
  var scores = calcProfileScores(data);
  var saeulenNames = { kraft:'Kraft', metabol:'Ausdauer', kognitiv:'Kognition', ernaehr:'Ernährung', recovery:'Regeneration', ringiQ:'Ring IQ', psyche:'Mental', mobil:'Mobilität' };
  var saeulenTipps = {
    kraft: 'Fokus auf S&C: Deadlift, Klimmzüge, explosive Übungen.',
    metabol: 'Mehr Zone 2 Cardio + HIIT einbauen.',
    kognitiv: 'Constraint-Sparring, Reaktionsdrills, Schattenboxen mit Fokus auf Antizipation.',
    ernaehr: 'Makros tracken, Protein auf 2.2g/kg, Mahlzeiten-Timing einhalten.',
    recovery: 'Schlaf optimieren (8h+), HRV tracken, Regeneration ernst nehmen.',
    ringiQ: 'Kampfvideos analysieren, Muster erkennen, taktisches Sparring.',
    psyche: 'Visualisierung üben, Alter Ego aktivieren, Box-Breathing.',
    mobil: 'Tägliche Mobility-Routine: Hüfte, Schulter, T-Spine.'
  };
  var weakest = null, weakestVal = 999;
  for (var sk in scores) {
    if (scores[sk] !== null && scores[sk] < weakestVal) { weakestVal = scores[sk]; weakest = sk; }
  }
  if (weakest && weakestVal < 70) {
    items.push({ text: 'Schwächste Säule: ' + saeulenNames[weakest] + ' (' + weakestVal + '%) – ' + saeulenTipps[weakest], color: 'var(--red)', priority: 3 });
  }

  items.sort((a, b) => b.priority - a.priority);

  // --- Getting Started guide for new users ---
  const gsUsers = safeParse('fos_users', {});
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
        + '<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;border:1.5px solid ' + circleColor + ';font-size:12px;color:var(--green);flex-shrink:0;">' + checkMark + '</span>'
        + '<span style="font-family:\'Space Mono\',monospace;font-size:12px;color:' + textColor + ';line-height:1.4;' + strikeStyle + '">' + st.text + '</span>'
        + '</div>';
    }
    gettingStartedHtml = `
      <div style="margin-bottom:16px;padding:14px 16px;border-radius:var(--radius-md);background:rgba(255,255,255,.03);border:1px solid rgba(245,197,24,.15);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--gold);letter-spacing:1px;">DEIN ERSTER SCHRITT</span>
          <span style="font-family:'Space Mono',monospace;font-size:11px;color:var(--gold);">${completedSteps}/4 erledigt</span>
        </div>
        <div style="width:100%;height:4px;background:rgba(255,255,255,.06);border-radius:var(--radius-sm);margin-bottom:12px;">
          <div style="width:${gsPct}%;height:100%;background:var(--gold);border-radius:var(--radius-sm);transition:width .3s;"></div>
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
    // LEISTUNGSTESTS – fließen ins Radar
    { id:'deadlift', name:'Deadlift 1RM', unit:'kg', target:Math.round(bw * 2.5), color:'var(--red)', cluster:'Kraft',
      how:'Trap Bar oder Langhantel · 1RM-Test mit Aufwärmprotokoll',
      howSteps:[
        {t:'Aufwärmen', d:'10 Min. leichtes Cardio + dynamisches Stretching (Hüftkreise, Beinpendel, Katzenbuckel).'},
        {t:'Aufwärmsätze', d:'2×10 mit leerem Bar → 1×5 bei 50% → 1×3 bei 70% → 1×2 bei 80% → 1×1 bei 90%. Zwischen den Sätzen 2-3 Min. Pause.'},
        {t:'1RM-Versuche', d:'Steigere in 2,5-5 kg Schritten. Max. 3 Versuche. 3-5 Min. Pause zwischen Versuchen.'},
        {t:'Ausführung', d:'Trap Bar: neutraler Griff, Hüfte auf Kniehöhe, Brust raus, Rücken gerade. Hebe explosiv. Konventionell: schulterbreiter Stand, Mixed Grip erlaubt.'},
        {t:'Gültig wenn', d:'Volle Hüftstreckung oben, kontrolliertes Ablassen. Kein Abprallen, kein Hitching (Hochziehen am Oberschenkel). Partner sollte zuschauen.'}
      ], interval:10 },
    { id:'pullups', name:'Klimmzüge (max)', unit:'Wdh.', target:scaleByWeight(bw, PULLUP_TIERS), color:'var(--red)', cluster:'Kraft',
      how:'Saubere Wdh. bis Versagen · Kinn über Stange',
      howSteps:[
        {t:'Startposition', d:'Schulterbreiter Obergriff (Handflächen weg). Arme komplett gestreckt, Füße vom Boden, kein Schwung.'},
        {t:'Aufwärmen', d:'2-3 leichte Sätze à 3-5 Wdh. mit 2 Min. Pause. Dann 3 Min. Pause vor dem Testversuch.'},
        {t:'Ausführung', d:'Ziehe dich hoch bis Kinn ÜBER die Stange kommt. Lass dich kontrolliert herunter bis Arme VOLL gestreckt. Kein Kipping, kein Schwingen.'},
        {t:'Zählung', d:'Nur saubere Wdh. zählen. Sobald du die Stange nicht mehr erreichst oder die Form bricht → Stopp. Partner zählt laut mit.'},
        {t:'Tipp', d:'Kreide an den Händen verhindert Abrutschen. Teste immer zur gleichen Tageszeit und ausgeruht (nicht nach dem Training).'}
      ], interval:6 },
    { id:'cmj', name:'CMJ Sprunghöhe', unit:'cm', target:scaleByWeight(bw, CMJ_TIERS), color:'var(--red)', cluster:'Kraft',
      how:'Counter Movement Jump · MyJump App oder Kreidemarkierung',
      howSteps:[
        {t:'Methode A – MyJump App', d:'Smartphone am Boden aufstellen, App starten. Springe barfuß auf hartem Boden. Die App berechnet die Flugzeit → Sprunghöhe. 3 Versuche, bester zählt.'},
        {t:'Methode B – Kreide/Wand', d:'Stelle dich seitlich an eine Wand. Arm hoch strecken → Markierung 1. Dann aus dem Stand springen und am höchsten Punkt markieren → Markierung 2. Differenz = Sprunghöhe.'},
        {t:'Ausführung', d:'Stehe aufrecht, Füße schulterbreit. Gehe schnell in die Hocke (Knie ~90°), schwinge die Arme nach vorne-oben und springe MAXIMAL. Lande auf beiden Füßen.'},
        {t:'Regeln', d:'Kein Anlauf, kein Zwischenschritt. Die Gegenbewegung (Counter Movement) ist erlaubt und gewollt – das unterscheidet den CMJ vom Squat Jump.'},
        {t:'Tipp', d:'3-5 Min. dynamisches Aufwärmen + 2-3 Probesprünge bei 80%. Dann 3 maximale Versuche mit je 2 Min. Pause. Bester Wert zählt.'}
      ], interval:8 },
    { id:'punch_freq', name:'Schlagfrequenz 10s', unit:'Schläge', target:scaleByWeight(bw, PUNCH_TIERS), color:'var(--red)', cluster:'Kraft',
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
        {t:'Ausführung', d:'Auf "START" läufst du 12 Minuten so weit wie möglich. Gleichmäßiges Tempo ist der Schlüssel – starte NICHT zu schnell! Die letzten 2 Min. kannst du anziehen.'},
        {t:'Pacing-Strategie', d:'Für 3500m brauchst du ~3:26 min/km. Laufe die ersten 3 Runden (1200m) in ~4:08. Steigere dann. Zähle jede 400m-Runde mit.'},
        {t:'Messung', d:'Nach 12 Min. pfeift der Partner. Bleib stehen wo du bist. Miss die zurückgelegte Distanz auf 10m genau (Markierungen auf der Bahn nutzen). VO₂max ≈ (Distanz − 504) ÷ 44.7.'}
      ], interval:8 },
    // KÖRPERMESSUNGEN
    { id:'bodyfat', name:'Körperfettanteil', unit:'%', target:bfTarget, color:'var(--green)', cluster:'Ernährung', inverse:true,
      how:'Caliper 7-Falten, Navy-Methode oder DEXA',
      howSteps:[
        {t:'Methode A – Caliper (genaueste tragbare)', d:'7-Punkt-Messung: Brust, Achsel, Trizeps, Subscapular, Bauch, Hüfte, Oberschenkel. Jede Falte 3× messen, Median nehmen. Immer rechte Seite.'},
        {t:'Caliper-Technik', d:'Falte mit Daumen + Zeigefinger greifen (2cm vom Messpunkt). Caliper 1cm unterhalb ansetzen. 2 Sek. warten, dann ablesen. In Jackson-Pollock-Formel eingeben.'},
        {t:'Methode B – Navy-Methode (einfachste)', d:'Miss mit Maßband: Bauchumfang (Nabel), Halsumfang (schmalste Stelle). Formel: 86.010 × log10(Bauch − Hals) − 70.041 × log10(Größe) + 36.76.'},
        {t:'Methode C – DEXA-Scan (Goldstandard)', d:'Termin bei Sportmediziner oder Uni-Institut. Kosten: ca. 50-100€. Dauert 10 Min. Gibt dir exakte Fett-, Muskel- und Knochenmasse.'},
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

  const clusters = ['Kraft', 'Ausdauer', 'Ernährung'];
  const clusterColors = { Kraft:'var(--red)', Ausdauer:'var(--blue)', 'Ernährung':'var(--green)' };

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
                <div class="bench-current">${val || '–'}</div>
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
    cmj: `Counter Movement Jump – MyJump App oder Kreidemarkierung. Für ${bw}kg Nationalkader: ${scaleByWeight(bw, CMJ_TIERS)}cm. Korreliert direkt mit Schlagkraft.`,
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

    // Build body – collect all siblings until next section header
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

function saveBatchBenchmarks() {
  var BENCHMARKS = getBenchmarks();
  var count = 0;
  BENCHMARKS.forEach(function(b) {
    var el = document.getElementById('batch-' + b.id);
    if (el && el.value && parseFloat(el.value) > 0) {
      updateBenchmark(b.id, el.value);
      count++;
    }
  });
  var confirm = document.getElementById('batch-confirm');
  if (confirm) {
    confirm.textContent = '\u2713 ' + count + ' Tests gespeichert';
    confirm.style.display = 'inline';
    setTimeout(function() { confirm.style.display = 'none'; }, 3000);
  }
}

// ===== SPARKLINE CANVAS =====
function drawSparkline(canvasId, history, color, inverse) {
  var canvas = document.getElementById(canvasId);
  if (!canvas || !history || history.length < 2) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  var vals = history.map(function(e) { return e.value; });
  var min = Math.min.apply(null, vals);
  var max = Math.max.apply(null, vals);
  var range = max - min || 1;
  var pad = range * 0.1;
  min -= pad; max += pad; range = max - min;

  ctx.clearRect(0, 0, w, h);

  // Trend: vergleiche erstes und letztes Drittel
  var firstThird = vals.slice(0, Math.ceil(vals.length / 3));
  var lastThird = vals.slice(-Math.ceil(vals.length / 3));
  var firstAvg = firstThird.reduce(function(a,b){return a+b;},0) / firstThird.length;
  var lastAvg = lastThird.reduce(function(a,b){return a+b;},0) / lastThird.length;
  var improving = inverse ? lastAvg < firstAvg : lastAvg > firstAvg;

  // Gradient fill
  var grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '25');
  grad.addColorStop(1, color + '05');

  // Line
  ctx.beginPath();
  for (var i = 0; i < vals.length; i++) {
    var x = (i / (vals.length - 1)) * w;
    var y = h - ((vals[i] - min) / range) * h;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Fill under line
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Last point highlight
  var lastX = w;
  var lastY = h - ((vals[vals.length - 1] - min) / range) * h;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Best value dot (gold)
  var bestIdx = inverse ? vals.indexOf(Math.min.apply(null, vals)) : vals.indexOf(Math.max.apply(null, vals));
  if (bestIdx !== vals.length - 1) {
    var bestX = (bestIdx / (vals.length - 1)) * w;
    var bestY = h - ((vals[bestIdx] - min) / range) * h;
    ctx.beginPath();
    ctx.arc(bestX, bestY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f5c518';
    ctx.fill();
  }

  return improving;
}

function getBenchTrend(history, inverse) {
  if (!history || history.length < 2) return { arrow: '', color: '#555', improving: false };
  var first = history[0].value;
  var last = history[history.length - 1].value;
  var diff = last - first;
  var improving = inverse ? diff < 0 : diff > 0;
  var arrow = improving ? '\u2191' : diff === 0 ? '\u2192' : '\u2193';
  var color = improving ? 'var(--green)' : diff === 0 ? '#555' : 'var(--red)';
  return { arrow: arrow, color: color, improving: improving, diff: Math.abs(diff) };
}

function updateBenchmark(id, val) {
  const data = getData();
  if (!data) return;
  if (!data.benchmarks) data.benchmarks = {};
  if (!data.benchmarkHistory) data.benchmarkHistory = {};
  const numVal = parseFloat(val) || 0;

  // Input validation – reject negative and unreasonably high values
  var benchInput = document.querySelector('.bench-input[onchange*="' + id + '"]');
  if (numVal < 0) { showFieldError(benchInput, 'Ungültiger Wert'); return; }
  const benchLimits = { deadlift: 500, pullups: 50, cmj: 100, punch_freq: 150, cooper: 5000, bodyfat: 40 };
  const benchMins = { bodyfat: 3 };
  if (benchLimits[id] !== undefined && numVal > benchLimits[id]) { showFieldError(benchInput, 'Ungültiger Wert'); return; }
  if (benchMins[id] !== undefined && numVal > 0 && numVal < benchMins[id]) { showFieldError(benchInput, 'Ungültiger Wert'); return; }

  const oldVal = data.benchmarks[id] || 0;
  data.benchmarks[id] = numVal;
  // Track history – only log if value actually changed
  if (numVal !== oldVal && numVal > 0) {
    if (!data.benchmarkHistory[id]) data.benchmarkHistory[id] = [];
    var today = new Date().toISOString().split('T')[0];
    // Duplikat am gleichen Tag → überschreiben
    var existingIdx = data.benchmarkHistory[id].findIndex(function(h) { return h.date === today; });
    if (existingIdx >= 0) {
      data.benchmarkHistory[id][existingIdx].value = numVal;
    } else {
      data.benchmarkHistory[id].push({ date: today, value: numVal });
    }
    if (data.benchmarkHistory[id].length > 50) data.benchmarkHistory[id] = data.benchmarkHistory[id].slice(-50);
  }
  saveData(data);
  showToast('Benchmark aktualisiert');
  // Re-render dashboard stats + radar so changes reflect immediately
  renderDashStats();
  renderRadarChart(calcProfileScores(data));
  renderTestsPage();
}

// ===== FIGHT LOG =====
function openFightModal() {
  var modal = document.getElementById('fight-modal');
  modal.classList.add('active');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  openModalFocus(modal);
  document.getElementById('fight-log-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('fight-log-opponent').value = '';
  // Reset extra fields
  ['fight-log-round1','fight-log-round2','fight-log-round3','fight-log-video','fight-log-weaknesses','fight-log-good','fight-log-improve'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  // Details zugeklappt starten
  var toggle = document.getElementById('fight-extra-toggle');
  if (toggle) toggle.style.display = 'none';
  // Gegner-Feld fokussieren
  setTimeout(function() {
    var opp = document.getElementById('fight-log-opponent');
    if (opp) opp.focus();
  }, 200);
}
function closeFightModal() { closeModal(document.getElementById('fight-modal')); }

function addFightLog() {
  const data = getData();
  if (!data) return;
  if (!data.fights) data.fights = [];
  var r1 = document.getElementById('fight-log-round1') ? document.getElementById('fight-log-round1').value.trim() : '';
  var r2 = document.getElementById('fight-log-round2') ? document.getElementById('fight-log-round2').value.trim() : '';
  var r3 = document.getElementById('fight-log-round3') ? document.getElementById('fight-log-round3').value.trim() : '';
  var vidLink = document.getElementById('fight-log-video') ? document.getElementById('fight-log-video').value.trim() : '';
  var weakn = document.getElementById('fight-log-weaknesses') ? document.getElementById('fight-log-weaknesses').value.trim() : '';
  data.fights.unshift({
    date: document.getElementById('fight-log-date').value,
    opponent: document.getElementById('fight-log-opponent').value || 'Unbekannt',
    result: document.getElementById('fight-log-result').value,
    method: document.getElementById('fight-log-method').value,
    style: document.getElementById('fight-log-style').value,
    type: document.getElementById('fight-log-type').value,
    good: document.getElementById('fight-log-good').value,
    improve: document.getElementById('fight-log-improve').value,
    rounds: [
      { round: 1, notes: r1 },
      { round: 2, notes: r2 },
      { round: 3, notes: r3 }
    ],
    videoLink: vidLink,
    opponentWeaknesses: weakn
  });
  saveData(data);
  showToast('Kampf gespeichert');
  closeFightModal();
  renderFightLog();
  renderDashStats();
  // Navigate to the new fight's detail page
  if (typeof renderFightsPage === 'function') renderFightsPage();
  openFightDetail(0);
}

function toggleFightRounds(idx) {
  var el = document.getElementById('fight-rounds-' + idx);
  if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
}

function renderFightLog() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('fight-log-list');
  if (!el) return;
  if (!data.fights || !data.fights.length) {
    el.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#444;padding:8px 0;">Noch keine Kämpfe. <span style="color:var(--red);cursor:pointer;" onclick="openFightModal()">Ersten Kampf eintragen →</span></div>';
    return;
  }
  // Show last 5 fights as compact clickable list
  el.innerHTML = data.fights.slice(0, 5).map((f, i) => {
    const color = f.result === 'S' ? 'var(--green)' : f.result === 'N' ? 'var(--red)' : 'var(--gold)';
    return `<div onclick="openFightDetail(${i})" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--surface-1);cursor:pointer;" onmouseenter="this.style.background='rgba(255,255,255,.02)'" onmouseleave="this.style.background='transparent'">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${color};width:28px;text-align:center;">${f.result}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;color:var(--white);">vs. ${escapeHTML(f.opponent) || 'Unbekannt'}</div>
        <div style="font-family:'Space Mono',monospace;font-size:12px;color:#444;">${formatDate(f.date)} · ${f.method || ''}</div>
      </div>
      <div style="font-size:12px;color:#333;">→</div>
    </div>`;
  }).join('') + (data.fights.length > 5 ? `<div onclick="showPage('fights')" style="font-family:'Space Mono',monospace;font-size:11px;color:var(--red);padding:10px 0;cursor:pointer;text-align:center;">Alle ${data.fights.length} Kämpfe anzeigen →</div>` : '');
}

function deleteFight(i) {
  if (!confirm('Diesen Kampf endgültig löschen?')) return;
  const data = getData();
  if (!data) return;
  data.fights.splice(i, 1);
  saveData(data);
  showToast('Kampf gelöscht', 'info');
  renderFightLog();
  renderDashStats();
}

// ===== YOUTUBE EMBED HELPER =====
function getYouTubeId(url) {
  if (!url) return null;
  var m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ===== KÄMPFE PAGE =====
function renderFightsPage() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('page-fights');

  // Only rebuild header + tab bar if not already present
  if (!document.getElementById('fights-tab-content')) {
    const tabs = [
      { key: 'kaempfe', label: 'MEINE KÄMPFE' },
      { key: 'vorbereitung', label: 'VORBEREITUNG' },
      { key: 'analyse', label: 'ANALYSE' }
    ];

    const headerAndTabsHTML = `
    <div class="page-header">
      <div class="page-title">MEINE <span>KÄMPFE</span></div>
      <div class="page-sub">Dein komplettes Kampfarchiv – Analyse, Video, Runden-Notizen.</div>
    </div>
    <div id="fights-tab-bar" style="display:flex;flex-wrap:wrap;gap:0;border-bottom:1px solid var(--surface-2);margin-bottom:24px;">
      ${tabs.map(t => {
        const isActive = currentFightsTab === t.key;
        return `<div class="fights-tab-btn${isActive ? ' active' : ''}" data-tab="${t.key}" onclick="switchFightsTab('${t.key}')" style="padding:12px ${isMobile() ? '12px' : '20px'};cursor:pointer;font-family:'Space Mono',monospace;font-size:${isMobile() ? '11px' : '12px'};text-transform:uppercase;letter-spacing:${isMobile() ? '1px' : '2px'};color:${isActive ? 'var(--white)' : '#555'};border-bottom:${isActive ? '2px solid var(--red)' : '2px solid transparent'};transition:all .2s;margin-bottom:-1px;" onmouseenter="if(!this.classList.contains('active'))this.style.color='#888'" onmouseleave="if(!this.classList.contains('active'))this.style.color='#555'">${t.label}</div>`;
      }).join('')}
    </div>
    <div id="fights-tab-content"></div>`;

    el.innerHTML = headerAndTabsHTML;
  }

  // Render only the tab content
  switchFightsTab(currentFightsTab);
}

function switchFightsTab(tabKey) {
  currentFightsTab = tabKey;
  fightsListLimit = 20;

  // Update tab button active states
  document.querySelectorAll('.fights-tab-btn').forEach(function(b) {
    var isActive = b.dataset.tab === tabKey;
    b.classList.toggle('active', isActive);
    b.style.color = isActive ? 'var(--white)' : '#555';
    b.style.borderBottom = isActive ? '2px solid var(--red)' : '2px solid transparent';
  });

  // Re-render only the content area
  var contentEl = document.getElementById('fights-tab-content');
  var data = getData();
  if (!data || !contentEl) return;

  if (tabKey === 'kaempfe') {
    renderFightsTab1(contentEl, data);
  } else if (tabKey === 'vorbereitung') {
    renderFightsTab2(contentEl, data);
  } else if (tabKey === 'analyse') {
    renderFightsTab3(contentEl, data);
  }
}

function renderFightsTab1(contentEl, data) {
  const fights = data.fights || [];
  const wins = fights.filter(f => f.result === 'S').length;
  const losses = fights.filter(f => f.result === 'N').length;
  const draws = fights.filter(f => f.result === 'U').length;
  const kos = fights.filter(f => f.result === 'S' && (f.method === 'KO' || f.method === 'RSC')).length;
  const koRate = wins > 0 ? Math.round((kos / wins) * 100) : 0;

  // Best win streak
  let bestStreak = 0;
  let currentStreak = 0;
  fights.forEach(f => {
    if (f.result === 'S') {
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  });

  // Record bar
  const total = fights.length || 1;
  const wPct = (wins / total * 100).toFixed(0);
  const lPct = (losses / total * 100).toFixed(0);
  const dPct = (draws / total * 100).toFixed(0);

  // Matchup matrix – opponent types
  const types = ['Distanz', 'Infighter', 'Konter', 'Allrounder', 'Unbekannt'];
  const typeStats = {};
  types.forEach(t => { typeStats[t] = { total: 0, wins: 0 }; });
  fights.forEach(f => {
    const t = f.type || 'Unbekannt';
    const key = types.includes(t) ? t : 'Unbekannt';
    typeStats[key].total++;
    if (f.result === 'S') typeStats[key].wins++;
  });

  // Build matchup matrix rows (only types with fights)
  const matrixRows = types.filter(t => typeStats[t].total > 0).map(t => {
    const s = typeStats[t];
    const wr = Math.round((s.wins / s.total) * 100);
    const wrColor = wr > 60 ? 'var(--green)' : wr >= 40 ? 'var(--gold)' : 'var(--red)';
    return `<tr>
      <td style="font-family:'Space Mono',monospace;font-size:11px;color:var(--white);padding:8px 12px 8px 0;">${t}</td>
      <td style="font-family:'Space Mono',monospace;font-size:11px;color:#888;padding:8px 12px;text-align:center;">${s.total}</td>
      <td style="font-family:'Space Mono',monospace;font-size:11px;color:#888;padding:8px 12px;text-align:center;">${s.wins}</td>
      <td style="font-family:'Space Mono',monospace;font-size:11px;color:${wrColor};padding:8px 12px;text-align:center;font-weight:bold;">${wr}%</td>
    </tr>`;
  }).join('');

  // Fight timeline rows (paginated)
  const visibleFights = fights.slice(0, fightsListLimit);
  const timelineRows = visibleFights.map((f, i) => {
    const dotColor = f.result === 'S' ? 'var(--green)' : f.result === 'N' ? 'var(--red)' : 'var(--gold)';
    const methodTag = f.method ? `<span style="font-family:'Space Mono',monospace;font-size:11px;color:#888;background:var(--surface-1);padding:2px 6px;border-radius:var(--radius-sm);margin-left:8px;">${f.method}</span>` : '';
    const typeTag = f.type ? `<span style="font-family:'Space Mono',monospace;font-size:11px;color:#666;background:var(--surface-0);border:1px solid var(--surface-2);padding:2px 6px;border-radius:var(--radius-sm);margin-left:4px;">${f.type}</span>` : '';
    return `<div onclick="openFightDetail(${i})" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--surface-1);cursor:pointer;transition:background .15s;" onmouseenter="this.style.background='rgba(255,255,255,.02)'" onmouseleave="this.style.background='transparent'">
      <div style="font-family:'Space Mono',monospace;font-size:12px;color:#555;min-width:70px;">${formatDate(f.date)}</div>
      <div style="width:10px;height:10px;border-radius:50%;background:${dotColor};flex-shrink:0;"></div>
      <div style="flex:1;min-width:0;display:flex;align-items:center;flex-wrap:wrap;">
        <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;">vs. ${escapeHTML(f.opponent || 'Unbekannt').toUpperCase()}</span>
        ${methodTag}${typeTag}
      </div>
      <div style="font-size:14px;color:#333;">&#8250;</div>
    </div>`;
  }).join('');

  contentEl.innerHTML = `
  <!-- RECORD DISPLAY -->
  <div style="display:flex;gap:${isMobile() ? '16px' : '32px'};flex-wrap:wrap;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid var(--surface-2);">
    <div style="flex:1;min-width:${isMobile() ? '100%' : '220px'};">
      <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:8px;">
        <span style="font-family:'Bebas Neue',sans-serif;font-size:48px;color:var(--white);line-height:1;">${wins}</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:#333;">–</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:48px;color:${losses > 0 ? 'var(--red)' : '#333'};line-height:1;">${losses}</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:#333;">–</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:48px;color:var(--gold);line-height:1;">${draws}</span>
      </div>
      <div style="font-family:'Space Mono',monospace;font-size:12px;color:#444;letter-spacing:2px;margin-bottom:12px;">SIEGE – NIEDERLAGEN – UNENTSCHIEDEN</div>
      <div style="height:6px;background:var(--surface-1);border-radius:var(--radius-sm);overflow:hidden;max-width:300px;">
        <div style="display:flex;height:100%;">
          <div style="width:${wPct}%;background:var(--green);"></div>
          <div style="width:${lPct}%;background:var(--red);"></div>
          <div style="width:${dPct}%;background:var(--gold);"></div>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">
      <div style="text-align:center;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;color:var(--red);">${koRate}%</div>
        <div style="font-family:'Space Mono',monospace;font-size:11px;color:#444;letter-spacing:2px;">KO-RATE</div>
      </div>
      <div style="text-align:center;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;color:var(--green);">${bestStreak}</div>
        <div style="font-family:'Space Mono',monospace;font-size:11px;color:#444;letter-spacing:2px;">BEST STREAK</div>
      </div>
    </div>
  </div>

  <!-- MATCHUP MATRIX -->
  ${matrixRows ? `
  <div style="margin-bottom:28px;">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--white);letter-spacing:1px;margin-bottom:12px;">MATCHUP MATRIX</div>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:1px solid var(--surface-2);">
          <th style="font-family:'Space Mono',monospace;font-size:11px;color:#444;letter-spacing:2px;text-align:left;padding:6px 12px 6px 0;text-transform:uppercase;">Gegner-Typ</th>
          <th style="font-family:'Space Mono',monospace;font-size:11px;color:#444;letter-spacing:2px;text-align:center;padding:6px 12px;text-transform:uppercase;">Kämpfe</th>
          <th style="font-family:'Space Mono',monospace;font-size:11px;color:#444;letter-spacing:2px;text-align:center;padding:6px 12px;text-transform:uppercase;">Siege</th>
          <th style="font-family:'Space Mono',monospace;font-size:11px;color:#444;letter-spacing:2px;text-align:center;padding:6px 12px;text-transform:uppercase;">Winrate</th>
        </tr>
      </thead>
      <tbody>${matrixRows}</tbody>
    </table>
  </div>` : ''}

  <!-- FIGHT TIMELINE -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--white);letter-spacing:1px;">ALLE KÄMPFE</div>
    <button class="submit-btn" style="padding:6px 14px;font-size:12px;" onclick="openFightModal()">+ NEUEN KAMPF</button>
  </div>
  <div id="fights-timeline-list">
    ${fights.length === 0
      ? '<div style="text-align:center;padding:40px 0;"><div style="font-family:\'Bebas Neue\',sans-serif;font-size:32px;color:#1a1a1a;">0 K\u00c4MPFE</div><div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#444;margin:8px 0 16px;">Trage deinen ersten Kampf ein und baue dein Kampfarchiv auf.</div><button class="submit-btn" style="padding:10px 20px;font-size:12px;" onclick="openFightModal()">+ ERSTEN KAMPF EINTRAGEN</button></div>'
      : timelineRows}
  </div>
  ${fights.length > fightsListLimit ? `<div style="text-align:center;padding:16px 0;"><button onclick="fightsListLimit+=20;renderFightsPage();" style="font-family:'Space Mono',monospace;font-size:12px;color:#555;background:none;border:1px solid var(--surface-2);padding:10px 24px;border-radius:var(--radius-md);cursor:pointer;">Weitere Kämpfe laden (${fights.length - fightsListLimit} übrig)</button></div>` : ''}`;
}

function renderFightsTab2(contentEl, data) {
  contentEl.innerHTML = '<div id="fights-tab2-content">' + renderPrepTabContent() + '</div>';
}

function renderFightsTab3(contentEl, data) {
  const fights = data.fights || [];

  // Guard: need at least 3 fights
  if (fights.length < 3) {
    contentEl.innerHTML = '<div style="padding:60px 20px;text-align:center;">' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:36px;color:#1a1a1a;margin-bottom:8px;">ANALYSE</div>' +
      '<div style="font-family:\'DM Sans\',sans-serif;font-size:14px;color:#444;margin-bottom:20px;">Ab 3 K\u00e4mpfen erkennt FightOS Muster in deinen St\u00e4rken und Schw\u00e4chen.</div>' +
      '<div style="font-family:\'Space Mono\',monospace;font-size:12px;color:#555;">' + fights.length + '/3 K\u00e4mpfe eingetragen</div>' +
      '<div style="width:120px;height:4px;background:var(--surface-1);border-radius:var(--radius-sm);margin:12px auto;overflow:hidden;"><div style="width:' + Math.round(fights.length / 3 * 100) + '%;height:100%;background:var(--red);border-radius:var(--radius-sm);"></div></div>' +
      '<button class="submit-btn" style="margin-top:16px;padding:10px 20px;font-size:12px;" onclick="openFightModal()">+ KAMPF EINTRAGEN</button>' +
    '</div>';
    return;
  }

  // ---- SECTION A: WIEDERKEHRENDE SCHWÄCHEN ----
  var last10 = fights.slice(0, 10);
  var schwHTML = last10.map(function(f) {
    if (!f.improve) return '';
    return '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--surface-1);gap:8px 16px;">' +
      '<div style="flex-shrink:0;min-width:' + (isMobile() ? '100%' : '120px') + ';">' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:12px;color:#555;">' + formatDate(f.date) + '</div>' +
        '<div style="font-family:\'DM Sans\',sans-serif;font-size:12px;color:#888;">vs. ' + escapeHTML(f.opponent || 'Unbekannt') + '</div>' +
      '</div>' +
      '<div style="flex:1;font-family:\'DM Sans\',sans-serif;font-size:13px;color:#aaa;line-height:1.5;">' + escapeHTML(f.improve) + '</div>' +
    '</div>';
  }).join('');

  var sectionA = '<div style="margin-bottom:36px;">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:var(--white);letter-spacing:2px;margin-bottom:14px;">WIEDERKEHRENDE SCHW\u00c4CHEN</div>' +
    schwHTML +
    '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#555;font-style:italic;margin-top:14px;">Lies deine letzten Eintr\u00e4ge \u2014 siehst du ein Thema das sich wiederholt?</div>' +
  '</div>';

  // ---- SECTION B: MATCHUP-ANALYSE ----
  var typeMap = {};
  fights.forEach(function(f) {
    var t = f.type || 'Unbekannt';
    if (!typeMap[t]) typeMap[t] = { wins: 0, losses: 0, draws: 0, fights: [] };
    if (f.result === 'S') typeMap[t].wins++;
    else if (f.result === 'N') typeMap[t].losses++;
    else typeMap[t].draws++;
    typeMap[t].fights.push(f);
  });

  var matchupHTML = '';
  Object.keys(typeMap).forEach(function(t) {
    var s = typeMap[t];
    var total = s.wins + s.losses + s.draws;
    var winrate = total > 0 ? Math.round((s.wins / total) * 100) : 0;

    // Collect good/improve bullets (most recent first, max 3 each)
    var goodBullets = [];
    var improveBullets = [];
    s.fights.forEach(function(f) {
      if (f.good && goodBullets.length < 3) goodBullets.push(f.good);
      if (f.improve && improveBullets.length < 3) improveBullets.push(f.improve);
    });

    var bulletsHTML = '';
    if (goodBullets.length) {
      bulletsHTML += '<div style="margin-top:8px;"><div style="font-family:\'Space Mono\',monospace;font-size:11px;color:var(--green);letter-spacing:2px;margin-bottom:4px;">ST\u00c4RKEN</div>';
      goodBullets.forEach(function(b) {
        bulletsHTML += '<div style="font-family:\'DM Sans\',sans-serif;font-size:12px;color:#888;padding:2px 0 2px 12px;position:relative;"><span style="position:absolute;left:0;color:var(--green);">\u2022</span>' + b + '</div>';
      });
      bulletsHTML += '</div>';
    }
    if (improveBullets.length) {
      bulletsHTML += '<div style="margin-top:8px;"><div style="font-family:\'Space Mono\',monospace;font-size:11px;color:var(--gold);letter-spacing:2px;margin-bottom:4px;">VERBESSERUNG</div>';
      improveBullets.forEach(function(b) {
        bulletsHTML += '<div style="font-family:\'DM Sans\',sans-serif;font-size:12px;color:#888;padding:2px 0 2px 12px;position:relative;"><span style="position:absolute;left:0;color:var(--gold);">\u2022</span>' + b + '</div>';
      });
      bulletsHTML += '</div>';
    }

    matchupHTML += '<div style="padding:14px 0;border-bottom:1px solid var(--surface-1);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;">' +
        '<div style="font-family:\'DM Sans\',sans-serif;font-size:14px;color:var(--white);font-weight:600;">' + t + '</div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#555;">' + s.wins + 'S - ' + s.losses + 'N' + (s.draws > 0 ? ' - ' + s.draws + 'U' : '') + '</div>' +
      '</div>' +
      '<div style="height:6px;background:var(--surface-1);border-radius:var(--radius-sm);overflow:hidden;">' +
        '<div style="height:100%;width:' + winrate + '%;background:var(--green);border-radius:var(--radius-sm);transition:width .3s;"></div>' +
      '</div>' +
      '<div style="font-family:\'Space Mono\',monospace;font-size:12px;color:#444;margin-top:4px;">' + winrate + '% Winrate</div>' +
      bulletsHTML +
    '</div>';
  });

  var sectionB = '<div style="margin-bottom:36px;">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:var(--white);letter-spacing:2px;margin-bottom:14px;">MATCHUP-ANALYSE</div>' +
    matchupHTML +
  '</div>';

  // ---- SECTION C: FORTSCHRITTS-TIMELINE ----
  // Fights are stored newest first; timeline should be chronological (oldest at top)
  var chronFightsAll = fights.slice().reverse();
  var chronFights = chronFightsAll.slice(0, fightsListLimit);
  var timelineHTML = '';
  chronFights.forEach(function(f, i) {
    var dotColor = f.result === 'S' ? 'var(--green)' : f.result === 'N' ? 'var(--red)' : 'var(--gold)';
    var topPx = i * 90;

    // Gap in days to next fight
    var gapHTML = '';
    if (i < chronFights.length - 1) {
      var d1 = new Date(f.date + 'T00:00:00');
      var d2 = new Date(chronFights[i + 1].date + 'T00:00:00');
      var diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        gapHTML = '<div style="position:absolute;left:18px;top:' + (topPx + 28) + 'px;font-family:\'Space Mono\',monospace;font-size:11px;color:#333;">' + diffDays + ' Tage Pause</div>';
      }
    }

    timelineHTML += '<div style="position:absolute;left:0;top:' + topPx + 'px;display:flex;align-items:flex-start;gap:14px;">' +
      '<div style="width:12px;height:12px;border-radius:50%;background:' + dotColor + ';flex-shrink:0;margin-top:2px;z-index:1;"></div>' +
      '<div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:12px;color:#555;">' + formatDate(f.date) + ' <span style="color:#888;">vs. ' + escapeHTML(f.opponent || 'Unbekannt') + '</span></div>' +
        '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#666;">' + (f.method || '') + '</div>' +
      '</div>' +
    '</div>' + gapHTML;
  });

  var timelineHeight = chronFights.length * 90;
  var loadMoreTimelineBtn = '';
  if (chronFightsAll.length > fightsListLimit) {
    var remaining = chronFightsAll.length - fightsListLimit;
    loadMoreTimelineBtn = '<div style="text-align:center;padding:16px 0;"><button onclick="fightsListLimit+=20;renderFightsPage();" style="font-family:\'Space Mono\',monospace;font-size:12px;color:#555;background:none;border:1px solid var(--surface-2);padding:10px 24px;border-radius:var(--radius-md);cursor:pointer;">Weitere Kämpfe laden (' + remaining + ' übrig)</button></div>';
  }
  var sectionC = '<div style="margin-bottom:36px;">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:var(--white);letter-spacing:2px;margin-bottom:14px;">FORTSCHRITTS-TIMELINE</div>' +
    '<div style="position:relative;padding-left:6px;height:' + timelineHeight + 'px;">' +
      '<div style="position:absolute;left:5px;top:0;width:2px;height:100%;background:var(--surface-2);"></div>' +
      timelineHTML +
    '</div>' +
    loadMoreTimelineBtn +
  '</div>';

  // ---- SECTION D: KAMPF-STATISTIKEN ----
  var totalWins = fights.filter(function(f) { return f.result === 'S'; }).length;
  var totalLosses = fights.filter(function(f) { return f.result === 'N'; }).length;
  var totalDraws = fights.filter(function(f) { return f.result === 'U'; }).length;

  // Current streak
  var currentStreak = 0;
  var streakResult = fights.length > 0 ? fights[0].result : '';
  for (var si = 0; si < fights.length; si++) {
    if (fights[si].result === streakResult) currentStreak++;
    else break;
  }
  var streakLabel = streakResult === 'S' ? 'Siege' : streakResult === 'N' ? 'Niederlagen' : 'Unentschieden';
  var streakColor = streakResult === 'S' ? 'var(--green)' : streakResult === 'N' ? 'var(--red)' : 'var(--gold)';

  // Best win streak
  var bestStreak = 0;
  var currWinRun = 0;
  fights.forEach(function(f) {
    if (f.result === 'S') { currWinRun++; if (currWinRun > bestStreak) bestStreak = currWinRun; }
    else currWinRun = 0;
  });

  // Most common win method
  var winMethods = {};
  fights.forEach(function(f) {
    if (f.result === 'S' && f.method) {
      winMethods[f.method] = (winMethods[f.method] || 0) + 1;
    }
  });
  var topWinMethod = '\u2014';
  var topWinCount = 0;
  Object.keys(winMethods).forEach(function(m) {
    if (winMethods[m] > topWinCount) { topWinCount = winMethods[m]; topWinMethod = m; }
  });

  // Most common loss method
  var lossMethods = {};
  fights.forEach(function(f) {
    if (f.result === 'N' && f.method) {
      lossMethods[f.method] = (lossMethods[f.method] || 0) + 1;
    }
  });
  var topLossMethod = '\u2014';
  var topLossCount = 0;
  Object.keys(lossMethods).forEach(function(m) {
    if (lossMethods[m] > topLossCount) { topLossCount = lossMethods[m]; topLossMethod = m; }
  });

  // Fight frequency
  var freqText = '\u2014';
  if (fights.length >= 2) {
    var sorted = fights.slice().sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
    var firstDate = new Date(sorted[0].date + 'T00:00:00');
    var lastDate = new Date(sorted[sorted.length - 1].date + 'T00:00:00');
    var monthsSpan = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 30.44);
    if (monthsSpan > 0) {
      freqText = (fights.length / monthsSpan).toFixed(1) + ' K\u00e4mpfe/Monat';
    }
  }

  function statRow(label, value, color) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--surface-1);">' +
      '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#555;">' + label + '</div>' +
      '<div style="font-family:\'Space Mono\',monospace;font-size:13px;color:' + (color || 'var(--white)') + ';font-weight:700;">' + value + '</div>' +
    '</div>';
  }

  var sectionD = '<div style="margin-bottom:36px;">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:var(--white);letter-spacing:2px;margin-bottom:14px;">KAMPF-STATISTIKEN</div>' +
    statRow('Gesamtk\u00e4mpfe', fights.length) +
    statRow('Siege', totalWins, 'var(--green)') +
    statRow('Niederlagen', totalLosses, 'var(--red)') +
    statRow('Unentschieden', totalDraws, 'var(--gold)') +
    statRow('Aktueller Streak', currentStreak + ' ' + streakLabel, streakColor) +
    statRow('Bester Streak', bestStreak + ' Siege', 'var(--green)') +
    statRow('H\u00e4ufigste Siegmethode', topWinMethod + (topWinCount > 0 ? ' (' + topWinCount + 'x)' : ''), 'var(--green)') +
    statRow('H\u00e4ufigste Niederlagemethode', topLossMethod + (topLossCount > 0 ? ' (' + topLossCount + 'x)' : ''), 'var(--red)') +
    statRow('Kampffrequenz', freqText) +
  '</div>';

  contentEl.innerHTML = sectionA + sectionB + sectionC + sectionD;
}

// ===== KAMPF DETAIL =====
function openFightDetail(idx) {
  const data = getData();
  if (!data || !data.fights || !data.fights[idx]) return;
  const f = data.fights[idx];
  const el = document.getElementById('page-fight-detail');
  const color = f.result === 'S' ? 'var(--green)' : f.result === 'N' ? 'var(--red)' : 'var(--gold)';
  const label = f.result === 'S' ? 'SIEG' : f.result === 'N' ? 'NIEDERLAGE' : 'UNENTSCHIEDEN';
  const ytId = getYouTubeId(f.videoLink);

  // Ensure rounds + ratings exist
  if (!f.rounds || f.rounds.length < 3) {
    f.rounds = [
      { round: 1, notes: (f.rounds && f.rounds[0]) ? f.rounds[0].notes : '' },
      { round: 2, notes: (f.rounds && f.rounds[1]) ? f.rounds[1].notes : '' },
      { round: 3, notes: (f.rounds && f.rounds[2]) ? f.rounds[2].notes : '' }
    ];
  }
  if (!f.ratings) f.ratings = {};
  if (!f.keyMoments) f.keyMoments = '';
  if (!f.nextSteps) f.nextSteps = '';

  // Self-rating categories
  const ratingCats = [
    { key: 'jab', label: 'JAB' },
    { key: 'defense', label: 'DECKUNG' },
    { key: 'footwork', label: 'FUSSARBEIT' },
    { key: 'power', label: 'SCHLAGKRAFT' },
    { key: 'cardio', label: 'KONDITION' },
    { key: 'mental', label: 'MENTAL' }
  ];

  // Video section – with YouTube API for seeking
  let videoHTML;
  if (ytId) {
    videoHTML = `
      <div style="width:100%;aspect-ratio:16/9;border-radius:var(--radius-md);overflow:hidden;background:#000;box-shadow:0 0 40px rgba(232,0,13,.08);">
        <div id="fight-yt-container" style="width:100%;height:100%;"></div>
      </div>
      <div style="display:flex;gap:16px;margin-top:8px;">
        <a href="https://www.youtube.com/watch?v=${ytId}" target="_blank" rel="noopener" style="font-family:'Space Mono',monospace;font-size:11px;color:#333;text-decoration:none;">Auf YouTube öffnen ↗</a>
        <span onclick="showVideoInput(${idx})" style="font-family:'Space Mono',monospace;font-size:11px;color:#333;cursor:pointer;">Video ändern</span>
      </div>
      <div id="video-input-area" style="display:none;margin-top:8px;"></div>`;
  } else {
    videoHTML = `
      <div onclick="showVideoInput(${idx})" style="width:100%;aspect-ratio:16/9;border-radius:var(--radius-md);background:var(--surface-0);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:background .2s;" onmouseenter="this.style.background='var(--surface-1)'" onmouseleave="this.style.background='var(--surface-0)'">
        <div style="width:48px;height:48px;border-radius:50%;border:2px solid var(--surface-2);display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:20px;color:#333;margin-left:3px;">▶</span>
        </div>
        <div style="font-family:'Space Mono',monospace;font-size:12px;color:#333;letter-spacing:1px;">KAMPFVIDEO HINZUFÜGEN</div>
      </div>
      <div id="video-input-area" style="margin-top:10px;"></div>`;
  }

  // Timestamp markers
  var markers = f.timestamps || [];
  var timestampsHTML = '<div style="display:flex;flex-direction:column;height:100%;">' +
    '<button onclick="markNow(' + idx + ')" style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;letter-spacing:2px;padding:14px;background:var(--red);color:#fff;border:none;border-radius:var(--radius-md);cursor:pointer;width:100%;margin-bottom:12px;transition:opacity .15s;" onmousedown="this.style.opacity=\'0.7\'" onmouseup="this.style.opacity=\'1\'">+ SZENE</button>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<span style="font-family:\'Space Mono\',monospace;font-size:10px;color:#333;letter-spacing:1px;">' + markers.length + ' MARKIERUNG' + (markers.length !== 1 ? 'EN' : '') + '</span>' +
    '</div>' +
    '<div id="ts-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:3px;">';

  markers.sort(function(a, b) { return a.time - b.time; });
  if (markers.length === 0) {
    timestampsHTML += '<div style="text-align:center;padding:24px 0;font-family:\'Space Mono\',monospace;font-size:10px;color:#1a1a1a;">Drücke + SZENE während<br>du den Kampf schaust</div>';
  } else {
    markers.forEach(function(m, mi) {
      var tagColor = _tsTagColors[m.tag] || '#555';
      timestampsHTML += '<div id="ts-item-' + mi + '" style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--surface-0);border-radius:var(--radius-sm);border-left:2px solid ' + tagColor + ';">' +
        '<span id="ts-time-' + mi + '" onclick="seekVideo(' + m.time + ')" style="font-family:\'Space Mono\',monospace;font-size:12px;color:' + tagColor + ';cursor:pointer;white-space:nowrap;min-width:36px;">' + formatTs(m.time) + '</span>' +
        '<input id="ts-text-' + mi + '" type="text" value="' + (m.text || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '" placeholder="Beschreibung..." ' +
          'onblur="updateTimestampText(' + idx + ',' + mi + ',this.value)" ' +
          'onkeydown="if(event.key===\'Enter\')this.blur()" ' +
          'style="flex:1;padding:4px 6px;background:transparent;border:none;border-bottom:1px solid var(--surface-1);color:#aaa;font-family:\'DM Sans\',sans-serif;font-size:12px;outline:none;min-width:0;">' +
        '<span onclick="deleteTimestamp(' + idx + ',' + mi + ')" style="font-size:14px;color:#222;cursor:pointer;padding:0 2px;line-height:1;">\u00d7</span>' +
      '</div>';
    });
  }

  timestampsHTML += '</div></div>';

  // Sidebar: Self-ratings (6 categories, 1-5 clickable dots)
  const ratingsHTML = ratingCats.map(c => {
    const val = f.ratings[c.key] || 0;
    const dots = [1,2,3,4,5].map(n =>
      `<span onclick="setFightRating(${idx},'${c.key}',${n})" style="display:inline-block;width:16px;height:16px;border-radius:50%;margin-right:4px;cursor:pointer;transition:all .15s;${n <= val ? 'background:var(--red);' : 'background:var(--surface-2);border:1px solid var(--surface-3);'}" onmouseenter="this.style.transform='scale(1.2)'" onmouseleave="this.style.transform='scale(1)'"></span>`
    ).join('');
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;">
      <span style="font-family:'Space Mono',monospace;font-size:10px;color:#444;letter-spacing:1px;min-width:80px;">${c.label}</span>
      <div>${dots}</div>
    </div>`;
  }).join('');

  // Average rating
  const ratedVals = ratingCats.map(c => f.ratings[c.key] || 0).filter(v => v > 0);
  const avgRating = ratedVals.length ? (ratedVals.reduce((a,b) => a+b,0) / ratedVals.length).toFixed(1) : '–';

  // Round winner badges
  const roundWinnerHTML = [1,2,3].map(r => {
    const w = f.rounds[r-1] ? (f.rounds[r-1].winner || '') : '';
    return `<div style="display:flex;align-items:center;gap:6px;">
      <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:#333;">R${r}</span>
      ${['ich','gegner','unklar'].map(v => `<span onclick="setRoundWinner(${idx},${r-1},'${v}')" style="font-family:'Space Mono',monospace;font-size:9px;padding:3px 8px;border-radius:var(--radius-sm);cursor:pointer;transition:all .15s;${w === v ? (v==='ich'?'background:var(--green);color:#000;':'background:var(--red);color:#fff;') : 'background:var(--surface-1);color:#333;'}">${v === 'ich' ? 'ICH' : v === 'gegner' ? 'ER' : '?'}</span>`).join('')}
    </div>`;
  }).join('');

  el.innerHTML = `
  <!-- BACK -->
  <div style="padding-bottom:16px;">
    <button onclick="showPage('fights')" style="font-family:'Space Mono',monospace;font-size:11px;color:#444;background:none;border:none;cursor:pointer;padding:0;min-height:44px;display:inline-flex;align-items:center;letter-spacing:1px;">← Alle Kämpfe</button>
  </div>

  <!-- HEADER -->
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:6px;">
    <span style="font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,4vw,36px);color:${color};letter-spacing:2px;">${label}</span>
    <span style="font-family:'Space Mono',monospace;font-size:11px;color:#444;">${f.method || ''}</span>
  </div>
  <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,5vw,48px);color:var(--white);letter-spacing:3px;line-height:.9;margin-bottom:10px;">vs. ${escapeHTML(f.opponent || 'Unbekannt').toUpperCase()}</div>
  <div style="font-family:'Space Mono',monospace;font-size:11px;color:#333;margin-bottom:28px;">${formatDate(f.date)}${f.style ? ' · ' + f.style : ''}${f.type ? ' · ' + f.type : ''}</div>

  <!-- MAIN: VIDEO LEFT + TIMESTAMPS RIGHT -->
  <div style="display:grid;grid-template-columns:${isMobile() ? '1fr' : '1fr 320px'};gap:24px;margin-bottom:24px;" class="fight-detail-grid">
    <!-- LEFT: VIDEO -->
    <div>${videoHTML}</div>
    <!-- RIGHT: TIMESTAMPS -->
    <div style="background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:16px;${isMobile() ? '' : 'max-height:480px;display:flex;flex-direction:column;'}">${timestampsHTML}</div>
  </div>

  <!-- BEWERTUNG + SCORING – full width row -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:36px;">
    <!-- Self-Rating -->
    <div style="background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;">SELBSTBEWERTUNG</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:${avgRating !== '–' ? 'var(--gold)' : '#222'};">${avgRating}<span style="font-size:12px;color:#333;">/5</span></span>
      </div>
      ${ratingsHTML}
    </div>
    <!-- Runden-Scoring (kompakt neben Selbstbewertung) -->
    <div style="background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:16px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;margin-bottom:10px;">WER HAT GEWONNEN?</div>
      <div style="display:flex;flex-direction:column;gap:6px;">${roundWinnerHTML}</div>
    </div>
  </div>

  <!-- GEFÜHRTE VIDEO-ANALYSE -->
  <div style="background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:24px;margin-bottom:36px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--white);letter-spacing:1.5px;">VIDEO-ANALYSE</div>
      <span style="font-family:'Space Mono',monospace;font-size:10px;color:#333;letter-spacing:1px;">${f.videoAnalysis ? Object.keys(f.videoAnalysis).filter(k => f.videoAnalysis[k]).length + '/15 BEANTWORTET' : '0/15 BEANTWORTET'}</span>
    </div>
    <div style="font-family:'DM Sans',sans-serif;font-size:13px;color:#444;margin-bottom:20px;">Schau dir den Kampf an und beantworte die Fragen Runde fuer Runde. Nimm dir Zeit – ehrliche Analyse macht dich besser.</div>

    ${[1,2,3].map(r => {
      const va = (f.videoAnalysis && f.videoAnalysis['r'+r]) || {};
      const roundColor = r === 1 ? 'var(--blue)' : r === 2 ? 'var(--gold)' : 'var(--red)';
      const questions = r === 1 ? [
        { key: 'distance', q: 'Wer hat die Distanz kontrolliert?', ph: 'Ich / Gegner / Wechselnd – beschreibe warum' },
        { key: 'jab', q: 'Wie war dein Jab?', ph: 'Schnell genug? Hat er getroffen? Hat der Gegner ihn gelesen?' },
        { key: 'firstImpression', q: 'Was hast du in den ersten 30 Sekunden ueber den Gegner gelernt?', ph: 'Stance, Tempo, Aggressivitaet, schwache Seite...' },
        { key: 'ringPosition', q: 'Wo hast du gestanden? Mitte oder Seile?', ph: 'Wenn Seile – wann und warum bist du dort gelandet?' },
        { key: 'adjustment', q: 'Hast du etwas angepasst während der Runde?', ph: 'z.B. Distanz geändert, mehr Körper, Tempo hoch...' }
      ] : r === 2 ? [
        { key: 'combos', q: 'Welche Kombinationen haben funktioniert?', ph: 'z.B. Jab-Cross-Hook, 1-2 Koerper, Aufwaerts...' },
        { key: 'gegnermuster', q: 'Welche Muster hat der Gegner gezeigt?', ph: 'z.B. senkt linke Hand nach Cross, geht immer rechts raus...' },
        { key: 'defense', q: 'Wie bist du getroffen worden?', ph: 'Welche Schlaege? Von welcher Seite? Wann warst du offen?' },
        { key: 'tempo', q: 'Wer hat das Tempo bestimmt?', ph: 'Warst du aktiv oder hast du reagiert? Wolltest du das?' },
        { key: 'bodywork', q: 'Wie war die Koerperarbeit?', ph: 'Genug zum Koerper geschlagen? Hat der Gegner den Koerper attackiert?' }
      ] : [
        { key: 'energy', q: 'Wie war deine Kondition?', ph: 'Muede? Schlaege noch mit Power? Atemnot?' },
        { key: 'clinch', q: 'Wie hast du den Clinch gemanagt?', ph: 'Zu viel geclinct? Konnte der Gegner rausfighten?' },
        { key: 'finish', q: 'Hast du den Kampf dominiert oder ueberlebt?', ph: 'Letzte 30 Sek: Hast du Gas gegeben oder durchgehalten?' },
        { key: 'gameplan', q: 'Hat dein Gameplan funktioniert?', ph: 'Was vom Plan hast du umgesetzt? Was nicht und warum?' },
        { key: 'lesson', q: 'Die wichtigste Lektion aus dieser Runde?', ph: 'Eine Sache die du beim naechsten Mal anders machst' }
      ];

      const answeredCount = questions.filter(q => va[q.key]).length;
      const isComplete = answeredCount === 5;

      return '<div style="margin-bottom:20px;' + (r > 1 ? 'padding-top:20px;border-top:1px solid var(--surface-1);' : '') + '">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">' +
          '<div style="width:32px;height:32px;border-radius:50%;background:' + (isComplete ? 'var(--green)' : roundColor) + ';display:flex;align-items:center;justify-content:center;font-family:\'Bebas Neue\',sans-serif;font-size:18px;color:' + (isComplete ? '#000' : '#fff') + ';">' + (isComplete ? '\\u2713' : r) + '</div>' +
          '<div><div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;">RUNDE ' + r + '</div>' +
          '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:#333;">' + answeredCount + '/5</div></div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:12px;">' +
          questions.map(function(q) {
            return '<div>' +
              '<label style="font-family:\'Space Mono\',monospace;font-size:10px;color:' + roundColor + ';letter-spacing:1px;display:block;margin-bottom:4px;">' + q.q.replace(/</g,'&lt;') + '</label>' +
              '<textarea style="width:100%;padding:10px 12px;background:var(--surface-1);border:1px solid ' + (va[q.key] ? '#1a3a1a' : 'var(--surface-2)') + ';color:#ccc;font-family:\'DM Sans\',sans-serif;font-size:13px;border-radius:var(--radius-sm);outline:none;resize:vertical;min-height:48px;box-sizing:border-box;" placeholder="' + q.ph.replace(/"/g,'&quot;') + '" onblur="saveVideoAnalysis(' + idx + ',' + r + ',\'' + q.key + '\',this.value)">' + (va[q.key] || '').replace(/</g,'&lt;') + '</textarea>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('')}

    <div id="va-summary-${idx}" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--surface-2);">
      ${(function() {
        var va = f.videoAnalysis || {};
        var total = 0;
        for (var r = 1; r <= 3; r++) {
          var rd = va['r'+r] || {};
          var keys = Object.keys(rd);
          for (var k = 0; k < keys.length; k++) { if (rd[keys[k]]) total++; }
        }
        if (total === 0) return '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#222;text-align:center;">Beantworte die Fragen oben um deine Analyse zu starten.</div>';
        if (total < 10) return '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#444;text-align:center;">' + total + '/15 – Mach weiter, je ehrlicher desto besser.</div>';
        if (total < 15) return '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:var(--gold);text-align:center;">' + total + '/15 – Fast fertig. Fuell die letzten Fragen aus.</div>';
        return '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:var(--green);text-align:center;">\\u2713 ANALYSE KOMPLETT – Gute Arbeit. Nutze die Erkenntnisse im Training.</div>';
      })()}
    </div>
  </div>

  <!-- ANALYSE – full width below -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:36px;">
    <div style="padding:16px 0;border-bottom:1px solid var(--surface-1);">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--green);letter-spacing:1px;margin-bottom:8px;">WAS LIEF GUT</div>
      <div id="fd-good" class="editable-field" onclick="makeFightFieldEditable(${idx},'good',this)" style="font-size:14px;color:#888;line-height:1.7;cursor:text;min-height:24px;">${escapeHTML(f.good) || '<span style="color:#222;">Klicke zum Eintragen...</span>'}</div>
    </div>
    <div style="padding:16px 0;border-bottom:1px solid var(--surface-1);">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--red);letter-spacing:1px;margin-bottom:8px;">WAS MUSS BESSER WERDEN</div>
      <div id="fd-improve" class="editable-field" onclick="makeFightFieldEditable(${idx},'improve',this)" style="font-size:14px;color:#888;line-height:1.7;cursor:text;min-height:24px;">${escapeHTML(f.improve) || '<span style="color:#222;">Klicke zum Eintragen...</span>'}</div>
    </div>
    <div style="padding:16px 0;border-bottom:1px solid var(--surface-1);">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--blue);letter-spacing:1px;margin-bottom:8px;">GEGNER-SCHWÄCHEN</div>
      <div id="fd-opponentWeaknesses" class="editable-field" onclick="makeFightFieldEditable(${idx},'opponentWeaknesses',this)" style="font-size:14px;color:#888;line-height:1.7;cursor:text;min-height:24px;">${escapeHTML(f.opponentWeaknesses) || '<span style="color:#222;">Klicke zum Eintragen...</span>'}</div>
    </div>
  </div>

  <!-- NÄCHSTE SCHRITTE -->
  <div style="margin-bottom:36px;padding:20px 0;border-top:1px solid var(--surface-1);">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--gold);letter-spacing:1.5px;margin-bottom:10px;">WAS ICH NÄCHSTES MAL ANDERS MACHE</div>
    <div id="fd-nextSteps" class="editable-field" onclick="makeFightFieldEditable(${idx},'nextSteps',this)" style="font-size:14px;color:#888;line-height:1.7;cursor:text;min-height:24px;">${escapeHTML(f.nextSteps) || '<span style="color:#222;">Konkrete Maßnahmen für das nächste Training / den nächsten Kampf...</span>'}</div>
  </div>

  <!-- ACTIONS -->
  <div style="display:flex;flex-wrap:wrap;gap:12px;padding-top:16px;border-top:1px solid var(--surface-1);">
    <button onclick="if(confirm('Diesen Kampf wirklich löschen?')){deleteFight(${idx});showPage('fights');}" style="font-family:'Space Mono',monospace;font-size:11px;color:#333;background:none;border:1px solid var(--surface-2);padding:10px 20px;border-radius:var(--radius-sm);cursor:pointer;min-height:44px;">KAMPF LÖSCHEN</button>
  </div>`;

  showPage('fight-detail');

  // Init YouTube player after DOM is set
  if (ytId) {
    function _initFightPlayerWithRetry(retries) {
      retries = retries || 0;
      var container = document.getElementById('fight-yt-container');
      if (!container) {
        if (retries < 5) {
          setTimeout(function() { _initFightPlayerWithRetry(retries + 1); }, 500);
        }
        return;
      }
      try {
        window._fightPlayer = new YT.Player('fight-yt-container', {
          videoId: ytId,
          width: '100%',
          height: '100%',
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 }
        });
      } catch(e) {
        console.error('YT.Player init failed:', e);
      }
    }
    if (window.YT && window.YT.Player) {
      _initFightPlayerWithRetry(0);
    } else {
      if (!document.getElementById('yt-api-script')) {
        var tag = document.createElement('script');
        tag.id = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = function() { _initFightPlayerWithRetry(0); };
    }
  }
}

// Rating + Round winner helpers
function setFightRating(idx, key, val) {
  var data = getData();
  if (!data || !data.fights[idx]) return;
  if (!data.fights[idx].ratings) data.fights[idx].ratings = {};
  data.fights[idx].ratings[key] = val;
  saveData(data);
  // Partial DOM update: update dots for this rating row
  var dots = document.querySelectorAll('span[onclick*="setFightRating(' + idx + ',\'' + key + '\'"]');
  dots.forEach(function(dot, i) {
    var n = i + 1;
    if (n <= val) {
      dot.style.background = 'var(--red)';
      dot.style.border = 'none';
    } else {
      dot.style.background = 'var(--surface-2)';
      dot.style.border = '1px solid var(--surface-3)';
    }
  });
  // Update average display
  var ratingCats = ['jab','defense','footwork','power','cardio','mental'];
  var ratings = data.fights[idx].ratings;
  var vals = ratingCats.map(function(k) { return ratings[k] || 0; }).filter(function(v) { return v > 0; });
  var avg = vals.length ? (vals.reduce(function(a,b){return a+b;},0) / vals.length).toFixed(1) : '\u2014';
  var avgEl = document.querySelector('.dash-hero-score, [style*="font-size:24px"][style*="gold"]');
  // Find the avg text near the SELBSTBEWERTUNG heading
  var selfHeading = document.querySelectorAll('span');
  selfHeading.forEach(function(el) {
    if (el.textContent === 'SELBSTBEWERTUNG') {
      var avgSpan = el.parentElement.querySelector('[style*="font-size:24px"]');
      if (avgSpan) avgSpan.innerHTML = avg + '<span style="font-size:12px;color:var(--text-subtle);">/5</span>';
    }
  });
}

function setRoundWinner(idx, roundIdx, winner) {
  var data = getData();
  if (!data || !data.fights[idx]) return;
  if (!data.fights[idx].rounds) return;
  var current = data.fights[idx].rounds[roundIdx].winner;
  var newWinner = (current === winner) ? '' : winner;
  data.fights[idx].rounds[roundIdx].winner = newWinner;
  saveData(data);
  // Partial DOM update: update the 3 buttons for this round
  var btns = document.querySelectorAll('span[onclick*="setRoundWinner(' + idx + ',' + roundIdx + '"]');
  btns.forEach(function(btn) {
    var v = '';
    if (btn.textContent === 'ICH') v = 'ich';
    else if (btn.textContent === 'ER') v = 'gegner';
    else v = 'unklar';
    if (v === newWinner) {
      btn.style.background = v === 'ich' ? 'var(--green)' : 'var(--red)';
      btn.style.color = v === 'ich' ? '#000' : '#fff';
    } else {
      btn.style.background = 'var(--surface-1)';
      btn.style.color = 'var(--text-subtle)';
    }
  });
  // Update the round dot color in the rounds section
  var roundDots = document.querySelectorAll('.fight-round-dot');
  if (roundDots[roundIdx]) {
    roundDots[roundIdx].style.background = newWinner === 'ich' ? 'var(--green)' : newWinner === 'gegner' ? 'var(--red)' : 'var(--surface-3)';
  }
}

// ===== TIMESTAMP SYSTEM =====
var _tsCurrentFightIdx = null;

function getCurrentVideoTime() {
  if (window._fightPlayer && typeof window._fightPlayer.getCurrentTime === 'function') {
    return Math.floor(window._fightPlayer.getCurrentTime());
  }
  return 0;
}

function formatTs(sec) {
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function autoDetectTag(text) {
  if (!text) return 'sonstiges';
  var t = text.toLowerCase();
  if (/treffer|kassiert|getroffen|hit|schlag.*(kassiert|bekommen)/.test(t)) return 'treffer-kassiert';
  if (/angriff|kombi|cross|hook|jab|uppercut|schlag|gut/.test(t)) return 'guter-angriff';
  if (/defense|deckung|block|ausweich|parr|slip|roll/.test(t)) return 'gute-defense';
  if (/taktik|muster|pattern|gewohnheit|immer/.test(t)) return 'taktik';
  if (/fehler|offen|schlecht|problem|falsch/.test(t)) return 'fehler';
  return 'sonstiges';
}

var _tsTagColors = {
  'guter-angriff': 'var(--green)', 'treffer-kassiert': 'var(--red)',
  'gute-defense': 'var(--blue)', 'taktik': 'var(--gold)',
  'fehler': 'var(--orange)', 'sonstiges': '#555'
};

// JETZT drücken = sofort Marker setzen
function markNow(idx) {
  var sec = getCurrentVideoTime();
  var data = getData();
  if (!data || !data.fights[idx]) return;
  if (!data.fights[idx].timestamps) data.fights[idx].timestamps = [];
  var newId = Date.now().toString(36);
  data.fights[idx].timestamps.push({ id: newId, time: sec, text: '', tag: 'sonstiges', created: new Date().toISOString() });
  saveData(data);
  renderTimestampList(idx);
  // Focus the last timestamp input in the rendered list
  setTimeout(function() {
    var list = document.getElementById('ts-list');
    if (list) {
      var inputs = list.querySelectorAll('input[type="text"]');
      if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }
  }, 50);
}

function updateTimestampById(idx, markerId, value) {
  var data = getData();
  if (!data || !data.fights[idx]) return;
  var ts = data.fights[idx].timestamps;
  if (!ts) return;
  for (var i = 0; i < ts.length; i++) {
    if (ts[i].id === markerId) {
      ts[i].text = value.trim();
      ts[i].tag = autoDetectTag(value);
      saveData(data);
      var newColor = _tsTagColors[ts[i].tag] || '#555';
      var el = document.getElementById('ts-item-' + markerId);
      if (el) el.style.borderLeftColor = newColor;
      var timeEl = document.getElementById('ts-time-' + markerId);
      if (timeEl) timeEl.style.color = newColor;
      return;
    }
  }
}

function deleteTimestamp(idx, markerId) {
  if (!confirm('Diese Markierung löschen?')) return;
  var data = getData();
  if (!data || !data.fights[idx]) return;
  if (!data.fights[idx].timestamps) return;
  data.fights[idx].timestamps = data.fights[idx].timestamps.filter(function(m) { return m.id !== markerId; });
  saveData(data);
  renderTimestampList(idx);
}

function renderTimestampList(idx) {
  var el = document.getElementById('ts-list');
  if (!el) return;
  var data = getData();
  if (!data || !data.fights[idx]) return;
  var markers = data.fights[idx].timestamps || [];
  markers.sort(function(a, b) { return a.time - b.time; });

  if (markers.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:24px 0;font-family:\'Space Mono\',monospace;font-size:10px;color:#1a1a1a;">Drücke JETZT während<br>du den Kampf schaust</div>';
    return;
  }

  el.innerHTML = markers.map(function(m) {
    var mid = m.id || '';
    var tagColor = _tsTagColors[m.tag] || '#555';
    return '<div id="ts-item-' + mid + '" style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--surface-0);border-radius:var(--radius-sm);border-left:2px solid ' + tagColor + ';">' +
      '<span id="ts-time-' + mid + '" onclick="seekVideo(' + m.time + ')" style="font-family:\'Space Mono\',monospace;font-size:12px;color:' + tagColor + ';cursor:pointer;white-space:nowrap;min-width:36px;">' + formatTs(m.time) + '</span>' +
      '<input id="ts-text-' + mid + '" type="text" value="' + (m.text || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '" placeholder="Was passiert hier?" ' +
        'onblur="updateTimestampById(' + idx + ',\'' + mid + '\',this.value)" ' +
        'onkeydown="if(event.key===\'Enter\')this.blur()" ' +
        'style="flex:1;padding:4px 6px;background:transparent;border:none;border-bottom:1px solid var(--surface-1);color:#aaa;font-family:\'DM Sans\',sans-serif;font-size:12px;outline:none;min-width:0;">' +
      '<span onclick="deleteTimestamp(' + idx + ',\'' + mid + '\')" style="font-size:14px;color:#333;cursor:pointer;padding:0 4px;line-height:1;" title="Entfernen">\u00d7</span>' +
    '</div>';
  }).join('');
}

function seekVideo(seconds) {
  if (window._fightPlayer && typeof window._fightPlayer.seekTo === 'function') {
    window._fightPlayer.seekTo(seconds, true);
    window._fightPlayer.playVideo();
  }
  var el = document.getElementById('fight-yt-container');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Video Analysis save
function saveVideoAnalysis(idx, round, key, value) {
  var data = getData();
  if (!data || !data.fights[idx]) return;
  if (!data.fights[idx].videoAnalysis) data.fights[idx].videoAnalysis = {};
  if (!data.fights[idx].videoAnalysis['r' + round]) data.fights[idx].videoAnalysis['r' + round] = {};
  data.fights[idx].videoAnalysis['r' + round][key] = value.trim();
  saveData(data);
}

// Inline video URL input
function showVideoInput(idx) {
  var area = document.getElementById('video-input-area');
  if (!area) return;
  area.style.display = 'block';
  area.innerHTML = '<div style="display:flex;gap:8px;"><input id="vid-url-input" type="url" placeholder="YouTube-Link einfügen..." style="flex:1;background:var(--surface-1);border:1px solid var(--surface-3);color:var(--white);padding:10px 14px;font-size:13px;border-radius:var(--radius-md);outline:none;min-height:44px;" autofocus><button onclick="saveVideoUrl(' + idx + ')" style="font-family:\'Space Mono\',monospace;font-size:12px;color:var(--red);background:none;border:1px solid rgba(232,0,13,.3);padding:10px 16px;border-radius:var(--radius-md);cursor:pointer;min-height:44px;white-space:nowrap;">SPEICHERN</button></div>';
  var inp = document.getElementById('vid-url-input');
  if (inp) { inp.focus(); inp.onkeydown = function(e) { if (e.key === 'Enter') saveVideoUrl(idx); }; }
}

function saveVideoUrl(idx) {
  var inp = document.getElementById('vid-url-input');
  if (!inp) return;
  var data = getData();
  if (!data || !data.fights[idx]) return;
  data.fights[idx].videoLink = inp.value.trim();
  saveData(data);
  openFightDetail(idx);
}

// Inline edit for fight text fields
function makeFightFieldEditable(idx, field, container) {
  var data = getData();
  if (!data || !data.fights[idx]) return;
  var f = data.fights[idx];
  var val = '';
  if (field === 'round1') val = f.rounds[0] ? f.rounds[0].notes : '';
  else if (field === 'round2') val = f.rounds[1] ? f.rounds[1].notes : '';
  else if (field === 'round3') val = f.rounds[2] ? f.rounds[2].notes : '';
  else val = f[field] || '';

  // Already editing?
  if (container.querySelector('textarea')) return;

  container.innerHTML = '<textarea style="width:100%;background:#0e0e0e;border:1px solid var(--surface-2);color:#ccc;padding:10px 12px;font-size:14px;font-family:\'DM Sans\',sans-serif;line-height:1.7;border-radius:var(--radius-md);outline:none;resize:vertical;min-height:60px;box-sizing:border-box;" autofocus>' + val.replace(/</g,'&lt;') + '</textarea>';
  var ta = container.querySelector('textarea');
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
  ta.onblur = function() {
    var newVal = ta.value.trim();
    var d = getData();
    if (!d || !d.fights[idx]) return;
    if (field === 'round1') { if (!d.fights[idx].rounds) d.fights[idx].rounds = [{round:1,notes:''},{round:2,notes:''},{round:3,notes:''}]; d.fights[idx].rounds[0].notes = newVal; }
    else if (field === 'round2') { if (!d.fights[idx].rounds) d.fights[idx].rounds = [{round:1,notes:''},{round:2,notes:''},{round:3,notes:''}]; d.fights[idx].rounds[1].notes = newVal; }
    else if (field === 'round3') { if (!d.fights[idx].rounds) d.fights[idx].rounds = [{round:1,notes:''},{round:2,notes:''},{round:3,notes:''}]; d.fights[idx].rounds[2].notes = newVal; }
    else { d.fights[idx][field] = newVal; }
    saveData(d);
    // Replace textarea with display text
    container.innerHTML = '<div style="font-size:14px;color:#888;line-height:1.7;cursor:text;min-height:24px;padding:4px 0;">' + (escapeHTML(newVal) || '<span style="color:#222;">Klicke hier um Notizen hinzuzufügen...</span>') + '</div>';
  };
}

// ===== VORBEREITUNG (PREP) TAB =====

function getDefaultPrep() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    step: 1,
    createdAt: new Date().toISOString(),
    completed: false,
    completedAt: null,
    opponent: { name: '', club: '', stance: '', type: '', height: '', reach: '', strengths: '', weaknesses: '', videoLink: '', notes: '' },
    gameplan: { r1: '', r2: '', r3: '', planB: '', combo1: '', combo2: '', combo3: '' },
    mentalChecklist: { alterEgo: false, triggerWords: false, visualization: false, breathing: false, videoStudied: false, comboDrilled: false },
    packingList: { mundschutz: false, bandagen: false, wettkampfpass: false, boxschuhe: false, kleidung: false, handtuch: false, wasser: false, essen: false, musik: false, seil: false },
    triggerWords: { technik: '', motivation: '', krisen: '' },
    fightDayNotes: ''
  };
}

// Migrate old single nextFightPrep to new preparations array
function migratePreps(data) {
  if (!data.preparations) data.preparations = [];
  if (data.nextFightPrep) {
    var old = data.nextFightPrep;
    if (!old.id) old.id = Date.now().toString(36) + 'migrated';
    if (!old.createdAt) old.createdAt = new Date().toISOString();
    if (old.opponent && old.opponent.name) {
      data.preparations.unshift(old);
    }
    delete data.nextFightPrep;
    saveData(data);
  }
  return data.preparations;
}

function getActivePrep(data) {
  var preps = migratePreps(data);
  if (!activePrepId) return null;
  for (var i = 0; i < preps.length; i++) {
    if (preps[i].id === activePrepId) return preps[i];
  }
  return null;
}

function savePrepField(path, value) {
  var data = getData();
  if (!data) return;
  var prep = getActivePrep(data);
  if (!prep) return;
  var keys = path.split('.');
  var obj = prep;
  for (var i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  saveData(data);
}

function togglePrepCheck(path) {
  var data = getData();
  if (!data) return;
  var prep = getActivePrep(data);
  if (!prep) return;
  var keys = path.split('.');
  var obj = prep;
  for (var i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = !obj[keys[keys.length - 1]];
  saveData(data);
  renderFightsTab2Refresh();
}

function advancePrepStep(step) {
  var data = getData();
  if (!data) return;
  var prep = getActivePrep(data);
  if (!prep) return;
  prep.step = step;
  saveData(data);
  renderFightsTab2Refresh();
}

function deletePrep(id) {
  if (!confirm('Vorbereitung loeschen? Alle Eingaben gehen verloren.')) return;
  var data = getData();
  if (!data) return;
  migratePreps(data);
  data.preparations = data.preparations.filter(function(p) { return p.id !== id; });
  saveData(data);
  if (activePrepId === id) activePrepId = null;
  renderFightsTab2Refresh();
}

function resetPrep() {
  if (!activePrepId) return;
  deletePrep(activePrepId);
}

function createNewPrep() {
  var data = getData();
  if (!data) return;
  migratePreps(data);
  var newPrep = getDefaultPrep();
  data.preparations.unshift(newPrep);
  saveData(data);
  activePrepId = newPrep.id;
  renderFightsTab2Refresh();
}

function openPrep(id) {
  activePrepId = id;
  renderFightsTab2Refresh();
}

function backToOverview() {
  activePrepId = null;
  renderFightsTab2Refresh();
}

function completePrep() {
  var data = getData();
  if (!data) return;
  var prep = getActivePrep(data);
  if (!prep) return;
  prep.completed = true;
  prep.completedAt = new Date().toISOString();
  saveData(data);
  activePrepId = null;
  renderFightsTab2Refresh();
}

function reopenPrep(id) {
  var data = getData();
  if (!data) return;
  var preps = migratePreps(data);
  for (var i = 0; i < preps.length; i++) {
    if (preps[i].id === id) {
      preps[i].completed = false;
      preps[i].completedAt = null;
      break;
    }
  }
  saveData(data);
  activePrepId = id;
  renderFightsTab2Refresh();
}

function calcPrepReadiness(prep) {
  var opp = prep.opponent || {};
  var gp = prep.gameplan || {};
  var mc = prep.mentalChecklist || {};
  var pl = prep.packingList || {};
  var filledOpp = [opp.name, opp.stance, opp.type, opp.strengths, opp.weaknesses].filter(Boolean).length;
  var filledGP = [gp.r1, gp.r2, gp.r3, gp.planB, gp.combo1].filter(Boolean).length;
  var checkedMental = [mc.alterEgo, mc.triggerWords, mc.visualization, mc.breathing, mc.videoStudied, mc.comboDrilled].filter(Boolean).length;
  var checkedPack = ['mundschutz', 'bandagen', 'wettkampfpass', 'boxschuhe', 'kleidung', 'handtuch', 'wasser', 'essen', 'musik', 'seil'].filter(function(k) { return pl[k]; }).length;
  var total = filledOpp + filledGP + checkedMental + checkedPack;
  return { pct: Math.round(total / 26 * 100), opp: filledOpp, gp: filledGP, mental: checkedMental, pack: checkedPack };
}

function renderFightsTab2Refresh() {
  var el = document.getElementById('fights-tab2-content');
  if (el) el.innerHTML = renderPrepTabContent();
}

function renderPrepTabContent() {
  var data = getData();
  if (!data) return '';
  migratePreps(data);
  var preps = data.preparations || [];

  var cardStyle = 'background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:20px;margin-bottom:16px;';
  var headingStyle = 'font-family:"Bebas Neue",sans-serif;color:var(--white);letter-spacing:1px;';
  var btnPrimary = 'font-family:"Bebas Neue",sans-serif;font-size:16px;letter-spacing:2px;padding:12px 28px;background:var(--red);color:#fff;border:none;border-radius:var(--radius-sm);cursor:pointer;';

  // If a prep is open, show the wizard
  if (activePrepId) {
    return renderPrepWizard(data);
  }

  // === OVERVIEW ===
  var html = '';

  // New prep button
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">' +
    '<div>' +
      '<div style="' + headingStyle + 'font-size:24px;margin-bottom:4px;">VORBEREITUNGEN</div>' +
      '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#555;">Alle Kampfvorbereitungen auf einen Blick.</div>' +
    '</div>' +
    '<button style="' + btnPrimary + '" onclick="createNewPrep()">+ NEUE VORBEREITUNG</button>' +
  '</div>';

  if (preps.length === 0) {
    html += '<div style="' + cardStyle + 'text-align:center;padding:60px 20px;">' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:48px;color:#1a1a1a;margin-bottom:12px;">0</div>' +
      '<div style="font-family:\'DM Sans\',sans-serif;font-size:14px;color:#444;margin-bottom:24px;">Noch keine Vorbereitungen erstellt.</div>' +
      '<button style="' + btnPrimary + '" onclick="createNewPrep()">ERSTE VORBEREITUNG STARTEN</button>' +
    '</div>';
    return html;
  }

  // Active preps
  var active = preps.filter(function(p) { return !p.completed; });
  var completed = preps.filter(function(p) { return p.completed; });

  if (active.length > 0) {
    html += '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;letter-spacing:2px;margin-bottom:12px;">AKTIV (' + active.length + ')</div>';
    active.forEach(function(p) {
      html += renderPrepCard(p, data);
    });
  }

  if (completed.length > 0) {
    html += '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;letter-spacing:2px;margin-bottom:12px;margin-top:24px;">ABGESCHLOSSEN (' + completed.length + ')</div>';
    completed.forEach(function(p) {
      html += renderPrepCard(p, data);
    });
  }

  return html;
}

function renderPrepCard(prep, data) {
  var cardStyle = 'background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:20px;margin-bottom:12px;cursor:pointer;transition:border-color .2s;';
  var opp = prep.opponent || {};
  var r = calcPrepReadiness(prep);
  var readyColor = r.pct === 100 ? 'var(--green)' : r.pct >= 70 ? 'var(--gold)' : 'var(--red)';
  var title = opp.name || 'Unbekannter Gegner';
  var subtitle = [opp.club, opp.type, opp.stance].filter(Boolean).join(' \u2022 ');
  var dateStr = '';
  if (prep.createdAt) {
    var d = new Date(prep.createdAt);
    dateStr = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  var statusBorder = prep.completed ? 'var(--green)' : readyColor;
  var statusLabel = prep.completed ? 'ABGESCHLOSSEN' : 'SCHRITT ' + (prep.step || 1) + '/5';
  var statusColor = prep.completed ? 'var(--green)' : '#555';

  var html = '<div style="' + cardStyle + 'border-left:3px solid ' + statusBorder + ';" ';
  html += 'onmouseenter="this.style.borderColor=\'' + statusBorder + '\'" onmouseleave="this.style.borderColor=\'var(--surface-2)\';this.style.borderLeftColor=\'' + statusBorder + '\'">';

  html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
  html += '<div style="flex:1;cursor:pointer;" onclick="openPrep(\'' + prep.id + '\')">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">';
  html += '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:20px;color:var(--white);letter-spacing:1px;">' + title.replace(/</g, '&lt;') + '</div>';
  if (prep.completed) {
    html += '<span style="font-family:\'Space Mono\',monospace;font-size:9px;color:var(--green);border:1px solid var(--green);padding:2px 6px;border-radius:var(--radius-sm);letter-spacing:1px;">DONE</span>';
  }
  html += '</div>';
  if (subtitle) {
    html += '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#666;margin-bottom:10px;">' + subtitle.replace(/</g, '&lt;') + '</div>';
  }

  // Mini readiness bar
  html += '<div style="display:flex;align-items:center;gap:12px;">';
  html += '<div style="flex:1;max-width:200px;height:4px;background:var(--surface-1);border-radius:var(--radius-sm);overflow:hidden;"><div style="width:' + r.pct + '%;height:100%;background:' + readyColor + ';border-radius:var(--radius-sm);"></div></div>';
  html += '<span style="font-family:\'Space Mono\',monospace;font-size:11px;color:' + readyColor + ';">' + r.pct + '%</span>';
  html += '</div>';

  // Detail chips
  html += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">';
  var chips = [
    { label: 'GEGNER', val: r.opp, max: 5 },
    { label: 'GAMEPLAN', val: r.gp, max: 5 },
    { label: 'MENTAL', val: r.mental, max: 6 },
    { label: 'EQUIPMENT', val: r.pack, max: 10 }
  ];
  chips.forEach(function(c) {
    var done = c.val === c.max;
    html += '<span style="font-family:\'Space Mono\',monospace;font-size:9px;color:' + (done ? 'var(--green)' : '#444') + ';background:var(--surface-1);padding:3px 8px;border-radius:var(--radius-sm);letter-spacing:1px;">' + (done ? '\u2713 ' : '') + c.label + ' ' + c.val + '/' + c.max + '</span>';
  });
  html += '</div>';

  html += '</div>'; // close left side

  // Right side: date + actions
  html += '<div style="text-align:right;flex-shrink:0;margin-left:16px;">';
  html += '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:#333;margin-bottom:8px;">' + dateStr + '</div>';
  html += '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:' + statusColor + ';letter-spacing:1px;margin-bottom:12px;">' + statusLabel + '</div>';

  if (prep.completed) {
    html += '<button onclick="event.stopPropagation();reopenPrep(\'' + prep.id + '\')" style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;background:none;border:1px solid var(--surface-3);padding:4px 10px;border-radius:var(--radius-sm);cursor:pointer;margin-bottom:4px;display:block;width:100%;">BEARBEITEN</button>';
  }
  html += '<button onclick="event.stopPropagation();deletePrep(\'' + prep.id + '\')" style="font-family:\'Space Mono\',monospace;font-size:10px;color:#333;background:none;border:none;cursor:pointer;letter-spacing:1px;">LOESCHEN</button>';
  html += '</div>';

  html += '</div>'; // close flex row
  html += '</div>'; // close card

  return html;
}

function renderPrepWizard(data) {
  var prep = getActivePrep(data);
  if (!prep) { activePrepId = null; return renderPrepTabContent(); }

  var step = prep.step || 1;
  var fights = data.fights || [];

  var inputStyle = 'width:100%;padding:10px 12px;background:var(--surface-2);border:1px solid var(--surface-3);color:#fff;font-family:"DM Sans",sans-serif;font-size:13px;border-radius:var(--radius-sm);outline:none;box-sizing:border-box;';
  var textareaStyle = inputStyle + 'resize:vertical;min-height:80px;';
  var labelStyle = 'font-family:"Space Mono",monospace;font-size:10px;color:#555;letter-spacing:2px;margin-bottom:6px;display:block;';
  var headingStyle = 'font-family:"Bebas Neue",sans-serif;color:var(--white);letter-spacing:1px;';
  var cardStyle = 'background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:20px;margin-bottom:16px;';
  var btnPrimary = 'font-family:"Bebas Neue",sans-serif;font-size:16px;letter-spacing:2px;padding:12px 28px;background:var(--red);color:#fff;border:none;border-radius:var(--radius-sm);cursor:pointer;';
  var btnSecondary = 'font-family:"Space Mono",monospace;font-size:11px;letter-spacing:1px;padding:10px 20px;background:transparent;color:#555;border:1px solid var(--surface-3);border-radius:var(--radius-sm);cursor:pointer;';

  // Back to overview
  var oppName = (prep.opponent && prep.opponent.name) ? escapeHTML(prep.opponent.name) : 'Neue Vorbereitung';
  var backHTML = '<div style="margin-bottom:20px;">' +
    '<button onclick="backToOverview()" style="' + btnSecondary + 'padding:6px 14px;font-size:10px;">\u2190 ALLE VORBEREITUNGEN</button>' +
    '<div style="' + headingStyle + 'font-size:22px;margin-top:12px;">' + oppName.replace(/</g, '&lt;') + '</div>' +
  '</div>';

  // Progress bar
  var stepLabels = ['GEGNER', 'GAMEPLAN', 'MENTAL', 'EQUIPMENT', 'FIGHT DAY'];
  var progressHTML = '<div style="margin-bottom:32px;">';
  progressHTML += '<div style="display:flex;align-items:center;justify-content:center;gap:0;position:relative;max-width:500px;margin:0 auto 12px auto;">';
  for (var s = 1; s <= 5; s++) {
    var isCompleted = s < step;
    var isCurrent = s === step;
    var circleBg = isCompleted ? 'var(--red)' : (isCurrent ? 'transparent' : 'var(--surface-2)');
    var circleBorder = isCompleted ? 'var(--red)' : (isCurrent ? 'var(--red)' : '#333');
    var circleColor = isCompleted ? '#fff' : (isCurrent ? 'var(--red)' : '#555');
    if (s > 1) {
      var lineBg = s <= step ? 'var(--red)' : 'var(--surface-3)';
      progressHTML += '<div style="flex:1;height:2px;background:' + lineBg + ';"></div>';
    }
    progressHTML += '<div style="width:36px;height:36px;border-radius:50%;background:' + circleBg + ';border:2px solid ' + circleBorder + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;" onclick="advancePrepStep(' + s + ')">';
    if (isCompleted) {
      progressHTML += '<span style="color:#fff;font-size:14px;">\u2713</span>';
    } else {
      progressHTML += '<span style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:' + circleColor + ';">' + s + '</span>';
    }
    progressHTML += '</div>';
  }
  progressHTML += '</div>';
  progressHTML += '<div style="text-align:center;font-family:\'Space Mono\',monospace;font-size:10px;color:#444;letter-spacing:2px;">SCHRITT ' + step + ' VON 5 \u2014 ' + stepLabels[step - 1] + '</div>';
  progressHTML += '</div>';

  function navButtons(currentStep) {
    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding-top:16px;border-top:1px solid var(--surface-2);">';
    if (currentStep > 1) {
      html += '<button style="' + btnSecondary + '" onclick="advancePrepStep(' + (currentStep - 1) + ')">\u2190 ZUR\u00dcCK</button>';
    } else {
      html += '<div></div>';
    }
    if (currentStep < 5) {
      html += '<button style="' + btnPrimary + '" onclick="advancePrepStep(' + (currentStep + 1) + ')">WEITER \u2192</button>';
    } else {
      html += '<button style="' + btnPrimary + 'background:var(--green);" onclick="completePrep()">VORBEREITUNG ABSCHLIESSEN</button>';
    }
    html += '</div>';
    return html;
  }

  var contentHTML = '';

  // STEP 1: GEGNER-PROFIL
  if (step === 1) {
    var opp = prep.opponent || {};
    var typeHint = '';
    if (opp.type) {
      var typeRecord = { wins: 0, losses: 0, total: 0 };
      fights.forEach(function(f) {
        if ((f.type || '').toLowerCase() === opp.type.toLowerCase()) {
          typeRecord.total++;
          if (f.result === 'S') typeRecord.wins++;
          else if (f.result === 'N') typeRecord.losses++;
        }
      });
      if (typeRecord.total > 0) {
        typeHint = '<div style="' + cardStyle + 'background:#0c0c00;border-color:#332d00;margin-bottom:20px;">' +
          '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:var(--gold);letter-spacing:1px;">ERFAHRUNG VS. ' + opp.type.toUpperCase() + '</div>' +
          '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#888;margin-top:6px;">' + typeRecord.wins + ' Siege, ' + typeRecord.losses + ' Niederlagen aus ' + typeRecord.total + ' K\u00e4mpfen gegen diesen Gegnertyp.</div>' +
          '</div>';
      }
    }
    contentHTML = '<div style="' + headingStyle + 'font-size:24px;margin-bottom:4px;">GEGNER-PROFIL</div>' +
      '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#555;margin-bottom:20px;">Trage alle bekannten Infos \u00fcber deinen n\u00e4chsten Gegner ein.</div>' +
      typeHint +
      '<div style="' + cardStyle + '">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
          '<div><label style="' + labelStyle + '">NAME</label><input style="' + inputStyle + '" value="' + (opp.name || '').replace(/"/g, '&quot;') + '" oninput="savePrepField(\'opponent.name\', this.value)" placeholder="Gegner-Name"></div>' +
          '<div><label style="' + labelStyle + '">VEREIN</label><input style="' + inputStyle + '" value="' + (opp.club || '').replace(/"/g, '&quot;') + '" oninput="savePrepField(\'opponent.club\', this.value)" placeholder="Verein / Gym"></div>' +
          '<div><label style="' + labelStyle + '">AUSLAGE</label><select style="' + inputStyle + '" onchange="savePrepField(\'opponent.stance\', this.value)"><option value="">-- W\u00e4hlen --</option><option value="Orthodox"' + (opp.stance === 'Orthodox' ? ' selected' : '') + '>Orthodox</option><option value="Southpaw"' + (opp.stance === 'Southpaw' ? ' selected' : '') + '>Southpaw</option><option value="Switch"' + (opp.stance === 'Switch' ? ' selected' : '') + '>Switch</option></select></div>' +
          '<div><label style="' + labelStyle + '">TYP / STIL</label><select style="' + inputStyle + '" onchange="savePrepField(\'opponent.type\', this.value);renderFightsTab2Refresh()"><option value="">-- W\u00e4hlen --</option><option value="Boxer"' + (opp.type === 'Boxer' ? ' selected' : '') + '>Boxer (Distanz)</option><option value="Fighter"' + (opp.type === 'Fighter' ? ' selected' : '') + '>Fighter (Druck)</option><option value="Slugger"' + (opp.type === 'Slugger' ? ' selected' : '') + '>Slugger (Puncher)</option><option value="Swarmer"' + (opp.type === 'Swarmer' ? ' selected' : '') + '>Swarmer (Infight)</option><option value="Outboxer"' + (opp.type === 'Outboxer' ? ' selected' : '') + '>Outboxer</option></select></div>' +
          '<div><label style="' + labelStyle + '">GR\u00d6SSE (CM)</label><input type="number" style="' + inputStyle + '" value="' + (opp.height || '') + '" oninput="savePrepField(\'opponent.height\', this.value)" placeholder="z.B. 178"></div>' +
          '<div><label style="' + labelStyle + '">REICHWEITE (CM)</label><input type="number" style="' + inputStyle + '" value="' + (opp.reach || '') + '" oninput="savePrepField(\'opponent.reach\', this.value)" placeholder="z.B. 182"></div>' +
        '</div>' +
        '<div style="margin-top:16px;"><label style="' + labelStyle + '">ST\u00c4RKEN</label><textarea style="' + textareaStyle + '" oninput="savePrepField(\'opponent.strengths\', this.value)" placeholder="Was macht der Gegner gut?">' + (opp.strengths || '') + '</textarea></div>' +
        '<div style="margin-top:12px;"><label style="' + labelStyle + '">SCHW\u00c4CHEN</label><textarea style="' + textareaStyle + '" oninput="savePrepField(\'opponent.weaknesses\', this.value)" placeholder="Wo hat der Gegner L\u00fccken?">' + (opp.weaknesses || '') + '</textarea></div>' +
        '<div style="margin-top:12px;"><label style="' + labelStyle + '">VIDEO-LINK</label><input style="' + inputStyle + '" value="' + (opp.videoLink || '').replace(/"/g, '&quot;') + '" oninput="savePrepField(\'opponent.videoLink\', this.value)" placeholder="YouTube-Link zum Gegner"></div>' +
        '<div style="margin-top:12px;"><label style="' + labelStyle + '">NOTIZEN</label><textarea style="' + textareaStyle + '" oninput="savePrepField(\'opponent.notes\', this.value)" placeholder="Sonstige Infos...">' + escapeHTML(opp.notes) + '</textarea></div>' +
      '</div>' +
      navButtons(1);
  }

  // STEP 2: GAMEPLAN
  else if (step === 2) {
    var gp = prep.gameplan || {};
    contentHTML = '<div style="' + headingStyle + 'font-size:24px;margin-bottom:4px;">GAMEPLAN</div>' +
      '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#555;margin-bottom:20px;">Plane deine Strategie f\u00fcr jede Runde.</div>' +
      '<div style="' + cardStyle + '">' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;margin-bottom:16px;">RUNDEN-STRATEGIE</div>' +
        '<div style="margin-bottom:16px;"><label style="' + labelStyle + '">RUNDE 1 \u2014 ABTASTEN & DOMINIEREN</label><textarea style="' + textareaStyle + '" oninput="savePrepField(\'gameplan.r1\', this.value)" placeholder="Jab aufbauen, Rhythmus finden, Distanz kontrollieren...">' + (gp.r1 || '') + '</textarea></div>' +
        '<div style="margin-bottom:16px;"><label style="' + labelStyle + '">RUNDE 2 \u2014 TEMPO ERH\u00d6HEN</label><textarea style="' + textareaStyle + '" oninput="savePrepField(\'gameplan.r2\', this.value)" placeholder="Kombis starten, Schw\u00e4chen ausnutzen, Druck machen...">' + (gp.r2 || '') + '</textarea></div>' +
        '<div style="margin-bottom:16px;"><label style="' + labelStyle + '">RUNDE 3 \u2014 FINISH</label><textarea style="' + textareaStyle + '" oninput="savePrepField(\'gameplan.r3\', this.value)" placeholder="Alles geben, Ausg\u00e4nge dominieren, Ring abschneiden...">' + (gp.r3 || '') + '</textarea></div>' +
        '<div style="margin-bottom:16px;"><label style="' + labelStyle + '">PLAN B \u2014 WENN ES NICHT L\u00c4UFT</label><textarea style="' + textareaStyle + '" oninput="savePrepField(\'gameplan.planB\', this.value)" placeholder="Was tun wenn Plan A nicht funktioniert? Stilwechsel, Clinch, Konter...">' + (gp.planB || '') + '</textarea></div>' +
      '</div>' +
      '<div style="' + cardStyle + '">' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;margin-bottom:16px;">KEY COMBOS</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">' +
          '<div><label style="' + labelStyle + '">COMBO 1</label><input style="' + inputStyle + '" value="' + (gp.combo1 || '').replace(/"/g, '&quot;') + '" oninput="savePrepField(\'gameplan.combo1\', this.value)" placeholder="z.B. Jab-Cross-Hook"></div>' +
          '<div><label style="' + labelStyle + '">COMBO 2</label><input style="' + inputStyle + '" value="' + (gp.combo2 || '').replace(/"/g, '&quot;') + '" oninput="savePrepField(\'gameplan.combo2\', this.value)" placeholder="z.B. 1-2-Uppercut"></div>' +
          '<div><label style="' + labelStyle + '">COMBO 3</label><input style="' + inputStyle + '" value="' + (gp.combo3 || '').replace(/"/g, '&quot;') + '" oninput="savePrepField(\'gameplan.combo3\', this.value)" placeholder="z.B. Body-Head-Body"></div>' +
        '</div>' +
      '</div>' +
      navButtons(2);
  }

  // STEP 3: MENTAL PREP
  else if (step === 3) {
    var mc = prep.mentalChecklist || {};
    var tw = prep.triggerWords || {};
    var alterEgoName = (data.alterEgo && data.alterEgo.name) ? data.alterEgo.name : 'Alter Ego';
    var checkedCount = [mc.alterEgo, mc.triggerWords, mc.visualization, mc.breathing, mc.videoStudied, mc.comboDrilled].filter(Boolean).length;

    var checkItem = function(label, path, checked) {
      var boxStyle = 'width:20px;height:20px;border-radius:var(--radius-sm);border:2px solid ' + (checked ? 'var(--red)' : '#333') + ';background:' + (checked ? 'var(--red)' : 'transparent') + ';display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;';
      return '<div onclick="togglePrepCheck(\'' + path + '\')" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--surface-1);cursor:pointer;">' +
        '<div style="' + boxStyle + '">' + (checked ? '<span style="color:#fff;font-size:12px;">\u2713</span>' : '') + '</div>' +
        '<span style="font-family:\'DM Sans\',sans-serif;font-size:14px;color:' + (checked ? '#888' : '#555') + ';' + (checked ? 'text-decoration:line-through;' : '') + '">' + label + '</span>' +
      '</div>';
    };

    contentHTML = '<div style="' + headingStyle + 'font-size:24px;margin-bottom:4px;">MENTALE VORBEREITUNG</div>' +
      '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#555;margin-bottom:20px;">Mentale Checkliste \u2014 bereite deinen Kopf vor.</div>' +
      '<div style="' + cardStyle + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
          '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;">CHECKLISTE</div>' +
          '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:' + (checkedCount === 6 ? 'var(--green)' : 'var(--red)') + ';">' + checkedCount + '/6</div>' +
        '</div>' +
        '<div style="height:4px;background:var(--surface-1);border-radius:var(--radius-sm);margin-bottom:16px;overflow:hidden;"><div style="width:' + Math.round(checkedCount / 6 * 100) + '%;height:100%;background:' + (checkedCount === 6 ? 'var(--green)' : 'var(--red)') + ';border-radius:var(--radius-sm);transition:width .3s;"></div></div>' +
        checkItem('Alter Ego aktiviert \u2014 ' + alterEgoName, 'mentalChecklist.alterEgo', mc.alterEgo) +
        checkItem('Trigger-W\u00f6rter festgelegt', 'mentalChecklist.triggerWords', mc.triggerWords) +
        checkItem('Kampf visualisiert (3x durchgespielt)', 'mentalChecklist.visualization', mc.visualization) +
        checkItem('Atem\u00fcbung / Box-Breathing gemacht', 'mentalChecklist.breathing', mc.breathing) +
        checkItem('Gegner-Video studiert', 'mentalChecklist.videoStudied', mc.videoStudied) +
        checkItem('Key Combos gedrillt (mind. 50x)', 'mentalChecklist.comboDrilled', mc.comboDrilled) +
      '</div>' +
      '<div style="' + cardStyle + '">' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;margin-bottom:16px;">TRIGGER-W\u00d6RTER</div>' +
        '<div style="font-family:\'DM Sans\',sans-serif;font-size:12px;color:#555;margin-bottom:16px;">Kurze W\u00f6rter, die dich im Ring triggern \u2014 Technik, Motivation, Krisenmodus.</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">' +
          '<div><label style="' + labelStyle + '">TECHNIK</label><input style="' + inputStyle + '" value="' + (tw.technik || '').replace(/"/g, '&quot;') + '" oninput="savePrepField(\'triggerWords.technik\', this.value)" placeholder="z.B. JAB!"></div>' +
          '<div><label style="' + labelStyle + '">MOTIVATION</label><input style="' + inputStyle + '" value="' + (tw.motivation || '').replace(/"/g, '&quot;') + '" oninput="savePrepField(\'triggerWords.motivation\', this.value)" placeholder="z.B. KRIEG!"></div>' +
          '<div><label style="' + labelStyle + '">KRISEN</label><input style="' + inputStyle + '" value="' + (tw.krisen || '').replace(/"/g, '&quot;') + '" oninput="savePrepField(\'triggerWords.krisen\', this.value)" placeholder="z.B. ATMEN!"></div>' +
        '</div>' +
      '</div>' +
      navButtons(3);
  }

  // STEP 4: EQUIPMENT
  else if (step === 4) {
    var pl = prep.packingList || {};
    var packItems = [
      ['mundschutz', 'Mundschutz'],
      ['bandagen', 'Bandagen'],
      ['wettkampfpass', 'Wettkampfpass'],
      ['boxschuhe', 'Boxschuhe'],
      ['kleidung', 'Wettkampf-Kleidung'],
      ['handtuch', 'Handtuch'],
      ['wasser', 'Wasser / Getr\u00e4nke'],
      ['essen', 'Snacks / Verpflegung'],
      ['musik', 'Walkout-Musik / Kopfh\u00f6rer'],
      ['seil', 'Springseil / Aufw\u00e4rm-Equipment']
    ];
    var packedCount = packItems.filter(function(p) { return pl[p[0]]; }).length;

    contentHTML = '<div style="' + headingStyle + 'font-size:24px;margin-bottom:4px;">EQUIPMENT</div>' +
      '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#555;margin-bottom:20px;">Packliste \u2014 vergiss nichts am Kampftag.</div>' +
      '<div style="' + cardStyle + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
          '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;">PACKLISTE</div>' +
          '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:' + (packedCount === 10 ? 'var(--green)' : '#555') + ';">' + packedCount + '/10</div>' +
        '</div>' +
        '<div style="height:4px;background:var(--surface-1);border-radius:var(--radius-sm);margin-bottom:16px;overflow:hidden;"><div style="width:' + (packedCount * 10) + '%;height:100%;background:' + (packedCount === 10 ? 'var(--green)' : 'var(--blue)') + ';border-radius:var(--radius-sm);transition:width .3s;"></div></div>';

    packItems.forEach(function(item) {
      var key = item[0], label = item[1];
      var checked = !!pl[key];
      var boxStyle = 'width:20px;height:20px;border-radius:var(--radius-sm);border:2px solid ' + (checked ? 'var(--green)' : '#333') + ';background:' + (checked ? 'var(--green)' : 'transparent') + ';display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;';
      contentHTML += '<div onclick="togglePrepCheck(\'packingList.' + key + '\')" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--surface-1);cursor:pointer;">' +
        '<div style="' + boxStyle + '">' + (checked ? '<span style="color:#fff;font-size:12px;">\u2713</span>' : '') + '</div>' +
        '<span style="font-family:\'DM Sans\',sans-serif;font-size:14px;color:' + (checked ? 'var(--green)' : '#888') + ';' + (checked ? 'text-decoration:line-through;' : '') + '">' + label + '</span>' +
      '</div>';
    });

    contentHTML += '</div>' + navButtons(4);
  }

  // STEP 5: FIGHT DAY TIMELINE
  else if (step === 5) {
    var timeline = [
      { offset: 'X \u2212 4h', label: 'LETZTE MAHLZEIT', desc: 'Leicht verdaulich: Reis, Nudeln, Banane. Kein Fett, keine Ballaststoffe.' },
      { offset: 'X \u2212 3h', label: 'ANREISE', desc: 'Tasche gecheckt, Wettkampfpass dabei, Anfahrt geplant.' },
      { offset: 'X \u2212 2h', label: 'ANKUNFT & CHECK-IN', desc: 'Wiegen, Wettkampfpass abgeben, Halle kennenlernen.' },
      { offset: 'X \u2212 1h', label: 'MENTALE AKTIVIERUNG', desc: 'Musik an, Alter Ego aktivieren, Trigger-W\u00f6rter wiederholen, Visualisierung.' },
      { offset: 'X \u2212 30min', label: 'AUFW\u00c4RMEN', desc: 'Seilspringen, Schattenboxen, Pratzen (leicht), Schwitzen kommen.' },
      { offset: 'X \u2212 10min', label: 'BANDAGEN & HANDSCHUHE', desc: 'Bandagen anlegen, Handschuhe checken, Mundschutz rein.' },
      { offset: 'X \u2212 5min', label: 'LETZTE WORTE', desc: 'Trainer-Anweisungen, Gameplan nochmal durchgehen, Box-Breathing.' },
      { offset: 'X', label: 'KAMPF', desc: 'Gameplan umsetzen. Runde f\u00fcr Runde. Vertraue deiner Vorbereitung.' }
    ];

    contentHTML = '<div style="' + headingStyle + 'font-size:24px;margin-bottom:4px;">FIGHT DAY TIMELINE</div>' +
      '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#555;margin-bottom:24px;">Dein Fahrplan f\u00fcr den Kampftag. X = deine Kampfzeit.</div>' +
      '<div style="' + cardStyle + 'padding:24px 20px;">';

    timeline.forEach(function(t, i) {
      var isLast = i === timeline.length - 1;
      var dotColor = isLast ? 'var(--red)' : 'var(--white)';
      var dotSize = isLast ? '14px' : '10px';
      contentHTML += '<div style="display:flex;gap:16px;position:relative;' + (isLast ? '' : 'padding-bottom:28px;') + '">';
      if (!isLast) {
        contentHTML += '<div style="position:absolute;left:4px;top:14px;width:2px;height:calc(100% - 6px);background:var(--surface-2);"></div>';
      }
      contentHTML += '<div style="width:' + dotSize + ';height:' + dotSize + ';border-radius:50%;background:' + dotColor + ';flex-shrink:0;margin-top:4px;position:relative;z-index:1;"></div>';
      contentHTML += '<div style="flex:1;">';
      contentHTML += '<div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">';
      contentHTML += '<span style="font-family:\'Space Mono\',monospace;font-size:11px;color:' + (isLast ? 'var(--red)' : 'var(--gold)') + ';letter-spacing:1px;white-space:nowrap;">' + t.offset + '</span>';
      contentHTML += '<span style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;">' + t.label + '</span>';
      contentHTML += '</div>';
      contentHTML += '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#555;line-height:1.5;">' + t.desc + '</div>';
      contentHTML += '</div></div>';
    });

    contentHTML += '</div>';

    // Fight Day Notes
    contentHTML += '<div style="' + cardStyle + 'margin-top:16px;">' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;margin-bottom:12px;">EIGENE NOTIZEN</div>' +
      '<textarea style="' + textareaStyle + '" oninput="savePrepField(\'fightDayNotes\', this.value)" placeholder="Persoenliche Notizen fuer den Kampftag...">' + (prep.fightDayNotes || '') + '</textarea>' +
    '</div>';

    // Readiness Overview
    var r = calcPrepReadiness(prep);
    var readyColor = r.pct === 100 ? 'var(--green)' : r.pct >= 70 ? 'var(--gold)' : 'var(--red)';

    contentHTML += '<div style="' + cardStyle + 'margin-top:16px;border-color:' + readyColor + '30;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;">READINESS CHECK</div>' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:24px;color:' + readyColor + ';">' + r.pct + '%</div>' +
      '</div>' +
      '<div style="height:6px;background:var(--surface-1);border-radius:var(--radius-sm);overflow:hidden;margin-bottom:16px;"><div style="width:' + r.pct + '%;height:100%;background:' + readyColor + ';border-radius:var(--radius-sm);transition:width .3s;"></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:' + (r.opp >= 4 ? 'var(--green)' : '#555') + ';letter-spacing:1px;">' + (r.opp >= 4 ? '\u2713' : '\u25CB') + ' GEGNER ' + r.opp + '/5</div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:' + (r.gp >= 4 ? 'var(--green)' : '#555') + ';letter-spacing:1px;">' + (r.gp >= 4 ? '\u2713' : '\u25CB') + ' GAMEPLAN ' + r.gp + '/5</div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:' + (r.mental === 6 ? 'var(--green)' : '#555') + ';letter-spacing:1px;">' + (r.mental === 6 ? '\u2713' : '\u25CB') + ' MENTAL ' + r.mental + '/6</div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:' + (r.pack === 10 ? 'var(--green)' : '#555') + ';letter-spacing:1px;">' + (r.pack === 10 ? '\u2713' : '\u25CB') + ' EQUIPMENT ' + r.pack + '/10</div>' +
      '</div>' +
    '</div>';

    contentHTML += navButtons(5);
  }

  var deleteHTML = '<div style="text-align:center;margin-top:20px;">' +
    '<button onclick="deletePrep(\'' + prep.id + '\')" style="font-family:\'Space Mono\',monospace;font-size:10px;color:#333;background:none;border:none;cursor:pointer;letter-spacing:1px;">VORBEREITUNG L\u00d6SCHEN</button>' +
  '</div>';

  return backHTML + progressHTML + contentHTML + deleteHTML;
}

// ===== QUICK LOG (Dashboard) =====
function updateQlogSaeulen() {
  var el = document.getElementById('qlog-saeulen');
  if (!el) return;
  var type = document.getElementById('qlog-type').value;
  var saeulen = TYPE_SAEULEN[type] || [];
  var saeulenLabels = ['KRAFT','AUSDAUER','KOGNITION','ERNÄHRUNG','REGENERATION','RING IQ','MENTAL','MOBILITÄT'];
  var saeulenColors = ['#e8000d','#2979ff','#ab47bc','#4caf50','#ff6d00','#f5c518','#00bcd4','#8bc34a'];
  el.innerHTML = saeulen.map(function(si) {
    return '<span style="font-family:\'Space Mono\',monospace;font-size:8px;padding:2px 5px;border-radius:var(--radius-sm);background:' + saeulenColors[si] + '22;color:' + saeulenColors[si] + ';letter-spacing:0.5px;">' + saeulenLabels[si] + '</span>';
  }).join('');
}

function quickLog() {
  var data = getData();
  if (!data) return;
  if (!data.log) data.log = [];
  var type = document.getElementById('qlog-type').value;
  var duration = parseInt(document.getElementById('qlog-duration').value) || 0;
  var rpe = parseInt(document.getElementById('qlog-rpe').value) || 0;
  if (!duration) { var inp = document.getElementById('qlog-duration'); showFieldError(inp, 'Dauer eingeben!'); return; }
  var today = new Date().toISOString().split('T')[0];
  data.log.unshift({ date: today, type: type, duration: duration, rpe: rpe, weight: null, notes: '' });
  saveData(data);
  document.getElementById('qlog-duration').value = '';
  document.getElementById('qlog-rpe').value = '';
  var confirm = document.getElementById('qlog-confirm');
  var labels = { boxen:'Boxen', sparring:'Sparring', kraft:'Kraft', cardio:'Cardio', mobility:'Mobility' };
  confirm.textContent = '\u2713 ' + (labels[type] || type) + ' \u2014 ' + duration + ' Min.';
  confirm.style.display = 'block';
  setTimeout(function() { confirm.style.display = 'none'; }, 3000);
  renderRecentLog();
  renderDashStats();
  if (typeof renderLogEntries === 'function') renderLogEntries();
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
    var inp = document.getElementById('log-weight');
    showFieldError(inp, 'Gewicht muss zwischen 30 und 200 kg liegen.');
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
  if (!entry.date || !entry.duration) {
    // Highlight missing fields
    if (!entry.date) {
      showFieldError(document.getElementById('log-date'), 'Datum fehlt');
    }
    if (!entry.duration) {
      var durEl = document.getElementById('log-duration');
      showFieldError(durEl, 'Dauer eingeben');
      if (entry.date) durEl.focus();
    }
    if (!entry.date) document.getElementById('log-date').focus();
    // Shake the submit button
    var submitBtn = document.querySelector('#page-log .submit-btn');
    if (submitBtn) {
      submitBtn.classList.add('anim-shake');
      setTimeout(function() { submitBtn.classList.remove('anim-shake'); }, 400);
    }
    return;
  }
  data.log.unshift(entry);
  saveData(data);
  showToast('Training eingetragen');
  document.getElementById('log-duration').value = '';
  document.getElementById('log-rpe').value = '';
  document.getElementById('log-weight').value = '';
  document.getElementById('log-notes').value = '';
  renderLogEntries();
  renderDashStats();
  renderRecentLog();
  // Scroll to and highlight new entry
  setTimeout(function() {
    var firstEntry = document.querySelector('#log-entries .log-entry');
    if (firstEntry) {
      firstEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      firstEntry.style.transition = 'background .3s';
      firstEntry.style.background = 'rgba(0,200,83,.08)';
      setTimeout(function() { firstEntry.style.background = ''; }, 1500);
    }
  }, 100);
}

const TYPE_COLORS = { kraft: 'var(--red)', boxen: 'var(--red)', sparring: 'var(--gold)', cardio: 'var(--blue)', pratzen: 'var(--red)', technik: 'var(--red)', mobility: '#8bc34a' };
const TYPE_LABELS = { kraft: 'Kraft', boxen: 'Boxen', sparring: 'Sparring', cardio: 'Cardio', pratzen: 'Boxen', technik: 'Boxen', mobility: 'Mobility / Recovery' };
// Mapping: Training-Typ → welche Säulen werden trainiert
const TYPE_SAEULEN = {
  kraft:    [0],       // S1: Kraft
  boxen:    [0,2,5],   // S1: Kraft + S3: Kognition + S6: Ring IQ
  sparring: [0,1,2,5,6], // Kraft + Ausdauer + Kognition + Ring IQ + Mental
  cardio:   [1],       // S2: Metabolisch
  pratzen:  [0,2],     // Kraft + Kognition
  technik:  [2,5],     // Kognition + Ring IQ
  mobility: [7,4]      // S8: Mobilität + S5: Regeneration
};

function renderLogEntries() {
  const data = getData();
  if (!data) return;
  const el = document.getElementById('log-entries');
  if (!el) return;

  // Week stats
  var statsEl = document.getElementById('log-week-stats');
  if (statsEl && data.log) {
    var today = new Date(); today.setHours(0,0,0,0);
    var dow = today.getDay() === 0 ? 7 : today.getDay();
    var monday = new Date(today); monday.setDate(today.getDate() - (dow - 1));
    var monStr = monday.toISOString().split('T')[0];
    var weekLogs = data.log.filter(function(e) { return e.date >= monStr; });
    var weekSessions = weekLogs.length;
    var weekMin = weekLogs.reduce(function(s,e) { return s + (parseInt(e.duration) || 0); }, 0);
    var rpeVals = weekLogs.map(function(e) { return parseFloat(e.rpe); }).filter(function(v) { return v > 0; });
    var avgRpe = rpeVals.length ? Math.round(rpeVals.reduce(function(a,b){return a+b;},0) / rpeVals.length * 10) / 10 : 0;
    var rpeColor = avgRpe > 8 ? 'var(--red)' : avgRpe >= 6 ? 'var(--gold)' : 'var(--green)';
    statsEl.innerHTML = '<div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;">' +
      '<div style="flex:1;min-width:100px;padding:14px;background:var(--surface-1);border-radius:var(--radius-md);border-bottom:2px solid var(--red);">' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:var(--fs-xl);color:var(--white);">' + weekSessions + '</div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:var(--fs-xs);color:var(--text-muted);letter-spacing:1px;">SESSIONS</div>' +
      '</div>' +
      '<div style="flex:1;min-width:100px;padding:14px;background:var(--surface-1);border-radius:var(--radius-md);border-bottom:2px solid var(--blue);">' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:var(--fs-xl);color:var(--white);">' + weekMin + '</div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:var(--fs-xs);color:var(--text-muted);letter-spacing:1px;">MINUTEN</div>' +
      '</div>' +
      '<div style="flex:1;min-width:100px;padding:14px;background:var(--surface-1);border-radius:var(--radius-md);border-bottom:2px solid ' + rpeColor + ';">' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:var(--fs-xl);color:' + rpeColor + ';">' + (avgRpe || '\u2014') + '</div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:var(--fs-xs);color:var(--text-muted);letter-spacing:1px;">Ø RPE</div>' +
      '</div>' +
    '</div>';
  }

  // Empty state
  if (!data.log || !data.log.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px 16px;">' +
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:var(--fs-lg);color:var(--white);margin-bottom:6px;">NOCH KEINE EINHEITEN</div>' +
      '<div style="font-size:var(--fs-sm);color:var(--text-muted);margin-bottom:16px;">Trage dein erstes Training oben ein.</div>' +
      '<button onclick="document.querySelector(\'.log-form-card\').scrollIntoView({behavior:\'smooth\'})" style="font-family:\'Space Mono\',monospace;font-size:var(--fs-xs);color:var(--red);background:none;border:1px solid rgba(232,0,13,.3);padding:10px 24px;border-radius:var(--radius-md);cursor:pointer;">ERSTE SESSION EINTRAGEN</button>' +
    '</div>';
    return;
  }

  // Entries with type-colored border
  el.innerHTML = data.log.slice(0, 50).map((e, i) => {
    const d = new Date(e.date);
    const day = d.getDate();
    const month = d.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
    const color = TYPE_COLORS[e.type] || 'var(--grey)';
    return `<div class="log-entry-card" style="border-left:3px solid ${color};">
      <div><div class="log-entry-date">${day}</div><div class="log-entry-month">${month}</div></div>
      <div class="log-entry-body">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="font-family:'Space Mono',monospace;font-size:var(--fs-xs);color:${color};letter-spacing:1px;">${TYPE_LABELS[e.type] || e.type}</span>
          <span style="font-size:var(--fs-sm);color:var(--white);">${e.duration} Min.</span>
          ${e.rpe ? '<span style="font-family:\'Space Mono\',monospace;font-size:var(--fs-xs);color:var(--text-muted);">RPE ' + e.rpe + '</span>' : ''}
          ${e.weight ? '<span style="font-family:\'Space Mono\',monospace;font-size:var(--fs-xs);color:var(--text-muted);">' + e.weight + ' kg</span>' : ''}
        </div>
        ${e.notes ? `<div class="log-entry-notes">${escapeHTML(e.notes)}</div>` : ''}
      </div>
      <button class="delete-btn" onclick="deleteLog(${i})">×</button>
    </div>`;
  }).join('');
}

function deleteLog(i) {
  if (!confirm('Diesen Eintrag löschen?')) return;
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
  return {};
}

function generateSmartWeekPlan() {
  const s = getUserSchedule();
  const ws = s.weekSchedule;
  const data = getData();
  const plan = {};

  // ===== SÄULEN-ANALYSE: Schwächste Säulen identifizieren =====
  var pillarScores = {};
  try { if (data) pillarScores = calcProfileScores(data) || {}; } catch(e) { pillarScores = {}; }
  var pillarEntries = Object.entries(pillarScores).filter(function(e) { return e[1] !== null; });
  pillarEntries.sort(function(a, b) { return a[1] - b[1]; });
  // Schwache Säulen = Score unter 50%, oder die 2 schwächsten wenn alle > 50%
  var weakPillars = {};
  var weakInfo = [];
  if (pillarEntries.length >= 2) {
    pillarEntries.forEach(function(e) {
      if (e[1] < 50) { weakPillars[e[0]] = e[1]; weakInfo.push(e); }
    });
    // Mindestens die 2 schwächsten markieren, auch wenn > 50%
    if (weakInfo.length < 2) {
      weakPillars = {};
      weakInfo = pillarEntries.slice(0, 2);
      weakInfo.forEach(function(e) { weakPillars[e[0]] = e[1]; });
    }
  }
  var hasWeakKraft = weakPillars.kraft !== undefined;
  var hasWeakMetabol = weakPillars.metabol !== undefined;
  var hasWeakKognitiv = weakPillars.kognitiv !== undefined;
  var hasWeakErnaehr = weakPillars.ernaehr !== undefined;
  var hasWeakRecovery = weakPillars.recovery !== undefined;
  var hasWeakRingIQ = weakPillars.ringiQ !== undefined;
  var hasWeakPsyche = weakPillars.psyche !== undefined;
  var hasWeakMobil = weakPillars.mobil !== undefined;
  // Schwere Schwäche = unter 35%
  var criticalRecovery = weakPillars.recovery !== undefined && weakPillars.recovery < 35;
  // Speichere Schwächen-Info für UI-Rendering
  if (data) {
    data._weakPillars = weakPillars;
    data._weakInfo = weakInfo;
  }

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
    { title: 'S&C A – POWER: Trap Bar DL ' + dlIntensity + ' + Pull-Ups 3x5 + Med Ball Slams 3x6', hint: dlHint + ' + Face Pulls 3x15 als Warm-up', exercises: [{id:'trap-bar-deadlift',label:'Trap Bar DL'},{id:'weighted-pull-ups',label:'Pull-Ups 3x5'},{id:'med-ball-rotational-slams',label:'Med Ball Slams 3x6'}] },
    { title: 'S&C B – EXPLOSIVE: Power Clean 4x3 + Row 3x6 + Jump Squat 3x5 (' + Math.round(bw*0.35) + 'kg)', hint: 'Jump Squat Gewicht: 30-40% KG = ' + Math.round(bw*0.3) + '-' + Math.round(bw*0.4) + 'kg + Face Pulls 3x15', exercises: [{id:'hang-power-clean',label:'Power Clean 4x3'},{id:'bent-over-row',label:'Row 3x6'},{id:'jump-squat',label:'Jump Squat 3x5'}] },
    { title: 'S&C C – COMBAT: Landmine Press 3x5 + Cable Row 3x8 + Pallof Press 3x8', hint: 'Einarm-Drücken + Rudern + Rumpfstabi + Face Pulls 3x15', exercises: [{id:'landmine-press',label:'Landmine Press 3x5'},{id:'single-arm-cable-row',label:'Cable Row 3x8'},{id:'pallof-press-rotation',label:'Pallof Press 3x8'}] }
  ];
  let scIdx = 0;

  const TYPE_LABEL_MAP = {
    pa: 'Partnerarbeit', pratzen: 'Pratzenarbeit', sparring: 'Sparring',
    technik: 'Techniktraining', boxen: 'Boxtraining', cardio: 'Cardio'
  };

  // Erfahrungslevel + Gym-Anpassung
  var expLevel = s.experienceLevel || 'fortgeschritten';
  var gym = s.gymAccess || 'none';
  var bw = parseInt(s.weight) || 75;
  var isAnfaenger = expLevel === 'anfaenger';
  // Cardio
  var cardioMin = isAnfaenger ? 20 : 35;
  var cardioMax = isAnfaenger ? 30 : 50;
  var cardioLabel = cardioMin + '-' + cardioMax + ' Min.';
  // S&C
  var dlIntensity = isAnfaenger ? '4x5 @70%' : '4x3 @85%';
  var dlHint = isAnfaenger ? 'Technik lernen, Gewicht langsam steigern' : 'Schwer, aber sauber – kein Muskelversagen';
  var canHIIT = !isAnfaenger;
  var hiitCount = 0;
  // S&C Frequenz: Anfaenger max 2x/Woche, Fortgeschritten max 3x
  var maxSC = isAnfaenger ? 2 : 3;
  var scCount = 0;
  // Sparring-Tage tracken fuer Recovery am naechsten Tag
  var sparringDayIndices = [];
  DAY_NAMES.forEach(function(day, di) {
    if ((ws[day] || {}).type === 'sparring') sparringDayIndices.push(di);
  });

  // Bodyweight S&C – Anfaenger vs Fortgeschritten
  var bwSessions = isAnfaenger ? [
    { title: 'Koerpergewicht A: Oberkörper', hint: '3x Knie-Liegestuetze (oder normale wenn du 10+ schaffst), 3x Schraegzuege am Tisch, 3x20s Plank. Ziel: Kraft aufbauen damit deine Schlaege sitzen.', exercises: [] },
    { title: 'Koerpergewicht B: Beine + Core', hint: '3x15 Kniebeugen, 3x10 Ausfallschritte je Seite, 3x10 Beinheben liegend. Ziel: Stabilere Beinarbeit im Ring.', exercises: [] },
    { title: 'Koerpergewicht C: Ganzkörper', hint: '3x10 Liegestuetze, 3x15 Kniebeugen, 3x20s Seitstütz je Seite. Ziel: Grundkraft fuer alle Bewegungen im Ring.', exercises: [] }
  ] : [
    { title: 'Koerpergewicht A: Push + Core', hint: '4x max Liegestuetze, 4x max Klimmzuege (Tuerrahmen/Spielplatz), 3x30s Plank, 3x10 Beinheben. Staerkt Schlagkraft und Clinch.', exercises: [] },
    { title: 'Koerpergewicht B: Beine + Explosivitaet', hint: '4x20 Kniebeugen, 3x12 Ausfallschritte je Seite, 4x max Dips (Stuhl/Bank). Staerkere Beine = mehr Power.', exercises: [] },
    { title: 'Koerpergewicht C: Explosiv', hint: '4x5 Sprungkniebeugen, 4x5 explosive Liegestuetze, 3x10 Beinheben. Schnellkraft fuer explosive Schlaege.', exercises: [{id:'jump-squat',label:'Jump Squat'},{id:'explosive-pushup',label:'Explosive Push-Up'}] }
  ];

  // IMT-Label je nach Geraet
  var imtTitle = gym !== 'none' ? 'IMT – 30 Atemzuege' : 'Atemuebung – 30 tiefe Atemzuege durch die Nase';
  var imtHint = gym !== 'none' ? 'PowerBreathe oder aehnliches Geraet, progressiver Widerstand' : 'Langsam durch die Nase einatmen (4 Sek.), kurz halten, langsam ausatmen (6 Sek.). Kein Geraet noetig.';

  // Nacken nur fuer Fortgeschritten+
  var doNacken = !isAnfaenger;

  // Ruhetag-Varianten (rotieren)
  var restDayVariants = [
    { title: 'Ruhetag: Spaziergang + Dehnung', hint: '20-30 Min. lockerer Spaziergang draussen + 10 Min. Dehnung. Koerper erholen lassen.' },
    { title: 'Ruhetag: Leichtes Schwimmen oder Radfahren', hint: '20-30 Min. locker, kein Leistungsdruck. Gut fuer Gelenke und Durchblutung.' },
    { title: 'Ruhetag: Yoga / Mobility Flow', hint: '15-20 Min. fliessende Dehnuebungen. YouTube: "Yoga fuer Kampfsportler" als Anleitung.' },
    { title: 'Kompletter Ruhetag', hint: 'Heute nichts. Schlaf, Essen, Erholung. Dein Koerper wird im Schlaf staerker, nicht im Training.' }
  ];
  var restIdx = 0;

  // 4-Wochen-Progression (1=Build, 2=Build+, 3=Peak, 4=Deload)
  var weekNum = 1;
  if (data && data.weekPlanGenerated) {
    var weeksSince = Math.floor((Date.now() - new Date(data.weekPlanGenerated).getTime()) / (7*86400000));
    weekNum = (weeksSince % 4) + 1;
  }
  var volumeMult = weekNum === 4 ? 0.6 : weekNum === 3 ? 1.1 : 1.0;
  // Säulen-Anpassung: Bei schwacher Recovery Volumen reduzieren
  if (criticalRecovery && weekNum !== 4) volumeMult *= 0.85;
  var weekLabel = weekNum === 1 ? 'AUFBAU' : weekNum === 2 ? 'AUFBAU+' : weekNum === 3 ? 'PEAK' : 'DELOAD';

  // Säulen-Anpassung: Bei schwacher Ausdauer mehr HIIT erlauben
  var maxHIIT = (hasWeakMetabol && canHIIT) ? 3 : 2;

  // Motivations-Hints pro Block-Typ
  var whyHints = {
    strength: 'Kraft aufbauen \u2192 haertere Schlaege + stabilerer Clinch',
    cardio: 'Kondition verbessern \u2192 in Runde 3 noch Druck machen',
    recovery: 'Erholung \u2192 du wirst im Schlaf staerker, nicht im Training',
    boxing: 'Vereinstraining \u2192 dein Trainer gibt den Inhalt vor'
  };

  // ===== COMPLETION-FEEDBACK: Letzte Woche auswerten =====
  var lastWeek = data ? data.lastWeekCompletion : null;
  var feedbackAdjustments = {};
  var fightSoon = false;
  if (data && data.fightDate) {
    var fightDiff = Math.ceil((new Date(data.fightDate + 'T00:00:00') - new Date()) / 86400000);
    fightSoon = fightDiff <= 5 && fightDiff >= 0;
  }

  if (lastWeek && !fightSoon && weekNum !== 4) {
    // Volumen-Anpassung
    if (lastWeek.completionRate < 0.5) {
      volumeMult *= 0.80;
      feedbackAdjustments.volumeReduced = true;
      feedbackAdjustments.volumeReason = 'Nur ' + Math.round(lastWeek.completionRate * 100) + '% geschafft – Plan war zu voll';
    } else if (lastWeek.completionRate < 0.7) {
      volumeMult *= 0.90;
      feedbackAdjustments.volumeReduced = true;
      feedbackAdjustments.volumeReason = Math.round(lastWeek.completionRate * 100) + '% geschafft – leicht reduziert';
    } else if (lastWeek.completionRate > 0.9 && lastWeek.avgRPE < 7 && lastWeek.avgRPE > 0) {
      volumeMult *= 1.10;
      feedbackAdjustments.volumeIncreased = true;
      feedbackAdjustments.volumeReason = Math.round(lastWeek.completionRate * 100) + '% bei RPE ' + lastWeek.avgRPE + ' – kannst mehr';
    }

    // Typ-spezifisch
    feedbackAdjustments.typeNotes = [];
    var bt = lastWeek.byType || {};
    if (bt.cardio && bt.cardio.planned > 0 && bt.cardio.done / bt.cardio.planned < 0.4) {
      cardioMin = Math.max(15, Math.round(cardioMin * 0.8));
      cardioMax = Math.max(20, Math.round(cardioMax * 0.8));
      cardioLabel = cardioMin + '-' + cardioMax + ' Min.';
      feedbackAdjustments.typeNotes.push('Cardio gekuerzt (nur ' + bt.cardio.done + '/' + bt.cardio.planned + ' geschafft)');
    }
    if (bt.strength && bt.strength.planned > 0 && bt.strength.done / bt.strength.planned > 0.9) {
      feedbackAdjustments.strengthProgression = true;
      feedbackAdjustments.typeNotes.push('Kraft-Progression! Gewicht um 2.5-5kg steigern');
    }
    if (bt.recovery && bt.recovery.planned > 0 && bt.recovery.done / bt.recovery.planned < 0.3) {
      feedbackAdjustments.typeNotes.push('Recovery vereinfacht (nur ' + bt.recovery.done + '/' + bt.recovery.planned + ' geschafft)');
    }

    // Versaeumte Saeulen
    if (lastWeek.missedSaeulen && lastWeek.missedSaeulen.length > 0) {
      feedbackAdjustments.missedSaeulen = lastWeek.missedSaeulen;
    }

    // RPE-Feedback
    if (lastWeek.avgRPE > 8.5) {
      feedbackAdjustments.rpeWarning = 'RPE ' + lastWeek.avgRPE + ' – Uebertrainings-Risiko, Volumen reduziert';
      volumeMult *= 0.90;
    } else if (lastWeek.avgRPE > 0 && lastWeek.avgRPE < 5) {
      feedbackAdjustments.rpeLow = 'RPE ' + lastWeek.avgRPE + ' – Intensitaet steigern';
    }
  }

  // Speichere fuer UI
  if (data) data._feedbackAdjustments = feedbackAdjustments;
  if (data) data._lastWeekRate = lastWeek ? lastWeek.completionRate : null;

  DAY_NAMES.forEach((day, di) => {
    const d = ws[day] || { time: null, type: 'frei' };
    const nextDay = ws[DAY_NAMES[(di + 1) % 7]] || { time: null, type: 'frei' };
    const prevDayIdx = (di + 6) % 7;
    const prevWasSparring = sparringDayIndices.indexOf(prevDayIdx) !== -1;
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
    // KAMPFTAG – Fight day (alles relativ zur Kampfzeit)
    // =============================================
    if (phase === 'kampftag') {
      const fightTime = d.time || '18:00';
      blocks.push({ time: timeBefore(fightTime, 4, 0), title: 'Letzte grosse Mahlzeit (KH-Loading)', hint: 'Reis, Nudeln, Kartoffeln – Glykogenspeicher fuer den Kampf fuellen', type: 'meta' });
      blocks.push({ time: timeBefore(fightTime, 1, 0), title: 'PAPE Warm-Up: Squats 3x3 → 10 Min. Pause → Jump Squats', hint: 'Schwere Kniebeugen aktivieren das Nervensystem, nach Pause dann explosive Spruenge', type: 'strength',
        exercises: [{id:'jump-squat',label:'Jump Squats'}] });
      blocks.push({ time: timeBefore(fightTime, 0, 20), title: 'Shadow Boxing + Pratzen + Box-Breathing', type: 'boxing',
        exercises: [{id:'shadow-boxing',label:'Shadow Boxing'}] });
      blocks.push({ time: fightTime, title: '🥊 KAMPF', type: 'fight' });
      blocks.push({ time: timeAdd(fightTime, 1, 0), title: 'Post-Kampf: Protein + KH + Elektrolyte', hint: 'Eiweiss + Kohlenhydrate + Wasser mit Salz zur Regeneration', type: 'recovery' });

    // =============================================
    // KAMPF-MODUS – 1–2 Tage vor Kampf
    // =============================================
    } else if (phase === 'kampfmodus') {
      blocks.push({ time: isWeekend ? '08:00' : morningTime, title: imtTitle + ' (leicht)', hint: imtHint, type: 'meta',
        exercises: [{id:'imt',label:'IMT'}] });
      blocks.push({ time: isWeekend ? '08:15' : timeAdd(morningTime, 0, 10), title: 'Leichte Mobility 15 Min.', hint: 'Hueften, Schultern, T-Spine – locker bleiben', type: 'recovery',
        exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'shoulder-dislocates',label:'Shoulder Dislocates'}] });
      blocks.push({ time: isWeekend ? '11:00' : timeAdd(s.workEnd, 0, 30), title: 'Shadow Boxing 2 Runden + Gameplan', hint: 'Locker, Kombis visualisieren, Distanzgefuehl schaerfen', type: 'boxing',
        exercises: [{id:'shadow-boxing',label:'Shadow Boxing'}] });
      blocks.push({ time: '21:00', title: 'Visualisierung + Box-Breathing', hint: '10 Min. Kampf mental durchgehen, 4-4-4-4 Atmung, frueh schlafen', type: 'recovery' });

    // =============================================
    // SCHÄRFEN – 3–4 Tage vor Kampf
    // =============================================
    } else if (phase === 'schaerfen') {
      blocks.push({ time: isWeekend ? '08:00' : morningTime, title: imtTitle, hint: imtHint, type: 'meta',
        exercises: [{id:'imt',label:'IMT'}] });

      if (isSparringDay) {
        blocks.push({ time: timeBefore(d.time, 0, 15), title: 'Vor dem Verein: Aufwaermen', hint: 'Seilspringen + Schultern mobilisieren – kein schweres S&C vor Sparring', type: 'boxing' });
        blocks.push({ time: d.time, title: 'Taktisches Sparring (-30% Volumen)', hint: 'Weniger Runden, voller Fokus auf Gameplan', type: 'boxing' });
        blocks.push({ time: timeAdd(d.time, 1, 30), title: 'Dehnung + Foam Rolling 15 Min.', type: 'recovery',
          exercises: [{id:'hip-cars',label:'Hip CARs'}] });
      } else if (isBoxingDay) {
        blocks.push({ time: isWeekend ? '08:15' : timeAdd(morningTime, 0, 10), title: 'Explosive Reize: 3x3 Jump Squats', hint: 'Nervensystem aktivieren – kein Muskelversagen!', type: 'strength',
          exercises: [{id:'jump-squat',label:'Jump Squat'}] });
        blocks.push({ time: timeBefore(d.time, 0, 15), title: 'Vor dem Verein: Aufwaermen + Face Pulls', hint: '3 Min. Seil, Face Pulls 3x15 mit Band, Schultern + Hueften mobilisieren', type: 'boxing' });
        blocks.push({ time: d.time, title: trainingLabel + ' (hohe Intensitaet)', hint: 'Volumen reduziert, Schaerfe und Timing schleifen', type: 'boxing' });
      } else {
        blocks.push({ time: isWeekend ? '08:15' : timeAdd(morningTime, 0, 10), title: 'Explosive Reize: Jump Squats + Lateral Bounds', hint: 'Kurz und knackig – Nervensystem wach halten', type: 'strength',
          exercises: [{id:'jump-squat',label:'Jump Squat'},{id:'lateral-bounds',label:'Lateral Bounds'}] });
        blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 0, 30), title: 'Zone 2 Cardio 20-30 Min.', hint: 'Lockeres Laufen oder Radfahren bei Puls 120-140', type: 'cardio',
          exercises: [{id:'zone2',label:'Zone 2'}] });
      }
      blocks.push({ time: isWeekend ? '17:00' : timeAdd(s.workEnd, 1, 30), title: 'Mobility 15 Min.', type: 'recovery',
        exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'ankle-mobility',label:'Ankle Mobility'}] });

    // =============================================
    // RECOVERY – Nach dem Kampf
    // =============================================
    } else if (phase === 'recovery') {
      blocks.push({ time: isWeekend ? '09:00' : morningTime, title: imtTitle + ' (leicht)', hint: imtHint, type: 'meta',
        exercises: [{id:'imt',label:'IMT'}] });
      blocks.push({ time: isWeekend ? '09:15' : timeAdd(morningTime, 0, 10), title: 'Sanfte Mobility 15 Min.', hint: 'Lockeres Dehnen, kein Krafttraining – Koerper erholen lassen', type: 'recovery',
        exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'shoulder-dislocates',label:'Shoulder Dislocates'}] });
      blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 0, 30), title: 'Zone 2 Cardio 20 Min.', hint: 'Lockeres Laufen oder Radfahren bei Puls 120-140 – foerdert Regeneration', type: 'cardio',
        exercises: [{id:'zone2',label:'Zone 2'}] });

    // =============================================
    // NORMALES TRAINING – 5+ Tage vor Kampf
    // =============================================
    } else {
      // --- MORGENS (alle Tage) ---
      blocks.push({ time: isWeekend ? '08:00' : morningTime, title: imtTitle, hint: imtHint, type: 'meta',
        exercises: [{id:'imt',label:'IMT'}] });

      if (isSparringDay) {
        // SPARRING-TAG: Kein schweres S&C, leicht halten
        blocks.push({ time: timeBefore(d.time, 0, 20), title: 'Vor dem Verein: Aufwaermen', hint: '5 Min. Seil, Schultern + Hueften mobilisieren, locker warmwerden', type: 'boxing',
          exercises: [{id:'shadow-boxing',label:'Shadow Boxing'}] });
        blocks.push({ time: d.time, title: 'Sparring im Verein', hint: 'Kein schweres S&C heute – dein Koerper braucht alles fuers Sparring', type: 'boxing' });
        blocks.push({ time: timeAdd(d.time, 1, 30), title: 'Nach dem Verein: Dehnung + Foam Rolling', hint: 'Hueftbeuger, Schultern, Nacken – nach Sparring besonders wichtig', type: 'recovery',
          exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'ankle-mobility',label:'Ankle Mobility'}] });

      } else if (isBoxingDay) {
        // BOXTAG: Morgens leichtes S&C (je nach Gym), abends Verein
        var nackenEx = hasNacken ? [{id:'iso-nacken',label:'Iso Nacken'},{id:'nacken-flexion',label:'Nacken Flexion'}] : [];
        if (gym === 'none') {
          // Kein Gym: Morgens Liegestuetze + Core + evtl. Nacken
          blocks.push({ time: timeAdd(isWeekend ? '08:10' : morningTime, 0, 10), title: 'Morgens: Liegestuetze + Core 15 Min.', hint: (isAnfaenger ? '3x Knie-Liegestuetze (oder normale), 3x20s Plank, 3x10 Beinheben' : '3x max Liegestuetze, 3x30s Plank, 3x10 Beinheben') + '. ' + whyHints.strength, type: 'strength',
            exercises: hasNacken ? nackenEx : [] });
        } else if (hasNacken && doNacken) {
          blocks.push({ time: timeAdd(isWeekend ? '08:10' : morningTime, 0, 10), title: 'Overcoming Isometrics + Nacken (~20 Min.)', hint: 'Max. Kraft gegen unbeweglichen Widerstand + Nackentraining zur KO-Praevention', type: 'strength',
            exercises: [{id:'overcoming-iso',label:'Overcoming Iso'}, ...nackenEx] });
        }
        // Training-Typ-spezifische Hints + Säulen-Anpassung
        var boxHint = 'Vereinstraining – dein Trainer gibt den Inhalt vor';
        // Kognitions- und Ring-IQ-Schwäche: Taktische Fokus-Hinweise
        if (hasWeakKognitiv) boxHint += '. [FOKUS KOGNITION] Bewusst auf Blickverhalten achten: Brustbereich des Gegners fixieren, peripher Schlaege erkennen.';
        if (hasWeakRingIQ) boxHint += '. [FOKUS RING IQ] Heute gezielt Distanzkontrolle ueben: Jab als Masstab, nach jeder Kombi Winkel wechseln.';
        // IMT 2. Session (mittags – Saeulen sagen 2x taeglich)
        if (!isWeekend) {
          blocks.push({ time: timeAdd(lunchTime, 0, 25), title: 'IMT – 30 Atemzuege (2. Session)', hint: '2x taeglich laut Protokoll – progressiver Widerstand alle 2 Wochen', type: 'meta',
            exercises: [{id:'imt',label:'IMT'}] });
        }
        blocks.push({ time: timeBefore(d.time, 0, 15), title: 'Vor dem Verein: Aufwaermen + Face Pulls', hint: '3 Min. Seil, Face Pulls 3x15 mit Band, Schultern mobilisieren', type: 'boxing' });
        blocks.push({ time: d.time, title: trainingLabel, hint: boxHint, type: 'boxing' });
        blocks.push({ time: timeAdd(d.time, 1, 30), title: 'Nach dem Verein: Dehnung + Handpflege', hint: 'Stretching: Hueftbeuger, Schultern + Handgelenke kreisen, Finger dehnen', type: 'recovery',
          exercises: [{id:'hip-cars',label:'Hip CARs'}] });
        // Säulen-Booster auf Boxtagen (abends)
        if (hasWeakPsyche) {
          blocks.push({ time: timeAdd(d.time, 2, 30), title: 'Visualisierung 10 Min.', hint: '[SCHWAECHE MENTAL] Nach dem Training: Augen schliessen, beste Momente des Trainings nochmal durchgehen. Erfolgreiche Kombis verankern.', type: 'meta' });
        }
        if (hasWeakErnaehr) {
          blocks.push({ time: timeAdd(d.time, 2, 0), title: 'Post-Training Ernaehrung', hint: '[SCHWAECHE ERNAEHRUNG] Jetzt Protein + KH: 30-40g Protein + schnelle Kohlenhydrate innerhalb 30 Min. nach Training. Beispiel: Shake + Banane.', type: 'meta' });
        }

      } else if (isFreeDay) {
        if (prevWasSparring) {
          // Tag NACH Sparring: Erholung, kein S&C
          blocks.push({ time: isWeekend ? '09:00' : timeAdd(morningTime, 0, 10), title: 'Erholungstag nach Sparring', hint: 'Kein schweres Training – Koerper und Kopf regenerieren' + (hasWeakRecovery ? '. [SCHWAECHE REGENERATION] Heute Schlaf priorisieren: Ziel 8-9h. Kein Bildschirm 1h vor Bett.' : ''), type: 'recovery' });
          blocks.push({ time: isWeekend ? '10:00' : timeAdd(morningTime, 0, 30), title: hasWeakMobil ? 'Erweiterte Mobility 25 Min.' : 'Leichte Mobility 15 Min.', hint: (hasWeakMobil ? '[SCHWAECHE MOBILITAET] Laengere Session: ' : '') + 'Locker dehnen, Foam Rolling wenn verfuegbar', type: 'recovery',
            exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'shoulder-dislocates',label:'Shoulder Dislocates'}] });
          blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 0, 30), title: 'Zone 2 Cardio 20-30 Min.', hint: 'Lockeres Laufen oder Spaziergang – foerdert Regeneration', type: 'cardio',
            exercises: [{id:'zone2',label:'Zone 2'}] });
        } else if (nextIsSparring) {
          // Tag VOR Sparring: leicht halten
          blocks.push({ time: isWeekend ? '09:00' : timeAdd(morningTime, 0, 10), title: 'Leichte Mobility 15 Min.', hint: 'Morgen ist Sparring – heute Koerper schonen, frueh schlafen', type: 'recovery',
            exercises: [{id:'hip-cars',label:'Hip CARs'},{id:'shoulder-dislocates',label:'Shoulder Dislocates'}] });
          blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 0, 30), title: 'Zone 2 Cardio 30 Min.', hint: 'Lockeres Laufen oder Radfahren bei Puls 120-140', type: 'cardio',
            exercises: [{id:'zone2',label:'Zone 2'}] });
        } else if (scCount < maxSC) {
          // Normaler freier Tag: S&C (je nach Gym-Zugang) + Cardio
          scCount++;
          var scTime = isWeekend ? '09:00' : timeAdd(morningTime, 0, 10);
          var weekHint = weekNum === 4 ? ' [DELOAD: Halbes Volumen, gleiche Technik]' : weekNum === 3 ? ' [PEAK: Volle Intensitaet, weniger Saetze]' : '';
          if (feedbackAdjustments.strengthProgression) weekHint += ' [STEIGERE GEWICHT: +2.5-5kg]';
          if (feedbackAdjustments.volumeReduced) weekHint += ' [ANGEPASST: Weniger Volumen]';
          if (hasWeakKraft) weekHint += ' [FOKUS KRAFT: Deine Schlagkraft-Basis ist schwach – heute sauber und schwer arbeiten]';
          if (gym === 'full') {
            var sc = scSessions[scIdx % scSessions.length]; scIdx++;
            blocks.push({ time: scTime, title: sc.title, hint: sc.hint + weekHint, type: 'strength', exercises: sc.exercises });
          } else if (gym === 'basic') {
            var sc = scSessions[scIdx % scSessions.length]; scIdx++;
            blocks.push({ time: scTime, title: sc.title, hint: sc.hint + ' (Alternative mit Kurzhanteln)' + weekHint, type: 'strength', exercises: sc.exercises });
          } else {
            var bwS = bwSessions[scIdx % bwSessions.length]; scIdx++;
            blocks.push({ time: scTime, title: bwS.title, hint: bwS.hint + weekHint, type: 'strength', exercises: bwS.exercises });
          }
          if (hasNacken && doNacken) {
            blocks.push({ time: timeAdd(scTime, 0, 45), title: 'Nackentraining 10 Min.', hint: 'Isometrisch: Stirn, Hinterkopf, Seiten – je 3x10 Sek. halten', type: 'strength',
              exercises: [{id:'iso-nacken',label:'Iso Nacken'},{id:'nacken-flexion',label:'Nacken Flexion'}] });
          }
          // Cardio-Auswahl: Bei schwacher Ausdauer aggressiver (mehr HIIT)
          if (canHIIT && hiitCount === 0) {
            hiitCount++;
            blocks.push({ time: isWeekend ? '15:00' : timeAdd(s.workEnd, 0, 30), title: 'HIIT 4x4 Protokoll', hint: '4x4 Min. bei 90-95% Puls, 3 Min. aktive Pause, danach 10 Min. Cool-down' + (hasWeakMetabol ? ' [FOKUS: Ausdauer ist deine Schwaeche]' : ''), type: 'cardio',
              exercises: [{id:'hiit-4x4',label:'HIIT 4x4'}] });
          } else if (canHIIT && hiitCount < maxHIIT) {
            hiitCount++;
            blocks.push({ time: isWeekend ? '15:00' : timeAdd(s.workEnd, 0, 30), title: 'SIT – Sprint Intervalle', hint: '8-10x 30 Sek. All-Out-Sprint, 3-4 Min. Pause. Nie vor Sparring!' + (hasWeakMetabol ? ' [FOKUS: Ausdauer-Defizit beheben]' : ''), type: 'cardio',
              exercises: [{id:'sit-sprints',label:'SIT Sprints'}] });
          } else {
            blocks.push({ time: isWeekend ? '15:00' : timeAdd(s.workEnd, 0, 30), title: 'Zone 2 Cardio ' + cardioLabel, hint: 'Lockeres Laufen oder Radfahren bei Puls 120-140 (min. 30 Min. fuer volle Wirkung)', type: 'cardio',
              exercises: [{id:'zone2',label:'Zone 2'}] });
          }
          // Säulen-Booster: Extra-Block fuer schwache Säulen auf freien S&C-Tagen
          if (hasWeakPsyche) {
            blocks.push({ time: isWeekend ? '20:00' : timeAdd(s.workEnd, 2, 30), title: 'Visualisierung + Box-Breathing 10 Min.', hint: '[SCHWAECHE MENTAL] Kampf mental durchgehen: Einstieg, erste Kombi, Druck machen. 4-4-4-4 Atmung zum Abschluss.', type: 'meta' });
          }
          if (hasWeakKognitiv) {
            blocks.push({ time: isWeekend ? '16:00' : timeAdd(s.workEnd, 1, 0), title: 'Reaktions-Drill 10 Min.', hint: '[SCHWAECHE KOGNITION] Tennisball-Reaktionsuebung: Ball gegen Wand werfen + fangen, Farbcodes, Nummern-Rufen im Shadow Boxing.', type: 'meta' });
          }
        } else {
          // Max S&C erreicht – Ruhetag mit Varianz
          var rv = restDayVariants[restIdx % restDayVariants.length]; restIdx++;
          blocks.push({ time: isWeekend ? '10:00' : timeAdd(morningTime, 0, 10), title: rv.title, hint: rv.hint, type: 'recovery' });
          if (rv.title.indexOf('Komplett') === -1) {
            blocks.push({ time: isWeekend ? '14:00' : timeAdd(s.workEnd, 0, 30), title: 'Zone 2 Cardio ' + cardioLabel, hint: 'Lockeres Laufen oder Radfahren bei Puls 120-140. ' + whyHints.cardio, type: 'cardio',
              exercises: [{id:'zone2',label:'Zone 2'}] });
          }
          // Säulen-Booster: Ruhetag fuer schwache Nicht-Koerper-Saeulen nutzen
          if (hasWeakRingIQ) {
            blocks.push({ time: isWeekend ? '15:00' : timeAdd(s.workEnd, 1, 0), title: 'Kampf-Analyse 15 Min.', hint: '[SCHWAECHE RING IQ] Schau dir einen Profikampf an und notiere: Distanzkontrolle, Timing der Konter, Muster nach Jab. Trainiere dein Auge.', type: 'meta' });
          }
          if (hasWeakPsyche) {
            blocks.push({ time: isWeekend ? '20:00' : timeAdd(s.workEnd, 2, 30), title: 'Visualisierung 10 Min.', hint: '[SCHWAECHE MENTAL] Augen zu, Kampf durchgehen: Ring betreten, erste Runde, Druck-Situationen meistern. Dann 4-4-4-4 Atmung.', type: 'meta' });
          }
          if (hasWeakErnaehr) {
            blocks.push({ time: isWeekend ? '11:00' : timeAdd(s.workStart, 2, 0), title: 'Ernaehrungs-Check', hint: '[SCHWAECHE ERNAEHRUNG] Heute bewusst Protein zaehlen: Ziel 2.2g/kg. Mahlzeiten planen, Snacks vorbereiten. Mach den Makro-Rechner unter Ernaehrung.', type: 'meta' });
          }
        }
        // Mobility-Dauer: Bei schwacher Mobilität laenger
        var mobilDuration = hasWeakMobil ? 25 : 15;
        var mobilHint = 'Faszienrolle: Oberschenkel, Hueftbeuger, T-Spine + statisches Stretching';
        if (hasWeakMobil) mobilHint = '[SCHWAECHE MOBILITAET] ' + mobilHint + ' + Schulter-Dislocates, Ankle Mobility, T-Spine Rotation – laengere Session weil Mobilitaet dein Schwachpunkt ist';
        blocks.push({ time: isWeekend ? '17:00' : timeAdd(s.workEnd, 1, 30), title: 'Mobility + Foam Rolling ' + mobilDuration + ' Min.', hint: mobilHint, type: 'recovery',
          exercises: hasWeakMobil ? [{id:'hip-cars',label:'Hip CARs'},{id:'thoracic-rotation',label:'Thoracic Rotation'},{id:'shoulder-dislocates',label:'Shoulder Dislocates'},{id:'ankle-mobility',label:'Ankle Mobility'}] : [{id:'hip-cars',label:'Hip CARs'},{id:'thoracic-rotation',label:'Thoracic Rotation'}] });
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
// Wochenplan Block-Typ → Säulen-Indizes
const BLOCK_SAEULEN = {
  strength: [0],        // S1: Kraft
  boxing:   [0,2,5],    // Kraft + Kognition + Ring IQ
  cardio:   [1],        // S2: Metabolisch
  recovery: [4,7],      // Regeneration + Mobilität
  meta:     [2,6],      // Kognition + Mental (BET etc.)
  fight:    [0,1,2,5,6] // Alle Kampf-relevanten
};

function renderWeekPlan() {
  var _wpEl = document.getElementById('page-wochenplan');
  try { return _renderWeekPlanInner(); } catch(e) {
    console.error('renderWeekPlan error:', e);
    if (_wpEl) _wpEl.innerHTML = '<div style="padding:40px;color:var(--red);font-family:Space Mono,monospace;"><div style="font-size:18px;margin-bottom:12px;">FEHLER IM WOCHENPLAN</div><pre style="color:#888;font-size:11px;white-space:pre-wrap;">' + e.message + '\n\n' + (e.stack || '').split('\n').slice(0,5).join('\n') + '</pre><button onclick="location.reload()" style="margin-top:16px;padding:8px 16px;background:var(--red);color:#fff;border:none;cursor:pointer;">SEITE NEU LADEN</button></div>';
  }
}
function _renderWeekPlanInner() {
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

  // 4-Wochen-Zyklus berechnen
  var weekNum = 1;
  if (data.weekPlanGenerated) {
    var weeksSince = Math.floor((Date.now() - new Date(data.weekPlanGenerated).getTime()) / (7*86400000));
    weekNum = (weeksSince % 4) + 1;
  }
  var volumeMult = weekNum === 4 ? 0.6 : weekNum === 3 ? 1.1 : 1.0;
  var weekLabel = weekNum === 1 ? 'AUFBAU' : weekNum === 2 ? 'AUFBAU+' : weekNum === 3 ? 'PEAK' : 'DELOAD';

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
      <div class="page-sub">Dein Plan passt sich an dein Level, Equipment und Kampfdatum an.</div>
      <div style="margin-top:8px;"><span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:${weekNum===4?'var(--green)':weekNum===3?'var(--red)':'var(--blue)'};letter-spacing:1px;">WOCHE ${weekNum}: ${weekLabel}</span>
      <span style="font-family:'Space Mono',monospace;font-size:10px;color:#444;margin-left:8px;">${weekNum===1?'Grundlagen aufbauen':weekNum===2?'Volumen steigern':weekNum===3?'Intensitaet hoch, Volumen runter':weekNum===4?'Erholung – halbes Volumen':''}${volumeMult<1?' · Volumen x'+volumeMult:''}</span></div>
    </div>
    ${(function() {
      var hints = [];
      if (!s.gymAccess || s.gymAccess === 'none') hints.push('Equipment: Koerpergewicht');
      else if (s.gymAccess === 'basic') hints.push('Equipment: Basis');
      else hints.push('Equipment: Volles Gym');
      hints.push('Level: ' + (s.experienceLevel === 'anfaenger' ? 'Anfaenger' : s.experienceLevel === 'wettkampf' ? 'Wetkaempfer' : 'Fortgeschritten'));
      hints.push('S&C: max ' + (s.experienceLevel === 'anfaenger' ? '2' : '3') + 'x/Woche');
      // Shift-Work Warnung
      var wh = parseInt((s.workStart || '08:00').split(':')[0]);
      if (wh >= 12 || wh < 5) hints.push('\u26A0 Ungewoehnliche Arbeitszeiten – pruefe ob Trainingszeiten passen');
      return '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">' +
        hints.map(function(h) { return '<span style="font-family:\'Space Mono\',monospace;font-size:10px;padding:4px 10px;background:var(--surface-1);border:1px solid var(--surface-2);border-radius:var(--radius-sm);color:#555;">' + h + '</span>'; }).join('') +
        '<span onclick="showPage(\'account\')" style="font-family:\'Space Mono\',monospace;font-size:10px;padding:4px 10px;background:transparent;border:1px solid var(--surface-3);border-radius:var(--radius-sm);color:var(--red);cursor:pointer;">AENDERN \u2192</span>' +
      '</div>';
    })()}
    <div class="page-header" style="display:none;"></div>
    ${(function() {
      var fb = data._feedbackAdjustments || {};
      var rate = data._lastWeekRate;
      if (rate === null || rate === undefined) return '';
      var pct = Math.round(rate * 100);
      var rateColor = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)';
      var saeulenLabels = ['KRAFT','AUSDAUER','KOGNITION','ERNAEHRUNG','REGENERATION','RING IQ','MENTAL','MOBILITAET'];
      var lines = [];
      if (fb.volumeReduced) lines.push('\u2192 VOLUMEN: Reduziert (' + fb.volumeReason + ')');
      if (fb.volumeIncreased) lines.push('\u2192 VOLUMEN: Erhoht (' + fb.volumeReason + ')');
      if (fb.typeNotes) fb.typeNotes.forEach(function(n) { lines.push('\u2192 ' + n); });
      if (fb.rpeWarning) lines.push('\u26A0 ' + fb.rpeWarning);
      if (fb.rpeLow) lines.push('\u2192 ' + fb.rpeLow);
      if (fb.missedSaeulen && fb.missedSaeulen.length) lines.push('\u2192 VERSAEUMT: ' + fb.missedSaeulen.map(function(si){return saeulenLabels[si];}).join(', ') + ' (extra Fokus)');
      if (lines.length === 0 && pct >= 80) lines.push('\u2713 Gute Woche! Weiter so.');
      return '<div style="background:#0d0d0d;border:1px solid var(--surface-2);border-left:3px solid var(--blue);border-radius:var(--radius-md);padding:16px;margin-bottom:16px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
          '<span style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--blue);letter-spacing:2px;">LETZTE WOCHE</span>' +
          '<span style="font-family:\'Bebas Neue\',sans-serif;font-size:20px;color:' + rateColor + ';">' + pct + '%</span>' +
        '</div>' +
        lines.map(function(l) { return '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#888;margin-bottom:4px;">' + l + '</div>'; }).join('') +
      '</div>';
    })()}
    ${phaseHTML}
    ${(function() {
      var wp = data._weakPillars || {};
      var wi = data._weakInfo || [];
      if (wi.length === 0) return '';
      var PILLAR_LABELS = { kraft:'KRAFT', metabol:'AUSDAUER', kognitiv:'KOGNITION', ernaehr:'ERNAEHRUNG', recovery:'REGENERATION', ringiQ:'RING IQ', psyche:'MENTAL', mobil:'MOBILITAET' };
      var PILLAR_COLORS = { kraft:'#e8000d', metabol:'#2979ff', kognitiv:'#ab47bc', ernaehr:'#4caf50', recovery:'#ff6d00', ringiQ:'#f5c518', psyche:'#00bcd4', mobil:'#8bc34a' };
      var PILLAR_ACTIONS = {
        kraft: 'S&C-Bloecke betont, Kraftfokus-Hinweise',
        metabol: 'Mehr HIIT statt Zone 2, extra Cardio-Einheiten',
        kognitiv: 'Reaktions-Drills + Blickverhalten-Hinweise im Training',
        ernaehr: 'Ernaehrungs-Checks + Post-Training Protein-Erinnerungen',
        recovery: 'Volumen reduziert (-15%), Schlaf-Hinweise verstaerkt',
        ringiQ: 'Kampf-Analysen an Ruhetagen, Taktik-Fokus beim Boxen',
        psyche: 'Visualisierungs-Bloecke + Box-Breathing abends',
        mobil: 'Mobility-Sessions von 15 auf 25 Min. verlaengert'
      };
      var pills = wi.map(function(e) {
        var key = e[0], score = e[1];
        var isCritical = score < 35;
        return '<span style="font-family:\'Space Mono\',monospace;font-size:11px;padding:4px 10px;border-radius:var(--radius-sm);background:' + PILLAR_COLORS[key] + '22;color:' + PILLAR_COLORS[key] + ';border:1px solid ' + PILLAR_COLORS[key] + '44;">' + PILLAR_LABELS[key] + ' ' + Math.round(score) + '%' + (isCritical ? ' !!!' : '') + '</span>';
      }).join('');
      var actions = wi.map(function(e) {
        return '<div style="font-size:11px;color:#888;line-height:1.5;">→ <span style="color:' + PILLAR_COLORS[e[0]] + ';">' + PILLAR_LABELS[e[0]] + '</span>: ' + PILLAR_ACTIONS[e[0]] + '</div>';
      }).join('');
      return '<div style="margin-bottom:16px;padding:14px 16px;background:#0d0d0d;border:1px solid var(--surface-2);border-radius:var(--radius-md);border-left:3px solid var(--red);">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
          '<span style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;letter-spacing:2px;color:var(--red);">FASS-PRINZIP AKTIV</span>' +
          pills +
        '</div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;margin-bottom:8px;">Dein Plan wurde automatisch angepasst um deine schwachen Saeulen zu staerken:</div>' +
        actions +
      '</div>';
    })()}
    ${!data.fightDate ? '<div class="info-box info-tip" style="margin-bottom:20px;"><span>💡</span><div>Trage auf dem Dashboard ein <strong>Kampfdatum</strong> ein – der Wochenplan passt sich automatisch an (Schärfen, Kampf-Modus, Recovery).</div></div>' : ''}
    ${(function() {
      var coveredSet = {};
      DAY_NAMES.forEach(function(day) {
        (plan[day] || []).forEach(function(b) {
          var bs = BLOCK_SAEULEN[b.type];
          if (bs) bs.forEach(function(si) { coveredSet[si] = true; });
        });
      });
      var covered = Object.keys(coveredSet).length;
      var saeulenLabels = ['KRAFT','AUSDAUER','KOGNITION','ERNÄHRUNG','REGENERATION','RING IQ','MENTAL','MOBILITÄT'];
      var saeulenColors = ['#e8000d','#2979ff','#ab47bc','#4caf50','#ff6d00','#f5c518','#00bcd4','#8bc34a'];
      return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:16px;padding:12px 16px;background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);">' +
        '<span style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;letter-spacing:1px;margin-right:4px;">SÄULEN ' + covered + '/8</span>' +
        saeulenLabels.map(function(l, i) {
          var active = coveredSet[i];
          return '<span style="font-family:\'Space Mono\',monospace;font-size:9px;padding:3px 8px;border-radius:var(--radius-sm);letter-spacing:0.5px;' +
            (active ? 'background:' + saeulenColors[i] + '22;color:' + saeulenColors[i] + ';border:1px solid ' + saeulenColors[i] + '44;' : 'background:var(--surface-1);color:#333;border:1px solid var(--surface-2);') +
          '">' + l + '</span>';
        }).join('') +
      '</div>';
    })()}
    <div class="week-grid" data-active="${todayDow}">
      ${DAY_NAMES.map((day, di) => {
        const blocks = plan[day] || [];
        const dp = dayPhases[day];
        const isToday = di === todayDow;
        // Day Säulen coverage
        var daySaeulen = {};
        blocks.forEach(function(b) {
          var bs = BLOCK_SAEULEN[b.type];
          if (bs) bs.forEach(function(si) { daySaeulen[si] = true; });
        });
        var saeulenColors8 = ['#e8000d','#2979ff','#ab47bc','#4caf50','#ff6d00','#f5c518','#00bcd4','#8bc34a'];
        var daySaeulenDots = Object.keys(daySaeulen).map(function(si) {
          return '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + saeulenColors8[si] + ';"></span>';
        }).join('');

        return `<div class="day-col${isToday ? ' day-today day-active' : ''}">
          <div class="day-header" onclick="toggleDayCol(this)">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div class="day-name">${DAY_LABELS[di]}${isToday ? ' <span style="font-size:11px;color:var(--gold);">HEUTE</span>' : ''}</div>
              <span style="font-family:'Space Mono',monospace;font-size:10px;color:#333;">${blocks.length}</span>
            </div>
            <div style="display:flex;align-items:center;gap:4px;margin-top:4px;">
              ${dp ? `<span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:${dp.color};">${dp.label}</span>` : ''}
              <span style="display:flex;gap:2px;margin-left:auto;">${daySaeulenDots}</span>
            </div>
          </div>
          ${(s.weekSchedule[day] && s.weekSchedule[day].type === 'sparring' && blocks.some(b => b.type === 'strength')) ? '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:var(--orange);padding:4px 8px;">\u26A0 S&C + Sparring = Verletzungsrisiko</div>' : ''}
          <div class="day-blocks">
            ${blocks.map((b, bi) => {
              const logKey = day + '_' + bi + '_' + getWeekId();
              const done = isBlockLogged(logKey);
              var blockSaeulen = BLOCK_SAEULEN[b.type] || [];
              var blockDots = blockSaeulen.map(function(si) {
                return '<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:' + saeulenColors8[si] + ';"></span>';
              }).join('');
              return `<div class="day-block ${TYPE_CLASS[b.type] || 'meta'}${done ? ' block-done' : ''}" onclick="openBlockDetail('${day}',${bi})" title="Klicke fuer Details">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-family:'Space Mono',monospace;font-size:11px;opacity:.7;">${b.time}</span>
                  <span class="block-saeulen-dots" style="display:flex;gap:2px;">${blockDots}</span>
                </div>
                ${isToday || done ? `<button class="block-check-btn${done ? ' checked' : ''}" onclick="event.stopPropagation();toggleBlockDone('${day}',${bi},'${b.type}','${b.title.replace(/'/g,'\\&#39;')}')" title="${done ? 'Erledigt' : 'Als erledigt markieren'}">${done ? '✓' : '○'}</button>` : ''}
              </div>
              ${b.title}
              ${b.hint ? '<div class="block-hint" style="font-family:\'DM Sans\',sans-serif;font-size:10px;color:#444;margin-top:2px;line-height:1.3;">' + b.hint + '</div>' : ''}
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
  if (!data.weekPlanGenerated) data.weekPlanGenerated = new Date().toISOString();
  saveData(data);
  renderWeekPlan();
}

function toggleDayCol(el) {
  var col = el.closest('.day-col');
  var grid = el.closest('.week-grid');
  if (!col || !grid) return;
  var cols = grid.querySelectorAll('.day-col');
  var idx = Array.prototype.indexOf.call(cols, col);
  // Remove active from all, set on clicked
  cols.forEach(function(c) { c.classList.remove('day-active'); });
  col.classList.add('day-active');
  grid.setAttribute('data-active', idx);
}

// ===== BLOCK DETAIL PAGE =====
var BLOCK_DETAIL_CONTENT = {
  'strength': {
    warmup: 'Foam Rolling 2 Min. (Oberschenkel, Hueftbeuger) → Band Pull-Aparts 2x15 → Face Pulls 3x15 → 2 Aufwaermsaetze mit leichtem Gewicht',
    cooldown: 'Statisches Stretching: Hueftbeuger 30s, Schultern 30s, Brustdehnung 30s → Handgelenke kreisen',
    notes: 'Schwere Saetze: 2-3 Min. Pause. Explosive Uebungen: max. Geschwindigkeit, keine Ermuedung. Immer saubere Technik vor mehr Gewicht.'
  },
  'boxing': {
    warmup: 'VOR dem Vereinstraining: Seilspringen 3 Min. → Schulterkreise → Face Pulls 3x15 mit Band → Hueften mobilisieren',
    cooldown: 'NACH dem Vereinstraining: Statisches Stretching (Schultern, Hueftbeuger, Handgelenke) → Haende auslockern → Finger dehnen',
    notes: 'Dein Trainer gibt den Inhalt im Verein vor. FightOS kuemmert sich um alles drumherum: Aufwaermen, Erholung, Kraft, Ernaehrung.'
  },
  'cardio': {
    warmup: '5 Min. locker einlaufen → Dynamisches Stretching: Beinschwingen, Hueftkreise',
    cooldown: '5 Min. locker auslaufen → Dehnung: Waden, Oberschenkel, Hueftbeuger',
    notes: 'Zone 2 = du kannst noch reden. HIIT = volle Belastung in den Arbeitsintervallen. Puls kontrollieren wenn moeglich.'
  },
  'recovery': {
    warmup: 'Nicht noetig – direkt mit lockerer Bewegung starten',
    cooldown: 'Tiefe Bauchatmung 2 Min. (4-4-4-4)',
    notes: 'Kein Leistungsdruck. Ziel ist Durchblutung und Beweglichkeit, nicht Erschoepfung.'
  },
  'meta': {
    warmup: '',
    cooldown: '',
    notes: ''
  }
};

function openBlockDetail(day, idx) {
  var data = getData();
  if (!data || !data.weekPlan || !data.weekPlan[day]) return;
  var block = data.weekPlan[day][idx];
  if (!block) return;

  var el = document.getElementById('page-block-detail');
  if (!el) return;

  var saeulenLabels = ['KRAFT','AUSDAUER','KOGNITION','ERNAEHRUNG','REGENERATION','RING IQ','MENTAL','MOBILITAET'];
  var saeulenColors = ['#e8000d','#2979ff','#ab47bc','#4caf50','#ff6d00','#f5c518','#00bcd4','#8bc34a'];
  var blockSaeulen = BLOCK_SAEULEN[block.type] || [];
  var typeDetail = BLOCK_DETAIL_CONTENT[block.type] || BLOCK_DETAIL_CONTENT['meta'];

  var DAY_LABEL_MAP = { mo:'Montag', di:'Dienstag', mi:'Mittwoch', do:'Donnerstag', fr:'Freitag', sa:'Samstag', so:'Sonntag' };

  // Übungen aus der Übungsbibliothek holen
  var exerciseHTML = '';
  if (block.exercises && block.exercises.length) {
    exerciseHTML = '<div style="margin-top:24px;">' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:20px;color:var(--white);letter-spacing:1px;margin-bottom:16px;">UEBUNGEN</div>';
    block.exercises.forEach(function(ex) {
      var exData = typeof getExerciseById === 'function' ? getExerciseById(ex.id) : null;
      exerciseHTML += '<div style="background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:16px;margin-bottom:10px;">';
      exerciseHTML += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
      exerciseHTML += '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;">' + (ex.label || ex.id).replace(/</g,'&lt;') + '</div>';
      if (exData) {
        exerciseHTML += '<span class="ex-chip" onclick="if(typeof openExerciseDetail===\'function\')openExerciseDetail(\'' + ex.id + '\')" style="cursor:pointer;">DETAILS →</span>';
      }
      exerciseHTML += '</div>';
      if (exData) {
        if (exData.desc) exerciseHTML += '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#888;line-height:1.5;margin-bottom:8px;">' + exData.desc + '</div>';
        if (exData.sets && exData.sets.length) exerciseHTML += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">' + exData.sets.map(function(s) { return '<span style="font-family:\'Space Mono\',monospace;font-size:11px;color:var(--gold);background:#1a1a0a;padding:4px 10px;border-radius:var(--radius-sm);">' + s + '</span>'; }).join('') + '</div>';
        if (exData.tip) exerciseHTML += '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#666;line-height:1.5;"><strong style="color:var(--gold);">' + (exData.tipLabel || 'Tipp') + ':</strong> ' + exData.tip + '</div>';
        if (exData.boxingConnection) exerciseHTML += '<div style="font-family:\'DM Sans\',sans-serif;font-size:12px;color:#444;line-height:1.5;margin-top:8px;padding-top:8px;border-top:1px solid var(--surface-1);"><strong style="color:#555;">Boxing:</strong> ' + exData.boxingConnection + '</div>';
        if (exData.video) exerciseHTML += '<a href="' + exData.video + '" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;font-family:\'Space Mono\',monospace;font-size:10px;color:var(--red);text-decoration:none;letter-spacing:1px;">VIDEO ANLEITUNG \u2197</a>';
      } else {
        exerciseHTML += '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#555;">' + (ex.label || ex.id) + '</div>';
      }
      exerciseHTML += '</div>';
    });
    exerciseHTML += '</div>';
  }

  el.innerHTML = '<div style="padding-bottom:16px;">' +
    '<button onclick="showPage(\'wochenplan\')" style="font-family:\'Space Mono\',monospace;font-size:11px;color:#444;background:none;border:none;cursor:pointer;padding:0;min-height:44px;display:inline-flex;align-items:center;letter-spacing:1px;">\u2190 Wochenplan</button>' +
  '</div>' +

  // Header
  '<div style="margin-bottom:24px;">' +
    '<div style="font-family:\'Space Mono\',monospace;font-size:11px;color:#555;letter-spacing:1px;margin-bottom:4px;">' + (DAY_LABEL_MAP[day] || day).toUpperCase() + ' \u00b7 ' + block.time + '</div>' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:clamp(28px,5vw,40px);color:var(--white);letter-spacing:2px;line-height:1;">' + (block.title || '').replace(/</g,'&lt;') + '</div>' +
    (block.hint ? '<div style="font-family:\'DM Sans\',sans-serif;font-size:14px;color:#666;margin-top:8px;line-height:1.5;">' + block.hint.replace(/</g,'&lt;') + '</div>' : '') +
    '<div style="display:flex;gap:6px;margin-top:12px;">' +
      blockSaeulen.map(function(si) {
        return '<span style="font-family:\'Space Mono\',monospace;font-size:9px;padding:3px 8px;border-radius:var(--radius-sm);background:' + saeulenColors[si] + '22;color:' + saeulenColors[si] + ';border:1px solid ' + saeulenColors[si] + '44;">' + saeulenLabels[si] + '</span>';
      }).join('') +
    '</div>' +
  '</div>' +

  // Warm-up
  (typeDetail.warmup ? '<div style="background:var(--surface-0);border:1px solid var(--surface-2);border-left:3px solid var(--gold);border-radius:var(--radius-md);padding:16px;margin-bottom:16px;">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--gold);letter-spacing:1px;margin-bottom:8px;">WARM-UP</div>' +
    '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#888;line-height:1.7;">' + typeDetail.warmup + '</div>' +
  '</div>' : '') +

  // Übungen
  exerciseHTML +

  // Cool-down
  (typeDetail.cooldown ? '<div style="background:var(--surface-0);border:1px solid var(--surface-2);border-left:3px solid var(--blue);border-radius:var(--radius-md);padding:16px;margin-top:16px;margin-bottom:16px;">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--blue);letter-spacing:1px;margin-bottom:8px;">COOL-DOWN</div>' +
    '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#888;line-height:1.7;">' + typeDetail.cooldown + '</div>' +
  '</div>' : '') +

  // Hinweise
  (typeDetail.notes ? '<div style="background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:16px;margin-bottom:16px;">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;margin-bottom:8px;">HINWEISE</div>' +
    '<div style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#666;line-height:1.7;">' + typeDetail.notes + '</div>' +
  '</div>' : '') +

  // Bearbeiten-Button
  '<div style="display:flex;gap:12px;margin-top:24px;padding-top:16px;border-top:1px solid var(--surface-2);">' +
    '<button onclick="editBlockFromDetail(\'' + day + '\',' + idx + ')" style="font-family:\'Space Mono\',monospace;font-size:11px;color:#555;background:none;border:1px solid var(--surface-3);padding:10px 20px;border-radius:var(--radius-sm);cursor:pointer;">BEARBEITEN</button>' +
    '<button onclick="toggleBlockDone(\'' + day + '\',' + idx + ',\'' + block.type + '\',\'' + (block.title || '').replace(/'/g,'') + '\');showPage(\'wochenplan\')" class="submit-btn" style="padding:10px 20px;font-size:13px;">ALS ERLEDIGT MARKIEREN</button>' +
  '</div>';

  showPage('block-detail');
}

function editBlockFromDetail(day, idx) {
  editBlock(day, idx);
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
  var modal = document.getElementById('block-modal');
  modal.classList.add('active');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  openModalFocus(modal);
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
  var modal = document.getElementById('block-modal');
  modal.classList.add('active');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  openModalFocus(modal);
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
  if (!confirm('Diesen Trainingsblock entfernen?')) return;
  if (!editingBlock) return;
  const data = getData();
  if (!data) return;
  data.weekPlan[editingBlock.day].splice(editingBlock.idx, 1);
  saveData(data);
  closeBlockModal();
  renderWeekPlan();
}

function closeBlockModal() { closeModal(document.getElementById('block-modal')); editingBlock = null; }

// Week ID for current week (ISO week start Monday)
function getWeekId() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d.toISOString().split('T')[0];
}

function getLastWeekId() {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - 7);
  return d.toISOString().split('T')[0];
}

function buildLastWeekCompletion(data, lastWeekId) {
  var plan = data.weekPlan;
  var completed = data.completedBlocks || {};
  if (!plan) return null;

  var totalBlocks = 0, completedCount = 0;
  var byType = {};
  var bySaeule = {};
  var rpeVals = [];

  // Init Säulen
  for (var si = 0; si < 8; si++) bySaeule[si] = { planned: 0, done: 0 };

  DAY_NAMES.forEach(function(day) {
    var blocks = plan[day] || [];
    blocks.forEach(function(b, bi) {
      if (b.type === 'meta') return; // Skip meta blocks (Arbeit etc.)
      totalBlocks++;
      if (!byType[b.type]) byType[b.type] = { planned: 0, done: 0 };
      byType[b.type].planned++;

      // Säulen zuordnen
      var saeulen = BLOCK_SAEULEN[b.type] || [];
      saeulen.forEach(function(si) { bySaeule[si].planned++; });

      // Check if completed (by type match since indices may shift)
      var logKey = day + '_' + bi + '_' + lastWeekId;
      if (completed[logKey]) {
        completedCount++;
        byType[b.type].done++;
        saeulen.forEach(function(si) { bySaeule[si].done++; });
      }
    });
  });

  if (totalBlocks === 0) return null;

  // RPE from logs of that week
  var monStr = lastWeekId;
  var sunDate = new Date(lastWeekId + 'T00:00:00');
  sunDate.setDate(sunDate.getDate() + 6);
  var sunStr = sunDate.toISOString().split('T')[0];
  var weekLogs = (data.log || []).filter(function(e) { return e.date >= monStr && e.date <= sunStr; });
  weekLogs.forEach(function(e) { if (e.rpe && e.rpe > 0) rpeVals.push(parseFloat(e.rpe)); });
  var avgRPE = rpeVals.length ? Math.round(rpeVals.reduce(function(a,b){return a+b;},0) / rpeVals.length * 10) / 10 : 0;

  // Missed Säulen (< 50%)
  var missedSaeulen = [];
  for (var si = 0; si < 8; si++) {
    if (bySaeule[si].planned > 0 && bySaeule[si].done / bySaeule[si].planned < 0.5) {
      missedSaeulen.push(si);
    }
  }

  return {
    weekId: lastWeekId,
    totalBlocks: totalBlocks,
    completedBlocks: completedCount,
    completionRate: completedCount / totalBlocks,
    byType: byType,
    bySaeule: bySaeule,
    missedSaeulen: missedSaeulen,
    avgRPE: avgRPE
  };
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
  var wasCompleted = !!data.completedBlocks[logKey];
  if (wasCompleted) {
    // Undo
    delete data.completedBlocks[logKey];
    saveData(data);
    showToast('Block rückgängig', 'info', 1500);
  } else {
    // Mark done + auto-log training
    data.completedBlocks[logKey] = { date: new Date().toISOString(), type, title };
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
    showToast('Block erledigt \u2713', 'success', 2000);
  }
  // Animate the block before re-render
  var blockEl = document.querySelector('[data-block-key="' + logKey + '"]');
  if (!blockEl) {
    // Fallback: find by day+idx
    var dayCol = document.querySelector('.day-col[data-day="' + day + '"]');
    if (dayCol) {
      var blocks = dayCol.querySelectorAll('.day-block');
      blockEl = blocks[idx];
    }
  }
  if (blockEl) {
    blockEl.classList.add(wasCompleted ? 'just-undone' : 'just-completed');
    setTimeout(function() { renderWeekPlan(); }, 400);
  } else {
    renderWeekPlan();
  }
}

function estimateBlockDuration(type) {
  const dur = { boxen: 90, sparring: 90, pratzen: 60, kraft: 45, sc: 45, cardio: 30, meta: 15, ernaehrung: 0 };
  return dur[type] || 30;
}

function mapBlockTypeToLogType(type) {
  const map = { boxen: 'boxen', sparring: 'sparring', pratzen: 'pratzen', kraft: 'kraft', sc: 'kraft', strength: 'kraft', cardio: 'cardio', recovery: 'mobility', boxing: 'boxen', meta: 'meta' };
  return map[type] || type;
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
  var shareLinkEl = document.getElementById('share-link');
  var shareModalEl = document.getElementById('share-modal');
  if (shareLinkEl) shareLinkEl.value = url;
  if (shareModalEl) {
    shareModalEl.classList.add('active');
    shareModalEl.setAttribute('role', 'dialog');
    shareModalEl.setAttribute('aria-modal', 'true');
    openModalFocus(shareModalEl);
  }
}

function copyShareLink() {
  const link = document.getElementById('share-link');
  if (!link) return;
  link.select();
  try {
    navigator.clipboard.writeText(link.value).catch(function() {
      var ta = document.createElement('textarea');
      ta.value = link.value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  } catch(e) {
    var ta = document.createElement('textarea');
    ta.value = link.value;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  link.style.borderColor = 'var(--green)';
  setTimeout(() => link.style.borderColor = 'var(--surface-3)', 1500);
}

function shareWhatsApp() {
  const link = document.getElementById('share-link').value;
  window.open('https://wa.me/?text=' + encodeURIComponent('Check meinen FightOS Trainingsplan: ' + link), '_blank');
}

function closeShareModal() { closeModal(document.getElementById('share-modal')); }

// ===== SETTINGS =====
function openSettingsModal() {
  const s = getUserSchedule();
  const users = safeParse('fos_users', {});
  const u = users[currentUser] || {};
  document.getElementById('settings-birthyear').value = u.birthYear || '';
  document.getElementById('settings-weight').value = s.weight;
  document.getElementById('settings-work-start').value = s.workStart;
  document.getElementById('settings-work-end').value = s.workEnd;

  const container = document.getElementById('settings-week-rows');
  container.innerHTML = buildScheduleHTML(s.weekSchedule, 'sched');

  var modal = document.getElementById('settings-modal');
  modal.classList.add('active');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  openModalFocus(modal);
}

function closeSettingsModal() { closeModal(document.getElementById('settings-modal')); }

function saveSettings() {
  const users = safeParse('fos_users', {});
  if (!users[currentUser]) return;
  users[currentUser].birthYear = document.getElementById('settings-birthyear').value;
  users[currentUser].weight = document.getElementById('settings-weight').value;
  users[currentUser].workStart = document.getElementById('settings-work-start').value;
  users[currentUser].workEnd = document.getElementById('settings-work-end').value;
  localStorage.setItem('fos_users', JSON.stringify(users));

  applyScheduleToUser(readScheduleFromDOM('sched'));
  showToast('Einstellungen gespeichert');
  closeSettingsModal();

  renderDashboard();
  renderWeekPlan();
  if (typeof renderErnTimeline === 'function') renderErnTimeline();
  if (typeof renderDashStats === 'function') renderDashStats();
}

// ===== SHARED SCHEDULE HELPERS =====
var SCHEDULE_DAY_LABELS = { mo:'Mo', di:'Di', mi:'Mi', do:'Do', fr:'Fr', sa:'Sa', so:'So' };
var SCHEDULE_TYPES = [
  { val:'boxen', label:'Boxen' },{ val:'pa', label:'Partnerarbeit' },
  { val:'pratzen', label:'Pratzen' },{ val:'sparring', label:'Sparring' },
  { val:'technik', label:'Technik' },{ val:'cardio', label:'Nur Cardio' },
  { val:'frei', label:'Frei' }
];

function buildScheduleHTML(schedule, idPrefix) {
  return ['mo','di','mi','do','fr','sa','so'].map(function(day) {
    var d = schedule[day] || { time: null, type: 'frei' };
    var isFrei = d.type === 'frei';
    return '<div style="display:flex;gap:6px;align-items:center;">' +
      '<span style="font-family:\'Bebas Neue\',sans-serif;font-size:14px;color:var(--white);min-width:24px;">' + SCHEDULE_DAY_LABELS[day] + '</span>' +
      '<select id="' + idPrefix + '-type-' + day + '" onchange="document.getElementById(\'' + idPrefix + '-time-' + day + '\').disabled=this.value===\'frei\'" style="flex:1;background:var(--surface-2);border:1px solid var(--surface-3);color:var(--white);padding:8px;font-family:\'DM Sans\';font-size:12px;border-radius:var(--radius-sm);">' +
        SCHEDULE_TYPES.map(function(t) { return '<option value="' + t.val + '" ' + (d.type === t.val ? 'selected' : '') + '>' + t.label + '</option>'; }).join('') +
      '</select>' +
      '<input id="' + idPrefix + '-time-' + day + '" type="time" value="' + (d.time || '18:00') + '" ' + (isFrei ? 'disabled' : '') + ' style="width:90px;min-height:44px;background:var(--surface-2);border:1px solid var(--surface-3);color:var(--white);padding:8px;font-family:\'DM Sans\';font-size:14px;border-radius:var(--radius-sm);box-sizing:border-box;">' +
    '</div>';
  }).join('');
}

function readScheduleFromDOM(idPrefix) {
  var ws = {};
  ['mo','di','mi','do','fr','sa','so'].forEach(function(day) {
    var typeEl = document.getElementById(idPrefix + '-type-' + day);
    var timeEl = document.getElementById(idPrefix + '-time-' + day);
    if (!typeEl) return;
    var type = typeEl.value;
    var time = type === 'frei' ? null : (timeEl ? timeEl.value : null);
    ws[day] = { time: time, type: type };
  });
  return ws;
}

function applyScheduleToUser(ws) {
  var users = safeParse('fos_users', {});
  if (!users[currentUser]) return;
  users[currentUser].weekSchedule = ws;
  var times = Object.values(ws).filter(function(d) { return d.time; }).map(function(d) { return d.time; });
  users[currentUser].trainingTime = times[0] || '18:00';
  localStorage.setItem('fos_users', JSON.stringify(users));
  var data = getData();
  if (data) {
    data.weekPlan = generateSmartWeekPlan();
    saveData(data);
  }
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
  const users = safeParse('fos_users', {});
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
    gymAccess: u.gymAccess || 'none',
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

  var gym = s.gymAccess || 'none';
  var isAnfaenger = s.experienceLevel === 'anfaenger';

  // Gestern Sparring?
  var yesterdayIdx = (todayIdx + 6) % 7;
  var yesterdayKey = DAY_NAMES[yesterdayIdx];
  var yesterdayWasSparring = (ws[yesterdayKey] || {}).type === 'sparring';

  if (yesterdayWasSparring && isFreeDay) {
    // === TAG NACH SPARRING ===
    routine.push({ time: timeAdd(wakeTime, 0, 10), label: gym !== 'none' ? 'IMT – 30 Atemzuege' : 'Atemuebung – 30 tiefe Atemzuege', color: 'var(--red)' });
    routine.push({ time: timeAdd(wakeTime, 0, 20), label: 'Erholungstag: Leichte Mobility 15 Min.', color: 'var(--purple)' });
    routine.push({ time: isWeekend ? '14:00' : timeAdd(today.workEnd, 0, 30), label: 'Zone 2 Cardio 20-30 Min. (Regeneration)', color: 'var(--green)' });
    routine.push({ time: isWeekend ? '17:00' : timeAdd(today.workEnd, 1, 30), label: 'Mobility + Foam Rolling 15 Min.', color: 'var(--purple)' });
    warnings.push('Erholungstag nach Sparring – kein schweres Training!');

  } else if (isSparringDay) {
    // === SPARRING TAG ===
    routine.push({ time: timeAdd(wakeTime, 0, 10), label: gym !== 'none' ? 'IMT – 30 Atemzuege' : 'Atemuebung – 30 tiefe Atemzuege', color: 'var(--red)' });
    routine.push({ time: timeAdd(wakeTime, 0, 20), label: 'Leichte Mobility 10 Min.', color: 'var(--purple)' });
    routine.push({ time: timeBefore(today.time, 0, 15), label: 'Vor dem Verein: Aufwaermen', color: 'var(--gold)' });
    routine.push({ time: today.time, label: 'Sparring im Verein', color: 'var(--red)' });
    routine.push({ time: timeAdd(today.time, 1, 30), label: 'Nach dem Verein: Dehnung + Foam Rolling', color: 'var(--purple)' });
    warnings.push('Sparring-Tag: Kein schweres S&C heute!');

  } else if (isBoxingDay) {
    // === BOXTAG ===
    routine.push({ time: timeAdd(wakeTime, 0, 10), label: gym !== 'none' ? 'IMT – 30 Atemzuege' : 'Atemuebung – 30 tiefe Atemzuege', color: 'var(--red)' });
    if (gym === 'none') {
      routine.push({ time: timeAdd(wakeTime, 0, 15), label: isAnfaenger ? 'Knie-Liegestuetze + Core 15 Min.' : 'Liegestuetze + Core 15 Min.', color: 'var(--red)' });
    } else if (!isAnfaenger) {
      routine.push({ time: timeAdd(wakeTime, 0, 15), label: 'Overcoming Isometrics + Nacken (~20 Min.)', color: 'var(--red)' });
    } else {
      routine.push({ time: timeAdd(wakeTime, 0, 15), label: 'Liegestuetze + Core 15 Min.', color: 'var(--red)' });
    }
    if (!isWeekend) {
      routine.push({ time: timeAdd(lunchTime, 0, 25), label: gym !== 'none' ? 'IMT – 30 Atemzuege (2. Session)' : 'Atemuebung – 30 Atemzuege (2. Session)', color: 'var(--gold)' });
    }
    routine.push({ time: timeBefore(today.time, 0, 15), label: 'Vor dem Verein: Aufwaermen + Face Pulls', color: 'var(--gold)' });
    routine.push({ time: today.time, label: typeLabel + ' im Verein', color: 'var(--red)' });
    routine.push({ time: timeAdd(today.time, 1, 30), label: 'Nach dem Verein: Dehnung + Handpflege', color: 'var(--purple)' });

  } else if (isFreeDay) {
    // === FREIER TAG ===
    routine.push({ time: timeAdd(wakeTime, 0, 10), label: gym !== 'none' ? 'IMT – 30 Atemzuege' : 'Atemuebung – 30 tiefe Atemzuege', color: 'var(--red)' });

    if (tomorrowIsSparring) {
      routine.push({ time: timeAdd(wakeTime, 0, 20), label: 'Leichte Mobility 15 Min. (morgen Sparring!)', color: 'var(--purple)' });
      routine.push({ time: isWeekend ? '14:00' : timeAdd(today.workEnd, 0, 30), label: 'Zone 2 Cardio 30 Min.', color: 'var(--green)' });
      warnings.push('Morgen Sparring! Kein schweres Training heute.');
    } else {
      // Normaler freier Tag: S&C je nach Gym
      var scTime = timeAdd(wakeTime, 0, 20);
      if (gym === 'none') {
        routine.push({ time: scTime, label: 'Koerpergewicht-Training (Liegestuetze, Kniebeugen, Core)', color: 'var(--red)' });
      } else {
        routine.push({ time: scTime, label: 'S&C: Power / Explosive / Combat Strength', color: 'var(--red)' });
      }
      routine.push({ time: timeAdd(scTime, 0, 45), label: 'Nackentraining 10 Min.', color: 'var(--red)' });
      routine.push({ time: isWeekend ? '14:00' : timeAdd(today.workEnd, 0, 30), label: 'Zone 2 Cardio 30-45 Min.', color: 'var(--green)' });
      routine.push({ time: isWeekend ? '17:00' : timeAdd(today.workEnd, 1, 30), label: 'Mobility + Foam Rolling 15 Min.', color: 'var(--purple)' });
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
    warnings.push('Morgen ist Sparring-Tag – heute CNS schonen und frueh schlafen!');
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
    tomorrowNote = `<div style="margin-top:14px;padding:10px 14px;background:#1a1208;border:1px solid var(--orange);border-radius:var(--radius-md);font-size:12px;color:var(--orange);">Morgen: Sparring \u2014 heute fr\u00fch schlafen!</div>`;
  } else if (tomorrowIsBoxing) {
    tomorrowNote = `<div style="margin-top:14px;padding:10px 14px;background:#0d1a0d;border:1px solid var(--green);border-radius:var(--radius-md);font-size:12px;color:var(--green);">Morgen: ${tomorrowTypeLabel} (${tomorrowLabel}) um ${tomorrow.time || '?'}</div>`;
  } else if (tomorrow.type === 'frei') {
    tomorrowNote = `<div style="margin-top:14px;padding:10px 14px;background:var(--surface-1);border:1px solid #333;border-radius:var(--radius-md);font-size:12px;color:#666;">Morgen: Freier Tag (${tomorrowLabel})</div>`;
  }

  // Header with today's type
  const headerHTML = `<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px;">
    <span style="font-family:'Space Mono',monospace;font-size:11px;color:#555;">${dayLabel}</span>
    <span style="background:${isBoxingDay || isSparringDay ? 'var(--red)' : isFreeDay ? 'var(--green)' : 'var(--gold)'};color:#000;font-size:12px;font-weight:700;padding:3px 10px;border-radius:var(--radius-sm);text-transform:uppercase;">${typeLabel}${today.time ? ' \u00b7 ' + today.time : ''}</span>
  </div>`;

  // Warnings HTML
  const warningsHTML = warnings.length ? warnings.map(w =>
    `<div style="margin-bottom:6px;padding:8px 12px;background:#1a1208;border:1px solid var(--orange);border-radius:var(--radius-md);font-size:11px;color:var(--orange);">⚠ ${w}</div>`
  ).join('') : '';

  // Filter out noise blocks
  var noiseLabels = ['Arbeit', 'Feierabend', 'Meal Prep'];
  routine = routine.filter(function(r) { return noiseLabels.indexOf(r.label) === -1; });

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
      reminders.push({ priority: 1, color: 'var(--blue)', text: `${cfg.name} – noch nie getestet. Ersten Wert eintragen!` });
    } else {
      const lastDate = new Date(hist[hist.length - 1].date);
      const daysSince = Math.floor((today - lastDate) / 86400000);
      const dueIn = cfg.weeks * 7 - daysSince;
      if (dueIn <= 0) {
        reminders.push({ priority: 2, color: 'var(--red)', text: `${cfg.name} – letzter Test vor ${daysSince} Tagen. Zeit für einen neuen Test!` });
      } else if (dueIn <= 7) {
        reminders.push({ priority: 0, color: 'var(--gold)', text: `${cfg.name} – nächster Test in ${dueIn} Tagen fällig.` });
      }
    }
  }

  // --- HRV Erinnerung ---
  if (hrv.length === 0) {
    reminders.push({ priority: 1, color: 'var(--blue)', text: 'HRV – noch nie eingetragen. Morgens messen für bessere Trainingssteuerung.' });
  } else {
    const lastHRV = new Date(hrv[0].date);
    const daysSinceHRV = Math.floor((today - lastHRV) / 86400000);
    if (daysSinceHRV >= 3) {
      reminders.push({ priority: 2, color: 'var(--gold)', text: `HRV – seit ${daysSinceHRV} Tagen nicht eingetragen.` });
    }
  }

  // --- Training-Log Erinnerung ---
  if (log.length === 0) {
    reminders.push({ priority: 1, color: 'var(--blue)', text: 'Training-Log – noch keine Einheiten dokumentiert.' });
  } else {
    const lastLog = new Date(log[0].date);
    const daysSinceLog = Math.floor((today - lastLog) / 86400000);
    if (daysSinceLog >= 4) {
      reminders.push({ priority: 0, color: 'var(--gold)', text: `Letzte Trainingseinheit vor ${daysSinceLog} Tagen – alles OK?` });
    }
  }

  // --- Kampf-Erinnerungen ---
  if (data.fightDate) {
    const diff = Math.ceil((new Date(data.fightDate + 'T00:00:00') - today) / 86400000);
    if (diff === 5 || diff === 4) {
      reminders.push({ priority: 3, color: 'var(--red)', text: `Kampf in ${diff} Tagen – Gewicht checken! Letztes hartes Sparring sollte jetzt sein.` });
    }
    if (diff === 1) {
      reminders.push({ priority: 3, color: 'var(--red)', text: 'MORGEN KAMPF – Equipment packen, Carbs laden, früh schlafen.' });
    }
  }

  // --- Leere Benchmarks die nie getestet wurden ---
  const neverTested = Object.keys(BENCH_INTERVALS).filter(id => !benchmarks[id] && !(history[id] && history[id].length));
  if (neverTested.length >= 5) {
    // Replace individual "nie getestet" reminders with one summary
    const individual = reminders.filter(r => r.text.includes('nie getestet'));
    if (individual.length > 3) {
      individual.forEach(r => reminders.splice(reminders.indexOf(r), 1));
      reminders.push({ priority: 1, color: 'var(--blue)', text: `${neverTested.length} Benchmarks noch nie getestet – trage deine ersten Werte ein.` });
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
function checkAndSaveWeeklySnapshot() {
  const data = getData();
  if (!data) return;
  if (!data.weeklySnapshots) data.weeklySnapshots = [];

  // Calculate last week's Monday and Sunday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay() === 0 ? 7 : today.getDay(); // Mo=1..So=7
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - (dow - 1));
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);

  // Compute last week's ISO week ID (same logic as getWeekId but for lastMonday)
  const lwDate = new Date(lastMonday);
  const lastWeekId = lwDate.toISOString().split('T')[0];

  // Already snapshotted?
  if (data.weeklySnapshots.length > 0 && data.weeklySnapshots[0].week === lastWeekId) return;

  // Date range strings
  const monStr = lastMonday.toISOString().split('T')[0];
  const sunStr = lastSunday.toISOString().split('T')[0];

  // Training log stats for last week
  const weekLogs = (data.log || []).filter(e => e.date >= monStr && e.date <= sunStr);
  const sessions = weekLogs.length;
  const totalMin = weekLogs.reduce((s, e) => s + (parseInt(e.duration) || 0), 0);
  const rpeVals = weekLogs.map(e => parseFloat(e.rpe)).filter(v => v > 0);
  const avgRPE = rpeVals.length ? Math.round((rpeVals.reduce((s, v) => s + v, 0) / rpeVals.length) * 10) / 10 : 0;

  // Checklist adherence: count days with ≥3/5 items checked
  let checklistDays = 0;
  for (let d = 0; d < 7; d++) {
    const dayDate = new Date(lastMonday);
    dayDate.setDate(lastMonday.getDate() + d);
    const dateStr = dayDate.toISOString().split('T')[0];
    const key = 'fos_checklist_' + currentUser + '_' + dateStr;
    let cl = {};
    cl = safeParse(key, {});
    const checked = DAILY_ITEMS.filter(item => cl[item.id] === true).length;
    if (checked >= 3) checklistDays++;
  }

  // Overall score from benchmarks
  const scores = calcProfileScores(data);
  const filledScores = Object.values(scores).filter(v => v !== null);
  const overallScore = filledScores.length ? Math.round(filledScores.reduce((a, b) => a + b, 0) / filledScores.length) : null;

  // Completion data from lastWeekCompletion
  var lwc = data.lastWeekCompletion || {};
  var completionRate = lwc.completionRate || 0;
  var missedSaeulen = lwc.missedSaeulen || [];
  var bySaeule = lwc.bySaeule || {};

  // Create snapshot
  const snapshot = {
    week: lastWeekId,
    sessions: sessions,
    totalMin: totalMin,
    avgRPE: avgRPE,
    checklistDays: checklistDays,
    overallScore: overallScore,
    completionRate: completionRate,
    missedSaeulen: missedSaeulen,
    bySaeule: bySaeule,
    date: sunStr
  };

  data.weeklySnapshots.unshift(snapshot);
  if (data.weeklySnapshots.length > 52) data.weeklySnapshots.pop();
  saveData(data);
}

function renderDashboard() {
  checkAndSaveWeeklySnapshot();
  var el = document.getElementById('dash-app');
  if (!el) return;
  var data = getData();
  if (!data) return;
  var scores = calcProfileScores(data);
  var filled = Object.values(scores).filter(function(v) { return v !== null; });
  var overall = filled.length ? Math.round(filled.reduce(function(a,b){return a+b;},0) / filled.length) : null;
  var isNewUser = (!data.log || data.log.length === 0) && (!data.fights || data.fights.length === 0);

  // Week completion rings data
  var weekId = getWeekId();
  var dayCompletion = DAY_NAMES.map(function(day) {
    var blocks = (data.weekPlan && data.weekPlan[day]) ? data.weekPlan[day].filter(function(b){return b.type!=='meta';}) : [];
    var done = 0;
    blocks.forEach(function(b, bi) {
      var key = day + '_' + bi + '_' + weekId;
      if (data.completedBlocks && data.completedBlocks[key]) done++;
    });
    return { total: blocks.length, done: done };
  });
  var todayDow = (new Date().getDay() + 6) % 7;
  var totalDone = dayCompletion.reduce(function(s,d){return s+d.done;},0);
  var totalPlanned = dayCompletion.reduce(function(s,d){return s+d.total;},0);

  // SVG Ring for overall score (larger on desktop)
  var ringSize = window.innerWidth >= 768 ? 180 : 140;
  var ringR = 52;
  var ringPct = overall !== null ? overall : 0;
  var circumference = 2 * Math.PI * ringR;
  var ringColor = ringPct >= 70 ? 'var(--green)' : ringPct >= 40 ? 'var(--gold)' : 'var(--red)';
  // Weekly comparison
  var weekDiff = '';
  if (data.weeklySnapshots && data.weeklySnapshots.length >= 2 && overall !== null) {
    var prevScore = data.weeklySnapshots[1].overallScore;
    if (prevScore !== null && prevScore !== undefined) {
      var d = overall - prevScore;
      if (d > 0) weekDiff = '<div style="font-family:\'Space Mono\',monospace;font-size:var(--fs-xs);color:var(--green);margin-top:4px;">+' + d + ' seit letzter Woche</div>';
      else if (d < 0) weekDiff = '<div style="font-family:\'Space Mono\',monospace;font-size:var(--fs-xs);color:var(--red);margin-top:4px;">' + d + ' seit letzter Woche</div>';
    }
  }

  // Recent completed blocks (last 5)
  var recentBlocks = [];
  if (data.completedBlocks) {
    Object.keys(data.completedBlocks).forEach(function(k) {
      if (k.endsWith(weekId)) {
        var cb = data.completedBlocks[k];
        recentBlocks.push({ key: k, title: cb.title || '', type: cb.type || '', date: cb.date || '' });
      }
    });
    recentBlocks.sort(function(a,b) { return b.date.localeCompare(a.date); });
    recentBlocks = recentBlocks.slice(0, 5);
  }

  // Benchmark sparklines (top 3)
  var hist = data.benchmarkHistory || {};
  var BENCH = getBenchmarks();
  var topBench = BENCH.filter(function(b) { return hist[b.id] && hist[b.id].length >= 2; })
    .sort(function(a,b) { return (hist[b.id]||[]).length - (hist[a.id]||[]).length; }).slice(0, 3);

  // Radar pills
  var pillsHTML = RADAR_AXES.map(function(a) {
    var val = scores[a.key];
    return '<div style="flex-shrink:0;text-align:center;padding:6px 10px;border-radius:var(--radius-full);background:' + a.hex + '18;border:1px solid ' + a.hex + '30;min-width:50px;">' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;color:' + a.hex + ';">' + (val !== null ? val : '\u2014') + '</div>' +
      '<div style="font-family:\'Space Mono\',monospace;font-size:7px;color:#555;letter-spacing:1px;">' + a.label + '</div>' +
    '</div>';
  }).join('');

  var DAY_SHORT = ['MO','DI','MI','DO','FR','SA','SO'];

  // HRV Ampel data
  var hrvArr = data.hrv || [];
  var hrvStatus = '\u2014';
  var hrvColor = '#555';
  var hrvLabel = 'Keine Daten';
  if (hrvArr.length > 0) {
    var lastHrv = hrvArr[0].value;
    if (lastHrv >= 60) { hrvStatus = '\u2705'; hrvColor = 'var(--green)'; hrvLabel = 'GR\u00dcN'; }
    else if (lastHrv >= 40) { hrvStatus = '\u26a0\ufe0f'; hrvColor = 'var(--gold)'; hrvLabel = 'GELB'; }
    else { hrvStatus = '\ud83d\udd34'; hrvColor = 'var(--red)'; hrvLabel = 'ROT'; }
  }

  // Axis pills in 2x2 grid
  var pillsGridHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;">' +
    RADAR_AXES.map(function(a) {
      var val = scores[a.key];
      return '<div style="text-align:center;padding:6px 8px;border-radius:12px;background:' + a.hex + '18;border:1px solid ' + a.hex + '30;">' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:' + a.hex + ';">' + (val !== null ? val : '\u2014') + '</div>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:7px;color:#555;letter-spacing:1px;">' + a.label + '</div>' +
      '</div>';
    }).join('') +
  '</div>';

  el.innerHTML =
    '<div class="dash-bento stagger">' +
    (isNewUser ? '<div class="bento-full bento-cell glass" style="text-align:center;padding:40px 24px;"><div style="font-family:\'Bebas Neue\',sans-serif;font-size:32px;color:var(--white);margin-bottom:8px;">WILLKOMMEN BEI FIGHTOS</div><div style="font-size:15px;color:#666;max-width:500px;margin:0 auto 24px;line-height:1.6;">Dein persönlicher Boxing-Coach. Starte mit deinem ersten Schritt:</div><div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;"><button onclick="showPage(\'wochenplan\')" style="font-family:\'Space Mono\',monospace;font-size:12px;color:var(--red);background:none;border:1px solid rgba(232,0,13,.3);padding:12px 24px;border-radius:var(--radius-md);cursor:pointer;">Wochenplan ansehen</button><button onclick="showPage(\'tests\')" style="font-family:\'Space Mono\',monospace;font-size:12px;color:var(--gold);background:none;border:1px solid rgba(245,197,24,.3);padding:12px 24px;border-radius:var(--radius-md);cursor:pointer;">Ersten Test machen</button><button onclick="showPage(\'mental\')" style="font-family:\'Space Mono\',monospace;font-size:12px;color:var(--blue);background:none;border:1px solid rgba(41,121,255,.3);padding:12px 24px;border-radius:var(--radius-md);cursor:pointer;">Alter Ego erstellen</button></div></div>' : '') +

    // ── ROW 1: HERO (wide) + SCORE RING ──
    '<div class="bento-cell bento-wide bento-hero glass glow-card" style="background:linear-gradient(135deg,rgba(232,0,13,.06),rgba(245,197,24,.03));">' +
      '<div style="display:flex;align-items:center;gap:20px;">' +
        '<div style="flex:1;">' +
          '<div class="glow-text" style="font-family:\'Bebas Neue\',sans-serif;font-size:52px;line-height:1;color:var(--white);">' + getDisplayName() + '</div>' +
          '<div id="dash-countdown-hero" style="margin-top:8px;"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="bento-cell bento-hero glass" style="text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
      '<div style="display:inline-block;filter:drop-shadow(0 0 12px rgba(232,0,13,.25));">' +
        '<svg width="' + ringSize + '" height="' + ringSize + '" viewBox="0 0 120 120">' +
          '<defs><linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="var(--red)"/><stop offset="100%" stop-color="var(--gold)"/></linearGradient></defs>' +
          '<circle cx="60" cy="60" r="' + ringR + '" stroke="var(--surface-2)" stroke-width="8" fill="none"/>' +
          '<circle id="dash-ring-fg" cx="60" cy="60" r="' + ringR + '" stroke="url(#ring-grad)" stroke-width="6" fill="none" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + circumference + '" stroke-linecap="round" transform="rotate(-90 60 60)"/>' +
          '<text id="dash-ring-num" x="60" y="54" text-anchor="middle" style="font-family:\'Bebas Neue\',sans-serif;font-size:32px;fill:var(--white);">0</text>' +
          '<text x="60" y="72" text-anchor="middle" style="font-family:\'Space Mono\',monospace;font-size:8px;fill:var(--text-subtle);letter-spacing:2px;">GESAMT</text>' +
        '</svg>' +
      '</div>' +
      weekDiff +
    '</div>' +

    // ── ROW 2: DIESE WOCHE + CHECKLIST TODAY + HRV AMPEL ──
    '<div class="bento-cell glass">' +
      '<div class="sec-label">DIESE WOCHE <span style="font-family:\'Space Mono\',monospace;font-size:11px;color:#555;margin-left:8px;">' + totalDone + '/' + totalPlanned + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;gap:4px;margin-top:12px;">' +
        DAY_SHORT.map(function(d, i) {
          var dc = dayCompletion[i];
          var pct = dc.total > 0 ? dc.done / dc.total : 0;
          var c = 2 * Math.PI * 14;
          var off = c * (1 - pct);
          var col = pct >= 1 ? 'var(--green)' : pct > 0 ? 'var(--gold)' : '#1a1a1a';
          var isToday = i === todayDow;
          return '<div style="text-align:center;' + (isToday ? 'transform:scale(1.15);' : 'opacity:.7;') + '">' +
            '<svg width="36" height="36" viewBox="0 0 36 36">' +
              '<circle cx="18" cy="18" r="14" stroke="var(--surface-2)" stroke-width="3" fill="none"/>' +
              '<circle id="week-ring-' + i + '" data-target="' + off + '" cx="18" cy="18" r="14" stroke="' + col + '" stroke-width="3" fill="none" stroke-dasharray="' + c + '" stroke-dashoffset="' + c + '" stroke-linecap="round" transform="rotate(-90 18 18)" style="transition:stroke-dashoffset .6s cubic-bezier(.25,.8,.25,1);"/>' +
              (pct >= 1 ? '<text x="18" y="22" text-anchor="middle" style="font-size:14px;fill:var(--green);">\u2713</text>' : '<text x="18" y="22" text-anchor="middle" style="font-family:\'Space Mono\',monospace;font-size:10px;fill:var(--text-muted);">' + dc.done + '</text>') +
            '</svg>' +
            '<div style="font-family:\'Space Mono\',monospace;font-size:8px;color:' + (isToday ? 'var(--white)' : 'var(--text-subtle)') + ';margin-top:2px;">' + d + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +

    '<div class="bento-cell glass">' +
      '<div class="sec-label">CHECKLIST HEUTE</div>' +
      '<div id="checklist-score" style="margin-top:8px;"></div>' +
      '<div id="dash-hinweise" style="margin-top:8px;"></div>' +
    '</div>' +

    '<div class="bento-cell glass">' +
      '<div class="sec-label">HRV AMPEL</div>' +
      '<div style="text-align:center;margin-top:16px;">' +
        '<div style="font-size:36px;">' + hrvStatus + '</div>' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:' + hrvColor + ';margin-top:6px;">' + hrvLabel + '</div>' +
        (hrvArr.length > 0 ? '<div id="dash-hrv-val" data-target="' + hrvArr[0].value + '" style="font-family:\'Space Mono\',monospace;font-size:12px;color:var(--text-muted);margin-top:4px;">0 ms</div>' : '') +
      '</div>' +
    '</div>' +

    // ── ROW 3: TRAININGSPLAN HEUTE (full width) ──
    '<div class="bento-cell bento-full glass">' +
      '<div class="sec-label">TRAININGSPLAN HEUTE</div>' +
      '<div id="daily-combined" style="margin-top:8px;"></div>' +
    '</div>' +

    // ── ROW 4: AKTIVIT\u00c4T (wide) + K\u00c4MPFE ──
    '<div class="bento-cell bento-wide bento-subtle glass">' +
      '<div class="sec-label">AKTIVIT\u00c4T</div>' +
      '<div style="margin-top:8px;">' +
      (recentBlocks.length > 0 ?
        recentBlocks.map(function(rb) {
          var tc = TYPE_COLORS[rb.type] || 'var(--grey)';
          var d = rb.date ? new Date(rb.date) : null;
          var timeStr = d ? (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() : '';
          return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);">' +
            '<div style="width:4px;height:28px;border-radius:var(--radius-sm);background:' + tc + ';flex-shrink:0;"></div>' +
            '<div style="flex:1;font-family:\'DM Sans\',sans-serif;font-size:14px;color:var(--light);">' + (rb.title || rb.type).replace(/</g,'&lt;') + '</div>' +
            '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:#444;">' + timeStr + '</div>' +
            '<div style="font-size:12px;color:var(--green);">\u2713</div>' +
          '</div>';
        }).join('') :
        '<div id="recent-log"></div>'
      ) +
      '</div>' +
    '</div>' +

    '<div class="bento-cell bento-subtle glass">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div class="sec-label" style="cursor:pointer;" onclick="showPage(\'fights\')">K\u00c4MPFE</div>' +
        '<button class="submit-btn" style="padding:6px 14px;font-size:11px;border-radius:var(--radius-md);" onclick="openFightModal()">+</button>' +
      '</div>' +
      '<div id="fight-log-list" style="margin-top:8px;"></div>' +
    '</div>' +

    // ── ROW 5: BENCHMARKS (full width) ──
    (topBench.length > 0 ?
      '<div class="bento-cell bento-full glass">' +
        '<div class="sec-label" style="cursor:pointer;" onclick="showPage(\'tests\')">BENCHMARKS</div>' +
        '<div class="divider-gradient" style="margin:8px 0;"></div>' +
        '<div style="display:flex;gap:16px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;">' +
          topBench.map(function(b) {
            var h = hist[b.id] || [];
            var val = data.benchmarks[b.id] || 0;
            var trend = getBenchTrend(h, b.inverse);
            return '<div style="flex-shrink:0;min-width:120px;cursor:pointer;" onclick="showPage(\'tests\')">' +
              '<canvas id="dash-spark-' + b.id + '" width="120" height="40" style="display:block;width:120px;height:40px;"></canvas>' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">' +
                '<span style="font-family:\'Space Mono\',monospace;font-size:12px;color:var(--white);">' + val + '<span style="font-size:9px;color:#444;"> ' + b.unit + '</span></span>' +
                '<span style="font-size:12px;color:' + trend.color + ';">' + trend.arrow + '</span>' +
              '</div>' +
              '<div style="font-family:\'Space Mono\',monospace;font-size:8px;color:#333;letter-spacing:1px;">' + b.name.replace(/\s.*/, '') + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>'
    : '') +

    // ── DESKTOP EXTRAS (inside bento grid) ──
    // ── RADAR CHART (own row) ──
    '<div class="bento-cell bento-full bento-hero glass" style="text-align:center;padding:var(--space-6);">' +
      '<div class="sec-label">PERFORMANCE PROFIL</div>' +
      '<canvas id="rpg-radar" width="' + (window.innerWidth >= 768 ? 400 : 300) + '" height="' + (window.innerWidth >= 768 ? 400 : 300) + '" style="max-width:' + (window.innerWidth >= 768 ? 400 : 300) + 'px;display:block;margin:0 auto;"></canvas>' +
    '</div>' +

    '<div class="bento-cell bento-full dash-hide-mobile" style="background:transparent;border:none;backdrop-filter:none;">' +
      '<div id="dash-stats" style="margin-top:0;"></div>' +
      '<div id="saeulen-self-rating" style="margin-top:16px;"></div>' +
      '<div id="bench-summary" style="margin-top:12px;font-family:\'Space Mono\',monospace;font-size:11px;color:#555;cursor:pointer;" onclick="showPage(\'tests\')"></div>' +
      '<div style="margin-top:16px;display:flex;align-items:center;gap:8px;">' +
        '<input type="date" id="fight-date-input" class="form-input" style="width:auto;padding:6px 10px;font-size:12px;" onchange="updateFightDate()">' +
        '<button class="submit-btn" style="padding:4px 10px;font-size:10px;" onclick="clearFightDate()">\u00d7</button>' +
      '</div>' +
    '</div>' +

    '</div>'; // close dash-bento

  // Render sub-components
  renderFightCountdown();
  renderDashStats();
  renderHinweise();
  renderDailyCombined();
  renderFightLog();
  if (recentBlocks.length === 0) renderRecentLog();
  renderSaeulenSelfRating();

  // ═══ ANIMATION CHOREOGRAPHY ═══

  // 300ms: Score ring + number count-up
  setTimeout(function() {
    var ringFg = document.getElementById('dash-ring-fg');
    var ringNum = document.getElementById('dash-ring-num');
    if (ringFg && ringNum && overall !== null) {
      ringFg.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.25,.8,.25,1)';
      ringFg.style.strokeDashoffset = circumference * (1 - ringPct / 100);
      animateValue(ringNum, 0, overall, 1200);
    }
  }, 300);

  // 500ms: Radar chart
  setTimeout(function() {
    renderRadarChart(scores);
  }, 500);

  // 600ms: Week rings stagger (MO→SO, 50ms apart)
  setTimeout(function() {
    for (var wi = 0; wi < 7; wi++) {
      (function(idx) {
        setTimeout(function() {
          var ring = document.getElementById('week-ring-' + idx);
          if (ring) ring.style.strokeDashoffset = ring.getAttribute('data-target');
        }, idx * 50);
      })(wi);
    }
  }, 600);

  // 700ms: HRV value count-up
  setTimeout(function() {
    var hrvEl = document.getElementById('dash-hrv-val');
    if (hrvEl) {
      var target = parseInt(hrvEl.getAttribute('data-target')) || 0;
      if (target > 0) animateValue(hrvEl, 0, target, 800, ' ms');
    }
  }, 700);

  // 800ms: Sparklines
  setTimeout(function() {
    topBench.forEach(function(b) {
      drawSparkline('dash-spark-' + b.id, hist[b.id], b.color || '#e8000d', b.inverse);
    });
  }, 800);
}

// Selbsteinschätzung der 8 Säulen (1-5 Punkte)
function renderSaeulenSelfRating() {
  var el = document.getElementById('saeulen-self-rating');
  if (!el) return;
  var data = getData();
  if (!data) return;
  if (!data.saeulenRatings) data.saeulenRatings = {};
  var sr = data.saeulenRatings;

  var ratingAxes = [
    { key:'metabol',  label:'Ausdauer',      hint:'Wie ist deine Kondition in Runde 3?' },
    { key:'kognitiv', label:'Kognition',      hint:'Liest du den Gegner? Reagierst du schnell?' },
    { key:'ernaehr',  label:'Ernährung',      hint:'Isst du nach Plan? Makros im Griff?' },
    { key:'recovery', label:'Regeneration',   hint:'Schläfst du genug? Fühlst du dich erholt?' },
    { key:'ringiQ',   label:'Ring IQ',        hint:'Kontrollierst du Distanz und Timing?' },
    { key:'psyche',   label:'Mental',         hint:'Bist du vor dem Kampf ruhig und fokussiert?' },
    { key:'mobil',    label:'Mobilität',      hint:'Bewegst du dich frei? Keine Einschränkungen?' }
  ];

  var lastUpdated = data.saeulenRatingsDate || '';
  var daysAgo = lastUpdated ? Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86400000) : 999;
  var needsUpdate = daysAgo > 14;

  el.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;cursor:pointer;" onclick="var c=document.getElementById(\'sr-form\');c.style.display=c.style.display===\'none\'?\'block\':\'none\'">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;">SÄULEN-CHECK' +
      (needsUpdate ? ' <span style="font-size:11px;color:var(--red);">AKTUALISIEREN</span>' : '') +
    '</div>' +
    '<span style="font-family:\'Space Mono\',monospace;font-size:10px;color:#333;">' +
      (lastUpdated ? 'Vor ' + daysAgo + ' Tagen' : 'Noch nie bewertet') +
      ' ▾</span>' +
  '</div>' +
  '<div id="sr-form" style="display:' + (needsUpdate ? 'block' : 'none') + ';">' +
    '<div style="font-family:\'DM Sans\',sans-serif;font-size:11px;color:#444;margin-bottom:12px;">Bewerte dich ehrlich 1-5. Kraft + Ausdauer + Ernährung fliessen auch aus Benchmarks/HRV ein.</div>' +
    ratingAxes.map(function(a) {
      var val = sr[a.key] || 0;
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--surface-1);">' +
        '<div style="min-width:80px;"><div style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;letter-spacing:1px;">' + a.label.toUpperCase() + '</div></div>' +
        '<div style="display:flex;gap:3px;">' +
          [1,2,3,4,5].map(function(n) {
            var filled = n <= val;
            var axObj = RADAR_AXES.find(function(r) { return r.key === a.key; });
            var color = axObj ? axObj.hex : '#555';
            return '<span onclick="setSaeulenRating(\'' + a.key + '\',' + n + ')" style="display:inline-block;width:18px;height:18px;border-radius:50%;cursor:pointer;transition:all .15s;' +
              (filled ? 'background:' + color + ';' : 'background:var(--surface-2);border:1px solid var(--surface-3);') +
            '" title="' + n + '/5"></span>';
          }).join('') +
        '</div>' +
        '<div style="flex:1;font-family:\'DM Sans\',sans-serif;font-size:10px;color:#333;margin-left:4px;">' + a.hint + '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function setSaeulenRating(key, val) {
  var data = getData();
  if (!data) return;
  if (!data.saeulenRatings) data.saeulenRatings = {};
  data.saeulenRatings[key] = data.saeulenRatings[key] === val ? 0 : val;
  data.saeulenRatingsDate = new Date().toISOString().split('T')[0];
  saveData(data);
  renderSaeulenSelfRating();
  renderDashStats();
}

// ===== DASHBOARD BENCH SUMMARY =====
function renderBenchSummary() {
  const el = document.getElementById('bench-summary');
  if (!el) return;
  const data = getData();
  if (!data) return;
  const b = data.benchmarks || {};
  const hist = data.benchmarkHistory || {};
  const BENCH = getBenchmarks();
  const filled = BENCH.filter(x => b[x.id] && b[x.id] > 0).length;
  const scores = calcProfileScores(data);
  const vals = [scores.kraft, scores.metabol, scores.ernaehr].filter(v => v !== null);
  const avg = vals.length ? Math.round(vals.reduce((a,v) => a+v, 0) / vals.length) : null;

  // Mini Sparklines für Top-3 Benchmarks (meiste History)
  var ranked = BENCH.filter(function(x) { return hist[x.id] && hist[x.id].length >= 2; })
    .sort(function(a, bb) { return (hist[bb.id] || []).length - (hist[a.id] || []).length; })
    .slice(0, 3);

  var summaryText = avg !== null
    ? filled + '/' + BENCH.length + ' Tests \u00b7 \u00d8 ' + avg + '% Elite-Level'
    : filled + '/' + BENCH.length + ' Tests eingetragen';

  el.innerHTML = summaryText;

  if (ranked.length > 0) {
    var sparksDiv = document.createElement('div');
    sparksDiv.style.cssText = 'display:flex;gap:12px;margin-top:8px;';
    ranked.forEach(function(bench) {
      var h = hist[bench.id] || [];
      var val = b[bench.id] || 0;
      var trend = getBenchTrend(h, bench.inverse);
      var daysAgo = h.length ? Math.floor((Date.now() - new Date(h[h.length-1].date).getTime()) / 86400000) : 999;
      var item = document.createElement('div');
      item.style.cssText = 'cursor:pointer;';
      item.onclick = function() { showPage('tests'); };
      item.innerHTML = '<canvas id="dash-spark-' + bench.id + '" width="80" height="30" style="display:block;"></canvas>' +
        '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;margin-top:2px;">' + val + ' ' + bench.unit +
        ' <span style="color:' + trend.color + ';">' + trend.arrow + '</span>' +
        (daysAgo > 30 ? ' <span style="color:var(--gold);">!</span>' : '') +
        '</div>';
      sparksDiv.appendChild(item);
    });
    el.parentNode.appendChild(sparksDiv);

    setTimeout(function() {
      ranked.forEach(function(bench) {
        drawSparkline('dash-spark-' + bench.id, hist[bench.id], bench.color || '#e8000d', bench.inverse);
      });
    }, 50);
  }
}

// ===== ACCOUNT PAGE =====
function renderAccountPage() {
  const el = document.getElementById('page-account');
  if (!el) return;
  const users = safeParse('fos_users', {});
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

  const ws = u.weekSchedule || getDefaultWeekSchedule('18:00');

  // Hero stats
  var displayName = getDisplayName();
  var initials = displayName.substring(0, 2).toUpperCase();
  var created = u.created ? new Date(u.created) : null;
  var memberSince = created ? created.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : 'Unbekannt';
  var totalFights = (data && data.fights) ? data.fights.length : 0;
  var totalSessions = (data && data.log) ? data.log.length : 0;
  var firstLog = (data && data.log && data.log.length) ? data.log[data.log.length - 1].date : null;
  var daysActive = firstLog ? Math.max(1, Math.round((Date.now() - new Date(firstLog + 'T00:00:00').getTime()) / 86400000)) : 0;

  // Achievements
  var achievements = [
    { id: 'first-log', name: 'Erste Session', desc: 'Erstes Training geloggt', done: totalSessions >= 1 },
    { id: '10-sessions', name: '10 Sessions', desc: '10 Trainings absolviert', done: totalSessions >= 10 },
    { id: '50-sessions', name: '50 Sessions', desc: '50 Trainings absolviert', done: totalSessions >= 50 },
    { id: 'first-fight', name: 'Erster Kampf', desc: 'Ersten Kampf eingetragen', done: totalFights >= 1 },
    { id: '5-fights', name: '5 Kämpfe', desc: '5 Kämpfe absolviert', done: totalFights >= 5 },
    { id: 'alter-ego', name: 'Alter Ego', desc: 'Kampf-Identität erstellt', done: !!(data && data.alterEgo && data.alterEgo.name) },
    { id: '30-days', name: '30 Tage aktiv', desc: 'Seit 30+ Tagen dabei', done: daysActive >= 30 },
    { id: 'benchmark', name: 'Getestet', desc: 'Ersten Benchmark eingetragen', done: !!(data && data.benchmarks && Object.values(data.benchmarks).some(function(v){return v > 0;})) }
  ];
  var doneCount = achievements.filter(function(a){return a.done;}).length;

  el.innerHTML = `
    <!-- HERO -->
    <div style="display:flex;align-items:center;gap:24px;padding:32px 0;border-bottom:1px solid var(--surface-2);margin-bottom:28px;flex-wrap:wrap;">
      <div style="width:80px;height:80px;border-radius:50%;background:var(--surface-1);border:2px solid var(--red);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-family:'Bebas Neue',sans-serif;font-size:var(--fs-xl);color:var(--white);letter-spacing:2px;">${escapeHTML(initials)}</span>
      </div>
      <div style="flex:1;min-width:200px;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:var(--fs-2xl);color:var(--white);letter-spacing:2px;line-height:1;">${escapeHTML(displayName).toUpperCase()}</div>
        <div style="font-family:'Space Mono',monospace;font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px;">Mitglied seit ${memberSince}</div>
      </div>
      <div style="display:flex;gap:20px;">
        <div style="text-align:center;"><div style="font-family:'Bebas Neue',sans-serif;font-size:var(--fs-xl);color:var(--white);">${totalFights}</div><div style="font-family:'Space Mono',monospace;font-size:var(--fs-xs);color:var(--text-muted);">KÄMPFE</div></div>
        <div style="text-align:center;"><div style="font-family:'Bebas Neue',sans-serif;font-size:var(--fs-xl);color:var(--white);">${totalSessions}</div><div style="font-family:'Space Mono',monospace;font-size:var(--fs-xs);color:var(--text-muted);">SESSIONS</div></div>
        <div style="text-align:center;"><div style="font-family:'Bebas Neue',sans-serif;font-size:var(--fs-xl);color:var(--white);">${daysActive}</div><div style="font-family:'Space Mono',monospace;font-size:var(--fs-xs);color:var(--text-muted);">TAGE</div></div>
      </div>
    </div>

    <!-- ACHIEVEMENTS -->
    <div style="margin-bottom:28px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:var(--fs-lg);color:var(--white);letter-spacing:1.5px;margin-bottom:4px;">MEILENSTEINE <span style="font-family:'Space Mono',monospace;font-size:var(--fs-xs);color:var(--text-muted);">${doneCount}/${achievements.length}</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
        ${achievements.map(function(a) {
          return '<div style="padding:10px 14px;border-radius:var(--radius-md);border:1px solid ' + (a.done ? 'rgba(0,200,83,.3)' : 'var(--surface-2)') + ';background:' + (a.done ? 'rgba(0,200,83,.06)' : 'var(--surface-1)') + ';min-width:120px;flex:1;">' +
            '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:var(--fs-base);color:' + (a.done ? 'var(--green)' : 'var(--text-subtle)') + ';">' + (a.done ? '\u2713 ' : '') + a.name + '</div>' +
            '<div style="font-family:\'Space Mono\',monospace;font-size:var(--fs-xs);color:var(--text-muted);">' + a.desc + '</div>' +
          '</div>';
        }).join('')}
      </div>
    </div>

    <!-- EINSTELLUNGEN -->
    <div style="font-family:'Bebas Neue',sans-serif;font-size:var(--fs-lg);color:var(--white);letter-spacing:1.5px;margin-bottom:16px;">EINSTELLUNGEN</div>
    <div class="account-wrap">
      <div class="account-section">
        <div class="account-section-title">PERSÖNLICHE DATEN</div>
        <div class="account-grid">
          <div class="form-group">
            <label class="form-label">Geburtsjahr</label>
            <select class="form-select" id="acc-birthyear"><option value="">–</option>${yOpts}</select>
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
          <div class="form-group">
            <label class="form-label">Zugang zu Gym/Hanteln?</label>
            <select class="form-select" id="acc-gym">
              <option value="full" ${u.gymAccess==='full'?'selected':''}>Ja, volles Gym</option>
              <option value="basic" ${u.gymAccess==='basic'?'selected':''}>Basis (Hanteln, Klimmzugstange)</option>
              <option value="none" ${u.gymAccess==='none'||!u.gymAccess?'selected':''}>Nein, nur Koerpergewicht</option>
            </select>
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
          ${buildScheduleHTML(ws, 'acc')}
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

      <div class="account-section" style="margin-top:32px;padding-top:24px;border-top:2px solid rgba(232,0,13,.2);">
        <div class="account-section-title" style="color:var(--red);">DANGER ZONE</div>
        <div style="font-size:var(--fs-sm);color:var(--text-muted);margin-bottom:12px;line-height:1.6;">Alle Trainingsdaten, Kämpfe, Benchmarks und Einstellungen werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.</div>
        <button onclick="deleteAllData()" style="font-family:'Space Mono',monospace;font-size:var(--fs-xs);color:var(--red);background:none;border:1px solid rgba(232,0,13,.3);padding:12px 24px;border-radius:var(--radius-md);cursor:pointer;min-height:44px;">ALLE DATEN LÖSCHEN</button>
      </div>
    </div>`;
}

function saveAccountPage() {
  const users = safeParse('fos_users', {});
  if (!users[currentUser]) return;

  users[currentUser].birthYear = document.getElementById('acc-birthyear').value;
  users[currentUser].weight = document.getElementById('acc-weight').value;
  users[currentUser].height = parseInt(document.getElementById('acc-height').value) || 175;
  users[currentUser].experienceLevel = document.getElementById('acc-experience').value;
  users[currentUser].boxingYears = parseInt(document.getElementById('acc-years').value) || 0;
  users[currentUser].goal = document.getElementById('acc-goal').value;
  users[currentUser].fitnessLevel = document.getElementById('acc-fitness').value;
  users[currentUser].gymAccess = document.getElementById('acc-gym').value;
  users[currentUser].workStart = document.getElementById('acc-work-start').value;
  users[currentUser].workEnd = document.getElementById('acc-work-end').value;

  var ws = readScheduleFromDOM('acc');
  users[currentUser].weekSchedule = ws;
  var times = Object.values(ws).filter(function(d) { return d.time; }).map(function(d) { return d.time; });
  users[currentUser].trainingTime = times[0] || '18:00';

  localStorage.setItem('fos_users', JSON.stringify(users));

  // Update fight date + regenerate week plan
  const data = getData();
  if (data) {
    if (!data.upcomingFights) data.upcomingFights = [];
    const newFight = document.getElementById('acc-fightdate').value || '';
    if (newFight) {
      // Update primary in upcomingFights or add it
      if (data.upcomingFights.length > 0) {
        data.upcomingFights[0].date = newFight;
      } else {
        data.upcomingFights.push({ date: newFight, label: '' });
      }
      syncPrimaryFightDate(data);
    } else {
      // Cleared – remove primary, shift if others exist
      if (data.upcomingFights.length > 1) {
        data.upcomingFights.shift();
        syncPrimaryFightDate(data);
      } else {
        data.upcomingFights = [];
        data.fightDate = '';
      }
    }
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

function deleteAllData() {
  if (!confirm('ACHTUNG: Alle Trainingsdaten, Kämpfe, Benchmarks und Einstellungen werden UNWIDERRUFLICH gelöscht. Fortfahren?')) return;
  if (!confirm('Bist du WIRKLICH sicher? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
  localStorage.removeItem('fos_data_' + currentUser);
  // Clear all checklist keys for this user
  for (var i = localStorage.length - 1; i >= 0; i--) {
    var key = localStorage.key(i);
    if (key && key.startsWith('fos_checklist_' + currentUser)) localStorage.removeItem(key);
  }
  showToast('Alle Daten gelöscht', 'info');
  renderAccountPage();
  renderDashboard();
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
        <div class="tests-overall-score">${overall !== null ? overall + '%' : '–'}</div>
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
              <span class="tests-axis-val" style="color:${val !== null ? a.hex : '#333'};">${val !== null ? val + '%' : '–'}</span>
            </div>
            <div class="tests-axis-bar"><div class="tests-axis-fill" style="width:${val||0}%;background:${a.hex};"></div></div>
          </div>
        </div>`;
      }).join('')}
      ${vo2max ? `<div style="font-family:'Space Mono',monospace;font-size:11px;color:#555;margin-top:6px;padding-top:8px;border-top:1px solid var(--surface-2);">VO₂max (geschätzt): <strong style="color:var(--blue);">${vo2max} ml/kg/min</strong></div>` : ''}
      ${weakest ? `<div class="tests-weakest">Schwächstes Glied: <strong>${weakest.label} (${weakest.val}%)</strong> – das Fass-Prinzip: Dein Gesamtniveau wird von der schwächsten Säule begrenzt.</div>` : ''}
    </div>
  </div>`;

  // --- DEIN FORTSCHRITT section ---
  let progressHTML = '';
  {
    const SPARK_CHARS = '\u2581\u2582\u2583\u2585\u2586\u2587';
    const eightWeeksMs = 8 * 7 * 86400000;
    const cutoff = new Date(Date.now() - eightWeeksMs);
    const progressItems = [];

    BENCHMARKS.forEach(b => {
      const hist = data.benchmarkHistory[b.id] || [];
      if (hist.length < 2) return;

      const current = hist[hist.length - 1];
      // Find entry closest to 8 weeks ago, or use earliest
      let refEntry = hist[0];
      for (let i = hist.length - 1; i >= 0; i--) {
        if (new Date(hist[i].date) <= cutoff) { refEntry = hist[i]; break; }
      }
      if (refEntry === current) refEntry = hist[0]; // fallback to earliest if only recent entries

      const curVal = current.value;
      const refVal = refEntry.value;
      const diff = curVal - refVal;
      const absDiff = Math.abs(diff);
      const pctChange = refVal !== 0 ? Math.round(Math.abs(diff / refVal) * 100) : 0;
      const improved = b.inverse ? diff < 0 : diff > 0;
      const declined = b.inverse ? diff > 0 : diff < 0;
      const color = improved ? 'var(--green)' : declined ? 'var(--red)' : '#555';
      const arrow = improved ? '\u2191' : declined ? '\u2193' : '\u2192';

      // Sparkline using block characters
      const vals = hist.map(h => h.value);
      const minV = Math.min(...vals), maxV = Math.max(...vals);
      const range = maxV - minV || 1;
      const sparkline = vals.map(v => {
        let idx = Math.round(((v - minV) / range) * (SPARK_CHARS.length - 1));
        if (b.inverse) idx = SPARK_CHARS.length - 1 - idx;
        return SPARK_CHARS[idx];
      }).join('');

      progressItems.push({
        name: b.name,
        unit: b.unit,
        curVal, refVal, diff, absDiff, pctChange, improved, declined, color, arrow, sparkline,
        clusterColor: b.color
      });
    });

    if (progressItems.length > 0) {
      // Overall summary
      const improvementPcts = progressItems.filter(p => p.pctChange > 0);
      const improvedCount = progressItems.filter(p => p.improved).length;
      const avgPct = improvementPcts.length ? Math.round(improvementPcts.reduce((a, p) => a + (p.improved ? p.pctChange : -p.pctChange), 0) / improvementPcts.length) : 0;
      let summaryText;
      if (improvedCount > 0 && avgPct > 0) {
        summaryText = 'Deine Leistung hat sich im Schnitt um <strong style="color:var(--green);">' + avgPct + '%</strong> verbessert (' + improvedCount + '/' + progressItems.length + ' Tests \u2191)';
      } else if (avgPct < 0) {
        summaryText = 'Achtung: Deine Leistung ist im Schnitt um <strong style="color:var(--red);">' + Math.abs(avgPct) + '%</strong> gesunken';
      } else {
        summaryText = 'Deine Werte sind stabil geblieben \u2014 weiter dranbleiben!';
      }

      progressHTML = '<div class="tests-cluster" style="margin-bottom:20px;">'
        + '<div class="tests-cluster-header">'
        + '<span class="tests-cluster-title" style="color:var(--gold);">DEIN FORTSCHRITT</span>'
        + '<span class="tests-cluster-avg" style="color:#888;">Vergleich mit vor 8 Wochen</span>'
        + '</div>'
        + '<div style="font-family:\'Space Mono\',monospace;font-size:12px;color:#aaa;padding:10px 14px 6px;border-bottom:1px solid var(--surface-2);">'
        + summaryText
        + '</div>'
        + progressItems.map(p =>
          '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--surface-1);font-family:\'Space Mono\',monospace;font-size:12px;gap:4px;">'
          + '<div style="flex:1;min-width:0;">'
          + '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:15px;letter-spacing:1px;color:#ccc;">' + p.name + '</div>'
          + '<div style="color:#666;font-size:11px;margin-top:2px;">' + p.refVal + ' \u2192 ' + p.curVal + ' ' + p.unit + '</div>'
          + '</div>'
          + '<div style="text-align:center;padding:0 12px;font-size:11px;color:#555;letter-spacing:1px;" title="Verlauf">' + p.sparkline + '</div>'
          + '<div style="text-align:right;min-width:90px;">'
          + '<span style="color:' + p.color + ';font-weight:bold;font-size:14px;">' + p.arrow + ' ' + (p.absDiff % 1 === 0 ? p.absDiff : p.absDiff.toFixed(1)) + ' ' + p.unit + '</span>'
          + '<div style="color:' + p.color + ';font-size:11px;">' + p.pctChange + '%</div>'
          + '</div>'
          + '</div>'
        ).join('')
        + '</div>';
    } else {
      progressHTML = '<div class="tests-cluster" style="margin-bottom:20px;">'
        + '<div class="tests-cluster-header">'
        + '<span class="tests-cluster-title" style="color:var(--gold);">DEIN FORTSCHRITT</span>'
        + '</div>'
        + '<div style="font-family:\'Space Mono\',monospace;font-size:12px;color:#555;padding:14px;text-align:center;">'
        + 'Trage regelm\u00e4\u00dfig Werte ein um deinen Fortschritt zu sehen'
        + '</div>'
        + '</div>';
    }
  }

  // Cluster sections with test cards
  const clusters = ['Kraft', 'Ausdauer', 'Ernährung'];
  const clusterColors = { Kraft:'var(--red)', Ausdauer:'var(--blue)', 'Ernährung':'var(--green)' };
  const clusterHex = { Kraft:'#e8000d', Ausdauer:'#2979ff', 'Ernährung':'#4caf50' };

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
        ${clusterLevel ? `<span class="tests-cluster-avg" style="color:${clusterLevel.color};">${clusterLevel.label} · ${clusterAvg}%</span>` : '<span class="tests-cluster-avg" style="color:#333;">– Noch keine Tests</span>'}
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
        const level = val > 0 ? getBenchLevel(pct) : { label:'–', color:'#333' };

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

        // Canvas Sparkline
        let sparkHTML = '';
        var sparkId = 'spark-' + b.id;
        if (hist.length >= 2) {
          sparkHTML = '<canvas id="' + sparkId + '" width="120" height="40" style="cursor:pointer;vertical-align:middle;" onclick="showBenchDetail(\'' + b.id + '\')"></canvas>';
        } else if (val > 0) {
          sparkHTML = '<span style="font-family:\'Space Mono\',monospace;font-size:10px;color:#333;">Teste erneut fuer Fortschritt</span>';
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
            <div class="test-card-value" style="color:${val ? 'var(--white)' : '#222'};">${val || '–'}</div>
            <div class="test-card-unit">${b.unit}</div>
            <input class="test-card-input" type="number" step="any" placeholder="${b.target}" value="${val||''}"
              onchange="updateBenchmark('${b.id}', this.value)">
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');

  // Batch input form
  const batchHTML = `<div style="background:var(--surface-0);border:1px solid var(--surface-2);border-radius:var(--radius-md);padding:20px;margin-bottom:24px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;cursor:pointer;" onclick="var c=document.getElementById('batch-test-form');c.style.display=c.style.display==='none'?'block':'none';">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--white);letter-spacing:1px;">ALLE TESTS AUF EINMAL EINTRAGEN</div>
      <span style="font-family:'Space Mono',monospace;font-size:10px;color:var(--red);letter-spacing:1px;">AUFKLAPPEN ▾</span>
    </div>
    <div id="batch-test-form" style="display:none;">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
        ${BENCHMARKS.map(b => {
          const curVal = data.benchmarks[b.id] || '';
          return `<div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-family:'Space Mono',monospace;font-size:10px;color:#555;letter-spacing:1px;">${b.name.toUpperCase()}</label>
            <div style="display:flex;align-items:center;gap:6px;">
              <input type="number" id="batch-${b.id}" class="form-input" style="flex:1;padding:8px 10px;font-size:13px;" placeholder="${curVal || b.target}" value="${curVal}" step="any">
              <span style="font-family:'Space Mono',monospace;font-size:10px;color:#444;">${b.unit}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:16px;display:flex;gap:12px;align-items:center;">
        <button class="submit-btn" style="padding:10px 24px;font-size:13px;" onclick="saveBatchBenchmarks()">ALLE SPEICHERN</button>
        <span id="batch-confirm" style="display:none;font-family:'Space Mono',monospace;font-size:11px;color:var(--green);"></span>
      </div>
    </div>
  </div>`;

  el.innerHTML = `
    <div class="page-header">
      <div class="page-title">LEISTUNGS<span>TESTS</span></div>
      <div class="page-sub">Nationalkader-Benchmarks für ${bw} kg · Trage nur ein was du messen kannst</div>
    </div>
    <div class="tests-wrap">
      ${heroHTML}
      ${batchHTML}
      ${progressHTML}
      ${benchHTML}
    </div>
    <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:10px;">
      <span style="font-family:'Space Mono',monospace;font-size:11px;color:#444;align-self:center;">SIEHE AUCH:</span>
      <button onclick="showPage('periodisierung')" style="font-family:'Space Mono',monospace;font-size:12px;color:var(--red);background:none;border:1px solid rgba(232,0,13,.2);border-radius:var(--radius-sm);padding:6px 14px;cursor:pointer;">Periodisierung</button>
      <button onclick="showPage('rechner')" style="font-family:'Space Mono',monospace;font-size:12px;color:var(--gold);background:none;border:1px solid rgba(245,197,24,.2);border-radius:var(--radius-sm);padding:6px 14px;cursor:pointer;">Rechner</button>
    </div>`;

  setTimeout(() => {
    const canvas = document.getElementById('tests-radar');
    if (canvas) renderRadarChart(canvas, scores);
    // Draw Sparklines
    BENCHMARKS.forEach(function(b) {
      var hist = (data.benchmarkHistory || {})[b.id] || [];
      if (hist.length >= 2) {
        drawSparkline('spark-' + b.id, hist, b.color || '#e8000d', b.inverse);
      }
    });
  }, 50);
}

// ===== BENCHMARK DETAIL VIEW =====
function showBenchDetail(benchId) {
  var data = getData();
  if (!data) return;
  var BENCHMARKS = getBenchmarks();
  var b = BENCHMARKS.find(function(x) { return x.id === benchId; });
  if (!b) return;
  var hist = (data.benchmarkHistory || {})[benchId] || [];
  if (hist.length < 2) return;

  var val = data.benchmarks[benchId] || 0;
  var first = hist[0].value;
  var pctChange = first > 0 ? Math.round(((val - first) / first) * 100) : 0;
  var trend = getBenchTrend(hist, b.inverse);
  var bestVal = b.inverse ? Math.min.apply(null, hist.map(function(h){return h.value;})) : Math.max.apply(null, hist.map(function(h){return h.value;}));
  var bestEntry = hist.find(function(h) { return h.value === bestVal; });

  var el = document.getElementById('page-tests');
  if (!el) return;

  // Overlay
  var overlay = document.createElement('div');
  overlay.id = 'bench-detail-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease;';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var modal = document.createElement('div');
  modal.style.cssText = 'background:var(--surface-0);border:1px solid var(--surface-2);border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;';

  modal.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:24px;color:var(--white);letter-spacing:1px;">' + b.name + '</div>' +
    '<span onclick="document.getElementById(\'bench-detail-overlay\').remove()" style="font-size:24px;color:#333;cursor:pointer;">\u00d7</span>' +
  '</div>' +
  '<div style="display:flex;align-items:baseline;gap:16px;margin-bottom:16px;">' +
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:40px;color:var(--white);">' + val + '<span style="font-size:16px;color:#555;"> ' + b.unit + '</span></div>' +
    '<div style="font-family:\'Space Mono\',monospace;font-size:14px;color:' + trend.color + ';">' + trend.arrow + ' ' + (b.inverse ? (pctChange < 0 ? '' : '+') : (pctChange > 0 ? '+' : '')) + pctChange + '% seit Start</div>' +
  '</div>' +
  '<canvas id="bench-detail-chart" width="560" height="200" style="width:100%;height:200px;margin-bottom:16px;"></canvas>' +
  '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:12px;background:var(--surface-1);border-radius:var(--radius-md);">' +
    '<div><span style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;">BESTLEISTUNG</span><br><span style="font-family:\'Bebas Neue\',sans-serif;font-size:20px;color:var(--gold);">' + bestVal + ' ' + b.unit + '</span></div>' +
    '<div><span style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;">AM</span><br><span style="font-family:\'Space Mono\',monospace;font-size:12px;color:#888;">' + (bestEntry ? bestEntry.date : '') + '</span></div>' +
    '<div><span style="font-family:\'Space Mono\',monospace;font-size:10px;color:#555;">EINTRAEGE</span><br><span style="font-family:\'Bebas Neue\',sans-serif;font-size:20px;color:var(--white);">' + hist.length + '</span></div>' +
  '</div>' +
  '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:14px;color:#555;letter-spacing:1px;margin-bottom:8px;">VERLAUF</div>' +
  '<div style="display:flex;flex-direction:column;gap:4px;">' +
    hist.slice().reverse().map(function(h, i) {
      var isBest = h.value === bestVal;
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--surface-1);border-radius:var(--radius-sm);' + (isBest ? 'border-left:2px solid var(--gold);' : '') + '">' +
        '<span style="font-family:\'Space Mono\',monospace;font-size:11px;color:#555;">' + h.date + '</span>' +
        '<span style="font-family:\'Space Mono\',monospace;font-size:13px;color:' + (isBest ? 'var(--gold)' : 'var(--white)') + ';">' + h.value + ' ' + b.unit + (isBest ? ' \u2605' : '') + '</span>' +
        '<span onclick="deleteBenchEntry(\'' + benchId + '\',\'' + h.date + '\')" style="font-size:12px;color:#222;cursor:pointer;padding:0 4px;" title="Loeschen">\u00d7</span>' +
      '</div>';
    }).join('') +
  '</div>';

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Draw detail chart
  setTimeout(function() {
    drawSparkline('bench-detail-chart', hist, b.color || '#e8000d', b.inverse);
  }, 50);
}

function deleteBenchEntry(benchId, date) {
  if (!confirm('Diesen Benchmark-Eintrag löschen?')) return;
  var data = getData();
  if (!data || !data.benchmarkHistory || !data.benchmarkHistory[benchId]) return;
  data.benchmarkHistory[benchId] = data.benchmarkHistory[benchId].filter(function(h) { return h.date !== date; });
  // Update current to latest value
  if (data.benchmarkHistory[benchId].length > 0) {
    data.benchmarks[benchId] = data.benchmarkHistory[benchId][data.benchmarkHistory[benchId].length - 1].value;
  } else {
    data.benchmarks[benchId] = 0;
  }
  saveData(data);
  var overlay = document.getElementById('bench-detail-overlay');
  if (overlay) overlay.remove();
  renderTestsPage();
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
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--surface-2);">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--white);margin-bottom:10px;">TAGES-CHECKLIST</div>
      <div style="margin-bottom:10px;height:4px;background:var(--surface-2);border-radius:var(--radius-sm);overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)'};transition:width .3s;"></div>
      </div>
      ${DAILY_ITEMS.map(item => {
        const checked = cl[item.id];
        return `<div style="display:flex;align-items:center;gap:12px;padding:7px 0;border-bottom:1px solid #151515;cursor:pointer;${checked ? 'opacity:.5;' : ''}" onclick="toggleCheck('${item.id}')">
          <div style="width:20px;height:20px;border-radius:var(--radius-sm);border:2px solid ${checked ? 'var(--green)' : '#333'};background:${checked ? 'var(--green)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;color:var(--black);">${checked ? '✓' : ''}</div>
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
  return safeParse(getChecklistKey(), {});
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
    <div style="margin-bottom:12px;height:4px;background:var(--surface-2);border-radius:var(--radius-sm);overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:${pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)'};transition:width .3s;"></div>
    </div>
    ${DAILY_ITEMS.map(item => {
      const checked = cl[item.id];
      return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #151515;cursor:pointer;${checked ? 'opacity:.5;' : ''}" onclick="toggleCheck('${item.id}')">
        <div style="width:22px;height:22px;border-radius:var(--radius-sm);border:2px solid ${checked ? 'var(--green)' : '#333'};background:${checked ? 'var(--green)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;color:var(--black);">${checked ? '✓' : ''}</div>
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

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  // Klick auf Overlay schließt
  menu.onclick = function(e) {
    if (e.target === menu) menu.style.display = 'none';
  };
}

function mobileNav(page) {
  document.getElementById('mobile-menu').style.display = 'none';
  showPage(page);
}

// ===== THEME TOGGLE =====
function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('fos_theme', next);
  var btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    var sun = btn.querySelector('.icon-sun');
    var moon = btn.querySelector('.icon-moon');
    if (sun) sun.style.display = next === 'light' ? 'none' : 'block';
    if (moon) moon.style.display = next === 'light' ? 'block' : 'none';
  }
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = next === 'light' ? '#FFFFFF' : '#E8000D';
  // Re-render charts with new theme colors
  if (_lastRadarScores) {
    setTimeout(function() { renderRadarChart(_lastRadarScores); }, 50);
  }
}

// Apply saved theme on load
(function() {
  var saved = localStorage.getItem('fos_theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    var btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      var sun = btn.querySelector('.icon-sun');
      var moon = btn.querySelector('.icon-moon');
      if (sun) sun.style.display = 'none';
      if (moon) moon.style.display = 'block';
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = '#FFFFFF';
  }
})();

// ===== PWA SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js')
      .then(function(reg) {
        console.log('FightOS SW registered, scope:', reg.scope);
        setInterval(function() { reg.update(); }, 60 * 60 * 1000);
      })
      .catch(function(err) {
        console.log('SW registration failed:', err);
      });
  });

  // Update-Banner
  navigator.serviceWorker.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
      var banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:var(--blue);padding:12px 20px;display:flex;justify-content:space-between;align-items:center;animation:fadeSlideIn .3s ease;';
      banner.innerHTML = '<span style="font-family:\'Space Mono\',monospace;font-size:12px;color:#fff;">Update verfuegbar</span>' +
        '<button onclick="location.reload()" style="font-family:\'Space Mono\',monospace;font-size:12px;color:#fff;background:rgba(255,255,255,.15);border:none;padding:6px 16px;border-radius:var(--radius-sm);cursor:pointer;letter-spacing:1px;">NEU LADEN</button>';
      document.body.appendChild(banner);
      setTimeout(function() { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 10000);
    }
  });
}

// ===== TOOLTIP TAP-TO-REVEAL (Mobile) =====
document.addEventListener('click', function(e) {
  var tt = e.target.closest('.tt');
  // Close all open tooltips first
  document.querySelectorAll('.tt.tt-open').forEach(function(el) {
    if (el !== tt) el.classList.remove('tt-open');
  });
  // Toggle tapped tooltip
  if (tt) {
    e.preventDefault();
    tt.classList.toggle('tt-open');
  }
});
