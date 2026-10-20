import { vi } from 'vitest'

/** Controller of a fake window.matchMedia */
export interface MediaController {
  /** Changes what the queries match and tells the listeners */
  set: (matches: boolean) => void
  /** Number of change listeners currently registered */
  listenerCount: () => number
}

/**
 * Replaces window.matchMedia with one that answers a value the test controls
 *
 * @param initial - What the queries match at the start
 * @returns The controller to change the answer and inspect the listeners
 */
export function mockMatchMedia(initial: boolean): MediaController {
  let matches = initial
  const listeners = new Set<() => void>()

  vi.stubGlobal(
    'matchMedia',
    (query: string) => ({
      get matches() {
        return matches
      },
      media: query,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    }),
  )

  return {
    set: (value) => {
      matches = value
      listeners.forEach((listener) => listener())
    },
    listenerCount: () => listeners.size,
  }
}
