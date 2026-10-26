"""Lavori del sito: un unico elenco da cui si generano
- le pagine dei lavori semplici (<slug>.html nella root; Dynamis ha una pagina fatta a mano e qui non viene rigenerata),
- la griglia e i filtri di lavori.html,
- i "Lavori scelti" della Home e le filmografie di Home e Chi sono (tra i commenti <!-- nome --> ... <!-- /nome -->).
Uso: python _design/bozza/lavori.py
Regola: per i cortometraggi niente sinossi (no spoiler), solo una riga di atmosfera.
"""
import html, os, re

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
OUT = os.path.join(HERE, '..', '..')
ACC = '#B46428'
KI = 'Karim Ismail'


def yt_thumb(vid, size='maxresdefault'):
    return 'https://i.ytimg.com/vi/%s/%s.jpg' % (vid, size)


# I dati stanno in lavori.json (li modifica anche il pannello /admin, scheda Lavori): qui solo la lettura.
# lavori: dal più recente; 'cats' decide i filtri di Lavori; 'page': False = pagina fatta a mano (Dynamis).
# amarcord: corti di AMARCORD (Accademia Mediterranea del Cinema), ognuno con la sua pagina e il link a Vimeo.
#   Niente sinossi (no spoiler): solo una riga di atmosfera. Cast: [personaggio o '', nome]. Troupe: [ruolo, [nomi]].
# filmografia: solo cinema (cortometraggi, lungometraggi, film, docufilm, documentari): [titolo, ruolo, produzione, pagina].
# I nomi delle persone vanno scritti sempre allo stesso modo, così "Anche in…" li riconosce in tutti i lavori.
import json
DATI = json.load(open(os.path.join(HERE, 'lavori.json'), encoding='utf-8'))
WORKS, AMARCORD, FILMOGRAFIA = DATI['lavori'], DATI['amarcord'], DATI['filmografia']
HOME_WORKS, HOME_FILMO, CAT_LABELS = DATI['home'], DATI['home_filmografia'], DATI['categorie']
DYNAMIS = DATI['dynamis']  # pagina fatta a mano, ma il blocco Credits si genera da qui per avere gli "Anche in…"
PROD = 'Tiziana Lattuca per AMARCORD'
anno = lambda a: a.get('anno') or '2026'  # i corti AMARCORD senza anno sono quelli del 2026

e = lambda s: html.escape(s, quote=True)


def names(v):
    """Il nome di Karim in arancio, gli altri normali."""
    return ', '.join('<span style="color: %s">%s</span>' % (ACC, e(n)) if n == KI else e(n) for n in v.split(', ')) \
        if KI in v else e(v)


# ---- "Anche in…": per ogni persona, gli altri lavori in cui compare (Karim escluso, è in tutti) ----
def _persone(w):
    for c in w.get('cast', []):
        yield c[1], c[0] or 'nel cast'
    for ruolo, v in w.get('crew', []):
        for n in (v if isinstance(v, list) else v.split(', ')):
            yield n, ruolo.lower()

INDICE = {}
for _w in [DYNAMIS] + [w for w in WORKS if w.get('page', True)] + AMARCORD:
    for _n, _r in _persone(_w):
        if _n in (KI, PROD):  # Karim e la produzione AMARCORD sono in tutti: niente "Anche in"
            continue
        lst = INDICE.setdefault(_n, [])
        if not any(x[0] == _w['slug'] for x in lst):
            lst.append((_w['slug'], _w['t'], _r))

ALSO_A = 'font-size: 12px; letter-spacing: 0.04em; color: #9A948C'


GIA_VISTI = set()  # una persona ha il suo "anche in" solo la prima volta che compare nella pagina


def anche(nome, slug, right=False):
    """Riga discreta sotto il nome: «anche in Paranoia · La sedia +3». Al massimo due titoli, gli altri nel +N (tooltip)."""
    altri = [x for x in INDICE.get(nome, []) if x[0] != slug]
    if not altri or nome in GIA_VISTI:
        return ''
    GIA_VISTI.add(nome)
    link = lambda x: '<a href="%s" class="also" style="color: #9A948C; border-bottom: 1px solid #2A2A2A">%s</a>' % (x[0], e(x[1]))
    testo = ' · '.join(link(x) for x in altri[:2])
    if len(altri) > 2:
        resto = altri[2:]
        testo += ' <span title="%s" style="color: #6E6A64">+%d</span>' % (e(', '.join(x[1] for x in resto)), len(resto))
    return '<span style="font-size: 12px; line-height: 1.5; color: #6E6A64%s">anche in %s</span>' % ('; text-align: right' if right else '', testo)


