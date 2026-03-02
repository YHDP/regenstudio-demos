# Deep Dive: SBE — Structural Bearings

**Family**: Annex VII #5 · SBE
**Full Name**: Structural bearings — Pins for structural joints
**Date**: 2026-03-01
**Batch**: 5 (Civil Engineering)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| TC | CEN/TC 167 |
| Standards | 14 (6 hEN + 8 EAD) |
| Pipelines | A (new-CPR hEN), C (old EAD sunset) |
| Acquis | No |
| SReq | Not adopted — targeted 2028 |
| DPP Estimate | ~2032–2033 |
| AVCP | Uniformly 1 (safety-critical) |

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-2 Milestone I | not_started | amber | ✅ Correct — Q4 2026 target |
| NT-3 Milestone III | not_started | amber | ✅ Correct — Q4 2027 target |
| NT-4 SReq | not_started | amber | ✅ Correct — 2028 target |
| NT-5 CEN Development | not_started | gray | ✅ Correct |
| NT-7 OJ Citation | pending | gray | ✅ Correct |
| NT-8 Coexistence | pending | gray | ✅ Correct |
| NT-9 HTS In Force | pending | orange | ✅ Correct — ~2032–2033 |

### Pipeline C — Old EAD Sunset

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-C1 Legacy EADs (8) | active | green | ✅ Correct — 8 EADs counted |
| NT-C2 EAD Expiry 2031 | pending | green | ✅ Correct |
| NT-C3 New EAD/Transition | not_started | gray | ✅ Correct |
| NT-C4 ETA Expiry 2036 | pending | green | ✅ Correct |

**Pipeline verdict**: All nodes accurate. No changes needed.

---

## 3. Standards Landscape Update

### hEN Standards (6) — EN 1337 Parts 3–8

All 6 hENs are EN 1337 parts (elastomeric, roller, pot, rocker, spherical PTFE, guide/restraint). All AVCP System 1. All under CEN/TC 167. EN 1337 Parts 1 (general rules) and 2 (sliding elements) are not harmonised — they are referenced but not CE-marking standards.

### EAD Standards (8)

Seven EADs cover innovative bearing materials (UHMWPE, fluoropolymer, filled PTFE, modified polyamide-polyethylene, curved surface slider). One covers thermal break elements (050001) and one covers dowels for structural joints (050019). All AVCP System 1.

### New/Changed Standards

No new standards or EADs found for SBE in 2025–2026.

---

## 4–5. SReq / Regulatory Landscape

Not adopted. COM(2025) 772 targets: M-I Q4 2026, M-III Q4 2027, SReq 2028. No active revision projects found. First EPD published Dec 2024 (mageba RESTON SPHERICAL).

---

## 6. Structural Issues Identified

| ID | Severity | Type | Description |
|----|----------|------|-------------|
| iss-SBE-001 | info | empty_content | 4 content sections empty: standards_landscape, standards_development, key_risks, sources_summary |

---

## 7–9. Data Changes / Cross-Family

No data changes proposed.
- **SBE ↔ CIF overlap**: CIF has bridge joint EADs that overlap with SBE's infrastructure domain. Not a data issue but a domain overlap worth noting.
- **Uniform System 1**: All 14 standards (hEN + EAD) are AVCP System 1 — the highest safety classification. Only FFF and CIF have similarly high System 1 ratios.

---

## 10. Quality Checklist

- [x] Standards count verified: 6 hEN + 8 EAD = 14 ✓
- [x] NT-C1 count matches: 8 ✓
- [x] All pipeline nodes reviewed
- [x] Convergence formula verified: max(~2032–2033, ~Q1-Q2 2029) = ~2032–2033 ✓
- [x] Cross-family overlap noted (CIF bridge joints)
- [x] Empty content sections documented
- [x] EUR-Lex, EOTA, EC checked
- [x] Review-queue JSON written

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across mageba EPD, bridge bearings market, EN 1337/CEN/TC 167 revision, structural health monitoring, bearing materials innovation, and ageing infrastructure
**Scope**: First structural bearings EPD (mageba), global/European bridge bearings market, CEN/TC 167 standards revision, IoT/digital twin bridge monitoring, PTFE/UHMWPE materials and PFAS risk, ageing European bridge infrastructure

### S1. Mageba RESTON SPHERICAL — First Structural Bearings EPD (Dec 2024), Industry Pioneer

