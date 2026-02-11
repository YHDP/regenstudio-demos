import { navigate } from '../app.js';

export function createBottomNav(activeTab = 'cards') {
  const nav = document.createElement('div');
  nav.className = 'bottom-nav';

  const tabs = [
    { id: 'cards', icon: 'credit_card', label: 'Kaarten', screen: 'dashboard' },
    { id: 'add', icon: 'add_circle_outline', label: 'Toevoegen', screen: 'add-credential' },
    { id: 'share', icon: 'share', label: 'Delen', screen: 'share-select' },
    { id: 'history', icon: 'history', label: 'Activiteit', screen: null },
  ];

  tabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-item' + (tab.id === activeTab ? ' active' : '');
    btn.innerHTML = `
      <span class="material-icons">${tab.icon}</span>
      <span>${tab.label}</span>
    `;

    btn.addEventListener('click', () => {
      if (!tab.screen || tab.id === activeTab) return;
      const direction = tab.id === 'cards' ? 'back' : 'forward';
      navigate(tab.screen, direction);
    });

    nav.appendChild(btn);
  });

  return nav;
}
