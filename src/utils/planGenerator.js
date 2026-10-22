// Olympic Coach: plan generator.
// Builds a full plan (weeks -> 7 days -> ordered steps) for a distance / level / sub-time goal.

import {
  LEVELS,
  PEAK_LONG_KM,
  PEAK_WEEKLY_KM,
  TAPER_WEEKS,
  WEEKS,
  levelIndex,
  parsePlanId,
} from '../data/catalog.js'
import { buildNutrition, buildSleep } from '../data/nutrition.js'
import { PHASES, TYPE_META, guidanceFor } from '../data/guidance.js'
import {
  POST_STRETCH,
  PRE_MOBILITY,
  REST_DAY_ITEMS,
  RUN_DRILLS,
} from '../data/routines.js'
import { buildCrossfitSession, buildStrengthSession } from '../data/strength.js'
import { computePaces, formatDuration, formatKm, formatPace, paceRange } from './pace.js'

const FAMILY = { '5k': 'short', '10k': 'short', '16k': 'mid', '21k': 'mid', '32k': 'long', '42k': 'long' }
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const r5 = (x) => Math.round(x * 2) / 2
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x))
const lerp = (a, b, t) => a + (b - a) * t

// ---------------------------------------------------------------- phases
export function phaseOf(w, N, T) {
  if (w === N) return 'race'
  if (w > N - T) return 'taper'
  const W = N - T
  const base = Math.max(1, Math.ceil(W * 0.35))
  const peak = Math.max(2, Math.round(W * 0.25))
  if (w <= base) return 'base'
  if (w > W - peak) return 'peak'
  return 'build'
}

const TAPER_KM = { 2: [0.7], 3: [0.8, 0.6] }
const TAPER_LONG = { 2: [0.6], 3: [0.7, 0.5] }

function weekVolume(w, ctx) {
  const { W, peakKm, peakLong, levelIdx, T } = ctx
  const start = [0.4, 0.55, 0.6, 0.65][levelIdx]
  if (w <= W) {
    const p = W > 1 ? (w - 1) / (W - 1) : 1
    const cut = w % 4 === 0 && w < W
    const f = lerp(start, 1, p) * (cut ? 0.8 : 1)
    return { p: cut ? p * 0.75 : p, cut, scale: 1, weekKm: peakKm * f, longKm: peakLong * f }
  }
  const i = w - W - 1
  if (i < T - 1) {
    return {
      p: 0.85,
      cut: false,
      scale: 0.7,
      weekKm: peakKm * TAPER_KM[T][i],
      longKm: peakLong * TAPER_LONG[T][i],
    }
  }
  return { p: 0.8, cut: false, scale: 0.6, weekKm: peakKm * 0.35, longKm: 0 }
}

// ---------------------------------------------------------------- templates
function slotsFor(levelIdx, phase, w) {
  if (phase === 'race') return ['rest', 'primer', 'easy', 'strides', 'rest', 'shakeout', 'race']
  const base = phase === 'base'
  switch (levelIdx) {
    case 0:
      return ['rest', 'easy', 'strength', 'q', 'rest', 'easy', 'long']
    case 1:
      return ['rest', 'q1', 'strength', base && w % 2 === 0 ? 'crossfit' : 'easy', 'q2', 'recovery', 'long']
    case 2:
      return ['rest', 'q1', base ? 'crossfit' : 'easy', 'q2', 'strength', 'easy', 'long']
    default: {
      const mon = base ? 'crossfit' : phase === 'taper' ? 'rest' : 'recovery'
      return [mon, 'q1', 'easy', 'q2', 'strength', 'easy', 'long']
    }
  }
}

const WEIGHT = { easy: 1, strides: 0.7, recovery: 0.6, q1: 1, q2: 1, q: 0.8 }

// ---------------------------------------------------------------- step helpers
const step = (kind, title, minutes, extra = {}) => ({ kind, title, minutes: Math.round(minutes), ...extra })

