import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { login as loginRequest, logout as logoutRequest, getMe } from '@/lib/api/auth'
import { ApiError, setForbiddenHandler, setUnauthorizedHandler } from '@/lib/api/client'
import type { PermissionKey } from '@/lib/types/Permission'
import { userCan, type Role, type SessionUser } from '@/lib/types/User'
import { AuthContext } from './auth'

/**
 * Keeps only the staff in the session of the panel: a ciudadano has no page to see there, so it counts as no session
 *
 * @param me - User the API sent
 * @returns The user, or null for a ciudadano
 */
const staffOnly = (me: SessionUser) => (me.rol === null ? null : me)

/**
 * Keeps the session: restores session from the cookie, signs in and out, keeps the permissions up to date and clears it when the API answers 401
 *
 * @param children - Encapsulated components that can read the session with useAuth
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // the refresh that is running, so a burst of 403 asks the API once
  const refreshing = useRef<Promise<void> | null>(null)

  // restore the session from the cookie when the app loads
  useEffect(() => {
    getMe()
      .then((me) => setUser(staffOnly(me)))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  // clear the user when the API answers 401
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(undefined)
  }, [])

  /**
   * Asks the API for the user again; the state only changes when something is different, so nothing re-renders for nothing
   *
   * @returns The request in progress; it never rejects, and a call made while another one is running shares it
   */
  const refresh = useCallback(() => {
    refreshing.current ??= getMe()
      .then((me) => setUser((current) => (JSON.stringify(current) === JSON.stringify(me) ? current : staffOnly(me))))
      .catch(() => undefined)
      .finally(() => {
        refreshing.current = null
      })
    return refreshing.current
  }, [])

  // a 403 means the permissions on screen may be out of date: the guards react to the new ones by themselves
  useEffect(() => {
    setForbiddenHandler(() => {
      refresh()
    })
    return () => setForbiddenHandler(undefined)
  }, [refresh])

  /**
   * Signs in and stores the user; a ciudadano is signed out at once because the panel is only for the staff
   *
   * @param correo - User's email
   * @param contrasena - User's password
   * @returns The signed-in user
   * @throws ApiError when the credentials are wrong or the account is a ciudadano
   */
  const login = async (correo: string, contrasena: string) => {
    const me = await loginRequest(correo, contrasena)
    if (me.rol === null) {
      await logoutRequest().catch(() => undefined)
      throw new ApiError(403, 'Esta cuenta no tiene acceso al panel')
    }
    setUser(me)
    return me
  }

  /** Closes the session; the user is cleared even if the request fails */
  const logout = async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
    }
  }

  /**
   * Tells if the signed-in user has the given role
   *
   * @param role - Role to check
   * @returns True when the user has that role
   */
  const hasRole = (role: Role) => user?.rol === role

  /**
   * Tells if the signed-in user has the given permission
   *
   * @param key - Permission to check
   * @returns True for an Administrador or when the permission is in the session
   */
  const can = (key: PermissionKey) => userCan(user, key)

  /**
   * Tells if the signed-in user has at least one of the given permissions
   *
   * @param keys - Permissions to check
   * @returns True when any of them is allowed
   */
  const canAny = (...keys: PermissionKey[]) => keys.some(can)

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: hasRole('Administrador'),
        hasRole,
        permissions: user?.permisos ?? [],
        can,
        canAny,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
