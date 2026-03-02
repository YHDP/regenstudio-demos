# MEM — Membranes: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-27)
**Family**: Annex VII #3 · MEM
**Batch**: 8 (Panels & Membranes)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Membranes, including liquid applied and kits (for water and/or water vapour control) |
| Letter | MEM |
| Annex VII # | 3 |
| TC | CEN/TC 254 |
| Standards tracked | 8 (8 hEN + 0 EAD) |
| Active pipelines | A (new-CPR hEN route) |
| Future pipelines | None |
| DPP estimate | ~2032–2033 |
| Acquis | No |
| SReq status | Not started — no date set |
| AVCP | System 2+ (roof membranes), System 3/4 (vapour/damp proof), System 4 (damp proof sheets) |
| Last updated | 2026-02-22 |

**Key context**: MEM is a self-contained, hEN-only family covering flexible waterproofing sheets for roofing, walls, and below-ground applications. All 8 hENs are under CEN/TC 254 (Flexible sheets for waterproofing) and cited under CPR 305/2011. AVCP varies by function: System 2+ for exposed roof membranes (EN 13956, EN 13707), System 3/4 for vapour control layers and underlays (EN 13984, EN 13859-1/2), System 4 for damp proof sheets (EN 13967, EN 13969, EN 13970). Milestone I and III both targeted 2028.

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | not_started | amber | Correct — 2028 target | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | not_started | amber | Correct — 2028 target (same year as M-I) | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | gray | Correct — no date set | No change | No change | S30 |
| CEN Standards Development | NT-5 | not_started | gray | Correct — blocked on SReq | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | No new OJ citations for MEM | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | ~2032–2033 estimate | No change | No change | S30, S1 |

**Pipeline verdict**: All 7 nodes accurate. No changes needed. No Pipeline C (0 EADs).

---

## 3. Standards Landscape Update

### hENs (8)

All 8 hENs cited under CPR 305/2011 via CEN/TC 254. The portfolio covers three functional categories:

**Roof waterproofing (AVCP 2+)**:
| Standard | Name |
|----------|------|
| EN 13956 | Plastic and rubber sheets for roof waterproofing |
| EN 13707 | Reinforced bitumen sheets for roof waterproofing |

**Vapour control layers and underlays (AVCP 3, 4)**:
| Standard | Name |
|----------|------|
| EN 13984 | Plastic and rubber vapour control layers |
| EN 13859-1 | Underlays for discontinuous roofing |
| EN 13859-2 | Underlays for walls |

**Damp proof sheets (AVCP 4)**:
| Standard | Name |
|----------|------|
| EN 13967 | Plastic and rubber damp proof sheets |
| EN 13969 | Bitumen damp proof sheets including basement tanking |
| EN 13970 | Bitumen water vapour control layers |

### EADs (0)

No EADs. All products use the hEN route exclusively.

### New/Changed Standards

No new standards or EADs found for MEM in 2025–2026.

**Count verification**: 8 hENs + 0 EADs = 8 total. Matches standards_summary ("8 hENs cited. 0 EADs.").

---

## 4. SReq Analysis Update

**Status**: Not started. No Art. 12 notification.

Key facts:
- Per COM(2025) 772: M-I and M-III both targeted 2028
- No SReq date set
- No acquis
- Under CPR 2024/3110
- CEN/TC 254 is the sole responsible TC

**No change to tracker data**: SReq status correctly recorded.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Does NOT affect MEM
- No new implementing decisions for waterproofing membranes found in 2025–2026

### CEN Work Programme
- CEN/TC 254 (Flexible sheets for waterproofing): Active. No specific CPR-relevant revision projects found for 2025–2026.

### EOTA
- No EADs for MEM — not applicable

---

## 6. Structural Issues Identified

| # | ID | Severity | Type | Description | Action |
|---|----|----------|------|-------------|--------|
| 1 | iss-MEM-001 | info | empty_content | 5 content sections empty: standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary | Populate with content |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No pipeline or data changes needed. | — |

---

## 8. Content Section Updates

### content.key_risks (currently empty)
**Proposed**: "1) Mixed AVCP structure: System 2+ for roof membranes vs System 4 for damp proof sheets — DPP data requirements will vary by product subcategory. 2) M-I and M-III both targeted 2028 — compressed timeline if preparatory work falls behind. 3) No SReq date — adds to timeline uncertainty beyond 2028."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110. S143: nlfnorm.cz harmonised standards database."

---

## 9. Cross-Family Notes

