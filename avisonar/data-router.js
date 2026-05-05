/* Copyright 2026 Regen Studio B.V.
   Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE

   AviSonar demo data-router.

   Intercepts the dashboard's `/api/*` fetch calls and serves frozen JSON
   from `./data/api/*.json` (and PNG spectrograms from
   `./data/api/spectrogram/archive/<file>.png`). Stubs out write paths
   (POST/PUT/DELETE) so demo visitors can click around without breaking
   anything. Adds `body.demo-mode` so demo-only CSS rules can hide write
   controls. Disables the live-recorder polling. Injects an attribution
   banner.

   Single file, no build step. Loaded before the dashboard JS runs.
*/
(function () {
  'use strict';

  const READ_PASSTHROUGH = ['/data/', './data/', '/audio/', './audio/'];
  const APP_ROOT = location.pathname.replace(/\/[^/]*$/, '/'); // e.g. "/avisonar/"

  function urlEncodePath(s) { return s.split('/').map(encodeURIComponent).join('/'); }

  // Rewrite an API URL to its static-data equivalent.
  function rewriteApiUrl(input) {
    let url;
    try {
      url = new URL(input, location.origin + APP_ROOT);
    } catch (e) {
      return null;
    }
    const pathname = url.pathname;
    const params = url.searchParams;

    if (!pathname.startsWith('/api/')) return null;

    // /api/spectrogram?file=X&source=archive|preview  →  ./data/api/spectrogram/<source>/<file>.png
    if (pathname === '/api/spectrogram') {
      const file = params.get('file') || '';
      const source = params.get('source') || 'archive';
      return APP_ROOT + 'data/api/spectrogram/' + source + '/' + urlEncodePath(file) + '.png';
    }

    // /api/spectrogram/analyze  → demo doesn't support per-region analysis
    if (pathname === '/api/spectrogram/analyze') {
      return APP_ROOT + 'data/api/spectrogram-analyze-demo-stub.json';
    }

    // /api/xeno-canto/references  → blank stub (we ship no XC links in demo)
    if (pathname === '/api/xeno-canto/references') {
      return APP_ROOT + 'data/api/xeno-canto-references-demo-stub.json';
    }

    // /api/xeno-canto/image  → return attribution placeholder
    if (pathname === '/api/xeno-canto/image') {
      return null; // let it 404 — UI handles missing reference image
    }

    // /api/export/csv  → demo doesn't support export
    if (pathname === '/api/export/csv') {
      return null;
    }

    // /api/calls/{id}/predictions → /data/api/calls/{id}/predictions.json
    // /api/conservation/{name} → /data/api/conservation/<URL-encoded name>.json
    // /api/observations/{date} → /data/api/observations/<date>.json
    // /api/species/detail → /data/api/species/detail/<URL-encoded name>.json
    // /api/analytics/species-* → /data/api/analytics/species-*/<URL-encoded name>.json
    // /api/calls (with filter) → keyed by sorted-querystring suffix
    // Otherwise: /api/<path> → /data/api/<path>.json with no query string

    let staticPath = pathname;

    if (pathname === '/api/species/detail') {
      const name = params.get('name') || '';
      staticPath = '/api/species/detail/' + name;
    } else if (pathname.startsWith('/api/analytics/species-')) {
      const name = params.get('name') || '';
      if (name) staticPath = pathname + '/' + name;
    } else if (pathname === '/api/observations' && (params.get('from') || params.get('to'))) {
      const from = params.get('from') || '';
      const to = params.get('to') || '';
      staticPath = '/api/observations/_range_' + from + '_' + to;
    } else if (pathname === '/api/calls' && [...params.keys()].length > 0) {
      // Encode filter combinations the dashboard uses
      const sortedKeys = [...params.keys()].sort();
      const qs = sortedKeys.map(k => `${k}_${params.get(k)}`).join('_');
      staticPath = '/api/calls' + (qs ? '_' + qs : '');
    }

    return APP_ROOT + 'data' + urlEncodePath(staticPath) + '.json';
  }

  // Wrap fetch: rewrite GETs to /api/*, stub POST/PUT/DELETE.
  const _origFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();

    // Stub mutating verbs
    if (url.indexOf('/api/') !== -1 && method !== 'GET' && method !== 'HEAD') {
      return new Response(
        JSON.stringify({ ok: true, demo: true, message: 'Demo mode — write disabled.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rewrite GETs hitting /api/*
    if (url.indexOf('/api/') !== -1) {
      const rewritten = rewriteApiUrl(url);
      if (rewritten) return _origFetch(rewritten, init);
      // Endpoints without a static target: 404 gracefully
      return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    // Pass-through everything else
    return _origFetch(input, init);
  };

  // Body class (drives the demo-overrides.css hide-list)
  function tagBody() {
    document.body && document.body.classList.add('demo-mode');
  }
  if (document.body) tagBody(); else document.addEventListener('DOMContentLoaded', tagBody);

  // Banner (shown above the dashboard top-nav). Only attribution + read-only badge —
  // matches AviSonar's local-first promise: no upload, no record, frozen dataset.
  function injectBanner() {
    if (document.querySelector('.avisonar-demo-banner')) return;
    const div = document.createElement('div');
    div.className = 'avisonar-demo-banner';
    div.innerHTML =
      '<strong>Demo</strong> · Frozen Xeno-Canto / iNaturalist (CC-BY) bird audio · No personal recordings · ' +
      '<a href="./attributions.md">attributions</a> · ' +
      'For the real local-first version: <a href="mailto:info@regenstudio.world">info@regenstudio.world</a>';
    document.body && document.body.insertBefore(div, document.body.firstChild);
  }
  if (document.body) injectBanner(); else document.addEventListener('DOMContentLoaded', injectBanner);
})();
