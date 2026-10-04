import { useSyncExternalStore } from "react"

const q = "(prefers-color-scheme: dark)"

// use this function to get the darkmode state 
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