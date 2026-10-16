"""Lavori della bozza: un unico elenco da cui si generano
- le pagine dei lavori semplici (bozza/<slug>.html; Dynamis ha una pagina fatta a mano e qui non viene rigenerata),
- la griglia e i filtri di bozza/lavori.html,
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
OUT = os.path.join(HERE, '..', '..', 'bozza')
ACC = '#B46428'
KI = 'Karim Ismail'


def yt_thumb(vid, size='maxresdefault'):
    return 'https://i.ytimg.com/vi/%s/%s.jpg' % (vid, size)


# Dal più recente. 'cats' decide i filtri di Lavori; 'page': False = pagina fatta a mano.
WORKS = [
    dict(slug='dynamis', page=False, t='Dynamis', year='2026', img='../dynamis.jpg', pos='50% 35%',
         cats=['Cortometraggio', 'Opera personale'], role_short='Produttore e D.O.P. · VerticalMovie 2026',
         home_kind='Corto verticale · VerticalMovie 2026', home_role='Produzione e fotografia'),
    dict(slug='schizophrenia', t='Schizophrenia', sub='Io e Nessun Altro', year='2025', date='10 maggio 2025',
         yt='yAJK1VXfAm0', img=yt_thumb('yAJK1VXfAm0'), cats=['Cortometraggio', 'Opera personale'],
         kicker='Cortometraggio · opera personale · 2025',
         line='Un cortometraggio introspettivo sul silenzio, sul tempo e sul confine sottile tra dentro e fuori. Una notte sospesa, tra realtà e percezione.',
         role='Regia, produzione, sceneggiatura, fotografia, montaggio e sound design',
         role_short='Regia, fotografia e montaggio',
         meta=[('Produzione', 'produkts.it'), ('Interprete', 'Gianni Lorusso'), ('Uscita', '10 maggio 2025 · YouTube')],
         cast=[('Unico interprete', 'Gianni Lorusso', ('dynamis', 'Anche in Dynamis, nel ruolo di Mattia'))],
         crew=[('Regia', KI), ('Produzione', KI), ('Sceneggiatura', KI + ', Donatella Loviglio'),
               ('Direzione della fotografia', KI), ('Operatore', KI), ('Montaggio', KI), ('Sound design', KI),
               ('Fonico di doppiaggio', KI), ('Costumi', 'Gianni Lorusso, Donatella Loviglio'), ('Assistente', 'Gianni Lorusso'),
               ('Colonna sonora', '“Schizophrenia” – XXXTENTACION'),
               ('Effetti sonori', 'Pixabay: freesound_community, LIECIO, BRVHRTZ, ABD3LHADI, sachintempini, baranova_n, FreeSoundsxx')]),
    dict(slug='romance-anonimo', t='Romance Anónimo', sub='Bartek Dabrowski', year='2025', date='25 aprile 2025',
         yt='z0G1CfqjHxI', img=yt_thumb('z0G1CfqjHxI', 'sddefault'), cats=['Videoclip'],
         kicker='Videoclip musicale · 2025',
         line='Videoclip per Bartek Dabrowski su «Romance Anónimo», classico senza tempo della chitarra spagnola.',
         role='Direzione della fotografia, riprese, montaggio, color e VFX', role_short='D.O.P., montaggio e color',
         meta=[('Artista', 'Bartek Dabrowski'), ('Uscita', '25 aprile 2025 · YouTube')],
         crew=[('Artista', 'Bartek Dabrowski'), ('Direzione della fotografia', KI), ('Riprese', KI), ('Montaggio', KI),
               ('Color', KI), ('VFX', KI)]),
    dict(slug='coseco', t='Coseco Industrie', sub='50 anni', year='2024', date='18 dicembre 2024',
         yt='mpesKIpv9N8', img=yt_thumb('mpesKIpv9N8'), cats=['Video aziendale'],
         kicker='Video aziendale · 2024',
         line='Video corporate per i 50 anni di Coseco Industrie, proiettato al cinema durante la celebrazione. Produzione kontents.eu.',
         role='Riprese, montaggio, post-produzione, color, VFX e audio', role_short='Riprese e post-produzione',
         meta=[('Produzione', 'kontents.eu'), ('Cliente', 'Coseco Industrie'), ('Uscita', '18 dicembre 2024 · YouTube')],
         crew=[('Produzione', 'kontents.eu'), ('Riprese', 'Gianni Ragone, ' + KI), ('Montaggio', 'Gianni Ragone, ' + KI),
               ('Post-produzione', KI), ('Color', KI), ('VFX', KI), ('Effetti sonori', KI), ('Audio design', KI),
               ('Fonico di presa diretta', KI)]),
    dict(slug='wake-up', t='Wake Up', sub='Bartek Dabrowski · Orchestra', year='2024', date='29 marzo 2024',
         yt='MZFk-CNkgGY', img=yt_thumb('MZFk-CNkgGY'), cats=['Videoclip'],
         kicker='Videoclip musicale · 2024',
         line='Videoclip per la versione orchestrale di «Wake Up» di Bartek Dabrowski: un invito ad ascoltare la propria voce interiore.',
         role='Direzione della fotografia, riprese, montaggio, color e VFX', role_short='D.O.P., montaggio e color',
         meta=[('Artista', 'Bartek Dabrowski'), ('Uscita', '29 marzo 2024 · YouTube')],
         crew=[('Artista', 'Bartek Dabrowski'), ('Direzione della fotografia', KI), ('Riprese', KI), ('Montaggio', KI),
               ('Color', KI), ('VFX', KI)]),
    dict(slug='korvo', t='Hai perso', sub='Korvo', year='2023', date='giugno 2023',
         vimeo='888211568', img='https://i.vimeocdn.com/video/1827512944-964bac90703858cc9e174129dd46cb4674a3071036ff2f2ba992aea82ef1e2e4-d_1280', cats=['Videoclip'],
         kicker='Videoclip musicale · 2023',
         line="Videoclip di «Hai perso» per Korvo, curato dall'idea alla consegna: regia, riprese, montaggio e color.",
         role='Regia, direzione della fotografia, riprese, montaggio e color', role_short='Regia, D.O.P., montaggio e color',
         meta=[('Artista', 'Korvo'), ('Uscita', 'Giugno 2023 · Vimeo')],
         crew=[('Artista e musica', 'Korvo'), ('Regia', KI), ('Direzione della fotografia', KI), ('Riprese', KI),
               ('Montaggio', KI), ('Color', KI)]),
    dict(slug='troppo-bella-per-loro', t='Troppo bella per loro', sub='Docufilm in dialetto altamurano', year='2022', date='marzo 2022',
         vimeo='888136670', img='https://i.vimeocdn.com/video/1827511993-0288a826b6a4dc1d324bb6c9738bd7aaea47b4e3dfbdd5ce144f1d0b21b95b31-d_1280',
         cats=['Cortometraggio', 'Opera personale'], kicker='Docufilm · opera personale · 2022',
         line="Un docufilm in dialetto altamurano sul rapporto di amore e odio tra l'uomo e la natura.",
         role='Regia, riprese e montaggio, con Fabrizio Marinelli', role_short='Regia, riprese e montaggio',
         meta=[('Produzione', 'produkts.it'), ('Lingua', 'Dialetto altamurano'), ('Uscita', 'Marzo 2022 · Vimeo')],
         cast=[('Protagonista', 'Paolo Cappiello', None)],
         crew=[('Video', KI + ', Fabrizio Marinelli'), ('Montaggio', KI + ', Fabrizio Marinelli'), ('Produzione', 'produkts.it')]),
]
CAT_LABELS = [('Tutti', 'Tutti'), ('Cortometraggio', 'Cortometraggi'), ('Videoclip', 'Videoclip'),
              ('Video aziendale', 'Video aziendali'), ('Opera personale', 'Opere personali')]
HOME_WORKS = ['dynamis', 'schizophrenia', 'coseco', 'wake-up']

# Filmografia: solo cinema (cortometraggi, lungometraggi, film, docufilm, documentari). Niente videoclip, social, corporate.
# Titolo, ruolo, produzione, pagina (se c'è)
FILMOGRAFIA = [
    ('Dynamis', 'Produttore, D.O.P., montaggio, color, VFX', 'produkts.it', 'dynamis'),
    ('Tra i Piedi', 'Direttore della fotografia', 'AMARCORD', None),
    ("L'Inventario", 'Co-D.O.P.', 'AMARCORD', None),
    ('Schizophrenia — Io e Nessun Altro', 'Regia e fotografia', 'produkts.it', 'schizophrenia'),
    ('Troppo bella per loro', 'Docufilm · regia, riprese e montaggio', 'produkts.it', 'troppo-bella-per-loro'),
    ('Sbaglio Dunque Esisto', 'Operatore, 1ª camera', 'AMARCORD', None),
    ('La Seduta', 'Operatore', 'AMARCORD', None),
    ('Paranoia', 'Operatore, 2ª camera', 'AMARCORD', None),
    ('Cuori in Stand-by', 'Assistente operatore, 2ª camera', 'AMARCORD', None),
    ('Parfum', 'Assistente operatore', 'AMARCORD', None),
    ('La Sedia', 'Assistente operatore', 'AMARCORD', None),
    ("Spaghetti all'Assassina", 'Assistente operatore', 'AMARCORD', None),
    ('Il Tanga e la Cravatta', 'Fonico', 'AMARCORD', None),
]
HOME_FILMO = 10

# Corti di AMARCORD (Accademia Mediterranea del Cinema), 2026: schede che portano a Vimeo, senza pagina propria.
# Niente sinossi (no spoiler): solo genere, sceneggiatura e una riga di atmosfera. 'ruolo' vuoto = da chiedere a Karim.
AMARCORD = [
    dict(t='Paranoia', gen='Dramma psicologico', scrive='Miriana Mastronardi', ruolo='Operatore, 2ª camera', min=7,
         vimeo='1220653465/634fa7dd97', line='Un campus, un sospetto, una voce che non smette di suggerire.'),
    dict(t='Sbaglio dunque esisto', gen='Dramma psicologico', scrive='Mariachiara Monaco', ruolo='Operatore, 1ª camera', min=6,
         vimeo='1220653421/520923c76a', line='Una terapia sperimentale, una stanza chiusa e un viaggio dentro i ricordi.'),
    dict(t='Parfum', gen='Commedia romantica', scrive='Noemi Lorusso', ruolo='Assistente operatore', min=6,
         vimeo='1220653459/be50961eb1', line='Un primo appuntamento tra gli scaffali di una libreria, una paura da nascondere e troppi campioncini di profumo.'),
    dict(t='La sedia', gen='Dramma psicologico', scrive='Noemi Lorusso', ruolo='Assistente operatore', min=6,
         vimeo='1205077119/8e1ac4d587', line='Una ragazza che non regge il contatto, una sedia davanti a lei e tutto quello che non ha mai detto.'),
    dict(t='Verità e distorsione', gen='Commedia', scrive='Mariachiara Monaco', ruolo='', min=7,
         vimeo='1205096912/9477749d7c', line='Notte fonda in un appartamento di studenti: un coinquilino è sicuro che qualcuno sia entrato.'),
    dict(t='La seduta', es=True, ruolo='Operatore', min=8, vimeo='1198757832/ba4f3c4cf7'),
    dict(t="L'inventario", es=True, ruolo='Co-D.O.P.', min=5, vimeo='1205074164/052af8153b'),
    dict(t='Il tanga e la cravatta', es=True, ruolo='Fonico', min=5, vimeo='1205098451/48cd24e2f4'),
    dict(t='Troppo per poco', es=True, ruolo='', min=6, vimeo='1195193265/0f7b18a157'),
]
# Filmografia: i titoli con un corto su Vimeo diventano link
VIMEO_FILMO = {a['t'].lower(): 'https://vimeo.com/' + a['vimeo'] for a in AMARCORD}

e = lambda s: html.escape(s, quote=True)


def names(v):
    """Il nome di Karim in arancio, gli altri normali."""
    return ', '.join('<span style="color: %s">%s</span>' % (ACC, e(n)) if n == KI else e(n) for n in v.split(', ')) \
        if KI in v else e(v)


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


def crew_row(k, v):
    return ('<div class="crow reveal" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 14px 0; border-bottom: 1px solid #1F1F1F">\n'
            '<span style="font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; color: #9A948C; flex: none; max-width: 45%%">%s</span>\n'
            '<span style="font-size: 16px; text-align: right; min-width: 0; overflow-wrap: anywhere">%s</span>\n</div>\n') % (e(k), names(v))


def cast_row(k, v, also):
    link = ''
    if also:
        link = ('<a href="%s" class="also" style="font-size: 12px; letter-spacing: 0.04em; color: #9A948C; display: inline-flex; align-items: center; gap: 8px">'
                '<span aria-hidden="true" style="width: 6px; height: 6px; border-radius: 50%%; background: %s; flex: none"></span>%s</a>') % (also[0], ACC, e(also[1]))
    return ('<div class="crow reveal" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 14px 0; border-bottom: 1px solid #1F1F1F">\n'
            '<span style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 16px">%s</span>%s</span>\n'
            '<span style="font-family: \'Cormorant Garamond\', serif; font-style: italic; font-size: 20px; color: #C9C4BD">%s</span>\n</div>\n') % (e(v), link, e(k))


def page(w):
    url, plat = ('https://vimeo.com/' + w['vimeo'], 'Vimeo') if w.get('vimeo') else ('https://www.youtube.com/watch?v=' + w['yt'], 'YouTube')
    title = w['t'] + (' — ' + w['sub'] if w.get('sub') else '')
    head = HEAD.replace('<title>Dynamis — produkts.it</title>', '<title>%s — produkts.it</title>' % e(title))
    metas = [('Il mio ruolo', w['role'])] + w['meta']
    cast = ''
    if w.get('cast'):
        cast = ('<div>\n<span style="display: block; %s; padding-bottom: 12px">Cast</span>\n%s</div>\n'
                % (KICK, ''.join(cast_row(*c) for c in w['cast'])))
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
<div style="position: relative; width: 100%%; aspect-ratio: 16 / 9; background: #161616; overflow: hidden">
<img class="kb" src="%(img)s" alt="Fotogramma di %(t)s" style="position: absolute; inset: 0; width: 100%%; height: 100%%; object-fit: cover">
<span aria-hidden="true" style="position: absolute; inset: 0; background: linear-gradient(rgba(8,8,8,0.35), transparent 22%%, transparent 78%%, rgba(8,8,8,0.5))"></span>
<span aria-hidden="true" class="lb" style="position: absolute; left: 0; right: 0; top: 0; background: #080808; z-index: 2"></span>
<span aria-hidden="true" class="lb lb-b" style="position: absolute; left: 0; right: 0; background: #080808; z-index: 2"></span>
<span aria-hidden="true" style="position: absolute; top: 24px; left: 24px; width: 36px; height: 36px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>
<span aria-hidden="true" style="position: absolute; bottom: 24px; right: 24px; width: 36px; height: 36px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span>
<a href="%(url)s" target="_blank" rel="noopener" aria-label="Guarda %(t)s su %(plat)s (si apre in una nuova scheda)" style="position: absolute; inset: 0; z-index: 1"></a>
</div>
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
%(cast)s<div>
<span style="display: block; %(kick)s; padding-bottom: 12px">%(crewlabel)s</span>
%(crew)s</div>
</div>
</div>
</section>
''' % dict(kick=KICK, kicker=e(w['kicker']), t=e(w['t']), url=url, plat=plat, img=w['img'], line=e(w['line']),
           sub=('<p class="fade d2" style="margin: 0; font-family: \'Cormorant Garamond\', serif; font-style: italic; font-weight: 300; font-size: clamp(24px, 3vw, 36px); line-height: 1.2; color: #C9C4BD">%s</p>\n' % e(w['sub'])) if w.get('sub') else '',
           meta=''.join(meta_item(k, v) for k, v in metas), cast=cast, crewlabel='Troupe' if w.get('cast') else 'Crediti',
           crew=''.join(crew_row(k, v) for k, v in w['crew']))
    save(os.path.join(OUT, w['slug'] + '.html'), head + body + FOOT)


def put(fname, name, content):
    p = os.path.join(OUT, fname)
    s = open(p, encoding='utf-8').read()
    s, n = re.subn(r'(<!-- %s -->)(.*?)(<!-- /%s -->)' % (name, name), lambda m: m.group(1) + '\n' + content + m.group(3), s, flags=re.S)
    assert n == 1, (fname, name)
    save(p, s)


def card(w, i):
    kind = ' · '.join(w['cats'])
    return '''<a href="%s" class="work stag" data-cats="%s" style="view-transition-name: w%d; display: flex; flex-direction: column; gap: 16px; animation-delay: %.2fs">
<div class="frame" style="position: relative; aspect-ratio: 2.39 / 1; background: #161616; display: flex; align-items: center; justify-content: center; overflow: hidden">
<img src="%s" alt="" loading="lazy" style="position: absolute; inset: 0; width: 100%%; height: 100%%; object-fit: cover; object-position: %s">
<span aria-hidden="true" class="br br-tl" style="position: absolute; top: 12px; left: 12px; width: 16px; height: 16px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>
<span aria-hidden="true" class="br br-br" style="position: absolute; bottom: 12px; right: 12px; width: 16px; height: 16px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span>
</div>
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px">
<h2 style="margin: 0; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 28px; line-height: 1.15">%s <span aria-hidden="true" class="arr" style="color: #B46428">→</span></h2>
<span style="font-size: 13px; color: #9A948C; white-space: nowrap">%s</span>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 4px 20px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #9A948C">
<span style="color: #B46428">%s</span><span>%s</span>
</div>
</a>
''' % (w['slug'], '|'.join(w['cats']), i, 0.4 + i * 0.08, w['img'], w.get('pos', '50% 50%'),
       e(w['t'] + (' — ' + w['sub'] if w.get('sub') else '')), w['year'], e(kind), e(w['role_short']))


def tab(c, label):
    on = c == 'Tutti'
    n = len(WORKS) if on else sum(c in w['cats'] for w in WORKS)
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
''' % (w['slug'], w['img'], w.get('pos', '50% 50%'), i + 1, e(w['t']), w['year'],
       e(w.get('home_kind') or w['kicker'].rsplit(' · ', 1)[0]), e(w.get('home_role') or w['role_short']))


def amarcord_card(a, i):
    kick = ' · '.join(x for x in ['Esercitazione' if a.get('es') else a['gen'], '%d min' % a['min']] if x)
    line = ('<p style="margin: 0; font-family: \'Cormorant Garamond\', serif; font-style: italic; font-weight: 300; font-size: 22px; line-height: 1.35; color: #C9C4BD">%s</p>\n' % e(a['line'])) if a.get('line') else ''
    scrive = ('<span style="font-size: 13px; color: #9A948C">Scritto da %s</span>\n' % e(a['scrive'])) if a.get('scrive') else ''
    ruolo = ('<span style="color: %s">%s</span>' % (ACC, e(a['ruolo']))) if a['ruolo'] else '<span></span>'
    return '''<a href="https://vimeo.com/%s" target="_blank" rel="noopener" class="work reveal" aria-label="%s, guarda su Vimeo (si apre in una nuova scheda)" style="position: relative; display: flex; flex-direction: column; justify-content: space-between; gap: 28px; padding: 28px; border: 1px solid #1F1F1F; min-height: 260px; box-sizing: border-box">
<span aria-hidden="true" class="br br-tl" style="position: absolute; top: 12px; left: 12px; width: 16px; height: 16px; border-top: 1px solid #336699; border-left: 1px solid #336699"></span>
<span aria-hidden="true" class="br br-br" style="position: absolute; bottom: 12px; right: 12px; width: 16px; height: 16px; border-bottom: 1px solid #336699; border-right: 1px solid #336699"></span>
<div style="display: flex; flex-direction: column; gap: 14px">
<span style="font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #9A948C">%s</span>
<h3 style="margin: 0; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 36px; line-height: 1.05">%s</h3>
%s%s</div>
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px; border-top: 1px solid #1F1F1F; padding-top: 14px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase">
%s<span style="white-space: nowrap; color: #E8E4DF">Vimeo <span aria-hidden="true" class="arr" style="color: #B46428">↗</span></span>
</div>
</a>
''' % (a['vimeo'], e(a['t']), e(kick), e(a['t']), line, scrive, ruolo)


def amarcord_section():
    def gruppo(titolo, items):
        return ('<div style="display: flex; flex-direction: column; gap: 20px">\n<h3 class="reveal" style="margin: 0; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: %s">%s</h3>\n'
                '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%%, 320px), 1fr)); gap: 24px">\n%s</div>\n</div>\n') % (ACC, e(titolo), ''.join(amarcord_card(a, i) for i, a in enumerate(items)))
    return (gruppo('Cortometraggi 2026', [a for a in AMARCORD if not a.get('es')])
            + gruppo('Esercitazioni 2026', [a for a in AMARCORD if a.get('es')]))


def filmo_row(t, role, prod, href, cls, cols, fs, pad):
    title = '<span style="font-family: \'Cormorant Garamond\', serif; font-style: italic; font-size: %dpx">%s</span>' % (fs, e(t))
    ext = VIMEO_FILMO.get(t.lower()) if not href else None
    if ext:
        title = '<a href="%s" target="_blank" rel="noopener" style="font-family: \'Cormorant Garamond\', serif; font-style: italic; font-size: %dpx">%s <span aria-hidden="true" style="color: #B46428">↗</span></a>' % (ext, fs, e(t))
    if href:
        title = '<a href="%s" style="font-family: \'Cormorant Garamond\', serif; font-style: italic; font-size: %dpx">%s <span aria-hidden="true" style="color: #B46428">→</span></a>' % (href, fs, e(t))
    return ('<div class="%s" style="display: grid; grid-template-columns: %s; gap: 16px; padding: %s 0; border-bottom: 1px solid #1F1F1F; align-items: baseline">\n'
            '%s\n<span style="font-size: 14px; color: #C9C4BD">%s</span>\n<span style="font-size: 13px; color: #9A948C; text-align: right">%s</span>\n</div>\n') % (cls, cols, pad, title, e(role), e(prod))


for w in WORKS:
    if w.get('page', True):
        page(w)
        print('ok', w['slug'] + '.html')
put('lavori.html', 'lavori:tabs', ''.join(tab(c, l) for c, l in CAT_LABELS if c == 'Tutti' or any(c in w['cats'] for w in WORKS)))
put('lavori.html', 'lavori:griglia', ''.join(card(w, i) for i, w in enumerate(WORKS)))
put('lavori.html', 'lavori:amarcord', amarcord_section())
s = open(os.path.join(OUT, 'lavori.html'), encoding='utf-8').read()
s = re.sub(r'<span data-count>\d+</span>', '<span data-count>%d</span>' % len(WORKS), s)
save(os.path.join(OUT, 'lavori.html'), s)
bys = {w['slug']: w for w in WORKS}
put('index.html', 'home:lavori', ''.join(home_card(bys[s], i) for i, s in enumerate(HOME_WORKS)))
put('index.html', 'home:filmografia', ''.join(filmo_row(*f, 'reveal', 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 0.8fr)', 26, '20px') for f in FILMOGRAFIA[:HOME_FILMO]))
put('chi-sono.html', 'chisono:filmografia', ''.join(filmo_row(*f, 'row reveal', 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 0.7fr)', 24, '18px') for f in FILMOGRAFIA))
print('ok elenchi')