function mobilityStep(type) {
  const r = PRE_MOBILITY[type]
  return step('mobility', 'Dynamic stretching & mobility', r.minutes, {
    description: 'Move gently through each position. This wakes up your joints and muscles before the session.',
    exercises: r.items,
  })
}

function stretchStep(type) {
  const r = POST_STRETCH[type]
  return step('stretch', 'Static stretching', r.minutes, {
    description: 'Do these while the muscles are warm. Hold each stretch without bouncing and breathe slowly.',
    exercises: r.items,
  })
}

const easyWarmup = () =>
  step('warmup', 'Warm-up', 5, {
    description: 'Walk briskly for 5 minutes. Then start your run slower than the pace range below for the first 5 minutes.',
  })

const easyCooldown = () =>
  step('cooldown', 'Cool-down walk', 5, {
    description: 'Walk for 5 minutes until your breathing is normal. Do not sit down straight away.',
  })

function paces3(ctx) {
  const P = ctx.paces
  return {
    easyAvg: (P.easy + P.easySlow) / 2,
    easyText: `${paceRange(P.easy, P.easySlow)} /km`,
    recText: `${paceRange(P.recovery, P.recovery + 25)} /km`,
    recAvg: P.recovery + 12,
  }
}

const RUN_WALK = [
  [2, 1],
  [3, 1],
  [5, 1],
]

function sumDay(steps) {
  let km = 0
  let runMin = 0
  let total = 0
  for (const s of steps) {
    total += s.minutes
    if (['warmup', 'main', 'cooldown'].includes(s.kind) && s.running !== false) {
      km += s.distanceKm ?? 0
      runMin += s.minutes
    }
  }
  return { distanceKm: Math.round(km * 10) / 10, runMinutes: runMin, totalMinutes: total }
}

// ---------------------------------------------------------------- run builders
function simpleRun(ctx, w, type, km, opts = {}) {
  const pz = paces3(ctx)
  const isRec = type === 'recovery'
  const avg = isRec ? pz.recAvg : pz.easyAvg
  const text = isRec ? pz.recText : pz.easyText
  let minutes = (km * avg) / 60
  const details = []
  const rw = ctx.levelIdx === 0 && w <= 3 ? RUN_WALK[w - 1] : null
  if (rw) {
    minutes *= 1.15
    details.push(`Run ${rw[0]} min, walk ${rw[1]} min. Repeat until you have covered ${formatKm(km)}.`)
  } else {
    details.push(`Run the full ${formatKm(km)} at a relaxed, conversational pace.`)
  }
  details.push(isRec ? 'Effort: very easy (RPE 2–3 out of 10).' : 'Effort: easy (RPE 3–4 out of 10). You should be able to hold a conversation.')
  if (ctx.levelIdx === 3 && km >= 16) details.push('Elite option: split into a morning and an evening run if your schedule allows.')
  if (opts.strides) details.push('Finish with 4 × 20-second strides (smooth, fast, relaxed) with 60 s walking between each.')

  const main = step('main', isRec ? 'Recovery run' : 'Easy run', minutes, {
    distanceKm: km,
    paceText: text,
    description: isRec ? 'Slower than you think. This run is for blood flow, not fitness.' : 'Build your aerobic base with a relaxed pace.',
    details,
  })
  return { type, main, steps: [mobilityStep(type), easyWarmup(), main, easyCooldown(), stretchStep(type)] }
}

