# Rubric scorecard — CPR DPP Tracker UI audit

**Date:** 2026-04-28
**Codebase pin:** last commit `7587455` on 2026-04-23
**Synthesis:** [AUDIT.md](AUDIT.md)

Scoring: **0** = absent · **1** = partial · **2** = full. Max 32 points across 16 items.

---

## Core 16-pattern rubric

| # | Pattern | Owner | Score | Evidence (one-line) | Anchor finding |
|:-:|---|:-:|:-:|---|---|
| 1 | Swimlane coherence (hierarchical, non-tangled, ranks match expected sequence) | S2 | **1** | Lanes rank-ordered + non-tangled within column, but cross-lane edges never drawn so the "graph" is structurally a multi-column Gantt despite its name. | [02-graph-and-density §BLOCK 3](02-graph-and-density.md) — `js/convergence-view.js:476-490` |
| 2 | SVG focus-ring visibility (≥2px outline, 3:1 contrast vs unfocused, not obscured) | S1 | **0** | `outline: none` set on `:focus-visible` with no replacement style, both light AND dark modes. WCAG 2.4.7 BLOCK on the headline surface. | [01-accessibility §BLOCK 2](01-accessibility.md) — `css/convergence.css:245-249, 1169-1172` |
| 3 | Keyboard navigation (arrow-key swimlane traversal + skip-to + no traps) | S1 | **1** | Skip-link present + Enter/Space on chart nodes work; **but** the 37 product cards (only entry point) are mouse-only `<div role="listitem">` with no `tabindex`/`keydown`; no arrow-key swimlane traversal; no roving tabindex. | [01-accessibility §BLOCK 1 + HIGH 4](01-accessibility.md) — `js/tracker.js:208,693,777-784` |
| 4 | ARIA labelling for nodes & edges (correct roles, labels, decorative-vs-informative split) | S1 | **1** | Buttons + FAQ + source-toggle correctly labelled; **but** filter buttons missing `aria-pressed`; certainty dot button has empty colored span as accessible name (reads "button"); source-citation tooltips lack `role="tooltip"` + `aria-describedby`; combobox pattern incomplete on standards-search. | [01-accessibility §HIGH 1, 5, MEDIUM 1](01-accessibility.md) — `js/filters.js:83,98,139,150`; `js/source-layer.js:30,114-125` |
| 5 | Tree-view or table fallback for AT users (parallel DOM accessible to screen readers) | S1 | **0** | Single positioned-div render path; no parallel `role="tree"` or `role="table"` representation. AT users hear a flat list of fragments without knowing which fragment belongs to which pipeline or year. | [01-accessibility §HIGH 3](01-accessibility.md) — `js/convergence-view.js:339-547` |
| 6 | Target size compliance (≥24×24 CSS px + 8 px spacing) | S1 | **1** | Node row ≈26 px tall on desktop (just-passes); mobile breakpoint shrinks dot to 18 px (fails). `MIN_NODE_SPACING=34`. | [01-accessibility §MEDIUM 2](01-accessibility.md) — `css/convergence.css:254-256, 1308-1309`; `js/convergence-view.js:13` |
| 7 | Drag alternative for pan/zoom | S1 | **2** *(vacuous)* | No drag/pan/zoom currently exists, so no alternative needed under WCAG 2.5.7. **Flagged for redesign scope** — if Phase 4 introduces pan/zoom, this requirement crystallises. | [01-accessibility §MEDIUM 3](01-accessibility.md) — design-time constraint |
| 8 | Color-blind-safe status palette | S1 + S5 | **0** | TWO BLOCK defects: (a) orange certainty class never matches CSS (~41 elements unstyled); (b) `--cert-red-orange` and `--cert-red` resolve to identical `#ef4444`. Deuteranopia projection also collapses amber/orange (RGB-diff 28). Three of the seven palette steps unreliable for ~6% of audience. | [05-regulatory-and-brand §BLOCK 1, 2 + HIGH 4](05-regulatory-and-brand.md) — `css/tracker.css:43-50` plus 6 CSS files for class mismatch |
| 9 | Non-colour status signalling (icon + text + pattern, never colour alone) | S1 | **0** | `STATUS_ICONS` exists for status (complete/in-progress/overdue/pending) but **certainty** is colour-only on chart dots; no glyph, no pattern, no chart legend rendered anywhere. WCAG 1.4.1 fail on the chart's most semantically loaded dimension. | [01-accessibility §BLOCK 3](01-accessibility.md) — `css/convergence.css:269-275`; `js/convergence-view.js:495-497` |
| 10 | `prefers-reduced-motion` support | S1 | **0** | Zero matches across all CSS+JS in the project. ~25 CSS `transition:` rules + infinite `skeleton-shimmer 1.8s` animation play unconditionally for users who set OS-level motion preference. WCAG 2.3.3 / EN 301 549 §7.1.5 fail. | [01-accessibility §BLOCK 4](01-accessibility.md) — entire CSS surface |
| 11 | Real-time alert feedback (Nielsen #1: visibility of system status) | S3 | **0** | No update banner, no "Last regulatory update: …" header, no "since last visit" diff, no change-feed. Hero meta surfaces only count + regulation citation; doesn't even update post-filter. | [03-information-architecture §HIGH 2](03-information-architecture.md) — `index.html:90`; `js/tracker.js:123` |
| 12 | Recognition over recall / active filters always visible (Nielsen #6) | S3 | **1** | Active state is inferable from chip-not-dimmed (the `--active` class is the only feedback), but no chip-list summary above the grid + result-count meta doesn't update post-filter. Returning to a deep-linked filter URL = mental diff against original. | [03-information-architecture §HIGH 1](03-information-architecture.md) — `js/filters.js:90-122,139,150` |
| 13 | Shneiderman overview → zoom & filter → details on demand | S2 | **1** | Zoom + detail layers ship and work well (filters, expansion panels, source overlay, comparison view, full convergence detail). **But the overview rung is broken** — `js/system-dashboard.js` (224 LOC) was built and never wired into `index.html`. The user must click into a family before they ever see the cross-cutting EU System Timeline. | [02-graph-and-density §BLOCK 1](02-graph-and-density.md) — `index.html` (no `#sysDashSection`); `js/comparison.js:167,247` ghost-references it |
| 14 | Minimalist aesthetic / Tufte data-ink ratio | S2 + S5 | **1** | Chart proper is sober (no decorative gradients, 1px gridlines, sober palette). **But** surrounding chrome competes — 16 box-shadows in `tracker.css`, alternating nth-child borders on expansion panels, entrance slide animation, 4-tier border-radius scale. Plus brand layer: hero icon mosaic at 7% opacity is decorative ink with no information value. | [02-graph-and-density §MEDIUM 1](02-graph-and-density.md) — `css/convergence.css:1103-1109, 21-27`; `css/tracker.css:291-308, 1422-1486` |
| 15 | Faceted search / power-user filtering (URL-state-bookmarkable, <200ms response) | S3 | **1** | <200ms response confirmed (37 cards in-memory). URL-state works for filter alone — **but** explicitly bails out when a family is open (`js/filters.js:262`), silently dropping filter-state on family-detail share. Only 2 facet dimensions (pipeline + certainty) vs needed 6+ (NANDO baseline 5; OneTrust/RegASK 6+). | [03-information-architecture §BLOCK 1, 2 + MEDIUM 3](03-information-architecture.md) — `js/filters.js:11-18, 259-286, 262` |
| 16 | Regulatory terminology match (CPR / DPP vocabulary correctness) | S5 | **2** | All cited articles (Art. 5(8), 11, 12, 10(4)) verified against cpr-expert reference fact-base. Convergence formula `max(Art.5(8)+12mo, Art.75(1)DA+18mo)` matches canonical. 305/2011 vs 2024/3110 split correctly applied per family. Annex VII numbering correct. JTC24 sub-items correct (prEN 18216-18223). One minor `hts/HTS` casing inconsistency (MEDIUM only). | [05-regulatory-and-brand scorecard #16 + MEDIUM 2](05-regulatory-and-brand.md) — `data/families-v2.json` content cells |

---

## Aggregate

**Total: 12 / 32 = 37.5%**
Excluding the vacuous 2 on #7: **10 / 30 = 33%** effective.

Distribution:
- **Score 2 (full):** 2 items (#7 vacuous, #16)
- **Score 1 (partial):** 7 items (#1, #3, #4, #6, #12, #13, #14, #15) — actually 8
- **Score 0 (absent):** 6 items (#2, #5, #8, #9, #10, #11)

Six absences cluster cleanly: **5 of 6 are accessibility (#2, #5, #8, #9, #10) + 1 is the change-feed (#11)**. Sequencing implication for the redesign: a single accessibility design-system push (Phase 2 in the roadmap) would lift the rubric to ~22/32 (69%) and resolve all six 0-scores except #11.

The two `2`-scores (#16 regulatory terminology, #7 vacuous-pass on drag) confirm that the **substance is solid** and the **functional choices are conservative**. The work to do is structural (a11y design-system, brand integration, persistence backend, faceted filtering) — not regulatory rework.

---

## Additional patterns scored by specialists (outside the core 16)

These patterns were owned by specialists but are not in the contracted 16-item rubric. Reported here for completeness; not in the aggregate above.

| Pattern | Owner | Score | Anchor |
|---|:-:|:-:|---|
| Layered timeline visualisation | S2 | 1 | Per-family layered timeline excellent (5 pipelines + system in one chart); cross-family overview surface absent → ties to #13 |
| Critical-path highlighting | S2 | 0 | Binding constraint computed in JSON, surfaced as text in DPP Outlook, never drawn on the chart |
| Dependency / convergence indicators | S2 | 0 | No SVG edges, no diamond at convergence date, no "this gates that" semantics drawn |
| Swimlane-actor separation | S2 | 0 | No `actor` field in schema; axis is regulatory-instrument only |
| Year-clustered vs continuous timeline tradeoff | S2 | 1 | Continuous chosen (right for per-family precision); un-considered for the missing overview where clusters would suit better |
| Layout-engine fitness (vs dagre/ELK/RF) | S2 | 1 | Hand-rolled survives at current node count; weakest on cross-lane edges (which it doesn't draw at all) |
| Multi-dimensional filtering | S3 | 0 | Only pipeline + certainty; no jurisdiction / Annex II / DPP year / binding-constraint / standard-type |
| Year-clustered chronological layout | S3 | 0 | Date-sorted grid has no year separators |
| Progressive disclosure (popover/drawer/page) | S3 | 2 | Convergence view is full-page replacement; node-click adds inline detail panel + expansion — well-tiered |
| Searchable/scannable timeline w/ sticky header | S3 | 0 | No in-page section nav, no sticky section anchors, 12+ viewports of mobile scroll |
| Navigation flow (grid→detail→compare→standard→reports) | S3 | 1 | Each individual hop works; URL-persistence partially broken; no breadcrumb in standard.html |
| Discoverability (orphans: dashboard.html, system-dashboard.js) | S3 | 0 | Two strategic surfaces hidden from main nav |
| Mobile responsiveness | S3 | 1 | Card grid + convergence stack respond, BUT nav search disappears with no fallback, comparison-checkbox invisible on touch |
| Search ergonomics (hero + nav search) | S3 | 1 | Autocomplete + ARIA + ID-priority sort = good; but nav search gone on mobile, no `Cmd-K`, hero search hidden once detail open |

Additional aggregate (S2 + S3 extras): **8 / 28** = 29%.

---

## S4 admin scorecard (separate dimension — operator workflow)

S4's domain is the operator-facing surfaces, scored against an admin-specific 13-item checklist:

| Item | Score | Anchor |
|---|:-:|---|
| Review-queue acceptance flow | **2** | Two-axis verify gate, accept disabled until claim_attributed, undo metadata, auto-advance. Strongest pattern in codebase. |
| Family editor ergonomics | 1 | Pipeline-aware editor with cert/status dropdowns + content textareas; no diff preview, no per-field undo |
| System-timeline editor | **0** | Same UI as per-family editor, zero impact assessment for changes that affect 37 families |
| Data-health heatmap (`dashboard.html`) | 1 | Correctly identifies hEN/EAD count mismatches; legible heatmap; **unlinked from main UI**, no action affordance |
| Data-health heatmap (`js/data-health.js`) | 1 | Strong 5-dimension weighted scoring, worst-first ranking; no action loop from issue → fix |
| Error / empty / loading states | 1 | Inconsistent — three different patterns across modules |
| Password gate UX | **0** | `sha256("admin")`, no logout, no expiry, no rate limit, localStorage-only |
| Data export | **2** | Clean three-card export (families / system / sources); `downloadJson` works |
| Audit trail | **0** | Only `verified_by: 'admin'` literal stamped client-side; no server-side log |
| Impact assessment | **0** | Zero — system-timeline edits silently propagate to all 37 families |
| Notes tab | **0** | Local-only scratchpad with regex-based agent detection, no integration |
| Invoice flow | 1 | Public buyer flow works; no operator counterpart, year-bug |
| XSS hardening verification | 1 | Admin-edit surface clean; `dashboard.html escHtml` inconsistent + raw interpolation; `dpp-info.js` orphan with unsafe innerHTML |

**Admin total: 12 / 26 = 46%** — competent foundation, structural gaps the cosmetic 2026-04-23 cleanup didn't reach.

---

## Combined posture across all dimensions

| Dimension | Score | % |
|---|---|---|
| Core 16-pattern rubric | 12 / 32 | 37.5% |
| Additional patterns (S2 + S3) | 8 / 28 | 28.6% |
| Admin workflow (S4) | 12 / 26 | 46.2% |
| **Combined** | **32 / 86** | **37.2%** |

Pre-redesign baseline. Roadmap target after Phases 1-7: **>72/86 (>83%)**.

Phases by lift:
- Phase 1 (Sprint 3 resumption + sub-day BLOCKs): **+8** points → 47%
- Phase 2 (a11y design-system tier): **+12** points → 60%
- Phase 3 (brand integration + cert-palette redesign): **+5** points → 66%
- Phase 4 (convergence chart visual completion): **+8** points → 75%
- Phase 5 (operator workflow + persistence): **+9** points → 86% (admin component to ~22/26)
- Phase 6 (faceted filtering + IA + mobile): **+7** points → 94%
- Phase 7 (trust gradient publicly visible): **+3** points → 97%

The roadmap is sequencing the 86-point ceiling, not chasing it; phases are independently shippable and the sequence can be reordered if commercial priorities shift.
