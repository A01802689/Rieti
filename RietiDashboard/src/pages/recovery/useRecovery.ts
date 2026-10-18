// custom hooks (work as a vm) of the password recovery: they call the API and keep loading and error state
import { useState } from "react"
import { ApiError } from "@/lib/api/client"
import { requestRecovery, resetWithCode, resetWithLink } from "@/lib/api/recovery"

/**
 * Turns a failed request into a message for the user
 *
 * @param err - What the request threw
 */
const errorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    // 400 carries a message written for the user ("Código inválido o vencido")
    if (err.status === 400) return err.message
    if (err.status === 429) return "Demasiados intentos. Espera un minuto e inténtalo de nuevo."
    if (err.status === 422) return "Revisa los datos: el correo, el código o la contraseña no son válidos."
  }
  return "No se pudo completar la solicitud. Inténtalo de nuevo."
}

/**
 * Runs an async action keeping loading and error state
 *
 * @param action - Request to run
 * @returns run (true when it worked, false when it failed), loading and the error message
 */
function useAction<A extends unknown[]>(action: (...args: A) => Promise<unknown>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (...args: A): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await action(...args)
      return true
    } catch (err) {
      setError(errorMessage(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  return { run, loading, error }
}

/** Step 1: ask the API to send the code or link by email */
export const useRequestRecovery = () => useAction(requestRecovery)

/**
 * Step 2: change the password. With a token (link) it uses the link endpoint, without it uses email + code
 */
export const useResetPassword = () =>
  useAction((p: { token?: string; email: string; code: string; newPassword: string }) =>
    p.token
      ? resetWithLink({ token: p.token, new_password: p.newPassword })
      : resetWithCode({ email: p.email, code: p.code, new_password: p.newPassword }),
  )
