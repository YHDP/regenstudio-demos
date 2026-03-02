# Batch 8 Summary — Panels & Membranes

**Completed**: 2026-03-01
**Families**: WWD, WBP, MEM, GEO (4 families)
**Total standards reviewed**: 30 (27 hENs + 3 EADs)

---

## Overview

Batch 8 covers four material-focused families with self-contained TC portfolios. Three of four (WWD, MEM, GEO) are straightforward hEN-only families with no EADs, no cross-family standards, and no significant regulatory changes in 2025–2026. WBP stands out with a unique structural anomaly and cross-regulatory impact.

## Key Findings

### 1. WBP Acquis-Milestones Gap (Unique)
WBP is the only family in the entire tracker with `acquis=Yes` but ALL Table 3 milestones empty. Every other acquis-classified family (CEM, SMP, PCR, DWS, CWP, STP, RPS) has confirmed milestone dates. This suggests WBP's product scope work was completed under the old CPR but the Commission Working Plan deliberately deferred timeline assignment — possibly because SG 20 (May 2025) confirmed new standards are "at minimum 3 years away."

### 2. REACH E0.5 Formaldehyde (WBP)
Commission Regulation (EU) 2023/1464 halves the formaldehyde emission limit for wood-based panels from 0.124 mg/m³ to 0.062 mg/m³ (E0.5 class), effective **August 2026**. While not a CPR change, this directly impacts EN 13986 formaldehyde classification and will affect future DPP emission declarations. First cross-regulatory impact flagged in the deep-dive series.

### 3. Uniform AVCP Pattern
GEO sets a record: all 10 hENs are AVCP System 2+, making it the most uniformly assessed family reviewed so far. MEM and WWD show mixed AVCP (2+/3/4), while WBP has the widest range (1/2+/3/4) due to its umbrella standard structure.

### 4. Self-Contained TC Portfolios
All four families have single, dedicated TCs with no cross-family TC sharing:
- WWD: CEN/TC 165 (Wastewater engineering)
- WBP: CEN/TC 112 (Wood-based panels)
- MEM: CEN/TC 254 (Flexible sheets for waterproofing)
- GEO: CEN/TC 189 (Geosynthetics)

This makes Batch 8 the most TC-independent batch so far — no cross-family TC dependencies.

### 5. EN 13986 Cross-Listing (WBP ↔ STP)
EN 13986 appears in both WBP and STP standards lists. This is the only cross-family standard in Batch 8. Data consistency between the two family entries should be verified when STP is reviewed in Batch 9.

---

## Statistics

| Family | hENs | EADs | Total | Pipeline(s) | Updates | Issues | Quality |
|--------|------|------|-------|-------------|---------|--------|---------|
| WWD | 8 | 0 | 8 | A | 0 | 1 | PASS |
| WBP | 1 | 3 | 4 | A, C | 0 | 3 | PASS |
| MEM | 8 | 0 | 8 | A | 0 | 1 | PASS |
| GEO | 10 | 0 | 10 | A | 0 | 1 | PASS |
| **Total** | **27** | **3** | **30** | — | **0** | **6** | **4/4 PASS** |

---

## Issues Summary

| ID | Family | Severity | Type | Description |
|----|--------|----------|------|-------------|
| iss-WWD-001 | WWD | info | empty_content | 5 empty content sections |
| iss-WBP-001 | WBP | info | empty_content | 6 empty content sections (most in batch) |
| iss-WBP-002 | WBP | warning | content_data_disagreement | Acquis=Yes but zero Table 3 milestones — unique gap |
| iss-WBP-003 | WBP | info | cross_regulatory | REACH E0.5 formaldehyde (EU) 2023/1464 impacts EN 13986 |
| iss-MEM-001 | MEM | info | empty_content | 5 empty content sections |
| iss-GEO-001 | GEO | info | empty_content | 5 empty content sections |

---

## Cross-Batch Patterns

1. **Empty content sections**: Systematic across all 31 families reviewed so far. `key_risks` and `sources_summary` are empty in every family.
2. **EAD 042461 resolved**: Confirmed as PA 04 (TIP) not PA 08 (GEO). No data impact.
3. **EN 13986 cross-listing**: WBP ↔ STP. To verify in Batch 9.
4. **REACH cross-regulatory**: First non-CPR regulation flagged as impacting DPP content. WBP is the first family where chemical safety regulation (REACH) intersects with CPR product standards.

---

## Resolved Cross-Family Flags

| Flag | Status | Resolution |
|------|--------|------------|
| EAD 042461 (TIP ↔ GEO) | Resolved | PA 04 (TIP), not GEO |
| EN 13986 (WBP ↔ STP) | Pending | To verify in Batch 9 |

---

## Quality Gate

- [x] All 4 families have report files
- [x] All 4 families have review-queue JSON files
- [x] All reports end with completed Quality Checklist
- [x] Standards counts verified (hEN + EAD match actuals)
- [x] DPP dates consistent with convergence formula
- [x] No duplicate update IDs across batch
- [x] Review-queue JSONs are valid
- [x] Cross-family standards consistent within batch

**Batch 8: COMPLETE** (4/4 families, 0 updates, 6 issues)
