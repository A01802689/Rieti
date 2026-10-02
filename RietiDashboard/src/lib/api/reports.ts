import type { Ubicacion, Reporte } from "../types/Report"

// this one works as api fetcher
// here will be the fetch done
// ---------- Locations (Atizapán de Zaragoza, coordenadas aproximadas) ----------

export const ubicaciones: Ubicacion[] = [
  { municipio: "Atizapán de Zaragoza", colonia: "Centro", calle: "Av. Adolfo López Mateos", lat: 19.5631, lng: -99.2538 },
  { municipio: "Atizapán de Zaragoza", colonia: "Lomas de Bellavista", calle: "Blvd. Manuel Ávila Camacho", lat: 19.553, lng: -99.231 },
  { municipio: "Atizapán de Zaragoza", colonia: "Las Alamedas", calle: "Av. Las Alamedas", lat: 19.5805, lng: -99.2365 },
  { municipio: "Atizapán de Zaragoza", colonia: "Condado de Sayavedra", calle: "Av. Sayavedra", lat: 19.556, lng: -99.266 },
  { municipio: "Atizapán de Zaragoza", colonia: "Villas de la Hacienda", calle: "Calle Hacienda de Santa Fe", lat: 19.592, lng: -99.24 },
  { municipio: "Atizapán de Zaragoza", colonia: "Ciudad López Mateos", calle: "Av. Calacoaya", lat: 19.57, lng: -99.278 },
  { municipio: "Atizapán de Zaragoza", colonia: "Lomas de Atizapán", calle: "Calle Lomas Verdes", lat: 19.547, lng: -99.254 },
  { municipio: "Atizapán de Zaragoza", colonia: "El Capulín", calle: "Calle Capulín", lat: 19.552, lng: -99.248 },
  { municipio: "Atizapán de Zaragoza", colonia: "Mayorazgos del Bosque", calle: "Calle Mayorazgo", lat: 19.575, lng: -99.266 },
  { municipio: "Atizapán de Zaragoza", colonia: "Las Américas", calle: "Av. de las Américas", lat: 19.544, lng: -99.262 },
  { municipio: "Atizapán de Zaragoza", colonia: "San Mateo Tecoloapan", calle: "Camino a San Mateo", lat: 19.581, lng: -99.274 },
  { municipio: "Atizapán de Zaragoza", colonia: "Jardines de Atizapán", calle: "Calle Jardín Central", lat: 19.56, lng: -99.24 },
];

// ---------- Reportes ----------
// Reglas de consistencia usadas:
// - "Recibido" / "En revisión" -> id_caso null (aún sin caso)
// - "Canalizado" / "En atención" / "Concluido" -> con id_caso
// - id_usuario null = reporte anónimo
// - Hay reportes repetidos en el mismo lugar/caso para probar agrupación
// - ubicacion apunta a ubicaciones[n] (id_ubicacion anterior = n + 1)

