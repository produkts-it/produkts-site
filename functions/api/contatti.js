// POST /api/contatti — salva una richiesta dal modulo Contatti e avvisa Karim su Telegram
import { json, testo, turnstileOk, corpo, numeroWa, notifica, pulizia } from '../_lib.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const d = await corpo(request);
  if (!d) return json({ errore: 'Richiesta non valida.' }, 400);
  if (d.sito) return json({ ok: true }); // campo trappola per i bot: compilato solo da loro
  // recapito = numero di telefono (obbligatorio: Karim ricontatta su WhatsApp)
  const nome = testo(d.nome, 120), recapito = testo(d.recapito, 40), messaggio = testo(d.messaggio, 5000);
  if (!nome || !recapito || !messaggio) return json({ errore: 'Servono nome, numero di telefono e il messaggio.' }, 400);
  const cifre = recapito.replace(/\D/g, '');
  if (cifre.length < 8 || cifre.length > 15 || /[^\d\s+().\/-]/.test(recapito)) {
    return json({ errore: 'Controlla il numero di telefono: ti ricontatto su WhatsApp.' }, 400);
  }
  if (d.privacy !== true) return json({ errore: "Serve il consenso all'informativa privacy." }, 400);
  if (!(await turnstileOk(env, d.turnstile, request.headers.get('cf-connecting-ip')))) {
    return json({ errore: 'Verifica anti-spam non riuscita, riprova.' }, 403);
  }
  const tipo = testo(d.tipo, 60), budget = testo(d.budget, 60), quando = testo(d.quando, 30), dove = testo(d.dove, 200);
  await env.DB.prepare('INSERT INTO contatti (tipo, budget, quando, dove, nome, recapito, messaggio) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(tipo, budget, quando, dove, nome, recapito, messaggio)
    .run();
  pulizia(context);
  const origine = new URL(request.url).origin;
  notifica(context, [
    { b: 'Nuova richiesta dal sito' },
    `${nome} · ${recapito}`,
    [tipo, budget, quando, dove].filter(Boolean).join(' · ') || null,
    '',
    messaggio.length > 600 ? messaggio.slice(0, 600) + '…' : messaggio,
  ], [
    { text: 'Scrivi su WhatsApp', url: `https://wa.me/${numeroWa(recapito)}` },
    { text: 'Apri il pannello', url: `${origine}/admin/#contatti` },
  ]);
  return json({ ok: true });
}
