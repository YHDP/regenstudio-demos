# Deep Dive: MAS — Masonry and Related Products

**Family**: Annex VII #17 · MAS
**Full Name**: Masonry and related products — Masonry units, mortars, and ancillaries
**Date**: 2026-03-01
**Batch**: 4 (Concrete & Mortar)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| TC | CEN/TC 125 |
| Standards | 21 (11 hEN + 10 EAD) |
| Pipelines | A (new-CPR hEN), C (old EAD sunset) |
| Acquis | Yes (ongoing) |
| SReq | Not adopted — targeted Q1 2027 |
| DPP Estimate | ~2031–2032 |
| AVCP | 2+, 4 (units); 2+, 4 (mortar); 4 (ancillaries) |

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-2 Milestone I | in_progress | amber | ✅ Correct — acquis ongoing |
| NT-3 Milestone III | not_started | amber | ✅ Correct — Q2 2026 target |
| NT-4 SReq | not_started | amber | ✅ Correct — Q1 2027 target per COM(2025) 772 |
| NT-5 CEN Development | not_started | gray | ✅ Correct — TC 125 awaiting SReq. EN 771-1 revision abandoned Sept 2021. |
| NT-7 OJ Citation | pending | gray | ✅ Correct — future |
| NT-8 Coexistence | pending | gray | ✅ Correct — future |
| NT-9 HTS In Force | pending | orange | ✅ Correct — ~2031–2032 |

### Pipeline C — Old EAD Sunset

| Node | Status | Certainty | Assessment |
|------|--------|-----------|------------|
| NT-C1 Legacy EADs (10) | active | green | ✅ Correct — 10 EADs counted |
| NT-C2 EAD Expiry 2031 | pending | green | ✅ Correct |
| NT-C3 New EAD/Transition | not_started | gray | ✅ Correct |
| NT-C4 ETA Expiry 2036 | pending | green | ✅ Correct |

**Pipeline verdict**: All nodes accurate. No changes needed.

---

## 3. Standards Landscape Update

### hEN Standards (11)

| Standard | AVCP | Cited | Stage | Notes |
|----------|------|-------|-------|-------|
| EN 771-1 | 2+, 4 | Yes | CPR 2011 | Clay masonry units — **revision abandoned Sept 2021** (stage 00.98) |
| EN 771-2 | 2+, 4 | Yes | CPR 2011 | Calcium silicate masonry units |
| EN 771-3 | 2+, 4 | Yes | CPR 2011 | Aggregate concrete masonry units |
| EN 771-4 | 2+, 4 | Yes | CPR 2011 | AAC masonry units |
| EN 771-5 | 2+, 4 | Yes | CPR 2011 | Manufactured stone masonry units |
| EN 771-6 | 2+, 4 | Yes | CPR 2011 | Natural stone masonry units |
| EN 998-1 | 4 | Yes | CPR 2011 | Rendering/plastering mortar — **cross-listed with CMG** |
| EN 998-2 | 2+, 4 | Yes | CPR 2011 | Masonry mortar — **cross-listed with CMG** |
| EN 845-1 | 4 | Yes | CPR 2011 | Wall ties, straps, hangers |
| EN 845-2 | 4 | Yes | CPR 2011 | Lintels |
| EN 845-3 | 4 | Yes | CPR 2011 | Bed joint reinforcement |

**Notable**: The EN 771 series (6 parts) covers all masonry unit materials. EN 771-1 revision was attempted but abandoned in Sept 2021 (CEN stage 00.98 = project abandoned). TC 125 is now awaiting the SReq under CPR 2024/3110 before restarting revision work.

### EAD Standards (10)

| EAD | Name | Key Feature |
|-----|------|-------------|
| EAD 170005-00-0305 | Recycled clay masonry units | Circular economy |
| EAD 170051-00-0305 | Compressed solid earth blocks and wall kits | Earth construction |
| EAD 170002-00-0305 | Seismic masonry kits (AAC) | Seismic performance |
| EAD 170006-00-0305 | Aggregate concrete units (specific moisture) | Performance variant |
| EAD 170008-00-0604 | Bed joint reinforcement (structural) | Structural use |
| EAD 170010-00-0305 | Polystyrene concrete masonry units/kits | Lightweight |
| EAD 170011-00-0305 | Insulating building element for masonry | Thermal performance |
| EAD 170012-00-0404 | Bricks with cellular glass core | Innovation |
| EAD 170018-00-0305 | Cellular glass loadbearing units | Thermal + structural |
| EAD 170034-00-0305 | Sodium-silicate thin-layer masonry mortar | Novel binder |

