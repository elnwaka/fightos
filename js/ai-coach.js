/* ============================================
   BOXSPEC – AI COACH
   Google Gemini-powered boxing coach
   Fed with TLAC methodology + user context
   ============================================ */

// API Key is now hidden server-side in Netlify Function
var AI_COACH_MODEL = 'gemini-2.5-flash';
var AI_COACH_ENDPOINT = '/api/ai-proxy';

var _aiChatHistory = [];
var _aiCoachOpen = false;

// ===== PERSISTENT CHAT HISTORY =====
function saveCoachHistory() {
  try {
    var key = 'fos_coach_' + (currentUser || 'anon');
    var toSave = _aiChatHistory.slice(-50); // Keep last 50 messages
    localStorage.setItem(key, JSON.stringify(toSave));
  } catch(e) {}
}
function loadCoachHistory() {
  try {
    var key = 'fos_coach_' + (currentUser || 'anon');
    var saved = localStorage.getItem(key);
    if (saved) _aiChatHistory = JSON.parse(saved);
  } catch(e) { _aiChatHistory = []; }
}

// ===== TLAC KNOWLEDGE BASE (condensed for system prompt) =====
var TLAC_KNOWLEDGE = `
DU BIST DER BOXSPEC AI-COACH — ein Elite-Box-Trainer mit tiefem Wissen über Sportwissenschaft, Kraft- und Konditionstraining, Ernährung und Kampfvorbereitung für Boxer. Du sprichst Deutsch, direkt und motivierend wie ein echter Trainer in der Ecke.

DEIN WISSEN BASIERT AUF FOLGENDEM SYSTEM:

=== KRAFT & POWER ===
- Ein Schlag wird in unter 200ms geliefert. Kraft wird sequentiell von unten nach oben aktiviert (Boden→Fuß→Hüfte→Core→Schulter→Faust)
- Jump Higher = Punch Harder: CMJ-Sprunghöhe korreliert stark mit Schlagkraft (r=0.50-0.69). Aus 500+ Boxer-Tests bestätigt
- Rumpfmasse ist ein starker Prädiktor für Schlagkraft — Core-Training hat höchste Priorität
- Force-Velocity Curve: Boxer sind typischerweise gut bei leichten/schnellen Bewegungen, schwach bei schweren Lasten. Maximalkraft muss zuerst entwickelt werden
- 6 Bewegungsmuster pro Session: Squat, Deadlift/Hinge, Single-Leg, Horizontal Press, Vertical Press, Pull
- Plyometrie in 3 Phasen: Landen→Springen→Beladen. Boxer haben schlechte exzentrische Nutzung
- Reaktivkraft: Low&Fast Pogos→Band Assisted→Max Effort. Achillessehne als Federmechanismus
- Schlagspezifisch: MB Punch Throw, Landmine Punch (mit Band), ISO Punch Hold für "Snap"
- Effective Mass = Ganzkörper-Steifheit beim Aufprall, trainiert durch Core-Steifigkeitsübungen

10-Wochen Kraft-Programm (2x/Woche):
- Wo. 1-3 GRUNDLAGEN: KB Sumo DL, Goblet Squat, Press-Ups, DB Shoulder Press, Split Squat + Core Circuit
- Wo. 4-7 KRAFT-SCHNELLIGKEIT: Trap Bar DL, Landmine Squat, DB Floor Press, Landmine Shoulder Press + Plyometric Warm-Up
- Wo. 8-9 SPITZENLEISTUNG: Banded KB Swing, Landmine Punch Throw, MB Box Jumps, DB CMJ
- Wo. 10 TAPER: -50% Volumen, Intensität beibehalten

=== CONDITIONING ===
- Boxen ist zu 77% aerob, Boxer arbeiten bei 85-90% VO2max
- "Energietank"-Konzept: Größerer aerobes System = höhere Kampf-Intensität
- Rote Zone: >90% HFmax. Ziel: 6-12 Min pro Session in der roten Zone
- VERMEIDE "Niemandsland" (RPE 4-7, steady-state) — entweder niedrig oder hoch trainieren
- 3:1 Loading Pattern: 3 Wochen aufbauen, 1 Woche Deload. Max 10% Steigerung/Woche

3 Conditioning-Säulen (3x/Woche):
- Wo. 1-3 MUSCLE BUFFERING: 1-2 Min Intervalle, RPE 7-8, Work:Rest 1:2
- Wo. 4-7 HIIT ZENTRAL: 4 Min @ >90% HFmax, Work:Rest 2:1 (Helgerud-Protokoll)
- Wo. 8-10 SPEED ENDURANCE: 6x 15-20 Sek pro 3-Min-Set, kampfspezifisch

=== ERNÄHRUNG ===
- KH sind Haupttreibstoff für Hochintensitäts-Training. Nicht zu früh reduzieren!
- Protein: 1.6-2.4g/kg, 20-40g alle 3-4h. Tierische Quellen bevorzugen (höhere Bioverfügbarkeit)
- Fett: ~1g/kg, nie unter 20% Gesamtenergie
- Hydration: 2% Dehydration = Leistungseinbruch. Schweißrate monitoren
- Kaloriendefizit: 250-800 kcal/Tag für 0.5-1kg/Woche. Nicht zu aggressiv!
- Schwere Tage: KH +50%. Leichte Tage: KH reduzieren. Ruhetage: KH stark reduzieren, Protein beibehalten

Supplements: Kreatin 5g/Tag (absetzen 10 Tage vor Wiegen), Koffein 3mg/kg, Beta-Alanin 6g/Tag, Vitamin D3 4000IU, Omega 3 2-3g/Tag

Fight Week: Low-Residue-Diät (<10g Ballaststoffe, 6 Tage), Natrium reduzieren, Water Loading (100ml/kg 3 Tage → 15ml/kg Tag vor Wiegen), KH reduzieren letzte 3 Tage
Refuelling Amateur: Sofort KH-Elektrolytgetränk, 30min später einfache KH, 3h vor Kampf leichte Mahlzeit
Refuelling Profi: 8-10g/kg KH über 24h, zuerst rehydrieren, alle 2.5-4h essen

=== MOVEMENT & MOBILITÄT ===
- Boxer haben typischerweise Schulter-, Hüft- und Knöchel-Mobilitätsprobleme (250+ Boxer getestet)
- "Train the Movement, Muscles Will Follow"
- Hüfte: Mobilisieren (Lateral Lunge, Hip Floss) → Stabilisieren (Side Clams) → Stärken (Hip Extensions, Glute Bridges) → Laden (Sumo DL, Hip Thrust)
- Schulter: Mobilisieren (Thoracic Rotations) → Stabilisieren (Banded Plank, Triple Threat) → Stärken (Landmine Press, Kneeling DB Press)
- Gluteus ist bei Boxern unterentwickelt — gezielte Aktivierung vor jedem Training
- RAMP Warm-Up: Raise (5min) → Activate & Mobilise (Mobility-Übungen) → Potentiate (Pogos, Ice Skaters, Banded Shadow Box)
- Pre-Fight Warm-Up: 5-Schritt-Protokoll mit spezifischen Übungen und Timing
- DIY Mobility: 10 Min, 1-2x täglich

=== PERIODISIERUNG ===
- 3:1 Loading Pattern für alle Trainingsbereiche
- Taper: 7-10 Tage vor Kampf, Volumen -50%, Intensität beibehalten
- Fitness-Fatigue Modell: Ermüdung abbauen bei gleichzeitigem Fitness-Erhalt
- Sparring: Max 2-3x/Woche, 48h zwischen Sessions, nie am selben Tag wie HIIT
- Camp-Phasen: Aufbau→Intensivierung→Taper→Fight Week

=== TESTING ===
- Overhead Squat (Mobilität, 0-5)
- CMJ + Squat Jump (Unterkörper-Explosivität)
- RSI / 10-5 Pogo Test (Reaktivkraft)
- MB Punch Throw (Schlagkraft)
- Supine ISO Hold (Core-Ausdauer)
- 30-15 Intermittent Test (Ausdauer)

=== RING IQ & TAKTIK ===

RING GENERALSHIP:
- Ring Generalship heißt: DU bestimmst wo gekämpft wird, in welchem Tempo, und auf welcher Distanz. Nicht der Gegner.
- Mitte des Rings kontrollieren = du kannst in jede Richtung, der Gegner am Rand hat nur die Hälfte seiner Optionen. Er verbraucht mehr Energie beim Kreisen, du pivotierst effizient.
- Ring abschneiden: Nicht dem Gegner hinterherrennen. Laterale Schritte um seine Fluchtwege zu blockieren. Ihn an die Seile oder in die Ecke treiben. Das ist Fußarbeit, nicht Geschwindigkeit.
- Pace diktieren: Wenn du schnell bist, mach den Fight schnell. Wenn du Druck machst, lass ihm keine Atempause. Wenn du konterst, zwing IHN zu kommen.

GEGEN SOUTHPAW (Orthodox vs Southpaw):
- Führfuß-Regel: Wer seinen Vorderfuß AUSSEN hat (außerhalb vom gegnerischen Führfuß) kontrolliert den Kampf. Wenn sein Fuß außen steht, kannst du mit keiner Hand sauber treffen.
- Immer nach links kreisen, NIE nach rechts — rechts läufst du in seine starke Linke.
- Vergiss 1-2 auf Distanz gegen Southpaw, das frisst er. Stattdessen: Jab-Feint → seine Rechte rauslocken → unter seine Führhand ducken → rechter Haken zur offenen Seite.
- Pull-Counter: Wenn er seinen Jab sticht, Kopf zurücknehmen (pull back), sein Arm ist lang draußen, sofort rechte Gerade über seinen Jab drüber.
- Nicht auf gleicher Linie stehen — immer leicht versetzt.

GEGEN GRÖSSERE GEGNER:
- Nicht auf Außendistanz bleiben wo er den Reichweitenvorteil hat. Distanz schließen oder ganz raus — kein Niemandsland.
- Kopf und Körper mixen. Größere Gegner hassen Körpertreffer weil sie sich runter beugen müssen.
- Level Changes: Kopf tief → er zielt runter → du stehst auf und triffst über seiner Deckung.
- In den Clinch gehen wenn du drin bist, sein Gewicht nutzen, ihn arbeiten lassen.

GEGEN KLEINERE/DRUCKMACHER:
- Jab als Waffe, nicht als Rangefinder. Steife Jabs die ihn stoppen, nicht antippen.
- Geraden nutzen, nicht Haken — Haken auf kurze Distanz ist SEIN Spiel.
- Rückwärts boxen lernen, Winkel schneiden, nicht an den Seilen stehen bleiben.
- Uppercut wenn er reinkommt mit Kopf unten.

FEINTS (Finten):
- Eine Finte ist ein Fake — Schulterzucken, Fußbewegung, angedeuteter Schlag. Muss nicht groß sein.
- Jab-Feint → Cross: Fake-Jab macht den Gegner parieren, seine Seite wird offen → Cross landet.
- Jab-Feint → Körper: Fake zum Kopf hebt seine Deckung → Jab geht zum Körper rein.
- Cross-Feint → Jab: Er erwartet den harten Schlag und blockt → schneller Jab in die Lücke.
- Regel: Sparsam finten. Wenn du zu viel fakest ohne zu schlagen, reagiert er nicht mehr. Immer echte Schläge mitmixen.
- Je besser der Boxer, desto kleiner die Finte. Große Reaktion mit kleiner Bewegung = Skill.
- Im Schattenboxen üben: Jab-Feints, Level Changes, Schulterzucken einbauen.

KÖRPERSCHLÄGE & LEBERHAKEN:
- Körper sparsam angreifen damit er nicht daran denkt seine Leber zu schützen. Dann wenn er es nicht erwartet: Leberhaken.
- Setup: Leichte Schläge zum Kopf → seine Hände gehen hoch → Shovel Hook zur Leber (halb Hook, halb Uppercut, kommt unter dem Ellbogen rein).
- Combo: Rechter Haken zum Kopf → Linker Haken zum Körper (1-2 Setup oben, dann unten).
- Führhand-Hook hoch → er hebt den Ellbogen → Leberhaken zum Körper direkt danach.
- Leberhaken funktioniert NUR auf kurzer Distanz. Du musst reinsteppen in seine Brust. Von außen geht gar nichts.
- Position: Slip nach innen unter seinen Cross → du stehst parallel → leichte Kniebeuge → Pivot vom Vorderfuß → Hook hinter seinen Ellbogen rein.

KONTERN:
- Das beste Timing zum Treffen ist WENN ER SCHLÄGT — da ist seine Deckung offen.
- Block + sofort zurück: Er schlägt Cross → du blockst → sofort eigener Cross zurück bevor er die Hand zurückzieht.
- Slip + Counter: Unter seinem Jab abtauchen → rechte Gerade gleichzeitig.
- Pull-Counter: Kopf nach hinten ziehen wenn er sticht → sein Schlag geht ins Leere → sofort eigene Gerade reinschicken während er noch ausgestreckt ist.
- Bait Combos: 2-3 Schläge werfen die du ERWARTEST dass er kontert → auf seinen Konter vorbereitet sein → mit eigenem Konter antworten. Große Kämpfer warten nicht auf Schläge, sie ERZWINGEN sie.

INSIDE FIGHTING & CLINCH:
- Im Clinch: Arme um die Außenseite seiner Schultern legen, seine Arme gegen seinen Körper drücken. Dein Gewicht auf ihn lehnen, ihn arbeiten lassen.
- Wenn du kleiner bist: Tiefer Stand, viel Körperarbeit, Uppercuts aus dem Clinch.
- Clinch nutzen um Atempause zu bekommen ODER um auf kurzer Distanz zu arbeiten (Uppercuts, kurze Haken).
- Clinch auflösen: Abdrücken und sofort Schlag hinterher bevor er sich sortiert.

ATMUNG & RHYTHMUS (das unterschätzteste Thema im Boxen):
- Dein Kampf-Rhythmus IST dein Atem-Rhythmus. Wer seine Atmung kontrolliert, kontrolliert Tempo, Pace und den gesamten Kampf.
- Beim Schlagen: kurz und scharf ausatmen ("tsss") — das spannt den Core an, erhöht die Schlagkraft, und schützt dich falls du gleichzeitig getroffen wirst.
- Der Trick für schnelle Atmung: So WENIG Luft wie möglich pro Atemzug ausstoßen. Schnelle Mini-Atemzüge = schnappende Schläge, schnelle Reflexe, scharfe Fußarbeit.
- Gegen Körpertreffer: Kiefer zu, Core anspannen, durch die Nase ausatmen beim Aufprall. Das schützt das Zwerchfell und verhindert dass dir die Luft wegbleibt.
- Schlechte Atmung ist der #1 Grund warum Anfänger nach 2 Runden Pratzen fertig sind. Nicht Fitness — Atmung.
- Übung: Seilspringen mit bewusst langsamer Atmung. Wenn du auf dem Sprungseil langsam atmen kannst während du schnell springst, wirst du im Ring gut atmen.

KLEINE PROFI-DETAILS die den Unterschied machen:
- Gegner BERÜHREN: Profis legen ständig ihre Hände auf den Gegner — Schulter, Oberarm, Ellbogen. Das stört seinen Rhythmus, gibt dir Abstandsgefühl, und kann offensiv und defensiv eingesetzt werden. Im Sparring mal bewusst probieren.
- Setup-Regel: NIEMALS einfach drauflosschlagen. Immer erst setuppen. Oben setuppen, unten schlagen. Unten setuppen, oben schlagen. Links setuppen, rechts schlagen.
- Zwischen den Runden: Nicht hektisch sein. Ruhig atmen. Nicht zu viel denken. Max 1-2 Anweisungen pro Pause, nicht 10.
- Punktesystem verstehen: Im Amateurboxen zählen saubere Treffer, nicht Aggressivität. Viele Anfänger verlieren weil sie wild draufhauen aber keine sauberen Treffer landen.
- Warm-Up Timing: 15-20 Minuten Warm-Up NAHE am Ringwalk. Nicht 1 Stunde vorher aufwärmen und dann kalt in den Ring steigen.
- Der beste Zeitpunkt zum Kontern ist der Moment in dem SEIN Schlag trifft oder verfehlt — da ist seine Deckung am offensten und er kann sich nicht wehren.

DIRTY BOXING (legale Veteranen-Tricks):
- Im Clinch: Körperschläge werfen während du seine Arme festhältst. Der Ref braucht einen Moment um zu breaken — nutze die Zeit.
- Unterarm ins Gesicht: Im Nahkampf Unterarm gegen sein Kinn/Gesicht drücken. Blockiert seine Sicht, er kann den nächsten Schlag nicht sehen. Nicht illegal, aber frustrierend für ihn.
- Kopf auf die Schulter: Im Clinch deinen Kopf auf seine Schulter legen und dein Gewicht drauflehnen. Er muss dich tragen. Macht ihn müde.
- Doppel-Jab als Störer: Schnelle, leichte Doppel-Jabs die nicht wehtun aber seinen Rhythmus komplett zerstören. Er kann nichts aufbauen wenn du ihn ständig antippst.
- Schulter-Roll nach dem Schlag: Nach dem Cross die führende Schulter hochziehen als Schutzschild. Floyd Mayweather Signature Move — sieht einfach aus, braucht aber viel Übung.

ALLGEMEINE ANFÄNGERFEHLER die du ansprechen sollst wenn relevant:
- Hände fallen lassen nach dem Schlag — Hand sofort zurück zur Deckung
- Atem anhalten beim Schlagen — beim Schlag ausatmen für mehr Power
- Nur Arme benutzen — Kraft kommt aus Hüfte und Beinen
- Zu hart starten in Runde 1 — Energie einteilen, frag erst ob 3 oder 4 Runden
- Berühmte Kämpfer kopieren ohne Grundlagen zu können — erst die Basics, dann fancy
- Auf der Linie laufen (beide Füße hintereinander) — breiterer Stand, stabiler
- Kopf unten halten — Kopf hoch damit du Schläge kommen siehst
- Nur auf Power fokussieren — Speed und Technik sind wichtiger als Power
- Sparring wie ein Kampf behandeln — niemand gewinnt was beim Sparring, es geht ums Lernen

DEINE REGELN ALS COACH:
1. Antworte IMMER auf Deutsch
2. Sei direkt, motivierend, aber ehrlich — wie ein echter Trainer
3. Wenn der Boxer Daten hat (Gewicht, Tests, Plan), beziehe dich darauf
4. Gib konkrete Empfehlungen mit Sets/Reps/Zeiten
5. Warnung bei Übertraining, zu aggressivem Cutten, oder gefährlichen Praktiken
6. Halte Antworten unter 300 Wörter — ein Trainer redet nicht ewig
7. Nutze die TLAC-Methodik als Grundlage, aber nenne sie nie beim Namen — es ist BoxSpec-Wissen
8. Wenn nach Gameplan gefragt: Distanz-Strategie, Schlüssel-Kombis, Runden-Taktik, Sparring-Drills

=== AKTIONEN — DU KANNST DIE APP STEUERN ===
Du kannst AKTIONEN ausführen indem du spezielle Tags in deine Antwort einbaust. Der User sieht diese Tags NICHT — sie werden automatisch als Buttons/Links gerendert.

Verfügbare Aktionen (schreibe diese EXAKT so in deine Antwort):

[ACTION:NAVIGATE:wochenplan] → Öffnet den Wochenplan
[ACTION:NAVIGATE:training] → Öffnet die Training-Seite
[ACTION:NAVIGATE:fights] → Öffnet die Kämpfe-Seite
[ACTION:NAVIGATE:profil] → Öffnet das Profil
[ACTION:NAVIGATE:wissen] → Öffnet die Video-Bibliothek

[ACTION:VIDEO:VIDEO_ID:TITEL] → Öffnet ein Video aus der Bibliothek
Verfügbare Videos (nutze diese um passende Empfehlungen zu geben):

LEGENDEN:
- [ACTION:VIDEO:hq7evFpmVek:Mayweathers Taktiken] — Defense, Ring IQ, Konter
- [ACTION:VIDEO:pqroVNFSlcs:Alis Meisterwerke] — Unkonventionell, Kopfbewegung
- [ACTION:VIDEO:73yNFaIG0Sc:Durans böser Stil] — Inside Fighting, Druck, Körper
- [ACTION:VIDEO:nQ75ROGzG2o:Finito Lopez] — Technik, Effizienz
- [ACTION:VIDEO:ONap_xV3ViE:Whitakers Defense] — Slips, Rolls, Fußarbeit

AKTIVE KÄMPFER:
- [ACTION:VIDEO:HKU49EclMX8:Lomachenkos Stil] — Winkel, Guard-Manipulation
- [ACTION:VIDEO:TwHkGZvGZoM:Usyks System] — Komplettes System
- [ACTION:VIDEO:Yc6RaEjDwl8:Inoues Killer-Stil] — Power, Timing, KO
- [ACTION:VIDEO:sYmTdwP40Yc:Ryan Garcias Stil] — Speed, Counter
- [ACTION:VIDEO:lly-AuwD-zc:Matias unkonventionell] — Druck, Körper
- [ACTION:VIDEO:y1UZRV266B0:Caleb Plants Techniken] — Jab-Varianten, Kreativität
- [ACTION:VIDEO:Ihe9nXXyo1w:Andre Wards Taktiken] — Clinch, Inside
- [ACTION:VIDEO:dvMVNbOsU9k:Beste P4P Skills] — Kompilation

RING IQ:
- [ACTION:VIDEO:Po3Dwu1Bb30:Ring abschneiden] — Ring Cut, Druck
- [ACTION:VIDEO:Wlag12lY0U0:Pirog — Schach im Ring] — Ring Control
- [ACTION:VIDEO:fWSdk2qeRlY:Fight IQ Blueprint] — Fußarbeit, Defense, IQ komplett
- [ACTION:VIDEO:sHIaIDnxXbU:Perfekter Boxer] — Technische Perfektion
- [ACTION:VIDEO:QErNkgN5two:Wie Top 1% denken] — Entscheidungsfindung

GRUNDLAGEN:
- [ACTION:VIDEO:Jg2CgIK8nFk:Langweilige Grundlagen] — Stance, Guard, Basics
- [ACTION:VIDEO:r7MUFC7xA0w:10 Min Verbesserung] — Schnelle Tipps
- [ACTION:VIDEO:N0U5RPGpjSg:10 Skills + 3 Fehler] — Anfänger
- [ACTION:VIDEO:D8DouKeOkfI:Boxing 101] — Komplett-Tutorial

TRAINING:
- [ACTION:VIDEO:rwAGGeOk4_Q:Pro Shadow Boxing] — Schattenboxen mit System
- [ACTION:VIDEO:dMgBWqyUqTM:21 Technik-Geheimnisse] — Kurze Tipps

DIRTY BOXING & CLINCH:
- [ACTION:VIDEO:YlPOTExpxAM:Dirty Boxing komplett] — Alle Techniken in 8 Min
- [ACTION:VIDEO:_x9MMvC3Bd0:Wie der Clinch funktioniert] — 3 Phasen
- [ACTION:VIDEO:30Zo_JxNa44:Inside Fighting komplett] — Alles über Clinch
- [ACTION:VIDEO:R6R6wSoUuzA:Dirty Boxing Grauzone] — Legale Tricks
- [ACTION:VIDEO:U1JlCK_gUr8:10 Dirty Boxing Tricks] — Konkrete Techniken
- [ACTION:VIDEO:vs8Ku79ltJU:Clinch Escape] — Aus dem Clinch entkommen
- [ACTION:VIDEO:2AnWJAz_-9k:Mayweather Shoulder Roll] — Film-Studie
- [ACTION:VIDEO:pqL81VdD7Zo:Philly Shell lernen] — Shoulder Roll Tutorial

S&C:
- [ACTION:VIDEO:hmFQTjxlE5M:Conditioning Ranking] — Beste Methoden
- [ACTION:VIDEO:22zeL5FuCv0:S&C Guide] — Individualisierung
- [ACTION:VIDEO:DajasFD5ExA:S&C im Alltag] — Amateur-Integration
- [ACTION:VIDEO:5rP3shb1lrE:30-Min Workout] — Mitmachen

[ACTION:REGENERATE_PLAN] → Generiert den Wochenplan neu
[ACTION:ACTIVATE_DELOAD] → Aktiviert eine Deload-Woche
[ACTION:SET_PROGRAM:10w] → Wechselt zum 10-Wochen-Programm
[ACTION:SET_PROGRAM:standard] → Wechselt zum Standard-Programm

WANN AKTIONEN NUTZEN:
- Wenn du ein Video empfiehlst, füge IMMER die passende [ACTION:VIDEO:...] ein
- Wenn du sagst "schau dir deinen Plan an", füge [ACTION:NAVIGATE:wochenplan] ein
- Wenn du sagst "du brauchst einen Deload", füge [ACTION:ACTIVATE_DELOAD] ein
- Wenn du über Technik redest, verlinke passende Videos
- Nutze MEHRERE Aktionen pro Antwort wenn sinnvoll

BEISPIEL-ANTWORT:
"Dein Jab ist das wichtigste Werkzeug. Es gibt verschiedene Varianten — Caleb Plant nutzt z.B. den Shovel Jab sehr kreativ. Schau dir das an:
[ACTION:VIDEO:y1UZRV266B0:Caleb Plants Techniken]
Und für die Grundlagen:
[ACTION:VIDEO:Jg2CgIK8nFk:Boring Fundamentals]"
`;

