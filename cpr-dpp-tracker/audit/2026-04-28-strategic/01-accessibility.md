# S1 — Accessibility audit: CPR DPP Tracker

**Auditor:** Specialist S1 (Accessibility — WCAG 2.2 AA + EN 301 549 v3.2.1 + W3C Graphics-AAM / SVG-AAM)
**Date:** 2026-04-28
**Scope:** Strategic. Drives post-NVTB redesign roadmap. Demo-blocker triage out of scope.
**Codebase pin:** last commit `7587455` (2026-04-23).

---

## 1 · Executive Summary

The tracker has the cosmetic surface of an accessible site — `lang="en"`, a skip-link on most pages, an `<main id="main-content">` landmark on `index.html`, `aria-pressed` on the source-toggle button, `aria-expanded` on FAQ disclosures, a polite `<a href="...">Back</a>` breadcrumb on the convergence view, and `aria-hidden` on decorative icons. Surface-level Lighthouse-style fixes have been applied (commits `24dd80a`, `48791de`, `f711d44`).

Underneath, the tracker fails the structural a11y bar that EN 301 549 — and post-EAA 2025 enforcement — actually demands. **The two highest-value interactions in the entire product are keyboard-inaccessible:** (a) the 37 product cards on the grid (the entry point) are `<div role="listitem">` with click handlers but no `tabindex`, no `role="button"`, no key handler — only a mouse user can open a family; and (b) the convergence chart explicitly **suppresses its own focus indicator** (`outline: none` on `:focus-visible` with no replacement style), which is a WCAG 2.4.7 BLOCK and an EAA-actionable failure on the very surface that defines the product redesign. There is **no `prefers-reduced-motion` rule anywhere** in the project's 130+ KB of CSS — every transition, every opacity-animated tooltip, every shimmer plays unconditionally for users who have explicitly asked the OS for less motion (WCAG 2.3.3). And **certainty is encoded purely by color on chart nodes** (no icon, no pattern, no legend), failing WCAG 1.4.1 *Use of Color* on the most semantically loaded surface in the chart.

**Top 3 strengths.** (1) Skip-link + landmarks on most main surfaces. (2) Disclosure widgets (FAQ + source-toggle) are correctly `aria-expanded` / `aria-pressed`. (3) Standards-search combobox has correct ArrowUp / ArrowDown / Enter / Escape keyboard model.

**Top 3 risks.** (1) Card grid is mouse-only — total keyboard exclusion of the primary navigation. (2) `outline: none` on convergence-chart nodes — focus is invisible; WCAG 2.4.7 + 2.4.11 fail. (3) Certainty palette is color-alone; no `prefers-reduced-motion`; tooltip / detail panels lack `role="dialog"` and don't move focus — assistive tech users are stranded.

---

## 2 · Findings

### [BLOCK] Card grid is keyboard-inaccessible — primary entry point excludes keyboard users
- **Location:** `js/tracker.js:208` (card markup) + `js/tracker.js:693-699` (click handler) + `index.html:112` (grid container)
- **Rubric item:** #3 (Keyboard navigation)
- **What:** Each of the 37 product family cards is rendered as `'<div class="cpr-card cpr-card--cert-' + cardCert + '" data-letter="' + esc(letter) + '" role="listitem">'`. The grid is `<div class="cpr-grid" id="trackerGrid" role="list" ...>`. The only interaction binding is `grid.addEventListener('click', ...)`. There is **no `tabindex`, no `role="button"`, no `aria-label` describing the action, no `keydown` handler, no `<a>` or `<button>` wrapping the card**. A keyboard-only user cannot open any family page; a screen-reader user is told "list with 37 items, each a list item" with no indication that the item is actionable.
- **Why it matters:** WCAG 2.1.1 *Keyboard* (Level A) — all functionality must be operable through a keyboard interface. Excluding keyboard from the **only path into the convergence chart** also fails EN 301 549 §11.2.1.1.1 (essentially identical wording) and is per-se EAA non-compliance under the harmonised standard. Voice-control users (Dragon, Voice Control) are also excluded — they cannot click "Cement" by voice if the click target carries no accessible name.
- **Recommendation:** Either wrap each card in `<a class="cpr-card-link" href="?family=${letter}">` (gives free focus, keyboard activation, accessible name, right-click "open in new tab"), or convert the `<div>` to `<button class="cpr-card" type="button" data-letter="..." aria-label="${name} — DPP estimate ${dppDate}, ${certainty}">`. The hash already drives `openConvergenceView` (`tracker.js:469`), so the `<a href>` route is the smaller diff and gives bonus deep-linking.
- **Reference:** WCAG 2.1.1 — https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html · EN 301 549 §11 — https://www.etsi.org/deliver/etsi_en/301500_301599/301549/

