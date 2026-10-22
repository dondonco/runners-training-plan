import { describe, expect, it } from 'vitest'
import { allPlanIds, DISTANCES, getGoals, LEVELS, parsePlanId } from '../data/catalog.js'
import { getExercise } from '../data/exercises.js'
import { GLOSSARY } from '../data/glossary.js'
import { INJURIES } from '../data/injuries.js'
import { buildPlan, neighbors } from '../utils/planGenerator.js'
import { computePaces, formatDuration, formatPace, parseDuration, vdotFromRace } from '../utils/pace.js'
import { sanitizeLog } from '../utils/storage.js'
import { matchInjuries } from '../components/InjuryClinic.jsx'
import { filterGlossary } from '../components/Glossary.jsx'
import { weeklyDistance } from '../components/ProgressCharts.jsx'

describe('catalog', () => {
  it('covers 6 distances x 4 levels x 2 goals = 48 plans', () => {
    expect(DISTANCES).toHaveLength(6)
    expect(LEVELS).toHaveLength(4)
    expect(allPlanIds()).toHaveLength(48)
  })
  it('goal limits get faster with each level', () => {
    for (const d of DISTANCES) {
      const limits = LEVELS.flatMap((l) => getGoals(d.id, l.id).map((g) => g.limitMin))
      for (let i = 1; i < limits.length; i++) expect(limits[i]).toBeLessThan(limits[i - 1])
    }
  })
  it('parsePlanId rejects invalid ids', () => {
    expect(parsePlanId('5k-beginner-sub40')).not.toBeNull()
    expect(parsePlanId('5k-beginner-sub99')).toBeNull()
    expect(parsePlanId('<script>')).toBeNull()
    expect(parsePlanId(null)).toBeNull()
  })
})

describe('pace utils', () => {
  it('computes a sensible VDOT for a 20:00 5K (~49.8)', () => {
    expect(vdotFromRace(5000, 1200)).toBeCloseTo(49.8, 0)
  })
  it('orders paces from slow to fast', () => {
    const p = computePaces(10, 3000)
    expect(p.recovery).toBeGreaterThan(p.easy)
    expect(p.easy).toBeGreaterThan(p.marathon)
    expect(p.marathon).toBeGreaterThan(p.threshold)
    expect(p.threshold).toBeGreaterThan(p.interval)
    expect(p.interval).toBeGreaterThan(p.repetition)
  })
  it('formats and parses time', () => {
    expect(formatPace(330)).toBe('5:30')
    expect(formatDuration(3725)).toBe('1:02:05')
    expect(parseDuration('45:30')).toBe(2730)
    expect(parseDuration('1:05:00')).toBe(3900)
    expect(parseDuration('abc')).toBeNull()
    expect(parseDuration('1:2:3:4')).toBeNull()
  })
})

describe('day navigation', () => {
  const plan = buildPlan('5k-beginner-sub40')
  it('week 1 day 1 has no prev, but has next', () => {
    const n = neighbors(plan, 1, 1)
    expect(n.prev).toBeNull()
    expect(n.next).toEqual({ week: 1, day: 2 })
  })
  it('week 1 day 7 next goes to week 2 day 1', () => {
    expect(neighbors(plan, 1, 7).next).toEqual({ week: 2, day: 1 })
  })
  it('week 2 day 1 prev goes to week 1 day 7', () => {
    expect(neighbors(plan, 2, 1).prev).toEqual({ week: 1, day: 7 })
  })
  it('last day has no next', () => {
    expect(neighbors(plan, plan.weekCount, 7).next).toBeNull()
  })
})

