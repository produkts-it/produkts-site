// Notifiche push del pannello /admin (Web Push, RFC 8291 + VAPID RFC 8292), solo WebCrypto: nessuna libreria.
// Le chiavi VAPID si creano da sole al primo uso e restano in D1 (tabella impostazioni): nessun segreto da impostare.
// Ogni dispositivo che preme "Attiva notifiche" nel pannello finisce nella tabella push.

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const unisci = (...parti) => {
  const out = new Uint8Array(parti.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parti) { out.set(p, i); i += p.length; }
  return out;
};

let tabellePronte = false;
async function tabelle(env) {
  if (tabellePronte) return;
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS impostazioni (chiave TEXT PRIMARY KEY, valore TEXT NOT NULL)'),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS push (endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL, creato TEXT NOT NULL DEFAULT (datetime('now')))"),
  ]);
  tabellePronte = true;
}

/** Chiavi VAPID: { pubblica (base64url, 65 byte), privata (JWK) }. Create al primo uso. */
async function chiavi(env) {
  await tabelle(env);
  const leggi = () => env.DB.prepare("SELECT valore FROM impostazioni WHERE chiave = 'vapid'").first('valore');
  let v = await leggi();
  if (!v) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const nuovo = JSON.stringify({
      pubblica: b64u(await crypto.subtle.exportKey('raw', kp.publicKey)),
      privata: await crypto.subtle.exportKey('jwk', kp.privateKey),
    });
    await env.DB.prepare("INSERT OR IGNORE INTO impostazioni (chiave, valore) VALUES ('vapid', ?)").bind(nuovo).run();
    v = await leggi(); // se due richieste le hanno create insieme, vince la prima salvata
  }
  return JSON.parse(v);
}

export async function chiavePubblica(env) {
  return (await chiavi(env)).pubblica;
}

export async function iscrivi(env, sub) {
  await tabelle(env);
  const endpoint = sub && sub.endpoint, k = (sub && sub.keys) || {};
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || typeof k.p256dh !== 'string' || typeof k.auth !== 'string') return false;
  await env.DB.prepare('INSERT OR REPLACE INTO push (endpoint, p256dh, auth) VALUES (?, ?, ?)').bind(endpoint, k.p256dh, k.auth).run();
  return true;
}

export async function disiscrivi(env, endpoint) {
  await tabelle(env);
  if (typeof endpoint === 'string') await env.DB.prepare('DELETE FROM push WHERE endpoint = ?').bind(endpoint).run();
}

/** Cifra il messaggio per un dispositivo (aes128gcm, RFC 8291). */
async function cifra(testo, p256dh, auth) {
  const uaPub = deb64u(p256dh), segreto = deb64u(auth);
  const ua = await crypto.subtle.importKey('raw', uaPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const io = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const ioPub = new Uint8Array(await crypto.subtle.exportKey('raw', io.publicKey));
  const condiviso = await crypto.subtle.deriveBits({ name: 'ECDH', public: ua }, io.privateKey, 256);
  const hkdf = async (salt, ikm, info, bytes) => {
    const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, bytes * 8));
  };
  const ikm = await hkdf(segreto, condiviso, unisci(enc.encode('WebPush: info\0'), uaPub, ioPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const chiave = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cifrato = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, chiave, unisci(enc.encode(testo), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]); // record size 4096
  return unisci(salt, rs, new Uint8Array([ioPub.length]), ioPub, cifrato);
}

/** Intestazione VAPID: JWT ES256 firmato con la chiave privata, valido 12 ore per il servizio push del dispositivo. */
async function vapid(endpoint, v) {
  const privata = await crypto.subtle.importKey('jwk', v.privata, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const intestazione = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const dati = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'mailto:info@produkts.it' })));
  const firma = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privata, enc.encode(intestazione + '.' + dati));
  return `vapid t=${intestazione}.${dati}.${b64u(firma)}, k=${v.pubblica}`;
}

/**
 * Manda { titolo, testo, url } a tutti i dispositivi iscritti. Toglie quelli non più validi (404/410).
 * Restituisce l'esito per dispositivo (usato dal pulsante "Prova" del pannello).
 */
export async function inviaPush(env, messaggio) {
  const v = await chiavi(env);
  const { results } = await env.DB.prepare('SELECT endpoint, p256dh, auth FROM push').all();
  const corpo = JSON.stringify(messaggio).slice(0, 3000);
  return Promise.all(results.map(async (d) => {
    try {
      const r = await fetch(d.endpoint, {
        method: 'POST',
        headers: { 'content-encoding': 'aes128gcm', 'content-type': 'application/octet-stream', ttl: '86400', urgency: 'high', authorization: await vapid(d.endpoint, v) },
        body: await cifra(corpo, d.p256dh, d.auth),
      });
      if (r.status === 404 || r.status === 410) await disiscrivi(env, d.endpoint);
      return { servizio: new URL(d.endpoint).host, stato: r.status, dettaglio: r.ok ? '' : (await r.text()).slice(0, 200) };
    } catch (e) {
      return { servizio: new URL(d.endpoint).host, stato: 0, dettaglio: String(e).slice(0, 200) };
    }
  }));
}
