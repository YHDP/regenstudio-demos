# S3 — Information Architecture, Faceted Filtering, Navigation, Mobile

CPR DPP Tracker · audit slice 2026-04-28 · strategic redesign input

---

## 1. Executive summary

The tracker has the *bones* of a regulatory-intelligence surface — a card grid with deep-linked detail view, a side-by-side comparator, a hash-state-bookmarkable filter bar, an inline standard-search autocomplete, and a print-clean detail layout. None of these is a NANDO-grade clunker; the convergence formula and the dual-timeline framing are genuinely better than anything in the public NANDO/Sedex/CCB stack.

But the **filter bar is shipped without CSS** (`js/filters.js:77` injects `.cpr-filters` markup and no stylesheet defines that class — confirmed via `grep cpr-filters` returning zero CSS hits). On the live URL the result is an unstyled cluster of buttons under the disclaimer banner — the single biggest blocker. Beyond that: the dimensionality is way too thin for the audience (5 pipelines × 6 certainties × 5 sort options is the whole filter vocabulary — no jurisdiction, no Annex II, no DPP year/quarter, no standard-type, no TC, no binding-constraint slice). The orphaned `dashboard.html` and the parked `system-dashboard.js` represent unactivated value — system-timeline view is the best NANDO-differentiator, and it's hidden. Mobile navigation collapses the standard-search nav input entirely (`@media max-width:768px { .std-search--nav { display: none } }` at `css/standard-search.css:148-151`) without surfacing a hamburger or alternative entry — power users on mobile lose the keyword-recall path.

**Top-3 strengths:** (1) URL-state-bookmarkable filter+detail+compare deep links, (2) `<200ms` filter response (synchronous JS over 37 in-memory rows — tested architecture), (3) standard-search autocomplete is keyboard-navigable, ID-prioritised, ARIA-correct.

**Top-3 risks:** (1) filter bar has no styles → unstyled live render, (2) faceting dimensionality is sub-NANDO at 2 facets vs. NANDO's 6+, (3) mobile breaks search nav and the hero search is the only fallback — once user enters a detail view, no search reachable on small screens.

**NANDO-fication risk: MEDIUM-HIGH.** Not yet there — the convergence framing keeps it elevated — but the missing facets, orphaned dashboard, and broken filter styles drag the experience toward "static spreadsheet you bookmarked once and abandoned." A redesign needs to ship 4-6 new facet dimensions, surface system-timeline.json prominently, and harden mobile.

---

## 2. Findings

### [BLOCK] Filter bar ships without stylesheet — unstyled controls in production
- **Location:** `js/filters.js:77-122` (markup injection); `css/tracker.css` (no `.cpr-filters*` rules); `index.html:108` (mount point `<div id="filterBar"></div>`)
- **Rubric item:** #15 (faceted search & power-user filtering)
- **What:** `filters.js` writes `<div class="cpr-filters">…</div>` with classes `cpr-filters__overview`, `cpr-filters__pipe-btn`, `cpr-filters__cert-dot`, `cpr-filters__sort`, `cpr-filters__reset`. Confirmed via `grep -rn cpr-filters /css/ /index.html` returning **zero hits**. PLAN.md §Sprint 3 §line 132-136 explicitly says "PARKED 2026-04-23 … `css/dashboard.css` was deleted as orphan on 2026-04-23". The parking deleted the only file that would have held filter chrome.
- **Why it matters:** A regulatory-intelligence audience pattern-matches "unstyled inline buttons" to "abandoned shareware." This is the first surface compliance officers see after the hero. NN/G's recognition heuristic (Nielsen #6) is undermined when the controls don't look like controls. Comparator: OneTrust ships filter chips with explicit chip styling, hover states, active vs. inactive contrast — and OneTrust's audience is identical.
- **Recommendation:** Re-create `css/filters.css` (or fold into `tracker.css`) with: pill-shaped pipeline chips colour-keyed to `PIPELINE_COLORS`, certainty dots in 16-20px circles with 2px outline-on-hover, sort-select sized to match nav search, sticky-on-scroll filter bar (offset by nav height). Block redesign work on this — it's a 90-min CSS task.
- **Reference:** Bricxlabs 2026 Filter Patterns (chip design); Algolia faceted-filter docs (active-state contrast).

---

