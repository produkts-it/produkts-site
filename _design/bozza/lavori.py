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


# Dal più recente. 'cats' decide i filtri di Lavori; 'page': False = pagina fatta a mano.
WORKS = [
    dict(slug='dynamis', page=False, t='Dynamis', year='2026', img='dynamis.jpg', pos='50% 35%',
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
         yt='z0G1CfqjHxI', img='img/lavori/romance-anonimo.jpg', cats=['Videoclip'],
         kicker='Videoclip musicale · 2025',
         line='Videoclip per Bartek Dabrowski su «Romance Anónimo», classico senza tempo della chitarra spagnola.',
         role='Direzione della fotografia, riprese, montaggio, color e VFX', role_short='D.O.P., montaggio e color',
         meta=[('Artista', 'Bartek Dabrowski'), ('Uscita', '25 aprile 2025 · YouTube')],
         crew=[('Artista', 'Bartek Dabrowski'), ('Direzione della fotografia', KI), ('Riprese', KI), ('Montaggio', KI),
               ('Color', KI), ('VFX', KI)]),
    dict(slug='coseco', t='Coseco Industrie', sub='50 anni', year='2024', date='18 dicembre 2024',
         yt='mpesKIpv9N8', img='img/lavori/coseco.jpg', cats=['Video aziendale'],
         kicker='Video aziendale · 2024',
         line='Video corporate per i 50 anni di Coseco Industrie, proiettato al cinema durante la celebrazione. Produzione kontents.eu.',
         role='Riprese, montaggio, post-produzione, color, VFX e audio', role_short='Riprese e post-produzione',
         meta=[('Produzione', 'kontents.eu'), ('Cliente', 'Coseco Industrie'), ('Uscita', '18 dicembre 2024 · YouTube')],
         crew=[('Produzione', 'kontents.eu'), ('Riprese', 'Gianni Ragone, ' + KI), ('Montaggio', 'Gianni Ragone, ' + KI),
               ('Post-produzione', KI), ('Color', KI), ('VFX', KI), ('Effetti sonori', KI), ('Audio design', KI),
               ('Fonico di presa diretta', KI)]),
    dict(slug='wake-up', t='Wake Up', sub='Bartek Dabrowski · Orchestra', year='2024', date='29 marzo 2024',
         yt='MZFk-CNkgGY', img='img/lavori/wake-up.jpg', cats=['Videoclip'],
         kicker='Videoclip musicale · 2024',
         line='Videoclip per la versione orchestrale di «Wake Up» di Bartek Dabrowski: un invito ad ascoltare la propria voce interiore.',
         role='Direzione della fotografia, riprese, montaggio, color e VFX', role_short='D.O.P., montaggio e color',
         meta=[('Artista', 'Bartek Dabrowski'), ('Uscita', '29 marzo 2024 · YouTube')],
         crew=[('Artista', 'Bartek Dabrowski'), ('Direzione della fotografia', KI), ('Riprese', KI), ('Montaggio', KI),
               ('Color', KI), ('VFX', KI)]),
    dict(slug='korvo', t='Hai perso', sub='Korvo', year='2023', date='giugno 2023',
         vimeo='888211568', img='img/lavori/korvo.jpg', cats=['Videoclip'],
         kicker='Videoclip musicale · 2023',
         line="Videoclip di «Hai perso» per Korvo, curato dall'idea alla consegna: regia, riprese, montaggio e color.",
         role='Regia, direzione della fotografia, riprese, montaggio e color', role_short='Regia, D.O.P., montaggio e color',
         meta=[('Artista', 'Korvo'), ('Uscita', 'Giugno 2023 · Vimeo')],
         crew=[('Artista e musica', 'Korvo'), ('Regia', KI), ('Direzione della fotografia', KI), ('Riprese', KI),
               ('Montaggio', KI), ('Color', KI)]),
    dict(slug='troppo-bella-per-loro', t='Troppo bella per loro', sub='Docufilm in dialetto altamurano', year='2022', date='marzo 2022',
         vimeo='888136670', img='img/lavori/troppo-bella-per-loro.jpg',
         cats=['Cortometraggio', 'Opera personale'], kicker='Docufilm · opera personale · 2022',
         line="Un docufilm in dialetto altamurano sul rapporto di amore e odio tra l'uomo e la natura.",
         role='Regia, riprese e montaggio, con Fabrizio Marinelli', role_short='Regia, riprese e montaggio',
         meta=[('Produzione', 'produkts.it'), ('Lingua', 'Dialetto altamurano'), ('Uscita', 'Marzo 2022 · Vimeo')],
         cast=[('Protagonista', 'Paolo Cappiello', None)],
         crew=[('Video', KI + ', Fabrizio Marinelli'), ('Montaggio', KI + ', Fabrizio Marinelli'), ('Produzione', 'produkts.it')]),
]
CAT_LABELS = [('Tutti', 'Tutti'), ('Cortometraggio', 'Cortometraggi'), ('Videoclip', 'Videoclip'),
              ('Video aziendale', 'Video aziendali'), ('Opera personale', 'Opere personali'), ('AMARCORD', 'AMARCORD')]
