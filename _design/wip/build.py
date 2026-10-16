"""Builds index.html in the repo root (standalone page for GitHub Pages) from wip-body.html."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
body = open(os.path.join(HERE, 'wip-body.html'), encoding='utf-8').read()
head = '''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="produkts.it di Karim Ismail, direttore della fotografia, videomaker e fotografo ad Altamura. Il nuovo sito è in lavorazione.">
<meta property="og:title" content="produkts.it">
<meta property="og:description" content="Il nuovo sito è in messa a fuoco. Karim Ismail, direttore della fotografia, videomaker e fotografo.">
<meta property="og:image" content="https://produkts.it/dynamis.jpg">
<meta name="theme-color" content="#080808">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
'''
i = body.index('<div class="page">')
top = body[:i].replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
html = head + top + '</head>\n<body>\n' + body[i:] + '</body>\n</html>\n'
open(os.path.join(HERE, '..', '..', 'index.html'), 'w', encoding='utf-8', newline='\n').write(html)
print('ok', len(html))
