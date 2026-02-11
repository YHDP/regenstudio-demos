import { navigate } from '../app.js';
import { createBottomNav } from '../components/bottom-nav.js';
import { createAppBar } from '../components/app-bar.js';
import { createCredentialCard } from '../components/credential-card.js';
import { addCredentialToWallet, getPIDCredential } from '../data/credentials.js';

const issuers = [
  {
    id: 'gemeente-den-haag',
    name: 'Gemeente Den Haag',
    desc: 'Bewijs buurtbewonerschap, schuldhulpbehoevendheid',
    icon: 'account_balance',
    iconBg: '#E3F2FD',
    iconColor: '#154273',
    tags: ['overheid', 'gemeente', 'den haag', 'buurt', 'schuldhulp'],
    subCredentials: [
      {
        id: 'cred-buurtbewoner',
        type: 'vergunning',
        issuer: 'Gemeente Den Haag',
        title: 'Bewijs buurtbewonerschap',
        subtitle: 'Zeeheldenkwartier, Den Haag',
        color: '#154273',
        icon: 'location_city',
        status: 'Geldig',
        statusColor: '#2E7D32',
        label: 'Bewijs buurtbewonerschap',
        description: 'Attestatie dat u bewoner bent van een specifieke buurt in Den Haag',
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
      },
      {
        id: 'cred-schuldhulp',
        type: 'vergunning',
        issuer: 'Gemeente Den Haag',
        title: 'Schuldhulpbehoevendheid',
        subtitle: 'Beschikking schuldhulpverlening',
        color: '#00838F',
        icon: 'support',
        status: 'Actief',
        statusColor: '#2E7D32',
        label: 'Schuldhulpbehoevendheid',
        description: 'Attestatie ten behoeve van schuldhulpverlening',
        modules: {
          gegevens: {
            label: 'Beschikkingsgegevens',
            icon: 'gavel',
            attrs: {
              'Naam': 'Jan de Vries',
              'BSN': '••••••289',
              'Beschikkingsdatum': '15 januari 2026',
              'Type': 'Minnelijk traject',
              'Status': 'Actief',
              'Looptijd': '36 maanden',
            },
          },
        },
      },
    ],
  },
  {
    id: 'gemeente-amsterdam',
    name: 'Gemeente Amsterdam',
    desc: 'Uittreksel BRP, woonplaatsverklaring',
    icon: 'account_balance',
    iconBg: '#E3F2FD',
    iconColor: '#154273',
    tags: ['overheid', 'gemeente', 'brp'],
    credential: {
      id: 'cred-brp',
      issuer: 'Gemeente Amsterdam',
      title: 'Uittreksel BRP',
      subtitle: 'Basisregistratie Personen',
      color: '#154273',
      icon: 'account_balance',
    },
    attrs: {
      'Naam': 'Jan de Vries',
      'Geboortedatum': '15 maart 1988',
      'Adres': 'Keizersgracht 123, Amsterdam',
      'Gemeente': 'Amsterdam',
      'Inschrijfdatum': '1 januari 2015',
      'Burgerlijke staat': 'Ongehuwd',
    },
  },
  {
    id: 'gemeente-rotterdam',
    name: 'Gemeente Rotterdam',
    desc: 'Verhuisbewijs, VOG-aanvraag',
    icon: 'account_balance',
    iconBg: '#E3F2FD',
    iconColor: '#154273',
    tags: ['overheid', 'gemeente', 'vog'],
    credential: {
      id: 'cred-vog',
      issuer: 'Gemeente Rotterdam',
      title: 'Verklaring Omtrent Gedrag',
      subtitle: 'VOG',
      color: '#154273',
      icon: 'verified_user',
    },
    attrs: {
      'Naam': 'Jan de Vries',
      'Type': 'VOG Natuurlijke Personen',
      'Screeningsprofiel': 'Zakelijk',
      'Afgiftedatum': '8 januari 2026',
      'Geldig': 'Geen beperking',
    },
  },
  {
    id: 'rdw',
    name: 'RDW',
    desc: 'Digitaal kentekenbewijs, rijbewijsgegevens',
    icon: 'directions_car',
    iconBg: '#FFF8E1',
    iconColor: '#F57F17',
    tags: ['overheid', 'voertuig', 'kenteken', 'rijbewijs'],
    credential: {
      id: 'cred-kenteken',
      issuer: 'RDW',
      title: 'Digitaal Kentekenbewijs',
      subtitle: 'AB-123-CD',
      color: '#F57F17',
      icon: 'directions_car',
    },
    attrs: {
      'Kenteken': 'AB-123-CD',
      'Merk': 'Volkswagen',
      'Type': 'ID.4 Pro',
      'Brandstof': 'Elektrisch',
      'Datum eerste toelating': '12 juni 2024',
      'APK verloopdatum': '12 juni 2026',
      'Tenaamstelling': 'Jan de Vries',
    },
  },
  {
    id: 'duo',
    name: 'DUO',
    desc: "Diploma's, certificaten, studieschuld",
    icon: 'school',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    tags: ['overheid', 'onderwijs', 'diploma', 'studie'],
    credential: {
      id: 'cred-diploma',
      issuer: 'DUO',
      title: 'HBO Diploma',
      subtitle: 'Informatica \u2014 HvA',
      color: '#2E7D32',
      icon: 'school',
    },
    attrs: {
      'Naam': 'Jan de Vries',
      'Opleiding': 'HBO Informatica',
      'Instelling': 'Hogeschool van Amsterdam',
      'Graad': 'Bachelor of Science',
      'Datum uitreiking': '5 juli 2012',
      'CROHO-nummer': '34479',
    },
  },
  {
    id: 'belastingdienst',
    name: 'Belastingdienst',
    desc: 'Inkomensverklaring, toeslaggegevens',
    icon: 'receipt_long',
    iconBg: '#E3F2FD',
    iconColor: '#154273',
    tags: ['overheid', 'belasting', 'inkomen', 'toeslag'],
    credential: {
      id: 'cred-inkomen',
      issuer: 'Belastingdienst',
      title: 'Inkomensverklaring',
      subtitle: 'Belastingjaar 2025',
      color: '#154273',
      icon: 'receipt_long',
    },
    attrs: {
      'Naam': 'Jan de Vries',
      'BSN': '\u2022\u2022\u2022\u2022\u2022\u2022289',
      'Belastingjaar': '2025',
      'Verzamelinkomen': '\u20ac 48.200',
      'Loonheffing': '\u20ac 14.460',
      'Toetsingsinkomen': '\u20ac 48.200',
    },
  },
  {
    id: 'kvk',
    name: 'Kamer van Koophandel',
    desc: 'Uittreksel Handelsregister, bevoegdheid',
    icon: 'business',
    iconBg: '#EDE7F6',
    iconColor: '#5E35B1',
    tags: ['overheid', 'kvk', 'bedrijf', 'handelsregister', 'onderneming'],
    credential: {
      id: 'cred-kvk',
      issuer: 'Kamer van Koophandel',
      title: 'Uittreksel Handelsregister',
      subtitle: 'De Vries Digital B.V.',
      color: '#5E35B1',
      icon: 'business',
    },
    attrs: {
      'Handelsnaam': 'De Vries Digital B.V.',
      'KVK-nummer': '87654321',
      'RSIN': '862345179',
      'Rechtsvorm': 'Besloten Vennootschap',
      'Vestigingsadres': 'Herengracht 100, Amsterdam',
      'Bestuurder': 'Jan de Vries',
      'Datum oprichting': '1 maart 2020',
    },
  },
  {
    id: 'uwv',
    name: 'UWV',
    desc: 'Werkgeversverklaring, dienstverbandhistorie',
    icon: 'work',
    iconBg: '#E3F2FD',
    iconColor: '#1565C0',
    tags: ['overheid', 'werk', 'uitkering', 'dienstverband'],
    credential: {
      id: 'cred-uwv',
      issuer: 'UWV',
      title: 'Dienstverbandoverzicht',
      subtitle: 'Arbeidshistorie',
      color: '#1565C0',
      icon: 'work',
    },
    attrs: {
      'Naam': 'Jan de Vries',
      'Huidige werkgever': 'Accenture B.V.',
      'Functie': 'Senior Developer',
      'In dienst sinds': '1 september 2018',
      'Type contract': 'Onbepaalde tijd',
      'SV-loon (2025)': '\u20ac 52.400',
    },
  },
  {
    id: 'svb',
    name: 'SVB',
    desc: 'AOW-overzicht, kinderbijslag',
    icon: 'family_restroom',
    iconBg: '#FCE4EC',
    iconColor: '#C62828',
    tags: ['overheid', 'svb', 'aow', 'kinderbijslag', 'pensioen'],
    credential: {
      id: 'cred-svb',
      issuer: 'SVB',
      title: 'AOW-verzekeringsbewijs',
      subtitle: 'Opbouwoverzicht',
      color: '#C62828',
      icon: 'family_restroom',
    },
    attrs: {
      'Naam': 'Jan de Vries',
      'Opgebouwde AOW-rechten': '100%',
      'Verzekerde jaren': '36 jaar',
      'AOW-leeftijd': '67 jaar en 3 maanden',
      'Verwachte ingangsdatum': 'Juni 2055',
    },
  },
  {
    id: 'cibg',
    name: 'CIBG',
    desc: 'BIG-registratie voor zorgverleners',
    icon: 'local_hospital',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    tags: ['overheid', 'zorg', 'big', 'registratie'],
    credential: {
      id: 'cred-big',
      issuer: 'CIBG',
      title: 'BIG-registratie',
      subtitle: 'Zorgverlener',
      color: '#2E7D32',
      icon: 'local_hospital',
    },
    attrs: {
      'Naam': 'Jan de Vries',
      'BIG-nummer': '19876543201',
      'Beroep': 'Arts',
      'Specialisme': 'Huisartsengeneeskunde',
      'Registratiedatum': '1 februari 2016',
      'Geldig tot': '1 februari 2027',
    },
  },
  {
    id: 'kadaster',
    name: 'Kadaster',
    desc: 'Eigendomsbewijs, hypotheekgegevens',
    icon: 'home',
    iconBg: '#FFF3E0',
    iconColor: '#E65100',
    tags: ['overheid', 'kadaster', 'woning', 'eigendom', 'vastgoed'],
    credential: {
      id: 'cred-eigendom',
      issuer: 'Kadaster',
      title: 'Eigendomsbewijs',
      subtitle: 'Keizersgracht 123, Amsterdam',
      color: '#E65100',
      icon: 'home',
    },
    attrs: {
      'Eigenaar': 'Jan de Vries',
      'Adres': 'Keizersgracht 123, 1015 CJ Amsterdam',
      'Kadastrale aanduiding': 'ASD04 K 1234',
      'Soort object': 'Appartement',
      'Oppervlakte': '82 m\u00B2',
      'Datum eigendom': '15 augustus 2021',
      'Hypotheekhouder': 'ABN AMRO Bank N.V.',
    },
  },
];

