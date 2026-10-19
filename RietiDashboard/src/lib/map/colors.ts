import type { ExpressionSpecification } from "maplibre-gl"
import type { ReportVisual } from "@/lib/types/Report"
import type { CaseVisual } from "@/lib/types/Case"

/** Yellow to dark red scale, low to high, used only for the risk of the reports */
const SEVERITY_RAMP = ['#f6c945', '#e8702a', '#8c1515']
/** Blue to purple scale, low to high, used for every property but the risk, so a yellow to red color always means risk */
const SCALE_RAMP = ['#4f8bc9', '#5b79c4', '#6a67b8', '#7a55aa', '#5a3a8c']
/** Color of a point whose value is missing or unknown */
const NO_DATA = '#9ca3af'

/** Color of the ring around the selected point */
export const SELECTED_STROKE = '#111827'

/**
 * Builds the `circle-color` expression of the reports
 *
 * @param visual - Property used to color
 * @returns The expression for the circle layer
 */
export const reportColor = (visual: ReportVisual): ExpressionSpecification => {
  const c = SCALE_RAMP
  switch (visual) {
    case 'risk':
      return ['match', ['get', 'risk'], 'Bajo', SEVERITY_RAMP[0], 'Medio', SEVERITY_RAMP[1], 'Alto', SEVERITY_RAMP[2], NO_DATA]
    case 'nna':
      return ['match', ['to-string', ['get', 'nna']],
        '1', c[0], '2', c[1], '3', c[2], '4', c[3], '5 o más', c[4], NO_DATA]
    case 'approx_age':
      return ['match', ['get', 'approx_age'], '0-5', c[4], '6-11', c[3], '12-14', c[2], '15-17', c[0], NO_DATA]
    case 'days_unattended':
      // null (the report has a case) becomes -1, which means no data; cuts: 0-6, 7-29, 30+
      return ['step', ['coalesce', ['get', 'days_unattended'], -1], NO_DATA, 0, c[0], 7, c[2], 30, c[4]]
  }
}

/**
 * Builds the `circle-color` expression of the cases
 *
 * @param visual - Property used to color
 * @returns The expression for the circle layer
 */
export const caseColor = (visual: CaseVisual): ExpressionSpecification => {
  const c = SCALE_RAMP
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

/** Description of a color scale: its title, gradient colors and end labels */
export type Legend = {
  title: string    // category used to color
  colors: string[] // gradient stops, lightest to darkest
  from: string     // label of the lightest end
  to: string       // label of the darkest end
}

/**
 * Describes the scale of reportColor
 *
 * @param visual - Property used to color
 * @returns Title, colors and end labels of the legend
 */
export const reportLegend = (visual: ReportVisual): Legend => {
  const c = SCALE_RAMP
  switch (visual) {
    case 'risk':
      return { title: 'Nivel de riesgo', colors: SEVERITY_RAMP, from: 'Bajo', to: 'Alto' }
    case 'nna':
      return { title: 'Niños, niñas y adolescentes', colors: c, from: '1', to: '5 o más' }
    case 'approx_age':
      return { title: 'Edad aproximada', colors: [c[0], c[2], c[3], c[4]], from: '15-17 años', to: '0-5 años' }
    case 'days_unattended':
      return { title: 'Días sin atender', colors: [c[0], c[2], c[4]], from: '0 días', to: '30 o más' }
  }
}

/**
 * Describes the scale of caseColor
 *
 * @param visual - Property used to color
 * @returns Title, colors and end labels of the legend
 */
export const caseLegend = (visual: CaseVisual): Legend => {
  const c = SCALE_RAMP
  switch (visual) {
    case 'urgency':
      return { title: 'Urgencia', colors: [c[0], c[2], c[4]], from: 'Baja', to: 'Alta' }
    case 'daysElapsed':
      return { title: 'Días transcurridos', colors: [c[0], c[2], c[4]], from: '0 días', to: '90 o más' }
    case 'nna':
      return { title: 'Niños, niñas y adolescentes', colors: c, from: '1', to: '5 o más' }
  }
}

/** Colors of the density layer, from no points (transparent) to many: blue, green, yellow, orange and red */
export const HEAT_COLOR: ExpressionSpecification = [
  'interpolate', ['linear'], ['heatmap-density'],
  0, 'rgba(79, 139, 201, 0)',
  0.15, 'rgba(79, 139, 201, 0.75)',
  0.4, '#5fbf62',
  0.6, '#efe14d',
  0.8, '#ee8a2f',
  1, '#b3261e',
]

/** Radius in pixels of the influence of each point on the density layer */
export const HEAT_RADIUS: ExpressionSpecification =
  ['interpolate', ['linear'], ['zoom'], 6, 18, 10, 34, 13, 56, 15, 72]

/** How strong each point weighs in the density layer: low, so a dense area does not turn red everywhere, and a bit higher when zoomed in */
export const HEAT_INTENSITY: ExpressionSpecification =
  ['interpolate', ['linear'], ['zoom'], 6, 0.3, 13, 0.55]

/** Opacity of the density layer: solid at city level and gone when zoomed in, where the points are read one by one */
export const HEAT_OPACITY: ExpressionSpecification =
  ['interpolate', ['linear'], ['zoom'], 6, 0.85, 13, 0.85, 15.5, 0]

/** Opacity of the points: hidden far away and solid from the city level on, over the density layer */
export const POINT_OPACITY: ExpressionSpecification =
  ['interpolate', ['linear'], ['zoom'], 10.5, 0, 12.5, 1]

/**
 * Describes the scale of the density layer
 *
 * @returns Title, gradient colors and end labels of the legend
 */
export const heatLegend = (): Legend => ({
  title: 'Concentración',
  colors: ['#4f8bc9', '#5fbf62', '#efe14d', '#ee8a2f', '#b3261e'],
  from: 'Baja',
  to: 'Alta',
})
