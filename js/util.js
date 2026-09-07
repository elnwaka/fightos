/* ============================================
   BOXSPEC – Shared Utilities
   Escaping / URL-Härtung. Muss VOR allen
   anderen Skripten geladen werden.
   ============================================ */

// HTML-Text escapen (für Inhalt zwischen Tags)
function esc(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Attribut-Wert escapen (identisch zu esc, eigener Name für Lesbarkeit)
function escAttr(v) {
  return esc(v);
}

// Mehrzeiligen User-Text sicher als HTML ausgeben (escapen + Umbrüche)
function escMultiline(v) {
  return esc(v).replace(/\n/g, '<br>');
}

// Erstes Zeichen für Avatar-Initiale — escaped
function initial(v) {
  var s = (v === null || v === undefined) ? '' : String(v).trim();
  return s ? esc(s.charAt(0).toUpperCase()) : '?';
}

// Nur http(s)-URLs durchlassen (blockt javascript:, data:, vbscript:)
function safeUrl(v) {
  if (!v) return '';
  var s = String(v).trim();
  if (!/^https?:\/\//i.test(s)) return '';
  return esc(s);
}

// Für String-Literale in inline-Handlern: onclick="foo('<hier>')"
function escJs(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/</g, '\\u003c')
    .replace(/\r?\n/g, '');
}
/* ============================================
   BOXSPEC – Abschnitte einklappen
   Lange Nachschlage-Seiten (Ernaehrung: 18.926 Zeichen auf 12,8
   Bildschirmen, Uebungen: 20,7 Bildschirme) werden nicht gekuerzt,
   sondern gefaltet: sichtbar ist die Gliederung, offen ist, was
   der Nutzer aufmacht. Der Inhalt bleibt vollstaendig im DOM,
   damit die Seitensuche ihn weiter findet.
   ============================================ */

// Wandelt Ueberschriften samt folgender Geschwister in Klappabschnitte.
// selector: die Ueberschriften. openFirst: erster Abschnitt offen.
function makeCollapsible(rootEl, selector, openFirst) {
  if (!rootEl) return;
  var bareSelector = selector.replace(/^:scope\s*>\s*/, '');
  var heads = [].slice.call(rootEl.querySelectorAll(selector));
  if (heads.length < 2) return;

  heads.forEach(function(head, i) {
    if (head.dataset.acc === '1') return;
    head.dataset.acc = '1';

    // Geschwister bis zur naechsten Ueberschrift einsammeln
    var body = document.createElement('div');
    body.className = 'acc-body';
    var n = head.nextSibling;
    while (n) {
      var next = n.nextSibling;
      if (n.nodeType === 1 && n.matches && n.matches(bareSelector)) break;
      body.appendChild(n);
      n = next;
    }
    if (!body.childNodes.length) return;

    head.parentNode.insertBefore(body, head.nextSibling);

    head.classList.add('acc-head');
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');

    var mark = document.createElement('span');
    mark.className = 'acc-mark';
    mark.setAttribute('aria-hidden', 'true');
    head.appendChild(mark);

    var open = openFirst && i === 0;
    setOpen(head, body, open);

    function toggle() { setOpen(head, body, head.getAttribute('aria-expanded') !== 'true'); }
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  function setOpen(head, body, open) {
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.hidden = !open;
    head.classList.toggle('is-open', open);
  }
}

// Nach dem Rendern der langen Seiten anwenden.
// Container nicht raten: die Ueberschriften selbst sagen, wo sie stehen.
// (Die Uebungen rendern je nach Einstieg in #training-content, nicht in
// #page-uebungen — Raten hat vorher die falsche, leere Kiste erwischt.)
function applyCollapsibleSections() {
  foldByHeadings('[id^="ern-s"]');
  foldByHeadings('.cat-header');
}

function foldByHeadings(selector) {
  var heads = [].slice.call(document.querySelectorAll(selector));
  if (!heads.length) return;
  var parents = [];
  heads.forEach(function(h) {
    if (parents.indexOf(h.parentElement) === -1) parents.push(h.parentElement);
  });
  parents.forEach(function(parent) {
    makeCollapsible(parent, ':scope > ' + selector, true);
  });
}
