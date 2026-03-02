# LAD — Attached Ladders: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-22)
**Family**: Annex VII #36 · LAD
**Batch**: 9 (Curtain/Wood/Ladders)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Attached ladders |
| Letter | LAD |
| Annex VII # | 36 |
| TC | CEN/TC 128 (existing) |
| Standards tracked | 3 (3 hEN + 0 EAD) |
| Active pipelines | A (new-CPR hEN route) |
| Future pipelines | None |
| DPP estimate | ~2031–2032 |
| Acquis | No |
| SReq status | Not started — within KAS per COM(2025) 772 |
| AVCP | System 3 (all 3 hENs) |
| Last updated | 2026-02-22 |

**Key context**: LAD is a **new product family** introduced in CPR 2024/3110 (Annex VII #36). It did not exist under the old CPR 305/2011. The family covers permanently attached ladders, walkways, treads, and safety hooks fixed to buildings. The 3 hENs currently tracked (EN 12951, EN 516, EN 517) are presently cited under product family 22 (Roof Coverings / ROC) and may be reclassified to family 36 under the new CPR. No dedicated TC exists — standards are under CEN/TC 128 (Roof covering products and building waterproofing), the same TC as ROC. Per COM(2025) 772, family 36 milestones are handled within family 34 (KAS) — all milestone fields are empty.

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | not_started | gray | Correct — no independent M-I, handled within KAS. KAS M-I is Q2 2026. | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | not_started | gray | Correct — no independent M-III | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | gray | Correct — no independent SReq date | No change | No change | S30 |
| CEN Standards Development | NT-5 | not_started | gray | Correct — no standards development underway | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | 3 hENs currently cited under ROC family 22. No new citations for family 36 specifically. | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | ~2031–2032 estimate | No change | No change | S30, S1 |

**Pipeline verdict**: All 7 nodes accurate. Gray certainty across all nodes is appropriate given no independent timeline data. No Pipeline C (0 EADs).

---

## 3. Standards Landscape Update

### hENs (3)

All 3 hENs are currently cited under CPR 305/2011, Implementing Decision (EU) 2019/451, under product family 22 (ROC). Under CPR 2024/3110, they may be reclassified to family 36. All are AVCP System 3 and under CEN/TC 128.

| Standard | Name | AVCP | Current Family | Status |
|----------|------|------|---------------|--------|
| EN 12951:2004 | Fixed roof ladders — Product specifications and test methods | 3 | 22 (ROC) | Cited |
| EN 516:2006 | Prefabricated accessories for roofing — Roof access walkways, treads and steps | 3 | 22 (ROC) | Cited |
| EN 517:2006 | Prefabricated accessories for roofing — Roof safety hooks | 3 | 22 (ROC) | Cited |

### EADs (0)

No EADs. All products use the hEN route exclusively.

### Standards Gap

**Critical observation**: EN 12951 covers only roof ladders on pitched roofs. Family 36's broader scope under CPR 2024/3110 includes facade ladders, utility access ladders, caged/uncaged maintenance access ladders, and fixed ladders in utility shafts. These product types have **no existing harmonised standards**. New standards will need to be developed — likely via CEN mandate rather than EOTA EAD route.

### Related Non-CPR Standards

- EN ISO 14122-4:2016 — Fixed ladders for machinery (Machinery Regulation, not CPR)
- EN 353-1:2014+A1:2017 — Guided fall arresters on fixed ladders (PPE Regulation, not CPR)

### New/Changed Standards

No new standards or EADs found for LAD in 2025–2026.

**Count verification**: 3 hENs + 0 EADs = 3 total.

---

## 4. SReq Analysis Update

**Status**: Not yet adopted. No independent milestone data.

Key facts:
- Family 36 is handled within family 34 (KAS) per COM(2025) 772
- KAS milestones: M-I Q2 2026, M-III Q2 2027, SReq 2027
- Table 3 notes KAS "may be divided in several workstreams" — ladders could follow a separate timeline from KAS's main EOTA-based track
- No dedicated TC — uses existing CEN/TC 128 (shared with ROC)
- The content.sreq_analysis field correctly describes this dependency

**No change to tracker data**: SReq status correctly recorded.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Does NOT affect LAD
- No new implementing decisions for attached ladders found in 2025–2026

### CEN Work Programme
- CEN/TC 128 (Roof covering products): Active. No specific ladder-related revision projects found.
- EN 12951:2004, EN 516:2006, EN 517:2006 are all aging standards (18–22 years old) — revision will likely be required.

### EOTA
- No EADs for LAD — not applicable

---

## 6. Structural Issues Identified

| # | ID | Severity | Type | Description | Action |
|---|----|----------|------|-------------|--------|
| 1 | iss-LAD-001 | info | empty_content | 3 content sections empty: standards_landscape, standards_development, key_risks, sources_summary | Populate with content |
| 2 | iss-LAD-002 | warning | cross_family | 3 hENs currently cited under ROC (family 22), not LAD (family 36). Reclassification is mentioned in content but not reflected in standards[] data (no "current_family" field). | Consider adding a field to flag standards pending reclassification from ROC to LAD |
| 3 | iss-LAD-003 | info | cross_family | LAD milestones dependent on KAS (family 34). KAS M-I Q2 2026 is imminent. If KAS workstreams split, LAD may get independent milestones. | Monitor KAS M-I outcome for LAD implications |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No pipeline or standards data changes needed. | — |

---

## 8. Content Section Updates

### content.key_risks (currently empty)
**Proposed**: "1) Standards gap: EN 12951 covers only roof ladders on pitched roofs. Family 36's broader scope (facade ladders, utility access ladders, caged ladders) has no existing harmonised standards. New standards will need to be developed. 2) No dedicated TC — uses CEN/TC 128 (ROC), creating potential resource contention with roof covering standards work. 3) Family 36 handled within KAS (family 34) — if KAS workstreams do not split, ladders may be delayed by more complex KAS product categories (ETICS, prefab). 4) Aging standards: EN 12951:2004, EN 516:2006, EN 517:2006 are 18–22 years old and will require significant revision."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110. S143: nlfnorm.cz harmonised standards database."

---

## 9. Cross-Family Notes

- **ROC (family 22) → LAD (family 36)**: 3 hENs (EN 12951, EN 516, EN 517) currently under ROC, pending reclassification to LAD under CPR 2024/3110.
- **KAS (family 34)**: LAD milestones handled within KAS per COM(2025) 772. KAS M-I Q2 2026 will determine whether LAD gets independent milestones.
- **CEN/TC 128**: Shared with ROC. TC workload includes both roofing and ladder standards.
- **New family**: LAD is one of the new product families created by CPR 2024/3110 (family numbers above 33 in Annex VII). Similar new families include some within KAS scope.

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in A — 7 total, no Pipeline C)
- [x] All standards checked against sources (3/3 verified)
- [x] hen_count matches actual hEN count in standards[] (3 hENs)
- [x] ead_count matches actual EAD count in standards[] (0 EADs)
- [x] DPP date consistent with convergence formula (max(Product ~2031–2032, System ~Q1-Q2 2029) = ~2031–2032)
- [x] No duplicate update IDs
- [x] Content sections all non-empty or flagged (3 empty sections flagged)
- [x] Source citations present for all claims
- [x] Cross-family standards noted (ROC reclassification, KAS dependency, CEN/TC 128 sharing)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across fixed ladder market, EN 517 roof safety hooks, fall-from-height regulation, ZARGES manufacturer, EN 516 walkway products, and CEN/TC 128 work programme
**Scope**: European fixed ladder/roof access market, EPD coverage for roof safety products, EU fall-from-height regulation (Directive 2001/45/EC), manufacturer landscape (ZARGES, Kee Safety, MSA), EN 516 walkway treads, CEN/TC 128 business plan

