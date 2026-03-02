# Batch 2 Summary — Structural & Fire

**Completed**: 2026-03-01
**Families**: CHI, FFF, FPP
**Total standards reviewed**: 72 (CHI:29, FFF:37, FPP:6)

---

## Results Overview

| Family | Standards | Updates | Issues | Quality Gate |
|--------|----------|---------|--------|-------------|
| CHI | 29 (18 hEN + 11 EAD) | 0 | 3 | PASS |
| FFF | 37 (33 hEN + 4 EAD) | 0 | 4 | PASS |
| FPP | 6 (0 hEN + 6 EAD) | 0 | 3 | PASS |
| **Total** | **72** | **0** | **10** | **3/3 PASS** |

---

## Cross-Batch Findings

### 1. No Data Changes Needed for Batch 2
Unlike Batch 1 (which had 8 data updates for DWS and CEM), Batch 2 families have no pipeline node status changes or data corrections needed. All node statuses accurately reflect the current state.

### 2. Fire Safety Timeline Landscape
| Family | SReq Target | DPP Est | Acquis | Status |
|--------|------------|---------|--------|--------|
| CHI | Q3 2026 | ~2031–2032 | Yes (2026) | M-III ongoing, SReq planned |
| FFF | Q3 2027 | ~2030–2033 | No | Not started |
| FPP | 2029 | ~2030–2032 | No | Not started |

CHI is furthest advanced (acquis complete, M-III ongoing). FFF has the broadest scope (33 hENs, 4 TCs). FPP has the latest SReq target but earliest DPP estimate — a tension driven by the convergence formula and the fact that FPP's policy pipeline estimate (~2030–2031) is earlier than its standards-based estimate (~2032).

### 3. EAD-Only Family Pattern (FPP)
FPP is the first EAD-only family analyzed (0 hENs, 6 EADs). Key finding: the timeline gap between EAD expiry (2031) and SReq (2029) creates a structural regulatory risk. This pattern will recur in Batch 6 (FIX, KAS, SEA, ADH) — all EOTA-dominated families.

### 4. Empty Content Sections Continue
All 3 families have empty `key_risks` and `sources_summary` fields. FFF also has empty `standards_development`. FPP has 5 empty content sections (the most of any family reviewed so far). This confirms the pattern noted in Batch 1.

### 5. EN 54 Citation Backlog (FFF-specific)
The EN 54 citation backlog (6+ parts uncited since ~2014, James Elliott ruling legacy) is a unique structural issue specific to FFF. No other family has this pattern. The new CPR Art. 5(8) mechanism may eventually resolve it, but only after the full SReq cycle.

### 6. CHI Standard Citation Verification Needed
EN 1443 and EN 12391-1 are listed as cited=true in the CHI tracker but were NOT found in the nlfnorm.cz group 6 harmonised standards listing. If confirmed non-harmonised, CHI's hen_count would need adjustment from 18 to 16. This is the only potential count discrepancy found in Batch 2.

### 7. Multi-Regulatory Overlay (FFF)
FFF products uniquely face 6+ regulatory frameworks simultaneously: CPR + EMC (2014/30/EU) + LVD (2014/35/EU) + RoHS (2011/65/EU) + WEEE (2012/19/EU) + Cyber Resilience Act (from Dec 2027). This multi-regulatory exposure is documented in stakeholder_notes but should be cross-referenced when other families with electronic components are analyzed.

### 8. PFAS Regulation Impact (FPP)
EU PFAS restriction may affect fire retardant products (EAD 350865 in FPP). This is a new regulatory dimension not tracked in the current data model. Other families with fire-related or chemical products should be checked.

---

## Action Items for Subsequent Batches

1. **Batch 3 (ROC, WCF, GLA, TIP)**: CEN/TC 127 fire test methods shared with FPP context; check EN 12101-2 coverage
2. **Batch 6 (FIX, KAS, SEA, ADH)**: Cross-reference FPP EAD→hEN transition pattern for EOTA-dominated families
3. **All batches**: Continue checking empty content sections as systematic pattern
4. **All batches with electronic products**: Check multi-regulatory exposure (EMC, LVD, CRA) against FFF pattern
