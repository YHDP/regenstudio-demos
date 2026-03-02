# Batch 9 Summary — Curtain/Wood/Ladders

**Completed**: 2026-03-01
**Families**: CWP, LAD, STP (3 families)
**Total standards reviewed**: 79 (13 hENs + 66 EADs)

---

## Overview

Batch 9 is defined by scale and structural complexity. STP is the largest family in the entire tracker (50 standards), CWP has the 3rd-largest EAD portfolio (25), and LAD is a new family created by CPR 2024/3110 with no independent milestones. Two of three families have acquis=Yes and are among the most regulatory-advanced in the tracker. The 66 EADs across CWP and STP represent the largest combined EAD volume of any batch.

## Key Findings

### 1. STP — Largest Family (50 Standards)
With 9 hENs and 41 EADs, STP is the most complex family in the CPR framework. Its EAD portfolio covers the most innovative product categories (bamboo structural, CFRP-reinforced glulam, adhesive-free CLT, timber-glass composites, post-tensioned timber frames). At the EOTA publication rate of 20-30 EADs/year, STP alone would consume 1.5-2 years of EOTA capacity. The widest DPP range in the tracker (~2029–2033) reflects genuine uncertainty.

### 2. STP M-III May Be Stale
STP's Milestone III was targeted for Q1 2026 per COM(2025) 772. It is now March 2026 — M-III may have started or been completed. The "not_started" status may be outdated. This mirrors the RPS NT-3 staleness flag from Batch 7.

### 3. LAD — New Family Without Independent Timeline
LAD (family 36) is one of the new product families created by CPR 2024/3110. Its milestones are handled within KAS (family 34). All milestone and certainty fields are empty/gray. The 3 hENs (EN 12951, EN 516, EN 517) are currently classified under ROC (family 22) — they would be reclassified to LAD under the new CPR. A significant standards gap exists: EN 12951 only covers roof ladders, but family 36 scope includes facade ladders, utility access ladders, and caged maintenance ladders.

### 4. CEN/TC 33 Cross-Family Dependency (CWP ↔ DWS)
CWP and DWS share CEN/TC 33. The DWS draft SReq (Jan 2026) references curtain walling accessories — creating potential scope overlap with CWP's SReq (targeted Q4 2026). This is the most significant cross-family TC dependency in Batch 9.

### 5. EN 13986 Cross-Listing Verified (WBP ↔ STP)
EN 13986 appears in both WBP (Batch 8) and STP (Batch 9). Data consistency verified: AVCP "1, 2+, 3, 4", CEN/TC 112, CPR 2011 revision — all match between families.

### 6. EUDR Cross-Regulatory Impact (STP)
EU Deforestation Regulation enforcement from December 2026 creates parallel supply chain traceability requirements for timber products. The EUDR due diligence data requirements (species, origin, geolocation, legality) overlap with DPP sustainability data — creating potential for data reuse and system interoperability.

### 7. EAD 130089 Potentially Missing (STP)
EAD 130089-01-0304 (structural finger-jointed, wet/cold glued solid timber) was confirmed as recently published by EOTA but may not be in the tracker's 41-EAD count if published after the Feb 2026 data snapshot.

---

## Statistics

| Family | hENs | EADs | Total | Pipeline(s) | Updates | Issues | Quality |
|--------|------|------|-------|-------------|---------|--------|---------|
| CWP | 1 | 25 | 26 | A, C | 0 | 3 | PASS |
| LAD | 3 | 0 | 3 | A | 0 | 3 | PASS |
| STP | 9 | 41 | 50 | A, C | 0 | 4 | PASS |
| **Total** | **13** | **66** | **79** | — | **0** | **10** | **3/3 PASS** |

---

## Issues Summary

| ID | Family | Severity | Type | Description |
|----|--------|----------|------|-------------|
| iss-CWP-001 | CWP | info | empty_content | 4 empty content sections |
| iss-CWP-002 | CWP | info | cross_family | CEN/TC 33 shared with DWS, SReq scope overlap |
| iss-CWP-003 | CWP | info | content_data_disagreement | NT-5 in_progress vs EN 13830 "awaiting SReq" |
| iss-LAD-001 | LAD | info | empty_content | 3 empty content sections |
| iss-LAD-002 | LAD | warning | cross_family | 3 hENs under ROC pending reclassification to LAD |
| iss-LAD-003 | LAD | info | cross_family | LAD milestones dependent on KAS |
| iss-STP-001 | STP | info | empty_content | 3 empty content sections |
| iss-STP-002 | STP | warning | stale_status | NT-3 (M-III) targeted Q1 2026, still not_started |
| iss-STP-003 | STP | info | cross_family | EN 13986 cross-listed with WBP |
| iss-STP-004 | STP | info | missing_standard | EAD 130089 recently published, may be missing |

---

## Cross-Batch Patterns

1. **Empty content sections**: Continues across all 34 families reviewed. `key_risks` and `sources_summary` are systematically empty.
2. **Stale M-III pattern**: STP joins RPS (Batch 7) as families where M-III target dates have passed but status remains "not_started." This may reflect a systemic data lag.
3. **EN 13986 cross-listing resolved**: Data consistent between WBP and STP. No conflict.
4. **EAD transition scale**: Top 4 EAD portfolios now fully reviewed: STP (41), FIX (34), KAS (32), CWP (25). Combined = 132 EADs requiring transition by 9 Jan 2031.
5. **New family pattern**: LAD (family 36) shares characteristics with other new CPR 2024/3110 families — no independent milestones, standards gap for broader scope, dependency on existing families for regulatory pipeline.

---

## Resolved Cross-Family Flags

| Flag | Status | Resolution |
|------|--------|------------|
| EN 13986 (WBP ↔ STP) | Resolved | Data consistent between families. No conflict. |
| CEN/TC 33 (DWS ↔ CWP) | Confirmed | Shared TC. DWS SReq references CWP accessories. Scope overlap documented. |
| KAS ↔ LAD PA 36 | Confirmed | LAD handled within KAS per COM(2025) 772. KAS M-I Q2 2026 imminent. |
| ROC ↔ LAD hENs | Documented | 3 hENs pending reclassification from family 22 to family 36. |

---

## Quality Gate

- [x] All 3 families have report files
- [x] All 3 families have review-queue JSON files
- [x] All reports end with completed Quality Checklist
- [x] Standards counts verified (hEN + EAD match actuals)
- [x] DPP dates consistent with convergence formula
- [x] No duplicate update IDs across batch
- [x] Review-queue JSONs are valid
- [x] Cross-family standards consistent within batch

**Batch 9: COMPLETE** (3/3 families, 0 updates, 10 issues)
