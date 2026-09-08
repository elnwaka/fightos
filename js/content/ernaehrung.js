/* Ernaehrung als Daten. Siehe js/content.js fuer die Bausteine.

   Erzeugt aus der alten Renderfunktion in js/pages.js, danach von Hand
   nachgezogen. Drei Dinge sind dabei bewusst anders als im Original:

   - Der tt()-Tooltip zu Leucin ist aufgeloest. Auf dem Handy gibt es
     kein Ueberfahren, ein title-Attribut waere dort unerreichbar.
   - Der Makro-Rechner ist ein Formular und bleibt Code. Der Text
     drumherum haengt am Platzhalter, nicht im Renderer.
   - Die Querverweise am Ende sind Navigation, kein Inhalt, und stehen
     deshalb als related am Artikel.

   Personalisierte Zahlen stehen als Platzhalter in geschweiften
   Klammern und werden ueber vars aus dem Koerpergewicht gerechnet.
   Content.values('ernaehrung', { weight }) liefert die Werte.

   Die ids sind fest. Sie stehen in geteilten Links. */

Content.define('ernaehrung', {
  title: 'Ernährung',
  sub: 'Dein kompletter Ernährungsguide. Alles von den Grundlagen über die Einkaufsliste bis zum Kampftag, wissenschaftlich basiert und praxiserprobt.',
  related: ['cutten', 'supplements', 'regeneration', 'rechner'],
  vars: {
    kg: { from: 'weight' },
    w08: { from: 'weight', mul: 0.8 },
    w12: { from: 'weight', mul: 1.2 },
    w22: { from: 'weight', mul: 2.2 },
    w25: { from: 'weight', mul: 2.5 },
    w26: { from: 'weight', mul: 2.6 },
    w3: { from: 'weight', mul: 3.0 },
    w35: { from: 'weight', mul: 35.0 },
    w4: { from: 'weight', mul: 4.0 },
    w40: { from: 'weight', mul: 40.0 },
    w5: { from: 'weight', mul: 5.0 },
    w6: { from: 'weight', mul: 6.0 },
    w7: { from: 'weight', mul: 7.0 },
    w8: { from: 'weight', mul: 8.0 }
  },
  intro: [
    {
      t: 'dyn',
      id: 'nut10w',
      title: 'Ernährung im 10-Wochen-Programm',
      text: 'Die Werte richten sich nach der laufenden Woche und deinem Gewicht. Grundlage ist P10W_NUTRITION im Programm, nicht dieser Text.',
      labels: {
        heavy: 'Schwere Tage',
        light: 'Leichte Tage und Ruhetage',
        timing: 'Timing',
        hydration: 'Hydration',
        fightWeek: 'Kampfwochen-Protokoll',
        waterLoading: 'Wasserloading',
        sodium: 'Natrium',
        postWeigh: 'Nach dem Wiegen',
        lastMeal: 'Letzte Mahlzeit'
      },
      hinweis: 'Ab Woche 9 kommt das Kampfwochen-Protokoll dazu: Wasserloading, Natrium schrittweise senken, Verpflegung nach dem Wiegen und die letzte Mahlzeit.'
    },
    {
      t: 'note',
      id: 'warum-ernaehrung-ueber-sieg-entscheidet',
      tone: 'sci',
      title: 'Warum Ernährung über Sieg entscheidet',
      text: 'Training zerstört Muskelgewebe – Ernährung baut es wieder auf. Ohne ausreichend Protein, Kohlenhydrate und Mikronährstoffe ist jede Trainingseinheit verschwendet. Ein gut ernährter Boxer regeneriert 30–40% schneller, schlägt in Runde 3 noch mit voller Kraft und wird seltener krank.'
    }
  ],
  sections: [
    {
      id: 'ern-s1',
      title: 'GRUNDLAGEN – WAS DU WISSEN MUSST',
      blocks: [
        {
          t: 'card',
          id: 'die-3-grundregeln',
          title: 'DIE 3 GRUNDREGELN',
          blocks: [
            { t: 'h', text: '1. Kalorien bestimmen ob du zu- oder abnimmst.' },
            {
              t: 'p',
              text: 'Isst du mehr als du verbrauchst → Gewichtszunahme. Weniger → Abnahme. Gleich viel → Gewicht bleibt. Egal wie "gesund" du isst – die Energiebilanz entscheidet.'
            },
            { t: 'h', text: '2. Makros bestimmen WORAUS du zu- oder abnimmst.' },
            {
              t: 'p',
              text: 'Genug Protein → Muskeln wachsen/bleiben. Zu wenig Protein → Muskeln werden abgebaut, egal wie hart du trainierst. Kohlenhydrate → Energie für Training. Fett → Hormone, Gelenke, Absorption.'
            },
            { t: 'h', text: '3. Timing bestimmt die Leistung.' },
            {
              t: 'p',
              text: 'Die richtigen Nährstoffe zum richtigen Zeitpunkt → maximale Trainingsleistung und optimale Recovery. Falsch getimed → Energieloch im Training, schlechte Regeneration.'
            }
          ]
        },
        {
          t: 'card',
          id: 'kalorienbedarf-eines-boxers',
          title: 'KALORIENBEDARF EINES BOXERS',
          blocks: [
            {
              t: 'p',
              text: 'Ein Boxer der 6–10 Stunden/Woche trainiert verbrennt deutlich mehr als ein normaler Sportler. Grobe Richtwerte:'
            },
            {
              t: 'p',
              text: 'Das sind Richtwerte. Nutze den Makro-Rechner unten für deine persönlichen Werte. Dein Beruf (sitzend vs. körperlich) macht 300–600 kcal Unterschied pro Tag.'
            },
            {
              t: 'table',
              head: ['Gewicht', 'Aufbau', 'Halten', 'Cutten'],
              rows: [
                ['60 kg', '2600–2900 kcal', '2300–2600 kcal', '1900–2200 kcal'],
                ['70 kg', '2900–3300 kcal', '2600–2900 kcal', '2200–2500 kcal'],
                ['80 kg', '3200–3600 kcal', '2900–3200 kcal', '2400–2800 kcal'],
                ['90 kg', '3500–3900 kcal', '3200–3500 kcal', '2700–3100 kcal']
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'ern-s2',
      title: 'MAKRONÄHRSTOFFE IM DETAIL',
      blocks: [
        {
          t: 'card',
          id: 'protein-der-baustoff',
          title: 'PROTEIN – DER BAUSTOFF',
          blocks: [
            { t: 'h', text: 'Wie viel' },
            {
              t: 'p',
              text: 'Die Wissenschaft zeigt einen optimalen Bereich von 2.0–2.4g/kg – wir empfehlen als klaren Richtwert:'
            },
            {
              t: 'p',
              text: '<strong>2.2g pro kg Körpergewicht pro Tag.</strong> Bei {kg}kg = {w22}g Protein/Tag.'
            },
            {
              t: 'p',
              text: 'Beim Cutten: <strong>2.6g/kg</strong> (bei {kg}kg = {w26}g) um Muskelverlust zu verhindern.'
            },
            { t: 'h', text: 'Warum so viel' },
            {
              t: 'p',
              text: 'Boxtraining ist extrem katabol – Sparring, Sandsackarbeit und Krafttraining verursachen massive Gewebeschäden. Dein Körper braucht Aminosäuren (aus Protein) um alles zu reparieren. Zu wenig Protein = dein Körper baut Muskeln ab statt auf.'
            },
            { t: 'h', text: 'Wie verteilen' },
            {
              t: 'p',
              text: '4–5 Mahlzeiten mit je <strong>30–50g Protein</strong>. Jede Mahlzeit muss mindestens 2.5g Leucin enthalten – darunter wird die Muskelproteinsynthese nicht maximal angeregt.'
            },
            {
              t: 'note',
              id: 'leucin',
              tone: 'sci',
              title: 'Warum Leucin',
              text: 'Leucin ist die Aminosäure, die den Schalter für Muskelaufbau umlegt. Unter 2,5 g pro Mahlzeit wird die Muskelproteinsynthese nicht maximal angeregt. Enthalten in: 25 g Whey (2,5 g), drei Eier (1,3 g), 100 g Hähnchen (2,4 g), 200 g Skyr (1,6 g).'
            },
            { t: 'h', text: 'Beste Proteinquellen (sortiert nach biologischer Wertigkeit)' },
            {
              t: 'table',
              head: ['Lebensmittel', 'Protein/100g', 'Leucin', 'Anmerkung'],
              rows: [
                [
                  'Whey Isolat',
                  '90g (pro 100g Pulver)',
                  '~2.5g/25g',
                  'Schnellste Absorption, ideal post-Training'
                ],
                ['Hähnchenbrust', '31g', '2.4g', 'Mager, vielseitig, Meal-Prep-König'],
                ['Rinderhüftsteak', '28g', '2.2g', '+ Kreatin, Eisen, Zink'],
                ['Lachs', '25g', '1.8g', '+ Omega-3 für Entzündung/Recovery'],
                [
                  'Eier (3 Stück)',
                  '19g (gesamt)',
                  '1.3g',
                  'Komplett-Paket, Cholesterin unbedenklich'
                ],
                ['Skyr (200g)', '22g', '1.6g', 'Casein-basiert, langsam, ideal abends'],
                ['Thunfisch (Dose)', '26g', '2.0g', 'Max 2 Dosen/Woche (Quecksilber)'],
                ['Hüttenkäse (200g)', '24g', '1.8g', 'Casein + Whey Mix, perfekter Snack'],
                ['Linsen (gekocht)', '9g', '0.6g', 'Pflanzlich – mit Reis kombinieren']
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'kohlenhydrate-der-treibstoff',
          title: 'KOHLENHYDRATE – DER TREIBSTOFF',
          blocks: [
            { t: 'h', text: 'Wie viel' },
            { t: 'h', text: 'Warum brauchen Boxer so viele Kohlenhydrate' },
            {
              t: 'p',
              text: 'Boxtraining ist zu <strong>~70% glykogenbasiert</strong>. Leere Glykogenspeicher = müde Beine, schwache Schläge, langsame Reaktion. Kohlenhydrate sind KEIN Feind – sie sind dein Benzin. Low-Carb-Diäten und Boxen sind nicht kompatibel.'
            },
            { t: 'h', text: 'Schnelle KH (vor/nach Training)' },
            {
              t: 'p',
              text: 'Hoher glykämischer Index → schnelle Absorption → schnelle Energie / schnelle Glykogen-Auffüllung. Quellen findest du in der Einkaufsliste.'
            },
            { t: 'h', text: 'Langsame KH (restlicher Tag)' },
            {
              t: 'p',
              text: 'Niedriger glykämischer Index → langanhaltende Energie, mehr Ballaststoffe, bessere Sättigung. Quellen ebenfalls in der Einkaufsliste.'
            },
            {
              t: 'p',
              text: '<strong>Timing-Regel:</strong> Schnelle KH 1–2h vor und direkt nach Training. Den Rest des Tages langsame KH. Nie nüchtern ins harte Training.'
            },
            {
              t: 'table',
              head: ['Phase', 'g/kg/Tag', 'Bei {kg}kg', 'Warum'],
              rows: [
                ['Aufbau', '6–8g/kg', '{w6}–{w8}g', 'Maximale Glykogen-Speicher, optimale Recovery'],
                ['Wettkampfphase', '5–7g/kg', '{w5}–{w7}g', 'Volle Energie für intensives Training'],
                ['Halten', '4–6g/kg', '{w4}–{w6}g', 'Genug für Training, nicht für Zunahme'],
                ['Cutten', '2.5–4g/kg', '{w25}–{w4}g', 'Minimum für Leistungserhalt']
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'fett-die-hormone',
          title: 'FETT – DIE HORMONE',
          blocks: [
            { t: 'h', text: 'Wie viel' },
            {
              t: 'p',
              text: '<strong>0.8–1.2g pro kg Körpergewicht.</strong> Bei {kg}kg = {w08}–{w12}g Fett/Tag.'
            },
            { t: 'p', text: 'Minimum 0.5g/kg – darunter sinken Testosteron und andere Hormone.' },
            { t: 'h', text: 'Warum wichtig' },
            {
              t: 'p',
              text: 'Fett ist essentiell für: Testosteron-Produktion (Kraft + Recovery), Gelenkschmierung (weniger Verletzungen), Absorption von Vitamin A/D/E/K, Gehirnfunktion (Reaktion + Entscheidungen im Ring).'
            },
            { t: 'h', text: 'Fettquellen nach Typ' },
            {
              t: 'list',
              items: [
                '<strong>Omega-3 (Priorität!):</strong> Anti-entzündlich, beschleunigt Recovery, neuroprotektiv. Quellen in der Einkaufsliste.',
                '<strong>Einfach ungesättigt:</strong> Herzgesundheit, Grundlage für Hormonproduktion.',
                '<strong>Gesättigt (moderat):</strong> Testosteron-Produktion, nicht eliminieren.',
                '<strong>MEIDEN:</strong> Transfette (Frittiertes, Fast Food, Margarine) → entzündungsfördernd, leistungsmindernd.'
              ]
            },
            {
              t: 'p',
              text: '<strong>Timing-Regel:</strong> Fett NICHT direkt vor dem Training (verlangsamt Magenentleerung). Fett zu den Mahlzeiten 3+ Stunden vor Training oder danach.'
            }
          ]
        }
      ]
    },
    {
      id: 'ern-s3',
      title: 'MIKRONÄHRSTOFFE & HYDRATION',
      blocks: [
        {
          t: 'note',
          id: '70-aller-sportler-haben-mindestens-einen',
          tone: 'warn',
          title: '70% aller Sportler haben mindestens einen Mikronährstoff-Mangel',
          text: '– meist Vitamin D, Magnesium oder Eisen. Ein Mangel in einem einzigen Mikronährstoff kann Recovery um 20–30% verlangsamen, ohne dass du den Grund erkennst. Blutbild 1–2× pro Jahr machen lassen!'
        },
        {
          t: 'card',
          id: 'kritische-mikronaehrstoffe-fuer-boxer',
          title: 'KRITISCHE MIKRONÄHRSTOFFE FÜR BOXER',
          blocks: [
            { t: 'p', text: '<strong>Eisen</strong> – Sauerstofftransport' },
            {
              t: 'p',
              text: 'Mangel = schnellere Ermüdung, Atemnot, schlechte Ausdauer. Besonders bei Boxern die viel schwitzen.'
            },
            {
              t: 'p',
              text: '<strong>Quellen:</strong> Rotes Fleisch (beste Absorption), Spinat + Vitamin C, Linsen, dunkle Schokolade.'
            },
            { t: 'p', text: '<strong>Ziel:</strong> Ferritin >50 µg/L (Blutbild!).' },
            { t: 'p', text: '<strong>Vitamin D</strong> – Knochen, Immunsystem, Testosteron' },
            {
              t: 'p',
              text: '70% der Deutschen sind mangelhaft, besonders im Winter. Direkt korreliert mit Knochendichte (Frakturen!), Immunfunktion und Testosteronspiegel.'
            },
            {
              t: 'p',
              text: '<strong>Quellen:</strong> Sonnenlicht (20 Min./Tag), fetter Fisch, Eier.'
            },
            {
              t: 'p',
              text: '<strong>Supplementierung:</strong> 2000–4000 IE/Tag im Winter (mit Vitamin K2 kombinieren).'
            },
            { t: 'p', text: '<strong>Magnesium</strong> – Muskelfunktion, Schlaf, Recovery' },
            {
              t: 'p',
              text: 'Wird über Schweiß massiv ausgeschieden. Mangel = Muskelkrämpfe, schlechter Schlaf, langsamere Recovery.'
            },
            {
              t: 'p',
              text: '<strong>Quellen:</strong> Kürbiskerne, dunkle Schokolade, Mandeln, Spinat, Bananen.'
            },
            {
              t: 'p',
              text: '<strong>Supplementierung:</strong> 300–400mg Magnesium-Glycinat abends (verbessert Schlafqualität).'
            },
            { t: 'p', text: '<strong>Zink</strong> – Testosteron, Immunsystem, Wundheilung' },
            {
              t: 'p',
              text: 'Geht durch Schweiß verloren. Essentiell für Testosteron und Immunabwehr.'
            },
            {
              t: 'p',
              text: '<strong>Quellen:</strong> Austern, Rindfleisch, Kürbiskerne, Cashewnüsse.'
            },
            { t: 'p', text: '<strong>Supplementierung:</strong> 15–25mg/Tag falls Blutbild niedrig.' },
            { t: 'p', text: '<strong>Omega-3</strong> – Entzündungshemmung, Gehirn, Gelenke' },
            {
              t: 'p',
              text: 'Boxer haben durch repetitives Training chronisch erhöhte Entzündungswerte. Omega-3 ist der stärkste natürliche Entzündungshemmer.'
            },
            {
              t: 'p',
              text: '<strong>Quellen:</strong> Fetter Fisch 2–3×/Woche ODER 2–3g EPA/DHA Supplement.'
            },
            {
              t: 'p',
              text: '<strong>Boxing-Relevanz:</strong> Auch neuroprotektiv – schützt das Gehirn bei Kopftreffern.'
            }
          ]
        },
        {
          t: 'card',
          id: 'elektrolyte-das-unterschaetzte-thema',
          title: 'ELEKTROLYTE – DAS UNTERSCHÄTZTE THEMA',
          blocks: [
            {
              t: 'p',
              text: 'Boxer verlieren pro Stunde Training <strong>1–2.5 Liter Schweiß</strong> mit Natrium, Kalium, Magnesium und Chlorid. Ohne Ersatz: Krämpfe, Schwäche, Schwindel.'
            },
            { t: 'h', text: 'Natrium (Salz)' },
            {
              t: 'p',
              text: 'Der wichtigste Elektrolyt. Boxer brauchen MEHR Salz als Nicht-Sportler, nicht weniger. 1 Std. Training = ~1g Natrium verloren.'
            },
            {
              t: 'p',
              text: '<strong>Lösung:</strong> Essen normal salzen. Bei >90 Min. Training: Elektrolyt-Drink mit ~500mg Natrium/L.'
            },
            { t: 'h', text: 'Kalium' },
            {
              t: 'p',
              text: 'Muskelkontraktion + Nervensignale. Mangel = Krämpfe und Herzrhythmusstörungen.'
            },
            {
              t: 'p',
              text: '<strong>Quellen:</strong> Bananen (422mg), Kartoffeln (897mg!), Avocado (485mg), Spinat (558mg).'
            },
            { t: 'h', text: 'Selbstgemachter Elektrolyt-Drink' },
            {
              t: 'p',
              text: '1L Wasser + 1/4 TL Salz + Saft einer halben Zitrone + 1 EL Honig. Kostet ~20 Cent, funktioniert besser als teure Sportdrinks.'
            },
            { t: 'h', text: 'Hydration-Regel' },
            {
              t: 'list',
              items: [
                'Minimum <strong>35–40ml pro kg Körpergewicht</strong> = {w35}–{w40}ml/Tag',
                '+ 500ml extra pro Trainingsstunde',
                'Urin-Check: hellgelb = gut, dunkelgelb = trinken!',
                'Morgens nach Aufstehen sofort 500ml trinken'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'ern-s4',
      title: 'EINKAUFSLISTE – WAS IM KÜHLSCHRANK SEIN MUSS',
      blocks: [
        {
          t: 'note',
          id: 'grundregel',
          tone: 'info',
          title: 'Grundregel',
          text: 'Kaufe zu 80% unverarbeitete Lebensmittel. Wenn es keine Zutatenliste hat (Reis, Fleisch, Gemüse, Obst) oder maximal 5 Zutaten – kauf es. 20% darf Convenience sein (Whey, Reiswaffeln, Tiefkühl-Gemüse).'
        },
        {
          t: 'card',
          id: 'protein-quellen-wochenbedarf',
          title: 'PROTEIN-QUELLEN (Wochenbedarf)',
          blocks: [
            { t: 'h', text: 'MUSS' },
            {
              t: 'list',
              items: [
                '1.5–2 kg Hähnchenbrust/Putenbrust',
                '1 Packung Eier (10–12 Stück)',
                '500g Rinderhüftsteak oder Hackfleisch (mager)',
                '1 kg Skyr oder Magerquark',
                '1 Dose Thunfisch (max 2/Woche)',
                '1 Packung Lachs/Forelle (frisch oder TK)'
              ]
            },
            { t: 'h', text: 'OPTIONAL' },
            {
              t: 'list',
              items: [
                'Hüttenkäse',
                'Putenschinken (Aufschnitt)',
                'Whey-Protein (1 kg hält 3–4 Wochen)',
                'Casein-Protein (für abends)'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'kohlenhydrate-wochenbedarf',
          title: 'KOHLENHYDRATE (Wochenbedarf)',
          blocks: [
            { t: 'h', text: 'MUSS' },
            {
              t: 'list',
              items: [
                '2 kg Reis (weiß UND Vollkorn)',
                '1 kg Haferflocken',
                '1 kg Kartoffeln oder Süßkartoffeln',
                '1 Bund Bananen (6–8 Stück)',
                '1 Packung Vollkornnudeln',
                '1 Packung Reiswaffeln'
              ]
            },
            { t: 'h', text: 'OPTIONAL' },
            {
              t: 'list',
              items: [
                'Quinoa',
                'Bagels (Pre-Training)',
                'Honig',
                'Datteln (schnelle Energie)',
                'Vollkornbrot/Wraps'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'fette-snacks',
          title: 'FETTE & SNACKS',
          blocks: [
            { t: 'h', text: 'MUSS' },
            {
              t: 'list',
              items: [
                '1 Flasche natives Olivenöl',
                '1 Glas Erdnussbutter (ohne Palmöl)',
                '1 Packung Mandeln oder Walnüsse',
                '2 Avocados'
              ]
            },
            { t: 'h', text: 'OPTIONAL' },
            {
              t: 'list',
              items: [
                'Leinsamen (geschrotet)',
                'Kürbiskerne (Magnesium + Zink)',
                'Dunkle Schokolade >70% (Magnesium, Antioxidantien)'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'gemuese-obst',
          title: 'GEMÜSE & OBST',
          blocks: [
            { t: 'h', text: 'MUSS (Gemüse – JEDEN TAG mindestens 3 Portionen)' },
            {
              t: 'list',
              items: [
                'Brokkoli (Vitamin C, Sulforaphan)',
                'Spinat (Eisen, Magnesium, Nitrate)',
                'Paprika (Vitamin C Champion – 250% Tagesbedarf/100g)',
                'Zwiebeln + Knoblauch (in fast jedem Gericht)',
                'Tiefkühl-Gemüsemischung (für Notfall)'
              ]
            },
            { t: 'h', text: 'OBST (2–3 Portionen/Tag)' },
            {
              t: 'list',
              items: [
                'Bananen (Kalium, schnelle Energie)',
                'Beeren (Antioxidantien, wenig Zucker)',
                'Äpfel (Ballaststoffe, Snack)',
                'Zitronen (für Wasser + Vitamin C)'
              ]
            }
          ]
        },
        {
          t: 'note',
          id: 'was-nicht-im-einkaufswagen-landen-sollte',
          tone: 'warn',
          title: 'Was NICHT im Einkaufswagen landen sollte',
          text: 'Softdrinks, Fruchtsäfte (purer Zucker ohne Ballaststoffe), Tiefkühlpizza, Fertiggerichte mit >10 Zutaten, Energy-Drinks (Koffein ja, aber als Kaffee oder Tablette – nicht mit 30g Zucker). Alkohol: schon 2 Bier nach dem Training reduzieren die Muskelproteinsynthese um 24%.'
        }
      ]
    },
    {
      id: 'ern-s5',
      title: 'TIMING – WANN WAS ESSEN',
      blocks: [
        {
          t: 'dyn',
          id: 'ernTimeline',
          title: 'Dein Tag im Plan',
          text: 'Die Uhrzeiten richten sich nach deinen Arbeits- und Trainingszeiten. An einem freien Tag fallen die Trainingsmahlzeiten weg, nach Sparring ändert sich die Recovery-Mahlzeit.',
          meals: [
            {
              id: 'morgensnack',
              when: 'aufstehen+0:05',
              tone: 'gold',
              title: 'Vor-Morgentraining Snack',
              body: '~25 g schnelle KH und ~5 g Protein. Schnelle Energie ohne Magenprobleme.'
            },
            {
              id: 'hauptmahlzeit',
              when: 'aufstehen+1:00',
              tone: 'rot',
              title: 'Hauptmahlzeit, die wichtigste des Tages',
              body: 'Innerhalb von 30 Minuten nach dem Training. 40 g Protein und 60 g KH, davon mindestens 2,5 g Leucin.'
            },
            {
              id: 'proteinbolus',
              when: 'arbeitsbeginn+2:00',
              tone: 'blau',
              title: 'Protein-Bolus',
              body: '25 bis 30 g Protein und ~20 g KH. Gleichmäßige Verteilung über den Tag bringt 18 % mehr Muskelproteinsynthese als ungleichmäßige.'
            },
            {
              id: 'glykogen',
              when: 'arbeitsbeginn+4:30',
              tone: 'orange',
              title: 'Glykogen-Füllung',
              varianten: {
                training: 'Glykogen-Loading 5 bis 6 Stunden vor dem Abendtraining. 40 g Protein, 70 g KH und Gemüse.',
                frei: 'Normales Mittagessen. 40 g Protein, 50 g KH und Gemüse.'
              }
            },
            {
              id: 'pre',
              when: 'training-1:00',
              tone: 'gold',
              nur: 'training',
              title: 'Pre-Training Snack',
              body: '40 bis 50 g schnelle KH und 15 g Protein, wenig Fett.'
            },
            {
              id: 'hydration',
              when: 'training',
              tone: 'blau',
              nur: 'training',
              title: 'Hydration während des Trainings',
              body: '150 bis 250 ml Elektrolyt-Wasser alle 15 bis 20 Minuten. Über 90 Minuten zusätzlich 30 bis 60 g KH pro Stunde.'
            },
            {
              id: 'recovery',
              when: 'training+1:30',
              tone: 'gruen',
              nur: 'training',
              title: 'Recovery-Mahlzeit',
              varianten: {
                normal: '30 bis 40 g Casein-Protein und ~20 g KH. Langsame Aminosäuren über 6 bis 8 Stunden.',
                sparring: 'Sofort nach dem Sparring: 40 g schnelles Protein und 30 g schnelle KH. 60 Minuten später eine vollständige Mahlzeit mit 40 g Protein und 80 g KH.'
              }
            },
            {
              id: 'abendessen',
              when: 'arbeitsende+1:00',
              tone: 'gruen',
              nur: 'frei',
              title: 'Abendessen ohne Training',
              body: '30 bis 40 g Protein und moderate KH. Kein besonderes Timing nötig.'
            }
          ],
          tagesarten: {
            boxen: 'Boxtraining',
            pa: 'Partnerarbeit',
            pratzen: 'Pratzen',
            sparring: 'Sparring',
            technik: 'Technik',
            frei: 'Frei',
            cardio: 'Cardio'
          }
        },
        {
          t: 'note',
          id: 'leucin-timing',
          tone: 'sci',
          title: 'Warum Leucin',
          text: 'Leucin ist die Aminosäure, die den Schalter für Muskelaufbau umlegt. Unter 2,5 g pro Mahlzeit wird die Muskelproteinsynthese nicht maximal angeregt. Enthalten in: 25 g Whey (2,5 g), drei Eier (1,3 g), 100 g Hähnchen (2,4 g), 200 g Skyr (1,6 g).'
        },
        {
          t: 'note',
          id: 'mps',
          tone: 'sci',
          title: 'Was Muskelproteinsynthese heißt',
          text: 'Muskelproteinsynthese ist der Vorgang, bei dem dein Körper neues Muskelgewebe aufbaut. Ausgelöst wird er durch Protein und Training, und er hält drei bis fünf Stunden an. Deshalb vier bis fünf Mahlzeiten statt zwei großer.'
        },
        {
          t: 'card',
          id: 'pre-training-1-2h-vorher',
          title: 'PRE-TRAINING (1–2h vorher)',
          blocks: [
            { t: 'p', text: '<strong>Ziel:</strong> Glykogenspeicher voll, kein Völlegefühl.' },
            {
              t: 'p',
              text: '<strong>Was:</strong> <strong>40–60g schnelle KH + 15–20g Protein, wenig Fett.</strong>'
            },
            {
              t: 'p',
              text: 'Schnelle KH-Quellen aus der Einkaufsliste nutzen. Fett verlangsamt die Magenentleerung – deshalb hier minimieren.'
            },
            {
              t: 'p',
              text: '<strong>NIE nüchtern ins harte Training.</strong> Leere Glykogenspeicher = -15% Leistung und erhöhter Muskelabbau.'
            }
          ]
        },
        {
          t: 'card',
          id: 'post-training-0-60-min-danach',
          title: 'POST-TRAINING (0–60 Min. danach)',
          blocks: [
            { t: 'p', text: '<strong>Ziel:</strong> Muskelreparatur starten, Glykogen auffüllen.' },
            {
              t: 'p',
              text: '<strong>Was:</strong> <strong>30–40g schnelles Protein + 40–80g schnelle KH.</strong>'
            },
            {
              t: 'p',
              text: 'Whey ist hier ideal wegen schnellster Absorption. Schnelle KH-Quelle dazu.'
            },
            {
              t: 'p',
              text: '<strong>Das "anabole Fenster" ist real</strong> – Muskelproteinsynthese ist 0–2h nach Training am höchsten. Nicht verpassen.'
            }
          ]
        },
        {
          t: 'card',
          id: 'vor-dem-schlafen',
          title: 'VOR DEM SCHLAFEN',
          blocks: [
            { t: 'p', text: '<strong>Ziel:</strong> 7–8h Aminosäuren-Versorgung im Schlaf.' },
            {
              t: 'p',
              text: '<strong>Was:</strong> <strong>30–40g langsames Protein (Casein-basiert).</strong>'
            },
            {
              t: 'p',
              text: 'Casein wird über 6–8 Stunden absorbiert → konstante Aminosäure-Versorgung während dein Körper im Schlaf repariert. Casein-Quellen findest du in der Einkaufsliste (Milchprodukte).'
            }
          ]
        },
        {
          t: 'card',
          id: 'timing-regeln-auf-einen-blick',
          title: 'TIMING-REGELN AUF EINEN BLICK',
          blocks: [
            {
              t: 'table',
              head: ['Zeitpunkt', 'Was', 'Was NICHT'],
              rows: [
                [
                  'Morgens (Aufstehen)',
                  '500ml Wasser, dann 30–40g Protein + 50–80g KH',
                  'Nüchtern in hartes Training'
                ],
                [
                  '1–2h vor Training',
                  '40–60g schnelle KH + 15–20g Protein, wenig Fett',
                  'Fettreiche Mahlzeiten, Ballaststoff-Bomben'
                ],
                [
                  'Während Training (>90 Min.)',
                  'Elektrolyt-Drink, ggf. 30g KH/Std.',
                  'Feste Nahrung'
                ],
                [
                  '0–60 Min. nach Training',
                  '30–40g schnelles Protein + 40–80g schnelle KH',
                  'Nur Wasser, Mahlzeit auslassen'
                ],
                ['Vor dem Schlafen', '30–40g Casein-Protein', 'Große Mahlzeit (<2h vor Bett)'],
                [
                  'Koffein',
                  'Morgens, max. bis 12:00–13:00',
                  'Nach 14:00 (HWZ 5h → stört Schlaf)'
                ]
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'ern-s6',
      title: 'MAKRO RECHNER',
      blocks: [
        {
          t: 'dyn',
          id: 'makroRechner',
          title: 'Makro-Rechner',
          text: 'Trag Gewicht, Phase, Trainingsvolumen und Beruf ein, dann bekommst du deine persönlichen Werte statt der Richtwerte oben.'
        }
      ]
    },
    {
      id: 'ern-s7',
      title: 'HÄUFIGE FEHLER – WAS BOXER FALSCH MACHEN',
      blocks: [
        {
          t: 'card',
          id: 'fehler-1-zu-wenig-essen',
          title: 'FEHLER #1: ZU WENIG ESSEN',
          blocks: [
            {
              t: 'p',
              text: 'Der häufigste Fehler. Boxer wollen Gewicht halten/verlieren und essen chronisch zu wenig. Resultat:'
            },
            {
              t: 'list',
              items: [
                'Muskeln werden abgebaut (Körper braucht Energie)',
                'Hormonspiegel sinkt (Testosteron, Schilddrüse)',
                'Immunsystem wird schwach (ständig krank)',
                'Trainingsqualität sinkt (keine Energie = kein Fortschritt)'
              ]
            },
            {
              t: 'p',
              text: '<strong>Lösung:</strong> Nur im geplanten Cut Kalorien reduzieren (300–500 kcal Defizit). Außerhalb des Cuts: VOLL ESSEN. Training mit halbem Tank = halber Fortschritt.'
            }
          ]
        },
        {
          t: 'card',
          id: 'fehler-2-kohlenhydrate-meiden',
          title: 'FEHLER #2: KOHLENHYDRATE MEIDEN',
          blocks: [
            {
              t: 'p',
              text: '"Low Carb" und "Keto" sind für Ausdauersportler bei niedriger Intensität – NICHT für Boxer. Boxtraining ist 70% glykogenbasiert.'
            },
            { t: 'h', text: 'Was passiert bei Low Carb + Boxen' },
            {
              t: 'list',
              items: [
                'Glykogenspeicher leer nach 20 Min.',
                'Schlagkraft sinkt ab Runde 2',
                'Reaktionszeit wird langsamer',
                'Recovery dauert 2× so lange',
                'Cortisol steigt, Testosteron sinkt'
              ]
            },
            {
              t: 'p',
              text: '<strong>Lösung:</strong> Kohlenhydrate sind dein Treibstoff. Mindestens 4g/kg pro Tag, an harten Trainingstagen 6–8g/kg.'
            }
          ]
        },
        {
          t: 'card',
          id: 'fehler-3-protein-nur-1-2-am-tag',
          title: 'FEHLER #3: PROTEIN NUR 1–2× AM TAG',
          blocks: [
            {
              t: 'p',
              text: '50g Protein zum Abendessen und sonst nichts bringt weniger als 4× 30g über den Tag verteilt.'
            },
            {
              t: 'p',
              text: '<strong>Warum?</strong> Die Muskelproteinsynthese (MPS) wird pro Mahlzeit ausgelöst und hält 3–5 Stunden. Danach braucht der Körper wieder Protein. Eine riesige Mahlzeit löst NICHT mehr MPS aus als 40g – der Rest wird als Energie verbrannt.'
            },
            {
              t: 'p',
              text: '<strong>Lösung:</strong> 4–5 Mahlzeiten/Snacks mit je 30–50g Protein, gleichmäßig über den Tag. Jede Mahlzeit mindestens 2.5g Leucin.'
            }
          ]
        },
        {
          t: 'card',
          id: 'fehler-4-dehydration',
          title: 'FEHLER #4: DEHYDRATION',
          blocks: [
            {
              t: 'p',
              text: 'Schon 2% Dehydration = 10–15% Leistungseinbruch. Viele Boxer trinken zu wenig, besonders im Alltag.'
            },
            {
              t: 'p',
              text: '<strong>Symptome:</strong> Müdigkeit, Kopfschmerzen, Konzentrationsprobleme, dunkler Urin, Krämpfe, verlangsamte Reaktion.'
            },
            { t: 'h', text: 'Lösung' },
            {
              t: 'list',
              items: [
                '{w35}–{w40}ml Wasser pro Tag (Minimum)',
                '+ 500ml pro Trainingsstunde',
                '500ml sofort nach dem Aufstehen',
                'Wasserflasche IMMER dabei',
                'Urin hellgelb = OK, dunkelgelb = sofort trinken'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'fehler-5-alkohol',
          title: 'FEHLER #5: ALKOHOL',
          blocks: [
            { t: 'h', text: 'Alkohol ist der #1 Recovery-Killer im Sport.' },
            {
              t: 'list',
              items: [
                '2 Bier nach Training = -24% Muskelproteinsynthese',
                'Stört Schlafarchitektur (weniger REM + Tiefschlaf)',
                'Dehydriert (Diuretikum)',
                'Senkt Testosteron für 24–72h',
                'Verlangsamt Glykogen-Resynthese'
              ]
            },
            {
              t: 'p',
              text: '<strong>Realität:</strong> Kein Alkohol ist ideal. Wenn doch: max 1–2 Drinks, NIE nach dem Training, NIE am Abend vor Training/Sparring. 2+ alkoholfreie Tage pro Woche minimum.'
            }
          ]
        },
        {
          t: 'card',
          id: 'fehler-6-supplements-vor-basics',
          title: 'FEHLER #6: SUPPLEMENTS VOR BASICS',
          blocks: [
            {
              t: 'p',
              text: 'Kein Supplement der Welt kompensiert schlechte Ernährung. Erst wenn Grundlagen stehen:'
            },
            { t: 'h', text: 'Lohnt sich (evidenzbasiert)' },
            {
              t: 'list',
              items: [
                'Kreatin Monohydrat 3–5g/Tag (Kraft, Recovery, Gehirn)',
                'Whey/Casein (Convenience, nicht Ersatz)',
                'Vitamin D 2000–4000 IE (Winter)',
                'Omega-3 2–3g EPA/DHA (falls wenig Fisch)',
                'Koffein 3–6mg/kg (Pre-Training)'
              ]
            },
            { t: 'h', text: 'Geldverschwendung' },
            {
              t: 'p',
              text: 'BCAAs (Whey enthält sie), Testosteron-Booster, "Fat Burner", Glutamin (genug in normaler Ernährung), überteuerte Pre-Workouts (nimm Koffein-Tabletten + Kreatin).'
            },
            { t: 'p', text: 'Mehr Details auf der Supplements-Seite.' }
          ]
        }
      ]
    },
    {
      id: 'ern-s8',
      title: 'KAMPFTAG ERNÄHRUNG',
      blocks: [
        {
          t: 'note',
          id: 'amateur-wiegen-am-kampftag',
          tone: 'warn',
          title: 'Amateur-Wiegen = am Kampftag!',
          text: 'Du musst VOR dem Wiegen leicht sein und NACH dem Wiegen schnell Energie tanken. Timing ist alles. KEINE EXPERIMENTE am Kampftag – nur Lebensmittel die du kennst und verträgst.'
        },
        {
          t: 'card',
          id: 'kampfwoche-die-letzten-7-tage',
          title: 'KAMPFWOCHE – DIE LETZTEN 7 TAGE',
          blocks: [
            { t: 'h', text: '7–3 Tage vorher' },
            {
              t: 'list',
              items: [
                'Normal essen, Gewicht überwachen',
                'Trainingsvolumen leicht reduzieren (Tapering)',
                'Falls Gewicht ok: keine Änderung nötig',
                'Falls 1–2 kg drüber: leicht Kohlenhydrate reduzieren (nicht radikal!)'
              ]
            },
            { t: 'h', text: '2 Tage vorher' },
            {
              t: 'list',
              items: [
                'Ballaststoffarme Ernährung (Weißreis statt Vollkorn, weniger Gemüse) – reduziert Darminhalt um 0.5–1 kg',
                'Natrium leicht reduzieren (weniger Salz → weniger Wassereinlagerung)',
                'Normal trinken! Nicht dehydrieren!'
              ]
            },
            { t: 'h', text: 'Abend vorher' },
            {
              t: 'list',
              items: [
                'Letzte Mahlzeit 19:00–20:00, leicht verdaulich: 40g Protein + 60g schnelle KH, wenig Ballaststoffe',
                'Ab 20:00 nur noch kleine Schlucke Wasser',
                'Tasche packen: Mundschutz, Wettkampfpass, Recovery-Essen für danach'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'kampfmorgen-vor-dem-wiegen',
          title: 'KAMPFMORGEN: VOR DEM WIEGEN',
          blocks: [
            { t: 'h', text: 'Aufwachen → Toilette → Gewicht checken' },
            {
              t: 'list',
              items: [
                'Auf Gewicht? → Entspannen, leicht frühstücken nach dem Wiegen',
                '0.5–1 kg drüber? → Warme Kleidung, 10–15 Min. leichte Bewegung (Seilspringen, Spaziergang)',
                '>1.5 kg drüber? → Gefährliche Zone. Leichte Sauna max 20 Min. + Spucken (Notfall)'
              ]
            },
            { t: 'h', text: 'Zum Wiegen mitnehmen' },
            {
              t: 'list',
              items: [
                'Leichteste Kleidung (Unterhose)',
                'Wettkampfpass + Sportausweis',
                'Recovery-Essen in der Tasche (siehe rechts)'
              ]
            },
            {
              t: 'h',
              text: 'MAXIMAL 2–3% Körpergewicht über Nacht verlieren. Mehr = Leistung sinkt dramatisch.'
            }
          ]
        },
        {
          t: 'card',
          id: 'nach-dem-wiegen-vor-dem-kampf',
          title: 'NACH DEM WIEGEN → VOR DEM KAMPF',
          blocks: [
            { t: 'h', text: 'Sofort nach Wiegen (2–4h vor Ring)' },
            {
              t: 'list',
              items: [
                '0.5L Elektrolyt-Drink (kleine Schlucke, nicht auf einmal!)',
                '40–50g schnelle KH + 15–20g Protein',
                'Keine Völlegefühl – leicht verdaulich!'
              ]
            },
            { t: 'h', text: '60–90 Min. vor dem Ring' },
            {
              t: 'list',
              items: [
                '~15g schnelle KH (kleiner Snack)',
                'Rote-Beete-Shot (NUR falls vorher getestet!)',
                'Koffein 3mg/kg (NUR falls gewohnt – {w3}mg)',
                'Letzte Schlucke Wasser'
              ]
            },
            { t: 'h', text: 'Zwischen Kämpfen (Meisterschaft)' },
            {
              t: 'list',
              items: [
                'Sofort: Elektrolyte + 30–50g schnelle KH',
                '15–20g schnelles Protein',
                'Kleine Portionen, nicht vollstopfen',
                'Mund ausspülen mit Kohlenhydrat-Lösung (ZNS-Trick: Gehirn registriert Energie → Leistung steigt)'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'kampftag-packliste-ernaehrung',
          title: 'KAMPFTAG-PACKLISTE ERNÄHRUNG',
          blocks: [
            { t: 'p', text: 'Das sollte in deiner Tasche sein:' },
            { t: 'h', text: 'Pflicht' },
            {
              t: 'list',
              items: [
                '4–6 Reiswaffeln',
                '2–3 Bananen',
                'Honig (kleine Tube/Portionspackung)',
                '1L Elektrolyt-Drink (vorgemischt)',
                '1 Portion Whey in Shaker (trocken)',
                '0.5L Wasser extra'
              ]
            },
            { t: 'h', text: 'Optional' },
            {
              t: 'list',
              items: [
                'Datteln oder Energieriegel',
                'Rote-Beete-Shot',
                'Koffein-Tabletten',
                'Kleine Salzpackung (für Elektrolyte)'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'ern-s9',
      title: 'GEWICHTSKLASSE RICHTIG WÄHLEN',
      blocks: [
        {
          t: 'card',
          id: 'in-welcher-klasse-solltest-du-boxen',
          title: 'IN WELCHER KLASSE SOLLTEST DU BOXEN?',
          blocks: [
            {
              t: 'p',
              text: '<strong>Grundregel:</strong> Du solltest ganzjährig maximal 3–4% über deiner Kampfgewichtsklasse liegen. Alles darüber = aggressives Cutten nötig = Leistungsverlust.'
            },
            { t: 'h', text: 'Teste dich selbst' },
            {
              t: 'list',
              items: [
                'Iss 2 Wochen normal (kein Tracking, kein Diäten), trainiere normal',
                'Wiege dich jeden Morgen nüchtern',
                'Dein Durchschnittgewicht = dein "Walk-Around-Weight"',
                'Die nächstliegende Gewichtsklasse unter diesem Wert ist deine Klasse'
              ]
            },
            {
              t: 'p',
              text: '<strong>Beispiel:</strong> Walk-Around-Weight 78 kg → Klasse 75 kg (Mittelgewicht). Aber NICHT Klasse 69 kg, weil das zu viel Gewichtsverlust wäre.'
            },
            { t: 'h', text: 'Warnsignal "falsche Klasse"' },
            {
              t: 'list',
              items: [
                'Du musst >5 kg cutten für jeden Kampf',
                'Du fühlst dich am Kampftag schwach/benommen',
                'Du bist ständig hungrig im Training',
                'Dein Krafttraining stagniert seit Monaten'
              ]
            },
            {
              t: 'p',
              text: '→ Dann bist du in der falschen Klasse. Eine Klasse hoch = besser ernährt = bessere Leistung.'
            }
          ]
        },
        {
          t: 'note',
          id: 'quellen',
          tone: 'sci',
          title: 'Quellen',
          text: 'ISSN Position Stand – Protein and Exercise (2017) · ACSM Nutrition and Athletic Performance (2016) · Boxing Science Nutrition Guide (Danny Wilson) · Phil Daru Fight Nutrition · Helms et al. 2014 (Protein during weight loss) · Thomas et al. 2016 (ACSM/AND/DC) · Maughan et al. 2018 (IOC Consensus) · Burke et al. 2019 (Carbohydrate for athletes) · Schoenfeld & Aragon 2018 (Protein timing meta-analysis)'
        }
      ]
    }
  ]
});
