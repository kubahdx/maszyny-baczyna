(function () {
  'use strict';

  var I18N = window.I18N;
  var $ = function (id) { return document.getElementById(id); };
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  /* ---------- DANE OFERTY (jedno miejsce do edycji cen) ---------- */
  /* n = klucz nazwy, d = klucz krótkiego opisu (teksty są w i18n.js lub w HTML) */
  var WHEELS = {
    free:    { n: 'p.free.h',    d: 'w.free.d',  price: 1150, axle: 230,  svg: 'wheel-free',  img: 'kolo-wolne.jpg' },
    drive:   { n: 'w.drive.n',   d: 'w.drive.d', price: 1000, axle: null, svg: 'wheel-drive', img: 'kolo-napedowe.jpg' },
    comp165: { n: 'p.165.h',     d: 'w.165.d',   price: 1500, axle: 240,  svg: 'wheel-165',   img: 'kolo-zespolone-165.jpg' },
    comp330: { n: 'p.330.h',     d: 'w.330.d',   price: 1600, axle: 240,  svg: 'wheel-330',   img: 'kolo-zespolone-330.jpg' }
  };

  var SETS = {
    '1': { t: 'set.1.t', free: 'free', drive: 'drive',   price: 2100 },
    '2': { t: 'set.2.t', free: 'free', drive: 'comp165', price: 2500 },
    '3': { t: 'set.3.t', free: 'free', drive: 'comp330', price: 2600 }
  };

  var AXLE_FREE_PRICE = 230;
  var AXLE_DRIVE_PRICE = 240;

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
  function availableAxles() {
    if (state.mode === 'set') {
      var set = SETS[state.setId];
      return {
        free: true,
        drive: WHEELS[set.drive].axle !== null
      };
    }
    var w = WHEELS[state.wheel];
    return {
      free: state.wheel === 'free',
      drive: state.wheel !== 'free' && w.axle !== null
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
          desc: t(WHEELS[s.drive].d),
          price: money(s.price)
        });
      });
    } else {
      choiceLegend.textContent = t('calc.l2.single');
      Object.keys(WHEELS).forEach(function (id) {
        var w = WHEELS[id];
        html += choiceHtml({
          type: 'radio', name: 'choice', value: id, checked: state.wheel === id,
          title: t(w.n), desc: t(w.d), price: money(w.price)
        });
      });
    }
    choiceList.innerHTML = html;
  }

  function renderAxles() {
    var av = availableAxles();
    if (!av.free) state.axleFree = false;
    if (!av.drive) state.axleDrive = false;

    var html = '';
    if (av.free) {
      html += choiceHtml({
        type: 'checkbox', name: 'axleFree', value: '1', checked: state.axleFree,
        title: t('ax.free.t'), desc: t('ax.d'), price: '+' + money(AXLE_FREE_PRICE)
      });
    }
    if (av.drive) {
      html += choiceHtml({
        type: 'checkbox', name: 'axleDrive', value: '1', checked: state.axleDrive,
        title: t('ax.drive.t'), desc: t('ax.d'), price: '+' + money(AXLE_DRIVE_PRICE)
      });
    }

    if (state.mode === 'set' && !av.drive) html += '<p class="choice-note">' + t('note.set1') + '</p>';
    if (state.mode === 'single' && state.wheel === 'drive') html += '<p class="choice-note">' + t('note.drive') + '</p>';

    axleList.innerHTML = html;
  }

  /* ---------- OBLICZENIA I PODSUMOWANIE ---------- */
  /* l = język, w którym mają być podpisy pozycji */
  function compute(l) {
    var lines = [];
    var total = 0;

    if (state.mode === 'set') {
      var s = SETS[state.setId];
      lines.push({ label: t('set.n', l).replace('{n}', state.setId), price: s.price });
      lines.push({ label: t(WHEELS[s.free].n, l), price: null, sub: true });
      lines.push({ label: t(WHEELS[s.drive].n, l), price: null, sub: true });
      total += s.price;
    } else {
      var w = WHEELS[state.wheel];
      lines.push({ label: t(w.n, l), price: w.price });
      total += w.price;
    }

    if (state.axleFree) {
      lines.push({ label: t('ax.sum.free', l), price: AXLE_FREE_PRICE });
      total += AXLE_FREE_PRICE;
    }
    if (state.axleDrive) {
      lines.push({ label: t('ax.sum.drive', l), price: AXLE_DRIVE_PRICE });
      total += AXLE_DRIVE_PRICE;
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
      html = pvItem('zestaw-' + state.setId + '.jpg', [WHEELS[s.free].svg, WHEELS[s.drive].svg],
        t('set.n').replace('{n}', state.setId), 'pv-main pv-set');
    } else {
      var w = WHEELS[state.wheel];
      html = pvItem(w.img, [w.svg], t(w.n), 'pv-main pv-single');
    }
    var axles = '';
    if (state.axleFree) axles += pvItem('os-kola-wolnego.jpg', ['axle'], t('ax.sum.free'), 'pv-axle');
    if (state.axleDrive) axles += pvItem('os-kola-napedowego.jpg', ['axle'], t('ax.sum.drive'), 'pv-axle');
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

  /* Start: zapamiętaj polskie teksty z HTML, wybierz język, narysuj kalkulator */
  captureBase();
  buildLangMenu();
  setLang(detectLang(), false);
})();
