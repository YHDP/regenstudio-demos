# Deep Dive: FLO — Floorings

**Family**: Annex VII #19 · FLO
**Full Name**: Floorings
**Date**: 2026-03-01
**Batch**: 5 (Civil Engineering)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| TC | CEN/TC 134 (+ TC 67, TC 175, TC 178, TC 217, TC 229, TC 246, TC 303) |
| Standards | 19 (19 hEN + 0 EAD) |
| Pipelines | A only (hEN-only) |
| Acquis | No |
| SReq | Not adopted — targeted 2027 |
| DPP Estimate | ~2031–2032 |
| AVCP | Mixed: 1, 2+, 3, 4 |

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-2 Milestone I | not_started | amber | ✅ Correct — acquis not started, Q2 2026 target |
| NT-3 Milestone III | not_started | amber | ✅ Correct — Q4 2026 target |
| NT-4 SReq | not_started | amber | ✅ Correct — 2027 target |
| NT-5 CEN Development | not_started | gray | ✅ Correct — EPLF working on EN 14041 revision but no formal CPR-mandated work |
| NT-7 OJ Citation | pending | gray | ✅ Correct |
| NT-8 Coexistence | pending | gray | ✅ Correct |
| NT-9 HTS In Force | pending | orange | ✅ Correct — ~2031–2032 |

**No Pipeline C** — hEN-only family (0 EADs).

**Pipeline verdict**: All nodes accurate. No changes needed.

---

## 3. Standards Landscape Update

### hEN Standards (19) — 8 TCs

FLO spans **8 TCs** — the most complex TC landscape of all 37 families:

| TC | Standards | Products |
|----|-----------|----------|
| CEN/TC 134 | EN 14041, EN 12825, EN 13329 | Resilient/textile/laminate, raised floors |
| CEN/TC 67 | EN 14411 | Ceramic tiles |
| CEN/TC 175 | EN 14342 | Wood flooring |
| CEN/TC 178 | EN 1338-1344 (6 stds) | Concrete/clay/stone paving |
| CEN/TC 217 | EN 14904 | Indoor sports surfaces |
| CEN/TC 229 | EN 13748-1/2 | Terrazzo tiles |
| CEN/TC 246 | EN 12057, EN 12058, EN 15285 | Natural/agglomerated stone |
| CEN/TC 303 | EN 13813 | Floor screeds |

### Key Standard: EN 14041 Standardisation Crisis Gap

EN 14041:2018 was published by CEN but its OJ citation status is unclear. The 2004/AC:2006 version remains the OJ-cited edition. This is a classic standardisation crisis gap where CEN publishes a revision but the Commission does not cite it in the OJ, leaving the old version as the legal reference. EPLF (European Producers of Laminate Flooring) is working on further revision.

### Cross-Family Standard: EN 13813

EN 13813 (screed material) is cross-listed with CMG (Batch 4). AVCP mismatch:
- FLO: "1, 3, 4" (includes System 1 for reaction-to-fire)
- CMG: "3, 4" (omits System 1)

The FLO entry appears more complete — Commission Decision 97/808/EC specifies System 1 for products intended for fire-safety-relevant uses.

### New/Changed Standards

No new standards found for FLO in 2025–2026.

---

## 4. SReq Analysis Update

Not adopted. COM(2025) 772 targets: M-I Q2 2026, M-III Q4 2026, SReq 2027. Acquis not started. Milestone 0 work ongoing on slip resistance test methods (EN 16165:2021, CEN/TC 339).

---

## 5. Regulatory Landscape Changes

No new implementing decisions. EN 14041:2018 standardisation gap persists. No EOTA activity (0 EADs).

---

## 6. Structural Issues Identified

| ID | Severity | Type | Description |
|----|----------|------|-------------|
| iss-FLO-001 | warning | cross_family | EN 13813 AVCP mismatch: FLO records "1, 3, 4" while CMG records "3, 4". FLO likely correct (includes System 1 for reaction-to-fire per Decision 97/808/EC). |
| iss-FLO-002 | info | standards_development | EN 14041:2018 published but OJ citation unclear — standardisation crisis gap. 2004/AC:2006 remains legal reference. |
| iss-FLO-003 | info | empty_content | 3 content sections empty: stakeholder_notes, key_risks, sources_summary |

---

## 7. Proposed Data Changes Summary

No data changes proposed.

---

## 8–9. Content / Cross-Family Notes

- **EN 13813 (FLO ↔ CMG)**: AVCP mismatch. CMG likely missing System 1.
- **EN 14411 (FLO)**: Ceramic tiles under TC 67. TC 67 also has EN 13888 and EN 12004-1 in CMG.
- **8-TC span**: Most complex TC coordination challenge for SReq drafting.
- **Milestone 0 pre-acquis**: Slip resistance assessment method being developed before formal acquis — unique approach.

---

## 10. Quality Checklist

