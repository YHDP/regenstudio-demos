// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Task Menu Component — Checklist-style tasks with expand, custom add, notes
 */

import { i18n, t } from '../i18n.js';
import {
  isTaskChecked, toggleTask,
  isSubtaskChecked, toggleSubtask,
  addCustomTask, removeCustomTask,
  getTaskNotes, setTaskNotes,
  getPhaseState
} from '../state.js';
import { navigate } from '../router.js';

/**
 * Render a task group (header + task items + add custom button)
 */
function renderTaskGroup(projectId, phaseIndex, groupIndex, group, processData) {
  const el = document.createElement('div');
  el.className = 'task-group';

  // Group header
  const header = document.createElement('div');
  header.className = 'task-group__header';
  header.textContent = t(group.name);
  el.appendChild(header);

  // Tasks
  for (const task of (group.tasks || [])) {
    const taskEl = renderTaskItem(projectId, phaseIndex, task, processData);
    el.appendChild(taskEl);
  }

  // Custom tasks for this group
  const phaseState = getPhaseState(projectId, phaseIndex);
  if (phaseState) {
    const customs = phaseState.customTasks.filter(ct => ct.groupIndex === groupIndex);
    for (const ct of customs) {
      const ctEl = renderCustomTaskItem(projectId, phaseIndex, ct);
      el.appendChild(ctEl);
    }
  }

  // Add custom task button
  const addBtn = document.createElement('button');
  addBtn.className = 'add-custom-btn';
  addBtn.innerHTML = `<span class="material-icons icon-sm">add</span> ${i18n('btn.add_custom_task')}`;
  addBtn.addEventListener('click', () => {
    showAddCustomTaskForm(el, addBtn, projectId, phaseIndex, groupIndex);
  });
  el.appendChild(addBtn);

  return el;
}

/**
 * Render a single task item
 */
function renderTaskItem(projectId, phaseIndex, task, processData) {
  const item = document.createElement('div');
  item.className = 'task-item';

  const checked = isTaskChecked(projectId, phaseIndex, task.id);
  if (checked) item.classList.add('is-checked');
  if (task.optional) item.classList.add('is-optional');

  // Main row
  const main = document.createElement('div');
  main.className = 'task-item__main';

  // Checkbox
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'task-item__checkbox';
  cb.checked = checked;
  cb.addEventListener('change', (e) => {
    e.stopPropagation();
    toggleTask(projectId, phaseIndex, task.id);
    item.classList.toggle('is-checked');
    // Trigger re-render of stats (handled by state listener)
  });
  main.appendChild(cb);

  // Label area
  const label = document.createElement('div');
  label.className = 'task-item__label';

  const name = document.createElement('div');
  name.className = 'task-item__name';
  name.textContent = t(task.name);
  if (task.optional) {
    name.textContent += ` (${i18n('label.optional')})`;
  }
  label.appendChild(name);

  // Tags
  if (task.tags && task.tags.length > 0) {
    const tags = document.createElement('div');
    tags.className = 'task-item__tags';
    for (const tag of task.tags) {
      const tagEl = document.createElement('span');
      tagEl.className = 'task-tag';
      tagEl.textContent = tag;
      tags.appendChild(tagEl);
    }
    label.appendChild(tags);
  }

  main.appendChild(label);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'task-item__actions';

  // Expand button
  const expandBtn = document.createElement('button');
  expandBtn.className = 'btn-icon';
  expandBtn.innerHTML = '<span class="material-icons icon-sm">expand_more</span>';
  expandBtn.title = i18n('btn.expand');
  expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    item.classList.toggle('is-expanded');
    expandBtn.querySelector('.material-icons').textContent =
      item.classList.contains('is-expanded') ? 'expand_less' : 'expand_more';
  });
  actions.appendChild(expandBtn);

  main.appendChild(actions);

  // Click on label area to expand too
  label.addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT') {
      item.classList.toggle('is-expanded');
    }
  });
  label.style.cursor = 'pointer';

  item.appendChild(main);

  // ── Expand area ──
  const expand = document.createElement('div');
  expand.className = 'task-item__expand';

  // Description
  if (task.description) {
    const desc = document.createElement('div');
    desc.className = 'task-item__description';
    desc.textContent = t(task.description);
    expand.appendChild(desc);
  }

  // Subtasks
  if (task.subtasks && task.subtasks.length > 0) {
    const subtasksList = document.createElement('ul');
    subtasksList.className = 'task-item__subtasks';
    for (const sub of task.subtasks) {
      const li = document.createElement('li');
      li.className = 'task-item__subtask';
      const subCb = document.createElement('input');
      subCb.type = 'checkbox';
      const subId = task.id + '/' + (sub.id || sub.en || t(sub));
      subCb.checked = isSubtaskChecked(projectId, phaseIndex, subId);
      subCb.addEventListener('change', () => toggleSubtask(projectId, phaseIndex, subId));
      li.appendChild(subCb);
      const subText = document.createElement('span');
      subText.textContent = typeof sub === 'string' ? sub : t(sub);
      li.appendChild(subText);
      subtasksList.appendChild(li);
    }
    expand.appendChild(subtasksList);
  }

  // Linked tools
  if (task.linkedTools && task.linkedTools.length > 0 && processData && processData.canvasTypes) {
    const toolsDiv = document.createElement('div');
    toolsDiv.className = 'task-item__tools';
    for (const toolId of task.linkedTools) {
      const canvas = processData.canvasTypes[toolId];
      if (canvas) {
        const toolLink = document.createElement('button');
        toolLink.className = 'task-tool-link';
        toolLink.innerHTML = `<span class="material-icons icon-sm">open_in_new</span> ${t(canvas.name)}`;
        toolLink.addEventListener('click', (e) => {
          e.stopPropagation();
          navigate(`#project/${projectId}/tool/${toolId}`);
        });
        toolsDiv.appendChild(toolLink);
      }
    }
    expand.appendChild(toolsDiv);
  }

  // Notes
  const notesDiv = document.createElement('div');
  notesDiv.className = 'task-item__notes';
  const notesArea = document.createElement('textarea');
  notesArea.className = 'task-notes-textarea';
  notesArea.placeholder = i18n('placeholder.task_notes');
  notesArea.value = getTaskNotes(projectId, phaseIndex, task.id);
  let notesTimer = null;
  notesArea.addEventListener('input', () => {
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      setTaskNotes(projectId, phaseIndex, task.id, notesArea.value);
    }, 500);
  });
  notesDiv.appendChild(notesArea);
  expand.appendChild(notesDiv);

  item.appendChild(expand);

  return item;
}

