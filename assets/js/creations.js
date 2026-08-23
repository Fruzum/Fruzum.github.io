// Called by main.js once sections/creations.html has been fetched and
// inserted. Reads PreviousCreations/manifest.txt, fetches each listed
// entry file, and renders gif+title cards with a click-through popup for
// each one — in the order they're listed in manifest.txt (top = first).
window.initCreationsSection = function () {
  var grid = document.getElementById('creations-grid');
  if (!grid || grid.dataset.wired) return;
  grid.dataset.wired = 'true';

  var BASE = 'PreviousCreations/';

  wireModal();
  loadEntries();

  // ---------- loading & parsing ----------

  function loadEntries() {
    fetch(BASE + 'manifest.txt', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('manifest.txt ' + res.status);
        return res.text();
      })
      .then(function (manifestText) {
        var filenames = manifestText
          .split(/\r?\n/)
          .map(function (l) { return l.trim(); })
          .filter(function (l) { return l && l.indexOf('#') !== 0; });

        if (!filenames.length) {
          grid.innerHTML = '<div class="jam-grid-status">No entries yet.</div>';
          return;
        }

        return Promise.all(
          filenames.map(function (filename) {
            return fetch(BASE + 'entries/' + filename, { cache: 'no-store' })
              .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
              })
              .then(function (text) { return parseEntry(filename, text); })
              .catch(function (err) {
                console.warn('[creations] skipping ' + filename + ': ' + err.message);
                return null;
              });
          })
        );
      })
      .then(function (entries) {
        if (!entries) return;
        // Order comes straight from manifest.txt (top = shown first) —
        // no date parsing involved, so entries can be named freely.
        entries = entries.filter(Boolean);
        renderCards(entries);
      })
      .catch(function (err) {
        console.error('[creations] could not load manifest:', err);
        grid.innerHTML = '<div class="jam-grid-status">Couldn\'t load this section.</div>';
      });
  }

  function parseEntry(filename, text) {
    var markerIndex = text.indexOf('===POPUP===');
    var headerText = markerIndex >= 0 ? text.slice(0, markerIndex) : text;
    var popupRaw = markerIndex >= 0 ? text.slice(markerIndex + '===POPUP==='.length) : '';

    var fields = {};
    headerText.split(/\r?\n/).forEach(function (line) {
      var m = line.match(/^([A-Z_]+):\s*(.*)$/);
      if (m) fields[m[1]] = m[2].trim();
    });

    if (!fields.TITLE || !fields.GIF_URL) {
      throw new Error('missing TITLE or GIF_URL');
    }

    var gifUrl = /^https?:\/\//.test(fields.GIF_URL) ? fields.GIF_URL : BASE + fields.GIF_URL;

    return {
      filename: filename,
      title: fields.TITLE,
      gifUrl: gifUrl,
      gifAlt: fields.GIF_ALT || fields.TITLE,
      linkText: fields.LINK_TEXT || (fields.LINK_URL ? 'View more' : ''),
      linkUrl: fields.LINK_URL || '',
      popupHtml: renderMiniMarkdown(popupRaw.trim()),
    };
  }

  // ---------- tiny markdown-ish renderer for popup bodies (shared format with the Extra section) ----------

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function resolveUrl(url) {
    url = url.trim();
    if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) || /^data:/i.test(url)) return url;
    return BASE + url;
  }

  function formatInline(raw) {
    var s = escapeHtml(raw);
    // {{link: url | text}}, {{image: url | alt}}, {{gif: url | alt}}, {{video: url}}
    s = s.replace(/\{\{\s*(link|image|gif|video)\s*:\s*([^|}]+?)\s*(?:\|\s*([^}]+?)\s*)?\}\}/g, function (_, type, url, extra) {
      url = resolveUrl(url);
      if (type === 'link') {
        return '<a href="' + url + '" target="_blank" rel="noopener">' + (extra || url) + '</a>';
      }
      if (type === 'video') {
        return '<video controls preload="metadata" src="' + url + '"></video>';
      }
      return '<img src="' + url + '" alt="' + (extra || '') + '" loading="lazy">';
    });
    // legacy markdown-style image/link syntax — still supported
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_, alt, url) {
      return '<img src="' + resolveUrl(url) + '" alt="' + alt + '" loading="lazy">';
    });
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, url) {
      return '<a href="' + resolveUrl(url) + '" target="_blank" rel="noopener">' + label + '</a>';
    });
    return s;
  }

  function renderMiniMarkdown(text) {
    if (!text) return '';
    var lines = text.split(/\r?\n/);
    var out = [];
    var para = [];
    var list = [];
    var mode = 'none';

    function flushPara() {
      if (para.length) { out.push('<p>' + para.join(' ') + '</p>'); para = []; }
    }
    function flushList() {
      if (list.length) { out.push('<ul>' + list.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>'); list = []; }
    }

    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) { flushPara(); flushList(); mode = 'none'; return; }
      if (/^#{1,3}\s+/.test(line)) {
        flushPara(); flushList();
        out.push('<h4>' + formatInline(line.replace(/^#{1,3}\s+/, '')) + '</h4>');
        mode = 'none';
        return;
      }
      if (/^-\s+/.test(line)) {
        flushPara();
        list.push(formatInline(line.replace(/^-\s+/, '')));
        mode = 'list';
        return;
      }
      if (/^(\{\{\s*(image|gif|video)\s*:[^}]+\}\}|!\[[^\]]*\]\([^)]+\))$/.test(line)) {
        flushPara(); flushList();
        out.push(formatInline(line));
        mode = 'none';
        return;
      }
      if (mode === 'list' && list.length) {
        list[list.length - 1] += ' ' + formatInline(line);
      } else {
        para.push(formatInline(line));
        mode = 'para';
      }
    });
    flushPara();
    flushList();
    return out.join('\n');
  }

  // ---------- rendering cards ----------

  function renderCards(entries) {
    grid.innerHTML = '';
    if (!entries.length) {
      grid.innerHTML = '<div class="jam-grid-status">No entries yet.</div>';
      return;
    }
    entries.forEach(function (entry) {
      var card = document.createElement('div');
      card.className = 'creation-card';

      var thumb = document.createElement('div');
      thumb.className = 'creation-thumb';
      var img = document.createElement('img');
      img.src = entry.gifUrl;
      img.alt = entry.gifAlt;
      img.loading = 'lazy';
      thumb.appendChild(img);

      var titleEl = document.createElement('div');
      titleEl.className = 'creation-title';
      titleEl.textContent = entry.title;

      var moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'detail-btn';
      moreBtn.textContent = 'View full breakdown \u2192';
      moreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openCreationModal(entry);
      });

      card.appendChild(thumb);
      card.appendChild(titleEl);
      card.appendChild(moreBtn);
      card.addEventListener('click', function () { openCreationModal(entry); });

      grid.appendChild(card);
    });
  }

  // ---------- popup modal ----------

  var overlay, imgEl, titleEl, bodyEl, closeBtn, lastFocused;

  function wireModal() {
    overlay = document.getElementById('creation-modal-overlay');
    imgEl = document.getElementById('creation-modal-img');
    titleEl = document.getElementById('creation-modal-title');
    bodyEl = document.getElementById('creation-modal-body');
    closeBtn = document.getElementById('creation-modal-close');
    if (!overlay || overlay.dataset.wired) return;
    overlay.dataset.wired = 'true';

    closeBtn.addEventListener('click', closeCreationModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCreationModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeCreationModal();
    });
  }

  function openCreationModal(entry) {
    imgEl.src = entry.gifUrl;
    imgEl.alt = entry.gifAlt;
    titleEl.textContent = entry.title;
    var extra = entry.popupHtml || '';
    if (entry.linkUrl) {
      extra += '<p><a href="' + entry.linkUrl + '" target="_blank" rel="noopener">' + entry.linkText + ' \u2192</a></p>';
    }
    bodyEl.innerHTML = extra;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    lastFocused = document.activeElement;
    closeBtn.focus();
  }

  function closeCreationModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
};