// All issuers for search
let filteredIssuers = [...issuers];

export function renderAddCredential(container) {
  container.classList.add('dashboard-screen');

  const content = document.createElement('div');
  content.className = 'screen-content';

  content.innerHTML = `
    <div class="dashboard-header">
      <h2 class="dashboard-title">Toevoegen</h2>
    </div>

    <!-- QR Scan primary action -->
    <div class="add-qr-section">
      <button type="button" class="add-qr-btn" id="add-qr-scan">
        <div class="add-qr-btn-icon">
          <span class="material-icons">qr_code_scanner</span>
        </div>
        <div class="add-qr-btn-text">
          <span class="add-qr-btn-title">Scan QR-code</span>
          <span class="add-qr-btn-desc">Scan een QR-code van een uitgever om een credential te ontvangen</span>
        </div>
        <span class="material-icons" style="color:var(--color-text-secondary)">chevron_right</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="add-divider">
      <div class="add-divider-line"></div>
      <span class="add-divider-text">of zoek een uitgever</span>
      <div class="add-divider-line"></div>
    </div>

    <!-- Search bar -->
    <div class="add-search-section">
      <div class="add-search-bar">
        <span class="material-icons add-search-icon">search</span>
        <input type="text" class="add-search-input" id="issuer-search" placeholder="Zoek op naam, organisatie of type..." autocomplete="off">
        <button type="button" class="add-search-clear hidden" id="search-clear">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>

    <!-- Business Identifier -->
    <div class="add-bid-section">
      <button type="button" class="add-bid-btn" id="add-bid">
        <span class="material-icons" style="font-size:20px;color:var(--color-primary)">pin</span>
        <span>Voer een organisatie-identificatie in (KVK, OIN, EORI)</span>
        <span class="material-icons" style="color:var(--color-text-secondary);font-size:18px">chevron_right</span>
      </button>
    </div>

    <!-- Section label -->
    <div class="add-section-label" id="section-label">Alle uitgevers</div>

    <!-- Issuer list -->
    <div class="add-issuer-list" id="issuer-list"></div>

    <!-- Empty state -->
    <div class="add-empty hidden" id="empty-state">
      <span class="material-icons" style="font-size:40px;color:var(--color-border)">search_off</span>
      <p style="margin-top:8px;color:var(--color-text-secondary);font-size:13px">Geen uitgevers gevonden</p>
    </div>
  `;

  // QR scan → simulate receiving a credential
  content.querySelector('#add-qr-scan').addEventListener('click', () => {
    navigate('receive-credential');
  });

  // Business Identifier
  content.querySelector('#add-bid').addEventListener('click', () => {
    showBusinessIdInput(container);
  });

  // Search
  const searchInput = content.querySelector('#issuer-search');
  const clearBtn = content.querySelector('#search-clear');
  const listEl = content.querySelector('#issuer-list');
  const emptyEl = content.querySelector('#empty-state');
  const labelEl = content.querySelector('#section-label');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    clearBtn.classList.toggle('hidden', q.length === 0);

    if (q.length === 0) {
      filteredIssuers = [...issuers];
      labelEl.textContent = 'Alle uitgevers';
    } else {
      filteredIssuers = issuers.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q) ||
        i.tags.some(t => t.includes(q))
      );
      labelEl.textContent = filteredIssuers.length > 0
        ? `${filteredIssuers.length} resultaten`
        : '';
    }

    renderIssuerList(listEl, container, filteredIssuers);
    emptyEl.classList.toggle('hidden', filteredIssuers.length > 0);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    filteredIssuers = [...issuers];
    labelEl.textContent = 'Alle uitgevers';
    renderIssuerList(listEl, container, filteredIssuers);
    emptyEl.classList.add('hidden');
  });

  // Initial render
  renderIssuerList(listEl, container, issuers);

  container.appendChild(content);
  container.appendChild(createBottomNav('add'));
}

