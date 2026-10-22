import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatPace } from '../utils/pace.js'

// Monday of the week containing the ISO date string
function weekStart(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const dow = (dt.getUTCDay() + 6) % 7
  dt.setUTCDate(dt.getUTCDate() - dow)
  return dt.toISOString().slice(0, 10)
}

const short = (iso) => iso.slice(5)

export function weeklyDistance(logs) {
  const map = new Map()
  for (const l of logs) {
    const k = weekStart(l.date)
    map.set(k, (map.get(k) ?? 0) + l.distanceKm)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, km]) => ({ week: short(week), km: Math.round(km * 10) / 10 }))
}

const METRICS = [
  { id: 'pace', label: 'Pace', color: '#0f766e' },
  { id: 'hr', label: 'Heart rate', color: '#dc2626' },
  { id: 'distance', label: 'Distance', color: '#2563eb' },
  { id: 'efficiency', label: 'Pace vs HR', color: '#7c3aed' },
]

export default function ProgressCharts({ logs }) {
  const [metric, setMetric] = useState('pace')

  const data = useMemo(
    () =>
      [...logs]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((l) => ({
          date: short(l.date),
          pace: Math.round(l.avgPaceSec),
          hr: l.avgHr,
          maxHr: l.maxHr,
          distance: l.distanceKm,
          efficiency: l.avgHr ? Math.round((l.distanceKm * 1000) / (l.durationSec / 60) / l.avgHr * 100) / 100 : null,
          rpe: l.rpe,
        })),
    [logs],
  )
  const weekly = useMemo(() => weeklyDistance(logs), [logs])

  if (data.length === 0) {
    return (
      <section className="card">
        <h2>Progress charts</h2>
        <p className="muted">Save your first run to see charts of pace, heart rate and distance.</p>
      </section>
    )
  }

  const m = METRICS.find((x) => x.id === metric)
  const paceFmt = (v) => formatPace(v)

  return (
    <section className="card charts">
      <h2>Progress charts</h2>
      <div className="chip-row" role="tablist" aria-label="Chart metric">
        {METRICS.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={x.id === metric} className={`chip ${x.id === metric ? 'active' : ''}`} onClick={() => setMetric(x.id)}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="chart-box" role="img" aria-label={`${m.label} trend chart`}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            {metric === 'pace' ? (
              <YAxis reversed domain={['auto', 'auto']} tickFormatter={paceFmt} tick={{ fontSize: 11 }} width={46} />
            ) : (
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} width={40} />
            )}
            <Tooltip formatter={(v, name) => (name === 'Pace' ? [paceFmt(v) + ' /km', name] : [v, name])} />
            {metric === 'pace' && <Line type="monotone" dataKey="pace" name="Pace" stroke={m.color} strokeWidth={2} dot />}
            {metric === 'hr' && (
              <>
                <Legend />
                <Line type="monotone" dataKey="hr" name="Avg HR" stroke="#dc2626" strokeWidth={2} dot connectNulls />
                <Line type="monotone" dataKey="maxHr" name="Max HR" stroke="#f59e0b" strokeWidth={2} dot connectNulls />
              </>
            )}
            {metric === 'distance' && <Line type="monotone" dataKey="distance" name="Distance (km)" stroke={m.color} strokeWidth={2} dot />}
            {metric === 'efficiency' && <Line type="monotone" dataKey="efficiency" name="Speed per bpm (higher = fitter)" stroke={m.color} strokeWidth={2} dot connectNulls />}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {metric === 'efficiency' && <p className="muted">Speed per heartbeat. A rising line at the same effort means your aerobic fitness is improving.</p>}

      <h3>Weekly distance (km)</h3>
      <div className="chart-box" role="img" aria-label="Weekly distance bar chart">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekly} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={36} />
            <Tooltip />
            <Bar dataKey="km" name="km" fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
