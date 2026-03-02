# ROC — Roof Coverings: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-27)
**Family**: Annex VII #22 · ROC

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Roof coverings, roof lights, roof windows, and ancillary products - Roof kits |
| Letter | ROC |
| Annex VII # | 22 |
| TC | CEN/TC 128, CEN/TC 254 |
| Standards tracked | 52 (21 hEN + 31 EAD) |
| Active pipelines | A (new-CPR hEN route), C (old EAD sunset) |
| Future pipelines | None |
| DPP estimate | ~2032–2033 |
| SReq status | Not started (targeted 2028) |
| AVCP | System 1 (fire A1–C), System 3 (fire D–F, durability), System 4 (remaining) — per 98/436/EC |
| Last updated | 2026-02-22 |

**Key context**: ROC has the second-largest EAD portfolio (31) after SMP (28) across all 37 families. Products span clay tiles, concrete tiles, fibre-cement slates, bitumen sheets, natural slate, metal sheets, roof lights, roof windows, rigid underlays, and roof kits. The acquis has not started and the SReq is distant (2028), making ROC one of the latest families for regulatory action.

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | not_started | amber | Acquis not started. M-I targeted 2027. | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | not_started | amber | Dependent on M-I. Targeted 2027. | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | amber | No Art. 12 notification. SReq planned 2028. | No change | No change | S30 |
| CEN Standards Development | NT-5 | not_started | gray | Blocked on SReq. | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | No new OJ citations for ROC. 2026/284 does NOT affect this family. | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | ~2032–2033 estimate | No change | No change | S30, S1 |

### Pipeline C — Old EAD Sunset (305/2011)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Legacy EADs Active (31) | NT-C1 | active | green | 31 EADs counted in standards[]. Matches Pipeline C label. | No change | No change | S1, S144 |
| EAD Validity Expires | NT-C2 | pending | green | 9 Jan 2031 confirmed | No change | No change | S1 |
| New EAD / Transition | NT-C3 | not_started | gray | No transition planning found | No change | No change | S1, S98 |
| ETA Validity Expires | NT-C4 | pending | green | 9 Jan 2036 confirmed | No change | No change | S1 |

**Summary**: No pipeline node status changes needed. All nodes accurately reflect current state.

---

## 3. Standards Landscape Update

### hENs (21)

All 21 hENs are cited under CPR 305/2011 via mandate M/121 (OJ C 092/2018). Key standards include EN 490/491 (concrete tiles), EN 1304 (clay tiles), EN 14783 (metal sheets), EN 492/493/494 (fibre-cement), EN 12326 (natural slate), EN 544/13707/13956 (bitumen products), EN 14963 (roof lights), and EN 14509 (sandwich panels — cross-family with SMP and WCF).

### EADs (31)

31 old-regime EADs under CPR 305/2011, primarily AVCP System 1. Covers roof kits, waterproofing kits, roof tiles with special coatings, photovoltaic roof systems, and specialty roofing products.

**Count verification**: 21 hENs + 31 EADs = 52 total. ✓

**Cross-family notes from Batch 1**:
- **EN 14509** (sandwich panels): Flagged in SMP analysis (iss-SMP-003) as cross-listed in SMP, ROC, and WCF. Confirmed present in ROC standards[].
- **EAD 020011** (roof hatches): Flagged in DWS analysis (Batch 1 cross-family note) as potentially overlapping with ROC. Needs verification against ROC's EAD list.

---

## 4. SReq Analysis Update

**Status**: Not started. No Art. 12 notification.

Key facts:
- Per COM(2025) 772: M-I targeted 2027, M-III targeted 2027, SReq targeted 2028
- Acquis not started
- Under CPR 2024/3110
- No delivery or mandatory adoption dates set

**No change to tracker data**: SReq status correctly recorded.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Does NOT affect ROC
- **2025/871** (30 Apr 2025): Amends 2019/450 for EADs on insulating foils and PET foils — may be tangentially relevant to ROC roof underlays but not directly applicable
- No new implementing decisions for roof coverings found in 2025–2026

### CEN Work Programme
- CEN/TC 128: Active for roof covering products. No specific development details found for 2025–2026.
- CEN/TC 254: Flexible sheets for waterproofing. Complements TC 128 for roof systems.

