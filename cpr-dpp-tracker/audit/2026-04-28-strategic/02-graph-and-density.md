# S2 — Graph visualisation, convergence timeline, dense-data hygiene

**Auditor:** Specialist S2 (Strategic UI Audit, 2026-04-28)
**Scope:** `js/convergence-view.js`, `css/convergence.css`, `js/tracker.js`, `js/node-expansion.js`, `js/source-layer.js`, `js/system-dashboard.js` (parked), `js/comparison.js`, `js/filters.js`, `data/families-v2.json`, `data/system-timeline.json`, `index.html`, `dashboard.html`, `PLAN.md`, plus live URL `https://demos.regenstudio.world/cpr-dpp-tracker/`.
**Rubric ownership:** #1 Swimlane coherence, #13 Shneiderman overview→zoom→detail, #14 Tufte data-ink ratio, plus six additional graph/timeline patterns.
**Code reference point:** sources current as of last commit `7587455` (2026-04-23).

---

## 1. Executive summary

The convergence chart in `js/convergence-view.js` is a genuinely original surface — a hand-rolled, time-aligned, dual-axis swim-lane that aligns per-pipeline node columns to a shared year axis with dynamic pixels-per-year scaling and a "Now" marker. As an information-display object it is more sophisticated than the AI Act / Osborne Clarke timelines it competes with: those are uniform horizontal year-clusters; this one is a true 2-D graph (lane × time). That is the strategic asset and it should not be thrown away.

But the surface is also the only graph surface. Shneiderman's overview→zoom→detail is broken at the **overview** layer: the landing page is a 37-card grid sorted by DPP date with no aggregate timeline visible — the cross-cutting "System Timeline" that the data model treats as the spine of the whole regulation is built (`js/system-dashboard.js`, `data/system-timeline.json`) but **never wired into `index.html`**. The user must click into a family before they ever see the system timeline as a graph. This is the single largest strategic UX gap.

Dense-data hygiene is mid-tier: the chart itself respects Tufte (no decorative gradients, sober palette, year labels at gridlines), but the surrounding chrome is overdressed — 16 box-shadows in `tracker.css`, 31+36 border-radii, alternating `nth-child` borders on expansion panels — and font sizes have crept down to 0.5–0.6rem in the chart, eroding readability. The convergence chart fights with the DPP Outlook box for visual primacy. Critical-path (Art.5(8) → Art.75(1)DA → DPP) is **never visually emphasised** anywhere — neither flagged nor highlighted. Across 37 families × 60 pipeline columns × 347 nodes (+ 1 system column) the chart has no edge-rendering between columns: convergence is *implied* by shared year axis but never *drawn*. That is the second strategic gap.

Verdict: **keep the hand-rolled engine, fix the overview layer, draw the convergence edges, and add a critical-path treatment.** Do not port to dagre/ELKjs/React Flow yet — see § Layout-engine recommendation.

---

## 2. Findings (8 in priority order)

---

