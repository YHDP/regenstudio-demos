# CAB — Cables & Wires: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-22)
**Family**: Annex VII #31 · CAB
**Batch**: 10 (Trailing / sparse data)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Power, control and communication cables |
| Letter | CAB |
| Annex VII # | 31 |
| TC | CLC/TC 20 (CENELEC) |
| Standards tracked | 1 (1 hEN + 0 EAD) |
| Active pipelines | A (new-CPR hEN route) |
| Future pipelines | None |
| DPP estimate | ~2033–2034 |
| Acquis | No |
| SReq status | Not started — no date set |
| AVCP | 1+/1/3/4 (varies by fire class) |
| Last updated | 2026-02-22 |

**Key context**: CAB is unique in two respects: (1) it is the only CPR family under CENELEC rather than CEN — EN 50575 is a CENELEC standard, not a CEN standard; (2) it has the **latest milestone dates** of all 37 families, with M-I and M-III both targeted for 2029. EN 50575:2014+A1:2016 covers reaction to fire only (Euroclass Aca–Fca). Mandatory CE marking has been in force since July 2017. AVCP varies by fire class: System 1+ (Aca), System 1 (B1ca–B2ca), System 3 (Cca–Dca), System 4 (Eca).

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | not_started | amber | Correct — 2029 target (latest of all families) | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | not_started | amber | Correct — 2029 target | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | gray | Correct — no date set | No change | No change | S30 |
| CEN Standards Development | NT-5 | not_started | gray | Correct — blocked on SReq. EN 50575 no active revision. | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | EN 50575 is cited under CPR 305/2011. No new citations. | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | ~2033–2034 estimate | No change | No change | S30, S1 |

**Pipeline verdict**: All 7 nodes accurate. No changes needed. No Pipeline C (0 EADs).

---

## 3. Standards Landscape Update

### hENs (1) — EN 50575

| Standard | Name | AVCP | TC | Current Edition | Status |
|----------|------|------|----|-----------------|--------|
| EN 50575 | Power, control and communication cables — reaction to fire requirements | 1+/1/3/4 | CLC/TC 20 | EN 50575:2014+A1:2016 | Cited (CPR 305/2011) |

EN 50575 covers only reaction to fire characteristics for cables permanently installed in buildings and civil engineering works. The fire classification system has 7 Euroclass levels (Aca, B1ca, B2ca, Cca, Dca, Eca, Fca) with additional classification criteria for smoke production (s1/s2/s3), burning droplets (d0/d1/d2), and acidity (a1/a2/a3).

**Important**: EN 50575 is a CENELEC standard, not a CEN standard. The SReq process for CAB would be issued to CENELEC, not CEN. This is the only family where the standardisation body is CENELEC rather than CEN.

### EADs (0)

No EADs. All products use the hEN route exclusively.

### New/Changed Standards

No new standards or EADs found for CAB in 2025–2026. No active revision of EN 50575 confirmed.

**Count verification**: 1 hEN + 0 EADs = 1 total. Matches standards_summary ("1 hEN (EN 50575). 0 EADs.").

---

## 4. SReq Analysis Update

**Status**: Not started. No Art. 12 notification.

Key facts:
- M-I and M-III both targeted 2029 — latest of all 37 families
- No SReq date set
- No acquis
- Under CPR 2024/3110
- SReq would be issued to CENELEC (CLC/TC 20), not CEN
- EN 50575 covers reaction to fire only — future SReq may expand scope to include other essential characteristics (e.g., dangerous substances, durability)

**No change to tracker data**: SReq status correctly recorded.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Does NOT affect CAB
- Commission Delegated Regulation (EU) 2016/364 (classification without testing for cables) still in force
- No new implementing decisions for cables found in 2025–2026

### CEN/CENELEC Work Programme
- CLC/TC 20 (Electric cables): Active. EN 50575:2014+A1:2016 current. No active revision project found.
- Europacable (industry association) confirms no immediate changes.

### EOTA
- No EADs for CAB — not applicable

---

## 6. Structural Issues Identified

| # | ID | Severity | Type | Description | Action |
|---|----|----------|------|-------------|--------|
| 1 | iss-CAB-001 | info | empty_content | 4 content sections empty: standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary | Populate with content |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No pipeline or data changes needed. | — |

---

## 8. Content Section Updates

### content.key_risks (currently empty)
**Proposed**: "1) Latest start: M-I and M-III both 2029 — last of all 37 families, but also means least urgency for stakeholders. 2) Scope expansion risk: EN 50575 covers reaction to fire only. Future CPR SReq may require additional essential characteristics (dangerous substances from PVC/halogen-free cables, durability, recyclability). 3) CENELEC not CEN: Unique standardisation body — SReq process may differ from CEN-based families. 4) Single standard: EN 50575 is the sole hEN, making it a single point of failure for the entire family."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110. S143: nlfnorm.cz harmonised standards database."

---

## 9. Cross-Family Notes

