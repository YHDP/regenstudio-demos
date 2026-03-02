// convergence-view.js — Time-aligned dual-column convergence chart
// Nodes positioned by their actual dates. Gantt bars for date-range nodes.
// DPP obligation lines computed from individual standards' dpp_est values + system timeline.

(function () {
  'use strict';

  // ---------- LAYOUT CONSTANTS ----------
  var MIN_PX_PER_YEAR = 120;
  var MAX_PX_PER_YEAR = 400;
  var MIN_NODE_SPACING = 34;
  var COL_HEADER_HEIGHT = 52;
  var CHART_PAD_TOP = 8;
  var CHART_PAD_BOTTOM = 60;

  var MONTH_ABBR = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var STATUS_ICONS = {
    complete: '\u2713', in_progress: '\u25d0', draft: '\u25d0', active: '\u25cf',
    overdue: '!', pending: '\u25cb', not_started: '\u25cb', unknown: '?', phase_1_active: '\u25d0'
  };

  var CERTAINTY_LABELS = {
    green: 'Confirmed', 'yellow-green': 'Scheduled', amber: 'Estimated',
    orange: 'Moderate confidence', 'red-orange': 'Speculative', red: 'Speculative', gray: 'Unknown'
  };

  // Pipeline column ordering: hEN (A,B) before EAD (C,D) before ESPR (E)
  var PIPE_TYPE_GROUP = { A: 0, B: 0, C: 1, D: 1, E: 2 };
  var PIPE_LETTER_ORDER = { A: 1, B: 2, C: 3, D: 4, E: 5 };

  function pipeSortKey(key, isFuture) {
    var typeGroup = PIPE_TYPE_GROUP[key] !== undefined ? PIPE_TYPE_GROUP[key] : 9;
    return typeGroup * 1000 + (isFuture ? 100 : 0) + (PIPE_LETTER_ORDER[key] || 0);
  }

  // ---------- DATE PARSING ----------
  function dateToYear(str) {
    if (!str) return null;
    str = String(str).trim();

    var iso = str.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if (iso) {
      var y = parseInt(iso[1], 10);
      var m = parseInt(iso[2], 10) - 1;
      var d = iso[3] ? parseInt(iso[3], 10) : 15;
      return y + (m + d / 30) / 12;
    }

    var qRange = str.match(/Q(\d)\s*[-\u2013]\s*Q(\d)\s+(\d{4})/i);
    if (qRange) {
      var avg = (parseInt(qRange[1], 10) + parseInt(qRange[2], 10)) / 2;
      return parseInt(qRange[3], 10) + (avg - 0.5) / 4;
    }

    var q = str.match(/Q(\d)\s+(\d{4})/i);
    if (q) return parseInt(q[2], 10) + (parseInt(q[1], 10) - 0.5) / 4;

    var h = str.match(/H(\d)\s+(\d{4})/i);
    if (h) return parseInt(h[2], 10) + (parseInt(h[1], 10) === 1 ? 0.25 : 0.75);

    var monthYear = str.match(/([A-Za-z]{3})\s+(\d{4})/);
    if (monthYear && MONTH_ABBR[monthYear[1]] !== undefined) {
      return parseInt(monthYear[2], 10) + MONTH_ABBR[monthYear[1]] / 12;
    }

    var dayMonthYear = str.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
    if (dayMonthYear && MONTH_ABBR[dayMonthYear[2]] !== undefined) {
      return parseInt(dayMonthYear[3], 10) + (MONTH_ABBR[dayMonthYear[2]] + parseInt(dayMonthYear[1], 10) / 30) / 12;
    }

    var tildeRange = str.match(/~?(\d{4})\s*[-\u2013]\s*(\d{4})/);
    if (tildeRange) return (parseInt(tildeRange[1], 10) + parseInt(tildeRange[2], 10)) / 2;

    var plain = str.match(/~?(\d{4})/);
    if (plain) return parseInt(plain[1], 10);

    var plus = str.match(/(\d{4})\+/);
    if (plus) return parseInt(plus[1], 10);

    return null;
  }

  // Returns earliest year from a date string (start of year ranges)
  function dateToYearStart(str) {
    if (!str) return null;
    var tildeRange = String(str).trim().match(/~?(\d{4})\s*[-\u2013]\s*(\d{4})/);
    if (tildeRange) return parseInt(tildeRange[1], 10);
    return dateToYear(str);
  }

  // Returns latest year from a date string (end of year ranges)
  function dateToYearEnd(str) {
    if (!str) return null;
    var tildeRange = String(str).trim().match(/~?(\d{4})\s*[-\u2013]\s*(\d{4})/);
    if (tildeRange) return parseInt(tildeRange[2], 10);
    return dateToYear(str);
  }

  function nodeDate(node) {
    return node.date || node.target_date || node.estimated_date || node.statutory_deadline || null;
  }

  // Convert year float to readable label (e.g. "Jul 2026" or "2032")
  function yearToLabel(yr) {
    if (yr === null || yr === undefined) return '';
    var y = Math.floor(yr);
    var frac = yr - y;
    if (frac < 0.03) return String(y);
    var m = Math.round(frac * 12);
    if (m < 0) m = 0;
    if (m > 11) m = 11;
    return MONTH_NAMES[m] + ' ' + y;
  }

  // ---------- STANDARDS-TO-PIPELINE MAPPING ----------
  function getStdsForPipeline(standards, pipeKey) {
    if (pipeKey === 'A' || pipeKey === 'B') {
      return (standards || []).filter(function (s) { return s.type === 'hEN'; });
    }
    if (pipeKey === 'C') {
      return (standards || []).filter(function (s) { return s.type === 'EAD'; });
    }
    return [];
  }

  // ---------- NODE BADGES ----------
  function computeNodeBadge(node, standards, pipeKey) {
    if (!standards || standards.length === 0) return '';
    var matching = getStdsForPipeline(standards, pipeKey);
    if (matching.length === 0) return '';

    var type = node.type || '';

    if (node.standards_ref || type === 'NT-5') {
      var inDev = 0;
      matching.forEach(function (s) { if (s.dev_stage || s.stage) inDev++; });
      if (inDev > 0) return inDev + '/' + matching.length + ' in dev';
      return matching.length + ' std' + (matching.length !== 1 ? 's' : '');
    }

    if (type === 'NT-7') {
      var isNewPipe = (pipeKey === 'A' || pipeKey === 'D');
      if (isNewPipe) {
        var newCited = 0, legacyCited = 0;
        matching.forEach(function (s) {
          if (s.cited) {
            if (s.revision === 'CPR 2011' || s.regime === 'old') legacyCited++;
            else newCited++;
          }
        });
        if (legacyCited > 0) return newCited + ' new / ' + legacyCited + ' legacy';
        return newCited + '/' + matching.length + ' cited';
      }
      var cited = 0;
      matching.forEach(function (s) { if (s.cited) cited++; });
      return cited + '/' + matching.length + ' cited';
    }

    if (type === 'NT-8') {
      var isNewPipeC = (pipeKey === 'A' || pipeKey === 'D');
      if (isNewPipeC) {
        var newCoex = 0;
        matching.forEach(function (s) {
          if (s.cited && s.revision !== 'CPR 2011' && s.regime !== 'old') newCoex++;
        });
        if (newCoex === 0) return 'awaiting citation';
        return newCoex + '/' + matching.length + ' coexisting';
      }
      var withMand = 0;
      matching.forEach(function (s) { if (s.mand_est) withMand++; });
      if (withMand > 0) return withMand + '/' + matching.length + ' mandatory';
      var coex = 0;
      matching.forEach(function (s) { if (s.cited) coex++; });
      if (coex > 0) return coex + '/' + matching.length + ' coexisting';
      return '';
    }

    if (type === 'NT-C1') {
      return matching.length + ' EAD' + (matching.length !== 1 ? 's' : '');
    }

    if (type === 'NT-C2') {
      var eadExpiryMs = new Date('2031-01-09') - new Date();
      var eadYrsLeft = (eadExpiryMs / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
      return eadYrsLeft + 'yr remaining';
    }

    if (type === 'NT-C3') {
      var replaced = 0;
      matching.forEach(function (s) { if (s.new_ead) replaced++; });
      return replaced + '/' + matching.length + ' replaced';
    }

    if (type === 'NT-C4') {
      var etaExpiryMs = new Date('2036-01-09') - new Date();
      var etaYrsLeft = (etaExpiryMs / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
      return etaYrsLeft + 'yr remaining';
    }

    return '';
  }

  // Check if node supports expansion (for visual indicator)
  function isExpandable(node, colKey) {
    if (colKey === 'SYS') return false;
    var type = node.type || '';
    return type === 'NT-5' || type === 'NT-7' || type === 'NT-8' ||
           type === 'NT-C1' || type === 'NT-C2' || type === 'NT-C3' || type === 'NT-C4' ||
           !!node.standards_ref;
  }

  // ---------- GANTT RANGE COMPUTATION ----------
  // For nodes with underlying standards that have deadline dates,
  // computes the date range for rendering as a bar instead of a dot.
  // Returns { startYear, endYear, startLabel, endLabel } or null.
  function computeGanttRange(node, standards, pipeKey) {
    var type = node.type || '';
    var matching = getStdsForPipeline(standards, pipeKey);
    if (matching.length === 0) return null;

    var dates = [];
    matching.forEach(function (s) {
      var dateStr = null;
      // NT-5: CEN delivery deadlines
      if ((type === 'NT-5' || node.standards_ref) && s.delivery) dateStr = s.delivery;
      // NT-C1: EAD expiry dates
      else if (type === 'NT-C1' && s.expires) dateStr = s.expires;
      // NT-8: mandatory application estimates
      else if (type === 'NT-8' && s.mand_est) dateStr = s.mand_est;
      if (dateStr) {
        var yr = dateToYear(dateStr);
        if (yr !== null) dates.push(yr);
      }
    });

    if (dates.length < 2) return null;
    dates.sort(function (a, b) { return a - b; });

    var startYr = dates[0];
    var endYr = dates[dates.length - 1];
    if (endYr - startYr < 0.15) return null; // too close, use dot

    return {
      startYear: startYr,
      endYear: endYr,
      startLabel: yearToLabel(startYr),
      endLabel: yearToLabel(endYr)
    };
  }

  // ---------- DYNAMIC PX_PER_YEAR ----------
  // Computes pixels-per-year so that the tightest pair of dated nodes
  // in any column has at least MIN_NODE_SPACING * 1.5 pixels between them.
  function computePxPerYear(columns) {
    var minGap = Infinity;
    var GAP_THRESHOLD = 0.05; // ~3 weeks — closer means same-date cluster

    columns.forEach(function (col) {
      var dated = [];
      col.nodes.forEach(function (n) {
        var yr = dateToYear(nodeDate(n));
        if (yr !== null) dated.push(yr);
      });
      dated.sort(function (a, b) { return a - b; });
      for (var i = 1; i < dated.length; i++) {
        var gap = dated[i] - dated[i - 1];
        if (gap > GAP_THRESHOLD && gap < minGap) minGap = gap;
      }
    });

    if (minGap === Infinity) return MIN_PX_PER_YEAR;

    var needed = Math.ceil(MIN_NODE_SPACING * 1.5 / minGap);
    return Math.max(MIN_PX_PER_YEAR, Math.min(needed, MAX_PX_PER_YEAR));
  }

  // ---------- YEAR <-> PIXEL ----------
  function yearToTop(year, minYear, pxPerYear) {
    return CHART_PAD_TOP + COL_HEADER_HEIGHT + ((year - minYear) * pxPerYear);
  }

  // ---------- LAYOUT: assign pixel positions to nodes ----------
  function layoutColumn(nodes, minYear, pxPerYear, ganttMap) {
    var items = [];
    for (var i = 0; i < nodes.length; i++) {
      var ds = nodeDate(nodes[i]);
      var year = dateToYear(ds);
      items.push({ node: nodes[i], idx: i, year: year, top: 0, dateStr: ds || '' });
    }

    // For undated nodes with gantt ranges, use midpoint of range
    if (ganttMap) {
      for (var g = 0; g < items.length; g++) {
        if (items[g].year === null && ganttMap[g]) {
          items[g].year = (ganttMap[g].startYear + ganttMap[g].endYear) / 2;
        }
      }
    }

    // Interpolate remaining undated nodes between known neighbours
    for (var a = 0; a < items.length; a++) {
      if (items[a].year !== null) continue;
      var prevYear = null, nextYear = null, prevIdx = -1, nextIdx = -1;
      for (var b = a - 1; b >= 0; b--) { if (items[b].year !== null) { prevYear = items[b].year; prevIdx = b; break; } }
      for (var c = a + 1; c < items.length; c++) { if (items[c].year !== null) { nextYear = items[c].year; nextIdx = c; break; } }

      if (prevYear !== null && nextYear !== null) {
        var frac = (a - prevIdx) / (nextIdx - prevIdx);
        items[a].year = prevYear + frac * (nextYear - prevYear);
      } else if (prevYear !== null) {
        items[a].year = prevYear + 0.4;
      } else if (nextYear !== null) {
        items[a].year = nextYear - 0.4;
      } else {
        items[a].year = minYear + 1;
      }
    }

    // Year to pixel
    for (var d = 0; d < items.length; d++) {
      items[d].top = yearToTop(items[d].year, minYear, pxPerYear);
    }

    // Enforce minimum spacing (push down only)
    for (var e = 1; e < items.length; e++) {
      if (items[e].top - items[e - 1].top < MIN_NODE_SPACING) {
        items[e].top = items[e - 1].top + MIN_NODE_SPACING;
      }
    }

    return items;
  }

  // ---------- RENDER ----------
  window.renderConvergenceChart = function (container, family, systemTimeline, standards) {
    var columns = [];
    var activePipes = family.active_pipelines || [];
    var futurePipes = family.future_pipelines || [];
    standards = standards || [];

    // System timeline FIRST (leftmost)
    columns.push({
      key: 'SYS', label: 'System Timeline', nodes: (systemTimeline && systemTimeline.nodes) || [],
      future: false, dppOutcome: true, isSystem: true
    });

    // Build pipeline columns
    var pipeColumns = [];
    var allPipeKeys = activePipes.concat(futurePipes);

    allPipeKeys.forEach(function (key) {
      var pipe = family.pipelines && family.pipelines[key];
      if (!pipe) return;
      // Only show pipelines that lead to DPP (CPR 2024/3110 routes)
      if (!pipe.dpp_outcome) return;
      var isFuture = futurePipes.indexOf(key) !== -1;

      pipeColumns.push({
        key: key, label: pipe.label || key, nodes: pipe.nodes || [],
        future: isFuture, dppOutcome: !!pipe.dpp_outcome,
        _sortKey: pipeSortKey(key, isFuture)
      });
    });

    pipeColumns.sort(function (a, b) { return a._sortKey - b._sortKey; });
    for (var p = 0; p < pipeColumns.length; p++) {
      columns.push(pipeColumns[p]);
    }

    // Collect all years for time range
    var allYears = [];
    columns.forEach(function (col) {
      col.nodes.forEach(function (n) {
        var yr = dateToYear(nodeDate(n));
        if (yr) allYears.push(yr);
      });
    });

    // Pre-compute gantt ranges per column and include their dates
    columns.forEach(function (col) {
      col.ganttMap = {};
      col.nodes.forEach(function (n, i) {
        var gr = computeGanttRange(n, standards, col.key);
        if (gr) {
          col.ganttMap[i] = gr;
          allYears.push(gr.startYear);
          allYears.push(gr.endYear);
        }
      });
    });

    if (allYears.length === 0) {
      container.innerHTML = '<p class="conv-chart__empty">No timeline data available.</p>';
      return;
    }

    var minYear = Math.floor(Math.min.apply(null, allYears));
    var maxYear = Math.ceil(Math.max.apply(null, allYears)) + 0.5;
    if (minYear > 2024) minYear = 2024;
    if (maxYear < 2031) maxYear = 2031;

    // Dynamic PX_PER_YEAR based on densest node cluster
    var pxPerYear = computePxPerYear(columns);

    // Cap total chart body height so long time ranges (e.g. 13yr) stay manageable
    var totalRange = maxYear - minYear;
    var maxChartBodyPx = 2000;
    if (pxPerYear * totalRange > maxChartBodyPx) {
      pxPerYear = Math.max(MIN_PX_PER_YEAR, Math.floor(maxChartBodyPx / totalRange));
    }

    // Layout each column
    var maxNodeBottom = 0;
    columns.forEach(function (col) {
      col.items = layoutColumn(col.nodes, minYear, pxPerYear, col.ganttMap);
      col.items.forEach(function (it) {
        if (it.top > maxNodeBottom) maxNodeBottom = it.top;
      });
      // Include gantt bar bottoms in max
      var gm = col.ganttMap;
      for (var gi in gm) {
        if (gm.hasOwnProperty(gi)) {
          var gBottom = yearToTop(gm[gi].endYear, minYear, pxPerYear);
          if (gBottom > maxNodeBottom) maxNodeBottom = gBottom;
        }
      }
    });

    var chartHeight = maxNodeBottom + CHART_PAD_BOTTOM;

    // ---------- BUILD HTML ----------
    var html = '<div class="conv-chart" style="height:' + chartHeight + 'px;">';

    // Gridlines + year labels
    html += '<div class="conv-chart__grid">';
    for (var yr = Math.ceil(minYear); yr <= Math.floor(maxYear); yr++) {
      var gTop = yearToTop(yr, minYear, pxPerYear);
      html += '<div class="conv-chart__gridline" style="top:' + gTop + 'px;">';
      html += '<span class="conv-chart__year-label">' + yr + '</span>';
      html += '</div>';
    }
    html += '</div>';

    // "Now" marker
    var now = new Date();
    var nowYear = now.getFullYear() + now.getMonth() / 12;
    if (nowYear >= minYear && nowYear <= maxYear) {
      var nowTop = yearToTop(nowYear, minYear, pxPerYear);
      html += '<div class="conv-chart__now" style="top:' + nowTop + 'px;"><span>Now</span></div>';
    }

    // Columns
    html += '<div class="conv-chart__columns">';

    columns.forEach(function (col) {
      var colCls = 'conv-chart__col';
      if (col.future) colCls += ' conv-chart__col--future';
      if (col.isSystem) colCls += ' conv-chart__col--system';

      html += '<div class="' + colCls + '">';

      // Header
      html += '<div class="conv-chart__col-header">';
      html += '<span class="conv-chart__col-badge conv-chart__col-badge--' + col.key + '">' + (col.isSystem ? 'SYS' : col.key) + '</span>';
      html += '<span class="conv-chart__col-title">' + esc(col.label) + '</span>';
      if (col.future) html += '<span class="conv-chart__col-tag conv-chart__col-tag--future">future</span>';
      if (col.dppOutcome && !col.future) html += '<span class="conv-chart__col-tag conv-chart__col-tag--dpp">DPP</span>';
      if (!col.dppOutcome && !col.future) html += '<span class="conv-chart__col-tag conv-chart__col-tag--no-dpp">no DPP</span>';
      html += '</div>';

      // Track (vertical line)
      if (col.items.length > 0) {
        var trackTop = col.items[0].top;
        var trackBottom = col.items[col.items.length - 1].top;
        // Extend track to cover gantt bar ranges
        var gm = col.ganttMap;
        for (var gi in gm) {
          if (gm.hasOwnProperty(gi)) {
            var gStartPx = yearToTop(gm[gi].startYear, minYear, pxPerYear);
            var gEndPx = yearToTop(gm[gi].endYear, minYear, pxPerYear);
            if (gStartPx < trackTop) trackTop = gStartPx;
            if (gEndPx > trackBottom) trackBottom = gEndPx;
          }
        }
        html += '<div class="conv-chart__track" style="top:' + trackTop + 'px;height:' + (trackBottom - trackTop) + 'px;"></div>';
      }

      // Gantt bars + Nodes
      col.items.forEach(function (item) {
        var n = item.node;
        var cert = n.certainty || 'gray';
        var status = n.status || 'not_started';
        var icon = STATUS_ICONS[status] || '\u25cb';
        var dateLabel = item.dateStr;
        var expandable = isExpandable(n, col.key);
        var badge = expandable ? computeNodeBadge(n, standards, col.key) : '';
        var gantt = col.ganttMap ? col.ganttMap[item.idx] : null;

        // Render gantt bar if applicable
        if (gantt) {
          var ganttStartTop = yearToTop(gantt.startYear, minYear, pxPerYear);
          var ganttEndTop = yearToTop(gantt.endYear, minYear, pxPerYear);
          var ganttHeight = Math.max(ganttEndTop - ganttStartTop, 4);
          html += '<div class="conv-chart__gantt conv-chart__gantt--' + cert + '" ';
          html += 'style="top:' + ganttStartTop + 'px;height:' + ganttHeight + 'px;"></div>';
          // Show date range instead of single date
          dateLabel = gantt.startLabel + ' \u2013 ' + gantt.endLabel;
        }

        var hasSources = n.sources && n.sources.length > 0;
        var nodeClass = 'conv-chart__node conv-chart__node--' + cert;
        if (expandable) nodeClass += ' conv-chart__node--expandable';
        if (!hasSources) nodeClass += ' conv-chart__node--no-source';
        if (gantt) nodeClass += ' conv-chart__node--gantt';

        html += '<div class="' + nodeClass + '" style="top:' + item.top + 'px;" ';
        html += 'data-col-key="' + col.key + '" ';
        html += 'data-node-idx="' + item.idx + '" ';
        if (n.type) html += 'data-node-type="' + esc(n.type) + '" ';
        if (expandable) html += 'data-expandable ';
        html += 'tabindex="0">';

        html += '<div class="conv-chart__node-dot">' + icon + '</div>';

        html += '<div class="conv-chart__node-text">';
        html += '<span class="conv-chart__node-name">' + esc(n.label || n.type || '') + '</span>';
        if (dateLabel) html += '<span class="conv-chart__node-date">' + esc(dateLabel) + '</span>';
        if (badge) html += '<span class="conv-chart__node-badge">' + esc(badge) + '</span>';
        html += '</div>';

        if (expandable) html += '<span class="conv-chart__node-expand">\u25b8</span>';

        html += '</div>';
      });

      html += '</div>'; // col
    });

    html += '</div>'; // columns
    html += '</div>'; // conv-chart

    container.innerHTML = html;
  };

  // ---------- UTIL ----------
  function esc(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  window.convergenceDateToYear = dateToYear;
})();
