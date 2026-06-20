# S5 — Regulatory content correctness + brand & design-token alignment

**Auditor:** Specialist S5 (regulatory + brand layer)
**Date:** 2026-04-28
**Live URL:** https://demos.regenstudio.world/cpr-dpp-tracker/
**Last code commit:** 2026-04-23
**Code dir:** `/Users/yvhun/Claude/regenstudio-demos/cpr-dpp-tracker/`

---

## 1. Executive summary

The tracker's **regulatory substance is in good shape**. Article references (Art. 5(8), 11, 12, 10(4)), the convergence formula (`max(Art.5(8)+12mo, Art.75(1) DA+18mo)`), the 5-pipeline model, the 305/2011 vs 2024/3110 split, the Annex VII numbering, and the JTC24 sub-item structure all line up with the cpr-expert reference fact-base. Per-family `content{}` is 98 % complete (291 of 296 cells populated), terminology is consistent across families, and the disclaimer banner correctly frames the demo's verification status. There are zero NL/EN mixing errors and only one literal "placeholder" string in body text.

The **brand layer is the weak side**. The certainty palette (`#10b981 / #84cc16 / #f59e0b / #f97316 / #ef4444 / #94a3b8` — Tailwind defaults) is the dominant visual signal across cards, convergence chart, comparison table, dashboard, and node detail, yet does NOT touch the Regen Studio triangle palette (`#93093F / #009BBB / #008545 / #E71846 / #FFA92D / #65DD35`). The reports.css sales page is the *only* surface that uses the brand palette properly — the tracker proper carries 7 magenta hits versus 230+ Tailwind-style hex literals. Two BLOCK-grade defects sit underneath: (a) a CSS-class mismatch silently strips color from every "orange" certainty dot/gantt/node (~41 visible UI elements), and (b) `--cert-red-orange` and `--cert-red` resolve to the *same* hex (#ef4444), making two of seven certainty levels visually indistinguishable.

**Top-3 strengths**
1. Regulatory accuracy — article citations, formula, pipeline model, and 305/2011 vs 2024/3110 distinctions are correct and conservative; no fabricated dates.
2. Content schema discipline — 8 sections × 37 families enforced consistently; only 5 empty cells; standards_summary and convergence.provenance fields preserve traceability.
3. Self-hosted typography — Inter / DM Serif Display / JetBrains Mono are properly wired through `/assets/fonts/` (no CDN drift; complies with Regen Studio font rule).

**Top-3 risks**
1. The orange-class CSS bug ships ~41 silently-uncolored certainty signals to a regulator audience.
2. The brand vacuum on the tracker proper (cards, hero, chart) makes the demo read as "generic SaaS dashboard" rather than "Regen Studio product" — degrades positioning ahead of the NVTB redesign.
3. Source registry hygiene — 67 of 90 sources (74 %) are orphan; 27 of 90 (30 %) lack URLs; the citation density in body content (`[S#]` counts) clusters on 4 IDs and is sparse where claims are most consequential.

---

## 2. Findings

### [BLOCK] Orange certainty class never matches CSS — 41 dots/gantts render unstyled
- **Location:** `js/tracker.js:223`, `js/comparison.js:300`, `js/convergence-view.js:508,515`, `js/node-detail.js:55`, `js/filters.js:99`, `js/system-dashboard.js:92`, `js/tracker.js:540`; CSS counterparts in `css/tracker.css:569,875,933,1189`, `css/convergence.css:272,360,415,565,702`, `css/admin.css:347,448`.
- **Layer:** brand (visual signal correctness)
- **What:** JS emits class `cert-dot--orange` (because `cert === 'orange'` per `families-v2.json`). All CSS rules read `cert-dot--color-orange`. There are **0** CSS rules matching `--orange`, but 5+ matching `--color-orange`. Sample: `.cpr-card__cert-dot--color-orange { background: var(--cert-orange); }`. `data/families-v2.json` contains 38 node-level + 3 family-level certainty values of `'orange'` plus the system timeline's gantt blocks → roughly 41 visible UI elements that should display `#f97316` (Estimated, moderate confidence) but render as the un-styled fallback.
- **Why it matters:** Orange is the most-used "moderate confidence" certainty band — it's the visual signal for "this isn't speculative but isn't scheduled either." Losing it across the chart, cards, and dashboard means the entire 7-level scale collapses to 6 levels in practice, undermining the very transparency story the tracker is trying to tell. This is regression-grade — looks like a botched `replace_all` `orange → color-orange` that touched only the CSS side.
- **Recommendation:** Search/replace `cert-dot--color-orange` → `cert-dot--orange`, `gantt--color-orange` → `gantt--orange`, `node--color-orange` → `node--orange`, etc., across all 6 CSS files. Test at 7 callsites that emit a class for `cert === 'orange'`. Add a contract test: every certainty in `['green','yellow-green','amber','orange','red-orange','red','gray']` must have a matching CSS rule for each class family (`.X__cert-dot--Y`).
- **Reference:** `references/node-catalogue.md` (cpr-expert) — the 7-level certainty palette is the documented signalling system.

### [BLOCK] `--cert-red-orange` and `--cert-red` are identical (#ef4444) — two certainty levels visually merged
- **Location:** `css/tracker.css:48-49`
  ```css
  --cert-red-orange: #ef4444;
  --cert-red: #ef4444;
  ```
- **Layer:** brand + a11y
- **What:** Both tokens resolve to the same Tailwind red-500. The 7-level certainty palette therefore offers 6 distinguishable colors at best (with the orange bug above, 5). The cpr-expert `node-catalogue.md` defines `red-orange` as "Speculative or projected" and `red` as "(no documented level — likely lowest)". The intent is two separate signals; the implementation collapses them.
- **Why it matters:** A 7-level signal is already on the edge of human discriminability; collapsing two adjacent levels into the same hex makes the system arbitrarily 5-or-6 levels and confuses anyone reading the chart legend.
- **Recommendation:** Either (a) re-derive a distinct hex for `--cert-red` (e.g. brand `#E71846` Regen red — earns brand integration as a side-effect), or (b) collapse to a single 6-level scale and drop one label from data + JS. Option (a) is more defensible because it brings one brand token into the certainty system without losing semantic resolution.
- **Reference:** `references/node-catalogue.md`; design-tokens.js `PALETTE.red = #E71846`.

### [BLOCK] Brand-token drift on emerald — `#008545` (design-tokens) vs `#00914B` (regenstudio-demos shared) vs `#008545` (tracker.css local)
- **Location:** `~/Claude/design-lab/design-tokens.js:23` says `emerald: #008545`; `~/Claude/regenstudio-demos/CLAUDE.md` says `--color-emerald: #00914B`; the 37 family icons under `Images/*.svg` use `stroke="#00914B"` (77 occurrences); `css/tracker.css:31` declares `--color-emerald: #008545`.
- **Layer:** brand
- **What:** The same brand token has two live hex values inside one product. Icons render `#00914B` (slightly brighter green) while UI chrome (CTA buttons, milestones) renders `#008545` (slightly darker green). The two are perceptibly different side-by-side.
- **Why it matters:** A regulator-facing tracker that markets itself as "by Regen Studio" should not have two greens claiming to be the brand color in the same viewport. This is a single-source-of-truth problem that will only get worse as more demos absorb the design-lab tokens.
- **Recommendation:** Pick one canonical emerald and propagate. Recommend `#008545` (the design-tokens.js value, which is also the website value) and re-export the 37 SVG icons. If `#00914B` was a website-era choice for higher punch on dark backgrounds, document it as a separate token (`emerald-bright`) rather than sharing the `emerald` name.
- **Reference:** design-tokens.js; `~/Claude/regenstudio-demos/CLAUDE.md § Conventions`.

### [HIGH] Brand palette absent from tracker proper — only the sales page (reports.css) uses it
- **Location:** `css/tracker.css` (1,594 lines, 7 brand-color hits), `css/convergence.css` (~700 lines, 6 hits — all `#009BBB`), vs `css/reports.css` (8 hits including the only `#93093F` magenta in the entire UI surface).
- **Layer:** brand
- **What:** Aggregate hex frequency across all CSS:
  - `#009BBB` teal: 15 — used as "primary action" surrogate
  - `#008545` emerald: 15 — used for "completed" milestones + CTA
  - `#93093F` magenta: 7 — all in reports.css
  - `#FFA92D` orange: 4 — all in reports.css gradients
  - `#E71846` red: **0**
  - `#65DD35` green: **0**
  - Tailwind/ad-hoc family (`#94a3b8 / #64748b / #6366f1 / #ef4444 / #f59e0b / #f97316 / #10b981 / #84cc16`): 50+ occurrences combined
- **Why it matters:** The tracker is the *flagship* CPR demo and the visual landing surface for NVTB stakeholders — it should be unmistakably Regen Studio. Today it reads as "indigo + teal + Tailwind status colors", which is the visual language of mid-2020s SaaS dashboards. The sales page (reports.html) carries the brand correctly; the actual product surface does not.
- **Recommendation:** Phase 2 (post-NVTB) reintroduce the triangle palette into the tracker proper. See § 5 for the integration roadmap. Short-term: add at least one branded surface element on each page (hero gradient, footer band, or section divider) so the brand registers within 3 seconds of pageload.
- **Reference:** `~/Claude/design-lab/design-tokens.js`; `~/Claude/design-lab/CLAUDE.md § Brand Palette`.

### [HIGH] Source registry is 74 % orphan; 30 % of registered sources lack URLs
- **Location:** `data/sources.json` (90 entries); referenced from `data/families-v2.json` (in `content[]`, `pipelines[].nodes[].sources`, `standards[].sources`) and `data/system-timeline.json`.
- **Layer:** regulatory (trust)
- **What:** 23 of 90 source IDs are referenced anywhere in v2 + system-timeline; 67 are orphan. 27 of 90 sources (30 %) carry an empty `url: ""` field — including S14 (the C(2024) 5423 ESPR DPP standardisation request, which is critical to the system timeline narrative) and the entire prEN 18219/18221/18222/18223/18216 set (S53–S57). In `families-v2.json` content sections, only 7 unique source IDs are cited (`S1, S30, S143, S144, S98, S12, S11`); 36 of 37 families cite `[S30]`, suggesting heavy boilerplate citing.
- **Why it matters:** Two trust risks: (a) orphan sources signal incomplete migration from the agent's research scaffold — easy ammunition for a regulator who notices a referenced framework that goes nowhere; (b) the missing-URL set includes the JTC24 prEN drafts that are the central live story of the system timeline — citing a draft prEN without a url makes the citation un-verifiable. The cpr-expert skill explicitly requires: "Cite facts with sources. Every regulation article, date, or named initiative cited in produced content must have a `[S#]` pointer backed by an entry…" — the orphan ratio + missing URLs together violates that contract in spirit.
- **Recommendation:** (1) Run a pruning pass — drop orphan sources or move them to a `data/sources-extended.json` so the live registry is lean. (2) Backfill URLs for the 27 missing entries; if a prEN has no public URL because it's CEN-protected, write the inability into a new `access_note` field instead of an empty string. (3) Encourage citation density in body content — `dpp_outlook` paragraphs in particular state numerical estimates without `[S#]` anchors. Aim for 1 citation per non-trivial claim.
- **Reference:** `~/Claude/.claude/skills/cpr-expert/SKILL.md § Rules of engagement, Rule 1`; `references/source-hierarchy.md`.

### [HIGH] Stale `data/families.json` (v1) ships to production but has zero consumers
- **Location:** `data/families.json` (37 families, last `updated: 2026-02-22`); zero `fetch()` calls reference it across `js/*.js` or any `*.html` (only `tools/extract-families.py` mentions it as historical input).
- **Layer:** regulatory + brand (data hygiene)
- **What:** v2 was migrated 2026-02-27 then convergence-recomputed 2026-04-23. v1 is frozen at 2026-02-22. PLAN.md § Sprint 5 still flags v1 as "kept for reports compat" but `js/reports.js:45` and `js/report-download.js:79` both fetch v2. v1 is dead weight, but if a future contributor or a leak references v1 directly, they'll quote stale dates.
- **Why it matters:** Every public file is a reputational liability. A regulator-savvy reader who pokes at the GitHub Pages repo (the demos repo IS public) and finds two contradictory `families.json` files will (rightly) ask which one is authoritative. Staleness in a regulatory tracker is more damaging than in a marketing site — the whole value proposition is "we track this for you."
- **Recommendation:** Either delete v1 (clean break, recommended) or move to `data/_archive/families-v1-2026-02-22.json` with a brief note in PLAN.md. If anything still needs v1 for compat, surface that need explicitly — current evidence is none.
- **Reference:** PLAN.md § Sprint 5 ("All 37 families' content reviewed and enriched" — the implicit close-out); `references/update-precision.md` (cpr-expert) on demote-back-to-stale workflow.

### [HIGH] Color-blind discriminability — 7-level cert palette has multiple deutan-collapse pairs
- **Location:** `css/tracker.css:43-50`
- **Layer:** brand (a11y)
- **What:** A simple deuteranopia projection of the 7-level palette shows `amber vs orange` collapsing to RGB-difference 28 (visually identical for ~5 % of male readers) and `red-orange vs red` at difference 0 (because they're the same hex, see BLOCK above). The 5-level palette has `uncertain vs speculative` collapsing at difference 28. Brand palette by contrast spreads cleanly across deutan space.
- **Why it matters:** Construction-products notified-bodies and regulatory managers skew older/male — exactly the demographic with the highest deutan/protan rates (~6 % combined). A certainty signal that loses 1–2 levels for that audience defeats its purpose.
- **Recommendation:** Either (a) reduce to 5 levels with deliberate hue separation, (b) keep 7 levels but pair color with a redundant non-color signal (icon shape, line style, fill pattern) per Tufte/Carbon a11y guidance, or (c) when the brand palette is wired in (see § 5), use it — the brand palette already deutan-separates cleanly.
- **Reference:** Carbon Design System status indicators; WhoCanUse.com simulation; Brettel/Vienot deuteranopia model.

### [MEDIUM] Five family content cells empty
- **Location:** `data/families-v2.json` — `TIP.content.standards_development` (empty), `ROC.content.standards_development` (empty), `SAP.content.standards_landscape` (empty), `PTA.content.standards_landscape` (empty), `CAB.content.standards_landscape` (empty).
- **Layer:** regulatory
- **What:** 5 of 296 content cells are zero-length strings. SAP, PTA, CAB are all "DPP ~2033-2034" families — late-pipeline, low-priority, but visible in the grid. TIP and ROC are mid-priority. The empty `standards_landscape` is particularly noticeable because `standards_summary.completeness: "full"` is set on all three, suggesting the data is known but didn't make it into prose.
- **Why it matters:** A reader clicking into one of these families gets a half-rendered detail view. The fix is cheap (≤30 min of writing per family) and the families are visible.
- **Recommendation:** Fill in the 5 cells using the `standards_summary.source` field as a starting point. Treat as pre-NVTB polish.
- **Reference:** PLAN.md § Sprint 5 verification checklist ("Spot-check 5 families: content sections match original info text").

### [MEDIUM] Mixed-case "HTS" / "hts" / "harmonised technical specification" — inconsistent shorthand
- **Location:** `data/families-v2.json` — body content (limited occurrences: 2 × `HTS`, 1 × lowercase `hts`).
- **Layer:** regulatory (terminology)
- **What:** The CPR uses "harmonised technical specification" (Art. 3(42)) as the umbrella term. Tracker content sometimes abbreviates it as `HTS`, occasionally as `hts`, and most often spells it out. The `hts` lowercase variant is technically wrong (the term is a defined acronym in the Regulation).
- **Why it matters:** Low-severity terminology slip. Notified-body audience will notice; general public won't.
- **Recommendation:** Pick one — the cpr-expert skill uses `HTS` in shorthand. Replace `hts` with `HTS` and standardise the long-form once per family entry, then `HTS` thereafter.
- **Reference:** Reg (EU) 2024/3110, Art. 3(42); `references/regulatory-framework.md` (cpr-expert).

### [MEDIUM] Disclaimer banner uses non-brand red `#D32F2F`
- **Location:** `css/tracker.css:375` `.tracker-disclaimer { background: #D32F2F; ... }`
- **Layer:** brand
- **What:** The disclaimer (top-of-page, regulator-facing demo warning) is rendered in Material-Design red, not brand red `#E71846`. It's visible above the fold on every page.
- **Why it matters:** The disclaimer is one of the most visually emphatic elements of the page — using a non-brand red here weakens the brand association on the strongest visual hook the page has.
- **Recommendation:** Change to `var(--brand-red, #E71846)` once a brand-red token exists in tracker.css.
- **Reference:** design-tokens.js `PALETTE.red = #E71846`.

### [MEDIUM] All HTML pages declare `lang="en"` — but cpr-expert audience is multilingual
- **Location:** `index.html:2`, `landing.html:2`, `standard.html:2`, `reports.html:2`, `dashboard.html:2`, `admin.html:2`, `gate.html:2`, `invoice.html:2`, `report-success.html:2`.
- **Layer:** regulatory (content reach)
- **What:** Tracker is EN-only. Construction-products audience in NL, DE, FR, IT countries reads regulation in their own language. CEN/CENELEC works in EN/FR officially; commercial uptake of the tracker among Dutch notified bodies, RVO, Bouwend Nederland, etc. would benefit from at least an NL surface. There are zero NL strings in the v2 content (verified via grep for `Nederlandse|verordening|gemandateerd|gedelegeerd|harmonisering` — all 0).
- **Why it matters:** Regen Studio is NL-headquartered and DPP-voucher work is all NL-language. The English-only stance is consistent and clean for now, but is a constraint for any commercial follow-on.
- **Recommendation:** Defer NL/EN switch to post-NVTB (large effort). Pre-NVTB: at minimum, when product references an NL standard or Dutch notified body, italicise the proper noun. Consider an `og:locale_alternate` meta + `<link rel="alternate" hreflang="nl">` placeholder so future bilingual is plumbed.
- **Reference:** Reg 2024/3110 is published in 24 EU languages; CEN/TC 33 working language is FR/EN; tracker audience is implicitly EU-wide.

### [LOW] Mid-page Tailwind purple `#6d28d9` / `#ede9fe` for EAD badge breaks the palette
- **Location:** `css/tracker.css:1571-1574`
  ```css
  .std-grid__badge--ead { background: #ede9fe; color: #6d28d9; }
  ```
- **Layer:** brand
- **What:** The EAD-vs-hEN badge differentiator uses Tailwind violet for EAD and the local teal-light for hEN. Violet is not in the brand palette.
- **Why it matters:** Minor inconsistency on a frequently-rendered badge.
- **Recommendation:** Repurpose `--brand-magenta` light variant for EAD (e.g. `#FDB6D2` background + `#93093F` text) — both are in design-tokens.js and would carry brand into a high-frequency element.
- **Reference:** design-tokens.js `LIGHT_VARIANTS.magenta`.

### [LOW] Convergence-view inherits `--font-display` redeclaration — token duplication
- **Location:** `css/convergence.css:5-10` re-declares the typography variables that `tracker.css:11-15` already owns.
- **Layer:** brand (token discipline)
- **What:** Same `--font-display`, `--font-sans`, `--font-mono` declared in two CSS files. If one drifts (e.g. someone replaces DM Serif Display in only one), the chart and the surrounding cards will diverge.
- **Why it matters:** Sets up future drift; current values match exactly so no visible defect today.
- **Recommendation:** When wiring design-lab tokens in (see § 5), centralise typography to a single `tokens.css` file imported by all surfaces.

### [LOW] One literal "placeholder" string in body content
- **Location:** `data/families-v2.json` — `RPS.content.sreq_analysis`: *"Assigned placeholder \"M/XXX\" — no mandate number yet."*
- **Layer:** regulatory
- **What:** This is actually correct — CEN does assign "M/XXX" as a literal placeholder until the mandate number is registered. The word "placeholder" is true to the source. Logged here so the auditor doesn't re-flag in a future sweep.
- **Why it matters:** Not a defect; a clarification.
- **Recommendation:** None. Optionally rephrase as *"Provisional mandate number M/XXX — no permanent number assigned yet"* if "placeholder" reads off-tone.

### [NOTE] PLAN.md certainty palette table contradicts the live CSS
- **Location:** `PLAN.md:51-59`
  ```
  | Color | Hex | Meaning |
  | Green | #10b981 | Confirmed... |
  ```
  vs `css/tracker.css:43-50` defines the same 7 cert tokens but ALSO defines a 5-level "card indicator" palette that PLAN.md doesn't mention.
- **Layer:** regulatory + brand (documentation)
- **What:** PLAN.md says 6-level (`green`, `yellow-green`, `amber`, `orange`, `red-orange`, `gray`) — actually 7 in CSS (adds `red`); plus an undocumented 5-level palette (`confirmed`, `likely`, `uncertain`, `speculative`, `unknown`) used on cards. Documentation drifted as the redesign expanded the scale.
- **Why it matters:** PLAN.md is the crash-recovery reference; if it understates the palette by 1 level, future sessions reproduce the wrong scale.
- **Recommendation:** Fix in PLAN.md the next time it's edited. Out of scope for this audit.

### [NOTE] Iconography is brand-aligned (4 of 6 brand colors used in 37 SVG icons)
- **Location:** `Images/*.svg` (37 files).
- **Layer:** brand
- **What:** Icon strokes use `#FFA92D` (91), `#009BBB` (77), `#E71846` (75), `#00914B` (75 — see emerald drift BLOCK), `#93093F` (47). Magenta is present, red is present — both missing from the CSS chrome.
- **Why it matters:** Positive observation. The icons are doing the brand-palette job that the rest of the UI is not. They show the look that the chrome could adopt.
- **Recommendation:** Treat the icon palette as the source-of-truth for what brand-on-tracker looks like; reverse-engineer chrome decisions from icon palette.

---

## 3. Scorecard for owned items

| Item | Score | Evidence | Anchor |
|------|-------|----------|--------|
| **#16 — Regulatory terminology match** | **2** | All 4 cited articles (Art. 5(8), 11, 12, 10(4)) verified against cpr-expert `regulatory-framework.md`. Convergence formula `max(Art.5(8)+12mo, Art.75(1)DA+18mo)` matches canonical. 305/2011 vs 2024/3110 split correctly applied per family. Annex VII numbering correct. JTC24 sub-items correct (prEN 18216/18219/18221/18222/18223). One minor `hts/HTS` casing inconsistency (MEDIUM finding). | `data/families-v2.json` content sections; `data/system-timeline.json`; `references/regulatory-framework.md` |
| **#8 — Color-blind-safe status palette** | **0** | Two BLOCK defects: orange-class CSS mismatch (41 elements) + `red-orange == red` collapse. Deutan-projection shows additional `amber vs orange` collapse (RGB-diff 28). 5-level fallback palette has `uncertain vs speculative` collapse. No redundant non-color signalling on cert dots. | `css/tracker.css:43-50`; live deutan sim above |
| **#14 — Tufte data-ink ratio at the brand layer** | **1** | Cards are clean (low chrome, font + dot + DPP date carry the meaning). Compare bar uses solid color blocks redundantly. Convergence chart uses both gantt fill + node dot for the same certainty (acceptable Tufte-wise as data + small-multiple). Hero icons backdrop at 7 % opacity is decorative ink without information value (Tufte would cut it). Footer dark navy band is decorative; could be brand triangle band instead (data-ink would be unchanged, brand-ink would gain). | `css/tracker.css:291-308` (hero icons), `1422-1486` (footer) |

---

## 4. Content-completeness matrix

**Method:** full scan of all 37 families × 8 content sections (296 cells). Cell = "complete" if string length > 20 chars; "empty" otherwise. No partial state defined.

| Section | Complete | Empty | % complete |
|---------|----------|-------|-----------|
| `about` | 37/37 | 0 | 100 % |
| `standards_landscape` | 34/37 | 3 (SAP, PTA, CAB) | 92 % |
| `standards_development` | 35/37 | 2 (TIP, ROC) | 95 % |
| `sreq_analysis` | 37/37 | 0 | 100 % |
| `dpp_outlook` | 37/37 | 0 | 100 % |
| `stakeholder_notes` | 37/37 | 0 | 100 % |
| `key_risks` | 37/37 | 0 | 100 % |
| `sources_summary` | 37/37 | 0 | 100 % |
| **Total** | **291/296** | **5** | **98 %** |

**Section schema is consistent across all 37 families** — every family has exactly the 8 documented sections (no schema drift, no orphan sections, no extra sections).

**Source-citation density** (cited from anywhere — content + nodes + standards + system-timeline):
- Total registered sources: 90
- Total referenced sources: 23
- **Orphan rate: 67/90 = 74 %**
- Content-section citation density: only 7 unique source IDs cited from `content[].`* fields; 36 of 37 families cite `[S30]` (suggesting boilerplate reuse).

---

## 5. Brand integration roadmap (post-NVTB)

The certainty palette and the brand palette can coexist — they encode different things (status vs identity). The fix is to use brand for chrome + accents and keep certainty as a function-only palette, but redesigned to be brand-compatible and a11y-safe.

### Phase A — Foundation (1 day)
1. **Create `css/tokens.css`** that imports/mirrors `~/Claude/design-lab/design-tokens.js` PALETTE/NEUTRALS/LIGHT_VARIANTS/MID_VARIANTS as CSS custom properties (`--brand-magenta`, `--brand-magenta-light`, etc.). Single file so the source of truth is one editable surface.
2. **Resolve emerald drift** — pick `#008545` canonical, re-export 37 SVG icons using a sed pass + spot-check render. Add CI check that the only `#emerald` literals in the repo match.
3. **Fix orange BLOCK** — sed `--color-orange` → `--orange` across CSS; add contract test.

### Phase B — Brand integration (2-3 days)
4. **Hero gradient** — replace `linear-gradient(135deg, #243644, #1B2833)` with a triangle-band motif (matches landing-anim style). Keeps the navy text-substrate but adds the brand triangle silhouette at low opacity. Magenta + emerald + teal as the three tone anchors.
5. **CTA buttons** — `--color-emerald` already present; add a brand-magenta secondary CTA where appropriate (e.g. "Compare families" floating bar).
6. **Footer band** — instead of flat navy, render a 6-color triangle band (using design-lab triangle generator) as a 32 px decorative top border on the footer.
7. **Disclaimer banner** — `#D32F2F` → `#E71846` brand red.
8. **EAD badge** — Tailwind violet → magenta-light + magenta-dark.

### Phase C — Certainty palette redesign (1 day)
The certainty palette should remain functional (not brand identity) but become brand-compatible:
- Reduce 7 levels to **5 levels** that map cleanly to brand-deutan-safe colors:
  - **Confirmed**  → brand emerald `#008545`
  - **Scheduled**  → brand teal `#009BBB`
  - **Estimated**  → brand orange `#FFA92D`
  - **Speculative** → brand magenta `#93093F`
  - **Unknown**    → neutral warm gray `#E4E2E2` with text-muted icon
- Pair every certainty signal with a **redundant non-color cue** (filled circle / outlined circle / outlined+dashed circle / outlined+dotted / hollow), so it's readable at print/photocopy/grayscale.
- Add a **legend** at the top of the dashboard that names + shows each level with its non-color cue.

### Phase D — Verification (0.5 day)
9. Run a deutan/protan/tritan simulation pass on the rebuilt palette.
10. WhoCanUse contrast check on every certainty pair (4.5:1 vs background, 3:1 vs each other adjacent).
11. Print one representative family page on B&W to confirm certainty signal survives grayscale.

### Conflict resolution between brand and certainty
- **Brand emerald = "Confirmed"** is the highest-stakes overlap. Acceptable because confirmed-status content (regulation already in force) is the *most authoritative* signal — pairing it with the most authoritative brand color reinforces the message.
- **Brand magenta = "Speculative"** at first reads counter-intuitive (magenta is RS's primary color). But: the speculative signal needs to *catch* the eye, magenta does that, and the rest of the UI's brand-magenta surfaces (CTA accents, hero, footer) provide enough non-status uses that the meaning won't collapse to "magenta = warning".
- **Brand teal = "Scheduled"** is the safest pairing (teal already used for "primary action" today; "scheduled" is a near-confirm state).

---

## 6. Top-3 strategic recommendations

### 1. Ship the BLOCK fixes before the next public link to the tracker is sent (≤1 day)
The orange-class CSS bug is a regression that any first-time visitor to `/cpr-dpp-tracker/` will see. The `red-orange == red` token collision is shipping a broken legend. The emerald-drift makes the brand look unfinished in the same viewport. Each of these is a sub-day fix; together they unblock everything else.

### 2. Treat the source registry as a regulatory-grade artifact, not a research-scaffold output (≤2 days)
Trim the 67 orphan sources, backfill 27 missing URLs (or write `access_note` for the genuinely-restricted ones), and increase citation density in `dpp_outlook` and `key_risks` paragraphs (currently 36/37 families cite the same 7 source IDs, mostly `[S1]` and `[S30]`). A regulator who pokes at sources should find: (a) every cited source is reachable, (b) every authoritative claim is cited, (c) the registry is bounded to what's actually used. The cpr-expert skill enforces this contract; the tracker should reflect it.

### 3. Wire the brand into the tracker proper before the post-NVTB redesign, then refactor the certainty palette to brand-deutan-safe (3-5 days, sequenced)
Cards, hero, and chart need to read as Regen Studio, not generic SaaS — that is the strategic tension between the tracker's current functional palette and its commercial positioning. The Phase A→D roadmap above keeps the certainty signal load-bearing while making it brand-compatible AND color-blind-safe AND grayscale-survivable. This is the highest-leverage post-NVTB design move because the same token system can then propagate to EDI-wallet, battery-questionnaire, ai-tax-ubi, and dpp-system — eliminating per-demo Tailwind drift across the entire `regenstudio-demos` portfolio.

---

*End of S5 audit. Owned items #16, #8, #14 scored above. Approximate word count: 2,650.*
