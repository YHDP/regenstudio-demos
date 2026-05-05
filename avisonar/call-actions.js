/**
 * AviSonar — Unified call action bar
 * Shared between species.html and compare.html
 * Actions: Verify, Reject (with reason), Change species, Submit to XC, Analyze
 */

// Rejection reason categories. `label` and `hk` (hotkey) are consumed by
// compare.html's inline reject menu; `key` and `icon` by call-actions.js.
const REJECT_REASONS = [
  { key: 'wrong_species', icon: '?',             label: 'Wrong species', hk: 'W' },
  { key: 'urban_noise',   icon: '\uD83D\uDE97',  label: 'Urban noise',   hk: 'U' },
  { key: 'low_quality',   icon: '\uD83D\uDD07',  label: 'Low quality',   hk: 'L' },
  { key: 'other',         icon: '\u270E',        label: 'Other',         hk: 'O' },
];

/**
 * Render the unified action bar HTML for a call.
 * @param {object} opts - {callId, audioFile, commonName, scientificName, status, showAnalyze}
 */
function renderCallActions(opts) {
  const { callId, audioFile, commonName, scientificName, status, showAnalyze } = opts;
  const isVerified = status === 'verified';
  const isRejected = status === 'rejected';

  let html = `<div class="ca-bar" data-call-id="${callId}">`;

  // Verify toggle
  html += `<button class="ca-btn ${isVerified ? 'ca-active-green' : ''}" onclick="caVerify(${callId}, this)" title="${t('action.verify')}">&#10003; ${t('action.verify')}</button>`;

  // Reject with dropdown
  html += `<div class="ca-reject-wrap">`;
  html += `<button class="ca-btn ${isRejected ? 'ca-active-red' : ''}" onclick="caShowRejectMenu(${callId}, this)" title="${t('action.reject')}">&#10007; ${t('action.reject')}</button>`;
  html += `</div>`;

  // Change species
  html += `<button class="ca-btn" onclick="caShowChangeSpecies(${callId}, this)" title="${t('action.change_species')}">&#9998; ${t('action.change_species')}</button>`;

  // Submit to XC
  if (audioFile) {
    html += `<button class="ca-btn" onclick="caSubmitXC('${encodeURIComponent(audioFile)}', '${escapeAttr(commonName)}', '${escapeAttr(scientificName)}')" title="${t('action.submit_xc')}">&#9757; XC</button>`;
  }

  // Analyze link (only on species page)
  if (showAnalyze && audioFile) {
    const url = `compare.html?file=${encodeURIComponent(audioFile)}&species=${encodeURIComponent(scientificName)}&common_name=${encodeURIComponent(commonName)}&call_id=${callId}`;
    html += `<a class="ca-btn" href="${url}" title="${t('compare.title')}" style="text-decoration:none;">&#128269;</a>`;
  }

  html += `</div>`;
  return html;
}

