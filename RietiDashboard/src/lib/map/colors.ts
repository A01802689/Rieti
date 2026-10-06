import type { ExpressionSpecification } from "maplibre-gl"
import type { ReportVisual } from "@/lib/types/Report"
import type { CaseVisual } from "@/lib/types/Case"

// Circle palettes (low -> high). Reports are blue->violet and cases are pink so they
// are not confused with each other or with the yellow/red zones.
const REPORT_RAMP = ['#2dd4bf', '#38bdf8', '#6366f1', '#7c3aed', '#4c1d95']
const CASE_RAMP = ['#f9a8d4', '#f472b6', '#ec4899', '#be185d', '#831843']
const NO_DATA = '#9ca3af'

export const SELECTED_STROKE = '#111827'

export const reportColor = (visual: ReportVisual): ExpressionSpecification => {
  const c = REPORT_RAMP
  switch (visual) {
    case 'risk':
      // risker -> darker
      return ['match', ['get', 'risk'], 'Bajo', c[0], 'Medio', c[2], 'Alto', c[4], NO_DATA]
    case 'nna':
      // more nna -> darker
      return ['match', ['to-string', ['get', 'nna']],
        '1', c[0], '2', c[1], '3', c[2], '4', c[3], '5 o más', c[4], NO_DATA]
    case 'approx_age':
      // younger -> darker
      return ['match', ['get', 'approx_age'], '0-5', c[4], '6-11', c[3], '12-14', c[2], '15-17', c[0], NO_DATA]
    case 'days_unattended':
      // null (report has a case) -> -1 -> no data. Cuts: 0-6, 7-29, 30+
      return ['step', ['coalesce', ['get', 'days_unattended'], -1], NO_DATA, 0, c[0], 7, c[2], 30, c[4]]
  }
}

// MapLibre expression used as `circle-color` of the cases layer
export const caseColor = (visual: CaseVisual): ExpressionSpecification => {
  const c = CASE_RAMP
  switch (visual) {
    case 'urgency':
      return ['match', ['get', 'urgency'], 'Baja', c[0], 'Media', c[2], 'Alta', c[4], NO_DATA]
    case 'daysElapsed':
      // cuts: 0-29, 30-89, 90+
      return ['step', ['get', 'daysElapsed'], c[0], 30, c[2], 90, c[4]]
    case 'nna':
      // cantidad_nna mixes numbers and strings, so it is compared as a string
      return ['match', ['to-string', ['get', 'nna']],
        '1', c[0], '2', c[1], '3', c[2], '4', c[3], '5 o más', c[4], NO_DATA]
  }
}

export type Legend = {
  title: string    // category used to color
  colors: string[] // gradient stops, lightest to darkest
  from: string     // label of the lightest end
  to: string       // label of the darkest end
}

// describe the colors of reportColor
export const reportLegend = (visual: ReportVisual): Legend => {
  const c = REPORT_RAMP
  switch (visual) {
    case 'risk':
      return { title: 'Nivel de riesgo', colors: [c[0], c[2], c[4]], from: 'Bajo', to: 'Alto' }
    case 'nna':
      return { title: 'Niños, niñas y adolescentes', colors: c, from: '1', to: '5 o más' }
    case 'approx_age':
      return { title: 'Edad aproximada', colors: [c[0], c[2], c[3], c[4]], from: '15-17 años', to: '0-5 años' }
    case 'days_unattended':
      return { title: 'Días sin atender', colors: [c[0], c[2], c[4]], from: '0 días', to: '30 o más' }
  }
}

// describe the colors of caseColor
export const caseLegend = (visual: CaseVisual): Legend => {
  const c = CASE_RAMP
  switch (visual) {
    case 'urgency':
      return { title: 'Urgencia', colors: [c[0], c[2], c[4]], from: 'Baja', to: 'Alta' }
    case 'daysElapsed':
      return { title: 'Días transcurridos', colors: [c[0], c[2], c[4]], from: '0 días', to: '90 o más' }
    case 'nna':
      return { title: 'Niños, niñas y adolescentes', colors: c, from: '1', to: '5 o más' }
  }
}

// color the zones by the number of points (0 = no color)
export const ZONE_FILL_COLOR: ExpressionSpecification =
  ['step', ['get', 'count'], '#ffffff', 1, '#fbbf24', 10, '#ff4626', 20, '#b00323']

// describe the colors of ZONE_FILL_COLOR
export const zoneLegend = (): Legend => ({
  title: 'Concentración',
  colors: ['#fbbf24', '#ff4626', '#b00323'],
  from: '1',
  to: '20 o más',
})
