// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Persona Builder — Structured persona form
 */

import { i18n, t } from '../i18n.js';

const FIELDS = [
  { key: 'name', label: { en: 'Name', nl: 'Naam', pt: 'Nome' }, type: 'text' },
  { key: 'role', label: { en: 'Role / Title', nl: 'Rol / Titel', pt: 'Funcao / Titulo' }, type: 'text' },
  { key: 'age', label: { en: 'Age', nl: 'Leeftijd', pt: 'Idade' }, type: 'text' },
  { key: 'background', label: { en: 'Background', nl: 'Achtergrond', pt: 'Contexto' }, type: 'textarea' },
  { key: 'goals', label: { en: 'Goals', nl: 'Doelen', pt: 'Objetivos' }, type: 'textarea' },
  { key: 'frustrations', label: { en: 'Frustrations', nl: 'Frustraties', pt: 'Frustracoes' }, type: 'textarea' },
  { key: 'needs', label: { en: 'Needs', nl: 'Behoeften', pt: 'Necessidades' }, type: 'textarea' },
  { key: 'quote', label: { en: 'Characteristic Quote', nl: 'Kenmerkend Citaat', pt: 'Citacao Caracteristica' }, type: 'text' }
];

function renderPersonaBuilder(canvasDef, data, onChange) {
  const container = document.createElement('div');
  container.className = 'persona-form';

  // Photo placeholder
  const photoDiv = document.createElement('div');
  photoDiv.className = 'persona-photo';
  const photoIcon = document.createElement('span');
  photoIcon.className = 'material-icons';
  photoIcon.textContent = 'person';
  photoIcon.style.cssText = 'font-size:64px; color:var(--gray-300);';
  photoDiv.appendChild(photoIcon);

  if (data.name) {
    photoIcon.textContent = '';
    photoIcon.style.cssText = 'font-size:48px; color:var(--ip-primary); font-weight:700; font-family:var(--font-sans);';
    photoIcon.textContent = data.name.charAt(0).toUpperCase();
  }
  container.appendChild(photoDiv);

  // Fields
  const fields = document.createElement('div');
  fields.className = 'persona-fields';

  for (const field of FIELDS) {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = t(field.label);
    group.appendChild(label);

    let input;
    if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'form-textarea';
      input.rows = 2;
    } else {
      input = document.createElement('input');
      input.className = 'form-input';
      input.type = 'text';
    }
    input.value = data[field.key] || '';
    input.addEventListener('input', () => {
      data[field.key] = input.value;
      onChange(data);

      // Update photo initial
      if (field.key === 'name') {
        photoIcon.textContent = input.value ? input.value.charAt(0).toUpperCase() : 'person';
        photoIcon.style.cssText = input.value
          ? 'font-size:48px; color:var(--ip-primary); font-weight:700; font-family:var(--font-sans);'
          : 'font-size:64px; color:var(--gray-300);';
        photoIcon.className = input.value ? '' : 'material-icons';
      }
    });
    group.appendChild(input);
    fields.appendChild(group);
  }

  container.appendChild(fields);
  return container;
}

export { renderPersonaBuilder };
