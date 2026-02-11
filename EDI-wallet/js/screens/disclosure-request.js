import { navigate } from '../app.js';
import { getState } from '../data/state.js';
import { getCredentialById } from '../data/credentials.js';
import { getVerifierById, resolveAttributes } from '../data/verifiers.js';
import { createAppBar } from '../components/app-bar.js';
import { t } from '../data/translations.js';
import { td } from '../data/data-i18n.js';

export function renderDisclosureRequest(container) {
  container.classList.add('disclosure-request-screen');

  const { selectedVerifier, selectedCredential } = getState();
  const verifier = getVerifierById(selectedVerifier);
  const cred = getCredentialById(selectedCredential);
  if (!verifier || !cred) return;

  container.appendChild(createAppBar(t('disclosure.request'), () => navigate('credential-detail', 'back')));

  const resolved = resolveAttributes(verifier, cred);

  const content = document.createElement('div');
  content.className = 'screen-content';
  content.style.paddingTop = '0';

  let html = `
    <div class="disclosure-verifier-header">
      <div class="disclosure-verifier-icon" style="background:${verifier.iconBg};color:${verifier.iconColor}">
        <span class="material-icons">${verifier.icon}</span>
      </div>
      <div class="disclosure-verifier-name">${td(verifier.name)}</div>
      <p class="disclosure-verifier-purpose">${td(verifier.purpose)}</p>
    </div>
    <div class="disclosure-body">
      <div class="disclosure-section-title">${t('disclosure.requestedData')}</div>
      <div class="disclosure-attrs-list">
  `;

  // Show all required attributes
  resolved.required.forEach(attr => {
    html += `
      <div class="disclosure-attr">
        <div class="disclosure-attr-info">
          <div class="disclosure-attr-name">${td(attr.key)}</div>
          <div class="disclosure-attr-value">${td(attr.value)}</div>
          <div class="disclosure-attr-required">${t('disclosure.required')}</div>
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
          <div class="disclosure-attr-name" style="color:var(--color-text-secondary)">+ ${resolved.optional.length} ${t('disclosure.optionalData')}</div>
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
      ${t('disclosure.reviewAndShare')}
    </button>
    <button type="button" class="btn btn-text btn-full" id="disclosure-cancel">
      ${t('disclosure.decline')}
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
