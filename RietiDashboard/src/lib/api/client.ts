/** Base URL of the API, from VITE_API_URL */
const API_URL = import.meta.env.VITE_API_URL

/** Error of a failed request; `status` is the HTTP code and `message` the `detail` sent by the API */
export class ApiError extends Error {
  status: number

  /**
   * @param status - HTTP code of the response
   * @param message - `detail` sent by the API
   */
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Tells if an error is the API refusing the action because the user lacks a permission
 *
 * @param error - What a request threw
 * @returns True for an ApiError with status 403
 */
export const isForbidden = (error: unknown) => error instanceof ApiError && error.status === 403

let onUnauthorized: (() => void) | undefined
let onForbidden: (() => void) | undefined

/**
 * Registers what to do when the API answers 401 (the session expired)
 *
 * @param handler - Called on every 401; pass undefined to remove it
 */
export const setUnauthorizedHandler = (handler?: () => void) => {
  onUnauthorized = handler
}

/**
 * Registers what to do when the API answers 403 (the permissions of the screen may be out of date)
 *
 * @param handler - Called on every 403; pass undefined to remove it
 */
export const setForbiddenHandler = (handler?: () => void) => {
  onForbidden = handler
}

/**
 * Turns the `detail` of an error response into a text
 *
 * @param detail - A text, or the list of validation errors that FastAPI sends on a 422
 * @param fallback - Text used when the detail is missing or has no message
 * @returns The text, or the messages of the validation errors joined
 */
const detailText = (detail: unknown, fallback: string) => {
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    const messages = detail
      .map((error) => (typeof error?.msg === "string" ? error.msg.replace(/^Value error, /, "") : ""))
      .filter(Boolean)
    if (messages.length > 0) return messages.join(". ")
  }
  return fallback
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
    if (res.status === 403) onForbidden?.()
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, detailText(body?.detail, res.statusText))
  }

  return (res.status === 204 ? undefined : await res.json()) as T
}
