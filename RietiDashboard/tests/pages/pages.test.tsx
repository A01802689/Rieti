import { screen, waitFor, within } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addNote2Case, deleteCases, getCase, getCases, updateCase } from '@/lib/api/cases'
import { ApiError } from '@/lib/api/client'
import { getLogs } from '@/lib/api/logs'
import { getMunicipios } from '@/lib/api/municipios'
import { deleteReports, getReport, getReports } from '@/lib/api/reports'
import { deleteUser, getUser, getUsers } from '@/lib/api/users'
import CaseDetailPage from '@/pages/cases/CaseDetail'
import CasesPage from '@/pages/cases/Cases'
import HomePage from '@/pages/home/HomePage'
import HeatMapPage from '@/pages/map/HeatMapPage'
import LogsPage from '@/pages/logs/Logs'
import ReportDetailPage from '@/pages/reports/ReportDetail'
import ReportPage from '@/pages/reports/Reports'
import UsersPage from '@/pages/users/Users'
import { makeAdmin, makeAuth, makeStaff } from '../helpers/auth'
import { makeCase, makeLog, makeReport, makeStoredUser } from '../helpers/fixtures'
import { renderApp } from '../helpers/render'

vi.mock('@/lib/api/cases', () => ({ getCases: vi.fn(), getCase: vi.fn(), updateCase: vi.fn(), addNote2Case: vi.fn(), deleteCases: vi.fn(), transferCase: vi.fn() }))
vi.mock('@/lib/api/reports', () => ({
  getReports: vi.fn(),
  getReport: vi.fn(),
  deleteReports: vi.fn(),
  acceptReport: vi.fn(),
  declineReport: vi.fn(),
  fuseReport: vi.fn(),
  reopenReport: vi.fn(),
  changeReportState: vi.fn(),
  unlinkReport: vi.fn(),
}))
vi.mock('@/lib/api/logs', () => ({ getLogs: vi.fn() }))
vi.mock('@/lib/api/users', () => ({ getUsers: vi.fn(), getUser: vi.fn(), createUser: vi.fn(), changePermissions: vi.fn(), deleteUser: vi.fn() }))
vi.mock('@/lib/api/municipios', () => ({ getMunicipios: vi.fn() }))
vi.mock('recharts', () => {
  const Nothing = () => null
  return { ResponsiveContainer: Nothing, BarChart: Nothing, LineChart: Nothing, Bar: Nothing, Line: Nothing, Cell: Nothing, CartesianGrid: Nothing, XAxis: Nothing, YAxis: Nothing, Tooltip: Nothing }
})

