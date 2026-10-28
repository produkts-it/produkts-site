// Lettura di una cartella condivisa di Aruba Drive (Nextcloud) attraverso il suo link pubblico (https://xxx.arubadrive.com/s/TOKEN).
// Il sito non conosce la password di Aruba: usa solo il link, in sola lettura. Struttura attesa: cartella madre con sottocartelle
// (una per sezione: Preparativi, Cerimonia…); le foto sciolte nella cartella madre finiscono in una sezione senza nome.
// Aruba risponde solo come a un browser: prima si apre la pagina del link (cookie + requesttoken), poi si interroga il WebDAV pubblico.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 produkts.it';
const IMMAGINI = /^image\/(jpeg|png|webp|heic|heif|tiff)$/;

/** "https://q43tud.arubadrive.com/s/aR9PAByxneqdDgx" → { base, token }; null se non è un link di condivisione. */
export function link(url) {
  const m = /^(https:\/\/[a-z0-9.-]+)\/(?:index\.php\/)?s\/([A-Za-z0-9]{8,64})\/?(?:[?#].*)?$/.exec(String(url || '').trim());
  return m ? { base: m[1], token: m[2] } : null;
}

const sessioni = new Map(); // token → { cookie, rt, scade }

async function sessione(l, nuova = false) {
  const s = sessioni.get(l.token);
  if (s && !nuova && s.scade > Date.now()) return s;
  const r = await fetch(l.base + '/s/' + l.token, { headers: { 'user-agent': UA }, redirect: 'follow' });
  if (!r.ok) throw new Error('link Aruba non raggiungibile (' + r.status + ')');
  const html = await r.text();
  const rt = (/data-requesttoken="([^"]+)"/.exec(html) || [])[1] || '';
  const cookie = (r.headers.getSetCookie ? r.headers.getSetCookie() : [r.headers.get('set-cookie') || ''])
    .map((c) => c.split(';')[0]).filter(Boolean).join('; ');
  const nuovaS = { cookie, rt, scade: Date.now() + 15 * 60 * 1000 };
  sessioni.set(l.token, nuovaS);
  return nuovaS;
}

/** fetch verso Aruba con la sessione del link; se la sessione è scaduta la rinnova e riprova una volta. */
async function chiedi(l, url, init = {}) {
  for (let i = 0; i < 2; i++) {
    const s = await sessione(l, i > 0);
    const r = await fetch(url, { ...init, headers: { 'user-agent': UA, 'x-requested-with': 'XMLHttpRequest', cookie: s.cookie, requesttoken: s.rt, ...(init.headers || {}) } });
    if (r.status !== 401 && r.status !== 403) return r;
  }
  throw new Error('Aruba ha rifiutato la richiesta');
}

const davUrl = (l, path) => l.base + '/public.php/dav/files/' + l.token + path.split('/').map(encodeURIComponent).join('/');

const PROP = '<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:getcontenttype/><d:getcontentlength/><d:getlastmodified/><d:getetag/><d:resourcetype/></d:prop></d:propfind>';

async function elenca(l, path) {
  const r = await chiedi(l, davUrl(l, path), { method: 'PROPFIND', headers: { depth: '1', 'content-type': 'application/xml' }, body: PROP });
  if (r.status !== 207) throw new Error('cartella non leggibile (' + r.status + ')');
  const xml = await r.text();
  const voci = [];
  for (const blocco of xml.split(/<d:response>/).slice(1)) {
    const href = decodeURIComponent((/<d:href>([^<]+)</.exec(blocco) || [])[1] || '');
    const rel = href.split('/' + l.token)[1] || '/';
    if (rel.replace(/\/$/, '') === path.replace(/\/$/, '')) continue; // la cartella stessa
    const dir = /<d:collection\s*\/>/.test(blocco);
    const nome = rel.replace(/\/$/, '').split('/').pop();
    if (!nome || nome.startsWith('.')) continue;
    voci.push({ nome, path: rel.replace(/\/$/, ''), dir, mime: (/<d:getcontenttype>([^<]*)</.exec(blocco) || [])[1] || '',
      size: +((/<d:getcontentlength>([^<]*)</.exec(blocco) || [])[1] || 0),
      mod: Date.parse((/<d:getlastmodified>([^<]*)</.exec(blocco) || [])[1] || '') || 0,
      // versione del file: cambia quando Karim lo sostituisce su Aruba (serve per anteprime e "Aggiorna")
      v: ((/<d:getetag>([^<]*)</.exec(blocco) || [])[1] || '').replace(/&quot;/g, '').replace(/[^A-Za-z0-9]/g, '').slice(0, 16) });
  }
  const naturale = new Intl.Collator('it', { numeric: true, sensitivity: 'base' });
  return voci.sort((a, b) => naturale.compare(a.nome, b.nome));
}

const struttureCache = new Map(); // token → { dati, scade }

/** { sezioni: [{ nome, foto: [{ path, nome, size, mod, v }] }], totale, peso } — rilette al massimo ogni 5 minuti,
 *  e subito se Karim ha premuto "Aggiorna" dopo l'ultima lettura (`dopo` = quel momento in ms). */
export async function struttura(l, fresca = false, dopo = 0) {
  const c = struttureCache.get(l.token);
  if (c && !fresca && c.scade > Date.now() && c.letta > dopo) return c.dati;
  const radice = await elenca(l, '/');
  const foto = (v) => v.filter((x) => !x.dir && IMMAGINI.test(x.mime)).map((x) => ({ path: x.path, nome: x.nome, size: x.size, mod: x.mod, v: x.v }));
  const sezioni = [];
  const sciolte = foto(radice);
  if (sciolte.length) sezioni.push({ nome: '', foto: sciolte });
  for (const dir of radice.filter((x) => x.dir)) {
    const f = foto(await elenca(l, dir.path));
    if (f.length) sezioni.push({ nome: dir.nome, foto: f });
  }
  const tutte = sezioni.flatMap((s) => s.foto);
  const dati = { sezioni, totale: tutte.length, peso: tutte.reduce((n, f) => n + f.size, 0) };
  struttureCache.set(l.token, { dati, scade: Date.now() + 5 * 60 * 1000, letta: Date.now() });
  return dati;
}

/** Anteprima generata da Aruba (lato lungo `lato` px). */
export function anteprima(l, path, lato) {
  return chiedi(l, l.base + '/index.php/apps/files_sharing/publicpreview/' + l.token + '?file=' + encodeURIComponent(path) + '&x=' + lato + '&y=' + lato + '&a=1');
}

/** Originale a piena qualità. */
export function originale(l, path) {
  return chiedi(l, davUrl(l, path));
}

/** Zip di una cartella ('' = tutta la galleria). */
export function zip(l, path) {
  return chiedi(l, l.base + '/s/' + l.token + '/download?path=' + encodeURIComponent(path || '/'));
}
