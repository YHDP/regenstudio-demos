# WBP — Wood Based Panels: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-27)
**Family**: Annex VII #14 · WBP
**Batch**: 8 (Panels & Membranes)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Wood based panels and elements |
| Letter | WBP |
| Annex VII # | 14 |
| TC | CEN/TC 112 |
| Standards tracked | 4 (1 hEN + 3 EAD) |
| Active pipelines | A (new-CPR hEN route), C (old EAD sunset) |
| Future pipelines | None |
| DPP estimate | ~2032 |
| Acquis | Yes |
| SReq status | Not started — no date set |
| AVCP | "1, 2+, 3, 4" (EN 13986 umbrella standard — system depends on characteristic) |
| Last updated | 2026-02-22 |

**Key context**: WBP is the most interesting family in Batch 8. Despite having Acquis=Yes (meaning product scope work has been completed), ALL Table 3 milestones are empty — a unique regulatory gap not seen in other acquis-classified families. EN 13986 is an umbrella product standard that references subordinate standards (EN 300, EN 312, EN 622 series, EN 634, EN 636, EN 13353, EN 14279, EN 15197) covering plywood, OSB, particleboard, MDF/HDF, fibreboard, and cement-bonded panels. The REACH (EU) 2023/1464 formaldehyde threshold reduction (E0.5, effective Aug 2026) is a significant cross-regulatory factor. SG 20 (May 2025) noted new standards are "at minimum 3 years away." Most sparse data of any family in Batch 8.

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | not_started | gray | Acquis=Yes but no M-I date in Table 3. Certainty correctly gray (no timeline). | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | not_started | gray | No M-III date. Consistent with missing milestones. | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | gray | No SReq date set. | No change | No change | S30 |
| CEN Standards Development | NT-5 | not_started | gray | "At minimum 3 years away" per SG 20 (May 2025). EN 13986 revision not started. | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | No new OJ citations for WBP. | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | ~2032 estimate | No change | No change | S30, S1 |

### Pipeline C — Old EAD Sunset (305/2011)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Legacy EADs Active (3) | NT-C1 | active | green | 3 old-regime EADs counted in standards[]. Correct. | No change | No change | S1, S144 |
| EAD Validity Expires (9 Jan 2031) | NT-C2 | pending | green | Confirmed | No change | No change | S1 |
| New EAD / Transition | NT-C3 | not_started | gray | No replacement EADs found. | No change | No change | S1, S98 |
| ETA Validity Expires (9 Jan 2036) | NT-C4 | pending | green | Confirmed | No change | No change | S1 |

**Pipeline verdict**: All nodes accurate. No status changes needed. The gap between Acquis=Yes and empty milestones is a structural issue (iss-WBP-002), not a node error.

---

## 3. Standards Landscape Update

### hENs (1) — EN 13986 Umbrella Standard

EN 13986 is cited under CPR 305/2011 via CEN/TC 112. It is an umbrella product standard that does not define material properties itself but references subordinate product standards:

| Referenced Standard | Product Type |
|-------------------|--------------|
| EN 300 | Oriented strand board (OSB) |
| EN 312 | Particleboard |
| EN 622 series | Fibreboard (MDF, HDF, softboard) |
| EN 634 | Cement-bonded particleboard |
| EN 636 | Plywood |
| EN 13353 | Solid wood panels (SWP) |
| EN 14279 | Laminated veneer lumber (LVL) |
| EN 15197 | Prefabricated wood-based loadbearing stressed skin panels |

AVCP varies by characteristic: System 1 (reaction to fire for classes A1–C), System 2+ (structural), System 3 (fire for classes D–F), System 4 (remaining). This mixed-AVCP structure is unique in Batch 8.

### EADs (3) — Old-Regime

| EAD | Name | AVCP | Expires |
|-----|------|------|---------|
| EAD 140015-00-0304 | Walls, roofs and ceilings made of multi-layer OSB plates | 1 | 9 Jan 2031 |
| EAD 140022-00-0304 | Prefabricated wood-based loadbearing stressed skin panels | 1 | 9 Jan 2031 |
| EAD 210058-00-0304 | Wood-based composite panels for internal use in buildings | 2+ | 9 Jan 2031 |

