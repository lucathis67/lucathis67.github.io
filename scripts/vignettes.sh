#!/bin/sh
# Versions WebP des photographies du site (27 novembre 2026).
# Pour chaque JPEG de images/, écrit à côté de l'original photo-800.webp,
# photo-1600.webp et photo-2400.webp (seulement les largeurs que l'original
# atteint, plus sa propre largeur si elle tombe entre deux, par exemple
# photo-1067.webp). Les originaux ne sont pas modifiés : ils restent la
# version de secours des pages et l'image de partage (Open Graph).
# _plugins/images-webp.rb branche ces versions dans les pages à la construction.
#
# Les versions existantes sont gardées : en supprimer une pour la refaire (par
# exemple après avoir retouché une photo). Les anciennes variantes JPEG des
# couvertures (photo-800.jpg, photo-1600.jpg) sont ignorées.
#
# Nécessite cwebp (une fois : brew install webp) ; sips est fourni par macOS.
# Usage, depuis la racine du site :  sh scripts/vignettes.sh
set -e
if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp est introuvable. L'installer une fois avec : brew install webp" >&2
  exit 1
fi
find images -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) | sort |
while read -r photo; do
  base="${photo%.*}"
  # Ancienne variante JPEG d'une couverture (photo-800.jpg à côté de photo.jpg).
  original="$(printf '%s' "$base" | sed 's/-[0-9][0-9]*$//').${photo##*.}"
  if [ "$original" != "$photo" ] && [ -f "$original" ]; then continue; fi
  width=$(sips -g pixelWidth "$photo" | awk '/pixelWidth/ { print $2 }')
  widths=""
  for w in 800 1600 2400; do
    [ "$width" -ge "$w" ] && widths="$widths $w"
  done
  if [ "$width" -gt 800 ] && [ "$width" -lt 2400 ] && [ "$width" != 1600 ]; then
    widths="$widths $width"
  fi
  [ -z "$widths" ] && widths="$width"
  for w in $widths; do
    out="$base-$w.webp"
    if [ -f "$out" ]; then continue; fi
    if [ "$w" = "$width" ]; then
      cwebp -quiet -q 80 -m 6 -metadata icc "$photo" -o "$out"
    else
      cwebp -quiet -q 80 -m 6 -metadata icc -resize "$w" 0 "$photo" -o "$out"
    fi
    echo "$out"
  done
done
