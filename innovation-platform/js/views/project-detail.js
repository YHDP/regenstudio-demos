// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Project Detail View — Main project view with phase accordions
 */

import { i18n, t } from '../i18n.js';
import { getProject } from '../state.js';
import { navigate } from '../router.js';
import { createPhaseAccordion } from '../components/phase-accordion.js';

function renderProjectDetail(container, params, processData) {
  container.innerHTML = '';

  const project = getProject(params.projectId);
  if (!project) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-icons">search_off</span>
        <h3>${i18n('error.project_not_found')}</h3>
        <button class="btn btn-primary mt-md" onclick="location.hash='#portfolio'">${i18n('btn.back_to_portfolio')}</button>
      </div>
    `;
    return;
  }

  // Header
  const header = document.createElement('div');
  header.className = 'project-header';

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'project-header__back';
  backBtn.innerHTML = `<span class="material-icons icon-sm">arrow_back</span> ${i18n('btn.back_to_portfolio')}`;
  backBtn.addEventListener('click', () => navigate('#portfolio'));
  header.appendChild(backBtn);

  const topRow = document.createElement('div');
  topRow.className = 'project-header__top';

  const infoCol = document.createElement('div');

  const titleEl = document.createElement('h1');
  titleEl.className = 'project-header__title';
  titleEl.textContent = project.name;
  infoCol.appendChild(titleEl);

  // Meta
  const meta = document.createElement('div');
  meta.className = 'project-header__meta';

  if (project.department) {
    const dept = document.createElement('span');
    dept.className = 'project-header__meta-item';
    dept.innerHTML = `<span class="material-icons icon-sm">business</span> ${escapeHtml(project.department)}`;
    meta.appendChild(dept);
  }

  if (project.challengeOwner) {
    const owner = document.createElement('span');
    owner.className = 'project-header__meta-item';
    owner.innerHTML = `<span class="material-icons icon-sm">person</span> ${escapeHtml(project.challengeOwner)}`;
    meta.appendChild(owner);
  }

  if (project.createdAt) {
    const date = document.createElement('span');
    date.className = 'project-header__meta-item';
    date.innerHTML = `<span class="material-icons icon-sm">calendar_today</span> ${new Date(project.createdAt).toLocaleDateString()}`;
    meta.appendChild(date);
  }

  infoCol.appendChild(meta);
  topRow.appendChild(infoCol);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'project-header__actions';

  const reportBtn = document.createElement('button');
  reportBtn.className = 'btn btn-secondary';
  reportBtn.innerHTML = `<span class="material-icons icon-sm">description</span> ${i18n('btn.project_report')}`;
  reportBtn.addEventListener('click', () => {
    navigate(`#project/${project.id}/report/project`);
  });
  actions.appendChild(reportBtn);

  topRow.appendChild(actions);
  header.appendChild(topRow);

  // Description
  if (project.description) {
    const desc = document.createElement('p');
    desc.className = 'text-sm text-muted mt-sm';
    desc.textContent = project.description;
    header.appendChild(desc);
  }

  container.appendChild(header);

  // Phase accordion
  const accordion = createPhaseAccordion(project.id, processData, {
    expandedPhase: params.phaseIndex != null ? params.phaseIndex : -1
  });
  container.appendChild(accordion);

  // Scroll to phase if specified
  if (params.phaseIndex != null) {
    setTimeout(() => {
      const el = document.getElementById(`phase-${params.phaseIndex}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export { renderProjectDetail };
