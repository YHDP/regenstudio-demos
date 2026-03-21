// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * State Manager — Reactive store with localStorage persistence
 *
 * Manages all project state: checked tasks, custom items, canvas data,
 * gate decisions, notes. Persists to localStorage automatically.
 *
 * Storage key: 'ip-state'
 */

const STORAGE_KEY = 'ip-state';

let state = {
  projects: [],
  appSettings: {
    lang: 'en'
  }
};

let listeners = [];

/** Load state from localStorage */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };
    }
  } catch (e) {
    console.error('state: Failed to load from localStorage', e);
  }
  return state;
}

/** Save state to localStorage */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('state: Failed to save to localStorage', e);
  }
}

/** Notify all listeners of state change */
function notify(path) {
  for (const listener of listeners) {
    try { listener(state, path); } catch (e) { console.error('state listener error:', e); }
  }
}

/** Subscribe to state changes */
function subscribe(callback) {
  listeners.push(callback);
  return () => { listeners = listeners.filter(l => l !== callback); };
}

/** Initialize state — load from localStorage and merge with sample data if needed */
async function initState(sampleProjects) {
  loadState();

  // If no projects exist, load sample data
  if (state.projects.length === 0 && sampleProjects) {
    state.projects = sampleProjects.map(p => ({
      ...p,
      phases: p.phases || {},
      customTools: p.customTools || [],
      customTemplates: p.customTemplates || []
    }));
    saveState();
  }

  return state;
}

// ─── Project CRUD ───

function getProjects() {
  return state.projects;
}

function getProject(id) {
  return state.projects.find(p => p.id === id) || null;
}

function createProject(data) {
  const project = {
    id: 'proj-' + Date.now(),
    name: data.name || '',
    description: data.description || '',
    department: data.department || '',
    challengeOwner: data.challengeOwner || '',
    createdAt: new Date().toISOString(),
    phases: {},
    customTools: [],
    customTemplates: [],
    ...data
  };
  state.projects.push(project);
  saveState();
  notify('projects');
  return project;
}

function updateProject(id, updates) {
  const idx = state.projects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  state.projects[idx] = { ...state.projects[idx], ...updates };
  saveState();
  notify(`projects.${id}`);
  return state.projects[idx];
}

function deleteProject(id) {
  state.projects = state.projects.filter(p => p.id !== id);
  saveState();
  notify('projects');
}

// ─── Phase State ───

function getPhaseState(projectId, phaseIndex) {
  const project = getProject(projectId);
  if (!project) return null;
  if (!project.phases[phaseIndex]) {
    project.phases[phaseIndex] = {
      checkedTasks: [],
      customTasks: [],
      canvasData: {},
      notes: '',
      gateDecision: null,
      gateNotes: '',
      activeDeepening: [],
      checkedSubtasks: [],
      checkedDelivs: [],
      taskNotes: {}
    };
  }
  return project.phases[phaseIndex];
}

// ─── Task Checking ───

function isTaskChecked(projectId, phaseIndex, taskId) {
  const phase = getPhaseState(projectId, phaseIndex);
  return phase ? phase.checkedTasks.includes(taskId) : false;
}

function toggleTask(projectId, phaseIndex, taskId) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return;
  const idx = phase.checkedTasks.indexOf(taskId);
  if (idx === -1) {
    phase.checkedTasks.push(taskId);
  } else {
    phase.checkedTasks.splice(idx, 1);
  }
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.tasks`);
}

// ─── Subtask Checking ───

function isSubtaskChecked(projectId, phaseIndex, subtaskId) {
  const phase = getPhaseState(projectId, phaseIndex);
  return phase ? phase.checkedSubtasks.includes(subtaskId) : false;
}

function toggleSubtask(projectId, phaseIndex, subtaskId) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return;
  const idx = phase.checkedSubtasks.indexOf(subtaskId);
  if (idx === -1) {
    phase.checkedSubtasks.push(subtaskId);
  } else {
    phase.checkedSubtasks.splice(idx, 1);
  }
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.subtasks`);
}

// ─── Deliverable Checking ───

function isDeliverableChecked(projectId, phaseIndex, delivId) {
  const phase = getPhaseState(projectId, phaseIndex);
  return phase ? phase.checkedDelivs.includes(delivId) : false;
}

function toggleDeliverable(projectId, phaseIndex, delivId) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return;
  const idx = phase.checkedDelivs.indexOf(delivId);
  if (idx === -1) {
    phase.checkedDelivs.push(delivId);
  } else {
    phase.checkedDelivs.splice(idx, 1);
  }
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.deliverables`);
}

// ─── Custom Tasks ───

function addCustomTask(projectId, phaseIndex, groupIndex, taskData) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return null;
  const customTask = {
    id: 'custom-' + Date.now(),
    name: taskData.name || '',
    description: taskData.description || '',
    isCustom: true,
    groupIndex: groupIndex,
    createdAt: new Date().toISOString()
  };
  phase.customTasks.push(customTask);
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.customTasks`);
  return customTask;
}

