import { reportLegend, caseLegend, zoneLegend, type Legend } from "@/lib/map/colors"
import type { ReportVisual } from "@/lib/types/Report"
import type { CaseVisual } from "@/lib/types/Case"

interface ColorLegendProps {
  /** Show the report color scale */
  showReports: boolean
  /** Show the case color scale */
  showCases: boolean
  /** Show the zone color scale */
  showZones: boolean
  /** Property the reports are colored by */
  reportVisual: ReportVisual
  /** Property the cases are colored by */
  caseVisual: CaseVisual
}

/**
 * One color scale: title, gradient and both ends
 *
 * @param name - Layer name (reports, cases or zones)
 * @param legend - Title, gradient colors and end labels
 */
const LegendBlock = ({ name, legend }: { name: string; legend: Legend }) => (
  <div className="flex flex-col gap-1">
    <p className="p-0 text-xs font-medium">{name}: {legend.title}</p>
    {/* draw the gradient from the lightest to the darkest color */}
    <div
      className="h-2 w-full rounded-full"
      style={{ background: `linear-gradient(to right, ${legend.colors.join(", ")})` }}
    />
    <div className="flex justify-between">
      <span className="text-xs font-diffuse">{legend.from}</span>
      <span className="text-xs font-diffuse">{legend.to}</span>
    </div>
  </div>
)

/** Legend that explains the colors of the map layers that are on */
export const ColorLegend = ({ showReports, showCases, showZones, reportVisual, caseVisual }: ColorLegendProps) => {
  if (!showReports && !showCases && !showZones) return null

  return (
    <div className="pointer-events-none flex w-64 md:w-52 flex-col gap-3 rounded-xl bg-card p-3 shadow-lg">
      {showReports && <LegendBlock name="Reportes" legend={reportLegend(reportVisual)} />}
      {showCases && <LegendBlock name="Casos" legend={caseLegend(caseVisual)} />}
      {showZones && <LegendBlock name="Zonas" legend={zoneLegend()} />}
    </div>
  )
}
