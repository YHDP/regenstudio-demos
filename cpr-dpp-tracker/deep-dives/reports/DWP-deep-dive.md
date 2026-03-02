# DWP — Drinking Water Products: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-22)
**Family**: Annex VII #29 · DWP
**Batch**: 10 (Trailing / sparse data)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Construction products in contact with water intended for human consumption |
| Letter | DWP |
| Annex VII # | 29 |
| TC | (none assigned) |
| Standards tracked | 0 (0 hEN + 0 EAD) |
| Active pipelines | A (new-CPR hEN route) |
| Future pipelines | None |
| DPP estimate | TBD |
| Acquis | No |
| SReq status | Not started — no date set |
| AVCP | Not determined |
| Last updated | 2026-02-22 |

**Key context**: DWP is the **most sparse family** in the tracker. It has zero standards, no TC assigned, no milestones, no DPP date, and a TBD timeline across all fields. This reflects the complex cross-regulatory situation between the CPR and the EU Drinking Water Directive (DWD) 2020/2184. Originally, hygienic requirements for drinking water contact materials were to be defined within the CPR framework. However, because some products (water heaters, meters, pumps, household appliances) fall outside CPR scope, the regulatory approach shifted — with the DWD establishing its own material approval framework in parallel. The relationship between CPR and DWD requirements for construction-specific drinking water products remains unresolved.

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | not_started | gray | Correct — no date set | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | not_started | gray | Correct — no date set | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | gray | Correct — no date set | No change | No change | S30 |
| CEN Standards Development | NT-5 | not_started | gray | Correct — no TC assigned, no standards | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | No standards to cite | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | gray | TBD | No change | No change | S30, S1 |

**Pipeline verdict**: All 7 nodes accurate (all gray/unknown). No changes needed. The entire pipeline is effectively dormant.

---

## 3. Standards Landscape Update

### hENs (0)

No harmonised standards exist for drinking water contact construction products under the CPR.

### EADs (0)

No EADs.

### Cross-Regulatory: Drinking Water Directive 2020/2184

The key regulatory development is under the EU Drinking Water Directive (DWD) rather than the CPR:

- **Delegated Regulation (EU) 2024/371**: Establishes harmonised specifications for marking products in contact with drinking water
- **Implementing Decision (EU) 2024/367**: Establishes European positive lists of authorised substances, compositions, and constituents for materials in contact with drinking water
- **Art. 11 DWD**: Requires coherence between DWD and CPR — harmonised standards developed under CPR should reference DWD measures

The DWD framework is advancing independently of the CPR. Whether construction products in contact with drinking water will ultimately be regulated under CPR (with DWD cross-references) or primarily under DWD (with CPR excluded) is not yet resolved.

### Potential TC Assignment

No TC has been formally assigned. Potential candidates include:
- CEN/TC 164 (Water supply) — covers pipes, fittings, and accessories for drinking water
- CEN/TC 155 (Plastics piping systems) — overlaps with PTA family for plastic pipes
- A new dedicated TC could be established

**Count verification**: 0 hENs + 0 EADs = 0 total. Matches data (standards[] is empty, standards_summary is null).

---

## 4. SReq Analysis Update

**Status**: Not started. No Art. 12 notification. No TC assigned.

Key facts:
- No milestones set in COM(2025) 772 — not even M-I
- No TC assigned
- Cross-regulatory complexity with DWD 2020/2184
- DWD positive lists and marking specifications adopted in 2024 may reduce CPR scope for this family
- Uncertain whether CPR or DWD will be the primary regulatory pathway

**No change to tracker data**: Status correctly reflects the dormant state.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **DWD Delegated Regulation (EU) 2024/371**: Harmonised marking specifications for drinking water contact products (adopted 2024)
- **DWD Implementing Decision (EU) 2024/367**: European positive lists for authorised substances (adopted 2024)
- No CPR-specific implementing decisions for DWP found in 2025–2026

### CEN Work Programme
- No TC assigned for DWP under CPR. CEN/TC 164 (Water supply) is active but focused on DWD, not CPR.

### EOTA
- No EADs for DWP — not applicable

---

## 6. Structural Issues Identified

