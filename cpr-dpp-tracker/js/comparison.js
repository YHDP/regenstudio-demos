// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
// comparison.js — Side-by-side family comparison view
// Select 2-3 families from the card grid, compare their convergence data.
// Shareable via URL hash: #compare=PCR,SMP,CEM

(function () {
  'use strict';

  var MAX_COMPARE = 3;

  var CERTAINTY_LABELS = {
    green: 'Confirmed', 'yellow-green': 'Scheduled', amber: 'Estimated',
    orange: 'Moderate confidence', 'red-orange': 'Speculative', red: 'Speculative', gray: 'Unknown'
  };

  var CERTAINTY_ORDER = { green: 0, 'yellow-green': 1, amber: 2, orange: 3, 'red-orange': 4, red: 5, gray: 6 };

  var PIPELINE_LABELS = {
    A: 'New-CPR hEN', B: 'Old-CPR Fast-Track', C: 'Old EAD Sunset',
    D: 'New EAD Future', E: 'ESPR Supplementary'
  };

  var PIPELINE_COLORS = {
    A: '#009BBB', B: '#f59e0b', C: '#94a3b8', D: '#6366f1', E: '#10b981'
  };

  // ---------- STATE ----------
  var selected = []; // array of family letters
  var compareBarEl = null;
  var compareViewEl = null;

  /**
   * Initialize comparison mode.
   * Adds selection checkboxes to cards and a floating comparison bar.
   * @param {HTMLElement} gridEl — the card grid container
   * @param {HTMLElement} compareContainer — element to render comparison view into
   * @param {Array} allFamilies — full families array
   * @param {Object} systemTimeline — system timeline data
   * @param {Function} openConvergence — function(fam) to open convergence view
   */
  window.initComparison = function (gridEl, compareContainer, allFamilies, systemTimeline, openConvergence) {
    compareViewEl = compareContainer;

    // Create floating comparison bar
    compareBarEl = document.createElement('div');
    compareBarEl.className = 'compare-bar';
    compareBarEl.setAttribute('hidden', '');
    compareBarEl.innerHTML = '<div class="compare-bar__inner">' +
      '<span class="compare-bar__count"></span>' +
      '<div class="compare-bar__pills"></div>' +
      '<button class="compare-bar__btn" id="compareBtn">Compare</button>' +
      '<button class="compare-bar__clear" id="compareClear">\u00d7</button>' +
      '</div>';
    document.body.appendChild(compareBarEl);

    // Compare button click
    document.getElementById('compareBtn').addEventListener('click', function () {
      if (selected.length < 2) return;
      var fams = [];
      selected.forEach(function (letter) {
        var fam = allFamilies.find(function (f) { return f.letter === letter; });
        if (fam) fams.push(fam);
      });
      if (fams.length >= 2) {
        renderComparison(compareContainer, fams, systemTimeline, openConvergence);
        window.location.hash = 'compare=' + selected.join(',');
      }
    });

    // Clear button
    document.getElementById('compareClear').addEventListener('click', function () {
      clearSelection(gridEl);
    });

    // Add click handler for selection checkboxes
    gridEl.addEventListener('click', function (e) {
      var cb = e.target.closest('.cpr-card__compare-cb');
      if (!cb) return;
      e.stopPropagation(); // prevent card click from opening convergence view

      var card = cb.closest('.cpr-card');
      if (!card) return;
      var letter = card.getAttribute('data-letter');
      if (!letter) return;

      var idx = selected.indexOf(letter);
      if (idx !== -1) {
        // Deselect
        selected.splice(idx, 1);
        card.classList.remove('cpr-card--selected');
        cb.setAttribute('aria-checked', 'false');
      } else {
        if (selected.length >= MAX_COMPARE) return; // max reached
        selected.push(letter);
        card.classList.add('cpr-card--selected');
        cb.setAttribute('aria-checked', 'true');
      }

      updateCompareBar(allFamilies);
    });

    // Check for deep-link: #compare=PCR,SMP
    var hash = window.location.hash.replace(/^#/, '');
    if (hash.indexOf('compare=') === 0) {
      var letters = hash.substring(8).split(',');
      letters.forEach(function (l) {
        var letter = l.trim().toUpperCase();
        if (letter && selected.indexOf(letter) === -1 && selected.length < MAX_COMPARE) {
          var fam = allFamilies.find(function (f) { return f.letter === letter; });
          if (fam) selected.push(letter);
        }
      });
      if (selected.length >= 2) {
        // Auto-open comparison
        var fams = [];
        selected.forEach(function (letter) {
          var fam = allFamilies.find(function (f) { return f.letter === letter; });
          if (fam) fams.push(fam);
        });
        updateCompareBar(allFamilies);
        renderComparison(compareContainer, fams, systemTimeline, openConvergence);
      }
    }
  };

  /**
   * Add compare checkboxes to all cards in the grid.
   * Called after renderGrid to inject the UI.
   */
  window.addCompareCheckboxes = function (gridEl) {
    var cards = gridEl.querySelectorAll('.cpr-card');
    cards.forEach(function (card) {
      // Don't add if already present
      if (card.querySelector('.cpr-card__compare-cb')) return;

      var letter = card.getAttribute('data-letter');
      var isSelected = selected.indexOf(letter) !== -1;

      var cb = document.createElement('button');
      cb.className = 'cpr-card__compare-cb';
      cb.setAttribute('role', 'checkbox');
      cb.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      cb.setAttribute('aria-label', 'Select for comparison');
      cb.setAttribute('title', 'Compare');
      cb.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14"><rect x="1" y="1" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
        (isSelected ? '<polyline points="4 8 7 11 12 5" fill="none" stroke="currentColor" stroke-width="2"/>' : '') +
        '</svg>';

      if (isSelected) card.classList.add('cpr-card--selected');
      card.appendChild(cb);
    });
  };

  /**
   * Close comparison view and return to grid.
   */
  window.closeComparison = function () {
    if (compareViewEl) {
      compareViewEl.setAttribute('hidden', '');
      compareViewEl.innerHTML = '';
    }

    // Restore page sections
    var hero = document.querySelector('.tracker-hero');
    var sysDash = document.getElementById('sysDashSection');
    var disclaimer = document.querySelector('.tracker-disclaimer');
    var landing = document.querySelector('.tracker-landing');
    var filterBarEl = document.getElementById('filterBar');
    var gridContainer = document.querySelector('.tracker-container');

    if (hero) hero.style.display = '';
    if (sysDash) sysDash.style.display = '';
    if (disclaimer) disclaimer.style.display = '';
    if (landing) landing.style.display = '';
    if (filterBarEl) filterBarEl.style.display = '';
    if (gridContainer) gridContainer.style.display = '';

    // Clear hash
    if (window.location.hash.indexOf('compare=') !== -1) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // ---------- INTERNAL ----------

  function clearSelection(gridEl) {
    selected = [];
    var cards = gridEl.querySelectorAll('.cpr-card--selected');
    cards.forEach(function (c) { c.classList.remove('cpr-card--selected'); });
    var cbs = gridEl.querySelectorAll('.cpr-card__compare-cb');
    cbs.forEach(function (cb) {
      cb.setAttribute('aria-checked', 'false');
      cb.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14"><rect x="1" y="1" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
    });
    updateCompareBar([]);

    // Close comparison view if open
    if (compareViewEl && !compareViewEl.hasAttribute('hidden')) {
      window.closeComparison();
    }
  }

  function updateCompareBar(allFamilies) {
    if (!compareBarEl) return;

    if (selected.length === 0) {
      compareBarEl.setAttribute('hidden', '');
      return;
    }

    compareBarEl.removeAttribute('hidden');

    var countEl = compareBarEl.querySelector('.compare-bar__count');
    countEl.textContent = selected.length + '/' + MAX_COMPARE + ' selected';

    var pillsEl = compareBarEl.querySelector('.compare-bar__pills');
    var pillsHtml = '';
    selected.forEach(function (letter) {
      var fam = allFamilies.find(function (f) { return f.letter === letter; });
      var name = fam ? (fam.display_name || fam.letter) : letter;
      pillsHtml += '<span class="compare-bar__pill">' + esc(letter) + '</span>';
    });
    pillsEl.innerHTML = pillsHtml;

    var btn = compareBarEl.querySelector('.compare-bar__btn');
    if (selected.length < 2) {
      btn.setAttribute('disabled', '');
      btn.textContent = 'Select ' + (2 - selected.length) + ' more';
    } else {
      btn.removeAttribute('disabled');
      btn.textContent = 'Compare';
    }
  }

  // ---------- RENDER COMPARISON VIEW ----------
  function renderComparison(container, fams, sysTimeline, openConvergence) {
    // Hide page sections
    var hero = document.querySelector('.tracker-hero');
    var sysDash = document.getElementById('sysDashSection');
    var disclaimer = document.querySelector('.tracker-disclaimer');
    var landing = document.querySelector('.tracker-landing');
    var filterBarEl = document.getElementById('filterBar');
    var gridContainer = document.querySelector('.tracker-container');

    if (hero) hero.style.display = 'none';
    if (sysDash) sysDash.style.display = 'none';
    if (disclaimer) disclaimer.style.display = 'none';
    if (landing) landing.style.display = 'none';
    if (filterBarEl) filterBarEl.style.display = 'none';
    if (gridContainer) gridContainer.style.display = 'none';

    var html = '<div class="compare">';

    // Header
    html += '<div class="compare__header">';
    html += '<h2 class="compare__title">Family Comparison</h2>';
    html += '<button class="compare__close" id="compareClose">\u00d7 Back to grid</button>';
    html += '</div>';

    // Summary table
    html += '<div class="compare__table-wrap">';
    html += '<table class="compare__table">';

    // Header row
    html += '<thead><tr><th class="compare__row-label"></th>';
    fams.forEach(function (fam) {
      html += '<th class="compare__col-header">';
      if (fam.icon) html += '<img class="compare__icon" src="Images/' + fam.icon + '" alt="">';
      html += '<span class="compare__col-name">' + esc(fam.display_name || fam.full_name || '') + '</span>';
      html += '<span class="compare__col-letter">' + esc(fam.letter || '') + '</span>';
      html += '</th>';
    });
    html += '</tr></thead>';

    // Body rows
    html += '<tbody>';

    // Row: Family number
    html += buildRow('Family', fams, function (f) {
      return 'Annex VII #' + (f.family || '?');
    });

    // Row: TC
    html += buildRow('Technical Committee', fams, function (f) {
      return f.tc || '-';
    });

    // Row: DPP date
    html += buildRow('DPP Obligation Date', fams, function (f) {
      var conv = f.convergence;
      if (!conv || !conv.dpp_date) return '<span style="color:#94a3b8;">TBD</span>';
      return '<strong>' + esc(conv.dpp_date) + '</strong>';
    }, true);

    // Row: Certainty
    html += buildRow('Certainty', fams, function (f) {
      var conv = f.convergence;
      var cert = (conv && conv.dpp_certainty) || 'gray';
      return '<span class="compare__cert-dot compare__cert-dot--' + cert + '"></span> ' +
        esc(CERTAINTY_LABELS[cert] || cert);
    }, true);

    // Row: Binding constraint
    html += buildRow('Binding Constraint', fams, function (f) {
      var conv = f.convergence;
      var binding = (conv && conv.binding_constraint) || 'unknown';
      var label = binding === 'product' ? 'Product' : binding === 'system' ? 'System' : 'Unknown';
      var cls = binding === 'product' ? 'product' : binding === 'system' ? 'system' : 'unknown';
      return '<span class="compare__binding compare__binding--' + cls + '">' + esc(label) + '</span>';
    }, true);

    // Row: Active pipelines
    html += buildRow('Active Pipelines', fams, function (f) {
      var pipes = f.active_pipelines || [];
      if (pipes.length === 0) return '<span style="color:#94a3b8;">None</span>';
      return pipes.map(function (p) {
        var color = PIPELINE_COLORS[p] || '#94a3b8';
        return '<span class="compare__pipe-badge" style="background:' + color + ';">' + p + '</span>';
      }).join(' ');
    }, true);

    // Row: Future pipelines
    html += buildRow('Future Pipelines', fams, function (f) {
      var pipes = f.future_pipelines || [];
      if (pipes.length === 0) return '<span style="color:#94a3b8;">None</span>';
      return pipes.map(function (p) {
        var color = PIPELINE_COLORS[p] || '#94a3b8';
        return '<span class="compare__pipe-badge compare__pipe-badge--future" style="border-color:' + color + ';color:' + color + ';">' + p + '</span>';
      }).join(' ');
    }, true);

    // Row: Standards count
    html += buildRow('Standards', fams, function (f) {
      var stds = f.standards || [];
      var henCount = 0;
      var eadCount = 0;
      stds.forEach(function (s) {
        if (s.type === 'EAD') eadCount++;
        else henCount++;
      });
      var parts = [];
      if (henCount > 0) parts.push(henCount + ' hEN');
      if (eadCount > 0) parts.push(eadCount + ' EAD');
      return parts.length > 0 ? parts.join(', ') : '-';
    });

    // Row: Formula
    html += buildRow('Formula', fams, function (f) {
      var conv = f.convergence;
      return (conv && conv.formula_note) ? '<span class="compare__formula">' + esc(conv.formula_note) + '</span>' : '-';
    }, true);

    html += '</tbody>';
    html += '</table>';
    html += '</div>'; // table-wrap

    // Per-family deep-dive links
    html += '<div class="compare__actions">';
    fams.forEach(function (fam) {
      html += '<button class="compare__view-btn" data-letter="' + esc(fam.letter) + '">';
      html += 'View ' + esc(fam.letter) + ' details \u2192';
      html += '</button>';
    });
    html += '</div>';

    // Highlight differences
    html += buildDiffSection(fams, sysTimeline);

    html += '</div>'; // compare

    container.innerHTML = html;
    container.removeAttribute('hidden');
    window.scrollTo(0, 0);

    // Events
    document.getElementById('compareClose').addEventListener('click', function () {
      window.closeComparison();
    });

    // View detail buttons
    container.querySelectorAll('.compare__view-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var letter = btn.getAttribute('data-letter');
        window.closeComparison();
        if (openConvergence) {
          // Find family and open convergence view
          var fam = fams.find(function (f) { return f.letter === letter; });
          if (fam) openConvergence(fam);
        }
      });
    });
  }

  // ---------- TABLE HELPERS ----------

  function buildRow(label, fams, cellFn, isHtml) {
    var html = '<tr>';
    html += '<td class="compare__row-label">' + esc(label) + '</td>';
    fams.forEach(function (fam) {
      var val = cellFn(fam);
      html += '<td class="compare__cell">';
      html += isHtml ? val : esc(val);
      html += '</td>';
    });
    html += '</tr>';
    return html;
  }

  // ---------- DIFF HIGHLIGHTS ----------

  function buildDiffSection(fams, sysTimeline) {
    var diffs = [];

    // Check if binding constraints differ
    var bindings = fams.map(function (f) { return f.convergence && f.convergence.binding_constraint; });
    var uniqueBindings = [];
    bindings.forEach(function (b) { if (uniqueBindings.indexOf(b) === -1) uniqueBindings.push(b); });
    if (uniqueBindings.length > 1) {
      diffs.push('Different binding constraints: ' + fams.map(function (f) {
        var b = f.convergence && f.convergence.binding_constraint;
        return f.letter + ' = ' + (b || 'unknown');
      }).join(', '));
    }

    // Check if certainty levels differ
    var certs = fams.map(function (f) { return (f.convergence && f.convergence.dpp_certainty) || 'gray'; });
    var uniqueCerts = [];
    certs.forEach(function (c) { if (uniqueCerts.indexOf(c) === -1) uniqueCerts.push(c); });
    if (uniqueCerts.length > 1) {
      // Sort by certainty order to identify most/least certain
      var sorted = fams.slice().sort(function (a, b) {
        var ca = (a.convergence && a.convergence.dpp_certainty) || 'gray';
        var cb = (b.convergence && b.convergence.dpp_certainty) || 'gray';
        return (CERTAINTY_ORDER[ca] || 9) - (CERTAINTY_ORDER[cb] || 9);
      });
      diffs.push('Most certain: ' + sorted[0].letter + ' (' + CERTAINTY_LABELS[(sorted[0].convergence && sorted[0].convergence.dpp_certainty) || 'gray'] + ')');
    }

    // Check if pipelines differ
    var pipeStrings = fams.map(function (f) { return (f.active_pipelines || []).join(','); });
    var uniquePipes = [];
    pipeStrings.forEach(function (p) { if (uniquePipes.indexOf(p) === -1) uniquePipes.push(p); });
    if (uniquePipes.length > 1) {
      diffs.push('Different active pipelines: ' + fams.map(function (f) {
        return f.letter + ' = [' + (f.active_pipelines || []).join(',') + ']';
      }).join(', '));
    }

    if (diffs.length === 0) return '';

    var html = '<div class="compare__diffs">';
    html += '<div class="compare__diffs-title">Key Differences</div>';
    html += '<ul class="compare__diffs-list">';
    diffs.forEach(function (d) {
      html += '<li>' + esc(d) + '</li>';
    });
    html += '</ul>';
    html += '</div>';
    return html;
  }

  // ---------- UTIL ----------
  function esc(str) {
    if (str === undefined || str === null) return '';
    var el = document.createElement('span');
    el.textContent = String(str);
    return el.innerHTML;
  }
})();
