import { describe, expect, it } from 'vitest'
import { searchPlaces } from '@/lib/api/geocoding'
import { callOf, jsonResponse, stubFetch } from '../../helpers/fetch'

const place = (overrides: Record<string, unknown> = {}) => ({
  place_id: 1,
  lat: '19.57',
  lon: '-99.25',
  display_name: 'Calle Uno, Centro, Atizapán',
  address: { road: 'Calle Uno', suburb: 'Centro' },
  ...overrides,
})

describe('searchPlaces', () => {
  it('pide a Nominatim solo en México, sin cookies y con el referrer recortado', async () => {
    const fetchMock = stubFetch(jsonResponse([]))
    await searchPlaces('reforma 12')
    const { url, init } = callOf(fetchMock)
    const parsed = new URL(url)
    expect(parsed.origin + parsed.pathname).toBe('https://nominatim.openstreetmap.org/search')
    expect(parsed.searchParams.get('q')).toBe('reforma 12')
    expect(parsed.searchParams.get('countrycodes')).toBe('mx')
    expect(parsed.searchParams.get('limit')).toBe('5')
    expect(parsed.searchParams.get('format')).toBe('jsonv2')
    expect(parsed.searchParams.get('addressdetails')).toBe('1')
    expect(init.credentials).toBe('omit')
    expect(init.referrerPolicy).toBe('origin')
  })

  it('codifica el texto buscado', async () => {
    const fetchMock = stubFetch(jsonResponse([]))
    await searchPlaces('a&b=c ñ')
    expect(new URL(callOf(fetchMock).url).searchParams.get('q')).toBe('a&b=c ñ')
  })

  it('pasa la señal para poder cancelar', async () => {
    const fetchMock = stubFetch(jsonResponse([]))
    const controller = new AbortController()
    await searchPlaces('x', controller.signal)
    expect(callOf(fetchMock).init.signal).toBe(controller.signal)
  })

  it('convierte las coordenadas de texto a número y arma el lugar', async () => {
    stubFetch(jsonResponse([place()]))
    await expect(searchPlaces('x')).resolves.toEqual([
      { id: 1, label: 'Calle Uno, Centro, Atizapán', lat: 19.57, lng: -99.25, colonia: 'Centro', calle: 'Calle Uno' },
    ])
  })

  it('elige la colonia por orden: suburb, neighbourhood, city_district, quarter', async () => {
    stubFetch(
      jsonResponse([
        place({ place_id: 1, address: { suburb: 'A', neighbourhood: 'B', city_district: 'C', quarter: 'D' } }),
        place({ place_id: 2, address: { neighbourhood: 'B', city_district: 'C', quarter: 'D' } }),
        place({ place_id: 3, address: { city_district: 'C', quarter: 'D' } }),
        place({ place_id: 4, address: { quarter: 'D' } }),
      ]),
    )
    const colonias = (await searchPlaces('x')).map((p) => p.colonia)
    expect(colonias).toEqual(['A', 'B', 'C', 'D'])
  })

  it('deja colonia y calle vacías cuando no hay dirección', async () => {
    stubFetch(jsonResponse([place({ address: undefined }), place({ place_id: 2, address: {} })]))
    const result = await searchPlaces('x')
    expect(result.map((p) => [p.colonia, p.calle])).toEqual([['', ''], ['', '']])
  })

  it('descarta los lugares con coordenadas inválidas', async () => {
    stubFetch(
      jsonResponse([
        place({ place_id: 1, lat: '95', lon: '0' }),
        place({ place_id: 2, lat: 'abc', lon: '0' }),
        place({ place_id: 3, lat: '0', lon: '181' }),
        place({ place_id: 4, lat: '90', lon: '180' }),
        place({ place_id: 5, lat: '', lon: '' }),
      ]),
    )
    expect((await searchPlaces('x')).map((p) => p.id)).toEqual([4, 5])
  })

  it('devuelve una lista vacía cuando no hay resultados', async () => {
    stubFetch(jsonResponse([]))
    await expect(searchPlaces('x')).resolves.toEqual([])
  })

  it('con 429 explica que hay demasiadas búsquedas', async () => {
    stubFetch(jsonResponse({}, { status: 429 }))
    await expect(searchPlaces('x')).rejects.toThrow('demasiadas búsquedas')
  })

  it('con otro error HTTP muestra el código', async () => {
    stubFetch(jsonResponse({}, { status: 503 }))
    await expect(searchPlaces('x')).rejects.toThrow('código 503')
  })

  it('un fallo de red se convierte en un mensaje para el usuario', async () => {
    stubFetch(new TypeError('Failed to fetch'))
    await expect(searchPlaces('x')).rejects.toThrow('No se pudo conectar con el buscador de lugares')
  })

  it('una búsqueda cancelada relanza el AbortError tal cual', async () => {
    stubFetch(new DOMException('aborted', 'AbortError'))
    const error = await searchPlaces('x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(DOMException)
    expect((error as DOMException).name).toBe('AbortError')
  })

  it('un DOMException que no es AbortError cuenta como fallo de conexión', async () => {
    stubFetch(new DOMException('net', 'NetworkError'))
    await expect(searchPlaces('x')).rejects.toThrow('No se pudo conectar')
  })
})