function longRun(ctx, w, vol, km) {
  const { paces, levelIdx, distance } = ctx
  const pz = paces3(ctx)
  let mp = 0
  const MP = { '16k': [2, 5], '21k': [3, 8], '32k': [4, 14], '42k': [5, 20] }[distance.id]
  const ph = ctx.phaseOf(w)
  if (MP && levelIdx >= 1 && (ph === 'build' || ph === 'peak') && !vol.cut && (ph === 'peak' || w % 2 === 1)) {
    mp = r5(Math.min(lerp(MP[0], MP[1], vol.p), km * 0.5))
    if (mp < 2) mp = 0
  }
  const easyKm = km - mp
  let minutes = (easyKm * pz.easyAvg) / 60 + (mp * paces.marathon) / 60
  const details = []
  const rw = levelIdx === 0 && w <= 3 ? RUN_WALK[w - 1] : null
  if (rw) {
    minutes *= 1.15
    details.push(`Run ${rw[0]} min, walk ${rw[1]} min. Repeat until you have covered ${formatKm(km)}.`)
  } else if (mp) {
    details.push(`First ${formatKm(easyKm)}: easy at ${pz.easyText}.`)
    details.push(`Last ${formatKm(mp)}: steady at marathon pace ${formatPace(paces.marathon)} /km. Control it, do not race it.`)
  } else {
    details.push(`Run ${formatKm(km)} easy and even. Start slower than you want to.`)
  }
  details.push('Practise your race-day fuelling, hydration, shoes and kit during this run.')
  const main = step('main', 'Long slow distance (LSD) run', minutes, {
    distanceKm: km,
    paceText: mp ? `${pz.easyText} / MP ${formatPace(paces.marathon)} /km` : pz.easyText,
    description: 'The key endurance session of the week. Time on your feet builds the aerobic engine.',
    details,
  })
  return {
    type: 'long',
    main,
    steps: [mobilityStep('long'), easyWarmup(), main, easyCooldown(), stretchStep('long')],
    mpKm: mp,
  }
}

// Quality sessions -----------------------------------------------------------
const nRange = (spec, p, ctx, scale) => {
  const adj = [-1, 0, 1, 2][ctx.levelIdx]
  const n = Math.round(lerp(spec.n[0], spec.n[1], p)) + adj
  return Math.max(3, Math.round(n * scale))
}

function intervalSpec(ctx, ph, w) {
  const f = ctx.family
  const id = ctx.distance.id
  const build = {
    short: [{ repM: 400, n: [6, 10], rec: 60 }, { repM: 800, n: [4, 6], rec: 90 }],
    mid: [{ repM: 800, n: [5, 7], rec: 90 }, { repM: 1000, n: [4, 6], rec: 120 }],
    long: [{ repM: 1000, n: [4, 6], rec: 120 }],
  }[f]
  const peak = {
    short: [{ repM: id === '5k' ? 1000 : 1200, n: id === '5k' ? [4, 6] : [4, 5], rec: 120 }],
    mid: [{ repM: 1200, n: [4, 5], rec: 120 }, { repM: 1600, n: [3, 4], rec: 150 }],
    long: [{ repM: 1200, n: [4, 5], rec: 120 }],
  }[f]
  const list = ph === 'build' ? build : peak
  return list[w % list.length]
}

function wuCdKm(ctx, target, mainKm) {
  const cap = [3, 4, 6, 8][ctx.levelIdx]
  const min = [1.5, 2, 2.5, 3][ctx.levelIdx]
  return r5(clamp((target - mainKm) / 2, min, cap))
}

function qualitySteps(ctx, type, w, target, main) {
  const pz = paces3(ctx)
  const wuKm = wuCdKm(ctx, target, main.distanceKm)
  const warm = step('warmup', 'Warm-up jog', (wuKm * pz.easyAvg) / 60, {
    distanceKm: wuKm,
    paceText: pz.easyText,
    description: `Jog ${formatKm(wuKm)} easy to raise your heart rate and body temperature.`,
  })
  const drillItems = [...RUN_DRILLS]
  const drills = step('drills', type === 'interval' ? 'Running drills & strides' : 'Running drills', 7, {
    description: 'Short drills sharpen form and switch on the nervous system before the hard work.',
    exercises: [
      ...drillItems,
      ...(type === 'interval' || type === 'race'
        ? [{ exerciseId: 'strides', rx: '4 × 80–100 m with walk-back recovery' }]
        : []),
    ],
  })
  const cool = step('cooldown', 'Cool-down jog', (wuKm * pz.easyAvg) / 60, {
    distanceKm: wuKm,
    paceText: pz.recText,
    description: `Jog ${formatKm(wuKm)} very easy to flush the legs and bring your heart rate down.`,
  })
  return [mobilityStep(type), warm, drills, main, cool, stretchStep(type)]
}

