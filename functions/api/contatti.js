// POST /api/contatti — salva una richiesta dal modulo Contatti
import { json, testo, turnstileOk, corpo } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const d = await corpo(request);
  if (!d) return json({ errore: 'Richiesta non valida.' }, 400);
  if (d.sito) return json({ ok: true }); // campo trappola per i bot: compilato solo da loro
  const nome = testo(d.nome, 120), recapito = testo(d.recapito, 200), messaggio = testo(d.messaggio, 5000);
  if (!nome || !recapito || !messaggio) return json({ errore: 'Servono nome, email o telefono e il messaggio.' }, 400);
  if (d.privacy !== true) return json({ errore: "Serve il consenso all'informativa privacy." }, 400);
  if (!(await turnstileOk(env, d.turnstile, request.headers.get('cf-connecting-ip')))) {
    return json({ errore: 'Verifica anti-spam non riuscita, riprova.' }, 403);
  }
  await env.DB.prepare('INSERT INTO contatti (tipo, budget, quando, dove, nome, recapito, messaggio) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(testo(d.tipo, 60), testo(d.budget, 60), testo(d.quando, 30), testo(d.dove, 200), nome, recapito, messaggio)
    .run();
  return json({ ok: true });
}
