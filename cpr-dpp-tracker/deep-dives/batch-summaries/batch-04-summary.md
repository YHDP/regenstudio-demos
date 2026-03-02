# Batch 4 Summary — Concrete & Mortar

**Completed**: 2026-03-01
**Families**: CMG, AGG, MAS, GYP
**Total standards reviewed**: 81 (CMG:35, AGG:8, MAS:21, GYP:17)

---

## Results Overview

| Family | Standards | Updates | Issues | Quality Gate |
|--------|----------|---------|--------|-------------|
| CMG | 35 (16 hEN + 19 EAD) | 0 | 2 | PASS |
| AGG | 8 (7 hEN + 1 EAD) | 0 | 2 | PASS |
| MAS | 21 (11 hEN + 10 EAD) | 0 | 3 | PASS |
| GYP | 17 (14 hEN + 3 EAD) | 0 | 1 | PASS |
| **Total** | **81** | **0** | **8** | **4/4 PASS** |

---

## Cross-Batch Findings

### 1. No Data Changes Needed for Batch 4
Like Batches 2 and 3, no pipeline node status changes are needed. All pipeline nodes accurately reflect current state. Three consecutive batches without data changes confirms that tracker data quality is high for families with distant SReq timelines.

### 2. Concrete & Mortar Timeline Landscape
| Family | TC | Acquis | SReq Target | DPP Est |
|--------|-----|--------|------------|---------|
| CMG | TC 104 | Yes (ongoing) | Q4 2026 | ~2030–2033 |
| AGG | TC 154 | Yes (ongoing) | Q1 2027 | ~2030–2032 |
| MAS | TC 125 | Yes (ongoing) | Q1 2027 | ~2031–2032 |
| GYP | TC 241 | No | 2028 | ~2032–2033 |

Three tiers: CMG is "near-term" (SReq Q4 2026), AGG and MAS are "mid-term" (SReq Q1 2027), GYP is "second wave" (SReq 2028, acquis not started).

### 3. EN 998-1/EN 998-2 Cross-Family Inconsistency (CMG ↔ MAS)
First cross-family data inconsistency found in Batch 4. EN 998-1 (rendering/plastering mortar) and EN 998-2 (masonry mortar) appear in both CMG and MAS with differences:
- **EN 998-1 AVCP**: CMG says "2+, 4" while MAS says "4". Per Commission Decision 97/555/EC, the correct value is "2+, 4" (System 2+ for designed mortars, System 4 for prescribed).
- **Name format**: CMG says "Specification for mortar for masonry" vs MAS says "Mortar for masonry"
- **DPP estimates**: Differ because each family derives from its own SReq timeline (expected variance)

This is the first AVCP discrepancy found across all batches (Batches 1–4, 15 families). Previous cross-family issues (EN 14509 in SMP/ROC/WCF, EAD 020011 in DWS/ROC) did not involve AVCP mismatches.

### 4. prEN 17555-1 Aggregates Consolidation
CEN/TC 154's effort to consolidate multiple aggregate standards into prEN 17555-1 could transform the AGG standards landscape from 7 hENs to potentially 1–2. The project reached CEN Enquiry (~stage 40.60) around 2021 but current status is unclear. If successful, this would be the most significant standards consolidation among all 37 families.

### 5. EN 771-1 Revision Abandoned
The EN 771-1 (clay masonry units) revision was abandoned in Sept 2021 (CEN stage 00.98). TC 125 is explicitly waiting for the SReq under new CPR before restarting. This is the first confirmed "abandoned revision" in the deep-dive series — indicating that some TCs have stopped mid-revision to wait for new CPR clarity.

### 6. CMG Spans 4 TCs — Most Complex TC Landscape
CMG standards span CEN/TC 104 (concrete), TC 125 (masonry mortar), TC 303 (screeds), and TC 67 (tile adhesives/grouts). This 4-TC span is the highest in any family examined so far. The complexity may slow SReq drafting and standards development coordination.

### 7. GYP Self-Contained TC Portfolio
GYP is the opposite extreme: all 14 hENs belong to a single TC (CEN/TC 241). This makes GYP one of the cleanest families for data management and the simplest for SReq coordination.

### 8. Empty Content Pattern Continues
All 4 families have empty `key_risks` and `sources_summary`. 3 have empty `stakeholder_notes`. All have empty `standards_landscape` and `standards_development`. The pattern is consistent across all 15 families reviewed (Batches 1–4).

### 9. Circular Economy EADs
Batch 4 has notable circular economy EADs:
- CMG: 19 EADs including UHPFRC, waste-derived materials, low-carbon cement technology
- AGG: EAD 240002 (MSWI bottom ash aggregates)
- MAS: EAD 170005 (recycled clay), EAD 170051 (compressed earth blocks)
- GYP: EN 14190 (reprocessed gypsum) — one of the few hENs explicitly covering recycled materials

---

## Action Items for Subsequent Batches

1. **Batch 5 (RCP, FLO, SBE, CIF)**: Check if EN 13813 (screeds, currently in CMG) also belongs in FLO. Check if EN 13242 (aggregates for unbound) has relevance to CIF.
2. **All batches**: EN 998-1/EN 998-2 AVCP inconsistency should be resolved — verify against Commission Decision 97/555/EC.
3. **All batches**: Continue monitoring for abandoned revisions like EN 771-1 — pattern may indicate TC-wide strategy of waiting for new CPR SReqs.
4. **Cross-family**: EN 14509 (SMP↔ROC↔WCF) + EN 998-1/2 (CMG↔MAS) = two confirmed cross-family data inconsistencies. Admin panel verification recommended.