- [x] Standards count verified: 19 hEN + 0 EAD = 19 ✓
- [x] No Pipeline C — correct (no EADs)
- [x] All pipeline nodes reviewed
- [x] Convergence formula verified: max(~2031–2032, ~Q1-Q2 2029) = ~2031–2032 ✓
- [x] Cross-family standards flagged (EN 13813)
- [x] Empty content sections documented
- [x] EUR-Lex, EOTA, EC checked
- [x] Review-queue JSON written

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across industry associations, EPD infrastructure, VOC/chemical regulation, market data, slip resistance standards, and natural stone
**Scope**: EPLF laminate EPDs, European flooring market, ceramic tile EPDs (Confindustria Ceramica), vinyl flooring VOC/phthalate regulation, natural stone EPDs (EUROROC), slip resistance EN 16165

### S1. EPLF — Laminate Flooring EPDs Since 2009, 55% Global Market Share

The European Producers of Laminate Flooring (EPLF), established 1994, was one of the first flooring industry groups to develop EPDs (first published 2009). EPLF members supply approximately 55% of the global laminate flooring market. In 2025, EPLF unveiled a Manifesto "advocating for a sustainable and competitive European laminate flooring" industry, emphasising circular production processes, recycled materials, and thinner laminate options. EPLF is actively working on EN 14041 revision — the key FLO harmonised standard with a standardisation crisis gap (2018 version not OJ-cited). EPLF's early EPD engagement (2009) makes laminate flooring among the most environmentally transparent flooring segments. EPLF is also part of EUFCA (European Floor Coverings Association), the broader flooring industry umbrella.