export const reports: Reporte[] = [
  {
    id_reporte: 1, id_usuario: 12, id_caso: 1, ubicacion: ubicaciones[0],
    folio_reporte: "RIETI-2026-00001", estatus_seguimiento: "Concluido",
    cantidad_nna: 2, edad_aproximada: "6-11", tipo_trabajo: "Venta ambulante",
    descripcion: "Dos niños vendiendo dulces entre las mesas de un corredor peatonal.",
    fecha_reporte: "2026-08-03T18:42:10-06:00", imagen: "https://example.com/rieti/rpt-001.jpg", riesgo: "Medio",
  },
  {
    id_reporte: 2, id_usuario: null, id_caso: 2, ubicacion: ubicaciones[1],
    folio_reporte: "RIETI-2026-00002", estatus_seguimiento: "En atención",
    cantidad_nna: 3, edad_aproximada: "12-14", tipo_trabajo: "Carga y descarga",
    descripcion: "Menores cargando cajas de fruta desde camiones al interior del mercado.",
    fecha_reporte: "2026-08-05T06:15:33-06:00", imagen: "https://example.com/rieti/rpt-002.jpg", riesgo: "Alto",
  },
  {
    id_reporte: 3, id_usuario: 7, id_caso: 2, ubicacion: ubicaciones[1],
    folio_reporte: "RIETI-2026-00003", estatus_seguimiento: "En atención",
    cantidad_nna: 2, edad_aproximada: "12-14", tipo_trabajo: "Carga y descarga",
    descripcion: "Mismo punto del mercado, adolescentes descargando mercancía temprano.",
    fecha_reporte: "2026-08-06T06:40:02-06:00", imagen: null, riesgo: "Alto",
  },
  {
    id_reporte: 4, id_usuario: 3, id_caso: null, ubicacion: ubicaciones[4],
    folio_reporte: "RIETI-2026-00004", estatus_seguimiento: "Recibido",
    cantidad_nna: 1, edad_aproximada: "0-5", tipo_trabajo: "Mendicidad",
    descripcion: "Niño pequeño pidiendo dinero entre autos en un semáforo de noche.",
    fecha_reporte: "2026-09-25T21:10:45-06:00", imagen: "https://example.com/rieti/rpt-004.jpg", riesgo: "Alto",
  },
  {
    id_reporte: 5, id_usuario: null, id_caso: null, ubicacion: ubicaciones[5],
    folio_reporte: "RIETI-2026-00005", estatus_seguimiento: "En revisión",
    cantidad_nna: 1, edad_aproximada: "12-14", tipo_trabajo: "Limpieza de parabrisas",
    descripcion: "Adolescente limpiando parabrisas en el crucero principal.",
    fecha_reporte: "2026-09-20T13:05:12-06:00", imagen: null, riesgo: "Medio",
  },
  {
    id_reporte: 6, id_usuario: 21, id_caso: 3, ubicacion: ubicaciones[2],
    folio_reporte: "RIETI-2026-00006", estatus_seguimiento: "Canalizado",
    cantidad_nna: "5 o más", edad_aproximada: "6-11", tipo_trabajo: "Trabajo en comercio",
    descripcion: "Varios niños atendiendo puestos de ropa en horario escolar.",
    fecha_reporte: "2026-08-18T17:30:00-06:00", imagen: "https://example.com/rieti/rpt-006.jpg", riesgo: "Medio",
  },
  {
    id_reporte: 7, id_usuario: 9, id_caso: null, ubicacion: ubicaciones[3],
    folio_reporte: "RIETI-2026-00007", estatus_seguimiento: "Recibido",
    cantidad_nna: 4, edad_aproximada: "15-17", tipo_trabajo: "Carga y descarga",
    descripcion: "Adolescentes cargando bultos pesados en la madrugada.",
    fecha_reporte: "2026-09-02T04:55:21-06:00", imagen: null, riesgo: "Alto",
  },
  {
    id_reporte: 8, id_usuario: null, id_caso: null, ubicacion: ubicaciones[6],
    folio_reporte: "RIETI-2026-00008", estatus_seguimiento: "Recibido",
    cantidad_nna: 1, edad_aproximada: "6-11", tipo_trabajo: "Venta ambulante",
    descripcion: "Niña vendiendo chicles en el paradero acompañada de un adulto.",
    fecha_reporte: "2026-09-26T08:12:44-06:00", imagen: null, riesgo: "Bajo",
  },
  {
    id_reporte: 9, id_usuario: 14, id_caso: 4, ubicacion: ubicaciones[7],
    folio_reporte: "RIETI-2026-00009", estatus_seguimiento: "Concluido",
    cantidad_nna: 1, edad_aproximada: "15-17", tipo_trabajo: "Limpieza de parabrisas",
    descripcion: "Adolescente en crucero cercano a la terminal de autobuses.",
    fecha_reporte: "2026-07-28T16:20:05-06:00", imagen: "https://example.com/rieti/rpt-009.jpg", riesgo: "Bajo",
  },
  {
    id_reporte: 10, id_usuario: 2, id_caso: null, ubicacion: ubicaciones[8],
    folio_reporte: "RIETI-2026-00010", estatus_seguimiento: "En revisión",
    cantidad_nna: 2, edad_aproximada: "12-14", tipo_trabajo: "Campo",
    descripcion: "Menores trabajando en parcelas de hortalizas en la zona periférica.",
    fecha_reporte: "2026-09-13T10:02:37-06:00", imagen: "https://example.com/rieti/rpt-010.jpg", riesgo: "Medio",
  },
  {
    id_reporte: 11, id_usuario: null, id_caso: null, ubicacion: ubicaciones[9],
    folio_reporte: "RIETI-2026-00011", estatus_seguimiento: "Recibido",
    cantidad_nna: "No sé", edad_aproximada: "No sé", tipo_trabajo: "No sé",
    descripcion: null,
    fecha_reporte: "2026-09-24T19:47:59-06:00", imagen: null, riesgo: null,
  },
  {
    id_reporte: 12, id_usuario: 5, id_caso: 5, ubicacion: ubicaciones[10],
    folio_reporte: "RIETI-2026-00012", estatus_seguimiento: "En atención",
    cantidad_nna: 3, edad_aproximada: "6-11", tipo_trabajo: "Recolección de residuos",
    descripcion: "Niños separando material reciclable sin protección.",
    fecha_reporte: "2026-08-29T07:33:18-06:00", imagen: "https://example.com/rieti/rpt-012.jpg", riesgo: "Alto",
  },
  {
    id_reporte: 13, id_usuario: 18, id_caso: null, ubicacion: ubicaciones[11],
    folio_reporte: "RIETI-2026-00013", estatus_seguimiento: "Recibido",
    cantidad_nna: 1, edad_aproximada: "15-17", tipo_trabajo: "Construcción",
    descripcion: "Adolescente acarreando material en una obra.",
    fecha_reporte: "2026-09-10T11:45:00-06:00", imagen: null, riesgo: "Medio",
  },
  {
    id_reporte: 14, id_usuario: null, id_caso: null, ubicacion: ubicaciones[0],
    folio_reporte: "RIETI-2026-00014", estatus_seguimiento: "Recibido",
    cantidad_nna: 2, edad_aproximada: "0-5", tipo_trabajo: "Mendicidad",
    descripcion: "Dos niños pequeños pidiendo dinero afuera de un centro comercial.",
    fecha_reporte: "2026-09-27T12:30:15-06:00", imagen: "https://example.com/rieti/rpt-014.jpg", riesgo: "Alto",
  },
  {
    id_reporte: 15, id_usuario: 11, id_caso: 3, ubicacion: ubicaciones[2],
    folio_reporte: "RIETI-2026-00015", estatus_seguimiento: "Canalizado",
    cantidad_nna: 3, edad_aproximada: "12-14", tipo_trabajo: "Trabajo en comercio",
    descripcion: "Mismos puestos del reporte anterior, ahora adolescentes.",
    fecha_reporte: "2026-08-19T18:05:40-06:00", imagen: null, riesgo: "Medio",
  },
  {
    id_reporte: 16, id_usuario: 4, id_caso: null, ubicacion: ubicaciones[5],
    folio_reporte: "RIETI-2026-00016", estatus_seguimiento: "Recibido",
    cantidad_nna: 1, edad_aproximada: "12-14", tipo_trabajo: "Limpieza de parabrisas",
    descripcion: "Adolescente en el mismo crucero, ahora de noche.",
    fecha_reporte: "2026-09-21T20:18:27-06:00", imagen: null, riesgo: "Alto",
  },
  {
    id_reporte: 17, id_usuario: null, id_caso: null, ubicacion: ubicaciones[4],
    folio_reporte: "RIETI-2026-00017", estatus_seguimiento: "En revisión",
    cantidad_nna: 2, edad_aproximada: "6-11", tipo_trabajo: "Venta ambulante",
    descripcion: "Niños vendiendo flores entre autos después de las 10 pm.",
    fecha_reporte: "2026-09-15T22:40:09-06:00", imagen: "https://example.com/rieti/rpt-017.jpg", riesgo: "Alto",
  },
  {
    id_reporte: 18, id_usuario: 16, id_caso: 6, ubicacion: ubicaciones[3],
    folio_reporte: "RIETI-2026-00018", estatus_seguimiento: "Canalizado",
    cantidad_nna: "5 o más", edad_aproximada: "15-17", tipo_trabajo: "Carga y descarga",
    descripcion: "Grupo de adolescentes trabajando como cargadores en andenes.",
    fecha_reporte: "2026-08-12T05:20:48-06:00", imagen: "https://example.com/rieti/rpt-018.jpg", riesgo: "Alto",
  },
  {
    id_reporte: 19, id_usuario: 8, id_caso: null, ubicacion: ubicaciones[7],
    folio_reporte: "RIETI-2026-00019", estatus_seguimiento: "Recibido",
    cantidad_nna: 1, edad_aproximada: "No sé", tipo_trabajo: "Otra actividad",
    descripcion: "Menor repartiendo volantes durante varias horas.",
    fecha_reporte: "2026-09-18T15:55:30-06:00", imagen: null, riesgo: null,
  },
  {
    id_reporte: 20, id_usuario: null, id_caso: null, ubicacion: ubicaciones[1],
    folio_reporte: "RIETI-2026-00020", estatus_seguimiento: "Recibido",
    cantidad_nna: 1, edad_aproximada: "6-11", tipo_trabajo: "Venta ambulante",
    descripcion: "Niño vendiendo bolsas a la entrada del mercado.",
    fecha_reporte: "2026-09-01T14:10:22-06:00", imagen: null, riesgo: "Medio",
  },
  {
    id_reporte: 21, id_usuario: 10, id_caso: 7, ubicacion: ubicaciones[11],
    folio_reporte: "RIETI-2026-00021", estatus_seguimiento: "Concluido",
    cantidad_nna: 1, edad_aproximada: "12-14", tipo_trabajo: "Trabajo doméstico",
    descripcion: "Adolescente realizando labores domésticas en horario escolar.",
    fecha_reporte: "2026-07-15T09:30:00-06:00", imagen: null, riesgo: "Medio",
  },
  {
    id_reporte: 22, id_usuario: 19, id_caso: null, ubicacion: ubicaciones[8],
    folio_reporte: "RIETI-2026-00022", estatus_seguimiento: "Recibido",
    cantidad_nna: 3, edad_aproximada: "12-14", tipo_trabajo: "Campo",
    descripcion: "Menores cosechando en parcelas por la mañana.",
    fecha_reporte: "2026-09-23T07:05:51-06:00", imagen: "https://example.com/rieti/rpt-022.jpg", riesgo: "Bajo",
  },
  {
    id_reporte: 23, id_usuario: null, id_caso: null, ubicacion: ubicaciones[10],
    folio_reporte: "RIETI-2026-00023", estatus_seguimiento: "En revisión",
    cantidad_nna: 2, edad_aproximada: "12-14", tipo_trabajo: "Recolección de residuos",
    descripcion: "Adolescentes recolectando basura de un camión en movimiento.",
    fecha_reporte: "2026-09-08T08:40:33-06:00", imagen: null, riesgo: "Alto",
  },
  {
    id_reporte: 24, id_usuario: 6, id_caso: 5, ubicacion: ubicaciones[10],
    folio_reporte: "RIETI-2026-00024", estatus_seguimiento: "En atención",
    cantidad_nna: 4, edad_aproximada: "6-11", tipo_trabajo: "Recolección de residuos",
    descripcion: "Mismo punto de reciclaje, más niños que en el reporte anterior.",
    fecha_reporte: "2026-08-30T09:12:14-06:00", imagen: "https://example.com/rieti/rpt-024.jpg", riesgo: "Alto",
  },
  {
    id_reporte: 25, id_usuario: 13, id_caso: null, ubicacion: ubicaciones[9],
    folio_reporte: "RIETI-2026-00025", estatus_seguimiento: "Recibido",
    cantidad_nna: 1, edad_aproximada: "6-11", tipo_trabajo: "Limpieza de parabrisas",
    descripcion: "Niño limpiando parabrisas cerca de la medianoche.",
    fecha_reporte: "2026-09-26T23:02:08-06:00", imagen: null, riesgo: "Alto",
  },
];
