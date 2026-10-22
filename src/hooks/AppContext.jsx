import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadState, sanitizeLog, saveState } from '../utils/storage.js'
import { buildPlan } from '../utils/planGenerator.js'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const plan = useMemo(() => (state.planId ? buildPlan(state.planId) : null), [state.planId])

  const selectPlan = useCallback((planId) => setState((s) => ({ ...s, planId })), [])
  const clearPlan = useCallback(() => setState((s) => ({ ...s, planId: null })), [])

  const toggleDone = useCallback(
    (dayId) =>
      setState((s) => {
        const done = { ...s.done }
        if (done[dayId]) delete done[dayId]
        else done[dayId] = true
        return { ...s, done }
      }),
    [],
  )

  const addLog = useCallback((raw) => {
    const log = sanitizeLog(raw)
    if (!log) return false
    setState((s) => ({ ...s, logs: [log, ...s.logs.filter((l) => l.id !== log.id)] }))
    return true
  }, [])

  const removeLog = useCallback(
    (id) => setState((s) => ({ ...s, logs: s.logs.filter((l) => l.id !== id) })),
    [],
  )

  const value = useMemo(
    () => ({ ...state, plan, selectPlan, clearPlan, toggleDone, addLog, removeLog }),
    [state, plan, selectPlan, clearPlan, toggleDone, addLog, removeLog],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside AppProvider')
  return v
}
