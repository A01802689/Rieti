import { renderHook, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCases } from '@/lib/api/cases'
import { ApiError } from '@/lib/api/client'
import { fuseReport } from '@/lib/api/reports'
import { getReports } from '@/lib/api/reports'
import { getMunicipios } from '@/lib/api/municipios'
import { getUsers } from '@/lib/api/users'
import CasesPage from '@/pages/cases/Cases'
import { CaseEditCard } from '@/pages/cases/components/CaseEditCard'
import { useCases } from '@/pages/cases/useCases'
import { useReports } from '@/pages/reports/useReports'
import { useUsers } from '@/pages/users/useUsers'
import { ReportActions } from '@/pages/reports/components/ReportActions'
import { makeAdmin, makeAuth, makeStaff } from '../helpers/auth'
import { makeCase, makeReport } from '../helpers/fixtures'
import { AuthTestProvider } from '../helpers/AuthTestProvider'
import { renderApp } from '../helpers/render'

vi.mock('@/lib/api/cases', () => ({ getCases: vi.fn(), deleteCases: vi.fn(), getCase: vi.fn(), updateCase: vi.fn(), addNote2Case: vi.fn() }))
vi.mock('@/lib/api/reports', () => ({ getReports: vi.fn(), fuseReport: vi.fn(), deleteReports: vi.fn(), acceptReport: vi.fn(), declineReport: vi.fn(), reopenReport: vi.fn() }))
vi.mock('@/lib/api/users', () => ({ getUsers: vi.fn(), getUser: vi.fn(), createUser: vi.fn(), changePermissions: vi.fn(), deleteUser: vi.fn() }))
vi.mock('@/lib/api/municipios', () => ({ getMunicipios: vi.fn() }))
vi.mock('recharts', () => {
  const Nothing = () => null
  return { ResponsiveContainer: Nothing, BarChart: Nothing, Bar: Nothing, Cell: Nothing, CartesianGrid: Nothing, XAxis: Nothing, YAxis: Nothing, Tooltip: Nothing }
})

