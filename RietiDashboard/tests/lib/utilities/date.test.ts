import { describe, expect, it } from 'vitest'
import {
  DASHBOARD_TIME_ZONE,
  dashboardHourAndWeekday,
  dashboardYearAndMonth,
  parseApiDate,
} from '@/lib/utilities/date'

describe('parseApiDate', () => {
  it('lee como UTC una fecha sin zona', () => {
    expect(parseApiDate('2026-03-05T10:20:30').toISOString()).toBe('2026-03-05T10:20:30.000Z')
  })

  it('respeta la zona Z, en mayúscula o minúscula', () => {
    expect(parseApiDate('2026-03-05T10:20:30Z').toISOString()).toBe('2026-03-05T10:20:30.000Z')
    expect(parseApiDate('2026-03-05T10:20:30z').toISOString()).toBe('2026-03-05T10:20:30.000Z')
  })

  it('recorta los microsegundos a milisegundos, con y sin zona', () => {
    expect(parseApiDate('2026-03-05T10:20:30.123456').toISOString()).toBe('2026-03-05T10:20:30.123Z')
    expect(parseApiDate('2026-03-05T10:20:30.987654Z').toISOString()).toBe('2026-03-05T10:20:30.987Z')
    expect(parseApiDate('2026-03-05T10:20:30.123456+05:30').toISOString()).toBe('2026-03-05T04:50:30.123Z')
  })

  it('no trunca una fracción de menos de tres dígitos', () => {
    expect(parseApiDate('2026-03-05T10:20:30.5').toISOString()).toBe('2026-03-05T10:20:30.500Z')
  })

  it('respeta un offset positivo con dos puntos', () => {
    expect(parseApiDate('2026-03-05T10:20:30+05:30').toISOString()).toBe('2026-03-05T04:50:30.000Z')
  })

  it('respeta un offset negativo sin dos puntos', () => {
    expect(parseApiDate('2026-03-05T10:20:30-0600').toISOString()).toBe('2026-03-05T16:20:30.000Z')
  })

  // la regex de zona acepta el offset de solo horas, pero Date no lo entiende y da fecha inválida
  it.fails('respeta un offset de solo horas', () => {
    expect(parseApiDate('2026-03-05T10:20:30-06').toISOString()).toBe('2026-03-05T16:20:30.000Z')
  })

  it('lee como UTC una hora sin segundos y sin zona', () => {
    expect(parseApiDate('2026-03-05T10:20').toISOString()).toBe('2026-03-05T10:20:00.000Z')
  })

  it('lee como UTC una fecha sin hora', () => {
    expect(parseApiDate('2026-03-05').toISOString()).toBe('2026-03-05T00:00:00.000Z')
  })

  it('da una fecha inválida con texto que no es fecha', () => {
    expect(Number.isNaN(parseApiDate('basura').getTime())).toBe(true)
    expect(Number.isNaN(parseApiDate('').getTime())).toBe(true)
    expect(Number.isNaN(parseApiDate('2026-13-45T10:00:00').getTime())).toBe(true)
  })

  it('el resultado no depende de la zona horaria del equipo', () => {
    expect(new Date(0).getTimezoneOffset()).not.toBe(0)
    expect(parseApiDate('2026-03-05T00:00:00').getUTCHours()).toBe(0)
  })

  // la API manda siempre la T, pero un separador con espacio se lee en la zona del equipo
  it.fails('lee como UTC una fecha sin zona separada por espacio en lugar de T', () => {
    expect(parseApiDate('2026-03-05 10:20:30').toISOString()).toBe('2026-03-05T10:20:30.000Z')
  })
})