/**
 * Render a custom task item
 */
function renderCustomTaskItem(projectId, phaseIndex, customTask) {
  const item = document.createElement('div');
  item.className = 'task-item is-custom';

  const checked = isTaskChecked(projectId, phaseIndex, customTask.id);
  if (checked) item.classList.add('is-checked');

  const main = document.createElement('div');
  main.className = 'task-item__main';

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'task-item__checkbox';
  cb.checked = checked;
  cb.addEventListener('change', (e) => {
    e.stopPropagation();
    toggleTask(projectId, phaseIndex, customTask.id);
    item.classList.toggle('is-checked');
  });
  main.appendChild(cb);

  const label = document.createElement('div');
  label.className = 'task-item__label';

  const name = document.createElement('div');
  name.className = 'task-item__name';
  name.textContent = customTask.name;

  const customBadge = document.createElement('span');
  customBadge.className = 'badge badge-custom';
  customBadge.textContent = i18n('label.custom');
  customBadge.style.marginLeft = '8px';
  name.appendChild(customBadge);
  label.appendChild(name);
  main.appendChild(label);

  // Delete button
  const actions = document.createElement('div');
  actions.className = 'task-item__actions';
  const delBtn = document.createElement('button');
  delBtn.className = 'btn-icon';
  delBtn.innerHTML = '<span class="material-icons icon-sm">delete_outline</span>';
  delBtn.title = i18n('btn.remove');
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeCustomTask(projectId, phaseIndex, customTask.id);
    item.remove();
  });
  actions.appendChild(delBtn);
  actions.style.opacity = '1'; // Always visible for custom items
  main.appendChild(actions);

  item.appendChild(main);
  return item;
}

/**
 * Show inline form to add a custom task
 */
function showAddCustomTaskForm(container, addBtn, projectId, phaseIndex, groupIndex) {
  // Hide the add button
  addBtn.style.display = 'none';

  const form = document.createElement('div');
  form.style.cssText = 'display:flex; gap:8px; align-items:center; margin-top:8px;';

  const input = document.createElement('input');
  input.className = 'form-input';
  input.placeholder = i18n('placeholder.custom_task_name');
  input.style.flex = '1';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary btn-sm';
  saveBtn.textContent = i18n('btn.add');

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-ghost btn-sm';
  cancelBtn.textContent = i18n('btn.cancel');

  const doAdd = () => {
    const name = input.value.trim();
    if (name) {
      const ct = addCustomTask(projectId, phaseIndex, groupIndex, { name });
      const ctEl = renderCustomTaskItem(projectId, phaseIndex, ct);
      container.insertBefore(ctEl, form);
    }
    form.remove();
    addBtn.style.display = '';
  };

  saveBtn.addEventListener('click', doAdd);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doAdd();
    if (e.key === 'Escape') {
      form.remove();
      addBtn.style.display = '';
    }
  });
  cancelBtn.addEventListener('click', () => {
    form.remove();
    addBtn.style.display = '';
  });

  form.appendChild(input);
  form.appendChild(saveBtn);
  form.appendChild(cancelBtn);
  container.insertBefore(form, addBtn);

  input.focus();
}

export { renderTaskGroup, renderTaskItem };
