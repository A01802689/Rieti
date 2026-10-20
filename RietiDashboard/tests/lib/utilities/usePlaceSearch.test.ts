import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchPlaces, type GeocodedPlace } from '@/lib/api/geocoding'
import { usePlaceSearch } from '@/lib/utilities/usePlaceSearch'

vi.mock('@/lib/api/geocoding', () => ({ searchPlaces: vi.fn() }))

const searchMock = vi.mocked(searchPlaces)

const place = (id: number): GeocodedPlace => ({ id, label: `Lugar ${id}`, lat: 19, lng: -99, colonia: '', calle: '' })

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

beforeEach(() => {
  searchMock.mockReset()
})

describe('usePlaceSearch', () => {
  it('empieza vacío', () => {
    const { result } = renderHook(() => usePlaceSearch())
    expect(result.current).toMatchObject({ query: '', results: null, searching: false, error: '' })
  })

  it('no busca mientras se escribe, solo al llamar run', () => {
    const { result } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('refor'))
    expect(searchMock).not.toHaveBeenCalled()
  })

  it('un texto vacío o de espacios no hace nada', async () => {
    const { result } = renderHook(() => usePlaceSearch())
    await act(async () => result.current.run())
    act(() => result.current.setQuery('   '))
    await act(async () => result.current.run())
    expect(searchMock).not.toHaveBeenCalled()
    expect(result.current.searching).toBe(false)
  })

  it('busca el texto sin espacios y guarda los resultados', async () => {
    searchMock.mockResolvedValue([place(1)])
    const { result } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('  reforma  '))
    await act(async () => result.current.run())
    expect(searchMock).toHaveBeenCalledWith('reforma', expect.any(AbortSignal))
    expect(result.current.results).toEqual([place(1)])
    expect(result.current.searching).toBe(false)
  })

  it('searching es true mientras la búsqueda corre', async () => {
    const pending = deferred<GeocodedPlace[]>()
    searchMock.mockReturnValue(pending.promise)
    const { result } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('x'))
    let running: Promise<void> | undefined
    act(() => {
      running = result.current.run()
    })
    expect(result.current.searching).toBe(true)
    await act(async () => {
      pending.resolve([])
      await running
    })
    expect(result.current.searching).toBe(false)
    expect(result.current.results).toEqual([])
  })

  it('una nueva búsqueda cancela la anterior y descarta su respuesta', async () => {
    const first = deferred<GeocodedPlace[]>()
    const second = deferred<GeocodedPlace[]>()
    searchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const { result } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('uno'))
    let runFirst: Promise<void> | undefined
    act(() => {
      runFirst = result.current.run()
    })
    act(() => result.current.setQuery('dos'))
    let runSecond: Promise<void> | undefined
    act(() => {
      runSecond = result.current.run()
    })
    expect(searchMock.mock.calls[0][1]?.aborted).toBe(true)
    expect(searchMock.mock.calls[1][1]?.aborted).toBe(false)
    await act(async () => {
      second.resolve([place(2)])
      await runSecond
    })
    await act(async () => {
      first.resolve([place(1)])
      await runFirst
    })
    expect(result.current.results).toEqual([place(2)])
    expect(result.current.searching).toBe(false)
  })

  it('el fallo de una búsqueda cancelada no muestra error', async () => {
    const first = deferred<GeocodedPlace[]>()
    searchMock.mockReturnValueOnce(first.promise).mockResolvedValueOnce([place(2)])
    const { result } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('uno'))
    let runFirst: Promise<void> | undefined
    act(() => {
      runFirst = result.current.run()
    })
    await act(async () => result.current.run())
    await act(async () => {
      first.reject(new DOMException('aborted', 'AbortError'))
      await runFirst
    })
    expect(result.current.error).toBe('')
    expect(result.current.results).toEqual([place(2)])
  })

  it('un fallo guarda el mensaje y vacía los resultados', async () => {
    searchMock.mockResolvedValueOnce([place(1)]).mockRejectedValueOnce(new Error('Sin conexión'))
    const { result } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('x'))
    await act(async () => result.current.run())
    await act(async () => result.current.run())
    expect(result.current.error).toBe('Sin conexión')
    expect(result.current.results).toBeNull()
    expect(result.current.searching).toBe(false)
  })

  it('usa un mensaje general si lo lanzado no es un Error', async () => {
    searchMock.mockRejectedValue('x')
    const { result } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('x'))
    await act(async () => result.current.run())
    expect(result.current.error).toBe('No se pudo buscar el lugar')
  })

  it('una búsqueda nueva borra el error anterior', async () => {
    searchMock.mockRejectedValueOnce(new Error('mal')).mockResolvedValueOnce([])
    const { result } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('x'))
    await act(async () => result.current.run())
    expect(result.current.error).toBe('mal')
    await act(async () => result.current.run())
    expect(result.current.error).toBe('')
  })

  it('clear borra los resultados y el error', async () => {
    searchMock.mockResolvedValue([place(1)])
    const { result } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('x'))
    await act(async () => result.current.run())
    act(() => result.current.clear())
    expect(result.current.results).toBeNull()
    expect(result.current.error).toBe('')
  })

  it('al desmontar cancela la búsqueda que sigue corriendo', () => {
    searchMock.mockReturnValue(new Promise(() => undefined))
    const { result, unmount } = renderHook(() => usePlaceSearch())
    act(() => result.current.setQuery('x'))
    act(() => void result.current.run())
    unmount()
    expect(searchMock.mock.calls[0][1]?.aborted).toBe(true)
  })

  it('desmontar sin haber buscado no falla', () => {
    const { unmount } = renderHook(() => usePlaceSearch())
    expect(() => unmount()).not.toThrow()
  })
})
