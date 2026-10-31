"""Pagine di errore del sito (errori/<codice>.html), generate da 404.html: stessa grafica, testo e pulsanti diversi.
Le collega agli errori veri functions/_middleware.js. Lanciato da build.py; per cambiare un testo modificare ERRORI e rilanciare."""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.join(HERE, '..', '..')
WA = 'https://wa.me/393711444875'

# codice: (titolo della scheda, etichetta in alto a sinistra, frase grande, testo, pulsanti)
# pulsanti: 'home' = Torna alla home + Guarda Dynamis; 'riprova' = Riprova + Scrivimi su WhatsApp; 'clienti' = Torna alla home + Area clienti
ERRORI = {
    400: ('Richiesta non valida', 'Segnale · disturbato', 'Segnale disturbato.',
          'Qualcosa nell’indirizzo non torna. Controlla il link o riparti dalla home.', 'home'),
    401: ('Accesso riservato', 'Set · solo con il pass', 'Solo con il pass.',
          'Per vedere questa pagina serve un accesso. Se hai il codice della tua galleria, entra da Area clienti.', 'clienti'),
    403: ('Accesso negato', 'Set · porte chiuse', 'Set chiuso.',
          'Questa parte del sito non è aperta al pubblico. Il resto è tutto da guardare.', 'home'),
    405: ('Operazione non consentita', 'Ciak · non previsto', 'Ciak non previsto.',
          'Questa pagina si può solo guardare: l’operazione richiesta non è consentita. Riparti dalla home.', 'home'),
    410: ('Pagina rimossa', 'Archivio · fine riprese', 'Fine delle riprese.',
          'Questa pagina c’era, ma non esiste più: veniva dal vecchio sito. Quello nuovo parte da qui.', 'home'),
    429: ('Troppe richieste', 'Buffer · pieno', 'Buffer pieno.',
          'Troppe richieste in poco tempo. Aspetta qualche secondo e riprova.', 'riprova'),
    500: ('Errore del sito', 'Rec · errore di registrazione', 'Si rigira.',
          'Qualcosa è andato storto dalla mia parte. Riprova tra un attimo; se continua, scrivimi.', 'riprova'),
    502: ('Collegamento interrotto', 'Segnale · perso', 'Segnale perso.',
          'Il collegamento con un servizio esterno si è interrotto. Riprova tra poco.', 'riprova'),
    503: ('Sito in manutenzione', 'Pausa · cambio scena', 'Cambio scena.',
          'Il sito è in manutenzione per qualche minuto. Torna tra poco: si riparte.', 'riprova'),
    504: ('Tempo scaduto', 'Timeout · attesa', 'Attesa troppo lunga.',
          'La risposta non è arrivata in tempo. Riprova tra poco.', 'riprova'),
}

BTN = '<a href="%s" class="btn" style="padding: 16px 28px; background: #E8E4DF; color: #080808; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase"%s>%s</a>'
BTN2 = '<a href="%s"%s style="padding: 15px 28px; border: 1px solid #3A3A3A; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase">%s</a>'
FUORI = ' target="_blank" rel="noopener"'
PULSANTI = {
    'home': None,  # quelli della 404
    'clienti': BTN % ('/', '', 'Torna alla home') + '\n' + BTN2 % ('/area-clienti', '', 'Area clienti'),
    'riprova': BTN % ('', ' onclick="location.reload();return false"', 'Riprova') + '\n'
               + BTN2 % (WA, FUORI, 'Scrivimi su WhatsApp <span aria-hidden="true">↗</span>'),
}


def sostituisci(s, vecchio, nuovo):
    assert s.count(vecchio) == 1, vecchio
    return s.replace(vecchio, nuovo)


base = open(os.path.join(REPO, '404.html'), encoding='utf-8').read()
m = re.search(r'(<a href="/" class="btn".*?</a>\n<a href="https://www\.youtube\.com.*?</a>)', base, re.S)
os.makedirs(os.path.join(REPO, 'errori'), exist_ok=True)
for codice, (titolo, etichetta, frase, testo, pulsanti) in ERRORI.items():
    s = base
    s = sostituisci(s, '<title>Pagina non trovata — produkts.it</title>', '<title>%s — produkts.it</title>' % titolo)
    s = re.sub(r'/\* 404 pubblica di produkts\.it.*?\*/', '/* Pagina di errore %d di produkts.it: generata da 404.html con _design/bozza/errori.py, non modificarla a mano */' % codice, s)
    s = sostituisci(s, '</span>AF · ricerca fuoco</span>', '</span>%s</span>' % etichetta)
    s = sostituisci(s, '>ERR 404</span>', '>ERR %d</span>' % codice)
    s = sostituisci(s, '>404</h1>', '>%d</h1>' % codice)
    s = sostituisci(s, '>Fuori fuoco.</p>', '>%s</p>' % frase)
    s = sostituisci(s, '>Questa pagina non esiste o è stata spostata. Rimettiamo a fuoco da qui.</p>', '>%s</p>' % testo)
    if PULSANTI[pulsanti]:
        s = sostituisci(s, m.group(1), PULSANTI[pulsanti])
    with open(os.path.join(REPO, 'errori', '%d.html' % codice), 'w', encoding='utf-8', newline='\n') as out:
        out.write(s)
print('errori', len(ERRORI), 'pagine')
