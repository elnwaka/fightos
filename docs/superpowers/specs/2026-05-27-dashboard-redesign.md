# Dashboard Redesign: "Fight Command"

## Context
FightOS Dashboard ist der erste Screen den jeder User sieht. Aktuell wirkt es flach und langweilig — kein Wow-Effekt, zu viel Text, zu wenig visueller Impact. Das Ziel: Wenn ein Boxer oder Trainer das Dashboard öffnet soll er denken "Krass, so eine App gibt es?"

## Design Direction
**Mix aus Fight Card (Glasmorphism) + War Room (Taktisch)**

Leuchtende halbtransparente Karten auf einem dunklen, grid-basierten Hintergrund. Fight-Poster Typografie trifft Command-Center Daten-Ästhetik. Dunkel & intensiv — wie eine Fight Night.

## Scope
Nur das Dashboard (`renderDashboard()` in `js/app.js`). Keine anderen Seiten.

## Technische Basis
- Pure CSS (kein Framework)
- CSS-Variablen aus bestehendem Design-System
- `backdrop-filter: blur()` für Glasmorphism
- CSS `@keyframes` für Animationen
- Bestehende `renderDashboard()` Funktion wird umgebaut
- Bestehende Datenstruktur bleibt (getData(), getUserSchedule() etc.)

---

## Sektion 1: Hero-Bereich

### Aktuell
Statisches `gym-dark.jpg` Foto, Name in Bebas Neue, Record darunter, Stats-Bar.

### Neu
- **Hintergrund:** Animierter CSS-Gradient (dunkelrot → schwarz → dunkelblau), langsam bewegend (20s cycle). Darüber ein subtiles Grid-Overlay (1px Linien, 5% opacity) — wie ein taktisches Raster
- **Name:** Gross (clamp 32px-56px), uppercase, Bebas Neue, mit `text-shadow` Glow-Effekt in Rot (dezent, 0 0 20px rgba(232,0,13,.3))
- **Record:** Nur angezeigt wenn Kämpfe existieren. Siege/Niederlagen als farbige Badges (nicht als "0S-0N-0U" Text)
- **Score-Ring:** SVG-Ring animiert (wie bisher), aber mit `filter: drop-shadow()` Glow in der Score-Farbe. Größer als aktuell (200px statt 140px auf Desktop)
- **Stats-Bar:** 4 Werte (Score, Kämpfe, Sessions, Woche) in separaten **Glasmorphism-Zellen** — `background: rgba(255,255,255,.05)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,.08)`. Monospace-Zahlen, dezent leuchtende Borders

### CSS Klassen
```
.fc-hero — Container mit animiertem Gradient + Grid-Overlay
.fc-hero-name — Grosser Name mit Glow
.fc-hero-record — Record Badges (nur wenn Kämpfe > 0)
.fc-hero-score — Score-Ring mit Drop-Shadow
.fc-stats-bar — Glasmorphism Stats-Grid
.fc-stat-cell — Einzelne Stat-Zelle
```

---

## Sektion 2: Nächste Session Karte

### Aktuell
Div mit `border-left: 3px solid red`, flacher Hintergrund, Text + 2 Buttons.

### Neu
- **Glasmorphism-Karte:** `background: rgba(255,255,255,.04)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,.06)`, `border-radius: 12px`
- **Leuchtender Left-Border** in der Block-Typ-Farbe (rot=Kraft, grün=Cardio, blau=Boxing) mit `box-shadow: -2px 0 12px` in derselben Farbe
- **Uhrzeit:** Gross (24px Bebas Neue), daneben Tag-Label klein
- **Titel:** 20-28px, uppercase
- **Buttons:** "ERLEDIGT" als filled Button mit `box-shadow` Glow. "DETAILS" als Ghost-Button mit leuchtender Border
- **Kampf-Countdown** (wenn <14 Tage) integriert in die Karte als rote Zeile
- **HRV-Warnung** (wenn vorhanden) als oranges Badge

### CSS Klassen
```
.fc-next-session — Glasmorphism Hauptkarte
.fc-next-glow — Leuchtender Left-Border (Farbe per CSS-Variable --block-color)
.fc-btn-done — ERLEDIGT Button mit Glow
.fc-btn-ghost — Ghost Button
```

---

## Sektion 3: Heute-Checklist + Fortschritt

### Aktuell
Vertikale Liste mit runden Checkboxen, Fortschrittsbalken oben.

### Neu
- **Fortschrittsbalken:** Volle Breite, 6px hoch, mit Glow-Effekt am gefüllten Ende. Farbe: gold (in progress) → grün (alles erledigt)
- **Block-Einträge:** Kompakter, als horizontale Reihen mit:
  - Checkbox (32px Kreis, beim Erledigen: grüner Glow-Puls Animation)
  - Block-Titel + Uhrzeit + Dauer
  - Block-Typ-Indikator (farbiger 3px Dot links)
