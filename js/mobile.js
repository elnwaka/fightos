/* ============================================================
   BOXSPEC · HANDY-OBERFLÄCHE
   1:1 aus dem freigegebenen Prototyp, mit echten Daten.
   Nutzt ausschliesslich die vorhandenen Datenfunktionen.
   Der Desktop bleibt unberührt.
   ============================================================ */

(function () {
  'use strict';
  // Die Breite wurde bisher nur beim Laden geprueft. Wer breit laedt und
  // dann schmal zieht, sah die Handy-Oberflaeche nie.
  var MQ = window.matchMedia('(max-width: 768px)');
  if (!MQ.matches) {
    var on = function () { if (MQ.matches) { location.reload(); } };
    if (MQ.addEventListener) MQ.addEventListener('change', on); else MQ.addListener(on);
    return;
  }
  if (window.__mob) return;
  window.__mob = true;

  var E = function (v) { return (typeof esc === 'function') ? esc(v) : String(v == null ? '' : v); };
  var D = function () { return (typeof getData === 'function' && getData()) || {}; };
  var SCH = function () { return (typeof getUserSchedule === 'function' && getUserSchedule()) || {}; };

  var DAY  = ['mo','di','mi','do','fr','sa','so'];
  var DAYL = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
  var MON  = ['Januar','Februar','März','April','Mai','Juni','Juli','August',
              'September','Oktober','November','Dezember'];

  function ti() { return (new Date().getDay() + 6) % 7; }
  function wid() { return (typeof getWeekId === 'function') ? getWeekId() : ''; }
  function blocks(d) {
    var all = (D().weekPlan && D().weekPlan[d]) || [];
    return { all: all, vis: all.filter(function (b) { return b.type !== 'meta'; }) };
  }
  function done(d, i) {
    var c = D().completedBlocks;
    return !!(c && c[d + '_' + i + '_' + wid()]);
  }

  /* ---------- Bausteine (identisch zum Prototyp) ---------- */

  function grp(r) { return '<div class="grp">' + r.join('') + '</div>'; }
  function lbl(t) { return '<p class="lbl">' + E(t) + '</p>'; }
  function row(o) {
    var inner = '<span class="row-m"><span class="row-t">' + E(o.t) + '</span>' +
      (o.s ? '<span class="row-s">' + E(o.s) + '</span>' : '') + '</span>' +
      (o.v ? '<span class="row-v">' + E(o.v) + '</span>' : '') +
      (o.chev ? '<span class="chev"></span>' : '');
    // Ein Button darf keinen Button enthalten.
    if (o.lead) {
      return '<div class="row lead' + (o.done ? ' done' : '') + '">' + o.lead +
        '<button class="row-hit"' + (o.go ? ' onclick="' + o.go + '"' : '') + '>' + inner + '</button></div>';
    }
    var tag = o.go ? 'button' : 'div';
    return '<' + tag + ' class="row' + (o.done ? ' done' : '') + '"' +
      (o.go ? ' onclick="' + o.go + '"' : '') + '>' + inner + '</' + tag + '>';
  }
  function tick(d, i, on) {
    return '<button class="tick' + (on ? ' on' : '') + '" aria-label="' +
      (on ? 'Wieder öffnen' : 'Als erledigt markieren') + '" ' +
      'onclick="event.stopPropagation();M.tick(&quot;' + d + '&quot;,' + i + ')"></button>';
  }
  function stat(l, v, p) {
    return '<div class="stat"><span class="stat-l">' + E(l) + '</span>' +
      '<span class="stat-v">' + E(v) + '</span>' +
      '<span class="stat-b"><i style="width:' + p + '%"></i></span></div>';
  }
  function btn(t, go, gh) {
    return '<button class="btn' + (gh ? ' ghost' : '') + '" onclick="' + go + '">' + E(t) + '</button>';
  }

  /* ---------- Bildschirme ---------- */

  var S = {};

  S.heute = { title: 'Heute', root: 1, act: 'chat', view: function () {
    var i = ti(), k = DAY[i], b = blocks(k);
    var ds = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
    var out = '<h1 class="big">Heute</h1>';

    if (!b.vis.length) {
      out += lbl(DAYL[i] + ', ' + ds) +
        grp([row({ t: 'Ruhetag', s: 'Erholung gehört zum Plan.' })]) +
        btn('Woche ansehen', 'M.go(&quot;plan&quot;)', 1);
    } else {
      var n = 0, first = -1;
      var rows = b.vis.map(function (x) {
        var ri = b.all.indexOf(x), dn = done(k, ri);
        if (dn) n++; else if (first < 0) first = ri;
        var m = [];
        if (x.duration) m.push(x.duration + ' Min');
        if (x.rpe) m.push('RPE ' + x.rpe);
        return row({ lead: tick(k, ri, dn), t: x.title || 'Einheit', s: m.join(' · '),
          done: dn, chev: 1, go: 'M.block(&quot;' + k + '&quot;,' + ri + ')' });
      });
      out += '<div class="sess">' +
          '<div class="sess-top"><span class="sess-k">' + E(DAYL[i] + ', ' + ds) + '</span>' +
          '<span class="sess-n">' + n + ' von ' + b.vis.length + '</span></div>' +
          '<p class="sess-t">' + E((b.vis[first < 0 ? 0 : b.all.indexOf(b.all[first])] || b.vis[0]).title || 'Training') + '</p>' +
          '<div class="bar"><i style="width:' + Math.round(n / b.vis.length * 100) + '%"></i></div>' +
        '</div>' + grp(rows);
      out += (n === b.vis.length)
        ? btn('Woche ansehen', 'M.go(&quot;plan&quot;)', 1)
        : btn('Einheit starten', 'M.block(&quot;' + k + '&quot;,' + first + ')');
    }

    out += lbl('Diese Woche') + '<div class="week">' + DAY.map(function (d, j) {
      var bb = blocks(d), t = bb.vis.length, dn = 0;
      bb.vis.forEach(function (x) { if (done(d, bb.all.indexOf(x))) dn++; });
      var p = t ? Math.round(dn / t * 100) : 0;
      return '<button class="wd' + (j === i ? ' now' : '') + (t && dn === t ? ' full' : '') +
        '" onclick="M.go(&quot;plan&quot;)"><span>' + DAYL[j].slice(0, 2).toUpperCase() +
        '</span><span class="ring" style="--p:' + p + '%"></span></button>';
    }).join('') + '</div>';

    // Bilanz aus echten Werten
    var tot = 0, dn2 = 0, mins = 0;
    DAY.forEach(function (d) {
      var bb = blocks(d);
      bb.vis.forEach(function (x) {
        tot++; mins += (x.duration || 0);
        if (done(d, bb.all.indexOf(x))) dn2++;
      });
    });
    var pct = tot ? Math.round(dn2 / tot * 100) : 0;
    out += lbl('Bilanz') + '<div class="grp">' +
      stat('Plan erfüllt', pct + ' %', pct) +
      stat('Einheiten', dn2 + ' von ' + tot, tot ? dn2 / tot * 100 : 0) +
      stat('Trainingszeit', (mins / 60).toFixed(1).replace('.', ',') + ' Std', Math.min(100, mins / 6)) +
    '</div>';
    return out;
  }};

  S.plan = { title: 'Plan', root: 1, view: function () {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), td = now.getDate();
    var first = new Date(y, m, 1), off = (first.getDay() + 6) % 7;
    var len = new Date(y, m + 1, 0).getDate();
    var prev = new Date(y, m, 0).getDate();
    var cells = '';
    for (var c = 0; c < 42; c++) {
      var d = c - off + 1, out = d < 1 || d > len;
      var show = out ? (d < 1 ? prev + d : d - len) : d;
      var dow = (c % 7);
      var bb = out ? { vis: [] } : blocks(DAY[dow]);
      var has = bb.vis.length > 0;
      var ok = has && !out && d < td;
      cells += '<button class="cal-d' + (out ? ' out' : '') + (d === td && !out ? ' today' : '') +
        (has ? (ok ? ' has ok' : ' has') : '') + '" onclick="M.tag(' + (out ? td : d) + ')">' + show +
        (has ? '<u></u>' : '<u style="background:transparent"></u>') + '</button>';
      if (c > 34 && d > len) break;
    }
    var wk = (typeof getProgram10WCurrentWeek === 'function') ? getProgram10WCurrentWeek() : 0;
    var ph = (wk && typeof getP10WPhase === 'function') ? getP10WPhase(wk) : null;
    var k = DAY[ti()], b = blocks(k);

    return '<h1 class="big">Plan</h1>' +
      '<div class="cal">' +
        '<div class="cal-h"><b>' + MON[m] + ' ' + y + '</b>' +
        '<span class="cal-nav"><button><i></i></button><button><i></i></button></span></div>' +
        '<div class="cal-w">' + ['M','D','M','D','F','S','S'].map(function (x) {
          return '<span>' + x + '</span>'; }).join('') + '</div>' +
        '<div class="cal-g">' + cells + '</div>' +
      '</div>' +
      lbl('Heute, ' + DAYL[ti()] + ' ' + td + '. ' + MON[m]) +
      grp(b.vis.map(function (x) {
        var ri = b.all.indexOf(x), mm = [];
        if (x.time) mm.push(x.time);
        if (x.duration) mm.push(x.duration + ' Min');
        return row({ t: x.title || 'Einheit', s: mm.join(', '), done: done(k, ri), chev: 1,
          go: 'M.block(&quot;' + k + '&quot;,' + ri + ')' });
      }).concat([row({ t: 'Ganzen Tag ansehen', chev: 1, go: 'M.tag(' + td + ')' })])) +
      (wk ? lbl('Programm') + grp([
        row({ t: 'Woche', v: wk + ' von 10' }),
        row({ t: 'Phase', v: ph ? ph.name : '' })
      ]) : '');
  }};

  S.tag = { title: 'Tag', view: function () {
    var d = M.sel, now = new Date(), m = now.getMonth(), td = now.getDate();
    var dow = (new Date(now.getFullYear(), m, d).getDay() + 6) % 7;
    var k = DAY[dow], b = blocks(k);
    if (!b.vis.length) {
      return '<h1 class="big">' + d + '. ' + MON[m] + '</h1>' + lbl('Ruhetag') +
        grp([row({ t: 'Kein Training geplant',
          s: 'Erholung gehört zum Plan. Schlaf und lockere Bewegung zählen.' })]) +
        btn('Zurück zum Monat', 'M.back()', 1);
    }
    var mins = 0, rpes = [];
    var tl = b.vis.map(function (x, j) {
      var ri = b.all.indexOf(x), dn = done(k, ri);
      mins += (x.duration || 0); if (x.rpe) rpes.push(x.rpe);
      var mm = [];
      if (x.duration) mm.push(x.duration + ' Min');
      if (x.rpe) mm.push('RPE ' + x.rpe);
      return '<div class="tl-e' + (dn ? ' is-done' : (d === td && j === 0 ? ' is-now' : '')) + '">' +
        '<span class="tl-t">' + E(x.time || '') + '</span>' +
        '<button class="tl-c" onclick="M.block(&quot;' + k + '&quot;,' + ri + ')">' +
          '<span class="tl-n">' + E(x.title || 'Einheit') + '</span>' +
          '<span class="tl-s">' + E(mm.join(', ')) + '</span>' +
        '</button></div>';
    }).join('');
    var rpe = rpes.length ? (rpes.reduce(function (a, x) { return a + x; }, 0) / rpes.length) : 0;
    return '<h1 class="big">' + d + '. ' + MON[m] + '</h1>' +
      lbl((d === td ? 'Heute, ' : '') + b.vis.length + (b.vis.length === 1 ? ' Einheit' : ' Einheiten')) +
      '<div class="tl">' + tl + '</div>' +
      lbl('Belastung') + '<div class="grp">' +
        stat('Gesamtdauer', mins + ' Min', Math.min(100, mins / 2)) +
        stat('Mittlerer RPE', rpe.toFixed(1).replace('.', ','), rpe * 10) +
      '</div>';
  }};

  S.wissen = { title: 'Wissen', root: 1, view: function () {
    var n = exCount();
    return '<h1 class="big">Wissen</h1>' +
    grp([
      row({ t:'Übungen', s: (n ? n + ' Bewegungen mit Anleitung' : 'Bewegungen mit Anleitung'), chev:1, go:'M.go(&quot;uebungen&quot;)' }),
      row({ t:'Videos', s:'Kampf-Breakdowns und Technik', chev:1, go:'M.go(&quot;videos&quot;)' }),
      row({ t:'Ernährung', s:'Kalorien, Makros, Timing', chev:1, go:'M.artikel(&quot;ernaehrung&quot;)' }),
      row({ t:'Periodisierung', s:'Wie sich der Plan aufbaut', chev:1, go:'M.artikel(&quot;periodisierung&quot;)' }),
      row({ t:'Regeneration', s:'Schlaf, HRV, Belastung', chev:1, go:'M.artikel(&quot;regeneration&quot;)' }),
      row({ t:'8 Säulen', s:'Worauf das System aufbaut', chev:1, go:'M.artikel(&quot;saeulen&quot;)' })
    ]) + lbl('Deine Daten') + grp([
      row({ t:'Tests', s:'Kraft, Ausdauer, Schnelligkeit', chev:1, go:'M.old(&quot;training&quot;,&quot;tests&quot;,&quot;Tests&quot;)' }),
      row({ t:'Log', s:'Was du trainiert hast', chev:1, go:'M.old(&quot;training&quot;,&quot;log&quot;,&quot;Log&quot;)' }),
      row({ t:'Notizen', s:'Gedanken und Beobachtungen', chev:1, go:'M.old(&quot;training&quot;,&quot;notizen&quot;,&quot;Notizen&quot;)' })
    ]);
  }};

  S.kaempfe = { title: 'Kämpfe', root: 1, view: function () {
    var f = D().fights || [];
    if (!f.length) {
      return '<h1 class="big">Kämpfe</h1>' +
        '<div class="empty"><b>Noch keine Kämpfe</b>' +
        '<p>Trag deine Kämpfe ein, dann siehst du hier Bilanz und Auswertung.</p>' +
        btn('Kampf eintragen', 'M.old(&quot;fights&quot;,null,&quot;Kämpfe&quot;)') + '</div>';
    }
    var w = f.filter(function (x) { return x.result === 'sieg'; }).length;
    var l = f.filter(function (x) { return x.result === 'niederlage'; }).length;
    var u = f.length - w - l;
    return '<h1 class="big">Kämpfe</h1>' + lbl('Bilanz') + '<div class="grp">' +
      stat('Siege', String(w), f.length ? w / f.length * 100 : 0) +
      stat('Niederlagen', String(l), f.length ? l / f.length * 100 : 0) +
      stat('Unentschieden', String(u), f.length ? u / f.length * 100 : 0) +
    '</div>' + lbl('Alle Kämpfe') +
    grp(f.slice().reverse().map(function (x) {
      return row({ t: x.opponent || 'Gegner',
        s: [x.date, x.method].filter(Boolean).join(', '),
        v: x.result === 'sieg' ? 'S' : x.result === 'niederlage' ? 'N' : 'U',
        chev: 1, go: 'M.old(&quot;fights&quot;,null,&quot;Kämpfe&quot;)' });
    }));
  }};

  S.profil = { title: 'Profil', root: 1, view: function () {
    var s = SCH();
    var lv = { anfaenger:'Anfänger', fortgeschritten:'Fortgeschritten', wettkampf:'Wettkämpfer', profi:'Profi' };
    var eq = (!s.gymAccess || s.gymAccess === 'none') ? 'Körpergewicht'
           : (s.gymAccess === 'basic' ? 'Basis' : 'Volles Gym');
    return '<h1 class="big">Profil</h1>' +
      grp([row({ t: (typeof getDisplayName === 'function' ? getDisplayName() : 'Dein Profil'),
                 s: 'Name und Konto', chev: 1, go: 'M.old(&quot;profil&quot;,&quot;account&quot;,&quot;Account&quot;)' })]) +
      lbl('Training') + grp([
        row({ t:'Gewicht', v: (s.weight || '-') + ' kg', chev:1, go:'M.pick(&quot;weight&quot;)' }),
        row({ t:'Größe', v: (s.height || '-') + ' cm', chev:1, go:'M.pick(&quot;height&quot;)' }),
        row({ t:'Level', v: lv[s.experienceLevel] || 'Fortgeschritten', chev:1, go:'M.pick(&quot;level&quot;)' }),
        row({ t:'Equipment', v: eq, chev:1, go:'M.pick(&quot;gym&quot;)' })
      ]) +
      lbl('Verein') + grp([
        row({ t:'Feed und Forum', s:'Beiträge anderer Boxer', chev:1, go:'M.old(&quot;community&quot;,null,&quot;Verein&quot;)' })
      ]) +
      lbl('Hilfe') + grp([
        row({ t:'Rechner', chev:1, go:'M.old(&quot;profil&quot;,&quot;rechner&quot;,&quot;Rechner&quot;)' }),
        row({ t:'FAQ', chev:1, go:'M.old(&quot;profil&quot;,&quot;faq&quot;,&quot;FAQ&quot;)' })
      ]) +
      lbl('Version') + grp([
        row({ t: 'Stand', v: String(window.__BUILD || 'unbekannt') }),
        row({ t: 'Neu laden und Cache leeren', chev: 1, go: 'M.reset()' })
      ]) +
      btn('Abmelden', 'doLogout()', 1);
  }};

  /* ---------- Wissen: echte Bildschirme statt Altbestand ---------- */

  // Grosstext in gemischte Schreibweise bringen: die Datenbank haelt
  // Namen in Versalien, das ist Plakatschrift-Erbe.
  function nice(s) {
    s = String(s || '').replace(/\s*—\s*/g, ': ');
    if (s !== s.toUpperCase()) return s;
    s = s.toLowerCase();
    // Kurze Bezeichnungen Wort fuer Wort gross, ganze Saetze nur vorn.
    if (s.split(/\s+/).length <= 4) {
      return s.replace(/(^|[\s\-–\/(])([a-zäöüß])/g,
        function (m, a, b) { return a + b.toUpperCase(); });
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function firstMuscle(m) {
    var t = String(m || '').replace(/PRIMÄR:\s*/i, '');
    t = t.split('·')[0].split('SEKUNDÄR')[0];
    return nice(t.trim().replace(/,\s*$/, ''));
  }

  // Die Listen sind in pages.js mit const deklariert und liegen damit
  // NICHT auf window. Erreichbar sind sie nur ueber den blanken Namen,
  // weil alle Skripte dieselbe globale lexikalische Umgebung teilen.
  function exGroups() {
    var g = [];
    function add(label, arr) { if (arr && arr.length) g.push([label, arr]); }
    try { add('Kraft und Explosivität', exercisesKraft); } catch (e) {}
    try { add('Ausdauer', exercisesAusdauer); } catch (e) {}
    try { add('Nacken und Rumpf', exercisesArmor); } catch (e) {}
    try { add('Hand und Handgelenk', exercisesHands); } catch (e) {}
    try { add('Mobilität', exercisesMobility); } catch (e) {}
    try { add('Kraftausdauer', exercisesPowerEndurance); } catch (e) {}
    try { add('Spezialtraining', exercisesSpecial); } catch (e) {}
    if (!g.length) { try { add('Alle Übungen', allExercises); } catch (e) {} }
    return g;
  }
  function exCount() { try { return allExercises.length; } catch (e) { return 0; } }

  function exRow(e) {
    var img = (typeof exerciseImgUrl === 'function') ? exerciseImgUrl(e.id, 0) : null;
    var thumb = img
      ? '<span class="ex-i"><img src="' + E(img) + '" alt="" loading="lazy" ' +
        'onerror="this.parentNode.textContent=&quot;&#9679;&quot;"></span>'
      : '<span class="ex-i">&#9679;</span>';
    return '<button class="ex" onclick="M.ex(&quot;' + E(e.id) + '&quot;)">' + thumb +
      '<span class="ex-m"><span class="ex-t">' + E(nice(e.name)) + '</span>' +
      '<span class="ex-s">' + E(firstMuscle(e.muscle)) + '</span></span>' +
      '<span class="chev"></span></button>';
  }

  S.uebungen = { title: 'Übungen', view: function () {
    var out = '<h1 class="big">Übungen</h1>', gs = exGroups();
    if (!gs.length) return out + '<div class="empty"><b>Keine Übungen geladen</b></div>';
    gs.forEach(function (g) {
      out += lbl(g[0]) + '<div class="grp">' + g[1].map(exRow).join('') + '</div>';
    });
    return out;
  }};

  S.uebung = { title: 'Übung', view: function () {
    var e = (typeof getExerciseById === 'function') ? getExerciseById(M.exId) : null;
    if (!e) return '<div class="empty"><b>Übung nicht gefunden</b></div>';
    var img = (typeof exerciseImgUrl === 'function') ? exerciseImgUrl(e.id, 0) : null;
    var out = '<h1 class="big">' + E(nice(e.name)) + '</h1>';
    if (img) out += '<div class="hero"><img src="' + E(img) + '" alt="" ' +
      'onerror="this.parentNode.remove()"></div>';
    out += lbl('Muskulatur') +
      grp([row({ t: firstMuscle(e.muscle) })]);
    if (e.sets && e.sets.length) {
      out += lbl('Sätze') + '<div class="grp">' + e.sets.map(function (s) {
        var parts = String(s).replace(/<[^>]+>/g, '').split(':');
        return row({ t: parts[0].trim(), v: (parts[1] || '').trim() });
      }).join('') + '</div>';
    }
    if (e.desc) {
      out += lbl('Ausführung') +
        '<div class="grp"><div class="row"><span class="row-m">' +
        '<span class="row-s" style="font-size:15px;line-height:1.5">' + E(e.desc) + '</span>' +
        '</span></div></div>';
    }
    return out;
  }};

  S.videos = { title: 'Videos', view: function () {
    var lib = [];
    try { lib = VIDEO_LIBRARY || []; } catch (e) { lib = window.VIDEO_LIBRARY || []; }
    var cats = {};
    lib.forEach(function (v) {
      var k = v.categoryLabel || v.category || 'Videos';
      (cats[k] = cats[k] || []).push(v);
    });
    var out = '<h1 class="big">Videos</h1>';
    Object.keys(cats).forEach(function (k) {
      out += lbl(nice(k)) + '<div class="grp">' + cats[k].map(function (v) {
        return row({ t: nice(v.title || v.name || 'Video'),
          s: [v.author, v.duration].filter(Boolean).join(', '),
          chev: 1,
          go: 'M.video(&quot;' + E(v.id || v.youtubeId || '') + '&quot;,&quot;' +
              E(String(v.title || '').replace(/"/g, '')) + '&quot;)' });
      }).join('') + '</div>';
    });
    return out || '<div class="empty"><b>Keine Videos</b></div>';
  }};

  // Textseiten: die vorhandenen Abschnitte als Menue, jeder Abschnitt
  // als eigener Bildschirm. Genau das Muster der Tagesansicht.
  var ARTICLES = {
    ernaehrung:     { t: 'Ernährung',      p: 'training', s: 'ernaehrung',      sel: '[id^="ern-s"]' },
    periodisierung: { t: 'Periodisierung', p: 'training', s: 'periodisierung',  sel: '.cat-header, h2, h3' },
    regeneration:   { t: 'Regeneration',   p: 'training', s: 'regeneration',    sel: '.cat-header, h2, h3' },
    saeulen:        { t: '8 Säulen',       p: 'profil',   s: 'saeulen',         sel: '.si-title, h2, h3' }
  };

  function sections(key) {
    var A = ARTICLES[key];
    var host = document.getElementById('m-scratch');
    if (!host) {
      host = document.createElement('div');
      host.id = 'm-scratch';
      host.style.cssText = 'position:absolute;left:-9999px;top:0;width:360px';
      document.body.appendChild(host);
    }
    try {
      if (A.p === 'training' && typeof renderTrainingPage === 'function') {
        window._trainingSubTab = A.s; renderTrainingPage(A.s);
      } else if (A.p === 'profil' && typeof renderProfilPage === 'function') {
        window._profilSubTab = A.s; renderProfilPage(A.s);
      }
      var src = document.getElementById('page-' + A.p);
      host.innerHTML = src ? src.innerHTML : '';
    } catch (e) { host.innerHTML = ''; }
    var heads = [].slice.call(host.querySelectorAll(A.sel));
    return heads.map(function (h, i) {
      var title = nice(h.textContent.replace(/^\s*\d+[.)]\s*/, '').trim());
      var body = '', n = h.nextElementSibling;
      while (n && heads.indexOf(n) === -1) { body += n.outerHTML; n = n.nextElementSibling; }
      return { title: title, body: body, i: i };
    }).filter(function (x) { return x.title && x.body; });
  }

  S.artikel = { title: 'Artikel', view: function () {
    var A = ARTICLES[M.art];
    var secs = sections(M.art);
    M.secs = secs;
    if (!secs.length) {
      // Zerlegung fehlgeschlagen: lieber den ganzen Inhalt zeigen als
      // einen leeren Bildschirm.
      var host = document.getElementById('m-scratch');
      var raw = host ? host.innerHTML : '';
      if (raw && raw.replace(/<[^>]+>/g, '').trim().length > 40) {
        return '<h1 class="big">' + E(A.t) + '</h1>' +
          '<div class="legacy article">' + raw + '</div>';
      }
      return '<h1 class="big">' + E(A.t) + '</h1>' +
        '<div class="empty"><b>Inhalt nicht geladen</b>' +
        '<p>Der Bereich konnte nicht aufgebaut werden.</p>' +
        '<button class="btn" onclick="M.reset()">Neu laden</button></div>';
    }
    return '<h1 class="big">' + E(A.t) + '</h1>' +
      lbl(secs.length + ' Kapitel') +
      grp(secs.map(function (s, i) {
        return row({ t: s.title, chev: 1, go: 'M.kap(' + i + ')' });
      }));
  }};

  S.kapitel = { title: 'Kapitel', view: function () {
    var s = (M.secs || [])[M.kapIdx];
    if (!s) return '<div class="empty"><b>Nicht gefunden</b></div>';
    return '<h1 class="big">' + E(s.title) + '</h1>' +
      '<div class="legacy article">' + s.body + '</div>';
  }};

  /* ---------- Einheit: eigener Bildschirm statt Altbestand ---------- */

  S.einheit = { title: 'Einheit', view: function () {
    var k = M.blkDay, i = M.blkIdx, b = blocks(k), x = b.all[i];
    if (!x) return '<div class="empty"><b>Einheit nicht gefunden</b></div>';
    var dn = done(k, i);
    var titel = nice(String(x.title || 'Einheit').replace(/\s*—\s*/g, ': '));

    var meta = [];
    if (x.time) meta.push(x.time);
    if (x.duration) meta.push(x.duration + ' Min');
    if (x.rpe) meta.push('RPE ' + x.rpe);
    var exs = (x.exercises && x.exercises.length && typeof x.exercises[0] === 'object')
      ? x.exercises : [];
    if (exs.length) meta.push(exs.length + (exs.length === 1 ? ' Übung' : ' Übungen'));

    var out = '<h1 class="big">' + E(titel) + '</h1>' + lbl(meta.join(' · '));

    if (x.desc) {
      out += '<div class="grp"><div class="row"><span class="row-m">' +
        '<span class="row-s" style="font-size:15px;line-height:1.5">' +
        E(String(x.desc).replace(/\s*—\s*/g, ', ')) + '</span></span></div></div>';
    }

    if (exs.length) {
      out += lbl('Ablauf') + '<div class="grp">' + exs.map(function (ex) {
        var lib = (typeof getExerciseById === 'function') ? getExerciseById(ex.id) : null;
        var name = nice(lib ? lib.name : String(ex.id || '').replace(/-/g, ' '));
        var img = (lib && typeof exerciseImgUrl === 'function') ? exerciseImgUrl(ex.id, 0) : null;
        var thumb = img
          ? '<span class="ex-i"><img src="' + E(img) + '" alt="" loading="lazy" ' +
            'onerror="this.parentNode.textContent=&quot;&#9679;&quot;"></span>'
          : '<span class="ex-i">&#9679;</span>';
        var sub = [ex.sets, ex.rest ? 'Pause ' + ex.rest : ''].filter(Boolean).join(' · ');
        var note = ex.note ? String(ex.note).replace(/\s*—\s*/g, ', ') : '';
        return '<button class="ex"' + (lib ? ' onclick="M.ex(&quot;' + E(ex.id) + '&quot;)"' : '') + '>' +
          thumb + '<span class="ex-m"><span class="ex-t">' + E(name) + '</span>' +
          '<span class="ex-s">' + E(sub || note) + '</span></span>' +
          (lib ? '<span class="chev"></span>' : '') + '</button>';
      }).join('') + '</div>';
    }

    var C = (typeof BLOCK_DETAIL_CONTENT !== 'undefined')
      ? (BLOCK_DETAIL_CONTENT[x.type] || null) : null;
    if (C) {
      if (C.warmup) out += lbl('Aufwärmen') + txtCard(C.warmup);
      if (C.cooldown) out += lbl('Ausklang') + txtCard(C.cooldown);
      if (C.notes) out += lbl('Hinweise') + txtCard(C.notes);
    }

    out += btn(dn ? 'Wieder öffnen' : 'Als erledigt markieren',
               'M.tickBack(&quot;' + k + '&quot;,' + i + ')', dn ? 1 : 0);
    return out;
  }};

  function txtCard(t) {
    var s = String(t).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/\s*—\s*/g, ', ').trim();
    if (!s) return '';
    return '<div class="grp"><div class="row"><span class="row-m">' +
      '<span class="row-s" style="font-size:15px;line-height:1.5">' + E(s) + '</span>' +
      '</span></div></div>';
  }

  var TABS = [['heute','Heute','h'],['plan','Plan','p'],['wissen','Wissen','w'],
              ['kaempfe','Kämpfe','k'],['profil','Profil','i']];

  /* ---------- Auswahlrad ---------- */

  var PICKS = {
    weight: { t:'Gewicht', u:'kg', get:function(){return SCH().weight||75;},
              opts:function(){var a=[];for(var i=40;i<=140;i++)a.push(i);return a;},
              set:function(v){ setSched('weight', v); } },
    height: { t:'Größe', u:'cm', get:function(){return SCH().height||180;},
              opts:function(){var a=[];for(var i=140;i<=220;i++)a.push(i);return a;},
              set:function(v){ setSched('height', v); } },
    level:  { t:'Level', get:function(){return SCH().experienceLevel||'fortgeschritten';},
              opts:function(){return [['anfaenger','Anfänger'],['fortgeschritten','Fortgeschritten'],
                ['wettkampf','Wettkämpfer'],['profi','Profi']];},
              set:function(v){ setSched('experienceLevel', v); } },
    gym:    { t:'Equipment', get:function(){return SCH().gymAccess||'none';},
              opts:function(){return [['none','Körpergewicht'],['basic','Basis'],['full','Volles Gym']];},
              set:function(v){ setSched('gymAccess', v); } }
  };

  function setSched(key, val) {
    try {
      var users = safeParse('fos_users', {});
      if (!users[currentUser]) users[currentUser] = {};
      users[currentUser][key] = val;
      localStorage.setItem('fos_users', JSON.stringify(users));
      if (typeof syncToCloud === 'function') syncToCloud();
      if (typeof generateCurrentWeekPlan === 'function') {
        var d = getData(); d.weekPlan = generateCurrentWeekPlan(); saveData(d);
      }
    } catch (e) {}
  }

  /* ---------- Navigation ---------- */

  var stack = [], M;

  function cur() { return stack[stack.length - 1]; }

  function bar() {
    var c = S[cur().id] || { title: cur().title }, par = stack.length > 1 ? stack[stack.length - 2] : null;
    var title = cur().title || c.title;
    document.getElementById('m-nav').innerHTML =
      (par ? '<button class="nav-back" onclick="M.back()"><span>' +
              E(par.title || (S[par.id] || {}).title || 'Zurück') + '</span></button>'
           : '<span class="nav-spacer"></span>') +
      '<span class="nav-title">' + E(title) + '</span>' +
      (c.act === 'chat'
        ? '<button class="nav-act" onclick="toggleAICoach()" aria-label="Coach"><span class="ico ico-chat"></span></button>'
        : '<span class="nav-spacer"></span>');
  }

  function body(dir) {
    var c = cur(), el = document.getElementById('m-body');
    var html = c.old ? '<div class="legacy" id="m-old"></div>' : S[c.id].view();
    el.innerHTML = '<div class="screen' + (dir === 'pop' ? ' pop' : '') + '">' + html + '</div>';
    el.scrollTop = 0;
    document.getElementById('m-nav').classList.remove('compact');
    if (c.old) mountOld(c.old);
    tabs();
  }

  function mountOld(spec) {
    var host = document.getElementById('m-old');
    if (!host) return;
    try {
      if (spec.p === 'training' && typeof renderTrainingPage === 'function') {
        window._trainingSubTab = spec.s; renderTrainingPage(spec.s);
      } else if (spec.p === 'profil' && typeof renderProfilPage === 'function') {
        window._profilSubTab = spec.s; renderProfilPage(spec.s);
      } else if (spec.p === 'community' && typeof renderCommunityPage === 'function') {
        renderCommunityPage();
      } else if (spec.p === 'fights' && typeof renderFightsPage === 'function') {
        renderFightsPage();
      }
      var src = document.getElementById('page-' + spec.p);
      if (src) {
        host.innerHTML = src.innerHTML;
        host.querySelectorAll('.sub-tabs, .page-header').forEach(function (n) { n.remove(); });
      }
    } catch (e) { host.innerHTML = '<div class="empty"><b>Nicht verfügbar</b></div>'; }
  }

  function tabs() {
    document.getElementById('m-tabs').innerHTML = TABS.map(function (t) {
      return '<button class="tab' + (t[0] === stack[0].id ? ' on' : '') +
        '" onclick="M.go(&quot;' + t[0] + '&quot;)"><span class="ti ti-' + t[2] + '"></span>' +
        '<u>' + E(t[1]) + '</u></button>';
    }).join('');
  }

  M = {
    sel: new Date().getDate(),
    go: function (id) {
      if (!S[id]) return;
      if (S[id].root) { stack = [{ id: id, title: S[id].title }]; bar(); body(); }
      else { stack.push({ id: id, title: S[id].title }); bar(); body('push'); }
    },
    tag: function (d) { M.sel = d; stack.push({ id: 'tag', title: 'Tag' }); bar(); body('push'); },
    ex: function (id) { M.exId = id; stack.push({ id: 'uebung', title: 'Übung' }); bar(); body('push'); },
    artikel: function (k) { M.art = k; stack.push({ id: 'artikel', title: ARTICLES[k].t }); bar(); body('push'); },
    kap: function (i) { M.kapIdx = i; stack.push({ id: 'kapitel', title: (M.secs[i]||{}).title || 'Kapitel' }); bar(); body('push'); },
    video: function (id, t) {
      if (typeof openVideoPlayer === 'function') { try { openVideoPlayer(id, t); return; } catch (e) {} }
    },
    old: function (p, s, t) { stack.push({ id: 'old', title: t, old: { p: p, s: s } }); bar(); body('push'); },
    back: function () { if (stack.length > 1) { stack.pop(); bar(); body('pop'); } },
    tick: function (d, i) {
      var b = blocks(d), x = b.all[i] || {};
      if (typeof toggleBlockDone === 'function') toggleBlockDone(d, i, x.type || '', x.title || '');
      body();
    },
    block: function (d, i) {
      M.blkDay = d; M.blkIdx = i;
      var b = blocks(d), x = b.all[i] || {};
      stack.push({ id: 'einheit', title: nice(String(x.title || 'Einheit').replace(/\s*—\s*/g, ': ')) });
      bar(); body('push');
    },
    tickBack: function (d, i) {
      var b = blocks(d), x = b.all[i] || {};
      if (typeof toggleBlockDone === 'function') toggleBlockDone(d, i, x.type || '', x.title || '');
      M.back();
    },
    pick: function (key) {
      var P = PICKS[key]; if (!P) return;
      var opts = P.opts(), cur = P.get();
      var pairs = opts.map(function (o) { return Array.isArray(o) ? o : [o, String(o)]; });
      var idx = Math.max(0, pairs.findIndex(function (p) { return String(p[0]) === String(cur); }));
      var sheet = document.getElementById('m-sheet');
      sheet.innerHTML =
        '<div class="sheet-bd" onclick="M.close()"></div>' +
        '<div class="pick-p">' +
          '<div class="pick-h"><button onclick="M.close()">Abbrechen</button>' +
            '<span>' + E(P.t) + '</span>' +
            '<button class="done" onclick="M.pickDone(&quot;' + key + '&quot;)">Fertig</button></div>' +
          '<div class="pick-w"><div class="pick-band"></div>' +
            '<div class="pick-c"><div class="pick-col" id="m-pickcol">' +
              pairs.map(function (p, i) {
                return '<div class="pick-o' + (i === idx ? ' sel' : '') + '" data-v="' + E(p[0]) + '">' +
                  E(p[1]) + (P.u ? ' ' + P.u : '') + '</div>'; }).join('') +
            '</div></div>' +
          '</div>' +
        '</div>';
      sheet.classList.add('open');
      var col = document.getElementById('m-pickcol');
      col.scrollTop = idx * 44;
      col.addEventListener('scroll', function () {
        var i = Math.round(col.scrollTop / 44);
        [].forEach.call(col.children, function (c, j) { c.classList.toggle('sel', j === i); });
      }, { passive: true });
    },
    pickDone: function (key) {
      var col = document.getElementById('m-pickcol');
      var i = Math.round(col.scrollTop / 44);
      var el = col.children[i];
      if (el) PICKS[key].set(isNaN(+el.dataset.v) ? el.dataset.v : +el.dataset.v);
      M.close(); body();
    },
    close: function () { document.getElementById('m-sheet').classList.remove('open'); },
    // Harte Reparatur von Hand, falls die automatische nicht greift.
    reset: function () {
      var jobs = [];
      try { sessionStorage.removeItem('bs_healed'); } catch (e) {}
      if (window.caches) jobs.push(caches.keys().then(function (k) {
        return Promise.all(k.map(function (n) { return caches.delete(n); })); }));
      if (navigator.serviceWorker) jobs.push(
        navigator.serviceWorker.getRegistrations().then(function (rs) {
          return Promise.all(rs.map(function (r) { return r.unregister(); })); }));
      Promise.all(jobs).then(function () { location.reload(); })
        .catch(function () { location.reload(); });
    }
  };
  window.M = M;

  /* ---------- Aufbau ---------- */

  function build() {
    var app = document.getElementById('app-screen');
    if (!app) return;
    var d = document.createElement('div');
    d.id = 'm-app';
    d.innerHTML =
      '<div class="nav" id="m-nav"></div>' +
      '<div class="body" id="m-body"></div>' +
      '<nav class="tabs" id="m-tabs"></nav>' +
      '<div class="sheet" id="m-sheet"></div>';
    app.appendChild(d);
    document.body.classList.add('m-on');
    stack = [{ id: 'heute', title: 'Heute' }];
    bar(); body();

    document.getElementById('m-body').addEventListener('scroll', function (e) {
      document.getElementById('m-nav').classList.toggle('compact', e.target.scrollTop > 28);
    }, { passive: true });

    var x0 = null;
    document.addEventListener('touchstart', function (e) {
      var t = e.touches[0]; x0 = t.clientX < 26 ? t.clientX : null;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      if (e.changedTouches[0].clientX - x0 > 60) M.back();
      x0 = null;
    }, { passive: true });
  }

  function start() {
    var a = document.getElementById('app-screen');
    if (!a || !a.classList.contains('active')) return setTimeout(start, 400);
    build();
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 700); });
  else setTimeout(start, 700);
})();
