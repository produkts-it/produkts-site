// Gallerie clienti: una riga per cliente in D1 (tabella gallerie), le foto restano su Aruba Drive (vedi _aruba.js).
// Accesso con un codice generato dal pannello; il link diretto da mandare su WhatsApp è produkts.it/galleria?c=CODICE.

let pronta = false;
export async function tabella(env) {
  if (pronta) return;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS gallerie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codice TEXT NOT NULL UNIQUE,
    cliente TEXT NOT NULL,
    titolo TEXT NOT NULL DEFAULT '',
    data TEXT NOT NULL DEFAULT '',
    link TEXT NOT NULL,
    attiva INTEGER NOT NULL DEFAULT 1,
    creato TEXT NOT NULL DEFAULT (datetime('now')),
    aperta TEXT,
    aperture INTEGER NOT NULL DEFAULT 0,
    download INTEGER NOT NULL DEFAULT 0
  )`).run();
  // Colonne aggiunte dopo: ordine delle sezioni (JSON con i nomi delle sottocartelle) e foto di copertina (percorso)
  for (const col of ['ordine TEXT', 'copertina TEXT']) {
    try { await env.DB.prepare('ALTER TABLE gallerie ADD COLUMN ' + col).run(); } catch (e) { /* esiste già */ }
  }
  pronta = true;
}

// Codici facili da dettare e da copiare: niente 0/O, 1/I/L
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function nuovoCodice() {
  const b = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(b, (x) => ALFABETO[x % ALFABETO.length]).join('');
}

export const pulisciCodice = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);

/** Sezioni nell'ordine scelto da Karim (le sottocartelle nuove, non ancora ordinate, vanno in fondo). */
export function ordina(sezioni, ordineJson) {
  let ordine = [];
  try { ordine = JSON.parse(ordineJson || '[]'); } catch (e) { /* niente ordine */ }
  const pos = (n) => { const i = ordine.indexOf(n); return i < 0 ? 1e6 : i; };
  return sezioni.map((s, i) => [s, i]).sort((a, b) => pos(a[0].nome) - pos(b[0].nome) || a[1] - b[1]).map((x) => x[0]);
}

/** Copertina scelta, se esiste ancora; altrimenti la prima foto. */
export function copertina(sezioni, scelta) {
  const tutte = sezioni.flatMap((s) => s.foto);
  return (scelta && tutte.find((f) => f.path === scelta)) ? scelta : (tutte[0] && tutte[0].path) || '';
}

/** La galleria attiva con quel codice, oppure null (con un piccolo ritardo, per scoraggiare chi prova codici a caso). */
export async function trova(env, codice) {
  await tabella(env);
  const c = pulisciCodice(codice);
  const g = c.length >= 6 ? await env.DB.prepare('SELECT * FROM gallerie WHERE codice = ? AND attiva = 1').bind(c).first() : null;
  if (!g) await new Promise((r) => setTimeout(r, 600));
  return g;
}
