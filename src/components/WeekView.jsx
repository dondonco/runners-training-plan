import { TYPE_META } from '../data/guidance.js'
import { formatKm } from '../utils/pace.js'
import { useApp } from '../hooks/AppContext.jsx'
import { Badge, PageHeader } from './Shared.jsx'

export default function WeekView({ week, go }) {
  const { plan, done } = useApp()
  const w = plan.weeks[week - 1]
  const doneCount = w.days.filter((d) => done[d.id]).length

  return (
    <div>
      <PageHeader
        back={<button type="button" className="link" onClick={() => go('plan')}>‹ All weeks</button>}
        title={`Week ${w.number} of ${plan.weekCount}`}
        subtitle={`${w.phaseLabel}${w.cutback ? ' (cut-back)' : ''} · ${formatKm(w.totalKm)} · ${doneCount}/7 done`}
      />
      <p className="theme">{w.theme}</p>

      <ul className="day-list">
        {w.days.map((d) => {
          const meta = TYPE_META[d.type]
          const isDone = !!done[d.id]
          return (
            <li key={d.id}>
              <button
                type="button"
                className={`day-card ${isDone ? 'done' : ''}`}
                style={{ '--accent': meta.color }}
                onClick={() => go('plan', 'week', w.number, 'day', d.day)}
              >
                <div className="day-left">
                  <span className="day-name">{d.dayName}</span>
                  <span className="day-num">Day {d.day}</span>
                </div>
                <div className="day-mid">
                  <Badge color={meta.color}>{meta.short}</Badge>
                  <strong>{d.title}</strong>
                  <span className="muted">{d.summary}</span>
                  <span className="muted">{d.totalMinutes} min total</span>
                </div>
                <div className="day-check" aria-label={isDone ? 'Completed' : 'Not completed'}>
                  {isDone ? '✓' : ''}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <nav className="pager" aria-label="Week navigation">
        {week > 1 ? (
          <button type="button" className="btn" onClick={() => go('plan', 'week', week - 1)}>‹ Prev week</button>
        ) : <span />}
        {week < plan.weekCount ? (
          <button type="button" className="btn primary" onClick={() => go('plan', 'week', week + 1)}>Next week ›</button>
        ) : <span />}
      </nav>
    </div>
  )
}
