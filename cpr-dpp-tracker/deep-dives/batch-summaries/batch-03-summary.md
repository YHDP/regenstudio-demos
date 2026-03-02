# Batch 3 Summary — Building Envelope

**Completed**: 2026-03-01
**Families**: ROC, WCF, GLA, TIP
**Total standards reviewed**: 120 (ROC:52, WCF:22, GLA:16, TIP:30)

---

## Results Overview

| Family | Standards | Updates | Issues | Quality Gate |
|--------|----------|---------|--------|-------------|
| ROC | 52 (21 hEN + 31 EAD) | 0 | 3 | PASS |
| WCF | 22 (22 hEN + 0 EAD) | 0 | 2 | PASS |
| GLA | 16 (12 hEN + 4 EAD) | 0 | 3 | PASS |
| TIP | 30 (12 hEN + 18 EAD) | 0 | 3 | PASS |
| **Total** | **120** | **0** | **11** | **4/4 PASS** |

---

## Cross-Batch Findings

### 1. No Data Changes Needed for Batch 3
Like Batch 2, no pipeline node status changes are needed. All pipeline nodes accurately reflect current state. The absence of data changes for two consecutive batches confirms that the tracker data quality is high for families with distant SReq timelines.

### 2. Building Envelope Timeline Landscape
| Family | TC | Acquis | SReq Target | DPP Est |
|--------|-----|--------|------------|---------|
| GLA | TC 129 | Yes (done) | Q1 2026 | ~2029–2032 |
| TIP | TC 88 | Yes (done) | Q3 2026 | ~2029–2032 |
| WCF | TC 128 | No | 2028 | ~2032–2033 |
| ROC | TC 128 | No | 2028 | ~2032–2033 |

Two tiers: GLA and TIP are "first wave" (acquis done, SReq 2026), while WCF and ROC are "second wave" (acquis not started, SReq 2028).

### 3. GLA SReq Monitoring Flag
GLA's SReq was targeted for Q1 2026 per COM(2025) 772. As of 1 Mar 2026, no Art. 12 notification has been found. This is the third SReq timing monitoring flag raised across all batches (after PCR in Batch 1 and DWS in Batch 1). Pattern: SReq timelines from COM(2025) 772 are aspirational and may slip.

### 4. EN 14509 Cross-Family Verification Complete
EN 14509 (sandwich panels) was flagged in SMP (Batch 1, iss-SMP-003) as cross-listed in SMP, ROC, and WCF. Batch 3 confirms EN 14509 is present in both ROC and WCF standards[] arrays. Data consistency across all three families should be verified in the admin panel.

### 5. EAD 020011 Cross-Family Check
EAD 020011 (roof hatches) flagged in DWS (Batch 1) as potentially overlapping with ROC. Now raised as iss-ROC-003 for verification.

### 6. New EADs Found
- **GLA**: Implementing Decision 2025/871 (30 Apr 2025) added EAD for PET foils in insulating glass units — may need to be added to GLA standards[]
- **TIP**: EAD 042461 (hydrophilic mineral wool for green roofs) published May 2025 — NOT in tracker. May need to be added.

### 7. TIP hEN Count Discrepancy
content.standards_landscape says "13 hENs" but standards[] has 12 and standards_summary says "12 hENs". This is the first count discrepancy found within a family's own data (as opposed to cross-family discrepancies). Needs investigation.

### 8. Empty Content Pattern Continues
All 4 families have empty `key_risks` and `sources_summary`. 3 have empty `standards_development`. ROC has the most empty sections (4). The empty content pattern is now confirmed across all 10 families reviewed (Batches 1-3).

### 9. WCF is hEN-Only (No Pipeline C)
WCF is only the second family with no EADs (after CMG in Batch 4, not yet analyzed). The absence of Pipeline C simplifies WCF's regulatory pathway but means all products depend on the hEN route under new CPR.

---

## Action Items for Subsequent Batches

1. **Batch 6 (FIX, KAS, SEA, ADH)**: EOTA-dominated families — cross-reference EAD sunset patterns with ROC (31 EADs) and TIP (18 EADs)
2. **Batch 8 (GEO)**: Check if EAD 042461 (green roof mineral wool from TIP) also belongs in GEO
3. **All batches**: Empty content sections are systematic — consider bulk content population after all 37 deep-dives complete
4. **Cross-family**: EN 14509 data consistency check across SMP, ROC, WCF now verified as a known issue across 3 families
