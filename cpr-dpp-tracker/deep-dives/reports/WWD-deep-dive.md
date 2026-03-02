# WWD — Waste Water Engineering: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-27)
**Family**: Annex VII #18 · WWD
**Batch**: 8 (Panels & Membranes)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Waste water engineering products |
| Letter | WWD |
| Annex VII # | 18 |
| TC | CEN/TC 165 |
| Standards tracked | 8 (8 hEN + 0 EAD) |
| Active pipelines | A (new-CPR hEN route) |
| Future pipelines | None |
| DPP estimate | ~2032–2033 |
| Acquis | No |
| SReq status | Not started — no date set |
| AVCP | System 3 (7 standards), System 4 (EN 12050-1) |
| Last updated | 2026-02-22 |

**Key context**: WWD is a self-contained, hEN-only family covering small wastewater treatment systems (EN 12566 series parts 1/3/4/6/7), grease separators (EN 1825-1), light-liquid separators (EN 858-1), and wastewater lifting plants (EN 12050-1). All 8 hENs are cited under CPR 305/2011 and will require revision under CPR 2024/3110 before DPP applies. No EADs, no Pipeline C. Milestone I targeted 2027, Milestone III targeted 2028.

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | not_started | amber | Correct — 2027 target | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | not_started | amber | Correct — 2028 target | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | gray | Correct — no date set | No change | No change | S30 |
| CEN Standards Development | NT-5 | not_started | gray | Correct — blocked on SReq | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | No new OJ citations for WWD | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | ~2032–2033 estimate | No change | No change | S30, S1 |

**Pipeline verdict**: All 7 nodes accurate. No changes needed. No Pipeline C (0 EADs).

---

## 3. Standards Landscape Update

### hENs (8)

All 8 hENs cited under CPR 305/2011 via CEN/TC 165. The portfolio breaks into three product groups:

1. **Small wastewater treatment systems** (5 standards): EN 12566-1 (prefabricated septic tanks), EN 12566-3 (packaged/site-assembled treatment plants), EN 12566-4 (septic tanks from kits), EN 12566-6 (prefabricated treatment units for septic tank effluent), EN 12566-7 (prefabricated tertiary treatment units). All AVCP System 3.
2. **Separators** (2 standards): EN 1825-1 (grease separators), EN 858-1 (light-liquid separators). Both AVCP System 3.
3. **Lifting plants** (1 standard): EN 12050-1 (wastewater lifting plants for faecal-free wastewater). AVCP System 4.

### EADs (0)

No EADs. All products use the hEN route exclusively.

### New/Changed Standards

No new standards or EADs found for WWD in 2025–2026.

**Count verification**: 8 hENs + 0 EADs = 8 total. Matches standards_summary ("8 hENs. 0 EADs.").

---

## 4. SReq Analysis Update

**Status**: Not started. No Art. 12 notification.

Key facts:
- Per COM(2025) 772: M-I targeted 2027, M-III targeted 2028
- No SReq date set
- No acquis
- Under CPR 2024/3110
- CEN/TC 165 is the sole responsible TC

**No change to tracker data**: SReq status correctly recorded.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Does NOT affect WWD
- No new implementing decisions for wastewater engineering products found in 2025–2026

### CEN Work Programme
- CEN/TC 165 (Wastewater engineering): Active. No specific CPR-relevant revision projects found for 2025–2026.

### EOTA
- No EADs for WWD — not applicable

---

## 6. Structural Issues Identified

| # | ID | Severity | Type | Description | Action |
|---|----|----------|------|-------------|--------|
| 1 | iss-WWD-001 | info | empty_content | 5 content sections empty: standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary | Populate with content |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No pipeline or data changes needed. | — |

---

## 8. Content Section Updates

### content.key_risks (currently empty)
**Proposed**: "1) No SReq date set — timeline uncertainty is higher than families with confirmed milestones. 2) EN 12050-1 is AVCP System 4 (self-declaration) while rest of family is System 3 — mixed AVCP may complicate DPP data requirements. 3) EN 12566 series covers 5 of 8 standards — any revision delay in this series would affect most of the family."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110. S143: nlfnorm.cz harmonised standards database."

---

