// Lavori dal pannello: legge e aggiorna _design/bozza/lavori.json su GitHub con un commit per ogni salvataggio
// (insieme a fotogramma e copertina). Cloudflare Pages vede il commit e ripubblica il sito, rigenerando le pagine
// con _design/pubblica.sh (lavori.py + build.py). Serve il segreto GITHUB_TOKEN nelle impostazioni di Pages:
// token "fine-grained" di GitHub, solo per il repository produkts-site, permesso Contents in lettura e scrittura.

const REPO = 'produkts-it/produkts-site';
const FILE = '_design/bozza/lavori.json';
// Indirizzi già usati dal sito: un lavoro non può chiamarsi così
const RISERVATI = new Set(['index', 'lavori', 'chi-sono', 'recensioni', 'contatti', 'privacy', 'dynamis', 'fotografia', 'galleria',
  'area-clienti', '404', 'admin', 'api', 'img', 'assets', 'brand', 'functions', 'sitemap', 'robots', 'og', 'favicon']);
const CATS = ['Cortometraggio', 'Videoclip', 'Video aziendale', 'Opera personale'];

/** Ramo su cui salvare: produkts.it → main; anteprima <ramo>.produkts-site.pages.dev → quel ramo. */
export function ramo(request, env) {
  if (env.GITHUB_BRANCH) return env.GITHUB_BRANCH;
  const host = new URL(request.url).hostname;
  const m = host.match(/^([a-z0-9-]+)\.produkts-site\.pages\.dev$/);
  if (!m) return 'main';
  if (/^[0-9a-f]{8}$/.test(m[1])) throw new Error('Apri il pannello dall’indirizzo del ramo (…-ramo.produkts-site.pages.dev), non da quello di un singolo aggiornamento.');
  return m[1];
}

