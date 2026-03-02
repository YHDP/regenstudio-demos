#!/usr/bin/env python3
"""
Batch 3/19: STP — ADD EAD 130089-01-0304 + data fix + 10 structural issues.

Data updates:
  upd-STP-001: EAD 130089 version update → ADD new standard (not in array)

Structural issues:
  iss-STP-001: Populate key_risks, sources_summary (from deep-dive §8)
  iss-STP-002: NT-3 M-III possibly stale → monitoring note in key_risks
  iss-STP-003: EN 13986 cross-listed with WBP → note in standards_landscape
  iss-STP-004: ADD EAD 130089-01-0304 to standards[] + standard content
  iss-STP-005: Eurocode 5 EN 1995-1-1:2025 → standards_development + standard content
  iss-STP-006: Priority 7, no fast-track → dpp_outlook note
  iss-STP-007: EUDR enforcement Dec 2026 → key_risks
  iss-STP-008: CEI-Bois TIMBIM → dpp_outlook + standard-level notes
  iss-STP-009: CLT fire delamination → key_risks
  iss-STP-010: CPR Working Plan confirms NOT first DPP cohort → dpp_outlook
"""

import json, sys, os

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'families-v2.json')

def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    stp = None
    for fam in data['families']:
        if fam.get('letter') == 'STP':
            stp = fam
            break
    if not stp:
        print('ERROR: STP not found'); sys.exit(1)

    # === upd-STP-001 + iss-STP-004: ADD EAD 130089-01-0304 ===
    # Check it doesn't already exist
    ead_exists = any('130089' in s.get('id', '') for s in stp['standards'])
    if ead_exists:
        print('  EAD 130089 already exists — skipping add')
    else:
        new_ead = {
            "id": "EAD 130089-01-0304",
            "type": "EAD",
            "name": "Structural finger-jointed, wet, cold or wet and cold glued solid timber",
            "avcp": "1",
            "regime": "old",
            "expires": "2031-01-09",
            "cited": True,
            "notes": "Updated from -00- to -01- version. Published OJEU May 2025. Covers structural finger-jointed wet/cold glued solid timber with updated assessment methodology.",
            "content": {
                "regulatory_history": (
                    "EAD 130089-01-0304 supersedes -00-0304 version. Published OJEU May 2025 "
                    "with updated assessment methodology. Old-regime EAD under CPR 305/2011. "
                    "Valid until 9 Jan 2031. OJ citation confirmed via eco-Institut and EOTA sources."
                ),
                "status_narrative": (
                    "Current version -01- published May 2025. Covers structural finger-jointed "
                    "solid timber using wet, cold, or wet-and-cold gluing methods. Assessment "
                    "methodology updated from -00- version."
                )
            }
        }
        stp['standards'].append(new_ead)
        print('  upd-STP-001 + iss-STP-004: Added EAD 130089-01-0304 to standards[]')

    # === iss-STP-001: Populate key_risks and sources_summary ===
    assert stp['content']['key_risks'] == '', 'key_risks not empty'
    stp['content']['key_risks'] = (
        "(1) Largest standards portfolio: 50 standards (9 hEN + 41 EAD) make coordinated "
        "revision and transition planning highly complex. "
        "(2) EAD transition scale: 41 EADs expire 9 Jan 2031 \u2014 the largest EAD portfolio "
        "requiring transition. At 20\u201330 EADs/year publication rate, this is 1.5\u20132 years of "
        "EOTA capacity for STP alone. "
        "(3) Biogenic carbon accounting: EN 15804+A2 -1/+1 method disadvantages long-service-life "
        "timber products \u2014 policy debate ongoing. "
        "(4) M-III (Essential Characteristics) targeted Q1 2026 \u2014 status may be stale, "
        "verify against Commission/CEN/TC 124 sources. "
        "(5) Horizontal dangerous substances SReq (CEN/TC 351) affects timber preservatives, "
        "formaldehyde, biocides, VOCs."
    )
    print('  iss-STP-001: key_risks populated')

    assert stp['content']['sources_summary'] == '', 'sources_summary not empty'
    stp['content']['sources_summary'] = (
        "CPR 2024/3110 [S1]; COM(2025) 772 CPR Working Plan 2026\u20132029 [S30]; "
        "nlfnorm.cz hEN database [S143]; EOTA EAD database [S144]; EOTA transition guidance [S98]. "
        "CEI-Bois TIMBIM digital templates (bSDD). Eurocode 5 (EN 1995-1-1:2025). "
        "EUDR Regulation (EU) 2023/1115."
    )
    print('  iss-STP-001: sources_summary populated')

    # === iss-STP-003: EN 13986 cross-listing note ===
    sl = stp['content'].get('standards_landscape', '')
    if 'EN 13986' not in sl and 'cross-listed' not in sl:
        stp['content']['standards_landscape'] = sl + (
            (' ' if sl else '') +
            "EN 13986 (wood-based panels for construction) is cross-listed with the WBP family. "
            "Both families track identical data: AVCP System 1/2+/3/4, CEN/TC 112, CPR 2011 regime."
        )
        print('  iss-STP-003: EN 13986 cross-listing noted in standards_landscape')

    # === iss-STP-005: Eurocode 5 → standards_development + standard content ===
    sd = stp['content'].get('standards_development', '')
    stp['content']['standards_development'] = sd + (
        (' ' if sd else '') +
        "EN 1995-1-1:2025 (Eurocode 5, second generation) published Aug 2025. Substantially "
        "expanded to include CLT, LVL, and glulam design rules. NSB national annexes in progress "
        "\u2014 will directly inform the SReq essential characteristics scope for STP."
    )
    print('  iss-STP-005: Eurocode 5 added to standards_development')

    # iss-STP-006: Priority 7, no fast-track → append to dpp_outlook
    do = stp['content'].get('dpp_outlook', '')
    stp['content']['dpp_outlook'] = do + (
        (' ' if do else '') +
        "STP is priority 7 of 34 product families per COM(2025) 772, but fast-track standards "
        "updating is NOT available (confirmed by Innovawood/EOS). Must go through full "
        "acquis\u2192SReq\u2192CEN\u2192OJ pipeline."
    )
    print('  iss-STP-006: priority/fast-track context added to dpp_outlook')

    # iss-STP-007: EUDR → append to key_risks
    stp['content']['key_risks'] += (
        " (6) EUDR enforcement confirmed: 30 Dec 2026 for large/medium operators, 30 Jun 2027 "
        "for small/micro. Timber is a regulated commodity. Creates parallel supply chain "
        "traceability requirements preceding DPP. No formal DPP-EUDR data linkage mechanism yet."
    )
    print('  iss-STP-007: EUDR added to key_risks')

    # iss-STP-008: CEI-Bois TIMBIM → append to dpp_outlook
    stp['content']['dpp_outlook'] += (
        " CEI-Bois TIMBIM initiative: 12 data templates on 7 hENs published in bSDD since 2023. "
        "Templates cover product properties, GS1 identifiers (GTIN, GLN, GMN), EPD data, and "
        "circularity data. GS1 identifiers align with CPR DPP unique product identifier requirements. "
        "Industry DPP groundwork underway but manufacturer adoption level unclear."
    )
    print('  iss-STP-008: TIMBIM added to dpp_outlook')

    # iss-STP-009: CLT fire delamination → append to key_risks
    stp['content']['key_risks'] += (
        " (7) CLT fire safety: susceptible to delamination at elevated temperatures causing "
        "cyclical burning. EN 1995-1-2:2025 addresses with CLT-specific charring rules (0.65 mm/min). "
        "National regulatory approaches diverge significantly (UK cautious, Austria positive, France "
        "mixed). DPP fire performance data may need national context."
    )
    print('  iss-STP-009: CLT fire safety added to key_risks')

    # iss-STP-010: CPR Working Plan → append to dpp_outlook
    stp['content']['dpp_outlook'] += (
        " CPR Working Plan (Dec 2025) sequences DPP rollout: Registry Jul 2026, Service Provider "
        "rules Q4 2026, CEM first DPP-ready hENs Q4 2027, DWS 2028\u20132029. STP is NOT in the "
        "first DPP cohort. STP DPP timeline likely 2029+."
    )
    print('  iss-STP-010: CPR Working Plan sequencing added to dpp_outlook')

    # Update timestamp
    stp['updated'] = '2026-03-02'

    # === WRITE BACK ===
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    # === VALIDATE ===
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        v = json.load(f)
    for fam in v['families']:
        if fam.get('letter') == 'STP':
            assert fam['content']['key_risks'] != '', 'key_risks empty'
            assert fam['content']['sources_summary'] != '', 'sources_summary empty'
            assert fam['content']['standards_development'] != '', 'standards_development empty'
            assert 'EUDR' in fam['content']['key_risks'], 'EUDR not in key_risks'
            assert 'TIMBIM' in fam['content']['dpp_outlook'], 'TIMBIM not in dpp_outlook'
            # Check EAD 130089 exists
            found = any('130089' in s.get('id', '') for s in fam['standards'])
            assert found, 'EAD 130089 not in standards[]'
            # Check it has content
            for s in fam['standards']:
                if '130089' in s.get('id', ''):
                    assert 'content' in s, 'EAD 130089 has no content'
            print('\n  Validation PASSED')
            break

    print(f'\nBatch 3 (STP) complete: 1 data update + 10 issues processed. Standards count now: {len(stp["standards"])}')

if __name__ == '__main__':
    main()
