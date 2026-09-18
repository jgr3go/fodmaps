# Gut Log

Personal PWA for logging what you eat (breakfast, lunch, dinner, snacks, alcohol) and how your gut felt, with inline
FODMAP flags on every row and an on-device analysis that finds which foods, ingredients, FODMAP groups, or other
sensitivities (allergens, histamine, caffeine, fat) precede bad days, at 0 to 3 day lags or within hours.

- **Frontend:** React + Vite + TypeScript + Tailwind, Dexie (IndexedDB), installable PWA, works offline. Deploys to GitHub Pages.
- **API (optional):** `server/`, Node + Hono + SQLite on your own box. Sync between devices and a Claude-written plain-English readout. See `server/deploy/README.md`.
- **Data:** `data/fodmap.json`, 811 foods compiled from public FODMAP sources with per-food citations and disagreements. See `data/README.md` and `data/SOURCES.md`.
- **Plan and decisions:** `PLAN.md`.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173/fodmap/  (open on your phone via the LAN address vite prints)
npm test             # analysis engine tests (synthetic trigger detection)
npm run build        # regenerates data/ and src/data/, typechecks, builds dist/
```

Rebuild the reference table after editing anything in `research/`: `npm run data`.

## Deploy the app

Push to `main`. `.github/workflows/deploy.yml` builds and publishes to GitHub Pages at `https://<user>.github.io/<repo>/`.
Enable Pages (Settings, Pages, Source: GitHub Actions) once. For a custom domain set the repo variable `VITE_BASE=/`.

Install on Android: open the Pages URL in Chrome, menu, "Add to Home screen".

## How the analysis works

1. Every entry expands into features: the food, each ingredient of a dish, each FODMAP group it loads, and each
   sensitivity tag. Exercise is a feature too so it can't be misattributed to food.
2. For each feature, mean distress on days 0 to 3 after exposure is compared with unexposed days. A permutation test
   over the exposure dates gives a p-value. Results are hidden under 4 exposures and called strong at 8+ with p < 0.05.
3. Trailing 72-hour FODMAP load per group is correlated with same-day and next-day distress to catch cumulative effects.
4. Timed flare-ups within 4 hours of an exposure are compared against the rate for all exposures to flag fast,
   allergy-like reactions.

None of this is a diagnosis. It is a way to arrive at a dietitian appointment with data.
