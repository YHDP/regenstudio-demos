// source-layer.js — Source transparency overlay
// When active, shows source citation badges on data elements.
// Hover/click badges to see source details.

(function () {
  'use strict';

  var isActive = false;
  var tooltipEl = null;
  var sources = null; // loaded from window._cprSources

  var STATUS_ICONS = {
    '\u2605': 'Human-verified',
    '\u2713': 'Agent-read',
    '\u25cb': 'Referenced',
    '?': 'Unverified'
  };

  /**
   * Initialize the source layer toggle.
   * @param {HTMLElement} toggleBtn — button to toggle sources on/off
   */
  window.initSourceLayer = function (toggleBtn) {
    if (!toggleBtn) return;

    // Create tooltip element
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'src-tooltip';
    tooltipEl.setAttribute('hidden', '');
    document.body.appendChild(tooltipEl);

    // Toggle click
    toggleBtn.addEventListener('click', function () {
      isActive = !isActive;
      toggleBtn.classList.toggle('src-toggle--active', isActive);
      toggleBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      if (isActive) {
        sources = window._cprSources || {};
        injectSourceBadges();
      } else {
        removeSourceBadges();
        hideTooltip();
      }
    });

    // Global click to dismiss tooltip
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.src-badge') && !e.target.closest('.src-tooltip')) {
        hideTooltip();
      }
    });

    // Escape to dismiss
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideTooltip();
    });
  };

  /**
   * Refresh source badges (call after rendering new content).
   */
  window.refreshSourceBadges = function () {
    if (!isActive) return;
    sources = window._cprSources || {};
    injectSourceBadges();
  };

  // ---------- INJECT BADGES ----------

  function injectSourceBadges() {
    // Remove existing badges first
    removeSourceBadges();

    if (!sources) return;

    // Find elements with data-sources attribute
    var els = document.querySelectorAll('[data-sources]');
    els.forEach(function (el) {
      var srcAttr = el.getAttribute('data-sources');
      if (!srcAttr) return;

      var srcIds = srcAttr.split(',').map(function (s) { return s.trim(); });
      if (srcIds.length === 0) return;

      var badge = document.createElement('span');
      badge.className = 'src-badge';
      badge.setAttribute('data-src-ids', srcIds.join(','));
      badge.setAttribute('tabindex', '0');
      badge.setAttribute('role', 'button');
      badge.setAttribute('aria-label', srcIds.length + ' source' + (srcIds.length > 1 ? 's' : ''));

      // Count by verification status
      var verified = 0;
      var read = 0;
      var unverified = 0;
      srcIds.forEach(function (id) {
        var src = sources[id];
        if (!src) { unverified++; return; }
        if (src.status === '\u2605') verified++;
        else if (src.status === '\u2713') read++;
        else unverified++;
      });

      // Badge text and color
      var badgeClass = verified > 0 ? 'src-badge--verified' :
        read > 0 ? 'src-badge--read' : 'src-badge--unverified';
      badge.classList.add(badgeClass);
      badge.textContent = '[' + srcIds.length + ']';

      // Click handler
      badge.addEventListener('click', function (e) {
        e.stopPropagation();
        showTooltip(badge, srcIds);
      });

      // Keyboard
      badge.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showTooltip(badge, srcIds);
        }
      });

      // Insert badge after the element or at end
      el.appendChild(badge);
    });

    // Also look for inline [S#] references in text
    injectInlineSourceBadges();
  }

  function injectInlineSourceBadges() {
    // Find elements that might contain source references like [S40]
    var containers = [
      document.getElementById('convDppOutlook'),
      document.getElementById('convContentSections'),
      document.getElementById('convExpansion'),
      document.getElementById('sysDashContainer')
    ];

    containers.forEach(function (container) {
      if (!container) return;

      var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
      var textNodes = [];
      var node;
      while (node = walker.nextNode()) {
        if (/\[S\d+\]/.test(node.textContent)) {
          textNodes.push(node);
        }
      }

      textNodes.forEach(function (tn) {
        var html = tn.textContent.replace(/\[(S\d+)\]/g, function (match, srcId) {
          var src = sources[srcId];
          var cls = 'src-inline';
          if (src) {
            if (src.status === '\u2605') cls += ' src-inline--verified';
            else if (src.status === '\u2713') cls += ' src-inline--read';
          }
          return '<span class="' + cls + '" data-src-id="' + srcId + '" tabindex="0" role="button">[' + srcId + ']</span>';
        });

        var span = document.createElement('span');
        span.innerHTML = html;

        // Add click handlers
        span.querySelectorAll('.src-inline').forEach(function (inl) {
          inl.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = inl.getAttribute('data-src-id');
            showTooltip(inl, [id]);
          });
        });

        tn.parentNode.replaceChild(span, tn);
      });
    });
  }

  function removeSourceBadges() {
    // Remove appended badges
    var badges = document.querySelectorAll('.src-badge');
    badges.forEach(function (b) { b.parentNode.removeChild(b); });

    // Remove inline source wraps (replace with text)
    var inlines = document.querySelectorAll('.src-inline');
    inlines.forEach(function (inl) {
      var text = document.createTextNode(inl.textContent);
      inl.parentNode.replaceChild(text, inl);
    });
  }

  // ---------- TOOLTIP ----------

  function showTooltip(anchorEl, srcIds) {
    if (!tooltipEl) return;

    var html = '<div class="src-tooltip__inner">';
    html += '<div class="src-tooltip__header">' + srcIds.length + ' source' + (srcIds.length > 1 ? 's' : '') + '</div>';

    srcIds.forEach(function (id) {
      var src = sources[id];
      html += '<div class="src-tooltip__item">';
      html += '<span class="src-tooltip__id">' + esc(id) + '</span>';

      if (src) {
        var statusIcon = src.status || '?';
        var statusLabel = STATUS_ICONS[statusIcon] || 'Unknown';
        html += '<span class="src-tooltip__status">' + statusIcon + ' ' + esc(statusLabel) + '</span>';
        html += '<span class="src-tooltip__title">' + esc(src.title || '') + '</span>';
        if (src.date) {
          html += '<span class="src-tooltip__date">' + esc(src.date) + '</span>';
        }
      } else {
        html += '<span class="src-tooltip__status">? Not in registry</span>';
      }

      html += '</div>';
    });

    html += '</div>';

    tooltipEl.innerHTML = html;
    tooltipEl.removeAttribute('hidden');

    // Position near anchor
    var rect = anchorEl.getBoundingClientRect();
    var ttWidth = 320;
    var left = rect.left + rect.width / 2 - ttWidth / 2;
    if (left < 8) left = 8;
    if (left + ttWidth > window.innerWidth - 8) left = window.innerWidth - ttWidth - 8;

    var top = rect.bottom + 6;
    // If would go below viewport, show above
    tooltipEl.style.width = ttWidth + 'px';
    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';

    // Check if tooltip goes below viewport
    var ttRect = tooltipEl.getBoundingClientRect();
    if (ttRect.bottom > window.innerHeight - 8) {
      tooltipEl.style.top = (rect.top - ttRect.height - 6) + 'px';
    }
  }

  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.setAttribute('hidden', '');
    }
  }

  // ---------- UTIL ----------
  function esc(str) {
    if (str === undefined || str === null) return '';
    var el = document.createElement('span');
    el.textContent = String(str);
    return el.innerHTML;
  }
})();
