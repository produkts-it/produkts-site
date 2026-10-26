/* Scheda Lavori del pannello: aggiunge o modifica un lavoro alla volta (corti, videoclip, video aziendali, docufilm).
   Salvando, le API (functions/_lavori.js) fanno un commit su GitHub con lavori.json, fotogramma e copertina;
   Cloudflare ripubblica il sito in 1–2 minuti. I nomi già presenti vengono suggeriti, così "Anche in…" li collega. */
(function () {
  var KI = 'Karim Ismail', PROD = 'Tiziana Lattuca per AMARCORD';
  var SENZA_COPERTINA = { dynamis: 1 };
  var TIPI = [['amarcord', 'Cortometraggio AMARCORD'], ['corto', 'Cortometraggio'], ['docufilm', 'Docufilm'], ['videoclip', 'Videoclip'], ['aziendale', 'Video aziendale']];
  var ETICHETTA = { corto: 'Cortometraggio', docufilm: 'Docufilm', videoclip: 'Videoclip musicale', aziendale: 'Video aziendale' };
  var CAT = { corto: 'Cortometraggio', docufilm: 'Cortometraggio', videoclip: 'Videoclip', aziendale: 'Video aziendale' };
  var TROUPE_AM = ['Regia', 'Produzione', 'Soggetto', 'Sceneggiatura', 'Direzione della fotografia', 'Operatore', 'Assistente operatore', 'Montaggio',
    'Aiuto regia', 'Scenografia', 'Fonico', 'Segretaria di edizione', 'Ciak', 'Backstage', 'Capo reparto trucco', 'Trucco'];

  var el, api, e, D = null, RAMO = 'main', NOMI = [], RUOLI = [], ST = null;

  // ---------- utilità ----------
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function slugify(s) { return norm(s).replace(/['’]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60); }
  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  /** Link YouTube o Vimeo → { yt } o { vimeo: 'id' | 'id/hash' } */
  function video(u) {
    u = String(u || '').trim();
    var m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{6,20})/);
    if (m) return { yt: m[1] };
    m = u.match(/vimeo\.com\/(?:video\/)?(\d{5,12})(?:\/([0-9a-f]{6,16}))?/);
    if (m) { var h = m[2] || (u.match(/[?&]h=([0-9a-f]{6,16})/) || [])[1]; return { vimeo: m[1] + (h ? '/' + h : '') }; }
    return null;
  }
  function linkDi(l) { return l.yt ? 'https://www.youtube.com/watch?v=' + l.yt : l.vimeo ? 'https://vimeo.com/' + l.vimeo : ''; }
  function carica(src, cors) {
    return new Promise(function (ok, ko) { var i = new Image(); if (cors) i.crossOrigin = 'anonymous'; i.onload = function () { ok(i); }; i.onerror = ko; i.src = src; });
  }

  // Nomi e ruoli già presenti nei lavori: suggerimenti e controllo di come sono scritti
  function indice() {
    var n = {}, r = {};
    function nome(x) { if (x && x !== PROD) n[x] = 1; }
    D.lavori.concat(D.amarcord, [D.dynamis]).forEach(function (l) {
      (l.cast || []).forEach(function (c) { nome(c[1]); });
      (l.crew || []).forEach(function (c) { r[c[0]] = 1; (Array.isArray(c[1]) ? c[1] : String(c[1]).split(', ')).forEach(nome); });
    });
    TROUPE_AM.forEach(function (x) { r[x] = 1; });
    NOMI = Object.keys(n).sort(); RUOLI = Object.keys(r).sort();
  }
  function suggerisci(v) {
    if (!v || v === KI || v === PROD || NOMI.indexOf(v) >= 0) return null;
    var nv = norm(v), best = null, bd = 99;
    NOMI.forEach(function (x) { var d = lev(nv, norm(x)); if (d < bd) { bd = d; best = x; } });
    return bd <= Math.max(2, Math.round(nv.length / 6)) ? { nome: best } : { nuovo: true };
  }

  // ---------- elenco ----------
  function tutti() {
    var a = D.lavori.filter(function (l) { return l.page !== false; }).map(function (l) { return { l: l, g: 'lavori', anno: l.year }; });
    var b = D.amarcord.map(function (l) { return { l: l, g: 'amarcord', anno: l.anno || '2026' }; });
    return b.concat(a).sort(function (x, y) { return y.anno.localeCompare(x.anno); });
  }
  var VERSIONE = Date.now(); // miniature sempre fresche: dopo un salvataggio la copertina cambia
  function anteprima(l) { return SENZA_COPERTINA[l.slug] || !l.img || /^http/.test(l.img) ? l.img : '/img/copertine/' + l.slug + '.jpg?t=' + VERSIONE; }
  function elenco(msg) {
    var righe = tutti().map(function (x, i) {
      var l = x.l, tipo = x.g === 'amarcord' ? 'AMARCORD' : (l.kicker || '').split(' · ')[0];
      return '<div class="item lav"><img src="' + e(anteprima(l)) + '" alt="" onerror="this.style.visibility=\'hidden\'">'
        + '<div class="lavt"><div class="meta"><b>' + e(tipo) + '</b><span>' + e(x.anno) + '</span></div><div style="font-size:18px">' + e(l.t) + '</div></div>'
        + '<div class="az"><button type="button" data-lmod="' + x.g + ':' + e(l.slug) + '">Modifica</button>'
        + '<a class="lvedi" href="/' + e(l.slug) + '" target="_blank" rel="noopener">Vedi</a></div></div>';
    }).join('');
    el.innerHTML = (RAMO !== 'main' ? '<p class="gesito err">Anteprima: i salvataggi vanno sul ramo «' + e(RAMO) + '», non sul sito vero.</p>' : '')
      + (msg ? '<p class="gesito ok" style="margin-top:16px">' + msg + '</p>' : '')
      + '<div class="az" style="margin-top:16px"><button type="button" class="on" data-lnuovo="1">Nuovo lavoro</button></div>' + righe;
  }

  // ---------- modulo ----------
  function tipoDi(l, g) {
    if (g === 'amarcord') return 'amarcord';
    if (/^Docufilm/.test(l.kicker || '')) return 'docufilm';
    if (l.cats.indexOf('Videoclip') >= 0) return 'videoclip';
    if (l.cats.indexOf('Video aziendale') >= 0) return 'aziendale';
    return 'corto';
  }
  function metaPredefinita(tipo) {
    return tipo === 'videoclip' ? [['Artista', '']] : tipo === 'aziendale' ? [['Produzione', ''], ['Cliente', '']] : [['Produzione', 'produkts.it']];
  }
  function apri(g, slug) {
    var l = slug ? (g === 'amarcord' ? D.amarcord : D.lavori).filter(function (x) { return x.slug === slug; })[0] : null;
    var tipo = l ? tipoDi(l, g) : 'amarcord';
    var filmo = l ? D.filmografia.filter(function (r) { return r[3] === l.slug; })[0] : null;
    ST = {
      nuovo: !l, g: l ? g : 'amarcord', tipo: tipo, slugAuto: !l, img: l ? l.img : '', file: null, posY: 50,
      l: l || {}, filmo: filmo ? { mostra: true, ruolo: filmo[1], produzione: filmo[2] } : { mostra: !l, ruolo: '', produzione: '' },
    };
    disegnaModulo();
  }
  function riga(cls, a, b, pa, pb, la, lb) {
    return '<div class="lriga ' + cls + '"><input value="' + e(a) + '" placeholder="' + pa + '"' + (la ? ' list="' + la + '"' : '') + '>'
      + '<input value="' + e(b) + '" placeholder="' + pb + '"' + (lb ? ' list="' + lb + '"' : '') + ' data-nome="' + (lb === 'pk-nomi' ? 1 : '') + '">'
      + '<button type="button" data-ltogli="1" aria-label="Togli riga">×</button><small class="lsug"></small></div>';
  }
  function disegnaModulo() {
    var l = ST.l, am = ST.tipo === 'amarcord';
    var tipi = TIPI.filter(function (t) { return ST.nuovo || (ST.g === 'amarcord') === (t[0] === 'amarcord'); })
      .map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === ST.tipo ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('');
    var meta = am ? [] : (l.meta ? l.meta.filter(function (m) { return m[0] !== 'Uscita'; }) : metaPredefinita(ST.tipo));
    var cast = (l.cast || []).map(function (c) { return [c[0], c[1]]; });
    var crew = [];
    (l.crew || (am ? TROUPE_AM.map(function (r) { return [r, r === 'Produzione' ? [PROD] : []]; }) : [['Regia', ''], ['Direzione della fotografia', KI], ['Montaggio', '']]))
      .forEach(function (c) {
        var nomi = Array.isArray(c[1]) ? c[1] : String(c[1]).split(', ');
        if (!nomi.length || (nomi.length === 1 && !nomi[0])) crew.push([c[0], '']); else nomi.forEach(function (n) { crew.push([c[0], n]); });
      });
    var link = linkDi(l), f = ST.filmo;
    el.innerHTML = '<form class="item lform" id="lform" style="border-color:var(--steel)">'
      + '<div class="meta"><b>' + (ST.nuovo ? 'Nuovo lavoro' : 'Modifica') + '</b><span>' + (ST.nuovo ? 'compila e salva: il sito si aggiorna in 1–2 minuti' : e(l.t)) + '</span></div>'
      + '<div class="gcampi">'
      + '<label>Tipo<select name="tipo">' + tipi + '</select></label>'
      + (am ? '' : '<label class="lchk"><input type="checkbox" name="personale"' + ((l.cats || []).indexOf('Opera personale') >= 0 ? ' checked' : '') + '> Opera personale</label>')
      + '<label style="flex-basis:100%">Titolo<input name="t" required value="' + e(l.t || '') + '"></label>'
      + (ST.nuovo ? '<label style="flex-basis:100%">Indirizzo della pagina<span class="lslug">produkts.it/<input name="slug" required value="' + e(l.slug || '') + '" pattern="[a-z0-9]+(-[a-z0-9]+)*"></span></label>' : '')
      + (am ? '' : '<label><span>Sottotitolo <small>(facoltativo)</small></span><input name="sub" value="' + e(l.sub || '') + '"></label>')
      + '<label>Anno<input name="anno" inputmode="numeric" maxlength="4" required value="' + e(am ? (l.anno || (ST.nuovo ? String(new Date().getFullYear()) : '2026')) : (l.year || String(new Date().getFullYear()))) + '"></label>'
      + (am ? '' : '<label><span>Uscita <small>(es. 25 aprile 2025)</small></span><input name="date" value="' + e(l.date || '') + '"></label>')
      + '<label style="flex-basis:100%">Link al video (YouTube o Vimeo)<input name="link" required value="' + e(link) + '" placeholder="https://vimeo.com/…"></label>'
      + (am ? '<label>Durata (minuti)<input name="min" inputmode="numeric" required value="' + e(l.min || '') + '"></label><label><span>Genere <small>(facoltativo)</small></span><input name="gen" value="' + e(l.gen || '') + '" placeholder="Dramma psicologico"></label>' : '')
      + '<label style="flex-basis:100%"><span>Riga del progetto <small>— una riga di atmosfera, niente spoiler</small></span><textarea name="line" rows="2" required>' + e(l.line || '') + '</textarea></label>'
      + (am ? '<label style="flex-basis:100%">Il tuo ruolo<input name="ruolo" required value="' + e(l.ruolo || '') + '" placeholder="Direttore della fotografia"></label>'
        : '<label style="flex-basis:100%">Il tuo ruolo, completo<input name="role" required value="' + e(l.role || '') + '" placeholder="Regia, direzione della fotografia e montaggio"></label>'
        + '<label style="flex-basis:100%">Il tuo ruolo, in breve (schede)<input name="role_short" required value="' + e(l.role_short || '') + '" placeholder="Regia, D.O.P. e montaggio"></label>')
      + '</div>'
      + (am ? '' : '<div class="lsez"><div class="meta"><b>Dati</b><span>artista, cliente o produzione (l’uscita si aggiunge da sola)</span></div><div data-lrighe="meta">'
        + meta.map(function (m) { return riga('lmeta', m[0], m[1], 'Artista', 'Nome'); }).join('') + '</div><div class="az"><button type="button" data-lagg="meta">+ Dato</button></div></div>')
      + '<div class="lsez"><div class="meta"><b>Cast</b><span>personaggio e attore/attrice</span></div><div data-lrighe="cast">'
      + cast.map(function (c) { return riga('lcast', c[0], c[1], 'Personaggio', 'Nome e cognome', '', 'pk-nomi'); }).join('') + '</div><div class="az"><button type="button" data-lagg="cast">+ Attore</button></div></div>'
      + '<div class="lsez"><div class="meta"><b>Troupe</b><span>un nome per riga; stesso ruolo su più righe se sono in due. Righe senza nome non vengono salvate</span></div><div data-lrighe="crew">'
      + crew.map(function (c) { return riga('lcrew', c[0], c[1], 'Ruolo', 'Nome e cognome', 'pk-ruoli', 'pk-nomi'); }).join('') + '</div><div class="az"><button type="button" data-lagg="crew">+ Ruolo</button></div></div>'
      + '<div class="lsez"><div class="meta"><b>Filmografia</b><span>solo cinema: cortometraggi, film, docufilm. Niente videoclip o aziendali</span></div>'
      + '<div class="gcampi"><label class="lchk"><input type="checkbox" name="fmostra"' + (f.mostra && ST.tipo !== 'videoclip' && ST.tipo !== 'aziendale' ? ' checked' : '') + '> Mostra in Home e Chi sono</label>'
      + '<label><span>Ruolo in filmografia <small>(vuoto = il tuo ruolo)</small></span><input name="fruolo" value="' + e(f.ruolo) + '"></label><label><span>Produzione <small>(vuoto = ' + (am ? 'AMARCORD' : 'produkts.it') + ')</small></span><input name="fprod" value="' + e(f.produzione) + '"></label></div></div>'
      + '<div class="lsez"><div class="meta"><b>Fotogramma e copertina</b><span>' + (SENZA_COPERTINA[l.slug] ? 'questo lavoro tiene la sua immagine' : 'scegli un fotogramma (anche uno screenshot): la copertina con titolo e dati si fa da sola') + '</span></div>'
      + '<div class="gcampi"><label style="flex-basis:100%">Immagine<input type="file" name="file" accept="image/*"></label>'
      + '<label style="flex-basis:100%" data-lpos hidden>Inquadratura: sposta su o giù<input type="range" name="posY" min="0" max="100" value="50"></label></div>'
      + '<canvas id="lcop" class="lcop" width="1600" height="669" hidden></canvas><p class="vuoto" id="lcopno" hidden>Nessun fotogramma: sul sito resta ' + (l.yt ? 'la miniatura di YouTube' : 'il mirino scuro') + '.</p></div>'
      + '<div class="az"><button type="submit" class="on">' + (ST.nuovo ? 'Salva e pubblica' : 'Salva le modifiche') + '</button><button type="button" data-lannulla="1">Annulla</button></div>'
      + '<p class="gesito" hidden></p></form>'
      + '<datalist id="pk-nomi">' + NOMI.map(function (n) { return '<option value="' + e(n) + '">'; }).join('') + '<option value="' + KI + '"></datalist>'
      + '<datalist id="pk-ruoli">' + RUOLI.map(function (n) { return '<option value="' + e(n) + '">'; }).join('') + '</datalist>';
    el.querySelectorAll('[data-nome="1"]').forEach(controllaNome);
    copertina();
  }

  // Lavoro come lo vuole lavori.json, dai campi del modulo
  function leggiModulo() {
    var f = document.getElementById('lform'), v = function (n) { return f.elements[n] ? f.elements[n].value.trim() : ''; };
    var am = ST.tipo === 'amarcord', vid = video(v('link')) || {};
    function righe(k) {
      return Array.prototype.map.call(f.querySelectorAll('[data-lrighe="' + k + '"] .lriga'), function (r) { var i = r.querySelectorAll('input'); return [i[0].value.trim(), i[1].value.trim()]; });
    }
    // Troupe: righe con lo stesso ruolo diventano un ruolo con più nomi, nell'ordine in cui compaiono
    var crew = [], pos = {};
    righe('crew').forEach(function (r) {
      if (!r[0] || !r[1]) return;
      if (!(r[0] in pos)) { pos[r[0]] = crew.length; crew.push([r[0], []]); }
      crew[pos[r[0]]][1].push(r[1]);
    });
    var l = { slug: ST.nuovo ? v('slug') : ST.l.slug, t: v('t'), line: v('line'), cast: righe('cast').filter(function (r) { return r[1]; }) };
    if (vid.yt) l.yt = vid.yt; if (vid.vimeo) l.vimeo = vid.vimeo;
    if (am) {
      l.anno = v('anno'); l.min = parseInt(v('min'), 10) || 0; l.gen = v('gen'); l.ruolo = v('ruolo'); l.crew = crew;
    } else {
      var pers = f.elements.personale && f.elements.personale.checked, anno = v('anno');
      l.year = anno; l.sub = v('sub'); l.date = v('date'); l.role = v('role'); l.role_short = v('role_short');
      l.cats = [CAT[ST.tipo]].concat(pers ? ['Opera personale'] : []);
      l.kicker = [ETICHETTA[ST.tipo], pers ? 'opera personale' : '', anno].filter(Boolean).join(' · ');
      l.meta = righe('meta').filter(function (m) { return m[0] && m[1]; });
      // L'uscita si scrive da sola; se la data non è cambiata resta com'era (es. "Marzo 2022 · Vimeo")
      var prima = (ST.l.meta || []).filter(function (x) { return x[0] === 'Uscita'; })[0];
      if (l.date) l.meta.push(prima && ST.l.date === l.date && !!ST.l.yt === !!l.yt ? prima.slice() : ['Uscita', l.date + ' · ' + (l.yt ? 'YouTube' : 'Vimeo')]);
      l.crew = crew.map(function (c) { return [c[0], c[1].join(', ')]; });
    }
    return { l: l, link: !!(vid.yt || vid.vimeo), filmo: { mostra: !!(f.elements.fmostra && f.elements.fmostra.checked), ruolo: v('fruolo'), produzione: v('fprod') } };
  }

  // Fotogramma (nuovo file ritagliato, o quello già sul sito) e anteprima della copertina
  var fonte = null, fonteDi = null, timer = null;
  async function sorgente() {
    var chiave = ST.file ? 'file:' + ST.file.name + ST.file.size : 'img:' + ST.img;
    if (fonteDi === chiave) return fonte;
    fonteDi = chiave; fonte = null;
    try {
      if (ST.file) { var u = URL.createObjectURL(ST.file); fonte = await carica(u); }
      else if (ST.img) fonte = await carica(/^http/.test(ST.img) ? ST.img : '/' + ST.img, /^http/.test(ST.img));
    } catch (x) { fonte = null; }
    return fonte;
  }
  function fotogramma(img) { return ST.file ? PKCopertina.ritaglia(img, ST.posY) : img; }
  async function copertina() {
    var c = document.getElementById('lcop'), no = document.getElementById('lcopno');
    if (!c) return;
    var img = await sorgente(), m = leggiModulo();
    document.querySelector('[data-lpos]').hidden = !ST.file;
    if (!img || SENZA_COPERTINA[ST.l.slug]) { c.hidden = true; no.hidden = !!img; if (img) { no.hidden = true; } return; }
    var d = PKCopertina.dati(m.l, ST.g === 'amarcord' || ST.tipo === 'amarcord' ? 'amarcord' : 'lavori');
    try {
      var out = PKCopertina.disegna(fotogramma(img), d);
      c.getContext('2d').drawImage(out, 0, 0); c.hidden = false; no.hidden = true;
    } catch (x) { c.hidden = true; no.hidden = false; }
  }
  function aggiorna() { clearTimeout(timer); timer = setTimeout(copertina, 250); }

  function controllaNome(input) {
    var s = suggerisci(input.value.trim()), out = input.parentNode.querySelector('.lsug');
    if (!out) return;
    if (!s) { out.innerHTML = ''; return; }
    out.innerHTML = s.nome ? 'Forse <b>' + e(s.nome) + '</b>? <button type="button" data-lusa="' + e(s.nome) + '">Usa questo</button>'
      : 'Nome nuovo: controlla che sia scritto giusto (sarà scritto così su tutto il sito).';
  }

  async function salva(form) {
    var es = form.querySelector('.gesito'), b = form.querySelector('button[type=submit]'), m = leggiModulo();
    es.hidden = false; es.className = 'gesito err';
    if (!m.link) { es.textContent = 'Il link al video non è un link YouTube o Vimeo.'; return; }
    if (ST.tipo === 'amarcord' && !m.l.vimeo) { es.textContent = 'I corti AMARCORD hanno il link Vimeo.'; return; }
    b.disabled = true; b.textContent = 'Salvo…';
    try {
      var img = await sorgente(), dati = { gruppo: ST.tipo === 'amarcord' ? 'amarcord' : 'lavori', nuovo: ST.nuovo, lavoro: m.l, filmografia: m.filmo };
      if (img && !SENZA_COPERTINA[m.l.slug]) {
        var fr = fotogramma(img);
        if (ST.file) dati.fotogramma = PKCopertina.jpeg(fr, 0.85);
        try { dati.copertina = PKCopertina.jpeg(PKCopertina.disegna(fr, PKCopertina.dati(m.l, dati.gruppo)), 0.86); } catch (x) { /* immagine esterna senza permessi: niente copertina */ }
      }
      var r = await api('lavori', dati);
      D = (await api('lavori')).dati; indice();
      elenco('Salvato «' + e(m.l.t) + '». Il sito si aggiorna in 1–2 minuti: <a href="/' + e(r.slug) + '" target="_blank" rel="noopener">apri la pagina</a> (se non la vedi ancora, ricarica tra poco).');
    } catch (err) { es.textContent = err.message; b.disabled = false; b.textContent = ST.nuovo ? 'Salva e pubblica' : 'Salva le modifiche'; }
  }

  // ---------- eventi ----------
  function eventi() {
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b || !el.contains(b)) return;
      if (b.dataset.lnuovo) { apri(); return; }
      if (b.dataset.lmod) { var p = b.dataset.lmod.split(':'); apri(p[0], p[1]); return; }
      if (b.dataset.lannulla) { elenco(); return; }
      if (b.dataset.ltogli) { b.closest('.lriga').remove(); aggiorna(); return; }
      if (b.dataset.lusa) { var i = b.closest('.lriga').querySelector('[data-nome="1"]'); i.value = b.dataset.lusa; controllaNome(i); aggiorna(); return; }
      if (b.dataset.lagg) {
        var k = b.dataset.lagg, box = el.querySelector('[data-lrighe="' + k + '"]');
        box.insertAdjacentHTML('beforeend', k === 'meta' ? riga('lmeta', '', '', 'Artista', 'Nome') : k === 'cast' ? riga('lcast', '', '', 'Personaggio', 'Nome e cognome', '', 'pk-nomi') : riga('lcrew', '', '', 'Ruolo', 'Nome e cognome', 'pk-ruoli', 'pk-nomi'));
        box.lastElementChild.querySelector('input').focus();
      }
    });
    el.addEventListener('input', function (ev) {
      var t = ev.target, f = t.form; if (!f || f.id !== 'lform') return;
      if (t.name === 't' && ST.slugAuto && f.elements.slug) f.elements.slug.value = slugify(t.value);
      if (t.name === 'slug') ST.slugAuto = false;
      if (t.name === 'posY') ST.posY = +t.value;
      aggiorna();
    });
    el.addEventListener('change', function (ev) {
      var t = ev.target, f = t.form; if (!f || f.id !== 'lform') return;
      if (t.name === 'tipo') {
        // Cambiare tipo ridisegna il modulo tenendo quello che è già scritto
        var m = leggiModulo(); ST.tipo = t.value; if (ST.nuovo) ST.g = t.value === 'amarcord' ? 'amarcord' : 'lavori';
        var keep = m.l; if (ST.tipo !== 'amarcord' && !keep.meta) keep.meta = metaPredefinita(ST.tipo);
        if (ST.tipo !== 'amarcord' && keep.anno && !keep.year) keep.year = keep.anno;
        if (ST.tipo === 'amarcord' && keep.year) keep.anno = keep.year;
        // della troupe resta solo quello che è stato scritto (non la produzione AMARCORD predefinita); se non resta niente, la troupe tipica del nuovo tipo
        var crew = (keep.crew || []).map(function (c) { return [c[0], (Array.isArray(c[1]) ? c[1] : String(c[1]).split(', ')).filter(function (n) { return n && n !== PROD; })]; })
          .filter(function (c) { return c[1].length; });
        ST.l = Object.assign({}, ST.l, keep, { crew: crew.length ? crew : null });
        if (!ST.l.crew) delete ST.l.crew;
        disegnaModulo(); return;
      }
      if (t.name === 'file') { ST.file = t.files[0] || null; ST.posY = 50; f.elements.posY.value = 50; aggiorna(); }
      if (t.dataset.nome === '1') controllaNome(t);
    });
    el.addEventListener('submit', function (ev) { if (ev.target.id === 'lform') { ev.preventDefault(); salva(ev.target); } });
  }

  var pronto = false;
  window.PKLavori = {
    mostra: async function (box, apiFn, esc) {
      el = box; api = apiFn; e = esc;
      if (!pronto) { eventi(); pronto = true; }
      el.innerHTML = '<p class="vuoto">Leggo i lavori…</p>';
      try {
        var r = await api('lavori'); D = r.dati; RAMO = r.ramo; indice();
        await PKCopertina.font();
        elenco();
      } catch (err) { el.innerHTML = '<p class="err">' + e(err.message) + '</p>'; }
    },
  };
})();
