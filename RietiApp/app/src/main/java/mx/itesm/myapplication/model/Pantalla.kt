package mx.itesm.myapplication.model

sealed class Pantalla(
    val ruta: String,
    val etiqueta: String
) {
    companion object {
        var listaPantallas = listOf(Login, Register)
        const val RUTA_LOGIN = "login"
        const val RUTA_REGISTER = "register"
    }

    data object Login : Pantalla(RUTA_LOGIN, "Iniciar sesión")
    data object Register : Pantalla(RUTA_REGISTER, "Crear cuenta")
}