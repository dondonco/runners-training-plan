import { useState } from 'react'
import { getExercise } from '../data/exercises.js'

// One exercise with expandable "how to" and the three specialist notes.
export function ExerciseItem({ exerciseId, rx, sets, reps, restSec, load }) {
  const [open, setOpen] = useState(false)
  const ex = getExercise(exerciseId)
  if (!ex) return null
  return (
    <li className="exercise">
      <button
        type="button"
        className="exercise-head"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="exercise-name">{ex.name}</span>
        <span className="exercise-rx">
          {sets ? `${sets} sets × ${reps}` : rx}
        </span>
        <span className="chev" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {(restSec || load) && (
        <div className="exercise-meta">
          {restSec ? <span>Rest {restSec} s</span> : null}
          {load ? <span>{load}</span> : null}
        </div>
      )}
      {open && (
        <div className="exercise-body">
          <p className="muted">Target: {ex.target}</p>
          <ol>
            {ex.how.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ol>
          <div className="notes">
            <p><strong>Coach:</strong> {ex.tailored.coach}</p>
            <p><strong>Sports PT:</strong> {ex.tailored.pt}</p>
            <p><strong>Rehab doctor:</strong> {ex.tailored.rehab}</p>
          </div>
        </div>
      )}
    </li>
  )
}

export function Badge({ color, children }) {
  return (
    <span className="badge" style={{ '--badge': color }}>
      {children}
    </span>
  )
}

export function PageHeader({ title, subtitle, back }) {
  return (
    <header className="page-header">
      {back}
      <h1>{title}</h1>
      {subtitle ? <p className="muted">{subtitle}</p> : null}
    </header>
  )
}
