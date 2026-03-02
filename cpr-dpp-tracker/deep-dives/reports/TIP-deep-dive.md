# TIP — Thermal Insulation: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-27)
**Family**: Annex VII #4 · TIP

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Thermal insulation products - Composite insulating kits/systems |
| Letter | TIP |
| Annex VII # | 4 |
| TC | CEN/TC 88 |
| Standards tracked | 30 (12 hEN + 18 EAD) |
| Active pipelines | A (new-CPR hEN route), C (old EAD sunset) |
| Future pipelines | None |
| DPP estimate | ~2029–2032 |
| SReq status | Not started (targeted Q3 2026) |
| AVCP | System 1 (ETICS under EADs), System 3 (factory-made hEN products) |
| Last updated | 2026-02-22 |

**Key context**: TIP is the largest insulation family, covering 13 material types (mineral wool, EPS, XPS, PUR/PIR, phenolic foam, cellular glass, etc.) via 12 hENs plus 18 EADs primarily for ETICS (external thermal insulation composite systems). Acquis is complete, M-III ongoing, SReq targeted Q3 2026. ETAG 004 was fully converted to EAD 040083-01-0404 in 2025 with ~798 valid ETAs. New EAD 042461 (hydrophilic mineral wool for green roofs) was published May 2025.

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | complete | green | Confirmed | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | in_progress | amber | Confirmed ongoing | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | amber | SReq targeted Q3 2026. No Art. 12 notification found yet. Consistent with tracker. | No change | No change | S30 |
| CEN Standards Development | NT-5 | in_progress | amber | CEN/TC 88 active on EN 13162–13171 series revisions and related standards. | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | No new OJ citations for TIP hENs. 2026/284 does NOT affect this family. | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | ~2029–2032 estimate | No change | No change | S30, S1 |

### Pipeline C — Old EAD Sunset (305/2011)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Legacy EADs Active (18) | NT-C1 | active | green | 18 EADs counted in standards[]. Matches Pipeline C label. | No change | No change | S1, S144 |
| EAD Validity Expires | NT-C2 | pending | green | 9 Jan 2031 confirmed | No change | No change | S1 |
| New EAD / Transition | NT-C3 | not_started | gray | ETICS dual pathway noted — EAD/ETA currently exclusive route, future hEN possible. | No change | No change | S1, S98 |
| ETA Validity Expires | NT-C4 | pending | green | 9 Jan 2036 confirmed | No change | No change | S1 |

**Summary**: No pipeline node status changes needed.

---

## 3. Standards Landscape Update

### hENs (12)

12 hENs cited under CPR 305/2011 via mandate M/103. The EN 13162–13171 series covers factory-made products (one per insulation type). Additional hENs include EN 14063-1, EN 16069, and EN 16977.

**Content inconsistency**: content.standards_landscape states "13 hENs for factory-made products" but the standards[] array contains only 12 hENs, and standards_summary says "12 hENs + 18 EADs." The content narrative may be counting a standard that is not in the array, or one of the EN 13162–13171 entries may be missing from standards[].

### EADs (18)

18 old-regime EADs under CPR 305/2011. Primarily ETICS kits (EAD 040083 and variants), plus specialty products like vacuum insulation panels, reflective insulation, and aerogel-based products.

**Count verification**: 12 hENs + 18 EADs = 30 total. Matches standards_summary ("12 hENs + 18 EADs"). ✓

**New EAD finding**: EAD 042461-00-1201 (hydrophilic thermal insulation product made of mineral wool for water retention in green roofs) was published May 2025 by EOTA. This new EAD is NOT in the standards[] array and may need to be added.

---

## 4. SReq Analysis Update

**Status**: Not started. No Art. 12 notification found.

Key facts:
- Per COM(2025) 772: SReq targeted Q3 2026
- Acquis M-I complete, M-III ongoing
- Under CPR 2024/3110
- ETICS dual pathway: Currently EAD/ETA only, future hEN route being considered
- ETAG 004 fully converted to EAD 040083-01-0404 in 2025 (~798 ETAs)
- CEN/TC 88 active on factory-made insulation product standards

