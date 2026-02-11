import { navigate } from '../app.js';
import { setState } from '../data/state.js';
import { getAllCredentials } from '../data/credentials.js';
import { createCredentialCard } from '../components/credential-card.js';
import { createBottomNav } from '../components/bottom-nav.js';

export function renderDashboard(container) {
  container.classList.add('dashboard-screen');

  const content = document.createElement('div');
  content.className = 'screen-content';
  content.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-greeting">Goedendag,</div>
      <h2 class="dashboard-title">Jan de Vries</h2>
    </div>
    <div class="dashboard-grid" id="dashboard-grid"></div>
  `;

  const grid = content.querySelector('#dashboard-grid');

  getAllCredentials().forEach(cred => {
    const card = createCredentialCard(cred, (c) => {
      setState({ selectedCredential: c.id });
      navigate('credential-detail');
    });
    grid.appendChild(card);
  });

  container.appendChild(content);
  container.appendChild(createBottomNav('cards'));
}