---

### [BLOCK] Focus indicator suppressed on convergence chart nodes
- **Location:** `css/convergence.css:245-249` (light) + `css/convergence.css:1169-1172` (dark)
- **Rubric item:** #2 (SVG focus-ring visibility — applies to focusable HTML chart nodes too)
- **What:** Light-mode rule:
  ```css
  .conv-chart__node:hover,
  .conv-chart__node:focus-visible {
    background: rgba(0,0,0,0.03);
    outline: none;
  }
  ```
  `outline: none` is set with **no replacement** focus indicator — no box-shadow, no border, no inverted background. The 3% black overlay is also applied on hover, so a keyboard user cannot distinguish "focused" from "hovered" or even "default" (3% of #fff vs. #fff is below the 3:1 contrast WCAG 2.4.13 minimum). Dark-mode rule is identically opacity-suppressed (`rgba(255,255,255,0.04)`).
- **Why it matters:** WCAG 2.4.7 *Focus Visible* (AA) — keyboard focus indicator must be visible. WCAG 2.4.11 *Focus Not Obscured (Minimum)* (AA, NEW in 2.2). WCAG 2.4.13 *Focus Appearance* (AAA but de-facto required by EAA-aligned monitoring bodies; minimum 2px outline + 3:1 contrast against unfocused state). The chart is the product's headline surface; suppressing focus there is a strategic redesign-blocker.
- **Recommendation:** Replace lines 246-249 with:
  ```css
  .conv-chart__node:focus-visible {
    outline: 2px solid var(--color-teal, #009BBB);
    outline-offset: 2px;
    border-radius: 8px;  /* match existing radius */
  }
  .conv-chart__node:hover { background: rgba(0,0,0,0.03); }
  ```
  Mirror in the dark-mode block at line 1170. The existing border-radius preserves the rounded look.
- **Reference:** WCAG 2.4.7 — https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html · WCAG 2.4.13 — https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html

---

### [BLOCK] Certainty encoded by color alone on chart nodes — no icon, pattern, label, or legend
- **Location:** `css/convergence.css:269-275` (per-cert dot colour mapping) + `js/convergence-view.js:495-497` (only **status** gets an icon, not **certainty**)
- **Rubric item:** #9 (Non-colour status signalling); shared with S5 on palette grading.
- **What:** Each chart node renders as `<div class="conv-chart__node--{cert}">` with the dot background set via `.conv-chart__node--green .conv-chart__node-dot { background: var(--cert-green); }`. The dot's icon (`STATUS_ICONS[status]`) encodes **status** (complete / in-progress / overdue / pending), but **not** certainty (green / yellow-green / amber / orange / red-orange / red / gray). Certainty is the harder-to-distinguish dimension (six saturated colours) and it has zero non-color signal. There is also no legend rendered anywhere on the convergence view explaining what `green` vs `amber` mean.
- **Why it matters:** WCAG 1.4.1 *Use of Color* (Level A) — color is not used as the only visual means of conveying information. ~8% of the male population has color-vision deficiency; deuteranopes will not reliably distinguish #f59e0b (amber) from #f97316 (orange) from #ef4444 (red-orange) — three of the seven palette steps collapse to a single hue. Even a normally-sighted user opening the chart for the first time has no way to tell which dot means "confirmed" vs "scheduled".
- **Recommendation:** (a) Use a glyph + color compound: ✓ for green/yellow-green ("known"), ◐ for amber/orange ("estimated"), ◯ for red-orange/red ("speculative"), ? for gray ("unknown"). (b) Add a persistent legend panel at the chart head with dot+icon+label triads (`CERTAINTY_LABELS` already exists at `convergence-view.js:26`). (c) Render the certainty label into the node's accessible name: `aria-label="${node.label} — ${dateLabel} — ${CERTAINTY_LABELS[cert]} (${STATUS_LABELS[status]})"`.
- **Reference:** WCAG 1.4.1 — https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html · WhoCanUse contrast tooling — https://www.whocanuse.com/

---

### [BLOCK] Zero `prefers-reduced-motion` support across the project
- **Location:** none — `grep -rEn "prefers-reduced-motion" cpr-dpp-tracker/` returns zero hits across CSS and JS
- **Rubric item:** #10
- **What:** The project ships ~25 CSS `transition:` rules (`tracker.css:233, 255, 267, 407, 456, 475, 692, 763, 968, 1046, 1069, 1111, 1250, 1302, 1327, 1456, 1539` etc.), an `animation: skeleton-shimmer 1.8s ease-in-out infinite` (line 652), opacity fades on the toast, scroll-triggered nav background, animated `transform: rotate(90deg)` on the expand caret (`convergence.css:341-343`), and convergence-view show/hide via display swap. None of these are gated on user motion preference.
- **Why it matters:** WCAG 2.3.3 *Animation from Interactions* (AAA, but enforced as part of EN 301 549 §7 functional-performance criteria for vestibular-disorder users). EN 301 549 §11.2.4.3 / §7.1.5 imply that motion-triggered content must respect user preference. Vestibular-disorder users get nausea; ADHD users get attention sinks; epilepsy-spectrum users get triggered by repeated parallax. The infinite skeleton-shimmer is the worst offender — it loops indefinitely without any motion-preference gate.
- **Recommendation:** Add a single global block at the top of `tracker.css` (and `convergence.css`):
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  And explicitly stop the skeleton shimmer (`tracker.css:652`) under reduced-motion.
- **Reference:** WCAG 2.3.3 — https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html · MDN reduced-motion pattern — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

---

### [HIGH] Filter buttons lack `aria-pressed` toggle state
- **Location:** `js/filters.js:83` (pipeline buttons), `js/filters.js:98` (certainty buttons), `js/filters.js:139, 150` (state class toggle, no ARIA mirror)
- **Rubric item:** #4 (ARIA labelling)
- **What:** The pipeline filter buttons (`<button class="cpr-filters__pipe-btn cpr-filters__pipe-btn--active" data-pipe="A">`) and certainty filter buttons (`<button class="cpr-filters__cert-btn cpr-filters__cert-btn--active" data-cert="green">`) are visually toggled via class change but never set `aria-pressed`. The certainty button is even worse: it contains only `<span class="cpr-filters__cert-dot cpr-filters__cert-dot--green"></span>` — an empty colored dot with no text content and no `aria-label`. Screen reader output: "button". That's it.
- **Why it matters:** WCAG 4.1.2 *Name, Role, Value* (Level A). A toggle button without `aria-pressed` reads as a one-shot button; users have no way to know whether a filter is currently on or off. The certainty button reads as a button with no name — wholly unidentifiable.
- **Recommendation:** In `filters.js:83`, add `aria-pressed="true"` initially (matches the `--active` class) and `aria-label="${PIPELINE_LABELS[p]} (${pipeCounts[p]} families)"`. In line 98, add `aria-pressed="true"` and `aria-label="Filter by ${CERTAINTY_LABELS[c]} certainty"`. In the click handler (lines 139, 150), mirror class toggle with `btn.setAttribute('aria-pressed', state.pipelines[p] ? 'true' : 'false')`. Mirror in `syncUIToState` (line 327, 331).
- **Reference:** ARIA APG button pattern — https://www.w3.org/WAI/ARIA/apg/patterns/button/ · WCAG 4.1.2 — https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html

---

### [HIGH] Convergence detail panel + expansion panel are not dialogs and do not move focus
- **Location:** `js/node-detail.js:32-197` (open + position) + `js/node-expansion.js:222-720` (multiple expansion-panel renderers)
- **Rubric item:** #3 (no traps), #4 (ARIA roles)
- **What:** Clicking a chart node opens an inline detail panel positioned absolutely below the node, with a close button (`aria-label="Close detail"`). Focus stays on the node. The panel is `<div class="node-detail">` — no `role="dialog"`, no `aria-modal`, no `aria-labelledby` pointing at its title, no programmatic focus moved to it. The same pattern repeats across all eight expansion-panel renderers in `node-expansion.js`. Closing the convergence view (`tracker.js:459`) does not return focus to the originating card either.
- **Why it matters:** WCAG 2.4.3 *Focus Order* (Level A); ARIA APG dialog pattern. A screen-reader user clicks a node, hears nothing (no announcement), tab continues from the node into the rest of the chart — they may never discover the panel exists. Without `role="dialog"`, the close button is also not announced as a dialog control.
- **Recommendation:** Either (a) treat as inline-disclosure: add `aria-controls` on the node pointing at the panel ID + render the panel in DOM order immediately after the node, so tab order naturally lands inside; or (b) treat as dialog: wrap with `<div role="dialog" aria-modal="false" aria-labelledby="node-detail-title">`, programmatically `panel.querySelector('.node-detail__close').focus()` on open, and on close `targetEl.focus()`. Same for the close path on the convergence view itself: `closeConvergenceView` at `tracker.js:459` should remember the originating card and refocus it.
- **Reference:** APG dialog pattern — https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ · APG disclosure — https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/

---

### [HIGH] No tree-view or table fallback for AT users — chart is the only access path
- **Location:** `js/convergence-view.js:339-547` (`renderConvergenceChart` — only render path)
- **Rubric item:** #5 (Tree-view or table fallback)
- **What:** The convergence view renders the timeline as positioned `<div>`s inside CSS columns. The only nodes a screen reader can perceive are the same DOM elements the visual user sees, with no semantic grouping by pipeline/column (each column is `<div class="conv-chart__col">` with no `role`, no `aria-label`), no row-by-pipeline structure, no temporal grouping. There is no parallel `role="tree"` (W3C WAI-APG `tree` pattern) or `role="table"` rendering of the same data for non-visual consumption.
- **Why it matters:** WCAG 1.3.1 *Info and Relationships* (Level A) — relationships conveyed visually (column = pipeline, vertical position = year) must be programmatically determinable. A chart that is only spatially-positioned is unreadable to AT users; they hear a flat list of fragments without knowing which fragment belongs to which pipeline or year. The W3C Graphics-AAM spec calls for a parallel structured representation precisely for this case.
- **Recommendation:** Render an `aria-hidden` chart for sighted users and a parallel `<table>` (or `role="tree"` with branches per pipeline + year leaves) inside an `aria-live="polite"` region for AT — or just build the table as the only DOM and let CSS position table cells absolutely (see Tufte-table redesign owned by S2). Either way, the timeline must be navigable by row and column with arrow keys, with column = pipeline, row = year, cell = node.
- **Reference:** WAI-APG tree pattern — https://www.w3.org/WAI/ARIA/apg/patterns/treeview/ · WAI-APG table pattern — https://www.w3.org/WAI/ARIA/apg/patterns/table/

---

### [HIGH] No arrow-key swimlane traversal in the convergence chart
- **Location:** `js/tracker.js:777-784` (only `Enter` and `Space` handled on chart) + `js/system-dashboard.js:156-162` (same on system dashboard)
- **Rubric item:** #3 (arrow-key swimlane traversal)
- **What:** The chart's keyboard model is "tab through every focusable node sequentially". With ~30+ nodes across 4-5 columns, tabbing is linear left-to-right within a single tab stop position; there is no Up/Down to traverse within a pipeline (column) or Left/Right to jump between pipelines at the same date. The only key handlers (`tracker.js:778-784`) accept `Enter` / `Space` only.
- **Why it matters:** WAI-APG composite-widget pattern. Tab is for *moving between* widgets; arrow-keys are for *navigating within* a widget. A 30-node swimlane chart should be ONE tab stop, with arrow-keys for in-widget navigation. Linear tab is technically operable (so not a BLOCK on its own) but it makes the chart unusable in practice — WCAG 2.4.3 *Focus Order* and 2.5.5 *Target Size (Enhanced)* implications.
- **Recommendation:** Implement roving tabindex per WAI-APG: only the active node is `tabindex="0"`, all others `tabindex="-1"`. ArrowUp/ArrowDown move within column; ArrowLeft/ArrowRight move to nearest node in adjacent column at the same year; Home/End jump to first/last in column. This pairs naturally with the tree/table fallback (#5) above.
- **Reference:** APG roving tabindex — https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex · APG grid pattern — https://www.w3.org/WAI/ARIA/apg/patterns/grid/

---

### [HIGH] Source-citation tooltips lack `role="tooltip"` and aria-describedby wiring
- **Location:** `js/source-layer.js:91-93` (badge) + `js/source-layer.js:199-254` (tooltip render)
- **Rubric item:** #4 (ARIA labelling)
- **What:** The source-badge is created with `tabindex="0"`, `role="button"`, `aria-label="${n} sources"` — fine on the trigger. But the tooltip element (`tooltipEl` created at `source-layer.js:30`) is appended to `<body>` with class `src-tooltip` and never gets `role="tooltip"`. The badge has no `aria-describedby` pointing at the tooltip ID. When the badge is activated, the tooltip body (containing source title, status, URL) is invisible to screen readers — they only get "${n} sources" with no detail.
- **Why it matters:** WCAG 1.3.1 + 4.1.2. The whole point of the source layer is verifiability; making the verifiable evidence inaccessible to AT users is a credibility failure on a regulatory-intelligence product whose value proposition is "every claim is sourced".
- **Recommendation:** At `source-layer.js:30`, add `tooltipEl.setAttribute('role', 'tooltip'); tooltipEl.id = 'src-tooltip';`. At `source-layer.js:114-117` (badge click) and at `source-layer.js:120-125` (badge keydown), call `badge.setAttribute('aria-describedby', 'src-tooltip')` after `showTooltip` and remove the attribute on `hideTooltip`. Better: clone tooltip content into the badge's accessible description region rather than relying on `aria-describedby` of a positioned-absolutely body-child (some screen readers struggle with detached descriptors).
- **Reference:** APG tooltip pattern — https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/

---

### [MEDIUM] Standards-search combobox lacks ARIA combobox pattern wiring
- **Location:** `js/standard-search.js:62-185`
- **Rubric item:** #4 (ARIA labelling)
- **What:** The standards-search input correctly handles ArrowUp / ArrowDown / Enter / Escape (lines 126-146) — keyboard model is good. But the input is a plain `<input type="text">`. Missing: `role="combobox"`, `aria-expanded`, `aria-controls` pointing at the dropdown, `aria-autocomplete="list"`, `aria-activedescendant` pointing at the visually-selected `<a>` item. The dropdown div has no `role="listbox"`, items no `role="option"`. Screen-reader users cannot be told that arrow-keys cycle results.
- **Why it matters:** WCAG 4.1.2; ARIA APG combobox pattern. Good keyboard model, no semantic mapping — half the work done. AT users either get nothing (silent dropdown) or get the autocomplete confused with a generic search input.
- **Recommendation:** Update `index.html:48` and `index.html:87` to set `role="combobox" aria-expanded="false" aria-controls="std-search-dropdown" aria-autocomplete="list"` on the input; give the dropdown `role="listbox" id="std-search-dropdown"`; render items as `role="option" id="std-search-item-${i}"`. In `standard-search.js:105-114` (`setActive`), set `input.setAttribute('aria-activedescendant', items[idx].id)`. On focus/blur, toggle `aria-expanded`.
- **Reference:** APG combobox (autocomplete-list) — https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

---

### [MEDIUM] Convergence chart node target size below WCAG 2.5.8 minimum at default scale
- **Location:** `css/convergence.css:254-256` (dot is 20×20 px) + `css/convergence.css:231-243` (node padding 3×4 px)
- **Rubric item:** #6 (Target size 24×24 px + 8 px spacing)
- **What:** The node's clickable area is the entire `.conv-chart__node` (not just the dot), but the dot itself is 20×20 px and node spacing is enforced at `MIN_NODE_SPACING = 34` (`convergence-view.js:13`). The node's pointer-events area is anchored top-aligned with `transform: translateY(-50%)`, padding 3px / 4px. Effective tap target: ≈ 26 px tall × column-width wide — passes for tall columns but fails on the 480 px breakpoint where the node-dot shrinks to 18px (`convergence.css:1308-1309`).
- **Why it matters:** WCAG 2.5.8 *Target Size (Minimum)* (AA, NEW in 2.2) — clickable targets should be ≥ 24×24 CSS px unless an exception applies (inline, user-agent, essential). On mobile, the chart fails this; on desktop it just-passes if you count the row not the dot.
- **Recommendation:** Set a `min-height: 24px` floor on `.conv-chart__node` and bump the `MIN_NODE_SPACING` constant to 38 (or 44 to align with old WCAG 2.5.5 enhanced guidance). At the 480 px breakpoint, increase node-dot to 22 px.
- **Reference:** WCAG 2.5.8 — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

---

### [MEDIUM] No drag/pan-zoom alternative exists, but also: no drag in the chart — capture as design constraint
- **Location:** `js/convergence-view.js` (no pan/zoom code), `js/tracker.js` (no drag handlers)
- **Rubric item:** #7 (Drag alternative for pan/zoom)
- **What:** Currently the chart is a fixed-height vertical scroll only — no drag-to-pan, no pinch-zoom, no horizontal swipe. So there is technically no drag operation that requires an alternative under WCAG 2.5.7. **However**, the post-NVTB redesign brief talks about a "graph view" — if that view introduces drag-to-pan, the alternative requirement crystallises. Capturing this proactively.
- **Why it matters:** WCAG 2.5.7 *Dragging Movements* (AA, NEW in 2.2) — any single-pointer drag must have a single-tap or button alternative. If the redesign adopts a true graph (D3 force-directed, or SVG zoom/pan), this requirement applies on day one.
- **Recommendation:** For the post-NVTB redesign, decide drag-vs-button at scope time. If pan-zoom is in: implement +/- buttons and arrow-key panning alongside drag, never as drag-only.
- **Reference:** WCAG 2.5.7 — https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html

---

### [MEDIUM] Card grid gets `role="list"` + `role="listitem"` but a CSS `display:flex` / `display:grid` parent silently strips list semantics in Safari
- **Location:** `index.html:112` + `css/tracker.css` `.cpr-grid` (CSS grid container)
- **Rubric item:** #4 (ARIA labelling)
- **What:** Safari's accessibility tree silently removes implicit list semantics from `<ul>` / `<ol>` whose `list-style-type` is `none` (a long-standing intentional quirk). Explicit `role="list"` is the documented workaround — and you've used it. But the grid's children are `role="listitem"` on `<div>`s with no inherent list role; this combination works in NVDA/JAWS, mostly works in VoiceOver/Safari, and fails in some braille displays. More robust: render as `<ul role="list">` / `<li role="listitem">` so semantics land in BOTH the implicit DOM and the explicit ARIA layer.
- **Why it matters:** WCAG 1.3.1; minor cross-AT robustness.
- **Recommendation:** Convert `<div class="cpr-grid">` to `<ul class="cpr-grid" role="list">` and each card div to `<li>`. Combine with the BLOCK fix above (cards become `<a>` or `<button>` inside `<li>`).
- **Reference:** WebAIM list semantics — https://webaim.org/techniques/lists/ · CSS-Tricks Safari list quirk — https://css-tricks.com/list-style-type-none-removes-list-semantics/

---

### [LOW] `landing.html` has no skip-link
- **Location:** `landing.html:61-75` (body opens directly into nav)
- **Rubric item:** additional finding
- **What:** Every other surface (`index.html`, `standard.html`, `reports.html`, `dashboard.html`, `invoice.html`, `report-success.html`) carries `<a class="skip-link" href="#main-content">Skip to main content</a>` immediately after `<body>`. `landing.html` and `gate.html` do not, and `landing.html` also lacks an `id="main-content"` target on its first `<section>`.
- **Why it matters:** WCAG 2.4.1 *Bypass Blocks* (Level A). Inconsistency means a keyboard user landing on the marketing page must tab through the nav 4 times before reaching content.
- **Recommendation:** Add the skip-link to `landing.html:61` and `gate.html:27`, and an `id="main-content"` on `landing.html:79` (the `<section class="land-hero">`).
- **Reference:** WCAG 2.4.1 — https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html

---

### [LOW] Decorative inline SVGs in chrome lack `aria-hidden="true"`
- **Location:** `index.html:47, 68, 74, 80, 86, 135, 154` + `landing.html:100, 107, 114` + similar across `standard.html`, `reports.html`
- **Rubric item:** #4 (decorative-vs-informative split)
- **What:** Multiple decorative inline `<svg>` icons (search icon, file icon, clock icon, print icon, sources-icon) render without `aria-hidden="true"`, `role="presentation"`, or `<title>`. They are exposed to AT as graphics with no accessible name → screen readers may announce "graphic" or skip silently depending on browser/AT pair. The accompanying text label ("70+ Standards", "Print", "Sources") is sufficient on its own.
- **Why it matters:** WCAG 1.1.1 *Non-text Content* (Level A) — decorative content should be marked so AT can ignore it. Currently low-impact (most modern AT skip nameless inline SVGs anyway), but inconsistent with the explicit `aria-hidden="true"` already applied to the hero icons div (`index.html:60`).
- **Recommendation:** Add `aria-hidden="true" focusable="false"` to every decorative inline `<svg>`. Reserve `<title>`/`role="img"` for SVGs that ARE the only signal (none today).
- **Reference:** SVG-AAM 1.0 — https://www.w3.org/TR/svg-aam-1.0/ · WAI Tutorial decorative — https://www.w3.org/WAI/tutorials/images/decorative/

---

### [LOW] Disclaimer banner uses `<div>` not `role="region"` / `role="note"`
- **Location:** `index.html:95-97`
- **Rubric item:** additional finding
- **What:** The "IMPORTANT INFORMATION" disclaimer banner (which legitimately matters for a regulatory tool) is a plain `<div class="tracker-disclaimer">`. Screen readers won't flag it as a discoverable landmark or note.
- **Why it matters:** WCAG 1.3.1; soft. AT users tabbing through the page may miss the disclaimer entirely.
- **Recommendation:** `<div class="tracker-disclaimer" role="note" aria-label="Important disclaimer">`. Or, if the disclaimer is genuinely critical at first paint, `role="status"` with `aria-live="polite"` once on load.
- **Reference:** WAI-ARIA `note` role — https://www.w3.org/TR/wai-aria-1.2/#note

---

### [NOTE] System-dashboard nodes are tabbable + Enter/Space activates — pattern is correct
- **Location:** `js/system-dashboard.js:63` (`tabindex="0"` on each node) + `js/system-dashboard.js:156-162` (Enter/Space handler)
- **Rubric item:** #3
- **What:** The system-dashboard (separate surface) actually does it right: each node is `tabindex="0"`, has Enter/Space → click forwarding. The convergence chart node-element follows the same pattern at `convergence-view.js:525` (`tabindex="0"`) and `tracker.js:778-784` (Enter/Space handler). So the **chart node** is keyboard-reachable; only the **card grid entry-point** is not. This narrows the BLOCK above to the grid specifically. Worth preserving in the redesign — don't regress.
- **Why it matters:** Establishes that the team CAN do keyboard handling correctly when it's on the radar; the gap is in the entry surface, not in the chart-node code.
- **Reference:** APG keyboard interface — https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/

---

## 3 · Rubric Scorecard

| # | Pattern | Score | Evidence (one-line) | Anchor finding |
|---|---|---|---|---|
| 2 | SVG focus-ring visibility (≥2px outline, 3:1 contrast) | **0** (absent) | `outline: none` on `:focus-visible` with no replacement, both light + dark modes | BLOCK — Focus indicator suppressed |
| 3 | Keyboard navigation (arrow-key swimlane, skip-to, no traps) | **1** (partial) | Skip-link + Enter/Space on chart nodes work; **cards have no keyboard path**, no arrow-key swimlane traversal, no roving tabindex | BLOCK — Card grid keyboard-inaccessible · HIGH — No arrow-key swimlane |
| 4 | ARIA labelling for nodes & edges | **1** (partial) | Buttons have aria-label; FAQ + source-toggle correct; **filter buttons missing aria-pressed; tooltip missing role; combobox pattern incomplete; chart nodes carry no name beyond visual text** | HIGH — Filter aria-pressed · HIGH — Tooltip role · MEDIUM — Combobox |
| 5 | Tree-view or table fallback for AT users | **0** (absent) | Single positioned-div render path; no parallel `role="tree"` or `role="table"` representation | HIGH — No tree/table fallback |
| 6 | Target size compliance (≥24×24 CSS px + 8 px spacing) | **1** (partial) | Node row ≈ 26 px tall on desktop; mobile breakpoint shrinks dot to 18 px | MEDIUM — Target size |
| 7 | Drag alternative for pan/zoom | **2** (full, vacuous) | No drag/pan/zoom currently exists, so no alternative needed; flag for redesign scope | MEDIUM — Capture for redesign |
| 8 | Color-blind-safe status palette (#0d9488 / #3b82f6 / #f59e0b / #f97316 / #94a3b8) | **1** (partial — shared with S5) | Card-tier 5-step palette is CVD-discriminable (teal vs blue vs amber vs orange vs gray); chart-tier 7-step palette compresses three reds (#f59e0b / #f97316 / #ef4444) into one hue for deuteranopes | shared with S5 |
| 9 | Non-colour status signalling (icon + text + pattern, not colour alone) | **0** (absent for certainty) | STATUS_ICONS exist, but **certainty** is color-only on chart dots; no legend rendered anywhere | BLOCK — Certainty color-alone |
| 10 | `prefers-reduced-motion` support | **0** (absent) | Zero matches across all CSS/JS; infinite skeleton-shimmer loops unconditionally | BLOCK — No reduced-motion |

**Aggregate**: 6/18. The two `2` scores (#7 vacuous; not actually achieved) are essentially courtesy passes. Effective score: **5/16 on the bound items**.

---

## 4 · Top-3 Strategic Recommendations for Post-NVTB Redesign

**1. Adopt a "table-first, chart-second" rendering model.** Build the convergence view as a `<table role="grid">` whose cells are absolutely positioned — visual users see the chart, AT users navigate the structured table with arrow-keys for free. This single architectural choice resolves rubric items #3 (arrow-key swimlane), #4 (semantic relationships), #5 (tree/table fallback), and a chunk of #6 (target size). It also pairs cleanly with S2's Tufte-density brief: a true table is the densest possible layout for time-series-by-pipeline data. Pattern: WAI-APG `grid` (not the layout grid) at https://www.w3.org/WAI/ARIA/apg/patterns/grid/.

**2. Establish a non-color-only status visual vocabulary at design-system level — not chart level.** The certainty palette being color-only is a symptom; the cause is no design-system rule that says "every status indicator carries an icon AND a label". Codify a 7-glyph set (one per certainty level) in `assets/design-system/status-icons.svg`, and write into the design-system docs that any status indicator (card cert dot, chart node, gantt bar, expansion-card stage indicator) must use icon + text + colour, never just colour. This kills rubric #9 permanently across the product. While at it, ship a persistent legend panel — the regulatory-intelligence value-prop is undermined when first-time users have no key to interpret the colour grades.

**3. Make EAA-compliance a redesign blocker, not a punch-list.** EN 301 549 v3.2.1 is the harmonised standard for the European Accessibility Act, in force June 2025. Public-sector buyers (NWO, RVO, EFRO) and any large EU corporate increasingly require an Accessibility Conformance Report (ACR / VPAT). The current tracker would not pass an ACR for WCAG 2.4.7 (focus visible), 2.1.1 (keyboard), 1.4.1 (use of colour), 2.3.3 (motion). Fix these in the redesign at *design-token* level, with a CI check that fails the build on `outline: none` without `outline:` replacement, on missing `prefers-reduced-motion` blocks, and on `<div>` event handlers without `role` + `tabindex`. Pair with axe-core in the GitHub-Pages preview. The Lighthouse-driven fix-list (commits `24dd80a`, `48791de`, `f711d44`) is shallow surface work; depth requires lifting a11y to design-system tier so it cannot regress per-page.
