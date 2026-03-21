// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Create Project Modal
 */

import { i18n } from '../i18n.js';
import { createProject } from '../state.js';
import { navigate } from '../router.js';

function showCreateProjectModal(container) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  const title = document.createElement('h2');
  title.textContent = i18n('create.title');
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn-icon';
  closeBtn.innerHTML = '<span class="material-icons">close</span>';
  closeBtn.addEventListener('click', () => backdrop.remove());
  header.appendChild(title);
  header.appendChild(closeBtn);

  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.style.cssText = 'display:flex; flex-direction:column; gap:var(--space-md);';

  // Name
  const nameGroup = createField('create.name', 'text', 'project-name');
  body.appendChild(nameGroup);

  // Description
  const descGroup = document.createElement('div');
  descGroup.className = 'form-group';
  const descLabel = document.createElement('label');
  descLabel.className = 'form-label';
  descLabel.textContent = i18n('create.description');
  const descInput = document.createElement('textarea');
  descInput.className = 'form-textarea';
  descInput.id = 'project-desc';
  descInput.rows = 3;
  descGroup.appendChild(descLabel);
  descGroup.appendChild(descInput);
  body.appendChild(descGroup);

  // Department
  const deptGroup = createField('create.department', 'text', 'project-dept');
  body.appendChild(deptGroup);

  // Challenge Owner
  const ownerGroup = createField('create.challenge_owner', 'text', 'project-owner');
  body.appendChild(ownerGroup);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = i18n('btn.cancel');
  cancelBtn.addEventListener('click', () => backdrop.remove());

  const createBtn = document.createElement('button');
  createBtn.className = 'btn btn-primary';
  createBtn.textContent = i18n('btn.create');
  createBtn.addEventListener('click', () => {
    const name = document.getElementById('project-name').value.trim();
    if (!name) {
      document.getElementById('project-name').focus();
      return;
    }

    const project = createProject({
      name,
      description: document.getElementById('project-desc').value.trim(),
      department: document.getElementById('project-dept').value.trim(),
      challengeOwner: document.getElementById('project-owner').value.trim()
    });

    backdrop.remove();
    navigate(`#project/${project.id}`);
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(createBtn);

  // Assemble
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  backdrop.appendChild(modal);

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });

  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      backdrop.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  container.appendChild(backdrop);

  // Focus first input
  setTimeout(() => document.getElementById('project-name').focus(), 100);
}

function createField(labelKey, type, id) {
  const group = document.createElement('div');
  group.className = 'form-group';
  const label = document.createElement('label');
  label.className = 'form-label';
  label.textContent = i18n(labelKey);
  label.setAttribute('for', id);
  const input = document.createElement('input');
  input.className = 'form-input';
  input.type = type;
  input.id = id;
  group.appendChild(label);
  group.appendChild(input);
  return group;
}

export { showCreateProjectModal };
