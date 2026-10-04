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
  }
}
