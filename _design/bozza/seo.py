"""SEO del sito: in ogni pagina pubblica mette (tra <!-- seo --> e <!-- /seo -->, subito dopo <title>) descrizione,
canonical, anteprima per i link condivisi (Open Graph) e, in Home, i dati strutturati; poi rigenera sitemap.xml e robots.txt.
Lo lancia build.py alla fine: dopo lavori.py basta python _design/bozza/build.py.
Pagine spente (Fotografia, Galleria, Area clienti) e 404 restano fuori dai motori di ricerca.
"""
import datetime, glob, html, json, os, re

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SITE = 'https://produkts.it'
OG = SITE + '/og.jpg'
ESCLUSE = {'404.html', 'fotografia.html', 'galleria.html', 'area-clienti.html'}

DESCR = {
    'index.html': 'Karim Ismail, direttore della fotografia, videomaker e fotografo ad Altamura (BA). Cortometraggi, videoclip, eventi e contenuti per brand. Dynamis è stato selezionato al VerticalMovie Festival 2026.',
    'lavori.html': 'I lavori di Karim Ismail: cortometraggi, videoclip e video aziendali. Dynamis, Schizophrenia, i corti di AMARCORD e altro.',
    'chi-sono.html': "Karim Ismail, direttore della fotografia certificato AMARCORD, videomaker e fotografo di Altamura: la storia di produkts.it e la filmografia.",
    'recensioni.html': 'Le recensioni di chi ha lavorato con produkts.it: 18 anni, comunioni, battesimi, compleanni, eventi e fotografia sportiva.',
    'contatti.html': 'Raccontami il tuo progetto: fotografia, video, cortometraggi ed eventi ad Altamura, in Puglia e oltre. Ti rispondo di solito entro un giorno.',
    'privacy.html': 'Informativa privacy e cookie di produkts.it: quali dati raccolgo, perché e per quanto tempo.',
    'dynamis.html': 'Dynamis, cortometraggio verticale prodotto da produkts.it, regia di Giada Bellanova: selezionato al VerticalMovie Festival 2026 alla Casa del Cinema di Roma.',
}
IMG = {'dynamis.html': SITE + '/dynamis.jpg'}

# Dati strutturati (schema.org): chi è Karim Ismail, l'attività produkts.it e il sito. Servono a Google per capire
# che "Karim Ismail" è questa persona e che produkts.it è il suo sito (stesso @id in tutte le pagine e nei lavori).
ID_KARIM, ID_PRODUKTS, ID_SITO = SITE + '/#karim-ismail', SITE + '/#produkts', SITE + '/#sito'
SOCIAL = ['https://www.instagram.com/produkts.it/', 'https://www.youtube.com/@produkts-it']
INDIRIZZO = {'@type': 'PostalAddress', 'addressLocality': 'Altamura', 'addressRegion': 'BA', 'postalCode': '70022', 'addressCountry': 'IT'}
AMARCORD = {'@type': 'EducationalOrganization', 'name': 'AMARCORD — Accademia Mediterranea del Cinema'}
PERSONA = {
    '@type': 'Person', '@id': ID_KARIM, 'name': 'Karim Ismail', 'givenName': 'Karim', 'familyName': 'Ismail',
    'jobTitle': 'Direttore della fotografia, videomaker e fotografo',
    'description': 'Karim Ismail è un direttore della fotografia (D.O.P.), videomaker e fotografo di Altamura (BA), '
                   'fondatore di produkts.it. Cortometraggi, videoclip, eventi e contenuti per brand.',
    'url': SITE + '/chi-sono',
    'image': {'@type': 'ImageObject', 'url': SITE + '/img/set/ritratto.jpg',
              'caption': 'Karim Ismail al VerticalMovie Festival, Casa del Cinema di Roma'},
    'email': 'mailto:karim@produkts.it', 'telephone': '+393711444875', 'address': INDIRIZZO,
    'homeLocation': {'@type': 'Place', 'name': 'Altamura', 'address': INDIRIZZO},
    'hasOccupation': [{'@type': 'Occupation', 'name': n} for n in ('Direttore della fotografia', 'Videomaker', 'Fotografo')],
    'knowsAbout': ['Direzione della fotografia', 'Cinematografia', 'Cortometraggi', 'Videoclip', 'Fotografia',
                   'Montaggio', 'Color grading', 'VFX'],
    'alumniOf': [{'@type': 'EducationalOrganization', 'name': 'I.T.T. Nervi Galilei', 'address': INDIRIZZO}, AMARCORD],
    'hasCredential': {'@type': 'EducationalOccupationalCredential', 'name': 'Direttore della fotografia certificato AMARCORD',
                      'credentialCategory': 'certificate', 'recognizedBy': AMARCORD},
    'award': 'Nomination VerticalMovie Festival 2026 con il cortometraggio Dynamis',
    'worksFor': {'@id': ID_PRODUKTS}, 'sameAs': SOCIAL,
}
PRODUKTS = {
    '@type': 'ProfessionalService', '@id': ID_PRODUKTS, 'name': 'produkts.it', 'url': SITE + '/',
    'description': 'Direzione della fotografia, video e fotografia di Karim Ismail ad Altamura: cortometraggi, videoclip, eventi e brand.',
    'logo': SITE + '/apple-touch-icon.png', 'image': OG, 'founder': {'@id': ID_KARIM},
    'email': 'mailto:info@produkts.it', 'telephone': '+393711444875', 'address': INDIRIZZO,
    'areaServed': ['Altamura', 'Puglia', 'Italia'], 'sameAs': SOCIAL,
}
SITO = {'@type': 'WebSite', '@id': ID_SITO, 'url': SITE + '/', 'name': 'produkts.it', 'alternateName': ['Karim Ismail', 'produkts'],
        'inLanguage': 'it-IT', 'publisher': {'@id': ID_PRODUKTS}, 'about': {'@id': ID_KARIM}}
