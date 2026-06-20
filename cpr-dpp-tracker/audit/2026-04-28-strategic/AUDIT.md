# CPR DPP Tracker — Strategic UI Audit (synthesis)

**Date:** 2026-04-28
**Codebase pin:** last commit `7587455` on 2026-04-23
**Live:** https://demos.regenstudio.world/cpr-dpp-tracker/
**Scope:** Strategic. Drives post-NVTB redesign roadmap. Demo-blocker triage was deliberately out of scope per user decision.
**Specialist reports:** [01-accessibility](01-accessibility.md) · [02-graph-and-density](02-graph-and-density.md) · [03-information-architecture](03-information-architecture.md) · [04-admin-workflow](04-admin-workflow.md) · [05-regulatory-and-brand](05-regulatory-and-brand.md)

---

## Executive summary

The tracker is a **genuinely original product surface sitting on three structural weaknesses that all trace back to the 2026-04-23 Sprint 3 parking**. Substance is strong: the convergence formula `max(Art.5(8)+12mo, Art.75(1)DA+18mo)`, the 5-pipeline model, the 37-family content schema (98% complete, 291/296 cells), and the dual-axis review-queue verification flow are genuinely better than anything in the public NANDO / Catena-X / Madaster stack. Regulatory terminology is correct and conservative. Self-hosted typography is brand-clean.

**The three structural weaknesses:**

1. **Sprint 3 parking left three orphans.** `js/system-dashboard.js` (224 LOC) was built but never mounted in `index.html`; `dashboard.html` (590 LOC) is unlinked from the main nav; the filter bar markup ships without CSS because `css/dashboard.css` was deleted on 2026-04-23. The Shneiderman *overview* layer of the entire product is, in production, missing — the user lands on a card grid and never sees the cross-cutting EU System Timeline that is half of the convergence formula. This is the single largest strategic UX gap.

2. **Accessibility is cosmetic-pass / structural-fail.** Lighthouse-driven commits (`24dd80a`, `48791de`, `f711d44`) added skip-links, alt text, and contrast. Underneath: the 37 product cards (the only entry point) are mouse-only `<div role="listitem">` with no `tabindex` or `keydown`; the convergence chart explicitly suppresses its own focus indicator (`outline: none` with no replacement, both light + dark modes); certainty is encoded by colour alone with no icon, pattern, or legend; `prefers-reduced-motion` is unimplemented across the project's entire 130 KB of CSS. Effective WCAG 2.2 AA / EN 301 549 score on the 9 bound a11y rubric items: **5/16**. EAA enforcement (June 2025) makes this an Accessibility Conformance Report risk, not just a punch-list.

3. **Trust gradient exists privately but is invisible publicly.** The review-queue's two-axis verification (source reliable × claim attributed) is a genuine OneTrust-class differentiator; verification metadata is stamped into `_verification` on standards and `_content_verifications` on families. But the metadata never propagates to the public tracker — agent-vs-human-verified claims render identically. Source registry is 74% orphan (67 of 90 sources never referenced) and 30% (27 of 90) carry empty URLs, including the JTC24 prENs that anchor the System Timeline narrative. The product's "regulatory intelligence" framing depends on visible provenance; today it's load-bearing for the operator and invisible to the audience.

**Verdict.** Keep the hand-rolled convergence engine, restore the parked Sprint 3, lift accessibility to design-system tier, and propagate verification metadata into the public surface. Do **not** port to dagre / ELKjs / React Flow — would destroy the time-axis property of the chart and violate the no-build-step constraint codified in `regenstudio-demos/CLAUDE.md`.

---

## Aggregate severity counts

| Severity | S1 a11y | S2 graph | S3 IA | S4 admin | S5 reg+brand | **Total** |
|---|---:|---:|---:|---:|---:|---:|
| **BLOCK** | 4 | 3 | 3 | 2 | 3 | **15** |
| **HIGH** | 5 | 3 | 5 | 5 | 4 | **22** |
| **MEDIUM** | 4 | 2 | 4 | 6 | 4 | **20** |
| **LOW** | 3 | 0 | 3 | 3 | 2 | **11** |
| **NOTE** | 1 | 0 | 1 | 2 | 2 | **6** |
| **Total** | 17 | 8 | 16 | 18 | 15 | **74** |

