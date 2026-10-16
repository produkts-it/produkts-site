// API riservate della pagina /admin (password del pannello o Cloudflare Access)
//   GET  /api/admin/contatti            elenco richieste
//   POST /api/admin/contatti/:id        { letto: true|false }
//   GET  /api/admin/recensioni          tutte le recensioni
//   POST /api/admin/recensioni/:id      { stato: 'approvata'|'rifiutata'|'attesa', in_evidenza: true|false }
import { json, corpo, autorizzato } from '../../_lib.js';

export async function onRequest({ request, env, params }) {
  if (!(await autorizzato(request, env))) return json({ errore: 'Accesso negato.' }, 401);
  const [cosa, id] = params.percorso || [];
  const n = Number(id);

  if (request.method === 'GET' && cosa === 'contatti' && !id) {
    const { results } = await env.DB.prepare('SELECT * FROM contatti ORDER BY creato DESC LIMIT 500').all();
    return json(results);
  }
  if (request.method === 'GET' && cosa === 'recensioni' && !id) {
    const { results } = await env.DB.prepare("SELECT * FROM recensioni ORDER BY stato = 'attesa' DESC, creato DESC LIMIT 500").all();
    return json(results);
  }
  if (request.method === 'POST' && cosa === 'contatti' && n > 0) {
    const d = await corpo(request);
    await env.DB.prepare('UPDATE contatti SET letto = ? WHERE id = ?').bind(d && d.letto ? 1 : 0, n).run();
    return json({ ok: true });
  }
  if (request.method === 'POST' && cosa === 'recensioni' && n > 0) {
    const d = (await corpo(request)) || {};
    if (d.stato && !['approvata', 'rifiutata', 'attesa'].includes(d.stato)) return json({ errore: 'Stato non valido.' }, 400);
    if (d.stato) await env.DB.prepare('UPDATE recensioni SET stato = ? WHERE id = ?').bind(d.stato, n).run();
    if (typeof d.in_evidenza === 'boolean') await env.DB.prepare('UPDATE recensioni SET in_evidenza = ? WHERE id = ?').bind(d.in_evidenza ? 1 : 0, n).run();
    return json({ ok: true });
  }
  return json({ errore: 'Non trovato.' }, 404);
}