- **CENELEC vs CEN**: CAB is the only CPR family standardised by CENELEC rather than CEN. This affects the SReq process and committee structure.
- **No cross-family standards**: EN 50575 is self-contained within CLC/TC 20.
- **Low Voltage Directive overlap**: Cables are also regulated under the Low Voltage Directive (2014/35/EU) for electrical safety. CPR covers reaction to fire only. Dual-directive compliance required.

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in A — 7 total, no Pipeline C)
- [x] All standards checked against sources (1/1 verified)
- [x] hen_count matches actual hEN count in standards[] (1 hEN)
- [x] ead_count matches actual EAD count in standards[] (0 EADs)
- [x] DPP date consistent with convergence formula (max(Product ~2033–2034, System ~Q1-Q2 2029) = ~2033–2034)
- [x] No duplicate update IDs
- [x] Content sections all non-empty or flagged (4 empty sections flagged)
- [x] Source citations present for all claims
- [x] Cross-family standards noted (none — self-contained; CENELEC uniqueness documented)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across European cable market, Europacable/CPR/EN 50575, cable EPDs, cable recycling, CLC/TC 20 standards, and PVC/PFAS/LSZH regulation
**Scope**: European cable market sizing, Europacable CPR implementation guides, EPD coverage (Prysmian, Nexans), PVC/copper recycling and circular economy, CENELEC CLC/TC 20 work programme, dangerous substances regulation for cable materials

### S1. European Cable Market — $36–63B (2024), Construction a Significant Segment, Growth Driven by Electrification