Rubric-scorecard summary in `rubric-scorecard.md`.

---

## Prioritised backlog — drop-in for `cpr-bug-ui-fix-pass`

Each row is a candidate `items[]` entry for `6-projects/cpr-dpp-tracker/backlog.md`. Cluster IDs reference recurring themes — fix the cluster, not the symptom.

### Cluster A · Sprint 3 resumption (one work-item, three BLOCKs collapsed)

| ID | Severity | Title | Location | Specialist | Effort |
|---|---|---|---|---|---|
| A.1 | BLOCK | Wire `js/system-dashboard.js` into `index.html` between hero and filter bar | `index.html` (no `#sysDashSection`); `js/comparison.js:167,247` already ghost-references it | S2, S3 | 2h |
| A.2 | BLOCK | Restore filter-bar CSS (recreate `css/filters.css` or fold into `tracker.css`) | `js/filters.js:77` injects `.cpr-filters*` markup; zero matching CSS rules | S3 | 90min |
| A.3 | BLOCK | Add `<a href="dashboard.html">Data integrity</a>` to nav across `index.html`, `landing.html`, `standard.html` | nav blocks have no inbound link to dashboard | S3, S4 | 30min |

### Cluster B · Accessibility design-system tier (a11y becomes a redesign-gate, not a punch-list)

| ID | Severity | Title | Location | Specialist | Effort |
|---|---|---|---|---|---|
| B.1 | BLOCK | Card grid keyboard-inaccessible — wrap each card as `<a href="?family=${letter}">` or `<button>` | `js/tracker.js:208,693`; `index.html:112` | S1 | 2h |
| B.2 | BLOCK | Focus indicator suppressed on chart nodes — replace `outline:none` with 2px teal outline + offset (light + dark) | `css/convergence.css:245-249, 1169-1172` | S1 | 30min |
| B.3 | BLOCK | Certainty colour-only — pair every dot with glyph + add persistent legend; certainty into accessible name | `js/convergence-view.js:495-497`; `css/convergence.css:269-275` | S1, S5 | 4h |
| B.4 | BLOCK | Add global `prefers-reduced-motion` block + explicit skeleton-shimmer stop | top of `css/tracker.css` + `css/convergence.css`; `tracker.css:652` | S1 | 30min |
| B.5 | HIGH | Filter buttons missing `aria-pressed` + cert button has empty colored span as accessible name | `js/filters.js:83,98,139,150,327,331` | S1 | 1h |
| B.6 | HIGH | Detail/expansion panels open without `role="dialog"` or focus management | `js/node-detail.js:32-197`; `js/node-expansion.js:222-720`; `js/tracker.js:459` | S1 | half-day |
| B.7 | HIGH | No tree-view / table fallback for AT users on convergence chart | `js/convergence-view.js:339-547` | S1 | 1-2 days |
| B.8 | HIGH | No arrow-key swimlane traversal — implement roving tabindex per WAI-APG | `js/tracker.js:777-784` | S1 | half-day |
| B.9 | HIGH | Source-citation tooltips lack `role="tooltip"` + `aria-describedby` | `js/source-layer.js:30,114-125` | S1 | 1h |

### Cluster C · Brand & palette integrity (3 sub-day BLOCKs ship today; deeper work post-NVTB)

| ID | Severity | Title | Location | Specialist | Effort |
|---|---|---|---|---|---|
| C.1 | BLOCK | Orange certainty class never matches CSS — sed `cert-dot--color-orange` → `cert-dot--orange` (~41 elements unstyled) | `css/tracker.css:569,875,933,1189`, `css/convergence.css:272,360,415,565,702`, `css/admin.css:347,448` | S5 | 30min |
| C.2 | BLOCK | `--cert-red-orange` and `--cert-red` are identical `#ef4444` — 2 of 7 cert levels visually merged | `css/tracker.css:48-49` | S5 | 10min (assign brand red `#E71846`) |
| C.3 | BLOCK | Brand-token drift on emerald — `#008545` (design-tokens.js + tracker.css local) vs `#00914B` (regenstudio-demos shared CSS + 77 SVG icons) | `~/Claude/design-lab/design-tokens.js:23` vs `regenstudio-demos/CLAUDE.md` vs `Images/*.svg` | S5 | requires cross-portfolio token decision; see Roadmap Phase 3 |
| C.4 | HIGH | Brand palette absent from tracker proper — only reports.css uses brand; tracker chrome is Tailwind defaults | `css/tracker.css` (7 brand hits) vs `css/reports.css` (8 incl. only magenta) | S5 | post-NVTB Phase 3 |
| C.5 | HIGH | Color-blind discriminability — amber / orange / red-orange / red collapse for deutans (~6% of audience) | `css/tracker.css:43-50` deutan projection | S5, S1 | post-NVTB Phase 3 (palette redesign) |

