/* Die 8 Saeulen als Daten. Siehe js/content.js fuer die Bausteine.

   Erzeugt aus saeulenData in js/pages.js. Der Inhalt lag dort als acht
   geschlossene HTML-Waende in einem Feld: 52 KB roh, davon 73 % Text.

   Zerlegt wurde am Ueberschriftenmuster, das ausnahmslos gilt: 55 mal
   dieselbe Auszeichnung, keine Abweichung. Deshalb mechanisch und nicht
   nach Augenmass.

   Die 39 tt() sind ein Glossar geworden statt 39 einzeln aufgeloester
   Tooltips. Der Begriff steht im Satz, die Erklaerung einmal unter
   begriffe. Auf dem Telefon wird daraus eine erreichbare Liste; ein
   Tooltip laesst sich dort nicht aufrufen.

   Die ids sind fest und namentlich. Der alte Weg adressierte die Saeulen
   ueber ihren Index im Feld, das ueberlebt kein Umsortieren. */

Content.define('saeulen', {
  title: 'Die 8 Säulen',
  sub: 'Ein Boxer ist nur so stark wie seine schwächste Säule. Worauf das ganze System aufbaut, und warum jede einzelne zählt.',
  related: ['ernaehrung', 'regeneration', 'mental', 'periodisierung'],
  begriffe: {
    'a-vO₂ Differenz': 'Wie effektiv deine Muskeln Sauerstoff aus dem Blut extrahieren und zur Energieproduktion nutzen.',
    'Anteriore cinguläre Cortex': 'Gehirnregion, die Anstrengung bewertet. Wird durch BET effizienter – wie ein Prozessor-Upgrade für dein Gehirn.',
    Azidose: 'Übersäuerung – wenn Wasserstoffionen sich ansammeln und die Kraftproduktion beeinträchtigen. "Das Brennen" in den Armen.',
    BET: 'Brain Endurance Training – kognitives Training unter Ermüdung. Dein Gehirn lernt, bei mentaler Erschöpfung trotzdem präzise zu arbeiten.',
    Bioverfügbarkeit: 'Wie effizient der Körper das Protein aufnehmen und nutzen kann. Tierische Quellen >75 auf dem Index sind optimal.',
    'Box-Breathing': '4 Sek. einatmen – 4 Sek. halten – 4 Sek. ausatmen – 4 Sek. halten. Aktiviert den Vagusnerv, senkt Herzfrequenz und Cortisol.',
    Brustwirbelsäule: 'Der mittlere Rückenabschnitt der die Schulterblätter und hintere Schulterbewegung reguliert. In gerundeter Haltung werden die umgebenden Muskeln dauerhaft gedehnt → Schwäche und potenzielle Schulterinstabilität.',
    Chunking: 'Das Gehirn gruppiert einzelne Informationen zu größeren „Chunks". Ein Anfänger sieht 5 einzelne Schläge. Ein Experte sieht ein Muster: „Er doubled den Jab, dann kommt der linke Haken." Weniger kognitive Last = schnellere Reaktion.',
    CMJ: 'Counter Movement Jump – Sprung aus dem Stand mit Ausholbewegung. Misst explosive Beinkraft.',
    Distanzzonen: 'Außendistanz (nur Jab trifft), Mitteldistanz (gerade Schläge + Haken), Innendistanz (Uppercuts, Clinch). Jede Zone hat andere Regeln.',
    'Effective Mass': 'Die "Schärfe" eines Schlags. Erfordert simultane Ganzkörper-Spannung beim Aufprall – besonders Core, Arm und Schulter.',
    'Einfache KH': 'Niedriger Ballaststoffgehalt, schnelle Absorption. Beispiele: Weißbrot, Bananen, Marmelade. Ideal für schnelle Energie nach dem Training.',
    Energietank: 'Je größer dein aerobes System, desto mehr Energie kannst du produzieren. Ein Boxer mit VO₂max von 4.5 L/min kann 20 Kcal/min produzieren vs. 16 Kcal/min bei 3.5 L/min.',
    'Force-Velocity Curve': 'Inverse Beziehung: Je schwerer die Last (Kraft), desto langsamer die Bewegung (Geschwindigkeit). Boxer müssen alle Bereiche der Kurve trainieren.',
    'Funktionelle Äquivalenz': 'fMRI-Studien zeigen: Vorgestellte und tatsächliche Bewegungen aktivieren die gleichen Gehirnareale. Die Intensität ist ~30% der echten Aktivierung.',
    'Gaze Anchor': 'Blickanker – ein fester Punkt, auf den erfahrene Kämpfer schauen, um peripher alle Gliedmaßen gleichzeitig wahrzunehmen.',
    Glukoneogenese: 'Synthese von Glukose aus Nicht-Kohlenhydrat-Quellen wie Aminosäuren und Fetten. Passiert verstärkt bei KH-Restriktion.',
    Herzleistung: 'Wie viel sauerstoffreiches Blut dein Herz zu den Muskeln pumpen kann.',
    HRV: 'Herzratenvariabilität – die Schwankung der Abstände zwischen Herzschlägen. Variation zeigt, dass dein autonomes Nervensystem flexibel ist.',
    'Hüftbeuger-Verkürzung': 'Häufig bei Boxern durch langes Sitzen UND Tausende Stunden in der Kampfstellung. Verursacht Rückenschmerzen, limitiert Gluteus-Kraft und einschränkt Hüftrotation.',
    Hüftrotationsgeschwindigkeit: 'Die Blockbewegung wandelt linearen Impuls (gerade Kraft aus den Beinen) in Drehimpuls um, der dann durch die kinetische Kette übertragen wird.',
    'Kampf-Intensität': 'Die Intensität, bei der du kämpfen kannst ohne zu ermüden. Wird durch die aerobe Kapazität bestimmt.',
    MPS: 'Muskelproteinsynthese – bleibt bis zu 48h nach dem Training erhöht. Alle 3-4h Protein essen maximiert diesen Prozess.',
    PAP: 'Post-Activation Potentiation – ein Phänomen das nach nahe-maximaler Anstrengung die Muskelkraft kurzfristig erhöht. Durch Springen und explosive Übungen im Warm-Up den Körper "scharfschalten".',
    'Peripheren Sehen': 'Sehen außerhalb des Fokuspunkts. Weniger scharf, aber ~50ms schneller bei Bewegungserkennung als zentrales Sehen.',
    'PETTLEP-Modell': 'Physical, Environment, Task, Timing, Learning, Emotion, Perspective – die 7 Faktoren effektiver Visualisierung. Holmes & Collins (2001) zeigten +12–16% motorische Leistung.',
    Plyometrie: 'Sprung- und Schnelligkeitsübungen. Echter plyometrischer Effekt nur bei Bodenkontaktzeiten unter 0.25 Sekunden.',
    'Quadratus Lumborum': 'Kleiner Muskel im unteren Rücken. Wird überaktiv wenn Obliques und BWS-Rotation schwach sind. Ursache vieler Rückenschmerzen bei Boxern. Foam Rolling hilft nur kurzfristig – die Ursache muss behoben werden.',
    'Quiet Eye': 'Die letzte stabile Fixierung vor einer Entscheidung. Bei Elite-Boxern ~400ms, bei Anfängern ~200ms. Längere Quiet-Eye-Dauer = bessere Entscheidungen.',
    'RAMP-Methode': 'Raise – Activate & Mobilise – Potentiate. Wissenschaftlich fundiertes Warm-Up-Framework das kurzfristige Kraftverbesserungen durch Post-Activation Potentiation (PAP) erzeugt.',
    'Relative Rumpfmasse': 'Das Verhältnis von Rumpfmuskulatur zum Gesamtgewicht – ein starker Prädiktor für Schlagkraft.',
    'REM-Schlaf': 'Rapid Eye Movement – die Traumphase. Hier werden motorische Skills konsolidiert. Ein Boxer, der eine neue Kombination trainiert hat, verankert sie im REM-Schlaf. Dominiert in der zweiten Nachthälfte.',
    'Rote Zone': 'Über 90% der maximalen Herzfrequenz. Hier wird die Atmung schwer, das Denken langsamer, die Beinarbeit träger. Aber genau hier passieren die Anpassungen.',
    'Stroop-Test': 'Farbwörter erscheinen in falscher Farbe. Du musst die FARBE benennen, nicht das Wort. Trainiert Impulshemmung und kognitive Belastbarkeit.',
    'Stärkehaltige KH': 'Höherer Ballaststoffgehalt, langsame Verdauung, stabiler Blutzucker. Beispiele: Haferflocken, Vollkornreis, Vollkornbrot.',
    Tells: 'Unbewusste Bewegungen, die einen Schlag ankündigen. Beispiele: Schulter hebt sich vor dem Cross, Gewicht verlagert sich vor dem Haken.',
    'Tiefschlaf (N3)': 'Stadium 3 des Non-REM-Schlafs. Hier wird 95% des täglichen Wachstumshormons ausgeschüttet. Dominiert in der ersten Nachthälfte. Wird durch Alkohol massiv gestört.',
    'Train the Movement and the Muscles Will Follow': 'Wir fokussieren auf Bewegungsmuster statt einzelne Muskeln zu isolieren. Wenn die Bewegung stimmt, folgen die muskulären Anpassungen automatisch.',
    Vagusnerv: 'Der längste Hirnnerv. Stimulation durch langsames Ausatmen senkt die Herzfrequenz und aktiviert den Parasympathikus.'
  },
  sections: [
    {
      id: 'kraft',
      title: 'Kraft, Power und Schnelligkeit',
      sub: 'Maximalkraft, Explosivität, Handgeschwindigkeit, Agilität. Die kinetische Kette vom Boden bis zur Faust – inklusive BFR als Trainingsmethode.',
      tags: [
        { text: '2×/Woche', cls: 'tag-red' },
        { text: '50 Min.', cls: 'tag-blue' },
        { text: '3 Phasen + Taper', cls: 'tag-gold' }
      ],
      blocks: [
        {
          t: 'card',
          id: 'die-physik-hinter-dem-schlag',
          title: 'DIE PHYSIK HINTER DEM SCHLAG',
          blocks: [
            {
              t: 'p',
              text: 'Ein Schlag wird in einem Wimpernschlag geliefert – oft unter <strong>200 Millisekunden</strong>. Das erfordert, in kürzester Zeit enorm viel Kraft zu erzeugen. Unabhängig vom Schlagtyp wird die Kraft im Unterkörper generiert und über Hüfte, Rumpf und Schlagarm zur Faust und ins Ziel übertragen. Die Muskeln werden sequentiell von unten nach oben aktiviert und arbeiten zusammen, um zuerst Geschwindigkeit und dann Steifheit beim Aufprall zu erzeugen.'
            },
            {
              t: 'p',
              text: 'Bei geraden Schlägen (Jab und Cross) treiben sich Boxer nach vorne zum Ziel. Bei Haken werden Kräfte auch seitlich erzeugt. Boxer erzeugen dabei eine "Blockbewegung" mit dem Bein gegenüber dem Schlagarm – das erhöht die Hüftrotationsgeschwindigkeit und wandelt linearen Impuls in Drehimpuls um.'
            },
            {
              t: 'p',
              text: '<strong>Faust-Geschwindigkeiten:</strong> Cross ca. <strong>8.5 m/s (30 km/h)</strong>, Haken bis <strong>12 m/s (43 km/h)</strong>. Bei Kombinationen werden Schläge noch schneller – Jab und Cross in nur <strong>0.2 Sekunden</strong>, Haken in 0.4 Sekunden.'
            }
          ]
        },
        {
          t: 'card',
          id: 'hoeher-springen-haerter-schlagen',
          title: 'HÖHER SPRINGEN = HÄRTER SCHLAGEN',
          blocks: [
            {
              t: 'p',
              text: 'Aus Tests mit über <strong>500 Boxern</strong> haben wir starke Zusammenhänge zwischen Sprunghöhe und Schlagkraft identifiziert. Die CMJ-Sprunghöhe korreliert mit <strong>r=0.50–0.69</strong> mit der Medizinball-Schlagwurf-Weite (Wilson et al. 2020). Jeder Zentimeter mehr Sprunghöhe erhöht die Spitzengeschwindigkeit des Landmine Punch um <strong>0.036 m/s</strong> (Omcirk et al. 2021).'
            },
            {
              t: 'p',
              text: 'Boxer haben typischerweise <strong>niedrigere Sprungwerte</strong> als Athleten anderer Sportarten und zeigen nur geringe Unterschiede zwischen CMJ und Squat Jump – das bedeutet eine <strong>ineffektive Nutzung des Dehnungs-Verkürzungs-Zyklus</strong>. Genau hier setzt das BoxSpec-Krafttraining an.'
            }
          ]
        },
        {
          t: 'card',
          id: 'der-kern-des-schlags-rumpfmuskulatur',
          title: 'DER KERN DES SCHLAGS – RUMPFMUSKULATUR',
          blocks: [
            {
              t: 'p',
              text: 'Unsere Forschung zeigt: Relative Rumpfmasse ist ein starker Prädiktor für den Medizinball-Schlagwurf. Der Core ist das entscheidende Glied bei der Kraftübertragung vom Unterkörper zur Faust. Ineffektive Rumpfrotation erzeugt "Energielecks" die Schlagkraft und -geschwindigkeit reduzieren.'
            },
            {
              t: 'p',
              text: 'Core-Kraft spielt auch eine zentrale Rolle beim Effective Mass – der "Snap" des Schlags. Je steifer der Rumpf beim Aufprall, desto mehr Kraft wird ins Ziel übertragen. Deshalb trainiert BoxSpec den Core in 4 Kategorien: Anti-Rotation (Pallof Press), Anti-Extension (Plank Holds, Deadbugs), Anti-Lateralflexion (Farmer Walks) und Hüftflexion mit neutraler Wirbelsäule (Supine ISO Holds, Leg Lowers).'
            }
          ]
        },
        {
          t: 'card',
          id: 'die-kraft-geschwindigkeits-kurve',
          title: 'DIE KRAFT-GESCHWINDIGKEITS-KURVE',
          blocks: [
            {
              t: 'p',
              text: 'Die Force-Velocity Curve zeigt: Je schwerer du hebst, desto langsamer bewegst du dich – und umgekehrt. Die meisten Boxer sind gut bei leichten, schnellen Bewegungen, kämpfen aber mit schweren Lasten. Deshalb muss Krafttraining bei der <strong>Maximalkraft beginnen</strong> und sich über 2-3 Zyklen à 10 Wochen aufbauen – bevor explosive Methoden ihr volles Potenzial entfalten.'
            },
            {
              t: 'p',
              text: '<strong>Aber zuerst die Grundlagen:</strong> Boxer haben typischerweise Mobilitätsprobleme die schweres Heben ineffektiv oder gefährlich machen. Deshalb beginnt das BoxSpec-Programm mit <strong>Grundlagen-Übungen</strong> (KB Sumo Deadlift, Goblet Squat, Press-Ups) bevor in späteren Phasen die schweren Übungen (Trap Bar Deadlift, DB Floor Press) kommen.'
            }
          ]
        },
        {
          t: 'card',
          id: 'sechs-bewegungsmuster',
          title: 'SECHS BEWEGUNGSMUSTER',
          blocks: [
            { t: 'p', text: 'Jede BoxSpec-Session basiert auf 6 fundamentalen Bewegungsmustern:' },
            {
              t: 'list',
              items: [
                '<strong>Squat</strong> – Quads, Hamstrings, Glutes laden für Unterkörper-Explosivität',
                '<strong>Deadlift/Hinge</strong> – Hüftextension für konzentrische Kraftentwicklung',
                '<strong>Single-Leg</strong> – Unilaterale Arbeit gegen Seitenimbalancen (Boxer stehen nie symmetrisch)',
                '<strong>Horizontal Press</strong> – Brustmuskulatur für Handgeschwindigkeit und "Steifheit" beim Aufprall',
                '<strong>Vertical Press</strong> – Funktionelle Schulterkraft gegen Imbalancen durch die Guard-Position',
                '<strong>Pull (vertikal + horizontal)</strong> – Lat-Entwicklung für schnelles Zurückziehen der Hände und Clinch-Kontrolle'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'plyometrie-explosivkraft-entwickeln',
          title: 'PLYOMETRIE – EXPLOSIVKRAFT ENTWICKELN',
          blocks: [
            { t: 'p', text: 'BoxSpec nutzt zwei Arten von Plyometrie:' },
            { t: 'h', text: 'Langer Dehnungs-Verkürzungs-Zyklus (RFD)' },
            {
              t: 'p',
              text: 'Zielt auf vertikalen Impuls durch Sprungbewegungen. Entwicklung in 3 Phasen:'
            },
            {
              t: 'list',
              items: [
                '<strong>Phase 1 – Landen/Springen:</strong> Altitude Landings, Box Jumps – Landungsmechanik und Kraftabsorption lernen',
                '<strong>Phase 2 – Springen:</strong> Countermovement Jumps, Altitude Landing to Jump – Kraft übertragen',
                '<strong>Phase 3 – Beladen:</strong> DB CMJ, MB Box Jumps – maximale Kraftentwicklung unter Last'
              ]
            },
            { t: 'h', text: 'Kurzer Dehnungs-Verkürzungs-Zyklus (Reaktivkraft)' },
            {
              t: 'p',
              text: 'Verbessert die Fuß-Reaktivität für schnelle Beinarbeit. Entwicklung: Low & Fast Pogos → Band Assisted Pogos → Max Effort Pogos. Die Achillessehne wird zum Federmechanismus trainiert – weniger Muskelarbeit = weniger Energiekosten bei der Beinarbeit.'
            },
            {
              t: 'p',
              text: '<strong>Laterale Kraft:</strong> Ice Skaters → MB Ice Skaters → Repeated MB Ice Skaters für seitliche Explosivkraft beim Winkelschneiden und Ausweichen.'
            }
          ]
        },
        {
          t: 'card',
          id: 'schlagspezifische-uebungen',
          title: 'SCHLAGSPEZIFISCHE ÜBUNGEN',
          blocks: [
            {
              t: 'p',
              text: 'Traditionelles Krafttraining entwickelt die RFD – aber Boxer müssen diese Kraft auch in schlagspezifische Aktionen übertragen:'
            },
            {
              t: 'list',
              items: [
                '<strong>Medizinball-Schlagwurf:</strong> Schnelle Rotation und Hüftextension, Start in Kampfstellung',
                '<strong>Landmine Punch / Punch Throw:</strong> Verschiedene Lasten für verschiedene Phasen (Kraft → Kraft-Schnelligkeit → Geschwindigkeit)',
                '<strong>Landmine Punch mit Band:</strong> Akkommodierender Widerstand verbessert den "Snap" am Ende des Schlags',
                '<strong>Isometric Punch Hold:</strong> Erhöht Core-, Schulter- und Gluteus-Aktivierung beim Aufprall'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'das-boxspec-programm-2-woche-10-wochen',
          title: 'DAS BOXSPEC PROGRAMM (2×/Woche, 10 Wochen)',
          blocks: [
            {
              t: 'p',
              text: '<strong>Wochen 1-3 — Grundlagen:</strong> KB Sumo Deadlift, Goblet Squat, Strict Press-Ups, DB Shoulder Press, Goblet Split Squat + Core Circuit (Pallof Press, Plank Hold, Leg Lowers, Supine ISO Hold)'
            },
            {
              t: 'p',
              text: '<strong>Wochen 4-7 — Kraft-Schnelligkeit:</strong> Trap Bar Deadlift, Landmine Squat, DB Floor Press, Landmine Shoulder Press + Extended Plyometric Warm-Up (Altitude Landing to Jump, MB Ice Skaters, Landmine Punch mit Band, CMJ, Band Assisted Pogos)'
            },
            {
              t: 'p',
              text: '<strong>Wochen 8-9 — Spitzenleistung:</strong> Banded KB Swing, Landmine Punch Throw, MB Box Jumps, DB CMJ, Max Effort Pogos'
            },
            {
              t: 'p',
              text: '<strong>Woche 10 — Taper:</strong> Volumen -50%, Intensität beibehalten. Fitness erhalten, Ermüdung abbauen.'
            }
          ]
        }
      ]
    },
    {
      id: 'metabolisch',
      title: 'Metabolische Kapazität',
      sub: 'VO₂max, Laktatschwelle, PCr-Resynthese, Atemmuskulatur. Dein aerober Motor entscheidet, ob du in Runde 3 noch da bist.',
      tags: [
        { text: '3×/Woche', cls: 'tag-blue' },
        { text: '3 Phasen · 10 Wochen', cls: 'tag-green' }
      ],
      blocks: [
        {
          t: 'card',
          id: 'die-physischen-anforderungen-des-boxens',
          title: 'DIE PHYSISCHEN ANFORDERUNGEN DES BOXENS',
          blocks: [
            {
              t: 'p',
              text: 'Ein Profikampf kann bis zu <strong>47 Minuten</strong> dauern, mit 36 Minuten aktiver Zeit. Der Rekord für die meisten Schläge liegt bei <strong>1848 in 10 Runden</strong> – ein Schlag pro Sekunde über 30 Minuten. Auch auf niedrigerem Niveau sind 150 Schläge pro Runde keine Seltenheit. Blutlaktatwerte erreichen bis zu <strong>16 mmol/L</strong> im Amateurboxen.'
            },
            {
              t: 'p',
              text: 'Doch es ist nicht nur das Schlagvolumen – <strong>77% der Kämpfe</strong> in MMA werden durch 8-12 Sekunden vorherige Hochintensitäts-Aktivität gewonnen. Die Fähigkeit, wiederholte hochintensive Aktionen auszuführen, ist oft der entscheidende Faktor.'
            }
          ]
        },
        {
          t: 'card',
          id: 'dein-energietank',
          title: 'DEIN ENERGIETANK',
          blocks: [
            {
              t: 'p',
              text: 'Stell dir deine aerobe Kapazität als Energietank vor. Kämpfer A hat einen größeren Tank als Kämpfer B. Das Ziel des Conditioning ist, diesen Tank so groß wie möglich zu machen. Damit kannst du deine Kampf-Intensität höher setzen als die deines Gegners – und ihn zwingen, in deinem Tempo zu kämpfen.'
            },
            { t: 'h', text: 'Die Wissenschaft dahinter (Fick-Gleichung)' },
            { t: 'p', text: 'VO₂ = Herzleistung × a-vO₂ Differenz' },
            {
              t: 'p',
              text: 'Um die aerobe Kapazität zu verbessern: (1) Herzpumpleistung steigern, (2) Gefäßnetzwerk verbessern, (3) oxidative Enzyme in der Muskelzelle optimieren. Genau das erreichen wir mit <strong>hochintensivem Conditioning</strong>.'
            },
            {
              t: 'p',
              text: '<strong>Energiesystem-Verteilung:</strong> Boxer arbeiten bei <strong>85-90% ihrer maximalen aeroben Kapazität</strong>. <strong>77% der Energie</strong> kommt aus aeroben Wegen, 19% aus sofortigen Energiesystemen, 4% aus intermediären. Der aerobe Motor ist das Fundament.'
            }
          ]
        },
        {
          t: 'card',
          id: 'die-rote-zone',
          title: 'DIE ROTE ZONE',
          blocks: [
            {
              t: 'p',
              text: 'Boxen zwingt Athleten in die Rote Zone (>90% HFmax). Die meiste Zeit im Sparring und Wettkampf wird in dieser Zone verbracht. BoxSpec macht dich zum <strong>Red Zone Dominant</strong> – du sollst in der roten Zone mit Klarheit, schneller Beinarbeit und kraftvollen Schlägen arbeiten können.'
            },
            {
              t: 'p',
              text: '<strong>Vermeide das Niemandsland:</strong> Laufen bei RPE 4-7 (mittlere Intensität, 30-40 Min.) ist suboptimal. Forschung zeigt: Der beste Weg zur Fitness ist entweder <strong>viel bei niedriger Intensität</strong> oder <strong>wenig bei hoher Intensität</strong>. Niemandsland-Training belastet Muskeln und Gelenke ohne optimale Anpassungen zu liefern.'
            }
          ]
        },
        {
          t: 'card',
          id: 'die-drei-conditioning-saeulen',
          title: 'DIE DREI CONDITIONING-SÄULEN',
          blocks: [
            { t: 'h', text: 'SÄULE 1 — ZENTRALE ADAPTATIONEN (HIIT, Wo. 4-7)' },
            {
              t: 'p',
              text: 'Aerobe Kapazität setzt die Obergrenze der Boxleistung. Das Ziel: möglichst viel Zeit in der roten Zone verbringen bei <strong>4-Minuten-Intervallen × 4-6 Sets</strong>. Der Goldstandard basiert auf Helgerud et al. (2002): 4×4 Min. bei >90% HFmax mit 2 Min. Erholung → VO₂max-Steigerung in nur 6 Wochen. <strong>Aber:</strong> strukturelle Herzanpassungen brauchen 6-10 Wochen – länger als Sprint-Training.'
            },
            {
              t: 'p',
              text: '<strong>Optimale Red-Zone-Zeit:</strong> 6-12 Minuten bei ≥90% HFmax pro Session führen zu kardiovaskulären Anpassungen die die Sauerstoffversorgung verbessern. Ziel: Innerhalb von 60-90 Sek. in die rote Zone kommen.'
            },
            { t: 'p', text: 'BoxSpec nutzt drei HIIT-Varianten:' },
            {
              t: 'list',
              items: [
                '<strong>Traditional HIIT:</strong> 4×4 Min. bei >90% HFmax, 2 Min. Erholung',
                '<strong>Pyramid HIIT:</strong> Erst längere Intervalle (1-4 Min.), dann kurze Hochgeschwindigkeits-Sprints (15s on/15s off) → >95% VO₂max',
                '<strong>Fight-Specific HIIT:</strong> 3-Min.-Runden mit 10-20 Sek. Hochintensitäts-Bursts – simuliert die Kampfanforderungen'
              ]
            },
            { t: 'h', text: 'SÄULE 2 — MUSCLE BUFFERING (Wo. 1-3)' },
            {
              t: 'p',
              text: 'Kurzintervall-Training bei hoher Geschwindigkeit entwickelt die Fähigkeit der Muskeln, Azidose zu puffern. <strong>1-2 Min. Intervalle</strong> bei 15-18 km/h, 3% Steigung, RPE 7-8, Ziel-Laktat 10-12 mmol/L. Work:Rest Ratio 1:2.'
            },
            { t: 'h', text: 'SÄULE 3 — SPEED ENDURANCE (Wo. 8-10)' },
            {
              t: 'p',
              text: 'Kampfspezifische Kurzintervalle: <strong>6× 15-20 Sek.</strong> bei maximaler Geschwindigkeit pro 3-Min.-Set, 3-4 Sets. 10-5 Sek. Pause zwischen Reps, 1 Min. zwischen Sets. Transfer der physiologischen Anpassungen auf kampfspezifische Aktivität.'
            }
          ]
        },
        {
          t: 'card',
          id: 'das-boxspec-conditioning-programm-3-woch',
          title: 'DAS BOXSPEC CONDITIONING-PROGRAMM (3×/Woche, 10 Wochen)',
          blocks: [
            {
              t: 'p',
              text: '<strong>Wochen 1-3:</strong> Muscle Buffering → Laktat-Toleranz aufbauen'
            },
            {
              t: 'p',
              text: '<strong>Wochen 4-7:</strong> HIIT → Zentrale kardiovaskuläre Adaptationen'
            },
            {
              t: 'p',
              text: '<strong>Wochen 8-10:</strong> Speed Endurance → Kampfspezifischer Transfer + Taper'
            },
            {
              t: 'p',
              text: '<strong>Trainingsload-Management:</strong> 3:1 Loading-Pattern – 3 Wochen aufbauen, 1 Woche Deload. Trainingslast nie mehr als 10% pro Woche steigern. Spikes vermeiden → Verletzungs- und Krankheitsrisiko.'
            }
          ]
        },
        {
          t: 'card',
          id: 'herzfrequenz-monitoring',
          title: 'HERZFREQUENZ-MONITORING',
          blocks: [
            {
              t: 'p',
              text: 'Nutze einen Bluetooth-Herzfrequenzgurt (Polar H10, Wahoo TickR) und berechne deine rote Zone:'
            },
            {
              t: 'list',
              items: [
                'Max HF = 220 - Alter (oder über einen Rampen-Test ermitteln)',
                'Rote Zone = 90% × Max HF',
                'Ziel pro HIIT-Session: 6-12 Min. in der roten Zone'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'kognition',
      title: 'Kognition und Wahrnehmung',
      sub: 'Antizipation, Blickverhalten, Entscheidungsfindung unter Ermüdung. Wer den Schlag vorhersieht, muss nicht reagieren.',
      tags: [
        { text: 'Täglich · 15–25 Min.', cls: 'tag-gold' },
        { text: 'BET + Blicktraining', cls: 'tag-blue' }
      ],
      blocks: [
        {
          t: 'card',
          id: 'warum-das-fuer-boxer-entscheidend-ist',
          title: 'WARUM DAS FÜR BOXER ENTSCHEIDEND IST',
          blocks: [
            {
              t: 'p',
              text: 'Runde 3. Du bist müde. Plötzlich triffst du Schläge nicht mehr, die du in Runde 1 problemlos gelandet hast. Gleichzeitig siehst du Treffer nicht kommen, die du vorher spielend ausgewichen bist. Das Problem sitzt nicht in den Muskeln – es sitzt im Kopf und in den Augen. Kognitive und perzeptuelle Leistung sind eigenständige, trainierbare Qualitäten, die über Sieg und Niederlage entscheiden.'
            }
          ]
        },
        {
          t: 'card',
          id: 'visuelle-wahrnehmung-antizipation',
          title: 'VISUELLE WAHRNEHMUNG & ANTIZIPATION',
          blocks: [
            {
              t: 'p',
              text: 'Ein Jab braucht <strong>nur 40–100ms</strong> vom Start bis zum Treffer. Deine Reaktionszeit beträgt ~200ms. Du bist also IMMER zu langsam, wenn du erst reagierst, nachdem der Schlag startet. Die Lösung: Antizipation.'
            },
            {
              t: 'p',
              text: '<strong>Wo Experten hinschauen:</strong> Eye-Tracking-Studien (Ripoll et al. 1995) zeigen: <strong>Anfänger fixieren auf die Fäuste</strong>. <strong>Experten fixieren auf Brust und Kinn</strong> – den Gaze Anchor. Von dort nehmen sie mit dem Peripheren Sehen ALLE Gliedmaßen gleichzeitig wahr. Mori et al. (2020) zeigten: Experten erreichen <strong>83.3% Antizipationsgenauigkeit</strong> vs. 68.5% bei Novizen. Die Quiet Eye – die letzte stabile Fixierung vor der Reaktion – ist bei Experten doppelt so lang.'
            }
          ]
        },
        {
          t: 'card',
          id: 'constraint-based-sparring-der-primaere-t',
          title: 'CONSTRAINT-BASED SPARRING – DER PRIMÄRE TRAININGSWEG',
          blocks: [
            {
              t: 'p',
              text: 'Das kubanische Boxsystem und moderne Sportforschung zeigen: Die effektivste Methode zur Verbesserung der Wahrnehmung ist <strong>Sparring unter gezielten Einschränkungen</strong>. Statt isolierter kognitiver Übungen werden Wahrnehmung und Entscheidung dort trainiert, wo sie gebraucht werden – im Ring. Beispiele:'
            },
            {
              t: 'list',
              items: [
                '<strong>Nur-Konter-Sparring:</strong> Du darfst nur auf gegnerische Aktionen reagieren → trainiert Antizipation und Timing',
                '<strong>Zahlen-Sparring:</strong> Trainer ruft Nummern → du reagierst mit vorgegebener Kombi → Entscheidungsfindung unter Druck',
                '<strong>Tempo-Variation:</strong> Runde 1 bei 50%, Runde 2 bei 80%, Runde 3 bei 100% → kognitive Kontrolle über Intensität',
                '<strong>Eingeschränktes Sichtfeld:</strong> Sparring nur mit peripherem Sehen (Blick auf Brust fixiert)'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'kognitive-ermuedungsresistenz-bet',
          title: 'KOGNITIVE ERMÜDUNGSRESISTENZ (BET)',
          blocks: [
            { t: 'p', text: 'EXPERIMENTELL' },
            {
              t: 'p',
              text: 'BET ist ein vielversprechender Zusatz, aber kein Ersatz für boxspezifisches Training. Marcora et al. (2015) zeigten in einer <em>Militärstudie (nicht an Boxern!)</em>: +126% Ausdauer mit BET vs. +42% nur physisch. <strong>Achtung: Diese Studie war an Soldaten</strong> – der Transfer auf den Boxring ist plausibel und wird von GB Boxing genutzt, aber boxspezifische Evidenz fehlt noch. Van Cutsem et al. (2017) bestätigten allgemein: Mentale Ermüdung reduziert physische Leistung um <strong>5–10%</strong>.'
            },
            {
              t: 'p',
              text: 'BET konfrontiert dein Gehirn mit kognitiven Aufgaben (Stroop-Test, Rechenaufgaben) WÄHREND oder vor dem Training. Der Anteriore cinguläre Cortex wird effizienter, dein mentales Erschöpfungslimit verschiebt sich nach oben.'
            }
          ]
        },
        {
          t: 'card',
          id: 'empfohlenes-programm',
          title: 'EMPFOHLENES PROGRAMM',
          blocks: [
            { t: 'h', text: 'Im Ring (Priorität 1)' },
            {
              t: 'list',
              items: [
                'Constraint-Based Sparring: 2–3×/Woche mit wechselnden Aufgaben (s.o.)',
                'Gaze-Anker-Technik: In jedem Sparring auf Brust/Kinn fixieren, NICHT den Fäusten folgen',
                'Kampffilm-Analyse: 15–20 Min./Woche – Gegner-Videos → bewusst Tells suchen'
              ]
            },
            { t: 'h', text: 'Zusatztools (Priorität 2)' },
            {
              t: 'list',
              items: [
                'Reaktionsdrills mit Partner: Zahlen rufen → Boxer antwortet mit Kombi. Oder Farb-Karten zeigen → Boxer reagiert. Direkt im Vereinstraining einsetzbar',
                'BET-Protokoll: Stroop-Test-App, 15–25 Min./Tag, progressiv zwischen Trainingseinheiten integrieren',
                'Reaktionsdrills: Partner zeigt Zahlen/Farben → du reagierst mit spezifischen Kombis'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'ernaehrung-gewicht',
      title: 'Ernährung und Gewichtsmanagement',
      sub: 'Makros, Timing, Hydration, Gewicht machen, Supplements, Refuelling. Ernährung ist mehr als nur Gewicht machen – es ist der Treibstoff für Leistung.',
      tags: [
        { text: 'Individuell', cls: 'tag-green' },
        { text: 'Makros + Supplements + Fight Week', cls: 'tag-gold' }
      ],
      blocks: [
        {
          t: 'card',
          id: 'mehr-als-nur-gewicht-machen',
          title: 'MEHR ALS NUR GEWICHT MACHEN',
          blocks: [
            {
              t: 'p',
              text: 'Boxen ist ein Gewichtsklassen-Sport, deshalb spielt Ernährung eine massive Rolle beim sicheren und effektiven Gewichtmachen. Aber bei BoxSpec planen wir Ernährungsstrategien um <strong>hochintensive Leistung zu befeuern</strong> und sich von hartem Training zu erholen – es geht nicht nur ums Gewicht.'
            },
            {
              t: 'p',
              text: 'Zu verstehen wie man richtig tankt kann schwierig sein, wenn Athleten 2× täglich trainieren. Schlechte Erholung führt zu verminderter Leistung und erhöhtem Verletzungs- und Krankheitsrisiko. Kohlenhydrate zu stark zu reduzieren beeinträchtigt die Hochintensitäts-Leistung massiv und erhöht das Krankheitsrisiko, weil die Energieversorgung des Immunsystems sinkt. Außerdem sabotiert es die Fight-Week-Strategie zum Gewichtmachen.'
            }
          ]
        },
        {
          t: 'card',
          id: 'kohlenhydrate-der-haupttreibstoff',
          title: 'KOHLENHYDRATE — DER HAUPTTREIBSTOFF',
          blocks: [
            {
              t: 'p',
              text: 'Kohlenhydrate sind die <strong>Hauptenergiequelle für hochintensives Training</strong>. Strategisches KH-Timing über den Tag, die Camp-Phase und vor dem Kampf ist essentiell für hohe Intensität.'
            },
            {
              t: 'p',
              text: '<strong>Typen:</strong> Stärkehaltige KH (langsam, füllen länger) vs. Einfache KH (schnell, für sofortige Energie).'
            },
            {
              t: 'list',
              items: [
                'Beim Gewichtmachen: ballaststoffreiche KH wählen (sättigender)',
                'Am Kampfabend: ballaststoffarme, einfache KH wählen (schnelle Energie)'
              ]
            },
            { t: 'h', text: 'Timing' },
            {
              t: 'list',
              items: [
                '<strong>3-4 Stunden vor hartem Training:</strong> 40-80g stärkehaltige KH (Haferflocken, Reis)',
                '<strong>30 Min. bis 2h nach dem Training:</strong> Einfache KH für schnelle Glykogen-Auffüllung',
                '<strong>Ruhetage:</strong> KH reduzieren um Körperfett zu kontrollieren',
                '<strong>Morgentraining:</strong> Abends zuvor KH-reiche Mahlzeit → Speicher bleiben gefüllt'
              ]
            },
            { t: 'h', text: 'Planung nach Camp-Phase' },
            {
              t: 'list',
              items: [
                '4-6 Wochen vor Kampf (hohes Volumen): KH bei <strong>~3g/kg</strong> priorisieren',
                '1-2 Wochen vor Kampf (Taper): KH auf <strong>~2g/kg</strong> reduzieren → letzte Pfunde verlieren'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'protein-baustoff-fuer-erholung',
          title: 'PROTEIN — BAUSTOFF FÜR ERHOLUNG',
          blocks: [
            {
              t: 'p',
              text: 'Protein ist essentiell für die Muskelreparatur. Wenn Boxer Gewicht machen, befinden sie sich oft in negativer Energiebilanz. Wenn KH eingeschränkt werden, baut der Körper Proteine ab (Glukoneogenese). Das bedeutet: <strong>Boxer brauchen mehr Protein als normale Sportler.</strong>'
            },
            { t: 'h', text: 'Empfehlung: 1.6-2.4g/kg pro Tag' },
            {
              t: 'list',
              items: [
                'In schweren Krafttraining-Phasen oder starkem Kaloriendefizit: bis <strong>2.4g/kg</strong>',
                '<strong>20-40g Protein pro Mahlzeit</strong> (0.3-0.5g/kg) — weniger ist suboptimal, mehr bringt kaum Zusatznutzen',
                '<strong>Alle 3-4 Stunden</strong> eine Proteinquelle → maximale MPS',
                'Tierische Quellen (Casein, Whey, Eier, Fleisch) haben höhere Bioverfügbarkeit als pflanzliche'
              ]
            },
            { t: 'h', text: 'Praxis-Tipps' },
            {
              t: 'list',
              items: [
                'Nach dem Training: 500ml Milch oder Whey-Protein-Shake',
                'Frühstück: 3-Eier-Omelette (hochwertig + sättigend)',
                'Vor dem Schlaf: 150-250g Magerquark oder griechischer Joghurt → Recovery im Schlaf'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'fett-nicht-der-feind',
          title: 'FETT — NICHT DER FEIND',
          blocks: [
            {
              t: 'p',
              text: 'Hauptrollen: Energiequelle bei niedriger Intensität, Vitamin-Träger (A, D, E, K), Hormonproduktion. <strong>~1g/kg pro Tag</strong>, nie unter 20% der Gesamtenergie. An Ruhetagen und im Taper Fett leicht erhöhen wenn KH sinken.'
            },
            {
              t: 'p',
              text: 'Ungesättigte Fette (Lachs, Makrele, Nüsse, Olivenöl) → gesundheitsfördernd'
            },
            { t: 'p', text: 'Gesättigte Fette (Butter, Kokosnussöl) → in Maßen ok' },
            { t: 'p', text: 'Trans-Fette (Fast Food, Frittiertes) → vermeiden' }
          ]
        },
        {
          t: 'card',
          id: 'hydration-2-dehydration-leistungseinbruc',
          title: 'HYDRATION — 2% DEHYDRATION = LEISTUNGSEINBRUCH',
          blocks: [
            {
              t: 'p',
              text: 'Bereits <strong>2% Dehydration</strong> (1-2kg Wasserverlust) beeinträchtigt physische UND mentale Leistung: erhöhte Herzfrequenz, reduzierte Kraftproduktion, langsamere Reaktionszeit, schlechtere Entscheidungsfindung. Boxer verlieren <strong>3-5% Körpermasse</strong> durch Schweiß in einer 90-Min-Session.'
            },
            { t: 'h', text: 'Schweißrate monitoren' },
            {
              t: 'p',
              text: 'Gewicht vor Training + Flüssigkeitsaufnahme − Gewicht nach Training = Schweißverlust'
            },
            { t: 'p', text: 'Schweißverlust × 1.5 = Ziel-Trinkmenge nach dem Training' },
            {
              t: 'p',
              text: 'Beispiel: 85kg + 1L = 86kg, nach Training 83kg → 3L Verlust × 1.5 = <strong>4.5L Ziel</strong>'
            },
            {
              t: 'p',
              text: '<strong>Praxis-Tipps:</strong> Morgens 300-500ml Wasser · Prise Salz zu Hauptmahlzeiten · 500ml Elektrolytgetränk 30-60 Min. vor dem Training · Urinfarbe: hellgelb = gut'
            }
          ]
        },
        {
          t: 'card',
          id: 'supplements-food-first',
          title: 'SUPPLEMENTS — FOOD FIRST',
          blocks: [
            {
              t: 'p',
              text: 'BoxSpec verfolgt einen "Food First"-Ansatz — erst die Ernährung optimieren, dann Supplements. Nur evidenzbasierte, batchgetestete Produkte verwenden.'
            },
            { t: 'h', text: 'Gesundheits-Supplements' },
            {
              t: 'list',
              items: [
                '<strong>Vitamin D3</strong> (4000 IU/Tag): Knochengesundheit, Immunfunktion, Muskelregeneration. Besonders im Winter',
                '<strong>Omega 3</strong> (2-3g/Tag, 2000mg EPA + 1000mg DHA): Entzündungshemmend, Muskelproteinsynthese, potenziell hirnschützend nach Kopftreffern',
                '<strong>Probiotika</strong> (täglich): Reduziert Krankheitsrisiko in intensiven Trainingsphasen',
                '<strong>Eisen</strong> (nur bei Mangel, Ferritin <30 ug/L): 14mg/Tag mit Vitamin C',
                '<strong>Calcium</strong> (400mg vor hartem Training): Knochengesundheit bei Energiedefizit'
              ]
            },
            { t: 'h', text: 'Leistungs-Supplements' },
            {
              t: 'list',
              items: [
                '<strong>Kreatin</strong> (5g/Tag, >6 Wochen): Verbessert Kurzzeit-Hochintensitätsleistung, erhöht Muskelmasse, potenziell hirnschützend. <strong>10 Tage vor dem Wiegen absetzen</strong> (speichert Wasser). Nach dem Wiegen: 2×5g mit KH für schnelle Aufladung',
                '<strong>Koffein</strong> (3mg/kg, 45 Min. vor Training): Verbessert Ausdauer, Reaktionszeit, reduziert wahrgenommene Anstrengung. Gum-Form wirkt in 5 Min.',
                '<strong>Beta-Alanin</strong> (6g/Tag in 4×1.5g): Erhöht Pufferkapazität, verbessert Schlagkraft und -frequenz über 3×3 Runden. Mit Essen einnehmen (weniger Kribbeln)',
                '<strong>Whey Protein</strong> (20-40g nach Training): Praktische Proteinquelle, hochverfügbar, sättigend'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'training-befeuern-tagestypen',
          title: 'TRAINING BEFEUERN — TAGESTYPEN',
          blocks: [
            {
              t: 'p',
              text: '<strong>Schwerer Trainingstag (Sparring, HIIT):</strong> KH +50% vs. normal. Vorab 40-80g stärkehaltige KH, danach schnelle KH + Protein'
            },
            {
              t: 'p',
              text: '<strong>Leichter Trainingstag (Technik, Kraft):</strong> KH reduziert. 30g KH vor der Session reicht'
            },
            {
              t: 'p',
              text: '<strong>Ruhetag:</strong> KH-Reduktion um 600-750 kcal vs. Trainingstag. Protein beibehalten (MPS bleibt 48h erhöht)'
            }
          ]
        },
        {
          t: 'card',
          id: 'gewicht-machen-fight-week',
          title: 'GEWICHT MACHEN — FIGHT WEEK',
          blocks: [
            {
              t: 'p',
              text: '<strong>Allgemein:</strong> 250-800 kcal Defizit/Tag → 0.5-1kg/Woche Gewichtsverlust. Nicht zu aggressiv – großes Defizit → Ermüdung, Krankheit, Dietabbruch.'
            },
            { t: 'h', text: 'Fight Week Methoden' },
            {
              t: 'list',
              items: [
                '<strong>Low-Residue-Diät</strong> (6 Tage vor Wiegen): <10g Ballaststoffe/Tag. Weißer Reis, Pasta, Brot, Eier, Hähnchen. Durchschnittlich <strong>~1% Körpermasse</strong> Verlust',
                '<strong>Natrium reduzieren</strong> (3-5 Tage vorher): Kein Salz hinzufügen, keine Soßen → weniger Wassereinlagerung',
                '<strong>KH reduzieren</strong> (letzte 3 Tage): Pro 1g KH weniger = 2.7g weniger Wassergewicht',
                '<strong>Water Loading</strong>: 100ml/kg Körpermasse für 3 Tage, dann 15ml/kg am Tag vor dem Wiegen → erhöhte Urinproduktion',
                '<strong>Kreatin absetzen</strong>: 10 Tage vor dem Wiegen → ~1% Körpermasse'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'refuelling-nach-dem-wiegen',
          title: 'REFUELLING — NACH DEM WIEGEN',
          blocks: [
            { t: 'h', text: 'Amateur (1-3h Refuel-Fenster)' },
            {
              t: 'list',
              items: [
                'Sofort: 1-1.5L verdünntes KH-Elektrolytgetränk (30-60g KH)',
                '30 Min. später: Ballaststoffarme KH (Milchreis, Weißbrot mit Marmelade, Bananenbrot)',
                '3h vor Kampf: Weißer Reis/Pasta (wenn Zeit reicht)',
                '30 Min. vor Kampf: Reife Banane oder Gummibärchen',
                '10 Min. vor Kampf: KH-Elektrolytgetränk + Energy-Gel'
              ]
            },
            { t: 'h', text: 'Profi (24-30h Refuel-Fenster)' },
            {
              t: 'list',
              items: [
                '<strong>Zuerst rehydrieren</strong>, dann essen. KH im dehydrierten Zustand → Übelkeit und Blähungen',
                '1-2g/kg KH sofort nach dem Wiegen, dann <strong>8-10g/kg KH über 24h</strong>',
                'Alle 2.5-4h: 60-80g stärkehaltige KH (Pasta, Reis, Brot, Obst)',
                '<strong>Kein Junk Food</strong> — hoher Fett+KH → Magen-Darm-Probleme, Durchfall, Dehydration, schlechter Schlaf',
                '2-3h vor dem Kampf: Leicht verdauliche Snacks (Milchreis, Banane, Marmelade-Toast, Gummibärchen)',
                'Im Umkleideraum: KH-Gel mit Elektrolyten'
              ]
            },
            {
              t: 'p',
              text: '<strong>Vorbereitung ist alles:</strong> Detaillierten Zeitplan schreiben · Stoppuhr nach dem Wiegen starten · Kühlbox + Eisblöcke mitnehmen · Eigene Mahlzeiten vorbereiten · Extra KH-Snacks einpacken · Gewicht in verschiedenen Phasen kontrollieren'
            }
          ]
        }
      ]
    },
    {
      id: 'regeneration',
      title: 'Regeneration und Belastungssteuerung',
      sub: 'Schlafoptimierung, HRV-Monitoring, Übertraining-Prävention. Du wirst nicht im Training stärker – du wirst im Schlaf stärker.',
      tags: [
        { text: '8–9h Schlaf', cls: 'tag-green' },
        { text: 'HRV täglich messen', cls: 'tag-blue' }
      ],
      blocks: [
        {
          t: 'card',
          id: 'warum-das-fuer-boxer-entscheidend-ist',
          title: 'WARUM DAS FÜR BOXER ENTSCHEIDEND IST',
          blocks: [
            {
              t: 'p',
              text: 'Du wirst nicht im Training stärker – du wirst im Schlaf stärker. Training zerstört Muskelfasern, leert Energiespeicher und ermüdet das Nervensystem. Erst in der Erholung passiert der eigentliche Aufbau. Ein Boxer, der 6 Stunden schläft, verschenkt bis zu 40% seines Trainingserfolgs. Und Boxen hat eine einzigartige Belastung, die kein anderer Sport hat: <strong>kumulative Kopftreffer</strong>.'
            }
          ]
        },
        {
          t: 'card',
          id: 'schlaf-das-fundament-der-erholung',
          title: 'SCHLAF – DAS FUNDAMENT DER ERHOLUNG',
          blocks: [
            { t: 'h', text: 'Schlafphasen und ihre Funktion' },
            {
              t: 'list',
              items: [
                '<strong>Tiefschlaf (N3):</strong> <strong>95% des täglichen Wachstumshormons</strong> werden hier ausgeschüttet. Tiefschlaf dominiert in den ersten 3–4 Stunden – FRÜH einschlafen ist wichtiger als lange schlafen.',
                '<strong>REM-Schlaf:</strong> Motorische Fähigkeiten (Kombinationen, Ausweichbewegungen, Timing) werden im Langzeitgedächtnis verankert. REM dominiert in der zweiten Nachthälfte → wer zu früh aufsteht, verliert Motor-Learning.'
              ]
            },
            {
              t: 'p',
              text: 'Milewski et al. (2014, KASIP-Studie, n=496) zeigten: <strong>Schlaf unter 8 Stunden = 61% höheres Verletzungsrisiko</strong>. Bei Boxern kritisch: Schon 1 Stunde weniger Schlaf erhöht die Reaktionszeit um <strong>30–40ms</strong>. Dazu: 5 Nächte mit nur 6h Schlaf senken Testosteron um 10–15% und erhöhen Cortisol um 20–30%.'
            }
          ]
        },
        {
          t: 'card',
          id: 'sparring-recovery-die-boxspezifische-reg',
          title: 'SPARRING-RECOVERY – DIE BOXSPEZIFISCHE REGEL',
          blocks: [
            {
              t: 'p',
              text: 'Sparring ist die intensivste Trainingsform im Boxen – körperlich UND neural. Kopftreffer erzeugen nicht nur sofortigen Stress, sondern <strong>kumulative subkonzussive Belastung</strong>. Die aktuellen Empfehlungen von GB Boxing und der medizinischen Sportforschung:'
            },
            {
              t: 'list',
              items: [
                '<strong>48-Stunden-Regel:</strong> Mindestens 48h zwischen Sparring-Sessions. Das Gehirn braucht diese Zeit für die neurale Erholung',
                '<strong>Nie Sparring + schweres Conditioning am selben Tag:</strong> Beides belastet das ZNS maximal. Sparring und HIIT/S&C an getrennten Tagen planen',
                '<strong>Sparring-Frequenz begrenzen:</strong> Max. 2–3 Sparring-Sessions pro Woche, auch in der Campphase. Mehr ist kein „Abhärtung" – es ist kumulative Hirnbelastung',
                '<strong>Nach hartem Sparring:</strong> Nächster Tag = nur leichtes Techniktraining oder Ruhe'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'camp-belastungssteuerung',
          title: 'CAMP-BELASTUNGSSTEUERUNG',
          blocks: [
            {
              t: 'p',
              text: 'Ein typischer 8–12-Wochen-Camp vor einem Kampf erfordert strukturiertes Load Management:'
            },
            {
              t: 'list',
              items: [
                '<strong>Wochen 1–4 (Aufbau):</strong> Volumen steigt progressiv. S&C-Fokus + Ausdauerbasis',
                '<strong>Wochen 5–8 (Intensivierung):</strong> Höchste Sparring-Frequenz. Monitoring über HRV besonders wichtig',
                '<strong>Wochen 9–10 (Taper):</strong> Volumen um 40–60% reduzieren, Intensität beibehalten',
                '<strong>Fight Week:</strong> Minimales Training. Nur Technik + Visualisierung. Kein Sparring'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'schlaf-optimierung-protokoll',
          title: 'SCHLAF-OPTIMIERUNG – PROTOKOLL',
          blocks: [
            {
              t: 'list',
              items: [
                '<strong>Ziel:</strong> 8–9 Stunden, spätestens 22:30 im Bett',
                '<strong>Temperatur:</strong> 18–19°C (kühler Raum fördert Tiefschlaf)',
                '<strong>Warme Dusche:</strong> 1–2h vor dem Schlaf → beschleunigte Abkühlung → Melatonin-Signal (−36% Einschlaflatenz)',
                '<strong>Blaulicht:</strong> 60 Min. vor dem Schlaf kein Smartphone/PC, oder Blaulichtfilter-Brille',
                '<strong>4-7-8 Atemtechnik:</strong> 4 Sek. einatmen, 7 Sek. halten, 8 Sek. ausatmen',
                '<strong>Melatonin:</strong> 0.3mg (nicht 5mg!) 30 Min. vor dem Schlaf – niedrige Dosis wirkt besser'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'belastungssteuerung-mit-hrv',
          title: 'BELASTUNGSSTEUERUNG MIT HRV',
          blocks: [
            {
              t: 'p',
              text: 'Boxtraining belastet das Nervensystem extremer als die meisten Sportarten. Sparring erzeugt nicht nur körperlichen, sondern <strong>neuralen Stress</strong>. HRV erkennt Probleme <strong>Tage bevor du sie fühlst</strong>. Plummer & Kamata (2018) zeigten: HRV-gesteuerte Pläne produzieren <strong>gleiche Leistung bei 30% weniger Volumen</strong>.'
            },
            {
              t: 'p',
              text: '<strong>Hohe HRV = Gut erholt.</strong> Parasympathikus aktiv, Körper bereit für Belastung.'
            },
            {
              t: 'p',
              text: '<strong>Niedrige HRV = Stress.</strong> Sympathikus dominiert. Mehr Training jetzt = Abbau statt Aufbau.'
            },
            { t: 'h', text: 'HRV-Protokoll' },
            {
              t: 'list',
              items: [
                'Morgens direkt nach dem Aufwachen, liegend, 5 Min. mit Polar H10 + HRV4Training App',
                '7-Tage-Rolling-Average als Baseline (Flatt & Esco 2016)',
                '+5% = Grün (Vollgas) / ±5% = Gelb (Normal) / −5% = Rot (nur Zone 2 oder Ruhetag)',
                'Bei Rot → kein Sparring, kein HIIT'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'ring-iq',
      title: 'Ring IQ und Taktik',
      sub: 'Mustererkennung, Distanzkontrolle, Gegner-Analyse, Tells lesen. Auf Nationalebene gewinnt nicht der Fittere – sondern der Klügere.',
      tags: [
        { text: 'Täglich · 15–20 Min.', cls: 'tag-gold' },
        { text: 'Jedes Sparring', cls: 'tag-red' }
      ],
      blocks: [
        {
          t: 'card',
          id: 'warum-das-fuer-boxer-entscheidend-ist',
          title: 'WARUM DAS FÜR BOXER ENTSCHEIDEND IST',
          blocks: [
            {
              t: 'p',
              text: 'Der größte Unterschied zwischen einem Landes- und einem Nationalkader-Boxer ist <strong>nicht die Physis, sondern die Taktik</strong>. Auf Landesebene gewinnt oft der Fittere. Auf Nationalebene sind alle fit – dort gewinnt, wer den Ring liest, Muster erkennt und den Gegner systematisch zerlegt. Notational-Analysen von Olympia-Kämpfen zeigen: <strong>Gewinner landen nicht mehr Schläge, sondern treffen mit höherer Genauigkeit und besserer Selektion</strong> (Davis et al. 2018). Ring IQ ist trainierbar – aber die wenigsten tun es bewusst.'
            }
          ]
        },
        {
          t: 'card',
          id: 'mustererkennung-entscheidung',
          title: 'MUSTERERKENNUNG & ENTSCHEIDUNG',
          blocks: [
            {
              t: 'p',
              text: 'Experten nutzen Chunking – sie erkennen ganze Situationen statt einzelner Aktionen. Ein erfahrener Boxer sieht nicht „linker Jab", sondern „Er testet meine Distanz → gleich kommt die rechte Gerade." Hristovski et al. (2006) zeigten: Elite-Boxer treffen Kampfentscheidungen in <strong>unter 200ms</strong> – schneller als bewusstes Denken möglich ist. Das geht nur durch automatisierte Muster-Reaktions-Verknüpfungen.'
            },
            {
              t: 'p',
              text: '<strong>Distanzkontrolle – die Königsdisziplin:</strong> Boxen findet in drei Distanzzonen statt. Jeder Boxer hat eine Zone, in der er am gefährlichsten ist. Taktisches Boxen bedeutet: <strong>Deine beste Zone erzwingen, seine beste Zone vermeiden.</strong>'
            },
            {
              t: 'p',
              text: '<strong>Tells – die Körpersprache lesen:</strong> Fast jeder Boxer hat Tells – unbewusste Vorbewegungen, die Schläge verraten. Durch systematische Videoanalyse kannst du die Tells deines Gegners finden, bevor du in den Ring steigst.'
            }
          ]
        },
        {
          t: 'card',
          id: 'empfohlenes-programm',
          title: 'EMPFOHLENES PROGRAMM',
          blocks: [
            { t: 'h', text: 'Constraint-Based Sparring (2–3×/Woche)' },
            {
              t: 'p',
              text: 'Systematische Progression von einfach → komplex – das kubanische System nutzt diese Methode seit Jahrzehnten:'
            },
            {
              t: 'list',
              items: [
                '<strong>Level 1:</strong> Nur Jab-Sparring (Distanzkontrolle, Timing)',
                '<strong>Level 2:</strong> Nur Konter (Antizipation, Geduld)',
                '<strong>Level 3:</strong> Nur Innendistanz (Clinch-Arbeit, Uppercuts)',
                '<strong>Level 4:</strong> Boxer A greift an, Boxer B darf nur ausweichen + 1 Konter',
                '<strong>Level 5:</strong> Freies Sparring mit taktischer Aufgabe (z.B. „nur über rechte Gerade scoren")'
              ]
            },
            { t: 'h', text: 'Notational Analysis & Videoarbeit' },
            {
              t: 'list',
              items: [
                '<strong>Eigene Kämpfe:</strong> Sparring aufnehmen, nach Runde analysieren: Wann werde ich getroffen? Wo verliere ich die Distanz? Welche Muster wiederhole ich?',
                '<strong>Gegner-Scouting:</strong> Videos systematisch nach Tells, bevorzugten Kombis und Schwachstellen durchgehen',
                '<strong>Notational Analysis:</strong> Schläge zählen, Trefferquote berechnen, effektive vs. ineffektive Aktionen trennen – so arbeiten auch Nationaltrainer (Williams & Elliott 1999)'
              ]
            },
            { t: 'h', text: 'Mid-Fight Adaptation (im Sparring üben)' },
            {
              t: 'list',
              items: [
                'Trainer gibt nach jeder Runde eine taktische Anpassung vor: „Jetzt nur über den Körper" oder „Wechsel auf Außendistanz"',
                'Trainiert die Fähigkeit, den Gameplan im Kampf zu ändern – entscheidend auf hohem Niveau'
              ]
            },
            {
              t: 'p',
              text: '<strong>Selbst-Tagebuch:</strong> Nach jedem Sparring 3 Sachen notieren: Was hat funktioniert? Was nicht? Was probiere ich nächstes Mal?'
            }
          ]
        }
      ]
    },
    {
      id: 'psyche',
      title: 'Sportpsychologie und mentale Stärke',
      sub: 'Visualisierung, Arousal-Kontrolle, Selbstgespräche, Box-Breathing. 90% des Kampfes passieren im Kopf – und das ist trainierbar.',
      tags: [
        { text: 'Täglich · 10–15 Min.', cls: 'tag-purple' },
        { text: '0 Euro', cls: 'tag-gold' }
      ],
      blocks: [
        {
          t: 'card',
          id: 'warum-das-fuer-boxer-entscheidend-ist',
          title: 'WARUM DAS FÜR BOXER ENTSCHEIDEND IST',
          blocks: [
            {
              t: 'p',
              text: 'Du kannst der fitteste, technisch beste Boxer im Raum sein – wenn du im Ring vor Nervosität erstarrst, dein Kopf nach dem ersten Treffer aufgibt, oder du unter Druck in alte Muster verfällst, war alles Training umsonst. Untersuchungen zeigen: <strong>~70% aller Boxer berichten von signifikanter Vor-Kampf-Angst</strong> – das ist normal. Der Unterschied zwischen Elite und Amateur ist nicht, ob du Angst hast, sondern ob du sie regulieren kannst.'
            }
          ]
        },
        {
          t: 'card',
          id: 'das-boxing-paradoxon',
          title: 'DAS BOXING-PARADOXON',
          blocks: [
            {
              t: 'p',
              text: 'Boxen ist der einzige Breiten-Sport, in dem <strong>du Schmerz empfangen musst, um erfolgreich zu sein</strong>. Du musst hart treffen und gleichzeitig bereit sein, hart getroffen zu werden. Dieses Paradoxon erzeugt einzigartige psychologische Anforderungen: Aggressivität + Kontrolle, Mut + taktische Geduld, Schmerztoleranz + Selbstschutz. Das lässt sich nicht einfach „mental durchstehen" – es muss systematisch trainiert werden.'
            }
          ]
        },
        {
          t: 'card',
          id: 'resilienz-die-faehigkeit-nach-treffern-z',
          title: 'RESILIENZ – DIE FÄHIGKEIT, NACH TREFFERN ZURÜCKZUKOMMEN',
          blocks: [
            {
              t: 'p',
              text: 'Der entscheidende Moment in vielen Kämpfen: Du wirst hart getroffen, gehst womöglich auf die Bretter. Was jetzt passiert, entscheidet den Kampf. <strong>Progressive Desensitisierung</strong> ist der Trainingsweg: Du gewöhnst dich schrittweise an zunehmende Drucksituationen, damit dein Kopf im Kampf nicht zum ersten Mal damit konfrontiert wird:'
            },
            {
              t: 'list',
              items: [
                '<strong>Stufe 1:</strong> Leichtes Sparring mit überlegenem Partner → lernen, Druck auszuhalten',
                '<strong>Stufe 2:</strong> Sparring mit Body Shots erlaubt → Schmerztoleranz aufbauen',
                '<strong>Stufe 3:</strong> Situationssparring: „Du bist 2 Runden hinten, letzte Runde" → Clutch-Performance üben',
                '<strong>Stufe 4:</strong> Sparring unter Ermüdung (nach Conditioning) → Entscheidungen unter Stress'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'visualisierung-arousal-kontrolle',
          title: 'VISUALISIERUNG & AROUSAL-KONTROLLE',
          blocks: [
            {
              t: 'p',
              text: 'Wenn du dir vorstellst, einen Cross zu schlagen, feuern <strong>dieselben motorischen Nervenbahnen</strong> wie beim echten Schlag (Funktionelle Äquivalenz). Das PETTLEP-Modell macht Visualisierung messbar wirksam.'
            },
            {
              t: 'p',
              text: 'Box-Breathing (4-4-4-4) aktiviert den Vagusnerv und schaltet dein Nervensystem von Kampf-oder-Flucht auf kontrollierte Bereitschaft – Herzfrequenz sinkt um 10–15 bpm in 90 Sekunden. Perfekt für die Ecke zwischen den Runden.'
            },
            {
              t: 'p',
              text: '<strong>Selbstgespräche:</strong> <strong>Instruktionale</strong> („Hände hoch, Jab raus") verbessern Technik, <strong>motivationale</strong> („Ich bin bereit") verbessern Ausdauer um bis zu <strong>18%</strong> (Blanchfield et al. 2014). Meta-Analyse von Hatzigeorgiadis et al. (2011): Effektstärke d=0.48.'
            }
          ]
        },
        {
          t: 'card',
          id: 'corner-kommunikation',
          title: 'CORNER-KOMMUNIKATION',
          blocks: [
            {
              t: 'p',
              text: 'Die Ecke ist dein taktisches Gehirn zwischen den Runden. Effektive Corner-Kommunikation ist eine trainierbare Fähigkeit – für Boxer UND Trainer:'
            },
            {
              t: 'list',
              items: [
                '<strong>60-Sekunden-Regel:</strong> Max. 2–3 klare Anweisungen pro Pause. Nicht 10 Dinge gleichzeitig',
                '<strong>Vorher vereinbarte Codewörter:</strong> „Marsch" = nach vorne drücken, „Box" = Außendistanz halten',
                '<strong>Im Sparring üben:</strong> Trainer gibt zwischen Runden taktische Anpassungen – Boxer muss sofort umsetzen'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'taegliches-protokoll-10-15-min',
          title: 'TÄGLICHES PROTOKOLL (10–15 MIN.)',
          blocks: [
            {
              t: 'list',
              items: [
                '<strong>Visualisierung (5 Min.):</strong> Vor dem Schlafen. Kampf in Ich-Perspektive, echtem Tempo, mit Emotionen. Auch Rückschläge visualisieren – wie reagierst du nach einem Treffer?',
                '<strong>Box-Breathing (2 Min.):</strong> 4-4-4-4, morgens und vor dem Training',
                '<strong>Selbstgespräch-Vorbereitung:</strong> 3 persönliche Sätze – 1 instruktional, 1 motivational, 1 für Krisen („Atmen, Grundstellung, Jab")',
                '<strong>Pre-Performance-Routine:</strong> Feste Abfolge vor jedem Sparring/Kampf (Musik → Aufwärmen → Visualisierung → Box-Breathing → Ring)'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'mobilitaet',
      title: 'Mobilität und Verletzungsprävention',
      sub: 'Hüfte, Schulter, Rotation, Glute-Stärke, Achillessehne, Pre-Running, Warm-Up. Mobilität ist der erste Schritt – vor jedem Gewicht.',
      tags: [
        { text: 'Täglich · 10 Min.', cls: 'tag-red' },
        { text: 'DIY + Nacken + Warm-Up', cls: 'tag-orange' }
      ],
      blocks: [
        {
          t: 'card',
          id: 'warum-mobilitaet-der-erste-schritt-ist',
          title: 'WARUM MOBILITÄT DER ERSTE SCHRITT IST',
          blocks: [
            {
              t: 'p',
              text: 'Durch die intensive, repetitive Natur des Boxens werden Athleten in bestimmten Muskelgruppen "eng" und in anderen "unteraktiv" – das erzeugt muskuläre Imbalancen die Leistung beeinträchtigen und das Verletzungsrisiko erhöhen.'
            },
            {
              t: 'p',
              text: 'Für jeden Athleten bei BoxSpec ist Mobilitäts- und Bewegungstraining der <strong>allererste Schritt</strong>. Bevor wir auch nur ein Gewicht anfassen, müssen die grundlegenden Bewegungsfähigkeiten stimmen. Das ermöglicht bessere Ergebnisse und vermeidet Verletzungen.'
            },
            { t: 'h', text: 'Warum Boxer besonders betroffen sind' },
            {
              t: 'list',
              items: [
                'Stunden in der geschlossenen Kampfstellung → Engheit in Knöcheln, Hüften und Schultern',
                '<strong>500-1000 Schläge pro Session</strong> → alles anteriordominante Bewegungen mit hohen Aufprallkräften',
                'Hohe Laufbelastungen → zusätzliche Unterkörper-Mobilitätsprobleme',
                'S&C wird selten von klein auf trainiert → Einschränkungen werden nie korrigiert'
              ]
            },
            {
              t: 'p',
              text: 'Aus Tests mit über <strong>250 Boxern</strong> zeigt sich: Die Mehrheit hat Schulter-, Hüft- und/oder Knöchel-Mobilitätsprobleme. Je länger die Trainingshistorie, desto eingeschränkter.'
            },
            {
              t: 'p',
              text: '<strong>BoxSpec-Philosophie:</strong> "Train the Movement and the Muscles Will Follow" – Wir trainieren die Bewegung, die Muskeln folgen.'
            }
          ]
        },
        {
          t: 'card',
          id: 'hueftmobilitaet',
          title: 'HÜFTMOBILITÄT',
          blocks: [
            {
              t: 'p',
              text: 'Hüftbeuger-Verkürzung ist das häufigste Problem. Boxer verstärken es durch unzählige Stunden in ähnlicher Stellung plus submaximales Dauerlaufen. Eine Studie an Baseball-Pitchern zeigte: Jeder Grad mehr Hüft-Rotation = <strong>0.89× weniger Verletzungsrisiko</strong> an Ellbogen und Schulter.'
            },
            {
              t: 'p',
              text: '<strong>Mobilisieren:</strong> 1/2 Kneeling Lateral Lunge Rotations, Banded Hip Floss'
            },
            {
              t: 'p',
              text: '<strong>Stabilisieren:</strong> Split Squat Lunge & Rotate, Side Clams (mit Side Bend) → Gluteus Medius für Hüftstabilität im Split Stance'
            },
            {
              t: 'p',
              text: '<strong>Stärken:</strong> Quadruped Hip Extensions, Single Leg Glute Bridge, Banded Glute Bridges'
            },
            {
              t: 'p',
              text: '<strong>Maximal laden:</strong> Lateral Lunge, Banded Sumo Deadlift, Barbell Hip Thrust'
            }
          ]
        },
        {
          t: 'card',
          id: 'gluteus-staerke-der-schluessel-zur-hueft',
          title: 'GLUTEUS-STÄRKE — DER SCHLÜSSEL ZUR HÜFTE',
          blocks: [
            {
              t: 'p',
              text: 'Die Glutes sind die primären Hüftstrecker – Hüftextension ist entscheidend für die Kraftübertragung beim Schlag. Aber Glutes sind bei Boxern typischerweise <strong>unterentwickelt und unteraktiv</strong> wegen der anteriordominanten Kampfstellung und Dauerlaufen.'
            },
            {
              t: 'p',
              text: '<strong>Gluteus Maximus:</strong> Hauptmuskel für kraftvolle Hüftextension (Springen, Sprinten, Schlagen). Schwache Glutes → unterer Rücken kompensiert → Schmerzen und Verletzungen.'
            },
            {
              t: 'p',
              text: '<strong>Gluteus Medius:</strong> Seitlich am Hüftkopf. Verantwortlich für Hüftabduktion und -stabilität. Kann beim Haken die Hüfte schnell rotieren und im Split Stance stabilisieren. Unterentwickelt → Knie-Valgus, instabile Beinarbeit.'
            },
            {
              t: 'p',
              text: 'Bodyweight-Übungen allein reichen nicht – wir müssen auch im Kraftraum gezielt laden: <strong>Goblet Pause Squats mit Mini-Bands, KB Sumo Deadlift, Banded Hip Thrusts</strong>.'
            }
          ]
        },
        {
          t: 'card',
          id: 'schultermobilitaet',
          title: 'SCHULTERMOBILITÄT',
          blocks: [
            {
              t: 'p',
              text: '"Hände hoch, Kinn runter" – die defensive Guard erfordert Rundung des oberen Rückens und Hochziehen der Schultern. Hunderte Schläge pro Woche plus Press-Ups und Schulterpresse verschärfen das Problem: <strong>anteriore Dominanz und posteriore Schwäche</strong>.'
            },
            {
              t: 'p',
              text: 'Schlechte Schultermobilität kann zu Impingement, Rotatorenmanschetten-Schwäche, Rückenschmerzen und reduzierter Schulter-Stabilität am Ende des Schlags führen. Das Ergebnis: Karriere-Unterbrechungen, abgesagte Kämpfe, Leistungseinbußen.'
            },
            {
              t: 'p',
              text: '<strong>Mobilisieren:</strong> Quadruped Thoracic Rotations, Thoracic Extensions, Lunge & Overhead Press'
            },
            {
              t: 'p',
              text: '<strong>Stabilisieren (Rotatorenmanschette):</strong> Banded Plank Clockface, Banded Triple Threat, Med Ball Shoulder Rebounds'
            },
            {
              t: 'p',
              text: '<strong>Stärken (schulterfreundliches Pressen):</strong> Single Arm Landmine Press, 1/2 Kneeling Dumbbell Press, 1/2 Kneeling Bottoms Up Press'
            }
          ]
        },
        {
          t: 'card',
          id: 'rotationsmobilitaet',
          title: 'ROTATIONSMOBILITÄT',
          blocks: [
            {
              t: 'p',
              text: 'Die gerundete Haltung im Ring führt zu einer immobilen Brustwirbelsäule. Mangelnde Mobilität hier bedeutet: Rotation wird vom unteren Rücken und oberen Trapez kompensiert.'
            },
            {
              t: 'p',
              text: '<strong>Leistungsperspektive:</strong> Rotationsmobilität ist essentiell für maximale Reichweite und Kraftübertragung. Jeder Zentimeter mehr Rotation erweitert das Mid-Range-Spiel – die Distanz in der die härtesten Schläge landen.'
            },
            {
              t: 'p',
              text: '<strong>Wichtig:</strong> Erst Rotationsmobilität, -stabilität und -kraft entwickeln – DANN Geschwindigkeitsübungen (Med Ball Throws). Ohne diese Grundlagen aktivieren Speed-Übungen nicht die richtigen Core-Muskeln und der Quadratus Lumborum kompensiert → Rückenschmerzen.'
            }
          ]
        },
        {
          t: 'card',
          id: 'pre-running-mobilitaet',
          title: 'PRE-RUNNING MOBILITÄT',
          blocks: [
            {
              t: 'p',
              text: 'Laufen birgt spezifische Risiken für Boxer: Mobilitätseinschränkungen → suboptimale Lauftechnik → Überlastungsverletzungen. Bodenreaktionskraft beim Laufen = <strong>2.5-3× Körpergewicht</strong> bei 13-15 km/h. Drei Schlüsselbereiche vor jedem Lauf:'
            },
            {
              t: 'p',
              text: '<strong>1. Achillessehne schützen:</strong> Boxer verbringen viel Zeit auf den Fußballen → Zug auf Achillessehne. Mobilisieren (Dorsiflexion), Stabilisieren (einbeinige Low-Impact Plyos), Stärken (High-Amplitude Plyos).'
            },
            {
              t: 'p',
              text: '<strong>2. Hamstrings schützen:</strong> Bei hohen Geschwindigkeiten müssen Hamstrings hohe Kräfte bei maximaler Dehnung produzieren. Hüftmobilität + -stabilität + -kraft als Prävention.'
            },
            { t: 'p', text: '<strong>3. Sprint-Mechanik:</strong> 3-4 Drills, 2-3 Sets × 10-20m:' },
            {
              t: 'list',
              items: [
                'Skip for Height (vertikale Kraft), A-March (Bodenstriking), Single Leg Drives (Koordination), Wall Drives (horizontale Kraft), Banded Sprint (Überlastung).'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'movement-assessments',
          title: 'MOVEMENT ASSESSMENTS',
          blocks: [
            {
              t: 'p',
              text: '<strong>Overhead Squat:</strong> Der primäre Mobilitätstest. Holzstab über dem Kopf, Füße etwas breiter als hüftbreit. Absenken und halten. Bewertet Schulter- UND Hüftmobilität, unilaterale Imbalancen und Core-Stabilität in einer Bewegung. Bewertung 0-5.'
            },
            {
              t: 'p',
              text: '<strong>Single Leg Squat:</strong> Für Boxer die den Overhead Squat >3/5 schaffen. Aufdecken von unilateralen Schwächen in Adduktoren, Hamstrings, Abduktoren und QL-Muskel.'
            }
          ]
        },
        {
          t: 'card',
          id: 'warm-up-ramp-methode',
          title: 'WARM-UP — RAMP-METHODE',
          blocks: [
            {
              t: 'p',
              text: 'Jede Session beginnt mit einem strukturierten Warm-Up nach der RAMP-Methode:'
            },
            {
              t: 'p',
              text: '<strong>1. RAISE (3-5 Min.):</strong> Seilspringen, leichtes Schattenboxen oder Joggen → Körpertemperatur und Blutfluss erhöhen'
            },
            {
              t: 'p',
              text: '<strong>2. ACTIVATE & MOBILISE:</strong> Dynamische Dehnungen und Stabilisationsübungen → ROM verbessern, Muskeln aktivieren. Hier das tägliche DIY-Mobilitätsprogramm durchführen'
            },
            {
              t: 'p',
              text: '<strong>3. POTENTIATE:</strong> Schnelle oder schwer-geladene Übungen für PAP:'
            },
            {
              t: 'list',
              items: [
                'Pogos: 2-3 Sets · Ice Skaters: 2-3 Sets · Banded Shadow Box: 2-3 Sets',
                'Punch ISO Holds: 3-5 Sek. je Schlag (Jab, Cross, Haken, Uppercuts beidseits)'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'pre-fight-warm-up',
          title: 'PRE-FIGHT WARM-UP',
          blocks: [
            {
              t: 'p',
              text: 'Der letzte Teil der Kampfvorbereitung. 99% der Boxer machen Schattenboxen und Pratzen – aber nur wenige ein strukturiertes physisches Warm-Up. Forschung zeigt: Ein strukturiertes Warm-Up verbessert Fokus, Konzentration, Muskelkraft und reduziert Stress und Angst.'
            },
            { t: 'h', text: 'Protokoll' },
            {
              t: 'p',
              text: '1. <strong>Situation einschätzen:</strong> Räumlichkeiten, Fitness des Athleten, verfügbare Zeit'
            },
            {
              t: 'p',
              text: '2. <strong>Raise (5-10 Min.):</strong> Joggen, Seilspringen, Schattenboxen — Zone 2-3 (60-80% HFmax)'
            },
            {
              t: 'p',
              text: '3. <strong>Activate & Mobilise:</strong> Eagles 8 je Seite · Windmills 8 je Seite · Floor Slides 8 · Glute Bridge 8 · Side Clams 8 je Seite · Glute Stretch 8 · Yoga Press-Ups 8 · Spider-Man to Twist 5 je Seite · Squat + Press 8 · Lunge and Rotate 6 je Seite · Lateral Lunge 6 je Seite · Banded Lateral/Monster Walks 8 je Seite'
            },
            {
              t: 'p',
              text: '4. <strong>Potentiate:</strong> Pogos 10×3 · Ice Skaters 6 je Seite ×3 · Banded Shadow Box 20 Sek. ×3 · Punch ISO Holds 5 Sek. je Schlag'
            },
            {
              t: 'p',
              text: '5. <strong>Pads:</strong> 1-2 Min. Runden mit 1-3 Min. Pause — Herzfrequenz in die rote Zone bringen'
            }
          ]
        },
        {
          t: 'card',
          id: 'das-boxspec-mobilitaetsprogramm-10-min-1',
          title: 'DAS BOXSPEC-MOBILITÄTSPROGRAMM (10 MIN., 1-2×/TAG)',
          blocks: [
            {
              t: 'p',
              text: 'Ein Programm das Schulter-, Hüft- und Rotationsmobilität entwickelt und die Glutes aktiviert. Einbauen als: Warm-Up vor S&C/Laufen · Vor dem Box-Warm-Up · Recovery-Session (2-3 Sets statt 1-2) · Morgens oder vor dem Schlaf'
            },
            {
              t: 'p',
              text: '<strong>Hüfte:</strong> 1/2 Kneeling Lateral Lunge Rotations · Banded Hip Floss'
            },
            { t: 'p', text: '<strong>Stabilisation:</strong> Split Squat Lunge & Rotate · Side Clams' },
            {
              t: 'p',
              text: '<strong>Schulter:</strong> Quadruped Thoracic Rotations · Thoracic Extensions'
            },
            {
              t: 'p',
              text: '<strong>Glutes:</strong> Quadruped Hip Extensions · Single Leg Glute Bridge'
            }
          ]
        },
        {
          t: 'card',
          id: 'nackentraining-ko-praevention',
          title: 'NACKENTRAINING — KO-PRÄVENTION',
          blocks: [
            {
              t: 'p',
              text: 'Ein KO entsteht durch <strong>Rotationsbeschleunigung</strong> des Gehirns im Schädel. Der Nacken ist die einzige Struktur die diese Rotation bremsen kann. Stärkerer Nacken = weniger Kopfbeschleunigung bei Treffern. Ein angespannter Nacken verbindet den Kopf mit dem Oberkörper (15-30kg effektive Masse) – 3-6× mehr Masse gegen den Schlag.'
            },
            { t: 'h', text: 'Protokoll (3×/Woche, 10-15 Min.)' },
            {
              t: 'list',
              items: [
                'Isometrie: 4 Richtungen gegen Hand oder Band, 3×8 Sek.',
                'Konzentrisch: Nacken-Curls liegend (Flexion + Extension), 3×12',
                'Neck Harness: Kontrollierte Flexion/Extension, progressives Gewicht (2-5kg Start)',
                '<strong>Niemals Nackenbrücken</strong> – Bandscheibenrisiko überwiegt den Nutzen'
              ]
            }
          ]
        },
        {
          t: 'card',
          id: 'hand-handgelenk',
          title: 'HAND & HANDGELENK',
          blocks: [
            {
              t: 'p',
              text: 'Hand/Handgelenk (28%) sind die häufigsten Verletzungsorte im Boxen. Prävention:'
            },
            {
              t: 'list',
              items: [
                'Wrist Curls + Reverse Wrist Curls: 3×15 · Radial/Ulnar Deviation: 2×12',
                'Rice Bucket Grabs: 2×30 Sek.',
                'Richtiges Bandagieren bei jedem Training'
              ]
            }
          ]
        }
      ]
    }
  ]
});
