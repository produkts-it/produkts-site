/* Copertine dei lavori: fotogramma 2.39:1 con occhiello, titolo e tre dati, nei font e colori del sito.
   La usano la scheda Lavori del pannello e _design/copertine/ (stesso disegno). Servono i font
   Cormorant Garamond (corsivo 300/400) e Space Grotesk (400/500) caricati nella pagina. */
(function () {
  var W = 1600, H = Math.round(1600 / 2.39), M = 72;
  var TESTO = '#E8E4DF', GRIGIO = '#9A948C', ARANCIO = '#D98A4E', KI = 'Karim Ismail';

  function font() {
    return Promise.all(['italic 300 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"',
      '400 20px "Space Grotesk"', '500 20px "Space Grotesk"'].map(function (f) { return document.fonts.load(f); }));
  }

  // Va a capo dentro la larghezza data
  function righe(ctx, testo, larg) {
    var out = [], r = '';
    String(testo).split(' ').forEach(function (p) {
      var prova = r ? r + ' ' + p : p;
      if (ctx.measureText(prova).width > larg && r) { out.push(r); r = p; } else r = prova;
    });
    if (r) out.push(r);
    return out;
  }

  /** Ritaglia un'immagine qualsiasi a 2.39:1 (1600 px); posY 0–100 sceglie la fascia verticale da tenere. */
  function ritaglia(img, posY) {
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var s = Math.max(W / img.width, H / img.height), w = img.width * s, h = img.height * s;
    var p = (posY == null ? 50 : posY) / 100;
    c.getContext('2d').drawImage(img, (W - w) / 2, (H - h) * p, w, h);
    return c;
  }

  /** Testi della copertina dai dati del lavoro (come dati_copertine() in lavori.py). */
  function dati(l, gruppo) {
    if (gruppo === 'amarcord') {
      var regia = (l.crew || []).filter(function (x) { return x[0] === 'Regia'; }).map(function (x) { return x[1].join(' e '); })[0] || '';
      return { kicker: 'Cortometraggio · AMARCORD · ' + (l.anno || '2026'), t: l.t, sub: '',
        dati: [['Regia', regia], [KI, l.ruolo], ['Durata', l.min + ' minuti']] };
    }
    return { kicker: l.kicker, t: l.t, sub: l.sub || '', dati: [l.meta[0] || ['', ''], [KI, l.role_short], ['Uscita', l.date]] };
  }

  /** Disegna la copertina su un canvas 1600×669 a partire dal fotogramma (immagine o canvas) e dai testi. */
  function disegna(img, d) {
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    var s = Math.max(W / img.width, H / img.height);
    x.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);

    // Velature: leggera su tutto, forte a sinistra e in basso dove sta il testo
    x.fillStyle = 'rgba(8,8,8,0.16)'; x.fillRect(0, 0, W, H);
    var g = x.createLinearGradient(0, 0, W * 0.78, 0);
    g.addColorStop(0, 'rgba(8,8,8,0.86)'); g.addColorStop(0.55, 'rgba(8,8,8,0.42)'); g.addColorStop(1, 'rgba(8,8,8,0)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    g = x.createLinearGradient(0, H * 0.42, 0, H);
    g.addColorStop(0, 'rgba(8,8,8,0)'); g.addColorStop(1, 'rgba(8,8,8,0.82)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);

    x.textBaseline = 'alphabetic';
    x.font = '500 22px "Space Grotesk"'; x.letterSpacing = '4px'; x.fillStyle = ARANCIO;
    x.fillText(String(d.kicker || '').toUpperCase(), M, 92);

    // Titolo: una riga, rimpicciolito finché non sta in 1050px
    x.letterSpacing = '0px';
    var fs = 156;
    do { x.font = 'italic 300 ' + fs + 'px "Cormorant Garamond"'; fs -= 4; } while (x.measureText(d.t).width > 1050 && fs > 84);
    var yT = d.sub ? 360 : 392;
    x.fillStyle = TESTO; x.fillText(d.t, M - 4, yT);
    if (d.sub) {
      x.font = 'italic 300 48px "Cormorant Garamond"'; x.fillStyle = '#C9C4BD';
      x.fillText(d.sub, M, yT + 66);
    }

    // Filetto e tre dati in colonna
    var yL = 488;
    x.fillStyle = 'rgba(232,228,223,0.24)'; x.fillRect(M, yL, W - 2 * M, 1.5);
    var colW = 360, gap = 40;
    d.dati.forEach(function (v, i) {
      var cx = M + i * (colW + gap);
      x.font = '500 18px "Space Grotesk"'; x.letterSpacing = '3px'; x.fillStyle = GRIGIO;
      x.fillText(String(v[0] || '').toUpperCase(), cx, yL + 50);
      x.font = '400 28px "Space Grotesk"'; x.letterSpacing = '0px'; x.fillStyle = TESTO;
      righe(x, v[1] || '', colW).slice(0, 2).forEach(function (r, k) { x.fillText(r, cx, yL + 94 + k * 36); });
    });

    x.font = 'italic 400 38px "Cormorant Garamond"'; x.fillStyle = 'rgba(232,228,223,0.85)'; x.textAlign = 'right';
    x.fillText('produkts.it', W - M, yL + 94);
    x.textAlign = 'left';
    return c;
  }

  /** JPEG in base64 (senza "data:…") da un canvas. */
  function jpeg(c, q) {
    return c.toDataURL('image/jpeg', q || 0.86).split(',')[1];
  }

  window.PKCopertina = { W: W, H: H, font: font, ritaglia: ritaglia, dati: dati, disegna: disegna, jpeg: jpeg };
})();
