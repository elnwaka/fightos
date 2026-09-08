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
css/style.css         → 4500+ Zeilen CSS, Desktop. Besitzt .page — Kollision mit Framework7, siehe unten
vendor/framework7.*   → Framework7 9, lokal statt CDN (sonst kein Offline-Betrieb)
js/f7app.js           → Die komplette Handy-Oberflaeche (unter 768px). Nutzt die Logik unten, hat keine eigene
js/exercises.js       → Uebungsdatenbank + Bildpfade. Von beiden Oberflaechen geladen, MUSS vor pages.js stehen
js/content.js         → Vertrag der Inhaltsdaten: Blocktypen, Auszeichnung, Werte
js/content/*.js       → Die Inhalte, eine Datei je Artikel. Werden bei Bedarf geladen, nie beim Start
tools/                → Die sechs Pruefungen. Vor jedem Freischalten laufen lassen
css/f7theme.css       → Marke fuer Framework7 + eigene Bausteine (Kalender, Zeitstrahl, Haken)
css/f7native.css      → Regelwerk "fuehlt sich nativ an": safe-area, Scroll, Bewegung, Farbschema
js/native.js          → Adapter fuer Plattformfaehigkeiten. Capacitor haengt hier dran, sonst nirgends
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

### Das Regelwerk "fuehlt sich nativ an"

`css/f7native.css` und `js/native.js` setzen 43 gemessene Punkte um. Die Pruefung
liegt als Playwright-Durchlauf vor (`regelwerk.mjs`) und prueft Meta-Angaben,
gerechnete Stile, echtes Offline-Verhalten und die Warteschlange. **Bei jeder
Aenderung an der Handy-Oberflaeche erneut laufen lassen**, gegen die Live-URL.

**Layout:** `100dvh` statt `100vh` (vh springt, sobald Safari seine Leiste ein-
oder ausblendet). Der Rumpf scrollt nie: `position:fixed`, `overflow:hidden`,
`overscroll-behavior:none`. Gescrollt wird nur `.page-content`, dort mit
`overscroll-behavior-y:contain`. Eingabefelder stehen auf **16px**, darunter zoomt
iOS beim Fokussieren hinein und kommt nicht wieder heraus. `touch-action:
manipulation` auf allem Bedienbaren gegen die 300ms des Doppeltipp-Zooms.

**Reaktionszeit:** sichtbare Antwort in 90ms. Abhaken ist optimistisch, also erst
lokaler Stand und Bild, dann Netz. Beim Start zeigt die App ein Skelett-Geruest,
keinen Drehkreisel. Textseiten werden beim **touchstart** vorgeladen.

**Bewegung:** nur `transform` und `opacity`. Federkurve `--spring`, nie linear.
`prefers-reduced-motion` schaltet auch Framework7s eigene Animationen ab
(`animate:` beim App-Aufbau).

**Farbschema:** folgt `prefers-color-scheme`, kein Schalter. Die Farben stehen als
Variablen auf `#f7app.theme-auto`. **Wichtig: dort werden auch Framework7s eigene
`--f7-*`-Variablen umgeschaltet**, sonst bleiben Bausteine dunkel, die nicht
einzeln aufgezaehlt sind (die Leisten ziehen ihren Verlauf aus
`--f7-bars-bg-color` ueber ein Pseudoelement).

**Offline:** Banner statt Fehlerseite. Schreibvorgaenge wandern in
`Native.enqueue()` und werden abgearbeitet, sobald das Geraet online und im
Vordergrund ist. **Hintergrund-Sync gibt es auf iOS nicht**, darauf zu bauen hiesse
Daten zu verlieren.

### js/native.js: der Adapter

Jede Plattformfaehigkeit liegt dahinter, nie direkt im Anwendungscode. Liegt
`window.Capacitor` vor, wird der native Weg genommen, sonst der Web-Weg. **Damit
ist Capacitor ein Wechsel der Implementierung an einer Stelle und kein Umbau.**
Es gibt keine Server-Abhaengigkeit, alles laeuft im Browser.

`haptic` `share` `statusBar` `pushStatus` `pushAsk` `persistStorage` `onNetwork`
`online` `enqueue` `flush` `registerRunner` `queueLength` `installState`
`installPrompt` `reducedMotion`

### Was auf iOS nicht geht, und wie es hier geloest ist

| Grenze | Loesung im Code |
|---|---|
| Kein Installationsdialog in Safari | Eigene Anleitung ueber Teilen, nach dem dritten Start, einmal (`installHint()`) |
| Web Push erst nach Installation (ab 16.4) | `pushStatus()` meldet `braucht-installation` als eigenen Zustand statt still zu scheitern |
| Keine Vibration API | `<input type="checkbox" switch>`-Kniff (iOS 17.4+), sonst `navigator.vibrate`, nativ ueber Capacitor |
| Kein Background Sync | Schreibschlange, abgearbeitet bei Netz und im Vordergrund |
| Speicher wird nach 7 Tagen Nichtnutzung geraeumt | `navigator.storage.persist()` beim Start, plus der Installationshinweis |
| Kein Bluetooth, NFC, WebUSB | Nicht verwendet |
| Nur Safari-Engine, auch in Chrome auf iOS | Keine Chrome-eigenen APIs verwendet |


### vendor/framework7.min.css ist zusammengesetzt, nicht das Buendel

**Die haeufigste Falle in dieser Datei.** Framework7 liefert ein Buendel mit
jeder Komponente, die es kennt: 474 KB, davon gemessen 16,4 Prozent genutzt.
Im Repo steht stattdessen der Kern plus genau die Komponenten, die BoxSpec
aufruft (`picker`, `sheet`, `dialog`, `preloader`): 148 KB.

**Wer eine neue Framework7-Komponente benutzt, muss sie in `tools/f7css.sh`
ergaenzen und das Skript laufen lassen.** Betrifft `app.toast`, `app.popup`,
`app.notification`, Searchbar, Swiper, Range, Stepper, Smart Select, Panel,
Photo Browser. Sonst steht die Komponente unformatiert in der App, ohne
Fehlermeldung, und niemand sieht warum.

Ehrlich zur Wirkung: Das bringt **keine** messbare Startzeit. A/B mit je fuenf
Durchlaeufen bei 4x CPU-Drosselung ergab 6668 gegen 6764 ms, also Rauschen.
Der Gewinn liegt beim Erstbesuch (45 KB weniger komprimiert) und im Speicher.
Wer hier Zeit sucht, sucht an der falschen Stelle: die Dateien liegen nach
30 ms aus dem Vorrat bereit, das erste Bild kommt bei 270 ms. Dazwischen liegt
Parse- und Laufzeit von JavaScript, kein Netz.

### Kaempfe

Eintragen ist ein geschobener Bildschirm (`/kampf-neu/`), kein Fenster ueber
der App: ein Fenster braeuchte eine Ebene ueber allem und bricht das
Zurueckwischen. Die Auswahlfelder sind Framework7-Raeder ueber `F7.kampfWahl`.

**Ergebnisse werden als `S`, `N` und `U` gespeichert**, nicht als "sieg" und
"niederlage". Der gesamte Altbestand vergleicht so (`js/app.js` an rund
zwanzig Stellen). Ein Vergleich auf ausgeschriebene Woerter macht jede Bilanz
still falsch.

### Auswahlraeder immer ueber `openPicker()`

Nie `app.picker.create(...).open()` direkt. `openPicker()` loest drei Dinge,
die einzeln schon zugeschnappt sind:

1. **Das Oeffnen wartet, bis die ausloesende Geste durch ist.** Der Klick, der
   ein Rad aufruft, laeuft anschliessend weiter bis zum Dokument; Framework7
   wertet ihn dort als Klick ausserhalb des Sheets und schliesst es im selben
   Moment. Sichtbar blieb nur ein eckiger Streifen am unteren Rand.
2. **Haptik erst nach dem Oeffnen.** Framework7 meldet beim Aufbau der Spalten
   bereits `change`. Da hat noch niemand gedreht.
3. **Abraeumen nach dem Schliessen**, sonst sammeln sich Leichen im Dokument
   und die naechste Messung erwischt die alte.

Zusammen mit dem Haptik-Kniff war das der Fehler, bei dem sich das Rad beim
Antippen sofort wieder schloss: der versteckte `<input switch>` in
`js/native.js` erzeugt ein echtes Klick-Ereignis. **Es wird dort abgefangen,
diese Zeilen duerfen nicht fallen.**

Dazu die Geometrie: Framework7 setzt die Leiste absolut an den oberen Rand,
gibt den Spalten darunter aber keinen Ausgleich. Beide begannen an derselben
Koordinate. Steht explizit in `css/f7theme.css`.

### Kapitel aus der Struktur: nur noch das Sicherheitsnetz

**Dieser Abschnitt beschreibt den alten Weg.** Seit alle sechs Artikel als Daten
vorliegen, laeuft er nicht mehr im Normalbetrieb. Er greift nur, wenn eine
Inhaltsdatei nicht geladen werden kann, und dann rettet er die Seite, statt sie
leer zu lassen. Wer eine neue Seite anlegt, arbeitet mit Daten, nicht hiermit.

Ebenso `ensurePages()`: `pages.js` wird auf dem Handy nur noch in diesem
Ausfall geholt. Der Verein (`/alt/community/…`) laeuft ueber `community.js` und
loest `ensurePages()` bewusst nicht aus.

`findeUeberschriften()` sucht Elemente, die kurz, gross oder fett sind und
sich auf derselben Ebene wiederholen. Gewertet wird, wie viele Glieder einer
Reihe wirklich Inhalt tragen (mindestens 180 Zeichen), nicht wie flach die
Reihe liegt. **Nach Ebene zu werten hiesse, "8 Saeulen" drei Kapitel zu geben
statt acht**, weil darueber drei Obergruppen liegen.

Vorher stand je Seite eine Selektorenliste, und drei von vier Seiten trafen
damit nichts: die Ueberschriften heissen `.sc-card-title`, `.card-title` oder
tragen gar keine Klasse. Ergebnis heute: Ernaehrung 9, Periodisierung 4,
Regeneration 3, 8 Saeulen 8.

Bei Karten ist der Kasten der Rumpf, bei flachem Aufbau sind es die
Geschwister bis zur naechsten Ueberschrift.

### Uebungen: gegen den Gesamtbestand abgleichen

Die sieben benannten Gruppen decken 40 der 74 Uebungen ab, die restlichen 34
liegen in `exercisesProgram10W`. `exList()` haengt am Ende `allExercises` an
und filtert Doppelte, damit keine mehr durchfaellt, egal aus welcher Quelle
sie kommt.


**Beim Aendern pruefen:** Playwright bei 390px gegen die Live-URL. Der Durchlauf
prueft je Bildschirm Titel, Zeichenzahl, Zeilenzahl und Antippflaechen; zusaetzlich
Abhaken, Kalenderlogik, Zurueckwischen (braucht **echte** Touch-Events per CDP,
synthetische `TouchEvent` reichen Framework7 nicht) und das Auswahlrad.

**Grundsaetze, die bleiben:** nichts unter 11px, alles Bedienbare mindestens 44x44,
kein schwebender Knopf ueber dem Inhalt (der Coach sitzt als Symbol in der Kopfleiste),
der Startbildschirm beantwortet "Was trainiere ich heute?".

### Inhalte stehen in Daten, nicht in Renderfunktionen

**Das ist die wichtigste Aenderung an dieser Anwendung.** Frueher las die
Handy-Oberflaeche ihren Inhalt aus dem fertig gerenderten Desktop-DOM: sie rief
`renderTrainingPage()`, kopierte `#page-training` in einen unsichtbaren Kasten
und zerlegte das Ergebnis. Das hiess, dass `pages.js` (313 KB) und `style.css`
(209 KB) auf dem Handy geladen werden mussten, obwohl davon 6 Prozent genutzt
wurden, und dass jede Aenderung am Desktop-Markup die Handy-Ansicht brechen
konnte, ohne dass es jemand merkte.

Heute liest **kein einziger Bildschirm** mehr aus dem DOM.

**Wo was liegt**
- `js/content.js` ist der Vertrag: Blocktypen, Auszeichnung, Werte, Zugriff.
- `js/content/<seite>.js` sind die Inhalte, eine Datei je Artikel. Sie werden
  **bei Bedarf** geladen, nicht beim Start (`ensureContent()` in `js/f7app.js`).
- `js/exercises.js` ist die Uebungsdatenbank, herausgeloest aus `pages.js`.
- `js/pages.js` enthaelt nur noch Desktop-Renderfunktionen und wird auf dem
  Handy im Normalbetrieb **nicht mehr geladen**.

**Blocktypen** (`p h list table note stat img link card dyn`) stehen im Kopf von
`js/content.js`. Erweitert wird der Vertrag nur nach Absprache, weil zwei Seiten
ihn benutzen.

**Auszeichnung im Text:** erlaubt sind genau `<strong>`, `<em>`, `<br>` und
`<a href="https://…">`. `Content.inline()` escaped **zuerst alles** und gibt dann
nur diese vier wieder frei. Andersherum, also erlaubte Tags stehen lassen und den
Rest saeubern, muesste man jede Umgehung einzeln kennen.

**`Content.plain()` darf NICHT alles zwischen `<` und `>` entfernen.** Genau das
tat es einmal, und bei `"<10g Ballaststoffe/Tag. Weisser Reis … <strong>~1%"`
verschwanden 78 Zeichen mitten im Satz. Der Fehler haengt davon ab, ob spaeter im
Satz noch eine spitze Klammer steht, faellt also nur manchmal auf, und nie in der
Anzeige: `inline()` war nie betroffen, weil es escaped statt entfernt. Betroffen
war der Text-Index, also die Suche. Es entfernt jetzt nur die vier erlaubten Tags.

**Personalisierte Zahlen** stehen als `{name}` im Text, deklariert in `vars` am
Artikel: `{ from: 'weight', mul: 2.2 }`. Ohne `mul`/`div` wird der Wert
durchgereicht, auch wenn er keine Zahl ist (`{ from: 'alterEgo', fallback: '…' }`).
Der Renderer gibt in `werteFuer()` nur **Tatsachen ueber den Nutzer** hinein
(Gewicht, Groesse, Alter, Alter Ego); welche eine Seite braucht und wie sie sie
nennt, entscheiden die Daten. Der Renderer weiss nicht, dass es `{ego}` gibt.

**Berechnetes** steht als `{ t:'dyn', id:'…' }` mit seinem Text **an sich**, nicht
im Renderer. Vorhanden: `timeline10w`, `phaseCycle`, `nut10w`, `ernTimeline`,
`makroRechner`, `alterEgoForm`, `mentalProtokoll`. Die Regel dahinter: **nur
Auswahl und Rechnung bleiben Code, die Woerter nie.** Text, der im Renderer
bleibt, ist Text, den keine Pruefung je wieder sieht; genau so sind dreimal
hintereinander mehr als tausend Zeichen unbemerkt verschwunden.

**Tooltips gibt es nicht.** Auf einem Telefon ist ein `title`-Attribut
unerreichbar. Erklaerungen sind entweder in den Satz aufgeloest, eine
`note`-Karte, oder stehen im Glossar (`begriffe` am Artikel, gezeichnet als
eigenes Kapitel `__begriffe`).

### Die vier Pruefungen, und warum es vier sind

Jede faengt eine andere Fehlerklasse. Vor dem Freischalten einer Seite in
`MIT_DATEN` laufen alle vier.

| Werkzeug | Frage |
|---|---|
| `tools/inhaltspruefung.mjs` | Steht **jeder** Text aus den Daten sichtbar auf einem Bildschirm? |
| `tools/altneu-vergleich.mjs` | Fehlt gegenueber der alten Seite ein Wort? |
| `tools/platzhalter-pruefung.py` | War die Zahl im Original wirklich gerechnet? |
| `tools/zweigewichte.mjs` | Aendert sich beim Gewichtswechsel nur, was sich aendern darf? |

Dazu `tools/regelwerk.mjs` (43 Punkte Bedienbarkeit) und `tools/f7check.sh`
(fehlt eine Framework7-Komponente im zusammengesetzten CSS?).

**Die Lehre aus dieser Runde, dreimal bezahlt:** zu pruefen, ob etwas **da** ist,
ist nicht dasselbe wie zu pruefen, ob es **ankommt**.
- Die Reiter waren kaputt, waehrend jede DOM-Messung gruen war. Aufgefallen auf
  einem Schnappschuss.
- 1400 Zeichen wurden nicht gezeichnet, weil der Leser `doc.intro` uebersprang.
  Alle Bloecke waren da.
- Vierzehn Ernaehrungsangaben waren falsch, waehrend die Fakten-Pruefung 40 von
  40 meldete. Falsche Zahlen haben dieselben Woerter.

**Wenn eine Pruefung etwas meldet: erst nachschlagen, dann das Werkzeug
anfassen.** Nie umgekehrt. Ein Vergleich, den man passend macht, bis er
schweigt, ist keiner mehr. Bei Regeneration meldete der Wortvergleich 49
Verluste, alle 49 waren eingedeutschte Schreibweisen ("Supps" -> "Supplements").
Erst nach dem Nachschlagen wurde das Werkzeug geschaerft.

**Zwei Fallen, die Pruefungen selbst betreffen:**
- `innerText` liefert CSS-Versalien mit. Im Deutschen macht `text-transform` aus
  dem `ss` ein `SS`, veraendert also das Wort. Vergleiche in Kleinschreibung.
- Versalien gehoeren nie in die Daten. Wer sie dort hineinschreibt, kann sie
  nachher nicht zurueckholen.

### Framework7 kappt Inhalt, wo es Etiketten erwartet

`.item-text` wird nach zwei Zeilen mit Auslassungspunkten gekappt. Bei Etiketten
ist das richtig, bei Inhalt nicht: im Glossar stand "Energieproduktion...
nutzen." mitten im Satz, obwohl der Text vollstaendig da war. `white-space`
allein hebt es nicht auf, es braucht `-webkit-line-clamp` und `display`. Dafuer
gibt es `.bs-wrap`.

### Der Startpfad

Kaltstart bei 390px, 4x CPU-Drosselung, 4 Mbit, Service Worker aktiv:
**FCP 288 ms, 1152 DOM-Knoten.** Vorher (Commit b800772) waren es 2116 ms
und 4104 Knoten. Das sind minus 86 Prozent.

**Der Flaschenhals ist ab hier nicht mehr das Netz.** Aus dem Service-Worker-
Vorrat liegen alle Dateien nach 25 bis 70 ms vor, auch `framework7.min.js`
und `js/app.js`. Die restlichen gut 200 ms sind reine Parse- und Laufzeit von
JavaScript auf gedrosselter CPU. Weitere Abrufe zu sparen bringt nichts mehr,
weniger JavaScript auszuliefern schon.

Was diesen Pfad traegt, bitte nicht versehentlich zurueckdrehen:

- **`sw.js` liefert App-Dateien Cache-zuerst** und laedt im Hintergrund nach.
  Vorher Netz-zuerst mit 3 Sekunden Frist pro Datei. **Bedingung dafuer:**
  `sw.js` selbst wird nie aus dem Cache beantwortet (die Zeile mit
  `/\/sw\.js(\?|$)/`). Ohne sie bekommt der Selbstheilungs-Block sein eigenes
  altes `sw.js` zurueck und Nutzer sitzen dauerhaft auf einer alten Fassung.
- **Kein `<script>` mehr im `<head>`.** Dort standen 761 KB und blockierten
  den Parser vor dem ersten Pixel. Firebase steht jetzt im Rumpf direkt vor
  `js/util.js`, dort stimmt die Reihenfolge fuer `initFirebase()` in `app.js`.
  Nebenwirkung: `domContentLoaded` ist von 350 auf 1336 ms gestiegen. Gewollt.
- **`chart.min.js` (209 KB) und `firebase-storage.js` (40 KB) laden bei Bedarf**
  ueber `ensureChart()` und `ensureStorage()` in `js/app.js`. Beide liegen
  weiter im Service-Worker-Vorrat, sind also auch offline da. Wer sie wieder
  in `app.html` einbindet, macht die Lader zu Attrappen.
- **`css/style.css` blockiert auf dem Handy nicht mehr.** 209 KB, davon
  genutzt 6,4 Prozent, und vor der ersten Navigation wird davon nichts
  gebraucht: die alte Oberflaeche ist ausgeblendet, und die Ausblendregeln
  stehen in `f7theme.css`. Zwei `<link>` auf dieselbe Datei, ein Abruf:
  `media="(min-width: 769px)"` blockierend fuer den Desktop, dazu
  `media="print"` mit `onload` auf `(max-width: 768px)` fuer das Handy.
  **Die Kaskade verschiebt sich dabei nicht** — fuer Stylesheets zaehlt die
  Position im Dokument, nicht der Ladezeitpunkt. Gegengeprueft: Kapitelzahl,
  `font-size`, `line-height`, `color`, Kartenhintergrund und `border-radius`
  im `.legacy`-Block sind vorher und nachher identisch, Desktop unveraendert.
  Allein das sind rund 1050 ms FCP.
  Restrisiko nur beim allerersten Besuch ohne Service Worker: dort kann der
  Altbestand kurz unformatiert aufblitzen, wenn man sofort in einen Artikel
  tippt. Mit Vorrat liegt `style.css` nach 67 ms vor, also lange vor dem
  ersten Bild.
- **Google Fonts blockieren nicht mehr** (`media="print"` + `onload`, dazu
  `preconnect`). Die Handy-Oberflaeche benutzt keine der drei Schriften, nur
  der eingebettete Altbestand, und der erscheint erst nach einer Navigation.
- **`renderAllPages()` laeuft auf dem Handy nicht.** Es baute zehn komplette
  Desktop-Seiten ins DOM, die dort alle auf `display:none` liegen. Jede
  Unterseite ruft ihren eigenen Renderer, bevor sie ihn ausliest
  (`renderTrainingPage`, `renderProfilPage`), der Scraper bekommt also weiter
  gefuellte Seiten. Auf dem Desktop laeuft es in `requestIdleCallback`.
  Abgefragt wird das ueber `isAppShell()` (liest `html.is-mobile`).
- **Der Start wartet nicht mehr auf Firebase.** Wer `fos_current` hat, kommt
  sofort rein. Den Abgleich startet `_boxspecAuthReady()` in `js/app.js`,
  sobald die Sitzung eintrifft, inklusive `syncToCloud`. Das hing frueher an
  `enterApp()`, und `enterApp()` laeuft jetzt vor der Sitzung.
- **`initNotifications()` zeigt seinen Kasten auf dem Handy nicht mehr.** Er
  lag auf `bottom:80px`, also ueber der Tab-Leiste, und auf iOS ist Web Push
  vor der Installation gesperrt. Gefragt werden soll spaeter im Profil ueber
  `Native.pushStatus()`.
- **10 echte `apple-touch-startup-image` unter `img/splash/`**, Grund
  `#0C0A09` wie `background_color`, Symbol mittig, iPhone SE2 bis 16 Pro Max,
  je mit `orientation: portrait`. Vorher zeigten alle fuenf Eintraege auf
  `icon-512x512.png`, ein 512er Quadrat auf 1290x2796.

Gemessen wird mit Playwright bei 390px, `Emulation.setCPUThrottlingRate` 4
und aktivem Service Worker, also der Fall des wiederkehrenden Nutzers.

### Was als naechstes am Start haengt

Vor dem ersten Bild liegen weiter rund 3 MB. Der Rest faellt erst, wenn die
Schaberei stirbt: `js/f7app.js` rendert fuer 11 Bildschirme die Desktop-Seite
in ein unsichtbares Div und schneidet deren HTML heraus (`sections()`,
`altHTML()`). Solange das so ist, braucht das Handy `js/pages.js` (326 KB),
`css/style.css` (214 KB) und grosse Teile von `js/app.js`. Erst danach lohnt
ein eigener Handy-Einstieg, vorher waere er `app.html` minus Markup.

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
