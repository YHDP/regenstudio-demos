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
├── supabase/         ← Edge functions + migrations
├── privacy.html      ← Privacy policy (root level)
├── index.html        ← Demos landing page
└── products.html     ← Products page
```

## Privacy Rules — MANDATORY

This site follows a **zero third-party connections** architecture. The privacy policy at `privacy.html` promises visitors that all assets are self-hosted and no cookies are set.

- **NEVER add Google Fonts, CDN-hosted scripts, or any external `<link>`/`<script>` tags**
  - All fonts are self-hosted in `assets/fonts/` (Inter, Playfair Display, Material Icons)
  - JS libraries must be placed in `cpr-dpp-tracker/js/vendor/` or equivalent local paths
  - If a new font or library is needed, download the files and self-host them
- **NEVER add cookies, tracking pixels, fingerprinting, or advertising scripts**
- **NEVER store raw IP addresses** — use hashed IPs with daily-rotating salt (see `track-report-event`)
- **NEVER send personal data to third parties** beyond the listed sub-processors (Supabase, Mollie, Lettermint, Exact Online, Proton Mail, GitHub Pages)
- If adding a new external service, update `privacy.html` sub-processors section first

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