### [BLOCK] Faceting dimensionality is below NANDO baseline (2 dims vs. 6+)
- **Location:** `js/filters.js:11-18` (state shape: `pipelines`, `certainties`, `sort` only)
- **Rubric item:** #15, additional: multi-dimensional filtering
- **What:** Current facet state holds two filter dimensions (pipeline A-E, certainty green→gray) and one sort dimension. Source data in `data/families-v2.json` carries: `family` (Annex VII number), `tc` (technical committee), `convergence.dpp_date` (year), `convergence.binding_constraint` (product/system/tie), `active_pipelines[]`, `future_pipelines[]`, `standards[].type` (hEN vs. EAD), `standards[].avcp`, `standards[].dpp_est`. None of `family`, `tc`, `dpp_date` (as a year-band facet), `binding_constraint`, `standards.type` is filterable.
- **Why it matters:** The audience research (OneTrust, Thomson Reuters Regulatory Intelligence, RegASK, Regology) all expose ≥6 filter dimensions including jurisdiction × topic × deadline × status × org-unit × source. NANDO exposes 5 (country × Annex × type × notification status × directive). The CPR tracker's 2 dimensions reads as a demo, not a product. The killer use case "show me all binding-constraint=system, certainty<=amber, DPP-date<2031 families" is **not expressible** in the current filter set.
- **Recommendation:** Add four facet dimensions in the redesign: (a) **DPP year band** — chips for 2027/2028/2029/2030/2031/2032+/TBD derived from `convergence.dpp_date`; (b) **Binding constraint** — chips for product / system / tie / unknown from `convergence.binding_constraint`; (c) **Annex VII number** — multi-select dropdown 1-37; (d) **Standard type** — hEN-only / EAD-only / mixed. Optionally (e) Technical Committee. URL-state schema below in §4.
- **Reference:** NANDO database (`https://ec.europa.eu/growth/tools-databases/nando/`) — 5-facet baseline. Algolia "good faceted search" guidance (8±2 dimensions).

---

