/* JSON de Reporte
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
*/

import type { FeatureCollection, Point } from "geojson";

export type EstatusSeguimiento =
  | "Recibido"
  | "En revisión"
  | "Canalizado"
  | "En atención"
  | "Concluido";

export type CantidadNNA = 1 | 2 | 3 | 4 | "5 o más" | "No sé";

export type EdadAproximada = "0-5" | "6-11" | "12-14" | "15-17" | "No sé";

export type TipoTrabajo =
  | "Venta ambulante"
  | "Limpieza de parabrisas"
  | "Mendicidad"
  | "Carga y descarga"
  | "Trabajo en comercio"
  | "Campo"
  | "Construcción"
  | "Trabajo doméstico"
  | "Recolección de residuos"
  | "Otra actividad"
  | "No sé";

export type Riesgo = "Bajo" | "Medio" | "Alto";

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
  folio: string;
  riesgo: Riesgo | null;
  nna: CantidadNNA;
  tipo_trabajo: TipoTrabajo;
  edad_aproximada: EdadAproximada | null;
  estatus: EstatusSeguimiento | null;
  case: boolean;
  fecha_reporte: string;
  hora: number;              // 0-23 hrs
  dia_semana: number;        // 0 = sunday ... 6 = saturday
  dias_sin_atender: number | null; // if case doesnt exists
};

const MS_DAY = 1000 * 60 * 60 * 24;

export function reports2GeoJSON(
  reports: Reporte[],
  currDate: Date = new Date(),
): FeatureCollection<Point, FeatureReportProps> {

  return {
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
          folio: r.folio_reporte,
          riesgo: r.riesgo,
          nna: r.cantidad_nna,
          tipo_trabajo: r.tipo_trabajo,
          edad_aproximada: r.edad_aproximada,
          estatus: r.estatus_seguimiento,
          case: !noCase,
          fecha_reporte: r.fecha_reporte,
          hora: date.getHours(),
          dia_semana: date.getDay(),
          dias_sin_atender: noCase
            ? Math.floor((currDate.getTime() - date.getTime()) / MS_DAY)
            : null,
        },
      }];
    }),
  };
}