function renderIssuerList(listEl, parentContainer, items) {
  listEl.innerHTML = '';
  items.forEach(issuer => {
    const card = document.createElement('div');
    card.className = 'verifier-card';
    card.innerHTML = `
      <div class="verifier-icon" style="background:${issuer.iconBg};color:${issuer.iconColor}">
        <span class="material-icons">${issuer.icon}</span>
      </div>
      <div class="verifier-info">
        <div class="verifier-name">${issuer.name}</div>
        <div class="verifier-desc">${issuer.desc}</div>
      </div>
      <span class="material-icons" style="color:var(--color-text-secondary)">chevron_right</span>
    `;
    card.addEventListener('click', () => showIssuerOffer(parentContainer, issuer));
    listEl.appendChild(card);
  });
}

function showIssuerOffer(parentContainer, issuer) {
  // If issuer has sub-credentials, show a picker first
  if (issuer.subCredentials && issuer.subCredentials.length > 0) {
    showSubCredentialPicker(parentContainer, issuer);
    return;
  }

  // Build a full credential object for adding to wallet
  const credentialObj = {
    ...issuer.credential,
    modules: issuer.modules || {
      gegevens: {
        label: 'Gegevens',
        icon: issuer.credential.icon || 'info',
        attrs: { ...issuer.attrs },
      },
    },
  };

  showCredentialOffer(parentContainer, issuer, credentialObj, issuer.attrs);
}