beforeEach(() => {
  vi.mocked(getCases).mockReset()
  vi.mocked(getReports).mockReset()
  vi.mocked(getUsers).mockReset()
  vi.mocked(getMunicipios).mockReset().mockResolvedValue([])
  vi.mocked(fuseReport).mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe('Cases (página): búsqueda', () => {
  it('escribir en el buscador filtra la lista', async () => {
    vi.mocked(getCases).mockResolvedValue([makeCase({ id_caso: 1 }), makeCase({ id_caso: 22 })])
    const view = renderApp(<CasesPage />, { auth: makeAuth(makeAdmin()) })
    await screen.findByRole('heading', { name: 'Caso #1' })
    await view.user.type(screen.getByRole('searchbox'), '22')
    expect(screen.queryByRole('heading', { name: 'Caso #1' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Caso #22' })).toBeInTheDocument()
  })
})

describe('CaseEditCard: edad y tipo de trabajo', () => {
  it('manda también la edad y el tipo de trabajo cuando cambian', async () => {
    const saveChanges = vi.fn().mockResolvedValue(undefined)
    const view = renderApp(<CaseEditCard caso={makeCase()} saveChanges={saveChanges} />, { auth: makeAuth(makeStaff('cases.edit')) })
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    await view.user.selectOptions(screen.getByLabelText('Edad aproximada'), '0-5')
    await view.user.selectOptions(screen.getByLabelText('Tipo de trabajo'), 'Mendicidad')
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(saveChanges).toHaveBeenCalledWith({ patch: { edad_aproximada: '0-5', tipo_trabajo: 'Mendicidad' }, nota: null })
  })
})

describe('ReportActions: casos límite', () => {
  const full = makeStaff('reports.view', 'reports.edit', 'reports.close', 'cases.view')

  it('Rechazar alterna el paso al pulsarlo otra vez', async () => {
    const view = renderApp(<ReportActions report={makeReport()} onAccepted={vi.fn()} onChanged={vi.fn()} />, { auth: makeAuth(full) })
    await view.user.click(screen.getByRole('button', { name: 'Rechazar' }))
    await view.user.click(screen.getByRole('button', { name: 'Rechazar' }))
    expect(screen.queryByText(/¿Rechazar este reporte/)).not.toBeInTheDocument()
  })

  it('si fusionar falla muestra el error y deja el paso', async () => {
    vi.mocked(getCases).mockResolvedValue([makeCase({ id_caso: 3 })])
    vi.mocked(fuseReport).mockRejectedValue(new ApiError(404, 'Caso no existe'))
    const view = renderApp(<ReportActions report={makeReport()} onAccepted={vi.fn()} onChanged={vi.fn()} />, { auth: makeAuth(full) })
    await view.user.click(screen.getByRole('button', { name: 'Fusionar con un caso' }))
    await view.user.selectOptions(await screen.findByLabelText('Caso destino'), '3')
    await view.user.click(screen.getByRole('button', { name: 'Confirmar fusión' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Caso no existe')
    expect(screen.getByLabelText('Caso destino')).toBeInTheDocument()
  })

  it('los casos de la misma colonia van primero y a igual colonia por id', async () => {
    const base = makeCase().ubicacion
    vi.mocked(getCases).mockResolvedValue([
      makeCase({ id_caso: 9, ubicacion: { ...base, colonia: 'Otra' } }),
      makeCase({ id_caso: 8 }),
      makeCase({ id_caso: 7 }),
    ])
    const view = renderApp(<ReportActions report={makeReport()} onAccepted={vi.fn()} onChanged={vi.fn()} />, { auth: makeAuth(full) })
    await view.user.click(screen.getByRole('button', { name: 'Fusionar con un caso' }))
    const options = await screen.findAllByRole('option')
    expect(options.map((o) => o.textContent?.slice(0, 8))).toEqual(['Seleccio', 'Caso #7 ', 'Caso #8 ', 'Caso #9 '])
  })
})

describe('view-models: respuesta después de desmontar', () => {
  it('useUsers no actualiza el estado si se desmonta antes de recibir los usuarios', async () => {
    let resolve: (value: never[]) => void = () => undefined
    vi.mocked(getUsers).mockReturnValue(new Promise((res) => (resolve = res)))
    const { result, unmount } = renderHook(() => useUsers())
    unmount()
    resolve([])
    await Promise.resolve()
    expect(result.current.loading).toBe(true)
  })

  it('useUsers tampoco marca el fallo si ya se desmontó', async () => {
    let reject: (reason: unknown) => void = () => undefined
    vi.mocked(getUsers).mockReturnValue(new Promise((_, rej) => (reject = rej)))
    const { result, unmount } = renderHook(() => useUsers())
    unmount()
    reject(new TypeError('x'))
    await new Promise((r) => setTimeout(r, 0))
    expect(result.current.loadFailed).toBe(false)
  })

  it('useCases y useReports ignoran las respuestas tardías', async () => {
    let resolveCases: (value: never[]) => void = () => undefined
    let rejectReports: (reason: unknown) => void = () => undefined
    vi.mocked(getCases).mockReturnValue(new Promise((res) => (resolveCases = res)))
    vi.mocked(getReports).mockReturnValue(new Promise((_, rej) => (rejectReports = rej)))
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthTestProvider value={makeAuth(makeAdmin())}>{children}</AuthTestProvider>
    const cases = renderHook(() => useCases(), { wrapper })
    const reports = renderHook(() => useReports(), { wrapper })
    cases.unmount()
    reports.unmount()
    resolveCases([])
    rejectReports(new TypeError('x'))
    await new Promise((r) => setTimeout(r, 0))
    expect(cases.result.current.loading).toBe(true)
    expect(reports.result.current.loadFailed).toBe(false)
  })
})
