import { navigate } from '../app.js';
import { getState, setState } from '../data/state.js';
import { getCredentialById } from '../data/credentials.js';
import { getVerifiersForCredential } from '../data/verifiers.js';
import { createAppBar } from '../components/app-bar.js';
import { t } from '../data/translations.js';
import { td } from '../data/data-i18n.js';

export function renderCredentialDetail(container) {
  container.classList.add('detail-screen');
  const credId = getState().selectedCredential;
  const cred = getCredentialById(credId);
  if (!cred) return;

  // App bar
  container.appendChild(createAppBar(td(cred.title), () => navigate('dashboard', 'back')));

  const content = document.createElement('div');
  content.className = 'screen-content';
  content.style.paddingTop = '0';

  // Header card
  const statusBadge = cred.status
    ? `<div style="display:inline-flex;align-items:center;gap:4px;margin-top:8px;padding:4px 10px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:12px;font-weight:600;">
        <span style="width:8px;height:8px;border-radius:50%;background:${cred.statusColor || '#fff'}"></span>
        ${td(cred.status)}
      </div>`
    : '';

  let headerHtml = `
    <div class="detail-header-card" style="background: ${cred.color}">
      <div class="detail-issuer">${td(cred.issuer)}</div>
      <div class="detail-title">${td(cred.title)}</div>
      <div class="detail-subtitle">${td(cred.subtitle)}</div>
      ${statusBadge}
    </div>
  `;

  // Modules or simple attributes
  let modulesHtml = '<div class="detail-modules">';

  if (cred.type === 'pid') {
    // PID: simple attribute list
    modulesHtml += `<div class="accordion"><button type="button" class="accordion-header open" data-accordion="pid-attrs">${t('detail.personalData')}<span class="material-icons">expand_more</span></button>`;
    modulesHtml += '<div class="accordion-body open"><div class="accordion-content">';
    for (const [key, val] of Object.entries(cred.attributes)) {
      modulesHtml += `<div class="attr-row"><span class="attr-label">${td(key)}</span><span class="attr-value">${td(val)}</span></div>`;
    }
    modulesHtml += '</div></div></div>';
  } else if (cred.modules) {
    // DPP: accordion per module
    let modIndex = 0;
    for (const [modKey, mod] of Object.entries(cred.modules)) {
      const isFirst = modIndex === 0;
      modIndex++;
      modulesHtml += `
        <div class="accordion">
          <button type="button" class="accordion-header${isFirst ? ' open' : ''}" data-accordion="${modKey}">
            <span style="display:flex;align-items:center;gap:8px;">
              <span class="material-icons" style="font-size:20px;color:${cred.color}">${mod.icon}</span>
              ${td(mod.label)}
            </span>
            <span class="material-icons">expand_more</span>
          </button>
          <div class="accordion-body${isFirst ? ' open' : ''}">
            <div class="accordion-content">
      `;

      // Score gauge
      if (mod.score) {
        modulesHtml += `
          <div class="score-gauge" style="margin-bottom:12px;">
            <span class="score-value" style="color:${cred.color}">${mod.score.value}</span>
            <span class="score-label">${mod.score.unit}<br>${mod.score.label}</span>
          </div>
        `;
      }

      // Progress bars
      if (mod.bars) {
        mod.bars.forEach(bar => {
          modulesHtml += `
            <div style="margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
                <span style="color:var(--color-text-secondary)">${td(bar.label)}</span>
                <span style="font-weight:600;color:var(--color-text)">${bar.value}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill animate" style="width:${bar.value}%;background:${bar.color}"></div>
              </div>
            </div>
          `;
        });
      }

      // Timeline
      if (mod.timeline) {
        modulesHtml += '<div class="timeline">';
        mod.timeline.forEach(item => {
          modulesHtml += `
            <div class="timeline-item">
              <div class="timeline-dot" style="background:${cred.color}"></div>
              <div class="timeline-content">
                <div class="timeline-title">${td(item.title)}</div>
                <div class="timeline-desc">${td(item.desc)}</div>
              </div>
            </div>
          `;
        });
        modulesHtml += '</div>';
      }

      // Attributes table
      if (mod.attrs) {
        for (const [key, val] of Object.entries(mod.attrs)) {
          modulesHtml += `<div class="attr-row"><span class="attr-label">${td(key)}</span><span class="attr-value">${td(val)}</span></div>`;
        }
      }

      modulesHtml += '</div></div></div>';
    }
  }

  modulesHtml += '</div>';

  content.innerHTML = headerHtml + modulesHtml;
  container.appendChild(content);

  // Accordion toggle
  content.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('open');
      const body = header.nextElementSibling;
      body.classList.toggle('open');
    });
  });

  // Share button (vergunningen en DPP)
  if (cred.type === 'vergunning' || cred.type === 'dpp') {
    const fab = document.createElement('div');
    fab.className = 'detail-share-fab';
    fab.innerHTML = `<button type="button" class="btn btn-primary btn-full">
      <span class="material-icons">share</span>
      ${t('detail.share')}
    </button>`;
    fab.querySelector('button').addEventListener('click', () => {
      showVerifierSelection(container, cred);
    });
    container.appendChild(fab);
  }
}

