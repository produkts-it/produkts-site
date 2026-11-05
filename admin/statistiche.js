/* Scheda Statistiche del pannello: visite al sito senza cookie (functions/_statistiche.js).
   Visite = persone arrivate sul sito (una per sessione del browser); pagine viste = tutte le pagine aperte. */
(function () {
  var el, api, e, GIORNI = 30;
  var NOMI = { '/': 'Home', '/lavori': 'Lavori', '/chi-sono': 'Chi sono', '/contatti': 'Contatti', '/recensioni': 'Recensioni',
    '/privacy': 'Privacy', '/link': 'Link in bio', '/galleria': 'Galleria clienti', '/area-clienti': 'Area clienti', '/en': 'Home (inglese)' };
  var MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

  function bello(s) { s = s.replace(/-/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); }
  function nome(p) { return NOMI[p] || (p.indexOf('/en/') === 0 ? (NOMI['/' + p.slice(4)] || bello(p.slice(4))) + ' (inglese)' : bello(p.slice(1))); }
  function data(g) { var x = g.split('-'); return +x[2] + ' ' + MESI[+x[1] - 1]; }
  function somma(a, k) { return a.reduce(function (s, x) { return s + (x[k] || 0); }, 0); }
  function barre(righe, k, etichetta) {
    var max = Math.max.apply(null, righe.map(function (x) { return x[k]; }).concat([1]));
    return righe.map(function (x) {
      return '<div class="stb"><span class="stn">' + e(etichetta(x)) + '</span><span class="stv"><i style="width:' + (x[k] / max * 100).toFixed(1) + '%"></i></span><b>' + x[k] + '</b></div>';
    }).join('') || '<p class="vuoto" style="margin:0">Ancora niente.</p>';
  }

  async function disegna() {
    el.innerHTML = '<p class="vuoto">Caricamento…</p>';
    try {
      var r = await api('statistiche?giorni=' + GIORNI);
      // un giorno per colonna, anche quelli senza visite
      var mappa = {}, giorni = [];
      r.perGiorno.forEach(function (x) { mappa[x.giorno] = x; });
      for (var i = r.giorni - 1; i >= 0; i--) {
        var g = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date(Date.now() - i * 86400000));
        giorni.push(mappa[g] || { giorno: g, visite: 0, viste: 0 });
      }
      var max = Math.max.apply(null, giorni.map(function (x) { return x.visite; }).concat([1]));
      var colonne = giorni.map(function (x) {
        return '<span class="stc" title="' + e(data(x.giorno)) + ': ' + x.visite + ' visite, ' + x.viste + ' pagine viste"><i style="height:' + (x.visite / max * 100).toFixed(1) + '%"></i></span>';
      }).join('');
      var vis = somma(r.perGiorno, 'visite'), viste = somma(r.perGiorno, 'viste');
      el.innerHTML = '<div class="az" style="margin-top:16px">' + [[7, '7 giorni'], [30, '30 giorni'], [90, '3 mesi'], [365, '1 anno']].map(function (p) {
          return '<button type="button" data-st-giorni="' + p[0] + '"' + (p[0] === GIORNI ? ' class="on"' : '') + '>' + p[1] + '</button>';
        }).join('') + '</div>'
        + '<div class="item"><div class="sttot"><div><b>' + vis + '</b><span>visite</span></div><div><b>' + viste + '</b><span>pagine viste</span></div>'
        + '<div><b>' + (vis ? (viste / vis).toFixed(1).replace('.', ',') : '0') + '</b><span>pagine per visita</span></div></div>'
        + '<div class="stgiorni">' + colonne + '</div><div class="meta" style="justify-content:space-between"><span>' + e(data(giorni[0].giorno)) + '</span><span>oggi</span></div></div>'
        + '<div class="item"><div class="meta"><b>Da dove arrivano</b><span>visite</span></div>' + barre(r.fonti, 'visite', function (x) { return x.fonte; }) + '</div>'
        + '<div class="item"><div class="meta"><b>Pagine più viste</b></div>' + barre(r.pagine, 'viste', function (x) { return nome(x.pagina); }) + '</div>'
        + '<div class="item"><div class="meta"><b>Telefono o computer</b><span>visite</span></div>' + barre(r.dispositivi, 'visite', function (x) { return x.dispositivo === 'telefono' ? 'Telefono o tablet' : 'Computer'; }) + '</div>'
        + '<p class="vuoto" style="font-size:13px;line-height:1.6">Statistiche anonime, senza cookie: si contano le pagine aperte, non le persone. Non contano i robot né i dispositivi dove usi questo pannello. «Diretto» = link scritto a mano, salvato o aperto da un’app che non dice da dove arriva.</p>';
    } catch (err) {
      if (!err.login) el.innerHTML = '<p class="err">' + e(err.message) + '</p>';
    }
  }

  window.PKStatistiche = {
    mostra: function (lista, apiFn, esc) {
      if (el !== lista) {
        el = lista;
        el.addEventListener('click', function (ev) {
          var b = ev.target.closest('[data-st-giorni]'); if (!b || !el.contains(b)) return;
          GIORNI = +b.dataset.stGiorni; disegna();
        });
      }
      api = apiFn; e = esc;
      return disegna();
    }
  };
})();