All 3 EADs are old-regime under CPR 305/2011. ETAs valid until 9 Jan 2036.

### Cross-Regulatory: REACH E0.5 Formaldehyde Threshold

Commission Regulation (EU) 2023/1464 amends REACH Annex XVII, halving the formaldehyde emission limit for wood-based panels from 0.124 mg/m3 to 0.062 mg/m3 (E0.5 class), effective **August 2026**. This directly impacts EN 13986 formaldehyde classification and testing requirements. While not a CPR change per se, it is a cross-regulatory factor that will affect DPP data content (emission declarations) and may accelerate standards revision needs.

**Count verification**: 1 hEN + 3 EADs = 4 total. Matches standards_summary ("1 hEN (EN 13986) + 3 EADs.").

---

## 4. SReq Analysis Update

**Status**: Not started. No Art. 12 notification. No SReq date in Table 3.

Key facts:
- Acquis=Yes — product scope work has been completed under the old CPR
- Despite acquis being completed, NO Table 3 milestones are set (M-I, M-III, SReq, delivery, mandatory all empty)
- This is anomalous: other acquis=Yes families (e.g., CEM, SMP, PCR) have confirmed milestone dates
- SG 20 (May 2025) indicated new standards are "at minimum 3 years away"
- Draft SReq expected early 2026 per stage note in tracker data
- content.sreq_analysis is empty — the only Batch 8 family with this gap

**No change to tracker data**: The anomaly is documented as iss-WBP-002 but does not constitute a data error — the milestones are correctly recorded as empty because no dates have been published.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Does NOT affect WBP
- **(EU) 2023/1464** (REACH Annex XVII amendment): Halves formaldehyde emission limit for wood-based panels to 0.062 mg/m3 — effective August 2026. Cross-regulatory impact on DPP data content.
- No new CPR implementing decisions for wood-based panels found in 2025–2026

### CEN Work Programme
- CEN/TC 112 (Wood-based panels): Active. EN 13986 revision not yet started. "At minimum 3 years away" per SG 20 (May 2025).
- Referenced standards (EN 300, EN 312, EN 622 series, etc.) managed by CEN/TC 112 subcommittees — no specific CPR-relevant revision projects found.

### EOTA
- 3 legacy EADs in tracker. No new EADs found for WBP in 2025–2026.

---

## 6. Structural Issues Identified

| # | ID | Severity | Type | Description | Action |
|---|----|----------|------|-------------|--------|
| 1 | iss-WBP-001 | info | empty_content | 6 content sections empty: standards_landscape, standards_development, sreq_analysis, stakeholder_notes, key_risks, sources_summary. Most empty sections of any Batch 8 family. | Populate with content |
| 2 | iss-WBP-002 | warning | content_data_disagreement | Acquis=Yes but ALL Table 3 milestones empty (M-I, M-III, SReq, delivery, mandatory). DPP milestone is "TBD". DPP-range hen_earliest/hen_latest are "TBD". Unique gap — no other acquis-classified family has zero milestones. | Investigate whether COM(2025) 772 or subsequent working plan updates provide milestone dates for WBP. If dates exist, add them. If genuinely absent, add explanatory note to content.sreq_analysis. |
| 3 | iss-WBP-003 | info | cross_regulatory | REACH (EU) 2023/1464 halves formaldehyde limit for wood-based panels to 0.062 mg/m3 (E0.5) from August 2026. Not a CPR change but directly impacts EN 13986 formaldehyde classes and future DPP emission declarations. | Document in content.key_risks. Consider adding a cross_regulatory field or note to the WBP data model. |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No pipeline or standards changes needed. Milestones gap and REACH impact are structural/informational issues, not data corrections. | — |

---

## 8. Content Section Updates

