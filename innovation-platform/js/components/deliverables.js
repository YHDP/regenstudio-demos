/**
 * Deliverables Checklist
 */

import { i18n, t } from '../i18n.js';
import { isDeliverableChecked, toggleDeliverable } from '../state.js';

function renderDeliverables(projectId, phaseIndex, deliverables) {
  const section = document.createElement('div');
  section.className = 'deliverables-section';

  const header = document.createElement('h4');
  header.textContent = i18n('label.deliverables');
  section.appendChild(header);

  for (const deliv of deliverables) {
    const item = document.createElement('label');
    item.className = 'checkbox-item';

    const checked = isDeliverableChecked(projectId, phaseIndex, deliv.id);
    if (checked) item.classList.add('is-checked');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = checked;
    cb.addEventListener('change', () => {
      toggleDeliverable(projectId, phaseIndex, deliv.id);
      item.classList.toggle('is-checked');
    });
    item.appendChild(cb);

    const label = document.createElement('span');
    label.className = 'checkbox-label';
    label.textContent = t(deliv.name);
    item.appendChild(label);

    section.appendChild(item);
  }

  return section;
}

export { renderDeliverables };