HOME_WORKS = ['dynamis', 'schizophrenia', 'coseco', 'wake-up']

# Filmografia: solo cinema (cortometraggi, lungometraggi, film, docufilm, documentari). Niente videoclip, social, corporate.
# Titolo, ruolo, produzione, pagina (se c'è)
FILMOGRAFIA = [
    ('Dynamis', 'Produttore, D.O.P., montaggio, color, VFX', 'produkts.it', 'dynamis'),
    ('Tra i Piedi', 'Direttore della fotografia', 'AMARCORD', 'tra-i-piedi'),
    ("L'Inventario", 'Co-D.O.P.', 'AMARCORD', 'l-inventario'),
    ('Schizophrenia — Io e Nessun Altro', 'Regia e fotografia', 'produkts.it', 'schizophrenia'),
    ('Troppo bella per loro', 'Docufilm · regia, riprese e montaggio', 'produkts.it', 'troppo-bella-per-loro'),
    ('Sbaglio Dunque Esisto', 'Operatore e fonico', 'AMARCORD', 'sbaglio-dunque-esisto'),
    ('La Seduta', 'Operatore', 'AMARCORD', 'la-seduta'),
    ('Paranoia', 'Operatore, 2ª camera', 'AMARCORD', 'paranoia'),
    ('Cuori in Stand-by', 'Assistente operatore, 2ª camera', 'AMARCORD', None),
    ('Parfum', 'Assistente operatore', 'AMARCORD', 'parfum'),
    ('La Sedia', 'Assistente operatore', 'AMARCORD', 'la-sedia'),
    ("Spaghetti all'Assassina", 'Assistente operatore', 'AMARCORD', None),
    ('Il Tanga e la Cravatta', 'Fonico', 'AMARCORD', 'il-tanga-e-la-cravatta'),
]
HOME_FILMO = 10

# Persone ricorrenti: un nome scritto sempre allo stesso modo, così "Anche in…" le riconosce in tutti i lavori.
GIADA, GIANNI, MIRIANA, MARY, LIBERO = 'Giada Bellanova', 'Gianni Lorusso', 'Miriana Mastronardi', 'Mariachiara Monaco', 'Libero Maria Santomauro'
TIZIANA, NOEMI, DESIREE, DOMENICO, ANGLANI, MARENGO = 'Tiziana Lattuca', 'Noemi Lorusso', 'Desiree Cataldo', 'Domenico Vesia', 'Francesco Anglani', 'Fabrizio Marengo'
SONIA, CARBONARA, VENDOLA, DAVIDE, VITTORIA, CIPRI = 'Sonia Sorressa', 'Antonio Carbonara', 'Antonio Vendola', 'Davide De Pinto', 'Vittoria Binetti', 'Alessandro Cipri'
CARDONE, ANGELICA, MATTEO, LUCA, MICHELE, MAURO = 'Alessandro N. Cardone', 'Angelica Vinci', 'Matteo Gattulli', 'Luca Sportelli', 'Michele Mika Juri Liturri', 'Mauro Zeverino'
ANDREA, MARIANNA, ROBERTA, MARTIN = 'Andrea La Tanza', 'Marianna Nettis', 'Roberta Giovanetti', 'Martin Barletta'
PIETRO, FLANOTTE, VERA, FEDERICA, DONATELLA, VANESSA = 'Pietro Di Gioia', 'Francesco Lanotte', 'Vera Balice', 'Federica Dalena', 'Donatella Santorsa', 'Vanessa Ciccolella'
MAYA, ALLEGRETTI, TIGRANO, EMMA, LORENZO = 'Maya Nacci', 'Francesco Allegretti', 'Francesco Tigrano', 'Emma Perini', 'Lorenzo Vitucci'
SIMONA, ANITA, VITA, AMELIA, LEONARDA, NUZZI, SABRINA = 'Simona Lopez', 'Anita Donno', 'Vita Barberio', 'Amelia Potenza', 'Leonarda Cesonate', 'Mariangela Nuzzi', 'Sabrina Colamorea'
LAERA, BETTY, ZAGARIA = 'Maria Rosaria Laera', 'Betty Corradini', 'Simona Zagaria'
PROD = TIZIANA + ' per AMARCORD'

