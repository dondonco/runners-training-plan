import { useCallback, useEffect, useState } from 'react'

// Tiny hash router: "#/week/3/day/2" -> ['week','3','day','2']
function parse() {
  const h = window.location.hash.replace(/^#\/?/, '')
  return h.split('/').filter(Boolean).map(decodeURIComponent)
}

export function useHashRoute() {
  const [parts, setParts] = useState(parse)

  useEffect(() => {
    const onChange = () => {
      setParts(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = useCallback((...segs) => {
    window.location.hash = `/${segs.map((s) => encodeURIComponent(String(s))).join('/')}`
  }, [])

  return [parts, go]
}

export const toInt = (s, lo, hi) => {
  const n = Number(s)
  return Number.isInteger(n) && n >= lo && n <= hi ? n : null
}
