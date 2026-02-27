/**
 * Report View — Rendered report with print/download support
 */

import { i18n } from '../i18n.js';
import { navigate } from '../router.js';
import { generatePhaseReport, generateProjectReport } from '../report-generator.js';

function renderReportView(container, params, processData) {
  container.innerHTML = '';

  const { projectId, scope } = params;

  // Toolbar (hidden in print)
  const toolbar = document.createElement('div');
  toolbar.className = 'report-toolbar no-print';

  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-ghost';
  backBtn.innerHTML = `<span class="material-icons icon-sm">arrow_back</span> ${i18n('btn.back_to_project')}`;
  backBtn.addEventListener('click', () => navigate(`#project/${projectId}`));
  toolbar.appendChild(backBtn);

  const toolbarActions = document.createElement('div');
  toolbarActions.style.cssText = 'display:flex; gap:8px;';

  const printBtn = document.createElement('button');
  printBtn.className = 'btn btn-primary';
  printBtn.innerHTML = `<span class="material-icons icon-sm">print</span> ${i18n('btn.print')}`;
  printBtn.addEventListener('click', () => window.print());
  toolbarActions.appendChild(printBtn);

  toolbar.appendChild(toolbarActions);
  container.appendChild(toolbar);

  // Report content
  const reportEl = document.createElement('div');
  reportEl.className = 'report-view';

  let html = '';

  if (scope === 'project') {
    html = generateProjectReport(projectId, processData);
  } else if (scope.startsWith('phase-')) {
    const phaseIndex = parseInt(scope.replace('phase-', ''));
    html = generatePhaseReport(projectId, phaseIndex, processData);
  } else {
    html = `<div class="empty-state"><h3>${i18n('error.invalid_report_scope')}</h3></div>`;
  }

  reportEl.innerHTML = html;
  container.appendChild(reportEl);
}

export { renderReportView };