| # | ID | Severity | Type | Description | Action |
|---|----|----------|------|-------------|--------|
| 1 | iss-DWP-001 | warning | empty_content | 6 content sections empty: standards_landscape, standards_development, sreq_analysis, stakeholder_notes, key_risks, sources_summary. Most empty of any family. | Populate with content — at minimum document DWD cross-regulatory situation |
| 2 | iss-DWP-002 | warning | content_data_disagreement | standards_summary is null (not even an empty object). This is the only family with null rather than an object. | Set standards_summary to a structured empty value or document zero-standards status |
| 3 | iss-DWP-003 | info | cross_regulatory | DWD 2020/2184 developing parallel regulatory framework for drinking water contact materials. CPR vs DWD jurisdiction unclear. Delegated Regulation (EU) 2024/371 and Implementing Decision (EU) 2024/367 already adopted under DWD. | Document DWD cross-regulatory situation in content.about or content.key_risks |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No pipeline or data changes possible — all fields are correctly TBD/empty. | — |

---

## 8. Content Section Updates

### content.sreq_analysis (currently empty)
**Proposed**: "No milestones appear in COM(2025) 772 Table 3 for family 29. No TC has been assigned. The regulatory pathway for drinking water contact construction products is complicated by the parallel EU Drinking Water Directive (DWD) 2020/2184 framework, which has adopted its own material approval scheme (positive lists via Implementing Decision (EU) 2024/367 and marking specifications via Delegated Regulation (EU) 2024/371). Art. 11 DWD requires coherence with CPR, but whether CPR will independently regulate these products or defer to DWD is unresolved."

### content.key_risks (currently empty)
**Proposed**: "1) Regulatory jurisdiction uncertainty: CPR vs DWD 2020/2184 — unclear which framework will govern construction products in contact with drinking water. 2) No TC assigned — standardisation cannot begin until institutional responsibility is determined. 3) Zero standards, zero milestones — the most timeline-uncertain family in the tracker. 4) DWD positive lists (2024/367) may preempt CPR requirements for material safety, potentially narrowing CPR scope to structural/fire performance only."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110. DWD: Directive (EU) 2020/2184. (EU) 2024/371: DWD marking specifications. (EU) 2024/367: DWD positive lists."

---

## 9. Cross-Family Notes

- **PTA overlap**: PTA (Pipes, Tanks & Accessories) covers plastic piping systems — some of which contact drinking water. CEN/TC 155 standards (EN 1401, EN 12201 etc.) in PTA may overlap with DWP scope for pipes.
- **WWD overlap**: WWD (Waste Water Engineering) uses CEN/TC 165 — wastewater vs drinking water is a clear boundary, but some products (e.g., lifting plants) may contact both.
- **DWD cross-regulatory**: The DWD 2020/2184 framework is the most advanced cross-regulatory factor of any CPR family. Unlike the REACH/formaldehyde cross-reference for WBP, the DWD framework potentially subsumes entire product categories.

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in A — 7 total, no Pipeline C)
- [x] All standards checked against sources (0/0 — no standards to verify)
- [x] hen_count matches actual hEN count in standards[] (0 hENs)
- [x] ead_count matches actual EAD count in standards[] (0 EADs)
- [x] DPP date consistent with convergence formula (max(Product TBD, System ~Q1-Q2 2029) = TBD)
- [x] No duplicate update IDs
- [x] Content sections all non-empty or flagged (6 empty sections flagged — most of any family)
- [x] Source citations present for all claims
- [x] Cross-family standards noted (PTA pipe overlap, DWD cross-regulatory documented)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across DWD 2020/2184 implementation, drinking water pipe market, EPD coverage, figawa/EWA harmonisation, ECHA positive lists/4MS scheme, and PFAS/lead regulation
**Scope**: DWD positive lists implementation timeline, European pipe/fittings market, drinking water product EPDs (SANHA, Uponor, Pipelife, Aquatherm), figawa industry position on CPR/DWD coherence, 4MS initiative and ECHA positive lists, PFAS monitoring and lead pipe replacement

### S1. DWD 2020/2184 Implementation Advanced — Six Delegated/Implementing Regulations Adopted April 2024, Positive Lists Apply Dec 2026

