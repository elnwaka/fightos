# BoxSpec — Handoff für neue Claude Sessions

## Was ist BoxSpec?
Eine Web-App (PWA) für Boxer. Trainingsplan, Ernährung, AI Coach, Video-Bibliothek, 8-Säulen Wissenssystem. Läuft auf boxspec.app (Netlify Hosting).

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (kein Framework, kein Build-Step)
- **Auth + DB:** Firebase Auth + Firestore (Cloud Sync eingebaut)
- **AI Coach:** Google Gemini 2.5 Flash via Netlify Function Proxy (Key als ENV Variable auf Netlify, NICHT im Code)
- **Hosting:** Netlify (boxspec.app), Domain bei Strato, DNS über Strato A-Record → 75.2.60.5
- **SEO:** Google Search Console verifiziert, Sitemap mit 5 URLs, 3 SEO-Artikel-Seiten

## Dateien — Übersicht
```
index.html          → Landing Page (SEO, boxspec.app/)
app.html            → Die eigentliche App (Login/Register/Dashboard)
css/style.css       → 4500+ Zeilen CSS, Glasmorphism "Fight Command" Design
js/app.js           → 8000+ Zeilen Hauptlogik (Dashboard, Plan, Auth, Account, Tests, Fights)
js/pages.js         → 3000+ Zeilen (8 Säulen, Übungsdatenbank, Ernährung, Periodisierung)
js/program10w.js    → 10-Wochen Trainingsprogramm (TLAC-basiert)
js/ai-coach.js      → AI Coach (Gemini, System-Prompt mit Box-Taktik-Wissen)
js/video-library.js → 60+ kuratierte Videos in 8 Kategorien
js/calculators.js   → Makro-Rechner, HF-Zonen etc.
netlify/functions/ai-proxy.js → Serverless Proxy für Gemini API Key
netlify.toml        → Netlify Build-Config
manifest.json       → PWA Manifest
sw.js               → Service Worker (Offline-Cache)
sitemap.xml         → 5 URLs für Google
robots.txt          → Erlaubt alle Crawler
trainingsplan-boxer.html    → SEO-Artikel
gewicht-machen-boxen.html   → SEO-Artikel
krafttraining-boxer.html    → SEO-Artikel
```

## Was gebaut wurde (chronologisch)
1. Repo geklont von github.com/elnwaka/fightos
2. 10-Wochen TLAC-Programm eingebaut (program10w.js)
3. Navigation vereinfacht: 3 Dropdown-Hubs → 5 flache Tabs (Home, Plan, Training, Kämpfe, Profil)
4. Training-Seite: Merged Hub mit Sub-Tabs (Übungen, Wissen, Tests, Log, Ernährung, Periodisierung, Recovery, Notizen)
5. Profil-Seite: Merged Hub (Account, 8 Säulen, Rechner, FAQ)
6. Dashboard: Fight Command Design (Glasmorphism, animierter Hero-Gradient, Glow-Effekte)
7. TLAC-Wissenschaft in 4 Säulen eingebaut (Kraft, Conditioning, Ernährung, Mobilität)
8. Onboarding-Flow gefixt (war kaputt — Race Condition mit Firebase Auth)
9. AI Coach eingebaut (Gemini, System-Prompt mit 4000+ Wörter Box-Wissen)
10. AI Coach: integrierte Aktionen (Videos öffnen, Seiten navigieren, Plan ändern)
11. AI Coach: persistente Chat-History (localStorage)
12. AI Coach: echtes Taktik-Wissen (Southpaw, Feints, Körperschläge, Clinch, Dirty Boxing, Atmung)
13. Video-Bibliothek: 60+ Videos in 8 Kategorien (Legenden, Aktive, Ring IQ, Grundlagen, Drills, Defense, Dirty Boxing, S&C)
14. Custom Video Player (Fullscreen Overlay, kein YT-Branding)
15. Notizen-Section (6 Kategorien, Filter, Glasmorphism)
16. Block-Erledigt Animation (Slide-out + Fade)
17. Kaputte Bilder: Placeholder mit Gradient + Übungsname
18. Empty States auf allen Seiten (Kämpfe, Tests, Wochenplan)
19. Rebrand: FightOS → BoxSpec (alle Dateien, neues SVG Logo)
20. Landing Page (SEO-optimiert, Hero mit Box-Bild, AI Coach Mock-Chat)
21. 3 SEO-Artikel (Trainingsplan, Gewicht machen, Krafttraining)
22. Netlify Function für API Key Proxy
23. Cloud Sync: Profile-Einstellungen syncen jetzt auch automatisch
24. Domain boxspec.app verbunden (Strato DNS → Netlify)
25. Google Search Console verifiziert + Sitemap eingereicht
26. PageSpeed-Optimierung (98/100 Desktop)

## Bekannte Probleme
- app.js ist 8000+ Zeilen — sollte in Module aufgeteilt werden
- 1061 Inline-Styles in app.js und pages.js — sollten CSS-Klassen werden
- Einige Übungsbilder fehlen (Placeholder statt echte Fotos)
- AI Coach Token-Limit: System-Prompt ~4000 Wörter, Chat-History auf 10 begrenzt
- Light Mode hat noch einige Inkonsistenzen
- Wochenplan Mobile: zu viele Info-Banner vor dem Grid

## Wichtige Konventionen
- App heißt jetzt BoxSpec (nicht mehr FightOS)
- Firebase Config: Project ID ist noch "fightos-85652" (technischer Name, nicht sichtbar für User)
- Email-Domain für Auth: user@fightos.app (intern, nicht ändern)
- Alle Texte auf Deutsch
- TLAC/Boxing Science wird nirgendwo namentlich erwähnt — alles ist "BoxSpec-Wissen"
- AI Coach System-Prompt: Spricht Deutsch, direkt wie ein Trainer, max 300 Wörter pro Antwort

## Was als nächstes kommt
1. App selbst benutzen + Boxer im Verein testen lassen
2. Social Media (Instagram/TikTok @boxspec)
3. Feedback-basiert Features priorisieren
4. Technische Schulden aufräumen (Inline-Styles, Module)
5. Bei 50+ aktiven Nutzern: Abo-Modell planen (Free vs Pro)
