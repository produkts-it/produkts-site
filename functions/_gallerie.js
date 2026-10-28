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
  // Colonne aggiunte dopo: ordine delle sezioni (JSON con i nomi delle sottocartelle), foto di copertina (percorso)
  // e suo punto di focus ("x% y%", come object-position); istantanea delle foto all'ultimo "Aggiorna" (JSON percorso → versione)
  // e momento di quell'aggiornamento (le pagine dei clienti rileggono Aruba da lì in poi)
  for (const col of ['ordine TEXT', 'copertina TEXT', 'fuoco TEXT', 'istantanea TEXT', 'aggiornata TEXT']) {
    try { await env.DB.prepare('ALTER TABLE gallerie ADD COLUMN ' + col).run(); } catch (e) { /* esiste già */ }
  }
  // Registro dei download (solo cosa e quando, niente dati del dispositivo): tipo 'foto' (cosa = percorso) o 'zip' (cosa = sezione, '' = tutto)
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS scaricamenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    galleria INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    cosa TEXT NOT NULL DEFAULT '',
    creato TEXT NOT NULL DEFAULT (datetime('now'))
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS scaricamenti_galleria ON scaricamenti (galleria, creato)').run();
  pronta = true;
}

/** Segna un download; lo stesso file ripreso entro 2 minuti (il telefono a volte lo chiede due volte) conta una volta sola. */
export async function registra(env, galleria, tipo, cosa) {
  const doppio = await env.DB.prepare("SELECT 1 FROM scaricamenti WHERE galleria = ? AND tipo = ? AND cosa = ? AND creato > datetime('now', '-2 minutes')")
    .bind(galleria, tipo, cosa).first();
  if (doppio) return false;
  await env.DB.prepare('INSERT INTO scaricamenti (galleria, tipo, cosa) VALUES (?, ?, ?)').bind(galleria, tipo, cosa).run();
  return true;
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

/** Punto di focus della copertina: "x% y%" valido, altrimenti il centro. */
export const fuoco = (f) => (/^\d{1,3}(\.\d)?% \d{1,3}(\.\d)?%$/.test(f || '') ? f : '50% 50%');

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

/** Versione di ogni foto (percorso → versione), da salvare nella colonna istantanea. */
export const istantanea = (s) => JSON.stringify(Object.fromEntries(s.sezioni.flatMap((x) => x.foto).map((f) => [f.path, f.v || String(f.mod)])));

/** Cosa è cambiato su Aruba rispetto all'ultima istantanea. Senza istantanea (gallerie create prima del pulsante Aggiorna)
 *  si possono solo indicare le foto caricate o modificate dopo la creazione della galleria. */
export function modifiche(s, primaJson, creato) {
  const tutte = s.sezioni.flatMap((x) => x.foto);
  let prima = null;
  try { prima = primaJson ? JSON.parse(primaJson) : null; } catch (e) { /* istantanea rovinata: come se non ci fosse */ }
  if (!prima) {
    const da = Date.parse(String(creato || '').replace(' ', 'T') + 'Z') || 0;
    return { confronto: false, recenti: tutte.filter((f) => f.mod > da).map((f) => f.path), aggiunte: [], modificate: [], rimosse: [] };
  }
  const ora = new Set(tutte.map((f) => f.path));
  return {
    confronto: true, recenti: [],
    aggiunte: tutte.filter((f) => !(f.path in prima)).map((f) => f.path),
    modificate: tutte.filter((f) => f.path in prima && prima[f.path] !== (f.v || String(f.mod))).map((f) => f.path),
    rimosse: Object.keys(prima).filter((p) => !ora.has(p)),
  };
}

/** Momento dell'ultimo "Aggiorna" in ms (0 se mai premuto). */
export const aggiornataMs = (g) => (g.aggiornata ? Date.parse(g.aggiornata.replace(' ', 'T') + 'Z') || 0 : 0);
