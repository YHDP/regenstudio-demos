# CPR DPP Tracker — Implementation Plan

> Crash recovery reference. If the session breaks, resume from the last completed phase.

## Overview

Standalone password-protected demo at `cpr-dpp-tracker/` within the `regenstudio-demos` repo (`demos.regenstudio.world`). Extracts the CPR compliance tracker from the blog at `regenstudio-website/Blogs/cpr-digital-product-passport/content.html` into a clean, single-source-of-truth architecture.

## File structure

```
cpr-dpp-tracker/
├── gate.html              ← password gate (uses shared gate.js)
├── index.html             ← main app shell
├── data/
│   └── families.json      ← single source of truth (37 families, extracted from blog)
├── css/
│   └── tracker.css        ← extracted CPR CSS with BEM naming + custom properties
├── js/
│   ├── tracker.js         ← grid rendering, modal, enrichment (fetches families.json)
│   ├── dpp-info.js        ← DPP info popup singleton + buildHenDppInfo/buildEadDppInfo
│   └── guard.js           ← session check → redirect to gate.html if not authenticated
├── tools/
│   └── extract-families.py ← one-time data extraction script (Python 3)
├── Images/                ← 37 SVG product family icons (copied from blog)
└── PLAN.md                ← this file
```

## Data architecture

`families.json` contains all 37 product families as a JSON array, preserving the blog's HTML order (sorted by estimated DPP obligation date, earliest first). Each entry has:

- **Simple fields**: `full-name`, `letter`, `family`, `priority`, `updated`, `acquis`, `sreq`, `tc`, `dpp-est`
- **JSON objects**: `milestones`, `dpp-range`, `standards` (with nested `standards[]` array and `summary`)
- **HTML string**: `info` (paragraphs with section headings)
- **Display fields**: `icon`, `display_name`, `family_label`, `tc_label`

Runtime JS derives:
- `hen_count` / `ead_count` from `standards.standards.filter(s => s.type === '...')`
- `current_cpr` / `sreq_cpr` from `revision` field + family letter (PCR/SMP → old CPR 305/2011)
- `computeHenStage()` returns 0–5 (Pending → Mandated → In dev → Delivered → Mandatory → DPP)
- `computeEadStage()` returns 1–3 (Legacy → In development → Adopted)

## Phase checklist

### Phase 1: Scaffold [x]
- [x] Create folder structure
- [x] Write `tools/extract-families.py` (HTMLParser with void-element handling)
- [x] Run extraction → 37 families in `data/families.json`
- [x] Create `gate.html` (DEMO_CONFIG: demoId='cpr-dpp-tracker')
- [x] Create `js/guard.js` (sessionStorage check)
- [x] Register in root `demos.json` (category: Circular Economy, accentColor: #009BBB)

### Phase 2: App [x]
- [x] Create `css/tracker.css` (extracted from blog's inline styles)
- [x] Create `js/dpp-info.js` (popup singleton + info builders)
- [x] Create `js/tracker.js` (fetch → render → enrich → modal)
- [x] Create `index.html` (app shell with header, grid, modal, footer)
- [x] Copy 37 SVG icons to `Images/`

### Phase 3: Blog teaser [x]
- [x] Blog already has blur CSS (`:nth-child(n+5)`) and email gate — no changes needed

### Phase 4: Ship [ ]
- [ ] Commit regenstudio-demos
- [ ] Commit regenstudio-website (if blog changes were needed — none were)
- [ ] Push (on user confirmation)

## Key decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Data source | Single `families.json` | Eliminates count-drift between data-dpp-range, data-standards, data-info |
| Auth pattern | Existing gate.js SHA-256 | Proven pattern, 4 demos already use it |
| Blog teaser | Already implemented | Blur + email gate was already in content.html |
| CSS approach | Extract to file | Blog keeps inline, demo gets proper file with custom properties |
| JS modules | 3 files (guard + dpp-info + tracker) | Clean separation of concerns |

## Dependencies

- `demos.json` password hash (shared across all demos — already set)
- SVG icons copied from blog repo (not symlinked — separate repos)
- Supabase contact-form function (already deployed)
