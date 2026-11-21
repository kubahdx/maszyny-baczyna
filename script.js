(function () {
  'use strict';

  var I18N = window.I18N;
  var $ = function (id) { return document.getElementById(id); };
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  /* ---------- DANE OFERTY (jedno miejsce do edycji cen) ---------- */
  /* n = klucz nazwy, d = klucz krótkiego opisu (teksty są w i18n.js lub w HTML) */
  var WHEELS = {
    free:    { n: 'p.free.h',    d: 'w.free.d',   price: 1150, role: 'free',  axle: 'small-free',  svg: 'wheel-free',  img: 'kolo-wolne.jpg' },
    drive:   { n: 'w.drive.n',   d: 'w.drive.d',  price: 1000, role: 'drive', axle: null,         svg: 'wheel-drive', img: 'kolo-napedowe.jpg' },
    comp165: { n: 'p.165.h',     d: 'w.165.d',    price: 1500, role: 'drive', axle: 'small-drive', svg: 'wheel-165',   img: 'kolo-zespolone-165.jpg' },
    comp330: { n: 'p.330.h',     d: 'w.330.d',    price: 1600, role: 'drive', axle: 'small-drive', svg: 'wheel-330',   img: 'kolo-zespolone-330.jpg' },
    f60050:  { n: 'w.f60050.n',  d: 'w.f60050.d', price: 1500, role: 'free',  axle: 'ax600',       svg: 'wheel-free',  img: 'kolo-wolne.jpg' },
    d60050:  { n: 'w.d60050.n',  d: 'w.d60050.d', price: 2100, role: 'drive', axle: 'ax600',       svg: 'wheel-330',   img: 'kolo-zespolone-330.jpg' },
    f60040:  { n: 'w.f60040.n',  d: 'w.f60040.d', price: 1500, role: 'free',  axle: 'ax600',       svg: 'wheel-free',  img: 'kolo-wolne.jpg' },
    d60040:  { n: 'w.d60040.n',  d: 'w.d60040.d', price: 2100, role: 'drive', axle: 'ax600',       svg: 'wheel-330',   img: 'kolo-zespolone-330.jpg' },
    f700:    { n: 'w.f700.n',    d: 'w.f700.d',   price: 2500, role: 'free',  axle: 'ax700',       svg: 'wheel-free',  img: 'kolo-wolne-700.jpg',      setOnly: true },
    d700:    { n: 'w.d700.n',    d: 'w.d700.d',   price: 3500, role: 'drive', axle: 'ax700',       svg: 'wheel-330',   img: 'kolo-napedowe-700.jpg',   setOnly: true }
  };

  var SETS = {
    '1': { t: 'set.1.t', d: 'sets.s1', free: 'free', drive: 'drive',   price: 2100, num: true },
    '2': { t: 'set.2.t', d: 'sets.s2', free: 'free', drive: 'comp165', price: 2500, num: true },
    '3': { t: 'set.3.t', d: 'sets.s3', free: 'free', drive: 'comp330', price: 2600, num: true },
    '4': { t: 'set.4.t', d: 'sets.s4', free: 'f60050', drive: 'd60050', price: 3600, num: true },
    '5': { t: 'set.5.t', d: 'sets.s5', free: 'f60040', drive: 'd60040', price: 3600, num: true },
    '6': { t: 'set.6.t', d: 'sets.s6', free: 'f700',   drive: 'd700',   price: 6000, num: true }
  };

  /* Oś do koła wolnego zostaje 230 zł. Oś do kół napędowych zespolonych i do kół Ø600 kosztuje 480 zł. */
  var AXLES = {
    'small-free':  { price: 230, title: 'ax.free.t',  desc: 'ax.d',     sum: 'ax.sum.free',  photo: 'os-kola-wolnego.jpg' },
    'small-drive': { price: 240, title: 'ax.drive.t', desc: 'ax.d',     sum: 'ax.sum.drive', photo: 'os-kola-napedowego.jpg' },
    'ax600': {
      price: 240, desc: 'ax.600.d', photo: 'os-kola-napedowego.jpg',
      freeTitle: 'ax.600free.t', driveTitle: 'ax.600drive.t',
      freeSum: 'ax.sum.600free', driveSum: 'ax.sum.600drive'
    },
    'ax700': {
      price: 370, desc: 'ax.700.d', photo: 'os-kola-napedowego.jpg',
      freeTitle: 'ax.700free.t', driveTitle: 'ax.700drive.t',
      freeSum: 'ax.sum.700free', driveSum: 'ax.sum.700drive'
    }
  };

  /* Ceny w HTML (atrybut data-price) muszą być zgodne z tymi powyżej – skrypt tylko je formatuje. */

  /* ---------- STAN ---------- */
  var state = {
    mode: 'set',       // 'set' | 'single'
    setId: '1',
    wheel: 'free',
    axleFree: false,
    axleDrive: false
  };
  var lang = 'pl';

  /* ---------- TŁUMACZENIA ---------- */
  var basePl = {}; /* polskie teksty przeczytane z HTML przed pierwszym tłumaczeniem */

  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }

  function attrPairs(el) {
    return (el.getAttribute('data-i18n-attrs') || '').split(',').map(function (p) {
      var i = p.indexOf('=');
      return i > 0 ? { attr: p.slice(0, i).trim(), key: p.slice(i + 1).trim() } : null;
    }).filter(Boolean);
  }

  function captureBase() {
    each('[data-i18n]', function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in basePl)) basePl[k] = norm(el.textContent);
    });
    each('[data-i18n-attrs]', function (el) {
      attrPairs(el).forEach(function (p) {
        if (!(p.key in basePl)) basePl[p.key] = el.getAttribute(p.attr);
      });
    });
  }

  function t(key, l) {
    l = l || lang;
    var d = I18N.dict[l];
    if (d && d[key] != null) return d[key];
    if (key in basePl) return basePl[key];
    var pl = I18N.dict.pl[key];
    return pl != null ? pl : key;
  }

  /* Liczby: separator tysięcy zależny od języka (Intl pomija go przy 4 cyfrach w kilku językach) */
  var THOUSANDS = { pl: '\u00a0', en: ',', sk: '\u00a0', cs: '\u00a0', lt: '\u00a0', lv: '\u00a0', et: '\u00a0', ro: '.', bg: '\u00a0' };
  function money(n, l) {
    l = l || lang;
    var digits = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS[l] || '\u00a0');
    return digits + '\u00a0' + I18N.languages[l].currency;
  }
  function plain(s) { return s.replace(/\u00a0/g, ' '); }

  function applyStatic() {
    each('[data-i18n]', function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    each('[data-i18n-attrs]', function (el) {
      attrPairs(el).forEach(function (p) { el.setAttribute(p.attr, t(p.key)); });
    });
    each('[data-price]', function (el) { el.textContent = money(Number(el.getAttribute('data-price'))); });

    document.documentElement.lang = lang;
    document.title = t('meta.title');
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t('meta.desc'));
    $('lang-note').hidden = (lang === 'pl');
    updateLangUi();
  }

  /* ---------- FLAGI I MENU JĘZYKA ---------- */
  /* Flagi jako SVG, bo emoji z flagami nie wyświetlają się w Windows */
  function stripes(colors, vertical) {
    var n = colors.length;
    return colors.map(function (c, i) {
      return vertical
        ? '<rect x="' + (30 / n) * i + '" width="' + 30 / n + '" height="20" fill="' + c + '"/>'
        : '<rect y="' + (20 / n) * i + '" width="30" height="' + 20 / n + '" fill="' + c + '"/>';
    }).join('');
  }
  var FLAGS = {
    pl: stripes(['#ffffff', '#dc143c']),
    en: '<rect width="30" height="20" fill="#012169"/>' +
        '<path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/>' +
        '<path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.6"/>' +
        '<path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6.5"/>' +
        '<path d="M15 0V20M0 10H30" stroke="#c8102e" stroke-width="4"/>',
    sk: stripes(['#ffffff', '#0b4ea2', '#ee1c25']) +
        '<path d="M6 4h8v6.5c0 3-4 4.5-4 4.5s-4-1.5-4-4.5z" fill="#ee1c25" stroke="#fff" stroke-width=".8"/>' +
        '<path d="M10 6v6M8 8h4" stroke="#fff" stroke-width="1.3"/>',
    cs: stripes(['#ffffff', '#d7141a']) + '<path d="M0 0L15 10L0 20z" fill="#11457e"/>',
    lt: stripes(['#fdb913', '#006a44', '#c1272d']),
    lv: '<rect width="30" height="20" fill="#9e3039"/><rect y="8" width="30" height="4" fill="#fff"/>',
    et: stripes(['#0072ce', '#000000', '#ffffff']),
    ro: stripes(['#002b7f', '#fcd116', '#ce1126'], true),
    bg: stripes(['#ffffff', '#00966e', '#d62612'])
  };
  function flagHtml(code) {
    return '<svg viewBox="0 0 30 20" preserveAspectRatio="none" focusable="false" aria-hidden="true">' + (FLAGS[code] || '') + '</svg>';
  }

  var langBtn = $('lang-btn');
  var langMenu = $('lang-menu');

  function buildLangMenu() {
    langMenu.innerHTML = Object.keys(I18N.languages).map(function (code) {
      return '<li role="option" tabindex="-1" data-lang="' + code + '" lang="' + code + '">' +
        '<span class="flag">' + flagHtml(code) + '</span><span>' + I18N.languages[code].name + '</span></li>';
    }).join('');
  }

  function updateLangUi() {
    $('lang-flag').innerHTML = flagHtml(lang);
    $('lang-btn-name').textContent = I18N.languages[lang].name;
    $('lang-btn-code').textContent = lang.toUpperCase();
    Array.prototype.forEach.call(langMenu.children, function (li) {
      li.setAttribute('aria-selected', String(li.getAttribute('data-lang') === lang));
    });
  }

  function openLangMenu(focusSelected) {
    langMenu.hidden = false;
    langBtn.setAttribute('aria-expanded', 'true');
    if (focusSelected) {
      var cur = langMenu.querySelector('[aria-selected="true"]') || langMenu.firstElementChild;
      if (cur) cur.focus();
    }
  }
  function closeLangMenu(returnFocus) {
    langMenu.hidden = true;
    langBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) langBtn.focus();
  }
  function chooseLang(li) {
    if (!li) return;
    var code = li.getAttribute('data-lang');
    closeLangMenu(true);
    if (code !== lang) setLang(code, true);
  }

  langBtn.addEventListener('click', function () {
    if (langMenu.hidden) openLangMenu(true); else closeLangMenu(false);
  });
  langBtn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openLangMenu(true); }
  });
  langMenu.addEventListener('click', function (e) { chooseLang(e.target.closest('li')); });
  langMenu.addEventListener('keydown', function (e) {
    var items = Array.prototype.slice.call(langMenu.children);
    var i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chooseLang(document.activeElement); }
    else if (e.key === 'Escape') { e.preventDefault(); closeLangMenu(true); }
    else if (e.key === 'Tab') { closeLangMenu(false); }
  });
  document.addEventListener('click', function (e) {
    if (!langMenu.hidden && !$('lang-switch').contains(e.target)) closeLangMenu(false);
  });

  function detectLang() {
    var ok = function (c) { return c && I18N.languages.hasOwnProperty(c) ? c : null; };
    var fromUrl = null;
    try { fromUrl = ok(new URLSearchParams(location.search).get('lang')); } catch (e) {}
    if (fromUrl) return fromUrl;
    try { var saved = ok(localStorage.getItem('lang')); if (saved) return saved; } catch (e) {}
    var first = ((navigator.languages && navigator.languages[0]) || navigator.language || '').slice(0, 2).toLowerCase();
    return ok(first) || 'pl';
  }

  function setLang(l, persist) {
    lang = l;
    if (persist) { try { localStorage.setItem('lang', l); } catch (e) {} }
    applyStatic();
    refresh(true);
    updateMoreLabels();
  }

  /* ---------- ELEMENTY ---------- */
  var choiceList = $('choice-list');
  var choiceLegend = $('choice-legend');
  var axleList = $('axle-list');
  var preview = $('preview');
  var summaryLines = $('summary-lines');
  var summaryTotal = $('summary-total');
  var waLink = $('whatsapp-link');
  var mailLink = $('inquiry-email');
  var copyBtn = $('copy-btn');
  var copyStatus = $('copy-status');

  /* ---------- POMOCNICZE DO RENDERU ---------- */
  function choiceHtml(opts) {
    return '<label class="choice">' +
      '<input type="' + opts.type + '" name="' + opts.name + '" value="' + opts.value + '"' +
      (opts.checked ? ' checked' : '') + (opts.disabled ? ' disabled' : '') + '>' +
      '<span class="choice-box">' +
        '<span class="choice-mark' + (opts.type === 'checkbox' ? ' square' : '') + '" aria-hidden="true"></span>' +
        '<span><span class="choice-title">' + opts.title + '</span>' +
        '<span class="choice-desc">' + opts.desc + '</span></span>' +
        '<span class="choice-price">' + opts.price + '</span>' +
      '</span></label>';
  }

  /* ---------- KTÓRE OSIE SĄ DOSTĘPNE ---------- */
  function sides() {
    if (state.mode === 'set') {
      var set = SETS[state.setId];
      return { free: WHEELS[set.free], drive: WHEELS[set.drive] };
    }
    var w = WHEELS[state.wheel];
    return w.role === 'free' ? { free: w, drive: null } : { free: null, drive: w };
  }

  function axleSpec(wheel, side) {
    if (!wheel || !wheel.axle) return null;
    var a = AXLES[wheel.axle];
    return {
      price: a.price,
      title: a.freeTitle ? (side === 'free' ? a.freeTitle : a.driveTitle) : a.title,
      desc: a.desc,
      sum: a.freeSum ? (side === 'free' ? a.freeSum : a.driveSum) : a.sum,
      photo: a.photo
    };
  }

  /* ---------- RENDER WYBORU ---------- */
  function renderChoices() {
    var html = '';
    if (state.mode === 'set') {
      choiceLegend.textContent = t('calc.l2.set');
      Object.keys(SETS).forEach(function (id) {
        var s = SETS[id];
        html += choiceHtml({
          type: 'radio', name: 'choice', value: id, checked: state.setId === id,
          title: t(s.t),
          desc: t(s.d),
          price: money(s.price)
        });
      });
    } else {
      choiceLegend.textContent = t('calc.l2.single');
      Object.keys(WHEELS).forEach(function (id) {
        var w = WHEELS[id];
        if (w.setOnly) return;
        html += choiceHtml({
          type: 'radio', name: 'choice', value: id, checked: state.wheel === id,
          title: t(w.n), desc: t(w.d), price: money(w.price)
        });
      });
    }
    choiceList.innerHTML = html;
  }

  function renderAxles() {
    var pair = sides();
    var freeAx = axleSpec(pair.free, 'free');
    var driveAx = axleSpec(pair.drive, 'drive');
    if (!freeAx) state.axleFree = false;
    if (!driveAx) state.axleDrive = false;

    var html = '';
    if (freeAx) {
      html += choiceHtml({
        type: 'checkbox', name: 'axleFree', value: '1', checked: state.axleFree,
        title: t(freeAx.title), desc: t(freeAx.desc), price: '+' + money(freeAx.price)
      });
    }
    if (driveAx) {
      html += choiceHtml({
        type: 'checkbox', name: 'axleDrive', value: '1', checked: state.axleDrive,
        title: t(driveAx.title), desc: t(driveAx.desc), price: '+' + money(driveAx.price)
      });
    }

    if (state.mode === 'single' && state.wheel === 'drive') html += '<p class="choice-note">' + t('note.drive') + '</p>';

    axleList.innerHTML = html;
  }

  /* ---------- OBLICZENIA I PODSUMOWANIE ---------- */
  /* l = język, w którym mają być podpisy pozycji */
  function compute(l) {
    var lines = [];
    var total = 0;

    var pair = sides();
    if (state.mode === 'set') {
      var s = SETS[state.setId];
      var setLabel = s.num ? t('set.n', l).replace('{n}', state.setId) : t(s.t, l);
      lines.push({ label: setLabel, price: s.price });
      lines.push({ label: t(WHEELS[s.free].n, l), price: null, sub: true });
      lines.push({ label: t(WHEELS[s.drive].n, l), price: null, sub: true });
      total += s.price;
    } else {
      var w = WHEELS[state.wheel];
      lines.push({ label: t(w.n, l), price: w.price });
      total += w.price;
    }

    var freeAx = axleSpec(pair.free, 'free');
    var driveAx = axleSpec(pair.drive, 'drive');
    if (state.axleFree && freeAx) {
      lines.push({ label: t(freeAx.sum, l), price: freeAx.price });
      total += freeAx.price;
    }
    if (state.axleDrive && driveAx) {
      lines.push({ label: t(driveAx.sum, l), price: driveAx.price });
      total += driveAx.price;
    }
    return { lines: lines, total: total };
  }

  /* ---------- PODGLĄD WYBRANYCH PRODUKTÓW (zdjęcia; brak pliku = rysunek zastępczy) ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  function pvItem(photo, svgs, cap, cls) {
    return '<figure class="pv ' + cls + '"><div class="media pv-media">' +
      '<span class="pv-svgs">' + svgs.map(function (id) {
        return '<svg aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>';
      }).join('') + '</span>' +
      '<img class="photo" src="zdjecia/' + photo + '" alt="' + esc(cap) + '"' +
      ' onerror="this.closest(\'.media\').classList.add(\'no-photo\');this.remove()">' +
      '</div><figcaption>' + esc(cap) + '</figcaption></figure>';
  }

  function renderPreview() {
    if (!preview) return;
    var html;
    if (state.mode === 'set') {
      var s = SETS[state.setId];
      var cap = s.num ? t('set.n').replace('{n}', state.setId) : t(s.t);
      html = pvItem('zestaw-' + (Number(state.setId) > 3 ? '3' : state.setId) + '.jpg', [WHEELS[s.free].svg, WHEELS[s.drive].svg],
        cap, 'pv-main pv-set');
    } else {
      var w = WHEELS[state.wheel];
      html = pvItem(w.img, [w.svg], t(w.n), 'pv-main pv-single');
    }
    var shown = sides();
    var freeAx = axleSpec(shown.free, 'free');
    var driveAx = axleSpec(shown.drive, 'drive');
    var axles = '';
    if (state.axleFree && freeAx) axles += pvItem(freeAx.photo, ['axle'], t(freeAx.sum), 'pv-axle');
    if (state.axleDrive && driveAx) axles += pvItem(driveAx.photo, ['axle'], t(driveAx.sum), 'pv-axle');
    if (axles) html += '<div class="pv-axles">' + axles + '</div>';
    preview.innerHTML = html;
  }

  function renderSummary() {
    renderPreview();
    var c = compute(lang);
    summaryLines.innerHTML = c.lines.map(function (l) {
      return '<li class="' + (l.sub ? 'line-sub' : '') + '"><span>' + l.label + '</span><span>' +
        (l.price !== null ? money(l.price) : '') + '</span></li>';
    }).join('');

    summaryTotal.textContent = money(c.total);

    /* Wiadomość do właściciela zawsze po polsku, żeby mógł ją od razu przeczytać */
    var pl = compute('pl');
    waLink.href = 'https://wa.me/' + waNumber() + '?text=' + encodeURIComponent(plainText(pl));
    mailLink.href = buildMailto(pl);
    copyStatus.textContent = '';
  }

  /* ---------- TEKST ZAPYTANIA (po polsku) ---------- */
  function plainText(c) {
    var out = ['Dzień dobry,', '', 'proszę o informację o dostępności i terminie realizacji:', ''];
    c.lines.forEach(function (l) {
      if (l.sub) out.push('   - ' + l.label);
      else out.push('* ' + l.label + (l.price !== null ? ' – ' + plain(money(l.price, 'pl')) : ''));
    });
    out.push('', 'Razem według cennika na stronie: ' + plain(money(c.total, 'pl')));
    if (lang !== 'pl') out.push('Język klienta (wg strony): ' + I18N.languages[lang].name);
    out.push('', 'Pozdrawiam');
    return out.join('\n');
  }

  /* Numer WhatsApp = numer telefonu z sekcji Kontakt (same cyfry, z kodem kraju) */
  function waNumber() {
    var tel = $('contact-phone');
    return tel ? (tel.getAttribute('href') || '').replace(/\D/g, '') : '';
  }

  function buildMailto(c) {
    var emailEl = $('contact-email');
    var to = emailEl ? emailEl.textContent.trim() : '';
    return 'mailto:' + encodeURIComponent(to).replace('%40', '@') +
      '?subject=' + encodeURIComponent('Zapytanie o koła do traka taśmowego') +
      '&body=' + encodeURIComponent(plainText(c));
  }

  /* ---------- ZDARZENIA ---------- */
  function refresh(full) {
    if (full) renderChoices();
    renderAxles();
    renderSummary();
  }

  $('config-form').addEventListener('change', function (e) {
    var el = e.target;
    if (el.name === 'mode') {
      state.mode = el.value;
      refresh(true);
    } else if (el.name === 'choice') {
      if (state.mode === 'set') state.setId = el.value;
      else state.wheel = el.value;
      refresh(false);
    } else if (el.name === 'axleFree') {
      state.axleFree = el.checked;
      renderSummary();
    } else if (el.name === 'axleDrive') {
      state.axleDrive = el.checked;
      renderSummary();
    }
  });

  copyBtn.addEventListener('click', function () {
    var text = plainText(compute('pl'));
    function done(ok) { copyStatus.textContent = ok ? t('calc.copied') : t('calc.copyfail'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      done(false);
    }
  });


  /* Dane kontaktowe wszędzie pobieramy z sekcji Kontakt (jedno miejsce do edycji) */
  var phoneSrc = $('contact-phone');
  if (phoneSrc) {
    var phoneText = phoneSrc.textContent.trim();
    var phoneHref = phoneSrc.getAttribute('href');
    var wa = 'https://wa.me/' + waNumber();
    each('[data-phone]', function (el) { el.textContent = phoneText; el.setAttribute('href', phoneHref); });
    each('[data-tel]', function (el) { el.setAttribute('href', phoneHref); });
    each('[data-phone-num]', function (el) { el.textContent = phoneText; });
    each('[data-wa]', function (el) { el.setAttribute('href', wa); });
  }
  var emailSrc = $('contact-email');
  if (emailSrc) {
    each('[data-email]', function (el) { el.setAttribute('href', emailSrc.getAttribute('href')); });
  }

  /* Powiększanie zdjęć po kliknięciu */
  var lightbox = $('lightbox');
  var lightboxImg = $('lightbox-img');
  if (lightbox && typeof lightbox.showModal === 'function') {
    document.addEventListener('click', function (e) {
      var img = e.target.closest ? e.target.closest('img.photo') : null;
      if (!img) return;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightbox.showModal();
    });
    $('lightbox-close').addEventListener('click', function () { lightbox.close(); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target === lightboxImg) lightbox.close();
    });
  }

  /* Menu mobilne */
  var toggle = document.querySelector('.nav-toggle');
  var nav = $('site-nav');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* Długie sekcje: zwinięte do ok. 30% wysokości z gradientem i przyciskiem */
  var COLLAPSE_RATIO = 0.3;
  var COLLAPSE_MIN_FULL = 900;
  var collapsibles = [];

  function initCollapsible(sectionId) {
    var sec = $(sectionId);
    var cont = sec && sec.querySelector('.container');
    if (!cont) return;
    var wrap = document.createElement('div');
    wrap.className = 'collapsible';
    wrap.id = sectionId + '-body';
    var inner = document.createElement('div');
    while (cont.firstChild) inner.appendChild(cont.firstChild);
    wrap.appendChild(inner);
    var more = document.createElement('div');
    more.className = 'collapsible-more';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-ghost';
    btn.setAttribute('aria-controls', wrap.id);
    more.appendChild(btn);
    cont.appendChild(wrap);
    cont.appendChild(more);
    var c = { sec: sec, wrap: wrap, inner: inner, more: more, btn: btn, open: false, timer: null };
    collapsibles.push(c);
    btn.addEventListener('click', function () { setOpen(c, !c.open, true); });
    if (window.ResizeObserver) new ResizeObserver(function () { layoutCollapsible(c); }).observe(inner);
    layoutCollapsible(c);
  }

  function layoutCollapsible(c) {
    if (c.open) return;
    var full = c.inner.offsetHeight;
    if (full < COLLAPSE_MIN_FULL) {
      c.more.hidden = true;
      c.wrap.classList.remove('is-collapsed');
      c.wrap.style.maxHeight = '';
      return;
    }
    c.more.hidden = false;
    c.wrap.classList.add('is-collapsed');
    c.wrap.style.maxHeight = Math.round(full * COLLAPSE_RATIO) + 'px';
    updateMoreLabels();
  }

  function setOpen(c, open, userAction) {
    if (c.open === open) return;
    clearTimeout(c.timer);
    c.open = open;
    var w = c.wrap;
    if (open && !userAction) {
      w.classList.remove('is-collapsed');
      w.style.maxHeight = 'none';
    } else if (open) {
      w.classList.add('is-animating');
      w.style.maxHeight = c.inner.offsetHeight + 'px';
      w.classList.remove('is-collapsed');
      c.timer = setTimeout(function () {
        w.classList.remove('is-animating');
        w.style.maxHeight = 'none';
      }, 450);
    } else {
      w.style.maxHeight = c.inner.offsetHeight + 'px';
      void w.offsetHeight;
      layoutCollapsible(c);
      if (userAction && c.sec.getBoundingClientRect().top < 0) c.sec.scrollIntoView({ block: 'start' });
    }
    updateMoreLabels();
  }

  function updateMoreLabels() {
    collapsibles.forEach(function (c) {
      c.btn.textContent = t(c.open ? 'more.hide' : 'more.show');
      c.btn.setAttribute('aria-expanded', String(c.open));
    });
  }

  function collapsedAncestor(el) {
    var w = el && el.closest && el.closest('.collapsible');
    for (var i = 0; w && i < collapsibles.length; i++) {
      if (collapsibles[i].wrap === w && !collapsibles[i].open && !collapsibles[i].more.hidden) return collapsibles[i];
    }
    return null;
  }

  /* Odnośniki wewnętrzne i fokus klawiatury rozwijają sekcję, jeśli cel jest w ukrytej części */
  function revealTarget(el) {
    var c = collapsedAncestor(el);
    if (c) setOpen(c, true, false);
    return !!c;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a || a.getAttribute('href').length < 2) return;
    var target = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (target && revealTarget(target)) {
      e.preventDefault();
      history.replaceState(null, '', a.getAttribute('href'));
      setTimeout(function () { target.scrollIntoView({ block: 'start' }); }, 60);
    }
  });
  document.addEventListener('focusin', function (e) { revealTarget(e.target); });

  initCollapsible('komplety');
  initCollapsible('oferta');

  /* Start: zapamiętaj polskie teksty z HTML, wybierz język, narysuj kalkulator */
  captureBase();
  buildLangMenu();
  setLang(detectLang(), false);
  if (location.hash.length > 1) {
    var initial = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (initial && revealTarget(initial)) setTimeout(function () { initial.scrollIntoView({ block: 'start' }); }, 500);
  }
})();