function showVerifierSelection(container, cred) {
  const allVerifiers = getVerifiersForCredential(cred.id);

  const overlay = document.createElement('div');
  overlay.className = 'screen active slide-up';
  overlay.style.background = 'var(--color-surface)';
  overlay.style.zIndex = '60';

  overlay.appendChild(createAppBar(`${td(cred.title)} — ${t('detail.share')}`, () => {
    overlay.classList.remove('slide-up');
    overlay.classList.add('slide-down');
    setTimeout(() => overlay.remove(), 400);
  }));

  const body = document.createElement('div');
  body.style.cssText = 'padding-top:calc(var(--app-bar-height) + var(--safe-area-top) + 16px);';

  body.innerHTML = `
    <div style="margin:0 24px 8px;padding:12px 16px;background:var(--color-white);border-radius:12px;border:1px solid var(--color-border);display:flex;align-items:center;gap:12px;">
      <div style="width:36px;height:36px;border-radius:8px;background:${cred.color};display:flex;align-items:center;justify-content:center;">
        <span class="material-icons" style="color:#fff;font-size:18px">${cred.icon}</span>
      </div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:600;color:var(--color-text)">${td(cred.title)}</div>
        <div style="font-size:12px;color:var(--color-text-secondary)">${t('detail.shareWith')}</div>
      </div>
    </div>

    <!-- Search bar -->
    <div class="add-search-section">
      <div class="add-search-bar">
        <span class="material-icons add-search-icon">search</span>
        <input type="text" class="add-search-input" id="verifier-search" placeholder="${t('detail.searchVerifier')}" autocomplete="off">
        <button type="button" class="add-search-clear hidden" id="verifier-search-clear">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>

    <div style="padding:8px 24px 8px;font-size:13px;font-weight:600;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;" id="verifier-label">${t('detail.availableVerifiers')}</div>
  `;

  const list = document.createElement('div');
  list.style.cssText = 'padding:0 24px;';

  const emptyEl = document.createElement('div');
  emptyEl.className = 'add-empty hidden';
  emptyEl.innerHTML = `
    <span class="material-icons" style="font-size:40px;color:var(--color-border)">search_off</span>
    <p style="margin-top:8px;color:var(--color-text-secondary);font-size:13px">${t('detail.noVerifiers')}</p>
  `;

  function renderVerifierCards(items) {
    list.innerHTML = '';
    items.forEach(v => {
      const card = document.createElement('div');
      card.className = 'verifier-card';
      card.innerHTML = `
        <div class="verifier-icon" style="background:${v.iconBg};color:${v.iconColor}">
          <span class="material-icons">${v.icon}</span>
        </div>
        <div class="verifier-info">
          <div class="verifier-name">${td(v.name)}</div>
          <div class="verifier-desc">${td(v.purpose)}</div>
        </div>
        <span class="material-icons" style="color:var(--color-text-secondary)">chevron_right</span>
      `;
      card.addEventListener('click', () => {
        setState({ selectedVerifier: v.id });
        overlay.remove();
        navigate('disclosure-request');
      });
      list.appendChild(card);
    });
  }

  renderVerifierCards(allVerifiers);

  // Search logic
  const searchInput = body.querySelector('#verifier-search');
  const clearBtn = body.querySelector('#verifier-search-clear');
  const labelEl = body.querySelector('#verifier-label');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    clearBtn.classList.toggle('hidden', q.length === 0);

    const filtered = q.length === 0
      ? allVerifiers
      : allVerifiers.filter(v =>
          v.name.toLowerCase().includes(q) ||
          v.purpose.toLowerCase().includes(q)
        );

    labelEl.textContent = q.length === 0
      ? t('detail.availableVerifiers')
      : filtered.length > 0
        ? `${filtered.length} ${t('results')}`
        : '';

    renderVerifierCards(filtered);
    emptyEl.classList.toggle('hidden', filtered.length > 0);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    labelEl.textContent = t('detail.availableVerifiers');
    renderVerifierCards(allVerifiers);
    emptyEl.classList.add('hidden');
  });

  body.appendChild(list);
  body.appendChild(emptyEl);
  overlay.appendChild(body);
  container.appendChild(overlay);
}
