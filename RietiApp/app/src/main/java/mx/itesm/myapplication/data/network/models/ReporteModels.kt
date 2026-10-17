package mx.itesm.myapplication.data.network.models

import com.google.gson.annotations.SerializedName

/**
 * Opciones para la cantidad estimada de niñas, niños o adolescentes observados.
 */
enum class CantidadNna(val etiqueta: String) {
    UNO("1"),
    DOS("2"),
    TRES("3"),
    CUATRO("4"),
    CINCO_O_MAS("5 o más"),
    NO_SE("No sé")
}

/**
 * Opciones para el rango de edad aproximado observado.
 */
enum class RangoEdad(val etiqueta: String) {
    DE_0_A_5("0-5"),
    DE_6_A_11("6-11"),
    DE_12_A_14("12-14"),
    DE_15_A_17("15-17"),
    NO_SE("No sé")
}

/**
 * Opciones para el tipo de actividad o trabajo observado.
 */
enum class Actividad(val etiqueta: String) {
    VENTA_AMBULANTE("Venta ambulante"),
    LIMPIEZA_PARABRISAS("Limpieza de parabrisas"),
    MENDICIDAD("Mendicidad"),
    CARGA_DESCARGA("Carga y descarga"),
    TRABAJO_EN_COMERCIO("Trabajo en comercio"),
    CAMPO("Campo"),
    CONSTRUCCION("Construcción"),
    TRABAJO_DOMESTICO("Trabajo doméstico"),
    RECOLECCION_RESIDUOS("Recolección de residuos"),
    OTRA_ACTIVIDAD("Otra actividad"),
    NO_SE("No sé")
}

/**
 * Opciones para el nivel de riesgo observado en la situación.
 */
enum class Riesgo(val etiqueta: String) {
    SI("Sí"),
    NO("No"),
    NO_SE("No se")
}

/**
 * Modelo DTO para enviar la información geográfica asociada a un reporte.
 *
 * @property latitud Coordenada de latitud en grados decimales.
 * @property longitud Coordenada de longitud en grados decimales.
 * @property direccion Dirección descriptiva opcional del lugar.
 */
data class UbicacionCreateRequest(
    @SerializedName("municipio") val municipio: String? = null,
    @SerializedName("colonia") val colonia: String? = null,
    @SerializedName("calle") val calle: String? = null,
    @SerializedName("longitud") val longitud: Double? = null,
    @SerializedName("latitud") val latitud: Double? = null,
    @SerializedName("referencia") val referencia: String? = null
)

/**
 * Modelo de petición DTO para crear y registrar un nuevo reporte en la plataforma.
 *
 * @property ubicacion Datos geográficos del reporte.
 * @property cantidadNna Código de [CantidadNna].
 * @property edadAproximada Código de [RangoEdad].
 * @property tipoTrabajo Código de [Actividad].
 * @property descripcion Descripción de la situación, opcional.
 * @property anonimo `true` si el reporte es anónimo.
 * @property nombre Nombre(s) de contacto (solo con seguimiento).
 * @property apellidos Apellidos de contacto (solo con seguimiento).
 * @property telefono Teléfono de contacto (solo con seguimiento).
 * @property imagen Imagen adjunta codificada, opcional (pendiente de implementar).
 */
data class ReporteCreateRequest(
    @SerializedName("ubicacion") val ubicacion: UbicacionCreateRequest,
    @SerializedName("cantidad_nna") val cantidadNna: String,
    @SerializedName("edad_aproximada") val edadAproximada: String,
    @SerializedName("tipo_trabajo") val tipoTrabajo: String,
    @SerializedName("descripcion") val descripcion: String? = null,
    @SerializedName("imagen_content_type") val imagenContentType: String? = null,
    @SerializedName("con_seguimiento") val conSeguimiento: Boolean
)

/**
 * Modelo de respuesta DTO devuelto al registrar exitosamente un nuevo reporte.
 *
 * @property idReporte Identificador único del reporte generado.
 * @property idUsuario Identificador del usuario asociado al reporte.
 * @property idCaso Identificador único del caso abierto en el sistema.
 * @property folio Folio generado por back, si lo devuelve
 */
data class ReporteResponse(
    @SerializedName("id_reporte") val idReporte: Int,
    @SerializedName("folio_reporte") val folioReporte: String? = null,
    @SerializedName("id_usuario") val idUsuario: Int? = null,
    @SerializedName("id_caso") val idCaso: Int? = null,
    @SerializedName("id_ubicacion") val idUbicacion: Int? = null,
    @SerializedName("url_subida_imagen") val urlSubidaImagen: String? = null,
    @SerializedName("url_subida_expira_en") val urlSubidaExpiraEn: String? = null
)

/**
 * Municipio devuelto por el backend.
 *
 * @property idMunicipio Identificador en la base de datos.
 * @property nombre Nombre exacto, tal como lo valida el backend al crear un reporte.
 */
data class MunicipioResponse(
    @SerializedName("id_municipio") val idMunicipio: Int,
    @SerializedName("nombre") val nombre: String,
    @SerializedName("clave") val clave: String? = null
)

/** Ubicación de un reporte en el listado. */
data class UbicacionResumenResponse(
    @SerializedName("municipio") val municipio: String? = null,
    @SerializedName("colonia") val colonia: String? = null,
    @SerializedName("calle") val calle: String? = null,
    @SerializedName("lat") val lat: Double? = null,
    @SerializedName("lng") val lng: Double? = null
)

/** Un reporte tal como lo devuelve `GET /reportes/`. */
data class ReporteListadoResponse(
    @SerializedName("id_reporte") val idReporte: Int,
    @SerializedName("id_caso") val idCaso: Int? = null,
    @SerializedName("folio_reporte") val folioReporte: String? = null,
    @SerializedName("fecha_reporte") val fechaReporte: String? = null,
    @SerializedName("descripcion") val descripcion: String? = null,
    @SerializedName("estatus_seguimiento") val estatusSeguimiento: String? = null,
    @SerializedName("cantidad_nna") val cantidadNna: String? = null,
    @SerializedName("edad_aproximada") val edadAproximada: String? = null,
    @SerializedName("tipo_trabajo") val tipoTrabajo: String? = null,
    @SerializedName("ubicacion") val ubicacion: UbicacionResumenResponse? = null
)