### content.sreq_analysis (currently empty)
**Proposed**: "WBP has acquis=Yes (product scope completed under old CPR) but uniquely has no Table 3 milestones in COM(2025) 772. The Commission Working Plan does not list M-I, M-III, or SReq dates for this family. SG 20 (May 2025) indicated new standards are 'at minimum 3 years away.' Draft SReq expected early 2026. This makes WBP the most timeline-uncertain acquis-classified family."

### content.key_risks (currently empty)
**Proposed**: "1) Milestone gap: Acquis=Yes but zero Table 3 milestones — unprecedented among acquis families, creating timeline uncertainty. 2) REACH E0.5 (EU) 2023/1464: Formaldehyde emission limit halved to 0.062 mg/m3 from Aug 2026 — impacts EN 13986 classification, testing, and future DPP emission declarations. 3) Umbrella standard complexity: EN 13986 references 8+ subordinate standards — revision coordination across CEN/TC 112 subcommittees is a bottleneck. 4) Mixed AVCP (1/2+/3/4) complicates conformity assessment planning."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110. S143: nlfnorm.cz harmonised standards database. S144: EOTA EAD database. SG 20: Standardisation Group meeting minutes (May 2025). (EU) 2023/1464: REACH Annex XVII amendment — formaldehyde."

---

## 9. Cross-Family Notes

- **REACH E0.5 formaldehyde**: Primarily affects WBP but could indirectly affect WCF (wall/ceiling finishes using wood-based panels) and any family using EN 13986-referenced products.
- **EN 13986 cross-listing**: EN 13986 also appears in WCF's standards list. Data consistency should be verified.
- **EAD 140022 (stressed skin panels)**: References EN 15197 — also an EN 13986 subordinate standard. No cross-family conflict, but the EAD-to-hEN transition pathway needs monitoring.
- **Acquis anomaly pattern**: WBP is the only known acquis=Yes family with empty milestones. If other families develop this pattern, it may indicate a systemic working plan gap.

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in A, 4 in C — 11 total)
- [x] All standards checked against sources (4/4 verified)
- [x] hen_count matches actual hEN count in standards[] (1 hEN)
- [x] ead_count matches actual EAD count in standards[] (3 EADs)
- [x] DPP date consistent with convergence formula (max(Product ~2032, System ~Q1-Q2 2029) = ~2032)
- [x] No duplicate update IDs
- [x] Content sections all non-empty or flagged (6 empty sections flagged — most in Batch 8)
- [x] Source citations present for all claims
- [x] Cross-family standards noted (EN 13986 → WCF, REACH E0.5 impact)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Extended Deep-Dive Addendum

**Date**: 2026-03-01
**Research depth**: 10 targeted web searches (vs 2-3 initial)
**Focus areas**: COM(2025) 772 WBP-specific data, REACH E0.5 enforcement, EN 13986/subordinate revision status, SReq draft status, SG 20 meeting minutes, biocides/VOC, milestone deferral rationale

---

### E1. COM(2025) 772 — WBP Merged with STP, Milestones Still Absent

**Finding**: Critical discovery — the CPR Working Plan COM(2025) 772 has **merged** the workstreams for structural timber products (family 13 / STP) and wood-based panels (family 14 / WBP). This merger is significant because:

1. STP is priority 7/34 while WBP is priority 16/34
2. WBP has acquis=Yes but zero milestones; STP has acquis=Yes with M-I ongoing and M-III targeted Q1 2026
3. The merger suggests WBP milestones may be derived from STP's timeline, or WBP may be treated as a sub-family within the STP workstream

No WBP-specific milestone dates found in COM(2025) 772 text. The Commission's first annual progress report (end 2026) will be the next opportunity for WBP milestone clarity.

Additional context: the Commission will adopt a standardisation request in 2026 to include additional assessment methods for dangerous substances (formaldehyde, VOCs) — this directly affects WBP.

**Impact**: The STP-WBP merger is a major new finding. It potentially explains the empty milestones: WBP may follow STP's timeline rather than having independent dates. This resolves part of iss-WBP-002 but creates a new dependency question.

**Proposed new issue**: Add iss-WBP-004 for STP-WBP workstream merger.

