#!/usr/bin/env python3
"""
Batches 15-18/19: WCF(5) + GYP(4) + WWD(4) + WBP(9) + MEM(4) + GEO(4)
                + SAP(4) + PTA(4) + CAB(4) + DWP(6) + DPW(5) = 53 issues total.

WCF:
  iss-WCF-001: Populate standards_development, key_risks, sources_summary
  iss-WCF-002: EN 14509 cross-family → standards_landscape
  iss-WCF-003: EU facade fire test → key_risks
  iss-WCF-004: Split EPD readiness → stakeholder_notes
  iss-WCF-005: Market context → stakeholder_notes

GYP:
  iss-GYP-001: Populate standards_landscape, standards_development, key_risks, sources_summary
  iss-GYP-002: Big-3 EPD readiness → stakeholder_notes
  iss-GYP-003: FGD gypsum decline → key_risks
  iss-GYP-004: Market context → stakeholder_notes

WWD:
  iss-WWD-001: Populate standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary
  iss-WWD-002: UWWTD recast → key_risks
  iss-WWD-003: EPD readiness minimal → stakeholder_notes
  iss-WWD-004: Market context → stakeholder_notes

WBP:
  iss-WBP-001: Populate standards_landscape, standards_development, sreq_analysis, stakeholder_notes, key_risks, sources_summary
  iss-WBP-002: Acquis=Yes but empty milestones → sreq_analysis
  iss-WBP-003: REACH E0.5 formaldehyde → key_risks
  iss-WBP-004: STP/WBP merger → sreq_analysis
  iss-WBP-005: SG 20 3-year minimum → stakeholder_notes
  iss-WBP-006: Priority 16 fast-track → stakeholder_notes
  iss-WBP-007: EPD readiness disparity → stakeholder_notes
  iss-WBP-008: Triple formaldehyde regulation → key_risks
  iss-WBP-009: Waste wood classification → key_risks

MEM:
  iss-MEM-001: Populate standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary
  iss-MEM-002: EPD readiness + prEN 17388-2 → stakeholder_notes
  iss-MEM-003: Circular economy by material → stakeholder_notes
  iss-MEM-004: Market context → stakeholder_notes

GEO:
  iss-GEO-001: Populate standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary
  iss-GEO-002: Geogrid-only EPDs → stakeholder_notes
  iss-GEO-003: PFAS dual pressure → key_risks
  iss-GEO-004: Market context → stakeholder_notes

SAP:
  iss-SAP-001: Populate standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary
  iss-SAP-002: V&B/Duravit EPD readiness → stakeholder_notes
  iss-SAP-003: European Water Label → key_risks
  iss-SAP-004: Market context → stakeholder_notes

PTA:
  iss-PTA-001: Populate standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary
  iss-PTA-002: TEPPFA/VinylPlus DPP foundation → stakeholder_notes
  iss-PTA-003: Triple microplastics regulation → key_risks
  iss-PTA-004: Market context → stakeholder_notes

CAB:
  iss-CAB-001: Populate standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary
  iss-CAB-002: Prysmian/Nexans EPDs → stakeholder_notes
  iss-CAB-003: REACH lead + PFAS on cables → key_risks
  iss-CAB-004: Market context → stakeholder_notes

DWP:
  iss-DWP-001: Populate standards_landscape, standards_development, sreq_analysis, stakeholder_notes, key_risks, sources_summary
  iss-DWP-002: Fix null standards_summary
  iss-DWP-003: DWD 2020/2184 parallel → key_risks
  iss-DWP-004: DWD more advanced than CPR → key_risks
  iss-DWP-005: EPD overlap with PTA → stakeholder_notes
  iss-DWP-006: Market context + PFAS → stakeholder_notes

DPW:
  iss-DPW-001: Populate standards_landscape, standards_development, stakeholder_notes, key_risks, sources_summary
  iss-DPW-002: Fix null standards_summary
  iss-DPW-003: Paint EPD readiness → stakeholder_notes
  iss-DPW-004: Fragmented VOC regulation → key_risks
  iss-DPW-005: Market context → stakeholder_notes
"""

import json, sys, os

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'families-v2.json')

def find_family(data, letter):
    for fam in data['families']:
        if fam.get('letter') == letter:
            return fam
    return None

def set_if_empty(content, field, value):
    assert content.get(field, '') == '', f'{field} not empty: {content.get(field, "")[:80]}'
    content[field] = value

def append_content(content, field, text):
    existing = content.get(field, '')
    content[field] = existing + (' ' if existing else '') + text

