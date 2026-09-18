# FODMAP / GI Tracker — Build Plan

> **Status 2026-09-17:** phases 1–3 built and smoke-tested locally (see Status at the end). Remaining work needs Jon: GitHub repo + Pages, Linode deploy, API key.

Personal PWA for logging food by meal slot and daily GI distress, flagging high-FODMAP foods inline,
and surfacing which foods (and FODMAP groups) correlate with symptoms over 0–3 day lags.

## Decisions (from 2026-09-17 grilling)

| Area | Decision |
|---|---|
| Device | Android only (Chrome PWA) |
| Storage | Local-first in IndexedDB; sync to DigitalOcean API in phase 1 (no separate backup screen) |
| Frontend host | GitHub Pages |
| API host | Existing Linode (nginx already proxies a Foundry VTT server; we add a server block, not replace) |
| Symptoms | Daily 0–10 distress + symptom-type checkboxes |
| Food entry | Structured foods with ingredients, but free-text entries allowed when nothing matches |
| Portions | Small / Medium / Large |
| Confounders | Exercise (daily) |
| FODMAP data | Hand-curated JSON table, ~200–300 ingredients, user overrides |
| Analysis | Deterministic on-device stats + on-demand LLM summary via Linode (API key stays on server) |
| Protocol phases | Schema only, no UI yet |
| Stack | React + Vite + TypeScript + Tailwind |

## Architecture

```
Phone (Chrome PWA, GitHub Pages)            Linode
┌──────────────────────────────┐            ┌─────────────────────────────┐
│ React UI                     │  HTTPS     │ nginx (existing)            │
│ Dexie (IndexedDB)  ──sync──► │ ─────────► │  └─ fodmap-api.<domain>     │
│ Analysis engine (pure TS)    │            │       └─ Node + SQLite      │
│ Service worker (offline)     │ ◄───────── │            /sync  /analyze  │
└──────────────────────────────┘            │            └─ Claude API    │
                                            └─────────────────────────────┘
```

- **Frontend:** Vite, React, TypeScript, Tailwind, `vite-plugin-pwa` (Workbox), Dexie, Recharts, fuse.js for fuzzy food search, react-router. Base path = repo name for Pages.
- **API:** Node 22+ (Hono), `node:sqlite` or better-sqlite3, systemd service on `127.0.0.1:<port>`. nginx server block on a subdomain with certbot cert. CORS locked to the Pages origin. Auth = one long random bearer token, entered once in app settings.
- **Sync:** every record has `id` (uuid), `updatedAt`, `deleted`. Client pushes rows changed since last push, pulls rows changed since last pull. Last-writer-wins by `updatedAt`. Single user, so conflicts are rare and this is enough.
- **LLM summary:** app builds a digest (last ~8 weeks of days, foods with ratings, computed stats) → `POST /analyze` → server calls Claude → returns markdown → shown and cached in app. Key never leaves the server.

## Data model

```ts
Food {
  id, name, aliases: string[],
  kind: 'ingredient' | 'dish',
  ingredients: { foodId: string; weight?: number }[],   // dishes only
  fodmap: {                                              // per group: 'low'|'moderate'|'high'|null
    fructans, gos, lactose, fructose, polyols
  },
  portionNotes?: string,                                 // e.g. "low ≤ 1/4 cup, high ≥ 1/2 cup"
  source: 'curated' | 'user' | 'inherited',
  updatedAt, deleted
}

Entry {
  id, date: 'YYYY-MM-DD',                                // local calendar day
  slot: 'breakfast'|'lunch'|'dinner'|'snack'|'alcohol',
  foodId?: string, freeText?: string,                    // one of the two
  portion: 'S'|'M'|'L',
  time?: 'HH:mm', notes?,
  updatedAt, deleted
}

DayLog {
  id: 'YYYY-MM-DD',
  distress: 0..10,
  symptoms: ('bloating'|'pain'|'gas'|'urgency'|'diarrhea'|'constipation'|'nausea'|'reflux')[],
  exercise: 'none'|'light'|'moderate'|'hard',
  notes?, updatedAt, deleted
}

Phase { id, name, kind: 'elimination'|'challenge'|'free', group?, startDate, endDate?, updatedAt, deleted }  // schema only

Settings { apiBase, token, lastPushAt, lastPullAt }
```