beforeEach(() => {
  for (const fn of [getCases, getCase, updateCase, addNote2Case, deleteCases, getReports, getReport, deleteReports, getLogs, getUsers, getUser, deleteUser, getMunicipios]) {
    vi.mocked(fn).mockReset()
  }
  vi.mocked(getMunicipios).mockResolvedValue([])
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe('Reports (página)', () => {
  const reports = [
    makeReport({ id_reporte: 1, folio_reporte: 'REP-1', estatus_seguimiento: 'Recibido' }),
    makeReport({ id_reporte: 2, folio_reporte: 'REP-2', estatus_seguimiento: 'Rechazado', fecha_reporte: '2026-03-06T10:00:00' }),
  ]

  it('lista los reportes con los botones de filtro y sus totales', async () => {
    vi.mocked(getReports).mockResolvedValue(reports)
    renderApp(<ReportPage />, { auth: makeAuth(makeAdmin()) })
    expect(await screen.findByRole('heading', { name: 'REP-1' })).toBeInTheDocument()
    const filters = within(screen.getByRole('group', { name: 'Filtrar por estado' }))
    expect(filters.getByRole('button', { name: /Todos \(2\)/ })).toHaveAttribute('aria-pressed', 'true')
    expect(filters.getByRole('button', { name: /Rechazado \(1\)/ })).toBeInTheDocument()
  })

  it('filtra por estatus y busca por texto', async () => {
    vi.mocked(getReports).mockResolvedValue(reports)
    const view = renderApp(<ReportPage />, { auth: makeAuth(makeAdmin()) })
    await screen.findByRole('heading', { name: 'REP-1' })
    await view.user.click(screen.getByRole('button', { name: /Recibido \(1\)/ }))
    expect(screen.queryByRole('heading', { name: 'REP-2' })).not.toBeInTheDocument()
    await view.user.click(screen.getByRole('button', { name: /Todos/ }))
    await view.user.type(screen.getByRole('searchbox', { name: 'Buscar reportes' }), 'zzz')
    expect(screen.getByText('No hay reportes que coincidan con la búsqueda.')).toBeInTheDocument()
  })

  it('un 403 muestra la tarjeta de sin permiso y oculta los filtros', async () => {
    vi.mocked(getReports).mockRejectedValue(new ApiError(403, 'x'))
    renderApp(<ReportPage />, { auth: makeAuth(makeStaff('reports.view')) })
    expect(await screen.findByText('No tienes permiso para ver esta información')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Filtrar por estado' })).not.toBeInTheDocument()
  })

  it('un fallo muestra el error con reintento que vuelve a pedir', async () => {
    vi.mocked(getReports).mockRejectedValueOnce(new TypeError('red')).mockResolvedValueOnce(reports)
    const view = renderApp(<ReportPage />, { auth: makeAuth(makeAdmin()) })
    await view.user.click(await screen.findByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'REP-1' })).toBeInTheDocument()
  })

  it('el administrador viendo Rechazado puede seleccionar y borrar', async () => {
    vi.mocked(getReports).mockResolvedValue(reports)
    vi.mocked(deleteReports).mockResolvedValue({ eliminados: [2], omitidos: [] })
    const view = renderApp(<ReportPage />, { auth: makeAuth(makeAdmin()) })
    await screen.findByRole('heading', { name: 'REP-1' })
    expect(screen.queryByRole('button', { name: 'Seleccionar' })).not.toBeInTheDocument()
    await view.user.click(screen.getByRole('button', { name: /Rechazado \(1\)/ }))
    await view.user.click(screen.getByRole('button', { name: 'Seleccionar' }))
    await view.user.click(screen.getByRole('checkbox', { name: 'Seleccionar REP-2' }))
    await view.user.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await view.user.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    expect(deleteReports).toHaveBeenCalledWith([2])
  })

  it('un alimentador no ve el botón Seleccionar', async () => {
    vi.mocked(getReports).mockResolvedValue(reports)
    const view = renderApp(<ReportPage />, { auth: makeAuth(makeStaff('reports.view')) })
    await screen.findByRole('heading', { name: 'REP-1' })
    await view.user.click(screen.getByRole('button', { name: /Rechazado \(1\)/ }))
    expect(screen.queryByRole('button', { name: 'Seleccionar' })).not.toBeInTheDocument()
  })
})

describe('ReportDetail (página)', () => {
  const renderDetail = (id: string, auth = makeAuth(makeAdmin())) =>
    renderApp(
      <Routes>
        <Route path="/reports/:id" element={<ReportDetailPage />} />
        <Route path="*" element={<p>otra</p>} />
      </Routes>,
      { auth, route: `/reports/${id}` },
    )

  it('muestra el reporte con su estatus y riesgo', async () => {
    vi.mocked(getReport).mockResolvedValue(makeReport({ id_caso: 4 }))
    renderDetail('1')
    expect(await screen.findByRole('heading', { name: 'REP-2026-0001' })).toBeInTheDocument()
    expect(screen.getByText('Riesgo medio')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver caso #4 →' })).toBeInTheDocument()
  })

  it('Ver caso y Volver navegan a su ruta', async () => {
    vi.mocked(getReport).mockResolvedValue(makeReport({ id_caso: 4 }))
    const view = renderDetail('1')
    await view.user.click(await screen.findByRole('button', { name: 'Ver caso #4 →' }))
    expect(view.path()).toBe('/cases/4')
  })

  it('Volver lleva a la lista de reportes', async () => {
    vi.mocked(getReport).mockResolvedValue(makeReport())
    const view = renderDetail('1')
    await view.user.click(await screen.findByRole('button', { name: '← Volver' }))
    expect(view.path()).toBe('/reports')
  })

  it('aceptar el reporte desde su página lleva al caso nuevo', async () => {
    const { acceptReport } = await import('@/lib/api/reports')
    vi.mocked(acceptReport).mockResolvedValue({ id_caso: 11, id_reporte: 1, estatus_seguimiento: 'Canalizado' })
    vi.mocked(getReport).mockResolvedValue(makeReport())
    const view = renderDetail('1')
    await view.user.click(await screen.findByRole('button', { name: 'Aceptar y crear caso' }))
    await waitFor(() => expect(view.path()).toBe('/cases/11'))
  })

  it('un reporte sin caso no ofrece Ver caso y un alimentador sin cases.view tampoco', async () => {
    vi.mocked(getReport).mockResolvedValue(makeReport({ id_caso: 4 }))
    renderDetail('1', makeAuth(makeStaff('reports.view_detail')))
    await screen.findByRole('heading', { name: 'REP-2026-0001' })
    expect(screen.queryByRole('button', { name: /Ver caso/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '← Volver' })).not.toBeInTheDocument()
  })

  it('un id que no es número muestra "Reporte no encontrado"', async () => {
    renderDetail('abc')
    expect(await screen.findByRole('heading', { name: 'Reporte no encontrado' })).toBeInTheDocument()
    expect(getReport).not.toHaveBeenCalled()
  })

  it('un 404 muestra no encontrado y un 403 sin permiso', async () => {
    vi.mocked(getReport).mockRejectedValueOnce(new ApiError(404, 'x'))
    const { unmount } = renderDetail('9')
    expect(await screen.findByRole('heading', { name: 'Reporte no encontrado' })).toBeInTheDocument()
    unmount()
    vi.mocked(getReport).mockRejectedValueOnce(new ApiError(403, 'x'))
    renderDetail('9')
    expect(await screen.findByText('No tienes permiso para ver esta información')).toBeInTheDocument()
  })

  it('un fallo de red muestra el error con reintento', async () => {
    vi.mocked(getReport).mockRejectedValueOnce(new TypeError('red')).mockResolvedValueOnce(makeReport())
    const view = renderDetail('1')
    await view.user.click(await screen.findByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'REP-2026-0001' })).toBeInTheDocument()
  })
})

