import { useSyncExternalStore } from "react"

const q = "(prefers-color-scheme: dark)"

/**
 * Tells if the system dark mode is on and re-renders when it changes
 *
 * @returns true in dark mode
 */
const useIsDark = () : boolean =>
  useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(q)
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    },
    () => window.matchMedia(q).matches,
  )

  export default useIsDark