package mx.itesm.myapplication.data.network.models

import com.google.gson.annotations.SerializedName

/**
 * Modelo DTO para enviar la información geográfica asociada a un reporte.
 *
 * @property latitud Coordenada de latitud en grados decimales.
 * @property longitud Coordenada de longitud en grados decimales.
 * @property direccion Dirección descriptiva opcional del lugar.
 */
data class UbicacionCreateRequest(
    @SerializedName("latitud") val latitud: Double,
    @SerializedName("longitud") val longitud: Double,
    @SerializedName("direccion") val direccion: String? = null
)

/**
 * Modelo de petición DTO para crear y registrar un nuevo reporte en la plataforma.
 *
 * @property idUsuario Identificador del usuario creador (opcional para reportes anónimos).
 * @property ubicacion Datos geográficos del reporte [UbicacionCreateRequest].
 * @property cantidadNna Cantidad estimada de niñas, niños o adolescentes observados.
 * @property edadAproximada Rango o estimación de edad observada.
 * @property tipoTrabajo Tipo de actividad o trabajo observado.
 * @property descripcion Detalles adicionales descriptivos del caso, opcional.
 * @property imagen Cadena o URL codificada de la imagen adjunta, opcional.
 */
data class ReporteCreateRequest(
    @SerializedName("id_usuario") val idUsuario: String? = null,
    @SerializedName("ubicacion") val ubicacion: UbicacionCreateRequest,
    @SerializedName("cantidad_nna") val cantidadNna: String,
    @SerializedName("edad_aproximada") val edadAproximada: String,
    @SerializedName("tipo_trabajo") val tipoTrabajo: String,
    @SerializedName("descripcion") val descripcion: String? = null,
    @SerializedName("imagen") val imagen: String? = null
)

/**
 * Modelo de respuesta DTO devuelto al registrar exitosamente un nuevo reporte.
 *
 * @property idReporte Identificador único del reporte generado.
 * @property idUsuario Identificador del usuario asociado al reporte.
 * @property idCaso Identificador único del caso abierto en el sistema.
 */
data class ReporteResponse(
    @SerializedName("id_reporte") val idReporte: Int,
    @SerializedName("id_usuario") val idUsuario: Int,
    @SerializedName("id_caso") val idCaso: Int
)
