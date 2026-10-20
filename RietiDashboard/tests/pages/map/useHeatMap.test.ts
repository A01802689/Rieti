import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCases } from '@/lib/api/cases'
import { ApiError } from '@/lib/api/client'
import { getReports } from '@/lib/api/reports'
import {
  AGE_RANGE,
  CASE_VISUAL_OPTIONS,
  DAYS_RANGE,
  filterCases,
  filterReports,
  HOUR_RANGE,
  REPORT_VISUAL_OPTIONS,
  RISK_OPTIONS,
  WEEKDAY_OPTIONS,
  WORK_TYPE_OPTIONS,
  useHeatMap,
  type HeatMapFilters,
} from '@/pages/map/useHeatMap'
import { makeCase, makeReport } from '../../helpers/fixtures'

vi.mock('@/lib/api/cases', () => ({ getCases: vi.fn() }))
vi.mock('@/lib/api/reports', () => ({ getReports: vi.fn() }))

beforeEach(() => {
  vi.mocked(getCases).mockReset()
  vi.mocked(getReports).mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

const noFilters: HeatMapFilters = {
  ageRange: [AGE_RANGE[0], AGE_RANGE[1]],
  daysRange: [DAYS_RANGE[0], DAYS_RANGE[1]],
  hourRange: [HOUR_RANGE[0], HOUR_RANGE[1]],
  riskLevels: [],
  workTypes: [],
  weekdays: [],
}

const now = new Date('2026-03-10T18:30:00Z')
const ids = (list: { id_reporte: number }[]) => list.map((r) => r.id_reporte)

describe('filterReports', () => {
  const reports = [
    makeReport({ id_reporte: 1, edad_aproximada: '0-5', riesgo: 'Alto', tipo_trabajo: 'Campo', fecha_reporte: '2026-03-05T18:30:00', id_caso: null }),
    makeReport({ id_reporte: 2, edad_aproximada: '12-14', riesgo: 'Bajo', tipo_trabajo: 'Mendicidad', fecha_reporte: '2026-03-09T18:30:00', id_caso: null }),
    makeReport({ id_reporte: 3, edad_aproximada: null, riesgo: null, tipo_trabajo: 'Campo', fecha_reporte: '2026-03-01T06:00:00', id_caso: 7 }),
    makeReport({ id_reporte: 4, edad_aproximada: 'No sé', riesgo: 'Medio', tipo_trabajo: 'Construcción', fecha_reporte: '2026-01-01T00:00:00', id_caso: null }),
  ]

  it('sin filtros activos devuelve todo, incluso lo que no tiene edad ni riesgo', () => {
    expect(ids(filterReports(reports, noFilters, now))).toEqual([1, 2, 3, 4])
  })

  it('el rango de edades completo no excluye edades desconocidas, uno parcial sí', () => {
    expect(ids(filterReports(reports, { ...noFilters, ageRange: [0, 5] }, now))).toEqual([1])
    expect(ids(filterReports(reports, { ...noFilters, ageRange: [10, 18] }, now))).toEqual([2])
  })

  it('el rango de edades toma las bandas que se traslapan', () => {
    expect(ids(filterReports(reports, { ...noFilters, ageRange: [5, 6] }, now))).toEqual([1])
    expect(ids(filterReports(reports, { ...noFilters, ageRange: [14, 14] }, now))).toEqual([2])
    expect(ids(filterReports(reports, { ...noFilters, ageRange: [15, 18] }, now))).toEqual([])
  })

  it('el filtro de días excluye los reportes con caso y cuenta días completos', () => {
    expect(ids(filterReports(reports, { ...noFilters, daysRange: [0, 2] }, now))).toEqual([2])
    expect(ids(filterReports(reports, { ...noFilters, daysRange: [5, 5] }, now))).toEqual([1])
    expect(ids(filterReports(reports, { ...noFilters, daysRange: [1, 364] }, now))).toEqual([1, 2, 4])
  })

  it('el filtro de días: el límite inferior en 0 con el máximo bajado también está activo', () => {
    expect(ids(filterReports(reports, { ...noFilters, daysRange: [0, 364] }, now))).toEqual([1, 2, 4])
  })

  it('el filtro de horas usa la hora de la Ciudad de México', () => {
    // 18:30 UTC es 12:30 en la Ciudad de México
    expect(ids(filterReports(reports, { ...noFilters, hourRange: [12, 12] }, now))).toEqual([1, 2])
    expect(ids(filterReports(reports, { ...noFilters, hourRange: [13, 23] }, now))).toEqual([4])
    expect(ids(filterReports(reports, { ...noFilters, hourRange: [0, 11] }, now))).toEqual([3])
  })

  it('el filtro de días de la semana usa el día de la Ciudad de México', () => {
    // 2026-01-01T00:00 UTC es miércoles 31 de diciembre allá
    const wednesday = WEEKDAY_OPTIONS.filter((o) => o.value === 'Miércoles')
    expect(ids(filterReports(reports, { ...noFilters, weekdays: wednesday }, now))).toEqual([4])
  })

  it('el domingo (id 0) se puede filtrar', () => {
    const sunday = [WEEKDAY_OPTIONS[0]]
    const sundayReport = makeReport({ id_reporte: 9, fecha_reporte: '2026-03-08T18:00:00' })
    expect(ids(filterReports([sundayReport], { ...noFilters, weekdays: sunday }, now))).toEqual([9])
  })

  it('el nivel de riesgo excluye los reportes sin riesgo', () => {
    expect(ids(filterReports(reports, { ...noFilters, riskLevels: RISK_OPTIONS.filter((o) => o.value === 'Alto') }, now))).toEqual([1])
    expect(ids(filterReports(reports, { ...noFilters, riskLevels: [RISK_OPTIONS[0], RISK_OPTIONS[1], RISK_OPTIONS[2]] }, now))).toEqual([1, 2, 4])
  })

  it('el tipo de trabajo admite varios', () => {
    const campo = WORK_TYPE_OPTIONS.filter((o) => o.value === 'Campo' || o.value === 'Mendicidad')
    expect(ids(filterReports(reports, { ...noFilters, workTypes: campo }, now))).toEqual([1, 2, 3])
  })

  it('combina todos los filtros con Y', () => {
    const filters: HeatMapFilters = { ...noFilters, ageRange: [0, 5], riskLevels: [RISK_OPTIONS[2]], workTypes: WORK_TYPE_OPTIONS.filter((o) => o.value === 'Campo') }
    expect(ids(filterReports(reports, filters, now))).toEqual([1])
    expect(ids(filterReports(reports, { ...filters, riskLevels: [RISK_OPTIONS[0]] }, now))).toEqual([])
  })

  it('con una lista vacía devuelve una lista vacía', () => {
    expect(filterReports([], { ...noFilters, ageRange: [3, 4] }, now)).toEqual([])
  })
})

describe('filterCases', () => {
  const cases = [makeCase({ id_caso: 1, urgencia: 'Baja' }), makeCase({ id_caso: 2, urgencia: 'Media' }), makeCase({ id_caso: 3, urgencia: 'Alta' }), makeCase({ id_caso: 4, urgencia: null })]

  it('sin riesgo elegido deja todos', () => {
    expect(filterCases(cases, noFilters)).toHaveLength(4)
  })

  it('traduce la urgencia al nivel de riesgo', () => {
    expect(filterCases(cases, { ...noFilters, riskLevels: [RISK_OPTIONS[0]] }).map((c) => c.id_caso)).toEqual([1])
    expect(filterCases(cases, { ...noFilters, riskLevels: [RISK_OPTIONS[1], RISK_OPTIONS[2]] }).map((c) => c.id_caso)).toEqual([2, 3])
  })

  it('un caso sin urgencia no pasa cuando hay filtro de riesgo', () => {
    expect(filterCases(cases, { ...noFilters, riskLevels: RISK_OPTIONS }).map((c) => c.id_caso)).not.toContain(4)
  })

  it('los demás filtros no aplican a los casos', () => {
    expect(filterCases(cases, { ...noFilters, ageRange: [0, 1], daysRange: [0, 0], hourRange: [0, 0] })).toHaveLength(4)
  })
})

describe('useHeatMap', () => {
  it('carga reportes y casos y empieza con todo visible', async () => {
    vi.mocked(getReports).mockResolvedValue([makeReport()])
    vi.mocked(getCases).mockResolvedValue([makeCase()])
    const { result } = renderHook(() => useHeatMap())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current).toMatchObject({ forbidden: false, showReports: true, showCases: true, reportVisual: 'risk', caseVisual: 'urgency', selected: null })
    expect(result.current.reports).toHaveLength(1)
    expect(result.current.allCases).toHaveLength(1)
  })

  it('un 403 marca forbidden', async () => {
    vi.mocked(getReports).mockRejectedValue(new ApiError(403, 'x'))
    vi.mocked(getCases).mockResolvedValue([])
    const { result } = renderHook(() => useHeatMap())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.forbidden).toBe(true)
  })

  it('otro fallo termina la carga sin forbidden', async () => {
    vi.mocked(getReports).mockRejectedValue(new TypeError('red'))
    vi.mocked(getCases).mockResolvedValue([])
    const { result } = renderHook(() => useHeatMap())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.forbidden).toBe(false)
  })

  it('los filtros se aplican sobre la copia sin volver a pedir datos', async () => {
    vi.mocked(getReports).mockResolvedValue([makeReport({ riesgo: 'Alto' }), makeReport({ id_reporte: 2, riesgo: 'Bajo' })])
    vi.mocked(getCases).mockResolvedValue([makeCase({ urgencia: 'Alta' }), makeCase({ id_caso: 4, urgencia: 'Baja' })])
    const { result } = renderHook(() => useHeatMap())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setRiskLevels([RISK_OPTIONS[2]]))
    expect(result.current.reports.map((r) => r.id_reporte)).toEqual([1])
    expect(result.current.cases.map((c) => c.id_caso)).toEqual([3])
    expect(result.current.allReports).toHaveLength(2)
    expect(getReports).toHaveBeenCalledTimes(1)
  })

  it('sin opción de color cae al esquema por defecto', async () => {
    vi.mocked(getReports).mockResolvedValue([])
    vi.mocked(getCases).mockResolvedValue([])
    const { result } = renderHook(() => useHeatMap())
    act(() => {
      result.current.setReportVisualOption(undefined)
      result.current.setCaseVisualOption(undefined)
    })
    expect(result.current.reportVisual).toBe('risk')
    expect(result.current.caseVisual).toBe('urgency')
    act(() => {
      result.current.setReportVisualOption(REPORT_VISUAL_OPTIONS[3])
      result.current.setCaseVisualOption(CASE_VISUAL_OPTIONS[2])
    })
    expect(result.current.reportVisual).toBe('days_unattended')
    expect(result.current.caseVisual).toBe('daysElapsed')
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('descarta la respuesta si se desmonta antes', async () => {
    let resolve: (value: never[]) => void = () => undefined
    vi.mocked(getReports).mockReturnValue(new Promise((res) => (resolve = res)))
    vi.mocked(getCases).mockResolvedValue([])
    const { result, unmount } = renderHook(() => useHeatMap())
    unmount()
    resolve([])
    await Promise.resolve()
    expect(result.current.loading).toBe(true)
  })
})
