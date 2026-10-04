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
  "fecha_caso": "string (ISO 8601 TIMESTAMP)",
  "urgencia": "'Baja' | 'Media' | 'Alta' | null"
}, ...]
*/

import type { FeatureCollection, Point } from "geojson";
import { type Ubicacion, MS_DAY } from "./Report";

export interface Municipio {
  nombre: string
}
type CaseState = "Abierto" | "En desarrollo" | "Cerrado"
type CaseUrgency = "Baja" | "Media" | "Alta"


export interface Case {
  id_caso: number
  municipio: Municipio
  ubicacion: Ubicacion
  estado: CaseState
  fecha_caso: string // ISO 8601 TIMESTAMP
  notas: string
  urgencia: CaseUrgency
}

export type FeatureCaseProps = {
  id: string
  status: CaseState
  urgency: CaseUrgency
  caseDate: string
  daysElapsed: number
}

// property of FeatureCaseProps used to color the case circles
export type CaseVisual = "urgency" | "daysElapsed"

export const cases2GeoJSON = (
  cases: Case[], 
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
        caseDate: c.fecha_caso,
        daysElapsed: Math.floor((currDate.getTime() - date.getTime()) / MS_DAY)
      }
    }]
  })
})
