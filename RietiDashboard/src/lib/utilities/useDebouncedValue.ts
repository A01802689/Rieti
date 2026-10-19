import { useEffect, useState } from 'react'

/**
 * Follows a value only after it stops changing for a while, e.g. to wait for the user to stop typing before asking the API
 *
 * @param value - Value to follow
 * @param delayMs - Milliseconds the value must stay unchanged before the result follows it
 * @returns The last value that stayed unchanged for the delay; the first value is returned right away
 */
export function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