describe('Cases (página)', () => {
  const cases = [makeCase({ id_caso: 1, estado: 'Abierto' }), makeCase({ id_caso: 2, estado: 'Cerrado', fecha_caso: '2026-03-04T10:00:00' })]

  it('lista los casos con filtros y abre uno', async () => {
    vi.mocked(getCases).mockResolvedValue(cases)
    const view = renderApp(<CasesPage />, { auth: makeAuth(makeAdmin()) })
    expect(await screen.findByRole('heading', { name: 'Caso #1' })).toBeInTheDocument()
    await view.user.click(screen.getAllByRole('button', { name: 'Ver caso →' })[0])
    expect(view.path()).toBe('/cases/2')
  })

  it('filtra por estado', async () => {
    vi.mocked(getCases).mockResolvedValue(cases)
    const view = renderApp(<CasesPage />, { auth: makeAuth(makeAdmin()) })
    await screen.findByRole('heading', { name: 'Caso #1' })
    await view.user.click(screen.getByRole('button', { name: /Cerrado/ }))
    expect(screen.queryByRole('heading', { name: 'Caso #1' })).not.toBeInTheDocument()
  })

  it('un 403, y un fallo con reintento', async () => {
    vi.mocked(getCases).mockRejectedValueOnce(new ApiError(403, 'x'))
    const { unmount } = renderApp(<CasesPage />, { auth: makeAuth(makeStaff('cases.view')) })
    expect(await screen.findByText('No tienes permiso para ver esta información')).toBeInTheDocument()
    unmount()
    vi.mocked(getCases).mockRejectedValueOnce(new TypeError('red')).mockResolvedValueOnce(cases)
    const view = renderApp(<CasesPage />, { auth: makeAuth(makeAdmin()) })
    await view.user.click(await screen.findByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'Caso #1' })).toBeInTheDocument()
  })

  it('el administrador viendo Cerrado puede borrar casos', async () => {
    vi.mocked(getCases).mockResolvedValue(cases)
    vi.mocked(deleteCases).mockResolvedValue({ eliminados: [2], omitidos: [] })
    const view = renderApp(<CasesPage />, { auth: makeAuth(makeAdmin()) })
    await screen.findByRole('heading', { name: 'Caso #1' })
    await view.user.click(screen.getByRole('button', { name: /Cerrado/ }))
    await view.user.click(screen.getByRole('button', { name: 'Seleccionar' }))
    await view.user.click(screen.getByRole('checkbox', { name: 'Seleccionar caso 2' }))
    await view.user.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await view.user.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    expect(deleteCases).toHaveBeenCalledWith([2])
  })
})