function fartlekMain(ctx, n, onSec, offSec, label) {
  const P = ctx.paces
  const km = (n * onSec) / P.interval + (n * offSec) / P.easySlow
  const minutes = (n * (onSec + offSec)) / 60
  return step('main', label, minutes, {
    distanceKm: Math.round(km * 10) / 10,
    paceText: `Fast: ${formatPace(P.interval)} /km effort`,
    description: 'Unstructured speed play: alternate fast and easy running by time.',
    details: [
      `${n} × (${onSec} s fast / ${offSec} s easy jog)`,
      `Fast: strong and relaxed, about ${formatPace(P.interval)} /km (5K effort). Easy: slow jog.`,
      'Effort on the fast reps: RPE 7 out of 10, never all-out.',
    ],
  })
}

function repsMain(ctx, spec, n, label) {
  const P = ctx.paces
  const fast = spec.repM >= 1600 ? (P.threshold + P.interval) / 2 : P.interval
  const repKm = spec.repM / 1000
  const km = n * repKm + ((n - 1) * spec.rec) / P.easySlow
  const minutes = (n * repKm * fast + (n - 1) * spec.rec) / 60
  return step('main', label, minutes, {
    distanceKm: Math.round(km * 10) / 10,
    paceText: `${formatPace(fast)} /km`,
    description: 'Controlled hard repetitions to raise your VO2max and running economy.',
    details: [
      `${n} × ${spec.repM} m at ${formatPace(fast)} /km (about ${formatDuration(repKm * fast)} per rep)`,
      `Recovery: ${spec.rec} s very easy jog between reps`,
      'Run the last rep as fast as the first. If you slip by more than 5 s/km, stop the session.',
    ],
  })
}

function hillsMain(ctx, n) {
  const km = n * 0.4
  const minutes = (n * (75 + 105)) / 60
  return step('main', 'Hill repeats', minutes, {
    distanceKm: Math.round(km * 10) / 10,
    paceText: 'Hard effort, by feel',
    description: 'Hills build strength and power with lower impact than fast flat running.',
    details: [
      `${n} × 75 s uphill (5–7% grade) at a hard effort, RPE 8`,
      'Jog or walk back down for full recovery (about 105 s)',
      'Drive the knees, tall posture, quick light feet at the top.',
    ],
  })
}

function tempoMain(ctx, T, cruise) {
  const P = ctx.paces
  if (cruise) {
    const m = { short: 5, mid: 8, long: 10 }[ctx.family]
    const n = Math.max(2, Math.round(T / m))
    const km = (n * m * 60) / P.threshold + ((n - 1) * 60) / P.easySlow
    return step('main', 'Cruise intervals (threshold)', n * m + (n - 1), {
      distanceKm: Math.round(km * 10) / 10,
      paceText: `${formatPace(P.threshold)} /km`,
      description: 'Threshold pace broken by short jog recoveries so you can hold the pace for longer.',
      details: [
        `${n} × ${m} min at ${formatPace(P.threshold)} /km`,
        '60 s easy jog between each',
        'Effort: comfortably hard, RPE 7 out of 10. You can say only a few words at a time.',
      ],
    })
  }
  const km = (T * 60) / P.threshold
  return step('main', 'Tempo run (threshold)', T, {
    distanceKm: Math.round(km * 10) / 10,
    paceText: `${formatPace(P.threshold)} /km`,
    description: 'A continuous run at lactate threshold pace to raise the speed you can sustain.',
    details: [
      `${T} minutes continuous at ${formatPace(P.threshold)} /km`,
      'Effort: comfortably hard, RPE 7 out of 10. Start controlled, finish strong.',
      'Do not start faster than threshold pace in the first 3 minutes.',
    ],
  })
}

