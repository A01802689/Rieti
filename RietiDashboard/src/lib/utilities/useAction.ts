import { useState } from 'react'

/**
 * Runs the api calls of the controls of a card, keeping whether one is running and the message of its failure
 *
 * @returns `busy` (a call is running), `error` (message of the last failure, empty when there is none), `run` (runs a call and tells if it worked) and `clearError`
 */
export function useAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  /**
   * Runs an api call, blocking the controls meanwhile and keeping the message of its error
   *
   * @param action - Api call to run
   * @returns Whether it finished without error
   */
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true)
    setError('')
    try {
      await action()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción')
      return false
    } finally {
      setBusy(false)
    }
  }

  /** Forgets the message of the last failure */
  const clearError = () => setError('')

  return { busy, error, run, clearError }
}
