package mx.itesm.myapplication.view.general

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
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import mx.itesm.myapplication.view.general.MapaInteractivo


/**
 * Paso de selección de ubicación de un reporte.
 *
 * Ofrece dos formas de indicar dónde se observó la situación:
 * 1. Un [MapaInteractivo] en la parte superior.
 * 2. Tres campos de texto para escribir la ubicación manualmente: municipio, colonia y calle.
 *
 *  @param modifier [Modifier] aplicado al contenedor raíz ([Column]) de la pantalla.
 */
@Composable
fun Ubicacion(
    municipio: String,
    colonia: String,
    calle: String,
    longitud: Double?,
    latitud: Double?,
    onMunicipioSeleccionado: (String) -> Unit,
    onColoniaSeleccionada: (String) -> Unit,
    onCalleSeleccionada: (String) -> Unit,
    onUbicacionSeleccionada: (Double, Double) -> Unit,
    modifier: Modifier = Modifier
){
    val opciones = KeyboardOptions(capitalization = KeyboardCapitalization.Words)

    Column(
        modifier = modifier.verticalScroll(rememberScrollState())
    ) {
        Text(text = "¿Dónde viste la situación?")
        Spacer(modifier = Modifier.height(10.dp))

        MapaInteractivo(onUbicacionSeleccionada = onUbicacionSeleccionada)
        Spacer(modifier = Modifier.height(5.dp))
        Text(
            text = if (longitud != null && latitud != null)
            "Ubicación seleccionada: %.5f, %.5f".format(longitud, latitud)
                    else
                        "Toca el mapa para marcar el lugar",
            style = MaterialTheme.typography.bodySmall,
            )
        Spacer(modifier = Modifier.height(15.dp))
        Text("Completa la dirección", Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(15.dp))

        OutlinedTextField(
            value = municipio,
            onValueChange = onMunicipioSeleccionado,
            label = {Text("Municipio")},
            keyboardOptions = opciones,
            modifier = Modifier.fillMaxWidth()
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