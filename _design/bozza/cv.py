"""CV / filmografia di Karim in PDF (assets/karim-ismail-filmografia.pdf), con lo stile del sito: fondo scuro,
Cormorant Garamond + Space Grotesk (file in _design/font), arancio e righe sottili.
Dati da lavori.json, come le pagine: cinema nell'ordine della filmografia, poi videoclip, video di eventi, video aziendali e altri lavori.
Uso: python -X utf8 _design/bozza/cv.py (serve reportlab; lo lancia pubblica.sh dopo build.py)."""
import datetime, json, os, subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.join(HERE, '..', '..')
FONT = os.path.join(REPO, '_design', 'font')
OUT = os.path.join(REPO, 'assets', 'karim-ismail-filmografia.pdf')
SITO = 'https://produkts.it'
KI = 'Karim Ismail'

FONDO, TESTO, TESTO2, GRIGIO, RIGA, ARANCIO, ARANCIO2 = (HexColor(c) for c in
    ('#080808', '#E8E4DF', '#C9C4BD', '#9A948C', '#2A2A2A', '#B46428', '#D98A4E'))
for nome, file in (('Corm', 'CormorantGaramond-Light.ttf'), ('CormI', 'CormorantGaramond-LightItalic.ttf'),
                   ('CormI4', 'CormorantGaramond-Italic.ttf'), ('Grot', 'SpaceGrotesk-Regular.ttf'), ('Grot5', 'SpaceGrotesk-Medium.ttf')):
    pdfmetrics.registerFont(TTFont(nome, os.path.join(FONT, file)))

d = json.load(open(os.path.join(HERE, 'lavori.json'), encoding='utf-8'))
LAVORI = {w['slug']: w for w in d['lavori']}
AMARCORD = {w['slug']: w for w in d['amarcord']}
esc = lambda s: str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def nomi(v):
    """Nomi di una voce dei credits: nei corti AMARCORD e in Dynamis è una lista, negli altri lavori una stringa con virgole."""
    return v if isinstance(v, list) else [x.strip() for x in str(v).split(',') if x.strip()]


def crediti(crew):
    return {k: nomi(v) for k, v in (crew or [])}


def chi(cr, *voci):
    for v in voci:
        if cr.get(v):
            return ', '.join(cr[v])
    return ''


def voce(titolo, anno, tipo, ruolo, altri, slug):
    return dict(titolo=titolo, anno=anno, tipo=tipo, ruolo=ruolo, altri=altri, slug=slug)


def altri_crediti(cr, extra=()):
    """Riga piccola con chi ha firmato regia e fotografia (quando non è Karim) e produzione/artista."""
    out = list(extra)
    r = chi(cr, 'Regia')
    if r and r != KI:
        out.append('Regia ' + r)
    f = chi(cr, 'Direzione della fotografia')
    if f and KI not in f:
        out.append('D.O.P. ' + f)
    return out


# Cinema: ordine e ruoli della filmografia (curata da Karim), dettagli dalle schede
cinema, visti = [], set()
for titolo, ruolo, prod, slug in d['filmografia']:
    visti.add(slug)
    if slug == 'dynamis':
        dy = d['dynamis']
        cinema.append(voce('Dynamis', '2026', 'Corto verticale · VerticalMovie 2026', ruolo,
                           altri_crediti(crediti(dy['crew']), ['Produzione produkts.it']), slug))
    elif slug in AMARCORD:
        a = AMARCORD[slug]
        tipo = ' · '.join(x for x in ('Cortometraggio', a.get('gen'), ('%s min' % a['min']) if a.get('min') else '') if x)
        cinema.append(voce(a['t'], '2026', tipo, ruolo, altri_crediti(crediti(a.get('crew')), ['Produzione AMARCORD']), slug))
    elif slug in LAVORI:
        w = LAVORI[slug]
        meta = dict(w.get('meta') or [])
        tipo = (w.get('kicker') or '').rsplit(' · ', 1)[0]
        extra = ['Produzione ' + meta['Produzione']] if meta.get('Produzione') else []
        cinema.append(voce(titolo, w['year'], tipo, w.get('role') or ruolo, altri_crediti(crediti(w.get('crew')), extra), slug))
    else:
        # In filmografia ma ancora senza scheda (es. Cuori in stand-by): solo titolo, ruolo e produzione
        cinema.append(voce(titolo, '2026' if prod == 'AMARCORD' else '', 'Cortometraggio', ruolo,
                           ['Produzione ' + prod] if prod else [], None))

