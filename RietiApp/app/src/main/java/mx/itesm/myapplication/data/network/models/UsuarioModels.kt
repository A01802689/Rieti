package mx.itesm.myapplication.data.network.models

import com.google.gson.annotations.SerializedName

/**
 * Petición para iniciar sesión con `POST /usuarios/login`
 *
 * @property correo Correo electrónico registrado del usuario
 * @property contrasena Contraseña asociada a la cuenta del usuario
 */
data class UsuarioLoginRequest(
    @SerializedName("correo") val correo: String,
    @SerializedName("contrasena") val contrasena: String
)

/**
 * Petición para registrar un usuario con `POST /usuarios`
 *
 * @property nombre Nombre del usuario
 * @property apellido Apellido del usuario
 * @property correo Correo electrónico para la nueva cuenta
 * @property contrasena Contraseña asignada por el usuario
 */
data class UsuarioCreateRequest(
    @SerializedName("nombre") val nombre: String,
    @SerializedName("apellido") val apellido: String,
    @SerializedName("correo") val correo: String,
    @SerializedName("contrasena") val contrasena: String
)

/**
 * Usuario autenticado o recién creado, tal como lo devuelve el API
 *
 * @property idUsuario Identificador único del usuario en el sistema
 * @property nombre Nombre registrado del usuario
 * @property apellido Apellido registrado del usuario
 * @property correo Correo electrónico del usuario
 * @property rol Rol asignado al usuario, por ejemplo "Administrador" o "Alimentador"; `null` si no tiene
 * @property idMunicipio Identificador del municipio asociado al usuario; `null` si no tiene
 */
data class UsuarioResponse(
    @SerializedName("id_usuario") val idUsuario: Int,
    @SerializedName("nombre") val nombre: String,
    @SerializedName("apellido") val apellido: String,
    @SerializedName("correo") val correo: String,
    @SerializedName("rol") val rol: String? = null,
    @SerializedName("id_municipio") val idMunicipio: Int? = null
)