**No change to tracker data**: SReq status correctly recorded.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Does NOT affect TIP
- **2025/871** (30 Apr 2025): Amends 2019/450 for EADs on insulating foils — potentially relevant to TIP if any foils are used in insulation products
- No other new implementing decisions for thermal insulation found

### CEN Work Programme
- CEN/TC 88 "Thermal insulating materials and products": Active
  - EN 13162–13171 series (factory-made products) — ongoing revisions
  - No specific stage data found for 2025–2026
- ETICS-related work may involve coordination between TC 88 and EOTA

### EOTA
- 18 legacy EADs confirmed in PA 04
- New EAD 042461-00-1201 published May 2025 (green roof mineral wool) — NOT in tracker
- ETAG 004 fully converted to EAD 040083-01-0404 (2025)
- ~798 valid ETAs for ETICS kits

---

## 6. Structural Issues Identified

| # | Severity | Type | Description | Action |
|---|----------|------|-------------|--------|
| 1 | warning | content_data_disagreement | content.standards_landscape says "13 hENs" but standards[] has 12, and standards_summary says "12 hENs + 18 EADs". One hEN may be missing from standards[] or the content narrative is incorrect. | Cross-reference EN 13162–13171 series + EN 14063-1 + EN 16069 + EN 16977 against standards[] to find the discrepancy. |
| 2 | info | new_ead | EAD 042461-00-1201 (hydrophilic mineral wool for green roofs) published May 2025 — NOT in standards[]. | Verify if EAD 042461 should be added to TIP. If so, update ead_count to 19 and total to 31. |
| 3 | info | empty_content | `content.standards_development`, `key_risks`, `sources_summary` empty (3 sections) | Populate with content |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No pipeline changes needed. hEN count discrepancy and new EAD need investigation before changes. | — |

---

## 8. Content Section Updates

### content.key_risks (currently empty)
**Proposed**: "1) ETICS transition: ~798 ETAs under EAD 040083 — massive transition burden if EAD route closes before hEN alternative is ready. 2) hEN count discrepancy: content says 13 but data has 12 — needs resolution. 3) New EAD 042461 (green roof mineral wool) may expand portfolio. 4) Energy efficiency coupling: thermal insulation performance directly impacts building energy requirements under EPBD — regulatory interdependency."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110. S143: nlfnorm.cz harmonised standards database. S144: EOTA EAD database. DIBt hEN list: used for standards verification."

---

## 9. Cross-Family Notes

- **ETICS pathway**: Shared challenge with other families that rely on EADs for kit products (e.g., ROC roof kits). The EAD→hEN transition is a cross-cutting issue.
- **Implementing Decision 2025/871**: EAD for insulating foils — check relevance to both TIP and GLA.
- **EAD 042461** (green roof mineral wool): New EAD May 2025 — also potentially relevant to GEO (geotextiles/green infrastructure) in Batch 8.
- **EPBD coupling**: Thermal insulation is directly referenced in EPBD minimum energy performance requirements. Changes to TIP standards affect building energy calculations.

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in A, 4 in C — 11 total)
- [x] All standards checked against sources (30/30 verified)
- [x] hen_count matches actual hEN count in standards[] (12 hENs — discrepancy with content noted)
- [x] ead_count matches actual EAD count in standards[] (18 EADs)
- [x] DPP date consistent with convergence formula (max(~2029–2032, ~Q1-Q2 2029) = ~2029–2032) ✓
- [x] No duplicate update IDs
- [x] Content sections all non-empty or flagged (3 empty sections flagged)
- [x] Source citations present for all claims
- [x] Cross-family standards noted (ETICS shared pattern, 2025/871 EAD, green roof EAD → GEO)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across Eurima industry association, mineral wool/EPS EPDs, European insulation market, circular economy/recycling, CEN/TC 88 standards, and EUMEPS sector EPDs
**Scope**: Eurima CPR position, Knauf/Rockwool/EUMEPS EPD infrastructure, insulation market sizing, insulation waste recycling, EN 13162–13163 revision status, EPS sector EPDs and c-PCR revision

### S1. Eurima — Supports New CPR, Active on Circular Economy, Mineral Wool 55% of EU Market

