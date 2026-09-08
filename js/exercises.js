/* ============================================================
   BOXSPEC · UEBUNGSDATENBANK
   ------------------------------------------------------------
   Herausgetrennt aus js/pages.js. Das Handy braucht von dort genau
   diese beiden Dinge: die Uebungen und ihre Bildpfade. Der Rest sind
   Desktop-Renderfunktionen, 263 KB, die auf dem Handy beim Start nur
   geparst und nie aufgerufen wurden.

   Wird von beiden Oberflaechen geladen, Handy wie Desktop, und MUSS
   vor js/pages.js stehen: die Renderfunktionen dort greifen auf
   allExercises und exerciseColors zu.

   Neue Uebungen gehoeren hierher, nicht nach pages.js.
   ============================================================ */

// ===== EXERCISE IMAGES =====
// Bilder liegen lokal (Quelle: free-exercise-db, Unlicense/Public Domain).
// Kein Hotlink auf GitHub mehr — raw.githubusercontent ist kein CDN.
const EXERCISE_IMG_BASE = 'img/exercises/db/';
// Mapping: nur Bilder die 100% zur Übungsbeschreibung passen
// Für fehlende: Bilder in img/exercises/{id}.jpg ablegen
const exerciseImageMap = {
  'trap-bar-deadlift': 'Barbell_Deadlift',              // ✓ Deadlift von Boden, nächste Übereinstimmung
  'jump-squat': 'Freehand_Jump_Squat',                  // ✓ Bodyweight Squat ohne Gewicht
  'landmine-press': 'Landmine_Linear_Jammer',           // ✓ Landmine Barbell Press stehend
  'hip-thrust': 'Barbell_Hip_Thrust',                   // ✓ passt exakt
  'med-ball-rotation': 'Medicine_Ball_Full_Twist',       // ✓ Medizinball Rotation
  'explosive-pushup': 'Drop_Push',                      // ✓ Plyometrischer Push-Up von Boxen
  'overcoming-iso': null,                                // Keine passende Übung in DB
  'single-leg-rdl': 'Kettlebell_One-Legged_Deadlift',   // ✓ Einbeiniger Deadlift mit Kettlebell
  'power-clean': 'Clean',                               // ✓ Barbell Clean vom Boden
  'bench-press': 'Barbell_Bench_Press_-_Medium_Grip',   // ✓ passt exakt
  'zone2': 'Jogging_Treadmill',                         // ✓ Laufband Joggen
  'hiit-4x4': 'Bicycling_Stationary',                   // ✓ Stationäres Fahrrad für Intervalle
  'fartlek': 'Fast_Skipping',                           // ✓ Lauf/Skip-Bewegung
  'sit-sprints': 'Bicycling_Stationary',                // ✓ Stationäres Bike für Sprints
  'iso-nacken': 'Isometric_Neck_Exercise_-_Front_And_Back', // ✓ Isometrische Nackenübung
  'nacken-flexion': 'Lying_Face_Down_Plate_Neck_Resistance', // ✓ Nackenflexion mit Gewicht
  'rice-bucket': null,                                   // Kein Rice Bucket in DB
  'pogo-jumps': null,                                    // Kein Pogo Jump in DB
  'bfr': null,                                          // Keine BFR-Übung in DB
  'imt': null,                                          // Kein Atemtrainer in DB
  'shadow-boxing': null,                                 // Lokales Bild vorhanden
  'pull-ups': 'Chin-Up',                                // ✓ Pull-Up Bewegung
  'pallof-press': null,                                  // Kein Pallof Press in DB
  'face-pulls': 'Face_Pull',                             // ✓ Face Pull am Kabel
  'farmers-walk': 'Farmers_Walk',                        // ✓ Farmer's Walk
  'lateral-bounds': 'Lateral_Bound',                     // ✓ Laterale Sprünge
  'seilspringen': null,                                  // Kein Seilspringen in DB
  'reverse-curls': 'Reverse_Barbell_Curl',               // ✓ Reverse Curl passt
  'knuckle-pushups': null,                                // Kein Knuckle Push-Up in DB
  'bottoms-up-kb': null,                                  // Kein Bottoms-Up KB in DB
  'wrist-roller': null,                                   // Kein Wrist Roller in DB
  'pinch-holds': null,                                    // Kein Pinch Hold in DB
  'hip-cars': null,                                       // Kein CAR in DB
  'thoracic-rotation': null,                              // Kein BWS Drill in DB
  'shoulder-dislocates': null,                            // Kein Shoulder Dislocate in DB
  'ankle-mobility': null,                                 // Kein Ankle Mobility in DB
  'heavy-bag-intervals': null,                            // Kein Heavy Bag in DB
  'barbell-complex': null,                                // Kein Barbell Complex in DB
  'battle-ropes': 'Battling_Ropes',                      // ✓ Battle Ropes vorhanden
  'sled-push': null                                       // Kein Sled Push in DB
};

// Lokale Bilder (Fallback): User kann eigene Bilder in img/exercises/ ablegen
function exerciseImgLocal(id) {
  return 'img/exercises/' + id + '.jpg';
}

function exerciseImgUrl(id, frame) {
  const dbId = exerciseImageMap[id];
  if (dbId) return EXERCISE_IMG_BASE + dbId + '_' + (frame || 0) + '.jpg';
  return null;
}

function exerciseIcon(id) {
  const remoteUrl = exerciseImgUrl(id, 0);
  const localUrl = exerciseImgLocal(id);
  const src = remoteUrl || localUrl;
  // Generate short fallback label from exercise ID
  var fallback = id.replace(/-/g,' ').replace(/\b\w/g, function(c){return c.toUpperCase();}).substring(0,12);
  return '<img src="' + src + '" alt="" class="ex-icon-img" loading="lazy" onerror="this.parentElement.classList.add(\'ex-icon-fallback\');this.parentElement.setAttribute(\'data-fallback\',\'' + fallback + '\');this.remove()"/>';
}

