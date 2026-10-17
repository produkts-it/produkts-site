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
  pronta = true;
}

// Codici facili da dettare e da copiare: niente 0/O, 1/I/L
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function nuovoCodice() {
  const b = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(b, (x) => ALFABETO[x % ALFABETO.length]).join('');
}

export const pulisciCodice = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);

/** La galleria attiva con quel codice, oppure null (con un piccolo ritardo, per scoraggiare chi prova codici a caso). */
export async function trova(env, codice) {
  await tabella(env);
  const c = pulisciCodice(codice);
  const g = c.length >= 6 ? await env.DB.prepare('SELECT * FROM gallerie WHERE codice = ? AND attiva = 1').bind(c).first() : null;
  if (!g) await new Promise((r) => setTimeout(r, 600));
  return g;
}