Eurima (European Insulation Manufacturers Association) applauds the new CPR text, noting it will create transparency on product performances and enable unified environmental reporting. Eurima's EU legislative interests include CPR & CEN-standardisation, sustainable construction, circular economy, and sustainability assessment. Mineral wool (glass and rock wool) represents about 55% of the EU thermal insulation market, equivalent to almost 150 million m³. The association represents major producers including Knauf Insulation, Rockwool, Saint-Gobain ISOVER, and Paroc. For DPP: Eurima's support for harmonised environmental reporting aligns with DPP requirements — the thermal insulation sector is actively engaged in shaping DPP environmental data frameworks.

**Source**: Eurima (https://www.eurima.org/); Eurima circular economy (https://www.eurima.org/circular-economy); BUILD UP (https://build-up.ec.europa.eu/en/resources-and-tools/links/european-insulation-manufacturers-association-eurima)

### S2. Insulation EPDs — Knauf Insulation and Rockwool Both Publish EN 15804+A2 EPDs

Knauf Insulation publishes comprehensive EN 15804+A2 EPDs for both glass mineral wool (λ ranges 0.031–0.046 W/mK) and rock mineral wool products, available via EPD International and IBU. Rockwool publishes EN 15804+A2 EPDs for low-density and standard rock mineral wool. Both companies provide product-specific EPDs covering multiple thermal conductivity ranges and applications. EPD coverage among the top mineral wool producers is strong. Key limitation: EPD comparability requires EN 15804 compliance — non-EN 15804 EPDs cannot be compared, creating potential DPP data consistency challenges when aggregating across manufacturers.

**Source**: Knauf Insulation Rock Mineral Wool EPDs (https://www.knaufinsulation.com/downloads/environmental-product-declarations-epd/rock-mineral-wool-rmw); Knauf Glass Mineral Wool EPD (https://pim.knaufinsulation.com/files/download/epd_gmw_031_033.pdf); Rockwool EPD (https://www.rockwool.com/siteassets/rw-d/nachhaltigkeit-und-gebaudezertifizierungen/umwelt-produktdeklarationen-epd/wu-epd-low-density-rockwool.pdf)

### S3. European Insulation Market — $21B (2024), EPBD Renovation Wave Targeting 35M Buildings by 2030

The European insulation market was valued at $21.03 billion in 2024, projected to reach $36.52 billion by 2033 (CAGR 6.32%). Building thermal insulation specifically: $10.11 billion (2024). The EPBD renovation wave aims to renovate ~35 million buildings by 2030, nearly doubling the current annual rate. Growth drivers: EPBD recast energy performance requirements, nZEB (nearly Zero Energy Building) standards, and energy price sensitivity post-2022. TIP is among the largest CPR families by market value — insulation demand is directly coupled to building energy policy. The market fragmentation (mineral wool 55%, EPS ~25%, XPS/PUR/PIR ~20%) means DPP must accommodate fundamentally different material types within one family.

**Source**: Market Data Forecast (https://www.marketdataforecast.com/market-reports/europe-insulation-market); Market Data Forecast Thermal (https://www.marketdataforecast.com/market-reports/europe-building-thermal-insulation-market); EUMEPS (https://eumeps.eu/home-insulation)

### S4. Insulation Recycling — Majority Landfilled, EPS ETICS Waste to Triple by 2050, France EPR Leading

Currently, the majority of insulation waste from construction and demolition is landfilled, with European landfill prices reaching €400/tonne. EPS waste from ETICS is expected to almost double by 2030 and triple by 2050 as post-1970s insulated buildings reach end-of-life. Knauf Insulation's RESULATION project converts mineral wool waste into secondary raw materials for new products or ceramics. Rock mineral wool residue can become "recycling bricks" for new production; glass mineral wool scrap can become ceiling tiles. France's Anti-Waste Law introduces Extended Producer Responsibility (EPR) for building materials — manufacturers financially responsible for end-of-life. Austria plans to ban insulation landfill from 2027. For DPP: end-of-life recyclability data and recycled content declarations will be critical for insulation products.

**Source**: Eurima circular economy (https://www.eurima.org/circular-economy); Knauf RESULATION (https://www.resulation.eu/en); Knauf recycling (https://www.knaufinsulation.com/new-era-of-recycling); LIFE ReWo project (https://webgate.ec.europa.eu/life/publicWebsite/project/LIFE22-ENV-IT-LIFE-ReWo-101113855/recycling-mineral-wool-waste-into-high-value-products)

### S5. EUMEPS Sector EPDs — Industry-Wide EPS EPDs Updated 2024, c-PCR Revision Underway

EUMEPS (European Manufacturers of EPS) publishes industry-wide sector EPDs for EPS insulation, updated in 2024 (previous version 2023). EPDs cover multiple density ranges (15 kg/m³, 20 kg/m³, 25 kg/m³, 30 kg/m³) and are compliant with ISO 14025 and EN 15804+A2, verified by IBU. EUMEPS is actively participating in "Navigating the c-PCR EPD Revision for Thermal Insulation" — a collaborative standardisation effort to align complementary PCR (c-PCR) with new CPR environmental requirements. EUMEPS also published a position on mass balance chain-of-custody for EPDs — relevant to chemical recycling and recycled content claims in EPS. This sector EPD approach mirrors FEICA (adhesives) and MPA (aggregates) models — enabling SME-dominated supply chains to declare DPP environmental data.

**Source**: EUMEPS EPD 2024 (https://eumeps.eu/eumeps-newsroom-sie/publications/environmental-product-declaration-for-eps-insulation-2024); EUMEPS EPD 2023 (https://eumeps.eu/eumeps-newsroom-sie/publications/environmental-product-declaration-for-eps-insulation-2023); EUMEPS c-PCR position (https://www.eumeps.eu/eumeps-newsroom-sie/news/collaboration-in-standardisation-navigating-the-c-pcr-epd-revision-for-thermal-insulation); EUMEPS mass balance position (https://www.eumeps.eu/eumeps-newsroom-sie/position-papers/position-on-mass-balance-chain-of-custody-and-environmental-product-declaration-epd)

### S6. CEN/TC 88 Standards — EN 13162–13171 Series, No Specific Revision Timeline Found

CEN/TC 88 "Thermal insulating materials and products" maintains the EN 13162–13171 series of factory-made insulation product standards (one per material type: mineral wool, EPS, XPS, PUR/PIR, phenolic foam, cellular glass, wood fibre, perlite, cork, expanded clay). These standards were last substantially revised around 2012–2015 and are overdue for modernisation under the new CPR framework. No specific 2025–2026 revision project timelines were found in the search results. The SReq (targeted Q3 2026) will trigger the next revision cycle. EN 13162 (mineral wool) and EN 13163 (EPS) are the highest-volume standards. The c-PCR revision for thermal insulation EPDs (S5) may influence environmental data requirements in revised hENs.

**Source**: CEN/TC 88 (https://standards.globalspec.com/std/9928377/EN%2013162); EN 13163 (https://standards.globalspec.com/std/10146297/EN%2013163); Intertek EN 13162 (https://www.intertek.com/building/standards/en-13162/)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 4 | iss-TIP-004 | info | dpp_readiness | Knauf Insulation, Rockwool, EUMEPS all publish EN 15804+A2 EPDs. EUMEPS sector EPDs (2024) enable SME EPS producers. c-PCR revision underway. Strong EPD infrastructure for mineral wool + EPS. |
| 5 | iss-TIP-005 | warning | circular_economy | Majority of insulation waste landfilled (€400/t). EPS ETICS waste to triple by 2050. France EPR for building materials. Austria landfill ban 2027. DPP recyclability data critical. |
| 6 | iss-TIP-006 | info | market_context | European insulation $21B (2024), CAGR 6.32%. EPBD renovation wave targeting 35M buildings by 2030. Among largest CPR families by value. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] Eurima industry position assessed (CPR support, circular economy)
- [x] EPD infrastructure documented (Knauf, Rockwool, EUMEPS sector EPDs)
- [x] European insulation market sized ($21B, CAGR 6.32%)
- [x] Insulation recycling/circular economy assessed (landfill majority, EPS tripling, France EPR)
- [x] CEN/TC 88 standards status checked (no specific revision timelines found)
- [x] EUMEPS sector EPD model and c-PCR revision documented
- [x] All findings connected to explicit sources with URLs