Notable circular economy innovations: recycled clay (170005), compressed earth (170051), and cellular glass (170012/170018).

### New/Changed Standards

- EAD 170051 cited via (EU) 2025/2355 — confirmed in data
- No new EADs for masonry found in 2025–2026 search

---

## 4. SReq Analysis Update

SReq not yet adopted. COM(2025) 772 Table 3 targets:
- Milestone I: ongoing
- Milestone III: Q2 2026
- SReq: Q1 2027
- Delivery: not set

CEN/TC 125 participated in CPR Acquis activities 2022–2024. The TC's work on EN 771 revision was abandoned in 2021, indicating that meaningful standards development cannot resume until the SReq is issued. This creates a dependency: SReq timing directly gates standards development for masonry.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- No new implementing decisions affecting MAS in 2025–2026
- EAD 170051 citation via (EU) 2025/2355 already reflected in data

### CEN Work Programme
- CEN/TC 125 active in acquis process
- EN 771-1 revision abandoned (00.98) — TC awaiting new CPR SReq
- No active prEN projects for masonry found

### EOTA
- 10 legacy EADs in PA 17 confirmed
- EAD 170005 (recycled clay) and EAD 170051 (compressed earth) represent circular economy innovation
- No new EADs found

### EC Notifications
- No Art. 12 notification for MAS

---

## 6. Structural Issues Identified

| ID | Severity | Type | Description |
|----|----------|------|-------------|
| iss-MAS-001 | warning | cross_family | EN 998-1 cross-listed with CMG — AVCP mismatch: MAS records "4" while CMG records "2+, 4". Name format also differs. DPP estimates differ (~2031–2032 vs ~2032–2033). |
| iss-MAS-002 | warning | cross_family | EN 998-2 cross-listed with CMG — DPP estimate mismatch: MAS records "~2031–2032" while CMG records "~2032–2033". AVCP matches (both "2+, 4"). |
| iss-MAS-003 | info | empty_content | 5 content sections empty: standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary |

---

## 7. Proposed Data Changes Summary

| # | Action | Field | Current | Proposed |
|---|--------|-------|---------|----------|
| — | No data changes proposed | — | — | — |

Cross-family EN 998-1/2 inconsistencies need resolution, but the correct values need verification before proposing changes.

---

## 8. Content Section Updates

No content changes proposed.

---

## 9. Cross-Family Notes

- **EN 998-1 / EN 998-2 (MAS ↔ CMG)**: Both standards appear in MAS and CMG. Key discrepancies:
  - EN 998-1 AVCP: MAS says "4", CMG says "2+, 4". The correct value is "2+, 4" per Commission Decision 97/555/EC (designed mortars = 2+, prescribed = 4). MAS likely has an error.
  - Name: MAS says "Mortar for masonry" while CMG says "Specification for mortar for masonry". The official CEN title is "Specification for mortar for masonry".
  - DPP estimates differ because each family computes them differently. Both are reasonable.
- **EAD 170008-00-0604 (bed joint reinforcement)**: PA code 0604 suggests overlap with structural metallic products — may be relevant to SMP. Not flagged as hard issue.

---

## 10. Quality Checklist

- [x] Standards count verified: 11 hEN + 10 EAD = 21 ✓
- [x] NT-C1 EAD count matches standards[]: 10 ✓
- [x] All pipeline nodes reviewed
- [x] Convergence formula verified: max(~2031–2032, ~Q1-Q2 2029) = ~2031–2032 ✓
- [x] No duplicate update IDs
- [x] Cross-family standards flagged (EN 998-1, EN 998-2 with CMG)
- [x] Empty content sections documented
- [x] EUR-Lex checked for new implementing decisions
- [x] EOTA checked for new EADs
- [x] Review-queue JSON written

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across European masonry market, masonry EPDs, CEN/TC 125 standards, circular economy, Wienerberger decarbonisation, and earth construction innovation
**Scope**: European bricks/blocks market sizing, Wienerberger/TBE EPD infrastructure, clay brick circular economy, Wienerberger electric kiln at Uttendorf, compressed earth block EADs, Eurocode 6 linkage

### S1. European Masonry Market — AAC $1.75B (2024), Clay Bricks 41%, EU 2040 Target Reshaping Industry

