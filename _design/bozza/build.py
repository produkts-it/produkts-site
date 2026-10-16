"""Genera bozza/assets/site.js da site.src.js, con il logo dell'intro (preso da index.html) e il cursore (_design/wip/cursor.js)."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.join(HERE, '..', '..')
src = open(os.path.join(HERE, 'site.src.js'), encoding='utf-8').read()
wip = open(os.path.join(REPO, 'index.html'), encoding='utf-8').read()
loader = wip[wip.index('<svg viewBox="0 0 450 251.5"'):]
loader = loader[:loader.index('</svg>') + len('</svg>')]
loader += '<span class="skip"><span class="c">Clicca per saltare l\'animazione</span><span class="t">Tocca per saltare l\'animazione</span></span>'
cursor = open(os.path.join(REPO, '_design', 'wip', 'cursor.js'), encoding='utf-8').read().strip()
out = src.replace('__LOADER_SVG__', json.dumps(loader, ensure_ascii=False)).replace('__CURSOR__', cursor)
open(os.path.join(REPO, 'bozza', 'assets', 'site.js'), 'w', encoding='utf-8', newline='\n').write(out)
print('ok', len(out))
