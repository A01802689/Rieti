import type { Case, Municipio } from "../types/Case"
import { ubicaciones } from "./reports"

// this one works as api fetcher
// here will be the fetch done

export const getCases = async (): Promise<Case[]> => cases

const municipio: Municipio = { nombre: "Atizapán de Zaragoza" }

export const cases: Case[] = [
  {
    id_caso: 1, municipio: municipio, ubicacion: ubicaciones[0],
    estado: "Cerrado", fecha_caso: "2026-08-03T18:42:10-06:00", urgencia: "Media",
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 1.",
  },
  {
    id_caso: 2, municipio: municipio, ubicacion: ubicaciones[1],
    estado: "En desarrollo", fecha_caso: "2026-08-05T06:15:33-06:00", urgencia: "Alta",
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 2.",
  },
  {
    id_caso: 3, municipio: municipio, ubicacion: ubicaciones[2],
    estado: "Abierto", fecha_caso: "2026-08-18T17:30:00-06:00", urgencia: "Media",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 2.",
  },
  {
    id_caso: 4, municipio: municipio, ubicacion: ubicaciones[7],
    estado: "Cerrado", fecha_caso: "2026-07-28T16:20:05-06:00", urgencia: "Baja",
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 1.",
  },
  {
    id_caso: 5, municipio: municipio, ubicacion: ubicaciones[10],
    estado: "En desarrollo", fecha_caso: "2026-08-30T09:12:14-06:00", urgencia: "Alta",
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 1.",
  },
  {
    id_caso: 6, municipio: municipio, ubicacion: ubicaciones[3],
    estado: "Abierto", fecha_caso: "2026-08-12T05:20:48-06:00", urgencia: "Alta",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 1.",
  },
  {
    id_caso: 7, municipio: municipio, ubicacion: ubicaciones[11],
    estado: "Cerrado", fecha_caso: "2026-07-15T09:30:00-06:00", urgencia: "Media",
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 1.",
  },
  {
    id_caso: 8, municipio: municipio, ubicacion: ubicaciones[0],
    estado: "En desarrollo", fecha_caso: "2026-07-06T21:39:51-06:00", urgencia: "Alta",
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 2.",
  },
  {
    id_caso: 9, municipio: municipio, ubicacion: ubicaciones[23],
    estado: "Cerrado", fecha_caso: "2026-07-16T15:57:33-06:00", urgencia: "Alta",
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 2.",
  },
  {
    id_caso: 10, municipio: municipio, ubicacion: ubicaciones[24],
    estado: "Abierto", fecha_caso: "2026-08-15T02:02:58-06:00", urgencia: "Media",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 1.",
  },
  {
    id_caso: 11, municipio: municipio, ubicacion: ubicaciones[26],
    estado: "En desarrollo", fecha_caso: "2026-07-08T03:33:57-06:00", urgencia: "Alta",
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 4.",
  },
  {
    id_caso: 12, municipio: municipio, ubicacion: ubicaciones[12],
    estado: "Cerrado", fecha_caso: "2026-07-18T21:51:39-06:00", urgencia: "Alta",
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 2.",
  },
  {
    id_caso: 13, municipio: municipio, ubicacion: ubicaciones[13],
    estado: "Abierto", fecha_caso: "2026-08-17T08:56:04-06:00", urgencia: "Alta",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 1.",
  },
  {
    id_caso: 14, municipio: municipio, ubicacion: ubicaciones[14],
    estado: "En desarrollo", fecha_caso: "2026-07-28T15:09:21-06:00", urgencia: "Alta",
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 3.",
  },
  {
    id_caso: 15, municipio: municipio, ubicacion: ubicaciones[19],
    estado: "Abierto", fecha_caso: "2026-07-15T06:06:54-06:00", urgencia: "Media",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 2.",
  },
  {
    id_caso: 16, municipio: municipio, ubicacion: ubicaciones[20],
    estado: "Abierto", fecha_caso: "2026-09-03T10:58:02-06:00", urgencia: "Media",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 1.",
  },
  {
    id_caso: 17, municipio: municipio, ubicacion: ubicaciones[21],
    estado: "Abierto", fecha_caso: "2026-08-14T17:11:19-06:00", urgencia: "Media",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 2.",
  },
  {
    id_caso: 18, municipio: municipio, ubicacion: ubicaciones[3],
    estado: "En desarrollo", fecha_caso: "2026-07-02T21:03:27-06:00", urgencia: "Media",
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 2.",
  },
];