function removeCustomTask(projectId, phaseIndex, taskId) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return;
  phase.customTasks = phase.customTasks.filter(t => t.id !== taskId);
  // Also remove from checked
  phase.checkedTasks = phase.checkedTasks.filter(id => id !== taskId);
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.customTasks`);
}

// ─── Task Notes ───

function getTaskNotes(projectId, phaseIndex, taskId) {
  const phase = getPhaseState(projectId, phaseIndex);
  return phase && phase.taskNotes ? (phase.taskNotes[taskId] || '') : '';
}

function setTaskNotes(projectId, phaseIndex, taskId, notes) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return;
  if (!phase.taskNotes) phase.taskNotes = {};
  phase.taskNotes[taskId] = notes;
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.taskNotes`);
}

// ─── Phase Notes ───

function getPhaseNotes(projectId, phaseIndex) {
  const phase = getPhaseState(projectId, phaseIndex);
  return phase ? phase.notes : '';
}

function setPhaseNotes(projectId, phaseIndex, notes) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return;
  phase.notes = notes;
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.notes`);
}

// ─── Gate Decisions ───

function getGateDecision(projectId, phaseIndex) {
  const phase = getPhaseState(projectId, phaseIndex);
  return phase ? { decision: phase.gateDecision, notes: phase.gateNotes } : null;
}

function setGateDecision(projectId, phaseIndex, decision, notes) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return;
  phase.gateDecision = decision; // 'go' | 'redo' | 'stop' | null
  phase.gateNotes = notes || '';
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.gate`);
}

// ─── Canvas Data ───

function getCanvasData(projectId, phaseIndex, canvasType) {
  const phase = getPhaseState(projectId, phaseIndex);
  return phase && phase.canvasData ? (phase.canvasData[canvasType] || null) : null;
}

function setCanvasData(projectId, phaseIndex, canvasType, data) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return;
  if (!phase.canvasData) phase.canvasData = {};
  phase.canvasData[canvasType] = data;
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.canvas.${canvasType}`);
}

// ─── Deepening ───

function isDeepActive(projectId, phaseIndex, deepeningId) {
  const phase = getPhaseState(projectId, phaseIndex);
  return phase ? phase.activeDeepening.includes(deepeningId) : false;
}

function toggleDeepening(projectId, phaseIndex, deepeningId) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase) return;
  const idx = phase.activeDeepening.indexOf(deepeningId);
  if (idx === -1) {
    phase.activeDeepening.push(deepeningId);
  } else {
    phase.activeDeepening.splice(idx, 1);
  }
  saveState();
  notify(`projects.${projectId}.phases.${phaseIndex}.deepening`);
}

// ─── Custom Tools ───

function addCustomTool(projectId, toolData) {
  const project = getProject(projectId);
  if (!project) return null;
  const tool = {
    id: 'tool-custom-' + Date.now(),
    name: toolData.name || '',
    description: toolData.description || '',
    isCustom: true,
    createdAt: new Date().toISOString()
  };
  project.customTools.push(tool);
  saveState();
  notify(`projects.${projectId}.customTools`);
  return tool;
}

function removeCustomTool(projectId, toolId) {
  const project = getProject(projectId);
  if (!project) return;
  project.customTools = project.customTools.filter(t => t.id !== toolId);
  saveState();
  notify(`projects.${projectId}.customTools`);
}

// ─── Statistics ───

function getPhaseStats(projectId, phaseIndex, processPhase) {
  const phase = getPhaseState(projectId, phaseIndex);
  if (!phase || !processPhase) return { checked: 0, total: 0 };

  let total = 0;
  if (processPhase.taskGroups) {
    for (const group of processPhase.taskGroups) {
      if (group.tasks) total += group.tasks.length;
    }
  }
  // Add custom tasks
  total += phase.customTasks.length;

  return {
    checked: phase.checkedTasks.length,
    total
  };
}

// ─── Reset ───

function resetState() {
  state = { projects: [], appSettings: { lang: 'en' } };
  saveState();
  notify('reset');
}

export {
  initState,
  subscribe,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getPhaseState,
  isTaskChecked,
  toggleTask,
  isSubtaskChecked,
  toggleSubtask,
  isDeliverableChecked,
  toggleDeliverable,
  addCustomTask,
  removeCustomTask,
  getTaskNotes,
  setTaskNotes,
  getPhaseNotes,
  setPhaseNotes,
  getGateDecision,
  setGateDecision,
  getCanvasData,
  setCanvasData,
  isDeepActive,
  toggleDeepening,
  addCustomTool,
  removeCustomTool,
  getPhaseStats,
  resetState
};
