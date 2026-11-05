/* Scheda Link del pannello: il link in bio per Instagram, TikTok ecc. (produkts.it/link, fuori dal menu).
   Si sceglie il lavoro in evidenza, i pulsanti (titolo, riga piccola, indirizzo), fino a 6 lavori e i social.
   Salvando, le API (functions/_lavori.js → salvaLink) fanno un commit di lavori.json ("link") su GitHub;
   Cloudflare rigenera la pagina con lavori.py in 1–2 minuti. */
(function () {
  var el, api, e, D = null, RAMO = 'main', ST = null, MSG = '';
  var SOCIAL = [['instagram', 'Instagram', 'https://www.instagram.com/…'], ['tiktok', 'TikTok', 'https://www.tiktok.com/@…'],
    ['youtube', 'YouTube', 'https://www.youtube.com/@…'], ['email', 'Email', 'info@produkts.it']];
  var PRONTI = [['Richiedi un preventivo', 'Foto e video per eventi, brand e progetti', 'contatti'],
    ['Scrivimi su WhatsApp', 'Ti rispondo di solito entro un giorno', 'https://wa.me/393711444875'],
    ['Lascia una recensione', 'Abbiamo lavorato insieme? Raccontalo', 'recensioni#scrivi'],
    ['Le tue foto', 'Area clienti: entra con il codice della tua galleria', 'area-clienti'],
    ['Salva il mio contatto', 'Aggiungimi alla rubrica con un tocco', 'assets/karim-ismail.vcf'],
    ['Scarica la filmografia', 'Tutti i lavori in PDF', 'assets/karim-ismail-filmografia.pdf'],
    ['Tutti i lavori', 'Cortometraggi, videoclip ed eventi', 'lavori'],
    ['Chi sono', 'La mia storia e la filmografia', 'chi-sono']];

  function tutti() {
    return D.lavori.map(function (w) { return { slug: w.slug, t: w.t, y: w.year }; })
      .concat(D.amarcord.map(function (a) { return { slug: a.slug, t: a.t + ' (AMARCORD)', y: a.anno || '2026' }; }));
  }
  function titolo(slug) { var w = tutti().filter(function (x) { return x.slug === slug; })[0]; return w ? w.t : slug; }
  function attr(s) { return e(s == null ? '' : s); }

  function disegna() {
    var L = ST, ev = L.evidenza || { slug: '', occhiello: '' };
    var opz = function (sel, escludi) {
      return tutti().filter(function (w) { return !escludi || escludi.indexOf(w.slug) < 0; })
        .map(function (w) { return '<option value="' + attr(w.slug) + '"' + (w.slug === sel ? ' selected' : '') + '>' + e(w.t) + ' · ' + e(w.y) + '</option>'; }).join('');
    };
    var su = function (k, i, n) {
      return '<div class="az"><button type="button" data-lk-su="' + k + '" data-i="' + i + '"' + (i ? '' : ' disabled') + ' aria-label="Sposta su">↑</button>'
        + '<button type="button" data-lk-giu="' + k + '" data-i="' + i + '"' + (i < n - 1 ? '' : ' disabled') + ' aria-label="Sposta giù">↓</button>'
        + '<button type="button" data-lk-via="' + k + '" data-i="' + i + '" aria-label="Togli">✕</button></div>';
    };
    var link = L.link.map(function (x, i) {
      return '<div class="lkr"><span class="lkn">' + String(i + 1).padStart(2, '0') + '</span><div class="gcampi">'
        + '<label>Titolo<input data-lk="link" data-i="' + i + '" data-k="t" value="' + attr(x.t) + '" maxlength="60" placeholder="Es. Richiedi un preventivo"></label>'
        + '<label>Riga piccola <small>(facoltativa)</small><input data-lk="link" data-i="' + i + '" data-k="sub" value="' + attr(x.sub) + '" maxlength="100"></label>'
        + '<label>Indirizzo<input data-lk="link" data-i="' + i + '" data-k="url" value="' + attr(x.url) + '" placeholder="contatti oppure https://…" autocapitalize="off" spellcheck="false"></label>'
        + '</div>' + su('link', i, L.link.length) + '</div>';
    }).join('');
    var usati = L.link.map(function (x) { return x.url; });
    var pronti = PRONTI.filter(function (p) { return usati.indexOf(p[2]) < 0; })
      .map(function (p) { return '<button type="button" data-lk-pronto="' + attr(p[2]) + '">+ ' + e(p[0]) + '</button>'; }).join('');
    var lavori = L.lavori.map(function (s, i) {
      return '<div class="gsez"><span>' + e(titolo(s)) + '</span>' + su('lavori', i, L.lavori.length) + '</div>';
    }).join('');
    var social = SOCIAL.map(function (s) {
      return '<label>' + s[1] + '<input data-lk="social" data-k="' + s[0] + '" value="' + attr((L.social[s[0]] || '').replace(/^mailto:/, '')) + '" placeholder="' + attr(s[2]) + '" autocapitalize="off" spellcheck="false"></label>';
    }).join('');

    el.innerHTML = (RAMO !== 'main' ? '<p class="gesito err">Anteprima: i salvataggi vanno sul ramo «' + e(RAMO) + '», non sul sito vero.</p>' : '')
      + '<div class="item"><div class="meta"><b>Il tuo link</b><span>da mettere nella bio di Instagram, TikTok, YouTube…</span></div>'
      + '<div class="gcod"><b style="letter-spacing:.04em;text-transform:none">produkts.it/link</b>'
      + '<div class="az"><button type="button" data-gcopia="https://produkts.it/link">Copia</button><a class="lvedi" href="/link" target="_blank" rel="noopener">Apri la pagina</a></div></div>'
      + '<p class="testo" style="margin:0;font-size:14px">Non compare nel menu del sito e non esce su Google: ci arriva solo chi tocca il link nella bio.</p></div>'
      + (MSG ? '<p class="gesito ok">' + MSG + '</p>' : '')
      + '<form id="lkform">'
      + '<div class="item"><div class="meta"><b>In evidenza</b><span>il lavoro grande in alto, con «Guarda» e «Il progetto»</span></div><div class="gcampi">'
      + '<label>Lavoro<select data-lk="ev" data-k="slug"><option value="">Nessuno</option>' + opz(ev.slug) + '</select></label>'
      + '<label>Riga sopra il titolo <small>(facoltativa)</small><input data-lk="ev" data-k="occhiello" value="' + attr(ev.occhiello) + '" maxlength="80" placeholder="Es. Nomination · VerticalMovie 2026"></label>'
      + '</div></div>'
      + '<div class="item"><div class="meta"><b>Pulsanti</b><span>in quest’ordine; l’indirizzo può essere una pagina del sito (contatti, recensioni#scrivi) o un link completo</span></div>'
      + (link || '<p class="vuoto" style="margin:0">Nessun pulsante.</p>')
      + '<div class="az"><button type="button" data-lk-nuovo="1">+ Pulsante vuoto</button>' + pronti + '</div></div>'
      + '<div class="item"><div class="meta"><b>Ultimi lavori</b><span>fino a 6, sotto i pulsanti, con la copertina</span></div>'
      + (lavori || '<p class="vuoto" style="margin:0">Nessun lavoro.</p>')
      + (L.lavori.length < 6 ? '<div class="gcampi"><label>Aggiungi un lavoro<select data-lk-agg="1"><option value="">Scegli…</option>' + opz('', L.lavori.concat(ev.slug ? [ev.slug] : [])) + '</select></label></div>' : '')
      + '</div>'
      + '<div class="item"><div class="meta"><b>Social</b><span>le icone tonde sotto il nome; lascia vuoto per toglierne una</span></div><div class="gcampi">' + social + '</div></div>'
      + '<div class="az" style="margin-top:16px"><button type="submit" class="on" style="height:48px;padding:0 28px">Salva il link in bio</button></div>'
      + '<p class="gesito" id="lkesito"></p></form>';
  }

  function sposta(lista, i, j) { var t = lista[i]; lista[i] = lista[j]; lista[j] = t; }

  async function salva() {
    var es = document.getElementById('lkesito'), b = el.querySelector('#lkform [type=submit]');
    es.className = 'gesito'; es.textContent = 'Salvataggio…'; b.disabled = true;
    try {
      var r = await api('link', ST);
      D.link = r.link; ST = JSON.parse(JSON.stringify(r.link)); ST.evidenza = ST.evidenza || null;
      MSG = 'Salvato. La pagina si aggiorna in 1–2 minuti: <a href="/link" target="_blank" rel="noopener">aprila</a> (se non vedi ancora le modifiche, ricarica tra poco).';
      disegna(); window.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
    } catch (err) {
      es.className = 'gesito err'; es.textContent = err.message; b.disabled = false;
    }
  }

  function legati() {
    el.addEventListener('input', function (ev) {
      var t = ev.target, k = t.dataset.k;
      if (t.dataset.lk === 'link') ST.link[+t.dataset.i][k] = t.value;
      else if (t.dataset.lk === 'social') ST.social[k] = t.value.trim();
      else if (t.dataset.lk === 'ev') { ST.evidenza = ST.evidenza || { slug: '', occhiello: '' }; ST.evidenza[k] = t.value; }
    });
    el.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t.dataset.lkAgg && t.value) { ST.lavori.push(t.value); disegna(); }
      else if (t.dataset.lk === 'ev' && t.dataset.k === 'slug') {
        ST.evidenza = t.value ? { slug: t.value, occhiello: (ST.evidenza && ST.evidenza.occhiello) || '' } : null;
        ST.lavori = ST.lavori.filter(function (s) { return s !== t.value; }); disegna();
      }
    });
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b || !el.contains(b)) return;
      var d = b.dataset, i = +d.i;
      if (d.lkSu) { sposta(ST[d.lkSu], i, i - 1); disegna(); }
      else if (d.lkGiu) { sposta(ST[d.lkGiu], i, i + 1); disegna(); }
      else if (d.lkVia) { ST[d.lkVia].splice(i, 1); disegna(); }
      else if (d.lkNuovo) { ST.link.push({ t: '', sub: '', url: '' }); disegna(); var c = el.querySelectorAll('[data-lk="link"][data-k="t"]'); c[c.length - 1].focus(); }
      else if (d.lkPronto) { var p = PRONTI.filter(function (x) { return x[2] === d.lkPronto; })[0]; ST.link.push({ t: p[0], sub: p[1], url: p[2] }); disegna(); }
    });
    el.addEventListener('submit', function (ev) { if (ev.target.id === 'lkform') { ev.preventDefault(); salva(); } });
  }

  window.PKLink = {
    mostra: async function (lista, apiFn, esc) {
      if (el !== lista) { el = lista; legati(); }
      api = apiFn; e = esc; MSG = '';
      el.innerHTML = '<p class="vuoto">Caricamento…</p>';
      try {
        var r = await api('lavori'); D = r.dati; RAMO = r.ramo;
        var L = D.link || {};
        ST = { evidenza: L.evidenza || null, lavori: (L.lavori || []).slice(), link: (L.link || []).map(function (x) { return { t: x.t, sub: x.sub || '', url: x.url }; }), social: Object.assign({}, L.social || {}) };
        disegna();
      } catch (err) {
        if (!err.login) el.innerHTML = '<p class="err">' + e(err.message) + '</p>';
      }
    }
  };
})();
