// Catalogue of every plan: distance -> level -> sub-time goal.

export const DISTANCES = [
  { id: '5k', label: '5K', km: 5, blurb: 'Speed and efficiency. The best first race goal.' },
  { id: '10k', label: '10K', km: 10, blurb: 'The balance of speed and endurance.' },
  { id: '16k', label: '16K', km: 16, blurb: 'The classic 10-mile road race.' },
  { id: '21k', label: 'Half Marathon', km: 21.0975, blurb: '21.1 km. Threshold fitness meets endurance.' },
  { id: '32k', label: '32K', km: 32, blurb: 'The marathon dress rehearsal distance.' },
  { id: '42k', label: 'Marathon', km: 42.195, blurb: '42.195 km. The ultimate test of preparation.' },
]

export const LEVELS = [
  { id: 'beginner', label: 'Beginner', blurb: 'New or returning runner. 4 runs per week, run/walk start.' },
  { id: 'intermediate', label: 'Intermediate', blurb: 'Consistent runner. 4-5 runs per week, structured quality.' },
  { id: 'advanced', label: 'Advanced', blurb: 'Experienced racer. 5 runs per week, two quality sessions.' },
  { id: 'elite', label: 'Elite', blurb: 'High-volume competitor. 5-6 runs plus optional doubles.' },
]

// Sub-time limits in minutes: [slower goal, faster goal] per level
const GOAL_MINUTES = {
  '5k': { beginner: [40, 35], intermediate: [30, 27], advanced: [25, 22], elite: [20, 17] },
  '10k': { beginner: [70, 60], intermediate: [55, 50], advanced: [45, 40], elite: [36, 33] },
  '16k': { beginner: [110, 95], intermediate: [85, 80], advanced: [75, 70], elite: [62, 57] },
  '21k': { beginner: [150, 135], intermediate: [120, 110], advanced: [100, 90], elite: [80, 72] },
  '32k': { beginner: [225, 195], intermediate: [180, 165], advanced: [150, 140], elite: [130, 115] },
  '42k': { beginner: [360, 300], intermediate: [270, 240], advanced: [210, 190], elite: [170, 150] },
}

export const WEEKS = {
  '5k': { beginner: 10, intermediate: 8, advanced: 8, elite: 10 },
  '10k': { beginner: 12, intermediate: 10, advanced: 10, elite: 12 },
  '16k': { beginner: 12, intermediate: 12, advanced: 12, elite: 12 },
  '21k': { beginner: 14, intermediate: 12, advanced: 12, elite: 12 },
  '32k': { beginner: 16, intermediate: 14, advanced: 14, elite: 14 },
  '42k': { beginner: 24, intermediate: 18, advanced: 16, elite: 16 },
}

// Peak weekly volume (km) and peak long run (km) per level order [b, i, a, e]
export const PEAK_WEEKLY_KM = {
  '5k': [20, 32, 50, 85],
  '10k': [28, 42, 60, 100],
  '16k': [32, 48, 68, 110],
  '21k': [38, 55, 75, 120],
  '32k': [48, 65, 90, 135],
  '42k': [55, 80, 110, 160],
}
export const PEAK_LONG_KM = {
  '5k': [8, 12, 16, 18],
  '10k': [12, 16, 20, 24],
  '16k': [14, 18, 22, 26],
  '21k': [16, 20, 24, 28],
  '32k': [22, 26, 28, 30],
  '42k': [30, 32, 35, 38],
}
export const TAPER_WEEKS = { '5k': 1, '10k': 1, '16k': 1, '21k': 1, '32k': 2, '42k': 3 }

export const levelIndex = (levelId) => LEVELS.findIndex((l) => l.id === levelId)

export function formatLimit(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:00` : `${m}:00`
}

export function getGoals(distanceId, levelId) {
  const list = GOAL_MINUTES[distanceId]?.[levelId] ?? []
  return list.map((limitMin) => ({
    id: `sub${limitMin}`,
    limitMin,
    label: `Sub ${formatLimit(limitMin)}`,
    // Plan targets 1.5% under the limit so the "sub" is achieved with margin
    targetSec: Math.round(limitMin * 60 * 0.985),
  }))
}

export const planId = (distanceId, levelId, goalId) => `${distanceId}-${levelId}-${goalId}`

export function parsePlanId(id) {
  if (typeof id !== 'string') return null
  const m = /^(\d+k)-([a-z]+)-(sub\d+)$/.exec(id)
  if (!m) return null
  const [, distanceId, levelId, goalId] = m
  const distance = DISTANCES.find((d) => d.id === distanceId)
  const level = LEVELS.find((l) => l.id === levelId)
  if (!distance || !level) return null
  const goal = getGoals(distanceId, levelId).find((g) => g.id === goalId)
  if (!goal) return null
  return { distance, level, goal }
}

export function allPlanIds() {
  const ids = []
  for (const d of DISTANCES)
    for (const l of LEVELS) for (const g of getGoals(d.id, l.id)) ids.push(planId(d.id, l.id, g.id))
  return ids
}
