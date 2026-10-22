// Validated, versioned localStorage store. All data stays on the device.

const KEY = 'rtp.v1'
const MAX_LOGS = 2000

const empty = () => ({ planId: null, done: {}, logs: [] })

const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x)
const num = (x, lo, hi) => (typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi ? x : null)
const str = (x, max) => (typeof x === 'string' ? x.slice(0, max) : '')

export function sanitizeLog(raw) {
  if (!isObj(raw)) return null
  const date = str(raw.date, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const distanceKm = num(raw.distanceKm, 0.1, 500)
  const durationSec = num(raw.durationSec, 10, 60 * 60 * 48)
  if (distanceKm === null || durationSec === null) return null
  return {
    id: str(raw.id, 64) || `${date}-${Math.random().toString(36).slice(2, 10)}`,
    date,
    planDayId: raw.planDayId ? str(raw.planDayId, 64) : null,
    type: str(raw.type, 20) || 'easy',
    distanceKm,
    durationSec,
    avgPaceSec: num(raw.avgPaceSec, 60, 3600) ?? durationSec / distanceKm,
    avgHr: num(raw.avgHr, 30, 250),
    maxHr: num(raw.maxHr, 30, 250),
    restingHr: num(raw.restingHr, 20, 150),
    cadence: num(raw.cadence, 80, 260),
    elevationM: num(raw.elevationM, 0, 20000),
    rpe: num(raw.rpe, 1, 10),
    sleepHrs: num(raw.sleepHrs, 0, 24),
    weightKg: num(raw.weightKg, 20, 300),
    feel: ['great', 'good', 'ok', 'tired', 'sore'].includes(raw.feel) ? raw.feel : null,
    notes: str(raw.notes, 500),
  }
}

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!isObj(raw)) return empty()
    const done = {}
    if (isObj(raw.done)) {
      for (const [k, v] of Object.entries(raw.done)) {
        if (v === true && /^[\w-]+:w\d+d\d$/.test(k)) done[k] = true
      }
    }
    const logs = Array.isArray(raw.logs) ? raw.logs.map(sanitizeLog).filter(Boolean).slice(0, MAX_LOGS) : []
    return {
      planId: typeof raw.planId === 'string' && raw.planId.length < 40 ? raw.planId : null,
      done,
      logs,
    }
  } catch {
    return empty()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage unavailable or full: the app keeps working in memory
  }
}