The European Commission adopted six delegated and implementing regulations under DWD Art. 11 in April 2024, establishing: (1) European positive lists of authorised substances (Implementing Decision 2024/367, 4 annexes: organic, metallic, cementitious, enamel/ceramic/inorganic materials); (2) testing and acceptance methodologies (Implementing Decision 2024/365); (3) harmonised marking specifications (Delegated Regulation 2024/371). First European positive lists apply from 31 December 2026 for new products; transitional arrangements until 31 December 2032 for existing products. ECHA manages the positive lists and publishes guidance. The initial approach was CPR-based but shifted to DWD because some products (water heaters, meters, pumps, appliances) fall outside CPR scope. For DPP: the DWD framework is far more advanced than any CPR pathway for DWP — it effectively supersedes CPR for material safety requirements.

**Source**: EC press release (https://ec.europa.eu/commission/presscorner/detail/en/ip_24_350); ECHA positive lists (https://echa.europa.eu/european-positive-lists); ECHA DWD guidance (https://echa.europa.eu/guidance-documents/guidance-on-dwd); Implementing Decision 2024/367 (https://op.europa.eu/en/publication-detail/-/publication/a5dab171-0132-11ef-a251-01aa75ed71a1/language-en)

### S2. European Pipe & Fittings Market — Plastics $27.3B (2024), Pipe Fittings $6.9B by 2030, Drinking Water a Key Segment

European plastics pipes and pipe fittings market $27.3 billion (2024). Pipe fittings specifically projected to reach $6.9 billion by 2030 (CAGR 7.1%). Plastic pipes growing to 5 million tonnes / $33 billion by 2035. Germany ($3.2B), France ($2.7B), and Russia ($4.8B) are largest national markets. Drinking water distribution is a key application segment alongside sewerage, gas, and industrial. Materials: PE (dominant for water), PVC-U, ductile iron, copper, stainless steel. Key manufacturers: Georg Fischer, Aliaxis, Uponor, Pipelife, Wavin (Orbia), REHAU. For DPP: DWP products overlap significantly with PTA (Pipes, Tanks & Accessories) — the same physical products may need CPR DPP for structural performance AND DWD compliance for material safety.

**Source**: IndexBox Europe plastics pipe (https://www.indexbox.io/blog/plastics-pipe-and-pipe-fitting-europe-market-overview-2024-4/); Grand View Research pipe fittings (https://www.grandviewresearch.com/horizon/outlook/pipe-fittings-market/europe)

### S3. Drinking Water Pipe/Fitting EPDs Well-Developed — SANHA, Uponor, Pipelife, REHAU, Aquatherm All Publish EN 15804+A2

Multiple manufacturers publish EN 15804+A2 EPDs for drinking water pipe systems: SANHA publishes EPDs for "all pipe systems" on its website (copper, stainless steel, carbon steel, multilayer). Uponor publishes EPDs for PE100 pressure pipes. Pipelife publishes EPDs via EPD Norway. REHAU publishes EPD for PEX (crosslinked polyethylene) pipe systems. Aquatherm publishes EPDs for green pipe (PP-R). TEPPFA (European Plastic Pipes and Fittings Association) publishes European Communication Format EPDs for PVC-U. EPD coverage for drinking water piping is among the most developed of any construction product category. For DPP: the drinking water pipe sector has strong EPD infrastructure — but this primarily serves the PTA family under CPR, not DWP specifically.

**Source**: SANHA EPDs (https://www.sanha.com/en/blog/sanha-publishes-epds-for-all-pipe-systems-on-its-website-transparency-in-sustainability); REHAU PEX EPD (https://www.rehau.com/downloads/1002828/environmental-product-declaration.pdf); Uponor PE100 EPD (https://www.uponor.com/getmedia/dcfbca57-e51d-4d29-8ff0-11a47ec42ca3/epd-uponor-pe100-and-pe100-rc-pressure-pipe-e)

### S4. 4MS Initiative → ECHA Positive Lists — Germany, France, Netherlands, UK Drove Harmonisation, Now EU-Wide

The 4MS Initiative (France, Germany, Netherlands, UK — formalised January 2011) developed Common Approaches for regulating materials in contact with drinking water. Their national positive lists were submitted to the EC and formed the basis for the EU-wide Implementing Decision 2024/367. Four material categories: organic materials, metallic materials, cementitious materials, and enamel/ceramic/inorganic materials. Germany's UBA (Umweltbundesamt) publishes evaluation criteria and guidelines for drinking water materials. figawa (German installation and heating industry association) is a member of the European Drinking Water Alliance (EDW). For DPP: the 4MS-to-ECHA-to-EU positive list pathway means DWP already has a material safety data infrastructure that CPR families lack — but it's under DWD, not CPR.

**Source**: ECHA understanding DWD (https://echa.europa.eu/understanding-dwd); UBA 4MS (https://www.umweltbundesamt.de/en/topics/water/drinking-water/distributing-drinking-water/approval-harmonization-4ms-initiative); figawa harmonisation (https://figawa.org/en/topics/water-supply/harmonisation-of-materials-and-products-in-contact-with-drinking-water/)

### S5. PFAS Monitoring in Drinking Water — EU Limit Values Apply Jan 2026, Germany First National PFAS Limits

New EU rules for PFAS monitoring in drinking water entered application 12 January 2026 — first systematic EU-wide PFAS monitoring in drinking water. Member States must monitor PFAS levels and take action if limit values exceeded. Germany implemented national PFAS limit values from 12 January 2026 (first in EU). Germany also requires replacement/decommissioning of old lead pipes by 12 January 2026. For DPP: PFAS contamination in water is a cross-cutting concern — construction products in contact with drinking water (pipes, fittings, valves, tanks) must not leach PFAS. This creates a new data requirement that could feed into DPP material safety declarations, whether under CPR or DWD.

**Source**: EC PFAS drinking water rules (https://environment.ec.europa.eu/news/new-eu-rules-limit-pfas-drinking-water-2026-01-12_en); White & Case Germany PFAS (https://www.whitecase.com/insight-alert/new-standards-drinking-water-germany-new-limits-pfas)

### S6. CPR Art. 11 DWD Coherence Requirement — DWD is Primary, CPR Must Reference DWD Measures

Art. 11 of DWD 2020/2184 explicitly requires coherence with CPR: harmonised standards developed under CPR must provide reference to DWD legally binding measures. This means CPR cannot independently set material safety requirements that conflict with DWD positive lists. In practice, CPR's role for DWP may be limited to structural/fire performance characteristics (if applicable), while material safety (hygiene, leaching, migration) is governed by DWD. figawa confirms: "all products in contact with drinking water (harmonised and non-harmonised) must comply with the requirements of the Drinking Water Directive." For DPP: if DWP eventually gets CPR standards, the DPP would need to reference DWD compliance data — creating a cross-regulatory DPP that draws from two EU regulatory frameworks simultaneously.

**Source**: figawa CPR/DWD coherence (https://figawa.org/en/topics/water-supply/harmonisation-of-materials-and-products-in-contact-with-drinking-water/); ECHA DWD legislation profile (https://echa.europa.eu/legislation-profile/-/legislationprofile/EU-DRINKING_WATER_RECAST); DWD 2020/2184 Art. 11 (https://eur-lex.europa.eu/eli/dir/2020/2184/oj/eng)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 4 | iss-DWP-004 | warning | cross_regulatory | DWD framework far more advanced than CPR for DWP. Six delegated/implementing regulations adopted April 2024. European positive lists apply Dec 2026. ECHA manages substance lists. CPR Art. 11 coherence means CPR must reference DWD. DPP would need cross-regulatory data from both frameworks. |
| 5 | iss-DWP-005 | info | dpp_readiness | Drinking water pipe/fitting EPDs well-developed (SANHA, Uponor, Pipelife, REHAU, Aquatherm — all EN 15804+A2). However, these serve PTA family under CPR, not DWP specifically. Material safety data exists under DWD positive lists, not CPR. |
| 6 | iss-DWP-006 | info | market_context | European plastics pipe/fittings market $27.3B (2024). PFAS monitoring in EU drinking water from Jan 2026. Germany requires lead pipe replacement by Jan 2026. Significant overlap with PTA family products. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] DWD 2020/2184 implementation timeline documented (six regulations, Dec 2026 positive lists)
- [x] European pipe/fittings market sized ($27.3B plastics pipes)
- [x] EPD coverage assessed (SANHA, Uponor, Pipelife, REHAU, Aquatherm — well-developed)
- [x] 4MS initiative and ECHA positive list pathway documented
- [x] PFAS monitoring and lead pipe replacement regulations documented
- [x] CPR/DWD coherence (Art. 11) and regulatory hierarchy documented
- [x] All findings connected to explicit sources with URLs
