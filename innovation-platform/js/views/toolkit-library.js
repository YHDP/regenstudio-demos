/**
 * Toolkit Library View — Browse all tools and templates
 */

import { i18n, t } from '../i18n.js';
import { navigate } from '../router.js';

function renderToolkitLibrary(container, processData) {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'portfolio-header';
  const h1 = document.createElement('h1');
  h1.textContent = i18n('toolkit.title');
  header.appendChild(h1);

  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-ghost';
  backBtn.innerHTML = `<span class="material-icons icon-sm">arrow_back</span> ${i18n('btn.back_to_portfolio')}`;
  backBtn.addEventListener('click', () => navigate('#portfolio'));
  header.appendChild(backBtn);

  container.appendChild(header);

  const desc = document.createElement('p');
  desc.className = 'text-sm text-muted mb-lg';
  desc.textContent = i18n('toolkit.description');
  container.appendChild(desc);

  // Canvas tools
  if (processData.canvasTypes) {
    const section = document.createElement('div');
    const sh = document.createElement('h2');
    sh.className = 'mb-md';
    sh.textContent = i18n('toolkit.canvas_tools');
    section.appendChild(sh);

    const grid = document.createElement('div');
    grid.className = 'portfolio-grid';

    for (const [id, canvas] of Object.entries(processData.canvasTypes)) {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cursor = 'default';

      const body = document.createElement('div');
      body.className = 'card-body';

      const nameEl = document.createElement('h3');
      nameEl.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:8px;';
      const icon = document.createElement('span');
      icon.className = 'material-icons';
      icon.textContent = canvas.icon || 'dashboard';
      icon.style.color = 'var(--ip-primary)';
      nameEl.appendChild(icon);
      nameEl.appendChild(document.createTextNode(t(canvas.name)));
      body.appendChild(nameEl);

      if (canvas.description) {
        const descEl = document.createElement('p');
        descEl.className = 'text-sm text-muted';
        descEl.textContent = t(canvas.description);
        body.appendChild(descEl);
      }

      // Fields preview
      if (canvas.fields && canvas.fields.length > 0) {
        const fieldsEl = document.createElement('div');
        fieldsEl.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px; margin-top:12px;';
        for (const field of canvas.fields.slice(0, 6)) {
          const chip = document.createElement('span');
          chip.className = 'task-tag';
          chip.textContent = t(field.name || field);
          fieldsEl.appendChild(chip);
        }
        if (canvas.fields.length > 6) {
          const more = document.createElement('span');
          more.className = 'task-tag';
          more.textContent = `+${canvas.fields.length - 6}`;
          fieldsEl.appendChild(more);
        }
        body.appendChild(fieldsEl);
      }

      card.appendChild(body);
      grid.appendChild(card);
    }

    section.appendChild(grid);
    container.appendChild(section);
  }
}

export { renderToolkitLibrary };
