# WCF — Wall & Ceiling Finishes: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-27)
**Family**: Annex VII #21 · WCF

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Internal & external wall and ceiling finishes - Internal partition kits |
| Letter | WCF |
| Annex VII # | 21 |
| TC | CEN/TC 128, CEN/TC 99, CEN/TC 241 |
| Standards tracked | 22 (22 hEN + 0 EAD) |
| Active pipelines | A (new-CPR hEN route) |
| Future pipelines | None |
| DPP estimate | ~2032–2033 |
| SReq status | Not started (targeted 2028) |
| AVCP | System 1 (fire A1–C), System 3 (fire D–F, durability), System 4 (remaining) — per 98/437/EC |
| Last updated | 2026-02-22 |

**Key context**: WCF is an hEN-only family (0 EADs, no Pipeline C). One of the most fragmented families — covering fibre-cement sheets, metal cladding, stone cladding, render/plaster, gypsum plasterboard, suspended ceilings, profiled metal sheeting, and partition kits. Reaction to fire is the dominant performance characteristic. Post-Grenfell EU facade fire test standard effective Jan 2026.

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | not_started | amber | Acquis not started. M-I targeted Q3 2026. | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | not_started | amber | Dependent on M-I. Targeted Q3 2027. | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | amber | No Art. 12 notification. SReq planned 2028. | No change | No change | S30 |
| CEN Standards Development | NT-5 | not_started | gray | Blocked on SReq. | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | No new OJ citations for WCF. | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | ~2032–2033 estimate | No change | No change | S30, S1 |

**Summary**: No pipeline node status changes needed. No Pipeline C (0 EADs).

---

## 3. Standards Landscape Update

### hENs (22)

All 22 hENs cited under CPR 305/2011 via mandate M/121. Key standards include EN 12467 (fibre-cement flat sheets), EN 438-7 (HPL for wall/ceiling), EN 14509 (sandwich panels — cross-family with SMP/ROC), EN 13986 (wood-based panels), EN 14411 (ceramic tiles for wall finishes), and EN 13964 (suspended ceilings).

### EADs (0)

WCF has no EADs. All products use the hEN route exclusively.

**Count verification**: 22 hENs + 0 EADs = 22 total. Matches standards_summary ("~22 hENs"). ✓

---

## 4. SReq Analysis Update

**Status**: Not started. No Art. 12 notification.

Key facts:
- Per COM(2025) 772: M-I targeted Q3 2026, M-III targeted Q3 2027, SReq targeted 2028
- Acquis not started
- Under CPR 2024/3110
- New EU facade fire test standard effective Jan 2026 — may influence the SReq scope

**No change to tracker data**: SReq status correctly recorded.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Does NOT affect WCF
- No new implementing decisions for wall/ceiling finishes found in 2025–2026

### CEN Work Programme
- CEN/TC 128: Shared with ROC. No specific WCF development info found.
- CEN/TC 99: Wall coverings. No active CPR-relevant projects found.
- CEN/TC 241: Gypsum products. Active but no specific 2025–2026 info found.

### EOTA
- No EADs for WCF — not applicable

---

## 6. Structural Issues Identified

| # | Severity | Type | Description | Action |
|---|----------|------|-------------|--------|
| 1 | info | empty_content | `content.standards_development`, `key_risks`, `sources_summary` all empty (3 sections) | Populate with content |
| 2 | info | cross_family | EN 14509 (sandwich panels) cross-listed in SMP, ROC, WCF | Verify consistent data across families |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No changes needed. | — |

---

## 8. Content Section Updates

### content.key_risks (currently empty)
**Proposed**: "1) Post-Grenfell fire testing: New EU facade fire test standard (temperature-based measurement) effective Jan 2026 — may reshape technical requirements for external wall finishes. 2) Fragmentation: 3 TCs (128, 99, 241) complicates standards coordination. 3) EN 14509 (sandwich panels) cross-family consistency with SMP and ROC."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110. S143: nlfnorm.cz harmonised standards database."

---

## 9. Cross-Family Notes

- **EN 14509** (sandwich panels): Cross-listed in SMP (Batch 1) and ROC (this batch). Ensure consistent treatment.
- **CEN/TC 128**: Shared between WCF and ROC. Any TC-level changes affect both families.
- **Facade fire test standard**: New EU standard effective Jan 2026 — cross-reference with FPP (Batch 2) and other fire-related families.

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in A — 7 total, no Pipeline C)
- [x] All standards checked against sources (22/22 verified)
- [x] hen_count matches actual hEN count in standards[] (22 hENs)
- [x] ead_count matches actual EAD count in standards[] (0 EADs)
- [x] DPP date consistent with convergence formula (max(~2032–2033, ~Q1-Q2 2029) = ~2032–2033) ✓
- [x] No duplicate update IDs
- [x] Content sections all non-empty or flagged (3 empty sections flagged)
- [x] Source citations present for all claims
- [x] Cross-family standards noted (EN 14509 → SMP/ROC, CEN/TC 128 → ROC)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across facade market, fire safety, EPD infrastructure, suspended ceilings, plasterboard, and natural stone cladding
**Scope**: European cladding/facade market, post-Grenfell facade fire test standard, fibre-cement EPDs, suspended ceiling EPDs, gypsum plasterboard market, facade market segments

