/* ============================================================
   lukeerickson.com — interactions & motion (vanilla, no deps)
   Motion levels: rich (parallax + reveals) | calm (reveals only) | still (none).
   prefers-reduced-motion forces the calmest behavior regardless.
   Nothing here gates content: with JS off, everything is visible.
   ============================================================ */
(function () {
  'use strict';
  var root = document.documentElement;
  var mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = function () { return mqReduced.matches; };
  var motion = function () { return root.getAttribute('data-motion') || 'rich'; };
  /* NOTE: keep this name unique — a marquee element below is also a local `var track`. */
  var gaTrack = function (name, params) { try { if (window.gtag) { window.gtag('event', name, params || {}); } } catch (e) {} };

  /* ---------- current year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- theme toggle (no flash; persisted) ---------- */
  var themeBtn = document.getElementById('themeToggle');
  var themeIcon = document.getElementById('themeIcon');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function paintTheme(t) {
    root.setAttribute('data-theme', t);
    if (themeIcon) themeIcon.firstElementChild.setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#181D24' : '#F7F9FC');
  }
  paintTheme(root.getAttribute('data-theme') || 'dark');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    paintTheme(next);
    try { localStorage.setItem('luke-theme', next); } catch (e) {}
  });

  /* ---------- sticky header goes glass past 16px ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScrollHeader = function () { header.classList.toggle('is-scrolled', (window.scrollY || 0) > 16); };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var navToggleIcon = document.getElementById('navToggleIcon');
  var navLinks = document.getElementById('navLinks');
  function setNav(open) {
    header.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggleIcon.firstElementChild.setAttribute('href', open ? '#i-x' : '#i-list');
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () { setNav(!header.classList.contains('nav-open')); });
    navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  }

  /* ---------- smooth in-page scrolling with header offset ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    var y = el.getBoundingClientRect().top + (window.scrollY || 0) - 80;
    window.scrollTo({ top: Math.max(0, y), behavior: prefersReduced() ? 'auto' : 'smooth' });
  });

  /* ---------- cloud parallax (rich only) ---------- */
  var depthNodes = Array.prototype.slice.call(document.querySelectorAll('#cloudField [data-depth]'));
  var rafCloud = 0;
  function updateClouds() {
    var y = window.scrollY || window.pageYOffset || 0;
    for (var i = 0; i < depthNodes.length; i++) {
      var d = parseFloat(depthNodes[i].getAttribute('data-depth')) || 0;
      depthNodes[i].style.setProperty('--py', (y * d * -1) + 'px');
    }
  }
  function onScrollClouds() { cancelAnimationFrame(rafCloud); rafCloud = requestAnimationFrame(updateClouds); }
  function clearClouds() { for (var i = 0; i < depthNodes.length; i++) depthNodes[i].style.setProperty('--py', '0px'); }

  /* ---------- hero pointer parallax (rich only) ---------- */
  var heroMedia = document.getElementById('heroMedia');
  var heroChip = document.getElementById('heroChip');
  var rafHero = 0, hx = 0, hy = 0;
  function onPointer(e) {
    var w = window.innerWidth || 1, h = window.innerHeight || 1;
    hx = (e.clientX / w - 0.5);
    hy = (e.clientY / h - 0.5);
    cancelAnimationFrame(rafHero);
    rafHero = requestAnimationFrame(applyPointer);
  }
  function applyPointer() {
    if (heroMedia) heroMedia.style.transform = 'translate3d(' + (hx * 10) + 'px,' + (hy * 10) + 'px,0)';
    if (heroChip) heroChip.style.transform = 'translate3d(' + (hx * 18) + 'px,' + (hy * 18) + 'px,0)';
  }
  function clearPointer() {
    if (heroMedia) heroMedia.style.transform = '';
    if (heroChip) heroChip.style.transform = '';
  }

  /* ---------- reveal on scroll (rich + calm) ---------- */
  var io = null;
  function armReveals() {
    if (io) return;
    root.classList.add('reveal-armed');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (n) { n.classList.add('is-visible'); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (n) { io.observe(n); });
  }
  function disarmReveals() {
    root.classList.remove('reveal-armed');
    if (io) { io.disconnect(); io = null; }
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (n) { n.classList.add('is-visible'); });
  }

  /* ---------- marquee: duplicate track for a seamless loop ---------- */
  var track = document.getElementById('marqueeTrack');
  if (track && !track.dataset.cloned) {
    // Clone once for the seamless loop; hide the copies from assistive tech
    // so logos aren't announced twice. When the marquee is stopped and
    // wraps (calm/still/reduced-motion), applyMotion() removes the clones.
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (node) {
      var c = node.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('data-clone', '1');
      Array.prototype.forEach.call(c.querySelectorAll('img'), function (im) { im.alt = ''; });
      track.appendChild(c);
    });
    track.dataset.cloned = '1';
  }

  /* ---------- wire/unwire motion to the current level ---------- */
  var cloudsWired = false, pointerWired = false;
  function applyMotion() {
    var m = prefersReduced() ? 'still' : motion();
    // clouds parallax — rich only
    if (m === 'rich' && !cloudsWired) {
      window.addEventListener('scroll', onScrollClouds, { passive: true });
      updateClouds(); cloudsWired = true;
    } else if (m !== 'rich' && cloudsWired) {
      window.removeEventListener('scroll', onScrollClouds); cloudsWired = false; clearClouds();
    }
    // hero pointer — rich only, and not on touch
    var canHover = window.matchMedia('(hover: hover)').matches;
    if (m === 'rich' && canHover && !pointerWired) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      pointerWired = true;
    } else if ((m !== 'rich' || !canHover) && pointerWired) {
      window.removeEventListener('pointermove', onPointer); pointerWired = false; clearPointer();
    }
    // reveals — rich + calm
    if ((m === 'rich' || m === 'calm')) armReveals(); else disarmReveals();
    // marquee clones — only needed while it scrolls (rich); hide when it wraps
    if (track) {
      Array.prototype.forEach.call(track.querySelectorAll('[data-clone]'), function (c) { c.hidden = (m !== 'rich'); });
    }
  }

  /* ---------- motion toggle (rich -> calm -> still) ---------- */
  var motionBtn = document.getElementById('motionToggle');
  // Stored values stay rich/calm/still; visitors see plain words.
  var motionWords = { rich: 'full', calm: 'reduced', still: 'off' };
  function labelMotion() {
    if (!motionBtn) return;
    var label = 'Motion: ' + (motionWords[motion()] || motion());
    motionBtn.textContent = label;
    motionBtn.setAttribute('aria-label', label + ', change motion level');
  }
  if (motionBtn) {
    motionBtn.addEventListener('click', function () {
      var order = ['rich', 'calm', 'still'];
      var next = order[(order.indexOf(motion()) + 1) % order.length];
      root.setAttribute('data-motion', next);
      try { localStorage.setItem('luke-motion', next); } catch (e) {}
      labelMotion(); applyMotion();
    });
  }
  labelMotion();
  applyMotion();
  if (mqReduced.addEventListener) mqReduced.addEventListener('change', applyMotion);

  /* ---------- contact form: success state (+ optional POST) ---------- */
  var form = document.getElementById('contactForm');
  var success = document.getElementById('contactSuccess');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var reveal = function () {
        form.hidden = true;
        if (success) { success.hidden = false; success.setAttribute('role', 'status'); }
      };
      var val = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value : ''; };
      var emailFallback = function () {
        // Netlify Forms isn't active (detection off or not yet deployed) — open a
        // pre-filled email to Luke so the note still reaches him.
        var subject = encodeURIComponent('Message from ' + (val('name') || 'your website'));
        var bodyTxt = encodeURIComponent((val('message') || '') + '\n\n— ' + (val('name') || '') + (val('email') ? ' <' + val('email') + '>' : ''));
        window.location.href = 'mailto:lukeericksonwork@gmail.com?subject=' + subject + '&body=' + bodyTxt;
        reveal();
      };
      // Submit to Netlify Forms: urlencoded POST to any same-site path, form-name included.
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        // contact_submit counts delivered messages only; the mailto fallback is tracked separately.
        .then(function (res) {
          if (res && res.ok) { gaTrack('contact_submit'); reveal(); }
          else { gaTrack('contact_fallback'); emailFallback(); }
        })
        .catch(function () { gaTrack('contact_fallback'); emailFallback(); });
    });
  }

  /* ---------- copy-to-clipboard buttons (press/speaking kit) ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var src = document.querySelector(btn.getAttribute('data-copy'));
    if (!src) return;
    var text = src.innerText.trim();
    var done = function () {
      var old = btn.textContent;
      btn.textContent = 'Copied';
      gaTrack('bio_copy', { block: btn.getAttribute('data-copy') });
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    var legacyCopy = function () {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { if (document.execCommand('copy')) done(); } catch (err) {}
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, legacyCopy);
    } else {
      legacyCopy();
    }
  });

  /* ---------- GA4 events: résumé downloads, outbound + social clicks ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/\.pdf(\?|$)/i.test(href)) { gaTrack('resume_download', { file: href }); return; }
    if (/^mailto:/i.test(href)) { gaTrack('contact_click', { method: 'email' }); return; }
    if (/^https?:\/\//i.test(href) && href.indexOf(location.host) === -1) {
      gaTrack('outbound_click', { link_url: href, link_text: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 60) });
    }
  });

  /* ---------- Gallery lightbox ---------- */
  (function () {
    var items = document.querySelectorAll('.gallery__item');
    if (!items.length) return;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<button class="lightbox__close" type="button" aria-label="Close">&times;</button>' +
      '<figure class="lightbox__fig"><img class="lightbox__img" alt="" /><figcaption class="lightbox__cap"></figcaption></figure>';
    document.body.appendChild(box);
    var imgEl = box.querySelector('.lightbox__img');
    var capEl = box.querySelector('.lightbox__cap');
    var closeBtn = box.querySelector('.lightbox__close');
    var lastFocus = null;
    function openBox(fig) {
      var i = fig.querySelector('img'); if (!i) return;
      var c = fig.querySelector('figcaption');
      imgEl.src = i.getAttribute('src') || i.currentSrc;
      imgEl.alt = i.getAttribute('alt') || '';
      capEl.textContent = c ? c.textContent : '';
      lastFocus = fig;
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      closeBtn.focus();
      gaTrack('gallery_view', { image: imgEl.src });
    }
    function closeBox() {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      imgEl.src = '';
      if (lastFocus) lastFocus.focus();
    }
    items.forEach(function (fig) {
      fig.addEventListener('click', function () { openBox(fig); });
      fig.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(fig); } });
    });
    box.addEventListener('click', function (e) { if (e.target === box || e.target === closeBtn) closeBox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('is-open')) closeBox(); });
  })();
  /* ---------- Clips row and player ---------- */
  (function () {
    var row = document.getElementById('clipsRow');
    if (!row) return;
    var clips = Array.prototype.slice.call(row.querySelectorAll('.clip'));
    if (!clips.length) return;
    var smooth = function () { return motion() === 'still' ? 'auto' : 'smooth'; };
    function nudge(dir) { row.scrollBy({ left: dir * (clips[0].getBoundingClientRect().width + 14) * 2, behavior: smooth() }); }
    var back = document.getElementById('clipsPrev'), fwd = document.getElementById('clipsNext');
    if (back) back.addEventListener('click', function () { nudge(-1); });
    if (fwd) fwd.addEventListener('click', function () { nudge(1); });

    var arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    var box = document.createElement('div');
    box.className = 'reel-modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-hidden', 'true');
    box.setAttribute('aria-label', 'Video clip');
    box.innerHTML = '<button class="reel-modal__close" type="button" aria-label="Close clip">&times;</button>' +
      '<button class="reel-modal__nav reel-modal__nav--prev" type="button" aria-label="Previous clip">' + arrow + '</button>' +
      '<div class="reel-modal__stage"><div class="reel-modal__frame is-loading"><span class="reel-modal__spin" aria-hidden="true"></span><iframe title="Video clip" allow="autoplay; encrypted-media; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe></div>' +
      '<div class="reel-modal__info"><p class="reel-modal__line"></p><p class="reel-modal__meta"></p><div class="reel-modal__links"><a class="reel-modal__full" target="_blank" rel="noopener">Watch the full episode</a><a class="ds-btn ds-btn--primary reel-modal__contact" href="#contact">Get in touch</a></div></div></div>' +
      '<button class="reel-modal__nav reel-modal__nav--next" type="button" aria-label="Next clip">' + arrow + '</button>';
    document.body.appendChild(box);
    var frame = box.querySelector('iframe'), wrap = box.querySelector('.reel-modal__frame');
    var lineEl = box.querySelector('.reel-modal__line'), metaEl = box.querySelector('.reel-modal__meta');
    var fullEl = box.querySelector('.reel-modal__full'), closeBtn = box.querySelector('.reel-modal__close');
    var current = 0, opener = null;
    fullEl.setAttribute('href', clips[0].getAttribute('data-full') || clips[0].getAttribute('href'));

    frame.addEventListener('load', function () { if (frame.getAttribute('src')) wrap.classList.remove('is-loading'); });

    function show(i) {
      current = (i + clips.length) % clips.length;
      var c = clips[current], code = c.getAttribute('data-reel');
      wrap.classList.add('is-loading');
      frame.setAttribute('src', 'https://www.instagram.com/reel/' + code + '/embed/');
      frame.setAttribute('title', 'Video clip: ' + c.getAttribute('data-line'));
      lineEl.innerHTML = c.getAttribute('data-line');
      metaEl.innerHTML = c.getAttribute('data-meta');
      var full = c.getAttribute('data-full');
      fullEl.style.display = full ? '' : 'none';
      if (full) fullEl.setAttribute('href', full);
      gaTrack('clip_play', { clip: code, position: current + 1 });
    }
    function open(i, el) {
      opener = el;
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      show(i);
      closeBtn.focus();
    }
    function close() {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      frame.removeAttribute('src');
      if (opener) opener.focus();
    }
    clips.forEach(function (c, i) {
      c.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        open(i, c);
      });
    });
    box.querySelector('.reel-modal__nav--prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.reel-modal__nav--next').addEventListener('click', function () { show(current + 1); });
    closeBtn.addEventListener('click', close);
    box.querySelector('.reel-modal__contact').addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'Tab') {
        var f = Array.prototype.filter.call(box.querySelectorAll('button, a[href], iframe'), function (n) { return n.offsetParent !== null; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();
})();