HEAD = open(os.path.join(OUT, 'dynamis.html'), encoding='utf-8').read()
HEAD = HEAD[:HEAD.index('<section')]  # head + header della pagina Dynamis, uguali per tutti i lavori

FOOT = '''
<a href="contatti" class="next" style="display: block; border-top: 1px solid #1F1F1F">
<div style="max-width: 1440px; margin: 0 auto; padding: 72px 56px 96px; box-sizing: border-box; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 24px">
<div style="display: flex; flex-direction: column; gap: 12px">
<span style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #9A948C">Hai un progetto?</span>
<span class="nt" style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: clamp(44px, 6vw, 88px); line-height: 1">Lavoriamo insieme</span>
</div>
<span aria-hidden="true" class="arrow" style="font-size: 40px; color: #B46428">→</span>
</div>
</a>

<footer style="border-top: 1px solid #1F1F1F">
<div style="max-width: 1440px; margin: 0 auto; padding: 24px 56px 40px; box-sizing: border-box; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; font-size: 13px; color: #9A948C">
<span>© 2026 produkts.it · Karim Ismail · Altamura (BA)</span>
<a href="privacy" style="color: #9A948C">Privacy e cookie</a>
</div>
</footer>
</div>
<script src="assets/site.js"></script>
</body>
</html>
'''

KICK = 'font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: %s' % ACC


def meta_item(k, v):
    return ('<div class="reveal" style="display: flex; flex-direction: column; gap: 6px; border-top: 1px solid #1F1F1F; padding-top: 14px">\n'
            '<dt style="font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #9A948C">%s</dt>\n'
            '<dd style="margin: 0; font-size: 16px; line-height: 1.5">%s</dd>\n</div>\n') % (e(k), e(v))


def crew_row(k, v, slug):
    """Ruolo a sinistra, nomi a destra: uno per riga con il proprio "Anche in…"."""
    lista = v if isinstance(v, list) else [v]
    righe = []
    for n in lista:
        nomi = n.split(', ') if not isinstance(v, list) else [n]
        nome_html = names(n)
        extra = ''.join(anche(x, slug, True) for x in nomi)
        righe.append('<span style="font-size: 16px; overflow-wrap: anywhere">%s</span>%s' % (nome_html, extra))
    return ('<div class="crow reveal" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 14px 0; border-bottom: 1px solid #1F1F1F">\n'
            '<span style="font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; color: #9A948C; flex: none; max-width: 45%%">%s</span>\n'
            '<span style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; text-align: right; min-width: 0">%s</span>\n</div>\n') % (e(k), ''.join(righe))


def cast_row(k, v, slug):
    return ('<div class="crow reveal" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 14px 0; border-bottom: 1px solid #1F1F1F">\n'
            '<span style="display: flex; flex-direction: column; gap: 6px; min-width: 0"><span style="font-size: 16px">%s</span>%s</span>\n'
            '<span style="font-family: \'Cormorant Garamond\', serif; font-style: italic; font-size: 20px; color: #C9C4BD; text-align: right">%s</span>\n</div>\n') % (names(v), anche(v, w_slug(slug)), e(k))


w_slug = lambda s: s


def credits(w, crewlabel):
    GIA_VISTI.clear()
    cast = ''
    if w.get('cast'):
        cast = ('<div>\n<span style="display: block; %s; padding-bottom: 12px">Cast</span>\n%s</div>\n'
                % (KICK, ''.join(cast_row(c[0], c[1], w['slug']) for c in w['cast'])))
    return cast + ('<div>\n<span style="display: block; %s; padding-bottom: 12px">%s</span>\n%s</div>\n'
                   % (KICK, crewlabel, ''.join(crew_row(k, v, w['slug']) for k, v in w['crew'])))