describe('CaseDetail (página)', () => {
  const renderDetail = (id: string, auth = makeAuth(makeAdmin())) =>
    renderApp(
      <Routes>
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="*" element={<p>otra</p>} />
      </Routes>,
      { auth, route: `/cases/${id}` },
    )

  it('muestra el caso con sus reportes y tarjetas', async () => {
    vi.mocked(getCase).mockResolvedValue(makeCase({ id_caso: 3 }))
    vi.mocked(getReports).mockResolvedValue([makeReport({ id_caso: 3 })])
    renderDetail('3')
    expect(await screen.findByRole('heading', { name: 'CASO-2026-0003' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reportes del caso' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'REP-2026-0001' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar nota' })).toBeInTheDocument()
  })

  it('sin reportes lo dice y sin cases.edit no hay tarjeta de nota', async () => {
    vi.mocked(getCase).mockResolvedValue(makeCase({ id_caso: 3 }))
    vi.mocked(getReports).mockResolvedValue([])
    renderDetail('3', makeAuth(makeStaff('cases.view')))
    expect(await screen.findByText('Sin reportes asociados.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar nota' })).not.toBeInTheDocument()
  })

  it('un id no numérico, 404 y 403', async () => {
    const { unmount } = renderDetail('abc')
    expect(await screen.findByRole('heading', { name: 'Caso no encontrado' })).toBeInTheDocument()
    unmount()
    vi.mocked(getCase).mockRejectedValueOnce(new ApiError(404, 'x'))
    vi.mocked(getReports).mockResolvedValue([])
    const second = renderDetail('9')
    expect(await screen.findByRole('heading', { name: 'Caso no encontrado' })).toBeInTheDocument()
    second.unmount()
    vi.mocked(getCase).mockRejectedValueOnce(new ApiError(403, 'x'))
    renderDetail('9')
    expect(await screen.findByText('No tienes permiso para ver esta información')).toBeInTheDocument()
  })

  it('cambiar el estado desde el encabezado actualiza el caso y recarga', async () => {
    vi.mocked(getCase).mockResolvedValue(makeCase({ id_caso: 3 }))
    vi.mocked(getReports).mockResolvedValue([])
    vi.mocked(updateCase).mockResolvedValue(makeCase())
    const view = renderDetail('3')
    await screen.findByRole('heading', { name: 'CASO-2026-0003' })
    await view.user.click(screen.getByRole('button', { name: 'En desarrollo' }))
    expect(updateCase).toHaveBeenCalledWith(3, { estado: 'En desarrollo' })
    await waitFor(() => expect(getCase).toHaveBeenCalledTimes(2))
  })
})

