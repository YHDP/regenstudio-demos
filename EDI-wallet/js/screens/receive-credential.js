import { navigate } from '../app.js';
import { getState } from '../data/state.js';
import { addCredentialToWallet, getPIDCredential } from '../data/credentials.js';
import { createAppBar } from '../components/app-bar.js';
import { createCredentialCard } from '../components/credential-card.js';
import { t } from '../data/translations.js';
import { td } from '../data/data-i18n.js';

// The credential that will be issued
const buurtbewoner = {
  id: 'cred-buurtbewoner',
  type: 'vergunning',
  issuer: 'Gemeente Den Haag',
  title: 'Bewijs buurtbewonerschap',
  subtitle: 'Zeeheldenkwartier, Den Haag',
  color: '#154273',
  icon: 'location_city',
  status: 'Geldig',
  statusColor: '#2E7D32',
  modules: {
    gegevens: {
      label: 'Persoonsgegevens',
      icon: 'person',
      attrs: {
        'Naam': 'Jan de Vries',
        'Buurt': 'Zeeheldenkwartier',
        'Wijk': 'Centrum',
        'Gemeente': 'Den Haag',
        'Inschrijfdatum': '1 maart 2019',
        'Geldig tot': '1 maart 2027',
      },
    },
  },
};

// PID attributes the gemeente requests — resolved at render time for i18n
function getPidRequired() { return [t('pid.firstName'), t('pid.lastName'), t('pid.bsn')]; }
function getPidOptional() { return [t('pid.dateOfBirth')]; }

export function renderReceiveCredential(container) {
  container.classList.add('receive-screen');

  const prev = getState().previousScreen;
  container.appendChild(createAppBar(t('receive.title'), () => navigate(prev || 'dashboard', 'back')));

  // Step 1: PID disclosure request
  showPidDisclosure(container, () => {
    // Step 2: Credential offer
    showCredentialOffer(container);
  });
}

function showPidDisclosure(container, onAccept) {
  const pid = getPIDCredential();

  const body = document.createElement('div');
  body.className = 'receive-body';
  body.id = 'pid-disclosure-body';

  body.innerHTML = `
    <div class="receive-issuer-info">
      <div class="receive-issuer-icon" style="background:#E3F2FD;color:#154273">
        <span class="material-icons">account_balance</span>
      </div>
      <div>
        <div class="receive-issuer-name">${td('Gemeente Den Haag')}</div>
        <div class="receive-issuer-label">${t('add.verifiedIssuer')}</div>
      </div>
    </div>
    <p style="text-align:center;margin-bottom:8px;font-size:15px;font-weight:600;color:var(--color-text)">
      ${t('add.identityVerificationRequired')}
    </p>
    <p style="text-align:center;margin-bottom:24px;font-size:13px;color:var(--color-text-secondary)">
      ${t('add.pidRequestMessage')}
    </p>
  `;

  // PID card chip
  if (pid) {
    const pidChip = document.createElement('div');
    pidChip.style.cssText = 'width:100%;padding:12px 16px;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);display:flex;align-items:center;gap:12px;margin-bottom:16px;';
    pidChip.innerHTML = `
      <div style="width:36px;height:36px;border-radius:8px;background:${pid.color};display:flex;align-items:center;justify-content:center;">
        <span class="material-icons" style="color:#fff;font-size:18px">${pid.icon}</span>
      </div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:600;color:var(--color-text)">${pid.title}</div>
        <div style="font-size:12px;color:var(--color-text-secondary)">${pid.issuer}</div>
      </div>
    `;
    body.appendChild(pidChip);
  }

  // Required attributes
  const reqSection = document.createElement('div');
  reqSection.style.cssText = 'width:100%;margin-bottom:12px;';
  reqSection.innerHTML = `<div style="font-size:12px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${t('disclosure.requiredData')}</div>`;

  const reqList = document.createElement('div');
  reqList.style.cssText = 'width:100%;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);overflow:hidden;';
  getPidRequired().forEach(key => {
    const val = pid?.attributes?.[key] || '—';
    reqList.innerHTML += `
      <div class="disclosure-attr">
        <div class="disclosure-attr-info">
          <div class="disclosure-attr-name">${key}</div>
          <div class="disclosure-attr-value">${val}</div>
          <div class="disclosure-attr-required">${t('disclosure.required')}</div>
        </div>
        <span class="material-icons" style="color:var(--color-primary);font-size:20px">lock</span>
      </div>
    `;
  });
  reqSection.appendChild(reqList);
  body.appendChild(reqSection);

  // Optional attributes with toggles
  const optSection = document.createElement('div');
  optSection.style.cssText = 'width:100%;margin-bottom:16px;';
  optSection.innerHTML = `<div style="font-size:12px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${t('disclosure.optionalDataTitle')}</div>`;

  const optList = document.createElement('div');
  optList.style.cssText = 'width:100%;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);overflow:hidden;';
  getPidOptional().forEach(key => {
    const val = pid?.attributes?.[key] || '—';
    optList.innerHTML += `
      <div class="disclosure-attr">
        <div class="disclosure-attr-info">
          <div class="disclosure-attr-name">${key}</div>
          <div class="disclosure-attr-value">${val}</div>
        </div>
        <div class="toggle">
          <div class="toggle-track active">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>
    `;
  });
  optSection.appendChild(optList);
  body.appendChild(optSection);

  // Toggle interaction
  optList.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.querySelector('.toggle-track').classList.toggle('active');
    });
  });

  container.appendChild(body);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'receive-footer';
  footer.id = 'pid-disclosure-footer';
  footer.innerHTML = `
    <button type="button" class="btn btn-primary btn-full" id="pid-share-accept">
      <span class="material-icons">share</span>
      ${t('add.shareAndContinue')}
    </button>
    <button type="button" class="btn btn-text btn-full" id="pid-share-decline">
      ${t('disclosure.decline')}
    </button>
  `;

  footer.querySelector('#pid-share-accept').addEventListener('click', () => {
    // Brief confirmation animation
    const btn = footer.querySelector('#pid-share-accept');
    btn.innerHTML = `<span class="material-icons">check</span> ${t('add.shared')}`;
    btn.style.background = 'var(--color-success)';
    btn.disabled = true;
    setTimeout(() => {
      body.remove();
      footer.remove();
      onAccept();
    }, 800);
  });

  footer.querySelector('#pid-share-decline').addEventListener('click', () => {
    navigate('dashboard', 'back');
  });

  container.appendChild(footer);
}

