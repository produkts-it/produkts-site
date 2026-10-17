// API pubbliche delle gallerie clienti (servono il codice):
//   GET /api/galleria?c=CODICE                       dati della galleria: cliente, titolo, data, sezioni e foto
//   GET /api/galleria/anteprima?c=CODICE&p=PATH&s=L  anteprima (L = 240 | 480 | 1600 px), dalla cache di Cloudflare quando c'è
//   GET /api/galleria/foto?c=CODICE&p=PATH           originale a piena qualità, come download
//   GET /api/galleria/zip?c=CODICE[&p=SEZIONE]       zip di tutta la galleria o di una sezione
import { json, notifica } from '../../_lib.js';
import { trova, ordina, copertina } from '../../_gallerie.js';
import * as aruba from '../../_aruba.js';

const nomeFile = (s) => String(s).replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim() || 'foto';

function scaricabile(r, nome, tipo) {
  const h = new Headers({ 'content-type': tipo || r.headers.get('content-type') || 'application/octet-stream', 'cache-control': 'private, no-store',
    'content-disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(nome) });
  const len = r.headers.get('content-length');
  if (len) h.set('content-length', len);
  return new Response(r.body, { status: 200, headers: h });
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const cosa = (params.percorso || [])[0] || '';
  const g = await trova(env, url.searchParams.get('c'));
  if (!g) return json({ errore: 'Codice non valido. Controlla il messaggio che ti ho mandato o scrivimi.' }, 404);
  if (url.searchParams.get('verifica')) return json({ ok: true }); // dalla pagina Area clienti: solo controllo del codice
  const l = aruba.link(g.link);
  if (!l) return json({ errore: 'Galleria non disponibile.' }, 500);

  try {
    const s = await aruba.struttura(l);
    const p = url.searchParams.get('p') || '';
    const esiste = (path) => s.sezioni.some((x) => x.foto.some((f) => f.path === path));

    if (!cosa) {
      // Prima apertura: avviso Karim
      if (!g.aperta) {
        context.waitUntil(env.DB.prepare("UPDATE gallerie SET aperta = datetime('now') WHERE id = ?").bind(g.id).run());
        notifica(context, [{ b: 'Galleria aperta' }, `${g.cliente} ha aperto la galleria${g.titolo ? ' «' + g.titolo + '»' : ''}.`],
          [{ text: 'Apri il pannello', url: `${url.origin}/admin/#gallerie` }]);
      }
      context.waitUntil(env.DB.prepare('UPDATE gallerie SET aperture = aperture + 1 WHERE id = ?').bind(g.id).run());
      const sezioni = ordina(s.sezioni, g.ordine);
      return json({ cliente: g.cliente, titolo: g.titolo, data: g.data, totale: s.totale, peso: s.peso, copertina: copertina(sezioni, g.copertina),
        sezioni: sezioni.map((x) => ({ nome: x.nome, foto: x.foto.map((f) => ({ p: f.path, n: f.nome, s: f.size })) })) });
    }

    if (cosa === 'anteprima') {
      if (!esiste(p)) return json({ errore: 'Foto non trovata.' }, 404);
      const lato = { 1600: 1600, 240: 240 }[url.searchParams.get('s')] || 480;
      // Cache di Cloudflare per foto, non per codice: chiave interna senza il codice
      const chiave = new Request('https://cache.produkts.it/anteprima/' + l.token + '/' + lato + '/' + encodeURIComponent(p));
      const cache = caches.default;
      let r = await cache.match(chiave);
      if (!r) {
        const a = await aruba.anteprima(l, p, lato);
        if (!a.ok) return json({ errore: 'Anteprima non disponibile.' }, 502);
        r = new Response(a.body, { headers: { 'content-type': a.headers.get('content-type') || 'image/jpeg', 'cache-control': 'public, max-age=2592000' } });
        context.waitUntil(cache.put(chiave, r.clone()));
      }
      return new Response(r.body, { headers: { 'content-type': r.headers.get('content-type'), 'cache-control': 'private, max-age=86400' } });
    }

    if (cosa === 'foto') {
      if (!esiste(p)) return json({ errore: 'Foto non trovata.' }, 404);
      const o = await aruba.originale(l, p);
      if (!o.ok) return json({ errore: 'Foto non disponibile.' }, 502);
      return scaricabile(o, nomeFile(p.split('/').pop()));
    }

    if (cosa === 'zip') {
      const sez = p && s.sezioni.find((x) => x.nome && '/' + x.nome === p);
      if (p && !sez) return json({ errore: 'Sezione non trovata.' }, 404);
      const z = await aruba.zip(l, p);
      if (!z.ok) return json({ errore: 'Download non disponibile.' }, 502);
      context.waitUntil(env.DB.prepare('UPDATE gallerie SET download = download + 1 WHERE id = ?').bind(g.id).run());
      notifica(context, [{ b: 'Download della galleria' }, `${g.cliente} sta scaricando ${sez ? 'la sezione «' + sez.nome + '»' : 'tutte le foto'}.`]);
      return scaricabile(z, nomeFile(g.cliente + (g.titolo ? ' - ' + g.titolo : '') + (sez ? ' - ' + sez.nome : '')) + '.zip', 'application/zip');
    }
  } catch (err) {
    return json({ errore: 'Le foto non sono raggiungibili in questo momento. Riprova tra poco.', dettaglio: String(err.message || err).slice(0, 200) }, 502);
  }
  return json({ errore: 'Non trovato.' }, 404);
}
