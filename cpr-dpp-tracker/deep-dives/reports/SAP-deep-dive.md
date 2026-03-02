# Deep-Dive Report: SAP — Sanitary Appliances

**Family**: Annex VII #11 · SAP
**Full Name**: Sanitary appliances
**TC**: CEN/TC 163
**Updated**: 2026-02-22
**DPP Estimate**: ~2033–2034
**Review Date**: 2026-03-01

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Display Name | Sanitary Appliances |
| Family # | 11 |
| Letter | SAP |
| TC | CEN/TC 163 |
| Acquis | No |
| SReq | Not yet (no date set) |
| Active Pipelines | A (New-CPR hEN Route) |
| Future Pipelines | — |
| Standards | 8 hEN + 0 EAD = 8 total |
| DPP Estimate | ~2033–2034 |
| Milestones | M-I: 2028, M-III: 2029, SReq: — |

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110) — ACTIVE

| Node | Type | Tracker Status | Tracker Certainty | Verified Status | Finding |
|------|------|---------------|-------------------|-----------------|---------|
| Milestone I (Product Scope) | NT-2 | not_started | amber | **Confirmed** | M-I targeted 2028. |
| Milestone III (Essential Characteristics) | NT-3 | not_started | amber | **Confirmed** | M-III targeted 2029. |
| SReq (CPR 2024/3110) | NT-4 | not_started | gray | **Confirmed** | No SReq date set. NT-4 certainty correctly at gray. |
| CEN Standards Development | NT-5 | not_started | gray | **Confirmed** | CEN/TC 163 active. |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | **Confirmed** | Distant future. |
| Coexistence Period | NT-8 | pending | gray | **Confirmed** | Distant future. |
| HTS In Force | NT-9 | pending | orange | **Confirmed** | ~2033–2034 estimate. |

**Pipeline verdict**: All nodes confirmed. No status changes needed.

## 3. Standards Landscape Update

### hEN Portfolio (8 hENs)

| # | Standard | Name | TC/WG | AVCP | Cited | Finding |
|---|----------|------|-------|------|-------|---------|
| 1 | EN 997 | WC pans and suites with integral trap | CEN/TC 163 | 4 | Yes | Key WC standard. CPR 305/2011. |
| 2 | EN 14688 | Wash basins | CEN/TC 163 | 4 | Yes | CPR 305/2011. |
| 3 | EN 14528 | Bidets | CEN/TC 163 | 4 | Yes | CPR 305/2011. |
| 4 | EN 14055 | WC and urinal flushing cisterns | CEN/TC 163 | 4 | Yes | CPR 305/2011. |
| 5 | EN 14527 | Shower trays | CEN/TC 163 | 4 | Yes | CPR 305/2011. |
| 6 | EN 14516 | Baths | CEN/TC 163 | 4 | Yes | CPR 305/2011. |
| 7 | EN 14296 | Communal washing troughs | CEN/TC 163 | 4 | Yes | CPR 305/2011. |
| 8 | EN 14428 | Shower enclosures | CEN/TC 163 | 4 | Yes | CPR 305/2011. |

All 8 hENs are:
- Self-contained within CEN/TC 163
- Uniform AVCP System 4 (manufacturer self-declaration — lowest level, consistent with non-structural products)
- All cited under CPR 305/2011
- No active revision projects found
- Awaiting new CPR 2024/3110 SReq before revision begins

**AVCP System 4 observation**: SAP joins PTA as the only families with uniform System 4 AVCP. Non-structural, non-fire-related products — consistent with lowest assessment level.

## 4. SReq Analysis Update

**Tracker says**: M-I 2028, M-III 2029, no SReq date set.
**Research confirms**: COM(2025) 772 Table 3 confirms these milestones. SAP and PTA share identical milestone structure and DPP timeline (~2033-2034). Both are MEP domain families with the latest timelines.

## 5. Regulatory Landscape Changes

### EUR-Lex
- No new implementing decisions found for PA 11.

### CEN
- CEN/TC 163 (Sanitary appliances) is active.
- No specific revision projects found for any of the 8 hENs.
- Water efficiency may become a new essential characteristic under new CPR — linking to EU water strategy.

### EC
- No Art. 12 notification found for SAP.

## 6. Structural Issues Identified

| # | Severity | Type | Description | Recommended Action |
|---|----------|------|-------------|-------------------|
| 1 | Low | empty_content | 4 content sections empty: standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary (but sreq_analysis and dpp_outlook are populated) | Populate in future content pass |

## 7. Proposed Data Changes Summary

| # | Field | Current Value | Proposed Value | Rationale |
|---|-------|--------------|----------------|-----------|
| — | — | — | — | No data changes needed |

## 8. Content Section Updates

No content section changes required. Existing content is accurate.

## 9. Cross-Family Notes

