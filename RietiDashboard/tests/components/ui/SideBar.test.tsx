import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SideBar from '@/components/ui/SideBar'
import type { PermissionKey } from '@/lib/types/Permission'
import { makeAdmin, makeAuth, makeStaff } from '../../helpers/auth'
import { renderApp } from '../../helpers/render'

const renderBar = (user: Parameters<typeof makeAuth>[0], route = '/') => {
  const auth = makeAuth(user)
  return { auth, ...renderApp(<SideBar />, { auth, route }) }
}

const names = () =>
  within(screen.getByRole('navigation'))
    .getAllByRole('button')
    .map((b) => b.textContent)

describe('SideBar: enlaces según permisos', () => {
  it('el administrador ve todo', () => {
    renderBar(makeAdmin())
    expect(names()).toEqual(['Home', 'Dashboard', 'Mapa de Calor', 'Reportes', 'Logs', 'Casos', 'Usuarios', 'Log Out'])
  })

  it('un alimentador sin permisos solo ve Log Out y no ve el grupo Dashboard', () => {
    renderBar(makeStaff())
    expect(names()).toEqual(['Log Out'])
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('sin sesión solo queda Log Out', () => {
    renderBar(null)
    expect(names()).toEqual(['Log Out'])
  })

  it.each<[PermissionKey, string[]]>([
    ['stats.view', ['Home', 'Log Out']],
    ['map.view', ['Dashboard', 'Mapa de Calor', 'Log Out']],
    ['reports.view', ['Dashboard', 'Reportes', 'Log Out']],
    ['cases.view', ['Casos', 'Log Out']],
  ])('con solo %s se ve %j', (permission, expected) => {
    renderBar(makeStaff(permission))
    expect(names()).toEqual(expected)
  })

  it('el grupo Dashboard se oculta cuando no queda ningún enlace dentro', () => {
    renderBar(makeStaff('stats.view', 'cases.view'))
    expect(screen.queryByRole('button', { name: /Dashboard/ })).not.toBeInTheDocument()
  })

  it('Logs no aparece a un alimentador aunque tenga logs.view', () => {
    renderBar(makeStaff('logs.view', 'map.view'))
    expect(screen.queryByRole('button', { name: 'Logs' })).not.toBeInTheDocument()
  })

  it('Usuarios solo se muestra al administrador', () => {
    renderBar(makeStaff('reports.view', 'cases.view', 'map.view', 'stats.view'))
    expect(screen.queryByRole('button', { name: 'Usuarios' })).not.toBeInTheDocument()
  })
})

describe('SideBar: navegación', () => {
  it('los botones llevan a su ruta', async () => {
    const view = renderBar(makeAdmin())
    await view.user.click(screen.getByRole('button', { name: 'Home' }))
    expect(view.path()).toBe('/home')
    await view.user.click(screen.getByRole('button', { name: 'Casos' }))
    expect(view.path()).toBe('/cases')
    await view.user.click(screen.getByRole('button', { name: 'Usuarios' }))
    expect(view.path()).toBe('/users')
    await view.user.click(screen.getByRole('button', { name: 'Logs' }))
    expect(view.path()).toBe('/logs')
  })

  it('el submenú se abre y se cierra con el botón Dashboard', async () => {
    const view = renderBar(makeAdmin())
    const toggle = screen.getByRole('button', { name: 'Dashboard' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'Reportes' })).toHaveAttribute('tabindex', '-1')
    await view.user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Reportes' })).toHaveAttribute('tabindex', '0')
    await view.user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('marca la entrada de la ruta actual', () => {
    renderBar(makeAdmin(), '/home')
    expect(screen.getByRole('button', { name: 'Home' })).toHaveClass('font-medium')
    expect(screen.getByRole('button', { name: 'Usuarios' })).not.toHaveClass('font-medium')
  })

  it('Casos queda marcado también en el detalle de un caso', () => {
    renderBar(makeAdmin(), '/cases/12')
    expect(screen.getByRole('button', { name: 'Casos' })).toHaveClass('font-medium')
  })

  it('el menú móvil se abre y se cierra', async () => {
    const view = renderBar(makeAdmin())
    const open = screen.getByRole('button', { name: 'Abrir menú' })
    expect(open).toHaveAttribute('aria-expanded', 'false')
    await view.user.click(open)
    expect(open).toHaveAttribute('aria-expanded', 'true')
    await view.user.click(screen.getByRole('button', { name: 'Cerrar menú' }))
    expect(open).toHaveAttribute('aria-expanded', 'false')
  })

  it('navegar cierra el menú móvil', async () => {
    const view = renderBar(makeAdmin())
    await view.user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await view.user.click(screen.getByRole('button', { name: 'Home' }))
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('Log Out cierra la sesión y lleva a /login', async () => {
    const view = renderBar(makeAdmin())
    await view.user.click(screen.getByRole('button', { name: 'Log Out' }))
    expect(view.auth.logout).toHaveBeenCalledTimes(1)
    expect(view.path()).toBe('/login')
  })

  it('si el logout falla no navega', async () => {
    const auth = makeAuth(makeAdmin(), { logout: vi.fn().mockRejectedValue(new Error('red')) })
    const view = renderApp(<SideBar />, { auth, route: '/home' })
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    await view.user.click(screen.getByRole('button', { name: 'Log Out' }))
    process.off('unhandledRejection', unhandled)
    expect(view.path()).toBe('/home')
  })
})
