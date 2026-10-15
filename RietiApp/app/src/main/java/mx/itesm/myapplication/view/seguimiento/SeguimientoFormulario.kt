package mx.itesm.myapplication.view.seguimiento

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.view.general.BotonContinuar
import mx.itesm.myapplication.view.general.Formulario
import mx.itesm.myapplication.view.general.PasoReporte
import mx.itesm.myapplication.viewModel.ReporteViewModel

/**
 * Pantalla del paso del formulario dentro del flujo de reporte con seguimiento.
 *
 * Muestra una fila superior con un botón para regresar, el título "Reporte con Seguimiento",
 * un texto que indica que el folio se recibirá por correo o WhatsApp, el formulario de
 * preguntas [Formulario] y, al final, un botón "Continuar" que avanza al siguiente paso.
 *
 * @param navController Controlador de navegación usado para regresar a la pantalla anterior
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
        BotonContinuar(enabled = state.formularioValido) {
            navController.navigate(Pantalla.RUTA_SEGUBICACION)
        }
    }
}