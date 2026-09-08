/* ============================================================
   BOXSPEC · INHALT ALS DATEN
   ------------------------------------------------------------
   Die Textseiten lagen bisher als HTML-Bloecke in js/pages.js:
   Fliesstext, Inline-Styles und Berechnetes in einem einzigen
   Template-Literal. Damit gab es genau eine Darstellung, und die
   Handy-Oberflaeche kam nur an den Inhalt, indem sie die fertige
   Desktop-Seite in ein unsichtbares Div rendert und deren HTML
   wieder herausschneidet.

   Hier steht derselbe Inhalt als Daten. Eine Quelle, zwei
   Darstellungen: der Desktop baut daraus sein Markup, die
   Handy-Oberflaeche native Bausteine. Niemand schabt mehr.

   Je Artikel eine Datei unter js/content/, bei Bedarf geladen.
   Eine einzige grosse Datei waere nur ein neuer Klotz an einer
   anderen Stelle.

   ------------------------------------------------------------
   BAUSTEINE

   { t:'p',     text }
   { t:'h',     text }                       Zwischenueberschrift
   { t:'list',  items:[], ordered:true? }
   { t:'table', head:[], rows:[[]] }
   { t:'note',  tone:'info'|'warn'|'sci', title?, text }
   { t:'stat',  label, value, pct? }         mit pct ein Balken, ohne eine Zeile
   { t:'img',   src, alt, caption? }
   { t:'link',  href, label }
   { t:'card',  title, accent?, blocks:[] }  gruppiert, schachtelbar
   { t:'dyn',   id, ... }                    Berechnetes, siehe unten

   Jeder Baustein und jeder Abschnitt darf ein id tragen. Wo eines
   steht, ist es fest: geteilte Links auf ein Kapitel sollen eine
   Inhaltsaenderung ueberleben. Einmal vergeben, nie wieder aendern,
   auch nicht beim Umsortieren.

   Keine Spalten, keine Raster, keine Akkordeons. Die Struktur macht
   die Kapitelebene, nicht der Inhalt.

   ------------------------------------------------------------
   AUSZEICHNUNG IM TEXT

   Erlaubt sind genau vier Auszeichnungen, alles andere wird
   escaped: strong, em, br und a mit https-Ziel.

   Das Verfahren ist bewusst herum: erst wird der ganze Text
   escaped, danach werden nur diese vier wieder freigegeben. Was
   nicht auf der Liste steht, kann also gar nicht durchrutschen,
   egal was in den Daten steht.

   PERSONALISIERTE WERTE

   Manche Saetze tragen Zahlen, die vom Nutzer abhaengen: "Bei 78 kg
   sind das 172 g Protein". Der Satz gehoert trotzdem in die Daten,
   sonst wandert er zurueck in den Renderer.

   Dafuer gibt es Platzhalter in geschweiften Klammern und eine
   Deklaration am Artikel:

     vars: { kg:  { from:'weight' },
             p22: { from:'weight', mul:2.2 },
             ego: { from:'alterEgo', fallback:'dein Alter Ego' } }
     text: 'Bei {kg} kg sind das {p22} g Protein pro Tag.'

   Mit mul oder div wird gerechnet, ohne wird durchgereicht. So kommt
   auch ein selbst eingegebener Name ueber denselben Weg in den Text.

   Content.values(key, { weight: 78 }) rechnet die Werte aus,
   Content.inline(text, werte) setzt sie ein. Gerechnet wird in beiden
   Darstellungen mit derselben Formel, und in den Daten steht keine
   einzige Zeile Code. Unbekannte Namen bleiben unveraendert stehen,
   damit eine Tippfehler-Klammer auffaellt statt zu verschwinden.

   Kein tt() und keine Tooltips. Auf dem Handy gibt es kein
   Ueberfahren, ein title-Attribut ist dort unerreichbar. Eine
   Erklaerung gehoert entweder in Klammern in den Satz oder als
   eigener Block mit t:'note'.

   ------------------------------------------------------------
   BERECHNETES

   Alles was von Nutzerdaten abhaengt bleibt Code und steht nur als
   benannter Platzhalter im Datenstrom: { t:'dyn', id:'timeline10w' }.
   Jede Darstellung registriert dafuer ihre eigene Funktion ueber
   Content.dyn(id, fn). Fehlt eine, wird der Platzhalter ausgelassen
   statt einen Fehler zu werfen.

   Wichtig: der Platzhalter traegt seinen eigenen Inhalt mit. Nur die
   Auswahl und die Berechnung bleiben im Code, die Woerter nicht.
   Sonst wandert Text unbemerkt zurueck in die Renderer, genau dorthin
   wo er vorher lag, und keine Pruefung sieht ihn mehr.
   ============================================================ */