### EOTA
- 31 legacy EADs in PA 22 confirmed
- No new EADs specifically for roof coverings found in 2025–2026 search

---

## 6. Structural Issues Identified

| # | Severity | Type | Description | Action |
|---|----------|------|-------------|--------|
| 1 | info | empty_content | `content.standards_landscape`, `standards_development`, `key_risks`, `sources_summary` all empty (4 sections) | Populate with content |
| 2 | info | cross_family | EN 14509 (sandwich panels) cross-listed in SMP, ROC, WCF — needs consistent data treatment | Verify EN 14509 data matches across SMP, ROC, WCF |
| 3 | info | cross_family | EAD 020011 (roof hatches from DWS) potentially overlaps with ROC EADs | Check if EAD 020011 should also be in ROC standards[] |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No pipeline or standards changes needed. | — |

---

## 8. Content Section Updates

### content.key_risks (currently empty)
**Proposed**: "1) Distant SReq timeline (2028) with acquis not yet started. 2) 31 legacy EADs expire 9 Jan 2031 — only 3 years after planned SReq. No transition planning. 3) EN 14509 (sandwich panels) cross-family consistency risk with SMP and WCF. 4) Fire safety focus (post-Grenfell) — reaction to fire testing dominates AVCP assignments."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110. S143: nlfnorm.cz harmonised standards database. S144: EOTA EAD database."

---

## 9. Cross-Family Notes

- **EN 14509** (sandwich panels): Cross-listed in SMP (Batch 1) and WCF (this batch). Ensure consistent treatment across all three families.
- **EAD 020011** (roof hatches): Flagged in DWS (Batch 1) as potentially overlapping with ROC. Verify if this EAD should appear in ROC's standards[].
- **CEN/TC 128**: Shared between ROC and WCF. Any TC-level changes affect both families.
- **Implementing Decision 2025/871**: New EAD citations for insulating foils — check if any are relevant to ROC roof underlay products.

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in A, 4 in C — 11 total)
- [x] All standards checked against sources (52/52 verified)
- [x] hen_count matches actual hEN count in standards[] (21 hENs)
- [x] ead_count matches actual EAD count in standards[] (31 EADs)
- [x] DPP date consistent with convergence formula (max(~2032–2033, ~Q1-Q2 2029) = ~2032–2033) ✓
- [x] No duplicate update IDs
- [x] Content sections all non-empty or flagged (4 empty sections flagged)
- [x] Source citations present for all claims
- [x] Cross-family standards noted (EN 14509 → SMP/WCF, EAD 020011 → DWS)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Extended Deep-Dive Addendum

**Date**: 2026-03-01
**Research depth**: 8 targeted web searches + 1 EUR-Lex full-text extraction
**Focus**: EPBD solar rooftop interaction, Implementing Decision 2025/871 EAD analysis, BIPV dual-regulation, cool roofs, circular economy

### New Findings

#### 1. Implementing Decision 2025/871 — Three EADs Touch ROC Territory
Full-text analysis of Implementing Decision (EU) 2025/871 (30 April 2025, amending 2019/450) reveals 14 newly cited EADs. Three are directly or tangentially relevant to ROC but are NOT currently in the tracker's standards[]:

- **EAD 042461-00-1201**: "Hydrophilic thermal insulation product of mineral wool for **green roofs**" — directly relevant. Green roof systems are within ROC product scope. This EAD covers the insulation substrate layer.
- **EAD 210195-00-0404**: "Ultra-thin natural stone veneer sheets for **walls and roofs**" — partially relevant. Stone veneer roof applications fall within ROC scope.
- **EAD 230328-00-0108**: "Rubber modified bitumen binders" — relevant. Bituminous roof coverings (EN 544, EN 13707, EN 13956 in hENs) use bitumen binders. This EAD covers a raw material input product.

These are old-regime EADs under CPR 305/2011 but newly OJ-cited in May 2025. The initial report noted 2025/871 as "tangentially relevant" but did not extract the individual EADs. At minimum, EAD 042461 (green roofs) should be evaluated for inclusion in ROC standards[].

#### 2. EPBD Recast 2024/1275 — Solar Rooftop Obligations Create CPR Intersection
The Energy Performance of Buildings Directive recast (Directive (EU) 2024/1275, entered into force 28 May 2024) mandates:

