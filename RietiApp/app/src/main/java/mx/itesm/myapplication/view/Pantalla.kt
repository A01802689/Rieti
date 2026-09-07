package mx.itesm.myapplication.view

sealed class Pantalla(
    val ruta: String,
    val etiqueta: String
) {
    companion object {
        var listaPantallas = listOf(Login, Register, MainView, ReporteSeguimiento)
        const val RUTA_LOGIN = "login"
        const val RUTA_REGISTER = "register"
        const val RUTA_MAIN = "main-view"
        const val RUTA_SEGUIMIENTO = "Seguimiento"
    }

    data object Login : Pantalla(RUTA_LOGIN, "Iniciar sesión")
    data object Register : Pantalla(RUTA_REGISTER, "Crear cuenta")
    data object MainView: Pantalla(RUTA_MAIN,"Menú Principal" )
    data object ReporteSeguimiento : Pantalla(RUTA_SEGUIMIENTO,"Reporte de Seguimiento")
}