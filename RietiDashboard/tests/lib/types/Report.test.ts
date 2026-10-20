import { describe, expect, it } from 'vitest'
import { CANTIDAD_NNA, MS_DAY, parseCantidadNNA, reports2GeoJSON } from '@/lib/types/Report'
import { makeReport } from '../../helpers/fixtures'

describe('parseCantidadNNA', () => {
  it.each([
    ['1', 1],
    ['2', 2],
    ['3', 3],
    ['4', 4],
    ['5 o más', '5 o más'],
    ['No sé', 'No sé'],
  ])('convierte el texto %j en %j', (text, expected) => {
    expect(parseCantidadNNA(text)).toBe(expected)
  })

  it('acepta el número ya convertido', () => {
    for (const option of CANTIDAD_NNA) expect(parseCantidadNNA(option)).toBe(option)
  })

  it.each([[''], ['0'], ['5'], ['6'], ['5 o mas'], [' 1'], ['uno'], [null], [undefined], [NaN], [{}], [[]], [-1], [1.5]])(
    'devuelve "No sé" con la basura %j',
    (value) => {
      expect(parseCantidadNNA(value)).toBe('No sé')
    },
  )

  it('un arreglo de un elemento "1" se convierte en 1 porque String([1]) es "1"', () => {
    expect(parseCantidadNNA(['1'])).toBe(1)
  })
})

describe('reports2GeoJSON', () => {
  const now = new Date('2026-03-10T18:30:00Z')

  it('devuelve una colección vacía sin reportes', () => {
    expect(reports2GeoJSON([], now)).toEqual({ type: 'FeatureCollection', features: [] })
  })

  it('arma el punto con [lng, lat] y las propiedades planas', () => {
    const { features } = reports2GeoJSON([makeReport()], now)
    expect(features).toHaveLength(1)
    expect(features[0].geometry.coordinates).toEqual([-99.25, 19.57])
    expect(features[0].properties).toEqual({
      id: '1',
      risk: 'Medio',
      nna: 2,
      approx_age: '6-11',
      status: 'Recibido',
      report_date: '2026-03-05T18:30:00',
      hour: 12,
      weekday: 4,
      days_unattended: 5,
    })
  })

  it('salta los reportes con ubicación inválida y conserva los demás', () => {
    const reports = [
      makeReport({ id_reporte: 1 }),
      makeReport({ id_reporte: 2, ubicacion: { ...makeReport().ubicacion, lat: 91 } }),
      makeReport({ id_reporte: 3, ubicacion: { ...makeReport().ubicacion, lng: NaN } }),
      makeReport({ id_reporte: 4, ubicacion: { ...makeReport().ubicacion, lat: null as never } }),
      makeReport({ id_reporte: 5 }),
    ]
    expect(reports2GeoJSON(reports, now).features.map((f) => f.properties.id)).toEqual(['1', '5'])
  })

  it('days_unattended es null cuando el reporte ya tiene caso', () => {
    const { features } = reports2GeoJSON([makeReport({ id_caso: 8 })], now)
    expect(features[0].properties.days_unattended).toBeNull()
  })

  it('cuenta solo días completos', () => {
    const base = '2026-03-05T18:30:00Z'
    const start = new Date(base).getTime()
    const at = (ms: number) => reports2GeoJSON([makeReport()], new Date(start + ms)).features[0].properties.days_unattended
    expect(at(0)).toBe(0)
    expect(at(MS_DAY - 1)).toBe(0)
    expect(at(MS_DAY)).toBe(1)
    expect(at(MS_DAY * 2 + 1)).toBe(2)
  })

  it('da días negativos cuando el reporte es posterior a la fecha de referencia', () => {
    const { features } = reports2GeoJSON([makeReport()], new Date('2026-03-04T00:00:00Z'))
    expect(features[0].properties.days_unattended).toBe(-2)
  })

  it('usa la hora y el día de la Ciudad de México', () => {
    const { features } = reports2GeoJSON([makeReport({ fecha_reporte: '2026-01-01T00:00:00' })], now)
    expect(features[0].properties).toMatchObject({ hour: 18, weekday: 3 })
  })

  it('acepta las ubicaciones en los límites', () => {
    const edge = makeReport({ ubicacion: { ...makeReport().ubicacion, lat: 90, lng: -180 } })
    expect(reports2GeoJSON([edge], now).features).toHaveLength(1)
  })

  it('usa la fecha actual si no se pasa una', () => {
    const { features } = reports2GeoJSON([makeReport({ fecha_reporte: new Date().toISOString() })])
    expect(features[0].properties.days_unattended).toBe(0)
  })

  // una fecha dañada hace lanzar RangeError y tumba la capa completa del mapa
  it.fails('una fecha inválida no debería impedir dibujar los demás reportes', () => {
    const reports = [makeReport({ id_reporte: 1, fecha_reporte: 'basura' }), makeReport({ id_reporte: 2 })]
    expect(reports2GeoJSON(reports, now).features.map((f) => f.properties.id)).toContain('2')
  })
})
