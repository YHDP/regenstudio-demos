// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Router — Hash-based routing for the SPA
 *
 * Routes:
 *   #portfolio              → Portfolio Dashboard
 *   #project/{id}           → Project View (all phases)
 *   #project/{id}/phase/{n} → Scrolls to specific phase
 *   #project/{id}/tool/{t}  → Opens tool overlay
 *   #project/{id}/report/{s}→ Report view (phase-N or project)
 *   #create                 → New project modal
 *   #toolkit                → Toolkit library
 */

let routes = {};
let currentRoute = null;
let currentParams = {};

/** Parse the current hash into route name and params */
function parseHash(hash) {
  const h = hash.replace(/^#\/?/, '') || 'portfolio';

  // #project/{id}/report/{scope}
  let m = h.match(/^project\/([^/]+)\/report\/(.+)$/);
  if (m) return { route: 'report', params: { projectId: m[1], scope: m[2] } };

  // #project/{id}/tool/{type}
  m = h.match(/^project\/([^/]+)\/tool\/(.+)$/);
  if (m) return { route: 'tool', params: { projectId: m[1], toolType: m[2] } };

  // #project/{id}/phase/{n}
  m = h.match(/^project\/([^/]+)\/phase\/(\d+)$/);
  if (m) return { route: 'project', params: { projectId: m[1], phaseIndex: parseInt(m[2]) } };

  // #project/{id}
  m = h.match(/^project\/([^/]+)$/);
  if (m) return { route: 'project', params: { projectId: m[1] } };

  // #create
  if (h === 'create') return { route: 'create', params: {} };

  // #toolkit
  if (h === 'toolkit') return { route: 'toolkit', params: {} };

  // Default: portfolio
  return { route: 'portfolio', params: {} };
}

/** Navigate to a route */
function navigate(hash) {
  window.location.hash = hash;
}

/** Register route handlers */
function registerRoute(name, handler) {
  routes[name] = handler;
}

/** Handle hash change */
function handleHashChange() {
  const { route, params } = parseHash(window.location.hash);
  currentRoute = route;
  currentParams = params;

  const handler = routes[route];
  if (handler) {
    handler(params);
  } else {
    console.warn('router: No handler for route:', route);
  }
}

/** Initialize router */
function initRouter() {
  window.addEventListener('hashchange', handleHashChange);
  // Handle initial route
  handleHashChange();
}

/** Get current route info */
function getCurrentRoute() {
  return { route: currentRoute, params: currentParams };
}

export {
  initRouter,
  navigate,
  registerRoute,
  getCurrentRoute,
  parseHash
};
