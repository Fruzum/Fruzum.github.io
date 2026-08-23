// Called by main.js once sections/contact.html has been fetched and
// inserted into the page. Submits to Formspree via fetch so the visitor
// stays on the page instead of being redirected.
window.initContactForm = function () {
  var form = document.getElementById('contactForm');
  if (!form || form.dataset.wired) return; // contact section not on this page, or already wired
  form.dataset.wired = 'true';

  var successEl = document.getElementById('form-success');
  var submitBtn = form.querySelector('.btn-send');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // The form has novalidate set (for custom message styling), which
    // means the browser's automatic required-field check never runs on
    // submit — call it explicitly, or empty fields would silently go
    // through since we already prevent the native submission above.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    successEl.textContent = '';
    successEl.className = 'form-success';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          successEl.textContent = "Thanks — I'll get back to you soon.";
          successEl.classList.add('success');
        } else {
          return res.json().then(function (data) {
            var msg =
              data && data.errors
                ? data.errors.map(function (err) { return err.message; }).join(', ')
                : 'Something went wrong. Please try again.';
            throw new Error(msg);
          });
        }
      })
      .catch(function () {
        successEl.textContent = "Couldn't send that — please try again, or email me directly.";
        successEl.classList.add('error');
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      });
  });
};
