#!/usr/bin/env bash
# Setzt vendor/framework7.min.css aus dem Kern und den benutzten
# Komponenten zusammen, statt das Buendel zu nehmen.
#
# Das Buendel sind 474 KB und enthaelt jede Komponente, die Framework7
# kennt. BoxSpec benutzt eine Handvoll. Der Zusammenbau ist 148 KB.
#
# ACHTUNG: Wird eine neue Framework7-Komponente benutzt (app.toast,
# app.popup, Searchbar, Swiper, Range, Stepper, Smart Select), muss sie
# unten in KOMPONENTEN ergaenzt und dieses Skript neu laufen. Sonst
# steht sie unformatiert in der App und niemand sieht warum.
set -euo pipefail

VERSION=9.1.3
# ACHTUNG: Hier gehoeren auch Komponenten hinein, die NUR im Markup
# vorkommen und nie per JavaScript aufgerufen werden. Genau daran ist
# es schon einmal gescheitert: tabs fehlte, dadurch standen alle fuenf
# Reiteransichten gleichzeitig auf display:block und sichtbar war immer
# nur die erste. Die Pruefung dafuer steht in tools/f7check.sh.
KOMPONENTEN=(tabs input picker sheet dialog preloader)
ZIEL=vendor/framework7.min.css
CDN="https://cdn.jsdelivr.net/npm/framework7@${VERSION}"

{
  echo "/* Framework7 ${VERSION}, zusammengesetzt statt Buendel."
  echo "   Kern + ${KOMPONENTEN[*]}."
  echo "   Neu erzeugen mit tools/f7css.sh, nicht von Hand bearbeiten. */"
} > "$ZIEL"

curl -sfL --max-time 60 "${CDN}/framework7.min.css" >> "$ZIEL"
for k in "${KOMPONENTEN[@]}"; do
  printf '\n/* --- %s --- */\n' "$k" >> "$ZIEL"
  curl -sfL --max-time 60 "${CDN}/components/${k}/${k}.css" >> "$ZIEL"
done

printf 'fertig: %s KB\n' "$(( $(stat -c%s "$ZIEL") / 1024 ))"
