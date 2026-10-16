// Funzioni comuni delle API di produkts.it (Cloudflare Pages Functions)
import { inviaPush } from './_push.js';

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

/** Numero per WhatsApp: solo cifre, prefisso 39 se manca (wa.me/<numero>). */
export function numeroWa(tel) {
  let n = tel.replace(/[^\d+]/g, '');
  if (n.startsWith('+')) return n.slice(1);
  if (n.startsWith('00')) return n.slice(2);
  return '39' + n;
}

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

/**
 * Avvisa Karim di una nuova richiesta o recensione:
 * - notifica push sui dispositivi dove ha premuto "Attiva notifiche" nel pannello (functions/_push.js);
 * - messaggio Telegram, se ci sono i segreti TELEGRAM_TOKEN e TELEGRAM_CHAT_ID nelle impostazioni di Pages.
 * Un errore delle notifiche non blocca mai il modulo.
 * righe: la prima { b: titolo }, poi testo già pronto (messo in sicurezza qui; null = riga saltata, '' = riga vuota);
 * pulsanti: [{ text, url }] — quello del pannello diventa il link della notifica push.
 */
export function notifica(context, righe, pulsanti = []) {
  const { env } = context;
  righe = righe.filter((r) => r != null);
  const pannello = pulsanti.find((p) => p.url.includes('/admin/'));
  context.waitUntil(inviaPush(env, {
    titolo: righe[0] && righe[0].b ? righe[0].b : 'produkts.it',
    testo: righe.slice(1).filter((r) => typeof r === 'string' && r).join('\n').slice(0, 300),
    url: pannello ? new URL(pannello.url).pathname + new URL(pannello.url).hash : '/admin/',
  }).catch(() => {}));
  if (!env.TELEGRAM_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const text = righe.map((r) => (r.b ? `<b>${esc(r.b)}</b>` : esc(r))).join('\n').slice(0, 4000);
  const invio = fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true,
      reply_markup: pulsanti.length ? { inline_keyboard: [pulsanti] } : undefined,
    }),
  }).catch(() => {});
  context.waitUntil(invio);
}

/**
 * Tempi di conservazione promessi nella pagina Privacy: richieste di contatto 24 mesi,
 * recensioni non pubblicate (in attesa o rifiutate) 12 mesi. Gira in sottofondo a ogni invio dai moduli.
 */
export function pulizia(context) {
  const { env } = context;
  context.waitUntil(env.DB.batch([
    env.DB.prepare("DELETE FROM contatti WHERE creato < datetime('now', '-24 months')"),
    env.DB.prepare("DELETE FROM recensioni WHERE stato != 'approvata' AND creato < datetime('now', '-12 months')"),
  ]).catch(() => {}));
}

// ---- Pannello /admin: riservato a Karim ----

/** Confronto a tempo costante (non rivela quanti caratteri della password sono giusti). */
async function uguali(a, b) {
  const h = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([h(a), h(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/**
 * Chi può usare le API del pannello: chi passa da Cloudflare Access (se configurato)
 * oppure chi invia la password del pannello (segreto ADMIN_PASSWORD nelle impostazioni di Pages).
 */
export async function autorizzato(request, env) {
  if (await utenteAccess(request, env)) return true;
  const pw = request.headers.get('x-admin-password');
  if (!env.ADMIN_PASSWORD || !pw) return false;
  if (await uguali(pw, env.ADMIN_PASSWORD)) return true;
  await new Promise((r) => setTimeout(r, 800)); // rallenta i tentativi a caso
  return false;
}

// ---- Cloudflare Access (opzionale) ----
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
