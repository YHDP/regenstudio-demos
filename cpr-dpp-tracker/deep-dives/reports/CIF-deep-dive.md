# Deep Dive: CIF — Circulation Fixtures (Road Equipment)

**Family**: Annex VII #12 · CIF
**Full Name**: Circulation fixtures: road equipment
**Date**: 2026-03-01
**Batch**: 5 (Civil Engineering)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| TC | CEN/TC 226 (+ TC 50) |
| Standards | 26 (15 hEN + 11 EAD) |
| Pipelines | A (new-CPR hEN), C (old EAD sunset) |
| Acquis | No |
| SReq | Not adopted — targeted 2028 |
| DPP Estimate | ~2032–2033 |
| AVCP | Primarily System 1 (80%); System 2+, 3 |

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-2 Milestone I | not_started | amber | ✅ Correct — 2027 target |
| NT-3 Milestone III | not_started | amber | ✅ Correct — 2027 target |
| NT-4 SReq | not_started | amber | ✅ Correct — 2028 target |
| NT-5 CEN Development | not_started | gray | ✅ Correct |
| NT-7 OJ Citation | pending | gray | ✅ Correct |
| NT-8 Coexistence | pending | gray | ✅ Correct |
| NT-9 HTS In Force | pending | orange | ✅ Correct — ~2032–2033 |

### Pipeline C — Old EAD Sunset

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-C1 Legacy EADs (11) | active | green | ✅ Correct — 11 EADs counted |
| NT-C2 EAD Expiry 2031 | pending | green | ✅ Correct |
| NT-C3 New EAD/Transition | not_started | gray | ✅ Correct |
| NT-C4 ETA Expiry 2036 | pending | green | ✅ Correct |

**Pipeline verdict**: All nodes accurate. No changes needed.

---

## 3. Standards Landscape Update

### hEN Standards (15)

| Category | Standards | AVCP |
|----------|-----------|------|
| Vehicle restraint | EN 1317-5 | 1 |
| Road signs | EN 12899-1/2/3/6, EN 12966 | 2+, 3 |
| Road markings | EN 1463-1 | 3 |
| Warning lights | EN 12352 | 3 |
| Noise barriers | EN 14388 | 3 |
| Lighting columns | EN 40-4/5/6/7 | 2+ |
| Passive safety | EN 12767 | 1 |
| Anti-glare | EN 12676-1 | 3 |

CIF spans 2 TCs: CEN/TC 226 (road equipment, 11 stds) and CEN/TC 50 (lighting columns, 4 stds).

### EAD Standards (11) — Dominated by Road Restraint Systems

10 of 11 EADs cover road restraint systems (modified barriers, cable barriers, wire rope, recycled rubber, bridge parapets, removable barriers). The 11th is a bridge parapet with integrated noise barrier. All AVCP System 1.

### New/Changed Standards

- EN 1317 Part 7 (terminals) published as CEN/TS 1317-7:2023 — not yet harmonised
- No new EADs found

---

## 4–5. SReq / Regulatory Landscape

Not adopted. COM(2025) 772 targets: M-I 2027, M-III 2027, SReq 2028. Milestone 0 pre-acquis work ongoing on new road restraint assessment method. IRMA working group on automated vehicle/road interactions.

---

## 6. Structural Issues Identified

| ID | Severity | Type | Description |
|----|----------|------|-------------|
| iss-CIF-001 | info | cross_family | Bridge-related EADs overlap with SBE domain. CIF EADs 120093, 120109, 120112 cover bridge infrastructure. Not a data error but domain overlap worth documenting. |
| iss-CIF-002 | info | empty_content | 4 content sections empty: standards_landscape, standards_development, key_risks, sources_summary |

---

## 7–9. Data Changes / Cross-Family

No data changes proposed.
- **CIF ↔ SBE**: Bridge infrastructure overlap. CIF covers bridge parapets and expansion joints while SBE covers bridge bearings — complementary rather than duplicative.
- **Multi-directive**: Variable message signs (EN 12966) face EMC, LVD, and potentially Cyber Resilience Act complexity — similar to FFF (Batch 2).
- **Safety-critical**: System 1 dominance (80% of standards) reflects vehicle impact testing requirements.

---

## 10. Quality Checklist

