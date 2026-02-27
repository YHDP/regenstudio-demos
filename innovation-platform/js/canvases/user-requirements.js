/**
 * User Requirements Canvas — Structured requirements matrix
 */

import { i18n, t } from '../i18n.js';

const DIMENSIONS = [
  { key: 'functional', icon: 'settings', label: { en: 'Functional', nl: 'Functioneel', pt: 'Funcional' } },
  { key: 'usability', icon: 'touch_app', label: { en: 'Usability', nl: 'Bruikbaarheid', pt: 'Usabilidade' } },
  { key: 'performance', icon: 'speed', label: { en: 'Performance', nl: 'Prestatie', pt: 'Desempenho' } },
  { key: 'security', icon: 'security', label: { en: 'Security & Privacy', nl: 'Security & Privacy', pt: 'Seguranca e Privacidade' } }
];

function renderUserRequirements(canvasDef, data, onChange) {
  const container = document.createElement('div');

  for (const dim of DIMENSIONS) {
    if (!data[dim.key]) data[dim.key] = [];

    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom:var(--space-lg);';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:600;';
    const icon = document.createElement('span');
    icon.className = 'material-icons icon-sm';
    icon.textContent = dim.icon;
    icon.style.color = 'var(--ip-primary)';
    header.appendChild(icon);
    header.appendChild(document.createTextNode(t(dim.label)));
    section.appendChild(header);

    const items = document.createElement('div');
    items.style.cssText = 'display:flex; flex-direction:column; gap:4px;';

    function renderItems() {
      items.innerHTML = '';
      for (let i = 0; i < data[dim.key].length; i++) {
        const item = document.createElement('div');
        item.className = 'canvas-item';
        const text = document.createElement('span');
        text.className = 'canvas-item__text';
        text.textContent = data[dim.key][i];
        item.appendChild(text);
        const del = document.createElement('button');
        del.className = 'canvas-item__remove';
        del.innerHTML = '&times;';
        del.addEventListener('click', () => {
          data[dim.key].splice(i, 1);
          onChange(data);
          renderItems();
        });
        item.appendChild(del);
        items.appendChild(item);
      }
    }
    renderItems();
    section.appendChild(items);

    const addInput = document.createElement('input');
    addInput.className = 'canvas-add-input';
    addInput.placeholder = i18n('placeholder.add_requirement');
    addInput.style.marginTop = '8px';
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && addInput.value.trim()) {
        data[dim.key].push(addInput.value.trim());
        onChange(data);
        renderItems();
        addInput.value = '';
      }
    });
    section.appendChild(addInput);

    container.appendChild(section);
  }

  return container;
}

export { renderUserRequirements };
