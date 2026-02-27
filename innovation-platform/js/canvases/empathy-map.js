/**
 * Empathy Map Canvas — Grid-based input for stakeholder empathy mapping
 */

import { i18n, t } from '../i18n.js';

const QUADRANTS = [
  { key: 'thinks', icon: 'psychology', label: { en: 'Thinks', nl: 'Denkt', pt: 'Pensa' } },
  { key: 'feels', icon: 'favorite', label: { en: 'Feels', nl: 'Voelt', pt: 'Sente' } },
  { key: 'says', icon: 'chat', label: { en: 'Says', nl: 'Zegt', pt: 'Diz' } },
  { key: 'does', icon: 'directions_run', label: { en: 'Does', nl: 'Doet', pt: 'Faz' } },
  { key: 'sees', icon: 'visibility', label: { en: 'Sees', nl: 'Ziet', pt: 'Ve' } },
  { key: 'hears', icon: 'hearing', label: { en: 'Hears', nl: 'Hoort', pt: 'Ouve' } },
  { key: 'pains', icon: 'sentiment_dissatisfied', label: { en: 'Pains', nl: 'Pijnpunten', pt: 'Dores' } },
  { key: 'gains', icon: 'sentiment_satisfied', label: { en: 'Gains', nl: 'Voordelen', pt: 'Ganhos' } },
  { key: 'needs', icon: 'lightbulb', label: { en: 'Needs', nl: 'Behoeften', pt: 'Necessidades' } }
];

function renderEmpathyMap(canvasDef, data, onChange) {
  const container = document.createElement('div');

  // Stakeholder name input
  const nameRow = document.createElement('div');
  nameRow.style.cssText = 'display:flex; align-items:center; gap:12px; margin-bottom:var(--space-lg);';
  const nameLabel = document.createElement('label');
  nameLabel.className = 'form-label';
  nameLabel.textContent = i18n('canvas.stakeholder_name');
  const nameInput = document.createElement('input');
  nameInput.className = 'form-input';
  nameInput.value = data.stakeholderName || '';
  nameInput.placeholder = i18n('placeholder.stakeholder_name');
  nameInput.style.maxWidth = '300px';
  nameInput.addEventListener('input', () => {
    data.stakeholderName = nameInput.value;
    onChange(data);
  });
  nameRow.appendChild(nameLabel);
  nameRow.appendChild(nameInput);
  container.appendChild(nameRow);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'canvas-grid canvas-grid--3x3';

  for (const q of QUADRANTS) {
    const cell = createQuadrantCell(q, data, onChange);
    grid.appendChild(cell);
  }

  container.appendChild(grid);
  return container;
}

function createQuadrantCell(quadrant, data, onChange) {
  const cell = document.createElement('div');
  cell.className = 'canvas-cell';

  const header = document.createElement('div');
  header.className = 'canvas-cell__header';
  const icon = document.createElement('span');
  icon.className = 'material-icons';
  icon.textContent = quadrant.icon;
  header.appendChild(icon);
  header.appendChild(document.createTextNode(t(quadrant.label)));
  cell.appendChild(header);

  const items = document.createElement('div');
  items.className = 'canvas-cell__items';

  // Load existing items
  const key = quadrant.key;
  if (!data[key]) data[key] = [];

  for (let i = 0; i < data[key].length; i++) {
    items.appendChild(createCanvasItem(data[key][i], () => {
      data[key].splice(i, 1);
      onChange(data);
      renderItems();
    }));
  }

  function renderItems() {
    items.innerHTML = '';
    for (let i = 0; i < data[key].length; i++) {
      items.appendChild(createCanvasItem(data[key][i], () => {
        data[key].splice(i, 1);
        onChange(data);
        renderItems();
      }));
    }
  }

  cell.appendChild(items);

  // Add input
  const addDiv = document.createElement('div');
  addDiv.className = 'canvas-cell__add';
  const addInput = document.createElement('input');
  addInput.className = 'canvas-add-input';
  addInput.placeholder = i18n('placeholder.add_item');
  addInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && addInput.value.trim()) {
      data[key].push(addInput.value.trim());
      onChange(data);
      renderItems();
      addInput.value = '';
    }
  });
  addDiv.appendChild(addInput);
  cell.appendChild(addDiv);

  return cell;
}

function createCanvasItem(text, onRemove) {
  const item = document.createElement('div');
  item.className = 'canvas-item';
  const textEl = document.createElement('span');
  textEl.className = 'canvas-item__text';
  textEl.textContent = text;
  item.appendChild(textEl);
  const removeBtn = document.createElement('button');
  removeBtn.className = 'canvas-item__remove';
  removeBtn.innerHTML = '&times;';
  removeBtn.addEventListener('click', onRemove);
  item.appendChild(removeBtn);
  return item;
}

export { renderEmpathyMap };
