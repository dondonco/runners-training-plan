import { lazy, Suspense, useMemo, useState } from 'react'
import { RUN_TYPES, TYPE_META } from '../data/guidance.js'
import { formatDuration, formatPace, parseDuration } from '../utils/pace.js'
import { useApp } from '../hooks/AppContext.jsx'
import { PageHeader } from './Shared.jsx'
const ProgressCharts = lazy(() => import('./ProgressCharts.jsx'))

const today = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const FEELS = ['great', 'good', 'ok', 'tired', 'sore']

function toNum(s) {
  if (s === '' || s == null) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

export default function RunLogger({ prefillDayId }) {
  const { plan, logs, done, addLog, removeLog, toggleDone } = useApp()

  const planned = useMemo(() => {
    if (!plan || !prefillDayId) return null
    return plan.weeks.flatMap((w) => w.days).find((d) => d.id === prefillDayId) ?? null
  }, [plan, prefillDayId])

  const [form, setForm] = useState(() => ({
    date: today(),
    type: planned && RUN_TYPES.includes(planned.type) ? planned.type : 'easy',
    distance: planned ? String(planned.distanceKm) : '',
    time: '',
    pace: '',
    avgHr: '',
    maxHr: '',
    restingHr: '',
    cadence: '',
    elevation: '',
    rpe: '',
    sleepHrs: '',
    weight: '',
    feel: 'good',
    notes: '',
  }))
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const set = (k) => (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  const submit = (e) => {
    e.preventDefault()
    setError('')
    const distanceKm = toNum(form.distance)
    const durationSec = parseDuration(form.time)
    if (!distanceKm || Number.isNaN(distanceKm) || distanceKm <= 0 || distanceKm > 500) return setError('Enter a distance between 0.1 and 500 km.')
    if (!durationSec) return setError('Enter the time as mm:ss or h:mm:ss, e.g. 45:30.')
    let avgPaceSec = durationSec / distanceKm
    if (form.pace) {
      const p = parseDuration(form.pace)
      if (!p) return setError('Pace must be mm:ss per km, e.g. 5:30.')
      avgPaceSec = p
    }
    const nums = {
      avgHr: toNum(form.avgHr),
      maxHr: toNum(form.maxHr),
      restingHr: toNum(form.restingHr),
      cadence: toNum(form.cadence),
      elevationM: toNum(form.elevation),
      rpe: toNum(form.rpe),
      sleepHrs: toNum(form.sleepHrs),
      weightKg: toNum(form.weight),
    }
    if (Object.values(nums).some(Number.isNaN)) return setError('Optional fields must be numbers.')
    const ok = addLog({
      id: `${form.date}-${Date.now().toString(36)}`,
      date: form.date,
      planDayId: planned?.id ?? null,
      type: form.type,
      distanceKm,
      durationSec,
      avgPaceSec,
      ...nums,
      feel: form.feel,
      notes: form.notes,
    })
    if (!ok) return setError('Some values are out of range. Check heart rate (30–250), RPE (1–10) and sleep (0–24).')
    if (planned && !done[planned.id]) toggleDone(planned.id)
    setSaved(true)
    setForm((f) => ({ ...f, distance: '', time: '', pace: '', notes: '' }))
  }

  const autoPace = (() => {
    const d = toNum(form.distance)
    const t = parseDuration(form.time)
    return d && t && d > 0 ? formatPace(t / d) : null
  })()

  return (
    <div>
      <PageHeader title="Daily recorder" subtitle="Log each run. Your charts update automatically." />

      <form className="card form" onSubmit={submit} noValidate>
        {planned ? <p className="notice">Logging planned session: <strong>{planned.title}</strong></p> : null}

        <div className="field-row">
          <label>Date<input type="date" value={form.date} onChange={set('date')} required /></label>
          <label>Run type
            <select value={form.type} onChange={set('type')}>
              {RUN_TYPES.map((t) => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
            </select>
          </label>
        </div>

        <div className="field-row">
          <label>Distance (km)<input inputMode="decimal" placeholder="10" value={form.distance} onChange={set('distance')} /></label>
          <label>Time (mm:ss or h:mm:ss)<input inputMode="numeric" placeholder="52:30" value={form.time} onChange={set('time')} /></label>
        </div>

        <div className="field-row">
          <label>Avg pace (/km) <span className="hint">{autoPace ? `auto: ${autoPace}` : 'optional'}</span>
            <input inputMode="numeric" placeholder={autoPace ?? '5:15'} value={form.pace} onChange={set('pace')} />
          </label>
          <label>Avg heart rate (bpm)<input inputMode="numeric" placeholder="148" value={form.avgHr} onChange={set('avgHr')} /></label>
        </div>

        <details>
          <summary>More details (optional)</summary>
          <div className="field-row">
            <label>Max HR (bpm)<input inputMode="numeric" value={form.maxHr} onChange={set('maxHr')} /></label>
            <label>Resting HR (bpm)<input inputMode="numeric" value={form.restingHr} onChange={set('restingHr')} /></label>
          </div>
          <div className="field-row">
            <label>Cadence (spm)<input inputMode="numeric" value={form.cadence} onChange={set('cadence')} /></label>
            <label>Elevation gain (m)<input inputMode="numeric" value={form.elevation} onChange={set('elevation')} /></label>
          </div>
          <div className="field-row">
            <label>RPE (1–10)<input inputMode="decimal" value={form.rpe} onChange={set('rpe')} /></label>
            <label>Sleep last night (h)<input inputMode="decimal" value={form.sleepHrs} onChange={set('sleepHrs')} /></label>
          </div>
          <div className="field-row">
            <label>Body weight (kg)<input inputMode="decimal" value={form.weight} onChange={set('weight')} /></label>
            <label>How did it feel?
              <select value={form.feel} onChange={set('feel')}>
                {FEELS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
          </div>
          <label>Notes<textarea rows="3" maxLength={500} value={form.notes} onChange={set('notes')} /></label>
        </details>

        {error ? <p className="error" role="alert">{error}</p> : null}
        {saved ? <p className="success" role="status">Saved. Scroll down to see your charts.</p> : null}
        <button type="submit" className="btn primary full">Save run</button>
      </form>

      <Suspense fallback={<p className="muted">Loading charts…</p>}>
        <ProgressCharts logs={logs} />
      </Suspense>

      <section>
        <h2 className="section-title">History ({logs.length})</h2>
        {logs.length === 0 ? <p className="muted">No runs recorded yet.</p> : (
          <ul className="history">
            {[...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50).map((l) => (
              <li key={l.id} className="card history-item">
                <div>
                  <strong>{l.date}</strong> · {TYPE_META[l.type]?.short ?? l.type}
                  <div className="muted">
                    {l.distanceKm.toFixed(1)} km · {formatDuration(l.durationSec)} · {formatPace(l.avgPaceSec)} /km{l.avgHr ? ` · ${l.avgHr} bpm` : ''}
                  </div>
                  {l.notes ? <div className="muted">{l.notes}</div> : null}
                </div>
                <button type="button" className="link danger" onClick={() => removeLog(l.id)} aria-label={`Delete run on ${l.date}`}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