Dish FODMAP rating is inherited: worst rating across ingredients, adjusted by portion (S steps a rating down one level, L steps it up one).

## FODMAP reference table (built 2026-09-17)

- `data/fodmap.json`: **608 foods** merged from four research passes (Monash public pages and the Varney 2017 cutoffs, clinical handouts, peer-reviewed composition papers, open datasets and community lists). 585 have a rating; 23 are kept as explicitly untested (mostly liqueurs, wheat beer, hard seltzer, novel sweeteners) so the app shows "?" rather than a false "low".
- Each food carries per-group ratings, serving guidance, source URLs, a confidence level (222 foods have 3+ independent source families agreeing), and every cross-source conflict verbatim (135 foods). Schema in `data/README.md`, provenance in `data/SOURCES.md`.
- `data/ingredient-keywords.json`: 253 label-scanning keywords (inulin, chicory root, HFCS, garlic powder, sorbitol/E420, etc.) with negations, for flagging packaged foods by ingredient list.
- `scripts/merge-fodmap.mjs` rebuilds the table from `research/*.json`. Corrections go in the research files or as in-app overrides, never by hand-editing the output.
- Rebuilt from public sources only, not Monash app data. Every rating is overridable in-app and the override wins.
- UI rules: untested foods show a grey "?", conflicted foods show a small "sources disagree" marker with the conflict text on tap, `variant`-tier lab samples sort below `primary` foods in search.

## Screens

1. **Today** — date scroller; five slot sections; each row shows food name, portion chip, and FODMAP flag pills (e.g. `Fructans H`, `Lactose M`, or a green `Low`). Add row = search box with fuzzy match over foods + reference table, recents and favorites first, comma-separated ingredients creates an ad-hoc dish, no match = free-text entry.
2. **Symptoms** — bottom card on Today: distress slider, symptom chips, exercise picker, notes.
3. **Foods** — library: edit ingredients, override ratings, merge duplicates, promote free-text entries into dishes.
4. **Insights** — timeline (distress vs trailing 72h load by group), top suspects table, per-group exposure, "consider avoiding" list, LLM summary button.
5. **Settings** — API base, token, sync status, manual sync, JSON export.

## Analysis engine (pure TS, unit-tested)

1. **Lagged exposure lift.** For each food, ingredient, and FODMAP group: for every exposure day `d`, take distress on `d+0..d+3`. Compare per-lag means and the window max against baseline (days with no exposure in the prior 3 days). Output lift, exposure count, and the lag with the strongest signal (reveals typical delay). Hide anything with fewer than 4 exposures; mark "confident" at 8+.
2. **Cumulative load.** Daily load per group = sum of portion-weighted ratings. Trailing 72h load vs next-day distress, Spearman correlation per group. Catches "no single food, but the stack" cases.
3. **Confounders.** Exercise appears in the same ranking as a pseudo-food so its effect is visible rather than misattributed.
4. **Symptom-type split.** Same stats filtered to days with a given symptom, so "bloating" and "urgency" can have different suspects.
5. **Tests.** Synthetic generator injects a known trigger with a known lag and checks the engine finds it and does not flag decoys.

Caveats shown in-app: needs ~4–6 weeks of data before results mean much; correlation is not causation; this is a tool for a conversation with a dietitian, not a diagnosis.

## LLM summary

- Endpoint: `POST /analyze` with the digest. Server prompt: cautious analyst, must cite the provided stats, must not invent foods, flags low-sample findings, plain English, ends with 3 concrete things to try. Model choice per the claude-api skill at implementation time.
- Response cached locally with timestamp; button shows "last analyzed N days ago".

