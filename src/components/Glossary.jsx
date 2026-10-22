import { useMemo, useState } from 'react'
import { GLOSSARY, GLOSSARY_CATEGORIES } from '../data/glossary.js'
import { PageHeader } from './Shared.jsx'

export function filterGlossary(query, category) {
  const q = query.trim().toLowerCase()
  return GLOSSARY.filter((g) => {
    if (category !== 'All' && g.category !== category) return false
    if (!q) return true
    return (
      g.term.toLowerCase().includes(q) ||
      g.definition.toLowerCase().includes(q) ||
      g.alias.some((a) => a.toLowerCase().includes(q))
    )
  }).sort((a, b) => a.term.localeCompare(b.term))
}

export default function Glossary() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const items = useMemo(() => filterGlossary(query, category), [query, category])

  return (
    <div>
      <PageHeader title="Glossary" subtitle={`${GLOSSARY.length} terms used in this app.`} />
      <input
        type="search"
        className="search"
        placeholder="Search terms (e.g. tempo, ITBS, RPE)"
        aria-label="Search glossary"
        maxLength={60}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="chip-row scroll" role="radiogroup" aria-label="Category">
        {['All', ...GLOSSARY_CATEGORIES].map((c) => (
          <button key={c} type="button" role="radio" aria-checked={category === c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      <p className="muted">{items.length} result{items.length === 1 ? '' : 's'}</p>
      <dl className="glossary">
        {items.map((g) => (
          <div key={g.term} className="card gloss-item">
            <dt>{g.term}</dt>
            <dd>{g.definition}</dd>
            <span className="muted tiny">{g.category}{g.alias.length ? ` · also: ${g.alias.join(', ')}` : ''}</span>
          </div>
        ))}
      </dl>
    </div>
  )
}
