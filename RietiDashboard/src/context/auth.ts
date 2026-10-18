import { createContext, useContext } from 'react'
import type { PermissionKey } from '@/lib/types/Permission'
import type { Role, SessionUser } from '@/lib/types/User'

/** Session data and actions that AuthProvider shares with the whole app */
export interface AuthContextType {
  /** Signed-in user, null when there is no session; only staff (Administrador or Alimentador) holds a session in the panel */
  user: SessionUser | null
  /** True while the session is being restored */
  isLoading: boolean
  /** Whether the user is an Administrador */
  isAdmin: boolean
  /** Whether the user has the given role */
  hasRole: (role: Role) => boolean
  /** Effective permissions of the user; empty when there is no session or the API did not send them */
  permissions: PermissionKey[]
  /** Whether the user has the permission; an Administrador has all of them */
  can: (key: PermissionKey) => boolean
  /** Whether the user has at least one of the permissions */
  canAny: (...keys: PermissionKey[]) => boolean
  /** Signs in and stores the user; rejects with ApiError on failure, also when the account is a ciudadano, who cannot use the panel */
  login: (correo: string, contrasena: string) => Promise<SessionUser>
  /** Closes the session and clears the user */
  logout: () => Promise<void>
  /** Asks the API for the user again so the permissions on screen are up to date; it never rejects and runs once at a time */
  refresh: () => Promise<void>
}

/** Context of the session, null outside an AuthProvider */
export const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Reads the session context
 *
 * @returns The session data and actions
 * @throws When it is used outside an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider')
  return context
}