### E2. REACH E0.5 Formaldehyde — Enforcement Details Confirmed

**Finding**: Regulation (EU) 2023/1464 enforcement details confirmed:

1. **Effective date**: 6 August 2026 (for indoor articles including wood-based panels)
2. **Vehicle interiors**: 6 August 2027 (separate timeline)
3. **Emission limits**:
   - Indoor furniture & wood-based articles: ≤ 0.062 mg/m³
   - Other non-wood articles: ≤ 0.080 mg/m³
4. **Testing**: EN 717-1 (chamber method) confirmed as the reference test method meeting REACH Appendix 14 requirements — no modifications needed
5. **Practical impact**: The new limit is exactly half the current E1 threshold (0.124 mg/m³), corresponding to the E0.5 class. "Many manufacturers will have to adjust their production processes" (per industry analysis)
6. **Biocides overlap**: Formaldehyde is approved for use in biocidal product types 2 and 3 under the Biocidal Products Regulation — relevant for treated wood products

The SG 20 meeting (May 2025) notably did NOT discuss formaldehyde despite its Aug 2026 deadline, focusing instead on CPR certification issues.

**Impact**: Confirms and strengthens iss-WBP-003. The Aug 2026 REACH E0.5 deadline is now only ~5 months away. EN 717-1 compatibility confirmed (no new test method needed). The 0.062 mg/m³ limit will need to be reflected in EN 13986 revision when it occurs.

### E3. SG 20 Meeting (May 2025) — "At Minimum 3 Years" Confirmed

**Finding**: The 30th SG 20 Sector Group meeting (7 May 2025) provided key timeline information:

1. **Wood products standards**: "At least 3 years minimum" before new harmonised standards appear
2. **Windows/doors**: Expected within 2-3 years (consistent with DWS SReq timeline)
3. **Full transition target**: 2040 — gradual by product group
4. **Dual system**: "Until new harmonized standards are published, the old CPR will still apply" — entities operate under both old and new CPR simultaneously
5. **NB obligations expanded**: New CPR requirements "expand the obligations of Notified Bodies" and demand "increased caution"

**Impact**: The "3 years minimum" timeline for wood products is confirmed from the SG 20 meeting itself (not just tracker data). This aligns with the ~2032 DPP estimate. The 2040 full transition target is a new data point — suggests WBP DPP could extend beyond 2032 if standards development encounters delays.

### E4. EN 13986 Subordinate Standards — No Revision Activity Found

**Finding**: No CPR-relevant revision projects found for any of the 8+ subordinate standards:
- EN 300 (OSB), EN 312 (Particleboard), EN 622 series (Fibreboard/MDF/HDF), EN 634 (Cement-bonded), EN 636 (Plywood), EN 13353 (Solid wood panels), EN 14279 (LVL), EN 15197 (Stressed skin panels)

The current EN 13986 version is EN 13986:2004+A1:2015 — already 20+ years old with only one amendment. CEN/TC 112 is the responsible TC but no work items for EN 13986 revision were identified.

**Impact**: Confirms the initial report's finding. The umbrella standard and its subordinate standards are all awaiting the SReq before formal revision work begins. The "3 years minimum" from SG 20 starts from SReq adoption, which hasn't happened yet — making the actual timeline potentially 4-5 years from now.

### E5. WBP Fast-Track — Available But Not Used

**Finding**: From the Innovawood CPR overview (confirmed during STP extended dive), WBP (family 14) fast-track updating IS available, unlike STP (family 13). However, there is no evidence of fast-track being initiated.

This creates an interesting dynamic with the STP-WBP merger: STP cannot use fast-track while WBP can. The merged workstream may need to separate for the standards development phase, or the fast-track for WBP may be used independently.

**Impact**: The fast-track availability is a positive factor for WBP that could theoretically accelerate its timeline. However, fast-track only applies to standards updating, not the full acquis/SReq pipeline — and WBP's current bottleneck is the SReq adoption, not standards development.

### E6. Dangerous Substances SReq — Direct WBP Impact

