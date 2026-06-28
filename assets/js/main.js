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
    var html = track.innerHTML;
    track.innerHTML = html + html;
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
  }

  /* ---------- motion toggle (rich -> calm -> still) ---------- */
  var motionBtn = document.getElementById('motionToggle');
  function labelMotion() {
    if (motionBtn) motionBtn.textContent = 'Motion: ' + motion();
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
      // Netlify Forms: POST the URL-encoded form (incl. the hidden form-name) to the site root.
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(reveal).catch(reveal);
    });
  }
})();
