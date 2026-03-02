# Batch 1 Summary — Priority (SReq Active)

**Completed**: 2026-03-01
**Families**: CEM, SMP, PCR, DWS
**Total standards reviewed**: 76 (CEM:10, SMP:40, PCR:4, DWS:22)

---

## Results Overview

| Family | Standards | Updates | Issues | Quality Gate |
|--------|----------|---------|--------|-------------|
| CEM | 10 (9 hEN + 1 EAD) | 4 | 7 | PASS |
| SMP | 40 (12 hEN + 28 EAD) | 0 | 5 | PASS |
| PCR | 4 (4 hEN) | 0 | 2 | PASS |
| DWS | 22 (15 hEN + 7 EAD) | 4 | 4 | PASS |
| **Total** | **76** | **8** | **18** | **4/4 PASS** |

---

## Cross-Batch Findings

### 1. No New EUR-Lex Implementing Decisions for Batch 1 Families
Implementing Decision 2026/284 (6 Feb 2026) added 5 new hENs but only affects SHA (space heating) and FIX (fixings) — neither in Batch 1. No new OJ citations for CEM, SMP, PCR, or DWS standards found.

### 2. SReq Status Across Batch 1
| Family | SReq | CPR | Status | Key Date |
|--------|------|-----|--------|----------|
| CEM | C(2025) 4828 | 305/2011 | Adopted Jul 2025 | Expires Jun 2030 |
| SMP | C(2025) 6586 | 305/2011 | Adopted Oct 2025 | Delivery overdue (15 Nov 2025) |
| PCR | Draft Feb 2026 | 305/2011 | Draft | Feedback deadline 3 Mar 2026 |
| DWS | Draft Jan 2026 | **2024/3110** | Draft | Feedback closed 18 Feb 2026 |

DWS is the **only** Batch 1 family with SReq under new CPR 2024/3110. CEM, SMP, and PCR are all under old CPR 305/2011.

### 3. CEN Standards Development Bottlenecks
- **EN 1090-1** (SMP): Mandate rejected by EU member states summer 2025. Stage dropped to 10.99. Major bottleneck for SMP Pipeline B.
- **prEN 197-1** (CEM): Stage 10.99, approved Jul 2025. Only CEM standard with registered prEN.
- **prEN 12602** (PCR): Draft dated Jul 2025 confirmed. On track.
- **CEN/TC 33** (DWS): Pre-standardisation active but no formal mandate yet (M/XXX).

### 4. Empty Content Sections Pattern
All 4 families have empty `key_risks` and `sources_summary` fields. CEM and DWS also have empty `stakeholder_notes`. This is a systematic gap across the data — likely worth addressing holistically.

### 5. Pipeline Node Status Discrepancies
**DWS**: Pipeline A NT-4 (SReq) has `status: "not_started"` but the family-level `sreq` field says "Draft" and `content.sreq_analysis` describes a published draft (21 Jan 2026). This is the only data-level discrepancy found in Batch 1.

### 6. Cross-Family Standards
- **EN 14509** (sandwich panels): Listed in SMP but also relevant to ROC and WCF (Batches 3, 9)
- **EAD 200029** (duplex stainless reinforcing bars): In SMP but may overlap with RPS (Batch 7)
- **EAD 020011** (roof hatches): In DWS but may overlap with ROC (Batch 3)
- **CEN/TC 33**: Shared by DWS and CWP (Batch 9)

### 7. SMP Stakeholder Notes EAD Discrepancy
SMP `content.stakeholder_notes` references EAD numbers (200036, 200043, 200077, etc.) that are NOT present in `standards[]`. Either the tracker is missing EADs (count could be >28) or the notes have inaccurate references. Needs EOTA PA 20 database verification.

---

## Action Items for Subsequent Batches

1. **Batch 3 (ROC, WCF, GLA, TIP)**: Verify EN 14509 cross-family consistency with SMP; check EAD 020011 overlap with DWS
2. **Batch 7 (SHA, PTA, SAP, RPS)**: Check EAD 200029 overlap with SMP
3. **Batch 9 (CWP, LAD, STP)**: Verify CEN/TC 33 consistency with DWS
4. **All batches**: Check for empty key_risks/sources_summary as systematic pattern
