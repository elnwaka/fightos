/* ============================================================
   BOXSPEC · HANDY-OBERFLÄCHE (Neubau)
   ------------------------------------------------------------
   Eigene Oberfläche für Viewports unter 768px. Erzeugt eigenes,
   sauberes Markup und nutzt ausschliesslich die vorhandenen
   Datenfunktionen (getData, weekPlan, completedBlocks, …).
   Die Desktop-Oberfläche bleibt vollständig unberührt.

   Gebaut nach den Apple Human Interface Guidelines:
   - Tab-Leiste: 5 Einträge, nur Navigation, nie Aktionen
   - Navigationsleiste: Titel + Zurück + höchstens EIN Bedienelement
   - Der Zurück-Knopf trägt den Titel des übergeordneten Bildschirms
   - Wischen von der linken Kante führt zurück
   - Eine Entscheidung pro Bildschirm: Liste → antippen → tiefer
   ============================================================ */

(function () {
  'use strict';

  var MQ = window.matchMedia('(max-width: 768px)');
  if (!MQ.matches) return;           // Desktop bleibt, wie er ist
  if (window.__mobileApp) return;

  // ---------- Werkzeug ----------

  function h(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function E(v) { return (typeof esc === 'function') ? esc(v) : String(v == null ? '' : v); }
  function data() { return (typeof getData === 'function' && getData()) || {}; }
  function schedule() { return (typeof getUserSchedule === 'function' && getUserSchedule()) || {}; }

  var DAYS  = ['mo','di','mi','do','fr','sa','so'];
  var DAYSL = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
  function todayIdx() { return (new Date().getDay() + 6) % 7; }
  function weekId() { return (typeof getWeekId === 'function') ? getWeekId() : ''; }

  function blocksFor(dayKey) {
    var d = data();
    var all = (d.weekPlan && d.weekPlan[dayKey]) || [];
    return { all: all, visible: all.filter(function (b) { return b.type !== 'meta'; }) };
  }
  function isDone(dayKey, realIdx) {
    var d = data();
    return !!(d.completedBlocks && d.completedBlocks[dayKey + '_' + realIdx + '_' + weekId()]);
  }

  // ---------- Bausteine ----------

  function list(rows) {
    return '<div class="m-group">' + rows.join('') + '</div>';
  }

  function row(o) {
    // o: { title, sub, value, chevron, lead, onclick, done, id }
    var tag = o.onclick ? 'button' : 'div';
    return '<' + tag + ' class="m-row' + (o.done ? ' is-done' : '') + (o.lead ? ' has-lead' : '') + '"' +
      (o.onclick ? ' onclick="' + o.onclick + '"' : '') + (o.id ? ' id="' + o.id + '"' : '') + '>' +
      (o.lead || '') +
      '<span class="m-row-main">' +
        '<span class="m-row-title">' + E(o.title) + '</span>' +
        (o.sub ? '<span class="m-row-sub">' + E(o.sub) + '</span>' : '') +
      '</span>' +
      (o.value ? '<span class="m-row-value">' + E(o.value) + '</span>' : '') +
      (o.chevron ? '<span class="m-chev" aria-hidden="true"></span>' : '') +
    '</' + tag + '>';
  }

  function label(text) { return '<p class="m-label">' + E(text) + '</p>'; }

  function button(text, onclick, variant) {
    return '<button class="m-btn' + (variant ? ' m-btn-' + variant : '') + '" onclick="' + onclick + '">' +
      E(text) + '</button>';
  }

  function empty(title, text, action) {
    return '<div class="m-empty">' +
      '<p class="m-empty-title">' + E(title) + '</p>' +
      (text ? '<p class="m-empty-text">' + E(text) + '</p>' : '') +
      (action || '') +
    '</div>';
  }

  // ---------- Bildschirme ----------

  var SCREENS = {};

  SCREENS.heute = {
    title: 'Heute',
    root: true,
    render: function () {
      var i = todayIdx(), key = DAYS[i], d = data();
      var b = blocksFor(key);
      var dateStr = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
      var out = '';

      if (!b.visible.length) {
        out += label(DAYSL[i] + ', ' + dateStr);
        out += list([ row({ title: 'Ruhetag', sub: 'Erholung ist Teil des Plans.' }) ]);
        out += button('Woche ansehen', 'MobileApp.go("plan")', 'ghost');
      } else {
        var done = 0, firstOpen = -1;
        var rows = b.visible.map(function (blk) {
          var ri = b.all.indexOf(blk);
          var dn = isDone(key, ri);
          if (dn) done++; else if (firstOpen < 0) firstOpen = ri;
          var meta = [];
          if (blk.duration) meta.push(blk.duration + ' Min');
          if (blk.rpe) meta.push('RPE ' + blk.rpe);
          var tick = '<button class="m-tick' + (dn ? ' on' : '') + '" ' +
            'aria-label="' + (dn ? 'Wieder öffnen' : 'Als erledigt markieren') + '" ' +
            'onclick="event.stopPropagation();MobileApp.toggle(\'' + key + '\',' + ri + ')"></button>';
          return row({
            title: blk.title || 'Einheit', sub: meta.join(' · '), done: dn,
            lead: tick, chevron: true,
            onclick: 'MobileApp.openBlock(\'' + key + '\',' + ri + ')'
          });
        });
        out += label(DAYSL[i] + ', ' + dateStr + ' · ' + done + ' von ' + b.visible.length);
        out += list(rows);
        out += (done === b.visible.length)
          ? button('Woche ansehen', 'MobileApp.go("plan")', 'ghost')
          : button('Einheit starten', 'MobileApp.openBlock(\'' + key + '\',' + firstOpen + ')');
      }

      // Woche als sieben Felder
      out += label('Diese Woche');
      out += '<div class="m-week">' + DAYS.map(function (dk, di) {
        var bb = blocksFor(dk);
        var all = bb.visible.length && bb.visible.every(function (x) {
          return isDone(dk, bb.all.indexOf(x));
        });
        var cls = 'm-day' + (di === i ? ' is-now' : (all ? ' is-done' : ''));
        return '<button class="' + cls + '" onclick="MobileApp.go(\'plan\')">' +
          '<span class="m-day-l">' + DAYSL[di].slice(0, 2).toUpperCase() + '</span>' +
          '<span class="m-day-d"></span></button>';
      }).join('') + '</div>';

      return out;
    }
  };

  SCREENS.plan = {
    title: 'Plan',
    root: true,
    render: function () {
      var s = schedule(), out = '';
      var wk = (typeof getProgram10WCurrentWeek === 'function') ? getProgram10WCurrentWeek() : 0;
      var ph = (wk && typeof getP10WPhase === 'function') ? getP10WPhase(wk) : null;

      if (wk) out += label('Woche ' + wk + ' von 10' + (ph ? ' · ' + ph.name : ''));

      var equip = (!s.gymAccess || s.gymAccess === 'none') ? 'Körpergewicht'
                : (s.gymAccess === 'basic' ? 'Basis' : 'Volles Gym');
      var lvl = s.experienceLevel === 'anfaenger' ? 'Anfänger'
              : s.experienceLevel === 'wettkampf' ? 'Wettkämpfer' : 'Fortgeschritten';

      out += list([
        row({ title: 'Equipment', value: equip, chevron: true, onclick: 'MobileApp.go("account")' }),
        row({ title: 'Level',     value: lvl,   chevron: true, onclick: 'MobileApp.go("account")' })
      ]);

      DAYS.forEach(function (dk, di) {
        var b = blocksFor(dk);
        if (!b.visible.length) return;
        out += label(DAYSL[di] + (di === todayIdx() ? ' · heute' : ''));
        out += list(b.visible.map(function (blk) {
          var ri = b.all.indexOf(blk);
          var meta = [];
          if (blk.time) meta.push(blk.time);
          if (blk.duration) meta.push(blk.duration + ' Min');
          return row({
            title: blk.title || 'Einheit', sub: meta.join(' · '),
            done: isDone(dk, ri), chevron: true,
            onclick: 'MobileApp.openBlock(\'' + dk + '\',' + ri + ')'
          });
        }));
      });

      if (out.indexOf('m-row') === -1) {
        out += empty('Noch kein Plan', 'Trag deine Trainingszeiten ein, dann erstellt BoxSpec den Wochenplan.',
                     button('Zeitplan einrichten', 'MobileApp.go("account")'));
      }
      return out;
    }
  };

  SCREENS.wissen = {
    title: 'Wissen',
    root: true,
    render: function () {
      return list([
        row({ title: 'Übungen',        sub: 'Bewegungen mit Fotos und Anleitung', chevron: true, onclick: 'MobileApp.legacy("training","uebungen","Übungen")' }),
        row({ title: 'Videos',         sub: 'Kampf-Breakdowns und Technik',       chevron: true, onclick: 'MobileApp.legacy("training","wissen","Videos")' }),
        row({ title: 'Ernährung',      sub: 'Kalorien, Makros, Timing',           chevron: true, onclick: 'MobileApp.legacy("training","ernaehrung","Ernährung")' }),
        row({ title: 'Periodisierung', sub: 'Wie sich der Plan aufbaut',          chevron: true, onclick: 'MobileApp.legacy("training","periodisierung","Periodisierung")' }),
        row({ title: 'Regeneration',   sub: 'Schlaf, HRV, Belastung',             chevron: true, onclick: 'MobileApp.legacy("training","regeneration","Regeneration")' }),
        row({ title: '8 Säulen',       sub: 'Worauf das System aufbaut',          chevron: true, onclick: 'MobileApp.legacy("profil","saeulen","8 Säulen")' })
      ]) +
      label('Deine Daten') +
      list([
        row({ title: 'Tests',   sub: 'Kraft, Ausdauer, Schnelligkeit', chevron: true, onclick: 'MobileApp.legacy("training","tests","Tests")' }),
        row({ title: 'Log',     sub: 'Was du trainiert hast',          chevron: true, onclick: 'MobileApp.legacy("training","log","Log")' }),
        row({ title: 'Notizen', sub: 'Gedanken und Beobachtungen',     chevron: true, onclick: 'MobileApp.legacy("training","notizen","Notizen")' })
      ]);
    }
  };

  SCREENS.kaempfe = {
    title: 'Kämpfe',
    root: true,
    render: function () {
      var d = data(), f = d.fights || [];
      if (!f.length) {
        return empty('Noch keine Kämpfe',
          'Trag deine Kämpfe ein, dann siehst du hier deine Bilanz und Auswertung.',
          button('Kampf eintragen', 'MobileApp.legacy("fights",null,"Kämpfe")'));
      }
      var w = f.filter(function (x) { return x.result === 'sieg'; }).length;
      var l = f.filter(function (x) { return x.result === 'niederlage'; }).length;
      var u = f.length - w - l;
      return label('Bilanz') +
        list([ row({ title: 'Siege', value: String(w) }),
               row({ title: 'Niederlagen', value: String(l) }),
               row({ title: 'Unentschieden', value: String(u) }) ]) +
        label('Alle Kämpfe') +
        list(f.slice().reverse().map(function (x) {
          return row({
            title: x.opponent || 'Gegner',
            sub: [x.date, x.method].filter(Boolean).join(' · '),
            value: x.result === 'sieg' ? 'S' : x.result === 'niederlage' ? 'N' : 'U',
            chevron: true, onclick: 'MobileApp.legacy("fights",null,"Kämpfe")'
          });
        })) +
        button('Kampf eintragen', 'MobileApp.legacy("fights",null,"Kämpfe")');
    }
  };

  SCREENS.profil = {
    title: 'Profil',
    root: true,
    render: function () {
      var name = (typeof getDisplayName === 'function') ? getDisplayName() : '';
      return list([
        row({ title: name || 'Dein Profil', sub: 'Name, Gewicht, Zeitplan', chevron: true, onclick: 'MobileApp.legacy("profil","account","Account")' })
      ]) +
      label('Verein') +
      list([
        row({ title: 'Feed und Forum', sub: 'Beiträge anderer Boxer', chevron: true, onclick: 'MobileApp.legacy("community",null,"Verein")' })
      ]) +
      label('Hilfe') +
      list([
        row({ title: 'Rechner', sub: 'Makros und Herzfrequenzzonen', chevron: true, onclick: 'MobileApp.legacy("profil","rechner","Rechner")' }),
        row({ title: 'FAQ',     sub: 'Häufige Fragen',               chevron: true, onclick: 'MobileApp.legacy("profil","faq","FAQ")' })
      ]) +
      button('Abmelden', 'doLogout()', 'ghost');
    }
  };

  var TABS = [
    { id: 'heute',   label: 'Heute'  },
    { id: 'plan',    label: 'Plan'   },
    { id: 'wissen',  label: 'Wissen' },
    { id: 'kaempfe', label: 'Kämpfe' },
    { id: 'profil',  label: 'Profil' }
  ];

  // ---------- Navigation ----------

  var stack = [];                 // [{id, title, legacy}]
  var rootId = 'heute';

  function current() { return stack[stack.length - 1]; }

  function renderBar() {
    var cur = current();
    var parent = stack.length > 1 ? stack[stack.length - 2] : null;
    var bar = document.getElementById('m-bar');
    if (!bar) return;
    bar.innerHTML =
      (parent
        ? '<button class="m-back" onclick="MobileApp.back()">' +
            '<span class="m-back-icon" aria-hidden="true"></span>' +
            '<span class="m-back-label">' + E(parent.title) + '</span></button>'
        : '<span class="m-bar-lead"></span>') +
      '<span class="m-bar-title' + (stack.length > 1 ? '' : ' is-root') + '">' + E(cur.title) + '</span>' +
      // Genau EIN Bedienelement, wie die Richtlinien es vorsehen.
      '<button class="m-bar-action" onclick="toggleAICoach()" aria-label="Coach">' +
        '<span class="m-coach-icon" aria-hidden="true"></span></button>';
    var big = document.getElementById('m-bigtitle');
    if (big) { big.textContent = cur.title; big.hidden = stack.length > 1; }
  }

  function renderBody(dir) {
    var cur = current();
    var body = document.getElementById('m-body');
    if (!body) return;

    var inner = document.createElement('div');
    inner.className = 'm-screen';
    if (cur.legacy) {
      inner.innerHTML = '<div class="m-legacy" id="m-legacy-host"></div>';
    } else {
      inner.innerHTML = SCREENS[cur.id].render();
    }

    if (dir) {
      inner.classList.add(dir === 'push' ? 'enter-right' : 'enter-left');
      requestAnimationFrame(function () { inner.classList.remove('enter-right', 'enter-left'); });
    }
    body.innerHTML = '';
    body.appendChild(inner);
    window.scrollTo(0, 0);

    if (cur.legacy) mountLegacy(cur.legacy);
    renderTabs();
  }

  // Bildschirme, die noch die alte Ausgabe nutzen, werden sauber
  // eingehängt statt nachgebaut — der Inhalt stimmt ja, nur der
  // Rahmen war das Problem.
  function mountLegacy(spec) {
    var host = document.getElementById('m-legacy-host');
    if (!host) return;
    try {
      if (spec.parent === 'training' && typeof renderTrainingPage === 'function') {
        window._trainingSubTab = spec.sub; renderTrainingPage(spec.sub);
      } else if (spec.parent === 'profil' && typeof renderProfilPage === 'function') {
        window._profilSubTab = spec.sub; renderProfilPage(spec.sub);
      } else if (spec.parent === 'community' && typeof renderCommunityPage === 'function') {
        renderCommunityPage();
      } else if (spec.parent === 'fights' && typeof renderFightsPage === 'function') {
        renderFightsPage();
      }
      var src = document.getElementById('page-' + spec.parent);
      if (src) {
        host.innerHTML = src.innerHTML;
        // Die alte Reiterleiste hat hier nichts mehr verloren
        host.querySelectorAll('.sub-tabs, .page-header').forEach(function (n) { n.remove(); });
      }
    } catch (e) {
      host.innerHTML = '<p class="m-empty-text">Dieser Bereich konnte nicht geladen werden.</p>';
    }
  }

  function renderTabs() {
    var el = document.getElementById('m-tabs');
    if (!el) return;
    var activeRoot = stack[0] ? stack[0].id : rootId;
    el.innerHTML = TABS.map(function (t) {
      return '<button class="m-tab' + (t.id === activeRoot ? ' is-active' : '') + '" ' +
        'onclick="MobileApp.go(\'' + t.id + '\')" aria-label="' + E(t.label) + '">' +
        '<span class="m-tab-icon m-icon-' + t.id + '" aria-hidden="true"></span>' +
        '<span class="m-tab-label">' + E(t.label) + '</span></button>';
    }).join('');
  }

  var MobileApp = {
    go: function (id) {
      if (SCREENS[id] && SCREENS[id].root) {
        // Ein Tab-Wechsel setzt den Stapel zurueck — kein halb
        // erinnerter Unterbildschirm.
        stack = [{ id: id, title: SCREENS[id].title }];
        rootId = id;
        renderBar(); renderBody(null);
      } else if (SCREENS[id]) {
        stack.push({ id: id, title: SCREENS[id].title });
        renderBar(); renderBody('push');
      }
    },
    legacy: function (parent, sub, title) {
      stack.push({ id: 'legacy', title: title, legacy: { parent: parent, sub: sub } });
      renderBar(); renderBody('push');
    },
    back: function () {
      if (stack.length < 2) return;
      stack.pop();
      renderBar(); renderBody('pop');
    },
    toggle: function (dayKey, idx) {
      var b = blocksFor(dayKey);
      var blk = b.all[idx] || {};
      if (typeof toggleBlockDone === 'function') toggleBlockDone(dayKey, idx, blk.type || '', blk.title || '');
      renderBody(null);
    },
    openBlock: function (dayKey, idx) {
      if (typeof openBlockDetail === 'function') openBlockDetail(dayKey, idx);
      var b = blocksFor(dayKey);
      var blk = b.all[idx] || {};
      stack.push({ id: 'legacy', title: blk.title || 'Einheit', legacy: { parent: 'block-detail' } });
      renderBar();
      var body = document.getElementById('m-body');
      var src = document.getElementById('page-block-detail');
      if (body && src) {
        body.innerHTML = '<div class="m-screen enter-right"><div class="m-legacy">' + src.innerHTML + '</div></div>';
        requestAnimationFrame(function () {
          var s = body.querySelector('.m-screen'); if (s) s.classList.remove('enter-right');
        });
        window.scrollTo(0, 0);
      }
      renderTabs();
    },
    refresh: function () { renderBar(); renderBody(null); }
  };
  window.MobileApp = MobileApp;
  window.__mobileApp = true;

  // ---------- Aufbau ----------

  function build() {
    var app = document.getElementById('app-screen');
    if (!app) return;

    var shell = h(
      '<div id="m-app">' +
        '<header id="m-bar" class="m-bar"></header>' +
        '<h1 id="m-bigtitle" class="m-bigtitle"></h1>' +
        '<main id="m-body" class="m-body"></main>' +
        '<nav id="m-tabs" class="m-tabs"></nav>' +
      '</div>');
    app.appendChild(shell);
    document.body.classList.add('m-on');

    stack = [{ id: 'heute', title: 'Heute' }];
    renderBar(); renderBody(null);

    // Grosser Titel faellt beim Scrollen in die Leiste
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var big = document.getElementById('m-bigtitle');
        var bar = document.getElementById('m-bar');
        if (!big || !bar) return;
        var collapsed = window.scrollY > 26;
        big.classList.toggle('is-collapsed', collapsed);
        bar.classList.toggle('shows-title', collapsed || stack.length > 1);
      });
    }, { passive: true });

    // Wischen von der linken Kante fuehrt zurueck
    var x0 = null, y0 = null;
    document.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      if (t.clientX < 28) { x0 = t.clientX; y0 = t.clientY; } else { x0 = null; }
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var t = e.changedTouches[0];
      if (t.clientX - x0 > 60 && Math.abs(t.clientY - y0) < 50) MobileApp.back();
      x0 = null;
    }, { passive: true });
  }

  function start() {
    var app = document.getElementById('app-screen');
    if (!app || app.style.display === 'none' || !app.classList.contains('active')) {
      return setTimeout(start, 400);
    }
    build();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 600); });
  } else {
    setTimeout(start, 600);
  }
})();
