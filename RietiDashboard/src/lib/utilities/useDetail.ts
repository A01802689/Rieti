import { useEffect, useState } from 'react'
import { ApiError, isForbidden } from '@/lib/api/client'

/** Runs an api call that changes the resource and then reloads it; if the call fails it throws the error again after reloading, so the caller can show it */
export type Mutate = (action: () => Promise<unknown>) => Promise<void>

/** Result tied to the route and fetcher that requested it, so another detail never shows this resource */
interface DetailResult<T> {
  id: number
  fetcher: (id: number) => Promise<T>
  data?: T
  forbidden: boolean
  error?: string
}

/**
 * Loads one resource by the id of the route and offers a way to change and reload it, shared by the detail pages
 *
 * @param id - Id taken from the route (NaN when the param is not a number, which counts as not found)
 * @param fetcher - Gets the resource; it must keep the same reference between renders (define it outside the component)
 * @returns The current resource, loading and permission flags, a load error distinct from not found, and the mutate and reload actions
 */
export function useDetail<T>(id: number, fetcher: (id: number) => Promise<T>) {
  const [result, setResult] = useState<DetailResult<T>>()
  // bumping it re-runs the effect, which reloads the data
  const [version, setVersion] = useState(0)
  const validId = Number.isSafeInteger(id) && id > 0
  const current = validId && result?.id === id && result.fetcher === fetcher ? result : undefined

  useEffect(() => {
    if (!validId) return

    // an answer that arrives after the id changed or the page closed is dropped
    let stale = false

    const getData = async () => {
      try {
        const result = await fetcher(id)
        if (!stale) {
          setResult({ id, fetcher, data: result, forbidden: false })
        }
      } catch (e) {
        console.error(`Error fetching the detail from api ${e}`)
        if (!stale) {
          const forbidden = isForbidden(e)
          const notFound = e instanceof ApiError && e.status === 404
          setResult({
            id, fetcher, forbidden,
            error: forbidden || notFound ? undefined : 'No se pudo cargar el detalle. Intenta de nuevo',
          })
        }
      }
    }

    getData()
    return () => {
      stale = true
    }
  }, [id, validId, version, fetcher])

  /** Fetches the resource again */
  const reload = () => setVersion((v) => v + 1)

  /**
   * Runs an api call that changes the resource and reloads it, even when the call fails because it may have changed part of it
   *
   * @param action - Api call to run
   * @throws The error of the call, after the reload starts
   */
  const mutate: Mutate = async (action) => {
    try {
      await action()
    } finally {
      reload()
    }
  }

  return {
    data: current?.data,
    loading: validId && !current,
    forbidden: current?.forbidden ?? false,
    error: current?.error,
    mutate, reload,
  }
}