async function gh(env, path, opz = {}) {
  if (!env.GITHUB_TOKEN) throw new Error('Manca la chiave GitHub (GITHUB_TOKEN) nelle impostazioni di Cloudflare Pages.');
  const r = await fetch('https://api.github.com/repos/' + REPO + path, {
    ...opz,
    headers: {
      authorization: 'Bearer ' + env.GITHUB_TOKEN, accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28', 'user-agent': 'produkts-pannello',
      ...(opz.body ? { 'content-type': 'application/json' } : {}),
    },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(r.status === 401 ? 'La chiave GitHub non è valida o è scaduta.' : 'GitHub: ' + (j.message || r.status));
    e.stato = r.status;
    throw e;
  }
  return j;
}

function daBase64(b64) {
  const bin = atob(b64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

async function stato(env, branch) {
  const ref = await gh(env, '/git/ref/heads/' + encodeURIComponent(branch));
  const commit = await gh(env, '/git/commits/' + ref.object.sha);
  const f = await gh(env, '/contents/' + FILE + '?ref=' + ref.object.sha);
  return { head: ref.object.sha, tree: commit.tree.sha, dati: JSON.parse(daBase64(f.content)) };
}

/** Dati attuali dei lavori, letti dal ramo. */
export async function leggi(env, branch) {
  const s = await stato(env, branch);
  return { dati: s.dati, ramo: branch, versione: s.head };
}

// ---- Controllo dei dati che arrivano dal pannello ----
const str = (v, max = 300) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const nome = (v) => str(v, 120);
function coppie(v, max = 60) {
  return (Array.isArray(v) ? v : []).slice(0, max).filter(Array.isArray).map((x) => [str(x[0], 120), x[1]]);
}

function pulisciLavoro(l, gruppo, esistente) {
  const out = {};
  out.slug = esistente ? esistente.slug : str(l.slug, 60).toLowerCase();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(out.slug)) throw new Error('Indirizzo della pagina non valido: solo lettere minuscole, numeri e trattini.');
  out.t = str(l.t, 120);
  if (!out.t) throw new Error('Manca il titolo.');
  const link = str(l.yt || '', 20) ? { yt: str(l.yt, 20) } : str(l.vimeo || '', 40) ? { vimeo: str(l.vimeo, 40) } : null;
  if (!link) throw new Error('Manca il link al video (YouTube o Vimeo).');
  if (link.yt && !/^[\w-]{6,20}$/.test(link.yt)) throw new Error('Link YouTube non valido.');
  if (link.vimeo && !/^\d{5,12}(\/[0-9a-f]{6,16})?$/.test(link.vimeo)) throw new Error('Link Vimeo non valido.');
  out.line = str(l.line, 400);
  if (!out.line) throw new Error('Manca la riga del progetto.');
  const cast = coppie(l.cast).map(([p, n]) => [p, nome(n)]).filter((x) => x[1]);

  if (gruppo === 'amarcord') {
    Object.assign(out, { img: '', gen: str(l.gen, 60), ruolo: str(l.ruolo, 120), min: Math.max(1, Math.min(600, parseInt(l.min, 10) || 0)) }, link);
    if (!out.vimeo) throw new Error('I corti AMARCORD hanno il link Vimeo.');
    const anno = str(l.anno, 4);
    if (anno && anno !== '2026') out.anno = anno;
    if (!out.ruolo) throw new Error('Manca il tuo ruolo.');
    if (!(parseInt(l.min, 10) > 0)) throw new Error('Manca la durata in minuti.');
    out.cast = cast;
    out.crew = coppie(l.crew).map(([r, v]) => [r, (Array.isArray(v) ? v : [v]).map(nome).filter(Boolean)]).filter((x) => x[0] && x[1].length);
    if (!out.crew.some((x) => x[0] === 'Regia')) throw new Error('Nella troupe manca la regia.');
    // stesso ordine di chiavi dei corti già presenti
    return { slug: out.slug, img: out.img, t: out.t, gen: out.gen, ruolo: out.ruolo, min: out.min, vimeo: out.vimeo, ...(out.anno ? { anno: out.anno } : {}), line: out.line, cast: out.cast, crew: out.crew };
  }

  const year = str(l.year, 4);
  if (!/^\d{4}$/.test(year)) throw new Error('Anno non valido.');
  const cats = (Array.isArray(l.cats) ? l.cats : []).filter((c) => CATS.includes(c));
  if (!cats.length) throw new Error('Scegli il tipo di lavoro.');
  const r = {
    slug: out.slug, t: out.t, ...(str(l.sub, 120) ? { sub: str(l.sub, 120) } : {}), year, date: str(l.date, 60),
    ...link, img: '', cats, kicker: str(l.kicker, 120), line: out.line,
    role: str(l.role, 200), role_short: str(l.role_short, 80),
    meta: coppie(l.meta, 8).map(([k, v]) => [k, str(v, 160)]).filter((x) => x[0] && x[1]),
    // il terzo elemento del cast (vecchia nota "anche in", ormai automatica) resta com'era
    ...(cast.length ? { cast: cast.map(([p, n]) => [p, n, ((esistente && esistente.cast) || []).filter((c) => c[1] === n).map((c) => c[2])[0] ?? null]) } : {}),
    crew: coppie(l.crew).map(([k, v]) => [k, str(Array.isArray(v) ? v.join(', ') : v, 400)]).filter((x) => x[0] && x[1]),
  };
  if (esistente && esistente.pos) r.pos = esistente.pos;
  if (!r.role || !r.role_short) throw new Error('Manca il tuo ruolo (completo e breve).');
  if (!r.meta.length) throw new Error('Manca almeno un dato (artista, cliente o produzione).');
  if (!r.crew.length) throw new Error('Manca la troupe.');
  return r;
}

function b64Jpeg(v) {
  if (typeof v !== 'string' || !v) return null;
  const s = v.replace(/^data:image\/jpeg;base64,/, '');
  if (s.length > 2_000_000 || !/^[A-Za-z0-9+/=]+$/.test(s) || !s.startsWith('/9j/')) throw new Error('Immagine non valida (serve un JPEG sotto 1,5 MB).');
  return s;
}

/**
 * Salva un lavoro (nuovo o modificato) con un commit sul ramo.
 * d = { gruppo: 'lavori'|'amarcord', nuovo: bool, lavoro: {...}, filmografia: { mostra, ruolo, produzione } | null,
 *       fotogramma: base64 JPEG | null, copertina: base64 JPEG | null }
 */
export async function salva(env, branch, d) {
  const gruppo = d.gruppo === 'amarcord' ? 'amarcord' : 'lavori';
  const fotogramma = b64Jpeg(d.fotogramma), copertina = b64Jpeg(d.copertina);
  for (let tentativo = 0; tentativo < 2; tentativo++) {
    const s = await stato(env, branch);
    const dati = s.dati, lista = dati[gruppo];
    const slug = str(d.lavoro && d.lavoro.slug, 60).toLowerCase();
    const i = lista.findIndex((x) => x.slug === slug);
    if (d.nuovo) {
      if (i >= 0 || RISERVATI.has(slug) || dati.lavori.some((x) => x.slug === slug) || dati.amarcord.some((x) => x.slug === slug)) {
        throw new Error('Esiste già una pagina con questo indirizzo: cambia il titolo o l’indirizzo.');
      }
    } else if (i < 0) throw new Error('Lavoro non trovato: forse è stato cambiato da un’altra parte. Ricarica il pannello.');
    const esistente = d.nuovo ? null : lista[i];
    if (esistente && esistente.page === false) throw new Error('Questa pagina è fatta a mano: chiedi a Claude di modificarla.');

    const l = pulisciLavoro(d.lavoro || {}, gruppo, esistente);
    const cartella = gruppo === 'amarcord' ? 'img/amarcord/' : 'img/lavori/';
    const file = [];
    // L'immagine non arriva come indirizzo dal pannello: o quella che c'era, o il fotogramma nuovo caricato
    if (esistente) l.img = esistente.img;
    if (fotogramma) { l.img = cartella + l.slug + '.jpg'; file.push({ path: l.img, b64: fotogramma }); }
    if (!l.img && l.yt) l.img = 'https://i.ytimg.com/vi/' + l.yt + '/maxresdefault.jpg';
    if (copertina) file.push({ path: 'img/copertine/' + l.slug + '.jpg', b64: copertina });

    if (d.nuovo) {
      if (gruppo === 'amarcord') lista.unshift(l);
      else {
        // dal più recente: prima del primo lavoro di un anno precedente
        const j = lista.findIndex((x) => x.year < l.year);
        lista.splice(j < 0 ? lista.length : j, 0, l);
      }
    } else lista[i] = l;

    // Filmografia (solo cinema): una riga [titolo, ruolo, produzione, pagina]
    const f = d.filmografia;
    if (f && typeof f.mostra === 'boolean') {
      const fi = dati.filmografia.findIndex((r) => r[3] === l.slug || (!r[3] && r[0].toLowerCase() === l.t.toLowerCase()));
      if (f.mostra) {
        const riga = [fi >= 0 ? dati.filmografia[fi][0] : l.t, str(f.ruolo, 120) || (gruppo === 'amarcord' ? l.ruolo : l.role_short),
          str(f.produzione, 80) || (gruppo === 'amarcord' ? 'AMARCORD' : 'produkts.it'), l.slug];
        if (fi >= 0) dati.filmografia[fi] = riga;
        else dati.filmografia.splice(1, 0, riga); // subito dopo Dynamis
      } else if (fi >= 0 && dati.filmografia[fi][3] === l.slug) dati.filmografia.splice(fi, 1);
    }

    const testo = JSON.stringify(dati, null, 1) + '\n';
    const blob = async (content, encoding) => (await gh(env, '/git/blobs', { method: 'POST', body: JSON.stringify({ content, encoding }) })).sha;
    const tree = [{ path: FILE, mode: '100644', type: 'blob', sha: await blob(testo, 'utf-8') }];
    for (const x of file) tree.push({ path: x.path, mode: '100644', type: 'blob', sha: await blob(x.b64, 'base64') });
    const t = await gh(env, '/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: s.tree, tree }) });
    const c = await gh(env, '/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message: (d.nuovo ? 'Pannello: nuovo lavoro «' : 'Pannello: aggiornato «') + l.t + '»', tree: t.sha, parents: [s.head] }),
    });
    try {
      await gh(env, '/git/refs/heads/' + encodeURIComponent(branch), { method: 'PATCH', body: JSON.stringify({ sha: c.sha, force: false }) });
      return { ok: true, slug: l.slug, commit: c.sha, ramo: branch };
    } catch (err) {
      if (err.stato !== 422 || tentativo) throw err; // qualcun altro ha salvato nel frattempo: riprova sui dati nuovi
    }
  }
}
