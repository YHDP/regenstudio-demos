import { navigate } from '../app.js';
import { getState, resetDisclosure } from '../data/state.js';
import { getVerifierById } from '../data/verifiers.js';

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
    <div class="success-title">Gedeeld!</div>
    <p class="success-subtitle">
      Je gegevens zijn succesvol gedeeld${verifier ? ' met ' + verifier.name : ''}
    </p>
    <button type="button" class="btn btn-primary" id="success-done" style="margin-top:16px;">
      Terug naar kaarten
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
    <div class="success-title" style="margin-top:16px;">Geverifieerd!</div>
    <p class="success-subtitle" style="margin-bottom:24px;">
      Je buurtbewonerschap is bevestigd. Je hebt nu toegang tot de participatie-omgeving van het Zeeheldenkwartier.
    </p>

    <div style="width:100%;text-align:left;padding:0 24px;">
      <div style="font-size:13px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">
        Beschikbare trajecten
      </div>
      <div id="openstad-trajecten" style="display:flex;flex-direction:column;gap:10px;width:100%;"></div>
    </div>

    <div style="width:100%;padding:24px;">
      <button type="button" class="btn btn-primary btn-full" id="openstad-done">
        <span class="material-icons">open_in_new</span>
        Ga naar OpenStad
      </button>
      <button type="button" class="btn btn-text btn-full" id="openstad-back" style="margin-top:8px;">
        Terug naar wallet
      </button>
    </div>
  `;

  // Populate participatie trajecten
  const trajecten = [
    {
      title: 'Herinrichting Prins Hendrikplein',
      description: 'Stem mee over de nieuwe inrichting van het plein: meer groen, speelruimte of parkeerplaatsen?',
      status: 'Actief',
      statusColor: '#2E7D32',
      icon: 'park',
    },
    {
      title: 'Buurtbudget 2026',
      description: 'Dien een voorstel in voor het buurtbudget van \u20ac 50.000 voor het Zeeheldenkwartier.',
      status: 'Inschrijving open',
      statusColor: '#1565C0',
      icon: 'savings',
    },
    {
      title: 'Verkeersveiligheid Zeestraat',
      description: 'Deel je ervaring en idee\u00EBn over verkeersveiligheid in de Zeestraat en omgeving.',
      status: 'Peiling',
      statusColor: '#E65100',
      icon: 'traffic',
    },
  ];

  const trajectenContainer = container.querySelector('#openstad-trajecten');
  trajecten.forEach(t => {
    const card = document.createElement('div');
    card.className = 'verifier-card';
    card.style.cursor = 'default';
    card.innerHTML = `
      <div class="verifier-icon" style="background:#E8F5E9;color:#2E7D32">
        <span class="material-icons">${t.icon}</span>
      </div>
      <div class="verifier-info">
        <div class="verifier-name">${t.title}</div>
        <div class="verifier-desc">${t.description}</div>
        <div style="margin-top:4px;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:${t.statusColor}">
          <span style="width:6px;height:6px;border-radius:50%;background:${t.statusColor}"></span>
          ${t.status}
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
