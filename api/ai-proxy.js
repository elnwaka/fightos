// Vercel Serverless Function: AI Coach Proxy
// ------------------------------------------------------------------
//  - Hält den Gemini-Key serverseitig
//  - Nur eingeloggte BoxSpec-User (Firebase ID-Token) dürfen rein
//  - Nur Requests von der eigenen Domain
//  - Rate-Limit pro User
//  - Modell-Auswahl selbstheilend: fragt Gemini, welche Modelle es gibt
//  - GET /api/ai-proxy  =  Health-Check (verrät den Key NICHT)
// ------------------------------------------------------------------

const FIREBASE_PROJECT = 'fightos-85652';
const FIREBASE_WEB_KEY = 'AIzaSyCDMAQUlUNNT9NdTu3_X2WDYyGr67UJoiw'; // öffentlicher Web-Key, kein Secret

const ALLOWED_ORIGINS = [
  'https://boxspec.app',
  'https://www.boxspec.app',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5500'
];

// Reihenfolge = Wunsch-Reihenfolge. Erstes verfuegbares Modell gewinnt.
// Stand 2026-09-07 gegen die Model-Liste des Projekts geprueft.
const MODEL_PREFERENCE = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash'
];

const MAX_REQUESTS_PER_WINDOW = 20;
const WINDOW_MS = 60 * 1000;
const MAX_BODY_CHARS = 60000;

// Warm-Instanz-State (best effort — Serverless-Instanzen sind kurzlebig)
const _rate = new Map();
let _modelCache = { name: null, at: 0 };
let _healthCache = { body: null, at: 0 };
let _tokenCache = new Map();

// ---------- Helfer ----------

function pickOrigin(req) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

function setCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', pickOrigin(req));
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // z.B. curl / Health-Check
  return ALLOWED_ORIGINS.includes(origin);
}

// Firebase ID-Token gegen Google prüfen (ohne npm-Abhängigkeit)
async function verifyIdToken(token) {
  if (!token) return null;

  const cached = _tokenCache.get(token);
  if (cached && cached.exp > Date.now()) return cached.uid;

  const r = await fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_WEB_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token })
    }
  );
  if (!r.ok) return null;

  const data = await r.json();
  const user = data.users && data.users[0];
  if (!user || !user.localId) return null;

  // 5 Minuten cachen, damit nicht jeder Chat-Turn einen Extra-Roundtrip kostet
  if (_tokenCache.size > 500) _tokenCache.clear();
  _tokenCache.set(token, { uid: user.localId, exp: Date.now() + 5 * 60 * 1000 });
  return user.localId;
}

