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
 * Último paso del flujo de reporte con seguimiento: descripción, fotografía opcional y envío
 *
 * Al enviarse el reporte muestra un diálogo con el folio y, al aceptarlo, vuelve a la pantalla principal
 *
 * @param navController Controlador de navegación usado para regresar a la pantalla anterior o a la principal
 * @param vm ViewModel del flujo de reporte, compartido por todos los pasos
 */
@Composable
fun SeguimientoEnviar(navController: NavController, vm: ReporteViewModel){
    val state by vm.uiState.collectAsState()
    (state.envio as? EnvioUiState.Success)?.let { exito ->
        DialogoReporteEnviado(
            folio = exito.folio,
            mensaje = if (exito.folio != null) "¡Gracias por ayudar a proteger los derechos de niñas, niños y adolescentes!\nTu reporte de seguimiento:\n${exito.folio}" else "¡Gracias por ayudar a proteger los derechos de niñas, niños y adolescentes!\n"
        ) {
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