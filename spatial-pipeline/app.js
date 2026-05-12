/*
 * Spatial Pipeline — main application module
 * (c) 2024-2026 Regen Studio B.V. — PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 *
 * Pipeline:
 *   CityJSON (3D BAG)  ──┐
 *                        ├──▶  geometric ID-join  ──▶  joined dataset  ──▶ 3D viewer (click → attribute)
 *   IMRO GML (plan-N)  ──┘     (point-in-polygon,           │            ──▶ HV-station-inpassings-analyse
 *                              eerst-match-wint per             │            ──▶ glTF 2.0 export
 *                              gebouw, alle matches              │            ──▶ JSON-LD export (provenance per plan)
 *                              verzameld voor overlays)         │
 *
 * All processing client-side. No upload, no backend.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { fetchLatestPM10, fetchStationMeta } from './data-sources/luchtmeetnet.js';
import { resolveSourceUrl } from './data-sources/live-sources.js';
import { initPzhContext } from './pzh-context.js';

// =====================================================================
//  State — multi-source pijpleiding
// =====================================================================
const state = {
  cityjson: null,        // raw parsed CityJSON
  plans: [],             // [{ id, label, source, year?, namespaceVersion, enkelbestemmingen, dubbelbestemmingen, color }]
  contextLayer: null,    // { kind, label, features: [{type, coords|coords[], properties}] } — optional CSV/GeoJSON
  contextMeshes: [],     // three.js meshes voor context-laag-visualisatie
  buildings: null,       // [{id, bagId, attributes, mesh, footprint}]
  joined: null,          // Map<buildingId, { primary, overlays[], primaryPlanId, overlayPlanIds[] }>
  extent: null,          // {minX, maxX, minY, maxY, minZ, maxZ}
  viewer: null,
  meshes: [],            // building meshes (raycastable)
  bestemmingMeshes: [],  // plan-vlak meshes (visual)
  planOutlineMeshes: [], // plan-perimeter outlines (LineLoop per plan)
  planLabelMeshes: [],   // floating plan-labels (Sprite per plan; exportSkip)
  groundMesh: null,      // single flat ground plane (browser-only; exportSkip)
  selectedMesh: null,
  viewMode: 'bestemming',// 'bestemming' | 'bron-plan' | 'use-case-hv'
  hvResults: null,       // [{ verdict, reasons[], areaM2, ... }] — populated when use-case-hv mode active
  cameraPreset: 'default',
  coverageStats: null,   // { perPlan[], unmatched, totalBuildings, geometryBytes, attributesBytes }
};

// Bestemmingshoofdgroep → kleur (IMRO-codering, palet zelfgekozen).
// IMRO bestemmingshoofdgroep → kleur (NL cartografie-conventie).
// Locked 2026-05-12 op basis van Yvo's 5 broad strokes + NL convention voor rest.
//   wonen geel · gemengd oranje · bedrijf rood · groen/natuur groen · agrarisch licht-groen
// UI-chrome (header/buttons/typografie) volgt Regen brand-bible separately (Fase 2).
const COLOR_MAP = {
  // YELLOW family — wonen
  woongebied:       0xf5c344,
  wonen:            0xf5c344,
  // ORANGE family — gemengd / commerce / horeca
  gemengd:          0xea7c1d,
  detailhandel:     0xea7c1d,
  centrum:          0xd96b3a,
  horeca:           0xe58a3d,
  // RED — bedrijf
  bedrijf:          0xc44949,
  bedrijventerrein: 0xc44949,
  // GREEN family — natuur · groen · sport · recreatie · agrarisch
  natuur:           0x2f6b3f,
  groen:            0x6db26d,
  recreatie:        0xa8c890,
  sport:            0x98b88a,
  agrarisch:        0xc2dc8e,
  // BLUE family — water · waterstaat
  water:            0x5a9bd5,
  waterstaat:       0x3a6a92,
  // GREY family — verkeer · kantoor · dienstverlening
  verkeer:          0x909090,
  kantoor:          0x7c95a5,
  dienstverlening:  0x7c95a5,
  // PURPLE family — maatschappelijk · cultuur · leiding (dubbel)
  maatschappelijk:  0xb88dd1,
  cultuur:          0x9569b3,
  leiding:          0xc8a8d8,
  // BROWN/TAN — waarde (dubbel, cultureel-historisch)
  waarde:           0xb8a380,
  // Neutral fallback
  default:          0xd8d6cf,
};

// HV-analyse: kleurpalet + drempels.
const HV_VERDICT_COLOR = {
  suitable:    0x2a8d4e,  // groen — bestemming permits utility, no blocking overlay, distance OK
  constrained: 0xc79a3a,  // oranje — toelaatbaar maar overlay/afstand maakt het complex
  excluded:    0xb03a2e,  // rood — bestemming excludes utility (wonen/natuur/etc.)
};

// Bestemmingen die HV-station-inpassing TOELATEN (utility-vriendelijk).
const HV_PERMITTING = new Set([
  'leiding', 'bedrijf', 'bedrijventerrein', 'verkeer', 'agrarisch', 'waterstaat',
]);
// Bestemmingen die HV-station-inpassing UITSLUITEN.
const HV_EXCLUDING = new Set([
  'wonen', 'woongebied', 'natuur', 'recreatie', 'sport', 'cultuur', 'maatschappelijk',
]);
// Dubbelbestemmingen die het complexer maken (extra procedures, kosten).
const HV_OVERLAY_CONSTRAINING_KEYWORDS = ['waarde', 'archeologie', 'natuur', 'cultuur'];

// Plan-pill kleur-pool — toegewezen in volgorde van laden.
const PLAN_PILL_COLORS = [0x2a6d52, 0x7a4ea0, 0xb85e2c, 0x3c7da9, 0xa84272, 0x6b8e23];

function colorFor(hoofdgroep) {
  if (!hoofdgroep) return COLOR_MAP.default;
  const key = hoofdgroep.toLowerCase().trim();
  return COLOR_MAP[key] ?? COLOR_MAP.default;
}

function planPillColor(idx) { return PLAN_PILL_COLORS[idx % PLAN_PILL_COLORS.length]; }

// =====================================================================
//  File loading + decompression
// =====================================================================

async function readMaybeGzipped(file) {
  const buf = await file.arrayBuffer();
  const u8 = new Uint8Array(buf);
  const isGzip = u8[0] === 0x1f && u8[1] === 0x8b;
  if (!isGzip) return new TextDecoder().decode(buf);
  const ds = new DecompressionStream('gzip');
  const decompressed = new Response(new Blob([buf]).stream().pipeThrough(ds));
  return await decompressed.text();
}

async function fetchMaybeGzipped(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch ${url} failed: ${resp.status}`);
  const buf = await resp.arrayBuffer();
  const u8 = new Uint8Array(buf);
  const isGzip = u8[0] === 0x1f && u8[1] === 0x8b;
  if (!isGzip) return new TextDecoder().decode(buf);
  const ds = new DecompressionStream('gzip');
  const decompressed = new Response(new Blob([buf]).stream().pipeThrough(ds));
  return await decompressed.text();
}

// =====================================================================
//  CityJSON parser — extracts buildings + LoD2.2 mesh + footprint
// =====================================================================

function parseCityJSON(cj) {
  if (!cj.CityObjects || !cj.vertices) {
    throw new Error('Niet-geldige CityJSON — mist CityObjects of vertices.');
  }
  const tr = cj.transform || { scale: [1,1,1], translate: [0,0,0] };
  const verts = cj.vertices.map(v => [
    v[0] * tr.scale[0] + tr.translate[0],
    v[1] * tr.scale[1] + tr.translate[1],
    v[2] * tr.scale[2] + tr.translate[2],
  ]);

  const buildings = [];
  const ext = { minX:  Infinity, maxX: -Infinity,
                 minY:  Infinity, maxY: -Infinity,
                 minZ:  Infinity, maxZ: -Infinity };

  for (const [id, obj] of Object.entries(cj.CityObjects)) {
    if (obj.type !== 'Building') continue;

    const geomCandidates = [];
    if (obj.geometry) geomCandidates.push(...obj.geometry.map(g => ({g, owner: obj})));
    if (obj.children) {
      for (const childId of obj.children) {
        const child = cj.CityObjects[childId];
        if (child?.geometry) geomCandidates.push(...child.geometry.map(g => ({g, owner: child})));
      }
    }
    if (geomCandidates.length === 0) continue;

    geomCandidates.sort((a, b) => parseFloat(b.g.lod || 0) - parseFloat(a.g.lod || 0));
    const { g: bestGeom } = geomCandidates[0];

    const meshData = triangulateGeometry(bestGeom, verts);
    if (!meshData || meshData.indices.length === 0) continue;

    const footprint = computeFootprint(bestGeom, verts);

    for (let i = 0; i < meshData.positions.length; i += 3) {
      const x = meshData.positions[i], y = meshData.positions[i+1], z = meshData.positions[i+2];
      if (x < ext.minX) ext.minX = x; if (x > ext.maxX) ext.maxX = x;
      if (y < ext.minY) ext.minY = y; if (y > ext.maxY) ext.maxY = y;
      if (z < ext.minZ) ext.minZ = z; if (z > ext.maxZ) ext.maxZ = z;
    }

    buildings.push({
      id,
      bagId: obj.attributes?.identificatie ?? id,
      attributes: obj.attributes ?? {},
      mesh: meshData,
      footprint,
    });
  }

  return { buildings, extent: ext };
}

function triangulateGeometry(geom, verts) {
  let surfaces;
  if (geom.type === 'Solid')                          surfaces = geom.boundaries[0];
  else if (geom.type === 'MultiSurface')              surfaces = geom.boundaries;
  else if (geom.type === 'CompositeSurface')          surfaces = geom.boundaries;
  else if (geom.type === 'CompositeSolid')            surfaces = geom.boundaries.flat();
  else return null;

  const positions = [];
  const indices = [];

  for (const surface of surfaces) {
    if (!surface || surface.length === 0) continue;

    const outerRing = surface[0];
    const holes = surface.slice(1);
    if (outerRing.length < 3) continue;

    const surfVerts = [];
    for (const idx of outerRing) surfVerts.push(verts[idx]);
    const holeStarts = [];
    for (const hole of holes) {
      holeStarts.push(surfVerts.length);
      for (const idx of hole) surfVerts.push(verts[idx]);
    }

    const normal = newellNormal(surfVerts);
    const proj = project2DPlane(surfVerts, normal);
    const flat = new Float64Array(proj.length * 2);
    for (let i = 0; i < proj.length; i++) {
      flat[2*i  ] = proj[i][0];
      flat[2*i+1] = proj[i][1];
    }

    const tri = globalThis.earcut(flat, holeStarts, 2);
    if (tri.length === 0) continue;

    const baseIdx = positions.length / 3;
    for (const v of surfVerts) {
      positions.push(v[0], v[1], v[2]);
    }
    for (const i of tri) indices.push(baseIdx + i);
  }

  return { positions, indices };
}

function newellNormal(pts) {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < pts.length; i++) {
    const c = pts[i];
    const n = pts[(i + 1) % pts.length];
    nx += (c[1] - n[1]) * (c[2] + n[2]);
    ny += (c[2] - n[2]) * (c[0] + n[0]);
    nz += (c[0] - n[0]) * (c[1] + n[1]);
  }
  const len = Math.hypot(nx, ny, nz);
  if (len < 1e-9) return [0, 0, 1];
  return [nx/len, ny/len, nz/len];
}

function project2DPlane(pts, normal) {
  const tmp = Math.abs(normal[0]) < 0.9 ? [1,0,0] : [0,1,0];
  const u = cross(normal, tmp); normalizeInPlace(u);
  const v = cross(normal, u);
  return pts.map(p => [
    p[0]*u[0] + p[1]*u[1] + p[2]*u[2],
    p[0]*v[0] + p[1]*v[1] + p[2]*v[2],
  ]);
}

function cross(a, b) {
  return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
}
function normalizeInPlace(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len > 1e-9) { v[0] /= len; v[1] /= len; v[2] /= len; }
}

function computeFootprint(geom, verts) {
  let surfaces;
  if (geom.type === 'Solid')                          surfaces = geom.boundaries[0];
  else if (geom.type === 'MultiSurface' ||
           geom.type === 'CompositeSurface')          surfaces = geom.boundaries;
  else if (geom.type === 'CompositeSolid')            surfaces = geom.boundaries.flat();
  else return null;

  let lowest = null, lowestZ = Infinity;
  for (const surface of surfaces) {
    if (!surface || surface.length === 0) continue;
    const ring = surface[0];
    if (ring.length < 3) continue;
    const ringVerts = ring.map(idx => verts[idx]);
    const meanZ = ringVerts.reduce((s, v) => s + v[2], 0) / ringVerts.length;
    if (meanZ < lowestZ) { lowestZ = meanZ; lowest = ringVerts; }
  }
  if (!lowest) return null;
  const cx = lowest.reduce((s, v) => s + v[0], 0) / lowest.length;
  const cy = lowest.reduce((s, v) => s + v[1], 0) / lowest.length;
  return [cx, cy];
}

// =====================================================================
//  IMRO parser — auto-detects 2008 vs 2012 namespace
// =====================================================================

const IMRO_NAMESPACES = [
  { uri: 'http://www.geonovum.nl/imro/2012/1.1', label: 'IMRO2012' },
  { uri: 'http://www.geonovum.nl/imro/2008/1',   label: 'IMRO2008' },
];
const NS_GML_32 = 'http://www.opengis.net/gml/3.2';
const NS_GML    = 'http://www.opengis.net/gml';

function detectIMRONamespace(doc) {
  for (const ns of IMRO_NAMESPACES) {
    if (doc.getElementsByTagNameNS(ns.uri, 'Bestemmingsplangebied').length > 0
     || doc.getElementsByTagNameNS(ns.uri, 'Enkelbestemming').length > 0
     || doc.getElementsByTagNameNS(ns.uri, 'FeatureCollectionIMRO').length > 0) {
      return ns;
    }
  }
  return null;
}

// gml:posList lives under gml/3.2 (IMRO2012) or gml/3.1.1 (IMRO2008). Try both.
function getPosLists(el) {
  let list = el.getElementsByTagNameNS(NS_GML_32, 'posList');
  if (list.length === 0) list = el.getElementsByTagNameNS(NS_GML, 'posList');
  return list;
}

function getGmlId(el) {
  let id = el.getAttributeNS(NS_GML_32, 'id');
  if (!id) id = el.getAttributeNS(NS_GML, 'id');
  return id ?? '';
}

function parseIMRO(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const errs = doc.getElementsByTagName('parsererror');
  if (errs.length > 0) throw new Error('XML-parsefout: ' + errs[0].textContent.slice(0, 200));

  const ns = detectIMRONamespace(doc);
  if (!ns) throw new Error('Geen IMRO2012 of IMRO2008 namespace gevonden in dit GML-document.');

  // Plan-level metadata (used voor provenance in JSON-LD).
  const planmeta = extractPlanMeta(doc, ns.uri);
  const enkelbestemmingen = extractPlanObjects(doc, ns.uri, 'Enkelbestemming');
  const dubbelbestemmingen = extractPlanObjects(doc, ns.uri, 'Dubbelbestemming');
  const functieaanduidingen = extractPlanObjects(doc, ns.uri, 'Functieaanduiding');

  return {
    namespace: ns.uri,
    namespaceLabel: ns.label,
    meta: planmeta,
    enkelbestemmingen,
    dubbelbestemmingen,
    functieaanduidingen,
  };
}

function extractPlanMeta(doc, nsUri) {
  // Het Bestemmingsplangebied-element houdt de plan-naam + IMRO-id + datum
  // én de plan-perimeter (één of meerdere posLists die de plangrens vormen).
  const bpgs = doc.getElementsByTagNameNS(nsUri, 'Bestemmingsplangebied');
  if (bpgs.length === 0) return { naam: null, planId: null, datum: null, perimeter: [] };
  const bpg = bpgs[0];
  const perimeter = [];
  const posLists = getPosLists(bpg);
  for (const pl of posLists) {
    const nums = pl.textContent.trim().split(/\s+/).map(Number);
    const ring = [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      if (Number.isFinite(nums[i]) && Number.isFinite(nums[i+1])) {
        ring.push([nums[i], nums[i+1]]);
      }
    }
    if (ring.length >= 3) perimeter.push(ring);
  }
  return {
    naam:      textOf(bpg, nsUri, 'naam') || textOf(bpg, nsUri, 'datasetTitel'),
    planId:    textOf(bpg, nsUri, 'identificatie') || textOf(bpg, nsUri, 'lokaalID'),
    datum:     textOf(bpg, nsUri, 'datum') || textOf(bpg, nsUri, 'creatiedatum'),
    perimeter,
  };
}

function extractPlanObjects(doc, nsUri, tagName) {
  const out = [];
  const elements = doc.getElementsByTagNameNS(nsUri, tagName);
  for (const el of elements) {
    const id          = getGmlId(el);
    const naam        = textOf(el, nsUri, 'naam');
    const hoofdgroep  = textOf(el, nsUri, 'bestemmingshoofdgroep');
    const artikelnr   = textOf(el, nsUri, 'artikelnummer');
    const lokaalID    = textOf(el, nsUri, 'lokaalID');

    const polygons = [];
    const posLists = getPosLists(el);
    for (const pl of posLists) {
      const nums = pl.textContent.trim().split(/\s+/).map(Number);
      const ring = [];
      for (let i = 0; i + 1 < nums.length; i += 2) {
        if (Number.isFinite(nums[i]) && Number.isFinite(nums[i+1])) {
          ring.push([nums[i], nums[i+1]]);
        }
      }
      if (ring.length >= 3) polygons.push(ring);
    }

    out.push({ id, lokaalID, naam, hoofdgroep, artikelnummer: artikelnr, polygons });
  }
  return out;
}

function textOf(el, ns, tag) {
  const ch = el.getElementsByTagNameNS(ns, tag)[0];
  if (!ch) return null;
  // Collapse whitespace — IMRO2012 wraps identificatie in nested NEN3610ID elements
  // so textContent includes XML indentation. Single-spacing keeps it human-readable.
  return ch.textContent.replace(/\s+/g, ' ').trim();
}

// =====================================================================
//  Context-layer parser — CSV / GeoJSON, auto-detects kind
// =====================================================================
//
// A context layer is an optional third input that enables use-case-specific
// analyses on top of the multi-source plan-aggregation. First concrete kind:
// 'hv-stations' (presence of voltage_kv property). Architecture is open for
// future kinds (transmission lines, AHN points, biodiversity zones, etc.).
//
// Output shape (uniform across CSV/GeoJSON):
//   { kind, label, features: [{ type: 'Point'|'LineString', coords, properties }] }
// Coords are in RD/EPSG:28992 metres (single [x,y] for Point, [[x,y], ...] for LineString).

function parseContextLayer(text, filename) {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'csv') return parseContextCSV(text, filename);
  if (ext === 'geojson' || ext === 'json') return parseContextGeoJSON(text, filename);
  throw new Error(`Onbekende context-laag-extensie: .${ext} (verwacht .csv, .geojson, of .json)`);
}

function parseContextCSV(text, filename) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV bevat geen data-rijen.');
  const header = lines[0].split(',').map(c => c.trim().toLowerCase());
  const idx = (name) => header.findIndex(h => h === name);

  const xIdx = idx('rd_x');
  const yIdx = idx('rd_y');
  if (xIdx === -1 || yIdx === -1) {
    throw new Error('CSV vereist kolommen "rd_x" en "rd_y" (RD/EPSG:28992 metres).');
  }
  const nameIdx = idx('name');
  const voltageIdx = ['voltage_kv', 'voltage', 'kv'].map(idx).find(i => i !== -1);

  const features = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    const x = parseFloat(cols[xIdx]);
    const y = parseFloat(cols[yIdx]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const props = {};
    if (nameIdx !== -1) props.name = cols[nameIdx];
    if (voltageIdx !== undefined) {
      const v = parseFloat(cols[voltageIdx]);
      if (Number.isFinite(v)) props.voltage_kv = v;
    }
    features.push({ type: 'Point', coords: [x, y], properties: props });
  }

  return { kind: detectContextKind(features), label: filename, features };
}

function parseContextGeoJSON(text, filename) {
  const obj = JSON.parse(text);
  if (obj.type !== 'FeatureCollection' || !Array.isArray(obj.features)) {
    throw new Error('Verwacht GeoJSON FeatureCollection.');
  }
  // Optional CRS detection — default RD/EPSG:28992. WGS84 conversion out of scope.
  const crsName = obj.crs?.properties?.name?.toLowerCase() ?? '';
  const isWGS84 = crsName.includes('crs84') || crsName.includes('4326');
  if (isWGS84) {
    throw new Error('WGS84-coördinaten worden in v0.1.1 nog niet ondersteund — gebruik RD/EPSG:28992.');
  }

  const features = [];
  for (const f of obj.features) {
    if (!f.geometry) continue;
    const props = f.properties ?? {};
    if (f.geometry.type === 'Point' && Array.isArray(f.geometry.coordinates)) {
      features.push({ type: 'Point', coords: f.geometry.coordinates, properties: props });
    } else if (f.geometry.type === 'LineString' && Array.isArray(f.geometry.coordinates)) {
      features.push({ type: 'LineString', coords: f.geometry.coordinates, properties: props });
    } else if (f.geometry.type === 'MultiPoint') {
      for (const c of f.geometry.coordinates) features.push({ type: 'Point', coords: c, properties: props });
    }
  }

  return { kind: detectContextKind(features), label: filename, features };
}

function detectContextKind(features) {
  const hasVoltage = features.some(f =>
    f.properties && (f.properties.voltage_kv != null || f.properties.voltage != null));
  if (hasVoltage) return 'hv-stations';
  return 'generic-points';
}

// =====================================================================
//  Multi-source geometric ID-join — primary + overlays + provenance
// =====================================================================

function buildTurfPolys(plan, kind) {
  // kind ∈ 'enkel' | 'dubbel'. Returns [{plan, bp, kind, poly}].
  const turf = globalThis.turf;
  const list = kind === 'enkel' ? plan.enkelbestemmingen : plan.dubbelbestemmingen;
  const out = [];
  for (const bp of list) {
    for (const ring of bp.polygons) {
      const closed = ringIsClosed(ring) ? ring : [...ring, ring[0]];
      try {
        out.push({ plan, bp, kind, poly: turf.polygon([closed]) });
      } catch (_) { /* malformed ring — skip */ }
    }
  }
  return out;
}

