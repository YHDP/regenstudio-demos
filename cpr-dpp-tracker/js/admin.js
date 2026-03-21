// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * CPR DPP Tracker — Admin Panel v2
 *
 * Pipeline-aware editor for families-v2.json and system-timeline.json.
 * Reads review-queue.json for agent update review.
 * All local — no third-party services.
 */

(function () {
  'use strict';

  // ─── Constants ───
  var ADMIN_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
  var LS_AUTH_KEY = 'cpr-admin-auth';
  var LS_CHAT_KEY = 'cpr-admin-chat';
  var LS_QUEUE_KEY = 'cpr-admin-queue';

  var STATUS_OPTIONS = ['not_started', 'in_progress', 'draft', 'adopted', 'complete', 'pending', 'unknown', 'phase_1_active'];
  var CERTAINTY_OPTIONS = ['green', 'yellow-green', 'amber', 'orange', 'red-orange', 'red', 'gray'];

  var CERTAINTY_LABELS = {
    'green': 'Confirmed',
    'yellow-green': 'Scheduled',
    'amber': 'Estimated',
    'orange': 'Moderate confidence',
    'red-orange': 'Speculative',
    'red': 'Speculative',
    'gray': 'Unknown'
  };

  var CONTENT_KEYS = ['about', 'standards_landscape', 'standards_development', 'sreq_analysis', 'dpp_outlook', 'stakeholder_notes', 'key_risks', 'sources_summary'];
  var CONTENT_LABELS = {
    'about': 'About this family',
    'standards_landscape': 'Standards landscape',
    'standards_development': 'Standards in development',
    'sreq_analysis': 'Standardisation request analysis',
    'dpp_outlook': 'DPP outlook',
    'stakeholder_notes': 'Stakeholder & domain notes',
    'key_risks': 'Key risks',
    'sources_summary': 'Sources'
  };

  // ─── State ───
  var familiesData = null;
  var systemData = null;
  var sourcesData = null;
  var queue = null;
  var dirtyFamilies = false;
  var dirtySystem = false;
  var selectedFamily = null;

  // ─── DOM refs ───
  var authGate = document.getElementById('authGate');
  var authInput = document.getElementById('authInput');
  var authBtn = document.getElementById('authBtn');
  var authError = document.getElementById('authError');
  var adminContent = document.getElementById('adminContent');
  var dataMeta = document.getElementById('dataMeta');

  var familySelect = document.getElementById('familySelect');
  var familyEditor = document.getElementById('familyEditor');
  var saveFamiliesBtn = document.getElementById('saveFamiliesBtn');

  var systemEditor = document.getElementById('systemEditor');
  var saveSystemBtn = document.getElementById('saveSystemBtn');

  var loadQueueBtn = document.getElementById('loadQueueBtn');
  var clearQueueBtn = document.getElementById('clearQueueBtn');

  var chatMessages = document.getElementById('chatMessages');
  var chatInput = document.getElementById('chatInput');
  var chatSendBtn = document.getElementById('chatSendBtn');

  // ─── Auth ───
  function sha256(str) {
    var encoder = new TextEncoder();
    var data = encoder.encode(str);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  function checkAuth() {
    var stored = localStorage.getItem(LS_AUTH_KEY);
    if (stored === 'true') showAdmin();
  }

  function authenticate() {
    var val = authInput.value.trim();
    if (!val) return;
    sha256(val).then(function (hash) {
      if (hash === ADMIN_HASH) {
        localStorage.setItem(LS_AUTH_KEY, 'true');
        authError.style.display = 'none';
        showAdmin();
      } else {
        authError.style.display = 'block';
        authInput.value = '';
        authInput.focus();
      }
    });
  }

  function showAdmin() {
    authGate.style.display = 'none';
    adminContent.style.display = 'block';
    loadAllData();
    loadSavedQueue();
    loadChat();
  }

  // ─── Data Loading ───
  function loadAllData() {
    dataMeta.textContent = 'Loading data...';
    Promise.all([
      fetch('data/families-v2.json').then(function (r) { return r.json(); }),
      fetch('data/system-timeline.json').then(function (r) { return r.json(); }),
      fetch('data/sources.json').then(function (r) { return r.json(); })
    ]).then(function (results) {
      familiesData = results[0];
      systemData = results[1];
      sourcesData = results[2];
      var count = familiesData.families ? familiesData.families.length : 0;
      var sysCount = systemData.nodes ? systemData.nodes.length : 0;
      dataMeta.textContent = count + ' families \u00b7 ' + sysCount + ' system nodes \u00b7 Updated ' + (familiesData.updated || '?');
      document.getElementById('tabFamiliesCount').textContent = count;
      document.getElementById('tabSystemCount').textContent = sysCount;
      populateFamilySelect();
      renderSystemEditor();

      // Expose data for dashboard module
      if (window.renderDataHealth) {
        window.renderDataHealth(familiesData, systemData, sourcesData);
      }
    }).catch(function (e) {
      dataMeta.textContent = 'Error loading data: ' + e.message;
    });
  }

  // ─── Tabs ───
  function initTabs() {
    var tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('admin-tab--active'); });
        tab.classList.add('admin-tab--active');
        document.querySelectorAll('.admin-panel').forEach(function (p) {
          p.classList.remove('admin-panel--active');
        });
        var panelId = 'panel' + target.charAt(0).toUpperCase() + target.slice(1);
        var panel = document.getElementById(panelId);
        if (panel) panel.classList.add('admin-panel--active');
      });
    });

    // Queue sub-tabs
    document.querySelectorAll('.admin-sub-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-qtab');
        document.querySelectorAll('.admin-sub-tab').forEach(function (t) { t.classList.remove('admin-sub-tab--active'); });
        tab.classList.add('admin-sub-tab--active');
        var updatesPanel = document.getElementById('rqUpdatesPanel');
        var issuesPanel = document.getElementById('rqIssuesPanel');
        if (updatesPanel) updatesPanel.style.display = target === 'updates' ? '' : 'none';
        if (issuesPanel) issuesPanel.style.display = target === 'issues' ? '' : 'none';
      });
    });
  }

  // ─── Family Select ───
  function populateFamilySelect() {
    if (!familiesData || !familiesData.families) return;
    familySelect.innerHTML = '<option value="">Select a family...</option>';
    familiesData.families.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.letter;
      opt.textContent = f.letter + ' \u2014 ' + (f.display_name || f.full_name);
      familySelect.appendChild(opt);
    });

    familySelect.addEventListener('change', function () {
      var letter = familySelect.value;
      if (letter) {
        selectedFamily = findFamily(letter);
        renderFamilyEditor();
      } else {
        selectedFamily = null;
        familyEditor.innerHTML = '';
      }
    });
  }

  function findFamily(letter) {
    if (!familiesData || !familiesData.families) return null;
    for (var i = 0; i < familiesData.families.length; i++) {
      if (familiesData.families[i].letter === letter) return familiesData.families[i];
    }
    return null;
  }

  // ─── Family Editor ───
  function renderFamilyEditor() {
    if (!selectedFamily) { familyEditor.innerHTML = ''; return; }
    var f = selectedFamily;

    var html = '';

    // Family header
    html += '<div class="fed-header">';
    html += '<img class="fed-header__icon" src="Images/' + esc(f.icon || 'default.svg') + '" alt="">';
    html += '<div>';
    html += '<h2 class="fed-header__title">' + esc(f.display_name || f.full_name) + '</h2>';
    html += '<p class="fed-header__meta">' + esc(f.family_label || '') + ' \u00b7 ' + esc(f.tc || '') + '</p>';
    html += '</div>';
    html += '</div>';

    // Convergence summary
    if (f.convergence) {
      html += '<div class="fed-convergence">';
      html += '<span class="fed-convergence__label">DPP Date:</span> ';
      html += '<span class="fed-convergence__value">' + esc(f.convergence.dpp_date || '?') + '</span>';
      html += ' <span class="fed-cert fed-cert--' + esc(f.convergence.dpp_certainty || 'gray') + '">' + esc(CERTAINTY_LABELS[f.convergence.dpp_certainty] || '?') + '</span>';
      html += ' \u00b7 Binding: <strong>' + esc(f.convergence.binding_constraint || '?') + '</strong>';
      html += '</div>';
    }

    // Pipelines
    var pipelineKeys = Object.keys(f.pipelines || {});
    pipelineKeys.forEach(function (pKey) {
      var p = f.pipelines[pKey];
      var isActive = (f.active_pipelines || []).indexOf(pKey) !== -1;
      var isFuture = (f.future_pipelines || []).indexOf(pKey) !== -1;

      html += '<div class="fed-pipeline">';
      html += '<div class="fed-pipeline__header">';
      html += '<span class="fed-pipeline__key">Pipeline ' + esc(pKey) + '</span>';
      html += '<span class="fed-pipeline__label">' + esc(p.label || '') + '</span>';
      if (isActive) html += '<span class="fed-pipeline__badge fed-pipeline__badge--active">Active</span>';
      if (isFuture) html += '<span class="fed-pipeline__badge fed-pipeline__badge--future">Future</span>';
      html += '<span class="fed-pipeline__dpp">' + (p.dpp_outcome ? 'DPP: Yes' : 'DPP: No') + '</span>';
      html += '</div>';

      // Nodes
      if (p.nodes && p.nodes.length > 0) {
        p.nodes.forEach(function (node, nIdx) {
          html += renderNodeCard(node, 'fam', f.letter + '.' + pKey + '.' + nIdx);
        });
      } else {
        html += '<p class="fed-empty">No nodes in this pipeline.</p>';
      }

      html += '</div>';
    });

    if (pipelineKeys.length === 0) {
      html += '<p class="fed-empty">No pipelines defined for this family.</p>';
    }

    // Content sections
    if (f.content) {
      html += '<div class="fed-content">';
      html += '<h3 class="fed-section-title">Content Sections</h3>';
      CONTENT_KEYS.forEach(function (key) {
        var val = f.content[key] || '';
        html += '<div class="fed-content__section">';
        html += '<label class="fed-content__label">' + esc(CONTENT_LABELS[key] || key) + '</label>';
        html += '<textarea class="fed-content__textarea" data-content-key="' + esc(key) + '" data-family="' + esc(f.letter) + '" rows="3">' + esc(val) + '</textarea>';
        html += '</div>';
      });
      html += '</div>';
    }

    familyEditor.innerHTML = html;

    // Attach node edit handlers
    familyEditor.querySelectorAll('.node-card__toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.node-card');
        card.classList.toggle('node-card--expanded');
      });
    });

    // Attach field change handlers
    familyEditor.querySelectorAll('[data-node-field]').forEach(function (input) {
      input.addEventListener('change', function () {
        handleNodeFieldChange(input);
      });
    });

    // Attach content change handlers
    familyEditor.querySelectorAll('.fed-content__textarea').forEach(function (ta) {
      ta.addEventListener('input', function () {
        var key = ta.getAttribute('data-content-key');
        var letter = ta.getAttribute('data-family');
        var fam = findFamily(letter);
        if (fam && fam.content) {
          fam.content[key] = ta.value;
          markFamiliesDirty();
        }
      });
    });
  }

  function renderNodeCard(node, scope, path) {
    var html = '';
    html += '<div class="node-card" data-node-path="' + esc(path) + '">';
    html += '<div class="node-card__header">';
    html += '<span class="node-card__cert node-card__cert--' + esc(node.certainty || 'gray') + '"></span>';
    html += '<span class="node-card__type">' + esc(node.type || '') + '</span>';
    html += '<span class="node-card__label">' + esc(node.label || '') + '</span>';
    html += '<span class="node-card__status">' + esc(node.status || '') + '</span>';
    if (node.date || node.estimated_date || node.target_date || node.statutory_deadline) {
      html += '<span class="node-card__date">' + esc(node.date || node.estimated_date || node.target_date || node.statutory_deadline || '') + '</span>';
    }
    html += '<button class="node-card__toggle" type="button" title="Edit node">\u270E</button>';
    html += '</div>';

    // Expandable editor
    html += '<div class="node-card__editor">';

    // Status
    html += '<div class="node-card__field">';
    html += '<label>Status</label>';
    html += '<select data-node-field="status" data-node-path="' + esc(path) + '" data-scope="' + scope + '">';
    STATUS_OPTIONS.forEach(function (s) {
      html += '<option value="' + s + '"' + (node.status === s ? ' selected' : '') + '>' + s + '</option>';
    });
    html += '</select>';
    html += '</div>';

    // Certainty
    html += '<div class="node-card__field">';
    html += '<label>Certainty</label>';
    html += '<select data-node-field="certainty" data-node-path="' + esc(path) + '" data-scope="' + scope + '">';
    CERTAINTY_OPTIONS.forEach(function (c) {
      html += '<option value="' + c + '"' + (node.certainty === c ? ' selected' : '') + '>' + c + ' \u2014 ' + (CERTAINTY_LABELS[c] || '') + '</option>';
    });
    html += '</select>';
    html += '</div>';

    // Date
    html += '<div class="node-card__field">';
    html += '<label>Date</label>';
    html += '<input type="text" data-node-field="date" data-node-path="' + esc(path) + '" data-scope="' + scope + '" value="' + esc(node.date || '') + '" placeholder="e.g. 2026-06 or ~2030">';
    html += '</div>';

    // Estimated date
    html += '<div class="node-card__field">';
    html += '<label>Estimated Date</label>';
    html += '<input type="text" data-node-field="estimated_date" data-node-path="' + esc(path) + '" data-scope="' + scope + '" value="' + esc(node.estimated_date || '') + '" placeholder="e.g. ~2030">';
    html += '</div>';

    // Detail
    html += '<div class="node-card__field node-card__field--full">';
    html += '<label>Detail</label>';
    html += '<textarea data-node-field="detail" data-node-path="' + esc(path) + '" data-scope="' + scope + '" rows="2">' + esc(node.detail || '') + '</textarea>';
    html += '</div>';

    // Sources
    html += '<div class="node-card__field">';
    html += '<label>Sources (comma-separated)</label>';
    html += '<input type="text" data-node-field="sources" data-node-path="' + esc(path) + '" data-scope="' + scope + '" value="' + esc((node.sources || []).join(', ')) + '" placeholder="S1, S40">';
    html += '</div>';

    html += '</div>'; // node-card__editor
    html += '</div>'; // node-card

    return html;
  }

  function handleNodeFieldChange(input) {
    var field = input.getAttribute('data-node-field');
    var path = input.getAttribute('data-node-path');
    var scope = input.getAttribute('data-scope');
    var value = input.value;

    // Parse path to find the node
    var node = resolveNodeByPath(path, scope);
    if (!node) return;

    // Apply change
    if (field === 'sources') {
      node.sources = value.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; });
    } else {
      node[field] = value;
    }

    // Update visual indicators in the card header
    var card = input.closest('.node-card');
    if (card) {
      var certDot = card.querySelector('.node-card__cert');
      if (certDot && field === 'certainty') {
        certDot.className = 'node-card__cert node-card__cert--' + value;
      }
      var statusEl = card.querySelector('.node-card__status');
      if (statusEl && field === 'status') {
        statusEl.textContent = value;
      }
    }

    if (scope === 'fam') markFamiliesDirty();
    if (scope === 'sys') markSystemDirty();
  }

  function resolveNodeByPath(path, scope) {
    if (scope === 'sys') {
      // Path format: "sys.N" where N is index into systemData.nodes
      var parts = path.split('.');
      var idx = parseInt(parts[1], 10);
      if (systemData && systemData.nodes && systemData.nodes[idx]) {
        return systemData.nodes[idx];
      }
      // Check cross-cutting
      if (parts[0] === 'cc') {
        var ccIdx = parseInt(parts[1], 10);
        if (systemData && systemData.cross_cutting && systemData.cross_cutting[ccIdx]) {
          return systemData.cross_cutting[ccIdx];
        }
      }
      return null;
    }

    // Scope === 'fam': path format "LETTER.PIPELINE_KEY.NODE_INDEX"
    var famParts = path.split('.');
    if (famParts.length < 3) return null;
    var letter = famParts[0];
    var pKey = famParts[1];
    var nIdx = parseInt(famParts[2], 10);
    var fam = findFamily(letter);
    if (!fam || !fam.pipelines || !fam.pipelines[pKey] || !fam.pipelines[pKey].nodes) return null;
    return fam.pipelines[pKey].nodes[nIdx] || null;
  }

  function markFamiliesDirty() {
    dirtyFamilies = true;
    saveFamiliesBtn.disabled = false;
    saveFamiliesBtn.textContent = 'Save Changes *';
  }

  function markSystemDirty() {
    dirtySystem = true;
    saveSystemBtn.disabled = false;
    saveSystemBtn.textContent = 'Save Changes *';
  }

  // ─── System Timeline Editor ───
  function renderSystemEditor() {
    if (!systemData) { systemEditor.innerHTML = '<p class="fed-empty">No system data loaded.</p>'; return; }

    var html = '';

    // Main nodes
    html += '<h3 class="fed-section-title">Main Timeline</h3>';
    if (systemData.nodes) {
      systemData.nodes.forEach(function (node, idx) {
        html += renderNodeCard(node, 'sys', 'sys.' + idx);
      });
    }

    // Cross-cutting
    if (systemData.cross_cutting && systemData.cross_cutting.length > 0) {
      html += '<h3 class="fed-section-title" style="margin-top:24px;">Cross-Cutting Instruments</h3>';
      systemData.cross_cutting.forEach(function (node, idx) {
        html += renderNodeCard(node, 'sys', 'cc.' + idx);
      });
    }

    systemEditor.innerHTML = html;

    // Attach handlers
    systemEditor.querySelectorAll('.node-card__toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.node-card');
        card.classList.toggle('node-card--expanded');
      });
    });

    systemEditor.querySelectorAll('[data-node-field]').forEach(function (input) {
      input.addEventListener('change', function () {
        handleNodeFieldChange(input);
      });
    });
  }

  // ─── Save ───
  function saveFamilies() {
    if (!familiesData) return;
    familiesData.updated = new Date().toISOString().split('T')[0];
    downloadJson(familiesData, 'families-v2.json');
    dirtyFamilies = false;
    saveFamiliesBtn.disabled = true;
    saveFamiliesBtn.textContent = 'Save Changes';
    addSystemMessage('Downloaded families-v2.json with edits. Replace the file in data/ and commit.');
  }

  function saveSystem() {
    if (!systemData) return;
    systemData.updated = new Date().toISOString().split('T')[0];
    downloadJson(systemData, 'system-timeline.json');
    dirtySystem = false;
    saveSystemBtn.disabled = true;
    saveSystemBtn.textContent = 'Save Changes';
    addSystemMessage('Downloaded system-timeline.json with edits. Replace the file in data/ and commit.');
  }

  function downloadJson(data, filename) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Export ───
  function exportFamilies() {
    if (!familiesData) { alert('Data not loaded yet.'); return; }
    downloadJson(familiesData, 'families-v2.json');
  }

  function exportSystem() {
    if (!systemData) { alert('Data not loaded yet.'); return; }
    downloadJson(systemData, 'system-timeline.json');
  }

  function exportSources() {
    if (!sourcesData) { alert('Data not loaded yet.'); return; }
    downloadJson(sourcesData, 'sources.json');
  }

  // ─── Review Queue ───
  function loadQueueFromServer() {
    loadQueueBtn.disabled = true;
    loadQueueBtn.textContent = 'Loading...';
    fetch('data/review-queue.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        setQueue(data);
        addSystemMessage('Loaded review-queue.json from data/ (' + ((data.dataUpdates || []).length) + ' updates, ' + ((data.structuralIssues || []).length) + ' issues).');
      })
      .catch(function (e) {
        alert('Could not load data/review-queue.json: ' + e.message + '\n\nUse "Upload file..." to load from disk instead.');
      })
      .then(function () {
        loadQueueBtn.disabled = false;
        loadQueueBtn.textContent = 'Load review-queue.json';
      });
  }

  function uploadQueueFromFile() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function () {
      if (input.files.length === 0) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          setQueue(data);
          addSystemMessage('Uploaded queue file: ' + input.files[0].name);
        } catch (e) {
          alert('Invalid JSON file: ' + e.message);
        }
      };
      reader.readAsText(input.files[0]);
    };
    input.click();
  }

  function setQueue(data) {
    queue = data;
    if (queue.dataUpdates) {
      queue.dataUpdates.forEach(function (u) {
        if (!u.status) u.status = 'pending';
      });
    }
    if (queue.structuralIssues) {
      queue.structuralIssues.forEach(function (i) {
        if (!i.status) i.status = 'pending';
      });
    }
    saveQueue();
    renderQueue();
  }

  function saveQueue() {
    if (queue) {
      localStorage.setItem(LS_QUEUE_KEY, JSON.stringify(queue));
    } else {
      localStorage.removeItem(LS_QUEUE_KEY);
    }
  }

  function loadSavedQueue() {
    var saved = localStorage.getItem(LS_QUEUE_KEY);
    if (saved) {
      try {
        queue = JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem(LS_QUEUE_KEY);
      }
    }
    renderQueue();
  }

  function renderQueue() {
    if (!queue) {
      var rqMeta = document.getElementById('rqMeta');
      var rqSubTabs = document.getElementById('rqSubTabs');
      var rqUpdatesPanel = document.getElementById('rqUpdatesPanel');
      var rqIssuesPanel = document.getElementById('rqIssuesPanel');
      if (rqMeta) rqMeta.style.display = 'none';
      if (rqSubTabs) rqSubTabs.style.display = 'none';
      if (rqUpdatesPanel) {
        rqUpdatesPanel.innerHTML =
          '<div class="admin-empty">' +
            '<div class="admin-empty__title">No queue loaded</div>' +
            '<p class="admin-empty__text">Use the CPR Expert agent to generate a review-queue.json file, then load it here.</p>' +
          '</div>';
      }
      if (rqIssuesPanel) rqIssuesPanel.innerHTML = '';
      document.getElementById('tabQueueCount').textContent = 0;
      return;
    }

    // Delegate to review-queue.js module
    if (window.initReviewQueue) {
      queue = window.initReviewQueue(queue, familiesData, {
        onSaveQueue: function (q) {
          queue = q;
          saveQueue();
        },
        onFamiliesDirty: function () {
          markFamiliesDirty();
        }
      });
    }
  }

  function clearQueue() {
    if (!confirm('Clear all items from the review queue?')) return;
    queue = null;
    localStorage.removeItem(LS_QUEUE_KEY);
    renderQueue();
  }

  // ─── Chat / Notes ───
  function loadChat() {
    var saved = localStorage.getItem(LS_CHAT_KEY);
    if (saved) {
      try {
        var messages = JSON.parse(saved);
        messages.forEach(function (msg) {
          appendChatMessage(msg.type, msg.text, msg.time, true);
        });
      } catch (e) { /* ignore */ }
    }
  }

  function saveChat() {
    var msgs = [];
    chatMessages.querySelectorAll('.chat-msg').forEach(function (el) {
      if (el.classList.contains('chat-msg--system') && el.dataset.persisted !== 'true') return;
      msgs.push({
        type: el.classList.contains('chat-msg--user') ? 'user' : (el.classList.contains('chat-msg--agent') ? 'agent' : 'system'),
        text: el.querySelector('.chat-msg__text') ? el.querySelector('.chat-msg__text').textContent : el.textContent.trim(),
        time: el.querySelector('.chat-msg__time') ? el.querySelector('.chat-msg__time').textContent : ''
      });
    });
    localStorage.setItem(LS_CHAT_KEY, JSON.stringify(msgs));
  }

  function sendChat() {
    var text = chatInput.value.trim();
    if (!text) return;
    var isAgent = text.indexOf('## ') === 0 || text.indexOf('### ') !== -1 || text.indexOf('**') !== -1;
    appendChatMessage(isAgent ? 'agent' : 'user', text);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    saveChat();
  }

  function addSystemMessage(text) {
    appendChatMessage('system', text, null, false, true);
    saveChat();
  }

  function appendChatMessage(type, text, time, skipScroll, persisted) {
    var msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg--' + type;
    if (persisted) msg.dataset.persisted = 'true';
    var timeStr = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msg.innerHTML =
      '<span class="chat-msg__text">' + esc(text) + '</span>' +
      '<span class="chat-msg__time">' + esc(timeStr) + '</span>';
    chatMessages.appendChild(msg);
    if (!skipScroll) chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ─── Utilities ───
  function esc(str) {
    if (str === null || str === undefined) return '';
    if (typeof str !== 'string') str = JSON.stringify(str);
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Init ───
  function init() {
    authBtn.addEventListener('click', authenticate);
    authInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') authenticate();
    });

    initTabs();

    // Family editor
    saveFamiliesBtn.addEventListener('click', saveFamilies);

    // System editor
    saveSystemBtn.addEventListener('click', saveSystem);

    // Queue
    loadQueueBtn.addEventListener('click', loadQueueFromServer);
    document.getElementById('uploadQueueBtn').addEventListener('click', uploadQueueFromFile);
    clearQueueBtn.addEventListener('click', clearQueue);

    // Chat
    chatSendBtn.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChat();
      }
    });
    chatInput.addEventListener('input', function () {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    // Export
    document.getElementById('exportFamiliesBtn').addEventListener('click', exportFamilies);
    document.getElementById('exportSystemBtn').addEventListener('click', exportSystem);
    document.getElementById('exportSourcesBtn').addEventListener('click', exportSources);

    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', function (e) {
      if (dirtyFamilies || dirtySystem) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    checkAuth();
  }

  init();
})();
