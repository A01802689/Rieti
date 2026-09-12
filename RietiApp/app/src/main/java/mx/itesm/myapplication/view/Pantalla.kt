package mx.itesm.myapplication.view

sealed class Pantalla(
    val ruta: String,
    val etiqueta: String
) {
    companion object {
        var listaPantallas = listOf(Login, Register, MainView, ReporteSeguimiento,
            SeguimientoUbicacion, SeguimientoEnviar)
        const val RUTA_LOGIN = "login"
        const val RUTA_REGISTER = "register"
        const val RUTA_MAIN = "main-view"
        const val RUTA_SEGUIMIENTO = "Seguimiento"
        const val RUTA_SEGUBICACION = "SegUbicacion"
        const val RUTA_SEGENVIAR = "SegEnviar"
        const val RUTA_REPORT2 = "report-route-2"
        const val RUTA_REPORT3 = "report-route-3"
    }

    data object Login : Pantalla(RUTA_LOGIN, "Iniciar sesión")
    data object Register : Pantalla(RUTA_REGISTER, "Crear cuenta")
    data object MainView: Pantalla(RUTA_MAIN,"Menú Principal" )
    data object ReporteSeguimiento : Pantalla(RUTA_SEGUIMIENTO,"Reporte de Seguimiento")
    data object SeguimientoUbicacion : Pantalla(RUTA_SEGUBICACION, "Ubicacion para el reporte de Seguimiento")
    data object SeguimientoEnviar : Pantalla(RUTA_SEGENVIAR, "Enviar el reporte")
    data object ReportView2: Pantalla(RUTA_REPORT2, "Continuar Reporte")
    data object ReportView3: Pantalla(RUTA_REPORT3, "Continuar Reporte")
}