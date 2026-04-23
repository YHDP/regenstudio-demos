# CPR DPP Tracker — Full Redesign Plan

> Crash recovery reference. If the session breaks, resume from the last completed sprint/task.

## Context

The CPR DPP Tracker (`regenstudio-demos/cpr-dpp-tracker/`) currently shows 37 product families as a card grid with modal popups containing milestone trackers and standards tables. Six research agents have mapped the full regulatory landscape: 5 pipelines, 20 node types, a convergence formula, and a source citation registry with ~95 verified sources.

**Goal**: Transform the tracker from a static status table into a **regulatory intelligence platform** with convergence timeline visualizations, pipeline-aware data, cross-cutting system timeline dashboard, source transparency, and family comparison.

**Key insight**: DPP obligation is NOT a single timeline per family — it's the convergence of TWO independent timelines (Product + System), each with their own upstream nodes.

**Build approach**: Incremental sprints. Each sprint produces a working tracker.

## Design Decisions

| Decision | Choice |
|---|---|
| Scope | Full redesign: data model + convergence UI + admin + dashboard + filtering + comparison + source layer |
| Timeline visualization | Vertical node chain (default) + horizontal swim lanes (toggle) |
| System Timeline | Prominent dashboard section on main page + embedded in every family convergence view |
| Build approach | 5 incremental sprints, each deployable |
| Content model | Structured sections replace HTML blob; multi-level report generation |
| Tech stack | Vanilla JS (ES5-compatible), no build step, same auth pattern |
| Data source | `families-v2.json` (new pipeline-aware schema) + `system-timeline.json` (shared) |
| Modal fate | Sprint 1: transitional modal with pipeline nodes. Sprint 2: replaced by convergence view |
| Content authoring | Agent drafts → human reviews/edits/approves per section in admin panel |

## Data Model v2

### `data/system-timeline.json` — Shared cross-cutting timeline
- 9 main nodes: sys-feasibility → sys-dpp-mandatory
- 3 cross-cutting items: AVS DA, Horizontal SReq, Annex II
- Single source of truth for system-level milestones

### `data/families-v2.json` — Per-family pipeline data
- Keeps existing fields for backwards compat (full-name, dpp-est, milestones, dpp-range)
- Adds: `active_pipelines`, `future_pipelines`, `pipelines{}`, `convergence{}`, `content{}`
- `content{}` replaces monolithic `info` HTML with structured sections:
  - about, standards_landscape, standards_development, sreq_analysis, dpp_outlook, stakeholder_notes, key_risks, sources_summary
- `info` field REMOVED — `content{}` is single source of truth
- Old `families.json` kept as deprecated for reports compat until Sprint 5

### Pipeline types
- **A**: New-CPR hEN Route (2024/3110) — produces DPP
- **B**: Old-CPR Fast-Track (305/2011) — PCR/SMP only, no DPP
- **C**: Old EAD Sunset (305/2011) — families with old-regime EADs
- **D**: New EAD Future — future path for EAD families
- **E**: ESPR Supplementary — future

### Certainty color system
| Color | Hex | Meaning |
|---|---|---|
| Green | #10b981 | Confirmed, authoritative source |
| Yellow-green | #84cc16 | Scheduled by official body |
| Amber | #f59e0b | Estimated from precedent |
| Orange | #f97316 | Estimated, moderate confidence |
| Red-orange | #ef4444 | Speculative or projected |
| Gray | #94a3b8 | Unknown, no data |

## File Structure (final state)