describe('every generated plan', () => {
  for (const id of allPlanIds()) {
    it(id, () => {
      const plan = buildPlan(id)
      expect(plan.weeks).toHaveLength(plan.weekCount)
      const last = plan.weeks.at(-1).days.at(-1)
      expect(last.type).toBe('race')
      for (const w of plan.weeks) {
        expect(w.days).toHaveLength(7)
        for (const d of w.days) {
          expect(d.steps.length).toBeGreaterThan(0)
          expect(Number.isFinite(d.distanceKm)).toBe(true)
          expect(Number.isFinite(d.totalMinutes)).toBe(true)
          expect(d.nutrition.pre.foods.length).toBeGreaterThan(0)
          expect(d.nutrition.post.foods.length).toBeGreaterThan(0)
          expect(d.sleep.hours).toBeTruthy()
          const kinds = d.steps.map((s) => s.kind)
          if (d.type !== 'rest') expect(kinds[0]).toBe('mobility')
          if (d.type !== 'rest') expect(kinds.at(-1)).toBe('stretch')
          if (['easy', 'recovery', 'interval', 'threshold', 'long', 'race'].includes(d.type)) {
            expect(d.distanceKm).toBeGreaterThan(0)
            expect(d.paceText).toBeTruthy()
            expect(kinds).toContain('warmup')
            expect(kinds).toContain('cooldown')
          }
          for (const s of d.steps) {
            expect(Number.isFinite(s.minutes)).toBe(true)
            for (const e of [...(s.exercises ?? []), ...(s.sets ?? [])]) expect(getExercise(e.exerciseId)).not.toBeNull()
            if (s.sets) for (const e of s.sets) expect(e.sets && e.reps).toBeTruthy()
          }
        }
      }
    })
  }
  it('strength days list sets, reps and exercise instructions', () => {
    const plan = buildPlan('10k-intermediate-sub50')
    const d = plan.weeks.flatMap((w) => w.days).find((x) => x.type === 'strength')
    const main = d.steps.find((s) => s.kind === 'strength')
    expect(main.sets.length).toBeGreaterThan(3)
    for (const e of main.sets) {
      const ex = getExercise(e.exerciseId)
      expect(ex.how.length).toBeGreaterThan(0)
      expect(ex.tailored.coach && ex.tailored.pt && ex.tailored.rehab).toBeTruthy()
    }
  })
  it('stays within peak-distance sanity limits', () => {
    const plan = buildPlan('42k-advanced-sub190')
    expect(Math.max(...plan.weeks.flatMap((w) => w.days).map((d) => d.distanceKm))).toBeLessThan(48)
  })
})

describe('storage validation', () => {
  const good = { date: '2025-01-05', distanceKm: 10, durationSec: 3000 }
  it('accepts a valid log and derives pace', () => {
    const l = sanitizeLog(good)
    expect(l.avgPaceSec).toBe(300)
  })
  it('rejects bad date, distance and non-objects', () => {
    expect(sanitizeLog({ ...good, date: 'x' })).toBeNull()
    expect(sanitizeLog({ ...good, distanceKm: -1 })).toBeNull()
    expect(sanitizeLog(null)).toBeNull()
  })
  it('nulls out of range optional values', () => {
    expect(sanitizeLog({ ...good, avgHr: 999 }).avgHr).toBeNull()
    expect(sanitizeLog({ ...good, rpe: 5 }).rpe).toBe(5)
  })
})

describe('clinic, glossary and charts', () => {
  it('matches ITBS for outer knee pain on stairs', () => {
    expect(matchInjuries('knee', ['stairs', 'during'])[0].inj.id).toMatch(/itbs|pfps/)
  })
  it('matches hip bursitis for side-lying hip pain', () => {
    expect(matchInjuries('hip', ['sidelying', 'night'])[0].inj.id).toBe('hip-bursitis')
  })
  it('every injury exercise exists', () => {
    for (const i of INJURIES) for (const p of i.pt) for (const e of p.exercises) expect(getExercise(e.exerciseId)).not.toBeNull()
  })
  it('glossary has unique terms and filters', () => {
    const terms = GLOSSARY.map((g) => g.term)
    expect(new Set(terms).size).toBe(terms.length)
    expect(filterGlossary('itbs', 'All').length).toBeGreaterThan(0)
    expect(filterGlossary('', 'Run types').every((g) => g.category === 'Run types')).toBe(true)
  })
  it('aggregates weekly distance Monday to Sunday', () => {
    const logs = [
      { date: '2025-01-06', distanceKm: 5 },
      { date: '2025-01-12', distanceKm: 10 },
      { date: '2025-01-13', distanceKm: 8 },
    ]
    expect(weeklyDistance(logs)).toEqual([
      { week: '01-06', km: 15 },
      { week: '01-13', km: 8 },
    ])
  })
})
