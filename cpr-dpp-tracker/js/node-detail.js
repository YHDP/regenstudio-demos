// node-detail.js — Node click → expandable detail panel
// Shows status, certainty, dates, detail text, source citations.

(function () {
  'use strict';

  var CERTAINTY_LABELS = {
    green: 'Confirmed', 'yellow-green': 'Scheduled', amber: 'Estimated',
    orange: 'Moderate confidence', 'red-orange': 'Speculative', red: 'Speculative', gray: 'Unknown'
  };

  var STATUS_LABELS = {
    complete: 'Complete', in_progress: 'In progress', draft: 'Draft published',
    active: 'Active', overdue: 'Overdue', pending: 'Pending',
    not_started: 'Not started', unknown: 'Unknown', phase_1_active: 'Phase 1 active'
  };

  var PIPELINE_NAMES = {
    A: 'New-CPR hEN Route (2024/3110)',
    B: 'Old-CPR Fast-Track (305/2011)',
    C: 'Old EAD Sunset (305/2011)',
    D: 'New EAD Future',
    E: 'ESPR Supplementary',
    SYS: 'System Timeline'
  };

  var activePanel = null;

  // Show detail panel for a node
  window.showNodeDetail = function (targetEl, node, colKey) {
    // Remove existing panel
    hideNodeDetail();

    var cert = node.certainty || 'gray';
    var status = node.status || 'not_started';

    var html = '<div class="node-detail node-detail--' + cert + '">';
    html += '<div class="node-detail__header">';
    html += '<span class="node-detail__title">' + esc(node.label || node.type || '') + '</span>';
    html += '<button class="node-detail__close" aria-label="Close detail">&times;</button>';
    html += '</div>';

    html += '<div class="node-detail__body">';

    // Status + certainty
    html += '<div class="node-detail__row">';
    html += '<span class="node-detail__label">Status</span>';
    html += '<span class="node-detail__value">' + esc(STATUS_LABELS[status] || status) + '</span>';
    html += '</div>';

    html += '<div class="node-detail__row">';
    html += '<span class="node-detail__label">Certainty</span>';
    html += '<span class="node-detail__value"><span class="node-detail__cert-dot node-detail__cert-dot--' + cert + '"></span> ' + esc(CERTAINTY_LABELS[cert] || cert) + '</span>';
    html += '</div>';

    // Pipeline
    html += '<div class="node-detail__row">';
    html += '<span class="node-detail__label">Pipeline</span>';
    html += '<span class="node-detail__value">' + esc(PIPELINE_NAMES[colKey] || colKey) + '</span>';
    html += '</div>';

    // Dates — prominent display
    var dates = [];
    if (node.date) dates.push({ label: 'Date', value: node.date, type: 'confirmed' });
    if (node.target_date) dates.push({ label: 'Target date', value: node.target_date, type: 'target' });
    if (node.estimated_date) dates.push({ label: 'Estimated date', value: node.estimated_date, type: 'estimated' });
    if (node.statutory_deadline) dates.push({ label: 'Statutory deadline', value: node.statutory_deadline, type: 'deadline' });
    if (dates.length > 0) {
      html += '<div class="node-detail__dates">';
      dates.forEach(function (d) {
        html += '<div class="node-detail__date node-detail__date--' + d.type + '">';
        html += '<span class="node-detail__date-label">' + esc(d.label) + '</span>';
        html += '<span class="node-detail__date-value">' + esc(d.value) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Detail text
    if (node.detail) {
      html += '<div class="node-detail__detail">' + esc(node.detail) + '</div>';
    }

    // Sub-items (e.g. JTC24 standards)
    if (node.sub_items && node.sub_items.length > 0) {
      html += '<div class="node-detail__sub-items">';
      html += '<span class="node-detail__label">Sub-items (' + node.sub_items.length + ')</span>';
      html += '<ul>';
      node.sub_items.forEach(function (si) {
        var siStatus = si.status || 'unknown';
        html += '<li><span class="node-detail__sub-status node-detail__sub-status--' + siStatus + '">';
        html += siStatus === 'in_progress' ? '\u25d0' : (siStatus === 'unknown' ? '?' : '\u25cb');
        html += '</span> ' + esc(si.label || si.id || '') + '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }

    // Sources with claim verification status
    // Each source reference carries a verification level for the node's claim:
    //   verified    = human confirmed the claim is in the source
    //   agent_verified = agent confirmed the claim is in the source
    //   cited       = source cited as relevant, claim not independently verified
    if (node.sources && node.sources.length > 0) {
      html += '<div class="node-detail__sources">';
      html += '<span class="node-detail__label">Sources</span>';
      html += '<div class="node-detail__source-list">';
      var sourcesDb = window._cprSources || {};
      node.sources.forEach(function (ref) {
        // Normalise: supports both string IDs and {id, claim} objects
        var sid = typeof ref === 'object' ? ref.id : ref;
        var claimStatus = typeof ref === 'object' && ref.claim ? ref.claim : 'cited';
        var claimLabel = claimStatus === 'verified' ? 'Verified'
          : claimStatus === 'agent_verified' ? 'Agent verified'
          : 'Cited';
        var src = sourcesDb[sid];
        var statusTag = ' \u00b7 Claim: ' + claimLabel;
        if (src && src.url) {
          html += '<a href="' + escAttr(src.url) + '" target="_blank" rel="noopener" class="node-detail__source-link" title="' + escAttr(src.title || sid) + '">';
          html += esc(trunc(src.title || sid, 50)) + ' [' + esc(sid) + ']' + esc(statusTag);
          html += '</a>';
        } else if (src) {
          html += '<span class="node-detail__source-tag" title="' + escAttr(src.title || sid) + '">';
          html += esc(trunc(src.title || sid, 50)) + ' [' + esc(sid) + ']' + esc(statusTag);
          html += '</span>';
        } else {
          html += '<span class="node-detail__source-tag">' + esc(sid) + esc(statusTag) + '</span>';
        }
      });
      html += '</div>';
      html += '</div>';
    }

    // Source validation guard: warn if node has no sources
    if (!node.sources || node.sources.length === 0) {
      html += '<div class="node-detail__note" style="background:rgba(239,68,68,0.08);color:#ef4444;">';
      html += '<strong>Missing sources.</strong> Every node must cite at least one source. ';
      html += 'This node needs source attribution before it can be considered reliable.';
      html += '</div>';
    }

    // DPP note for non-DPP pipelines
    if (colKey === 'B') {
      html += '<div class="node-detail__note">DPP does NOT apply via this pipeline \u2014 requires Pipeline A (new CPR).</div>';
    } else if (colKey === 'C') {
      html += '<div class="node-detail__note">Old-regime EADs do not trigger DPP. Replacement needed under new CPR.</div>';
    }

    html += '</div>'; // body
    html += '</div>'; // node-detail

    // Position panel relative to the node's actual location in the chart
    var panel = document.createElement('div');
    panel.className = 'node-detail__wrapper';
    panel.innerHTML = html;

    var chart = targetEl.closest('.conv-chart');
    if (chart) {
      // Get node's position relative to chart container
      var nodeRect = targetEl.getBoundingClientRect();
      var chartRect = chart.getBoundingClientRect();
      var panelTop = nodeRect.bottom - chartRect.top + 4;

      // Anchor to the column the node is in
      var col = targetEl.closest('.conv-chart__col');
      var colRect = col ? col.getBoundingClientRect() : nodeRect;
      var panelLeft = colRect.left - chartRect.left;

      panel.style.position = 'absolute';
      panel.style.top = panelTop + 'px';
      panel.style.left = panelLeft + 'px';
      panel.style.minWidth = '260px';
      panel.style.maxWidth = '360px';
      panel.style.zIndex = '10';

      // If panel would overflow chart right edge, shift left
      var chartWidth = chartRect.width;
      if (panelLeft + 360 > chartWidth) {
        panel.style.left = Math.max(0, chartWidth - 360) + 'px';
      }

      chart.appendChild(panel);
    } else {
      // Fallback: insert as sibling (shouldn't happen)
      targetEl.parentNode.insertBefore(panel, targetEl.nextSibling);
    }

    activePanel = panel;

    // Close button
    panel.querySelector('.node-detail__close').addEventListener('click', function (e) {
      e.stopPropagation();
      hideNodeDetail();
    });
  };

  window.hideNodeDetail = function () {
    if (activePanel) {
      activePanel.parentNode.removeChild(activePanel);
      activePanel = null;
    }
  };

  function esc(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  function escAttr(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function trunc(str, max) {
    if (!str || str.length <= max) return str || '';
    return str.substring(0, max - 1) + '\u2026';
  }
})();
