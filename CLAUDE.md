# Project: regenstudio-demos

## Tech Stack
- Language: Vanilla JS (ES5-compatible, no build step)
- Backend: Supabase Edge Functions (Deno/TypeScript)
- Hosting: GitHub Pages (static)
- Payments: Mollie B.V.
- Email: Lettermint

## Directory Structure
```
regenstudio-demos/
├── assets/           ← Shared: fonts, CSS, JS, images
├── cpr-dpp-tracker/  ← CPR DPP Tracker demo + reports sales page
├── EDI-wallet/       ← European Digital Identity wallet demo
├── battery-questionnaire/ ← Battery passport compliance tool
├── ai-tax-ubi/       ← AI tax policy simulator
├── dpp-system/       ← DPP system demo
├── triangle-playground/ ← Physics sandbox & constellation game (free)
├── innovation-platform/ ← Government innovation management (restricted)
├── supabase/         ← Edge functions + migrations
├── privacy.html      ← Privacy policy (root level)
├── index.html        ← Demos landing page
└── products.html     ← Products page
```

## Privacy Architecture

Zero third-party connections policy. All assets self-hosted, no cookies.
Privacy principles enforced by `soul.md`; project-specific details below:

- Fonts self-hosted in `assets/fonts/` (Inter, Playfair Display, Material Icons). JS libs in `cpr-dpp-tracker/js/vendor/`.
- IPs hashed with daily-rotating salt (see `track-report-event`), never stored raw
- Sub-processors: Supabase (EU), Mollie (NL), Lettermint (email), GitHub Pages, Exact Online (NL), Proton Mail (CH)
- Privacy policy: `privacy.html` — must be updated in the same commit as any data-handling change

## Self-Hosted Fonts
- `assets/fonts/inter.css` — Inter (variable, 400-800)
- `assets/fonts/playfair-display.css` — Playfair Display (variable, 400-700)
- `assets/fonts/material-icons.css` — Material Icons (400)

## Conventions
- No build step — all files served as-is via GitHub Pages
- CSS uses design tokens from `assets/css/styles.css` (:root variables)
- 5-color accent palette: emerald (#00914B), teal (#009BBB), indigo (#6366F1), amber (#FFA92D), crimson (#93093F)
- Supabase edge functions in `supabase/functions/<name>/index.ts`
- Migrations in `supabase/migrations/`
