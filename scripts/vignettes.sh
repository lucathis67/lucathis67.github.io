#!/bin/sh
# Lighter versions of the article covers for the portfolio (27 November 2026).
# For each cover_image of articles/*.html, writes name-800.jpg and
# name-1600.jpg next to the original, with macOS sips. Existing versions are
# kept: delete one to make it again (for example after changing a cover).
# Usage, from the root of the site:  sh scripts/vignettes.sh
set -e
grep -h '^cover_image:' articles/*.html | sed 's/^cover_image: *//; s/"//g; s#^/##' |
while read -r cover; do
  base="${cover%.jpg}"
  for width in 800 1600; do
    out="$base-$width.jpg"
    if [ -f "$out" ]; then continue; fi
    quality=80; [ "$width" = 800 ] && quality=78
    sips --resampleWidth "$width" -s format jpeg -s formatOptions "$quality" "$cover" --out "$out" >/dev/null
    echo "$out"
  done
done
