import { describe, expect, it } from 'vitest'
import { ALL_PERMISSION_KEYS, type PermissionKey } from '@/lib/types/Permission'
import { ROLES, userCan, type SessionUser } from '@/lib/types/User'
import { makeAdmin, makeStaff, makeUser } from '../../helpers/auth'

describe('userCan', () => {
  it('niega todo sin sesión', () => {
    for (const key of ALL_PERMISSION_KEYS) expect(userCan(null, key)).toBe(false)
  })

  it('el administrador tiene todos, también logs.view y sin lista de permisos', () => {
    for (const key of ALL_PERMISSION_KEYS) expect(userCan(makeAdmin(), key)).toBe(true)
    expect(userCan(makeUser({ rol: 'Administrador', permisos: [] }), 'map.view')).toBe(true)
  })

  it('el alimentador tiene solo los que le dieron', () => {
    const user = makeStaff('reports.view', 'map.view')
    expect(userCan(user, 'reports.view')).toBe(true)
    expect(userCan(user, 'map.view')).toBe(true)
    expect(userCan(user, 'cases.view')).toBe(false)
  })

  it('el alimentador nunca tiene logs.view aunque venga en la lista', () => {
    expect(userCan(makeStaff('logs.view'), 'logs.view')).toBe(false)
  })

  it('el alimentador sin permisos no tiene nada', () => {
    expect(userCan(makeStaff(), 'reports.view')).toBe(false)
  })

  it('una sesión sin lista de permisos cuenta como sin permisos', () => {
    const user = { ...makeUser(), permisos: undefined } as unknown as SessionUser
    expect(userCan(user, 'reports.view')).toBe(false)
    const withNull = { ...makeUser(), permisos: null } as unknown as SessionUser
    expect(userCan(withNull, 'reports.view')).toBe(false)
  })

  it('un ciudadano (rol null) no tiene permisos aunque la lista los traiga', () => {
    expect(userCan(makeUser({ rol: null, permisos: ['reports.view'] }), 'reports.view')).toBe(false)
  })

  it('un rol desconocido no tiene permisos', () => {
    const user = makeUser({ rol: 'Otro' as never, permisos: ['reports.view'] })
    expect(userCan(user, 'reports.view' as PermissionKey)).toBe(false)
  })

  it('los roles de la API son dos', () => {
    expect(ROLES).toEqual(['Administrador', 'Alimentador'])
  })
})
