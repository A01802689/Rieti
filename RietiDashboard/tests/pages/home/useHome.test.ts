import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCases } from '@/lib/api/cases'
import { ApiError } from '@/lib/api/client'
import { getReports } from '@/lib/api/reports'
import { useHome } from '@/pages/home/useHome'
import { makeCase, makeReport } from '../../helpers/fixtures'

vi.mock('@/lib/api/cases', () => ({ getCases: vi.fn() }))
vi.mock('@/lib/api/reports', () => ({ getReports: vi.fn() }))

beforeEach(() => {
  vi.mocked(getCases).mockReset()
  vi.mocked(getReports).mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

const now = new Date('2026-03-15T18:00:00Z')

describe('useHome', () => {
  it('sin datos devuelve ceros, seis meses y todos los estados', async () => {
    vi.mocked(getCases).mockResolvedValue([])
    vi.mocked(getReports).mockResolvedValue([])
    const { result } = renderHook(() => useHome(now))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.stats.map((s) => s.value)).toEqual(['0', '0', '0', '0'])
    expect(result.current.graphData.map((g) => g.name)).toEqual(['Octubre 2025', 'Noviembre 2025', 'Diciembre 2025', 'Enero', 'Febrero', 'Marzo'])
    expect(result.current.graphData.every((g) => g.value === 0)).toBe(true)
    expect(result.current.caseStatus).toHaveLength(3)
    expect(result.current.reportStatus).toHaveLength(6)
  })

  it('cuenta casos, cerrados, reportes y canalizados', async () => {
    vi.mocked(getCases).mockResolvedValue([makeCase({ estado: 'Cerrado' }), makeCase({ id_caso: 4, estado: 'Abierto' })])
    vi.mocked(getReports).mockResolvedValue([makeReport({ id_caso: 3 }), makeReport({ id_reporte: 2 }), makeReport({ id_reporte: 3, estatus_seguimiento: 'Rechazado' })])
    const { result } = renderHook(() => useHome(now))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.stats.map((s) => s.value)).toEqual(['2', '3', '1', '1'])
    expect(result.current.caseStatus.find((s) => s.value === 'Cerrado')?.total).toBe(1)
    expect(result.current.reportStatus.find((s) => s.value === 'Rechazado')?.total).toBe(1)
  })

  it('un reporte sin estatus no cuenta en ningún estatus', async () => {
    vi.mocked(getCases).mockResolvedValue([])
    vi.mocked(getReports).mockResolvedValue([makeReport({ estatus_seguimiento: null })])
    const { result } = renderHook(() => useHome(now))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.reportStatus.reduce((sum, s) => sum + s.total, 0)).toBe(0)
  })

  it('agrupa los casos por mes en hora de la Ciudad de México', async () => {
    vi.mocked(getCases).mockResolvedValue([
      makeCase({ id_caso: 1, fecha_caso: '2026-03-02T12:00:00' }),
      makeCase({ id_caso: 2, fecha_caso: '2026-03-10T12:00:00' }),
      // a las 03:00 UTC del 1 de marzo todavía es febrero en la Ciudad de México
      makeCase({ id_caso: 3, fecha_caso: '2026-03-01T03:00:00' }),
      makeCase({ id_caso: 4, fecha_caso: '2025-12-20T12:00:00' }),
      makeCase({ id_caso: 5, fecha_caso: '2020-01-01T12:00:00' }),
    ])
    vi.mocked(getReports).mockResolvedValue([])
    const { result } = renderHook(() => useHome(now))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const byName = Object.fromEntries(result.current.graphData.map((g) => [g.name, g.value]))
    expect(byName).toMatchObject({ Marzo: 2, Febrero: 1, 'Diciembre 2025': 1, Enero: 0 })
    expect(Object.values(byName).reduce((a, b) => a + b, 0)).toBe(4)
  })

  it('la gráfica cruza el cambio de año sin mezclar meses', async () => {
    vi.mocked(getCases).mockResolvedValue([])
    vi.mocked(getReports).mockResolvedValue([])
    const { result } = renderHook(() => useHome(new Date('2026-01-10T18:00:00Z')))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.graphData.map((g) => g.name)).toEqual(['Agosto 2025', 'Septiembre 2025', 'Octubre 2025', 'Noviembre 2025', 'Diciembre 2025', 'Enero'])
  })

  it('el 1 de enero a las 03:00 UTC la gráfica aún termina en diciembre', async () => {
    vi.mocked(getCases).mockResolvedValue([])
    vi.mocked(getReports).mockResolvedValue([])
    const { result } = renderHook(() => useHome(new Date('2026-01-01T03:00:00Z')))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.graphData.at(-1)?.name).toBe('Diciembre')
  })

  it('un 403 marca forbidden', async () => {
    vi.mocked(getCases).mockRejectedValue(new ApiError(403, 'x'))
    vi.mocked(getReports).mockResolvedValue([])
    const { result } = renderHook(() => useHome(now))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.forbidden).toBe(true)
  })

  it('otro fallo termina la carga sin forbidden y deja los totales en cero', async () => {
    vi.mocked(getCases).mockRejectedValue(new TypeError('red'))
    vi.mocked(getReports).mockResolvedValue([])
    const { result } = renderHook(() => useHome(now))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.forbidden).toBe(false)
    expect(result.current.stats[0].value).toBe('0')
  })
})
