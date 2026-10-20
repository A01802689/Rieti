import { describe, expect, it, vi } from 'vitest'
import { login, logout, getMe } from '@/lib/api/auth'
import { getLoginIndicators } from '@/lib/api/indicators'
import { changePermissions, createUser, deleteUser, getUser, getUsers } from '@/lib/api/users'
import { addNote2Case, deleteCases, getCase, getCases, transferCase, updateCase } from '@/lib/api/cases'
import {
  acceptReport,
  changeReportState,
  declineReport,
  deleteReports,
  fuseReport,
  getReport,
  getReportImage,
  getReports,
  reopenReport,
  unlinkReport,
} from '@/lib/api/reports'
import { getLogs } from '@/lib/api/logs'
import { getMunicipios } from '@/lib/api/municipios'
import { requestRecovery, resetWithCode, resetWithLink } from '@/lib/api/recovery'
import type { UserCreate } from '@/lib/types/User'
import { callOf, jsonResponse, stubFetch } from '../../helpers/fetch'
import { makeCase, makeReport } from '../../helpers/fixtures'

const send = async (call: () => Promise<unknown>, body: unknown = {}) => {
  const fetchMock = stubFetch(jsonResponse(body))
  await call()
  return callOf(fetchMock)
}

describe('auth', () => {
  it('login manda POST con correo y contraseña', async () => {
    const { url, init, body } = await send(() => login('a@b.mx', 'Secreta1!'))
    expect(url).toBe('http://api.test/usuarios/login')
    expect(init.method).toBe('POST')
    expect(JSON.parse(body!)).toEqual({ correo: 'a@b.mx', contrasena: 'Secreta1!' })
  })

  it('logout manda POST sin cuerpo', async () => {
    const { url, init, body } = await send(() => logout())
    expect(url).toBe('http://api.test/usuarios/logout')
    expect(init.method).toBe('POST')
    expect(body).toBeUndefined()
  })

  it('getMe pide GET /usuarios/me', async () => {
    const { url, init } = await send(() => getMe())
    expect(url).toBe('http://api.test/usuarios/me')
    expect(init.method).toBeUndefined()
  })
})

describe('indicadores y municipios', () => {
  it('getLoginIndicators pide /indicadores/login', async () => {
    expect((await send(() => getLoginIndicators())).url).toBe('http://api.test/indicadores/login')
  })

  it('getMunicipios pide /municipios', async () => {
    expect((await send(() => getMunicipios())).url).toBe('http://api.test/municipios')
  })
})

describe('users', () => {
  it('getUsers y getUser piden las rutas', async () => {
    expect((await send(() => getUsers(), [])).url).toBe('http://api.test/usuarios')
    expect((await send(() => getUser(7))).url).toBe('http://api.test/usuarios/7')
  })

  it('createUser manda POST con todo el usuario', async () => {
    const user: UserCreate = {
      nombre: 'A',
      apellido: 'B',
      correo: 'a@b.mx',
      contrasena: 'Secreta1!',
      rol: 'Alimentador',
      id_municipio: 2,
      permisos: ['reports.view'],
    }
    const { url, init, body } = await send(() => createUser(user))
    expect(url).toBe('http://api.test/usuarios')
    expect(init.method).toBe('POST')
    expect(JSON.parse(body!)).toEqual(user)
  })

  it('changePermissions manda PUT con permisos', async () => {
    const { url, init, body } = await send(() => changePermissions(4, ['map.view']))
    expect(url).toBe('http://api.test/usuarios/4/permisos')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(body!)).toEqual({ permisos: ['map.view'] })
  })

  it('deleteUser manda DELETE y acepta el 204', async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }))
    await expect(deleteUser(4)).resolves.toBeUndefined()
    expect(callOf(fetchMock).url).toBe('http://api.test/usuarios/4')
    expect(callOf(fetchMock).init.method).toBe('DELETE')
  })
})

