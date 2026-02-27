/**
 * Ecosystem Value Map — Stakeholder value flow canvas
 */

import { i18n, t } from '../i18n.js';

function renderEcosystemMap(canvasDef, data, onChange) {
  const container = document.createElement('div');

  // Tabs for pilot vs adoption
  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  const pilotTab = document.createElement('button');
  pilotTab.className = 'tab is-active';
  pilotTab.textContent = i18n('canvas.pilot_phase');
  const adoptionTab = document.createElement('button');
  adoptionTab.className = 'tab';
  adoptionTab.textContent = i18n('canvas.adoption_phase');

  let currentView = 'pilot';

  pilotTab.addEventListener('click', () => {
    currentView = 'pilot';
    pilotTab.classList.add('is-active');
    adoptionTab.classList.remove('is-active');
    renderMap();
  });
  adoptionTab.addEventListener('click', () => {
    currentView = 'adoption';
    adoptionTab.classList.add('is-active');
    pilotTab.classList.remove('is-active');
    renderMap();
  });

  tabs.appendChild(pilotTab);
  tabs.appendChild(adoptionTab);
  container.appendChild(tabs);

  const mapContainer = document.createElement('div');
  container.appendChild(mapContainer);

  function renderMap() {
    mapContainer.innerHTML = '';
    const key = currentView;
    if (!data[key]) data[key] = { actors: [], flows: [] };

    const mapData = data[key];

    // Actors
    const actorsSection = document.createElement('div');
    actorsSection.style.marginBottom = 'var(--space-lg)';

    const actorsHeader = document.createElement('h4');
    actorsHeader.style.marginBottom = 'var(--space-sm)';
    actorsHeader.textContent = i18n('canvas.actors');
    actorsSection.appendChild(actorsHeader);

    const actorsList = document.createElement('div');
    actorsList.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px;';

    function renderActors() {
      actorsList.innerHTML = '';
      for (let i = 0; i < mapData.actors.length; i++) {
        const chip = document.createElement('span');
        chip.style.cssText = `
          display:inline-flex; align-items:center; gap:4px;
          padding:4px 12px; border-radius:var(--radius-full);
          background:var(--ip-primary-bg); color:var(--ip-primary);
          font-size:var(--text-sm); font-weight:500;
        `;
        chip.textContent = mapData.actors[i];
        const del = document.createElement('button');
        del.style.cssText = 'background:none; border:none; cursor:pointer; color:var(--ip-primary); font-size:14px; padding:0; margin-left:4px;';
        del.innerHTML = '&times;';
        del.addEventListener('click', () => {
          mapData.actors.splice(i, 1);
          // Remove associated flows
          mapData.flows = mapData.flows.filter(f => f.from !== i && f.to !== i);
          onChange(data);
          renderActors();
          renderFlows();
        });
        chip.appendChild(del);
        actorsList.appendChild(chip);
      }
    }
    renderActors();
    actorsSection.appendChild(actorsList);

    const addActorInput = document.createElement('input');
    addActorInput.className = 'canvas-add-input';
    addActorInput.placeholder = i18n('placeholder.add_actor');
    addActorInput.style.maxWidth = '300px';
    addActorInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && addActorInput.value.trim()) {
        mapData.actors.push(addActorInput.value.trim());
        onChange(data);
        renderActors();
        addActorInput.value = '';
      }
    });
    actorsSection.appendChild(addActorInput);
    mapContainer.appendChild(actorsSection);

    // Value flows
    const flowsSection = document.createElement('div');
    const flowsHeader = document.createElement('h4');
    flowsHeader.style.marginBottom = 'var(--space-sm)';
    flowsHeader.textContent = i18n('canvas.value_flows');
    flowsSection.appendChild(flowsHeader);

    const flowsList = document.createElement('div');
    flowsList.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

    function renderFlows() {
      flowsList.innerHTML = '';
      for (let i = 0; i < mapData.flows.length; i++) {
        const flow = mapData.flows[i];
        const flowEl = document.createElement('div');
        flowEl.className = 'canvas-item';
        flowEl.style.cssText = 'display:flex; align-items:center; gap:8px;';
        flowEl.innerHTML = `
          <span style="font-weight:500;">${mapData.actors[flow.from] || '?'}</span>
          <span class="material-icons icon-sm" style="color:var(--ip-primary);">arrow_forward</span>
          <span style="font-weight:500;">${mapData.actors[flow.to] || '?'}</span>
          <span style="color:var(--gray-500); font-size:var(--text-xs);">(${flow.value})</span>
        `;
        const del = document.createElement('button');
        del.className = 'canvas-item__remove';
        del.innerHTML = '&times;';
        del.addEventListener('click', () => {
          mapData.flows.splice(i, 1);
          onChange(data);
          renderFlows();
        });
        flowEl.appendChild(del);
        flowsList.appendChild(flowEl);
      }
    }
    renderFlows();
    flowsSection.appendChild(flowsList);

    // Add flow form
    if (mapData.actors.length >= 2) {
      const addFlowForm = document.createElement('div');
      addFlowForm.style.cssText = 'display:flex; gap:8px; align-items:center; margin-top:8px; flex-wrap:wrap;';

      const fromSelect = document.createElement('select');
      fromSelect.className = 'form-select';
      fromSelect.style.fontSize = 'var(--text-sm)';
      for (let i = 0; i < mapData.actors.length; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = mapData.actors[i];
        fromSelect.appendChild(opt);
      }
      addFlowForm.appendChild(fromSelect);

      const arrow = document.createElement('span');
      arrow.className = 'material-icons icon-sm';
      arrow.textContent = 'arrow_forward';
      addFlowForm.appendChild(arrow);

      const toSelect = document.createElement('select');
      toSelect.className = 'form-select';
      toSelect.style.fontSize = 'var(--text-sm)';
      for (let i = 0; i < mapData.actors.length; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = mapData.actors[i];
        toSelect.appendChild(opt);
      }
      if (mapData.actors.length > 1) toSelect.value = '1';
      addFlowForm.appendChild(toSelect);

      const valueInput = document.createElement('input');
      valueInput.className = 'form-input';
      valueInput.style.cssText = 'max-width:200px; font-size:var(--text-sm);';
      valueInput.placeholder = i18n('placeholder.value_type');
      addFlowForm.appendChild(valueInput);

      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary btn-sm';
      addBtn.textContent = i18n('btn.add');
      addBtn.addEventListener('click', () => {
        if (valueInput.value.trim() && fromSelect.value !== toSelect.value) {
          mapData.flows.push({
            from: parseInt(fromSelect.value),
            to: parseInt(toSelect.value),
            value: valueInput.value.trim()
          });
          onChange(data);
          renderFlows();
          valueInput.value = '';
        }
      });
      addFlowForm.appendChild(addBtn);
      flowsSection.appendChild(addFlowForm);
    }

    mapContainer.appendChild(flowsSection);
  }

  renderMap();
  return container;
}

export { renderEcosystemMap };