(function (w) {
  'use strict';

  var CONTENT = {};
  var DYN = {};

  function esc0(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  var E = function (s) { return (typeof esc === 'function') ? esc(s) : esc0(s); };

  /* ---------- Auszeichnung ----------
     Erst alles escapen, dann genau vier Dinge wieder freigeben.
     Andersherum, also erlaubte Tags stehen lassen und den Rest
     saeubern, muesste man jede Umgehung einzeln kennen. So muss man
     nur wissen, was erlaubt ist. */

  var OK_OPEN  = /&lt;(strong|em)&gt;/g;
  var OK_CLOSE = /&lt;\/(strong|em)&gt;/g;
  var OK_BR    = /&lt;br\s*\/?&gt;/g;
  var OK_A     = /&lt;a href=&quot;(https:\/\/[^&"<>\s]+)&quot;&gt;/g;
  var OK_AE    = /&lt;\/a&gt;/g;

  function inline(text, vars) {
    var open = { strong: 0, em: 0, a: 0 };
    var s = E(text)
      .replace(OK_BR, '<br>')
      .replace(OK_OPEN, function (m, tag) { open[tag]++; return '<' + tag + '>'; })
      .replace(OK_A, function (m, href) {
        open.a++;
        return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">';
      });
    // Ein schliessendes Tag wird nur freigegeben, wenn ein passendes
    // oeffnendes durchgekommen ist. Sonst laesst ein abgelehntes
    // <a href="javascript:..."> oder ein <strong onclick="..."> sein
    // Schluss-Tag stehen, und das schliesst im schlimmsten Fall ein
    // fremdes Element weiter aussen.
    var close = function (tag) {
      return function (m) {
        if (open[tag] > 0) { open[tag]--; return '</' + tag + '>'; }
        return m;
      };
    };
    s = s
      .replace(OK_CLOSE, function (m, tag) { return close(tag)(m); })
      .replace(OK_AE, close('a'));
    if (!vars) return s;
    // Werte werden nach dem Escapen eingesetzt und selbst escaped.
    // Nur bekannte Namen: eine Klammer mit Tippfehler bleibt sichtbar
    // stehen, statt still zu verschwinden.
    return s.replace(/\{([a-zA-Z][\w]*)\}/g, function (m, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? E(vars[name]) : m;
    });
  }

  /* Reiner Text ohne jede Auszeichnung. Braucht die Suche und jede
     Darstellung, die nur eine Zeile unterbringt. */
  /* Reiner Text ohne jede Auszeichnung. Braucht die Suche und jede
     Darstellung, die nur eine Zeile unterbringt.

     Entfernt werden nur die vier erlaubten Auszeichnungen, nicht alles
     was zwischen < und > steht. Der Unterschied ist kein Feinschliff:
     in "<10g Ballaststoffe/Tag. … <strong>~1%" haelt eine
     Sammelregel das <10g fuer den Anfang eines Tags und frisst alles
     bis zur naechsten spitzen Klammer, hier 78 Zeichen mitten im Satz.
     Angezeigt wird trotzdem alles richtig, nur der Text-Index verliert
     es, und damit die Suche und jede Pruefung, die darauf baut.

     <br> wird zum Leerzeichen, die anderen drei verschwinden spurlos:
     sonst steht im Index "Training ." und im Bild "Training.". */
  function plain(text) {
    return String(text == null ? '' : text)
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/?(?:strong|em)>/gi, '')
      .replace(/<a href="[^"]*">|<\/a>/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ---------- Zugriff ---------- */

  function get(key) { return CONTENT[key] || null; }
  function has(key) { return !!CONTENT[key]; }

  function sections(key) {
    var c = CONTENT[key];
    return c && c.sections ? c.sections : [];
  }

  function section(key, id) {
    var list = sections(key);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* Alle Bloecke flach, inklusive geschachtelter in Karten. */
  function flatten(blocks, out) {
    out = out || [];
    (blocks || []).forEach(function (b) {
      out.push(b);
      if (b.blocks) flatten(b.blocks, out);
    });
    return out;
  }

  /* Reiner Text des ganzen Artikels. Braucht die Suche, und jede
     Pruefung, die wissen will ob beim Umbau Inhalt verloren ging.

     Bewusst generisch statt einer Liste von Feldnamen: neue Bausteine
     und neue Felder an Platzhaltern werden sonst stillschweigend nicht
     indexiert, und dann findet die Suche Inhalt nicht, der sichtbar auf
     dem Bildschirm steht. Uebersprungen wird nur, was nachweislich kein
     Text ist. */
  var NO_TEXT = { t: 1, id: 1, tone: 1, accent: 1, src: 1, href: 1,
                  fill: 1, pct: 1, ordered: 1, vars: 1, from: 1,
                  mul: 1, div: 1, round: 1, fallback: 1 };

  /* Die Grenze ist nur ein Schutz gegen Ringschluss, keine
     Strukturannahme. Bei 8 fielen Tabellenzeilen heraus: Artikel,
     sections, Abschnitt, blocks, Karte, blocks, Tabelle, rows, Zeile,
     Zelle sind zehn Ebenen. Der Index meldete die Kopfzeile und
     verschluckte den Inhalt, und die Pruefung sah trotzdem gruen aus,
     weil sie die Kopfzeile fand. */
  function collect(node, parts, depth) {
    if (node == null || depth > 24) return;
    if (typeof node === 'string') { parts.push(plain(node)); return; }
    if (typeof node === 'number') { parts.push(String(node)); return; }
    if (Array.isArray(node)) {
      node.forEach(function (n) { collect(n, parts, depth + 1); });
      return;
    }
    if (typeof node !== 'object') return;
    Object.keys(node).forEach(function (k) {
      if (NO_TEXT[k]) return;
      collect(node[k], parts, depth + 1);
    });
  }

  function text(key) {
    var c = CONTENT[key];
    if (!c) return '';
    var parts = [];
    collect(c, parts, 0);
    return parts.filter(Boolean).join('\n');
  }

  /* Holt die personalisierten Werte eines Artikels. base ist das, was
     ueber den Nutzer bekannt ist: Gewicht, Groesse, Alter, der selbst
     vergebene Alter-Ego-Name und so weiter.

     Steht mul oder div dabei, wird gerechnet und gerundet. Steht keins
     dabei, wird der Wert durchgereicht, auch wenn er keine Zahl ist.
     Damit heisst vars nicht "rechne aus dem Gewicht", sondern "hol dir
     was du brauchst, wahlweise mit Faktor". Welche Tatsache eine Seite
     braucht und wie sie sie nennt, entscheiden die Daten und nicht der
     Renderer. Sonst steht Inhaltswissen im Code, und genau das haben
     die Platzhalter abgeschafft.

     Fehlt der Wert, greift fallback, sonst ein Gedankenstrich. Nie
     "NaN" und nie "undefined", das liest sonst jemand im Text. */
  function values(key, base) {
    var c = CONTENT[key];
    var out = {};
    if (!c || !c.vars) return out;
    base = base || {};
    Object.keys(c.vars).forEach(function (name) {
      var spec = c.vars[name] || {};
      var raw = base[spec.from];
      var leer = raw == null || raw === '';
      var rechnen = spec.mul != null || spec.div != null;

      if (!rechnen) {
        out[name] = leer ? (spec.fallback || '–') : String(raw);
        return;
      }
      if (leer || isNaN(raw)) { out[name] = spec.fallback || '–'; return; }
      var v = Number(raw);
      if (spec.mul != null) v = v * spec.mul;
      if (spec.div != null) v = v / spec.div;
      out[name] = String(spec.round === false ? v : Math.round(v));
    });
    return out;
  }

  function dyn(id, fn) {
    if (typeof fn === 'function') { DYN[id] = fn; return; }
    return DYN[id];
  }

  /* ---------- Nachladen ----------
     Eine Datei je Artikel. Zweimal aufgerufen laedt einmal. */

  var loading = {};
  function load(key) {
    if (CONTENT[key]) return Promise.resolve(CONTENT[key]);
    if (loading[key]) return loading[key];
    loading[key] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'js/content/' + key + '.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    }).then(function () {
      return CONTENT[key] || null;
    }).catch(function (e) {
      loading[key] = null;
      throw e;
    });
    return loading[key];
  }

  w.Content = {
    all: CONTENT,
    define: function (key, obj) { CONTENT[key] = obj; return obj; },
    get: get, has: has, load: load,
    sections: sections, section: section,
    flatten: flatten, text: text,
    inline: inline, plain: plain,
    values: values, dyn: dyn
  };

})(window);
