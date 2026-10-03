/* =====================================================================
   THE CLUB BARBEARIA — script.js  (JavaScript vanilla, sem dependências)
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ================================================================
     CONFIGURAÇÃO DO AGENDAMENTO
     Protótipo: a disponibilidade é simulada no navegador. Para ir ao ar,
     troque getBusy() por uma chamada à agenda real (ex.: API do CashBarber)
     e ajuste horários, durações e equipe abaixo.
     ================================================================ */
  var WHATSAPP = '5541998618127';

  // Horário de exemplo (minutos desde 00:00). 0 = domingo.
  var HOURS = { 0: null, 1: [540, 1200], 2: [540, 1200], 3: [540, 1200], 4: [540, 1200], 5: [540, 1200], 6: [540, 1080] };
  var STEP_MIN = 30;
  var DAYS_AHEAD = 21;

  var CATS = [
    { id: 'combo', label: 'Combo' },
    { id: 'cabelo', label: 'Cabelo' },
    { id: 'barba', label: 'Barba' },
    { id: 'detalhes', label: 'Detalhes' },
    { id: 'bem-estar', label: 'Bem-estar' }
  ];

  // Durações estimadas (minutos) — ajuste com a barbearia.
  var SERVICES = [
    { id: 'combo', name: 'Combo cabelo + barba', cat: 'combo', dur: 60 },
    { id: 'corte', name: 'Corte', cat: 'cabelo', dur: 30 },
    { id: 'corte-maquina', name: 'Corte máquina', cat: 'cabelo', dur: 30 },
    { id: 'hidratacao-capilar', name: 'Hidratação capilar', cat: 'cabelo', dur: 30 },
    { id: 'camuflagem-cabelo', name: 'Camuflagem', cat: 'cabelo', dur: 30 },
    { id: 'selagem', name: 'Selagem', cat: 'cabelo', dur: 60 },
    { id: 'progressiva', name: 'Progressiva', cat: 'cabelo', dur: 90 },
    { id: 'peeling-capilar', name: 'Peeling capilar', cat: 'cabelo', dur: 30 },
    { id: 'terapia-fios', name: 'Terapia dos fios', cat: 'cabelo', dur: 30 },
    { id: 'barba', name: 'Barba', cat: 'barba', dur: 30 },
    { id: 'barboterapia', name: 'Barboterapia', cat: 'barba', dur: 60 },
    { id: 'hidratacao-barba', name: 'Hidratação de barba', cat: 'barba', dur: 30 },
    { id: 'camuflagem-barba', name: 'Camuflagem da barba', cat: 'barba', dur: 30 },
    { id: 'peeling-barba', name: 'Peeling para barba', cat: 'barba', dur: 30 },
    { id: 'sobrancelha', name: 'Sobrancelha', cat: 'detalhes', dur: 30 },
    { id: 'depil-nariz', name: 'Depilação de nariz', cat: 'detalhes', dur: 30 },
    { id: 'depil-ouvido', name: 'Depilação de ouvido', cat: 'detalhes', dur: 30 },
    { id: 'terapia-facial', name: 'Terapia facial', cat: 'bem-estar', dur: 60 },
    { id: 'cone-hindu', name: 'Cone hindu', cat: 'bem-estar', dur: 30 },
    { id: 'massagem', name: 'Massagem · 1 hora', cat: 'bem-estar', dur: 60 }
  ];

  // Equipe (substitua os nomes pelos profissionais reais).
  var PROS = [
    { id: 'p1', name: 'Barbeiro 1', role: 'Barbeiro', cats: ['combo', 'cabelo', 'barba', 'detalhes'] },
    { id: 'p2', name: 'Barbeiro 2', role: 'Barbeiro', cats: ['combo', 'cabelo', 'barba', 'detalhes'] },
    { id: 'p3', name: 'Barbeiro 3', role: 'Barbeiro', cats: ['combo', 'cabelo', 'barba', 'detalhes'] },
    { id: 'p4', name: 'Terapeuta', role: 'Terapeuta', cats: ['bem-estar', 'detalhes'] }
  ];
  var ANY = { id: 'any', name: 'Sem preferência', role: 'Primeiro horário livre' };

  /* ---------------- Tema ---------------- */
  var themeBtn = $('#themeToggle');
  var themeMeta = $('meta[name="theme-color"]');
  function applyTheme(t) {
    root.setAttribute('data-site-theme', t);
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro');
    if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#070909' : '#F1F0EB');
  }
  applyTheme(root.getAttribute('data-site-theme') === 'light' ? 'light' : 'dark');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-site-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next); store.set('theclub-theme', next);
  });

  /* ---------------- Header / CTA mobile ---------------- */
  var header = $('.site-header');
  var hero = $('.hero');
  var mobileCta = $('#mobileCta');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 24);
    if (mobileCta && hero) mobileCta.classList.toggle('is-visible', y > hero.offsetHeight * 0.7);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------------- Menu mobile ---------------- */
  var menuBtn = $('#menuToggle');
  var menu = $('#mobileMenu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  $$('a, button', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1180 && root.classList.contains('menu-open')) setMenu(false); });

  /* ---------------- Link ativo ---------------- */
  var navLinks = $$('.main-nav a');
  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) navObs.observe(s); });
  }

  /* ---------------- Reveal ---------------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var counts = new Map();
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('is-pending'); revObs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    var vh = window.innerHeight;
    $$('.reveal').forEach(function (el) {
      var n = counts.get(el.parentElement) || 0;
      el.style.setProperty('--rd', Math.min(n, 5) * 70 + 'ms');
      counts.set(el.parentElement, n + 1);
      if (el.getBoundingClientRect().top > vh * 0.9) { el.classList.add('is-pending'); revObs.observe(el); }
    });
  }

  /* ---------------- Vídeos ---------------- */
  var heroVideo = $('#heroVideo');
  var heroToggle = $('#heroVideoToggle');
  if (heroVideo && heroToggle) {
    if (reduceMotion) { heroVideo.pause(); heroToggle.classList.add('is-paused'); }
    heroToggle.addEventListener('click', function () {
      if (heroVideo.paused) { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); heroToggle.classList.remove('is-paused'); heroToggle.setAttribute('aria-label', 'Pausar vídeo de fundo'); }
      else { heroVideo.pause(); heroToggle.classList.add('is-paused'); heroToggle.setAttribute('aria-label', 'Reproduzir vídeo de fundo'); }
    });
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var vObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!e.target.paused) e.target.pause();
      });
    }, { threshold: 0.25 });
    $$('video[data-autoplay]').forEach(function (v) { vObs.observe(v); });
  }

  /* ---------------- Abas de serviços ---------------- */
  var tabs = $$('.svc-tabs [role="tab"]');
  var figImgs = $$('.svc-figure img');
  function selectTab(i, focus) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    var cat = tabs[i].id.replace('tab-', '');
    figImgs.forEach(function (img) { img.classList.toggle('is-active', img.getAttribute('data-cat') === cat); });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); selectTab((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab((i - 1 + tabs.length) % tabs.length, true); }
    });
  });

  /* ---------------- Planos ---------------- */
  var seg = $('.segmented');
  if (seg) {
    var segBtns = $$('button', seg);
    var thumb = $('.segmented-thumb', seg);
    var swaps = $$('#assinatura [data-combo]');
    var pick = function (i, focus) {
      var key = segBtns[i].getAttribute('data-plan');
      segBtns.forEach(function (b, j) { b.setAttribute('aria-checked', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
      if (focus) segBtns[i].focus();
      thumb.style.transform = 'translateX(' + i * 100 + '%)';
      swaps.forEach(function (el) {
        var next = el.getAttribute('data-' + key);
        if (!next || el.textContent === next) return;
        el.classList.add('is-swapping');
        setTimeout(function () { el.textContent = next; el.classList.remove('is-swapping'); }, reduceMotion ? 0 : 170);
      });
    };
    segBtns.forEach(function (b, i) {
      b.tabIndex = i === 0 ? 0 : -1;
      b.addEventListener('click', function () { pick(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); pick((i + 1) % 3, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); pick((i + 2) % 3, true); }
      });
    });
  }

  /* ---------------- Carrossel ---------------- */
  var car = $('#reviewsCarousel');
  if (car) {
    var track = $('.carousel-track', car);
    var slides = $$('.review', car);
    var countEl = $('.carousel-count b', car);
    var idx = 0, timer = null;
    var go = function (i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      slides.forEach(function (s, j) { s.setAttribute('aria-hidden', String(j !== idx)); });
      countEl.textContent = String(idx + 1).padStart(2, '0');
    };
    var start = function () { if (!reduceMotion && !timer) timer = setInterval(function () { go(idx + 1); }, 6500); };
    var stop = function () { clearInterval(timer); timer = null; };
    $$('[data-dir]', car).forEach(function (b) { b.addEventListener('click', function () { go(idx + Number(b.getAttribute('data-dir'))); stop(); start(); }); });
    car.addEventListener('mouseenter', stop); car.addEventListener('mouseleave', start);
    car.addEventListener('focusin', stop); car.addEventListener('focusout', start);
    var sx = null, vp = $('.carousel-viewport', car);
    vp.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    vp.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); stop(); start(); } sx = null; });
    go(0); start();
  }

  /* ---------------- Lightbox ---------------- */
  var gItems = $$('.g-item');
  var lb = $('#lightbox');
  if (gItems.length && lb) {
    var lbImg = $('#lbImg'), lbCap = $('#lbCap'), cur = 0, lastF = null;
    var render = function () {
      var it = gItems[cur];
      lbImg.src = it.getAttribute('data-full');
      lbImg.alt = $('img', it).alt;
      lbCap.textContent = $('.g-cap', it).textContent + '  ·  ' + (cur + 1) + ' / ' + gItems.length;
      lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    };
    var openLb = function (i) { cur = i; lastF = document.activeElement; render(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
    var closeLb = function () { lb.hidden = true; document.body.style.overflow = ''; if (lastF) lastF.focus(); };
    var step = function (d) { cur = (cur + d + gItems.length) % gItems.length; render(); };
    gItems.forEach(function (it, i) { it.addEventListener('click', function () { openLb(i); }); });
    $('.lb-close', lb).addEventListener('click', closeLb);
    $('.lb-prev', lb).addEventListener('click', function () { step(-1); });
    $('.lb-next', lb).addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Tab') trap(e, lb);
    });
  }

  function trap(e, container) {
    var f = $$('button:not([disabled]), a[href], input, textarea, [tabindex="0"]', container).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* =================================================================
     AGENDAMENTO
     ================================================================= */
  var bk = $('#booking');
  if (!bk) return;

  var el = {
    services: $('#bkServices'), pros: $('#bkPros'), dates: $('#bkDates'), slots: $('#bkSlots'),
    back: $('#bkBack'), next: $('#bkNext'), actions: $('#bkActions'), actionsSum: $('#bkActionsSum'),
    scroll: $('#bkScroll'), progress: $('#bkProgress'),
    sumServices: $('#sumServices'), sumPro: $('#sumPro'), sumWhen: $('#sumWhen'), sumClient: $('#sumClient'), sumDuration: $('#sumDuration'),
    name: $('#bkName'), phone: $('#bkPhone'), note: $('#bkNote'), first: $('#bkFirst')
  };
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var STACHE = '<svg class="stache" aria-hidden="true"><use href="#stache"/></svg>';

  var state;
  function reset() {
    var lf = state && state.lastFocus;
    state = { step: 1, services: [], pro: null, date: null, time: null, assigned: null, lastFocus: lf || null, fromProfile: false };
  }
  reset();

  var byId = function (list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var fmtMin = function (m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  var fmtDur = function (m) { var h = Math.floor(m / 60), r = m % 60; return h ? h + 'h' + (r ? pad(r) : '') : r + ' min'; };
  var dateKey = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var WD_LONG = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var MO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var fmtDateLong = function (d) { return WD_LONG[d.getDay()] + ', ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1); };

  function totalDur() { return state.services.reduce(function (s, id) { return s + byId(SERVICES, id).dur; }, 0); }
  function capablePros() {
    var cats = state.services.map(function (id) { return byId(SERVICES, id).cat; });
    return PROS.filter(function (p) { return cats.every(function (c) { return p.cats.indexOf(c) > -1; }); });
  }

  // Ocupação simulada, estável por profissional/dia/horário.
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }
  function savedBookings() { try { return JSON.parse(store.get('theclub-bookings') || '[]'); } catch (e) { return []; } }
  function getBusy(proId, dKey, min) {
    var saved = savedBookings().some(function (b) { return b.status !== 'cancelado' && b.pro === proId && b.date === dKey && min >= b.start && min < b.start + b.dur; });
    if (saved) return true;
    var load = 0.34 + (min >= 1020 ? 0.16 : 0) + (min >= 690 && min < 810 ? 0.08 : 0); // fim de tarde mais cheio
    return hash(proId + '|' + dKey + '|' + min) < load;
  }
  function proFree(proId, d, start, dur) {
    var hrs = HOURS[d.getDay()];
    if (!hrs || start < hrs[0] || start + dur > hrs[1]) return false;
    var now = new Date();
    if (dateKey(d) === dateKey(now) && start < now.getHours() * 60 + now.getMinutes() + 30) return false;
    var k = dateKey(d);
    for (var m = start; m < start + dur; m += STEP_MIN) if (getBusy(proId, k, m)) return false;
    return true;
  }
  function whoIsFree(d, start) {
    var dur = totalDur();
    var list = state.pro === 'any' ? capablePros() : [byId(PROS, state.pro)];
    // "sem preferência": ordem varia por horário para distribuir a agenda
    if (state.pro === 'any') list = list.slice().sort(function (a, b) { return hash(a.id + start) - hash(b.id + start); });
    for (var i = 0; i < list.length; i++) if (proFree(list[i].id, d, start, dur)) return list[i];
    return null;
  }
  function slotsFor(d) {
    var hrs = HOURS[d.getDay()];
    if (!hrs) return [];
    var out = [];
    for (var m = hrs[0]; m < hrs[1]; m += STEP_MIN) {
      if (m + totalDur() > hrs[1]) break;
      out.push({ min: m, pro: whoIsFree(d, m) });
    }
    return out;
  }
  function days() {
    var out = [], base = new Date(); base.setHours(0, 0, 0, 0);
    for (var i = 0; i < DAYS_AHEAD; i++) { var d = new Date(base); d.setDate(base.getDate() + i); out.push(d); }
    return out;
  }

  /* ----- Render: serviços ----- */
  function renderServices() {
    var html = '';
    CATS.forEach(function (c) {
      var items = SERVICES.filter(function (s) { return s.cat === c.id; });
      html += '<div class="bk-group"><h3>' + c.label + '</h3><div class="bk-opts">';
      items.forEach(function (s) {
        var on = state.services.indexOf(s.id) > -1;
        html += '<button type="button" class="opt' + (c.id === 'combo' ? ' opt-feature' : '') + '" data-svc="' + s.id + '" aria-pressed="' + on + '">' +
          '<span class="opt-name">' + esc(s.name) + '</span><span class="opt-meta">' + fmtDur(s.dur) + '</span>' +
          '<span class="opt-check">' + CHECK + '</span></button>';
      });
      html += '</div></div>';
    });
    el.services.innerHTML = html;
  }
  el.services.addEventListener('click', function (e) {
    var b = e.target.closest('[data-svc]'); if (!b) return;
    var id = b.getAttribute('data-svc');
    var i = state.services.indexOf(id);
    if (i > -1) state.services.splice(i, 1); else state.services.push(id);
    // combo já inclui corte e barba
    if (id === 'combo' && i === -1) state.services = state.services.filter(function (s) { return s !== 'corte' && s !== 'barba'; });
    if ((id === 'corte' || id === 'barba') && i === -1) state.services = state.services.filter(function (s) { return s !== 'combo'; });
    state.date = null; state.time = null;
    renderServices(); update();
  });

  /* ----- Render: profissionais ----- */
  function renderPros() {
    var cap = capablePros();
    if (!cap.length) {
      el.pros.innerHTML = '<p class="slots-empty">Nenhum profissional faz todos esses serviços na mesma sessão. Volte e separe em dois agendamentos (por exemplo, barbearia e bem-estar).</p>';
      return;
    }
    if (state.pro && state.pro !== 'any' && !cap.some(function (p) { return p.id === state.pro; })) state.pro = null;
    var list = [ANY].concat(cap);
    el.pros.innerHTML = list.map(function (p) {
      var on = state.pro === p.id;
      return '<button type="button" class="opt pro" role="radio" data-pro="' + p.id + '" aria-checked="' + on + '">' +
        '<span class="pro-avatar">' + (p.id === 'any' ? STACHE : '?') + '</span>' +
        '<span><span class="opt-name">' + esc(p.name) + '</span><br><span class="opt-meta">' + esc(p.role) + '</span></span>' +
        '<span class="opt-check">' + CHECK + '</span></button>';
    }).join('');
    el.pros.setAttribute('role', 'radiogroup');
    el.pros.setAttribute('aria-label', 'Profissionais');
  }
  el.pros.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pro]'); if (!b) return;
    state.pro = b.getAttribute('data-pro'); state.date = null; state.time = null;
    renderPros(); update();
  });

  /* ----- Render: datas e horários ----- */
  function renderDates() {
    var list = days();
    if (!state.date) {
      for (var i = 0; i < list.length; i++) if (slotsFor(list[i]).some(function (s) { return s.pro; })) { state.date = dateKey(list[i]); break; }
    }
    el.dates.innerHTML = list.map(function (d) {
      var k = dateKey(d);
      var open = !!HOURS[d.getDay()];
      var free = open ? slotsFor(d).filter(function (s) { return s.pro; }).length : 0;
      var label = !open ? 'Fechado' : free ? free + ' livres' : 'Lotado';
      var sel = state.date === k;
      var today = k === dateKey(new Date());
      return '<button type="button" class="date" role="option" data-date="' + k + '" aria-selected="' + sel + '"' + (free ? '' : ' disabled') +
        ' aria-label="' + fmtDateLong(d) + ', ' + label + '">' +
        '<span class="date-wd">' + (today ? 'hoje' : WD[d.getDay()]) + '</span><span class="date-d">' + pad(d.getDate()) + '</span>' +
        '<span class="date-m">' + MO[d.getMonth()] + '</span><span class="date-av">' + label + '</span></button>';
    }).join('');
    var selEl = $('.date[aria-selected="true"]', el.dates);
    if (selEl) el.dates.scrollLeft = Math.max(0, selEl.offsetLeft - el.dates.offsetLeft - 8);
    renderSlots();
  }
  function renderSlots() {
    if (!state.date) { el.slots.innerHTML = '<p class="slots-empty">Sem horários livres nos próximos dias para essa combinação.</p>'; return; }
    var d = parseKey(state.date);
    var slots = slotsFor(d);
    var groups = [['Manhã', 0, 720], ['Tarde', 720, 1080], ['Noite', 1080, 1440]];
    var html = '';
    groups.forEach(function (g) {
      var gs = slots.filter(function (s) { return s.min >= g[1] && s.min < g[2]; });
      if (!gs.length) return;
      var free = gs.filter(function (s) { return s.pro; }).length;
      html += '<div class="slot-group"><h3>' + g[0] + ' <small>' + free + ' de ' + gs.length + ' livres</small></h3><div class="slot-grid">';
      gs.forEach(function (s) {
        var on = state.time === s.min;
        html += '<button type="button" class="slot" data-min="' + s.min + '" aria-pressed="' + on + '"' + (s.pro ? '' : ' disabled') +
          ' aria-label="' + fmtMin(s.min) + (s.pro ? '' : ', ocupado') + '">' + fmtMin(s.min) + '</button>';
      });
      html += '</div></div>';
    });
    el.slots.innerHTML = html || '<p class="slots-empty">Fechado neste dia.</p>';
  }
  function parseKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }

  el.dates.addEventListener('click', function (e) {
    var b = e.target.closest('[data-date]'); if (!b || b.disabled) return;
    state.date = b.getAttribute('data-date'); state.time = null;
    $$('.date', el.dates).forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
    renderSlots(); update();
  });
  $$('[data-dates]', bk).forEach(function (b) {
    b.addEventListener('click', function () { el.dates.scrollBy({ left: Number(b.getAttribute('data-dates')) * 380, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  });
  el.slots.addEventListener('click', function (e) {
    var b = e.target.closest('[data-min]'); if (!b || b.disabled) return;
    state.time = Number(b.getAttribute('data-min'));
    state.assigned = whoIsFree(parseKey(state.date), state.time);
    $$('.slot', el.slots).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    update();
  });

  /* ----- Formulário ----- */
  function maskPhone(input) {
    var v = input.value.replace(/\D/g, '').slice(0, 11);
    var out = v;
    if (v.length > 2) out = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    if (v.length > 7) out = '(' + v.slice(0, 2) + ') ' + v.slice(2, v.length - 4) + '-' + v.slice(-4);
    input.value = out;
  }
  el.phone.addEventListener('input', function () { maskPhone(el.phone); clearErr(el.phone); });
  el.name.addEventListener('input', function () { clearErr(el.name); update(); });
  function setErr(input, msg) { input.parentElement.classList.add('has-error'); $('.field-error', input.parentElement).textContent = msg; input.setAttribute('aria-invalid', 'true'); }
  function clearErr(input) { input.parentElement.classList.remove('has-error'); $('.field-error', input.parentElement).textContent = ''; input.removeAttribute('aria-invalid'); }
  function validForm() {
    var ok = true;
    if (el.name.value.trim().length < 2) { setErr(el.name, 'Digite seu nome.'); ok = false; }
    var digits = el.phone.value.replace(/\D/g, '');
    if (digits.length < 10) { setErr(el.phone, 'Digite um WhatsApp com DDD, ex.: (41) 99999-9999.'); ok = false; }
    if (!ok) { var bad = $('[aria-invalid="true"]', bk); if (bad) bad.focus(); }
    return ok;
  }
  $('#bkForm').addEventListener('submit', function (e) { e.preventDefault(); goNext(); });

  /* ----- Navegação entre passos ----- */
  function canNext() {
    if (state.step === 1) return state.services.length > 0;
    if (state.step === 2) return !!state.pro && capablePros().length > 0;
    if (state.step === 3) return state.time !== null && !!state.assigned;
    return true;
  }
  function isNum(n) { return typeof n === 'number'; }
  function showStep(n) {
    state.step = n;
    $$('.bk-step', bk).forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-step') === String(n)); });
    panel.classList.toggle('is-profile', n === 'profile');
    if (n === 1) renderServices();
    if (n === 2) renderPros();
    if (n === 3) renderDates();
    if (n === 4) prefillClient();
    if (n === 'profile') renderProfile();
    el.scroll.scrollTop = 0;
    el.actions.hidden = n === 5 || n === 'profile';
    var title = $('.bk-step.is-active .bk-title', bk) || $('.bk-step.is-active .ticket-title', bk);
    if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
    update();
  }
  function goNext() {
    if (!canNext()) return;
    if (state.step === 4) { if (!validForm()) return; confirmBooking(); return; }
    showStep(state.step + 1);
  }
  el.next.addEventListener('click', goNext);
  el.back.addEventListener('click', function () {
    if (state.fromProfile && state.step === 3) { showStep('profile'); return; }
    if (state.step > 1) showStep(state.step - 1); else closeBooking();
  });

  function update() {
    updateProfileDot();
    if (!isNum(state.step)) { el.progress.style.width = '100%'; return; }
    var names = state.services.map(function (id) { return byId(SERVICES, id).name; });
    el.sumServices.textContent = names.length ? names.join(', ') : '—';
    var proName = state.pro === 'any' ? (state.assigned ? state.assigned.name + ' (livre)' : 'Sem preferência') : state.pro ? byId(PROS, state.pro).name : '—';
    el.sumPro.textContent = proName;
    el.sumWhen.textContent = state.date && state.time !== null ? fmtDateLong(parseKey(state.date)) + ' · ' + fmtMin(state.time) : '—';
    el.sumClient.textContent = el.name.value.trim() || '—';
    el.sumDuration.textContent = fmtDur(totalDur() || 0);
    $$('.bk-steps li', bk).forEach(function (li) {
      var n = Number(li.getAttribute('data-step-ind'));
      li.classList.toggle('is-current', n === state.step);
      li.classList.toggle('is-done', n < state.step);
    });
    el.progress.style.width = Math.min(state.step, 4) * 25 + '%';
    el.back.textContent = state.step === 1 ? 'Fechar' : 'Voltar';
    el.next.disabled = !canNext();
    el.next.firstChild.nodeValue = state.step === 4 ? 'Confirmar agendamento ' : 'Continuar ';
    var bits = [];
    if (names.length) bits.push('<strong>' + names.length + ' serviço' + (names.length > 1 ? 's' : '') + '</strong> · ' + fmtDur(totalDur()));
    if (state.time !== null && state.date) bits.push(fmtDateLong(parseKey(state.date)) + ' às ' + fmtMin(state.time));
    el.actionsSum.innerHTML = bits.join(' · ');
  }

  /* ----- Perfil do cliente (protótipo: salvo neste navegador) ----- */
  var panel = $('#bkPanel');
  var digits = function (v) { return String(v || '').replace(/\D/g, ''); };
  function getProfile() { try { return JSON.parse(store.get('theclub-profile') || 'null'); } catch (e) { return null; } }
  function setProfile(p) { if (p) store.set('theclub-profile', JSON.stringify(p)); else { try { localStorage.removeItem('theclub-profile'); } catch (e) {} } }
  function myBookings() {
    var p = getProfile(); if (!p) return [];
    return savedBookings().filter(function (b) { return b.services && digits(b.phone) === digits(p.phone); });
  }
  function startOf(b) { var d = parseKey(b.date); d.setMinutes(b.start); return d; }
  function isUpcoming(b) { return b.status !== 'cancelado' && startOf(b) > new Date(); }
  function updateProfileDot() {
    var has = myBookings().some(isUpcoming);
    $$('.profile-dot').forEach(function (d) { d.hidden = !has; });
  }
  function prefillClient() {
    var p = getProfile();
    if (p) { if (!el.name.value) el.name.value = p.name || ''; if (!el.phone.value) el.phone.value = p.phone || ''; }
  }
  function apptHTML(b, opts) {
    var d = parseKey(b.date);
    var names = b.services.map(function (id) { var s = byId(SERVICES, id); return s ? s.name : id; });
    var pro = byId(PROS, b.pro);
    var cancelled = b.status === 'cancelado';
    var tag = cancelled ? '<span class="appt-tag is-off">Cancelado</span>' : opts.next ? '<span class="appt-tag">Próximo</span>' : '';
    var actions = '<button type="button" class="mini-btn is-cyan" data-repeat="' + b.code + '">Repetir</button>';
    if (opts.upcoming && !cancelled) actions += '<button type="button" class="mini-btn" data-cancel="' + b.code + '">Cancelar</button>';
    return '<article class="appt' + (opts.next ? ' is-next' : '') + (cancelled ? ' is-cancelled' : '') + '">' +
      '<div class="appt-date"><b>' + pad(d.getDate()) + '</b><span>' + MO[d.getMonth()] + '</span></div>' +
      '<div><p class="appt-when">' + WD_LONG[d.getDay()] + ' às ' + fmtMin(b.start) + tag + '</p>' +
      '<p class="appt-what">' + esc(names.join(', ')) + '</p>' +
      '<p class="appt-meta">' + esc(pro ? pro.name : 'Profissional') + ' · ' + fmtDur(b.dur) + ' · ' + esc(b.code) + '</p></div>' +
      '<div class="appt-actions">' + actions + '</div></article>';
  }
  function renderProfile() {
    var p = getProfile();
    var login = $('#pfLogin'), content = $('#pfContent');
    panel.classList.toggle('is-guest', !p);
    $('#spAvatar').textContent = p && p.name ? p.name.trim().charAt(0).toUpperCase() : '?';
    $('#spName').textContent = p ? p.name : '';
    $('#spPhone').textContent = p ? p.phone : '';
    if (!p) { login.hidden = false; content.innerHTML = ''; $('#pfTitle').innerHTML = 'Meus <mark class="block">agendamentos</mark>'; return; }
    login.hidden = true;
    var first = (p.name || '').trim().split(' ')[0];
    $('#pfTitle').innerHTML = 'Olá, <mark class="block">' + esc(first) + '</mark>';
    var list = myBookings();
    var up = list.filter(isUpcoming).sort(function (a, b) { return startOf(a) - startOf(b); });
    var past = list.filter(function (b) { return !isUpcoming(b); }).sort(function (a, b) { return startOf(b) - startOf(a); });
    var last = list.slice().sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); })[0];
    var html = '';
    if (last) {
      var lnames = last.services.map(function (id) { var s = byId(SERVICES, id); return s ? s.name : id; });
      var lpro = byId(PROS, last.pro);
      html += '<div class="pf-repeat"><svg class="stache-bg" aria-hidden="true"><use href="#stache"/></svg><div>' +
        '<p class="pf-repeat-k">Seu último agendamento</p>' +
        '<p class="pf-repeat-t">' + esc(lnames.join(' + ')) + '</p>' +
        '<p class="pf-repeat-m">com ' + esc(lpro ? lpro.name : 'o mesmo profissional') + ' · ' + fmtDur(last.dur) + '</p></div>' +
        '<button type="button" class="btn btn-black" data-repeat="' + last.code + '">Repetir agendamento</button></div>';
    }
    html += '<section class="pf-section"><h3>Próximos <small>' + up.length + '</small></h3><div class="pf-list">' +
      (up.length ? up.map(function (b, i) { return apptHTML(b, { upcoming: true, next: i === 0 }); }).join('') : '<p class="pf-empty">Nenhum horário marcado. Que tal agendar o próximo?</p>') +
      '</div></section>';
    if (past.length) html += '<section class="pf-section"><h3>Histórico <small>' + past.length + '</small></h3><div class="pf-list">' +
      past.map(function (b) { return apptHTML(b, { upcoming: false }); }).join('') + '</div></section>';
    if (!list.length) html = '<p class="pf-empty">Você ainda não tem agendamentos por aqui. Faça o primeiro e ele aparece nesta tela.</p>';
    content.innerHTML = html;
  }
  $('#pfLogin').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = $('#pfPhone'), d = digits(input.value);
    if (d.length < 10) { setErr(input, 'Digite um WhatsApp com DDD, ex.: (41) 99999-9999.'); input.focus(); return; }
    var found = savedBookings().filter(function (b) { return b.services && digits(b.phone) === d; })
      .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    if (!found.length) { setErr(input, 'Não encontramos agendamentos com esse número. Confira o WhatsApp ou faça um agendamento.'); return; }
    clearErr(input);
    setProfile({ name: found[0].name, phone: found[0].phone });
    renderProfile(); update();
  });
  $('#pfPhone').addEventListener('input', function () { maskPhone(this); clearErr(this); });
  $('#pfContent').addEventListener('click', function (e) {
    var r = e.target.closest('[data-repeat]');
    if (r) { repeatBooking(r.getAttribute('data-repeat')); return; }
    var c = e.target.closest('[data-cancel]');
    if (c) {
      if (!c.classList.contains('is-danger')) { c.classList.add('is-danger'); c.textContent = 'Confirmar cancelamento'; return; }
      var code = c.getAttribute('data-cancel');
      var all = savedBookings().map(function (b) { if (b.code === code) b.status = 'cancelado'; return b; });
      store.set('theclub-bookings', JSON.stringify(all));
      renderProfile(); update();
    }
  });
  function repeatBooking(code) {
    var b = savedBookings().filter(function (x) { return x.code === code; })[0];
    if (!b) return;
    reset();
    state.services = b.services.filter(function (id) { return byId(SERVICES, id); });
    state.pro = byId(PROS, b.pro) ? b.pro : 'any';
    if (!capablePros().some(function (p) { return p.id === state.pro; })) state.pro = 'any';
    state.fromProfile = true;
    showStep(3);
  }
  $('#spLogout').addEventListener('click', function () { setProfile(null); el.name.value = ''; el.phone.value = ''; renderProfile(); update(); });
  $('#spNew').addEventListener('click', function () { reset(); showStep(1); });
  $$('[data-pf-new]', bk).forEach(function (b) { b.addEventListener('click', function () { reset(); showStep(1); }); });

  function confirmBooking() {
    var pro = state.assigned;
    var code = 'TC-' + Math.floor(1000 + Math.random() * 9000);
    var dur = totalDur();
    var list = savedBookings();
    list.push({
      code: code, pro: pro.id, date: state.date, start: state.time, dur: dur,
      services: state.services.slice(), name: el.name.value.trim(), phone: el.phone.value,
      note: el.note.value.trim(), status: 'confirmado', createdAt: Date.now()
    });
    store.set('theclub-bookings', JSON.stringify(list));
    setProfile({ name: el.name.value.trim(), phone: el.phone.value });

    var names = state.services.map(function (id) { return byId(SERVICES, id).name; });
    var when = fmtDateLong(parseKey(state.date)) + ' às ' + fmtMin(state.time);
    $('#tkName').textContent = el.name.value.trim().split(' ')[0];
    $('#tkWhen').textContent = when;
    $('#tkPro').textContent = pro.name;
    $('#tkServices').textContent = names.join(', ') + ' · ' + fmtDur(dur);
    $('#tkCode').textContent = code;
    var msg = 'Olá! Acabei de agendar pelo site da The Club.\n\n' +
      '• Serviços: ' + names.join(', ') + '\n' +
      '• Profissional: ' + pro.name + '\n' +
      '• Data: ' + when + '\n' +
      '• Nome: ' + el.name.value.trim() + '\n' +
      '• WhatsApp: ' + el.phone.value + '\n' +
      (el.note.value.trim() ? '• Obs.: ' + el.note.value.trim() + '\n' : '') +
      (el.first.checked ? '• Primeira vez na The Club\n' : '') +
      '• Código: ' + code;
    $('#tkWhats').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
    showStep(5);
  }
  $('#tkAgain').addEventListener('click', function () {
    reset(); el.note.value = ''; el.first.checked = false;
    showStep(1);
  });
  $('#tkProfile').addEventListener('click', function () { reset(); el.note.value = ''; el.first.checked = false; showStep('profile'); });

  /* ----- Abrir / fechar ----- */
  function openModal() {
    if (root.classList.contains('menu-open')) setMenu(false);
    bk.hidden = false;
    root.classList.add('booking-open');
    document.body.style.overflow = 'hidden';
  }
  function openBooking(opts) {
    opts = opts || {};
    if (state.step === 5 || state.step === 'profile') reset();
    state.lastFocus = document.activeElement;
    if (opts.service && state.services.indexOf(opts.service) === -1) {
      state.services = [opts.service];
      state.date = null; state.time = null;
    }
    if (opts.pro) { state.pro = opts.pro; state.date = null; state.time = null; }
    openModal();
    showStep(opts.service ? 2 : 1);
  }
  function openProfile() {
    var lf = document.activeElement;
    reset(); state.lastFocus = lf;
    openModal();
    showStep('profile');
  }
  function closeBooking() {
    bk.hidden = true;
    root.classList.remove('booking-open');
    document.body.style.overflow = '';
    if (state.step === 5 || state.step === 'profile') reset();
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var pBtn = e.target.closest('[data-profile]');
    if (pBtn) { e.preventDefault(); openProfile(); return; }
    var t = e.target.closest('[data-book]');
    if (!t) return;
    e.preventDefault();
    openBooking({ service: t.getAttribute('data-service'), pro: t.getAttribute('data-pro') });
  });
  $$('[data-bk-close]', bk).forEach(function (b) { b.addEventListener('click', closeBooking); });
  document.addEventListener('keydown', function (e) {
    if (bk.hidden) return;
    if (e.key === 'Escape') closeBooking();
    if (e.key === 'Tab') trap(e, panel);
  });
  updateProfileDot();
  if (location.hash === '#agendar') openBooking();
  if (location.hash === '#perfil') openProfile();
})();