```
cpr-dpp-tracker/
├── index.html                  ← Main app shell (redesigned)
├── gate.html                   ← Password gate (unchanged)
├── admin.html                  ← Admin panel (v2)
├── reports.html                ← Reports page (reads v2 data in Sprint 5)
├── data/
│   ├── families-v2.json        ← Pipeline-aware family data (37 families)
│   ├── system-timeline.json    ← Shared system timeline
│   ├── families.json           ← [DEPRECATED] kept for reports compat
│   └── review-queue.json       ← Agent review queue
├── css/
│   ├── tracker.css             ← Main styles (heavily updated)
│   ├── convergence.css         ← Convergence view styles (Sprint 2)
│   ├── dashboard.css           ← System timeline dashboard styles (Sprint 3)
│   ├── admin.css               ← Admin styles (Sprint 4)
│   └── reports.css             ← Reports styles (Sprint 5)
├── js/
│   ├── tracker.js              ← Main app: grid, cards, routing (rewritten)
│   ├── convergence-view.js     ← Vertical node chain + horizontal toggle (Sprint 2)
│   ├── system-dashboard.js     ← System timeline dashboard component (Sprint 3)
│   ├── node-detail.js          ← Node click detail panel (Sprint 2)
│   ├── filters.js              ← Filter/sort controls (Sprint 3)
│   ├── comparison.js           ← Family comparison view (Sprint 4)
│   ├── source-layer.js         ← Source transparency overlay (Sprint 4)
│   ├── report-generator.js     ← Multi-level report generation (Sprint 5)
│   ├── content-renderer.js     ← Renders content{} as formatted HTML (Sprint 5)
│   ├── dpp-info.js             ← DPP info popup (updated)
│   ├── admin.js                ← Admin panel logic (Sprint 4)
│   ├── report-download.js      ← Report download (Sprint 5)
│   ├── reports.js              ← Reports page (Sprint 5)
│   └── vendor/                 ← Third-party libs (unchanged)
├── tools/
│   └── migrate-v1-to-v2.js     ← One-time data migration script
├── Images/                     ← 37 SVG icons (unchanged)
└── PLAN.md                     ← This file
```

## Sprint Plan

### Sprint 1: Foundation (Data Model + Adapted UI) ← CURRENT

**Goal**: New data model in place, current card grid reads it, pipeline info visible in transitional modal.

**Tasks**:
1. [x] Save full redesign plan to PLAN.md
2. [ ] Create data/system-timeline.json (hand-authored)
3. [ ] Create tools/migrate-v1-to-v2.js (migration script)
4. [ ] Run migration → data/families-v2.json (37 families)
5. [ ] Create css/dashboard.css (stub)
6. [ ] Update js/tracker.js (read v2 data, pipeline badges, modal update)
7. [ ] Update css/tracker.css (certainty colors, pipeline badges, node styles)
8. [ ] Update index.html (new CSS refs, modal structure)
9. [ ] Verify in browser

**Verification checklist**:
- [ ] Tracker loads with new data (families-v2.json)
- [ ] All 37 cards render with pipeline badge
- [ ] Click card → modal shows pipeline nodes with certainty colors
- [ ] DPP date and binding constraint visible in convergence box
- [ ] content{} sections render correctly (replacing old info HTML)
- [ ] No info field in families-v2.json (clean break)
- [ ] Spot-check 5 families: content sections match original info text

### Sprint 2: Convergence View
- convergence-view.js, node-detail.js, convergence.css
- Card click opens convergence timeline (vertical + horizontal toggle)
- Replaces Sprint 1 transitional modal

### Sprint 3: Dashboard + Filtering + Landing — **PARKED 2026-04-23**
- system-dashboard.js, filters.js, dashboard.css
- System Timeline dashboard on main page
- Filter/sort controls, pipeline overview
- `js/system-dashboard.js` is drafted but not wired into `index.html`; `css/dashboard.css` was deleted as orphan on 2026-04-23 (pre-NVTB cleanup). Re-create stub when this sprint resumes.

### Sprint 4: Comparison + Source Layer + Admin v2 + Polish — partial
- comparison.js, source-layer.js — shipped
- Admin panel redesign, mobile polish — deferred

### Sprint 5: Content Enrichment + Multi-Level Reports — **PARKED 2026-04-23**
- `js/report-generator.js` drafted but never wired — `reports.js` ships its own simpler path. Resume this sprint before attempting multi-level report generation.
- `js/content-renderer.js` — shipped
- All 37 families' content reviewed and enriched
- Reports page redesigned

## Key Architecture Notes

- `system-timeline.json` is a SEPARATE file — single source of truth, not duplicated per family
- Per-family `pipelines{}` holds only that family's active/future pipeline nodes
- `convergence{}` pre-computes DPP date and identifies binding constraint
- `content{}` replaces monolithic `info` HTML — each section independently updatable
- Source citations `[S#]` link to source-registry.md on the agent side
- Pipeline B (old CPR): PCR and SMP only — SReq under CPR 305/2011, no DPP trigger
- Pipeline A (new CPR): All families eventually — DPP trigger via HTS + Art. 75(1) DA
- DPP formula: max(Art.5(8)+12mo, Art.75(1)DA+18mo) = dual gate convergence
- System timeline ~Q1-Q2 2029 estimate; most families' product timelines are binding constraint
