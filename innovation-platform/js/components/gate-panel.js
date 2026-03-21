// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Gate Panel — Go / Redo / Stop decision UI
 */

import { i18n, t } from '../i18n.js';
import { getGateDecision, setGateDecision } from '../state.js';

function renderGatePanel(projectId, phaseIndex, gate) {
  const panel = document.createElement('div');
  panel.className = 'gate-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'gate-panel__header';
  const icon = document.createElement('span');
  icon.className = 'material-icons';
  icon.textContent = 'verified';
  icon.style.color = 'var(--ip-primary)';
  header.appendChild(icon);
  const title = document.createElement('h3');
  title.textContent = i18n('gate.title');
  title.style.margin = '0';
  header.appendChild(title);
  panel.appendChild(header);

  // Question
  if (gate.question) {
    const question = document.createElement('div');
    question.className = 'gate-panel__question';
    question.textContent = t(gate.question);
    panel.appendChild(question);
  }

  // Current decision
  const currentDecision = getGateDecision(projectId, phaseIndex);
  const selectedDecision = currentDecision ? currentDecision.decision : null;

  // Buttons
  const actions = document.createElement('div');
  actions.className = 'gate-panel__actions';

  const decisions = [
    { key: 'go', icon: 'check_circle', class: 'gate-btn--go' },
    { key: 'redo', icon: 'refresh', class: 'gate-btn--redo' },
    { key: 'stop', icon: 'cancel', class: 'gate-btn--stop' }
  ];

  const buttons = [];
  for (const d of decisions) {
    const btn = document.createElement('button');
    btn.className = `gate-btn ${d.class}`;
    if (selectedDecision === d.key) btn.classList.add('is-selected');

    const bIcon = document.createElement('span');
    bIcon.className = 'material-icons';
    bIcon.textContent = d.icon;
    bIcon.style.fontSize = '18px';
    bIcon.style.marginRight = '4px';
    bIcon.style.verticalAlign = 'middle';
    btn.appendChild(bIcon);
    btn.appendChild(document.createTextNode(i18n('gate.' + d.key)));

    btn.addEventListener('click', () => {
      // Toggle: clicking same button deselects
      const newDecision = selectedDecision === d.key ? null : d.key;
      setGateDecision(projectId, phaseIndex, newDecision, notesArea.value);
      // Update button states
      for (const b of buttons) b.classList.remove('is-selected');
      if (newDecision) btn.classList.add('is-selected');
    });

    buttons.push(btn);
    actions.appendChild(btn);
  }
  panel.appendChild(actions);

  // Notes
  const notesLabel = document.createElement('label');
  notesLabel.className = 'form-label';
  notesLabel.textContent = i18n('gate.notes');
  notesLabel.style.marginTop = 'var(--space-sm)';
  panel.appendChild(notesLabel);

  const notesArea = document.createElement('textarea');
  notesArea.className = 'form-textarea';
  notesArea.style.marginTop = 'var(--space-xs)';
  notesArea.rows = 3;
  notesArea.placeholder = i18n('placeholder.gate_notes');
  notesArea.value = currentDecision ? currentDecision.notes : '';

  let notesTimer = null;
  notesArea.addEventListener('input', () => {
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      const currentBtn = buttons.find(b => b.classList.contains('is-selected'));
      const decision = currentBtn ? decisions[buttons.indexOf(currentBtn)].key : null;
      if (decision) {
        setGateDecision(projectId, phaseIndex, decision, notesArea.value);
      }
    }, 500);
  });
  panel.appendChild(notesArea);

  return panel;
}

export { renderGatePanel };
