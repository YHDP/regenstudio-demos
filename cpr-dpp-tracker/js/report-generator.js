// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * report-generator.js — Multi-level HTML report engine.
 * Generates screen/print-ready HTML reports at three levels:
 *   - General: all families overview + system timeline
 *   - Family:  one family deep dive
 *   - Standard: one standard detail
 *
 * Depends on: ContentRenderer (content-renderer.js)
 */
(function () {
  'use strict';

  var CERTAINTY_LABELS = {
    green: 'Confirmed', 'yellow-green': 'Scheduled', amber: 'Estimated',
    orange: 'Moderate confidence', 'red-orange': 'Speculative', red: 'Speculative', gray: 'Unknown'
  };

  var STATUS_LABELS = {
    complete: 'Complete', in_progress: 'In progress', draft: 'Draft',
    pending: 'Pending', not_started: 'Not started', unknown: 'Unknown',
    phase_1_active: 'Phase 1 active'
  };

  var PIPELINE_LABELS = {
    A: 'New-CPR hEN Route (2024/3110)',
    B: 'Old-CPR Fast-Track (305/2011)',
    C: 'Old EAD Sunset',
    D: 'New EAD Route (future)',
    E: 'ESPR Supplementary'
  };

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function certDot(certainty) {
    return '<span class="rg-cert-dot rg-cert-dot--' + esc(certainty || 'gray') + '" title="' + esc(CERTAINTY_LABELS[certainty] || 'Unknown') + '"></span>';
  }

  function statusBadge(status) {
    return '<span class="rg-status rg-status--' + esc(status || 'unknown') + '">' + esc(STATUS_LABELS[status] || status || 'Unknown') + '</span>';
  }

  /**
   * Generate a report.
   *
   * @param {string} level — 'general' | 'family' | 'standard'
   * @param {Object} data — { families, systemTimeline }
   * @param {Object} [options]
   * @param {string} [options.target] — family letter (for 'family') or standard id (for 'standard')
   * @param {boolean} [options.includeSources] — show [S#] citations (default: true)
   * @param {boolean} [options.includeNarrative] — include content{} prose (default: true)
   * @param {string}  [options.format] — 'screen' | 'print' (default: 'screen')
   * @returns {string} HTML string
   */
  function generateReport(level, data, options) {
    options = options || {};
    var families = data.families || [];
    var systemTimeline = data.systemTimeline || {};

    switch (level) {
      case 'general':
        return generateGeneralReport(families, systemTimeline, options);
      case 'family':
        return generateFamilyReport(families, systemTimeline, options);
      case 'standard':
        return generateStandardReport(families, options);
      default:
        return '<p>Unknown report level: ' + esc(level) + '</p>';
    }
  }

  // ── GENERAL REPORT ──────────────────────────────────────────

  function generateGeneralReport(families, systemTimeline, options) {
    var sorted = families.slice().sort(function (a, b) {
      return dppSortKey(a) - dppSortKey(b);
    });

    var html = '<div class="rg-report rg-report--general">';
    html += '<h1 class="rg-title">CPR Digital Product Passport Overview</h1>';
    html += '<p class="rg-subtitle">' + sorted.length + ' Product Families &middot; ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '</p>';

    // System Timeline section
    html += renderSystemTimeline(systemTimeline);

    // Pipeline summary
    html += renderPipelineSummary(sorted);

    // Family overview table
    html += '<h2 class="rg-heading">Product Family Overview</h2>';
    html += '<table class="rg-table">';
    html += '<thead><tr>';
    html += '<th>#</th><th>Family</th><th>Letter</th><th>TC</th><th>Pipelines</th><th>DPP Est</th><th>Certainty</th>';
    html += '</tr></thead><tbody>';

    sorted.forEach(function (fam, i) {
      var conv = fam.convergence;
      var dpp = (conv && conv.dpp_date) || fam['dpp-est'] || 'TBD';
      var certainty = (conv && conv.dpp_certainty) || 'gray';
      var pipes = (fam.active_pipelines || []).concat(fam.future_pipelines || []);

      html += '<tr>';
      html += '<td>' + (i + 1) + '</td>';
      html += '<td>' + esc(fam.display_name || fam.full_name || '') + '</td>';
      html += '<td>' + esc(fam.letter || '') + '</td>';
      html += '<td>' + esc(fam.tc || '') + '</td>';
      html += '<td>' + pipes.map(function (p) { return '<span class="rg-pipe-badge">' + esc(p) + '</span>'; }).join(' ') + '</td>';
      html += '<td class="rg-dpp-est">' + esc(dpp) + '</td>';
      html += '<td>' + certDot(certainty) + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table>';

    // Per-family one-liner summaries
    if (options.includeNarrative !== false) {
      html += '<h2 class="rg-heading">Family Summaries</h2>';
      sorted.forEach(function (fam) {
        var about = fam.content && fam.content.about;
        var dppOutlook = fam.content && fam.content.dpp_outlook;
        if (!about && !dppOutlook) return;

        html += '<div class="rg-family-summary">';
        html += '<h3>' + esc(fam.display_name || fam.full_name) + ' <small>(' + esc(fam.letter) + ')</small></h3>';
        if (about) html += '<p>' + formatText(about, options) + '</p>';
        if (dppOutlook) html += '<p class="rg-dpp-text">' + formatText(dppOutlook, options) + '</p>';
        html += '</div>';
      });
    }

    html += '</div>';
    return html;
  }

  // ── FAMILY REPORT ───────────────────────────────────────────

  function generateFamilyReport(families, systemTimeline, options) {
    var letter = options.target;
    var fam = families.find(function (f) { return f.letter === letter; });
    if (!fam) return '<p>Family not found: ' + esc(letter) + '</p>';

    var conv = fam.convergence;
    var dpp = (conv && conv.dpp_date) || fam['dpp-est'] || 'TBD';

    var html = '<div class="rg-report rg-report--family">';
    html += '<h1 class="rg-title">' + esc(fam.display_name || fam.full_name) + '</h1>';
    html += '<p class="rg-subtitle">' + esc(fam.letter) + ' &middot; Annex VII #' + esc(fam.family || '') + ' &middot; ' + esc(fam.tc || '') + '</p>';

    // DPP date box
    html += '<div class="rg-dpp-box">';
    html += '<strong>Estimated DPP:</strong> ' + esc(dpp);
    if (conv && conv.binding_constraint) {
      html += ' <span class="rg-binding">(binding: ' + esc(conv.binding_constraint) + ' timeline)</span>';
    }
    if (conv && conv.dpp_certainty) {
      html += ' ' + certDot(conv.dpp_certainty);
    }
    html += '</div>';

    // Convergence formula
    if (conv && conv.formula_note) {
      html += '<p class="rg-formula">' + esc(conv.formula_note) + '</p>';
    }

    // Pipeline nodes
    html += renderPipelineNodes(fam);

    // Content sections
    if (options.includeNarrative !== false && fam.content) {
      html += '<h2 class="rg-heading">Analysis</h2>';
      if (window.ContentRenderer) {
        html += window.ContentRenderer.renderFamilyContent(fam.content, {
          collapsible: false,
          expandAll: true,
          showSources: options.includeSources !== false
        });
      }
    }

    // Standards table
    var stds = Array.isArray(fam.standards) ? fam.standards : [];
    if (stds.length) {
      var henStds = stds.filter(function (s) { return s.type === 'hEN'; });
      var eadStds = stds.filter(function (s) { return s.type === 'EAD'; });

      if (henStds.length) {
        html += '<h2 class="rg-heading">hEN Standards (' + henStds.length + ')</h2>';
        html += renderStandardsTable(henStds, 'hEN', options);
      }
      if (eadStds.length) {
        html += '<h2 class="rg-heading">EAD Standards (' + eadStds.length + ')</h2>';
        html += renderStandardsTable(eadStds, 'EAD', options);
      }
    }

    // Standards summary — counts computed from standards[] array
    var sm = fam.standards_summary;
    var stds = fam.standards || [];
    var henCount = 0, eadCount = 0;
    stds.forEach(function (s) { if (s.type === 'EAD') eadCount++; else henCount++; });
    var listed = stds.length;
    if (sm && sm.completeness) {
      html += '<p class="rg-note"><em>';
      if (sm.completeness === 'partial') {
        html += listed + ' standards shown (partial)';
      } else if (sm.completeness === 'full') {
        html += 'All ' + listed + ' standards shown';
      }
      if (sm.source) html += ' &mdash; ' + esc(sm.source);
      html += '</em></p>';
    }

    html += '</div>';
    return html;
  }

  // ── STANDARD REPORT ─────────────────────────────────────────

  function generateStandardReport(families, options) {
    var targetId = options.target;
    var foundFam = null;
    var foundStd = null;

    families.forEach(function (fam) {
      if (foundStd) return;
      var stds = Array.isArray(fam.standards) ? fam.standards : [];
      stds.forEach(function (s) {
        if (s.id === targetId) {
          foundFam = fam;
          foundStd = s;
        }
      });
    });

    if (!foundStd) return '<p>Standard not found: ' + esc(targetId) + '</p>';

    var html = '<div class="rg-report rg-report--standard">';
    html += '<h1 class="rg-title">' + esc(foundStd.id) + '</h1>';
    html += '<p class="rg-subtitle">' + esc(foundStd.name || '') + '</p>';

    html += '<table class="rg-detail-table">';
    html += detailRow('Type', foundStd.type);
    html += detailRow('Family', (foundFam.display_name || foundFam.full_name) + ' (' + foundFam.letter + ')');
    html += detailRow('TC/WG', foundStd.tc_wg);
    html += detailRow('AVCP', foundStd.avcp);
    html += detailRow('Revision', foundStd.revision);
    html += detailRow('OJ Cited', foundStd.cited ? 'Yes' : 'No');
    html += detailRow('SReq Table', foundStd.sreq_table);
    html += detailRow('Delivery', foundStd.delivery);
    html += detailRow('Dev Stage', foundStd.dev_stage);
    html += detailRow('Stage', foundStd.stage);
    html += detailRow('Publication Est', foundStd.pub_est);
    html += detailRow('DPP Est', foundStd.dpp_est);
    html += detailRow('DPP Route', foundStd.dpp_route);
    if (foundStd.notes) html += detailRow('Notes', foundStd.notes);
    html += '</table>';

    // Per-standard content
    if (foundStd.content && window.ContentRenderer) {
      html += '<h2 class="rg-heading">Analysis</h2>';
      html += window.ContentRenderer.renderStandardContent(foundStd.content, {
        showSources: options.includeSources !== false
      });
    }

    // Pipeline context
    html += '<h2 class="rg-heading">Pipeline Context</h2>';
    var pipes = foundFam.pipelines || {};
    var pipeKeys = Object.keys(pipes);
    pipeKeys.forEach(function (key) {
      var pipe = pipes[key];
      html += '<p><strong>Pipeline ' + esc(key) + ':</strong> ' + esc(pipe.label || '') +
        ' (DPP outcome: ' + (pipe.dpp_outcome ? 'Yes' : 'No') + ')</p>';
    });

    html += '</div>';
    return html;
  }

  // ── SHARED HELPERS ──────────────────────────────────────────

  function dppSortKey(fam) {
    var str = (fam.convergence && fam.convergence.dpp_date) || (fam['dpp-range'] && fam['dpp-range'].envelope) || fam['dpp-est'] || '';
    if (!str || str === 'TBD') return 9999;
    var m = str.match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 9999;
  }

  function formatText(text, options) {
    if (!text) return '';
    if (options && options.includeSources !== false && window.ContentRenderer) {
      return window.ContentRenderer.formatSourceCitations(text);
    }
    return esc(text);
  }

  function detailRow(label, value) {
    if (!value && value !== false && value !== 0) return '';
    return '<tr><th>' + esc(label) + '</th><td>' + esc(String(value)) + '</td></tr>';
  }

  function renderSystemTimeline(systemTimeline) {
    if (!systemTimeline || !systemTimeline.nodes) return '';
    var nodes = systemTimeline.nodes;
    var cc = systemTimeline.cross_cutting || [];

    var html = '<h2 class="rg-heading">System Timeline</h2>';
    html += '<p class="rg-updated">Last updated: ' + esc(systemTimeline.updated || '') + '</p>';

    html += '<table class="rg-table rg-table--system">';
    html += '<thead><tr><th>Milestone</th><th>Status</th><th>Date</th><th>Detail</th></tr></thead><tbody>';

    nodes.forEach(function (n) {
      html += '<tr>';
      html += '<td>' + certDot(n.certainty) + ' ' + esc(n.label) + '</td>';
      html += '<td>' + statusBadge(n.status) + '</td>';
      html += '<td>' + esc(n.date || n.estimated_date || n.statutory_deadline || n.target_date || '') + '</td>';
      html += '<td>' + esc(n.detail || '') + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table>';

    if (cc.length) {
      html += '<h3 class="rg-subheading">Cross-cutting Instruments</h3>';
      html += '<table class="rg-table rg-table--system">';
      html += '<thead><tr><th>Instrument</th><th>Status</th><th>Detail</th></tr></thead><tbody>';
      cc.forEach(function (c) {
        html += '<tr>';
        html += '<td>' + certDot(c.certainty) + ' ' + esc(c.label) + '</td>';
        html += '<td>' + statusBadge(c.status) + '</td>';
        html += '<td>' + esc(c.detail || '') + '</td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
    }

    return html;
  }

  function renderPipelineSummary(families) {
    var counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    families.forEach(function (fam) {
      (fam.active_pipelines || []).forEach(function (p) {
        counts[p] = (counts[p] || 0) + 1;
      });
    });

    var html = '<h2 class="rg-heading">Pipeline Distribution</h2>';
    html += '<div class="rg-pipe-summary">';
    Object.keys(counts).forEach(function (key) {
      if (counts[key] > 0) {
        html += '<span class="rg-pipe-count"><strong>' + esc(key) + '</strong>: ' + counts[key] + ' families';
        html += ' <small>(' + esc(PIPELINE_LABELS[key] || '') + ')</small></span> ';
      }
    });
    html += '</div>';
    return html;
  }

  function renderPipelineNodes(fam) {
    var pipes = fam.pipelines;
    if (!pipes) return '';

    var html = '<h2 class="rg-heading">Pipeline Nodes</h2>';
    var keys = Object.keys(pipes);
    keys.forEach(function (key) {
      var pipe = pipes[key];
      var isFuture = (fam.future_pipelines || []).indexOf(key) !== -1;
      html += '<h3 class="rg-subheading' + (isFuture ? ' rg-subheading--future' : '') + '">';
      html += 'Pipeline ' + esc(key) + ': ' + esc(pipe.label || '');
      html += pipe.dpp_outcome ? ' <span class="rg-dpp-badge">DPP</span>' : '';
      html += isFuture ? ' <span class="rg-future-badge">Future</span>' : '';
      html += '</h3>';

      var nodes = pipe.nodes || [];
      if (!nodes.length) {
        html += '<p class="rg-note">No nodes defined.</p>';
        return;
      }

      html += '<table class="rg-table rg-table--nodes">';
      html += '<thead><tr><th>Node</th><th>Status</th><th>Date</th><th>Detail</th></tr></thead><tbody>';
      nodes.forEach(function (n) {
        var dateStr = n.date || n.estimated_date || n.target_date || n.statutory_deadline || '';
        html += '<tr>';
        html += '<td>' + certDot(n.certainty) + ' ' + esc(n.label) + '</td>';
        html += '<td>' + statusBadge(n.status) + '</td>';
        html += '<td>' + esc(dateStr) + '</td>';
        html += '<td>' + esc(n.detail || '') + '</td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
    });

    return html;
  }

  function renderStandardsTable(stds, type, options) {
    var html = '<table class="rg-table rg-table--standards">';
    if (type === 'hEN') {
      html += '<thead><tr><th>Standard</th><th>Name</th><th>TC/WG</th><th>Stage</th><th>Delivery</th><th>DPP Est</th></tr></thead><tbody>';
      stds.forEach(function (s) {
        html += '<tr>';
        html += '<td>' + esc(s.id) + '</td>';
        html += '<td>' + esc(s.name || '') + '</td>';
        html += '<td>' + esc(s.tc_wg || '') + '</td>';
        html += '<td>' + esc(s.dev_stage || s.stage || '') + '</td>';
        html += '<td>' + esc(s.delivery || '') + '</td>';
        html += '<td class="rg-dpp-est">' + esc(s.dpp_est || '') + '</td>';
        html += '</tr>';
      });
    } else {
      html += '<thead><tr><th>EAD</th><th>Name</th><th>AVCP</th><th>Cited</th><th>DPP Est</th></tr></thead><tbody>';
      stds.forEach(function (s) {
        html += '<tr>';
        html += '<td>' + esc(s.id) + '</td>';
        html += '<td>' + esc(s.name || '') + '</td>';
        html += '<td>' + esc(s.avcp || '') + '</td>';
        html += '<td>' + (s.cited ? 'Yes' : 'No') + '</td>';
        html += '<td class="rg-dpp-est">' + esc(s.dpp_est || '') + '</td>';
        html += '</tr>';
      });
    }
    html += '</tbody></table>';
    return html;
  }

  // Public API
  window.ReportGenerator = {
    generate: generateReport
  };

})();