### S1. Fixed Ladder Market — Niche Segment, ZARGES Europe's Leading Manufacturer, No Specific Market Sizing Found

No specific market sizing found for the fixed attached ladder / roof access product segment in Europe — this is a niche within the broader fall protection and roofing accessories market. ZARGES (Germany, founded 1930s) is Europe's leading fixed ladder manufacturer — offering aluminium, galvanised steel, and stainless steel modular systems with 10-year warranty. Key competitors: Kee Safety (Kee Walk walkways), MSA Safety (WalkSafe systems), Layher, Hailo. Products range from simple roof ladders to multi-section caged ladder systems for industrial/commercial buildings. Materials: primarily aluminium and galvanised steel. For DPP: the small size and niche nature of this product family means DPP infrastructure costs may be disproportionately high for manufacturers.

**Source**: ZARGES fixed ladders (https://www.zarges.com/uk/fixed-vertical-ladders/); Kee Safety (https://www.keesafety.com/platforms-walkways/kee-walk-rooftop-walkway); MSA WalkSafe (https://us.msasafety.com/c/WalkSafe%C2%AE-Roof-Walkway-System/p/000460001400001001)

### S2. No EPDs Found for Roof Safety Products — Metal Components Likely to Inherit Aluminium/Steel Sector EPDs

No specific EPDs were found for fixed roof ladders (EN 12951), roof safety hooks (EN 517), or roof walkways (EN 516). The product category appears to have zero EPD coverage. However, these are predominantly metal products (aluminium, galvanised steel, stainless steel) — they could potentially inherit environmental data from the aluminium or steel sector EPDs published by European Aluminium or similar bodies. ZARGES products conform to EN 14122-4 (machinery directive fixed ladders) rather than EN 12951 specifically. For DPP: EPD infrastructure will need to be built from scratch for LAD products, though material-level data from metal sector EPDs could provide a starting point.

**Source**: European Aluminium EPD resources (https://european-aluminium.eu/); ZARGES standards (https://www.zarges.com/uk/fixedladders/)

### S3. EU Directive 2001/45/EC Governs Work at Height — Ladders as "Last Resort", Safety Requirements Drive Product Specification

EU Directive 2001/45/EC (amending Directive 89/655/EEC) establishes minimum safety requirements for work at height, including ladder use. Key principle: ladders may only be used as workstations when "other, safer work equipment is not justified because of the low level of risk." This creates regulatory pressure toward more sophisticated access systems (scaffolding, platform hoists) over simple ladders. For attached ladders: permanent installations on buildings must provide secure handholds and support. Collective fall protection (guardrails, safety nets) takes precedence over individual protection (harness + anchor). BS 6037 covers inspection regimes for permanently installed access systems. For DPP: work-at-height regulatory context means LAD products have inherent safety-critical status — DPP performance declarations for load-bearing capacity and fall arrest capability are likely essential characteristics.

**Source**: EUR-Lex Directive 2001/45/EC (https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32001L0045); UK Working at Height Regulations 2005 (https://www.eurosafeuk.com/knowledge/blogs/working-height-regulations-2005)

### S4. EN 517 Roof Safety Hooks — Load-Bearing Capacity Tests, Materials Specification, CE Marking Mandatory

EN 517:2006 specifies requirements for prefabricated roof safety hooks — attachment points for slaters' ladders, working platforms, and personal fall protection equipment on pitched roofs. Standard covers: materials, load-bearing capacity of hooks and their fastening systems, dimensional requirements, and extent of testing. CE marking mandatory for placing on EU market. Product classes based on loading direction and capacity. ZARGES offers EN 517-compliant aluminium hooks. Kee Safety, MSA Safety, and other manufacturers produce EN 516-compliant walkway systems with glass-reinforced nylon or aluminium treads on aluminium support beams. For DPP: load-bearing capacity and material composition are the primary performance data — relatively simple compared to families like CEM or DWS.

**Source**: ZARGES EN 517 (https://www.zarges.com/en/products/roof-safety-hooks-to-din-en-517); ABS Safety EN 517 (https://www.absturzsicherung.de/en/fall-arrest-manual/standards-regulations/en-517.html); BSI EN 516 (https://knowledge.bsigroup.com/products/prefabricated-accessories-for-roofing-installations-for-roof-access-walkways-treads-and-steps)

### S5. CEN/TC 128 Scope Includes Fall Arrest Devices — Broader Than Just Roofing Products

CEN/TC 128 "Roof covering products for discontinuous laying and products for wall cladding" has a scope that explicitly includes "anchor devices intended to prevent persons from falling and/or to arrest falls, used in and on buildings and civil engineering works." This confirms TC 128 as the correct home for LAD standards. The TC's business plan is published by CEN-CENELEC but specific EN 12951/EN 516/EN 517 revision projects were not found for 2025–2026. The TC has numerous active working groups covering tiles, slates, metal sheets, and accessories — ladder/safety products are likely a small part of TC 128's workload. BAU-EPD lists CEN/TC 128 as having PCR standards for roofing products — suggesting EPD methodology exists at TC level even if LAD-specific EPDs don't.

**Source**: CEN/TC 128 iTeh.ai (https://standards.iteh.ai/catalog/tc/cen/56c5e14c-1681-4e4a-9fb3-330f8cec4d06/cen-tc-128); CEN/TC 128 business plan (https://standards.cencenelec.eu/BPCEN/6110.pdf); BAU-EPD PCR (https://www.bau-epd.at/en/pcr/list/cen-tc-standards-european-specific-product-category-rules-for-construction-products)

### S6. Standards Overlap: EN 12951/EN 516/EN 517 (CPR) vs EN 14122-4 (Machinery) vs EN 353-1 (PPE)

LAD products sit at the intersection of three EU regulations: CPR 2024/3110 (construction products — permanently attached to buildings), Machinery Regulation (EN 14122-4 — fixed ladders on machinery), and PPE Regulation (EN 353-1 — guided fall arresters on fixed ladders). ZARGES markets its fixed ladders as conforming to EN 14122-4 rather than EN 12951, suggesting market preference for the machinery standard. For DPP: the multi-regulatory overlap means a fixed ladder attached to a building could theoretically need to comply with CPR DPP AND machinery/PPE requirements simultaneously. This regulatory boundary is unclear and may need clarification in the SReq (handled within KAS).

**Source**: ZARGES EN 14122-4 (https://www.zarges.com/uk/fixed-vertical-ladders/); EU Directive 2001/45/EC (https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32001L0045)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 4 | iss-LAD-004 | info | dpp_readiness | Zero EPDs found for fixed ladders, roof safety hooks, or walkways. Products are predominantly aluminium/steel — could inherit metal sector EPD data. Niche market may face disproportionate DPP infrastructure costs. |
| 5 | iss-LAD-005 | warning | multi_regulatory | Fixed attached ladders face three-regulation overlap: CPR (EN 12951, EN 516, EN 517), Machinery Regulation (EN 14122-4), and PPE Regulation (EN 353-1). ZARGES markets to EN 14122-4 rather than EN 12951. Regulatory boundary unclear. |
| 6 | iss-LAD-006 | info | market_context | Niche market segment — no specific market sizing found. ZARGES (Germany) is Europe's leading manufacturer. Predominantly aluminium and galvanised steel. EU Directive 2001/45/EC positions ladders as "last resort" for work at height. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] Fixed ladder market assessed (niche, no sizing, ZARGES leads)
- [x] EPD coverage assessed (zero EPDs found — metal sector inheritance possible)
- [x] EU fall-from-height regulation documented (Directive 2001/45/EC)
- [x] EN 517/EN 516 product specifications documented
- [x] CEN/TC 128 scope and work programme assessed
- [x] Multi-regulatory overlap (CPR/Machinery/PPE) documented
- [x] All findings connected to explicit sources with URLs
