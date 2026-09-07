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

## Bedienung auf dem Handy — die Regeln, die hier gelten

Gemessen wird bei 390px Breite mit Playwright (`screenshots.mjs` als Vorlage).
Massstab sind Apple HIG (44x44pt), Material Design (48dp, 8dp Abstand) und die
NN/g-Daumenzonenforschung.

1. **Nichts unter 11px.** Versal-Labels 11px, Fliesstext 14px+. Der Boden steht
   am Ende von `css/style.css` im Block "MOBILE LESBARKEITS- UND TREFFERBODEN".
2. **Alles Bedienbare mindestens 44x44.** Vorher lagen 19 von 29 Zielen auf der
   Startseite darunter.
3. **Fliesstext ist kein Etikett.** Beschreibungen in DM Sans, gemischte
   Schreibweise, Zeilenlaenge auf 58 Zeichen. Space Mono in Versalien mit
   Sperrsatz bleibt echten Mikro-Labels vorbehalten — nicht fuer Saetze.
4. **Kein schwebender Knopf ueber dem Inhalt.** Mit einer Tab-Leiste unten
   konkurriert ein FAB mit der Navigation und verdeckt Inhalt. Der AI-Coach
   sitzt deshalb als Icon in der Kopfzeile (`#ai-coach-btn`).
5. **Lange Nachschlage-Seiten werden gefaltet, nicht gekuerzt.**
   `applyCollapsibleSections()` in `js/util.js`, zentral aus `showPage()`
   gerufen. Der Inhalt bleibt im DOM, damit die Suche ihn findet.
6. **Der Startbildschirm beantwortet: Was trainiere ich heute?**
   `renderHeuteCard()` in `js/app.js` steht als erstes Element im Dashboard und
   nutzt dieselbe Mechanik wie der Wochenplan (`weekPlan`, `completedBlocks`,
   `toggleBlockDone`, `openBlockDetail`) — kein zweiter Datenpfad.

Ergebnis der Umbauten (jeweils vorher -> nachher, bei 390px):
- Ernaehrung 12,8 -> 3,0 Bildschirme, 18.926 -> 2.520 Zeichen
- Uebungen 20,6 -> 8,2 Bildschirme
- Antippflaechen unter 44x44: Home 19 -> 10, Wochenplan 13 -> 3, Training 23 -> 6
- Kleinste Schrift 7px -> 11px

**Beim Aendern pruefen:** `node screenshots.mjs` gegen die Live-URL laufen lassen
und die Aufnahmen ansehen. Der Klassiker, den das aufdeckt: etwas rendert in
einen anderen Container als erwartet (die Uebungen schreiben nach
`#training-content`, nicht `#page-uebungen`).

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
