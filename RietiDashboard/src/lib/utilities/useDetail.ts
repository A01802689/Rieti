import { useEffect, useState } from 'react'

/** Runs an api call that changes the resource and then reloads it */
export type Mutate = (action: () => Promise<unknown>) => Promise<void>

/**
 * Loads one resource by the id of the route and offers a way to change and reload it, shared by the detail pages
 *
 * @param id - Id taken from the route (NaN when the param is not a number, which counts as not found)
 * @param fetcher - Gets the resource; it must keep the same reference between renders (define it outside the component)
 * @returns The resource (undefined if it could not be loaded), the loading flag, `mutate` to change it and `reload` to fetch it again
 */
export function useDetail<T>(id: number, fetcher: (id: number) => Promise<T>) {
  const [data, setData] = useState<T>()
  const [loading, setLoading] = useState(true)
  // bumping it re-runs the effect, which reloads the data
  const [version, setVersion] = useState(0)
  const validId = Number.isInteger(id)

  useEffect(() => {
    if (!validId) return

    // an answer that arrives after the id changed or the page closed is dropped
    let stale = false

    const getData = async () => {
      try {
        const result = await fetcher(id)
        if (!stale) setData(result)
      } catch (e) {
        console.error(`Error fetching the detail from api ${e}`)
      } finally {
        if (!stale) setLoading(false)
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
   * Runs an api call that changes the resource and reloads it if it succeeds
   *
   * @param action - Api call to run
   */
  const mutate: Mutate = async (action) => {
    try {
      await action()
      reload()
    } catch (e) {
      console.error(`Error updating the detail ${e}`)
    }
  }

  return { data, loading: loading && validId, mutate, reload }
}
