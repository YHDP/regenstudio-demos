import { navigate } from '../app.js';

export function renderSplash(container) {
  container.classList.add('splash-screen');

  container.innerHTML = `
    <div class="splash-logo">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="36" height="28" rx="4" fill="#383EDE"/>
        <rect x="10" y="14" width="16" height="4" rx="1" fill="#fff" opacity="0.9"/>
        <rect x="10" y="21" width="28" height="3" rx="1" fill="#fff" opacity="0.5"/>
        <rect x="10" y="27" width="20" height="3" rx="1" fill="#fff" opacity="0.5"/>
        <circle cx="36" cy="16" r="4" fill="#fff" opacity="0.8"/>
      </svg>
    </div>
    <div class="splash-title">NL Wallet</div>
    <div class="splash-subtitle">Jouw digitale identiteit</div>
  `;

  setTimeout(() => {
    navigate('pin');
  }, 2000);
}
