"""Versione inglese del sito (cartella en/): copia le pagine italiane, le traduce con il dizionario en.json e sistema i link.
Le pagine italiane restano la fonte: ogni volta che cambiano (a mano, da lavori.py o dal pannello) si rigenera anche l'inglese.
Lanciato da build.py prima di seo.py (che aggiunge canonical, hreflang e sitemap anche per en/).

Dizionario _design/bozza/en.json:
  "testi":  testo italiano (spazi normalizzati) → inglese; vale per i testi tra i tag e per alt, title, aria-label, placeholder
  "script": stringhe tra virgolette dentro gli <script> delle pagine → inglese (solo quelle elencate)
I testi senza traduzione restano in italiano e vengono elencati in _design/bozza/en-mancanti.txt (da tradurre e aggiungere).
"""
import html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..'))
EN_DIR = os.path.join(REPO, 'en')

# pagina italiana → pagina inglese (nome del file senza .html); le pagine dei lavori tengono lo stesso nome
PAGINE = {'index': 'index', 'lavori': 'work', 'chi-sono': 'about', 'recensioni': 'reviews', 'contatti': 'contact',
          'privacy': 'privacy', 'dynamis': 'dynamis', '404': '404'}
_d = json.load(open(os.path.join(HERE, 'lavori.json'), encoding='utf-8'))
for _w in _d['lavori']:
    if _w.get('page', True):
        PAGINE.setdefault(_w['slug'], _w['slug'])
for _a in _d['amarcord']:
    PAGINE.setdefault(_a['slug'], _a['slug'])

DIZ = json.load(open(os.path.join(HERE, 'en.json'), encoding='utf-8'))
TESTI, SCRIPT = DIZ['testi'], DIZ.get('script', {})
TESTI_MIN = {k.lower(): v for k, v in TESTI.items()}

# Titoli dei lavori e nomi (persone e personaggi): restano come sono
TITOLI = {w['t'].lower() for w in _d['lavori'] + _d['amarcord']} | {'cuori in stand-by'}
NOMI = set()
for _w in _d['lavori'] + _d['amarcord'] + [_d['dynamis']]:
    for _c in _w.get('cast', []):
        NOMI.update(x for x in _c[:2] if isinstance(x, str))
    for _c in _w.get('crew', []):
        NOMI.update(_c[1] if isinstance(_c[1], list) else re.split(r',\s*', _c[1]))
NOMI = {n.strip().lower() for n in NOMI if n and n.strip()}

MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
RE_DATA = re.compile(r'\b(\d{1,2} )?(%s)( \d{4})?\b' % '|'.join(MESI), re.I)


def data_en(s):
    return RE_DATA.sub(lambda m: (m.group(1) or '') + MONTHS[MESI.index(m.group(2).lower())] + (m.group(3) or ''), s)


# Testi che seguono uno schema (dati dei lavori): tradotti a pezzi
PEZZI = [(re.compile(p), r) for p, r in [
    (r'^(\d+) minuti$', r'\1 minutes'), (r'^(\d+) minuto$', r'\1 minute'), (r'^(\d+) video$', r'\1 videos'),
    (r'^In (\d+) video$', r'In \1 videos'), (r'^Guarda tutte \((\d+)\)$', r'See all (\1)'),
]]


def norm(t):
    t = html.unescape(t)
    righe = [re.sub(r'[ \t\r\f\v ]+', ' ', r).strip() for r in t.split('\n')]
    return '\n'.join(r for r in righe if r).strip()


def ha_parole(k):
    return re.search(r'[A-Za-zÀ-ÿ]{2,}', k) is not None


def nome_proprio(k):
    """Nomi di persone, titoli, sigle: due o più parole tutte maiuscole all'inizio, numeri, sigle → uguali in inglese."""
    parole = re.findall(r"[A-Za-zÀ-ÿ'’.]+", k)
    if not parole:
        return True
    if all(p[0].isupper() or p.lower() in ('di', 'de', 'del', 'della', 'e', '&', 'per', 'la', 'il', 'lo', 'le', 'van', 'von', 'da')
           for p in parole) and len(parole) >= 2:
        return True
    return False