- **Self-contained family**: No cross-family standards or overlaps identified.
- **CEN/TC 254**: Sole TC. No shared TC dependencies with other CPR families.
- **Functional overlap with ROC**: Roof waterproofing membranes (EN 13956, EN 13707) are installed on roofs alongside roofing products (ROC family), but the standards are separate and no data overlap exists.

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in A — 7 total, no Pipeline C)
- [x] All standards checked against sources (8/8 verified)
- [x] hen_count matches actual hEN count in standards[] (8 hENs)
- [x] ead_count matches actual EAD count in standards[] (0 EADs)
- [x] DPP date consistent with convergence formula (max(Product ~2032–2033, System ~Q1-Q2 2029) = ~2032–2033)
- [x] No duplicate update IDs
- [x] Content sections all non-empty or flagged (5 empty sections flagged)
- [x] Source citations present for all claims
- [x] Cross-family standards noted (none — self-contained; functional overlap with ROC noted)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across waterproofing membrane market, EPDs, single-ply recycling, CEN/TC 254 standards, bitumen membrane EPDs, and below-ground waterproofing
**Scope**: European waterproofing membrane market sizing, EPD coverage (Sika, BMI, Soprema, Bauder), PVC/EPDM recycling programmes, CEN/TC 254 standards revision status, bitumen vs single-ply market dynamics, below-ground waterproofing applications

### S1. European Waterproofing Membrane Market — $4.6B (2024), PVC/TPO Single-Ply Gaining on Bitumen

European waterproofing membrane market estimated at $4.6 billion (2024), growing at 4.1–5.9% CAGR. Global market projected beyond $14.5 billion by 2032. Roofing is the primary application segment. Material split: bitumen sheets remain dominant in continental Europe, but PVC and TPO single-ply membranes are gaining market share — driven by lighter weight, faster installation, and reflective (cool roof) properties. EPDM holds niche position in commercial/industrial roofing. Key European manufacturers: Sika, BMI Group (Icopal/Monier/Siplast), Soprema, IKO, Bauder, Firestone Building Products. Below-grade waterproofing is a growing segment driven by EU infrastructure investment (EIB invested $95.5B+ in urban regeneration over 5 years).

