/* Mentaltraining als Daten. Siehe js/content.js fuer die Bausteine.

   Der Inhalt lag schon als Feld MENTAL_SECTIONS in js/pages.js vor, nur
   der Rumpf jedes Eintrags war HTML. Diese Datei ist daraus erzeugt, die
   Kapitel-ids sind die alten und bleiben.

   Zwei Platzhalter:
   - alterEgoForm ist das Eingabefeld fuer die eigene Kampf-Identitaet.
   - mentalProtokoll ist der Tagesablauf. Er traegt {ego} im Text: das
     ist kein gerechneter Wert, sondern der selbst vergebene Name. Steht
     keiner, setzt der Renderer den allgemeinen Begriff ein.

   Vor dem Umbau geprueft: keine Gewichtsrechnung, keine Tooltips, keine
   nachgerenderten Inhaltsbloecke. Der einzige leere Container ist die
   Rueckmeldung des Formulars. */

Content.define('mental', {
  title: 'Mentaltraining',
  sub: 'Neunzig Prozent des Kampfes passieren im Kopf, und genau das ist trainierbar.',
  related: ['regeneration', 'periodisierung', 'ernaehrung'],
  intro: [
    {
      t: 'note',
      id: 'tyson',
      tone: 'info',
      title: 'Mike Tyson',
      text: 'Everybody has a plan until they get punched in the mouth.'
    },
    {
      t: 'dyn',
      id: 'alterEgoForm',
      title: 'Dein Alter Ego',
      text: 'Wer bist du im Ring? Leg hier deine Kampf-Identität an, dann taucht sie im Protokoll und in den Anleitungen auf.',
      felder: [
        { id: 'name', label: 'Name', beispiel: 'Iron Wolf, Black Mamba' },
        { id: 'traits', label: 'Eigenschaften', beispiel: 'furchtlos, explosiv, geduldig' },
        { id: 'totem', label: 'Totem', beispiel: 'Mundschutz einsetzen, Kapuze auf' }
      ],
      knopf: 'Alter Ego speichern'
    }
  ],
  sections: [
    {
      id: 'alter-ego',
      title: 'Alter Ego',
      sub: 'Deine Kampf-Identität',
      blocks: [
        {
          t: 'p',
          text: 'Das Alter-Ego-Konzept (Todd Herman, „The Alter Ego Effect") ist eines der wirksamsten mentalen Werkzeuge im Kampfsport. Beyoncé wird zu „Sasha Fierce" bevor sie auf die Bühne geht. Kobe Bryant wurde zu „Black Mamba" – kaltblütig, emotionslos, tödlich effizient. Mike Tyson war im Alltag schüchtern und unsicher – aber als „Iron Mike" betrat er den Ring mit der Überzeugung, unzerstörbar zu sein. <strong>Du erschaffst eine bewusste Kampf-Version von dir selbst</strong> – mit Eigenschaften, die du im Ring brauchst, aber im Alltag vielleicht nicht zeigst.'
        },
        {
          t: 'p',
          text: '<strong>Warum funktioniert das?</strong> Psychologische Distanzierung (Kross et al. 2014): Wenn du in der 3. Person über dich sprichst oder eine andere Identität annimmst, reduziert dein Gehirn die emotionale Reaktivität um ~30%. Du trennst dein verletzliches Alltags-Ich von deinem furchtlosen Ring-Ich. Angst, Selbstzweifel und Nervosität gehören zu „dir" – nicht zu deinem Alter Ego.'
        },
        {
          t: 'note',
          id: 'alter-ego-warum',
          tone: 'sci',
          title: 'Warum das wirkt',
          text: 'Reale Beispiele: Deontay Wilder zieht sein Kostüm an und wird zum „Bronze Bomber" – die theatralische Verwandlung IST der psychologische Switch. Oleksandr Usyk meditiert und wird ruhig wie ein Mönch, aber im Ring verwandelt er sich in einen aggressiven Druck-Boxer. Vasyl Lomachenko tanzt vor dem Kampf – das ist sein Totem, sein Übergang in den „Matrix"-Modus wo er Schläge sieht bevor sie kommen.'
        },
        {
          t: 'card',
          id: 'alter-ego-1',
          title: 'Schritt 1 – Schwächen-Audit',
          blocks: [
            {
              t: 'p',
              text: 'Schreib 3 Dinge auf, die dich im Ring limitieren. Angst vor Treffern? Zu passiv? Keine Killer-Instinkt? Wirst du nervös wenn der Gegner aggressiv wird? Dein Alter Ego ist die ANTWORT auf diese Schwächen – es hat genau die Eigenschaften die dir fehlen.'
            }
          ]
        },
        {
          t: 'card',
          id: 'alter-ego-2',
          title: 'Schritt 2 – Eigenschaften wählen',
          blocks: [
            {
              t: 'p',
              text: 'Wähle 3–5 Kernwörter die dein Alter Ego beschreiben. Nicht generisch („stark") sondern spezifisch und emotional. Beispiele: „Eiskalt unter Druck", „Explosiv wie ein Raubtier", „Unendliche Geduld – wartet auf den perfekten Moment", „Genießt den Schmerz", „Furchtlos im Nahkampf". Schreib die Wörter auf einen Zettel und häng ihn an deinen Spiegel.'
            }
          ]
        },
        {
          t: 'card',
          id: 'alter-ego-3',
          title: 'Schritt 3 – Namen geben',
          blocks: [
            {
              t: 'p',
              text: 'Der Name muss DICH triggern – niemand sonst muss ihn verstehen. Kann ein Tier sein (Iron Wolf, Black Cobra), ein Titel (The Machine, El Diablo), ein Charakter (Spartan, Ronin), oder ein verdrehter eigener Name. Test: Wenn du den Namen laut aussprichst und dabei NICHTS fühlst → anderer Name. Du musst eine körperliche Reaktion spüren – Gänsehaut, Anspannung, Energie.'
            }
          ]
        },
        {
          t: 'card',
          id: 'alter-ego-4',
          title: 'Schritt 4 – Totem wählen',
          blocks: [
            {
              t: 'p',
              text: 'Ein physischer Gegenstand oder eine Handlung die den Switch auslöst. Tyson biss auf seinen Mundschutz und wurde zu Iron Mike. Wilder setzte seine Maske auf. Lomachenko dreht seinen Ring. DEIN Totem: Mundschutz einsetzen, Kapuze aufziehen, Handschuhe anziehen, Bandagen wickeln – wähle EINE Handlung die du VOR JEDEM Sparring und Kampf machst. Ab jetzt ist diese Handlung dein An/Aus-Schalter.'
            }
          ]
        },
        {
          t: 'card',
          id: 'alter-ego-5',
          title: 'Schritt 5 – Origin Story schreiben',
          blocks: [
            {
              t: 'p',
              text: 'Dein Alter Ego braucht eine Hintergrundgeschichte – 5–10 Sätze reichen. Beispiel: „Iron Wolf wurde in der Kälte geboren. Aufgewachsen in einem Rudel das nie aufgibt. Er kennt keinen Schmerz, nur den Instinkt zu jagen. Jeder Gegner ist Beute. Er wird nicht müde – er wird hungriger. Wenn er getroffen wird, lacht er. Der Wolf stirbt kämpfend, niemals fliehend." – Klingt übertrieben? Genau das ist der Punkt. Je dramatischer und emotionaler, desto stärker der psychologische Effekt.'
            }
          ]
        },
        {
          t: 'card',
          id: 'alter-ego-6',
          title: 'Schritt 6 – Switch trainieren',
          blocks: [
            {
              t: 'p',
              text: 'Wie jede Technik muss der Switch geübt werden. Protokoll: (1) Vor jedem Training 30 Sek. Augen zu, Origin Story im Kopf durchgehen. (2) Totem-Handlung ausführen. (3) In 3. Person sagen: „[Name] betritt den Ring. [Name] ist bereit." (4) Training beginnen. (5) NACH dem Training: Totem ablegen, bewusst zurück ins Alltags-Ich. Der Wechsel in BEIDE Richtungen ist wichtig – du willst nicht 24/7 in deinem Alter Ego leben.'
            }
          ]
        },
        {
          t: 'card',
          id: 'alter-ego-7',
          title: 'Schritt 7 – Verfeinerung',
          blocks: [
            {
              t: 'p',
              text: 'Nach 2–3 Wochen: Was funktioniert? Passt der Name noch? Sind die Eigenschaften die richtigen? Dein Alter Ego darf sich entwickeln. Schreib nach jedem Sparring 1 Satz: „Heute war [Name]..." und beende den Satz ehrlich. So trackst du ob die Identität stärker wird.'
            }
          ]
        }
      ]
    },
    {
      id: 'resilienz',
      title: 'Resilienz',
      sub: 'Nach Treffern zurückkommen',
      blocks: [
        {
          t: 'p',
          text: 'Der entscheidende Moment in vielen Kämpfen: Du wirst hart getroffen, gehst womöglich auf die Bretter. <strong>Was jetzt passiert, entscheidet den Kampf.</strong> Resilienz ist keine Eigenschaft, die du hast oder nicht – sie wird systematisch aufgebaut. Lennox Lewis wurde von Oliver McCall und Hasim Rahman KO geschlagen – und kam beide Male zurück und gewann den Rückkampf. Muhammad Ali lag gegen Joe Frazier auf den Brettern und stand auf. Der Unterschied: Diese Boxer hatten einen trainierten mentalen Prozess für genau diese Momente.'
        },
        {
          t: 'note',
          id: 'resilienz-warum',
          tone: 'sci',
          title: 'Warum das wirkt',
          text: 'Progressive Desensitisierung: Du gewöhnst dich schrittweise an Drucksituationen, damit dein Kopf im Kampf nicht zum ersten Mal damit konfrontiert wird. Neurowissenschaftlich: Dein Amygdala (Angst-Zentrum) reagiert weniger stark auf bekannte Stressoren. Je öfter du kontrollierten Druck erlebst, desto ruhiger bleibst du wenn es zählt.'
        },
        {
          t: 'card',
          id: 'resilienz-1',
          title: 'Stufe 1 – Druck aushalten',
          blocks: [
            {
              t: 'p',
              text: 'Leichtes Sparring mit überlegenem Partner. Fokus: Nicht gewinnen, sondern ruhig bleiben, Grundstellung halten, atmen. Konkret zum Trainer sagen: „Ich will 3 Runden mit jemandem der besser ist als ich. Mein Ziel ist nicht zu gewinnen – ich will meine Deckung halten und nicht in Panik verfallen." Nach jeder Runde: Auf einer Skala 1–10, wie ruhig warst du? Ziel: 7+ nach 4 Wochen.'
            }
          ]
        },
        {
          t: 'card',
          id: 'resilienz-2',
          title: 'Stufe 2 – Schmerztoleranz',
          blocks: [
            {
              t: 'p',
              text: 'Sparring mit Body Shots erlaubt, mittlere Intensität. Lerne, nach einem Treffer weiterzumachen statt zu erstarren. Die natürliche Reaktion auf Schmerz ist Freeze – das musst du überschreiben. Drill: Partner schlägt 3× auf Körper → du antwortest SOFORT mit Kombi. Nicht erst erholen, sofort antworten. Das trainiert die neuronale Verbindung: Treffer = sofortige Aktion statt Freeze.'
            }
          ]
        },
        {
          t: 'card',
          id: 'resilienz-3',
          title: 'Stufe 3 – Clutch-Performance',
          blocks: [
            {
              t: 'p',
              text: 'Situationssparring mit Szenarien. Trainer sagt vor der Runde: „Du bist 2 Runden hinten, letzte Runde. Du musst jetzt alles geben." Oder: „Du wurdest gerade angezählt, es sind noch 90 Sekunden." Oder: „Dein Gegner ist müde – jetzt Druck machen." Das trainiert Entscheidungsfähigkeit unter maximalem Ergebnis-Druck. 1× pro Woche mindestens.'
            }
          ]
        },
        {
          t: 'card',
          id: 'resilienz-4',
          title: 'Stufe 4 – Erschöpfungs-Entscheidungen',
          blocks: [
            {
              t: 'p',
              text: 'Sparring NACH hartem Conditioning (z.B. nach 10 Runden Sandsack oder 20 Min. HIIT). Dein Körper ist am Limit – jetzt muss dein Kopf übernehmen. Genau das passiert in Runde 3 eines harten Kampfes. Wenn du lernst, erschöpft saubere Entscheidungen zu treffen, hast du einen massiven Vorteil über Gegner die das nie trainieren.'
            }
          ]
        },
        {
          t: 'card',
          id: 'resilienz-5',
          title: 'Recovery-Protokoll (im Kampf anwenden)',
          blocks: [
            {
              t: 'p',
              text: 'Du wirst hart getroffen. Sofort-Protokoll: (1) Clinchen ODER 2 Schritte zurück – Distanz schaffen. (2) Box-Breathing: 1 Zyklus (4 Sek. ein, 4 Sek. aus) – reicht um den Puls 5–10 bpm zu senken. (3) Alter-Ego-Trigger: Auf Mundschutz beißen, Schultern zurück. (4) Jab ausstrecken – eine physische Handlung bricht die mentale Blockade. Danach: Zurück zum Gameplan. Nicht wild zurückschlagen – das ist der häufigste Fehler nach einem harten Treffer.'
            }
          ]
        },
        {
          t: 'card',
          id: 'resilienz-6',
          title: 'Langzeit-Resilienz aufbauen',
          blocks: [
            {
              t: 'p',
              text: 'Führe ein „Widrigkeits-Journal": Nach jedem Training/Sparring 1 Satz zu: „Was war heute schwer und wie habe ich reagiert?" Nach 3 Monaten hast du eine Sammlung von Momenten wo du Druck überstanden hast. Lies sie vor einem Kampf – konkreter Beweis dass du Druck kannst.'
            }
          ]
        }
      ]
    },
    {
      id: 'visualisierung',
      title: 'Visualisierung',
      sub: 'Motorisches Cortex-Training ohne Ring',
      blocks: [
        {
          t: 'p',
          text: 'Wenn du dir vorstellst, einen Cross zu schlagen, feuern <strong>dieselben motorischen Nervenbahnen</strong> wie beim echten Schlag (fMRI-belegt, ~30% der echten Aktivierung). Das PETTLEP-Modell (Holmes & Collins 2001) zeigt: <strong>+12–16% motorische Leistung</strong> durch strukturierte Visualisierung. Usyk visualisiert jeden Kampf dutzende Male bevor er stattfindet. Er sagt in Interviews: „Ich habe den Kampf schon gewonnen bevor ich den Ring betrete – in meinem Kopf."'
        },
        {
          t: 'p',
          text: 'Wichtig: Nicht einfach „an den Kampf denken". Es gibt 3 spezifische Arten die unterschiedliche Zwecke erfüllen, und die Qualität der Visualisierung macht den Unterschied.'
        },
        {
          t: 'note',
          id: 'visualisierung-warum',
          tone: 'sci',
          title: 'Warum das wirkt',
          text: 'PETTLEP steht für: Physical (gleiche Position wie im Ring), Environment (stell dir die Halle vor), Task (echte Technik, nicht Fantasie), Timing (echtes Tempo), Learning (wird besser mit Übung), Emotion (fühle die Aufregung), Perspective (Ich-Perspektive bevorzugt). Je mehr dieser 7 Elemente du einbaust, desto wirksamer.'
        },
        {
          t: 'card',
          id: 'visualisierung-1',
          title: 'Technik-Visualisierung (3 Min.)',
          blocks: [
            {
              t: 'p',
              text: 'Setz dich hin oder leg dich hin. Augen zu. Stell dir vor du stehst im Ring – DEIN Ring, DEIN Gym. Fühle den Boden unter deinen Füßen, rieche die Halle. Jetzt: Jab-Cross. Fühle wie dein linker Fuß sich dreht, die Schulter rotiert, die Faust den Kontakt macht. Höre das Geräusch. Zurück in die Deckung. Jetzt: Jab-Cross-Left Hook. In echtem Tempo, nicht Zeitlupe. 5–8 Wiederholungen pro Kombi. Dann nächste Kombi.'
            }
          ]
        },
        {
          t: 'card',
          id: 'visualisierung-2',
          title: 'Gegner-Visualisierung (2 Min.)',
          blocks: [
            {
              t: 'p',
              text: 'Studiere deinen Gegner vorher per Video (oder stelle dir einen typischen Gegner-Typ vor). Visualisiere seine Muster: „Er kommt immer mit dem rechten Cross nach vorne. Ich sehe es kommen → Slip nach links → linker Haken zum Körper → rechter Uppercut." Mache das 5× hintereinander. Variiere: „Er geht auf Distanz und jabt → ich mache Druck, double Jab → rechter Cross wenn er zurückgeht." Je spezifischer desto besser.'
            }
          ]
        },
        {
          t: 'card',
          id: 'visualisierung-3',
          title: 'Krisen-Visualisierung (2 Min.)',
          blocks: [
            {
              t: 'p',
              text: 'DER WICHTIGSTE TYP – den die meisten weglassen. Visualisiere: Du wirst hart getroffen. Alles wackelt. Dein Alter Ego übernimmt. Clinch → atmen → Jab raus → zurück im Kampf. Visualisiere: Du liegst auf den Brettern. Der Ref zählt. Du stehst bei 6 auf. Deckung prüfen, nicken, weiterkämpfen. Wer Niederlagen nur im Ring zum ersten Mal erlebt, bricht. Wer sie 50× im Kopf durchgespielt hat, hat einen Plan.'
            }
          ]
        },
        {
          t: 'card',
          id: 'visualisierung-4',
          title: 'Komplett-Protokoll (7 Min. vor dem Schlafen)',
          blocks: [
            {
              t: 'p',
              text: 'Position: Liegen oder sitzen, Augen zu, ruhiger Raum. Minute 1–3: Technik-Visu (3 Lieblingskombi). Minute 3–5: Gegner-Visu (seine Muster, deine Antworten). Minute 5–7: Krisen-Visu (hart getroffen werden + zurückkommen). WICHTIG: Jede Session endet POSITIV – visualisiere wie der Ref deinen Arm hebt. Dein Gehirn kann nicht unterscheiden ob etwas wirklich passiert ist – also lass es glauben dass du gewinnst.'
            }
          ]
        },
        {
          t: 'card',
          id: 'visualisierung-5',
          title: 'Häufige Fehler',
          blocks: [
            {
              t: 'p',
              text: '(1) Zu allgemein: „Ich stelle mir vor wie ich gewinne" bringt wenig. Spezifisch: „Jab-Cross wenn er den Kopf senkt nach dem Jab." (2) Zu schnell: Nimm dir wirklich 7 Min., nicht 30 Sekunden. (3) Nicht regelmäßig: 1× vor dem Kampf bringt fast nichts. 7× pro Woche über 4 Wochen → messbare Effekte. (4) Keine Emotionen: Wenn du dabei nichts fühlst, ist die Visu zu abstrakt. Fühle die Nervosität, die Aggression, den Stolz.'
            }
          ]
        }
      ]
    },
    {
      id: 'arousal',
      title: 'Arousal-Kontrolle',
      sub: 'Das optimale Aktivierungsfenster',
      blocks: [
        {
          t: 'p',
          text: 'Dein Arousal-Level (psychophysischer Erregungszustand) muss im optimalen Fenster sein: <strong>Zu niedrig → träge, kein Biss, langsame Reaktionen. Zu hoch → verkrampft, Tunnelblick, taktische Fehler, Überreaktionen.</strong> Die Yerkes-Dodson-Kurve (1908) zeigt: Komplexe Aufgaben wie Boxen brauchen mittleres bis hohes Arousal – aber nicht maximales. Ein wütender Boxer macht Fehler. Ein zu ruhiger Boxer hat keinen Biss.'
        },
        {
          t: 'p',
          text: '~70% aller Boxer berichten von signifikanter Vor-Kampf-Angst. Das ist normal und sogar gut – Adrenalin macht dich schneller, stärker und schmerzresistenter. Das Problem ist nur, wenn es dich lähmt oder du die Kontrolle verlierst.'
        },
        {
          t: 'note',
          id: 'arousal-warum',
          tone: 'sci',
          title: 'Warum das wirkt',
          text: 'Erkenne deinen Typ: Bist du vor Kämpfen eher ZU nervös (Herz rast, Hände zittern, kannst nicht stillsitzen, Übelkeit) → du brauchst Runterfahren-Techniken. Bist du eher ZU ruhig (antriebslos, „egal"-Gefühl, keine Energie) → du brauchst Hochfahren-Techniken. Die meisten Boxer sind zu nervös – aber manche brauchen den Kick.'
        },
        {
          t: 'card',
          id: 'arousal-1',
          title: 'Runterfahren – Box-Breathing (Haupttechnik)',
          blocks: [
            {
              t: 'p',
              text: '4 Sek. einatmen (durch Nase) → 4 Sek. halten → 4 Sek. ausatmen (durch Mund) → 4 Sek. halten. Das ist NICHT einfach „tief atmen". Das gleichmäßige Halten aktiviert den Vagusnerv → parasympathisches Nervensystem → senkt Herzfrequenz um 10–15 bpm in 90 Sekunden. Navy SEALs nutzen exakt diese Technik vor Einsätzen. 3–4 Zyklen reichen. Übe es TÄGLICH damit es automatisch wird – nicht erst am Kampftag zum ersten Mal.'
            }
          ]
        },
        {
          t: 'card',
          id: 'arousal-2',
          title: 'Runterfahren – Körper-Hacks',
          blocks: [
            {
              t: 'p',
              text: '(1) Physiologisches Seufzen (Andrew Huberman): Doppelter kurzer Einatem durch Nase → langer Ausatem durch Mund. Schnellste bekannte Methode um akuten Stress zu senken. (2) Kaltes Wasser im Gesicht (Tauchreflex): Aktiviert den Vagusnerv sofort. Nasses Handtuch auf Stirn und Wangen. (3) Progressive Muskelentspannung: Fäuste 5 Sek. maximal anspannen → 10 Sek. bewusst lösen. Dann Schultern. Dann Kiefer. Anspannung-Lösen-Kontrast zeigt dem Körper: „Du bist sicher." (4) Wann: 30–60 Min. vor dem Kampf. NICHT direkt vorher – dann willst du Energie.'
            }
          ]
        },
        {
          t: 'card',
          id: 'arousal-3',
          title: 'Hochfahren – Körper aktivieren',
          blocks: [
            {
              t: 'p',
              text: '(1) Schnelles Einatmen durch Nase, 10–15 Sek. (Wim-Hof-Stil, aber kurz). (2) Explosive Bewegungen: 10 Jump Squats, 10 Burpees, schnelles Schattenboxen 30 Sek. (3) Leichte Slaps auf Oberschenkel/Brust – physische Stimulation. (4) Power-Pose: 30 Sek. breitbeinig stehen, Brust raus, Fäuste geballt. Carney et al. (2010): Erhöht Testosteron, senkt Cortisol. (5) Wann: 10–15 Min. vor dem Ring, NACH dem PAPE Warm-Up.'
            }
          ]
        },
        {
          t: 'card',
          id: 'arousal-4',
          title: 'Hochfahren – Mental aktivieren',
          blocks: [
            {
              t: 'p',
              text: '(1) Musik: Playlist mit Songs die dich aggressiv/energetisch machen. 130+ BPM. Kopfhörer auf, Augen zu, 3–5 Min. (2) Aggressives Self-Talk: „Ich bin [Alter Ego]. Niemand kann mich stoppen. Ich bin hier um zu zerstören." LAUT oder flüsternd. (3) Alter-Ego-Activation: Totem anlegen. Origin Story 10 Sek. im Kopf. Switch. (4) Erinnerung an bestes Sparring/besten Kampf: Ruf das Gefühl ab wie es war als du dominant warst. DIESES Gefühl brauchst du jetzt.'
            }
          ]
        },
        {
          t: 'card',
          id: 'arousal-5',
          title: 'Angst umdeuten (Reappraisal)',
          blocks: [
            {
              t: 'p',
              text: 'Die körperlichen Symptome von Angst und Aufregung sind IDENTISCH: Herzklopfen, Schwitzen, Schmetterlinge im Bauch, Tunnelblick. Der einzige Unterschied ist deine INTERPRETATION. „Ich bin nicht nervös – mein Körper bereitet sich auf Höchstleistung vor." „Mein Herz rast weil es mehr Blut in die Muskeln pumpt." „Die Schmetterlinge sind Adrenalin – das macht mich schneller." Das ist keine Selbsttäuschung – es ist physiologisch korrekt. Akzeptiere: JEDER Boxer hat Angst. Tyson hat gesagt er hatte vor jedem Kampf panische Angst. Mut ist nicht Angstfreiheit – Mut ist Handeln trotz Angst.'
            }
          ]
        }
      ]
    },
    {
      id: 'self-talk',
      title: 'Self-Talk und Trigger-Wörter',
      sub: 'Dein innerer Dialog bestimmt die Performance',
      blocks: [
        {
          t: 'p',
          text: '<strong>Instruktionale</strong> Selbstgespräche („Hände hoch, Jab raus") verbessern Technik und Fokus. <strong>Motivationale</strong> („Ich bin bereit, ich bin stärker") verbessern Ausdauer um bis zu <strong>18%</strong> (Blanchfield et al. 2014). Meta-Analyse Hatzigeorgiadis et al. (2011) über 32 Studien: Effektstärke d=0.48 – das ist ein GROSSER Effekt. Zum Vergleich: Das ist mehr als die meisten legalen Supplements bringen.'
        },
        {
          t: 'p',
          text: 'Das Problem: Im Kampf läuft dein innerer Dialog automatisch. Wenn du ihn nicht trainierst, übernimmt die Default-Stimme – und die sagt Dinge wie „Das tut weh", „Ich bin müde", „Er ist besser als ich." Diese Stimme musst du VORHER überschreiben.'
        },
        {
          t: 'note',
          id: 'self-talk-warum',
          tone: 'sci',
          title: 'Warum das wirkt',
          text: 'Lomachenko spricht im Kampf ständig mit sich selbst – kurze, technische Anweisungen. Canelo Alvarez hat in einem Interview gesagt: „Ich sage mir in jeder Runde was ich als nächstes machen muss." Das ist trainierter Self-Talk in Aktion.'
        },
        {
          t: 'card',
          id: 'self-talk-1',
          title: '3 Trigger-Wörter wählen',
          blocks: [
            {
              t: 'p',
              text: 'Du brauchst genau 3 – eines für jede Situation: (1) TECHNIK-Wort: Kurz, beschreibt was du tun sollst. Beispiele: „Snap" (schneller Jab), „Rotate" (Hüfte drehen), „Level" (Ebene wechseln), „Distanz" (Abstand halten). (2) MOTIVATIONS-Wort: Gibt dir Energie. Beispiele: „Maschine", „Unaufhaltbar", „Warrior", der Name deines Alter Egos. (3) KRISEN-Wort: Für den Moment nach einem harten Treffer. Beispiele: „Atmen-Jab-Bewegen" (3er-Sequenz), „Reset", „Zurück zum Plan". Schreib sie auf Tape und kleb sie auf deine Wasserflasche.'
            }
          ]
        },
        {
          t: 'card',
          id: 'self-talk-2',
          title: 'In 3. Person formulieren',
          blocks: [
            {
              t: 'p',
              text: '„[Alter Ego Name] gibt nicht auf" statt „Ich gebe nicht auf." Kross et al. (2014, University of Michigan): Selbstgespräch in 3. Person reduziert emotionale Reaktivität signifikant – du betrachtest die Situation von außen statt drin zu stecken. Praktisch: „Iron Wolf ist müde aber Iron Wolf gibt NIEMALS auf." „Black Mamba sieht den Konter kommen." „[Dein Name] kontrolliert die Ringmitte."'
            }
          ]
        },
        {
          t: 'card',
          id: 'self-talk-3',
          title: 'Situationen zuordnen (Cheat Sheet)',
          blocks: [
            {
              t: 'p',
              text: 'Schreib dir diese Liste und trainiere sie: VOR dem Kampf: „Ich habe trainiert. Ich bin bereit. [Alter Ego] übernimmt." ERSTE RUNDE: „Jab. Distanz. Rhythmus." GEGNER DRÜCKT: „Atmen. Jab. Bewegen. Jab." NACH TREFFER: „Egal. Passiert. Zurück zum Plan." RÜCKSTAND: „Drück ihn. Ringmitte. Volumen." LETZTE RUNDE: Mantra (siehe unten). NACH DEM KAMPF: „Was auch immer passiert – ich bin stolz dass ich da war."'
            }
          ]
        },
        {
          t: 'card',
          id: 'self-talk-4',
          title: 'Im Training üben – LAUT',
          blocks: [
            {
              t: 'p',
              text: 'Self-Talk beim Shadow Boxing und Pratzenarbeit LAUT oder flüsternd mitsprechen. Nicht nur im Kopf – dein Mund muss die Wörter formen. Warum? Der motorische Akt des Sprechens aktiviert stärkere neuronale Bahnen als nur Denken. Praktisch: Jab werfen → „Snap" sagen. Nach jedem Treffer am Sandsack → „Reset" sagen. Nach jeder Runde Sparring → „Was lief gut?" laut beantworten. Muss Gewohnheit werden BEVOR es im Kampf funktioniert.'
            }
          ]
        },
        {
          t: 'card',
          id: 'self-talk-5',
          title: 'Letzte-Runde-Mantra',
          blocks: [
            {
              t: 'p',
              text: 'Einen EINZIGEN Satz für die letzte Runde oder die letzten 60 Sekunden. Beispiele: „Das ist meine Runde. Jetzt alles." / „Du hast 3 Minuten. 3 Minuten. Das schaffst du." / „[Alter Ego] wurde für diesen Moment geboren." Immer DERSELBE Satz. Pavlov-Effekt: Nach 20× Üben triggert der Satz automatisch maximale Intensität. Übe ihn bei den letzten 60 Sek. jeder Trainingsrunde.'
            }
          ]
        }
      ]
    },
    {
      id: 'corner',
      title: 'Corner-Kommunikation',
      sub: '60 Sekunden taktisches Gehirn',
      blocks: [
        {
          t: 'p',
          text: 'Die Ecke ist dein taktisches Gehirn zwischen den Runden. Effektive Corner-Kommunikation ist eine <strong>trainierbare Fähigkeit</strong> – für Boxer UND Trainer. Die meisten Amateure verschwenden die Rundenpause mit zu vielen Informationen oder emotionalem Geschrei. Freddie Roach (Trainer von Pacquiao) gibt zwischen den Runden max. 2 Anweisungen – extrem kurz, extrem klar. Teddy Atlas (Trainer von Timothy Bradley) ist bekannt für emotionale Motivation – aber auch er reduziert die taktische Info auf das Minimum.'
        },
        {
          t: 'note',
          id: 'corner-warum',
          tone: 'sci',
          title: 'Warum das wirkt',
          text: 'Neurowissenschaft: Ein Boxer unter Stress kann max. 2–3 Anweisungen aufnehmen. Alles darüber = Rauschen. Der Puls ist bei 160–180 bpm, die kognitive Kapazität ist massiv eingeschränkt. 10 Anweisungen schreien = 0 Anweisungen ankommen.'
        },
        {
          t: 'card',
          id: 'corner-1',
          title: '60-Sekunden-Struktur',
          blocks: [
            {
              t: 'p',
              text: 'Sek. 0–10: NICHTS sagen. Boxer setzt sich, Mundschutz raus, Wasser, 3 tiefe Atemzüge. Trainer beobachtet Gesicht und Körpersprache. Sek. 10–40: Max. 2–3 KURZE klare Anweisungen. Nicht: „Du musst mehr Druck machen und den Jab besser timen und die Deckung oben halten." Sondern: „Doppel-Jab. Dann rechts." PUNKT. Sek. 40–55: Box-Breathing zusammen. „Atme mit mir. 4 ein... 4 aus..." Sek. 55–60: Mundschutz rein → Aufstehen → „Du bist besser als er. Jetzt zeig es."'
            }
          ]
        },
        {
          t: 'card',
          id: 'corner-2',
          title: 'Codewörter vereinbaren',
          blocks: [
            {
              t: 'p',
              text: 'Vereinbare VOR dem Kampf 5–8 Codewörter mit deinem Trainer: „Marsch" = nach vorne drücken, Ringmitte nehmen. „Box" = Außendistanz halten, jabn, nicht reinlaufen. „Links" = Fokus auf linke Hand, Haken suchen. „Körper" = Ebene wechseln, Körpertreffer setzen. „Tempo" = Schlagfrequenz erhöhen. „Geduld" = Kontern statt angreifen. „Reset" = Alles vergessen, zurück zu Grundlagen. Übe diese im Sparring – Trainer ruft Codewort, Boxer setzt sofort um.'
            }
          ]
        },
        {
          t: 'card',
          id: 'corner-3',
          title: 'Emotionale Regulation durch den Trainer',
          blocks: [
            {
              t: 'p',
              text: 'Der Trainer muss den emotionalen Zustand des Boxers LESEN und darauf reagieren: (1) Boxer ZU NERVÖS (weite Augen, schnelle Atmung, steifer Körper): Ruhige, tiefe Stimme. „Alles gut. Du bist vorbereitet. Atme. Du weißt was du tun musst." (2) Boxer ZU PASSIV (leerer Blick, keine Energie, „egal"-Stimmung): Laut, direkt, aktivierend. „HEY! Aufwachen! Du lässt ihn gewinnen! 3 Minuten. JETZT!" (3) Boxer WÜTEND/UNKONTROLLIERT: „STOP. Denk nach. Er provoziert dich. Jab. Distanz. Kopf einschalten."'
            }
          ]
        },
        {
          t: 'card',
          id: 'corner-4',
          title: 'Im Sparring üben',
          blocks: [
            {
              t: 'p',
              text: 'Mindestens 1× pro Woche Sparring mit bewusster Corner-Arbeit: Trainer gibt zwischen jeder Runde max. 2 taktische Anpassungen → Boxer muss sie SOFORT in der nächsten Runde umsetzen. Trainer bewertet nach der Runde: Wurde die Anweisung umgesetzt? Ja/Nein? Das trainiert die Fähigkeit, unter Druck Input zu verarbeiten. Ohne Übung im Sparring funktioniert es im Kampf nicht.'
            }
          ]
        },
        {
          t: 'card',
          id: 'corner-5',
          title: 'Als Boxer: Aktiv zuhören',
          blocks: [
            {
              t: 'p',
              text: 'DEINE Verantwortung in der Pause: Nicht in Gedanken versinken. Nicht an den letzten Treffer denken. Augenkontakt zum Trainer. Nicken = „Ich habe verstanden." Wenn du etwas nicht verstehst → FRAG NACH. „Was soll ich links machen?" ist besser als raten. 60 Sekunden sind extrem kurz – verschwende sie nicht mit innerem Drama. Tipp: Trainiere im Sparring bewusst nach jeder Runde SOFORT zum Trainer zu schauen und zuzuhören, auch wenn du erschöpft bist.'
            }
          ]
        }
      ]
    },
    {
      id: 'niederlage',
      title: 'Nach einer Niederlage',
      sub: 'Verlieren ist Training – wenn du es richtig machst',
      blocks: [
        {
          t: 'p',
          text: '<strong>Jeder verliert. Die Frage ist nur: Was nimmst du mit?</strong> Floyd Mayweather verlor als Amateur. Lomachenko verlor seinen 2. Profikampf. Usyk wurde als Amateur geschlagen. Die gefährlichste Phase ist nicht die Niederlage selbst – es ist die Zeit danach, wenn die mentale Hürde für den nächsten Kampf wächst und du anfängst, Sparring oder Kämpfe zu vermeiden.'
        },
        {
          t: 'note',
          id: 'niederlage-warum',
          tone: 'sci',
          title: 'Warum das wirkt',
          text: 'Psychologisch: Je länger du nach einer Niederlage wartest, desto größer wird die mentale Blockade. Das Gehirn verallgemeinert: „Ring = Schmerz/Niederlage = vermeiden." Ohne strukturierten Prozess wird aus einem Verlust eine Karriere-Blockade. MIT Prozess wird aus jedem Verlust ein Wachstums-Schub.'
        },
        {
          t: 'card',
          id: 'niederlage-1',
          title: 'Erste 24 Stunden – Emotion zulassen',
          blocks: [
            {
              t: 'p',
              text: 'Frust, Trauer, Wut – alles ist OK und gesund. NICHT unterdrücken. Aber auch nicht in Social Media darüber posten oder mit jedem darüber reden. Regel: 1 Vertrauensperson (Partner, bester Freund, Familie) – KEIN Trainer, KEIN Boxkollege. In den ersten 24h geht es um Emotion, nicht Analyse. Körperlich: Schlaf, gutes Essen, Ruhe, Eisbad wenn nötig. NICHT sofort das Kampfvideo anschauen – du bist noch zu emotional für eine objektive Analyse.'
            }
          ]
        },
        {
          t: 'card',
          id: 'niederlage-2',
          title: 'Tag 2–3: Objektive Analyse',
          blocks: [
            {
              t: 'p',
              text: 'Jetzt Kampfvideo anschauen – am besten MIT dem Trainer. OHNE Emotion. So wie du den Kampf eines Fremden analysieren würdest. Schreib auf: (1) 3 Dinge die GUT waren – ja, auch in einer Niederlage gibt es gute Momente. (2) 3 Dinge zum VERBESSERN – spezifisch, nicht „alles war schlecht". (3) 1 taktische Maßnahme die den Kampf hätte drehen können. Daraus leitest du 3 konkrete Trainingsmaßnahmen für die nächsten 4 Wochen ab.'
            }
          ]
        },
        {
          t: 'card',
          id: 'niederlage-3',
          title: 'Ab Tag 4: Zurück ins Training',
          blocks: [
            {
              t: 'p',
              text: 'NICHT warten bis du dich „bereit fühlst". Das Gefühl kommt durch Handeln, nicht durch Warten. Gezielt an den 3 identifizierten Schwächen arbeiten. Alter Ego bewusst aktivieren: „Mein Alter Ego lernt aus allem. Diese Niederlage hat mein Alter Ego STÄRKER gemacht." Sparring in der ersten Woche danach: Leicht, taktisch, mit Fokus auf die 3 Verbesserungspunkte.'
            }
          ]
        },
        {
          t: 'card',
          id: 'niederlage-4',
          title: 'Nächsten Kampf planen',
          blocks: [
            {
              t: 'p',
              text: 'So früh wie sinnvoll möglich (4–8 Wochen). Je länger du wartest, desto größer die Hürde. Der nächste Kampf ist psychologisch der wichtigste nach einer Niederlage – er überschreibt die letzte Erinnerung. Idealerweise ein machbarer Gegner – du brauchst ein Erfolgserlebnis, keinen zweiten Verlust.'
            }
          ]
        },
        {
          t: 'card',
          id: 'niederlage-5',
          title: 'Nach RSC/KO – Sonderprotokoll',
          blocks: [
            {
              t: 'p',
              text: 'Bei Abbruch oder KO: Ärztliche Freigabe ABWARTEN. Keine Diskussion. Dann stufenweise zurück: Woche 1–2: Shadow Boxing + leichtes Pratzentraining. Woche 3–4: Mittelschweres Sparring mit Kopfschutz. Woche 5–6: Normales Sparring. Woche 7+: Kampf-Sparring. Mentaler Check in jeder Stufe: Zuckst du bei Schlägen zum Kopf zusammen? Vermeidest du den Nahkampf? Wenn ja → 1 Stufe zurück und mehr Zeit nehmen. Nicht hetzen, aber auch nicht zu lange warten.'
            }
          ]
        },
        {
          t: 'card',
          id: 'niederlage-6',
          title: 'Langzeit-Perspektive',
          blocks: [
            {
              t: 'p',
              text: 'Führe eine „Lektion pro Kampf"-Liste. Egal ob Sieg oder Niederlage: Was hast du gelernt? Nach 20 Kämpfen hast du 20 Lektionen. JEDE Niederlage hat dich spezifisch besser gemacht – und du kannst es beweisen. Das ist Resilienz in Reinform.'
            }
          ]
        }
      ]
    },
    {
      id: 'fight-week',
      title: 'Kampfwoche',
      sub: '7 Tage bis zum Kampf',
      blocks: [
        {
          t: 'p',
          text: 'Die Kampfwoche ist <strong>keine normale Trainingswoche</strong>. Dein Körper ist vorbereitet – jetzt geht es darum, den Kopf auf den Punkt bereit zu machen. Jeder Tag hat eine spezifische mentale Aufgabe. Die Struktur gibt dir Kontrolle – und Kontrolle ist das Gegenmittel gegen Kampf-Angst.'
        },
        {
          t: 'p',
          text: 'Canelo Alvarez hat eine identische Routine für jede Kampfwoche. Immer das gleiche Hotel, das gleiche Essen, die gleiche Musik. Warum? Routine eliminiert Unsicherheit. Dein Gehirn braucht keine Energie für Entscheidungen und kann sich voll auf den Kampf konzentrieren.'
        },
        {
          t: 'note',
          id: 'fight-week-warum',
          tone: 'sci',
          title: 'Warum das wirkt',
          text: 'Das Ziel der Kampfwoche: Am Kampftag mit dem Gefühl in den Ring gehen „Ich habe alles getan was möglich war. Ich bin vorbereitet. Jetzt muss ich nur noch das abrufen was ich kann." Wenn du mit Zweifeln in den Ring gehst, hast du die Kampfwoche falsch gestaltet.'
        },
        {
          t: 'card',
          id: 'fight-week-1',
          title: 'Tag 7–5: Schärfen',
          blocks: [
            {
              t: 'p',
              text: 'Training mit leicht reduzierter Intensität (−20–30% Volumen, Intensität bleibt). Tägliche Visualisierung 2× (morgens 5 Min. Technik, abends 5 Min. Krisen-Szenarien). Alter Ego im Sparring aktivieren – JEDES Mal. Gegner-Video studieren: 2–3 Muster identifizieren, Antworten planen. Schlaf: Minimum 8 Stunden. Kein Alkohol, kein Koffein nach 13:00.'
            }
          ]
        },
        {
          t: 'card',
          id: 'fight-week-2',
          title: 'Tag 4–3: Mental Peak',
          blocks: [
            {
              t: 'p',
              text: 'Kein hartes Sparring mehr. Leichte Pratzen, Shadow Boxing, Technikarbeit. Visualisierung steigern auf 3×10 Min. (morgens, mittags, abends). Trigger-Wörter auf Papier schreiben und laut üben – jeweils 5×. Self-Talk-Routine festlegen: Was sage ich mir beim Aufwärmen? In der Ecke? In Runde 1? Bei Rückstand? Alter-Ego-Origin-Story laut vorlesen (ja, wirklich laut – alleine zu Hause). Tasche für Kampftag beginnen zu packen.'
            }
          ]
        },
        {
          t: 'card',
          id: 'fight-week-3',
          title: 'Tag 2: Ruhe & Vorbereitung',
          blocks: [
            {
              t: 'p',
              text: 'NUR leichte Bewegung: 15 Min. Spaziergang, leichtes Stretching. Box-Breathing 3× am Tag (morgens, mittags, abends – je 5 Min.). Alter-Ego-Origin-Story nochmal lesen. Komplette Tasche packen (Mundschutz, Bandagen, Wettkampfpass, Klamotten, Essen/Trinken für danach, Musik/Kopfhörer). Routine für morgen durchgehen – keine Überraschungen. Handy auf lautlos, kein Social Media. Früh schlafen (22:00 spätestens).'
            }
          ]
        },
        {
          t: 'card',
          id: 'fight-week-4',
          title: 'Tag 1 – Kampftag: Die Routine',
          blocks: [
            {
              t: 'p',
              text: 'Aufstehen → Box-Breathing 5 Min. → leichtes Frühstück (Protein + schnelle KH) → Wiegen wenn nötig → Musik (persönliche Kampf-Playlist mit Kopfhörern) → Halle anreisen → PAPE Warm-Up Protokoll (45 Min. vor Ring) → Shadow Boxing 2 Runden → Visualisierung 5 Min. (Augen zu, Lieblingskombi durchgehen, Gegner-Muster, Krisen-Plan) → Totem anlegen → Alter Ego aktivieren → Letzte Anweisungen vom Trainer → Ring betreten. AB JETZT existiert nur noch [Alter Ego Name] und der Gegner. Nichts anderes.'
            }
          ]
        },
        {
          t: 'card',
          id: 'fight-week-5',
          title: 'Zwischen den Runden (60 Sek.)',
          blocks: [
            {
              t: 'p',
              text: 'Sek. 0–5: Setzen, Mundschutz raus, Wasser (kleine Schlucke, nicht gurgeln). Sek. 5–10: 2 tiefe Atemzüge, Trainer anschauen. Sek. 10–40: Trainer gibt max. 2 Anweisungen. DU hörst ZU. Nickst. Sek. 40–55: Box-Breathing 2 Zyklen. Augen auf den Gegner – schau wie er sitzt, wie er atmet. Ist er müder als du? Sek. 55–60: Mundschutz rein (= Totem = Alter Ego Switch). Aufstehen. Schultern zurück. Letzte 3 Sek.: Trigger-Wort im Kopf. Gong.'
            }
          ]
        },
        {
          t: 'card',
          id: 'fight-week-6',
          title: 'Nach dem Kampf',
          blocks: [
            {
              t: 'p',
              text: 'Egal ob Sieg oder Niederlage: (1) Duschen, essen, trinken. Körper versorgen. (2) 1 Sache aufschreiben die gut war. 1 Sache aufschreiben die besser werden muss. Nur 1 jeweils – nicht mehr am Kampftag. (3) Trainer und Partner danken. (4) 24h kein Kampfvideo anschauen. Genieße den Sieg oder verarbeite die Niederlage erst emotional, dann analytisch (siehe Sektion 07).'
            }
          ]
        }
      ]
    },
    {
      id: 'bet',
      title: 'BET-Protokoll',
      sub: 'Brain Endurance Training – 6 Wochen',
      blocks: [
        {
          t: 'p',
          text: 'Brain Endurance Training (BET) trainiert dein Gehirn, <strong>unter kognitiver Erschöpfung sauber zu funktionieren</strong>. In Runde 3, wenn dein Kopf müde ist und dein Gegner Druck macht, entscheidet mentale Frische über Sieg oder Niederlage. BET simuliert diese Ermüdung systematisch im Training.'
        },
        {
          t: 'p',
          text: 'Das Konzept: Kognitive Erschöpfung (durch monotone Denkaufgaben) reduziert physische Ausdauer um 10–15%. Wenn du trainierst unter kognitiver Last zu performen, erhöhst du deine Toleranz – und hast in Runde 3 noch mentale Reserven die dein Gegner nicht hat.'
        },
        {
          t: 'note',
          id: 'bet-warum',
          tone: 'sci',
          title: 'Warum das wirkt',
          text: 'Transparenz: Die oft zitierte Militär-Studie (Marcora et al. 2009) wurde an Soldaten durchgeführt, nicht an Boxern. Die Loughborough-Studie zeigte 126% längere Time-to-Exhaustion nach BET. Die Übertragung auf Kampfsport ist plausibel und wird von mehreren olympischen Verbänden (GB Boxing, DFB) genutzt – aber die Studienlage speziell für Boxer ist noch dünn. Das Risiko ist null (du trainierst nur dein Gehirn), das Potenzial groß.'
        },
        {
          t: 'card',
          id: 'bet-1',
          title: 'Woche 1–2: Basis aufbauen',
          blocks: [
            {
              t: 'p',
              text: 'App: Kostenlose Stroop-App (z.B. „Brain Test", „Stroop Effect" oder „Encephalapp Stroop"). 15–20 Min. täglich inkongruente Tests (das Wort „BLAU" steht in roter Farbe → du musst die FARBE nennen, nicht das Wort). Ruhige Umgebung, volle Konzentration, keine Ablenkung. Mittagspause eignet sich gut. Du wirst merken: Nach 15 Min. wird dein Kopf „müde" – genau DAS ist der Trainingseffekt.'
            }
          ]
        },
        {
          t: 'card',
          id: 'bet-2',
          title: 'Woche 3–4: Integration ins Training',
          blocks: [
            {
              t: 'p',
              text: '20–25 Min. BET pro Session, höhere Schwierigkeit (schnellere Antwortzeit, mehr Varianten). NEU: Kognitive Aufgaben ZWISCHEN Bag-Work-Runden einbauen. Konkret: 3 Min. Sandsack → 60 Sek. Stroop-Test auf Handy → 3 Min. Sandsack → 60 Sek. Stroop. 6–8 Runden. Ziel: Saubere Technik halten obwohl dein Kopf müde ist. Trainingspartner kann auch Rechenaufgaben stellen: „147 minus 7?" zwischen den Runden.'
            }
          ]
        },
        {
          t: 'card',
          id: 'bet-3',
          title: 'Woche 5–6: Ring-Transfer',
          blocks: [
            {
              t: 'p',
              text: '25–30 Min. BET bei max. Schwierigkeit. Stroop-Antworten ZWISCHEN Sparring-Runden. Oder: Trainer stellt nach jeder Runde eine kognitive Frage (Farbe, Zahl, Rechenaufgabe) bevor er taktische Anweisungen gibt. Ziel: Saubere taktische Entscheidungen trotz maximaler kognitiver Erschöpfung. Das ist der direkte Transfer: In Runde 3 unter Druck noch klar denken können.'
            }
          ]
        },
        {
          t: 'card',
          id: 'bet-4',
          title: 'Im Vereinstraining integrieren',
          blocks: [
            {
              t: 'p',
              text: 'Bitte deinen Trainer, zwischen Sandsack-Runden Zahlen oder Farben zu rufen auf die du mit Kombis reagieren musst. Oder: Nach jeder Runde eine Frage beantworten bevor die naechste Anweisung kommt. Kostet nichts und trainiert genau das was du brauchst.'
            }
          ]
        },
        {
          t: 'card',
          id: 'bet-5',
          title: 'Langzeit-Protokoll',
          blocks: [
            {
              t: 'p',
              text: 'Nach 6 Wochen: 3×/Woche Erhaltungsdosis (15 Min. + Integration in 2 Trainingseinheiten). Vor Kämpfen (Kampfwoche): Tägliche BET-Session 20 Min. – schärft die kognitive Ausdauer für den Kampf. BET ist wie Ausdauertraining für dein Gehirn: Konsistenz über Monate schlägt Intensität über Tage. Die meisten Boxer die es probieren hören nach 2 Wochen auf – die die durchhalten haben einen unfairen Vorteil in Runde 3.'
            }
          ]
        }
      ]
    },
    {
      id: 'protokoll',
      title: 'Tägliches Protokoll',
      sub: '15 Minuten',
      blocks: [
        {
          t: 'dyn',
          id: 'mentalProtokoll',
          title: 'Tägliches Protokoll, 15 Minuten',
          text: 'Wo {ego} steht, setzt die App den Namen deines Alter Ego ein. Solange keiner angelegt ist, steht dort der allgemeine Begriff.',
          bloecke: [
            {
              id: 'morgens',
              when: 'Morgens',
              dauer: '5 Minuten',
              items: [
                'Box-Breathing 4-4-4-4, zwei Minuten',
                'Trigger-Wörter laut aussprechen',
                'Intention für den Tag setzen'
              ]
            },
            {
              id: 'vor-training',
              when: 'Vor dem Training',
              dauer: '3 Minuten',
              items: [
                '{ego} aktivieren, Totem anlegen',
                '30 Sekunden Visualisierung',
                'Laut sagen: ich bin {ego}'
              ]
            },
            {
              id: 'abends',
              when: 'Abends',
              dauer: '7 Minuten',
              items: [
                'Technik-Visualisierung, drei Minuten',
                'Gegner-Visualisierung, zwei Minuten',
                'Krisen-Szenario, zwei Minuten'
              ]
            },
            {
              id: 'journal',
              when: 'Journal',
              dauer: 'optional',
              items: ['Was lief heute gut?', 'Was war mental schwer?', 'Wie hätte {ego} reagiert?']
            }
          ]
        }
      ]
    },
    {
      id: 'lesen',
      title: 'Zum Weiterlesen',
      blocks: [
        {
          t: 'p',
          text: 'Nichts davon ist Pflicht. Die Liste steht hier, weil regelmäßig danach gefragt wird.'
        },
        {
          t: 'link',
          id: 'fighters-mind',
          label: 'The Fighter\'s Mind, Sam Sheridan',
          sub: 'Buch, Mental, etwa 15 €',
          text: 'Interviews mit Elite-Kämpfern über mentale Stärke, Angst und Flow im Ring.',
          img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&h=150&fit=crop',
          href: 'https://www.amazon.de/s?k=The+Fighters+Mind+Sam+Sheridan'
        },
        {
          t: 'link',
          id: 'iron-ambition',
          label: 'Iron Ambition, Mike Tyson',
          sub: 'Buch, Mental, etwa 14 €',
          text: 'Tysons Weg unter Cus D\'Amato: Visualisierung, Alter Ego, mentale Dominanz.',
          img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&h=150&fit=crop',
          href: 'https://www.amazon.de/s?k=Iron+Ambition+Mike+Tyson'
        },
        {
          t: 'link',
          id: 'inner-game',
          label: 'The Inner Game of Tennis, Timothy Gallwey',
          sub: 'Buch, Mental, etwa 12 €',
          text: 'Das Original-Framework für mentale Leistung im Sport.',
          img: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=150&fit=crop',
          href: 'https://www.amazon.de/s?k=The+Inner+Game+of+Tennis+Gallwey'
        },
        {
          t: 'link',
          id: 'winning-in-mind',
          label: 'With Winning in Mind, Lanny Bassham',
          sub: 'Buch, Mental, etwa 18 €',
          text: 'Mental-Management-System eines Olympiasiegers. Gegen Kampfnacht-Nervosität.',
          img: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=150&h=150&fit=crop',
          href: 'https://www.amazon.de/s?k=With+Winning+in+Mind+Lanny+Bassham'
        },
        {
          t: 'link',
          id: 'headspace',
          label: 'Headspace App',
          sub: 'App, Meditation, etwa 13 € im Monat',
          text: 'Geführte Visualisierung und Fokus-Sessions. Von Profi-Athleten genutzt.',
          img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=150&h=150&fit=crop',
          href: 'https://www.headspace.com'
        },
        {
          t: 'link',
          id: 'championship-fighting',
          label: 'Championship Fighting, Jack Dempsey',
          sub: 'Buch, Technik, etwa 16 €',
          text: 'Zeitlose Schlagtechnik und Kraftmechanik vom Schwergewichts-Champion.',
          img: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=150&h=150&fit=crop',
          href: 'https://www.amazon.de/s?k=Championship+Fighting+Jack+Dempsey'
        }
      ]
    }
  ]
});
