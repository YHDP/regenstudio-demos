export function createCredentialCard(credential, onClick) {
  const card = document.createElement('div');
  card.className = 'credential-card credential-card-animate';
  card.style.background = credential.color;

  const statusHtml = credential.status
    ? `<div class="credential-card-status">
        <span class="credential-card-status-dot" style="background:${credential.statusColor || '#fff'}"></span>
        ${credential.status}
      </div>`
    : '';

  card.innerHTML = `
    <span class="material-icons credential-card-icon">${credential.icon}</span>
    <div class="credential-card-issuer">${credential.issuer}</div>
    <div class="credential-card-title">${credential.title}</div>
    <div class="credential-card-subtitle">${credential.subtitle}</div>
    ${statusHtml}
  `;

  if (onClick) {
    card.addEventListener('click', () => onClick(credential));
  }

  return card;
}
