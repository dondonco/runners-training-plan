// Strength and cross-fit session builders.
// Designed by the Olympic Coach, with the Sports PT choosing the exercises and
// the Rehab Doctor limiting load/range so each exercise stays joint-friendly.

const UNILATERAL = new Set([
  'single-leg-bridge', 'clamshell', 'side-lying-abduction', 'split-squat', 'step-up',
  'sl-rdl', 'sl-hop', 'heel-drop', 'short-foot', 'bird-dog', 'dead-bug', 'side-plank',
  'copenhagen', 'pallof', 'banded-walk',
])
const HOLDS = new Set(['plank', 'side-plank', 'copenhagen'])
const LOADED = new Set(['goblet-squat', 'split-squat', 'sl-rdl', 'step-up', 'hip-thrust', 'calf-raise', 'soleus-raise'])
const PLYO = new Set(['pogo', 'skater-bound', 'sl-hop'])

const REPS = { base: '12–15', build: '8–12', peak: '6–8', taper: '8' }
const HOLD_BASE = [20, 30, 40, 45]
const HOLD_ADJ = { base: 0, build: 5, peak: 10, taper: -10 }
const REST_SEC = { base: 45, build: 60, peak: 90, taper: 45 }

const SESSIONS = {
  A: {
    title: 'Strength A: Hips & glutes',
    focus: 'Glute max/med strength and pelvic control (ITBS, hip bursitis and knee prevention).',
    byLevel: [
      ['glute-bridge', 'clamshell', 'side-lying-abduction', 'side-plank', 'dead-bug'],
      ['single-leg-bridge', 'banded-walk', 'side-lying-abduction', 'side-plank', 'bird-dog'],
      ['hip-thrust', 'banded-walk', 'single-leg-bridge', 'copenhagen', 'side-plank'],
      ['hip-thrust', 'banded-walk', 'single-leg-bridge', 'copenhagen', 'side-plank', 'pallof'],
    ],
  },
  B: {
    title: 'Strength B: Single-leg power',
    focus: 'Single-leg strength, hamstrings and calves for propulsion and durability.',
    byLevel: [
      ['goblet-squat', 'step-up', 'glute-bridge', 'calf-raise', 'plank'],
      ['goblet-squat', 'split-squat', 'sl-rdl', 'calf-raise', 'plank'],
      ['split-squat', 'sl-rdl', 'step-up', 'slider-curl', 'calf-raise', 'plank'],
      ['split-squat', 'sl-rdl', 'step-up', 'slider-curl', 'calf-raise', 'plank'],
    ],
    plyo: [[], [], ['pogo'], ['pogo', 'skater-bound']],
  },
  C: {
    title: 'Strength C: Calves, tendons & core',
    focus: 'Achilles, calf, shin and foot resilience plus trunk stiffness.',
    byLevel: [
      ['calf-raise', 'tib-raise', 'short-foot', 'bird-dog', 'plank'],
      ['calf-raise', 'soleus-raise', 'tib-raise', 'short-foot', 'pallof', 'dead-bug'],
      ['calf-raise', 'soleus-raise', 'heel-drop', 'tib-raise', 'short-foot', 'pallof', 'dead-bug'],
      ['calf-raise', 'soleus-raise', 'heel-drop', 'tib-raise', 'short-foot', 'pallof', 'dead-bug'],
    ],
    plyo: [[], [], [], ['sl-hop']],
  },
}

const ORDER = ['A', 'B', 'C']

function prescribe(exerciseId, { phase, levelIdx }) {
  const baseSets = phase === 'taper' ? 2 : levelIdx === 0 ? 2 : levelIdx === 3 && phase !== 'base' ? 4 : 3
  const side = UNILATERAL.has(exerciseId)
  if (PLYO.has(exerciseId)) {
    return {
      exerciseId,
      sets: phase === 'taper' ? 2 : 3,
      reps: exerciseId === 'pogo' ? '20 contacts' : '6 each side',
      restSec: 60,
      load: 'Bodyweight, quiet landings',
    }
  }
  if (HOLDS.has(exerciseId)) {
    const sec = HOLD_BASE[levelIdx] + HOLD_ADJ[phase]
    return { exerciseId, sets: baseSets, reps: `${sec} s${side ? ' each side' : ''}`, restSec: 30, load: 'Bodyweight' }
  }
  let load = 'Bodyweight'
  if (LOADED.has(exerciseId) && !(levelIdx === 0 && phase === 'base')) {
    load = phase === 'peak' ? 'Heavy (RPE 8): last rep hard but clean' : 'Moderate (RPE 7): 2 reps left in reserve'
  }
  return {
    exerciseId,
    sets: baseSets,
    reps: `${REPS[phase]}${side ? ' each side' : ''}`,
    restSec: REST_SEC[phase],
    load,
  }
}

export function buildStrengthSession({ phase, levelIdx, rotation }) {
  const key = ORDER[rotation % ORDER.length]
  const tpl = SESSIONS[key]
  const showPlyo = levelIdx >= 2 && (phase === 'build' || phase === 'peak')
  const ids = [...tpl.byLevel[levelIdx], ...(showPlyo ? (tpl.plyo?.[levelIdx] ?? []) : [])]
  const items = ids.map((id) => prescribe(id, { phase, levelIdx }))
  const seconds = items.reduce((s, x) => s + x.sets * (40 + x.restSec), 0)
  return {
    title: tpl.title,
    focus: tpl.focus,
    items,
    minutes: Math.max(20, Math.round(seconds / 60 / 5) * 5),
  }
}

const CIRCUITS = {
  X: {
    title: 'Cross-fit X: Power & pull',
    ids: ['kb-swing', 'push-up', 'goblet-squat', 'inverted-row', 'air-bike'],
  },
  Y: {
    title: 'Cross-fit Y: Engine & core',
    ids: ['sled-push', 'step-back-burpee', 'farmers-carry', 'mountain-climber', 'row-erg'],
  },
  Z: {
    title: 'Cross-fit Z: Low-impact grinder',
    ids: ['air-bike', 'kb-swing', 'inverted-row', 'step-up', 'plank'],
  },
}
const CIRCUIT_ORDER = ['X', 'Y', 'Z']
const ROUNDS = [3, 4, 4, 5]
const WORK = [30, 40, 45, 45]
const REST = [30, 20, 20, 15]

export function buildCrossfitSession({ levelIdx, rotation }) {
  const c = CIRCUITS[CIRCUIT_ORDER[rotation % CIRCUIT_ORDER.length]]
  const rounds = ROUNDS[levelIdx]
  const work = WORK[levelIdx]
  const rest = REST[levelIdx]
  const items = c.ids.map((exerciseId) => ({
    exerciseId,
    sets: rounds,
    reps: `${work} s work`,
    restSec: rest,
    load: 'Moderate effort (RPE 6–7)',
  }))
  const roundRest = 75
  const minutes = Math.round(((c.ids.length * (work + rest) + roundRest) * rounds) / 60 / 5) * 5
  return {
    title: c.title,
    focus: `Circuit: ${rounds} rounds. Work ${work} s, rest ${rest} s between stations, 75 s rest between rounds.`,
    items,
    minutes,
  }
}
