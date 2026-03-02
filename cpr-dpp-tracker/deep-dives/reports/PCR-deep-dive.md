# PCR — Precast Concrete Products: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-27)
**Family**: Annex VII #1 · PCR

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Precast normal/lightweight/autoclaved aerated concrete products |
| Letter | PCR |
| Annex VII # | 1 |
| TC | CEN/TC 229 (precast concrete), CEN/TC 177 (lightweight/AAC) |
| Standards tracked | 4 (all hEN) |
| Active pipelines | B (old-CPR fast-track) |
| Future pipelines | A (new-CPR hEN route) |
| DPP estimate | ~2030–2031 |
| SReq status | Draft (Feb 2026, CPR 305/2011) |
| AVCP | Decision 1999/94/EC (System 2+ structural, System 4 non-structural) |
| Last updated | 2026-02-22 |

---

## 2. Pipeline Status Review

### Pipeline B — Old-CPR Fast-Track (305/2011)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | complete | green | Confirmed — acquis complete | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | complete | green | Confirmed | No change | No change | S30, S1 |
| SReq (CPR 305/2011) | NT-4 | draft | yellow-green | Feedback deadline 3 Mar 2026 (today). Not yet adopted per public sources. Dual SReq reference unresolved (see §4). | No change yet | No change | S40, EC Notification System |
| CEN Standards Development | NT-5 | in_progress | amber | CEN WP 2025 still lists "M/XXX" — no formal mandate number. Delivery target Q4 2026 per SReq. prEN 12602 draft dated Jul 2025 confirmed. | No change | No change | S30, CEN WP 2025 |
| OJ Citation | NT-7 | pending | gray | No new OJ citations for PCR standards in 2026/284. EN 1520:2011 and EN 12602:2016 remain cited under old mandate M/100. | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change — awaiting new citations | No change | No change | S1 |
| hEN In Force (305/2011) | NT-9 | pending | gray | No change | No change | No change | S30, S1 |

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| New SReq (CPR 2024/3110) | NT-4 | not_started | gray | CEN WP 2025 lists "M/XXX" for PCR under new CPR. No timeline for new SReq issuance. | No change | No change | S30, CEN WP 2025 |
| CEN Standards Development | NT-5 | not_started | gray | Blocked on new SReq | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | No change | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | ~2030–2031 estimate unchanged | No change | No change | S30, S1 |

**Summary**: No pipeline node status changes identified for PCR. The SReq deadline (3 Mar 2026) is the key upcoming event — monitor for adoption.

---

## 3. Standards Landscape Update

| # | Standard ID | Type | TC | AVCP | Current Stage | Finding | Source |
|---|------------|------|----|----|--------------|---------|--------|
| 1 | EN 13369 (new) | hEN | CEN/TC 229 | 2+ | New standard, delivery Q4 2026 | CEN WP 2025 confirms TC 229 revising harmonised standards. No new stage data found publicly. Listed as Table 1 in SReq. | CEN WP 2025, SReq |
| 2 | EPD/PCR LW+AAC | hEN | CEN/TC 229 | — | New standard, delivery Q4 2026 | EPD PCR for lightweight and AAC. Table 1 in SReq. Not a product standard — no independent DPP trigger. | SReq |
| 3 | EN 1520 | hEN | CEN/TC 177 | 2+ | Revision, delivery Q4 2026 | Currently cited in OJ (EN 1520:2011). Listed as Table 2 in SReq for revision. No new public stage data. | EUR-Lex, SReq |
| 4 | EN 12602 | hEN | CEN/TC 177 | 2+ | Draft (prEN, Jul 2025) | prEN 12602 draft dated 24 Jul 2025 (BSI ref 25/30510163 DC) confirmed in tracker data. Currently cited in OJ (EN 12602:2016). Table 2 in SReq. | BSI, SReq |

**New standards found**: None
**Removed standards**: None
**Count verification**: 4 hENs tracked, 0 EADs. Consistent with dpp-range (ead_earliest: null, ead_latest: null). No hen_count field explicitly set in data — should be derived from standards[] length.

---

## 4. SReq Analysis Update

