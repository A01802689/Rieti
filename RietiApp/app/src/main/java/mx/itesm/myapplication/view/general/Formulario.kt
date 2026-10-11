package mx.itesm.myapplication.view.general

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

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
 * @param navController Controlador de navegación para manejar la navegación entre pantallas.
 * @param modifier Modificador opcional de diseño.
 */


@Composable
fun Formulario(
    navController: NavController,
    modifier: Modifier = Modifier
) {
    /** Opción elegida para la cantidad de menores observados. Vacío si no hay selección. */
    var cantidadSeleccionada by remember { mutableStateOf("") }

    /** Rango de edad aproximada elegido. Vacío si no hay selección. */
    var edadSeleccionada by remember { mutableStateOf("") }

    /** Actividad elegida que realizaban los menores. Vacío si no hay selección. */
    var actividadSeleccionada by remember { mutableStateOf("") }

    /** Respuesta elegida sobre la observación de una situación de riesgo. Vacío si no hay selección. */
    var riesgoSeleccionado by remember { mutableStateOf("") }

    Column(
        modifier = modifier
    ) {
        Text(
            text = "¿Cuantas niñas, niños o adolescentes observaste?"
        )

        /** Opciones disponibles para la pregunta de cantidad. */
        val opcionesCantidad = listOf("1", "2", "3", "5 o más", "No sé")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            opcionesCantidad.forEach { opcion ->
                FilterChip(
                    selected = cantidadSeleccionada == opcion,
                    onClick = { cantidadSeleccionada = opcion },
                    label = { Text(opcion) }
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "Edad aproximada"
        )

        /** Rangos de edad disponibles, en años. */
        val edades = listOf("0-5", "6-11", "12-14", "15-17", "No sé")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            edades.forEach { edad ->
                FilterChip(
                    selected = edadSeleccionada == edad,
                    onClick = { edadSeleccionada = edad },
                    label = { Text(edad) }
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "¿Que estaban haciendo?"
        )

        /** Actividades disponibles para la pregunta sobre lo que estaban haciendo. */
        val actividades = listOf(
            "Venta ambulante", "Limpieza de parabrisas", "Mendicidad",
            "Carga y descarga", "Construccion", "Trabajo doméstico", "No sé"
        )
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            verticalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            actividades.forEach { actividad ->
                FilterChip(
                    selected = actividadSeleccionada == actividad,
                    onClick = { actividadSeleccionada = actividad },
                    label = { Text(actividad) }
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "¿Observaste alguna situación de riesgo?"
        )

        /** Respuestas disponibles para la pregunta de situación de riesgo. */
        val riesgos = listOf("Sí", "No", "No sé")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            verticalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            riesgos.forEach { riesgo ->
                FilterChip(
                    selected = riesgoSeleccionado == riesgo,
                    onClick = { riesgoSeleccionado = riesgo },
                    label = { Text(riesgo) }
                )
            }
        }
    }
}