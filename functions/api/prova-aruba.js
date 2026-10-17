// TEMPORANEO (solo sul ramo di prova "gallerie", da cancellare prima di unire): crea/elimina una galleria di prova
// con la cartella "Prova galleria" di Karim, per provare tutto il giro senza il pannello.
import { tabella } from '../_gallerie.js';
export async function onRequestGet({ env, request }) {
  await tabella(env);
  const u = new URL(request.url);
  if (u.searchParams.get('elimina')) {
    await env.DB.prepare("DELETE FROM gallerie WHERE codice = 'PROVA2026'").run();
    return new Response('eliminata');
  }
  await env.DB.prepare("INSERT OR IGNORE INTO gallerie (codice, cliente, titolo, data, link) VALUES ('PROVA2026', 'Galleria di prova', 'Shooting', '18.01.2026', 'https://q43tud.arubadrive.com/s/aR9PAByxneqdDgx')").run();
  return new Response('ok: /galleria?c=PROVA2026');
}
