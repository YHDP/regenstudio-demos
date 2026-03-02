# Deep Dive: RCP — Road Construction Products

**Family**: Annex VII #23 · RCP
**Full Name**: Road construction products
**Date**: 2026-03-01
**Batch**: 5 (Civil Engineering)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| TC | CEN/TC 227 (+ TC 336, TC 154) |
| Standards | 28 (28 hEN + 0 EAD) |
| Pipelines | A only (hEN-only) |
| Acquis | No |
| SReq | Not adopted — targeted 2027 |
| DPP Estimate | ~2032–2033 |
| AVCP | Uniformly 2+ |

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-2 Milestone I | not_started | amber | ✅ Correct — acquis not started, Q1 2026 target |
| NT-3 Milestone III | not_started | amber | ✅ Correct — Q3 2026 target |
| NT-4 SReq | not_started | amber | ✅ Correct — 2027 target |
| NT-5 CEN Development | not_started | gray | ✅ Correct — no active revisions found |
| NT-7 OJ Citation | pending | gray | ✅ Correct |
| NT-8 Coexistence | pending | gray | ✅ Correct |
| NT-9 HTS In Force | pending | orange | ✅ Correct — ~2032–2033 |

**No Pipeline C** — hEN-only family (0 EADs).

**Pipeline verdict**: All nodes accurate. No changes needed.

---

## 3. Standards Landscape Update

### hEN Standards (28) — Three Series

**EN 13108 Bituminous mixtures (9 parts)**: Parts 1–7, 20, 21. All AVCP 2+, TC 227.
**EN 14227 Hydraulically bound mixtures (6 parts)**: Parts 1, 2, 3, 5, 10, 13, 14, 15. All AVCP 2+, TC 227.
**Bitumen binders (4)**: EN 12591, EN 13924-1/2, EN 14023, EN 13808. All AVCP 2+, TC 336.
**Surface treatments (2)**: EN 12271, EN 12273. AVCP 2+, TC 227.
**Aggregates (3)**: EN 13043, EN 13242, EN 13055. AVCP 2+, TC 154. **Cross-listed with AGG.**
**Unbound mixtures**: EN 13285. AVCP 2+, TC 227.

### Cross-Family Standards

Three standards cross-listed with AGG (Batch 4):
- **EN 13043**: RCP records AVCP "2+" vs AGG "2+, 4" — **mismatch**
- **EN 13055**: RCP records AVCP "2+" vs AGG "2+, 4" — **mismatch**
- **EN 13242**: Both record AVCP "2+" — consistent

### New/Changed Standards

No new standards found for RCP in 2025–2026.

---

## 4. SReq Analysis Update

Not yet adopted. COM(2025) 772 targets: M-I Q1 2026, M-III Q3 2026, SReq 2027. Acquis not started. No standards delivery dates set.

---

## 5. Regulatory Landscape Changes

No new implementing decisions. CEN/TC 227 active but no specific EN 13108 revisions found. CEN/TC 336 (bitumen binders) similarly quiet.

---

## 6. Structural Issues Identified

| ID | Severity | Type | Description |
|----|----------|------|-------------|
| iss-RCP-001 | warning | cross_family | EN 13043 and EN 13055 AVCP mismatch between RCP ("2+") and AGG ("2+, 4"). RCP may be missing System 4 entries. |
| iss-RCP-002 | info | empty_content | 3 content sections empty: stakeholder_notes, key_risks, sources_summary |

---

## 7. Proposed Data Changes Summary

No data changes proposed. Cross-family AVCP issues need verification before changes.

---

## 8–9. Content / Cross-Family Notes

- **EN 13043/EN 13055/EN 13242 (RCP ↔ AGG)**: Three TC 154 aggregate standards shared. AVCP mismatches on two.
- **RCP is the largest hEN-only family** (28 hEN, 0 EAD) — no Pipeline C complexity.
- **Uniform AVCP 2+** across all 28 standards — simplest AVCP landscape seen.

---

## 10. Quality Checklist

- [x] Standards count verified: 28 hEN + 0 EAD = 28 ✓
- [x] No Pipeline C — correct (no EADs)
- [x] All pipeline nodes reviewed
- [x] Convergence formula verified: max(~2032–2033, ~Q1-Q2 2029) = ~2032–2033 ✓
- [x] Cross-family standards flagged (EN 13043, EN 13055, EN 13242)
- [x] Empty content sections documented
- [x] EUR-Lex, EOTA, EC checked
- [x] Review-queue JSON written

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across industry associations, EPD infrastructure, circular economy, LCA methodology, decarbonisation technologies, and market data
**Scope**: EAPA/Eurobitume coordination, asphalt EPD landscape, RAP recycling rates, Eurobitume LCA 4.0 GWP revision, warm mix asphalt decarbonisation, European road construction market

