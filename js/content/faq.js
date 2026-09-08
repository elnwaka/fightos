/* Haeufige Fragen als Daten. Siehe js/content.js fuer die Bausteine.

   Erzeugt aus faqData in js/pages.js. Jede Frage ist ein eigener
   Abschnitt: damit steht sie in der Kapitelliste, ist einzeln
   verlinkbar, und auf dem Telefon liest man nicht 18 Antworten am
   Stueck durch, um die eine zu finden.

   Die ids kommen aus der Frage und sind fest. */

Content.define('faq', {
  title: 'Häufige Fragen',
  sub: 'Was Boxer am häufigsten fragen, kurz beantwortet.',
  related: ['ernaehrung', 'periodisierung', 'regeneration'],
  sections: [
    {
      id: 'muss-ich-gewichte-heben-macht-das-nicht-lang',
      title: 'Muss ich Gewichte heben? Macht das nicht langsamer?',
      blocks: [
        {
          t: 'p',
          text: '<strong>Nein – das ist ein Mythos aus den 1970ern.</strong> Modernes Krafttraining mit explosiven Bewegungen (Jump Squats, Landmine Press, Med Ball) verbessert nachweislich Schlaggeschwindigkeit und -kraft.'
        },
        {
          t: 'p',
          text: 'Was langsamer macht: Bodybuilding (hohe Reps, langsam, isoliert). Was schneller macht: explosives, spezifisches Krafttraining wie im Plan.'
        },
        {
          t: 'p',
          text: 'Studien zeigen: Elite-Boxer mit S&C haben messbar mehr Punch Force als rein boxend trainierende Athleten gleichen Niveaus.'
        }
      ]
    },
    {
      id: 'wie-viele-sparring-runden-sind-optimal',
      title: 'Wie viele Sparring-Runden sind optimal?',
      blocks: [
        { t: 'h', text: 'Qualität vor Quantität.' },
        {
          t: 'p',
          text: '<strong>Normale Trainingswoche:</strong> 6–10 harte Runden/Woche (1–2 Sessions)'
        },
        {
          t: 'p',
          text: '<strong>Kampf in 3–4 Tagen:</strong> Nur noch leichtes/technisches Sparring (60–70%), max. 4 Runden'
        },
        { t: 'p', text: '<strong>Kampf morgen/übermorgen:</strong> Kein Sparring mehr' },
        {
          t: 'p',
          text: 'Unterscheide: technisches Sparring (60–70%, Lernfokus) vs. Kampf-Sparring (80–90%). Zu viel hartes Sparring = Verletzungsrisiko + Übertraining. Bei wöchentlichen Kämpfen: Sparring nur Mo–Mi, dann Schärfen.'
        }
      ]
    },
    {
      id: 'verbessere-ich-mich-in-der-wettkampfphase',
      title: 'Verbessere ich mich in der Wettkampfphase?',
      blocks: [
        {
          t: 'p',
          text: '<strong>Ja!</strong> Im Amateur-Boxen trainierst du DURCH die Wettkampfphase – es gibt kein monatelanges Camp wie bei Profis.'
        },
        {
          t: 'p',
          text: '1. <strong>Ring-Erfahrung:</strong> Jeder Kampf = stärkstes Lernen überhaupt. Kein Sparring ersetzt echte Kämpfe'
        },
        {
          t: 'p',
          text: '2. <strong>Kampfanalyse:</strong> Nach jedem Kampf 3 Stärken + 3 Verbesserungen notieren → gezielt trainieren'
        },
        {
          t: 'p',
          text: '3. <strong>Technik schleifen:</strong> Zwischen den Kämpfen Schwächen gezielt an Pratzen und im konditionalem Sparring trainieren'
        },
        {
          t: 'p',
          text: '4. <strong>Auxiliary weiter:</strong> IMT, Nacken, BET, Visualisierung – alles täglich ohne Erholungsbedarf'
        },
        {
          t: 'p',
          text: '5. <strong>S&C erhalten:</strong> 2–3× Morgentraining reicht für Kraft-Erhalt, PRs nur in kampffreien Wochen'
        }
      ]
    },
    {
      id: 'wie-wichtig-ist-ernaehrung-wirklich',
      title: 'Wie wichtig ist Ernährung wirklich?',
      blocks: [
        { t: 'p', text: '<strong>Entscheidend.</strong> Häufigste Defizite:' },
        {
          t: 'list',
          items: [
            '<strong>Zu wenig Protein:</strong> Durchschnitt ~1.0g/kg, Bedarf 2.2g/kg – mehr als das Doppelte!',
            '<strong>Falsches Timing:</strong> Großes Frühstück, kaum Mittag, Riesenportion abends = kein Glykogen',
            '<strong>Dehydration:</strong> 2% = 20% weniger Ausdauer',
            '<strong>Nährstoffmängel:</strong> Vitamin D, Magnesium, Zink'
          ]
        },
        { t: 'p', text: 'Test: Tracke 3 Tage mit MyFitnessPal. Die meisten sind erschüttert.' }
      ]
    },
    {
      id: 'nur-30-minuten-was-bringt-am-meisten',
      title: 'Nur 30 Minuten – was bringt am meisten?',
      blocks: [
        { t: 'h', text: 'Priorisiere' },
        { t: 'p', text: '1. HRV messen (5 Min.)' },
        { t: 'p', text: '2. IMT (5 Min.) – höchster Return on Time' },
        { t: 'p', text: '3. Overcoming Isometrics (10 Min.) – max. ZNS-Aktivierung' },
        { t: 'p', text: '4. Jump Squats 4×4 (10 Min.)' },
        {
          t: 'p',
          text: '<strong>30 konsistente Minuten täglich schlagen 3 Stunden 3×/Woche.</strong> Konsistenz ist der unterschätzte Vorteil.'
        }
      ]
    },
    {
      id: 'niedriger-hrv-trotzdem-trainieren',
      title: 'Niedriger HRV – trotzdem trainieren?',
      blocks: [
        { t: 'h', text: 'Kommt drauf an' },
        {
          t: 'p',
          text: '<strong>1 roter Tag:</strong> Training machen, aber 60–70%. Zone 2, Technik, Mobility.'
        },
        { t: 'p', text: '<strong>2 rote Tage:</strong> Intensiv pausieren, nur leichte Bewegung.' },
        {
          t: 'p',
          text: '<strong>3+ rote Tage:</strong> Komplette Ruhe. Ursache suchen: Schlaf, Stress, Krankheit?'
        },
        { t: 'p', text: 'Einzelwerte sind weniger aussagekräftig als der 7-Tage-Trend.' }
      ]
    },
    {
      id: 'kreatin-ja-oder-nein-fuer-boxer',
      title: 'Kreatin – ja oder nein für Boxer?',
      blocks: [
        { t: 'h', text: 'Ja, mit strategischem Timing.' },
        {
          t: 'list',
          items: [
            'Schnellere PCr-Resynthese zwischen Kombis',
            '+12% Peakpower',
            'Bessere Regeneration zwischen Sparring-Runden',
            'Möglicherweise neuroprotektiv'
          ]
        },
        {
          t: 'p',
          text: '<strong>Wann NICHT:</strong> 4–6 Wochen vor Wiegen pausieren (1–2 kg Wasser). Nach dem Wiegen wieder starten.'
        }
      ]
    },
    {
      id: 'wie-lange-bis-verbesserungen-sichtbar',
      title: 'Wie lange bis Verbesserungen sichtbar?',
      blocks: [
        { t: 'p', text: '<strong>2–4 Wochen:</strong> IMT, besserer Schlaf, mehr Energie' },
        { t: 'p', text: '<strong>4–8 Wochen:</strong> Nackendicke messbar, BET-Effekte' },
        { t: 'p', text: '<strong>8–12 Wochen:</strong> Kraft +15–25%, VO₂max sichtbar' },
        { t: 'p', text: '<strong>6 Monate:</strong> Ring-IQ deutlich besser, Runde-3-Dominanz' },
        { t: 'p', text: '<strong>12+ Monate:</strong> Fundamentale Transformation' },
        { t: 'p', text: 'Fortschritt ist nicht linear. Plateaus = Adaptation, nicht Stillstand.' }
      ]
    },
    {
      id: 'landeskader-vs-nationalkader-was-fehlt',
      title: 'Landeskader vs. Nationalkader – was fehlt?',
      blocks: [
        { t: 'h', text: 'Nicht primär Talent – sondern Struktur' },
        {
          t: 'list',
          items: [
            '<strong>Trainingsvolumen:</strong> 25–35 Std./Wo vs. 12–15 Std.',
            '<strong>Coaching:</strong> Bundesstützpunkt mit A-Lizenz-Trainern, Physio, Sportpsychologe',
            '<strong>Kämpfe:</strong> 80–150+ vs. 10–30',
            '<strong>Sportförderung:</strong> Bundeswehr/Zoll – bezahlte Stelle + Freistellung'
          ]
        },
        {
          t: 'p',
          text: 'Weg dahin: Landesverband-Trainer fragen wegen Empfehlung zur Sportfördergruppe.'
        }
      ]
    },
    {
      id: 'vollzeitjob-und-nationalebene-realistisch',
      title: 'Vollzeitjob und Nationalebene – realistisch?',
      blocks: [
        { t: 'h', text: 'Ehrliche Antwort: Extrem schwierig, aber nicht unmöglich.' },
        {
          t: 'p',
          text: 'Der Trainingsplan macht dich zum bestmöglichen Athleten unter deinen Bedingungen. Der Gap zu Vollzeit-Athleten lässt sich durch Effizienz teilweise, aber nicht vollständig schließen.'
        },
        {
          t: 'p',
          text: '<strong>Realistischer Pfad:</strong> Konsistent performen → Deutsche Meisterschaften → Sportfördergruppe beantragen → dann Vollzeit-Training möglich.'
        }
      ]
    },
    {
      id: 'wie-oft-sollte-ich-wettkaempfe-haben',
      title: 'Wie oft sollte ich Wettkämpfe haben?',
      blocks: [
        { t: 'h', text: 'Hängt von der Phase ab' },
        {
          t: 'list',
          items: [
            '<strong>Aufbauphase:</strong> Alle 4–6 Wochen, genug Zeit zum Trainieren',
            '<strong>Wettkampfphase:</strong> Alle 2–3 Wochen möglich mit angepasstem Training',
            '<strong>Meisterschafts-Vorbereitung:</strong> 2–3 Vorbereitungskämpfe in den 8 Wochen davor'
          ]
        },
        {
          t: 'p',
          text: 'Generell: Mehr Kämpfe = mehr Ring-Erfahrung = schnellere Entwicklung. Aber ohne Training dazwischen keine Verbesserung.'
        }
      ]
    },
    {
      id: 'bfr-training-ist-das-sicher',
      title: 'BFR Training – ist das sicher?',
      blocks: [
        {
          t: 'p',
          text: '<strong>Ja, bei korrekter Anwendung.</strong> Tausende Studien ohne schwere Nebenwirkungen. Aber:'
        },
        {
          t: 'list',
          items: [
            'Okklusion max. 50% (nicht 80%+!)',
            'Spezielle BFR-Bänder verwenden (nicht improvisieren)',
            'Bei Taubheit oder Schmerz sofort lösen',
            'Nicht bei Blutgerinnungsstörungen oder Bluthochdruck',
            'Post-Training, nicht als Aufwärmung'
          ]
        }
      ]
    },
    {
      id: 'soll-ich-morgens-nuechtern-trainieren',
      title: 'Soll ich morgens nüchtern trainieren?',
      blocks: [
        { t: 'h', text: 'Nein – für Boxer kontraproduktiv.' },
        {
          t: 'p',
          text: 'Nüchterntraining senkt die Trainingsqualität bei Intensität >70%. Und Boxen braucht Glykogen. Ein kleiner Snack (Banane + EL Erdnussbutter) 30 Min. vorher reicht – kein volles Frühstück nötig.'
        },
        { t: 'p', text: 'Ausnahme: Reines Zone-2-Cardio (Fahrrad zur Arbeit) geht nüchtern.' }
      ]
    },
    {
      id: 'wie-wichtig-ist-dehnen-wirklich',
      title: 'Wie wichtig ist Dehnen wirklich?',
      blocks: [
        {
          t: 'p',
          text: '<strong>Statisches Dehnen VOR Training: schlecht.</strong> Senkt Kraft und Power für 30–60 Min.'
        },
        {
          t: 'p',
          text: '<strong>Dynamisches Aufwärmen VOR Training: wichtig.</strong> Armkreise, Beinpendel, Hüftöffner.'
        },
        {
          t: 'p',
          text: '<strong>Statisches Dehnen NACH Training: optional.</strong> Hilft bei Wohlbefinden, wenig Evidenz für Verletzungsprävention.'
        },
        {
          t: 'p',
          text: '<strong>Was wirklich hilft:</strong> Foam Rolling + Mobility (Hip 90/90, T-Spine Rotation) – verbessert Bewegungsqualität.'
        }
      ]
    },
    {
      id: 'was-mache-ich-wenn-ich-krank-bin',
      title: 'Was mache ich wenn ich krank bin?',
      blocks: [
        { t: 'h', text: '"Neck Check"' },
        {
          t: 'list',
          items: [
            'Symptome nur oberhalb des Halses (Schnupfen, leichte Halsschmerzen): Leichtes Training OK, 60% Intensität',
            'Symptome unterhalb des Halses (Husten, Fieber, Gliederschmerzen): KEIN Training bis symptomfrei'
          ]
        },
        {
          t: 'p',
          text: 'Nach Krankheit: 1 Tag pro Krankheitstag zur Rückkehr. 5 Tage krank = 5 Tage aufbauend zurückkommen. Sofort voll einsteigen = Rückfall-Risiko.'
        }
      ]
    },
    {
      id: 'handgelenk-tut-weh-nach-dem-sparring-was-tun',
      title: 'Handgelenk tut weh nach dem Sparring – was tun?',
      blocks: [
        { t: 'h', text: 'Häufigste Verletzung im Boxen.' },
        {
          t: 'p',
          text: '<strong>Sofort:</strong> Kühlen (15 Min.), Kompression, Pause. Keine Schmerzmittel zum Weitertrainieren – das maskiert nur die Warnung.'
        },
        { t: 'h', text: 'Ursachen meist' },
        {
          t: 'list',
          items: [
            '<strong>Falsche Bandagen:</strong> Handgelenk muss fixiert sein, Knöchel gepolstert. Wickeltechnik vom Trainer zeigen lassen!',
            '<strong>Schlechte Schlagtechnik:</strong> Treffer mit gekipptem Handgelenk statt gerader Linie (Schulter-Ellbogen-Faust)',
            '<strong>Falsche Trefferfläche:</strong> Mit den letzten zwei Knöcheln statt den ersten zwei getroffen'
          ]
        },
        {
          t: 'p',
          text: '<strong>Wann zum Arzt:</strong> Schwellung die nicht zurückgeht, Schmerz beim Greifen nach 48h, Taubheitsgefühl. Lieber einmal zu viel als zu wenig – Handgelenk-Frakturen heilen schlecht wenn zu spät erkannt.'
        },
        {
          t: 'p',
          text: '<strong>Prävention:</strong> Bandagen korrekt wickeln, Rice Bucket Training 3×/Woche, Handgelenk-Curls.'
        }
      ]
    },
    {
      id: 'uebertraining-wie-erkenne-ich-es',
      title: 'Übertraining – wie erkenne ich es?',
      blocks: [
        { t: 'h', text: 'Warnsignale' },
        {
          t: 'list',
          items: [
            'HRV dauerhaft unter Baseline (3+ rote Tage)',
            'Ruhepuls morgens +5 bpm über Normal',
            'Leistungsabfall trotz guten Trainings',
            'Schlafstörungen trotz Müdigkeit',
            'Stimmungsschwankungen, Motivation ↓',
            'Häufige kleine Verletzungen / Erkältungen'
          ]
        },
        {
          t: 'p',
          text: '<strong>Lösung:</strong> 5–7 Tage komplette Ruhe. Dann langsam aufbauen. Lieber 1 Woche Pause als 3 Monate Verletzung.'
        }
      ]
    },
    {
      id: 'wie-trainiere-ich-die-letzten-tage-vor-dem-k',
      title: 'Wie trainiere ich die letzten Tage vor dem Kampf?',
      blocks: [
        { t: 'h', text: 'Nur 2–3 Tage Anpassung – kein wochenlanges Taper!' },
        { t: 'h', text: 'Kampf am Samstag – Beispiel' },
        {
          t: 'list',
          items: [
            'Mo–Mi: Normales Training, hartes Sparring OK bis einschließlich Mittwoch',
            'Do: Schärfen – Pratzen (Gameplan-Kombis), Shadow Boxing, Visualisierung. Kurz + intensiv, kein Volumen',
            'Fr: Nur Mobility, Visualisierung, Equipment packen, früh schlafen',
            'Sa: PAPE Warm-up, Kampf'
          ]
        },
        {
          t: 'p',
          text: '<strong>Kampf schon Donnerstag?</strong> Di = Schärfen, Mi = Ruhe, Do = Kampf. Anpassung ist immer nur 2–3 Tage, egal wann der Kampf ist.'
        }
      ]
    }
  ]
});
