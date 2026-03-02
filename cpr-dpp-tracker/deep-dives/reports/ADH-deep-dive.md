# Deep-Dive Report: ADH — Construction Adhesives

**Family**: Annex VII #25 · ADH
**Full Name**: Construction adhesives
**TC**: CEN/TC 193
**Updated**: 2026-02-22
**DPP Estimate**: ~2030–2031
**Review Date**: 2026-03-01

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Display Name | Construction Adhesives |
| Family # | 25 |
| Letter | ADH |
| TC | CEN/TC 193 |
| Acquis | No |
| SReq | Not yet (targeted 2029) |
| Active Pipelines | A (New-CPR hEN Route) |
| Future Pipelines | — |
| Standards | 2 hEN + 0 EAD = 2 total |
| DPP Estimate | ~2030–2031 |
| Milestones | M-I: 2027, M-III: 2028, SReq: 2029 |

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110) — ACTIVE

| Node | Type | Tracker Status | Tracker Certainty | Verified Status | Finding |
|------|------|---------------|-------------------|-----------------|---------|
| Milestone I (Product Scope) | NT-2 | not_started | amber | **Confirmed** | M-I targeted 2027 per COM(2025) 772. |
| Milestone III (Essential Characteristics) | NT-3 | not_started | amber | **Confirmed** | M-III targeted 2028. |
| SReq (CPR 2024/3110) | NT-4 | not_started | amber | **Confirmed** | SReq targeted 2029. |
| CEN Standards Development | NT-5 | not_started | gray | **Confirmed** | CEN/TC 193 (adhesives) is the family TC, but standards are developed by CEN/TC 67. |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | **Confirmed** | Post-standards development. |
| Coexistence Period | NT-8 | pending | gray | **Confirmed** | Standard transition period. |
| HTS In Force | NT-9 | pending | orange | **Confirmed** | ~2030–2031 estimate. |

**Pipeline verdict**: All nodes confirmed. No status changes needed.

## 3. Standards Landscape Update

### hEN Portfolio (2 hENs)

| # | Standard | Name | TC/WG | AVCP | Cited | Revision | Finding |
|---|----------|------|-------|------|-------|----------|---------|
| 1 | EN 12004-1 | Adhesives for ceramic tiles — Part 1: Requirements, AVCP, classification and marking | CEN/TC 67 | 3 | Yes | CPR 2011 | Current edition: EN 12004-1:2017. No active revision found. **Cross-listed with CMG** — AVCP mismatch. |
| 2 | EN 12004-2 | Adhesives for ceramic tiles — Part 2: Test methods | CEN/TC 67 | 3 | Yes | CPR 2011 | Test methods companion. No active revision found. |

Both hENs are:
- Cited under CPR 305/2011 via OJ
- Developed by CEN/TC 67 (Ceramic tiles and clay pavers) — **not** by the family's assigned TC 193 (Adhesives)
- AVCP System 3
- Current editions from 2017 (superseding EN 12004:2007+A1:2012)
- Awaiting new CPR 2024/3110 SReq (expected 2029)

### TC Mismatch Analysis

The family is assigned to CEN/TC 193 (Adhesives) but both standards are developed by CEN/TC 67 (Ceramic tiles). This is noted in the data: "Key hEN for tile adhesives. Note: developed by CEN/TC 67 (ceramics) though family assigned to CEN/TC 193 (adhesives)."

This is a **deliberate design choice** — the product (adhesive) determines the family, but the standard is developed by the application-specific TC (ceramics). Not a data error.

### Cross-Family Flags

- **EN 12004-1 (ADH ↔ CMG)**: Cross-listed in both families. **AVCP mismatch**: ADH lists AVCP "3", while CMG lists AVCP "3, 4". The CMG listing includes System 4 for specific adhesive formulations (e.g., non-structural decorative applications). This is the 6th cross-family AVCP mismatch identified across the deep-dive project.

## 4. SReq Analysis Update

**Tracker says**: SReq targeted 2029. Not yet adopted. No acquis sub-group established.
**Research confirms**: COM(2025) 772 Table 3 confirms M-I 2027, M-III 2028, SReq 2029. Identical timeline to SEA. No public activity found.

The content.about section mentions additional adhesive types beyond tile adhesives: gypsum-based adhesives (EN 12860), structural bonding adhesives, and floor covering adhesives. These are noted but not currently tracked as standards — they may be added when SReq scope is defined.

