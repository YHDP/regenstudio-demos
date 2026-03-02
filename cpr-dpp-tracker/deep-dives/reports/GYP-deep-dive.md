# Deep Dive: GYP — Gypsum Products

**Family**: Annex VII #7 · GYP
**Full Name**: Gypsum products
**Date**: 2026-03-01
**Batch**: 4 (Concrete & Mortar)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| TC | CEN/TC 241 |
| Standards | 17 (14 hEN + 3 EAD) |
| Pipelines | A (new-CPR hEN), C (old EAD sunset) |
| Acquis | No |
| SReq | Not adopted — targeted 2028 |
| DPP Estimate | ~2032–2033 |
| AVCP | 3, 4 (most products); 1 (fire-critical) |

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-2 Milestone I | not_started | amber | ✅ Correct — acquis not yet started, Q3 2026 target |
| NT-3 Milestone III | not_started | amber | ✅ Correct — Q3 2027 target |
| NT-4 SReq | not_started | amber | ✅ Correct — 2028 target per COM(2025) 772 |
| NT-5 CEN Development | not_started | gray | ✅ Correct — no active revision projects found |
| NT-7 OJ Citation | pending | gray | ✅ Correct — future |
| NT-8 Coexistence | pending | gray | ✅ Correct — future |
| NT-9 HTS In Force | pending | orange | ✅ Correct — ~2032–2033 |

### Pipeline C — Old EAD Sunset

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-C1 Legacy EADs (3) | active | green | ✅ Correct — 3 EADs counted |
| NT-C2 EAD Expiry 2031 | pending | green | ✅ Correct |
| NT-C3 New EAD/Transition | not_started | gray | ✅ Correct |
| NT-C4 ETA Expiry 2036 | pending | green | ✅ Correct |

**Pipeline verdict**: All nodes accurate. No changes needed.

---

## 3. Standards Landscape Update

### hEN Standards (14)

| Standard | AVCP | Cited | Notes |
|----------|------|-------|-------|
| EN 520 | 3, 4 | Yes | Gypsum plasterboards — flagship standard |
| EN 12859 | 4 | Yes | Gypsum blocks |
| EN 12860 | 4 | Yes | Gypsum adhesives for blocks |
| EN 13279-1 | 3, 4 | Yes | Gypsum binders and plasters |
| EN 13815 | 4 | Yes | Fibrous gypsum plaster casts |
| EN 13915 | 3, 4 | Yes | Prefab panels with cellular core |
| EN 13950 | 3, 4 | Yes | Thermal/acoustic composite panels |
| EN 13963 | 4 | Yes | Jointing materials |
| EN 14190 | 3, 4 | Yes | Reprocessed gypsum products |
| EN 14209 | 4 | Yes | Preformed plasterboard cornices |
| EN 14246 | 4 | Yes | Gypsum ceiling elements |
| EN 14496 | 4 | Yes | Gypsum adhesives for composite panels |
| EN 15283-1 | 3, 4 | Yes | Mat-reinforced gypsum boards |
| EN 15283-2 | 3, 4 | Yes | Gypsum fibre boards |

All 14 hENs are cited under CPR 2011. All under CEN/TC 241. This is one of the most self-contained TC portfolios across all 37 families — all hENs belong to the same TC.

### EAD Standards (3)

| EAD | Name | Notes |
|-----|------|-------|
| EAD 070001-02-0504 | Gypsum/expanded glass boards | Extended product scope |
| EAD 070002-00-0505 | Glass fibre joint tape | Accessory product |
| EAD 070006-00-0504 | Gypsum/expanded glass boards for sheathing | Variant application |

### New/Changed Standards

No new standards found for GYP in 2025–2026.

---

## 4. SReq Analysis Update

SReq not yet adopted. COM(2025) 772 Table 3 targets:
- Milestone I: Q3 2026
- Milestone III: Q3 2027
- SReq: 2028
- Delivery: not set

GYP is the latest-timeline family in Batch 4. Acquis has not started yet — the earliest Milestone I is Q3 2026. This puts GYP in the "second wave" alongside WCF and ROC (SReq 2028), distinct from the "first wave" families like CEM and SMP (SReq already adopted or imminent).

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- No new implementing decisions affecting GYP in 2025–2026

### CEN Work Programme
- CEN/TC 241 active but no specific revision projects found for 2025–2026
- EN 520 (plasterboards) is the most commercially important standard — no revision activity detected
- The entire GYP standard family was published between 2004–2009 and is overdue for modernisation

### EOTA
- 3 legacy EADs in PA 7 confirmed
- No new EADs for gypsum found

### EC Notifications
- No Art. 12 notification for GYP

---

## 6. Structural Issues Identified

| ID | Severity | Type | Description |
|----|----------|------|-------------|
| iss-GYP-001 | info | empty_content | 4 content sections empty: standards_landscape, standards_development, key_risks, sources_summary |

---

## 7. Proposed Data Changes Summary

| # | Action | Field | Current | Proposed |
|---|--------|-------|---------|----------|
| — | No data changes proposed | — | — | — |

