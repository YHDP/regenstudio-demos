# NOTICE — Spatial Pipeline

Spatial Pipeline is licensed under the PolyForm Noncommercial License 1.0.0 (`https://polyformproject.org/licenses/noncommercial/1.0.0/`). Source code copyright © 2024-2026 Regen Studio B.V.

This notice acknowledges third-party open-source software bundled in the `lib/` directory.

## Bundled libraries

### three.js (0.170.0)
- **Author**: mrdoob and three.js contributors
- **License**: MIT
- **URL**: https://github.com/mrdoob/three.js
- **Files**: `lib/three.module.js`, `lib/addons/`

### OrbitControls (three.js addon)
- **Author**: three.js contributors
- **License**: MIT
- **URL**: https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js
- **Files**: `lib/addons/controls/OrbitControls.js`

### GLTFExporter (three.js addon)
- **Author**: three.js contributors
- **License**: MIT
- **URL**: https://github.com/mrdoob/three.js/blob/master/examples/jsm/exporters/GLTFExporter.js
- **Files**: `lib/addons/exporters/GLTFExporter.js`

### BufferGeometryUtils (three.js addon)
- **Author**: three.js contributors
- **License**: MIT
- **URL**: https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/BufferGeometryUtils.js
- **Files**: `lib/addons/utils/BufferGeometryUtils.js` (vendored if/when needed)

### earcut (2.2.4)
- **Author**: Mapbox
- **License**: ISC
- **URL**: https://github.com/mapbox/earcut
- **Files**: `lib/earcut.js`

### turf.js (7.2.0)
- **Author**: Turfjs contributors (Mapbox-originated)
- **License**: MIT
- **URL**: https://github.com/Turfjs/turf
- **Files**: `lib/turf.min.js`

### @google/model-viewer (4.2.0)
- **Author**: Google LLC
- **License**: Apache-2.0 (package); BSD-3-Clause (bundled Lit dependencies, declared in source headers)
- **URL**: https://github.com/google/model-viewer
- **Files**: `lib/model-viewer.min.js` (~1 MB; loaded ONLY on `viewer-2.html`, not on the main demo)
- **Purpose**: provides the `<model-viewer>` web component used by `viewer-2.html` to render the exported `.glb` in a second, fully independent engine — concrete proof of the "no vendor lock-in" claim.

## Runtime data-fetches (live external APIs)

The demo performs one outbound network call at runtime to a public Dutch government open API. No authentication, no tracking, no cookies. Verifiable via browser DevTools Network panel.

### Luchtmeetnet open API (RIVM)
- **Source**: Rijksinstituut voor Volksgezondheid en Milieu (RIVM), Nederland
- **API**: `https://api.luchtmeetnet.nl/open_api`
- **Endpoints called**: `/stations/{id}`, `/measurements?station_number=...&formula=PM10`
- **Data license**: CC0 1.0 Universal (Public Domain Dedication)
- **Authentication**: none (open API, CORS-open `*`)
- **Purpose**: demonstrates the on-demand attribute-fetch architecture by showing live PM10 readings near the loaded region.
- **Frequency**: once on page-load + every 5 minutes while the tab is open. No persistent storage in the browser.

## Open-data inputs (sample-data/)

### 3D BAG (CityJSON tile)
- **Source**: 3DBAG, TU Delft 3D Geoinformation Group
- **License**: Creative Commons Attribution 4.0 (CC-BY 4.0)
- **URL**: https://3dbag.nl/
- **File**: `sample-data/8-296-632.city.json` (and `.gz` variant)

### IMRO bestemmingsplannen (GML)
- **Source**: ruimtelijkeplannen.nl (Geonovum / IPLO)
- **License**: open data (no redistribution restrictions)
- **Files**:
    - `sample-data/NL.IMRO.0537.bpVLKplv-VA01.gml` — Valkenhorst (IMRO2012)
    - `sample-data/NL.IMRO.0537.bpVLKdorp-va02.gml` — Valkenburg Dorp (IMRO2008)

## Why PolyForm-NC for the application code?

The Spatial Pipeline application source code (HTML/CSS/JS in this directory excluding `lib/`) is licensed under the PolyForm Noncommercial License to allow free use for research, education, evaluation, and personal projects, while reserving commercial deployment to a separately-negotiated license with Regen Studio B.V. The bundled MIT/ISC libraries above retain their original licenses regardless of how this application is used.