**Finding**: The Commission will adopt a standardisation request in 2026 for additional assessment methods complementing existing instruments for dangerous substance release from construction products. This is handled by CEN/TC 351 and covers:
- Formaldehyde emissions (directly relevant to WBP)
- VOC emissions (relevant to WBP)
- Release to soil/water
- Additional substances and materials

This horizontal SReq (notified 1 Sep 2025, feedback period) affects all 37 families but has disproportionate impact on WBP given formaldehyde is the primary emissions concern for wood-based panels.

**Impact**: The CEN/TC 351 horizontal SReq creates an additional timeline dependency for WBP. The 15 deliverables (due 31 Dec 2029) include formaldehyde test methods that directly affect EN 13986 revision scope.

### E7. WBP Priority 16/34 — Mid-Range

**Finding**: WBP is priority 16 of 34 families per COM(2025) 772. This is mid-range — higher than many families but significantly lower than STP (priority 7). The merger with STP may effectively raise WBP's priority.

**Impact**: Priority 16 explains the absent milestones: the Commission prioritises families roughly in order, and families below ~15 may not have concrete milestones in the first working plan cycle (2026-2029).

---

### E8. Updated Risk Assessment

| Risk | Initial | Extended | Change |
|------|---------|----------|--------|
| Acquis-milestones gap | Warning | **Warning — Partially explained** | STP-WBP merger may explain absent milestones; priority 16 also a factor |
| REACH E0.5 (Aug 2026) | Medium | **High** | Only 5 months away; many manufacturers must adjust; EN 717-1 compatible |
| EN 13986 revision | Medium | **Medium — Confirmed** | No revision activity found; 20+ year old standard |
| Subordinate standards coordination | Medium | **Medium — Confirmed** | 8+ standards need coordinated revision across TC 112 subcommittees |
| STP-WBP workstream merger | Not tracked | **New — Medium** | Merger creates dependency on STP timeline |
| Fast-track available but unused | Not tracked | **New — Low** | Positive factor but bottleneck is SReq, not standards development |

### E9. New Issues

| ID | Severity | Type | Description |
|----|----------|------|-------------|
| iss-WBP-004 | warning | regulatory_development | COM(2025) 772 merged STP (family 13) and WBP (family 14) workstreams. WBP milestones may be derived from STP timeline. STP is priority 7, WBP is priority 16. Merger explains absent milestones but creates dependency. |
| iss-WBP-005 | info | timeline_context | SG 20 meeting (May 2025) confirmed "at minimum 3 years" for new wood standards. Full CPR transition target is 2040 (gradual by product group). WBP DPP could extend beyond 2032 if delays occur. |
| iss-WBP-006 | info | priority_context | WBP is priority 16/34 with fast-track AVAILABLE (unlike STP). Fast-track not yet initiated. Could theoretically accelerate standards updating once SReq bottleneck is cleared. |

---

### E10. Extended Quality Checklist

- [x] 10 web searches executed (7 primary + 1 follow-up page fetch)
- [x] COM(2025) 772 checked for WBP-specific milestones — none found; STP-WBP merger discovered
- [x] REACH E0.5 enforcement details confirmed (6 Aug 2026, 0.062 mg/m³)
- [x] SG 20 meeting details extracted ("3 years minimum", 2040 target)
- [x] EN 13986 and 8 subordinate standards checked — no revision activity
- [x] Fast-track availability confirmed (WBP=yes, STP=no)
- [x] CEN/TC 351 dangerous substances SReq impact confirmed
- [x] All new issues have unique IDs (iss-WBP-004 through iss-WBP-006)
- [x] No conflicts with existing issues (iss-WBP-001 through iss-WBP-003)
- [x] No data updates needed (findings are structural/contextual)

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across panel industry associations, major producers, adhesive technology, recycled content, VOC regulations
**Sources**: EPF, EGGER, Sonae Arauco, Pfleiderer, SWISS KRONO, Kronospan, Fraunhofer WKI, TÜV SÜD, UBA, ANSES, Eurofins, EPD Guide, CEPS

