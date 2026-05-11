/*
 * Live publieke open-data bronnen voor de "Live ophalen vanuit bron" knop.
 * Bewijst dat dezelfde pipeline werkt op real-time data uit Nederlandse
 * overheidsbronnen — zonder NDA, zonder API-key, zonder vendor-lock-in.
 *
 * (c) 2024-2026 Regen Studio B.V. — PolyForm Noncommercial License 1.0.0
 *
 * CORS-status (geverifieerd 2026-05-11):
 *   - data.3dbag.nl                : Access-Control-Allow-Origin: *
 *   - www.ruimtelijkeplannen.nl    : Access-Control-Allow-Origin: *
 */

// 1-op-1 mapping van sample-data filenames → live publieke URLs.
// Wordt geraadpleegd door loadSamples(useLive=true) in app.js.
export const LIVE_URLS = {
  '8-296-632.city.json.gz':
    'https://data.3dbag.nl/v20250903/tiles/8/296/632/8-296-632.city.json.gz',
  'NL.IMRO.0537.bpVLKplv-VA01.gml':
    'https://www.ruimtelijkeplannen.nl/documents/NL.IMRO.0537.bpVLKplv-VA01/NL.IMRO.0537.bpVLKplv-VA01.gml',
  'NL.IMRO.0537.bpVLKdorp-va02.gml':
    'https://www.ruimtelijkeplannen.nl/documents/NL.IMRO.0537.bpVLKdorp-va02/NL.IMRO.0537.bpVLKdorp-va02.gml',
};

/**
 * Resolveer een sample-data filename naar een fetch-URL.
 * useLive=false  → './sample-data/<file>'  (bundled, offline)
 * useLive=true   → publieke open-data URL  (live, CORS-open)
 */
export function resolveSourceUrl(filename, useLive) {
  if (useLive && LIVE_URLS[filename]) return LIVE_URLS[filename];
  return `sample-data/${filename}`;
}
