// GET /api/ciak — quanti ciak battuti (richieste + recensioni arrivate dal sito), per il footer. Solo un numero.
// In cache 5 minuti: dopo un invio la pagina aggiunge il suo +1 da sola.
import { ciak } from '../_ciak.js';

export async function onRequestGet(context) {
  const cache = caches.default;
  const chiave = new Request(new URL('/api/ciak', context.request.url).toString());
  const salvata = await cache.match(chiave);
  if (salvata) return salvata;
  let n = 0;
  try { n = await ciak(context.env); } catch (err) { console.error(err); }
  const r = new Response(JSON.stringify({ n }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
  context.waitUntil(cache.put(chiave, r.clone()));
  return r;
}
