// Funzioni comuni delle API di produkts.it (Cloudflare Pages Functions)

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** Testo pulito e con lunghezza massima; stringa vuota se manca. */
export function testo(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** Anti-spam Cloudflare Turnstile. Se il segreto non è configurato (anteprima locale) lascia passare. */
export async function turnstileOk(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = await r.json().catch(() => ({}));
  return out.success === true;
}

/** Legge il corpo JSON della richiesta; null se non è JSON valido o è troppo grande. */
export async function corpo(request) {
  const raw = await request.text();
  if (raw.length > 20000) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/** "Mario Rossi" -> "Mario R." (le recensioni mostrano nome e iniziale del cognome). */
export function nomePubblico(nome) {
  const parti = nome.trim().split(/\s+/);
  if (parti.length < 2) return parti[0] || '';
  return parti[0] + ' ' + parti[parti.length - 1][0].toUpperCase() + '.';
}

// ---- Cloudflare Access: la pagina /admin e le sue API sono riservate a Karim ----
const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
let chiavi = null, chiaviScadenza = 0;

/** Verifica il token che Cloudflare Access aggiunge alle richieste autenticate. Restituisce l'email o null. */
export async function utenteAccess(request, env) {
  const jwt = request.headers.get('cf-access-jwt-assertion');
  if (!jwt || !env.ACCESS_TEAM || !env.ACCESS_AUD) return null;
  const [h, p, s] = jwt.split('.');
  if (!h || !p || !s) return null;
  const header = JSON.parse(new TextDecoder().decode(b64url(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64url(p)));
  if (Date.now() > chiaviScadenza) {
    const r = await fetch(`https://${env.ACCESS_TEAM}.cloudflareaccess.com/cdn-cgi/access/certs`);
    chiavi = (await r.json()).keys || [];
    chiaviScadenza = Date.now() + 3600e3;
  }
  const jwk = chiavi.find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(s), new TextEncoder().encode(h + '.' + p));
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!ok || !aud.includes(env.ACCESS_AUD) || payload.exp * 1000 < Date.now()) return null;
  return payload.email || null;
}