describe('reports', () => {
  it('getReportImage pide los enlaces firmados de la foto con GET y devuelve la respuesta tal cual', async () => {
    const links = { url_visualizacion: 'https://s3.test/a.jpg', url_descarga: 'https://s3.test/b.jpg', expira_en: 300 }
    const fetchMock = stubFetch(jsonResponse(links))
    await expect(getReportImage(9)).resolves.toEqual(links)
    const call = callOf(fetchMock)
    expect(call.url).toMatch(/\/reportes\/9\/imagen$/)
    expect(call.init.method ?? 'GET').toBe('GET')
  })

  it('getReports pide la lista y convierte cantidad_nna', async () => {
    const sent = [
      { ...makeReport({ id_reporte: 1 }), cantidad_nna: '3' },
      { ...makeReport({ id_reporte: 2 }), cantidad_nna: '5 o más' },
      { ...makeReport({ id_reporte: 3 }), cantidad_nna: 'basura' },
    ]
    const fetchMock = stubFetch(jsonResponse(sent))
    const reports = await getReports()
    expect(callOf(fetchMock).url).toBe('http://api.test/reportes')
    expect(callOf(fetchMock).init.method).toBe('GET')
    expect(reports.map((r) => r.cantidad_nna)).toEqual([3, '5 o más', 'No sé'])
  })

  it('getReports con id de caso lo manda en la consulta, también con 0', async () => {
    const fetchMock = stubFetch(jsonResponse([]))
    await getReports(8)
    await getReports(0)
    expect(callOf(fetchMock, 0).url).toBe('http://api.test/reportes?id_caso=8')
    expect(callOf(fetchMock, 1).url).toBe('http://api.test/reportes?id_caso=0')
  })

  it('getReports registra, pero conserva, los reportes con coordenadas fuera de rango', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const bad = { ...makeReport({ id_reporte: 9 }), cantidad_nna: '1' }
    bad.ubicacion = { ...bad.ubicacion, lat: 500 }
    stubFetch(jsonResponse([bad, { ...makeReport(), cantidad_nna: '1' }]))
    expect(await getReports()).toHaveLength(2)
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('getReport pide el detalle, convierte cantidad_nna y registra coordenadas inválidas', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const bad = { ...makeReport({ id_reporte: 4 }), cantidad_nna: '2' }
    bad.ubicacion = { ...bad.ubicacion, lng: 999 }
    const fetchMock = stubFetch(jsonResponse(bad))
    const report = await getReport(4)
    expect(callOf(fetchMock).url).toBe('http://api.test/reportes/4')
    expect(report.cantidad_nna).toBe(2)
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('las acciones usan su ruta y método', async () => {
    const cases: [() => Promise<unknown>, string, string][] = [
      [() => acceptReport(1), '/reportes/1/abrir-caso', 'POST'],
      [() => declineReport(1), '/reportes/1/rechazar', 'POST'],
      [() => reopenReport(1), '/reportes/1/reabrir', 'POST'],
      [() => unlinkReport(1), '/reportes/1/desvincular', 'POST'],
    ]
    for (const [call, path, method] of cases) {
      const { url, init, body } = await send(call)
      expect(url).toBe(`http://api.test${path}`)
      expect(init.method).toBe(method)
      expect(body).toBeUndefined()
    }
  })

  it('fuseReport manda PUT con el id del caso', async () => {
    const { url, init, body } = await send(() => fuseReport(1, 9))
    expect(url).toBe('http://api.test/reportes/1/caso')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(body!)).toEqual({ id_caso: 9 })
  })

  it('changeReportState manda PATCH con el estatus', async () => {
    const { url, init, body } = await send(() => changeReportState(1, 'Concluido'))
    expect(url).toBe('http://api.test/reportes/1/estatus')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(body!)).toEqual({ estatus_seguimiento: 'Concluido' })
  })

  it('deleteReports manda DELETE con los ids', async () => {
    const { url, init, body } = await send(() => deleteReports([1, 2]))
    expect(url).toBe('http://api.test/reportes')
    expect(init.method).toBe('DELETE')
    expect(JSON.parse(body!)).toEqual({ ids: [1, 2] })
  })
})

