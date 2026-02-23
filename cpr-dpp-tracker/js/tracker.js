// CPR DPP Tracker — main app logic
// Fetches families.json, renders card grid, handles modal popups.

(function () {
  'use strict';

  // ---------- CONFIG ----------
  var OLD_CPR_SREQ_FAMILIES = { PCR: true, SMP: true };
  var STAGE_LABELS = ['Pending', 'Mandated', 'In dev', 'Delivered', 'Mandatory', 'DPP'];
  var EAD_STAGE_LABELS = ['None', 'Legacy EAD', 'In development', 'Adopted', 'Art 75 DA', 'DPP'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ---------- DOM refs ----------
  var grid = document.getElementById('trackerGrid');
  var modal = document.getElementById('cprModal');
  var modalTitle = modal.querySelector('.cpr-modal__title');
  var modalSubtitle = modal.querySelector('.cpr-modal__subtitle');
  var modalIcon = modal.querySelector('.cpr-modal__icon img');
  var modalTags = modal.querySelector('.cpr-modal__tags');
  var modalUpdated = modal.querySelector('.cpr-modal__updated');
  var modalIntro = modal.querySelector('.cpr-modal__intro');
  var modalDppBox = modal.querySelector('.cpr-modal__dpp-box');
  var modalStandards = modal.querySelector('.cpr-modal__standards');
  var modalStdsContent = modal.querySelector('.cpr-modal__stds-content');
  var modalAnnex = modal.querySelector('.cpr-modal__annex');
  var modalBody = modal.querySelector('.cpr-modal__body');
  var backdrop = modal.querySelector('.cpr-modal__backdrop');
  var closeBtn = modal.querySelector('.cpr-modal__close');
  var metaEl = document.getElementById('trackerMeta');

  // ---------- DATA ----------
  var families = [];

  // ---------- INIT ----------
  fetch('data/families.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      families = data.slice().sort(function (a, b) {
        return dppSortKey(a) - dppSortKey(b);
      });
      renderGrid();
      populateHeroIcons();
      if (metaEl) metaEl.textContent = families.length + ' product families \u00b7 Regulation (EU) 2024/3110';
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
  function renderGrid() {
    var html = '';
    families.forEach(function (fam, idx) {
      html += buildCard(fam, idx);
    });
    grid.innerHTML = html;
    enrichCards();
  }

  function buildCard(fam, idx) {
    var icon = fam.icon ? 'Images/' + fam.icon : '';
    var name = fam.display_name || fam['full-name'] || '';
    var familyLabel = fam.family_label || ('Annex VII #' + (fam.family || '') + ' \u00b7 ' + (fam.letter || ''));
    var tc = fam.tc || '';
    var h = '<div class="cpr-card" data-idx="' + idx + '">';
    if (icon) h += '<img src="' + icon + '" alt="' + esc(name) + '" loading="lazy">';
    h += '<span class="cpr-card__name">' + esc(name) + '</span>';
    h += '<span class="cpr-card__family">' + esc(familyLabel) + '</span>';
    if (tc) h += '<span class="cpr-card__tc">' + esc(tc) + '</span>';
    h += '</div>';
    return h;
  }

  function enrichCards() {
    var cards = grid.querySelectorAll('.cpr-card');
    cards.forEach(function (card) {
      var idx = parseInt(card.getAttribute('data-idx'), 10);
      var fam = families[idx];
      if (!fam) return;

      var ms = fam.milestones;
      var sreq = fam.sreq || '';
      var dpp = fam['dpp-est'] || '';
      var range = fam['dpp-range'];

      // Status pill
      if (ms) {
        var statusInfo = computeStatus(ms, sreq);
        if (statusInfo.text) {
          var pill = document.createElement('span');
          pill.className = 'cpr-card__status cpr-card__status--' + statusInfo.cls;
          pill.textContent = statusInfo.text;
          card.appendChild(pill);
        }
      }

      // DPP date label
      var dppLabel = (range && range.envelope) ? range.envelope : dpp;
      if (dppLabel) {
        var dppEl = document.createElement('span');
        dppEl.className = 'cpr-card__dpp';
        dppEl.textContent = 'DPP ' + dppLabel;
        card.appendChild(dppEl);
      }
    });
  }

  // ---------- STATUS COMPUTATION ----------
  function isDone(v) { return v === 'done' || v === 'finished' || v === 'adopted'; }

  function computeStatus(ms, sreq) {
    var sreqAdopted = sreq === 'Adopted';
    var msC = {};
    ['i', 'iii', 'sreq', 'delivery', 'mandatory'].forEach(function (k) { msC[k] = ms[k] || ''; });
    if (sreqAdopted) msC.sreq = 'done';

    var sreqObj = typeof ms.sreq === 'object' && ms.sreq;
    var deliveryObj = typeof ms.delivery === 'object' && ms.delivery;

    if (isDone(msC.mandatory))                             return { text: 'Standard mandatory', cls: 'green' };
    if (isDone(msC.delivery))                              return { text: 'Standards delivered', cls: 'green' };
    if (deliveryObj && deliveryObj.status === 'overdue')    return { text: 'Delivery overdue', cls: 'orange' };
    if (isDone(msC.sreq))                                  return { text: 'Standardisation request adopted', cls: 'green' };
    if (sreqObj && sreqObj.status === 'adopted')            return { text: 'Standardisation request adopted', cls: 'green' };
    if (sreqObj && sreqObj.status === 'draft')              return { text: 'Standardisation request draft published', cls: 'teal' };
    if (isDone(msC.iii))                                   return { text: 'Characteristics defined', cls: 'green' };
    if (msC.iii === 'ongoing')                             return { text: 'Defining characteristics', cls: 'teal' };
    if (isDone(msC.i))                                     return { text: 'Product scope defined', cls: 'green' };
    if (msC.i === 'ongoing')                               return { text: 'Defining product scope', cls: 'teal' };
    if (msC.i)                                             return { text: 'Scope planned', cls: 'blue' };
    if (msC.iii)                                           return { text: 'Characteristics planned', cls: 'blue' };
    return { text: 'Not started', cls: 'grey' };
  }

  // ---------- DPP SORT KEY ----------
  function dppSortKey(fam) {
    var str = (fam['dpp-range'] && fam['dpp-range'].envelope) || fam['dpp-est'] || '';
    if (!str || str === 'TBD') return 9999;
    var m = str.match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 9999;
  }

  // ---------- STAGE COMPUTATION ----------
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

  // ---------- MODAL ----------
  function openModal(fam) {
    var letter = fam.letter || '';
    var family = fam.family || '';
    var tc = fam.tc || '';
    var sreq = fam.sreq || '';
    var info = fam.info || '';
    var dppEst = fam['dpp-est'] || '';
    var ms = fam.milestones;
    var stdsData = fam.standards;
    var rangeData = fam['dpp-range'];
    var icon = fam.icon ? 'Images/' + fam.icon : '';

    // Header
    if (icon) { modalIcon.src = icon; modalIcon.alt = fam['full-name'] || ''; }
    modalTitle.textContent = fam['full-name'] || fam.display_name || '';
    var sub = [];
    if (letter) sub.push(letter);
    if (family) sub.push('Annex VII #' + family);
    if (tc) sub.push(tc);
    modalSubtitle.textContent = sub.join(' \u00b7 ');

    // Updated date
    var cardUpdated = fam.updated || '';
    if (cardUpdated) {
      var ud = new Date(cardUpdated + 'T00:00:00');
      modalUpdated.textContent = 'Last updated: ' + ud.getDate() + ' ' + MONTHS[ud.getMonth()] + ' ' + ud.getFullYear();
      modalUpdated.style.display = '';
    } else {
      modalUpdated.textContent = '';
      modalUpdated.style.display = 'none';
    }

    // Reconcile milestones
    if (ms) {
      var sreqOrig = ms.sreq;
      if (sreq === 'Adopted') ms.sreq = 'done';
    }

    // Status tag
    var tags = '';
    if (ms) {
      var statusInfo = computeStatus(ms, sreq);
      if (statusInfo.text) {
        tags = '<span class="cpr-modal__tag cpr-modal__tag--' + statusInfo.cls + '">' + statusInfo.text + '</span>';
      }
    }
    modalTags.innerHTML = tags;

    // Standards section
    renderStandards(fam, ms, stdsData, rangeData, letter);

    // Info sections
    var sections = categoriseInfo(info);

    if (sections.intro.length) {
      modalIntro.innerHTML = sections.intro.join('');
      modalIntro.style.display = '';
    } else {
      modalIntro.innerHTML = '';
      modalIntro.style.display = 'none';
    }

    // DPP box
    var dppDate = (rangeData && rangeData.envelope) ? rangeData.envelope : dppEst;
    var hasDppText = sections.dpp.length > 0;
    if (dppDate || hasDppText) {
      var dppBoxHtml = '<div class="cpr-dpp-box__title">DPP outlook</div>';
      if (dppDate) dppBoxHtml += '<div class="cpr-dpp-box__date">DPP ' + dppDate + '</div>';
      if (hasDppText) {
        var dppHtml = sections.dpp.join('');
        dppHtml = dppHtml.replace(/<strong>[^<]*DPP outlook[^<]*:\s*<\/strong>/i, '');
        dppBoxHtml += dppHtml;
      }
      modalDppBox.innerHTML = dppBoxHtml;
      modalDppBox.style.display = '';
    } else {
      modalDppBox.innerHTML = '';
      modalDppBox.style.display = 'none';
    }

    // Annex
    if (sections.annex.length) {
      var annexHtml = '<div class="cpr-modal__annex-content">';
      sections.annex.forEach(function (pHtml) {
        var tmp = document.createElement('div');
        tmp.innerHTML = pHtml;
        var p = tmp.querySelector('p');
        if (p) {
          var s = p.querySelector('strong');
          if (s) {
            var label = s.textContent.replace(/:$/, '').trim();
            annexHtml += '<div class="cpr-annex__heading">' + label + '</div>';
            s.parentNode.removeChild(s);
            p.innerHTML = p.innerHTML.replace(/^\s*:\s*/, '').replace(/^\s*/, '');
          }
        }
        annexHtml += '<p>' + (p ? p.innerHTML : pHtml) + '</p>';
      });
      annexHtml += '</div>';
      modalAnnex.innerHTML = annexHtml;
      modalAnnex.style.display = '';
    } else {
      modalAnnex.innerHTML = '';
      modalAnnex.style.display = 'none';
    }

    // Disclaimer
    modalBody.innerHTML = '<p style="font-size:0.72rem;line-height:1.5;color:var(--color-text-secondary,#64748b);background:var(--color-bg-card,#f8fafc);border-left:3px solid var(--color-border,#e2e8f0);padding:10px 14px;border-radius:0 8px 8px 0;margin-top:14px;"><strong>Disclaimer:</strong> The CPR regulatory landscape is dynamic and at times opaque. The information shown is for informational purposes only and should not be considered legal advice.</p>';

    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
  }

  // ---------- STANDARDS RENDERING ----------
  function renderStandards(fam, ms, stdsData, rangeData, cardLetter) {
    if (stdsData && stdsData.standards && stdsData.standards.length > 0) {
      modalStandards.style.display = '';
      var sh = '';

      var henStds = stdsData.standards.filter(function (s) { return s.type === 'hEN'; });
      var eadStds = stdsData.standards.filter(function (s) { return s.type === 'EAD'; });

      // Enrich hEN standards
      henStds.forEach(function (s) {
        s._stage = computeHenStage(s);
        s.current_cpr = (s.revision === 'CPR 2011') ? '305/2011' : '2024/3110';
        s.sreq_cpr = OLD_CPR_SREQ_FAMILIES[cardLetter] ? '305/2011' : '2024/3110';
      });

      // hEN route
      if (henStds.length > 0) {
        sh += '<div style="margin-top:4px;font-size:0.62rem;font-weight:700;color:#006B7F;text-transform:uppercase;letter-spacing:0.06em;">hEN Route</div>';
        sh += buildHenTimeline(henStds, ms);
        sh += buildHenTable(henStds);
        if (stdsData.summary && stdsData.summary.hen_note) {
          sh += '<div style="font-size:0.58rem;color:#8CA9BF;margin-top:4px;line-height:1.4;font-style:italic;">' + stdsData.summary.hen_note + '</div>';
        }
      }

      // EAD route
      if (eadStds.length > 0) {
        eadStds.forEach(function (s) { s._eadStage = computeEadStage(s); });
        sh += '<div style="margin-top:18px;font-size:0.62rem;font-weight:700;color:#006B3D;text-transform:uppercase;letter-spacing:0.06em;">EAD Route</div>';
        sh += buildEadTimeline(eadStds);
        sh += buildEadTable(eadStds);
        var hasOldWithDpp = eadStds.some(function (s) { return s.regime === 'old' && s.dpp_est; });
        if (hasOldWithDpp) {
          sh += '<div style="font-size:0.58rem;color:#8CA9BF;margin-top:4px;line-height:1.4;font-style:italic;">* DPP only applies once a new EAD is adopted under CPR 2024/3110. Estimate assumes timely replacement.</div>';
        }
      }

      // Summary note
      if (stdsData.summary) {
        var sm = stdsData.summary;
        var note = '';
        if (sm.completeness === 'partial') {
          var total = (sm.hen_count || 0) + (sm.ead_count || 0);
          var listed = (sm.hen_listed || 0) + (sm.ead_listed || 0);
          note = listed + ' of ' + total + ' standards shown \u2014 ' + sm.source;
        } else if (sm.completeness === 'full') {
          note = 'All standards shown \u2014 ' + sm.source;
        }
        if (note) sh += '<div style="font-size:0.62rem;color:#8CA9BF;margin-top:8px;line-height:1.4;">' + note + '</div>';
      }

      modalStdsContent.innerHTML = sh;
    } else if (rangeData && rangeData.envelope && rangeData.envelope !== 'TBD') {
      modalStandards.style.display = '';
      var ph = '<div class="cpr-modal__stds-placeholder">';
      if (rangeData.hen_count || rangeData.ead_count) {
        var parts = [];
        if (rangeData.hen_count) parts.push(rangeData.hen_count + ' harmonised standard' + (rangeData.hen_count > 1 ? 's' : ''));
        if (rangeData.ead_count) parts.push(rangeData.ead_count + ' EAD' + (rangeData.ead_count > 1 ? 's' : ''));
        ph += parts.join(' + ') + ' identified \u2014 detailed per-standard analysis in progress.';
      } else {
        ph += 'Standard identification in progress.';
      }
      ph += '<br><strong>DPP envelope: ' + rangeData.envelope + '</strong></div>';
      modalStdsContent.innerHTML = ph;
    } else {
      modalStandards.style.display = 'none';
      modalStdsContent.innerHTML = '';
    }
  }

  function buildHenTimeline(henStds, ms) {
    var totalHen = henStds.length;
    var stageCounts = [0, 0, 0, 0, 0];
    var highestStage = 0;
    henStds.forEach(function (s) {
      for (var i = 0; i < 5; i++) {
        if (s._stage >= (i + 1)) stageCounts[i]++;
      }
      if (s._stage > highestStage) highestStage = s._stage;
    });

    var familySteps = [
      { key: 'i', label: 'Product scope' },
      { key: 'iii', label: 'Essential chars' },
      { key: 'sreq', label: 'SReq' }
    ];
    var stdSteps = [
      { num: 2, label: 'In dev' },
      { num: 3, label: 'Delivered' },
      { num: 4, label: 'Mandatory' },
      { num: 5, label: 'DPP' }
    ];

    var sh = '<div class="cpr-milestones cpr-milestones--7" style="margin:8px 0 12px;">';

    familySteps.forEach(function (step) {
      var raw = ms ? ms[step.key] : null;
      var val = raw || '';
      var isObj = typeof raw === 'object' && raw !== null;
      var mStatus = isObj ? (raw.status || '') : '';
      if (isObj) val = mStatus;

      var mIsDone = val === 'done' || val === 'finished' || val === 'adopted';
      var mIsDraft = val === 'draft';
      var mIsOngoing = val === 'ongoing';
      var dotCl, ic;
      if (mIsDone) { dotCl = 'cpr-milestone__dot--done'; ic = '\u2713'; }
      else if (mIsDraft || mIsOngoing) { dotCl = 'cpr-milestone__dot--active'; ic = '\u2022'; }
      else { dotCl = 'cpr-milestone__dot--future'; ic = ''; }

      sh += '<div class="cpr-milestone">';
      sh += '<div class="cpr-milestone__dot ' + dotCl + '">' + ic + '</div>';
      sh += '<div class="cpr-milestone__label">' + step.label + '</div>';
      sh += '</div>';
    });

    stdSteps.forEach(function (st) {
      var count = stageCounts[st.num - 1];
      var isReached = count > 0;
      var isHighest = st.num === highestStage;
      var dotCl, dateCl, ic;
      if (st.num < highestStage && isReached) {
        dotCl = 'cpr-milestone__dot--done'; dateCl = 'cpr-milestone__date--done'; ic = '\u2713';
      } else if (isHighest && isReached) {
        dotCl = 'cpr-milestone__dot--active'; dateCl = 'cpr-milestone__date--draft'; ic = st.num;
      } else {
        dotCl = 'cpr-milestone__dot--future'; dateCl = ''; ic = st.num;
      }
      sh += '<div class="cpr-milestone">';
      sh += '<div class="cpr-milestone__dot ' + dotCl + '">' + ic + '</div>';
      sh += '<div class="cpr-milestone__label">' + st.label + '</div>';
      sh += '<div class="cpr-milestone__date ' + dateCl + '">' + count + ' of ' + totalHen + '</div>';
      sh += '</div>';
    });

    sh += '</div>';
    return sh;
  }

  function buildHenTable(henStds) {
    var sh = '<div class="cpr-modal__stds-table-wrap"><table class="cpr-modal__stds-table"><thead><tr>';
    sh += '<th>Standard</th><th>Name</th><th>TC/WG</th><th>Stage</th><th>Delivery</th><th>DPP est</th>';
    sh += '</tr></thead><tbody>';
    henStds.forEach(function (s) {
      var stg = s._stage;
      var dots = '<span class="cpr-stage-dots" title="' + STAGE_LABELS[stg] + '">';
      for (var d = 1; d <= 5; d++) {
        if (d <= stg && stg >= 4) dots += '<span class="cpr-stage-dots__dot cpr-stage-dots__dot--done-green"></span>';
        else if (d <= stg) dots += '<span class="cpr-stage-dots__dot cpr-stage-dots__dot--done"></span>';
        else dots += '<span class="cpr-stage-dots__dot"></span>';
      }
      dots += '</span>';
      var tcWg = s.tc_wg || '\u2014';
      var dppCell = '<span style="font-weight:600;color:#009BBB;">' + (s.dpp_est || '\u2014') + '</span>';
      var infoHtml = buildHenDppInfo(s, STAGE_LABELS).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
      dppCell += ' <span class="cpr-dpp-info-btn" data-info="' + infoHtml + '" title="DPP reasoning">i</span>';
      sh += '<tr>';
      sh += '<td>' + (s.id || '') + '</td>';
      sh += '<td style="font-size:0.58rem;color:#3A5A6A;">' + (s.name || '\u2014') + '</td>';
      sh += '<td style="font-size:0.58rem;color:#5A7080;">' + tcWg + '</td>';
      sh += '<td>' + dots + ' <span style="font-size:0.58rem;color:#5A7080;margin-left:2px;">' + STAGE_LABELS[stg] + '</span></td>';
      sh += '<td>' + (s.delivery ? s.delivery.replace(/-/g, '\u2011') : '\u2014') + '</td>';
      sh += '<td>' + dppCell + '</td>';
      sh += '</tr>';
    });
    sh += '</tbody></table></div>';
    return sh;
  }

  function buildEadTimeline(eadStds) {
    var totalEad = eadStds.length;
    var eadStageCounts = [0, 0, 0, 0, 0];
    var highestEadStage = 0;
    eadStds.forEach(function (s) {
      for (var i = 0; i < 5; i++) {
        if (s._eadStage >= (i + 1)) eadStageCounts[i]++;
      }
      if (s._eadStage > highestEadStage) highestEadStage = s._eadStage;
    });

    var eadSummaryStages = [
      { num: 1, label: 'Legacy EAD' },
      { num: 2, label: 'In development' },
      { num: 3, label: 'Adopted' },
      { num: 4, label: 'Art 75 DA' },
      { num: 5, label: 'DPP' }
    ];

    var sh = '<div class="cpr-milestones" style="margin:8px 0 12px;">';
    eadSummaryStages.forEach(function (st) {
      var count = eadStageCounts[st.num - 1];
      var isReached = count > 0;
      var isHighest = st.num === highestEadStage;
      var dotCl, dateCl, ic;
      if (st.num < highestEadStage && isReached) {
        dotCl = 'cpr-milestone__dot--done'; dateCl = 'cpr-milestone__date--done'; ic = st.num;
      } else if (isHighest && isReached) {
        dotCl = 'cpr-milestone__dot--active'; dateCl = 'cpr-milestone__date--draft'; ic = st.num;
      } else {
        dotCl = 'cpr-milestone__dot--future'; dateCl = ''; ic = st.num;
      }
      sh += '<div class="cpr-milestone">';
      sh += '<div class="cpr-milestone__dot ' + dotCl + '">' + ic + '</div>';
      sh += '<div class="cpr-milestone__label">' + st.label + '</div>';
      sh += '<div class="cpr-milestone__date ' + dateCl + '">' + count + ' of ' + totalEad + '</div>';
      sh += '</div>';
    });
    sh += '</div>';
    return sh;
  }

  function buildEadTable(eadStds) {
    var sh = '<div class="cpr-modal__stds-table-wrap"><table class="cpr-modal__stds-table"><thead><tr>';
    sh += '<th>EAD</th><th>Name</th><th>Pipeline</th><th>AVCP</th><th>Validity</th><th>DPP Est</th>';
    sh += '</tr></thead><tbody>';
    eadStds.forEach(function (s) {
      var isOld = s.regime !== 'new';
      var eadStg = s._eadStage;
      var dots = '<span class="cpr-stage-dots" title="' + EAD_STAGE_LABELS[eadStg] + '">';
      for (var d = 1; d <= 5; d++) {
        if (d === 1 && !isOld) dots += '<span class="cpr-stage-dots__dot"></span>';
        else if (d <= eadStg) dots += '<span class="cpr-stage-dots__dot cpr-stage-dots__dot--done-green"></span>';
        else dots += '<span class="cpr-stage-dots__dot"></span>';
      }
      dots += '</span>';

      var validity = isOld ? (s.expires || '9 Jan 2031') : 'New CPR';
      var dppCell = s.dpp_est || '\u2014';
      var dppNote = (isOld && s.dpp_est) ? ' *' : '';
      var eadInfoHtml = buildEadDppInfo(s).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
      var eadInfoBtn = ' <span class="cpr-dpp-info-btn cpr-dpp-info-btn--ead" data-info="' + eadInfoHtml + '" title="DPP reasoning">i</span>';

      sh += '<tr>';
      sh += '<td>' + (s.id || '') + '</td>';
      sh += '<td>' + (s.name || '') + '</td>';
      sh += '<td>' + dots + ' <span style="font-size:0.58rem;color:#5A7080;margin-left:2px;">' + EAD_STAGE_LABELS[eadStg] + '</span></td>';
      sh += '<td>' + (s.avcp || '\u2014') + '</td>';
      sh += '<td>' + validity + '</td>';
      sh += '<td style="font-weight:600;color:#00914B;">' + dppCell + dppNote + eadInfoBtn + '</td>';
      sh += '</tr>';
    });
    sh += '</tbody></table></div>';
    return sh;
  }

  // ---------- INFO CATEGORISATION ----------
  var introKeys = ['about this family', 'scope', 'product types', 'technical committee', 'technical body'];
  var dppKeys = ['dpp outlook'];

  function categoriseInfo(html) {
    if (!html) return { intro: [], dpp: [], annex: [] };
    var div = document.createElement('div');
    div.innerHTML = html;
    var paras = div.querySelectorAll('p');
    var result = { intro: [], dpp: [], annex: [] };
    paras.forEach(function (p) {
      var strong = p.querySelector('strong');
      var heading = strong ? strong.textContent.toLowerCase().replace(/:$/, '').trim() : '';
      var matched = false;
      for (var i = 0; i < dppKeys.length; i++) {
        if (heading.indexOf(dppKeys[i]) !== -1) { result.dpp.push(p.outerHTML); matched = true; break; }
      }
      if (!matched) {
        for (var j = 0; j < introKeys.length; j++) {
          if (heading.indexOf(introKeys[j]) === 0) { result.intro.push(p.outerHTML); matched = true; break; }
        }
      }
      if (!matched && p.textContent.trim()) result.annex.push(p.outerHTML);
    });
    return result;
  }

  // ---------- EVENTS ----------
  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.cpr-card');
    if (!card) return;
    var idx = parseInt(card.getAttribute('data-idx'), 10);
    var fam = families[idx];
    if (fam) openModal(fam);
  });

  function closeModal() { modal.setAttribute('aria-hidden', 'true'); }
  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });

  // ---------- UTIL ----------
  function esc(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }
})();
