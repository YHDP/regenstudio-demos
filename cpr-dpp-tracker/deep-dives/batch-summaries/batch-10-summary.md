# Batch 10 Summary — Trailing (Sparse Data)

**Completed**: 2026-03-01
**Families**: CAB, DWP, DPW (3 families)
**Total standards reviewed**: 1 (1 hEN + 0 EADs)

---

## Overview

Batch 10 covers the three sparsest families in the tracker. CAB has just 1 standard, while DWP and DPW have zero each. These families sit at the tail end of the CPR timeline — DPP estimates range from ~2033–2034 (CAB) to 2035+ (DPW) to TBD (DWP). All three are Pipeline A only (no EADs, no Pipeline C). Despite the minimal data, each family has distinctive characteristics worth documenting.

## Key Findings

### 1. CAB — Only CENELEC Family
CAB is unique as the only CPR family standardised by CENELEC rather than CEN. EN 50575:2014+A1:2016 is a CENELEC standard under CLC/TC 20. Future SReq would be issued to CENELEC, not CEN. The family covers reaction to fire only (Euroclass Aca–Fca), with mandatory CE marking since July 2017. M-I and M-III both targeted 2029 — the joint-latest start of all 37 families (shared with DPW's M-I).

### 2. DWP — CPR vs DWD Jurisdiction Uncertainty
DWP is the most sparse family (0 standards, no TC, all fields TBD) but has the most significant cross-regulatory situation. The EU Drinking Water Directive (DWD) 2020/2184 has already adopted its own material approval framework — Delegated Regulation (EU) 2024/371 (marking) and Implementing Decision (EU) 2024/367 (positive lists). Whether construction products in contact with drinking water will be regulated under CPR, DWD, or both remains unresolved. Art. 11 DWD requires coherence with CPR but the practical implementation is unclear.

### 3. DPW — Most Distant DPP (2035+)
DPW (Decorative Paints and Wallpapers) has the most distant DPP horizon of all 37 families. It is a new family created by CPR 2024/3110 with no existing acquis, no harmonised standards, and no family number in Annex VII. The VOC emissions landscape is already regulated under the Decopaint Directive 2004/42/EC and national indoor air quality schemes, adding cross-regulatory complexity.

### 4. Two Null standards_summary Fields
Both DWP and DPW have `standards_summary: null` — the only families in the tracker with null rather than an object value. This is a minor data consistency issue.

---

## Statistics

| Family | hENs | EADs | Total | Pipeline(s) | Updates | Issues | Quality |
|--------|------|------|-------|-------------|---------|--------|---------|
| CAB | 1 | 0 | 1 | A | 0 | 1 | PASS |
| DWP | 0 | 0 | 0 | A | 0 | 3 | PASS |
| DPW | 0 | 0 | 0 | A | 0 | 2 | PASS |
| **Total** | **1** | **0** | **1** | — | **0** | **6** | **3/3 PASS** |

---

## Issues Summary

| ID | Family | Severity | Type | Description |
|----|--------|----------|------|-------------|
| iss-CAB-001 | CAB | info | empty_content | 4 empty content sections |
| iss-DWP-001 | DWP | warning | empty_content | 6 empty content sections (most of any family) |
| iss-DWP-002 | DWP | warning | content_data_disagreement | standards_summary is null |
| iss-DWP-003 | DWP | info | cross_regulatory | DWD 2020/2184 parallel framework |
| iss-DPW-001 | DPW | info | empty_content | 4 empty content sections |
| iss-DPW-002 | DPW | info | content_data_disagreement | standards_summary null, family number empty |

---

## Cross-Batch Patterns

1. **Empty content sections**: Confirmed across all 37 families. `key_risks` and `sources_summary` are systematically empty in every family.
2. **Null standards_summary**: DWP and DPW are the only two families with `null` rather than an object. All other 35 families have structured values.
3. **New family pattern**: DPW (like LAD in Batch 9) is a new CPR 2024/3110 family — no Annex VII number, no existing acquis, no harmonised standards. Three such new families exist (LAD #36, DPW unnumbered, plus some within KAS scope).
4. **Cross-regulatory**: Three distinct cross-regulatory frameworks have been identified across the 37 families: REACH formaldehyde (WBP), DWD 2020/2184 (DWP), Decopaint Directive 2004/42/EC (DPW). Plus EUDR for STP timber.
5. **CENELEC uniqueness**: CAB is the sole CENELEC-standardised family. All other 36 families are CEN.

---

## Quality Gate

- [x] All 3 families have report files
- [x] All 3 families have review-queue JSON files
- [x] All reports end with completed Quality Checklist
- [x] Standards counts verified (hEN + EAD match actuals)
- [x] DPP dates consistent with convergence formula
- [x] No duplicate update IDs across batch
- [x] Review-queue JSONs are valid
- [x] Cross-family standards consistent within batch (no cross-family standards in Batch 10)

**Batch 10: COMPLETE** (3/3 families, 0 updates, 6 issues)

---

## Project Completion Note

With Batch 10 complete, all **37 families** across all **10 batches** have been reviewed. The final step is merging all 37 review-queue JSON fragments into `review-queue-merged.json`.