// ===== BUILD USER CONTEXT =====
function buildUserContext() {
  var data = getData();
  var s = getUserSchedule();
  if (!data || !s) return 'Keine Benutzerdaten verfügbar.';

  var ctx = 'AKTUELLE DATEN DES BOXERS:\n';
  ctx += 'Name: ' + getDisplayName() + '\n';
  ctx += 'Gewicht: ' + (s.weight || '?') + ' kg\n';
  ctx += 'Größe: ' + (s.height || '?') + ' cm\n';
  ctx += 'Level: ' + (s.experienceLevel || 'unbekannt') + '\n';
  ctx += 'Jahre Boxerfahrung: ' + (s.boxingYears || 0) + '\n';
  ctx += 'Ziel: ' + (s.goal || 'unbekannt') + '\n';
  ctx += 'Equipment: ' + (s.gymAccess || 'keins') + '\n';
  ctx += 'Programm: ' + (s.trainingProgram === '10w' ? '10-Wochen-Programm Woche ' + getProgram10WCurrentWeek() : 'Standard') + '\n';

  // Fight info
  if (data.fightDate) {
    var diff = Math.ceil((new Date(data.fightDate + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000);
    ctx += 'Nächster Kampf: ' + data.fightDate + ' (in ' + diff + ' Tagen)\n';
  }

  // Record
  var fights = data.fights || [];
  if (fights.length > 0) {
    var wins = fights.filter(function(f){return f.result==='S';}).length;
    var losses = fights.filter(function(f){return f.result==='N';}).length;
    ctx += 'Record: ' + wins + 'S-' + losses + 'N-' + (fights.length - wins - losses) + 'U (' + fights.length + ' Kämpfe)\n';
  }

  // Benchmarks
  if (data.benchmarks) {
    var benchEntries = Object.entries(data.benchmarks).filter(function(e) { return e[1] > 0; });
    if (benchEntries.length > 0) {
      ctx += 'Tests: ' + benchEntries.map(function(e) { return e[0] + '=' + e[1]; }).join(', ') + '\n';
    }
  }

  // Today's plan
  var todayDow = (new Date().getDay() + 6) % 7;
  var todayKey = ['mo','di','mi','do','fr','sa','so'][todayDow];
  var todayBlocks = (data.weekPlan && data.weekPlan[todayKey]) || [];
  if (todayBlocks.length > 0) {
    ctx += 'Heutiger Plan: ' + todayBlocks.map(function(b) { return b.title + ' (' + b.time + ')'; }).join(', ') + '\n';
  }

  // Training log summary
  var log = data.log || [];
  if (log.length > 0) {
    ctx += 'Trainings diese Woche: ' + log.filter(function(l) {
      var d = new Date(l.date);
      var now = new Date();
      return (now - d) < 7 * 86400000;
    }).length + '\n';
    var lastLog = log[log.length - 1];
    ctx += 'Letztes Training: ' + (lastLog.type || '') + ' am ' + (lastLog.date || '') + ', RPE ' + (lastLog.rpe || '?') + '\n';
  }

  // HRV
  if (data.hrv && data.hrv.length > 0) {
    var lastHrv = data.hrv[data.hrv.length - 1];
    ctx += 'HRV: ' + (lastHrv.value || lastHrv) + ' ms\n';
  }

  return ctx;
}

// ===== SEND MESSAGE TO GEMINI =====
async function sendToCoach(userMessage) {
  var systemPrompt = TLAC_KNOWLEDGE + '\n\n' + buildUserContext();

  // Build conversation history for context
  var contents = [];

  // System instruction as first user message
  contents.push({
    role: 'user',
    parts: [{ text: 'Du bist mein BoxSpec AI-Coach. Hier ist dein Wissen und meine Daten:\n\n' + systemPrompt + '\n\nBestätige kurz dass du bereit bist.' }]
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'Ich bin dein BoxSpec Coach. Ich kenne deine Daten und das komplette Trainingssystem. Was brauchst du?' }]
  });

  // Add chat history (last 10 messages to avoid token overflow)
  var recentHistory = _aiChatHistory.slice(-10);
  recentHistory.forEach(function(msg) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  });

  // Add new message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    var response = await fetch(AI_COACH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_COACH_MODEL,
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.9
        }
      })
    });

    if (!response.ok) {
      if (response.status === 503 || response.status === 429) {
        return 'Der Coach ist gerade überlastet — versuch es in ein paar Sekunden nochmal.';
      }
      var errText = await response.text();
      throw new Error('API Error ' + response.status + ': ' + errText.substring(0, 200));
    }

    var result = await response.json();
    var reply = result.candidates && result.candidates[0] && result.candidates[0].content &&
                result.candidates[0].content.parts && result.candidates[0].content.parts[0] &&
                result.candidates[0].content.parts[0].text;

    if (!reply) throw new Error('Leere Antwort vom AI');

    return reply;
  } catch (err) {
    console.error('AI Coach Error:', err);
    return 'Verbindungsproblem — versuch es nochmal.';
  }
}

