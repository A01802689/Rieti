import type { FeatureCollection, Point } from "geojson"
import { hasValidLocation } from "../utilities/location"
import { dashboardHourAndWeekday, parseApiDate } from "../utilities/date"

/** Follow-up status of a report */
export type ReportState =
  | "Recibido"
  | "En revisión"
  | "Canalizado"
  | "En atención"
  | "Concluido"
  | "Rechazado"
/** Statuses a report can have, used as dropdown options */
export const REPORT_STATUS = ['Recibido', 'En revisión', 'Canalizado', 'En atención', 'Concluido', 'Rechazado']

/** Numbers of minors a report or case can have, also used as dropdown options */
export const CANTIDAD_NNA = [1, 2, 3, 4, "5 o más", "No sé"] as const

/** Number of minors in a report */
export type CantidadNNA = (typeof CANTIDAD_NNA)[number]

/**
 * Converts the number of minors of a report, which the API sends as text, into the type the dashboard uses
 *
 * @param value - "1", "2", "3", "4", "5 o más" or "No sé" (the number itself is also accepted)
 * @returns The matching option of CANTIDAD_NNA, or "No sé" when the value is not one of them
 */
export const parseCantidadNNA = (value: unknown): CantidadNNA =>
  CANTIDAD_NNA.find((option) => String(option) === String(value)) ?? "No sé"

/** Age ranges a report or case can have, also used as dropdown options */
export const EDAD_APROXIMADA = ["0-5", "6-11", "12-14", "15-17", "No sé"] as const

/** Approximate age range of the minors */
export type EdadAproximada = (typeof EDAD_APROXIMADA)[number]

/** Work types of a report, also used as dropdown options */
export const WORK_TYPES = [
  "Venta ambulante",
  "Limpieza de parabrisas",
  "Mendicidad",
  "Carga y descarga",
  "Trabajo en comercio",
  "Campo",
  "Construcción",
  "Trabajo doméstico",
  "Recolección de residuos",
  "Otra actividad",
  "No sé",
] as const

/** Type of work a minor does */
export type TipoTrabajo = (typeof WORK_TYPES)[number]

/** Risk levels of a report, also used as dropdown options */
export const RISK_LEVELS = ["Bajo", "Medio", "Alto"] as const

/** Risk level of a report */
export type Riesgo = (typeof RISK_LEVELS)[number]

/** Report as the dashboard uses it; getReports and getReport build it from the API one */
export interface Reporte {
  id_reporte: number
  id_usuario: number | null
  id_caso: number | null
  ubicacion: Ubicacion
  folio_reporte: string
  estatus_seguimiento: ReportState | null
  cantidad_nna: CantidadNNA
  edad_aproximada: EdadAproximada | null
  tipo_trabajo: TipoTrabajo
  descripcion: string | null
  fecha_reporte: string // ISO 8601 TIMESTAMP, UTC without zone
  /** Address of the photo through the API, null when the report has none; the dashboard only uses it to know there is a photo and asks GET /reportes/{id}/imagen for the real link */
  imagen: string | null
  riesgo: Riesgo | null
  /** Only the detail endpoint sends it */
  tiene_imagen?: boolean
  /** Only the detail endpoint sends it */
  url_descarga_imagen?: string | null
}

/** Links of the photo of a report, as GET /reportes/{id}/imagen sends them; they are signed S3 addresses that need no session and stop working after `expira_en` seconds */
export interface ReportImageLinks {
  url_visualizacion: string
  url_descarga: string
  expira_en: number
}

/** Report as the API sends it: the number of minors is text */
export type ReporteApi = Omit<Reporte, "cantidad_nna"> & { cantidad_nna: string }

/** Place of a report */
export interface Ubicacion {
  municipio: string
  colonia: string
  calle: string
  lat: number
  lng: number
  /** Only the detail endpoint sends it */
  referencia?: string | null
}

/** Properties of each report point of the map; only flat and minimal data is sent, the detail is requested on selection */
export type FeatureReportProps = {
  id: string
  risk: Riesgo | null
  nna: CantidadNNA
  approx_age: EdadAproximada | null
  status: ReportState | null
  report_date: string
  hour: number                    // 0-23 hrs in Mexico City time
  weekday: number                 // 0 = sunday ... 6 = saturday in Mexico City time
  days_unattended: number | null  // null if the report already has a case
}

/** Property of FeatureReportProps used to color the report circles */
export type ReportVisual = "risk" | "nna" | "approx_age" | "days_unattended"

/** Milliseconds in a day */
export const MS_DAY = 1000 * 60 * 60 * 24

/**
 * Converts reports to GeoJSON points for the map; reports without valid coordinates are left out
 *
 * @param reports - Reports to draw
 * @param currDate - Date used to count the days unattended
 * @returns A point per report with its map properties
 */
export const reports2GeoJSON = (
  reports: Reporte[],
  currDate: Date = new Date(),
): FeatureCollection<Point, FeatureReportProps> => ({
    type: "FeatureCollection",
    features: reports.flatMap((r) => {
      const { ubicacion } = r
      if (!hasValidLocation(ubicacion)) return []
      const date = parseApiDate(r.fecha_reporte)
      const { hour, weekday } = dashboardHourAndWeekday(date)
      const noCase = r.id_caso === null

      return [{
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [ubicacion.lng, ubicacion.lat] },
        properties: {
          id: String(r.id_reporte),
          risk: r.riesgo,
          nna: r.cantidad_nna,
          approx_age: r.edad_aproximada,
          status: r.estatus_seguimiento,
          report_date: r.fecha_reporte,
          hour,
          weekday,
          days_unattended: noCase
            ? Math.floor((currDate.getTime() - date.getTime()) / MS_DAY)
            : null,
        }
      }]
    }),
  })