# Credits di Dynamis (la pagina è fatta a mano, ma il blocco Credits si genera da qui per avere gli "Anche in…")
DYNAMIS = dict(slug='dynamis', t='Dynamis',
    cast=[('Mattia', GIANNI), ('Paranoia', FEDERICA), ('Opportunità', EMMA), ('Saverio', PIETRO), ('Cameo', 'Paolo Greco')],
    crew=[('Regia', [GIADA]), ('Sceneggiatura', [MIRIANA]), ('Produzione', [KI]), ('Direzione della fotografia', [KI]),
          ('Montaggio', [KI]), ('Color', [KI]), ('VFX e motion graphics', [KI]), ('Musiche', ['Giuseppe Sorressa']),
          ('Sound design', [SONIA]), ('Scenografia', [MATTEO]), ('Trucco', [NUZZI]), ('Segretaria di edizione', [ROBERTA]),
          ('Aiuto regia', [LUCA]), ('Grafica', [LUCA])])

# Corti di AMARCORD (Accademia Mediterranea del Cinema), 2026: tutti cortometraggi, ognuno con la sua pagina e il link a Vimeo.
# Niente sinossi (no spoiler): solo una riga di atmosfera. Cast: (personaggio o '', nome). Troupe: (ruolo, [nomi]).
AMARCORD = [
    dict(slug='tra-i-piedi', img='img/amarcord/tra-i-piedi.jpg', t='Tra i piedi', gen='Commedia grottesca', ruolo='Direttore della fotografia', min=6, vimeo='1236005846/a8fe909088',
         line='Il bagno di un locale, una serata tra amici e un telefono che passa di mano più del dovuto.',
         cast=[('Marta', DONATELLA), ('Edoardo', ALLEGRETTI), ('Diego', TIGRANO), ('Stefania', MAYA), ('Martina', VERA)],
         crew=[('Regia', [MATTEO]), ('Produzione', [PROD]), ('Direzione della fotografia', [KI]), ('Operatori', [CARBONARA, VITTORIA]),
               ('Assistenti operatore', [SONIA, CIPRI]), ('Montaggio', [ANGELICA]), ('Aiuto regia', [MICHELE]), ('Scenografia', [LUCA]),
               ('Fonico', [DAVIDE]), ('Segretario di edizione', [ANDREA]), ('Ciak', [GIADA]),
               ('Capo reparto trucco', [LAERA]), ('Trucco', [BETTY, ZAGARIA])]),
    dict(slug='paranoia', img='img/amarcord/paranoia.jpg', t='Paranoia', gen='Dramma psicologico', ruolo='Operatore', min=7, vimeo='1220653465/634fa7dd97',
         line='Un campus, un sospetto, una voce che non smette di suggerire.',
         cast=[('Luna', DONATELLA), ('Mirta', FEDERICA), ('Francesca', MAYA), ('Stefano', ALLEGRETTI), ('Alessandro', LORENZO)],
         crew=[('Regia', [MAURO]), ('Produzione', [PROD]), ('Soggetto', [MIRIANA]), ('Sceneggiatura', [DESIREE]),
               ('Direzione della fotografia', [VENDOLA]), ('Operatori', [DAVIDE, KI]), ('Assistenti operatore', [GIADA, VITTORIA]),
               ('Montaggio', [ANGELICA]), ('Aiuto regia', [LUCA]), ('Scenografia', [MICHELE]), ('Fonico', [CARBONARA]),
               ('Segretaria di edizione', [MARIANNA]), ('Ciak', [SONIA]), ('Backstage', [ANDREA]),
               ('Capo reparto trucco', [ZAGARIA]), ('Trucco', [VITA, 'Annachiara De Palo'])]),
    dict(slug='sbaglio-dunque-esisto', img='img/amarcord/sbaglio-dunque-esisto.jpg', t='Sbaglio dunque esisto', gen='Dramma psicologico', ruolo='Operatore e fonico', min=6, vimeo='1220653421/520923c76a',
         line='Una terapia sperimentale, una stanza chiusa e un viaggio dentro i ricordi.',
         cast=[('Selene', VANESSA), ('Infermiera', EMMA), ('Dottore', PIETRO), ('Infermiere', TIGRANO), ('Mamma', FEDERICA), ('Papà', LORENZO)],
         crew=[('Regia', [MARIANNA]), ('Produzione', [PROD]), ('Soggetto', [MARY]), ('Sceneggiatura', [MIRIANA]),
               ('Direzione della fotografia', [GIADA]), ('Operatori', [CIPRI, KI]), ('Assistenti operatore', [SONIA, CARBONARA]),
               ('Fonico', [KI]), ('Montaggio', [CARDONE]), ('Aiuto regia', [ANDREA]), ('Scenografia', [MAURO]),
               ('Segretaria di edizione', [MARTIN]), ('Ciak', [VITTORIA]), ('Backstage', [MATTEO]),
               ('Capo reparto trucco', [SABRINA]), ('Trucco', [LEONARDA, SIMONA])]),
    dict(slug='parfum', img='img/amarcord/parfum.jpg', t='Parfum', gen='Commedia romantica', ruolo='Assistente operatore', min=6, vimeo='1220653459/be50961eb1',
         line='Un primo appuntamento tra gli scaffali di una libreria, una paura da nascondere e troppi campioncini di profumo.',
         cast=[('Rita', DONATELLA), ('Luca', ALLEGRETTI), ('Paola', VERA), ('Gilberto', TIGRANO), ('Laura', EMMA)],
         crew=[('Regia', [MICHELE]), ('Produzione', [PROD]), ('Soggetto', [NOEMI]), ('Sceneggiatura', [MARENGO]), ('Editor', [DESIREE]),
               ('Direzione della fotografia', [DAVIDE]), ('Operatori', [SONIA, VENDOLA]), ('Assistenti operatore', [KI, VITTORIA]),
               ('Montaggio', [DAVIDE]), ('Aiuto regia', [MATTEO]), ('Scenografia', [ANDREA]), ('Fonico', [CIPRI]),
               ('Segretaria di edizione', [ROBERTA]), ('Ciak', [CARBONARA]), ('Backstage', [MARTIN]),
               ('Capo reparto trucco', [NUZZI]), ('Trucco', [ANITA, VITA])]),
    dict(slug='la-sedia', img='img/amarcord/la-sedia.jpg', t='La sedia', gen='Dramma psicologico', ruolo='Assistente operatore', min=6, vimeo='1205077119/8e1ac4d587',
         line='Una ragazza che non regge il contatto, una sedia davanti a lei e tutto quello che non ha mai detto.',
         cast=[('', DONATELLA), ('', VERA), ('', FLANOTTE), ('', ALLEGRETTI)],
         crew=[('Regia', [MARTIN]), ('Produzione', [PROD]), ('Soggetto', [NOEMI]), ('Sceneggiatura', [DOMENICO]),
               ('Direzione della fotografia', [SONIA]), ('Operatori', [DAVIDE, VITTORIA]), ('Assistenti operatore', [GIADA, KI]),
               ('Montaggio', [CARDONE]), ('Aiuto regia', [ROBERTA]), ('Scenografia', [ANDREA]), ('Fonico', [VENDOLA]),
               ('Segretaria di edizione', [MATTEO]), ('Ciak', [CIPRI]), ('Backstage', [MAURO]),
               ('Capo reparto trucco', ['Gloria Lombardo']), ('Trucco', [ANITA, 'Alessandra Maiellaro'])]),
    dict(slug='la-seduta', img='img/amarcord/la-seduta.jpg', t='La seduta', gen='', ruolo='Operatore', min=8, vimeo='1198757832/ba4f3c4cf7',
         line='Un cortometraggio di AMARCORD girato nel 2026.',
         cast=[('', DONATELLA), ('', VANESSA), ('', FEDERICA), ('', MAYA), ('', ALLEGRETTI)],
         crew=[('Regia', [ROBERTA, MARTIN]), ('Produzione', [PROD]), ('Soggetto', [LIBERO]), ('Sceneggiatura', [ANGLANI, MARENGO]),
               ('Direzione della fotografia', [DAVIDE, VITTORIA]), ('Operatore', [KI]), ('Assistente operatore', [VENDOLA]),
               ('Montaggio', [CARDONE]), ('Aiuto regia', [MAURO]), ('Scenografia', [MICHELE]), ('Fonico', [CIPRI]),
               ('Segretaria di edizione', [ANDREA]), ('Ciak', [CARBONARA]), ('Backstage', [MARIANNA]),
               ('Capo reparto trucco', [LEONARDA]), ('Trucco', [NUZZI, AMELIA])]),
    dict(slug='l-inventario', img='img/amarcord/l-inventario.jpg', t="L'inventario", gen='', ruolo='Co-direttore della fotografia', min=5, vimeo='1205074164/052af8153b',
         line='Un cortometraggio di AMARCORD girato nel 2026.',
         cast=[('', TIGRANO), ('', VERA), ('', EMMA), ('', PIETRO), ('', VANESSA)],
         crew=[('Regia', [LUCA, MATTEO]), ('Produzione', [PROD]), ('Soggetto', [ANGLANI]), ('Sceneggiatura', [DOMENICO, DESIREE]),
               ('Direzione della fotografia', [KI, GIADA]), ('Operatore', [SONIA]), ('Assistente operatore', [CIPRI]),
               ('Montaggio', [CARDONE, DAVIDE]), ('Aiuto regia', [MARTIN]), ('Scenografia', [ROBERTA]), ('Fonico', [DAVIDE]),
               ('Segretaria di edizione', [ROBERTA]), ('Ciak', [VITTORIA]), ('Backstage', [MICHELE]),
               ('Capo reparto trucco', [LAERA]), ('Trucco', [BETTY, SABRINA])]),
    dict(slug='il-tanga-e-la-cravatta', img='img/amarcord/il-tanga-e-la-cravatta.jpg', t='Il tanga e la cravatta', gen='', ruolo='Fonico', min=5, vimeo='1205098451/48cd24e2f4',
         line='Un cortometraggio di AMARCORD girato nel 2026.',
         cast=[('Gerardo', PIETRO), ('Giacinto', FLANOTTE), ('Adelina', VERA), ('Ginevra', FEDERICA)],
         crew=[('Regia', [ANDREA, MARIANNA]), ('Produzione', [PROD]), ('Soggetto', [MARY]), ('Sceneggiatura', [MIRIANA, LIBERO]),
               ('Direzione della fotografia', [SONIA, CARBONARA]), ('Operatore', [GIADA]), ('Assistente operatore', [DAVIDE]),
               ('Fonico', [KI]), ('Montaggio', [ANGELICA]), ('Aiuto regia', [MATTEO]), ('Scenografia', [LUCA]),
               ('Segretaria di edizione', [MICHELE]), ('Ciak', [VITTORIA]), ('Backstage', [MAURO]),
               ('Capo reparto trucco', [SIMONA]), ('Trucco', [ANITA, VITA, AMELIA])]),
]

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
<span aria-hidden="true" style="position: absolute; top: 28px; right: 72px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #6E6A64">AMARCORD · 2026</span>
<span style="display: inline-flex; align-items: center; gap: 12px; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; border: 1px solid rgba(232,228,223,0.6); border-radius: 26px; height: 52px; padding: 0 26px 0 20px"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7V5z"></path></svg>Guarda su %(plat)s</span>
</a>''' % dict(t=e(w['t']), url=url, plat=plat)


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
    return p if w['slug'] not in SENZA_COPERTINA and os.path.exists(os.path.join(OUT, p)) else w['img']


def dati_copertine():
    """Testi delle copertine per _design/copertine/index.html: occhiello, titolo, sottotitolo e tre dati in basso."""
    out = []
    for w in WORKS:
        if w['slug'] in SENZA_COPERTINA:
            continue
        out.append(dict(slug=w['slug'], img=w['img'], kicker=w['kicker'], t=w['t'], sub=w.get('sub', ''),
                        dati=[list(w['meta'][0]), [KI, w['role_short']], ['Uscita', w['date']]]))
    for a in AMARCORD:
        out.append(dict(slug=a['slug'], img=a['img'], kicker='Cortometraggio · AMARCORD · 2026', t=a['t'], sub='',
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
    """Tutti i lavori in un'unica griglia, dal più recente: Dynamis, poi i corti AMARCORD (2026), poi gli altri."""
    am = [dict(slug=a['slug'], t=a['t'], year='2026', img=a['img'], cats=['Cortometraggio', 'AMARCORD']) for a in AMARCORD]
    tutti = [w for w in WORKS if w['year'] >= '2026'] + am + [w for w in WORKS if w['year'] < '2026']
    return tutti


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
    w = dict(a, kicker='Cortometraggio · AMARCORD · 2026', role=a['ruolo'],
             meta=[('Regia', ', '.join(dict(a['crew'])['Regia'])), ('Produzione', PROD)]
                  + ([('Genere', a['gen'])] if a.get('gen') else []) + [('Durata', '%d minuti' % a['min']), ('Anno', '2026 · Vimeo')])
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