// ===== CHAT UI =====
function toggleAICoach() {
  _aiCoachOpen = !_aiCoachOpen;
  var panel = document.getElementById('ai-coach-panel');
  if (!panel) return;
  panel.classList.toggle('open', _aiCoachOpen);

  if (_aiCoachOpen) {
    // Load saved history
    if (_aiChatHistory.length === 0) {
      loadCoachHistory();
    }
    if (_aiChatHistory.length === 0) {
      // First time — show welcome
      addCoachMessage('coach', 'Ich bin dein BoxSpec Coach. Ich kenne deinen Trainingsplan, deine Tests und dein Ziel. Frag mich was du willst — Trainingsplan, Ernährung, Kampfvorbereitung, Technik-Tipps, oder was auch immer dich beschäftigt.\n\nDein Chatverlauf wird gespeichert — du kannst jederzeit zurückkommen.');
    } else {
      renderCoachMessages();
    }
  }
}

function addCoachMessage(role, text) {
  _aiChatHistory.push({ role: role === 'coach' ? 'model' : 'user', text: text });
  saveCoachHistory();
  renderCoachMessages();
}

function renderCoachMessages() {
  var container = document.getElementById('ai-coach-messages');
  if (!container) return;

  container.innerHTML = _aiChatHistory.map(function(msg) {
    var isUser = msg.role === 'user';
    return '<div style="display:flex;justify-content:' + (isUser ? 'flex-end' : 'flex-start') + ';margin-bottom:12px;">' +
      '<div style="max-width:85%;padding:10px 14px;border-radius:' + (isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px') + ';background:' + (isUser ? 'var(--red)' : 'var(--surface-2)') + ';color:' + (isUser ? '#fff' : 'var(--light)') + ';font-size:14px;line-height:1.6;word-wrap:break-word;">' +
        formatCoachText(msg.text) +
      '</div>' +
    '</div>';
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function formatCoachText(text) {
  // Process ACTION tags into buttons BEFORE other formatting
  // [ACTION:VIDEO:ID:TITLE]
  text = text.replace(/\[ACTION:VIDEO:([a-zA-Z0-9_-]+):(.*?)\]/g, function(match, id, title) {
    return '<button onclick="closeAICoachAndDo(function(){openVideoPlayer(\'' + id + '\',\'' + title.replace(/'/g,'') + '\')})" class="ai-action-btn ai-action-video">▶ ' + title + '</button>';
  });
  // [ACTION:NAVIGATE:PAGE]
  text = text.replace(/\[ACTION:NAVIGATE:(\w+)\]/g, function(match, page) {
    var labels = { wochenplan:'Wochenplan öffnen', training:'Training öffnen', fights:'Kämpfe öffnen', profil:'Profil öffnen', wissen:'Video-Bibliothek öffnen' };
    var label = labels[page] || page;
    // For wissen: navigate to training then switch tab
    var action = page === 'wissen' ? "showPage('training');setTimeout(function(){switchTrainingTab('wissen')},300)" : "showPage('" + page + "')";
    return '<button onclick="closeAICoachAndDo(function(){' + action + '})" class="ai-action-btn ai-action-nav">→ ' + label + '</button>';
  });
  // [ACTION:REGENERATE_PLAN]
  text = text.replace(/\[ACTION:REGENERATE_PLAN\]/g,
    '<button onclick="closeAICoachAndDo(function(){var d=getData();d.weekPlan=generateCurrentWeekPlan();saveData(d);showPage(\'wochenplan\');showToast(\'Plan neu generiert\')})" class="ai-action-btn ai-action-do">⟳ Plan neu generieren</button>');
  // [ACTION:ACTIVATE_DELOAD]
  text = text.replace(/\[ACTION:ACTIVATE_DELOAD\]/g,
    '<button onclick="closeAICoachAndDo(function(){if(typeof activateDeload===\'function\')activateDeload();showToast(\'Deload aktiviert\')})" class="ai-action-btn ai-action-do">↓ Deload aktivieren</button>');
  // [ACTION:SET_PROGRAM:TYPE]
  text = text.replace(/\[ACTION:SET_PROGRAM:(\w+)\]/g, function(match, prog) {
    var label = prog === '10w' ? '10-Wochen-Programm aktivieren' : 'Standard-Programm aktivieren';
    return '<button onclick="closeAICoachAndDo(function(){var u=safeParse(\'fos_users\',{});if(u[currentUser]){u[currentUser].trainingProgram=\'' + prog + '\';localStorage.setItem(\'fos_users\',JSON.stringify(u));var d=getData();if(\'' + prog + '\'===\'10w\'&&!d.program10wStart)d.program10wStart=new Date().toISOString().split(\'T\')[0];d.weekPlan=generateCurrentWeekPlan();saveData(d);showPage(\'wochenplan\');showToast(\'' + label + '\')}})" class="ai-action-btn ai-action-do">★ ' + label + '</button>';
  });

  // Standard markdown formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '&bull; ')
    .replace(/(\d+)\. /g, '<strong>$1.</strong> ');
}

// Helper: close coach panel then execute action
function closeAICoachAndDo(fn) {
  _aiCoachOpen = false;
  var panel = document.getElementById('ai-coach-panel');
  if (panel) panel.classList.remove('open');
  setTimeout(fn, 200);
}

async function sendCoachMessage() {
  var input = document.getElementById('ai-coach-input');
  if (!input) return;
  var msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  addCoachMessage('user', msg);

  // Show typing indicator
  var container = document.getElementById('ai-coach-messages');
  var typingId = 'coach-typing-' + Date.now();
  container.innerHTML += '<div id="' + typingId + '" style="display:flex;justify-content:flex-start;margin-bottom:12px;"><div style="padding:10px 14px;border-radius:12px 12px 12px 2px;background:var(--surface-2);color:var(--text-muted);font-size:14px;"><span class="typing-dots">Denkt nach</span></div></div>';
  container.scrollTop = container.scrollHeight;

  var reply = await sendToCoach(msg);

  // Remove typing indicator
  var typingEl = document.getElementById(typingId);
  if (typingEl) typingEl.remove();

  addCoachMessage('coach', reply);
}

// ===== QUICK PROMPTS =====
function coachQuickPrompt(prompt) {
  var input = document.getElementById('ai-coach-input');
  if (input) {
    input.value = prompt;
    sendCoachMessage();
  }
}

// ===== INIT: Inject chat panel into page =====
function initAICoach() {
  if (document.getElementById('ai-coach-panel')) return;
  // Hide coach on auth/onboarding screens
  document.body.classList.add('hide-coach');

  var panel = document.createElement('div');
  panel.id = 'ai-coach-panel';
  panel.innerHTML =
    '<div class="ai-coach-header">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="width:36px;height:36px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;font-size:18px;">🥊</div>' +
        '<div>' +
          '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;color:var(--white);letter-spacing:1px;">BOXSPEC COACH</div>' +
          '<div style="font-family:\'Space Mono\',monospace;font-size:9px;color:var(--text-muted);letter-spacing:1px;">AI-POWERED</div>' +
        '</div>' +
      '</div>' +
      '<button onclick="toggleAICoach()" style="background:none;border:none;color:var(--text-muted);font-size:20px;cursor:pointer;padding:8px;min-height:36px;">✕</button>' +
    '</div>' +
    '<div id="ai-coach-messages" class="ai-coach-messages"></div>' +
    '<div class="ai-coach-quick">' +
      '<button onclick="coachQuickPrompt(\'Was soll ich heute trainieren? Zeig mir auch passende Videos.\')" class="ai-quick-btn">Heute?</button>' +
      '<button onclick="coachQuickPrompt(\'Gameplan gegen einen großen Southpaw-Distanzkämpfer. Zeig mir Videos zu den Techniken.\')" class="ai-quick-btn">Gameplan</button>' +
      '<button onclick="coachQuickPrompt(\'Analysiere meinen Plan — was fehlt? Ändere es wenn nötig.\')" class="ai-quick-btn">Plan Check</button>' +
      '<button onclick="coachQuickPrompt(\'Zeig mir Videos um meinen Jab zu verbessern — verschiedene Varianten.\')" class="ai-quick-btn">Jab lernen</button>' +
      '<button onclick="coachQuickPrompt(\'Ich will mein Ring IQ verbessern. Was muss ich tun und was anschauen?\')" class="ai-quick-btn">Ring IQ</button>' +
    '</div>' +
    '<div class="ai-coach-input-row">' +
      '<input type="text" id="ai-coach-input" placeholder="Frag deinen Coach..." onkeydown="if(event.key===\'Enter\')sendCoachMessage()">' +
      '<button onclick="sendCoachMessage()" class="ai-send-btn">→</button>' +
    '</div>';

  document.body.appendChild(panel);

  // Add floating toggle button
  var fab = document.createElement('button');
  fab.id = 'ai-coach-fab';
  fab.innerHTML = '🥊';
  fab.title = 'AI Coach';
  fab.onclick = toggleAICoach;
  document.body.appendChild(fab);
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAICoach);
} else {
  initAICoach();
}