## Phases of work

**Phase 1 — usable daily logger (target: log real meals by end of it)**
1. Scaffold Vite + React + TS + Tailwind + PWA plugin; manifest, icons, offline shell.
2. Dexie schema + repository layer; seed reference table.
3. Today screen: slots, add-row search, inline FODMAP flags, portions, free text, recents.
4. Symptoms card.
5. Foods library (basic: view, override rating, add ingredients).
6. GitHub Actions deploy to Pages.
7. DigitalOcean API: Hono + SQLite, `/sync`, bearer auth, systemd unit, nginx server block + certbot, CORS.
8. Sync client: push/pull on app open and after edits; status in Settings.

**Phase 2 — insights**
9. Analysis engine + tests.
10. Insights screen with charts (dataviz skill).
11. `/analyze` endpoint + in-app summary.

**Phase 3 — polish**
12. Dish builder UX, merge duplicates, promote free text.
13. Daily reminder notification (evening: "log today's symptoms").
14. Phases UI on top of the existing schema.
15. JSON export.

## Needed from you before phase 1 step 7

- Subdomain for the API (e.g. `fodmap-api.yourdomain`) and DNS pointed at the droplet.
- Confirm Node is available on the droplet (or OK to install via nvm/apt).
- GitHub repo name (sets the Pages base path).
- Anthropic API key placed in the server env (phase 2).

## Risks

- **Reference table accuracy.** Public sources disagree on ~135 foods and Monash re-rated several categories in 2024–2026. Conflicts are preserved on each record and surfaced in the UI; overrides win. Serving thresholds beyond the "low" cutoff are unpublished, so moderate/high boundaries are conventions.
- **Sparse/uneven data.** The *per-food correlation* stats need your own logs and stay gated behind minimum exposure counts (roughly 4 weeks of logging). The FODMAP flags and per-group load view work from day one because they use the reference table, not your history.
- **Confounding.** Exercise tracked; stress/sleep deliberately out of scope for now, can be added as DayLog fields.
- **nginx collision with Foundry.** New server block on its own subdomain; no changes to the Foundry block.

## Status (2026-09-17)

Built and verified (typecheck, 7 engine tests, headless-Chrome walkthrough with zero console errors):

- **Phase 1:** PWA scaffold, Dexie schema, Today screen with five slots, fuzzy add with inline FODMAP pills, portions, optional times, recents/favorites, free text (auto-promoted to a counted food), comma-separated ad-hoc dishes, symptom card (0–10, symptom chips, exercise, notes, timed flare-ups), Foods library with reference browser, override, favorites, ingredient editor, label scanner, source/conflict view. GitHub Actions workflow for Pages. Sync client. API server (Hono + SQLite) with bearer auth, `/sync`, `/analyze`, `/health`, systemd unit, nginx block, deploy README.
- **Phase 2:** analysis engine in a Web Worker (lagged lift with permutation p-values, cumulative 72 h load correlation, fast-reaction detection, symptom-type split, exercise as pseudo-feature, dish→ingredient→tag attribution), Insights screen with validated palette, table view, suspects, avoid list, LLM readout button. Server-side Claude summary with a constrained prompt.
- **Phase 3:** dish builder, ingredient prompt on free-text foods, allergen/sensitivity tag table (18 tags), Phases screen, evening reminder (best-effort), JSON export/import.

Not done, needs Jon:
1. Create the GitHub repo, push, enable Pages (Source: GitHub Actions). Base path defaults to `/<repo>/`.
2. Droplet: DNS for the API subdomain, then follow `server/deploy/README.md`. Put `ANTHROPIC_API_KEY` in `/etc/gutlog-api.env`.
3. In the app's Settings: API URL + token.

Known limits: reminders cannot fire on a schedule without a push server (in-app nudge + periodic background sync where Chrome allows it). Icons are generated placeholders. Moderate/high serving boundaries are conventions, not published values.
