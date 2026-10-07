/* 
* JSON de Reporte, endpoint (/dashboard/reportes/{id})
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
  "estatus_seguimiento": "'Recibido' | 'En revisión' | 'Canalizado' | 'En atención' | 'Concluido' | null",
  "cantidad_nna": "1 | 2 | 3 | 4 | '5 o más' | 'No sé'",
  "edad_aproximada": "'0-5' | '6-11' | '12-14' | '15-17' | 'No sé' | null",
  "tipo_trabajo": "'Venta ambulante' | 'Limpieza de parabrisas' | 'Mendicidad' | 'Carga y descarga' | 'Trabajo en comercio' | 'Campo' | 'Construcción' | 'Trabajo doméstico' | 'Recolección de residuos' | 'Otra actividad' | 'No sé'",
  "descripcion": "string | null",
  "fecha_reporte": "string (ISO 8601 TIMESTAMP)",
  "imagen": "string | null",
  "riesgo": "'Bajo' | 'Medio' | 'Alto' | null"
}
* JSON de Reporte, endpoint (/dashboard/reportes)
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
  "estatus_seguimiento": "'Recibido' | 'En revisión' | 'Canalizado' | 'En atención' | 'Concluido' | null",
  "cantidad_nna": "1 | 2 | 3 | 4 | '5 o más' | 'No sé'",
  "edad_aproximada": "'0-5' | '6-11' | '12-14' | '15-17' | 'No sé' | null",
  "tipo_trabajo": "'Venta ambulante' | 'Limpieza de parabrisas' | 'Mendicidad' | 'Carga y descarga' | 'Trabajo en comercio' | 'Campo' | 'Construcción' | 'Trabajo doméstico' | 'Recolección de residuos' | 'Otra actividad' | 'No sé'",
  "fecha_reporte": "string (ISO 8601 TIMESTAMP)",
  "riesgo": "'Bajo' | 'Medio' | 'Alto' | null"
}, ...]
*/

import type { FeatureCollection, Point } from "geojson";

export type EstatusSeguimiento =
  | "Recibido"
  | "En revisión"
  | "Canalizado"
  | "En atención"
  | "Concluido"
  | "Rechazado";

export type CantidadNNA = 1 | 2 | 3 | 4 | "5 o más" | "No sé";

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


export interface Ubicacion {
  municipio: string;
  colonia: string;
  calle: string;
  lat: number;
  lng: number;
}


// ---------- Conversión a GeoJSON para el mapa ----------
// Solo se mandan propiedades planas y mínimas: el detalle se pide a la API al seleccionar.

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

export const MS_DAY = 1000 * 60 * 60 * 24;

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
