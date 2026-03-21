// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Tools Bar — Quick-launch chips for canvas tools
 */

import { i18n, t } from '../i18n.js';
import { navigate } from '../router.js';

function renderToolsBar(projectId, toolIds, processData) {
  const bar = document.createElement('div');
  bar.className = 'tools-bar';

  const label = document.createElement('span');
  label.className = 'text-xs text-muted';
  label.textContent = i18n('label.tools') + ':';
  label.style.cssText = 'align-self:center; margin-right:4px;';
  bar.appendChild(label);

  for (const toolId of toolIds) {
    const canvas = processData.canvasTypes ? processData.canvasTypes[toolId] : null;
    if (!canvas) continue;

    const chip = document.createElement('button');
    chip.className = 'tool-chip';

    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = canvas.icon || 'dashboard';
    chip.appendChild(icon);
    chip.appendChild(document.createTextNode(t(canvas.name)));

    chip.addEventListener('click', () => {
      navigate(`#project/${projectId}/tool/${toolId}`);
    });

    bar.appendChild(chip);
  }

  return bar;
}

export { renderToolsBar };