const exercisesKraft = [
  { id:'trap-bar-deadlift', muscles:['gluteus','quad_l','quad_r','core'], name:'TRAP BAR DEADLIFT', muscle:'PRIMÄR: Gluteus, Oberschenkel, Rückenstrecker · SEKUNDÄR: Core, Unterarm',
    goals:['power','injury'],
    desc:'Füße schulterbreit, Hände auf Griffen, Rücken gerade. Hüfte drückt nach vorne beim Hochkommen. Bessere Knieposition als konventioneller Deadlift, weniger Rückenstress, optimal für Explosivkraft.',
    sets:['Aufbau: <strong>4×5 @ 70%</strong>','Peak: <strong>4×3 @ 85%</strong>','Wettkampf: <strong>3×3 @ 75%</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Kreuzheben-Stärke korreliert direkt mit Schlagkraft durch Hüftstrecker-Dominanz. +20 kg Deadlift = messbar mehr Punch Force.',
    boxingConnection:'Die Hüftstrecker-Dominanz beim Trap Bar Deadlift bildet die Basis der kinetischen Kette im Boxen. Jeder Schlag beginnt am Boden – Kraft wird über Knöchel → Knie → Hüfte → Rumpf → Schulter → Faust übertragen. Studien zeigen: +20 kg Deadlift-1RM korreliert mit ~3% mehr Schlagkraft (Loturco et al., 2016).',
    video:'https://www.youtube.com/results?search_query=trap+bar+deadlift+form+tutorial'},
  { id:'jump-squat', muscles:['quad_l','quad_r','gluteus','wade_l','wade_r'], name:'JUMP SQUAT', muscle:'PRIMÄR: Quadrizeps, Gluteus · SEKUNDÄR: Waden, Core',
    goals:['power','speed','footwork'],
    desc:'Kniebeuge bis 90°, dann explosiv hochspringen – maximale Absicht! Landung weich, sofort nächste Rep. Last: 30–40% Körpergewicht (Optimum Power Load, Loturco 2016).',
    sets:['Sets: <strong>4×3–5</strong>','Last: <strong>30–40% BW</strong>','Pause: <strong>2–3 Min.</strong>'],
    tipLabel:'Häufigster Fehler', tip:'Zu schwer laden – dann wird es Kraft- statt Powertraining. Wenn du keine Luft spürst, ist die Last zu hoch.',
    boxingConnection:'Rate of Force Development (RFD) ist der limitierende Faktor für Schlaggeschwindigkeit. Jump Squats trainieren explosives Hüftextension-Timing bei 30-40% BW – exakt der optimale Lastbereich für maximale Powerentwicklung. Direkte Übertragung auf Beinarbeit und explosives Eindringen in die Schlagdistanz.',
    video:'https://www.youtube.com/results?search_query=jump+squat+proper+form+explosive'},
  { id:'landmine-press', muscles:['schulter_l','schulter_r','brust','core'], name:'LANDMINE PRESS', muscle:'PRIMÄR: Deltoid, Trizep · SEKUNDÄR: Core-Rotation, Serratus',
    goals:['power','jab','speed','rotation'],
    desc:'Stange in Ecke, Kniebeuge-Position, explosiv nach oben-vorne drücken – imitiert die Schulter-Bewegung bei Kreuzschlag. Einseitig trainieren deckt Ungleichgewichte auf.',
    sets:['Sets: <strong>4×5–6 je Seite</strong>','Last: <strong>70–80% 1RM</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Schulterpresse in boxspezifischem Muster. Aktiviert Serratus anterior – den "langer Schlag"-Muskel.',
    boxingConnection:'Die Landmine Press repliziert das biomechanische Muster eines Cross/geraden Rechten: diagonaler Push von unten nach vorne-oben mit Rumpfrotation. Der Serratus anterior – kritisch für Schulterprotraktion am Schlagende – wird maximal aktiviert. Unilaterale Ausführung deckt Kraftdefizite zwischen Führhand und Schlaghand auf.',
    video:'https://www.youtube.com/results?search_query=landmine+press+single+arm+technique'},
  { id:'hip-thrust', muscles:['gluteus','quad_l','quad_r'], name:'HIP THRUST', muscle:'PRIMÄR: Gluteus Maximus · SEKUNDÄR: Hamstrings, Core',
    goals:['power','rotation'],
    desc:'Schultern auf Bank, Stange auf Hüfte mit Polster. Hüfte hoch bis Körper gerade – 2 Sek. oben halten, kontrolliert senken. Gluteus ist der primäre Kraftgenerator für Schläge.',
    sets:['Sets: <strong>3×8</strong>','Last: <strong>60–80% 1RM</strong>','Pause oben: <strong>2 Sek.</strong>'],
    tipLabel:'Fehler', tip:'Hyperlordose der LWS – Bauch anspannen, neutraler Rücken konstant halten.',
    boxingConnection:'Der Gluteus Maximus ist der stärkste Muskel der kinetischen Kette und initiiert die Hüftrotation bei jedem Schlag. Hip Thrusts trainieren ihn in voller Hüftextension – genau die Position, in der Kraft bei einem Kreuzschlag übertragen wird. Starke Glutes ermöglichen explosiveres Einsteppen und stabilere Standposition bei Körpertreffern.',
    video:'https://www.youtube.com/results?search_query=barbell+hip+thrust+proper+form+glutes'},
  { id:'med-ball-rotation', muscles:['obliques_l','obliques_r','core','schulter_l','schulter_r'], name:'MED BALL ROTATIONSWURF', muscle:'PRIMÄR: Obliques, Core · SEKUNDÄR: Schulter, Hüfte',
    goals:['power','rotation','speed'],
    desc:'Seitlich zur Wand, Ball auf Hüfthöhe. Explosive Hüftrotation – Kraft vom Boden durch Hüfte in Ball. Imitiert Haken und Uppercut exakt.',
    sets:['Sets: <strong>3×6 je Seite</strong>','Ball: <strong>4–6 kg</strong>','Maximal explosiv'],
    tipLabel:'Boxing-Relevanz', tip:'Direkte Übertragung auf Hakenpower. Stärker als Cable Woodchop für boxspezifische Rotation.',
    boxingConnection:'Rotationsleistung der Obliques und des transversalen Abdominis korreliert direkt mit Haken- und Uppercut-Kraft (r=0.68, Turner et al., 2011). Der Medball-Rotationswurf trainiert die Stretch-Shortening-Zyklen der Rumpfmuskulatur bei boxspezifischer Geschwindigkeit. Die Wurfbewegung erzwingt volle Durchrotation der Hüfte – ein Muster, das viele Boxer vernachlässigen.',
    video:'https://www.youtube.com/results?search_query=medicine+ball+rotational+throw+wall+power'},
  { id:'explosive-pushup', muscles:['brust','schulter_l','schulter_r','bizeps_l','bizeps_r'], name:'EXPLOSIVE PUSH-UP', muscle:'PRIMÄR: Pectoralis, Trizep · SEKUNDÄR: Deltoid, Serratus',
    goals:['power','jab','speed'],
    desc:'Normale Position, explosiv hochdrücken bis Hände abheben – Klatscher optional. Weiche Landung, sofort nächste Rep. Für Power: max 5 Reps!',
    sets:['Sets: <strong>4×5</strong>','Pause: <strong>90–120 Sek.</strong>','Max. Explosivität'],
    tipLabel:'Fehler', tip:'Zu viele Reps – das wird Ausdauer. Für Power: max 5, lange Pause, maximale Kraft pro Rep.',
    boxingConnection:'Der explosive Liegestütz trainiert die Push-Kette (Brust, Trizeps, vorderer Deltoid) mit maximaler Beschleunigung – genau das Muster bei geraden Schlägen. Die Flugphase erzwingt maximale RFD, da die Hände den Boden verlassen müssen. Studien zeigen: Plyometrische Push-Ups verbessern die Armstreckgeschwindigkeit um 8-12%, direkt übertragbar auf Jab- und Cross-Geschwindigkeit.',
    video:'https://www.youtube.com/results?search_query=explosive+clap+pushup+plyometric+form'},
  { id:'overcoming-iso', muscles:['brust','quad_l','quad_r','core','schulter_l','schulter_r'], name:'OVERCOMING ISOMETRICS', muscle:'PRIMÄR: Je nach Position · SEKUNDÄR: ZNS-Aktivierung',
    goals:['power','speed'],
    desc:'6 Sek. @ 100% gegen unbeweglichen Widerstand (Wand, Türrahmen, Boden). Rekrutiert bis zu 95% aller Motoreinheiten ohne Equipment. Wand-Push, Floor-Pull, Iso-Kniebeuge.',
    sets:['Kontraktion: <strong>6 Sek. @ 100%</strong>','Sets: <strong>4 je Übung</strong>','Kein Equipment'],
    tipLabel:'Wann', tip:'Ideal morgens vor der Arbeit (06:00–06:45) wenn Gym noch zu ist. Aktiviert ZNS für den ganzen Tag.',
    boxingConnection:'Overcoming Isometrics rekrutieren bis zu 95% aller motorischen Einheiten – mehr als konzentrische Bewegungen (~60-80%). Für Boxer bedeutet das: maximale neurale Aktivierung ohne Gelenkbelastung oder Muskelschaden. Perfekt für das morgendliche ZNS-Priming vor der Arbeit, das die nachfolgende Trainingsqualität steigert (PAP-Effekt hält 6-8 Stunden).',
    video:'https://www.youtube.com/results?search_query=overcoming+isometrics+strength+training+guide'},
  { id:'single-leg-rdl', muscles:['gluteus','quad_l','quad_r'], name:'SINGLE-LEG RDL', muscle:'PRIMÄR: Hamstrings, Gluteus · SEKUNDÄR: Balance, Stabilität',
    goals:['injury','clinch','footwork'],
    desc:'Einbeinig stehend, Hantel in gegenüberliegender Hand, nach vorne beugen bis Rücken parallel. 3 Sek. senken, explosiv zurück. Deckt Links-Rechts-Defizite auf.',
    sets:['Sets: <strong>3×8 je Seite</strong>','Tempo: <strong>3-1-1</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Boxen ist einseitig. Unilaterales Training erhöht Stabilität beim Schlagen aus verschiedenen Positionen.',
    boxingConnection:'Boxen ist eine unilateral dominierte Sportart – du stehst fast immer mehr auf einem Bein als auf dem anderen. Der Single-Leg RDL trainiert einbeinige Hüftstabilität und posteriore Kettenkraft, was direkt die Standstabilität beim Schlagen aus der Ausfallposition verbessert. Beseitigt Seitenasymmetrien, die Kraftverluste von 10-15% in der schwächeren Seite verursachen können.',
    video:'https://www.youtube.com/results?search_query=single+leg+romanian+deadlift+form+dumbbell'},
  { id:'power-clean', muscles:['gluteus','quad_l','quad_r','schulter_l','schulter_r','core'], name:'POWER CLEAN', muscle:'PRIMÄR: Gesamte hintere Kette · SEKUNDÄR: Schultern, Unterarme',
    goals:['power','speed'],
    desc:'Stange vom Boden explosiv auf Schultern umsetzen. Dreifach-Extension (Knöchel-Knie-Hüfte) in einer Bewegung. Die explosivste Ganzkörperübung überhaupt – trainiert Rate of Force Development.',
    sets:['Sets: <strong>5×3</strong>','Last: <strong>60–75% 1RM</strong>','Pause: <strong>3 Min.</strong>'],
    tipLabel:'Fehler', tip:'Mit Armen ziehen statt Hüfte explodieren lassen. Die Arme sind nur Haken – die Power kommt aus der Hüfte.',
    boxingConnection:'Der Power Clean ist die ultimative Triple-Extension-Übung (Knöchel-Knie-Hüfte) – exakt die Bewegungskette, die bei einem Aufwärtshaken oder Cross aus den Beinen eingeleitet wird. Peak Power Output beim Clean erreicht 3000-5000W – kein anderes Krafttraining kommt an diese RFD heran. Die Fähigkeit, Kraft in <200ms zu entwickeln, ist der Schlüssel zu Schlaggeschwindigkeit.',
    video:'https://www.youtube.com/results?search_query=power+clean+technique+tutorial+barbell'},
  { id:'bench-press', muscles:['brust','schulter_l','schulter_r','bizeps_l','bizeps_r'], name:'BENCH PRESS', muscle:'PRIMÄR: Pectoralis, Trizep · SEKUNDÄR: Deltoid anterior',
    goals:['power','jab'],
    desc:'Klassisches Bankdrücken, schulterbreiter Griff. Kontrolliert senken (2 Sek.), explosiv drücken. Für Boxer: Fokus auf Geschwindigkeit, nicht Maximum.',
    sets:['Aufbau: <strong>4×6 @ 70%</strong>','Peak: <strong>4×3 @ 85%</strong>','Wettkampf: <strong>3×5 @ 65% explosiv</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Trainiert die Push-Muskulatur für gerade Schläge. Velocity-based: Stange so schnell wie möglich bewegen.',
    boxingConnection:'Das Bankdrücken stärkt den Pectoralis major und Trizeps – die primären Muskeln für die horizontale Armstreckung bei Jab und Cross. Velocity-Based Training (VBT) beim Bankdrücken bei 60-70% 1RM optimiert die Kraftkurve für boxspezifische Geschwindigkeit. Wichtig: Nicht 1RM-Jagd, sondern Barspeed maximieren – das überträgt sich direkt auf Faust-Endgeschwindigkeit.',
    video:'https://www.youtube.com/results?search_query=bench+press+proper+form+technique+guide'},
  { id:'pull-ups', muscles:['bizeps_l','bizeps_r','schulter_l','schulter_r','core'], name:'PULL-UPS', muscle:'PRIMÄR: Latissimus, Bizeps · SEKUNDÄR: Rhomboideen, Core',
    goals:['clinch','shoulders','injury'],
    desc:'Schulterbreiter Griff, volle Extension unten, Kinn über Stange oben. Kontrolliert senken (2 Sek.). Wenn noch keine saubere Rep: exzentrische Pull-Ups (5 Sek. runter) oder Band-Assisted.',
    sets:['Sets: <strong>4×6–10</strong>','Gewichtet: <strong>+5–20 kg</strong>','Anfänger: <strong>Exzentrisch 3×5</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Einzige Zugübung im Plan! Ohne Rücken-Balance bei so viel Push-Training → Schulterverletzungen und Haltungsprobleme.',
    boxingConnection:'Boxer pushen ständig (Schläge = Push-Bewegung) aber ziehen fast nie. Dieses Ungleichgewicht führt zu Schulterprotraktions-Syndrom und erhöht das Verletzungsrisiko massiv. Pull-Ups trainieren den Latissimus (größter Oberkörper-Muskel), der für die Rückhand-Rückführung und Clinch-Kontrolle verantwortlich ist. Auch für das schnelle Zurückziehen der Hände nach dem Schlag essentiell.',
    video:'https://www.youtube.com/results?search_query=pull+up+proper+form+technique'},
  { id:'pallof-press', muscles:['core','obliques_l','obliques_r'], name:'PALLOF PRESS', muscle:'PRIMÄR: Core (Anti-Rotation) · SEKUNDÄR: Obliques, Hüftstabilisatoren',
    goals:['rotation','power','injury'],
    desc:'Kabel/Band auf Brusthöhe, seitlich stehen. Griff mit beiden Händen vor die Brust, dann Arme strecken und 3 Sek. halten. Der Core muss die Rotation WIDERSTEHEN. Langsam zurück.',
    sets:['Sets: <strong>3×10 je Seite</strong>','Hold: <strong>3 Sek.</strong>','Frequenz: <strong>2–3×/Woche</strong>'],
    tipLabel:'Warum Anti-Rotation?', tip:'Schlagkraft entsteht durch Rotation – aber nur wenn der Core STIFF genug ist um Kraft zu übertragen. Ohne Core-Steifigkeit geht Energie verloren.',
    boxingConnection:'Anti-Rotations-Training ist das fehlende Puzzlestück für Schlagkraft. Der Core muss gleichzeitig Rotation ERZEUGEN (Obliques) und Energieverlust VERHINDERN (Anti-Rotation). Der Pallof Press trainiert die transversale Stabilität – die Fähigkeit, Rotationskräfte ohne Energieverlust durch den Rumpf zu übertragen. Boxing Science nennt es "Core Stiffness" – je steifer der Rumpf, desto mehr Beinkraft erreicht die Faust.',
    video:'https://www.youtube.com/results?search_query=pallof+press+anti+rotation+core+exercise'},
  { id:'face-pulls', muscles:['schulter_l','schulter_r'], name:'FACE PULLS', muscle:'PRIMÄR: Hinterer Deltoid, Rotatorenmanschette · SEKUNDÄR: Rhomboideen, Trapez',
    goals:['injury','shoulders'],
    desc:'Kabel auf Gesichtshöhe, Seilgriff. Zu den Ohren ziehen, Ellbogen hoch, External Rotation am Ende. Squeeze 2 Sek. Leichtes Gewicht, hohe Reps – das ist PREHAB, kein Krafttraining.',
    sets:['Sets: <strong>3×15–20</strong>','Last: <strong>leicht</strong>','Frequenz: <strong>Jedes Training</strong>'],
    tipLabel:'PFLICHT-Übung', tip:'Für jeden Boxer der viel schlägt. Schulter-Prehab ist nicht optional – ohne Face Pulls bei hohem Schlagvolumen sind Schulterverletzungen nur eine Frage der Zeit.',
    boxingConnection:'Boxer entwickeln massive anteriore Deltoid/Pec-Dominanz durch das ständige Pushing (Schlagen). Ohne Gegenbewegung entsteht ein Ungleichgewicht: Schulter rotiert nach vorne, Rotatorenmanschette wird komprimiert, Impingement entsteht. Face Pulls trainieren den hinteren Deltoid und die Außenrotatoren – die direkten Antagonisten zur Schlagbewegung. Minimum 3×15 bei JEDEM Training als Warm-Up oder Finisher.',
    video:'https://www.youtube.com/results?search_query=face+pulls+proper+form+shoulder+health'},
  { id:'farmers-walk', muscles:['unterarm_l','unterarm_r','core','schulter_l','schulter_r'], name:'FARMER\'S WALK', muscle:'PRIMÄR: Grip, Core · SEKUNDÄR: Trapez, Schultern, gesamter Körper',
    goals:['clinch','injury','hands'],
    desc:'Schwere Kurzhanteln oder Trap Bar in beiden Händen. Aufrecht gehen, Schultern hinten, Core angespannt. 30–40m oder 30–45 Sek. So schwer wie möglich bei sauberer Haltung.',
    sets:['Sets: <strong>3×30–40m</strong>','Last: <strong>BW je Hand</strong>','Pause: <strong>90 Sek.</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Grip-Ausdauer für 12 Runden Clinch-Arbeit. Core-Stabilität unter Last. Gesamtkörper-Konditionierung.',
    boxingConnection:'Farmer\'s Walks trainieren gleichzeitig: Grip-Ausdauer (Clinch), Trapez-Kraft (Nacken-Schutz), Core-Stabilität unter Last (Körpertreffer einstecken) und aufrechte Haltung (Guard-Position). Phil Daru nutzt sie als Grundübung für alle seine UFC/Boxkämpfer. Die isometrische Belastung aller Muskeln gleichzeitig imitiert die Ganzkörper-Spannung, die ein Boxer im Ring konstant aufrechterhalten muss.',
    video:'https://www.youtube.com/results?search_query=farmers+walk+carry+proper+form+heavy'},
  { id:'lateral-bounds', muscles:['gluteus','quad_l','quad_r','wade_l','wade_r'], name:'LATERAL BOUNDS', muscle:'PRIMÄR: Gluteus Medius, Adduktoren · SEKUNDÄR: Quads, Waden',
    goals:['footwork','power'],
    desc:'Einbeinig seitlich abspringen, auf dem anderen Bein landen, 1 Sek. stabilisieren. Explosiv zurückspringen. Knie tracking über Zehen. Leise landen!',
    sets:['Sets: <strong>3×6 je Seite</strong>','Pause: <strong>90 Sek.</strong>','Kein Equipment'],
    tipLabel:'Boxing-Relevanz', tip:'Boxer bewegen sich primär SEITLICH. Laterale Explosivkraft ist für Cut Angles und Ausweichen entscheidend – aber wird fast nie trainiert.',
    boxingConnection:'Im Ring bewegst du dich zu 60-70% lateral – Ausweichen, Winkel schneiden, seitliches Ein/Aussteppen. Trotzdem trainieren die meisten Boxer nur sagittale Bewegungen (Squats, Sprints). Lateral Bounds trainieren den Gluteus Medius und die Adduktoren in explosiver lateraler Bewegung – direkt übertragbar auf schnelles seitliches Ausweichen und das Schneiden von Winkeln nach Kombinationen.',
    video:'https://www.youtube.com/results?search_query=lateral+bounds+plyometric+single+leg'}
];

const exercisesAusdauer = [
  { id:'zone2', muscles:['quad_l','quad_r','wade_l','wade_r','gluteus'], name:'ZONE 2 LAUFEN', muscle:'AEROB · Mitochondrien-Biogenese · Lipid-Oxidation',
    goals:['stamina'],
    desc:'60–70% HFmax – du kannst noch vollständige Sätze sprechen. 30–60 Min. Unter 30 Min. passiert zu wenig für die Mitochondrien-Biogenese – erst ab 30 Min. wird PGC-1α ausreichend aktiviert. Fahrrad zur Arbeit zählt! Baut die aerobe Basis, auf der alle Hochintensität aufbaut.',
    sets:['Frequenz: <strong>4–6×/Woche</strong>','HF: <strong>60–70% Max</strong>','Dauer: <strong>30–60 Min.</strong>'],
    tipLabel:'Zeiteffizienz', tip:'Fahrrad zur Arbeit = Zone 2 ohne Extrazeit. Längste ROI-Übung im gesamten Plan.',
    boxingConnection:'Ein 3×3-Minuten-Kampf wird zu ~77% aerob gedeckt (Guidetti et al., 2002). Zone 2 Training stimuliert mitochondriale Biogenese via PGC-1α und verbessert die Phosphokreatin-Resynthese zwischen explosiven Aktionen. Je besser dein aerobes Fundament, desto schneller regenerierst du zwischen Kombinationen – in Runde 3 trennt sich die Spreu vom Weizen.',
    video:'https://www.youtube.com/results?search_query=zone+2+cardio+training+heart+rate+guide'},
  { id:'hiit-4x4', muscles:['quad_l','quad_r','wade_l','wade_r','core'], name:'HIIT 4×4 PROTOKOLL', muscle:'ANAEROB/AEROB · VO₂max-Steigerung',
    goals:['stamina'],
    desc:'4 Min. bei >90% HFmax, dann 3 Min. aktive Erholung × 4 Runden. Norwegisches Modell – effektivste Methode zur VO₂max-Steigerung. Max 2×/Woche.',
    sets:['Runden: <strong>4</strong>','Work: <strong>4 Min. >90% HF</strong>','Rest: <strong>3 Min.</strong>','Max: <strong>2×/Woche</strong>'],
    tipLabel:'Wann', tip:'Am besten zum Vereins-Cardio-Tag oder morgens an Nicht-Sparring-Tagen.',
    boxingConnection:'VO₂max ist der stärkste Prädiktor für Ausdauerleistung im Boxen. Das 4×4-Protokoll (Helgerud et al., 2007) steigert VO₂max um 5-8% in 8 Wochen – kein anderes Protokoll ist effizienter. Höhere VO₂max bedeutet: schnellere Laktat-Clearance, bessere PCr-Resynthese und die Fähigkeit, in Runde 3 noch mit voller Schlagkraft zu agieren.',
    video:'https://www.youtube.com/results?search_query=4x4+hiit+interval+training+vo2max+protocol'},
  { id:'fartlek', muscles:['quad_l','quad_r','wade_l','wade_r'], name:'FARTLEK LAUF', muscle:'AEROB/ANAEROB · Energiesystem-Flexibilität',
    goals:['stamina'],
    desc:'Lauf mit spontanen Tempowechseln: 2 Min. gemütlich → 1 Min. hart → 30 Sek. Sprint. Imitiert die unregelmäßigen Intensitätswechsel im Kampf. Nach Gefühl.',
    sets:['Dauer: <strong>25–35 Min.</strong>','Frequenz: <strong>1–2×/Woche</strong>'],
    tipLabel:'Vorteil', tip:'Weniger ZNS-Belastung als reines HIIT, trotzdem multiple Zonen. Gut für Aufbauwochen.',
    boxingConnection:'Ein Boxkampf wechselt ständig zwischen Intensitäten: lockere Beinarbeit (aerob), explosive Kombinationen (alaktazid), Clinch-Arbeit (laktazid). Fartlek imitiert genau dieses Muster mit unregelmäßigen Tempowechseln. Es trainiert die metabolische Flexibilität – die Fähigkeit, nahtlos zwischen Energiesystemen zu wechseln, ohne dass die Leistung einbricht.',
    video:'https://www.youtube.com/results?search_query=fartlek+running+training+speed+variation'},
  { id:'sit-sprints', muscles:['quad_l','quad_r','gluteus','wade_l','wade_r'], name:'SIT – SPRINT-INTERVALLE', muscle:'ANAEROB alaktazid/laktazid · PCr-System',
    goals:['stamina','power'],
    desc:'8–10× maximaler 30-Sek.-Sprint mit 2–4 Min. Erholung. Trainiert PCr-Resynthese – genau was zwischen Kombinationen im Ring passiert.',
    sets:['Sprints: <strong>8–10×</strong>','Work: <strong>30 Sek. MAX</strong>','Rest: <strong>2–4 Min.</strong>','Max: <strong>1×/Woche</strong>'],
    tipLabel:'Achtung', tip:'Sehr hohe ZNS-Belastung! Nie am Tag vor hartem Sparring einplanen.',
    boxingConnection:'Das Phosphokreatin-System (PCr) liefert die Energie für explosive 3-5-Sekunden-Aktionen wie eine harte Kombination. Sprint-Intervalle trainieren die PCr-Resyntheserate – d.h. wie schnell du nach einer explosiven Aktion wieder voll geladen bist. Burley & Kenefick (2018) zeigen: SIT verbessert die wiederholte Sprint-Fähigkeit um 4-8%, direkt relevant für Kampfsport.',
    video:'https://www.youtube.com/results?search_query=sprint+interval+training+SIT+30+second+sprints'},
  { id:'seilspringen', muscles:['wade_l','wade_r','schulter_l','schulter_r','core'], name:'SEILSPRINGEN', muscle:'Waden, Schultern, Core · Koordination + Rhythmus',
    goals:['footwork','stamina','shoulders'],
    desc:'Grundsprung: Handgelenke drehen, Ellbogen eng am Körper, minimal vom Boden abheben. Variationen: Single Leg, Double Under, Boxer Skip, Criss-Cross. 3–10 Runden á 3 Min.',
    sets:['Runden: <strong>3–10 × 3 Min.</strong>','Pause: <strong>30–60 Sek.</strong>','Frequenz: <strong>Jedes Training</strong>'],
    tipLabel:'DIE Boxing-Übung', tip:'Kein Boxtraining ohne Seilspringen. Trainiert Rhythmus, Timing, Waden-Ausdauer und Koordination gleichzeitig. Jedes Profi-Camp weltweit beginnt damit.',
    boxingConnection:'Seilspringen ist seit über 100 Jahren fester Bestandteil jedes Boxing-Camps – aus gutem Grund. Es trainiert: (1) Waden-Ausdauer für leichtfüßige Beinarbeit über 12 Runden, (2) Schulter-Ausdauer durch konstante Armbewegung, (3) Rhythmus und Timing – fundamentale Boxing-Skills, (4) Koordination zwischen Ober- und Unterkörper. Floyd Mayweather trainierte bis zu 30 Min. Seilspringen pro Session – häufig zitiert, nicht wissenschaftlich dokumentiert.',
    video:'https://www.youtube.com/results?search_query=boxing+jump+rope+tutorial+beginner+to+advanced'}
];

const exercisesArmor = [
  { id:'iso-nacken', muscles:['nacken'], name:'ISOMETRISCHE NACKEN-HOLDS', muscle:'Sternocleidomastoideus, Splenius, Suboccipital-Gruppe',
    goals:['chin','injury'],
    desc:'Hand gegen Stirn drücken, Kopf hält dagegen. 8–10 Sek. pro Richtung (vorne, hinten, links, rechts). Kein Equipment nötig. Ideal als Desk-Übung und Morgentraining.',
    sets:['Sets: <strong>3 je Richtung</strong>','Hold: <strong>8–10 Sek.</strong>','Frequenz: <strong>3×/Woche</strong>'],
    tipLabel:'WICHTIG', tip:'NIEMALS Nackenbrücken! Cervikale Kompression + Bewegung = Bandscheibenrisiko. Isometrie ist sicherer UND effektiver.',
    boxingConnection:'Signifikanter Zusammenhang zwischen Nackenstaerke und KO-Schutz (Collins et al. 2014, n=6704 – Jugendstudie, Effekt bei Erwachsenen kleiner aber belegt). Die Nackenmuskulatur erhoeht die effektive Masse des Kopf-Hals-Segments und reduziert die Rotationsbeschleunigung bei Treffern. Isometrisches Training ist sicherer als dynamische Uebungen.',
    video:'https://www.youtube.com/results?search_query=isometric+neck+exercises+strengthening+combat'},
  { id:'nacken-flexion', muscles:['nacken'], name:'NACKEN-FLEXION MIT TELLER', muscle:'Sternocleidomastoideus, Scaleni',
    goals:['chin','injury'],
    desc:'Rücken auf Bank, Kopf über Rand. Teller (2.5–5 kg) auf Stirn, Kinn langsam Richtung Brust (3 Sek.). Progressiv: 2.5 → 5 → 7.5 → 10 kg über Monate.',
    sets:['Sets: <strong>3×12–15</strong>','Start: <strong>2.5 kg</strong>','Ziel: <strong>10–15 kg</strong>'],
    tipLabel:'Progression', tip:'Alle 2 Wochen +0.5–1 kg wenn alle Reps sauber. Rush nicht – Nacken braucht Zeit.',
    boxingConnection:'Der Sternocleidomastoideus (SCM) ist der primäre Flexor des Halses und bremst die Kopfextension bei frontalen Treffern. Kontrollierte Nackenflexion mit progressiver Belastung baut den SCM und die Scaleni auf, ohne die Wirbelsäule zu gefährden. Stärkere Nackenflexoren bedeuten weniger Kopfbewegung bei Jab-Treffern – der häufigste Schlag im Amateur-Boxen.',
    video:'https://www.youtube.com/results?search_query=neck+flexion+exercise+plate+weight+bench'},
  { id:'rice-bucket', muscles:['unterarm_l','unterarm_r'], name:'RICE BUCKET', muscle:'Unterarm-Flexoren, Extensoren, Hand-Muskeln',
    goals:['hands','injury','clinch'],
    desc:'Hände in Reiseimer: Greifen, Drehen, Spreizen, Drücken – 3 Min. durchgehend. Stärkt Unterarm für besseren Punch-Transfer und stabilisiert Handgelenk.',
    sets:['Dauer: <strong>3 Min.</strong>','Frequenz: <strong>3×/Woche</strong>','Post-Training'],
    tipLabel:'Tipp', tip:'5kg Reis + Plastikbehälter = ~8€. Hält Jahre. Einer der besten Boxer-Investitionen.',
    boxingConnection:'Die Handgelenkstabilität ist entscheidend für verletzungsfreie Kraftübertragung beim Aufprall. 40% aller Boxverletzungen betreffen Hand/Handgelenk (Loosemore et al., 2017). Rice Bucket Training stärkt die 20+ kleinen Muskeln von Unterarm und Hand in allen Bewegungsebenen gleichzeitig – Flexion, Extension, Deviation und Rotation. Resultat: stabileres Handgelenk bei Aufprall und weniger Ermüdung beim Bandagieren.',
    video:'https://www.youtube.com/results?search_query=rice+bucket+hand+forearm+strengthening+exercises'},
  { id:'pogo-jumps', muscles:['wade_l','wade_r'], name:'POGO JUMPS', muscle:'Wadenmuskulatur, Achillessehne, Plantarfaszie',
    goals:['footwork','injury'],
    desc:'Auf der Stelle springen, Knie fast gestreckt, nur Knöchel/Wade. So schnell wie möglich! Trainiert Ankle Stiffness für schnelle Beinarbeit.',
    sets:['Sets: <strong>4×30 Sek.</strong>','Pause: <strong>60 Sek.</strong>','Kein Equipment'],
    tipLabel:'Boxing-Relevanz', tip:'Schnelle Beinarbeit = schnelle Sprunggelenke. Pogos reduzieren Bodenkontaktzeit und verbessern Footwork.',
    boxingConnection:'Ankle Stiffness – die Fähigkeit des Sprunggelenks, Kraft schnell zu übertragen – bestimmt die Bodenkontaktzeit bei Beinarbeit. Pogo Jumps trainieren den Dehnungs-Verkürzungs-Zyklus der Wadenmuskulatur und Achillessehne bei minimaler Bodenkontaktzeit (<200ms). Schnellere Füße = schnelleres Ein- und Aussteppen, bessere Winkelarbeit und die Fähigkeit, in Sekundenbruchteilen die Distanz zu ändern.',
    video:'https://www.youtube.com/results?search_query=pogo+jumps+ankle+stiffness+plyometric+drill'}
];

const exercisesHands = [
  { id:'reverse-curls', muscles:['unterarm_l','unterarm_r'], name:'REVERSE CURLS', muscle:'PRIMÄR: Brachioradialis, Handgelenk-Extensoren · SEKUNDÄR: Bizeps',
    goals:['hands','injury'],
    desc:'Langhantel oder Kurzhanteln im Obergriff (Handflächen nach unten). Kontrolliert curlen, 3 Sek. exzentrisch senken. Stärkt die Handgelenk-Extensoren für Aufprallsteifigkeit beim Schlag.',
    sets:['Sets: <strong>3–5×5–8</strong>','Last: <strong>moderat</strong>','Tempo: <strong>2-0-3 exzentrisch</strong>'],
    tipLabel:'Boxing Science', tip:'Exzentrische Handgelenkstärke = Aufprallsteifigkeit. Wenn das Handgelenk beim Impact nachgibt, geht Kraft verloren und Verletzungsrisiko steigt.',
    boxingConnection:'Boxing Science listet Reverse Curls als eine der Top-Übungen für Punch Snap. Die Handgelenk-Extensoren stabilisieren das Handgelenk beim Aufprall in neutraler Position. Schwache Extensoren = das Handgelenk knickt beim Impact ein → Kraftverlust und Verletzung. Exzentrisches Training dieser Muskeln erhöht die "Impact Stiffness" der Faust.',
    video:'https://www.youtube.com/results?search_query=reverse+barbell+curl+form+forearm'},
  { id:'knuckle-pushups', muscles:['brust','unterarm_l','unterarm_r','core'], name:'KNUCKLE PUSH-UPS', muscle:'Pectoralis, Trizep · ZUSATZ: Knöchel-Konditionierung, Handgelenk-Stabilität',
    goals:['hands','power'],
    desc:'Push-Ups auf den ersten zwei Knöcheln (Zeige- und Mittelfinger). Start auf weicher Matte, progressiv härterer Untergrund. Hält Handgelenk in neutraler Position – weniger Stress als normale Push-Ups.',
    sets:['Sets: <strong>3×10–15</strong>','Progression: <strong>Matte → Holz → Boden</strong>','Frequenz: <strong>3×/Woche</strong>'],
    tipLabel:'Warum', tip:'Konditioniert Knöchel für Impact. Baut Knochendichte an den Aufprallpunkten auf. Handgelenk bleibt neutral = gesündere Position als gebeugt.',
    boxingConnection:'Die ersten zwei Knöchel (Zeige- und Mittelfinger) sind die primären Aufprallpunkte beim Schlag. Knuckle Push-Ups konditionieren diese Punkte progressiv – Knochendichte steigt durch Wolff\'s Law (Knochen adaptiert an Belastung). Gleichzeitig trainiert die neutrale Handgelenkposition die Stabilisatoren für korrekten Impact-Winkel.',
    video:'https://www.youtube.com/results?search_query=knuckle+push+ups+form+progression'},
  { id:'bottoms-up-kb', muscles:['schulter_l','schulter_r','unterarm_l','unterarm_r','core'], name:'BOTTOMS-UP KB PRESS', muscle:'Deltoid, Trizep · ZUSATZ: Handgelenk-Stabilität, Grip-Aktivierung',
    goals:['hands','injury','shoulders'],
    desc:'Kettlebell umgedreht halten (Boden nach oben). Einarmig über Kopf drücken. Die instabile Position erzwingt maximale Handgelenk-Stabilisierung und Grip-Aktivierung bei jeder Rep.',
    sets:['Sets: <strong>3–4×8–10 je Seite</strong>','Last: <strong>leicht starten (8–12 kg)</strong>','Pause: <strong>60 Sek.</strong>'],
    tipLabel:'Boxing Science', tip:'Boxing Science empfiehlt diese Übung explizit für Handgelenk-Stabilität. Erzwingt aktive Stabilisierung unter Last – direkter Transfer zur Faust-Stabilität beim Aufprall.',
    boxingConnection:'Beim Bottoms-Up KB Press muss das Handgelenk aktiv stabilisiert werden, um die Kettlebell in Balance zu halten. Das trainiert die propriozeptiven Stabilisatoren des Handgelenks unter Last – exakt das Muster, das beim Faustaufprall gebraucht wird. Boxing Science empfiehlt 3-4 Sätze á 8-10 Reps als Teil des Hand/Handgelenk-Programms.',
    video:'https://www.youtube.com/results?search_query=bottoms+up+kettlebell+press+form+wrist'},
  { id:'wrist-roller', muscles:['unterarm_l','unterarm_r'], name:'WRIST ROLLER', muscle:'Unterarm-Flexoren und -Extensoren',
    goals:['hands','clinch'],
    desc:'Stab mit Seil und Gewicht. Gewicht hochrollen durch Handgelenkdrehung (vorwärts = Flexoren, rückwärts = Extensoren). 3 Sets hoch + runter. Klassischste Unterarmübung im Kampfsport.',
    sets:['Sets: <strong>3× hoch + runter</strong>','Last: <strong>2.5–5 kg Start</strong>','Frequenz: <strong>2–3×/Woche</strong>'],
    tipLabel:'Tipp', tip:'Einfach selbst bauen: Besenstiel + 1m Schnur + Gewichtsscheibe. Kostet 5€, hält ewig.',
    boxingConnection:'Der Wrist Roller trainiert Flexoren UND Extensoren des Unterarms in einer einzigen Übung. Die konstante Griffbelastung plus Handgelenkrotation imitiert die Anforderung beim wiederholten Schlagen über 3+ Runden. Alte Boxing-Tradition: Jedes Gym der 60er-80er Jahre hatte einen Wrist Roller – aus gutem Grund.',
    video:'https://www.youtube.com/results?search_query=wrist+roller+exercise+form+forearm+strength'},
  { id:'pinch-holds', muscles:['unterarm_l','unterarm_r'], name:'PINCH HOLDS', muscle:'Daumen-Adduktoren, Unterarm-Stabilisatoren',
    goals:['hands','clinch'],
    desc:'Zwei 10kg-Scheiben glatte Seite nach außen zusammenhalten. Nur mit Daumen + Fingern greifen (Pinch Grip). Halten bis Versagen. Testet und trainiert die Open-Close-Funktion der Faust.',
    sets:['Sets: <strong>3–4×20–40 Sek.</strong>','Last: <strong>2×10 kg Scheiben</strong>','Test: <strong><10% Differenz L/R</strong>'],
    tipLabel:'Boxing Science', tip:'Boxing Science nutzt den Pinch Hold Test als Assessment: Zeit bis Versagen, <10% Seitendifferenz = gesund. >10% = Defizit das behoben werden muss.',
    boxingConnection:'Der Pinch Grip trainiert die "Faust schließen"-Funktion – genau die Muskelgruppe, die beim Impact die Faust zusammenhält. Boxing Science nutzt Pinch Holds sowohl als Training als auch als Diagnostik-Tool. Die Kombination aus Daumenadduktion und Fingerflexion imitiert das explosive Faust-Schließen, das in den letzten Millisekunden vor dem Aufprall passiert.',
    video:'https://www.youtube.com/results?search_query=plate+pinch+hold+grip+strength+exercise'}
];

const exercisesMobility = [
  { id:'hip-cars', muscles:['gluteus','core'], name:'HIP CARs', muscle:'Hüftgelenk – Gesamter Bewegungsumfang',
    goals:['rotation','injury','footwork'],
    desc:'Vierfüßlerstand, ein Knie heben, maximalen Kreis mit dem Knie zeichnen – erst vorwärts, dann rückwärts. Langsam, kontrolliert, endgradig. 5 Kreise pro Richtung. Ziel: den vollen Bewegungsumfang der Hüfte TÄGLICH nutzen.',
    sets:['Sets: <strong>5 Kreise je Richtung</strong>','Seiten: <strong>beide</strong>','Frequenz: <strong>Täglich (Warm-Up)</strong>'],
    tipLabel:'Boxing Science', tip:'Hüftmobilität ist der limitierende Faktor für Rotationskraft. Wenn die Hüfte nicht frei rotieren kann, kompensiert die LWS – Verletzung vorprogrammiert.',
    boxingConnection:'Jeder Schlag wird durch Hüftrotation eingeleitet. Eingeschränkte Hüftmobilität bedeutet: (1) weniger Rotationswinkel = weniger Kraftübertragung, (2) LWS kompensiert = Rückenschmerzen. CARs (Controlled Articular Rotations) nach FRC-System erhalten und erweitern den Bewegungsumfang des Hüftgelenks. Boxing Science empfiehlt sie als tägliches Warm-Up für alle Boxer.',
    video:'https://www.youtube.com/results?search_query=hip+CARs+controlled+articular+rotations+tutorial'},
  { id:'thoracic-rotation', muscles:['core','obliques_l','obliques_r'], name:'THORACIC SPINE ROTATION', muscle:'Brustwirbelsäule – Rotation + Extension',
    goals:['rotation','injury'],
    desc:'Seitlich liegen, Knie übereinander (90°). Oberen Arm in großem Bogen öffnen, Blick folgt der Hand. 3 Sek. halten in Endposition. Die BWS MUSS rotieren – nicht die LWS!',
    sets:['Sets: <strong>3×8 je Seite</strong>','Hold: <strong>3 Sek.</strong>','Frequenz: <strong>Täglich</strong>'],
    tipLabel:'Warum kritisch', tip:'Die Brustwirbelsäule soll rotieren, die Lendenwirbelsäule soll STABIL sein. Wenn die BWS steif ist, rotiert die LWS – und die ist dafür nicht gebaut.',
    boxingConnection:'Die Brustwirbelsäule ist das Rotationszentrum für Haken und Uppercuts. Eingeschränkte BWS-Rotation (häufig bei Schreibtischarbeit) führt dazu, dass Rotationskräfte in der LWS oder Schulter kompensiert werden – die häufigsten Verletzungsstellen bei Boxern. Phil Daru nutzt BWS-Mobilität als Eingangs-Assessment bei allen neuen Kämpfern.',
    video:'https://www.youtube.com/results?search_query=thoracic+spine+rotation+mobility+drill'},
  { id:'shoulder-dislocates', muscles:['schulter_l','schulter_r'], name:'SHOULDER DISLOCATES', muscle:'Rotatorenmanschette, Deltoid, Pectoralis – Gesamter Schulterbogen',
    goals:['injury','shoulders'],
    desc:'Bandgummi oder Besenstiel schulterbreit greifen. Arme gestreckt über Kopf bis hinter den Rücken führen und zurück. Griffweite progressiv enger. Kein Schmerz!',
    sets:['Sets: <strong>2×10</strong>','Griffbreite: <strong>Progressiv enger</strong>','Frequenz: <strong>Jedes Training (Warm-Up)</strong>'],
    tipLabel:'PFLICHT', tip:'Für jeden Boxer der viel Hände wirft. 2 Minuten vor jedem Training = Schultergesundheit langfristig sichern.',
    boxingConnection:'Boxer haben durch repetitives Schlagen eine extrem protrahierte Schulterposition. Shoulder Dislocates öffnen die vordere Kapsel, dehnen den Pectoralis minor und trainieren die Schulter durch den vollen Bewegungsumfang. Schützt die Rotatorenmanschette vor Impingement – die häufigste Schulterverletzung bei Boxern mit hohem Trainingsvolumen.',
    video:'https://www.youtube.com/results?search_query=shoulder+dislocates+band+mobility+warm+up'},
  { id:'ankle-mobility', muscles:['wade_l','wade_r'], name:'ANKLE DORSIFLEXION', muscle:'Soleus, Achillessehne, Tibialis anterior',
    goals:['footwork','injury'],
    desc:'Fuß an Wand, Knie Richtung Wand drücken ohne Ferse zu heben. Messen: wie viele cm Abstand Zehen-Wand? Ziel: >12cm. Banded Variante: Band um Sprunggelenk nach hinten für Gelenkkapsel-Mobilisation.',
    sets:['Sets: <strong>3×30 Sek. je Seite</strong>','Banded: <strong>2×15 je Seite</strong>','Test: <strong>>12cm = gut</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Eingeschränkte Dorsalflexion = Boxer kann nicht tief genug abtauchen (Ducking/Weaving). Auch limitierend für Squat-Tiefe im Krafttraining.',
    boxingConnection:'Ankle Dorsiflexion bestimmt, wie tief ein Boxer beim Ducken/Weaving gehen kann, ohne auf die Zehenspitzen zu kommen (= instabil). Eingeschränkte Dorsalflexion kompensiert durch Vorfuß-Dominanz: weniger stabile Basis, langsamere Richtungswechsel. >12cm im Wall Test ist das Minimum für Boxer. <10cm = aktiv mobilisieren.',
    video:'https://www.youtube.com/results?search_query=ankle+dorsiflexion+mobility+wall+test+banded'}
];

const exercisesPowerEndurance = [
  { id:'heavy-bag-intervals', muscles:['schulter_l','schulter_r','core','quad_l','quad_r'], name:'SANDSACK-INTERVALLE', muscle:'Gesamtkörper – Laktazides Energiesystem',
    goals:['stamina','power','speed'],
    desc:'30 Sek. All-Out Kombinationen am Sandsack → 30 Sek. aktive Erholung (Beinarbeit). 6–10 Runden. Puls muss in der Arbeit auf >85% HFmax. Qualität der Schläge hoch halten!',
    sets:['Work: <strong>30 Sek. All-Out</strong>','Rest: <strong>30 Sek. aktiv</strong>','Runden: <strong>6–10</strong>'],
    tipLabel:'Boxing Science', tip:'Das ist Kraftausdauer – die Fähigkeit, harte Schläge über die gesamte Kampfdauer zu werfen. Die meisten Boxer verlieren Schlagkraft ab Runde 2.',
    boxingConnection:'Boxing Science betont: Der größte Unterschied zwischen Elite- und Amateur-Boxern ist nicht die maximale Schlagkraft, sondern die Fähigkeit, diese über 3+ Runden aufrechtzuerhalten. Sandsack-Intervalle trainieren die laktazide Kapazität – die Fähigkeit, trotz steigendem Laktat weiter explosive Schläge zu werfen. Punch-Output sinkt bei untrainierten Boxern um ca. 40% zwischen Runde 1 und 3 (Praxiswert aus Trainingsbeobachtung).',
    video:'https://www.youtube.com/results?search_query=heavy+bag+interval+training+boxing+conditioning'},
  { id:'barbell-complex', muscles:['quad_l','quad_r','gluteus','schulter_l','schulter_r','core'], name:'BARBELL COMPLEX', muscle:'Gesamtkörper – Kraftausdauer + metabolische Konditionierung',
    goals:['stamina','power','clinch'],
    desc:'6 Übungen, je 6 Reps, OHNE Stange abzulegen: Deadlift → Bent Row → Hang Clean → Front Squat → Push Press → Back Squat. 3–4 Durchgänge, 2 Min. Pause.',
    sets:['Last: <strong>40–50% DL 1RM</strong>','Reps: <strong>6 je Übung</strong>','Sets: <strong>3–4</strong>','Pause: <strong>2 Min.</strong>'],
    tipLabel:'Wann', tip:'1× pro Woche als Finisher oder an einem separaten Konditionierungstag. Nicht vor Sparring einplanen.',
    boxingConnection:'Barbell Complexes trainieren die Fähigkeit, Kraft unter progressiver Ermüdung aufrechtzuerhalten – exakt die Anforderung im Ring. Danny Wilson (Boxing Science) nutzt Complexes als "work capacity"-Tool: Die Stange nicht ablegen zu können simuliert die konstante Belastung ohne echte Pause im Kampf. Metabolischer Stress bei submaximaler Last = Kraftausdauer ohne ZNS-Überbelastung.',
    video:'https://www.youtube.com/results?search_query=barbell+complex+conditioning+workout'},
  { id:'battle-ropes', muscles:['schulter_l','schulter_r','core','bizeps_l','bizeps_r'], name:'BATTLE ROPES', muscle:'Schultern, Core, Arme – Schnellkraftausdauer oberer Körper',
    goals:['stamina','shoulders','speed'],
    desc:'Alternating Waves: 20 Sek. All-Out, 40 Sek. Pause × 8 Runden. Variationen: Slams (Power), Circles (Schulter-Ausdauer), Alternating (Geschwindigkeit). Hüfte tief, Schultern arbeiten!',
    sets:['Work: <strong>20 Sek.</strong>','Rest: <strong>40 Sek.</strong>','Runden: <strong>8</strong>'],
    tipLabel:'Boxing-Relevanz', tip:'Trainiert Schulter-Ausdauer bei Schlaggeschwindigkeit. Wenn die Schultern in Runde 3 brennen, sinkt die Guard – Battle Ropes verhindern das.',
    boxingConnection:'Die Schultermuskulatur ist der häufigste Ermüdungsort bei Boxern – wenn die Schultern "zumachen", sinkt sowohl Schlagkraft als auch Guard-Höhe. Battle Ropes trainieren die Schulter-Ausdauer bei boxähnlicher Arm-Frequenz. Phil Daru nutzt 20/40-Intervalle als Standard-Protokoll für Kampfsportler: kurze All-Out-Phasen mit aktiver Erholung imitieren die Kampf-Dynamik.',
    video:'https://www.youtube.com/results?search_query=battle+ropes+workout+boxing+conditioning'},
  { id:'sled-push', muscles:['quad_l','quad_r','gluteus','wade_l','wade_r','core'], name:'SLED PUSH/PULL', muscle:'Gesamte untere Kette + Core – Konzentrisch dominant',
    goals:['power','stamina','footwork'],
    desc:'Schlitten beladen, 20–30m schieben (tiefer Winkel, Arme gestreckt), dann 20–30m am Seil zurückziehen. 4–6 Durchgänge. Keine exzentrische Phase = kaum Muskelkater, sofortige Recovery.',
    sets:['Distanz: <strong>20–30m</strong>','Sets: <strong>4–6</strong>','Pause: <strong>60–90 Sek.</strong>'],
    tipLabel:'Vorteil', tip:'Rein konzentrisch = kein Muskelkater. Kann 24h vor Sparring gemacht werden. Perfekt für In-Season Konditionierung.',
    boxingConnection:'Sled Pushes sind rein konzentrisch – keine exzentrische Phase bedeutet minimaler Muskelschaden und schnelle Recovery. Boxing Science nutzt den Schlitten als primäres Konditionierungs-Tool während der Wettkampfphase, wenn traditionelle Methoden zu viel Erholung kosten. Die tiefe Push-Position imitiert den Angriffswinkel beim Eindringen in die Distanz, und die fehlende Exzentrik erlaubt Training am Tag vor dem Sparring.',
    video:'https://www.youtube.com/results?search_query=sled+push+pull+conditioning+workout'}
];

const exercisesSpecial = [
  { id:'bfr', muscles:['bizeps_l','bizeps_r','schulter_l','schulter_r'], name:'BFR TRAINING', muscle:'Variabel – angepasst an Übung mit Okklusionsmanschetten',
    goals:['power','jab'],
    desc:'Manschetten am Oberarm, 40–50% Okklusion, 20–30% 1RM. Protokoll: 30-15-15-15 Reps mit 30 Sek. Pause. Erzeugt Hypertrophie bei minimaler mechanischer Last.',
    sets:['Schema: <strong>30/15/15/15</strong>','Last: <strong>20–30% 1RM</strong>','Okklusion: <strong>40–50%</strong>'],
    tipLabel:'Evidenz', tip:'Amani-Shalamzari et al. (2025): Jab +18%, Cross +21% nach 8 Wo. (n=30, einzelne Studie). Ideal in Schaerfungsphase.',
    boxingConnection:'BFR erzeugt lokale metabolische Erschoepfung und Wachstumshormon-Ausschuettung bei nur 20-30% 1RM – kein Muskelschaden, minimale ZNS-Belastung. Amani-Shalamzari et al. (2025, n=30 Elite-Boxer) zeigten nach 8 Wochen: Jab-Kraft +18%, Cross-Kraft +21%. Hinweis: Einzelstudie, weitere Replikation noetig. Perfekt fuer die Schaerfungsphase vor Wettkampf.',
    video:'https://www.youtube.com/results?search_query=blood+flow+restriction+BFR+training+arms+guide'},
  { id:'imt', muscles:['core'], name:'IMT POWERBREATHE', muscle:'Diaphragma, Interkostalmuskulatur',
    goals:['stamina'],
    desc:'PowerBreathe Gerät, 30 Atemzüge gegen Widerstand. 2× täglich (morgens + Mittag). Progressiv: Widerstand alle 2 Wochen erhöhen wenn 30 Atemzüge sauber machbar.',
    sets:['Atemzüge: <strong>2×30 täglich</strong>','Dauer: <strong>~5 Min.</strong>','Equipment: <strong>~70€</strong>'],
    tipLabel:'Warum', tip:'Boxer haben nachweislich schwache Atemmuskulatur. IMT verhindert den Respiratory Metaboreflex in späten Runden.',
    boxingConnection:'Boxer haben nachweislich schwächere Atemmuskulatur als untrainierte Kontrollgruppen (Mazic, 2015) – paradox für eine Ausdauersportart. Bei Erschöpfung der Atemmuskulatur tritt der Metaboreflex ein: Blutgefäße in Armen und Beinen verengen sich, weniger O₂ für Schläge und Beinarbeit. IMT steigert die MVV um +28.6% in 6 Wochen und verschiebt den Metaboreflex-Schwellenwert in späte Runden.',
    video:'https://www.youtube.com/results?search_query=inspiratory+muscle+training+powerbreathe+technique'},
  { id:'shadow-boxing', muscles:['schulter_l','schulter_r','core','quad_l','quad_r'], name:'SHADOW BOXING MIT VISUALISIERUNG', muscle:'Gesamtkoordination + Neurale Bahnung',
    goals:['shoulders','speed','jab'],
    desc:'5–10 Min. Schattenboxen vor dem Spiegel oder freistehend. Spezifische Kombis gegen imaginierten Gegner. In echtem Tempo, mit Fussarbeit und Deckung.',
    sets:['Dauer: <strong>5–10 Min.</strong>','Frequenz: <strong>Täglich</strong>','Kein Equipment'],
    tipLabel:'Wissenschaft', tip:'Visualisierung aktiviert dieselben motorischen Cortex-Areale wie echte Bewegung (MRT-belegt).',
    boxingConnection:'fMRT-Studien belegen: Visualisierung aktiviert dieselben motorischen Cortex-Areale wie echte Bewegung mit ~70% der neuronalen Aktivierung. Schattenboxen mit Visualisierung trainiert die neurale Bahnung von Kombinationen ohne mechanische Belastung. Besonders effektiv in Erste-Person-Perspektive mit emotionaler Beteiligung – die Qualität der Vorstellung bestimmt den Trainingseffekt (Wakefield & Smith, 2012).',
    video:'https://www.youtube.com/results?search_query=shadow+boxing+technique+visualization+training'}
];

const allExercises = [...exercisesKraft, ...exercisesAusdauer, ...exercisesArmor, ...exercisesHands, ...exercisesMobility, ...exercisesPowerEndurance, ...exercisesSpecial];
function getExerciseById(id) { return allExercises.find(function(e) { return e.id === id; }) || null; }
