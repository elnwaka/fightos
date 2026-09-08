/* Periodisierung als Daten. Siehe js/content.js fuer die Bausteine.
   Berechnet und deshalb nur als Platzhalter: der 10-Wochen-Zeitstrahl
   und der Phasen-Zyklus, der die laufende Phase hervorhebt.

   Die beiden tt()-Tooltips der alten Fassung sind aufgeloest: PAPE und
   Superkompensation stehen jetzt als eigene Erklaerkarten. Auf dem Handy
   gibt es kein Ueberfahren, ein Tooltip waere dort unerreichbar.

   Die ids sind fest. Sie stehen in geteilten Links, also bleiben sie,
   auch wenn Abschnitte umsortiert werden. */

Content.define('periodisierung', {
  title: 'Periodisierung',
  sub: 'Amateur-Boxen heißt variable Kampfabstände. Kein starrer Vier-Wochen-Plan, dein Training passt sich dem nächsten Kampf an.',

  intro: [
    /* Der Zeitstrahl selbst ist berechnet: welche Woche laeuft, welche
       Deload-Wochen schon vorbei sind. Die Woerter drumherum sind es
       nicht, die stehen deshalb hier und nicht im Renderer. Sichtbar ist
       der Block nur fuer Nutzer im 10-Wochen-Programm, das entscheidet
       die Darstellung. */
    { t: 'dyn', id: 'timeline10w',
      title: '10-Wochen-Programm',
      text: 'Periodisiertes Kraft-, Conditioning- und Movement-Programm. 3:1-Loading-Pattern: drei Wochen aufbauen, eine Woche Deload. Woche 4 und Woche 8 sind Erholungswochen mit reduziertem Volumen.',
      legend: [
        { label: 'Grundlagen, Woche 1 bis 3', text: 'Kraft A und B: KB Sumo Deadlift, Goblet Squat, Press-Ups, Shoulder Press, dazu Core Circuit.' },
        { label: 'Kraft-Schnelligkeit, Woche 4 bis 7', text: 'Trap Bar Deadlift, Landmine Squat, DB Floor Press, dazu erweitertes plyometrisches Warm-Up.' },
        { label: 'Spitzenleistung, Woche 8 bis 9', text: 'Banded KB Swing, Landmine Punch Throw, MB Box Jumps. Maximale Explosivität.' },
        { label: 'Taper, Woche 10', text: 'Volumen −50 %, Intensität beibehalten. Fitness erhalten, Ermüdung abbauen.' }
      ],
      conditioning: [
        { label: 'Woche 1 bis 3', text: 'Muscle Buffering, ein- bis zweiminütige Intervalle bei RPE 7 bis 8.' },
        { label: 'Woche 4 bis 7', text: 'HIIT für zentrale Adaptationen, 4 Minuten über 90 % der maximalen Herzfrequenz.' },
        { label: 'Woche 8 bis 10', text: 'Speed Endurance, 15 bis 20 Sekunden Sprints, kampfspezifisch.' }
      ] },
    { t: 'note', id: 'amateur-profi', tone: 'sci', title: 'Amateur gegen Profi',
      text: 'Profis haben Drei-Monats-Camps mit wochenlangem Taper. Im Amateur-Boxen kämpfst du teils jede Woche, alle zwei Wochen, oder dreimal am Meisterschafts-Wochenende. Dein System muss <strong>flexibel</strong> sein: kein starrer Zyklus, sondern Anpassung je nach Kampfabstand.' }
  ],

  sections: [

    { id: 'peri-s1', title: 'Phasen-Zyklus', accent: 'red', blocks: [
      /* Welche der vier Phasen gerade laeuft, entscheidet das Kampfdatum.
         Berechnet ist deshalb nur die Auswahl, nicht der Inhalt: die
         Phasen stehen als items am Block und landen damit im Text-Index
         und in der Suche. */
      { t: 'dyn', id: 'phaseCycle', items: [
        { id: 'training', when: '4+ Tage', name: 'Normales Training', fill: 90, tone: 'gruen',
          details: ['Volles Programm', 'S&C: 3× morgens', 'Sparring: hart',
                    'Ausdauer: Zone 2 und SIT', 'BET, IMT, Nacken: täglich'] },
        { id: 'schaerfen', when: '2 bis 3 Tage', name: 'Schärfen', fill: 60, tone: 'blau',
          details: ['Volumen −30 %', 'Intensität 100 %', 'S&C: 1× leicht',
                    'Sparring: taktisch, leicht', 'Kurze explosive Reize'] },
        { id: 'kampftag', when: '1 bis 2 Tage', name: 'Kampf-Modus', fill: 30, tone: 'rot',
          details: ['Kein Training', 'Mobility und Stretching', 'Gewicht machen',
                    'Mental: Visualisierung', 'PAPE-Warm-Up am Kampftag'] },
        { id: 'recovery', when: 'Nach dem Kampf', name: 'Recovery', fill: 40, tone: 'gruen',
          details: ['24 bis 48 Stunden Pause', 'Leichtes Zone-2-Cardio', 'Kältebad oder Sauna',
                    'Extra Protein und Schlaf', 'Dann zurück ins Training'] }
      ] },
      { t: 'note', id: 'schaerfen-kein-taper', tone: 'info', title: 'Schärfen ist kein Taper',
        text: 'Profis tapern über ein bis zwei Wochen. Du als Amateur schärfst nur zwei bis drei Tage. Weniger Volumen, gleiche Intensität: kurze explosive Reize halten dein Nervensystem scharf, ohne dich zu ermüden. Bis vier Tage vor dem Kampf trainierst du normal weiter.' }
    ] },

    { id: 'peri-s2', title: 'Szenarien und Warm-Up', accent: 'gold', blocks: [

      { t: 'card', id: 'szenarien', title: 'Szenarien, so planst du', accent: 'red', blocks: [
        { t: 'h', text: 'Kampf jede Woche' },
        { t: 'p', text: 'Montag bis Mittwoch volles Training, Donnerstag schärfen, Freitag oder Samstag Kampf, Sonntag Recovery. Kein separater S&C-Tag: integriere Kraft ins Boxtraining über Medizinball-Würfe und Sprünge im Warm-Up.' },
        { t: 'h', text: 'Kampf alle zwei Wochen' },
        { t: 'p', text: 'Woche 1: volles Programm mit S&C dreimal, hartem Sparring, voller Ausdauer. Woche 2: Montag bis Mittwoch normal, Donnerstag schärfen, Freitag oder Samstag Kampf, Sonntag Recovery.' },
        { t: 'h', text: 'Kampf einmal im Monat' },
        { t: 'p', text: 'Drei Wochen volles Training mit progressiver Steigerung im S&C. Letzte Woche: Montag bis Mittwoch normal, Donnerstag schärfen, Freitag oder Samstag Kampf, Sonntag Recovery.' },
        { t: 'h', text: 'Meisterschaft, drei Kämpfe in zwei Tagen' },
        { t: 'p', text: 'Normale Woche bis Mittwoch, Donnerstag schärfen. Freitag und Samstag zwischen den Kämpfen: leichtes Schattenboxen, PAPE-Warm-Up vor jedem Kampf, Kohlenhydrate und Elektrolyte dazwischen. Sonntag volle Recovery.' }
      ] },

      { t: 'note', id: 'was-ist-pape', tone: 'sci', title: 'Was PAPE bedeutet',
        text: 'Post-Activation Performance Enhancement. Eine schwere Übung aktiviert dein Nervensystem. Nach acht bis zwölf Minuten Pause bist du explosiver als normal, wie ein Motor, der warmgelaufen ist.' },

      { t: 'card', id: 'pape-protokoll', title: 'PAPE-Warm-Up am Kampftag', accent: 'gold', blocks: [
        { t: 'p', text: 'Post-Activation Performance Enhancement steigert die Schlagkraft um <strong>5 bis 8 Prozent</strong>.' },
        { t: 'h', text: 'Protokoll, 45 Minuten vor dem Ring' },
        { t: 'list', ordered: true, items: [
          '3×3 schwere Box Squats bei 80 % des Einer-Maximums',
          '<strong>Acht bis zwölf Minuten komplett ausruhen.</strong> Das ist der kritische Teil',
          '3×3 explosive Jump Squats',
          'Drei Minuten leichtes Schattenboxen'
        ] },
        { t: 'p', text: 'Die Pause zwischen Lift und Ring entscheidet: zu kurz bedeutet Ermüdung, zu lang und der Effekt ist weg.' },
        { t: 'p', text: '<strong>Bei einer Meisterschaft</strong> wiederholst du PAPE vor jedem Kampf. Zwischen den Kämpfen: Kohlenhydrate, Elektrolyte, leicht bewegen.' }
      ] }
    ] },

    { id: 'peri-s3', title: 'Aufwärm-Protokoll', accent: 'red', blocks: [
      { t: 'card', id: 'warmup-komplett', title: 'Vom Ankommen bis zum Ring', accent: 'red', blocks: [
        { t: 'p', text: '<strong>45 bis 60 Minuten vor dem Kampf</strong> startest du das Warm-Up.' },
        { t: 'h', text: 'Phase 1 — Aktivierung, 10 Minuten' },
        { t: 'list', items: [
          'Leichtes Seilspringen oder Joggen auf der Stelle, 3 Minuten',
          'Dynamisches Dehnen: Armkreise, Hüftöffner, Beinpendel, 3 Minuten',
          'Schulter-Aktivierung mit Band oder langsames Schattenboxen, 4 Minuten'
        ] },
        { t: 'h', text: 'Phase 2 — PAPE, 10 Minuten' },
        { t: 'list', items: [
          '3×3 schwere Squats oder Isometric Wall Push, 6 Sekunden × 4',
          'Acht bis zwölf Minuten <strong>komplett ruhen</strong>: hinsetzen, atmen, mental fokussieren'
        ] },
        { t: 'h', text: 'Phase 3 — Schärfen, 10 Minuten' },
        { t: 'list', items: [
          '3×3 explosive Jump Squats oder Sprünge',
          'Schattenboxen, zwei bis drei Runden: erst langsam, dann Tempo hochfahren',
          'Gameplan-Kombinationen zehnmal durchgehen'
        ] },
        { t: 'h', text: 'Phase 4 — Ring-Ready, 5 Minuten' },
        { t: 'list', items: [
          'Pratzen mit dem Trainer: ein bis zwei kurze Runden, nur Lieblingsschläge',
          'Box-Breathing 4-4-4-4, drei Runden',
          'Mundschutz rein, Handschuhe an, Vaseline',
          'Letzte Visualisierung: erste Kombination, Distanz, Rundenstrategie'
        ] },
        { t: 'note', id: 'warmup-fehler', tone: 'warn', title: 'Häufigster Fehler',
          text: 'Zu wenig aufgewärmt und kalt in den Ring, oder zu viel gemacht und schon müde. Finde dein Timing über Testläufe im Training, nicht am Kampftag.' }
      ] }
    ] },

    { id: 'peri-s4', title: 'Fortschritt und Strategie', accent: 'blue', blocks: [

      { t: 'card', id: 'fortschritt', title: 'Fortschritt trotz häufiger Kämpfe', blocks: [
        { t: 'p', text: 'Du wirst auch in der Wettkampfphase besser, wenn du es richtig machst.' },
        { t: 'list', ordered: true, items: [
          '<strong>Ring-Erfahrung.</strong> Jeder Kampf ist Hochintensitäts-Training mit echten Konsequenzen, das stärkste Lernen überhaupt.',
          '<strong>Kraft-Erhalt.</strong> S&C an trainingsfreien Morgen, zwei- bis dreimal pro Woche reicht zum Erhalt. Kraft-Bestleistungen nur in kampffreien Wochen.',
          '<strong>Taktik.</strong> Kampfvideo-Analyse nach jedem Kampf. Was hat funktioniert, was nicht? Das nächste Training gezielt anpassen.',
          '<strong>Auxiliary-Training weiterführen.</strong> IMT, Nacken, BET und visuelles Training verbessern dich ohne Erholungsbedarf. Täglich möglich.',
          '<strong>Technische Arbeit.</strong> Zwischen den Kämpfen Technik schleifen: frischer Körper bedeutet bessere motorische Anpassung.'
        ] },
        { t: 'note', id: 'faustregel', tone: 'info', title: 'Faustregel',
          text: 'Trainiere so hart wie möglich, solange der nächste Kampf noch fünf oder mehr Tage weg ist. Danach nur noch schärfen.' }
      ] },

      { t: 'card', id: 'rundenstrategie', title: 'Rundenstrategie, 3×3 Minuten Amateur', blocks: [
        { t: 'h', text: 'Runde 1 — Dominanz setzen' },
        { t: 'list', items: [
          'Jab sofort etablieren, zeig dass du da bist',
          'Distanz kontrollieren, Rhythmus finden',
          '70 bis 80 % Energie, nicht alles raushauen',
          'Gegner lesen: Ausleger oder Infighter? Tempo? Tells?',
          '<strong>Ziel:</strong> Runde klar gewinnen, die Richter überzeugen'
        ] },
        { t: 'h', text: 'Runde 2 — anpassen und drücken' },
        { t: 'list', items: [
          'Was hat funktioniert? Mehr davon. Was nicht? Ablegen',
          'Jetzt Kombinationen: Jab, Cross, Hook, nicht nur Einzelschläge',
          'Körpertreffer setzen, die zahlen sich in Runde 3 aus',
          '80 bis 90 % Energie, gezielt aggressiv',
          '<strong>Bei Rückstand:</strong> höheres Volumen, Ringmitte erzwingen',
          '<strong>Bei Vorsprung:</strong> sauber weiterboxen, keine Geschenke'
        ] },
        { t: 'h', text: 'Runde 3 — alles geben' },
        { t: 'list', items: [
          'Der letzte Eindruck zählt doppelt, Richter erinnern Runde 3 am stärksten',
          '100 % Energie, nichts aufsparen',
          'Saubere Kombinationen schlagen wilde Schwinger',
          'Letzte 30 Sekunden nochmal alles mobilisieren',
          '<strong>Bei Rückstand:</strong> du brauchst ein klares Statement. Druck machen, nicht warten',
          '<strong>Bei Vorsprung:</strong> defensiv sauber bleiben, kontern, nicht weglaufen. Richter werten Aktivität'
        ] }
      ] },

      { t: 'note', id: 'superkompensation', tone: 'sci', title: 'Superkompensation',
        text: 'Nach einer Trainingsbelastung sinkt deine Leistung kurzzeitig, das ist die Ermüdung. In der Erholungsphase steigt sie über das Ausgangsniveau, und das ist der Moment für den nächsten Reiz. Dein Körper adaptiert also nach dem Training, nicht währenddessen. Bei häufigen Kämpfen ist die Erholungsphase kürzer, deshalb sind Schlaf, Ernährung und aktive Regeneration umso wichtiger.' },

      { t: 'note', id: 'detraining', tone: 'sci', title: 'Detraining',
        text: 'Leistungsverlust durch zu lange Pause. Beginnt nach fünf bis sieben Tagen ohne Reiz, Ausdauer geht schneller verloren als Kraft. Bei häufigen Kämpfen ist das kein Problem: du bekommst ständig neue Reize.' }
    ] }
  ]
});
