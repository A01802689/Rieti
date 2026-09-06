package mx.itesm.myapplication.view

sealed class Pantalla(
    val ruta: String,
    val etiqueta: String
) {
    companion object {
        var listaPantallas = listOf(Login, Register, MainView)
        const val RUTA_LOGIN = "login"
        const val RUTA_REGISTER = "register"
        const val RUTA_MAIN = "main-view"
    }

    data object Login : Pantalla(RUTA_LOGIN, "Iniciar sesión")
    data object Register : Pantalla(RUTA_REGISTER, "Crear cuenta")
    data object MainView: Pantalla(RUTA_MAIN,"Menú Principal" )
}