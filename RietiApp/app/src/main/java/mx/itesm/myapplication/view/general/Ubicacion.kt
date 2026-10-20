package mx.itesm.myapplication.view.general

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import mx.itesm.myapplication.data.network.DireccionSugerida
import mx.itesm.myapplication.data.network.direccionDesdeCoordenadas
import mx.itesm.myapplication.viewModel.MunicipiosUiState


/**
 * Paso de selección de ubicación de un reporte
 *
 * Ofrece dos formas de indicar dónde se observó la situación:
 * 1. Un [MapaInteractivo] en la parte superior
 * 2. Tres campos de texto para escribir la ubicación manualmente: municipio, colonia y calle
 *
 * Al elegir un punto, ya sea en el mapa o con el GPS, guarda las coordenadas y pide una dirección
 * sugerida para rellenar los campos
 *
 * @param municipio Nombre del municipio elegido; vacío si no hay selección
 * @param municipios Estado de la carga de municipios
 * @param onReintentarMunicipios Vuelve a pedir la lista de municipios al backend
 * @param colonia Colonia escrita
 * @param calle Calle escrita
 * @param longitud Longitud del punto elegido, o `null` si no hay
 * @param latitud Latitud del punto elegido, o `null` si no hay
 * @param onMunicipioSeleccionado Se llama con el nombre del municipio elegido
 * @param onColoniaSeleccionada Se llama al editar la colonia
 * @param onCalleSeleccionada Se llama al editar la calle
 * @param onUbicacionSeleccionada Se llama con latitud y longitud del punto elegido
 * @param onDireccionSugerida Se llama con la dirección obtenida del punto, o `null` si no se pudo obtener
 * @param modifier [Modifier] aplicado al contenedor raíz ([Column]) de la pantalla
 */
@Composable
fun Ubicacion(
    municipio: String,
    municipios: MunicipiosUiState,
    onReintentarMunicipios: () -> Unit,
    colonia: String,
    calle: String,
    longitud: Double?,
    latitud: Double?,
    onMunicipioSeleccionado: (String) -> Unit,
    onColoniaSeleccionada: (String) -> Unit,
    onCalleSeleccionada: (String) -> Unit,
    onUbicacionSeleccionada: (Double, Double) -> Unit,
    onDireccionSugerida: (DireccionSugerida?) -> Unit,
    modifier: Modifier = Modifier
){
    val opciones = KeyboardOptions(capitalization = KeyboardCapitalization.Words)
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var busqueda by remember { mutableStateOf<Job?>(null) }
    var buscando by remember { mutableStateOf(false) }

    // Se usa tanto al tocar el mapa como con el botón de GPS
    val alElegirPunto: (Double, Double) -> Unit = { lat, lng ->
        onUbicacionSeleccionada(lat, lng)          // guarda las coordenadas de inmediato
        busqueda?.cancel()                         // si el usuario toca otra vez, descarta la búsqueda anterior
        busqueda = scope.launch {
            buscando = true
            onDireccionSugerida(direccionDesdeCoordenadas(context, lat, lng))
            buscando = false
        }
    }

    Column(
        modifier = modifier
    ) {
        Text(text = "¿Dónde viste la situación?")
        Spacer(modifier = Modifier.height(10.dp))

        BotonUbicacionActual(onUbicacion = alElegirPunto)
        Spacer(Modifier.height(10.dp))
        MapaInteractivo(latitud = latitud, longitud = longitud, onUbicacionSeleccionada = alElegirPunto)
        if (buscando) Text("Buscando dirección…", style = MaterialTheme.typography.bodySmall)
        Spacer(modifier = Modifier.height(5.dp))
        Text(
            text = if (latitud != null && longitud != null)
            "Ubicación seleccionada: %.5f, %.5f".format(latitud, longitud)
                    else
                        "Toca el mapa para marcar el lugar",
            style = MaterialTheme.typography.bodySmall,
            )
        Spacer(modifier = Modifier.height(15.dp))
        Column(
            modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text("Completa la dirección", Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
            Spacer(modifier = Modifier.height(5.dp))

            SelectorMunicipio(
                seleccionado = municipio,
                estado = municipios,
                onSeleccion = onMunicipioSeleccionado,
                onReintentar = onReintentarMunicipios,
            )
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedTextField(
                value = colonia,
                onValueChange = onColoniaSeleccionada,
                label = {Text("Colonia")},
                keyboardOptions = opciones,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedTextField(
                value = calle,
                onValueChange = onCalleSeleccionada,
                label = {Text("Calle")},
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}