### [BLOCK] `dashboard.html` is unlinked from main UI — orphaned diagnostic surface
- **Location:** `index.html:40-56` (nav has no link); `standard.html:39-49` (nav has no link); `landing.html:67-75` (nav has no link). Only inbound link is the back-arrow at `dashboard.html:246` → `index.html`.
- **Rubric item:** Additional: discoverability
- **What:** `dashboard.html` is a fully-rendered data-integrity heatmap (459 lines of working HTML/JS, last commit 2026-03-20). It's reachable only by typing the URL or following the back-link from itself. The `system-dashboard.js` (`js/system-dashboard.js:31`) draws a horizontal cross-cutting EU DPP system-timeline view — a unique strategic differentiator vs. NANDO — and is **not invoked anywhere** (`grep renderSystemDashboard` returns only its own definition). PLAN.md §line 132 confirms: "Sprint 3 PARKED 2026-04-23 … `js/system-dashboard.js` is drafted but not wired into `index.html`".
- **Why it matters:** The dashboard surfaces both (a) the data-quality story (which is a sales argument: "we caught 4 count-mismatches before you did"), and (b) the cross-cutting system timeline (the half of the convergence formula that's currently invisible on the home page). Without the system-timeline dashboard, the convergence framing is asymmetric — the user sees per-product timelines but never the system-side bar that is the binding constraint for >50% of families per the DPP outlook formula. This is the single biggest IA win available without code rewrite.
- **Recommendation:** (1) Add a `<a href="dashboard.html">Data integrity</a>` to nav (or fold the data-integrity table into a `?view=integrity` param on landing). (2) Re-activate `system-dashboard.js` by mounting it above the card grid in `index.html` between the landing intro (`tracker-landing`) and the filter bar (`#filterBar`). (3) Optionally collapse it under a "System timeline ▾" disclosure that's expanded by default first-visit, collapsed on return (localStorage). 
- **Reference:** Have-Your-Say portal (year-clustered timeline above filter chips); UK Gov Service Manual disclosure pattern.

---

### [HIGH] No "active filters" affordance — Nielsen #6 (recognition over recall) violated
- **Location:** `js/filters.js:90-122` (filter row has no "applied filters" pill list); `index.html:108`
- **Rubric item:** #12 (recognition over recall / active filters always visible)
- **What:** When the user toggles a pipeline off and a certainty band off, the only visual feedback is the *absence* of the `--active` modifier on the source button (`js/filters.js:139, 150`). There is no chip-list summary like "Showing: ▾ Hide pipeline C ▾ Hide certainty gray (4 / 37 families)" above the grid. The grid silently shrinks. The result-count meta (`js/tracker.js:123`) reads "37 product families" *always* — it does not update post-filter.
- **Why it matters:** When a user returns to a deep-linked filter URL (e.g. `#hide=CDE&cert=gray,red-orange&sort=certainty`) the only way to know what's filtered is to mentally diff the original 5 pipeline chips against the dimmed ones. This is a textbook recall-over-recognition failure. OneTrust shows applied filters as removable chips above the result-set; Algolia recommends the same.
- **Recommendation:** Add an "Active filters" chip-bar between the filter controls and the grid. Each chip shows `Pipeline C × | Certainty: gray ×` with click-to-remove. Update the result count: `Showing 23 of 37 families · 14 hidden by filters · [Clear all]`.
- **Reference:** NN/G "Visibility of System Status"; Algolia faceted-filter best practices.

---

### [HIGH] No real-time alert / "what changed" feed — Nielsen #1 (visibility of system status)
- **Location:** `index.html:90` ("Loading..." then "37 product families · Regulation (EU) 2024/3110"); `js/tracker.js:123`
- **Rubric item:** #11 (real-time alert feedback)
- **What:** The hero meta surfaces only the count and the regulation citation. There is no "Last regulatory update: 23 Apr 2026" header, no "3 families had DPP estimates revised this week", no list of changed cards. Source data has `fam.updated` (per-family ISO date) and `data.updated` (file-level) — neither is aggregated. There is no skeleton/diff between sessions stored in localStorage to surface "What's new since you last visited?"
- **Why it matters:** Regulatory-intelligence users come back weekly looking for change. Compliance.ai's killer feature is the change-feed. Thomson Reuters Regulatory Intelligence sells on alert-quality. Without a "last update" header and a "recently changed" surface, the tracker feels static — exactly the NANDO failure mode the redesign is meant to avoid.
- **Recommendation:** (1) Add a top-of-page banner: "Tracker updated {data.updated} — 3 families revised in the last 7 days · [Show changes]". (2) Cards updated in last 14 days get a subtle "Updated" pill near `fam.updated`. (3) localStorage-based "since-your-last-visit" diff (track `lastSeenISO` and surface families whose `fam.updated` > `lastSeenISO`). (4) Eventually: RSS/atom feed of changes for power users.
- **Reference:** Compliance.ai change-feed UX; Have-Your-Say "recent updates" sidebar.

---

### [HIGH] Mobile: nav search disappears with no replacement
- **Location:** `css/standard-search.css:148-155` (`@media max-width:768px { .std-search--nav { display: none; } }`); `css/tracker.css:1520` (`.tracker-nav__link { display: none; }` at <480px)
- **Rubric item:** Additional: mobile responsiveness
- **What:** At ≤768px viewport, the nav-bar search widget is hidden. At ≤480px, all `.tracker-nav__link` elements are hidden too. The CTA "Get the Report" remains. There is no hamburger menu, no mobile-search affordance, no condensed search-icon button. After the user enters a family detail (`openConvergenceView` at `js/tracker.js:401` hides the hero containing the only remaining search), the user has **no search reachable on mobile**.
- **Why it matters:** Compliance officers triage on the go. The "I just got an email about EN 197-1, let me look it up" use case dies on mobile after the first navigation. Comparator: NANDO's mobile UX is its single worst trait; the CPR tracker should beat it, not match it.
- **Recommendation:** (1) At ≤768px, render a search-icon button in the nav that expands to a full-width overlay search on tap (Apple HIG / Material search pattern). (2) Add a hamburger menu that exposes Tracker / About / Reports / Dashboard / Sources. (3) On detail view, keep the nav sticky (it currently is — `position: sticky; top: 0` at `tracker.css:226-228`) and ensure the search icon stays reachable.
- **Reference:** Apple HIG search bar; Material Design top-app-bar with search.

---

### [HIGH] Convergence detail view collapses on mobile but no jump-to-section anchor
- **Location:** `index.html:118-150` (convergence sections rendered sequentially: breadcrumb → header → DPP outlook → chart → expansion → content → standards → disclaimer); `css/convergence.css:1300-1349` (mobile breakpoints)
- **Rubric item:** Additional: progressive disclosure; searchable/scannable timeline with sticky header
- **What:** The convergence view stacks 7 vertical sections. On mobile (`@media max-width:700px`), each row collapses but there is no in-page nav, no sticky section anchor, no "Jump to: Standards · Timeline · Sources" tab strip. The "Print" + "× Back to grid" buttons in the header (`js/tracker.js:46-47`) stack below the title (`css/convergence.css:1342-1348`) — usable but not sticky. Estimated scroll length on mobile for a content-rich family (PCR with 9 standards, 4 content sections): ~12-15 viewport heights.
- **Why it matters:** Power users need to triage detail views fast. Searchable / scannable sticky-header timelines are the pattern in AI Act tracker, EUR-Lex's modern viewer, and the Have-Your-Say portal. 12 viewports of dump-scrolling is NANDO-flavoured. This isn't broken, but it's not differentiating.
- **Recommendation:** (1) Add a sticky in-page tab strip below the header: `Outlook · Timeline · Standards · Analysis · Sources`. (2) Each tab scrolls to + highlights its section. (3) On mobile, collapse the strip into a horizontal-scroll pill row that stays sticky beneath the nav.
- **Reference:** AI Act tracker sticky-section nav; EUR-Lex viewer.

---

### [HIGH] Comparison view is hidden behind a hover-only checkbox + max-3 ceiling
- **Location:** `js/comparison.js:10` (`MAX_COMPARE = 3`); `css/tracker.css:677-707` (compare checkbox `opacity: 0` until card hover); `js/comparison.js:131-153`
- **Rubric item:** Additional: navigation flow
- **What:** The compare-checkbox is invisible (`opacity: 0`) until card hover. On touch devices (no hover), the checkbox is **never visible** unless the card is in `.cpr-card--selected` state — which it isn't initially. So the comparison feature is effectively undiscoverable on mobile. Max-3 ceiling rules out 4-way side-by-side that would be useful for Annex II comparisons (e.g., compare all 4 cementitious families: PCR, CEM, AGG, RCP).
- **Why it matters:** Comparison is the second-highest value flow after detail view (compliance officers always compare two product families to argue trade-offs internally). Hiding it behind hover-only is an a11y + mobile fail. The 3-cap is arbitrary; the comparison table at `js/comparison.js:262-359` would happily render 4-5 columns.
- **Recommendation:** (1) Make compare-checkboxes visible by default (low-contrast outline, fill on hover/active). (2) Raise `MAX_COMPARE` to 4 (table fits four columns at 1200px width). (3) Add a "Compare {N}" persistent floating action button in the bottom-right corner mirror of the source-toggle. (4) On mobile, surface a "Select to compare" mode-toggle in the filter bar that swaps card-tap behaviour.
- **Reference:** Algolia comparison-tray pattern; Wirecutter "compare" sticky tray.

---

### [MEDIUM] Source-layer toggle injects badges but no markup emits `data-sources`
- **Location:** `js/source-layer.js:80` (`querySelectorAll('[data-sources]')`); `grep -rn data-sources` returns only this self-reference
- **Rubric item:** Additional: feature gap
- **What:** The source overlay finds elements via `[data-sources]` and parses inline `[S#]` references in the convergence detail's text containers (`js/source-layer.js:137-145`). The element-attribute path **never fires** because nothing in `tracker.js`, `content-renderer.js`, or `convergence-view.js` writes a `data-sources` attribute. Only the inline-text regex hits.
- **Why it matters:** The source-transparency feature is the strategic differentiator vs. NANDO ("you can see exactly which CEN doc backs every date"). Half of it is invisible. Users toggling source-mode see scattered `[S40]` badges in prose but no badges on the dates / certainty dots / pipeline labels — the *factual* claims that most need citation.
- **Recommendation:** (1) Emit `data-sources="S40,S41"` on key DOM elements: `cpr-card__hero-date`, `dpp-outlook__date`, `dpp-outlook__cert`, `cpr-card__action`, every node-detail label. (2) Source data lives in `families-v2.json` per-node (`node.sources`) and per-standard — wire it to the rendered HTML.
- **Reference:** Wikipedia citation-needed inline pattern; Have-Your-Say "evidence" hover.

---

### [MEDIUM] No URL-state for sort param vs. filters — split routing
- **Location:** `js/filters.js:259-286` (writeHashState merges hide/cert/sort); `js/tracker.js:125-132` (reads `family=` from same hash); `js/comparison.js:103-124` (reads `compare=` from same hash)
- **Rubric item:** #15 (URL-state-bookmarkable)
- **What:** All state competes for one fragment. `js/filters.js:262` explicitly bails out (`if (hash.indexOf('family=') !== -1) return;`) when a family is open — meaning **filter changes are not URL-persisted while a detail view is open**. So a power user who shares `#family=PCR&hide=CDE&sort=family` shares only `#family=PCR`.
- **Why it matters:** Bookmarkability is the rubric criterion (#15). Half the filter state is silently dropped on share. Comparator: Algolia's `instantsearch.js` URL-router merges all dimensions into one query string with a clean `&` separator and no collision.
- **Recommendation:** Migrate from `#hash` fragment to `?query` string. Schema in §4. Use `history.pushState` for navigation events (detail open/close) and `history.replaceState` for filter changes. Resolves the share-broken state issue and unlocks browser-back navigation through filter history.
- **Reference:** Algolia `instantsearch.js` URL-routing.

---

### [MEDIUM] Filter response time: synchronous good, but no debounce or transition
- **Location:** `js/filters.js:134-176` (event handlers fire `applyFilters` + `renderGrid` synchronously); `js/tracker.js:163-177` (renderGrid)
- **Rubric item:** #15 (<200ms response)
- **What:** Filter toggle → full grid re-render synchronously. On 37 cards this is fast (~10-20ms estimated, well under 200ms). But: (a) cards re-paint without any fade transition (jarring on rapid toggles), (b) no visual "filtering…" pulse for the brief moment, (c) `renderGrid` rebuilds the entire `innerHTML` rather than diffing.
- **Why it matters:** Meets the 200ms bar but feels less polished than expected by power users. Algolia's UX research calls for animated transitions on result-set changes to soften cognitive load when results shift quickly.
- **Recommendation:** (1) Wrap renderGrid in a `requestAnimationFrame` + add `opacity: 0.6 → 1` transition on `.cpr-grid` for ~120ms. (2) For more cards in future (if data grows beyond 50), introduce minimal diff (track removed-letters, fade them out before removing nodes).
- **Reference:** Algolia "smooth result transitions" pattern.

---

### [MEDIUM] Mobile compare-bar hides selected pills (`compare-bar__pills { display: none }`)
- **Location:** `css/tracker.css:1505` (`@media max-width:768px { .compare-bar__pills { display: none; } }`)
- **Rubric item:** Additional: mobile responsiveness
- **What:** On ≤768px, the floating compare-bar at the bottom of the screen shows `2/3 selected` count and the Compare button — but the pills showing *which* families are selected are hidden to save space.
- **Why it matters:** Compounds the comparison-discoverability problem. On mobile, the user knows "2 selected" but not which 2. Tap-to-deselect-from-pill flow is broken.
- **Recommendation:** Show pills on a second line of the compare-bar at ≤768px (allow bar to grow vertically). Keep the bar from covering content via `padding-bottom: 80px` on `<main>` when compare-bar is visible.
- **Reference:** Material Design bottom-app-bar guidance.

---

### [LOW] Hero icon mosaic is decorative-only but adds 37 image requests
- **Location:** `index.html:60` (`<div class="tracker-hero__icons" id="heroIcons" aria-hidden="true">`); `js/tracker.js:150-160` (populateHeroIcons writes 37 `<img>` tags)
- **Rubric item:** Additional: performance / discoverability
- **What:** 37 SVG icons load behind a 7%-opacity wash. `loading="lazy"` is set, but the hero is above the fold so they all fire immediately. They're aria-hidden, so screen readers ignore them — but they're not interactive either. Pure decoration.
- **Why it matters:** ~37 KB extra payload + 37 HTTP/2 streams for a visual that few users will register. Doesn't harm UX, but the same icons could be wired into a 37-tile *navigable* picker (click an icon → jump to that family's card) that would solve the "I know the icon shape, where's my family?" recognition path.
- **Recommendation:** Either (a) sprite-sheet the icons + paint as a single SVG, or (b) make them interactive — clickable jump-to-family icons that double as a discoverability aid.
- **Reference:** N/A — improvement suggestion.

---

### [LOW] Sort dropdown lacks visual differentiation from filter chips
- **Location:** `js/filters.js:106-115` (`<select class="cpr-filters__sort" id="filterSort">`)
- **Rubric item:** #15 / #12
- **What:** Sort is a native `<select>`, filters are buttons. No styling unifies them. With CSS missing entirely (see BLOCK #1), the contrast is currently academic, but the fix should preserve the distinction: sort is a single-choice axis, filters are multi-choice toggles.
- **Why it matters:** Visual grammar discipline. Power users learn quickly when the grammar is consistent.
- **Recommendation:** Style the sort `<select>` as a pill matching the filter chip height/radius but with a chevron icon to signal single-choice dropdown. Group it with a "Sort:" label distinct from "Filter:".
- **Reference:** Bricxlabs filter-vs-sort UI distinction.

---

### [LOW] No keyboard shortcut for "open search" or "back to grid"
- **Location:** `js/tracker.js:709-711` (only `Escape` to close convergence view); `js/standard-search.js:126-146` (search has Arrow/Enter/Escape only when input focused)
- **Rubric item:** Additional: power-user filtering
- **What:** No global `/` or `Cmd-K` to open search. No `g` for "back to grid". No `?` for shortcut help.
- **Why it matters:** Power users (regulatory officers triaging 5 standards in a row) live on keyboard shortcuts. NN/G accelerator-for-experts heuristic (#7).
- **Recommendation:** Add `/` or `s` → focus standard-search input; `Esc` → close detail (already done) or clear filters if grid; `g` → back to grid.
- **Reference:** Algolia DocSearch (`Cmd-K`); Linear / Notion keyboard accelerators.

---

### [NOTE] Year-clustered chronological layout absent — "DPP date (earliest first)" sort is the only chronological surface
- **Location:** `js/filters.js:46-51` (sort options); `js/tracker.js:99-101` (default sort)
- **Rubric item:** Additional: year-clustered chronological layout
- **What:** When the user picks the default sort, families render in date order, but there are no year separators or year-band sticky headers. AI Act tracker, Have-Your-Say, and the EU Commission's own "Have Your Say" portal use year-clustered headers (`==== 2027 ==== / card / card / ==== 2028 ==== / card`).
- **Why it matters:** Year-clustering aids the "what's coming up next" mental model. Without it, users mentally compute "2030, 2030, 2031, 2031, ..." themselves.
- **Recommendation:** When sort=`dpp`, insert sticky year-band separators in the grid (`<h3 class="cpr-grid__year-band">2027 (3 families)</h3>`). When sort=anything-else, suppress.
- **Reference:** AI Act tracker year-bands; Have-Your-Say timeline view.

---

## 3. Rubric scorecard

| Pattern | Score | Evidence | Anchor |
|---|---|---|---|
| #11 Real-time alert feedback (Nielsen #1) | **0** | No update banner, no "since last visit" diff, no change-feed; only static "37 families" meta | `js/tracker.js:123` |
| #12 Recognition over recall / active filters always visible (Nielsen #6) | **1** | Active state is inferable from chip-not-dimmed, but no chip summary / no result-count update | `js/filters.js:90-122` |
| #15 Faceted search & power-user filtering (URL-state, <200ms) | **1** | URL-state works for filter alone but breaks when family open; <200ms confirmed; only 2 facet dimensions vs. needed 6 | `js/filters.js:259-286`, `:11-18` |
| Multi-dimensional filtering | **0** | Only pipeline + certainty; no jurisdiction / Annex II / DPP year / binding-constraint / standard-type | `js/filters.js:11-18` |
| Year-clustered chronological layout | **0** | Date-sorted grid has no year separators | `js/filters.js:46-51` |
| Progressive disclosure (popover/drawer/page) | **2** | Convergence view is full-page replacement, node-click adds inline detail panel + expansion — well-tiered | `index.html:118-150`, `js/tracker.js:746-775` |
| Searchable/scannable timeline w/ sticky header | **0** | No in-page section nav, no sticky section anchors, 12+ viewports of mobile scroll | `index.html:118-150` |
| Navigation flow (grid→detail→compare→standard→reports) | **1** | Each individual hop works; URL-persistence partially broken; no breadcrumb in standard.html | `js/tracker.js:401-470`, `standard.html:34-50` |
| Discoverability (orphans: dashboard.html, system-dashboard.js) | **0** | Two strategic surfaces hidden from main nav | `index.html:40-56`; PLAN.md:132-136 |
| Mobile responsiveness | **1** | Card grid + convergence stack respond, BUT nav search disappears with no fallback, comparison-checkbox invisible on touch | `css/standard-search.css:148-155`, `css/tracker.css:677-707` |
| Search ergonomics (hero + nav search) | **1** | Autocomplete + ARIA + ID-priority sort = good; but nav search gone on mobile, no `Cmd-K`, hero search hidden once detail open | `js/standard-search.js`, `index.html:85-89` |

**Aggregate:** 11 facets, score 7/22 ≈ **32%**. Pre-redesign, this is fair: redesign target should aim for 18+/22 (>80%).

---

## 4. Faceted-filter spec for the redesign

### Dimensions

| Dimension | Type | Source field | Default state | Notes |
|---|---|---|---|---|
| **Pipeline** | multi-select chips | `active_pipelines[]` ∪ `future_pipelines[]` | all on | A/B/C/D/E, colour-keyed |
| **Certainty** | multi-select dots | `convergence.dpp_certainty` | all on | green→gray, 6 levels (drop `red` alias) |
| **DPP year band** | multi-select chips | `convergence.dpp_date` (extract year) | all on | 2027, 2028, 2029, 2030, 2031, 2032+, TBD |
| **Binding constraint** | multi-select chips | `convergence.binding_constraint` | all on | product / system / tie / unknown |
| **Annex II environmental indicators** | multi-select dropdown | `content.annex_ii_categories` (new field, needs population) | none = all | embodied carbon / recycled content / hazardous substances / etc. |
| **Standard type** | radio | derived from `standards[].type` | "all" | hEN-only / EAD-only / mixed / all |
| **Technical Committee** | searchable dropdown | `tc` | none = all | freeform; long tail collapsed |
| **Sort** | single-select | derived | `dpp` (date asc) | dpp / family / alpha / certainty / pipeline / updated-recent |

### Default state on first visit

All dimensions show all values. URL is bare. Result count: "37 of 37 families".

### URL-state schema (migrate from #hash to ?query)

```
?pipeline=A,B,C,D,E
&certainty=green,yellow-green,amber,orange,red-orange,gray
&year=2027,2028,2029,2030,2031,2032plus,tbd
&binding=product,system,tie,unknown
&annex2=embodied-carbon,recycled-content
&type=all
&tc=cen-tc-229
&sort=dpp
&family=PCR    # optional: detail-view layered on filter state
&compare=PCR,SMP,CEM   # optional: comparison layered on filter state
```

Default values omitted from URL (URL stays bare on default state). Use `history.replaceState` for filter toggles, `history.pushState` for nav (open/close detail or compare). Browser-back walks through nav history without losing filter context.

### <200ms response strategy

Already met for 37 rows synchronously. To hold the bar as data grows:

1. **In-memory index** — pre-compute on data load: `byPipeline`, `byCertainty`, `byYear`, `byBinding` lookup maps (each value → Set of letters).
2. **Set intersection on toggle** — instead of full filter, intersect the relevant maps; rebuild grid from result set.
3. **DOM diff** — track currently-rendered letters; only add/remove DOM nodes that changed. Use `<template>` cloning, not `innerHTML +=`.
4. **Animation** — fade-out removed cards (180ms), fade-in added cards (120ms). Skip animation when result-set delta > 50% (jarring otherwise).
5. **Debounce on text inputs** — 100ms debounce on TC search input.
6. **No network calls** — all filtering is local; data file is ~200KB, fits in memory.

Bench target: filter toggle → first-paint < 80ms; full transition complete < 250ms.

---

## 5. Top-3 strategic recommendations

### 1. Ship the missing filter chrome + 4 new facets (BLOCK #1 + BLOCK #2)
This unblocks the entire perception of the tracker as a real product. Without filter styles, any other improvement is invisible. Combined effort: 1-2 days CSS + 2-3 days facet wiring (and per-family `annex_ii_categories` data-population, ~half-day).

### 2. Re-activate `system-dashboard.js` above the card grid + add nav link to dashboard.html (BLOCK #3)
Shifts the convergence framing from product-only to true dual-timeline visibility. Sells the "intelligence platform" framing. The data and the JS are already written — this is mostly wiring + a 30-line CSS file. Combined effort: ½ day.

### 3. Mobile-search recovery + sticky in-page section nav for detail view (HIGH #4 + HIGH #5)
Closes the worst mobile UX gaps. Search-icon-with-overlay at ≤768px + sticky tab-strip in the convergence detail unlock the "I'm at a meeting and need to look this up" use case that's the strongest argument for the tracker over a PDF report. Combined effort: 1 day mobile search + ½ day section nav.

---

**Audit complete.** S3 specialist — Yvo Hunink / Regen Studio · 2026-04-28.
