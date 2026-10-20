import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, isForbidden, setForbiddenHandler, setUnauthorizedHandler } from '@/lib/api/client'
import { callOf, jsonResponse, stubFetch, textResponse } from '../../helpers/fetch'

afterEach(() => {
  setUnauthorizedHandler(undefined)
  setForbiddenHandler(undefined)
})

const messageOf = async (response: Response) => {
  stubFetch(response)
  return (await api('/x').catch((e: unknown) => e)) as ApiError
}

describe('api: petición', () => {
  it('pide a VITE_API_URL más la ruta, con la cookie de sesión', async () => {
    const fetchMock = stubFetch(jsonResponse({ ok: true }))
    await api('/usuarios/me')
    const { url, init } = callOf(fetchMock)
    expect(url).toBe('http://api.test/usuarios/me')
    expect(init.credentials).toBe('include')
  })

  it('devuelve el JSON de la respuesta', async () => {
    stubFetch(jsonResponse({ a: 1 }))
    await expect(api('/x')).resolves.toEqual({ a: 1 })
  })

  it('no agrega Authorization ni Content-Type en un GET', async () => {
    const fetchMock = stubFetch(jsonResponse({}))
    await api('/x')
    const { init } = callOf(fetchMock)
    expect(init.headers).toBeUndefined()
  })

  it('agrega Content-Type solo cuando hay cuerpo', async () => {
    const fetchMock = stubFetch(jsonResponse({}))
    await api('/x', { method: 'POST', body: '{"a":1}' })
    const { headers, init } = callOf(fetchMock)
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers.Authorization).toBeUndefined()
    expect(init.method).toBe('POST')
  })

  it('respeta las cabeceras que pasa quien llama y le deja cambiar el Content-Type', async () => {
    const fetchMock = stubFetch(jsonResponse({}))
    await api('/x', { method: 'POST', body: 'x', headers: { 'X-Test': '1', 'Content-Type': 'text/plain' } })
    const { headers } = callOf(fetchMock)
    expect(headers).toEqual({ 'Content-Type': 'text/plain', 'X-Test': '1' })
  })

  it('un cuerpo vacío no activa la cabecera JSON', async () => {
    const fetchMock = stubFetch(jsonResponse({}))
    await api('/x', { method: 'POST', body: '' })
    expect(callOf(fetchMock).init.headers).toBeUndefined()
  })

  it('la cookie no se puede apagar desde init', async () => {
    const fetchMock = stubFetch(jsonResponse({}))
    await api('/x', { credentials: 'omit' })
    expect(callOf(fetchMock).init.credentials).toBe('include')
  })

  it('responde undefined ante un 204', async () => {
    stubFetch(new Response(null, { status: 204 }))
    await expect(api('/x', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('propaga el fallo de red sin convertirlo en ApiError', async () => {
    stubFetch(new TypeError('Failed to fetch'))
    const error = await api('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(TypeError)
    expect(error).not.toBeInstanceOf(ApiError)
  })

  it('falla si una respuesta ok no trae JSON', async () => {
    stubFetch(textResponse('<html>', { status: 200 }))
    await expect(api('/x')).rejects.toThrow()
  })
})

describe('api: errores', () => {
  it('usa el detail de texto', async () => {
    const error = await messageOf(jsonResponse({ detail: 'Credenciales inválidas' }, { status: 400 }))
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.message).toBe('Credenciales inválidas')
  })

  it('une los msg de un 422 y quita el prefijo "Value error, "', async () => {
    const detail = [
      { msg: 'Value error, La contraseña es débil', loc: ['body', 'contrasena'] },
      { msg: 'Field required', loc: ['body', 'nombre'] },
    ]
    const error = await messageOf(jsonResponse({ detail }, { status: 422 }))
    expect(error.message).toBe('La contraseña es débil. Field required')
  })

  it('solo quita el prefijo al principio del mensaje', async () => {
    const error = await messageOf(jsonResponse({ detail: [{ msg: 'Dato: Value error, raro' }] }, { status: 422 }))
    expect(error.message).toBe('Dato: Value error, raro')
  })

  it('ignora los elementos del arreglo sin msg de texto', async () => {
    const detail = [{ msg: 5 }, null, { loc: [] }, { msg: 'Bueno' }, { msg: '' }]
    const error = await messageOf(jsonResponse({ detail }, { status: 422 }))
    expect(error.message).toBe('Bueno')
  })

  it('usa el statusText si el arreglo de errores está vacío', async () => {
    const error = await messageOf(jsonResponse({ detail: [] }, { status: 422, statusText: 'Unprocessable Entity' }))
    expect(error.message).toBe('Unprocessable Entity')
  })

  it('usa el statusText si ningún elemento del arreglo tiene mensaje', async () => {
    const error = await messageOf(jsonResponse({ detail: [{}, {}] }, { status: 422, statusText: 'Unprocessable' }))
    expect(error.message).toBe('Unprocessable')
  })

  it('usa el statusText si el detail es null, un número o un objeto', async () => {
    for (const detail of [null, 5, { a: 1 }]) {
      const error = await messageOf(jsonResponse({ detail }, { status: 500, statusText: 'Server Error' }))
      expect(error.message).toBe('Server Error')
    }
  })

  it('usa el statusText si el cuerpo no es JSON', async () => {
    const error = await messageOf(textResponse('boom', { status: 502, statusText: 'Bad Gateway' }))
    expect(error.message).toBe('Bad Gateway')
  })

  it('usa el statusText si el cuerpo es null', async () => {
    const error = await messageOf(jsonResponse(null, { status: 500, statusText: 'Server Error' }))
    expect(error.message).toBe('Server Error')
  })

  it('el mensaje queda vacío cuando no hay detail ni statusText', async () => {
    const error = await messageOf(textResponse('', { status: 500 }))
    expect(error.message).toBe('')
  })
})

describe('api: manejadores', () => {
  it('un 401 llama al manejador de sesión vencida', async () => {
    const onUnauthorized = vi.fn()
    const onForbidden = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    setForbiddenHandler(onForbidden)
    stubFetch(jsonResponse({ detail: 'x' }, { status: 401 }))
    await expect(api('/x')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(onForbidden).not.toHaveBeenCalled()
  })

  it('un 403 llama al manejador de permisos', async () => {
    const onUnauthorized = vi.fn()
    const onForbidden = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    setForbiddenHandler(onForbidden)
    stubFetch(jsonResponse({ detail: 'x' }, { status: 403 }))
    await expect(api('/x')).rejects.toMatchObject({ status: 403 })
    expect(onForbidden).toHaveBeenCalledTimes(1)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it.each([400, 404, 409, 422, 500])('un %i no llama a ningún manejador', async (status) => {
    const onUnauthorized = vi.fn()
    const onForbidden = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    setForbiddenHandler(onForbidden)
    stubFetch(jsonResponse({ detail: 'x' }, { status }))
    await expect(api('/x')).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).not.toHaveBeenCalled()
    expect(onForbidden).not.toHaveBeenCalled()
  })

  it('el manejador se llama antes de lanzar el error', async () => {
    const order: string[] = []
    setUnauthorizedHandler(() => order.push('handler'))
    stubFetch(jsonResponse({}, { status: 401 }))
    await api('/x').catch(() => order.push('catch'))
    expect(order).toEqual(['handler', 'catch'])
  })

  it('sin manejadores un 401 y un 403 solo lanzan el error', async () => {
    stubFetch(jsonResponse({}, { status: 401 }), jsonResponse({}, { status: 403 }))
    await expect(api('/x')).rejects.toMatchObject({ status: 401 })
    await expect(api('/x')).rejects.toMatchObject({ status: 403 })
  })

  it('un manejador pasado como undefined se quita', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    setUnauthorizedHandler(undefined)
    stubFetch(jsonResponse({}, { status: 401 }))
    await api('/x').catch(() => undefined)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})

describe('ApiError e isForbidden', () => {
  it('guarda el estatus y el mensaje', () => {
    const error = new ApiError(409, 'Ya existe')
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(409)
    expect(error.message).toBe('Ya existe')
  })

  it('isForbidden solo es verdadero para un ApiError 403', () => {
    expect(isForbidden(new ApiError(403, 'x'))).toBe(true)
    expect(isForbidden(new ApiError(401, 'x'))).toBe(false)
    expect(isForbidden(new Error('403'))).toBe(false)
    expect(isForbidden({ status: 403 })).toBe(false)
    expect(isForbidden(null)).toBe(false)
    expect(isForbidden(undefined)).toBe(false)
  })
})
