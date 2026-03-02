# DPW — Decorative Paints: Deep-Dive Report

**Generated**: 2026-03-01
**Data version**: families-v2.json (updated 2026-02-22)
**Family**: New family · DPW
**Batch**: 10 (Trailing / sparse data)
**Analyst**: Claude (automated deep-dive)

---

## 1. Family Overview

| Field | Value |
|-------|-------|
| Full name | Decorative paints and wallpapers |
| Letter | DPW |
| Annex VII # | (none — new family) |
| TC | CEN/TC 139 |
| Standards tracked | 0 (0 hEN + 0 EAD) |
| Active pipelines | A (new-CPR hEN route) |
| Future pipelines | None |
| DPP estimate | 2035+ |
| Acquis | No |
| SReq status | Not started — no date set |
| AVCP | Not determined |
| Last updated | 2026-02-22 |

**Key context**: DPW is a **new product family** introduced under the revised CPR 2024/3110. It did not exist under CPR 305/2011 and has no Annex VII family number assigned yet. The family covers interior and exterior decorative paints, varnishes, coatings, and wallcoverings for buildings. CEN/TC 139 (Paints and varnishes) is the designated TC. Milestone I is targeted for 2029 (shared latest date with CAB). DPP estimate of 2035+ makes it the family with the most distant DPP horizon. Zero standards tracked — the entire standardisation process must be built from scratch.

---

## 2. Pipeline Status Review

### Pipeline A — New-CPR hEN Route (2024/3110)

| Node | Type | Current Status | Certainty | Finding | Proposed Status | Proposed Certainty | Source |
|------|------|---------------|-----------|---------|----------------|-------------------|--------|
| Milestone I (Product Scope) | NT-2 | not_started | amber | Correct — 2029 target | No change | No change | S30, S1 |
| Milestone III (Essential Chars) | NT-3 | not_started | gray | Correct — no date set | No change | No change | S30, S1 |
| SReq (CPR 2024/3110) | NT-4 | not_started | gray | Correct — no date set | No change | No change | S30 |
| CEN Standards Development | NT-5 | not_started | gray | Correct — no standards exist | No change | No change | S30 |
| OJ Citation (Art. 5(8)) | NT-7 | pending | gray | No standards to cite | No change | No change | S1, S143 |
| Coexistence Period | NT-8 | pending | gray | No change | No change | No change | S1 |
| HTS In Force | NT-9 | pending | orange | 2035+ estimate (most distant) | No change | No change | S30, S1 |

**Pipeline verdict**: All 7 nodes accurate. No changes needed. No Pipeline C (0 EADs).

---

## 3. Standards Landscape Update

### hENs (0)

No harmonised standards exist for decorative paints and wallpapers under the CPR. CEN/TC 139 has extensive non-harmonised standards (EN ISO 2409 adhesion, EN ISO 2812 resistance to liquids, EN ISO 4618 vocabulary, etc.) but none are CPR-harmonised.

### EADs (0)

No EADs.

### Potential Scope

Future harmonised standards could cover:
- **VOC emissions**: Already regulated under EU Directive 2004/42/EC (Decopaint Directive) and national schemes (French A+ labelling, German AgBB)
- **Reaction to fire**: Wall/ceiling coatings affect fire performance
- **Dangerous substances**: Heavy metals, biocides, isocyanates
- **Durability**: Weathering resistance, colour stability
- **Environmental performance**: EPD-related characteristics

### New/Changed Standards

No new standards found for DPW in 2025–2026.

**Count verification**: 0 hENs + 0 EADs = 0 total. Matches data (standards[] is empty, standards_summary is null).

---

## 4. SReq Analysis Update

**Status**: Not started. No Art. 12 notification.

Key facts:
- Per COM(2025) 772: M-I targeted 2029
- No M-III, SReq, or delivery dates
- No acquis — entirely new product family
- CEN/TC 139 assigned but no CPR work yet
- The entire standardisation process must be built from scratch

**No change to tracker data**: Status correctly recorded.

---

## 5. Regulatory Landscape Changes

### EUR-Lex
- **2026/284** (6 Feb 2026): Does NOT affect DPW
- **Decopaint Directive 2004/42/EC**: Sets VOC content limits for decorative paints — cross-regulatory factor
- No CPR-specific implementing decisions for decorative paints found in 2025–2026

