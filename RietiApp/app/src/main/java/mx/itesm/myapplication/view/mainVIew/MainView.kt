package mx.itesm.myapplication.view.mainVIew

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import mx.itesm.myapplication.viewModel.ReportesViewModel

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
    val vm: ReportesViewModel = viewModel()
    val estado by vm.uiState.collectAsState()

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {vm.cargar()}
    Scaffold(
        modifier = modifier.padding(16.dp, 8.dp),
        topBar = { TopMainView(navController) },
        content = { innerPadding ->
            ContentMainView(estado, vm::cargar, modifier.padding(innerPadding))
        },
        bottomBar = { GenerateReportMainView(navController) }
    )
}
