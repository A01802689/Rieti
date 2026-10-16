/* 
* JSON de Caso, endpoint GET (/casos/{id})
! cantidad_nna, edad_aproximada y tipo_trabajo son enums propios del caso.
! Se inicializan en 'No sé'; no se copian ni calculan a partir de reportes.
! En el JSON, cantidad_nna usa números 1..4 o los textos '5 o más' y 'No sé'.
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
  ! "cantidad_nna": "1 | 2 | 3 | 4 | '5 o más' | 'No sé'",
  ! "edad_aproximada": "'0-5' | '6-11' | '12-14' | '15-17' | 'No sé'",
  ! "tipo_trabajo": "TipoTrabajo (mismo catálogo que Report)",
  "fecha_caso": "string (ISO 8601 TIMESTAMP)",
  ! "notas": "string | null (nota del último seguimiento)",
  ! "urgencia": "'Baja' | 'Media' | 'Alta' | null",
  "seguimientos": [{
    "folio": "string (SEG-2026-0012-01)",
    "fecha": "string (ISO 8601 TIMESTAMP)",
    "tipo": "'Recepción de reporte' | 'Nota' | 'Cambio de estado' | 'Transferencia'",
    "autor": "string",
    "nota": "string | null"
  }, ...]
  ! "reportes": [{
    "id_"
  }, ...]
}

* JSON de Caso, endpoint GET (/casos) (lista, sin notas ni seguimientos)
! Devuelve la lista completa; el VM del dashboard realiza el filtrado.
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
  ! "cantidad_nna": "1 | 2 | 3 | 4 | '5 o más' | 'No sé'",
  "fecha_caso": "string (ISO 8601 TIMESTAMP)",
  ! "edad_aproximada": "'0-5' | '6-11' | '12-14' | '15-17' | 'No sé'",
  ! "tipo_trabajo": "TipoTrabajo (mismo catálogo que Report)",
  "urgencia": "'Baja' | 'Media' | 'Alta' | null"
}, ...]

! Actualizar un caso, endpoint PATCH (/casos/{id_caso}), sólo Administrador.
! Todos los campos son opcionales; los omitidos o null se ignoran.
! cuerpo de ejemplo:
! {
!   "estado": "En desarrollo",
!   "urgencia": "Alta",
!   "cantidad_nna": 2,
!   "edad_aproximada": "12-14",
!   "tipo_trabajo": null
! }
! respuesta: Caso completo (JSON de GET /casos/{id}), sin crear seguimiento.
! {} o todos null devuelven el caso sin cambios; null no borra la urgencia.
! Se permiten únicamente esos cinco campos y sus opciones enum.
! cantidad_nna, edad_aproximada y tipo_trabajo aceptan 'No sé'.
! Sustituye los PATCH individuales de estado, urgencia y los tres datos del caso.

* Transferir un caso a otro municipio, endpoint POST (/casos/{id}/transferir)
cuerpo (hoy el front envía el nombre; lo ideal es id_municipio):
{
  "municipio": "string (nombre del municipio)"
}
! respuesta: el Caso completo, sin crear seguimiento

* Agregar una nota al seguimiento, endpoint POST (/casos/{id}/notas)
cuerpo:
{
  "nota": "string"
}
respuesta: el seguimiento creado:
{
  "folio": "string",
  "fecha": "string (ISO 8601 TIMESTAMP)",
  "tipo": "'Nota'",
  "autor": "string",
  "nota": "string"
}

*/

import type { FeatureCollection, Point } from "geojson";
import type { Municipio as FullMunicipio } from "./Municipio";
import { type Ubicacion, type CantidadNNA, type EdadAproximada, type TipoTrabajo, MS_DAY } from "./Report";

/** Municipality of a case, only its name */
export type Municipio = Pick<FullMunicipio, "nombre">
/** Progress of case */
export type CaseState = "Abierto" | "En desarrollo" | "Cerrado"
/** How urgent a case is */
export type CaseUrgency = "Baja" | "Media" | "Alta" | null

/** One entry of the timeline of a case (a "folio de seguimiento") */
export interface Seguimiento {
  folio: string // SEG-2026-0012-01
  fecha: string // ISO 8601 TIMESTAMP
  tipo: string // 'Recepción de reporte' | 'Nota' | 'Cambio de estado' | 'Transferencia'
  autor: string
  nota: string | null
}

/** Case as the API returns it */
export interface Caso {
  id_caso: number
  municipio: Municipio
  ubicacion: Ubicacion
  estado: CaseState
  cantidad_nna: CantidadNNA
  edad_aproximada: EdadAproximada
  tipo_trabajo: TipoTrabajo
  fecha_caso: string // ISO 8601 TIMESTAMP
  notas: string | null
  urgencia: CaseUrgency
  seguimientos?: Seguimiento[] // mock cases without it get a derived first entry, see lib/utilities/caseTimeline.ts
}

export type CasoListado = Omit<Caso, "notas" | "seguimientos">

export type CasoPatch = {
  [Campo in "estado" | "urgencia" | "cantidad_nna" | "edad_aproximada" | "tipo_trabajo"]?: Caso[Campo] | null
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
 * Converts cases to GeoJSON points for the map
 *
 * @param cases - Cases to draw
 * @param currDate - Date used to count the days elapsed
 */
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
