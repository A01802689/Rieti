package mx.itesm.myapplication.data.network.models

import com.google.gson.annotations.SerializedName

/**
 * Opciones para la cantidad estimada de niñas, niños o adolescentes observados.
 */
enum class CantidadNna(val etiqueta: String, val valorApi: String) {
    UNO("1", "1"),
    DOS("2", "2"),
    TRES("3", "3"),
    CINCO_O_MAS("5 o más", "5_o_mas"),
    NO_SE("No se", "no_se")
}

/**
 * Opciones para el rango de edad aproximado observado.
 */
enum class RangoEdad(val etiqueta: String, val valorApi: String) {
    DE_0_A_5("0-5", "0-5"),
    DE_6_A_11("6-11", "6-11"),
    DE_12_A_14("12-14","12-14"),
    DE_15_A_17("15-17", "15-17"),
    NO_SE("No se", "no_se")
}

/**
 * Opciones para el tipo de actividad o trabajo observado.
 */
enum class Actividad(val etiqueta: String, val valorApi: String) {
    VENTA_AMBULANTE("Venta ambulante", "venta_ambulante"),
    LIMPIEZA_DE_PARABRISAS("Limpieza de parabrisas", "limpieza_parabrisas"),
    MENDICIDAD("Mendicidad", "mendicidad"),
    CARGA_Y_DESCARGA("Carga y descarga", "carga_descarga"),
    TRABAJO_EN_COMERCIO("Trabajo en comercio", "trabajo_comercio"),
    CAMPO("Campo", "campo"),
    CONSTRUCCION("Construcción", "construccion"),
    TRABAJO_DOMESTICO("Trabajo doméstico", "trabajo_domestico"),
    RECOLECCION_DE_RESIDUOS("Recolección de residuos", "recoleccion_residuos"),
    OTRA_ACTIVIDAD("Otra actividad", "otra_actividad"),
    NO_SE("No se", "no_se")
}

/**
 * Opciones para el nivel de riesgo observado en la situación.
 */
enum class Riesgo(val etiqueta: String, val valorApi: String) {
    SI("Si", "si"),
    NO("No", "no"),
    NO_SE("No se", "no_se")
}

/**
 * Modelo DTO para enviar la información geográfica asociada a un reporte.
 *
 * @property latitud Coordenada de latitud en grados decimales.
 * @property longitud Coordenada de longitud en grados decimales.
 * @property direccion Dirección descriptiva opcional del lugar.
 */
data class UbicacionCreateRequest(
    @SerializedName("latitud") val latitud: Double?,
    @SerializedName("longitud") val longitud: Double?,
    @SerializedName("direccion") val direccion: String? = null
)

/**
 * Modelo de petición DTO para crear y registrar un nuevo reporte en la plataforma.
 *
 * @property ubicacion Datos geográficos del reporte.
 * @property cantidadNna Código de [CantidadNna].
 * @property edadAproximada Código de [RangoEdad].
 * @property tipoTrabajo Código de [Actividad].
 * @property riesgo Código de [Riesgo].
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
    @SerializedName("riesgo") val riesgo: String,
    @SerializedName("descripcion") val descripcion: String? = null,
    @SerializedName("anonimo") val anonimo: Boolean,
    @SerializedName("nombre") val nombre: String? = null,
    @SerializedName("apellidos") val apellidos: String? = null,
    @SerializedName("telefono") val telefono: String? = null,
    @SerializedName("imagen") val imagen: String? = null
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
    @SerializedName("id_usuario") val idUsuario: Int? = null,
    @SerializedName("id_caso") val idCaso: Int? = null,
    @SerializedName("folio") val folio: String? = null
)
