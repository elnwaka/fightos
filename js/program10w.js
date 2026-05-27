/* ============================================
   BOXSPEC – 10-Wochen Boxing Science Programm
   Basiert auf dem "Train Like A Champion" System
   ============================================ */

// ===== PHASE DEFINITIONS =====
var P10W_PHASES = [
  { weeks: [1,2,3], name: 'Grundlagen', nameShort: 'Foundations', color: 'var(--green)', load: ['M','MH','H'] },
  { weeks: [4,5,6,7], name: 'Kraft-Schnelligkeit', nameShort: 'Strength-Speed', color: 'var(--blue)', load: ['M','MH','H','R'] },
  { weeks: [8,9], name: 'Spitzenleistung', nameShort: 'Peak', color: 'var(--red)', load: ['H','MH'] },
  { weeks: [10], name: 'Tapering', nameShort: 'Taper', color: 'var(--gold)', load: ['R'] }
];

function getP10WPhase(week) {
  for (var i = 0; i < P10W_PHASES.length; i++) {
    if (P10W_PHASES[i].weeks.indexOf(week) !== -1) return P10W_PHASES[i];
  }
  return P10W_PHASES[0];
}

// Is this a deload week? Weeks 4 and 8 in the 3:1 pattern
function isP10WDeload(week) {
  return week === 4 || week === 8;
}

