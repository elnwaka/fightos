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
