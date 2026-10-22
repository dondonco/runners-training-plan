import { useState } from 'react'
import { neighbors } from '../utils/planGenerator.js'
import { TYPE_META } from '../data/guidance.js'
import { formatKm } from '../utils/pace.js'
import { useApp } from '../hooks/AppContext.jsx'
import { Badge, ExerciseItem } from './Shared.jsx'

const KIND_LABEL = {
  mobility: 'Stretching',
  stretch: 'Stretching',
  warmup: 'Warm-up',
  drills: 'Drills',
  main: 'Main set',
  strength: 'Main set',
  crossfit: 'Main set',
  cooldown: 'Cool-down',
  rest: 'Recovery',
}

function Step({ index, step }) {
  const [open, setOpen] = useState(step.kind === 'main' || step.kind === 'strength' || step.kind === 'crossfit')
  const hasBody = step.description || step.details || step.exercises || step.sets
  return (
    <li className={`step step-${step.kind}`}>
      <button type="button" className="step-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="step-num">{index + 1}</span>
        <span className="step-title">
          <span className="step-kind">{KIND_LABEL[step.kind]}</span>
          <strong>{step.title}</strong>
        </span>
        <span className="step-meta">
          {step.distanceKm ? <span>{formatKm(step.distanceKm)}</span> : null}
          <span>{step.minutes} min</span>
        </span>
      </button>
      {open && hasBody && (
        <div className="step-body">
          {step.description ? <p>{step.description}</p> : null}
          {step.paceText ? <p className="pace-line">Pace: <strong>{step.paceText}</strong></p> : null}
          {step.details ? (
            <ul className="details">
              {step.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          ) : null}
          {step.exercises ? (
            <ul className="exercises">
              {step.exercises.map((e, i) => <ExerciseItem key={`${e.exerciseId}-${i}`} {...e} />)}
            </ul>
          ) : null}
          {step.sets ? (
            <ul className="exercises">
              {step.sets.map((e, i) => <ExerciseItem key={`${e.exerciseId}-${i}`} {...e} />)}
            </ul>
          ) : null}
        </div>
      )}
    </li>
  )
}

function FoodBlock({ title, block }) {
  if (!block) return null
  return (
    <div className="food">
      <h4>{title}</h4>
      <p className="muted">{block.timing}</p>
      <ul>{block.foods.map((f, i) => <li key={i}>{f}</li>)}</ul>
      <p>{block.note}</p>
    </div>
  )
}

export default function DayView({ week, day, go }) {
  const { plan, done, toggleDone } = useApp()
  const w = plan.weeks[week - 1]
  const d = w.days[day - 1]
  const { prev, next } = neighbors(plan, week, day)
  const meta = TYPE_META[d.type]
  const isDone = !!done[d.id]
  const [tab, setTab] = useState('plan')

  const goDay = (t) => {
    setTab('plan')
    go('plan', 'week', t.week, 'day', t.day)
  }

  return (
    <div className="day-view" style={{ '--accent': meta.color }}>
      <button type="button" className="link" onClick={() => go('plan', 'week', week)}>‹ Week {week}</button>

      <header className="day-header">
        <div className="day-header-top">
          <Badge color={meta.color}>{meta.label}</Badge>
          <span className="muted">Week {week} · {d.dayName} (Day {day}/7) · {w.phaseLabel}</span>
        </div>
        <h1>{d.title}</h1>
        <div className="stats">
          {d.distanceKm > 0 ? <div><b>{formatKm(d.distanceKm)}</b><span>Distance</span></div> : null}
          <div><b>{d.totalMinutes} min</b><span>Total time</span></div>
          {d.paceText ? <div><b>{d.paceText}</b><span>Main pace</span></div> : null}
          <div><b>{d.sleep.hours} h</b><span>Sleep</span></div>
        </div>
        <button
          type="button"
          className={`btn full ${isDone ? 'success-btn' : 'primary'}`}
          aria-pressed={isDone}
          onClick={() => toggleDone(d.id)}
        >
          {isDone ? '✓ Done (tap to undo)' : 'Mark day as done'}
        </button>
        {d.distanceKm > 0 && (
          <button type="button" className="btn ghost full" onClick={() => go('log', `${d.id}`)}>
            Record this run
          </button>
        )}
      </header>

      <div className="tabs" role="tablist">
        {[
          ['plan', 'Session'],
          ['fuel', 'Nutrition'],
          ['team', 'Specialists'],
        ].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'plan' && (
        <section>
          <p className="muted order-hint">Do these in order, top to bottom.</p>
          <ol className="steps">
            {d.steps.map((s, i) => <Step key={`${d.id}-${i}`} index={i} step={s} />)}
          </ol>
        </section>
      )}

      {tab === 'fuel' && (
        <section className="card">
          <h2>Fuel &amp; recovery</h2>
          <p className="muted">Daily carbohydrate target: {d.nutrition.dayCarbs}</p>
          <FoodBlock title="Before training" block={d.nutrition.pre} />
          <FoodBlock title="During training" block={d.nutrition.during} />
          <FoodBlock title="After training" block={d.nutrition.post} />
          <div className="food">
            <h4>Hydration</h4>
            <p>{d.nutrition.hydration}</p>
          </div>
          <div className="food">
            <h4>Recovery aids</h4>
            <ul>{d.nutrition.recovery.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
          {d.nutrition.evening ? (
            <div className="food">
              <h4>Tonight</h4>
              <p>{d.nutrition.evening}</p>
            </div>
          ) : null}
          <div className="food">
            <h4>Sleep: {d.sleep.hours} hours</h4>
            <p>{d.sleep.note}</p>
            <ul>{d.sleep.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        </section>
      )}

      {tab === 'team' && (
        <section className="card">
          <h2>Your specialist team</h2>
          <div className="persona"><h4>Olympic coach</h4><p>{d.guidance.coach}</p></div>
          <div className="persona"><h4>Sports PT</h4><p>{d.guidance.pt}</p></div>
          <div className="persona"><h4>Rehab doctor</h4><p>{d.guidance.rehab}</p></div>
          <div className="persona"><h4>Nutritionist</h4><p>{d.nutrition.pre.note}</p></div>
          <button type="button" className="btn ghost full" onClick={() => go('clinic')}>Open Injury Clinic</button>
        </section>
      )}

      <nav className="pager sticky" aria-label="Day navigation">
        <button type="button" className="btn" disabled={!prev} onClick={() => prev && goDay(prev)}>
          ‹ Prev day
        </button>
        <span className="pager-label">W{week} · D{day}</span>
        <button type="button" className="btn primary" disabled={!next} onClick={() => next && goDay(next)}>
          Next day ›
        </button>
      </nav>
    </div>
  )
}
