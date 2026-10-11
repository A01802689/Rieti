/* 
* JSON de Reporte, endpoint GET (/dashboard/reportes/{id})
{
  "id_reporte": "number",
  "id_usuario": "number | null",
  "id_caso": "number | null",
  "ubicacion": {
    "municipio": "string",
    "colonia": "string",
    "calle": "string",
    "lat": "number",
    "lng": "number"
  },
  "folio_reporte": "string",
  "estatus_seguimiento": "'Recibido' | 'En revisión' | 'Canalizado' | 'En atención' | 'Concluido' | 'Rechazado' | null",
  "cantidad_nna": "1 | 2 | 3 | 4 | '5 o más' | 'No sé'",
  "edad_aproximada": "'0-5' | '6-11' | '12-14' | '15-17' | 'No sé' | null",
  "tipo_trabajo": "'Venta ambulante' | 'Limpieza de parabrisas' | 'Mendicidad' | 'Carga y descarga' | 'Trabajo en comercio' | 'Campo' | 'Construcción' | 'Trabajo doméstico' | 'Recolección de residuos' | 'Otra actividad' | 'No sé'",
  "descripcion": "string | null",
  "fecha_reporte": "string (ISO 8601 TIMESTAMP)",
  "imagen": "string | null",
  "riesgo": "'Bajo' | 'Medio' | 'Alto' | null"
}

* JSON de Reporte, endpoint GET (/dashboard/reportes) (lista; admite ?id_caso={id} para los reportes de un caso)
[{
  "id_reporte": "number",
  "id_caso": "number | null",
  "ubicacion": {
    "municipio": "string",
    "colonia": "string",
    "calle": "string",
    "lat": "number",
    "lng": "number"
  },
  "folio_reporte": "string",
  "estatus_seguimiento": "'Recibido' | 'En revisión' | 'Canalizado' | 'En atención' | 'Concluido' | 'Rechazado' | null",
  "cantidad_nna": "1 | 2 | 3 | 4 | '5 o más' | 'No sé'",
  "edad_aproximada": "'0-5' | '6-11' | '12-14' | '15-17' | 'No sé' | null",
  "tipo_trabajo": "'Venta ambulante' | 'Limpieza de parabrisas' | 'Mendicidad' | 'Carga y descarga' | 'Trabajo en comercio' | 'Campo' | 'Construcción' | 'Trabajo doméstico' | 'Recolección de residuos' | 'Otra actividad' | 'No sé'",
  "fecha_reporte": "string (ISO 8601 TIMESTAMP)",
  "riesgo": "'Bajo' | 'Medio' | 'Alto' | null"
}, ...]

* Aceptar un reporte (crea un caso), endpoint POST (/dashboard/reportes/{id}/aceptar)
sin cuerpo; respuesta:
{
  "id_caso": "number",
  "id_reporte": "number",
  "estatus_seguimiento": "'Canalizado'"
}

* Fusionar un reporte con un caso existente, endpoint POST (/dashboard/reportes/{id}/fusionar)
cuerpo:
{
  "id_caso": "number"
}
respuesta:
{
  "id_reporte": "number",
  "id_caso": "number",
  "estatus_seguimiento": "'Canalizado'"
}

* Rechazar un reporte, endpoint POST (/dashboard/reportes/{id}/rechazar)
sin cuerpo; respuesta:
{
  "id_reporte": "number",
  "id_caso": "null",
  "estatus_seguimiento": "'Rechazado'"
}

* Cambiar el seguimiento de un reporte que ya tiene caso, endpoint PATCH (/dashboard/reportes/{id}/estatus)
cuerpo:
{
  "estatus_seguimiento": "'Recibido' | 'En revisión' | 'Canalizado' | 'En atención' | 'Concluido' | 'Rechazado'"
}
respuesta:
{
  "id_reporte": "number",
  "estatus_seguimiento": "'Recibido' | 'En revisión' | 'Canalizado' | 'En atención' | 'Concluido' | 'Rechazado'"
}

* Sacar un reporte de su caso, endpoint POST (/dashboard/reportes/{id}/desvincular)
sin cuerpo; respuesta:
{
  "id_reporte": "number",
  "id_caso": "null",
  "estatus_seguimiento": "'En revisión'"
}
*/

import type { FeatureCollection, Point } from "geojson";

/** Follow-up status of a report */
export type EstatusSeguimiento =
  | "Recibido"
  | "En revisión"
  | "Canalizado"
  | "En atención"
  | "Concluido"
  | "Rechazado";

/** Number of minors in a report */
export type CantidadNNA = 1 | 2 | 3 | 4 | "5 o más" | "No sé";

/** Approximate age range of the minors */
export type EdadAproximada = "0-5" | "6-11" | "12-14" | "15-17" | "No sé";

// lists also used as dropdown options
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
] as const;

export type TipoTrabajo = (typeof WORK_TYPES)[number];

export const RISK_LEVELS = ["Bajo", "Medio", "Alto"] as const;

export type Riesgo = (typeof RISK_LEVELS)[number];

/** Report as the API returns it */
export interface Reporte {
  id_reporte: number;
  id_usuario: number | null;
  id_caso: number | null;
  ubicacion: Ubicacion;
  folio_reporte: string;
  estatus_seguimiento: EstatusSeguimiento | null;
  cantidad_nna: CantidadNNA;
  edad_aproximada: EdadAproximada | null;
  tipo_trabajo: TipoTrabajo;
  descripcion: string | null;
  fecha_reporte: string; // ISO 8601 TIMESTAMP
  imagen: string | null;
  riesgo: Riesgo | null;
}


/** Place of a report or case */
export interface Ubicacion {
  municipio: string;
  colonia: string;
  calle: string;
  lat: number;
  lng: number;
}


/** Properties of each report point of the map. Only flat and minimal data is sent; the detail is requested on selection */
export type FeatureReportProps = {
  id: string;
  risk: Riesgo | null;
  nna: CantidadNNA;
  approx_age: EdadAproximada | null;
  status: EstatusSeguimiento | null;
  report_date: string;
  hour: number;                    // 0-23 hrs
  weekday: number;                 // 0 = sunday ... 6 = saturday
  days_unattended: number | null;  // null if the report already has a case
};

// property of FeatureReportProps used to color the report circles
export type ReportVisual = "risk" | "nna" | "approx_age" | "days_unattended";

/** Milliseconds in a day */
export const MS_DAY = 1000 * 60 * 60 * 24;

/**
 * Converts reports to GeoJSON points for the map
 *
 * @param reports - Reports to draw
 * @param currDate - Date used to count the days unattended
 */
export const reports2GeoJSON = (
  reports: Reporte[],
  currDate: Date = new Date(),
): FeatureCollection<Point, FeatureReportProps> => ({
    type: "FeatureCollection",
    features: reports.flatMap((r) => {
      const { ubicacion } = r
      const date = new Date(r.fecha_reporte);
      const noCase = r.id_caso === null;

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
          hour: date.getHours(),
          weekday: date.getDay(),
          days_unattended: noCase
            ? Math.floor((currDate.getTime() - date.getTime()) / MS_DAY)
            : null,
        }
      }];
    }),
  })