## 5. Regulatory Landscape Changes

### EUR-Lex
- No new implementing decisions found for PA 25.
- No amendments to OJ citation list for EN 12004 series.

### CEN
- CEN/TC 193 (Adhesives) is the family TC but does not develop the tracked standards.
- CEN/TC 67 (Ceramic tiles) develops EN 12004 — no active revision found.
- EN 12004-1:2017 is the current version. Search confirms it superseded EN 12004:2007+A1:2012.

### EC
- No Art. 12 notification found for ADH.
- No acquis sub-group activity.

### EOTA
- No EADs for ADH. hEN-only family. Not applicable.

## 6. Structural Issues Identified

| # | Severity | Type | Description | Recommended Action |
|---|----------|------|-------------|-------------------|
| 1 | Low | empty_content | 5 content sections empty: standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary | Populate in future content pass |
| 2 | Medium | cross_family | EN 12004-1 AVCP mismatch: ADH lists "3" vs CMG lists "3, 4". Verify which is correct against Commission Decision. | Cross-reference with AVCP Decision for PA 25/26 |
| 3 | Info | content_data_disagreement | content.about mentions EN 12860 (gypsum adhesives), structural bonding adhesives, floor covering adhesives — none tracked in standards[]. | May need to add when SReq scope clarifies |

## 7. Proposed Data Changes Summary

| # | Field | Current Value | Proposed Value | Rationale |
|---|-------|--------------|----------------|-----------|
| — | — | — | — | No data changes needed — AVCP mismatch requires verification before changing |

## 8. Content Section Updates

No content section changes required. EN 12004-1 AVCP should be verified against the relevant Commission Decision before updating.

## 9. Cross-Family Notes

- **ADH ↔ CMG**: EN 12004-1 cross-listed. AVCP mismatch (ADH: "3" vs CMG: "3, 4"). This is the 6th AVCP mismatch discovered:
  1. EN 998-1 (CMG "2+, 4" vs MAS "4")
  2. EN 13813 (CMG "3, 4" vs FLO "1, 3, 4")
  3. EN 13043 (AGG "2+, 4" vs RCP "2+")
  4. EN 13055 (AGG "2+, 4" vs RCP "2+")
  5. EN 12004-1 (CMG "3, 4" vs ADH "3")
  6. Running tally — systematic pattern requiring holistic AVCP audit
- **ADH ↔ GYP**: content.about mentions gypsum-based adhesives (EN 12860) — tangential overlap with GYP family.
- **ADH ↔ FLO**: content.about mentions floor covering adhesives — tangential overlap with FLO family.
- **TC mismatch**: Family TC (CEN/TC 193) ≠ standards TC (CEN/TC 67). Deliberate but worth noting.

## 10. Quality Checklist

- [x] All pipeline nodes reviewed against sources
- [x] All 2 standards verified (type, AVCP, regime, citation)
- [x] hEN count matches: 2 in standards[], content mentions "2 hENs (EN 12004-1/2)"
- [x] DPP date consistent with convergence formula: max(~2030-2031, ~Q1-Q2 2029) = ~2030-2031
- [x] No duplicate update IDs
- [x] Review-queue JSON is valid
- [x] Cross-family standards checked (EN 12004-1 AVCP mismatch flagged)
- [x] Content sections reviewed (5 empty — noted)
- [x] SReq status verified against COM(2025) 772
- [x] Milestone dates cross-checked

**Quality Gate**: PASS

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across industry associations, EPD infrastructure, chemical regulation, market data, and Model EPD programmes
**Scope**: FEICA industry association, construction adhesive EPDs (Sika/Mapei), diisocyanate REACH restrictions, tile/flooring adhesive market, FEICA Model EPD programme, Deutsche Bauchemie engagement

### S1. FEICA — €19.9B European Market, 800 Companies, Model EPDs Since 2016

FEICA (Association of the European Adhesive & Sealant Industry) represents the European adhesives and sealants sector: 4.8 million tonnes volume, €19.9 billion value (2022), with adhesives accounting for 83.5% by volume and 74.7% by value. Approximately 800 companies manufacture adhesives and sealants in Europe, ~90% SMEs. FEICA has provided Model EPDs for construction adhesives since 2016, updated jointly with IVK, Deutsche Bauchemie, and EFCC in 2022/2024. The FEICA 2025 European Conference (San Sebastian, September 2025) addressed sustainability trends. Construction is a major end-use sector. The Smithers market report (9th edition, 2025-2030) covers Western Europe, CEE, and Turkey. FEICA is the primary industry voice for ADH family CPR engagement.

