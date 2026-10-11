const API_URL = import.meta.env.VITE_API_URL

/** Error of a failed request; `status` is the HTTP code and `message` the `detail` sent by the API */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let onUnauthorized: (() => void) | undefined

/**
 * Registers what to do when the API answers 401 (the session expired)
 *
 * @param handler - Called on every 401; pass undefined to remove it
 */
export const setUnauthorizedHandler = (handler?: () => void) => {
  onUnauthorized = handler
}

/**
 * Request to the API that sends the session cookie
 *
 * @param path - Route after VITE_API_URL, e.g. "/usuarios/login"
 * @param init - Options of fetch; a body is sent as JSON
 * @returns The parsed JSON response
 * @throws ApiError when the response is not ok
 */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    // only a body needs the JSON header, so a GET does not trigger an extra preflight
    headers: init.body ? { "Content-Type": "application/json", ...init.headers } : init.headers,
  })

  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.()
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.detail ?? res.statusText)
  }

  return (res.status === 204 ? undefined : await res.json()) as T
}