- SAP is self-contained — all 8 hENs within CEN/TC 163, no cross-listings.
- **SAP + PTA twins**: Both share M-I 2028, M-III 2029, no SReq date, DPP ~2033-2034, Pipeline A only, AVCP System 4. They form a MEP domain pair with the latest timelines.
- Physical overlap with SEA (sealants for sanitary joints) — EN 15651-3 (sanitary sealants) in SEA connects to SAP product installations.
- Water efficiency considerations may drive future essential characteristics under new CPR.

## 10. Quality Checklist

- [x] All pipeline nodes reviewed against sources
- [x] All 8 standards verified (type, AVCP, regime, citation)
- [x] hEN count matches: 8 in standards[], standards_summary says "8 hENs individually listed"
- [x] DPP date consistent with convergence formula: max(~2033-2034, ~Q1-Q2 2029) = ~2033-2034
- [x] No duplicate update IDs
- [x] Review-queue JSON is valid
- [x] No cross-family standards to check
- [x] Content sections reviewed (4 empty — noted)
- [x] SReq status verified against COM(2025) 772
- [x] Milestone dates cross-checked

**Quality Gate**: PASS

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across European sanitary ware market, EPD infrastructure, EU water efficiency labelling, European Water Label scheme, ceramic recycling, and CEN/TC 163 standards
**Scope**: European sanitary ware market sizing, Villeroy & Boch/Duravit EPDs, EU water labelling schemes, sanitary ceramics circular economy, EN 997 WC standard revision, water efficiency as future CPR essential characteristic

### S1. European Sanitary Ware Market — $11.3B (2024), Ceramic Dominates, Germany Leads

The European sanitary ware market was valued at $11.31 billion in 2024, expected to reach $16.98 billion by 2032 (CAGR 5.2%). European ceramic sanitary ware specifically: $10.70 billion (2023). WC segment dominates at 28.7% of revenue. Germany leads the European market. Key manufacturers: Roca (Spain), Villeroy & Boch (Germany), Geberit (Switzerland), Duravit (Germany), TOTO (Japan/Europe). Growth drivers: water efficiency, smart bathroom technology, ageing population accessibility, and renovation wave. SAP is a moderate-sized CPR family but with the latest DPP timeline (~2033–2034) — among the last families to face DPP requirements.