SCHEMA = {
    'index.html': [PERSONA, PRODUKTS, SITO],
    'chi-sono.html': [{'@type': 'ProfilePage', '@id': SITE + '/chi-sono#pagina', 'url': SITE + '/chi-sono',
                       'name': 'Chi sono — Karim Ismail', 'isPartOf': {'@id': ID_SITO}, 'mainEntity': {'@id': ID_KARIM}}, PERSONA],
}

a = lambda s: html.escape(s, quote=True)


def testo(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()


def descrizione(nome, s):
    if nome in DESCR:
        return DESCR[nome]
    # Pagine dei lavori: la riga di "Il progetto" più il ruolo di Karim (il nome aiuta chi cerca "Karim Ismail")
    m = re.search(r'>Il progetto</span>\s*<p[^>]*>(.*?)</p>', s, re.S)
    r = re.search(r'>Il mio ruolo</dt>\s*<dd[^>]*>(.*?)</dd>', s, re.S)
    d = testo(m.group(1)) if m else ''
    g = re.search(r'>Regia</dt>\s*<dd[^>]*>(.*?)</dd>', s, re.S)
    if g:
        d += ' Regia di %s.' % testo(g.group(1)).replace(', ', ' e ')
    if r:
        ruolo = testo(r.group(1))
        d += ' Karim Ismail: %s.' % (ruolo[:1].lower() + ruolo[1:] if ruolo[1:2].islower() else ruolo)
    return d.strip()


def immagine(nome, s):
    if nome in IMG:
        return IMG[nome]
    m = re.search(r'<img class="kb" src="([^"]+)"', s)  # copertina delle pagine dei lavori
    if m:
        src = m.group(1)
        return src if src.startswith('http') else SITE + '/' + src.lstrip('/')
    return OG


pagine = []
for f in sorted(glob.glob(os.path.join(REPO, '*.html'))):
    nome = os.path.basename(f)
    if nome in ESCLUSE:
        continue
    s = open(f, encoding='utf-8').read()
    titolo = testo(re.search(r'<title>(.*?)</title>', s, re.S).group(1))
    url = SITE + '/' if nome == 'index.html' else SITE + '/' + nome[:-5]
    d = descrizione(nome, s)
    blocco = ['<!-- seo -->',
              '<meta name="description" content="%s">' % a(d),
              '<link rel="canonical" href="%s">' % url,
              '<meta property="og:type" content="website">',
              '<meta property="og:site_name" content="produkts.it">',
              '<meta property="og:locale" content="it_IT">',
              '<meta property="og:title" content="%s">' % a(titolo),
              '<meta property="og:description" content="%s">' % a(d),
              '<meta property="og:url" content="%s">' % url,
              '<meta property="og:image" content="%s">' % immagine(nome, s),
              '<meta name="twitter:card" content="summary_large_image">']
    if nome in SCHEMA:
        blocco.append('<script type="application/ld+json">%s</script>'
                      % json.dumps({'@context': 'https://schema.org', '@graph': SCHEMA[nome]}, ensure_ascii=False))
    blocco.append('<!-- /seo -->')
    blocco = '\n'.join(blocco)
    s = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', s, flags=re.S)
    s = re.sub(r'(</title>)', lambda m: m.group(1) + '\n' + blocco, s, count=1)
    with open(f, 'w', encoding='utf-8', newline='\n') as out:
        out.write(s)
    pagine.append(url)

oggi = datetime.date.today().isoformat()
pagine.sort(key=lambda u: (u != SITE + '/', u))
with open(os.path.join(REPO, 'sitemap.xml'), 'w', encoding='utf-8', newline='\n') as out:
    out.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
              + ''.join('<url><loc>%s</loc><lastmod>%s</lastmod></url>\n' % (u, oggi) for u in pagine) + '</urlset>\n')
with open(os.path.join(REPO, 'robots.txt'), 'w', encoding='utf-8', newline='\n') as out:
    out.write('User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: %s/sitemap.xml\n' % SITE)
print('seo', len(pagine), 'pagine')
