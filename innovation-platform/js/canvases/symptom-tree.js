/**
 * Symptom Tree Canvas — 7M categorized problem symptoms
 * Based on the Ishikawa (fishbone) diagram categories adapted for government context
 */

import { i18n, t } from '../i18n.js';

const CATEGORIES = [
  { key: 'people', icon: 'people', label: { en: 'People', nl: 'Mensen', pt: 'Pessoas' } },
  { key: 'process', icon: 'account_tree', label: { en: 'Process', nl: 'Proces', pt: 'Processo' } },
  { key: 'policy', icon: 'gavel', label: { en: 'Policy & Rules', nl: 'Beleid & Regels', pt: 'Politica e Regras' } },
  { key: 'technology', icon: 'devices', label: { en: 'Technology', nl: 'Technologie', pt: 'Tecnologia' } },
  { key: 'organization', icon: 'corporate_fare', label: { en: 'Organization', nl: 'Organisatie', pt: 'Organizacao' } },
  { key: 'environment', icon: 'public', label: { en: 'Environment', nl: 'Omgeving', pt: 'Ambiente' } },
  { key: 'resources', icon: 'paid', label: { en: 'Resources', nl: 'Middelen', pt: 'Recursos' } }
];

function renderSymptomTree(canvasDef, data, onChange) {
  const container = document.createElement('div');
  container.className = 'symptom-tree';

  // Problem statement
  const problemRow = document.createElement('div');
  problemRow.style.cssText = 'padding:var(--space-md); background:var(--ip-primary-bg); border-radius:var(--radius-md); margin-bottom:var(--space-md);';
  const problemLabel = document.createElement('label');
  problemLabel.className = 'form-label';
  problemLabel.textContent = i18n('canvas.problem_statement');
  problemLabel.style.marginBottom = 'var(--space-xs)';
  problemLabel.style.display = 'block';
  const problemInput = document.createElement('textarea');
  problemInput.className = 'form-textarea';
  problemInput.value = data.problemStatement || '';
  problemInput.rows = 2;
  problemInput.placeholder = i18n('placeholder.problem_statement');
  problemInput.addEventListener('input', () => {
    data.problemStatement = problemInput.value;
    onChange(data);
  });
  problemRow.appendChild(problemLabel);
  problemRow.appendChild(problemInput);
  container.appendChild(problemRow);

  // Categories
  for (const cat of CATEGORIES) {
    const catEl = renderCategory(cat, data, onChange);
    container.appendChild(catEl);
  }

  // Uncategorized
  const uncatEl = renderCategory(
    { key: 'other', icon: 'more_horiz', label: { en: 'Other', nl: 'Overig', pt: 'Outro' } },
    data, onChange
  );
  container.appendChild(uncatEl);

  return container;
}

function renderCategory(category, data, onChange) {
  const el = document.createElement('div');
  el.className = 'symptom-category';

  const key = category.key;
  if (!data[key]) data[key] = [];

  const header = document.createElement('div');
  header.className = 'symptom-category__header';
  const icon = document.createElement('span');
  icon.className = 'material-icons icon-sm';
  icon.textContent = category.icon;
  header.appendChild(icon);
  header.appendChild(document.createTextNode(t(category.label)));

  const count = document.createElement('span');
  count.className = 'text-xs text-muted';
  count.style.marginLeft = 'auto';
  count.textContent = `(${data[key].length})`;
  header.appendChild(count);
  el.appendChild(header);

  const body = document.createElement('div');
  body.className = 'symptom-category__body';

  const itemsList = document.createElement('div');
  itemsList.style.cssText = 'display:flex; flex-direction:column; gap:4px;';

  function renderItems() {
    itemsList.innerHTML = '';
    count.textContent = `(${data[key].length})`;
    for (let i = 0; i < data[key].length; i++) {
      const item = document.createElement('div');
      item.className = 'canvas-item';
      const text = document.createElement('span');
      text.className = 'canvas-item__text';
      text.textContent = data[key][i];
      item.appendChild(text);
      const del = document.createElement('button');
      del.className = 'canvas-item__remove';
      del.innerHTML = '&times;';
      del.addEventListener('click', () => {
        data[key].splice(i, 1);
        onChange(data);
        renderItems();
      });
      item.appendChild(del);
      itemsList.appendChild(item);
    }
  }
  renderItems();
  body.appendChild(itemsList);

  // Add input
  const addInput = document.createElement('input');
  addInput.className = 'canvas-add-input';
  addInput.placeholder = i18n('placeholder.add_symptom');
  addInput.style.marginTop = 'var(--space-sm)';
  addInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && addInput.value.trim()) {
      data[key].push(addInput.value.trim());
      onChange(data);
      renderItems();
      addInput.value = '';
    }
  });
  body.appendChild(addInput);

  el.appendChild(body);
  return el;
}

export { renderSymptomTree };
