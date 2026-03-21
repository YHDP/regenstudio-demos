// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Stakeholder Map — List-based stakeholder mapping with power/interest categorization
 */

import { i18n, t } from '../i18n.js';

const QUADRANTS = [
  { key: 'high-high', label: { en: 'High Power, High Interest (Manage Closely)', nl: 'Hoge Macht, Hoog Belang (Nauw Betrekken)', pt: 'Alto Poder, Alto Interesse (Gerir de Perto)' }, color: 'var(--phase-1)' },
  { key: 'high-low', label: { en: 'High Power, Low Interest (Keep Satisfied)', nl: 'Hoge Macht, Laag Belang (Tevreden Houden)', pt: 'Alto Poder, Baixo Interesse (Manter Satisfeito)' }, color: 'var(--phase-2)' },
  { key: 'low-high', label: { en: 'Low Power, High Interest (Keep Informed)', nl: 'Lage Macht, Hoog Belang (Informeren)', pt: 'Baixo Poder, Alto Interesse (Manter Informado)' }, color: 'var(--phase-3)' },
  { key: 'low-low', label: { en: 'Low Power, Low Interest (Monitor)', nl: 'Lage Macht, Laag Belang (Monitoren)', pt: 'Baixo Poder, Baixo Interesse (Monitorar)' }, color: 'var(--gray-500)' }
];

function renderStakeholderMap(canvasDef, data, onChange) {
  const container = document.createElement('div');

  const grid = document.createElement('div');
  grid.className = 'canvas-grid canvas-grid--2x2';
  grid.style.minHeight = '400px';

  for (const q of QUADRANTS) {
    const cell = document.createElement('div');
    cell.className = 'canvas-cell';

    const header = document.createElement('div');
    header.className = 'canvas-cell__header';
    header.style.color = q.color;
    header.style.fontSize = 'var(--text-xs)';
    header.textContent = t(q.label);
    cell.appendChild(header);

    if (!data[q.key]) data[q.key] = [];

    const items = document.createElement('div');
    items.className = 'canvas-cell__items';

    function renderItems() {
      items.innerHTML = '';
      for (let i = 0; i < data[q.key].length; i++) {
        const item = document.createElement('div');
        item.className = 'canvas-item';
        const text = document.createElement('span');
        text.className = 'canvas-item__text';
        text.textContent = data[q.key][i];
        item.appendChild(text);
        const del = document.createElement('button');
        del.className = 'canvas-item__remove';
        del.innerHTML = '&times;';
        del.addEventListener('click', () => {
          data[q.key].splice(i, 1);
          onChange(data);
          renderItems();
        });
        item.appendChild(del);
        items.appendChild(item);
      }
    }
    renderItems();
    cell.appendChild(items);

    const addInput = document.createElement('input');
    addInput.className = 'canvas-add-input';
    addInput.placeholder = i18n('placeholder.add_stakeholder');
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && addInput.value.trim()) {
        data[q.key].push(addInput.value.trim());
        onChange(data);
        renderItems();
        addInput.value = '';
      }
    });
    const addDiv = document.createElement('div');
    addDiv.className = 'canvas-cell__add';
    addDiv.appendChild(addInput);
    cell.appendChild(addDiv);

    grid.appendChild(cell);
  }

  container.appendChild(grid);
  return container;
}

export { renderStakeholderMap };
