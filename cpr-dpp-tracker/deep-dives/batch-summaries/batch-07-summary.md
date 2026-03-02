# Batch 7 Summary: Plumbing & Utilities (SHA, PTA, SAP, RPS)

**Completed**: 2026-03-01
**Families**: 4
**Standards Reviewed**: 27 (10 hEN from SHA + 5 hEN from PTA + 8 hEN from SAP + 2 hEN + 2 EAD from RPS)
**Data Updates Proposed**: 0
**Structural Issues Found**: 6
**Quality Gates**: 4/4 PASS

---

## Batch Rationale

Batch 7 groups MEP domain families — three plumbing/utilities families (SHA, PTA, SAP) and one structural steel family (RPS). The batch was expected to be lighter, and confirmed: 27 standards, clean data, minimal cross-family complexity.

## Key Findings

### 1. Implementing Decision 2026/284 — SHA Impact Confirmed
EN 16510-2-7:2025 (combination appliances: wood logs + pellets) was harmonized via **Implementing Decision (EU) 2026/284** (6 Feb 2026). OJ published 9 Feb 2026. Coexistence period with EN 13240:2001 and EN 14785:2006 ends 9 Feb 2027. This confirms the Batch 1 finding about 2026/284 affecting SHA. The tracker already lists EN 16510-2-7 as cited — data is consistent.

### 2. PTA: Only Family with ALL hENs Uncited
PTA is unique: all 5 listed hENs have `cited: false`. TEPPFA confirms no plastic pipe hEN is cited in OJEU. These products cannot be CE marked under CPR. Standards are listed for reference only. This is distinct from RPS (where the hEN was actively withdrawn) — PTA's standards were simply never cited.

### 3. SAP + PTA: MEP Domain Twins
SAP and PTA share identical regulatory profiles:
- M-I: 2028, M-III: 2029, no SReq date
- DPP: ~2033-2034 (latest timeline among all 37 families)
- Pipeline A only, no EADs
- AVCP System 4 (lowest — non-structural)
- All standards within single TC
These are the two "quietest" families in the tracker.

### 4. RPS: Most Complex Regulatory History
RPS is the most unusual family:
- **Only family with main hEN withdrawn** (EN 10080:2005, Decision 2006/893/EC, 2008)
- **Only family with main hEN stuck at prEN for 20+ years** (EN 10138 series)
- **European Ombudsman case** (Jan 2019) on Commission inaction
- **Priority 03** — among earliest for new CPR implementation
- **M-I already complete** — only family in Batch 7 with this milestone done
- **NT-3 may be stale**: targeted Q4 2025 but status still "not_started" in Mar 2026

### 5. SHA: Dual Regulation (CPR + ESPR)
Space heating appliances regulated under both CPR and ESPR (Ecodesign). Dual DPP requirements may overlap. SHA also has an existing old-CPR SReq (C(2021) 5359) — similar to CEM and SMP.

### 6. TC Mismatch Pattern Continues
SHA family TC (CEN/TC 130) ≠ standards TC (CEN/TC 295). Same deliberate pattern as ADH (TC 193 vs TC 67). Total TC mismatches identified: 3 (ADH, SHA, and CMG partially).

## Cross-Family Flags

| Flag | Families | Status |
|------|----------|--------|
| Implementing Decision 2026/284 | SHA (confirmed) + FIX (pending) | **Updated** — SHA impact verified |
| SAP ↔ PTA twins | SAP + PTA | **New** — identical regulatory profiles |
| RPS ↔ CEM/SMP/PCR priorities | Priority families | **Confirmed** — RPS is priority 03 |
| EAD 200029 (SMP↔RPS) | SMP + RPS | **Clarified** — EAD 200029 NOT in RPS data; flag may be incorrect |
| SHA ↔ ESPR dual regulation | SHA + ESPR | **New** — dual DPP overlap possible |
| EN 12004-1 AVCP mismatch | ADH ↔ CMG | Flagged (Batch 6) |
| EAD 042461 green roof | TIP ↔ GEO | Pending Batch 8 |
| CEN/TC 33 | DWS ↔ CWP | Pending Batch 9 |
| KAS ↔ LAD PA 36 | KAS + LAD | Pending Batch 9 |

## Per-Family Summary

| Family | Standards | Updates | Issues | Gate |
|--------|-----------|---------|--------|------|
| SHA | 10 hEN + 0 EAD | 0 | 2 (1 low, 1 info) | PASS |
| PTA | 5 hEN + 0 EAD | 0 | 1 (1 low) | PASS |
| SAP | 8 hEN + 0 EAD | 0 | 1 (1 low) | PASS |
| RPS | 2 hEN + 2 EAD | 0 | 2 (1 medium, 1 low) | PASS |
| **Total** | **25 hEN + 2 EAD = 27** | **0** | **6** | **4/4** |

## Observations

- **Lightest batch yet**: 27 standards, 0 data updates, 6 issues (mostly empty_content). Batch 7 families are well-modelled.
- **Late-stage families dominate**: PTA and SAP at ~2033-2034 are the furthest-out DPP estimates. Low regulatory urgency means less data to verify.
- **RPS is the exception**: Priority family with active acquis, complex regulatory history, and imminent SReq. It's the most interesting family in this batch.
- **Running AVCP mismatch count**: Still at 5 from Batches 4-6. No new mismatches in Batch 7 (no cross-listed standards).
- **Empty content pattern confirmed**: All 27 families reviewed so far have systematically empty key_risks and sources_summary sections.
