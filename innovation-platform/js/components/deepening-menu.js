// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Deepening Menu — Situational deepening options with subtasks
 */

import { i18n, t } from '../i18n.js';
import { isDeepActive, toggleDeepening, isSubtaskChecked, toggleSubtask } from '../state.js';

function renderDeepeningMenu(projectId, phaseIndex, deepeningOptions) {
  const section = document.createElement('div');
  section.className = 'deepening-menu';

  const header = document.createElement('div');
  header.className = 'task-group__header';
  header.textContent = i18n('label.deepening_options');
  section.appendChild(header);

  const desc = document.createElement('p');
  desc.className = 'text-sm text-muted';
  desc.style.marginBottom = 'var(--space-md)';
  desc.textContent = i18n('deepening.description');
  section.appendChild(desc);

  for (const option of deepeningOptions) {
    const optEl = document.createElement('div');
    optEl.className = 'deepening-option';
    const active = isDeepActive(projectId, phaseIndex, option.id);
    if (active) optEl.classList.add('is-active');

    // Header row
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex; align-items:center; gap:8px; width:100%; cursor:pointer;';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = active;
    checkbox.style.cssText = 'width:16px; height:16px; accent-color:var(--ip-primary);';

    const name = document.createElement('div');
    name.className = 'deepening-option__name';
    name.textContent = t(option.name);

    const chevron = document.createElement('span');
    chevron.className = 'material-icons icon-sm';
    chevron.textContent = active ? 'expand_less' : 'expand_more';
    chevron.style.cssText = 'margin-left:auto; color:var(--gray-400);';

    headerRow.appendChild(checkbox);
    headerRow.appendChild(name);
    headerRow.appendChild(chevron);

    headerRow.addEventListener('click', (e) => {
      if (e.target === checkbox) return;
      checkbox.checked = !checkbox.checked;
      toggleDeepening(projectId, phaseIndex, option.id);
      optEl.classList.toggle('is-active');
      chevron.textContent = optEl.classList.contains('is-active') ? 'expand_less' : 'expand_more';
    });

    checkbox.addEventListener('change', () => {
      toggleDeepening(projectId, phaseIndex, option.id);
      optEl.classList.toggle('is-active');
      chevron.textContent = optEl.classList.contains('is-active') ? 'expand_less' : 'expand_more';
    });

    optEl.appendChild(headerRow);

    // Description
    if (option.description) {
      const descEl = document.createElement('div');
      descEl.className = 'deepening-option__subtasks';
      const descText = document.createElement('p');
      descText.className = 'text-sm text-muted';
      descText.textContent = t(option.description);
      descText.style.marginBottom = 'var(--space-sm)';
      descEl.appendChild(descText);

      // Subtasks
      if (option.subtasks && option.subtasks.length > 0) {
        const list = document.createElement('ul');
        list.style.cssText = 'list-style:none; padding:0;';
        for (const sub of option.subtasks) {
          const li = document.createElement('li');
          li.className = 'task-item__subtask';
          const subCb = document.createElement('input');
          subCb.type = 'checkbox';
          const subId = `deep-${option.id}/${typeof sub === 'string' ? sub : (sub.id || sub.en || t(sub))}`;
          subCb.checked = isSubtaskChecked(projectId, phaseIndex, subId);
          subCb.addEventListener('change', () => toggleSubtask(projectId, phaseIndex, subId));
          li.appendChild(subCb);
          const subText = document.createElement('span');
          subText.textContent = typeof sub === 'string' ? sub : t(sub);
          li.appendChild(subText);
          list.appendChild(li);
        }
        descEl.appendChild(list);
      }

      optEl.appendChild(descEl);
    }

    section.appendChild(optEl);
  }

  return section;
}

export { renderDeepeningMenu };
