import { act, render, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/context/auth'
import { ApiError, setForbiddenHandler, setUnauthorizedHandler } from '@/lib/api/client'
import { jsonResponse, stubFetch } from '../helpers/fetch'
import { makeAdmin, makeStaff, makeUser } from '../helpers/auth'

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

afterEach(() => {
  setUnauthorizedHandler(undefined)
  setForbiddenHandler(undefined)
})

const urlsOf = (mock: ReturnType<typeof stubFetch>) => mock.mock.calls.map(([url]) => String(url).replace('http://api.test', ''))

describe('AuthProvider: restaurar la sesión', () => {
  it('empieza cargando y luego deja al usuario de /usuarios/me', async () => {
    stubFetch(jsonResponse(makeAdmin()))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user?.rol).toBe('Administrador')
    expect(result.current.isAdmin).toBe(true)
  })

  it('sin sesión (401) deja user en null', async () => {
    stubFetch(jsonResponse({ detail: 'No autenticado' }, { status: 401 }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.permissions).toEqual([])
  })

  it('un fallo de red también termina la carga sin usuario', async () => {
    stubFetch(new TypeError('Failed'))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('un ciudadano (rol null) cuenta como sin sesión', async () => {
    stubFetch(jsonResponse(makeUser({ rol: null })))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
  })
})

describe('AuthProvider: permisos y roles', () => {
  it('can, canAny y hasRole siguen al usuario', async () => {
    stubFetch(jsonResponse(makeStaff('reports.view', 'map.view')))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.can('reports.view')).toBe(true)
    expect(result.current.can('cases.view')).toBe(false)
    expect(result.current.canAny('cases.view', 'map.view')).toBe(true)
    expect(result.current.canAny('cases.view', 'stats.view')).toBe(false)
    expect(result.current.canAny()).toBe(false)
    expect(result.current.hasRole('Alimentador')).toBe(true)
    expect(result.current.hasRole('Administrador')).toBe(false)
    expect(result.current.permissions).toEqual(['reports.view', 'map.view'])
  })
})

describe('AuthProvider: login y logout', () => {
  const loadAnonymous = async () => {
    const fetchMock = stubFetch(jsonResponse({ detail: 'x' }, { status: 401 }))
    const hook = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false))
    return { fetchMock, ...hook }
  }

  it('login guarda al usuario y lo devuelve', async () => {
    const { result } = await loadAnonymous()
    stubFetch(jsonResponse(makeStaff('map.view')))
    let me: unknown
    await act(async () => {
      me = await result.current.login('a@b.mx', 'Secreta1!')
    })
    expect(me).toMatchObject({ rol: 'Alimentador' })
    expect(result.current.user?.permisos).toEqual(['map.view'])
  })

  it('login de un ciudadano cierra la sesión del servidor y lanza 403 sin guardar al usuario', async () => {
    const { result } = await loadAnonymous()
    const fetchMock = stubFetch(jsonResponse(makeUser({ rol: null })), jsonResponse({ message: 'ok' }))
    let error: unknown
    await act(async () => {
      error = await result.current.login('a@b.mx', 'x').catch((e: unknown) => e)
    })
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 403, message: 'Esta cuenta no tiene acceso al panel' })
    expect(urlsOf(fetchMock)).toEqual(['/usuarios/login', '/usuarios/logout'])
    expect(result.current.user).toBeNull()
  })

  it('si el logout del ciudadano falla igual lanza el 403', async () => {
    const { result } = await loadAnonymous()
    stubFetch(jsonResponse(makeUser({ rol: null })), new TypeError('red'))
    let error: unknown
    await act(async () => {
      error = await result.current.login('a@b.mx', 'x').catch((e: unknown) => e)
    })
    expect(error).toMatchObject({ status: 403 })
  })

  it('login con credenciales malas relanza el error de la API', async () => {
    const { result } = await loadAnonymous()
    stubFetch(jsonResponse({ detail: 'Credenciales inválidas' }, { status: 401 }))
    let error: unknown
    await act(async () => {
      error = await result.current.login('a@b.mx', 'x').catch((e: unknown) => e)
    })
    expect(error).toMatchObject({ status: 401, message: 'Credenciales inválidas' })
    expect(result.current.user).toBeNull()
  })

  it('logout limpia al usuario', async () => {
    stubFetch(jsonResponse(makeAdmin()), jsonResponse({ message: 'ok' }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).not.toBeNull())
    await act(async () => result.current.logout())
    expect(result.current.user).toBeNull()
  })

  it('logout limpia al usuario aunque la petición falle, y relanza el error', async () => {
    stubFetch(jsonResponse(makeAdmin()), new TypeError('red'))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).not.toBeNull())
    let error: unknown
    await act(async () => {
      error = await result.current.logout().catch((e: unknown) => e)
    })
    expect(error).toBeInstanceOf(TypeError)
    expect(result.current.user).toBeNull()
  })
})

