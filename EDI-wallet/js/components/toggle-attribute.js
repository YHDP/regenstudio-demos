import { t } from '../data/translations.js';
import { td } from '../data/data-i18n.js';

export function createToggleAttribute(attr, isOn, isLocked, onToggle) {
  const row = document.createElement('div');
  row.className = 'disclosure-attr';

  const info = document.createElement('div');
  info.className = 'disclosure-attr-info';
  info.innerHTML = `
    <div class="disclosure-attr-name">${td(attr.key)}</div>
    <div class="disclosure-attr-value">${td(attr.value)}</div>
    ${isLocked ? `<div class="disclosure-attr-required">${t('disclosure.required')}</div>` : ''}
  `;

  const toggle = document.createElement('div');
  toggle.className = 'toggle';

  const track = document.createElement('div');
  track.className = 'toggle-track' + (isOn ? ' active' : '') + (isLocked ? ' locked' : '');

  const thumb = document.createElement('div');
  thumb.className = 'toggle-thumb';

  track.appendChild(thumb);
  toggle.appendChild(track);

  if (!isLocked) {
    toggle.addEventListener('click', () => {
      const newState = !track.classList.contains('active');
      track.classList.toggle('active', newState);
      onToggle(attr.key, newState);
    });
  }

  row.appendChild(info);
  row.appendChild(toggle);

  return row;
}
