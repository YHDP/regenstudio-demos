/**
 * Project Card Component — Portfolio card with phase progress
 */

import { i18n, t } from '../i18n.js';
import { getPhaseStats } from '../state.js';
import { navigate } from '../router.js';

function createProjectCard(project, processData) {
  const card = document.createElement('div');
  card.className = 'card project-card';

  // Header
  const header = document.createElement('div');
  header.className = 'project-card__header';

  const title = document.createElement('div');
  title.className = 'project-card__title';
  title.textContent = project.name;

  const dept = document.createElement('div');
  dept.className = 'project-card__dept';
  const deptIcon = document.createElement('span');
  deptIcon.className = 'material-icons icon-sm';
  deptIcon.textContent = 'business';
  dept.appendChild(deptIcon);
  dept.appendChild(document.createTextNode(project.department || i18n('label.no_department')));

  // Sample badge
  if (project.isSample) {
    const sampleBadge = document.createElement('span');
    sampleBadge.className = 'badge badge-custom';
    sampleBadge.textContent = i18n('label.sample');
    sampleBadge.style.cssText = 'font-size:var(--text-xs); margin-left:8px;';
    title.appendChild(sampleBadge);
  }

  header.appendChild(title);
  header.appendChild(dept);

  // Body
  const body = document.createElement('div');
  body.className = 'project-card__body';

  // Description
  if (project.description) {
    const desc = document.createElement('div');
    desc.className = 'project-card__desc';
    desc.textContent = project.description;
    body.appendChild(desc);
  }

  // Phase progress dots
  const progressRow = document.createElement('div');
  progressRow.className = 'phase-progress-row';

  const phases = processData.phases || [];
  for (let i = 0; i < phases.length; i++) {
    const dot = document.createElement('div');
    dot.className = 'phase-dot';
    dot.style.background = phases[i].color + '30'; // Light version

    const stats = getPhaseStats(project.id, i, phases[i]);
    if (stats.checked > 0 && stats.checked >= stats.total && stats.total > 0) {
      dot.className = 'phase-dot is-complete';
      dot.style.background = phases[i].color;
    } else if (stats.checked > 0) {
      dot.className = 'phase-dot has-progress';
      dot.style.background = phases[i].color + '80';
    }

    dot.title = `${t(phases[i].name)}: ${stats.checked}/${stats.total}`;
    progressRow.appendChild(dot);
  }
  body.appendChild(progressRow);

  // Stats
  const statsEl = document.createElement('div');
  statsEl.className = 'project-card__stats';

  let totalChecked = 0;
  let totalTasks = 0;
  for (let i = 0; i < phases.length; i++) {
    const stats = getPhaseStats(project.id, i, phases[i]);
    totalChecked += stats.checked;
    totalTasks += stats.total;
  }

  const taskStat = document.createElement('span');
  taskStat.className = 'project-card__stat';
  const taskIcon = document.createElement('span');
  taskIcon.className = 'material-icons icon-sm';
  taskIcon.textContent = 'check_circle';
  taskStat.appendChild(taskIcon);
  taskStat.appendChild(document.createTextNode(`${totalChecked}/${totalTasks} ${i18n('label.tasks')}`));
  statsEl.appendChild(taskStat);

  body.appendChild(statsEl);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'project-card__footer';

  const owner = document.createElement('span');
  owner.className = 'project-card__owner';
  const ownerIcon = document.createElement('span');
  ownerIcon.className = 'material-icons icon-sm';
  ownerIcon.textContent = 'person';
  owner.appendChild(ownerIcon);
  owner.appendChild(document.createTextNode(project.challengeOwner || '-'));
  footer.appendChild(owner);

  const date = document.createElement('span');
  date.className = 'project-card__date';
  date.textContent = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '';
  footer.appendChild(date);

  // Assemble
  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  // Click handler
  card.addEventListener('click', () => {
    navigate(`#project/${project.id}`);
  });

  return card;
}

function createNewProjectCard() {
  const card = document.createElement('div');
  card.className = 'card new-project-card';

  const icon = document.createElement('span');
  icon.className = 'material-icons';
  icon.textContent = 'add_circle_outline';

  const label = document.createElement('span');
  label.textContent = i18n('btn.new_project');

  card.appendChild(icon);
  card.appendChild(label);

  card.addEventListener('click', () => {
    navigate('#create');
  });

  return card;
}

export { createProjectCard, createNewProjectCard };
