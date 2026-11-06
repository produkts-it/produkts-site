// GET /api/google — link di Google per lasciare una recensione (vuoto finché Karim non lo mette nel pannello).
// Lo usa la pagina Recensioni per «Lasciala anche su Google».
import { json, linkGoogle } from '../_lib.js';

export async function onRequestGet({ env }) {
  return json({ recensione: await linkGoogle(env) });
}
