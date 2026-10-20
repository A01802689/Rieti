import { describe, expect, it, vi } from 'vitest'
import { formatAddress, hasValidLocation, logInvalidLocation, MAX_LAT, MAX_LNG } from '@/lib/utilities/location'

describe('hasValidLocation', () => {
  it.each([
    ['dentro de rango', { lat: 19.57, lng: -99.25 }],
    ['en 0,0', { lat: 0, lng: 0 }],
    ['en el límite exacto positivo', { lat: 90, lng: 180 }],
    ['en el límite exacto negativo', { lat: -90, lng: -180 }],
  ])('acepta una ubicación %s', (_name, place) => {
    expect(hasValidLocation(place)).toBe(true)
  })

  it.each([
    ['latitud pasada', { lat: 90.0001, lng: 0 }],
    ['latitud negativa pasada', { lat: -90.0001, lng: 0 }],
    ['longitud pasada', { lat: 0, lng: 180.0001 }],
    ['longitud negativa pasada', { lat: 0, lng: -180.0001 }],
    ['latitud NaN', { lat: NaN, lng: 0 }],
    ['longitud NaN', { lat: 0, lng: NaN }],
    ['latitud Infinity', { lat: Infinity, lng: 0 }],
    ['longitud -Infinity', { lat: 0, lng: -Infinity }],
    ['latitud null', { lat: null, lng: 0 }],
    ['longitud null', { lat: 0, lng: null }],
    ['latitud undefined', { lat: undefined, lng: 0 }],
    ['sin coordenadas', {}],
    ['ambas null', { lat: null, lng: null }],
  ])('rechaza una ubicación con %s', (_name, place) => {
    expect(hasValidLocation(place)).toBe(false)
  })

  it('rechaza coordenadas que llegan como texto', () => {
    expect(hasValidLocation({ lat: '19.5' as unknown as number, lng: -99 })).toBe(false)
  })

  it('conserva el resto de los campos del objeto', () => {
    const place = { lat: 1, lng: 2, calle: 'Reforma' }
    if (hasValidLocation(place)) expect(place.calle).toBe('Reforma')
  })

  it('expone los límites de MapLibre', () => {
    expect(MAX_LAT).toBe(90)
    expect(MAX_LNG).toBe(180)
  })
})

describe('logInvalidLocation', () => {
  it.each([
    ['dentro de rango', { lat: 19, lng: -99 }],
    ['en los límites', { lat: 90, lng: -180 }],
    ['sin coordenadas', { lat: null, lng: null }],
    ['con campos ausentes', {}],
    ['con una coordenada ausente y la otra válida', { lat: 19, lng: null }],
  ])('no registra nada con una ubicación %s', (_name, place) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    logInvalidLocation('Case', 1, place)
    expect(error).not.toHaveBeenCalled()
  })

  it.each([
    ['latitud pasada', { lat: 91, lng: 0 }],
    ['longitud pasada', { lat: 0, lng: -181 }],
    ['NaN', { lat: NaN, lng: 0 }],
    ['Infinity', { lat: 0, lng: Infinity }],
    ['una pasada y la otra ausente', { lat: 100, lng: null }],
  ])('registra un error con %s', (_name, place) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    logInvalidLocation('Report', 7, place)
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('el mensaje dice el tipo, el id y los valores', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    logInvalidLocation('Report', 42, { lat: 200, lng: 5 })
    const message = String(error.mock.calls[0][0])
    expect(message).toContain('Report(s)')
    expect(message).toContain('lat=200, lng=5')
    expect(message).toContain('id "42"')
  })
})

describe('formatAddress', () => {
  it('une calle, colonia y municipio con comas', () => {
    expect(formatAddress({ calle: 'Calle 1', colonia: 'Centro', municipio: 'Atizapán' })).toBe('Calle 1, Centro, Atizapán')
  })

  it('omite las partes ausentes o vacías', () => {
    expect(formatAddress({ calle: null, colonia: 'Centro', municipio: undefined })).toBe('Centro')
    expect(formatAddress({ calle: '', colonia: 'Centro', municipio: 'Atizapán' })).toBe('Centro, Atizapán')
  })

  it('da null cuando no hay ninguna parte', () => {
    expect(formatAddress({})).toBeNull()
    expect(formatAddress({ calle: '', colonia: null, municipio: undefined })).toBeNull()
  })

  it('conserva un texto de solo espacios porque cuenta como dato', () => {
    expect(formatAddress({ calle: ' ' })).toBe(' ')
  })
})