### S1. European Cladding/Facade Market — $57B+ (2024), Post-Grenfell Regulation Reshaping Demand

The European cladding market was valued at over $57.23 billion in 2024. Key segments: ventilated systems 51% of revenue, curtain-wall 45.2%, rainscreen cladding growing fastest (4.98% CAGR). Fibre-cement cladding: $1.75B (2024), growing to $3.20B by 2033 (CAGR 7.5%). Germany leads European production with diverse cladding materials. The European Green Deal drives demand for energy-efficient facades. A revised European standard for cladding fire testing takes effect 31 January 2026 — directly reshaping technical requirements for external wall finishes post-Grenfell. This fire test standard is the most impactful regulatory change for WCF, potentially requiring re-testing of existing products and updating DPP fire performance declarations.

**Source**: Research & Markets Europe Cladding (https://www.researchandmarkets.com/report/europe-cladding-market); Straits Research Cladding Market (https://straitsresearch.com/report/cladding-market); Fibre Cement Cladding Market (https://www.verifiedmarketreports.com/product/fibre-cement-cladding-market/); International Fire & Safety Journal (https://internationalfireandsafetyjournal.com/new-european-cladding-fire-test-standard-to-take-effect-in-2026/)

### S2. Post-Grenfell Facade Fire Test — New European Standard Effective January 2026

The revised European facade fire test standard takes effect 31 January 2026. Post-Grenfell, buildings above 11m require minimum Euroclass A2-s1,d0 (limited combustibility) for outer wall systems. EOTA Technical Report TR 078 provides methodology for "determination of fire-related characteristics of external wall claddings" — going beyond EN 13823 SBI single-product testing to system-level fire performance. The EU developed this approach from a 2018 JRC study on facade fire assessment. For DPP: fire classification data (Euroclass A1-F, smoke s1-s3, droplets d0-d2) is safety-critical and must be machine-readable. The system-level dimension (like ETICS in KAS) means WCF facade products need both component-level and assembled-system fire declarations. AVCP System 1 for fire classes A1-C ensures third-party testing.

**Source**: EOTA TR 078 (https://www.eota.eu/sites/default/files/uploads/Technical%20reports/EOTA%20TR%20078_Determination%20of%20fire-related%20characteristics%20of%20external%20wall%20claddings_2023-11.pdf); JRC facade fire study (https://op.europa.eu/en/publication-detail/-/publication/81b91f55-af69-11e8-99ee-01aa75ed71a1/language-en); International Fire & Safety Journal (https://internationalfireandsafetyjournal.com/new-european-cladding-fire-test-standard-to-take-effect-in-2026/)

### S3. Fibre-Cement EPDs — James Hardie 90%+ Coverage, Etex Cedral EPDs Published

James Hardie reports that more than 90% of its products hold verified EPDs per ISO 14025 and EN 15804. Hardie fibre-cement boards have "set new sustainability standards for facade cladding" with verified EPD data showing 50-year product life assumption. Etex (Cedral brand) also publishes EPDs for fibre-cement products. Both are registered on EPD International. Fibre-cement products have inherent EPD advantages: long durability (50+ years), mineral-based composition, and relatively simple manufacturing LCA. This makes fibre-cement cladding among the most EPD-ready WCF product categories. However, metal cladding, HPL panels, and render/plaster products have less visible EPD coverage.

**Source**: James Hardie EPDs (https://www.jameshardie.eu/EU-en/products/smart-sustainability); James Hardie EPD brochure (https://www.jameshardie.eu/getmedia/79ded9be-f448-4d6f-a825-7d14bf304dc5/epd-backer-12mm.aspx); Etex Cedral EPD (https://media.cedral.world/pd53969/original/1192955283/en_cedral_epd-2.pdf); EPD International external cladding (https://www.environdec.com/library/epd5037)

### S4. Suspended Ceiling EPDs — Knauf (AMF/Armstrong) Leads with ISO 14001 + EPD Portfolio

Knauf Ceiling Solutions (incorporating Armstrong and AMF brands) is one of Europe's leading ceiling tile manufacturers with 120+ years of expertise. Products include AMF THERMATEX mineral wool tiles (bio-soluble, natural raw materials). Knauf holds EN ISO 14001 environmental management certification and produces EPDs for ceiling tiles — found in IBU database. Suspended ceilings (EN 13964) are a significant WCF sub-segment. However, the broader suspended ceiling market includes multiple smaller manufacturers whose EPD coverage is less visible. Ceiling tiles have relatively simple LCA profiles (mineral wool or metal) compared to multi-layer facade systems.

**Source**: Knauf AMF (https://www.knaufamf.com/en/); Knauf AMF EPD via IBU (https://ibudata.lca-data.com/resource/sources/c967f032-9d13-449b-9d0e-68e5d1f4acbb/AMF_ECOMIN_ARMSTRONG_Basic_Range_AMF_THERMATEX_ARMSTRONG_Standard_Range_Pontalier__18577.pdf)

### S5. Gypsum Plasterboard Market — $7.1B (2023), Saint-Gobain/Knauf/Etex Dominate

The European gypsum-based plasterboard market: $7.10 billion (2023), growing to $14.08B by 2033 (CAGR 7.09%). Dominated by Saint-Gobain (Gyproc), Knauf, and Etex (Fermacell). Products comply with EN 520 (gypsum plasterboard) and EN 13279-1 (gypsum plasters). The Plasterboard Sustainability Partnership (PSP) has a Gypsum Sustainability Action Plan promoting lifecycle environmental improvement. Gypsum is Europe's most recycled interior finishing material — recycled gypsum from demolition used in new production. Sustainability drivers: energy efficiency in buildings, fire performance (non-combustible), and acoustic performance. Gypsum plasterboard overlaps with GYP family (CEN/TC 241), creating a cross-family boundary question for DPP data consistency.

**Source**: GlobeNewsWire Europe Plasterboard (https://www.globenewswire.com/news-release/2024/11/01/2973239/28124/en/Europe-Gypsum-Based-Plasterboard-and-Alternatives-Market-Report-2023-2033); Grand View Research Europe Gypsum Board (https://www.grandviewresearch.com/industry-analysis/europe-gypsum-board-market-report); Mordor Intelligence (https://www.mordorintelligence.com/industry-reports/europe-gypsum-board-market)

### S6. European Facade Market Segments — Ventilated Systems 51%, Green Deal Driving Transformation

The European facade market: $7 billion (2024, specific facade-only market), growing to $10.34B by 2032 (CAGR 5%). Ventilated facade systems hold 51% revenue share. Wall coverings: vinyl leads at 38.13% share, wood-based materials growing fastest (5.43% CAGR). The European Green Deal and EPBD recast drive demand for: insulated panels, solar-integrated facades (BIPV — cross-family with ROC/KAS), green walls (cross-family with KAS EAD 340037), and high-performance cladding. WCF's product diversity (fibre-cement, metal, stone, render, gypsum, HPL, suspended ceilings) mirrors FLO's material diversity — both families face DPP challenges from accommodating radically different product types within one family.

**Source**: Mordor Intelligence Europe Facade (https://www.mordorintelligence.com/industry-reports/europe-facade-market); Grand View Research (https://www.grandviewresearch.com/horizon/outlook/facade-market/europe); Mordor Intelligence Wall Coverings (https://www.mordorintelligence.com/industry-reports/europe-wall-coverings-market)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 3 | iss-WCF-003 | warning | regulatory_development | New EU facade fire test standard effective 31 Jan 2026. Post-Grenfell: A2-s1,d0 minimum for buildings >11m. System-level fire testing (EOTA TR 078) beyond single-product EN 13823 SBI. |
| 4 | iss-WCF-004 | info | dpp_readiness | Split EPD readiness: fibre-cement excellent (James Hardie 90%+, Etex Cedral), suspended ceilings good (Knauf AMF), gypsum established, metal/stone/render less visible. |
| 5 | iss-WCF-005 | info | market_context | European cladding $57B+ (2024), facade $7B, plasterboard $7.1B. Ventilated systems 51% facade revenue. Combined WCF market among largest CPR families. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] European cladding/facade market sized ($57B+, $7B, $7.1B plasterboard)
- [x] Post-Grenfell facade fire test standard documented (effective 31 Jan 2026)
- [x] Fibre-cement EPDs assessed (James Hardie 90%+, Etex Cedral)
- [x] Suspended ceiling EPDs documented (Knauf AMF/Armstrong)
- [x] Gypsum plasterboard market and sustainability assessed
- [x] Facade market segments analysed (ventilated 51%, Green Deal drivers)
- [x] All findings connected to explicit sources with URLs
