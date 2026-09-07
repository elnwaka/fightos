# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Boxer im Amateur- bis Wettkampfbereich, deutschsprachig, meist im Verein. Sie trainieren
nach einem Plan, bereiten sich auf Kämpfe vor und wollen nicht raten, was sie heute tun.

Zwei Situationen, die Halle gewinnt im Konflikt:

1. **In der Halle, Handy in der Hand.** Zwischen Runden oder Sätzen. Verschwitzt, Handschuhe
   halb aus, oft nur eine Hand frei, wenige Sekunden Aufmerksamkeit, wechselndes Licht.
   Aufgabe: sehen was jetzt dran ist, abhaken, kurz nachschlagen.
2. **Zuhause, abends.** Ruhig, beide Hände. Aufgabe: Woche planen, Tests eintragen,
   Kampfdatum setzen, nachlesen.

## Product Purpose

Ein vollständiges Trainingssystem für Boxer an einer Stelle: periodisierter Plan, Kraft und
Kondition, Ernährung, Kampfvorbereitung, Wissen und ein AI-Coach. Kostenlos.

Erfolg heißt: der Nutzer öffnet die App am Trainingstag, weiß in einer Sekunde was ansteht,
und hakt es danach ab. Alles andere ist Beiwerk.

## Positioning

Der Plan ist periodisiert und passt sich an Level, verfügbares Equipment, Wochenrhythmus und
Kampfdatum an — inklusive Deload-Wochen im 3:1-Muster. Der AI-Coach kennt diesen konkreten
Plan, die eingetragenen Testwerte und das Kampfdatum des Nutzers, statt allgemeine
Trainingsratschläge zu geben. Die Alternative für diese Zielgruppe ist heute YouTube plus
PDFs plus mehrere Apps.

## Operating Context

- Trainingshalle und Kraftraum, Handy in der Tasche oder auf der Bank
- Trainingswoche als wiederkehrender Rhythmus, 10-Wochen-Zyklen mit Phasen
- Kampftermine als fixe Anker, auf die hin geplant wird
- Vereinsumfeld: Trainer, Sparringspartner, andere Boxer als Vergleich

## Capabilities and Constraints

**Funktioniert heute:** 10-Wochen-Programm mit Phasen und Deloads · Wochenplan ·
Übungsdatenbank mit Fotos · Leistungstests · Trainingslog · HRV · Ernährung ·
Periodisierung · Recovery · Notizen · Kampfverwaltung · Community (Feed, Forum, Ranking,
öffentliche Profile) · AI-Coach auf Gemini · Video-Bibliothek mit 60+ kuratierten Videos ·
8-Säulen-Wissenssystem · Rechner · FAQ

**Technisch bindend:** Vanilla HTML/CSS/JS ohne Build-Step und ohne Framework · Firebase
Auth, Firestore und Storage · Hosting auf Vercel · PWA mit Offline-Cache · alle Texte auf
Deutsch · kostenlos für Nutzer, also keine laufenden Kosten pro Nutzer

**Offen:** Der Produktname. Domain und bisheriger App-Name sind BoxSpec, das Repository und
der frühere Name sind FightOS. Der Nutzer hat beide genannt und noch nicht entschieden.

## Brand Commitments

Keine. Der Nutzer hat für Farben, Typografie und Logo ausdrücklich freie Hand gegeben.
Bestehend, aber nicht bindend: Domain boxspec.app, bei Google Search Console verifiziert,
drei indexierte SEO-Artikel.

## Evidence on Hand

Echtes Material, nichts davon erfunden:

- 10-Wochen-Programm mit realen Einheiten (`js/program10w.js`)
- 60+ kuratierte Videos in 8 Kategorien (`js/video-library.js`)
- Übungsdatenbank mit 40 lokalen Fotos (`img/exercises/db/`, free-exercise-db, Public Domain)
- 8-Säulen-Wissenssystem und Ernährungsinhalte (`js/pages.js`)
- Hero- und Trainingsfotos (`img/hero/`)

Es gibt **keine** Nutzerzahlen, Testimonials, Bewertungen, Presse oder Trainer-Kooperationen.
Nichts davon darf behauptet werden. Die App hat aktuell im Wesentlichen einen aktiven Nutzer.

## Product Principles

1. **Die Halle gewinnt.** Bei jedem Konflikt entscheidet, ob es verschwitzt, einhändig und in
   drei Sekunden bedienbar ist.
2. **Der Startbildschirm beantwortet eine Frage:** Was trainiere ich heute? Alles, was diese
   Antwort verzögert, gehört woandershin.
3. **Nachschlagewerk ist keine Navigation.** Wissen, Ernährung, Rechner und FAQ liest man
   selten und gezielt — sie dürfen den täglichen Weg nicht verstellen.
4. **Keine Zahl ohne Deckung.** Kennzahlen nur, wo echte eingetragene Daten dahinterstehen;
   kein Score, der Aktivität simuliert.
5. **Die PWA ist das Produkt.** Installierbar, offline, kostenlos, ohne Store-Zwang.

## Accessibility & Inclusion

Nutzungsbedingt, nicht optional: große Antippflächen für verschwitzte Finger, Bedienung mit
einem Daumen im unteren Bildschirmdrittel, Lesbarkeit bei hellem Hallenlicht und im Dunkeln.
Der aktuelle Viewport-Meta-Tag setzt `maximum-scale=1.0, user-scalable=no` und verhindert
Zoom — das ist ein Zugänglichkeitsdefekt und beim Umbau zu beheben.
