// TEMPORANEO (solo sul ramo di prova "gallerie", da cancellare): verifica che Aruba Drive risponda ai server di Cloudflare
import * as aruba from '../_aruba.js';
export async function onRequestGet() {
  const l = aruba.link('https://q43tud.arubadrive.com/s/aR9PAByxneqdDgx');
  const out = {};
  try {
    const t0 = Date.now(); const s = await aruba.struttura(l, true); out.struttura = { ms: Date.now() - t0, totale: s.totale, sezioni: s.sezioni.map((x) => x.nome + ':' + x.foto.length) };
    const p = s.sezioni[0].foto[0].path;
    let t = Date.now(); let r = await aruba.anteprima(l, p, 480); const b = await r.arrayBuffer(); out.anteprima = { ms: Date.now() - t, status: r.status, kb: Math.round(b.byteLength / 1024) };
    t = Date.now(); r = await aruba.originale(l, p); const o = await r.arrayBuffer(); out.originale = { ms: Date.now() - t, status: r.status, kb: Math.round(o.byteLength / 1024) };
    t = Date.now(); r = await aruba.zip(l, '/' + s.sezioni[0].nome); out.zip = { ms: Date.now() - t, status: r.status, tipo: r.headers.get('content-type') }; r.body && r.body.cancel();
  } catch (e) { out.errore = String(e.message || e); }
  return new Response(JSON.stringify(out, null, 1), { headers: { 'content-type': 'application/json' } });
}