gruppi = {'Videoclip': [], 'Video eventi': [], 'Video aziendali': [], 'Altri lavori': []}
for w in sorted(d['lavori'], key=lambda w: w.get('year', ''), reverse=True):
    if w['slug'] in visti:
        continue
    cats = w.get('cats') or []
    g = ('Videoclip' if 'Videoclip' in cats else 'Video eventi' if 'Evento' in cats else
         'Video aziendali' if 'Video aziendale' in cats else 'Altri lavori')
    meta = dict(w.get('meta') or [])
    extra = [k + ' ' + meta[k] for k in ('Artista', 'Cliente', 'Produzione', 'Organizzazione', 'Luogo') if meta.get(k)]
    tipo = (w.get('kicker') or '').rsplit(' · ', 1)[0]
    titolo = w['t'] + (' — ' + w['sub'] if w.get('sub') and g in ('Video aziendali', 'Altri lavori') else '')
    gruppi[g].append(voce(titolo, w.get('year', ''), tipo, w.get('role') or w.get('role_short', ''),
                          altri_crediti(crediti(w.get('crew')), extra), w['slug']))

sezioni = [('Cinema', 'Cortometraggi, docufilm e corti AMARCORD', cinema)] + [(k, '', v) for k, v in gruppi.items() if v]

# --- Stili --------------------------------------------------------------------
S = lambda **k: ParagraphStyle('x', **k)
st_titolo = S(fontName='CormI', fontSize=15.5, leading=18, textColor=TESTO)
st_tipo = S(fontName='Grot', fontSize=6.6, leading=9, textColor=GRIGIO, spaceBefore=2)
st_ruolo = S(fontName='Grot', fontSize=8.4, leading=11.5, textColor=TESTO2)
st_altri = S(fontName='Grot', fontSize=7.4, leading=10.5, textColor=GRIGIO)
st_anno = S(fontName='Grot', fontSize=8, leading=11, textColor=ARANCIO2, alignment=2)
st_sez = S(fontName='CormI', fontSize=28, leading=30, textColor=TESTO)
st_occh = S(fontName='Grot5', fontSize=6.8, leading=9, textColor=ARANCIO2)
st_testo = S(fontName='Grot', fontSize=9, leading=14, textColor=TESTO2)

W, H = A4
MX = 18 * mm
LARGH = W - 2 * MX
COLONNE = [LARGH * 0.38, LARGH * 0.29, LARGH * 0.26, LARGH * 0.07]
def ultima_modifica():
    """Data dell'ultimo commit di lavori.json (così il PDF cambia solo quando cambiano i lavori); senza git, oggi."""
    try:
        out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', 'lavori.json'], cwd=HERE, capture_output=True, text=True, timeout=20).stdout.strip()
        return datetime.date.fromisoformat(out)
    except Exception:
        return datetime.date.today()


oggi = ultima_modifica()
MESI = 'gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre'.split()
aggiornata = '%d %s %d' % (oggi.day, MESI[oggi.month - 1], oggi.year)


def maiuscolo(s, spazio=1.6):
    """Testo maiuscolo spaziato come le etichette del sito (letter-spacing)."""
    return '<font name="Grot5">%s</font>' % esc(s.upper())


def riga(v):
    t = esc(v['titolo'])
    if v['slug']:
        t = '<a href="%s/%s" color="#E8E4DF">%s</a> <font name="Grot" size="9" color="#B46428">→</font>' % (SITO, v['slug'], t)
    sx = [Paragraph(t, st_titolo), Paragraph(esc(v['tipo'].upper()), st_tipo)]
    return [sx, Paragraph(esc(v['ruolo']), st_ruolo), Paragraph('<br/>'.join(esc(x) for x in v['altri']), st_altri),
            Paragraph(esc(v['anno']), st_anno)]


def tabella(voci):
    t = Table([riga(v) for v in voci], colWidths=COLONNE, repeatRows=0)
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (-1, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (1, 0), (-1, -1), 9),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, RIGA),
    ]))
    return t


