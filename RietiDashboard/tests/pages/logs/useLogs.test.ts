import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { getLogs } from '@/lib/api/logs'
import { useLogs } from '@/pages/logs/useLogs'
import { makeLog } from '../../helpers/fixtures'

vi.mock('@/lib/api/logs', () => ({ getLogs: vi.fn() }))

const getMock = vi.mocked(getLogs)

beforeEach(() => {
  getMock.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

const page = (from: number, count: number) => Array.from({ length: count }, (_, i) => makeLog({ id_logs: from + i }))

describe('useLogs', () => {
  it('carga la primera página con límite 100', async () => {
    getMock.mockResolvedValue(page(1, 3))
    const { result } = renderHook(() => useLogs())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(getMock).toHaveBeenCalledWith({ entity_type: undefined, buscar: undefined, limite: 100, desplazamiento: 0 })
    expect(result.current.logs).toHaveLength(3)
    expect(result.current.hasMore).toBe(false)
  })

  it('con exactamente 100 logs pueden quedar más', async () => {
    getMock.mockResolvedValue(page(1, 100))
    const { result } = renderHook(() => useLogs())
    await waitFor(() => expect(result.current.hasMore).toBe(true))
  })

  it('con 99 logs ya no hay más', async () => {
    getMock.mockResolvedValue(page(1, 99))
    const { result } = renderHook(() => useLogs())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasMore).toBe(false)
  })

  it('tiene un filtro Todos y uno por tipo de registro', () => {
    getMock.mockResolvedValue([])
    const { result } = renderHook(() => useLogs())
    expect(result.current.filterOptions.map((o) => o.label)).toEqual(['Todos', 'Usuario', 'Municipio', 'Reporte', 'Ubicación', 'Caso'])
  })

  it('elegir un filtro vuelve a pedir y cierra la fila abierta', async () => {
    getMock.mockResolvedValue(page(1, 2))
    const { result } = renderHook(() => useLogs())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.toggleExpanded(1))
    expect(result.current.expandedId).toBe(1)
    act(() => result.current.setSelectedFilter('caso'))
    expect(result.current.expandedId).toBeNull()
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(getMock).toHaveBeenLastCalledWith(expect.objectContaining({ entity_type: 'caso', desplazamiento: 0 }))
  })

  it('toggleExpanded abre y cierra la misma fila', async () => {
    getMock.mockResolvedValue([])
    const { result } = renderHook(() => useLogs())
    act(() => result.current.toggleExpanded(5))
    act(() => result.current.toggleExpanded(5))
    expect(result.current.expandedId).toBeNull()
    act(() => result.current.toggleExpanded(5))
    act(() => result.current.toggleExpanded(6))
    expect(result.current.expandedId).toBe(6)
  })

  describe('búsqueda con espera', () => {
    it('espera 350 ms sin escribir y recorta los espacios', async () => {
      vi.useFakeTimers()
      getMock.mockResolvedValue([])
      const { result } = renderHook(() => useLogs())
      await act(async () => void (await vi.advanceTimersByTimeAsync(0)))
      getMock.mockClear()
      act(() => result.current.setSearchQuery('  ana  '))
      await act(async () => void (await vi.advanceTimersByTimeAsync(349)))
      expect(getMock).not.toHaveBeenCalled()
      await act(async () => void (await vi.advanceTimersByTimeAsync(1)))
      expect(getMock).toHaveBeenCalledWith(expect.objectContaining({ buscar: 'ana' }))
    })

    it('escribir solo espacios no vuelve a pedir', async () => {
      vi.useFakeTimers()
      getMock.mockResolvedValue([])
      const { result } = renderHook(() => useLogs())
      await act(async () => void (await vi.advanceTimersByTimeAsync(0)))
      getMock.mockClear()
      act(() => result.current.setSearchQuery('   '))
      await act(async () => void (await vi.advanceTimersByTimeAsync(1000)))
      expect(getMock).not.toHaveBeenCalled()
    })
  })

  it('un 403 marca forbidden', async () => {
    getMock.mockRejectedValue(new ApiError(403, 'x'))
    const { result } = renderHook(() => useLogs())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.forbidden).toBe(true)
    expect(result.current.error).toBe(true)
    expect(result.current.logs).toEqual([])
  })

  it('otro fallo marca error sin forbidden', async () => {
    getMock.mockRejectedValue(new TypeError('red'))
    const { result } = renderHook(() => useLogs())
    await waitFor(() => expect(result.current.error).toBe(true))
    expect(result.current.forbidden).toBe(false)
  })

  it('loadMore agrega la página siguiente sin repetir los ya cargados', async () => {
    getMock.mockResolvedValueOnce(page(1, 100)).mockResolvedValueOnce([...page(99, 2), ...page(101, 3)])
    const { result } = renderHook(() => useLogs())
    await waitFor(() => expect(result.current.hasMore).toBe(true))
    await act(async () => result.current.loadMore())
    expect(getMock).toHaveBeenLastCalledWith(expect.objectContaining({ desplazamiento: 100 }))
    expect(result.current.logs.map((l) => l.id_logs).slice(-4)).toEqual([100, 101, 102, 103])
    expect(new Set(result.current.logs.map((l) => l.id_logs)).size).toBe(result.current.logs.length)
    expect(result.current.hasMore).toBe(false)
  })

  it('loadMore con fallo conserva los logs y marca error', async () => {
    getMock.mockResolvedValueOnce(page(1, 100)).mockRejectedValueOnce(new ApiError(500, 'x'))
    const { result } = renderHook(() => useLogs())
    await waitFor(() => expect(result.current.hasMore).toBe(true))
    await act(async () => result.current.loadMore())
    expect(result.current.logs).toHaveLength(100)
    expect(result.current.error).toBe(true)
    expect(result.current.loadingMore).toBe(false)
  })

  it('loadMore no hace nada mientras la primera carga no termina', async () => {
    getMock.mockReturnValue(new Promise(() => undefined))
    const { result } = renderHook(() => useLogs())
    await act(async () => result.current.loadMore())
    expect(getMock).toHaveBeenCalledTimes(1)
  })

  it('descarta la respuesta tardía de un filtro anterior', async () => {
    let resolveFirst: (value: ReturnType<typeof page>) => void = () => undefined
    getMock.mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve))).mockResolvedValueOnce(page(50, 1))
    const { result } = renderHook(() => useLogs())
    act(() => result.current.setSelectedFilter('caso'))
    await waitFor(() => expect(result.current.logs.map((l) => l.id_logs)).toEqual([50]))
    await act(async () => resolveFirst(page(1, 5)))
    expect(result.current.logs.map((l) => l.id_logs)).toEqual([50])
  })
})
