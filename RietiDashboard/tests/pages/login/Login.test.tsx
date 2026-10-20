import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { getLoginIndicators } from '@/lib/api/indicators'
import Login from '@/pages/login/Login'
import { LoginCard } from '@/pages/login/components/LoginCard'
import { makeAdmin, makeAuth, makeStaff } from '../../helpers/auth'
import { renderApp } from '../../helpers/render'

vi.mock('@/lib/api/indicators', () => ({ getLoginIndicators: vi.fn() }))

beforeEach(() => {
  vi.mocked(getLoginIndicators).mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

const renderCard = (login: ReturnType<typeof makeAuth>['login']) => {
  const auth = makeAuth(null, { login })
  return renderApp(
    <Routes>
      <Route path="/login" element={<LoginCard />} />
      <Route path="*" element={<p>otra</p>} />
    </Routes>,
    { auth, route: '/login' },
  )
}

const fill = async (view: ReturnType<typeof renderApp>, email = 'ana@correo.mx', password = 'Secreta1!') => {
  if (email) await view.user.type(screen.getByLabelText('Email'), email)
  if (password) await view.user.type(screen.getByLabelText('Contraseña'), password)
}

describe('LoginCard', () => {
  it('valida que los campos sean obligatorios', async () => {
    const login = vi.fn()
    const view = renderCard(login)
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(await screen.findByText('El email es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('valida el formato del correo, que pide un punto después de la arroba', async () => {
    const login = vi.fn()
    const view = renderCard(login)
    await fill(view, 'ana@correo')
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(await screen.findByText('Formato de correo inválido')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('un correo sin arroba lo frena la validación nativa del navegador', async () => {
    const login = vi.fn()
    const view = renderCard(login)
    await fill(view, 'sin-arroba')
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(login).not.toHaveBeenCalled()
  })

  it('con datos válidos inicia sesión y va a la página de inicio del usuario', async () => {
    const login = vi.fn().mockResolvedValue(makeStaff('map.view'))
    const view = renderCard(login)
    await fill(view)
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    await waitFor(() => expect(view.path()).toBe('/map'))
    expect(login).toHaveBeenCalledWith('ana@correo.mx', 'Secreta1!')
  })

  it('un administrador va a /home', async () => {
    const view = renderCard(vi.fn().mockResolvedValue(makeAdmin()))
    await fill(view)
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    await waitFor(() => expect(view.path()).toBe('/home'))
  })

  it('un alimentador sin permisos va a la página sin acceso', async () => {
    const view = renderCard(vi.fn().mockResolvedValue(makeStaff()))
    await fill(view)
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    await waitFor(() => expect(view.path()).toBe('/sin-acceso'))
  })

  it('muestra el error de la API y se queda en el login', async () => {
    const view = renderCard(vi.fn().mockRejectedValue(new ApiError(401, 'Credenciales inválidas')))
    await fill(view)
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
    expect(view.path()).toBe('/login')
  })

  it('una cuenta de ciudadano rechazada muestra su mensaje', async () => {
    const view = renderCard(vi.fn().mockRejectedValue(new ApiError(403, 'Esta cuenta no tiene acceso al panel')))
    await fill(view)
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(await screen.findByText('Esta cuenta no tiene acceso al panel')).toBeInTheDocument()
  })

  it('un error que no es de la API muestra el mensaje general', async () => {
    const view = renderCard(vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await fill(view)
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(await screen.findByText('No se pudo iniciar sesión')).toBeInTheDocument()
  })

  it('mientras envía el botón dice Cargando... y está deshabilitado', async () => {
    let finish: (value: ReturnType<typeof makeAdmin>) => void = () => undefined
    const view = renderCard(vi.fn(() => new Promise((resolve) => (finish = resolve))) as never)
    await fill(view)
    await view.user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(await screen.findByRole('button', { name: 'Cargando...' })).toBeDisabled()
    finish(makeAdmin())
    await waitFor(() => expect(view.path()).toBe('/home'))
  })

  it('el ojo muestra y oculta la contraseña', async () => {
    const view = renderCard(vi.fn())
    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')
    await view.user.click(input.parentElement!.querySelector('button')!)
    expect(input).toHaveAttribute('type', 'text')
  })

  it('enlaza a la recuperación de contraseña', () => {
    renderCard(vi.fn())
    expect(screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toHaveAttribute('href', '/recovery')
  })
})

describe('Login', () => {
  const renderLogin = () => renderApp(<Login />, { auth: makeAuth(null) })

  it('muestra los indicadores con su número', async () => {
    vi.mocked(getLoginIndicators).mockResolvedValue({ reportes_registrados: 120, casos_activos: 8, ninos_atendidos: 0 })
    renderLogin()
    expect(await screen.findByText('120')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Reportes registrados')).toBeInTheDocument()
  })

  it('mientras no hay datos o si falla muestra rayas', async () => {
    vi.mocked(getLoginIndicators).mockRejectedValue(new Error('caído'))
    renderLogin()
    await waitFor(() => expect(console.error).toHaveBeenCalled())
    expect(screen.getAllByText('—')).toHaveLength(3)
  })

  it('incluye el formulario de acceso', () => {
    vi.mocked(getLoginIndicators).mockResolvedValue({ reportes_registrados: 1, casos_activos: 1, ninos_atendidos: 1 })
    renderLogin()
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })
})
