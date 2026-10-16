"""Genera bozza/assets/site.js da site.src.js, con il logo dell'intro (preso da index.html) e il cursore (_design/wip/cursor.js)."""
import json, os, re

def save(path, text):
    """Scrive il file; su Windows a volte la scrittura fallisce per un attimo (antivirus/indicizzazione): riprova."""
    import time
    for i in range(5):
        try:
            with open(path, 'w', encoding='utf-8', newline='\n') as f:
                f.write(text)
            return
        except OSError:
            if i == 4:
                raise
            time.sleep(0.3)


HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.join(HERE, '..', '..')
src = open(os.path.join(HERE, 'site.src.js'), encoding='utf-8').read()
wip = open(os.path.join(REPO, 'index.html'), encoding='utf-8').read()
loader = wip[wip.index('<svg viewBox="0 0 450 251.5"'):]
loader = loader[:loader.index('</svg>') + len('</svg>')]
loader += '<span class="skip"><span class="c">Clicca per saltare l\'animazione</span><span class="t">Tocca per saltare l\'animazione</span></span>'
cursor = open(os.path.join(REPO, '_design', 'wip', 'cursor.js'), encoding='utf-8').read().strip()
out = src.replace('__LOADER_SVG__', json.dumps(loader, ensure_ascii=False)).replace('__CURSOR__', cursor)
save(os.path.join(REPO, 'bozza', 'assets', 'site.js'), out)
print('ok', len(out))

# Versione nei riferimenti a site.js e site.css: il browser scarica subito i file nuovi invece di usare la cache
import glob, hashlib
ver = lambda f: hashlib.sha1(open(os.path.join(REPO, 'bozza', 'assets', f), 'rb').read()).hexdigest()[:8]
vjs, vcss = ver('site.js'), ver('site.css')
for f in glob.glob(os.path.join(REPO, 'bozza', '*.html')):
    h = open(f, encoding='utf-8').read()
    h2 = re.sub(r'assets/site\.js(\?v=\w+)?"', 'assets/site.js?v=%s"' % vjs, h)
    h2 = re.sub(r'assets/site\.css(\?v=\w+)?"', 'assets/site.css?v=%s"' % vcss, h2)
    if h2 != h:
        save(f, h2)
print('versioni', vjs, vcss)
