import type { Municipio } from "./Municipio"
import { ADMIN_ONLY_PERMISSIONS, type PermissionKey } from "@/lib/types/Permission"

/** Roles of the API */
export const ROLES = ["Administrador", "Alimentador"] as const

/** Role of a user */
export type Role = (typeof ROLES)[number]

/** User as the create endpoint (POST /usuarios) returns it: it has no permissions */
export interface CreatedUser {
  id_usuario: number
  nombre: string
  apellido: string
  correo: string
  rol: Role | null
  id_municipio: number | null
}

/** User as the login and the session (/usuarios/me) endpoints return it; permisos are the effective ones, so an Administrador has all of them */
export interface SessionUser extends CreatedUser {
  permisos: PermissionKey[]
}

/** User as the users endpoints (GET /usuarios, GET /usuarios/{id}, PUT /usuarios/{id}/permisos) return it; permisos are the stored ones, which are empty for an Administrador */
export interface User extends Omit<CreatedUser, "rol"> {
  rol: Role
  municipio: Municipio | null
  ultimo_acceso: string | null // ISO 8601 TIMESTAMP without zone (UTC), read it with parseApiDate
  permisos: PermissionKey[]
}

/** Payload to create a user; contrasena only travels in the create request, and is never stored or shown */
export interface UserCreate {
  nombre: string
  apellido: string
  correo: string
  contrasena: string // min 8 characters with a number, a special character and an uppercase letter (see lib/utilities/password.ts)
  rol: Role
  id_municipio: number | null // the API requires an existing municipio when rol is sent, the form does not send null
  permisos: PermissionKey[]
}

/**
 * Tells if the user of the session has a permission
 *
 * An Administrador has all of them, and a session without the list (an API that does not send it yet) counts as having none
 *
 * @param user - User of the session, null when there is none
 * @param key - Permission to check
 * @returns True when the user may do what the permission allows
 */
export const userCan = (user: SessionUser | null, key: PermissionKey) =>
  user?.rol === "Administrador" || (
    user?.rol === "Alimentador" && !ADMIN_ONLY_PERMISSIONS.includes(key) && (user.permisos ?? []).includes(key)
  )
