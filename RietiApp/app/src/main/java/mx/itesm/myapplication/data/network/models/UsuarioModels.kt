package mx.itesm.myapplication.data.network.models

import com.google.gson.annotations.SerializedName

data class UsuarioLoginRequest(
    @SerializedName("correo") val correo: String,
    @SerializedName("contrasena") val contrasena: String
)

data class UsuarioCreateRequest(
    @SerializedName("nombre") val nombre: String,
    @SerializedName("apellido") val apellido: String,
    @SerializedName("correo") val correo: String,
    @SerializedName("contrasena") val contrasena: String
)

data class UsuarioResponse(
    @SerializedName("id_usuario") val idUsuario: Int,
    @SerializedName("nombre") val nombre: String,
    @SerializedName("apellido") val apellido: String,
    @SerializedName("correo") val correo: String,
    @SerializedName("rol") val rol: String? = null,
    @SerializedName("id_municipio") val idMunicipio: Int? = null
)
