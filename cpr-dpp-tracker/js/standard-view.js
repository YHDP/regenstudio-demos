/* ==========================================================================
   Standard Detail View — js/standard-view.js
   Loads families-v2.json, finds the requested standard by hash params,
   and renders a full detail page with DPP status, metadata, and content.
   ========================================================================== */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // URL parsing
  // ---------------------------------------------------------------------------
  function parseHash() {
    var hash = window.location.hash.replace(/^#/, '');
    var params = {};
    hash.split('&').forEach(function (part) {
      var kv = part.split('=');
      if (kv.length === 2) params[kv[0]] = decodeURIComponent(kv[1]);
    });
    return params;
  }

  // ---------------------------------------------------------------------------
  // Data lookup
  // ---------------------------------------------------------------------------
  function findFamilyAndStandard(data, familyLetter, stdId) {
    var family = null;
    var standard = null;

    for (var i = 0; i < data.families.length; i++) {
      var fam = data.families[i];
      if (familyLetter && fam.letter !== familyLetter) continue;

      for (var j = 0; j < (fam.standards || []).length; j++) {
        var s = fam.standards[j];
        if (s.id === stdId) {
          family = fam;
          standard = s;
          return { family: family, standard: standard };
        }
      }
    }

    // Fallback: search all families if letter didn't match
    if (familyLetter) {
      return findFamilyAndStandard(data, null, stdId);
    }

    return { family: null, standard: null };
  }

  // ---------------------------------------------------------------------------
  // Certainty helpers
  // ---------------------------------------------------------------------------
  var CERTAINTY_LABELS = {
    green: 'Confirmed',
    'yellow-green': 'Likely',
    amber: 'Estimated',
    orange: 'Uncertain',
    'red-orange': 'Speculative',
    red: 'Speculative',
    gray: 'Unknown'
  };

  var CERTAINTY_COLORS = {
    green: 'var(--cert-green)',
    'yellow-green': 'var(--cert-yellow-green)',
    amber: 'var(--cert-amber)',
    orange: 'var(--cert-orange)',
    'red-orange': 'var(--cert-red-orange)',
    red: 'var(--cert-red)',
    gray: 'var(--cert-gray)'
  };

  function guessCertainty(std, family) {
    if (std.dpp_est && std.dpp_est !== 'TBD') {
      // If there's a concrete date, look at pipeline convergence
      var pipelines = family.pipelines || {};
      for (var key in pipelines) {
        var nodes = pipelines[key].nodes || [];
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].type === 'NT-10' || nodes[i].type === 'NT-C4') {
            return nodes[i].certainty || 'amber';
          }
        }
      }
      return 'amber';
    }
    return 'gray';
  }

  // ---------------------------------------------------------------------------
  // Escape HTML
  // ---------------------------------------------------------------------------
  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ---------------------------------------------------------------------------
  // Render: Not Found
  // ---------------------------------------------------------------------------
  function renderNotFound(container, stdId) {
    container.innerHTML =
      '<div class="std-not-found">' +
        '<div class="std-not-found__title">Standard not found</div>' +
        '<p class="std-not-found__text">' +
          (stdId ? 'Could not find <strong>' + esc(stdId) + '</strong> in the tracker data.' : 'No standard specified in the URL.') +
          '<br>Use the format: <code>standard.html#std=EN+197-1&amp;family=CEM</code>' +
        '</p>' +
        '<a href="index.html" class="std-not-found__link">Back to Tracker</a>' +
      '</div>';
  }

  // ---------------------------------------------------------------------------
  // Render: Breadcrumb
  // ---------------------------------------------------------------------------
  function renderBreadcrumb(family, std) {
    return (
      '<nav class="std-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="index.html">Tracker</a>' +
        '<span class="std-breadcrumb__sep">/</span>' +
        '<a href="index.html#family=' + esc(family.letter) + '">' + esc(family.name) + '</a>' +
        '<span class="std-breadcrumb__sep">/</span>' +
        '<span class="std-breadcrumb__current">' + esc(std.id) + '</span>' +
      '</nav>'
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Header
  // ---------------------------------------------------------------------------
  function renderHeader(family, std) {
    var isEAD = (std.type || '').toUpperCase() === 'EAD';
    var typeClass = isEAD ? 'std-badge--ead' : 'std-badge--hen';
    var typeLabel = isEAD ? 'EAD' : 'hEN';

    var badges = '<span class="std-badge ' + typeClass + '">' + typeLabel + '</span>';
    badges += '<a href="index.html#family=' + esc(family.letter) + '" class="std-badge std-badge--family">' + esc(family.letter) + ' \u2014 ' + esc(family.name) + '</a>';

    if (std.avcp) {
      badges += '<span class="std-badge std-badge--avcp">AVCP ' + esc(std.avcp) + '</span>';
    }
    if (std.tc_wg) {
      badges += '<span class="std-badge std-badge--tc">' + esc(std.tc_wg) + '</span>';
    }

    var citedClass = std.cited ? 'std-badge--cited' : 'std-badge--not-cited';
    var citedLabel = std.cited ? 'OJ Cited' : 'Not Cited';
    badges += '<span class="std-badge ' + citedClass + '">' + citedLabel + '</span>';

    // Regime: hENs are all old-CPR (305/2011) currently; EADs have explicit regime field
    var regime = std.regime || 'old';
    var regimeClass = regime === 'new' ? 'std-badge--regime-new' : 'std-badge--regime-old';
    var regimeLabel = regime === 'new' ? 'New CPR 2024/3110' : 'CPR 305/2011';
    badges += '<span class="std-badge ' + regimeClass + '">' + regimeLabel + '</span>';

    var iconSrc = family.icon
      ? 'Images/' + family.icon
      : 'Images/default.svg';

    return (
      '<div class="std-header">' +
        '<img class="std-header__icon" src="' + esc(iconSrc) + '" alt="" aria-hidden="true">' +
        '<div class="std-header__text">' +
          '<h1 class="std-header__title">' + esc(std.id) + '</h1>' +
          '<p class="std-header__name">' + esc(std.name || '') + '</p>' +
          '<div class="std-header__badges">' + badges + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ---------------------------------------------------------------------------
  // Render: DPP Status Card
  // ---------------------------------------------------------------------------
  function renderDppCard(std, family) {
    var dppEst = std.dpp_est || family.dpp_range && family.dpp_range.hen_earliest || 'TBD';
    var dppRoute = std.dpp_route || '';
    var certainty = guessCertainty(std, family);
    var certLabel = CERTAINTY_LABELS[certainty] || 'Unknown';
    var certColor = CERTAINTY_COLORS[certainty] || 'var(--cert-gray)';

    var items = '';
    function addItem(label, value) {
      if (!value || value === 'TBD') return;
      items += '<div class="std-dpp-card__item">' +
        '<span class="std-dpp-card__item-label">' + esc(label) + '</span>' +
        '<span class="std-dpp-card__item-value">' + esc(value) + '</span>' +
      '</div>';
    }

    addItem('Delivery', std.delivery);
    addItem('Publication', std.pub_est);
    addItem('Mandatory', std.mand_est);
    addItem('DPP estimate', std.dpp_est);

    var isEAD = (std.type || '').toUpperCase() === 'EAD';
    if (isEAD) {
      addItem('Expires', std.expires);
      if (std.new_ead) addItem('Replacement', std.new_ead);
    }

    return (
      '<div class="std-dpp-card">' +
        '<div class="std-dpp-card__header">' +
          '<span class="std-dpp-card__label">DPP obligation</span>' +
          '<span class="std-dpp-card__certainty">' +
            '<span class="std-dpp-card__certainty-dot" style="background:' + certColor + '"></span>' +
            certLabel +
          '</span>' +
        '</div>' +
        '<div class="std-dpp-card__date">' + esc(dppEst) + '</div>' +
        (dppRoute ? '<div class="std-dpp-card__route">' + esc(dppRoute) + '</div>' : '') +
        (items ? '<div class="std-dpp-card__grid">' + items + '</div>' : '') +
      '</div>'
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Metadata Grid
  // ---------------------------------------------------------------------------
  function renderMetaGrid(std, family) {
    var items = '';
    function addMeta(label, value) {
      if (!value) return;
      items += '<div class="std-meta-item">' +
        '<div class="std-meta-item__label">' + esc(label) + '</div>' +
        '<div class="std-meta-item__value">' + value + '</div>' +
      '</div>';
    }

    var isEAD = (std.type || '').toUpperCase() === 'EAD';

    addMeta('Standard type', isEAD ? 'European Assessment Document (EAD)' : 'Harmonised European Standard (hEN)');
    addMeta('Product family', '<a href="index.html#family=' + esc(family.letter) + '">' + esc(family.letter + ' \u2014 ' + family.name) + '</a>');
    if (std.tc_wg) addMeta('Technical committee', esc(std.tc_wg));
    if (std.avcp) addMeta('AVCP system', 'System ' + esc(std.avcp));

    if (std.stage) addMeta('Development stage', esc(std.stage));
    if (std.revision) addMeta('Regime', esc(std.revision));

    if (isEAD) {
      if (std.expires) addMeta('Validity expires', esc(std.expires));
      if (std.new_ead) addMeta('Replacement EAD', esc(std.new_ead));
    }

    if (std.sreq_table) addMeta('In SReq table', 'Yes');
    if (std.dev_stage) addMeta('Active development', 'Yes');

    if (!items) return '';

    return (
      '<div class="std-section-title">Standard properties</div>' +
      '<div class="std-meta-grid">' + items + '</div>'
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Content sections (collapsible)
  // ---------------------------------------------------------------------------
  var CONTENT_SECTIONS = [
    { key: 'description', label: 'Description', expandDefault: true },
    { key: 'status_narrative', label: 'Current status', expandDefault: true },
    { key: 'regulatory_history', label: 'Regulatory context', expandDefault: false },
    { key: 'dpp_impact', label: 'DPP impact', expandDefault: true },
    { key: 'key_risks', label: 'Key risks', expandDefault: false },
    { key: 'sources', label: 'Sources', expandDefault: false }
  ];

  function renderContentSections(stdContent) {
    if (!stdContent) return '';

    var hasContent = false;
    for (var i = 0; i < CONTENT_SECTIONS.length; i++) {
      if (stdContent[CONTENT_SECTIONS[i].key]) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) return '';

    var html = '<div class="std-section-title">Analysis</div>';

    for (var j = 0; j < CONTENT_SECTIONS.length; j++) {
      var sec = CONTENT_SECTIONS[j];
      var text = stdContent[sec.key];
      if (!text) continue;

      // Format source citations if ContentRenderer is available
      var formatted = text;
      if (window.ContentRenderer && window.ContentRenderer.formatSourceCitations) {
        formatted = window.ContentRenderer.formatSourceCitations(text);
      }

      var expanded = sec.expandDefault;
      html += '<div class="std-content-section">' +
        '<button class="std-content-section__toggle" ' +
          'aria-expanded="' + expanded + '" data-section="' + sec.key + '">' +
          '<span class="std-content-section__icon">' + (expanded ? '\u25be' : '\u25b8') + '</span> ' +
          esc(sec.label) +
        '</button>' +
        '<div class="std-content-section__body"' + (expanded ? '' : ' hidden') + '>' +
          '<p>' + formatted + '</p>' +
        '</div>' +
      '</div>';
    }

    return html;
  }

  // ---------------------------------------------------------------------------
  // Render: Notes
  // ---------------------------------------------------------------------------
  function renderNotes(std) {
    if (!std.notes) return '';
    return (
      '<div class="std-notes">' +
        '<div class="std-notes__label">Notes</div>' +
        esc(std.notes) +
      '</div>'
    );
  }

  // ---------------------------------------------------------------------------
  // Toggle collapsible sections
  // ---------------------------------------------------------------------------
  function attachToggleListeners(container) {
    var toggles = container.querySelectorAll('.std-content-section__toggle');
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener('click', function () {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !expanded);
        var icon = this.querySelector('.std-content-section__icon');
        if (icon) icon.textContent = expanded ? '\u25b8' : '\u25be';
        var body = this.nextElementSibling;
        if (body) {
          if (expanded) {
            body.setAttribute('hidden', '');
          } else {
            body.removeAttribute('hidden');
          }
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Nav scroll shadow (same pattern as tracker.js)
  // ---------------------------------------------------------------------------
  function initNavScroll() {
    var nav = document.getElementById('trackerNav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        nav.classList.add('tracker-nav--scrolled');
      } else {
        nav.classList.remove('tracker-nav--scrolled');
      }
    }, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // Main
  // ---------------------------------------------------------------------------
  function init() {
    initNavScroll();

    var container = document.getElementById('main-content');
    var params = parseHash();

    if (!params.std) {
      renderNotFound(container, null);
      return;
    }

    fetch('data/families-v2.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var result = findFamilyAndStandard(data, params.family, params.std);
        var family = result.family;
        var std = result.standard;

        if (!family || !std) {
          renderNotFound(container, params.std);
          return;
        }

        // Update page title
        document.title = std.id + ' — CPR DPP Tracker — Regen Studio';

        // Build page
        var html = '';
        html += renderBreadcrumb(family, std);
        html += renderHeader(family, std);
        html += renderDppCard(std, family);
        html += renderMetaGrid(std, family);
        html += renderContentSections(std.content);
        html += renderNotes(std);

        container.innerHTML = html;

        // Activate toggles
        attachToggleListeners(container);
      })
      .catch(function (err) {
        container.innerHTML =
          '<div class="std-not-found">' +
            '<div class="std-not-found__title">Error loading data</div>' +
            '<p class="std-not-found__text">' + esc(err.message || 'Unknown error') + '</p>' +
            '<a href="index.html" class="std-not-found__link">Back to Tracker</a>' +
          '</div>';
      });
  }

  // Handle hash changes (e.g., navigating between standards)
  window.addEventListener('hashchange', init);

  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