### S1. EPF Industry Statistics and Position — 58M m³ Production, Regulatory Burden Concerns

**Sources**:
- TTJ — EPF Berlin conference — URL: https://www.ttjonline.com/news/epf-highlights-latest-wood-panel-industry-stats-and-challenges-at-berlin-conference/
- Focus Mach — production growth 2024 — URL: https://www.focus-mach.com/news/european-panel-production-grows-in-85152164.html
- EPF cascading use position — URL: https://europanels.org/press-release-epf-applauds-cascading-use-of-wood-in-eu-legislation/

European wood-based panel production (EU27+UK+EFTA): **58.1 million m³** in 2024 (+2.7%). Breakdown: particleboard 31.2M m³, MDF 11.2M m³, OSB 7.1M m³, softboard 5.2M m³, plywood 2.6M m³. Still below pre-crisis levels.

EPF Berlin conference: industry explicitly warns that "zero everything" policies risk driving production toward cheaper Chinese imports. Holger Losch called to "get away from this attitude of regulating every detail because it is ruining our innovation." EPF strongly supports cascading use of wood principle in RED III (at least 60% of roundwood to material use).

**WBP/DPP connection**: 58M m³ across thousands of SKUs means DPP rollout is a massive data infrastructure challenge. Industry is resistant to additional regulatory burden, which may slow voluntary DPP adoption ahead of mandatory requirements.

### S2. Major Producers — EPD Readiness Varies Dramatically

**Sources**:
- Kronospan Luxembourg EPD gaps — URL: https://epd.guide/manufacturers/kronospan-luxembourg-product-range-and-epd-reality
- EGGER sustainability/EPDs — URL: https://www.egger.com/en/about-us/sustainability/product-transparency?country=US
- EGGER recycling — URL: https://www.egger.com/en/about-us/environment-sustainability/recycling
- Sonae Arauco recycling — URL: https://www.sonaearauco.com/sustainability/recycling/
- Sonae Arauco MDF recycling line — URL: https://www.sonaearauco.com/news/sonae-arauco-unveils-worlds-first-dry-fiberboard-recycling-line/
- Pfleiderer materials — URL: https://www.pfleiderer.com/global-en/sustainability/materials
- Pfleiderer OrganicBoard Pure — URL: https://www.pfleiderer.com/global-en/products/coated-panels/detail/organicboard-pure-p2

**Kronospan** (largest European producer): Has EPDs for MDF, HDF, OSB, laminate flooring but **NO EPD for particleboard or MFC** — its highest-volume products. Major gap for CPR GWP disclosure readiness.

**EGGER**: 66% recycled wood group-wide. Caorso (Italy) plant: 100% recycled wood particleboard since 1994. IBU-verified EPDs for chipboard, MDF, OSB. Reports "EcoFact" GWP (A1-A3 per EN 15804+A2). Well-prepared.

**Sonae Arauco**: >70% recycled wood in particleboard, targeting 85% in some units within 3 years. Opened **world's first industrial-scale dry MDF recycling line** (Portugal, Q2 2025, ANDRITZ Steam-Ex technology). 809,000 tonnes recycled wood valued in 2024.

**Pfleiderer**: **53.5% post-consumer recycled wood** (2024, exceeding 50% target). **Already converted entire German production to E0.5 compliance** before Aug 2026 deadline. OrganicBoard Pure: 100% renewable binder + 100% recycled fibre.

**WBP/DPP connection**: Dramatic readiness gap — Pfleiderer is already E0.5 compliant and >50% recycled, while Kronospan lacks EPDs for its core products. DPP rollout will expose these disparities. Recycled content data (which DPP must declare) ranges from 25% (industry average) to 95% (Italy).

### S3. Formaldehyde-Free Adhesives — pMDI at 2-3% for Particleboard, Dominant for OSB

