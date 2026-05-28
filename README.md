# BoxSpec — Das komplette Trainingssystem für Boxer

**[boxspec.app](https://boxspec.app)** — Trainingsplan, Ernährung, Kraft & Conditioning, Kampfvorbereitung und AI Coach. Wissenschaftlich basiert, kostenlos.

---

## Was ist BoxSpec?

BoxSpec ist eine Web-App die Boxern alles gibt was sie brauchen um besser zu werden — an einem Ort. Kein YouTube-Chaos, keine PDFs, keine 5 verschiedenen Apps. Ein System.

### Features

**Trainingsplan**
- 10-Wochen periodisiertes Programm (Grundlagen → Kraft-Schnelligkeit → Peak → Taper)
- Automatisch generiert basierend auf Level, Equipment und Zeitplan
- 3:1 Loading Pattern mit intelligenten Deload-Wochen
- Kampfdatum-Integration (Plan passt sich automatisch an)

**AI Coach**
- Persönlicher AI-Trainer der deinen Plan, deine Tests und dein Ziel kennt
- Erstellt Gameplans für spezifische Gegner (Southpaw, Infighter, größer/kleiner)
- Empfiehlt Videos, passt den Plan an, beantwortet jede Frage
- Echtes Box-Wissen: Ring IQ, Dirty Boxing, Feints, Konter-Setups, Atmung

**Video-Bibliothek**
- 60+ kuratierte Videos in 8 Kategorien
- Kampf-Breakdowns: Ali, Mayweather, Lomachenko, Usyk, Canelo, Crawford
- Ring IQ, Technik, Defense, Dirty Boxing & Clinch, S&C
- Custom Player — kein YouTube-Branding

**8-Säulen Wissenssystem**
- Kraft & Power (Biomechanik des Schlags, Force-Velocity Curve)
- Metabolische Kapazität (VO2max, Red Zone, 3 Conditioning-Säulen)
- Kognition & Antizipation
- Ernährung & Gewicht (Makros, Supplements, Fight Week Protokoll)
- Regeneration & HRV
- Ring IQ & Taktik
- Sportpsychologie
- Mobilität & Prävention (RAMP Warm-Up, Pre-Fight Protokoll)

**Weitere Features**
- Onboarding-Wizard (7 Schritte, personalisiert)
- Leistungstests mit Radar-Chart
- Trainingslog mit RPE-Tracking
- Kampf-Archiv mit Matchup-Analyse
- Notizen-Section (6 Kategorien)
- Gewicht-Tracking
- Dark/Light Mode
- PWA (installierbar, offline-fähig)
- Firebase Cloud Sync (alle Geräte synchron)

---

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (kein Framework)
- **Auth & Database:** Firebase Auth + Firestore
- **AI:** Google Gemini 2.5 Flash (via Netlify Function Proxy)
- **Hosting:** Netlify
- **PWA:** Service Worker mit Offline-Cache

---

## Screenshots

### Dashboard
Fight Command Design mit animiertem Hero, Glasmorphism Stats-Bar und Wochen-Fortschritt.

### Wochenplan
7-Tage Grid mit farbcodierten Trainingsblöcken. Automatisch generiert, manuell anpassbar.

### AI Coach
Chat-basierter Trainer mit echtem Box-Wissen. Kann Videos empfehlen, den Plan ändern und Gameplans erstellen.

### Video-Bibliothek
60+ kuratierte Videos von Skillr Boxing, Lee Wylie und Boxing Science.

---

## Wissenschaftliche Basis

Das Trainingssystem basiert auf Sportwissenschaft:
- Force-Velocity Curve für boxspezifisches Krafttraining
- VO2max und Red-Zone-Training (Helgerud-Protokoll)
- Periodisiertes 3:1 Loading Pattern
- Makro-Timing basierend auf Trainingsintensität
- Fight-Week Protokoll (Water Loading, Low-Residue, Refuelling)
- HRV-basierte Belastungssteuerung
- RAMP Warm-Up Methode

---

## Lokal starten

```bash
git clone https://github.com/elnwaka/fightos.git
cd fightos
# Einfach index.html im Browser öffnen — kein Build-Schritt nötig
```

Für den AI Coach wird ein Google Gemini API Key benötigt (als Netlify Environment Variable `GEMINI_API_KEY`).

---

## Lizenz

Dieses Projekt ist privat. Alle Rechte vorbehalten.

---

**[boxspec.app](https://boxspec.app)** — Built for Fighters.
