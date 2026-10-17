// GET /api/recensioni — recensioni approvate (nome pubblico: nome + iniziale del cognome)
// POST /api/recensioni — nuova recensione, resta in attesa fino all'approvazione
import { json, testo, turnstileOk, corpo, nomeCognomePubblico, notifica, pulizia, colonnaCognome } from '../_lib.js';

const SERVIZI = ['18 anni', 'Compleanno', 'Comunione', 'Battesimo', 'Evento', 'Shooting band o copertina', 'Fotografia sportiva', 'Altro'];
// Filtri della pagina Recensioni
const CATEGORIA = { '18 anni': '18 anni', Compleanno: 'Compleanni', Comunione: 'Comunioni', Battesimo: 'Battesimi' };

export async function onRequestGet({ env }) {
  await colonnaCognome(env);
  const { results } = await env.DB.prepare(
    "SELECT id, nome, cognome, servizio, voto, testo, in_evidenza FROM recensioni WHERE stato = 'approvata' ORDER BY in_evidenza DESC, creato DESC LIMIT 200"
  ).all();
  return json(results.map((r) => ({
    id: r.id, nome: nomeCognomePubblico(r.nome, r.cognome), servizio: r.servizio, voto: r.voto, testo: r.testo,
    categoria: CATEGORIA[r.servizio] || '', in_evidenza: !!r.in_evidenza,
  })));
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const d = await corpo(request);
  if (!d) return json({ errore: 'Richiesta non valida.' }, 400);
  if (d.sito) return json({ ok: true }); // campo trappola per i bot
  const nome = testo(d.nome, 80), cognome = testo(d.cognome, 80), testoRec = testo(d.testo, 3000);
  let servizio = testo(d.servizio, 60);
  const voto = Number(d.voto);
  if (!nome || !cognome || !testoRec || !SERVIZI.includes(servizio) || !(voto >= 1 && voto <= 5)) {
    return json({ errore: 'Servono nome, cognome, servizio, valutazione e il testo.' }, 400);
  }
  if (servizio === 'Altro') {
    const quale = testo(d.altro, 60);
    if (!quale) return json({ errore: 'Scrivi quale servizio.' }, 400);
    servizio = quale;
  }
  if (d.consenso !== true) return json({ errore: 'Serve il consenso alla pubblicazione.' }, 400);
  if (!(await turnstileOk(env, d.turnstile, request.headers.get('cf-connecting-ip')))) {
    return json({ errore: 'Verifica anti-spam non riuscita, riprova.' }, 403);
  }
  await colonnaCognome(env);
  await env.DB.prepare('INSERT INTO recensioni (nome, cognome, servizio, voto, testo) VALUES (?, ?, ?, ?, ?)')
    .bind(nome, cognome, servizio, Math.round(voto), testoRec).run();
  pulizia(context);
  notifica(context, [
    { b: 'Nuova recensione da approvare' },
    `${nome} ${cognome} · ${servizio} · ${'★'.repeat(Math.round(voto))}`,
    '',
    testoRec.length > 600 ? testoRec.slice(0, 600) + '…' : testoRec,
  ], [{ text: 'Apri il pannello', url: `${new URL(request.url).origin}/admin/#recensioni` }]);
  return json({ ok: true });
}
