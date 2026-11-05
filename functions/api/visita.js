// POST /api/visita — una pagina vista (da assets/site.js, con sendBeacon). Solo conteggi anonimi: vedi functions/_statistiche.js.
//   { p: '/lavori', r: referrer (solo al primo ingresso), n: true se è l'inizio della visita, m: true se telefono/tablet }
import { tabella, oggi, fonte, robot, pagina } from '../_statistiche.js';

export async function onRequestPost({ request, env }) {
  const vuota = new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  const ua = request.headers.get('user-agent') || '';
  if (robot(ua)) return vuota;
  let d;
  try { d = JSON.parse((await request.text()).slice(0, 2000)); } catch { return vuota; }
  const p = pagina(d && d.p);
  if (!p || p.startsWith('/admin') || p.startsWith('/api')) return vuota;
  const nuova = d.n === true;
  try {
    await tabella(env);
    await env.DB.prepare(`INSERT INTO visite (giorno, pagina, fonte, dispositivo, viste, ingressi) VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT (giorno, pagina, fonte, dispositivo) DO UPDATE SET viste = viste + 1, ingressi = ingressi + excluded.ingressi`)
      .bind(oggi(), p, nuova ? fonte(String(d.r || ''), ua) : '', d.m === true ? 'telefono' : 'computer', nuova ? 1 : 0).run();
    // ogni tanto: via i conteggi più vecchi di 25 mesi
    if (Math.random() < 0.01) await env.DB.prepare('DELETE FROM visite WHERE giorno < ?').bind(oggi(new Date(Date.now() - 760 * 86400000))).run();
  } catch (err) {
    console.error(err);
  }
  return vuota;
}
