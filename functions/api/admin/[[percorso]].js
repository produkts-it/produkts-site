// API riservate della pagina /admin (password del pannello o Cloudflare Access)
//   GET  /api/admin/contatti            elenco richieste
//   POST /api/admin/contatti/:id        { letto: true|false }
//   GET  /api/admin/recensioni          tutte le recensioni
//   POST /api/admin/recensioni/:id      { stato: 'approvata'|'rifiutata'|'attesa', in_evidenza: true|false }
//   GET  /api/admin/push/chiave         chiave pubblica VAPID per "Attiva notifiche"
//   POST /api/admin/push/iscrivi        PushSubscription del dispositivo
//   POST /api/admin/push/disiscrivi     { endpoint }
//   POST /api/admin/push/prova          manda una notifica di prova a tutti i dispositivi
import { json, corpo, autorizzato } from '../../_lib.js';
import { chiavePubblica, iscrivi, disiscrivi, inviaPush } from '../../_push.js';
import { tabella, nuovoCodice, ordina, copertina, fuoco } from '../../_gallerie.js';
import * as aruba from '../../_aruba.js';
import * as lavori from '../../_lavori.js';
//   GET  /api/admin/lavori              dati dei lavori (lavori.json sul ramo del sito) per la scheda Lavori
//   POST /api/admin/lavori              { gruppo, nuovo, lavoro, filmografia, fotogramma, copertina } → commit su GitHub
//   GET  /api/admin/gallerie            elenco gallerie clienti
//   POST /api/admin/gallerie            { cliente, titolo, data, link } → crea, con codice nuovo
//   GET  /api/admin/gallerie/:id        sezioni (nell'ordine scelto) con le foto, copertina: per l'editor del pannello
//   POST /api/admin/gallerie/:id        { attiva } | { nuovoCodice: true } | { elimina: true } | { cliente, titolo, data } | { ordine: [nomi], copertina: path, fuoco: "x% y%" }

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
  if (cosa === 'gallerie') {
    await tabella(env);
    if (request.method === 'GET' && !id) {
      const { results } = await env.DB.prepare('SELECT * FROM gallerie ORDER BY creato DESC').all();
      return json(results);
    }
    if (request.method === 'POST' && !id) {
      // Nuova galleria: controlla subito che il link Aruba si legga e conta le foto
      const d = (await corpo(request)) || {};
      const cliente = String(d.cliente || '').trim().slice(0, 120), linkAruba = String(d.link || '').trim();
      const l = aruba.link(linkAruba);
      if (!cliente) return json({ errore: 'Scrivi il nome del cliente.' }, 400);
      if (!l) return json({ errore: 'Il link deve essere un link di condivisione di Aruba Drive (…arubadrive.com/s/…).' }, 400);
      let s;
      try { s = await aruba.struttura(l, true); } catch (err) { return json({ errore: 'Non riesco a leggere il link Aruba: ' + err.message }, 400); }
      if (!s.totale) return json({ errore: 'Nella cartella condivisa non ho trovato foto.' }, 400);
      let codice;
      for (let i = 0; i < 5; i++) {
        codice = nuovoCodice();
        const r = await env.DB.prepare('INSERT OR IGNORE INTO gallerie (codice, cliente, titolo, data, link) VALUES (?, ?, ?, ?, ?)')
          .bind(codice, cliente, String(d.titolo || '').trim().slice(0, 120), String(d.data || '').trim().slice(0, 40), linkAruba).run();
        if (r.meta.changes) break;
      }
      return json({ ok: true, codice, foto: s.totale, sezioni: s.sezioni.map((x) => x.nome || '(cartella principale)') });
    }
    if (request.method === 'GET' && n > 0) {
      const g = await env.DB.prepare('SELECT * FROM gallerie WHERE id = ?').bind(n).first();
      if (!g) return json({ errore: 'Galleria non trovata.' }, 404);
      let s;
      try { s = await aruba.struttura(aruba.link(g.link), true); } catch (err) { return json({ errore: 'Non riesco a leggere il link Aruba: ' + err.message }, 502); }
      const sezioni = ordina(s.sezioni, g.ordine);
      return json({ codice: g.codice, copertina: copertina(sezioni, g.copertina), fuoco: fuoco(g.fuoco), sezioni: sezioni.map((x) => ({ nome: x.nome, foto: x.foto.map((f) => f.path) })) });
    }
    if (request.method === 'POST' && n > 0) {
      const d = (await corpo(request)) || {};
      if (Array.isArray(d.ordine)) await env.DB.prepare('UPDATE gallerie SET ordine = ? WHERE id = ?').bind(JSON.stringify(d.ordine.map(String).slice(0, 200)), n).run();
      if (typeof d.copertina === 'string') await env.DB.prepare('UPDATE gallerie SET copertina = ? WHERE id = ?').bind(d.copertina.slice(0, 500), n).run();
      if (typeof d.fuoco === 'string') await env.DB.prepare('UPDATE gallerie SET fuoco = ? WHERE id = ?').bind(fuoco(d.fuoco), n).run();
      if (d.elimina === true) {
        await env.DB.prepare('DELETE FROM gallerie WHERE id = ?').bind(n).run();
        return json({ ok: true });
      }
      if (typeof d.attiva === 'boolean') await env.DB.prepare('UPDATE gallerie SET attiva = ? WHERE id = ?').bind(d.attiva ? 1 : 0, n).run();
      if (d.nuovoCodice === true) await env.DB.prepare('UPDATE gallerie SET codice = ? WHERE id = ?').bind(nuovoCodice(), n).run();
      for (const k of ['cliente', 'titolo', 'data']) {
        if (typeof d[k] === 'string') await env.DB.prepare(`UPDATE gallerie SET ${k} = ? WHERE id = ?`).bind(d[k].trim().slice(0, 120), n).run();
      }
      return json({ ok: true });
    }
  }
  if (cosa === 'lavori' && !id) {
    try {
      const branch = lavori.ramo(request, env);
      if (request.method === 'GET') return json(await lavori.leggi(env, branch));
      if (request.method === 'POST') {
        // Corpo più grande del solito: arrivano anche fotogramma e copertina (JPEG in base64)
        const raw = await request.text();
        if (raw.length > 4_500_000) return json({ errore: 'Immagini troppo grandi.' }, 413);
        let d;
        try { d = JSON.parse(raw); } catch { return json({ errore: 'Dati non validi.' }, 400); }
        return json(await lavori.salva(env, branch, d));
      }
    } catch (err) {
      return json({ errore: err.message }, err.stato === 401 ? 502 : 400);
    }
  }
  if (cosa === 'push') {
    if (request.method === 'GET' && id === 'chiave') return json({ chiave: await chiavePubblica(env) });
    if (request.method === 'POST' && id === 'iscrivi') {
      return (await iscrivi(env, await corpo(request))) ? json({ ok: true }) : json({ errore: 'Iscrizione non valida.' }, 400);
    }
    if (request.method === 'POST' && id === 'disiscrivi') {
      const d = (await corpo(request)) || {};
      await disiscrivi(env, d.endpoint);
      return json({ ok: true });
    }
    if (request.method === 'POST' && id === 'prova') {
      const esiti = await inviaPush(env, { titolo: 'Notifiche attive', testo: 'Da ora ti avviso qui di nuove richieste e recensioni.', url: '/admin/' });
      return json({ ok: esiti.some((e) => e.stato >= 200 && e.stato < 300), esiti });
    }
  }
  return json({ errore: 'Non trovato.' }, 404);
}