function escapeAttr(s) {
  return (s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// --- Verify ---
async function caVerify(callId, btn) {
  const bar = btn.closest('.ca-bar');
  const isActive = btn.classList.contains('ca-active-green');
  const newStatus = isActive ? 'unverified' : 'verified';
  const res = await fetch(`/api/calls/${callId}/verify`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
  if (res.ok) {
    caToast(newStatus === 'verified' ? t('toast.verified') : t('toast.status_reset'));
    btn.classList.toggle('ca-active-green');
    // Remove reject highlight if verifying
    const rejectBtn = bar.querySelector('.ca-active-red');
    if (rejectBtn && newStatus === 'verified') rejectBtn.classList.remove('ca-active-red');
    // Refresh species page if available
    if (typeof loadAll === 'function') setTimeout(loadAll, 400);
  }
}

// --- Reject with reason ---
function caShowRejectMenu(callId, btn) {
  // Remove any existing dropdown
  document.querySelectorAll('.ca-reject-dropdown').forEach(el => el.remove());

  const dropdown = document.createElement('div');
  dropdown.className = 'ca-reject-dropdown';

  REJECT_REASONS.forEach(r => {
    const item = document.createElement('button');
    item.className = 'ca-reject-item';
    item.innerHTML = `${r.icon} ${t('action.reject_' + r.key)}`;
    item.addEventListener('click', () => {
      dropdown.remove();
      if (r.key === 'other') {
        const reason = prompt(t('action.reject_reason'));
        if (reason !== null) caDoReject(callId, reason, btn);
      } else {
        caDoReject(callId, t('action.reject_' + r.key), btn);
      }
    });
    dropdown.appendChild(item);
  });

  // Position near the button
  btn.closest('.ca-reject-wrap').appendChild(dropdown);

  // Close on outside click
  setTimeout(() => {
    const close = (e) => { if (!dropdown.contains(e.target)) { dropdown.remove(); document.removeEventListener('click', close); } };
    document.addEventListener('click', close);
  }, 10);
}

async function caDoReject(callId, reason, btn) {
  const res = await fetch(`/api/calls/${callId}/verify`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
  });
  if (res.ok) {
    caToast(t('toast.rejected') + (reason ? ': ' + reason : ''));
    btn.classList.add('ca-active-red');
    const bar = btn.closest('.ca-bar');
    const verifyBtn = bar.querySelector('.ca-active-green');
    if (verifyBtn) verifyBtn.classList.remove('ca-active-green');
    if (typeof loadAll === 'function') setTimeout(loadAll, 400);
  }
}

// --- Change species ---
function caShowChangeSpecies(callId, btn) {
  const bar = btn.closest('.ca-bar');
  let input = bar.querySelector('.ca-change-input');
  if (input) { input.remove(); return; } // Toggle off

  const wrap = document.createElement('div');
  wrap.className = 'ca-change-input';
  wrap.innerHTML = `<input type="text" class="ca-input" placeholder="${t('action.change_species')}..." list="species-list-ca">
    <button class="ca-btn ca-save-btn" onclick="caDoChangeSpecies(${callId}, this)">&#10003;</button>
    <datalist id="species-list-ca"></datalist>`;

  bar.appendChild(wrap);
  const inp = wrap.querySelector('input');
  inp.focus();

  // Load species list if not already loaded
  if (!document.querySelector('#species-list-ca option')) {
    fetch('/api/analytics/lifelist').then(r => r.json()).then(list => {
      const dl = wrap.querySelector('datalist');
      for (const s of list || []) {
        const opt = document.createElement('option');
        opt.value = s.scientific_name;
        opt.textContent = `${s.common_name} (${s.scientific_name})`;
        dl.appendChild(opt);
      }
    }).catch(() => {});
  }

  // Enter key submits
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') caDoChangeSpecies(callId, wrap.querySelector('.ca-save-btn'));
  });
}

async function caDoChangeSpecies(callId, btn) {
  const wrap = btn.closest('.ca-change-input');
  const newSpecies = wrap.querySelector('input').value.trim();
  if (!newSpecies) return;

  // Reject with reason "wrong_species: [new species]"
  const res = await fetch(`/api/calls/${callId}/verify`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'rejected', rejection_reason: `Reassigned to: ${newSpecies}` }),
  });
  if (res.ok) {
    caToast(`${t('toast.rejected')} → ${newSpecies}`);
    wrap.remove();
    if (typeof loadAll === 'function') setTimeout(loadAll, 400);
  }
}

// --- Submit to Xeno-Canto ---
async function caSubmitXC(audioFileEncoded, commonName, scientificName) {
  const audioFile = decodeURIComponent(audioFileEncoded);
  const date = audioFile.match(/(\d{8})/)?.[1] || '';
  const dateFormatted = date ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}` : new Date().toISOString().slice(0, 10);

  let lat = '', lon = '';
  try {
    const locs = await fetch('/api/locations').then(r => r.json());
    if (locs && locs.length) { lat = locs[0].lat; lon = locs[0].lon; }
  } catch {}

  const clipText = [
    `Species: ${commonName} (${scientificName})`,
    `Date: ${dateFormatted}`,
    lat ? `Location: ${lat}, ${lon}` : '',
    `Detected with AviSonar (BirdNET-powered passive acoustic monitor)`,
  ].filter(Boolean).join('\n');

  try { await navigator.clipboard.writeText(clipText); }
  catch { const ta = document.createElement('textarea'); ta.value = clipText; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }

  caToast(t('compare.clipboard_copied') + '\n' + clipText, 5000);

  // Download WAV
  const safeName = commonName.replace(/[^a-zA-Z0-9]/g, '_');
  const downloadUrl = `/audio/${audioFile}`;
  const a = document.createElement('a');
  a.href = downloadUrl; a.download = `${safeName}_${dateFormatted}_AviSonar.wav`; a.click();

  setTimeout(() => window.open('https://xeno-canto.org/upload', '_blank'), 1000);
}

// --- Toast ---
function caToast(msg, duration = 2500) {
  let toast = document.getElementById('ca-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ca-toast';
    toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:var(--green);color:var(--bg);font-family:var(--font-mono);font-size:0.75rem;padding:0.6rem 1.2rem;border-radius:8px;z-index:100;box-shadow:0 4px 12px rgba(0,0,0,0.4);white-space:pre-line;display:none;max-width:90vw;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, duration);
}
