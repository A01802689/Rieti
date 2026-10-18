/** Kinds of record a log can refer to */
export const ENTITY_TYPES = ["usuario", "municipio", "reporte", "ubicacion", "caso"] as const

/** Kind of record a log refers to */
export type EntityType = (typeof ENTITY_TYPES)[number]

/** Name of each kind of record, as the page shows it */
export const ENTITY_LABELS: Record<EntityType, string> = {
  usuario: "Usuario",
  municipio: "Municipio",
  reporte: "Reporte",
  ubicacion: "Ubicación",
  caso: "Caso",
}

/** Entry of the audit log */
export interface Log {
  id_logs: number
  id_usuario: number
  usuario: string // display name of id_usuario
  action: string
  entity_type: EntityType
  id_registro_afectado: number
  before_data: Record<string, unknown>
  after_data: Record<string, unknown> | null
  fecha: string // ISO 8601 TIMESTAMP without zone (UTC), read it with parseApiDate
}

/** Query of the logs list; every field is optional */
export interface LogsQuery {
  /** Keeps only this kind of record; every kind when missing */
  entity_type?: EntityType
  /** Text to look for in the name of the user, the action or the id of the record; ignored when empty */
  buscar?: string
  /** Page size, from 1 to 500; the API uses 100 when missing */
  limite?: number
  /** Number of newest logs to skip, to get the next page */
  desplazamiento?: number
}
