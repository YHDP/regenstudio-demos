# S4 — Admin panel, review-queue workflow, data-integrity tooling

**Auditor:** Specialist S4 (parallel audit, strategic phase)
**Date:** 2026-04-28
**Scope:** Operator-facing surfaces — `admin.html`, `dashboard.html`, `gate.html`, `invoice.html`, `reports.html`, and the JS that powers them (`admin.js`, `review-queue.js`, `data-health.js`, `content-renderer.js`, `dpp-info.js`, `report-generator.js`, `cpr-pdf.js`, `report-download.js`, `invoice.js`).
**Mode:** Read-only.

---

## 1. Executive summary

The CPR DPP Tracker's operator surface is **a thoughtful first draft**, well above the level usually shipped for an internal tool. The review-queue wizard (`js/review-queue.js`) is genuinely good: per-card source/claim verification gates, undo metadata stamped on every applied change, auto-advance to the next pending item, dual-axis "is the source reliable / does the source support the claim" check that maps cleanly to OneTrust's "evidence + assessment" pattern. The data-health module (`js/data-health.js`) computes five weighted dimensions and ranks per-family scores worst-first — exactly the right shape for a triage workflow. Both modules have careful escaping.

**The XSS-harden status (post-2026-04-23 commit `7587455`) is GREEN for the admin-edit surface but YELLOW elsewhere.** `admin.js esc()`, `review-queue.js esc()`, `data-health.js esc()`, `content-renderer.js esc()`, and `dpp-info.js esc()` all use the safe pattern (`textContent` round-trip OR five-char string replace including `&` and `"`). The exception is `dashboard.html escHtml()` which **omits the `"` replacement** — currently safe-by-accident (only used in `<td>` body), but inconsistent and brittle. Worse, `dpp-info.js:22` still uses `popup.innerHTML = btn.getAttribute('data-info')` — a sink that depends entirely on every caller pre-escaping. Post-cleanup it now has zero callers in the live code path; it should be deleted, not retained as a latent footgun.

**Top 3 strengths:** (1) verification-gated accept on review-queue (claim_attributed required before Accept enables); (2) full undo metadata on every applied update with proper restore semantics; (3) data-health dashboard's worst-first family ranking with per-dimension drill-down.

**Top 3 risks:** (1) **Save = manual download + git commit** — there is no in-app persistence and no audit trail beyond the per-update `_undo_*` markers and `verified_by: 'admin'` literal string; (2) **System-timeline edits have zero impact-assessment** — changing a node that affects all 37 families surfaces no preview; (3) **Auth gate has no logout, no expiry, no rate limit, hash is sha256("admin")** — a one-time entry persists forever in `localStorage`.

The admin panel is in the awkward middle: too sophisticated to discard, too lossy to rely on for production data stewardship. Recommendation: lock the **review-queue UX as the canonical workflow** post-NVTB; **delete the in-place pipeline editor** in favour of agent-routed updates; **wire a real persistence backend** before the next agent run.

---

## 2. Findings

### [BLOCK] No persistence layer — "Save" downloads a JSON to operator's Downloads folder
- **Location:** `js/admin.js:491-519` (`saveFamilies` / `saveSystem` / `downloadJson`)
- **Scope:** Families editor · System Timeline editor · Export tab · Review-queue accepted-changes download
- **What:** Every "Save Changes" path ends in `downloadJson(data, filename)` with a `Blob` URL → anchor.click(), followed by a chat-message instruction *"Downloaded families-v2.json with edits. Replace the file in data/ and commit."* (line 498). The browser cannot write to the served file, so the operator's responsibility is: (a) find the freshly-downloaded JSON in `~/Downloads/`, (b) `mv` it over `data/families-v2.json`, (c) `git add` + `git commit` + `git push` to GitHub Pages, (d) wait for the deploy.
- **Why it matters:** This is the single biggest operator-experience defect. It guarantees:
  - No audit trail of *who* applied *which* change *when* — only `verification.verified_by = 'admin'` literal stamped client-side (review-queue.js:866).
  - No multi-operator coordination — two operators editing simultaneously will silently overwrite each other on the next push.
  - Review-queue verification metadata (`source_reliable`, `claim_attributed`) is buried in `localStorage` and **lost** when the operator clears site data or switches devices, **unless** they remember to download the `_verification_*` fields embedded in `familiesData`.
  - The five accepted-then-downloaded changes in a single session collapse into one `git commit` with no per-change attribution.
