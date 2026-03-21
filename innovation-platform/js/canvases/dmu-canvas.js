// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * DMU Canvas — Decision Making Unit role mapping
 */

import { i18n, t } from '../i18n.js';

const ROLES = [
  { key: 'decision_maker', icon: 'admin_panel_settings', label: { en: 'Decision Maker', nl: 'Besluitvormer', pt: 'Decisor' } },
  { key: 'challenge_owner', icon: 'person', label: { en: 'Challenge Owner', nl: 'Opgavehouder', pt: 'Responsavel pelo Desafio' } },
  { key: 'innovation_officer', icon: 'lightbulb', label: { en: 'Innovation Officer', nl: 'Use Case Manager', pt: 'Oficial de Inovacao' } },
  { key: 'steering_group', icon: 'groups', label: { en: 'Steering Group', nl: 'Stuurgroep', pt: 'Grupo Diretivo' } },
  { key: 'sponsor', icon: 'paid', label: { en: 'Sponsor / Budget', nl: 'Sponsor / Budget', pt: 'Patrocinador / Orcamento' } },
  { key: 'technical', icon: 'engineering', label: { en: 'Technical Lead', nl: 'Technisch Leider', pt: 'Lider Tecnico' } },
  { key: 'legal', icon: 'gavel', label: { en: 'Legal Advisor', nl: 'Juridisch Adviseur', pt: 'Consultor Juridico' } },
  { key: 'privacy', icon: 'shield', label: { en: 'Privacy Officer', nl: 'Privacy Officer', pt: 'Oficial de Privacidade' } },
  { key: 'communications', icon: 'campaign', label: { en: 'Communications', nl: 'Communicatie', pt: 'Comunicacoes' } }
];

function renderDmuCanvas(canvasDef, data, onChange) {
  const container = document.createElement('div');

  const grid = document.createElement('div');
  grid.className = 'dmu-grid';

  for (const role of ROLES) {
    const card = document.createElement('div');
    card.className = 'dmu-role';

    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = role.icon;
    icon.style.cssText = 'font-size:28px; color:var(--ip-primary); margin-bottom:8px;';
    card.appendChild(icon);

    const title = document.createElement('div');
    title.className = 'dmu-role__title';
    title.textContent = t(role.label);
    card.appendChild(title);

    const input = document.createElement('input');
    input.className = 'dmu-role__input';
    input.placeholder = i18n('placeholder.person_name');
    input.value = data[role.key] || '';
    input.addEventListener('input', () => {
      data[role.key] = input.value;
      onChange(data);
    });
    card.appendChild(input);

    grid.appendChild(card);
  }

  container.appendChild(grid);
  return container;
}

export { renderDmuCanvas };
