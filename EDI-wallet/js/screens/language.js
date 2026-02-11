import { navigate } from '../app.js';
import { setLanguage } from '../data/translations.js';

const languages = [
  { code: 'en', flag: '🇬🇧', name: 'English', native: 'English' },
  { code: 'nl', flag: '🇳🇱', name: 'Dutch', native: 'Nederlands' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese', native: 'Português' },
];

export function renderLanguage(container) {
  container.classList.add('language-screen');

  container.innerHTML = `
    <div class="language-header">
      <div class="language-icon">
        <span class="material-icons">translate</span>
      </div>
      <h2>Choose Language</h2>
      <p>Select your preferred language</p>
    </div>
    <div class="language-options" id="language-options"></div>
  `;

  const optionsEl = container.querySelector('#language-options');

  languages.forEach(lang => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'language-option';
    btn.innerHTML = `
      <span class="language-flag">${lang.flag}</span>
      <div class="language-label">
        <span class="language-native">${lang.native}</span>
        <span class="language-name">${lang.name}</span>
      </div>
      <span class="material-icons language-arrow">chevron_right</span>
    `;

    btn.addEventListener('click', () => {
      setLanguage(lang.code);

      // Visual feedback
      btn.classList.add('selected');
      setTimeout(() => {
        navigate('pin');
      }, 300);
    });

    optionsEl.appendChild(btn);
  });
}
