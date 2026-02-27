/**
 * Portfolio View — Dashboard with project cards
 */

import { i18n } from '../i18n.js';
import { getProjects } from '../state.js';
import { createProjectCard, createNewProjectCard } from '../components/project-card.js';

function renderPortfolio(container, processData) {
  container.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'portfolio-header';

  const titleWrap = document.createElement('div');
  const h1 = document.createElement('h1');
  h1.textContent = i18n('portfolio.title');
  titleWrap.appendChild(h1);
  const subtitle = document.createElement('p');
  subtitle.className = 'text-sm text-muted mt-sm';
  subtitle.textContent = i18n('portfolio.subtitle');
  titleWrap.appendChild(subtitle);
  header.appendChild(titleWrap);

  container.appendChild(header);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'portfolio-grid';

  const projects = getProjects();

  for (const project of projects) {
    const card = createProjectCard(project, processData);
    grid.appendChild(card);
  }

  // New project card
  grid.appendChild(createNewProjectCard());

  container.appendChild(grid);
}

export { renderPortfolio };
