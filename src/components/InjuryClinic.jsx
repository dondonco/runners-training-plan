import { useMemo, useState } from 'react'
import { INJURIES, REGIONS, TRIGGERS } from '../data/injuries.js'
import { ExerciseItem, PageHeader } from './Shared.jsx'

// Rule-based triage: score each injury by region and trigger match.
export function matchInjuries(region, triggers) {
  return INJURIES.map((inj) => {
    let score = 0
    if (inj.region === region) score += 3
    for (const t of triggers) if (inj.triggers.includes(t)) score += 1
    return { inj, score }
  })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

function InjuryDetail({ inj }) {
  return (
    <article className="card injury">
      <h3>{inj.name}</h3>

      <div className="persona"><h4>Rehab doctor assessment</h4><p>{inj.doctor}</p></div>
      <h4>Typical symptoms</h4>
      <ul>{inj.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
      <h4>Common causes</h4>
      <ul>{inj.causes.map((s, i) => <li key={i}>{s}</li>)}</ul>
      <div className="alert">
        <h4>See a doctor promptly if</h4>
        <ul>{inj.redFlags.map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>

      <h4>Sports PT rehab plan</h4>
      {inj.pt.map((phase) => (
        <div key={phase.name} className="phase">
          <strong>{phase.name}</strong>
          <p className="muted">{phase.goal}</p>
          <ul className="exercises">
            {phase.exercises.map((e, i) => <ExerciseItem key={`${e.exerciseId}-${i}`} {...e} />)}
          </ul>
          <p><em>Running:</em> {phase.run}</p>
        </div>
      ))}
      <div className="persona"><h4>Return-to-run checklist</h4><p>{inj.returnToRun}</p></div>
    </article>
  )
}

export default function InjuryClinic() {
  const [region, setRegion] = useState('')
  const [triggers, setTriggers] = useState([])
  const [openId, setOpenId] = useState(null)

  const matches = useMemo(() => (region ? matchInjuries(region, triggers) : []), [region, triggers])

  const toggle = (id) => setTriggers((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))

  return (
    <div>
      <PageHeader
        title="Injury clinic"
        subtitle="The rehab doctor helps identify likely running injuries from the waist down. The sports PT then provides the recovery plan."
      />
      <p className="notice">Educational guidance only. It is not a medical diagnosis. If pain is severe, constant, or you have red-flag symptoms, see a qualified clinician.</p>

      <section className="card">
        <h2>1. Where does it hurt?</h2>
        <div className="chip-row" role="radiogroup" aria-label="Pain location">
          {REGIONS.map((r) => (
            <button key={r.id} type="button" role="radio" aria-checked={region === r.id} className={`chip ${region === r.id ? 'active' : ''}`} onClick={() => setRegion(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        <h2>2. When does it hurt?</h2>
        <div className="chip-row">
          {TRIGGERS.map((t) => (
            <button key={t.id} type="button" aria-pressed={triggers.includes(t.id)} className={`chip ${triggers.includes(t.id) ? 'active' : ''}`} onClick={() => toggle(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {region && (
        <section>
          <h2 className="section-title">Most likely conditions</h2>
          {matches.length === 0 ? <p className="muted">No close match. Browse all conditions below or see a clinician.</p> : (
            matches.map(({ inj }) => <InjuryDetail key={inj.id} inj={inj} />)
          )}
        </section>
      )}

      <section>
        <h2 className="section-title">All conditions</h2>
        <ul className="list">
          {INJURIES.map((inj) => (
            <li key={inj.id}>
              <button type="button" className="list-btn" aria-expanded={openId === inj.id} onClick={() => setOpenId(openId === inj.id ? null : inj.id)}>
                <span>{inj.name}</span>
                <span className="chev">{openId === inj.id ? '▾' : '▸'}</span>
              </button>
              {openId === inj.id && <InjuryDetail inj={inj} />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
