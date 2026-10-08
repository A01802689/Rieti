package mx.itesm.myapplication.data.network.models

import com.google.gson.annotations.SerializedName

data class UbicacionCreateRequest(
    @SerializedName("latitud") val latitud: Double,
    @SerializedName("longitud") val longitud: Double,
    @SerializedName("direccion") val direccion: String? = null
)

data class ReporteCreateRequest(
    @SerializedName("id_usuario") val idUsuario: String? = null,
    @SerializedName("ubicacion") val ubicacion: UbicacionCreateRequest,
    @SerializedName("cantidad_nna") val cantidadNna: String,
    @SerializedName("edad_aproximada") val edadAproximada: String,
    @SerializedName("tipo_trabajo") val tipoTrabajo: String,
    @SerializedName("descripcion") val descripcion: String? = null,
    @SerializedName("imagen") val imagen: String? = null
)

data class ReporteResponse(
    @SerializedName("id_reporte") val idReporte: Int,
    @SerializedName("id_usuario") val idUsuario: Int,
    @SerializedName("id_caso") val idCaso: Int
)