function multiPlanJoin(buildings, plans) {
  const turf = globalThis.turf;

  // For each plan, build turf polys for primary (Enkelbestemming) and overlay (Dubbelbestemming).
  // Order matters: first plan's primary wins; subsequent only fill if previous didn't match.
  const primaryByPlan  = plans.map(p => buildTurfPolys(p, 'enkel'));
  const overlayByPlan  = plans.map(p => buildTurfPolys(p, 'dubbel'));

  const result = new Map();
  const matchedPerPlan = plans.map(() => 0);

  for (const b of buildings) {
    if (!b.footprint) continue;
    const pt = turf.point(b.footprint);

    // Primary — first-match-wins across plans (in load order).
    let primary = null, primaryPlanIdx = -1;
    for (let i = 0; i < primaryByPlan.length && !primary; i++) {
      for (const entry of primaryByPlan[i]) {
        if (turf.booleanPointInPolygon(pt, entry.poly)) {
          primary = entry.bp;
          primaryPlanIdx = i;
          matchedPerPlan[i]++;
          break;
        }
      }
    }

    // Overlays — collect ALL matches across plans.
    const overlays = [];
    const overlayPlanIdxs = new Set();
    for (let i = 0; i < overlayByPlan.length; i++) {
      for (const entry of overlayByPlan[i]) {
        if (turf.booleanPointInPolygon(pt, entry.poly)) {
          overlays.push({ bp: entry.bp, planIdx: i });
          overlayPlanIdxs.add(i);
        }
      }
    }

    if (primary || overlays.length > 0) {
      result.set(b.id, {
        primary,
        primaryPlanIdx,
        overlays,
        overlayPlanIdxs: [...overlayPlanIdxs],
      });
    }
  }

  return { joined: result, matchedPerPlan };
}

