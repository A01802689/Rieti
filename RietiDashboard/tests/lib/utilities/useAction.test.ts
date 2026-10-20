import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { useAction } from '@/lib/utilities/useAction'

describe('useAction', () => {
  it('empieza libre y sin error', () => {
    const { result } = renderHook(() => useAction())
    expect(result.current.busy).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('run devuelve true cuando la acción termina bien', async () => {
    const { result } = renderHook(() => useAction())
    let worked: boolean | undefined
    await act(async () => {
      worked = await result.current.run(async () => 'ok')
    })
    expect(worked).toBe(true)
    expect(result.current.error).toBe('')
    expect(result.current.busy).toBe(false)
  })

  it('run devuelve false y guarda el mensaje cuando falla', async () => {
    const { result } = renderHook(() => useAction())
    let worked: boolean | undefined
    await act(async () => {
      worked = await result.current.run(() => Promise.reject(new ApiError(409, 'Ya existe')))
    })
    expect(worked).toBe(false)
    expect(result.current.error).toBe('Ya existe')
    expect(result.current.busy).toBe(false)
  })

  it('usa un mensaje general si lo lanzado no es un Error', async () => {
    const { result } = renderHook(() => useAction())
    await act(async () => {
      await result.current.run(() => Promise.reject('texto'))
    })
    expect(result.current.error).toBe('No se pudo completar la acción')
  })

  it('busy es true mientras la acción corre', async () => {
    const { result } = renderHook(() => useAction())
    let finish: () => void = () => undefined
    let pending: Promise<boolean> | undefined
    act(() => {
      pending = result.current.run(() => new Promise<void>((resolve) => (finish = resolve)))
    })
    expect(result.current.busy).toBe(true)
    await act(async () => {
      finish()
      await pending
    })
    expect(result.current.busy).toBe(false)
  })

  it('una nueva acción borra el error anterior', async () => {
    const { result } = renderHook(() => useAction())
    await act(async () => {
      await result.current.run(() => Promise.reject(new Error('mal')))
    })
    expect(result.current.error).toBe('mal')
    await act(async () => {
      await result.current.run(async () => undefined)
    })
    expect(result.current.error).toBe('')
  })

  it('clearError borra el mensaje', async () => {
    const { result } = renderHook(() => useAction())
    await act(async () => {
      await result.current.run(() => Promise.reject(new Error('mal')))
    })
    act(() => result.current.clearError())
    expect(result.current.error).toBe('')
  })

  it('un fallo síncrono dentro de la acción también se captura', async () => {
    const { result } = renderHook(() => useAction())
    let worked: boolean | undefined
    await act(async () => {
      worked = await result.current.run(() => {
        throw new Error('sync')
      })
    })
    expect(worked).toBe(false)
    expect(result.current.error).toBe('sync')
  })
})