Mageba published the first externally verified EPD in the structural bearings industry in December 2024 for RESTON SPHERICAL bearings (EPD number HUB-2481). Compliant with ISO 14025, EN 15804+A2, and ISO 21930. Key environmental data: GWP 3.90 kgCO₂e per kg of spherical bearing (modules A1-A3), secondary material inputs 33.1%, secondary material outputs 85.7%. Manufactured in Hungary. Valid until December 2029. This is a landmark for SBE: the first manufacturer to provide verified environmental data for structural bearings. For DPP: mageba's EPD demonstrates that structural bearing LCA data can be generated per EN 15804 — the methodology exists but the rest of the industry has not yet followed.

**Source**: Mageba EPD announcement (https://www.mageba-group.com/latam/en/1078/284902/Environmental-Product-Declaration-for-mageba-spherical-bearings.htm); EPD Hub registration (https://manage.epdhub.com/declarations/metal-based-products/mageba-services-technologies-ag/3046/reston-spherical-bearing/); Mageba EPD guide (https://www.mageba-group.com/ca/data/docs/fr_CA/53820/MaG-How-to-read-an-EPD-EN.pdf)

### S2. Bridge Bearings Market — Global $3.28B (2024), EU Expansion Joints Growing at 5.7% CAGR

Global bridge bearings market valued at $3.28 billion (2024), projected to $5.56 billion by 2033 (CAGR 6.03%). Steel and elastomeric bearings lead. EU bridge expansion joints market growing at 5.7% CAGR (2025–2035), shaped by Eurocode requirements and sustainable construction policies. Demand for sensor-integrated bearings surged in 2024, with 35+ bridges in Europe adopting strain and displacement monitoring. EU "Next Generation EU" scheme includes €750 billion, part allocated to transport infrastructure upgrades. SBE is a specialised, relatively small CPR family by market value but with high safety criticality (100% AVCP System 1).

**Source**: Bridge bearings market (https://www.openpr.com/news/4340139/bridge-bearings-market-valued-at-3-28-billion-in-2024); Future Market Insights (https://www.futuremarketinsights.com/reports/bridge-bearings-market); GlobeNewsWire (https://www.globenewswire.com/news-release/2024/08/01/2923004/0/en/Bridge-Bearing-Market-to-Reach-USD-1-242-87-Million-by-2034-Steel-and-Elastomeric-Bearings-Lead-the-Way-Future-Market-Insights-Inc.html)

### S3. EN 1337 Revision and CEN/TC 167 — Seismic Isolator Crossover with CEN/TC 340

EN 1337 Parts 1–11 cover structural bearings; Parts 3–8 are harmonised. CEN/TC 167 holds secretariat for structural bearings. Parallel work with CEN/TC 340 (anti-seismic devices, EN 15129) — seismic isolators are defined as "structural bearings possessing characteristics for seismic isolation." Experience from TC 167 WG1 being used in EN 1337 revision. EN 1337-1 (general design rules) references EN 1990 (Eurocode 0: Basis of structural design) and EN 1998-2 (Eurocode 8: Seismic design of bridges). Standards date from 2000–2005 and are overdue for modernisation. The SReq (2028) will trigger the next revision cycle.

**Source**: EN 1337-1 (https://standards.globalspec.com/std/797947/en-1337-1); EN 1337-3 (https://standards.iteh.ai/catalog/standards/cen/6aae99e4-e8b2-4e90-b171-1fe0552da1cd/en-1337-3-2005); CEN/TC 340 anti-seismic devices (http://eaee-tg11.weebly.com/uploads/4/3/9/4/439426/n_82_pren_15129_anti-seismic_devices.pdf)

### S4. Structural Health Monitoring — IoT Sensors and Digital Twins Emerging for Bridge Bearings

Structural health monitoring (SHM) integrates IoT sensors (strain gauges, accelerometers, inclinometers) with digital twin frameworks for real-time bridge condition assessment. Europe's Rail partnership IoTBridge project provides bridge monitoring for sensor data collection and analysis. 35+ European bridges adopted sensor-integrated bearings in 2024. Digital twin technology creates synchronised virtual representations of physical bridges, enabling predictive maintenance. Self-contained wireless sensors with battery/solar power reduce installation costs by 50%+. For DPP: SHM data could complement static product declarations with in-service performance data — a future DPP extension beyond manufacturing-phase declarations.

**Source**: IoTBridge (https://www.iotbridge.se/); MDPI SHM digital twin (https://pmc.ncbi.nlm.nih.gov/articles/PMC11013990/); ScienceDirect digital twin framework (https://www.sciencedirect.com/science/article/pii/S2772991525000477)

### S5. Bearing Materials — PTFE/UHMWPE Innovation, Potential PFAS Restriction Risk for PTFE

PTFE (polytetrafluoroethylene) and UHMWPE (ultra-high molecular weight polyethylene) are the primary sliding materials in structural bearings. PTFE offers ultra-low friction and chemical resistance; UHMWPE provides superior wear resistance but degrades above 80°C. Innovation: fluoropolymer compounds with enhanced thermal properties and lower friction enabling smaller bearings. 7 of 8 SBE EADs cover innovative bearing materials (UHMWPE, fluoropolymer, filled PTFE). Critical risk: PTFE is a PFAS (per- and polyfluoroalkyl substance). The proposed EU PFAS universal restriction could affect PTFE bearing production if critical-use exemptions are not granted. UHMWPE and modified polyamide alternatives exist but may not match PTFE performance in all applications.

**Source**: DREYPLAS alternatives (https://www.dreyplas.com/en/better-than-ptfe-and-uhmwpe/); PTFE PFAS debate (https://polyfluoroltd.com/blog/ptfe-and-the-pfas-debate-why-one-polymer-deserves-a-closer-look/); ScienceDirect PTFE tribological performance (https://www.sciencedirect.com/science/article/abs/pii/S095006182402066X)

### S6. Ageing European Bridge Infrastructure — 10% Deficient, €30B/Year Maintenance, €2 Trillion Built Value

Around 10% of European bridges are significantly deficient, 30% not regularly surveyed or maintained. Total built value of European bridges ~€2 trillion. Annual bridge maintenance should represent ~€30 billion/year. 2022 TEN-T amendment obliges member states to maintain transport network infrastructure quality. Connecting Europe Facility (CEF) budget €33.71 billion (2021–2027), €25.8 billion for transport. Germany alone plans €500 billion for public infrastructure. EU rail network includes 200,000+ bridges. Ageing infrastructure drives demand for bearing replacement and retrofit — modern bearing systems improve performance and seismic resilience. For DPP: replacement bearing traceability (which bearing on which bridge) aligns with DPP individual product tracking requirements.

**Source**: Construction Briefing ageing bridges (https://www.constructionbriefing.com/news/europes-ageing-bridges-are-crumbling-what-can-be-done-to-prevent-collapses/8036646.article); Europe's Rail (https://rail-research.europa.eu/solutions-catalogue/extending-the-life-and-capacity-of-europes-ageing-tunnels-and-bridges/); Germany infrastructure (https://www.webuildvalue.com/en/infrastructure/german-infrastructure.html)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 2 | iss-SBE-002 | info | dpp_readiness | Mageba first EPD in structural bearings industry (Dec 2024). GWP 3.90 kgCO₂e/kg, 33.1% secondary material. Rest of industry has not yet followed — sole DPP-ready manufacturer. |
| 3 | iss-SBE-003 | warning | cross_regulatory | PTFE is a PFAS — proposed EU universal PFAS restriction could affect PTFE structural bearings if critical-use exemptions not granted. UHMWPE/polyamide alternatives exist but may not match performance. 7/8 EADs cover innovative sliding materials. |
| 4 | iss-SBE-004 | info | market_context | Global bridge bearings $3.28B (2024). 10% of European bridges deficient, €30B/yr maintenance needed. Sensor-integrated bearings emerging (35+ bridges, 2024). Ageing infrastructure drives replacement demand. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] First structural bearings EPD documented (mageba, Dec 2024)
- [x] Bridge bearings/expansion joints market sized ($3.28B global, EU CAGR 5.7%)
- [x] EN 1337/CEN/TC 167 revision status assessed (seismic crossover with TC 340)
- [x] SHM/digital twin integration documented (IoTBridge, 35+ sensor-equipped bridges)
- [x] PTFE PFAS restriction risk identified (critical for bearing materials)
- [x] Ageing European infrastructure context documented (10% deficient, €2T built value)
- [x] All findings connected to explicit sources with URLs
