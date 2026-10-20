import { act, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import NoAccessPage from '@/pages/noaccess/NoAccess'
import { makeAuth, makeStaff } from '../../helpers/auth'
import { renderApp } from '../../helpers/render'

const renderPage = (auth: ReturnType<typeof makeAuth>) =>
  renderApp(
    <Routes>
      <Route path="/sin-acceso" element={<NoAccessPage />} />
      <Route path="*" element={<p>destino</p>} />
    </Routes>,
    { auth, route: '/sin-acceso' },
  )

describe('NoAccessPage', () => {
  it('sin ninguna página disponible muestra el aviso y los dos botones', () => {
    renderPage(makeAuth(makeStaff()))
    expect(screen.getByRole('heading', { name: 'Aún no tienes acceso' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Actualizar permisos' })).toBeEnabled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('si ya tiene una página, redirige a ella', () => {
    const view = renderPage(makeAuth(makeStaff('cases.view')))
    expect(view.path()).toBe('/cases')
    expect(screen.queryByText('Aún no tienes acceso')).not.toBeInTheDocument()
  })

  it('si hay permisos para el mapa, redirige al mapa', () => {
    expect(renderPage(makeAuth(makeStaff('map.view'))).path()).toBe('/map')
  })

  it('actualizar pide los permisos y luego avisa que siguen vacíos', async () => {
    const auth = makeAuth(makeStaff())
    const view = renderPage(auth)
    await view.user.click(screen.getByRole('button', { name: 'Actualizar permisos' }))
    expect(auth.refresh).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('status')).toHaveTextContent('Tu cuenta sigue sin permisos nuevos.')
  })

  it('mientras actualiza deshabilita el botón y oculta el aviso', async () => {
    let finish: () => void = () => undefined
    const auth = makeAuth(makeStaff(), { refresh: vi.fn(() => new Promise<void>((resolve) => (finish = resolve))) })
    const view = renderPage(auth)
    await view.user.click(screen.getByRole('button', { name: 'Actualizar permisos' }))
    expect(screen.getByRole('button', { name: 'Actualizando…' })).toBeDisabled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await act(async () => finish())
    expect(screen.getByRole('button', { name: 'Actualizar permisos' })).toBeEnabled()
  })

  it('cerrar sesión llama a logout y va a /login', async () => {
    const auth = makeAuth(makeStaff())
    const view = renderPage(auth)
    await view.user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(auth.logout).toHaveBeenCalledTimes(1)
    expect(view.path()).toBe('/login')
  })

  it('el aviso desaparece al actualizar otra vez', async () => {
    let finish: () => void = () => undefined
    const refresh = vi.fn().mockResolvedValueOnce(undefined).mockImplementationOnce(() => new Promise<void>((resolve) => (finish = resolve)))
    const view = renderPage(makeAuth(makeStaff(), { refresh }))
    await view.user.click(screen.getByRole('button', { name: 'Actualizar permisos' }))
    await screen.findByRole('status')
    await view.user.click(screen.getByRole('button', { name: 'Actualizar permisos' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await act(async () => finish())
  })
})
