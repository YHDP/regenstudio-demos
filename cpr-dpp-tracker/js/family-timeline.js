// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
// family-timeline.js — Per-family convergence timeline.
// Renders System Timeline + each of the family's active/future pipelines as
// horizontal rows on a shared year axis. Marks the DPP-binding terminal node.
// Mounted on family detail (convergence view) and standard detail pages.

(function () {
  'use strict';

  var STATUS_ICONS = {
    complete: '✓', in_progress: '◐', draft: '◐', active: '●',
    overdue: '!', pending: '○', not_started: '○', unknown: '?'
  };

  var CERT_LABELS = {
    green: 'Confirmed', 'yellow-green': 'Scheduled', amber: 'Estimated',
    orange: 'Moderate confidence', 'red-orange': 'Speculative',
    red: 'Speculative', gray: 'Unknown'
  };

  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

  function parseYear(s) {
    if (s == null) return null;
    var str = String(s);
    var m = str.match(/(\d{4})/);
    if (!m) return null;
    var y = parseInt(m[1], 10);
    var qm = str.match(/Q(\d)/i);
    if (qm) return y + (parseInt(qm[1], 10) - 1) * 0.25 + 0.125;
    var mm = str.match(/-(\d{2})(?:-|\b|$)/);
    if (mm) return y + (parseInt(mm[1], 10) - 1) / 12;
    var monMatch = str.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
    if (monMatch) {
      var key = monMatch[1].slice(0, 3).toLowerCase();
      if (MONTHS[key] !== undefined) return y + MONTHS[key] / 12 + 0.04;
    }
    return y;
  }

  function formatYear(y) {
    if (y == null) return '';
    var iy = Math.floor(y);
    var frac = y - iy;
    if (frac < 0.08) return String(iy);
    if (frac < 0.4)  return 'Q1 ' + iy;
    if (frac < 0.55) return 'Q2 ' + iy;
    if (frac < 0.78) return 'Q3 ' + iy;
    return 'Q4 ' + iy;
  }

  function nodeDate(n) {
    return n.date || n.target_date || n.estimated_date || n.statutory_deadline || '';
  }

  function esc(s) {
    var d = document.createElement('span');
    d.textContent = (s == null) ? '' : String(s);
    return d.innerHTML;
  }

  // Vertical-lane packing to avoid label overlap.
  // halfWidthPct: half-width of node label-box in axis percent.
  function assignLanes(nodes, getPct, halfWidthPct) {
    var sorted = nodes.slice()
      .filter(function (n) { return getPct(n) != null; })
      .sort(function (a, b) { return getPct(a) - getPct(b); });
    var lanes = [];
    sorted.forEach(function (n) {
      var c = getPct(n);
      var s = c - halfWidthPct;
      var e = c + halfWidthPct;
      var laneIdx = 0;
      while (laneIdx < lanes.length) {
        var conflict = false;
        for (var k = 0; k < lanes[laneIdx].length; k++) {
          var r = lanes[laneIdx][k];
          if (!(e < r.start || s > r.end)) { conflict = true; break; }
        }
        if (!conflict) break;
        laneIdx++;
      }
      if (laneIdx === lanes.length) lanes.push([]);
      lanes[laneIdx].push({ start: s, end: e });
      n._lane = laneIdx;
    });
    return lanes.length;
  }

  /**
   * Render a per-family convergence timeline.
   *
   * @param {HTMLElement} container — mount point
   * @param {Object} family — single family object from families-v2.json
   * @param {Object} systemTimeline — system-timeline.json data
   * @param {Object} [opts] — optional: { title, highlightStandard }
   */
  window.renderFamilyTimeline = function (container, family, systemTimeline, opts) {
    if (!container) return;
    opts = opts || {};
    if (!family) {
      container.innerHTML = '';
      return;
    }

    // Build rows: System (first) + each active pipeline + each future pipeline.
    var rows = [];

    if (systemTimeline && systemTimeline.nodes) {
      rows.push({
        rowName: 'System Timeline',
        rowDesc: 'Cross-cutting EU DPP infrastructure',
        rowKind: 'system',
        pipeKey: null,
        dppOutcome: null,
        nodes: systemTimeline.nodes.map(function (n) {
          return {
            id: n.id,
            label: n.label,
            rawDate: nodeDate(n),
            year: parseYear(nodeDate(n)),
            certainty: n.certainty || 'gray',
            status: n.status || 'unknown'
          };
        })
      });
    }

    var pipes = family.pipelines || {};
    var pipeOrder = [].concat(family.active_pipelines || []).concat(family.future_pipelines || []);
    var seenPipes = {};
    pipeOrder.forEach(function (p) {
      if (seenPipes[p] || !pipes[p]) return;
      seenPipes[p] = true;
      var pipe = pipes[p];
      var isFuture = (family.future_pipelines || []).indexOf(p) >= 0;
      var nodes = (pipe.nodes || []).map(function (n) {
        return {
          id: p + '/' + (n.type || ''),
          type: n.type,
          label: n.label || n.type || '',
          rawDate: nodeDate(n),
          year: parseYear(nodeDate(n)),
          certainty: n.certainty || 'gray',
          status: n.status || 'unknown'
        };
      });
      rows.push({
        rowName: 'Pipeline ' + p + (isFuture ? ' (future)' : ''),
        rowDesc: pipe.label || '',
        rowKind: 'pipeline',
        pipeKey: p,
        dppOutcome: pipe.dpp_outcome === true,
        nodes: nodes
      });
    });

    // Year range from all dated nodes.
    var allYears = [];
    rows.forEach(function (r) {
      r.nodes.forEach(function (n) { if (n.year != null) allYears.push(n.year); });
    });

    if (allYears.length === 0) {
      container.innerHTML = '<div class="family-timeline family-timeline--empty">'
        + '<p>No dated regulatory milestones yet for this family. As CEN delivery dates and OJ-citation dates are scheduled, they will appear on the timeline.</p>'
        + '</div>';
      return;
    }

    var minYear = Math.min(2025, Math.floor(Math.min.apply(null, allYears)));
    var maxYear = Math.ceil(Math.max.apply(null, allYears) + 0.2);
    if (maxYear - minYear < 2) maxYear = minYear + 2;

    function pct(year) {
      if (year == null) return null;
      return ((year - minYear) / (maxYear - minYear)) * 100;
    }

    var HALF_WIDTH_PCT = 5.5;
    var LANE_HEIGHT = 56;
    var LANE_TOP = 8;

    rows.forEach(function (r) {
      r.lanes = assignLanes(r.nodes, function (n) { return pct(n.year); }, HALF_WIDTH_PCT);
      r.trackHeight = Math.max(96, LANE_TOP + r.lanes * LANE_HEIGHT + 12);
    });

    // Identify binding terminal nodes.
    // sysDpp = system-timeline 'sys-dpp-mandatory' node
    // prodTerminal = latest dated node across DPP-outcome pipelines
    var sysDpp = null;
    var prodTerminal = null;
    var prodPipeKey = null;
    rows.forEach(function (r) {
      if (r.rowKind === 'system') {
        r.nodes.forEach(function (n) {
          if (n.id === 'sys-dpp-mandatory' && n.year != null) sysDpp = n;
        });
      } else if (r.rowKind === 'pipeline' && r.dppOutcome) {
        r.nodes.forEach(function (n) {
          if (n.year != null && (!prodTerminal || n.year > prodTerminal.year)) {
            prodTerminal = n;
            prodPipeKey = r.pipeKey;
          }
        });
      }
    });

    var html = '<div class="family-timeline">';

    // Header
    var titleText = opts.title || 'Convergence Timeline';
    html += '<div class="family-timeline__header">';
    html += '<h3 class="family-timeline__title">' + esc(titleText) + '</h3>';
    html += '<span class="family-timeline__subtitle">DPP becomes mandatory on the <strong>later</strong> of system-side and product-side timelines, on a shared year axis.</span>';
    html += '</div>';

    // Year axis
    html += '<div class="family-timeline__axis-wrap"><div class="family-timeline__axis">';
    for (var y = minYear; y <= maxYear; y++) {
      var x = (((y - minYear) / (maxYear - minYear)) * 100).toFixed(2);
      html += '<span class="family-timeline__year" style="left:' + x + '%;">' + y + '</span>';
      html += '<span class="family-timeline__gridline" style="left:' + x + '%;"></span>';
    }
    html += '</div></div>';

    // Each row
    rows.forEach(function (r) {
      var rowCls = 'family-timeline__row family-timeline__row--' + r.rowKind;
      if (r.pipeKey) rowCls += ' family-timeline__row--pipe-' + r.pipeKey.toLowerCase();
      html += '<div class="' + rowCls + '">';
      html += '<div class="family-timeline__row-label">';
      html += '<span class="family-timeline__row-name">' + esc(r.rowName) + '</span>';
      if (r.rowDesc) html += '<span class="family-timeline__row-desc">' + esc(r.rowDesc) + '</span>';
      if (r.dppOutcome) html += '<span class="family-timeline__row-tag" title="This pipeline leads to DPP">DPP outcome</span>';
      html += '</div>';
      html += '<div class="family-timeline__track" style="min-height:' + r.trackHeight + 'px;">';
      r.nodes.forEach(function (n) {
        if (n.year == null) return;
        var top = LANE_TOP + (n._lane || 0) * LANE_HEIGHT;
        var icon = STATUS_ICONS[n.status] || '○';
        var pctVal = pct(n.year).toFixed(2) + '%';
        // Mark binding node
        var isProdBinding = (n === prodTerminal && sysDpp && prodTerminal && prodTerminal.year > sysDpp.year);
        var isSysBinding = (n.id === 'sys-dpp-mandatory' && sysDpp && prodTerminal && sysDpp.year >= prodTerminal.year);
        var nodeCls = 'family-timeline__node family-timeline__node--' + esc(n.certainty);
        if (isProdBinding || isSysBinding) nodeCls += ' family-timeline__node--binding';
        var ariaLabel = n.label + ' — ' + n.rawDate + ' — ' + (CERT_LABELS[n.certainty] || n.certainty);
        if (isProdBinding || isSysBinding) ariaLabel += ' — binding constraint';
        html += '<div class="' + nodeCls + '" style="left:' + pctVal + ';top:' + top + 'px;" tabindex="0" role="button" aria-label="' + esc(ariaLabel) + '">';
        html += '<span class="family-timeline__dot">' + icon + '</span>';
        html += '<span class="family-timeline__node-label">' + esc(n.label) + '</span>';
        html += '<span class="family-timeline__node-date">' + esc(n.rawDate) + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    });

    // Convergence callout
    if (sysDpp && prodTerminal) {
      var binding = (sysDpp.year >= prodTerminal.year) ? 'system' : 'product';
      var bindingDate = (binding === 'system') ? sysDpp.rawDate : prodTerminal.rawDate;
      var bindingLabel = (binding === 'system')
        ? 'System DPP-mandatory date'
        : 'Pipeline ' + prodPipeKey + ' — ' + prodTerminal.label;
      html += '<div class="family-timeline__convergence family-timeline__convergence--' + binding + '">';
      html += '<div class="family-timeline__convergence-row">';
      html += '<span class="family-timeline__convergence-label">DPP becomes mandatory:</span>';
      html += '<span class="family-timeline__convergence-date">' + esc(bindingDate) + '</span>';
      html += '</div>';
      html += '<div class="family-timeline__convergence-detail">';
      html += 'Bound by <strong>' + esc(bindingLabel) + '</strong> — the later of System ';
      html += esc(sysDpp.rawDate) + ' and Pipeline ' + prodPipeKey + ' terminal ' + esc(prodTerminal.rawDate) + '.';
      html += '</div>';
      html += '</div>';
    } else if (sysDpp && !prodTerminal) {
      html += '<div class="family-timeline__convergence family-timeline__convergence--system">';
      html += '<div class="family-timeline__convergence-row">';
      html += '<span class="family-timeline__convergence-label">System-side floor:</span>';
      html += '<span class="family-timeline__convergence-date">' + esc(sysDpp.rawDate) + '</span>';
      html += '</div>';
      html += '<div class="family-timeline__convergence-detail">';
      html += 'No dated product-side terminal yet. DPP cannot land before System ' + esc(sysDpp.rawDate) + '.';
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  };
})();
