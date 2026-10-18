import type { FeatureCollection, Point } from "geojson"
import { hasValidLocation } from "../utilities/location"
import { parseApiDate } from "../utilities/date"
import type { Municipio } from "./Municipio"
import { type CantidadNNA, type EdadAproximada, type TipoTrabajo, MS_DAY } from "./Report"

/** Municipality of a case, only its name */
export type MunicipioCaso = Pick<Municipio, "nombre">
/** Progress of a case */
export type CaseState = "Abierto" | "En desarrollo" | "Cerrado"
/** States a case can have, used as dropdown options */
export const CASE_STATES = ['Abierto', 'En desarrollo', 'Cerrado']
/** Urgencies a case can have, used as dropdown options */
export const CASE_URGENCIES = ["Baja", "Media", "Alta"] as const
/** How urgent a case is */
export type CaseUrgency = (typeof CASE_URGENCIES)[number] | null

/** One entry of the timeline of a case (a "folio de seguimiento") */
export interface Seguimiento {
  folio: string // SEG-2026-0012-01
  fecha: string // ISO 8601 TIMESTAMP, UTC without zone
  tipo: string // 'Recepción de reporte' | 'Nota' | 'Cambio de estado' | 'Transferencia'
  autor: string
  nota: string | null
}

/** Place of a case; a case opened from a report starts with only its municipio, so the rest can be null */
export interface UbicacionCaso {
  municipio: string
  colonia: string | null
  calle: string | null
  lat: number | null
  lng: number | null
}

/** Case as the API returns it */
export interface Caso {
  id_caso: number
  municipio: MunicipioCaso
  ubicacion: UbicacionCaso
  estado: CaseState
  cantidad_nna: CantidadNNA
  edad_aproximada: EdadAproximada
  tipo_trabajo: TipoTrabajo
  fecha_caso: string // ISO 8601 TIMESTAMP, UTC without zone
  notas: string | null
  urgencia: CaseUrgency
  cantidad_reportes: number
  seguimientos?: Seguimiento[] // only GET /casos/{id} sends it; without it timelineOf derives the first entry, see lib/utilities/caseTimeline.ts
}

/** Location fields of a case that can be changed; lat and lng go together or the API answers 422 */
export interface UbicacionCasoPatch {
  colonia?: string // 1-100 characters
  calle?: string // 1-100 characters
  lat?: number // -90..90
  lng?: number // -180..180
  referencia?: string | null
}

/** Fields of a case that can be changed; null or omitted ones keep their value */
export type CasoPatch = {
  [Campo in "estado" | "urgencia" | "cantidad_nna" | "edad_aproximada" | "tipo_trabajo"]?: Caso[Campo] | null
} & {
  ubicacion?: UbicacionCasoPatch
}

/** Properties of each case point of the map */
export type FeatureCaseProps = {
  id: string
  status: CaseState
  urgency: CaseUrgency
  nna: CantidadNNA
  caseDate: string
  daysElapsed: number
}

/** Property of FeatureCaseProps used to color the case circles */
export type CaseVisual = "urgency" | "daysElapsed" | "nna"

/**
 * Converts cases to GeoJSON points for the map; cases without valid coordinates are left out
 *
 * @param cases - Cases to draw
 * @param currDate - Date used to count the days elapsed
 * @returns A point per case with its map properties
 */
export const cases2GeoJSON = (
  cases: Caso[],
  currDate: Date = new Date()
): FeatureCollection<Point, FeatureCaseProps> => ({
    type: "FeatureCollection",
    features: cases.flatMap( (c) => {
      const { ubicacion } = c
      if (!hasValidLocation(ubicacion)) return []
      const date = parseApiDate(c.fecha_caso)
      return [{
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [ubicacion.lng, ubicacion.lat] },
      properties: {
        id: String(c.id_caso),
        status: c.estado,
        urgency: c.urgencia,
        nna: c.cantidad_nna,
        caseDate: c.fecha_caso,
        daysElapsed: Math.floor((currDate.getTime() - date.getTime()) / MS_DAY)
      }
    }]
  })
})