// ===== EXERCISE DATABASE (new exercises not in existing DB) =====
var exercisesProgram10W = [
  // --- FOUNDATIONS (Weeks 1-3) ---
  { id:'kb-sumo-deadlift', muscles:['gluteus','quad_l','quad_r','core'], name:'KB SUMO DEADLIFT',
    muscle:'PRIMÄR: Gluteus, Oberschenkel · SEKUNDÄR: Core, Rückenstrecker',
    goals:['power','injury'],
    desc:'Breiter Stand, Kettlebell zwischen den Füßen. Hüfte senken, Rücken gerade, explosiv hochdrücken. Ideal als Einstieg ins Hüftdominantes Training.',
    sets:['Grundlagen: <strong>3×8</strong>','Aufbau: <strong>3×6</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Trainiert das Hüftgelenk-Muster, das die Basis für Schlagkraft bildet. Gelenk- und einsteigerfreundlich.',
    boxingConnection:'Die Hüftstrecker sind der primäre Kraftgenerator bei jedem Schlag. Der KB Sumo Deadlift trainiert dieses Muster mit minimalem Verletzungsrisiko und bildet die Grundlage für den Trap Bar Deadlift in späteren Phasen.',
    video:'https://www.youtube.com/results?search_query=kettlebell+sumo+deadlift+form' },

  { id:'goblet-squat', muscles:['quad_l','quad_r','gluteus','core'], name:'GOBLET SQUAT',
    muscle:'PRIMÄR: Quadrizeps, Gluteus · SEKUNDÄR: Core, oberer Rücken',
    goals:['power','footwork'],
    desc:'Kettlebell oder Kurzhantel vor der Brust halten. Tief absenken, Ellbogen zwischen Knie, aufrecht bleiben. Perfekte Kniebeuge-Technik lernen.',
    sets:['Grundlagen: <strong>3×8</strong>','Aufbau: <strong>3×10</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Baut Grundkraft in der Kniebeuge auf und verbessert die tiefe Kampfstellung.',
    boxingConnection:'Die tiefe Kniebeuge-Position imitiert die Kampfstellung beim Ducken und Ausweichen. Goblet Squats erzwingen aufrechte Haltung und Core-Spannung – beides essentiell für Boxer.',
    video:'https://www.youtube.com/results?search_query=goblet+squat+form+technique' },

  { id:'strict-press-ups', muscles:['brust','schulter_l','schulter_r'], name:'STRICT PRESS-UPS',
    muscle:'PRIMÄR: Pectoralis, Trizeps · SEKUNDÄR: Deltoid, Core',
    goals:['power','jab'],
    desc:'Klassischer Liegestütz mit perfekter Form. Voller ROM, Core angespannt, Ellbogen ca. 45°. Kontrolliert runter (2 Sek.), explosiv hoch.',
    sets:['Grundlagen: <strong>3×10</strong>','Aufbau: <strong>3×12</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Basis-Druckbewegung die die Push-Kette für gerade Schläge stärkt.',
    boxingConnection:'Die Push-Kette (Brust, Trizeps, vorderer Deltoid) ist verantwortlich für die Endgeschwindigkeit von Jab und Cross. Strict Press-Ups bauen die Grundkraft auf, bevor explosive Varianten (Plyo Push-Ups) folgen.',
    video:'https://www.youtube.com/results?search_query=strict+pushup+proper+form' },

  { id:'db-shoulder-press', muscles:['schulter_l','schulter_r','core'], name:'DB SHOULDER PRESS (KNIEND)',
    muscle:'PRIMÄR: Deltoid · SEKUNDÄR: Trizeps, Core',
    goals:['power','jab','shoulders'],
    desc:'Halb kniend, Kurzhantel auf Schulterhöhe. Explosiv nach oben drücken. Die kniende Position eliminiert Beinunterstützung und zwingt den Core zur Arbeit.',
    sets:['Grundlagen: <strong>3×10</strong>','Aufbau: <strong>3×8</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Schulterstabilität und -kraft in einer knienden Position, die Core-Aktivierung erzwingt.',
    boxingConnection:'Die Schulter muss bei jedem Schlag stabilisieren und Kraft übertragen. Die kniende Position eliminiert Kompensation durch die Beine und erzwingt echte Schulterkraft und Core-Stabilität.',
    video:'https://www.youtube.com/results?search_query=half+kneeling+dumbbell+shoulder+press' },

  { id:'goblet-split-squat', muscles:['quad_l','quad_r','gluteus'], name:'GOBLET SPLIT SQUAT',
    muscle:'PRIMÄR: Quadrizeps, Gluteus · SEKUNDÄR: Core, Adduktoren',
    goals:['power','footwork','injury'],
    desc:'Ausfallschritt-Position, Kettlebell vor der Brust. Kontrolliert absenken bis Knie fast den Boden berührt. Aufrecht bleiben.',
    sets:['Grundlagen: <strong>3×12 je Seite</strong>','Aufbau: <strong>3×10</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Unilaterale Beinkraft – Boxen ist nie symmetrisch. Deckt Seitendefizite auf.',
    boxingConnection:'Im Boxring stehst du immer asymmetrisch. Der Split Squat trainiert einbeinige Kraft in der Ausfallschritt-Position – genau die Position beim Einsteppen für einen Cross oder beim Ausweichen.',
    video:'https://www.youtube.com/results?search_query=goblet+split+squat+form' },

  { id:'supine-iso-hold', muscles:['core'], name:'SUPINE ISO HOLD',
    muscle:'PRIMÄR: Core (isometrisch) · Anti-Extension',
    goals:['power','rotation'],
    desc:'Rückenlage, Beine angehoben (90° Hüfte, 90° Knie). Arme nach vorne gestreckt. Position halten – unterer Rücken bleibt am Boden.',
    sets:['Hold: <strong>20-30 Sek. × 3</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Anti-Extensions-Kraft verhindert Energieverlust bei der Kraftübertragung durch den Rumpf.',
    boxingConnection:'Core-Steifigkeit ist der Schlüssel zur Schlagkraft-Übertragung. Der Supine ISO Hold trainiert die Fähigkeit, den Rumpf stabil zu halten während die Extremitäten arbeiten – exakt was beim Schlagen passiert.',
    video:'https://www.youtube.com/results?search_query=supine+isometric+hold+core+exercise' },

  { id:'leg-lowers', muscles:['core'], name:'LEG LOWERS',
    muscle:'PRIMÄR: Untere Bauchmuskulatur · Anti-Extension',
    goals:['power','rotation'],
    desc:'Rückenlage, Beine gestreckt nach oben. Langsam ein Bein oder beide Beine senken, ohne den unteren Rücken vom Boden zu lösen.',
    sets:['Reps: <strong>10 × 3</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Kontrollierte Becken-Stabilisation unter Belastung.',
    boxingConnection:'Die Fähigkeit, das Becken unter dynamischer Beinbelastung stabil zu halten, ist fundamental für explosive Fußarbeit und stabile Schlagpositionen.',
    video:'https://www.youtube.com/results?search_query=leg+lowers+core+exercise' },

  { id:'plank-shoulder-tap', muscles:['core','schulter_l','schulter_r'], name:'PLANK SHOULDER TAP',
    muscle:'PRIMÄR: Core (Anti-Rotation) · SEKUNDÄR: Schultern',
    goals:['rotation','injury'],
    desc:'Liegestütz-Position. Abwechselnd eine Hand zur gegenüberliegenden Schulter tippen. Hüfte stabil halten – nicht rotieren!',
    sets:['Reps: <strong>8 je Seite × 3</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Anti-Rotations-Training unter instabilen Bedingungen – wie im Clinch.',
    boxingConnection:'Im Boxen musst du Rotationskräfte widerstehen (Clinch, Körpertreffer) während du gleichzeitig eine Hand bewegen willst. Plank Shoulder Taps trainieren genau diese Fähigkeit.',
    video:'https://www.youtube.com/results?search_query=plank+shoulder+tap+anti+rotation' },

  { id:'hand-elevated-plank', muscles:['core'], name:'HAND ELEVATED PLANK HOLD',
    muscle:'PRIMÄR: Core (isometrisch)',
    goals:['injury','rotation'],
    desc:'Plank auf erhöhter Fläche (Bank/Box). Perfekte gerade Linie halten. Bauch und Gesäß angespannt.',
    sets:['Hold: <strong>30 Sek. × 3</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Grundlagen-Plank der die Core-Ausdauer für die Kampfstellung aufbaut.',
    boxingConnection:'Die Kampfstellung erfordert konstante Core-Spannung über 3×3 Minuten. Ein starker Plank ist die Basis für diese isometrische Ausdauer.',
    video:'https://www.youtube.com/results?search_query=elevated+plank+hold' },

  { id:'single-arm-farmer-walk', muscles:['core','obliques_l','obliques_r','unterarm_l','unterarm_r'], name:'SINGLE ARM FARMER WALK',
    muscle:'PRIMÄR: Core (Anti-Lateral-Flexion) · SEKUNDÄR: Grip',
    goals:['clinch','hands','injury'],
    desc:'Schwere Kurzhantel in einer Hand, aufrecht gehen ohne zur Seite zu neigen. 10 Schritte je Seite.',
    sets:['Sets: <strong>3×10 Schritte je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Trainiert Anti-Lateral-Flexion – Widerstand gegen seitliche Kräfte wie im Clinch.',
    boxingConnection:'Im Clinch drückt der Gegner dich zur Seite. Single Arm Farmer Walks trainieren die Fähigkeit, unter einseitiger Last aufrecht und stabil zu bleiben. Plus: Griffkraft für 12 Runden.',
    video:'https://www.youtube.com/results?search_query=single+arm+farmer+carry+core' },

  // --- STRENGTH-SPEED (Weeks 4-7) ---
  { id:'landmine-squat', muscles:['quad_l','quad_r','gluteus','core'], name:'LANDMINE SQUAT',
    muscle:'PRIMÄR: Quadrizeps, Gluteus · SEKUNDÄR: Core, Schultern',
    goals:['power','footwork'],
    desc:'Stangenende in Ecke, anderes Ende vor der Brust halten. Tiefe Kniebeuge mit natürlicher Vorneigung. Leichterer Einstieg als Langhantel-Kniebeuge.',
    sets:['Kraft-Speed: <strong>3×6</strong>','Aufbau: <strong>3×8</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Die Landmine zwingt zu einer natürlichen Squat-Mechanik die der Kampfstellung ähnelt.',
    boxingConnection:'Die leichte Vorneigung beim Landmine Squat imitiert die Kampfhaltung besser als ein Backsquat. Die asymmetrische Belastung trainiert den Core unter kampfnahen Bedingungen.',
    video:'https://www.youtube.com/results?search_query=landmine+squat+technique' },

  { id:'db-floor-press', muscles:['brust','schulter_l','schulter_r'], name:'DB FLOOR PRESS',
    muscle:'PRIMÄR: Pectoralis, Trizeps · SEKUNDÄR: Deltoid',
    goals:['power','jab'],
    desc:'Rückenlage am Boden, Kurzhanteln auf Brusthöhe drücken. Der Boden begrenzt den ROM und schützt die Schultern. Explosiv drücken.',
    sets:['Kraft-Speed: <strong>3×8</strong>','Peak: <strong>4×6</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Schulterfreundliches Drücken mit Fokus auf die Lock-Out-Phase – genau wo beim Schlag die Endgeschwindigkeit entsteht.',
    boxingConnection:'Die Floor Press eliminiert den Dehnungs-Shortening-Zyklus und trainiert reine konzentrische Push-Kraft. Der verkürzte ROM schützt die Schultern und fokussiert auf die Lock-Out-Phase – den Punkt maximaler Faust-Geschwindigkeit beim Jab und Cross.',
    video:'https://www.youtube.com/results?search_query=dumbbell+floor+press+technique' },

  { id:'landmine-shoulder-press', muscles:['schulter_l','schulter_r','core'], name:'LANDMINE SHOULDER PRESS',
    muscle:'PRIMÄR: Deltoid, Trizeps · SEKUNDÄR: Core-Rotation, Serratus',
    goals:['power','jab','rotation'],
    desc:'Halb kniend, Stangenende auf Schulterhöhe. Explosiv nach oben-vorne drücken – imitiert den Cross-Schlag. Core stabil halten.',
    sets:['Kraft-Speed: <strong>3×8 je Seite</strong>','Peak: <strong>4×10</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Die diagonale Druckrichtung der Landmine entspricht der Schlag-Biomechanik besser als jede andere Schulterübung.',
    boxingConnection:'Die Landmine Shoulder Press repliziert das Push-Muster eines Cross mit diagonaler Kraftrichtung und Rumpfrotation. Der Serratus anterior – kritisch für die Schulterprotraktion beim Schlagen – wird maximal aktiviert.',
    video:'https://www.youtube.com/results?search_query=landmine+shoulder+press+single+arm' },

  { id:'goblet-reverse-lunge', muscles:['quad_l','quad_r','gluteus'], name:'GOBLET REVERSE LUNGE',
    muscle:'PRIMÄR: Gluteus, Quadrizeps · SEKUNDÄR: Core, Balance',
    goals:['footwork','power','injury'],
    desc:'Kettlebell vor der Brust, Schritt nach hinten in den Ausfallschritt. Knie fast am Boden. Explosiv zurück in den Stand.',
    sets:['Kraft-Speed: <strong>3×12 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Rückwärts-Ausfallschritt trainiert die Rückwärtsbewegung und Dezelerationskraft.',
    boxingConnection:'Boxer bewegen sich ständig rückwärts (Ausweichen, Distanz schaffen). Der Reverse Lunge trainiert die exzentrische Bremskraft und explosive Richtungswechsel – fundamental für gute Fußarbeit.',
    video:'https://www.youtube.com/results?search_query=goblet+reverse+lunge+form' },

  { id:'single-leg-hip-thrust', muscles:['gluteus'], name:'SINGLE LEG HIP THRUST',
    muscle:'PRIMÄR: Gluteus Maximus (einseitig)',
    goals:['power','rotation'],
    desc:'Schultern auf Bank, ein Bein aufgestellt, anderes angehoben. Hüfte hoch bis Körper gerade. 2 Sek. oben halten.',
    sets:['Kraft-Speed: <strong>3×12 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Einseitige Gluteus-Kraft für die unilaterale Natur des Boxens.',
    boxingConnection:'Beim Schlagen wird die Kraft primär über ein Bein generiert. Der einbeinige Hip Thrust trainiert genau diese asymmetrische Kraftentwicklung und identifiziert Seitenunterschiede.',
    video:'https://www.youtube.com/results?search_query=single+leg+hip+thrust+technique' },

  // --- EXTENDED WARM-UP EXERCISES ---
  { id:'altitude-landing', muscles:['quad_l','quad_r','gluteus','wade_l','wade_r'], name:'ALTITUDE LANDING (TO JUMP)',
    muscle:'PRIMÄR: Quads, Gluteus · SEKUNDÄR: Waden, Core',
    goals:['power','footwork'],
    desc:'Von einer Box (30-50cm) absteigen, weich landen und Position halten (Foundations) oder sofort explosiv hochspringen (Strength-Speed). Trainiert Landungsmechanik und reaktive Kraft.',
    sets:['Warm-Up: <strong>3×5</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Trainiert die Aufprall-Absorption und reaktive Kraft – wichtig für schnelle Richtungswechsel.',
    boxingConnection:'Altitude Landings trainieren die exzentrische Kraftkontrolle bei schnellen Richtungswechseln. In der Strength-Speed Phase wird daraus ein Altitude Landing to Jump – reaktive Kraft wie beim explosiven Einsteppen nach einem Ausweichmanöver.',
    video:'https://www.youtube.com/results?search_query=altitude+landing+drop+jump+plyometric' },

  { id:'mb-ice-skaters', muscles:['gluteus','quad_l','quad_r'], name:'MB ICE SKATERS',
    muscle:'PRIMÄR: Gluteus Medius, Adduktoren · SEKUNDÄR: Core, Balance',
    goals:['footwork','power'],
    desc:'Mit Medizinball, seitlich springen wie ein Eisläufer. Einbeinig landen, stabilisieren, explosiv zur anderen Seite.',
    sets:['Warm-Up: <strong>3×5 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Laterale Explosivkraft mit Last – direkt übertragbar auf seitliche Beinarbeit.',
    boxingConnection:'Boxer bewegen sich primär seitlich. Ice Skaters mit Medball trainieren laterale Explosivkraft und einbeinige Stabilität unter Last – Schlüsselqualitäten für schnelle Richtungswechsel und Ausweichbewegungen.',
    video:'https://www.youtube.com/results?search_query=medicine+ball+ice+skaters+lateral' },

  { id:'landmine-punch-band', muscles:['schulter_l','schulter_r','core','brust'], name:'LANDMINE PUNCH MIT BAND',
    muscle:'PRIMÄR: Deltoid, Serratus · SEKUNDÄR: Core-Rotation',
    goals:['power','jab','speed'],
    desc:'Landmine-Stange mit Widerstandsband. Explosive Punch-Bewegung gegen progressiven Widerstand. Boxspezifischste Warm-Up-Übung.',
    sets:['Warm-Up: <strong>3×5 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Direkteste Übertragung auf Schlagbewegung – akkommodierender Widerstand wie beim echten Schlag.',
    boxingConnection:'Das Band bietet akkommodierenden Widerstand: je weiter die Stange rausgeht, desto schwerer wird es – genau wie die Kraftkurve bei einem Schlag. Trainiert schlagspezifische Explosivität in der Warm-Up-Phase.',
    video:'https://www.youtube.com/results?search_query=landmine+punch+band+resistance+boxing' },

  { id:'mb-punch-throw', muscles:['schulter_l','schulter_r','core','brust'], name:'MB PUNCH THROW',
    muscle:'PRIMÄR: Deltoid, Core-Rotation · SEKUNDÄR: Brust, Trizeps',
    goals:['power','jab','speed'],
    desc:'Medizinball (3-5kg) mit Punch-Bewegung gegen eine Wand werfen. Volle Hüftrotation wie beim Cross. Maximal explosiv.',
    sets:['Warm-Up: <strong>3×5 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Direkte Schlagkraft-Messung und -Training. Weite = Kraft.',
    boxingConnection:'Der MB Punch Throw ist der Gold-Standard-Test für schlagspezifische Kraft bei Boxing Science. Die Korrelation zwischen Wurfweite und Schlagkraft liegt bei r=0.78. Als Warm-Up aktiviert er die gesamte kinetische Kette.',
    video:'https://www.youtube.com/results?search_query=medicine+ball+punch+throw+boxing' },

  { id:'band-assisted-pogos', muscles:['wade_l','wade_r'], name:'BAND ASSISTED POGOS',
    muscle:'PRIMÄR: Waden, Achillessehne · Reaktive Kraft',
    goals:['footwork'],
    desc:'Schnelle, kurze Sprünge auf der Stelle mit Bandunterstützung. Minimaler Bodenkontakt, maximale Frequenz. Trainiert reaktive Steifigkeit.',
    sets:['Warm-Up: <strong>3×10</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Reaktive Waden-Steifigkeit für leichtfüßige Beinarbeit.',
    boxingConnection:'Die "Federwirkung" der Waden ist essentiell für die leichtfüßige Boxing-Beinarbeit. Pogos trainieren die Steifigkeit der Unterschenkel-Sehnen-Einheit für schnelle, reaktive Bodenkontakte.',
    video:'https://www.youtube.com/results?search_query=pogo+jumps+ankle+stiffness' },

  // --- PEAK (Weeks 8-9) ---
  { id:'db-cmj', muscles:['quad_l','quad_r','gluteus','wade_l','wade_r'], name:'DB COUNTERMOVEMENT JUMP',
    muscle:'PRIMÄR: Quads, Gluteus · SEKUNDÄR: Waden, Core',
    goals:['power','speed'],
    desc:'Kurzhanteln in den Händen, Counter Movement Jump mit maximaler Höhe. Leichte Last (5-10kg je Hand), volle Explosivität.',
    sets:['Peak: <strong>3×5</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Maximale Sprungkraft unter Last – direkte Korrelation mit Schlagkraft.',
    boxingConnection:'Die CMJ-Höhe ist der stärkste Prädiktor für Schlagkraft (r=0.72-0.80, Turner et al. 2011). DB CMJs in der Peak-Phase maximieren die explosive Kraft für den Kampf.',
    video:'https://www.youtube.com/results?search_query=dumbbell+countermovement+jump' },

  { id:'landmine-punch-throw', muscles:['schulter_l','schulter_r','core','brust'], name:'LANDMINE PUNCH THROW',
    muscle:'PRIMÄR: Gesamte Schlagkette · Explosiv',
    goals:['power','jab','speed'],
    desc:'Landmine-Stange mit maximaler Geschwindigkeit nach vorne werfen (loslassen!). Volle kinetische Kette: Bein → Hüfte → Core → Schulter → Release.',
    sets:['Peak: <strong>3×5 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Die boxspezifischste Kraftübung – komplette kinetische Kette mit Maximalgeschwindigkeit.',
    boxingConnection:'Der Landmine Punch Throw ist die ultimative schlagspezifische Übung: Die Stange wird tatsächlich losgelassen, was maximale Beschleunigung erzwingt – genau wie beim echten Schlag. Keine Abbremsung am Ende = maximale RFD-Entwicklung.',
    video:'https://www.youtube.com/results?search_query=landmine+punch+throw+explosive+boxing' },

  { id:'mb-box-jumps', muscles:['quad_l','quad_r','gluteus','wade_l','wade_r'], name:'MB BOX JUMPS',
    muscle:'PRIMÄR: Quads, Gluteus · SEKUNDÄR: Core, Schultern',
    goals:['power'],
    desc:'Medizinball (3-7kg) vor der Brust halten, auf Box springen. Die Zusatzlast erhöht die Kraftanforderung. Weich landen, zurücksteigen.',
    sets:['Peak: <strong>3×5</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Sprungkraft unter Last – Peak-Phase-Übung für maximale explosive Kraft.',
    boxingConnection:'MB Box Jumps kombinieren Sprungkraft mit Ganzkörper-Stabilität unter Last. Die Sprung-Landings trainieren die reactive strength die für explosive Fußarbeit im Ring entscheidend ist.',
    video:'https://www.youtube.com/results?search_query=medicine+ball+box+jump+weighted' },

  { id:'max-effort-pogos', muscles:['wade_l','wade_r'], name:'MAX EFFORT POGOS',
    muscle:'PRIMÄR: Waden, Achillessehne · Maximale reaktive Kraft',
    goals:['footwork','speed'],
    desc:'Pogo Jumps ohne Bandunterstützung – maximale Höhe UND Frequenz. Fast and High. Kurzer Bodenkontakt, maximaler Output.',
    sets:['Peak: <strong>3×5 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Maximale Waden-Reaktivkraft für die schnellste Beinarbeit.',
    boxingConnection:'In der Peak-Phase wird die Federwirkung der Unterschenkel maximiert. Max Effort Pogos entwickeln die höchste reaktive Steifigkeit für explosive Richtungswechsel im Ring.',
    video:'https://www.youtube.com/results?search_query=max+effort+pogo+jumps+plyometric' },

  { id:'banded-kb-swing', muscles:['gluteus','quad_l','quad_r','core'], name:'BANDED KB SWING',
    muscle:'PRIMÄR: Gluteus, Hüftstrecker · SEKUNDÄR: Core, Schultern',
    goals:['power','speed'],
    desc:'Kettlebell Swing mit Widerstandsband. Akkommodierender Widerstand – oben am schwersten. Maximale Hüft-Extension-Geschwindigkeit.',
    sets:['Peak: <strong>4×5</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Akkomodierender Widerstand erzwingt maximale Beschleunigung durch die gesamte Bewegung.',
    boxingConnection:'Der Banded KB Swing trainiert explosive Hüftextension mit progressivem Widerstand – je weiter die Hüfte streckt, desto schwerer wird es. Das imitiert die Kraftkurve beim Schlagen, wo die Endgeschwindigkeit der Faust entscheidend ist.',
    video:'https://www.youtube.com/results?search_query=banded+kettlebell+swing+resistance' },

  { id:'deadbug', muscles:['core'], name:'DEADBUG',
    muscle:'PRIMÄR: Core (Anti-Extension) · Koordination',
    goals:['injury','rotation'],
    desc:'Rückenlage, Arme nach oben, Beine 90°. Gegengleich Arm und Bein strecken. Unterer Rücken bleibt am Boden.',
    sets:['Sets: <strong>3×5 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Core-Stabilisation mit gegengleicher Arm-Bein-Koordination – wie beim Boxen.',
    boxingConnection:'Boxen erfordert konstante gegengleiche Koordination: linker Fuß drückt ab während rechte Faust schlägt. Der Deadbug trainiert genau dieses kontralaterale Muster mit Core-Stabilisation.',
    video:'https://www.youtube.com/results?search_query=deadbug+exercise+core+anti+extension' },

  { id:'split-stance-cable-row', muscles:['bizeps_l','bizeps_r','schulter_l','schulter_r','core'], name:'SPLIT STANCE CABLE ROW',
    muscle:'PRIMÄR: Latissimus, Rhomboideen · SEKUNDÄR: Bizeps, Core',
    goals:['clinch','shoulders','injury'],
    desc:'Ausfallschritt-Position am Kabelzug. Einarmig rudern mit Rotation. Boxspezifische Zugbewegung in Kampfstellung.',
    sets:['Peak: <strong>3×10 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Zugbewegung in der Kampfstellung – trainiert Rückhand-Rückführung und Clinch-Kontrolle.',
    boxingConnection:'Die Split Stance Cable Row kombiniert einarmiges Rudern mit der Ausfallschritt-Kampfstellung. Trainiert die Rückenmuskulatur die für schnelles Zurückziehen der Hände und Clinch-Dominanz verantwortlich ist.',
    video:'https://www.youtube.com/results?search_query=split+stance+single+arm+cable+row' },

  // --- MOBILITY ---
  { id:'half-kneeling-lateral-lunge', muscles:['gluteus','quad_l','quad_r'], name:'1/2 KNEELING LATERAL LUNGE ROTATION',
    muscle:'Hüft-Adduktoren, Hüftbeuger · Mobilität',
    goals:['injury','footwork'],
    desc:'Halb kniend, seitlicher Ausfallschritt mit Rotation. Öffnet die Hüftadduktoren und verbessert die laterale Beweglichkeit.',
    sets:['Mobility: <strong>2×8 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Verbessert die seitliche Hüftbeweglichkeit für bessere Fußarbeit und tiefere Kampfstellung.',
    boxingConnection:'Eingeschränkte Hüft-Adduktoren limitieren die seitliche Beinarbeit und die Tiefe der Kampfstellung. Diese Übung öffnet die Innenseite der Hüfte für freiere laterale Bewegung.',
    video:'https://www.youtube.com/results?search_query=half+kneeling+lateral+lunge+rotation+mobility' },

  { id:'banded-hip-floss', muscles:['gluteus'], name:'BANDED HIP FLOSS',
    muscle:'Hüftgelenk-Kapsel · Mobilität',
    goals:['injury','footwork'],
    desc:'Widerstandsband um die Hüfte, Zug nach hinten. Hüfte in verschiedene Richtungen bewegen. Mobilisiert die Gelenkkapsel direkt.',
    sets:['Mobility: <strong>2×30 Sek. je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Direkte Gelenkmobilisation für freiere Hüftrotation – essentiell für Schlagkraft.',
    boxingConnection:'Die Hüftrotation ist der Hauptgenerator der Schlagkraft. Eingeschränkte Hüftmobilität limitiert die Rotationsgeschwindigkeit und damit die Kraftübertragung von Bein zu Faust.',
    video:'https://www.youtube.com/results?search_query=banded+hip+floss+mobilization' },

  { id:'split-squat-rotate', muscles:['quad_l','quad_r','core','obliques_l','obliques_r'], name:'SPLIT SQUAT LUNGE & ROTATE',
    muscle:'Hüftbeuger, Obliques · Stabilisation + Mobilität',
    goals:['rotation','injury'],
    desc:'Ausfallschritt-Position, Rotation des Oberkörpers zur Seite des vorderen Beins. Kombiniert Hüftbeuger-Dehnung mit Rotationsmobilität.',
    sets:['Mobility: <strong>2×6 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Kombiniert Hüftbeuger-Öffnung mit Rotationsmobilität – zwei Schlüsselbereiche für Boxer.',
    boxingConnection:'Enge Hüftbeuger (vom Sitzen und der Kampfstellung) limitieren die Hüftextension und damit die Schlagkraft. Diese Übung öffnet die Hüftbeuger und verbessert gleichzeitig die thorakale Rotation.',
    video:'https://www.youtube.com/results?search_query=split+squat+rotation+mobility+boxing' },

  { id:'quadruped-thoracic-rotation', muscles:['core','obliques_l','obliques_r'], name:'QUADRUPED THORACIC ROTATION',
    muscle:'Brustwirbelsäule · Rotationsmobilität',
    goals:['rotation','injury','shoulders'],
    desc:'Vierfüßlerstand, eine Hand hinter den Kopf. Ellbogen nach oben rotieren, Blick folgt. Nur BWS rotiert – LWS bleibt stabil.',
    sets:['Mobility: <strong>2×8 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Die BWS-Rotation bestimmt deine Schlagweite und defensive Kopfbewegung.',
    boxingConnection:'Eingeschränkte thorakale Rotation = kürzere Schläge + kompensatorische Überbelastung der Lendenwirbelsäule. Jeder Zentimeter mehr BWS-Rotation erhöht die Schlagreichweite und verbessert die defensive Kopfbewegung (Slips).',
    video:'https://www.youtube.com/results?search_query=quadruped+thoracic+rotation+mobility' },

  { id:'thoracic-extensions', muscles:['core'], name:'THORACIC EXTENSIONS',
    muscle:'Brustwirbelsäule · Extensionsmobilität',
    goals:['injury','shoulders'],
    desc:'Foam Roller unter der oberen Rücken. Arme hinter dem Kopf, kontrolliert über den Roller strecken. Nur BWS-Bereich.',
    sets:['Mobility: <strong>2×8</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Öffnet den oberen Rücken der durch die Kampfstellung chronisch verrundet.',
    boxingConnection:'Die Kampfstellung (Schultern nach vorne, Kinn runter) führt zu chronischer thorakaler Kyphose. Thoracic Extensions wirken dem entgegen und verbessern Schulter-Overhead-Mobilität und Atmungskapazität.',
    video:'https://www.youtube.com/results?search_query=thoracic+extension+foam+roller' },

  { id:'side-clams', muscles:['gluteus'], name:'SIDE CLAMS',
    muscle:'Gluteus Medius · Aktivierung',
    goals:['injury','footwork'],
    desc:'Seitlage, Knie gebeugt, Füße zusammen. Oberes Knie öffnen wie eine Muschel. Hüfte bleibt stabil – nicht nach hinten rollen.',
    sets:['Aktivierung: <strong>2×8 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Gluteus Medius Aktivierung für Hüftstabilität bei seitlicher Beinarbeit.',
    boxingConnection:'Der Gluteus Medius stabilisiert die Hüfte bei einbeiniger Belastung und seitlicher Bewegung. Schwacher Glut Med = Knie-Valgus und instabile Beinarbeit. Side Clams aktivieren diesen Muskel vor dem Training.',
    video:'https://www.youtube.com/results?search_query=side+clam+exercise+glute+medius' },

  { id:'quadruped-hip-extensions', muscles:['gluteus'], name:'QUADRUPED HIP EXTENSIONS',
    muscle:'Gluteus Maximus · Aktivierung',
    goals:['power','injury'],
    desc:'Vierfüßlerstand, ein Bein gestreckt nach hinten-oben heben. Hüfte bleibt gerade – nicht aufdrehen. Squeeze am höchsten Punkt.',
    sets:['Aktivierung: <strong>2×8 je Seite</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Gezielte Gluteus Maximus Aktivierung vor schwerem Training.',
    boxingConnection:'Der Gluteus Maximus muss vor dem Krafttraining aktiviert werden, damit er in den Hauptübungen (Deadlift, Squat) korrekt feuert. Ohne Aktivierung übernehmen Hamstrings und unterer Rücken – Verletzungsgefahr.',
    video:'https://www.youtube.com/results?search_query=quadruped+hip+extension+glute+activation' }
];

// ===== STRENGTH TEMPLATES PER PHASE =====
var P10W_STRENGTH = {
  // WEEKS 1-3: FOUNDATIONS
  foundations: {
    sessionA: {
      title: 'Kraft A — Grundlagen',
      rpe: 7,
      warmup: 'Altitude Landings 3×5 · Ice Skaters 3×5 je Seite · Landmine Punch 3×5 je Seite · Box Jump 3×5 · Punch ISO Hold 3×5 Sek. · Low & Fast Pogos 3×10',
      cooldown: 'Foam Rolling 3 Min. + Dehnung Hüftbeuger, Schultern, BWS je 30 Sek.',
      duration: 50,
      exercises: [
        { id: 'kb-sumo-deadlift', sets: '3 × 8', rest: '90 Sek.', note: 'HINGE — Superset mit 1B' },
        { id: 'goblet-squat', sets: '3 × 8', rest: '90 Sek.', note: 'SQUAT — Superset mit Plank Shoulder Taps (6 je Seite)' },
        { id: 'strict-press-ups', sets: '3 × 10', rest: '60 Sek.', note: 'PRESS — Superset mit 2B' },
        { id: 'db-shoulder-press', sets: '3 × 10', rest: '60 Sek.', note: 'PRESS — halb kniend, Superset mit TRX Row (10 Reps)' },
        { id: 'goblet-split-squat', sets: '3 × 12 je Seite', rest: '60 Sek.', note: 'SINGLE-LEG — Superset mit Band Pull-Aparts (10)' },
        { id: 'face-pulls', sets: '3 × 12', rest: '45 Sek.', note: 'PREHAB — Band Face Pull' }
      ],
      exercisesAfter: [
        { id: 'pallof-press', sets: '3 × 6 je Seite', rest: '', note: 'Core Circuit' },
        { id: 'hand-elevated-plank', sets: '3 × 30 Sek.', rest: '', note: 'Core Circuit' },
        { id: 'leg-lowers', sets: '3 × 10', rest: '', note: 'Core Circuit' }
      ],
      hint: 'Grundlagen-Phase: Technik lernen, Bewegungsmuster aufbauen. Nicht zu schwer – saubere Ausführung hat Priorität.'
    },
    sessionB: {
      title: 'Kraft B — Grundlagen',
      rpe: 7,
      warmup: 'Altitude Landings 3×5 · Ice Skaters 3×5 je Seite · Landmine Punch 3×5 je Seite · Box Jump 3×5 · Punch ISO Hold 3×5 Sek. · Low & Fast Pogos 3×10',
      cooldown: 'Foam Rolling 3 Min. + Dehnung Hüftbeuger, Schultern, BWS je 30 Sek.',
      duration: 50,
      exercises: [
        { id: 'goblet-squat', sets: '3 × 8', rest: '90 Sek.', note: 'SQUAT — Superset mit Deadbug (5 je Seite)' },
        { id: 'landmine-shoulder-press', sets: '3 × 10 je Seite', rest: '60 Sek.', note: 'PRESS — halb kniend' },
        { id: 'hip-thrust', sets: '3 × 10', rest: '60 Sek.', note: 'HINGE — Hüft-March Variante, Superset mit Band Face Pull' },
        { id: 'pull-ups', sets: '3 × 6-10', rest: '90 Sek.', note: 'PULL — oder Single Arm Cable Pulldown mit Rotation' },
        { id: 'goblet-split-squat', sets: '3 × 12 je Seite', rest: '60 Sek.', note: 'SINGLE-LEG — Reverse Variante' },
        { id: 'face-pulls', sets: '3 × 12', rest: '45 Sek.', note: 'PREHAB — Band Face Pull' }
      ],
      exercisesAfter: [
        { id: 'pallof-press', sets: '3 × 6 je Seite', rest: '', note: 'Core Circuit' },
        { id: 'plank-shoulder-tap', sets: '3 × 8 je Seite', rest: '', note: 'Core Circuit' },
        { id: 'supine-iso-hold', sets: '3 × 20 Sek.', rest: '', note: 'Core Circuit' },
        { id: 'single-arm-farmer-walk', sets: '3 × 10 Schritte je Seite', rest: '', note: 'Core Circuit' }
      ],
      hint: 'Grundlagen-Phase: Technik lernen, Bewegungsmuster aufbauen. Session B fokussiert auf Ziehen und einbeinige Arbeit.'
    }
  },

  // WEEKS 4-7: STRENGTH-SPEED
  strengthSpeed: {
    sessionA: {
      title: 'Kraft A — Kraft-Schnelligkeit',
      rpe: 8,
      warmup: 'Altitude Landing to Jump 3×5 · MB Ice Skaters 3×5 je Seite · Landmine Punch mit Band 3×5 je Seite · CMJ 3×5 · MB Punch Throw 3×5 je Seite · Band Assisted Pogos 3×10',
      cooldown: 'Foam Rolling 3 Min. + Dehnung Hüftbeuger, Schultern, BWS je 30 Sek.',
      duration: 50,
      exercises: [
        { id: 'trap-bar-deadlift', sets: '3 × 6', rest: '2-3 Min.', note: 'HINGE — Superset mit 1B. Schwerer als Foundations' },
        { id: 'landmine-squat', sets: '3 × 6', rest: '2 Min.', note: 'SQUAT — Superset mit Plank Banded Side Taps (6 je Seite)' },
        { id: 'db-floor-press', sets: '3 × 8', rest: '90 Sek.', note: 'PRESS — Superset mit 2B' },
        { id: 'landmine-shoulder-press', sets: '3 × 8 je Seite', rest: '90 Sek.', note: 'PRESS — Superset mit Single Arm Bent Over Row (8)' },
        { id: 'goblet-reverse-lunge', sets: '3 × 12 je Seite', rest: '60 Sek.', note: 'SINGLE-LEG — Superset mit Band Pull-Aparts (10)' },
        { id: 'single-leg-hip-thrust', sets: '3 × 12 je Seite', rest: '60 Sek.', note: 'HINGE — Superset mit Band Face Pull (12)' }
      ],
      exercisesAfter: [
        { id: 'pallof-press', sets: '3 × 6 je Seite', rest: '', note: 'Core Circuit' },
        { id: 'hand-elevated-plank', sets: '3 × 30 Sek.', rest: '', note: 'Core Circuit' },
        { id: 'leg-lowers', sets: '3 × 10', rest: '', note: 'Core Circuit' }
      ],
      hint: 'Kraft-Schnelligkeit: Schwerere Lasten + explosive Ausführung. Superset-Struktur für Zeiteffizienz.'
    },
    sessionB: {
      title: 'Kraft B — Kraft-Schnelligkeit',
      rpe: 8,
      warmup: 'Altitude Landing to Jump 3×5 · MB Ice Skaters 3×5 je Seite · Landmine Punch mit Band 3×5 je Seite · CMJ 3×5 · MB Punch Throw 3×5 je Seite · Band Assisted Pogos 3×10',
      cooldown: 'Foam Rolling 3 Min. + Dehnung Hüftbeuger, Schultern, BWS je 30 Sek.',
      duration: 50,
      exercises: [
        { id: 'landmine-squat', sets: '3 × 6', rest: '2 Min.', note: 'SQUAT — Superset mit Deadbug (5 je Seite)' },
        { id: 'landmine-shoulder-press', sets: '3 × 8 je Seite', rest: '90 Sek.', note: 'PRESS — Superset mit Split Stance Cable Row (8)' },
        { id: 'single-leg-hip-thrust', sets: '3 × 12 je Seite', rest: '60 Sek.', note: 'HINGE — Superset mit Band Face Pull (12)' },
        { id: 'pull-ups', sets: '3 × 8', rest: '90 Sek.', note: 'PULL — gewichtet wenn möglich' },
        { id: 'goblet-reverse-lunge', sets: '3 × 12 je Seite', rest: '60 Sek.', note: 'SINGLE-LEG — Superset mit Band Pull-Aparts (10)' },
        { id: 'face-pulls', sets: '3 × 12', rest: '45 Sek.', note: 'PREHAB — jedes Training' }
      ],
      exercisesAfter: [
        { id: 'pallof-press', sets: '3 × 6 je Seite', rest: '', note: 'Core Circuit' },
        { id: 'plank-shoulder-tap', sets: '3 × 8 je Seite', rest: '', note: 'Core Circuit' },
        { id: 'supine-iso-hold', sets: '3 × 20 Sek.', rest: '', note: 'Core Circuit' },
        { id: 'single-arm-farmer-walk', sets: '3 × 10 Schritte je Seite', rest: '', note: 'Core Circuit' }
      ],
      hint: 'Kraft-Schnelligkeit B: Fokus auf Pulling, unilaterale Arbeit und Anti-Rotation.'
    }
  },

  // WEEKS 8-9: PEAK
  peak: {
    sessionA: {
      title: 'Kraft A — Spitzenleistung',
      rpe: 9,
      warmup: 'DB CMJ 3×5 · Repeated MB Ice Skaters 3×5 je Seite · Landmine Punch Throw 3×5 je Seite · MB Box Jumps 3×5 · Max Effort Pogos 3×5 · Back Step to MB Punch 3×10',
      cooldown: 'Leichtes Foam Rolling + Dehnung 5 Min.',
      duration: 45,
      exercises: [
        { id: 'banded-kb-swing', sets: '4 × 5', rest: '2 Min.', note: 'EXPLOSIVE HINGE — Superset mit 1B' },
        { id: 'deadbug', sets: '3 × 5 je Seite', rest: '60 Sek.', note: 'CORE — Superset mit 1A' },
        { id: 'db-floor-press', sets: '4 × 6', rest: '90 Sek.', note: 'PRESS — Superset mit Landmine Punch (10)' },
        { id: 'split-stance-cable-row', sets: '3 × 10 je Seite', rest: '60 Sek.', note: 'PULL — oder Pull-Ups gewichtet' },
        { id: 'goblet-reverse-lunge', sets: '3 × 12 je Seite', rest: '60 Sek.', note: 'SINGLE-LEG — Superset mit Single Leg Hip Thrust (10)' },
        { id: 'face-pulls', sets: '3 × 10', rest: '45 Sek.', note: 'PREHAB — Prone Reverse Flies oder Banded Triple Threat' }
      ],
      exercisesAfter: [],
      hint: 'Spitzenleistung: Maximale Explosivität. Nur 2 Wochen — dann Taper. Reduzierter Core-Circuit, dafür explosive Warm-Up.'
    },
    sessionB: {
      title: 'Kraft B — Spitzenleistung',
      rpe: 9,
      warmup: 'DB CMJ 3×5 · Repeated MB Ice Skaters 3×5 je Seite · Landmine Punch Throw 3×5 je Seite · MB Box Jumps 3×5 · Max Effort Pogos 3×5',
      cooldown: 'Leichtes Foam Rolling + Dehnung 5 Min.',
      duration: 45,
      exercises: [
        { id: 'landmine-squat', sets: '4 × 5', rest: '2 Min.', note: 'SQUAT — Landmine Squat to Press explosiv' },
        { id: 'deadbug', sets: '3 × 5 je Seite', rest: '60 Sek.', note: 'CORE' },
        { id: 'landmine-punch-throw', sets: '4 × 5 je Seite', rest: '90 Sek.', note: 'PUNCH-SPEZIFISCH — maximale Geschwindigkeit!' },
        { id: 'pull-ups', sets: '3 × 8-10', rest: '90 Sek.', note: 'PULL — oder Weighted Pull-Ups' },
        { id: 'single-leg-hip-thrust', sets: '3 × 10 je Seite', rest: '60 Sek.', note: 'HINGE' },
        { id: 'face-pulls', sets: '3 × 10', rest: '45 Sek.', note: 'PREHAB' }
      ],
      exercisesAfter: [],
      hint: 'Spitzenleistung B: Schwerpunkt auf schlagspezifischer Power und Pulling.'
    }
  },

  // WEEK 10: TAPER
  taper: {
    sessionA: {
      title: 'Kraft — Taper (reduziert)',
      rpe: 6,
      warmup: 'Leichte Pogos 2×10 · Schattenboxen 2 Min. · Band Pull-Aparts 2×10',
      cooldown: 'Dehnung 5 Min.',
      duration: 30,
      exercises: [
        { id: 'landmine-squat', sets: '2 × 5', rest: '2 Min.', note: 'SQUAT — leichter, explosiv. Volumen -50%' },
        { id: 'landmine-punch-throw', sets: '2 × 5 je Seite', rest: '90 Sek.', note: 'PUNCH-SPEZIFISCH — Geschwindigkeit beibehalten' },
        { id: 'pull-ups', sets: '2 × 6', rest: '90 Sek.', note: 'PULL — leichter' },
        { id: 'face-pulls', sets: '2 × 15', rest: '45 Sek.', note: 'PREHAB' }
      ],
      exercisesAfter: [],
      hint: 'Taper: Volumen um 50% reduziert, Intensität beibehalten. Fitness erhalten, Ermüdung abbauen.'
    }
  }
};

// ===== CONDITIONING TEMPLATES PER PHASE =====
var P10W_CONDITIONING = {
  // WEEKS 1-3: MUSCLE BUFFERING
  muscleBuffering: [
    {
      title: 'Conditioning — Muscle Buffering (lang)',
      rpe: 8, duration: 35,
      hint: 'Laktat-Schwellentraining: 2 Min. hart, 3 Min. Erholung. Puls in die rote Zone, dann kontrolliert erholen. Verbessert die Laktat-Toleranz.',
      warmup: '5 Min. locker einlaufen + dynamisches Stretching',
      cooldown: '5 Min. locker auslaufen + Dehnung',
      exercises: [
        { id: 'zone2', sets: '2 Min. @ 14.5-18.5 km/h × 5 Reps', rest: '3 Min. Erholung', note: 'Muscle Buffering — RPE 7-8. Treadmill: 3% Steigung. Ziel: Laktat 10-12 mmol/L' }
      ]
    },
    {
      title: 'Conditioning — Muscle Buffering (kurz)',
      rpe: 9, duration: 30,
      hint: 'Kürzere, härtere Intervalle. 1 Min. maximaler Einsatz, 2 Min. Erholung. Verbessert die Pufferkapazität der Muskeln.',
      warmup: '5 Min. locker einlaufen + dynamisches Stretching',
      cooldown: '5 Min. locker auslaufen + Dehnung',
      exercises: [
        { id: 'zone2', sets: '1 Min. @ 17.5-22.0 km/h × 8 Reps', rest: '2 Min. Erholung', note: 'Kurze Muscle Buffering — RPE 8-9. Höhere Geschwindigkeit, kürzere Belastung' }
      ]
    }
  ],

  // WEEKS 4-7: HIIT — CENTRAL ADAPTATIONS
  hiitCentral: [
    {
      title: 'HIIT — Zentrale Adaptationen (4 Min.)',
      rpe: 9, duration: 40,
      hint: 'VO₂max-Training: 4 Min. in der roten Zone (>90% HFmax), 2 Min. aktive Erholung. Ziel: So viel Zeit wie möglich >90% HFmax. Der Königsweg zu weltklasse Ausdauer.',
      warmup: '5 Min. locker einlaufen + dynamisches Stretching',
      cooldown: '5 Min. locker auslaufen + Dehnung',
      exercises: [
        { id: 'hiit-4x4', sets: '4 Min. @ 14-19 km/h × 4-6 Reps', rest: '2 Min. aktiv (Work:Rest 2:1)', note: 'HIIT Central — RPE 9. Treadmill: 1.5% Steigung. Ziel: >90% HFmax' }
      ]
    },
    {
      title: 'HIIT — Zentrale Adaptationen (2 Min.)',
      rpe: 9, duration: 35,
      hint: 'Kürzere HIIT-Variante mit höherer Intensität. 2 Min. Belastung, 1 Min. Erholung.',
      warmup: '5 Min. locker einlaufen + dynamisches Stretching',
      cooldown: '5 Min. locker auslaufen + Dehnung',
      exercises: [
        { id: 'hiit-4x4', sets: '2 Min. @ 16-20 km/h × 6-8 Reps', rest: '1 Min. aktiv', note: 'HIIT Central kurz — RPE 9. Höhere Geschwindigkeit, kürzere Belastung' }
      ]
    }
  ],

  // WEEKS 8-10: SPEED ENDURANCE
  speedEndurance: [
    {
      title: 'Speed Endurance — Kurze Intervalle',
      rpe: 9, duration: 30,
      hint: 'Kampfspezifische Kurzintervalle: 15-20 Sek. Vollgas, 10-5 Sek. Pause. 6 Intervalle = 1 Set (3 Min.). Simuliert die Intensitätsspitzen im Kampf.',
      warmup: '5 Min. locker einlaufen + dynamisches Stretching',
      cooldown: '5 Min. locker auslaufen + Dehnung',
      exercises: [
        { id: 'sit-sprints', sets: '6 × 15-20 Sek. pro Set × 3-4 Sets', rest: '10-5 Sek. zwischen Reps, 1 Min. zwischen Sets', note: 'Speed Endurance — RPE 9. @ 15-20 km/h. Transfer auf kampfspezifische Aktivität' }
      ]
    }
  ]
};

// ===== MOVEMENT/MOBILITY DAILY PROTOCOL =====
var P10W_MOVEMENT = {
  title: 'Mobility — Tägliches Protokoll',
  duration: 10,
  rpe: 2,
  hint: 'Tägliches Mobilitätsprotokoll: 10 Min. Hüfte, Schulter, Glute-Aktivierung. Vor dem Training oder morgens. Kann auch als Recovery-Session mit 2-3 Sets statt 1-2 durchgeführt werden.',
  exercises: [
    { id: 'half-kneeling-lateral-lunge', sets: '1 × 8 je Seite', rest: '', note: 'Hüft-Mobilität' },
    { id: 'banded-hip-floss', sets: '1 × 30 Sek. je Seite', rest: '', note: 'Hüft-Mobilität' },
    { id: 'quadruped-thoracic-rotation', sets: '1 × 8 je Seite', rest: '', note: 'Schulter/BWS-Mobilität' },
    { id: 'thoracic-extensions', sets: '1 × 8', rest: '', note: 'BWS-Mobilität' },
    { id: 'side-clams', sets: '1 × 8 je Seite', rest: '', note: 'Glute-Aktivierung' },
    { id: 'quadruped-hip-extensions', sets: '1 × 8 je Seite', rest: '', note: 'Glute-Aktivierung' }
  ]
};

// ===== NUTRITION GUIDELINES PER PHASE =====
var P10W_NUTRITION = {
  heavy: {
    label: 'Schwere Trainingstage',
    carbs: '4-6 g/kg', protein: '1.6-2.4 g/kg', fat: '~1 g/kg',
    timing: 'Stärkehaltige KH 3-4h vor dem Training. 30g einfache KH + 20-40g Protein innerhalb 1h nach dem Training. 40g Casein vor dem Schlaf.',
    note: '20-40g Protein alle 3-4 Stunden über den Tag verteilt. Mindestens 2.5g Leucin pro Mahlzeit.'
  },
  light: {
    label: 'Leichte / Ruhetage',
    carbs: '2-3 g/kg', protein: '1.6-2.0 g/kg', fat: '~1 g/kg',
    timing: 'KH reduzieren, Fett leicht erhöhen. Protein-Verteilung beibehalten.',
    note: 'An Ruhetagen weniger KH, aber Protein-Zufuhr beibehalten für Regeneration.'
  },
  taper: {
    label: 'Taper-Woche',
    carbs: '2 g/kg (steigend auf Carb Loading)', protein: '2.0 g/kg', fat: '~1 g/kg',
    timing: 'KH zunächst reduzieren, dann 48-72h vor dem Kampf Carb Loading (8-10 g/kg).',
    note: 'Gewicht kontrollieren. Trainingsvolumen -40-60%, Kalorien proportional anpassen.'
  },
  fightWeek: {
    label: 'Kampfwoche',
    waterLoading: 'Tag 5-3: 8L/Tag · Tag 2: 2L · Tag 1: nur Schlucke',
    sodium: 'Parallel zur Wasserreduktion: Natrium schrittweise senken',
    preWeigh: 'Low-Residue-Diät ab 48h vor dem Wiegen',
    postWeigh: '1-1.5L Elektrolytlösung (Na 40-80mmol/L) + 1-1.5g/kg KH + 0.3g/kg Protein in den ersten 2h. Weiter trinken bis 150% des verlorenen Gewichts.',
    lastMeal: '3-4h vor dem Kampf: vertraute, leicht verdauliche Mahlzeit'
  },
  hydration: {
    label: 'Hydration',
    daily: '35-40 ml/kg Körpergewicht',
    training: 'Schweißrate monitoren: Gewicht vorher/nachher + Flüssigkeitsaufnahme',
    rehydration: 'Nettoverlust × 1.5 = Ziel-Trinkmenge nach dem Training',
    signs: 'Urinfarbe: hellgelb = gut hydratisiert. Dunkel = sofort trinken.'
  }
};

// ===== WEEK PLAN GENERATOR =====
function generateProgram10WPlan(weekNumber) {
  // Use existing app infrastructure
  var data = getData();
  var s = getUserSchedule();
  var ws = s.weekSchedule || {};
  var plan = {};

  var phase = getP10WPhase(weekNumber);
  var isDeload = isP10WDeload(weekNumber);
  var isTaper = weekNumber === 10;

  // Determine strength templates for this phase
  var strengthKey = 'foundations';
  if (weekNumber >= 4 && weekNumber <= 7) strengthKey = 'strengthSpeed';
  else if (weekNumber >= 8 && weekNumber <= 9) strengthKey = 'peak';
  else if (weekNumber >= 10) strengthKey = 'taper';

  var strengthTemplates = P10W_STRENGTH[strengthKey];

  // Determine conditioning templates for this phase
  var condKey = 'muscleBuffering';
  if (weekNumber >= 4 && weekNumber <= 7) condKey = 'hiitCentral';
  else if (weekNumber >= 8) condKey = 'speedEndurance';

  var condTemplates = P10W_CONDITIONING[condKey];

  // Day constants (reuse from app.js)
  var DAY_NAMES = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'];

  // ===== Pre-scan: sparring and boxing days =====
  var sparringDays = [];
  var boxingDays = [];
  DAY_NAMES.forEach(function(day, di) {
    var d = ws[day] || { time: null, type: 'frei' };
    if (d.type === 'sparring') sparringDays.push(di);
    if (['boxen', 'pa', 'pratzen', 'technik'].includes(d.type)) boxingDays.push(di);
  });
  sparringDays = sparringDays.slice(0, 2); // Max 2 sparring days

  // ===== Determine S&C days (same logic as app.js) =====
  var scDays = [];
  var dayScores = [];
  for (var di = 0; di < 7; di++) {
    if (di === 6) continue; // Sunday rest
    if (sparringDays.indexOf(di) !== -1) continue;
    var minDist = 7;
    sparringDays.forEach(function(si) {
      var fwd = (si - di + 7) % 7;
      var bwd = (di - si + 7) % 7;
      minDist = Math.min(minDist, fwd, bwd);
    });
    dayScores.push({ di: di, dist: minDist });
  }
  dayScores.sort(function(a, b) { return b.dist - a.dist; });

  var maxSC = isTaper ? 1 : 2;
  dayScores.forEach(function(ds) {
    if (scDays.length >= maxSC) return;
    var tooClose = scDays.some(function(existingDi) {
      var gap = Math.abs(ds.di - existingDi);
      gap = Math.min(gap, 7 - gap);
      return gap < 2;
    });
    if (tooClose) return;
    scDays.push(ds.di);
  });
  scDays.sort(function(a, b) { return a - b; });

  // Assign A/B templates
  var scAssignments = {};
  scDays.forEach(function(di, idx) {
    scAssignments[di] = idx; // 0 = Session A, 1 = Session B
  });

  // ===== Determine Conditioning days =====
  var condDays = [];
  var maxCond = isTaper ? 1 : (isDeload ? 2 : 3);

  // Conditioning on days without S&C, not sparring, not Sunday
  var condScores = [];
  for (var ci = 0; ci < 7; ci++) {
    if (ci === 6) continue;
    if (scAssignments[ci] !== undefined) continue;
    if (sparringDays.indexOf(ci) !== -1) continue;
    // Prefer days that are not adjacent to sparring for HIIT
    var minDist2 = 7;
    sparringDays.forEach(function(si) {
      var fwd = (si - ci + 7) % 7;
      var bwd = (ci - si + 7) % 7;
      minDist2 = Math.min(minDist2, fwd, bwd);
    });
    condScores.push({ di: ci, dist: minDist2 });
  }
  condScores.sort(function(a, b) { return b.dist - a.dist; });
  condScores.forEach(function(cs) {
    if (condDays.length >= maxCond) return;
    condDays.push(cs.di);
  });
  condDays.sort(function(a, b) { return a - b; });

  // ===== Morning time calculations =====
  var workStart = s.workStart || '08:00';
  var workEnd = s.workEnd || '17:00';

  function timeBefore(t, hours, mins) {
    var p = t.split(':').map(Number);
    var total = p[0] * 60 + p[1] - hours * 60 - mins;
    if (total < 0) total += 1440;
    var h = Math.floor(total / 60);
    var m = total % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function timeAdd(t, hours, mins) {
    var p = t.split(':').map(Number);
    var total = p[0] * 60 + p[1] + hours * 60 + mins;
    total = total % 1440;
    var h = Math.floor(total / 60);
    var m = total % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  // ===== Generate plan for each day =====
  DAY_NAMES.forEach(function(day, di) {
    var d = ws[day] || { time: null, type: 'frei' };
    var blocks = [];
    var isWeekend = (day === 'sa' || day === 'so');
    var isSparringDay = sparringDays.indexOf(di) !== -1;
    var isBoxingDay = boxingDays.indexOf(di) !== -1;
    var hasSC = scAssignments[di] !== undefined;
    var hasCond = condDays.indexOf(di) !== -1;
    var eveningTime = d.time || '18:00';
    var amStart = isWeekend ? '08:00' : timeBefore(workStart, 1, 30);

    // ===== SUNDAY — REST =====
    if (di === 6) {
      blocks.push({ type: 'off', title: 'Kompletter Ruhetag', time: '09:00', hint: 'Kein Training. Schlaf, Essen, Erholung. Der Körper wird im Schlaf stärker.', rpe: 0, duration: 0 });

    // ===== S&C MORNING =====
    } else if (hasSC) {
      var templateIdx = scAssignments[di];
      var sessions = strengthTemplates.sessionB ? [strengthTemplates.sessionA, strengthTemplates.sessionB] : [strengthTemplates.sessionA];
      var tpl = sessions[templateIdx % sessions.length];

      // Deload: reduce volume
      var scExercises = tpl.exercises.slice();
      if (isDeload) {
        scExercises = scExercises.slice(0, 4); // Fewer exercises on deload
      }

      var mobilityBlock = {
        type: 'recovery',
        title: 'Mobility — Tägliches Protokoll',
        time: amStart,
        duration: P10W_MOVEMENT.duration,
        rpe: P10W_MOVEMENT.rpe,
        hint: P10W_MOVEMENT.hint,
        exercises: P10W_MOVEMENT.exercises.slice()
      };
      blocks.push(mobilityBlock);

      var scBlock = {
        type: 'strength',
        title: tpl.title + (isDeload ? ' (Deload)' : ''),
        time: timeAdd(amStart, 0, 15),
        duration: isDeload ? 35 : tpl.duration,
        rpe: isDeload ? tpl.rpe - 2 : tpl.rpe,
        hint: tpl.hint + (isDeload ? ' DELOAD-WOCHE: Reduziertes Volumen, Fokus auf Technik und Erholung.' : ''),
        warmup: tpl.warmup,
        cooldown: tpl.cooldown,
        exercises: scExercises,
        exercisesBefore: [{ id: 'imt', sets: '30 Atemzüge', rest: '', note: 'Atemtraining mit Widerstand' }],
        exercisesAfter: (tpl.exercisesAfter && !isDeload) ? tpl.exercisesAfter.slice() : []
      };

      // Add neck training on S&C days
      scBlock.exercisesAfter.push({ id: 'iso-nacken', sets: '3 × 10 Sek. pro Richtung', rest: '', note: 'Nackentraining' });

      blocks.push(scBlock);

      // Evening: Boxing or Sparring if scheduled
      if (isSparringDay) {
        blocks.push({ type: 'boxing', title: 'Sparring im Verein', time: eveningTime, hint: 'Sparring-Tag.', rpe: 0, duration: 0, exercises: [] });
      } else if (isBoxingDay) {
        blocks.push({ type: 'boxing', title: 'Boxtraining im Verein', time: eveningTime, hint: 'Training im Verein.', rpe: 0, duration: 0, exercises: [] });
      }

    // ===== CONDITIONING DAY =====
    } else if (hasCond) {
      // Morning: Mobility
      blocks.push({
        type: 'recovery',
        title: 'Mobility — Tägliches Protokoll',
        time: amStart,
        duration: P10W_MOVEMENT.duration,
        rpe: P10W_MOVEMENT.rpe,
        hint: P10W_MOVEMENT.hint,
        exercises: P10W_MOVEMENT.exercises.slice()
      });

      // Select conditioning template (alternate between variants)
      var condIdx = condDays.indexOf(di);
      var condTpl = condTemplates[condIdx % condTemplates.length];

      var condBlock = {
        type: 'cardio',
        title: condTpl.title + (isDeload ? ' (Deload)' : ''),
        time: isWeekend ? '10:00' : eveningTime,
        duration: isDeload ? Math.round(condTpl.duration * 0.7) : condTpl.duration,
        rpe: isDeload ? condTpl.rpe - 1 : condTpl.rpe,
        hint: condTpl.hint + (isDeload ? ' DELOAD: Reduziertes Volumen.' : ''),
        warmup: condTpl.warmup,
        cooldown: condTpl.cooldown,
        exercises: condTpl.exercises.slice()
      };
      blocks.push(condBlock);

      // If also boxing day, add evening boxing
      if (isBoxingDay && !isWeekend) {
        blocks.push({ type: 'boxing', title: 'Boxtraining im Verein', time: eveningTime, hint: 'Training im Verein.', rpe: 0, duration: 0, exercises: [] });
      }

    // ===== SPARRING DAY (no S&C, no conditioning) =====
    } else if (isSparringDay) {
      blocks.push({
        type: 'recovery',
        title: 'Mobility — Tägliches Protokoll',
        time: amStart,
        duration: P10W_MOVEMENT.duration,
        rpe: P10W_MOVEMENT.rpe,
        hint: 'Leichte Mobilität vor dem Sparring. Kein schweres Training am Sparring-Tag.',
        exercises: P10W_MOVEMENT.exercises.slice()
      });
      blocks.push({ type: 'boxing', title: 'Sparring im Verein', time: eveningTime, hint: 'Sparring-Tag. Schutzausrüstung Pflicht!', rpe: 0, duration: 0, exercises: [] });

    // ===== BOXING DAY (no S&C, no conditioning) =====
    } else if (isBoxingDay) {
      blocks.push({
        type: 'recovery',
        title: 'Mobility — Tägliches Protokoll',
        time: amStart,
        duration: P10W_MOVEMENT.duration,
        rpe: P10W_MOVEMENT.rpe,
        hint: P10W_MOVEMENT.hint,
        exercises: P10W_MOVEMENT.exercises.slice()
      });
      blocks.push({ type: 'boxing', title: 'Boxtraining im Verein', time: eveningTime, hint: 'Training im Verein.', rpe: 0, duration: 0, exercises: [] });

    // ===== FREE DAY / RECOVERY =====
    } else {
      blocks.push({
        type: 'recovery',
        title: 'Aktive Erholung',
        time: isWeekend ? '09:00' : amStart,
        duration: 25,
        rpe: 2,
        hint: 'Erholungstag. Leichte Mobilität und Atemtraining. Der Körper wird in der Ruhe stärker.',
        exercises: P10W_MOVEMENT.exercises.slice().concat([
          { id: 'imt', sets: '30 Atemzüge', rest: '', note: 'Atemtraining' }
        ])
      });
    }

    // Sort blocks by time
    blocks.sort(function(a, b) {
      var ap = a.time.split(':').map(Number);
      var bp = b.time.split(':').map(Number);
      return (ap[0] * 60 + ap[1]) - (bp[0] * 60 + bp[1]);
    });

    plan[day] = blocks;
  });

  return plan;
}

// ===== HELPER: Calculate current week =====
function getProgram10WCurrentWeek() {
  var data = getData();
  if (!data || !data.program10wStart) return 1;
  var start = new Date(data.program10wStart + 'T00:00:00');
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var daysDiff = Math.floor((now - start) / 86400000);
  var week = Math.floor(daysDiff / 7) + 1;
  return Math.max(1, Math.min(10, week));
}