function showSubCredentialPicker(parentContainer, issuer) {
  const overlay = document.createElement('div');
  overlay.className = 'screen active slide-up';
  overlay.style.zIndex = '60';
  overlay.style.background = 'var(--color-surface)';

  overlay.appendChild(createAppBar(issuer.name, () => {
    overlay.classList.remove('slide-up');
    overlay.classList.add('slide-down');
    setTimeout(() => overlay.remove(), 400);
  }));

  const body = document.createElement('div');
  body.style.cssText = 'padding:calc(var(--app-bar-height) + var(--safe-area-top) + 16px) 24px 24px;';

  body.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="width:44px;height:44px;border-radius:12px;background:${issuer.iconBg};color:${issuer.iconColor};display:flex;align-items:center;justify-content:center;">
        <span class="material-icons">${issuer.icon}</span>
      </div>
      <div>
        <div style="font-size:16px;font-weight:600;color:var(--color-text)">${issuer.name}</div>
        <div style="font-size:13px;color:var(--color-text-secondary)">Geverifieerde uitgever</div>
      </div>
    </div>
    <div style="font-size:13px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Beschikbare credentials</div>
  `;

  const list = document.createElement('div');
  list.style.cssText = 'display:flex;flex-direction:column;gap:10px;';

  issuer.subCredentials.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'verifier-card';
    card.innerHTML = `
      <div class="verifier-icon" style="background:${sub.color};color:#fff;border-radius:12px;">
        <span class="material-icons">${sub.icon}</span>
      </div>
      <div class="verifier-info">
        <div class="verifier-name">${sub.label || sub.title}</div>
        <div class="verifier-desc">${sub.description || sub.subtitle}</div>
      </div>
      <span class="material-icons" style="color:var(--color-text-secondary)">chevron_right</span>
    `;
    card.addEventListener('click', () => {
      overlay.remove();
      // Get first module's attrs for the preview
      const firstMod = Object.values(sub.modules)[0];
      const attrs = firstMod ? firstMod.attrs : {};
      showCredentialOffer(parentContainer, issuer, sub, attrs);
    });
    list.appendChild(card);
  });

  body.appendChild(list);
  overlay.appendChild(body);
  parentContainer.appendChild(overlay);
}

function showCredentialOffer(parentContainer, issuer, credentialObj, attrs) {
  // For buurtbewonerschap: first require PID disclosure
  if (credentialObj.id === 'cred-buurtbewoner') {
    showPidDisclosureOverlay(parentContainer, issuer, () => {
      renderCredentialOfferOverlay(parentContainer, issuer, credentialObj, attrs, 'Je identiteit is bevestigd. Wil je deze credential toevoegen aan je wallet?');
    });
    return;
  }

  renderCredentialOfferOverlay(parentContainer, issuer, credentialObj, attrs, 'Wil je deze credential toevoegen aan je wallet?');
}

function showPidDisclosureOverlay(parentContainer, issuer, onAccept) {
  const pid = getPIDCredential();
  const pidRequired = ['Voornaam', 'Achternaam', 'BSN'];
  const pidOptional = ['Geboortedatum'];

  const overlay = document.createElement('div');
  overlay.className = 'screen active slide-up receive-screen';
  overlay.style.zIndex = '60';
  overlay.style.background = 'var(--color-surface)';

  overlay.appendChild(createAppBar('Identiteitsverificatie', () => {
    overlay.classList.remove('slide-up');
    overlay.classList.add('slide-down');
    setTimeout(() => overlay.remove(), 400);
  }));

  const body = document.createElement('div');
  body.className = 'receive-body';

  body.innerHTML = `
    <div class="receive-issuer-info">
      <div class="receive-issuer-icon" style="background:${issuer.iconBg};color:${issuer.iconColor}">
        <span class="material-icons">${issuer.icon}</span>
      </div>
      <div>
        <div class="receive-issuer-name">${issuer.name}</div>
        <div class="receive-issuer-label">Geverifieerde uitgever</div>
      </div>
    </div>
    <p style="text-align:center;margin-bottom:8px;font-size:15px;font-weight:600;color:var(--color-text)">
      Identiteitsverificatie vereist
    </p>
    <p style="text-align:center;margin-bottom:24px;font-size:13px;color:var(--color-text-secondary)">
      Om je buurtbewonerschap te bevestigen vraagt de gemeente je persoonsgegevens uit je PID.
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
  reqSection.innerHTML = `<div style="font-size:12px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Vereiste gegevens</div>`;
  const reqList = document.createElement('div');
  reqList.style.cssText = 'width:100%;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);overflow:hidden;';
  pidRequired.forEach(key => {
    const val = pid?.attributes?.[key] || '\u2014';
    reqList.innerHTML += `
      <div class="disclosure-attr">
        <div class="disclosure-attr-info">
          <div class="disclosure-attr-name">${key}</div>
          <div class="disclosure-attr-value">${val}</div>
          <div class="disclosure-attr-required">Vereist</div>
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
  optSection.innerHTML = `<div style="font-size:12px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Optionele gegevens</div>`;
  const optList = document.createElement('div');
  optList.style.cssText = 'width:100%;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);overflow:hidden;';
  pidOptional.forEach(key => {
    const val = pid?.attributes?.[key] || '\u2014';
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

  overlay.appendChild(body);

  const footer = document.createElement('div');
  footer.className = 'receive-footer';
  footer.innerHTML = `
    <button type="button" class="btn btn-primary btn-full" id="pid-offer-accept">
      <span class="material-icons">share</span>
      Delen en doorgaan
    </button>
    <button type="button" class="btn btn-text btn-full" id="pid-offer-decline">
      Weigeren
    </button>
  `;

  footer.querySelector('#pid-offer-accept').addEventListener('click', () => {
    const btn = footer.querySelector('#pid-offer-accept');
    btn.innerHTML = '<span class="material-icons">check</span> Gedeeld!';
    btn.style.background = 'var(--color-success)';
    btn.disabled = true;
    setTimeout(() => {
      overlay.remove();
      onAccept();
    }, 800);
  });

  footer.querySelector('#pid-offer-decline').addEventListener('click', () => {
    overlay.classList.remove('slide-up');
    overlay.classList.add('slide-down');
    setTimeout(() => overlay.remove(), 400);
  });

  overlay.appendChild(footer);
  parentContainer.appendChild(overlay);
}

function renderCredentialOfferOverlay(parentContainer, issuer, credentialObj, attrs, message) {
  const overlay = document.createElement('div');
  overlay.className = 'screen active slide-up receive-screen';
  overlay.style.zIndex = '60';
  overlay.style.background = 'var(--color-surface)';

  overlay.appendChild(createAppBar('Credential ontvangen', () => {
    overlay.classList.remove('slide-up');
    overlay.classList.add('slide-down');
    setTimeout(() => overlay.remove(), 400);
  }));

  const body = document.createElement('div');
  body.className = 'receive-body';

  body.innerHTML = `
    <div class="receive-issuer-info">
      <div class="receive-issuer-icon" style="background:${issuer.iconBg};color:${issuer.iconColor}">
        <span class="material-icons">${issuer.icon}</span>
      </div>
      <div>
        <div class="receive-issuer-name">${issuer.name}</div>
        <div class="receive-issuer-label">Geverifieerde uitgever</div>
      </div>
    </div>
    <p style="text-align:center;margin-bottom:24px;font-size:15px;color:var(--color-text)">
      ${message}
    </p>
  `;

  // Card preview
  const cardPreview = { id: credentialObj.id, issuer: credentialObj.issuer, title: credentialObj.title, subtitle: credentialObj.subtitle, color: credentialObj.color, icon: credentialObj.icon };
  const cardWrap = document.createElement('div');
  cardWrap.className = 'receive-card-preview';
  cardWrap.appendChild(createCredentialCard(cardPreview));
  body.appendChild(cardWrap);

  const attrList = document.createElement('div');
  attrList.style.cssText = 'width:100%;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);overflow:hidden;margin-top:16px;';
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      attrList.innerHTML += `<div class="attr-row" style="padding:12px 16px"><span class="attr-label">${key}</span><span class="attr-value">${val}</span></div>`;
    }
  }
  body.appendChild(attrList);
  overlay.appendChild(body);

  const footer = document.createElement('div');
  footer.className = 'receive-footer';
  footer.innerHTML = `
    <button type="button" class="btn btn-primary btn-full" id="offer-accept">
      <span class="material-icons">add_card</span>
      Toevoegen aan wallet
    </button>
    <button type="button" class="btn btn-text btn-full" id="offer-decline">
      Weigeren
    </button>
  `;

  footer.querySelector('#offer-accept').addEventListener('click', () => {
    addCredentialToWallet(credentialObj);

    const btn = footer.querySelector('#offer-accept');
    btn.innerHTML = '<span class="material-icons">check</span> Toegevoegd!';
    btn.style.background = 'var(--color-success)';
    btn.disabled = true;
    setTimeout(() => {
      overlay.remove();
      navigate('dashboard', 'back');
    }, 1000);
  });

  footer.querySelector('#offer-decline').addEventListener('click', () => {
    overlay.classList.remove('slide-up');
    overlay.classList.add('slide-down');
    setTimeout(() => overlay.remove(), 400);
  });

  overlay.appendChild(footer);
  parentContainer.appendChild(overlay);
}

function showBusinessIdInput(parentContainer) {
  const overlay = document.createElement('div');
  overlay.className = 'screen active slide-up';
  overlay.style.zIndex = '60';
  overlay.style.background = 'var(--color-surface)';

  overlay.appendChild(createAppBar('Organisatie opzoeken', () => {
    overlay.classList.remove('slide-up');
    overlay.classList.add('slide-down');
    setTimeout(() => overlay.remove(), 400);
  }));

  const body = document.createElement('div');
  body.style.cssText = 'padding:calc(var(--app-bar-height) + var(--safe-area-top) + 24px) 24px 24px;';

  body.innerHTML = `
    <p style="font-size:15px;color:var(--color-text);margin-bottom:20px;">
      Voer een organisatie-identificatiecode in om credentials van die organisatie op te halen.
    </p>

    <!-- ID type selector -->
    <div class="bid-type-tabs" id="bid-type-tabs">
      <button type="button" class="bid-type-tab active" data-type="kvk">KVK-nummer</button>
      <button type="button" class="bid-type-tab" data-type="oin">OIN</button>
      <button type="button" class="bid-type-tab" data-type="eori">EORI</button>
    </div>

    <div style="margin-top:16px;">
      <label style="font-size:13px;font-weight:600;color:var(--color-text);display:block;margin-bottom:6px;" id="bid-label">KVK-nummer</label>
      <input type="text" class="input" id="bid-input" placeholder="Bijv. 87654321" autocomplete="off" inputmode="text">
      <p style="font-size:12px;color:var(--color-text-secondary);margin-top:6px;" id="bid-hint">8-cijferig nummer uit het Handelsregister</p>
    </div>

    <div class="bid-result hidden" id="bid-result">
      <div class="verifier-card" id="bid-result-card" style="margin-top:16px;"></div>
    </div>

    <button type="button" class="btn btn-primary btn-full" style="margin-top:20px;" id="bid-search">
      <span class="material-icons">search</span>
      Zoeken
    </button>
  `;

  // Tab switching
  const typeConfig = {
    kvk: { label: 'KVK-nummer', placeholder: 'Bijv. 87654321', hint: '8-cijferig nummer uit het Handelsregister' },
    oin: { label: 'OIN', placeholder: 'Bijv. 00000001234567890000', hint: '20-cijferig Overheids Identificatie Nummer' },
    eori: { label: 'EORI-nummer', placeholder: 'Bijv. NL123456789', hint: 'EU Economic Operators Registration and Identification' },
  };

  body.querySelectorAll('.bid-type-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      body.querySelectorAll('.bid-type-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const type = tab.dataset.type;
      const cfg = typeConfig[type];
      body.querySelector('#bid-label').textContent = cfg.label;
      body.querySelector('#bid-input').placeholder = cfg.placeholder;
      body.querySelector('#bid-hint').textContent = cfg.hint;
      body.querySelector('#bid-result').classList.add('hidden');
    });
  });

  // Search simulation
  body.querySelector('#bid-search').addEventListener('click', () => {
    const input = body.querySelector('#bid-input');
    const resultSection = body.querySelector('#bid-result');
    const resultCard = body.querySelector('#bid-result-card');

    if (!input.value.trim()) {
      input.style.borderColor = 'var(--color-error)';
      setTimeout(() => { input.style.borderColor = ''; }, 1500);
      return;
    }

    // Simulated result: always find KVK issuer
    const kvkIssuer = issuers.find(i => i.id === 'kvk');
    resultCard.innerHTML = `
      <div class="verifier-icon" style="background:${kvkIssuer.iconBg};color:${kvkIssuer.iconColor}">
        <span class="material-icons">${kvkIssuer.icon}</span>
      </div>
      <div class="verifier-info">
        <div class="verifier-name">${kvkIssuer.credential.subtitle}</div>
        <div class="verifier-desc">KVK ${input.value.trim()} \u2022 ${kvkIssuer.credential.attrs?.['Vestigingsadres'] || 'Amsterdam'}</div>
      </div>
      <span class="material-icons" style="color:var(--color-primary)">add_circle</span>
    `;

    resultCard.addEventListener('click', () => {
      overlay.remove();
      showIssuerOffer(parentContainer, kvkIssuer);
    });

    resultSection.classList.remove('hidden');
  });

  overlay.appendChild(body);
  parentContainer.appendChild(overlay);
}
