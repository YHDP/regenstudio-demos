#!/usr/bin/env python3
"""
Batches 11-14/19: KAS(6) + FIX(7) + ADH(6) + SEA(4) + FPP(7) + SHA(5) = 35 issues total.

KAS:
  iss-KAS-001: Populate key_risks, sources_summary, standards_development, stakeholder_notes
  iss-KAS-002: EAD 340033 cross-family note → standards_landscape
  iss-KAS-003: PA 36 ladder overlap → standards_landscape
  iss-KAS-004: EPD readiness 50:1 gap → key_risks
  iss-KAS-005: Market context → stakeholder_notes
  iss-KAS-006: Kit DPP 3-layer architecture → key_risks

FIX:
  iss-FIX-001: Fix standards_summary.source → "0 hENs + 34 EADs"
  iss-FIX-002: Populate key_risks, sources_summary, standards_landscape, standards_development, stakeholder_notes
  iss-FIX-003: EAD 330031 cross-family → standards_landscape
  iss-FIX-004: EAD transition bottleneck → key_risks
  iss-FIX-005: CBAM + machine-readable EADs → stakeholder_notes
  iss-FIX-006: EPD readiness concentrated → key_risks
  iss-FIX-007: Seismic C1/C2 safety-critical → key_risks

ADH:
  iss-ADH-001: Populate key_risks, sources_summary, standards_landscape, standards_development, stakeholder_notes
  iss-ADH-002: EN 12004-1 AVCP mismatch → key_risks
  iss-ADH-003: Scope gap (EN 12860 etc.) → stakeholder_notes
  iss-ADH-004: FEICA Model EPDs → stakeholder_notes
  iss-ADH-005: REACH diisocyanate → key_risks
  iss-ADH-006: Market expansion → stakeholder_notes

SEA:
  iss-SEA-001: Populate key_risks, sources_summary, standards_landscape, standards_development, stakeholder_notes
  iss-SEA-002: FEICA shared EPD infra → stakeholder_notes
  iss-SEA-003: VOC + REACH compound burden → key_risks
  iss-SEA-004: Market context → stakeholder_notes

FPP:
  iss-FPP-001: Timeline gap EAD expiry → key_risks
  iss-FPP-002: Populate standards_landscape, standards_development, key_risks, sources_summary, stakeholder_notes
  iss-FPP-003: EAD-only bellwether → stakeholder_notes
  iss-FPP-004: PFAS broader restriction → key_risks
  iss-FPP-005: Split EPD readiness → stakeholder_notes
  iss-FPP-006: Dual chemical reformulation → key_risks
  iss-FPP-007: Hilti BIM/digital → stakeholder_notes

SHA:
  iss-SHA-001: Populate standards_development, stakeholder_notes, key_risks, sources_summary
  iss-SHA-002: EN 16510-2-7 harmonization → standard content
  iss-SHA-003: Triple regulation → key_risks
  iss-SHA-004: CEFACD SME crisis → key_risks
  iss-SHA-005: Zero stove EPDs → key_risks
"""

import json, sys, os

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'families-v2.json')

def find_family(data, letter):
    for fam in data['families']:
        if fam.get('letter') == letter:
            return fam
    return None

def find_std(fam, std_id):
    for s in fam.get('standards', []):
        if s.get('id') == std_id:
            return s
    return None

def ensure_content(std):
    if 'content' not in std:
        std['content'] = {}
    return std['content']

def set_if_empty(content, field, value):
    """Set a content field only if it's currently empty string."""
    assert content.get(field, '') == '', f'{field} not empty: {content.get(field, "")[:50]}'
    content[field] = value

def append_content(content, field, text):
    """Append text to a content field with space separator."""
    existing = content.get(field, '')
    content[field] = existing + (' ' if existing else '') + text

