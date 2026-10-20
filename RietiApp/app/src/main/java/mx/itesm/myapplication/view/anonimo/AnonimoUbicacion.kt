package mx.itesm.myapplication.view.anonimo

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.view.general.BotonPrincipal
import mx.itesm.myapplication.view.general.PasoReporte
import mx.itesm.myapplication.view.general.Ubicacion
import mx.itesm.myapplication.viewModel.ReporteViewModel

/**
 * Paso de ubicación dentro del flujo de reporte anónimo, el primero del flujo
 *
 * Marca el reporte como anónimo, muestra el componente [Ubicacion] y un botón "Continuar" que se habilita
 * cuando la ubicación está completa
 *
 * @param navController Controlador de navegación usado para regresar o avanzar al formulario
 * @param vm ViewModel del flujo de reporte, compartido por todos los pasos
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
            onDireccionSugerida = vm::aplicarDireccionSugerida,
            modifier = Modifier.weight(1f)
        )
        BotonPrincipal(
            texto = "Continuar",
            enabled = state.ubicacionValida,
            onClick = { navController.navigate(Pantalla.RUTA_ANONIMOFORM) }
        )
    }
}