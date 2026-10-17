package mx.itesm.myapplication.view.seguimiento

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.view.general.DialogoReporteEnviado
import mx.itesm.myapplication.view.general.Enviar
import mx.itesm.myapplication.view.general.PasoReporte
import mx.itesm.myapplication.viewModel.EnvioUiState
import mx.itesm.myapplication.viewModel.ReporteViewModel

/**
 * Pantalla final del flujo de reporte con seguimiento, donde se redacta y se envía el reporte.
 *
 * @param navController Controlador de navegación para manejar la navegación entre pantallas.
 */

@Composable
fun SeguimientoEnviar(navController: NavController, vm: ReporteViewModel){
    val state by vm.uiState.collectAsState()
    (state.envio as? EnvioUiState.Success)?.let { exito ->
        DialogoReporteEnviado(exito.folio) {
            navController.popBackStack(Pantalla.RUTA_MAIN, inclusive = false)
        }
    }
    PasoReporte(
        "Reporte con Seguimiento",
        onVolver = { navController.popBackStack() }
    ) {
        Enviar(
            descripcion = state.descripcion,
            onDescripcionChange = vm::setDescripcion,
            envio = state.envio,
            puedeEnviar = state.puedeEnviar,
            onEnviar = vm::enviarReporte,
            foto = state.foto,
            onFotoSeleccionada = vm::setFoto,
            modifier = Modifier.weight(1f)
        )
    }
}