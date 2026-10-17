# produkts.it — nota di passaggio per Claude Code

Riferimenti per Karim (link e guida): Google Drive, cartella "produkts.it — backup", documento "produkts.it — guida e collegamenti".

Sito di Karim Ismail (produkts.it), fotografo, videomaker e D.O.P. ad Altamura (BA). Comunicazione sempre in italiano.

## Stato attuale
- **Sito pubblicato il 17/10/2026** su produkts.it, servito da **Cloudflare Pages** (prima GitHub Pages, spento il 16/10/2026). Le pagine sono nella **root del repo**. Ogni push su `main` va online in 1-2 minuti; per modifiche grosse da far vedere a Karim prima, lavorare su un ramo: Cloudflare crea l'anteprima su `<ramo>.produkts-site.pages.dev` (nascosta a Google; lì i moduli possono non funzionare).
  - La vecchia pagina "work in progress" è archiviata in `_design/wip/` (non più online). I vecchi indirizzi `/bozza/...` portano alla pagina giusta (`_redirects`).
  - Google Search Console: proprietà di dominio `produkts.it` sull'account produkts.studio@gmail.com (verificata via Cloudflare il 17/10/2026), sitemap inviata.
  - Aperto ai motori di ricerca: `_design/bozza/seo.py` (lanciato da build.py) mette descrizione, canonical e anteprima dei link (Open Graph, immagine `og.jpg`) in ogni pagina tra `<!-- seo -->` e `<!-- /seo -->`, e rigenera `sitemap.xml` e `robots.txt`. Descrizioni delle pagine principali nel dizionario `DESCR` di seo.py; i lavori usano la riga "Il progetto".
  - Pagine (ora sono loro la fonte da modificare): `index.html` (Home), `dynamis.html`, `lavori.html`, `chi-sono.html`, `recensioni.html`, `contatti.html`, `privacy.html`; spente (non nel menu): `fotografia.html`, `galleria.html`, `area-clienti.html`. Pagine spente: `noindex` e fuori dalla sitemap. Fotogrammi in `img/fotogrammi/`.
  - Stile comune in `assets/site.css`. `assets/site.js` (intro, cursore, menu, azioni `data-act`) si genera con `python _design/bozza/build.py` da `_design/bozza/site.src.js`: non modificarlo a mano.
  - Lavori: elenco unico in `_design/bozza/lavori.py` (dati, credits, date). `python -X utf8 _design/bozza/lavori.py` rigenera (nella root) le pagine dei lavori semplici (schizophrenia, romance-anonimo, coseco, wake-up), griglia e filtri di `lavori.html`, "Lavori scelti" della Home e filmografie (blocchi tra `<!-- nome -->` e `<!-- /nome -->`: non modificarli a mano). `dynamis.html` è fatta a mano. Copertine: miniature YouTube (i.ytimg.com) quando non c'è un'immagine.
  - Dynamis: proiettato al VerticalMovie il 30/09/2026, nomination dell'01/10/2026, su YouTube dall'11/10/2026.
  - Dopo `lavori.py` lanciare sempre `python _design/bozza/build.py`: aggiorna le versioni `?v=` di site.js/site.css in tutte le pagine (evita file vecchi in cache) e poi la SEO (seo.py).
  - Video su Vimeo (Korvo, Troppo bella per loro): campo `vimeo` invece di `yt`, copertina da i.vimeocdn.com.
  - Filmografia (Home e Chi sono): **solo cinema** (cortometraggi, lungometraggi, film, docufilm, documentari); niente videoclip, social, corporate. La casa di produzione di Coseco si scrive **kontents.eu**. Il videoclip di Korvo si intitola «Hai perso».
  - Link interni **senza .html** (`href="chi-sono"`): Cloudflare Pages li risolve da solo (e reindirizza `x.html` → `x`). Anteprima locale con `python _design/serve.py 8081` (fa lo stesso e mostra la 404).
  - Foto e video del set in `img/set/`: ritratto di Karim sul red carpet (Chi sono), video dietro le quinte di Dynamis (`video.pk-loop`, muto, in loop: Studio della Home e pagina Dynamis), foto del red carpet (sezione "Dietro le quinte" di Dynamis). In Home la locandina di Dynamis è senza zoom e senza timecode (resta REC).
  - Corti AMARCORD 2026 (lista `AMARCORD` in lavori.py): **tutti "Cortometraggio"**, niente divisione in esercitazioni. Ognuno ha la sua pagina (`paranoia`, `sbaglio-dunque-esisto`, `parfum`, `la-sedia`, `la-seduta`, `l-inventario`, `il-tanga-e-la-cravatta`) con credits completi e link Vimeo. In Lavori stanno **nella griglia unica con tutti gli altri lavori** (filtro "AMARCORD"), niente sezione a parte. Schede di Lavori (`card()`): tipologia in arancio, fotogramma 2.39:1 con la freccia sopra, poi titolo (senza sottotitolo) e anno. Still in `img/amarcord/<slug>.jpg`, presi dai video stessi (le copertine automatiche di Vimeo sono solo il logo AMARCORD; il frame si legge dal `<video>` della pagina vimeo.com con un canvas). Senza `img` la pagina mostrerebbe un mirino scuro che porta al video. NON vanno messi "Troppo per poco" e "Verità e distorsione" (Karim non c'era). "Tra i piedi", "Spaghetti all'assassina", "Cuori in stand-by": solo filmografia finché non arrivano link e credits.
  - Nomi delle persone: costanti in lavori.py (GIADA, PIETRO, …), sempre scritti uguali. "Anche in…" è automatico (`INDICE`, `anche()`), in versione discreta: riga piccola sotto il nome, massimo due titoli + "+N", solo alla prima comparsa nella pagina. Vale per Dynamis (il blocco Credits di dynamis.html si genera da `DYNAMIS` tra `<!-- dynamis:credits -->`), i lavori e i corti AMARCORD. Karim e la produzione AMARCORD esclusi. Nuovi credits: aggiungerli ai dati e rilanciare lavori.py + build.py.
  - Menu: a destra un frame 4:5 per voce (`ITEMS` in site.src.js, file in `img/menu/`): Home = locandina Dynamis, Lavori = fotogramma Dynamis (dynamis-07), Chi sono = video di Karim alla camera (muto, in loop; poster se animazioni ridotte), Recensioni = frase fissa di Pietro G. (le recensioni di recensioni.html sono vere e scritte nella pagina, non in D1), Contatti = Karim nell'armadio sul set di Dynamis.
  - Ogni pagina ha nell'intestazione l'orologio con timecode di Altamura (come nella WIP), inserito da site.js; la 404 lo ha inline.
- **Chi è Karim (per i testi):** diploma Grafica e Comunicazione, I.T.T. Nervi Galilei Altamura (92/100); 2021 nasce gh0st.ph → inizio 2025 produkts.work → da luglio 2025 produkts.it (nuova brand identity in arrivo); da ottobre 2025 AMARCORD, DOP certificato (con Raffaele Mertes, Massimo Giuliani, Tiziana Lattuca, Giuseppe Maldera). Nel Percorso del sito NON vanno: Accademia di Belle Arti di Roma, Università di Bari (Marketing), Dambrosio Wrapping. Prossimi passi: festival, film, produzioni più grandi. Niente sezione "Kit".
  - Contatti: campo "Dove" con suggerimenti dai comuni ISTAT (`assets/comuni.json`, rigenerabile con `_design/bozza/comuni.py`) e campo "Quando" con calendario del sito (`PK.luoghi`, `PK.calendario` in site.src.js).
  - Moduli contatti e recensioni: funzionanti (API in `functions/`, dati in D1, anti-spam Turnstile). Le recensioni compaiono sul sito solo dopo l'approvazione nel pannello /admin. I codici galleria/area clienti invece non verificano ancora nulla.
  - Contatti: **telefono obbligatorio, niente email** (Karim ricontatta su WhatsApp). Il numero va nella colonna `recapito` di D1 (le richieste vecchie possono avere un'email lì). Nel pannello ogni richiesta ha il pulsante "Scrivi su WhatsApp".
  - Notifiche su Telegram a ogni nuova richiesta o recensione (`notifica()` in `functions/_lib.js`), con pulsanti WhatsApp e "Apri il pannello" (`/admin/#contatti`, `/admin/#recensioni`). Servono i segreti `TELEGRAM_TOKEN` e `TELEGRAM_CHAT_ID` nelle impostazioni di Pages; senza, non parte nulla e i moduli funzionano lo stesso.
  - Pannello /admin installabile sul telefono ("Aggiungi a schermata Home", `admin/manifest.webmanifest`); la password resta salvata sul dispositivo (localStorage) finché non si preme "Esci".
  - Notifiche push del pannello (le principali, Telegram è in più): pulsante "Attiva notifiche" nel pannello → `admin/sw.js` + `functions/_push.js` (Web Push/VAPID solo con WebCrypto). Chiavi VAPID create da sole al primo uso e salvate in D1 (tabella `impostazioni`), dispositivi nella tabella `push`; le tabelle si creano da sole (`CREATE TABLE IF NOT EXISTS`, anche in `migrations/0002_push.sql`). Su iPhone funzionano solo col pannello aperto dall'icona sulla Home. Telegram non avvisa il telefono se Telegram Web/Desktop è aperto e attivo.
- **Privacy (`privacy.html`, 16/10/2026):** scritta su come funziona davvero il sito (niente statistiche né cookie di profilazione → niente banner; video solo come link). Promette: richieste cancellate dopo 24 mesi, recensioni non pubblicate dopo 12 → lo fa `pulizia()` in `functions/_lib.js` a ogni invio dai moduli. Se si aggiungono servizi (statistiche, video incorporati, nuovi fornitori) aggiornare la pagina e la data.
- **404 pubblica:** `404.html` nella root, autonoma (percorsi assoluti), esclusa dai motori di ricerca.
- Le pagine riservano lo spazio della barra di scorrimento su entrambi i lati (`scrollbar-gutter: stable both-edges`) per restare centrate.
- **Vecchia pagina WIP (archivio):** `_design/wip/wip-body.html` + `_design/wip/build.py` (rigenera `_design/wip/index.html`, da cui build.py prende il logo dell'intro). Il cursore custom è in `_design/wip/cursor.js`.
- **Mockup originali:** `_design/pagine/*.dc.html`, mockup per pagina (Home=Main, Dynamis=Work, Recensioni, Galleria, Archivio, ChiSono, Contatti, Fotografia, Privacy, NotFound, AreaClienti, componente Menu). Formato canvas di Claude Design, ormai superati dalle pagine HTML. Vengono pubblicati solo i file copiati in `dist/` da `_design/pubblica.sh` (pagine `*.html`, `assets/`, `img/`, `brand/`, `admin/`, immagini della root, `_headers`, `_redirects`, robots e sitemap; niente `_design/`, `functions/` va a parte, niente CLAUDE.md).
- **Gallerie clienti (ottobre 2026):** le foto stanno su **Aruba Drive** (Nextcloud 32, server in Italia), non nel repo. Karim condivide la *cartella madre* con "Condividi tramite link"; le **sottocartelle sono le sezioni** della galleria. Nel pannello, scheda **Gallerie**: cliente, evento, data, link Aruba → il sito controlla il link e crea un **codice** (8 caratteri senza 0/O/1/I/L) e il **link diretto** `produkts.it/galleria?c=CODICE`, con pulsante "Manda su WhatsApp". Le gallerie restano per sempre (niente scadenza); si possono spegnere, cambiare codice o eliminare (le foto su Aruba restano). Dal pannello ("Ordine e copertina") si sceglie l'ordine delle sezioni (colonna `ordine`, JSON) e la foto di copertina (`copertina`); data con calendario e pulsante Oggi.
  - Foto aperta: sfondo sfocato, logo e orologio visibili ma non cliccabili (`html.g-lbx`), comandi in una notch in basso al centro (numero, Scarica, X). Aprire una foto aggiunge un passo alla cronologia: il tasto indietro del telefono chiude la foto e resta nella galleria.
  - Codice: `functions/_aruba.js` (legge il link come un browser: pagina `/s/TOKEN` per cookie + requesttoken, poi WebDAV pubblico `/public.php/dav/files/TOKEN` con `X-Requested-With`; anteprime da `publicpreview`, zip da `/s/TOKEN/download?path=`), `functions/_gallerie.js` (tabella D1 `gallerie`, creata da sola), `functions/api/galleria/[[percorso]].js` (dati, anteprime 480/1600 in cache Cloudflare, originali, zip) e la scheda nel pannello. Notifica a Karim alla prima apertura e a ogni "scarica tutto".
  - Pagine: `galleria.html` (codice o link diretto → copertina, sezioni, griglia, foto ingrandita con download) e `area-clienti.html` (si scrive il codice → galleria). "Area clienti" è nel menu, in basso. Entrambe `noindex`.
  - Screenshot: nessun blocco né avviso (deciso con Karim: sul web non si possono bloccare davvero).
- Fotografia resta spenta.

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
- Il nome si scrive sempre **produkts.it** (mai "Produkts"): filmografie, produzioni, footer, testi.
- Credits: quando una persona compare in più lavori (anche nei corti AMARCORD, i cui credits Karim manda man mano), accanto al nome va il rimando "Anche in …" con link, come Gianni Lorusso tra Schizophrenia e Dynamis (`cast_row`/`also` in lavori.py).
- Tutto animato: ogni transizione e movimento di pagina, sempre (rispettando prefers-reduced-motion).
- Intro del logo: solo all'ingresso sul sito e alla ricarica, mai nella navigazione interna o col tasto indietro. Uscita morbida (logo sfuma, sipario sale).
- Cursore custom: cerchietto con leggero ritardo; aggancio (lock-on) a link e pulsanti prendendone la forma con ~7px di padding; sfocatura animata breve su titoli e parole chiave; mai visibile su touch; nessuna sfocatura alla pressione.
- Selezione testo: arancio senza sfondo; il testo già arancio diventa blu.
- Nessuno scroll orizzontale su nessuna pagina, su nessuno schermo (testare 320/360/390/768/1440).
- Fotogrammi sempre in 3:2 verticale (2:3). Da PC carosello a 4 alla volta, da telefono carosello piccolo.
- Cortometraggi: niente sinossi (no spoiler), anche quando Karim manda i documenti con le trame: solo una riga di atmosfera. Tra i corti con pagina propria per ora solo Dynamis (quelli AMARCORD sono schede verso Vimeo); le anteprime video sempre mute; il film completo è su YouTube.
- Recensioni: alcune in evidenza + "Guarda tutte"; filtri per evento; testi dei clienti mai corretti; nome + iniziale del cognome. Se il servizio è "Altro", chiedere quale.
- Palette: fondo #080808, testo #E8E4DF, arancio #B46428 / #D98A4E, blu #336699. Font: Cormorant Garamond (titoli) + Space Grotesk.
- Contatti pubblici: info@produkts.it, karim@produkts.it, WhatsApp +39 371 144 4875, YouTube @produkts-it.
- Zero spese aggiuntive: hosting gratuito (Cloudflare Pages, piano Free; niente piani a pagamento né carta per Zero Trust).

## Cloudflare (migrazione completata il 16/10/2026)
- Account Cloudflare di produkts.studio@gmail.com. Segreti su Pages già impostati da Karim: `TURNSTILE_SECRET`, `ADMIN_PASSWORD` (per le notifiche anche `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`). Progetto Pages **produkts-site** collegato al repo (build `bash _design/pubblica.sh`, output `dist/`), anteprima su produkts-site.pages.dev. Ogni push su `main` pubblica su Pages. GitHub Pages è spento sul repo (sorgente "None", 16/10/2026) e il file CNAME, che serviva solo a lui, è stato tolto: non riattivarlo.
- D1 **produkts-moduli** (giurisdizione UE, id in `wrangler.toml`), tabelle in `migrations/`. Turnstile widget "produkts.it moduli" (chiave pubblica in `_design/bozza/site.src.js`; segreto `TURNSTILE_SECRET` nelle impostazioni di Pages).
- Zona produkts.it aggiunta (piano Free), DNS identici a IONOS, record del sito in "solo DNS". Nameserver Cloudflare: clint.ns.cloudflare.com, paislee.ns.cloudflare.com, **impostati su IONOS il 16/10/2026** (DNSSEC era spento; i DNS ora si gestiscono su Cloudflare, non più su IONOS). Zona attiva; produkts.it e www.produkts.it sono domini personalizzati del progetto Pages (CNAME → produkts-site.pages.dev, certificato automatico).
- Pannello /admin: protetto da password (segreto `ADMIN_PASSWORD` nelle impostazioni di Pages, messo da Karim; in locale file `.dev.vars`, escluso da git). Cloudflare Access resta opzionale (variabili ACCESS_TEAM/ACCESS_AUD).

## Dominio e DNS (non toccare senza motivo)
- Dal 16/10/2026 i record DNS stanno su **Cloudflare** (zona produkts.it); su IONOS restano solo registrazione e nameserver.
- produkts.it è registrato su IONOS nel contratto "IONOS Pack Dominio"; il vecchio WordPress Hosting è in disdetta.
- DNS (su Cloudflare): CNAME @ e www → produkts-site.pages.dev (gestiti da Pages).
- Email su **Zoho**: record MX mx/mx2/mx3.zoho.eu, SPF, DKIM (zmail._domainkey), zb19768698 → zmverify.zoho.eu. Non modificarli mai.
