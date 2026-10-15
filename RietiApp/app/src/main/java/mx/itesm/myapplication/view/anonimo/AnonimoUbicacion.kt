package mx.itesm.myapplication.view.anonimo

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.view.general.BotonContinuar
import mx.itesm.myapplication.view.general.PasoReporte
import mx.itesm.myapplication.view.general.Ubicacion
import mx.itesm.myapplication.viewModel.ReporteViewModel

/**
 * Pantalla del paso de ubicación dentro del flujo de reporte anónimo.
 *
 * Muestra una fila superior con un botón para regresar, el título "Reporte Anónimo", el
 * componente [Ubicacion] (mapa y campos de texto para indicar dónde se observó la situación)
 * y, al final, un botón "Continuar" que avanza al siguiente paso del flujo.
 *
 * @param navController Controlador de navegación usado para regresar a la pantalla anterior
 */
@Composable
fun AnonimoUbicacion(navController: NavController, vm: ReporteViewModel) {
    val state by vm.uiState.collectAsState()
    val municipios by vm.municipios.collectAsState()
    LaunchedEffect(Unit) { vm.setEsAnonimo(true) }

    PasoReporte("Reporte Anónimo", onVolver = { navController.popBackStack() }) {
        Ubicacion(
            municipio = state.municipio,
            colonia = state.colonia,
            calle = state.calle,
            longitud = state.longitud,
            latitud = state.latitud,
            municipios = municipios,
            onReintentarMunicipios = vm::cargarMunicipios,
            onMunicipioSeleccionado = vm::setMunicipio,
            onColoniaSeleccionada = vm::setColonia,
            onCalleSeleccionada = vm::setCalle,
            onUbicacionSeleccionada = vm::setCoordenadas,
            modifier = Modifier.weight(1f)
        )
        BotonContinuar( enabled = state.ubicacionValida) {
            navController.navigate(Pantalla.RUTA_ANONIMOFORM)
        }
    }
}