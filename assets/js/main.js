/**
 * Assembles the one-page site from the individual files in /sections.
 * Each <div class="section-slot" data-src="sections/xxx.html"></div>
 * in index.html gets replaced with the contents of that file.
 *
 * To edit a section, edit its file in /sections — this script and
 * index.html don't need to change.
 *
 * Note: fetch() only works when the page is served over http(s), not
 * when index.html is opened directly (file://). Run a local server
 * to preview (see README), or just push to GitHub Pages.
 */
(function () {
  setupNavToggle();

  var slots = Array.prototype.slice.call(document.querySelectorAll('.section-slot'));

  var loads = slots.map(function (slot) {
    var src = slot.getAttribute('data-src');
    return fetch(src, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + src + ' (' + res.status + ')');
        return res.text();
      })
      .then(function (html) {
        slot.outerHTML = html;
      })
      .catch(function (err) {
        slot.outerHTML =
          '<div class="wrap" style="padding:40px 0; color:#c6538c; font-family:var(--font-mono); font-size:0.85rem;">' +
          'Couldn\'t load ' + src + '. If you opened this file directly, run a local server instead (see README).' +
          '</div>';
        console.error(err);
      });
  });

  Promise.all(loads).then(function () {
    // Sections are in the DOM now — wire up anything that depends on them.
    if (window.initExperienceModal) window.initExperienceModal();
    if (window.initContactForm) window.initContactForm();
    if (window.initJamsSection) window.initJamsSection();
    if (window.initCreationsSection) window.initCreationsSection();
    if (window.initHeroBackground) window.initHeroBackground();
    setupScrollSpy();

    // Keep the footer copyright year current automatically.
    var yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Support direct links like page.html#experience
    if (location.hash) {
      var target = document.querySelector(location.hash);
      if (target) target.scrollIntoView();
    }
  });

  function setupScrollSpy() {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('header nav a[href^="#"]'));
    var targets = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (!targets.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = '#' + entry.target.id;
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    targets.forEach(function (t) { observer.observe(t); });
  }

  function setupNavToggle() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    var backdrop = document.getElementById('nav-backdrop');
    if (!toggle || !menu || !backdrop) return;

    function openMenu() {
      menu.classList.add('open');
      backdrop.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menu.classList.remove('open');
      backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.contains('open');
      if (isOpen) closeMenu(); else openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });
    // If the viewport is resized past the collapse breakpoint while open, reset state.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720 && menu.classList.contains('open')) closeMenu();
    });
  }
})();