def hero(w, url, plat):
    if w.get('img'):
        return '''<div style="position: relative; width: 100%%; aspect-ratio: 16 / 9; background: #161616; overflow: hidden">
<img class="kb" src="%(img)s" alt="Fotogramma di %(t)s" style="position: absolute; inset: 0; width: 100%%; height: 100%%; object-fit: cover">
<span aria-hidden="true" style="position: absolute; inset: 0; background: linear-gradient(rgba(8,8,8,0.35), transparent 22%%, transparent 78%%, rgba(8,8,8,0.5))"></span>
<span aria-hidden="true" class="lb" style="position: absolute; left: 0; right: 0; top: 0; background: #080808; z-index: 2"></span>
<span aria-hidden="true" class="lb lb-b" style="position: absolute; left: 0; right: 0; background: #080808; z-index: 2"></span>
<span aria-hidden="true" style="position: absolute; top: 24px; left: 24px; width: 36px; height: 36px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>
<span aria-hidden="true" style="position: absolute; bottom: 24px; right: 24px; width: 36px; height: 36px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span>
<a href="%(url)s" target="_blank" rel="noopener" aria-label="Guarda %(t)s su %(plat)s (si apre in una nuova scheda)" style="position: absolute; inset: 0; z-index: 1"></a>
</div>''' % dict(img=w['img'], t=e(w['t']), url=url, plat=plat)
    # Senza fotogramma: mirino scuro con il titolo, che porta al video
    return '''<a href="%(url)s" target="_blank" rel="noopener" aria-label="Guarda %(t)s su %(plat)s (si apre in una nuova scheda)" class="pill" style="position: relative; display: flex; align-items: center; justify-content: center; width: 100%%; aspect-ratio: 2.39 / 1; background: #0E0E0E; overflow: hidden; color: #E8E4DF">
<span aria-hidden="true" class="lb" style="position: absolute; left: 0; right: 0; top: 0; background: #080808; z-index: 2"></span>
<span aria-hidden="true" class="lb lb-b" style="position: absolute; left: 0; right: 0; background: #080808; z-index: 2"></span>
<span aria-hidden="true" style="position: absolute; top: 24px; left: 24px; width: 36px; height: 36px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>
<span aria-hidden="true" style="position: absolute; bottom: 24px; right: 24px; width: 36px; height: 36px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span>
<span aria-hidden="true" style="position: absolute; top: 28px; right: 72px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #6E6A64">%(mirino)s</span>
<span style="display: inline-flex; align-items: center; gap: 12px; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; border: 1px solid rgba(232,228,223,0.6); border-radius: 26px; height: 52px; padding: 0 26px 0 20px"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7V5z"></path></svg>Guarda su %(plat)s</span>
</a>''' % dict(t=e(w['t']), url=url, plat=plat, mirino=e(w.get('mirino') or w.get('year', '')))