European AAC market $1.75 billion (2024), projected to $2.99 billion by 2034 (CAGR 5.5%). Clay bricks dominate at 41% of European brick market share. Calcium silicate growing due to lower embodied energy (241 kWh/t vs higher for fired clay). Key players: Wienerberger (Austria, global leader), Xella Group (Germany — Ytong AAC, Silka calcium silicate), Cemex, CRH. EU's 90% emissions-cut target for 2040 is accelerating adoption of lower-carbon masonry products (fly-ash, calcium-silicate). Germany leads European masonry production. Coloured clay brick production in Europe rose 12% in 2023 (1.1 billion units). MAS is a substantial CPR family covering 6 material types (clay, calcium silicate, aggregate concrete, AAC, manufactured stone, natural stone masonry).

**Source**: 6W Research Europe (https://www.6wresearch.com/industry-report/europe-bricks-and-blocks-market-2020-2026); Expert Market Research AAC (https://www.expertmarketresearch.com/reports/europe-autoclaved-aerated-concrete-aac-market); Precedence Research bricks (https://www.precedenceresearch.com/bricks-market); AAC Worldwide calcium silicate (https://www.aac-worldwide.com/category/special/the-european-calcium-silicate-masonry-unit-industry-building-on-its-past-ready-for-the-future-739)

### S2. Masonry EPDs — Wienerberger Leads, TBE Requires Cradle-to-Grave, Clay Strongest Coverage

Wienerberger publishes EN 15804 EPDs for clay masonry products (facing bricks, ceramic blocks). TBE (Tiles & Bricks Europe) agreement requires all clay product EPDs to be cradle-to-grave (all modules A1–D must be declared). BAU-EPD publishes PCR Part B for construction clay products per EN 15804+A2. UK BDA (Brick Development Association) publishes UK-wide clay brick industry average EPDs. EPD coverage strongest for clay bricks (major manufacturers all have EPDs), less visible for concrete blocks, AAC, and calcium silicate units. For DPP: the TBE cradle-to-grave requirement means clay brick EPDs already provide the full lifecycle data needed for DPP environmental declarations.

**Source**: Wienerberger EPDs (https://www.wienerberger.co.uk/content/dam/wienerberger/united-kingdom/marketing/documents-magazines/sustainability/correct/UK_EPD_UK_Clay_Brick_202402.pdf); BAU-EPD PCR (https://www.bau-epd.at/fileadmin/user_upload/PCR_product_specific_A2_English/BAU-EPD-PCR-B-2.3-Construction_clay_products-Version-14.0-20230920-EN15804_A2-English-Website.pdf); BDA industry EPD (https://www.greenbooklive.com/filelibrary/EN_15804/EPD/BDA-EN-EPD-0002.pdf)

### S3. Wienerberger Electric Kiln — World's Largest, Nearly CO₂-Neutral Brick Production, 90% Emissions Reduction

Wienerberger inaugurated the world's largest electric industrial kiln at Uttendorf, Austria (November 2024) — Europe's most sustainable brick production facility. Running on green electricity (including on-site PV), emissions reduced ~90%, overall energy consumption reduced by one-third. First nearly carbon-neutral clay brick. Facility fully operational in 2025. Wienerberger sustainability targets: 25% production emissions reduction by 2026, 90% recyclable/reusable products sold, climate neutrality by 2050. This represents a paradigm shift for clay brick manufacturing — historically one of the most carbon-intensive masonry processes. For DPP: GWP data for electrically-fired bricks will be dramatically lower than gas-fired equivalents, creating significant within-product-category variation.

**Source**: Wienerberger Uttendorf press release (https://www.wienerberger.com/en/media/press-releases/2024/20241129-wienerberger-starts-Europes-greenest-brick-production.html); GreenBricks electric kiln (https://www.wienerberger.com/en/stories/2024/20241204-GreenBricks-Electric-Kiln-Revolutionizes-Brick-Production.html); Wienerberger Sustainability Program 2026 (https://www.wienerberger.com/en/sustainability/sustainability-program-2026.html)

### S4. Masonry Circular Economy — Brick Reuse Increasing, K-Briq 90% Recycled, EAD 170005 Recycled Clay

Clay brick reuse from demolition is increasing as designers seek traditional appearance with lower embodied carbon. Crushed brick can be used as unbound base material in road construction, replacing natural aggregates. K-Briq: 90% C&D waste content, 5% the embodied carbon of traditional clay-fired brick — claimed highest recycled content of any brick. EU 70% C&D waste recycling target under Waste Framework Directive. EAD 170005 (recycled clay masonry units) provides the CE-marking route for recycled content products. EAD 170051 (compressed earth blocks and wall kits) enables low-embodied-energy earth construction. EAD 170012 (bricks with cellular glass core) — innovative thermal performance. For DPP: recycled content declarations will be critical for masonry, with EAD 170005 providing the assessment framework.

**Source**: BDA circular principles (https://www.brick.org.uk/better-with-brick/sustainability/circular-principles); Sustainable Brick (https://www.sustainablebrick.com/why-use-clay-brick/); UKGBC (https://ukgbc.org/resources/bricks-made-from-industrial-waste/); TBE sustainability (http://www.tiles-bricks.eu/sustainability)

### S5. CEN/TC 125 — EN 771-1 Revision Abandoned (2021), TC Awaiting SReq, Eurocode 6 Second Generation

CEN/TC 125 was established in 1988 and covers all masonry units, mortars, renders, ancillary components, and test methods. EN 771-1 (clay masonry units) revision was abandoned in September 2021 (CEN stage 00.98 = project abandoned) — the TC could not progress without clarity on the new CPR framework. TC 125 now awaiting SReq (targeted Q1 2027) before restarting standards development. Eurocode 6 second generation (EN 1996) is under development by CEN/TC 250/SC 6 — the structural design standard for masonry. Eurocode updates will influence essential characteristics in the SReq. For DPP: the abandoned revision creates a standards development gap — MAS will need to move quickly once the SReq is issued to avoid timeline delays.

**Source**: IMS CEN/TC 125 (https://www.masonry.org.uk/downloads/cen-tc-125-european-masonry-standards/); Eurocodes homepage (https://eurocodes.jrc.ec.europa.eu/); CEN/TC 250 guidance (https://www.cencenelec.eu/media/CEN-CENELEC/AreasOfWork/CEN%20sectors/Construction/Quicklinks/Guides/centc250_guidancedraftingnationalannexes_eneurocodesfornsbs.pdf)

### S6. Material Diversity — 6 Masonry Unit Types Plus Mortars and Ancillaries Under Single TC

MAS covers 6 masonry unit material types (EN 771 Parts 1–6: clay, calcium silicate, aggregate concrete, AAC, manufactured stone, natural stone), 2 mortar standards (EN 998-1/2, cross-listed with CMG), and 3 ancillary standards (EN 845 Parts 1–3). All under single TC 125 — but the material diversity rivals FLO (6 material types, 8 TCs). Each material has fundamentally different manufacturing processes, environmental profiles, and EPD methodologies. Clay bricks are fired at 1000°C+; AAC is autoclaved at 190°C; calcium silicate at 200°C; aggregate concrete is not fired. For DPP: a single SReq must accommodate these radically different products, and environmental data will vary enormously between material types.

**Source**: EN 771 series (https://standards.globalspec.com/std/797947/en-1337-1); CEN/TC 125 structure (https://www.masonry.org.uk/downloads/cen-tc-125-european-masonry-standards/)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 4 | iss-MAS-004 | info | dpp_readiness | Wienerberger leads with EN 15804 EPDs. TBE requires cradle-to-grave for clay products. BDA UK industry average EPD. Coverage strongest for clay, weaker for concrete blocks/AAC. |
| 5 | iss-MAS-005 | info | circular_economy | Clay brick reuse increasing. K-Briq 90% recycled, 5% embodied carbon. EAD 170005 (recycled clay) provides CE route. EU 70% CDW recycling target. EAD 170051 enables earth construction. |
| 6 | iss-MAS-006 | info | market_context | European AAC $1.75B, clay bricks 41%. Wienerberger electric kiln at Uttendorf — nearly CO₂-neutral production, 90% emission reduction. 2050 climate neutrality target. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] European masonry market assessed (AAC $1.75B, clay 41%)
- [x] EPD infrastructure documented (Wienerberger, TBE cradle-to-grave, BDA industry EPD)
- [x] Wienerberger electric kiln decarbonisation documented (Uttendorf, 90% reduction)
- [x] Circular economy assessed (brick reuse, K-Briq, EAD 170005, EU 70% target)
- [x] CEN/TC 125 revision status checked (EN 771-1 abandoned, awaiting SReq)
- [x] Material diversity (6 types) and DPP complexity assessed
- [x] All findings connected to explicit sources with URLs