**CRITICAL FINDING**: The existing review-queue issue iss-003 flags two SReq references for PCR:
1. **C(2025)2125** (10 Apr 2025) — listed on ITB.pl as SReq for precast concrete under CPR 305/2011
2. **Feb 2026 draft** — EC Notification System shows draft SReq notified 4 Feb 2026, feedback deadline 3 Mar 2026

**Resolution attempt**: Web research did not resolve whether C(2025)2125 was an earlier draft version of the same SReq, a predecessor that was superseded, or a separate parallel request. The CEN WP 2025 still lists the mandate as "M/XXX" (no number assigned), suggesting CEN has not yet received the formal mandate regardless of which EC decision reference applies.

**Current status (as of 1 Mar 2026)**: The 3 Mar 2026 feedback deadline has not yet expired. No public confirmation of adoption found. The tracker's `draft` status remains correct.

**Action**: Monitor for adoption announcement after 3 Mar 2026. When adopted, update `sreq` to "Adopted", `milestones.sreq.status` to "adopted", and Pipeline B NT-4 status to "complete".

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Amends 2019/451 with 5 new hENs — none for PCR family (affects SHA and FIX only).
- No new implementing decisions affecting precast concrete found in 2026.
- EN 1520:2011 and EN 12602:2016 remain OJ-cited under old mandate M/100.

### CEN Work Programme
- CEN WP 2025 lists CEN/TC 229 as active, focused on revision of precast concrete harmonised standards.
- "M/XXX" label confirms no formal mandate number yet assigned.
- Delivery target Q4 2026 (30 Oct 2026 per SReq draft).

### EC Notification System
- Draft SReq notified 4 Feb 2026, feedback deadline 3 Mar 2026.
- Under CPR 305/2011 (old regulation) — separate HTS under CPR 2024/3110 needed for DPP.

### EOTA
- PCR has no Pipeline C. EOTA search found some precast-concrete-adjacent EADs (composite walls, wire loops, pile joints) but these are structural connection products, not precast concrete products per se. No missing Pipeline C identified.

---

## 6. Structural Issues Identified

| # | Severity | Type | Description | Action |
|---|----------|------|-------------|--------|
| 1 | info | empty_content | `content.stakeholder_notes` is empty | Low priority — consider adding note about CEN/TC 229 stakeholder engagement |
| 2 | info | empty_content | `content.key_risks` is empty | Consider adding: risk of SReq adoption delay; EN 13369 is non-harmonised reference standard |
| 3 | info | empty_content | `content.sources_summary` is empty | Add source summary listing SReq, CEN WP, EUR-Lex references |
| 4 | warning | stale_sreq | SReq feedback deadline 3 Mar 2026 — requires monitoring | Check weekly for adoption announcement |
| 5 | info | cross_family | Dual SReq reference (C(2025)2125 vs Feb 2026 draft) unresolved | Existing iss-003 covers this. No new resolution found. |
| 6 | info | content_data_disagreement | Pipeline A has no NT-2 or NT-3 nodes (Milestones I/III) even though acquis is complete | Milestones I/III apply to the product family, not per-pipeline. Pipeline A correctly starts from NT-4. No issue. |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No data changes required at this time. SReq status remains "draft" as feedback deadline has not yet passed. | — |

**Note**: The primary action item is monitoring the SReq adoption post-3 Mar 2026. No immediate data changes needed.

---

## 8. Content Section Updates

No content section updates proposed. The existing content accurately reflects the current state:
- `about`: Accurate description of product family scope
- `standards_landscape`: Correctly describes EN 1520:2011, EN 12602:2016, EN 13369:2023
- `standards_development`: prEN 12602 draft status confirmed
- `sreq_analysis`: Accurately describes acquis milestones, SReq draft, CPR 305/2011 basis
- `dpp_outlook`: ~2030–2031 range remains valid

Three empty sections (`stakeholder_notes`, `key_risks`, `sources_summary`) could be populated but this is a low-priority enhancement, not a correction.

---

## 9. Cross-Family Notes

