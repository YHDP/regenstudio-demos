# lib/ — vendored third-party dependencies

All dependencies are self-hosted. The application makes **no runtime calls** to CDN-hosted JavaScript or CSS at any time. This is the directory where each is pinned.

| File | Library | Version | License | Source |
|---|---|---|---|---|
| `three.module.js` | three.js | 0.170.0 | MIT | https://github.com/mrdoob/three.js |
| `addons/controls/OrbitControls.js` | OrbitControls (three.js addon) | 0.170.0 | MIT | three.js examples/jsm |
| `addons/exporters/GLTFExporter.js` | GLTFExporter (three.js addon) | 0.170.0 | MIT | three.js examples/jsm |
| `earcut.js` | earcut | 2.2.4 | ISC | https://github.com/mapbox/earcut |
| `turf.min.js` | turf.js (full bundle) | 7.2.0 | MIT | https://github.com/Turfjs/turf |

## Update procedure

When upgrading a library, replace the file under the same path. Update the version in the table above and in the project root `NOTICE.md` in the same commit. If the library introduces breaking API changes, mention them in the project changelog.

For three.js addons, the addon file's version follows the parent three.js version — keep them in lockstep.

## Why pinned versions?

Privacy + reproducibility. CDN-loaded scripts can change behaviour silently and represent third-party network calls that contradict this project's "no upload, no backend, no telemetry" guarantee. Pinning forces explicit upgrades through git history.