### CEN Work Programme
- CEN/TC 139 (Paints and varnishes): Active, primarily developing test method standards (EN ISO series). No CPR-specific harmonised product standard development.

### EOTA
- No EADs for DPW — not applicable

---

## 6. Structural Issues Identified

| # | ID | Severity | Type | Description | Action |
|---|----|----------|------|-------------|--------|
| 1 | iss-DPW-001 | info | empty_content | 4 content sections empty: standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary | Populate with content |
| 2 | iss-DPW-002 | info | content_data_disagreement | standards_summary is null. family field is empty string (no Annex VII number). | Set standards_summary to structured value. Consider noting that Annex VII number is pending. |

---

## 7. Proposed Data Changes Summary

| # | Field | Current | Proposed | Reason | Confidence |
|---|-------|---------|----------|--------|------------|
| 1 | (none) | — | — | No pipeline or data changes possible. | — |

---

## 8. Content Section Updates

### content.key_risks (currently empty)
**Proposed**: "1) Greenfield family: No existing acquis, no harmonised standards, no EADs — the entire regulatory framework must be created from scratch. 2) 2035+ DPP horizon — most distant of all 37 families. Low urgency for stakeholders but long planning horizon. 3) Cross-regulatory complexity: VOC emissions already regulated under Decopaint Directive 2004/42/EC and national indoor air quality schemes (French A+, German AgBB). CPR scope may need to complement rather than duplicate existing frameworks. 4) Mixed product types: Paints (liquid) and wallpapers (sheet) have fundamentally different testing and assessment needs."

### content.sources_summary (currently empty)
**Proposed**: "S30: COM(2025) 772 CPR Working Plan 2026–2029. S1: Regulation (EU) 2024/3110."

---

## 9. Cross-Family Notes

- **No cross-family standards**: DPW is entirely self-contained.
- **VOC cross-regulatory**: Decopaint Directive 2004/42/EC, French VOC A+ labelling, and German AgBB scheme create an existing regulatory landscape for indoor air quality that CPR must navigate.
- **New family pattern**: DPW shares characteristics with LAD (Batch 9) — both are new CPR 2024/3110 families without existing harmonised standards. DPW has even less infrastructure (no existing hENs to reclassify).

---

## 10. Quality Checklist

- [x] All pipeline nodes reviewed (7 in A — 7 total, no Pipeline C)
- [x] All standards checked against sources (0/0 — no standards to verify)
- [x] hen_count matches actual hEN count in standards[] (0 hENs)
- [x] ead_count matches actual EAD count in standards[] (0 EADs)
- [x] DPP date consistent with convergence formula (max(Product 2035+, System ~Q1-Q2 2029) = 2035+)
- [x] No duplicate update IDs
- [x] Content sections all non-empty or flagged (4 empty sections flagged)
- [x] Source citations present for all claims
- [x] Cross-family standards noted (none — self-contained; VOC cross-regulatory documented)
- [x] Review-queue JSON is valid (see accompanying file)

---

## Supplementary Wide-Scope Research

**Date**: 2026-03-01
**Research depth**: 6 targeted web searches across European decorative paint market, paint EPDs, Decopaint Directive/VOC regulation, paint recycling/circular economy, CEN/TC 139 standards, and CEPE industry sustainability
**Scope**: European paints & coatings market sizing, EPD coverage (AkzoNobel, PPG, Jotun), Decopaint Directive 2004/42/EC and national VOC schemes (French A+, German AgBB), paint reuse programmes, CEN/TC 139 scope and construction relevance, CEPE sustainability charter and waterborne transition

### S1. European Paints & Coatings Market — $38.7B (2024), Decorative/Architectural 45% of Value, Residential 48%

European paints & coatings market $38.66 billion (2024), growing to $39.99 billion (2025) and projected $43.91 billion by 2030. Decorative/architectural coatings segment holds 45% market share (2024). Residential construction accounts for 48% of end-use. Key players: AkzoNobel (Dulux, Sikkens), PPG, Sherwin-Williams, Jotun, Hempel, DAW (Caparol), Tikkurila (PPG). The shift towards waterborne coatings is significant — approximately 80% of European decorative paints are now water-based (driven by VOC regulations). Growth factors: EU renovation wave (EPBD), Green Deal, and stricter environmental regulations.