### S1. Eurobitume LCA 4.0 (2025) — Bitumen GWP Doubles to 530 kg CO₂e/tonne

Eurobitume published LCA Report 4.0 in 2025, the definitive lifecycle dataset for paving-grade bitumen in Europe. The headline finding: Global Warming Potential (GWP100) for refined bitumen is now 530 kg CO₂e per tonne — more than double the previous LCA 3.1 value of 216 kg CO₂e/t. The increase is due to more accurate accounting of methane emissions from crude oil extraction, not increased actual emissions. Roughly 70% of bitumen's climate impact stems from oil extraction and refining. Data gathered from 17 European refineries covering 75%+ of Eurobitume members' production. Critically, LCA 4.0 outputs are compatible with EN 15804+A2, making the data directly usable for future DPP environmental declarations. This is the single most important LCA development for road construction products.

**Source**: Eurobitume LCA 4.0 (https://eurobitume.eu/lca_4-0_news/); Eurobitume LCA 4.0 PDF (https://eurobitume.eu/wp-content/uploads/2025/03/EB-LCA-4.0-2025.pdf); Nynas coverage (https://www.nynas.com/en/news/newslist/eurobitume-lca-4.0-a-more-accurate-picture-of-bitumens-climate-impact); AsphaltPro analysis (https://theasphaltpro.com/understanding-the-environmental-impact-of-bitumen-insights-from-eurobitumes-lca-4-0/)

### S2. Asphalt EPDs Growing in European Public Tenders — Reliability Challenges Remain

Demand for asphalt mixture EPDs is growing, particularly in European public road construction tenders. Examples include McGrath's Limestone Asphalt AC 10 close surface EPD (Ireland, IGBC-verified, EN 15804+A2), Skanska/NCC asphalt EPDs registered on EPD International (Sweden), and Colas cold mix asphalt EPD (Iceland/Nordic). However, EPD reliability and comparability remain limited due to: (i) significant variability in dataset selection for bitumen and aggregates, and (ii) uncertainty about operational factors (aggregate moisture, mixing temperature, transportation mode). Reducing aggregate moisture from 5% to 3% achieves 3.2% environmental impact reduction; lowering mixing temperature to 130°C gives 1.6% decrease. Standardising datasets is essential for fair, transparent DPP generation. The Eurobitume LCA 4.0 helps solve the bitumen input data problem but aggregate variability remains.

**Source**: MDPI Sustainability 17(20):9349 (https://www.mdpi.com/2071-1050/17/20/9349); McGrath's EPD via IGBC (https://www.igbc.ie/wp-content/uploads/2025/10/EPD-McGraths-Limestone-Asphalt-AC-10-close-surf-70-100-des-EPDIE-25-244.pdf); EPD International asphalt entries (https://www.environdec.com/library/epd22803); NAPA PCR for asphalt mixtures (https://www.asphaltpavement.org/uploads/documents/EPD_Program/NAPA_PCR_AsphaltMixtures_v2.pdf)

### S3. RAP Recycling — 45.5 Mt Available Annually, 76% Reused in Asphalt Mixes

Reclaimed Asphalt Pavement (RAP) is the most recycled construction material in Europe. EAPA reports approximately 45.5 megatonnes of reclaimed asphalt available annually across Europe, with 23.2 Mt actually utilised in asphalt production. Seventeen European countries produce nearly 36 Mt of RAP, with 76% reused in asphalt mixes. The industry re-uses 65–75% in new asphalt (hot/warm mix), recycles 25–35% as granular material for unbound layers, with only ~5% to landfill. Asphalt is 100% recyclable — demonstrated in multiple projects using 100% reclaimed material. However, typical RAP incorporation rates are limited to 10–30% by national specifications, due to variability concerns. This circular economy data is directly relevant to DPP recycled content and end-of-life declarations. EN 13108-8 (Reclaimed asphalt) is the specific RCP standard governing RAP specifications.

**Source**: EAPA Recycling (https://eapa.org/recycling/); EAPA Asphalt in Figures (https://eapa.org/asphalt-in-figures/); CAPRI project RAP overview (https://www.capri-project.com/news-1/the-importance-of-re-userecycle-rap-quick-overview-in-europe); MDPI Infrastructures 9(8):128 (https://www.mdpi.com/2412-3811/9/8/128)

### S4. Warm Mix Asphalt — 15%+ CO₂ Reduction, Growing EU Production Share

Warm Mix Asphalt (WMA) technologies allow production at 110–140°C versus 150–180°C for conventional Hot Mix Asphalt (HMA), delivering 15%+ CO₂ reduction per tonne. EAPA published "Recommendations for Road Authorities" (2024) promoting WMA for sustainability, health & safety, and quality. Combining WMA with 30–70% RAP can reduce emissions by up to 40%. Heidelberg Materials UK's ULTILOW product demonstrates commercial WMA deployment. EAPA also published "Towards Net Zero" (2024) setting out the asphalt industry's decarbonisation pathway. Total EU-27 HMA+WMA production in 2024 was 208.5 million tonnes (268.7 Mt including non-EU countries). The WMA share is increasing but HMA still dominates. EN 13108 series covers both HMA and WMA — no separate standard needed, but DPP data must capture production temperature and method for accurate GWP calculation.

**Source**: EAPA WMA Recommendations (https://horizoneuropencpportal.eu/sites/default/files/2024-06/eapa-recommendations-for-road-authorities-to-optimise-paving-sustainability-health-safety-and-quality-through-the-use-of-warm-mix-asphalt-2024.pdf); EAPA Towards Net Zero (https://horizoneuropencpportal.eu/sites/default/files/2025-01/eapa-towards-net-zero-2024.pdf); EAPA Asphalt in Figures (https://eapa.org/asphalt-in-figures/); Springer WMA review (https://link.springer.com/article/10.1007/s41062-026-02488-2)

### S5. EAPA + Eurobitume — Joint Industry Voice for Road Construction Products

EAPA (European Asphalt Pavement Association) and Eurobitume (European Bitumen Association) coordinate as the joint industry voice for road construction products. Their joint E&E Event 2026 brings together the full value chain. EAPA covers asphalt producers (EN 13108 products), Eurobitume covers bitumen producers (EN 12591, EN 13924, EN 14023, EN 13808). EAPA's "Asphalt 4.0" digital transformation initiative explores BIM integration, digital twins, and data-driven quality management — directly relevant to DPP digital infrastructure. Eurobitume's sustainability programme includes the LCA database, carbon footprint methodology, and end-of-life recycling guidance. Together they cover all RCP's 28 hENs. EU transport authorities earmarked €7 billion for road modernisation in 2024, with Germany alone spending €2.8 billion annually on motorway upgrades.

**Source**: E&E Event 2026 (https://www.eeevent2026.org/about-eapa-and-eurobitume); EAPA (https://eapa.org/); Eurobitume (https://eurobitume.eu/); EAPA Asphalt 4.0 (https://eapa.org/asphalt-4-0-digital-transformationdigital-transformation); EAPA Mission (https://eapa.org/eapa/)

### S6. European Bitumen/Asphalt Market — $20.5B Bitumen, 208.5 Mt Production

The European bitumen market was valued at approximately $20.48 billion in 2024, with road construction accounting for 85.5% of market share. EU-27 asphalt production reached 208.5 million tonnes in 2024. The EU bitumen market is projected to reach ~$21.5B in 2025. This makes RCP one of the highest-volume CPR families by production tonnage — 208.5 Mt dwarfs most other construction product categories. Germany is the largest national market (€2.8B/year motorway spending alone). The modified bitumen segment (EN 14023, EN 13808 — polymer-modified binders) is growing fastest, driven by performance requirements for heavy traffic roads. Market scale implies massive DPP compliance volume when RCP eventually enters CPR scope (~2032–2033), though the AVCP 2+ (manufacturer + notified body) regime provides a compliance framework already used for CE marking.

**Source**: Market Data Forecast Europe Bitumen (https://www.marketdataforecast.com/market-reports/europe-bitumen-market); Mordor Intelligence (https://www.mordorintelligence.com/industry-reports/europe-bitumen-market); IndexBox EU asphalt overview (https://www.indexbox.io/blog/asphalt-or-bitumen-article-european-union-market-overview-2024-6/); EAPA Asphalt in Figures (https://eapa.org/asphalt-in-figures/)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 3 | iss-RCP-003 | warning | dpp_data | Eurobitume LCA 4.0 (2025) doubles bitumen GWP to 530 kg CO₂e/t (was 216 kg). EN 15804+A2 compatible. All RCP EPDs and future DPP GWP declarations must use updated figure. |
| 4 | iss-RCP-004 | info | circular_economy | RAP recycling: 45.5 Mt available/yr, 76% reused. 100% recyclability demonstrated. DPP recycled content data directly available. RAP incorporation limits (10-30%) vary by country. |
| 5 | iss-RCP-005 | info | market_context | EU-27 asphalt 208.5 Mt production (2024), ~$20.5B bitumen market, 85.5% to road construction. One of highest-volume CPR families. Massive future DPP compliance volume. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] Eurobitume LCA 4.0 GWP revision documented (530 vs 216 kg CO₂e/t)
- [x] Asphalt EPD landscape assessed (growing but reliability challenges)
- [x] RAP recycling rates quantified (45.5 Mt available, 76% reused)
- [x] WMA decarbonisation pathway documented (15%+ CO₂ reduction)
- [x] EAPA + Eurobitume industry coordination mapped
- [x] Market sizing obtained ($20.5B bitumen, 208.5 Mt asphalt, €7B road modernisation)
- [x] All findings connected to explicit sources with URLs
