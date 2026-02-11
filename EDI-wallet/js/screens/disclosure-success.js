import { navigate } from '../app.js';
import { getState, resetDisclosure } from '../data/state.js';
import { getVerifierById } from '../data/verifiers.js';
import { t } from '../data/translations.js';
import { td } from '../data/data-i18n.js';

export function renderDisclosureSuccess(container) {
  container.classList.add('success-screen');

  const { selectedVerifier } = getState();
  const verifier = getVerifierById(selectedVerifier);

  // Special flow for OpenStad Participatieplatform
  if (verifier?.successFlow === 'openstad-participatie') {
    renderOpenStadSuccess(container, verifier);
    return;
  }

  // Default success screen
  container.innerHTML = `
    <div class="success-checkmark">
      <span class="material-icons">check</span>
    </div>
    <div class="success-title">${t('success.shared')}</div>
    <p class="success-subtitle">
      ${t('success.sharedMessage')}${verifier ? t('disclosure.pinToShareWith') + td(verifier.name) : ''}
    </p>
    <button type="button" class="btn btn-primary" id="success-done" style="margin-top:16px;">
      ${t('success.backToCards')}
    </button>
  `;

  container.querySelector('#success-done').addEventListener('click', () => {
    resetDisclosure();
    navigate('dashboard', 'back');
  });

  // Auto-return after 5 seconds
  setTimeout(() => {
    if (getState().currentScreen === 'disclosure-success') {
      resetDisclosure();
      navigate('dashboard', 'back');
    }
  }, 5000);
}

function renderOpenStadSuccess(container, verifier) {
  // Override the default centered layout for richer content
  container.style.justifyContent = 'flex-start';
  container.style.paddingTop = '60px';
  container.style.gap = '0';
  container.style.overflowY = 'auto';

  container.innerHTML = `
    <div class="success-checkmark">
      <span class="material-icons">check</span>
    </div>
    <div class="success-title" style="margin-top:16px;">${t('success.verified')}</div>
    <p class="success-subtitle" style="margin-bottom:24px;">
      ${t('success.neighborhoodConfirmed')}
    </p>

    <div style="width:100%;text-align:left;padding:0 24px;">
      <div style="font-size:13px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">
        ${t('success.availableProjects')}
      </div>
      <div id="openstad-trajecten" style="display:flex;flex-direction:column;gap:10px;width:100%;"></div>
    </div>

    <div style="width:100%;padding:24px;">
      <button type="button" class="btn btn-primary btn-full" id="openstad-done">
        <span class="material-icons">open_in_new</span>
        ${t('success.goToOpenStad')}
      </button>
      <button type="button" class="btn btn-text btn-full" id="openstad-back" style="margin-top:8px;">
        ${t('success.backToWallet')}
      </button>
    </div>
  `;

  // Populate participatie trajecten
  const trajecten = [
    {
      title: t('openstad.project1.title'),
      description: t('openstad.project1.desc'),
      status: t('openstad.project1.status'),
      statusColor: '#2E7D32',
      icon: 'park',
    },
    {
      title: t('openstad.project2.title'),
      description: t('openstad.project2.desc'),
      status: t('openstad.project2.status'),
      statusColor: '#1565C0',
      icon: 'savings',
    },
    {
      title: t('openstad.project3.title'),
      description: t('openstad.project3.desc'),
      status: t('openstad.project3.status'),
      statusColor: '#E65100',
      icon: 'traffic',
    },
  ];

  const trajectenContainer = container.querySelector('#openstad-trajecten');
  trajecten.forEach(item => {
    const card = document.createElement('div');
    card.className = 'verifier-card';
    card.style.cursor = 'default';
    card.innerHTML = `
      <div class="verifier-icon" style="background:#E8F5E9;color:#2E7D32">
        <span class="material-icons">${item.icon}</span>
      </div>
      <div class="verifier-info">
        <div class="verifier-name">${item.title}</div>
        <div class="verifier-desc">${item.description}</div>
        <div style="margin-top:4px;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:${item.statusColor}">
          <span style="width:6px;height:6px;border-radius:50%;background:${item.statusColor}"></span>
          ${item.status}
        </div>
      </div>
    `;
    trajectenContainer.appendChild(card);
  });

  // Navigation handlers
  container.querySelector('#openstad-done').addEventListener('click', () => {
    resetDisclosure();
    navigate('dashboard', 'back');
  });

  container.querySelector('#openstad-back').addEventListener('click', () => {
    resetDisclosure();
    navigate('dashboard', 'back');
  });

  // No auto-return — user should read participatie content
}