function rateLimited(uid) {
  const now = Date.now();
  const entry = _rate.get(uid);
  if (!entry || now - entry.start > WINDOW_MS) {
    _rate.set(uid, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  if (_rate.size > 1000) _rate.clear();
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

// Liefert die Modelle in Reihenfolge, die wir probieren.
// Achtung: ListModels listet auch Modelle, die generateContent mit 404 ablehnen
// ("no longer available to new users") — deshalb ist die Liste nur eine Vorauswahl,
// die echte Entscheidung faellt beim ersten erfolgreichen Aufruf.
async function modelCandidates(apiKey, requested) {
  const winner = (_modelCache.name && Date.now() - _modelCache.at < 6 * 60 * 60 * 1000)
    ? _modelCache.name : null;

  let list = MODEL_PREFERENCE.slice();

  try {
    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey + '&pageSize=200'
    );
    if (r.ok) {
      const data = await r.json();
      const available = (data.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => String(m.name || '').replace('models/', ''));

      const known = list.filter(n => available.includes(n));
      // Unbekannte neuere Flash-Modelle hinten anhaengen, damit die App
      // auch ohne Code-Aenderung von neuen Generationen profitiert.
      const extra = available
        .filter(n => /^gemini-[0-9.]+-flash$/.test(n) && !known.includes(n))
        .sort().reverse();
      if (known.length || extra.length) list = known.concat(extra);
    }
  } catch (e) { /* Standardliste benutzen */ }

  // Zuletzt erfolgreiches Modell zuerst, dann der Rest als Fallback
  const head = [];
  if (requested && list.includes(requested)) head.push(requested);
  if (winner && !head.includes(winner)) head.push(winner);
  return head.concat(list.filter(n => !head.includes(n)));
}

// Fuer den Health-Check: welches Modell wuerde gerade genommen?
async function resolveModel(apiKey, requested) {
  const c = await modelCandidates(apiKey, requested);
  return c[0] || MODEL_PREFERENCE[0];
}

function _cacheHealth(body) {
  _healthCache = { body: body, at: Date.now() };
  return body;
}

function mapGeminiError(status, message) {
  const m = String(message || '');
  if (/API key not valid|API_KEY_INVALID/i.test(m)) {
    return { status: 503, code: 'KEY_INVALID',
      error: 'Der AI Coach ist gerade nicht erreichbar (Server-Konfiguration). Wir sind dran.' };
  }
  // Kein Guthaben / Abrechnung — das geht durch Warten NICHT weg
  if (/prepayment credits|billing|depleted|BILLING_DISABLED/i.test(m)) {
    return { status: 503, code: 'BILLING',
      error: 'Der AI Coach ist vorübergehend abgeschaltet. Wir sind dran.' };
  }
  if (/quota|RESOURCE_EXHAUSTED/i.test(m) || status === 429) {
    return { status: 429, code: 'QUOTA',
      error: 'Der Coach ist gerade ausgelastet — versuch es in einer Minute nochmal.' };
  }
  if (status === 503) {
    return { status: 503, code: 'UPSTREAM_BUSY',
      error: 'Der Coach ist gerade überlastet — versuch es in ein paar Sekunden nochmal.' };
  }
  if (/SAFETY|blocked/i.test(m)) {
    return { status: 400, code: 'BLOCKED',
      error: 'Diese Frage konnte der Coach nicht beantworten. Formulier sie anders.' };
  }
  return { status: status || 500, code: 'UPSTREAM', error: 'Der Coach hatte einen Fehler: ' + m.slice(0, 200) };
}

// ---------- Handler ----------

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();

  const API_KEY = process.env.GEMINI_API_KEY;

  // --- Health-Check: sagt ob der Key da UND gültig ist, ohne ihn zu zeigen ---
  if (req.method === 'GET') {
    if (!API_KEY) {
      return res.status(200).json({
        ok: false, keyConfigured: false, keyValid: false,
        hint: 'GEMINI_API_KEY fehlt in den Vercel Environment Variables.'
      });
    }
    // Der Check kostet einen echten (winzigen) Gemini-Call — 60s cachen,
    // damit der offene GET-Endpunkt kein Quota-Loch wird.
    if (_healthCache.body && Date.now() - _healthCache.at < 60 * 1000) {
      return res.status(200).json(Object.assign({ cached: true }, _healthCache.body));
    }

    try {
      // 1) Ist der Key ueberhaupt gueltig?
      const list = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY + '&pageSize=1'
      );
      const listBody = await list.json().catch(() => ({}));
      const keyValid = list.ok;

      if (!keyValid) {
        return res.status(200).json(_cacheHealth({
          ok: false,
          keyConfigured: true,
          keyValid: false,
          canGenerate: false,
          keyFingerprint: API_KEY.slice(0, 6) + '…' + API_KEY.slice(-4),
          upstreamStatus: list.status,
          hint: 'Key wird von Google abgelehnt: ' +
            ((listBody.error && listBody.error.message) || list.status) +
            ' → neuen Key auf aistudio.google.com/apikey erzeugen und in Vercel setzen.'
        }));
      }

      // 2) Der eigentliche Test: darf der Key auch generieren?
      //    Ein gueltiger Key ohne Guthaben besteht Schritt 1, faellt hier aber durch.
      const model = await resolveModel(API_KEY, null);
      const gen = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
            generationConfig: { maxOutputTokens: 8, temperature: 0 }
          })
        }
      );
      const genBody = await gen.json().catch(() => ({}));
      const genMsg = (genBody.error && genBody.error.message) || '';

      return res.status(200).json(_cacheHealth({
        ok: gen.ok,
        keyConfigured: true,
        keyValid: true,
        canGenerate: gen.ok,
        keyFingerprint: API_KEY.slice(0, 6) + '…' + API_KEY.slice(-4),
        model: model,
        upstreamStatus: gen.status,
        hint: gen.ok
          ? 'Alles gut — Coach laeuft auf ' + model + '.'
          : (/prepayment credits|billing|depleted/i.test(genMsg)
              ? 'Key ist gueltig, aber das Google-Konto hat kein Guthaben mehr. ' +
                'Abrechnung unter ai.studio/projects pruefen. Warten hilft hier nicht.'
              : 'Generierung schlaegt fehl: ' + (genMsg || gen.status))
      }));
    } catch (e) {
      return res.status(200).json({ ok: false, keyConfigured: true, keyValid: false, canGenerate: false, hint: e.message });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD' });
  }

  if (!originAllowed(req)) {
    return res.status(403).json({ error: 'Origin nicht erlaubt', code: 'ORIGIN' });
  }

  if (!API_KEY) {
    return res.status(503).json({
      error: 'Der AI Coach ist gerade nicht verfügbar (kein Server-Key konfiguriert).',
      code: 'KEY_MISSING'
    });
  }

  // --- Auth: nur eingeloggte BoxSpec-User ---
  const auth = req.headers.authorization || '';
  const idToken = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  let uid;
  try {
    uid = await verifyIdToken(idToken);
  } catch (e) {
    uid = null;
  }
  if (!uid) {
    return res.status(401).json({ error: 'Bitte neu einloggen — deine Sitzung ist abgelaufen.', code: 'AUTH' });
  }

  if (rateLimited(uid)) {
    return res.status(429).json({
      error: 'Zu viele Fragen auf einmal. Warte eine Minute.', code: 'RATE_LIMIT'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!Array.isArray(body.contents) || body.contents.length === 0) {
      return res.status(400).json({ error: 'Keine Nachricht übermittelt.', code: 'BAD_REQUEST' });
    }
    if (JSON.stringify(body.contents).length > MAX_BODY_CHARS) {
      return res.status(413).json({ error: 'Nachricht zu lang.', code: 'TOO_LARGE' });
    }

    const candidates = await modelCandidates(API_KEY, body.model);

    const payload = JSON.stringify({
      contents: body.contents,
      systemInstruction: body.systemInstruction,
      generationConfig: body.generationConfig || {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.9
      }
    });

    let lastStatus = 503;
    let lastMsg = '';

    // Modell fuer Modell durchprobieren. Ein 503 ("high demand") oder ein
    // 404 ("no longer available") bei einem Modell darf den Coach nicht kippen.
    for (let i = 0; i < Math.min(candidates.length, 4); i++) {
      const model = candidates[i];
      const endpoint =
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';

      // Pro Modell einmal wiederholen — kurze Spitzen fangen wir so ab.
      for (let attempt = 0; attempt < 2; attempt++) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
          body: payload
        });

        const data = await response.json().catch(() => ({}));
        const upstreamMsg = (data.error && data.error.message) || '';

        if (response.ok) {
          _modelCache = { name: model, at: Date.now() };
          res.setHeader('X-BoxSpec-Model', model);
          return res.status(200).json(data);
        }

        lastStatus = response.status;
        lastMsg = upstreamMsg;

        // Kein Guthaben oder kaputter Key: bringt bei keinem Modell etwas
        if (/prepayment credits|billing|depleted|API key not valid|API_KEY_INVALID/i.test(upstreamMsg)) {
          const mapped = mapGeminiError(response.status, upstreamMsg);
          return res.status(mapped.status).json({ error: mapped.error, code: mapped.code });
        }

        // Modell existiert (fuer diesen Key) nicht → direkt das naechste
        if (response.status === 404) break;

        // Ueberlastet → einmal kurz warten, dann naechstes Modell
        if (response.status === 503 || response.status === 429) {
          if (attempt === 0) { await new Promise(r => setTimeout(r, 600)); continue; }
          break;
        }

        // Alles andere (400er, Safety, …) ist modellunabhaengig
        const mapped = mapGeminiError(response.status, upstreamMsg);
        return res.status(mapped.status).json({ error: mapped.error, code: mapped.code });
      }
    }

    const mapped = mapGeminiError(lastStatus, lastMsg || 'upstream busy');
    return res.status(mapped.status).json({ error: mapped.error, code: mapped.code });

  } catch (err) {
    return res.status(500).json({ error: 'Unerwarteter Serverfehler.', code: 'SERVER', detail: String(err.message).slice(0, 200) });
  }
};
