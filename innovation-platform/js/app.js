/**
 * App — Entry point, initialization, data loading
 */

import { initI18n, i18n, onLangChange } from './i18n.js';
import { initState } from './state.js';
import { initRouter, registerRoute, navigate } from './router.js';
import { createLangSwitcher } from './components/lang-switcher.js';
import { showCreateProjectModal } from './components/create-project.js';
import { renderPortfolio } from './views/portfolio.js';
import { renderProjectDetail } from './views/project-detail.js';
import { renderReportView } from './views/report-view.js';
import { renderToolkitLibrary } from './views/toolkit-library.js';
import { openCanvas } from './canvases/canvas-manager.js';

let processData = null;
let appMain = null;

async function init() {
  // Initialize i18n
  await initI18n();

  // Load process data
  try {
    const resp = await fetch('data/process.json');
    processData = await resp.json();
  } catch (e) {
    console.error('Failed to load process.json', e);
    document.body.innerHTML = '<div style="padding:40px;text-align:center;"><h1>Failed to load process data</h1><p>Please check that data/process.json exists.</p></div>';
    return;
  }

  // Load sample projects
  let sampleProjects = [];
  try {
    const resp = await fetch('data/sample-projects.json');
    sampleProjects = await resp.json();
  } catch (e) {
    console.warn('No sample projects found');
  }

  // Initialize state
  await initState(sampleProjects);

  // Build app shell
  buildAppShell();

  // Register routes
  registerRoute('portfolio', () => {
    renderPortfolio(appMain, processData);
  });

  registerRoute('project', (params) => {
    renderProjectDetail(appMain, params, processData);
  });

  registerRoute('create', () => {
    // Show portfolio with create modal overlay
    renderPortfolio(appMain, processData);
    showCreateProjectModal(document.body);
  });

  registerRoute('report', (params) => {
    renderReportView(appMain, params, processData);
  });

  registerRoute('tool', (params) => {
    // Render project in background, then open canvas
    renderProjectDetail(appMain, params, processData);
    openCanvas(params.projectId, params.toolType, processData);
  });

  registerRoute('toolkit', () => {
    renderToolkitLibrary(appMain, processData);
  });

  // On language change, re-render current view
  onLangChange(() => {
    // Re-trigger current route
    const hash = window.location.hash;
    window.location.hash = '';
    setTimeout(() => { window.location.hash = hash || '#portfolio'; }, 0);
  });

  // Start router
  initRouter();
}

function buildAppShell() {
  // Header
  const header = document.querySelector('.app-header');
  if (header) {
    // Logo
    const logo = header.querySelector('.app-header__logo');
    if (logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', () => navigate('#portfolio'));
    }

    // Nav
    const nav = header.querySelector('.app-header__nav');
    if (nav) {
      // Toolkit button
      const toolkitBtn = document.createElement('button');
      toolkitBtn.className = 'btn btn-ghost btn-sm';
      toolkitBtn.innerHTML = `<span class="material-icons icon-sm">construction</span> <span>${i18n('nav.toolkit')}</span>`;
      toolkitBtn.addEventListener('click', () => navigate('#toolkit'));
      nav.appendChild(toolkitBtn);

      // Language switcher
      const langSwitcher = createLangSwitcher();
      nav.appendChild(langSwitcher);
    }
  }

  // Main content area
  appMain = document.querySelector('.app-main');
  if (!appMain) {
    appMain = document.createElement('main');
    appMain.className = 'app-main';
    document.body.appendChild(appMain);
  }
}

// Boot
document.addEventListener('DOMContentLoaded', init);