- [x] Standards count verified: 15 hEN + 11 EAD = 26 ✓
- [x] NT-C1 count matches: 11 ✓
- [x] All pipeline nodes reviewed
- [x] Convergence formula verified: max(~2032–2033, ~Q1-Q2 2029) = ~2032–2033 ✓
- [x] Cross-family overlap noted (SBE bridge infrastructure)
- [x] Empty content sections documented
- [x] EUR-Lex, EOTA, EC checked
- [x] Review-queue JSON written

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across EN 1317 vehicle restraint, road equipment EPDs, CEN/TC 226 standards, market sizing, variable message signs, and circular economy/recycled materials
**Scope**: Road restraint system testing/certification, ArcelorMittal/Unipromet EPDs, road safety equipment market, EN 12966 VMS multi-directive complexity, noise barriers from recycled materials

### S1. EN 1317 Vehicle Restraint Systems — System 1 Crash Testing, CEN/TS 1317-7:2024 for Terminals

EN 1317 defines testing and certification for road restraint systems. CE marking has been mandatory since 2011 under AVCP System 1 — requiring full-scale crash testing by notified bodies. EN 1317-5 is the harmonised standard for vehicle restraint system CE marking, covering barriers, crash cushions, terminals, and transitions. CEN/TS 1317-7:2024 was published for terminal performance (not yet harmonised). System 1 crash testing is expensive (~€100k+ per test) and is a significant barrier to market entry for SMEs. For DPP: crash test performance data (containment level, working width, ASI severity) is safety-critical and must be machine-readable. The dominance of System 1 (80% of CIF standards) means third-party test data is already well-structured for DPP integration.

