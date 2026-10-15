import type { Log } from "../types/Log"
import { api } from "./client"

// this one works as api fetcher
// here will be the fetch done

/**
 * log api fetcher
 * @returns Log array of changes and updated at system layer
 */
export const getLogs =  () => api<Log[]>(`/logs`, {method: "GET"})
export const getLogs1 = async (): Promise<Log[]> => logs1


 const logs1: Log[] = [
  {
    id_logs: 1, id_usuario: 1, usuario: "Admin Rieti", action: "Cambio de estado del caso",
    entity_type: "caso", id_registro_afectado: 2, fecha: "2026-09-02T10:14:00-06:00",
    before_data: { estado: "Abierto" }, after_data: { estado: "En desarrollo" },
  },
  {
    id_logs: 2, id_usuario: 2, usuario: "Alimentador 1", action: "Cambio de estado del reporte",
    entity_type: "reporte", id_registro_afectado: 14, fecha: "2026-09-02T09:40:12-06:00",
    before_data: { estado: "Recibido" }, after_data: { estado: "En revisión" },
  },
  {
    id_logs: 3, id_usuario: 1, usuario: "Admin Rieti", action: "Creación de usuario",
    entity_type: "usuario", id_registro_afectado: 5, fecha: "2026-09-01T16:05:44-06:00",
    before_data: {}, after_data: { nombre: "Alimentador 2", rol: "alimentador" },
  },
  {
    id_logs: 4, id_usuario: 2, usuario: "Alimentador 1", action: "Corrección de ubicación",
    entity_type: "ubicacion", id_registro_afectado: 8, fecha: "2026-08-31T12:21:09-06:00",
    before_data: { calle: "Av. Adolfo López Mateos" }, after_data: { calle: "Av. Adolfo Ruiz Cortines" },
  },
  {
    id_logs: 5, id_usuario: 1, usuario: "Admin Rieti", action: "Cierre de caso",
    entity_type: "caso", id_registro_afectado: 4, fecha: "2026-08-30T18:02:31-06:00",
    before_data: { estado: "En desarrollo" }, after_data: { estado: "Cerrado" },
  },
]
