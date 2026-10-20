import { describe, expect, it } from 'vitest'
import { landingRoute, NO_ACCESS_ROUTE } from '@/lib/routes'
import type { PermissionKey } from '@/lib/types/Permission'
import { makeAdmin, makeStaff, makeUser } from '../helpers/auth'

describe('landingRoute', () => {
  it('manda a /login sin sesión', () => {
    expect(landingRoute(null)).toBe('/login')
  })

  it('el administrador empieza en /home', () => {
    expect(landingRoute(makeAdmin())).toBe('/home')
  })

  it('un alimentador sin permisos va a la página sin acceso', () => {
    expect(landingRoute(makeStaff())).toBe(NO_ACCESS_ROUTE)
    expect(NO_ACCESS_ROUTE).toBe('/sin-acceso')
  })

  it.each<[PermissionKey[], string]>([
    [['stats.view', 'reports.view', 'cases.view', 'map.view'], '/home'],
    [['reports.view', 'cases.view', 'map.view'], '/reports'],
    [['cases.view', 'map.view'], '/cases'],
    [['map.view'], '/map'],
    [['stats.view'], '/home'],
    [['cases.view'], '/cases'],
  ])('con %j empieza en %s', (permissions, route) => {
    expect(landingRoute(makeStaff(...permissions))).toBe(route)
  })

  it.each<PermissionKey>(['reports.edit', 'reports.close', 'cases.edit', 'cases.close', 'cases.assign', 'reports.view_detail', 'logs.view'])(
    'solo con %s no hay página donde empezar',
    (permission) => {
      expect(landingRoute(makeStaff(permission))).toBe(NO_ACCESS_ROUTE)
    },
  )

  it('un ciudadano (rol null) va a la página sin acceso porque tiene sesión', () => {
    expect(landingRoute(makeUser({ rol: null }))).toBe(NO_ACCESS_ROUTE)
  })
})
