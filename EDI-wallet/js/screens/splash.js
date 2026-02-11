import { navigate } from '../app.js';

export function renderSplash(container) {
  container.classList.add('splash-screen');

  container.innerHTML = `
    <div class="splash-logo">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Wallet body — triangles -->
        <polygon points="6,38 24,18 42,38" fill="#383EDE"/>
        <polygon points="10,38 24,22 38,38" fill="#2D32B3"/>
        <!-- Flap -->
        <polygon points="12,24 24,10 36,24" fill="#383EDE" opacity="0.85"/>
        <polygon points="16,24 24,14 32,24" fill="#5781A1" opacity="0.5"/>
        <!-- Card chip -->
        <polygon points="20,32 24,28 28,32" fill="#FFA92D" opacity="0.8"/>
        <polygon points="20,32 24,36 28,32" fill="#E5942A" opacity="0.6"/>
        <!-- Shield accent -->
        <polygon points="34,20 37,15 40,20" fill="#00914B" opacity="0.7"/>
      </svg>
    </div>
    <div class="splash-title">EDI Wallet</div>
    <div class="splash-subtitle">Your European Digital Identity</div>
  `;

  setTimeout(() => {
    navigate('language');
  }, 2000);
}