---

## 8. Content Section Updates

No content changes proposed.

---

## 9. Cross-Family Notes

- **GYP is self-contained**: All 14 hENs belong to CEN/TC 241. No cross-family standards identified. This makes GYP one of the cleanest families for data management.
- **GYP has the latest SReq target in Batch 4** (2028): While CMG, AGG, and MAS all target SReq in 2026–2027, GYP's acquis hasn't started yet.
- **Recycling potential**: EN 14190 (reprocessed gypsum products) is notable — one of the few hENs explicitly covering reprocessed/recycled materials. Siniat RECYPLAC (world's first 100% recycled gypsum plasterboard, Jul 2025) shows industry is ahead of regulation on circularity.

---

## 10. Quality Checklist

- [x] Standards count verified: 14 hEN + 3 EAD = 17 ✓
- [x] NT-C1 EAD count matches standards[]: 3 ✓
- [x] All pipeline nodes reviewed
- [x] Convergence formula verified: max(~2032–2033, ~Q1-Q2 2029) = ~2032–2033 ✓
- [x] No duplicate update IDs
- [x] Cross-family standards checked — none found
- [x] Empty content sections documented
- [x] EUR-Lex checked for new implementing decisions
- [x] EOTA checked for new EADs
- [x] Review-queue JSON written

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across gypsum industry association, EPD infrastructure, recycling/circular economy, market sizing, raw material supply, and standards/fire performance
**Scope**: Eurogypsum advocacy, gypsum EPDs (Knauf, Saint-Gobain, British Gypsum), recycled gypsum (Siniat RECYPLAC, Etex, G-to-G), European plasterboard market, FGD gypsum supply decline, CEN/TC 241 fire classification

### S1. Eurogypsum — "Eternally Recyclable" Material, G-to-G Project, Active CPR/Clean Industrial Deal Engagement

Eurogypsum positions gypsum as "eternally recyclable" — the only construction material that can be recycled indefinitely without loss of properties. The EU-funded Gypsum-to-Gypsum (G-to-G) project demonstrated 30% recycled gypsum content in new plasterboard at industrial scale. The 7th European Gypsum Recyclers Forum (Brussels, 19 Nov 2025) brought together the recycling value chain. Eurogypsum welcomes CPR changes and has published position papers on the Clean Industrial Deal. The association represents ~90% of EU gypsum production capacity through members including Knauf, Saint-Gobain, Etex/Siniat, and URSA. For DPP: gypsum's infinite recyclability is a strong circular economy narrative, but recycled content data must be machine-readable in DPP declarations.

**Source**: Eurogypsum (https://www.eurogypsum.org/); G-to-G project (https://gypsumtogypsum.org/); 7th Recyclers Forum (https://www.eurogypsum.org/events/)

### S2. Gypsum EPDs — Knauf and Saint-Gobain Both Publish EN 15804 EPDs via IBU/EPD International

Knauf publishes EN 15804+A2 EPDs via EPD International for multiple plasterboard types (GKB standard, GKI impregnated, A-ZERO fire-resistant). Saint-Gobain publishes EPDs through its brands: Gyproc (Wallboard, Gyptone acoustic tiles) and British Gypsum (ThistlePro PureFinish plaster), verified by IBU. British Gypsum launched Gyproc SoundBloc Infinaé 100 in January 2025 — the UK's first 100% recycled gypsum plasterboard. EPD coverage among the Big-3 (Knauf, Saint-Gobain, Etex) is strong, but smaller regional producers may lack EPDs. The gypsum industry benefits from relatively simple manufacturing LCA (calcination of CaSO₄·2H₂O at ~150°C) compared to cement (~1450°C) or glass (~1500°C).

**Source**: Knauf EPDs via EPD International (https://www.environdec.com/); Saint-Gobain/Gyproc EPDs (https://www.gyproc.co.uk/sustainability); British Gypsum SoundBloc Infinaé 100 (https://www.british-gypsum.com/); IBU gypsum EPDs (https://ibu-epd.com/)

### S3. Siniat RECYPLAC — World's First 100% Recycled Gypsum Plasterboard (July 2025), Etex Leads Recycled Content

Siniat (Etex Group) launched RECYPLAC in July 2025 — the world's first plasterboard made from 100% recycled gypsum. Etex is the European leader in recycled gypsum utilisation, with 35%+ recycled content at some production plants and a 34% increase in recycled gypsum use between 2018–2024. The G-to-G EU project demonstrated 30% recycled content was industrially viable; RECYPLAC goes far beyond this. FGD (flue gas desulphurisation) synthetic gypsum is declining as coal-fired power stations close across Europe, making recycled gypsum from construction and demolition waste increasingly important as a raw material substitute.

**Source**: Siniat RECYPLAC (https://www.siniat.com/); Etex sustainability (https://www.etexgroup.com/sustainability/); G-to-G project (https://gypsumtogypsum.org/)

### S4. European Gypsum Plasterboard Market — $7.1B (2023), CAGR 7.09%, Big-3 Dominate

The European gypsum-based plasterboard market was valued at $7.10 billion in 2023, projected to reach $14.08 billion by 2033 (CAGR 7.09%). Market dominated by Saint-Gobain (Gyproc, British Gypsum, Rigips), Knauf, and Etex (Siniat, Fermacell). Growth drivers: renovation wave under EPBD recast, fire safety requirements (A1/A2 classification), acoustic insulation demand, and modular/offsite construction. Alternatives emerging: hempcrete boards (Hemspan), bio-based panels (Adaptavate), but gypsum retains dominant position due to cost, fire performance, and established supply chains. GYP is a mid-sized CPR family by market value — larger than ADH but smaller than CEM, FLO, or WCF.

**Source**: GlobeNewsWire (https://www.globenewswire.com/news-release/2024/11/01/2973239/28124/en/Europe-Gypsum-Based-Plasterboard-and-Alternatives-Market-Report-2023-2033); Mordor Intelligence (https://www.mordorintelligence.com/industry-reports/europe-gypsum-board-market); Research & Markets (https://www.researchandmarkets.com/report/europe-drywall-market)

### S5. FGD Gypsum Supply Decline — Coal Closures Create Raw Material Transition, Recycling Becomes Critical

More than half of Germany's gypsum demand (~4 million tonnes/year) is met by FGD gypsum from coal power station flue gas desulphurisation. As Europe phases out coal (Germany target 2038), FGD gypsum supply will decline sharply. Plasterboard plants built adjacent to power stations will become "orphans" when parent plants close. This creates a raw material transition: from FGD synthetic gypsum → recycled gypsum from C&D waste + natural gypsum quarrying. Recycled gypsum market projected to reach $3.21 billion by 2030. For DPP: raw material source (natural, FGD, recycled) is an emerging data attribute — EN 14190 (reprocessed gypsum) already provides the hEN framework. The transition strengthens the circular economy case for gypsum DPP declarations.

**Source**: Clean Energy Wire (https://www.cleanenergywire.org/news/germanys-gypsum-supply-threatened-coal-exit-report); Global Gypsum (https://www.globalgypsum.com/magazine/the-last-word/744-often-overlooked-gypsum-is-the-wonder-material-we-cannot-do-without); ZKG (https://www.zkg.de/en/artikel/zkg_Latest_market_trends_for_FGD_gypsum-3749442.html)

### S6. EN 520 Fire Classification — A2-s1,d0 Without Testing, Single TC (CEN/TC 241) Simplifies DPP

EN 520:2004+A1:2009 is the flagship gypsum plasterboard standard, prepared by CEN/TC 241 (secretariat: AFNOR). Gypsum plasterboard achieves Euroclass A2-s1,d0 (limited combustibility) without additional testing, provided paper liner grammage ≤220 g/m² and core classified A1 — per EN 520 Annex B normative conditions. This "classification without further testing" (CWFT) approach is unique among CPR families and simplifies DPP fire data. GYP's single-TC structure (all 14 hENs under CEN/TC 241) makes it one of the cleanest families for standards coordination — compared to FLO (8 TCs) or WCF (3 TCs). No active EN 520 revision project was found; the standard dates from 2004+A1:2009 and is overdue for modernisation.

**Source**: EN 520:2004+A1:2009 (https://standards.iteh.ai/catalog/standards/cen/13b1d435-e282-4c49-a603-5a6b00fb4888/en-520-2004a1-2009); CEN/TC 241 (https://standards.iteh.ai/catalog/tc/cen/9483f6b8-0477-4ec1-b720-d8020a6f32f8/cen-tc-241); Eurogypsum fire factsheet (http://www.eurogypsum.org/wp-content/uploads/2015/04/080124firefactsheet.pdf)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 2 | iss-GYP-002 | info | dpp_readiness | Big-3 (Knauf, Saint-Gobain, Etex) all publish EN 15804 EPDs. British Gypsum 100% recycled plasterboard (Jan 2025). Strong EPD infrastructure among market leaders. |
| 3 | iss-GYP-003 | warning | raw_material_transition | FGD gypsum supply declining as coal plants close (~50% of German supply at risk). Recycled gypsum becoming critical substitute. EN 14190 provides hEN framework. |
| 4 | iss-GYP-004 | info | market_context | European plasterboard $7.1B (2023), CAGR 7.09%. Big-3 dominate. Renovation wave and fire safety driving growth. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] Eurogypsum industry position assessed (CPR, Clean Industrial Deal, recycling)
- [x] EPD infrastructure documented (Knauf, Saint-Gobain, British Gypsum, IBU/EPD International)
- [x] Recycled gypsum landscape assessed (RECYPLAC 100%, G-to-G, Etex 35%+)
- [x] European plasterboard market sized ($7.1B, CAGR 7.09%)
- [x] FGD gypsum supply transition documented (coal closures, raw material shift)
- [x] EN 520 fire classification and CEN/TC 241 structure verified
- [x] All findings connected to explicit sources with URLs
