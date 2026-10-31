// Filtro che gira prima di ogni richiesta (Cloudflare Pages Functions), per Google, per i vecchi link e per gli errori:
// - www.produkts.it → produkts.it (301): un solo indirizzo per ogni pagina;
// - indirizzi del vecchio WordPress (?page_id=…, ?p=…, ?kezta_portfolio=…, /wp-…, /category/…) → 410 "non esiste più",
//   così Google li toglie invece di considerarli doppioni della Home;
// - pagine di errore: quando una pagina (non le API, che rispondono in JSON) finisce in errore, il visitatore vede
//   errori/<codice>.html (generate da 404.html con _design/bozza/errori.py) con il codice giusto; la 404 la mette già Pages;
// - manutenzione: con la variabile MANUTENZIONE impostata nelle impostazioni di Pages tutte le pagine (tranne /admin) rispondono 503.

const WP_PARAMETRI = /^(p|page_id|cat|tag|author|attachment_id|m|s|feed|preview|post_type|kezta_[a-z_]+|elementor[a-z_-]*|replytocom)$/;
const WP_PERCORSI = /^\/(wp-|wp\/|xmlrpc\.php|feed\/?$|comments\/|category\/|tag\/|author\/|kezta_portfolio|portfolio(-item)?\/|\d{4}\/\d{2}\/)/;
const PAGINE_ERRORE = new Set([400, 401, 403, 404, 405, 410, 429, 500, 502, 503, 504]);

/** La pagina di errore giusta, con il suo codice (per un codice senza pagina: 500 per i 5xx, 404 per gli altri). */
async function paginaErrore(context, stato, intestazioni = {}) {
  const codice = PAGINE_ERRORE.has(stato) ? stato : stato >= 500 ? 500 : 404;
  const percorso = codice === 404 ? '/404.html' : '/errori/' + codice;
  const pagina = await context.env.ASSETS.fetch(new Request(new URL(percorso, context.request.url)));
  return new Response(pagina.body, { status: stato, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex',
    'cache-control': 'no-store', ...intestazioni } });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (url.hostname === 'www.produkts.it') {
    url.hostname = 'produkts.it';
    return Response.redirect(url.toString(), 301);
  }
  const vecchioWp = WP_PERCORSI.test(url.pathname)
    || ((url.pathname === '/' || url.pathname === '/index.php') && [...url.searchParams.keys()].some((k) => WP_PARAMETRI.test(k)));
  if (vecchioWp) return paginaErrore(context, 410, { 'cache-control': 'public, max-age=86400' });
  // Le pagine di errore aperte direttamente (/errori/500, /404) non sono pagine del sito
  if (/^\/(errori(\/|$)|404(\.html)?$)/.test(url.pathname)) return paginaErrore(context, 404);

  const api = url.pathname.startsWith('/api/');
  const pagina = !api && (request.headers.get('accept') || '').includes('text/html');
  if (env.MANUTENZIONE && pagina && !url.pathname.startsWith('/admin')) return paginaErrore(context, 503, { 'retry-after': '600' });

  let risposta;
  try {
    risposta = await context.next();
  } catch (err) {
    console.error(err);
    if (pagina) return paginaErrore(context, 500);
    return new Response(JSON.stringify({ errore: 'Errore del sito. Riprova tra poco.' }), { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' } });
  }
  // Errori senza pagina (per esempio 405 quando si invia qualcosa a una pagina statica): al visitatore la pagina giusta
  if (pagina && risposta.status >= 400 && !(risposta.headers.get('content-type') || '').includes('text/html')) {
    return paginaErrore(context, risposta.status);
  }
  return risposta;
}
