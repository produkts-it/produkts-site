// Contatore "ciak battuti" nel footer del sito: quante richieste e recensioni sono arrivate dai moduli (solo il numero).
// Sta nella tabella impostazioni (chiave 'ciak'), così non scende quando pulizia() cancella le richieste vecchie.
// La prima volta parte dal numero di righe già presenti in contatti + recensioni.

async function tabella(env) {
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS impostazioni (chiave TEXT PRIMARY KEY, valore TEXT NOT NULL)').run();
}

export async function ciak(env) {
  await tabella(env);
  const r = await env.DB.prepare("SELECT valore FROM impostazioni WHERE chiave = 'ciak'").first();
  if (r) return parseInt(r.valore, 10) || 0;
  const c = await env.DB.prepare('SELECT (SELECT COUNT(*) FROM contatti) + (SELECT COUNT(*) FROM recensioni) AS n').first();
  const n = (c && c.n) || 0;
  await env.DB.prepare("INSERT OR IGNORE INTO impostazioni (chiave, valore) VALUES ('ciak', ?)").bind(String(n)).run();
  return n;
}

/** Un ciak in più (dopo un invio riuscito dai moduli). In sottofondo: se qualcosa va storto il modulo funziona lo stesso. */
export function unCiak(context) {
  const { env } = context;
  context.waitUntil((async () => {
    await tabella(env);
    const r = await env.DB.prepare("SELECT valore FROM impostazioni WHERE chiave = 'ciak'").first();
    if (!r) { await ciak(env); return; } // la prima volta il conteggio comprende già questo invio
    await env.DB.prepare("UPDATE impostazioni SET valore = CAST(CAST(valore AS INTEGER) + 1 AS TEXT) WHERE chiave = 'ciak'").run();
  })().catch(() => {}));
}
