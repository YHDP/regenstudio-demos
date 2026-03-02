# Deep Dive: AGG — Aggregates

**Family**: Annex VII #24 · AGG
**Full Name**: Aggregates
**Date**: 2026-03-01
**Batch**: 4 (Concrete & Mortar)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| TC | CEN/TC 154 |
| Standards | 8 (7 hEN + 1 EAD) |
| Pipelines | A (new-CPR hEN), C (old EAD sunset) |
| Acquis | Yes (ongoing) |
| SReq | Not adopted — targeted Q1 2027 |
| DPP Estimate | ~2030–2032 |
| AVCP | 2+, 4 |

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-2 Milestone I | in_progress | amber | ✅ Correct — acquis ongoing |
| NT-3 Milestone III | not_started | amber | ✅ Correct — Q2 2026 target |
| NT-4 SReq | not_started | amber | ✅ Correct — Q1 2027 target per COM(2025) 772 |
| NT-5 CEN Development | in_progress | amber | ✅ Correct — prEN 17555-1 consolidation active |
| NT-7 OJ Citation | pending | gray | ✅ Correct — future |
| NT-8 Coexistence | pending | gray | ✅ Correct — future |
| NT-9 HTS In Force | pending | orange | ✅ Correct — ~2030–2032 |

### Pipeline C — Old EAD Sunset

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-C1 Legacy EADs (1) | active | green | ✅ Correct — 1 EAD (waste-derived aggregates) |
| NT-C2 EAD Expiry 2031 | pending | green | ✅ Correct |
| NT-C3 New EAD/Transition | not_started | gray | ✅ Correct |
| NT-C4 ETA Expiry 2036 | pending | green | ✅ Correct |

**Pipeline verdict**: All nodes accurate. No changes needed.

---

## 3. Standards Landscape Update

### hEN Standards (7)

| Standard | AVCP | Cited | Stage | Notes |
|----------|------|-------|-------|-------|
| EN 12620 | 2+ | Yes | CPR 2011 | Aggregates for concrete — formal objection pending, prEN 17555-1 consolidation |
| EN 13043 | 2+, 4 | Yes | CPR 2011 | Aggregates for bituminous mixtures — consolidation target |
| EN 13055 | 2+, 4 | Yes | CPR 2011 | Lightweight aggregates — consolidation scope unclear |
| EN 13139 | 2+, 4 | Yes | CPR 2011 | Aggregates for mortar — consolidation target |
| EN 13242 | 2+ | Yes | CPR 2011 | Aggregates for unbound/hydraulically bound — consolidation target |
| EN 13383-1 | 2+, 4 | Yes | CPR 2011 | Armourstone |
| EN 13450 | 2+, 4 | Yes | CPR 2011 | Railway ballast |

### Key development: prEN 17555-1 Consolidation

CEN/TC 154 is working on prEN 17555-1 "Aggregates for construction works — Part 1" to consolidate multiple existing aggregate standards (EN 12620, EN 13043, EN 13139, EN 13242, possibly EN 13055) into a single comprehensive standard. The project reached CEN Enquiry stage (~40.60) around 2021, but current status is unclear. This consolidation effort could significantly simplify the aggregates standards landscape.

EN 12620 has had a formal objection pending since ~2015. This is the longest-standing formal objection in the Batch 4 families.

### EAD Standards (1)

| EAD | Name | AVCP | Cited | Expires |
|-----|------|------|-------|---------|
| EAD 240002-00-0108 | Processed MSWI bottom ash aggregates for unbound road materials | 2+ | Yes | 9 Jan 2031 |

The single EAD represents a circular economy product: municipal solid waste incineration (MSWI) bottom ash processed into aggregates for road construction.

### New/Changed Standards

No new standards found. prEN 17555-1 consolidation progress unclear.

---

## 4. SReq Analysis Update

SReq not yet adopted. COM(2025) 772 Table 3 targets:
- Milestone I: ongoing
- Milestone III: Q2 2026
- SReq: Q1 2027
- Delivery: 2029

