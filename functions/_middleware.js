// Filtro che gira prima di ogni richiesta (Cloudflare Pages Functions), per Google e per i vecchi link:
// - www.produkts.it → produkts.it (301): un solo indirizzo per ogni pagina;
// - indirizzi del vecchio WordPress (?page_id=…, ?p=…, ?kezta_portfolio=…, /wp-…, /category/…) → 410 "non esiste più",
//   con la pagina 404 del sito, così Google li toglie invece di considerarli doppioni della Home.

const WP_PARAMETRI = /^(p|page_id|cat|tag|author|attachment_id|m|s|feed|preview|post_type|kezta_[a-z_]+|elementor[a-z_-]*|replytocom)$/;
const WP_PERCORSI = /^\/(wp-|wp\/|xmlrpc\.php|feed\/?$|comments\/|category\/|tag\/|author\/|kezta_portfolio|portfolio(-item)?\/|\d{4}\/\d{2}\/)/;

async function nonEsistePiu(context, url) {
  const pagina = await context.env.ASSETS.fetch(new Request(url.origin + '/404.html'));
  return new Response(pagina.body, { status: 410, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex', 'cache-control': 'public, max-age=86400' } });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'www.produkts.it') {
    url.hostname = 'produkts.it';
    return Response.redirect(url.toString(), 301);
  }
  if ((url.pathname === '/' || url.pathname === '/index.php') && [...url.searchParams.keys()].some((k) => WP_PARAMETRI.test(k))) {
    return nonEsistePiu(context, url);
  }
  if (WP_PERCORSI.test(url.pathname)) return nonEsistePiu(context, url);
  return context.next();
}