describe('AuthProvider: 401, 403 y refresh', () => {
  it('un 401 de cualquier petición limpia la sesión', async () => {
    const { api } = await import('@/lib/api/client')
    stubFetch(jsonResponse(makeAdmin()))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).not.toBeNull())
    stubFetch(jsonResponse({ detail: 'Sesión vencida' }, { status: 401 }))
    await act(async () => {
      await api('/algo').catch(() => undefined)
    })
    expect(result.current.user).toBeNull()
  })

  it('un 403 de cualquier petición refresca los permisos', async () => {
    const { api } = await import('@/lib/api/client')
    stubFetch(jsonResponse(makeStaff('reports.view')))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.can('reports.view')).toBe(true))
    stubFetch(jsonResponse({ detail: 'Sin permiso' }, { status: 403 }), jsonResponse(makeStaff('map.view')))
    await act(async () => {
      await api('/algo').catch(() => undefined)
    })
    await waitFor(() => expect(result.current.can('map.view')).toBe(true))
    expect(result.current.can('reports.view')).toBe(false)
  })

  it('refresh comparte la petición en curso', async () => {
    stubFetch(jsonResponse(makeStaff('map.view')))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const fetchMock = stubFetch(jsonResponse(makeStaff('map.view')))
    await act(async () => {
      await Promise.all([result.current.refresh(), result.current.refresh(), result.current.refresh()])
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('después de terminar, refresh vuelve a pedir', async () => {
    stubFetch(jsonResponse(makeStaff('map.view')))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const fetchMock = stubFetch(jsonResponse(makeStaff('map.view')))
    await act(async () => result.current.refresh())
    await act(async () => result.current.refresh())
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('refresh con datos iguales conserva el mismo objeto de usuario', async () => {
    stubFetch(jsonResponse(makeStaff('map.view')))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).not.toBeNull())
    const before = result.current.user
    stubFetch(jsonResponse(makeStaff('map.view')))
    await act(async () => result.current.refresh())
    expect(result.current.user).toBe(before)
  })

  it('refresh nunca rechaza aunque falle la red', async () => {
    stubFetch(jsonResponse(makeStaff('map.view')))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    stubFetch(new TypeError('red'))
    await act(async () => {
      await expect(result.current.refresh()).resolves.toBeUndefined()
    })
    expect(result.current.user).not.toBeNull()
  })

  it('refresh que recibe un ciudadano deja al usuario en null', async () => {
    stubFetch(jsonResponse(makeStaff('map.view')))
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).not.toBeNull())
    stubFetch(jsonResponse(makeUser({ rol: null })))
    await act(async () => result.current.refresh())
    expect(result.current.user).toBeNull()
  })

  it('al desmontar quita los manejadores de 401 y 403', async () => {
    stubFetch(jsonResponse(makeAdmin()))
    const { unmount, result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    unmount()
    const fetchMock = stubFetch(jsonResponse({}, { status: 403 }))
    const { api } = await import('@/lib/api/client')
    await api('/x').catch(() => undefined)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('useAuth', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('lanza fuera de un AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth debe usarse dentro de un AuthProvider')
  })

  it('un hijo sencillo puede leer la sesión', async () => {
    stubFetch(jsonResponse(makeAdmin()))
    const Child = () => <p>{useAuth().isLoading ? 'cargando' : 'listo'}</p>
    const { findByText } = render(
      <AuthProvider>
        <Child />
      </AuthProvider>,
    )
    expect(await findByText('listo')).toBeInTheDocument()
  })
})