function ringIsClosed(ring) {
  const a = ring[0], b = ring[ring.length - 1];
  return a[0] === b[0] && a[1] === b[1];
}

// Shoelace area of a planar ring in m² (RD/EPSG:28992 = planar metres).
// turf.area assumes WGS84 lon/lat — wrong for RD coords. Use this instead.
function planarArea(ring) {
  let a = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    a += ring[i][0] * ring[i+1][1] - ring[i+1][0] * ring[i][1];
  }
  return Math.abs(a) * 0.5;
}

// =====================================================================
//  HV-station-inpassings-analyse
// =====================================================================
//
// Per Enkelbestemming: classify suitability for siting a new HV substation.
// Verdict drivers:
//   • primary bestemming-hoofdgroep (utility-permitting → +1, excluding → -1, neutral → 0)
//   • blocking dubbelbestemming-overlays (waarde-archeologie / natuur / cultuur → constraint)
//   • polygon-area threshold (HV station typically needs ≥ ~2000 m² footprint)
//   • distance from nearest residential-bestemming polygon (≥ 30m default)
//
// Output: per Enkelbestemming-vlak een verdict ∈ {suitable, constrained, excluded} + reasons.

const HV_AREA_MIN_M2 = 2000;
const HV_RESIDENTIAL_BUFFER_M = 30;
const HV_PROXIMITY_BONUS_M = 1500; // within 1.5 km of an existing 50kV+ station = good connectivity

function analyseHVSiting(plans, contextLayer) {
  const turf = globalThis.turf;
  const results = [];

  // Existing-grid points (Point features with voltage_kv >= 50) — used for proximity bonus.
  const existingStations = (contextLayer?.kind === 'hv-stations')
    ? contextLayer.features.filter(f => f.type === 'Point' &&
        Number.isFinite(f.properties?.voltage_kv ?? f.properties?.voltage) &&
        ((f.properties.voltage_kv ?? f.properties.voltage) >= 50))
    : [];

  // Collect all residential polygons (across all plans) for distance check.
  const residentialPolys = [];
  for (const p of plans) {
    for (const bp of p.enkelbestemmingen) {
      const hg = (bp.hoofdgroep || '').toLowerCase();
      if (hg === 'wonen' || hg === 'woongebied') {
        for (const ring of bp.polygons) {
          const closed = ringIsClosed(ring) ? ring : [...ring, ring[0]];
          try { residentialPolys.push(turf.polygon([closed])); } catch (_) { /* skip */ }
        }
      }
    }
  }

  // Collect dubbelbestemming-overlays (per plan) in turf form for overlay-checks.
  const overlayPolys = [];
  for (const p of plans) {
    for (const bp of p.dubbelbestemmingen) {
      const naam = (bp.naam || '').toLowerCase();
      const hg = (bp.hoofdgroep || '').toLowerCase();
      const blocks = HV_OVERLAY_CONSTRAINING_KEYWORDS.some(k => naam.includes(k) || hg.includes(k));
      if (!blocks) continue;
      for (const ring of bp.polygons) {
        const closed = ringIsClosed(ring) ? ring : [...ring, ring[0]];
        try { overlayPolys.push({ poly: turf.polygon([closed]), bp }); } catch (_) { /* skip */ }
      }
    }
  }

  // Score each Enkelbestemming-vlak.
  for (let pIdx = 0; pIdx < plans.length; pIdx++) {
    const plan = plans[pIdx];
    for (let bIdx = 0; bIdx < plan.enkelbestemmingen.length; bIdx++) {
      const bp = plan.enkelbestemmingen[bIdx];
      const hg = (bp.hoofdgroep || '').toLowerCase();

      for (let rIdx = 0; rIdx < bp.polygons.length; rIdx++) {
        const ring = bp.polygons[rIdx];
        const closed = ringIsClosed(ring) ? ring : [...ring, ring[0]];
        let poly;
        try { poly = turf.polygon([closed]); } catch (_) { continue; }

        const reasons = [];
        let verdict = 'constrained';

        // 1. Primary bestemming
        if (HV_EXCLUDING.has(hg)) {
          verdict = 'excluded';
          reasons.push(`primaire bestemming "${bp.hoofdgroep}" sluit utility-infrastructuur uit`);
        } else if (HV_PERMITTING.has(hg)) {
          verdict = 'suitable';
          reasons.push(`primaire bestemming "${bp.hoofdgroep}" laat utility-infra toe`);
        } else {
          reasons.push(`primaire bestemming "${bp.hoofdgroep || 'onbekend'}" — neutraal`);
        }

        // 2. Area threshold
        const areaM2 = planarArea(closed);

        if (verdict !== 'excluded' && areaM2 < HV_AREA_MIN_M2) {
          verdict = 'constrained';
          reasons.push(`oppervlak ${areaM2.toFixed(0)} m² — onder ${HV_AREA_MIN_M2} m² drempel`);
        }

        // 3. Blocking overlays
        if (verdict !== 'excluded') {
          for (const ov of overlayPolys) {
            try {
              if (turf.booleanIntersects(poly, ov.poly)) {
                if (verdict === 'suitable') verdict = 'constrained';
                reasons.push(`overlay "${ov.bp.naam || ov.bp.hoofdgroep}" maakt inpassing complex`);
                break;
              }
            } catch (_) { /* skip */ }
          }
        }

        // 4. Distance to residential
        if (verdict !== 'excluded' && residentialPolys.length > 0) {
          // turf.distance is geodesic; for RD planimetric we use a quick centroid-based check
          // by measuring each polygon's centroid against residential polygons via booleanIntersects + buffer.
          try {
            const c = turf.centroid(poly);
            for (const resPoly of residentialPolys) {
              if (turf.booleanPointInPolygon(c, resPoly)) {
                verdict = 'excluded';
                reasons.push('vlak-centroid ligt binnen woonbestemming');
                break;
              }
            }
          } catch (_) { /* skip */ }
        }

        // 5. Proximity to existing HV-station — informative only.
        //    Adds connectivity context to the reasons without overriding verdict.
        //    Lift suitable→suitable (no-op) but flag connectivity advantage.
        //    Lift constrained→suitable ONLY if the sole constraint was "neutral primary
        //    bestemming" (i.e. not utility-permitting, not utility-excluding, just middle-ground).
        let nearestStationM = null, nearestStationName = null;
        if (verdict !== 'excluded' && existingStations.length > 0) {
          try {
            const c = turf.centroid(poly).geometry.coordinates;
            let best = Infinity, bestName = null;
            for (const s of existingStations) {
              const d = Math.hypot(s.coords[0] - c[0], s.coords[1] - c[1]);
              if (d < best) { best = d; bestName = s.properties?.name ?? '—'; }
            }
            nearestStationM = best;
            nearestStationName = bestName;
            if (best <= HV_PROXIMITY_BONUS_M) {
              reasons.push(`bestaand HV-station "${bestName}" op ${(best/1000).toFixed(2)} km — gunstig voor netaansluiting`);
            }
          } catch (_) { /* skip */ }
        }

        results.push({
          planIdx: pIdx,
          bIdx,
          rIdx,
          bp,
          areaM2,
          verdict,
          reasons,
          nearestStationM,
          nearestStationName,
        });
      }
    }
  }

  return results;
}

// =====================================================================
//  Three.js viewer
// =====================================================================

function initViewer(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef2f4);

  // Frustum near/far ratio = 1:2000 (was 1:50000). Scene is ~2km × 2km
  // in RD-coords; 50× over-sized far-plane verkruimelde de depth-buffer
  // precisie in de actieve range → flicker bij distance. Met 1:2000
  // krijgt depth-buffer ~25× meer precisie waar het telt.
  const camera = new THREE.PerspectiveCamera(
    55, container.clientWidth / container.clientHeight, 5, 10000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(devicePixelRatio);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.49;

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 0.85);
  sun.position.set(0.6, 1, 0.4);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc8d8e0, 0.3);
  fill.position.set(-0.5, -0.3, -0.7);
  scene.add(fill);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  renderer.domElement.addEventListener('click', (ev) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width)  * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      [...state.meshes, ...state.bestemmingMeshes, ...state.contextMeshes], false);
    if (hits.length > 0) {
      const hitObj = hits[0].object;
      if (hitObj.userData.building) {
        setSelected(hitObj);
        showBuildingAttributes(hitObj);
      } else if (hitObj.userData.bestemmingMeta) {
        showBestemmingAttributes(hitObj);
      } else if (hitObj.userData.contextFeature) {
        showContextFeatureAttributes(hitObj);
      }
    }
  });

  let hoveredMesh = null;
  let hoverThrottle = 0;
  const containerEl = document.getElementById('viewer-container');
  const tooltipEl = document.getElementById('cursor-tooltip');

  function setTooltip(html, ev) {
    if (!tooltipEl) return;
    if (!html) { tooltipEl.hidden = true; return; }
    tooltipEl.hidden = false;
    tooltipEl.innerHTML = html;
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ev.clientX - rect.left + 14;
    const y = ev.clientY - rect.top + 14;
    tooltipEl.style.left = `${x}px`;
    tooltipEl.style.top = `${y}px`;
  }

  renderer.domElement.addEventListener('mousemove', (ev) => {
    const now = performance.now();
    if (now - hoverThrottle < 33) return;
    hoverThrottle = now;

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width)  * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    // Buildings krijgen prioriteit boven bestemmingsvlakken in hover (gebouwen
    // zitten boven vlakken in de scene, dus raycast hits op gebouwen eerst).
    const hits = raycaster.intersectObjects([...state.meshes, ...state.bestemmingMeshes], false);
    const top = hits.length > 0 ? hits[0].object : null;
    const newHover = top?.userData?.building ? top : null;

    // Building hover-emissive blijft bestaan voor visual feedback.
    if (newHover !== hoveredMesh) {
      if (hoveredMesh && hoveredMesh !== state.selectedMesh) {
        hoveredMesh.material.emissive?.setHex(0x000000);
      }
      if (newHover && newHover !== state.selectedMesh) {
        newHover.material.emissive?.setHex(0x444422);
      }
      hoveredMesh = newHover;
      containerEl.classList.toggle('over-building', !!newHover);
    }

    // Tooltip: prioriteer building info; fallback naar bestemming-info.
    if (top?.userData?.building) {
      const b = top.userData.building;
      const j = top.userData.join;
      const bp = j?.primary;
      const bouwjaar = b.attributes?.b3_oorspronkelijk_bouwjaar ?? b.attributes?.oorspronkelijkbouwjaar;
      const lines = [
        `<strong>BAG ${escapeHTML(b.bagId)}</strong>`,
        bouwjaar ? `bouwjaar ${escapeHTML(String(bouwjaar))}` : null,
        bp ? `${escapeHTML(bp.naam || bp.hoofdgroep || '—')}` : '<em>buiten plan</em>',
      ].filter(Boolean);
      setTooltip(lines.join('<br>'), ev);
    } else if (top?.userData?.bestemmingMeta) {
      const m = top.userData.bestemmingMeta;
      const lines = [
        `<strong>${escapeHTML(m.bp.naam || m.bp.hoofdgroep || 'bestemming')}</strong>`,
        m.bp.hoofdgroep ? `hoofdgroep: ${escapeHTML(m.bp.hoofdgroep)}` : null,
        `plan: ${escapeHTML(m.plan.label)}`,
      ].filter(Boolean);
      setTooltip(lines.join('<br>'), ev);
    } else {
      setTooltip(null);
    }
  });
  renderer.domElement.addEventListener('mouseleave', () => {
    if (hoveredMesh && hoveredMesh !== state.selectedMesh) {
      hoveredMesh.material.emissive?.setHex(0x000000);
    }
    hoveredMesh = null;
    containerEl.classList.remove('over-building');
    setTooltip(null);
  });

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Map-aids (schaal-balk + noord-pijl) — update bij camera-change, 4Hz throttle.
  let aidsThrottle = 0;
  controls.addEventListener('change', () => {
    const now = performance.now();
    if (now - aidsThrottle < 250) return;
    aidsThrottle = now;
    updateMapAids({ camera, renderer });
  });

  (function loop() {
    requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  })();

  return { scene, camera, renderer, controls };
}

