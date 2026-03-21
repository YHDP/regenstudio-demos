// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Report Generator — Renders reports at task, phase, and project level
 *
 * Reports are clean HTML rendered in the report view,
 * with print-optimized CSS for browser printing.
 */

import { i18n, t, getLang } from './i18n.js';
import {
  getProject, getPhaseState, isTaskChecked,
  getCanvasData, getGateDecision, getTaskNotes, getPhaseNotes
} from './state.js';

/**
 * Generate a phase report
 * Returns an HTML string
 */
function generatePhaseReport(projectId, phaseIndex, processData) {
  const project = getProject(projectId);
  if (!project) return '';
  const phase = processData.phases[phaseIndex];
  if (!phase) return '';
  const phaseState = getPhaseState(projectId, phaseIndex);

  const now = new Date().toLocaleDateString(getLang() === 'nl' ? 'nl-NL' : getLang() === 'pt' ? 'pt-PT' : 'en-GB');

  let html = `
    <div class="report-header">
      <h1 class="report-header__title">${t(phase.name)}</h1>
      <p class="report-header__subtitle">${escapeHtml(project.name)}</p>
      <div class="report-header__meta">
        <span>${i18n('report.date')}: ${now}</span>
        <span>${i18n('report.department')}: ${escapeHtml(project.department || '-')}</span>
        <span>${i18n('report.challenge_owner')}: ${escapeHtml(project.challengeOwner || '-')}</span>
      </div>
    </div>
  `;

  // Task groups
  if (phase.taskGroups) {
    for (const group of phase.taskGroups) {
      html += `<div class="report-section">`;
      html += `<div class="report-section__header">
        <div class="report-section__phase-dot" style="background:${phase.color}"></div>
        <h2>${t(group.name)}</h2>
      </div>`;

      html += `<ul class="report-task-list">`;
      for (const task of (group.tasks || [])) {
        const checked = isTaskChecked(projectId, phaseIndex, task.id);
        const statusClass = checked ? 'done' : 'pending';
        html += `
          <li class="report-task report-task--${statusClass}">
            <span class="report-task__status report-task__status--${statusClass}"></span>
            <span class="report-task__name">${t(task.name)}</span>
          </li>
        `;

        // Task notes
        const notes = getTaskNotes(projectId, phaseIndex, task.id);
        if (notes) {
          html += `<div class="report-notes">${escapeHtml(notes)}</div>`;
        }
      }

      // Custom tasks for this group
      if (phaseState && phaseState.customTasks) {
        for (const ct of phaseState.customTasks.filter(t => t.groupIndex === phase.taskGroups.indexOf(group))) {
          const checked = isTaskChecked(projectId, phaseIndex, ct.id);
          html += `
            <li class="report-task report-task--${checked ? 'done' : 'pending'}">
              <span class="report-task__status report-task__status--${checked ? 'done' : 'pending'}"></span>
              <span class="report-task__name">${escapeHtml(ct.name)} <span class="badge badge-custom">${i18n('label.custom')}</span></span>
            </li>
          `;
        }
      }
      html += `</ul></div>`;
    }
  }

  // Canvas data
  if (phaseState && phaseState.canvasData) {
    for (const [type, data] of Object.entries(phaseState.canvasData)) {
      if (data && Object.keys(data).length > 0) {
        html += `<div class="report-canvas">`;
        html += `<div class="report-canvas__title">${type}</div>`;
        html += `<div class="report-canvas__data">${renderCanvasDataForReport(type, data)}</div>`;
        html += `</div>`;
      }
    }
  }

  // Gate decision
  const gate = getGateDecision(projectId, phaseIndex);
  if (gate && gate.decision) {
    html += `
      <div class="report-gate report-gate--${gate.decision}">
        <div class="report-gate__decision">
          ${i18n('gate.title')}: ${i18n('gate.' + gate.decision)}
        </div>
        ${gate.notes ? `<div class="report-gate__notes">${escapeHtml(gate.notes)}</div>` : ''}
      </div>
    `;
  }

  // Phase notes
  const phaseNotes = getPhaseNotes(projectId, phaseIndex);
  if (phaseNotes) {
    html += `<h3>${i18n('report.phase_notes')}</h3>`;
    html += `<div class="report-notes">${escapeHtml(phaseNotes)}</div>`;
  }

  return html;
}

/**
 * Generate a full project report (all phases)
 */
