// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
// CPR DPP Tracker — main app logic (v2: convergence view)
// Fetches families-v2.json + system-timeline.json, renders card grid,
// card click opens full-page convergence timeline view.

(function () {
  'use strict';

  // ---------- CONFIG ----------
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var CERTAINTY_LABELS = {
    'green': 'Confirmed',
    'yellow-green': 'Scheduled',
    'amber': 'Estimated',
    'orange': 'Moderate confidence',
    'red-orange': 'Speculative',
    'red': 'Speculative',
    'gray': 'Unknown'
  };

  // Content section labels and rendering now handled by ContentRenderer (content-renderer.js)

  // ---------- DOM REFS ----------
  var grid = document.getElementById('trackerGrid');
  var metaEl = document.getElementById('trackerMeta');

  // Convergence view
  var convView = document.getElementById('convView');
  var convTitle = document.getElementById('convTitle');
  var convSubtitle = document.getElementById('convSubtitle');
  var convIcon = document.getElementById('convIcon');
  var convClose = document.getElementById('convClose');
  var convChartWrap = document.getElementById('convChartWrap');
  var convDppOutlook = document.getElementById('convDppOutlook');
  var convContentSections = document.getElementById('convContentSections');
  var convStandards = document.getElementById('convStandards');
  var convStdsContent = document.getElementById('convStdsContent');
  var convExpansion = document.getElementById('convExpansion');
  var convDisclaimer = document.getElementById('convDisclaimer');

  // Convergence view breadcrumb + print
  var convBreadcrumb = document.getElementById('convBreadcrumb');
  var convBreadcrumbBack = document.getElementById('convBreadcrumbBack');
  var convBreadcrumbCurrent = document.getElementById('convBreadcrumbCurrent');
  var convPrint = document.getElementById('convPrint');

  // Page sections to hide/show when toggling between grid and conv view
  var heroEl = document.querySelector('.tracker-hero');
  var disclaimerBanner = document.querySelector('.tracker-disclaimer');
  var landingEl = document.querySelector('.tracker-landing');
  var gridContainer = document.querySelector('.tracker-container');
  var trackerNav = document.getElementById('trackerNav');
  var filterBar = document.getElementById('filterBar');
  var compareView = document.getElementById('compareView');
  var sourceToggle = document.getElementById('sourceToggle');

  // ---------- DATA ----------
  var families = [];
  var systemTimeline = null;
  var currentFamily = null;
  window._cprSources = null;

  // ---------- SKELETON LOADING ----------
  function renderSkeletons() {
    var html = '';
    for (var s = 0; s < 12; s++) {
      html += '<div class="cpr-card cpr-card--skeleton" role="listitem">';
      html += '<div class="cpr-card__skeleton-img"></div>';
      html += '<div class="cpr-card__skeleton-line cpr-card__skeleton-line--title"></div>';
      html += '<div class="cpr-card__skeleton-line cpr-card__skeleton-line--sub"></div>';
      html += '<div class="cpr-card__skeleton-line cpr-card__skeleton-line--short"></div>';
      html += '</div>';
    }
    grid.innerHTML = html;
  }

  // Show skeleton cards while loading
  renderSkeletons();

  // ---------- INIT ----------
  Promise.all([
    fetch('data/families-v2.json').then(function (r) { return r.json(); }),
    fetch('data/system-timeline.json').then(function (r) { return r.json(); }),
    fetch('data/sources.json').then(function (r) { return r.json(); }).catch(function () { return {}; })
  ]).then(function (results) {
    var v2Data = results[0];
    systemTimeline = results[1];
    window._cprSources = results[2] || {};

    families = v2Data.families.slice().sort(function (a, b) {
      return dppSortKey(a) - dppSortKey(b);
    });

    // Render filters + initial grid (filters callback renders the grid)
    if (window.renderFilters && filterBar) {
      renderFilters(filterBar, families, function (filtered) {
        renderGrid(filtered);
      });
    } else {
      renderGrid(families);
    }

    // Initialize comparison mode
    if (window.initComparison && compareView) {
      initComparison(grid, compareView, families, systemTimeline, openConvergenceView);
    }

    // Initialize source layer
    if (window.initSourceLayer && sourceToggle) {
      initSourceLayer(sourceToggle);
    }

    populateHeroIcons();
    if (metaEl) metaEl.textContent = families.length + ' product families \u00b7 Regulation (EU) 2024/3110';

    // Handle deep-link: #family=PCR or #compare=PCR,SMP
    var hash = window.location.hash;
    var familyMatch = hash.match(/family=([A-Z]+)/i);
    if (familyMatch) {
      var target = familyMatch[1].toUpperCase();
      var fam = families.find(function (f) { return f.letter === target; });
      if (fam) openConvergenceView(fam);
    }
  });

  // ---------- HERO ICONS ----------
  function populateHeroIcons() {
    var container = document.getElementById('heroIcons');
    if (!container) return;
    var html = '';
    families.forEach(function (fam) {
      if (fam.icon) {
        html += '<img src="Images/' + fam.icon + '" alt="" loading="lazy">';
      }
    });
    container.innerHTML = html;
  }

  // ---------- GRID ----------
  function renderGrid(displayFamilies) {
    var list = displayFamilies || families;
    var html = '';
    list.forEach(function (fam) {
      // Store the family letter as data attribute for click lookup
      html += buildCard(fam);
    });
    grid.innerHTML = html;
    enrichCards(list);

    // Add comparison checkboxes
    if (window.addCompareCheckboxes) {
      addCompareCheckboxes(grid);
    }
  }

  // Map 7-level node certainty to 5-level card indicator
  var CARD_CERTAINTY_MAP = {
    'green': 'confirmed',
    'yellow-green': 'likely',
    'amber': 'uncertain',
    'orange': 'speculative',
    'red-orange': 'speculative',
    'red': 'speculative',
    'gray': 'unknown'
  };

  var CARD_CERT_LABELS = {
    'confirmed': 'Confirmed',
    'likely': 'Likely',
    'uncertain': 'Uncertain',
    'speculative': 'Speculative',
    'unknown': 'Unknown'
  };

  function buildCard(fam) {
    var icon = fam.icon ? 'Images/' + fam.icon : '';
    var name = fam.display_name || fam.full_name || fam['full-name'] || '';
    var familyLabel = fam.family_label || ('Annex VII #' + (fam.family || '') + ' \u00b7 ' + (fam.letter || ''));
    var letter = fam.letter || '';
    var convergence = fam.convergence;
    var dppDate = (convergence && convergence.dpp_date) || '';
    var dppCert = (convergence && convergence.dpp_certainty) || 'gray';
    var cardCert = CARD_CERTAINTY_MAP[dppCert] || 'unknown';

    var h = '<div class="cpr-card cpr-card--cert-' + cardCert + '" data-letter="' + esc(letter) + '" role="listitem">';

    // Top row: icon + name + family label
    h += '<div class="cpr-card__top">';
    if (icon) h += '<img class="cpr-card__icon" src="' + icon + '" alt="" loading="lazy">';
    h += '<div class="cpr-card__info">';
    h += '<span class="cpr-card__name">' + esc(name) + '</span>';
    h += '<span class="cpr-card__family">' + esc(familyLabel) + '</span>';
    h += '</div>';
    h += '</div>';

    // Hero metric: DPP date
    if (dppDate) {
      h += '<div class="cpr-card__hero-date">' + esc(dppDate) + '</div>';
      h += '<div class="cpr-card__cert-label">';
      h += '<span class="cpr-card__cert-dot cpr-card__cert-dot--' + cardCert + '"></span>';
      h += esc(CARD_CERT_LABELS[cardCert] || '') + ' DPP estimate';
      h += '</div>';
    } else {
      h += '<div class="cpr-card__hero-date cpr-card__hero-date--tbd">TBD</div>';
      h += '<div class="cpr-card__cert-label">';
      h += '<span class="cpr-card__cert-dot cpr-card__cert-dot--unknown"></span>';
      h += 'DPP date not yet estimated';
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  // ---------- STATUS COMPUTATION (pipeline-derived) ----------
  // Derives card label + standards count directly from pipeline nodes and
  // standards array. Labels always show which CPR regulation applies.
  // Rule: if ANY standard achieves HTS-in-force under CPR 2024 → DPP applies.

  // CPR label per pipeline
  var PIPE_CPR = { 'A': 'CPR 2024', 'B': 'CPR 2011' };

  // Node type advancement order (higher = further along toward DPP)
  var NODE_RANK = {
    'NT-2': 1, 'NT-3': 2, 'NT-4': 3, 'NT-5': 4,
    'NT-7': 5, 'NT-8': 6, 'NT-9': 7
  };

  // Count cited standards by type
  function countStandards(fam) {
    var stds = fam.standards || [];
    var hen = 0, ead = 0;
    stds.forEach(function (s) {
      if (!s.cited) return;
      if (s.type === 'hEN') hen++;
      else if (s.type === 'EAD') ead++;
    });
    return { hen: hen, ead: ead };
  }

  // Derive the card status label from pipeline nodes.
  // Scans Pipeline A (DPP path) and Pipeline B (old CPR) — skips Pipeline C
  // (EAD sunset has no standards-development progression).
  // Returns { text, cls, cpr } where cpr is 'CPR 2024' or 'CPR 2011'.
  function computeStatus(fam) {
    var pipelines = fam.pipelines || {};
    // Scan A and B in both active and future lists
    var candidatePipes = ['A', 'B'];
    var best = null;

    candidatePipes.forEach(function (pKey) {
      var pipe = pipelines[pKey];
      if (!pipe || !pipe.nodes) return;
      var cpr = PIPE_CPR[pKey] || pKey;

      pipe.nodes.forEach(function (node) {
        var t = node.type;
        var s = node.status;
        var rank = NODE_RANK[t] || 0;
        var candidate = null;

        // --- DPP obligations in place (endgame) ---
        if (t === 'NT-9' && s === 'complete' && pKey === 'A') {
          candidate = { text: 'DPP obligations in place', cls: 'on-track', priority: 300, cpr: cpr };
        }
        // --- Coexistence period ---
        else if (t === 'NT-8' && (s === 'active' || s === 'in_progress')) {
          candidate = { text: 'Coexistence period', cls: 'in-progress', priority: 250 + rank, cpr: cpr };
        }
        // --- Overdue ---
        else if (s === 'overdue') {
          candidate = { text: 'Delivery overdue', cls: 'attention', priority: 200 + rank, cpr: cpr };
        }
        // --- Active work ---
        else if (s === 'in_progress') {
          if (t === 'NT-5') candidate = { text: 'Standards in development', cls: 'in-progress', priority: 100 + rank, cpr: cpr };
          else if (t === 'NT-3') candidate = { text: 'Defining characteristics', cls: 'in-progress', priority: 100 + rank, cpr: cpr };
          else if (t === 'NT-2') candidate = { text: 'Defining scope', cls: 'in-progress', priority: 100 + rank, cpr: cpr };
          else candidate = { text: node.label + ' in progress', cls: 'in-progress', priority: 100 + rank, cpr: cpr };
        }
        else if (s === 'draft') {
          if (t === 'NT-4') candidate = { text: 'SReq draft published', cls: 'in-progress', priority: 100 + rank, cpr: cpr };
          else candidate = { text: node.label + ' draft', cls: 'in-progress', priority: 95 + rank, cpr: cpr };
        }
        // --- Completed milestones ---
        else if (s === 'complete') {
          if (t === 'NT-9') candidate = { text: 'HTS in force', cls: 'on-track', priority: 80 + rank, cpr: cpr };
          else if (t === 'NT-7') candidate = { text: 'OJ citation published', cls: 'on-track', priority: 80 + rank, cpr: cpr };
          else if (t === 'NT-5') candidate = { text: 'Standards delivered', cls: 'on-track', priority: 80 + rank, cpr: cpr };
          else if (t === 'NT-4') candidate = { text: 'SReq adopted', cls: 'on-track', priority: 80 + rank, cpr: cpr };
          else if (t === 'NT-3') candidate = { text: 'Characteristics defined', cls: 'on-track', priority: 80 + rank, cpr: cpr };
          else if (t === 'NT-2') candidate = { text: 'Scope defined', cls: 'on-track', priority: 80 + rank, cpr: cpr };
        }

        if (candidate && (!best || candidate.priority > best.priority)) {
          best = candidate;
        }
      });
    });

    // Fallback: no Pipeline A/B progress found
    if (!best) {
      var activePipes = fam.active_pipelines || [];
      var aIsActive = activePipes.indexOf('A') !== -1;
      var hasEadActive = pipelines.C && pipelines.C.nodes && pipelines.C.nodes.some(function (n) {
        return n.type === 'NT-C1' && n.status === 'active';
      });
      // "EAD only" = Pipeline C active but A is NOT active (it's in future_pipelines)
      if (hasEadActive && !aIsActive) {
        return { text: 'EAD only \u2014 awaiting SReq', cls: 'attention', cpr: 'CPR 2024' };
      }
    }

    return best || { text: 'Awaiting SReq', cls: 'attention', cpr: 'CPR 2024' };
  }

  function enrichCards(displayFamilies) {
    var list = displayFamilies || families;
    var byLetter = {};
    list.forEach(function (f) { byLetter[f.letter] = f; });

    var cards = grid.querySelectorAll('.cpr-card');
    cards.forEach(function (card) {
      var letter = card.getAttribute('data-letter');
      var fam = byLetter[letter];
      if (!fam) return;

      var bottomEl = document.createElement('div');
      bottomEl.className = 'cpr-card__bottom';

      // --- Status badge: label + CPR version ---
      var statusInfo = computeStatus(fam);
      var actionCls = 'cpr-card__action';
      if (statusInfo.cls === 'attention') actionCls += ' cpr-card__action--attention';
      else if (statusInfo.cls === 'on-track') actionCls += ' cpr-card__action--on-track';
      else actionCls += ' cpr-card__action--in-progress';
      var actionEl = document.createElement('span');
      actionEl.className = actionCls;
      actionEl.textContent = statusInfo.text;
      bottomEl.appendChild(actionEl);

      // --- CPR route + standards counter ---
      var counts = countStandards(fam);
      var parts = [statusInfo.cpr];
      if (counts.hen > 0) parts.push('hEN ' + counts.hen);
      if (counts.ead > 0) parts.push('EAD ' + counts.ead);
      var counterEl = document.createElement('span');
      counterEl.className = 'cpr-card__standards';
      counterEl.textContent = parts.join(' \u00B7 ');
      bottomEl.appendChild(counterEl);

      // --- Updated date ---
      if (fam.updated) {
        var ud = new Date(fam.updated + 'T00:00:00');
        var updEl = document.createElement('span');
        updEl.className = 'cpr-card__updated';
        updEl.textContent = ud.getDate() + ' ' + MONTHS[ud.getMonth()] + ' ' + ud.getFullYear();
        bottomEl.appendChild(updEl);
      }

      card.appendChild(bottomEl);
    });
  }

  // ---------- DPP SORT KEY ----------
  function dppSortKey(fam) {
    var conv = fam.convergence;
    var str = (conv && conv.dpp_date) || (fam['dpp-range'] && fam['dpp-range'].envelope) || fam['dpp-est'] || '';
    if (!str || str === 'TBD') return 9999;
    var m = str.match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 9999;
  }

  // ============================================================
  // CONVERGENCE VIEW — replaces the old modal
  // ============================================================

  function openConvergenceView(fam) {
    currentFamily = fam;

    var letter = fam.letter || '';
    var family = fam.family || '';
    var tc = fam.tc || '';
    var icon = fam.icon ? 'Images/' + fam.icon : '';

    // Header
    if (icon) { convIcon.src = icon; convIcon.alt = fam.full_name || fam['full-name'] || ''; }
    convTitle.textContent = fam.full_name || fam['full-name'] || fam.display_name || '';

    var sub = [];
    if (letter) sub.push(letter);
    if (family) sub.push('Annex VII #' + family);
    if (tc) sub.push(tc);
    if (fam.updated) {
      var ud = new Date(fam.updated + 'T00:00:00');
      sub.push('Updated ' + ud.getDate() + ' ' + MONTHS[ud.getMonth()] + ' ' + ud.getFullYear());
    }
    convSubtitle.textContent = sub.join(' \u00b7 ');

    // Convergence chart (time-aligned multi-column with per-standard nodes)
    if (window.renderConvergenceChart) {
      renderConvergenceChart(convChartWrap, fam, systemTimeline, fam.standards);
    }

    // DPP Outlook box (above chart)
    renderDppOutlook(convDppOutlook, fam, systemTimeline);

    // Content sections (expandable narrative)
    renderContentSections(convContentSections, fam);

    // Persistent standards grid — all standards as clickable cards
    renderStandardsGrid(convStandards, fam);

    // Disclaimer
    convDisclaimer.innerHTML = '<p style="font-size:0.72rem;line-height:1.5;color:var(--color-text-secondary,#64748b);background:var(--color-bg-card,#f8fafc);border-left:3px solid var(--color-border,#e2e8f0);padding:10px 14px;border-radius:0 8px 8px 0;margin-top:14px;"><strong>Disclaimer:</strong> The CPR regulatory landscape is dynamic and at times opaque. The information shown is for informational purposes only and should not be considered legal advice.</p>';

    // Update URL hash
    if (letter) window.location.hash = 'family=' + letter;

    // Update breadcrumb
    if (convBreadcrumbCurrent) {
      convBreadcrumbCurrent.textContent = fam.display_name || fam.full_name || fam['full-name'] || letter;
    }

    // Toggle page visibility
    heroEl.style.display = 'none';
    disclaimerBanner.style.display = 'none';
    landingEl.style.display = 'none';
    if (filterBar) filterBar.style.display = 'none';
    gridContainer.style.display = 'none';
    if (compareView) compareView.setAttribute('hidden', '');
    convView.removeAttribute('hidden');
    window.scrollTo(0, 0);
  }

  function closeConvergenceView() {
    convView.setAttribute('hidden', '');
    heroEl.style.display = '';
    disclaimerBanner.style.display = '';
    landingEl.style.display = '';
    if (filterBar) filterBar.style.display = '';
    gridContainer.style.display = '';
    currentFamily = null;
    if (window.hideNodeDetail) window.hideNodeDetail();
    if (window.hideNodeExpansion) window.hideNodeExpansion();
    window.location.hash = '';
  }

  // ---------- DPP OUTLOOK BOX (above chart) ----------
  function renderDppOutlook(container, fam, sysTimeline) {
    var conv = fam.convergence;
    if (!conv || !conv.dpp_date) {
      container.style.display = 'none';
      return;
    }

    container.style.display = '';
    var cert = conv.dpp_certainty || 'gray';
    var certLabel = CERTAINTY_LABELS[cert] || cert;
    var binding = conv.binding_constraint || 'unknown';
    var bindingLabel = binding === 'product' ? 'Product timeline'
      : binding === 'system' ? 'System timeline' : 'Unknown';
    var bindingCls = binding === 'product' ? 'product'
      : binding === 'system' ? 'system' : 'unknown';

    // Derive hEN/EAD obligation dates from individual standards
    var dateToYear = window.convergenceDateToYear;
    var henDates = [];
    var eadDates = [];
    (fam.standards || []).forEach(function (s) {
      if (!s.dpp_est || s.dpp_est === 'TBD') return;
      var entry = { id: s.id || '', est: s.dpp_est };
      if (s.type === 'EAD') eadDates.push(entry);
      else henDates.push(entry);
    });

    // Sort by date
    function estSort(a, b) {
      var ya = dateToYear ? dateToYear(a.est) : 0;
      var yb = dateToYear ? dateToYear(b.est) : 0;
      return (ya || 9999) - (yb || 9999);
    }
    henDates.sort(estSort);
    eadDates.sort(estSort);

    // System DPP date
    var sysDppDate = '';
    if (sysTimeline && sysTimeline.nodes) {
      sysTimeline.nodes.forEach(function (n) {
        if (n.id === 'sys-dpp-mandatory') {
          sysDppDate = n.estimated_date || n.date || n.target_date || '';
        }
      });
    }

    // Identify which pipelines are active
    var activePipes = fam.active_pipelines || [];
    var futurePipes = fam.future_pipelines || [];
    var pipeLabels = [];
    var allPipes = activePipes.concat(futurePipes);
    allPipes.forEach(function (pk) {
      var pipe = fam.pipelines && fam.pipelines[pk];
      if (pipe) {
        var tag = futurePipes.indexOf(pk) !== -1 ? ' (future)' : '';
        pipeLabels.push('Pipeline ' + pk + tag + ': ' + (pipe.label || pk));
      }
    });

    // Build HTML
    var html = '<div class="dpp-outlook">';

    // Header: title + date + certainty
    html += '<div class="dpp-outlook__header">';
    html += '<span class="dpp-outlook__title">DPP Outlook</span>';
    html += '<span class="dpp-outlook__date">' + esc(conv.dpp_date) + '</span>';
    html += '<span class="dpp-outlook__cert">';
    html += '<span class="dpp-outlook__cert-dot dpp-outlook__cert-dot--' + cert + '"></span>';
    html += esc(certLabel);
    html += '</span>';
    html += '<span class="dpp-outlook__binding dpp-outlook__binding--' + bindingCls + '">';
    html += 'binding: ' + esc(bindingLabel);
    html += '</span>';
    html += '</div>';

    // Body
    html += '<div class="dpp-outlook__body">';

    // Explanation
    html += '<p>The DPP obligation date is determined by whichever is later: the product timeline ';
    html += '(when harmonised standards are in force under the new CPR) or the system timeline ';
    html += '(when the EU DPP infrastructure is operational). ';
    html += 'The formula is: <strong>DPP = max(Product ready, System ready)</strong>.</p>';

    // Formula
    if (conv.formula_note) {
      html += '<div class="dpp-outlook__formula">' + esc(conv.formula_note) + '</div>';
    }

    // Product timeline section
    html += '<div class="dpp-outlook__section">';
    html += '<div class="dpp-outlook__section-label">Product timeline</div>';
    if (pipeLabels.length > 0) {
      pipeLabels.forEach(function (pl) {
        html += '<div class="dpp-outlook__row"><span class="dpp-outlook__row-label">' + esc(pl) + '</span></div>';
      });
    }
    if (henDates.length > 0) {
      var firstHen = henDates[0];
      var lastHen = henDates[henDates.length - 1];
      html += '<div class="dpp-outlook__row">';
      html += '<span class="dpp-outlook__row-label">First hEN DPP obligation</span>';
      html += '<span class="dpp-outlook__row-value">' + esc(firstHen.est) + ' (' + esc(firstHen.id) + ')</span>';
      html += '</div>';
      if (henDates.length > 1 && firstHen.est !== lastHen.est) {
        html += '<div class="dpp-outlook__row">';
        html += '<span class="dpp-outlook__row-label">Last hEN DPP obligation</span>';
        html += '<span class="dpp-outlook__row-value">' + esc(lastHen.est) + ' (' + esc(lastHen.id) + ')</span>';
        html += '</div>';
      }
    }
    if (eadDates.length > 0) {
      var firstEad = eadDates[0];
      var lastEad = eadDates[eadDates.length - 1];
      html += '<div class="dpp-outlook__row">';
      html += '<span class="dpp-outlook__row-label">First EAD DPP obligation</span>';
      html += '<span class="dpp-outlook__row-value">' + esc(firstEad.est) + ' (' + esc(firstEad.id) + ')</span>';
      html += '</div>';
      if (eadDates.length > 1 && firstEad.est !== lastEad.est) {
        html += '<div class="dpp-outlook__row">';
        html += '<span class="dpp-outlook__row-label">Last EAD DPP obligation</span>';
        html += '<span class="dpp-outlook__row-value">' + esc(lastEad.est) + ' (' + esc(lastEad.id) + ')</span>';
        html += '</div>';
      }
    }
    if (henDates.length === 0 && eadDates.length === 0) {
      html += '<div class="dpp-outlook__row"><span class="dpp-outlook__row-label" style="color:#94a3b8;">No standards with DPP estimates yet</span></div>';
    }
    html += '</div>';

    // System timeline section
    html += '<div class="dpp-outlook__section">';
    html += '<div class="dpp-outlook__section-label">System timeline</div>';
    html += '<div class="dpp-outlook__row">';
    html += '<span class="dpp-outlook__row-label">DPP Mandatory (+18mo after Art. 75 DA)</span>';
    html += '<span class="dpp-outlook__row-value">' + esc(sysDppDate || 'TBD') + '</span>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // body
    html += '</div>'; // dpp-outlook

    container.innerHTML = html;
  }

  // ---------- CONTENT SECTIONS ----------
  function renderContentSections(container, fam) {
    var content = fam.content;
    if (!content) {
      container.style.display = 'none';
      return;
    }

    var html = window.ContentRenderer
      ? window.ContentRenderer.renderFamilyContent(content, {
          cssPrefix: 'cpr-content',
          expandKeys: ['about', 'dpp_outlook'],
          showSources: true
        })
      : '';

    if (!html) {
      container.style.display = 'none';
      return;
    }

    container.style.display = '';
    container.innerHTML = '<div class="conv-view__section-title">Analysis</div>' + html;

    if (window.ContentRenderer) {
      window.ContentRenderer.attachToggleListeners(container, 'cpr-content');
    }
  }

  // ---------- STANDARDS GRID ----------

  function renderStandardsGrid(container, fam) {
    var stds = fam.standards || [];
    if (stds.length === 0) {
      container.style.display = 'none';
      return;
    }

    var html = '<div class="conv-view__section-title">Standards (' + stds.length + ')</div>';
    html += '<div class="std-grid">';

    for (var i = 0; i < stds.length; i++) {
      var s = stds[i];
      var isEAD = (s.type || '').toUpperCase() === 'EAD';
      var typeClass = isEAD ? 'std-grid__badge--ead' : 'std-grid__badge--hen';
      var href = 'standard.html#std=' + encodeURIComponent(s.id) +
        '&family=' + encodeURIComponent(fam.letter);

      html += '<a href="' + href + '" class="std-grid__card">';
      html += '<div class="std-grid__card-head">';
      html += '<span class="std-grid__card-id">' + esc(s.id) + '</span>';
      html += '<span class="std-grid__badge ' + typeClass + '">' + (isEAD ? 'EAD' : 'hEN') + '</span>';
      html += '</div>';
      if (s.name) {
        html += '<div class="std-grid__card-name">' + esc(trunc(s.name, 60)) + '</div>';
      }
      if (s.dpp_est) {
        html += '<div class="std-grid__card-dpp">DPP ' + esc(s.dpp_est) + '</div>';
      }
      html += '</a>';
    }

    html += '</div>';
    container.innerHTML = html;
    container.style.display = '';
  }

  function trunc(str, max) {
    if (!str || str.length <= max) return str || '';
    return str.substring(0, max - 1) + '\u2026';
  }

  // ---------- EVENTS ----------

  // Card click → open convergence view
  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.cpr-card');
    if (!card) return;
    var letter = card.getAttribute('data-letter');
    var fam = families.find(function (f) { return f.letter === letter; });
    if (fam) openConvergenceView(fam);
  });

  // Close convergence view
  convClose.addEventListener('click', closeConvergenceView);
  if (convBreadcrumbBack) {
    convBreadcrumbBack.addEventListener('click', function (e) {
      e.preventDefault();
      closeConvergenceView();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !convView.hasAttribute('hidden')) closeConvergenceView();
  });

  // Print convergence view
  if (convPrint) {
    convPrint.addEventListener('click', function () {
      window.print();
    });
  }

  // Nav scroll effect (add shadow on scroll)
  if (trackerNav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        trackerNav.classList.add('tracker-nav--scrolled');
      } else {
        trackerNav.classList.remove('tracker-nav--scrolled');
      }
    }, { passive: true });
  }

  // Node click → show detail panel + expansion for expandable nodes (event delegation)
  convChartWrap.addEventListener('click', function (e) {
    var nodeEl = e.target.closest('.conv-chart__node');
    if (!nodeEl) return;

    var colKey = nodeEl.getAttribute('data-col-key');
    var nodeIdxAttr = nodeEl.getAttribute('data-node-idx');
    if (!currentFamily || nodeIdxAttr === null) return;

    var node = getNodeData(currentFamily, colKey, parseInt(nodeIdxAttr, 10));
    if (!node) return;

    // Toggle: if this node's detail is already open, close it
    var wasActive = nodeEl.classList.contains('conv-chart__node--active-detail');

    // Clear any existing active state + panels
    var prev = convChartWrap.querySelector('.conv-chart__node--active-detail');
    if (prev) prev.classList.remove('conv-chart__node--active-detail');
    if (window.hideNodeDetail) window.hideNodeDetail();
    if (window.hideNodeExpansion) window.hideNodeExpansion();

    if (!wasActive) {
      nodeEl.classList.add('conv-chart__node--active-detail');
      // Show inline detail panel
      if (window.showNodeDetail) window.showNodeDetail(nodeEl, node, colKey);
      // If expandable, also open the expansion panel below chart
      if (window.isExpandableNode && window.isExpandableNode(node, colKey)) {
        if (window.showNodeExpansion) window.showNodeExpansion(convExpansion, node, colKey, currentFamily);
      }
    }
  });

  // Also handle keyboard (Enter/Space) on nodes
  convChartWrap.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var target = e.target.closest('.conv-chart__node');
    if (!target) return;
    e.preventDefault();
    target.click();
  });

  function getNodeData(fam, colKey, idx) {
    if (colKey === 'SYS') {
      return systemTimeline && systemTimeline.nodes && systemTimeline.nodes[idx];
    }
    var pipe = fam.pipelines && fam.pipelines[colKey];
    return pipe && pipe.nodes && pipe.nodes[idx];
  }

  // Content section toggle now handled by ContentRenderer.attachToggleListeners()

  // Browser back/forward
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash;
    if (!hash || hash === '#') {
      if (!convView.hasAttribute('hidden')) closeConvergenceView();
      if (compareView && !compareView.hasAttribute('hidden') && window.closeComparison) {
        window.closeComparison();
      }
    } else {
      var familyMatch = hash.match(/family=([A-Z]+)/i);
      if (familyMatch) {
        var target = familyMatch[1].toUpperCase();
        var fam = families.find(function (f) { return f.letter === target; });
        if (fam && fam !== currentFamily) openConvergenceView(fam);
      }
    }
  });

  // ---------- UTIL ----------
  function esc(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }
})();
