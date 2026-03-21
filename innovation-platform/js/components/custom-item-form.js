// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Custom Item Form — Add custom task/tool/template
 */

import { i18n } from '../i18n.js';

/**
 * Show an inline form for adding a custom item (task, tool, template)
 * Returns a promise that resolves with { name, description } or null if cancelled
 */
function showCustomItemForm(container, options = {}) {
  return new Promise((resolve) => {
    const form = document.createElement('div');
    form.style.cssText = `
      padding: var(--space-md);
      border: 1px dashed var(--gray-300);
      border-radius: var(--radius-md);
      background: #FFFBF5;
      margin-top: var(--space-sm);
    `;

    const nameInput = document.createElement('input');
    nameInput.className = 'form-input';
    nameInput.placeholder = options.namePlaceholder || i18n('placeholder.item_name');
    nameInput.style.marginBottom = 'var(--space-sm)';
    form.appendChild(nameInput);

    if (options.showDescription !== false) {
      const descInput = document.createElement('textarea');
      descInput.className = 'form-textarea';
      descInput.placeholder = options.descPlaceholder || i18n('placeholder.item_description');
      descInput.rows = 2;
      descInput.style.marginBottom = 'var(--space-sm)';
      form.appendChild(descInput);
    }

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:8px; justify-content:flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-ghost btn-sm';
    cancelBtn.textContent = i18n('btn.cancel');
    cancelBtn.addEventListener('click', () => {
      form.remove();
      resolve(null);
    });

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary btn-sm';
    saveBtn.textContent = i18n('btn.add');
    saveBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }
      const desc = form.querySelector('textarea');
      form.remove();
      resolve({ name, description: desc ? desc.value.trim() : '' });
    });

    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveBtn.click();
      if (e.key === 'Escape') cancelBtn.click();
    });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    form.appendChild(btnRow);

    container.appendChild(form);
    nameInput.focus();
  });
}

export { showCustomItemForm };
