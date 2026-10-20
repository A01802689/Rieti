import { vi } from 'vitest'
import type { AuthContextType } from '@/context/auth'
import { ALL_PERMISSION_KEYS, type PermissionKey } from '@/lib/types/Permission'
import { userCan, type SessionUser } from '@/lib/types/User'

/**
 * Builds a user of the session
 *
 * @param overrides - Fields that differ from the default Alimentador without permissions
 * @returns The user
 */
export const makeUser = (overrides: Partial<SessionUser> = {}): SessionUser => ({
  id_usuario: 1,
  nombre: 'Ana',
  apellido: 'Pérez',
  correo: 'ana@correo.mx',
  rol: 'Alimentador',
  id_municipio: 1,
  permisos: [],
  ...overrides,
})

/**
 * Builds an Administrador, who has every permission
 *
 * @returns The user
 */
export const makeAdmin = () => makeUser({ rol: 'Administrador', permisos: [...ALL_PERMISSION_KEYS] })

/**
 * Builds an Alimentador with the given permissions
 *
 * @param permisos - Permissions the user has
 * @returns The user
 */
export const makeStaff = (...permisos: PermissionKey[]) => makeUser({ permisos })

/**
 * Builds the value of the session context for a user, with mocks for the actions
 *
 * @param user - User of the session, null for no session
 * @param overrides - Fields to replace
 * @returns The context value
 */
export function makeAuth(user: SessionUser | null, overrides: Partial<AuthContextType> = {}): AuthContextType {
  const can = (key: PermissionKey) => userCan(user, key)
  return {
    user,
    isLoading: false,
    isAdmin: user?.rol === 'Administrador',
    hasRole: (role) => user?.rol === role,
    permissions: user?.permisos ?? [],
    can,
    canAny: (...keys) => keys.some(can),
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}
