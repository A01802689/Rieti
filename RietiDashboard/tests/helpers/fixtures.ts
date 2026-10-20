import type { Caso } from '@/lib/types/Case'
import type { Log } from '@/lib/types/Log'
import type { Reporte } from '@/lib/types/Report'
import type { User } from '@/lib/types/User'

/**
 * Builds a report with a valid location
 *
 * @param overrides - Fields that differ from the default
 * @returns The report
 */
export const makeReport = (overrides: Partial<Reporte> = {}): Reporte => ({
  id_reporte: 1,
  id_usuario: 5,
  id_caso: null,
  ubicacion: { municipio: 'Atizapán de Zaragoza', colonia: 'Centro', calle: 'Calle 1', lat: 19.57, lng: -99.25 },
  folio_reporte: 'REP-2026-0001',
  estatus_seguimiento: 'Recibido',
  cantidad_nna: 2,
  edad_aproximada: '6-11',
  tipo_trabajo: 'Venta ambulante',
  descripcion: 'Niño vendiendo dulces',
  fecha_reporte: '2026-03-05T18:30:00',
  imagen: null,
  riesgo: 'Medio',
  ...overrides,
})

/**
 * Builds a case with a valid location
 *
 * @param overrides - Fields that differ from the default
 * @returns The case
 */
export const makeCase = (overrides: Partial<Caso> = {}): Caso => ({
  id_caso: 3,
  municipio: { nombre: 'Atizapán de Zaragoza' },
  ubicacion: { municipio: 'Atizapán de Zaragoza', colonia: 'Centro', calle: 'Calle 1', lat: 19.57, lng: -99.25 },
  estado: 'Abierto',
  cantidad_nna: 2,
  edad_aproximada: '6-11',
  tipo_trabajo: 'Campo',
  fecha_caso: '2026-03-01T12:00:00',
  notas: null,
  urgencia: 'Alta',
  cantidad_reportes: 1,
  ...overrides,
})

/**
 * Builds a user of the users endpoints
 *
 * @param overrides - Fields that differ from the default Alimentador
 * @returns The user
 */
export const makeStoredUser = (overrides: Partial<User> = {}): User => ({
  id_usuario: 10,
  nombre: 'Luis',
  apellido: 'Gómez',
  correo: 'luis@correo.mx',
  rol: 'Alimentador',
  id_municipio: 1,
  municipio: { id_municipio: 1, nombre: 'Atizapán de Zaragoza', clave: '013' },
  ultimo_acceso: '2026-03-05T18:30:00',
  permisos: ['reports.view'],
  ...overrides,
})

/**
 * Builds a log entry
 *
 * @param overrides - Fields that differ from the default
 * @returns The log
 */
export const makeLog = (overrides: Partial<Log> = {}): Log => ({
  id_logs: 1,
  id_usuario: 1,
  usuario: 'Ana Pérez',
  action: 'Actualizar',
  entity_type: 'reporte',
  id_registro_afectado: 9,
  before_data: { estatus: 'Recibido' },
  after_data: { estatus: 'Canalizado' },
  fecha: '2026-03-05T18:30:00',
  ...overrides,
})
