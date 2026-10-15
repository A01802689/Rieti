package mx.itesm.myapplication.view.general

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import mx.itesm.myapplication.data.network.models.Actividad
import mx.itesm.myapplication.data.network.models.CantidadNna
import mx.itesm.myapplication.data.network.models.RangoEdad
import mx.itesm.myapplication.data.network.models.Riesgo

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
private fun <T> PreguntaOpcionUnica(
    titulo: String,
    opciones: List<T>,
    seleccionada: T?,
    etiqueta: (T) -> String,
    onSeleccionar: (T) -> Unit
) {
    Text(titulo)
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(5.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        opciones.forEach { opcion ->
            FilterChip(
                selected = seleccionada == opcion,
                onClick = { onSeleccionar(opcion) },
                label = { Text(etiqueta(opcion)) }
            )
        }
    }
    Spacer(modifier = Modifier.height(15.dp))
}



/**
 * Formulario de preguntas de opción única para describir una situación observada.
 *
 * Presenta cuatro preguntas, cada una con sus opciones como [FilterChip] dentro de un
 * [FlowRow], de modo que las opciones saltan de línea cuando no caben en el ancho disponible:
 * 1. Cantidad de niñas, niños o adolescentes observados.
 * 2. Edad aproximada.
 * 3. Actividad que estaban realizando.
 * 4. Si se observó alguna situación de riesgo.
 *
 * @param modifier Modificador opcional de diseño.
 */

@Composable
fun Formulario(
    cantidad: CantidadNna?,
    edad: RangoEdad?,
    actividad: Actividad?,
    riesgo: Riesgo?,
    onCantidadSeleccionada: (CantidadNna) -> Unit,
    onEdadSeleccionada: (RangoEdad) -> Unit,
    onActividadSeleccionada: (Actividad) -> Unit,
    onRiesgoSeleccionado: (Riesgo) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.verticalScroll(rememberScrollState())
    ) {
        PreguntaOpcionUnica("¿Cuántas niñas, niños o adolescentes observados?",
        CantidadNna.entries, cantidad, { it.etiqueta }, onCantidadSeleccionada)
        PreguntaOpcionUnica("Edad aproximada",
            RangoEdad.entries, edad, { it.etiqueta }, onEdadSeleccionada)
        PreguntaOpcionUnica("¿Qué estaban realizando?",
            Actividad.entries, actividad, { it.etiqueta }, onActividadSeleccionada)
        PreguntaOpcionUnica("¿Se observó alguna situación de riesgo?",
            Riesgo.entries, riesgo, { it.etiqueta }, onRiesgoSeleccionado)
    }
}