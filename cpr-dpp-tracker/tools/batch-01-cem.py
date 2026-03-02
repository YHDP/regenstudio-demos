#!/usr/bin/env python3
"""
Batch 1/19: CEM — Apply 4 data updates + 9 structural issues.

Data updates:
  upd-CEM-001: Set content.key_risks
  upd-CEM-002: Set content.sources_summary
  upd-CEM-003: Update pipelines.A.nodes[2].detail (NT-4 SReq) — path corrected from [3] to [2]
  upd-CEM-004: Update 'updated' timestamp

Structural issues applied:
  iss-CEM-001: (covered by upd-CEM-001) key_risks populated
  iss-CEM-002: (covered by upd-CEM-002) sources_summary populated
  iss-CEM-003: RESOLVED — CEN/TC 459 is iron/steel, not building limes
  iss-CEM-004: EAD 150080 OJ citation vehicle → standard-level content.regulatory_history
  iss-CEM-005: SReq expiry dates → (covered by upd-CEM-003) + family content.stakeholder_notes
  iss-CEM-006: CID cement carbon label → append to content.key_risks
  iss-CEM-007: RESOLVED — EN 459-1 tc_wg correct
  iss-CEM-008: IDAA carbon label → append to content.stakeholder_notes
  iss-CEM-009: EN 197-5 NOT harmonised → standard-level content on EN 197-5
  iss-CEM-010: EPBD C(2025) 8723 GWP demand → append to content.key_risks
  iss-CEM-011: ETS/CBAM carbon cost → append to content.stakeholder_notes
"""

import json
import sys
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'families-v2.json')

