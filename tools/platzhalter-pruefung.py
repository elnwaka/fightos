# -*- coding: utf-8 -*-
"""Prueft jede personalisierte Zahl gegen das Original.

Eine feste Zahl durch eine gewichtsabhaengige zu ersetzen ist nur
richtig, wenn die Aussage wirklich vom Gewicht abhaengt. Sonst steht
dort eine falsche Behauptung, und keine Vollstaendigkeitspruefung
merkt es, weil alle Woerter da sind.
"""
import io, re, sys

daten = io.open(r'C:\Users\e.nwaka\fightos\js\content\ernaehrung.js', encoding='utf-8').read()
alt   = io.open(r'C:\Users\e.nwaka\fightos\js\pages.js', encoding='utf-8').read()
alt_n = re.sub(r'\s+', ' ', alt)

# Saetze mit Platzhaltern
saetze = set()
for m in re.finditer(r"'([^'\\]*\{[a-z0-9_]+\}[^'\\]*)'", daten):
    saetze.add(m.group(1))

out = io.open(r'C:\Users\EFBCB~1.NWA\AppData\Local\Temp\claude\C--Users-e-nwaka\891f6e81-28e2-46a0-b5ba-13f7def6673c\scratchpad\platz.txt',
              'w', encoding='utf-8')
out.write('%d Saetze mit Platzhaltern\n\n' % len(saetze))

for s in sorted(saetze):
    # Anker: der laengste platzhalterfreie Teil des Satzes
    teile = [t.strip() for t in re.split(r'\{[a-z0-9_]+\}', s) if len(t.strip()) >= 14]
    if not teile:
        out.write('? kein Anker: %s\n\n' % s[:90])
        continue
    anker = max(teile, key=len)
    anker_n = re.sub(r'\s+', ' ', anker)
    i = alt_n.find(anker_n)
    if i < 0:
        out.write('? im Original nicht gefunden: %s\n   Anker: %s\n\n' % (s[:80], anker_n[:60]))
        continue
    orig = alt_n[max(0, i - 90): i + len(anker_n) + 60]
    out.write('NEU : %s\n' % s)
    out.write('ALT : ...%s...\n\n' % orig)

out.close()
print('%d Saetze geprueft, Ergebnis in platz.txt' % len(saetze))
