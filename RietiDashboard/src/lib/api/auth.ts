import { api } from "./client"
import type { SessionUser } from "@/lib/types/User"

/**
 * Signs in; the API sets the session cookie and returns the user
 *
 * @param correo - User's email
 * @param contrasena - User's password
 */
export const login = (correo: string, contrasena: string) =>
  api<SessionUser>("/usuarios/login", { method: "POST", body: JSON.stringify({ correo, contrasena }) })

/**  Removes cookie */
export const logout = () => api<{ message: string }>("/usuarios/logout", { method: "POST" })

/** Asks API info about the user with the cookie  owns the session cookie, used to restore the session when the app loads */
// TODO GET /usuarios/me does not exist in the API 
export const getMe = () => api<SessionUser>("/usuarios/me")