The acquis sub-group is established. CEN/TC 154 is the primary TC. The existing aggregate standards are expected to be revised under the future SReq. If prEN 17555-1 consolidation succeeds, it could dramatically change the standards landscape from 7 separate hENs to a single comprehensive standard.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- No new implementing decisions affecting AGG in 2025–2026

### CEN Work Programme
- CEN/TC 154 active
- prEN 17555-1 consolidation confirmed but current development stage unclear
- EN 12620 formal objection still pending

### EOTA
- 1 legacy EAD in PA 24 confirmed
- No new EADs for aggregates found

### EC Notifications
- No Art. 12 notification for AGG

---

## 6. Structural Issues Identified

| ID | Severity | Type | Description |
|----|----------|------|-------------|
| iss-AGG-001 | info | standards_development | prEN 17555-1 consolidation status unclear — stage reached 40.60 in 2021 but no recent progress confirmed. May affect future standards landscape |
| iss-AGG-002 | info | empty_content | 5 content sections empty: standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary |

---

## 7. Proposed Data Changes Summary

| # | Action | Field | Current | Proposed |
|---|--------|-------|---------|----------|
| — | No data changes proposed | — | — | — |

---

## 8. Content Section Updates

No content changes proposed.

---

## 9. Cross-Family Notes

- **EN 13242 (AGG → CIF?)**: Aggregates for unbound and hydraulically bound materials may have relevance to CIF (Civil Infrastructure Facilities). To be checked in Batch 5.
- **EAD 240002 (MSWI bottom ash)**: Circular economy product — waste-to-aggregate. Similar circular economy EADs exist in CMG (19 EADs including waste-derived innovations).
- **AGG has the smallest EAD portfolio in Batch 4** (1 EAD) — minimal Pipeline C complexity.

---

## 10. Quality Checklist

- [x] Standards count verified: 7 hEN + 1 EAD = 8 ✓
- [x] NT-C1 EAD count matches standards[]: 1 ✓
- [x] All pipeline nodes reviewed
- [x] Convergence formula verified: max(~2030–2032, ~Q1-Q2 2029) = ~2030–2032 ✓
- [x] No duplicate update IDs
- [x] Cross-family standards checked
- [x] Empty content sections documented
- [x] EUR-Lex checked for new implementing decisions
- [x] EOTA checked for new EADs
- [x] Review-queue JSON written

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across industry associations, EPD infrastructure, standards consolidation, circular economy CDW, and market data
**Scope**: UEPG/Aggregates Europe coordination, aggregate EPD landscape, prEN 17555-1 consolidation status, construction demolition waste recycled aggregates, MPA sector EPD model, European aggregates market

### S1. UEPG/Aggregates Europe — 3 Billion Tonnes, 15,000 Companies, 2030 Roadmap

UEPG (now Aggregates Europe) represents the European aggregates industry: 3 billion tonnes annual production, 15,000 companies operating 26,000 quarry/plant sites, employing 187,000 people across 25 countries. UEPG's 2030 Roadmap (launched September 2021 in Brussels) identifies challenges and opportunities including CPR implementation and sustainability reporting. The association explicitly engages with the new CPR, recognising that the European Green Deal goals mean "sustainability and providing environmental data is key and a big part of the CPR." The industry's scale — 3 billion tonnes is the largest by mass of any CPR product family — makes DPP implementation a significant challenge, especially for the overwhelmingly SME-dominated quarrying sector. UEPG's lobbying expenditure confirms active Brussels engagement on construction product regulation.

