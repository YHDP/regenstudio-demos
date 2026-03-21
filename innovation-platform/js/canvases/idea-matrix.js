// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Idea Matrix — Sub-problems x ideas grid
 */

import { i18n, t } from '../i18n.js';

function renderIdeaMatrix(canvasDef, data, onChange) {
  const container = document.createElement('div');
  container.className = 'idea-matrix';

  if (!data.subProblems) data.subProblems = [''];
  if (!data.ideas) data.ideas = [{ name: '', cells: {} }];

  function rebuild() {
    container.innerHTML = '';

    // Controls
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex; gap:8px; margin-bottom:var(--space-md);';
    const addProblemBtn = document.createElement('button');
    addProblemBtn.className = 'btn btn-secondary btn-sm';
    addProblemBtn.innerHTML = `<span class="material-icons icon-sm">add</span> ${i18n('canvas.add_sub_problem')}`;
    addProblemBtn.addEventListener('click', () => {
      data.subProblems.push('');
      onChange(data);
      rebuild();
    });
    controls.appendChild(addProblemBtn);

    const addIdeaBtn = document.createElement('button');
    addIdeaBtn.className = 'btn btn-secondary btn-sm';
    addIdeaBtn.innerHTML = `<span class="material-icons icon-sm">add</span> ${i18n('canvas.add_idea')}`;
    addIdeaBtn.addEventListener('click', () => {
      data.ideas.push({ name: '', cells: {} });
      onChange(data);
      rebuild();
    });
    controls.appendChild(addIdeaBtn);
    container.appendChild(controls);

    // Table
    const table = document.createElement('table');
    // Header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('th');
    cornerCell.textContent = i18n('canvas.sub_problems');
    cornerCell.style.minWidth = '150px';
    headerRow.appendChild(cornerCell);

    for (let i = 0; i < data.ideas.length; i++) {
      const th = document.createElement('th');
      th.style.minWidth = '120px';
      const inp = document.createElement('input');
      inp.className = 'form-input';
      inp.style.cssText = 'font-size:11px; padding:2px 6px; width:100%;';
      inp.placeholder = `${i18n('canvas.idea')} ${i + 1}`;
      inp.value = data.ideas[i].name;
      inp.addEventListener('input', () => {
        data.ideas[i].name = inp.value;
        onChange(data);
      });
      th.appendChild(inp);
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body rows
    const tbody = document.createElement('tbody');
    for (let pi = 0; pi < data.subProblems.length; pi++) {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      const labelInput = document.createElement('input');
      labelInput.className = 'form-input';
      labelInput.style.cssText = 'font-size:11px; padding:2px 6px; width:100%;';
      labelInput.placeholder = `${i18n('canvas.sub_problem')} ${pi + 1}`;
      labelInput.value = data.subProblems[pi];
      labelInput.addEventListener('input', () => {
        data.subProblems[pi] = labelInput.value;
        onChange(data);
      });
      labelCell.appendChild(labelInput);
      row.appendChild(labelCell);

      for (let ii = 0; ii < data.ideas.length; ii++) {
        const cell = document.createElement('td');
        const cellKey = `${pi}-${ii}`;
        const textarea = document.createElement('textarea');
        textarea.style.cssText = 'width:100%; min-height:40px; border:none; font-size:11px; resize:vertical; padding:4px;';
        textarea.placeholder = '...';
        textarea.value = (data.ideas[ii].cells && data.ideas[ii].cells[cellKey]) || '';
        textarea.addEventListener('input', () => {
          if (!data.ideas[ii].cells) data.ideas[ii].cells = {};
          data.ideas[ii].cells[cellKey] = textarea.value;
          onChange(data);
        });
        cell.appendChild(textarea);
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    container.appendChild(table);
  }

  rebuild();
  return container;
}

export { renderIdeaMatrix };
