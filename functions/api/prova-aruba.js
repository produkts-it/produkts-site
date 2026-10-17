// TEMPORANEO (solo sul ramo di prova, da cancellare prima di unire): galleria di prova con ordine e copertina impostati
import { tabella } from '../_gallerie.js';
export async function onRequestGet({ env, request }) {
  await tabella(env);
  if (new URL(request.url).searchParams.get('elimina')) {
    await env.DB.prepare("DELETE FROM gallerie WHERE codice = 'PROVA2026'").run();
    return new Response('eliminata');
  }
  await env.DB.prepare("INSERT OR IGNORE INTO gallerie (codice, cliente, titolo, data, link) VALUES ('PROVA2026', 'Galleria di prova', 'Shooting', '18.01.2026', 'https://q43tud.arubadrive.com/s/aR9PAByxneqdDgx')").run();
  await env.DB.prepare("UPDATE gallerie SET ordine = ?, copertina = ? WHERE codice = 'PROVA2026'")
    .bind(JSON.stringify(['WaterMark', 'No WaterMark']), '/No WaterMark/0010_ShootPaolo_produkts-2026-01-18.jpg').run();
  return new Response('ok');
}