- **Recommendation:** Wire a Supabase Edge Function (`supabase/functions/admin-apply-update/index.ts`) authenticated by the same magic-link flow used in `gate.html`. Each update writes an append-only row to `cpr_admin_audit` with `{update_id, family, action, before, after, operator_email, applied_at, source_url, source_reliable, claim_attributed}`. Live data files can stay JSON in git, but the Edge Function commits via the GitHub API on accept (or batches into a daily PR for review).
- **Reference:** OneTrust regulatory-change module: every accept emits an audit row tied to the assessor identity. Carbon Design System "Audit log" pattern (https://carbondesignsystem.com/patterns/audit-log/).

---

### [BLOCK] System-Timeline edits are high-stakes but show no impact assessment
- **Location:** `js/admin.js:452-488` (`renderSystemEditor` + `handleNodeFieldChange` for `scope === 'sys'`)
- **Scope:** System Timeline tab
- **What:** The system-timeline holds shared milestone nodes (e.g. `sys-jtc24`, `sys-art-75-da`). Per `PLAN.md:31-35`: *"single source of truth for system-level milestones"*. Per the convergence formula (PLAN.md:158): *"DPP formula: max(Art.5(8)+12mo, Art.75(1)DA+18mo)"*. Editing one date here can shift the convergence DPP date for **all 37 families** that have `binding_constraint: system` — the operator gets zero visibility of this. The editor renders the same `renderNodeCard` UI as a per-family node, with no badge marking the system-level scope, no count of affected families, no preview of which families' DPP dates would change.
- **Why it matters:** The single highest-leverage change in the entire app — and it has the same low-friction UX as editing a single family's pipeline node. An accidental edit (e.g. typing in the wrong textarea) silently propagates to every family.
- **Recommendation:** Before save: render an "Impact preview" pane listing each family with `convergence.system_timeline_ref === <node_id>` and the before/after DPP date. Require an "I understand this affects N families" checkbox before enabling Save. Optionally add a separate password gate for system-timeline edits (over-engineered? OneTrust does it).
- **Reference:** Thomson Reuters Regulatory Intelligence (TRRI / CUBE) before/after impact diff. SAP S/4HANA "where-used" pattern for shared master data.

---

### [HIGH] Auth gate is a single localStorage flag — no logout, no expiry, no rate limit
- **Location:** `js/admin.js:15-106` (constants + `sha256` + `checkAuth` + `authenticate` + `showAdmin`)
- **Scope:** Auth gate
- **What:** `ADMIN_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'` is `sha256("admin")` (verifiable: this is a famous test-vector hash). On successful unlock: `localStorage.setItem(LS_AUTH_KEY, 'true')`. There is no logout button, no session timeout, no failed-attempt throttling, no audit of unlock attempts. `checkAuth()` (line 87) skips the password entirely if the localStorage flag is `'true'`.
- **Why it matters:**
  1. Once the gate is unlocked on a device, anyone with physical/RDP/screen-share access has admin forever.
  2. A `localStorage` flag has no integrity guarantee — `localStorage.setItem('cpr-admin-auth', 'true')` in DevTools console = bypass.
  3. The hash is a trivial test vector. Even raised to a stronger passphrase, the front-end is the only check.
  4. Brute-force is silent and unbounded.
  5. The gate provides zero defense for any change that lands in `data/families-v2.json` — that's a static fetch, no auth.
- **Recommendation:** Move admin auth to the same magic-link flow as `gate.html`, then sign each "apply update" request server-side. Add `Last login: …` and `Sign out` to the admin hero. For the demo/internal-tool tier (post-NVTB), a passphrase + 30-day cookie + logout button + 5-attempts/15-min throttle is the floor.
- **Reference:** Anthropic Console admin pattern; Carbon `LoggedOutNotification`.

---

### [HIGH] Save / Save / Save toolbar has no diff preview and no confirm
- **Location:** `js/admin.js:76` + `js/admin.js:85` (`saveFamiliesBtn` + `saveSystemBtn`)
- **Scope:** Families editor · System Timeline editor
- **What:** `Save Changes *` (asterisk = dirty marker) downloads the entire mutated dataset. No diff against the on-disk version, no list of touched families, no "X of Y nodes changed". The operator must trust the dirty flag and remember every edit they made in this session.
- **Why it matters:** Any accidental keystroke in a textarea (the content sections especially, where every textarea is `data-content-key` bound and writes on `input`, line 296-306) silently dirties the dataset. The operator has no chance to inspect what they're about to ship before clicking Save.
- **Recommendation:** Replace Save with a 2-step modal: "Review changes (3 families, 7 fields modified)" → list of `family.field: old → new` rows → "Confirm & Download". Better still, integrate with the persistence backend from finding 1 and apply atomically with rollback support.
- **Reference:** GitHub PR file-tree diff view; Carbon `StructuredList` for change manifests.

---

### [HIGH] Review-queue verification state lives only in localStorage and is lost on clear-site-data
- **Location:** `js/admin.js:596-602` (`saveQueue`) + `js/review-queue.js:838-855` (verification mutations)
- **Scope:** Review Queue → Updates
- **What:** Verification flags (`source_reliable`, `claim_attributed`, `verified_at`) are mutated on the queue object in memory then persisted via `LS_QUEUE_KEY` in localStorage. When the operator accepts an update, the verification stamp is propagated into `familiesData` as `_verification` on standards or `_content_verifications` on the family (review-queue.js:309-316, 360, 392-394) — but only if the operator clicks Accept. If they verify but don't accept (e.g. paused mid-session), the verification work is in localStorage only.
- **Why it matters:** The most expensive operator effort — actually opening EUR-Lex tabs and confirming a claim is supported by its source — is the most fragile to lose. Switching browsers, clearing site data, or working from a different device discards all verification work in flight.
- **Recommendation:** On every verification mutation, persist to the same backend as finding 1 (`cpr_admin_audit_pending` table). The operator can resume from any device.

---

### [HIGH] No agent-vs-human distinction surfaced after accept
- **Location:** `js/review-queue.js:306-316` (`vStamp` build) + `js/review-queue.js:392-394` (`_content_verifications` write) + `js/admin.js:269-272` (textarea render)
- **Scope:** Family editor · downstream tracker
- **What:** When an update is accepted, `_verification` gets stamped on the standard or `_content_verifications[key]` on the family, with `human_verified: true`. But the family editor in `admin.js` re-renders the content textareas (line 270-274) **without showing whether the value was last set by the agent or by a human**. The operator cannot distinguish "agent guess that was accepted unverified" from "agent guess that was verified against source by Yvo".
- **Why it matters:** This collapses the central trust gradient the review-queue worked so hard to establish. Once data lands in `families-v2.json`, the provenance is invisible. The next operator (or the next agent run) treats agent-guesses and human-verified facts as equally authoritative.
- **Recommendation:** Render a verification badge next to every editable field in the family editor: 🟢 verified by Yvo on YYYY-MM-DD against `<source>`, 🟡 agent-proposed accepted without verification, ⚪ never reviewed. Build the same overlay into the public tracker (toggle "show provenance"). This is the OneTrust trust-gradient pattern.

---

### [HIGH] Notes tab is a stale localStorage scratch-pad with no portability
- **Location:** `js/admin.js:657-691` + `admin.html:115-127` (`#panelNotes`)
- **Scope:** Notes tab
- **What:** *"Scratch pad for agent interactions. Stored locally in your browser."* Heuristic agent-detection (`text.indexOf('## ') === 0 || text.indexOf('### ') !== -1 || text.indexOf('**') !== -1`, line 686) bucks messages into `chat-msg--agent` / `chat-msg--user` styles. No export, no search, no link to a backlog item, no link to a queue update. Per `LS_CHAT_KEY` (line 17), it's per-browser only.
- **Why it matters:** Either it's the operator's primary scratchpad (in which case it must export and survive device switches) or it's vestigial (in which case it crowds the tab strip). Right now it's neither — it's an under-built journal that the operator probably ignores.
- **Recommendation:** Either delete the tab post-NVTB, or promote it to a real "Operator log" backed by the persistence layer (finding 1) with one-line free-form notes timestamped + per-update annotations linked to queue items.

---

### [HIGH] Data-health "issues" tables list problems but offer zero action affordance
- **Location:** `js/data-health.js:432-462` (`renderDimensionCard`) + `js/data-health.js:464-491` (`renderFamilyTable`)
- **Scope:** Data Health tab
- **What:** Each dimension card collapses into an issues table with `Family | Check | Issue` columns (e.g. `SHA | content.about | Empty or placeholder`). The per-family table sorts worst-first. But there is **no link** from any issue row to the family editor; **no "fix this" button**; **no batch action** ("export top-20 issues for the agent to draft updates"); **no integration** with the review-queue. The operator reads the list, then has to manually navigate to Families tab → select dropdown → find the family → find the offending field. For 50+ issues per dimension, this is the most expensive part of the workflow.
- **Why it matters:** The dashboard's value depends on the action loop closing. Without it, the dashboard becomes a slowly-degrading vanity number ("data health: 72%") and operators stop checking it.
- **Recommendation:** Each issue row → a button linking to the family editor with the field auto-scrolled-to and highlighted. A batch action: "Export top-50 issues as agent prompt" generates a markdown briefing the cpr-expert agent can ingest. Carbon `EmptyState` with primary action.

---

### [MEDIUM] dashboard.html `escHtml()` is missing `"` and `'` replacements
- **Location:** `dashboard.html:502-504`
- **Scope:** `dashboard.html` (the unlinked data-integrity heatmap, see finding below)
- **What:**
  ```js
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  ```
  Compare to `js/admin.js:711-717` (textContent round-trip — safest), `js/data-health.js:36`, `js/content-renderer.js:45-52`, `js/dpp-info.js:10-13` — all five escape `"` (and content-renderer.js uses the canonical 5-char). The dashboard variant is the only inconsistent one in the codebase.
- **Why it matters:** Currently safe-by-accident — every call site (`dashboard.html:521-526`) uses `escHtml(...)` between `<td>` body content, never inside an attribute. **But:** lines 362, 439, 441 interpolate `f.letter` / `r.letter` / `r.name` **completely raw** into HTML — no escape function at all. If a rogue agent-generated `families-v2.json` ever lands a malicious `display_name`, it executes here. `data/families-v2.json` is admin-controlled (low source-of-injection risk), but defense-in-depth says the heatmap should match the rest of the codebase's discipline.
- **Recommendation:** Replace dashboard.html's `escHtml` with the canonical 5-char version and use it on every interpolation, including letter/name. Or move the dashboard logic into a shared module that imports `content-renderer.js`'s `esc`.

---

### [MEDIUM] dashboard.html is unlinked from main UI
- **Location:** `dashboard.html` (590 LOC) — referenced only via `admin.html:161` footer link to `index.html` and indirectly via direct URL.
- **Scope:** Discoverability
- **What:** A 590-line custom data-integrity dashboard with summary cards, completeness heatmap, count-integrity table with sortable cols + per-family row-expansion + raw-JSON toggle — and the only path to reach it is to type `dashboard.html` into the URL bar. The admin panel embeds a *different* data-health dashboard (`js/data-health.js` rendered into the `health` tab) that does similar but not identical work.
- **Why it matters:** This is a real operator-experience defect: two parallel data-health UIs with overlapping but inconsistent functionality. The dashboard.html count-integrity check (Actual vs Range vs Summary hEN/EAD counts) is **not** in `data-health.js`. The data-health.js 5-dimension scoring is **not** in dashboard.html.
- **Recommendation:** Pick one. Either fold dashboard.html's count-integrity check into `data-health.js` as a sixth dimension and delete `dashboard.html`, or repurpose dashboard.html as the "deep-dive" view linked from the admin Data Health tab. The two-UI status quo is worst-of-both.

---

### [MEDIUM] dpp-info.js is dead code that retains an unsafe innerHTML pattern
- **Location:** `js/dpp-info.js:22` (`popup.innerHTML = btn.getAttribute('data-info');`)
- **Scope:** Public tracker (was) — now orphan
- **What:** `grep -rn "data-info\|buildHenDppInfo\|buildEadDppInfo"` across `js/` returns hits in `dpp-info.js` itself plus `cpr-pdf.js` (which has its own text-only variants `_buildHenDppInfoText`). No HTML or JS sets the `data-info` attribute. No HTML or JS calls `window.buildHenDppInfo` / `window.buildEadDppInfo`. The module is loaded (presumably from `index.html`) but does nothing user-visible. The 2026-04-23 cleanup commit message mentions *"dpp-info.js: escape data-info attribute values (XSS defense)"* — that escape lives in the build functions themselves (the `esc()` calls in `buildHenDppInfo`), but `popup.innerHTML = btn.getAttribute(...)` remains a sink that depends on every caller pre-escaping.
- **Why it matters:** Unused code that accepts attribute-supplied HTML and inserts it via `innerHTML` is a future-XSS waiting to happen. Anyone who adds a new caller (or inadvertently sets `data-info` on a `.cpr-dpp-info-btn`) bypasses every other defense in the codebase.
- **Recommendation:** Either delete `js/dpp-info.js` entirely (it has no live callers) or replace the `popup.innerHTML = …` line with a structured DOM-builder. If kept, the build functions should return DocumentFragments, not HTML strings.

---

### [MEDIUM] No CSP on admin.html or dashboard.html
- **Location:** `admin.html` head · `dashboard.html` head
- **Scope:** All admin/dashboard surfaces
- **What:** Neither file sets `Content-Security-Policy`. Inline `<script>` blocks (e.g. dashboard.html lines 5, 249) work without nonces. Image sources (`Images/...`) are unrestricted.
- **Why it matters:** The escape functions across the codebase are competent, but they are the only line of defense. A single missed escape becomes XSS execution. CSP is the cheap second wall.
- **Recommendation:** Add `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://uemspezaqxmkhenimwuf.supabase.co; frame-ancestors 'none'">` to admin.html, dashboard.html, gate.html, invoice.html. Inline scripts (HTTPS-redirect snippet line 5) need a nonce.
- **Reference:** OWASP A03:2021 Injection. Defense-in-depth.

---

### [MEDIUM] Review-queue has no bulk-accept / batch-confirm for high-confidence updates
- **Location:** `js/review-queue.js:629-826` (`renderUpdateWizard` + `handleWizardAction`)
- **Scope:** Review Queue → Updates
- **What:** Each card requires individual Accept clicks. For the live `data/review-queue.json` (9 updates against SHA family from one Implementing Decision), accepting all 9 means: click Accept → toast → auto-advance → click Verify Source Yes → click Verify Claim Yes → click Accept → repeat 9 times. There is no "Accept all cards from this source", no "Accept all updates with confidence: high AND source matches X".
- **Why it matters:** Real-world batches of regulatory updates from a single Implementing Decision can run to dozens of standards. The per-card flow is tuned for "first-pass review" but there is no "trust this batch" affordance for verified-source-of-truth bulk loads (e.g. EUR-Lex official OJ-citations).
- **Recommendation:** Add a "Bulk actions" bar above the wizard: "Accept all 9 updates from EUR-Lex Implementing Decision 2026/284" with one-click verify+accept for the entire group. Group by `source` field. Keep the per-card flow for low-confidence updates.

---

### [MEDIUM] formatValue truncates at 297 chars without ellipsis indication of structure
- **Location:** `js/review-queue.js:479-487`
- **Scope:** Review Queue → Updates → Values diff
- **What:** When `proposed_value` is an object (e.g. an entire new standard JSON, ~600 chars typical per the live review-queue.json), it's `JSON.stringify`'d then truncated at 297 chars + `...`. The operator sees a partial JSON that may be missing the most important field (e.g. `notes:` field showing "Cited under CPR 305/2011 — DPP does NOT apply." gets cut mid-sentence).
- **Why it matters:** The operator's job is to verify the proposed value. Hiding fields silently undermines the whole purpose.
- **Recommendation:** Render the diff as a syntax-highlighted scrollable JSON block (no truncation), with a "fields changed" summary on top. Use a JSON-diff library (e.g. https://github.com/josdejong/jsondiffpatch — MIT — passes dependency framework).

---

### [LOW] Toast container is admin-content-scoped — toasts vanish if operator switches tabs mid-action
- **Location:** `admin.html:157` (`#rqToastContainer`) + `js/review-queue.js:551-565` (`showToast`)
- **Scope:** Cross-tab notifications
- **What:** Toasts render into `#rqToastContainer` which lives inside `#adminContent`. When the operator switches tab (e.g. accepts an update on Review Queue then immediately clicks Families to verify), the toast container scrolls off-screen but the toast itself stays in the DOM for 3s.
- **Why it matters:** Operator may not see confirmation of an action that happened "away from where they're now looking".
- **Recommendation:** Move the toast container to `position: fixed; bottom: 24px; right: 24px; z-index: 9999;` with a stacking layout. Carbon `Toast` pattern.

---

### [LOW] Empty / loading / error states are inconsistent
- **Location:** `js/admin.js:140` ("Error loading data: ...") · `js/data-health.js:500` (`<p>No family data loaded.</p>`) · `js/review-queue.js:625-629` (`admin-empty` styled component)
- **Scope:** All tabs
- **What:** Three different patterns for "no data" / "loading" / "error":
  1. Plain text in the meta header (`dataMeta.textContent = 'Error loading data: ' + e.message`)
  2. Single `<p>` (data-health "No family data loaded")
  3. Styled `admin-empty` class with title + body (review-queue empty state)
- **Why it matters:** Carbon Design System explicitly identifies empty/error/loading consistency as a marker of UI maturity. Inconsistency reads as "not finished".
- **Recommendation:** Adopt the `admin-empty` pattern from review-queue everywhere. Add a single `loadingState(msg)` / `errorState(err, retry)` helper in admin.js. Loading spinners (CSS keyframes) for fetch operations >300ms.
- **Reference:** Carbon `EmptyState` / `Loading` (https://carbondesignsystem.com/patterns/empty-state-pattern/).

---

### [LOW] Invoice flow is purely public-facing — no operator access path
- **Location:** `invoice.html` + `js/invoice.js`
- **Scope:** Public buyer experience post-purchase
- **What:** `invoice.html` is the customer's invoice view, accessed via `?order_id=<uuid>&email=<addr>` after Mollie checkout. It hits `verify-report-access` Edge Function (line 46) and renders the BTW-21% invoice from `data` returned. **There is no admin-side counterpart**: no `admin.html` view of "all invoices issued", "revenue this month", "orders pending fulfillment", "buyer mismatch attempts".
- **Why it matters:** Operator (Yvo) has zero visibility into the report-sales side from the admin panel. Tax/accounting workflow happens elsewhere (Exact Online per memory), but a basic "today's orders" count belongs on the admin hero.
- **Recommendation:** Add an "Orders" tab (or a meta strip on the admin hero) showing `N orders today · N this month · €X revenue (excl BTW) this month`. Backed by a new `verify-admin-orders` Edge Function gated by the same admin auth.

---

### [LOW] Invoice ID generator uses page-load year, not order year
- **Location:** `js/invoice.js:91-94`
- **Scope:** Invoice rendering
- **What:** `formatInvoiceNumber` uses `new Date().getFullYear()` — the year the invoice page is loaded, not the year the invoice was issued. An invoice viewed in 2027 for an order placed in 2026 shows `RS-2027-0042-CPR-Report`.
- **Why it matters:** Bookkeeping. Dutch BTW filings reference invoices by ID — the year-shift breaks the audit chain.
- **Recommendation:** Use the year extracted from `data.created_at` (already passed to `renderInvoice`).

---

### [NOTE] PLAN.md flags Sprint 4 admin redesign as "deferred"
- **Location:** `PLAN.md:138-139`
- **Scope:** Roadmap honesty
- **What:** *"Sprint 4: Comparison + Source Layer + Admin v2 + Polish — partial. comparison.js, source-layer.js — shipped. Admin panel redesign, mobile polish — deferred."*
- **Why it matters:** The current admin.html is explicitly known to be the unfinished v1, not the intended v2. This audit's findings should feed directly into the deferred Sprint 4 admin v2 work.
- **Recommendation:** Treat findings 1-7 as the Sprint 4 admin-v2 backlog. Findings 8-15 as Sprint 4 polish.

---

### [NOTE] Strong: agent vs human distinction in review-queue verification flow
- **Location:** `js/review-queue.js:717-764` (verification UI block)
- **Scope:** Review Queue → Updates
- **What:** Two-axis verification (`Is this source reliable and authoritative?` × `Does the source support the proposed change?`) is the single best operator-experience pattern in the codebase. It directly addresses the "agent guess vs verified fact" question the audit prompt asks. The Accept button is disabled unless `claim_attributed === true` for non-noop updates with sources (line 776, 783). Verification stamps survive into the data via `_verification` on standards (line 327, 360) and `_content_verifications` on families (line 393).
- **Why it matters:** This is the trust-gradient affordance OneTrust charges five figures per seat for. It belongs in the post-NVTB strategy as the canonical pattern.
- **Recommendation:** Lock this UX as the gold-standard. Propagate the `_verification` metadata into the public tracker as a "verified by Yvo against EUR-Lex on YYYY-MM-DD" hover badge — turns the flag from a private workflow artifact into a public trust signal.

---

## 3. Scorecard

| Item | Score | Evidence | Anchor |
|---|:-:|---|---|
| Review-queue acceptance flow | **2** | Two-axis verify gate, accept disabled until claim_attributed, undo metadata, auto-advance | `js/review-queue.js:629-944` |
| Family editor ergonomics | **1** | Pipeline-aware editor with cert/status dropdowns + content textareas; no diff preview, no per-field undo | `js/admin.js:207-307`, finding 4 |
| System-timeline editor | **0** | Same UI as per-family editor, zero impact assessment for changes that affect 37 families | `js/admin.js:452-488`, finding 2 |
| Data-health heatmap (`dashboard.html`) | **1** | Correctly identifies hEN/EAD count mismatches across 3 storage locations; legible heatmap; **unlinked from main UI**, no action affordance | `dashboard.html:421-499`, findings 8, 9 |
| Data-health heatmap (`js/data-health.js`) | **1** | Strong 5-dimension weighted scoring, worst-first family ranking; no action loop from issue → fix | `js/data-health.js:494-588`, finding 8 |
| Error / empty / loading states | **1** | Inconsistent — three different patterns across modules | finding 16 |
| Password gate UX | **0** | sha256("admin"), no logout, no expiry, no rate limit, localStorage-only | `js/admin.js:15-106`, finding 3 |
| Data export | **2** | Clean three-card export (families / system / sources), `downloadJson` works | `js/admin.js:521-535` |
| Audit trail | **0** | Only `verified_by: 'admin'` literal stamped client-side; no server-side log | `js/review-queue.js:866`, finding 1 |
| Impact assessment | **0** | Zero — system-timeline edits silently propagate to all 37 families | finding 2 |
| Notes tab | **0** | Local-only scratchpad with regex-based agent detection, no integration | `js/admin.js:657-691`, finding 7 |
| Invoice flow | **1** | Public buyer flow works; no operator counterpart, year-bug | `js/invoice.js`, findings 18, 19 |
| XSS hardening verification | **1** | Admin-edit surface clean; dashboard.html escHtml inconsistent + raw interpolation; dpp-info.js orphan with unsafe innerHTML | findings 10, 12 |

**Total:** 12 / 26 — competent foundation, but operator workflow has structural gaps the cosmetic 2026-04-23 cleanup didn't reach.

---

## 4. Operator-experience redesign sketch (post-NVTB)

The current admin panel optimises for **direct edit of static JSON**. A regulatory-intelligence platform needs to optimise for **review of agent-proposed changes with full provenance**. The shift is structural, not cosmetic.

### Phase 1 — Foundation: persistence + audit chain

1. **Supabase Edge Function `cpr-admin-apply`** — writes accepted updates atomically to a `cpr_admin_audit` append-only table AND opens a single-commit PR against the static JSON files in the repo. Authenticates via the same magic-link flow as `gate.html`.
2. **Replace localStorage auth with magic-link auth + 12-hour session** — cookie + logout button + per-session audit row.
3. **Move review-queue verification state to Supabase** — operator can pause a review on Mac, resume on iPad. The `_verification` metadata propagates into both the audit table AND the JSON file.

### Phase 2 — Workflow: review-first, not edit-first

4. **Demote the Families editor to a read-only "current state" viewer.** Direct-edit becomes an agent task: operator clicks "Request agent update for SHA → content.about" and the request flows back into the review queue with the agent's draft.
5. **Promote the review queue to the default tab.** It opens with a count badge of pending updates and auto-loads `data/review-queue.json`.
6. **Add a bulk-action bar** — "Accept all 9 updates from EUR-Lex Implementing Decision 2026/284" for high-trust batches. (Finding 13.)
7. **Verification badges propagate to the public tracker** as a "verified by Yvo against EUR-Lex on YYYY-MM-DD" hover affordance. The trust gradient becomes a public differentiator.

### Phase 3 — Stewardship: data-health as an action loop

8. **Merge `dashboard.html` and `js/data-health.js`** into a single 6-dimension health view: completeness, consistency, source coverage, timeliness, validity, **count integrity** (the dashboard.html-specific check). One canonical surface.
9. **Every issue row gets a "Fix this" button** that either jumps to the field (read-only viewer) or generates an agent-task ("draft an update for SHA.content.about — currently empty") and queues it.
10. **Weekly health digest emailed to operator** via a `cpr-health-digest` cron. The dashboard becomes anchored in a workflow, not a vanity number.

### Phase 4 — Stakes proportionate UX: system-timeline edits

11. **Separate the system-timeline editor** into its own page (not a tab) with its own auth gate (or a "confirm with passphrase" modal on save).
12. **Impact-preview pane** before save — list of affected families with before/after DPP dates. Required acknowledgment.
13. **System-timeline changes always go through the review queue**, never direct-edit. The operator can submit a change request, but actual mutation requires a 24-hour cooldown and a second confirm.

---

## 5. Top-3 strategic recommendations

### 1. Wire a real persistence + audit backend before the next agent run

No amount of UX polish substitutes for operator-experience grounded in a server-side audit chain. The current download-and-commit workflow is the load-bearing flaw — it turns every accepted update into a manual-process risk and erases per-update attribution. Build `cpr-admin-apply` Edge Function + `cpr_admin_audit` table + magic-link auth as the foundation; everything else (impact assessment, verification propagation, bulk actions) becomes feasible on top. Cost: ~2 days of focused work, eliminates findings 1, 3, 5, 9 and the audit-trail Score-0.

### 2. Lock the review-queue verification UX as the post-NVTB canonical pattern

The two-axis verify gate (source reliable × claim attributed) and the auto-disabled Accept button are the strongest operator-experience patterns in the codebase. They are also the single most differentiated thing the tracker offers vs. competitors (OneTrust charges enterprise prices for a similar gradient). Propagate verification metadata into the public tracker as visible badges — turns the private workflow artifact into the product's trust signal. The redesign should not weaken or rebuild this; it should expose more of it.

### 3. Demote direct-edit; collapse the two data-health UIs; treat system-timeline as a special case

Three separate cleanups, one strategic theme: the admin panel should not optimise for "edit any field directly" — that's a leftover from the v1 days when the only pipeline was "Yvo writes JSON". Now that the cpr-expert agent owns the proposal pipeline, the operator's job is review-with-provenance. (a) Make Families read-only and route edits through the review queue. (b) Merge dashboard.html and data-health.js into one 6-dimension dashboard with action affordances. (c) Build a separate system-timeline workflow with impact preview and elevated confirmation. These three together turn the admin from "data-entry tool" into "regulatory-intelligence operator console" — which is what the redesign brief actually wants.

---

*End of report. Cited line numbers verified against files at audit time. No code modified.*