**Source**: Data Bridge sanitary ware (https://www.databridgemarketresearch.com/reports/europe-sanitary-ware-market); Expert Market Research (https://www.expertmarketresearch.com/reports/europe-sanitary-ware-market); Stellar MR ceramic (https://www.stellarmr.com/report/Europe-Ceramic-Sanitary-Ware-Market/1715)

### S2. Sanitary Ware EPDs — Villeroy & Boch 14,000+ Products, Duravit IBU-Verified, Strong Market Leader Coverage

Villeroy & Boch Group publishes EPDs for brands Villeroy & Boch, Ideal Standard, and Gustavsberg — covering over 14,000 products from the standard range. This is one of the highest product-level EPD counts in any CPR family. Duravit holds IBU-verified EPDs for both sanitary ceramic and sanitary acrylic product groups. EPDs cover washbasins, bidets, urinals, toilets, shower trays, and cisterns — matching the EN 997/EN 14688 product scope exactly. EPD coverage among top European manufacturers is strong. For DPP: the sanitary ceramics sector has surprisingly advanced EPD infrastructure — comparable to fibre-cement (WCF) and flat glass (GLA) as DPP-ready exemplars.

**Source**: Villeroy & Boch sustainability (https://pro.villeroy-boch.com/en/gb/bathroom-and-wellness/service/laws-and-regulations/sustainability-at-villeroy-boch); Duravit EPD (https://wgassets.duravit.com/statc/download/EPD_Sanitary_ceramic_EN.pdf); Duravit green labels (https://pro.duravit.us/pro/content/homepage/the_sustainable_bathroom/the_sustainable_bathroom/green_labels~8a8a818d4cbd0f4e014cdbaefff5030b.us-en.html)

### S3. European Water Label — 90+ Brands, Voluntary Scheme Since 2007, May Influence CPR Water Efficiency

The European Water Label is a voluntary labelling scheme for sanitary products, originally developed in the UK (2007), adopted by CEIR (taps/valves manufacturers, 2012) and FECS (ceramic sanitaryware, 2014). Now supported by 90+ European brands. Covers baths, WC suites, cisterns, basin taps, shower controls, handsets, kitchen taps, and flow regulators. Not yet mandatory under CPR, but water efficiency is flagged as a potential new essential characteristic under the new CPR framework. For DPP: water consumption data (litres/flush, litres/minute) could become a mandatory DPP declaration if water efficiency is added to the SReq. The European Water Label database infrastructure could transition to DPP data format.

**Source**: European Water Label (http://www.europeanwaterlabel.eu/schemepartners.asp); CEIR water saving (https://www.ceir.eu/en/what-we-do/water-saving); CIPHE streamline (https://www.ciphe.org.uk/news-and-advice/blog-articles/its-streamline-time-for-the-european-water-label-scheme/)

### S4. Sanitary Ceramics Circular Economy — Limited Recycling, Aggregate Reuse, 70% EU CDW Target

Sanitary ceramics (vitreous china) recycling is limited: high-temperature fired ceramics are difficult to recycle back to raw material. Current options: crushing for aggregate use in road construction base layers, or as partial cement replacement in concrete (improves compressive strength). EU C&D waste ~924 million tonnes; 70% recycling target under Waste Framework Directive. Some production waste is recycled back to kilns, but post-consumer ceramic sanitaryware largely goes to landfill or low-value aggregate. The long product lifetime (30–50+ years for ceramic sanitaryware) is itself a sustainability advantage — fewer replacements needed. For DPP: durability data and recycled content from production waste are the most viable circular economy declarations for ceramics.

**Source**: MDPI circular economy CDW (https://www.mdpi.com/1996-1944/13/13/2970); Springer ceramic LCA (https://link.springer.com/article/10.1007/s13762-023-05074-6); EU ceramics sector (https://single-market-economy.ec.europa.eu/sectors/raw-materials/related-industries/non-metallic-products-and-industries/ceramics_en)

### S5. CEN/TC 163 and EN 997 — Latest Edition 2018, No Smart Toilet Standards, Water Efficiency Gap

EN 997:2018 (WC pans and suites with integral trap) is the latest edition, superseding 2012+A1:2015. Developed by CEN/TC 163 "Sanitary appliances" (secretariat: UNI Italy). The standard covers constructional and performance characteristics plus test methods for WC pans, flushing cisterns, mechanisms, inlet valves, and overflows. No specific smart toilet or digital features standardisation found. No water efficiency test standard within EN 997 — water consumption is referenced but not a CPR essential characteristic yet. Standards are mature (EN 997:2018, EN 14688:2006) and awaiting new CPR SReq (no date set) before next revision. The gap between smart toilet market innovation and the static EN 997 standard is widening.

**Source**: EN 997 (https://standards.globalspec.com/std/13072733/en-997); CEN news (https://www.cen.eu/news/brief-news/Pages/NEWS-2018-044.aspx); EN 997 explained (https://danubetoilet.com/en-997-explained-europes-performance-benchmark-for-flush-toilets/)

### S6. Market Material Diversity — Ceramic 95%+, Acrylic Shower/Bath, Stainless Steel Commercial

The sanitary ware market is ceramic-dominated (95%+ of WCs, washbasins, bidets). Acrylic is significant for shower trays (EN 14527) and baths (EN 14516). Stainless steel for commercial/industrial washtroughs (EN 14296). Plastic sanitary ware market $13.9 billion (2024) — broader than just CPR-scoped products. Unlike FLO (6 material types) or TIP (13 material types), SAP's material diversity is manageable — ceramic dominates with acrylic as secondary. For DPP: ceramic and acrylic have fundamentally different environmental profiles (ceramic: high-temperature firing, mineral-based; acrylic: petrochemical-based, thermoformable) but the product scope is narrow enough that a single DPP data architecture should work.

**Source**: IndexBox EU plastic sanitary ware (https://www.indexbox.io/blog/plastic-sanitary-ware-europe-market-overview-2024-2/); Data Bridge sanitary ware (https://www.databridgemarketresearch.com/reports/europe-sanitary-ware-market)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 2 | iss-SAP-002 | info | dpp_readiness | Villeroy & Boch + Ideal Standard 14,000+ product EPDs. Duravit IBU-verified. Surprisingly advanced EPD infrastructure for sanitary ceramics — among most DPP-ready CPR families. |
| 3 | iss-SAP-003 | info | cross_regulatory | European Water Label (90+ brands, voluntary since 2007/2012). Water efficiency may become CPR essential characteristic. Water consumption data could become mandatory DPP declaration. |
| 4 | iss-SAP-004 | info | market_context | European sanitary ware $11.3B (2024), CAGR 5.2%. Ceramic-dominated. Latest DPP timeline (~2033-2034) among all CPR families. AVCP System 4 (lowest). |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] European sanitary ware market sized ($11.3B, CAGR 5.2%)
- [x] EPD infrastructure documented (Villeroy & Boch 14,000+, Duravit IBU-verified)
- [x] European Water Label voluntary scheme assessed (90+ brands, potential CPR integration)
- [x] Sanitary ceramics circular economy reviewed (limited recycling, long durability)
- [x] CEN/TC 163 standards status checked (EN 997:2018, no smart toilet standards)
- [x] Material diversity assessed (ceramic dominant, acrylic secondary)
- [x] All findings connected to explicit sources with URLs