## 9. Cross-Family Notes

- **Self-contained family**: No cross-family standards or overlaps identified.
- **CEN/TC 165**: Sole TC. No shared TC dependencies with other CPR families.

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
- [x] Cross-family standards noted (none — self-contained)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across small wastewater treatment market, wastewater EPDs, EU UWWTD recast, Geberit drainage EPDs, decentralised wastewater market, and CEN/TC 165 standards
**Scope**: EN 12566 testing requirements, Geberit PE/HDPE drainage EPDs, EU Urban Waste Water Treatment Directive recast 2024/3019, decentralised wastewater market, CEN/TC 165 revision status

### S1. EN 12566 Small Wastewater Treatment Systems — 38-Week Testing, Up to 50 PE, CE Marking Mandatory

EN 12566 covers small wastewater treatment systems for up to 50 PT (population total). EN 12566-3 (packaged/site-assembled treatment plants) requires 38-week treatment efficiency testing — one of the most rigorous CE marking test programmes in CPR. Testing at accredited facilities (e.g., PIA GmbH, BRE) covers BOD, COD, TSS removal efficiency. CE marking is mandatory for placing products on the EU market. The EN 12566 series is technically demanding: 5 of 8 WWD standards are within this series. Products range from simple prefabricated septic tanks (Part 1) to complex tertiary treatment units (Part 7). System 3 AVCP requires notified body testing — not self-declaration.

