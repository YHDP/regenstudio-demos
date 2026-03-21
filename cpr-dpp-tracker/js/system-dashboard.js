// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
// system-dashboard.js — System Timeline dashboard component
// Renders a horizontal progress-bar-style timeline from system-timeline.json.
// Nodes are clickable to expand detail + sub-items.

(function () {
  'use strict';

  var STATUS_ICONS = {
    complete: '\u2713', in_progress: '\u25d0', draft: '\u25d0', active: '\u25cf',
    overdue: '!', pending: '\u25cb', not_started: '\u25cb', unknown: '?', phase_1_active: '\u25d0'
  };

  var STATUS_LABELS = {
    complete: 'Complete', in_progress: 'In progress', draft: 'Draft', active: 'Active',
    overdue: 'Overdue', pending: 'Pending', not_started: 'Not started',
    unknown: 'Unknown', phase_1_active: 'Phase 1 active'
  };

  var CERTAINTY_LABELS = {
    green: 'Confirmed', 'yellow-green': 'Scheduled', amber: 'Estimated',
    orange: 'Moderate confidence', 'red-orange': 'Speculative', red: 'Speculative', gray: 'Unknown'
  };

  /**
   * Render the system timeline dashboard into the given container.
   * @param {HTMLElement} container
   * @param {Object} sysTimeline — system-timeline.json data
   */
  window.renderSystemDashboard = function (container, sysTimeline) {
    if (!sysTimeline || !sysTimeline.nodes || sysTimeline.nodes.length === 0) {
      container.innerHTML = '';
      return;
    }

    var nodes = sysTimeline.nodes;
    var crossCutting = sysTimeline.cross_cutting || [];

    // Find the DPP mandatory node for the callout
    var dppNode = null;
    nodes.forEach(function (n) {
      if (n.id === 'sys-dpp-mandatory') dppNode = n;
    });

    var html = '<div class="sys-dash">';

    // Title bar
    html += '<div class="sys-dash__header">';
    html += '<h2 class="sys-dash__title">System Timeline</h2>';
    html += '<span class="sys-dash__subtitle">Cross-cutting EU DPP infrastructure — affects all 37 product families</span>';
    html += '</div>';

    // Main node chain
    html += '<div class="sys-dash__chain">';
    nodes.forEach(function (n, idx) {
      var cert = n.certainty || 'gray';
      var status = n.status || 'unknown';
      var icon = STATUS_ICONS[status] || '\u25cb';
      var date = n.date || n.target_date || n.estimated_date || n.statutory_deadline || '';
      var hasSubs = n.sub_items && n.sub_items.length > 0;

      html += '<div class="sys-dash__node" data-sys-idx="' + idx + '" tabindex="0">';

      // Connector line (not before first node)
      if (idx > 0) html += '<div class="sys-dash__connector"></div>';

      // Node dot
      html += '<div class="sys-dash__dot sys-dash__dot--' + cert + '">' + icon + '</div>';

      // Label + date
      html += '<div class="sys-dash__label">';
      html += '<span class="sys-dash__name">' + esc(n.label || '') + '</span>';
      if (date) html += '<span class="sys-dash__date">' + esc(date) + '</span>';
      html += '</div>';

      // Expansion indicator
      if (hasSubs) html += '<span class="sys-dash__expand-arrow">\u25be</span>';

      html += '</div>'; // node
    });
    html += '</div>'; // chain

    // DPP callout
    if (dppNode) {
      var dppDate = dppNode.estimated_date || dppNode.date || 'TBD';
      var dppCert = dppNode.certainty || 'gray';
      html += '<div class="sys-dash__callout sys-dash__callout--' + dppCert + '">';
      html += '<span class="sys-dash__callout-label">Earliest possible DPP obligation</span>';
      html += '<span class="sys-dash__callout-date">' + esc(dppDate) + '</span>';
      html += '<span class="sys-dash__callout-cert">';
      html += '<span class="sys-dash__cert-dot sys-dash__cert-dot--' + dppCert + '"></span>';
      html += esc(CERTAINTY_LABELS[dppCert] || dppCert);
      html += '</span>';
      html += '</div>';
    }

    // Cross-cutting instruments
    if (crossCutting.length > 0) {
      html += '<div class="sys-dash__cross">';
      html += '<span class="sys-dash__cross-label">Cross-cutting instruments</span>';
      html += '<div class="sys-dash__cross-items">';
      crossCutting.forEach(function (cc) {
        var cert = cc.certainty || 'gray';
        var status = cc.status || 'unknown';
        var icon = STATUS_ICONS[status] || '\u25cb';
        html += '<div class="sys-dash__cross-item">';
        html += '<span class="sys-dash__dot sys-dash__dot--' + cert + ' sys-dash__dot--small">' + icon + '</span>';
        html += '<span class="sys-dash__cross-name">' + esc(cc.label || '') + '</span>';
        html += '</div>';
      });
      html += '</div>'; // cross-items
      html += '</div>'; // cross
    }

    // Expansion panel (hidden, filled on click)
    html += '<div class="sys-dash__detail" id="sysDashDetail" hidden></div>';

    html += '</div>'; // sys-dash

    container.innerHTML = html;

    // ---------- EVENT HANDLERS ----------
    var dashEl = container.querySelector('.sys-dash');
    if (!dashEl) return;

    // Node click → expand detail
    dashEl.addEventListener('click', function (e) {
      var nodeEl = e.target.closest('.sys-dash__node');
      if (!nodeEl) return;

      var idx = parseInt(nodeEl.getAttribute('data-sys-idx'), 10);
      if (isNaN(idx)) return;
      var node = nodes[idx];
      if (!node) return;

      var detailEl = document.getElementById('sysDashDetail');
      if (!detailEl) return;

      // Toggle: if already showing this node, hide
      var wasActive = nodeEl.classList.contains('sys-dash__node--active');
      var prevActive = dashEl.querySelector('.sys-dash__node--active');
      if (prevActive) prevActive.classList.remove('sys-dash__node--active');

      if (wasActive) {
        detailEl.setAttribute('hidden', '');
        return;
      }

      nodeEl.classList.add('sys-dash__node--active');
      detailEl.removeAttribute('hidden');
      detailEl.innerHTML = buildNodeDetail(node);
    });

    // Keyboard support
    dashEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var target = e.target.closest('.sys-dash__node');
      if (!target) return;
      e.preventDefault();
      target.click();
    });
  };

  // ---------- NODE DETAIL ----------
  function buildNodeDetail(node) {
    var cert = node.certainty || 'gray';
    var status = node.status || 'unknown';
    var date = node.date || node.target_date || node.estimated_date || node.statutory_deadline || '';
    var hasSubs = node.sub_items && node.sub_items.length > 0;

    var html = '<div class="sys-dash__detail-inner">';

    // Header
    html += '<div class="sys-dash__detail-header">';
    html += '<span class="sys-dash__detail-title">' + esc(node.label || '') + '</span>';
    html += '<span class="sys-dash__detail-status sys-dash__detail-status--' + cert + '">';
    html += esc(STATUS_LABELS[status] || status);
    html += '</span>';
    if (date) html += '<span class="sys-dash__detail-date">' + esc(date) + '</span>';
    html += '</div>';

    // Detail text
    if (node.detail) {
      html += '<p class="sys-dash__detail-text">' + esc(node.detail) + '</p>';
    }

    // Sub-items (e.g., JTC24's 8 standards)
    if (hasSubs) {
      html += '<div class="sys-dash__subs">';
      html += '<span class="sys-dash__subs-label">Sub-items (' + node.sub_items.length + ')</span>';
      html += '<div class="sys-dash__subs-list">';
      node.sub_items.forEach(function (sub) {
        var subStatus = sub.status || 'unknown';
        var subIcon = STATUS_ICONS[subStatus] || '\u25cb';
        var subCls = subStatus === 'in_progress' ? 'amber' : subStatus === 'unknown' ? 'gray' : 'green';
        html += '<div class="sys-dash__sub-item">';
        html += '<span class="sys-dash__dot sys-dash__dot--' + subCls + ' sys-dash__dot--small">' + subIcon + '</span>';
        html += '<span class="sys-dash__sub-id">' + esc(sub.id || '') + '</span>';
        html += '<span class="sys-dash__sub-label">' + esc(sub.label || '') + '</span>';
        html += '</div>';
      });
      html += '</div>'; // subs-list
      html += '</div>'; // subs
    }

    // Sources
    if (node.sources && node.sources.length > 0) {
      html += '<div class="sys-dash__detail-sources">';
      html += 'Sources: ' + node.sources.map(function (s) { return esc(s); }).join(', ');
      html += '</div>';
    }

    html += '</div>'; // detail-inner
    return html;
  }

  // ---------- UTIL ----------
  function esc(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }
})();