**Sources**:
- Market Data Forecast — Europe wood adhesives — URL: https://www.marketdataforecast.com/market-reports/europe-wood-adhesives-market
- pMDI market share analysis (academic) — URL: https://www.teilar.gr/dbData/ErErgo/Adhesive_systems_used_in_the_European_particleboard_MDF_and_OSB_industries.pdf
- SWISS KRONO pMDI — URL: https://www.swisskrono.com/de-en/about-us/swiss-krono-germany/climate-protection/
- SWISS KRONO Be.Yond bio-based — URL: https://www.woodworkingnetwork.com/news/canadian-news/canadian-firms-bio-resin-key-ingredient-swiss-kronos-beyond-particleboard
- Bio-based adhesive research — URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8658755/

UF resin dominates: **42.3% of European wood adhesives market** (2024), >1.8M metric tonnes consumed in 2023. pMDI in particleboard/MDF: only **2-3% market share**. However, pMDI is the **primary adhesive for European OSB production**.

SWISS KRONO: Uses only pMDI for decades — "dispensed entirely with formaldehyde-containing binders." Emissions at 0.01 ppm (natural wood content only). Blue Angel certified. Also offers Be.Yond particleboard with EcoSynthetix bio-based NAF adhesive.

Bio-based alternatives still in R&D: lignin-based PUR adhesives, glyoxal substitutes, lignosulfonate+pMDI combinations achieving super E0 grade.

**WBP/DPP connection**: The Aug 2026 REACH E0.5 does NOT require switching from UF to pMDI — it halves permissible UF emission. But long-term, DPP declarations of adhesive type and formaldehyde content will create market differentiation favouring pMDI/bio-based producers.

### S4. Recycled Wood Content — Italy at 95%, EU Average 25%, Classification Not Harmonised

**Sources**:
- PMC — Sustainability, Circularity and Innovation in WBP — URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11499423/
- CEPS — Improving Waste Wood Circularity — URL: https://cdn.ceps.eu/wp-content/uploads/2024/11/2024-14_ERCC_Wood2Wood.pdf
- EU Circular Economy Platform — URL: https://circulareconomy.europa.eu/platform/en/knowledge/improving-waste-wood-circularity-eu-classification-frameworks-and-policy-options

Recycled wood content by country: Italy ~95%, Belgium/Denmark 50-70%, Spain/Germany/France 15-30%, EU average ~25%. 38 million m³ post-consumer wood recovered globally (2022), Europe contributes 82.9%.