- **Trennlinien:** Subtile 1px Linien mit `rgba(255,255,255,.04)` statt hartem Surface-2

### CSS Klassen
```
.fc-today-bar — Fortschrittsbalken mit Glow
.fc-today-item — Einzelner Checklist-Eintrag
.fc-check — Checkbox mit Glow-Animation
.fc-check.done — Erledigter State (grün + Pulse)
```

---

## Sektion 4: Wochen-Strip

### Aktuell
7 SVG-Ringe mit Tagesnamen darunter.

### Neu
- **Ringe bleiben** (funktionieren gut visuell)
- **Erledigte Tage:** Ring glüht grün mit `filter: drop-shadow(0 0 6px var(--green))`
- **Heute:** Ring pulsiert leicht (subtle scale 1.0→1.05, 2s infinite)
- **Container:** Leichte Glasmorphism-Karte als Hintergrund
- **Tage-Label:** Aktiver Tag (heute) in Weiß, Rest in muted

### CSS Klassen
```
.fc-week-strip — Glasmorphism Container
.fc-week-day.today — Pulsierender heutiger Tag
.fc-week-ring.complete — Grüner Glow auf erledigtem Ring
```

---

## Sektion 5: Performance Snapshot

### Aktuell
Radar-Chart + HRV-Zeile (nur wenn Daten vorhanden).

### Neu
- **Radar-Chart:** In Glasmorphism-Karte, tappbar → navigiert zu Tests
- **HRV-Status:** Als kleine Glasmorphism-Pill mit farbigem Glow (grün/gelb/rot)
- **Nur angezeigt wenn Benchmark-Daten existieren** (kein leerer Radar)

### CSS Klassen
```
.fc-performance — Glasmorphism Container
.fc-hrv-pill — HRV Status Pill mit Glow
```

---

## Sektion 6: Quick Links + Welcome Banner

### Aktuell
Pill-Buttons am Ende. Welcome-Banner für neue User.

### Neu
- **Quick Links:** 3 Ghost-Buttons mit Icons, leuchtende Border on hover
- **Welcome-Banner (neue User):** Glasmorphism-Karte mit den 3 Schritten. Verschwindet nach erstem Training-Log
- **Hinweise-Section:** Bleibt, aber dezenter gestylt

### CSS Klassen
```
.fc-quick-links — Button-Row
.fc-quick-btn — Ghost Button mit Hover-Glow
.fc-welcome — Glasmorphism Welcome Karte (neue User)
```

---

## Animationen

| Element | Animation | Timing |
|---------|-----------|--------|
| Hero Gradient | Langsames Farbwechsel-Loop | 20s infinite |
| Score-Ring | Stroke-dashoffset Einblend | 1.2s ease on load |
| Stats-Zahlen | Count-up von 0 | 800ms on load |
| Wochen-Ringe | Stagger-Animation MO→SO | 50ms Verzögerung |
| Heute-Ring | Subtiler Scale-Pulse | 2s infinite |
| Block-Erledigt | Slide-out nach rechts + Fade | 400ms |
| Checkbox Done | Grüner Glow-Pulse | 600ms once |

Alle Animationen respektieren `prefers-reduced-motion`.

---

## Glasmorphism Design Tokens (neue CSS-Variablen)

```css
--glass-bg: rgba(255,255,255,.04);
--glass-border: rgba(255,255,255,.08);
--glass-blur: 16px;
--glow-red: 0 0 20px rgba(232,0,13,.3);
--glow-green: 0 0 12px rgba(34,197,94,.4);
--glow-gold: 0 0 12px rgba(245,197,24,.3);
--glow-blue: 0 0 12px rgba(59,130,246,.3);
--grid-line: rgba(255,255,255,.03);
```

---

## Files die geändert werden

| Datei | Änderung |
|-------|----------|
| `css/style.css` | Neue `.fc-*` Klassen + Glasmorphism Tokens + Animationen |
| `js/app.js` | `renderDashboard()` HTML-Output mit neuen Klassen |

Keine neuen Dateien nötig. Keine Änderungen an Datenstrukturen oder Logik.

---

## Verifikation

- [ ] Hero: Animierter Gradient sichtbar, Grid-Overlay, Name mit Glow
- [ ] Score-Ring: Animiert ein, Glow in Score-Farbe
- [ ] Stats-Bar: 4 Glasmorphism-Zellen mit leuchtenden Borders
- [ ] Nächste Session: Glasmorphism-Karte mit farbigem Glow-Border
- [ ] Heute: Fortschrittsbalken mit Glow, Checkbox-Animation
- [ ] Wochen-Strip: Erledigte Tage glühen, Heute pulsiert
- [ ] Performance: Glasmorphism-Container (nur wenn Daten)
- [ ] Mobile (375px): Alles responsive, kein Overflow
- [ ] Light Mode: Glasmorphism funktioniert auch hell
- [ ] prefers-reduced-motion: Animationen deaktiviert
- [ ] Neue User: Welcome-Banner sichtbar mit 3 Schritten
