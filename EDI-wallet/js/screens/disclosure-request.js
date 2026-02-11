import { navigate } from '../app.js';
import { getState } from '../data/state.js';
import { getCredentialById } from '../data/credentials.js';
import { getVerifierById, resolveAttributes } from '../data/verifiers.js';
import { createAppBar } from '../components/app-bar.js';

export function renderDisclosureRequest(container) {
  container.classList.add('disclosure-request-screen');

  const { selectedVerifier, selectedCredential } = getState();
  const verifier = getVerifierById(selectedVerifier);
  const cred = getCredentialById(selectedCredential);
  if (!verifier || !cred) return;

  container.appendChild(createAppBar('Verzoek', () => navigate('credential-detail', 'back')));

  const resolved = resolveAttributes(verifier, cred);

  const content = document.createElement('div');
  content.className = 'screen-content';
  content.style.paddingTop = '0';

  let html = `
    <div class="disclosure-verifier-header">
      <div class="disclosure-verifier-icon" style="background:${verifier.iconBg};color:${verifier.iconColor}">
        <span class="material-icons">${verifier.icon}</span>
      </div>
      <div class="disclosure-verifier-name">${verifier.name}</div>
      <p class="disclosure-verifier-purpose">${verifier.purpose}</p>
    </div>
    <div class="disclosure-body">
      <div class="disclosure-section-title">Gevraagde gegevens</div>
      <div class="disclosure-attrs-list">
  `;

  // Show all required attributes
  resolved.required.forEach(attr => {
    html += `
      <div class="disclosure-attr">
        <div class="disclosure-attr-info">
          <div class="disclosure-attr-name">${attr.key}</div>
          <div class="disclosure-attr-value">${attr.value}</div>
          <div class="disclosure-attr-required">Vereist</div>
        </div>
        <span class="material-icons" style="color:var(--color-primary);font-size:20px">lock</span>
      </div>
    `;
  });

  // Show optional count
  if (resolved.optional.length > 0) {
    html += `
      <div class="disclosure-attr" style="background:var(--color-surface-variant)">
        <div class="disclosure-attr-info">
          <div class="disclosure-attr-name" style="color:var(--color-text-secondary)">+ ${resolved.optional.length} optionele gegevens</div>
        </div>
        <span class="material-icons" style="color:var(--color-text-secondary);font-size:20px">tune</span>
      </div>
    `;
  }

  html += '</div></div>';
  content.innerHTML = html;
  container.appendChild(content);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'disclosure-footer';
  footer.innerHTML = `
    <button type="button" class="btn btn-primary btn-full" id="disclosure-continue">
      Controleer en deel
    </button>
    <button type="button" class="btn btn-text btn-full" id="disclosure-cancel">
      Weigeren
    </button>
  `;

  footer.querySelector('#disclosure-continue').addEventListener('click', () => {
    navigate('disclosure-confirm');
  });

  footer.querySelector('#disclosure-cancel').addEventListener('click', () => {
    navigate('dashboard', 'back');
  });

  container.appendChild(footer);
}
