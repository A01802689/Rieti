import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getLoginIndicators } from '@/lib/api/indicators'
import { useLoginIndicators } from '@/pages/login/useLoginIndicators'

vi.mock('@/lib/api/indicators', () => ({ getLoginIndicators: vi.fn() }))

const getMock = vi.mocked(getLoginIndicators)
const totals = { reportes_registrados: 10, casos_activos: 3, ninos_atendidos: 7 }

beforeEach(() => {
  getMock.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe('useLoginIndicators', () => {
  it('empieza en null y luego da los totales', async () => {
    getMock.mockResolvedValue(totals)
    const { result } = renderHook(() => useLoginIndicators())
    expect(result.current).toBeNull()
    await waitFor(() => expect(result.current).toEqual(totals))
  })

  it('se queda en null y registra el error si la petición falla', async () => {
    getMock.mockRejectedValue(new Error('caído'))
    const { result } = renderHook(() => useLoginIndicators())
    await waitFor(() => expect(console.error).toHaveBeenCalled())
    expect(result.current).toBeNull()
  })

  it('pide los totales una sola vez', async () => {
    getMock.mockResolvedValue(totals)
    const { rerender, result } = renderHook(() => useLoginIndicators())
    await waitFor(() => expect(result.current).not.toBeNull())
    rerender()
    expect(getMock).toHaveBeenCalledTimes(1)
  })

  it('descarta la respuesta si se desmonta antes', async () => {
    let resolve: (value: typeof totals) => void = () => undefined
    getMock.mockReturnValue(new Promise((res) => (resolve = res)))
    const { result, unmount } = renderHook(() => useLoginIndicators())
    unmount()
    resolve(totals)
    await Promise.resolve()
    expect(result.current).toBeNull()
  })

  it('acepta totales en cero como datos reales', async () => {
    const zero = { reportes_registrados: 0, casos_activos: 0, ninos_atendidos: 0 }
    getMock.mockResolvedValue(zero)
    const { result } = renderHook(() => useLoginIndicators())
    await waitFor(() => expect(result.current).toEqual(zero))
  })
})
