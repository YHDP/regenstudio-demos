export function createAppBar(title, onBack, actionIcon, onAction) {
  const bar = document.createElement('div');
  bar.className = 'app-bar';

  let html = '';

  if (onBack) {
    html += `<button type="button" class="app-bar-back"><span class="material-icons">arrow_back</span></button>`;
  }

  html += `<div class="app-bar-title">${title}</div>`;

  if (actionIcon) {
    html += `<button type="button" class="app-bar-action"><span class="material-icons">${actionIcon}</span></button>`;
  }

  bar.innerHTML = html;

  if (onBack) {
    bar.querySelector('.app-bar-back').addEventListener('click', onBack);
  }

  if (onAction) {
    bar.querySelector('.app-bar-action')?.addEventListener('click', onAction);
  }

  return bar;
}