function generateProjectReport(projectId, processData) {
  const project = getProject(projectId);
  if (!project) return '';

  const now = new Date().toLocaleDateString(getLang() === 'nl' ? 'nl-NL' : getLang() === 'pt' ? 'pt-PT' : 'en-GB');

  let html = `
    <div class="report-header">
      <h1 class="report-header__title">${escapeHtml(project.name)}</h1>
      <p class="report-header__subtitle">${i18n('report.project_report')}</p>
      <div class="report-header__meta">
        <span>${i18n('report.date')}: ${now}</span>
        <span>${i18n('report.department')}: ${escapeHtml(project.department || '-')}</span>
        <span>${i18n('report.challenge_owner')}: ${escapeHtml(project.challengeOwner || '-')}</span>
        <span>${i18n('report.created')}: ${new Date(project.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  `;

  // Description
  if (project.description) {
    html += `<div class="report-section">
      <h2>${i18n('report.project_description')}</h2>
      <p>${escapeHtml(project.description)}</p>
    </div>`;
  }

  // Each phase
  for (let i = 0; i < processData.phases.length; i++) {
    const phase = processData.phases[i];
    const phaseState = getPhaseState(projectId, i);

    // Count checked tasks
    let totalTasks = 0;
    let checkedTasks = 0;
    if (phase.taskGroups) {
      for (const group of phase.taskGroups) {
        totalTasks += (group.tasks || []).length;
      }
    }
    if (phaseState) {
      totalTasks += phaseState.customTasks.length;
      checkedTasks = phaseState.checkedTasks.length;
    }

    html += `<div class="report-section">`;
    html += `<div class="report-section__header">
      <div class="report-section__phase-dot" style="background:${phase.color}"></div>
      <h2>${i18n('label.phase')} ${i}: ${t(phase.name)}</h2>
    </div>`;

    // Summary
    html += `<p class="text-sm text-muted">
      ${i18n('report.tasks_completed', checkedTasks, totalTasks)} |
      ${i18n('report.governance')}: ${i18n('governance.' + phase.governanceRole)}
    </p>`;

    // Task groups summary
    if (phase.taskGroups) {
      for (const group of phase.taskGroups) {
        html += `<h3>${t(group.name)}</h3>`;
        html += `<ul class="report-task-list">`;
        for (const task of (group.tasks || [])) {
          const checked = isTaskChecked(projectId, i, task.id);
          html += `
            <li class="report-task report-task--${checked ? 'done' : 'pending'}">
              <span class="report-task__status report-task__status--${checked ? 'done' : 'pending'}"></span>
              <span class="report-task__name">${t(task.name)}</span>
            </li>
          `;
        }
        html += `</ul>`;
      }
    }

    // Gate
    const gate = getGateDecision(projectId, i);
    if (gate && gate.decision) {
      html += `
        <div class="report-gate report-gate--${gate.decision}">
          <div class="report-gate__decision">
            ${i18n('gate.title')}: ${i18n('gate.' + gate.decision)}
          </div>
          ${gate.notes ? `<div class="report-gate__notes">${escapeHtml(gate.notes)}</div>` : ''}
        </div>
      `;
    }

    html += `</div>`;
  }

  // Footer
  html += `
    <div class="report-section" style="text-align:center; color: var(--gray-400); font-size: var(--text-xs); margin-top: var(--space-2xl);">
      ${i18n('report.generated_by')}
    </div>
  `;

  return html;
}

/**
 * Generate a task-level mini report
 */
function generateTaskReport(projectId, phaseIndex, taskId, task) {
  const checked = isTaskChecked(projectId, phaseIndex, taskId);
  const notes = getTaskNotes(projectId, phaseIndex, taskId);

  let html = `
    <h3>${t(task.name)}</h3>
    <p><strong>${i18n('report.status')}:</strong> ${checked ? i18n('status.completed') : i18n('status.not_started')}</p>
  `;

  if (task.description) {
    html += `<p>${t(task.description)}</p>`;
  }

  if (notes) {
    html += `<h4>${i18n('label.notes')}</h4>`;
    html += `<div class="report-notes">${escapeHtml(notes)}</div>`;
  }

  return html;
}

/** Render canvas data as HTML table/list for reports */
function renderCanvasDataForReport(type, data) {
  if (!data) return '';

  // Generic: render as key-value pairs or lists
  let html = '<table class="report-canvas__table">';
  for (const [key, value] of Object.entries(data)) {
    html += '<tr>';
    html += `<th>${escapeHtml(key)}</th>`;
    if (Array.isArray(value)) {
      html += `<td><ul>${value.map(v => `<li>${escapeHtml(typeof v === 'string' ? v : JSON.stringify(v))}</li>`).join('')}</ul></td>`;
    } else if (typeof value === 'object' && value !== null) {
      html += `<td><pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre></td>`;
    } else {
      html += `<td>${escapeHtml(String(value))}</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

/** Escape HTML entities */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export {
  generatePhaseReport,
  generateProjectReport,
  generateTaskReport
};
