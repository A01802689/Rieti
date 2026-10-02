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

import { type Ubicacion } from "./Report";

export interface Municipio {
  nombre: string
}

export interface Case {
  id_caso: number
  municipio: Municipio
  ubicacion: Ubicacion
  estado: "Abierto" | "En desarrollo" | "Cerrado"
  fecha_caso: string // ISO 8601 TIMESTAMP
  notas: string
  urgencia: "Baja" | "Media" | "Alta"
}

export function cases2GeoJSON(cases: Case[]){
  cases.flatMap( (c) => {
    const { ubicacion } = c
    return [{
     type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [ubicacion.lng, ubicacion.lat] }, 
        properties: {
          urgency: c.urgencia

        }
  }]
  })
}