function tempoMinutes(ctx, p, scale) {
  const [lo, hi] = { short: [10, 25], mid: [15, 35], long: [20, 50] }[ctx.family]
  const adj = [-4, 0, 4, 8][ctx.levelIdx]
  const cap = [20, 30, 40, 60][ctx.levelIdx]
  return clamp(Math.round(lerp(lo, hi, p) * scale) + adj, 8, cap)
}

function quality(ctx, slot, w, vol, target) {
  const ph = ctx.phaseOf(w)
  const lvl = ctx.levelIdx
  const p = vol.p
  const scale = vol.scale

  // Beginner: one gentle quality day
  if (slot === 'q') {
    if (ph === 'base' || ph === 'taper') {
      const km = r5(clamp(target, 1.5, 99))
      return simpleRun(ctx, w, 'easy', km, { strides: lvl === 0 && w > 3 })
    }
    if (ph === 'build') {
      const n = Math.max(3, Math.round(lerp(4, 8, p) * scale))
      const main = fartlekMain(ctx, n, 45, 90, 'Fartlek (speed play)')
      return { type: 'interval', main, steps: qualitySteps(ctx, 'interval', w, target, main) }
    }
    const main = tempoMain(ctx, tempoMinutes(ctx, p, 1) > 18 ? 18 : Math.max(8, tempoMinutes(ctx, p, 1)), false)
    return { type: 'threshold', main, steps: qualitySteps(ctx, 'threshold', w, target, main) }
  }

  if (slot === 'q1') {
    let main
    if (ph === 'base') {
      const onSec = { short: 60, mid: 90, long: 120 }[ctx.family]
      const n = Math.round(lerp(6, 10, p)) + lvl - 1
      main = fartlekMain(ctx, Math.max(4, n), onSec, onSec, 'Fartlek (speed play)')
    } else if (ph === 'build' && w % 2 === 0 && ctx.family !== 'long' && lvl >= 1) {
      main = hillsMain(ctx, Math.round(lerp(6, 10, p)) + lvl - 1)
    } else {
      const spec = intervalSpec(ctx, ph === 'build' ? 'build' : 'peak', w)
      main = repsMain(ctx, spec, nRange(spec, p, ctx, scale), `Intervals ${spec.repM} m`)
    }
    return { type: 'interval', main, steps: qualitySteps(ctx, 'interval', w, target, main) }
  }

  // q2: threshold
  const T = tempoMinutes(ctx, p, scale)
  const cruise = ph !== 'base' && w % 2 === 0 && lvl >= 1 && T >= 20
  const main = tempoMain(ctx, T, cruise)
  return { type: 'threshold', main, steps: qualitySteps(ctx, 'threshold', w, target, main) }
}

// Race week ---------------------------------------------------------------
function primer(ctx) {
  const { distance, paces } = ctx
  const is5 = distance.id === '5k'
  const n = is5 ? 4 : 3
  const repM = is5 ? 400 : 1000
  const rec = 90
  const km = n * (repM / 1000) + ((n - 1) * rec) / paces.easySlow
  const minutes = (n * (repM / 1000) * paces.goal + (n - 1) * rec) / 60
  const main = step('main', 'Race-pace primer', minutes, {
    distanceKm: Math.round(km * 10) / 10,
    paceText: `${formatPace(paces.goal)} /km`,
    description: 'A short, sharp session at goal pace to remind your legs what race day feels like.',
    details: [
      `${n} × ${repM} m at goal race pace ${formatPace(paces.goal)} /km`,
      `${rec} s easy jog between reps`,
      'This should feel easy and smooth. Stop if it feels hard.',
    ],
  })
  const wuKm = r5(clamp(ctx.peakKm * 0.03, 1.5, 3))
  return { type: 'interval', main, steps: qualitySteps({ ...ctx, levelIdx: 1 }, 'interval', 0, wuKm * 2 + main.distanceKm, main) }
}

