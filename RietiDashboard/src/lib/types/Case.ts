/* 
* JSON de Caso, endpoint (/dashboard/casos/{id})
{
  "id_caso": "number",
  "municipio": {
    "nombre": "string"
  },
  "ubicacion": {
    "municipio": "string",
    "colonia": "string",
    "calle": "string",
    "lat": "number",
    "lng": "number"
  },
  "estado": "'Abierto' | 'En desarrollo' | 'Cerrado'",
  "cantidad_nna": "1 | 2 | 3 | 4 | '5 o más' | 'No sé'",
  "fecha_caso": "string (ISO 8601 TIMESTAMP)",
  "notas": "string",
  "urgencia": "'Baja' | 'Media' | 'Alta'"
}
* JSON de Caso, endpoint (/dashboard/casos)
[{
  "id_caso": "number",
  "municipio": {
    "nombre": "string"
  },
  "ubicacion": {
    "municipio": "string",
    "colonia": "string",
    "calle": "string",
    "lat": "number",
    "lng": "number"
  },
  "estado": "'Abierto' | 'En desarrollo' | 'Cerrado'",
  "cantidad_nna": "1 | 2 | 3 | 4 | '5 o más' | 'No sé'",
  "fecha_caso": "string (ISO 8601 TIMESTAMP)",
  "urgencia": "'Baja' | 'Media' | 'Alta' | null"
}, ...]
*/

import type { FeatureCollection, Point } from "geojson";
import { type Ubicacion, type CantidadNNA, MS_DAY } from "./Report";

export interface Municipio {
  nombre: string
}
export type CaseState = "Abierto" | "En desarrollo" | "Cerrado"
export type CaseUrgency = "Baja" | "Media" | "Alta"


// A "folio de seguimiento": one entry of the case timeline
export interface Seguimiento {
  folio: string // SEG-2026-0012-01
  fecha: string // ISO 8601 TIMESTAMP
  tipo: string // 'Recepción de reporte' | 'Nota' | 'Cambio de estado' | 'Transferencia'
  autor: string
  nota: string | null
}

export interface Caso {
  id_caso: number
  municipio: Municipio
  ubicacion: Ubicacion
  estado: CaseState
  cantidad_nna: CantidadNNA
  fecha_caso: string // ISO 8601 TIMESTAMP
  notas: string
  urgencia: CaseUrgency
  seguimientos?: Seguimiento[] // mock cases without it get a derived first entry, see lib/utilities/caseTimeline.ts
}

export type FeatureCaseProps = {
  id: string
  status: CaseState
  urgency: CaseUrgency
  nna: CantidadNNA
  caseDate: string
  daysElapsed: number
}

// property of FeatureCaseProps used to color the case circles
export type CaseVisual = "urgency" | "daysElapsed" | "nna"

export const cases2GeoJSON = (
  cases: Caso[], 
  currDate: Date = new Date()
): FeatureCollection<Point, FeatureCaseProps> => ({
    type: "FeatureCollection",
    features: cases.flatMap( (c) => {
      const { ubicacion } = c
      const date = new Date(c.fecha_caso);
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
