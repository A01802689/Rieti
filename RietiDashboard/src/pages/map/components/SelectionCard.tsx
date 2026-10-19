import type { ReactNode } from "react"
import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Reporte } from "@/lib/types/Report"
import type { Caso } from "@/lib/types/Case"
import type { Selected } from "@/lib/types/Selected"
import { useAuth } from "@/context/auth"
import { formatDateTime } from "@/lib/utilities/reportStyles"
import { formatAddress } from "@/lib/utilities/location"

/**
 * Route of the detail page of a report or case
 *
 * @param type - Whether it is a report or a case
 * @param id - Id of the item
 * @returns The route
 */
const detailRoute = (type: Selected["type"], id: string) =>
  type === "report" ? `/reports/${id}` : `/cases/${id}`

/**
 * Line with a label and its value
 *
 * @param label - Name of the field
 * @param value - Value of the field
 */
const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-3 text-sm">
    <span className="font-diffuse">{label}</span>
    <span className="text-right font-clear">{value}</span>
  </div>
)

interface SelectionCardProps {
  /** Selected report or case; the card is hidden when null */
  selected: Selected | null
  /** Reports where the selected report is looked up */
  reports?: Reporte[]
  /** Cases where the selected case is looked up */
  cases?: Caso[]
  /** Called when the card is closed */
  onClose: () => void
}

/** Card with the summary of the selected report or case and a link to its page, only for users who can see that page; it only shows the fields that the list endpoints return */
export const SelectionCard = ({ selected, reports, cases, onClose }: SelectionCardProps) => {
  const navigate = useNavigate()
  const { can } = useAuth()

  if (!selected) return null

  const report = selected.type === "report"
    ? reports?.find((r) => String(r.id_reporte) === selected.id)
    : undefined
  const caso = selected.type === "case"
    ? cases?.find((c) => String(c.id_caso) === selected.id)
    : undefined

  if (!report && !caso) return null

  return (
    <div className="w-72 max-w-[calc(100vw-2rem)] rounded-xl bg-card p-4 shadow-lg">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h2 className="p-0 text-lg">{report ? report.folio_reporte : `Caso #${caso?.id_caso}`}</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="font-diffuse cursor-pointer">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {report && (
          <>
            <Row label="Estatus" value={report.estatus_seguimiento ?? "Sin estatus"} />
            <Row label="Tipo de trabajo" value={report.tipo_trabajo} />
            <Row label="Riesgo" value={report.riesgo ?? "Sin evaluar"} />
            <Row label="Menores" value={String(report.cantidad_nna)} />
            <Row label="Edad aproximada" value={report.edad_aproximada ?? "Sin dato"} />
            <Row label="Ubicación" value={formatAddress({ calle: report.ubicacion.calle, colonia: report.ubicacion.colonia }) ?? "Sin dirección"} />
            <Row label="Fecha" value={formatDateTime(report.fecha_reporte)} />
            <Row label="Caso" value={report.id_caso === null ? "Sin caso" : `#${report.id_caso}`} />
          </>
        )}

        {caso && (
          <>
            <Row label="Estado" value={caso.estado} />
            <Row label="Urgencia" value={caso.urgencia ?? "Sin urgencia"} />
            <Row label="Menores" value={String(caso.cantidad_nna)} />
            <Row label="Municipio" value={caso.municipio.nombre} />
            <Row label="Ubicación" value={formatAddress({ calle: caso.ubicacion.calle, colonia: caso.ubicacion.colonia }) ?? "Sin dirección"} />
            <Row label="Fecha" value={formatDateTime(caso.fecha_caso)} />
            {reports && (
              <Row label="Reportes asociados" value={reports.filter((r) => r.id_caso === caso.id_caso).length} />
            )}
          </>
        )}
      </div>

      {can(selected.type === "report" ? "reports.view_detail" : "cases.view") && (
        <button
          type="button"
          onClick={() => navigate(detailRoute(selected.type, selected.id))}
          className="btn-primary mt-3 w-full rounded-lg py-1.5 text-sm font-medium"
        >
          Ver más
        </button>
      )}
    </div>
  )
}
