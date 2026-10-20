package mx.itesm.myapplication.view.seguimiento

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.view.general.BotonPrincipal
import mx.itesm.myapplication.view.general.Formulario
import mx.itesm.myapplication.view.general.PasoReporte
import mx.itesm.myapplication.viewModel.ReporteViewModel

/**
 * Paso del formulario dentro del flujo de reporte con seguimiento
 *
 * Muestra el título "Reporte con Seguimiento", el formulario de preguntas [Formulario] y un botón "Continuar"
 * que se habilita cuando las cuatro preguntas están respondidas
 *
 * @param navController Controlador de navegación usado para regresar o avanzar a la ubicación
 * @param vm ViewModel del flujo de reporte, compartido por todos los pasos
 */
@Composable
fun SeguimientoFormulario(navController: NavController, vm: ReporteViewModel) {
    val state by vm.uiState.collectAsState()
    PasoReporte(
        "Reporte con Seguimiento",
        { navController.popBackStack() }
    ) {
        Formulario(
            cantidad = state.cantidad,
            edad = state.edad,
            actividad = state.actividad,
            riesgo = state.riesgo,
            onCantidadSeleccionada = vm::setCantidad,
            onEdadSeleccionada = vm::setEdad,
            onActividadSeleccionada = vm::setActividad,
            onRiesgoSeleccionado = vm::setRiesgo,
            modifier = Modifier.weight(1f)
        )
        BotonPrincipal(
            texto = "Continuar",
            enabled = state.formularioValido,
            onClick = { navController.navigate(Pantalla.RUTA_SEGUBICACION) }
        )
    }
}