// Called by main.js once sections/jams.html has been fetched and inserted.
// Reads GameJams&Extras/manifest.txt, fetches each listed entry file,
// parses it, sorts newest-first by the date in its filename, and renders
// cards + a click-through popup for each one.
window.initJamsSection = function () {
  var grid = document.getElementById('jams-grid');
  if (!grid || grid.dataset.wired) return;
  grid.dataset.wired = 'true';

  var BASE = 'GameJams&Extras/';

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
                console.warn('[jams] skipping ' + filename + ': ' + err.message);
                return null;
              });
          })
        );
      })
      .then(function (entries) {
        if (!entries) return; // "no entries yet" case already handled above
        entries = entries.filter(Boolean).sort(function (a, b) { return b.sortDate - a.sortDate; });
        renderCards(entries);
      })
      .catch(function (err) {
        console.error('[jams] could not load manifest:', err);
        grid.innerHTML = '<div class="jam-grid-status">Couldn\'t load game jam entries.</div>';
      });
  }

  function parseEntry(filename, text) {
    var dateMatch = filename.match(/^(\d{4})-(\d{2})_/);
    if (!dateMatch) throw new Error('filename must start with YYYY-MM_');
    var sortDate = Date.UTC(+dateMatch[1], +dateMatch[2] - 1, 1);
    if (isNaN(sortDate)) throw new Error('invalid date in filename');

    var markerIndex = text.indexOf('===POPUP===');
    var headerText = markerIndex >= 0 ? text.slice(0, markerIndex) : text;
    var popupRaw = markerIndex >= 0 ? text.slice(markerIndex + '===POPUP==='.length) : '';

    var fields = {};
    headerText.split(/\r?\n/).forEach(function (line) {
      var m = line.match(/^([A-Z_]+):\s*(.*)$/);
      if (m) fields[m[1]] = m[2].trim();
    });

    if (!fields.TITLE || !fields.DATE_LABEL || !fields.BLURB) {
      throw new Error('missing TITLE, DATE_LABEL, or BLURB');
    }

    var mediaUrl = fields.MEDIA_URL ? resolveUrl(fields.MEDIA_URL) : '';
    var mediaType = /\.(mp4|webm|mov)$/i.test(mediaUrl) ? 'video' : 'image';

    return {
      filename: filename,
      sortDate: sortDate,
      title: fields.TITLE,
      dateLabel: fields.DATE_LABEL,
      blurb: fields.BLURB,
      linkText: fields.LINK_TEXT || (fields.LINK_URL ? 'View entry' : ''),
      linkUrl: fields.LINK_URL || '',
      mediaUrl: mediaUrl,
      mediaAlt: fields.MEDIA_ALT || fields.TITLE,
      mediaType: mediaType,
      popupHtml: renderMiniMarkdown(popupRaw.trim()) || '<p>' + escapeHtml(fields.BLURB) + '</p>',
    };
  }

  // ---------- tiny markdown-ish renderer for popup bodies ----------

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
    var mode = 'none'; // 'none' | 'para' | 'list' — tracks what a wrapped continuation line belongs to

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
      // Plain continuation line: a wrapped bullet keeps extending the
      // current list item; otherwise it's part of the current paragraph.
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
      card.className = 'jam-card creation-card';

      if (entry.mediaUrl) {
        // Media present: image/video first, full-bleed, with the date
        // badged over the top-left corner of it. Title sits below —
        // same .creation-thumb / .creation-title rules Previous
        // Creations uses, so the two sections stay visually identical
        // apart from this date.
        var thumb = document.createElement('div');
        thumb.className = 'creation-thumb';

        var mediaEl;
        if (entry.mediaType === 'video') {
          mediaEl = document.createElement('video');
          mediaEl.src = entry.mediaUrl;
          mediaEl.muted = true;
          mediaEl.loop = true;
          mediaEl.autoplay = true;
          mediaEl.playsInline = true;
        } else {
          mediaEl = document.createElement('img');
          mediaEl.src = entry.mediaUrl;
          mediaEl.alt = entry.mediaAlt;
          mediaEl.loading = 'lazy';
        }
        thumb.appendChild(mediaEl);

        var badge = document.createElement('div');
        badge.className = 'jam-date jam-date-badge';
        badge.textContent = entry.dateLabel;
        thumb.appendChild(badge);

        card.appendChild(thumb);

        var titleEl1 = document.createElement('div');
        titleEl1.className = 'creation-title';
        titleEl1.textContent = entry.title;
        card.appendChild(titleEl1);
      } else {
        // No media: the date sits where the thumb would, then the title
        // follows using the same .creation-title rule as everywhere else.
        var dateEl = document.createElement('div');
        dateEl.className = 'jam-date jam-date-standalone';
        dateEl.textContent = entry.dateLabel;
        card.appendChild(dateEl);

        var titleEl2 = document.createElement('div');
        titleEl2.className = 'creation-title';
        titleEl2.textContent = entry.title;
        card.appendChild(titleEl2);
      }

      var moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'detail-btn';
      moreBtn.textContent = 'View full breakdown \u2192';
      moreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openJamModal(entry);
      });
      card.appendChild(moreBtn);

      // Whole card is clickable too — clicking anywhere except the button
      // (or video controls, if present) opens the same popup.
      card.addEventListener('click', function (e) {
        if (e.target.closest('a, button, video')) return;
        openJamModal(entry);
      });

      grid.appendChild(card);
    });
  }

  // ---------- popup modal ----------

  var overlay, titleEl, metaEl, bodyEl, closeBtn, lastFocused;

  function wireModal() {
    overlay = document.getElementById('jam-modal-overlay');
    titleEl = document.getElementById('jam-modal-title');
    metaEl = document.getElementById('jam-modal-meta');
    bodyEl = document.getElementById('jam-modal-body');
    closeBtn = document.getElementById('jam-modal-close');
    if (!overlay || overlay.dataset.wired) return;
    overlay.dataset.wired = 'true';

    closeBtn.addEventListener('click', closeJamModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeJamModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeJamModal();
    });
  }

  function openJamModal(entry) {
    titleEl.textContent = entry.title;
    metaEl.textContent = entry.dateLabel;
    bodyEl.innerHTML = entry.popupHtml;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    lastFocused = document.activeElement;
    closeBtn.focus();
  }

  function closeJamModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
};
