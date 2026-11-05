// Statistiche del sito, senza cookie e senza dati personali: solo conteggi per giorno.
// Ogni riga = giorno + pagina + provenienza + telefono/computer, con quante volte è stata vista (viste)
// e quante visite sono iniziate lì (ingressi). Niente IP, niente identificativi: come promette privacy.html.
// Le scrive functions/api/visita.js (chiamata da assets/site.js), le legge la scheda Statistiche del pannello.

let pronta = false;
export async function tabella(env) {
  if (pronta) return;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS visite (
    giorno TEXT NOT NULL, pagina TEXT NOT NULL, fonte TEXT NOT NULL, dispositivo TEXT NOT NULL,
    viste INTEGER NOT NULL DEFAULT 0, ingressi INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (giorno, pagina, fonte, dispositivo))`).run();
  pronta = true;
}

/** Giorno di oggi ad Altamura (AAAA-MM-GG). */
export function oggi(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

const FONTI = [[/(^|\.)instagram\.com$/, 'Instagram'], [/(^|\.)tiktok\.com$/, 'TikTok'], [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'], [/duckduckgo/, 'DuckDuckGo'], [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'Facebook'],
  [/whatsapp|^wa\.me$/, 'WhatsApp'], [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube'], [/^(t\.co|x\.com|twitter\.com)$/, 'X'],
  [/linkedin|lnkd\.in/, 'LinkedIn'], [/vimeo\.com$/, 'Vimeo'], [/^(t\.me|web\.telegram\.org)$/, 'Telegram'], [/hoo\.be$/, 'hoo.be']];

/** Da dove arriva la visita: dal browser interno di un'app (Instagram, TikTok, Facebook) o dal sito di provenienza. */
export function fonte(ref, ua) {
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/musical_ly|TikTok|BytedanceWebview/i.test(ua)) return 'TikTok';
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return 'Facebook';
  let host = '';
  try { host = new URL(ref).hostname.replace(/^www\./, '').toLowerCase(); } catch { /* nessuna provenienza */ }
  if (!host || /(^|\.)produkts\.it$|\.pages\.dev$/.test(host)) return 'Diretto';
  for (const [re, nome] of FONTI) if (re.test(host)) return nome;
  return host.slice(0, 60);
}

/** Robot, anteprime dei link e browser automatici: non contano. */
export function robot(ua) {
  return !ua || /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp\/|telegram|python|curl|wget|httpclient/i.test(ua);
}

/** Pagina "pulita": /lavori, /en/about, / … (niente .html, niente parametri). */
export function pagina(p) {
  let s = String(p || '/').split(/[?#]/)[0].toLowerCase().replace(/\.html$/, '').replace(/\/index$/, '/');
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return /^\/[a-z0-9\-/]{0,80}$/.test(s) ? s || '/' : null;
}

/** Riepilogo per il pannello negli ultimi `giorni` giorni. */
export async function riepilogo(env, giorni) {
  await tabella(env);
  const da = oggi(new Date(Date.now() - (giorni - 1) * 86400000));
  const q = (sql) => env.DB.prepare(sql).bind(da).all().then((r) => r.results);
  const [perGiorno, pagine, fonti, dispositivi] = await Promise.all([
    q('SELECT giorno, SUM(ingressi) AS visite, SUM(viste) AS viste FROM visite WHERE giorno >= ? GROUP BY giorno ORDER BY giorno'),
    q('SELECT pagina, SUM(viste) AS viste FROM visite WHERE giorno >= ? GROUP BY pagina ORDER BY viste DESC LIMIT 15'),
    q("SELECT fonte, SUM(ingressi) AS visite FROM visite WHERE giorno >= ? AND ingressi > 0 GROUP BY fonte ORDER BY visite DESC LIMIT 12"),
    q('SELECT dispositivo, SUM(ingressi) AS visite FROM visite WHERE giorno >= ? GROUP BY dispositivo ORDER BY visite DESC'),
  ]);
  return { da, giorni, perGiorno, pagine, fonti, dispositivi };
}