### [BLOCK] System Timeline dashboard built but never rendered on landing page
- **Location:** `js/system-dashboard.js` exists (224 LOC) and `data/system-timeline.json` exists (9 main + 3 cross-cutting nodes); `index.html` has no `#sysDashSection` element and `js/tracker.js` never calls `window.renderSystemDashboard`. `js/comparison.js:167,247` references `document.getElementById('sysDashSection')` to toggle visibility — pointing at a ghost.
- **Rubric item:** #13 Shneiderman overview / additional: layered timeline visualisation
- **What:** `PLAN.md:104,132` lists Sprint 3 (system-dashboard + filters) as **PARKED 2026-04-23**. The component renders fine when called — it's a horizontal node-chain with status icons and a DPP callout — but no DOM container exists. So the user opens `https://demos.regenstudio.world/cpr-dpp-tracker/` and sees: hero → disclaimer → 37 cards. The single most important regulatory fact about the entire 37-family universe ("DPP Mandatory: Q1-Q2 2029, system timeline binds for X of 37 families") is invisible until the user picks one family at random and opens its convergence view, where the system column then appears as the leftmost lane of the chart.
- **Why it matters:** This is the Shneiderman overview rung. The information-seeking mantra requires that the user can see the whole landscape in one view before drilling. Right now the only "overview" is a sortable grid — equivalent to the pre-redesign card layout. The strategic insight ("DPP_date = max(Product, System)") that justified the whole graph redesign per PLAN.md is hidden behind a click. Osborne Clarke's Digital Regulatory Timeline and the AI Act Implementation Timeline both lead with the cross-cutting clock; this tracker has the data and the component but doesn't lead with it.
- **Recommendation:** Resume Sprint 3 minimally. Add `<section id="sysDashSection">` to `index.html` between `tracker-landing` and `filterBar`. Wire `renderSystemDashboard(document.getElementById('sysDashSection'), systemTimeline)` in `js/tracker.js:122` after `populateHeroIcons()`. Recreate the deleted `css/dashboard.css` stub. Cost: ~2 hours. Benefit: restores the overview layer; gives the landing page a regulatory-clock anchor; makes the binding-constraint story (38% of families bind on system, rest on product) finally visible. Until this lands, the redesign claim of "convergence timeline platform" is partially fictional.
- **Reference:** Shneiderman (1996), "The Eyes Have It"; Osborne Clarke Digital Regulatory Timeline (https://digitalregulation.osborneclarke.com/).

---

### [BLOCK] No critical-path highlighting — Art.5(8) → Art.75(1)DA → DPP path is invisible
- **Location:** Applies to all family pages. `js/convergence-view.js` renders all nodes with the same visual weight (`conv-chart__node` class + per-certainty dot color) regardless of whether the node sits on the binding-constraint path.
- **Rubric item:** Additional finding: critical-path highlighting (CPM)
- **What:** The convergence formula `DPP = max(Art.5(8)+12mo, Art.75(1)DA+18mo)` defines a critical path of typically 2–3 nodes per family: the latest-blocking node in the product timeline (usually NT-9 HTS In Force) plus the system-side `sys-art75-da` plus `sys-dpp-mandatory`. The data model already knows this — `convergence.binding_constraint` is `"product"` or `"system"` and `formula_note` cites the actual numbers (e.g. PCR: `"max(Product ~2030–2031, System Q1-Q2 2029) = ~2030–2031"`). But the chart renders these critical nodes identically to the 5–7 upstream nodes that are not on the path.
- **Why it matters:** Critical-Path Method (Kelley & Walker 1959; PMI standard) is the single most-applicable visual pattern for a "what binds the deadline" diagram. Without it, the user must trace the shared year axis manually to figure out which column is later. The DPP Outlook box above the chart (`js/tracker.js:472-616`) tells them in text — "binding: Product timeline" — but the chart itself never reflects this. The whole point of a graph over a table is that the binding edge becomes *spatially obvious*. Right now the graph is decorative and the text is load-bearing; that's the wrong way around.
- **Recommendation:** Two-tier visual treatment.
  - (a) In `js/convergence-view.js` add a `criticalPath` computation: for each column find the latest-dated NT-9 / latest dated terminal node; mark `node.critical = true`. Render with thicker border (3px instead of 2px), opacity 1.0 vs 0.6 for non-critical, and a connecting **edge** between the chosen product-side terminal and `sys-dpp-mandatory`. (b) When `binding_constraint = 'product'`, draw the edge in the column color (#009BBB for A); when `'system'`, draw it from the system column. Cost: ~1 day. Benefit: the chart finally answers "what binds this family's deadline" without the user reading text. Aligns with the "convergence" name of the surface — currently "convergence" is a metaphor not a visual.
- **Reference:** Kelley & Walker (1959) Critical Path Method; PMI PMBOK swimlane practice.

---

### [BLOCK] No drawn dependency / convergence edges between columns
- **Location:** `js/convergence-view.js:476-490` (track is per-column only); whole rendering loop never draws an SVG line or absolutely-positioned diagonal between columns.
- **Rubric item:** Additional finding: dependency / convergence indicators; #1 swimlane coherence
- **What:** The chart is technically a multi-column chart, not a graph. Each column has its own vertical `conv-chart__track` (the gray line at `left: 50%`); nodes connect *within* a column, never *across*. The semantic relationships that justify a graph view — "Pipeline A's NT-7 (OJ Citation under Art.5(8)) gates the same family's NT-9 (HTS in force), which together with sys-art75-da gates DPP" — are encoded in the JSON but never drawn.
- **Why it matters:** Rubric #1 (swimlane coherence) explicitly rewards "non-tangled" + "ranks match expected sequence". Both are met *within* a swim-lane — the year axis is the rank — but the cross-lane semantics are silently missing. dagre/ELKjs/React Flow case studies all rank a graph by visualising edges that cross swim-lanes in a controlled way (the AI Act tracker fakes this by year-clustering; the CPR tracker chose a richer 2-D model but then didn't draw the edges). Result: the visual surface promises a graph and delivers a Gantt with extra columns.
- **Recommendation:** Two implementation paths.
  - **Cheap (1 day):** Overlay a single SVG layer inside `.conv-chart` at z-index 0; draw 1–3 dashed convergence-arrow polylines from `(SYS column @ sys-dpp-mandatory)` and `(product column @ NT-9)` converging to a single diamond at the binding date. This is the visual grammar of CPM dependency and Tufte's "small multiples convergence". Implement once, applies to all 37 families.
  - **Rich (3 days):** Generalise to per-node `dependencies: ["sys-art75-da"]` arrays in JSON; render as low-opacity Bezier curves cross-column. Risk: edge-crossing chaos with 60 pipeline columns × 347 nodes — unless edges are drawn only on hover/focus.
  - Pick the cheap path first; ship with the convergence diamond at `dpp_date`.
- **Reference:** Tufte (2006) *Beautiful Evidence* §3 ("convergence diagrams"); ELKjs Sankey/CPM case studies.

---

### [HIGH] Font sizes have crept below readability floors
- **Location:** `css/convergence.css:108` `.conv-chart__year-label` font-size `0.6rem`; `:200` `.conv-chart__col-title` `0.62rem`; `:208` `.conv-chart__col-tag` `0.48rem`; `:284` `.conv-chart__node-name` `0.66rem`; `:290` `.conv-chart__node-date` `0.56rem`; `:325` `.conv-chart__node-badge` `0.5rem`; `:1357` mobile breakpoint pushes node-name down to `0.52rem`.
- **Rubric item:** #14 Tufte data-ink ratio (in its readability-floor reading, not its decoration reading)
- **What:** `0.5rem` at the default 16px root = 8px. `0.48rem` ≈ 7.7px. WCAG 2.2 has no hard floor but most type-system literature (NN/G, Apple HIG, Material) treats 11px as the minimum readable size for non-decorative information; below that the eye stops parsing characters and starts pattern-matching shapes. The convergence chart packs ~15 distinct text styles into a single column-width that's then divided across 3–6 columns at 1200px max-width — i.e. ~150–300px per column for badge + title + tag + node name + date + sub-badge.
- **Why it matters:** Tufte's data-ink ratio has *two* sides: maximise data, minimise non-data ink. Shrinking text to fit more on screen *increases* data density per pixel but *destroys* the data's readability — Tufte's whole point is that information should be *legible*, not just *present*. Right now a user with normal vision must lean toward the screen on a 1080p display to read the column headers. On the mobile breakpoint they cannot. The chart looks dense and serious; it is partly unreadable.
- **Recommendation:** Reset the type scale. Year labels and node names should be 0.75rem (12px) minimum; column titles 0.8125rem (13px); badges 0.6875rem (11px). Increase column min-width to 180px and switch to horizontal scroll past 5 columns instead of squeezing further. Cost: half day. Benefit: the chart becomes readable to non-30-year-old eyes, which is the primary target market for a regulatory tracker.
- **Reference:** NN/G "Legibility, Readability, and Comprehension"; Tufte (1983) §3 *The Visual Display of Quantitative Information*.

---

### [HIGH] Year-clustered vs continuous timeline — wrong tradeoff for the family-detail layer
- **Location:** `js/convergence-view.js:255-279` (`computePxPerYear`) + `:401-414` (range computation, capped at 2000px chart body). Timeline is continuous (one pixel-per-year value across the full range).
- **Rubric item:** Additional finding: year-clustered vs continuous tradeoff
- **What:** A continuous-axis timeline puts every node at its correct date. Strength: precise convergence. Weakness: when most nodes cluster in 2025–2027 and the DPP date is 2031, ~70% of the chart is empty whitespace. The dynamic px-per-year clamp (`MIN_PX_PER_YEAR=120`, `MAX_PX_PER_YEAR=400`, total cap 2000px) tries to compensate but produces variable density per family — visually inconsistent across the 37-family set. Year-clustered timelines (AI Act Implementation Timeline) trade off date-precision for predictable visual rhythm; every year takes the same vertical space whether it has 12 nodes or 0.
- **Why it matters:** Both choices are defensible — but the *choice should be context-dependent*. For per-family deep-dives, continuous is right (you want to see "Q4 2026 delivery → Q3 2027 OJ citation → 2031 DPP"). For the cross-37-family overview that's currently missing (per BLOCK #1), year-clustered is right — you want each family to look comparable when laid in a small-multiples grid. Right now the project commits to continuous everywhere; that hurts the overview layer it doesn't yet have.
- **Recommendation:** Keep continuous for the convergence view (per-family). When building the missing System Timeline dashboard (BLOCK #1), use year-clusters: 2025 | 2026 | 2027 | 2028 | 2029 | 2030 | 2031, with each year a fixed 80px-tall row, system + cross-cutting nodes inside. This gives the overview the visual rhythm of the AI Act / Osborne Clarke timelines while the per-family view keeps its precision. Cost: ~half day extra on top of the BLOCK #1 fix. Reference design: https://artificialintelligenceact.eu/implementation-timeline/.
- **Reference:** Freshfields "layered timeline" framing (2025); AI Act Implementation Timeline.

---

### [HIGH] Hidden actor / swimlane-actor separation absent
- **Location:** Applies across all family pages and the system dashboard. Schema in `data/system-timeline.json` has no `actor` field; `data/families-v2.json` pipelines have no actor field; `js/convergence-view.js` has no actor-grouping logic.
- **Rubric item:** Additional finding: swimlane-actor separation (PRINCE2 / PMI swimlane practice)
- **What:** Every node in the timeline has an implied owner — CEN/TC for NT-3/NT-4/NT-5 (standards development), the European Commission for NT-7 (OJ citation under Art.5(8)) and NT-15 (Art.75(1) DA), Notified Bodies / industry for NT-8 (coexistence) and NT-9 (HTS in force), and authorities (the operational EU systems) for NT-12/NT-13 (registry, portal). PLAN.md mentions standards-development progression but no actor metadata. The chart shows columns by *pipeline* (A, B, C, D, E + SYS) — a regulatory-instrument axis — but the actor-axis is collapsed into the pipeline label.
- **Why it matters:** PRINCE2/PMI swimlane convention (and the construction-industry's own RACI matrices) explicitly puts actor on a swimlane axis precisely because "who is responsible for unblocking this" is the most-asked question in deadline tracking. A user reading the convergence view today cannot quickly answer: "is the next milestone for me to do (industry), or is it gated on EC/CEN?" — they have to read the node label and infer.
- **Recommendation:** Two parts.
  - (a) Add `actor` field to each node-type definition (already implicit per node `type` — encode it once in a lookup): NT-1..NT-4 = CEN/TC; NT-5 = CEN/TC + Industry; NT-6/NT-7 = European Commission; NT-8/NT-9 = Industry + Notified Bodies; NT-10..NT-17 = European Commission / Joint Research Centre; NT-18..NT-20 = European Commission.
  - (b) Render an actor-icon at top-right of each node dot (small 8px badge, e.g. "EC", "CEN", "IND"). Cost: ~half day for the lookup + render. Optional v2: a toggle to recolor lanes by actor instead of pipeline. Benefit: addresses one of the most-asked regulatory-tracker questions ("what's blocked on us, what's blocked on Brussels"); reduces text-reading load.
- **Reference:** PRINCE2 RACI swimlane practice; PMI PMBOK §10.

---

### [MEDIUM] Tufte hygiene drift — alternating nth-child borders, decorative shadows, animated entrance
- **Location:** `css/convergence.css:1103-1109` (alternating `nth-child(odd)` teal border + `nth-child(even)` light border + bg shift on `.conv-expansion`); `:21-27` `convSlideIn` 0.3s entrance animation; `:78-82` rounded close-button on a flat header; `:498` panel `box-shadow: 0 4px 16px rgba(0,0,0,0.08)` on the node detail.
- **Rubric item:** #14 Tufte data-ink ratio
- **What:** Counted in `css/convergence.css`: 6 `box-shadow` declarations, 31 `border-radius` declarations, 0 `linear-gradient`. In `css/tracker.css`: 16 box-shadows, 36 border-radius, 3 linear-gradients. The alternating-row treatment on expansion panels is doing two jobs (zebra-stripes + brand-color accent) where one would suffice; the entrance slide-in animation is decorative.
- **Why it matters:** Tufte's data-ink ratio is "fraction of the ink devoted to non-redundant display of data information". The chart itself scores well — single 1px gridlines, small dots, no gradients, sober palette. But the surrounding chrome (panels, animations, buttons) is competing for attention with the data and lowering the ratio. The 4-tier hierarchy (chart → DPP outlook → expansion panels → content sections) blurs because each tier has its own border-radius (8/10/12), shadow (sm/md/lg), and accent color. Visual hierarchy collapses to "everything is a card".
- **Recommendation:** Single sweep:
  - Remove `box-shadow` from `.node-detail` and `.conv-expansion` — replace with a single 1px border in `--color-border`. Box-shadows belong on hover states, not resting state.
  - Drop the alternating `nth-child` colors on `.conv-expansion` — pick teal accent only when the panel relates to the binding-constraint pipeline; otherwise no accent.
  - Remove the `convSlideIn` animation; instant render is more honest.
  - Standardise on one border-radius value (8px) across chart + panels.
  - Cost: ~3 hours. Benefit: chart and surroundings become a single visual surface that reads as one document, not five layered cards.
- **Reference:** Tufte (1983) *The Visual Display of Quantitative Information* §3; NN/G "How to Eliminate Chartjunk".

---

### [MEDIUM] Source-transparency layer is opt-in only — undermines the "regulatory intelligence" framing
- **Location:** `js/source-layer.js:25-60` (init listens on `#sourceToggle`); `index.html:153-156` (the floating "Sources" button); badges injected only when toggled on (`injectSourceBadges` removes existing then re-adds).
- **Rubric item:** Additional finding: minimalist aesthetic / Tufte (subtractive); #13 Shneiderman details-on-demand
- **What:** Every node in `system-timeline.json` and most pipeline nodes carry a `sources` array. The "no-source warning" treatment in the chart is good — `:299-318` red outline + `!` badge on `conv-chart__node--no-source`. But verified sources only render when the user explicitly clicks the floating "Sources" button. By default the chart displays dates, statuses, and certainty colors as if they were facts — with no visible signal that they're cited.
- **Why it matters:** The strategic positioning per PLAN.md is "regulatory intelligence platform" — that promise is undermined when the citation layer is opt-in. Compare the always-on inline source-styling of journalistic data viz (NYT, FT regulatory trackers) where citation marks are visible-but-de-emphasized at rest. The current pattern says "we have sources but they cost a click" — exactly inverted from what a regulatory-intelligence tool should signal.
- **Recommendation:** Two tweaks.
  - Inline `[Sn]` references already wrap `.src-inline` spans (`source-layer.js:147-181`); change CSS so they render as faint superscript by default (visible but unobtrusive) and the toggle switches to *high-contrast highlight* mode rather than off→on.
  - Always-render the `!` no-source warning on the dot; make this the affordance that motivates clicking the toggle.
  - Cost: 1 hour CSS-only. Benefit: aligns the visual signal with the strategic promise.
- **Reference:** Tufte's "small multiples + footnotes" pattern; Bloomberg / Reuters Graphics inline-source convention.

---

## 3. Rubric scorecard

| Pattern | Score 0/1/2 | One-line evidence | Anchor |
|---|---|---|---|
| **#1 Swimlane coherence** | 1 | Lanes rank-ordered + non-tangled within column, but cross-lane edges never drawn so the "graph" is structurally a multi-column Gantt. | `js/convergence-view.js:476-490` |
| **#13 Shneiderman overview→zoom→detail** | 1 | Zoom + detail layers shipped (filters, expansion, source overlay), but **overview** layer broken — system dashboard built and never wired. | BLOCK #1; `js/system-dashboard.js` exists, `index.html` lacks `#sysDashSection` |
| **#14 Tufte data-ink ratio** | 1 | Chart proper is sober (no gradients, 1px gridlines), but surrounding chrome (16 box-shadows, alternating nth-child accents, slide animation) drags ratio down. | `css/convergence.css:1103-1109,21-27` |
| Layered timeline visualisation | 1 | Per-family layered timeline excellent (5 pipelines + system in one chart) but no cross-family layered overview surface. | Compare AI Act https://artificialintelligenceact.eu/implementation-timeline/ |
| Critical-path highlighting | 0 | Binding constraint computed in JSON, surfaced as text in DPP Outlook, never drawn on the chart. | BLOCK #2; `js/convergence-view.js` (no `node.critical` rendering) |
| Dependency / convergence indicators | 0 | No SVG edges, no diamond at convergence date, no "this gates that" semantics drawn. | BLOCK #3; `conv-chart__track` is per-column only |
| Swimlane-actor separation | 0 | No `actor` field in schema, no actor-icon rendering, axis is regulatory-instrument only. | HIGH; `data/system-timeline.json` schema |
| Year-clustered vs continuous tradeoff | 1 | Continuous chosen (right for per-family precision), but un-considered for the missing overview layer where clusters would suit better. | HIGH; `js/convergence-view.js:255-279` |
| Layout-engine fitness (vs dagre/ELK/RF) | 1 | Hand-rolled survives at current node count; weakest on cross-lane edges (which it doesn't draw at all). | See § 4 |

**Owned-rubric raw total:** 3 / 6 (50%)
**Including additional patterns:** 5 / 18 (28%)

---

## 4. Layout-engine recommendation — keep hand-rolled (with two specific upgrades)

| Option | Effort | Swimlane integrity | Edge-crossing minimisation | Performance @ 60 cols × 347 nodes | Verdict |
|---|---|---|---|---|---|
| **Keep hand-rolled (status quo)** | 0 | Excellent (per-column laid out cleanly) | N/A — no edges drawn | Excellent (~1 chart at a time, lazy-loaded per family) | **Recommended** for the per-family chart |
| **Keep + add SVG edge overlay** | ~1 day | Excellent | Trivial (only 1–3 critical edges at convergence point) | Excellent | **Recommended addition** to fix BLOCK #2/#3 |
| Port to **dagre.js** | 5–7 days (~5KB lib + rewrite of layout maths) | Improves edge layout, loses time-axis fidelity (dagre is rank-based, not time-based) | Excellent at general DAG | Adequate (37 separate dagre instances) | Not recommended — would lose the single best property of current impl (true year axis) |
| Port to **ELKjs** | 8–10 days (~500KB lib) | Best-in-class, but overkill | Best-in-class | Slow on cold-start (~300ms init) | Not recommended — sledgehammer for a nut; loses time axis |
| Port to **React Flow** | 12–15 days (requires React migration on a vanilla-JS, no-build, ES5-compatible codebase per `regenstudio-demos/CLAUDE.md`) | Excellent | Built-in elkjs/dagre adapters | Adequate | **Strongly not recommended** — violates "no build step" constraint of `regenstudio-demos/`; would drag the entire site infrastructure into a React/Vite world for one tracker |
| Port to **Cytoscape.js** | 7–10 days (~400KB lib) | Good for general graphs | Good | Good | Not recommended — built for biology/network graphs, weak on time-aligned timelines |

**Why keep hand-rolled.** The current `js/convergence-view.js` (557 LOC) is the right tool because the chart is a *time-aligned* swim-lane, not a topology graph. dagre/ELKjs/Cytoscape all rank nodes by topological position — that would *destroy* the year axis which is the chart's single most valuable property. React Flow violates the no-build constraint codified in `regenstudio-demos/CLAUDE.md`. The hand-rolled engine is also cheap to extend: BLOCK #2 and #3 can both be addressed by a ~150-LOC SVG overlay layer without touching the existing layout maths.

**Cost-of-redesign-coherence implication.** Re-platforming the chart while the rest of `regenstudio-demos/` stays vanilla-JS would create a tech-stack split — Claude / future maintainers would face two patterns ("how do other demos do this" vs "how does the tracker do this"). The post-NVTB redesign should resist this. Save React Flow for a green-field redesign of the entire `regenstudio-demos/` shell if and when that happens.

**The two specific upgrades worth implementing now:**

1. **SVG edge overlay** for critical-path + convergence indicators (BLOCK #2 + #3). One `<svg>` element sized to chart bounds, polylines positioned via the existing `yearToTop()` math.
2. **Schema fields** for `actor` (HIGH finding) and `dependencies: []` (BLOCK #3 future v2). Adding fields is cheap; rendering can roll out incrementally.

---

## 5. Top-3 strategic recommendations for post-NVTB redesign

### #1 — Resume Sprint 3 first, before any chart polish

Wire `js/system-dashboard.js` into `index.html` as the **first thing** below the hero. Use a year-clustered horizontal layout (2025 → 2031). The system timeline is the spine of the redesign's "convergence" thesis and right now it's invisible until a user clicks into a family. This is a 2-hour fix that unlocks Shneiderman's overview rung and rescues the redesign-narrative. Without it the tracker is a sortable card-grid with rich detail views — not a regulatory intelligence platform.

### #2 — Convert the chart from "multi-column Gantt" into "true convergence diagram"

Add a single SVG overlay that draws (a) a critical-path treatment (thicker rim on the binding-side terminal node, faded outline on non-critical nodes) and (b) two converging lines from `(latest product-side terminal)` and `(sys-dpp-mandatory)` meeting at a diamond placed at the binding date. This is what every reader expects from a chart literally named "convergence". Cost: ~1 day. Strategic payoff: the metaphor in the surface name finally matches the visual. This single change is what would move the chart from "interesting custom widget" to "case-study-worthy regulatory viz".

### #3 — Reset type scale and strip surrounding chrome before adding any new features

The chart's information density has crept past the readability floor (`0.48–0.66rem` body text in the column headers and node names) and the surrounding chrome (16 box-shadows in tracker.css, alternating nth-child borders on expansion panels, entrance animations) is competing with the data for attention. Reset chart-scope text to 0.75–0.8125rem minimum, drop resting-state shadows, standardise on one border-radius value, remove the slide-in animation. Cost: ~half day. Payoff: the chart goes from "looks dense" to "is dense and readable". This pre-condition is more important than any new visual feature — adding critical-path highlighting on top of an unreadable type scale just adds another visual layer for the user to fail to parse.

---

**One sentence summary for the parent agent:** The convergence chart is the strategic asset and is technically more sophisticated than its industry peers — but the overview layer is broken (system dashboard built, not wired), the chart never draws the convergence edges that justify its name, and the type scale has crept below readability; keep the hand-rolled engine and fix these three things before considering a port to dagre / ELKjs / React Flow.