def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total = 0

    # ===================== WCF =====================
    wcf = find_family(data, 'WCF')
    assert wcf, 'WCF not found'
    n = 0

    # iss-WCF-001: Populate 3 empty sections (deep-dive §8 proposed text)
    set_if_empty(wcf['content'], 'key_risks',
        "(1) Post-Grenfell fire testing: new EU facade fire test standard "
        "(temperature-based measurement) effective Jan 2026 \u2014 may reshape "
        "technical requirements for external wall finishes. "
        "(2) Fragmentation: 3 TCs (128, 99, 241) complicates standards coordination. "
        "(3) EN 14509 (sandwich panels) cross-family consistency with SMP and ROC."
    )
    set_if_empty(wcf['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]."
    )
    set_if_empty(wcf['content'], 'standards_development',
        "22 hENs, 0 EADs. Pipeline A only. No active CPR-relevant revisions "
        "found. Awaiting SReq. Post-Grenfell facade fire test standard "
        "(effective Jan 2026) may drive future requirements for external "
        "wall finishing products."
    )
    n += 1
    print('  iss-WCF-001: 3 content fields populated')

    # iss-WCF-002: EN 14509 cross-family
    append_content(wcf['content'], 'standards_landscape',
        "EN 14509 (sandwich panels) is cross-listed in SMP, ROC, and WCF "
        "\u2014 data consistency should be verified across all three families."
    )
    n += 1
    print('  iss-WCF-002: EN 14509 cross-family noted')

    # iss-WCF-003: Facade fire test (already in key_risks)
    n += 1
    print('  iss-WCF-003: facade fire test covered in key_risks')

    # iss-WCF-004 + iss-WCF-005: Split EPD readiness + market context → stakeholder_notes
    append_content(wcf['content'], 'stakeholder_notes',
        "Split EPD readiness: fibre-cement excellent (James Hardie >90%, Etex Cedral), "
        "suspended ceilings good (Knauf AMF), gypsum established. Metal/stone cladding, "
        "HPL, render/plaster less visible. European cladding market $57.23B (2024), "
        "facade $7B, plasterboard $7.1B. Ventilated facade systems 51% of facade revenue. "
        "EPBD recast driving demand for energy-efficient facade solutions."
    )
    n += 2
    print('  iss-WCF-004/005: EPD readiness and market context added')

    wcf['updated'] = '2026-03-02'
    total += n
    print(f'  WCF: {n} issues processed')

    # ===================== GYP =====================
    gyp = find_family(data, 'GYP')
    assert gyp, 'GYP not found'
    n = 0

    # iss-GYP-001: Populate 4 empty sections
    set_if_empty(gyp['content'], 'standards_landscape',
        "14 hENs, all under sole TC CEN/TC 241. Self-contained family with no "
        "cross-TC dependencies. EN 520:2004+A1:2009 achieves Euroclass A2-s1,d0 "
        "WITHOUT additional testing (CWFT) if paper liner \u2264220 g/m\u00b2 and "
        "core classified A1 \u2014 unique in CPR."
    )
    set_if_empty(gyp['content'], 'standards_development',
        "No active CPR-relevant revisions. Single-TC structure (CEN/TC 241) "
        "simplifies standards coordination vs multi-TC families. "
        "EN 14190 (reprocessed gypsum) is one of the few hENs explicitly "
        "covering recycled materials. Latest SReq target in COM(2025) 772 "
        "Batch 4 (2028)."
    )
    set_if_empty(gyp['content'], 'key_risks',
        "(1) FGD gypsum supply declining: >50% of German supply (~4 Mt/yr) "
        "from coal power plant flue gas desulphurisation. German coal phase-out "
        "target 2038 will sharply reduce supply. Plasterboard plants built "
        "adjacent to power stations will become 'orphans'. "
        "(2) Raw material source (natural, FGD, recycled) is an emerging DPP "
        "data attribute \u2014 recycled gypsum market projected $3.21B by 2030."
    )
    set_if_empty(gyp['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. Eurogypsum data. G-to-G EU project."
    )
    n += 1
    print('  iss-GYP-001: 4 content fields populated')

    # iss-GYP-002 + iss-GYP-004: EPD readiness + market context → stakeholder_notes
    append_content(gyp['content'], 'stakeholder_notes',
        "Big-3 (Knauf, Saint-Gobain, Etex/Siniat) all publish EN 15804+A2 EPDs "
        "\u2014 strong DPP readiness among market leaders (~90% market share). "
        "British Gypsum: Gyproc SoundBloc Infinaé 100% recycled plasterboard "
        "(Jan 2025). Siniat: RECYPLAC 100% recycled gypsum plasterboard (Jul 2025). "
        "European plasterboard market $7.10B (2023), CAGR 7.09%. Growth driven by "
        "EPBD renovation wave, fire safety, acoustic performance, modular construction. "
        "Eurogypsum positions gypsum as 'eternally recyclable'."
    )
    n += 2
    print('  iss-GYP-002/004: EPD readiness and market context added')

    # iss-GYP-003: FGD gypsum decline (already in key_risks)
    n += 1
    print('  iss-GYP-003: FGD gypsum decline covered in key_risks')

    gyp['updated'] = '2026-03-02'
    total += n
    print(f'  GYP: {n} issues processed')

    # ===================== WWD =====================
    wwd = find_family(data, 'WWD')
    assert wwd, 'WWD not found'
    n = 0

    # iss-WWD-001: Populate 5 empty sections (deep-dive §8 proposed text for 2)
    set_if_empty(wwd['content'], 'key_risks',
        "(1) No SReq date set \u2014 timeline uncertainty higher than families "
        "with confirmed milestones. "
        "(2) EN 12050-1 is AVCP System 4 (self-declaration) while rest of family "
        "is System 3 \u2014 mixed AVCP may complicate DPP data requirements. "
        "(3) EN 12566 series covers 5 of 8 standards \u2014 any revision delay "
        "in this series would affect most of the family. "
        "(4) UWWTD recast (EU) 2024/3019 extends coverage to 1,000 PE "
        "agglomerations (previously 2,000). Individual treatment systems must "
        "be registered. Transposition deadline 31 Jul 2027. Directly increases "
        "EN 12566 addressable market and aligns with DPP traceability."
    )
    set_if_empty(wwd['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. UWWTD recast (EU) 2024/3019."
    )
    set_if_empty(wwd['content'], 'standards_landscape',
        "8 hENs, all under sole TC CEN/TC 165. Self-contained family. "
        "EN 12566-3 requires 38-week treatment efficiency testing \u2014 one of "
        "the most rigorous CE marking programmes in CPR."
    )
    set_if_empty(wwd['content'], 'standards_development',
        "No active CPR-relevant revisions. CEN/TC 165 awaiting SReq. "
        "Standards are mature (EN 12566 series, EN 12050-1, EN 858-1, EN 1825-1). "
        "Smart monitoring (IoT sensors for treatment efficiency) and resource "
        "recovery from wastewater are emerging trends."
    )
    set_if_empty(wwd['content'], 'stakeholder_notes',
        "EPD coverage for WWD products (septic tanks, packaged treatment plants, "
        "grease/light-liquid separators) is minimal. Geberit has PE/HDPE drainage "
        "EPDs but not EN 12566 products. EN 12566 manufacturers (Klaro, BioDisc, "
        "Clearwater) appear to have no EN 15804 EPDs. European wastewater treatment "
        "services $12.35B (2024). WWD products are niche (up to 50 PE)."
    )
    n += 1
    print('  iss-WWD-001: 5 content fields populated')

    # iss-WWD-002: UWWTD (already in key_risks)
    n += 1
    print('  iss-WWD-002: UWWTD covered in key_risks')

    # iss-WWD-003: EPD readiness (already in stakeholder_notes)
    n += 1
    print('  iss-WWD-003: EPD readiness covered in stakeholder_notes')

    # iss-WWD-004: Market context (already in stakeholder_notes)
    n += 1
    print('  iss-WWD-004: market context covered in stakeholder_notes')

    wwd['updated'] = '2026-03-02'
    total += n
    print(f'  WWD: {n} issues processed')

    # ===================== WBP =====================
    wbp = find_family(data, 'WBP')
    assert wbp, 'WBP not found'
    n = 0

    # iss-WBP-001 + iss-WBP-002 + iss-WBP-004: Populate 6 empty sections
    set_if_empty(wbp['content'], 'sreq_analysis',
        "WBP has acquis=Yes but uniquely has no Table 3 milestones in "
        "COM(2025) 772. SG 20 (May 2025) indicated new standards are 'at minimum "
        "3 years away.' COM(2025) 772 merged WBP with STP workstream (STP is "
        "priority 7, WBP is priority 16). Draft SReq expected early 2026. "
        "Most timeline-uncertain acquis-classified family. WBP has fast-track "
        "available (unlike STP) but fast-track not yet initiated."
    )
    set_if_empty(wbp['content'], 'key_risks',
        "(1) Milestone gap: acquis=Yes but zero Table 3 milestones \u2014 unique "
        "among acquis-classified families. "
        "(2) REACH E0.5 (EU) 2023/1464: formaldehyde emission limit halved to "
        "0.062 mg/m\u00b3 from Aug 2026. CPR still references E1 \u2014 "
        "regulatory mismatch between REACH and CPR classifications. "
        "(3) Triple regulatory overlay: REACH E0.5 (market access, Aug 2026) + "
        "CPR dangerous substances CEN/TC 351 (15 deliverables due 31 Dec 2029) + "
        "national IAQ schemes (AgBB 2024, French A+, Belgian decree, Italian CAM). "
        "EU-LCI formaldehyde value POSTPONED pending ECHA classification. "
        "(4) Umbrella standard EN 13986 references 8+ subordinate standards \u2014 "
        "revision coordination bottleneck. Mixed AVCP (1/2+/3/4). "
        "(5) Waste wood classification NOT harmonised across EU: Italy ~95% "
        "recycled vs EU average ~25%. Direct obstacle for DPP recycled content "
        "declarations."
    )
    set_if_empty(wbp['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]; EOTA EAD database [S144]. "
        "SG 20: Standardisation Group May 2025. (EU) 2023/1464: REACH "
        "formaldehyde amendment. EPF production data."
    )
    set_if_empty(wbp['content'], 'standards_landscape',
        "4 hENs + 1 EAD under CEN/TC 112. EN 13986:2004+A1:2015 is the "
        "umbrella standard referencing 8+ subordinate product standards. "
        "Over 20 years old with no active revision. EN 13986 is cross-listed "
        "with STP family."
    )
    set_if_empty(wbp['content'], 'standards_development',
        "No active CPR revisions. STP/WBP workstreams merged in COM(2025) 772. "
        "CEN/TC 351 horizontal SReq (15 deliverables, 31 Dec 2029) includes "
        "formaldehyde test methods directly affecting EN 13986. Full CPR "
        "transition target is 2040 (gradual by product group)."
    )
    set_if_empty(wbp['content'], 'stakeholder_notes',
        "Industry readiness varies dramatically: Pfleiderer already converted "
        "all German production to E0.5, has 53.5% post-consumer recycled content "
        "(OrganicBoard Pure = 100% renewable binder + 100% recycled fibre). "
        "EGGER has IBU-verified EPDs, 66% recycled wood. Kronospan (largest EU "
        "producer) has NO EPD for particleboard or MFC. SG 20 confirmed 'at "
        "minimum 3 years' for new wood standards; full transition target 2040."
    )
    n += 3  # WBP-001 + WBP-002 + WBP-004 (merged/STP covered in sreq_analysis)
    print('  iss-WBP-001/002/004: 6 content fields populated')

    # iss-WBP-003: REACH E0.5 (already in key_risks)
    n += 1
    print('  iss-WBP-003: REACH E0.5 covered in key_risks')

    # iss-WBP-005: SG 20 3-year (already in stakeholder_notes)
    n += 1
    print('  iss-WBP-005: SG 20 timeline covered in stakeholder_notes')

    # iss-WBP-006: Priority 16 fast-track (already in sreq_analysis)
    n += 1
    print('  iss-WBP-006: priority/fast-track covered in sreq_analysis')

    # iss-WBP-007: EPD readiness disparity (already in stakeholder_notes)
    n += 1
    print('  iss-WBP-007: EPD disparity covered in stakeholder_notes')

    # iss-WBP-008: Triple formaldehyde (already in key_risks)
    n += 1
    print('  iss-WBP-008: triple regulation covered in key_risks')

    # iss-WBP-009: Waste wood classification (already in key_risks)
    n += 1
    print('  iss-WBP-009: waste wood classification covered in key_risks')

    wbp['updated'] = '2026-03-02'
    total += n
    print(f'  WBP: {n} issues processed')

    # ===================== MEM =====================
    mem = find_family(data, 'MEM')
    assert mem, 'MEM not found'
    n = 0

    # iss-MEM-001: Populate 5 empty sections (deep-dive §8 proposed text for 2)
    set_if_empty(mem['content'], 'key_risks',
        "(1) Mixed AVCP structure: System 2+ for roof membranes vs System 4 "
        "for damp proof sheets \u2014 DPP data requirements will vary by product "
        "subcategory. "
        "(2) M-I and M-III both targeted 2028 \u2014 compressed timeline if "
        "preparatory work falls behind. "
        "(3) No SReq date \u2014 adds timeline uncertainty beyond 2028."
    )
    set_if_empty(mem['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. prEN 17388-2 (membrane-specific PCR "
        "at CEN/TC 254)."
    )
    set_if_empty(mem['content'], 'standards_landscape',
        "8 hENs, 0 EADs. Self-contained under sole TC CEN/TC 254. Standards "
        "are mature (EN 13956:2012, EN 13707:2013, etc.) with no active CPR "
        "revisions. Below-ground waterproofing has national fragmentation "
        "(Germany DIN 18533 imposes additional requirements beyond EN 13967)."
    )
    set_if_empty(mem['content'], 'standards_development',
        "No active CPR revisions. prEN 17388-2 (membrane-specific PCR) under "
        "development at CEN/TC 254 \u2014 would harmonise EPD methodology across "
        "bitumen and synthetic sheets. CEN/TC 254 awaiting SReq."
    )
    set_if_empty(mem['content'], 'stakeholder_notes',
        "Market leaders publish EN 15804+A2 EPDs: Sika (SikaProof, Sikaplan), "
        "BMI Group (Icopal), Bauder, Soprema. PVC membranes: ROOFCOLLECT "
        "programme (ESWA) coordinates recovery/recycling. EPDM recycled to "
        "rubber crumb. Bitumen membranes mostly landfilled \u2014 least recyclable "
        "material in family. European market $4.6B (2024), CAGR 4.1\u20135.9%. "
        "DPP circular economy data varies dramatically by membrane material."
    )
    n += 1
    print('  iss-MEM-001: 5 content fields populated')

    # iss-MEM-002: EPD + prEN 17388-2 (already in stakeholder_notes + standards_development)
    n += 1
    print('  iss-MEM-002: EPD readiness covered in stakeholder_notes')

    # iss-MEM-003: Circular economy (already in stakeholder_notes)
    n += 1
    print('  iss-MEM-003: circular economy covered in stakeholder_notes')

    # iss-MEM-004: Market context (already in stakeholder_notes)
    n += 1
    print('  iss-MEM-004: market context covered in stakeholder_notes')

    mem['updated'] = '2026-03-02'
    total += n
    print(f'  MEM: {n} issues processed')

    # ===================== GEO =====================
    geo = find_family(data, 'GEO')
    assert geo, 'GEO not found'
    n = 0

    # iss-GEO-001: Populate 5 empty sections (deep-dive §8 proposed text for 2)
    set_if_empty(geo['content'], 'key_risks',
        "(1) M-I and M-III both targeted 2028 \u2014 compressed timeline if "
        "preparatory work falls behind. "
        "(2) No SReq date \u2014 adds timeline uncertainty beyond 2028. "
        "(3) Application-specific standards (10 separate hENs for 10 use cases) "
        "may require coordinated revision across CEN/TC 189 working groups. "
        "(4) ECHA PFAS ban creates dual pressure on HDPE geomembranes: products "
        "contain PFAS-laden leachate but some manufacturing processes use PFAS "
        "processing aids. DPP may need to declare both PFAS containment "
        "performance AND PFAS-free manufacturing status."
    )
    set_if_empty(geo['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. IGS (International Geosynthetics Society)."
    )
    set_if_empty(geo['content'], 'standards_landscape',
        "10 hENs, 0 EADs. Self-contained under sole TC CEN/TC 189 with Vienna "
        "Agreement partnership with ISO/TC 221. Standards dated 2016. "
        "Application-specific: one hEN per use case (roads, railways, tunnels, "
        "reservoirs, canals, solid waste, liquid waste, foundations, erosion, "
        "earth retaining)."
    )
    set_if_empty(geo['content'], 'standards_development',
        "No active CPR revisions. CEN/TC 189 awaiting SReq. Next TC meeting "
        "Copenhagen, 30 Jun\u20132 Jul 2026. Vienna Agreement with ISO/TC 221 "
        "may facilitate international alignment."
    )
    set_if_empty(geo['content'], 'stakeholder_notes',
        "HUESKER publishes first geogrid EPD (Fortrac T, Kiwa-verified). "
        "Naue has Secugrid EPDs. Broader portfolio (geotextiles, geomembranes, "
        "geocomposites) lacks EPD coverage. IGS claims 65% lower carbon footprint "
        "vs alternative construction materials. European market $2.94B (2025), "
        "CAGR 4.36%. Geotextiles 38.2%, GCLs fastest-growing (9.3% CAGR). "
        "Netherlands project recycled 500,000 m\u00b2 geotextiles."
    )
    n += 1
    print('  iss-GEO-001: 5 content fields populated')

    # iss-GEO-002: Geogrid EPDs (already in stakeholder_notes)
    n += 1
    print('  iss-GEO-002: geogrid EPDs covered in stakeholder_notes')

    # iss-GEO-003: PFAS dual pressure (already in key_risks)
    n += 1
    print('  iss-GEO-003: PFAS dual pressure covered in key_risks')

    # iss-GEO-004: Market context (already in stakeholder_notes)
    n += 1
    print('  iss-GEO-004: market context covered in stakeholder_notes')

    geo['updated'] = '2026-03-02'
    total += n
    print(f'  GEO: {n} issues processed')

    # ===================== SAP =====================
    sap = find_family(data, 'SAP')
    assert sap, 'SAP not found'
    n = 0

    # iss-SAP-001: Populate 4 empty sections
    set_if_empty(sap['content'], 'key_risks',
        "(1) European Water Label (voluntary, 90+ brands) may influence future "
        "CPR water efficiency essential characteristic. Water consumption data "
        "(litres/flush, litres/minute) could become mandatory DPP declaration. "
        "(2) Sanitary ceramics are difficult to recycle (high-temperature fired) "
        "\u2014 crushing for road aggregate or partial cement replacement are "
        "main options. Long product lifetime (30\u201350+ years) is itself "
        "a sustainability advantage."
    )
    set_if_empty(sap['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. European Water Label scheme."
    )
    set_if_empty(sap['content'], 'standards_development',
        "8 hENs, all within CEN/TC 163. Self-contained family. "
        "EN 997:2018 is current edition (secretariat UNI Italy). "
        "No active CPR-relevant revisions, awaiting SReq. SAP + PTA share "
        "identical milestone structure (M-I 2028, M-III 2029, no SReq date, "
        "DPP ~2033\u20132034)."
    )
    set_if_empty(sap['content'], 'stakeholder_notes',
        "Surprisingly advanced DPP readiness: Villeroy & Boch Group has 14,000+ "
        "product EPDs (V&B, Ideal Standard, Gustavsberg brands). Duravit has "
        "IBU-verified EPDs for sanitary ceramic and acrylic. Comparable to "
        "fibre-cement and flat glass as DPP-ready exemplars. European sanitary "
        "ware market $11.31B (2024), CAGR 5.2%. Ceramic dominant. AVCP System 4 "
        "(lowest verification burden)."
    )
    n += 1
    print('  iss-SAP-001: 4 content fields populated')

    # iss-SAP-002: V&B/Duravit EPDs (already in stakeholder_notes)
    n += 1
    print('  iss-SAP-002: EPD readiness covered in stakeholder_notes')

    # iss-SAP-003: Water Label (already in key_risks)
    n += 1
    print('  iss-SAP-003: Water Label covered in key_risks')

    # iss-SAP-004: Market context (already in stakeholder_notes)
    n += 1
    print('  iss-SAP-004: market context covered in stakeholder_notes')

    sap['updated'] = '2026-03-02'
    total += n
    print(f'  SAP: {n} issues processed')

    # ===================== PTA =====================
    pta = find_family(data, 'PTA')
    assert pta, 'PTA not found'
    n = 0

    # iss-PTA-001: Populate 4 empty sections
    set_if_empty(pta['content'], 'key_risks',
        "(1) Triple microplastics regulation: REACH 2023/2055 (Oct 2025) + "
        "EU 2025/2365 pellet losses (Dec 2025) + Drinking Water Directive recast "
        "(leaching/microbial standards by Dec 2026). DPP may eventually need "
        "microplastics/leaching data fields. "
        "(2) TEPPFA confirms CE marking is 'currently neither possible nor legal' "
        "for plastic piping \u2014 validates pre-CPR status. Uncited like RPS "
        "but for different reasons."
    )
    set_if_empty(pta['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. TEPPFA position papers. VinylPlus "
        "Progress Report 2025. CEN TS 18116:2025."
    )
    set_if_empty(pta['content'], 'standards_development',
        "CEN/TC 155 is one of the most productive CEN TCs. EN 1401-1:2019+A1:2023 "
        "is current edition. No active CPR-relevant revisions \u2014 standards "
        "exist but are not OJ-cited for CPR purposes. Awaiting SReq. "
        "PTA + SAP share identical milestone structure (M-I 2028, M-III 2029)."
    )
    set_if_empty(pta['content'], 'stakeholder_notes',
        "TEPPFA EPD application tool + VinylPlus 724,638 tonnes PVC recycled "
        "(2024) + CEN TS 18116:2025 (design-for-recycling) create DPP data "
        "foundation, but individual product EPDs still rare. ~50,000 tonnes "
        "recycled PVC used in new pipes annually (PVC4Pipes). European PVC pipe "
        "market ~$2.22B (2024), CAGR 5.25%. TEPPFA represents 350 companies."
    )
    n += 1
    print('  iss-PTA-001: 4 content fields populated')

    # iss-PTA-002: TEPPFA/VinylPlus (already in stakeholder_notes)
    n += 1
    print('  iss-PTA-002: TEPPFA/VinylPlus covered in stakeholder_notes')

    # iss-PTA-003: Triple microplastics (already in key_risks)
    n += 1
    print('  iss-PTA-003: triple microplastics covered in key_risks')

    # iss-PTA-004: Market context (already in stakeholder_notes)
    n += 1
    print('  iss-PTA-004: market context covered in stakeholder_notes')

    pta['updated'] = '2026-03-02'
    total += n
    print(f'  PTA: {n} issues processed')

    # ===================== CAB =====================
    cab = find_family(data, 'CAB')
    assert cab, 'CAB not found'
    n = 0

    # iss-CAB-001: Populate 4 empty sections (deep-dive §8 proposed text for 2)
    set_if_empty(cab['content'], 'key_risks',
        "(1) Latest start: M-I and M-III both 2029 \u2014 last of all 37 families. "
        "(2) Scope expansion risk: EN 50575 covers reaction to fire only. Future "
        "SReq may require dangerous substances (lead in PVC, PFAS in "
        "fluoropolymers), durability, recyclability. "
        "(3) CENELEC not CEN: unique standardisation body among CPR families "
        "\u2014 SReq process may differ. "
        "(4) Single standard: EN 50575 is sole hEN \u2014 single point of "
        "failure for the entire family. "
        "(5) REACH lead restriction on PVC cables (Nov 2024) and ECHA PFAS "
        "restriction affect fluoropolymer insulation (PTFE, FEP, ETFE)."
    )
    set_if_empty(cab['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]. Europacable publications."
    )
    set_if_empty(cab['content'], 'standards_development',
        "EN 50575:2014+A1:2016 is sole hEN under CENELEC CLC/TC 20 \u2014 "
        "unique among CPR families (all others use CEN). Covers reaction to fire "
        "classification only. No active revisions. Low Voltage Directive "
        "(2014/35/EU) creates dual-directive compliance for cables."
    )
    set_if_empty(cab['content'], 'stakeholder_notes',
        "Prysmian (PCR NPCR 027.2022) and Nexans (PCR ed4) publish EN 15804+A2 "
        "EPDs. Copper 100% recyclable, PVC recycled with 90% primary energy "
        "savings vs virgin. XLPE chemical recycling emerging (Borealis Borcycle C). "
        "Cable-specific PCR (NPCR 027) exists. European wire/cable market "
        "$36\u201363B (2024). Growth from renewables, EV charging, smart grids, "
        "EPBD building electrification. Ireland mandates LSZH; NL, DE, GR, CH "
        "require LSZH in high-risk environments."
    )
    n += 1
    print('  iss-CAB-001: 4 content fields populated')

    # iss-CAB-002: EPD readiness (already in stakeholder_notes)
    n += 1
    print('  iss-CAB-002: EPD readiness covered in stakeholder_notes')

    # iss-CAB-003: REACH/PFAS (already in key_risks)
    n += 1
    print('  iss-CAB-003: REACH/PFAS covered in key_risks')

    # iss-CAB-004: Market context (already in stakeholder_notes)
    n += 1
    print('  iss-CAB-004: market context covered in stakeholder_notes')

    cab['updated'] = '2026-03-02'
    total += n
    print(f'  CAB: {n} issues processed')

    # ===================== DWP =====================
    dwp = find_family(data, 'DWP')
    assert dwp, 'DWP not found'
    n = 0

    # iss-DWP-002: Fix null standards_summary
    if dwp.get('standards_summary') is None:
        dwp['standards_summary'] = {
            "completeness": "n/a",
            "source": "No standards exist for DWP. Regulatory pathway complicated "
                      "by parallel DWD 2020/2184 framework."
        }
        n += 1
        print('  iss-DWP-002: standards_summary fixed from null to structured value')
    else:
        n += 1
        print('  iss-DWP-002: standards_summary already set')

    # iss-DWP-001: Populate 6 empty sections (deep-dive §8 proposed text for 3)
    set_if_empty(dwp['content'], 'sreq_analysis',
        "No milestones in COM(2025) 772 Table 3 for family 29. No TC assigned. "
        "Regulatory pathway complicated by parallel DWD 2020/2184 framework which "
        "has adopted its own material approval scheme (positive lists via "
        "Implementing Decision (EU) 2024/367 and marking specifications via "
        "Delegated Regulation (EU) 2024/371). Art. 11 DWD requires coherence "
        "with CPR, but whether CPR will independently regulate these products "
        "or defer to DWD is unresolved."
    )
    set_if_empty(dwp['content'], 'key_risks',
        "(1) Regulatory jurisdiction uncertainty: CPR vs DWD 2020/2184 \u2014 "
        "unclear which framework will govern construction products in contact "
        "with drinking water. "
        "(2) No TC assigned \u2014 standardisation cannot begin until institutional "
        "responsibility is determined. "
        "(3) Zero standards, zero milestones \u2014 most timeline-uncertain "
        "family in the tracker. "
        "(4) DWD positive lists (2024/367) may preempt CPR requirements for "
        "material safety, potentially narrowing CPR scope to structural/fire "
        "performance only. "
        "(5) DWD framework far more advanced: six delegated/implementing "
        "regulations adopted April 2024, positive lists apply 31 Dec 2026 "
        "(transitional until 2032). ECHA manages substance lists."
    )
    set_if_empty(dwp['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]. "
        "DWD: Directive (EU) 2020/2184. (EU) 2024/371: DWD marking specifications. "
        "(EU) 2024/367: DWD positive lists."
    )
    set_if_empty(dwp['content'], 'standards_landscape',
        "0 hENs, 0 EADs. No product standards exist under CPR for drinking water "
        "products. The Drinking Water Directive (2020/2184) provides the primary "
        "regulatory pathway for material safety."
    )
    set_if_empty(dwp['content'], 'standards_development',
        "No TC assigned for DWP under CPR. 4MS Initiative (France, Germany, "
        "Netherlands, UK) drove EU harmonisation of drinking water contact "
        "material approvals \u2014 now ECHA-managed under DWD, not CPR. "
        "figawa confirms: all products in contact with drinking water must "
        "comply with DWD regardless of CPR status."
    )
    set_if_empty(dwp['content'], 'stakeholder_notes',
        "EPDs for drinking water pipes/fittings exist (SANHA, Uponor, REHAU, "
        "Aquatherm, Pipelife \u2014 all EN 15804+A2) but serve PTA family under "
        "CPR, not DWP specifically. Material safety data managed under DWD "
        "positive lists (ECHA), not CPR. European plastics pipe/fittings market "
        "$27.3B (2024). PFAS monitoring in EU drinking water from 12 Jan 2026. "
        "Germany requires lead pipe replacement by 12 Jan 2026. DWP is the "
        "only family where DWD may effectively subsume CPR's role."
    )
    n += 1
    print('  iss-DWP-001: 6 content fields populated')

    # iss-DWP-003 + iss-DWP-004: DWD parallel + advancement (already in key_risks + sreq_analysis)
    n += 2
    print('  iss-DWP-003/004: DWD covered in key_risks and sreq_analysis')

    # iss-DWP-005: EPD overlap with PTA (already in stakeholder_notes)
    n += 1
    print('  iss-DWP-005: EPD overlap covered in stakeholder_notes')

    # iss-DWP-006: Market context (already in stakeholder_notes)
    n += 1
    print('  iss-DWP-006: market context covered in stakeholder_notes')

    dwp['updated'] = '2026-03-02'
    total += n
    print(f'  DWP: {n} issues processed')

    # ===================== DPW =====================
    dpw = find_family(data, 'DPW')
    assert dpw, 'DPW not found'
    n = 0

    # iss-DPW-002: Fix null standards_summary
    if dpw.get('standards_summary') is None:
        dpw['standards_summary'] = {
            "completeness": "n/a",
            "source": "No standards exist for DPW. Greenfield family — product "
                      "standards must be created from scratch. No Annex VII number "
                      "assigned."
        }
        n += 1
        print('  iss-DPW-002: standards_summary fixed from null to structured value')
    else:
        n += 1
        print('  iss-DPW-002: standards_summary already set')

    # iss-DPW-001: Populate 5 empty sections (deep-dive §8 proposed text for 2)
    set_if_empty(dpw['content'], 'key_risks',
        "(1) Greenfield family: no existing acquis, no hENs, no EADs \u2014 "
        "entire regulatory framework must be created from scratch. "
        "(2) 2035+ DPP horizon \u2014 most distant of all 37 families. "
        "(3) Cross-regulatory complexity: VOC already regulated under "
        "Decopaint Directive 2004/42/EC and national IAQ schemes (French A+, "
        "German AgBB, Belgian decree, Italian CAM). CPR scope must complement "
        "rather than duplicate. "
        "(4) Mixed product types: paints (liquid) and wallpapers (sheet) have "
        "fundamentally different testing needs."
    )
    set_if_empty(dpw['content'], 'sources_summary',
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]. "
        "Decopaint Directive 2004/42/EC. CEPE."
    )
    set_if_empty(dpw['content'], 'standards_landscape',
        "0 hENs, 0 EADs. Greenfield family \u2014 no product standards exist "
        "under CPR. CEN/TC 139 has extensive EN ISO test methods for paints and "
        "coatings but no CPR-harmonised product standards. No Annex VII "
        "number assigned."
    )
    set_if_empty(dpw['content'], 'standards_development',
        "No CPR product standards under development. CEN/TC 139 test methods "
        "are purely EN ISO \u2014 none are CPR-harmonised. Product standards "
        "must be created from scratch. ~80% of European decorative paints "
        "are now waterborne (Decopaint Directive effect) \u2014 established "
        "formulation data could accelerate future standard development."
    )
    set_if_empty(dpw['content'], 'stakeholder_notes',
        "EPD infrastructure surprisingly mature despite 2035+ DPP horizon: "
        "AkzoNobel (Sikkens, modules A1\u2013A5/C2/C4/D), PPG/Dulux, and "
        "Jotun publish EN 15804+A2 EPDs. VOC data already generated under "
        "Decopaint Directive 2004/42/EC and national IAQ schemes. European "
        "paints & coatings market $38.66B (2024), decorative 45%. CEPE "
        "(est. 1951) is sole EU trade association. Bio-based coatings emerging."
    )
    n += 1
    print('  iss-DPW-001: 5 content fields populated')

    # iss-DPW-003: Paint EPD readiness (already in stakeholder_notes)
    n += 1
    print('  iss-DPW-003: EPD readiness covered in stakeholder_notes')

    # iss-DPW-004: Fragmented VOC (already in key_risks)
    n += 1
    print('  iss-DPW-004: VOC fragmentation covered in key_risks')

    # iss-DPW-005: Market context (already in stakeholder_notes)
    n += 1
    print('  iss-DPW-005: market context covered in stakeholder_notes')

    dpw['updated'] = '2026-03-02'
    total += n
    print(f'  DPW: {n} issues processed')

    # === WRITE BACK ===
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    # === VALIDATE ===
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        v = json.load(f)

    families_to_check = ['WCF', 'GYP', 'WWD', 'WBP', 'MEM', 'GEO', 'SAP', 'PTA', 'CAB', 'DWP', 'DPW']
    for letter in families_to_check:
        fam = find_family(v, letter)
        assert fam, f'{letter} not found'
        assert fam['content']['key_risks'] != '', f'{letter} key_risks empty'
        assert fam['content']['sources_summary'] != '', f'{letter} sources_summary empty'
        print(f'  {letter} validation PASSED')

    # Verify DWP/DPW standards_summary fix
    for letter in ['DWP', 'DPW']:
        fam = find_family(v, letter)
        assert fam.get('standards_summary') is not None, f'{letter} standards_summary still null'
        assert isinstance(fam['standards_summary'], dict), f'{letter} standards_summary not dict'
        print(f'  {letter} standards_summary fix VERIFIED')

    # Verify WBP sreq_analysis populated
    wbp_v = find_family(v, 'WBP')
    assert wbp_v['content']['sreq_analysis'] != '', 'WBP sreq_analysis empty'
    print('  WBP sreq_analysis VERIFIED')

    print(f'\nBatches 15-18 complete: {total} issues processed across 11 families')

if __name__ == '__main__':
    main()
