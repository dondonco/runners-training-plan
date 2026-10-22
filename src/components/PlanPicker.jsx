import { useMemo, useState } from 'react'
import { DISTANCES, LEVELS, getGoals, planId } from '../data/catalog.js'
import { buildPlan } from '../utils/planGenerator.js'
import { formatPace } from '../utils/pace.js'
import { useApp } from '../hooks/AppContext.jsx'
import { PageHeader } from './Shared.jsx'

export default function PlanPicker({ go }) {
  const { selectPlan, planId: current } = useApp()
  const [distanceId, setDistanceId] = useState(DISTANCES[0].id)
  const [levelId, setLevelId] = useState('beginner')

  const distance = DISTANCES.find((d) => d.id === distanceId)
  const goals = useMemo(() => getGoals(distanceId, levelId), [distanceId, levelId])

  const choose = (goalId) => {
    const id = planId(distanceId, levelId, goalId)
    selectPlan(id)
    go('plan')
  }

  return (
    <div>
      <PageHeader
        title="Choose your plan"
        subtitle="The Olympic coach builds a week-by-week plan for your distance, level and sub-time goal."
      />

      <section className="card">
        <h2>1. Race distance</h2>
        <div className="chip-row" role="radiogroup" aria-label="Race distance">
          {DISTANCES.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={d.id === distanceId}
              className={`chip ${d.id === distanceId ? 'active' : ''}`}
              onClick={() => setDistanceId(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="muted">{distance.blurb}</p>
      </section>

      <section className="card">
        <h2>2. Runner level</h2>
        <div className="chip-row" role="radiogroup" aria-label="Runner level">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={l.id === levelId}
              className={`chip ${l.id === levelId ? 'active' : ''}`}
              onClick={() => setLevelId(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="muted">{LEVELS.find((l) => l.id === levelId).blurb}</p>
      </section>

      <section className="card">
        <h2>3. Sub-time goal</h2>
        <div className="goal-grid">
          {goals.map((g) => {
            const plan = buildPlan(planId(distanceId, levelId, g.id))
            const id = planId(distanceId, levelId, g.id)
            return (
              <button key={g.id} type="button" className={`goal ${id === current ? 'active' : ''}`} onClick={() => choose(g.id)}>
                <span className="goal-title">{g.label}</span>
                <span className="muted">
                  {plan.weekCount} weeks · peak {Math.round(plan.peakWeekKm)} km
                </span>
                <span className="muted">Goal pace {formatPace(plan.paces.goal)} /km</span>
                {id === current ? <span className="current-tag">Current plan</span> : null}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
