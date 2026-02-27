/**
 * Innovation Quickscan — Multi-domain compliance review
 */

import { i18n, t } from '../i18n.js';

const DOMAINS = [
  { key: 'privacy', icon: 'shield', label: { en: 'Privacy', nl: 'Privacy', pt: 'Privacidade' } },
  { key: 'security', icon: 'security', label: { en: 'Security', nl: 'Security', pt: 'Seguranca' } },
  { key: 'data-ai', icon: 'smart_toy', label: { en: 'Data / AI', nl: 'Data / AI', pt: 'Dados / IA' } },
  { key: 'archiving', icon: 'inventory_2', label: { en: 'Archiving', nl: 'Archivering', pt: 'Arquivamento' } },
  { key: 'info-mgmt', icon: 'folder_managed', label: { en: 'Information Management', nl: 'Informatiebeheer', pt: 'Gestao de Informacao' } },
  { key: 'procurement', icon: 'shopping_cart', label: { en: 'Procurement', nl: 'Inkoop', pt: 'Compras' } },
  { key: 'legal', icon: 'gavel', label: { en: 'Legal', nl: 'Juridisch', pt: 'Juridico' } },
  { key: 'ethics', icon: 'psychology', label: { en: 'Ethics', nl: 'Ethiek', pt: 'Etica' } }
];

const STATUSES = [
  { key: 'not-started', label: { en: 'Not Started', nl: 'Nog Beginnen', pt: 'Nao Iniciado' }, color: 'var(--status-not-started)', bg: 'var(--gray-100)' },
  { key: 'in-review', label: { en: 'In Review', nl: 'In Beoordeling', pt: 'Em Revisao' }, color: 'var(--qs-in-review)', bg: 'var(--status-concern-bg)' },
  { key: 'approved', label: { en: 'Approved', nl: 'Goedgekeurd', pt: 'Aprovado' }, color: 'var(--qs-approved)', bg: 'var(--status-done-bg)' },
  { key: 'concerns', label: { en: 'Concerns', nl: 'Aandachtspunten', pt: 'Preocupacoes' }, color: 'var(--qs-concerns)', bg: '#FFF7ED' },
  { key: 'blocked', label: { en: 'Blocked', nl: 'Geblokkeerd', pt: 'Bloqueado' }, color: 'var(--qs-blocked)', bg: 'var(--status-blocked-bg)' }
];

function renderQuickscan(canvasDef, data, onChange) {
  const container = document.createElement('div');

  // Summary bar
  const summaryBar = document.createElement('div');
  summaryBar.style.cssText = 'display:flex; gap:12px; margin-bottom:var(--space-lg); flex-wrap:wrap;';
  container.appendChild(summaryBar);

  function updateSummary() {
    summaryBar.innerHTML = '';
    for (const s of STATUSES) {
      const count = DOMAINS.filter(d => (data[d.key] && data[d.key].status === s.key)).length;
      if (s.key === 'not-started') {
        const unset = DOMAINS.filter(d => !data[d.key] || !data[d.key].status).length;
        const total = count + unset;
        if (total === 0) continue;
        addSummaryChip(summaryBar, t(s.label), total, s.color, s.bg);
      } else if (count > 0) {
        addSummaryChip(summaryBar, t(s.label), count, s.color, s.bg);
      }
    }
  }

  // Domain cards
  const grid = document.createElement('div');
  grid.className = 'quickscan-grid';

  for (const domain of DOMAINS) {
    if (!data[domain.key]) data[domain.key] = { status: '', assignee: '', risk: 0, notes: '' };
    const card = renderDomainCard(domain, data, onChange, updateSummary);
    grid.appendChild(card);
  }

  container.appendChild(grid);
  updateSummary();

  return container;
}

function renderDomainCard(domain, data, onChange, updateSummary) {
  const card = document.createElement('div');
  card.className = 'quickscan-domain';

  const dd = data[domain.key];

  // Header
  const header = document.createElement('div');
  header.className = 'quickscan-domain__header';
  const nameEl = document.createElement('div');
  nameEl.className = 'quickscan-domain__name';
  const icon = document.createElement('span');
  icon.className = 'material-icons icon-sm';
  icon.textContent = domain.icon;
  icon.style.marginRight = '4px';
  icon.style.verticalAlign = 'middle';
  nameEl.appendChild(icon);
  nameEl.appendChild(document.createTextNode(t(domain.label)));
  header.appendChild(nameEl);
  card.appendChild(header);

  // Status select
  const statusSelect = document.createElement('select');
  statusSelect.className = 'form-select';
  statusSelect.style.cssText = 'width:100%; margin-bottom:8px; font-size:0.8rem;';
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = `-- ${i18n('label.select_status')} --`;
  statusSelect.appendChild(defaultOpt);
  for (const s of STATUSES) {
    const opt = document.createElement('option');
    opt.value = s.key;
    opt.textContent = t(s.label);
    if (dd.status === s.key) opt.selected = true;
    statusSelect.appendChild(opt);
  }
  statusSelect.addEventListener('change', () => {
    dd.status = statusSelect.value;
    onChange(data);
    updateSummary();
    updateCardStyle();
  });
  card.appendChild(statusSelect);

  // Assignee
  const assigneeInput = document.createElement('input');
  assigneeInput.className = 'form-input';
  assigneeInput.style.cssText = 'width:100%; margin-bottom:8px; font-size:0.8rem;';
  assigneeInput.placeholder = i18n('placeholder.assignee');
  assigneeInput.value = dd.assignee || '';
  assigneeInput.addEventListener('input', () => {
    dd.assignee = assigneeInput.value;
    onChange(data);
  });
  card.appendChild(assigneeInput);

  // Notes
  const notes = document.createElement('textarea');
  notes.className = 'form-textarea';
  notes.style.cssText = 'width:100%; font-size:0.8rem; min-height:50px;';
  notes.placeholder = i18n('placeholder.domain_notes');
  notes.value = dd.notes || '';
  notes.addEventListener('input', () => {
    dd.notes = notes.value;
    onChange(data);
  });
  card.appendChild(notes);

  function updateCardStyle() {
    const status = STATUSES.find(s => s.key === dd.status);
    if (status) {
      card.style.borderColor = status.color;
      card.style.borderLeftWidth = '4px';
    } else {
      card.style.borderColor = '';
      card.style.borderLeftWidth = '';
    }
  }
  updateCardStyle();

  return card;
}

function addSummaryChip(container, label, count, color, bg) {
  const chip = document.createElement('span');
  chip.style.cssText = `
    display:inline-flex; align-items:center; gap:4px;
    padding:4px 12px; border-radius:var(--radius-full);
    font-size:var(--text-xs); font-weight:600;
    background:${bg}; color:${color};
  `;
  chip.textContent = `${count} ${label}`;
  container.appendChild(chip);
}

export { renderQuickscan };