function renderBuildings(viewer, buildings, joined, ext, viewMode) {
  for (const m of state.meshes) {
    viewer.scene.remove(m);
    m.geometry.dispose();
    m.material.dispose();
  }
  state.meshes = [];

  const cx = (ext.minX + ext.maxX) / 2;
  const cy = (ext.minY + ext.maxY) / 2;
  const cz = ext.minZ;

  for (const b of buildings) {
    const positions = new Float32Array(b.mesh.positions.length);
    for (let i = 0; i < b.mesh.positions.length; i += 3) {
      positions[i  ] =   b.mesh.positions[i]   - cx;
      positions[i+1] =   b.mesh.positions[i+2] - cz;
      positions[i+2] = -(b.mesh.positions[i+1] - cy);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setIndex(b.mesh.indices);
    geom.computeVertexNormals();

    const j = joined.get(b.id);
    const isUnmatched = viewMode !== 'bron-plan' && !j?.primary;
    const mat = isUnmatched
      ? new THREE.MeshLambertMaterial({
          color: 0xd8d6cf,
          transparent: true,
          opacity: 0.45,
          flatShading: false,
        })
      : new THREE.MeshLambertMaterial({
          color: colorForBuilding(b, j, viewMode),
          flatShading: false,
        });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.userData.building = b;
    mesh.userData.join = j ?? null;
    viewer.scene.add(mesh);
    state.meshes.push(mesh);
  }

  const span = Math.max(ext.maxX - ext.minX, ext.maxY - ext.minY);
  applyCameraPreset(viewer, state.cameraPreset, span);
}

// Color-strategy dispatch per visualisatie-mode.
//   'bestemming'    → kleur op primaire bestemmingshoofdgroep
//   'bron-plan'     → kleur op welk plan deze gebouw zijn primaire bestemming gaf;
//                      grijs voor unmatched
//   'use-case-hv'   → kleur op hoofdgroep (bestemmingsvlakken switchen wel naar verdict-coloring)
function colorForBuilding(_b, join, viewMode) {
  if (viewMode === 'bron-plan') {
    if (!join?.primary || join.primaryPlanIdx < 0) return 0xb8b8b8; // grijs voor unmatched
    return planPillColor(join.primaryPlanIdx);
  }
  // bestemming + use-case-hv: kleur op hoofdgroep voor gebouwen
  return colorFor(join?.primary?.hoofdgroep);
}

function applyCameraPreset(viewer, preset, span) {
  if (preset === 'top') {
    viewer.camera.position.set(0, span * 1.3, 0.001);
    viewer.camera.lookAt(0, 0, 0);
    viewer.controls.target.set(0, 0, 0);
  } else {
    viewer.camera.position.set(0, span * 0.7, span * 0.85);
    viewer.camera.lookAt(0, 0, 0);
    viewer.controls.target.set(0, 0, 0);
  }
  viewer.controls.update();
}

function setSelected(mesh) {
  if (state.selectedMesh && state.selectedMesh !== mesh) {
    state.selectedMesh.material.emissive?.setHex(0x000000);
  }
  state.selectedMesh = mesh;
  if (mesh) mesh.material.emissive?.setHex(0x886633);
}

// Schaal-balk + noord-pijl — overlay linksonder. Updates per camera-change.
// Werkt voor zowel top-down als 3D-perspectief: project twee bekende world-
// punten naar scherm, meet pixel-afstand → scale.
const SCALE_NICE = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

function updateMapAids(viewer) {
  const aids = document.getElementById('map-aids');
  const labelEl = document.getElementById('scale-bar-label');
  const arrowEl = document.getElementById('north-arrow');
  if (!aids || !labelEl || !arrowEl) return;
  if (!state.extent) { aids.hidden = true; return; }
  aids.hidden = false;

  const camera = viewer.camera;
  const renderer = viewer.renderer;
  const w = renderer.domElement.clientWidth;
  const h = renderer.domElement.clientHeight;

  // Project (0,0,0) en (100,0,0) naar scherm (RD-meters in scene-coords).
  const a = new THREE.Vector3(0, 0, 0).project(camera);
  const b = new THREE.Vector3(100, 0, 0).project(camera);
  const ax = (a.x + 1) / 2 * w;
  const bx = (b.x + 1) / 2 * w;
  const pxPerMeter = Math.abs(bx - ax) / 100;

  if (!Number.isFinite(pxPerMeter) || pxPerMeter <= 0) { aids.hidden = true; return; }

  // Kies een nice-number dat ~80-160 px breed wordt.
  const targetPx = 120;
  const targetMeters = targetPx / pxPerMeter;
  let nice = SCALE_NICE[0];
  for (const n of SCALE_NICE) if (Math.abs(n - targetMeters) < Math.abs(nice - targetMeters)) nice = n;
  const barPx = nice * pxPerMeter;
  labelEl.style.width = `${barPx.toFixed(0)}px`;
  labelEl.previousElementSibling.style.width = `${barPx.toFixed(0)}px`;
  labelEl.textContent = nice >= 1000 ? `${nice / 1000} km` : `${nice} m`;

  // Noord-pijl: rotation = camera azimuth om Y-as.
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  // Kijk-richting in XZ-plane → azimuth t.o.v. -Z (north in scene = -Z, sinds RD-y → -Z mapping).
  const azimuth = Math.atan2(dir.x, -dir.z);
  arrowEl.style.transform = `rotate(${(-azimuth * 180 / Math.PI).toFixed(1)}deg)`;
}

// Plan-labels — floating Sprite per plan, anchored op centroid van perimeter.
// Geeft orientatie ("waar zit Valkenhorst?"). Canvas-rendered tekst voor crisp
// rendering. Mark exportSkip — Quest-app levert eigen labels.
function makeLabelSprite(text, accentColor) {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontPx = 28;
  ctx.font = `600 ${fontPx}px Inter, -apple-system, sans-serif`;
  const textWidth = ctx.measureText(text).width;
  const padX = 18, padY = 12;
  const w = Math.ceil(textWidth + padX * 2 + 8); // 8 = accent stripe
  const h = Math.ceil(fontPx + padY * 2);
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  ctx.scale(ratio, ratio);
  // Card background — white with subtle shadow via 2-pass
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, w, h, 5);
  else ctx.rect(0, 0, w, h);
  ctx.fill();
  // Accent stripe
  ctx.fillStyle = '#' + accentColor.toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, 4, h);
  // Text
  ctx.fillStyle = '#243644';
  ctx.font = `600 ${fontPx}px Inter, -apple-system, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 8 + padX, h / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.userData._aspectRatio = w / h;
  return sprite;
}

function renderPlanLabels(viewer, plans, ext) {
  for (const m of state.planLabelMeshes) {
    viewer.scene.remove(m);
    m.material.map?.dispose();
    m.material.dispose();
  }
  state.planLabelMeshes = [];

  const cx = (ext.minX + ext.maxX) / 2;
  const cy = (ext.minY + ext.maxY) / 2;
  // Sprite scale relatief aan scene-extent — passend bij elke zoom-level.
  const span = Math.max(ext.maxX - ext.minX, ext.maxY - ext.minY);
  const labelHeight = span * 0.06;

  for (let pIdx = 0; pIdx < plans.length; pIdx++) {
    const plan = plans[pIdx];
    const perimeter = plan.meta?.perimeter ?? [];
    if (perimeter.length === 0) continue;

    // Centroid van eerste ring (genoeg voor positionering).
    let sx = 0, sy = 0, n = 0;
    for (const [x, y] of perimeter[0]) { sx += x; sy += y; n++; }
    if (n === 0) continue;
    const px = (sx / n) - cx;
    const pz = -((sy / n) - cy);

    const sprite = makeLabelSprite(plan.label, planPillColor(pIdx));
    sprite.position.set(px, span * 0.04, pz); // ~80m above ground
    sprite.scale.set(labelHeight * sprite.userData._aspectRatio, labelHeight, 1);
    sprite.userData.exportSkip = true;
    sprite.renderOrder = 100; // op top, depthTest=false
    viewer.scene.add(sprite);
    state.planLabelMeshes.push(sprite);
  }
}

// Plan-perimeter outlines — één LineLoop per plan in plan-pill kleur.
// Bewijst visueel waar plan A ophoudt en plan B begint, en waar je BUITEN
// elk plan zit. Lost het oorspronkelijke "wat-is-een-plan-grens" probleem op.
// Mark exportSkip — Quest-bundel krijgt alleen geometrie + IDs, geen render-hulplijnen.
function renderPlanOutlines(viewer, plans, ext) {
  for (const m of state.planOutlineMeshes) {
    viewer.scene.remove(m);
    m.geometry.dispose();
    m.material.dispose();
  }
  state.planOutlineMeshes = [];

  const cx = (ext.minX + ext.maxX) / 2;
  const cy = (ext.minY + ext.maxY) / 2;
  const lineY = -0.10; // vlak boven bestemmingsvlakken (-0.15) zodat outline zichtbaar is

  for (let pIdx = 0; pIdx < plans.length; pIdx++) {
    const plan = plans[pIdx];
    const perimeter = plan.meta?.perimeter ?? [];
    if (perimeter.length === 0) continue;

    const color = planPillColor(pIdx);
    for (const ring of perimeter) {
      const points = ring.map(([x, y]) => new THREE.Vector3(x - cx, lineY, -(y - cy)));
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
      const line = new THREE.LineLoop(geom, mat);
      line.userData.exportSkip = true;
      viewer.scene.add(line);
      state.planOutlineMeshes.push(line);
    }
  }
}

// Vlakke ondergrond-plaat — context voor de scene + vestibulair anker voor VR.
// Niet authoritatief (geen AHN-hoogteverschillen); v0.2 backlog heeft AHN-decimatie.
// Mark `exportSkip` zodat exportGLTF dit niet in de Quest-bundel meegeeft —
// de Quest-app heeft zijn eigen ondergrond.
function renderGround(viewer, ext) {
  if (state.groundMesh) {
    viewer.scene.remove(state.groundMesh);
    state.groundMesh.geometry.dispose();
    state.groundMesh.material.dispose();
    state.groundMesh = null;
  }
  const span = Math.max(ext.maxX - ext.minX, ext.maxY - ext.minY) * 1.15;
  const geom = new THREE.PlaneGeometry(span, span);
  geom.rotateX(-Math.PI / 2);
  // MeshBasicMaterial = geen lighting reactie → exacte warm-cream kleur,
  // anders wordt 'ie grijs onder ambient+directional. Ground is set-dressing,
  // niet shaded geometry — dit klopt visueel.
  const mat = new THREE.MeshBasicMaterial({ color: 0xe8e4d8, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = -0.30; // below bestemmingsvlakken (-0.15) + below building bases
  mesh.userData.exportSkip = true;
  mesh.renderOrder = -2;
  viewer.scene.add(mesh);
  state.groundMesh = mesh;
}

function renderBestemmingen(viewer, plans, ext, viewMode, hvResults) {
  for (const m of state.bestemmingMeshes) {
    viewer.scene.remove(m);
    m.geometry.dispose();
    m.material.dispose();
  }
  state.bestemmingMeshes = [];

  const cx = (ext.minX + ext.maxX) / 2;
  const cy = (ext.minY + ext.maxY) / 2;
  const groundY = -0.15;

  // Quick lookup: hvResults indexed by `${planIdx}-${bIdx}-${rIdx}` for HV-mode coloring.
  const hvLookup = new Map();
  if (hvResults) {
    for (const r of hvResults) hvLookup.set(`${r.planIdx}-${r.bIdx}-${r.rIdx}`, r);
  }

  const isHvMode = viewMode === 'use-case-hv' && hvResults;

  let count = 0;
  for (let pIdx = 0; pIdx < plans.length; pIdx++) {
    const plan = plans[pIdx];
    for (let bIdx = 0; bIdx < plan.enkelbestemmingen.length; bIdx++) {
      const bp = plan.enkelbestemmingen[bIdx];
      for (let rIdx = 0; rIdx < bp.polygons.length; rIdx++) {
        const ring = bp.polygons[rIdx];
        if (ring.length < 3) continue;
        const flat = new Float64Array(ring.length * 2);
        for (let i = 0; i < ring.length; i++) {
          flat[2*i  ] = ring[i][0];
          flat[2*i+1] = ring[i][1];
        }
        const tris = globalThis.earcut(flat, [], 2);
        if (tris.length === 0) continue;

        const positions = new Float32Array(ring.length * 3);
        for (let i = 0; i < ring.length; i++) {
          positions[3*i  ] =   ring[i][0] - cx;
          positions[3*i+1] =   groundY;
          positions[3*i+2] = -(ring[i][1] - cy);
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setIndex(tris);

        // Color dispatch on viewMode.
        let color;
        const hvHit = hvLookup.get(`${pIdx}-${bIdx}-${rIdx}`);
        if (isHvMode && hvHit) {
          color = HV_VERDICT_COLOR[hvHit.verdict];
        } else if (viewMode === 'bron-plan') {
          color = planPillColor(pIdx);
        } else {
          color = colorFor(bp.hoofdgroep);
        }

        const mat = new THREE.MeshBasicMaterial({
          color,
          opacity: isHvMode ? 0.62 : (viewMode === 'bron-plan' ? 0.5 : 0.55),
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        // Note: polygonOffset weggehaald — frustum-tightening (camera near/far
        // 1:50000 → 1:2000) is wat flicker daadwerkelijk oploste. Positieve
        // polygonOffset duwde fragments deeper → vlakken verdwenen onder
        // ground-plane. Als flicker terugkomt: re-introduceren met NEGATIVE
        // factor/units (-1, -4) om naar camera te pullen i.p.v. weg.

        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData.bestemmingMeta = { planIdx: pIdx, bIdx, rIdx, bp, plan, hv: hvHit ?? null };
        // Unieke renderOrder per mesh = deterministische blending-volgorde,
        // onafhankelijk van camera-afstand. Lost flicker op bij overlappende
        // transparante vlakken (Three.js sorteert anders op afstand → wisselt
        // bij elke camera-beweging → kleurflikker).
        mesh.renderOrder = -1 - count * 0.0001;
        viewer.scene.add(mesh);
        state.bestemmingMeshes.push(mesh);
        count++;
      }
    }
  }
  return count;
}

// =====================================================================
//  Context-layer renderer — 3D markers for points + lines
// =====================================================================

function renderContextLayer(viewer, layer, ext) {
  // Clear previous.
  for (const m of state.contextMeshes) {
    viewer.scene.remove(m);
    if (m.geometry) m.geometry.dispose();
    if (m.material) m.material.dispose?.();
  }
  state.contextMeshes = [];
  if (!layer || !ext) return;

  const cx = (ext.minX + ext.maxX) / 2;
  const cy = (ext.minY + ext.maxY) / 2;
  const span = Math.max(ext.maxX - ext.minX, ext.maxY - ext.minY);
  // Pylon-marker sizing scaled to dataset extent so markers stay visible.
  const baseRadius = Math.max(span * 0.005, 6);
  const baseHeight = Math.max(span * 0.018, 24);

  // Color by voltage if available; default emerald for HV-stations, grey otherwise.
  for (const f of layer.features) {
    if (f.type === 'Point') {
      const [x, y] = f.coords;
      const v = f.properties?.voltage_kv ?? f.properties?.voltage;
      const color = colorForVoltage(v, layer.kind);

      // Pylon = cylinder (mast) + cone (top).
      const mastGeom = new THREE.CylinderGeometry(baseRadius * 0.18, baseRadius * 0.28, baseHeight, 6);
      const mast = new THREE.Mesh(mastGeom, new THREE.MeshLambertMaterial({ color }));
      mast.position.set(x - cx, baseHeight / 2, -(y - cy));
      mast.userData.contextFeature = f;
      mast.userData.contextLayer = layer;
      viewer.scene.add(mast);
      state.contextMeshes.push(mast);

      const headGeom = new THREE.ConeGeometry(baseRadius * 0.55, baseHeight * 0.45, 6);
      const head = new THREE.Mesh(headGeom, new THREE.MeshLambertMaterial({ color }));
      head.position.set(x - cx, baseHeight + baseHeight * 0.225, -(y - cy));
      head.userData.contextFeature = f;
      head.userData.contextLayer = layer;
      viewer.scene.add(head);
      state.contextMeshes.push(head);
    } else if (f.type === 'LineString') {
      const positions = new Float32Array(f.coords.length * 3);
      for (let i = 0; i < f.coords.length; i++) {
        positions[3*i  ] =   f.coords[i][0] - cx;
        positions[3*i+1] =   baseHeight * 0.5;
        positions[3*i+2] = -(f.coords[i][1] - cy);
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const v = f.properties?.voltage_kv ?? f.properties?.voltage;
      const color = colorForVoltage(v, layer.kind);
      const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color, linewidth: 2 }));
      line.userData.contextFeature = f;
      line.userData.contextLayer = layer;
      viewer.scene.add(line);
      state.contextMeshes.push(line);
    }
  }
}

function colorForVoltage(kv, kind) {
  if (kind !== 'hv-stations' || !Number.isFinite(kv)) return 0x666666;
  if (kv >= 380) return 0xb03a2e; // ultra-high — red
  if (kv >= 150) return 0xc79a3a; // high — orange
  if (kv >= 50)  return 0x2a8d4e; // medium — green
  return 0x6fa5d8;                // low — blue
}

// =====================================================================
//  Side panel
// =====================================================================

function showBuildingAttributes(mesh) {
  const b = mesh.userData.building;
  const j = mesh.userData.join;
  const el = document.getElementById('info-content');

  const bagAttrs = b.attributes;
  const interesting = [
    ['identificatie', bagAttrs.identificatie],
    ['bouwjaar', bagAttrs.b3_oorspronkelijk_bouwjaar ?? bagAttrs.oorspronkelijkbouwjaar],
    ['bouwlagen', bagAttrs.b3_bouwlagen],
    ['dak-type', bagAttrs.b3_dak_type],
    ['hoogte-nok (m)', round1(bagAttrs.b3_h_nok)],
    ['hoogte-dak-50p (m)', round1(bagAttrs.b3_h_dak_50p)],
    ['gebruiksdoel', bagAttrs.gebruiksdoel],
  ].filter(([_, v]) => v !== undefined && v !== null && v !== '');

  let html = '';
  if (j?.primary) {
    const p = state.plans[j.primaryPlanIdx];
    html += `<div class="bestemming">
      <div class="hoofdgroep">${escapeHTML(j.primary.hoofdgroep ?? 'onbekend')}</div>
      <div>${escapeHTML(j.primary.naam ?? '—')}</div>
      ${j.primary.artikelnummer ? `<div style="font-size:11px; opacity:0.7; margin-top:4px;">artikel ${escapeHTML(j.primary.artikelnummer)}</div>` : ''}
      <div class="provenance">uit plan: ${escapeHTML(p?.label || '—')} (${escapeHTML(p?.namespaceLabel || '')})</div>
    </div>`;
  } else {
    html += `<div class="bestemming" style="background:#f5f0e8; color:#888;">
      <div class="hoofdgroep">geen primaire bestemming</div>
      <div>buiten plan-grens of niet gekoppeld</div>
    </div>`;
  }

  if (j && j.overlays.length > 0) {
    html += `<div class="overlays">
      <strong style="color:var(--fg); font-size:11px;">${j.overlays.length} dubbelbestemming-overlay${j.overlays.length === 1 ? '' : 's'}:</strong><br>
      ${j.overlays.map(o => {
        const p = state.plans[o.planIdx];
        return `<span class="overlay-pill" title="uit plan: ${escapeHTML(p?.label || '')}">${escapeHTML(o.bp.naam || o.bp.hoofdgroep || '?')}</span>`;
      }).join(' ')}
    </div>`;
  }

  html += '<dl>';
  for (const [k, v] of interesting) {
    html += `<dt>${escapeHTML(k)}</dt><dd>${escapeHTML(String(v))}</dd>`;
  }
  html += '</dl>';

  el.innerHTML = html;
  document.getElementById('hover-hint').classList.add('hidden');
}

function showBestemmingAttributes(mesh) {
  const meta = mesh.userData.bestemmingMeta;
  const el = document.getElementById('info-content');
  const p = meta.plan;

  let html = `<div class="bestemming">
    <div class="hoofdgroep">${escapeHTML(meta.bp.hoofdgroep ?? 'onbekend')}</div>
    <div>${escapeHTML(meta.bp.naam ?? '—')}</div>
    ${meta.bp.artikelnummer ? `<div style="font-size:11px; opacity:0.7; margin-top:4px;">artikel ${escapeHTML(meta.bp.artikelnummer)}</div>` : ''}
    <div class="provenance">uit plan: ${escapeHTML(p?.label || '—')} (${escapeHTML(p?.namespaceLabel || '')})</div>
  </div>`;

  if (meta.hv) {
    const v = meta.hv;
    html += `<div class="hv-verdict ${v.verdict}">
      HV-station: <strong>${verdictLabel(v.verdict)}</strong>
      <span class="reasons">${v.reasons.map(r => `· ${escapeHTML(r)}`).join('<br>')}</span>
      ${Number.isFinite(v.areaM2) ? `<span class="reasons">oppervlak: ${v.areaM2.toFixed(0)} m²</span>` : ''}
    </div>`;
  }

  el.innerHTML = html;
  document.getElementById('hover-hint').classList.add('hidden');
}

function verdictLabel(v) {
  return v === 'suitable' ? 'geschikt' : v === 'constrained' ? 'constrained (extra procedure)' : 'uitgesloten';
}

function showContextFeatureAttributes(mesh) {
  const f = mesh.userData.contextFeature;
  const layer = mesh.userData.contextLayer;
  const el = document.getElementById('info-content');

  const kindLabel = layer.kind === 'hv-stations' ? 'HV-station' : 'context-laag-feature';
  const props = f.properties ?? {};
  const propsHtml = Object.keys(props).length === 0
    ? '<dd class="placeholder">geen attributen</dd>'
    : Object.entries(props).map(([k, v]) =>
        `<dt>${escapeHTML(k)}</dt><dd>${escapeHTML(String(v))}</dd>`).join('');

  el.innerHTML = `
    <div class="bestemming">
      <div class="hoofdgroep">${escapeHTML(kindLabel)}</div>
      <div>${escapeHTML(props.name ?? '—')}</div>
      <div class="provenance">uit context-laag: ${escapeHTML(layer.label)}</div>
    </div>
    <dl>${propsHtml}</dl>
  `;
  document.getElementById('hover-hint').classList.add('hidden');
}

function round1(v) { return typeof v === 'number' ? v.toFixed(1) : v; }
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

// =====================================================================
//  Plan-stack UI
// =====================================================================

function renderPlanStack() {
  const el = document.getElementById('plan-stack');
  el.innerHTML = state.plans.map((p, i) => {
    const matched = p.matchedPrimary ?? '—';
    const hex = '#' + planPillColor(i).toString(16).padStart(6, '0');
    return `<div class="plan-pill" data-idx="${i}">
      <span class="swatch" style="background:${hex}"></span>
      <div class="meta">
        <strong>${escapeHTML(p.label)}</strong>
        <span>${escapeHTML(p.namespaceLabel)} · ${p.enkelbestemmingen.length} enkel · ${p.dubbelbestemmingen.length} dubbel · ${matched} koppeld</span>
      </div>
      <button class="remove" type="button" data-remove="${i}" aria-label="Plan verwijderen">×</button>
    </div>`;
  }).join('');

  // Wire up remove-buttons.
  for (const btn of el.querySelectorAll('button.remove')) {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.remove, 10);
      removePlan(idx);
    });
  }
}

function removePlan(idx) {
  state.plans.splice(idx, 1);
  log(`Plan verwijderd. ${state.plans.length} plan(nen) over.`);
  renderPlanStack();
  if (state.cityjson) tryProcess();
  else if (state.plans.length === 0) {
    // Reset visual.
    if (state.viewer) {
      for (const m of state.bestemmingMeshes) state.viewer.scene.remove(m);
      state.bestemmingMeshes = [];
    }
  }
}

// =====================================================================
//  Context-layer UI + loader
// =====================================================================

function renderContextPill() {
  const el = document.getElementById('context-layer-info');
  if (!state.contextLayer) {
    el.innerHTML = '';
    return;
  }
  const layer = state.contextLayer;
  const kindLabel = layer.kind === 'hv-stations' ? 'HV-stations' : 'context-features';
  el.innerHTML = `
    <div class="context-pill">
      <span class="swatch"></span>
      <div class="meta">
        <strong>${escapeHTML(layer.label)}</strong>
        <span>${escapeHTML(kindLabel)} · ${layer.features.length} features</span>
      </div>
      <button class="remove" type="button" aria-label="Context-laag verwijderen">×</button>
    </div>
  `;
  el.querySelector('button.remove').addEventListener('click', removeContextLayer);
}

function removeContextLayer() {
  state.contextLayer = null;
  if (state.viewer) {
    for (const m of state.contextMeshes) state.viewer.scene.remove(m);
    state.contextMeshes = [];
  }
  // If HV-analyse was active, deactivate it.
  if (state.hvActive) toggleHVAnalysis();
  updateHVButtonVisibility();
  renderContextPill();
  log('Context-laag verwijderd.');
}

function updateHVButtonVisibility() {
  const btn = document.querySelector('.view-mode[data-mode="use-case-hv"]');
  const summary = document.getElementById('hv-summary');
  if (!btn) return;
  const enabled = state.contextLayer?.kind === 'hv-stations' && state.plans.length > 0;
  btn.disabled = !enabled;
  if (!enabled && state.viewMode === 'use-case-hv') {
    // Auto-fallback to default mode if context layer was removed mid-flow.
    setViewMode('bestemming');
  }
  if (summary && state.viewMode !== 'use-case-hv') summary.hidden = true;
}

async function addContextLayer(file, label) {
  log(`Context-laag laden: ${label} (${(file.size/1024).toFixed(1)} KB)…`);
  const text = await file.text();
  const layer = parseContextLayer(text, label);
  log(`  ${layer.kind} — ${layer.features.length} features`);
  state.contextLayer = layer;
  if (state.extent) {
    renderContextLayer(state.viewer, layer, state.extent);
  }
  renderContextPill();
  updateHVButtonVisibility();
}

async function loadSampleHVContext() {
  try {
    const url = 'sample-data/hv-stations-katwijk-leiden.geojson';
    log(`Voorbeeld HV-stations-laag laden: ${url}…`);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`fetch ${url}: ${resp.status}`);
    const text = await resp.text();
    const layer = parseContextLayer(text, 'hv-stations-katwijk-leiden.geojson');
    log(`  ${layer.kind} — ${layer.features.length} features (Sassenheim, Katwijk, Leiden)`);
    state.contextLayer = layer;
    if (state.extent) renderContextLayer(state.viewer, layer, state.extent);
    renderContextPill();
    updateHVButtonVisibility();
  } catch (err) {
    log(`FOUT: ${err.message}`);
    console.error(err);
  }
}

// =====================================================================
//  Legend
// =====================================================================

function renderLegend(joined) {
  const counts = new Map();
  for (const j of joined.values()) {
    if (!j?.primary?.hoofdgroep) continue;
    counts.set(j.primary.hoofdgroep, (counts.get(j.primary.hoofdgroep) ?? 0) + 1);
  }
  const allKeys = new Set([...Object.keys(COLOR_MAP), ...counts.keys()]);
  allKeys.delete('default');
  const entries = [...allKeys]
    .map(k => ({ key: k, count: counts.get(k) ?? 0, hasData: counts.has(k) }))
    .sort((a, b) => (b.hasData - a.hasData) || (b.count - a.count));

  const ul = document.getElementById('legend-list');
  ul.innerHTML = entries.map(e => {
    const hex = '#' + colorFor(e.key).toString(16).padStart(6, '0');
    return `<li class="${e.hasData ? 'has-data' : ''}">
      <span class="swatch" style="background:${hex}"></span>
      <span>${escapeHTML(e.key)}${e.hasData ? ` <span style="opacity:0.6">(${e.count})</span>` : ''}</span>
    </li>`;
  }).join('');
}

// =====================================================================
//  Exports — glTF binary + JSON-LD with provenance
// =====================================================================

async function exportGLTF() {
  if (state.meshes.length === 0) return;
  const exporter = new GLTFExporter();
  const group = new THREE.Group();
  // Skip browser-only meshes (ground plane, plan-outline lines etc.) —
  // de Quest-app levert die zelf. Bundle = pure geometrie + IDs.
  for (const m of state.meshes) {
    if (m.userData?.exportSkip) continue;
    group.add(m.clone());
  }
  return new Promise((resolve, reject) => {
    exporter.parse(group, (result) => {
      const blob = new Blob([result], { type: 'model/gltf-binary' });
      triggerDownload(blob, 'model.glb');
      resolve();
    }, (err) => reject(err), { binary: true });
  });
}

function exportJSONLD() {
  if (!state.buildings || !state.joined) return;
  const doc = buildJSONLDDocument(state.buildings, state.joined);
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/ld+json' });
  triggerDownload(blob, 'attributes.jsonld');
}

function buildJSONLDDocument(buildings, joined) {
  const ldContext = {
    "@vocab": "https://www.regenstudio.world/vocab/spatial-pipeline#",
    "geo":  "http://www.opengis.net/ont/geosparql#",
    "imro": "http://www.geonovum.nl/imro/2012/1.1#",
    "bag":  "https://bag.basisregistraties.overheid.nl/def/bag#",
    "rdf":  "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "geometry": { "@type": "geo:Geometry" },
    "bagId": "bag:identificatie",
    "bouwjaar":         "bag:oorspronkelijkBouwjaar",
    "dakType":          "bag:dakType",
    "hoogteNok":        "bag:hoogteNok",
    "hoogteDak50p":     "bag:hoogteDak50p",
    "bouwlagen":        "bag:bouwlagen",
    "gebruiksdoel":     "bag:gebruiksdoel",
    "bestemmingshoofdgroep": "imro:bestemmingshoofdgroep",
    "bestemming":       "imro:bestemming",
    "dubbelbestemming": "imro:dubbelbestemming",
    "gevondenIn":       { "@id": "https://www.regenstudio.world/vocab/spatial-pipeline#sourcePlan", "@type": "@id" },
    "hvSitingVerdict":  "https://www.regenstudio.world/vocab/spatial-pipeline#hvSitingVerdict",
  };

  // Lookup HV-verdict per gebouw via primaire-bestemming-vlak.
  const hvByPlanBpRing = new Map();
  if (state.hvResults) {
    for (const r of state.hvResults) hvByPlanBpRing.set(`${r.planIdx}-${r.bIdx}`, r.verdict);
  }

  const items = buildings.map(b => {
    const j = joined.get(b.id);
    const primaryProv = j?.primary && state.plans[j.primaryPlanIdx]
      ? planProvenance(state.plans[j.primaryPlanIdx])
      : null;
    const overlaysOut = (j?.overlays ?? []).map(o => ({
      "naam": o.bp.naam,
      "bestemmingshoofdgroep": o.bp.hoofdgroep,
      "gevondenIn": planProvenance(state.plans[o.planIdx]),
    }));

    return {
      "@id": `urn:bag:${b.bagId}`,
      "@type": "bag:Pand",
      "bagId": b.bagId,
      "bouwjaar":      b.attributes.b3_oorspronkelijk_bouwjaar ?? b.attributes.oorspronkelijkbouwjaar,
      "dakType":       b.attributes.b3_dak_type,
      "hoogteNok":     b.attributes.b3_h_nok,
      "hoogteDak50p":  b.attributes.b3_h_dak_50p,
      "bouwlagen":     b.attributes.b3_bouwlagen,
      "gebruiksdoel":  b.attributes.gebruiksdoel,
      "footprint": b.footprint ? { "@type": "geo:Point", "rd_x": b.footprint[0], "rd_y": b.footprint[1] } : null,
      "bestemming": j?.primary ? {
        "@id": j.primary.id ? `urn:imro:${j.primary.id}` : undefined,
        "naam": j.primary.naam,
        "bestemmingshoofdgroep": j.primary.hoofdgroep,
        "artikelnummer": j.primary.artikelnummer,
        "gevondenIn": primaryProv,
      } : null,
      "dubbelbestemming": overlaysOut.length > 0 ? overlaysOut : undefined,
    };
  });

  // Per-bestemming HV-verdict (separate sub-graph).
  const hvAnalysis = state.hvResults ? state.hvResults.map(r => ({
    "@id": `urn:imro:${r.bp.id || (r.bp.lokaalID || `${r.planIdx}-${r.bIdx}`)}#vlak${r.rIdx}`,
    "@type": "imro:Enkelbestemming",
    "naam": r.bp.naam,
    "bestemmingshoofdgroep": r.bp.hoofdgroep,
    "areaM2": Math.round(r.areaM2),
    "hvSitingVerdict": r.verdict,
    "reasons": r.reasons,
    "gevondenIn": planProvenance(state.plans[r.planIdx]),
  })) : [];

  return {
    "@context": ldContext,
    "@graph": [...items, ...hvAnalysis],
  };
}

