import { describe, expect, it } from 'vitest'
import type { Caso, Seguimiento } from '@/lib/types/Case'
import { caseFolio, seguimientoFolio, timelineOf } from '@/lib/utilities/caseTimeline'

const makeCase = (overrides: Partial<Caso> = {}): Caso => ({
  id_caso: 12,
  municipio: { nombre: 'Atizapán' },
  ubicacion: { municipio: 'Atizapán', colonia: null, calle: null, lat: null, lng: null },
  estado: 'Abierto',
  cantidad_nna: 1,
  edad_aproximada: '0-5',
  tipo_trabajo: 'Campo',
  fecha_caso: '2026-05-10T15:00:00',
  notas: null,
  urgencia: null,
  cantidad_reportes: 1,
  ...overrides,
})

describe('caseFolio', () => {
  it('rellena el id a cuatro dígitos', () => {
    expect(caseFolio({ id_caso: 12, fecha_caso: '2026-05-10T15:00:00' })).toBe('CASO-2026-0012')
  })

  it('no recorta un id de más de cuatro dígitos', () => {
    expect(caseFolio({ id_caso: 123456, fecha_caso: '2026-05-10T15:00:00' })).toBe('CASO-2026-123456')
  })

  it('usa el año en hora de la Ciudad de México', () => {
    expect(caseFolio({ id_caso: 1, fecha_caso: '2026-01-01T00:00:00' })).toBe('CASO-2025-0001')
  })
})

describe('seguimientoFolio', () => {
  it('rellena el número a dos dígitos', () => {
    expect(seguimientoFolio({ id_caso: 12, fecha_caso: '2026-05-10T15:00:00' }, 1)).toBe('SEG-2026-0012-01')
  })

  it('no recorta un número de más de dos dígitos', () => {
    expect(seguimientoFolio({ id_caso: 12, fecha_caso: '2026-05-10T15:00:00' }, 105)).toBe('SEG-2026-0012-105')
  })
})

describe('timelineOf', () => {
  it('devuelve los seguimientos que trae el caso', () => {
    const seguimientos: Seguimiento[] = [
      { folio: 'SEG-2026-0012-01', fecha: '2026-05-10T15:00:00', tipo: 'Nota', autor: 'Ana', nota: 'hola' },
    ]
    expect(timelineOf(makeCase({ seguimientos }))).toBe(seguimientos)
  })

  it('deriva la recepción cuando no hay seguimientos', () => {
    expect(timelineOf(makeCase())).toEqual([
      {
        folio: 'SEG-2026-0012-01',
        fecha: '2026-05-10T15:00:00',
        tipo: 'Recepción de reporte',
        autor: 'Sistema',
        nota: null,
      },
    ])
  })

  it('deriva la recepción cuando la lista está vacía', () => {
    expect(timelineOf(makeCase({ seguimientos: [] }))).toHaveLength(1)
  })

  it('usa las notas del caso en la entrada derivada', () => {
    expect(timelineOf(makeCase({ notas: 'Visita hecha' }))[0].nota).toBe('Visita hecha')
  })

  it('una nota vacía se convierte en null', () => {
    expect(timelineOf(makeCase({ notas: '' }))[0].nota).toBeNull()
  })
})
