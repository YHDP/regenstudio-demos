import { td } from '../data/data-i18n.js';

export function createCredentialCard(credential, onClick) {
  const card = document.createElement('div');
  card.className = 'credential-card credential-card-animate';
  card.style.background = credential.color;

  const statusHtml = credential.status
    ? `<div class="credential-card-status">
        <span class="credential-card-status-dot" style="background:${credential.statusColor || '#fff'}"></span>
        ${td(credential.status)}
      </div>`
    : '';

  card.innerHTML = `
    <span class="material-icons credential-card-icon">${credential.icon}</span>
    <div class="credential-card-issuer">${td(credential.issuer)}</div>
    <div class="credential-card-title">${td(credential.title)}</div>
    <div class="credential-card-subtitle">${td(credential.subtitle)}</div>
    ${statusHtml}
  `;

  if (onClick) {
    card.addEventListener('click', () => onClick(credential));
  }

  return card;
}