function showCredentialOffer(container) {
  const attrs = buurtbewoner.modules.gegevens.attrs;

  const body = document.createElement('div');
  body.className = 'receive-body';

  body.innerHTML = `
    <div class="receive-issuer-info">
      <div class="receive-issuer-icon" style="background:#E3F2FD;color:#154273">
        <span class="material-icons">account_balance</span>
      </div>
      <div>
        <div class="receive-issuer-name">${td(buurtbewoner.issuer)}</div>
        <div class="receive-issuer-label">${t('add.verifiedIssuer')}</div>
      </div>
    </div>
    <p style="text-align:center;margin-bottom:24px;font-size:15px;color:var(--color-text)">
      ${t('add.identityConfirmed')}
    </p>
  `;

  const cardWrap = document.createElement('div');
  cardWrap.className = 'receive-card-preview';
  cardWrap.appendChild(createCredentialCard(buurtbewoner));
  body.appendChild(cardWrap);

  const attrList = document.createElement('div');
  attrList.style.cssText = 'width:100%;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);overflow:hidden;margin-top:16px;';
  for (const [key, val] of Object.entries(attrs)) {
    attrList.innerHTML += `<div class="attr-row" style="padding:12px 16px"><span class="attr-label">${td(key)}</span><span class="attr-value">${td(val)}</span></div>`;
  }
  body.appendChild(attrList);
  container.appendChild(body);

  const footer = document.createElement('div');
  footer.className = 'receive-footer';
  footer.innerHTML = `
    <button type="button" class="btn btn-primary btn-full" id="receive-accept">
      <span class="material-icons">add_card</span>
      ${t('add.addToWallet')}
    </button>
    <button type="button" class="btn btn-text btn-full" id="receive-decline">
      ${t('disclosure.decline')}
    </button>
  `;

  footer.querySelector('#receive-accept').addEventListener('click', () => {
    addCredentialToWallet(buurtbewoner);

    const btn = footer.querySelector('#receive-accept');
    btn.innerHTML = `<span class="material-icons">check</span> ${t('add.added')}`;
    btn.style.background = 'var(--color-success)';
    btn.disabled = true;
    setTimeout(() => {
      navigate('dashboard', 'back');
    }, 1000);
  });

  footer.querySelector('#receive-decline').addEventListener('click', () => {
    navigate('dashboard', 'back');
  });

  container.appendChild(footer);
}
