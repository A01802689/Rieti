import { useEffect, useRef, useState } from 'react'
import { searchPlaces, type GeocodedPlace } from '@/lib/api/geocoding'

/**
 * State of the place search box: the text typed, the results and the failure of the last search
 *
 * It searches only when `run` is called (button or Enter), never while the user types, and a new search cancels the previous one
 *
 * @returns `query` with its setter, `results` (null before the first search), `searching`, `error`, `run` (searches the text typed) and `clear` (drops the results)
 */
export function usePlaceSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodedPlace[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef<AbortController | null>(null)

  // a search that is still running is cancelled when the component goes away
  useEffect(() => () => pending.current?.abort(), [])

  /** Searches the text typed; an empty text does nothing */
  const run = async () => {
    const text = query.trim()
    if (!text) return

    pending.current?.abort()
    const current = new AbortController()
    pending.current = current
    setSearching(true)
    setError('')

    try {
      const places = await searchPlaces(text, current.signal)
      if (!current.signal.aborted) setResults(places)
    } catch (e) {
      if (!current.signal.aborted) {
        setResults(null)
        setError(e instanceof Error ? e.message : 'No se pudo buscar el lugar')
      }
    } finally {
      if (!current.signal.aborted) setSearching(false)
    }
  }

  /** Drops the results and the failure of the last search */
  const clear = () => {
    setResults(null)
    setError('')
  }

  return { query, setQuery, results, searching, error, run, clear }
}