**Source**: EN 12566 Wikipedia (https://en.wikipedia.org/wiki/EN_12566); PIA testing (https://www.pia-gmbh.com/en/services/wastewater-treatment-plants/317-en-12566-tests); AZU Water regulations (https://www.azuwater.com/regulations/en-12566/)

### S2. UWWTD Recast (EU) 2024/3019 — Extends to 1,000 PE Agglomerations, Individual System Registration Required

The recast Urban Waste Water Treatment Directive (EU) 2024/3019, published December 2024 and in force 1 January 2025, extends coverage to agglomerations from 1,000 PE (previously 2,000). Key provisions: all 1,000–2,000 PE agglomerations must have collecting systems by 2035; individual systems must be registered and subject to risk-based inspections; decentralised solutions explicitly permitted under derogation. Transposition deadline: 31 July 2027. This directly increases the addressable market for EN 12566 products — an estimated 20,000+ additional agglomerations across Europe. For DPP: the UWWTD registration requirement for individual treatment systems aligns with DPP product traceability. Treatment efficiency data could become part of DPP in-service performance declarations.

**Source**: European Commission announcement (https://environment.ec.europa.eu/news/new-rules-urban-wastewater-management-set-enter-force-2024-12-20_en); EUR-Lex Directive (https://eur-lex.europa.eu/eli/dir/2024/3019/oj/eng); Council adoption (https://www.consilium.europa.eu/en/press/press-releases/2024/11/05/urban-wastewater-council-adopts-new-rules-for-more-efficient-treatment/)

### S3. Geberit PE/HDPE Drainage EPDs — EN 15804 Compliant, 34% of Sales with Third-Party EPDs

Geberit publishes EN 15804 EPDs for PE (polyethylene) drainage systems including HDPE pipes and fittings. EPDs are cradle-to-gate-with-options including transport and disposal phases. 34% of Geberit's Group sales have products with third-party EPDs. Geberit HDPE drainage is used for building wastewater discharge — adjacent to but distinct from WWD's EN 12566/EN 1825/EN 858 products. SuperTube technology enables smaller pipe diameters, reducing material consumption. Geberit's EPD infrastructure is relevant as a model for WWD manufacturers, but specific EPDs for small wastewater treatment plants (septic tanks, packaged treatment units) were not found. EPD coverage for WWD-scoped products appears minimal.

**Source**: Geberit PE EPD (https://files.etim-mapper.com/branchekataloget/4553/epd-pe-group-en.pdf); Geberit sustainability (https://www.geberit-global.com/know-how/sustainability/); Geberit HDPE (https://www.geberit-global.com/sanitary-piping-systems/water-drainage-systems/geberit-hdpe/)

### S4. European Wastewater Treatment Market — Services $12.35B (2024), Decentralised Systems Growing

European wastewater treatment services market $12.35 billion (2024), projected to $18.36 billion by 2033. Broader European water & wastewater treatment market $93.31 billion (2025), growing to $176.48 billion by 2035 (CAGR 6.58%). Key trends: digitalisation and smart monitoring, membrane bioreactors, decentralised systems, and circular economy/resource recovery from wastewater. WWD's EN 12566 products are a niche within this broader market — covering only small decentralised systems up to 50 PE. However, the UWWTD recast extension to 1,000 PE agglomerations significantly expands the addressable market for these products.

**Source**: Market Data Forecast (https://www.marketdataforecast.com/market-reports/europe-waste-water-treatment-service-market); Towards Chem & Materials (https://www.towardschemandmaterials.com/insights/europe-water-and-wastewater-treatment-market); Straits Research decentralised (https://straitsresearch.com/report/decentralized-water-treatment-market)

### S5. CEN/TC 165 — Wastewater Engineering Standards, No Active Revisions Found, Awaiting SReq

CEN/TC 165 "Waste water engineering" develops functional standards and product standards for wastewater systems and components, including separators. The TC's scope covers systems and components for drainage and sewerage outside buildings. EN 12566, EN 1825, EN 858, and EN 12050 are all within TC 165. The 2019 business plan confirmed ongoing work but no specific CPR-relevant revision projects were found for 2025–2026. Standards are mature (EN 12566 series last revised 2016, EN 1825-1 from 2004). Like SAP and SEA, WWD awaits the SReq (no date set) before meaningful standards revision can begin. The gap between the 2004-vintage EN 1825 and current technology is widening.

**Source**: CEN/TC 165 (https://standards.iteh.ai/catalog/tc/cen/2a9e0228-3bc1-457a-b2cc-d5e61b5feffb/cen-tc-165); CEN/TC 165 business plan (https://standards.cencenelec.eu/BPCEN/6146.pdf); CEN/TC 165 Wikipedia (https://en.wikipedia.org/wiki/CEN/TC_165)

### S6. Product Innovation — Smart Monitoring, Resource Recovery, and Circular Economy Potential

Small wastewater treatment systems are increasingly incorporating smart monitoring (IoT sensors for treatment efficiency, sludge levels, alarm notifications). Resource recovery from wastewater (phosphorus, energy, treated water reuse) is emerging as a circular economy driver. Packaged wastewater treatment plants ($80.52 billion global market by 2034) are moving toward modular, container-based designs. For DPP: treatment efficiency data (BOD/COD/TSS removal), energy consumption, and sludge production volumes could all be declared in DPP environmental performance. Smart monitoring integration could extend DPP to real-time in-service performance data — similar to the sensor-integrated bridge bearings concept in SBE.

**Source**: Precedence Research packaged treatment (https://www.precedenceresearch.com/packaged-water-treatment-market); Frost & Sullivan decentralised (https://store.frost.com/global-decentralized-packaged-containerized-water-and-wastewater-treatment-w-wwt-systems-market.html)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 2 | iss-WWD-002 | warning | cross_regulatory | UWWTD recast (EU) 2024/3019 extends to 1,000 PE agglomerations (was 2,000). Individual system registration required. Directly increases EN 12566 product demand. Registration aligns with DPP traceability. |
| 3 | iss-WWD-003 | info | dpp_readiness | EPD coverage for WWD-scoped products (septic tanks, treatment plants, separators) appears minimal. Geberit has drainage pipe EPDs but not for EN 12566 products. Industry EPD infrastructure lags behind building material families. |
| 4 | iss-WWD-004 | info | market_context | European wastewater treatment services $12.35B (2024). WWD products are niche (small systems up to 50 PE). UWWTD recast expansion to 1,000 PE increases addressable market significantly. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] EN 12566 testing requirements documented (38-week efficiency test)
- [x] UWWTD recast (EU) 2024/3019 cross-regulatory impact assessed
- [x] Geberit drainage EPDs documented (EN 15804, 34% of sales)
- [x] European wastewater treatment market sized ($12.35B services)
- [x] CEN/TC 165 standards status checked (no active revisions)
- [x] Smart monitoring and resource recovery trends documented
- [x] All findings connected to explicit sources with URLs
