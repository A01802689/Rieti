import { screen } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { setForbiddenHandler, setUnauthorizedHandler } from '@/lib/api/client'
import { jsonResponse } from '../helpers/fetch'

vi.mock('recharts', () => {
  const Nothing = () => null
  return { ResponsiveContainer: Nothing, BarChart: Nothing, LineChart: Nothing, Bar: Nothing, Line: Nothing, Cell: Nothing, CartesianGrid: Nothing, XAxis: Nothing, YAxis: Nothing, Tooltip: Nothing }
})

beforeEach(() => {
  setUnauthorizedHandler(undefined)
  setForbiddenHandler(undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

/** Answers each route of the API the way a test needs */
function stubApi(routes: Record<string, () => Response>) {
  const mock = vi.fn(async (input: RequestInfo | URL) => {
    const path = String(input).replace('http://api.test', '')
    const answer = routes[path]
    return answer ? answer() : jsonResponse([])
  })
  vi.stubGlobal('fetch', mock)
  return mock
}

const renderAt = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )

const loginTotals = () => jsonResponse({ reportes_registrados: 5, casos_activos: 2, ninos_atendidos: 1 })
const noSession = () => jsonResponse({ detail: 'No autenticado' }, { status: 401 })

describe('App: rutas', () => {
  it('la raíz redirige a /login', async () => {
    stubApi({ '/usuarios/me': noSession, '/indicadores/login': loginTotals })
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(await screen.findByText('5')).toBeInTheDocument()
  })

  it('una ruta protegida sin sesión manda al login', async () => {
    stubApi({ '/usuarios/me': noSession, '/indicadores/login': loginTotals })
    renderAt('/reports')
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('una ruta que no existe muestra la página 404', async () => {
    stubApi({ '/usuarios/me': noSession })
    renderAt('/no-existe')
    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it('la recuperación de contraseña no pide sesión', async () => {
    stubApi({ '/usuarios/me': noSession })
    renderAt('/recovery')
    expect(await screen.findByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument()
  })

  it('un administrador con sesión entra a /users', async () => {
    stubApi({
      '/usuarios/me': () => jsonResponse({ id_usuario: 1, nombre: 'A', apellido: 'B', correo: 'a@b.mx', rol: 'Administrador', id_municipio: 1, permisos: ['stats.view'] }),
      '/usuarios': () => jsonResponse([]),
    })
    renderAt('/users')
    expect(await screen.findByRole('heading', { name: 'Usuarios' })).toBeInTheDocument()
  })

  it('un alimentador sin rol de administrador no entra a /users y va a su página de inicio', async () => {
    stubApi({
      '/usuarios/me': () => jsonResponse({ id_usuario: 2, nombre: 'A', apellido: 'B', correo: 'a@b.mx', rol: 'Alimentador', id_municipio: 1, permisos: ['reports.view'] }),
      '/reportes': () => jsonResponse([]),
    })
    renderAt('/users')
    expect(await screen.findByRole('heading', { name: 'Reportes' })).toBeInTheDocument()
  })

  it('un alimentador sin permisos termina en la página sin acceso', async () => {
    stubApi({ '/usuarios/me': () => jsonResponse({ id_usuario: 2, nombre: 'A', apellido: 'B', correo: 'a@b.mx', rol: 'Alimentador', id_municipio: 1, permisos: [] }) })
    renderAt('/home')
    expect(await screen.findByRole('heading', { name: 'Aún no tienes acceso' })).toBeInTheDocument()
  })

  it('/logs es solo del administrador', async () => {
    stubApi({
      '/usuarios/me': () => jsonResponse({ id_usuario: 2, nombre: 'A', apellido: 'B', correo: 'a@b.mx', rol: 'Alimentador', id_municipio: 1, permisos: ['logs.view', 'map.view'] }),
    })
    renderAt('/logs')
    expect(screen.queryByRole('heading', { name: 'Logs' })).not.toBeInTheDocument()
    expect(await screen.findByTestId('map')).toBeInTheDocument()
  })
})