function raceDay(ctx) {
  const { distance, goal, paces } = ctx
  const pz = paces3(ctx)
  const wuKm = r5(clamp(distance.km * 0.1, 1.5, 3))
  const warm = step('warmup', 'Warm-up jog', (wuKm * pz.easyAvg) / 60, {
    distanceKm: wuKm,
    paceText: pz.easyText,
    description: `Jog ${formatKm(wuKm)} easy, 15 to 20 minutes before the start.`,
  })
  const drills = step('drills', 'Drills & strides', 7, {
    description: 'Quick activation. Finish at least 10 minutes before the gun.',
    exercises: [...RUN_DRILLS, { exerciseId: 'strides', rx: '4 × 80 m building to race pace' }],
  })
  const splits = []
  const every = distance.km > 21 ? 5 : distance.km > 10 ? 5 : 1
  for (let k = every; k < distance.km; k += every) splits.push(`${k} km: ${formatDuration(k * paces.goal)}`)
  splits.push(`Finish ${formatKm(distance.km)}: ${formatDuration(goal.targetSec)}`)
  const main = step('main', `Race: ${distance.label}`, goal.targetSec / 60, {
    distanceKm: distance.km,
    paceText: `${formatPace(paces.goal)} /km`,
    description: `Goal: ${goal.label}. Target finish ${formatDuration(goal.targetSec)}.`,
    details: [
      `Goal pace ${formatPace(paces.goal)} /km. Start 5–10 s/km slower in the first kilometre.`,
      'Run even splits through the middle and run the last third on will power.',
      ...splits,
    ],
  })
  const cool = step('cooldown', 'Cool-down', 10, {
    distanceKm: 1,
    paceText: pz.recText,
    description: 'Walk and jog gently for 10 minutes. Drink, eat and keep moving.',
  })
  return { type: 'race', main, steps: [mobilityStep('race'), warm, drills, main, cool, stretchStep('race')] }
}

// Strength / rest ------------------------------------------------------------
function strengthDay(ctx, phase, rotation) {
  const s = buildStrengthSession({ phase: phase === 'race' ? 'taper' : phase, levelIdx: ctx.levelIdx, rotation })
  const main = step('strength', s.title, s.minutes, {
    description: s.focus,
    sets: s.items,
  })
  return {
    type: 'strength',
    main,
    steps: [
      mobilityStep('strength'),
      step('warmup', 'Warm-up', 5, {
        running: false,
        description: '5 minutes of easy cycling or brisk walking, then 10 glute bridges to activate the glutes.',
      }),
      main,
      step('cooldown', 'Cool-down', 5, {
        running: false,
        description: 'Walk or spin easily for 5 minutes until your breathing settles.',
      }),
      stretchStep('strength'),
    ],
  }
}

function crossfitDay(ctx, rotation) {
  const s = buildCrossfitSession({ levelIdx: ctx.levelIdx, rotation })
  const main = step('crossfit', s.title, s.minutes, { description: s.focus, sets: s.items })
  return {
    type: 'crossfit',
    main,
    steps: [
      mobilityStep('crossfit'),
      step('warmup', 'Warm-up', 5, {
        running: false,
        description: '5 minutes on the rower or bike at an easy effort, then 10 air squats and 10 push-ups.',
      }),
      main,
      step('cooldown', 'Cool-down', 5, {
        running: false,
        description: 'Easy spin or walk for 5 minutes. Let your heart rate drop below 100 beats per minute.',
      }),
      stretchStep('crossfit'),
    ],
  }
}