mancanti = {}
TIPI = {'cortometraggio amarcord': 'AMARCORD short film', 'cortometraggio': 'short film', 'videoclip': 'music video',
        'evento': 'event', 'video aziendale': 'corporate video', 'docufilm': 'docufilm', 'opera personale': 'personal work'}


def resta(k):
    """Testi che non si traducono: titoli, nomi, elenchi di titoli, numeri e sigle."""
    kl = k.lower()
    if kl in TITOLI or kl in NOMI:
        return True
    parti = [p.strip() for p in re.split(r',\s*', kl) if p.strip()]
    if parti and all(p in TITOLI or p in NOMI or re.fullmatch(r'\+\d+', p) for p in parti):
        return True
    if re.fullmatch(r"[A-ZÀ-Ý][a-zà-ÿ]+(?: [A-ZÀ-Ý][a-zà-ÿ]+)? [A-ZÀ-Ý][a-zà-ÿ]{0,3}\.", k):  # firme delle recensioni: "Pietro G."
        return True
    return False


def cerca(k):
    """Traduzione di un testo (già normalizzato), oppure None."""
    if k in TESTI:
        return TESTI[k]
    if k.lower() in TESTI_MIN:
        return TESTI_MIN[k.lower()]
    if resta(k):
        return '='
    for re_, r in PEZZI:
        if re_.match(k):
            return re_.sub(r, k)
    if RE_DATA.search(k) and not RE_DATA.sub('', k).strip(' ·,–-0123456789'):
        return data_en(k)  # solo una data ("12 novembre 2024", "Novembre 2024")
    m = re.match(r'^Ultimo aggiornamento: (.+)$', k)  # privacy: la data cambia a ogni revisione
    if m:
        return 'Last updated: %s · The Italian version is the legally binding one.' % data_en(m.group(1))
    m = re.match(r'^Guarda (.+) su (YouTube|Vimeo|Instagram) \(si apre in una nuova scheda\)$', k)
    if m:
        return 'Watch %s on %s (opens in a new tab)' % (m.group(1), m.group(2))
    m = re.match(r'^Fotogramma di (.+)$', k)
    if m and resta(m.group(1)):
        return 'Still from ' + m.group(1)
    m = re.match(r'^(.+) — Karim Ismail, (.+) \| produkts\.it$', k)
    if m:
        r = cerca(m.group(2))
        if r and r != '=':
            return '%s — Karim Ismail, %s | produkts.it' % (m.group(1), r[0].lower() + r[1:] if not r[:2].isupper() else r)
    m = re.match(r'^(.+), (%s) (\d{4}) — Karim Ismail$' % '|'.join(TIPI), k, re.I)
    if m:
        return '%s, %s %s — Karim Ismail' % (m.group(1), TIPI[m.group(2).lower()], m.group(3))
    if ' · ' in k:  # occhielli e righe di dati: "Video evento · 2024", "Cortometraggio · 9:16 · 10 min · 2026"
        out = []
        for p in k.split(' · '):
            if not ha_parole(p) or resta(p):
                out.append(p)
                continue
            r = cerca(p)
            if r is None:
                return None
            out.append(p if r == '=' else r)
        return ' · '.join(out)
    return None


def traduci(t, pagina, attr=False):
    k = norm(t)
    if not k or not ha_parole(k):
        return t
    en = cerca(k)
    if en is None:
        mancanti.setdefault(k, set()).add(pagina)
        return t
    if en == '=':
        return t
    pre = t[:len(t) - len(t.lstrip())]
    post = t[len(t.rstrip()):]
    return pre + (html.escape(en, quote=attr)) + post


ASSET = re.compile(r'\.(jpe?g|png|svg|webp|gif|css|js|json|pdf|vcf|mp4|webm|ico|webmanifest|xml|txt)(\?|#|$)', re.I)


