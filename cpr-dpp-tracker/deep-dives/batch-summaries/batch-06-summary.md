# Batch 6 Summary: EOTA-Dominated (FIX, KAS, SEA, ADH)

**Completed**: 2026-03-01
**Families**: 4
**Standards Reviewed**: 73 (0 hEN from FIX + 0 hEN from KAS + 5 hEN from SEA + 2 hEN from ADH = 7 hEN; 34 EAD from FIX + 32 EAD from KAS = 66 EAD)
**Data Updates Proposed**: 0
**Structural Issues Found**: 10
**Quality Gates**: 4/4 PASS

---

## Batch Rationale

Batch 6 groups the "EOTA-dominated" families — two EAD-only families (FIX with 34 EADs, KAS with 32 EADs) and two small hEN-only families (SEA with 5 hENs, ADH with 2 hENs). The focus was on EAD sunset transition risks, EOTA's new CPR adaptation, and cross-family AVCP verification.

## Key Findings

### 1. EAD Transition Bottleneck (Systemic Risk)
EOTA manages ~400 EADs across all product areas but only publishes 20-30 new EADs per year. At this rate, replacing all old-regime EADs would take 13-20 years — far exceeding the 5-year deadline (9 Jan 2031). EOTA is developing a 12-month fast-track process, but scale remains a concern. This affects FIX (34 EADs), KAS (32 EADs), and all other EAD-heavy families.

### 2. KAS: Most Diverse Product Family
KAS spans an extraordinary range: ETICS systems (12 variants by insulation type), prefabricated building units (steel/timber/modular), construction kits (ICF, lost formwork, post-tensioned slabs), and emerging technologies (BIPV, green walls, solar shading). This is the most diverse product family across all 37. Future SReq may need to be split into multiple workstreams.

### 3. KAS: Strategic Renovation Wave Importance
ETICS and prefab facade modules are central to EU building renovation policy. ~75% of EU building stock is energy-inefficient, only 0.4-1.2% renovated annually. EPBD recast (2024/1275) sets ambitious 2030/2033 targets. KAS product availability is critical for EU climate goals.

### 4. EN 12004-1 Cross-Family AVCP Mismatch
EN 12004-1 (adhesives for ceramic tiles) appears in both ADH (AVCP "3") and CMG (AVCP "3, 4"). This is the 6th cross-family AVCP mismatch identified. Running tally:
1. EN 998-1 (CMG "2+, 4" vs MAS "4")
2. EN 13813 (CMG "3, 4" vs FLO "1, 3, 4")
3. EN 13043 (AGG "2+, 4" vs RCP "2+")
4. EN 13055 (AGG "2+, 4" vs RCP "2+")
5. EN 12004-1 (CMG "3, 4" vs ADH "3")
Pattern: the more specialist family tends to list fewer AVCP systems. Systematic verification against Commission Decisions needed.

### 5. ADH TC Mismatch (Deliberate)
ADH family TC is CEN/TC 193 (Adhesives) but both standards (EN 12004-1/2) are developed by CEN/TC 67 (Ceramic tiles). This is intentional — product category determines family, application TC develops the standard. Not an error but worth documenting.

### 6. SEA: Cleanest Family in Batch
SEA is self-contained: 5 hENs all within CEN/TC 349, no cross-family standards, no EADs, single pipeline. The only issue is 5 empty content sections. No data changes needed.

### 7. EOTA New CPR Sustainability Requirements
New EADs under CPR 2024/3110 must include environmental sustainability characteristics:
- GWP declaration: immediately upon EAD citation
- Core LCA-EPD indicators (per EN 15804): by 2029
- Full indicator list: by 2031
This directly supports DPP data requirements. EADs valid for 10 years with extension option. ETAs under new CPR have no expiry.

### 8. Implementing Decision 2026/284
Confirmed to affect FIX (and SHA from Batch 7). Specific EADs impacted could not be verified without OJ full text access.

## Cross-Family Flags

| Flag | Families | Status |
|------|----------|--------|
| EN 12004-1 AVCP mismatch | ADH ↔ CMG | **New** — flagged as iss-ADH-002 |
| EAD 330031 ETICS anchors | FIX ↔ KAS | **New** — noted, boundary correct |
| EAD 340033 chimney kits | KAS ↔ CHI | **New** — noted, boundary correct |
| PA 36 attached ladders | KAS ↔ LAD | **New** — pending Batch 9 verification |
| EAD 340036 BIPV | KAS ↔ ESPR | **New** — potential Pipeline E scope |
| EN 14509 cross-family | SMP ↔ ROC ↔ WCF | Verified (Batch 3) |
| EAD 200029 | SMP ↔ RPS | Pending Batch 7 |
| CEN/TC 33 | DWS ↔ CWP | Pending Batch 9 |
| EAD 042461 green roof | TIP ↔ GEO | Pending Batch 8 |

## Per-Family Summary

| Family | Standards | Updates | Issues | Gate |
|--------|-----------|---------|--------|------|
| FIX | 0 hEN + 34 EAD | 0 | 3 (1 medium, 1 low, 1 info) | PASS |
| KAS | 0 hEN + 32 EAD | 0 | 3 (1 low, 2 info) | PASS |
| SEA | 5 hEN + 0 EAD | 0 | 1 (1 low) | PASS |
| ADH | 2 hEN + 0 EAD | 0 | 3 (1 medium, 1 low, 1 info) | PASS |
| **Total** | **7 hEN + 66 EAD = 73** | **0** | **10** | **4/4** |

## Observations

- **EAD-only families (FIX, KAS)** have the most complex transition path — no CEN TC, no existing hEN infrastructure, entire product assessment ecosystem through EOTA. Pipeline A is "future" for both.
- **hEN-only families (SEA, ADH)** are simpler but have late SReq timelines (2029) — they're among the last families to enter the new CPR standards pipeline.
- **Zero data updates** in this batch — all node statuses, dates, and standard attributes confirmed accurate. The tracker data for Batch 6 is well-modelled.
- **Batch 6 is the "EAD sunset focus" batch** as planned. The systemic EAD transition bottleneck is the dominant risk finding, affecting not just FIX/KAS but all 37 families with Pipeline C.
