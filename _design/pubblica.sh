#!/usr/bin/env bash
# Comando di build di Cloudflare Pages: copia in dist/ solo i file pubblici del sito.
# Restano fuori _design/, migrations/, functions/ (le usa Pages a parte), CLAUDE.md, README.md e i file di configurazione.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
cp index.html 404.html _headers dist/
cp -r bozza brand admin dist/
cp ./*.png ./*.jpg ./*.svg dist/
echo "dist pronto: $(find dist -type f | wc -l) file"
