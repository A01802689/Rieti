package mx.itesm.myapplication.view

/**
 * Clase sellada que define la jerarquía y constantes de las rutas de navegación de la aplicación
 *
 * @property ruta Cadena identificadora de la ruta dentro del grafo de navegación de Jetpack Compose
 * @property etiqueta Etiqueta legible descriptiva de la pantalla
 */
sealed class Pantalla(
    val ruta: String,
    val etiqueta: String
) {
    /** Rutas de la aplicación y la lista de sus pantallas */
    companion object {
        /** Lista completa de todas las pantallas registradas en la aplicación */
        var listaPantallas = listOf(
            Login, Register, MainView, ReporteSeguimiento,
            SeguimientoUbicacion, SeguimientoEnviar, SeguimientoFormulario,
            AnonimoUbicacion, AnonimoEnviar, AnonimoFormulario, ReportView2, ReportView3
        )

        /** Ruta de inicio de sesión */
        const val RUTA_LOGIN = "login"

        /** Ruta de registro de usuarios */
        const val RUTA_REGISTER = "register"

        /** Ruta de la pantalla principal / dashboard */
        const val RUTA_MAIN = "main-view"

        /** Ruta de la pantalla de tipo de reporte de seguimiento */
        const val RUTA_SEGUIMIENTO = "Seguimiento"

        /** Ruta de ubicación del reporte de seguimiento */
        const val RUTA_SEGUBICACION = "SegUbicacion"

        /** Ruta de envío del reporte de seguimiento */
        const val RUTA_SEGENVIAR = "SegEnviar"

        /** Ruta de formulario del reporte de seguimiento */
        const val RUTA_SEGFORM = "SegFormulario"

        /** Ruta de ubicación del reporte anónimo */
        const val RUTA_ANONIMOUBICACION = "AnUbicacion"

        /** Ruta de envío del reporte anónimo */
        const val RUTA_ANONIMOENVIAR = "AnEnviar"

        /** Ruta de formulario del reporte anónimo */
        const val RUTA_ANONIMOFORM = "AnFormulario"

        /** Ruta del paso 2 del reporte general */
        const val RUTA_REPORT2 = "report-route-2"

        /** Ruta del paso 3 del reporte general */
        const val RUTA_REPORT3 = "report-route-3"
    }

    /** Pantalla de inicio de sesión */
    data object Login : Pantalla(RUTA_LOGIN, "Iniciar sesión")

    /** Pantalla de registro de cuentas */
    data object Register : Pantalla(RUTA_REGISTER, "Crear cuenta")

    /** Pantalla menú principal */
    data object MainView: Pantalla(RUTA_MAIN, "Menú Principal")

    /** Pantalla inicial de reporte de seguimiento */
    data object ReporteSeguimiento : Pantalla(RUTA_SEGUIMIENTO, "Reporte de Seguimiento")

    /** Pantalla de captura de ubicación para el reporte de seguimiento */
    data object SeguimientoUbicacion : Pantalla(RUTA_SEGUBICACION, "Ubicacion para el reporte de Seguimiento")

    /** Pantalla de confirmación y envío de reporte de seguimiento */
    data object SeguimientoEnviar : Pantalla(RUTA_SEGENVIAR, "Enviar el reporte")

    /** Pantalla de datos del formulario de seguimiento */
    data object SeguimientoFormulario : Pantalla(RUTA_SEGFORM, "Formulario de Seguimiento")

    /** Pantalla de captura de ubicación para el reporte anónimo */
    data object AnonimoUbicacion : Pantalla(RUTA_ANONIMOUBICACION, "Ubicacion para el reporte anonimo")

    /** Pantalla de confirmación y envío de reporte anónimo */
    data object AnonimoEnviar : Pantalla(RUTA_ANONIMOENVIAR, "Enviar el reporte de forma anonima")

    /** Pantalla de datos del formulario anónimo */
    data object AnonimoFormulario : Pantalla(RUTA_ANONIMOFORM, "Formulario de reporte anonimo")

    /** Pantalla de continuación del reporte general paso 2 */
    data object ReportView2: Pantalla(RUTA_REPORT2, "Continuar Reporte")

    /** Pantalla de continuación del reporte general paso 3 */
    data object ReportView3: Pantalla(RUTA_REPORT3, "Continuar Reporte")
}