**Source**: Towards Chem & Materials Europe paints (https://www.towardschemandmaterials.com/insights/european-paints-and-coatings-market); Mordor Intelligence (https://www.mordorintelligence.com/industry-reports/europe-paints-and-coatings-market); European Coatings market transformation (https://www.european-coatings.com/news/markets-companies/architectural-coatings-a-market-in-transformation/)

### S2. AkzoNobel, PPG (Dulux), and Jotun All Publish EN 15804+A2 EPDs — Paint EPD Infrastructure Surprisingly Mature

AkzoNobel publishes EN 15804+A2 EPDs for Sikkens exterior wall paints (modules A1-A5, C2, C4, D). PPG publishes EN 15804+A2 EPDs for Dulux Pure Performance primers (cradle-to-gate with options). Jotun publishes EPDs via EPD Norway for facade paints and interior products (e.g., Jotun Facade 2487, Primax Defend). Dulux Ultra and other products have EPD registrations with NSF International. EPDs cover both interior decorative and exterior protective paints. For DPP: despite DPW having the most distant DPP horizon (2035+), major paint manufacturers already have EN 15804+A2 EPD infrastructure. This means the data generation challenge is less about methodology and more about scope definition — what characteristics will CPR require that go beyond current EPD coverage (VOC content, dangerous substances, recyclability)?

**Source**: AkzoNobel EPDs (https://www.akzonobel.com/en/about-us/sustainability-/making-buildings-greener/environmental-product-declarations); Jotun EPD (https://boa.docu.info/dyn/eip/edit/company/20/97/69/NEPD-4270-3504_Primax-Defend--Jotun-CZECH-AS.pdf); PPG EPD (https://www.ppgpaints.com/pdfs/epd-s/pure-performance-primer-epd)

### S3. Decopaint Directive 2004/42/EC — VOC Limits Established, French A+ and German AgBB Set National Standards

Decopaint Directive 2004/42/EC limits VOC content in decorative paints and varnishes (not emissions — content limits). Two categories: water-based and solvent-based, with specific g/L limits. French "Émissions dans l'air intérieur" label: mandatory for building products sold in France since 2012 — rates VOC emissions A+ to C based on 10 substances + TVOC (µg/m³ thresholds). German AgBB (Ausschuss zur gesundheitlichen Bewertung von Bauprodukten) scheme: evaluates VOC emissions from construction products for indoor suitability using DIN EN 16516 / ISO 16000. Belgium, Italy also have national VOC schemes. For DPP: VOC data is already generated under these existing schemes — CPR could leverage this rather than creating new requirements. The challenge is harmonising fragmented national approaches into a single CPR essential characteristic.

**Source**: EUR-Lex Decopaint Directive (https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:32004L0042); French VOC label (https://www.anses.fr/en/content/labelling-building-and-decoration-products-respect-voc-emissions); AgBB scheme (https://www.eco-institut.de/en/portfolio/agbb-schema/)

### S4. Paint Circular Economy — Reuse Emerging, Wallpaint Largest Construction Chemical Segment, Linear Waste Process

Wall paint is the largest segment of construction chemicals and currently represents a largely linear waste process: paint produced → used → thermally recycled (incinerated) or landfilled. Rediscover Paint (Dublin) collects unwanted paint from recycling centres, filters and remixes into new products — registered on EU Circular Economy Stakeholder Platform. LIFE Waterborne Biopaint EU project developing bio-based waterborne paint technology. Paint tins (steel) are recyclable but recovery rates vary. Wallpaper recycling is minimal — vinyl wallpapers particularly problematic. Leftover paint volumes are significant: UK alone generates ~50M litres unused paint annually. For DPP: circular economy data for paints (remaining service life, recyclability, hazardous waste classification) will be challenging to standardise given product diversity.

**Source**: EU Circular Economy Platform Rediscover Paint (https://circulareconomy.europa.eu/platform/en/good-practices/rediscover-paint-collects-unwanted-paint-and-prepares-it-reuse); Paints for Life circular economy (https://www.paintsforlife.eu/en/blog/paint-industry-and-circular-economy-it-possible); Timberlove circular wall paint (https://timberlove.blog/news/circular-economy-is-possible-wall-paint-is-a-good-example/)

### S5. CEN/TC 139 — Extensive Non-Harmonised Portfolio (EN ISO Test Methods), EN 13300 for Classification, No CPR hEN Exists

CEN/TC 139 "Paints and varnishes" maintains an extensive portfolio of test method standards, mostly adopted as EN ISO (via Vienna Agreement with ISO/TC 35). Standards cover: adhesion (EN ISO 2409), resistance to liquids (EN ISO 2812), vocabulary (EN ISO 4618), wet-scrub resistance (EN 13300:2022), hiding power (EN ISO 6504), VOC determination (EN ISO 11890), and many more. EN 13300:2022 classifies water-based coatings for interior walls/ceilings (covering power, wet-scrub resistance, gloss). However, none of these standards are CPR-harmonised product standards — they are test methods. Creating CPR hENs for decorative paints will require developing entirely new product standards that reference these existing test methods. EU Ecolabel for paints (Decision 2022/1229) validity extended to 31 Dec 2025.

**Source**: CEN/TC 139 iTeh.ai (https://standards.iteh.ai/catalog/tc/cen/2fc460be-2fd3-4604-9b01-dd9f706c943f/cen-tc-139); CEN/TC 139 business plan (https://standards.cencenelec.eu/BPCEN/6121.pdf); Genorma EN 13300 (https://genorma.com/en/standards/en-13300-2022)

### S6. CEPE (European Coatings Association) — Sustainability Charter, 80% Waterborne Shift, Bio-Based Additives Emerging

CEPE (European Council of the Paint, Printing Ink and Artists' Colours Industry, est. 1951) is the sole EU-level trade association for coatings. CEPE Sustainability Charter covers people, planet, prosperity dimensions. Key trends: ~80% of European decorative paints now waterborne (driven by Decopaint Directive); bio-based coatings and additives emerging (European Coatings Conference Bio-based 2025); solvent sustainability guide published (Green Chemistry 2024). CEPE working groups cover health, safety, environment, transport, and sustainability. Industry is ISO liaison partner through CEPE membership in ISO/TC 35. For DPP: CEPE would be the primary industry interlocutor for CPR standardisation. The 80% waterborne transition means most decorative paints already have lower environmental impact than historical baselines.

**Source**: CEPE (https://cepe.org/); CEPE sustainability documents (https://cepe.org/sustainability/sustainability-documents/); European Coatings waterborne (https://www.european-coatings.com/news/markets-companies/water-borne-coatings-a-steady-stream-of-developments/)

### New Structural Issues

| # | ID | Severity | Type | Description |
|---|-----|----------|------|-------------|
| 3 | iss-DPW-003 | info | dpp_readiness | AkzoNobel, PPG/Dulux, and Jotun publish EN 15804+A2 EPDs for decorative paints. Despite 2035+ DPP horizon, EPD infrastructure is surprisingly mature among market leaders. VOC data already generated under Decopaint Directive and national schemes (French A+, German AgBB). |
| 4 | iss-DPW-004 | warning | cross_regulatory | Decopaint Directive 2004/42/EC + French A+ + German AgBB + EU Ecolabel create fragmented VOC regulatory landscape. CPR SReq must harmonise these into single framework. Most complex cross-regulatory paint regulation environment of any new CPR family. |
| 5 | iss-DPW-005 | info | market_context | European paints & coatings $38.7B (2024), decorative 45%. ~80% now waterborne. CEPE (est. 1951) is sole EU trade association. Bio-based coatings emerging. Wall paint is largest construction chemical segment — currently linear waste process. |

### Supplementary Quality Checklist

- [x] 6 wide-scope web searches completed
- [x] European decorative paints market sized ($38.7B total, decorative 45%)
- [x] EPD coverage assessed (AkzoNobel, PPG/Dulux, Jotun — surprisingly mature)
- [x] Decopaint Directive and national VOC schemes documented (French A+, German AgBB)
- [x] Paint circular economy and reuse programmes documented
- [x] CEN/TC 139 standards landscape assessed (test methods only, no CPR hEN)
- [x] CEPE industry position and waterborne transition documented
- [x] All findings connected to explicit sources with URLs
