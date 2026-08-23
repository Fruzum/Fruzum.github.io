// Called by main.js once sections have loaded (the background field
// elements themselves live in index.html and are present from the start).
// Spawns soft colour blobs at random positions/sizes/colours that fade in,
// hold, and fade out on their own independent timers behind the whole
// page, and layers a mouse ripple effect on top that traces the cursor
// anywhere on the site, not just one section.
window.initHeroBackground = function () {
  var field = document.getElementById('aurora-field');
  var rippleField = document.getElementById('ripple-field');
  if (!field || !rippleField) return;
  if (field.dataset.wired) return;
  field.dataset.wired = 'true';

  // Respect reduced-motion: leave the plain background with no JS-driven
  // animation at all, rather than spawning elements that immediately snap
  // to a static state.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var COLORS = ['#ff4fa3', '#b18aff', '#ff5c5c', '#d17fd6', '#ff7ec2', '#9a8cff'];
  var MAX_BLOBS = Math.min(45, Math.max(14, Math.round(document.body.scrollHeight / window.innerHeight) * 5));
  var active = 0;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---------- generative colour blobs ----------
  // Positioned in fixed pixel coordinates against the page's height at
  // spawn time (not percentages) — a percentage-based position would
  // silently shift every existing blob whenever the page's total height
  // changes for any reason (an accordion opening, a modal's content,
  // etc.), since the same "50%" means a different pixel position once
  // the page is taller. Pixels stay put regardless.

  function spawnBlob() {
    if (active >= MAX_BLOBS) return;
    active++;

    var blob = document.createElement('div');
    blob.className = 'blob';

    var size = rand(200, 420);
    var pageHeight = Math.max(document.body.scrollHeight, window.innerHeight);
    var pageWidth = document.documentElement.clientWidth;
    var top = rand(-0.1, 0.85) * pageHeight;
    var left = rand(-0.1, 0.85) * pageWidth;
    var peak = rand(0.28, 0.55);
    // Longer-lived than a viewport-scoped background would need — since a
    // blob only matters once a visitor scrolls near it, it has to survive
    // long enough for that to actually happen.
    var duration = rand(20, 38);

    blob.style.width = size + 'px';
    blob.style.height = size + 'px';
    blob.style.top = top + 'px';
    blob.style.left = left + 'px';
    blob.style.background = pick(COLORS);
    blob.style.setProperty('--peak', peak);
    blob.style.animationDuration = duration + 's';

    blob.addEventListener('animationend', function () {
      blob.remove();
      active--;
    });

    field.appendChild(blob);
  }

  for (var i = 0; i < MAX_BLOBS; i++) {
    setTimeout(spawnBlob, i * rand(150, 400));
  }
  setInterval(function () {
    if (Math.random() < 0.6) spawnBlob();
  }, 1200);

  // ---------- mouse ripple ----------
  // The ripple field is position:fixed and matches the viewport exactly,
  // so cursor coordinates can be used directly with no scroll offset math
  // — and listening on the whole document means it follows the mouse over
  // any section, not just the hero.

  var lastSpawn = 0;
  var lastX = null;
  var lastY = null;
  var MIN_INTERVAL = 55; // ms between ripples, even if the mouse never stops
  var MIN_DISTANCE = 14; // px the mouse must move before spawning another

  function spawnRipple(x, y) {
    var ring = document.createElement('div');
    ring.className = 'ripple';
    var size = rand(70, 130);
    ring.style.width = size + 'px';
    ring.style.height = size + 'px';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    ring.style.setProperty('--rc', pick(COLORS));
    ring.addEventListener('animationend', function () { ring.remove(); });
    rippleField.appendChild(ring);
  }

  document.addEventListener('mousemove', function (e) {
    var x = e.clientX;
    var y = e.clientY;
    var now = performance.now();

    var moved = lastX === null || Math.hypot(x - lastX, y - lastY) > MIN_DISTANCE;
    if (moved && now - lastSpawn > MIN_INTERVAL) {
      spawnRipple(x, y);
      lastSpawn = now;
      lastX = x;
      lastY = y;
    }
  });
};
