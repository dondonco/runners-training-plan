import { TYPE_META } from '../data/guidance.js'
import { formatKm, formatPace } from '../utils/pace.js'
import { useApp } from '../hooks/AppContext.jsx'
import { Badge, PageHeader } from './Shared.jsx'

export default function PlanOverview({ go }) {
  const { plan, done, clearPlan } = useApp()
  if (!plan) return null
  const total = plan.totalDays
  const completed = plan.weeks.flatMap((w) => w.days).filter((d) => done[d.id]).length
  const pct = Math.round((completed / total) * 100)
  const P = plan.paces

  const firstOpen = plan.weeks.flatMap((w) => w.days).find((d) => !done[d.id])

  return (
    <div>
      <PageHeader
        title={`${plan.distance.label} · ${plan.goal.label}`}
        subtitle={`${plan.level.label} level · ${plan.weekCount} weeks`}
      />

      <section className="card">
        <div className="progress-head">
          <strong>{completed} of {total} days done</strong>
          <span className="muted">{pct}%</span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${pct}%` }} />
        </div>
        {firstOpen ? (
          <button type="button" className="btn primary full" onClick={() => go('plan', 'week', firstOpen.week, 'day', firstOpen.day)}>
            Continue: Week {firstOpen.week}, {firstOpen.dayName}
          </button>
        ) : (
          <p className="success">Plan complete. Well done!</p>
        )}
      </section>

      <section className="card">
        <h2>Your training paces (/km)</h2>
        <p className="muted">VDOT {P.vdot.toFixed(1)}, calculated from your goal of {plan.goal.label.toLowerCase()}.</p>
        <dl className="pace-grid">
          <div><dt>Recovery</dt><dd>{formatPace(P.recovery)}+</dd></div>
          <div><dt>Easy</dt><dd>{formatPace(P.easy)}–{formatPace(P.easySlow)}</dd></div>
          <div><dt>Marathon</dt><dd>{formatPace(P.marathon)}</dd></div>
          <div><dt>Threshold</dt><dd>{formatPace(P.threshold)}</dd></div>
          <div><dt>Interval</dt><dd>{formatPace(P.interval)}</dd></div>
          <div><dt>Goal race</dt><dd>{formatPace(P.goal)}</dd></div>
        </dl>
      </section>

      <h2 className="section-title">Weeks</h2>
      <ul className="week-list">
        {plan.weeks.map((w) => {
          const doneCount = w.days.filter((d) => done[d.id]).length
          return (
            <li key={w.number}>
              <button type="button" className="week-card" onClick={() => go('plan', 'week', w.number)}>
                <div className="week-top">
                  <strong>Week {w.number}</strong>
                  <span className="muted">{w.phaseLabel}{w.cutback ? ' · cut-back' : ''}</span>
                </div>
                <div className="muted">{formatKm(w.totalKm)} · {doneCount}/7 done</div>
                <div className="dots" aria-hidden="true">
                  {w.days.map((d) => (
                    <i key={d.id} className={done[d.id] ? 'on' : ''} style={{ '--dot': TYPE_META[d.type].color }} />
                  ))}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="legend">
        {Object.entries(TYPE_META).map(([k, m]) => (
          <Badge key={k} color={m.color}>{m.short}</Badge>
        ))}
      </div>

      <button type="button" className="btn ghost full" onClick={() => { clearPlan(); go('') }}>
        Change plan
      </button>
    </div>
  )
}
