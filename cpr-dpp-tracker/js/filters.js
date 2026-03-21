// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
// filters.js — Filter/sort controls for CPR DPP Tracker card grid
// Manages pipeline filter, certainty filter, sort order.
// State persisted in URL hash params.

(function () {
  'use strict';

  // ---------- STATE ----------
  var state = {
    pipelines: {},    // { A: true, B: true, ... } — true = show
    certainties: {},  // { green: true, amber: true, ... } — true = show
    sort: 'dpp'       // 'dpp' | 'family' | 'alpha' | 'certainty' | 'pipeline'
  };

  var ALL_PIPELINES = ['A', 'B', 'C', 'D', 'E'];
  var ALL_CERTAINTIES = ['green', 'yellow-green', 'amber', 'orange', 'red-orange', 'gray'];

  var PIPELINE_LABELS = {
    A: 'New-CPR hEN',
    B: 'Old-CPR Fast-Track',
    C: 'Old EAD Sunset',
    D: 'New EAD Future',
    E: 'ESPR Supplementary'
  };

  var PIPELINE_COLORS = {
    A: '#009BBB',
    B: '#f59e0b',
    C: '#94a3b8',
    D: '#6366f1',
    E: '#10b981'
  };

  var CERTAINTY_LABELS = {
    green: 'Confirmed',
    'yellow-green': 'Scheduled',
    amber: 'Estimated',
    orange: 'Moderate',
    'red-orange': 'Speculative',
    gray: 'Unknown'
  };

  var SORT_OPTIONS = [
    { value: 'dpp', label: 'DPP date (earliest first)' },
    { value: 'family', label: 'Family number' },
    { value: 'alpha', label: 'Alphabetical' },
    { value: 'certainty', label: 'Certainty (high \u2192 low)' },
    { value: 'pipeline', label: 'Pipeline' }
  ];

  var CERTAINTY_ORDER = { green: 0, 'yellow-green': 1, amber: 2, orange: 3, 'red-orange': 4, red: 5, gray: 6 };

  // ---------- INIT ----------
  // Initialize all filters to "show all"
  ALL_PIPELINES.forEach(function (p) { state.pipelines[p] = true; });
  ALL_CERTAINTIES.forEach(function (c) { state.certainties[c] = true; });

  /**
   * Render filter controls into the given container.
   * @param {HTMLElement} container
   * @param {Array} families — all family objects
   * @param {Function} onFilterChange — callback(filteredFamilies, sortedFamilies)
   */
  window.renderFilters = function (container, families, onFilterChange) {
    // Count families per pipeline
    var pipeCounts = {};
    ALL_PIPELINES.forEach(function (p) { pipeCounts[p] = 0; });
    families.forEach(function (fam) {
      var pipes = (fam.active_pipelines || []).concat(fam.future_pipelines || []);
      pipes.forEach(function (p) {
        if (pipeCounts[p] !== undefined) pipeCounts[p]++;
      });
    });

    var html = '<div class="cpr-filters">';

    // Pipeline overview bar
    html += '<div class="cpr-filters__overview">';
    ALL_PIPELINES.forEach(function (p) {
      if (pipeCounts[p] === 0) return;
      html += '<button class="cpr-filters__pipe-btn cpr-filters__pipe-btn--active" data-pipe="' + p + '" title="' + esc(PIPELINE_LABELS[p] || p) + '">';
      html += '<span class="cpr-filters__pipe-badge" style="background:' + (PIPELINE_COLORS[p] || '#94a3b8') + ';">' + p + '</span>';
      html += '<span class="cpr-filters__pipe-count">' + pipeCounts[p] + '</span>';
      html += '</button>';
    });
    html += '</div>';

    // Filter row
    html += '<div class="cpr-filters__row">';

    // Certainty filter
    html += '<div class="cpr-filters__group">';
    html += '<span class="cpr-filters__group-label">Certainty</span>';
    html += '<div class="cpr-filters__cert-dots">';
    ALL_CERTAINTIES.forEach(function (c) {
      html += '<button class="cpr-filters__cert-btn cpr-filters__cert-btn--active" data-cert="' + c + '" title="' + esc(CERTAINTY_LABELS[c] || c) + '">';
      html += '<span class="cpr-filters__cert-dot cpr-filters__cert-dot--' + c + '"></span>';
      html += '</button>';
    });
    html += '</div>';
    html += '</div>';

    // Sort
    html += '<div class="cpr-filters__group">';
    html += '<span class="cpr-filters__group-label">Sort by</span>';
    html += '<select class="cpr-filters__sort" id="filterSort">';
    SORT_OPTIONS.forEach(function (opt) {
      html += '<option value="' + opt.value + '"' + (opt.value === state.sort ? ' selected' : '') + '>';
      html += esc(opt.label);
      html += '</option>';
    });
    html += '</select>';
    html += '</div>';

    // Reset
    html += '<button class="cpr-filters__reset" id="filterReset" title="Reset all filters">Reset</button>';

    html += '</div>'; // row
    html += '</div>'; // cpr-filters

    container.innerHTML = html;

    // Read state from URL hash (if present)
    readHashState();
    syncUIToState(container);

    // ---------- EVENT HANDLERS ----------
    var filtersEl = container.querySelector('.cpr-filters');
    if (!filtersEl) return;

    // Pipeline toggle
    filtersEl.addEventListener('click', function (e) {
      var pipeBtn = e.target.closest('.cpr-filters__pipe-btn');
      if (pipeBtn) {
        var p = pipeBtn.getAttribute('data-pipe');
        state.pipelines[p] = !state.pipelines[p];
        pipeBtn.classList.toggle('cpr-filters__pipe-btn--active', state.pipelines[p]);
        writeHashState();
        onFilterChange(applyFilters(families), state);
        return;
      }

      // Certainty toggle
      var certBtn = e.target.closest('.cpr-filters__cert-btn');
      if (certBtn) {
        var c = certBtn.getAttribute('data-cert');
        state.certainties[c] = !state.certainties[c];
        certBtn.classList.toggle('cpr-filters__cert-btn--active', state.certainties[c]);
        writeHashState();
        onFilterChange(applyFilters(families), state);
        return;
      }

      // Reset
      if (e.target.closest('#filterReset')) {
        ALL_PIPELINES.forEach(function (p) { state.pipelines[p] = true; });
        ALL_CERTAINTIES.forEach(function (c) { state.certainties[c] = true; });
        state.sort = 'dpp';
        syncUIToState(container);
        writeHashState();
        onFilterChange(applyFilters(families), state);
        return;
      }
    });

    // Sort change
    var sortSelect = document.getElementById('filterSort');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sort = sortSelect.value;
        writeHashState();
        onFilterChange(applyFilters(families), state);
      });
    }

    // Apply initial filter (fires callback)
    onFilterChange(applyFilters(families), state);
  };

  // ---------- APPLY FILTERS + SORT ----------
  function applyFilters(families) {
    // Filter
    var filtered = families.filter(function (fam) {
      // Pipeline filter
      var pipes = (fam.active_pipelines || []).concat(fam.future_pipelines || []);
      var pipeMatch = false;
      pipes.forEach(function (p) {
        if (state.pipelines[p]) pipeMatch = true;
      });
      // If family has no pipelines, show it unless all pipeline filters are off
      if (pipes.length === 0) {
        var anyPipeOn = false;
        ALL_PIPELINES.forEach(function (p) { if (state.pipelines[p]) anyPipeOn = true; });
        pipeMatch = anyPipeOn;
      }
      if (!pipeMatch) return false;

      // Certainty filter
      var cert = (fam.convergence && fam.convergence.dpp_certainty) || 'gray';
      if (!state.certainties[cert]) return false;

      return true;
    });

    // Sort
    filtered.sort(getSortFunction(state.sort));

    return filtered;
  }

  function getSortFunction(sortKey) {
    if (sortKey === 'family') {
      return function (a, b) {
        var na = parseInt(a.family || '99', 10);
        var nb = parseInt(b.family || '99', 10);
        return na - nb;
      };
    }
    if (sortKey === 'alpha') {
      return function (a, b) {
        var na = (a.display_name || a.full_name || '').toLowerCase();
        var nb = (b.display_name || b.full_name || '').toLowerCase();
        return na < nb ? -1 : na > nb ? 1 : 0;
      };
    }
    if (sortKey === 'certainty') {
      return function (a, b) {
        var ca = (a.convergence && a.convergence.dpp_certainty) || 'gray';
        var cb = (b.convergence && b.convergence.dpp_certainty) || 'gray';
        var oa = CERTAINTY_ORDER[ca] !== undefined ? CERTAINTY_ORDER[ca] : 9;
        var ob = CERTAINTY_ORDER[cb] !== undefined ? CERTAINTY_ORDER[cb] : 9;
        return oa - ob;
      };
    }
    if (sortKey === 'pipeline') {
      return function (a, b) {
        var pa = (a.active_pipelines && a.active_pipelines[0]) || 'Z';
        var pb = (b.active_pipelines && b.active_pipelines[0]) || 'Z';
        return pa < pb ? -1 : pa > pb ? 1 : 0;
      };
    }
    // Default: DPP date
    return function (a, b) {
      return dppSortKey(a) - dppSortKey(b);
    };
  }

  function dppSortKey(fam) {
    var conv = fam.convergence;
    var str = (conv && conv.dpp_date) || (fam['dpp-range'] && fam['dpp-range'].envelope) || fam['dpp-est'] || '';
    if (!str || str === 'TBD') return 9999;
    var m = str.match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 9999;
  }

  // ---------- URL HASH STATE ----------
  function writeHashState() {
    // Don't clobber family= hash from convergence view
    var hash = window.location.hash;
    if (hash.indexOf('family=') !== -1) return;

    var parts = [];

    // Only write pipeline filters if something is OFF
    var pipeOff = [];
    ALL_PIPELINES.forEach(function (p) { if (!state.pipelines[p]) pipeOff.push(p); });
    if (pipeOff.length > 0) parts.push('hide=' + pipeOff.join(''));

    // Only write certainty filters if something is OFF
    var certOff = [];
    ALL_CERTAINTIES.forEach(function (c) { if (!state.certainties[c]) certOff.push(c); });
    if (certOff.length > 0) parts.push('cert=' + certOff.join(','));

    if (state.sort !== 'dpp') parts.push('sort=' + state.sort);

    if (parts.length > 0) {
      window.location.hash = parts.join('&');
    } else {
      // Clear hash without scrolling
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }

  function readHashState() {
    var hash = window.location.hash.replace(/^#/, '');
    if (!hash || hash.indexOf('family=') !== -1) return;

    var params = hash.split('&');
    params.forEach(function (param) {
      var eq = param.indexOf('=');
      if (eq === -1) return;
      var key = param.substring(0, eq);
      var val = param.substring(eq + 1);

      if (key === 'hide') {
        // e.g. hide=CE means hide pipelines C and E
        for (var i = 0; i < val.length; i++) {
          var p = val[i];
          if (state.pipelines[p] !== undefined) state.pipelines[p] = false;
        }
      }

      if (key === 'cert') {
        // e.g. cert=gray,amber
        var certs = val.split(',');
        certs.forEach(function (c) {
          if (state.certainties[c] !== undefined) state.certainties[c] = false;
        });
      }

      if (key === 'sort') {
        if (val === 'family' || val === 'alpha' || val === 'certainty' || val === 'pipeline') {
          state.sort = val;
        }
      }
    });
  }

  // Sync UI elements to match current state
  function syncUIToState(container) {
    ALL_PIPELINES.forEach(function (p) {
      var btn = container.querySelector('.cpr-filters__pipe-btn[data-pipe="' + p + '"]');
      if (btn) btn.classList.toggle('cpr-filters__pipe-btn--active', state.pipelines[p]);
    });
    ALL_CERTAINTIES.forEach(function (c) {
      var btn = container.querySelector('.cpr-filters__cert-btn[data-cert="' + c + '"]');
      if (btn) btn.classList.toggle('cpr-filters__cert-btn--active', state.certainties[c]);
    });
    var sortSelect = container.querySelector('#filterSort');
    if (sortSelect) sortSelect.value = state.sort;
  }

  // ---------- UTIL ----------
  function esc(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }
})();
