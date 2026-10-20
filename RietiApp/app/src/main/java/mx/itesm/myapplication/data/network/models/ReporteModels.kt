package mx.itesm.myapplication.data.network.models

import com.google.gson.annotations.SerializedName

/**
 * Opciones para la cantidad estimada de niñas, niños o adolescentes observados
 *
 * @property etiqueta Texto que se muestra al usuario
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
 * Opciones para el rango de edad aproximado observado
 *
 * @property etiqueta Texto que se muestra al usuario
 */
enum class RangoEdad(val etiqueta: String) {
    DE_0_A_5("0-5"),
    DE_6_A_11("6-11"),
    DE_12_A_14("12-14"),
    DE_15_A_17("15-17"),
    NO_SE("No sé")
}

/**
 * Opciones para el tipo de actividad o trabajo observado
 *
 * @property etiqueta Texto que se muestra al usuario
 */
enum class Actividad(val etiqueta: String) {
    VENTA_AMBULANTE("Venta ambulante"),
    LIMPIEZA_PARABRISAS("Limpieza de parabrisas"),
    MENDICIDAD("Mendicidad Forzada"),
    CARGA_DESCARGA("Carga y descarga"),
    TRABAJO_EN_COMERCIO("Trabajo en comercio"),
    CAMPO("Campo"),
    CONSTRUCCION("Construcción"),
    TRABAJO_DOMESTICO("Trabajo Doméstico"),
    RECOLECCION_RESIDUOS("Recolección de residuos"),
    OTRA_ACTIVIDAD("Otra actividad"),
    NO_SE("No sé")
}

/**
 * Opciones para el nivel de riesgo observado en la situación
 *
 * @property etiqueta Texto que se muestra al usuario
 */
enum class Riesgo(val etiqueta: String) {
    ALTO("Alto"),
    MEDIO("Medio"),
    BAJO("Bajo")
}

/**
 * Ubicación que se envía junto con un reporte
 *
 * @property municipio Nombre del municipio, tal como lo valida el backend
 * @property colonia Colonia, opcional
 * @property calle Calle, opcional
 * @property longitud Coordenada de longitud en grados decimales
 * @property latitud Coordenada de latitud en grados decimales
 * @property referencia Referencia descriptiva del lugar, opcional
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
 * Petición para crear un reporte con `POST /reportes/`
 *
 * @property ubicacion Datos geográficos del reporte
 * @property cantidadNna Etiqueta de [CantidadNna]
 * @property edadAproximada Etiqueta de [RangoEdad]
 * @property tipoTrabajo Etiqueta de [Actividad]
 * @property descripcion Descripción de la situación, opcional
 * @property imagenContentType Tipo MIME de la imagen que se subirá después; `null` si no hay imagen
 * @property conSeguimiento `true` si la persona quiere seguir el reporte con su cuenta; `false` si es anónimo
 * @property riesgo Etiqueta de [Riesgo], opcional
 */
data class ReporteCreateRequest(
    @SerializedName("ubicacion") val ubicacion: UbicacionCreateRequest,
    @SerializedName("cantidad_nna") val cantidadNna: String,
    @SerializedName("edad_aproximada") val edadAproximada: String,
    @SerializedName("tipo_trabajo") val tipoTrabajo: String,
    @SerializedName("descripcion") val descripcion: String? = null,
    @SerializedName("imagen_content_type") val imagenContentType: String? = null,
    @SerializedName("con_seguimiento") val conSeguimiento: Boolean,
    @SerializedName("riesgo") val riesgo: String? = null
)

/**
 * Respuesta de `POST /reportes/` al registrar un reporte
 *
 * @property idReporte Identificador único del reporte generado
 * @property folioReporte Folio generado por el backend, si lo devuelve
 * @property idUsuario Identificador del usuario asociado al reporte
 * @property idCaso Identificador del caso asociado, si ya tiene
 * @property idUbicacion Identificador de la ubicación guardada
 * @property urlSubidaImagen URL prefirmada para subir la imagen; `null` si no se pidió subir imagen
 * @property urlSubidaExpiraEn Fecha en que vence [urlSubidaImagen]
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
 * Municipio devuelto por `GET /municipios/`
 *
 * @property idMunicipio Identificador en la base de datos
 * @property nombre Nombre exacto, tal como lo valida el backend al crear un reporte
 * @property clave Clave del municipio, opcional
 */
data class MunicipioResponse(
    @SerializedName("id_municipio") val idMunicipio: Int,
    @SerializedName("nombre") val nombre: String,
    @SerializedName("clave") val clave: String? = null
)

/**
 * Ubicación de un reporte en el listado
 *
 * @property municipio Nombre del municipio
 * @property colonia Colonia
 * @property calle Calle
 * @property lat Latitud en grados decimales
 * @property lng Longitud en grados decimales
 */
data class UbicacionResumenResponse(
    @SerializedName("municipio") val municipio: String? = null,
    @SerializedName("colonia") val colonia: String? = null,
    @SerializedName("calle") val calle: String? = null,
    @SerializedName("lat") val lat: Double? = null,
    @SerializedName("lng") val lng: Double? = null
)

/**
 * Un reporte tal como lo devuelve `GET /reportes/`
 *
 * @property idReporte Identificador único del reporte
 * @property idCaso Identificador del caso asociado; `null` si el reporte aún no tiene caso
 * @property folioReporte Folio del reporte
 * @property fechaReporte Fecha de creación del reporte como la manda el API
 * @property descripcion Descripción de la situación
 * @property estatusSeguimiento Estatus con el que se da seguimiento al reporte
 * @property cantidadNna Etiqueta de [CantidadNna]
 * @property edadAproximada Etiqueta de [RangoEdad]
 * @property tipoTrabajo Etiqueta de [Actividad]
 * @property ubicacion Ubicación del reporte
 */
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