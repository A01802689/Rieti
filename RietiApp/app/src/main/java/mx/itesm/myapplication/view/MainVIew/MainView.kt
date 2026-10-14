package mx.itesm.myapplication.view.MainVIew

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

/**
 * Pantalla principal de la aplicación RIETI.
 *
 * Organiza la interfaz con un [Scaffold] compuesto por tres secciones:
 * - **Barra superior:** [TopMainView], que muestra el logo y botón de navegación.
 * - **Contenido principal:** [ContentMainView], lista de tarjetas de resumen de reportes.
 * - **Barra inferior:** [GenerateReportMainView], panel para iniciar la creación de reportes.
 *
 * @param navController Controlador de navegación [NavController].
 * @param modifier Modificador opcional de diseño [Modifier].
 */
@Composable
fun MainView(navController: NavController, modifier: Modifier = Modifier) {
    Scaffold(
        modifier = modifier.padding(16.dp, 8.dp),
        topBar = { TopMainView(navController) },
        content = { innerPadding ->
            ContentMainView(Modifier.padding(innerPadding))
        },
        bottomBar = { GenerateReportMainView(navController) }
    )
}