**Source**: Aggregates Europe/UEPG (https://www.aggregates-europe.eu/); UEPG Standards page (https://uepg.eu/pages/standards); Aggregates Business UEPG Congress report (https://www.aggbusiness.com/feature/mapping-out-future-european-aggregates); UEPG Annual Review 2020-2021 (https://www.aggregates-europe.eu/wp-content/uploads/2023/03/Final_-_UEPG-AR2020_2021-V05_spreads72dpiLowQReduced.pdf)

### S2. MPA Sector EPD Model — Collective Industry EPDs as DPP Template

The UK Mineral Products Association (MPA) has developed the most advanced collective EPD programme for aggregates, covering 90% of UK aggregates production, 100% of cement, 95% of asphalt, and 70%+ of ready-mixed concrete. MPA "sector EPDs" aggregate data from all member production sites into independently verified declarations per EN 15804+A2. Benefits: industry baseline that is independently verified, early-stage design data before manufacturer selected, benchmarking tool for individual producers, and reference EPDs for manufacturers without their own declarations. In 2024, MPA published sector-first UK EPDs for asphalt. In 2025, MPA Precast and MPA Masonry published 6 new sector EPDs (concrete blocks, aircrete, hollowcore, T-beams). This model — where an industry association aggregates member data into sector-wide EPDs — could serve as a template for DPP environmental data across Europe's 15,000 aggregate producers, most of whom are too small for individual EPDs.

**Source**: MPA EPDs and EN 15804 (https://www.concretecentre.com/Codes/Environmental-Assessment/EPD.aspx); MPA sector-first asphalt EPDs (https://mineralproducts.org/News/2024/release17.aspx); MPA Cement UK Sector EPDs on EPD International (https://www.environdec.com/library/collection/col100); MPA (https://www.mineralproducts.org/)

### S3. prEN 17555-1 Consolidation — CEN Enquiry Reached, Harmonised Standard Pending

prEN 17555-1 "Aggregates for construction works — Part 1" is confirmed as an active CEN/TC 154 project (CEN Project 72180). The standard aims to consolidate EN 12620 (concrete aggregates), EN 13043 (bituminous mixture aggregates), EN 13139 (mortar aggregates), EN 13242 (unbound/hydraulically bound), and possibly EN 13055 (lightweight) into a single harmonised standard. The project reached CEN Enquiry stage around 2021, with draft documents available (oSIST prEN 17555-1:2021). A Part 2 (prEN 17555-2) also exists for non-harmonised requirements. If adopted, this would reduce AGG from 7 hENs to potentially 1–2 standards — the most significant consolidation in any CPR family. However, the long gap since CEN Enquiry (2021 → 2026) suggests either delays or difficulties in achieving consensus across 25+ national standards bodies.

**Source**: Genorma prEN 17555-1 (https://genorma.com/en/project/show/cen:proj:72180); iTeh prEN 17555-1 (https://standards.iteh.ai/catalog/standards/cen/ddfe83de-3f5d-4f55-b286-3d5b03709e29/pren-17555-1); CEN/TC 154 (https://standards.iteh.ai/catalog/tc/cen/4389f199-f891-4cc0-937b-a36d71be8b77/cen-tc-154); DIN EN 17555-2 (https://www.dinmedia.de/en/draft-standard/din-en-17555-2/337705134)

### S4. Construction & Demolition Waste Recycled Aggregates — 1/3 of EU Waste Stream

Construction and demolition waste (CDW) accounts for more than one-third of all waste generated in the EU — the single largest waste stream. The Waste Framework Directive set a 70% recovery target by 2020. However, EEA reports that high CDW recovery rates are based largely on backfilling or low-grade recovery (road sub-bases), not high-quality recycling into new construction products. EuRIC advocates EU-level end-of-waste regulations for C&D waste to strengthen trust in recycled aggregates. The EAD 240002-00-0108 (MSWI bottom ash aggregates) in AGG's standards list represents one pathway for waste-to-aggregate products. DPP data for recycled aggregates would need to declare: waste origin, processing method, end-of-waste certification status, and performance characteristics. This circular economy dimension is a key differentiator for AGG's DPP data architecture.

**Source**: EEA CDW practices (https://www.eea.europa.eu/highlights/improving-circular-economy-practices-in); EEA CDW challenges (https://www.eea.europa.eu/publications/construction-and-demolition-waste-challenges/construction-and-demolition-waste-challenges); EC CDW policy (https://environment.ec.europa.eu/topics/waste-and-recycling/construction-and-demolition-waste_en); EC end-of-waste criteria (https://circular-cities-and-regions.ec.europa.eu/support-materials/projects/end-waste-criteria-protocol-recycled-waste-used-aggregates)

### S5. European Aggregates Market — $61–106B, Largest-by-Mass CPR Family

The European construction aggregates market was valued at $61.4–105.7 billion in 2024 (estimates vary by source and scope definition), projected to reach ~$146B by 2032 (CAGR 4.13%). UEPG reports 3 billion tonnes annual production — making aggregates the largest CPR product family by physical mass, orders of magnitude above cement (~185 Mt), asphalt (~209 Mt), or steel. EU-specific forecast: 1,374 Mt gravel/pebbles/crushed stone for concrete and road aggregates by 2035. The industry structure — 15,000 companies, mostly SME quarries — presents a unique DPP implementation challenge: unlike cement (few large producers) or steel (consolidated), aggregates has the most fragmented producer base of any CPR family.

**Source**: Fortune Business Insights (https://www.fortunebusinessinsights.com/europe-construction-aggregates-market-104698); Credence Research (https://www.credenceresearch.com/report/europe-construction-aggregates-market); IndexBox EU aggregates (https://www.indexbox.io/store/european-union-natural-construction-aggregates-market-analysis-forecast-size-trends-and-insights/); Mordor Intelligence (https://www.mordorintelligence.com/industry-reports/aggregates-market)

### S6. Aggregate-Specific EPDs Emerging Across Europe — Individual Quarry Declarations

Beyond collective/sector EPDs, individual quarry-level aggregate EPDs are appearing across Europe: Interbeton limestone aggregates EPD from Xirorema Quarry (Greece, EN 15804 verified), Trzuskawica S.A. basalt aggregates EPD (Poland, ITB-verified EN 15804+A2), OCO Technology carbon-negative aggregates EPD (UK, produced from industrial waste CO₂). New Zealand/Australia Drury aggregate EPD registered on EPD International demonstrates global convergence on the EN 15804 framework. EPD cradle-to-gate (A1-A3) for aggregates covers material extraction, crushing, screening, and transport — relatively simple LCA compared to manufactured products. The OCO Technology example (carbon-negative aggregates from waste CO₂) is noteworthy for DPP: circular economy products may show negative GWP, requiring DPP data fields to handle negative environmental impact values.

**Source**: Interbeton Xirorema EPD (https://interbeton.gr/wp-content/uploads/2023/07/EPD-_Latomeio-Xirorematos.pdf); Trzuskawica basalt EPD (https://www.itb.pl/wp-content/uploads/2025/01/ITB-EPD_706_Trzuskawica-S.A.-for-BASALT-AGGREGATES.pdf); OCO Technology carbon-negative EPD (https://oco.co.uk/wp-content/uploads/2022/06/Environmental-Product-Declaration.pdf); EPD International aggregate entries (https://www.environdec.com/library)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 3 | iss-AGG-003 | info | dpp_readiness | MPA sector EPD model (90% UK aggregates coverage) as template for EU-wide DPP data. Individual quarry EPDs emerging (Greece, Poland, UK). SME-dominated industry (15,000 companies) needs collective approach. |
| 4 | iss-AGG-004 | info | circular_economy | CDW = 1/3 of EU waste. Recycled aggregates via end-of-waste criteria needed for DPP recycled content declarations. EAD 240002 (MSWI ash) + OCO carbon-negative aggregates show circular pathways. |
| 5 | iss-AGG-005 | warning | market_context | 3 billion tonnes/year, $61-106B market, 15,000 companies — largest-by-mass CPR family with most fragmented producer base. DPP implementation challenge for SME quarries. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] UEPG/Aggregates Europe industry structure documented (3Bt, 15,000 companies)
- [x] MPA sector EPD model assessed (90% coverage, collective DPP template)
- [x] prEN 17555-1 consolidation status updated (CEN Enquiry 2021, gap to 2026)
- [x] CDW recycled aggregates circular economy dimension documented
- [x] Market sizing obtained ($61-106B, largest-by-mass CPR family)
- [x] Individual quarry EPDs documented (Greece, Poland, UK carbon-negative)
- [x] All findings connected to explicit sources with URLs
