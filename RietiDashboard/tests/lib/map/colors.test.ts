import { describe, expect, it } from 'vitest'
import {
  caseColor,
  caseLegend,
  heatLegend,
  reportColor,
  reportLegend,
} from '@/lib/map/colors'
import type { CaseVisual } from '@/lib/types/Case'
import type { ReportVisual } from '@/lib/types/Report'

const reportVisuals: ReportVisual[] = ['risk', 'nna', 'approx_age', 'days_unattended']
const caseVisuals: CaseVisual[] = ['urgency', 'daysElapsed', 'nna']

describe('colores del mapa', () => {
  it.each(reportVisuals)('reportColor(%s) devuelve una expresión de MapLibre', (visual) => {
    const expression = reportColor(visual)
    expect(Array.isArray(expression)).toBe(true)
    expect(['match', 'step']).toContain(expression[0])
  })

  it.each(caseVisuals)('caseColor(%s) devuelve una expresión de MapLibre', (visual) => {
    const expression = caseColor(visual)
    expect(['match', 'step']).toContain(expression[0])
  })

  it('el riesgo usa la escala amarillo a rojo y los demás la escala azul a morado', () => {
    const risk = JSON.stringify(reportColor('risk'))
    const nna = JSON.stringify(reportColor('nna'))
    expect(risk).toContain('#8c1515')
    expect(nna).not.toContain('#8c1515')
  })

  it('toda expresión de tipo match termina con el color de "sin dato"', () => {
    for (const expression of [reportColor('risk'), reportColor('nna'), reportColor('approx_age'), caseColor('urgency'), caseColor('nna')]) {
      expect(expression.at(-1)).toBe('#9ca3af')
    }
  })

  it('la cantidad de NNA se compara como texto para mezclar números y "5 o más"', () => {
    expect(JSON.stringify(reportColor('nna'))).toContain('to-string')
    expect(JSON.stringify(caseColor('nna'))).toContain('to-string')
  })

  it('los días sin atender tratan null como -1 (sin dato)', () => {
    expect(JSON.stringify(reportColor('days_unattended'))).toContain('coalesce')
  })

  it.each(reportVisuals)('reportLegend(%s) trae título, colores y extremos', (visual) => {
    const legend = reportLegend(visual)
    expect(legend.title).not.toBe('')
    expect(legend.colors.length).toBeGreaterThanOrEqual(3)
    expect(legend.from).not.toBe('')
    expect(legend.to).not.toBe('')
  })

  it.each(caseVisuals)('caseLegend(%s) trae título, colores y extremos', (visual) => {
    const legend = caseLegend(visual)
    expect(legend.colors.length).toBeGreaterThanOrEqual(3)
  })

  it('la leyenda de concentración tiene cinco colores', () => {
    expect(heatLegend().colors).toHaveLength(5)
  })
})