function restDay() {
  const mk = (kind, title, minutes, items, description) =>
    step(kind, title, minutes, { running: false, description, exercises: items })
  const steps = [
    mk('rest', 'Breathing reset', 5, REST_DAY_ITEMS.breathing, 'Calm the nervous system.'),
    mk('rest', 'Mobility flow', 12, REST_DAY_ITEMS.mobility, 'Gentle mobility to keep the hips and back loose.'),
    mk('rest', 'Foam rolling', 8, REST_DAY_ITEMS.foam, 'Roll slowly over the soft tissue.'),
    mk('rest', 'Legs up & easy walk', 15, REST_DAY_ITEMS.recover, 'Finish with passive recovery. Add an easy walk if you feel good.'),
  ]
  const main = steps[1]
  return { type: 'rest', main, steps }
}

// ---------------------------------------------------------------- titles
function titleFor(type, built, ctx) {
  const km = built.distanceKm
  switch (type) {
    case 'rest':
      return 'Rest day: recover and rebuild'
    case 'strength':
    case 'crossfit':
      return built.main.title
    case 'race':
      return `Race day: ${ctx.distance.label}`
    case 'interval':
    case 'threshold':
      return built.main.title
    case 'long':
      return `Long run: ${formatKm(km)}`
    case 'recovery':
      return `Recovery run: ${formatKm(km)}`
    default:
      return `Easy run: ${formatKm(km)}`
  }
}

function summaryFor(type, built) {
  const m = built.main
  switch (type) {
    case 'rest':
      return 'No running. Mobility, breathing and sleep.'
    case 'strength':
    case 'crossfit':
      return `${m.sets.length} exercises · ${m.minutes} min`
    default:
      return `${formatKm(built.distanceKm)} · ${m.paceText}`
  }
}

const THEMES = {
  base: 'Aerobic foundation: easy miles, strong tissues.',
  build: 'Building: stronger quality sessions and longer runs.',
  peak: 'Peak: race-specific work at the highest load.',
  taper: 'Taper: less volume, same sharpness. Rest more.',
  race: 'Race week: stay calm, sleep, fuel, and enjoy it.',
}

// ---------------------------------------------------------------- main
const cache = new Map()