function planProvenance(plan) {
  if (!plan) return null;
  return {
    "@id": plan.meta?.planId ? `urn:imro:${plan.meta.planId}` : undefined,
    "naam": plan.label,
    "planIMROId": plan.meta?.planId,
    "datum": plan.meta?.datum,
    "schema": plan.namespaceLabel,
  };
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// =====================================================================
//  UI wiring
// =====================================================================

function log(msg) {
  const el = document.getElementById('status-log');
  const ts = new Date().toLocaleTimeString('nl-NL');
  el.textContent += `[${ts}] ${msg}\n`;
  el.scrollTop = el.scrollHeight;
}

function setDropZoneState(kind, label, loaded) {
  const zone = document.querySelector(`.drop-zone[data-kind="${kind}"]`);
  if (!zone) return;
  zone.classList.toggle('loaded', !!loaded);
  const status = document.getElementById(`status-${kind}`);
  if (status) status.textContent = label;
}

async function handleCityJSON(file, label) {
  log(`CityJSON laden: ${label} (${(file.size/1024/1024).toFixed(1)} MB)…`);
  const text = await readMaybeGzipped(file);
  log(`  ontleed JSON (${(text.length/1024/1024).toFixed(1)} MB UTF-8)…`);
  const cj = JSON.parse(text);
  log(`  CityJSON v${cj.version} — ${Object.keys(cj.CityObjects).length} objecten`);
  state.cityjson = cj;
  setDropZoneState('cityjson', `${label} ✓`, true);
  await tryProcess();
}

async function addPlan(file, label) {
  log(`IMRO GML laden: ${label} (${(file.size/1024).toFixed(0)} KB)…`);
  const text = await readMaybeGzipped(file);
  const parsed = parseIMRO(text);
  log(`  ${parsed.namespaceLabel} — ${parsed.enkelbestemmingen.length} Enkel · ${parsed.dubbelbestemmingen.length} Dubbel · ${parsed.functieaanduidingen.length} Functie`);

  state.plans.push({
    label,
    ...parsed,
  });
  renderPlanStack();
  if (state.cityjson) await tryProcess();
}

async function tryProcess() {
  if (!state.cityjson || state.plans.length === 0) return;

  log('Pijplijn draait…');
  const t0 = performance.now();

  log('  CityJSON → gebouwen + meshes');
  const { buildings, extent } = parseCityJSON(state.cityjson);
  state.buildings = buildings;
  state.extent = extent;
  log(`    ${buildings.length} gebouwen geëxtraheerd  (RD-extent x=${extent.minX.toFixed(0)}–${extent.maxX.toFixed(0)}, y=${extent.minY.toFixed(0)}–${extent.maxY.toFixed(0)})`);

  log(`  Multi-source ID-join over ${state.plans.length} plan(nen) (eerste-match-wins voor primair, alle matches voor overlays)`);
  const { joined, matchedPerPlan } = multiPlanJoin(buildings, state.plans);
  state.joined = joined;
  for (let i = 0; i < state.plans.length; i++) {
    state.plans[i].matchedPrimary = matchedPerPlan[i];
    log(`    ${state.plans[i].label}: ${matchedPerPlan[i]} primair gekoppeld`);
  }
  const totalMatched = [...joined.values()].filter(j => j.primary).length;
  const unmatched = buildings.length - totalMatched;
  log(`    totaal: ${totalMatched}/${buildings.length} primair · ${unmatched} buiten alle plannen`);
  renderPlanStack();

  log('  3D-scène opbouwen…');
  renderGround(state.viewer, extent);
  renderPlanOutlines(state.viewer, state.plans, extent);
  renderPlanLabels(state.viewer, state.plans, extent);
  renderBuildings(state.viewer, buildings, joined, extent, state.viewMode);
  updateMapAids(state.viewer);
  log(`    ${state.meshes.length} gebouw-meshes`);

  // Re-run HV analyse if active mode requires it.
  if (state.viewMode === 'use-case-hv' && state.contextLayer?.kind === 'hv-stations') {
    state.hvResults = analyseHVSiting(state.plans, state.contextLayer);
    log(`  HV-analyse: ${state.hvResults.length} bestemmingsvlakken beoordeeld`);
    updateHVSummary();
  } else {
    state.hvResults = null;
  }

  const planMeshCount = renderBestemmingen(state.viewer, state.plans, extent, state.viewMode, state.hvResults);
  log(`    ${planMeshCount} plan-vlakken weergegeven op grondniveau`);

  // Re-render context-layer now that extent is known (markers scale to dataset span).
  if (state.contextLayer) {
    renderContextLayer(state.viewer, state.contextLayer, extent);
  }

  renderLegend(joined);
  updateHVButtonVisibility();

  // Compute payload-size metrics for engine-panel + render the panel.
  state.coverageStats = computeCoverageStats(buildings, joined, matchedPerPlan);
  renderEnginePanel();

  document.getElementById('btn-export-gltf').disabled = false;
  document.getElementById('btn-export-jsonld').disabled = false;

  const t1 = performance.now();
  log(`Klaar in ${((t1 - t0)/1000).toFixed(2)}s`);
}

function computeCoverageStats(buildings, joined, matchedPerPlan) {
  const totalBuildings = buildings.length;
  const totalMatched = [...joined.values()].filter(j => j.primary).length;
  const unmatched = totalBuildings - totalMatched;

  // Geometry bytes — sum of vertex+index byte-counts per building (rough estimate
  // of binary glTF payload size). Float32 positions + Uint32 indices.
  let geometryBytes = 0;
  for (const b of buildings) {
    geometryBytes += b.mesh.positions.length * 4;  // Float32
    geometryBytes += b.mesh.indices.length * 4;    // Uint32
  }
  // Add ~15% glTF/json-header overhead.
  geometryBytes = Math.round(geometryBytes * 1.15);

  // Attributes bytes — JSON-LD payload size (computed by serializing the doc).
  const jsonld = buildJSONLDDocument(buildings, joined);
  const attributesBytes = new TextEncoder().encode(JSON.stringify(jsonld)).length;

  return {
    perPlan: matchedPerPlan,
    unmatched,
    totalMatched,
    totalBuildings,
    geometryBytes,
    attributesBytes,
  };
}

// =====================================================================
//  HV-analyse — toggle handler
// =====================================================================

function setViewMode(mode) {
  if (!['bestemming', 'bron-plan', 'use-case-hv'].includes(mode)) return;
  if (mode === state.viewMode) return;

  // Guard for use-case-hv — requires HV-context-layer.
  if (mode === 'use-case-hv' && state.contextLayer?.kind !== 'hv-stations') {
    log('Use-case HV-station: drop eerst een HV-stations-context-laag (drop-zone ③).');
    return;
  }

  state.viewMode = mode;

  // UI: highlight active mode-button
  for (const btn of document.querySelectorAll('.view-mode')) {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  }

  const summary = document.getElementById('hv-summary');

  if (mode === 'use-case-hv') {
    log('Use-case HV-station-inpassing: kandidaat-zones beoordelen…');
    state.hvResults = analyseHVSiting(state.plans, state.contextLayer);
    log(`  ${state.hvResults.length} Enkelbestemming-vlakken beoordeeld`);
    summary.hidden = false;
    updateHVSummary();
  } else {
    state.hvResults = null;
    summary.hidden = true;
  }

  if (state.cityjson && state.buildings && state.extent) {
    renderGround(state.viewer, state.extent);
    renderPlanOutlines(state.viewer, state.plans, state.extent);
    renderPlanLabels(state.viewer, state.plans, state.extent);
    renderBuildings(state.viewer, state.buildings, state.joined, state.extent, state.viewMode);
    renderBestemmingen(state.viewer, state.plans, state.extent, state.viewMode, state.hvResults);
  }
}

// =====================================================================
//  Engine-eronder paneel — permanent zichtbaar wanneer plannen geladen
// =====================================================================

function renderEnginePanel() {
  const panel = document.getElementById('engine-panel');
  if (!panel) return;
  if (!state.coverageStats) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;

  const cs = state.coverageStats;
  document.getElementById('metric-geometry').textContent = formatBytes(cs.geometryBytes);
  const perPandBytes = Math.round(cs.attributesBytes / Math.max(cs.totalBuildings, 1));
  document.getElementById('metric-attributes').textContent =
    `~${formatBytes(perPandBytes)} / pand`;
  document.getElementById('metric-geometry-note').textContent =
    `glTF-ready, met BAG-id per pand (${cs.totalBuildings} meshes)`;
  document.getElementById('coverage-summary').textContent =
    `${cs.totalMatched} / ${cs.totalBuildings} panden`;

  // Per-plan klikbare rijen — klik = switch naar bron-plan-mode.
  const rows = document.getElementById('coverage-rows');
  rows.innerHTML = state.plans.map((p, i) => {
    const hex = '#' + planPillColor(i).toString(16).padStart(6, '0');
    const matched = cs.perPlan[i] ?? 0;
    return `<div class="coverage-row" data-plan-idx="${i}">
      <span class="swatch" style="background:${hex}"></span>
      <span class="label">${escapeHTML(p.label)}</span>
      <span class="value">${matched}</span>
    </div>`;
  }).join('') + `
    <div class="coverage-row" data-unmatched="1">
      <span class="swatch unmatched"></span>
      <span class="label">niet-gekoppeld</span>
      <span class="value">${cs.unmatched}</span>
    </div>
  `;

  for (const row of rows.querySelectorAll('.coverage-row')) {
    row.addEventListener('click', () => {
      // Activate bron-plan mode so user sees plan-coverage.
      setViewMode('bron-plan');
    });
  }
}

function formatBytes(n) {
  if (!Number.isFinite(n)) return '— B';
  if (n >= 1_048_576) return (n / 1_048_576).toFixed(2) + ' MB';
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

// =====================================================================
//  Sequenced-load: emissive-pulse op nieuw-gejoinde gebouwen
// =====================================================================

let _previousJoinedIds = new Set();

function pulseNewlyJoinedBuildings(newlyJoinedIds, durationMs = 800) {
  const meshesToFlash = state.meshes.filter(m =>
    m.userData.building && newlyJoinedIds.has(m.userData.building.id));
  if (meshesToFlash.length === 0) return;

  // Restore each material's existing emissive afterward.
  const original = meshesToFlash.map(m => ({
    mesh: m,
    prev: m.material.emissive ? m.material.emissive.getHex() : 0x000000,
  }));
  for (const m of meshesToFlash) m.material.emissive?.setHex(0x886633);

  setTimeout(() => {
    for (const o of original) o.mesh.material.emissive?.setHex(o.prev);
  }, durationMs);
}

// =====================================================================
//  Hint-banner — transient toast in viewer
// =====================================================================

let _hintBannerTimer = null;
function showHintBanner(html, msFade = 10000) {
  const banner = document.getElementById('hint-banner');
  const text = document.getElementById('hint-banner-text');
  if (!banner || !text) return;
  text.innerHTML = html;
  banner.hidden = false;
  // Force reflow before adding the visible class so the transition runs.
  // eslint-disable-next-line no-unused-expressions
  banner.offsetWidth;
  banner.classList.add('visible');
  if (_hintBannerTimer) clearTimeout(_hintBannerTimer);
  _hintBannerTimer = setTimeout(hideHintBanner, msFade);
}

function hideHintBanner() {
  const banner = document.getElementById('hint-banner');
  if (!banner) return;
  banner.classList.remove('visible');
  setTimeout(() => { banner.hidden = true; }, 400);
  if (_hintBannerTimer) { clearTimeout(_hintBannerTimer); _hintBannerTimer = null; }
}

function updateHVSummary() {
  if (!state.hvResults) return;
  const counts = { suitable: 0, constrained: 0, excluded: 0 };
  let totalSuitableArea = 0;
  for (const r of state.hvResults) {
    counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
    if (r.verdict === 'suitable') totalSuitableArea += r.areaM2;
  }
  document.getElementById('hv-count-suitable').textContent = counts.suitable;
  document.getElementById('hv-count-constrained').textContent = counts.constrained;
  document.getElementById('hv-count-excluded').textContent = counts.excluded;
  document.getElementById('hv-total-area').textContent = `${(totalSuitableArea / 10000).toFixed(2)} ha`;
}

// =====================================================================
//  Sample data — bundled open-data files
// =====================================================================

async function loadSamples(useLive = false) {
  const sourceLabel = useLive ? 'live publieke open-data' : 'gebundelde voorbeelddata';
  log(`Laden vanuit ${sourceLabel} — 3D BAG tile + 2 bestemmingsplannen…`);
  try {
    const manifestResp = await fetch('sample-data/manifest.json');
    if (!manifestResp.ok) throw new Error('manifest.json ontbreekt');
    const manifest = await manifestResp.json();

    // Load tile (live URL of bundled, afhankelijk van useLive).
    const cjUrl = resolveSourceUrl(manifest['default-tile'], useLive);
    if (useLive) log(`  → ${cjUrl}`);
    const cjText = await fetchMaybeGzipped(cjUrl);
    const cj = JSON.parse(cjText);
    log(`  CityJSON v${cj.version} — ${Object.keys(cj.CityObjects).length} objecten`);
    state.cityjson = cj;
    setDropZoneState('cityjson', `${manifest['default-tile']} ✓ (${useLive ? 'live' : 'bundled'})`, true);

    // Sequenced plan loads — one plan at a time, with a visible pulse on
    // newly-joined buildings so the multi-source aggregation is observable.
    state.plans = [];
    renderPlanStack();
    let prevMatchedIds = new Set();

    for (const planEntry of manifest['default-plans']) {
      const url = resolveSourceUrl(planEntry.file, useLive);
      log(`  GML laden: ${planEntry.label}…${useLive ? ` → ${url}` : ''}`);
      const gmlText = await fetchMaybeGzipped(url);
      const parsed = parseIMRO(gmlText);
      log(`    ${parsed.namespaceLabel} — ${parsed.enkelbestemmingen.length} Enkel · ${parsed.dubbelbestemmingen.length} Dubbel`);
      state.plans.push({ label: planEntry.label, ...parsed });
      renderPlanStack();

      // Re-run pipeline so engine-panel + scene update with each plan added.
      await tryProcess();

      // Highlight gebouwen die NU pas een primary-match kregen.
      const nowMatchedIds = new Set();
      for (const [bid, j] of state.joined.entries()) {
        if (j.primary) nowMatchedIds.add(bid);
      }
      const newlyJoined = new Set([...nowMatchedIds].filter(id => !prevMatchedIds.has(id)));
      if (newlyJoined.size > 0) {
        log(`    +${newlyJoined.size} panden nu gekoppeld door ${planEntry.label}`);
        pulseNewlyJoinedBuildings(newlyJoined, 1200);
      }
      prevMatchedIds = nowMatchedIds;

      await new Promise(r => setTimeout(r, 1500));
    }

    // Final hint-banner stuurt gebruiker richting bron-plan-mode.
    const cs = state.coverageStats;
    if (cs) {
      showHintBanner(
        `<strong>${cs.totalMatched}/${cs.totalBuildings} panden over ${state.plans.length} plannen gekoppeld.</strong> ` +
        `Klik <strong>Bron-plan</strong> in de toolbar om te zien welk plan welk gebied dekt — daar zit de waarde van de pipeline.`,
        12000
      );
    }
  } catch (err) {
    log(`FOUT: ${err.message}`);
    console.error(err);
  }
}

// =====================================================================
//  Welcome modal
// =====================================================================

const WELCOME_SEEN_KEY = 'spatial-pipeline:welcome-seen';

function showWelcome() {
  document.getElementById('welcome-modal').hidden = false;
  document.getElementById('welcome-modal').style.display = '';
}
function hideWelcome() {
  const m = document.getElementById('welcome-modal');
  m.hidden = true;
  m.style.display = 'none';
}

// Welkom-modal IS de startscherm — altijd tonen op page-load.
// (localStorage-flag verwijderd zodat elke fresh load de pitch laat zien.)
function maybeShowWelcomeOnFirstLoad() {
  showWelcome();
}

function markWelcomeSeen() {
  // No-op — welkom is altijd start. User dismisst het manueel via X / klik buiten / actie-knop.
}

// =====================================================================
//  Init
// =====================================================================

function setupDropZone(kind, handler, multiple) {
  const zone = document.querySelector(`.drop-zone[data-kind="${kind}"]`);
  if (!zone) return;
  const input = zone.querySelector('input[type=file]');

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files.length === 0) return;
    const files = multiple ? [...e.dataTransfer.files] : [e.dataTransfer.files[0]];
    for (const file of files) {
      try { await handler(file, file.name); }
      catch (err) { log(`FOUT (${file.name}): ${err.message}`); console.error(err); }
    }
  });
  input.addEventListener('change', async (e) => {
    if (e.target.files.length === 0) return;
    const files = multiple ? [...e.target.files] : [e.target.files[0]];
    for (const file of files) {
      try { await handler(file, file.name); }
      catch (err) { log(`FOUT (${file.name}): ${err.message}`); console.error(err); }
    }
    e.target.value = '';
  });
}

