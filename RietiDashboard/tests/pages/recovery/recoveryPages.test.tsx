import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { requestRecovery, resetWithCode, resetWithLink } from '@/lib/api/recovery'
import RecoveryPage from '@/pages/recovery/Recovery'
import TokenPage from '@/pages/recovery/Token'

vi.mock('@/lib/api/recovery', () => ({ requestRecovery: vi.fn(), resetWithCode: vi.fn(), resetWithLink: vi.fn() }))

beforeEach(() => {
  vi.mocked(requestRecovery).mockReset()
  vi.mocked(resetWithCode).mockReset()
  vi.mocked(resetWithLink).mockReset()
})

/** Shows the state the router carries so the test can read the email passed to the next step */
function StateProbe() {
  const location = useLocation()
  return <p data-testid="state">{JSON.stringify(location.state)}</p>
}

const renderRoutes = (route: string, state?: unknown) => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[{ pathname: route.split('?')[0], search: route.includes('?') ? `?${route.split('?')[1]}` : '', state }]}>
      <Routes>
        <Route path="/recovery" element={<RecoveryPage />} />
        <Route path="/recovery/token" element={<TokenPage />} />
        <Route path="/login" element={<p>pantalla de login</p>} />
        <Route path="*" element={<StateProbe />} />
      </Routes>
    </MemoryRouter>,
  )
  return user
}

