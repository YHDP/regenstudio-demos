import { navigate } from '../app.js';
import { setState } from '../data/state.js';
import { getAllCredentials, getPermitCredentials, getPIDCredential } from '../data/credentials.js';
import { getVerifiersForCredential } from '../data/verifiers.js';
import { createBottomNav } from '../components/bottom-nav.js';
import { createAppBar } from '../components/app-bar.js';
import { createCredentialCard } from '../components/credential-card.js';
import { t } from '../data/translations.js';
import { td } from '../data/data-i18n.js';

export function renderShareSelect(container) {
  container.classList.add('dashboard-screen');

  const content = document.createElement('div');
  content.className = 'screen-content';
  content.innerHTML = `
    <div class="dashboard-header">
      <h2 class="dashboard-title">${t('share.title')}</h2>
      <p style="margin-top:4px;font-size:13px;color:var(--color-text-secondary)">${t('share.chooseCard')}</p>
    </div>
    <div class="share-methods" id="share-methods"></div>
    <div class="share-section-label" id="cred-label"></div>
    <div class="share-cred-list" id="share-cred-list"></div>
  `;

  const methods = content.querySelector('#share-methods');

  // QR scan option
  methods.innerHTML = `
    <div style="padding:0 24px 8px;">
      <button type="button" class="btn btn-primary btn-full" id="share-qr-scan">
        <span class="material-icons">qr_code_scanner</span>
        ${t('share.scanQR')}
      </button>
    </div>
    <div style="padding:8px 24px 16px;display:flex;align-items:center;gap:12px;">
      <div style="flex:1;height:1px;background:var(--color-border)"></div>
      <span style="font-size:13px;color:var(--color-text-secondary)">${t('share.orChooseCard')}</span>
      <div style="flex:1;height:1px;background:var(--color-border)"></div>
    </div>
  `;

  methods.querySelector('#share-qr-scan').addEventListener('click', () => {
    navigate('qr-scanner');
  });

  // Credential list
  const list = content.querySelector('#share-cred-list');
  list.style.cssText = 'padding:0 24px;padding-bottom:120px;display:flex;flex-direction:column;gap:12px;';

  // Vergunning credentials
  getPermitCredentials().forEach(cred => {
    const card = createShareCard(cred);
    card.addEventListener('click', () => {
      setState({ selectedCredential: cred.id });
      showVerifierPicker(container, cred);
    });
    list.appendChild(card);
  });

  // PID
  const pid = getPIDCredential();
  if (pid) {
    const pidCard = createShareCard(pid);
    pidCard.addEventListener('click', () => {
      setState({ selectedCredential: pid.id });
      showVerifierPicker(container, pid);
    });
    list.appendChild(pidCard);
  }

  container.appendChild(content);
  container.appendChild(createBottomNav('share'));
}

function createShareCard(cred) {
  const card = document.createElement('div');
  card.className = 'verifier-card';
  card.style.cursor = 'pointer';
  card.innerHTML = `
    <div class="verifier-icon" style="background:${cred.color};color:#fff;border-radius:12px;">
      <span class="material-icons">${cred.icon}</span>
    </div>
    <div class="verifier-info">
      <div class="verifier-name">${td(cred.title)}</div>
      <div class="verifier-desc">${td(cred.issuer)}</div>
    </div>
    <span class="material-icons" style="color:var(--color-text-secondary)">chevron_right</span>
  `;
  return card;
}

function showVerifierPicker(parentContainer, cred) {
  const allVerifiers = getVerifiersForCredential(cred.id);

  const overlay = document.createElement('div');
  overlay.className = 'screen active slide-up';
  overlay.style.background = 'var(--color-surface)';
  overlay.style.zIndex = '60';

  overlay.appendChild(createAppBar(t('share.selectVerifier'), () => {
    overlay.classList.remove('slide-up');
    overlay.classList.add('slide-down');
    setTimeout(() => overlay.remove(), 400);
  }));

  const body = document.createElement('div');
  body.style.cssText = 'padding-top:calc(var(--app-bar-height) + var(--safe-area-top) + 16px);';

  // Selected credential chip
  body.innerHTML = `
    <div style="margin:0 24px 8px;padding:12px 16px;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);display:flex;align-items:center;gap:12px;">
      <div style="width:36px;height:36px;border-radius:8px;background:${cred.color};display:flex;align-items:center;justify-content:center;">
        <span class="material-icons" style="color:#fff;font-size:18px">${cred.icon}</span>
      </div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:600;color:var(--color-text)">${td(cred.title)}</div>
        <div style="font-size:12px;color:var(--color-text-secondary)">${t('detail.shareWith')}</div>
      </div>
    </div>

    <!-- Search bar -->
    <div class="add-search-section">
      <div class="add-search-bar">
        <span class="material-icons add-search-icon">search</span>
        <input type="text" class="add-search-input" id="verifier-search" placeholder="${t('detail.searchVerifier')}" autocomplete="off">
        <button type="button" class="add-search-clear hidden" id="verifier-search-clear">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>

    <div style="padding:8px 24px 8px;font-size:13px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;" id="verifier-label">${t('detail.availableVerifiers')}</div>
  `;

  const list = document.createElement('div');
  list.style.cssText = 'padding:0 24px;';
  list.id = 'verifier-list';

  const emptyEl = document.createElement('div');
  emptyEl.className = 'add-empty hidden';
  emptyEl.id = 'verifier-empty';
  emptyEl.innerHTML = `
    <span class="material-icons" style="font-size:40px;color:var(--color-border)">search_off</span>
    <p style="margin-top:8px;color:var(--color-text-secondary);font-size:13px">${t('detail.noVerifiers')}</p>
  `;

  function renderVerifierCards(items) {
    list.innerHTML = '';
    items.forEach(v => {
      const card = document.createElement('div');
      card.className = 'verifier-card';
      card.innerHTML = `
        <div class="verifier-icon" style="background:${v.iconBg};color:${v.iconColor}">
          <span class="material-icons">${v.icon}</span>
        </div>
        <div class="verifier-info">
          <div class="verifier-name">${td(v.name)}</div>
          <div class="verifier-desc">${td(v.purpose)}</div>
        </div>
        <span class="material-icons" style="color:var(--color-text-secondary)">chevron_right</span>
      `;
      card.addEventListener('click', () => {
        setState({ selectedVerifier: v.id });
        overlay.remove();
        navigate('disclosure-request');
      });
      list.appendChild(card);
    });
  }

  renderVerifierCards(allVerifiers);

  // Search logic
  const searchInput = body.querySelector('#verifier-search');
  const clearBtn = body.querySelector('#verifier-search-clear');
  const labelEl = body.querySelector('#verifier-label');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    clearBtn.classList.toggle('hidden', q.length === 0);

    const filtered = q.length === 0
      ? allVerifiers
      : allVerifiers.filter(v =>
          v.name.toLowerCase().includes(q) ||
          v.purpose.toLowerCase().includes(q)
        );

    labelEl.textContent = q.length === 0
      ? t('detail.availableVerifiers')
      : filtered.length > 0
        ? `${filtered.length} ${t('results')}`
        : '';

    renderVerifierCards(filtered);
    emptyEl.classList.toggle('hidden', filtered.length > 0);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    labelEl.textContent = t('detail.availableVerifiers');
    renderVerifierCards(allVerifiers);
    emptyEl.classList.add('hidden');
  });

  body.appendChild(list);
  body.appendChild(emptyEl);
  overlay.appendChild(body);
  parentContainer.appendChild(overlay);
}
