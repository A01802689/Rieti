// import { type expression } from "maplibre-gl";
import type { CaseState, CaseUrgency, Caso, CasoListado, Municipio, Seguimiento } from "../types/Case"
import type { CantidadNNA, EdadAproximada, TipoTrabajo } from "../types/Report"
import { ubicaciones } from "./reports"
import { api } from "./client";

/** Lista completa para que el VM filtre; getCases conserva el origen simulado actual. */
export const listCases = () => api<CasoListado[]>("/casos")

export const changeCaseQuantity = (id: number, cantidad_nna: CantidadNNA) =>
  api<{ id_caso: number; cantidad_nna: CantidadNNA }>(`/casos/${id}/cantidad-nna`, {
    method: "PATCH", body: JSON.stringify({ cantidad_nna }),
  })

export const changeCaseAge = (id: number, edad_aproximada: EdadAproximada) =>
  api<{ id_caso: number; edad_aproximada: EdadAproximada }>(`/casos/${id}/edad-aproximada`, {
    method: "PATCH", body: JSON.stringify({ edad_aproximada }),
  })

export const changeCaseWorkType = (id: number, tipo_trabajo: TipoTrabajo) =>
  api<{ id_caso: number; tipo_trabajo: TipoTrabajo }>(`/casos/${id}/tipo-trabajo`, {
    method: "PATCH", body: JSON.stringify({ tipo_trabajo }),
  })

// this one works as api fetcher
// here will be the fetch done


/** Simulates the cases endpoint; it will become a fetch */
/**
 * Fetches api cases array
 * @returns Caso[]
 */
// export const getCases = () => api<Caso[]>(`/casos`, {method: "GET"})  

/**
 * 
 * @param id of case
 * @returns case detail
 */
export const getCase = (id: number) => api<Caso>(`/casos/${id}`,{method: "GET"} )

/**
 * 
 * @param id of case
 * @param state to be placed in the case
 * @returns case updated detail
 */
export const changeCaseState = (id: number, state: CaseState) => api<Caso>(`/casos/${id}/estado`, 
  { method: "PATCH",
    body: JSON.stringify({
      estado: state
    })
  })

  /**
   * 
   * @param id of case
   * @param municipality to be assigned 
   * @returns case updated detail
   */
export const transferCase = (id: number, municipality: string) => api<Caso>(`/casos/${id}/transferir`, 
  { method: "PUT",
    body: JSON.stringify({
      municipio: municipality
    })
  }
)

/**
 * 
 * @param id of case
 * @param note note to be assigned
 * @returns "seguimiento" log detail
 */
export const addNote2Case = (id: number, note: string) => api<Seguimiento>(`/casos/${id}/notas`,
  { method: "POST",
    body: JSON.stringify({
      nota: note
    })
  }
)

/**
 * 
 * @param id of case
 * @param urgency to be assigned
 * @returns case id and urgency updated
 */
export const changeUrgency = (id: number, urgency: CaseUrgency) => api<{id_caso: number, urgencia: CaseUrgency}>(`/casos/${id}/urgencia`,{
  method: "PATCH",
  body: JSON.stringify({
    urgencia: urgency
  })
})



    //? Emulator 
export const getCases = async (): Promise<Caso[]>  => cases1

const municipio: Municipio = { nombre: "Atizapán de Zaragoza" }

