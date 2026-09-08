/* ============================================================
   BOXSPEC · HANDY-APP AUF FRAMEWORK7
   ------------------------------------------------------------
   Framework7 bringt das native Verhalten mit, das sich von Hand
   nicht sauber nachbauen laesst: echter Navigationsstapel mit
   interaktivem Zurueckwischen, Uebergaenge die man mittendrin
   abbrechen kann, Auswahlraeder mit Traegheit, Action Sheets,
   korrektes Listen-Scrollverhalten.

   Die Logik bleibt unveraendert: getData, weekPlan,
   completedBlocks, toggleBlockDone, die Uebungsdatenbank und
   der Coach werden weiterverwendet. Nur die Oberflaeche ist neu.

   Wirkt ausschliesslich unter 768px. Der Desktop bleibt, wie er ist.
   ============================================================ */

(function () {
  'use strict';

  var MQ = window.matchMedia('(max-width: 768px)');
  if (!MQ.matches) {
    var onWide = function () { if (MQ.matches) location.reload(); };
    if (MQ.addEventListener) MQ.addEventListener('change', onWide); else MQ.addListener(onWide);
    return;
  }
  if (window.__f7) return;
  window.__f7 = true;

  /* ---------- Zugriff auf die vorhandene Logik ---------- */

  var E   = function (v) { return (typeof esc === 'function') ? esc(v) : String(v == null ? '' : v); };
  var D   = function () { return (typeof getData === 'function' && getData()) || {}; };
  var SCH = function () { return (typeof getUserSchedule === 'function' && getUserSchedule()) || {}; };

  var DAY  = ['mo','di','mi','do','fr','sa','so'];
  var DAYL = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
  var MON  = ['Januar','Februar','März','April','Mai','Juni','Juli','August',
              'September','Oktober','November','Dezember'];

  function ti()  { return (new Date().getDay() + 6) % 7; }
  function wid() { return (typeof getWeekId === 'function') ? getWeekId() : ''; }
  function blocks(d) {
    var all = (D().weekPlan && D().weekPlan[d]) || [];
    return { all: all, vis: all.filter(function (b) { return b.type !== 'meta'; }) };
  }
  function done(d, i) {
    var c = D().completedBlocks;
    return !!(c && c[d + '_' + i + '_' + wid()]);
  }
  function nice(s) {
    s = String(s || '').replace(/\s*\u2014\s*/g, ': ');
    if (s !== s.toUpperCase()) return s;
    s = s.toLowerCase();
    if (s.split(/\s+/).length <= 4) {
      return s.replace(/(^|[\s\-\u2013\/(])([a-zäöüß])/g,
        function (m, a, b) { return a + b.toUpperCase(); });
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function firstMuscle(m) {
    var t = String(m || '').replace(/PRIMÄR:\s*/i, '');
    t = t.split('·')[0].split('SEKUNDÄR')[0];
    return nice(t.trim().replace(/,\s*$/, ''));
  }
  function exList() {
    var g = [];
    function add(l, a) { if (a && a.length) g.push([l, a]); }
    try { add('Kraft und Explosivität', exercisesKraft); } catch (e) {}
    try { add('Ausdauer', exercisesAusdauer); } catch (e) {}
    try { add('Nacken und Rumpf', exercisesArmor); } catch (e) {}
    try { add('Hand und Handgelenk', exercisesHands); } catch (e) {}
    try { add('Mobilität', exercisesMobility); } catch (e) {}
    try { add('Kraftausdauer', exercisesPowerEndurance); } catch (e) {}
    try { add('Spezialtraining', exercisesSpecial); } catch (e) {}
    return g;
  }
  function exCount() { try { return allExercises.length; } catch (e) { return 0; } }
  function exImg(id) {
    try { return (typeof exerciseImgUrl === 'function') ? exerciseImgUrl(id, 0) : null; }
    catch (e) { return null; }
  }

  /* ---------- Symbole ----------
     Framework7 setzt auf eine eigene Icon-Schrift. Die waere ein
     zusaetzlicher Download von rund 200 KB fuer fuenf Zeichen.
     Stattdessen stehen sie hier als SVG direkt im Markup. */
  var IC = {
    heute:  'M3 10.2 12 3l9 7.2V21H14v-6h-4v6H3z',
    plan:   'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
    wissen: 'M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z',
    kaempfe:'M12 3l2.6 5.6L20 9.4l-4 4.1 1 6-5-3-5 3 1-6-4-4.1 5.4-.8z',
    profil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6',
    chat:   'M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z'
  };
  function svg(name, size) {
    return '<svg class="ic" viewBox="0 0 24 24" width="' + (size || 26) + '" height="' + (size || 26) +
      '" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="' + IC[name] + '"/></svg>';
  }

  /* ---------- Bausteine im Framework7-Markup ---------- */

  function page(name, title, content, opts) {
    opts = opts || {};
    return '<div class="page" data-name="' + name + '">' +
      '<div class="navbar' + (opts.large ? ' navbar-large navbar-large-transparent' : '') + '">' +
        '<div class="navbar-bg"></div>' +
        '<div class="navbar-inner' + (opts.large ? ' sliding' : '') + '">' +
          (opts.back ? '<div class="left"><a href="#" class="link back">' +
            '<i class="icon icon-back"></i><span class="if-not-md">' + E(opts.back) + '</span></a></div>'
            : '<div class="left"></div>') +
          '<div class="title">' + E(title) + '</div>' +
          '<div class="right">' + (opts.right || '') + '</div>' +
          (opts.large ? '<div class="title-large"><div class="title-large-text">' + E(title) + '</div></div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="page-content">' + content + '</div>' +
    '</div>';
  }

  function listBlock(rows, title) {
    return (title ? '<div class="block-title">' + E(title) + '</div>' : '') +
      '<div class="list list-strong list-outline inset media-list">' +
      '<ul>' + rows.join('') + '</ul></div>';
  }

  function item(o) {
    var media = o.media ? '<div class="item-media">' + o.media + '</div>' : '';
    var inner = '<div class="item-inner">' +
        '<div class="item-title-row">' +
          '<div class="item-title">' + E(o.title) + '</div>' +
          (o.after ? '<div class="item-after">' + E(o.after) + '</div>' : '') +
        '</div>' +
        (o.sub ? '<div class="item-subtitle">' + E(o.sub) + '</div>' : '') +
        (o.text ? '<div class="item-text">' + E(o.text) + '</div>' : '') +
      '</div>';
    if (o.link) {
      return '<li><a href="' + o.link + '" class="item-link item-content' +
        (o.done ? ' is-done' : '') + '">' + media + inner + '</a></li>';
    }
    return '<li><div class="item-content' + (o.done ? ' is-done' : '') + '">' + media + inner + '</div></li>';
  }

  function statRow(label, value, pct) {
    return '<li><div class="item-content"><div class="item-inner stat">' +
      '<div class="item-title-row"><div class="item-title">' + E(label) + '</div>' +
      '<div class="item-after">' + E(value) + '</div></div>' +
      '<div class="statbar"><i style="width:' + pct + '%"></i></div>' +
      '</div></div></li>';
  }

  function bigButton(text, onclick, fill) {
    return '<div class="block"><button class="button button-large ' +
      (fill === false ? 'button-outline' : 'button-fill') + '" onclick="' + onclick + '">' +
      E(text) + '</button></div>';
  }

  /* ---------- Bildschirme ---------- */

  function heuteHTML() {
    var i = ti(), k = DAY[i], b = blocks(k);
    var ds = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
    var c = '';

    if (!b.vis.length) {
      c += '<div class="block-title">' + E(DAYL[i] + ', ' + ds) + '</div>' +
        listBlock([item({ title: 'Ruhetag', sub: 'Erholung gehört zum Plan.' })]) +
        bigButton('Woche ansehen', 'F7.tab("plan")', false);
    } else {
      var n = 0, first = -1;
      var rows = b.vis.map(function (x) {
        var ri = b.all.indexOf(x), dn = done(k, ri);
        if (dn) n++; else if (first < 0) first = ri;
        var m = [];
        if (x.duration) m.push(x.duration + ' Min');
        if (x.rpe) m.push('RPE ' + x.rpe);
        return '<li><div class="item-content' + (dn ? ' is-done' : '') + '">' +
          '<div class="item-media"><span class="tick' + (dn ? ' on' : '') +
            '" onclick="F7.tick(\'' + k + '\',' + ri + ')"></span></div>' +
          '<div class="item-inner"><a href="/einheit/' + k + '/' + ri + '/" class="stretch">' +
            '<div class="item-title-row"><div class="item-title">' + E(nice(x.title || 'Einheit')) + '</div>' +
            '<div class="item-after chev"></div></div>' +
            '<div class="item-subtitle">' + E(m.join(' · ')) + '</div>' +
          '</a></div></div></li>';
      });
      c += '<div class="block block-strong inset sess">' +
          '<div class="sess-top"><span>' + E(DAYL[i] + ', ' + ds) + '</span>' +
          '<span>' + n + ' von ' + b.vis.length + '</span></div>' +
          '<div class="sess-title">' + E(nice((b.all[first < 0 ? 0 : first] || b.vis[0]).title || 'Training')) + '</div>' +
          '<div class="statbar big"><i style="width:' + Math.round(n / b.vis.length * 100) + '%"></i></div>' +
        '</div>' +
        '<div class="list list-strong list-outline inset media-list"><ul>' + rows.join('') + '</ul></div>' +
        (n === b.vis.length
          ? bigButton('Woche ansehen', 'F7.tab("plan")', false)
          : bigButton('Einheit starten', 'F7.open("/einheit/' + k + '/' + first + '/")'));
    }

    c += '<div class="block-title">Diese Woche</div><div class="block week">' +
      DAY.map(function (d, j) {
        var bb = blocks(d), t = bb.vis.length, dn = 0;
        bb.vis.forEach(function (x) { if (done(d, bb.all.indexOf(x))) dn++; });
        var p = t ? Math.round(dn / t * 100) : 0;
        return '<a href="#" onclick="F7.tab(\'plan\')" class="wd' + (j === i ? ' now' : '') +
          (t && dn === t ? ' full' : '') + '"><span>' + DAYL[j].slice(0, 2).toUpperCase() +
          '</span><span class="ring" style="--p:' + p + '%"></span></a>';
      }).join('') + '</div>';

    var tot = 0, dn2 = 0, mins = 0;
    DAY.forEach(function (d) {
      var bb = blocks(d);
      bb.vis.forEach(function (x) {
        tot++; mins += (x.duration || 0);
        if (done(d, bb.all.indexOf(x))) dn2++;
      });
    });
    var pct = tot ? Math.round(dn2 / tot * 100) : 0;
    c += '<div class="block-title">Bilanz</div>' +
      '<div class="list list-strong list-outline inset"><ul>' +
        statRow('Plan erfüllt', pct + ' %', pct) +
        statRow('Einheiten', dn2 + ' von ' + tot, tot ? dn2 / tot * 100 : 0) +
        statRow('Trainingszeit', (mins / 60).toFixed(1).replace('.', ',') + ' Std', Math.min(100, mins / 6)) +
      '</ul></div>';
    return c;
  }

  function planHTML() {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), td = now.getDate();
    var off = (new Date(y, m, 1).getDay() + 6) % 7;
    var len = new Date(y, m + 1, 0).getDate();
    var prev = new Date(y, m, 0).getDate();
    // Nur so viele Zeilen wie der Monat braucht, keine leere Schlusszeile.
    var total = Math.ceil((off + len) / 7) * 7;
    // Die Tage dieser Woche: nur dort ist bekannt, was erledigt wurde.
    var monday = td - ((now.getDay() + 6) % 7);
    var cells = '';
    for (var i = 0; i < total; i++) {
      var d = i - off + 1, out = d < 1 || d > len;
      var show = out ? (d < 1 ? prev + d : d - len) : d;
      var key = DAY[i % 7];
      var bb = out ? { all: [], vis: [] } : blocks(key);
      var has = bb.vis.length > 0;
      // Grün nur, wenn wirklich alles abgehakt ist. Vergangene Wochen
      // sind nicht gespeichert, also wird dort auch nichts behauptet.
      var full = false;
      if (has && !out && d >= monday && d < monday + 7) {
        full = bb.vis.every(function (x) { return done(key, bb.all.indexOf(x)); });
      }
      cells += '<a href="' + (out ? '#' : '/tag/' + d + '/') + '" class="cal-d' +
        (out ? ' out' : '') + (d === td && !out ? ' today' : '') +
        (has && !out ? (full ? ' has ok' : ' has') : '') + '">' + show + '</a>';
    }
    var wk = (typeof getProgram10WCurrentWeek === 'function') ? getProgram10WCurrentWeek() : 0;
    var ph = (wk && typeof getP10WPhase === 'function') ? getP10WPhase(wk) : null;
    var k = DAY[ti()], b = blocks(k);

    return '<div class="block block-strong inset cal">' +
        '<div class="cal-h"><b>' + MON[m] + ' ' + y + '</b></div>' +
        '<div class="cal-w">' + ['M','D','M','D','F','S','S'].map(function (x) {
          return '<span>' + x + '</span>'; }).join('') + '</div>' +
        '<div class="cal-g">' + cells + '</div>' +
      '</div>' +
      listBlock(b.vis.map(function (x) {
        var ri = b.all.indexOf(x), mm = [];
        if (x.time) mm.push(x.time);
        if (x.duration) mm.push(x.duration + ' Min');
        return item({ title: nice(x.title || 'Einheit'), sub: mm.join(', '),
          link: '/einheit/' + k + '/' + ri + '/', done: done(k, ri) });
      }).concat([item({ title: 'Ganzen Tag ansehen', link: '/tag/' + td + '/' })]),
        'Heute, ' + DAYL[ti()] + ' ' + td + '. ' + MON[m]) +
      (wk ? listBlock([
        item({ title: 'Woche', after: wk + ' von 10' }),
        item({ title: 'Phase', after: ph ? ph.name : '' })
      ], 'Programm') : '');
  }

  function tagHTML(d) {
    var now = new Date(), m = now.getMonth(), td = now.getDate();
    var dow = (new Date(now.getFullYear(), m, d).getDay() + 6) % 7;
    var k = DAY[dow], b = blocks(k);
    if (!b.vis.length) {
      return '<div class="block-title">Ruhetag</div>' +
        listBlock([item({ title: 'Kein Training geplant',
          sub: 'Erholung gehört zum Plan. Schlaf und lockere Bewegung zählen.' })]);
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
        '<a href="/einheit/' + k + '/' + ri + '/" class="tl-c">' +
          '<span class="tl-n">' + E(nice(x.title || 'Einheit')) + '</span>' +
          '<span class="tl-s">' + E(mm.join(', ')) + '</span></a></div>';
    }).join('');
    var rpe = rpes.length ? rpes.reduce(function (a, x) { return a + x; }, 0) / rpes.length : 0;
    return '<div class="block-title">' + (d === td ? 'Heute, ' : '') + b.vis.length +
        (b.vis.length === 1 ? ' Einheit' : ' Einheiten') + '</div>' +
      '<div class="block tl">' + tl + '</div>' +
      '<div class="block-title">Belastung</div>' +
      '<div class="list list-strong list-outline inset"><ul>' +
        statRow('Gesamtdauer', mins + ' Min', Math.min(100, mins / 2)) +
        statRow('Mittlerer RPE', rpe.toFixed(1).replace('.', ','), rpe * 10) +
      '</ul></div>';
  }

  function einheitHTML(k, i) {
    var b = blocks(k), x = b.all[i];
    if (!x) return '<div class="block"><p>Einheit nicht gefunden.</p></div>';
    var dn = done(k, i);
    var meta = [];
    if (x.time) meta.push(x.time);
    if (x.duration) meta.push(x.duration + ' Min');
    if (x.rpe) meta.push('RPE ' + x.rpe);
    var exs = (x.exercises && x.exercises.length && typeof x.exercises[0] === 'object') ? x.exercises : [];
    if (exs.length) meta.push(exs.length + (exs.length === 1 ? ' Übung' : ' Übungen'));

    var c = '<div class="block-title">' + E(meta.join(' · ')) + '</div>';
    if (x.desc) c += '<div class="block block-strong inset"><p class="prose">' +
      E(String(x.desc).replace(/\s*\u2014\s*/g, ', ')) + '</p></div>';

    if (exs.length) {
      c += listBlock(exs.map(function (ex) {
        var lib = (typeof getExerciseById === 'function') ? getExerciseById(ex.id) : null;
        var img = lib ? exImg(ex.id) : null;
        return item({
          title: nice(lib ? lib.name : String(ex.id || '').replace(/-/g, ' ')),
          sub: [ex.sets, ex.rest ? 'Pause ' + ex.rest : ''].filter(Boolean).join(' · '),
          media: img ? '<img src="' + E(img) + '" loading="lazy" alt="">' : '<span class="ph"></span>',
          link: lib ? '/uebung/' + encodeURIComponent(ex.id) + '/' : null
        });
      }), 'Ablauf');
    }
    try {
      var C = (typeof BLOCK_DETAIL_CONTENT !== 'undefined') ? BLOCK_DETAIL_CONTENT[x.type] : null;
      if (C && C.warmup)   c += textBlock('Aufwärmen', C.warmup);
      if (C && C.cooldown) c += textBlock('Ausklang', C.cooldown);
    } catch (e) {}

    c += bigButton(dn ? 'Wieder öffnen' : 'Als erledigt markieren',
      'F7.tickBack(\'' + k + '\',' + i + ')', !dn);
    return c;
  }

  function textBlock(t, body) {
    var s = String(body).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
      .replace(/\s*\u2014\s*/g, ', ').trim();
    if (!s) return '';
    return '<div class="block-title">' + E(t) + '</div>' +
      '<div class="block block-strong inset"><p class="prose">' + E(s) + '</p></div>';
  }

  function uebungenHTML() {
    return exList().map(function (g) {
      return listBlock(g[1].map(function (e) {
        var img = exImg(e.id);
        return item({ title: nice(e.name), sub: firstMuscle(e.muscle),
          media: img ? '<img src="' + E(img) + '" loading="lazy" alt="">' : '<span class="ph"></span>',
          link: '/uebung/' + encodeURIComponent(e.id) + '/' });
      }), g[0]);
    }).join('') || '<div class="block"><p>Keine Übungen geladen.</p></div>';
  }

  function uebungHTML(id) {
    var e = (typeof getExerciseById === 'function') ? getExerciseById(id) : null;
    if (!e) return '<div class="block"><p>Übung nicht gefunden.</p></div>';
    var img = exImg(e.id);
    var c = img ? '<div class="block inset hero"><img src="' + E(img) + '" alt=""></div>' : '';
    c += listBlock([item({ title: firstMuscle(e.muscle) })], 'Muskulatur');
    if (e.sets && e.sets.length) {
      c += listBlock(e.sets.map(function (s) {
        var p = String(s).replace(/<[^>]+>/g, '').split(':');
        return item({ title: p[0].trim(), after: (p[1] || '').trim() });
      }), 'Sätze');
    }
    if (e.desc) c += '<div class="block-title">Ausführung</div>' +
      '<div class="block block-strong inset"><p class="prose">' + E(e.desc) + '</p></div>';
    return c;
  }

  function wissenHTML() {
    return listBlock([
      item({ title: 'Übungen', sub: exCount() + ' Bewegungen mit Anleitung', link: '/uebungen/' }),
      item({ title: 'Videos', sub: 'Kampf-Breakdowns und Technik', link: '/videos/' }),
      item({ title: 'Ernährung', sub: 'Kalorien, Makros, Timing', link: '/artikel/ernaehrung/' }),
      item({ title: 'Periodisierung', sub: 'Wie sich der Plan aufbaut', link: '/artikel/periodisierung/' }),
      item({ title: 'Regeneration', sub: 'Schlaf, HRV, Belastung', link: '/artikel/regeneration/' }),
      item({ title: '8 Säulen', sub: 'Worauf das System aufbaut', link: '/artikel/saeulen/' })
    ]) + listBlock([
      item({ title: 'Tests', sub: 'Kraft, Ausdauer, Schnelligkeit', link: '/alt/training/tests/Tests/' }),
      item({ title: 'Log', sub: 'Was du trainiert hast', link: '/alt/training/log/Log/' }),
      item({ title: 'Notizen', sub: 'Gedanken und Beobachtungen', link: '/alt/training/notizen/Notizen/' })
    ], 'Deine Daten');
  }

  function videosHTML() {
    var lib = [];
    try { lib = VIDEO_LIBRARY || []; } catch (e) { lib = window.VIDEO_LIBRARY || []; }
    if (!lib.length) return '<div class="block"><p>Keine Videos.</p></div>';
    var cats = {};
    lib.forEach(function (v) {
      var key = v.categoryLabel || v.category || 'Videos';
      (cats[key] = cats[key] || []).push(v);
    });
    return Object.keys(cats).map(function (key) {
      return listBlock(cats[key].map(function (v) {
        return item({ title: nice(v.title || 'Video'),
          sub: [v.author, v.duration].filter(Boolean).join(', '),
          link: '#', onclick: '' });
      }), nice(key));
    }).join('');
  }

  var ARTICLES = {
    ernaehrung:     { t: 'Ernährung',      p: 'training', s: 'ernaehrung',     sel: '[id^="ern-s"]' },
    periodisierung: { t: 'Periodisierung', p: 'training', s: 'periodisierung', sel: '.cat-header, h2, h3' },
    regeneration:   { t: 'Regeneration',   p: 'training', s: 'regeneration',   sel: '.cat-header, h2, h3' },
    saeulen:        { t: '8 Säulen',       p: 'profil',   s: 'saeulen',        sel: '.si-title, h2, h3' }
  };
  var SECS = {};

  function sections(key) {
    var A = ARTICLES[key];
    var host = document.getElementById('f7-scratch');
    if (!host) {
      host = document.createElement('div');
      host.id = 'f7-scratch';
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
    var out = heads.map(function (h) {
      var title = nice(h.textContent.replace(/^\s*\d+[.)]\s*/, '').trim());
      var body = '', n = h.nextElementSibling;
      while (n && heads.indexOf(n) === -1) { body += n.outerHTML; n = n.nextElementSibling; }
      return { title: title, body: body };
    }).filter(function (x) { return x.title && x.body; });
    SECS[key] = out;
    return { secs: out, raw: host.innerHTML };
  }

  function artikelHTML(key) {
    var r = sections(key);
    if (r.secs.length) {
      return listBlock(r.secs.map(function (s, i) {
        return item({ title: s.title, link: '/kapitel/' + key + '/' + i + '/' });
      }), r.secs.length + ' Kapitel');
    }
    if (r.raw && r.raw.replace(/<[^>]+>/g, '').trim().length > 40) {
      return '<div class="block legacy">' + r.raw + '</div>';
    }
    return '<div class="block"><p>Inhalt nicht geladen.</p></div>';
  }

  function kapitelHTML(key, i) {
    var s = (SECS[key] || [])[i];
    if (!s) { sections(key); s = (SECS[key] || [])[i]; }
    return s ? '<div class="block legacy">' + s.body + '</div>'
             : '<div class="block"><p>Kapitel nicht gefunden.</p></div>';
  }

  /* Die Datenbank speichert Ergebnisse als S, N und U. Frueher stand
     hier ein Vergleich auf "sieg" und "niederlage", dadurch war die
     Bilanz auch bei vorhandenen Kaempfen falsch. */
  var RES = { S: 'Sieg', N: 'Niederlage', U: 'Unentschieden' };

  function fmtDate(d) {
    if (!d) return '';
    var t = new Date(d);
    if (isNaN(t)) return d;
    return t.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function kaempfeHTML() {
    var f = D().fights || [];
    if (!f.length) {
      return '<div class="block block-strong inset text-align-center">' +
          '<p><b>Noch keine Kämpfe</b></p>' +
          '<p class="prose">Trag deinen ersten Kampf ein, dann siehst du hier ' +
          'Bilanz, Methoden und Verlauf.</p>' +
        '</div>' +
        bigButton('Kampf eintragen', 'F7.open(&quot;/kampf-neu/&quot;)');
    }
    var w = f.filter(function (x) { return x.result === 'S'; }).length;
    var l = f.filter(function (x) { return x.result === 'N'; }).length;
    var u = f.length - w - l;
    var ko = f.filter(function (x) {
      return x.result === 'S' && (x.method === 'KO' || x.method === 'RSC'); }).length;

    return '<div class="block block-strong inset sess">' +
        '<div class="sess-top"><span>Bilanz</span><span>' + f.length +
          (f.length === 1 ? ' Kampf' : ' Kämpfe') + '</span></div>' +
        '<div class="sess-title">' + w + ' : ' + l + (u ? ' : ' + u : '') + '</div>' +
        '<div class="statbar big"><i style="width:' +
          Math.round(w / f.length * 100) + '%"></i></div>' +
      '</div>' +
      '<div class="list list-strong list-outline inset"><ul>' +
        statRow('Siege', String(w), w / f.length * 100) +
        statRow('Niederlagen', String(l), l / f.length * 100) +
        statRow('Unentschieden', String(u), u / f.length * 100) +
        (w ? statRow('Davon vorzeitig', String(ko), ko / w * 100) : '') +
      '</ul></div>' +
      listBlock(f.map(function (x, i) {
        return item({ title: x.opponent || 'Gegner',
          sub: [fmtDate(x.date), x.method].filter(Boolean).join(' · '),
          after: RES[x.result] || '',
          link: '/kampf/' + i + '/' });
      }), 'Alle Kämpfe') +
      bigButton('Kampf eintragen', 'F7.open(&quot;/kampf-neu/&quot;)', false);
  }

  function kampfHTML(i) {
    var x = (D().fights || [])[i];
    if (!x) return '<div class="block"><p>Kampf nicht gefunden.</p></div>';
    var c = listBlock([
      item({ title: 'Ergebnis', after: RES[x.result] || '' }),
      item({ title: 'Methode', after: x.method || '' }),
      item({ title: 'Datum', after: fmtDate(x.date) })
    ].concat(x.style ? [item({ title: 'Auslage', after: x.style })] : [])
     .concat(x.type ? [item({ title: 'Typ', after: x.type })] : []));

    if (x.good) c += '<div class="block-title">Was lief gut</div>' +
      '<div class="block block-strong inset"><p class="prose">' + E(x.good) + '</p></div>';
    if (x.improve) c += '<div class="block-title">Was verbessern</div>' +
      '<div class="block block-strong inset"><p class="prose">' + E(x.improve) + '</p></div>';
    if (x.opponentWeaknesses) c += '<div class="block-title">Schwächen des Gegners</div>' +
      '<div class="block block-strong inset"><p class="prose">' + E(x.opponentWeaknesses) + '</p></div>';

    var runden = (x.rounds || []).filter(function (r) { return r && r.notes; });
    if (runden.length) {
      c += listBlock(runden.map(function (r) {
        return item({ title: 'Runde ' + r.round, sub: r.notes });
      }), 'Runden');
    }
    c += bigButton('Kampf löschen', 'F7.kampfWeg(' + i + ')', false);
    return c;
  }

  /* Eintragen als eigener Bildschirm statt als Fenster ueber der App:
     ein Fenster braucht eine Ebene ueber allem und bricht das
     Zurueckwischen. Ein geschobener Bildschirm ist der App-Weg. */
  function kampfNeuHTML() {
    var heute = new Date().toISOString().slice(0, 10);
    var sel = function (id, label, opts) {
      return '<li><a href="#" class="item-link item-content" onclick="F7.kampfWahl(&quot;' + id + '&quot;)">' +
        '<div class="item-inner"><div class="item-title">' + E(label) + '</div>' +
        '<div class="item-after" id="kn-' + id + '-txt">' + E(opts) + '</div></div></a></li>';
    };
    return '<div class="block-title">Pflicht</div>' +
      '<div class="list list-strong list-outline inset"><ul>' +
        '<li class="item-content item-input"><div class="item-inner">' +
          '<div class="item-title item-label">Gegner</div>' +
          '<div class="item-input-wrap">' +
            '<input type="text" id="kn-gegner" placeholder="Name" autocomplete="off">' +
          '</div></div></li>' +
        '<li class="item-content item-input"><div class="item-inner">' +
          '<div class="item-title item-label">Datum</div>' +
          '<div class="item-input-wrap">' +
            '<input type="date" id="kn-datum" value="' + heute + '">' +
          '</div></div></li>' +
        sel('ergebnis', 'Ergebnis', 'Sieg') +
        sel('methode', 'Methode', 'Punkte') +
      '</ul></div>' +
      '<div class="block-title">Optional</div>' +
      '<div class="list list-strong list-outline inset"><ul>' +
        sel('auslage', 'Auslage des Gegners', 'Keine Angabe') +
        sel('typ', 'Typ des Gegners', 'Keine Angabe') +
        '<li class="item-content item-input item-input-with-value"><div class="item-inner">' +
          '<div class="item-title item-label">Was lief gut</div>' +
          '<div class="item-input-wrap">' +
            '<textarea id="kn-gut" rows="3" placeholder="Kurz notieren"></textarea>' +
          '</div></div></li>' +
        '<li class="item-content item-input"><div class="item-inner">' +
          '<div class="item-title item-label">Was verbessern</div>' +
          '<div class="item-input-wrap">' +
            '<textarea id="kn-besser" rows="3" placeholder="Kurz notieren"></textarea>' +
          '</div></div></li>' +
      '</ul></div>' +
      bigButton('Kampf speichern', 'F7.kampfSpeichern()');
  }

  function profilHTML() {
    var s = SCH();
    var lv = { anfaenger:'Anfänger', fortgeschritten:'Fortgeschritten',
               wettkampf:'Wettkämpfer', profi:'Profi' };
    var eq = (!s.gymAccess || s.gymAccess === 'none') ? 'Körpergewicht'
           : (s.gymAccess === 'basic' ? 'Basis' : 'Volles Gym');
    return listBlock([
      item({ title: (typeof getDisplayName === 'function' ? getDisplayName() : 'Dein Profil'),
             sub: 'Name und Konto', link: '/alt/profil/account/Account/' })
    ]) +
    '<div class="block-title">Training</div>' +
    '<div class="list list-strong list-outline inset"><ul>' +
      pickItem('weight', 'Gewicht', (s.weight || '-') + ' kg') +
      pickItem('height', 'Größe', (s.height || '-') + ' cm') +
      pickItem('level', 'Level', lv[s.experienceLevel] || 'Fortgeschritten') +
      pickItem('gym', 'Equipment', eq) +
    '</ul></div>' +
    listBlock([item({ title: 'Feed und Forum', sub: 'Beiträge anderer Boxer',
                      link: '/alt/community//Verein/' })], 'Verein') +
    listBlock([
      item({ title: 'Rechner', link: '/alt/profil/rechner/Rechner/' }),
      item({ title: 'FAQ', link: '/alt/profil/faq/FAQ/' })
    ], 'Hilfe') +
    listBlock([
      item({ title: 'Stand', after: String(window.__BUILD || 'unbekannt') }),
      '<li><a href="#" class="item-link item-content" onclick="F7.reset()">' +
        '<div class="item-inner"><div class="item-title">Neu laden und Cache leeren</div></div></a></li>'
    ], 'Version') +
    bigButton('Abmelden', 'doLogout()', false);
  }

  function pickItem(key, label, value) {
    return '<li><a href="#" class="item-link item-content" onclick="F7.pick(\'' + key + '\')">' +
      '<div class="item-inner"><div class="item-title">' + E(label) + '</div>' +
      '<div class="item-after">' + E(value) + '</div></div></a></li>';
  }

  function altHTML(parent, sub) {
    var host = document.createElement('div');
    try {
      if (parent === 'training' && typeof renderTrainingPage === 'function') {
        window._trainingSubTab = sub; renderTrainingPage(sub);
      } else if (parent === 'profil' && typeof renderProfilPage === 'function') {
        window._profilSubTab = sub; renderProfilPage(sub);
      } else if (parent === 'community' && typeof renderCommunityPage === 'function') {
        renderCommunityPage();
      } else if (parent === 'fights' && typeof renderFightsPage === 'function') {
        renderFightsPage();
      }
      var src = document.getElementById('page-' + parent);
      host.innerHTML = src ? src.innerHTML : '';
      host.querySelectorAll('.sub-tabs, .page-header').forEach(function (n) { n.remove(); });
    } catch (e) { host.innerHTML = '<p>Bereich nicht verfügbar.</p>'; }
    return '<div class="block legacy">' + host.innerHTML + '</div>';
  }

  /* ---------- Auswahlrad ---------- */

  var PICKS = {
    weight: { t:'Gewicht', u:' kg', key:'weight',
              vals:function(){var a=[];for(var i=40;i<=140;i++)a.push(String(i));return a;},
              cur:function(){return String(SCH().weight||75);} },
    height: { t:'Größe', u:' cm', key:'height',
              vals:function(){var a=[];for(var i=140;i<=220;i++)a.push(String(i));return a;},
              cur:function(){return String(SCH().height||180);} },
    level:  { t:'Level', key:'experienceLevel',
              vals:function(){return ['anfaenger','fortgeschritten','wettkampf','profi'];},
              labels:{anfaenger:'Anfänger',fortgeschritten:'Fortgeschritten',
                      wettkampf:'Wettkämpfer',profi:'Profi'},
              cur:function(){return SCH().experienceLevel||'fortgeschritten';} },
    gym:    { t:'Equipment', key:'gymAccess',
              vals:function(){return ['none','basic','full'];},
              labels:{none:'Körpergewicht',basic:'Basis',full:'Volles Gym'},
              cur:function(){return SCH().gymAccess||'none';} }
  };

  function setSched(key, val) {
    try {
      var users = safeParse('fos_users', {});
      if (!users[currentUser]) users[currentUser] = {};
      users[currentUser][key] = val;
      localStorage.setItem('fos_users', JSON.stringify(users));
      if (typeof generateCurrentWeekPlan === 'function') {
        var d = getData(); d.weekPlan = generateCurrentWeekPlan(); saveData(d);
      }
    } catch (e) {}
  }

  /* ---------- App ---------- */

  var app, F7;

  function routes() {
    return [
      { path: '/heute/', async: function (c) { c.resolve({ content:
          page('heute', 'Heute', heuteHTML(), { large: 1,
            right: '<a href="#" class="link icon-only" onclick="toggleAICoach()" ' +
                   'aria-label="Coach">' + svg('chat', 24) + '</a>' }) }); } },
      { path: '/plan/', async: function (c) { c.resolve({ content:
          page('plan', 'Plan', planHTML(), { large: 1 }) }); } },
      { path: '/wissen/', async: function (c) { c.resolve({ content:
          page('wissen', 'Wissen', wissenHTML(), { large: 1 }) }); } },
      { path: '/kaempfe/', async: function (c) { c.resolve({ content:
          page('kaempfe', 'Kämpfe', kaempfeHTML(), { large: 1 }) }); } },
      { path: '/profil/', async: function (c) { c.resolve({ content:
          page('profil', 'Profil', profilHTML(), { large: 1 }) }); } },

      { path: '/tag/:d/', async: function (ctx) {
          var d = parseInt(ctx.to.params.d, 10);
          var now = new Date();
          ctx.resolve({ content: page('tag', DAYL[(new Date(now.getFullYear(), now.getMonth(), d).getDay() + 6) % 7] +
            ', ' + d + '. ' + MON[now.getMonth()], tagHTML(d), { back: 'Plan' }) });
        } },
      { path: '/einheit/:k/:i/', async: function (ctx) {
          var k = ctx.to.params.k, i = parseInt(ctx.to.params.i, 10);
          var b = blocks(k), x = b.all[i] || {};
          ctx.resolve({ content: page('einheit', '',
            '<h1 class="big">' + E(nice(x.title || 'Einheit')) + '</h1>' + einheitHTML(k, i),
            { back: 'Zurück' }) });
        } },
      { path: '/uebungen/', async: function (c) { c.resolve({ content:
          page('uebungen', 'Übungen', uebungenHTML(), { large: 1, back: 'Wissen' }) }); } },
      { path: '/uebung/:id/', async: function (ctx) {
          var id = decodeURIComponent(ctx.to.params.id);
          var e = (typeof getExerciseById === 'function') ? getExerciseById(id) : null;
          ctx.resolve({ content: page('uebung', '',
            '<h1 class="big">' + E(nice(e ? e.name : 'Übung')) + '</h1>' + uebungHTML(id),
            { back: 'Zurück' }) });
        } },
      { path: '/kampf-neu/', async: function (c) { c.resolve({ content:
          page('kampf-neu', 'Neuer Kampf', kampfNeuHTML(), { back: 'Kämpfe' }) }); } },
      { path: '/kampf/:i/', async: function (ctx) {
          var i = parseInt(ctx.to.params.i, 10);
          var x = (D().fights || [])[i] || {};
          ctx.resolve({ content: page('kampf', '',
            '<h1 class="big">' + E(x.opponent || 'Kampf') + '</h1>' + kampfHTML(i),
            { back: 'Kämpfe' }) });
        } },
      { path: '/videos/', async: function (c) { c.resolve({ content:
          page('videos', 'Videos', videosHTML(), { large: 1, back: 'Wissen' }) }); } },
      { path: '/artikel/:key/', async: function (ctx) {
          var key = ctx.to.params.key;
          ctx.resolve({ content: page('artikel', ARTICLES[key] ? ARTICLES[key].t : 'Artikel',
            artikelHTML(key), { large: 1, back: 'Wissen' }) });
        } },
      { path: '/kapitel/:key/:i/', async: function (ctx) {
          var key = ctx.to.params.key, i = parseInt(ctx.to.params.i, 10);
          var s = (SECS[key] || [])[i];
          ctx.resolve({ content: page('kapitel', '',
            '<h1 class="big">' + E(s ? s.title : 'Kapitel') + '</h1>' + kapitelHTML(key, i),
            { back: ARTICLES[key] ? ARTICLES[key].t : 'Zurück' }) });
        } },
      { path: '/alt/:p/:s/:t/', async: function (ctx) {
          var p = ctx.to.params.p, s = ctx.to.params.s, t = decodeURIComponent(ctx.to.params.t);
          ctx.resolve({ content: page('alt', '',
            '<h1 class="big">' + E(t) + '</h1>' + altHTML(p, s || null), { back: 'Zurück' }) });
        } }
    ];
  }

  F7 = {
    tab: function (id) { app.tab.show('#tab-' + id); },
    open: function (url) { current().router.navigate(url); },
    /* Optimistisch: erst der lokale Stand und das Bild, dann das Netz.
       Der Haken sitzt in dem Moment, in dem der Finger ihn beruehrt,
       nicht wenn die Cloud geantwortet hat. */
    tick: function (k, i) {
      var b = blocks(k), x = b.all[i] || {};
      var war = done(k, i);
      if (window.Native) Native.haptic(war ? 'light' : 'success');
      if (typeof toggleBlockDone === 'function') toggleBlockDone(k, i, x.type || '', x.title || '');
      F7.refresh();
      laterSync();
    },
    tickBack: function (k, i) {
      var b = blocks(k), x = b.all[i] || {};
      if (window.Native) Native.haptic(done(k, i) ? 'light' : 'success');
      if (typeof toggleBlockDone === 'function') toggleBlockDone(k, i, x.type || '', x.title || '');
      current().router.back();
      setTimeout(F7.refresh, 350);
      laterSync();
    },
    refresh: function () {
      ['heute','plan','kaempfe','profil'].forEach(function (id) {
        var v = app.views.get('#tab-' + id);
        if (!v) return;
        var pg = v.el.querySelector('.page[data-name="' + id + '"] .page-content');
        if (!pg) return;
        pg.innerHTML = id === 'heute' ? heuteHTML()
                     : id === 'plan' ? planHTML()
                     : id === 'kaempfe' ? kaempfeHTML() : profilHTML();
      });
    },
    pick: function (key) {
      var P = PICKS[key];
      if (!P) return;
      var vals = P.vals();
      openPicker({
        rotateEffect: true,
        toolbarCloseText: 'Fertig',
        sheetSwipeToClose: true,
        // sheetPush schiebt die Seite darunter hoch. Der Rumpf ist
        // aber fest verankert (position:fixed aus dem Regelwerk), die
        // Verschiebung schlaegt fehl und das Rad bleibt unterhalb des
        // Bildschirms auf modal-out stehen: sichtbar wird nur ein
        // eckiger Streifen. Ohne Push oeffnet es normal.
        value: [P.cur()],
        formatValue: function (values) {
          return P.labels ? (P.labels[values[0]] || values[0]) : values[0] + (P.u || '');
        },
        cols: [{
          values: vals,
          displayValues: vals.map(function (v) {
            return P.labels ? (P.labels[v] || v) : v + (P.u || '');
          })
        }],
        on: {
          close: function (p) {
            var v = p.value[0];
            setSched(P.key, isNaN(+v) ? v : +v);
            F7.refresh();
            laterSync();
          }
        }
      });
    },
    /* Auswahl fuer die vier Listenfelder des Kampfformulars. Die Werte
       sind exakt die der Datenbank (S, N, U und die Methodenkuerzel),
       damit die uebrige Auswertung sie versteht. */
    kampfWahl: function (feld) {
      var W = {
        ergebnis: [['S','Sieg'],['N','Niederlage'],['U','Unentschieden']],
        methode:  [['Punkte','Punkte'],['RSC','RSC / TKO'],['KO','KO'],
                   ['DQ','Disqualifikation'],['WO','Walkover']],
        auslage:  [['','Keine Angabe'],['Ausleger','Orthodox'],['Rechtsausleger','Southpaw']],
        typ:      [['','Keine Angabe'],['Distanz','Distanz'],['Infighter','Infighter'],
                   ['Konter','Konterboxer'],['Druck','Drucksteller']]
      }[feld];
      if (!W) return;
      var vals = W.map(function (x) { return x[0]; });
      var txt  = W.map(function (x) { return x[1]; });
      var akt  = kampfWerte[feld] != null ? kampfWerte[feld] : vals[0];
      openPicker({
        rotateEffect: true, toolbarCloseText: 'Fertig', sheetSwipeToClose: true,
        value: [akt],
        cols: [{ values: vals, displayValues: txt }],
        on: {
          close: function (p) {
            var v = p.value[0];
            kampfWerte[feld] = v;
            var el = document.getElementById('kn-' + feld + '-txt');
            if (el) el.textContent = txt[vals.indexOf(v)] || v;
          }
        }
      });
    },

    kampfSpeichern: function () {
      var g = document.getElementById('kn-gegner');
      var name = g ? g.value.trim() : '';
      if (!name) {
        if (window.Native) Native.haptic('error');
        app.dialog.alert('Trag zuerst den Namen des Gegners ein.', 'Gegner fehlt');
        if (g) g.focus();
        return;
      }
      var val = function (id) {
        var e = document.getElementById(id); return e ? e.value.trim() : ''; };
      var data = (typeof getData === 'function') ? getData() : null;
      if (!data) return;
      if (!data.fights) data.fights = [];
      data.fights.unshift({
        date: val('kn-datum') || new Date().toISOString().slice(0, 10),
        opponent: name,
        result: kampfWerte.ergebnis || 'S',
        method: kampfWerte.methode || 'Punkte',
        style: kampfWerte.auslage || '',
        type: kampfWerte.typ || '',
        good: val('kn-gut'),
        improve: val('kn-besser'),
        rounds: [],
        videoLink: '',
        opponentWeaknesses: ''
      });
      if (typeof saveData === 'function') saveData(data);
      if (window.Native) Native.haptic('success');
      kampfWerte = {};
      F7.refresh();
      current().router.back();
      laterSync();
    },

    kampfWeg: function (i) {
      app.dialog.confirm('Diesen Kampf löschen?', 'Löschen', function () {
        var data = getData();
        if (!data || !data.fights) return;
        data.fights.splice(i, 1);
        saveData(data);
        if (window.Native) Native.haptic('warning');
        F7.refresh();
        current().router.back();
        laterSync();
      });
    },

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
  window.F7 = F7;

  /* Ohne Netz wandert die Uebertragung in die Schlange und wird
     nachgereicht, sobald das Geraet wieder online und im Vordergrund
     ist. Hintergrund-Sync gibt es auf iOS nicht, darauf zu bauen
     hiesse, Daten zu verlieren. */
  // Auswahl des Kampfformulars, bis gespeichert wird
  var kampfWerte = {};

  function laterSync() {
    if (!window.Native) {
      if (typeof syncToCloud === 'function') try { syncToCloud(); } catch (e) {}
      return;
    }
    if (!Native.online()) { Native.enqueue({ kind: 'sync', payload: {} }); return; }
    if (typeof syncToCloud === 'function') {
      try {
        var r = syncToCloud();
        if (r && r.catch) r.catch(function () { Native.enqueue({ kind: 'sync', payload: {} }); });
      } catch (e) { Native.enqueue({ kind: 'sync', payload: {} }); }
    }
  }

  /* Ein Auswahlrad oeffnen, ohne dass die eigene Beruehrung es
     wieder zumacht. Der Klick, der es aufruft, laeuft anschliessend
     weiter bis zum Dokument; Framework7 wertet ihn dort als Klick
     ausserhalb des Sheets und schliesst es im selben Moment. Sichtbar
     blieb nur ein eckiger Streifen am unteren Rand. Das Oeffnen wartet
     deshalb, bis die Geste vollstaendig durch ist.
     Nach dem Schliessen wird das Rad abgeraeumt, sonst sammeln sich
     Leichen im Dokument, und die naechste Messung erwischt die alte. */
  function openPicker(cfg) {
    cfg.on = cfg.on || {};
    var bereit = false;

    // Framework7 meldet beim Aufbau der Spalten bereits "change".
    // Da hat noch niemand gedreht, also gibt es auch nichts zu fuehlen.
    var beiWechsel = cfg.on.change;
    cfg.on.change = function () {
      if (!bereit) return;
      if (window.Native) Native.haptic('light');
      if (beiWechsel) try { beiWechsel.apply(null, arguments); } catch (e) {}
    };
    var beiOffen = cfg.on.opened;
    cfg.on.opened = function (pk) {
      bereit = true;
      if (beiOffen) try { beiOffen(pk); } catch (e) {}
    };
    var beiZu = cfg.on.closed;
    cfg.on.closed = function (pk) {
      bereit = false;
      if (beiZu) try { beiZu(pk); } catch (e) {}
      setTimeout(function () { try { pk.destroy(); } catch (e) {} }, 0);
    };

    var picker = app.picker.create(cfg);
    setTimeout(function () { picker.open(); }, 0);
    return picker;
  }

  function current() {
    return app.views.current || app.views.main;
  }

  /* ---------- App-Shell ----------
     Zwischen Seitenaufbau und fertigem Framework7 liegen ein paar
     hundert Millisekunden. In der Zeit zeigt die App ihr Geruest
     statt einer schwarzen Flaeche oder eines Drehkreisels. Ein
     Drehkreisel ist das Erkennungsmerkmal einer Webseite. */
  function skeleton() {
    var rows = '';
    for (var i = 0; i < 5; i++) {
      rows += '<div class="skel-row"><div class="skel skel-thumb"></div>' +
        '<div class="skel-lines"><div class="skel skel-l1"></div>' +
        '<div class="skel skel-l2"></div></div></div>';
    }
    return '<div id="bs-shell" style="position:fixed;inset:0;background:#000;' +
      'padding-top:calc(var(--safe-t) + 56px)">' +
      '<div class="skel skel-card"></div>' + rows + '</div>';
  }

  function showShell() {
    if (document.getElementById('f7-root')) return;
    var host = document.getElementById('app-screen');
    if (!host || document.getElementById('bs-shell')) return;
    var d = document.createElement('div');
    // Bewusst NICHT id="f7app": Framework7 sucht sein Wurzelelement per
    // Selektor und wuerde sich an das erste Treffer-Element binden. Das
    // Geruest kommt zuerst im Dokument, Framework7 haenge sich daran,
    // und nach dem Entfernen des Geruests lag seine Wurzel ausserhalb
    // des Dokuments: Auswahlraeder und Sheets wurden unsichtbar erzeugt.
    d.id = 'bs-shell-host';
    d.style.cssText = 'position:fixed;inset:0;z-index:899';
    d.innerHTML = skeleton();
    host.appendChild(d);
    document.body.classList.add('f7-on');
  }

  function hideShell() {
    var sh = document.getElementById('bs-shell-host');
    if (sh) sh.remove();
  }

  function build() {
    var host = document.getElementById('app-screen');
    if (!host) return;

    var TABS = [
      ['heute','Heute'], ['plan','Plan'], ['wissen','Wissen'],
      ['kaempfe','Kämpfe'], ['profil','Profil']
    ];

    var root = document.createElement('div');
    root.id = 'f7-root';
    root.innerHTML =
      '<div id="f7app">' +
        '<div class="views tabs safe-areas">' +
          '<div class="toolbar tabbar tabbar-icons toolbar-bottom">' +
            '<div class="toolbar-inner">' +
              TABS.map(function (t, i) {
                return '<a href="#tab-' + t[0] + '" class="tab-link' + (i === 0 ? ' tab-link-active' : '') + '">' +
                  svg(t[0], 25) + '<span class="tabbar-label">' + t[1] + '</span></a>';
              }).join('') +
            '</div>' +
          '</div>' +
          TABS.map(function (t, i) {
            return '<div id="tab-' + t[0] + '" class="view ' +
              (i === 0 ? 'view-main view-init tab tab-active' : 'view-init tab') +
              '" data-url="/' + t[0] + '/"></div>';
          }).join('') +
        '</div>' +
      '</div>';
    host.appendChild(root);
    document.body.classList.add('f7-on');
    hideShell();

    app = new Framework7({
      el: '#f7app',
      name: 'BoxSpec',
      theme: 'ios',
      darkMode: true,
      routes: routes(),
      view: {
        pushState: false,
        iosDynamicNavbar: true,
        xhrCache: false,
        // Zurueckwischen vom linken Rand, wie in jeder iOS-App.
        iosSwipeBack: true,
        iosSwipeBackAnimateShadow: true,
        iosSwipeBackActiveArea: 30
      },
      touch: { tapHold: true },
      // Wer weniger Bewegung eingestellt hat, bekommt weniger Bewegung.
      animate: !(window.Native && Native.reducedMotion())
    });
    window.__f7app = app;

    behaviour();
  }

  /* ============================================================
     VERHALTEN
     Reaktionszeit, Haptik, Vorabladen, Offline, Installation.
     ============================================================ */

  function behaviour() {
    var el = document.getElementById('f7app');

    // Farbschema folgt der Systemeinstellung, nicht einem Schalter.
    el.classList.add('theme-auto');
    var mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    var applyScheme = function () {
      var dark = mqDark.matches;
      try { app.setDarkMode(dark); } catch (e) {}
      if (window.Native) Native.statusBar(dark ? 'DARK' : 'LIGHT');
    };
    applyScheme();
    if (mqDark.addEventListener) mqDark.addEventListener('change', applyScheme);
    else if (mqDark.addListener) mqDark.addListener(applyScheme);

    // Auf dem Homescreen verschwinden alle Browser-Hinweise.
    if (window.Native && Native.standalone) document.body.classList.add('bs-standalone');

    haptics();
    prefetch();
    offlineBanner();
    installHint();
  }

  /* ---------- Haptik ----------
     Nur dort, wo etwas passiert. Haptik bei jeder Beruehrung ist
     Laerm, nicht Rueckmeldung. */
  function haptics() {
    if (!window.Native) return;
    document.getElementById('f7app').addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;
      if (t.closest('.tick')) return;                    // wird selbst ausgeloest
      if (t.closest('.tab-link')) Native.haptic('light');
      else if (t.closest('.button')) Native.haptic('medium');
    }, true);
  }

  /* ---------- Vorabladen ----------
     Beim Beruehren, nicht beim Loslassen. Die Textseiten muessen die
     alten Seiten erst rendern und zerlegen; passiert das schon
     waehrend der Finger unterwegs ist, ist der Bildschirm sofort da. */
  var warmed = {};
  function prefetch() {
    document.getElementById('f7app').addEventListener('touchstart', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="/artikel/"]');
      if (!a) return;
      var key = a.getAttribute('href').split('/')[2];
      if (!key || warmed[key]) return;
      warmed[key] = 1;
      try { sections(key); } catch (err) {}
    }, { passive: true });
  }

  /* ---------- Offline ----------
     Ein Hinweis, keine Fehlerseite. Was offline geschrieben wurde,
     wird beim naechsten Netz nachgereicht. */
  function offlineBanner() {
    var bar = document.createElement('div');
    bar.id = 'bs-offline';
    bar.setAttribute('role', 'status');
    document.body.appendChild(bar);

    var show = function (text, kind) {
      bar.textContent = text;
      bar.className = 'on' + (kind ? ' ' + kind : '');
    };
    var hide = function () { bar.className = ''; };

    if (!window.Native) return;

    Native.registerRunner('sync', function () {
      if (typeof syncToCloud !== 'function') return true;
      return syncToCloud();
    });

    Native.onNetwork(function (on) {
      if (!on) {
        show('Offline. Änderungen werden gespeichert und später übertragen.');
        return;
      }
      var offen = Native.queueLength();
      if (!offen) { hide(); return; }
      show('Wieder online, ' + offen + (offen === 1 ? ' Änderung' : ' Änderungen') + ' werden übertragen…');
      Native.flush().then(function () {
        show('Alles übertragen.', 'sync');
        setTimeout(hide, 1800);
      });
    });
    if (!Native.online()) show('Offline. Änderungen werden gespeichert und später übertragen.');
  }

  /* ---------- Installation ----------
     Safari kennt keinen Installationsdialog. Ohne Erklaerung findet
     niemand den Weg ueber Teilen, also wird er gezeigt: nach dem
     dritten Start, einmal, und nie wieder nach dem Wegtippen. */
  function installHint() {
    if (!window.Native) return;
    var state = Native.installState();
    if (state === 'installiert' || state === 'nativ') return;
    var seen = 0, starts = 0;
    try {
      seen = +localStorage.getItem('bs_install_seen') || 0;
      starts = (+localStorage.getItem('bs_starts') || 0) + 1;
      localStorage.setItem('bs_starts', starts);
    } catch (e) {}
    if (seen || starts < 3) return;

    var teilen = '<span class="sq">' +
      '<svg width="13" height="16" viewBox="0 0 14 18" fill="none" stroke="#0A84FF" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M7 1v10M3.5 4.5 7 1l3.5 3.5M1 8v8h12V8"/></svg></span>';
    var plus = '<span class="sq">' +
      '<svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="#fff" ' +
      'stroke-width="1.8" stroke-linecap="round"><path d="M6 1v10M1 6h10"/></svg></span>';

    var box = document.createElement('div');
    box.id = 'bs-install';
    box.innerHTML =
      '<div class="card">' +
        '<div class="bs-sheet-handle"></div>' +
        '<h2>BoxSpec auf den Homescreen</h2>' +
        (state === 'ios-anleitung'
          ? '<p>Safari hat keinen Installationsknopf. Auf dem Homescreen startet ' +
            'BoxSpec ohne Browserleiste, behält deine Daten dauerhaft und darf ' +
            'dir Erinnerungen schicken.</p>' +
            '<ol><li>Unten auf ' + teilen + ' <b>Teilen</b> tippen</li>' +
            '<li>Nach unten wischen zu ' + plus + ' <b>Zum Home-Bildschirm</b></li>' +
            '<li>Oben rechts auf <b>Hinzufügen</b></li></ol>' +
            '<button id="bs-install-ok">Verstanden</button>'
          : '<p>Auf dem Homescreen startet BoxSpec ohne Browserleiste und behält ' +
            'deine Daten dauerhaft.</p>' +
            '<button id="bs-install-go">Installieren</button>' +
            '<button class="ghost" id="bs-install-ok">Später</button>') +
      '</div>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('on'); });

    var close = function () {
      box.classList.remove('on');
      try { localStorage.setItem('bs_install_seen', '1'); } catch (e) {}
      setTimeout(function () { box.remove(); }, 320);
    };
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.id === 'bs-install-ok') close();
      if (e.target.id === 'bs-install-go') Native.installPrompt().then(close);
    });
  }

  /* ---------- Start ----------
     Frueher stand hier eine feste Frist von 600ms. Eine Frist ist immer
     falsch: entweder zu kurz, dann ist die Anmeldung noch nicht durch,
     oder zu lang, dann wartet die App grundlos. Gewartet wird jetzt auf
     das Ereignis selbst.

     Gebraucht werden genau zwei Dinge:
       1. #app-screen traegt "active", die Anmeldung ist also durch
       2. Framework7 ist geladen
     Die Uebungs- und Videodaten stehen bereits: pages.js und
     video-library.js werden vor dieser Datei geladen, ihre Inhalte
     liegen mit dem Ausfuehren des Skripts vor. */
  var gestartet = false;

  function bereit() {
    var a = document.getElementById('app-screen');
    return !!(a && a.classList.contains('active') && typeof Framework7 !== 'undefined');
  }

  function start() {
    if (gestartet) return;
    var a = document.getElementById('app-screen');
    if (a && a.classList.contains('active')) showShell();
    if (!bereit()) return;
    gestartet = true;
    build();
  }

  function beobachten() {
    start();
    if (gestartet) return;

    var a = document.getElementById('app-screen');
    if (a) {
      // Feuert in dem Moment, in dem die Anmeldung durch ist.
      new MutationObserver(start).observe(a, { attributes: true, attributeFilter: ['class'] });
    } else {
      // Das Element steht noch nicht im Dokument, also auf den Rumpf hoeren.
      new MutationObserver(function () {
        if (document.getElementById('app-screen')) { beobachten(); }
      }).observe(document.documentElement, { childList: true, subtree: true });
      return;
    }

    // Framework7 kommt aus einer eigenen Datei. Liegt sie noch nicht vor,
    // meldet kein Ereignis ihr Eintreffen, also wird kurz nachgesehen.
    if (typeof Framework7 === 'undefined') {
      var versuche = 0;
      var warten = setInterval(function () {
        if (gestartet || ++versuche > 100) return clearInterval(warten);
        if (typeof Framework7 !== 'undefined') { clearInterval(warten); start(); }
      }, 30);
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', beobachten);
  else beobachten();
})();
