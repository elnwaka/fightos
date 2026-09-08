/* Regeneration als Daten. Siehe js/content.js fuer die Bausteine.

   Diese Seite hatte im Original keine Abschnitts-Ueberschriften, nur drei
   Karten nebeneinander in einem Raster, danach das HRV-Ampelsystem und
   die Produktliste. Auf einem Telefon ist ein dreispaltiges Raster keine
   Struktur, sondern eine lange Wand. Die Abschnitte hier sind deshalb neu
   gezogen, der Inhalt ist unveraendert.

   Geprueft vor dem Wandeln, nach der Regel aus den drei Faellen davor:
   keine leeren Container, keine Nachrender-Aufrufe, keine ${}-Rechnung.
   Diese Seite hat keinen versteckten Block.

   Die Abend- und Morgenprotokolle standen als <br>-getrennte Zeilen in
   einem Absatz. Das sind Listen und stehen jetzt auch so da.

   Die ids sind fest. Sie stehen in geteilten Links. */

Content.define('regeneration', {
  title: 'Regeneration',
  sub: 'Fortschritt entsteht nicht im Training, er entsteht in der Erholung.',
  related: ['ernaehrung', 'supplements', 'periodisierung'],

  sections: [

    { id: 'reg-s1', title: 'Schlaf', accent: 'green', blocks: [
      { t: 'note', id: 'schlafmangel', tone: 'warn', title: 'Unter acht Stunden',
        text: 'Wer weniger als acht Stunden schläft, hat <strong>61 % mehr Verletzungsrisiko</strong> (KASIP, n = 340).' },

      { t: 'card', id: 'abendprotokoll', title: 'Abend-Protokoll', accent: 'green', blocks: [
        { t: 'list', items: [
          '21:00 Blaulicht-Brille auf',
          '21:30 Warme Dusche, 42 °C, 10 Minuten. Verkürzt die Einschlaflatenz um 36 %',
          '21:45 Casein und Supplements',
          '22:10 4-7-8-Atemübung, vier Runden',
          '22:15 Visualisierung, 10 Minuten',
          '22:30 Schlafen, 18 bis 19 °C, komplett dunkel'
        ] },
        { t: 'p', text: '<strong>Ziel:</strong> acht bis neun Stunden. Ein Powernap von 20 Minuten gleicht einen Teil des Rückstands aus, aber nicht alles.' }
      ] }
    ] },

    { id: 'reg-s2', title: 'Kälte und Wärme', accent: 'blue', blocks: [
      { t: 'card', id: 'kaelte', title: 'Cold Water Immersion', accent: 'blue', blocks: [
        { t: 'p', text: '10 bis 15 Minuten bei 10 bis 15 °C. Ziel sind 11 Minuten pro Woche.' },
        { t: 'note', id: 'kein-eisbad-nach-kraft', tone: 'warn', title: 'Nicht nach dem Krafttraining',
          text: 'Kälte direkt nach dem Krafttraining dämpft genau die Muskelanpassung, für die du trainiert hast. An Krafttagen also weglassen oder mehrere Stunden Abstand halten.' }
      ] },

      { t: 'card', id: 'waerme', title: 'Sauna', accent: 'blue', blocks: [
        { t: 'p', text: '15 bis 20 Minuten nach dem Training. Führt zu Plasma-Expansion, Ausschüttung von Wachstumshormon und zur Bildung von Hitzeschockproteinen.' },
        { t: 'p', text: '<strong>Kombination:</strong> Sauna, dann Cold Plunge, dann wieder Wärme bringt den größten Effekt.' }
      ] }
    ] },

    { id: 'reg-s3', title: 'Mobilität und Gewebe', accent: 'gold', blocks: [
      { t: 'card', id: 'nach-dem-training', title: 'Nach dem Training, 10 bis 15 Minuten', accent: 'gold', blocks: [
        { t: 'list', items: [
          'Foam Rolling: Quadrizeps, Hüftbeuger, Brustwirbelsäule, je 60 bis 90 Sekunden',
          'Rotation der Brustwirbelsäule',
          'Schulter-Außenrotation mit Band'
        ] }
      ] },

      { t: 'card', id: 'am-morgen', title: 'Am Morgen, 5 bis 10 Minuten', accent: 'gold', blocks: [
        { t: 'list', items: [
          'Hip 90/90',
          'Brustkorb öffnen',
          'Dead Hang am Türrahmen'
        ] }
      ] },

      { t: 'p', text: '<strong>Kompression:</strong> Kompressionskleidung während und nach dem Training.' }
    ] },

    { id: 'reg-s4', title: 'HRV-Ampel', accent: 'red', blocks: [
      { t: 'p', text: 'Miss deine Herzratenvariabilität morgens direkt nach dem Aufwachen und vergleiche sie mit deinem Mittel der letzten sieben Tage. Nicht der einzelne Wert zählt, sondern die Abweichung.' },
      { t: 'table',
        head: ['Ampel', 'Abweichung', 'Was du tust'],
        rows: [
          ['Grün', 'über +5 % vom 7-Tage-Mittel', 'Volles Training, du kannst steigern. Guter Tag für intensives S&C oder hartes Sparring.'],
          ['Gelb', 'rund ±5 % um das 7-Tage-Mittel', 'Training wie geplant. Beobachte, ob der Trend nach Rot oder Grün läuft.'],
          ['Rot', 'unter −5 % vom 7-Tage-Mittel', 'Intensität zurücknehmen. Drei rote Tage in Folge bedeuten kompletten Ruhetag und Ursachensuche.']
        ] },
      { t: 'note', id: 'hrv-trend', tone: 'sci', title: 'Der Trend schlägt den Einzelwert',
        text: 'Ein einzelner roter Morgen kann an einem späten Essen oder einem Glas Wein liegen. Erst drei Tage in dieselbe Richtung sind ein Signal.' }
    ] },

    { id: 'reg-s5', title: 'Ausrüstung', accent: 'gold', blocks: [
      { t: 'p', text: 'Nichts davon ist Pflicht. Die Liste steht hier, weil regelmäßig danach gefragt wird.' },
      { t: 'link', id: 'blackroll', label: 'BLACKROLL Standard Faszienrolle',
        sub: 'Foam Roller, etwa 30 €',
        text: 'Deutsche Qualität, Standard für Myofascial Release.',
        img: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=150&h=150&fit=crop',
        href: 'https://www.amazon.de/s?k=BLACKROLL+Standard+Faszienrolle' },
      { t: 'link', id: 'powerbreathe', label: 'POWERbreathe Plus Medium',
        sub: 'Atemtraining, IMT, etwa 55 €',
        text: 'Inspiratorisches Muskeltraining. Mehr Ausdauer über die Runden.',
        img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop',
        href: 'https://www.amazon.de/s?k=POWERbreathe+Plus+Medium+Resistance' },
      { t: 'link', id: 'elite-hrv', label: 'Elite HRV App',
        sub: 'App, HRV-Tracking, kostenlos',
        text: 'HRV morgens messen. Erkennt Übertraining, bevor du es spürst.',
        img: 'https://images.unsplash.com/photo-1510017803434-a899b8644e5d?w=150&h=150&fit=crop',
        href: 'https://elitehrv.com' },
      { t: 'link', id: 'neck-harness', label: 'DMoose Neck Harness',
        sub: 'Nackentraining, etwa 20 €',
        text: 'Nacken-Curls mit Gewichtsscheibe. Baut KO-Schutz auf.',
        img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&h=150&fit=crop',
        href: 'https://www.amazon.de/s?k=DMoose+Neck+Harness' },
      { t: 'link', id: 'baender', label: 'Fit Simplify Resistance Bands',
        sub: 'Bänder, Warm-Up, etwa 13 €',
        text: 'Fünf Stärken für Schulter-Warm-Up und Rotatorenmanschette.',
        img: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=150&h=150&fit=crop',
        href: 'https://www.amazon.de/s?k=Fit+Simplify+Resistance+Bands+Set' },
      { t: 'link', id: 'springseil', label: 'Buddy Lee Aero Speed Rope',
        sub: 'Springseil, etwa 40 €',
        text: 'Das Boxing-Springseil. Leicht, schnelle Rotation.',
        img: 'https://images.unsplash.com/photo-1515775538093-d2d95c5ae190?w=150&h=150&fit=crop',
        href: 'https://www.amazon.de/s?k=Buddy+Lee+Aero+Speed+Jump+Rope' }
    ] }
  ]
});