/** Hardcoded cases used while the endpoint does not exist */
const cases1: Caso[] = [
  {
    id_caso: 1, municipio: municipio, ubicacion: ubicaciones[0],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Cerrado", fecha_caso: "2026-08-03T18:42:10-06:00", urgencia: "Media", cantidad_nna: 2,
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 1.",
  },
  {
    id_caso: 2, municipio: municipio, ubicacion: ubicaciones[1],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "En desarrollo", fecha_caso: "2026-08-05T06:15:33-06:00", urgencia: "Alta", cantidad_nna: 3,
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 2.",
  },
  {
    id_caso: 3, municipio: municipio, ubicacion: ubicaciones[2],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Abierto", fecha_caso: "2026-08-18T17:30:00-06:00", urgencia: "Media", cantidad_nna: "5 o más",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 2.",
  },
  {
    id_caso: 4, municipio: municipio, ubicacion: ubicaciones[7],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Cerrado", fecha_caso: "2026-07-28T16:20:05-06:00", urgencia: "Baja", cantidad_nna: 1,
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 1.",
  },
  {
    id_caso: 5, municipio: municipio, ubicacion: ubicaciones[10],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "En desarrollo", fecha_caso: "2026-08-30T09:12:14-06:00", urgencia: "Alta", cantidad_nna: 4,
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 1.",
  },
  {
    id_caso: 6, municipio: municipio, ubicacion: ubicaciones[3],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Abierto", fecha_caso: "2026-08-12T05:20:48-06:00", urgencia: "Alta", cantidad_nna: "5 o más",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 1.",
  },
  {
    id_caso: 7, municipio: municipio, ubicacion: ubicaciones[11],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Cerrado", fecha_caso: "2026-07-15T09:30:00-06:00", urgencia: "Media", cantidad_nna: 1,
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 1.",
  },
  {
    id_caso: 8, municipio: municipio, ubicacion: ubicaciones[0],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "En desarrollo", fecha_caso: "2026-07-06T21:39:51-06:00", urgencia: "Alta", cantidad_nna: "5 o más",
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 2.",
  },
  {
    id_caso: 9, municipio: municipio, ubicacion: ubicaciones[23],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Cerrado", fecha_caso: "2026-07-16T15:57:33-06:00", urgencia: "Alta", cantidad_nna: 4,
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 2.",
  },
  {
    id_caso: 10, municipio: municipio, ubicacion: ubicaciones[24],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Abierto", fecha_caso: "2026-08-15T02:02:58-06:00", urgencia: "Media", cantidad_nna: 1,
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 1.",
  },
  {
    id_caso: 11, municipio: municipio, ubicacion: ubicaciones[26],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "En desarrollo", fecha_caso: "2026-07-08T03:33:57-06:00", urgencia: "Alta", cantidad_nna: "5 o más",
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 4.",
  },
  {
    id_caso: 12, municipio: municipio, ubicacion: ubicaciones[12],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Cerrado", fecha_caso: "2026-07-18T21:51:39-06:00", urgencia: "Alta", cantidad_nna: 2,
    notas: "Caso concluido; se confirmó la atención y el seguimiento con la familia. Reportes asociados: 2.",
  },
  {
    id_caso: 13, municipio: municipio, ubicacion: ubicaciones[13],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Abierto", fecha_caso: "2026-08-17T08:56:04-06:00", urgencia: "Alta", cantidad_nna: "5 o más",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 1.",
  },
  {
    id_caso: 14, municipio: municipio, ubicacion: ubicaciones[14],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "En desarrollo", fecha_caso: "2026-07-28T15:09:21-06:00", urgencia: "Alta", cantidad_nna: 4,
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 3.",
  },
  {
    id_caso: 15, municipio: municipio, ubicacion: ubicaciones[19],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Abierto", fecha_caso: "2026-07-15T06:06:54-06:00", urgencia: "Media", cantidad_nna: 2,
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 2.",
  },
  {
    id_caso: 16, municipio: municipio, ubicacion: ubicaciones[20],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Abierto", fecha_caso: "2026-09-03T10:58:02-06:00", urgencia: "Media", cantidad_nna: "5 o más",
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 1.",
  },
  {
    id_caso: 17, municipio: municipio, ubicacion: ubicaciones[21],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "Abierto", fecha_caso: "2026-08-14T17:11:19-06:00", urgencia: "Media", cantidad_nna: 2,
    notas: "Caso canalizado a la instancia correspondiente; pendiente de primera visita. Reportes asociados: 2.",
  },
  {
    id_caso: 18, municipio: municipio, ubicacion: ubicaciones[3],
    edad_aproximada: "No sé", tipo_trabajo: "No sé",
    estado: "En desarrollo", fecha_caso: "2026-07-02T21:03:27-06:00", urgencia: "Media", cantidad_nna: 3,
    notas: "Caso en seguimiento por el equipo; se realizan visitas y entrevistas con la familia. Reportes asociados: 2.",
  },
];


