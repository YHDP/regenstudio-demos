// node-expansion.js — Expandable per-standard panels for convergence chart nodes
// Handles NT-5 (Standards Development), NT-7 (OJ Citation), NT-8 (Coexistence Period).
// Renders below the chart as a separate panel.

(function () {
  'use strict';

  var STAGE_LABELS = ['Pending', 'Mandated', 'In dev', 'Delivered', 'Mandatory', 'DPP'];
  var EAD_STAGE_LABELS = ['None', 'Legacy EAD', 'In development', 'Adopted', 'Art 75 DA', 'DPP'];

  var activeContainer = null;

  // ---------- PUBLIC API ----------

  window.isExpandableNode = function (node, colKey) {
    if (colKey === 'SYS') return false;
    var type = node.type || '';
    return type === 'NT-5' || type === 'NT-7' || type === 'NT-8' ||
           type === 'NT-C1' || type === 'NT-C2' || type === 'NT-C3' || type === 'NT-C4' ||
           !!node.standards_ref;
  };

  window.showNodeExpansion = function (container, node, colKey, family) {
    hideExp();

    var standards = family.standards || [];
    var matching = getStdsForPipeline(standards, colKey);
    var sourcesDb = window._cprSources || {};

    if (matching.length === 0) {
      container.innerHTML = buildEmpty();
      activeContainer = container;
      wireClose(container);
      return;
    }

    var type = node.type || '';
    var html = '';

    if (node.standards_ref || type === 'NT-5') {
      html = buildStdDevPanel(matching, colKey, sourcesDb);
    } else if (type === 'NT-7') {
      html = buildOjCitationPanel(matching, colKey, sourcesDb);
    } else if (type === 'NT-8') {
      html = buildCoexistencePanel(matching, colKey, sourcesDb);
    } else if (type === 'NT-C1') {
      html = buildLegacyEadPanel(matching, sourcesDb);
    } else if (type === 'NT-C2') {
      html = buildEadSunsetPanel(matching, sourcesDb);
    } else if (type === 'NT-C3') {
      html = buildEadTransitionPanel(matching, sourcesDb);
    } else if (type === 'NT-C4') {
      html = buildEtaExpiryPanel(matching, sourcesDb);
    }

    if (!html) return;

    container.innerHTML = html;
    activeContainer = container;
    wireClose(container);
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.hideNodeExpansion = function () {
    hideExp();
  };

  function hideExp() {
    if (activeContainer) {
      activeContainer.innerHTML = '';
      activeContainer = null;
    }
  }

  // ---------- HELPERS ----------

  function getStdsForPipeline(standards, pipeKey) {
    if (pipeKey === 'A' || pipeKey === 'B') {
      return standards.filter(function (s) { return s.type === 'hEN'; });
    }
    if (pipeKey === 'C') {
      return standards.filter(function (s) { return s.type === 'EAD'; });
    }
    return [];
  }

  function computeHenStage(s) {
    var today = new Date().toISOString().slice(0, 10);
    if (s.dev_stage || s.stage) {
      if (s.mand_est && /^\d{4}/.test(s.mand_est) && s.mand_est <= today) return 4;
      if (s.pub_est && /^\d{4}/.test(s.pub_est) && s.pub_est <= today) return 3;
      return 2;
    }
    if (s.sreq_table || s.delivery) return 1;
    return 0;
  }

  function computeEadStage(s) {
    if (s.regime === 'new') return 3;
    if (s.new_ead) return 2;
    return 1;
  }

  // ---------- REGIME-AWARE CITATION STATUS ----------
  // OJ citation and coexistence meaning depends on which pipeline we're in:
  //   Pipeline A/D (new CPR 2024/3110): cited field = old-regime citation (legacy)
  //   Pipeline B/C (old CPR 305/2011): cited field = directly applicable

  function isNewCprPipeline(colKey) {
    return colKey === 'A' || colKey === 'D';
  }

  function isOldRevision(std) {
    return std.revision === 'CPR 2011' || std.regime === 'old';
  }

  // Returns { status, icon, cls, label } for a standard's OJ citation
  function determineCitationStatus(std, colKey) {
    var isCited = !!std.cited;

    if (isNewCprPipeline(colKey)) {
      // New CPR pipeline: distinguish new-regime vs legacy citation
      var hasNewCitation = isCited && !isOldRevision(std);
      if (hasNewCitation) {
        return { status: 'cited_new', icon: '\u2713', cls: '--positive', label: 'Cited under CPR 2024/3110' };
      } else if (isCited && isOldRevision(std)) {
        return { status: 'legacy', icon: '\u25d0', cls: '--legacy', label: 'Legacy citation (CPR 305/2011) \u2014 needs new Art. 5(8) citation' };
      } else {
        return { status: 'not_cited', icon: '\u25cb', cls: '', label: 'New standard \u2014 not yet cited' };
      }
    } else {
      // Old CPR pipeline (B, C): cited field directly applies
      if (isCited) {
        return { status: 'cited', icon: '\u2713', cls: '--positive', label: 'Cited in OJ (CPR 305/2011)' };
      } else {
        return { status: 'not_cited', icon: '\u25cb', cls: '', label: 'Not yet cited' };
      }
    }
  }

  // Returns { icon, cls, label } for a standard's coexistence status
  function determineCoexistenceStatus(std, colKey) {
    var citation = determineCitationStatus(std, colKey);
    var hasMand = !!std.mand_est;

    if (isNewCprPipeline(colKey)) {
      // New CPR: coexistence depends on new-regime OJ citation
      if (citation.status === 'cited_new') {
        if (hasMand) {
          return { icon: '\u2713', cls: '--positive', label: 'Mandatory from ' + std.mand_est };
        }
        return { icon: '\u25d0', cls: '--partial', label: 'Cited under new CPR \u2014 coexistence active' };
      } else if (citation.status === 'legacy') {
        return { icon: '\u25cb', cls: '--legacy', label: 'Legacy citation only \u2014 awaiting Art. 5(8) citation' };
      } else {
        return { icon: '\u25cb', cls: '', label: 'Not yet cited \u2014 coexistence not started' };
      }
    } else {
      // Old CPR: use existing citation status directly
      if (hasMand) {
        return { icon: '\u2713', cls: '--positive', label: 'Mandatory from ' + std.mand_est };
      } else if (std.cited) {
        return { icon: '\u25d0', cls: '--partial', label: 'Cited \u2014 coexistence active' };
      } else {
        return { icon: '\u25cb', cls: '', label: 'Not yet cited \u2014 coexistence not started' };
      }
    }
  }

  // Count citation stats for a set of standards in a pipeline context
  function countCitationStats(stds, colKey) {
    var newCited = 0, legacy = 0, notCited = 0;
    for (var i = 0; i < stds.length; i++) {
      var cs = determineCitationStatus(stds[i], colKey);
      if (cs.status === 'cited_new' || cs.status === 'cited') newCited++;
      else if (cs.status === 'legacy') legacy++;
      else notCited++;
    }
    return { newCited: newCited, legacy: legacy, notCited: notCited, total: stds.length };
  }

  function wireClose(container) {
    var btn = container.querySelector('.conv-expansion__close');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        hideExp();
        var active = document.querySelector('.conv-chart__node--active-detail');
        if (active) active.classList.remove('conv-chart__node--active-detail');
        if (window.hideNodeDetail) window.hideNodeDetail();
      });
    }
  }

  function renderSourceLink(sid, sourcesDb) {
    var src = sourcesDb[sid];
    if (!src) return '<span class="conv-expansion__source-tag">' + esc(sid) + '</span>';
    var title = src.title || sid;
    var status = src.status || '?';
    if (src.url) {
      return '<a href="' + escAttr(src.url) + '" target="_blank" rel="noopener" class="conv-expansion__source-link" title="' + escAttr(title) + '">' + esc(trunc(title, 55)) + ' [' + esc(sid) + '] ' + esc(status) + '</a>';
    }
    return '<span class="conv-expansion__source-tag" title="' + escAttr(title) + '">' + esc(trunc(title, 55)) + ' [' + esc(sid) + '] ' + esc(status) + '</span>';
  }

  function trunc(str, max) {
    if (!str || str.length <= max) return str || '';
    return str.substring(0, max - 1) + '\u2026';
  }

  function buildEmpty() {
    return '<div class="conv-expansion">' +
      '<div class="conv-expansion__header">' +
      '<span class="conv-expansion__title">No standards data</span>' +
      '<button class="conv-expansion__close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<p class="conv-expansion__empty">No standards data available for this pipeline.</p>' +
      '</div>';
  }

  function buildCardRow(label, value) {
    return '<div class="conv-expansion__card-row">' +
      '<span class="conv-expansion__card-label">' + esc(label) + '</span>' +
      '<span class="conv-expansion__card-value">' + esc(String(value)) + '</span>' +
      '</div>';
  }

  function buildStageDots(stage, max) {
    var html = '';
    for (var d = 1; d <= max; d++) {
      var cls = 'conv-expansion__stage-dot';
      if (d <= stage) cls += ' conv-expansion__stage-dot--filled';
      html += '<span class="' + cls + '"></span>';
    }
    return html;
  }

  // ---------- NT-5: STANDARDS DEVELOPMENT ----------

  function buildStdDevPanel(stds, colKey, sourcesDb) {
    var isEad = (colKey === 'C');
    var typeLabel = isEad ? 'EAD' : 'hEN';
    var stageLabels = isEad ? EAD_STAGE_LABELS : STAGE_LABELS;
    var maxDots = 5;

    var html = '<div class="conv-expansion">';
    html += '<div class="conv-expansion__header">';
    html += '<span class="conv-expansion__title">Standards Development \u2014 ' + stds.length + ' ' + typeLabel + ' standard' + (stds.length !== 1 ? 's' : '') + '</span>';
    html += '<button class="conv-expansion__close" aria-label="Close">&times;</button>';
    html += '</div>';

    html += '<div class="conv-expansion__grid">';
    for (var i = 0; i < stds.length; i++) {
      var s = stds[i];
      var stage = isEad ? computeEadStage(s) : computeHenStage(s);
      var stgLabel = stageLabels[stage] || 'Unknown';

      html += '<div class="conv-expansion__card">';

      // Header: ID + stage dots
      html += '<div class="conv-expansion__card-head">';
      html += '<span class="conv-expansion__card-id">' + esc(s.id || 'Unknown') + '</span>';
      html += '<span class="conv-expansion__card-dots">' + buildStageDots(stage, maxDots) + ' <span class="conv-expansion__stage-label">' + esc(stgLabel) + '</span></span>';
      html += '</div>';

      // Name
      if (s.name) html += '<div class="conv-expansion__card-name">' + esc(s.name) + '</div>';

      // Detail rows
      if (s.tc_wg) html += buildCardRow('TC', s.tc_wg);
      if (s.avcp) html += buildCardRow('AVCP', s.avcp);
      if (s.delivery) html += buildCardRow('Delivery', s.delivery);
      if (s.dpp_est) html += buildCardRow('DPP est', s.dpp_est);
      var citStatus = determineCitationStatus(s, colKey);
      if (citStatus.status === 'legacy') {
        html += buildCardRow('OJ cited', 'Legacy (305/2011)');
      } else if (citStatus.status === 'cited_new' || citStatus.status === 'cited') {
        html += buildCardRow('OJ cited', 'Yes');
      } else {
        html += buildCardRow('OJ cited', 'No');
      }
      if (isEad && s.expires) html += buildCardRow('Validity', s.expires);

      // Content narrative (if available)
      if (s.content) {
        if (s.content.status_narrative) {
          html += '<div class="conv-expansion__card-narrative">' + esc(s.content.status_narrative) + '</div>';
        }
        if (s.content.dpp_impact) {
          html += '<div class="conv-expansion__card-narrative conv-expansion__card-narrative--dpp">' + esc(s.content.dpp_impact) + '</div>';
        }
      }

      // Sources
      if (s.sources && s.sources.length > 0) {
        html += '<div class="conv-expansion__card-sources">';
        for (var j = 0; j < s.sources.length; j++) {
          html += renderSourceLink(s.sources[j], sourcesDb);
        }
        html += '</div>';
      }

      html += '</div>'; // card
    }
    html += '</div>'; // grid
    html += '</div>'; // expansion
    return html;
  }

  // ---------- NT-7: OJ CITATION (pipeline-aware) ----------

  function buildOjCitationPanel(stds, colKey, sourcesDb) {
    var stats = countCitationStats(stds, colKey);
    var isEad = (colKey === 'C');
    var typeLabel = isEad ? 'EAD' : 'hEN';
    var isNew = isNewCprPipeline(colKey);

    var html = '<div class="conv-expansion">';
    html += '<div class="conv-expansion__header">';

    // Title reflects pipeline context
    if (isNew && stats.legacy > 0) {
      html += '<span class="conv-expansion__title">OJ Citation \u2014 ' + stats.newCited + ' of ' + stats.total + ' cited under new CPR';
      html += ' <span class="conv-expansion__title-sub">(' + stats.legacy + ' legacy)</span></span>';
    } else {
      html += '<span class="conv-expansion__title">OJ Citation \u2014 ' + stats.newCited + ' of ' + stats.total + ' ' + typeLabel + ' standards cited</span>';
    }
    html += '<button class="conv-expansion__close" aria-label="Close">&times;</button>';
    html += '</div>';

    // Pipeline context banner for new-CPR pipelines
    if (isNew && stats.legacy > 0) {
      html += '<div class="conv-expansion__context">';
      html += '<strong>' + stats.legacy + ' standard' + (stats.legacy !== 1 ? 's have' : ' has') + ' legacy OJ citation</strong> under CPR 305/2011. ';
      html += 'These need <em>new</em> Art. 5(8) citation under CPR 2024/3110 before they can trigger DPP obligations.';
      html += '</div>';
    }

    html += '<div class="conv-expansion__list">';
    for (var j = 0; j < stds.length; j++) {
      var s = stds[j];
      var cs = determineCitationStatus(s, colKey);
      var cls = 'conv-expansion__list-item';
      if (cs.cls) cls += ' conv-expansion__list-item' + cs.cls;

      html += '<div class="' + cls + '">';
      html += '<span class="conv-expansion__list-icon">' + cs.icon + '</span>';
      html += '<span class="conv-expansion__list-id">' + esc(s.id || 'Unknown') + '</span>';
      html += '<span class="conv-expansion__list-name">' + esc(s.name || '') + '</span>';
      html += '<span class="conv-expansion__list-status">' + esc(cs.label) + '</span>';

      if (s.sources && s.sources.length > 0) {
        html += '<span class="conv-expansion__list-sources">';
        for (var k = 0; k < s.sources.length; k++) {
          html += renderSourceLink(s.sources[k], sourcesDb);
        }
        html += '</span>';
      }

      html += '</div>';
    }
    html += '</div>';

    html += '<p class="conv-expansion__note">';
    if (isNew) {
      html += 'Under CPR 2024/3110, each harmonised technical specification must be individually cited in the Official Journal via Art. 5(8) before it triggers mandatory obligations including DPP. ';
      html += 'Existing OJ citations under CPR 305/2011 are <em>legacy</em> citations \u2014 they do not satisfy the new-CPR requirement.';
    } else if (isEad) {
      html += 'EADs are cited in the Official Journal via Commission Implementing Decisions (e.g., Decision 2019/450). Citation is per-EAD, not per product family.';
    } else {
      html += 'Each harmonised standard must be individually cited in the Official Journal before it becomes mandatory. Citation is done via Commission Implementing Decisions under the CPR.';
    }
    html += '</p>';

    html += '</div>';
    return html;
  }

  // ---------- NT-8: COEXISTENCE PERIOD (pipeline-aware) ----------

  function buildCoexistencePanel(stds, colKey, sourcesDb) {
    var isEad = (colKey === 'C');
    var typeLabel = isEad ? 'EAD' : 'hEN';
    var isNew = isNewCprPipeline(colKey);

    var html = '<div class="conv-expansion">';
    html += '<div class="conv-expansion__header">';
    html += '<span class="conv-expansion__title">Coexistence Period \u2014 ' + stds.length + ' ' + typeLabel + ' standards</span>';
    html += '<button class="conv-expansion__close" aria-label="Close">&times;</button>';
    html += '</div>';

    // Context banner for new-CPR pipelines
    if (isNew) {
      var stats = countCitationStats(stds, colKey);
      if (stats.newCited === 0) {
        html += '<div class="conv-expansion__context">';
        html += 'Coexistence under CPR 2024/3110 has <strong>not started</strong> for any standard in this family. ';
        html += 'New Art. 5(8) OJ citation is required first.';
        if (stats.legacy > 0) {
          html += ' (' + stats.legacy + ' standard' + (stats.legacy !== 1 ? 's have' : ' has') + ' legacy citation under CPR 305/2011.)';
        }
        html += '</div>';
      }
    }

    html += '<div class="conv-expansion__list">';
    for (var i = 0; i < stds.length; i++) {
      var s = stds[i];
      var cs = determineCoexistenceStatus(s, colKey);
      var itemCls = 'conv-expansion__list-item';
      if (cs.cls) itemCls += ' conv-expansion__list-item' + cs.cls;

      html += '<div class="' + itemCls + '">';
      html += '<span class="conv-expansion__list-icon">' + cs.icon + '</span>';
      html += '<span class="conv-expansion__list-id">' + esc(s.id || 'Unknown') + '</span>';
      html += '<span class="conv-expansion__list-name">' + esc(s.name || '') + '</span>';
      html += '<span class="conv-expansion__list-status">' + esc(cs.label) + '</span>';

      if (isEad && s.expires) {
        html += '<span class="conv-expansion__list-detail">Validity: ' + esc(s.expires) + '</span>';
      }

      html += '</div>';
    }
    html += '</div>';

    html += '<p class="conv-expansion__note">';
    if (isNew) {
      html += 'Under CPR 2024/3110, a coexistence period begins after a harmonised technical specification is cited in the OJ via Art. 5(8). ';
      html += 'During this period, manufacturers may use either the old or new standard. Standards with only legacy OJ citations (CPR 305/2011) have not entered new-CPR coexistence.';
    } else {
      html += 'After OJ citation, a coexistence period allows manufacturers to transition to the new harmonised standard. During coexistence, both the old and new standards may be used. After the coexistence end date, only the new standard applies.';
    }
    html += '</p>';

    html += '</div>';
    return html;
  }

  // ---------- NT-C1: LEGACY EADs ACTIVE ----------

  function buildLegacyEadPanel(eads, sourcesDb) {
    var citedCount = 0;
    eads.forEach(function (s) { if (s.cited) citedCount++; });

    var html = '<div class="conv-expansion">';
    html += '<div class="conv-expansion__header">';
    html += '<span class="conv-expansion__title">Legacy EADs \u2014 ' + eads.length + ' active</span>';
    html += '<button class="conv-expansion__close" aria-label="Close">&times;</button>';
    html += '</div>';

    html += '<div class="conv-expansion__context">';
    html += 'These EADs were issued under <strong>CPR 305/2011</strong> (old regime). ';
    html += 'They are currently valid but <strong>do not trigger DPP obligations</strong>. ';
    html += 'Art. 3(42) CPR 2024/3110 defines \u201Charmonised technical specifications\u201D to exclude old-regime standards.';
    html += '</div>';

    html += '<div class="conv-expansion__list">';
    for (var i = 0; i < eads.length; i++) {
      var s = eads[i];
      var isCited = !!s.cited;
      html += '<div class="conv-expansion__list-item conv-expansion__list-item--legacy">';
      html += '<span class="conv-expansion__list-icon">' + (isCited ? '\u25d0' : '\u25cb') + '</span>';
      html += '<span class="conv-expansion__list-id">' + esc(s.id || 'Unknown') + '</span>';
      html += '<span class="conv-expansion__list-name">' + esc(s.name || '') + '</span>';
      html += '<span class="conv-expansion__list-status">' + (isCited ? 'OJ cited (305/2011)' : 'Not cited') + '</span>';
      if (s.avcp) {
        html += '<span class="conv-expansion__list-detail">AVCP ' + esc(s.avcp) + '</span>';
      }
      html += '</div>';
    }
    html += '</div>';

    html += '<p class="conv-expansion__note">';
    html += citedCount + ' of ' + eads.length + ' EADs are cited in the OJ under CPR 305/2011. ';
    html += 'These citations are legacy \u2014 under CPR 2024/3110, new EADs must be adopted and cited via Art. 5(8) before DPP obligations apply.';
    html += '</p>';

    html += '</div>';
    return html;
  }

  // ---------- NT-C2: EAD VALIDITY EXPIRES ----------

  function buildEadSunsetPanel(eads, sourcesDb) {
    var expiryDate = new Date('2031-01-09');
    var today = new Date();
    var daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    var yearsRemaining = (daysRemaining / 365.25).toFixed(1);

    var html = '<div class="conv-expansion">';
    html += '<div class="conv-expansion__header">';
    html += '<span class="conv-expansion__title">EAD Validity Expires \u2014 ' + eads.length + ' EADs</span>';
    html += '<button class="conv-expansion__close" aria-label="Close">&times;</button>';
    html += '</div>';

    html += '<div class="conv-expansion__context">';
    html += '<strong>Art. 95(4) CPR 2024/3110</strong>: All old-regime EADs <strong>cease to be valid on 9 January 2031</strong> ';
    html += '(5 years from the Regulation\u2019s entry into force). ';
    html += 'After this date, <strong>no new ETAs can be issued</strong> under old EADs. ';
    html += 'Manufacturers needing new or renewed ETAs must use new-regime EADs under CPR 2024/3110. ';
    html += 'That is approximately <strong>' + yearsRemaining + ' years (' + daysRemaining + ' days)</strong> from now.';
    html += '</div>';

    html += '<div class="conv-expansion__context" style="border-left-color: var(--cert-green);">';
    html += '<strong>Note:</strong> ETAs <em>already issued</em> under old EADs remain valid for CE marking until <strong>9 January 2036</strong> ';
    html += '(10 years from entry into force). This creates a two-stage transition: ';
    html += 'EADs expire 2031 (no new ETAs), all old ETAs expire 2036 (full regime transition).';
    html += '</div>';

    html += '<div class="conv-expansion__list">';
    for (var i = 0; i < eads.length; i++) {
      var s = eads[i];
      var expires = s.expires || '2031-01-09';

      html += '<div class="conv-expansion__list-item conv-expansion__list-item--legacy">';
      html += '<span class="conv-expansion__list-icon">\u25d0</span>';
      html += '<span class="conv-expansion__list-id">' + esc(s.id || 'Unknown') + '</span>';
      html += '<span class="conv-expansion__list-name">' + esc(s.name || '') + '</span>';
      html += '<span class="conv-expansion__list-status">EAD ceases validity ' + esc(expires) + '</span>';
      html += '</div>';
    }
    html += '</div>';

    html += '<p class="conv-expansion__note">';
    html += 'After EAD expiry, products need either: (a) a replacement EAD under CPR 2024/3110, or ';
    html += '(b) coverage via a harmonised standard (hEN). Until replacements exist, manufacturers with existing ETAs ';
    html += 'can continue CE marking until 2036, but cannot obtain new ETAs.';
    html += '</p>';

    html += '</div>';
    return html;
  }

  // ---------- NT-C3: EAD TRANSITION (enriched with Innovation Paradox insights) ----------

  function buildEadTransitionPanel(eads, sourcesDb) {
    var withReplacement = 0;
    eads.forEach(function (s) { if (s.new_ead) withReplacement++; });

    var html = '<div class="conv-expansion">';
    html += '<div class="conv-expansion__header">';
    html += '<span class="conv-expansion__title">EAD Transition \u2014 ' + withReplacement + ' of ' + eads.length + ' have replacements</span>';
    html += '<button class="conv-expansion__close" aria-label="Close">&times;</button>';
    html += '</div>';

    html += '<div class="conv-expansion__context">';
    if (withReplacement === 0) {
      html += '<strong>No replacements yet.</strong> Pipeline D (new-regime EADs under CPR 2024/3110) has not started. ';
      html += 'The transitional period under Art. 95 creates an effective innovation freeze (Jan 2026\u2013~2027) ';
      html += 'until delegated acts for sustainability requirements are ready. No new EADs can be adopted until then.';
    } else {
      html += withReplacement + ' of ' + eads.length + ' legacy EADs have identified replacement paths under CPR 2024/3110.';
    }
    html += '</div>';

    // Innovation Paradox insight
    html += '<div class="conv-expansion__context" style="border-left-color: #6366f1; background: rgba(99,102,241,0.04);">';
    html += '<strong>The Innovator\u2019s Paradox:</strong> Once new-regime EADs become available, the EAD/ETA route is significantly faster than the hEN route. ';
    html += 'A new EAD typically takes <strong>12\u201318 months</strong> to develop (single TAB + EOTA validation), ';
    html += 'compared to <strong>5\u20136 years</strong> for a new harmonised standard (CEN TC consensus process). ';
    html += 'This means EAD-route products could face DPP obligations <strong>years before</strong> ';
    html += 'hEN-route products in the same family \u2014 scenario estimate as early as ~2028\u20132029.';
    html += '</div>';

    html += '<div class="conv-expansion__list">';
    for (var i = 0; i < eads.length; i++) {
      var s = eads[i];
      var hasNew = !!s.new_ead;
      var cls = 'conv-expansion__list-item';
      if (hasNew) cls += ' conv-expansion__list-item--positive';

      html += '<div class="' + cls + '">';
      html += '<span class="conv-expansion__list-icon">' + (hasNew ? '\u2713' : '\u25cb') + '</span>';
      html += '<span class="conv-expansion__list-id">' + esc(s.id || 'Unknown') + '</span>';
      html += '<span class="conv-expansion__list-name">' + esc(s.name || '') + '</span>';
      html += '<span class="conv-expansion__list-status">' + (hasNew ? 'Replacement: ' + esc(s.new_ead) : 'No replacement') + '</span>';
      html += '</div>';
    }
    html += '</div>';

    html += '<p class="conv-expansion__note">';
    html += 'The DPP trigger is the Declaration of Performance and Conformity (DoPC). ';
    html += 'A product with a new ETA issued against a CPR 2024/3110 EAD must issue a DoPC \u2014 which triggers DPP obligations ';
    html += '(once Art. 75(1) DA is in force and the 18-month lead-in has elapsed). ';
    html += 'New EADs must include environmental sustainability requirements: GWP declaration from day one, ';
    html += 'core LCA by 2029, and full LCA by 2031.';
    html += '</p>';

    html += '</div>';
    return html;
  }

  // ---------- NT-C4: ETA VALIDITY EXPIRES ----------

  function buildEtaExpiryPanel(eads, sourcesDb) {
    var expiryDate = new Date('2036-01-09');
    var today = new Date();
    var daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    var yearsRemaining = (daysRemaining / 365.25).toFixed(1);

    var citedCount = 0;
    eads.forEach(function (s) { if (s.cited) citedCount++; });

    var html = '<div class="conv-expansion">';
    html += '<div class="conv-expansion__header">';
    html += '<span class="conv-expansion__title">ETA Validity Expires \u2014 ' + eads.length + ' EAD-based products affected</span>';
    html += '<button class="conv-expansion__close" aria-label="Close">&times;</button>';
    html += '</div>';

    html += '<div class="conv-expansion__context">';
    html += '<strong>Art. 95(4) CPR 2024/3110</strong>: ETAs issued under old-regime EADs remain valid for CE marking ';
    html += 'until <strong>9 January 2036</strong> (10 years from the Regulation\u2019s entry into force). ';
    html += 'This is the absolute backstop: after this date, <strong>all products</strong> must have transitioned to ';
    html += 'the new CPR regime \u2014 either via a new-regime EAD/ETA or a harmonised standard.';
    html += '</div>';

    html += '<div class="conv-expansion__context" style="border-left-color: var(--cert-green);">';
    html += '<strong>Two-stage transition:</strong><br>';
    html += '\u2022 <strong>9 Jan 2031</strong> \u2014 Old EADs cease to be valid. No new ETAs can be issued under old EADs.<br>';
    html += '\u2022 <strong>9 Jan 2036</strong> \u2014 Existing old ETAs expire. 100% regime transition complete.';
    html += '<br><br>That is approximately <strong>' + yearsRemaining + ' years (' + daysRemaining + ' days)</strong> from now.';
    html += '</div>';

    html += '<div class="conv-expansion__list">';
    for (var i = 0; i < eads.length; i++) {
      var s = eads[i];
      html += '<div class="conv-expansion__list-item">';
      html += '<span class="conv-expansion__list-icon">\u25cb</span>';
      html += '<span class="conv-expansion__list-id">' + esc(s.id || 'Unknown') + '</span>';
      html += '<span class="conv-expansion__list-name">' + esc(s.name || '') + '</span>';
      html += '<span class="conv-expansion__list-status">ETA valid until 9 Jan 2036</span>';
      html += '</div>';
    }
    html += '</div>';

    html += '<p class="conv-expansion__note">';
    html += 'Manufacturers with existing ETAs have until 2036 to continue CE marking under the old regime. ';
    html += 'However, DPP obligations begin earlier for products that transition to new-regime EADs voluntarily. ';
    html += 'The practical question is not whether to transition, but when \u2014 and whether to use the runway ';
    html += 'to prepare DPP infrastructure ahead of mandatory requirements.';
    html += '</p>';

    html += '</div>';
    return html;
  }

  // ---------- DPP CONVERGENCE EXPANSION (combined hEN + EAD) ----------
  // This is the panel for the convergence DPP node — shows ALL standards
  // assessed against the NEW CPR 2024/3110 regime. Only new-CPR citations count.

  window.showConvergenceExpansion = function (container, family) {
    hideExp();

    var standards = family.standards || [];
    if (standards.length === 0) {
      container.innerHTML = buildEmpty();
      activeContainer = container;
      wireClose(container);
      return;
    }

    var hens = standards.filter(function (s) { return s.type === 'hEN'; });
    var eads = standards.filter(function (s) { return s.type === 'EAD'; });

    // Assess ALL standards against new CPR (the only regime that matters for DPP)
    var henReady = 0, henLegacy = 0, henNone = 0;
    hens.forEach(function (s) {
      var cs = determineCitationStatus(s, 'A');
      if (cs.status === 'cited_new') henReady++;
      else if (cs.status === 'legacy') henLegacy++;
      else henNone++;
    });

    var eadReady = 0, eadLegacy = 0, eadNone = 0;
    eads.forEach(function (s) {
      if (s.regime === 'new' && s.cited) eadReady++;
      else if (s.cited) eadLegacy++;
      else eadNone++;
    });

    var totalReady = henReady + eadReady;
    var totalLegacy = henLegacy + eadLegacy;
    var totalNone = henNone + eadNone;
    var totalStds = standards.length;
    var conv = family.convergence || {};

    var html = '<div class="conv-expansion conv-expansion--dpp">';
    html += '<div class="conv-expansion__header">';
    html += '<span class="conv-expansion__title">DPP Obligation \u2014 ' + totalReady + ' of ' + totalStds + ' standards ready under CPR 2024/3110</span>';
    html += '<button class="conv-expansion__close" aria-label="Close">&times;</button>';
    html += '</div>';

    // Summary stats
    html += '<div class="conv-expansion__dpp-summary">';
    html += '<div class="conv-expansion__dpp-stat conv-expansion__dpp-stat--ready">';
    html += '<span class="conv-expansion__dpp-stat-num">' + totalReady + '</span>';
    html += '<span class="conv-expansion__dpp-stat-label">DPP ready (new CPR citation)</span>';
    html += '</div>';
    html += '<div class="conv-expansion__dpp-stat conv-expansion__dpp-stat--legacy">';
    html += '<span class="conv-expansion__dpp-stat-num">' + totalLegacy + '</span>';
    html += '<span class="conv-expansion__dpp-stat-label">Legacy citation (305/2011)</span>';
    html += '</div>';
    html += '<div class="conv-expansion__dpp-stat conv-expansion__dpp-stat--none">';
    html += '<span class="conv-expansion__dpp-stat-num">' + totalNone + '</span>';
    html += '<span class="conv-expansion__dpp-stat-label">Not yet cited</span>';
    html += '</div>';
    html += '</div>';

    if (totalReady === 0) {
      html += '<div class="conv-expansion__context">';
      html += '<strong>No standards are DPP-ready.</strong> All current OJ citations are under CPR 305/2011 (legacy). ';
      html += 'Under Art. 3(42) CPR 2024/3110, only new harmonised technical specifications trigger DPP obligations. ';
      html += 'Each standard needs new Art. 5(8) OJ citation under the new CPR.';
      html += '</div>';
    }

    // hEN standards
    if (hens.length > 0) {
      html += '<div class="conv-expansion__section-label">hEN Standards (' + hens.length + ')</div>';
      html += '<div class="conv-expansion__list">';
      for (var i = 0; i < hens.length; i++) {
        var s = hens[i];
        var cs = determineCitationStatus(s, 'A');
        var cls = 'conv-expansion__list-item';
        if (cs.cls) cls += ' conv-expansion__list-item' + cs.cls;

        html += '<div class="' + cls + '">';
        html += '<span class="conv-expansion__list-icon">' + cs.icon + '</span>';
        html += '<span class="conv-expansion__list-id">' + esc(s.id || '') + '</span>';
        html += '<span class="conv-expansion__list-name">' + esc(s.name || '') + '</span>';
        html += '<span class="conv-expansion__list-status">' + esc(cs.label) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // EAD standards
    if (eads.length > 0) {
      html += '<div class="conv-expansion__section-label">EAD Standards (' + eads.length + ')</div>';
      html += '<div class="conv-expansion__list">';
      for (var j = 0; j < eads.length; j++) {
        var e = eads[j];
        var isNewRegime = e.regime === 'new';
        var isCited = !!e.cited;
        var eCls = 'conv-expansion__list-item';
        var eIcon, eLabel;

        if (isNewRegime && isCited) {
          eCls += ' conv-expansion__list-item--positive';
          eIcon = '\u2713';
          eLabel = 'Cited under CPR 2024/3110';
        } else if (isCited) {
          eCls += ' conv-expansion__list-item--legacy';
          eIcon = '\u25d0';
          eLabel = 'Legacy citation (305/2011) \u2014 needs new-regime EAD';
        } else {
          eIcon = '\u25cb';
          eLabel = 'Not cited';
        }

        html += '<div class="' + eCls + '">';
        html += '<span class="conv-expansion__list-icon">' + eIcon + '</span>';
        html += '<span class="conv-expansion__list-id">' + esc(e.id || '') + '</span>';
        html += '<span class="conv-expansion__list-name">' + esc(e.name || '') + '</span>';
        html += '<span class="conv-expansion__list-status">' + esc(eLabel) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Convergence formula note
    if (conv.formula_note) {
      html += '<p class="conv-expansion__note">';
      html += '<strong>Convergence formula:</strong> ' + esc(conv.formula_note) + '. ';
      html += 'DPP obligation begins 18 months after Art. 75(1) DA entry into force, but only for standards with new-CPR Art. 5(8) OJ citation.';
      html += '</p>';
    }

    html += '</div>';

    container.innerHTML = html;
    activeContainer = container;
    wireClose(container);
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // ---------- UTIL ----------

  function esc(str) {
    if (!str) return '';
    var el = document.createElement('span');
    el.textContent = String(str);
    return el.innerHTML;
  }

  function escAttr(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
