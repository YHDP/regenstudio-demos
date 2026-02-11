import { navigate } from '../app.js';
import { getState, setState } from '../data/state.js';
import { getCredentialById } from '../data/credentials.js';
import { getVerifierById, resolveAttributes } from '../data/verifiers.js';
import { createAppBar } from '../components/app-bar.js';
import { createToggleAttribute } from '../components/toggle-attribute.js';

export function renderDisclosureConfirm(container) {
  const { selectedVerifier, selectedCredential } = getState();
  const verifier = getVerifierById(selectedVerifier);
  const cred = getCredentialById(selectedCredential);
  if (!verifier || !cred) return;

  container.appendChild(createAppBar('Gegevens kiezen', () => navigate('disclosure-request', 'back')));

  const resolved = resolveAttributes(verifier, cred);

  // Init toggles: required all on, optional all on by default
  const toggles = {};
  resolved.required.forEach(a => { toggles[a.key] = true; });
  resolved.optional.forEach(a => { toggles[a.key] = true; });
  setState({ disclosureToggles: toggles });

  const content = document.createElement('div');
  content.className = 'screen-content';
  content.style.paddingTop = 'calc(var(--app-bar-height) + var(--safe-area-top) + var(--space-md))';

  // Info banner
  const banner = document.createElement('div');
  banner.style.cssText = 'margin:0 16px 16px;padding:12px 16px;background:var(--color-primary-light);border-radius:12px;display:flex;align-items:center;gap:12px;';
  banner.innerHTML = `
    <span class="material-icons" style="color:var(--color-primary);font-size:20px">info</span>
    <span style="font-size:13px;color:var(--color-text)">Je kunt optionele gegevens aan- of uitzetten</span>
  `;
  content.appendChild(banner);

  // Credential source
  const source = document.createElement('div');
  source.style.cssText = 'margin:0 16px 16px;padding:12px 16px;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);display:flex;align-items:center;gap:12px;';
  source.innerHTML = `
    <div style="width:36px;height:36px;border-radius:8px;background:${cred.color};display:flex;align-items:center;justify-content:center;">
      <span class="material-icons" style="color:#fff;font-size:18px">${cred.icon}</span>
    </div>
    <div>
      <div style="font-size:14px;font-weight:600;color:var(--color-text)">${cred.title}</div>
      <div style="font-size:12px;color:var(--color-text-secondary)">${cred.issuer}</div>
    </div>
  `;
  content.appendChild(source);

  // Required attributes section
  if (resolved.required.length > 0) {
    const reqTitle = document.createElement('div');
    reqTitle.className = 'disclosure-section-title';
    reqTitle.style.cssText = 'padding:0 16px;';
    reqTitle.textContent = 'Vereiste gegevens';
    content.appendChild(reqTitle);

    const reqList = document.createElement('div');
    reqList.className = 'disclosure-attrs-list';
    reqList.style.cssText = 'margin:0 16px 16px;';
    resolved.required.forEach(attr => {
      reqList.appendChild(createToggleAttribute(attr, true, true, () => {}));
    });
    content.appendChild(reqList);
  }

  // Optional attributes section
  if (resolved.optional.length > 0) {
    const optTitle = document.createElement('div');
    optTitle.className = 'disclosure-section-title';
    optTitle.style.cssText = 'padding:0 16px;';
    optTitle.textContent = 'Optionele gegevens';
    content.appendChild(optTitle);

    const optList = document.createElement('div');
    optList.className = 'disclosure-attrs-list';
    optList.style.cssText = 'margin:0 16px 16px;';
    resolved.optional.forEach(attr => {
      optList.appendChild(createToggleAttribute(attr, true, false, (key, val) => {
        const current = getState().disclosureToggles;
        setState({ disclosureToggles: { ...current, [key]: val } });
      }));
    });
    content.appendChild(optList);
  }

  // Extra bottom padding for footer
  const spacer = document.createElement('div');
  spacer.style.height = '100px';
  content.appendChild(spacer);

  container.appendChild(content);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'disclosure-footer';
  footer.innerHTML = `
    <button type="button" class="btn btn-primary btn-full" id="confirm-share">
      <span class="material-icons">lock</span>
      Bevestig met pincode
    </button>
    <button type="button" class="btn btn-text btn-full" id="confirm-cancel">
      Annuleer
    </button>
  `;

  footer.querySelector('#confirm-share').addEventListener('click', () => {
    navigate('disclosure-pin');
  });

  footer.querySelector('#confirm-cancel').addEventListener('click', () => {
    navigate('dashboard', 'back');
  });

  container.appendChild(footer);
}
