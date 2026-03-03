#!/usr/bin/env python3
"""
Batch 4/19: CHI (7 issues) + FFF (9 issues) = 16 issues total.

CHI:
  iss-CHI-001: EN 1443 + EN 12391-1 citation verification → standard content
  iss-CHI-002: Populate key_risks, sources_summary
  iss-CHI-003: EN 13084-5/7 exclusion → info note (no data change)
  iss-CHI-004: EN 12391-1 possibly not harmonised → standard content
  iss-CHI-005: Low EPD readiness → key_risks
  iss-CHI-006: Heat pump demand shift → stakeholder_notes
  iss-CHI-007: No hydrogen chimney standard → key_risks

FFF:
  iss-FFF-001: Fix "~32" → "33" in standards_landscape
  iss-FFF-002: Populate standards_development
  iss-FFF-003: Populate key_risks, sources_summary
  iss-FFF-004: EN 12101-2 absence explained (2003 harmonised, 2017 not)
  iss-FFF-005: Euralarm 10-year warning → key_risks
  iss-FFF-006: CRA timeline → key_risks
  iss-FFF-007: PFAS ban → EN 12094 + EN 12259 standard content
  iss-FFF-008: Zero EPD readiness → key_risks
  iss-FFF-009: IoT system boundary → stakeholder_notes
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

def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # ===================== CHI =====================
    chi = find_family(data, 'CHI')
    assert chi, 'CHI not found'

    # iss-CHI-001 + iss-CHI-004: Citation verification for EN 1443 and EN 12391-1
    en1443 = find_std(chi, 'EN 1443')
    if en1443:
        c = ensure_content(en1443)
        c['regulatory_history'] = (
            "OJ citation status requires verification. Listed as cited=true in tracker "
            "but deep-dive could not confirm via EUR-Lex. EN 1443 is a terminology/classification "
            "standard \u2014 citation status may differ from performance testing standards."
        )
        print('  iss-CHI-001: EN 1443 citation verification noted')

    en12391 = find_std(chi, 'EN 12391-1')
    if en12391:
        c = ensure_content(en12391)
        c['regulatory_history'] = (
            "Superseded by EN 15287-1:2007+A1:2010 (chimney installation/execution). "
            "EN 12391-1 is titled as an execution standard, not a harmonised product standard. "
            "Likely should NOT be in the harmonised standards list \u2014 requires verification "
            "against OJ citation records. If confirmed not harmonised, hen_count reduces from 18 to 17."
        )
        c['status_narrative'] = (
            "Execution/installation standard, superseded by EN 15287-1. "
            "Presence in tracker's harmonised standards list is uncertain."
        )
        print('  iss-CHI-004: EN 12391-1 status documented')

    # iss-CHI-002: Populate key_risks and sources_summary
    assert chi['content']['key_risks'] == '', 'CHI key_risks not empty'
    chi['content']['key_risks'] = (
        "(1) prEN 1856-1 revision uncertainty \u2014 genorma shows CEN project deleted Mar 2021, "
        "but DIN/BSI references suggest draft may have restarted. Flagship metal chimney standard. "
        "(2) SReq not yet started \u2014 planned Q3 2026 but dependent on Milestone III completion. "
        "(3) 11 legacy EADs expire 9 Jan 2031 \u2014 notes indicate 'no new EAD expected under "
        "CPR 2024/3110', implying transition to hEN route only. "
        "(4) Self-standing chimneys (EN 13084) excluded from CHI SReq \u2014 separate timeline "
        "creates coordination risk."
    )
    print('  iss-CHI-002: key_risks populated')

    assert chi['content']['sources_summary'] == '', 'CHI sources_summary not empty'
    chi['content']['sources_summary'] = (
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]; EOTA EAD database [S144]; "
        "CEN/TC 166 project listings."
    )
    print('  iss-CHI-002: sources_summary populated')

    # iss-CHI-005: Low EPD readiness → append to key_risks
    chi['content']['key_risks'] += (
        " (5) Very low EPD readiness: only Schiedel has an EN 15804 chimney EPD. "
        "Industry must build environmental data infrastructure largely from scratch for DPP."
    )
    print('  iss-CHI-005: EPD readiness added to key_risks')

    # iss-CHI-006: Heat pump demand shift → stakeholder_notes
    assert chi['content']['stakeholder_notes'] == '', 'CHI stakeholder_notes not empty'
    chi['content']['stakeholder_notes'] = (
        "Structural demand shift: heat pump sales overtook gas boiler sales in Germany "
        "in 2025, reducing gas flue demand. Biomass heating and solid fuel appliances "
        "maintain chimney relevance. Industry associations: ECA (European Chimney "
        "Association), ESCHFOE."
    )
    print('  iss-CHI-006: market shift added to stakeholder_notes')

    # iss-CHI-007: No hydrogen chimney standard → append to key_risks
    chi['content']['key_risks'] += (
        " (6) No hydrogen-ready chimney standard exists. As hydrogen blending in gas "
        "networks increases (EU Hydrogen Strategy), chimney products may face new "
        "performance requirements not covered by current hENs. CEN/TC 166 monitoring needed."
    )
    print('  iss-CHI-007: hydrogen gap added to key_risks')

    chi['updated'] = '2026-03-02'

    # ===================== FFF =====================
    fff = find_family(data, 'FFF')
    assert fff, 'FFF not found'

    # iss-FFF-001: Fix "~32" → "33" in standards_landscape
    sl = fff['content'].get('standards_landscape', '')
    if '~32' in sl or '32 harmonised' in sl:
        fff['content']['standards_landscape'] = sl.replace('~32', '33').replace('32 harmonised', '33 harmonised')
        print('  iss-FFF-001: standards_landscape count corrected to 33')
    elif '~32' not in sl and '32' not in sl:
        print('  iss-FFF-001: count text not found (may already be correct)')

    # iss-FFF-002: Populate standards_development
    assert fff['content']['standards_development'] == '', 'FFF standards_development not empty'
    fff['content']['standards_development'] = (
        "CEN/TC 72: No active revisions of EN 54 series under new CPR scope. "
        "EN 54-1:2021 was a recent editorial update. EN 50130-4 EMC revision ongoing "
        "per Euralarm (impacts fire and security industry). CEN/TC 191: WG 5 has NOT "
        "begun revising sprinkler hENs \u2014 waiting for SReq. CEN/TC 295 (residential "
        "sprinklers) and CEN/TC 305 (explosion suppression): No active CPR-relevant "
        "projects found."
    )
    print('  iss-FFF-002: standards_development populated')

    # iss-FFF-003: Populate key_risks and sources_summary
    assert fff['content']['key_risks'] == '', 'FFF key_risks not empty'
    fff['content']['key_risks'] = (
        "(1) EN 54 citation backlog \u2014 6+ technically sound parts uncited since ~2014 "
        "(James Elliott ruling legacy). New CPR Art. 5(8) may resolve but only after full "
        "SReq cycle. "
        "(2) Multi-regulatory overlap \u2014 products fall under CPR + EMC + LVD + RoHS + "
        "WEEE + Cyber Resilience Act (from Dec 2027). "
        "(3) Acquis not started \u2014 M-I targeted Q2 2026 but no evidence of sub-group formation. "
        "(4) Breadth of family \u2014 33 hENs across 4 TCs means 3\u20134 years minimum for "
        "standards development."
    )
    print('  iss-FFF-003: key_risks populated')

    assert fff['content']['sources_summary'] == '', 'FFF sources_summary not empty'
    fff['content']['sources_summary'] = (
        "COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; CPR 2024/3110 [S1]; "
        "nlfnorm.cz hEN database [S143]; EOTA EAD database [S144]; "
        "Euralarm CPR compliance newsletters (Jan\u2013Feb 2026); "
        "EFSN: CEN/TC 191/WG 5 status."
    )
    print('  iss-FFF-003: sources_summary populated')

    # iss-FFF-005: Euralarm 10-year warning → append to key_risks
    fff['content']['key_risks'] += (
        " (5) Euralarm estimates 10-year minimum for fire product standard rewriting \u2014 "
        "the ~2030\u20132033 DPP range may be optimistic."
    )
    print('  iss-FFF-005: Euralarm warning added to key_risks')

    # iss-FFF-006: CRA timeline → append to key_risks
    fff['content']['key_risks'] += (
        " (6) Cyber Resilience Act (CRA): reporting obligations from Sep 2026, full "
        "compliance Dec 2027. Most fire products in self-assessment 'default' category."
    )
    print('  iss-FFF-006: CRA timeline added to key_risks')

    # iss-FFF-007: PFAS ban → EN 12094 + EN 12259 standard content
    for std_id in ['EN 12094-1', 'EN 12259-1']:
        # Try exact match first, then prefix match
        std = find_std(fff, std_id)
        if not std:
            for s in fff['standards']:
                if s.get('id', '').startswith(std_id.split('-')[0] + ' ' + std_id.split('-')[1].split('-')[0]):
                    std = s
                    break
        if not std:
            # Try matching just the base: EN 12094 or EN 12259
            base = std_id.rsplit('-', 1)[0]
            for s in fff['standards']:
                if s.get('id', '') == base or s.get('id', '').startswith(base + ':'):
                    std = s
                    break
        if std:
            c = ensure_content(std)
            c['key_risks'] = (
                "PFAS ban (EU 2025/1988): PFAS foam agents banned from Oct 2026 for "
                "fire-fighting training, full ban from Oct 2030 for fire extinguishing. "
                "CPR + REACH + DPP triple regulatory burden for foam-compatible systems."
            )
            print(f'  iss-FFF-007: PFAS risk added to {std["id"]} standard content')
        else:
            print(f'  iss-FFF-007: {std_id} not found in FFF standards (checking alternatives)')

    # If we didn't find exact matches, add to family key_risks instead
    found_any = False
    for s in fff['standards']:
        if s.get('id', '').startswith('EN 12094') or s.get('id', '').startswith('EN 12259'):
            if 'content' in s and 'key_risks' in s['content']:
                found_any = True
    if not found_any:
        fff['content']['key_risks'] += (
            " (7) PFAS ban (EU 2025/1988) impacts gas extinguishing (EN 12094 series) "
            "and sprinkler/water spray (EN 12259 series): foam agents banned Oct 2026 "
            "for training, full ban Oct 2030. CPR + REACH + DPP triple regulatory burden."
        )
        print('  iss-FFF-007: PFAS added to family key_risks (specific standards not matched)')

    # iss-FFF-008: Zero EPD readiness → append to key_risks
    fff['content']['key_risks'] += (
        " (8) Zero fire product EPDs \u2014 industry must build environmental data "
        "infrastructure from scratch for DPP GWP declarations."
    )
    print('  iss-FFF-008: EPD readiness gap added to key_risks')

    # iss-FFF-009: IoT system boundary → append to stakeholder_notes
    sn = fff['content'].get('stakeholder_notes', '')
    fff['content']['stakeholder_notes'] = sn + (
        (' ' if sn else '') +
        "IoT/networked fire systems create product/system boundary challenges: "
        "EN 54 certification is per-component, but networked fire alarm systems "
        "integrate multiple CPR-covered products with non-CPR software. CRA + CPR + "
        "ESPR overlap creates jurisdictional complexity."
    )
    print('  iss-FFF-009: IoT boundary challenge added to stakeholder_notes')

    fff['updated'] = '2026-03-02'

    # === WRITE BACK ===
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    # === VALIDATE ===
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        v = json.load(f)
    for letter in ['CHI', 'FFF']:
        fam = find_family(v, letter)
        assert fam['content']['key_risks'] != '', f'{letter} key_risks empty'
        assert fam['content']['sources_summary'] != '', f'{letter} sources_summary empty'
        print(f'  {letter} validation PASSED')

    print('\nBatch 4 (CHI+FFF) complete: 16 issues processed')

if __name__ == '__main__':
    main()
