// Pace, VDOT and time helpers (Daniels/Gilbert oxygen-cost model).

export function vdotFromRace(distanceM, timeSec) {
  const t = timeSec / 60
  const v = distanceM / t
  const vo2 = -4.6 + 0.182258 * v + 0.000104 * v * v
  const pct = 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t)
  return vo2 / pct
}

// velocity (m/min) that costs `vo2` ml/kg/min
export function velocityAtVo2(vo2) {
  const a = 0.000104
  const b = 0.182258
  const c = -(4.6 + vo2)
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
}

const paceAtFraction = (vdot, fraction) => 60000 / velocityAtVo2(vdot * fraction)

// Riegel race-time projection
export const projectTime = (timeSec, fromKm, toKm) => timeSec * Math.pow(toKm / fromKm, 1.06)

// Training intensities as a fraction of VDOT (sec/km results)
export function computePaces(distanceKm, goalSec) {
  const vdot = vdotFromRace(distanceKm * 1000, goalSec)
  const marathon = projectTime(goalSec, distanceKm, 42.195) / 42.195
  return {
    vdot,
    goal: goalSec / distanceKm,
    recovery: paceAtFraction(vdot, 0.58),
    easy: paceAtFraction(vdot, 0.65),
    easyFast: paceAtFraction(vdot, 0.7),
    easySlow: paceAtFraction(vdot, 0.6),
    long: paceAtFraction(vdot, 0.66),
    marathon,
    threshold: paceAtFraction(vdot, 0.88),
    interval: paceAtFraction(vdot, 0.975),
    repetition: paceAtFraction(vdot, 1.05),
  }
}

const pad = (n) => String(n).padStart(2, '0')

export function formatPace(secPerKm) {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '--:--'
  let m = Math.floor(secPerKm / 60)
  let s = Math.round(secPerKm % 60)
  if (s === 60) {
    m += 1
    s = 0
  }
  return `${m}:${pad(s)}`
}

export function formatDuration(totalSec) {
  if (!Number.isFinite(totalSec) || totalSec < 0) return '--:--'
  const t = Math.round(totalSec)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

// Accepts "45", "45:10" (mm:ss) or "1:23:45" (h:mm:ss). Returns seconds or null.
export function parseDuration(text) {
  if (typeof text !== 'string') return null
  const parts = text.trim().split(':')
  if (parts.length < 1 || parts.length > 3 || parts.some((p) => !/^\d{1,3}$/.test(p))) return null
  const nums = parts.map(Number)
  if (nums.length === 1) return nums[0] * 60
  if (nums.length === 2) return nums[0] * 60 + nums[1]
  return nums[0] * 3600 + nums[1] * 60 + nums[2]
}

export const paceRange = (fast, slow) => `${formatPace(fast)}–${formatPace(slow)}`

export function formatKm(km) {
  return `${(Math.round(km * 10) / 10).toFixed(1)} km`
}

export function formatMinutes(min) {
  const m = Math.round(min)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} h ${r} min` : `${h} h`
}