- **Non-residential buildings >250m²**: Solar-ready by 31 December 2026
- **New residential buildings**: Solar-ready by 31 December 2029
- **Transposition deadline**: 29 May 2026
- **BIPV as construction product**: Building-integrated photovoltaics (solar tiles, solar shingles) that provide a construction function beyond energy collection are construction products under CPR 305/2011

This creates a regulatory intersection: roof coverings must accommodate solar installations, and BIPV roof products require dual compliance (CPR for construction performance + EU electrical safety/EMC directives for electrical performance). Several ROC EADs already cover "photovoltaic roof systems" — the EPBD solar obligation will massively increase demand for these products and their regulatory scrutiny.

#### 3. BIPV Products — Dual-Regulation Challenge
BIPV roof products (solar tiles, solar roof panels) sit at the boundary of multiple regulations:
- **CPR**: As construction product (structural, weather protection, fire performance)
- **LVD 2014/35/EU**: Electrical safety
- **EMC 2014/30/EU**: Electromagnetic compatibility
- **WEEE 2012/19/EU**: End-of-life electrical waste
- **Ecodesign (ESPR)**: Possible future coverage for energy-related products

This multi-regulatory overlap is analogous to FFF's situation with electronic fire detection. ROC EADs covering photovoltaic roof systems will need to navigate all of these simultaneously. No harmonised approach to dual CPR/LVD compliance for BIPV exists yet.

#### 4. EN 17190 — Cool Roof Solar Reflectance Standard
EN 17190:2017 "Flexible sheets for waterproofing — Solar Reflectance Index" is an existing standard for measuring solar reflectance of roofing membranes. Under the new CPR's expanded sustainability requirements, solar reflectance could become a declared characteristic for roof coverings. Currently voluntary — no CPR requirement for cool roof performance. However, the EU Climate Adaptation Strategy and EPBD focus on overheating prevention are increasing policy pressure for cool roof provisions, particularly in Southern European member states.

#### 5. Circular Economy — Roof Tile Recyclability
Clay and concrete roof tiles are inherently recyclable (crushed aggregate for construction, landscaping, or as cement/aggregate replacement). A thriving second-hand market exists for reusing clay tiles. Metal roof coverings (EN 14783) are highly recyclable. Under new CPR sustainability requirements, end-of-life recyclability and reusability data will be required in DPPs. Roof coverings are well-positioned for circular economy compliance due to material durability and existing recycling pathways.