def page(w):
    url, plat = ('https://vimeo.com/' + w['vimeo'], 'Vimeo') if w.get('vimeo') else ('https://www.youtube.com/watch?v=' + w['yt'], 'YouTube')
    title = w['t'] + (' — ' + w['sub'] if w.get('sub') else '')
    head = HEAD.replace('<title>Dynamis — produkts.it</title>', '<title>%s — produkts.it</title>' % e(title))
    metas = [('Il mio ruolo', w['role'])] + w['meta']
    body = '''<section style="max-width: 1440px; margin: 0 auto; padding: 24px 56px 72px; box-sizing: border-box">
<a href="lavori" style="font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; color: #9A948C; padding: 12px 0; display: inline-block; margin-bottom: 24px">← Tutti i lavori</a>
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 24px 64px; margin-bottom: 40px">
<div style="display: flex; flex-direction: column; gap: 20px; min-width: 0">
<span class="fade" style="%(kick)s">%(kicker)s</span>
<h1 style="margin: 0; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: clamp(56px, 9vw, 144px); line-height: 0.9; overflow: hidden; padding-bottom: 0.2em; margin-bottom: -0.12em; overflow-wrap: anywhere"><span class="rise" style="display: block">%(t)s</span></h1>
%(sub)s</div>
<a href="%(url)s" target="_blank" rel="noopener" class="pill fade d3" style="height: 52px; padding: 0 26px 0 20px; border-radius: 26px; border: 1px solid rgba(232,228,223,0.6); color: #E8E4DF; display: inline-flex; align-items: center; gap: 12px; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap">
<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7V5z"></path></svg>Guarda su %(plat)s <span aria-hidden="true">↗</span></a>
</div>
%(hero)s
</section>

<section style="border-top: 1px solid #1F1F1F">
<div style="max-width: 1440px; margin: 0 auto; padding: 96px 56px; box-sizing: border-box; display: flex; flex-wrap: wrap; gap: 48px 96px">
<dl style="margin: 0; flex: 1 1 360px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 32px; align-content: start">
%(meta)s</dl>
<div style="flex: 999 1 520px; display: flex; flex-direction: column; gap: 24px">
<span class="reveal" style="%(kick)s">Il progetto</span>
<p class="reveal" style="margin: 0; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: 30px; line-height: 1.35; max-width: 640px">%(line)s</p>
</div>
</div>
</section>

<section style="border-top: 1px solid #1F1F1F">
<div style="max-width: 1440px; margin: 0 auto; padding: 96px 56px; box-sizing: border-box; display: flex; flex-wrap: wrap; gap: 48px 96px">
<h2 class="reveal" style="margin: 0; flex: 1 1 240px; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: 56px; line-height: 1">Credits</h2>
<div style="flex: 999 1 640px; min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%%, 300px), 1fr)); gap: 0 48px">
%(credits)s</div>
</div>
</section>
''' % dict(kick=KICK, kicker=e(w['kicker']), t=e(w['t']), url=url, plat=plat, hero=hero(w, url, plat), line=e(w['line']),
           sub=('<p class="fade d2" style="margin: 0; font-family: \'Cormorant Garamond\', serif; font-style: italic; font-weight: 300; font-size: clamp(24px, 3vw, 36px); line-height: 1.2; color: #C9C4BD">%s</p>\n' % e(w['sub'])) if w.get('sub') else '',
           meta=''.join(meta_item(k, v) for k, v in metas), credits=credits(w, 'Troupe' if w.get('cast') else 'Crediti'))
    save(os.path.join(OUT, w['slug'] + '.html'), head + body + FOOT)


def put(fname, name, content):
    p = os.path.join(OUT, fname)
    s = open(p, encoding='utf-8').read()
    s, n = re.subn(r'(<!-- %s -->)(.*?)(<!-- /%s -->)' % (name, name), lambda m: m.group(1) + '\n' + content + m.group(3), s, flags=re.S)
    assert n == 1, (fname, name)
    save(p, s)


SENZA_COPERTINA = {'dynamis', 'schizophrenia'}  # hanno già la loro immagine: niente copertina disegnata


def copertina(w):
    """Copertina disegnata (titolo e dati sul fotogramma, da _design/copertine/) se c'è, altrimenti il fotogramma."""
    p = 'img/copertine/%s.jpg' % w['slug']
    f = os.path.join(OUT, p)
    if w['slug'] in SENZA_COPERTINA or not os.path.exists(f):
        return w['img']
    # ?v= cambia quando cambia l'immagine: i browser non mostrano la copertina vecchia rimasta in memoria
    import hashlib
    return p + '?v=' + hashlib.sha1(open(f, 'rb').read()).hexdigest()[:8]


def dati_copertine():
    """Testi delle copertine per _design/copertine/index.html: occhiello, titolo, sottotitolo e tre dati in basso."""
    out = []
    for w in WORKS:
        if w['slug'] in SENZA_COPERTINA:
            continue
        out.append(dict(slug=w['slug'], img=w['img'], kicker=w['kicker'], t=w['t'], sub=w.get('sub', ''),
                        dati=[list(w['meta'][0]), [KI, w['role_short']], ['Uscita', w['date']]]))
    for a in AMARCORD:
        out.append(dict(slug=a['slug'], img=a['img'], kicker='Cortometraggio · AMARCORD · ' + anno(a), t=a['t'], sub='',
                        dati=[['Regia', ' e '.join(dict(a['crew'])['Regia'])], [KI, a['ruolo']], ['Durata', '%d minuti' % a['min']]]))
    import json
    save(os.path.join(HERE, '..', 'copertine', 'dati.json'), json.dumps(out, ensure_ascii=False, indent=1))