describe('Logs (página)', () => {
  it('muestra la tabla y abre el detalle de una fila', async () => {
    vi.mocked(getLogs).mockResolvedValue([makeLog()])
    const view = renderApp(<LogsPage />, { auth: makeAuth(makeAdmin()) })
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument()
    await view.user.click(screen.getByRole('button', { name: 'Ver detalle' }))
    expect(screen.getByRole('region', { name: 'Antes' })).toBeInTheDocument()
  })

  it('sin logs avisa, con error avisa y con 403 muestra sin permiso', async () => {
    vi.mocked(getLogs).mockResolvedValueOnce([])
    const first = renderApp(<LogsPage />, { auth: makeAuth(makeAdmin()) })
    expect(await screen.findByText('No hay logs que coincidan con el filtro o la búsqueda.')).toBeInTheDocument()
    first.unmount()
    vi.mocked(getLogs).mockRejectedValueOnce(new TypeError('red'))
    const second = renderApp(<LogsPage />, { auth: makeAuth(makeAdmin()) })
    expect(await screen.findByText('No se pudieron cargar los logs. Intenta de nuevo más tarde.')).toBeInTheDocument()
    second.unmount()
    vi.mocked(getLogs).mockRejectedValueOnce(new ApiError(403, 'x'))
    renderApp(<LogsPage />, { auth: makeAuth(makeAdmin()) })
    expect(await screen.findByText('No tienes permiso para ver esta información')).toBeInTheDocument()
  })

  it('el filtro por tipo pide de nuevo a la API', async () => {
    vi.mocked(getLogs).mockResolvedValue([])
    const view = renderApp(<LogsPage />, { auth: makeAuth(makeAdmin()) })
    await screen.findByText(/No hay logs/)
    await view.user.click(screen.getByRole('button', { name: 'Caso' }))
    await waitFor(() => expect(getLogs).toHaveBeenLastCalledWith(expect.objectContaining({ entity_type: 'caso' })))
    expect(screen.getByRole('button', { name: 'Caso' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('con 100 logs ofrece Cargar más', async () => {
    vi.mocked(getLogs).mockResolvedValueOnce(Array.from({ length: 100 }, (_, i) => makeLog({ id_logs: i + 1 }))).mockResolvedValueOnce([makeLog({ id_logs: 101, usuario: 'Último' })])
    const view = renderApp(<LogsPage />, { auth: makeAuth(makeAdmin()) })
    await view.user.click(await screen.findByRole('button', { name: 'Cargar más' }))
    expect(await screen.findByText('Último')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cargar más' })).not.toBeInTheDocument()
  })
})

describe('Users (página)', () => {
  const users = [makeStoredUser({ id_usuario: 1, nombre: 'Ana', apellido: 'Ruiz', rol: 'Administrador', permisos: [] }), makeStoredUser({ id_usuario: 2, nombre: 'Luis', apellido: 'Gómez' })]

  it('lista usuarios, busca y filtra por rol', async () => {
    vi.mocked(getUsers).mockResolvedValue(users)
    const view = renderApp(<UsersPage />, { auth: makeAuth(makeAdmin()) })
    expect(await screen.findByText('Ana Ruiz')).toBeInTheDocument()
    await view.user.selectOptions(screen.getByRole('combobox', { name: 'Filtrar por rol' }), 'Alimentador')
    expect(screen.queryByText('Ana Ruiz')).not.toBeInTheDocument()
    await view.user.type(screen.getByRole('searchbox', { name: 'Buscar usuarios' }), 'zzz')
    expect(screen.getByText('No hay usuarios que coincidan con la búsqueda.')).toBeInTheDocument()
  })

  it('si la carga falla lo dice', async () => {
    vi.mocked(getUsers).mockRejectedValue(new TypeError('red'))
    renderApp(<UsersPage />, { auth: makeAuth(makeAdmin()) })
    expect(await screen.findByText('No se pudieron cargar los usuarios. Intenta de nuevo más tarde.')).toBeInTheDocument()
  })

  it('abrir un usuario muestra su popup y eliminarlo pide confirmación', async () => {
    vi.mocked(getUsers).mockResolvedValue(users)
    vi.mocked(getUser).mockResolvedValue(users[1])
    vi.mocked(deleteUser).mockResolvedValue(undefined)
    const view = renderApp(<UsersPage />, { auth: makeAuth(makeAdmin()) })
    await view.user.click(await screen.findByText('Luis Gómez'))
    const dialog = await screen.findByRole('dialog')
    await view.user.click(within(dialog).getByRole('button', { name: 'Eliminar usuario' }))
    await view.user.click(within(dialog).getByRole('button', { name: 'Confirmar' }))
    expect(deleteUser).toHaveBeenCalledWith(2)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.queryByText('Luis Gómez')).not.toBeInTheDocument()
  })

  it('Dar de alta abre el formulario de registro', async () => {
    vi.mocked(getUsers).mockResolvedValue(users)
    const view = renderApp(<UsersPage />, { auth: makeAuth(makeAdmin()) })
    await view.user.click(await screen.findByRole('button', { name: '+ Dar de alta' }))
    expect(await screen.findByRole('dialog', { name: 'Dar de alta usuario' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrar usuario' })).toBeDisabled()
  })
})

describe('Home (página)', () => {
  it('muestra los indicadores, y el mapa solo con map.view', async () => {
    vi.mocked(getReports).mockResolvedValue([makeReport()])
    vi.mocked(getCases).mockResolvedValue([makeCase()])
    renderApp(<HomePage />, { auth: makeAuth(makeStaff('stats.view')) })
    expect(await screen.findByText('Casos')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Map' })).not.toBeInTheDocument()
  })

  it('con map.view muestra la vista previa del mapa y el botón para ir al mapa', async () => {
    vi.mocked(getReports).mockResolvedValue([makeReport()])
    vi.mocked(getCases).mockResolvedValue([])
    const view = renderApp(<HomePage />, { auth: makeAuth(makeAdmin()) })
    await view.user.click(await screen.findByRole('button', { name: 'Ir al mapa' }))
    expect(view.path()).toBe('/map')
  })

  it('un 403 muestra la tarjeta de sin permiso', async () => {
    vi.mocked(getReports).mockRejectedValue(new ApiError(403, 'x'))
    vi.mocked(getCases).mockResolvedValue([])
    renderApp(<HomePage />, { auth: makeAuth(makeStaff('stats.view')) })
    expect(await screen.findByText('No tienes permiso para ver esta información')).toBeInTheDocument()
  })
})

describe('HeatMapPage', () => {
  it('muestra el mapa, los filtros y, al seleccionar nada, ninguna tarjeta', async () => {
    vi.mocked(getReports).mockResolvedValue([makeReport()])
    vi.mocked(getCases).mockResolvedValue([makeCase()])
    renderApp(<HeatMapPage />, { auth: makeAuth(makeAdmin()) })
    expect(await screen.findByTestId('map')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Filtros' })).toBeInTheDocument()
  })

  it('un 403 oculta los filtros y muestra sin permiso', async () => {
    vi.mocked(getReports).mockRejectedValue(new ApiError(403, 'x'))
    vi.mocked(getCases).mockResolvedValue([])
    renderApp(<HeatMapPage />, { auth: makeAuth(makeStaff('map.view')) })
    expect(await screen.findByText('No tienes permiso para ver esta información')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Filtros' })).not.toBeInTheDocument()
  })

  it('mientras carga muestra Cargando', () => {
    vi.mocked(getReports).mockReturnValue(new Promise(() => undefined))
    vi.mocked(getCases).mockReturnValue(new Promise(() => undefined))
    renderApp(<HeatMapPage />, { auth: makeAuth(makeAdmin()) })
    expect(screen.getByText('Cargando')).toBeInTheDocument()
  })
})
