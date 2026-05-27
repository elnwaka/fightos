# FightOS Full App Test — Findings Report
Getestet am 2026-05-27 mit Playwright (Chromium headless)
Desktop 1440x900 + Mobile 375x812

## Zusammenfassung
- 45 Tests bestanden
- 23 Bugs (davon 21 Console Errors wegen fehlender Bilder)
- 2 UX-Issues

---

## WAS GUT FUNKTIONIERT

### Onboarding Flow
- Registration → Auto-Login → Onboarding-Wizard erscheint sofort
- 7 Schritte: Name → Koerper → Level → Zeitplan → Ziel → Kampfdatum → Fitness
- Validierung funktioniert (Groesse 140-220 cm wird geprueft)
- Nach Onboarding: 8-Saeulen-Intro erscheint
- Nach Intro: Dashboard mit Willkommens-Banner

### Dashboard (Neuer User)
- Willkommens-Banner mit 3 klaren Schritten sichtbar
- Naechste Session wird angezeigt (Aktive Erholung, 17:30)
- Heute-Checklist mit 2 Bloecken (Kraft + Recovery)
- 7-Tage Wochenstrip mit Ringen
- Quick Links am Ende (Training loggen, Kampf planen, Test machen)
- "DEIN ERSTER SCHRITT" Checkliste (Koerpergewicht, Test, Training, HRV)
- Hinweis "6 Tests noch nie durchgefuehrt"

### Wochenplan
- 7-Tage-Grid mit farbcodierten Bloecken
- Automatisch-erstellt-Hinweis fuer neue User sichtbar
- Equipment/Level/S&C-Frequenz Badges
- Kampfdatum-Hinweis
- Saeulen-Abdeckung (6/8) visualisiert
- Block-Detail oeffnet sich korrekt (Aufwaermen → Hauptteil → Abschluss)
- "NEU GENERIEREN" Button am Ende

### Training Hub
- 6 Sub-Tabs funktionieren alle (Uebungen, Tests, Log, Ernaehrung, Periodisierung, Recovery)
- Uebungsbibliothek mit Bildern und Kategorien
- Tests-Seite zeigt Baseline-Hinweis fuer neue User
- Log-Formular ist vorhanden
- Ernaehrung hat umfangreichen Content (18.767 Zeichen!)

### Kaempfe
- Empty State mit Boxhandschuh-Emoji + "KAMPF EINTRAGEN" CTA
- Klar und einladend fuer neue User

### Profil
- Account, 8 Saeulen, Rechner, FAQ als Sub-Tabs
- Gewicht, Kampfdatum, Programm-Selektor sichtbar
- 8 Saeulen mit Kraft + Metabolisch Inhalten

### Mobile (375x812)
- Bottom Bar mit 5 Tabs sichtbar
- Kein horizontaler Overflow
- Dashboard scrollt sauber

### Allgemein
- Light Mode Toggle funktioniert
- Keine Broken Images auf der Hauptseite

---

## BUGS

### 1. JS Error: "Assignment to constant variable" (5x)
- Severity: MITTEL
- Tritt mehrfach auf, wahrscheinlich wenn Training-Subtabs gerendert werden
- Moeglicherweise weil renderTrainingPage() und renderProfilPage() Content per innerHTML kopieren,
  aber die kopierten Elemente Event-Handler oder const-Variablen enthalten die nochmal initialisiert werden

### 2. 38 Fehlende Bilder (404 Errors)
- Severity: HOCH (visuell)
- Alle Uebungsbilder unter /img/exercises/ fehlen auf dem Server:
  overcoming-iso.jpg, pallof-press.jpg, seilspringen.jpg, rice-bucket.jpg,
  knuckle-pushups.jpg, bottoms-up-kb.jpg, wrist-roller.jpg, pinch-holds.jpg,
  hip-cars.jpg, thoracic-rotation.jpg, shoulder-dislocates.jpg, ankle-mobility.jpg,
  heavy-bag-intervals.jpg, barbell-complex.jpg, sled-push.jpg, bfr.jpg, imt.jpg,
  shadow-boxing.jpg
- Auch Unsplash-Bilder laden nicht (evtl. Hotlink-Schutz)
- Empfehlung: Eigene Bilder hosten oder Fallback-Placeholder einbauen

### 3. Profil-Seite zeigt Training-Sub-Tabs
- Severity: MITTEL
- Die Profil-Sub-Tabs zeigen: "Übungen, Tests, Log, Ernährung, Periodisierung, Recovery, Account, 8 Säulen, Rechner, FAQ"
- Die ersten 6 sind die TRAINING-Tabs — die sollten dort nicht erscheinen
- Ursache: renderProfilPage() kopiert vermutlich das DOM falsch

---

## UX-ISSUES

### 1. Username zu lang im Hero
- Der automatische Username "TESTBOXER1779871645944" ist extrem lang
- Im Hero-Bereich laeuft er ueber
- Fix: Username kuerzen oder Onboarding sollte einen kurzen Spitznamen erzwingen

### 2. Profil: Arbeitszeit-Setting fehlt
- "Arbeitszeit von/bis" ist im Account nicht sichtbar (oder der Test hat es nicht gefunden)
- Boxer muessen Arbeitszeiten angeben koennen um den Plan anzupassen

### 3. Stats zeigen "—" fuer Score
- Fuer neue User zeigt der Score "—" was verwirrend ist
- Besser: "Noch kein Score — mache deinen ersten Test" oder Score ausblenden

### 4. Block-Detail: "kg" Feld bei Atemtraining
- Im Block-Detail fuer "Ausdauer + Atemtraining" steht ein "kg" Eingabefeld
  neben "30 Atemzuege" und "30 Min." — das ergibt keinen Sinn
- kg-Feld sollte nur bei Kraftuebungen angezeigt werden

### 5. Wochenplan: "Level: Anfaenger" statt "Anfänger"
- Umlaut fehlt im Level-Badge ("Anfaenger" statt "Anfänger")

### 6. Saeulen-Abdeckung zeigt 6/8
- Der Plan deckt nur 6 von 8 Saeulen ab
- Die fehlenden (Ernaehrung, Mental) sind ausgegraut
- Fuer einen neuen User unklar was das bedeutet und wie man es verbessert

### 7. "0S – 0N – 0U" im Hero
- Record "0 Siege – 0 Niederlagen – 0 Unentschieden" sieht traurig aus
- Fuer neue User besser ausblenden oder durch motivierenden Text ersetzen

---

## EMPFEHLUNGEN (Prioritaet)

### Sofort fixen
1. Fehlende Uebungsbilder hosten oder Placeholder einbauen
2. "Assignment to constant variable" JS-Error debuggen
3. Profil-Seite: Training-Tabs nicht in Profil-Sub-Tabs anzeigen

### Naechster Sprint
4. Record "0S-0N-0U" bei neuen Usern ausblenden
5. Score "—" durch hilfreichen Text ersetzen
6. kg-Feld nur bei Kraftuebungen zeigen
7. Username-Overflow im Hero fixen (max-width oder text-overflow)

### Spaeter
8. Saeulen-Abdeckung erklaeren (Tooltip oder Link)
9. Umlaut-Fix "Anfaenger" → "Anfänger"
10. Arbeitszeit-Setting sichtbar machen
