// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
// data-health.js — Data Health Dashboard for admin panel
// Computes quality scores across 5 dimensions: completeness, consistency,
// source coverage, timeliness, validity. Renders into #healthDashboard.

(function () {
  'use strict';

  var CONTENT_KEYS = ['about', 'standards_landscape', 'standards_development', 'sreq_analysis',
    'dpp_outlook', 'stakeholder_notes', 'key_risks', 'sources_summary'];

  var VALID_CERTAINTIES = ['green', 'yellow-green', 'amber', 'orange', 'red-orange', 'red', 'gray'];
  var VALID_STATUSES = ['not_started', 'draft', 'in_progress', 'complete', 'pending', 'unknown', 'phase_1_active', 'active', 'overdue'];
  var PLACEHOLDER_PATTERNS = /^(TBD|TODO|N\/A|\.{2,}|-{2,}|\?\?|placeholder|tbd|n\/a)$/i;
  var SOURCE_CITATION_RE = /\[S\d+\]/;
  var STALE_DAYS = 30;

  // ── DIMENSION WEIGHTS ──
  var WEIGHTS = {
    completeness: 0.30,
    consistency: 0.25,
    sources: 0.20,
    timeliness: 0.15,
    validity: 0.10
  };

  // ── HELPERS ──
  function pct(num, den) { return den === 0 ? 100 : Math.round(num / den * 100); }
  function daysSince(dateStr) {
    if (!dateStr) return Infinity;
    var d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return Infinity;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }
  function esc(s) { var e = document.createElement('span'); e.textContent = s; return e.innerHTML; }
  function scoreColor(score) {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  }
  function scoreLabel(score) {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs work';
    return 'Poor';
  }

  // ── COMPUTE COMPLETENESS ──
  function computeCompleteness(families) {
    var issues = [];
    var totalContentSlots = 0;
    var filledContentSlots = 0;
    var totalNodeDetail = 0;
    var filledNodeDetail = 0;
    var totalStdContent = 0;
    var filledStdContent = 0;

    families.forEach(function (fam) {
      var letter = fam.letter;

      // Content sections
      var content = fam.content || {};
      CONTENT_KEYS.forEach(function (key) {
        totalContentSlots++;
        if (content[key] && content[key].trim().length > 0 && !PLACEHOLDER_PATTERNS.test(content[key].trim())) {
          filledContentSlots++;
        } else {
          issues.push({ family: letter, check: 'content.' + key, detail: 'Empty or placeholder' });
        }
      });

      // Pipeline node details
      var pipes = fam.pipelines || {};
      Object.keys(pipes).forEach(function (pKey) {
        var nodes = pipes[pKey].nodes || [];
        nodes.forEach(function (n) {
          totalNodeDetail++;
          if (n.detail && n.detail.trim().length > 0) {
            filledNodeDetail++;
          } else {
            issues.push({ family: letter, check: 'Pipeline ' + pKey + ' ' + (n.type || '?') + ' detail', detail: 'Missing detail text' });
          }
        });
      });

      // Per-standard content
      var stds = fam.standards || [];
      stds.forEach(function (s) {
        totalStdContent++;
        if (s.content && s.content.description) {
          filledStdContent++;
        }
      });

      // Standards array presence
      if (!stds.length && fam.active_pipelines && fam.active_pipelines.length > 0) {
        issues.push({ family: letter, check: 'standards[]', detail: 'No standards listed despite active pipelines' });
      }

      // Convergence object
      if (!fam.convergence || !fam.convergence.dpp_date) {
        issues.push({ family: letter, check: 'convergence.dpp_date', detail: 'Missing convergence date' });
      }
    });

    var contentPct = pct(filledContentSlots, totalContentSlots);
    var nodePct = pct(filledNodeDetail, totalNodeDetail);
    var stdPct = pct(filledStdContent, totalStdContent);
    // Weighted average: content 50%, node detail 30%, standard content 20%
    var score = Math.round(contentPct * 0.5 + nodePct * 0.3 + stdPct * 0.2);

    return {
      score: score,
      label: 'Completeness',
      summary: contentPct + '% content sections \u00b7 ' + nodePct + '% node details \u00b7 ' + stdPct + '% standard content',
      details: {
        contentFilled: filledContentSlots, contentTotal: totalContentSlots, contentPct: contentPct,
        nodeFilled: filledNodeDetail, nodeTotal: totalNodeDetail, nodePct: nodePct,
        stdFilled: filledStdContent, stdTotal: totalStdContent, stdPct: stdPct
      },
      issues: issues
    };
  }

  // ── COMPUTE CONSISTENCY ──
  function computeConsistency(families) {
    var issues = [];
    var checks = 0;
    var passes = 0;

    families.forEach(function (fam) {
      var letter = fam.letter;
      var stds = fam.standards || [];
      var henActual = 0, eadActual = 0;
      stds.forEach(function (s) { if (s.type === 'EAD') eadActual++; else henActual++; });

      // Check standards_summary.completeness field vs actual
      var sm = fam.standards_summary;
      if (sm) {
        checks++;
        if (sm.completeness === 'full' || stds.length > 0) {
          passes++;
        }
      }

      // Check legacy dpp-est matches convergence.dpp_date
      checks++;
      var dppEst = fam['dpp-est'] || '';
      var convDate = (fam.convergence && fam.convergence.dpp_date) || '';
      if (dppEst && convDate && dppEst === convDate) {
        passes++;
      } else if (dppEst && convDate) {
        issues.push({ family: letter, check: 'dpp-est vs convergence', detail: '"' + dppEst + '" \u2260 "' + convDate + '"' });
      } else {
        passes++; // one or both missing, not a mismatch
      }

      // Check binding_constraint logic
      if (fam.convergence && fam.convergence.binding_constraint) {
        checks++;
        passes++; // presence is enough for now
      }

      // Check active_pipelines match pipelines keys
      var activePipes = fam.active_pipelines || [];
      var pipeKeys = Object.keys(fam.pipelines || {});
      checks++;
      var allPresent = true;
      activePipes.forEach(function (p) {
        if (pipeKeys.indexOf(p) === -1) {
          allPresent = false;
          issues.push({ family: letter, check: 'active_pipelines', detail: 'Pipeline "' + p + '" in active_pipelines but not in pipelines object' });
        }
      });
      if (allPresent) passes++;
    });

    var score = pct(passes, checks);
    return {
      score: score,
      label: 'Consistency',
      summary: passes + '/' + checks + ' checks passed \u00b7 ' + issues.length + ' issues',
      details: { checks: checks, passes: passes },
      issues: issues
    };
  }

  // ── COMPUTE SOURCE COVERAGE ──
  function computeSourceCoverage(families, systemData) {
    var issues = [];
    var totalNodes = 0;
    var sourcedNodes = 0;
    var totalStds = 0;
    var sourcedStds = 0;
    var totalContent = 0;
    var citedContent = 0;

    families.forEach(function (fam) {
      var letter = fam.letter;

      // Pipeline nodes
      var pipes = fam.pipelines || {};
      Object.keys(pipes).forEach(function (pKey) {
        var nodes = pipes[pKey].nodes || [];
        nodes.forEach(function (n) {
          totalNodes++;
          if (n.sources && n.sources.length > 0) {
            sourcedNodes++;
          } else {
            issues.push({ family: letter, check: 'Pipeline ' + pKey + ' ' + (n.type || '?'), detail: 'No sources' });
          }
        });
      });

      // Standards
      var stds = fam.standards || [];
      stds.forEach(function (s) {
        totalStds++;
        if (s.sources && s.sources.length > 0) {
          sourcedStds++;
        }
      });

      // Content with source citations [S#]
      var content = fam.content || {};
      CONTENT_KEYS.forEach(function (key) {
        if (content[key] && content[key].trim().length > 0) {
          totalContent++;
          if (SOURCE_CITATION_RE.test(content[key])) {
            citedContent++;
          }
        }
      });
    });

    // System timeline nodes
    var sysIssues = [];
    if (systemData) {
      var allSysNodes = (systemData.nodes || []).concat(systemData.cross_cutting || []);
      allSysNodes.forEach(function (n) {
        totalNodes++;
        if (n.sources && n.sources.length > 0) {
          sourcedNodes++;
        } else {
          sysIssues.push({ family: 'SYS', check: n.id || n.label, detail: 'No sources on system node' });
        }
        // Check sub_items
        if (n.sub_items) {
          n.sub_items.forEach(function (si) {
            totalNodes++;
            if (si.sources && si.sources.length > 0) {
              sourcedNodes++;
            } else {
              sysIssues.push({ family: 'SYS', check: (si.id || si.label) + ' (sub-item)', detail: 'No sources (inherits from parent)' });
            }
          });
        }
      });
    }

    var nodePct = pct(sourcedNodes, totalNodes);
    var stdPct = pct(sourcedStds, totalStds);
    var citePct = pct(citedContent, totalContent);
    var score = Math.round(nodePct * 0.5 + stdPct * 0.3 + citePct * 0.2);

    return {
      score: score,
      label: 'Source Coverage',
      summary: nodePct + '% nodes \u00b7 ' + stdPct + '% standards \u00b7 ' + citePct + '% content cited',
      details: {
        sourcedNodes: sourcedNodes, totalNodes: totalNodes, nodePct: nodePct,
        sourcedStds: sourcedStds, totalStds: totalStds, stdPct: stdPct,
        citedContent: citedContent, totalContent: totalContent, citePct: citePct
      },
      issues: issues.concat(sysIssues)
    };
  }

  // ── COMPUTE TIMELINESS ──
  function computeTimeliness(families, systemData) {
    var issues = [];
    var now = new Date();
    var totalFamilies = families.length;
    var freshFamilies = 0;
    var staleDays = [];

    families.forEach(function (fam) {
      var days = daysSince(fam.updated);
      staleDays.push({ letter: fam.letter, days: days });
      if (days <= STALE_DAYS) {
        freshFamilies++;
      } else {
        issues.push({
          family: fam.letter,
          check: 'updated',
          detail: days === Infinity ? 'No updated date' : days + ' days since last update'
        });
      }
    });

    // System timeline staleness
    var sysDays = systemData ? daysSince(systemData.updated) : Infinity;
    if (sysDays > STALE_DAYS) {
      issues.push({ family: 'SYS', check: 'system-timeline.json', detail: sysDays + ' days since last update' });
    }

    var score = pct(freshFamilies, totalFamilies);

    // Sort by staleness
    staleDays.sort(function (a, b) { return b.days - a.days; });

    return {
      score: score,
      label: 'Timeliness',
      summary: freshFamilies + '/' + totalFamilies + ' families updated within ' + STALE_DAYS + ' days',
      details: { freshFamilies: freshFamilies, totalFamilies: totalFamilies, staleDays: staleDays, sysDays: sysDays },
      issues: issues
    };
  }

  // ── COMPUTE VALIDITY ──
  function computeValidity(families) {
    var issues = [];
    var checks = 0;
    var passes = 0;

    families.forEach(function (fam) {
      var letter = fam.letter;

      // Check pipeline node field validity
      var pipes = fam.pipelines || {};
      Object.keys(pipes).forEach(function (pKey) {
        var nodes = pipes[pKey].nodes || [];
        nodes.forEach(function (n) {
          // Certainty valid
          checks++;
          if (VALID_CERTAINTIES.indexOf(n.certainty) !== -1) {
            passes++;
          } else {
            issues.push({ family: letter, check: pKey + '/' + (n.type || '?') + '.certainty', detail: 'Invalid: "' + n.certainty + '"' });
          }

          // Status valid
          checks++;
          if (VALID_STATUSES.indexOf(n.status) !== -1) {
            passes++;
          } else {
            issues.push({ family: letter, check: pKey + '/' + (n.type || '?') + '.status', detail: 'Invalid: "' + n.status + '"' });
          }
        });
      });

      // Check for placeholder text in content
      var content = fam.content || {};
      CONTENT_KEYS.forEach(function (key) {
        if (content[key] && content[key].trim().length > 0) {
          checks++;
          if (!PLACEHOLDER_PATTERNS.test(content[key].trim())) {
            passes++;
          } else {
            issues.push({ family: letter, check: 'content.' + key, detail: 'Contains placeholder text' });
          }
        }
      });

      // Check convergence binding_constraint (valid enum: product | system | tie | product-unknown | unknown)
      if (fam.convergence && fam.convergence.binding_constraint) {
        checks++;
        var validBinding = { 'product': 1, 'system': 1, 'tie': 1, 'product-unknown': 1, 'unknown': 1 };
        if (validBinding[fam.convergence.binding_constraint]) {
          passes++;
        } else {
          issues.push({ family: letter, check: 'convergence.binding_constraint', detail: 'Invalid: "' + fam.convergence.binding_constraint + '"' });
        }
      }

      // Check type field on system nodes referenced
      if (fam.convergence && fam.convergence.system_timeline_ref) {
        checks++;
        passes++; // ref is present
      }
    });

    var score = pct(passes, checks);
    return {
      score: score,
      label: 'Validity',
      summary: passes + '/' + checks + ' checks passed',
      details: { checks: checks, passes: passes },
      issues: issues
    };
  }

  // ── PER-FAMILY SCORES ──
  function computeFamilyScores(families, systemData) {
    return families.map(function (fam) {
      var singleArr = [fam];
      var comp = computeCompleteness(singleArr);
      var cons = computeConsistency(singleArr);
      var src = computeSourceCoverage(singleArr, null); // skip system for per-family
      var valid = computeValidity(singleArr);

      var days = daysSince(fam.updated);
      var timeScore = days <= STALE_DAYS ? 100 : Math.max(0, 100 - Math.round((days - STALE_DAYS) * 2));

      var overall = Math.round(
        comp.score * WEIGHTS.completeness +
        cons.score * WEIGHTS.consistency +
        src.score * WEIGHTS.sources +
        timeScore * WEIGHTS.timeliness +
        valid.score * WEIGHTS.validity
      );

      return {
        letter: fam.letter,
        name: fam.display_name || fam.full_name || '',
        overall: overall,
        completeness: comp.score,
        consistency: cons.score,
        sources: src.score,
        timeliness: timeScore,
        validity: valid.score,
        days: days,
        issueCount: comp.issues.length + cons.issues.length + src.issues.length + valid.issues.length
      };
    });
  }

  // ── RENDER ──
  function renderDimensionCard(dim) {
    var color = scoreColor(dim.score);
    var h = '<div class="dh-card" data-dim="' + dim.label.toLowerCase().replace(/\s+/g, '-') + '">';
    h += '<div class="dh-card__header">';
    h += '<span class="dh-card__label">' + esc(dim.label) + '</span>';
    h += '<span class="dh-card__score" style="color:' + color + ';">' + dim.score + '%</span>';
    h += '</div>';
    h += '<div class="dh-card__bar"><div class="dh-card__fill" style="width:' + dim.score + '%;background:' + color + ';"></div></div>';
    h += '<p class="dh-card__summary">' + esc(dim.summary) + '</p>';
    h += '<div class="dh-card__issues" style="display:none;">';

    if (dim.issues.length > 0) {
      h += '<table class="dh-table"><thead><tr><th>Family</th><th>Check</th><th>Issue</th></tr></thead><tbody>';
      var shown = dim.issues.slice(0, 50);
      shown.forEach(function (issue) {
        h += '<tr><td><strong>' + esc(issue.family) + '</strong></td>';
        h += '<td>' + esc(issue.check) + '</td>';
        h += '<td>' + esc(issue.detail) + '</td></tr>';
      });
      h += '</tbody></table>';
      if (dim.issues.length > 50) {
        h += '<p class="dh-more">+ ' + (dim.issues.length - 50) + ' more issues</p>';
      }
    } else {
      h += '<p class="dh-clean">No issues found.</p>';
    }
    h += '</div>';
    h += '<button class="dh-card__toggle">' + dim.issues.length + ' issues \u25bc</button>';
    h += '</div>';
    return h;
  }

  function renderFamilyTable(familyScores) {
    familyScores.sort(function (a, b) { return a.overall - b.overall; }); // worst first

    var h = '<div class="dh-family-section">';
    h += '<h3 class="dh-section-title">Per-Family Scores</h3>';
    h += '<table class="dh-table dh-table--families">';
    h += '<thead><tr>';
    h += '<th>Family</th><th>Overall</th><th>Complt.</th><th>Consist.</th><th>Sources</th><th>Fresh</th><th>Valid</th><th>Days</th><th>Issues</th>';
    h += '</tr></thead><tbody>';

    familyScores.forEach(function (fs) {
      var color = scoreColor(fs.overall);
      h += '<tr>';
      h += '<td><strong>' + esc(fs.letter) + '</strong> <span class="dh-fname">' + esc(fs.name) + '</span></td>';
      h += '<td style="color:' + color + ';font-weight:700;">' + fs.overall + '%</td>';
      h += '<td>' + fs.completeness + '%</td>';
      h += '<td>' + fs.consistency + '%</td>';
      h += '<td>' + fs.sources + '%</td>';
      h += '<td>' + fs.timeliness + '%</td>';
      h += '<td>' + fs.validity + '%</td>';
      h += '<td>' + (fs.days === Infinity ? '\u2014' : fs.days + 'd') + '</td>';
      h += '<td>' + fs.issueCount + '</td>';
      h += '</tr>';
    });

    h += '</tbody></table></div>';
    return h;
  }

  // ── MAIN RENDER ──
  window.renderDataHealth = function (familiesData, systemData, sourcesData) {
    var container = document.getElementById('healthDashboard');
    if (!container) return;

    var families = (familiesData && familiesData.families) || [];
    if (families.length === 0) {
      container.innerHTML = '<p>No family data loaded.</p>';
      return;
    }

    // Compute all dimensions
    var comp = computeCompleteness(families);
    var cons = computeConsistency(families);
    var src = computeSourceCoverage(families, systemData);
    var time = computeTimeliness(families, systemData);
    var valid = computeValidity(families);

    // Aggregate score
    var overallScore = Math.round(
      comp.score * WEIGHTS.completeness +
      cons.score * WEIGHTS.consistency +
      src.score * WEIGHTS.sources +
      time.score * WEIGHTS.timeliness +
      valid.score * WEIGHTS.validity
    );

    var overallColor = scoreColor(overallScore);

    // Build HTML
    var html = '';

    // Overall score hero
    html += '<div class="dh-hero">';
    html += '<div class="dh-hero__score" style="border-color:' + overallColor + ';">';
    html += '<span class="dh-hero__number" style="color:' + overallColor + ';">' + overallScore + '</span>';
    html += '<span class="dh-hero__pct">%</span>';
    html += '</div>';
    html += '<div class="dh-hero__meta">';
    html += '<h2 class="dh-hero__title">Data Health Score</h2>';
    html += '<p class="dh-hero__label" style="color:' + overallColor + ';">' + scoreLabel(overallScore) + '</p>';
    html += '<p class="dh-hero__detail">' + families.length + ' families \u00b7 ';
    var totalStds = 0;
    families.forEach(function (f) { totalStds += (f.standards || []).length; });
    html += totalStds + ' standards \u00b7 ';
    var totalNodes = 0;
    families.forEach(function (f) {
      var pipes = f.pipelines || {};
      Object.keys(pipes).forEach(function (k) { totalNodes += (pipes[k].nodes || []).length; });
    });
    html += totalNodes + ' pipeline nodes';
    html += '</p>';
    html += '</div>';
    html += '</div>';

    // Weight legend
    html += '<div class="dh-weights">';
    html += 'Weights: ';
    Object.keys(WEIGHTS).forEach(function (k) {
      html += '<span class="dh-weight-tag">' + k.charAt(0).toUpperCase() + k.slice(1) + ' ' + Math.round(WEIGHTS[k] * 100) + '%</span> ';
    });
    html += '</div>';

    // Dimension cards
    html += '<div class="dh-cards">';
    html += renderDimensionCard(comp);
    html += renderDimensionCard(cons);
    html += renderDimensionCard(src);
    html += renderDimensionCard(time);
    html += renderDimensionCard(valid);
    html += '</div>';

    // Per-family table
    var familyScores = computeFamilyScores(families, systemData);
    html += renderFamilyTable(familyScores);

    container.innerHTML = html;

    // Update tab badge
    var badge = document.getElementById('tabHealthScore');
    if (badge) {
      badge.textContent = overallScore + '%';
      badge.style.color = overallColor;
    }

    // Toggle handlers for dimension cards
    container.querySelectorAll('.dh-card__toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.dh-card');
        var issuesEl = card.querySelector('.dh-card__issues');
        var showing = issuesEl.style.display !== 'none';
        issuesEl.style.display = showing ? 'none' : 'block';
        btn.textContent = btn.textContent.replace(showing ? '\u25b2' : '\u25bc', showing ? '\u25bc' : '\u25b2');
      });
    });
  };
})();