def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    issues_count = 0

    # ===================== KAS =====================
    kas = find_family(data, 'KAS')
    assert kas, 'KAS not found'

    # iss-KAS-001: Populate key_risks, sources_summary, standards_development, stakeholder_notes
    set_if_empty(kas['content'], 'key_risks',
        "(1) Kit/system DPP compound architecture: 3-layer data challenge "
        "(component → system → building level). EC feasibility study has limited "
        "kit-specific guidance. Most complex DPP challenge of any CPR family. "
        "(2) ETICS EPD gap: only ~15 ETICS EPDs vs 798 ETAs issued (50:1 gap). "
        "Kit LCA complexity (insulation + adhesive + mesh + render + fixings) "
        "makes EPD system boundaries particularly challenging. "
        "(3) EAD transition scale: 36 EADs expire 9 Jan 2031 — among the "
        "largest EAD portfolios requiring transition."
    )
    set_if_empty(kas['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "EOTA EAD database [S144]; EAE (European Association for ETICS). "
        "EC DPP feasibility study."
    )
    set_if_empty(kas['content'], 'standards_development',
        "CEN/TC 88 (thermal insulation) and multiple component TCs involved. "
        "Kit standards require coordination across insulation, adhesive, mesh, "
        "render, and fixing standards — no single TC controls the full kit scope."
    )
    set_if_empty(kas['content'], 'stakeholder_notes',
        "ETICS market \u20ac7.7B (2023) \u2192 \u20ac12.2B by 2031 (CAGR 5.9%). "
        "Prefab market \u20ac78B (2025) \u2192 \u20ac109.3B by 2030 (CAGR 7%). "
        "Combined KAS among the largest CPR families by market value. "
        "Renovation Wave is a major demand driver for ETICS."
    )
    issues_count += 1
    print('  iss-KAS-001: 4 content fields populated')

    # iss-KAS-002: EAD 340033 cross-family note
    append_content(kas['content'], 'standards_landscape',
        "EAD 340033 (prefab chimney kits with flue liner) overlaps with the CHI "
        "family \u2014 cross-family data consistency should be verified."
    )
    issues_count += 1
    print('  iss-KAS-002: EAD 340033 cross-family note added')

    # iss-KAS-003: PA 36 ladder overlap
    append_content(kas['content'], 'standards_landscape',
        "COM(2025) 772 lists PA 36 (attached ladders) under KAS \u2014 potential "
        "overlap with LAD family. Verify scope boundaries when SReq defined."
    )
    issues_count += 1
    print('  iss-KAS-003: PA 36 cross-family note added')

    # iss-KAS-004: EPD readiness (already in key_risks from iss-KAS-001)
    issues_count += 1
    print('  iss-KAS-004: EPD readiness covered in key_risks')

    # iss-KAS-005: Market context (already in stakeholder_notes from iss-KAS-001)
    issues_count += 1
    print('  iss-KAS-005: market context covered in stakeholder_notes')

    # iss-KAS-006: Kit DPP 3-layer (already in key_risks from iss-KAS-001)
    issues_count += 1
    print('  iss-KAS-006: kit DPP complexity covered in key_risks')

    kas['updated'] = '2026-03-02'
    print(f'  KAS: {issues_count} issues processed')

    # ===================== FIX =====================
    fix = find_family(data, 'FIX')
    assert fix, 'FIX not found'
    fix_count = 0

    # iss-FIX-001: Fix standards_summary.source
    ss = fix.get('standards_summary', {})
    if ss and 'source' in ss:
        old_src = ss['source']
        if '0 hENs + EADs' in old_src and '34 EADs' not in old_src:
            ss['source'] = old_src.replace('0 hENs + EADs', '0 hENs + 34 EADs')
            print('  iss-FIX-001: standards_summary.source corrected to include 34 EADs')
        else:
            print('  iss-FIX-001: source text already correct or different format')
    fix_count += 1

    # iss-FIX-002: Populate 5 empty content fields
    set_if_empty(fix['content'], 'key_risks',
        "(1) EAD transition bottleneck: ~400 EADs across all families vs ~25/yr "
        "EOTA publishing rate = 16 years needed vs 3-year window. Industry warns "
        "of 'innovation freeze' and return to national MS assessments. Systemic "
        "risk for all EAD-heavy families. "
        "(2) Seismic performance categories C1/C2 (ETAG 001 Annex E) are "
        "safety-critical DPP data fields \u2014 using C1 where C2 required = "
        "structural failure risk in earthquake zones."
    )
    set_if_empty(fix['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "EOTA EAD database [S144]; EOTA transition guidance [S98]. "
        "CFE trade press (EAD bottleneck analysis). EN 1992-4 (Eurocode 2 Part 4)."
    )
    set_if_empty(fix['content'], 'standards_landscape',
        "EAD-only family: 0 hENs, 34 EADs for post-installed fasteners. "
        "5,500+ ETAs issued \u2014 the largest ETA market segment. "
        "All under EOTA working area, primarily based on former ETAG 001."
    )
    set_if_empty(fix['content'], 'standards_development',
        "No harmonised product standards under development. Product assessment "
        "is entirely via EAD/ETA route. EN 1992-4:2018 (Eurocode 2 Part 4) "
        "provides design rules that depend on ETA performance data. "
        "New CPR requires machine-readable EAD format for BIM/DPP integration."
    )
    set_if_empty(fix['content'], 'stakeholder_notes',
        "EPD readiness highly concentrated: Hilti has ~300 product declarations "
        "including EPDs. Fischer and W\u00fcrth have no visible EPD programmes. "
        "c-PCRs (complementary Product Category Rules) for fixings LCA under "
        "development."
    )
    fix_count += 1
    print('  iss-FIX-002: 5 content fields populated')

    # iss-FIX-003: EAD 330031 cross-family
    append_content(fix['content'], 'standards_landscape',
        "EAD 330031 (plastic anchors for ETICS) connects to KAS family \u2014 "
        "cross-family tracking needed for ETICS kit/fastener coordination."
    )
    fix_count += 1
    print('  iss-FIX-003: cross-family note added')

    # iss-FIX-004: EAD bottleneck (already in key_risks)
    fix_count += 1
    print('  iss-FIX-004: EAD bottleneck covered in key_risks')

    # iss-FIX-005: CBAM + machine-readable EADs
    append_content(fix['content'], 'stakeholder_notes',
        "CBAM applies to imported steel fasteners from Jan 2026. "
        "New CPR requires machine-readable EAD format \u2014 enabling BIM and "
        "DPP data integration for the 5,500+ active ETAs."
    )
    fix_count += 1
    print('  iss-FIX-005: CBAM and machine-readable EADs noted')

    # iss-FIX-006: EPD readiness concentrated (already in stakeholder_notes)
    fix_count += 1
    print('  iss-FIX-006: EPD concentration covered in stakeholder_notes')

    # iss-FIX-007: Seismic C1/C2 (already in key_risks)
    fix_count += 1
    print('  iss-FIX-007: seismic safety covered in key_risks')

    fix['updated'] = '2026-03-02'
    issues_count += fix_count
    print(f'  FIX: {fix_count} issues processed')

    # ===================== ADH =====================
    adh = find_family(data, 'ADH')
    assert adh, 'ADH not found'
    adh_count = 0

    # iss-ADH-001: Populate 5 empty content fields
    set_if_empty(adh['content'], 'key_risks',
        "(1) EN 12004-1 AVCP mismatch: ADH lists System 3, CMG lists System 3/4 "
        "\u2014 6th cross-family AVCP discrepancy identified. Verify against "
        "Commission Decision for PA 25/26. "
        "(2) REACH diisocyanate restriction (Aug 2023): PU adhesives with >0.1% "
        "require mandatory user training. DPP must declare diisocyanate content "
        "and training requirements. Market shifting to non-PU alternatives. "
        "(3) CEN/TC 351 dangerous substances horizontal SReq affects adhesive "
        "formulations (VOCs, formaldehyde, isocyanates)."
    )
    set_if_empty(adh['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. FEICA Model EPD programme. "
        "Deutsche Bauchemie CPR position papers."
    )
    set_if_empty(adh['content'], 'standards_landscape',
        "2 hENs (EN 12004-1, EN 12004-2) under CEN/TC 67. Current ADH scope "
        "covers only tile adhesives \u2014 a fraction of the \u20ac19.9B European "
        "adhesives/sealants market. Future SReq (2029) could expand to "
        "floor covering, structural bonding, and gypsum adhesives."
    )
    set_if_empty(adh['content'], 'standards_development',
        "No active revisions of EN 12004 series under new CPR scope. "
        "Awaiting SReq (targeted 2029) which may significantly expand product scope "
        "beyond tile adhesives to include EN 12860 (gypsum adhesives), structural "
        "bonding, and floor covering adhesives."
    )
    set_if_empty(adh['content'], 'stakeholder_notes',
        "FEICA Model EPDs (since 2016, updated 2022/2024 with IVK, Deutsche "
        "Bauchemie, EFCC): formulation-based, EN 15804+A2 verified, covering "
        "~800 companies (90% SME). Sika has product-specific EPDs since 2012. "
        "ADH among the most DPP-ready families via collective FEICA approach. "
        "Deutsche Bauchemie: 140 members, \u20ac4.6B sales, active on CPR policy."
    )
    adh_count += 1
    print('  iss-ADH-001: 5 content fields populated')

    # iss-ADH-002: AVCP mismatch (already in key_risks)
    adh_count += 1
    print('  iss-ADH-002: AVCP mismatch covered in key_risks')

    # iss-ADH-003: Scope gap
    append_content(adh['content'], 'stakeholder_notes',
        "content.about references EN 12860 (gypsum adhesives), structural bonding, "
        "and floor covering adhesives \u2014 none currently tracked in standards[]. "
        "Review scope alignment when M-I (2027) defines product scope."
    )
    adh_count += 1
    print('  iss-ADH-003: scope gap noted')

    # iss-ADH-004: FEICA (already in stakeholder_notes)
    adh_count += 1
    print('  iss-ADH-004: FEICA covered in stakeholder_notes')

    # iss-ADH-005: REACH diisocyanate (already in key_risks)
    adh_count += 1
    print('  iss-ADH-005: REACH diisocyanate covered in key_risks')

    # iss-ADH-006: Market expansion
    append_content(adh['content'], 'stakeholder_notes',
        "Global tile adhesive market $3.6B, flooring adhesive $5.6B. "
        "SReq scope expansion could significantly increase ADH's regulatory footprint."
    )
    adh_count += 1
    print('  iss-ADH-006: market expansion context added')

    adh['updated'] = '2026-03-02'
    issues_count += adh_count
    print(f'  ADH: {adh_count} issues processed')

    # ===================== SEA =====================
    sea = find_family(data, 'SEA')
    assert sea, 'SEA not found'
    sea_count = 0

    # iss-SEA-001: Populate 5 empty content fields
    set_if_empty(sea['content'], 'key_risks',
        "(1) VOC + REACH SVHC (isocyanates for PU, phthalates) + CEN/TC 351 "
        "dangerous substances = compound regulatory burden. DPP must declare "
        "VOC emission class, SVHC content, indoor air quality data. "
        "(2) Market material transition: MS polymer hybrids replacing traditional "
        "PU and silicone sealants \u2014 reformulated products may need new test data."
    )
    set_if_empty(sea['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. FEICA Model EPD programme."
    )
    set_if_empty(sea['content'], 'standards_landscape',
        "5 hENs (EN 15651 series parts 1\u20135) all within CEN/TC 349 \u2014 "
        "the cleanest single-TC family. No cross-family standards. "
        "Standards dated 2012\u20132017, no active revisions, awaiting SReq (2029)."
    )
    set_if_empty(sea['content'], 'standards_development',
        "No active revisions of EN 15651 series. CEN/TC 349 awaiting SReq "
        "(targeted 2029). All 5 hENs are mature standards with established "
        "test methods and industry familiarity."
    )
    set_if_empty(sea['content'], 'stakeholder_notes',
        "FEICA Model EPD system: 21 published third-party verified EPDs per "
        "EN 15804+A2 for sealant formulations. Shared DPP infrastructure with ADH. "
        "Covers ~800 companies, 90% SME. European construction A&S market "
        "$4.78B (2024), CAGR 5.69%. Silicone largest share, MS polymer "
        "fastest-growing. Soudal is world's largest independent sealant manufacturer."
    )
    sea_count += 1
    print('  iss-SEA-001: 5 content fields populated')

    # iss-SEA-002: FEICA shared EPD (already in stakeholder_notes)
    sea_count += 1
    print('  iss-SEA-002: FEICA shared infra covered in stakeholder_notes')

    # iss-SEA-003: VOC + REACH (already in key_risks)
    sea_count += 1
    print('  iss-SEA-003: VOC/REACH compound burden covered in key_risks')

    # iss-SEA-004: Market context (already in stakeholder_notes)
    sea_count += 1
    print('  iss-SEA-004: market context covered in stakeholder_notes')

    sea['updated'] = '2026-03-02'
    issues_count += sea_count
    print(f'  SEA: {sea_count} issues processed')

    # ===================== FPP =====================
    fpp = find_family(data, 'FPP')
    assert fpp, 'FPP not found'
    fpp_count = 0

    # iss-FPP-002: Populate from deep-dive §8 proposed text
    set_if_empty(fpp['content'], 'standards_landscape',
        "FPP is an EAD-only family: no hENs. 6 EADs cover fire stopping "
        "(penetration seals, linear joint/gap seals), fire sealing (intumescent "
        "products), fire protective products (reactive coatings for structural "
        "steel), and fire retardant treatments. All based on former ETAGs 018 "
        "and 026. Over 800 ETAs have been issued. AVCP System 1 for all products. "
        "CEN/TC 127 develops fire test methods (EN 13381, EN 1366, EN 1634 series) "
        "but not product standards under CPR."
    )
    set_if_empty(fpp['content'], 'standards_development',
        "No harmonised product standards under development. CEN/TC 127 continues "
        "fire safety test method work (EN 13501 series). Product standardisation "
        "for fire stopping/sealing would be new territory \u2014 currently all "
        "market access is via EAD/ETA route."
    )
    set_if_empty(fpp['content'], 'key_risks',
        "(1) Timeline gap: EADs expire 9 Jan 2031 but SReq not planned until "
        "2029. Only ~2 years for the full SReq\u2192development\u2192citation "
        "cycle \u2014 typically 3\u20134 years. ETA backstop to 2036 mitigates "
        "but new ETA issuance stops in 2031. "
        "(2) EAD-only dependency: FPP has no hEN fallback. If hEN route doesn't "
        "materialise in time, products face a regulatory gap. "
        "(3) PFAS exposure: EU PFAS restriction may affect EAD 350865 (fire "
        "retardants). ECHA SEAC consultation spring 2026, final opinions end 2026. "
        "(4) Dual chemical reformulation pressure: PFAS + ECHA brominated flame "
        "retardant restriction (pending). Reformulated products may require new ETAs. "
        "(5) CEN/TC 127 develops test methods, not product standards \u2014 "
        "capacity for product standardisation under new CPR is untested."
    )
    set_if_empty(fpp['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "EOTA EAD database [S144]. ETAG 018/026: former guidelines used as EADs. "
        "Regulation (EU) 2025/1988 (PFAS)."
    )
    set_if_empty(fpp['content'], 'stakeholder_notes',
        "Fire stopping market $1.7B (2024), CAGR 8.9%, Europe >30%. "
        "800+ active ETAs confirmed by EOTA. "
        "FPP is the bellwether for EAD-only family transition under CPR 2024/3110 "
        "\u2014 lessons will inform FIX, KAS, and other EAD-heavy families."
    )
    fpp_count += 1
    print('  iss-FPP-002: 5 content fields populated')

    # iss-FPP-001: Timeline gap (already in key_risks)
    fpp_count += 1
    print('  iss-FPP-001: timeline gap covered in key_risks')

    # iss-FPP-003: Bellwether note (already in stakeholder_notes)
    fpp_count += 1
    print('  iss-FPP-003: bellwether role covered in stakeholder_notes')

    # iss-FPP-004: PFAS broader (already in key_risks)
    fpp_count += 1
    print('  iss-FPP-004: PFAS restriction covered in key_risks')

    # iss-FPP-005: Split EPD readiness
    append_content(fpp['content'], 'stakeholder_notes',
        "Split EPD readiness: intumescent coatings have EPDs (Nullifire SC802\u2013804, "
        "Sherwin-Williams Firetex M71V2, Rudolf Hensel 410KS\u2013421KS). "
        "Penetration seals and linear gap seals likely lack EPDs."
    )
    fpp_count += 1
    print('  iss-FPP-005: split EPD readiness noted')

    # iss-FPP-006: Dual chemical reformulation (already in key_risks)
    fpp_count += 1
    print('  iss-FPP-006: dual reformulation covered in key_risks')

    # iss-FPP-007: Hilti BIM/digital
    append_content(fpp['content'], 'stakeholder_notes',
        "Hilti BIM/digital infrastructure (Button for Firestop, Documentation "
        "Manager, NBS Source CFS-CT, CAD/BIM Typicals) demonstrates fire stopping "
        "products can be structured digitally \u2014 DPP data architecture "
        "groundwork from digital-ready manufacturers."
    )
    fpp_count += 1
    print('  iss-FPP-007: Hilti digital readiness noted')

    fpp['updated'] = '2026-03-02'
    issues_count += fpp_count
    print(f'  FPP: {fpp_count} issues processed')

    # ===================== SHA =====================
    sha = find_family(data, 'SHA')
    assert sha, 'SHA not found'
    sha_count = 0

    # iss-SHA-001: Populate 4 empty content fields
    set_if_empty(sha['content'], 'key_risks',
        "(1) Triple regulation: CPR 2024/3110 + Ecodesign 2015/1185 revision "
        "+ ESPR 2024/1781 create dual DPP obligation risk. EC identified "
        "CPR/Ecodesign discrepancies for solid fuel appliances \u2014 resolution "
        "pending. "
        "(2) CEFACD warns sector crisis: ~11,000 SMEs and 200,000 jobs at risk. "
        "No Notified Bodies in Europe notified for EN 16510 conformity assessment. "
        "July 2027 Ecodesign compliance date 'completely unrealistic.' "
        "European Parliament question E-000487/2025 raised. "
        "(3) Zero stove EPDs found under EN 15804 \u2014 industry focuses on "
        "Ecodesign energy labelling (A++ to G), not lifecycle environmental "
        "declarations. DPP GWP data requires entirely new LCA capability."
    )
    set_if_empty(sha['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. Implementing Decision (EU) 2026/284 "
        "(EN 16510-2-7 harmonization). CEFACD position papers. "
        "Ecodesign 2015/1185 revision consultation (Dec 2025)."
    )
    set_if_empty(sha['content'], 'standards_development',
        "EN 16510 series (9 parts) took effect 9 Nov 2025, replacing 5 older "
        "standards (EN 13240, 13229, 12815, 12809, 14785). Manufacturers must "
        "re-test entire portfolios. EN 16510-2-7:2025 harmonized via "
        "Implementing Decision (EU) 2026/284 (OJ 9 Feb 2026) \u2014 coexistence "
        "with EN 13240:2001 and EN 14785:2006 ends 9 Feb 2027."
    )
    set_if_empty(sha['content'], 'stakeholder_notes',
        "Pellet stove market: Europe $430M (2025), 58.9% global share, "
        "Germany 28.3%. Biomass accounts for ~59% of EU renewable energy "
        "consumption \u2014 strategic context for SHA. SHA is one of the few "
        "families at the direct CPR/ESPR intersection."
    )
    sha_count += 1
    print('  iss-SHA-001: 4 content fields populated')

    # iss-SHA-002: EN 16510-2-7 standard content
    en16510_27 = find_std(sha, 'EN 16510-2-7')
    if en16510_27:
        c = ensure_content(en16510_27)
        c['regulatory_history'] = (
            "Harmonized via Implementing Decision (EU) 2026/284 (OJ 9 Feb 2026). "
            "Coexistence with EN 13240:2001 and EN 14785:2006 ends 9 Feb 2027. "
            "Part of the EN 16510 series replacing 5 legacy stove standards."
        )
        c['status_narrative'] = (
            "Published 2025, OJ-cited Feb 2026. Covers roomheaters fired by "
            "wood pellets. Coexistence period with legacy standards until Feb 2027."
        )
        sha_count += 1
        print('  iss-SHA-002: EN 16510-2-7 standard content set')
    else:
        print('  iss-SHA-002: EN 16510-2-7 not found (skipped)')
        sha_count += 1

    # iss-SHA-003: Triple regulation (already in key_risks)
    sha_count += 1
    print('  iss-SHA-003: triple regulation covered in key_risks')

    # iss-SHA-004: CEFACD warning (already in key_risks)
    sha_count += 1
    print('  iss-SHA-004: CEFACD warning covered in key_risks')

    # iss-SHA-005: Zero stove EPDs (already in key_risks)
    sha_count += 1
    print('  iss-SHA-005: zero EPDs covered in key_risks')

    sha['updated'] = '2026-03-02'
    issues_count += sha_count
    print(f'  SHA: {sha_count} issues processed')

    # === WRITE BACK ===
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    # === VALIDATE ===
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        v = json.load(f)

    for letter in ['KAS', 'FIX', 'ADH', 'SEA', 'FPP', 'SHA']:
        fam = find_family(v, letter)
        assert fam['content']['key_risks'] != '', f'{letter} key_risks empty'
        assert fam['content']['sources_summary'] != '', f'{letter} sources_summary empty'
        print(f'  {letter} validation PASSED')

    # Verify FIX standards_summary fix
    fix_v = find_family(v, 'FIX')
    assert '34 EADs' in fix_v['standards_summary']['source'], 'FIX source not fixed'
    print('  FIX standards_summary.source fix VERIFIED')

    # Verify SHA EN 16510-2-7 standard content
    sha_v = find_family(v, 'SHA')
    for s in sha_v['standards']:
        if s.get('id') == 'EN 16510-2-7':
            assert 'content' in s, 'EN 16510-2-7 has no content'
            assert '2026/284' in s['content'].get('regulatory_history', ''), 'EN 16510-2-7 missing 2026/284'
            print('  SHA EN 16510-2-7 content VERIFIED')
            break

    print(f'\nBatches 11-14 complete: {issues_count} issues processed across 6 families')

if __name__ == '__main__':
    main()
