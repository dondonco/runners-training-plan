import { AppProvider, useApp } from './hooks/AppContext.jsx'
import { toInt, useHashRoute } from './hooks/useHashRoute.js'
import PlanPicker from './components/PlanPicker.jsx'
import PlanOverview from './components/PlanOverview.jsx'
import WeekView from './components/WeekView.jsx'
import DayView from './components/DayView.jsx'
import RunLogger from './components/RunLogger.jsx'
import InjuryClinic from './components/InjuryClinic.jsx'
import Glossary from './components/Glossary.jsx'

const NAV = [
  ['plan', 'Plan'],
  ['log', 'Log'],
  ['clinic', 'Clinic'],
  ['glossary', 'Glossary'],
]

function Router() {
  const { plan } = useApp()
  const [parts, go] = useHashRoute()
  const [section = '', a, b, c] = parts

  let view
  if (section === 'log') {
    view = <RunLogger key={a ?? 'new'} prefillDayId={a} />
  } else if (section === 'clinic') {
    view = <InjuryClinic />
  } else if (section === 'glossary') {
    view = <Glossary />
  } else if (section === 'choose' || !plan) {
    view = <PlanPicker go={go} />
  } else {
    // #/plan, #/plan/week/N, #/plan/week/N/day/M
    const week = a === 'week' ? toInt(b, 1, plan.weekCount) : null
    const day = c === 'day' ? toInt(parts[4], 1, 7) : null
    if (week && day) view = <DayView key={`${week}-${day}`} week={week} day={day} go={go} />
    else if (week) view = <WeekView week={week} go={go} />
    else view = <PlanOverview go={go} />
  }

  const active = section === 'choose' || section === '' ? 'plan' : section

  return (
    <div className="app">
      <main className="main">{view}</main>
      <nav className="tabbar" aria-label="Main">
        {NAV.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={active === id ? 'active' : ''}
            aria-current={active === id ? 'page' : undefined}
            onClick={() => go(id === 'plan' ? 'plan' : id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