def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cem = None
    for fam in data['families']:
        if fam.get('letter') == 'CEM':
            cem = fam
            break

    if not cem:
        print('ERROR: CEM family not found')
        sys.exit(1)

    # === DATA UPDATES ===

    # upd-CEM-001: Set content.key_risks
    assert cem['content']['key_risks'] == '', f"key_risks not empty: {cem['content']['key_risks'][:50]}"
    cem['content']['key_risks'] = (
        "(1) Standards development bottleneck: Only EN 197-1 has a registered prEN "
        "(stage 10.99, Jul 2025). The remaining 8 product standards (EN 413-1, EN 459-1, "
        "EN 15368, EN 14216, EN 14647, EN 15743, EN 13282, EN 16908) have SReq delivery "
        "deadlines in 2027\u20132028 but no prEN registrations yet. CEN first annual report "
        "(due Jun 2026) will clarify progress. "
        "(2) Alkali-activated cements: CEN/TC 51 refused to develop standards; downgraded "
        "to Technical Report in C(2025) 4828. Performance-based standard requested for "
        "delivery by 2030 but uncertain. "
        "(3) EAD sunset risk: EAD 150080-00-0301 (blended cements) valid only until "
        "9 Jan 2031 under old CPR. New-regime EAD needed for continued ETA route. "
        "EOTA mandate by 2027 signaled but not yet formalised. "
        "(4) Clean Industrial Deal: Mandatory cement carbon label (GWP disclosure in DoP) "
        "planned when new standards become mandatory, adding compliance complexity."
    )
    print('  upd-CEM-001: key_risks set')

    # upd-CEM-002: Set content.sources_summary
    assert cem['content']['sources_summary'] == '', 'sources_summary not empty'
    cem['content']['sources_summary'] = (
        "CPR 2024/3110 [S1]; SReq C(2025) 4828 [S11]; CPR Working Plan COM(2025) 772 "
        "[S30]; nlfnorm.cz hEN database [S143]; EOTA EAD database [S144]. EAD 150080 OJ "
        "citation: industry press (Ecocem, CemNet) Dec 2025. prEN 197-1 stage: genorma.com. "
        "Joint letter on alkali-activated cements: ecostandard.org May 2025."
    )
    print('  upd-CEM-002: sources_summary set')

    # upd-CEM-003: Update pipelines.A.nodes[2].detail (NT-4 SReq)
    # Path corrected: review queue said [3] but SReq node is at [2]
    node = cem['pipelines']['A']['nodes'][2]
    assert node['type'] == 'NT-4', f"Expected NT-4 at index 2, got {node['type']}"
    assert node.get('detail') == 'Adopted Jul 2025', f"Unexpected detail: {node.get('detail')}"
    node['detail'] = (
        "Adopted 28 Jul 2025. C(2025) 4828 replaces M/114. "
        "SReq expires 30 Jun 2030. First CEN annual report due 30 Jun 2026."
    )
    print('  upd-CEM-003: SReq node detail updated')

    # upd-CEM-004: Update timestamp
    assert cem['updated'] == '2026-02-22', f"Unexpected updated: {cem['updated']}"
    cem['updated'] = '2026-03-02'  # Today's date (processing date)
    print('  upd-CEM-004: updated timestamp set to 2026-03-02')

    # === STRUCTURAL ISSUES ===

    # iss-CEM-005: SReq expiry dates — add monitoring note to stakeholder_notes
    if not cem['content']['stakeholder_notes']:
        cem['content']['stakeholder_notes'] = ''
    cem['content']['stakeholder_notes'] += (
        "SReq C(2025) 4828 lifecycle: expires 30 Jun 2030. "
        "CEN first annual report due 30 Jun 2026 — key data point for standards development progress monitoring."
    )
    print('  iss-CEM-005: SReq expiry dates added to stakeholder_notes')

    # iss-CEM-008: IDAA carbon label — append to stakeholder_notes
    cem['content']['stakeholder_notes'] += (
        " Industrial Decarbonisation Accelerator Act (IDAA): postponed from Dec 2025, "
        "will operationalise cement carbon label mandating GWP disclosure (kgCO\u2082 eq./t) "
        "in Declaration of Performance via CPR. EPBD requires lifecycle GWP for buildings "
        ">1000m\u00b2 from 2028, all new buildings from 2030. Germany already has national "
        "cement carbon labelling. Cement Europe (formerly CEMBUREAU) supports lead markets approach."
    )
    print('  iss-CEM-008: IDAA context added to stakeholder_notes')

    # iss-CEM-010: EPBD C(2025) 8723 — append to key_risks
    cem['content']['key_risks'] += (
        " (5) EPBD GWP demand: Commission delegated regulation C(2025) 8723 (16 Dec 2025) "
        "establishes building life-cycle GWP calculations: >1000m\u00b2 from Jan 2028, all new "
        "buildings from Jan 2030. Data hierarchy favours product-specific EPDs, creating "
        "downstream pull for plant-specific digital EPD data aligned with DPP requirements."
    )
    print('  iss-CEM-010: EPBD GWP demand appended to key_risks')

    # iss-CEM-011: ETS/CBAM carbon cost — append to stakeholder_notes
    cem['content']['stakeholder_notes'] += (
        " EU ETS/CBAM interaction: From 1 Jan 2026, ETS free allocations shift to binder-based "
        "benchmark (Cement Europe flags as \u2018unclear\u2019). Free allocation phase-out: 97.5% "
        "remaining 2026, 51.5% by 2030, 0% by 2034. CBAM definitive compliance started 1 Jan 2026. "
        "Progressive carbon cost makes CPR GWP disclosure on DPPs economically consequential \u2014 "
        "low-carbon cements gain real cost advantage."
    )
    print('  iss-CEM-011: ETS/CBAM context added to stakeholder_notes')

    # === STANDARD-SPECIFIC CONTENT ===

    # iss-CEM-004: EAD 150080 OJ citation vehicle → standard content
    for std in cem['standards']:
        if std['id'] == 'EAD 150080-00-301':
            if 'content' not in std:
                std['content'] = {}
            std['content']['regulatory_history'] = (
                "Cited in OJEU December 2025 (industry sources: Ecocem, CemNet, World Cement, "
                "S&P Global confirm). Exact implementing decision number not yet confirmed from "
                "EUR-Lex — may be via C-series OJ communication or Implementing Decision 2025/2355 "
                "(13 Nov 2025). Old-regime EAD under CPR 305/2011. Valid until 9 Jan 2031."
            )
            print('  iss-CEM-004: EAD 150080 regulatory_history set')
            break

    # iss-CEM-009: EN 197-5 NOT harmonised — find or note
    en197_5_found = False
    for std in cem['standards']:
        if '197-5' in std['id']:
            en197_5_found = True
            if 'content' not in std:
                std['content'] = {}
            std['content']['status_narrative'] = (
                "NOT harmonised under CPR — no OJ citation. CEM VI ternary cements "
                "(~340 kg CO\u2082/t) must use national approvals (e.g., Dyckerhoff received "
                "German DIBt abZ 20 Oct 2025). Excludes the most climate-relevant cements "
                "from the harmonised CE marking and DPP system."
            )
            std['content']['dpp_impact'] = (
                "Excluded from DPP system entirely. The prEN 197-1 revision (stage 10.99 "
                "since Jul 2025) is the only path to harmonisation, incorporating CEM II/C-M "
                "and CEM VI, but delivery is years away. ALCCC advocates for performance-based "
                "standards to close this gap."
            )
            print('  iss-CEM-009: EN 197-5 content set')
            break

    if not en197_5_found:
        # EN 197-5 is not in the standards array — it's not harmonised, so that's expected.
        # Add a note to family key_risks instead.
        cem['content']['key_risks'] += (
            " (6) EN 197-5 gap: EN 197-5:2021 (CEM II/C-M, CEM VI ternary cements, "
            "~340 kg CO\u2082/t) is NOT harmonised and has no OJ citation. These most "
            "climate-relevant cements are excluded from CE marking and DPP. Only path: "
            "prEN 197-1 revision incorporating CEM VI."
        )
        print('  iss-CEM-009: EN 197-5 not in standards[] — added to family key_risks')

    # === WRITE BACK ===
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    # === VALIDATE ===
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        validate = json.load(f)

    for fam in validate['families']:
        if fam.get('letter') == 'CEM':
            assert fam['content']['key_risks'] != '', 'key_risks still empty after update'
            assert fam['content']['sources_summary'] != '', 'sources_summary still empty'
            assert fam['content']['stakeholder_notes'] != '', 'stakeholder_notes still empty'
            assert '4828' in fam['pipelines']['A']['nodes'][2]['detail'], 'SReq detail not updated'
            assert fam['updated'] == '2026-03-02', 'timestamp not updated'
            # Check EAD 150080 has content
            for std in fam['standards']:
                if std['id'] == 'EAD 150080-00-301':
                    assert 'content' in std, 'EAD 150080 content not added'
                    assert 'regulatory_history' in std['content'], 'EAD 150080 regulatory_history missing'
            print('\n  Validation PASSED')
            break

    print('\nBatch 1 (CEM) complete: 4 data updates + 9 issues processed')

if __name__ == '__main__':
    main()