#### 6. IFD Roofing Trade Federation — Active in CPR Standardisation
IFD (International Federation for the Roofing Trade) is actively engaged in CEN standardisation and CPR implementation for roof coverings. The IFD Façade Commission specifically discussed the new CPR and its impact on "kits" (relevant to ROC's "roof kits" product scope). No specific public position paper on ROC SReq found.

### Updated Risk Assessment

| Risk | Initial | Extended | Change |
|------|---------|----------|--------|
| EAD count accuracy | Not assessed | Warning (new finding) | 2025/871 contains 2-3 ROC-relevant EADs not in standards[] |
| EPBD/BIPV intersection | Not assessed | Medium | Solar rooftop obligations 2026/2029 drive BIPV demand; dual-regulation |
| Cool roof requirements | Not assessed | Low | EN 17190 exists; no CPR requirement yet but policy momentum growing |
| Circular economy readiness | Not assessed | Low (positive) | Roof tiles well-positioned; existing recycling pathways |

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 4 | iss-ROC-004 | warning | missing_standard | Implementing Decision (EU) 2025/871 cites EAD 042461-00-1201 (green roof mineral wool insulation) — directly relevant to ROC but not in standards[]. EAD 210195-00-0404 (stone veneer for roofs) also potentially in scope. |
| 5 | iss-ROC-005 | info | cross_regulatory | EPBD 2024/1275 mandates solar-ready rooftops (non-residential by Dec 2026, residential by Dec 2029). BIPV products require dual CPR/LVD/EMC compliance. Increases regulatory complexity for photovoltaic roof system EADs. |

### Extended Quality Checklist

- [x] 8 targeted web searches + 1 EUR-Lex extraction completed
- [x] Implementing Decision 2025/871 fully analysed (14 EADs; 2-3 ROC-relevant)
- [x] EPBD solar rooftop obligations documented
- [x] BIPV dual-regulation challenge assessed
- [x] Cool roof standard EN 17190 identified
- [x] Circular economy context assessed (positive for ROC)
- [x] No pipeline node status changes needed
- [x] 1 potential data update: EAD 042461 may need adding to standards[]

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across industry, EPD, BIPV, green roofs, and circular economy sources
**Scope**: Manufacturer EPD readiness, BIPV market expansion, green roof regulatory integration, metal roofing circular economy, market sizing

### S1. Wienerberger EPD Leadership — Clay Tiles, Accessories, and Solar Roof Integration

Wienerberger is the EPD leader in European roof coverings. They publish EPDs for: clay roof tiles & accessories (Germany), clay roof tile products — interlocking, canal, and flat types (France), and notably, the Sandtoft In-Roof Solar system (UK). The Sandtoft In-Roof Solar EPD is significant: it's a BIPV product with both EN 15804 environmental transparency and fire safety certification (BROOF[t4]). The product is fitted directly to roof battens with no trays, compatible with all Sandtoft/Keymer tiles, and manufactured to SA8000 + BRE certified. Wienerberger's solar roof EPD demonstrates that BIPV roof products CAN carry full environmental declarations alongside construction performance data — a DPP-ready product.

**Source**: Wienerberger UK EPD page (https://www.wienerberger.co.uk/about-us/sustainability/environmental-product-declarations.html); Sandtoft In-Roof Solar EPD announcement (https://www.wienerberger.co.uk/about-us/news-blogs/in-roof-solar-epd.html); Sandtoft EPD certificate (https://westech-solar.co.uk/wp-content/uploads/PDFs/Sandtoft-in-roof-solar-EPD-Certification.pdf)

### S2. BIPV Market Expanding — $7.4B to $16.5B by 2033, Heritage Unlocked

The European BIPV market is projected to grow from $7.4B (2022) to $16.5B (2033). Key developments: ML System (Poland) unveiled Photonroof ceramic PV roof tiles (Jan 2026), Roofit.Solar (Estonia) launched in the US (Feb 2026), and Italy's December 2025 heritage reform permits "virtually invisible" solar tiles on protected buildings — unlocking hundreds of thousands of buildings previously off-limits. TOPCon technology dominates (75% market share) while Back Contact targets the premium 15% segment. BIPV products require IEC 61215 (photovoltaic modules) and IEC 61730 (safety qualification) in addition to CPR construction performance requirements. The dual CPR/IEC certification creates a unique DPP data challenge: DPP must carry construction AND electrical performance declarations.

**Source**: Electrek Roofit.Solar US debut (https://electrek.co/2026/02/18/european-company-sleek-solar-roof-just-made-its-us-debut/); PV Magazine ML System (https://www.pv-magazine.com/2026/01/06/ml-system-unveils-solar-facade-panels-roof-integrated-pv-tiles/); Coulee Energy solar roof Europe 2026 (https://couleenergy.com/solar-roof-tiles-integrated-solar-roofing-systems-in-europe-2026/)

### S3. Green Roofs — EPBD Recognition Creates CPR Product Demand

Green roofs are acknowledged for the first time in the EPBD recast (Directive 2024/1275): EU countries must consider green roofs when meeting solar energy obligations. The EU Climate Adaptation Strategy highlights green roofs for urban heat island mitigation (surface temperature reduction of 20-30°C) and stormwater management. The European Federation of Green Roof and Wall Associations (EFB) is actively engaged with UNEP's GlobalABC on green roof policy integration. German FLL guidelines remain the global reference for green roof design, while Swiss SIA guidelines prioritize biodiversity. EAD 042461-00-1201 (hydrophilic mineral wool for green roofs), newly cited via Implementing Decision 2025/871, provides the first harmonised product assessment for green roof components. Green roofs create DPP complexity: multi-layer systems (waterproofing membrane + insulation substrate + drainage + growing medium + vegetation) may require component-level and system-level DPP data.

**Source**: World Green Infrastructure Network EPBD recognition (https://worldgreeninfrastructurenetwork.org/green-roof-acknowledged-for-the-first-time-in-epbd/); EFB/UNEP/GlobalABC report (https://globalabc.org/sites/default/files/2025-02/EFB_ENZI_UNEP_GLOBALABC_06_02_2025.pdf); EU Climate Adaptation Strategy green roofs (https://worldgreeninfrastructurenetwork.org/green-roofs-eu-climate-strategy/)

### S4. Metal Roofing Circular Economy — 30-95% Recycled Content, 100% Recyclable

Metal roofing (EN 14783 in ROC standards[]) has strong circular economy credentials: 30-60% recycled content typical, up to 95% for some products. Aluminum roofing: up to 85% recycled content (60% post-consumer). Steel roofing: structural steel contains 90%+ recycled content. Service life 50-70 years. 100% recyclable at end of life. Recycled steel requires only 26% of virgin production energy; recycled aluminum just 5%. These metrics are DPP-ready — metal roofing manufacturers can declare recycled content and end-of-life recyclability with confidence. Contrasts with bitumen sheet products (EN 544, EN 13707) where recycled content and end-of-life recycling data is less straightforward.

**Source**: Drexel Metals sustainability (https://www.drexmet.com/blog/how-are-metal-roofs-sustainable-lets-count-the-ways/); Metal Construction Association recycled content (https://metalconstruction.org/index.php/online-education/recycled-content-of-metal-roofing-and-siding-panels); Garland UK circular economy (https://garlanduk.com/blog/roofing-construction-circular-economy/)

### S5. European Roofing Market — €131B (2024), Germany 31% Market Share

The European roofing materials market was valued at $131.45B (2024), growing at CAGR 3.67% to 2033. Germany dominates with >31% market share. Germany, France, and Nordic countries lead green building, driving demand for recycled metal, clay tile, and synthetic membranes. Clay tiles have an embodied carbon payback within 5 years due to thermal mass. Concrete tiles require 40% fewer replacements than asphalt shingles. The market's size ($131B+) and the diversity of materials (clay, concrete, metal, fibre-cement, natural slate, bitumen, synthetic membranes, BIPV) make ROC one of the most commercially significant CPR product families for DPP implementation.

**Source**: Mordor Intelligence Europe roof tiles market (https://www.mordorintelligence.com/industry-reports/europe-roofing-tiles-market); Market Data Forecast Europe roofing (https://www.marketdataforecast.com/market-reports/europe-roofing-materials-market); Research and Markets Europe roofing (https://www.researchandmarkets.com/reports/6096336/europe-roofing-market-report-forecast)

### S6. BMI Group (Braas/Icopal) — Largest European Roofing Manufacturer

Standard Industries combined Braas Monier (pitched roofing) and Icopal (flat roofing) to form BMI Group — the largest manufacturer in the European roofing industry. BMI covers both pitched (concrete tiles, clay tiles, roof accessories) and flat roof technologies (bitumen membranes, synthetic membranes). Despite market leadership, no BMI Group EPDs were found in this research — contrasting with Wienerberger's EPD programme. The EPD readiness gap between market leaders (Wienerberger: multiple EPDs including BIPV) and the largest manufacturer (BMI: no EPDs found) mirrors the pattern seen in other families (e.g., Kronospan vs EGGER in WBP).

**Source**: BMI Group (https://bmigroupinternational.com/); Braas Monier Wikipedia (https://en.wikipedia.org/wiki/Braas_Monier_Building_Group)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 6 | iss-ROC-006 | info | dpp_readiness | Wienerberger leads ROC EPD readiness (clay tiles DE/FR + Sandtoft In-Roof Solar UK), but BMI Group (largest EU roofing manufacturer) has no EPDs found. Split industry readiness. |
| 7 | iss-ROC-007 | info | dpp_complexity | BIPV roof products require dual DPP data: construction performance (CPR) + electrical performance (IEC 61215/61730). No harmonised approach to dual-regulation DPP exists. |
| 8 | iss-ROC-008 | info | regulatory_development | Green roofs recognised in EPBD for first time. EAD 042461 (green roof mineral wool) newly cited. Multi-layer green roof systems create component vs system DPP data challenge. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] Manufacturer EPD readiness assessed (Wienerberger leads, BMI gap)
- [x] BIPV market expansion documented ($7.4B→$16.5B, heritage unlocked)
- [x] Green roof EPBD recognition and EAD 042461 context documented
- [x] Metal roofing circular economy credentials assessed (30-95% recycled)
- [x] Market size documented ($131B, Germany 31%)
- [x] BMI Group market leadership vs EPD gap identified
- [x] All findings connected to explicit sources with URLs
