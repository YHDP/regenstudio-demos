/**
 * CPR DPP Tracker — Review Queue Module
 *
 * Intern-friendly guided wizard for reviewing agent-generated data updates
 * and structural issues. Self-contained IIFE that exposes window.initReviewQueue().
 *
 * Follows the data-health.js pattern: called from admin.js after data loads.
 */
(function () {
  'use strict';

  // ─── Pipeline & Node Label Maps ───
  var PIPELINE_LABELS = {
    A: 'New-CPR hEN Route',
    B: 'Old-CPR Fast-Track',
    C: 'Old EAD Sunset',
    D: 'New EAD Future',
    E: 'ESPR Supplementary'
  };

  var FIELD_LABELS = {
    'content.about': 'Content: About This Family',
    'content.standards_landscape': 'Content: Standards Landscape',
    'content.standards_development': 'Content: Standards in Development',
    'content.sreq_analysis': 'Content: Standardisation Request Analysis',
    'content.dpp_outlook': 'Content: DPP Outlook',
    'content.stakeholder_notes': 'Content: Stakeholder & Domain Notes',
    'content.key_risks': 'Content: Key Risks',
    'content.sources_summary': 'Content: Sources Summary',
    'updated': 'Family Last-Updated Date',
    'dpp-est': 'DPP Estimated Date',
    'sreq': 'Standardisation Request Status'
  };

  var DPP_RANGE_LABELS = {
    'hen_count': 'Harmonised Standards Count',
    'ead_count': 'European Assessment Document Count',
    'hen_earliest': 'Earliest hEN DPP Date',
    'hen_latest': 'Latest hEN DPP Date',
    'ead_earliest': 'Earliest EAD DPP Date',
    'ead_latest': 'Latest EAD DPP Date',
    'envelope': 'Overall DPP Date Range'
  };

  var MILESTONES_LABELS = {
    'i': 'Milestone I (Product Scope)',
    'iii': 'Milestone III (Essential Chars)',
    'sreq': 'Standardisation Request',
    'delivery': 'Standards Delivery',
    'mandatory': 'Mandatory Date',
    'dpp': 'DPP Date'
  };

  // Context tooltips — keyed by field path patterns
  var FIELD_CONTEXT = {
    'content.key_risks': {
      what: 'Key Risks documents the main risks that could delay or complicate DPP compliance for this product family.',
      check: 'Verify each risk item is factually accurate and sourced. Check that risk severity matches the evidence.'
    },
    'content.sources_summary': {
      what: 'Sources Summary lists all references used for this family\u2019s data (legal texts, standards databases, press).',
      check: 'Verify source IDs match entries in sources.json. Check URLs are reachable.'
    },
    'content.about': {
      what: 'About describes what products this family covers and its regulatory context.',
      check: 'Check the scope matches the CPR Annex VII description.'
    },
    'content.standards_landscape': {
      what: 'Standards Landscape summarises the current harmonised standards and EADs for this family.',
      check: 'Cross-check counts against the standards list. Verify cited OJ references.'
    },
    'content.standards_development': {
      what: 'Standards in Development tracks ongoing CEN work, prEN registrations, and delivery timelines.',
      check: 'Check CEN stage codes and delivery dates against genorma.com or CEN databases.'
    },
    'content.sreq_analysis': {
      what: 'SReq Analysis details the standardisation request from the European Commission.',
      check: 'Verify the SReq reference number and adoption date against EC transparency register.'
    },
    'content.dpp_outlook': {
      what: 'DPP Outlook forecasts when this family will need Digital Product Passports.',
      check: 'Verify the timeline is consistent with convergence.dpp_date and the binding constraint.'
    },
    'content.stakeholder_notes': {
      what: 'Stakeholder Notes captures industry positions, TC feedback, and market signals.',
      check: 'Verify sources are attributed. Check that positions reflect current stakeholder views.'
    },
    'dpp-range.hen_count': {
      what: 'The total number of OJ-cited harmonised European standards (hENs) for this family.',
      check: 'Count the standards[] entries with type "hEN" and cited: true. The number must match.'
    },
    'dpp-range.ead_count': {
      what: 'The total number of European Assessment Documents (EADs) for this family.',
      check: 'Count the standards[] entries with type "EAD". The number must match.'
    },
    'updated': {
      what: 'The date this family\u2019s data was last reviewed/updated.',
      check: 'Should be today\u2019s date or the date of the review that generated this update.'
    },
    '_node_status': {
      what: 'The current progress status of this pipeline node.',
      check: 'Valid values: not_started, draft, in_progress, adopted, complete, pending, unknown.'
    },
    '_node_certainty': {
      what: 'How confident we are in this node\u2019s data (green = confirmed, red = speculative).',
      check: 'Should match the evidence quality. Draft SReq with closed feedback \u2192 yellow-green.'
    },
    '_node_detail': {
      what: 'Free-text description providing context for this pipeline node.',
      check: 'Verify dates and references mentioned in the detail text.'
    },
    '_node_date': {
      what: 'The date associated with this pipeline node event.',
      check: 'Verify against the source document. Format: YYYY-MM-DD or descriptive (e.g. "Q1 2026").'
    },
    '_default': {
      what: 'A data field in the product family record.',
      check: 'Compare the proposed value against the cited source document.'
    }
  };

  var ACTION_LABELS = {
    'add_standard': 'Add New Standard',
    'update_standard': 'Update Existing Standard',
    'remove_standard': 'Remove Standard',
    'set': 'Update Field'
  };

  var SEVERITY_ICONS = {
    'critical': '\u26A0\uFE0F',
    'error': '\u26A0\uFE0F',
    'warning': '\u26A0',
    'medium': '\u2139\uFE0F',
    'low': '\u2139\uFE0F',
    'info': '\u2139\uFE0F'
  };

  // ─── State ───
  var state = {
    queue: null,
    familiesData: null,
    callbacks: null,
    currentIndex: 0,
    issueFilters: { severity: '', family: '', type: '', status: '' }
  };

  // ─── URL Safety ───

  function safeHref(url) {
    if (!url) return '';
    var trimmed = String(url).trim().toLowerCase();
    if (trimmed.indexOf('https://') === 0 || trimmed.indexOf('http://') === 0) return esc(url);
    return '#';
  }

  // ─── Field Translation ───

  function translateFieldPath(field, action, update, familiesData) {
    // Null guard
    if (!field) return ACTION_LABELS[action] || 'Update';

    // Direct lookup
    if (FIELD_LABELS[field]) return FIELD_LABELS[field];

    // Action-based labels
    if (action === 'add_standard') {
      var stdId = (update.proposed_value && update.proposed_value.id) || update.standard_id || '?';
      return 'Standards List \u2190 Add: ' + stdId;
    }
    if (action === 'update_standard') {
      return 'Standards List \u2190 Update: ' + (update.standard_id || '?');
    }
    if (action === 'remove_standard') {
      return 'Standards List \u2190 Remove: ' + (update.standard_id || '?');
    }

    // dpp-range sub-fields
    var dppMatch = field.match(/^dpp-range\.(.+)$/);
    if (dppMatch && DPP_RANGE_LABELS[dppMatch[1]]) {
      return 'DPP Range: ' + DPP_RANGE_LABELS[dppMatch[1]];
    }

    // milestones sub-fields
    var msMatch = field.match(/^milestones\.(.+?)(?:\.(.+))?$/);
    if (msMatch) {
      var msLabel = MILESTONES_LABELS[msMatch[1]] || msMatch[1];
      if (msMatch[2]) {
        return 'Milestones: ' + msLabel + ' \u203A ' + msMatch[2];
      }
      return 'Milestones: ' + msLabel;
    }

    // Pipeline node paths: pipelines.X.nodes[N].field
    var nodeMatch = field.match(/^pipelines\.([A-E])\.nodes\[(\d+)\]\.(.+)$/);
    if (nodeMatch) {
      var pKey = nodeMatch[1];
      var nIdx = parseInt(nodeMatch[2], 10);
      var nField = nodeMatch[3];
      var pLabel = PIPELINE_LABELS[pKey] || ('Pipeline ' + pKey);
      var nodeLabel = resolveNodeLabel(update.family, pKey, nIdx, familiesData);
      var fieldLabel = nField.charAt(0).toUpperCase() + nField.slice(1).replace(/_/g, ' ');
      return 'Pipeline ' + pKey + ': ' + pLabel + ' \u203A ' + nodeLabel + ' \u203A ' + fieldLabel;
    }

    // Standards named lookup: standards[NAME].field
    var stdMatch = field.match(/^standards\[(.+)\]\.(.+)$/);
    if (stdMatch) {
      return 'Standard: ' + stdMatch[1] + ' \u203A ' + stdMatch[2];
    }

    // Fallback: humanize dot path
    return field.split('.').map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1).replace(/_/g, ' ');
    }).join(' \u203A ');
  }

  function resolveNodeLabel(familyLetter, pipelineKey, nodeIndex, familiesData) {
    if (!familiesData || !familiesData.families) return 'Node ' + nodeIndex;
    for (var i = 0; i < familiesData.families.length; i++) {
      var f = familiesData.families[i];
      if (f.letter === familyLetter && f.pipelines && f.pipelines[pipelineKey]) {
        var nodes = f.pipelines[pipelineKey].nodes;
        if (nodes && nodes[nodeIndex]) {
          return nodes[nodeIndex].label || ('Node ' + nodeIndex);
        }
      }
    }
    return 'Node ' + nodeIndex;
  }

  function getFieldContext(field, action) {
    if (action === 'add_standard' || action === 'update_standard' || action === 'remove_standard') {
      return {
        what: 'A harmonised standard or EAD entry in this family\u2019s standards list.',
        check: 'Verify the standard ID, type (hEN/EAD), and citation status against EUR-Lex or the EOTA database.'
      };
    }
    // Exact match
    if (FIELD_CONTEXT[field]) return FIELD_CONTEXT[field];
    // Node field pattern (only for pipeline node paths)
    var nodeMatch = field.match(/^pipelines\.\w+\.nodes\[\d+\]\.(\w+)$/);
    if (nodeMatch) {
      var contextKey = '_node_' + nodeMatch[1];
      if (FIELD_CONTEXT[contextKey]) return FIELD_CONTEXT[contextKey];
    }
    return FIELD_CONTEXT['_default'];
  }

  // ─── Resolve Field Path (for apply) ───

  function tokenizeFieldPath(field) {
    // Handles: "pipelines.A.nodes[2].status", "dpp-range.hen_count", "standards[EN 1-2:2025].version"
    var tokens = [];
    var re = /([^.\[\]]+)|\[(\d+)\]|\[([^\]]+)\]/g;
    var m;
    while ((m = re.exec(field)) !== null) {
      if (m[1] !== undefined) tokens.push(m[1]);
      else if (m[2] !== undefined) tokens.push(parseInt(m[2], 10));
      else if (m[3] !== undefined) tokens.push(m[3]);
    }
    return tokens;
  }

  function resolveFieldPath(obj, tokens, autoCreate) {
    // Returns { parent, key } so caller can read/write
    var current = obj;
    for (var i = 0; i < tokens.length - 1; i++) {
      if (current === null || current === undefined) return null;
      if (current[tokens[i]] === undefined) {
        if (!autoCreate) return null;
        // Create array if next token is numeric, else object
        current[tokens[i]] = (typeof tokens[i + 1] === 'number') ? [] : {};
      }
      current = current[tokens[i]];
    }
    return { parent: current, key: tokens[tokens.length - 1] };
  }

  // ─── Apply / Undo ───

  function applyUpdate(update, familiesData) {
    var fam = findFamily(update.family, familiesData);
    if (!fam) return { ok: false, error: 'Family "' + update.family + '" not found' };

    var action = update.action || 'set';

    // Save original updated date for undo
    update._undo_updated = fam.updated || null;

    // Build verification stamp for propagation into familiesData
    var vStamp = null;
    if (update.verification && update.verification.claim_attributed === true) {
      vStamp = {
        human_verified: true,
        verified_at: update.verification.verified_at || todayStr(),
        source: update.source || null,
        source_url: update.source_url || null
      };
    }

    if (action === 'add_standard') {
      if (!fam.standards) fam.standards = [];
      // Check for duplicate
      var exists = fam.standards.some(function (s) { return s.id === (update.proposed_value && update.proposed_value.id); });
      if (exists) return { ok: false, error: 'Standard already exists: ' + (update.proposed_value && update.proposed_value.id) };
      update._undo_action = 'remove_last_standard';
      update._undo_index = fam.standards.length;
      var newStd = JSON.parse(JSON.stringify(update.proposed_value));
      // Tag standard with verification metadata
      if (vStamp) newStd._verification = vStamp;
      fam.standards.push(newStd);
      fam.updated = todayStr();
      return { ok: true };
    }

    if (action === 'update_standard') {
      if (!fam.standards) return { ok: false, error: 'No standards array' };
      var stdIdx = -1;
      for (var i = 0; i < fam.standards.length; i++) {
        if (fam.standards[i].id === update.standard_id) {
          stdIdx = i; break;
        }
      }
      // Fallback: partial match if exact match failed (handles version suffixes)
      if (stdIdx === -1) {
        for (var ii = 0; ii < fam.standards.length; ii++) {
          if (fam.standards[ii].id && fam.standards[ii].id.indexOf(update.standard_id) === 0) {
            stdIdx = ii; break;
          }
        }
      }
      if (stdIdx === -1) return { ok: false, error: 'Standard not found: ' + update.standard_id };
      // Save undo snapshot
      update._undo_action = 'restore_standard';
      update._undo_snapshot = JSON.parse(JSON.stringify(fam.standards[stdIdx]));
      update._undo_index = stdIdx;
      // Merge proposed keys
      var proposed = update.proposed_value || {};
      Object.keys(proposed).forEach(function (k) {
        fam.standards[stdIdx][k] = proposed[k];
      });
      // Tag with verification
      if (vStamp) fam.standards[stdIdx]._verification = vStamp;
      fam.updated = todayStr();
      return { ok: true };
    }

    if (action === 'remove_standard') {
      if (!fam.standards) return { ok: false, error: 'No standards array' };
      var rmIdx = -1;
      for (var j = 0; j < fam.standards.length; j++) {
        if (fam.standards[j].id === update.standard_id) { rmIdx = j; break; }
      }
      if (rmIdx === -1) return { ok: false, error: 'Standard not found: ' + update.standard_id };
      update._undo_action = 'reinsert_standard';
      update._undo_snapshot = JSON.parse(JSON.stringify(fam.standards[rmIdx]));
      update._undo_index = rmIdx;
      fam.standards.splice(rmIdx, 1);
      fam.updated = todayStr();
      return { ok: true };
    }

    // action === 'set'
    var tokens = tokenizeFieldPath(update.field);
    var ref = resolveFieldPath(fam, tokens);
    if (!ref) return { ok: false, error: 'Could not resolve path: ' + update.field };
    // Save undo value
    update._undo_action = 'restore_value';
    update._undo_value = ref.parent[ref.key] !== undefined ? JSON.parse(JSON.stringify(ref.parent[ref.key])) : undefined;
    update._undo_tokens = tokens;
    ref.parent[ref.key] = update.proposed_value;
    // For content fields, store verification alongside the data
    if (vStamp && update.field.indexOf('content.') === 0) {
      var vKey = '_verification_' + tokens[tokens.length - 1];
      if (!fam._content_verifications) fam._content_verifications = {};
      fam._content_verifications[tokens[tokens.length - 1]] = vStamp;
    }
    fam.updated = todayStr();
    return { ok: true };
  }

  function undoUpdate(update, familiesData) {
    var fam = findFamily(update.family, familiesData);
    if (!fam) return false;

    var undoAction = update._undo_action;
    if (!undoAction) return false;

    if (undoAction === 'remove_last_standard') {
      if (fam.standards) {
        var expectedId = update.proposed_value && update.proposed_value.id;
        var removeIdx = update._undo_index;
        // Verify index points to the right standard; if not, search by ID
        if (fam.standards[removeIdx] && fam.standards[removeIdx].id === expectedId) {
          fam.standards.splice(removeIdx, 1);
        } else if (expectedId) {
          for (var si = fam.standards.length - 1; si >= 0; si--) {
            if (fam.standards[si].id === expectedId) {
              fam.standards.splice(si, 1);
              break;
            }
          }
        }
      }
    } else if (undoAction === 'restore_standard') {
      if (fam.standards && fam.standards[update._undo_index]) {
        fam.standards[update._undo_index] = update._undo_snapshot;
      }
    } else if (undoAction === 'reinsert_standard') {
      if (fam.standards) {
        fam.standards.splice(update._undo_index, 0, update._undo_snapshot);
      }
    } else if (undoAction === 'restore_value') {
      var ref = resolveFieldPath(fam, update._undo_tokens);
      if (ref) {
        if (update._undo_value === undefined) {
          delete ref.parent[ref.key];
        } else {
          ref.parent[ref.key] = update._undo_value;
        }
      }
    }

    // Restore original updated date
    if (update._undo_updated !== undefined) {
      fam.updated = update._undo_updated;
    }

    // Clean undo metadata
    delete update._undo_action;
    delete update._undo_value;
    delete update._undo_tokens;
    delete update._undo_snapshot;
    delete update._undo_index;
    delete update._undo_updated;

    return true;
  }

  // ─── Helpers ───

  function findFamily(letter, familiesData) {
    if (!familiesData || !familiesData.families) return null;
    for (var i = 0; i < familiesData.families.length; i++) {
      if (familiesData.families[i].letter === letter) return familiesData.families[i];
    }
    return null;
  }

  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function esc(str) {
    if (str === null || str === undefined) return '';
    if (typeof str !== 'string') str = JSON.stringify(str);
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatValue(val) {
    if (val === null || val === undefined || val === '') return '(empty)';
    if (typeof val === 'object') {
      var json = JSON.stringify(val, null, 2);
      if (json.length > 300) return json.substring(0, 297) + '...';
      return json;
    }
    return String(val);
  }

  function deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a == b;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return false;
    var isArrayA = Array.isArray(a), isArrayB = Array.isArray(b);
    if (isArrayA !== isArrayB) return false;
    if (isArrayA) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    var keysA = Object.keys(a).sort(), keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    for (var k = 0; k < keysA.length; k++) {
      if (keysA[k] !== keysB[k]) return false;
      if (!deepEqual(a[keysA[k]], b[keysB[k]])) return false;
    }
    return true;
  }

  function isNoOp(update) {
    var action = update.action || 'set';
    if (action !== 'set') return false;
    return deepEqual(update.current_value, update.proposed_value);
  }

  function getFamilyDisplayName(letter, familiesData) {
    var fam = findFamily(letter, familiesData);
    if (fam) return fam.letter + ' \u2014 ' + (fam.display_name || fam.full_name);
    return letter;
  }

  // ─── Schema Normalization ───
  // Handles both data/review-queue.json (has meta) and deep-dives/review-queue-merged.json (flat)
  function normalizeQueue(raw) {
    var affected = [];
    if (!raw.meta) {
      // Derive affected families from dataUpdates rather than using full families list
      var seen = {};
      (raw.dataUpdates || []).forEach(function (u) {
        if (u.family && !seen[u.family]) { seen[u.family] = true; affected.push(u.family); }
      });
    }
    return {
      meta: raw.meta || {
        generated: raw.generated || raw.regenerated || null,
        source: raw.source || raw.note || null,
        agent: raw.agent || 'cpr-expert',
        families_affected: affected,
        total_updates: raw.dataUpdates_count || (raw.dataUpdates ? raw.dataUpdates.length : 0),
        total_issues: raw.structuralIssues_count || (raw.structuralIssues ? raw.structuralIssues.length : 0)
      },
      dataUpdates: raw.dataUpdates || [],
      structuralIssues: raw.structuralIssues || []
    };
  }

  // ─── Toast ───

  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('rqToastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'rq-toast rq-toast--' + type;
    toast.textContent = message;
    container.appendChild(toast);
    // Trigger animation
    requestAnimationFrame(function () { toast.classList.add('rq-toast--visible'); });
    setTimeout(function () {
      toast.classList.remove('rq-toast--visible');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  // ─── Progress Bar ───

  function renderProgressBar(container) {
    var updates = state.queue.dataUpdates || [];
    var total = updates.length;
    if (total === 0) { container.innerHTML = ''; return; }

    var accepted = 0, rejected = 0, skipped = 0;
    updates.forEach(function (u) {
      if (u.status === 'accepted' || u.status === 'applied') accepted++;
      else if (u.status === 'rejected' || u.status === 'dismissed') rejected++;
      else skipped++;
    });

    var pctAccepted = Math.round((accepted / total) * 100);
    var pctRejected = Math.round((rejected / total) * 100);

    container.innerHTML =
      '<div class="rq-progress">' +
        '<div class="rq-progress__bar">' +
          '<div class="rq-progress__fill rq-progress__fill--accepted" style="width:' + pctAccepted + '%"></div>' +
          '<div class="rq-progress__fill rq-progress__fill--rejected" style="width:' + pctRejected + '%"></div>' +
        '</div>' +
        '<div class="rq-progress__stats">' +
          '<span class="rq-progress__stat rq-progress__stat--accepted">' + accepted + ' accepted</span>' +
          '<span class="rq-progress__stat rq-progress__stat--rejected">' + rejected + ' rejected</span>' +
          '<span class="rq-progress__stat rq-progress__stat--pending">' + skipped + ' pending</span>' +
        '</div>' +
      '</div>';
  }

  // ─── Download Button ───

  function renderDownloadBtn(container) {
    var updates = state.queue.dataUpdates || [];
    var accepted = updates.filter(function (u) { return u.status === 'accepted' || u.status === 'applied'; }).length;
    container.innerHTML = '';
    if (accepted > 0) {
      var btn = document.createElement('button');
      btn.className = 'btn btn--primary rq-download-btn';
      btn.textContent = 'Download Updated families-v2.json (' + accepted + ' change' + (accepted === 1 ? '' : 's') + ')';
      btn.addEventListener('click', function () {
        if (!state.familiesData) return;
        state.familiesData.updated = todayStr();
        var blob = new Blob([JSON.stringify(state.familiesData, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'families-v2.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Downloaded families-v2.json', 'success');
        if (state.callbacks && state.callbacks.onFamiliesDirty) {
          state.callbacks.onFamiliesDirty();
        }
      });
      container.appendChild(btn);
    }
  }

  // ─── Update Wizard ───

  function renderUpdateWizard() {
    var container = document.getElementById('rqUpdatesPanel');
    if (!container) return;

    var updates = (state.queue && state.queue.dataUpdates) || [];
    if (updates.length === 0) {
      container.innerHTML =
        '<div class="admin-empty">' +
          '<div class="admin-empty__title">No data updates</div>' +
          '<p class="admin-empty__text">The review queue contains no data updates.</p>' +
        '</div>';
      return;
    }

    // Clamp index
    if (state.currentIndex >= updates.length) state.currentIndex = updates.length - 1;
    if (state.currentIndex < 0) state.currentIndex = 0;

    var update = updates[state.currentIndex];
    var noop = isNoOp(update);
    var action = update.action || 'set';
    var translatedField = translateFieldPath(update.field, action, update, state.familiesData);
    var context = getFieldContext(update.field, action);
    var familyName = getFamilyDisplayName(update.family, state.familiesData);

    var html = '';

    // Progress bar
    html += '<div id="rqProgressBar"></div>';

    // Card
    html += '<div class="rq-card' + (update.status === 'accepted' || update.status === 'applied' ? ' rq-card--accepted' : '') + (update.status === 'rejected' || update.status === 'dismissed' ? ' rq-card--rejected' : '') + (noop ? ' rq-card--noop' : '') + '">';

    // Header
    html += '<div class="rq-card__header">';
    html += '<span class="rq-card__family">' + esc(familyName) + '</span>';
    html += '<span class="rq-card__badge rq-card__badge--' + esc(update.confidence || 'medium') + '">' + esc((update.confidence || 'medium').toUpperCase()) + '</span>';
    html += '</div>';

    // What is being changed
    html += '<div class="rq-card__section">';
    html += '<div class="rq-card__section-label">' + esc(ACTION_LABELS[action] || 'Update') + '</div>';
    html += '<div class="rq-card__field-path">' + esc(translatedField) + '</div>';
    html += '</div>';

    // Diff
    html += '<div class="rq-card__section">';
    html += '<div class="rq-card__section-label">Values</div>';
    if (noop) {
      html += '<div class="rq-card__diff rq-card__diff--noop">';
      html += '<div class="rq-card__value rq-card__value--verified">';
      html += '<pre>' + esc(formatValue(update.current_value)) + '</pre>';
      html += '</div>';
      html += '<div class="rq-card__noop-label">Verified \u2014 no change needed</div>';
      html += '</div>';
    } else {
      html += '<div class="rq-card__diff">';
      html += '<div class="rq-card__value-col">';
      html += '<div class="rq-card__value-label">Current</div>';
      html += '<div class="rq-card__value rq-card__value--old"><pre>' + esc(formatValue(update.current_value)) + '</pre></div>';
      html += '</div>';
      html += '<div class="rq-card__arrow">\u2192</div>';
      html += '<div class="rq-card__value-col">';
      html += '<div class="rq-card__value-label">Proposed</div>';
      html += '<div class="rq-card__value rq-card__value--new"><pre>' + esc(formatValue(update.proposed_value)) + '</pre></div>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';

    // Reason
    html += '<div class="rq-card__section">';
    html += '<div class="rq-card__section-label">Why This Change Is Proposed</div>';
    html += '<div class="rq-card__reason">' + esc(update.reason || '') + '</div>';
    html += '</div>';

    // Source
    if (update.source) {
      html += '<div class="rq-card__section">';
      html += '<div class="rq-card__section-label">Source</div>';
      html += '<div class="rq-card__source">' + esc(update.source);
      if (update.source_url) {
        html += ' <a class="rq-card__source-link" href="' + safeHref(update.source_url) + '" target="_blank" rel="noopener">Open source to verify \u2197</a>';
      }
      html += '</div>';
      html += '</div>';
    }

    // Verification section (claim-source attribution)
    var v = update.verification || {};
    var hasSource = !!update.source;
    if (hasSource && !noop) {
      html += '<div class="rq-card__verification">';
      html += '<div class="rq-card__section-label">Source & Claim Verification</div>';

      // Row 1: Source reliability
      html += '<div class="rq-card__verify-row">';
      html += '<span class="rq-card__verify-label">Is this source reliable and authoritative?</span>';
      if (v.source_reliable === true) {
        html += '<button class="rq-card__verify-btn rq-card__verify-btn--verified" disabled>Verified</button>';
        html += '<button class="btn btn--xs btn--outline" data-rq-action="unverify-source" style="margin-left:4px;">Undo</button>';
      } else if (v.source_reliable === false) {
        html += '<button class="rq-card__verify-btn rq-card__verify-btn--failed" disabled>Unreliable</button>';
        html += '<button class="btn btn--xs btn--outline" data-rq-action="unverify-source" style="margin-left:4px;">Undo</button>';
      } else {
        html += '<button class="rq-card__verify-btn" data-rq-action="verify-source-yes">Yes, reliable</button>';
        html += '<button class="rq-card__verify-btn" data-rq-action="verify-source-no">No</button>';
      }
      html += '</div>';

      // Row 2: Claim attribution
      html += '<div class="rq-card__verify-row">';
      html += '<span class="rq-card__verify-label">Does the source support the proposed change?</span>';
      if (v.claim_attributed === true) {
        html += '<button class="rq-card__verify-btn rq-card__verify-btn--verified" disabled>Confirmed</button>';
        html += '<button class="btn btn--xs btn--outline" data-rq-action="unverify-claim" style="margin-left:4px;">Undo</button>';
      } else if (v.claim_attributed === false) {
        html += '<button class="rq-card__verify-btn rq-card__verify-btn--failed" disabled>Not supported</button>';
        html += '<button class="btn btn--xs btn--outline" data-rq-action="unverify-claim" style="margin-left:4px;">Undo</button>';
      } else {
        html += '<button class="rq-card__verify-btn" data-rq-action="verify-claim-yes">Yes, claim matches source</button>';
        html += '<button class="rq-card__verify-btn" data-rq-action="verify-claim-no">No</button>';
      }
      html += '</div>';

      // Verification status summary
      if (v.source_reliable === true && v.claim_attributed === true) {
        html += '<div class="rq-card__verify-summary rq-card__verify-summary--pass">Source and claim verified \u2014 ready to accept.</div>';
      } else if (v.source_reliable === false || v.claim_attributed === false) {
        html += '<div class="rq-card__verify-summary rq-card__verify-summary--fail">Verification failed \u2014 consider rejecting this change.</div>';
      } else {
        html += '<div class="rq-card__verify-summary rq-card__verify-summary--pending">Verify source and claim before accepting.</div>';
      }

      html += '</div>';
    }

    // Context tooltip
    html += '<div class="rq-card__context">';
    html += '<div class="rq-card__context-icon">\u2139\uFE0F</div>';
    html += '<div>';
    html += '<div class="rq-card__context-text">' + esc(context.what) + '</div>';
    html += '<div class="rq-card__context-check"><strong>Check:</strong> ' + esc(context.check) + '</div>';
    html += '</div>';
    html += '</div>';

    // Actions — Accept requires claim verification for non-noop items with sources
    var canAccept = noop || !hasSource || (v.claim_attributed === true);
    html += '<div class="rq-card__actions">';
    if (update.status === 'pending') {
      if (noop) {
        html += '<button class="btn btn--sm btn--outline" data-rq-action="dismiss">Dismiss</button>';
        html += '<button class="btn btn--sm btn--outline" data-rq-action="skip">Skip for now</button>';
      } else {
        html += '<button class="btn btn--sm btn--primary" data-rq-action="accept"' + (!canAccept ? ' disabled title="Verify claim attribution before accepting"' : '') + '>Accept</button>';
        html += '<button class="btn btn--sm btn--danger" data-rq-action="reject">Reject</button>';
        html += '<button class="btn btn--sm btn--outline" data-rq-action="skip">Skip for now</button>';
      }
    } else {
      var statusLabel = update.status === 'accepted' ? 'Accepted' :
                        update.status === 'applied' ? 'Applied' :
                        update.status === 'dismissed' ? 'Dismissed' :
                        update.status === 'rejected' ? 'Rejected' : update.status;
      var statusClass = (update.status === 'accepted' || update.status === 'applied') ? 'accepted' :
                        (update.status === 'rejected' || update.status === 'dismissed') ? 'rejected' : '';
      html += '<span class="rq-card__status rq-card__status--' + statusClass + '">' + esc(statusLabel) + '</span>';
      if (update.status === 'accepted' || update.status === 'applied') {
        html += '<button class="btn btn--xs btn--outline" data-rq-action="undo">Undo</button>';
      }
      html += '<button class="btn btn--xs btn--outline" data-rq-action="reset">Reset to Pending</button>';
    }
    html += '</div>';

    html += '</div>'; // rq-card

    // Navigation
    html += '<div class="rq-nav">';
    html += '<button class="btn btn--sm btn--outline" data-rq-action="prev"' + (state.currentIndex === 0 ? ' disabled' : '') + '>\u2190 Previous</button>';
    html += '<span class="rq-nav__counter">Card ' + (state.currentIndex + 1) + ' of ' + updates.length + '</span>';
    html += '<button class="btn btn--sm btn--outline" data-rq-action="next"' + (state.currentIndex === updates.length - 1 ? ' disabled' : '') + '>Next \u2192</button>';
    html += '</div>';

    // Download button
    html += '<div id="rqDownloadBtn"></div>';

    container.innerHTML = html;

    // Render sub-components
    renderProgressBar(document.getElementById('rqProgressBar'));
    renderDownloadBtn(document.getElementById('rqDownloadBtn'));

    // Attach event listeners
    container.querySelectorAll('[data-rq-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleWizardAction(btn.getAttribute('data-rq-action'));
      });
    });
  }

  function handleWizardAction(action) {
    var updates = state.queue.dataUpdates;
    var update = updates[state.currentIndex];
    if (!update) return;

    // Verification actions (re-render card without advancing)
    if (action === 'verify-source-yes' || action === 'verify-source-no' ||
        action === 'verify-claim-yes' || action === 'verify-claim-no' ||
        action === 'unverify-source' || action === 'unverify-claim') {
      if (!update.verification) update.verification = {};
      if (action === 'verify-source-yes') {
        update.verification.source_reliable = true;
        showToast('Source marked as reliable', 'success');
      } else if (action === 'verify-source-no') {
        update.verification.source_reliable = false;
        showToast('Source marked as unreliable', 'info');
      } else if (action === 'verify-claim-yes') {
        update.verification.claim_attributed = true;
        showToast('Claim verified against source', 'success');
      } else if (action === 'verify-claim-no') {
        update.verification.claim_attributed = false;
        showToast('Claim not supported by source', 'info');
      } else if (action === 'unverify-source') {
        update.verification.source_reliable = null;
      } else if (action === 'unverify-claim') {
        update.verification.claim_attributed = null;
      }
      update.verification.verified_at = todayStr();
      saveState();
      renderUpdateWizard();
      return;
    }

    if (action === 'accept') {
      // Stamp verification metadata before applying
      if (update.verification) {
        update.verification.verified_at = todayStr();
        update.verification.verified_by = 'admin';
      }
      var result = applyUpdate(update, state.familiesData);
      if (result.ok) {
        update.status = 'accepted';
        showToast('Change accepted and applied to ' + update.family, 'success');
        if (state.callbacks && state.callbacks.onFamiliesDirty) state.callbacks.onFamiliesDirty();
      } else {
        showToast('Error: ' + result.error, 'error');
        return;
      }
    } else if (action === 'reject') {
      update.status = 'rejected';
      showToast('Change rejected', 'info');
    } else if (action === 'dismiss') {
      update.status = 'dismissed';
      showToast('Confirmation dismissed', 'info');
    } else if (action === 'undo') {
      var undone = undoUpdate(update, state.familiesData);
      if (undone) {
        update.status = 'pending';
        showToast('Change reverted for ' + update.family, 'info');
        if (state.callbacks && state.callbacks.onFamiliesDirty) state.callbacks.onFamiliesDirty();
      }
    } else if (action === 'reset') {
      // If was accepted, undo the data change first
      if (update.status === 'accepted' || update.status === 'applied') {
        var resetOk = undoUpdate(update, state.familiesData);
        if (!resetOk) {
          showToast('Warning: could not revert data change', 'error');
        }
        if (state.callbacks && state.callbacks.onFamiliesDirty) state.callbacks.onFamiliesDirty();
      }
      update.status = 'pending';
      showToast('Reset to pending', 'info');
    } else if (action === 'skip') {
      // Move to next without changing status
      if (state.currentIndex < updates.length - 1) {
        state.currentIndex++;
      }
      saveState();
      renderUpdateWizard();
      return;
    } else if (action === 'prev') {
      if (state.currentIndex > 0) state.currentIndex--;
      saveState();
      renderUpdateWizard();
      return;
    } else if (action === 'next') {
      if (state.currentIndex < updates.length - 1) state.currentIndex++;
      saveState();
      renderUpdateWizard();
      return;
    }

    // After accept/reject/dismiss, auto-advance to next pending if available
    if (action === 'accept' || action === 'reject' || action === 'dismiss') {
      var nextPending = findNextPending(state.currentIndex);
      if (nextPending !== -1) {
        state.currentIndex = nextPending;
      }
    }

    saveState();
    renderUpdateWizard();
    updateTabCounts();
  }

  function findNextPending(fromIndex) {
    var updates = state.queue.dataUpdates;
    // Look forward first
    for (var i = fromIndex + 1; i < updates.length; i++) {
      if (updates[i].status === 'pending') return i;
    }
    // Then look backward
    for (var j = 0; j < fromIndex; j++) {
      if (updates[j].status === 'pending') return j;
    }
    return -1;
  }

  // ─── Issues List ───

  function renderIssuesList() {
    var container = document.getElementById('rqIssuesPanel');
    if (!container) return;

    var issues = (state.queue && state.queue.structuralIssues) || [];
    if (issues.length === 0) {
      container.innerHTML =
        '<div class="admin-empty">' +
          '<div class="admin-empty__title">No structural issues</div>' +
          '<p class="admin-empty__text">No issues flagged by the agent.</p>' +
        '</div>';
      return;
    }

    var filtered = filterIssues(issues);

    var html = '';

    // Filter bar
    html += renderFilterBar(issues);

    // Count
    html += '<div class="rq-issues__count">Showing ' + filtered.length + ' of ' + issues.length + '</div>';

    // Issue cards
    if (filtered.length === 0) {
      html += '<div class="admin-empty" style="padding:24px;"><div class="admin-empty__title">No matching issues</div><p class="admin-empty__text">Try changing your filters.</p></div>';
    } else {
      filtered.forEach(function (issue, idx) {
        html += renderIssueCard(issue, issues.indexOf(issue));
      });
    }

    container.innerHTML = html;

    // Attach filter handlers
    container.querySelectorAll('.rq-filter__select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        state.issueFilters[sel.getAttribute('data-filter')] = sel.value;
        renderIssuesList();
      });
    });

    // Attach collapse/expand handlers
    container.querySelectorAll('.rq-issue__header').forEach(function (header) {
      header.addEventListener('click', function () {
        var card = header.closest('.rq-issue');
        card.classList.toggle('rq-issue--expanded');
      });
    });

    // Attach action handlers
    container.querySelectorAll('[data-issue-action]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var action = btn.getAttribute('data-issue-action');
        var idx = parseInt(btn.getAttribute('data-issue-idx'), 10);
        handleIssueAction(action, idx);
      });
    });
  }

  function filterIssues(issues) {
    var f = state.issueFilters;
    return issues.filter(function (issue) {
      if (f.severity && issue.severity !== f.severity) return false;
      if (f.family && (!issue.families || issue.families.indexOf(f.family) === -1)) return false;
      if (f.type && issue.type !== f.type) return false;
      if (f.status && issue.status !== f.status) return false;
      return true;
    });
  }

  function renderFilterBar(issues) {
    // Collect unique values
    var severities = {}, families = {}, types = {}, statuses = {};
    issues.forEach(function (i) {
      if (i.severity) severities[i.severity] = true;
      if (i.families) i.families.forEach(function (f) { families[f] = true; });
      if (i.type) types[i.type] = true;
      if (i.status) statuses[i.status] = true;
    });

    // Auto-clear stale filter values that no longer match any option
    var f = state.issueFilters;
    if (f.severity && !severities[f.severity]) f.severity = '';
    if (f.family && !families[f.family]) f.family = '';
    if (f.type && !types[f.type]) f.type = '';
    if (f.status && !statuses[f.status]) f.status = '';

    var html = '<div class="rq-filters">';
    html += renderFilterSelect('severity', 'Severity', Object.keys(severities).sort(), f.severity);
    html += renderFilterSelect('family', 'Family', Object.keys(families).sort(), f.family);
    html += renderFilterSelect('type', 'Type', Object.keys(types).sort(), f.type);
    html += renderFilterSelect('status', 'Status', Object.keys(statuses).sort(), f.status);
    html += '</div>';

    return html;
  }

  function renderFilterSelect(key, label, options, current) {
    var html = '<select class="rq-filter__select" data-filter="' + key + '">';
    html += '<option value="">' + label + ' (all)</option>';
    options.forEach(function (opt) {
      html += '<option value="' + esc(opt) + '"' + (current === opt ? ' selected' : '') + '>' + esc(opt) + '</option>';
    });
    html += '</select>';
    return html;
  }

  function renderIssueCard(issue, originalIndex) {
    var sevIcon = SEVERITY_ICONS[issue.severity] || '\u2022';
    var html = '';
    html += '<div class="rq-issue rq-issue--' + esc(issue.severity || 'info');
    if (issue.status === 'acknowledged') html += ' rq-issue--acknowledged';
    if (issue.status === 'resolved') html += ' rq-issue--resolved';
    html += '">';

    // Header (always visible)
    html += '<div class="rq-issue__header">';
    html += '<span class="rq-issue__icon">' + sevIcon + '</span>';
    html += '<span class="rq-issue__title">' + esc(issue.title || 'Untitled') + '</span>';
    html += '<span class="rq-card__badge rq-card__badge--' + esc(issue.severity || 'info') + '">' + esc(issue.severity || 'info') + '</span>';
    if (issue.families && issue.families.length > 0) {
      issue.families.forEach(function (f) {
        html += '<span class="rq-issue__family-tag">' + esc(f) + '</span>';
      });
    }
    html += '<span class="rq-issue__chevron">\u25BC</span>';
    html += '</div>';

    // Body (collapsed by default)
    html += '<div class="rq-issue__body">';
    html += '<div class="rq-issue__description">' + esc(issue.description || '') + '</div>';

    if (issue.action_required) {
      html += '<div class="rq-issue__action-box">';
      html += '<div class="rq-issue__action-label">Action Required</div>';
      html += '<div class="rq-issue__action-text">' + esc(issue.action_required) + '</div>';
      html += '</div>';
    }

    if (issue.source) {
      html += '<div class="rq-issue__source">' + esc(issue.source);
      if (issue.source_url) {
        html += ' <a class="rq-card__source-link" href="' + safeHref(issue.source_url) + '" target="_blank" rel="noopener">\u2197</a>';
      }
      html += '</div>';
    }

    // Issue actions
    html += '<div class="rq-issue__actions">';
    if (issue.status === 'pending') {
      html += '<button class="btn btn--xs btn--teal" data-issue-action="acknowledge" data-issue-idx="' + originalIndex + '">Acknowledge</button>';
      html += '<button class="btn btn--xs btn--outline" data-issue-action="resolve" data-issue-idx="' + originalIndex + '">Resolve</button>';
    } else {
      var label = issue.status === 'acknowledged' ? 'Acknowledged' : 'Resolved';
      html += '<span class="rq-issue__status-label rq-issue__status-label--' + issue.status + '">' + label + '</span>';
      html += '<button class="btn btn--xs btn--outline" data-issue-action="reopen" data-issue-idx="' + originalIndex + '">Reopen</button>';
    }
    html += '</div>';

    html += '</div>'; // body
    html += '</div>'; // issue

    return html;
  }

  function handleIssueAction(action, index) {
    if (!state.queue || !state.queue.structuralIssues || !state.queue.structuralIssues[index]) return;
    if (action === 'acknowledge') state.queue.structuralIssues[index].status = 'acknowledged';
    else if (action === 'resolve') state.queue.structuralIssues[index].status = 'resolved';
    else if (action === 'reopen') state.queue.structuralIssues[index].status = 'pending';
    saveState();
    renderIssuesList();
    updateTabCounts();
    var pastTense = action === 'reopen' ? 'reopened' : action + 'd';
    showToast('Issue ' + pastTense, 'info');
  }

  // ─── Tab Counts ───

  function updateTabCounts() {
    var updates = (state.queue && state.queue.dataUpdates) || [];
    var issues = (state.queue && state.queue.structuralIssues) || [];

    var tabQueueCount = document.getElementById('tabQueueCount');
    if (tabQueueCount) tabQueueCount.textContent = updates.length + issues.length;

    var tabUpdatesCount = document.getElementById('tabUpdatesCount');
    if (tabUpdatesCount) {
      var pending = updates.filter(function (u) { return u.status === 'pending'; }).length;
      tabUpdatesCount.textContent = pending > 0 ? pending : updates.length;
    }

    var tabIssuesCount = document.getElementById('tabIssuesCount');
    if (tabIssuesCount) {
      var issuePending = issues.filter(function (i) { return i.status === 'pending'; }).length;
      tabIssuesCount.textContent = issuePending > 0 ? issuePending : issues.length;
    }
  }

  // ─── State Persistence ───

  function saveState() {
    if (state.queue && state.callbacks && state.callbacks.onSaveQueue) {
      state.callbacks.onSaveQueue(state.queue);
    }
  }

  // ─── Main Init ───

  window.initReviewQueue = function (queue, familiesData, callbacks) {
    // Normalize schema
    var normalized = normalizeQueue(queue);
    state.queue = normalized;
    state.familiesData = familiesData;
    state.callbacks = callbacks || {};
    state.currentIndex = 0;
    state.issueFilters = { severity: '', family: '', type: '', status: '' };

    // Ensure statuses
    if (state.queue.dataUpdates) {
      state.queue.dataUpdates.forEach(function (u) {
        if (!u.status) u.status = 'pending';
      });
    }
    if (state.queue.structuralIssues) {
      state.queue.structuralIssues.forEach(function (i) {
        if (!i.status) i.status = 'pending';
      });
    }

    // Show meta
    var meta = state.queue.meta;
    var queueMeta = document.getElementById('rqMeta');
    if (queueMeta && meta) {
      queueMeta.style.display = 'flex';
      var metaSource = document.getElementById('rqMetaSource');
      var metaDate = document.getElementById('rqMetaDate');
      var metaFamilies = document.getElementById('rqMetaFamilies');
      if (metaSource) metaSource.textContent = meta.source || '-';
      if (metaDate) metaDate.textContent = meta.generated ? new Date(meta.generated).toLocaleString() : '-';
      if (metaFamilies) metaFamilies.textContent = (meta.families_affected || []).join(', ') || '-';
    }

    // Show sub-tabs
    var subTabs = document.getElementById('rqSubTabs');
    if (subTabs) subTabs.style.display = 'flex';

    // Render
    renderUpdateWizard();
    renderIssuesList();
    updateTabCounts();

    // Return the normalized queue for admin.js to store
    return state.queue;
  };

  // Allow admin.js to update familiesData reference if it changes
  window.updateReviewQueueFamilies = function (familiesData) {
    state.familiesData = familiesData;
  };

})();