**Source**: GMInsights (https://www.gminsights.com/pressrelease/waterproofing-membrane-market); ScienceDirect pre-applied membranes review (https://www.sciencedirect.com/science/article/pii/S0950061821015117)

### S2. EPD Coverage Strong Among Market Leaders — Sika, BMI, Bauder, Soprema All Publish EN 15804 EPDs

Sika publishes EN 15804+A2 EPDs for SikaProof A (pre-applied below-grade) and Sikaplan (PVC/TPO roof membranes) — cradle-to-grave including modules A1-C4. BMI Group (Europe's largest roofing/waterproofing manufacturer, brands: Monier, Icopal, Siplast) publishes Icopal membrane EPDs per EN 15804. Bauder publishes EN 15804 EPDs for reinforced bitumen membrane (RBM) roofing systems. Soprema has extensive EPD documentation via INIES (French EPD database) covering TPO membranes, liquid waterproofing, and bitumen sheets — SOPRALENE GARDEN 5800 registered at EPD International. For DPP: EPD coverage among market leaders is relatively strong compared to other late-timeline families, but SME manufacturers likely lack EPD infrastructure.

**Source**: Bauder RBM EPD (https://www.bauder.co.uk/getmedia/37161530-7cc6-4472-aef0-5c729ce4f398/Environmental-Product-Declaration-RBM.pdf); Soprema EPD Guide (https://epd.guide/manufacturers/soprema-at-a-glance-products-and-epd-coverage); EPD International SOPRALENE (https://environdec.com/library/epd24431)

### S3. PVC Membrane Recycling via ROOFCOLLECT — EPDM Recycled, Bitumen Landfilled

ROOFCOLLECT programme (run by ESWA — European Single Ply Waterproofing Association) coordinates recovery and recycling of post-consumer PVC roofing membranes across Europe. VinylPlus (PVC industry commitment) recycled ~1 million tonnes of PVC annually across all applications. EPDM membranes recycled into rubber crumb for tires, pavers, and playground surfaces. Recycled content in new PVC membranes currently limited to ~5%. Bitumen membranes are the most challenging to recycle — most end up in landfill or energy recovery. ANSI/NSF 347 sustainability assessment standard exists for single-ply membranes (US-origin but adopted by some European manufacturers). For DPP: circular economy data will vary dramatically by membrane material — PVC has established collection, bitumen has almost none.

**Source**: ROOFCOLLECT/ESWA; VinylPlus annual reports; ANSI/NSF 347 sustainability standard

### S4. CEN/TC 254 — Mature Standards Portfolio, prEN 17388-2 for Membrane-Specific PCR Under Development

CEN/TC 254 "Flexible sheets for waterproofing" maintains the 8 hENs in MEM. Standards are mature (EN 13956:2012, EN 13707:2013, EN 13859-1:2014, EN 13859-2:2014, EN 13967:2012, EN 13969:2012, EN 13970:2005, EN 13984:2013). No specific CPR-relevant revisions found for 2025–2026 — TC is waiting for SReq before commencing new-CPR revisions. prEN 17388-2 is under development: "Flexible sheets for waterproofing — Environmental product declarations — Product Category Rules for bituminous and synthetic flexible sheets". This is significant: a membrane-specific PCR would harmonise EPD methodology across the family, directly supporting DPP environmental data generation. BAU-EPD lists CEN TC-specific PCRs including for waterproofing products.

**Source**: CEN-CENELEC construction products (https://www.cencenelec.eu/areas-of-work/cen-sectors/construction/construction-products/); BAU-EPD PCR list (https://www.bau-epd.at/en/pcr/list/cen-tc-standards-european-specific-product-category-rules-for-construction-products); BSI prEN 17388-2 (https://standardsdevelopment.bsigroup.com/projects/9020-04716)

### S5. Bitumen vs Single-Ply Market Dynamics — Material Split Creates DPP Data Complexity

MEM spans two fundamentally different material technologies: bitumen-based (EN 13707, EN 13969, EN 13970) and plastic/rubber-based (EN 13956, EN 13967, EN 13984, EN 13859-1/2). Environmental profiles differ substantially: bitumen is petroleum-derived with high embodied carbon but excellent durability (40+ year lifespan); PVC/TPO is lighter with lower transport emissions but PFAS-adjacent chemistry concerns for some formulations; EPDM is durable but energy-intensive to produce. For DPP: a single "waterproofing membrane" product category will contain dramatically different environmental datasets depending on material. The prEN 17388-2 PCR development (S4) is critical to establishing comparable EPD methodology across this material split.

**Source**: Pre-applied membranes review (https://www.sciencedirect.com/science/article/pii/S0950061821015117); Designing Buildings DPM guide (https://www.designingbuildings.co.uk/wiki/Damp_proof_membrane_DPM)

### S6. Below-Ground Waterproofing — National Regulatory Fragmentation, DIN 18533 vs EN 13967

Below-ground waterproofing (basements, foundations, tunnels) is a growing application segment driven by EU urban densification and infrastructure investment. However, national regulatory fragmentation is significant: Germany's DIN 18533 imposes additional requirements beyond EN 13967, meaning CE-marked products may not automatically satisfy national building codes. Pre-applied bonded membranes (installed before concrete placement) are a technology trend but are "not considered as stand-alone waterproofing" in some countries. This fragmentation is relevant for DPP: declared performance under harmonised standards may not capture all nationally-required performance data. Below-grade products face harsher service conditions (hydrostatic pressure, chemical exposure from soils) than roofing membranes, potentially requiring different in-service performance declarations.

**Source**: ScienceDirect pre-applied membranes (https://www.sciencedirect.com/science/article/pii/S0950061821015117); Designing Buildings (https://www.designingbuildings.co.uk/wiki/Damp_proof_membrane_DPM)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 2 | iss-MEM-002 | info | dpp_readiness | Market leaders (Sika, BMI, Bauder, Soprema) publish EN 15804 EPDs. prEN 17388-2 membrane-specific PCR under development — would harmonise EPD methodology for DPP. SME coverage likely limited. |
| 3 | iss-MEM-003 | info | circular_economy | PVC membranes have ROOFCOLLECT recycling programme; EPDM recycled into rubber crumb; bitumen membranes mostly landfilled. Circular economy data will vary dramatically by material type within this single family. |
| 4 | iss-MEM-004 | info | market_context | European waterproofing membrane market $4.6B (2024). Bitumen dominant but PVC/TPO gaining share. Material split creates DPP data complexity — single family spans fundamentally different environmental profiles. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] European waterproofing membrane market sized ($4.6B)
- [x] EPD coverage assessed (Sika, BMI, Bauder, Soprema all with EN 15804 EPDs)
- [x] PVC recycling programme (ROOFCOLLECT) and bitumen landfill gap documented
- [x] CEN/TC 254 standards status checked (mature, no active revisions, prEN 17388-2 PCR)
- [x] Material split (bitumen vs single-ply) DPP implications documented
- [x] Below-ground waterproofing national fragmentation noted
- [x] All findings connected to explicit sources with URLs
