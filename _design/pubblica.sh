#!/usr/bin/env bash
# Comando di build di Cloudflare Pages: copia in dist/ solo i file pubblici del sito.
# Restano fuori _design/, migrations/, functions/ (le usa Pages a parte), CLAUDE.md, README.md e i file di configurazione.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
cp ./*.html _headers _redirects robots.txt sitemap.xml dist/
cp -r assets img brand admin dist/
cp ./*.png ./*.jpg ./*.svg dist/
echo "dist pronto: $(find dist -type f | wc -l) file"