// =====================================================================
//  Luchtmeetnet live attribute — bewijst on-demand backend-fetch
// =====================================================================
let lmStationLabel = '';

async function refreshLuchtmeetnet() {
  const panel = document.getElementById('lm-panel');
  if (!panel) return;
  try {
    if (!lmStationLabel) {
      const meta = await fetchStationMeta();
      lmStationLabel = meta?.location || meta?.station_number || '';
    }
    const pm10 = await fetchLatestPM10();
    if (!pm10) return;
    panel.hidden = false;
    document.getElementById('lm-value').textContent = `${pm10.value.toFixed(0)} µg/m³`;
    const d = new Date(pm10.timestamp);
    const stamp = d.toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    document.getElementById('lm-meta').textContent = `Luchtmeetnet · ${lmStationLabel} · ${stamp}`;
  } catch (e) {
    console.warn('luchtmeetnet:', e.message);
    // Panel blijft hidden bij fout — geen lege of foutieve waarde tonen.
  }
}

function init() {
  state.viewer = initViewer(document.getElementById('viewer-container'));
  setupDropZone('cityjson', handleCityJSON, false);
  setupDropZone('imro', addPlan, true);
  setupDropZone('context', addContextLayer, false);

  document.getElementById('btn-samples').addEventListener('click', () => loadSamples(false));
  const btnLive = document.getElementById('btn-samples-live');
  if (btnLive) btnLive.addEventListener('click', () => loadSamples(true));
  document.getElementById('btn-sample-hv-context').addEventListener('click', loadSampleHVContext);
  document.getElementById('btn-export-gltf').addEventListener('click', exportGLTF);
  document.getElementById('btn-export-jsonld').addEventListener('click', exportJSONLD);

  document.getElementById('toggle-vlakken').addEventListener('change', (e) => {
    for (const m of state.bestemmingMeshes) m.visible = e.target.checked;
  });
  document.getElementById('toggle-perimeter').addEventListener('change', (e) => {
    for (const m of state.planOutlineMeshes) m.visible = e.target.checked;
  });
  document.getElementById('toggle-labels').addEventListener('change', (e) => {
    for (const m of state.planLabelMeshes) m.visible = e.target.checked;
  });
  document.getElementById('toggle-ground').addEventListener('change', (e) => {
    if (state.groundMesh) state.groundMesh.visible = e.target.checked;
  });
  document.getElementById('toggle-buildings').addEventListener('change', (e) => {
    for (const m of state.meshes) m.visible = e.target.checked;
  });

  // Camera presets
  for (const btn of document.querySelectorAll('.cam-preset')) {
    btn.addEventListener('click', () => {
      for (const b of document.querySelectorAll('.cam-preset')) b.classList.remove('active');
      btn.classList.add('active');
      state.cameraPreset = btn.dataset.preset;
      if (state.extent) {
        const span = Math.max(state.extent.maxX - state.extent.minX, state.extent.maxY - state.extent.minY);
        applyCameraPreset(state.viewer, state.cameraPreset, span);
      }
    });
  }

  // View-mode selector (3 modes; use-case-hv enabled when HV-context-laag aanwezig)
  for (const btn of document.querySelectorAll('.view-mode')) {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      setViewMode(btn.dataset.mode);
    });
  }

  // Hint-banner close
  document.getElementById('hint-banner-close').addEventListener('click', hideHintBanner);

  // Welcome modal wiring
  const modal = document.getElementById('welcome-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      // click on backdrop
      hideWelcome();
      markWelcomeSeen();
    }
    const action = e.target.dataset?.action;
    if (action === 'sample') {
      hideWelcome();
      markWelcomeSeen();
      loadSamples();
    } else if (action === 'own') {
      hideWelcome();
      markWelcomeSeen();
    }
  });
  document.getElementById('btn-show-welcome').addEventListener('click', showWelcome);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      hideWelcome();
      markWelcomeSeen();
    }
  });

  maybeShowWelcomeOnFirstLoad();

  // PZH-context visibility-laag (default uit; aan tijdens pitch/screencast).
  initPzhContext();

  // Luchtmeetnet live PM10 — engine-eronder bewijs: attribuut komt uit
  // open backend, geometrie blijft in de browser. Refresh elke 5 min.
  refreshLuchtmeetnet();
  setInterval(refreshLuchtmeetnet, 5 * 60 * 1000);

  log('Spatial Pipeline gereed. Klik "Voorbeelddata laden" of drop eigen bestanden.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
