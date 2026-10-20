import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { deleteReports, getReport, getReports } from '@/lib/api/reports'
import { useReport, useReports } from '@/pages/reports/useReports'
import { makeAdmin, makeAuth, makeStaff } from '../../helpers/auth'
import { AuthTestProvider } from '../../helpers/AuthTestProvider'
import { makeReport } from '../../helpers/fixtures'

vi.mock('@/lib/api/reports', () => ({ getReports: vi.fn(), getReport: vi.fn(), deleteReports: vi.fn() }))

beforeEach(() => {
  vi.mocked(getReports).mockReset()
  vi.mocked(getReport).mockReset()
  vi.mocked(deleteReports).mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

const wrapperFor = (user: ReturnType<typeof makeStaff>) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <AuthTestProvider value={makeAuth(user)}>{children}</AuthTestProvider>
  }

const reports = [
  makeReport({ id_reporte: 1, folio_reporte: 'REP-1', estatus_seguimiento: 'Recibido', fecha_reporte: '2026-03-01T10:00:00' }),
  makeReport({ id_reporte: 2, folio_reporte: 'REP-2', estatus_seguimiento: 'Rechazado', fecha_reporte: '2026-03-03T10:00:00' }),
  makeReport({ id_reporte: 3, folio_reporte: 'REP-3', estatus_seguimiento: null, fecha_reporte: '2026-03-02T10:00:00', tipo_trabajo: 'Construcción' }),
  makeReport({ id_reporte: 4, folio_reporte: 'REP-4', estatus_seguimiento: 'Canalizado', fecha_reporte: '2026-03-04T10:00:00', ubicacion: { ...makeReport().ubicacion, colonia: 'Árbol', calle: 'Ñandú' } }),
]

const load = async (user = makeAdmin()) => {
  vi.mocked(getReports).mockResolvedValue(reports)
  const hook = renderHook(() => useReports(), { wrapper: wrapperFor(user) })
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

describe('useReports', () => {
  it('ordena de más nuevo a más viejo', async () => {
    const { result } = await load()
    expect(result.current.reports.map((r) => r.id_reporte)).toEqual([4, 2, 3, 1])
  })

  it('arma los filtros con totales en orden del flujo, rechazado y sin estatus al final', async () => {
    const { result } = await load()
    expect(result.current.filterOptions).toEqual([
      { value: 'Todos', total: 4 },
      { value: 'Recibido', total: 1 },
      { value: 'Canalizado', total: 1 },
      { value: 'Rechazado', total: 1 },
      { value: 'Sin estatus', total: 1 },
    ])
  })

  it('filtra por estatus, incluido "Sin estatus"', async () => {
    const { result } = await load()
    act(() => result.current.setSelectedFilter('Sin estatus'))
    expect(result.current.reports.map((r) => r.id_reporte)).toEqual([3])
  })

  it('busca sin distinguir mayúsculas ni acentos en folio, colonia, calle y tipo', async () => {
    const { result } = await load()
    act(() => result.current.setSearchQuery('  arbol '))
    expect(result.current.reports.map((r) => r.id_reporte)).toEqual([4])
    act(() => result.current.setSearchQuery('NANDU'))
    expect(result.current.reports.map((r) => r.id_reporte)).toEqual([4])
    act(() => result.current.setSearchQuery('rep-2'))
    expect(result.current.reports.map((r) => r.id_reporte)).toEqual([2])
    act(() => result.current.setSearchQuery('construccion'))
    expect(result.current.reports.map((r) => r.id_reporte)).toEqual([3])
    act(() => result.current.setSearchQuery('nada'))
    expect(result.current.reports).toEqual([])
  })

  it('un filtro que ya no tiene reportes vuelve a Todos', async () => {
    const { result } = await load()
    act(() => result.current.setSelectedFilter('Rechazado'))
    expect(result.current.selectedFilter).toBe('Rechazado')
    vi.mocked(getReports).mockResolvedValue([reports[0]])
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.filterOptions).toHaveLength(2))
    expect(result.current.selectedFilter).toBe('Todos')
    expect(result.current.reports).toHaveLength(1)
  })

  it('un 403 marca forbidden y no loadFailed', async () => {
    vi.mocked(getReports).mockRejectedValue(new ApiError(403, 'x'))
    const { result } = renderHook(() => useReports(), { wrapper: wrapperFor(makeStaff()) })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.forbidden).toBe(true)
    expect(result.current.loadFailed).toBe(false)
    expect(result.current.reports).toEqual([])
  })

  it('otro fallo marca loadFailed y reload lo recupera', async () => {
    vi.mocked(getReports).mockRejectedValueOnce(new ApiError(500, 'x')).mockResolvedValueOnce(reports)
    const { result } = renderHook(() => useReports(), { wrapper: wrapperFor(makeAdmin()) })
    await waitFor(() => expect(result.current.loadFailed).toBe(true))
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.loadFailed).toBe(false))
    expect(result.current.reports).toHaveLength(4)
  })

  it('solo un administrador viendo Rechazado puede seleccionar', async () => {
    const admin = await load(makeAdmin())
    expect(admin.result.current.canSelect).toBe(false)
    act(() => admin.result.current.setSelectedFilter('Rechazado'))
    expect(admin.result.current.canSelect).toBe(true)
    const staff = await load(makeStaff('reports.view'))
    act(() => staff.result.current.setSelectedFilter('Rechazado'))
    expect(staff.result.current.canSelect).toBe(false)
  })

  it('removeSelected borra los elegidos, limpia la selección y recarga', async () => {
    vi.mocked(deleteReports).mockResolvedValue({ eliminados: [2], omitidos: [] })
    const { result } = await load()
    act(() => result.current.setSelectedFilter('Rechazado'))
    act(() => {
      result.current.selection.start()
      result.current.selection.toggle(2)
    })
    let outcome: unknown
    await act(async () => {
      outcome = await result.current.removeSelected()
    })
    expect(deleteReports).toHaveBeenCalledWith([2])
    expect(outcome).toEqual({ eliminados: [2], omitidos: [] })
    expect(result.current.selection.active).toBe(false)
    await waitFor(() => expect(getReports).toHaveBeenCalledTimes(2))
  })

  it('si el borrado falla relanza el error y mantiene la selección', async () => {
    vi.mocked(deleteReports).mockRejectedValue(new ApiError(502, 'S3'))
    const { result } = await load()
    act(() => result.current.setSelectedFilter('Rechazado'))
    act(() => {
      result.current.selection.start()
      result.current.selection.toggle(2)
    })
    await act(async () => {
      await expect(result.current.removeSelected()).rejects.toMatchObject({ status: 502 })
    })
    expect(result.current.selection.ids).toEqual([2])
  })
})

describe('useReport', () => {
  it('carga un reporte por id', async () => {
    vi.mocked(getReport).mockResolvedValue(reports[0])
    const { result } = renderHook(() => useReport(1))
    await waitFor(() => expect(result.current.report).toEqual(reports[0]))
    expect(getReport).toHaveBeenCalledWith(1)
  })

  it('un id no numérico no se pide', () => {
    const { result } = renderHook(() => useReport(Number('abc')))
    expect(result.current.loading).toBe(false)
    expect(result.current.report).toBeUndefined()
    expect(getReport).not.toHaveBeenCalled()
  })
})