describe('dashboardHourAndWeekday', () => {
  it('usa la zona de Ciudad de México', () => {
    expect(DASHBOARD_TIME_ZONE).toBe('America/Mexico_City')
  })

  it('resta seis horas a UTC y conserva el día', () => {
    expect(dashboardHourAndWeekday(new Date('2026-03-05T18:30:00Z'))).toEqual({ hour: 12, weekday: 4 })
  })

  it('en la medianoche UTC todavía es el día anterior en la Ciudad de México', () => {
    // jueves 1 de enero de 2026 en UTC, miércoles 31 de diciembre de 2025 a las 18:00 en la Ciudad de México
    expect(dashboardHourAndWeekday(new Date('2026-01-01T00:00:00Z'))).toEqual({ hour: 18, weekday: 3 })
  })

  it('a las 05:59:59 UTC sigue siendo las 23 horas del día anterior', () => {
    expect(dashboardHourAndWeekday(new Date('2026-01-01T05:59:59Z'))).toEqual({ hour: 23, weekday: 3 })
  })

  it('a las 06:00 UTC es la hora 0 y no la 24 del día nuevo', () => {
    expect(dashboardHourAndWeekday(new Date('2026-01-01T06:00:00Z'))).toEqual({ hour: 0, weekday: 4 })
  })

  it('numera el domingo con 0 y el sábado con 6', () => {
    expect(dashboardHourAndWeekday(new Date('2026-03-08T12:00:00Z')).weekday).toBe(0)
    expect(dashboardHourAndWeekday(new Date('2026-03-07T12:00:00Z')).weekday).toBe(6)
  })

  it('el cambio de día de la semana ocurre a las 06:00 UTC', () => {
    expect(dashboardHourAndWeekday(new Date('2026-03-08T05:59:59Z')).weekday).toBe(6)
    expect(dashboardHourAndWeekday(new Date('2026-03-08T06:00:00Z')).weekday).toBe(0)
  })

  it('aplica el horario de verano que existió hasta 2022', () => {
    expect(dashboardHourAndWeekday(new Date('2022-07-01T12:00:00Z')).hour).toBe(7)
    expect(dashboardHourAndWeekday(new Date('2023-07-01T12:00:00Z')).hour).toBe(6)
  })

  it('lanza RangeError con una fecha inválida', () => {
    expect(() => dashboardHourAndWeekday(new Date(NaN))).toThrow(RangeError)
  })
})

describe('dashboardYearAndMonth', () => {
  it('da el año y el mes con enero en 0', () => {
    expect(dashboardYearAndMonth(new Date('2026-01-15T12:00:00Z'))).toEqual({ year: 2026, month: 0 })
    expect(dashboardYearAndMonth(new Date('2026-12-15T12:00:00Z'))).toEqual({ year: 2026, month: 11 })
  })

  it('el 1 de enero a las 00:00 UTC todavía es diciembre del año anterior', () => {
    expect(dashboardYearAndMonth(new Date('2026-01-01T00:00:00Z'))).toEqual({ year: 2025, month: 11 })
    expect(dashboardYearAndMonth(new Date('2026-01-01T05:59:59Z'))).toEqual({ year: 2025, month: 11 })
  })

  it('el 1 de enero a las 06:00 UTC ya es el año nuevo', () => {
    expect(dashboardYearAndMonth(new Date('2026-01-01T06:00:00Z'))).toEqual({ year: 2026, month: 0 })
  })

  it('el 31 de diciembre al final del día UTC sigue en diciembre', () => {
    expect(dashboardYearAndMonth(new Date('2025-12-31T23:59:59Z'))).toEqual({ year: 2025, month: 11 })
  })

  it('el cambio de mes en un año bisiesto', () => {
    expect(dashboardYearAndMonth(new Date('2024-03-01T05:59:59Z'))).toEqual({ year: 2024, month: 1 })
    expect(dashboardYearAndMonth(new Date('2024-03-01T06:00:00Z'))).toEqual({ year: 2024, month: 2 })
  })

  it('lanza RangeError con una fecha inválida', () => {
    expect(() => dashboardYearAndMonth(new Date(NaN))).toThrow(RangeError)
  })
})
