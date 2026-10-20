import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { useDetail } from '@/lib/utilities/useDetail'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

/** Promise whose result the test decides */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useDetail', () => {
  it('carga el recurso por id', async () => {
    const fetcher = vi.fn(async (id: number) => ({ id }))
    const { result } = renderHook(() => useDetail(4, fetcher))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ id: 4 })
    expect(fetcher).toHaveBeenCalledWith(4)
    expect(result.current.forbidden).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it.each([[NaN], [0], [-1], [1.5], [Infinity], [Number.MAX_SAFE_INTEGER + 2]])(
    'el id %s cuenta como no encontrado y no llama al fetcher',
    (id) => {
      const fetcher = vi.fn(async () => 'x')
      const { result } = renderHook(() => useDetail(id, fetcher))
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeUndefined()
      expect(fetcher).not.toHaveBeenCalled()
    },
  )

  it('un 404 deja el recurso sin datos y sin error', async () => {
    const fetcher = vi.fn(async () => {
      throw new ApiError(404, 'No existe')
    })
    const { result } = renderHook(() => useDetail(4, fetcher))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeUndefined()
    expect(result.current.forbidden).toBe(false)
  })

  it('un 403 marca forbidden sin mensaje de error', async () => {
    const fetcher = vi.fn(async () => {
      throw new ApiError(403, 'Sin permiso')
    })
    const { result } = renderHook(() => useDetail(4, fetcher))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.forbidden).toBe(true)
    expect(result.current.error).toBeUndefined()
  })

  it.each([[new ApiError(500, 'boom')], [new TypeError('red')], ['texto']])('otro fallo (%s) da un mensaje de error', async (failure) => {
    const fetcher = vi.fn(async () => {
      throw failure
    })
    const { result } = renderHook(() => useDetail(4, fetcher))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('No se pudo cargar el detalle. Intenta de nuevo')
    expect(result.current.forbidden).toBe(false)
  })

  it('descarta la respuesta tardía de un id anterior', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const fetcher = vi.fn((id: number) => (id === 1 ? first.promise : second.promise))
    const { result, rerender } = renderHook(({ id }) => useDetail(id, fetcher), { initialProps: { id: 1 } })
    rerender({ id: 2 })
    await act(async () => second.resolve('segundo'))
    await waitFor(() => expect(result.current.data).toBe('segundo'))
    await act(async () => first.resolve('primero'))
    expect(result.current.data).toBe('segundo')
  })

  it('no muestra el recurso anterior mientras carga otro id', async () => {
    const second = deferred<string>()
    const fetcher = vi.fn((id: number) => (id === 1 ? Promise.resolve('uno') : second.promise))
    const { result, rerender } = renderHook(({ id }) => useDetail(id, fetcher), { initialProps: { id: 1 } })
    await waitFor(() => expect(result.current.data).toBe('uno'))
    rerender({ id: 2 })
    expect(result.current.data).toBeUndefined()
    expect(result.current.loading).toBe(true)
    await act(async () => second.resolve('dos'))
    await waitFor(() => expect(result.current.data).toBe('dos'))
  })

  it('descarta la respuesta si el componente se desmonta', async () => {
    const pending = deferred<string>()
    const { unmount } = renderHook(() => useDetail(1, () => pending.promise))
    unmount()
    await act(async () => pending.resolve('tarde'))
    expect(console.error).not.toHaveBeenCalled()
  })

  it('reload vuelve a pedir el recurso', async () => {
    let count = 0
    const fetcher = vi.fn(async () => ++count)
    const { result } = renderHook(() => useDetail(1, fetcher))
    await waitFor(() => expect(result.current.data).toBe(1))
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.data).toBe(2))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('mutate ejecuta la acción y recarga', async () => {
    let count = 0
    const fetcher = vi.fn(async () => ++count)
    const { result } = renderHook(() => useDetail(1, fetcher))
    await waitFor(() => expect(result.current.data).toBe(1))
    const action = vi.fn(async () => undefined)
    await act(async () => result.current.mutate(action))
    expect(action).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(result.current.data).toBe(2))
  })

  it('mutate recarga aunque la acción falle y relanza el error', async () => {
    let count = 0
    const fetcher = vi.fn(async () => ++count)
    const { result } = renderHook(() => useDetail(1, fetcher))
    await waitFor(() => expect(result.current.data).toBe(1))
    const failure = new ApiError(409, 'Conflicto')
    let caught: unknown
    await act(async () => {
      caught = await result.current.mutate(() => Promise.reject(failure)).catch((e: unknown) => e)
    })
    expect(caught).toBe(failure)
    await waitFor(() => expect(result.current.data).toBe(2))
  })

  it('si el recurso pasa de ok a 403 tras recargar, deja de mostrar datos', async () => {
    let denied = false
    const fetcher = vi.fn(async () => {
      if (denied) throw new ApiError(403, 'x')
      return 'datos'
    })
    const { result } = renderHook(() => useDetail(1, fetcher))
    await waitFor(() => expect(result.current.data).toBe('datos'))
    denied = true
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.forbidden).toBe(true))
    expect(result.current.data).toBeUndefined()
  })

  it('un fetcher nuevo reinicia la carga', async () => {
    const a = vi.fn(async () => 'a')
    const b = vi.fn(async () => 'b')
    const { result, rerender } = renderHook(({ fetcher }) => useDetail(1, fetcher), { initialProps: { fetcher: a } })
    await waitFor(() => expect(result.current.data).toBe('a'))
    rerender({ fetcher: b })
    expect(result.current.data).toBeUndefined()
    await waitFor(() => expect(result.current.data).toBe('b'))
  })
})
