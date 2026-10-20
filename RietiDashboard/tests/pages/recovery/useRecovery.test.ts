import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { requestRecovery, resetWithCode, resetWithLink } from '@/lib/api/recovery'
import { useRequestRecovery, useResetPassword } from '@/pages/recovery/useRecovery'

vi.mock('@/lib/api/recovery', () => ({ requestRecovery: vi.fn(), resetWithCode: vi.fn(), resetWithLink: vi.fn() }))

beforeEach(() => {
  vi.mocked(requestRecovery).mockReset()
  vi.mocked(resetWithCode).mockReset()
  vi.mocked(resetWithLink).mockReset()
})

describe('useRequestRecovery', () => {
  it('devuelve true cuando funciona', async () => {
    vi.mocked(requestRecovery).mockResolvedValue({ message: 'ok' })
    const { result } = renderHook(() => useRequestRecovery())
    let worked = false
    await act(async () => {
      worked = await result.current.run({ email: 'a@b.mx', method: 'code' })
    })
    expect(worked).toBe(true)
    expect(requestRecovery).toHaveBeenCalledWith({ email: 'a@b.mx', method: 'code' })
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it.each([
    [400, 'Código inválido o vencido', 'Código inválido o vencido'],
    [429, 'x', 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.'],
    [422, 'x', 'Revisa los datos: el correo, el código o la contraseña no son válidos.'],
    [500, 'x', 'No se pudo completar la solicitud. Inténtalo de nuevo.'],
    [404, 'x', 'No se pudo completar la solicitud. Inténtalo de nuevo.'],
  ])('el estatus %i da el mensaje adecuado', async (status, message, expected) => {
    vi.mocked(requestRecovery).mockRejectedValue(new ApiError(status, message))
    const { result } = renderHook(() => useRequestRecovery())
    let worked = true
    await act(async () => {
      worked = await result.current.run({ email: 'a@b.mx', method: 'link' })
    })
    expect(worked).toBe(false)
    expect(result.current.error).toBe(expected)
  })

  it('un fallo de red da el mensaje general', async () => {
    vi.mocked(requestRecovery).mockRejectedValue(new TypeError('red'))
    const { result } = renderHook(() => useRequestRecovery())
    await act(async () => void (await result.current.run({ email: 'a', method: 'code' })))
    expect(result.current.error).toBe('No se pudo completar la solicitud. Inténtalo de nuevo.')
  })

  it('un intento nuevo borra el error anterior y loading es true mientras corre', async () => {
    vi.mocked(requestRecovery).mockRejectedValueOnce(new TypeError('x'))
    const { result } = renderHook(() => useRequestRecovery())
    await act(async () => void (await result.current.run({ email: 'a', method: 'code' })))
    expect(result.current.error).not.toBeNull()
    let finish: (value: { message: string }) => void = () => undefined
    vi.mocked(requestRecovery).mockReturnValueOnce(new Promise((resolve) => (finish = resolve)))
    let pending: Promise<boolean> | undefined
    act(() => {
      pending = result.current.run({ email: 'a', method: 'code' })
    })
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    await act(async () => {
      finish({ message: 'ok' })
      await pending
    })
  })
})

describe('useResetPassword', () => {
  it('con token usa el endpoint del enlace', async () => {
    vi.mocked(resetWithLink).mockResolvedValue({ message: 'ok' })
    const { result } = renderHook(() => useResetPassword())
    await act(async () => void (await result.current.run({ token: 'tok', email: '', code: '', newPassword: 'Nueva1!x' })))
    expect(resetWithLink).toHaveBeenCalledWith({ token: 'tok', new_password: 'Nueva1!x' })
    expect(resetWithCode).not.toHaveBeenCalled()
  })

  it('sin token usa correo y código', async () => {
    vi.mocked(resetWithCode).mockResolvedValue({ message: 'ok' })
    const { result } = renderHook(() => useResetPassword())
    await act(async () => void (await result.current.run({ email: 'a@b.mx', code: '123456', newPassword: 'Nueva1!x' })))
    expect(resetWithCode).toHaveBeenCalledWith({ email: 'a@b.mx', code: '123456', new_password: 'Nueva1!x' })
  })

  it('un token vacío cuenta como sin token', async () => {
    vi.mocked(resetWithCode).mockResolvedValue({ message: 'ok' })
    const { result } = renderHook(() => useResetPassword())
    await act(async () => void (await result.current.run({ token: '', email: 'a', code: '1', newPassword: 'x' })))
    expect(resetWithCode).toHaveBeenCalled()
    expect(resetWithLink).not.toHaveBeenCalled()
  })

  it('un código malo (400) muestra el mensaje de la API', async () => {
    vi.mocked(resetWithCode).mockRejectedValue(new ApiError(400, 'Código inválido o vencido'))
    const { result } = renderHook(() => useResetPassword())
    await act(async () => void (await result.current.run({ email: 'a', code: '1', newPassword: 'x' })))
    expect(result.current.error).toBe('Código inválido o vencido')
  })
})