export function buildPlan(id) {
  if (cache.has(id)) return cache.get(id)
  const parsed = parsePlanId(id)
  if (!parsed) return null
  const { distance, level, goal } = parsed
  const levelIdx = levelIndex(level.id)
  const N = WEEKS[distance.id][level.id]
  const T = TAPER_WEEKS[distance.id]
  const paces = computePaces(distance.km, goal.targetSec)
  const ctx = {
    distance,
    level,
    goal,
    levelIdx,
    N,
    T,
    W: N - T,
    paces,
    family: FAMILY[distance.id],
    peakKm: PEAK_WEEKLY_KM[distance.id][levelIdx],
    peakLong: PEAK_LONG_KM[distance.id][levelIdx],
    phaseOf: (w) => phaseOf(w, N, T),
  }

  let strengthRot = 0
  let crossRot = 0
  const flat = []
  const weeks = []

  for (let w = 1; w <= N; w++) {
    const phase = phaseOf(w, N, T)
    const vol = weekVolume(w, ctx)
    const slots = slotsFor(levelIdx, phase, w)
    const isRaceWeek = phase === 'race'
    const longKm = r5(Math.max(2, vol.longKm))
    const runSlots = slots.filter((s) => WEIGHT[s])
    const wsum = runSlots.reduce((a, s) => a + WEIGHT[s], 0)
    const remaining = Math.max(wsum * 1.5, vol.weekKm - (isRaceWeek ? 0 : longKm))
    const share = (s) => (wsum ? (remaining * WEIGHT[s]) / wsum : 0)
    const days = []

    slots.forEach((slot, i) => {
      let built
      switch (slot) {
        case 'rest':
          built = restDay()
          break
        case 'strength':
          built = strengthDay(ctx, phase, strengthRot++)
          break
        case 'crossfit':
          built = crossfitDay(ctx, crossRot++)
          break
        case 'long':
          built = longRun(ctx, w, vol, longKm)
          break
        case 'recovery':
          built = simpleRun(ctx, w, 'recovery', r5(clamp(share('recovery'), 1.5, 99)))
          break
        case 'easy': {
          const km = isRaceWeek
            ? r5(clamp(ctx.peakKm * (i === 2 ? 0.09 : 0.07), 3, 10))
            : r5(clamp(share('easy'), 1.5, 99))
          built = simpleRun(ctx, w, 'easy', km)
          break
        }
        case 'strides':
          built = simpleRun(ctx, w, 'easy', r5(clamp(ctx.peakKm * 0.06, 3, 8)), { strides: true })
          break
        case 'shakeout':
          built = simpleRun(ctx, w, 'recovery', r5(clamp(ctx.peakKm * 0.04, 2, 5)), { strides: true })
          break
        case 'primer':
          built = primer(ctx)
          break
        case 'race':
          built = raceDay(ctx)
          break
        default:
          built = quality(ctx, slot, w, vol, share(slot))
      }
      const { distanceKm, runMinutes, totalMinutes } = sumDay(built.steps)
      const type = built.type
      const durationMin = built.main.kind === 'main' ? runMinutes : built.main.minutes
      const day = {
        id: `${id}:w${w}d${i + 1}`,
        week: w,
        day: i + 1,
        dayName: DAY_NAMES[i],
        phase,
        type,
        typeLabel: TYPE_META[type].label,
        title: '',
        summary: '',
        distanceKm,
        runMinutes,
        totalMinutes,
        durationMin,
        paceText: built.main.paceText ?? null,
        steps: built.steps,
        mainStep: built.main,
        _built: built,
      }
      day.title = titleFor(type, { ...built, distanceKm }, ctx)
      day.summary = summaryFor(type, { ...built, distanceKm })
      days.push(day)
      flat.push(day)
    })

    weeks.push({
      number: w,
      phase,
      phaseLabel: PHASES[phase].label,
      cutback: vol.cut,
      theme: vol.cut ? 'Recovery week: lighter load to absorb the training.' : THEMES[phase],
      days,
      totalKm: Math.round(days.reduce((s, d) => s + d.distanceKm, 0) * 10) / 10,
      runCount: days.filter((d) => ['easy', 'recovery', 'interval', 'threshold', 'long', 'race'].includes(d.type)).length,
    })
  }

  // second pass: needs the next day's type for fuelling / sleep advice
  flat.forEach((day, i) => {
    const nextType = flat[i + 1]?.type ?? null
    const durationMin = day.durationMin
    day.nutrition = buildNutrition({ type: day.type, durationMin, level: level.id, nextType })
    day.sleep = buildSleep({ type: day.type, level: level.id, nextType })
    day.guidance = guidanceFor(day.type, day.phase)
    delete day._built
  })

  const plan = {
    id,
    distance,
    level,
    goal,
    paces,
    weekCount: N,
    weeks,
    totalDays: flat.length,
    peakWeekKm: Math.max(...weeks.map((x) => x.totalKm)),
    levels: LEVELS,
  }
  cache.set(id, plan)
  return plan
}

export function getDay(plan, week, day) {
  return plan?.weeks[week - 1]?.days[day - 1] ?? null
}

// Navigation across week boundaries: day 7 of week n -> day 1 of week n+1
export function neighbors(plan, week, day) {
  let prev = null
  let next = null
  if (day > 1) prev = { week, day: day - 1 }
  else if (week > 1) prev = { week: week - 1, day: 7 }
  if (day < 7) next = { week, day: day + 1 }
  else if (week < plan.weekCount) next = { week: week + 1, day: 1 }
  return { prev, next }
}
