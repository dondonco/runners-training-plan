# Runner's Training Plan

Mobile-friendly React app with 48 generated training plans (6 distances × 4 levels × 2 sub-time goals).

## Run

```bash
npm install
npm run dev       # http://127.0.0.1:5173
npm test          # vitest (unit + UI flow tests)
npm run lint
npm run build
```

## Personas

| Persona | Owns |
| --- | --- |
| Olympic coach | `src/utils/planGenerator.js`, `src/utils/pace.js`: phases, volumes, paces (VDOT), sessions |
| Nutritionist | `src/data/nutrition.js`: pre / during / post fuelling, hydration, recovery aids, sleep |
| Rehab doctor | `src/data/injuries.js`, `guidance.js`: triage, red flags, safe limits |
| Sports PT | `src/data/exercises.js`, `strength.js`, `injuries.js`: exercises and rehab phases |

## Routes (hash based)

- `#/plan`: overview · `#/plan/week/N`: week cards · `#/plan/week/N/day/M`: day card
- `#/log`: daily recorder + charts · `#/clinic`: injury clinic · `#/glossary`

Day navigation crosses week boundaries: Week N day 7 → Next day → Week N+1 day 1.

## Data & privacy

Progress and run logs are stored only in the browser's `localStorage` (key `rtp.v1`). Stored data is validated on load.
Dev and preview servers bind to 127.0.0.1 only.

Educational content only; not medical advice.
