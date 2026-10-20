import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import NotFoundPage from '@/pages/404/404'
import { makeAdmin, makeAuth, makeStaff } from '../../helpers/auth'
import { AuthTestProvider } from '../../helpers/AuthTestProvider'
import { renderApp } from '../../helpers/render'

describe('NotFoundPage', () => {
  it('avisa que la página no existe', () => {
    renderApp(<NotFoundPage />, { auth: makeAuth(null) })
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it.each([
    ['sin sesión', null, '/login'],
    ['un administrador', makeAdmin(), '/home'],
    ['un alimentador con casos', makeStaff('cases.view'), '/cases'],
    ['un alimentador sin permisos', makeStaff(), '/sin-acceso'],
  ])('Ir al inicio lleva a la página de %s', async (_name, user, route) => {
    const view = renderApp(<NotFoundPage />, { auth: makeAuth(user) })
    await view.user.click(screen.getByRole('button', { name: 'Ir al inicio' }))
    expect(view.path()).toBe(route)
  })

  it('Volver regresa a la página anterior', async () => {
    render(
      <MemoryRouter initialEntries={['/anterior', '/rota']} initialIndex={1}>
        <AuthTestProvider value={makeAuth(null)}>
          <Routes>
            <Route path="/anterior" element={<p>anterior</p>} />
            <Route path="/rota" element={<NotFoundPage />} />
          </Routes>
        </AuthTestProvider>
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: '← Volver' }))
    expect(screen.getByText('anterior')).toBeInTheDocument()
  })
})