def sfondo(c, doc):
    c.saveState()
    c.setFillColor(FONDO)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    # Intestazione: logo come sul sito, a destra la città
    c.setFillColor(TESTO)
    c.setFont('CormI', 17)
    c.drawString(MX, H - 16 * mm, 'produkts')
    x = MX + pdfmetrics.stringWidth('produkts', 'CormI', 17)
    c.setFillColor(GRIGIO)
    c.setFont('Corm', 17)
    c.drawString(x, H - 16 * mm, '.it')
    c.linkURL(SITO, (MX, H - 18 * mm, x + 14, H - 11 * mm), relative=0)
    c.setFillColor(ARANCIO)
    c.circle(W - MX - pdfmetrics.stringWidth('ALTAMURA · ITALIA', 'Grot', 6.8) - 9, H - 15.2 * mm, 2.2, stroke=0, fill=1)
    c.setFillColor(GRIGIO)
    c.setFont('Grot', 6.8)
    c.drawRightString(W - MX, H - 16 * mm, 'ALTAMURA · ITALIA')
    # Piede: titolo del documento, data e numero di pagina in stile timecode
    c.setStrokeColor(RIGA)
    c.setLineWidth(0.5)
    c.line(MX, 15 * mm, W - MX, 15 * mm)
    c.setFont('Grot', 6.6)
    c.drawString(MX, 10.5 * mm, 'KARIM ISMAIL — FILMOGRAFIA · AGGIORNATA IL %s' % aggiornata.upper())
    c.setFillColor(ARANCIO2)
    c.drawRightString(W - MX, 10.5 * mm, '%02d' % doc.page)
    c.restoreState()


def contatti():
    voci = [('Email', 'karim@produkts.it', 'mailto:karim@produkts.it'),
            ('WhatsApp', '+39 371 144 4875', 'https://wa.me/393711444875'),
            ('Sito', 'produkts.it', SITO),
            ('YouTube', '@produkts-it', 'https://www.youtube.com/@produkts-it')]
    celle = [[Paragraph(esc(k.upper()), st_tipo), Paragraph('<a href="%s" color="#E8E4DF">%s</a>' % (u, esc(v)), st_ruolo)] for k, v, u in voci]
    t = Table([[c[0] for c in celle], [c[1] for c in celle]], colWidths=[LARGH / 4] * 4)
    t.setStyle(TableStyle([('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                           ('TOPPADDING', (0, 0), (-1, -1), 1), ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
                           ('LINEABOVE', (0, 0), (-1, 0), 0.5, RIGA), ('TOPPADDING', (0, 0), (-1, 0), 9)]))
    return t


storia = [
    Spacer(1, 2 * mm),
    Paragraph(maiuscolo('Curriculum · Filmografia'), st_occh),
    Spacer(1, 3 * mm),
    Paragraph('Karim Ismail', S(fontName='CormI', fontSize=52, leading=54, textColor=TESTO)),
    Spacer(1, 2 * mm),
    Paragraph('Direttore della fotografia, videomaker e fotografo', S(fontName='Corm', fontSize=19, leading=23, textColor=TESTO2)),
    Spacer(1, 5 * mm),
    Paragraph('Direttore della fotografia certificato AMARCORD – Accademia Mediterranea del Cinema, Bari. '
              'Dal 2021 racconta storie con la camera: cortometraggi, videoclip, eventi e video aziendali, '
              'spesso curati dall’idea alla consegna (riprese, montaggio, color e VFX).', S(parent=st_testo, fontSize=9.6, leading=15)),
    Spacer(1, 6 * mm),
    contatti(),
]
for i, (nome, occhiello, voci) in enumerate(sezioni):
    testa = [Spacer(1, 10 * mm)]
    if occhiello:
        testa += [Paragraph(maiuscolo(occhiello), st_occh), Spacer(1, 2 * mm)]
    testa += [Paragraph(nome + ' <font name="Grot" size="8" color="#9A948C">%02d</font>' % len(voci), st_sez), Spacer(1, 2 * mm)]
    # Titolo della sezione mai da solo in fondo alla pagina: resta attaccato al primo lavoro
    storia.append(KeepTogether(testa + [tabella(voci[:1])]))
    if len(voci) > 1:
        storia.append(tabella(voci[1:]))

doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=MX, rightMargin=MX, topMargin=22 * mm, bottomMargin=20 * mm,
                      title='Karim Ismail — Filmografia', author='Karim Ismail · produkts.it',
                      subject='Curriculum e filmografia: cinema, videoclip, eventi e video aziendali', creator='produkts.it', invariant=1)
doc.addPageTemplates([PageTemplate(frames=[Frame(MX, 20 * mm, LARGH, H - 42 * mm, 0, 0, 0, 0)], onPage=sfondo)])
doc.build(storia)
print('cv', sum(len(v) for _, _, v in sezioni), 'lavori,', doc.page, 'pagine ->', os.path.relpath(OUT, REPO))
