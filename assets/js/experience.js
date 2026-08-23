// Called by main.js once sections/experience.html, sections/education.html,
// and sections/modal.html have all been fetched and inserted into the page.
//
// Popup content lives right in the HTML now, inside a <template data-job="...">
// tag next to each "View full breakdown" button — not in this file. This
// script's only job is the mechanical part: find the template matching
// whichever button was clicked, and drop its content into the modal shell.
window.initExperienceModal = function () {
  var overlay = document.getElementById('job-modal-overlay');
  var titleEl = document.getElementById('job-modal-title');
  var metaEl = document.getElementById('job-modal-meta');
  var bodyEl = document.getElementById('job-modal-body');
  var closeBtn = document.getElementById('job-modal-close');
  if (!overlay || overlay.dataset.wired) return; // experience section not on this page, or already wired
  overlay.dataset.wired = 'true';
  var lastFocused = null;

  function openModal(key) {
    var tpl = document.querySelector('template[data-job="' + key + '"]');
    if (!tpl) return;
    titleEl.textContent = tpl.getAttribute('data-title') || '';
    metaEl.innerHTML = tpl.getAttribute('data-meta') || '';
    bodyEl.innerHTML = tpl.innerHTML;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    lastFocused = document.activeElement;
    closeBtn.focus();
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.detail-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation(); // avoid the parent card's own click handler firing a second time
      openModal(btn.getAttribute('data-job'));
    });
  });

  // Make the whole card clickable too — not just the button — while still
  // letting clicks on the video (or any future links) behave normally.
  document.querySelectorAll('.tl-item, .edu-card').forEach(function (card) {
    var btn = card.querySelector('.detail-btn');
    if (!btn) return;
    card.classList.add('is-clickable');
    card.addEventListener('click', function (e) {
      if (e.target.closest('video, a, button')) return;
      openModal(btn.getAttribute('data-job'));
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
};
