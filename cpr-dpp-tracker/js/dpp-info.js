// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
// DPP info popup singleton + buildHenDppInfo / buildEadDppInfo

(function () {
  var popup = document.createElement('div');
  popup.className = 'cpr-dpp-info-popup';
  document.body.appendChild(popup);

  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function hide() { popup.style.display = 'none'; popup._openBtn = null; }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.cpr-dpp-info-btn');
    if (btn) {
      e.stopPropagation();
      if (popup._openBtn === btn && popup.style.display === 'block') { hide(); return; }
      popup.innerHTML = btn.getAttribute('data-info');
      popup.style.display = 'block';
      popup._openBtn = btn;
      var r = btn.getBoundingClientRect();
      var pw = popup.offsetWidth, ph = popup.offsetHeight;
      var left = r.left + r.width / 2 - pw / 2;
      var top = r.bottom + 6;
      if (left < 8) left = 8;
      if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
      if (top + ph > window.innerHeight - 8) top = r.top - ph - 6;
      popup.style.left = left + 'px';
      popup.style.top = top + 'px';
    } else {
      if (popup.style.display === 'block') hide();
    }
  }, true);

  window.buildHenDppInfo = function (s, stageLabels) {
    var steps = [];
    steps.push('<div class="cpr-dpp-info-popup__title">DPP pathway \u2014 ' + esc(s.id || 'hEN') + '</div>');

    var stepNum = 1;
    if (s.current_cpr) {
      var cprLabel = s.current_cpr === '2024/3110' ? 'CPR 2024/3110' : 'CPR 305/2011';
      steps.push('<div class="cpr-dpp-info-popup__step"><b>' + stepNum + '. Current regime:</b> Cited under ' + cprLabel + '</div>');
      stepNum++;
    }

    if (s.sreq_cpr === '305/2011') {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>' + stepNum + '. Active SReq:</b> Under CPR 305/2011 \u2014 does not trigger DPP directly. A subsequent SReq under CPR 2024/3110 is needed.</div>');
      stepNum++;
    } else if (s.sreq_cpr === '2024/3110') {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>' + stepNum + '. Next SReq:</b> Under CPR 2024/3110 \u2014 resulting HTS will trigger DPP directly.</div>');
      stepNum++;
    } else if (s.sreq_table) {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>' + stepNum + '. Standardisation request:</b> ' + esc(s.sreq_table) + '</div>');
      stepNum++;
    }

    if (s.delivery) {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>' + stepNum + '. Delivery deadline:</b> <span class="cpr-dpp-date">' + esc(s.delivery) + '</span></div>');
      stepNum++;
    }
    if (s.pub_est) {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>' + stepNum + '. Publication est:</b> <span class="cpr-dpp-date">' + esc(s.pub_est) + '</span></div>');
      stepNum++;
    }
    if (s.mand_est) {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>' + stepNum + '. Mandatory est:</b> <span class="cpr-dpp-date">' + esc(s.mand_est) + '</span></div>');
      stepNum++;
    }
    if (s.dpp_est) {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>' + stepNum + '. DPP obligation est:</b> <span class="cpr-dpp-date">' + esc(s.dpp_est) + '</span></div>');
      stepNum++;
    }
    if (s.notes) {
      steps.push('<div class="cpr-dpp-info-popup__step" style="margin-top:6px;font-style:italic;color:#8CA9BF;font-size:0.62rem;">' + esc(s.notes) + '</div>');
    }
    return steps.join('');
  };

  window.buildEadDppInfo = function (s) {
    var steps = [];
    steps.push('<div class="cpr-dpp-info-popup__title">DPP pathway \u2014 ' + esc(s.id || 'EAD') + '</div>');
    var isOld = s.regime !== 'new';
    if (isOld) {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>1. Legacy EAD</b> under CPR 2011' + (s.cited ? ', cited in OJEU' : '') + '</div>');
      steps.push('<div class="cpr-dpp-info-popup__step"><b>2. Validity expires:</b> <span class="cpr-dpp-date cpr-dpp-date--ead">' + esc(s.expires || '9 Jan 2031') + '</span></div>');
      if (s.new_ead) {
        steps.push('<div class="cpr-dpp-info-popup__step"><b>3. New EAD replacement est:</b> <span class="cpr-dpp-date cpr-dpp-date--ead">' + esc(s.new_ead) + '</span></div>');
      }
    } else {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>1. New EAD</b> adopted under CPR 2024/3110</div>');
    }
    if (s.dpp_est) {
      steps.push('<div class="cpr-dpp-info-popup__step"><b>' + (isOld ? '4' : '2') + '. DPP obligation est:</b> <span class="cpr-dpp-date cpr-dpp-date--ead">' + esc(s.dpp_est) + '</span></div>');
    }
    if (s.notes) {
      steps.push('<div class="cpr-dpp-info-popup__step" style="margin-top:6px;font-style:italic;color:#8CA9BF;font-size:0.62rem;">' + esc(s.notes) + '</div>');
    }
    return steps.join('');
  };
})();