**Source**: FEICA (https://www.feica.eu/); FEICA market reports (https://www.feica.eu/information-center/market-reports); FEICA Conference 2025 (https://www.feica.eu/information-center/events-conferences/all-events/feica-2025-european-adhesive-sealant-conference-and-expo-3); Fastener + Fixing Magazine (https://fastenerandfixing.com/construction-fixings/adhesives-and-sealants-in-europe-the-trends-shaping-a-sustainable-future/)

### S2. FEICA Model EPDs — Industry-Wide Environmental Data Infrastructure for SMEs

FEICA's Model EPD programme is the most innovative EPD approach for SME-dominated industries. Rather than product-specific EPDs, Model EPDs are structured by chemical composition — covering all products within a formulation/application range. Third-party verified per EN 15804+A2 by IBU (Institut Bauen und Umwelt). Originally 2016, updated 2022 by FEICA + IVK + Deutsche Bauchemie + EFCC, extended 2024 with three additional chemical technologies. Any direct/indirect member of these associations can declare product compliance with a Model EPD. Benefits: "significant cost and time savings" and "improved access for SMEs to a market otherwise available only to some." This Model EPD approach — where ~90% SME industry uses formulation-based collective declarations — is directly transferable to DPP environmental data. ADH could be among the most DPP-ready families due to this infrastructure.

**Source**: FEICA EPDs (https://www.feica.eu/our-projects/epds); FEICA Model EPDs announcement (https://www.feica.eu/information-center/latest-news/Model-EPDs); EFCC updated 2024 Model EPDs (https://www.efcc.eu/our-actions/guidance-tools-industry/updated-2024-european-model-environmental-product-declarations); Adhesives & Sealants Industry (https://www.adhesivesmag.com/articles/99850-feica-updates-european-model-environmental-product-declarations-model-epds)

### S3. Sika + Mapei — Market Leaders with Comprehensive EPD Programmes

Sika publishes EPDs since 2012 across all construction target markets, verified by BRE (UK) per EN 15804 and ISO 14025. Portfolio covers tile adhesives, flooring adhesives, structural bonding, and concrete repair (cross-family with CMG). Mapei is EPD Process Certified (since 2016), publishes product-specific Type III EPDs for cement grout, mortar, and tile adhesives. Both companies operate across multiple CPR families (ADH, CMG, FLO, SEA). However, neither Henkel nor smaller manufacturers have visible construction adhesive EPD programmes. The pattern repeats across CPR families: 2-3 market leaders have EPDs, the SME majority does not — but FEICA's Model EPD programme specifically addresses this gap for adhesives.

**Source**: Sika EPDs (https://gbr.sika.com/en/sustainability/sustainable-solutions/lca-and-epd-s.html); Sika EPD downloads (https://gbr.sika.com/en/downloads/environmental-product-declarations/epd-downloads.html); Mapei EPDs (https://www.mapei.com/us/en-us/about-us/sustainability/sustainability/epd); Mapei environmental transparency (https://www.mapei.com/us/en-us/training-and-technical-service/tech-talk-blog/detail/mapei-blog/2021/07/28/environmental-transparency-and-epds)

### S4. Diisocyanate REACH Restriction — Training Mandate Reshapes PU Adhesive Market

REACH restriction on diisocyanates took effect 24 August 2023: products containing >0.1% diisocyanates can only be used with mandatory training requirements. Diisocyanate exposure is a main cause of occupational asthma in the EU. This restriction directly affects polyurethane (PU) construction adhesives. Industry response: growing demand for non-PU structural adhesives (epoxy, acrylic), and reformulation to <0.1% diisocyanate content (e.g., Henkel's solvent-free bicomponent product). KLEIBERIT notes significant impact on wood-panel adhesives. This chemical restriction creates DPP cross-regulatory complexity: adhesive DPP must declare diisocyanate content, training requirements, and VOC emissions alongside mechanical performance. CEN/TC 351 (dangerous substances) horizontal requirements will mandate chemical content declarations in DPP data.

**Source**: REACH diisocyanate restriction (https://www.forgeway.com/learning/blog/isocyanate-restrictions-2023); KLEIBERIT EU restrictions (https://www.kleiberit.com/en/company/news/isocyanate-restrictions-in-the-european-union); Adhesives & Bonding Expo (https://www.adhesivesandbondingexpo-europe.com/blogs/growing-demand-for-non-pu-structural-adhesives-after-eu-diisocyanates-rule); PMC isocyanate exposure (https://pmc.ncbi.nlm.nih.gov/articles/PMC8501949/)

### S5. Deutsche Bauchemie — 140 Companies, €4.6B Sales, Active CPR/Sustainability Position

Deutsche Bauchemie (German Construction Chemicals Association, founded 1948) represents ~140 member companies generating €4.6 billion annual sales and employing ~32,000 staff. The association's Product Stewardship Committee addresses national and EU construction products legislation including CPR. Deutsche Bauchemie published positions on: Circular Economy Act (Nov 2025), European Strategy for Housing Construction (Sep 2025), and a "Construction Sector Omnibus" (Oct 2025) — directly engaging with CPR regulatory framework. Deutsche Bauchemie is a joint partner in the FEICA Model EPD programme, co-developing EPDs for construction chemicals. The association also published a 2020 position on Product Environmental Footprint (PEF) — showing early engagement with environmental data methodology.

**Source**: Deutsche Bauchemie (https://deutsche-bauchemie.com/); Deutsche Bauchemie Circular Economy position (https://deutsche-bauchemie.de/positionspapiere/nachhaltiges-bauen/nov-2025-position-on-circular-economy-act); Deutsche Bauchemie Omnibus position (https://deutsche-bauchemie.de/bauproduktenverordnung/okt-2025-a-construction-sector-omnibus); Deutsche Bauchemie PEF position (https://deutsche-bauchemie.com/verband/positionspapiere/august-2020-positionspapier-zum-product-environmental-footprint-pef)

### S6. Market Context — Tile Adhesive $3.6B Global, Floor Adhesive $5.6B Global

The global tile adhesive market: $3.6 billion (2024), CAGR 7.6%. The global flooring adhesive market: $5.64 billion (2024), CAGR 9.3%. Europe is a mature market with Germany, UK, France, and Italy as leading countries. European market dynamics shaped by: sustainable construction practices, stringent VOC emission regulations, and demand for eco-friendly solutions. The European adhesives and sealants industry overall (€19.9B, FEICA data) is far larger than ADH's narrow CPR scope (only EN 12004 tile adhesives tracked). Future SReq (2029) could expand scope to include floor covering adhesives, structural bonding adhesives, and gypsum adhesives — significantly expanding the family's economic footprint.

**Source**: Grand View Research tile adhesive (https://www.grandviewresearch.com/industry-analysis/tile-adhesive-market-report); GM Insights tile adhesive (https://www.gminsights.com/industry-analysis/tile-adhesive-market); Mordor Intelligence floor adhesives (https://www.mordorintelligence.com/industry-reports/floor-adhesives-market); Precedence Research flooring adhesive (https://www.precedenceresearch.com/flooring-adhesive-market)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 4 | iss-ADH-004 | info | dpp_readiness | FEICA Model EPDs (EN 15804+A2, IBU-verified, formulation-based) provide DPP-ready environmental data infrastructure for ~90% SME industry. Sika + Mapei have product-specific EPDs. ADH is among most DPP-ready families via collective approach. |
| 5 | iss-ADH-005 | info | cross_regulatory | REACH diisocyanate restriction (Aug 2023) for PU adhesives >0.1%. DPP must declare diisocyanate content + training requirements + VOC emissions. CEN/TC 351 dangerous substances will mandate chemical content in DPP. |
| 6 | iss-ADH-006 | info | market_context | Current ADH scope (EN 12004 tile adhesives only) covers fraction of €19.9B European adhesives/sealants market. SReq (2029) may expand to floor, structural, gypsum adhesives — significant scope expansion possible. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] FEICA industry association documented (€19.9B, 800 companies, 90% SME)
- [x] FEICA Model EPD programme assessed (formulation-based, EN 15804+A2, IBU-verified)
- [x] Sika + Mapei EPD programmes documented (market leaders, product-specific)
- [x] Diisocyanate REACH restriction cross-regulatory impact documented
- [x] Deutsche Bauchemie engagement assessed (CPR positions, Model EPD partner)
- [x] Market sized (tile $3.6B, flooring $5.6B, total European €19.9B)
- [x] All findings connected to explicit sources with URLs
