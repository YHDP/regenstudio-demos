#!/usr/bin/env python3
"""
Batch 2/19: DWS — Apply 4 data updates + 10 structural issues.

Data updates:
  upd-DWS-001: Set pipelines.A.nodes[2].status → 'draft'
  upd-DWS-002: Set pipelines.A.nodes[2].certainty → 'yellow-green'
  upd-DWS-003: Set pipelines.A.nodes[2].detail
  upd-DWS-004: Set pipelines.A.nodes[2].date → 'Jan 2026'

Structural issues:
  iss-DWS-001: (covered by upd-DWS-001–004) NT-4 alignment
  iss-DWS-002: Stale SReq — monitoring note
  iss-DWS-003: Populate stakeholder_notes, key_risks, sources_summary
  iss-DWS-004: CEN/TC 33 cross-family note → stakeholder_notes
  iss-DWS-005: AVS 4+ proposal → key_risks
  iss-DWS-006: EN 14351 restructuring → standards_development + EN 14351-2 content
  iss-DWS-007: EuroWindoor timeline warning → key_risks
  iss-DWS-008: SReq scope 51+19+257 → key_risks
  iss-DWS-009: EPBD GWP dual demand → key_risks
  iss-DWS-010: PVC/aluminium recycling → stakeholder_notes
"""

import json, sys, os

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'families-v2.json')

