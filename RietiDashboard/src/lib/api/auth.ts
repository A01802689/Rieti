import { api } from "./client"
import type { SessionUser } from "@/lib/types/User"

/**
 * Signs in; the API sets the session cookie and returns the user with the permissions it has
 *
 * @param correo - User's email
 * @param contrasena - User's password
 * @returns The signed-in user
 */
export const login = (correo: string, contrasena: string) =>
  api<SessionUser>("/usuarios/login", { method: "POST", body: JSON.stringify({ correo, contrasena }) })

/** Signs out; the API removes the session cookie */
export const logout = () => api<{ message: string }>("/usuarios/logout", { method: "POST" })

/**
 * Gets the user that owns the session cookie with the permissions it has now, used to restore the session when the app loads and to refresh it
 *
 * @returns The signed-in user
 */
export const getMe = () => api<SessionUser>("/usuarios/me")
