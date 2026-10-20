package mx.itesm.myapplication.view

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavController
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import mx.itesm.myapplication.view.mainVIew.MainView
import mx.itesm.myapplication.view.anonimo.AnonimoEnviar
import mx.itesm.myapplication.view.anonimo.AnonimoFormulario
import mx.itesm.myapplication.view.anonimo.AnonimoUbicacion
import mx.itesm.myapplication.view.seguimiento.ReporteSeguimiento
import mx.itesm.myapplication.view.seguimiento.SeguimientoEnviar
import mx.itesm.myapplication.view.seguimiento.SeguimientoFormulario
import mx.itesm.myapplication.view.seguimiento.SeguimientoUbicacion
import mx.itesm.myapplication.viewModel.ReporteViewModel

/** Ruta del grafo anidado del flujo de reporte anónimo */
private const val FLUJO_ANONIMO = "flujo_anonimo"
/** Ruta del grafo anidado del flujo de reporte con seguimiento */
private const val FLUJO_SEGUIMIENTO = "flujo_seguimiento"

/**
 * Obtiene el [ReporteViewModel] de un flujo de reporte, compartido por todas sus pantallas
 *
 * @receiver Entrada de la pila de navegación de la pantalla que lo pide
 * @param navController Controlador de navegación para buscar la entrada del flujo
 * @param route Ruta del grafo del flujo (anónimo o seguimiento) al que pertenece el ViewModel
 * @return El [ReporteViewModel] ligado al ciclo de vida de la entrada del flujo
 */
@Composable
private fun NavBackStackEntry.reporteViewModel(
    navController: NavController,
    route: String
) : ReporteViewModel {
    val parentEntry = remember(this) {navController.getBackStackEntry(route)}
    return viewModel(parentEntry)
}

/**
 * Grafo de navegación principal de la aplicación
 *
 * Mapea cada constante de ruta definida en [Pantalla] con su pantalla. Los pasos de cada tipo de reporte
 * forman un grafo anidado que comparte un mismo [ReporteViewModel]
 *
 * @param navController Controlador [NavHostController] para manejar las transiciones entre pantallas
 * @param modifier Modificador opcional de diseño para ajustar el contenedor [NavHost]
 */
@Composable
fun AppNavHost(navController: NavHostController, modifier: Modifier = Modifier) {
    NavHost(
        navController = navController,
        startDestination = Pantalla.RUTA_LOGIN,
        modifier = modifier.fillMaxSize()
    ) {
        composable(Pantalla.RUTA_LOGIN) {
            LoginForm(navController)
        }
        composable(Pantalla.RUTA_REGISTER) {
            RegisterForm(navController)
        }
        composable(Pantalla.RUTA_MAIN) {
            MainView(navController, modifier)
        }
        // Flujo anónimo
        navigation(startDestination = Pantalla.RUTA_ANONIMOUBICACION, route = FLUJO_ANONIMO) {
            composable(Pantalla.RUTA_ANONIMOUBICACION) { entry ->
                AnonimoUbicacion(navController, entry.reporteViewModel(navController, FLUJO_ANONIMO))
            }
            composable(Pantalla.RUTA_ANONIMOFORM) { entry ->
                AnonimoFormulario(navController, entry.reporteViewModel(navController, FLUJO_ANONIMO))
            }
            composable(Pantalla.RUTA_ANONIMOENVIAR) { entry ->
                AnonimoEnviar(navController, entry.reporteViewModel(navController, FLUJO_ANONIMO))
            }
        }

        // Flujo de seguimiento
        navigation(startDestination = Pantalla.RUTA_SEGUIMIENTO, route = FLUJO_SEGUIMIENTO){
            composable(Pantalla.RUTA_SEGUIMIENTO) { entry ->
                ReporteSeguimiento(navController, entry.reporteViewModel(navController, FLUJO_SEGUIMIENTO))
            }
            composable(Pantalla.RUTA_SEGFORM) { entry ->
                SeguimientoFormulario(navController, entry.reporteViewModel(navController, FLUJO_SEGUIMIENTO))
            }
            composable(Pantalla.RUTA_SEGUBICACION) { entry ->
                SeguimientoUbicacion(navController, entry.reporteViewModel(navController, FLUJO_SEGUIMIENTO))
            }
            composable(Pantalla.RUTA_SEGENVIAR) { entry ->
                SeguimientoEnviar(navController, entry.reporteViewModel(navController, FLUJO_SEGUIMIENTO))
            }
        }
    }
}