European wire and cable market valued at $36.3–63.3 billion (2024, depending on scope definition), growing at 5.2–7.2% CAGR. Power and control cables (directly relevant to CAB/EN 50575) are the dominant segment. Growth drivers: renewable energy installations (solar, wind requiring extensive cabling), EV charging infrastructure, smart grid modernisation, and building electrification under EPBD. Key European manufacturers: Prysmian (Italy, world's largest), Nexans (France), NKT (Denmark), Leoni (Germany). Construction building cables are a subset of the broader market — EN 50575 applies specifically to cables permanently installed in buildings and civil engineering works (not utility transmission cables).

**Source**: GMInsights Europe wire and cable (https://www.gminsights.com/industry-analysis/europe-wire-and-cable-market); GMInsights Europe power and control cable (https://www.gminsights.com/industry-analysis/europe-power-and-control-cable-market); Mordor Intelligence (https://www.mordorintelligence.com/industry-reports/europe-wire-and-cable-market)

### S2. Europacable CPR Implementation Guides — Fire Classification System Well-Established, LSZH Not Sufficient for Euroclass

Europacable (European cable industry association) publishes guides for CPR implementation, clarifying EN 50575 fire classification requirements for electrical professionals. Key points: Euroclass system (Aca–Fca) with additional classifications for smoke (s1/s2/s3), burning droplets (d0/d1/d2), and acidity (a1/a2/a3) is fully established since July 2017. LSZH (Low-Smoke Zero-Halogen) material alone is not sufficient for Euroclass determination — only independent testing under EN 50575 determines the class. Ireland mandates LSZH cables for construction; Netherlands, Germany, Greece, Switzerland require LSZH in high-risk environments. EN 13501-6 defines the cable-specific fire classification system. For DPP: fire reaction data is the only current EN 50575 declared characteristic, but the SReq may expand to include dangerous substances, durability, and recyclability.

**Source**: Europacable CPR guide (https://cpr.europacable.eu/en/cpr/how-europacables-new-guide-supports-electrical-professionals-under-cpr-industrial-settings); Motistech EN 50575 (https://www.motistech.com/solution/eu-cable-fire-testing-cpr); Europacable FAQ (https://cpr.europacable.eu/en/faq)

### S3. Prysmian and Nexans Publish EN 15804+A2 EPDs — Cable Industry EPD Coverage Emerging

Prysmian publishes EN 15804+A2 EPDs for cable products following ISO 14025 and PCR NPCR 027.2022 Part B (cables and wires). Prysmian's EPDs provide cradle-to-grave lifecycle data. Nexans produces EPDs per EN 15804+A2 (post mid-2022 PCR ed4 update) — including Norwegian EPD programme registration. RMF-Eco-Cable 24kV EPD published via EPD Global programme. EPDs cover power, control, and communication cable categories. For DPP: the cable industry's EPD infrastructure is developing, with market leaders (Prysmian, Nexans) providing EN 15804+A2 data. However, the broader market (hundreds of SME cable manufacturers) likely lacks EPD coverage. The cable-specific PCR (NPCR 027) exists, which is a positive indicator for DPP data standardisation.

**Source**: Prysmian EPD (https://northeurope.prysmian.com/sustainability/products-services/epd); Nexans EPD (https://www.nexans.no/en/sustainability/Miljo/PEP.html); EPD Global RMF cable (https://www.epd-global.com/getfile.php/13184549-1741662836/EPDer/Byggevarer/NEPD-6131-5394_AXLJ-RMF-Eco-Cable-3x150-35-LT-SPEC-24kV-.pdf)

### S4. Cable Recycling Well-Established — Copper 100% Recyclable, PVC 90% Energy Savings, XLPE Chemical Recycling Emerging

Cable recycling is among the most established in construction products: copper is 100% recyclable with no quality loss, and cable copper recycling has been practiced for decades. PVC from cables is recyclable — recycled PVC's primary energy demand up to 90% lower than virgin. VinylPlus and PVC4Cables programmes coordinate cable PVC recovery across Europe. XLPE (cross-linked polyethylene) is more challenging — thermoset cannot be reshaped, traditionally chipped for matting. Borealis Borcycle™ C chemical recycling (pyrolysis) now enables XLPE-to-new-polyethylene conversion. Nexans actively promotes circular economy with recycled cable programmes. RecyCâbles (France) and PVC Upcycling programmes registered on EU Circular Economy Stakeholder Platform. For DPP: cable recycling data (copper recovery rate, PVC recycling pathway, XLPE end-of-life) is well-documented and could be rich DPP circular economy data.

**Source**: PVC4Cables circular economy (https://pvc4cables.org/sustainability/circular-economy/); EU Circular Economy Platform PVC Upcycling (https://circulareconomy.europa.eu/platform/en/good-practices/pvc-upcycling-reclaiming-pvc-copper-and-aluminium-decommissioned-electric-cables); Eland Cables recycling (https://www.elandcables.com/company/news-and-events/recycling-in-the-cable-industry-past-present-and-future); Nexans circular economy (https://www.nexans.com/impact/environment/circular-economy/)

### S5. CLC/TC 20 — CENELEC Electric Cables TC, EN 50575 Current, No Active Revision Found

CLC/TC 20 "Electric cables" prepares harmonised standards for insulated conductors, cables, and flexible cords across low and high voltage (excluding telecommunications). EN 50575:2014+A1:2016 is the current cited edition. CLC/TS 50576 (extended application of test results for reaction to fire) is a supporting technical specification. No specific EN 50575 revision projects found for 2025–2026. CEN-CENELEC Work Programme 2025 lists electrotechnology as an active sector but CAB-specific items not identified. Given M-I and M-III both targeted 2029, there is no urgency for standards revision — CLC/TC 20 has the longest lead time of any CPR family TC.

**Source**: CENELEC CLC/TC 20 (https://standards.cencenelec.eu/dyn/www/f?p=305%3A7%3A0%3A25%3A%3A%3AFSP_ORG_ID%2CFSP_LANG_ID%3A1257155); CEN-CENELEC Work Programme 2025 (https://wp2025.cencenelec.eu/sectors-list/electrotechnology/); GlobalSpec EN 50575 (https://standards.globalspec.com/std/10011181/cenelec-en-50575)

### S6. Dangerous Substances Pressure — REACH Lead Restriction on PVC (Nov 2024), PFAS Risk for Fluoropolymer Insulation

Multiple dangerous substances regulations converge on cables: REACH lead restriction on PVC articles (effective Nov 29, 2024) directly affects PVC-insulated cables. ECHA PFAS restriction proposal could impact fluoropolymer cable insulation (PTFE, FEP, ETFE used in high-temperature/chemical-resistant cables). PVC cables release up to 30% hydrogen chloride when burned (driving LSZH shift). For DPP: current EN 50575 covers only reaction to fire — the dangerous substances dimension (lead in PVC, PFAS in fluoropolymers, plasticiser migration) is conspicuously absent and likely to be added when the SReq expands EN 50575's scope. This represents one of the most significant potential scope expansions for any single-hEN family.

**Source**: SGS EU lead in PVC (https://www.sgs.com/en-us/news/2023/05/safeguards-5523-eu-restricts-lead-in-pvc-articles-under-reach); UL PFAS restrictions (https://www.ul.com/news/eu-sets-pfas-restrictions-consumer-products); PVC4Cables FAQ (https://pvc4cables.org/cables/faq/)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 2 | iss-CAB-002 | info | dpp_readiness | Prysmian and Nexans publish EN 15804+A2 EPDs (PCR NPCR 027). Cable copper 100% recyclable, PVC recycling 90% energy savings. Market leaders have EPD infrastructure but SME coverage likely limited. |
| 3 | iss-CAB-003 | warning | cross_regulatory | REACH lead restriction on PVC (Nov 2024) and ECHA PFAS proposal impact cable materials. EN 50575 covers fire only — dangerous substances dimension absent. SReq scope expansion likely the most significant for any single-hEN family. |
| 4 | iss-CAB-004 | info | market_context | European wire/cable market $36-63B (2024). Construction cables a subset. Growth driven by renewable energy, EV charging, smart grids, EPBD. Prysmian and Nexans are global leaders. Cable recycling well-established (copper 100%, PVC recyclable, XLPE chemical recycling emerging). |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] European cable market sized ($36–63B depending on scope)
- [x] EPD coverage assessed (Prysmian, Nexans with EN 15804+A2 EPDs)
- [x] Cable recycling documented (copper 100%, PVC 90% energy savings, XLPE Borcycle™ C)
- [x] CLC/TC 20 standards status checked (no active EN 50575 revision)
- [x] Dangerous substances regulatory pressure documented (REACH lead, PFAS fluoropolymers)
- [x] Europacable CPR implementation and LSZH distinction documented
- [x] All findings connected to explicit sources with URLs
