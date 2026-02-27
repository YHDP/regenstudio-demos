/**
 * Phase Accordion Component
 * Expandable phase sections with header, task groups, tools, gate
 */

import { i18n, t } from '../i18n.js';
import { getPhaseStats, getGateDecision } from '../state.js';
import { renderTaskGroup } from './task-menu.js';
import { renderDeepeningMenu } from './deepening-menu.js';
import { renderGatePanel } from './gate-panel.js';
import { renderDeliverables } from './deliverables.js';
import { renderToolsBar } from './toolbar.js';

/**
 * Create the full phase accordion for a project
 */
function createPhaseAccordion(projectId, processData, options = {}) {
  const container = document.createElement('div');
  container.className = 'phase-accordion';

  const phases = processData.phases || [];

  for (let i = 0; i < phases.length; i++) {
    const section = createPhaseSection(projectId, i, phases[i], processData, options);
    container.appendChild(section);
  }

  return container;
}

/**
 * Create a single phase section
 */
function createPhaseSection(projectId, phaseIndex, phase, processData, options = {}) {
  const section = document.createElement('div');
  section.className = 'phase-section';
  section.id = `phase-${phaseIndex}`;

  if (options.expandedPhase === phaseIndex) {
    section.classList.add('is-expanded');
  }

  // ── Header ──
  const header = document.createElement('div');
  header.className = 'phase-section__header';
  header.addEventListener('click', () => {
    section.classList.toggle('is-expanded');
  });

  // Phase icon
  const iconWrap = document.createElement('div');
  iconWrap.className = 'phase-section__icon';
  iconWrap.style.background = phase.color;
  const icon = document.createElement('span');
  icon.className = 'material-icons';
  icon.textContent = phase.icon || 'flag';
  iconWrap.appendChild(icon);
  header.appendChild(iconWrap);

  // Phase info
  const info = document.createElement('div');
  info.className = 'phase-section__info';

  const nameRow = document.createElement('div');
  nameRow.className = 'phase-section__name';

  const phaseNum = document.createElement('span');
  phaseNum.className = 'text-muted';
  phaseNum.textContent = `${phaseIndex}`;
  phaseNum.style.marginRight = '4px';
  nameRow.appendChild(phaseNum);
  nameRow.appendChild(document.createTextNode(t(phase.name)));

  // Governance badge
  const badge = document.createElement('span');
  badge.className = `badge badge-${phase.governanceRole}`;
  badge.textContent = i18n('governance.' + phase.governanceRole);
  nameRow.appendChild(badge);
  info.appendChild(nameRow);

  // Summary
  const stats = getPhaseStats(projectId, phaseIndex, phase);
  const summary = document.createElement('div');
  summary.className = 'phase-section__summary';
  summary.textContent = i18n('phase.summary', stats.checked, stats.total);
  info.appendChild(summary);

  header.appendChild(info);

  // Progress bar
  const progressWrap = document.createElement('div');
  progressWrap.className = 'phase-section__progress';
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-bar__fill';
  progressFill.style.width = stats.total > 0 ? `${(stats.checked / stats.total) * 100}%` : '0%';
  progressFill.style.background = phase.color;
  progressBar.appendChild(progressFill);
  progressWrap.appendChild(progressBar);
  header.appendChild(progressWrap);

  // Chevron
  const chevron = document.createElement('span');
  chevron.className = 'material-icons phase-section__chevron';
  chevron.textContent = 'expand_more';
  header.appendChild(chevron);

  section.appendChild(header);

  // ── Body ──
  const body = document.createElement('div');
  body.className = 'phase-section__body';

  const content = document.createElement('div');
  content.className = 'phase-section__content';

  // Advisory banner for phases 6+
  if (phase.governanceRole === 'advisory') {
    const banner = document.createElement('div');
    banner.className = 'governance-banner advisory';
    const bannerIcon = document.createElement('span');
    bannerIcon.className = 'material-icons';
    bannerIcon.textContent = 'info';
    banner.appendChild(bannerIcon);
    banner.appendChild(document.createTextNode(i18n('governance.advisory_banner')));
    content.appendChild(banner);
  }

  // Task groups
  if (phase.taskGroups) {
    for (let gi = 0; gi < phase.taskGroups.length; gi++) {
      const group = phase.taskGroups[gi];
      const groupEl = renderTaskGroup(projectId, phaseIndex, gi, group, processData);
      content.appendChild(groupEl);
    }
  }

  // Deepening options
  if (phase.deepeningOptions && phase.deepeningOptions.length > 0) {
    const deepeningSection = renderDeepeningMenu(projectId, phaseIndex, phase.deepeningOptions);
    content.appendChild(deepeningSection);
  }

  // Deliverables
  if (phase.deliverables && phase.deliverables.length > 0) {
    const delivSection = renderDeliverables(projectId, phaseIndex, phase.deliverables);
    content.appendChild(delivSection);
  }

  // Tools bar
  if (phase.taskGroups) {
    const allTools = [];
    for (const group of phase.taskGroups) {
      for (const task of (group.tasks || [])) {
        if (task.linkedTools) {
          for (const toolId of task.linkedTools) {
            if (!allTools.includes(toolId)) allTools.push(toolId);
          }
        }
      }
    }
    if (allTools.length > 0) {
      const toolsBar = renderToolsBar(projectId, allTools, processData);
      content.appendChild(toolsBar);
    }
  }

  // Gate panel
  if (phase.gate) {
    const gateEl = renderGatePanel(projectId, phaseIndex, phase.gate);
    content.appendChild(gateEl);
  }

  body.appendChild(content);
  section.appendChild(body);

  return section;
}

/**
 * Refresh a specific phase section (after state change)
 */
function refreshPhaseSection(projectId, phaseIndex, phase, processData) {
  const existing = document.getElementById(`phase-${phaseIndex}`);
  if (!existing) return;
  const wasExpanded = existing.classList.contains('is-expanded');
  const newSection = createPhaseSection(projectId, phaseIndex, phase, processData, {
    expandedPhase: wasExpanded ? phaseIndex : -1
  });
  existing.replaceWith(newSection);
}

export { createPhaseAccordion, createPhaseSection, refreshPhaseSection };
