#!/usr/bin/env bash
# Prueft, ob im zusammengesetzten vendor/framework7.min.css eine
# Komponente fehlt, die die App tatsaechlich benutzt.
#
# Warum es das gibt: der Zusammenbau enthielt anfangs nur die
# Komponenten, die per JavaScript aufgerufen werden. tabs steht aber
# nur im Markup, fehlte deshalb, und dadurch standen alle fuenf
# Reiteransichten gleichzeitig auf display:block. Sichtbar war immer
# nur die erste, egal welcher Reiter aktiv war. Auf so etwas darf man
# sich nicht mit Aufmerksamkeit verlassen.
#
# Laeuft gegen das offizielle Buendel als Referenz: was dort eine
# Regel hat und hier keine, fehlt.
set -euo pipefail

VERSION=9.1.3
ZUSAMMENBAU=vendor/framework7.min.css
BUENDEL=$(mktemp)
trap 'rm -f "$BUENDEL"' EXIT

curl -sfL --max-time 60 \
  "https://cdn.jsdelivr.net/npm/framework7@${VERSION}/framework7-bundle.min.css" -o "$BUENDEL"

# Selektoren, die die App benutzt. Neue Bausteine hier eintragen.
SELEKTOREN=(
  '\.tabs \.tab-active' '\.tabs \.tab{' '\.view' '\.page-content'
  'navbar-large' 'title-large' '\.tabbar' 'toolbar-inner'
  '\.list-strong' '\.block-title' '\.item-media' '\.item-input'
  '\.button-fill' '\.picker-item' '\.sheet-modal' '\.dialog'
  '\.preloader' 'icon-back' 'swipeback' 'page-previous'
)

fehler=0
for sel in "${SELEKTOREN[@]}"; do
  a=$(grep -c -- "$sel" "$ZUSAMMENBAU" || true)
  b=$(grep -c -- "$sel" "$BUENDEL" || true)
  if [ "$a" = "0" ] && [ "$b" != "0" ]; then
    printf 'FEHLT  %s\n' "$sel"
    fehler=$((fehler + 1))
  fi
done

if [ "$fehler" -gt 0 ]; then
  printf '\n%d Selektor(en) fehlen. Komponente in tools/f7css.sh ergaenzen und neu bauen.\n' "$fehler"
  exit 1
fi
printf 'alle %d Selektoren vorhanden\n' "${#SELEKTOREN[@]}"