### Cluster D · Information architecture & power-user filtering

| ID | Severity | Title | Location | Specialist | Effort |
|---|---|---|---|---|---|
| D.1 | BLOCK | Faceting dimensionality sub-NANDO (2 facets vs needed 6+) — add DPP year / binding-constraint / Annex II / standard-type | `js/filters.js:11-18` | S3 | 2-3 days |
| D.2 | HIGH | No active-filters chip-list (Nielsen #6) + result-count meta doesn't update post-filter | `js/filters.js:90-122`; `js/tracker.js:123` | S3 | 2h |
| D.3 | HIGH | No real-time alert / "what changed" feed (Nielsen #1) | `index.html:90`; `js/tracker.js:123` | S3 | 1 day |
| D.4 | HIGH | Mobile: nav search disappears at ≤768px with no hamburger/icon fallback; comparison-checkbox `opacity:0` until hover (undiscoverable on touch) | `css/standard-search.css:148-155`; `css/tracker.css:677-707, 1505, 1520` | S3 | 1 day |
| D.5 | HIGH | Convergence detail collapses on mobile but lacks sticky in-page section nav (12+ viewports of scroll) | `index.html:118-150`; `css/convergence.css:1300-1349` | S3 | half-day |
| D.6 | MEDIUM | URL-state for filters bails out when family is open (`#hash` fragment collision) — migrate to `?query` | `js/filters.js:259-286, 262` | S3 | half-day |

### Cluster E · Convergence chart visual completion

| ID | Severity | Title | Location | Specialist | Effort |
|---|---|---|---|---|---|
| E.1 | BLOCK | No critical-path highlighting — Art.5(8) → Art.75(1)DA → DPP path invisible despite `convergence.binding_constraint` already in JSON | `js/convergence-view.js`; `js/tracker.js:472-616` | S2 | 1 day |
| E.2 | BLOCK | No drawn convergence/dependency edges between columns — chart is structurally a multi-column Gantt despite "convergence" name | `js/convergence-view.js:476-490` | S2 | 1 day SVG overlay (cheap path) / 3 days full schema (rich path) |
| E.3 | HIGH | Font sizes crept to 0.48-0.66rem in chart — below readability floor | `css/convergence.css:108,200,208,284,290,325,1357` | S2 | half-day type-scale reset |
| E.4 | HIGH | No swimlane-actor separation — collapse "what's blocked on EC vs CEN vs industry" into pipeline column | data schema (no `actor` field); `js/convergence-view.js` no actor render | S2 | half-day lookup + render |

### Cluster F · Operator workflow & persistence

| ID | Severity | Title | Location | Specialist | Effort |
|---|---|---|---|---|---|
| F.1 | BLOCK | "Save" downloads JSON to `~/Downloads/` + manual git commit — no persistence, no audit trail | `js/admin.js:491-519` | S4 | 2 days (Supabase Edge Function + audit table) |
| F.2 | BLOCK | System-timeline edits affect all 37 families with zero impact preview | `js/admin.js:452-488` | S4 | half-day (impact preview pane + acknowledgment) |
| F.3 | HIGH | Auth gate is `sha256("admin")` + localStorage flag — no logout, no expiry, no rate limit | `js/admin.js:15-106` | S4 | 1 day (move to magic-link flow) |
| F.4 | HIGH | Save toolbar has no diff preview / no confirm — accidental textarea typing silently dirties data | `js/admin.js:76,85,296-306` | S4 | half-day |
| F.5 | HIGH | Review-queue verification state lost on clear-site-data (localStorage only) | `js/admin.js:596-602`; `js/review-queue.js:838-855` | S4 | folds into F.1 |
| F.6 | HIGH | Agent-vs-human distinction collapses post-accept — `_verification` metadata not surfaced in family editor or public tracker | `js/admin.js:269-272`; `js/review-queue.js:306-316,392-394` | S4 | half-day editor badges + post-NVTB public propagation |
| F.7 | HIGH | Data-health issue rows offer no "fix this" link / no batch action / no agent-task export | `js/data-health.js:432-491` | S4 | 1 day |

### Cluster G · Trust & content hygiene

| ID | Severity | Title | Location | Specialist | Effort |
|---|---|---|---|---|---|
| G.1 | HIGH | Source registry 74% orphan (67/90 unused); 30% (27/90) missing URLs incl. JTC24 prENs | `data/sources.json`; `data/families-v2.json` content cross-ref | S5 | 2 days |
| G.2 | HIGH | Stale `data/families.json` (v1) ships to production with zero JS consumers | `data/families.json` (frozen 2026-02-22); `tools/extract-families.py` | S5 | 30min (delete or archive) |
| G.3 | MEDIUM | 5 of 296 content cells empty (TIP/ROC standards_development; SAP/PTA/CAB standards_landscape) | `data/families-v2.json` | S5 | 30min/cell × 5 |

---

## Redesign roadmap (post-NVTB)

Phases ordered by leverage. Each phase is independently shippable.

### Phase 1 · Sprint 3 resumption + sub-day BLOCKs (2-3 days)

**Goal:** Restore the overview layer the redesign claim depends on; ship the 3 sub-day BLOCKs that any first-time visitor would notice.

- Cluster A in full (system-dashboard wired, filter CSS restored, dashboard nav link).
- Cluster C.1 + C.2 (orange-class CSS sed + distinct red hex).
- Cluster B.4 (`prefers-reduced-motion` global block — 30min, prevents new motion fixes from shipping unguarded).

After Phase 1: the production tracker stops exhibiting the "Sprint 3 was parked" tells. The Shneiderman overview layer exists. The certainty palette renders correctly across ~41 previously-unstyled elements.

### Phase 2 · Accessibility lifted to design-system tier (4-6 days)

**Goal:** Move from cosmetic pass to ACR-defensible structural compliance (EAA / EN 301 549).

- Cluster B in full (B.1-B.9): keyboard entry, focus rings, non-colour status, dialogs + focus management, tree/table fallback, arrow-key swimlane traversal, tooltip ARIA.
- Codify status-icon vocabulary in `assets/design-system/status-icons.svg` so any future status indicator (card, chart, gantt, badge) automatically has icon+text+colour.
- Add CI checks that fail the build on `outline: none` without replacement, missing `prefers-reduced-motion` blocks, and `<div>` event handlers without `role` + `tabindex`. Pair with axe-core in the GitHub Pages preview.
- Lock the "table-first chart-second" rendering pattern: build the convergence as `<table role="grid">` with absolute-positioned cells. One architectural choice resolves rubric items #3, #4, #5, and most of #6.

After Phase 2: the tracker passes a WCAG 2.2 AA conformance audit; can be sent to NWO / RVO / EFRO / large-EU-corporate procurement without an ACR risk.

### Phase 3 · Brand integration + certainty palette redesign (3-5 days)

**Goal:** End the "generic SaaS dashboard" look and resolve the cross-portfolio token drift.

- **Cross-portfolio token decision first** — `regenstudio-demos/CLAUDE.md` says emerald is `#00914B`; `~/Claude/design-lab/design-tokens.js` says `#008545`. Pick one canonical, propagate to the 37 SVG icons (currently `#00914B`), update both CLAUDE.md and design-tokens.js to agree. This is a Regen Studio brand-system question, not a CPR-tracker question — but the tracker is blocked behind it.
- Create `css/tokens.css` mirroring design-lab `PALETTE / NEUTRALS / LIGHT_VARIANTS / MID_VARIANTS` as CSS custom properties. Single source of truth.
- Hero gradient → triangle-band motif. Footer navy → 6-colour triangle band. Disclaimer red → brand red `#E71846`. EAD badge violet → magenta-light + magenta-dark. CTA secondaries → brand magenta.
- **Certainty palette redesign** — collapse 7 brittle levels to 5 brand-deutan-safe levels: confirmed (emerald) / scheduled (teal) / estimated (orange) / speculative (magenta) / unknown (warm gray). Pair every level with a redundant non-colour cue (filled / outlined / outlined+dashed / outlined+dotted / hollow). Persistent legend on the chart.
- Same token system propagates to EDI-wallet / battery-questionnaire / ai-tax-ubi / dpp-system → eliminates per-demo Tailwind drift across the portfolio.

### Phase 4 · Convergence chart visual completion (2-3 days)

**Goal:** Make "convergence" finally visual instead of metaphorical. Critical-path becomes spatially obvious.

- Cluster E in full.
- SVG edge overlay (~150 LOC) — keep the hand-rolled engine. Draw critical-path treatment (thicker rim on binding-side terminal node, faded outline on non-critical) + 1-2 dashed convergence-arrow polylines from `(latest product-side terminal)` and `(sys-dpp-mandatory)` meeting at a diamond placed at the binding date.
- Schema additions: `actor` field per node-type (CEN/EC/Industry/NB) → small actor-badge at top-right of each dot. `dependencies: []` array → optional cross-column edges drawn on hover/focus.
- Type-scale reset: chart-scope text to 0.75-0.8125rem minimum.
- Resting-state shadows / alternating nth-child accents / slide-in animation removed (Tufte hygiene).

This is the single change that would move the chart from "interesting custom widget" to "case-study-worthy regulatory viz".

### Phase 5 · Operator workflow & persistence backend (5-7 days)

**Goal:** Convert admin from "data-entry tool" into "regulatory-intelligence operator console".

- Cluster F in full.
- Supabase Edge Function `cpr-admin-apply` + `cpr_admin_audit` append-only table + magic-link auth. Each accepted update commits via GitHub API on accept (or batches into a daily PR for review).
- Demote Families editor to read-only "current state" viewer; direct-edit becomes an agent-task ("Request agent update for SHA → content.about") flowing back into the review queue.
- Bulk-action bar on review queue: "Accept all 9 updates from EUR-Lex Implementing Decision 2026/284".
- Merge `dashboard.html` and `js/data-health.js` into a single 6-dimension health view (completeness, consistency, source coverage, timeliness, validity, count integrity). Each issue row → "Fix this" button or agent-task export.
- System-timeline editor isolated to its own page with elevated confirmation + 24h cooldown.

### Phase 6 · Power-user IA + faceted filtering + mobile recovery (3-4 days)

**Goal:** Beat NANDO on the audience NANDO actually serves.

- Cluster D in full.
- 8-dimension faceted filter: pipeline / certainty / DPP year / binding-constraint / Annex II / standard type / TC / sort. URL-state schema migrated from `#hash` to `?query`. In-memory index + Set intersection + DOM diff for <80ms paint.
- Mobile: search-icon-with-overlay at ≤768px, hamburger menu, sticky in-page section nav on convergence detail. Compare-checkbox visible by default at low contrast.
- Active-filters chip bar + result-count meta. "Updated since last visit" / change-feed banner.

### Phase 7 · Trust gradient publicly visible (2-3 days)

**Goal:** Turn the operator's verification work into the product's public trust signal.

- Cluster G in full.
- Source registry pruning + URL backfill + `access_note` for genuinely-restricted prENs.
- Source-citation density push: increase `[S#]` anchors in `dpp_outlook` and `key_risks` paragraphs (currently 36/37 families cite the same 7 source IDs).
- Verification badges propagate to public tracker — hover affordance: "verified by Yvo against EUR-Lex on YYYY-MM-DD". This is the trust gradient OneTrust charges enterprise prices for; making it visible turns it from a private artifact into the product's differentiator.

---

## Sub-day BLOCKs flagged for awareness (out of formal scope)

User explicitly opted out of pre-NVTB triage. Per the audit-plan rule "if catastrophic findings emerge they will be flagged but the audit will not pivot away from breadth", noting these for the user's discretion only — not recommended actions:

- **C.1** (orange CSS sed) — ~30min, fixes ~41 visibly-unstyled certainty signals across cards / chart / gantts.
- **C.2** (`--cert-red` distinct hex) — ~10min, restores the 7-level palette.
- **A.1** (wire `system-dashboard.js` into index.html) — ~2h, restores Shneiderman overview layer; biggest single jump in perceived product quality.
- **B.2** (focus-ring replacement on chart nodes) — ~30min, fixes the most-visible WCAG 2.4.7 BLOCK on the headline surface.

Total: ~3 hours of work that would meaningfully improve the demo. User decides whether to absorb them into `cpr-bug-ui-fix-pass` today or leave for Phase 1 of the redesign.

---

## Out-of-audit observations

Captured by specialists outside the 16-pattern rubric:

- **Sprint 3 parking on 2026-04-23 is the proximate cause of three BLOCK clusters** — the deletion of `css/dashboard.css` took the filter chrome with it; `system-dashboard.js` was left drafted-not-wired; `dashboard.html` lost its main-nav inbound link. Resuming Sprint 3 (Cluster A) is one work item that collapses three BLOCKs.
- **Post-2026-04-23 XSS hardening covered the admin-edit surface but missed two outliers**: `dashboard.html escHtml()` omits `"` and is safe-by-accident only because callers happen to use it in `<td>` body, never in attributes; `js/dpp-info.js` is dead code (zero live callers per grep) but retains an `innerHTML = btn.getAttribute('data-info')` sink that would re-introduce XSS on next misuse. Recommend deleting `dpp-info.js` outright.
- **PLAN.md certainty palette table is 1 level out of date** — declares 6 levels, CSS defines 7, plus an undocumented 5-level "card indicator" palette that PLAN.md doesn't mention. Drift from the redesign expansion.
- **The 37 SVG family icons in `Images/` are the most brand-aligned surface in the entire product** — they use brand teal / magenta / red / orange / emerald correctly. The chrome should reverse-engineer brand decisions from the icon palette.
- **Tech-stack lock-in is a strength here, not a constraint** — `regenstudio-demos/CLAUDE.md` codifies "no build step, ES5-compatible vanilla JS". This rules out React Flow / Vite / dagre-as-NPM-import and forces all chart upgrades through the existing hand-rolled engine. Resist the urge to argue against this; the constraint is what keeps the entire `regenstudio-demos/` portfolio shippable by one person.
- **`Notes` tab in admin** is an under-built journal that the operator probably ignores. Either delete it post-NVTB or promote it to a real "Operator log" backed by the Phase 5 persistence layer.
- **`invoice.html` flow is purely public-facing** — no admin counterpart for "today's orders / revenue / pending fulfillment". Tax/accounting happens elsewhere (Exact Online per memory) but a basic order-count strip belongs on the admin hero.
- **`data/families.json` v1 is dead weight** — frozen 2026-02-22, zero JS consumers. Delete or move to `data/_archive/`.
- **CSP missing on admin / dashboard / gate / invoice** — defense-in-depth gap. Add `<meta http-equiv="Content-Security-Policy"...>` with `connect-src 'self' https://uemspezaqxmkhenimwuf.supabase.co`; inline scripts (HTTPS-redirect at dashboard.html:5) need a nonce.

---

## Verification

The audit is considered complete when:

1. ✅ All five specialist reports exist at `audit/2026-04-28-strategic/0[1-5]-*.md` and each includes a rubric scorecard for owned items + minimum 8 findings each.
2. ✅ This `AUDIT.md` synthesis exists and references every specialist report.
3. ✅ `rubric-scorecard.md` exists with all 16 items scored (no nulls), one-line evidence, deep-link to originating finding.
4. ✅ Prioritised backlog above is drop-in-ready for `6-projects/cpr-dpp-tracker/backlog.md` items[].
5. ✅ No specialist wrote outside its own report file.
6. **Spot-check**: open three cited file:line references (e.g. `convergence.css:245-249`, `tracker.js:208`, `families-v2.json` content cells) and confirm text matches what the specialist quoted.
7. **Live URL spot-check**: open `https://demos.regenstudio.world/cpr-dpp-tracker/` and reproduce S2's missing-system-dashboard finding (no `#sysDashSection` element above the card grid) + S5's orange-class finding (DevTools: any `.cpr-card__cert-dot--orange` class has no matching CSS rule).

The audit closes when the user reads this synthesis + `rubric-scorecard.md` and either (a) approves the prioritised backlog drop-in into `cpr-bug-ui-fix-pass`, or (b) requests a follow-up specialist pass on any thin area.