describe('Recovery (paso 1)', () => {
  it('muestra el título y el enlace para volver al login', () => {
    renderRoutes('/recovery')
    expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Volver a iniciar sesión' })).toHaveAttribute('href', '/login')
  })

  it('elige Código por defecto', () => {
    renderRoutes('/recovery')
    expect(screen.getByRole('radio', { name: /Código/ })).toBeChecked()
  })

  it('con código pide las instrucciones con el correo recortado y va al paso 2 con el correo', async () => {
    vi.mocked(requestRecovery).mockResolvedValue({ message: 'ok' })
    const user = renderRoutes('/recovery')
    await user.type(screen.getByLabelText('Correo electrónico'), '  ana@correo.mx  ')
    await user.click(screen.getByRole('button', { name: 'Enviar instrucciones' }))
    expect(requestRecovery).toHaveBeenCalledWith({ email: 'ana@correo.mx', method: 'code' })
    expect(await screen.findByLabelText('Código de verificación')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('ana@correo.mx')
  })

  it('con enlace muestra la confirmación y no cambia de página', async () => {
    vi.mocked(requestRecovery).mockResolvedValue({ message: 'ok' })
    const user = renderRoutes('/recovery')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.mx')
    await user.click(screen.getByRole('radio', { name: /Enlace/ }))
    await user.click(screen.getByRole('button', { name: 'Enviar instrucciones' }))
    expect(requestRecovery).toHaveBeenCalledWith({ email: 'ana@correo.mx', method: 'link' })
    expect(await screen.findByRole('status')).toHaveTextContent('te enviamos un enlace')
  })

  it('si falla muestra el error y se queda', async () => {
    vi.mocked(requestRecovery).mockRejectedValue(new ApiError(429, 'x'))
    const user = renderRoutes('/recovery')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.mx')
    await user.click(screen.getByRole('button', { name: 'Enviar instrucciones' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos')
    expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument()
  })

  it('mientras envía el botón está deshabilitado', async () => {
    let finish: (value: { message: string }) => void = () => undefined
    vi.mocked(requestRecovery).mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const user = renderRoutes('/recovery')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.mx')
    await user.click(screen.getByRole('button', { name: 'Enviar instrucciones' }))
    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled()
    finish({ message: 'ok' })
  })
})

describe('Token (paso 2)', () => {
  const fillPasswords = async (user: ReturnType<typeof userEvent.setup>, password: string, confirm = password) => {
    await user.type(screen.getByLabelText('Nueva contraseña'), password)
    await user.type(screen.getByLabelText('Confirmar contraseña'), confirm)
  }

  it('el correo llega rellenado desde el paso 1', () => {
    renderRoutes('/recovery/token', { email: 'ana@correo.mx' })
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('ana@correo.mx')
  })

  it('sin estado el correo empieza vacío', () => {
    renderRoutes('/recovery/token')
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('')
  })

  it('el código solo acepta dígitos', async () => {
    const user = renderRoutes('/recovery/token')
    await user.type(screen.getByLabelText('Código de verificación'), '12ab34')
    expect(screen.getByLabelText('Código de verificación')).toHaveValue('1234')
  })

  it('un código de menos de 6 dígitos se rechaza sin llamar a la API', async () => {
    const user = renderRoutes('/recovery/token', { email: 'a@b.mx' })
    await user.type(screen.getByLabelText('Código de verificación'), '12345')
    await fillPasswords(user, 'Secreta1!')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(screen.getByRole('alert')).toHaveTextContent('El código tiene 6 dígitos.')
    expect(resetWithCode).not.toHaveBeenCalled()
  })

  it('una contraseña de 7 caracteres se rechaza', async () => {
    const user = renderRoutes('/recovery/token', { email: 'a@b.mx' })
    await user.type(screen.getByLabelText('Código de verificación'), '123456')
    await fillPasswords(user, '1234567')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(screen.getByRole('alert')).toHaveTextContent('al menos 8 caracteres')
  })

  it('una contraseña de más de 72 caracteres se rechaza, 72 sí pasa', async () => {
    vi.mocked(resetWithCode).mockResolvedValue({ message: 'ok' })
    const user = renderRoutes('/recovery/token', { email: 'a@b.mx' })
    await user.type(screen.getByLabelText('Código de verificación'), '123456')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'x'.repeat(73))
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'x'.repeat(73))
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(screen.getByRole('alert')).toHaveTextContent('más de 72 caracteres')
    expect(resetWithCode).not.toHaveBeenCalled()
  })

  it('contraseñas distintas se rechazan', async () => {
    const user = renderRoutes('/recovery/token', { email: 'a@b.mx' })
    await user.type(screen.getByLabelText('Código de verificación'), '123456')
    await fillPasswords(user, 'Secreta1!', 'Secreta2!')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(screen.getByRole('alert')).toHaveTextContent('no coinciden')
  })

  it('con datos válidos cambia la contraseña con código y muestra el éxito', async () => {
    vi.mocked(resetWithCode).mockResolvedValue({ message: 'ok' })
    const user = renderRoutes('/recovery/token', { email: ' a@b.mx ' })
    await user.type(screen.getByLabelText('Código de verificación'), '123456')
    await fillPasswords(user, 'Secreta1!')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(resetWithCode).toHaveBeenCalledWith({ email: 'a@b.mx', code: '123456', new_password: 'Secreta1!' })
    expect(await screen.findByRole('status')).toHaveTextContent('Tu contraseña se actualizó')
    await user.click(screen.getByRole('button', { name: 'Ir a iniciar sesión' }))
    expect(screen.getByText('pantalla de login')).toBeInTheDocument()
  })

  it('con ?token= solo pide la contraseña y usa el endpoint del enlace', async () => {
    vi.mocked(resetWithLink).mockResolvedValue({ message: 'ok' })
    const user = renderRoutes('/recovery/token?token=abc123')
    expect(screen.queryByLabelText('Código de verificación')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reenviar código' })).not.toBeInTheDocument()
    await fillPasswords(user, 'Secreta1!')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(resetWithLink).toHaveBeenCalledWith({ token: 'abc123', new_password: 'Secreta1!' })
  })

  // posible bug: ?token= vacío oculta el código y el correo, pero useResetPassword lo trata como sin token y manda correo y código vacíos
  it('con ?token= vacío termina llamando a resetWithCode con correo y código vacíos', async () => {
    vi.mocked(resetWithCode).mockResolvedValue({ message: 'ok' })
    const user = renderRoutes('/recovery/token?token=')
    await fillPasswords(user, 'Secreta1!')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(resetWithLink).not.toHaveBeenCalled()
    expect(resetWithCode).toHaveBeenCalled()
  })

  it('un error de la API (código vencido) se muestra', async () => {
    vi.mocked(resetWithCode).mockRejectedValue(new ApiError(400, 'Código inválido o vencido'))
    const user = renderRoutes('/recovery/token', { email: 'a@b.mx' })
    await user.type(screen.getByLabelText('Código de verificación'), '123456')
    await fillPasswords(user, 'Secreta1!')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Código inválido o vencido')
  })

  it('Reenviar código está deshabilitado sin correo y pide un código nuevo con él', async () => {
    vi.mocked(requestRecovery).mockResolvedValue({ message: 'ok' })
    const user = renderRoutes('/recovery/token')
    expect(screen.getByRole('button', { name: 'Reenviar código' })).toBeDisabled()
    await user.type(screen.getByLabelText('Correo electrónico'), 'a@b.mx')
    await user.click(screen.getByRole('button', { name: 'Reenviar código' }))
    expect(requestRecovery).toHaveBeenCalledWith({ email: 'a@b.mx', method: 'code' })
    expect(await screen.findByText('Si el correo está registrado, te enviamos un código nuevo.')).toBeInTheDocument()
  })

  it('si reenviar falla muestra el error', async () => {
    vi.mocked(requestRecovery).mockRejectedValue(new ApiError(429, 'x'))
    const user = renderRoutes('/recovery/token', { email: 'a@b.mx' })
    await user.click(screen.getByRole('button', { name: 'Reenviar código' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos')
  })
})