def card(w, i):
    """Scheda della griglia Lavori: tipologia, fotogramma 2.39:1 con la freccia sopra, titolo e anno."""
    return '''<a href="%s" class="work stag" data-cats="%s" style="view-transition-name: w%d; display: flex; flex-direction: column; gap: 14px; animation-delay: %.2fs">
<span style="font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #B46428">%s</span>
<div class="frame" style="position: relative; aspect-ratio: 2.39 / 1; background: #161616; overflow: hidden">
<img src="%s" alt="" loading="lazy" style="position: absolute; inset: 0; width: 100%%; height: 100%%; object-fit: cover; object-position: %s">
<span aria-hidden="true" class="br br-tl" style="position: absolute; top: 12px; left: 12px; width: 16px; height: 16px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>
<span aria-hidden="true" class="br br-br" style="position: absolute; bottom: 12px; right: 12px; width: 16px; height: 16px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span>
<span aria-hidden="true" class="warr" style="position: absolute; top: 14px; right: 14px; width: 40px; height: 40px; border-radius: 50%%; border: 1px solid rgba(232,228,223,0.5); background: rgba(8,8,8,0.45); color: #E8E4DF; display: flex; align-items: center; justify-content: center; font-size: 18px">→</span>
</div>
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px">
<h2 style="margin: 0; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 28px; line-height: 1.15; min-width: 0">%s</h2>
<span style="font-size: 13px; color: #9A948C; white-space: nowrap">%s</span>
</div>
</a>
''' % (w['slug'], '|'.join(w['cats']), i, 0.4 + i * 0.06, e(w['cats'][0]), copertina(w), w.get('pos', '50% 50%'), e(w['t']), w['year'])


def griglia():
    """Tutti i lavori in un'unica griglia, dal più recente; a parità di anno prima i lavori (Dynamis), poi i corti AMARCORD."""
    am = [dict(slug=a['slug'], t=a['t'], year=anno(a), img=a['img'], cats=['Cortometraggio', 'AMARCORD']) for a in AMARCORD]
    return sorted(WORKS + am, key=lambda w: w['year'], reverse=True)  # sorted è stabile: l'ordine dei dati resta tra pari anno


def tab(c, label):
    on = c == 'Tutti'
    tutti = griglia()
    n = len(tutti) if on else sum(c in w['cats'] for w in tutti)
    return ('<button type="button" data-act="cat:%s" aria-pressed="%s" style="background: transparent; border: 0; border-bottom: 1px solid %s; color: %s; padding: 12px 0; font-family: \'Space Grotesk\', sans-serif; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer">%s <sup style="font-size: 10px; color: #6E6A64">%d</sup></button>\n'
            % (c, 'true' if on else 'false', ACC if on else 'transparent', '#E8E4DF' if on else '#9A948C', e(label), n))


def home_card(w, i):
    return '''<a href="%s" class="work reveal" style="display: flex; flex-direction: column; gap: 20px">
<div class="frame" style="position: relative; aspect-ratio: 2.39 / 1; background: #161616; display: flex; align-items: center; justify-content: center; overflow: hidden">
<img src="%s" alt="" loading="lazy" style="position: absolute; inset: 0; width: 100%%; height: 100%%; object-fit: cover; object-position: %s">
<span aria-hidden="true" class="br br-tl" style="position: absolute; top: 14px; left: 14px; width: 18px; height: 18px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>
<span aria-hidden="true" class="br br-br" style="position: absolute; bottom: 14px; right: 14px; width: 18px; height: 18px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span>
</div>
<div style="display: flex; justify-content: space-between; gap: 24px; align-items: baseline">
<div style="display: flex; gap: 20px; align-items: baseline">
<span style="font-size: 12px; color: #B46428; letter-spacing: 0.1em">%02d</span>
<h3 style="margin: 0; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 34px; line-height: 1.1">%s</h3>
</div>
<span style="font-size: 13px; color: #9A948C; white-space: nowrap">%s</span>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 6px 24px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #9A948C; padding-left: 40px">
<span>%s</span><span>%s</span>
</div>
</a>
''' % (w['slug'], copertina(w), w.get('pos', '50% 50%'), i + 1, e(w['t']), w['year'],
       e(w.get('home_kind') or w['kicker'].rsplit(' · ', 1)[0]), e(w.get('home_role') or w['role_short']))


def amarcord_page(a):
    w = dict(a, kicker='Cortometraggio · AMARCORD · ' + anno(a), role=a['ruolo'], mirino='AMARCORD · ' + anno(a),
             meta=[('Regia', ', '.join(dict(a['crew'])['Regia'])), ('Produzione', PROD)]
                  + ([('Genere', a['gen'])] if a.get('gen') else []) + [('Durata', '%d minuti' % a['min']), ('Anno', anno(a) + ' · Vimeo')])
    page(w)