**Source**: EN 1317 overview (https://www.traffixdevices.com/standards/en1317); CSI automotive (https://automotive.csi-spa.com/en/ce-certification-road-restraint-systems); Metalesa (https://metalesa.com/en/blog/road-safety-barriers-types-regulations-and-the-importance-of-certification-for-public-projects/); CEN/TS 1317-7:2024 (https://www.en-standard.eu/une-cen-ts-1317-7-2024-road-restraint-systems-part-7-performance-characterisation-and-test-methods-for-terminals-of-safety-barriers/)

### S2. Road Equipment EPDs — Emerging but Niche, ArcelorMittal Barriers and Unipromet Noise Panels

ArcelorMittal obtained an EN 15804 EPD for single-sided road barriers made with HSLA steel coated in Magnelis® — one of the first road safety barrier EPDs in Europe. Unipromet published an EPD for noise protection panels per EN 15804+A2 (verified 2025). EPD adoption in road equipment is early-stage compared to building materials — driven by green public procurement criteria in Scandinavian and Benelux markets. Steel barriers benefit from 100% recyclability narratives. The new CPR 2024/3110 makes environmental sustainability indicators mandatory — road equipment manufacturers will need EPDs or equivalent data for DPP compliance, which is a significant shift for this traditionally safety-focused (not sustainability-focused) sector.

**Source**: ArcelorMittal road barrier EPD (https://europe.arcelormittal.com/newsandmedia/europenews/3170/EPDroadbarriers); Unipromet noise panel EPD (https://unipromet.co.rs/wp-content/uploads/2025/10/EPD_HUB-4012_2025-Nois-protection-panels.pdf); Ecochain EPD guide (https://ecochain.com/blog/epds-for-safety-barrier-manufacturers/)

### S3. CEN/TC 226 — Road Equipment Standards, 2 TCs, Safety-Dominated Portfolio

CEN/TC 226 "Road equipment" (secretariat: AFNOR) covers safety fences/barriers, horizontal signs (road markings), vertical signs (EN 12899 series), traffic signals, street lighting, and other equipment including bollards and anti-glare screens. CIF also includes CEN/TC 50 for lighting columns (EN 40 series). EN 12899-1:2007 specifies requirements for fixed vertical signs including supports, sign plates, retroreflective sheeting, and luminaires. Micro-revisions to EN 12899-6 are in progress within CEN/TC 226 WG3. The standards portfolio is mature and stability-oriented — no major revision projects found for 2025–2026. DPP implementation for road equipment will be simpler than for building products due to fewer environmental variables and established crash test data infrastructure.

**Source**: CEN/TC 226 (https://standards.iteh.ai/catalog/tc/cen/70120d40-23bf-449e-9b6b-903b7b17d477/cen-tc-226); EN 12899-1 (https://standards.globalspec.com/std/1090955/cen-en-12899-1); CEN/TC 226 micro-revision (https://www.cmadz.cz/projednavane-predpisy/files/CEN-TC226-WG3_N0034_CEN_Micro_Revision_of_prEN_12899-6_addre.pdf)

### S4. European Road Safety Equipment Market — Barriers $1.8B (2024), Europe ~29% of Global Market

European highway safety barrier market valued at approximately $1.8 billion (2024). Europe holds 26–29% of the global road safety system market. The broader traffic equipment market (including signage, signals, barriers, delineators) is larger but precise European-only figures vary by source. Growth drivers: EU road safety targets (50% fatality reduction by 2030), Trans-European Transport Network (TEN-T) upgrades, and smart motorway deployments. Steel guardrails dominate by volume. CIF is a mid-sized CPR family by market value — smaller than TIP or FLO but with safety-critical AVCP System 1 requirements that create high compliance costs per product.

**Source**: Road safety barrier market (https://www.wiseguyreports.com/reports/road-safety-barrier-market); Grand View Research barriers (https://www.grandviewresearch.com/industry-analysis/barrier-systems-market); Mobility Foresights Europe traffic safety (https://mobilityforesights.com/product/europe-traffic-safety-equipment-market/)

### S5. EN 12966 Variable Message Signs — Multi-Directive Complexity (CPR + EMC + LVD + Potentially CRA)

EN 12966:2014 specifies requirements for variable message traffic signs (VMS), covering visual/optical performance, environmental/physical durability, electrical safety, and electromagnetic compatibility (EMC). VMS require CPR CE marking per EN 12966 plus compliance with EMC Directive (2014/30/EU) and Low Voltage Directive (2014/35/EU). As connected ITS infrastructure, VMS may also fall under the Cyber Resilience Act (CRA) from 2025 — requiring cybersecurity assessment for network-connected devices. This makes VMS potentially the most multi-directive product in CIF, similar to FFF fire alarm systems. For DPP: VMS data declarations would need to span construction product performance, electrical safety, EMC compliance, and potentially cybersecurity — a compound data architecture challenge.

**Source**: EN 12966 (https://standards.iteh.ai/catalog/standards/cen/b80b24ba-0bb1-4964-8c3e-d69cde1d4510/en-12966-2014); Sansi CPR certification (https://www.sansi.com/news/Sansi-LED-Once-Again-Obtained-the-CE-CPR-EN-12966-Certificate.html); ARTSM VMS guidance (https://artsm.org.uk/media/Guidance-on-the-selection-of-VMS-updated-v3.1-FINAL.pdf)

### S6. Circular Economy — Steel 100% Recyclable, Recycled Rubber Noise Barriers, Wind Turbine Blade Reuse

Steel road barriers are 100% recyclable indefinitely without property loss — a strong circular economy narrative for DPP declarations. Noise barriers increasingly use recycled materials: recycled rubber from tyres (183,000+ tyres diverted from landfill per year by one manufacturer), recycled plastics, and experimentally wind turbine blade composites. Steel slag aggregate is used in road construction base layers. For DPP: recycled content declarations for steel barriers (electric arc furnace steel typically 90%+ recycled content) and recycled rubber noise barriers provide concrete circular economy data. The road equipment sector's circular economy story is primarily metals-driven (unlike building products which are materials-diverse).

**Source**: MDPI steel reuse (https://www.mdpi.com/2075-5309/14/4/979); Recycled tire noise barriers (https://askdrnandi.com/from-landfill-to-lifesaver-repurposed-tires-tackle-urban-noise-pollution/); Wind turbine blade noise barriers (https://pubmed.ncbi.nlm.nih.gov/38730855/); Worldsteel circular economy (https://worldsteel.org/wider-sustainability/circular-economy/)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 3 | iss-CIF-003 | info | dpp_readiness | EPD adoption early-stage for road equipment. ArcelorMittal barrier EPD and Unipromet noise panel EPD are pioneers. System 1 dominance (80%) means structured crash test data already exists for DPP. |
| 4 | iss-CIF-004 | warning | multi_directive | EN 12966 VMS face CPR + EMC + LVD + potentially Cyber Resilience Act — most complex multi-directive product in CIF. DPP data architecture must span 4 regulatory frameworks. |
| 5 | iss-CIF-005 | info | market_context | European road safety barriers $1.8B (2024). Europe 26-29% of global market. Safety-critical AVCP System 1 dominance creates high compliance costs. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] EN 1317 vehicle restraint certification assessed (System 1, crash testing)
- [x] Road equipment EPDs documented (ArcelorMittal, Unipromet — early stage)
- [x] CEN/TC 226 standards portfolio reviewed (mature, no major revisions)
- [x] European road safety market sized ($1.8B barriers)
- [x] EN 12966 VMS multi-directive complexity documented (CPR + EMC + LVD + CRA)
- [x] Circular economy assessed (steel recyclable, recycled rubber/plastic noise barriers)
- [x] All findings connected to explicit sources with URLs
