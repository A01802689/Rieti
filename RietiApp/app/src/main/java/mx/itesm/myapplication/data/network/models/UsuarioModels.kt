package mx.itesm.myapplication.data.network.models

import com.google.gson.annotations.SerializedName

/**
 * Modelo de petición DTO para iniciar sesión de usuario.
 *
 * @property correo Correo electrónico registrado del usuario.
 * @property contrasena Contraseña asociada a la cuenta del usuario.
 */
data class UsuarioLoginRequest(
    @SerializedName("correo") val correo: String,
    @SerializedName("contrasena") val contrasena: String
)

/**
 * Modelo de petición DTO para la creación y registro de un nuevo usuario.
 *
 * @property nombre Nombre del usuario.
 * @property apellido Apellido del usuario.
 * @property correo Correo electrónico para la nueva cuenta.
 * @property contrasena Contraseña asignada por el usuario.
 */
data class UsuarioCreateRequest(
    @SerializedName("nombre") val nombre: String,
    @SerializedName("apellido") val apellido: String,
    @SerializedName("correo") val correo: String,
    @SerializedName("contrasena") val contrasena: String
)

/**
 * Modelo de respuesta DTO que contiene la información de un usuario autenticado o recién creado.
 *
 * @property idUsuario Identificador único del usuario en el sistema.
 * @property nombre Nombre registrado del usuario.
 * @property apellido Apellido registrado del usuario.
 * @property correo Correo electrónico del usuario.
 * @property rol Rol asignado al usuario (e.g. "admin", "usuario", etc.), opcional.
 * @property idMunicipio Identificador del municipio asociado al usuario, opcional.
 */
data class UsuarioResponse(
    @SerializedName("id_usuario") val idUsuario: Int,
    @SerializedName("nombre") val nombre: String,
    @SerializedName("apellido") val apellido: String,
    @SerializedName("correo") val correo: String,
    @SerializedName("rol") val rol: String? = null,
    @SerializedName("id_municipio") val idMunicipio: Int? = null
)