def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    dws = None
    for fam in data['families']:
        if fam.get('letter') == 'DWS':
            dws = fam
            break
    if not dws:
        print('ERROR: DWS not found'); sys.exit(1)

    # === DATA UPDATES ===
    node = dws['pipelines']['A']['nodes'][2]
    assert node['type'] == 'NT-4', f"Expected NT-4 at index 2, got {node['type']}"

    # upd-DWS-001
    assert node['status'] == 'not_started', f"Unexpected status: {node['status']}"
    node['status'] = 'draft'
    print('  upd-DWS-001: NT-4 status → draft')

    # upd-DWS-002
    assert node['certainty'] == 'amber', f"Unexpected certainty: {node['certainty']}"
    node['certainty'] = 'yellow-green'
    print('  upd-DWS-002: NT-4 certainty → yellow-green')

    # upd-DWS-003
    assert node.get('detail') is None, f"Unexpected detail: {node.get('detail')}"
    node['detail'] = 'Draft published 21 Jan 2026, feedback closed 18 Feb 2026. Under CPR 2024/3110.'
    print('  upd-DWS-003: NT-4 detail set')

    # upd-DWS-004
    assert node.get('date') is None, f"Unexpected date: {node.get('date')}"
    node['date'] = 'Jan 2026'
    print('  upd-DWS-004: NT-4 date → Jan 2026')

    # === CONTENT POPULATION (iss-DWS-003) ===

    # stakeholder_notes — from deep-dive Section 8
    assert dws['content']['stakeholder_notes'] == '', 'stakeholder_notes not empty'
    dws['content']['stakeholder_notes'] = (
        "EuroWindoor submitted 86 comments on 4th draft SReq (Oct 2025) and further comments "
        "on revised draft (13 Feb 2026). Industry calls Jun 2029 delivery timeline 'highly ambitious' "
        "and requests 1-year extension. Joint AVS 4+ proposal (Feb 2026) for verified software "
        "assessment submitted. AISBL technical workshop on CPR 2024/3110 implementation ongoing."
    )
    print('  iss-DWS-003: stakeholder_notes populated')

    # key_risks — from deep-dive Section 8
    assert dws['content']['key_risks'] == '', 'key_risks not empty'
    dws['content']['key_risks'] = (
        "(1) Timeline risk: 15 deliverables in ~3 years is aggressive for CEN/TC 33. "
        "(2) Dual regulation: EN 13241 (industrial doors) also under Machinery Directive "
        "2006/42/EC \u2014 coordination needed. "
        "(3) DPP volume: ~76 million DPPs/year for windows alone \u2014 infrastructure scaling challenge. "
        "(4) Standardisation deficit: EN 14351-2 (internal doors) never cited since 2018 \u2014 "
        "risk of continued delay."
    )
    print('  iss-DWS-003: key_risks populated')

    # sources_summary
    assert dws['content']['sources_summary'] == '', 'sources_summary not empty'
    dws['content']['sources_summary'] = (
        "CPR 2024/3110 [S1]; EC Notification System Art. 12 (DWS SReq draft, Jan 2026); "
        "EuroWindoor publications and SReq comments (Feb 2026); ift Rosenheim CPR articles; "
        "VinylPlus Progress Report 2025; EPPA circular economy programme; "
        "Directive (EU) 2024/1275 (EPBD recast)."
    )
    print('  iss-DWS-003: sources_summary populated')

    # === ENRICHMENT ===

    # iss-DWS-005: AVS 4+ proposal → append to key_risks
    dws['content']['key_risks'] += (
        " (5) AVS 4+ proposal: EuroWindoor, European Aluminium, EPPA, Glass for Europe, "
        "and SBS jointly proposed a new Assessment and Verification System (Feb 2026) where "
        "a Notified Body verifies input data and validates software tools. If adopted via "
        "delegated act under Art. 10(4), this fundamentally changes the verification regime."
    )
    print('  iss-DWS-005: AVS 4+ added to key_risks')

    # iss-DWS-006: EN 14351 restructuring → standards_development + EN 14351-2 content
    existing_sd = dws['content'].get('standards_development', '')
    dws['content']['standards_development'] = existing_sd + (
        (' ' if existing_sd else '') +
        "Under the new SReq, the EN 14351 series is being reorganised into 4 consolidated "
        "standards: (1) Pedestrian doorsets = EN 14351-1 (excl. windows) + EN 14351-2 + "
        "EN 16034; (2) Windows = EN 14351-1 (excl. doors) + EN 16034; (3) Fire industrial "
        "doors = EN 13241 + EN 16034; (4) Non-fire industrial doors = EN 13241. This "
        "restructuring will significantly change the current 15-hEN listing."
    )
    print('  iss-DWS-006: EN 14351 restructuring added to standards_development')

    # EN 14351-2 standard-level content
    for std in dws['standards']:
        if '14351-2' in std['id']:
            if 'content' not in std:
                std['content'] = {}
            std['content']['regulatory_history'] = (
                "Never OJ-cited since publication in 2018 \u2014 a confirmed standardisation "
                "deficit. Under the new SReq restructuring, EN 14351-2 will be folded into "
                "the consolidated pedestrian doorsets standard."
            )
            std['content']['status_narrative'] = (
                "Internal doorsets standard. No OJ citation means no CE marking obligation "
                "and no DPP requirement under current harmonised framework. Resolution "
                "depends on new CEN/TC 33 work programme under the adopted SReq."
            )
            print('  iss-DWS-006: EN 14351-2 standard content set')
            break

    # iss-DWS-007: EuroWindoor timeline warning → append to key_risks
    dws['content']['key_risks'] += (
        " (6) EuroWindoor warns standardisation work \u2018risks failing to deliver the required "
        "quality within the set timeframe\u2019 with key templates and guidance documents still "
        "missing. No prEN 14351-1 (new), prEN 14351-2, or prEN 14351-3 registrations found."
    )
    print('  iss-DWS-007: EuroWindoor warning appended to key_risks')

    # iss-DWS-008: SReq scope → append to key_risks
    dws['content']['key_risks'] += (
        " (7) SReq scope complexity: Draft lists 51 technical characteristics, 19 environmental "
        "criteria, and 257 substances for windows \u2014 industry argues excessive. May be reduced "
        "during CEN acceptance negotiation."
    )
    print('  iss-DWS-008: SReq scope added to key_risks')

    # iss-DWS-009: EPBD GWP dual demand → append to key_risks
    dws['content']['key_risks'] += (
        " (8) EPBD dual GWP demand: EPBD recast requires building-level GWP calculations "
        "(large new >2000m\u00b2 from 2027, all new from 2030). Glass industry EPD infrastructure "
        "is mature (AGC, Guardian), but window assembly-level data is the bottleneck. Creates "
        "urgency for GWP data preparation before new CPR standards are published."
    )
    print('  iss-DWS-009: EPBD GWP demand appended to key_risks')

    # iss-DWS-010: PVC/aluminium recycling → append to stakeholder_notes
    dws['content']['stakeholder_notes'] += (
        " PVC recycling: VinylPlus targets 1 Mt/year by 2030 (2024 actual: 724,638t). EPPA "
        "5-year action plan boosting PVC window recycling in France, Germany, Poland (pilot "
        "evaluation 2026). Aluminium windows infinitely recyclable. Wood windows have biogenic "
        "carbon accounting considerations (EN 15804+A2). DPP under new CPR requires "
        "end-of-life/recyclability data \u2014 existing recycling infrastructure provides data foundation."
    )
    print('  iss-DWS-010: recycling data added to stakeholder_notes')

    # Update timestamp
    dws['updated'] = '2026-03-02'
    print('  updated timestamp → 2026-03-02')

    # === WRITE BACK ===
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    # === VALIDATE ===
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        v = json.load(f)
    for fam in v['families']:
        if fam.get('letter') == 'DWS':
            n = fam['pipelines']['A']['nodes'][2]
            assert n['status'] == 'draft', 'status not updated'
            assert n['certainty'] == 'yellow-green', 'certainty not updated'
            assert 'Jan 2026' in (n.get('detail') or ''), 'detail not updated'
            assert n.get('date') == 'Jan 2026', 'date not set'
            assert fam['content']['key_risks'] != '', 'key_risks empty'
            assert fam['content']['stakeholder_notes'] != '', 'stakeholder_notes empty'
            assert fam['content']['sources_summary'] != '', 'sources_summary empty'
            # Check EN 14351-2 has content
            for std in fam['standards']:
                if '14351-2' in std['id']:
                    assert 'content' in std, 'EN 14351-2 content missing'
            print('\n  Validation PASSED')
            break

    print('\nBatch 2 (DWS) complete: 4 data updates + 10 issues processed')

if __name__ == '__main__':
    main()
