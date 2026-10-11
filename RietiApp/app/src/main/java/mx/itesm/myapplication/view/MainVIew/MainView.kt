package mx.itesm.myapplication.view.MainVIew

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

/**
 * Pantalla principal de la aplicación.
 *
 * Organiza la interfaz con un [Scaffold] de tres zonas:
 * - **Barra superior:** [TopMainView], que recibe el [navController].
 * - **Contenido:** [ContentMainView], la lista de reportes en tarjetas de resumen. Se le aplica
 *   el `innerPadding` del [Scaffold] para que no quede tapado por la barra superior ni por la
 *   inferior.
 * - **Barra inferior:** [GenerateReportMainView], donde el usuario elige el tipo de reporte
 *   que quiere enviar (anónimo o con seguimiento).
 *
 * @param navController Controlador de navegación que se pasa a [TopMainView] y a
 * [GenerateReportMainView] para que puedan navegar a otras pantallas.
 * @param modifier [Modifier] opcional para personalizar el diseño.
 */

@Composable
fun MainView(navController: NavController, modifier: Modifier = Modifier){
    Scaffold(
        modifier.padding(16.dp, 8.dp),
        topBar = { TopMainView(navController) },
        content = { innerPadding ->
            ContentMainView(modifier.padding(innerPadding)) },
        bottomBar = { GenerateReportMainView(navController) }
    )
}