def amarcord_card(a, i):
    """Come le schede dei lavori: fotogramma 2.39:1, titolo, regia e il ruolo di Karim."""
    kick = ' · '.join(x for x in [a.get('gen') or 'Cortometraggio', '%d min' % a['min']] if x)
    regia = ' e '.join(dict(a['crew'])['Regia'])
    return '''<a href="%s" class="work reveal" style="display: flex; flex-direction: column; gap: 16px">
<div class="frame" style="position: relative; aspect-ratio: 2.39 / 1; background: #161616; overflow: hidden">
<img src="%s" alt="" loading="lazy" style="position: absolute; inset: 0; width: 100%%; height: 100%%; object-fit: cover">
<span aria-hidden="true" class="br br-tl" style="position: absolute; top: 12px; left: 12px; width: 16px; height: 16px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>
<span aria-hidden="true" class="br br-br" style="position: absolute; bottom: 12px; right: 12px; width: 16px; height: 16px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span>
</div>
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px">
<h3 style="margin: 0; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 28px; line-height: 1.15">%s <span aria-hidden="true" class="arr" style="color: #B46428">→</span></h3>
<span style="font-size: 13px; color: #9A948C; white-space: nowrap">%s</span>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 4px 20px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #9A948C">
<span style="color: %s">%s</span><span>Regia di %s</span>
</div>
</a>
''' % (a['slug'], a['img'], e(a['t']), e(kick), ACC, e(a['ruolo']), e(regia))


def amarcord_section():
    return ('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%%, 360px), 1fr)); gap: 56px 32px">\n%s</div>\n'
            % ''.join(amarcord_card(a, i) for i, a in enumerate(AMARCORD)))


def filmo_row(t, role, prod, href, cls, cols, fs, pad):
    title = '<span style="font-family: \'Cormorant Garamond\', serif; font-style: italic; font-size: %dpx">%s</span>' % (fs, e(t))
    if href:
        title = '<a href="%s" style="font-family: \'Cormorant Garamond\', serif; font-style: italic; font-size: %dpx">%s <span aria-hidden="true" style="color: #B46428">→</span></a>' % (href, fs, e(t))
    return ('<div class="%s" style="display: grid; grid-template-columns: %s; gap: 16px; padding: %s 0; border-bottom: 1px solid #1F1F1F; align-items: baseline">\n'
            '%s\n<span style="font-size: 14px; color: #C9C4BD">%s</span>\n<span style="font-size: 13px; color: #9A948C; text-align: right">%s</span>\n</div>\n') % (cls, cols, pad, title, e(role), e(prod))


for w in WORKS:
    if w.get('page', True):
        page(w)
        print('ok', w['slug'] + '.html')
for a in AMARCORD:
    amarcord_page(a)
    print('ok', a['slug'] + '.html')
put('dynamis.html', 'dynamis:credits', credits(DYNAMIS, 'Troupe'))
put('lavori.html', 'lavori:tabs', ''.join(tab(c, l) for c, l in CAT_LABELS if c == 'Tutti' or any(c in w['cats'] for w in griglia())))
put('lavori.html', 'lavori:griglia', ''.join(card(w, i) for i, w in enumerate(griglia())))
s = open(os.path.join(OUT, 'lavori.html'), encoding='utf-8').read()
s = re.sub(r'<span data-count>\d+</span>', '<span data-count>%d</span>' % len(griglia()), s)
save(os.path.join(OUT, 'lavori.html'), s)
bys = {w['slug']: w for w in WORKS}
put('index.html', 'home:lavori', ''.join(home_card(bys[s], i) for i, s in enumerate(HOME_WORKS)))
put('index.html', 'home:filmografia', ''.join(filmo_row(*f, 'reveal', 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 0.8fr)', 26, '20px') for f in FILMOGRAFIA[:HOME_FILMO]))
put('chi-sono.html', 'chisono:filmografia', ''.join(filmo_row(*f, 'row reveal', 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 0.7fr)', 24, '18px') for f in FILMOGRAFIA))
dati_copertine()
print('ok elenchi')
