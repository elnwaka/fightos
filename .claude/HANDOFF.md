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

## Bedienung auf dem Handy — Framework7

Unter 768px laeuft **nicht** die Website in schmal, sondern eine eigene App-Schicht
auf **Framework7 9** (iOS-Theme, Dark). Der Desktop bleibt vollstaendig unberuehrt.

**Dateien**
- `vendor/framework7.min.{js,css}` — liegen bewusst **lokal** im Projekt, nicht auf
  einem CDN, sonst funktioniert die App offline nicht. 275 KB komprimiert, danach
  im Service-Worker-Vorrat.
- `js/f7app.js` — die gesamte Handy-Oberflaeche. Gekapselte IIFE, laeuft nur unter
  768px, laedt bei Viewport-Wechsel neu.
- `css/f7theme.css` — gibt Framework7 die Marke (Rot statt iOS-Blau) und enthaelt
  die eigenen Bausteine, die es nicht mitbringt: Kalender, Zeitstrahl, Balken,
  Uebungszeilen, Haken.

**Aufbau:** fuenf Reiter, jeder ein eigener View mit eigenem Navigationsstapel
(`#tab-heute`, `-plan`, `-wissen`, `-kaempfe`, `-profil`). Detailseiten werden per
Route aufgeschoben, mit Zurueckwischen vom linken Rand.

**Die Logik ist unveraendert.** `getData`, `weekPlan`, `completedBlocks`,
`toggleBlockDone`, `getExerciseById`, `generateCurrentWeekPlan` und der Coach werden
unveraendert weiterverwendet. `js/f7app.js` liest und schreibt nichts selbst, ausser
`setSched()` fuer die Profilwerte. Es gibt keinen zweiten Datenpfad.

### Fallen, die hier schon zugeschnappt sind

1. **`.page` gehoert beiden.** `css/style.css` besitzt die Klasse `.page` und setzt
   sie auf `display:none`. Framework7 nutzt exakt denselben Klassennamen — dadurch
   blieb anfangs jede Seite unsichtbar. Innerhalb von `#f7app` gehoert `.page`
   Framework7; der Block "ALTBESTAND ENTWAFFNEN" in `css/f7theme.css` sichert das.
   **Bei neuen Regeln in style.css auf Klassennamen achten, die Framework7 belegt**
   (`.page`, `.left`, `.right`, `.link`, `.icon`, `.block`, `.list`, `.item-*`).
2. **`view-main` allein startet nicht.** Framework7 initialisiert nur `.view-init`
   automatisch. Der erste Reiter braucht **beide** Klassen.
3. **Keine Icon-Schrift.** Framework7 Icons waeren 200 KB fuer fuenf Zeichen. Die
   Symbole stehen als SVG in `IC`/`svg()` in `js/f7app.js`. Also **nie**
   `<i class="icon f7-...">` schreiben, das rendert 0 Pixel breit.
4. **Eingebetteter Altbestand wird eingerahmt, nicht uebernommen.** Legacy-HTML
   landet in `<div class="legacy">`. Dort gilt: `.card-body` nicht zuklappen
   (`max-height:160px` + "Mehr anzeigen" versteckte den Inhalt — das war die
   Ursache dafuer, dass im Wissen-Bereich nichts zu lesen war), Zeilenabstand 1,55,
   `.card-title` als 13px-Abschnittsmarke.
5. **Das Auswahlrad haengt im DOM unter `#f7app`, die Regeln greifen also.** Eine
   einzelne Spalte ist zugleich `picker-column-first` und `-last`, was Framework7
   rechtsbuendig ausrichtet; bei einer Spalte gehoert der Wert zentriert.
6. **Der Coach-Bereich liegt im alten Stylesheet auf z-index 600**, die App auf 900.
   `body.f7-on #ai-coach-panel` hebt ihn auf 12000, unter die Framework7-Modale (13000).
7. **Nichts behaupten, was die Daten nicht hergeben.** Der Kalender faerbte anfangs
   alle vergangenen Tage gruen. `completedBlocks` ist nach Wochen-ID geschluesselt,
   fuer vergangene Wochen liegt nichts vor — gruen gibt es nur fuer die laufende Woche.

**Beim Aendern pruefen:** Playwright bei 390px gegen die Live-URL. Der Durchlauf
prueft je Bildschirm Titel, Zeichenzahl, Zeilenzahl und Antippflaechen; zusaetzlich
Abhaken, Kalenderlogik, Zurueckwischen (braucht **echte** Touch-Events per CDP,
synthetische `TouchEvent` reichen Framework7 nicht) und das Auswahlrad.

**Grundsaetze, die bleiben:** nichts unter 11px, alles Bedienbare mindestens 44x44,
kein schwebender Knopf ueber dem Inhalt (der Coach sitzt als Symbol in der Kopfleiste),
der Startbildschirm beantwortet "Was trainiere ich heute?".

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
