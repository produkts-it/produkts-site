# produkts.it — nota di passaggio per Claude Code

Sito di Karim Ismail (produkts.it), fotografo, videomaker e D.O.P. ad Altamura (BA). Comunicazione sempre in italiano.

## Stato attuale
- **Online (root del repo):** pagina "work in progress" (`index.html`) pubblicata con GitHub Pages su produkts.it (file `CNAME`). Ogni push su `main` va online.
- **Bozza del sito completo (`/bozza/`):** il sito vero si costruisce in `bozza/` ed è visibile su produkts.it/bozza. Non è segreto (il repo è pubblico e chiunque abbia il link lo vede), solo escluso dai motori di ricerca con `<meta name="robots" content="noindex, nofollow">` su ogni pagina. Quando sarà pronto, prenderà il posto della pagina WIP nella root.
  - Pagine (convertite dai mockup, ora sono loro la fonte da modificare): `index.html` (Home), `dynamis.html`, `lavori.html`, `chi-sono.html`, `recensioni.html`, `contatti.html`, `privacy.html`; spente (non nel menu): `fotografia.html`, `galleria.html`, `area-clienti.html`. Fotogrammi in `bozza/img/fotogrammi/`.
  - Stile comune in `bozza/assets/site.css`. `bozza/assets/site.js` (intro, cursore, menu, azioni `data-act`) si genera con `python _design/bozza/build.py` da `_design/bozza/site.src.js`: non modificarlo a mano.
  - I moduli (contatti, recensioni) e i codici galleria per ora non inviano/verificano nulla: mostrano solo lo stato di conferma.
- **404 pubblica:** `404.html` nella root, autonoma (percorsi assoluti, nessun link alla bozza).
- Le pagine riservano lo spazio della barra di scorrimento su entrambi i lati (`scrollbar-gutter: stable both-edges`) per restare centrate.
- **Sorgente della pagina WIP:** `_design/wip/wip-body.html` + `_design/wip/build.py` (genera `index.html`: `python _design/wip/build.py`). Il cursore custom è anche in `_design/wip/cursor.js`.
- **Progetto del sito completo (non ancora online):** `_design/pagine/*.dc.html`, mockup per pagina (Home=Main, Dynamis=Work, Recensioni, Galleria, Archivio, ChiSono, Contatti, Fotografia, Privacy, NotFound, AreaClienti, componente Menu). Sono file del formato canvas di Claude Design: struttura e testi sono la base per costruire il sito vero in HTML statico. Le cartelle che iniziano con `_` non vengono pubblicate da GitHub Pages.
- Foto, Area clienti e Galleria per ora restano spente. Galleria clienti: pagine raggiungibili solo tramite link diretto (stile Pixieset).

## Immagini
- Brand: `brand/*.svg` (logo verticale/orizzontale, monogrammi PRK, simbolo). La scritta del logo è #231f20: sul fondo scuro va resa in chiaro.
- Nei mockup le immagini puntano a `/_blob/<id>`. Corrispondenze:
  - copertina Dynamis → `dynamis.jpg`; alloro VerticalMovie → `laurel.png`
  - /_blob/075df78bb6c6e29ab0b132ccd419c5a1 → fotogrammi/dynamis-01.jpg
  - /_blob/d8325ba5cfe1b76465d08a485f943a31 → fotogrammi/dynamis-02.jpg
  - /_blob/e38f08494aa33a69335aa9903b5e66eb → fotogrammi/dynamis-03.jpg
  - /_blob/733c6f39df667a23cf16d671938489a9 → fotogrammi/dynamis-04.jpg
  - /_blob/a3abe35287cae900608278b337f7beb1 → fotogrammi/dynamis-05.jpg
  - /_blob/92891a0fb47eeb55153346768ea3154a → fotogrammi/dynamis-06.jpg
  - /_blob/86dab1dcba147bf4cc3368ed569b2c0f → fotogrammi/dynamis-07.jpg
  - /_blob/45be1765de948540cb296d2ec58e43ef → fotogrammi/dynamis-08.jpg
  - /_blob/d66f7915d7561eb1c39b6f9527220516 → fotogrammi/dynamis-09.jpg
  - /_blob/c000b6c249130eb1f19754fb686a0bc4 → fotogrammi/dynamis-10.jpg
  - /_blob/e4f175b918eac5328052e76e005a6f25 → fotogrammi/dynamis-11.jpg
  - /_blob/46c47a586d52ef967ac69c662851a2a1 → fotogrammi/dynamis-12.jpg
  - /_blob/e8bbf15513681fb2fd028649b20bc108 → fotogrammi/dynamis-13.jpg
  - /_blob/dcb6e0e0068a7e1569ed48b1f736e37b → fotogrammi/dynamis-14.jpg
  - /_blob/1b1a0fd7cc7fca35f6b4b479455f90ac → fotogrammi/dynamis-15.jpg
  - /_blob/3f6ec5721323414d070935f1f2ca448a → fotogrammi/dynamis-16.jpg

## Regole decise con Karim (rispettarle sempre)
- Tutto animato: ogni transizione e movimento di pagina, sempre (rispettando prefers-reduced-motion).
- Intro del logo: solo all'ingresso sul sito e alla ricarica, mai nella navigazione interna o col tasto indietro. Uscita morbida (logo sfuma, sipario sale).
- Cursore custom: cerchietto con leggero ritardo; aggancio (lock-on) a link e pulsanti prendendone la forma con ~7px di padding; sfocatura animata breve su titoli e parole chiave; mai visibile su touch; nessuna sfocatura alla pressione.
- Selezione testo: arancio senza sfondo; il testo già arancio diventa blu.
- Nessuno scroll orizzontale su nessuna pagina, su nessuno schermo (testare 320/360/390/768/1440).
- Fotogrammi sempre in 3:2 verticale (2:3). Da PC carosello a 4 alla volta, da telefono carosello piccolo.
- Cortometraggi: niente sinossi (no spoiler). Per ora solo Dynamis tra i corti; le anteprime video sempre mute; il film completo è su YouTube.
- Recensioni: alcune in evidenza + "Guarda tutte"; filtri per evento; testi dei clienti mai corretti; nome + iniziale del cognome. Se il servizio è "Altro", chiedere quale.
- Palette: fondo #080808, testo #E8E4DF, arancio #B46428 / #D98A4E, blu #336699. Font: Cormorant Garamond (titoli) + Space Grotesk.
- Contatti pubblici: info@produkts.it, karim@produkts.it, WhatsApp +39 371 144 4875, YouTube @produkts-it.
- Zero spese aggiuntive: hosting gratuito (GitHub Pages).

## Dominio e DNS (non toccare senza motivo)
- produkts.it è registrato su IONOS nel contratto "IONOS Pack Dominio"; il vecchio WordPress Hosting è in disdetta.
- DNS: A @ → 185.199.108-111.153 (GitHub), CNAME www → produkts-it.github.io.
- Email su **Zoho**: record MX mx/mx2/mx3.zoho.eu, SPF, DKIM (zmail._domainkey), zb19768698 → zmverify.zoho.eu. Non modificarli mai.
