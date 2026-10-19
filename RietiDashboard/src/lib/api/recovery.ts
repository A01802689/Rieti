import { api } from "./client"
import type { CodeReset, LinkReset, MessageResponse, RecoveryRequest } from "@/lib/types/Recovery"

/**
 * Asks the API to send the recovery code or link; the API always answers the same, whether the email exists or not
 *
 * @param data - Email and how to receive the instructions
 */
export const requestRecovery = (data: RecoveryRequest) =>
  api<MessageResponse>("/password-recovery/request", { method: "POST", body: JSON.stringify(data) })

/**
 * Changes the password with the 6-digit code received by email
 *
 * @param data - Email, code and new password
 * @throws ApiError 400 when the code is wrong, expired, used or blocked
 */
export const resetWithCode = (data: CodeReset) =>
  api<MessageResponse>("/password-recovery/reset/code", { method: "POST", body: JSON.stringify(data) })

/**
 * Changes the password with the token of the link received by email
 *
 * @param data - Token and new password
 * @throws ApiError 400 when the link is wrong, expired or used
 */
export const resetWithLink = (data: LinkReset) =>
  api<MessageResponse>("/password-recovery/reset/link", { method: "POST", body: JSON.stringify(data) })