def link(u, pagina):
    """Link di una pagina inglese: pagine tradotte → nome inglese (stessa cartella en/), il resto → indirizzo assoluto."""
    if re.match(r'^(https?:|mailto:|tel:|#|data:|javascript:|//)', u) or not u:
        return u
    m = re.match(r'^([^?#]*)(.*)$', u)
    path, resto = m.group(1), m.group(2)
    assoluto = path.startswith('/')
    p = path.lstrip('/')
    if p.endswith('.html'):
        p = p[:-5]
    if p in ('', './', '.', 'index'):
        return ('/en/' if assoluto else './') + resto
    if p in PAGINE and not ASSET.search(path):
        return ('/en/' if assoluto else '') + (PAGINE[p] if PAGINE[p] != 'index' else '') + resto
    return path + resto if assoluto else '/' + path + resto


def traduci_markup(s, pagina):
    # le <option> senza value mandano il testo: resta il valore italiano (lo leggono i moduli e il pannello)
    s = re.sub(r'<option>([^<]*)</option>', lambda m: '<option value="%s">%s</option>' % (m.group(1).replace('"', '&quot;'), m.group(1)), s)
    s = re.sub(r'(\s(?:href|src|poster|srcset|action)=")([^"]*)(")', lambda m: m.group(1) + (
        ', '.join(link(x.strip().split(' ')[0], pagina) + (' ' + ' '.join(x.strip().split(' ')[1:]) if ' ' in x.strip() else '')
                  for x in m.group(2).split(',')) if m.group(1).strip().startswith('srcset') else link(m.group(2), pagina)) + m.group(3), s)
    s = re.sub(r'(\s(?:alt|title|aria-label|placeholder|data-pv)=")([^"]*)(")', lambda m: m.group(1) + traduci(m.group(2), pagina, True) + m.group(3), s)
    s = re.sub(r'>([^<>]+)<', lambda m: '>' + traduci(m.group(1), pagina) + '<', s)
    return s


def traduci_script(s, pagina):
    for it, en in SCRIPT.items():
        s = s.replace(it, en)
    return s


def pagina_en(nome_it):
    s = open(os.path.join(REPO, nome_it + '.html'), encoding='utf-8').read()
    s = s.replace('<html lang="it">', '<html lang="en">', 1)
    s = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', s, flags=re.S)  # lo rimette seo.py, in inglese
    pezzi = re.split(r'(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<!--.*?-->)', s, flags=re.S)
    out = []
    for i, p in enumerate(pezzi):
        if i % 2:
            if p.startswith('<script') and 'application/ld+json' not in p:
                tag_fine = p.index('>') + 1
                p = traduci_markup(p[:tag_fine], nome_it) + traduci_script(p[tag_fine:], nome_it)
            out.append(p)
        else:
            out.append(traduci_markup(p, nome_it))
    s = ''.join(out)
    for it, en in DIZ.get('grezzo', {}).items():  # sostituzioni nel codice della pagina (es. testo precompilato di WhatsApp)
        s = s.replace(it, en)
    return s


def salva(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    vecchio = open(path, encoding='utf-8').read() if os.path.exists(path) else None
    if vecchio != text:
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)


fatte = 0
for it, en in PAGINE.items():
    if not os.path.exists(os.path.join(REPO, it + '.html')):
        continue
    salva(os.path.join(EN_DIR, en + '.html'), pagina_en(it))
    fatte += 1
# pagine inglesi che non esistono più (lavoro cancellato)
for f in os.listdir(EN_DIR):
    if f.endswith('.html') and f[:-5] not in PAGINE.values():
        os.remove(os.path.join(EN_DIR, f))

with open(os.path.join(HERE, 'en-mancanti.txt'), 'w', encoding='utf-8', newline='\n') as f:
    for k in sorted(mancanti, key=lambda k: (sorted(mancanti[k])[0], k)):
        f.write(json.dumps(k, ensure_ascii=False) + '\t' + ', '.join(sorted(mancanti[k])) + '\n')
print('inglese', fatte, 'pagine,', len(mancanti), 'testi senza traduzione' + (' (vedi _design/bozza/en-mancanti.txt)' if mancanti else ''))
