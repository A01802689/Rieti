import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RequirePermission } from '@/components/layout/RequirePermission'
import type { PermissionKey } from '@/lib/types/Permission'
import type { Role } from '@/lib/types/User'
import { makeAdmin, makeAuth, makeStaff, makeUser } from '../../helpers/auth'
import { renderApp } from '../../helpers/render'

const renderGuard = (auth: ReturnType<typeof makeAuth>, props: { permission?: PermissionKey; role?: Role } = {}) =>
  renderApp(
    <Routes>
      <Route path="/secret" element={<RequirePermission {...props}><p>Contenido secreto</p></RequirePermission>} />
      <Route path="*" element={<p>otra página</p>} />
    </Routes>,
    { auth, route: '/secret' },
  )

describe('RequirePermission', () => {
  it('mientras carga la sesión muestra la pantalla de carga', () => {
    renderGuard(makeAuth(null, { isLoading: true }), { permission: 'map.view' })
    expect(screen.getByText('Cargando')).toBeInTheDocument()
    expect(screen.queryByText('Contenido secreto')).not.toBeInTheDocument()
  })

  it('mientras carga no redirige aunque no haya usuario', () => {
    const view = renderGuard(makeAuth(null, { isLoading: true }))
    expect(view.path()).toBe('/secret')
  })

  it('sin sesión redirige a /login', () => {
    const view = renderGuard(makeAuth(null), { permission: 'map.view' })
    expect(view.path()).toBe('/login')
    expect(screen.queryByText('Contenido secreto')).not.toBeInTheDocument()
  })

  it('sin permiso redirige a la primera página que el usuario puede ver', () => {
    const view = renderGuard(makeAuth(makeStaff('cases.view')), { permission: 'map.view' })
    expect(view.path()).toBe('/cases')
  })

  it('sin permiso y sin ninguna página redirige a la página sin acceso', () => {
    const view = renderGuard(makeAuth(makeStaff('reports.edit')), { permission: 'map.view' })
    expect(view.path()).toBe('/sin-acceso')
  })

  it('con el permiso muestra el contenido', () => {
    const view = renderGuard(makeAuth(makeStaff('map.view')), { permission: 'map.view' })
    expect(screen.getByText('Contenido secreto')).toBeInTheDocument()
    expect(view.path()).toBe('/secret')
  })

  it('el administrador pasa cualquier permiso', () => {
    renderGuard(makeAuth(makeAdmin()), { permission: 'logs.view' })
    expect(screen.getByText('Contenido secreto')).toBeInTheDocument()
  })

  it('sin pedir permiso ni rol deja pasar a cualquier usuario con sesión', () => {
    renderGuard(makeAuth(makeStaff()))
    expect(screen.getByText('Contenido secreto')).toBeInTheDocument()
  })

  it('un rol faltante redirige a la página de inicio del usuario', () => {
    const view = renderGuard(makeAuth(makeStaff('reports.view')), { role: 'Administrador' })
    expect(view.path()).toBe('/reports')
  })

  it('el rol correcto pasa', () => {
    renderGuard(makeAuth(makeAdmin()), { role: 'Administrador' })
    expect(screen.getByText('Contenido secreto')).toBeInTheDocument()
  })

  it('con rol y permiso exige los dos', () => {
    const view = renderGuard(makeAuth(makeUser({ rol: 'Alimentador', permisos: ['map.view'] })), { role: 'Alimentador', permission: 'cases.view' })
    expect(view.path()).toBe('/map')
  })

  it('no entra en bucle: la página de destino siempre es una que el usuario puede ver', () => {
    const view = renderGuard(makeAuth(makeStaff('stats.view')), { permission: 'map.view' })
    expect(view.path()).toBe('/home')
  })
})
