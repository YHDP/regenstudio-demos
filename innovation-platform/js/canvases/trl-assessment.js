// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * TRL Assessment — Technology Readiness Level visual scale
 */

import { i18n, t } from '../i18n.js';

const TRL_LEVELS = [
  { level: 1, label: { en: 'Basic principles observed', nl: 'Basisprincipes waargenomen', pt: 'Principios basicos observados' } },
  { level: 2, label: { en: 'Technology concept formulated', nl: 'Technologieconcept geformuleerd', pt: 'Conceito tecnologico formulado' } },
  { level: 3, label: { en: 'Experimental proof of concept', nl: 'Experimenteel bewijs van concept', pt: 'Prova de conceito experimental' } },
  { level: 4, label: { en: 'Technology validated in lab', nl: 'Technologie gevalideerd in lab', pt: 'Tecnologia validada em laboratorio' } },
  { level: 5, label: { en: 'Technology validated in relevant environment', nl: 'Technologie gevalideerd in relevante omgeving', pt: 'Tecnologia validada em ambiente relevante' } },
  { level: 6, label: { en: 'Technology demonstrated in relevant environment', nl: 'Technologie gedemonstreerd in relevante omgeving', pt: 'Tecnologia demonstrada em ambiente relevante' } },
  { level: 7, label: { en: 'System prototype in operational environment', nl: 'Systeemprototype in operationele omgeving', pt: 'Prototipo do sistema em ambiente operacional' } },
  { level: 8, label: { en: 'System complete and qualified', nl: 'Systeem compleet en gekwalificeerd', pt: 'Sistema completo e qualificado' } },
  { level: 9, label: { en: 'System proven in operational environment', nl: 'Systeem bewezen in operationele omgeving', pt: 'Sistema comprovado em ambiente operacional' } }
];

function renderTrlAssessment(canvasDef, data, onChange) {
  const container = document.createElement('div');

  // Component name
  const compRow = document.createElement('div');
  compRow.style.cssText = 'display:flex; align-items:center; gap:12px; margin-bottom:var(--space-lg);';
  const compLabel = document.createElement('label');
  compLabel.className = 'form-label';
  compLabel.textContent = i18n('canvas.component_name');
  const compInput = document.createElement('input');
  compInput.className = 'form-input';
  compInput.value = data.componentName || '';
  compInput.placeholder = i18n('placeholder.component_name');
  compInput.style.maxWidth = '400px';
  compInput.addEventListener('input', () => {
    data.componentName = compInput.value;
    onChange(data);
  });
  compRow.appendChild(compLabel);
  compRow.appendChild(compInput);
  container.appendChild(compRow);

  // Legend
  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex; gap:16px; margin-bottom:var(--space-md); font-size:var(--text-sm);';
  legend.innerHTML = `
    <span style="display:flex;align-items:center;gap:4px;">
      <span style="width:16px;height:16px;border-radius:50%;background:var(--ip-primary);display:inline-block;"></span>
      ${i18n('trl.current')}
    </span>
    <span style="display:flex;align-items:center;gap:4px;">
      <span style="width:16px;height:16px;border-radius:50%;background:var(--status-done);display:inline-block;"></span>
      ${i18n('trl.target')}
    </span>
  `;
  container.appendChild(legend);

  // Scale
  const scale = document.createElement('div');
  scale.className = 'trl-scale';

  for (const trl of TRL_LEVELS) {
    const level = document.createElement('div');
    level.className = 'trl-level';

    if (data.current === trl.level) level.classList.add('is-current');
    if (data.target === trl.level) level.classList.add('is-target');

    const num = document.createElement('div');
    num.className = 'trl-level__number';
    num.textContent = trl.level;
    level.appendChild(num);

    const info = document.createElement('div');
    info.style.flex = '1';
    const levelLabel = document.createElement('div');
    levelLabel.style.cssText = 'font-size:var(--text-sm); font-weight:500;';
    levelLabel.textContent = `TRL ${trl.level}`;
    info.appendChild(levelLabel);
    const levelDesc = document.createElement('div');
    levelDesc.style.cssText = 'font-size:var(--text-xs); color:var(--gray-500);';
    levelDesc.textContent = t(trl.label);
    info.appendChild(levelDesc);
    level.appendChild(info);

    // Buttons
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display:flex; gap:4px;';

    const currentBtn = document.createElement('button');
    currentBtn.className = 'btn btn-sm';
    currentBtn.style.cssText = `font-size:10px; padding:2px 8px; ${data.current === trl.level ? 'background:var(--ip-primary);color:white;' : 'background:var(--gray-100);color:var(--gray-500);'}`;
    currentBtn.textContent = i18n('trl.current_short');
    currentBtn.addEventListener('click', () => {
      data.current = data.current === trl.level ? null : trl.level;
      onChange(data);
      rerender();
    });
    btnGroup.appendChild(currentBtn);

    const targetBtn = document.createElement('button');
    targetBtn.className = 'btn btn-sm';
    targetBtn.style.cssText = `font-size:10px; padding:2px 8px; ${data.target === trl.level ? 'background:var(--status-done);color:white;' : 'background:var(--gray-100);color:var(--gray-500);'}`;
    targetBtn.textContent = i18n('trl.target_short');
    targetBtn.addEventListener('click', () => {
      data.target = data.target === trl.level ? null : trl.level;
      onChange(data);
      rerender();
    });
    btnGroup.appendChild(targetBtn);

    level.appendChild(btnGroup);
    scale.appendChild(level);
  }

  container.appendChild(scale);

  function rerender() {
    const parent = container.parentElement;
    if (!parent) return;
    container.innerHTML = '';
    const newContent = renderTrlAssessment(canvasDef, data, onChange);
    while (newContent.firstChild) container.appendChild(newContent.firstChild);
  }

  return container;
}

export { renderTrlAssessment };
