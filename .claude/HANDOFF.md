# BoxSpec — Handoff für neue Claude Sessions

> Stand: 2026-09-07. Diese Datei ist die Wahrheit — wenn Code und Doku sich widersprechen, gewinnt der Code, dann bitte hier korrigieren.

## Was ist BoxSpec?
Eine Web-App (PWA) für Boxer. Trainingsplan, Ernährung, AI Coach, Video-Bibliothek, Community, 8-Säulen Wissenssystem. Läuft auf boxspec.app.

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (kein Framework, kein Build-Step)
- **Auth + DB:** Firebase Auth + Firestore + Storage (Projekt-ID `fightos-85652`)
- **AI Coach:** Google Gemini via Serverless-Proxy `api/ai-proxy.js`
- **Hosting: VERCEL** (nicht Netlify — die Netlify-Reste wurden am 2026-09-07 entfernt)
- **Domain:** boxspec.app bei Strato, DNS auf Vercel
- **SEO:** Google Search Console verifiziert, Sitemap mit 5 URLs, 3 SEO-Artikel-Seiten

## Dateien — Übersicht
```
index.html            → Landing Page (SEO, boxspec.app/)
app.html              → Die eigentliche App (Login/Register/Dashboard)
css/style.css         → 4500+ Zeilen CSS, Glasmorphism "Fight Command" Design
js/util.js            → esc/escAttr/escMultiline/initial/safeUrl/escJs — MUSS als erstes geladen werden
js/app.js             → Hauptlogik (Dashboard, Plan, Auth, Account, Tests, Fights)
js/pages.js           → 8 Säulen, Übungsdatenbank, Ernährung, Periodisierung
js/community.js       → Feed, Forum, Ranking, öffentliche Profile
js/program10w.js      → 10-Wochen Trainingsprogramm
js/ai-coach.js        → AI Coach (System-Prompt, Chat-UI, ACTION-Buttons)
js/video-library.js   → 60+ kuratierte Videos in 8 Kategorien
js/calculators.js     → Makro-Rechner, HF-Zonen etc.
api/ai-proxy.js       → Vercel Function: Gemini-Proxy mit Auth + Rate-Limit + Health-Check
firestore.rules       → Firestore Security Rules  (firebase deploy --only firestore:rules)
storage.rules         → Storage Security Rules    (firebase deploy --only storage)
firebase.json         → verweist auf die beiden Rules-Dateien
vercel.json           → Security- und Cache-Header
sw.js                 → Service Worker (Offline-Cache)
img/exercises/db/     → Übungsfotos, lokal gehostet (Quelle: free-exercise-db, Public Domain)
```

## SICHERHEIT — nicht kaputt machen

**1. Alles was von Usern kommt, wird beim Rendern escaped.**
`js/util.js` stellt `esc()`, `escMultiline()`, `escAttr()`, `initial()`, `safeUrl()`, `escJs()` bereit.
Regel: **kein User-Wert darf ohne eine dieser Funktionen in einen `innerHTML`-String.**
- Text zwischen Tags → `esc()` bzw. `escMultiline()` bei mehrzeiligem Text
- Attribut-Werte → `escAttr()`
- URLs (`src`, `href`) → `safeUrl()` (lässt nur http/https durch)
- Werte in `onclick="fn('…')"` → `escJs()`

**2. Der AI-Proxy ist kein offenes Relay.**
`api/ai-proxy.js` verlangt ein gültiges Firebase-ID-Token im `Authorization: Bearer`-Header,
prüft den Origin gegen eine Allowlist und limitiert auf 20 Anfragen/Minute pro User.
Kein Auth-Header = 401. Diese Prüfungen nicht entfernen — sonst zahlt Armann fremde Gemini-Rechnungen.

**3. Private Daten und öffentliches Profil sind getrennt.**
- `users/{uid}` = Trainingslog, Kämpfe, HRV, Einstellungen → **nur der Besitzer**
- `public_profiles/{uid}` = Anzeigename, Gym, Bio, Rekord → für eingeloggte User lesbar

Nie wieder Profildaten in `users/{uid}` legen, sonst sind alle Trainingsdaten öffentlich.

## AI Coach — wie er funktioniert und wie man ihn debuggt

Client (`js/ai-coach.js`) → `POST /api/ai-proxy` mit Firebase-Token → Vercel Function → Gemini.
Der Key liegt **nur** in der Vercel-Env-Variable `GEMINI_API_KEY`, nie im Code.

**Wenn der Coach nicht antwortet — erste Anlaufstelle:**
```
curl https://boxspec.app/api/ai-proxy
```
Der Health-Check (GET) sagt direkt, ob der Key konfiguriert und bei Google gültig ist,
zeigt das aktuell benutzte Modell und einen Fingerprint des Keys (nie den Key selbst).
In der Browser-Konsole geht auch `boxspecCoachStatus()`.

**Modellwahl ist selbstheilend:** Der Proxy fragt Gemini, welche Modelle es gibt, und nimmt
das erste aus `MODEL_PREFERENCE`. Fehlt das ganze Wunschliste, nimmt er das neueste Flash-Modell.
Neues Modell einführen = `MODEL_PREFERENCE` in `api/ai-proxy.js` oben ergänzen, sonst nichts.

**Neuer Key:** aistudio.google.com/apikey → Vercel → Projekt → Settings → Environment Variables →
`GEMINI_API_KEY` → **danach neu deployen**, Env-Änderungen greifen nicht rückwirkend.

## Bekannte Probleme / technische Schulden
- `js/app.js` ist 8000+ Zeilen — sollte in Module aufgeteilt werden
- Viele Inline-Styles in `app.js` und `pages.js` — sollten CSS-Klassen werden
- 17 Übungen haben kein eigenes Foto (`exerciseImageMap`-Einträge mit `null`) → Placeholder
- `www.boxspec.app` löst nicht auf — nur die Apex-Domain. DNS bei Strato prüfen.
- Rate-Limit im Proxy ist In-Memory, überlebt keinen Instanz-Neustart. Für echten Schutz KV/Upstash.
- Community hat keine Melde-/Moderationsfunktion
- Chat-History des Coaches liegt in localStorage, nicht in der Cloud

## Wichtige Konventionen
- App heißt BoxSpec (nicht mehr FightOS). Repo heißt noch `fightos`, Firebase-Projekt auch.
- Login ohne `@` wird intern zu `name@fightos.app`. Mit `@` ist es eine echte E-Mail — nur damit
  funktioniert `doPasswordReset()`. Neue User werden im UI Richtung E-Mail geschubst.
- Alle Texte auf Deutsch
- TLAC/Boxing Science wird nirgendwo namentlich erwähnt — alles ist "BoxSpec-Wissen"
- AI Coach: spricht Deutsch, direkt wie ein Trainer, max 300 Wörter pro Antwort
- Nur Chart.js. ApexCharts wurde entfernt (wurde nie benutzt, 214 KB).
- **Bei jedem Deploy `BUILD` in `sw.js` hochzählen**, sonst bekommen User den alten Cache.

## Was als nächstes kommt
1. `GEMINI_API_KEY` auf Vercel erneuern → Coach läuft wieder
2. Rules deployen: `firebase deploy --only firestore:rules,storage`
3. App selbst benutzen + Boxer im Verein testen lassen
4. Social Media (Instagram/TikTok @boxspec)
5. Moderation für die Community (Melden, Blockieren)
6. Bei 50+ aktiven Nutzern: Abo-Modell planen (Free vs Pro)
