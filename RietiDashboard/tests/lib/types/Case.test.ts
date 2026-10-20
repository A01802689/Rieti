import { describe, expect, it } from 'vitest'
import { cases2GeoJSON } from '@/lib/types/Case'
import { MS_DAY } from '@/lib/types/Report'
import { makeCase } from '../../helpers/fixtures'

describe('cases2GeoJSON', () => {
  const now = new Date('2026-03-11T12:00:00Z')

  it('devuelve una colección vacía sin casos', () => {
    expect(cases2GeoJSON([], now)).toEqual({ type: 'FeatureCollection', features: [] })
  })

  it('arma el punto con [lng, lat] y los días transcurridos', () => {
    const { features } = cases2GeoJSON([makeCase()], now)
    expect(features[0].geometry.coordinates).toEqual([-99.25, 19.57])
    expect(features[0].properties).toEqual({
      id: '3',
      status: 'Abierto',
      urgency: 'Alta',
      nna: 2,
      caseDate: '2026-03-01T12:00:00',
      daysElapsed: 10,
    })
  })

  it('salta los casos sin ubicación o con ubicación inválida', () => {
    const base = makeCase().ubicacion
    const cases = [
      makeCase({ id_caso: 1 }),
      makeCase({ id_caso: 2, ubicacion: { ...base, lat: null, lng: null } }),
      makeCase({ id_caso: 3, ubicacion: { ...base, lat: 120 } }),
      makeCase({ id_caso: 4, ubicacion: { ...base, lng: -181 } }),
      makeCase({ id_caso: 5, ubicacion: { ...base, lat: Infinity } }),
    ]
    expect(cases2GeoJSON(cases, now).features.map((f) => f.properties.id)).toEqual(['1'])
  })

  it('cuenta días completos en los bordes', () => {
    const start = new Date('2026-03-01T12:00:00Z').getTime()
    const at = (ms: number) => cases2GeoJSON([makeCase()], new Date(start + ms)).features[0].properties.daysElapsed
    expect(at(0)).toBe(0)
    expect(at(MS_DAY - 1)).toBe(0)
    expect(at(MS_DAY)).toBe(1)
  })

  it('conserva la urgencia null', () => {
    expect(cases2GeoJSON([makeCase({ urgencia: null })], now).features[0].properties.urgency).toBeNull()
  })

  it('usa la fecha actual si no se pasa una', () => {
    const { features } = cases2GeoJSON([makeCase({ fecha_caso: new Date().toISOString() })])
    expect(features[0].properties.daysElapsed).toBe(0)
  })
})
