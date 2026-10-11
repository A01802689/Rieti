// Mirrors RietiAPI/app/models/logs.py
export type EntityType = "usuario" | "municipio" | "reporte" | "ubicacion" | "caso"

export interface Log {
  id_logs: number
  id_usuario: number
  usuario: string // display name of id_usuario
  action: string
  entity_type: EntityType
  id_registro_afectado: number
  before_data: Record<string, unknown>
  after_data: Record<string, unknown>
  fecha: string // ISO 8601 TIMESTAMP
}