- **CEN/TC 177**: Shared with other concrete product families. EN 1520 (lightweight aggregate) and EN 12602 (AAC) are developed by TC 177, not TC 229.
- **AVCP Decision 1999/94/EC**: Shared with other precast concrete products — ensure consistency if this decision is referenced by other families.
- **EN 13369**: This is a non-harmonised reference standard (no Annex ZA). It underpins all precast product standards but does not independently require CE marking.
- **Horizontal SReq for dangerous substances** (iss-004 in existing review-queue): Affects PCR along with all 37 families. CEN/TC 351 standards for dangerous substance release assessment.

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in B, 5 in A — 12 total)
- [x] All standards checked against sources (4/4 verified)
- [x] hen_count matches actual hEN count in standards[] (4 hENs, no explicit hen_count field — derived)
- [x] ead_count matches actual EAD count in standards[] (0 EADs, ead_earliest/latest both null)
- [x] DPP date consistent with convergence formula (max(~2030–2031, ~Q1-Q2 2029) = ~2030–2031)
- [x] No duplicate update IDs (no new updates proposed)
- [x] Content sections all non-empty or flagged (3 empty sections flagged as info-level issues)
- [x] Source citations present for all claims (all nodes have [S#] references)
- [x] Cross-family standards noted (TC 177 shared, EN 13369 reference standard)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Extended Deep-Dive Addendum

**Date**: 2026-03-01
**Research depth**: 7 targeted web searches + 2 follow-up page fetches
**Focus**: SReq adoption status, C(2025)2125 resolution, CEN/TC 229 work programme, GWP obligations, cross-regulatory

### New Findings

#### 1. SReq Still in Draft — No Adoption Found
As of 1 March 2026, no adoption announcement has been found for the PCR SReq. The feedback deadline was 3 March 2026. The tracker's `draft` status remains correct. Post-deadline monitoring is the appropriate action.

#### 2. C(2025)2125 — Still Unresolved
Extended search for C(2025)2125 produced no direct EUR-Lex hit. The document appears on ITB.pl as an SReq for precast concrete under CPR 305/2011 dated 10 April 2025, but its relationship to the February 2026 draft notified via the EC Notification System remains unclear. Possible explanations:
- C(2025)2125 was an initial draft that was superseded by the Feb 2026 notification
- C(2025)2125 covers a different sub-scope within precast concrete
- The Feb 2026 notification is the public consultation step for the same document

No resolution possible from public sources. Does not affect tracker accuracy (both point to the same pending SReq outcome).

#### 3. CEN/TC 229 Active — 2025 Focus Confirmed
CEN WP 2025 confirms CEN/TC 229 "Precast concrete products" is focused on revision of harmonised standards supporting the upcoming SReq. The work is "prepared based on the input from the CPR Acquis." EN 13369 confirmed as the common reference standard for all precast product standards — it provides shared structure and assessment criteria.

CEN/TC 177 (lightweight/AAC) status for prEN 12602 revision: no new stage information found publicly beyond the Jul 2025 draft (BSI ref 25/30510163 DC) already recorded.

#### 4. Product Group 1 Contains 24 Harmonised Standards
nlfnorm.cz lists 24 harmonised standards under product group 1 (precast concrete). The tracker tracks only 4 standards being actively revised/created under the SReq (EN 13369, EPD PCR, EN 1520, EN 12602). The remaining ~20 existing hENs (EN 1168, EN 12737, EN 12794, EN 12839, EN 13225, EN 14992, EN 15037 series, etc.) continue under old mandate M/100 and are not subject to the current SReq. This scoping is correct but worth documenting — when the new CPR SReq (Pipeline A) is issued, it will likely cover the full product group, significantly expanding the standards workload.

#### 5. GWP Declaration Obligation — PCR Among First Affected
Under new CPR 2024/3110, GWP declarations became mandatory from 8 January 2026 for products covered by existing OJ-cited harmonised standards. EN 1520:2011 and EN 12602:2016 are both OJ-cited under M/100. Precast concrete manufacturers using these standards must now include GWP in their Declarations of Performance. This creates an early compliance burden before the full DPP system is operational. Strong EPD infrastructure exists (EN 15804) which should ease the transition.

#### 6. Concrete as DPP Priority Category
Multiple sources confirm concrete (including precast) is listed among the priority categories for DPP implementation under new CPR. First DPP-related delegated acts expected mid-2026. This aligns with PCR's ~2030–2031 DPP estimate — the delegated acts will set the framework, but actual product-specific DPP requirements await new harmonised technical specifications.

#### 7. OJ Citations — No Changes
EN 1520:2011 and EN 12602:2016 remain cited under old mandate M/100. Implementation decisions (EU)2025/1769 and (EU)2025/871 referenced on nlfnorm.cz appear to relate to EAD updates in 2025, not PCR-specific hEN changes. No new OJ citations for precast concrete standards found.

### Updated Risk Assessment

| Risk | Initial | Extended | Change |
|------|---------|----------|--------|
| SReq adoption delay | Warning | Warning (unchanged) | Feedback deadline 3 Mar 2026 — monitoring required |
| GWP compliance burden | Not assessed | Medium | Mandatory from Jan 2026 for OJ-cited standards |
| Full product group SReq scope | Not assessed | Low | Future new-CPR SReq may cover all 24 hENs, not just 4 |

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 3 | iss-PCR-003 | info | regulatory_development | GWP declaration mandatory from 8 Jan 2026 for EN 1520 and EN 12602 manufacturers. Early compliance burden before DPP system. |

### Extended Quality Checklist

- [x] 7 targeted web searches completed
- [x] SReq status verified (still draft, feedback deadline 3 Mar 2026)
- [x] C(2025)2125 dual reference investigated (unresolved but non-blocking)
- [x] CEN/TC 229 and TC 177 work programmes checked
- [x] OJ citations verified (no changes)
- [x] Cross-regulatory environment assessed (GWP, DPP priority)
- [x] No pipeline node status changes needed
- [x] No data updates — findings are structural/contextual

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 4 targeted web searches across precast industry associations, EPD databases, GCCA ratings, circular economy pilots
**Sources**: BIBM, GCCA, One Click LCA, MPA Precast, Stubbe's Precast, UPB Group, ReCreate project, Concrete Centre, EPD Guide

### S1. BIBM Decarbonisation Pledge and DPP Readiness

**Sources**:
- BIBM Federation — URL: https://bibm.eu/
- BIBM Congress 2026 — URL: https://bibmcongress.com/bibm/
- BIBM Position Papers — URL: https://bibm.eu/document-centre/position-papers/

BIBM (Federation of the European Precast Concrete Industry) launched the **BIBM Decarbonisation Pledge** — industry commitment to fostering a sustainable and low-carbon society. BIBM Congress 2026 will address CPR implementation and DPP readiness. BIBM drives recognition of precast concrete as a sustainable material.

Under revised CPR, the DPP is integrated into the CE marking workflow. For precast concrete, this means GWP declarations under Annex II (a-d) are mandatory from 8 Jan 2026 (already confirmed in iss-PCR-003). DPP registry expected Jul 2026.

### S2. GCCA Low Carbon Ratings — Concrete (Including Precast)

**Sources**:
- GCCA Global Ratings for Concrete — URL: https://gccassociation.org/lcr-concrete/
- GCCA Concrete Definitions PDF (Jul 2025) — URL: https://gccassociation.org/wp-content/uploads/2025/07/GCCA_Concrete_Definitions_for_Low_Carbon_and_NearZeroPolicy_Digital.pdf
- GCCA EPD Tool blog on LCR — URL: https://gccaepd.org/blog/lcr
- UK adaptation — URL: https://www.thisisukconcrete.co.uk/getattachment/Resources/UK-Concrete-and-Cement-Roadmap-to-Beyond-Net-Zero/UK-adaptation-of-GCCA-Global-Ratings-for-Low-Carbon-and-Near-Zero-Concrete-Feb-2025.pdf.aspx

GCCA Global Ratings for Concrete (launched alongside cement LCR, Apr 2025): **Seven bands AA through G**, based on GWP (kg CO₂e/m³) cross-referenced with concrete strength (MPa). Band E = global reference threshold (e.g., 255 kg CO₂e/m³ for 20 MPa). Band AA = near-zero.

**Precast explicitly included**: Concrete product defined as "readymixed concrete and precast (factory made) concrete." Uses EN 15804+A2 methodology. UK adaptation published Feb 2025 allowing for national carbon accounting differences.

**PCR/DPP connection**: GCCA LCR for concrete provides the voluntary classification overlay that precast producers can reference alongside mandatory CPR GWP disclosure. When DPP carries GWP data, GCCA LCR provides market-recognized bands for differentiation.

### S3. Precast EPD Infrastructure — Growing but Uneven

**Sources**:
- Stubbe's Precast EPDs — URL: https://oneclicklca.com/en/resources/case-studies/stubbes-precast-epds-for-low-carbon-concrete
- UPB Group 25% carbon reduction — URL: https://oneclicklca.com/en/resources/case-studies/upb-group-cuts-embodied-carbon-by-25-in-precast-concrete-with-one-click-lca
- MPA Precast 6 new sector EPDs — URL: https://www.concretecentre.com/Performance-Sustainability/Circular-economy.aspx
- Heidelberg Materials concrete EPDs — URL: https://oneclicklca.com/en/resources/case-studies/heidelberg-materials-concrete-carbon-reduction

Precast EPD activity in 2025:
- **Stubbe's Precast**: Cut carbon emissions 14.6% while achieving third-party-verified EPDs via One Click LCA
- **UPB Group** (Baltic): Cut embodied carbon 25% in precast concrete using One Click LCA
- **MPA Precast/Masonry** (UK): Published **6 new sector EPDs** in 2025 — concrete blocks (3 densities), aircrete blocks, hollowcore flooring (200-225mm), precast prestressed T-beams (150mm). All via One Click LCA.
- **Heidelberg Materials**: Concrete-specific EPDs with accurate carbon reduction measurement

**PCR/DPP connection**: EPD infrastructure is growing — One Click LCA is emerging as the dominant tool for precast EPD generation. Sector-level EPDs (like MPA's) provide fallback generic data, but CPR DPP will favour product-specific EPDs from individual manufacturers.

### S4. ReCreate Project — Precast Concrete Reuse for Circular Economy

**Sources**:
- ReCreate project — URL: https://recreate-project.eu/
- CORDIS project 958200 — URL: https://cordis.europa.eu/project/id/958200
- EC Circular Cities — URL: https://circular-cities-and-regions.ec.europa.eu/support-materials/projects/recreate-reusing-precast-concrete-circular-economy

ReCreate (EU Horizon 2020, grant 958200): Demonstrates deconstruction of intact precast structural components from condemned buildings for reuse in new buildings. Real-life pilots across Europe. Developing **EPDs for reused precast concrete components** — LCA for component reuse. Energy and carbon savings: **93-98% reduction** vs virgin production when reusing intact precast components.

**PCR/DPP connection**: Reuse of precast concrete is uniquely suited to DPP — components have known performance data from original Declaration of Performance. DPP could carry original DoP data through reuse cycle. ReCreate is developing the EPD methodology for this pathway, which could integrate into future CPR DPP circular economy data fields.

### Supplementary Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 4 | iss-PCR-004 | info | dpp_readiness | GCCA LCR for concrete (incl. precast): 7-band AA-G classification launched Apr 2025. Provides voluntary carbon class overlay alongside mandatory CPR GWP disclosure. Uses EN 15804+A2. |
| 5 | iss-PCR-005 | info | circular_economy | ReCreate project (H2020, 958200): EPDs for reused precast concrete components under development. Reuse achieves 93-98% carbon reduction vs virgin. DPP could carry original DoP data through reuse cycles. |

### Supplementary Quality Checklist

- [x] BIBM decarbonisation pledge and DPP integration documented
- [x] GCCA LCR for concrete (incl. precast) thresholds and methodology sourced
- [x] Precast EPD activity in 2025 documented (Stubbe's, UPB, MPA, Heidelberg)
- [x] ReCreate precast reuse project and EPD methodology documented
- [x] All findings have explicit source URLs
- [x] All new issues have unique IDs (iss-PCR-004 through iss-PCR-005)
