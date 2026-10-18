/*
 * Endpoints (RietiAPI, routes/recovery.py), all public:
 *   POST /password-recovery/request     { email, method }                    -> 202 { message }
 *   POST /password-recovery/reset/code  { email, code, new_password }        -> 200 { message }
 *   POST /password-recovery/reset/link  { token, new_password }              -> 200 { message }
 * Errors: 400 invalid or expired code/link, 422 invalid data, 429 too many requests.
 */

/** How the user receives the recovery: a 6-digit code or a link */
export type RecoveryMethod = "code" | "link"

/** Step 1: ask for the email with the instructions */
export interface RecoveryRequest {
  email: string
  method: RecoveryMethod
}

/** Step 2 with a code: email + 6 digits + new password */
export interface CodeReset {
  email: string
  code: string
  new_password: string
}

/** Step 2 with a link: token of the URL + new password */
export interface LinkReset {
  token: string
  new_password: string
}

export interface MessageResponse {
  message: string
}
