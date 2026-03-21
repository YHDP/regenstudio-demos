// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Canvas Manager — Overlay controller for interactive tools
 *
 * Opens canvas tools as full-screen overlays.
 * Each canvas type has its own renderer that returns DOM elements.
 */

import { i18n, t } from '../i18n.js';
import { getCanvasData, setCanvasData, getProject } from '../state.js';
import { navigate } from '../router.js';
import { renderEmpathyMap } from './empathy-map.js';
import { renderStakeholderMap } from './stakeholder-map.js';
import { renderSymptomTree } from './symptom-tree.js';
import { renderQuickscan } from './quickscan.js';
import { renderTrlAssessment } from './trl-assessment.js';
import { renderIdeaMatrix } from './idea-matrix.js';
import { renderDmuCanvas } from './dmu-canvas.js';
import { renderPersonaBuilder } from './persona-builder.js';
import { renderUserRequirements } from './user-requirements.js';
import { renderEcosystemMap } from './ecosystem-map.js';

const canvasRenderers = {
  'empathy-map': renderEmpathyMap,
  'stakeholder-map': renderStakeholderMap,
  'symptom-tree': renderSymptomTree,
  'quickscan': renderQuickscan,
  'trl-assessment': renderTrlAssessment,
  'idea-matrix': renderIdeaMatrix,
  'dmu': renderDmuCanvas,
  'persona-builder': renderPersonaBuilder,
  'user-requirements': renderUserRequirements,
  'ecosystem-map': renderEcosystemMap
};

/**
 * Open a canvas tool overlay
 */
function openCanvas(projectId, toolType, processData) {
  const project = getProject(projectId);
  if (!project) return;

  const canvasDef = processData.canvasTypes ? processData.canvasTypes[toolType] : null;
  if (!canvasDef) {
    console.warn('canvas-manager: Unknown tool type:', toolType);
    return;
  }

  const renderer = canvasRenderers[toolType];
  if (!renderer) {
    showGenericCanvas(projectId, toolType, canvasDef);
    return;
  }

  // Find which phase this canvas is most associated with (use first linked phase, or 0)
  let phaseIndex = 0;
  for (let i = 0; i < (processData.phases || []).length; i++) {
    const phase = processData.phases[i];
    if (phase.taskGroups) {
      for (const group of phase.taskGroups) {
        for (const task of (group.tasks || [])) {
          if (task.linkedTools && task.linkedTools.includes(toolType)) {
            phaseIndex = i;
          }
        }
      }
    }
  }

  // Load existing data
  const existingData = getCanvasData(projectId, phaseIndex, toolType) || {};

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'canvas-overlay';

  // Header
  const header = document.createElement('div');
  header.className = 'canvas-header';

  const titleWrap = document.createElement('div');
  titleWrap.style.cssText = 'display:flex; align-items:center; gap:12px;';
  const icon = document.createElement('span');
  icon.className = 'material-icons';
  icon.textContent = canvasDef.icon || 'dashboard';
  icon.style.color = 'var(--ip-primary)';
  titleWrap.appendChild(icon);
  const title = document.createElement('h2');
  title.style.margin = '0';
  title.textContent = t(canvasDef.name);
  titleWrap.appendChild(title);
  header.appendChild(titleWrap);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-ghost';
  closeBtn.innerHTML = `<span class="material-icons">close</span>`;
  closeBtn.addEventListener('click', () => {
    overlay.remove();
    navigate(`#project/${projectId}`);
  });
  header.appendChild(closeBtn);
  overlay.appendChild(header);

  // Body — rendered by specific canvas
  const body = document.createElement('div');
  body.className = 'canvas-body';

  let currentData = { ...existingData };
  const onDataChange = (newData) => {
    currentData = { ...currentData, ...newData };
  };

  const canvasContent = renderer(canvasDef, currentData, onDataChange);
  body.appendChild(canvasContent);
  overlay.appendChild(body);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'canvas-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = i18n('btn.cancel');
  cancelBtn.addEventListener('click', () => {
    overlay.remove();
    navigate(`#project/${projectId}`);
  });
  footer.appendChild(cancelBtn);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary';
  saveBtn.innerHTML = `<span class="material-icons icon-sm">save</span> ${i18n('btn.save')}`;
  saveBtn.addEventListener('click', () => {
    setCanvasData(projectId, phaseIndex, toolType, currentData);
    overlay.remove();
    navigate(`#project/${projectId}`);
  });
  footer.appendChild(saveBtn);
  overlay.appendChild(footer);

  // Escape to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      navigate(`#project/${projectId}`);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  document.body.appendChild(overlay);
}

/**
 * Generic canvas for types without a specific renderer
 */
function showGenericCanvas(projectId, toolType, canvasDef) {
  const overlay = document.createElement('div');
  overlay.className = 'canvas-overlay';

  const header = document.createElement('div');
  header.className = 'canvas-header';
  const title = document.createElement('h2');
  title.textContent = t(canvasDef.name);
  title.style.margin = '0';
  header.appendChild(title);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-ghost';
  closeBtn.innerHTML = '<span class="material-icons">close</span>';
  closeBtn.addEventListener('click', () => {
    overlay.remove();
    navigate(`#project/${projectId}`);
  });
  header.appendChild(closeBtn);
  overlay.appendChild(header);

  const body = document.createElement('div');
  body.className = 'canvas-body';
  body.innerHTML = `
    <div class="empty-state">
      <span class="material-icons" style="color:var(--ip-primary);">${canvasDef.icon || 'dashboard'}</span>
      <h3>${t(canvasDef.name)}</h3>
      <p class="text-sm text-muted">${t(canvasDef.description) || i18n('canvas.generic_description')}</p>
    </div>
  `;
  overlay.appendChild(body);

  const footer = document.createElement('div');
  footer.className = 'canvas-footer';
  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-secondary';
  backBtn.textContent = i18n('btn.close');
  backBtn.addEventListener('click', () => {
    overlay.remove();
    navigate(`#project/${projectId}`);
  });
  footer.appendChild(backBtn);
  overlay.appendChild(footer);

  document.body.appendChild(overlay);
}

export { openCanvas };