describe('cases', () => {
  it('updateCase manda PATCH con los campos', async () => {
    const { url, init, body } = await send(() => updateCase(3, { estado: 'Cerrado', ubicacion: { lat: 1, lng: 2 } }))
    expect(url).toBe('http://api.test/casos/3')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(body!)).toEqual({ estado: 'Cerrado', ubicacion: { lat: 1, lng: 2 } })
  })

  it('getCases pide la lista y registra, pero conserva, las coordenadas inválidas', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const bad = makeCase({ id_caso: 2 })
    bad.ubicacion = { ...bad.ubicacion, lat: -100 }
    const fetchMock = stubFetch(jsonResponse([makeCase(), bad]))
    expect(await getCases()).toHaveLength(2)
    expect(callOf(fetchMock).url).toBe('http://api.test/casos')
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('getCases propaga el error en lugar de devolver una lista vacía', async () => {
    stubFetch(jsonResponse({ detail: 'caído' }, { status: 500 }))
    await expect(getCases()).rejects.toMatchObject({ status: 500, message: 'caído' })
  })

  it('getCase pide el detalle y registra coordenadas inválidas', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const bad = makeCase()
    bad.ubicacion = { ...bad.ubicacion, lng: 400 }
    const fetchMock = stubFetch(jsonResponse(bad))
    await getCase(3)
    expect(callOf(fetchMock).url).toBe('http://api.test/casos/3')
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('un caso sin coordenadas no se registra como error', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const empty = makeCase()
    empty.ubicacion = { ...empty.ubicacion, lat: null, lng: null }
    stubFetch(jsonResponse(empty))
    await getCase(3)
    expect(error).not.toHaveBeenCalled()
  })

  it('transferCase manda PUT con el municipio', async () => {
    const { url, init, body } = await send(() => transferCase(3, 5))
    expect(url).toBe('http://api.test/casos/3/transferir')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(body!)).toEqual({ id_municipio: 5 })
  })

  it('addNote2Case manda POST con la nota y el tipo Nota', async () => {
    const { url, init, body } = await send(() => addNote2Case(3, 'Visita'))
    expect(url).toBe('http://api.test/casos/3/seguimientos')
    expect(init.method).toBe('POST')
    expect(JSON.parse(body!)).toEqual({ nota: 'Visita', tipo: 'Nota' })
  })

  it('deleteCases manda DELETE con los ids', async () => {
    const { url, init, body } = await send(() => deleteCases([3, 4]))
    expect(url).toBe('http://api.test/casos')
    expect(init.method).toBe('DELETE')
    expect(JSON.parse(body!)).toEqual({ ids: [3, 4] })
  })
})

describe('logs', () => {
  it('sin consulta pide /logs a secas', async () => {
    expect((await send(() => getLogs(), [])).url).toBe('http://api.test/logs')
    expect((await send(() => getLogs({}), [])).url).toBe('http://api.test/logs')
  })

  it('arma la consulta con todos los campos', async () => {
    const { url } = await send(() => getLogs({ entity_type: 'caso', buscar: 'ana pérez', limite: 100, desplazamiento: 200 }), [])
    const params = new URL(url).searchParams
    expect(Object.fromEntries(params)).toEqual({ entity_type: 'caso', buscar: 'ana pérez', limite: '100', desplazamiento: '200' })
  })

  it('omite los campos vacíos pero conserva el 0', async () => {
    const { url } = await send(() => getLogs({ entity_type: undefined, buscar: '', limite: 0, desplazamiento: 0 }), [])
    expect(Object.fromEntries(new URL(url).searchParams)).toEqual({ limite: '0', desplazamiento: '0' })
  })
})

describe('recovery', () => {
  it('requestRecovery manda POST con los datos', async () => {
    const { url, init, body } = await send(() => requestRecovery({ email: 'a@b.mx', method: 'code' }))
    expect(url).toBe('http://api.test/password-recovery/request')
    expect(init.method).toBe('POST')
    expect(JSON.parse(body!)).toEqual({ email: 'a@b.mx', method: 'code' })
  })

  it('resetWithCode y resetWithLink usan su ruta', async () => {
    expect((await send(() => resetWithCode({ email: 'a@b.mx', code: '123456', new_password: 'x' }))).url).toBe(
      'http://api.test/password-recovery/reset/code',
    )
    expect((await send(() => resetWithLink({ token: 't', new_password: 'x' }))).url).toBe(
      'http://api.test/password-recovery/reset/link',
    )
  })
})