**Source**: EPLF Manifesto (https://eplf.com/en/news/eplf-unveils-manifesto-for-advocating-for-a-sustainable-and-competitive-european-laminate-flooring); EPLF 2025 sustainability (https://panelsfurnitureasia.com/eplf-2025-sustainability-durability-and-elegance-to-lead-the-future-of-laminate-flooring/); EPLF 30 years (https://www.floor-forum.com/en/news/item/6537-three-decades-of-eplf-shaping-the-future-of-laminate-flooring); EUFCA (https://eufca.org/eplf-european-producer-of-laminate-floorings/)

### S2. Italian Ceramic Tile Industry-Average EPD — 82.6% Production Coverage

Confindustria Ceramica published an industry-average EPD for Italian ceramic tiles covering 82.6% of Italian ceramic tile production — the most comprehensive sector EPD for any flooring type. EPD follows EN 15804 and ISO 14025. The European Ceramic Tile Manufacturers' Federation developed specific Product Category Rules (PCR) for ceramic tiles. Individual manufacturer EPDs also exist (Cerdomus, Ceragni). EN 14411 (ceramic tiles, CEN/TC 67) is the harmonised standard. Natural stone (EUROROC federation) LCA comparison shows stone outperforms ceramics (1.5 vs 5.7 lifecycle score) and cement (4.2), though individual granite and limestone EPDs exist on EPD International. The ceramics sector's comprehensive EPD coverage represents strong DPP readiness for the largest flooring segment by area (34% of 3 billion m² European consumption).

**Source**: Confindustria Ceramica EPD (https://www.ceramica.info/en/articoli/environmental-product-declaration-epd-italian-ceramic-tiles/); Sphera case study (https://sphera.com/resources/case-study/an-environmental-product-declaration-for-the-italian-ceramics-industry/); EUROROC (https://www.euroroc.net/); EPD International granite (https://www.environdec.com/library/epd15103)

### S3. European Flooring Market — $52–62B (2024), 3 Billion m², Most Diverse CPR Family

The European flooring market was valued at $52–62 billion (2024, estimates vary), with total annual consumption of approximately 3 billion square metres. Material breakdown: ceramics 34%, carpets 34%, laminate 15%, vinyl ~10%. Vinyl flooring holds 51.4% market share by revenue (higher value per m²). Non-resilient flooring leads at 43.23% revenue, resilient growing at 6.55% CAGR. The market's material diversity — ceramic, vinyl, laminate, wood, stone, carpet, screed — across 8 CEN TCs makes FLO the most materially diverse CPR family. Each material type has different environmental profiles, production processes, and EPD methodologies. DPP implementation must accommodate this diversity within a single family framework.

**Source**: Market Data Forecast Europe Flooring (https://www.marketdataforecast.com/market-reports/europe-flooring-market); Mordor Intelligence (https://www.mordorintelligence.com/industry-reports/europe-floor-covering-market); Expert Market Research (https://www.expertmarketresearch.com/reports/flooring-market); Data Bridge (https://www.databridgemarketresearch.com/reports/europe-flooring-materials-market)

### S4. Vinyl Flooring — VOC/Phthalate Cross-Regulatory Pressure (REACH + CPR Dangerous Substances)

Vinyl (PVC) flooring faces significant cross-regulatory pressure. REACH restricts SVHC phthalates (DEHP classified as SVHC, restricted in concentrations above permissible limits). Industry has shifted to non-phthalate plasticisers (DINCH, DEHA, triglycerides) and longer-chain alternatives (DIDP, DINP). The new CPR 2024/3110 introduces dangerous substances requirements — flooring VOC emissions will need to be declared alongside traditional mechanical/fire performance. German AgBB/DIBt method is the current benchmark for VOC testing (3/7/14-day protocols). The new CPR's dangerous substances horizontal requirements (CEN/TC 351) directly affect vinyl flooring — DPP data must include VOC emission classes, phthalate content declarations, and indoor air quality performance. This creates a compound regulatory burden unique to vinyl within FLO.

**Source**: EU flooring standards and CE marking (https://globalfloorings.com/2025/08/11/eu-flooring-standards-and-ce-marking-for-environmental-compliance/); REACH phthalate restrictions (https://www.bynewmaterials.com/what-safety-standards-does-a-vinyl-flooring-manufacturer-follow/); PMC DEHP-free PVC (https://pmc.ncbi.nlm.nih.gov/articles/PMC6856815/)

### S5. EN 16165:2021 Slip Resistance — Pre-Acquis Milestone 0 Work Ongoing

EN 16165:2021 (released December 2021, corrected February 2022) is the consolidated European slip resistance test standard developed by CEN/TC 339. It replaces multiple national/European methods: BS 7976-2, BS EN 13893, DIN 51097, DIN 51130. Four test methods: inclined plane (barefoot), inclined plane (shod), pendulum, and tribometer. EN 16165 is already referenced by flooring product standards: EN 14411 (ceramic tiles), EN 13845 (resilient flooring). The "Milestone 0" pre-acquis work on slip resistance noted in the tracker represents the ongoing effort to harmonise slip resistance assessment methodology before formal acquis begins — a unique approach among CPR families where the test method is being standardised before the product performance requirements are set. This is a critical safety performance characteristic for DPP data.

**Source**: iTeh EN 16165:2021 (https://standards.iteh.ai/catalog/standards/cen/077e7dc1-7fe2-43fe-bc8d-0488a5d496ae/en-16165-2021); FloorSlip standards (https://www.floorslip.co.uk/all-applicable-floor-surfaces-testing-standards); UK Slip Resistance (https://www.ukslipresistance.org.uk/publication/meeting-standard-requirements/); Analytice EN 16165 (https://www.analytice.com/en/en-16165-laboratory-slip-resistance-tests/)

### S6. Split EPD Readiness Across Flooring Types

FLO has the most varied EPD readiness landscape of any CPR family, reflecting its material diversity: (1) **Ceramics**: Excellent — Confindustria Ceramica industry EPD covers 82.6% of Italian production, individual manufacturer EPDs. (2) **Laminate**: Good — EPLF EPDs since 2009, sector-wide commitment. (3) **Natural stone**: Emerging — EUROROC promotes EPDs, individual quarry EPDs on EPD International, lifecycle advantage over ceramics/cement. (4) **Vinyl**: Partial — manufacturers have product declarations but VOC/chemical data is the primary focus, not full EN 15804 EPDs. REACH compliance dominates. (5) **Wood**: Moderate — wood flooring EPDs linked to STP family (EN 14342, CEN/TC 175). (6) **Screed**: Minimal — EN 13813 cross-listed with CMG, few EPDs found. This split readiness means DPP implementation will proceed at different speeds for different material types within the same family.

**Source**: Compiled from S1–S5 findings above, cross-referenced with CMG supplementary (screed) and STP extended addendum (wood)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 4 | iss-FLO-004 | info | dpp_readiness | Split EPD readiness: ceramics excellent (82.6% Italian coverage), laminate good (EPLF since 2009), stone emerging, vinyl partial (VOC focus), screed minimal. Most varied DPP readiness of any family. |
| 5 | iss-FLO-005 | warning | dpp_complexity | $52-62B market, 8 TCs, 6+ material types — most diverse product/material mix in CPR. DPP must accommodate radically different environmental profiles within one family. |
| 6 | iss-FLO-006 | info | cross_regulatory | Vinyl flooring: REACH phthalate restrictions + new CPR dangerous substances (CEN/TC 351) + VOC emission declarations. Compound regulatory burden unique to vinyl within FLO. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] EPLF laminate EPDs documented (since 2009, 55% global market)
- [x] Confindustria Ceramica industry EPD assessed (82.6% Italian production)
- [x] European flooring market sized ($52-62B, 3 billion m²)
- [x] Vinyl VOC/phthalate cross-regulatory pressure documented
- [x] Natural stone EPD landscape assessed (EUROROC, lifecycle advantage)
- [x] EN 16165 slip resistance Milestone 0 context provided
- [x] All findings connected to explicit sources with URLs