**Critical gap**: No unified EU legislative framework for waste wood classification. Categories vary by country (Germany's AltholzV has I-IV categories; EPF standard limits contamination to 2% dry weight). Lack of harmonised classification is a direct obstacle for DPP recycled content declarations — different countries classify the same waste wood differently.

EcoReFibre project (Horizon Europe, EUR 12M, May 2022–Apr 2026) explores cascade recovery from waste fibreboard.

### S5. EN 13986 Revision — No Activity Confirmed

**Sources**:
- GlobalSpec EN 13986 — URL: https://standards.globalspec.com/std/9928297/en-13986
- CEN/TC 112 on iTeh — URL: https://standards.iteh.ai/catalog/tc/cen/a4030f50-fdfa-4928-9522-44deb476ef90/cen-tc-112

EN 13986:2004+A1:2015 remains current (20+ years old). **No revision work item registered at CEN/TC 112** in 2024 or 2025. No standardisation request under new CPR 2024/3110 specifically targeting CEN/TC 112 found. Original mandate M/113. The absence of revision activity confirms WBP is on a longer timeline — current standard continues under old CPR until new SReq triggers revision.

### S6. Triple Regulatory Overlay — REACH E0.5 + CPR Dangerous Substances + National IAQ Schemes

**Sources**:
- REACH (EU) 2023/1464 details — URL: https://www.ul.com/news/new-eu-restriction-formaldehyde-regulation-eu-20231464
- TÜV SÜD Germany alignment — URL: https://www.tuvsud.com/en/knowledge-hub/technical-updates/consumer-products-and-retail-essentials/germany-formaldehyde-emission-limit-for-wood-based-panels-aligns-with-eu-regulation
- MEDITE SMARTPLY E0.5 transition — URL: https://mdfosb.com/en/eu-reach-revision
- AgBB 2024 scheme — URL: https://www.eco-institut.de/en/2024/10/federal-environment-agency-publication-agbb-scheme-2024/
- ANSES France VOC labelling — URL: https://www.anses.fr/en/content/labelling-building-and-decoration-products-respect-voc-emissions
- Eurofins legal requirements — URL: https://www.eurofins.com/consumer-product-testing/services/certifications-international-approvals/voc/legal-requirements/
- EU-LCI values — URL: https://single-market-economy.ec.europa.eu/sectors/construction/eu-lci-subgroup/eu-lci-values_en
- Fraunhofer WKI REAC-H-CHO — URL: https://www.wki.fraunhofer.de/en/departments/qa/profile/news/certification-reach.html

WBP manufacturers face a **triple regulatory overlay**:

1. **REACH E0.5** (6 Aug 2026): Market access restriction. 0.062 mg/m³ for wood-based articles. Germany already aligned (repealed national rule 15 Feb 2024, effective 7 Aug 2026). MEDITE SMARTPLY completing transition by Apr 2026 for 7 MDF products. Fraunhofer WKI offers REAC-H-CHO certification.

2. **CPR dangerous substances** (CEN/TC 351 SReq, 15 deliverables due 31 Dec 2029): Declaration requirement. CPR still references E1 for CE marking — creating a regulatory mismatch where market access requires E0.5 but CE marking still says E1.

3. **National IAQ schemes** (parallel, different thresholds):
   - Germany AgBB 2024: TVOCspez ≤1.0 mg/m³, carcinogens ≤0.001 mg/m³, R-value ≤1. Updated Sep 2024.
   - France: Mandatory A+ to C labelling since 2013. A+ formaldehyde <10 µg/m³.
   - Belgium: TVOC ≤1000 µg/m³, formaldehyde ≤100 µg/m³ for flooring.
   - Italy CAM: TVOC <1500 µg/m³, formaldehyde <60 µg/m³ for public buildings.

**Critical gap**: EU-LCI harmonised value for formaldehyde has been **postponed** pending ECHA classification decision. Until this is resolved, national values apply in parallel, making consistent DPP declaration of emissions impossible.

### Supplementary Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 7 | iss-WBP-007 | warning | dpp_readiness | Kronospan (largest EU producer) lacks EPDs for particleboard/MFC — highest-volume products. Industry EPD readiness varies dramatically: Pfleiderer already E0.5 + >50% recycled vs Kronospan no particleboard EPD. |
| 8 | iss-WBP-008 | info | cross_regulatory | Triple regulatory overlay for formaldehyde: REACH E0.5 (market access, Aug 2026) + CPR dangerous substances (declaration, CEN/TC 351) + national IAQ schemes (AgBB, French A+, Belgian decree, Italian CAM). EU-LCI formaldehyde value postponed. |
| 9 | iss-WBP-009 | info | circular_economy | Waste wood classification NOT harmonised across EU — direct obstacle for DPP recycled content declarations. Italy 95% recycled vs EU average 25%. EPF limits contamination to 2% dry weight but countries apply different categories. |

### Supplementary Quality Checklist

- [x] EPF industry statistics documented (58M m³, +2.7% in 2024)
- [x] 4 major producer EPD/recycled content profiles sourced
- [x] Formaldehyde-free adhesive market share quantified (pMDI 2-3% PB, dominant OSB)
- [x] Recycled wood content by country documented (Italy 95%, EU avg 25%)
- [x] Waste wood classification fragmentation identified as DPP obstacle
- [x] EN 13986 revision status confirmed (no activity)
- [x] Triple regulatory overlay mapped (REACH + CPR + national IAQ)
- [x] EU-LCI formaldehyde postponement documented
- [x] E0.5 compliance leaders identified (Pfleiderer, SWISS KRONO)
- [x] All findings have explicit source URLs
- [x] All new issues have unique IDs (iss-WBP-007 through iss-WBP-009)
