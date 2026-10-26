#!/usr/bin/env bash
# Comando di build di Cloudflare Pages: copia in dist/ solo i file pubblici del sito.
# Restano fuori _design/, migrations/, functions/ (le usa Pages a parte), CLAUDE.md, README.md e i file di configurazione.
set -euo pipefail
cd "$(dirname "$0")/.."
# Prima rigenera le pagine dei lavori da _design/bozza/lavori.json (lo modifica anche il pannello /admin),
# poi site.js, le versioni ?v= e la SEO. Se qualcosa fallisce la build si ferma e resta online la versione precedente.
PY=$(for c in python3 python; do if "$c" -c 'import sys' >/dev/null 2>&1; then echo "$c"; break; fi; done)
"$PY" -X utf8 _design/bozza/lavori.py
"$PY" -X utf8 _design/bozza/build.py
rm -rf dist
mkdir -p dist
cp ./*.html _headers _redirects robots.txt sitemap.xml dist/
cp -r assets img brand admin dist/
cp ./*.png ./*.jpg ./*.svg dist/
echo "dist pronto: $(find dist -type f | wc -l) file"
