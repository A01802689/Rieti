import { describe, expect, it } from 'vitest'
import {
  DEFAULT_STATUS_STYLE,
  formatDateTime,
  formatMinorDetails,
  isUnknown,
  RISK_LEVEL_STYLES,
  STATUS_STYLES,
  statusStyle,
  URGENCY_STYLES,
} from '@/lib/utilities/reportStyles'

describe('statusStyle', () => {
  it.each(Object.keys(STATUS_STYLES))('da el estilo propio de %s', (status) => {
    expect(statusStyle(status)).toBe(STATUS_STYLES[status])
  })

  it.each([[null], [undefined], [''], ['Inventado']])('da el estilo por defecto con %j', (status) => {
    expect(statusStyle(status)).toBe(DEFAULT_STATUS_STYLE)
  })

  // el objeto de estilos hereda las propiedades de Object: "toString" o "constructor" devuelven una función
  it.fails('no confunde propiedades heredadas con estatus', () => {
    expect(statusStyle('toString')).toBe(DEFAULT_STATUS_STYLE)
  })

  it('cubre los estatus de reporte y los estados de caso', () => {
    expect(Object.keys(STATUS_STYLES)).toEqual(
      expect.arrayContaining(['Recibido', 'En revisión', 'Canalizado', 'En atención', 'Concluido', 'Rechazado', 'Abierto', 'En desarrollo', 'Cerrado']),
    )
  })
})

describe('colores de riesgo y urgencia', () => {
  it('tienen los tres niveles', () => {
    expect(Object.keys(RISK_LEVEL_STYLES)).toEqual(['Alto', 'Medio', 'Bajo'])
    expect(Object.keys(URGENCY_STYLES)).toEqual(['Alta', 'Media', 'Baja'])
  })
})

describe('formatDateTime', () => {
  it('muestra la fecha en hora de la Ciudad de México', () => {
    expect(formatDateTime('2026-03-05T18:30:00')).toMatch(/05.*mar.*2026.*12:30/i)
  })

  it('una fecha sin zona se lee como UTC', () => {
    expect(formatDateTime('2026-03-05T18:30:00')).toBe(formatDateTime('2026-03-05T18:30:00Z'))
  })

  it('en la medianoche UTC muestra el día anterior', () => {
    expect(formatDateTime('2026-01-01T00:00:00')).toMatch(/31.*dic.*2025.*06:00/i)
  })

  it('una fecha con offset coincide con su equivalente en UTC', () => {
    expect(formatDateTime('2026-03-05T12:30:00-06:00')).toBe(formatDateTime('2026-03-05T18:30:00'))
  })

  it('con una fecha inválida lanza RangeError', () => {
    expect(() => formatDateTime('no es fecha')).toThrow(RangeError)
  })

  // una fecha dañada de la API tumba toda la pantalla que la muestra
  it.fails('con una fecha inválida no debería lanzar', () => {
    expect(() => formatDateTime('no es fecha')).not.toThrow()
  })
})

describe('isUnknown', () => {
  it.each([[null], [undefined], ['Desconocido']])('%j es desconocido', (value) => {
    expect(isUnknown(value)).toBe(true)
  })

  it.each([[0], [''], ['No sé'], [false], ['desconocido'], [1]])('%j no es desconocido', (value) => {
    expect(isUnknown(value)).toBe(false)
  })
})

describe('formatMinorDetails', () => {
  it('escribe un menor en singular', () => {
    expect(formatMinorDetails(1, '6-11')).toBe('1 menor, 6-11 años')
  })

  it('escribe varios menores en plural', () => {
    expect(formatMinorDetails(3, '12-14')).toBe('3 menores, 12-14 años')
    expect(formatMinorDetails('5 o más', '15-17')).toBe('5 o más menores, 15-17 años')
  })

  it('"No sé" se muestra como cantidad, no como falta de dato', () => {
    expect(formatMinorDetails('No sé', '0-5')).toBe('No sé menores, 0-5 años')
  })

  it('indica la falta de edad', () => {
    expect(formatMinorDetails(2, null)).toBe('2 menores, Edad sin dato')
  })

  it('indica la falta de cantidad', () => {
    expect(formatMinorDetails(null as never, '0-5')).toBe('Cantidad sin dato, 0-5 años')
    expect(formatMinorDetails('Desconocido' as never, 'Desconocido' as never)).toBe('Cantidad sin dato, Edad sin dato')
  })

  // "No sé" en la edad produce "No sé años"
  it.fails('con edad "No sé" no debería decir "No sé años"', () => {
    expect(formatMinorDetails(2, 'No sé')).not.toContain('No sé años')
  })
})
